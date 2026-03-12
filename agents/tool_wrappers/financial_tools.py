"""MCP tool wrappers for GAP-W04 — Financial / ROI Tracking."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.roi_engine import ROIEngine
from tools.engines.budget_engine import BudgetEngine
from tools.models.schemas import (
    ROIInput,
    BudgetItem,
    BudgetSummary,
)


# ── ROI Calculations ────────────────────────────────────────────────

@tool(
    "calculate_roi",
    "Calculate ROI for a maintenance improvement project. Input: {project_id, plant_id, investment_cost, annual_avoided_downtime_hours, hourly_production_value, annual_labor_savings_hours, labor_cost_per_hour, annual_material_savings, annual_operating_cost_increase, analysis_horizon_years, discount_rate}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_roi(input_json: str) -> str:
    data = json.loads(input_json)
    inp = ROIInput(**data)
    result = ROIEngine.calculate_roi(inp)
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "compare_roi_scenarios",
    "Compare multiple ROI scenarios, returns sorted by NPV descending. Input: {scenarios: [{project_id, investment_cost, ...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def compare_roi_scenarios(input_json: str) -> str:
    data = json.loads(input_json)
    inputs = [ROIInput(**s) for s in data.get("scenarios", [])]
    results = ROIEngine.compare_scenarios(inputs)
    return json.dumps([r.model_dump(mode="json") for r in results], default=str)


@tool(
    "calculate_financial_impact",
    "Calculate annualized financial impact for one equipment/failure mode. Input: {equipment_id, failure_rate, cost_per_failure, cost_per_pm, annual_pm_count, production_value_per_hour, avg_downtime_hours}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_financial_impact(input_json: str) -> str:
    data = json.loads(input_json)
    result = ROIEngine.calculate_financial_impact(
        equipment_id=data["equipment_id"],
        failure_rate=data["failure_rate"],
        cost_per_failure=data["cost_per_failure"],
        cost_per_pm=data["cost_per_pm"],
        annual_pm_count=data["annual_pm_count"],
        production_value_per_hour=data["production_value_per_hour"],
        avg_downtime_hours=data["avg_downtime_hours"],
        failure_mode_id=data.get("failure_mode_id", ""),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "calculate_man_hours_saved",
    "Calculate man-hours saved: traditional vs. AI-assisted. Input: {traditional_hours: {activity: hours}, ai_hours: {activity: hours}, labor_rate, plant_id}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_man_hours_saved(input_json: str) -> str:
    data = json.loads(input_json)
    result = ROIEngine.calculate_man_hours_saved(
        traditional_hours=data["traditional_hours"],
        ai_hours=data["ai_hours"],
        labor_rate=data.get("labor_rate", 50.0),
        plant_id=data.get("plant_id", ""),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── Budget Tracking ─────────────────────────────────────────────────

@tool(
    "track_budget",
    "Track maintenance budget: aggregate items, compute variance per category. Input: {plant_id, items: [{category, planned_amount, actual_amount, ...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def track_budget(input_json: str) -> str:
    data = json.loads(input_json)
    result = BudgetEngine.track_budget(data["plant_id"], data.get("items", []))
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "detect_budget_alerts",
    "Detect budget variance alerts exceeding threshold. Input: {summary: BudgetSummary dict, threshold_pct: float}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def detect_budget_alerts(input_json: str) -> str:
    data = json.loads(input_json)
    if "summary" in data:
        summary = BudgetSummary(**data["summary"])
    elif "items" in data and "by_category" not in data:
        # Convenience: build summary from raw items via BudgetEngine
        plant_id = data.get("plant_id", "")
        summary = BudgetEngine.track_budget(plant_id, data["items"])
    else:
        summary = BudgetSummary(**data)
    threshold = data.get("threshold_pct", 10.0)
    alerts = BudgetEngine.detect_variance_alerts(summary, threshold)
    return json.dumps([a.model_dump(mode="json") for a in alerts], default=str)


@tool(
    "generate_financial_summary",
    "Generate executive-level financial summary. Input: {plant_id, budget_summary?, roi_result?, financial_impacts?, man_hours_report?}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_financial_summary(input_json: str) -> str:
    data = json.loads(input_json)
    from tools.models.schemas import ROIResult, FinancialImpact, ManHourSavingsReport

    budget_summary = BudgetSummary(**data["budget_summary"]) if data.get("budget_summary") else None
    roi_result = ROIResult(**data["roi_result"]) if data.get("roi_result") else None
    impacts = [FinancialImpact(**fi) for fi in data.get("financial_impacts", [])]
    man_hours = ManHourSavingsReport(**data["man_hours_report"]) if data.get("man_hours_report") else None

    result = BudgetEngine.generate_financial_summary(
        plant_id=data["plant_id"],
        budget_summary=budget_summary,
        roi_result=roi_result,
        financial_impacts=impacts,
        man_hours_report=man_hours,
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "forecast_budget",
    "Forecast near-term budget using linear extrapolation. Input: {items: [BudgetItem dicts], months_ahead: int}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def forecast_budget(input_json: str) -> str:
    data = json.loads(input_json)
    items = [BudgetItem(**item) for item in data.get("items", [])]
    months = data.get("months_ahead", 3)
    results = BudgetEngine.forecast_budget(items, months)
    return json.dumps([r.model_dump(mode="json") for r in results], default=str)
