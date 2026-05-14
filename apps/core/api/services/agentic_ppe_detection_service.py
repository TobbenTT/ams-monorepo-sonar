"""Agentic PPE Detection Service — CU-EXT-1.

Analyzes photos to detect correct Personal Protective Equipment (PPE)
usage: helmet, vest, gloves, safety glasses, boots, ear protection.
Integrates with ExecutionChecklistModel as a safety gate.
"""

import logging
import time
import uuid

from sqlalchemy.orm import Session

from api.services.ai_provider_service import analyze_image

log = logging.getLogger("ocp_maintenance")

# ---------------------------------------------------------------------------
# System prompt — PPE detection specialist
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an industrial safety PPE compliance inspector AI.
Analyze the provided photo and detect whether the worker(s) are wearing
the required Personal Protective Equipment (PPE).

You MUST detect the following 6 PPE categories:
1. HELMET — Hard hat / safety helmet (any color)
2. VEST — High-visibility reflective vest or jacket
3. GLOVES — Safety/work gloves
4. GLASSES — Safety glasses, goggles, or face shield
5. BOOTS — Steel-toe / safety boots (not sneakers or sandals)
6. EAR_PROTECTION — Earplugs, earmuffs, or hearing protection

For each item, report:
- "detected": true/false
- "confidence": 0.0 to 1.0
- "notes": brief observation

Rules:
- If you CANNOT determine whether an item is present (e.g., boots not visible
  because the photo is cropped above the waist), mark detected as false and
  confidence as 0.0 with a note explaining why.
- If multiple workers are visible, analyze the PRIMARY subject (closest/largest).
- Report person_count as the number of people visible.
- overall_compliant is true ONLY if ALL 6 items are detected with confidence >= 0.70.

Respond ONLY with valid JSON, no markdown, no explanation. Schema:

{
  "overall_compliant": bool,
  "confidence": float,
  "person_count": int,
  "items_detected": [
    {"item": "HELMET", "detected": bool, "confidence": float, "notes": "..."},
    {"item": "VEST", "detected": bool, "confidence": float, "notes": "..."},
    {"item": "GLOVES", "detected": bool, "confidence": float, "notes": "..."},
    {"item": "GLASSES", "detected": bool, "confidence": float, "notes": "..."},
    {"item": "BOOTS", "detected": bool, "confidence": float, "notes": "..."},
    {"item": "EAR_PROTECTION", "detected": bool, "confidence": float, "notes": "..."}
  ],
  "missing_items": ["ITEM_NAME", ...],
  "uncertain_items": ["ITEM_NAME", ...],
  "recommendation": "string"
}"""

_USER_PROMPT = "Analyze this photo for PPE compliance. Identify all PPE items worn by the worker(s)."

# Required PPE categories
_REQUIRED_PPE = {"HELMET", "VEST", "GLOVES", "GLASSES", "BOOTS", "EAR_PROTECTION"}


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

def detect_ppe(
    db: Session,
    image_base64: str,
    *,
    checklist_id: str | None = None,
    equipment_tag: str = "",
    plant_id: str = "OCP-JFC1",
    technician_id: str = "",
    provider: str = "auto",
) -> dict:
    """Detect PPE compliance from a photo.

    If checklist_id is provided, enforces the PPE gate on the
    linked ExecutionChecklistModel.
    """
    start = time.time()

    # --- AI analysis ---
    result = analyze_image(
        images_base64=[image_base64],
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=_USER_PROMPT,
        provider=provider,
        equipment_tag=equipment_tag,
    )

    suggestions = result.get("suggestions", {})
    duration_ms = result.get("duration_ms", int((time.time() - start) * 1000))
    ai_provider = result.get("provider", "unknown")

    # Normalise result
    items = suggestions.get("items_detected", [])
    missing = suggestions.get("missing_items", [])
    overall_compliant = suggestions.get("overall_compliant", False)
    confidence = suggestions.get("confidence", 0.0)

    # Derive missing if AI did not populate it
    if not missing and items:
        detected_names = {
            it["item"] for it in items if it.get("detected") and it.get("confidence", 0) >= 0.70
        }
        missing = sorted(_REQUIRED_PPE - detected_names)
        overall_compliant = len(missing) == 0

    # --- Checklist gate integration ---
    gate_applied = False
    gate_passed = overall_compliant
    if checklist_id:
        gate_applied, gate_passed = _apply_checklist_gate(
            db, checklist_id, overall_compliant, items, missing
        )

    # --- Supervisor alert on non-compliance ---
    if not overall_compliant:
        _create_ppe_alert(db, plant_id, technician_id, missing)

    return {
        "overall_compliant": overall_compliant,
        "confidence": confidence,
        "person_count": suggestions.get("person_count", 1),
        "items_detected": items,
        "missing_items": missing,
        "uncertain_items": suggestions.get("uncertain_items", []),
        "recommendation": suggestions.get("recommendation", ""),
        "provider": ai_provider,
        "duration_ms": duration_ms,
        "gate_applied": gate_applied,
        "gate_passed": gate_passed,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _apply_checklist_gate(
    db: Session,
    checklist_id: str,
    compliant: bool,
    items: list,
    missing: list,
) -> tuple[bool, bool]:
    """Update the ExecutionChecklist with PPE verification result."""
    from api.database.models import ExecutionChecklistModel

    checklist = db.query(ExecutionChecklistModel).filter_by(checklist_id=checklist_id).first()
    if not checklist:
        log.warning("PPE gate: checklist %s not found", checklist_id)
        return False, False

    # Read existing safety_items or initialise
    safety_items = checklist.safety_items or []
    safety_items.append({
        "type": "PPE_VISION_CHECK",
        "compliant": compliant,
        "items": items,
        "missing": missing,
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })
    checklist.safety_items = safety_items

    gate_passed = compliant
    if not gate_passed:
        log.info("PPE gate BLOCKED for checklist %s — missing: %s", checklist_id, missing)

    db.commit()
    return True, gate_passed


def _create_ppe_alert(db: Session, plant_id: str, technician_id: str, missing: list):
    """Create a variance alert for PPE non-compliance."""
    from api.database.models import VarianceAlertModel

    try:
        alert = VarianceAlertModel(
            alert_id=str(uuid.uuid4()),
            plant_id=plant_id,
            plant_name=plant_id,
            metric_name="PPE_COMPLIANCE",
            plant_value=0.0,
            portfolio_mean=0.0,
            portfolio_std=0.0,
            z_score=0.0,
            variance_level="HIGH",
            message=f"PPE non-compliance detected. Missing items: {', '.join(missing)}. "
                    f"Technician: {technician_id or 'unknown'}",
        )
        db.add(alert)
        db.commit()
    except Exception as e:
        log.error("Failed to create PPE alert: %s", e)
        db.rollback()
