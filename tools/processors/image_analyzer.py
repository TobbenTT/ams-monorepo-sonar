"""Image analysis service — wraps Anthropic Claude Vision API.

Analyzes industrial equipment photos to detect anomalies, identify components,
and assess visual severity. Used in the OCP field capture workflow.

Input: raw image bytes (JPG/PNG/WEBP)
Output: ImageAnalysis (anomalies_detected, component_identified, severity_visual)
"""

import base64
import json
import logging
import re
from typing import Optional

from tools.models.schemas import ImageAnalysis, VisualSeverity

logger = logging.getLogger(__name__)

# Supported image MIME types
SUPPORTED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}

_SYSTEM_PROMPT = """\
You are an industrial maintenance vision analyst for OCP (Office Chérifien des Phosphates),
a phosphate mining operation in Morocco. You analyze photos of plant equipment to support
field technicians in creating maintenance work requests.

When analyzing an equipment photo, identify:
1. The equipment component visible (e.g., pump, motor, belt, bearing, pipe, valve)
2. Any visible anomalies (e.g., corrosion, leakage, cracks, wear, overheating discoloration)
3. Visual severity based on what you see

Severity scale:
- HIGH: Critical defect requiring immediate action (visible fracture, active leakage, severe corrosion)
- MEDIUM: Significant defect requiring prompt attention (moderate wear, minor leaks, rust patches)
- LOW: Minor issue or preventive concern (surface rust, minor wear, slight discoloration)

Always respond with valid JSON only, no preamble or explanation. Format:
{
  "component_identified": "<component name or null>",
  "anomalies_detected": ["<anomaly 1>", "<anomaly 2>"],
  "severity_visual": "HIGH" | "MEDIUM" | "LOW"
}

If the image does not show industrial equipment, return:
{"component_identified": null, "anomalies_detected": [], "severity_visual": "LOW"}
"""


class ImageAnalysisService:
    """Analyzes industrial equipment images using Claude Vision.

    Usage:
        service = ImageAnalysisService(api_key="sk-ant-...")
        result = service.analyze(image_bytes, mime_type="image/jpeg", context_hint="SAG Mill bearing")
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6") -> None:
        if not api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY is required for image analysis. "
                "Set it in your .env file."
            )
        try:
            import anthropic
            self._client = anthropic.Anthropic(api_key=api_key)
        except ImportError as exc:
            raise RuntimeError(
                "anthropic package is not installed. Run: pip install anthropic>=0.39.0"
            ) from exc
        self._model = model

    def analyze(
        self,
        image_bytes: bytes,
        mime_type: str,
        context_hint: Optional[str] = None,
    ) -> ImageAnalysis:
        """Analyze an equipment image and return structured anomaly data.

        Args:
            image_bytes: Raw image content.
            mime_type: MIME type (e.g. "image/jpeg").
            context_hint: Optional context string (e.g. equipment TAG or description).

        Returns:
            ImageAnalysis with anomalies_detected, component_identified, severity_visual.
        """
        if mime_type not in SUPPORTED_IMAGE_TYPES:
            raise ValueError(
                f"Unsupported image format: {mime_type}. "
                f"Supported: {sorted(SUPPORTED_IMAGE_TYPES)}"
            )

        image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

        user_content: list = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mime_type,
                    "data": image_b64,
                },
            },
            {
                "type": "text",
                "text": (
                    f"Analyze this equipment photo{' for: ' + context_hint if context_hint else ''}. "
                    "Return JSON only."
                ),
            },
        ]

        logger.debug(
            "Analyzing image: %d bytes, mime=%s, model=%s",
            len(image_bytes),
            mime_type,
            self._model,
        )

        response = self._client.messages.create(
            model=self._model,
            max_tokens=512,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )

        raw_text = response.content[0].text.strip()
        return self._parse_response(raw_text)

    def _parse_response(self, raw: str) -> ImageAnalysis:
        """Parse Claude's JSON response into ImageAnalysis model."""
        # Strip markdown fences if present
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning("Could not parse image analysis JSON: %s", raw[:200])
            return ImageAnalysis(
                anomalies_detected=[],
                component_identified=None,
                severity_visual=VisualSeverity.LOW,
            )

        # Map severity string → VisualSeverity enum
        severity_raw = (data.get("severity_visual") or "LOW").upper()
        try:
            severity = VisualSeverity(severity_raw)
        except ValueError:
            severity = VisualSeverity.LOW

        anomalies = data.get("anomalies_detected") or []
        if not isinstance(anomalies, list):
            anomalies = [str(anomalies)]

        return ImageAnalysis(
            anomalies_detected=[str(a) for a in anomalies],
            component_identified=data.get("component_identified"),
            severity_visual=severity,
        )


def get_image_analysis_service() -> ImageAnalysisService:
    """Factory: creates ImageAnalysisService from app settings."""
    from api.config import settings
    return ImageAnalysisService(api_key=settings.ANTHROPIC_API_KEY)
