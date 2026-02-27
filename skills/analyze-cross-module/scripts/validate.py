"""
Validation script for analyze-cross-module skill.
Verifies CorrelationResult, BadActorOverlap, and CrossModuleSummary structures.
"""
import json
import sys


VALID_CORRELATION_TYPES = {
    "CRITICALITY_FAILURES",
    "COST_RELIABILITY",
    "HEALTH_BACKLOG",
}

VALID_STRENGTHS = {"STRONG", "MODERATE", "WEAK", "NONE"}


def validate_correlation_result(result: dict) -> list[str]:
    """Validate a single CorrelationResult."""
    errors = []

    ctype = result.get("correlation_type", "")
    if ctype not in VALID_CORRELATION_TYPES:
        errors.append(
            f"Invalid correlation_type: '{ctype}'. "
            f"Expected one of {VALID_CORRELATION_TYPES}"
        )

    coeff = result.get("coefficient")
    if coeff is None:
        errors.append("Missing 'coefficient' field")
    elif not isinstance(coeff, (int, float)):
        errors.append(f"Coefficient must be numeric, got {type(coeff).__name__}")
    elif coeff < -1.0 or coeff > 1.0:
        errors.append(f"Coefficient {coeff} out of range [-1.0, 1.0]")

    strength = result.get("strength", "")
    if strength not in VALID_STRENGTHS:
        errors.append(
            f"Invalid strength: '{strength}'. Expected one of {VALID_STRENGTHS}"
        )

    # Verify strength matches coefficient
    if isinstance(coeff, (int, float)) and strength in VALID_STRENGTHS:
        abs_coeff = abs(coeff)
        expected = (
            "STRONG" if abs_coeff >= 0.7
            else "MODERATE" if abs_coeff >= 0.4
            else "WEAK" if abs_coeff >= 0.2
            else "NONE"
        )
        if strength != expected:
            errors.append(
                f"Strength mismatch: coefficient={coeff} (|{abs_coeff}|) "
                f"should be {expected}, got {strength}"
            )

    data_points = result.get("data_points")
    if data_points is None:
        errors.append("Missing 'data_points' field")
    elif not isinstance(data_points, int) or data_points < 0:
        errors.append(f"data_points must be non-negative integer, got {data_points}")

    insight = result.get("insight", "")
    if not insight:
        errors.append("Missing or empty 'insight' field")

    return errors


def validate_bad_actor_overlap(overlap: dict) -> list[str]:
    """Validate a BadActorOverlap result."""
    errors = []

    total = overlap.get("total_unique_bad_actors")
    if total is None:
        errors.append("Missing 'total_unique_bad_actors'")
    elif not isinstance(total, int) or total < 0:
        errors.append(f"total_unique_bad_actors must be non-negative int, got {total}")

    # Check required list fields
    list_fields = [
        "jackknife_acute",
        "pareto_bad_actors",
        "rbi_high_risk",
        "overlap_all_three",
        "overlap_any_two",
        "priority_action_list",
    ]
    for field in list_fields:
        val = overlap.get(field)
        if val is None:
            errors.append(f"Missing '{field}' field")
        elif not isinstance(val, list):
            errors.append(f"'{field}' must be a list, got {type(val).__name__}")

    # Validate overlap consistency
    all_three = set(overlap.get("overlap_all_three", []))
    any_two = set(overlap.get("overlap_any_two", []))
    jk = set(overlap.get("jackknife_acute", []))
    pareto = set(overlap.get("pareto_bad_actors", []))
    rbi = set(overlap.get("rbi_high_risk", []))

    # all_three should be subset of each individual set
    if all_three and not all_three.issubset(jk & pareto & rbi):
        errors.append(
            "overlap_all_three contains equipment not present in all three analyses"
        )

    # any_two should not overlap with all_three
    if all_three & any_two:
        errors.append(
            "overlap_any_two should not contain items already in overlap_all_three"
        )

    # Verify total count
    all_unique = jk | pareto | rbi
    if isinstance(total, int) and total != len(all_unique):
        errors.append(
            f"total_unique_bad_actors ({total}) does not match "
            f"actual unique count ({len(all_unique)})"
        )

    # Priority action list should contain all unique bad actors
    priority = overlap.get("priority_action_list", [])
    if isinstance(priority, list) and set(priority) != all_unique:
        errors.append(
            "priority_action_list does not contain exactly all unique bad actors"
        )

    # Verify priority ordering: all_three first, then any_two, then single
    if isinstance(priority, list) and len(priority) > 0:
        all_three_list = sorted(all_three)
        any_two_list = sorted(any_two)
        single_only = all_unique - all_three - any_two
        single_list = sorted(single_only)
        expected_order = all_three_list + any_two_list + single_list
        if priority != expected_order:
            errors.append(
                "priority_action_list is not in correct priority order "
                "(all_three sorted, then any_two sorted, then single sorted)"
            )

    return errors


def validate_cross_module_summary(summary: dict) -> dict:
    """Validate a full CrossModuleSummary.

    Args:
        summary: dict with plant_id, correlations, bad_actor_overlap,
                 key_insights, recommended_actions

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    # Plant ID
    plant_id = summary.get("plant_id", "")
    if not plant_id:
        errors.append("Missing or empty 'plant_id'")

    # Correlations
    correlations = summary.get("correlations", [])
    if not isinstance(correlations, list):
        errors.append("'correlations' must be a list")
    else:
        for i, corr in enumerate(correlations):
            corr_errors = validate_correlation_result(corr)
            for err in corr_errors:
                errors.append(f"Correlation [{i}]: {err}")

        # Check for expected types
        types_found = {c.get("correlation_type") for c in correlations}
        for expected_type in VALID_CORRELATION_TYPES:
            if expected_type not in types_found:
                warnings.append(
                    f"Missing correlation type: {expected_type}"
                )

        info.append(f"Correlations found: {len(correlations)}")

    # Bad actor overlap
    overlap = summary.get("bad_actor_overlap")
    if overlap is None:
        warnings.append("No bad_actor_overlap in summary")
    elif isinstance(overlap, dict):
        overlap_errors = validate_bad_actor_overlap(overlap)
        for err in overlap_errors:
            errors.append(f"BadActorOverlap: {err}")

        total = overlap.get("total_unique_bad_actors", 0)
        info.append(f"Total unique bad actors: {total}")

    # Key insights
    insights = summary.get("key_insights", [])
    if not isinstance(insights, list):
        errors.append("'key_insights' must be a list")
    elif len(insights) == 0:
        warnings.append("No key insights generated")
    else:
        info.append(f"Key insights: {len(insights)}")

    # Recommended actions
    actions = summary.get("recommended_actions", [])
    if not isinstance(actions, list):
        errors.append("'recommended_actions' must be a list")
    elif len(actions) == 0:
        warnings.append("No recommended actions generated")
    else:
        info.append(f"Recommended actions: {len(actions)}")

    # Verify actions reference strong/moderate correlations
    strong_moderate = [
        c for c in correlations
        if isinstance(c, dict) and c.get("strength") in ("STRONG", "MODERATE")
    ]
    if strong_moderate and len(actions) == 0:
        warnings.append(
            f"{len(strong_moderate)} STRONG/MODERATE correlations found "
            "but no recommended actions generated"
        )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <cross_module_summary_json>")
        print("  cross_module_summary_json: JSON object of CrossModuleSummary")
        sys.exit(1)

    data = json.loads(sys.argv[1])
    output = validate_cross_module_summary(data)
    print(json.dumps(output, indent=2))
