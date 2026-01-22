import os
from pathlib import Path

WORKSPACE_DIR = Path("workspace").resolve()


def ensure_workspace():
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)


def safe_path(relative_path: str) -> Path:
    """
    Empêche d'écrire en dehors de workspace/
    """
    ensure_workspace()

    rel = (relative_path or "").strip().lstrip("/").replace("\\", "/")
    if not rel:
        raise ValueError("Chemin vide")

    full = (WORKSPACE_DIR / rel).resolve()

    if not str(full).startswith(str(WORKSPACE_DIR)):
        raise ValueError("Chemin non autorisé")

    return full


def write_file(relative_path: str, content: str) -> str:
    p = safe_path(relative_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content or "", encoding="utf-8")
    return str(p)


def list_files() -> list[str]:
    ensure_workspace()
    out = []
    for root, _, files in os.walk(WORKSPACE_DIR):
        for f in files:
            full = Path(root) / f
            out.append(str(full.relative_to(WORKSPACE_DIR)).replace("\\", "/"))
    return sorted(out)
