from collections import defaultdict, deque

# nombre maximum de messages conservés par session
MAX_MESSAGES = 8

# mémoire en RAM (simple, rapide, suffisant pour l’instant)
_sessions = defaultdict(lambda: deque(maxlen=MAX_MESSAGES))


def get_session_history(session_id: str) -> str:
    """
    Retourne l’historique formaté pour injection dans le prompt
    """
    history = _sessions.get(session_id, [])
    return "\n".join(history)


def add_to_session(session_id: str, message: str) -> None:
    """
    Ajoute un message à la mémoire de la session
    """
    _sessions[session_id].append(message)
