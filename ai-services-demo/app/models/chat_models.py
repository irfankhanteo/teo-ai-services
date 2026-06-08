from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    max_tokens: int = 1000
    temperature: float = 0.7


class ChatResponse(BaseModel):
    message: str
    usage: dict | None = None
