# ai_api/code_agent.py
from typing import Dict, Any, Union
import json
import re

from smolagents import CodeAgent, tool

from ai_api.ollama_client import generate


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

    # 1) bloc ```json ... ```
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        return json.loads(m.group(1))

    # 2) sinon premier {...}
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start : end + 1]
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

    # garder seulement la zone JSON
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    # remplacer quotes simples par doubles (cas fréquent)
    text = re.sub(r"(?<!\\)'", '"', text)

    # ajouter quotes aux clés non-quotées: summary: -> "summary":
    # marche pour des clés simples (letters, numbers, underscore)
    text = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', text)

    return text


class OllamaLLM:
    """
    Wrapper compatible smolagents.

    smolagents peut appeler:
    - model.generate(prompt="...")
    - model.generate(messages=[...])
    """

    def generate(self, prompt: Union[str, Any] = None, messages: Any = None, **kwargs) -> str:
        max_tokens = min(int(kwargs.get("max_tokens", 512)), 1024)

        # 1) prompt string direct
        if isinstance(prompt, str) and prompt.strip():
            final_prompt = prompt.strip()

        # 2) messages
        elif messages is not None:
            final_prompt = self._messages_to_text(messages)

        # 3) prompt objet (rare)
        elif prompt is not None:
            final_prompt = self._messages_to_text(prompt)

        else:
            final_prompt = ""

        if not final_prompt.strip():
            return ""

        return generate(prompt=final_prompt, max_tokens=max_tokens)

    def _messages_to_text(self, messages: Any) -> str:
        """
        Convertit tout type de messages en texte:
        - list[ChatMessage]
        - list[str]
        - ChatMessage
        - str
        """
        # si c'est déjà une string
        if isinstance(messages, str):
            return messages.strip()

        # si c'est une liste
        if isinstance(messages, list):
            parts = []
            for m in messages:
                # si l'élément est une string
                if isinstance(m, str):
                    parts.append(m.strip())
                    continue

                # sinon objet style ChatMessage
                role = getattr(m, "role", "user")
                content = getattr(m, "content", None)

                if content is None:
                    content = _safe_str(m)

                parts.append(f"{str(role).upper()}: {content}")
            return "\n".join([p for p in parts if p]).strip()

        # si c'est un objet ChatMessage seul
        role = getattr(messages, "role", "user")
        content = getattr(messages, "content", None)
        if content is None:
            content = _safe_str(messages)

        return f"{str(role).upper()}: {content}".strip()


@tool
def create_file_tool(path: str, content: str) -> Dict[str, Any]:
    """
    Crée un fichier.

    Args:
        path: Chemin relatif du fichier (ex: "src/main.py").
        content: Contenu complet du fichier.
    """
    return {"path": path, "content": content}


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

    raw = str(raw) if not isinstance(raw, (dict, str)) else raw

    # si smolagents renvoie déjà un dict
    if isinstance(raw, dict):
        return raw

    # si smolagents renvoie une string
    if isinstance(raw, str):
        raw = raw.strip()

        # 1) essayer extraction JSON direct
        try:
            return extract_json_block(raw)
        except Exception:
            pass

        # 2) tenter réparation JSON puis parse
        fixed = repair_json_loose(raw)
        try:
            return json.loads(fixed)
        except Exception as e:
            raise ValueError(f"CodeAgent JSON invalide après réparation: {str(e)}")

    raise ValueError("Réponse CodeAgent invalide (ni dict ni str)")
