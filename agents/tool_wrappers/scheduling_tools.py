"""MCP tool wrappers for SchedulingEngine (Phase 4B)."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.scheduling_engine import SchedulingEngine
from tools.models.schemas import (
    WeeklyProgram, WeeklyProgramStatus,
    BacklogWorkPackage, ShiftType, MaterialsReadyStatus,
    WorkPackageElement, WorkPackageElementType,
)


@tool(
    "create_weekly_program",
    "Create a DRAFT weekly program from work packages. Input: {plant_id, week_number, year, work_packages: [{package_id, name, grouped_items, total_duration_hours, assigned_team}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_weekly_program(input_json: str) -> str:
    data = json.loads(input_json)
    pkgs = []
    for p in data.get("work_packages", []):
        pkgs.append(BacklogWorkPackage(
            package_id=p.get("package_id", ""),
            name=p.get("name", ""),
            grouped_items=p.get("grouped_items", []),
            reason_for_grouping=p.get("reason_for_grouping", ""),
            scheduled_date=p.get("scheduled_date"),
            scheduled_shift=ShiftType(p.get("scheduled_shift", "MORNING")),
            total_duration_hours=p.get("total_duration_hours", 0.0),
            assigned_team=p.get("assigned_team", []),
            materials_status=MaterialsReadyStatus.READY,
        ))
    program = SchedulingEngine.create_weekly_program(
        data["plant_id"], data["week_number"], data["year"], pkgs,
    )
    return json.dumps(program.model_dump(), default=str)


@tool(
    "level_program_resources",
    "Run resource leveling on a weekly program. Input: {program: {...}, workforce: [{worker_id, specialty, shift, available}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def level_program_resources(input_json: str) -> str:
    data = json.loads(input_json)
    program = WeeklyProgram(**data["program"])
    workforce = data.get("workforce", [])
    program = SchedulingEngine.level_resources(program, workforce)
    return json.dumps({
        "resource_slots": [s.model_dump(mode="json") for s in program.resource_slots],
        "total_slots": len(program.resource_slots),
    }, default=str)


@tool(
    "detect_scheduling_conflicts",
    "Detect resource conflicts (area interference, specialist overallocation) in a weekly program.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def detect_scheduling_conflicts(input_json: str) -> str:
    data = json.loads(input_json)
    program = WeeklyProgram(**data)
    conflicts = SchedulingEngine.detect_conflicts(program)
    return json.dumps({
        "conflicts": [c.model_dump(mode="json") for c in conflicts],
        "total_conflicts": len(conflicts),
    }, default=str)


@tool(
    "validate_wp_elements",
    "Validate that a work package has all 7 mandatory elements per REF-14 §5.5. Input: {package_id, elements: [{element_type, present, reference}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def validate_wp_elements(input_json: str) -> str:
    data = json.loads(input_json)
    elements = [
        WorkPackageElement(
            element_type=WorkPackageElementType(e["element_type"]),
            present=e.get("present", False),
            reference=e.get("reference"),
        )
        for e in data.get("elements", [])
    ]
    result = SchedulingEngine.validate_work_package_elements(data["package_id"], elements)
    return json.dumps(result.model_dump(), default=str)


@tool(
    "finalize_weekly_program",
    "Transition a weekly program from DRAFT to FINAL. Validates no unresolved conflicts.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def finalize_weekly_program(input_json: str) -> str:
    data = json.loads(input_json)
    program = WeeklyProgram(**data)
    program, msg = SchedulingEngine.finalize_program(program)
    return json.dumps({"status": program.status.value, "message": msg}, default=str)


@tool(
    "generate_gantt",
    "Generate Gantt chart data from a weekly program.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_gantt(input_json: str) -> str:
    from tools.processors.gantt_generator import GanttGenerator
    data = json.loads(input_json)
    program = WeeklyProgram(**data)
    rows = GanttGenerator.generate_gantt_data(program)
    return json.dumps([r.model_dump(mode="json") for r in rows], default=str)


# --- Phase 7: Enhanced Resource Leveling (G15) ---

from tools.models.schemas import TradeCapacity, ResourceConflict


@tool(
    "level_resources_enhanced",
    "Trade-specific resource leveling with multi-day splitting. Input: {program: {...}, trade_capacities: [{specialty, shift, headcount, hours_per_person, total_hours}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def level_resources_enhanced(input_json: str) -> str:
    data = json.loads(input_json)
    program = WeeklyProgram(**data["program"])
    capacities = [TradeCapacity(**tc) for tc in data.get("trade_capacities", [])]
    result = SchedulingEngine.level_resources_enhanced(program, capacities)
    return json.dumps(result.model_dump(), default=str)


@tool(
    "suggest_conflict_resolutions",
    "Suggest actionable resolutions for scheduling conflicts. Input: {conflicts: [{...}], program: {...}, trade_capacities: [{...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def suggest_conflict_resolutions(input_json: str) -> str:
    data = json.loads(input_json)
    conflicts = [ResourceConflict(**c) for c in data.get("conflicts", [])]
    program = WeeklyProgram(**data["program"])
    capacities = [TradeCapacity(**tc) for tc in data.get("trade_capacities", [])]
    resolutions = SchedulingEngine.suggest_conflict_resolutions(conflicts, program, capacities)
    return json.dumps({
        "resolutions": [r.model_dump() for r in resolutions],
        "total": len(resolutions),
    }, default=str)
