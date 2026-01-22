def pick_agent(prompt: str) -> str:
    p = (prompt or "").lower()

    # Frontend
    if any(k in p for k in ["react", "vite", "frontend", "ui", "css", "tailwind", "component", "page", "landing"]):
        return "frontend"

    # Backend
    if any(k in p for k in ["fastapi", "api", "endpoint", "jwt", "auth", "sqlalchemy", "database", "postgres", "schema"]):
        return "backend"

    # DevOps
    if any(k in p for k in ["docker", "deploy", "ci/cd", "github actions", "nginx", "render", "railway", "vercel"]):
        return "devops"

    # Writer / communication
    if any(k in p for k in ["email", "message", "cv", "lettre", "proposal", "rapport", "rédige", "résume"]):
        return "writer"

    # Par défaut
    return "backend"
