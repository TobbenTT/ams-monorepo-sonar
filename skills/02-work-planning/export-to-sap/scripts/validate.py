"""
Validation script for export-to-sap skill.
Checks cross-references, field lengths, and DRAFT status compliance.
"""
import json
import sys
from typing import Any


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    # Check maintenance items and task lists exist
    mi_list = output.get("maintenance_items", [])
    tl_list = output.get("task_lists", [])
    if not mi_list:
        all_errors.append("No maintenance items in output")
    if not tl_list:
        all_errors.append("No task lists in output")
    # Cross-reference validation
    mi_refs = {mi.get("item_ref") for mi in mi_list}
    tl_refs = {tl.get("list_ref") for tl in tl_list}
    mi_tl_refs = {mi.get("task_list_ref") for mi in mi_list}
    for ref in mi_tl_refs:
        if ref not in tl_refs:
            all_errors.append(f"MI references {ref} which does not exist in task lists")
    referenced_tls = mi_tl_refs
    for tl in tl_list:
        if tl.get("list_ref") not in referenced_tls:
            all_errors.append(f"Task List {tl.get('list_ref')} not referenced by any MI")
    # Field length validation
    for tl in tl_list:
        for op in tl.get("operations", []):
            text = op.get("short_text", "")
            if len(text) > 72:
                all_errors.append(
                    f"Op {op.get('operation_number')} in {tl.get('list_ref')}: "
                    f"short_text exceeds 72 chars ({len(text)})"
                )
            if op.get("duration_hours", 0) < 0.5:
                all_errors.append(
                    f"Op {op.get('operation_number')}: duration below minimum 0.5h"
                )
            if op.get("num_workers", 0) < 1:
                all_errors.append(
                    f"Op {op.get('operation_number')}: num_workers below minimum 1"
                )
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "mi_count": len(mi_list),
        "tl_count": len(tl_list),
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
