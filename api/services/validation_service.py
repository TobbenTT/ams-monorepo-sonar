"""Validation service — wraps QualityValidator and ConfidenceValidator."""

from tools.validators.quality_validator import QualityValidator, ValidationResult
from tools.validators.confidence_validator import ConfidenceValidator
from tools.models.schemas import PlantHierarchyNode, FailureMode, MaintenanceTask, WorkPackage, CriticalityAssessment


def run_full_validation(data: dict) -> dict:
    """Run all applicable quality validation rules on provided data."""
    results: list[ValidationResult] = []

    if "nodes" in data:
        nodes = [PlantHierarchyNode(**n) for n in data["nodes"]]
        results.extend(QualityValidator.validate_hierarchy(nodes))

    if "failure_modes" in data:
        fms = [FailureMode(**fm) for fm in data["failure_modes"]]
        results.extend(QualityValidator.validate_failure_modes(fms))

    if "tasks" in data:
        tasks = [MaintenanceTask(**t) for t in data["tasks"]]
        results.extend(QualityValidator.validate_tasks(tasks))

    if "work_packages" in data and "tasks" in data:
        wps = [WorkPackage(**wp) for wp in data["work_packages"]]
        tasks = [MaintenanceTask(**t) for t in data["tasks"]]
        results.extend(QualityValidator.validate_work_packages(wps, tasks))

    errors = [r for r in results if r.severity == "ERROR"]
    warnings = [r for r in results if r.severity == "WARNING"]

    return {
        "total_findings": len(results),
        "errors": len(errors),
        "warnings": len(warnings),
        "has_errors": len(errors) > 0,
        "findings": [
            {"rule_id": r.rule_id, "severity": r.severity, "message": r.message, "entity_id": r.entity_id}
            for r in results
        ],
    }


def evaluate_confidence(entity_type: str, confidence: float) -> dict:
    review_level = ConfidenceValidator.evaluate(entity_type, confidence)
    return {
        "entity_type": entity_type,
        "confidence": confidence,
        "review_level": review_level.value,
    }
