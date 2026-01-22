from crewai import Agent
from config.custom_crewai_llm import LocalAPILLM

# ⚠️ Mets ici un token valide (ou injecte-le depuis ton système)
API_TOKEN = "PUT_YOUR_TOKEN_HERE"

llm = LocalAPILLM(
    api_url="http://127.0.0.1:8000/generate",
    token=API_TOKEN,
    language="fr",
    max_tokens=512,
)

backend_agent = Agent(
    role="Senior Backend Engineer",
    goal="Créer des APIs propres et robustes",
    backstory="Expert backend Python/FastAPI",
    llm=llm,
    verbose=True
)
