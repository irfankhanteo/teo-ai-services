from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io

from app.core.security import verify_api_key
from app.services.speech_service import text_to_speech, speech_to_text

router = APIRouter(prefix="/speech", tags=["Speech"])


class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-JennyNeural"


@router.post("/tts")
async def tts(request: TTSRequest, _: str = Depends(verify_api_key)):
    audio_data = await text_to_speech(request.text, request.voice)
    return StreamingResponse(io.BytesIO(audio_data), media_type="audio/wav")


@router.post("/stt")
async def stt(
    file: UploadFile = File(...), _: str = Depends(verify_api_key)
):
    audio_data = await file.read()
    text = await speech_to_text(audio_data)
    return {"text": text}
