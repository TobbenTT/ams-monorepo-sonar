"""
Validation script for calculate-planning-kpis skill.
Checks that all 11 KPIs are present with correct structure and health classification.
"""
import json
import sys
from typing import Any

EXPECTED_KPI_COUNT = 11
VALID_STATUSES = {"ON_TARGET", "BELOW_TARGET", "ABOVE_TARGET"}
VALID_HEALTH = {"HEALTHY", "AT_RISK", "CRITICAL"}


def validate_kpi(kpi: dict, index: int) -> list[str]:
    """Validate a single KPI entry."""
    errors = []
    if "name" not in kpi:
        errors.append(f"KPI {index}: missing 'name'")
    if "value" not in kpi:
        errors.append(f"KPI {index}: missing 'value'")
    if "target" not in kpi:
        errors.append(f"KPI {index}: missing 'target'")
    if kpi.get("status") not in VALID_STATUSES:
        errors.append(f"KPI {index}: invalid status '{kpi.get('status')}'")
    # Check rounding
    val = kpi.get("value")
    if val is not None and isinstance(val, float):
        if round(val, 1) != val:
            errors.append(f"KPI {index}: value {val} not rounded to 1 decimal")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    kpis = output.get("kpis", [])
    if len(kpis) != EXPECTED_KPI_COUNT:
        all_errors.append(f"Expected {EXPECTED_KPI_COUNT} KPIs, got {len(kpis)}")
    for i, kpi in enumerate(kpis):
        all_errors.extend(validate_kpi(kpi, i + 1))
    health = output.get("overall_health")
    if health not in VALID_HEALTH:
        all_errors.append(f"Invalid overall_health: '{health}'")
    on_target = output.get("on_target_count", -1)
    below_target = output.get("below_target_count", -1)
    if on_target + below_target != EXPECTED_KPI_COUNT and on_target >= 0:
        all_errors.append(f"on_target({on_target}) + below_target({below_target}) != {EXPECTED_KPI_COUNT}")
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "kpi_count": len(kpis),
        "overall_health": health,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
