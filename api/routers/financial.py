"""Financial router — ROI, budget tracking, financial impact (GAP-W04)."""

from fastapi import APIRouter

from tools.engines.roi_engine import ROIEngine
from tools.engines.budget_engine import BudgetEngine
from tools.models.schemas import BudgetItem, ROIInput

router = APIRouter(prefix="/financial", tags=["financial"])


@router.post("/roi")
def calculate_roi(data: dict):
    inp = ROIInput(**data)
    result = ROIEngine.calculate_roi(inp)
    return result.model_dump()


@router.post("/roi/compare")
def compare_roi_scenarios(data: dict):
    inputs = [ROIInput(**s) for s in data.get("scenarios", [])]
    results = ROIEngine.compare_scenarios(inputs)
    return [r.model_dump() for r in results]


@router.post("/budget/track")
def track_budget(data: dict):
    plant_id = data.get("plant_id", "")
    items = data.get("items", [])
    summary = BudgetEngine.track_budget(plant_id, items)
    return summary.model_dump()


@router.post("/budget/alerts")
def detect_budget_alerts(data: dict):
    plant_id = data.get("plant_id", "")
    items = data.get("items", [])
    threshold = data.get("threshold_pct", 10.0)
    summary = BudgetEngine.track_budget(plant_id, items)
    alerts = BudgetEngine.detect_variance_alerts(summary, threshold)
    return [a.model_dump() for a in alerts]


@router.get("/summary/{plant_id}")
def get_financial_summary(plant_id: str):
    summary = BudgetEngine.generate_financial_summary(plant_id)
    return summary.model_dump()


@router.post("/impact")
def calculate_financial_impact(data: dict):
    result = ROIEngine.calculate_financial_impact(
        equipment_id=data.get("equipment_id", ""),
        failure_rate=data.get("failure_rate", 0.0),
        cost_per_failure=data.get("cost_per_failure", 0.0),
        cost_per_pm=data.get("cost_per_pm", 0.0),
        annual_pm_count=data.get("annual_pm_count", 0),
        production_value_per_hour=data.get("production_value_per_hour", 0.0),
        avg_downtime_hours=data.get("avg_downtime_hours", 0.0),
        failure_mode_id=data.get("failure_mode_id", ""),
    )
    return result.model_dump()


@router.post("/man-hours")
def calculate_man_hours_saved(data: dict):
    result = ROIEngine.calculate_man_hours_saved(
        traditional_hours=data.get("traditional_hours", {}),
        ai_hours=data.get("ai_hours", {}),
        labor_rate=data.get("labor_rate", 50.0),
        plant_id=data.get("plant_id", ""),
    )
    return result.model_dump()


@router.post("/budget/forecast")
def forecast_budget(data: dict):
    items = [BudgetItem(**i) if isinstance(i, dict) else i for i in data.get("items", [])]
    months = data.get("months_ahead", 3)
    forecasts = BudgetEngine.forecast_budget(items, months)
    return [f.model_dump() for f in forecasts]
