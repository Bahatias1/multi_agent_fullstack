import requests
from typing import Iterator
from .base import BaseLLMProvider


class OllamaProvider(BaseLLMProvider):
    def __init__(self, model: str = "qwen2.5:3b"):
        self.model = model
        self.endpoint = "http://localhost:11434/api/generate"

    def generate(self, prompt: str, max_tokens: int = 512) -> str:
        response = requests.post(
            self.endpoint,
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens
                }
            },
            timeout=300
        )
        response.raise_for_status()
        return response.json().get("response", "").strip()

    def generate_stream(self, prompt: str, max_tokens: int = 512) -> Iterator[str]:
        response = requests.post(
            self.endpoint,
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "num_predict": max_tokens
                }
            },
            stream=True,
            timeout=300
        )
        response.raise_for_status()

        for line in response.iter_lines(decode_unicode=True):
            if not line:
                continue

            data = None
            try:
                data = __import__("json").loads(line)
            except Exception:
                continue

            chunk = data.get("response", "")
            if chunk:
                yield chunk

            if data.get("done") is True:
                break
