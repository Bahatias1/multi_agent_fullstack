# ai_api/ollama_client.py
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "deepseek-coder"

_session = requests.Session()
_session.trust_env = False  # ignore HTTP_PROXY / HTTPS_PROXY

def generate(prompt: str, max_tokens: int = 512) -> str:
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": max_tokens},
    }

    r = _session.post(OLLAMA_URL, json=payload, timeout=300)
    r.raise_for_status()
    data = r.json()
    return (data.get("response") or "").strip()

