"""Defect Elimination tracker service — monitors RCA→CAPA→Action pipeline.

Aggregates Root Cause Analyses, CAPAs, and Improvement Actions for a given
plant, calculates completion and effectiveness KPIs, and raises alerts for
overdue items, orphaned RCAs, and low-effectiveness trends.

Pipeline:
  1. Load RCAs, CAPAs, and Improvement Actions for the plant
  2. Check RCA→CAPA linkage (orphaned RCAs)
  3. Identify overdue CAPAs and Improvement Actions
  4. Calculate Defect Elimination KPIs
  5. Generate actionable alerts
  6. Return consolidated summary with KPIs and alerts
"""

import logging
from datetime import datetime, date
from collections import defaultdict

from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.models import (
    RCAAnalysisModel,
    CAPAItemModel,
    ImprovementActionModel,
)

logger = logging.getLogger(__name__)


def _safe_pct(numerator: int, denominator: int) -> float:
    """Return percentage avoiding division by zero."""
    if denominator == 0:
        return 0.0
    return round(numerator / denominator * 100, 1)


def _days_between(start, end) -> int:
    """Return days between two dates/datetimes, handling None gracefully."""
    if start is None or end is None:
        return 0
    if isinstance(start, datetime):
        start = start.date()
    if isinstance(end, datetime):
        end = end.date()
    return (end - start).days


def track_defect_elimination(db: Session, plant_id: str) -> dict:
    """Build a full Defect Elimination dashboard for *plant_id*.

    Returns a dict with RCA/CAPA/Action summaries, KPIs, overdue items,
    orphaned RCAs, and alerts.
    """
    today = date.today()

    # ------------------------------------------------------------------
    # 1. Load RCAs
    # ------------------------------------------------------------------
    rcas = db.query(RCAAnalysisModel).filter(
        RCAAnalysisModel.plant_id == plant_id
    ).all()

    rca_by_status: dict[str, list] = defaultdict(list)
    for r in rcas:
        rca_by_status[r.status].append(r)

    total_rcas = len(rcas)
    rca_open = len(rca_by_status.get("OPEN", []))
    rca_in_progress = len(rca_by_status.get("IN_PROGRESS", []))
    rca_completed = len(rca_by_status.get("COMPLETED", []))
    rca_closed = len(rca_by_status.get("CLOSED", []))

    # ------------------------------------------------------------------
    # 2. Load CAPAs
    # ------------------------------------------------------------------
    capas = db.query(CAPAItemModel).filter(
        CAPAItemModel.plant_id == plant_id
    ).all()

    capa_by_status: dict[str, list] = defaultdict(list)
    capa_by_phase: dict[str, list] = defaultdict(list)
    for c in capas:
        capa_by_status[c.status].append(c)
        capa_by_phase[c.current_phase].append(c)

    total_capas = len(capas)
    capa_open = len(capa_by_status.get("OPEN", []))
    capa_in_progress = len(capa_by_status.get("IN_PROGRESS", []))
    capa_closed = len(capa_by_status.get("CLOSED", []))
    capa_verified = len(capa_by_status.get("VERIFIED", []))

    # ------------------------------------------------------------------
    # 3. Load Improvement Actions
    # ------------------------------------------------------------------
    actions = db.query(ImprovementActionModel).filter(
        ImprovementActionModel.plant_id == plant_id
    ).all()

    action_by_status: dict[str, list] = defaultdict(list)
    for a in actions:
        action_by_status[a.status].append(a)

    total_actions = len(actions)
    action_open = len(action_by_status.get("OPEN", []))
    action_in_progress = len(action_by_status.get("IN_PROGRESS", []))
    action_completed = len(action_by_status.get("COMPLETED", []))

    # ------------------------------------------------------------------
    # 4. Check RCA → CAPA linkage (orphaned RCAs)
    # ------------------------------------------------------------------
    completed_rcas = rca_by_status.get("COMPLETED", []) + rca_by_status.get("CLOSED", [])
    orphaned_rca_list = []

    for rca in completed_rcas:
        has_capa = any(
            c.source and rca.analysis_id in c.source
            for c in capas
        )
        if not has_capa:
            orphaned_rca_list.append({
                "analysis_id": rca.analysis_id,
                "event_description": rca.event_description,
                "completed_at": rca.completed_at.isoformat() if rca.completed_at else None,
            })

    orphaned_count = len(orphaned_rca_list)

    # ------------------------------------------------------------------
    # 5. Identify overdue CAPAs
    # ------------------------------------------------------------------
    overdue_capa_list = []
    for c in capas:
        if c.status in ("CLOSED", "VERIFIED"):
            continue
        if c.target_date is None:
            continue
        target = c.target_date if isinstance(c.target_date, date) else c.target_date
        if isinstance(target, datetime):
            target = target.date()
        if target < today:
            days_overdue = (today - target).days
            overdue_capa_list.append({
                "capa_id": c.capa_id,
                "title": c.title,
                "assigned_to": c.assigned_to,
                "target_date": str(c.target_date),
                "days_overdue": days_overdue,
                "current_phase": c.current_phase,
            })

    # ------------------------------------------------------------------
    # 6. Identify overdue Improvement Actions
    # ------------------------------------------------------------------
    overdue_action_list = []
    for a in actions:
        if a.status == "COMPLETED":
            continue
        if a.target_date is None:
            continue
        target = a.target_date
        if isinstance(target, datetime):
            target = target.date()
        if target < today:
            days_overdue = (today - target).days
            overdue_action_list.append({
                "action_id": a.action_id,
                "title": a.title,
                "assigned_to": a.assigned_to,
                "target_date": str(a.target_date),
                "days_overdue": days_overdue,
            })

    # ------------------------------------------------------------------
    # 7. Calculate DE KPIs
    # ------------------------------------------------------------------
    rca_completion_rate = _safe_pct(rca_completed + rca_closed, total_rcas)
    capa_completion_rate = _safe_pct(capa_closed + capa_verified, total_capas)

    # Effectiveness: verified CAPAs where effectiveness_verified is True
    closed_or_verified = capa_by_status.get("CLOSED", []) + capa_by_status.get("VERIFIED", [])
    total_closed_verified = len(closed_or_verified)
    verified_effective = sum(
        1 for c in closed_or_verified
        if getattr(c, "effectiveness_verified", False)
    )
    capa_effectiveness_rate = _safe_pct(verified_effective, total_closed_verified)

    # Average CAPA cycle time (closed_at - created_at)
    cycle_days = []
    for c in capas:
        if c.closed_at and c.created_at:
            delta = _days_between(c.created_at, c.closed_at)
            if delta >= 0:
                cycle_days.append(delta)

    avg_capa_cycle_days = round(sum(cycle_days) / len(cycle_days), 1) if cycle_days else 0.0

    improvement_completion_rate = _safe_pct(action_completed, total_actions)
    orphan_rate = _safe_pct(orphaned_count, len(completed_rcas))

    # ------------------------------------------------------------------
    # 8. Generate alerts
    # ------------------------------------------------------------------
    alerts: list[str] = []

    if overdue_capa_list:
        max_overdue = max(c["days_overdue"] for c in overdue_capa_list)
        alerts.append(
            f"OVERDUE_CAPA: {len(overdue_capa_list)} CAPAs vencidas "
            f"(más antigua: {max_overdue} días)"
        )

    if orphaned_count > 0:
        alerts.append(
            f"ORPHAN_RCA: {orphaned_count} RCAs completados sin CAPA asociado"
        )

    if total_closed_verified > 0 and capa_effectiveness_rate < 50:
        alerts.append(
            f"LOW_EFFECTIVENESS: Solo {capa_effectiveness_rate}% "
            f"de CAPAs verificadas por efectividad"
        )

    # Stalled CAPAs: in PLAN phase for > 30 days
    stalled_count = 0
    for c in capa_by_phase.get("PLAN", []):
        if c.created_at:
            created = c.created_at.date() if isinstance(c.created_at, datetime) else c.created_at
            if (today - created).days > 30:
                stalled_count += 1
    if stalled_count > 0:
        alerts.append(
            f"STALLED_CAPA: {stalled_count} CAPAs en fase PLAN por más de 30 días"
        )

    # ------------------------------------------------------------------
    # 9. Return consolidated result
    # ------------------------------------------------------------------
    return {
        "plant_id": plant_id,
        "rca_summary": {
            "total": total_rcas,
            "open": rca_open,
            "in_progress": rca_in_progress,
            "completed": rca_completed,
            "closed": rca_closed,
        },
        "capa_summary": {
            "total": total_capas,
            "open": capa_open,
            "in_progress": capa_in_progress,
            "closed": capa_closed,
            "verified": capa_verified,
            "by_phase": {
                "PLAN": len(capa_by_phase.get("PLAN", [])),
                "DO": len(capa_by_phase.get("DO", [])),
                "CHECK": len(capa_by_phase.get("CHECK", [])),
                "ACT": len(capa_by_phase.get("ACT", [])),
            },
        },
        "improvement_summary": {
            "total": total_actions,
            "open": action_open,
            "in_progress": action_in_progress,
            "completed": action_completed,
        },
        "kpis": {
            "rca_completion_rate": rca_completion_rate,
            "capa_completion_rate": capa_completion_rate,
            "capa_effectiveness_rate": capa_effectiveness_rate,
            "avg_capa_cycle_days": avg_capa_cycle_days,
            "improvement_completion_rate": improvement_completion_rate,
            "orphan_rate": orphan_rate,
        },
        "overdue_capas": overdue_capa_list,
        "overdue_actions": overdue_action_list,
        "orphaned_rcas": orphaned_rca_list,
        "alerts": alerts,
        "analysis_date": datetime.now().isoformat(),
    }
