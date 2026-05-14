"""AI Provider Service — Unified abstraction over Claude (cloud) and Ollama (local).

Routes AI requests to the appropriate backend based on configuration,
connectivity, and explicit provider selection. Supports transparent
fallback from Claude to Ollama when the cloud API is unavailable.
"""

import base64
import json
import logging
import os
import re
import time
from enum import Enum
from typing import Optional

from api.config import settings

log = logging.getLogger("ocp_maintenance")


class AIProvider(str, Enum):
    CLAUDE = "claude"
    OLLAMA = "ollama"
    AUTO = "auto"


# ---------------------------------------------------------------------------
# Provider resolution
# ---------------------------------------------------------------------------

def _claude_available() -> bool:
    """Check if Claude API key is configured."""
    return bool(os.getenv("ANTHROPIC_API_KEY", ""))


def _ollama_available() -> bool:
    """Check if local Ollama instance is reachable."""
    from api.services.ollama_service import get_ollama_client
    return get_ollama_client().health_check()


def resolve_provider(requested: str = "auto") -> AIProvider:
    """Resolve which provider to use based on request and availability.

    - "claude": use Claude (fail if unavailable)
    - "ollama": use Ollama (fail if unavailable)
    - "auto": try Claude first, fall back to Ollama
    """
    requested = requested.lower()

    if requested == AIProvider.CLAUDE:
        return AIProvider.CLAUDE
    if requested == AIProvider.OLLAMA:
        return AIProvider.OLLAMA

    # AUTO: prefer Claude, fall back to Ollama
    if _claude_available():
        return AIProvider.CLAUDE
    if _ollama_available():
        return AIProvider.OLLAMA

    # Nothing available — return Claude as default (will produce a clear error)
    log.warning("No AI provider available (no API key, no Ollama)")
    return AIProvider.CLAUDE


# ---------------------------------------------------------------------------
# Unified image analysis
# ---------------------------------------------------------------------------

def analyze_image(
    images_base64: list[str],
    system_prompt: str,
    user_prompt: str,
    *,
    provider: str = "auto",
    equipment_tag: str = "",
    additional_context: str = "",
    db=None,
) -> dict:
    """Analyze images using either Claude Vision or Ollama Gemma 4.

    Returns a normalized dict with: suggestions, confidence, source, provider, duration_ms.
    """
    resolved = resolve_provider(provider)
    start = time.time()

    if resolved == AIProvider.CLAUDE:
        return _analyze_with_claude(
            images_base64, system_prompt, user_prompt,
            equipment_tag=equipment_tag,
            additional_context=additional_context,
            db=db,
        )
    else:
        return _analyze_with_ollama(
            images_base64, system_prompt, user_prompt,
            equipment_tag=equipment_tag,
            additional_context=additional_context,
        )


def _analyze_with_claude(
    images_base64: list[str],
    system_prompt: str,
    user_prompt: str,
    *,
    equipment_tag: str = "",
    additional_context: str = "",
    db=None,
) -> dict:
    """Route analysis through Anthropic Claude Vision API."""
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY not configured", "suggestions": {}, "provider": "claude"}

    start = time.time()

    content = []
    for img_b64 in images_base64:
        media_type, raw = _parse_image_b64(img_b64)
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": raw},
        })
    content.append({"type": "text", "text": user_prompt})

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": "user", "content": content}],
        )
        raw_text = response.content[0].text.strip()
        duration_ms = int((time.time() - start) * 1000)

        parsed = _extract_json(raw_text)
        return {
            "suggestions": parsed or {},
            "confidence": 0.85,
            "source": "vision_ai",
            "provider": "claude",
            "duration_ms": duration_ms,
            "images_count": len(images_base64),
        }
    except Exception as e:
        log.error("Claude vision error: %s", e)
        return {"error": str(e), "suggestions": {}, "provider": "claude"}


def _analyze_with_ollama(
    images_base64: list[str],
    system_prompt: str,
    user_prompt: str,
    *,
    equipment_tag: str = "",
    additional_context: str = "",
) -> dict:
    """Route analysis through local Ollama (Gemma 4)."""
    from api.services.ollama_service import get_ollama_client

    client = get_ollama_client()
    start = time.time()

    # Strip data URI prefix for Ollama
    clean_images = []
    for img_b64 in images_base64:
        if img_b64.startswith("data:"):
            _, raw = img_b64.split(",", 1)
            clean_images.append(raw)
        else:
            clean_images.append(img_b64)

    try:
        result = client.analyze_multiple_images(
            images=clean_images,
            prompt=user_prompt,
            system=system_prompt,
            format_json=True,
        )

        duration_ms = int((time.time() - start) * 1000)
        parsed = result.get("parsed") or {}

        return {
            "suggestions": parsed,
            "confidence": 0.75,  # slightly lower confidence for local model
            "source": "vision_ai",
            "provider": "ollama",
            "model": result.get("model", settings.OLLAMA_MODEL),
            "duration_ms": duration_ms,
            "images_count": len(images_base64),
            "tokens_evaluated": result.get("tokens_evaluated", 0),
        }
    except Exception as e:
        log.error("Ollama vision error: %s", e)
        return {"error": str(e), "suggestions": {}, "provider": "ollama"}


# ---------------------------------------------------------------------------
# Unified text generation
# ---------------------------------------------------------------------------

def generate_text(
    prompt: str,
    system_prompt: str = "",
    *,
    provider: str = "auto",
    format_json: bool = False,
) -> dict:
    """Generate text using either Claude or Ollama.

    Returns: {"text": str, "parsed": dict|None, "provider": str, "duration_ms": int}
    """
    resolved = resolve_provider(provider)
    start = time.time()

    if resolved == AIProvider.CLAUDE:
        return _generate_with_claude(prompt, system_prompt, format_json=format_json)
    else:
        return _generate_with_ollama(prompt, system_prompt, format_json=format_json)


def _generate_with_claude(prompt: str, system_prompt: str, *, format_json: bool = False) -> dict:
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"text": "", "error": "ANTHROPIC_API_KEY not configured", "provider": "claude"}

    start = time.time()
    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=system_prompt or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = response.content[0].text.strip()
        duration_ms = int((time.time() - start) * 1000)
        return {
            "text": raw_text,
            "parsed": _extract_json(raw_text) if format_json else None,
            "provider": "claude",
            "duration_ms": duration_ms,
        }
    except Exception as e:
        log.error("Claude text generation error: %s", e)
        return {"text": "", "error": str(e), "provider": "claude"}


def _generate_with_ollama(prompt: str, system_prompt: str, *, format_json: bool = False) -> dict:
    from api.services.ollama_service import get_ollama_client

    client = get_ollama_client()
    start = time.time()
    try:
        result = client.generate(
            prompt=prompt,
            system=system_prompt or None,
            format_json=format_json,
        )
        raw_text = result.get("response", "")
        duration_ms = int((time.time() - start) * 1000)
        return {
            "text": raw_text,
            "parsed": _extract_json(raw_text) if format_json else None,
            "provider": "ollama",
            "model": result.get("model", settings.OLLAMA_MODEL),
            "duration_ms": duration_ms,
        }
    except Exception as e:
        log.error("Ollama text generation error: %s", e)
        return {"text": "", "error": str(e), "provider": "ollama"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_image_b64(img_b64: str) -> tuple[str, str]:
    """Extract media type and raw base64 from a potentially data-URI-prefixed string."""
    media_type = "image/jpeg"
    if img_b64.startswith("data:"):
        header, img_b64 = img_b64.split(",", 1)
        if "png" in header:
            media_type = "image/png"
        elif "webp" in header:
            media_type = "image/webp"
        elif "gif" in header:
            media_type = "image/gif"
    return media_type, img_b64


def _extract_json(text: str) -> dict | None:
    """Extract JSON from model output, stripping markdown fences if present."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass

    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        pass

    return None
