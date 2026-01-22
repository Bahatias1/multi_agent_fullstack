from ai_api.db import Base, engine
from ai_api import models  # important: charge les tables

def init_db():
    Base.metadata.create_all(bind=engine)
