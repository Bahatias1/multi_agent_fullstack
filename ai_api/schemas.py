from pydantic import BaseModel
from typing import Optional, Literal
from ai_api.db import SessionLocal
from ai_api.models import User
from ai_api.auth.schemas import ProfileResponse, UpdateProfileRequest



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

class CreateFileRequest(BaseModel):
    path: str
    content: str


class CreateFileResponse(BaseModel):
    ok: bool = True
    path: str


class ListFilesResponse(BaseModel):
    files: list[str]

# ai_api/schemas.py
from pydantic import BaseModel

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
