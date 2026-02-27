"""
Validation script for validate-quality skill.
Verifies that validation results are properly formatted and complete.
"""
import json
import sys


VALID_SEVERITIES = {"ERROR", "WARNING", "INFO"}

KNOWN_RULE_PREFIXES = {
    "H-": "Hierarchy",
    "F-": "Function",
    "C-": "Criticality",
    "FM-": "Failure Mode",
    "T-": "Task",
    "WP-": "Work Package",
}


def validate_results(results: list[dict]) -> dict:
    """Validate a list of ValidationResult objects for proper formatting.

    Args:
        results: List of dicts with keys: rule_id, severity, message, entity_id

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    if not results:
        info.append("No validation results to check (empty list)")
        return {"valid": True, "errors": errors, "warnings": warnings, "info": info}

    error_count = 0
    warning_count = 0
    info_count = 0

    for i, r in enumerate(results):
        # Check required fields
        if "rule_id" not in r:
            errors.append(f"Result {i+1}: missing rule_id")
        if "severity" not in r:
            errors.append(f"Result {i+1}: missing severity")
        elif r["severity"] not in VALID_SEVERITIES:
            errors.append(
                f"Result {i+1}: invalid severity '{r['severity']}' "
                f"(expected: {VALID_SEVERITIES})"
            )
        if "message" not in r:
            errors.append(f"Result {i+1}: missing message")

        # Count by severity
        severity = r.get("severity", "")
        if severity == "ERROR":
            error_count += 1
        elif severity == "WARNING":
            warning_count += 1
        elif severity == "INFO":
            info_count += 1

        # Check rule_id prefix
        rule_id = r.get("rule_id", "")
        known = any(rule_id.startswith(prefix) for prefix in KNOWN_RULE_PREFIXES)
        if rule_id and not known:
            warnings.append(
                f"Result {i+1}: rule_id '{rule_id}' does not match any known prefix"
            )

    info.append(
        f"Summary: {error_count} errors, {warning_count} warnings, {info_count} info "
        f"across {len(results)} results"
    )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "error_count": error_count,
        "warning_count": warning_count,
        "info_count": info_count,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <results_json>")
        print("  results_json: JSON array of ValidationResult objects")
        sys.exit(1)

    results = json.loads(sys.argv[1])
    output = validate_results(results)
    print(json.dumps(output, indent=2))
