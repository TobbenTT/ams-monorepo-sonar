"""MCP tool wrappers for KPIEngine."""

import json
from datetime import date
from agents.tool_wrappers.registry import tool
from tools.engines.kpi_engine import KPIEngine, WorkOrderRecord


@tool(
    "calculate_mtbf",
    "Calculate Mean Time Between Failures from a list of failure dates (ISO date strings). Returns MTBF in days.",
    {"type": "object", "properties": {"failure_dates": {"type": "string"}}, "required": ["failure_dates"]},
)
def calculate_mtbf(failure_dates: str) -> str:
    dates = [date.fromisoformat(d) for d in json.loads(failure_dates)]
    result = KPIEngine.calculate_mtbf(dates)
    return json.dumps({"mtbf_days": result})


@tool(
    "calculate_mttr",
    "Calculate Mean Time To Repair from a list of repair durations in hours.",
    {"type": "object", "properties": {"repair_durations": {"type": "string"}}, "required": ["repair_durations"]},
)
def calculate_mttr(repair_durations: str) -> str:
    durations = json.loads(repair_durations)
    result = KPIEngine.calculate_mttr(durations)
    return json.dumps({"mttr_hours": result})


@tool(
    "calculate_availability",
    "Calculate availability percentage: (total_hours - downtime_hours) / total_hours * 100.",
    {"type": "object", "properties": {"total_period_hours": {"type": "number"}, "total_downtime_hours": {"type": "number"}}, "required": ["total_period_hours", "total_downtime_hours"]},
)
def calculate_availability(total_period_hours: float, total_downtime_hours: float) -> str:
    result = KPIEngine.calculate_availability(total_period_hours, total_downtime_hours)
    return json.dumps({"availability_pct": result})


@tool(
    "calculate_oee",
    "Calculate Overall Equipment Effectiveness: availability × performance × quality.",
    {"type": "object", "properties": {"availability_pct": {"type": "number"}, "performance_pct": {"type": "number"}, "quality_pct": {"type": "number"}}, "required": ["availability_pct"]},
)
def calculate_oee(availability_pct: float, performance_pct: float = 100.0, quality_pct: float = 100.0) -> str:
    result = KPIEngine.calculate_oee(availability_pct, performance_pct, quality_pct)
    return json.dumps({"oee_pct": result})


@tool(
    "calculate_kpis_from_records",
    "Calculate all KPIs from a list of work order records. Input: JSON with records list, plant_id, period_start, period_end.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_kpis_from_records(input_json: str) -> str:
    data = json.loads(input_json)
    records = [WorkOrderRecord(**r) for r in data["records"]]
    result = KPIEngine.calculate_from_records(
        records=records,
        plant_id=data["plant_id"],
        period_start=date.fromisoformat(data["period_start"]),
        period_end=date.fromisoformat(data["period_end"]),
        equipment_id=data.get("equipment_id"),
        total_period_hours=data.get("total_period_hours"),
    )
    return json.dumps(result.model_dump(), default=str)
