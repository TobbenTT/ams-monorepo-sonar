"""Programmer Agent — Jorge bullets r49 #8 + #11.

#8: Disponibilidad ofrecida por equipo (turno/día/semana).
#11: Reporte semanal con tareas críticas + costos + 3 semanas anteriores + horizonte 4 semanas.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel as MWO

DAY_SHIFT = (6, 18)   # 06:00–18:00
SHIFT_HOURS = 12.0
DAY_HOURS = 24.0


def _overlap_hours(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> float:
    s = max(a_start, b_start)
    e = min(a_end, b_end)
    if e <= s:
        return 0.0
    return (e - s).total_seconds() / 3600.0


def _shift_windows(day: datetime) -> list[tuple[str, datetime, datetime]]:
    base = day.replace(hour=0, minute=0, second=0, microsecond=0)
    return [
        ("day",   base.replace(hour=DAY_SHIFT[0]), base.replace(hour=DAY_SHIFT[1])),
        ("night", base.replace(hour=DAY_SHIFT[1]), base.replace(hour=23, minute=59, second=59) + timedelta(seconds=1)),
        # Pre-shift early hours 00-06 also count as night
        ("night_early", base, base.replace(hour=DAY_SHIFT[0])),
    ]


def compute_equipment_availability(
    db: Session,
    plant_id: str,
    week_start: datetime,
    days: int = 7,
) -> dict:
    """Bullet #8 — % disponibilidad ofrecida por equipo, por turno/día/semana.

    Disponibilidad = (horas calendario - horas downtime planificado) / horas calendario.
    """
    week_end = week_start + timedelta(days=days)
    rows = (
        db.query(MWO)
        .filter(MWO.plant_id == plant_id)
        .filter(MWO.planned_start.isnot(None), MWO.planned_end.isnot(None))
        .filter(MWO.planned_end > week_start, MWO.planned_start < week_end)
        .filter(MWO.status.in_(["PLANIFICADO", "PROGRAMADO", "EN_EJECUCION", "EN_PROGRAMACION"]))
        .all()
    )

    by_eq: dict[str, dict] = defaultdict(lambda: {
        "equipment_tag": "",
        "weekly_downtime_h": 0.0,
        "by_day": {},   # date_iso -> {day_h, night_h, total_h, ots:[]}
    })

    for wo in rows:
        eq = wo.equipment_tag or "UNKNOWN"
        by_eq[eq]["equipment_tag"] = eq

        # Iterate days inside window
        cur = max(wo.planned_start, week_start).replace(hour=0, minute=0, second=0, microsecond=0)
        last = min(wo.planned_end, week_end)
        while cur < last:
            day_iso = cur.date().isoformat()
            entry = by_eq[eq]["by_day"].setdefault(day_iso, {"day_h": 0.0, "night_h": 0.0, "total_h": 0.0, "ots": []})
            day_start, day_end = cur.replace(hour=DAY_SHIFT[0]), cur.replace(hour=DAY_SHIFT[1])
            day_overlap = _overlap_hours(wo.planned_start, wo.planned_end, day_start, day_end)
            night_start1, night_end1 = cur, day_start                             # 00-06
            night_start2, night_end2 = day_end, cur + timedelta(days=1)            # 18-24
            night_overlap = (
                _overlap_hours(wo.planned_start, wo.planned_end, night_start1, night_end1)
                + _overlap_hours(wo.planned_start, wo.planned_end, night_start2, night_end2)
            )
            entry["day_h"] += day_overlap
            entry["night_h"] += night_overlap
            entry["total_h"] += day_overlap + night_overlap
            if wo.wo_number not in [o["id"] for o in entry["ots"]]:
                entry["ots"].append({"id": wo.wo_number, "priority": wo.priority_code, "hours": wo.estimated_hours})
            cur += timedelta(days=1)

        by_eq[eq]["weekly_downtime_h"] += _overlap_hours(wo.planned_start, wo.planned_end, week_start, week_end)

    # Compute availability percents
    out = []
    for eq, data in by_eq.items():
        weekly_calendar = days * DAY_HOURS
        weekly_avail = max(0.0, 1.0 - data["weekly_downtime_h"] / weekly_calendar)
        days_breakdown = []
        for day_iso, dd in sorted(data["by_day"].items()):
            days_breakdown.append({
                "date": day_iso,
                "day_shift_avail": round(max(0.0, 1.0 - dd["day_h"] / SHIFT_HOURS) * 100, 1),
                "night_shift_avail": round(max(0.0, 1.0 - dd["night_h"] / SHIFT_HOURS) * 100, 1),
                "day_avail": round(max(0.0, 1.0 - dd["total_h"] / DAY_HOURS) * 100, 1),
                "downtime_h": round(dd["total_h"], 2),
                "ots": dd["ots"],
            })
        out.append({
            "equipment_tag": eq,
            "weekly_avail_pct": round(weekly_avail * 100, 1),
            "weekly_downtime_h": round(data["weekly_downtime_h"], 2),
            "days": days_breakdown,
        })
    out.sort(key=lambda r: r["weekly_avail_pct"])  # worst first
    return {
        "plant_id": plant_id,
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "equipment": out,
        "total_equipment": len(out),
    }


def weekly_program_report(
    db: Session,
    plant_id: str,
    week_start: datetime,
    history_weeks: int = 3,
    forecast_weeks: int = 4,
) -> dict:
    """Bullet #11 — programa semanal con tareas críticas, costos, 3 sem hist + 4 sem forecast."""
    week_end = week_start + timedelta(days=7)

    def _slice(s: datetime, e: datetime) -> list[MWO]:
        return (
            db.query(MWO)
            .filter(MWO.plant_id == plant_id)
            .filter(MWO.planned_start.isnot(None))
            .filter(MWO.planned_start >= s, MWO.planned_start < e)
            .all()
        )

    current = _slice(week_start, week_end)

    def _summary(rows: list[MWO]) -> dict:
        total = len(rows)
        crit = sum(1 for r in rows if r.priority_code in ("P1", "P2"))
        hours = sum((r.estimated_hours or 0.0) for r in rows)
        # cost proxy: HH × tarifa promedio (USD/HH ~ 35) + 30% materiales overhead
        cost_hh = hours * 35.0
        cost_total = cost_hh * 1.3
        statuses: dict[str, int] = defaultdict(int)
        for r in rows:
            statuses[r.status] += 1
        return {
            "total": total,
            "critical_p1p2": crit,
            "planned_hours": round(hours, 1),
            "cost_estimate_usd": round(cost_total, 0),
            "by_status": dict(statuses),
        }

    history = []
    for i in range(history_weeks, 0, -1):
        s = week_start - timedelta(days=7 * i)
        e = s + timedelta(days=7)
        history.append({
            "week_start": s.isoformat(),
            **_summary(_slice(s, e)),
        })

    forecast = []
    for i in range(1, forecast_weeks + 1):
        s = week_start + timedelta(days=7 * i)
        e = s + timedelta(days=7)
        forecast.append({
            "week_start": s.isoformat(),
            **_summary(_slice(s, e)),
        })

    critical_tasks = [
        {
            "wo_number": r.wo_number,
            "equipment_tag": r.equipment_tag,
            "priority": r.priority_code,
            "title": r.wo_title or r.description[:80],
            "planned_start": r.planned_start.isoformat() if r.planned_start else None,
            "planned_end": r.planned_end.isoformat() if r.planned_end else None,
            "estimated_hours": r.estimated_hours,
            "status": r.status,
        }
        for r in current if r.priority_code in ("P1", "P2")
    ]
    critical_tasks.sort(key=lambda x: (x["priority"], x["planned_start"] or ""))

    return {
        "plant_id": plant_id,
        "week_start": week_start.isoformat(),
        "current_week": _summary(current),
        "critical_tasks": critical_tasks,
        "history_3w": history,
        "forecast_4w": forecast,
    }
