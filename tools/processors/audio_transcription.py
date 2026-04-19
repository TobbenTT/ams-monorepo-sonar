"""Audio transcription service — wraps OpenAI Whisper API.

Used by POST /media/transcribe to convert voice captures to text.
Supports multilingual input: FR, EN, AR, ES (OCP field technicians).

Fallback: if OPENAI_API_KEY is not configured, raises TranscriptionNotConfiguredError
so the UI can degrade gracefully to manual text input.
"""

import io
import logging
from typing import Optional

from tools.models.schemas import AudioTranscriptionResult

logger = logging.getLogger(__name__)

# Supported audio MIME types
SUPPORTED_MIME_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",       # .mp3
    "audio/mp4",        # .m4a
    "audio/webm",       # browser recording
    "audio/ogg",
    "audio/flac",
}

# Language hint → Whisper language code
_LANG_MAP = {
    "fr": "fr",
    "en": "en",
    "ar": "ar",
    "es": "es",
    "french": "fr",
    "english": "en",
    "arabic": "ar",
    "spanish": "es",
}


class TranscriptionNotConfiguredError(RuntimeError):
    """Raised when OPENAI_API_KEY is not set."""


class UnsupportedAudioFormatError(ValueError):
    """Raised when the audio MIME type is not supported."""


class TranscriptionService:
    """Voice-to-text transcription via OpenAI Whisper API (model: whisper-1).

    Usage:
        service = TranscriptionService(api_key="sk-...", model="whisper-1")
        result = service.transcribe(audio_bytes, mime_type="audio/webm", language_hint="fr")
    """

    def __init__(self, api_key: str, model: str = "whisper-1") -> None:
        if not api_key:
            raise TranscriptionNotConfiguredError(
                "OPENAI_API_KEY is not configured. "
                "Set it in your .env file to enable voice transcription. "
                "Field capture will fall back to manual text input."
            )
        try:
            from openai import OpenAI
            self._client = OpenAI(api_key=api_key)
        except ImportError as exc:
            raise TranscriptionNotConfiguredError(
                "openai package is not installed. Run: pip install openai>=1.0.0"
            ) from exc
        self._model = model

    def transcribe(
        self,
        audio_bytes: bytes,
        mime_type: str,
        language_hint: Optional[str] = None,
        filename: str = "capture.webm",
    ) -> AudioTranscriptionResult:
        """Transcribe audio bytes to text.

        Args:
            audio_bytes: Raw audio file content.
            mime_type: MIME type (e.g. "audio/webm").
            language_hint: Language code hint ("fr", "en", "ar", "es").
            filename: Original filename hint for Whisper.

        Returns:
            AudioTranscriptionResult with text, language_detected, duration_seconds.

        Raises:
            UnsupportedAudioFormatError: If mime_type is not supported.
            TranscriptionNotConfiguredError: If API key is missing.
        """
        if mime_type not in SUPPORTED_MIME_TYPES:
            raise UnsupportedAudioFormatError(
                f"Unsupported audio format: {mime_type}. "
                f"Supported: {sorted(SUPPORTED_MIME_TYPES)}"
            )

        whisper_lang = _LANG_MAP.get((language_hint or "").lower())

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename  # Whisper uses filename extension as format hint

        logger.debug(
            "Transcribing audio: %d bytes, mime=%s, lang=%s, model=%s",
            len(audio_bytes),
            mime_type,
            whisper_lang or "auto-detect",
            self._model,
        )

        kwargs: dict = {"model": self._model, "file": audio_file}
        if whisper_lang:
            kwargs["language"] = whisper_lang

        # response_format="verbose_json" gives us duration + detected language
        kwargs["response_format"] = "verbose_json"

        response = self._client.audio.transcriptions.create(**kwargs)

        detected_lang = getattr(response, "language", whisper_lang or "en")
        duration = getattr(response, "duration", None)
        text = response.text.strip()

        logger.info(
            "Transcription complete: %d chars, lang=%s, duration=%.1fs",
            len(text),
            detected_lang,
            duration or 0,
        )

        return AudioTranscriptionResult(
            text=text,
            language_detected=detected_lang,
            duration_seconds=duration,
            confidence=1.0,  # Whisper does not expose per-transcription confidence
        )


class ClaudeTranscriptionService:
    """Voice-to-text transcription via Anthropic Claude API (audio input support)."""

    def __init__(self, api_key: str) -> None:
        if not api_key:
            raise TranscriptionNotConfiguredError("ANTHROPIC_API_KEY is not configured.")
        self._api_key = api_key

    def transcribe(
        self,
        audio_bytes: bytes,
        mime_type: str,
        language_hint: Optional[str] = None,
        filename: str = "capture.webm",
    ) -> AudioTranscriptionResult:
        if mime_type not in SUPPORTED_MIME_TYPES:
            raise UnsupportedAudioFormatError(f"Unsupported: {mime_type}")

        import base64
        import anthropic

        audio_b64 = base64.b64encode(audio_bytes).decode()
        # Map mime types for Claude
        claude_media = mime_type
        if mime_type == "audio/x-wav":
            claude_media = "audio/wav"

        lang_name = {"es": "Spanish", "en": "English", "fr": "French", "ar": "Arabic"}.get(
            (language_hint or "es").lower(), "Spanish"
        )

        client = anthropic.Anthropic(api_key=self._api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "audio",
                        "source": {"type": "base64", "media_type": claude_media, "data": audio_b64},
                    },
                    {
                        "type": "text",
                        "text": f"Transcribe this audio recording exactly as spoken. The speaker is a maintenance technician describing an equipment failure in {lang_name}. Return ONLY the transcription text, nothing else.",
                    },
                ],
            }],
        )

        text = response.content[0].text.strip()
        logger.info("Claude transcription: %d chars, lang=%s", len(text), language_hint or "es")

        return AudioTranscriptionResult(
            text=text,
            language_detected=language_hint or "es",
            duration_seconds=None,
            confidence=0.9,
        )


def get_transcription_service():
    """Factory: tries OpenAI Whisper first, falls back to Claude for transcription."""
    from api.config import settings

    # Try OpenAI Whisper first
    if getattr(settings, 'OPENAI_API_KEY', None):
        try:
            return TranscriptionService(api_key=settings.OPENAI_API_KEY, model=settings.WHISPER_MODEL)
        except Exception:
            pass

    # Fallback to Claude
    anthropic_key = getattr(settings, 'ANTHROPIC_API_KEY', None) or __import__('os').environ.get('ANTHROPIC_API_KEY', '')
    if anthropic_key:
        return ClaudeTranscriptionService(api_key=anthropic_key)

    raise TranscriptionNotConfiguredError(
        "Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY configured. Set one to enable voice transcription."
    )
