import tempfile
import os

import azure.cognitiveservices.speech as speechsdk

from app.core.config import get_settings

def get_speech_tts_config() -> speechsdk.SpeechConfig:
    settings = get_settings()
    return speechsdk.SpeechConfig(
        subscription=settings.azure_speech_key,
        endpoint=settings.azure_speech_tts_endpoint,
    )
    
def get_speech_stt_config() -> speechsdk.SpeechConfig:
    settings = get_settings()
    return speechsdk.SpeechConfig(
        subscription=settings.azure_speech_key,
        endpoint=settings.azure_speech_stt_endpoint,
    )


async def text_to_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    speech_config = get_speech_tts_config()
    speech_config.speech_synthesis_voice_name = voice

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=None
    )
    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data
    raise RuntimeError(f"Speech synthesis failed: {result.reason}")


async def speech_to_text(audio_data: bytes) -> str:
    speech_config = get_speech_stt_config()
    speech_config.speech_recognition_language = "es-US"

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    try:
        tmp.write(audio_data)
        tmp.close()

        audio_config = speechsdk.audio.AudioConfig(filename=tmp.name)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config, audio_config=audio_config
        )
        result = recognizer.recognize_once_async().get()

        # Release SDK handles before cleanup
        del recognizer
        del audio_config

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return result.text
        if result.reason == speechsdk.ResultReason.NoMatch:
            raise RuntimeError(
                f"No speech recognized: {result.no_match_details}"
            )
        if result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            raise RuntimeError(
                f"Speech recognition canceled: {cancellation.reason} - {cancellation.error_details}"
            )
        raise RuntimeError(f"Speech recognition failed: {result.reason}")
    finally:
        try:
            os.unlink(tmp.name)
        except PermissionError:
            pass
