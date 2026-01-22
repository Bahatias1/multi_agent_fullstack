from abc import ABC, abstractmethod

class BaseLLMProvider(ABC):

    @abstractmethod
    def generate(self, prompt: str, max_tokens: int) -> str:
        pass
