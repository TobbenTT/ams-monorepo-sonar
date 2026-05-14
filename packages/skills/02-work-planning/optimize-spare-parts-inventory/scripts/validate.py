"""
Validation script for optimize-spare-parts-inventory skill.
Verifies classifications, stock calculations, and inventory summary.
"""
import json
import sys
import math


def validate_inventory_analysis(analysis: dict) -> dict:
    """Validate a spare parts inventory analysis result.

    Args:
        analysis: dict with keys: plant_id, total_parts, results (list),
                  total_inventory_value, recommended_reduction_pct

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    # Top-level validation
    if not analysis.get("plant_id"):
        errors.append("Missing plant_id")
    if analysis.get("total_parts", 0) == 0:
        warnings.append("No parts in analysis")

    reduction_pct = analysis.get("recommended_reduction_pct", 0)
    if reduction_pct > 100:
        errors.append(f"Reduction percentage {reduction_pct}% exceeds 100% cap")
    if reduction_pct < 0:
        errors.append(f"Reduction percentage {reduction_pct}% is negative")

    results = analysis.get("results", [])

    valid_ved = {"VITAL", "ESSENTIAL", "DESIRABLE"}
    valid_fsn = {"FAST_MOVING", "SLOW_MOVING", "NON_MOVING"}
    valid_abc = {"A_HIGH", "B_MEDIUM", "C_LOW"}

    for part in results:
        part_id = part.get("part_id", "unknown")

        # VED validation
        ved = part.get("ved_class", "")
        if ved not in valid_ved:
            errors.append(f"Part {part_id}: invalid VED class '{ved}'")

        # FSN validation
        fsn = part.get("fsn_class", "")
        if fsn not in valid_fsn:
            errors.append(f"Part {part_id}: invalid FSN class '{fsn}'")

        # ABC validation
        abc = part.get("abc_class", "")
        if abc not in valid_abc:
            errors.append(f"Part {part_id}: invalid ABC class '{abc}'")

        # Score validation
        score = part.get("criticality_score", -1)
        if score < 0 or score > 100:
            errors.append(f"Part {part_id}: score {score} out of range [0, 100]")

        # Stock level validation
        min_stock = part.get("recommended_min_stock", 0)
        max_stock = part.get("recommended_max_stock", 0)
        reorder = part.get("reorder_point", 0)

        if max_stock < min_stock:
            errors.append(
                f"Part {part_id}: max_stock ({max_stock}) < min_stock ({min_stock})"
            )
        if reorder < min_stock:
            warnings.append(
                f"Part {part_id}: reorder_point ({reorder}) < min_stock ({min_stock})"
            )

        # Zero-demand check
        daily = part.get("daily_consumption", 0) if "daily_consumption" in part else None
        if daily is not None and daily <= 0:
            if min_stock != 0 or max_stock != 0:
                errors.append(
                    f"Part {part_id}: zero demand but non-zero stock levels"
                )

    info.append(f"Validated {len(results)} parts for plant {analysis.get('plant_id')}")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "total_parts": len(results),
        "reduction_pct": reduction_pct,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <analysis_json>")
        print("  analysis_json: JSON object of inventory analysis result")
        sys.exit(1)

    analysis = json.loads(sys.argv[1])
    result = validate_inventory_analysis(analysis)
    print(json.dumps(result, indent=2))
