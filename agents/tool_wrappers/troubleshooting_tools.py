"""MCP tool wrappers for TroubleshootingEngine."""

import json

from agents.tool_wrappers.registry import tool
from tools.engines.troubleshooting_engine import TroubleshootingEngine


@tool(
    "create_troubleshooting_session",
    "Create a new diagnostic troubleshooting session for an equipment type. Returns session with ID, status, and empty symptom/test lists.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_troubleshooting_session(input_json: str) -> str:
    data = json.loads(input_json)
    session = TroubleshootingEngine.create_session(
        equipment_type_id=data["equipment_type_id"],
        equipment_tag=data.get("equipment_tag", ""),
        plant_id=data.get("plant_id", ""),
        technician_id=data.get("technician_id", ""),
    )
    return json.dumps(session.model_dump(), default=str)


@tool(
    "add_troubleshooting_symptom",
    "Add a symptom to an active troubleshooting session. Re-ranks candidate diagnoses based on all symptoms. Returns updated session with candidates.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def add_troubleshooting_symptom(input_json: str) -> str:
    data = json.loads(input_json)
    session_data = data["session"]
    from tools.models.schemas import DiagnosisSession
    session = DiagnosisSession.model_validate(session_data)
    updated = TroubleshootingEngine.add_symptom(
        session=session,
        description=data["description"],
        category=data.get("category", ""),
        severity=data.get("severity", "MEDIUM"),
    )
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "get_recommended_diagnostic_tests",
    "Get the next recommended diagnostic tests for a troubleshooting session, ordered by minimum cost first. Excludes tests already performed.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def get_recommended_diagnostic_tests(input_json: str) -> str:
    data = json.loads(input_json)
    from tools.models.schemas import DiagnosticPath
    candidates = [DiagnosticPath.model_validate(c) for c in data["candidates"]]
    tests_done = data.get("tests_performed", [])
    tests = TroubleshootingEngine.get_recommended_tests(
        candidates=candidates,
        tests_already_performed=tests_done,
    )
    return json.dumps([t.model_dump() for t in tests], default=str)


@tool(
    "record_troubleshooting_test_result",
    "Record the result of a diagnostic test (NORMAL/ABNORMAL/INCONCLUSIVE). Updates confidence scores for candidate diagnoses.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def record_troubleshooting_test_result(input_json: str) -> str:
    data = json.loads(input_json)
    from tools.models.schemas import DiagnosisSession
    session = DiagnosisSession.model_validate(data["session"])
    updated = TroubleshootingEngine.record_test_result(
        session=session,
        test_id=data["test_id"],
        result=data["result"],
        measured_value=data.get("measured_value", ""),
    )
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "get_equipment_troubleshooting_info",
    "Get known symptoms and decision tree availability for an equipment type. Useful for presenting symptom options to the technician.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def get_equipment_troubleshooting_info(input_json: str) -> str:
    data = json.loads(input_json)
    equipment_type_id = data["equipment_type_id"]
    symptoms = TroubleshootingEngine.get_equipment_symptoms(equipment_type_id)
    tree = TroubleshootingEngine.get_decision_tree(equipment_type_id)
    return json.dumps({
        "equipment_type_id": equipment_type_id,
        "known_symptoms": symptoms,
        "has_decision_tree": tree is not None,
        "tree_categories": list(tree.get("entry_nodes", {}).keys()) if tree else [],
    }, default=str)
