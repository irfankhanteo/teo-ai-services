import httpx

from app.core.config import get_settings


async def analyze_image(image_url: str) -> dict:
    settings = get_settings()
    endpoint = f"{settings.azure_vision_endpoint}/computervision/imageanalysis:analyze"

    params = {
        "features": "caption,read,tags,objects",
        "model-version": "latest",
        "language": "en",
        "api-version": "2024-02-01",
    }

    headers = {
        "Ocp-Apim-Subscription-Key": settings.azure_vision_key,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            endpoint,
            headers=headers,
            params=params,
            json={"url": image_url},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()


async def analyze_image_bytes(image_data: bytes) -> dict:
    settings = get_settings()
    endpoint = f"{settings.azure_vision_endpoint}/computervision/imageanalysis:analyze"

    params = {
        "features": "caption,read,tags,objects",
        "model-version": "latest",
        "language": "en",
        "api-version": "2024-02-01",
    }

    headers = {
        "Ocp-Apim-Subscription-Key": settings.azure_vision_key,
        "Content-Type": "application/octet-stream",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            endpoint,
            headers=headers,
            params=params,
            content=image_data,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
