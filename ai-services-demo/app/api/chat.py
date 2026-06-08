from fastapi import APIRouter, Depends

from app.core.security import verify_api_key
from app.models.chat_models import ChatRequest, ChatResponse
from app.services.openai_service import chat_completion

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/query", response_model=ChatResponse)
async def chat(request: ChatRequest, _: str = Depends(verify_api_key)):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    result = await chat_completion(
        messages=messages,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
    )
    return ChatResponse(**result)
