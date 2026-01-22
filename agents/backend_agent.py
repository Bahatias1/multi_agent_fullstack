from crewai import Agent
from config.custom_crewai_llm import LocalAPILLM

llm = LocalAPILLM(api_url="http://127.0.0.1:8000/generate", language="fr")

backend_agent = Agent(
    role="Senior Backend Engineer",
    goal="Créer des APIs propres et robustes",
    backstory="Expert backend Python/FastAPI",
    llm=llm,
    verbose=True
)
