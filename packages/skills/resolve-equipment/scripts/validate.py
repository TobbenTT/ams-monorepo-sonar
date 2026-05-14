"""
Validation script for resolve-equipment skill.
Verifies resolution results meet confidence thresholds and data integrity.
"""
import json
import sys
import re


def validate_resolution(result: dict | None, input_text: str = "") -> dict:
    """Validate an equipment resolution result.

    Args:
        result: ResolutionResult dict with keys:
            equipment_id, equipment_tag, confidence, method, alternatives
            Or None if resolution failed.
        input_text: The original input text for context.

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    if result is None:
        errors.append(
            f"Resolution failed for input '{input_text}'. "
            "Operator must manually select equipment."
        )
        return {
            "valid": False,
            "errors": errors,
            "warnings": warnings,
            "info": info,
        }

    # Validate required fields
    for field in ("equipment_id", "equipment_tag", "confidence", "method"):
        if field not in result or result[field] is None:
            errors.append(f"Missing required field: {field}")

    if errors:
        return {"valid": False, "errors": errors, "warnings": warnings, "info": info}

    confidence = result.get("confidence", 0)
    method = result.get("method", "")
    tag = result.get("equipment_tag", "")

    # TAG format validation
    tag_pattern = r"^[A-Z]{2,5}-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}$"
    if tag and not re.match(tag_pattern, tag):
        warnings.append(
            f"Equipment tag '{tag}' does not match standard format "
            f"(pattern: {tag_pattern})"
        )

    # Confidence thresholds
    if confidence < 0.30:
        errors.append(
            f"Confidence {confidence} is below auto-reject threshold (0.30). "
            "Manual input required."
        )
    elif confidence < 0.70:
        warnings.append(
            f"Confidence {confidence} requires mandatory human review."
        )
    elif confidence < 0.90:
        info.append(
            f"Confidence {confidence} is acceptable with optional review."
        )

    # Method validation
    valid_methods = ("EXACT_MATCH", "ALIAS_MATCH", "FUZZY_MATCH", "HIERARCHY_SEARCH")
    if method not in valid_methods:
        errors.append(f"Invalid method '{method}'. Expected one of: {valid_methods}")

    # Alternatives check for fuzzy methods
    if method in ("FUZZY_MATCH", "HIERARCHY_SEARCH"):
        alts = result.get("alternatives", [])
        if len(alts) > 3:
            warnings.append(
                f"Too many alternatives ({len(alts)}). Maximum is 3."
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "confidence": confidence,
        "method": method,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <result_json> [input_text]")
        print('  result_json: JSON object of ResolutionResult (or "null" if failed)')
        print("  input_text: Original input text for context")
        sys.exit(1)

    result_str = sys.argv[1]
    result = None if result_str.lower() == "null" else json.loads(result_str)
    input_text = sys.argv[2] if len(sys.argv) > 2 else ""
    validation = validate_resolution(result, input_text)
    print(json.dumps(validation, indent=2))
