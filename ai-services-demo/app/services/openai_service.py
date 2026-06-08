from openai import AsyncAzureOpenAI

from app.core.config import get_settings


def get_openai_client() -> AsyncAzureOpenAI:
    settings = get_settings()
    return AsyncAzureOpenAI(
        azure_endpoint=settings.azure_openai_endpoint,
        api_key=settings.azure_openai_api_key,
        api_version=settings.azure_openai_api_version,
    )


async def chat_completion(
    messages: list[dict],
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> dict:
    settings = get_settings()
    client = get_openai_client()

    response = await client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return {
        "message": response.choices[0].message.content,
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        },
    }
