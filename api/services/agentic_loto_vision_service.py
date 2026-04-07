"""Agentic LOTO Verification Service — CU-EXT-5.

Verifies Lockout/Tagout compliance by analyzing photos of isolation
points. Integrates as a safety gate in ExecutionChecklistModel.
FAIL-CLOSED: if AI is unavailable, the gate does NOT pass.
"""

import logging
import time
import uuid

from sqlalchemy.orm import Session

from api.services.ai_provider_service import analyze_image

log = logging.getLogger("ocp_maintenance")

# ---------------------------------------------------------------------------
# System prompt — LOTO verification specialist
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an industrial Lockout/Tagout (LOTO) safety verification AI.
Analyze the photo and verify that proper LOTO procedures are in place.

You MUST check the following 4 safety conditions:

1. LOCKS_VISIBLE — Are padlocks (red, yellow, or blue) visible on energy
   isolation devices (disconnects, breakers, valves)?
   Count the number of locks detected.

2. TAGS_VISIBLE — Are danger tags ("DANGER - DO NOT OPERATE" or equivalent
   in French/Arabic/Spanish) attached to the locks or isolation points?

3. INDICATORS_OFF — Are equipment power indicators, pilot lights, or pressure
   gauges showing a de-energized/depressurized state? (lights OFF, gauges at zero)

4. AREA_CLEAR — Is the work area clear of personnel in the danger zone?
   Are safety barriers, cones, or tape in place?

Rules:
- This is SAFETY-CRITICAL. When in doubt, report "passed": false.
- If a check CANNOT be determined from the photo (e.g., indicator panel not
  visible), mark confidence as LOW and passed as false.
- The overall loto_verified is true ONLY if ALL 4 checks pass with
  confidence >= 0.80.
- Report the count of locks detected.

Respond ONLY with valid JSON. Schema:

{
  "loto_verified": bool,
  "overall_confidence": float,
  "locks_detected_count": int,
  "checks": [
    {"check": "LOCKS_VISIBLE", "passed": bool, "confidence": float, "count_detected": int, "notes": "string"},
    {"check": "TAGS_VISIBLE", "passed": bool, "confidence": float, "notes": "string"},
    {"check": "INDICATORS_OFF", "passed": bool, "confidence": float, "notes": "string"},
    {"check": "AREA_CLEAR", "passed": bool, "confidence": float, "notes": "string"}
  ],
  "blocking_issues": ["string", ...],
  "recommendation": "string"
}"""

_USER_PROMPT = "Verify the LOTO (Lockout/Tagout) state in this photo. Check for locks, tags, de-energized indicators, and area safety."

# Minimum confidence threshold for each check to pass
_CONFIDENCE_THRESHOLD = 0.80


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

def verify_loto_by_vision(
    db: Session,
    image_base64: str,
    checklist_id: str,
    *,
    equipment_tag: str = "",
    expected_lock_count: int | None = None,
    plant_id: str = "OCP-JFC1",
    technician_id: str = "",
    provider: str = "auto",
) -> dict:
    """Verify LOTO compliance from a photo. FAIL-CLOSED design.

    If the AI provider is unavailable, loto_verified is always False.
    """
    start = time.time()

    # Load checklist to get expected LOTO steps
    from api.database.models import ExecutionChecklistModel
    checklist = db.query(ExecutionChecklistModel).filter_by(checklist_id=checklist_id).first()
    if not checklist:
        return {
            "loto_verified": False,
            "error": f"Checklist {checklist_id} not found",
            "gate_passed": False,
        }

    # Derive expected lock count from loto_steps if not provided
    loto_steps = checklist.loto_steps or []
    if expected_lock_count is None and loto_steps:
        expected_lock_count = len(loto_steps)

    # --- AI analysis (fail-closed on error) ---
    result = analyze_image(
        images_base64=[image_base64],
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=_USER_PROMPT,
        provider=provider,
        equipment_tag=equipment_tag,
    )

    duration_ms = result.get("duration_ms", int((time.time() - start) * 1000))
    ai_provider = result.get("provider", "unknown")

    # FAIL-CLOSED: if AI returned an error, verification fails
    if result.get("error"):
        log.error("LOTO verification AI error (FAIL-CLOSED): %s", result["error"])
        _record_loto_result(db, checklist, False, [], "AI provider unavailable — fail-closed")
        _create_loto_alert(db, plant_id, technician_id, checklist_id, "AI provider unavailable")
        return {
            "loto_verified": False,
            "overall_confidence": 0.0,
            "error": result["error"],
            "checks": [],
            "blocking_issues": ["AI provider unavailable — manual verification required"],
            "recommendation": "AI verification unavailable. Perform manual LOTO verification with supervisor.",
            "provider": ai_provider,
            "duration_ms": duration_ms,
            "gate_passed": False,
        }

    suggestions = result.get("suggestions", {})
    checks = suggestions.get("checks", [])
    locks_detected = suggestions.get("locks_detected_count", 0)
    overall_confidence = suggestions.get("overall_confidence", 0.0)

    # Verify all checks pass with sufficient confidence
    all_passed = True
    blocking_issues = list(suggestions.get("blocking_issues", []))

    for check in checks:
        check_passed = check.get("passed", False)
        check_confidence = check.get("confidence", 0.0)
        if not check_passed or check_confidence < _CONFIDENCE_THRESHOLD:
            all_passed = False
            if not check_passed:
                blocking_issues.append(f"{check['check']}: FAILED - {check.get('notes', '')}")
            elif check_confidence < _CONFIDENCE_THRESHOLD:
                blocking_issues.append(
                    f"{check['check']}: Low confidence ({check_confidence:.0%}) - {check.get('notes', '')}"
                )

    # Verify lock count matches expectation
    if expected_lock_count and locks_detected < expected_lock_count:
        all_passed = False
        blocking_issues.append(
            f"Expected {expected_lock_count} locks, detected {locks_detected}"
        )

    loto_verified = all_passed

    # --- Record result on checklist ---
    _record_loto_result(db, checklist, loto_verified, checks, suggestions.get("recommendation", ""))

    # --- Alert if failed ---
    if not loto_verified:
        _create_loto_alert(db, plant_id, technician_id, checklist_id, "; ".join(blocking_issues[:3]))

    return {
        "loto_verified": loto_verified,
        "overall_confidence": overall_confidence,
        "locks_detected_count": locks_detected,
        "expected_lock_count": expected_lock_count,
        "checks": checks,
        "blocking_issues": blocking_issues,
        "recommendation": suggestions.get("recommendation", ""),
        "provider": ai_provider,
        "duration_ms": duration_ms,
        "gate_passed": loto_verified,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _record_loto_result(
    db: Session,
    checklist,
    verified: bool,
    checks: list,
    recommendation: str,
):
    """Record LOTO verification result on the ExecutionChecklist."""
    safety_items = checklist.safety_items or []
    safety_items.append({
        "type": "LOTO_VISION_CHECK",
        "verified": verified,
        "checks": checks,
        "recommendation": recommendation,
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })
    checklist.safety_items = safety_items

    if not verified:
        log.info("LOTO gate BLOCKED for checklist %s", checklist.checklist_id)

    try:
        db.commit()
    except Exception as e:
        log.error("Failed to record LOTO result: %s", e)
        db.rollback()


def _create_loto_alert(
    db: Session,
    plant_id: str,
    technician_id: str,
    checklist_id: str,
    reason: str,
):
    """Create a CRITICAL variance alert for LOTO failure."""
    from api.database.models import VarianceAlertModel

    try:
        alert = VarianceAlertModel(
            alert_id=str(uuid.uuid4()),
            plant_id=plant_id,
            plant_name=plant_id,
            metric_name="LOTO_VERIFICATION",
            plant_value=0.0,
            portfolio_mean=0.0,
            portfolio_std=0.0,
            z_score=0.0,
            variance_level="CRITICAL",
            message=f"LOTO verification FAILED for checklist {checklist_id}. "
                    f"Technician: {technician_id or 'unknown'}. Reason: {reason}",
        )
        db.add(alert)
        db.commit()
    except Exception as e:
        log.error("Failed to create LOTO alert: %s", e)
        db.rollback()
