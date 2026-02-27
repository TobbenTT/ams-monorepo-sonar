"""MCP tool wrappers for ManagementReviewEngine."""

import json
from datetime import date
from agents.tool_wrappers.registry import tool
from tools.engines.management_review_engine import ManagementReviewEngine
from tools.models.schemas import (
    KPIMetrics, AssetHealthScore, PlantVarianceAlert, CAPAItem,
)


@tool(
    "generate_management_review",
    "Generate an executive management review summary aggregating KPIs, health scores, variance alerts, and CAPAs. Input: JSON with plant_id, period_start, period_end, and optional data sections.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_management_review(input_json: str) -> str:
    data = json.loads(input_json)
    kpis = KPIMetrics(**data["kpi_summary"]) if data.get("kpi_summary") else None
    health = [AssetHealthScore(**h) for h in data["health_scores"]] if data.get("health_scores") else None
    alerts = [PlantVarianceAlert(**a) for a in data["variance_alerts"]] if data.get("variance_alerts") else None
    capas = [CAPAItem(**c) for c in data["capas"]] if data.get("capas") else None
    prev_kpis = KPIMetrics(**data["previous_kpis"]) if data.get("previous_kpis") else None
    result = ManagementReviewEngine.generate_review(
        plant_id=data["plant_id"],
        period_start=date.fromisoformat(data["period_start"]),
        period_end=date.fromisoformat(data["period_end"]),
        kpi_summary=kpis,
        health_scores=health,
        variance_alerts=alerts,
        capas=capas,
        previous_avg_health=data.get("previous_avg_health"),
        previous_kpis=prev_kpis,
    )
    return json.dumps(result.model_dump(), default=str)
