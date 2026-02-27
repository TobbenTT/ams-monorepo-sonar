"""MCP tool wrappers for FMECA Engine (Phase 7 — G18)."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.fmeca_engine import FMECAEngine
from tools.models.schemas import FMECAWorksheet


@tool(
    "create_fmeca_worksheet",
    "Create a new FMECA worksheet for an equipment item. Input: {equipment_id, equipment_tag, equipment_name, analyst}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_fmeca_worksheet(input_json: str) -> str:
    data = json.loads(input_json)
    result = FMECAEngine.create_worksheet(
        equipment_id=data["equipment_id"],
        equipment_tag=data.get("equipment_tag", ""),
        equipment_name=data.get("equipment_name", ""),
        analyst=data.get("analyst", ""),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "calculate_rpn",
    "Calculate Risk Priority Number from Severity x Occurrence x Detection. Input: {severity: 1-10, occurrence: 1-10, detection: 1-10}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_rpn(input_json: str) -> str:
    data = json.loads(input_json)
    result = FMECAEngine.calculate_rpn(
        severity=data["severity"],
        occurrence=data["occurrence"],
        detection=data["detection"],
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "generate_fmeca_summary",
    "Generate summary statistics for a FMECA worksheet including RPN distribution, top risks, and recommendations.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_fmeca_summary(input_json: str) -> str:
    data = json.loads(input_json)
    worksheet = FMECAWorksheet(**data)
    result = FMECAEngine.generate_summary(worksheet)
    return json.dumps(result.model_dump(), default=str)
