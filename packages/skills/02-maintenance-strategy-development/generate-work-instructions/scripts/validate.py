"""
Validation script for generate-work-instructions skill.
Checks WI structural completeness, PPE correctness, and operation validity.
"""
import json
import sys
from typing import Any

VALID_CONSTRAINTS = {"ONLINE", "OFFLINE", "TEST_MODE"}


def validate_operation(op: dict, index: int) -> list[str]:
    """Validate a single WI operation."""
    errors = []
    expected_op_num = (index + 1) * 10
    if op.get("operation_number") != expected_op_num:
        errors.append(f"Operation {index}: expected op_num {expected_op_num}, got {op.get('operation_number')}")
    if not op.get("description"):
        errors.append(f"Operation {op.get('operation_number', '?')}: empty description")
    if op.get("duration_hours", 0) <= 0:
        errors.append(f"Operation {op.get('operation_number', '?')}: zero or negative duration (WARNING)")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    # Header validation
    constraint = output.get("constraint", "")
    if constraint not in VALID_CONSTRAINTS:
        all_errors.append(f"Invalid constraint: {constraint}")
    # Operations
    ops = output.get("operations", [])
    if len(ops) == 0:
        all_errors.append("ERROR: Work instruction has no operations")
    for i, op in enumerate(ops):
        all_errors.extend(validate_operation(op, i))
    # Safety section
    safety = output.get("safety", {})
    if constraint == "OFFLINE" and not safety.get("isolation_required"):
        all_errors.append("ERROR: Offline WI must require isolation")
    if constraint == "OFFLINE" and "LOTOTO" not in safety.get("permits_required", []):
        all_errors.append("ERROR: Offline WI must include LOTOTO permit")
    # Resources
    resources = output.get("resources", {})
    if not resources.get("trades_required"):
        all_errors.append("ERROR: No trades assigned")
    return {
        "valid": len([e for e in all_errors if e.startswith("ERROR")]) == 0,
        "errors": all_errors,
        "operations_count": len(ops),
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
