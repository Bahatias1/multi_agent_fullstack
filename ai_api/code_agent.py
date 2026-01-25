# ai_api/code_agent.py
from typing import Dict, Any, Union
import json
import re

from smolagents import CodeAgent, tool

from ai_api.ollama_client import generate as ollama_generate


# =========================
# 🔹 Helpers JSON
# =========================

def _safe_str(x: Any) -> str:
    try:
        return str(x)
    except Exception:
        return ""


def extract_json_block(text: str) -> dict:
    """
    Extrait le premier objet JSON valide trouvé dans un texte.
    Supporte aussi les blocs ```json ... ```
    """
    if not text:
        raise ValueError("Réponse vide du modèle")

    # bloc ```json ... ```
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        return json.loads(m.group(1))

    # sinon premier {...}
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end + 1]
        return json.loads(candidate)

    raise ValueError("JSON non trouvé dans la réponse du modèle")


def repair_json_loose(text: str) -> str:
    """
    Répare les erreurs JSON classiques :
    - clés sans guillemets -> "key":
    - quotes simples -> quotes doubles
    """
    if not text:
        return text

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]

    # quotes simples -> doubles
    text = re.sub(r"(?<!\\)'", '"', text)

    # ajouter quotes aux clés non quotées
    text = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', text)

    return text


# =========================
# 🔹 LLM wrapper (smolagents compatible)
# =========================

class OllamaLLM:
    """
    smolagents attend un objet avec .generate(...)
    et peut envoyer:
    - prompt="..."
    - messages=[ChatMessage, ...]
    """

    def generate(self, prompt: Union[str, Any] = None, messages: Any = None, **kwargs) -> str:
        max_tokens = int(kwargs.get("max_tokens", 900))
        max_tokens = max(64, min(max_tokens, 1024))  # évite les gros timeouts

        final_prompt = ""

        # 1) prompt string direct
        if isinstance(prompt, str) and prompt.strip():
            final_prompt = prompt.strip()

        # 2) messages
        elif messages is not None:
            final_prompt = self._messages_to_text(messages)

        # 3) prompt objet (rare)
        elif prompt is not None:
            final_prompt = self._messages_to_text(prompt)

        if not final_prompt.strip():
            return ""

        return ollama_generate(prompt=final_prompt, max_tokens=max_tokens)

    def _messages_to_text(self, messages: Any) -> str:
        # déjà string
        if isinstance(messages, str):
            return messages.strip()

        # liste
        if isinstance(messages, list):
            parts = []
            for m in messages:
                if isinstance(m, str):
                    parts.append(m.strip())
                    continue

                role = getattr(m, "role", "user")
                content = getattr(m, "content", None)

                # parfois c'est déjà un dict ou un truc non standard
                if content is None:
                    if isinstance(m, dict):
                        role = m.get("role", role)
                        content = m.get("content", "")
                    else:
                        content = _safe_str(m)

                parts.append(f"{str(role).upper()}: {content}")
            return "\n".join([p for p in parts if p]).strip()

        # objet unique
        role = getattr(messages, "role", "user")
        content = getattr(messages, "content", None)

        if content is None:
            if isinstance(messages, dict):
                role = messages.get("role", role)
                content = messages.get("content", "")
            else:
                content = _safe_str(messages)

        return f"{str(role).upper()}: {content}".strip()


# =========================
# 🔹 Tool smolagents
# =========================

@tool
def create_file_tool(path: str, content: str) -> Dict[str, Any]:
    """
    Crée une instruction de fichier.

    Args:
        path: Chemin relatif du fichier (ex: "src/main.py")
        content: Contenu complet du fichier
    """
    return {"path": path, "content": content}


# =========================
# 🔹 Runner
# =========================

def run_code_agent(prompt: str, agent_name: str = "auto", language: str = "français") -> Dict[str, Any]:
    """
    Retour attendu:
    {
      "summary": "...",
      "files": [{"path": "...", "content": "..."}]
    }
    """
    llm = OllamaLLM()

    agent = CodeAgent(
        tools=[create_file_tool],
        model=llm,
        max_steps=3,
    )

    instruction = f"""
Tu es un assistant développeur type Cursor/Bolt.

OBJECTIF:
Générer un projet sous forme de fichiers.

RÈGLES STRICTES:
- Réponds UNIQUEMENT en JSON valide (double quotes obligatoires)
- Aucun texte hors JSON
- Format EXACT:
{{
  "summary": "Résumé court en {language}",
  "files": [
    {{
      "path": "main.py",
      "content": "print(\\"Bonjour\\")"
    }}
  ]
}}

Agent sélectionné: {agent_name}

Demande utilisateur:
{prompt}
""".strip()

    raw = agent.run(instruction)

    # si dict direct
    if isinstance(raw, dict):
        return raw

    # si string
    raw_text = raw if isinstance(raw, str) else _safe_str(raw)
    raw_text = (raw_text or "").strip()

    # 1) extraction JSON direct
    try:
        return extract_json_block(raw_text)
    except Exception:
        pass

    # 2) réparation JSON
    fixed = repair_json_loose(raw_text)
    try:
        return json.loads(fixed)
    except Exception as e:
        raise ValueError(f"CodeAgent JSON invalide après réparation: {str(e)}")
