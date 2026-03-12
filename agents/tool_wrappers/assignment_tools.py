"""MCP tool wrappers for Competency-Based Work Assignment (GAP-W09)."""

import json
from datetime import date

from agents.tool_wrappers.registry import tool
from tools.engines.assignment_engine import AssignmentEngine
from tools.models.schemas import TechnicianProfile, WorkAssignment

_engine = AssignmentEngine()


@tool(
    "optimize_work_assignments",
    "Generate optimized technician-to-task assignments for a work package on a given date/shift. Uses 5-dimension scoring: specialty (30), competency (25), equipment expertise (20), certification (15), availability (10). Returns AssignmentSummary with assignments, unassigned tasks, and warnings.",
    {
        "type": "object",
        "properties": {"input_json": {"type": "string"}},
        "required": ["input_json"],
    },
)
def optimize_work_assignments(input_json: str) -> str:
    data = json.loads(input_json)
    technicians = [TechnicianProfile(**t) for t in data["technicians"]]
    summary = _engine.optimize_assignments(
        tasks=data["tasks"],
        technicians=technicians,
        target_date=date.fromisoformat(data["date"]),
        target_shift=data["shift"],
        plant_id=data["plant_id"],
        shift_hours=data.get("shift_hours", 8.0),
    )
    return json.dumps(summary.model_dump(), default=str)


@tool(
    "reoptimize_assignments",
    "Re-optimize work assignments when workers are absent. Keeps assignments for present workers, reassigns affected tasks to remaining crew.",
    {
        "type": "object",
        "properties": {"input_json": {"type": "string"}},
        "required": ["input_json"],
    },
)
def reoptimize_assignments(input_json: str) -> str:
    data = json.loads(input_json)
    existing = [WorkAssignment(**a) for a in data["existing_assignments"]]
    technicians = [TechnicianProfile(**t) for t in data["all_technicians"]]
    summary = _engine.reoptimize_with_absences(
        existing_assignments=existing,
        absent_worker_ids=data["absent_worker_ids"],
        all_technicians=technicians,
        tasks=data["tasks"],
        target_date=date.fromisoformat(data["date"]),
        target_shift=data["shift"],
        plant_id=data["plant_id"],
        shift_hours=data.get("shift_hours", 8.0),
    )
    return json.dumps(summary.model_dump(), default=str)


@tool(
    "score_technician_match",
    "Score how well a single technician matches a task's competency requirements (0-100). Returns score and detailed reasons.",
    {
        "type": "object",
        "properties": {"input_json": {"type": "string"}},
        "required": ["input_json"],
    },
)
def score_technician_match(input_json: str) -> str:
    data = json.loads(input_json)
    from tools.models.schemas import TaskCompetencyRequirement

    tech = TechnicianProfile(**data["technician"])
    req = TaskCompetencyRequirement(**data["requirement"])
    score, reasons = _engine.score_match(
        tech, req,
        assigned_hours=data.get("assigned_hours", 0.0),
        shift_hours=data.get("shift_hours", 8.0),
    )
    return json.dumps({"score": score, "reasons": reasons})


@tool(
    "get_assignment_summary",
    "Generate a supervisor-friendly summary from an existing AssignmentSummary. Returns per-technician breakdown, unassigned tasks, and crew utilization.",
    {
        "type": "object",
        "properties": {"input_json": {"type": "string"}},
        "required": ["input_json"],
    },
)
def get_assignment_summary(input_json: str) -> str:
    from tools.models.schemas import AssignmentSummary

    data = json.loads(input_json)
    summary = AssignmentSummary(**data)
    result = _engine.generate_assignment_summary(summary)
    return json.dumps(result, default=str)
