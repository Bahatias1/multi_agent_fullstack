import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "deepseek-coder"

SYSTEM_PROMPTS = {
    "fr": """
Tu es un assistant IA expert en développement logiciel.
RÈGLES :
- Tu réponds UNIQUEMENT en français.
- Langage clair, technique et professionnel.
- Code propre et bien expliqué.
""",
    "en": """
You are an AI assistant specialized in software engineering.
RULES:
- You MUST answer only in English.
- Use clear, professional, technical language.
- Provide clean and well-structured code.
"""
}

def generate(prompt: str, language: str = "fr") -> str:
    system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["fr"])

    full_prompt = f"{system_prompt}\n\nUser: {prompt}\n\nAssistant:"

    payload = {
        "model": MODEL,
        "prompt": full_prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()

    return response.json()["response"]
