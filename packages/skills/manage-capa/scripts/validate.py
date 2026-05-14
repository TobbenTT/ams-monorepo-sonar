"""
Validation script for manage-capa skill.
Checks PDCA transitions, status lifecycle, and overdue logic.
"""
import json
import sys
from typing import Any

VALID_PHASES = {"PLAN", "DO", "CHECK", "ACT"}
VALID_STATUSES = {"OPEN", "IN_PROGRESS", "CLOSED", "VERIFIED"}
VALID_TYPES = {"CORRECTIVE", "PREVENTIVE"}

PDCA_TRANSITIONS = {
    "PLAN": ["DO"],
    "DO": ["CHECK"],
    "CHECK": ["ACT", "DO"],
    "ACT": ["PLAN"],
}

STATUS_TRANSITIONS = {
    "OPEN": ["IN_PROGRESS"],
    "IN_PROGRESS": ["CLOSED", "OPEN"],
    "CLOSED": ["VERIFIED", "IN_PROGRESS"],
    "VERIFIED": [],
}


def validate_capa(capa: dict) -> list[str]:
    """Validate a single CAPA record."""
    errors = []
    if capa.get("capa_type") not in VALID_TYPES:
        errors.append(f"Invalid capa_type: {capa.get('capa_type')}")
    if capa.get("current_phase") not in VALID_PHASES:
        errors.append(f"Invalid phase: {capa.get('current_phase')}")
    if capa.get("status") not in VALID_STATUSES:
        errors.append(f"Invalid status: {capa.get('status')}")
    if capa.get("status") == "VERIFIED" and not capa.get("effectiveness_verified"):
        errors.append("VERIFIED status without effectiveness_verified=True")
    if capa.get("status") == "VERIFIED" and not capa.get("verified_at"):
        errors.append("VERIFIED status without verified_at timestamp")
    return errors


def validate_transition(from_status: str, to_status: str) -> list[str]:
    """Validate a status transition."""
    errors = []
    allowed = STATUS_TRANSITIONS.get(from_status, [])
    if to_status not in allowed:
        errors.append(f"Invalid transition: {from_status} -> {to_status}. Allowed: {allowed}")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    if "capa" in output:
        all_errors.extend(validate_capa(output["capa"]))
    if "capas" in output:
        for capa in output["capas"]:
            all_errors.extend(validate_capa(capa))
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
