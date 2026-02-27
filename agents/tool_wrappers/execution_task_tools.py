"""MCP tool wrappers for Execution Task Engine (Phase 7 — G6)."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.execution_task_engine import ExecutionTaskEngine


@tool(
    "build_execution_sequence",
    "Build ordered execution sequence with dependencies and safety checklists. Input: {package_id, support_tasks: [{task_id, task_type, description, estimated_hours}], package_attributes: {elevation_meters, shutdown_required}}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def build_execution_sequence(input_json: str) -> str:
    data = json.loads(input_json)
    result = ExecutionTaskEngine.build_execution_sequence(
        package_id=data["package_id"],
        support_tasks=data.get("support_tasks", []),
        package_attributes=data.get("package_attributes"),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "get_loto_removal_checklist",
    "Get the LOTO removal safety checklist (8 items).",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def get_loto_removal_checklist(input_json: str) -> str:
    checklist = ExecutionTaskEngine.get_loto_removal_checklist()
    return json.dumps({"checklist": checklist, "total_items": len(checklist)})
