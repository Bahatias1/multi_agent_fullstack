import requests
from typing import Optional


class LocalAPILLM:
    def __init__(
        self,
        api_url: str,
        token: str,
        language: str = "français",
        max_tokens: int = 512,
        session_id: Optional[str] = None,
        timeout: int = 60,
    ):
        self.api_url = api_url
        self.token = token
        self.language = language
        self.max_tokens = max_tokens
        self.session_id = session_id
        self.timeout = timeout

    def call(self, prompt: str) -> str:
        payload = {
            "prompt": prompt,
            "language": self.language,
            "max_tokens": self.max_tokens,
            "session_id": self.session_id,
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}",
        }

        res = requests.post(
            self.api_url,
            json=payload,
            headers=headers,
            timeout=self.timeout,
        )

        if res.status_code >= 400:
            raise Exception(f"API error {res.status_code}: {res.text}")

        data = res.json()

        # Met à jour session_id automatiquement
        if "session_id" in data and data["session_id"]:
            self.session_id = data["session_id"]

        return data.get("result", "")
