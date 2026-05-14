"""
Validation script for generate-reports skill.
Checks report structure, traffic lights, sections, and metadata.
"""
import json
import sys
from typing import Any

VALID_REPORT_TYPES = {"WEEKLY_MAINTENANCE", "MONTHLY_KPI", "QUARTERLY_REVIEW"}
VALID_TRAFFIC_LIGHTS = {"GREEN", "AMBER", "RED"}
VALID_TRENDS = {"IMPROVING", "DEGRADING", "STABLE"}


def validate_report(report: dict) -> list[str]:
    """Validate a single report."""
    errors = []
    # Metadata
    rtype = report.get("report_type")
    if rtype not in VALID_REPORT_TYPES:
        errors.append(f"Invalid report_type: {rtype}")
    if not report.get("plant_id"):
        errors.append("Missing plant_id")
    if not report.get("period_start"):
        errors.append("Missing period_start")
    if not report.get("period_end"):
        errors.append("Missing period_end")
    # Sections
    sections = report.get("sections", [])
    if len(sections) == 0:
        errors.append("Report has no sections")
    # Traffic lights (monthly)
    for key, value in report.get("traffic_lights", {}).items():
        if value not in VALID_TRAFFIC_LIGHTS:
            errors.append(f"Invalid traffic light '{value}' for {key}")
    # Trends
    for key, value in report.get("trends", {}).items():
        if value not in VALID_TRENDS:
            errors.append(f"Invalid trend '{value}' for {key}")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = validate_report(output)
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "report_type": output.get("report_type"),
        "sections_count": len(output.get("sections", [])),
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
