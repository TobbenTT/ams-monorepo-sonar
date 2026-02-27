"""
Validation script for suggest-materials skill.
Verifies material suggestions meet T-16 rules and confidence thresholds.
"""
import json
import sys


def validate_suggestions(suggestions: list[dict], task_type: str = "REPLACE") -> dict:
    """Validate a list of material suggestions against T-16 and confidence rules.

    Args:
        suggestions: List of MaterialSuggestion dicts with keys:
            material_code, description, quantity, reason, confidence
        task_type: The maintenance task type (REPLACE, INSPECT, CHECK, TEST)

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    # T-16: REPLACE tasks MUST have at least one material
    if task_type == "REPLACE" and len(suggestions) == 0:
        errors.append("T-16: Replacement task has no materials assigned")

    # INFO: INSPECT/CHECK/TEST tasks with materials
    if task_type in ("INSPECT", "CHECK", "TEST") and len(suggestions) > 0:
        info.append(
            f"INFO: {task_type} task has {len(suggestions)} materials -- "
            "verify this is intentional"
        )

    for i, s in enumerate(suggestions):
        conf = s.get("confidence", 0)

        # Confidence gating
        if conf < 0.40:
            errors.append(
                f"Suggestion {i+1} ('{s.get('description', '')}') has confidence "
                f"{conf} < 0.40 -- cannot auto-assign, requires manual input"
            )
        elif conf == 0.40:
            warnings.append(
                f"Suggestion {i+1} ('{s.get('description', '')}') is generic "
                f"(confidence=0.40) -- mandatory human review"
            )

        # Material code completeness
        if conf >= 0.70 and not s.get("material_code"):
            warnings.append(
                f"Suggestion {i+1} ('{s.get('description', '')}') has no "
                "material_code -- must resolve before SAP upload"
            )

        # Quantity check
        if s.get("quantity", 0) <= 0:
            errors.append(
                f"Suggestion {i+1} ('{s.get('description', '')}') has invalid "
                f"quantity: {s.get('quantity')}"
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "total_suggestions": len(suggestions),
        "high_confidence": sum(1 for s in suggestions if s.get("confidence", 0) >= 0.95),
        "medium_confidence": sum(
            1 for s in suggestions if 0.60 <= s.get("confidence", 0) < 0.95
        ),
        "low_confidence": sum(1 for s in suggestions if s.get("confidence", 0) < 0.60),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <suggestions_json> [task_type]")
        print('  suggestions_json: JSON array of MaterialSuggestion objects')
        print('  task_type: REPLACE | INSPECT | CHECK | TEST (default: REPLACE)')
        sys.exit(1)

    suggestions = json.loads(sys.argv[1])
    task_type = sys.argv[2] if len(sys.argv) > 2 else "REPLACE"
    result = validate_suggestions(suggestions, task_type)
    print(json.dumps(result, indent=2))
