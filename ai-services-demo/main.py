from fastapi import FastAPI

from app.api import chat, speech, vision, rag
from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

app.include_router(chat.router, prefix="/api")
app.include_router(speech.router, prefix="/api")
app.include_router(vision.router, prefix="/api")
app.include_router(rag.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": f"{settings.app_name} is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting {settings.app_name}")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
