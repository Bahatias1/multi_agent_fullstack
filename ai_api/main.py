from ai_api.tools import TOOLS
from ai_api.schemas import CreateFileRequest, CreateFileResponse, ListFilesResponse
from ai_api.file_actions import write_file, list_files
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from ai_api.auth.routes import router as auth_router
from ai_api.auth.routes import get_current_user_email

from ai_api.schemas import (
    GenerateRequest,
    GenerateResponse,
    ContinueRequest,
    OrchestrateRequest,
    OrchestrateResponse,
)

from ai_api.agents.orchestrator import pick_agent
from ai_api.agents.prompts import system_prompt_for

from ai_api.ollama_client import generate
from ai_api.memory import (
    get_session_history,
    add_to_session,
    list_sessions,
    get_session_messages,
    create_session
)

from ai_api.init_db import init_db
import uuid


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


@app.on_event("startup")
def on_startup():
    init_db()


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

    # Supprimer les lignes de démarrage "parasites"
    while lines:
        low = lines[0].lower()
        if any(low.startswith(x) for x in bad_prefixes):
            lines.pop(0)
            continue
        # supprimer aussi si la ligne commence par "Agent:" ou "AI:"
        if low.startswith("agent:") or low.startswith("ai:") or low.startswith("assistant:"):
            lines.pop(0)
            continue
        break

    cleaned = "\n".join(lines).strip()

    # Si ça finit par une question du modèle, on coupe
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
            # on garde uniquement avant la phrase parasite
            idx = low_cleaned.find(end)
            cleaned = cleaned[:idx].strip()
            break

    return cleaned if cleaned else text.strip()

    if not text:
        return text

    bad_starts = [
        "bonjour!",
        "salut",
        "je vous",
        "comment pouvons",
        "laissez moi",
        "t-es",
    ]

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return text.strip()

    while lines and any(lines[0].lower().startswith(x) for x in bad_starts):
        lines.pop(0)

    cleaned = "\n".join(lines).strip() if lines else text.strip()
    return cleaned if cleaned else text.strip()


# ✅ Healthcheck
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


@app.get("/tools")
def tools(email: str = Depends(get_current_user_email)):
    return {"tools": TOOLS}


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
