"""Visual Comparison Service — Compare 3D reference renders with field photos.

Uses Gemma 4 (via Ollama) or Claude to analyze differences between:
- A reference 3D render showing ideal equipment condition
- A field photograph showing actual current condition

Returns structured deviation reports for maintenance decision-making.
"""

import base64
import json
import logging
import time
from typing import Optional

from api.config import settings

log = logging.getLogger("ocp_maintenance")

_COMPARISON_SYSTEM = """You are an expert industrial maintenance inspector performing visual comparison analysis.

You are given two images:
1. REFERENCE IMAGE: A 3D rendered model of equipment in IDEAL condition (no defects, no wear)
2. FIELD PHOTO: A real photograph of the SAME equipment type taken by a field technician

Compare the two images and identify ALL deviations between the reference (ideal) and the field photo (actual).

IMPORTANT: Respond ONLY with valid JSON, no markdown or explanations.

{
  "equipment_type": "Type of equipment identified",
  "overall_condition": "GOOD | ACCEPTABLE | DEGRADED | CRITICAL",
  "match_confidence": 0.85,
  "deviations": [
    {
      "id": 1,
      "type": "CORROSION | WEAR | DAMAGE | MISALIGNMENT | MISSING_PART | LEAK | CONTAMINATION | DEFORMATION",
      "location": "Where on the equipment (e.g. 'shaft seal area', 'bearing housing', 'impeller')",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "description": "Detailed description of the deviation",
      "recommended_action": "What maintenance action is recommended",
      "estimated_urgency": "IMMEDIATE | WITHIN_7_DAYS | NEXT_SHUTDOWN | MONITOR"
    }
  ],
  "areas_inspected": ["List of areas that were visually inspectable"],
  "areas_not_visible": ["List of areas that could not be assessed from the photo angle"],
  "summary": "One paragraph summary of the equipment condition"
}

RULES:
- Be specific about locations on the equipment
- Only report deviations you can actually SEE in the field photo
- If the field photo shows the equipment from a different angle than the reference, note which areas could not be compared
- Use severity consistently: CRITICAL = immediate safety risk, HIGH = production impact, MEDIUM = scheduled repair, LOW = cosmetic/monitor
"""

_WO_VERIFICATION_SYSTEM = """You are an expert industrial maintenance inspector verifying work order completion.

You are given two images:
1. BEFORE IMAGE: Photo of equipment BEFORE maintenance was performed
2. AFTER IMAGE: Photo of equipment AFTER maintenance was completed

Verify that the maintenance work was done correctly by comparing the two images.

IMPORTANT: Respond ONLY with valid JSON, no markdown or explanations.

{
  "verification_result": "PASS | PARTIAL | FAIL",
  "confidence": 0.85,
  "checks_performed": [
    {
      "check": "Description of what was verified",
      "result": "PASS | FAIL | INCONCLUSIVE",
      "observation": "What was observed"
    }
  ],
  "improvements_detected": ["List of visible improvements from before to after"],
  "remaining_issues": ["List of issues still visible after maintenance"],
  "cleanliness": "CLEAN | ACCEPTABLE | NEEDS_CLEANUP",
  "tool_marks_or_damage": "Any signs of improper tool use or new damage",
  "summary": "One paragraph verification summary"
}
"""


def compare_reference_vs_field(
    reference_image_b64: str,
    field_photo_b64: str,
    equipment_type: str = "",
    *,
    provider: str = "auto",
) -> dict:
    """Compare a 3D reference render against a field photo.

    Returns structured deviation report.
    """
    from api.services.ai_provider_service import analyze_image

    prompt = f"Compare these two images of {equipment_type or 'industrial equipment'}. "
    prompt += "Image 1 is the REFERENCE (3D render, ideal condition). "
    prompt += "Image 2 is the FIELD PHOTO (actual condition). "
    prompt += "Identify all deviations. Return JSON only."

    return analyze_image(
        images_base64=[reference_image_b64, field_photo_b64],
        system_prompt=_COMPARISON_SYSTEM,
        user_prompt=prompt,
        provider=provider,
    )


def verify_work_order_completion(
    before_image_b64: str,
    after_image_b64: str,
    work_order_description: str = "",
    checklist_items: list[str] | None = None,
    *,
    provider: str = "auto",
) -> dict:
    """Verify work order completion by comparing before/after photos.

    Returns structured verification report.
    """
    from api.services.ai_provider_service import analyze_image

    prompt = "Compare these two images. "
    prompt += "Image 1 is BEFORE maintenance. Image 2 is AFTER maintenance. "
    if work_order_description:
        prompt += f"Work performed: {work_order_description}. "
    if checklist_items:
        prompt += "Checklist items to verify: " + "; ".join(checklist_items) + ". "
    prompt += "Verify the work was done correctly. Return JSON only."

    system = _WO_VERIFICATION_SYSTEM
    if checklist_items:
        system += "\n\nSPECIFIC CHECKLIST TO VERIFY:\n"
        for i, item in enumerate(checklist_items, 1):
            system += f"{i}. {item}\n"

    return analyze_image(
        images_base64=[before_image_b64, after_image_b64],
        system_prompt=system,
        user_prompt=prompt,
        provider=provider,
    )
