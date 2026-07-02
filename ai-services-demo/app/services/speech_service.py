import tempfile
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import azure.cognitiveservices.speech as speechsdk

from app.core.config import get_settings


def get_stt_config():
    settings = get_settings()
    return speechsdk.SpeechConfig(
        subscription=settings.azure_speech_key,
        endpoint=settings.azure_speech_stt_endpoint,
    )

def get_tts_config():
    settings = get_settings()
    return speechsdk.SpeechConfig(
        subscription=settings.azure_speech_key,
        endpoint=settings.azure_speech_tts_endpoint,
    )


async def text_to_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    speech_config = get_tts_config()
    speech_config.speech_synthesis_voice_name = voice

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=None
    )
    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data
    raise RuntimeError(f"Speech synthesis failed: {result.reason}")


async def speech_to_text(audio_data: bytes, language: str = "en-US") -> str:
    speech_config = get_stt_config()
    speech_config.speech_recognition_language = language

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    try:
        tmp.write(audio_data)
        tmp.close()

        audio_config = speechsdk.audio.AudioConfig(filename=tmp.name)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config, audio_config=audio_config
        )
        result = recognizer.recognize_once_async().get()

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


async def translate_speech(
    audio_data: bytes,
    source_language: str = "en-US",
    target_language: str = "es-ES",
    voice_name: str | None = None
) -> dict:
    settings = get_settings()
    logger.info(f"Starting translation from {source_language} to {target_language}")
    
    try:
        translation_config = speechsdk.translation.SpeechTranslationConfig(
            subscription=settings.azure_speech_key,
            endpoint=settings.azure_speech_stt_endpoint
        )
        translation_config.speech_recognition_language = source_language
        translation_config.add_target_language(target_language)
        
        # Set voice for synthesis if provided
        if voice_name:
            translation_config.set_voice_name(target_language, voice_name)

        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        try:
            logger.info(f"Writing audio data to temporary file: {tmp.name}")
            tmp.write(audio_data)
            tmp.close()

            audio_config = speechsdk.audio.AudioConfig(filename=tmp.name)
            recognizer = speechsdk.translation.TranslationRecognizer(
                translation_config=translation_config, audio_config=audio_config
            )
            logger.info("Starting speech recognition...")
            result = recognizer.recognize_once_async().get()

            del recognizer
            del audio_config

            logger.info(f"Recognition result reason: {result.reason}")

            if result.reason == speechsdk.ResultReason.TranslatedSpeech:
                logger.info("Translation successful!")
                # Now synthesize the translated text to speech
                translated_text = result.translations[target_language]
                logger.info(f"Translated text: {translated_text}")
                synthesized_audio = await text_to_speech(translated_text, voice_name or get_default_voice_for_language(target_language))
                
                return {
                    "text": result.text,
                    "translations": result.translations,
                    "audio": synthesized_audio
                }
            if result.reason == speechsdk.ResultReason.NoMatch:
                logger.error(f"No speech recognized: {result.no_match_details}")
                raise RuntimeError(
                    f"No speech recognized: {result.no_match_details}"
                )
            if result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                logger.error(f"Speech translation canceled: {cancellation.reason} - {cancellation.error_details}")
                raise RuntimeError(
                    f"Speech translation canceled: {cancellation.reason} - {cancellation.error_details}"
                )
            raise RuntimeError(f"Speech translation failed: {result.reason}")
        finally:
            try:
                os.unlink(tmp.name)
                logger.info("Temporary file deleted")
            except PermissionError:
                logger.warning("Could not delete temporary file due to permission error")
            except Exception as e:
                logger.warning(f"Error deleting temporary file: {e}")
    except Exception as e:
        logger.exception(f"Error in translate_speech: {e}")
        raise


def get_default_voice_for_language(language_code: str) -> str:
    # Default voices for common languages
    default_voices = {
        "en-US": "en-US-JennyNeural",
        "es-ES": "es-ES-ElviraNeural",
        "fr-FR": "fr-FR-DeniseNeural",
        "de-DE": "de-DE-KatjaNeural",
        "it-IT": "it-IT-ElsaNeural",
        "pt-BR": "pt-BR-FranciscaNeural",
        "zh-CN": "zh-CN-XiaoxiaoNeural",
        "ja-JP": "ja-JP-NanamiNeural",
        "ko-KR": "ko-KR-SunHiNeural",
        "da-DK": "da-DK-ChristelNeural",
        "ur-IN": "ur-IN-SalmaNeural"
    }
    return default_voices.get(language_code, "en-US-JennyNeural")


def get_available_voices() -> list:
    speech_config = get_tts_config()
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=None
    )
    voices_result = synthesizer.get_voices_async().get()
    voices = []
    for voice in voices_result.voices:
        voices.append({
            "name": voice.name,
            "locale": voice.locale,
            "short_name": voice.short_name,
            "gender": str(voice.gender),
            "local_name": voice.local_name
        })
    return voices
