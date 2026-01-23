from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ai_api.auth.schemas import UpdateProfileRequest, ProfileResponse

from ai_api.deps import get_db
from ai_api.models import User

from ai_api.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, ProfileResponse, UpdateProfileRequest
from ai_api.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token
)

router = APIRouter(tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Utilisateur déjà existant")

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        default_agent=payload.default_agent,  # ✅
    )
    db.add(user)
    db.commit()

    return {"message": "Compte créé avec succès"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


def get_current_user_email(token: str = Depends(oauth2_scheme)):
    email = decode_token(token)
    if not email or not isinstance(email, str):
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")
    return email


@router.get("/me", response_model=ProfileResponse)
def me(email: str = Depends(get_current_user_email)):
    return ProfileResponse(email=email)

@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return ProfileResponse(email=user.email, default_agent=user.default_agent)


@router.post("/profile", response_model=ProfileResponse)
def update_profile(
    payload: UpdateProfileRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    user.default_agent = payload.default_agent
    db.commit()
    db.refresh(user)

    return ProfileResponse(email=user.email, default_agent=user.default_agent)
