import requests

API_URL = "http://127.0.0.1:8000/generate"

def local_llm(prompt: str) -> str:
    payload = {
        "prompt": prompt,
        "language": "fr"
    }

    response = requests.post(API_URL, json=payload)
    response.raise_for_status()

    return response.json()["result"]
