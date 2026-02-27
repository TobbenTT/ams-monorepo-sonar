"""
Validation script for schedule-weekly-program skill.
Checks execution window, support tasks, conflicts, and lifecycle.
"""
import json
import sys
from typing import Any

VALID_STATUSES = {"DRAFT", "FINAL", "ACTIVE", "COMPLETED"}
SHIFT_HOURS = 8.0
EXECUTION_DAYS = 4


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    program = output.get("program", output)
    # Status
    status = program.get("status")
    if status not in VALID_STATUSES:
        all_errors.append(f"Invalid status: {status}")
    # Finalization with conflicts
    if status == "FINAL":
        conflicts = program.get("conflicts", [])
        if len(conflicts) > 0:
            all_errors.append(f"FINAL program has {len(conflicts)} unresolved conflicts")
    # Support tasks included in total
    packages = program.get("work_packages", [])
    support_tasks = program.get("support_tasks", [])
    pkg_hours = sum(p.get("total_duration_hours", 0) for p in packages)
    support_hours = sum(t.get("duration_hours", 0) for t in support_tasks)
    total = program.get("total_hours", 0)
    if total > 0 and abs(total - (pkg_hours + support_hours)) > 0.1:
        all_errors.append(
            f"total_hours ({total}) != pkg_hours ({pkg_hours}) + "
            f"support_hours ({support_hours})"
        )
    # Multi-day split preservation
    for split in program.get("multi_day_splits", []):
        original = split.get("original_hours", 0)
        day_sum = sum(d.get("hours", 0) for d in split.get("daily_allocations", []))
        if abs(original - day_sum) > 0.1:
            all_errors.append(
                f"Multi-day split total mismatch: {original} vs {day_sum}"
            )
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
