"""Media router — G-08 voice + image processing endpoints.

POST /media/transcribe    — Transcribe audio file via Whisper
POST /media/analyze-image — Analyze equipment photo via Claude Vision
"""

import logging

from fastapi import APIRouter, HTTPException, UploadFile, Form
from fastapi.responses import JSONResponse

from tools.processors.audio_transcription import (
    TranscriptionNotConfiguredError,
    UnsupportedAudioFormatError,
    get_transcription_service,
)
from tools.processors.image_analyzer import get_image_analysis_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile,
    language: str = Form(default="en"),
) -> dict:
    """Transcribe an audio file to text using OpenAI Whisper.

    - **file**: Audio file (wav, mp3, m4a, webm, ogg, flac)
    - **language**: Language hint — "fr", "en", "ar", "es" (default: "en")

    Returns AudioTranscriptionResult JSON.
    Raises 503 if OPENAI_API_KEY is not configured.
    """
    try:
        service = get_transcription_service()
    except TranscriptionNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    mime_type = file.content_type or "audio/webm"

    try:
        result = service.transcribe(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            language_hint=language,
            filename=file.filename or "capture.webm",
        )
    except UnsupportedAudioFormatError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Transcription error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}") from exc

    return result.model_dump()


@router.post("/analyze-image")
async def analyze_image(
    file: UploadFile,
    context: str = Form(default=""),
) -> dict:
    """Analyze an equipment photo using Claude Vision.

    - **file**: Image file (jpg, jpeg, png, webp)
    - **context**: Optional context hint (e.g. equipment TAG, description)

    Returns ImageAnalysis JSON: anomalies_detected, component_identified, severity_visual.
    Raises 503 if ANTHROPIC_API_KEY is not configured.
    """
    try:
        service = get_image_analysis_service()
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file.")

    mime_type = file.content_type or "image/jpeg"
    # Normalize common variations
    if mime_type in ("image/jpg",):
        mime_type = "image/jpeg"

    try:
        result = service.analyze(
            image_bytes=image_bytes,
            mime_type=mime_type,
            context_hint=context or None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Image analysis error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {exc}") from exc

    return result.model_dump()
