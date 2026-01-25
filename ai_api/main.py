# ai_api/main.py
from ai_api.tools import TOOLS
import json
import re
import uuid

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from ai_api.schemas import BuildRequest, BuildResponse
from ai_api.auth.routes import router as auth_router
from ai_api.auth.routes import get_current_user_email

from ai_api.schemas import (
    GenerateRequest,
    GenerateResponse,
    ContinueRequest,
    OrchestrateRequest,
    OrchestrateResponse,
    CreateFileRequest,
    CreateFileResponse,
    ListFilesResponse,
    ReadFileRequest,
    ReadFileResponse,
    DeleteFileRequest,
    DeleteFileResponse,
)

from ai_api.auth.schemas import (
    ProfileResponse,
    UpdateProfileRequest,
)

from ai_api.file_actions import write_file, list_files, read_file, delete_file

from ai_api.agents.orchestrator import pick_agent
from ai_api.agents.prompts import system_prompt_for

from ai_api.ollama_client import generate

from ai_api.memory import (
    get_session_history,
    add_to_session,
    list_sessions,
    get_session_messages,
    create_session,
)

from ai_api.init_db import init_db
from ai_api.deps import get_db
from ai_api.models import User


app = FastAPI(title="Custom AI API", version="1.0")
app.include_router(auth_router)

# ✅ CORS (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# 🔹 JSON helpers
# =========================

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

    # 2) sinon chercher le premier {...}
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

    # garder seulement la zone JSON
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]

    # remplacer quotes simples par doubles
    text = re.sub(r"(?<!\\)'", '"', text)

    # ajouter quotes aux clés non-quotées: summary: -> "summary":
    text = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', text)

    return text


# =========================
# 🔹 Startup
# =========================

@app.on_event("startup")
def on_startup():
    init_db()


# =========================
# 🔹 Utils output
# =========================

def estimate_tokens(text: str) -> int:
    return int(len(text.split()) * 1.3)


def clean_output(text: str) -> str:
    if not text:
        return text

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return text.strip()

    bad_prefixes = [
        "bonjour",
        "salut",
        "hello",
        "coucou",
        "bonsoir",
        "je suis",
        "en tant qu",
        "avec plaisir",
        "bien sûr",
        "bien sur",
        "d'accord",
        "ok",
        "certainement",
        "bienvenue",
        "que voulez-vous",
        "que veux-tu",
        "comment puis-je",
        "comment je peux",
        "je peux",
        "laissez-moi",
        "laisse-moi",
    ]

    while lines:
        low = lines[0].lower()
        if any(low.startswith(x) for x in bad_prefixes):
            lines.pop(0)
            continue
        if low.startswith("agent:") or low.startswith("ai:") or low.startswith("assistant:"):
            lines.pop(0)
            continue
        break

    cleaned = "\n".join(lines).strip()

    endings_to_remove = [
        "que voulez-vous que je réponde",
        "que veux-tu que je réponde",
        "voulez-vous que je continue",
        "souhaitez-vous que je continue",
        "comment puis-je vous aider",
        "comment je peux t'aider",
    ]

    low_cleaned = cleaned.lower()
    for end in endings_to_remove:
        if end in low_cleaned:
            idx = low_cleaned.find(end)
            cleaned = cleaned[:idx].strip()
            break

    return cleaned if cleaned else text.strip()


# =========================
# 🔹 Healthcheck
# =========================

@app.get("/health")
def health():
    return {"status": "ok"}


# =====================================
# 🔹 Sessions (JWT requis)
# =====================================

@app.post("/sessions")
def new_session(email: str = Depends(get_current_user_email)):
    session_id = create_session()
    return {"session_id": session_id}


@app.get("/sessions")
def get_sessions(email: str = Depends(get_current_user_email)):
    return {"sessions": list_sessions()}


@app.get("/sessions/{session_id}")
def get_session_detail(session_id: str, email: str = Depends(get_current_user_email)):
    messages = get_session_messages(session_id)
    return {"session_id": session_id, "messages": messages}


# =========================
# 🔹 PROFILE / ME (JWT requis)
# =========================

@app.get("/me", response_model=ProfileResponse)
def me(
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return ProfileResponse(email=user.email, default_agent=user.default_agent)


@app.get("/profile", response_model=ProfileResponse)
def get_profile(
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return ProfileResponse(email=user.email, default_agent=user.default_agent)


@app.put("/profile", response_model=ProfileResponse)
def update_profile(
    payload: UpdateProfileRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    user.default_agent = payload.default_agent
    db.commit()
    db.refresh(user)

    return ProfileResponse(email=user.email, default_agent=user.default_agent)


# =========================
# 🔹 /generate (JWT requis)
# =========================

@app.post("/generate", response_model=GenerateResponse)
def generate_text(
    request: GenerateRequest,
    email: str = Depends(get_current_user_email)
):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt vide non autorisé")

    session_id = request.session_id or str(uuid.uuid4())
    history = get_session_history(session_id)

    DEFAULT_MAX = 512
    HARD_MAX = 2048
    max_tokens = min(request.max_tokens or DEFAULT_MAX, HARD_MAX)

    system_prompt = f"""
[INSTRUCTIONS STRICTES]
Tu es un moteur d’API IA.

RÈGLES OBLIGATOIRES :
- Réponds uniquement avec la réponse finale.
- Pas de salutations.
- Pas d’excuses.
- Ne parle jamais de toi-même.
- Ne pose aucune question.
- Ne mets aucun préfixe : pas "Assistant :", pas "Utilisateur :".
- Langue obligatoire : {request.language}.

Si la réponse est coupée, termine EXACTEMENT par :
Souhaitez-vous que je continue ?
""".strip()

    full_prompt = f"""
{system_prompt}

Contexte utile :
{history}

Question :
{request.prompt}
""".strip()

    try:
        result = generate(prompt=full_prompt, max_tokens=max_tokens)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {repr(e)}")

    result = clean_output(result)

    add_to_session(session_id, f"USER: {request.prompt.strip()}")
    add_to_session(session_id, f"AI: {result.strip()}")

    estimated_tokens = estimate_tokens(result)
    truncated = estimated_tokens >= int(max_tokens * 0.9)

    return GenerateResponse(result=result, truncated=truncated, session_id=session_id)


# =========================
# 🔹 /continue (JWT requis)
# =========================

@app.post("/continue", response_model=GenerateResponse)
def continue_text(
    request: ContinueRequest,
    email: str = Depends(get_current_user_email)
):
    if not request.last_output or not request.last_output.strip():
        raise HTTPException(status_code=400, detail="Texte précédent vide")

    session_id = request.session_id or str(uuid.uuid4())

    DEFAULT_MAX = 512
    HARD_MAX = 2048
    max_tokens = min(request.max_tokens or DEFAULT_MAX, HARD_MAX)

    system_prompt = f"""
Tu es un moteur de réponse API.

RÈGLES STRICTES (obligatoires) :
- Réponds uniquement par la réponse finale.
- Aucune salutation (pas Bonjour, Salut, etc.)
- Aucune excuse.
- Ne parle jamais de toi-même (pas "je", pas "en tant qu'IA").
- Ne pose aucune question.
- Pas de texte inutile.
- Langue obligatoire : {request.language}

Réponds en UNE seule phrase si possible.
""".strip()

    full_prompt = f"""
{system_prompt}

Suite directe du texte ci-dessous, sans rien ajouter :

{request.last_output}

Continue.
""".strip()

    try:
        result = generate(prompt=full_prompt, max_tokens=max_tokens)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {repr(e)}")

    result = clean_output(result)

    add_to_session(session_id, f"AI: {result.strip()}")

    estimated_tokens = estimate_tokens(result)
    truncated = estimated_tokens >= int(max_tokens * 0.9)

    return GenerateResponse(result=result, truncated=truncated, session_id=session_id)


# =========================
# 🔹 /orchestrate (JWT requis)
# =========================

@app.post("/orchestrate", response_model=OrchestrateResponse)
def orchestrate(
    request: OrchestrateRequest,
    email: str = Depends(get_current_user_email)
):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt vide non autorisé")

    session_id = request.session_id or str(uuid.uuid4())

    DEFAULT_MAX = 512
    HARD_MAX = 2048
    max_tokens = min(request.max_tokens or DEFAULT_MAX, HARD_MAX)

    agent = request.agent
    if agent == "auto":
        agent = pick_agent(request.prompt)

    history = get_session_history(session_id)
    system_prompt = system_prompt_for(agent, request.language)

    full_prompt = f"""
{system_prompt}

Contexte utile :
{history}

Demande :
{request.prompt}
""".strip()

    try:
        result = generate(prompt=full_prompt, max_tokens=max_tokens)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {repr(e)}")

    result = clean_output(result)

    add_to_session(session_id, f"USER: {request.prompt.strip()}")
    add_to_session(session_id, f"AI({agent}): {result.strip()}")

    estimated_tokens = estimate_tokens(result)
    truncated = estimated_tokens >= int(max_tokens * 0.9)

    return OrchestrateResponse(
        agent=agent,
        result=result,
        truncated=truncated,
        session_id=session_id
    )


# =========================
# 🔹 tools (JWT requis)
# =========================

@app.get("/tools")
def tools(email: str = Depends(get_current_user_email)):
    return {"tools": TOOLS}


# =========================
# 🔹 Files (JWT requis)
# =========================

@app.post("/files/create", response_model=CreateFileResponse)
def create_file(
    payload: CreateFileRequest,
    email: str = Depends(get_current_user_email)
):
    try:
        saved_path = write_file(payload.path, payload.content)
        return CreateFileResponse(ok=True, path=saved_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/files", response_model=ListFilesResponse)
def files(email: str = Depends(get_current_user_email)):
    return ListFilesResponse(files=list_files())


@app.post("/files/read", response_model=ReadFileResponse)
def files_read(
    payload: ReadFileRequest,
    email: str = Depends(get_current_user_email),
):
    try:
        content = read_file(payload.path)
        return ReadFileResponse(ok=True, path=payload.path, content=content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/files/delete", response_model=DeleteFileResponse)
def files_delete(
    payload: DeleteFileRequest,
    email: str = Depends(get_current_user_email),
):
    try:
        delete_file(payload.path)
        return DeleteFileResponse(ok=True, path=payload.path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =========================
# 🔹 /build (JWT requis) - STABLE (sans CodeAgent)
# =========================

@app.post("/build", response_model=BuildResponse)
def build_code(
    request: BuildRequest,
    email: str = Depends(get_current_user_email)
):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt vide non autorisé")

    session_id = request.session_id or str(uuid.uuid4())

    agent = request.agent
    if agent == "auto":
        agent = pick_agent(request.prompt)

    DEFAULT_MAX = 900
    HARD_MAX = 2048
    max_tokens = min(request.max_tokens or DEFAULT_MAX, HARD_MAX)

    history = get_session_history(session_id)

    system_prompt = f"""
Tu es un agent de génération de code (style Cursor/Bolt).

OBJECTIF:
Générer des fichiers complets pour un projet.

RÈGLES STRICTES :
- Réponds UNIQUEMENT en JSON valide (double quotes obligatoires)
- Aucun texte hors JSON
- Le JSON doit contenir exactement :
  - "summary": string
  - "files": liste d'objets {{"path": "...", "content": "..."}}
- Les fichiers doivent être complets et propres.
- Langue du résumé : {request.language}

FORMAT EXACT :
{{
  "summary": "....",
  "files": [
    {{"path": "exemple.txt", "content": "contenu"}}
  ]
}}
""".strip()

    full_prompt = f"""
{system_prompt}

Contexte utile :
{history}

Agent sélectionné: {agent}

Demande :
{request.prompt}
""".strip()

    try:
        raw = generate(prompt=full_prompt, max_tokens=max_tokens)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {repr(e)}")

    raw = (raw or "").strip()

    # 1) extraction JSON direct
    try:
        payload = extract_json_block(raw)
    except Exception:
        # 2) tentative de réparation JSON
        try:
            fixed = repair_json_loose(raw)
            payload = json.loads(fixed)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Réponse non-JSON / invalide: {str(e)}"
            )

    summary = str(payload.get("summary", "")).strip()
    files = payload.get("files", [])

    if not isinstance(files, list) or len(files) == 0:
        raise HTTPException(status_code=400, detail="Aucun fichier généré par le modèle")

    created_paths: list[str] = []

    for f in files:
        if not isinstance(f, dict):
            continue

        path = (f.get("path") or "").strip()
        content = f.get("content") or ""

        if not path:
            continue

        saved = write_file(path, content)
        created_paths.append(saved)

    if len(created_paths) == 0:
        raise HTTPException(status_code=400, detail="Aucun fichier valide n'a été créé")

    add_to_session(session_id, f"USER: {request.prompt.strip()}")
    add_to_session(session_id, f"AI({agent}): BUILD {len(created_paths)} files")

    return BuildResponse(
        ok=True,
        session_id=session_id,
        agent=agent,
        summary=summary,
        files_created=created_paths
    )
