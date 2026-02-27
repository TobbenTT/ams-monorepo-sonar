"""MCP tool wrappers for CAPAEngine."""

import json
from datetime import date
from agents.tool_wrappers.registry import tool
from tools.engines.capa_engine import CAPAEngine
from tools.models.schemas import CAPAItem, CAPAType, CAPAStatus, PDCAPhase


@tool(
    "create_capa",
    "Create a new CAPA item (Corrective or Preventive Action). Returns the CAPA with OPEN status and PLAN phase.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_capa(input_json: str) -> str:
    data = json.loads(input_json)
    capa_type = CAPAType(data["capa_type"])
    target = date.fromisoformat(data["target_date"]) if data.get("target_date") else None
    result = CAPAEngine.create_capa(
        capa_type=capa_type,
        title=data["title"],
        description=data["description"],
        plant_id=data["plant_id"],
        source=data["source"],
        assigned_to=data.get("assigned_to", ""),
        equipment_id=data.get("equipment_id"),
        target_date=target,
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "advance_capa_phase",
    "Advance CAPA to next PDCA phase (PLAN→DO→CHECK→ACT). Returns updated CAPA and status message.",
    {"type": "object", "properties": {"capa_json": {"type": "string"}, "target_phase": {"type": "string"}}, "required": ["capa_json", "target_phase"]},
)
def advance_capa_phase(capa_json: str, target_phase: str) -> str:
    capa = CAPAItem(**json.loads(capa_json))
    phase = PDCAPhase(target_phase)
    updated, message = CAPAEngine.advance_phase(capa, phase)
    return json.dumps({"capa": updated.model_dump(), "message": message}, default=str)


@tool(
    "update_capa_status",
    "Update CAPA status (OPEN→IN_PROGRESS→CLOSED→VERIFIED). Returns updated CAPA and status message.",
    {"type": "object", "properties": {"capa_json": {"type": "string"}, "new_status": {"type": "string"}, "effectiveness_verified": {"type": "boolean"}}, "required": ["capa_json", "new_status"]},
)
def update_capa_status(capa_json: str, new_status: str, effectiveness_verified: bool = False) -> str:
    capa = CAPAItem(**json.loads(capa_json))
    status = CAPAStatus(new_status)
    updated, message = CAPAEngine.update_status(capa, status, effectiveness_verified)
    return json.dumps({"capa": updated.model_dump(), "message": message}, default=str)


@tool(
    "add_capa_action",
    "Add an action item to a CAPA. Returns updated CAPA.",
    {"type": "object", "properties": {"capa_json": {"type": "string"}, "action": {"type": "string"}, "completed": {"type": "boolean"}}, "required": ["capa_json", "action"]},
)
def add_capa_action(capa_json: str, action: str, completed: bool = False) -> str:
    capa = CAPAItem(**json.loads(capa_json))
    updated = CAPAEngine.add_action(capa, action, completed)
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "set_capa_root_cause",
    "Set the root cause analysis result on a CAPA.",
    {"type": "object", "properties": {"capa_json": {"type": "string"}, "root_cause": {"type": "string"}}, "required": ["capa_json", "root_cause"]},
)
def set_capa_root_cause(capa_json: str, root_cause: str) -> str:
    capa = CAPAItem(**json.loads(capa_json))
    updated = CAPAEngine.set_root_cause(capa, root_cause)
    return json.dumps(updated.model_dump(), default=str)


@tool(
    "check_capa_overdue",
    "Check if a CAPA is past its target date.",
    {"type": "object", "properties": {"capa_json": {"type": "string"}, "reference_date": {"type": "string"}}, "required": ["capa_json"]},
)
def check_capa_overdue(capa_json: str, reference_date: str = "") -> str:
    capa = CAPAItem(**json.loads(capa_json))
    ref = date.fromisoformat(reference_date) if reference_date else None
    overdue = CAPAEngine.is_overdue(capa, ref)
    return json.dumps({"overdue": overdue, "capa_id": capa.capa_id})


@tool(
    "get_capa_summary",
    "Get summary statistics for a list of CAPAs (counts by status, type, phase, overdue).",
    {"type": "object", "properties": {"capas_json": {"type": "string"}, "reference_date": {"type": "string"}}, "required": ["capas_json"]},
)
def get_capa_summary(capas_json: str, reference_date: str = "") -> str:
    capas = [CAPAItem(**c) for c in json.loads(capas_json)]
    ref = date.fromisoformat(reference_date) if reference_date else None
    result = CAPAEngine.get_summary(capas, ref)
    return json.dumps(result, default=str)
