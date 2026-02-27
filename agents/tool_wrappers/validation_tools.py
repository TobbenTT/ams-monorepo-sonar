"""MCP tool wrappers for QualityValidator, ConfidenceValidator, NamingValidator."""

import json
from agents.tool_wrappers.registry import tool
from tools.validators.quality_validator import QualityValidator
from tools.validators.confidence_validator import ConfidenceValidator
from tools.validators.naming_validator import NamingValidator
from tools.models.schemas import (
    PlantHierarchyNode, Function, FunctionalFailure,
    CriticalityAssessment, FailureMode, MaintenanceTask, WorkPackage,
)


def _parse_list(json_str: str, cls):
    return [cls(**item) for item in json.loads(json_str)]


def _serialize_results(results) -> str:
    return json.dumps(
        [{"rule_id": r.rule_id, "severity": r.severity, "message": r.message, "entity_id": r.entity_id} for r in results],
        default=str,
    )


# --- QualityValidator ---

@tool(
    "validate_hierarchy",
    "Validate plant hierarchy nodes for completeness and structure.",
    {"type": "object", "properties": {"nodes_json": {"type": "string"}}, "required": ["nodes_json"]},
)
def validate_hierarchy(nodes_json: str) -> str:
    nodes = _parse_list(nodes_json, PlantHierarchyNode)
    return _serialize_results(QualityValidator.validate_hierarchy(nodes))


@tool(
    "validate_functions",
    "Validate functions and functional failures against hierarchy nodes.",
    {"type": "object", "properties": {"nodes_json": {"type": "string"}, "functions_json": {"type": "string"}, "failures_json": {"type": "string"}}, "required": ["nodes_json", "functions_json", "failures_json"]},
)
def validate_functions(nodes_json: str, functions_json: str, failures_json: str) -> str:
    nodes = _parse_list(nodes_json, PlantHierarchyNode)
    funcs = _parse_list(functions_json, Function)
    failures = _parse_list(failures_json, FunctionalFailure)
    return _serialize_results(QualityValidator.validate_functions(nodes, funcs, failures))


@tool(
    "validate_criticality_data",
    "Validate criticality assessments against hierarchy nodes.",
    {"type": "object", "properties": {"nodes_json": {"type": "string"}, "assessments_json": {"type": "string"}}, "required": ["nodes_json", "assessments_json"]},
)
def validate_criticality_data(nodes_json: str, assessments_json: str) -> str:
    nodes = _parse_list(nodes_json, PlantHierarchyNode)
    assessments = _parse_list(assessments_json, CriticalityAssessment)
    return _serialize_results(QualityValidator.validate_criticality(nodes, assessments))


@tool(
    "validate_failure_modes",
    "Validate failure modes for completeness, naming conventions, and 72-combo constraint.",
    {"type": "object", "properties": {"failure_modes_json": {"type": "string"}}, "required": ["failure_modes_json"]},
)
def validate_failure_modes(failure_modes_json: str) -> str:
    fms = _parse_list(failure_modes_json, FailureMode)
    return _serialize_results(QualityValidator.validate_failure_modes(fms))


@tool(
    "validate_tasks",
    "Validate maintenance tasks against their failure modes.",
    {"type": "object", "properties": {"tasks_json": {"type": "string"}, "failure_modes_json": {"type": "string"}}, "required": ["tasks_json", "failure_modes_json"]},
)
def validate_tasks(tasks_json: str, failure_modes_json: str) -> str:
    tasks = _parse_list(tasks_json, MaintenanceTask)
    fms = _parse_list(failure_modes_json, FailureMode)
    return _serialize_results(QualityValidator.validate_tasks(tasks, fms))


@tool(
    "validate_work_packages",
    "Validate work packages for naming, structure, and task references.",
    {"type": "object", "properties": {"work_packages_json": {"type": "string"}, "tasks_json": {"type": "string"}}, "required": ["work_packages_json", "tasks_json"]},
)
def validate_work_packages(work_packages_json: str, tasks_json: str) -> str:
    wps = _parse_list(work_packages_json, WorkPackage)
    tasks = _parse_list(tasks_json, MaintenanceTask)
    return _serialize_results(QualityValidator.validate_work_packages(wps, tasks))


@tool(
    "validate_cross_entity",
    "Validate cross-entity relationships between failure modes and tasks.",
    {"type": "object", "properties": {"failure_modes_json": {"type": "string"}, "tasks_json": {"type": "string"}}, "required": ["failure_modes_json", "tasks_json"]},
)
def validate_cross_entity(failure_modes_json: str, tasks_json: str) -> str:
    fms = _parse_list(failure_modes_json, FailureMode)
    tasks = _parse_list(tasks_json, MaintenanceTask)
    return _serialize_results(QualityValidator.validate_cross_entity(fms, tasks))


@tool(
    "run_full_validation",
    "Run ALL validation rules across all entity types. Input: JSON with optional keys nodes, functions, functional_failures, criticality_assessments, failure_modes, tasks, work_packages.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def run_full_validation(input_json: str) -> str:
    data = json.loads(input_json)
    kwargs = {}
    if "nodes" in data:
        kwargs["nodes"] = [PlantHierarchyNode(**n) for n in data["nodes"]]
    if "functions" in data:
        kwargs["functions"] = [Function(**f) for f in data["functions"]]
    if "functional_failures" in data:
        kwargs["functional_failures"] = [FunctionalFailure(**ff) for ff in data["functional_failures"]]
    if "criticality_assessments" in data:
        kwargs["criticality_assessments"] = [CriticalityAssessment(**ca) for ca in data["criticality_assessments"]]
    if "failure_modes" in data:
        kwargs["failure_modes"] = [FailureMode(**fm) for fm in data["failure_modes"]]
    if "tasks" in data:
        kwargs["tasks"] = [MaintenanceTask(**t) for t in data["tasks"]]
    if "work_packages" in data:
        kwargs["work_packages"] = [WorkPackage(**wp) for wp in data["work_packages"]]
    results = QualityValidator.run_full_validation(**kwargs)
    return _serialize_results(results)


# --- ConfidenceValidator ---

@tool(
    "evaluate_confidence",
    "Evaluate a confidence score and determine if human review is needed.",
    {"type": "object", "properties": {"confidence": {"type": "number"}, "entity_type": {"type": "string"}}, "required": ["confidence"]},
)
def evaluate_confidence(confidence: float, entity_type: str = "default") -> str:
    from dataclasses import asdict
    result = ConfidenceValidator.evaluate(confidence, entity_type)
    return json.dumps(asdict(result), default=str)


@tool(
    "batch_evaluate_confidence",
    "Evaluate confidence scores for a batch of items. Input: JSON list of {id, confidence, entity_type}.",
    {"type": "object", "properties": {"items_json": {"type": "string"}}, "required": ["items_json"]},
)
def batch_evaluate_confidence(items_json: str) -> str:
    items = json.loads(items_json)
    result = ConfidenceValidator.batch_evaluate(items)
    return json.dumps(result, default=str)


# --- NamingValidator ---

@tool(
    "validate_wp_name",
    "Validate a work package name against naming conventions (40 chars, ALL CAPS, etc.).",
    {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},
)
def validate_wp_name(name: str) -> str:
    issues = NamingValidator.validate_wp_name(name)
    return json.dumps({"issues": issues, "valid": len(issues) == 0})


@tool(
    "validate_task_name",
    "Validate a maintenance task name against naming conventions (72 chars max).",
    {"type": "object", "properties": {"name": {"type": "string"}, "task_type": {"type": "string"}}, "required": ["name", "task_type"]},
)
def validate_task_name(name: str, task_type: str) -> str:
    issues = NamingValidator.validate_task_name(name, task_type)
    return json.dumps({"issues": issues, "valid": len(issues) == 0})


@tool(
    "validate_fm_what",
    "Validate a failure mode 'what' description (capital singular noun).",
    {"type": "object", "properties": {"what": {"type": "string"}}, "required": ["what"]},
)
def validate_fm_what(what: str) -> str:
    issues = NamingValidator.validate_fm_what(what)
    return json.dumps({"issues": issues, "valid": len(issues) == 0})
