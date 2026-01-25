# ai_api/schemas.py
from pydantic import BaseModel
from typing import Optional, Literal, List


# =========================
# 🔹 GENERATE / CONTINUE
# =========================

class GenerateRequest(BaseModel):
    prompt: str
    language: str = "français"
    max_tokens: int = 512
    session_id: Optional[str] = None


class ContinueRequest(BaseModel):
    last_output: str
    language: str = "français"
    max_tokens: int = 512
    session_id: Optional[str] = None


class GenerateResponse(BaseModel):
    result: str
    truncated: bool = False
    session_id: str


# =========================
# 🔹 ORCHESTRATE
# =========================

class OrchestrateRequest(BaseModel):
    prompt: str
    agent: Literal["auto", "backend", "frontend", "devops", "writer"] = "auto"
    language: str = "français"
    max_tokens: int = 512
    session_id: Optional[str] = None


class OrchestrateResponse(BaseModel):
    agent: str
    result: str
    truncated: bool = False
    session_id: str


# =========================
# 🔹 FILES
# =========================

class CreateFileRequest(BaseModel):
    path: str
    content: str


class CreateFileResponse(BaseModel):
    ok: bool = True
    path: str


class ListFilesResponse(BaseModel):
    files: List[str]


class ReadFileRequest(BaseModel):
    path: str


class ReadFileResponse(BaseModel):
    ok: bool = True
    path: str
    content: str


class DeleteFileRequest(BaseModel):
    path: str


class DeleteFileResponse(BaseModel):
    ok: bool = True
    path: str


# =========================
# 🔹 BUILD
# =========================

class BuildFile(BaseModel):
    path: str
    content: str


class BuildRequest(BaseModel):
    prompt: str
    agent: Literal["auto", "backend", "frontend", "devops", "writer"] = "auto"
    language: str = "français"
    max_tokens: int = 900
    session_id: Optional[str] = None


class BuildResponse(BaseModel):
    ok: bool = True
    session_id: str
    agent: str
    summary: str
    files_created: List[str] = []
