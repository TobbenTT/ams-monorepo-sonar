"""
Validation script for import-data skill.
Verifies import results for completeness and correctness.
"""
import json
import sys
from datetime import date


def validate_import_result(result: dict) -> dict:
    """Validate an import result for correctness.

    Args:
        result: dict with keys: source, total_rows, valid_rows, error_rows,
                errors (list), validated_data (list)

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    # Basic structure
    if "source" not in result:
        errors.append("Missing 'source' field in import result")

    total = result.get("total_rows", 0)
    valid = result.get("valid_rows", 0)
    error_rows = result.get("error_rows", 0)

    # Row count consistency
    if valid + error_rows != total:
        errors.append(
            f"Row count mismatch: valid({valid}) + error({error_rows}) "
            f"!= total({total})"
        )

    # Validated data count
    validated = result.get("validated_data", [])
    if len(validated) != valid:
        warnings.append(
            f"validated_data length ({len(validated)}) does not match "
            f"valid_rows count ({valid})"
        )

    # Error structure validation
    import_errors = result.get("errors", [])
    for i, err in enumerate(import_errors):
        if "row" not in err:
            warnings.append(f"Import error {i+1}: missing 'row' field")
        elif err["row"] < 1:
            errors.append(
                f"Import error {i+1}: row number {err['row']} is < 1 "
                "(must be 1-based)"
            )
        if "column" not in err and "message" not in err:
            warnings.append(
                f"Import error {i+1}: missing both 'column' and 'message'"
            )

    # Source-specific checks
    source = result.get("source", "")
    if source == "FAILURE_HISTORY":
        for row in validated:
            fd = row.get("failure_date", "")
            if fd and isinstance(fd, str):
                try:
                    date.fromisoformat(fd[:10])
                except ValueError:
                    errors.append(f"Valid row has invalid date: '{fd}'")

    info.append(
        f"Import result: {valid}/{total} valid rows "
        f"({valid/max(total,1)*100:.1f}%), {len(import_errors)} errors"
    )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "valid_pct": round(valid / max(total, 1) * 100, 1),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <import_result_json>")
        print("  import_result_json: JSON object of ImportResult")
        sys.exit(1)

    result = json.loads(sys.argv[1])
    output = validate_import_result(result)
    print(json.dumps(output, indent=2))
