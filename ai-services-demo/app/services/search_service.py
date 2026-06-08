import httpx

from app.core.config import get_settings


async def search_documents(query: str, top: int = 5) -> list[dict]:
    settings = get_settings()
    endpoint = (
        f"{settings.azure_search_endpoint}"
        f"/indexes/{settings.azure_search_index}/docs/search"
    )

    headers = {
        "Content-Type": "application/json",
        "api-key": settings.azure_search_key,
    }

    payload = {
        "search": query,
        "top": top,
        "queryType": "semantic",
        "semanticConfiguration": "default",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            endpoint,
            headers=headers,
            json=payload,
            params={"api-version": "2024-07-01"},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()

    return [
        {
            "content": doc.get("content", ""),
            "score": doc.get("@search.score", 0),
            "title": doc.get("title", ""),
        }
        for doc in data.get("value", [])
    ]
