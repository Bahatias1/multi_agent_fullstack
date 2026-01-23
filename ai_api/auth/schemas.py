from pydantic import BaseModel, EmailStr
from typing import Literal

AgentName = Literal["auto", "backend", "frontend", "devops", "writer"]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    default_agent: AgentName = "auto"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileResponse(BaseModel):
    email: EmailStr
    default_agent: AgentName


class UpdateProfileRequest(BaseModel):
    default_agent: AgentName
