# ai_api/memory.py
import uuid
from typing import Dict, List

_sessions: Dict[str, List[str]] = {}


def create_session() -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = []
    return session_id


def list_sessions() -> List[str]:
    return list(_sessions.keys())


def add_to_session(session_id: str, text: str):
    if session_id not in _sessions:
        _sessions[session_id] = []
    _sessions[session_id].append(text)


def get_session_messages(session_id: str) -> List[str]:
    return _sessions.get(session_id, [])


def get_session_history(session_id: str) -> str:
    msgs = _sessions.get(session_id, [])
    return "\n".join(msgs[-20:])
