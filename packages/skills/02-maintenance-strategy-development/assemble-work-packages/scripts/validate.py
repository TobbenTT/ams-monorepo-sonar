"""
Validation script for assemble-work-packages skill.
Checks element completeness, readiness logic, and WP name conventions.
"""
import json
import sys
from typing import Any

MANDATORY_ELEMENTS = [
    "WORK_INSTRUCTION", "SAFETY_PLAN", "RESOURCE_PLAN",
    "MATERIALS_LIST", "TOOLS_LIST", "QUALITY_CRITERIA", "DRAWINGS"
]
VALID_STATUSES = {"MISSING", "DRAFT", "READY", "EXPIRED"}
VALID_READINESS = {"READY", "PARTIAL", "NOT_STARTED", "BLOCKED"}


def validate_package(pkg: dict) -> list[str]:
    """Validate a single assembled work package."""
    errors = []
    # WP name
    name = pkg.get("name", "")
    if len(name) > 40:
        errors.append(f"WP name exceeds 40 chars: '{name}' ({len(name)})")
    if name != name.upper():
        errors.append(f"WP name not ALL CAPS: '{name}'")
    # Elements
    elements = pkg.get("elements", [])
    found_types = set()
    has_expired = False
    ready_count = 0
    for elem in elements:
        etype = elem.get("element_type")
        found_types.add(etype)
        status = elem.get("status", "")
        if status not in VALID_STATUSES:
            errors.append(f"Invalid element status: {status} for {etype}")
        if status == "READY":
            ready_count += 1
        if status == "EXPIRED":
            has_expired = True
    for req in MANDATORY_ELEMENTS:
        if req not in found_types:
            errors.append(f"Missing mandatory element: {req}")
    # Readiness
    overall = pkg.get("overall_readiness")
    if overall not in VALID_READINESS:
        errors.append(f"Invalid overall_readiness: {overall}")
    if has_expired and overall != "BLOCKED":
        errors.append("EXPIRED element present but overall_readiness is not BLOCKED")
    if ready_count == 7 and not has_expired and overall != "READY":
        errors.append("All elements READY but overall_readiness is not READY")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    packages = output.get("packages", [output]) if "packages" not in output else output["packages"]
    for pkg in (packages if isinstance(packages, list) else [packages]):
        all_errors.extend(validate_package(pkg))
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
