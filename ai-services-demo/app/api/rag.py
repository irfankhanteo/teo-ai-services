from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import verify_api_key
from app.services.search_service import search_documents
from app.services.openai_service import chat_completion

router = APIRouter(prefix="/rag", tags=["RAG"])


class RAGRequest(BaseModel):
    query: str
    top: int = 5
    max_tokens: int = 1000


@router.post("/query")
async def rag_query(request: RAGRequest, _: str = Depends(verify_api_key)):
    # Retrieve relevant documents
    docs = await search_documents(request.query, top=request.top)

    # Build context from search results
    context = "\n\n".join(
        f"[{doc['title']}]: {doc['content']}" for doc in docs
    )

    # Generate answer using retrieved context
    messages = [
        {
            "role": "system",
            "content": (
                "Answer the user's question based on the provided context. "
                "If the context doesn't contain enough information, say so.\n\n"
                f"Context:\n{context}"
            ),
        },
        {"role": "user", "content": request.query},
    ]

    result = await chat_completion(messages=messages, max_tokens=request.max_tokens)

    return {
        "answer": result["message"],
        "sources": docs,
        "usage": result["usage"],
    }
