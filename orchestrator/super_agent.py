from crewai import Crew, Task
from agents.backend_agent import backend_agent

def run_super_agent(prompt: str):
    task = Task(
        description=f"""
Tu es Senior Backend Engineer.
Ta mission : générer une API FastAPI PROPRE avec JWT.

Demande utilisateur :
{prompt}

Tu dois répondre avec :
1) Structure de dossiers
2) Code complet des fichiers importants
3) Instructions de lancement
""".strip(),
        agent=backend_agent,
        expected_output="Réponse technique claire, structurée, avec code et étapes"
    )

    crew = Crew(
        agents=[backend_agent],
        tasks=[task],
        verbose=True
    )

    return crew.kickoff()
