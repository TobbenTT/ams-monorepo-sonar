"""MCP tool wrappers for HealthScoreEngine."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.health_score_engine import HealthScoreEngine
from tools.models.schemas import RiskClass


@tool(
    "calculate_health_score",
    "Calculate full 5-dimension Asset Health Index for an equipment node. Returns composite score, health class (A-E), and recommendations.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_health_score(input_json: str) -> str:
    data = json.loads(input_json)
    risk_class = RiskClass(data["risk_class"])
    result = HealthScoreEngine.calculate(
        node_id=data["node_id"],
        plant_id=data["plant_id"],
        equipment_tag=data["equipment_tag"],
        risk_class=risk_class,
        pending_backlog_hours=data.get("pending_backlog_hours", 0.0),
        capacity_hours_per_week=data.get("capacity_hours_per_week", 40.0),
        total_failure_modes=data.get("total_failure_modes", 0),
        fm_with_strategy=data.get("fm_with_strategy", 0),
        active_alerts=data.get("active_alerts", 0),
        critical_alerts=data.get("critical_alerts", 0),
        planned_wo=data.get("planned_wo", 0),
        executed_on_time=data.get("executed_on_time", 0),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "determine_health_trend",
    "Compare current vs previous health scores to determine trend (improving/stable/degrading).",
    {"type": "object", "properties": {"current_score": {"type": "number"}, "previous_score": {"type": "number"}}, "required": ["current_score", "previous_score"]},
)
def determine_health_trend(current_score: float, previous_score: float) -> str:
    trend = HealthScoreEngine.determine_trend(current_score, previous_score)
    return json.dumps({"trend": trend, "current": current_score, "previous": previous_score, "delta": round(current_score - previous_score, 2)})
