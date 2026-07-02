from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
import base64
import logging

from app.core.security import verify_api_key
from app.services.speech_service import text_to_speech, speech_to_text, translate_speech, get_available_voices

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/speech", tags=["Speech"])


class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-JennyNeural"


@router.post("/tts")
async def tts_endpoint(request: TTSRequest, _: str = Depends(verify_api_key)):
    try:
        audio_data = await text_to_speech(request.text, request.voice)
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/wav")
    except Exception as e:
        logger.exception(f"Error in TTS endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stt")
async def stt_endpoint(
    file: UploadFile = File(...),
    language: str = Form("en-US"),
    _: str = Depends(verify_api_key)
):
    try:
        audio_data = await file.read()
        text = await speech_to_text(audio_data, language)
        return {"text": text}
    except Exception as e:
        logger.exception(f"Error in STT endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/translate")
async def translate_endpoint(
    file: UploadFile = File(...),
    source_language: str = Form("en-US"),
    target_language: str = Form("es-ES"),
    voice_name: str | None = Form(None),
    _: str = Depends(verify_api_key)
):
    try:
        audio_data = await file.read()
        result = await translate_speech(audio_data, source_language, target_language, voice_name)
        # Encode audio to base64 for JSON response
        result["audio"] = base64.b64encode(result["audio"]).decode("utf-8")
        return result
    except Exception as e:
        logger.exception(f"Error in translation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_voices_endpoint(_: str = Depends(verify_api_key)):
    try:
        voices = get_available_voices()
        return {"voices": voices}
    except Exception as e:
        logger.exception(f"Error getting voices: {e}")
        raise HTTPException(status_code=500, detail=str(e))
