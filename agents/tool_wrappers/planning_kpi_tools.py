"""MCP tool wrappers for PlanningKPIEngine (Phase 4A)."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.planning_kpi_engine import PlanningKPIEngine
from tools.models.schemas import PlanningKPIInput


@tool(
    "calculate_planning_kpis",
    "Calculate all 11 GFSN planning KPIs from input data. Returns KPIs with targets and overall health.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_planning_kpis(input_json: str) -> str:
    data = json.loads(input_json)
    input_data = PlanningKPIInput(**data)
    result = PlanningKPIEngine.calculate(input_data)
    return json.dumps(result.model_dump(), default=str)


@tool(
    "get_planning_kpi_targets",
    "Return all 11 planning KPI target values and descriptions per GFSN REF-14.",
    {"type": "object", "properties": {}, "required": []},
)
def get_planning_kpi_targets() -> str:
    targets = [
        {"name": "wo_completion", "target": 90.0, "unit": "%", "direction": ">=", "description": "Work orders completed vs planned"},
        {"name": "manhour_compliance", "target_low": 85.0, "target_high": 115.0, "unit": "%", "direction": "range", "description": "Actual vs planned man-hours"},
        {"name": "pm_plan_compliance", "target": 95.0, "unit": "%", "direction": ">=", "description": "PM tasks completed vs scheduled"},
        {"name": "backlog_weeks", "target": 4.0, "unit": "weeks", "direction": "<=", "description": "Open WO hours / weekly capacity"},
        {"name": "reactive_work", "target": 20.0, "unit": "%", "direction": "<=", "description": "Emergency WOs / total WOs"},
        {"name": "schedule_adherence", "target": 85.0, "unit": "%", "direction": ">=", "description": "Executed per schedule / total scheduled"},
        {"name": "release_horizon", "target": 7.0, "unit": "days", "direction": "<=", "description": "Avg days from WO creation to release"},
        {"name": "pending_notices", "target": 15.0, "unit": "%", "direction": "<=", "description": "Open notices / total notices"},
        {"name": "scheduled_capacity", "target_low": 80.0, "target_high": 95.0, "unit": "%", "direction": "range", "description": "Scheduled hours / available hours"},
        {"name": "proactive_work", "target": 70.0, "unit": "%", "direction": ">=", "description": "(PM + PdM) / total WOs"},
        {"name": "planning_efficiency", "target": 85.0, "unit": "%", "direction": ">=", "description": "Planned WOs / total WOs"},
    ]
    return json.dumps(targets)
