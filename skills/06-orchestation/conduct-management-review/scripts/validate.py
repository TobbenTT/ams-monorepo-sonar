"""
Validation script for conduct-management-review skill.
Checks health trends, KPI trends, findings, and action generation.
"""
import json
import sys
from typing import Any

VALID_TRENDS = {"IMPROVING", "STABLE", "DEGRADING", "NO_DATA"}
MAX_FINDINGS = 5
MAX_LISTED_ITEMS = 3


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    review = output.get("review", output)
    # Health trend
    health_trend = review.get("health_trend")
    if health_trend not in VALID_TRENDS:
        all_errors.append(f"Invalid health_trend: {health_trend}")
    # KPI trends
    kpi_trends = review.get("kpi_trends", {})
    for kpi, trend in kpi_trends.items():
        if trend not in VALID_TRENDS:
            all_errors.append(f"Invalid KPI trend for {kpi}: {trend}")
    # Key findings count
    findings = review.get("key_findings", [])
    if len(findings) > MAX_FINDINGS:
        all_errors.append(f"Too many findings: {len(findings)} (max {MAX_FINDINGS})")
    # Recommended actions
    actions = review.get("recommended_actions", [])
    # Check listed items cap
    for action in actions:
        if "critical assets:" in action.lower():
            tags = action.split(":")[1].strip().split(",")
            if len(tags) > MAX_LISTED_ITEMS:
                all_errors.append(f"Critical assets action lists > {MAX_LISTED_ITEMS} items")
    # CAPA metrics
    if review.get("overdue_capas", 0) < 0:
        all_errors.append("Negative overdue_capas count")
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "health_trend": health_trend,
        "findings_count": len(findings),
        "actions_count": len(actions),
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
