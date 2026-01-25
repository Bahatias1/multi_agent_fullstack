# ai_api/models.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from ai_api.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # agent par défaut
    default_agent = Column(String, default="auto", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
