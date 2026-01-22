from pydantic import BaseModel
from typing import Optional


# =========================
# 🔹 /generate request
# =========================
class GenerateRequest(BaseModel):
    prompt: str
    language: Optional[str] = "fr"
    max_tokens: Optional[int] = 512
    session_id: Optional[str] = None


# =========================
# 🔹 /continue request
# =========================
class ContinueRequest(BaseModel):
    last_output: str
    language: Optional[str] = "fr"
    max_tokens: Optional[int] = 512
    session_id: Optional[str] = None


# =========================
# 🔹 standard response
# =========================
class GenerateResponse(BaseModel):
    result: str
    truncated: bool
    session_id: str
