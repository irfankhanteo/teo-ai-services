from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv
import os


load_dotenv()

class Settings(BaseSettings):
    # App
    app_name: str = os.getenv("APP_NAME", "AI Services Demo")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Azure OpenAI
    azure_openai_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    azure_openai_api_key: str = os.getenv("AZURE_OPENAI_API_KEY", "")
    azure_openai_api_version: str = os.getenv("AZURE_OPENAI_API_VERSION", "")
    azure_openai_deployment: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")

    # Azure Speech
    azure_speech_key: str = os.getenv("AZURE_SPEECH_KEY", "")
    azure_speech_stt_endpoint: str = os.getenv("AZURE_SPEECH_STT_ENDPOINT", "")
    azure_speech_tts_endpoint: str = os.getenv("AZURE_SPEECH_TTS_ENDPOINT", "")

    # Azure Computer Vision
    azure_vision_endpoint: str = os.getenv("AZURE_VISION_ENDPOINT", "")
    azure_vision_key: str = os.getenv("AZURE_VISION_KEY", "")

    # Azure AI Search
    azure_search_endpoint: str = os.getenv("AZURE_SEARCH_ENDPOINT", "")
    azure_search_key: str = os.getenv("AZURE_SEARCH_KEY", "")
    azure_search_index: str = os.getenv("AZURE_SEARCH_INDEX", "")

    # Security
    api_key: str = os.getenv("API_KEY", "")

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
