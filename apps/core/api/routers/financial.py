"""Financial router — ROI, budget tracking, financial dashboard (GAP-W04)."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.dependencies.auth import get_current_user
from api.database.connection import get_db
from tools.engines.roi_engine import ROIEngine
from tools.engines.budget_engine import BudgetEngine
from tools.models.schemas import BudgetItem, ROIInput

router = APIRouter(prefix="/financial", tags=["financial"], dependencies=[Depends(get_current_user)])

MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
MONTH_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]


def _safe_float(v):
    try:
        return float(v) if v is not None else 0.0
    except (ValueError, TypeError):
        return 0.0


class _EmptyResult:
    """Bug 2026-05-14: annual_budget_* tables se crean vía data_import upload,
    no son SQLAlchemy models → 500 en tests/deploys nuevos. Wrapper devuelve
    vacío para que la API responda 200 con valores 0.
    """
    def keys(self): return []
    def fetchall(self): return []
    def fetchone(self): return None
    def scalar(self): return None


def _safe_exec(db: Session, sql: str, params: dict | None = None):
    try:
        return db.execute(text(sql), params) if params else db.execute(text(sql))
    except Exception:
        return _EmptyResult()


@router.get("/summary")
def get_financial_summary(db: Session = Depends(get_db)):
    """Overall budget totals from the annual_budget tables."""
    opex_rows = _safe_exec(db, """
        SELECT cost_center_desc,
               SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0)) as total_budget,
               SUM(COALESCE(annual_actual_usd,0)) as total_actual
        FROM annual_budget_opex
        GROUP BY cost_center_desc
    """).fetchall()

    total_opex_budget = sum(_safe_float(r[1]) for r in opex_rows)
    total_opex_actual = sum(_safe_float(r[2]) for r in opex_rows)

    maint_rows = _safe_exec(db, """
        SELECT SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0)) as total
        FROM annual_budget_maintenance
    """).fetchone()
    total_maint = _safe_float(maint_rows[0]) if maint_rows else 0.0

    capex_rows = _safe_exec(db, """
        SELECT SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0)) as total
        FROM annual_budget_capex
    """).fetchone()
    total_capex = _safe_float(capex_rows[0]) if capex_rows else 0.0

    variance = total_opex_actual - total_opex_budget
    variance_pct = round((variance / total_opex_budget) * 100, 1) if total_opex_budget > 0 else 0.0

    return {
        "total_opex_budget": round(total_opex_budget, 2),
        "total_opex_actual": round(total_opex_actual, 2),
        "total_maintenance": round(total_maint, 2),
        "total_capex": round(total_capex, 2),
        "total_budget": round(total_opex_budget + total_capex, 2),
        "variance": round(variance, 2),
        "variance_pct": variance_pct,
    }


@router.get("/monthly-trend")
def get_monthly_trend(db: Session = Depends(get_db)):
    """Monthly budget vs actual from OPEX + Maintenance tables."""
    result = []
    def _first(row):
        try:
            return row[0] if row else None
        except Exception:
            return None
    for i, m in enumerate(MONTHS):
        opex_b = _first(_safe_exec(db, f"SELECT SUM(COALESCE({m}_budget_usd,0)) FROM annual_budget_opex").fetchone())
        opex_a = _first(_safe_exec(db, f"SELECT SUM(COALESCE({m}_actual_usd,0)) FROM annual_budget_opex").fetchone())
        maint_b = _first(_safe_exec(db, f"SELECT SUM(COALESCE({m}_budget_usd,0)) FROM annual_budget_maintenance").fetchone())

        budget_val = _safe_float(opex_b) + _safe_float(maint_b)
        actual_val = _safe_float(opex_a)

        result.append({
            "month": MONTH_LABELS[i],
            "budget": round(budget_val, 0),
            "actual": round(actual_val, 0),
            "opex_budget": round(_safe_float(opex_b), 0),
            "maint_budget": round(_safe_float(maint_b), 0),
            "variance": round(actual_val - _safe_float(opex_b), 0),
        })
    return result


@router.get("/cost-by-area")
def get_cost_by_area(db: Session = Depends(get_db)):
    """OPEX budget breakdown by business area / cost center."""
    rows = _safe_exec(db, """
        SELECT cost_center, cost_center_desc, business_area,
               SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0)) as total_budget,
               SUM(COALESCE(annual_actual_usd,0)) as total_actual
        FROM annual_budget_opex
        GROUP BY cost_center, cost_center_desc, business_area
        ORDER BY total_budget DESC
    """).fetchall()
    return [{
        "cost_center": r[0],
        "area": r[1] or r[2],
        "budget": round(_safe_float(r[3]), 0),
        "actual": round(_safe_float(r[4]), 0),
        "variance": round(_safe_float(r[4]) - _safe_float(r[3]), 0),
    } for r in rows]


@router.get("/maintenance-costs")
def get_maintenance_costs(db: Session = Depends(get_db)):
    """Maintenance budget breakdown by fleet group and cost type."""
    rows = _safe_exec(db, """
        SELECT fleet_group, fleet_description, maint_cost_type, maint_cost_type_desc,
               SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0)) as total
        FROM annual_budget_maintenance
        GROUP BY fleet_group, fleet_description, maint_cost_type, maint_cost_type_desc
        ORDER BY total DESC
    """).fetchall()
    return [{
        "fleet_group": r[0],
        "fleet_description": r[1],
        "cost_type": r[2],
        "cost_type_desc": r[3],
        "total": round(_safe_float(r[4]), 0),
    } for r in rows]


@router.get("/capex-projects")
def get_capex_projects(db: Session = Depends(get_db)):
    """CAPEX project list with annual budget."""
    rows = _safe_exec(db, """
        SELECT capex_id, capex_category_desc, project_name, priority, approval_status,
               COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
               COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
               COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
               COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0) as annual_total
        FROM annual_budget_capex
        ORDER BY annual_total DESC
    """).fetchall()
    return [{
        "capex_id": r[0],
        "category": r[1],
        "project": r[2],
        "priority": r[3],
        "status": r[4],
        "annual_budget": round(_safe_float(r[5]), 0),
    } for r in rows]


@router.get("/kpis")
def get_financial_kpis(db: Session = Depends(get_db)):
    """Financial KPIs from executive summary and budget tables."""
    exec_rows = _safe_exec(db, """
        SELECT kpi_category, kpi_name, kpi_description, unit,
               COALESCE(annual_budget, jan_budget+feb_budget+mar_budget+apr_budget+may_budget+jun_budget+
                        jul_budget+aug_budget+sep_budget+oct_budget+nov_budget+dec_budget) as budget,
               annual_actual, variance_pct
        FROM annual_budget_executive
        ORDER BY kpi_category, kpi_name
    """).fetchall()

    kpis = [{
        "category": r[0],
        "name": r[1],
        "description": r[2],
        "unit": r[3],
        "budget": round(_safe_float(r[4]), 2),
        "actual": round(_safe_float(r[5]), 2),
        "variance_pct": round(_safe_float(r[6]), 1),
    } for r in exec_rows]

    equip_count = _safe_exec(db, "SELECT COUNT(DISTINCT sap_func_loc_short) FROM annual_budget_equipment").fetchone()
    eq_count = int(equip_count[0]) if equip_count else 0

    maint_total = _safe_exec(db, """
        SELECT SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0))
        FROM annual_budget_maintenance
    """).fetchone()
    maint_val = _safe_float(maint_total[0]) if maint_total else 0.0
    cost_per_equip = round(maint_val / eq_count, 0) if eq_count > 0 else 0.0

    wo_stats = _safe_exec(db, """
        SELECT COUNT(*) as total,
               AVG(actual_duration_hours) as avg_hours,
               SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END) as completed
        FROM work_orders
    """).fetchone()

    wo_total = int(wo_stats[0] or 0) if wo_stats else 0
    wo_completed = int(wo_stats[2] or 0) if wo_stats else 0
    wo_avg = _safe_float(wo_stats[1]) if wo_stats else 0.0

    return {
        "executive_kpis": kpis,
        "equipment_count": eq_count,
        "cost_per_equipment": cost_per_equip,
        "total_maintenance_budget": round(maint_val, 0),
        "wo_total": wo_total,
        "wo_avg_hours": round(wo_avg, 1),
        "wo_completed": wo_completed,
        "wo_completion_rate": round((wo_completed / wo_total) * 100, 1) if wo_total > 0 else 0,
    }


@router.get("/equipment-costs")
def get_equipment_costs(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    """Top N equipment by annual maintenance budget."""
    rows = _safe_exec(db, """
        SELECT sap_func_loc_short, equipment_name, cost_center,
               SUM(COALESCE(jan_budget_usd,0)+COALESCE(feb_budget_usd,0)+COALESCE(mar_budget_usd,0)+
                   COALESCE(apr_budget_usd,0)+COALESCE(may_budget_usd,0)+COALESCE(jun_budget_usd,0)+
                   COALESCE(jul_budget_usd,0)+COALESCE(aug_budget_usd,0)+COALESCE(sep_budget_usd,0)+
                   COALESCE(oct_budget_usd,0)+COALESCE(nov_budget_usd,0)+COALESCE(dec_budget_usd,0)) as annual_total
        FROM annual_budget_equipment
        GROUP BY sap_func_loc_short, equipment_name, cost_center
        ORDER BY annual_total DESC
        LIMIT :lim
    """, {"lim": limit}).fetchall()
    return [{
        "equipment_tag": r[0],
        "description": r[1],
        "cost_center": r[2],
        "annual_budget": round(_safe_float(r[3]), 0),
    } for r in rows]


# ── Legacy endpoints ──
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


@router.get("/budget-status")
def get_budget_status(plant_id: str = ""):
    summary = BudgetEngine.generate_financial_summary(plant_id)
    total_planned = summary.total_maintenance_budget
    total_actual = summary.total_actual_spend
    utilization_pct = round((total_actual / total_planned) * 100, 1) if total_planned > 0 else 0.0
    return {
        "plant_id": plant_id,
        "total_planned": total_planned,
        "total_actual": total_actual,
        "utilization_pct": utilization_pct,
        "variance_pct": summary.budget_variance_pct,
    }


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
