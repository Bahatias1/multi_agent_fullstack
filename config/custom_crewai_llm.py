import requests
from crewai.llm import BaseLLM

class LocalAPILLM(BaseLLM):
    def __init__(self, api_url: str, language: str = "fr"):
        super().__init__(model="local-api")  # important pour CrewAI
        self.api_url = api_url
        self.language = language

    def call(self, prompt: str, **kwargs) -> str:
        if not isinstance(prompt, str) or not prompt.strip():
            prompt = "Explique clairement."

        payload = {
    "prompt": str(prompt),
    "language": self.language,
    "max_tokens": 600
}

        session = requests.Session()
        session.trust_env = False  # 🔥 ignore proxy Windows

        response = session.post(
            self.api_url,
            json=payload,
            timeout=600,
            proxies={"http": None, "https": None}  # 🔥 force no proxy
        )

        response.raise_for_status()
        return response.json()["result"]
