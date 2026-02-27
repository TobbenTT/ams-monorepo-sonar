"""
Validation script for group-backlog skill.
Checks structural and business rule compliance of grouped backlog output.
"""
import json
import sys
from typing import Any


def validate_group(group: dict) -> list[str]:
    """Validate a single work package group."""
    errors = []
    if not group.get("group_id"):
        errors.append("Missing group_id")
    if not group.get("items") or len(group["items"]) < 2:
        errors.append(f"Group {group.get('group_id', '?')} has fewer than 2 items")
    if group.get("total_hours", 0) <= 0:
        errors.append(f"Group {group.get('group_id', '?')} has non-positive total_hours")
    # Validate group_id prefix
    gid = group.get("group_id", "")
    valid_prefixes = ("GRP-EQ-", "GRP-AREA-", "GRP-SD-")
    if not any(gid.startswith(p) for p in valid_prefixes):
        errors.append(f"Invalid group_id prefix: {gid}")
    return errors


def validate_no_duplicate_items(groups: list[dict]) -> list[str]:
    """Ensure no backlog item appears in more than one group."""
    errors = []
    seen = set()
    for g in groups:
        for item in g.get("items", []):
            bid = item.get("backlog_id", item) if isinstance(item, dict) else item
            if bid in seen:
                errors.append(f"Duplicate item {bid} across groups")
            seen.add(bid)
    return errors


def validate_stratification(strat: dict) -> list[str]:
    """Validate stratification summary structure."""
    errors = []
    required_keys = ["by_priority", "by_shutdown", "by_materials", "by_area", "total", "total_hours", "schedulable_now"]
    for key in required_keys:
        if key not in strat:
            errors.append(f"Missing stratification key: {key}")
    if strat.get("total", 0) < 0:
        errors.append("Negative total in stratification")
    if strat.get("total_hours", 0) < 0:
        errors.append("Negative total_hours in stratification")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    groups = output.get("groups", [])
    for g in groups:
        all_errors.extend(validate_group(g))
    all_errors.extend(validate_no_duplicate_items(groups))
    if "stratification" in output:
        all_errors.extend(validate_stratification(output["stratification"]))
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "groups_count": len(groups),
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
