"""Agentic Executive Report service — generates management-level maintenance reports.

Aggregates KPIs, backlog status, budget variance, and critical equipment health
into a structured report suitable for PowerPoint generation or dashboard display.

Pipeline:
  1. Query KPI metrics from work orders for the given period
  2. Query backlog statistics (open items by priority, avg age)
  3. Aggregate budget data (actual vs planned by WO type)
  4. Identify top 10 critical equipment from hierarchy
  5. Generate executive summary via Claude (with template fallback)
  6. Structure data for PowerPoint slides
  7. Return complete report dict
"""

import json
import logging
import os
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel,
    HierarchyNodeModel,
    ManagedWorkOrderModel,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Period helpers
# ---------------------------------------------------------------------------

_PERIOD_DAYS = {
    "weekly": 7,
    "monthly": 30,
    "quarterly": 90,
}

_PERIOD_LABELS = {
    "weekly": "Semanal",
    "monthly": "Mensual",
    "quarterly": "Trimestral",
}


def _period_start(period: str) -> datetime:
    """Return the start datetime for the requested period."""
    days = _PERIOD_DAYS.get(period, 30)
    return datetime.now() - timedelta(days=days)


# ---------------------------------------------------------------------------
# Step 1 — KPI metrics from work orders
# ---------------------------------------------------------------------------

def _query_kpis(db: Session, plant_id: str, period: str) -> dict:
    """Compute KPI summary from ManagedWorkOrderModel for the period."""
    start = _period_start(period)

    wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.created_at >= start,
        )
        .all()
    )

    total = len(wos)
    completed = [w for w in wos if w.status == "CERRADO"]
    corrective = [w for w in wos if w.wo_type == "CORRECTIVO"]
    preventive = [w for w in wos if w.wo_type in ("PREVENTIVO", "PREDICTIVO")]

    # Average completion hours (for closed WOs with actual_hours > 0)
    completion_hours = [w.actual_hours for w in completed if w.actual_hours and w.actual_hours > 0]
    avg_completion = round(sum(completion_hours) / len(completion_hours), 1) if completion_hours else 0.0

    reactive_ratio = round((len(corrective) / total * 100), 1) if total > 0 else 0.0

    return {
        "total_work_orders": total,
        "completed_work_orders": len(completed),
        "corrective_count": len(corrective),
        "preventive_count": len(preventive),
        "reactive_ratio_pct": reactive_ratio,
        "avg_completion_hours": avg_completion,
    }


# ---------------------------------------------------------------------------
# Step 2 — Backlog statistics
# ---------------------------------------------------------------------------

def _query_backlog_stats(db: Session) -> dict:
    """Aggregate open backlog items by priority and compute average age."""
    items = (
        db.query(BacklogItemModel)
        .filter(BacklogItemModel.status != "COMPLETED")
        .all()
    )

    by_priority: dict[str, int] = {"P1": 0, "P2": 0, "P3": 0, "P4": 0}
    total_age = 0.0

    for item in items:
        prio = item.priority if item.priority in by_priority else "P4"
        by_priority[prio] += 1
        total_age += item.age_days or 0

    avg_age = round(total_age / len(items), 1) if items else 0.0

    return {
        "total": len(items),
        "by_priority": by_priority,
        "avg_age_days": avg_age,
    }


# ---------------------------------------------------------------------------
# Step 3 — Budget variance
# ---------------------------------------------------------------------------

def _query_budget_variance(db: Session, plant_id: str, period: str) -> dict:
    """Aggregate budget vs actual cost from work orders."""
    start = _period_start(period)

    wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.created_at >= start,
        )
        .all()
    )

    total_budget = 0.0
    total_actual = 0.0
    by_type: dict[str, dict] = {}

    for wo in wos:
        budget = wo.budget_amount or 0.0
        actual = wo.actual_total_cost or 0.0
        total_budget += budget
        total_actual += actual

        wo_type = wo.wo_type or "OTRO"
        if wo_type not in by_type:
            by_type[wo_type] = {"budget": 0.0, "actual": 0.0}
        by_type[wo_type]["budget"] += budget
        by_type[wo_type]["actual"] += actual

    variance_pct = (
        round((total_actual - total_budget) / total_budget * 100, 1)
        if total_budget > 0
        else 0.0
    )

    return {
        "total_budget": round(total_budget, 2),
        "total_actual": round(total_actual, 2),
        "variance_pct": variance_pct,
        "by_type": by_type,
    }


# ---------------------------------------------------------------------------
# Step 4 — Critical equipment (top 10)
# ---------------------------------------------------------------------------

def _query_critical_equipment(db: Session, plant_id: str, limit: int = 10) -> list[dict]:
    """Return top critical equipment from hierarchy (AA and A criticality)."""
    nodes = (
        db.query(HierarchyNodeModel)
        .filter(
            HierarchyNodeModel.node_type == "EQUIPMENT",
            HierarchyNodeModel.criticality.in_(["AA", "A"]),
            HierarchyNodeModel.status == "ACTIVE",
        )
        .order_by(HierarchyNodeModel.criticality.asc())  # AA before A
        .limit(limit)
        .all()
    )

    results = []
    for node in nodes:
        results.append({
            "tag": node.tag or node.code,
            "name": node.name,
            "criticality": node.criticality,
            "sap_func_loc": node.sap_func_loc,
            "area": node.parent.name if node.parent else "N/A",
        })

    return results


# ---------------------------------------------------------------------------
# Step 5 — Executive summary via Claude (with fallback)
# ---------------------------------------------------------------------------

def _build_summary_prompt(
    kpis: dict,
    backlog_stats: dict,
    budget_variance: dict,
    critical_equipment: list[dict],
    period: str,
    plant_id: str,
) -> str:
    """Build the Spanish prompt for the executive summary."""
    period_label = _PERIOD_LABELS.get(period, period)
    return (
        f"Eres un gerente de mantenimiento industrial. "
        f"Genera un resumen ejecutivo de 3 parrafos sobre el desempeno de mantenimiento "
        f"del periodo {period_label} para la planta {plant_id}.\n\n"
        f"KPIs: {json.dumps(kpis, ensure_ascii=False)}\n"
        f"Backlog: {json.dumps(backlog_stats, ensure_ascii=False)}\n"
        f"Presupuesto: {json.dumps(budget_variance, ensure_ascii=False)}\n"
        f"Equipos criticos: {json.dumps(critical_equipment, ensure_ascii=False, default=str)}\n\n"
        f"El resumen debe incluir:\n"
        f"1) Estado general del desempeno de mantenimiento\n"
        f"2) Principales riesgos y oportunidades identificados\n"
        f"3) Recomendaciones para el proximo periodo\n\n"
        f"Responde SOLO con el texto del resumen (sin JSON, sin titulos de seccion)."
    )


def _generate_summary_with_claude(
    kpis: dict,
    backlog_stats: dict,
    budget_variance: dict,
    critical_equipment: list[dict],
    period: str,
    plant_id: str,
) -> str:
    """Call Claude to generate the executive summary. Returns plain text."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.info("ANTHROPIC_API_KEY not set — using fallback summary")
        return _fallback_summary(kpis, backlog_stats, budget_variance, period, plant_id)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        prompt = _build_summary_prompt(
            kpis, backlog_stats, budget_variance, critical_equipment, period, plant_id,
        )

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        if text:
            return text

        log.warning("Claude returned empty response — using fallback summary")
        return _fallback_summary(kpis, backlog_stats, budget_variance, period, plant_id)
    except Exception as exc:
        log.warning("Claude summary generation failed: %s — using fallback", exc)
        return _fallback_summary(kpis, backlog_stats, budget_variance, period, plant_id)


def _fallback_summary(
    kpis: dict,
    backlog_stats: dict,
    budget_variance: dict,
    period: str,
    plant_id: str,
) -> str:
    """Template-based fallback summary when Claude is unavailable."""
    period_label = _PERIOD_LABELS.get(period, period)
    total = kpis["total_work_orders"]
    completed = kpis["completed_work_orders"]
    reactive = kpis["reactive_ratio_pct"]
    variance = budget_variance["variance_pct"]
    backlog_total = backlog_stats["total"]
    p1_count = backlog_stats["by_priority"].get("P1", 0)

    return (
        f"Durante el periodo {period_label}, la planta {plant_id} registro un total de "
        f"{total} ordenes de trabajo, de las cuales {completed} fueron completadas. "
        f"La tasa de mantenimiento reactivo se ubico en {reactive}%, "
        f"{'dentro de los parametros aceptables' if reactive < 30 else 'por encima del objetivo del 30%'}.\n\n"
        f"El backlog actual cuenta con {backlog_total} items pendientes"
        f"{f', incluyendo {p1_count} de prioridad critica (P1) que requieren atencion inmediata' if p1_count > 0 else ''}. "
        f"En terminos presupuestarios, se observa una variacion del {variance}% "
        f"{'favorable' if variance < 0 else 'desfavorable' if variance > 0 else 'neutra'} "
        f"respecto al presupuesto asignado.\n\n"
        f"Se recomienda revisar la estrategia de mantenimiento preventivo para reducir "
        f"la tasa reactiva, priorizar la resolucion de items P1 del backlog, y "
        f"monitorear de cerca la ejecucion presupuestaria durante el proximo periodo."
    )


# ---------------------------------------------------------------------------
# Step 6 — Slides structure
# ---------------------------------------------------------------------------

def _build_slides_data(
    kpis: dict,
    backlog_stats: dict,
    budget_variance: dict,
    critical_equipment: list[dict],
    summary_text: str,
    period: str,
    plant_id: str,
) -> list[dict]:
    """Structure report data for PowerPoint slide generation."""
    period_label = _PERIOD_LABELS.get(period, period)

    recommendations = (
        "1. Reducir tasa de mantenimiento reactivo por debajo del 30%.\n"
        "2. Resolver items P1 del backlog dentro de las proximas 48 horas.\n"
        "3. Revisar presupuesto de ordenes correctivas para controlar desviacion.\n"
        "4. Implementar rutas de inspeccion predictiva en equipos criticos AA.\n"
        "5. Programar revision de estrategia de mantenimiento para equipos con alta recurrencia."
    )

    return [
        {
            "slide_num": 1,
            "type": "title",
            "title": "Reporte Ejecutivo de Mantenimiento",
            "subtitle": f"{plant_id} — {period_label}",
        },
        {
            "slide_num": 2,
            "type": "kpi_cards",
            "title": "KPIs de Mantenimiento",
            "data": kpis,
        },
        {
            "slide_num": 3,
            "type": "table",
            "title": "Estado del Backlog",
            "data": backlog_stats,
        },
        {
            "slide_num": 4,
            "type": "chart",
            "title": "Presupuesto vs Real",
            "data": budget_variance,
        },
        {
            "slide_num": 5,
            "type": "table",
            "title": "Top 10 Equipos Criticos",
            "data": critical_equipment,
        },
        {
            "slide_num": 6,
            "type": "text",
            "title": "Resumen Ejecutivo",
            "data": summary_text,
        },
        {
            "slide_num": 7,
            "type": "text",
            "title": "Proximas Acciones",
            "data": recommendations,
        },
    ]


# ---------------------------------------------------------------------------
# Step 7 — Main entry point
# ---------------------------------------------------------------------------

def generate_executive_report(
    db: Session,
    plant_id: str = "OCP-JFC1",
    period: str = "monthly",
) -> dict:
    """Generate executive maintenance report for the given plant and period.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session (read-only).
    plant_id : str
        SAP plant code (default ``OCP-JFC1``).
    period : str
        Report period: ``"weekly"``, ``"monthly"``, or ``"quarterly"``.

    Returns
    -------
    dict
        Complete report with summary_text, slides_data, kpis,
        backlog_stats, budget_variance, critical_equipment, and metadata.
    """
    log.info(
        "ExecutiveReport: generating %s report for plant %s",
        period, plant_id,
    )

    # Step 1 — KPI metrics
    kpis = _query_kpis(db, plant_id, period)
    log.info("ExecutiveReport: KPIs — %d WOs, %d completed", kpis["total_work_orders"], kpis["completed_work_orders"])

    # Step 2 — Backlog stats
    backlog_stats = _query_backlog_stats(db)
    log.info("ExecutiveReport: Backlog — %d open items", backlog_stats["total"])

    # Step 3 — Budget variance
    budget_variance = _query_budget_variance(db, plant_id, period)
    log.info("ExecutiveReport: Budget variance — %.1f%%", budget_variance["variance_pct"])

    # Step 4 — Critical equipment
    critical_equipment = _query_critical_equipment(db, plant_id)
    log.info("ExecutiveReport: %d critical equipment identified", len(critical_equipment))

    # Step 5 — Executive summary (AI or fallback)
    summary_text = _generate_summary_with_claude(
        kpis, backlog_stats, budget_variance, critical_equipment, period, plant_id,
    )

    # Step 6 — Slides structure
    slides_data = _build_slides_data(
        kpis, backlog_stats, budget_variance, critical_equipment,
        summary_text, period, plant_id,
    )

    # Step 7 — Return complete report
    return {
        "summary_text": summary_text,
        "slides_data": slides_data,
        "kpis": kpis,
        "backlog_stats": backlog_stats,
        "budget_variance": budget_variance,
        "critical_equipment": critical_equipment,
        "period": period,
        "plant_id": plant_id,
        "generated_at": datetime.now().isoformat(),
    }
