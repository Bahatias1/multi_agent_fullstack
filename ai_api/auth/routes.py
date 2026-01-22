from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ai_api.deps import get_db
from ai_api.models import User

from ai_api.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, MeResponse
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
        hashed_password=hash_password(payload.password)
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
    email = decode_token(token)  # decode_token retourne déjà l'email (string)
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")
    return email


    if not email or not isinstance(email, str):
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

    return email


@router.get("/me", response_model=MeResponse)
def me(email: str = Depends(get_current_user_email)):
    return MeResponse(email=email)
