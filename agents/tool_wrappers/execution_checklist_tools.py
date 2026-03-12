"""MCP tool wrappers for Execution Checklist Engine (GAP-W06)."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.execution_checklist_engine import ExecutionChecklistEngine


@tool(
    "generate_execution_checklist",
    "Generate an interactive execution checklist from a work package and its tasks. Input: {work_package, tasks, equipment_name, equipment_tag}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_execution_checklist(input_json: str) -> str:
    data = json.loads(input_json)
    result = ExecutionChecklistEngine.generate_checklist(
        work_package=data["work_package"],
        tasks=data.get("tasks", []),
        equipment_name=data.get("equipment_name", ""),
        equipment_tag=data.get("equipment_tag", ""),
        include_safety_gates=data.get("include_safety_gates", True),
        include_commissioning_gate=data.get("include_commissioning_gate", True),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "complete_checklist_step",
    "Complete a step in an execution checklist with observation data. Enforces gate logic. Input: {checklist, step_id, observation, completed_by}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def complete_checklist_step(input_json: str) -> str:
    from tools.models.schemas import ExecutionChecklist
    data = json.loads(input_json)
    checklist = ExecutionChecklist(**data["checklist"])
    result = ExecutionChecklistEngine.complete_step(
        checklist=checklist,
        step_id=data["step_id"],
        observation=data.get("observation"),
        completed_by=data.get("completed_by", ""),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "skip_checklist_step",
    "Skip a non-gate step in an execution checklist (supervisor override). Gate steps cannot be skipped. Input: {checklist, step_id, reason, authorized_by}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def skip_checklist_step(input_json: str) -> str:
    from tools.models.schemas import ExecutionChecklist
    data = json.loads(input_json)
    checklist = ExecutionChecklist(**data["checklist"])
    result = ExecutionChecklistEngine.skip_step(
        checklist=checklist,
        step_id=data["step_id"],
        reason=data.get("reason", ""),
        authorized_by=data.get("authorized_by", ""),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "get_checklist_status",
    "Get the current status of an execution checklist and its next actionable steps. Input: {checklist}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def get_checklist_status(input_json: str) -> str:
    from tools.models.schemas import ExecutionChecklist
    data = json.loads(input_json)
    checklist = ExecutionChecklist(**data["checklist"])
    next_steps = ExecutionChecklistEngine.get_next_actionable_steps(checklist)
    return json.dumps({
        "checklist_id": checklist.checklist_id,
        "status": checklist.status.value,
        "total_steps": len(checklist.steps),
        "completed_steps": sum(1 for s in checklist.steps if s.status.value == "COMPLETED"),
        "skipped_steps": sum(1 for s in checklist.steps if s.status.value == "SKIPPED"),
        "next_actionable_steps": [
            {"step_id": s.step_id, "step_number": s.step_number, "description": s.description}
            for s in next_steps
        ],
    }, default=str)


@tool(
    "close_execution_checklist",
    "Supervisor closes a completed execution checklist. All steps must be done. Input: {checklist, supervisor, supervisor_notes}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def close_execution_checklist(input_json: str) -> str:
    from tools.models.schemas import ExecutionChecklist
    data = json.loads(input_json)
    checklist = ExecutionChecklist(**data["checklist"])
    result = ExecutionChecklistEngine.close_checklist(
        checklist=checklist,
        supervisor=data["supervisor"],
        supervisor_notes=data.get("supervisor_notes", ""),
    )
    return json.dumps(result.model_dump(), default=str)
