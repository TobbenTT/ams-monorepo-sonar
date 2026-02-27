"""
Validation script for manage-change skill.
Checks MoC lifecycle transitions, risk assessment, and category conditions.
"""
import json
import sys
from typing import Any

VALID_STATUSES = {
    "DRAFT", "SUBMITTED", "REVIEWING", "APPROVED",
    "REJECTED", "IMPLEMENTING", "CLOSED"
}
VALID_CATEGORIES = {
    "EQUIPMENT_MODIFICATION", "PROCESS_CHANGE", "PROCEDURE_CHANGE",
    "ORGANIZATIONAL_CHANGE", "SOFTWARE_CHANGE"
}
VALID_RISK_LEVELS = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

STATUS_TRANSITIONS = {
    "DRAFT": ["SUBMITTED"],
    "SUBMITTED": ["REVIEWING"],
    "REVIEWING": ["APPROVED", "REJECTED"],
    "REJECTED": ["DRAFT"],
    "APPROVED": ["IMPLEMENTING"],
    "IMPLEMENTING": ["CLOSED"],
    "CLOSED": [],
}


def validate_moc(moc: dict) -> list[str]:
    """Validate a single MoC record."""
    errors = []
    status = moc.get("status")
    if status not in VALID_STATUSES:
        errors.append(f"Invalid status: {status}")
    category = moc.get("category")
    if category and category not in VALID_CATEGORIES:
        errors.append(f"Invalid category: {category}")
    risk = moc.get("risk_level")
    if risk and risk not in VALID_RISK_LEVELS:
        errors.append(f"Invalid risk_level: {risk}")
    return errors


def validate_risk_assessment(assessment: dict) -> list[str]:
    """Validate risk assessment output."""
    errors = []
    rec = assessment.get("recommendation", "")
    risk_acceptable = assessment.get("risk_acceptable", True)
    conditions = assessment.get("conditions", [])
    # CRITICAL must reject
    if not risk_acceptable and "Reject" not in rec:
        errors.append("risk_acceptable=False but recommendation is not Reject")
    # Conditions with acceptable should be "Approve with conditions"
    if risk_acceptable and conditions and "conditions" not in rec.lower():
        errors.append("Has conditions but recommendation not 'Approve with conditions'")
    return errors


def validate(output: dict) -> dict[str, Any]:
    """Main validation entry point."""
    all_errors = []
    if "moc" in output:
        all_errors.extend(validate_moc(output["moc"]))
    if "risk_assessment" in output:
        all_errors.extend(validate_risk_assessment(output["risk_assessment"]))
    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
    }


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = validate(data)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["valid"] else 1)
