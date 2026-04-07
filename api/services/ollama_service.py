"""Ollama Service — Local AI inference via Ollama REST API (Gemma 4).

Provides text generation, chat, and vision analysis using locally-hosted
models through Ollama. Designed as a drop-in alternative to Claude API
for offline/edge deployment scenarios.
"""

import base64
import json
import logging
import re
from pathlib import Path
from typing import Optional

import httpx

from api.config import settings

log = logging.getLogger("ocp_maintenance")

# ---------------------------------------------------------------------------
# Ollama REST API client
# ---------------------------------------------------------------------------


class OllamaClient:
    """Thin async/sync wrapper around the Ollama HTTP API."""

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        timeout: int | None = None,
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.timeout = timeout or settings.OLLAMA_TIMEOUT

    # -- health / discovery ---------------------------------------------------

    def health_check(self) -> bool:
        """Return True if Ollama is reachable and has models loaded."""
        try:
            r = httpx.get(
                f"{self.base_url}/api/tags",
                timeout=5,
            )
            return r.status_code == 200
        except Exception:
            return False

    def list_models(self) -> list[dict]:
        """Return list of models available in the local Ollama instance."""
        try:
            r = httpx.get(f"{self.base_url}/api/tags", timeout=10)
            r.raise_for_status()
            return r.json().get("models", [])
        except Exception as exc:
            log.warning("ollama list_models failed: %s", exc)
            return []

    # -- text generation ------------------------------------------------------

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        system: str | None = None,
        images: list[str] | None = None,
        temperature: float = 0.3,
        format_json: bool = False,
    ) -> dict:
        """Single-turn generation (POST /api/generate).

        Parameters
        ----------
        prompt : str
            User prompt text.
        model : str, optional
            Override the default model.
        system : str, optional
            System prompt.
        images : list[str], optional
            List of base64-encoded images.
        temperature : float
            Sampling temperature (default 0.3 for deterministic output).
        format_json : bool
            If True, request JSON-only output from the model.
        """
        payload: dict = {
            "model": model or self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if system:
            payload["system"] = system
        if images:
            payload["images"] = images
        if format_json:
            payload["format"] = "json"

        r = httpx.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=self.timeout,
        )
        r.raise_for_status()
        return r.json()

    # -- multi-turn chat ------------------------------------------------------

    def chat(
        self,
        messages: list[dict],
        *,
        model: str | None = None,
        system: str | None = None,
        temperature: float = 0.3,
        format_json: bool = False,
    ) -> dict:
        """Multi-turn chat (POST /api/chat).

        Each message: {"role": "user"|"assistant"|"system", "content": str, "images": [base64...]}
        """
        if system:
            messages = [{"role": "system", "content": system}] + messages

        payload: dict = {
            "model": model or self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if format_json:
            payload["format"] = "json"

        r = httpx.post(
            f"{self.base_url}/api/chat",
            json=payload,
            timeout=self.timeout,
        )
        r.raise_for_status()
        return r.json()

    # -- vision analysis (convenience) ----------------------------------------

    def analyze_image(
        self,
        image_data: bytes | str,
        prompt: str = "Describe what you see in this image",
        *,
        system: str | None = None,
        model: str | None = None,
        format_json: bool = True,
    ) -> dict:
        """Analyze a single image using the vision-capable model.

        Parameters
        ----------
        image_data : bytes | str
            Raw image bytes or a base64-encoded string.
        prompt : str
            Analysis instruction.
        system : str, optional
            System prompt with domain-specific instructions.
        model : str, optional
            Override the model (e.g. "gemma4:26b").
        format_json : bool
            Request JSON output (default True for structured analysis).

        Returns
        -------
        dict with keys: "response" (raw text), "parsed" (dict if JSON parseable)
        """
        if isinstance(image_data, bytes):
            img_b64 = base64.b64encode(image_data).decode("utf-8")
        else:
            img_b64 = image_data

        result = self.generate(
            prompt=prompt,
            model=model,
            system=system,
            images=[img_b64],
            format_json=format_json,
        )

        raw_text = result.get("response", "")
        parsed = _try_parse_json(raw_text)

        return {
            "response": raw_text,
            "parsed": parsed,
            "model": result.get("model", self.model),
            "eval_duration_ms": result.get("eval_duration", 0) // 1_000_000,
            "tokens_evaluated": result.get("eval_count", 0),
        }

    def analyze_multiple_images(
        self,
        images: list[bytes | str],
        prompt: str,
        *,
        system: str | None = None,
        model: str | None = None,
        format_json: bool = True,
    ) -> dict:
        """Analyze multiple images in a single request."""
        encoded = []
        for img in images:
            if isinstance(img, bytes):
                encoded.append(base64.b64encode(img).decode("utf-8"))
            else:
                encoded.append(img)

        result = self.generate(
            prompt=prompt,
            model=model,
            system=system,
            images=encoded,
            format_json=format_json,
        )

        raw_text = result.get("response", "")
        return {
            "response": raw_text,
            "parsed": _try_parse_json(raw_text),
            "model": result.get("model", self.model),
            "eval_duration_ms": result.get("eval_duration", 0) // 1_000_000,
            "tokens_evaluated": result.get("eval_count", 0),
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _try_parse_json(text: str) -> dict | None:
    """Attempt to extract and parse JSON from model output."""
    # Try direct parse first
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass

    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        pass

    return None


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_client: OllamaClient | None = None


def get_ollama_client() -> OllamaClient:
    """Get or create the module-level OllamaClient singleton."""
    global _client
    if _client is None:
        _client = OllamaClient()
    return _client
