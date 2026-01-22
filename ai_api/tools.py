from typing import List, Dict

TOOLS: List[Dict] = [
    {
        "id": "backend",
        "name": "Backend Agent",
        "description": "FastAPI, JWT, DB, architecture, endpoints robustes",
        "capabilities": ["fastapi", "jwt", "sqlalchemy", "schemas", "security", "api-design"],
    },
    {
        "id": "frontend",
        "name": "Frontend Agent",
        "description": "React + Vite, UI, state management, API integration",
        "capabilities": ["react", "vite", "ui", "css", "state", "fetch"],
    },
    {
        "id": "devops",
        "name": "DevOps Agent",
        "description": "Docker, déploiement, CI/CD, configs",
        "capabilities": ["docker", "deploy", "ci-cd", "nginx", "env"],
    },
    {
        "id": "writer",
        "name": "Writer Agent",
        "description": "Rédaction pro : emails, docs, README, rapports",
        "capabilities": ["writing", "documentation", "emails", "summaries"],
    },
]
