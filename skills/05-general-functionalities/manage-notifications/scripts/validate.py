"""
Validation script for manage-notifications skill.
Checks notification structure, severity levels, and count consistency.
"""
import json
import sys
from typing import Any

VALID_LEVELS = {"CRITICAL", "WARNING", "INFO"}
VALID_TYPES = {
    "RBI_OVERDUE", "KPI_BREACH", "EQUIPMENT_RISK",
    "BACKLOG_AGING", "CAPA_OVERDUE", "MOC_OVERDUE"
}


def validate_notification(notif: dict, index: int) -> list[str]:
    """Validate a single notification."""
    errors = []
    level = notif.get("level")
    if level not in VALID_LEVELS:
        errors.append(f"Notification {index}: invalid level '{level}'")
    ntype = notif.get("type")
    if ntype not in VALID_TYPES:
        errors.append(f"Notification {index}: invalid type '{ntype}'")
    if not notif.get("title"):
        errors.append(f"Notification {index}: missing title")
    if not notif.get("message"):
        errors.append(f"Notification {index}: missing message")
    # CAPA_OVERDUE must be CRITICAL
    if ntype == "CAPA_OVERDUE" and level != "CRITICAL":
        errors.append(f"Notification {index}: CAPA_OVERDUE must be CRITICAL, got {level}")
    # MOC_OVERDUE must be WARNING
    if ntype == "MOC_OVERDUE" and level != "WARNING":
        errors.append(f"Notification {index}: MOC_OVERDUE must be WARNING, got {level}")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    notifications = output.get("notifications", [])
    for i, n in enumerate(notifications):
        all_errors.extend(validate_notification(n, i))
    # Count consistency
    total = output.get("total_notifications", 0)
    critical = output.get("critical_count", 0)
    warning = output.get("warning_count", 0)
    info = output.get("info_count", 0)
    if total != critical + warning + info:
        all_errors.append(
            f"Count mismatch: total({total}) != "
            f"critical({critical}) + warning({warning}) + info({info})"
        )
    if total != len(notifications):
        all_errors.append(
            f"total_notifications({total}) != len(notifications)({len(notifications)})"
        )
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "total": total,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
