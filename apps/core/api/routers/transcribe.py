"""Audio transcription router — Whisper API fallback for Web Speech API."""

import logging
import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from api.dependencies.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcribe", tags=["transcribe"], dependencies=[Depends(get_current_user)])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

SUPPORTED_FORMATS = {"audio/webm", "audio/wav", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/flac", "audio/mp3"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB (Whisper limit)


@router.post("/audio")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "en",
):
    """Transcribe audio file using OpenAI Whisper API.

    Accepts audio from MediaRecorder (webm/ogg) or any Whisper-supported format.
    Returns plain text transcription.
    """
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="Whisper API not configured (OPENAI_API_KEY missing)")

    # Validate content type loosely — browsers may send generic types
    content_type = (file.content_type or "").split(";")[0].strip()
    if content_type and content_type not in SUPPORTED_FORMATS and not content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {content_type}")

    # Read file into memory and check size
    audio_bytes = await file.read()
    if len(audio_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Audio file exceeds 25 MB limit")
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file too small — no audio captured")

    # Determine file extension for Whisper
    ext_map = {"audio/webm": ".webm", "audio/wav": ".wav", "audio/mp4": ".m4a",
               "audio/mpeg": ".mp3", "audio/ogg": ".ogg", "audio/flac": ".flac", "audio/mp3": ".mp3"}
    ext = ext_map.get(content_type, ".webm")

    try:
        import httpx

        # Write to temp file (Whisper API needs a file)
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                with open(tmp_path, "rb") as f:
                    resp = await client.post(
                        "https://api.openai.com/v1/audio/transcriptions",
                        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                        data={"model": "whisper-1", "language": language, "response_format": "json"},
                        files={"file": (f"audio{ext}", f, content_type or "audio/webm")},
                    )
            if resp.status_code != 200:
                logger.error("Whisper API error %s: %s", resp.status_code, resp.text[:500])
                raise HTTPException(status_code=502, detail="Whisper API error")

            result = resp.json()
            text = result.get("text", "").strip()
            logger.info("Whisper transcription: %d chars, lang=%s", len(text), language)
            return {"text": text, "language": language}
        finally:
            os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Transcription failed: %s", e)
        raise HTTPException(status_code=500, detail="Transcription failed")
