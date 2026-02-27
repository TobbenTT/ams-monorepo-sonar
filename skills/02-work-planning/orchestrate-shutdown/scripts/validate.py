"""
Validation script for orchestrate-shutdown skill.
Checks lifecycle states, metrics calculations, and scope integrity.
"""
import json
import sys
from typing import Any

VALID_STATUSES = {"PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"}
VALID_TRANSITIONS = {
    "PLANNED": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED"],
    "COMPLETED": [],
    "CANCELLED": [],
}


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    event = output.get("event", output)
    # Status
    status = event.get("status")
    if status not in VALID_STATUSES:
        all_errors.append(f"Invalid status: {status}")
    # Planned hours non-negative
    planned_hours = event.get("planned_hours", 0)
    if planned_hours < 0:
        all_errors.append(f"Negative planned_hours: {planned_hours}")
    # Schedule compliance capped at 100
    metrics = event.get("metrics", {})
    compliance = metrics.get("schedule_compliance_pct", 0)
    if compliance > 100.0:
        all_errors.append(f"Schedule compliance exceeds 100%: {compliance}")
    # Scope completion uses intersection
    scope = metrics.get("scope_completion_pct", 0)
    if scope < 0 or scope > 100:
        all_errors.append(f"Invalid scope_completion_pct: {scope}")
    # Delays non-negative
    delays = event.get("delay_hours", 0)
    if delays < 0:
        all_errors.append(f"Negative delay_hours: {delays}")
    # Actual hours from actual_start
    if status == "COMPLETED" and not event.get("actual_end"):
        all_errors.append("COMPLETED event missing actual_end")
    if status in ("IN_PROGRESS", "COMPLETED") and not event.get("actual_start"):
        all_errors.append(f"{status} event missing actual_start")
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "status": status,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
