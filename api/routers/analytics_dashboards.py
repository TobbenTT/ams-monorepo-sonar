"""Analytics dashboards — real SQL KPIs over managed_work_orders + work_requests.

Focused endpoints for the new Analytics page:
- MTBF/MTTR timeseries (6 months rolling by default)
- PM compliance % by planning group
- Backlog aging buckets
- Cost per equipment (top-N)
- Summary header KPIs
"""

from datetime import datetime, timedelta, date
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import ManagedWorkOrderModel, WorkRequestModel
from api.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/analytics-dash",
    tags=["analytics-dashboards"],
    dependencies=[Depends(get_current_user)],
)


def _base_wo_query(db: Session, plant_id: str | None):
    q = db.query(ManagedWorkOrderModel)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    return q


@router.get("/mtbf-mttr/timeseries")
def mtbf_mttr_timeseries(
    plant_id: str | None = None,
    months: int = 6,
    db: Session = Depends(get_db),
):
    """Monthly MTBF (days) and MTTR (hours) derived from corrective WOs.

    - A "failure" is a WO of type PM03 (corrective) OR priority P1/P2.
    - MTBF: number of days in the month / failures in the month (per plant).
    - MTTR: average actual_hours across failures closed in the month.
    """
    today = date.today()
    # Calcular start exactamente months meses atrás (no 31×meses días, evita off-by-one).
    total_month = today.year * 12 + (today.month - 1) - (months - 1)
    start = date(year=total_month // 12, month=(total_month % 12) + 1, day=1)

    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.created_at >= datetime.combine(start, datetime.min.time())
    )
    rows = q.all()

    buckets: dict[str, dict] = {}
    for wo in rows:
        is_failure = (wo.wo_type == "PM03") or (wo.priority_code in ("P1", "P2"))
        if not is_failure:
            continue
        ts = wo.created_at or wo.planned_start
        if not ts:
            continue
        key = ts.strftime("%Y-%m")
        b = buckets.setdefault(key, {"month": key, "failures": 0, "total_repair_h": 0.0, "closed_count": 0})
        b["failures"] += 1
        if wo.status == "CERRADO" and wo.actual_hours:
            b["total_repair_h"] += float(wo.actual_hours)
            b["closed_count"] += 1

    # Fill every month in range even if no data
    out = []
    cursor = start
    while cursor <= today:
        key = cursor.strftime("%Y-%m")
        b = buckets.get(key, {"month": key, "failures": 0, "total_repair_h": 0.0, "closed_count": 0})
        # Days in month (approx)
        if cursor.month == 12:
            next_month = cursor.replace(year=cursor.year + 1, month=1, day=1)
        else:
            next_month = cursor.replace(month=cursor.month + 1, day=1)
        days_in_month = (next_month - cursor).days
        failures = b["failures"]
        mtbf_days = round(days_in_month / failures, 1) if failures > 0 else None
        mttr_hours = round(b["total_repair_h"] / b["closed_count"], 1) if b["closed_count"] > 0 else None
        out.append({
            "month": key,
            "month_label": cursor.strftime("%b %y"),
            "failures": failures,
            "mtbf_days": mtbf_days,
            "mttr_hours": mttr_hours,
        })
        cursor = next_month
    return {"series": out, "plant_id": plant_id, "months": months}


@router.get("/pm-compliance")
def pm_compliance(plant_id: str | None = None, db: Session = Depends(get_db)):
    """PM compliance % per planning group — closed-on-time / total planned.

    On-time = closed_at within planned_end + 3 day grace. Missing planned_end
    falls back to counting a WO as "on-time" once it hits CERRADO.
    """
    q = _base_wo_query(db, plant_id).filter(ManagedWorkOrderModel.wo_type.in_(["PM01", "PM02"]))
    rows = q.all()
    groups: dict[str, dict] = defaultdict(lambda: {"total": 0, "on_time": 0, "overdue": 0, "pending": 0})
    now = datetime.now()
    for wo in rows:
        grp = wo.planning_group or "SIN_GRUPO"
        g = groups[grp]
        g["total"] += 1
        if wo.status == "CERRADO":
            if wo.planned_end and wo.closed_at:
                grace = wo.planned_end + timedelta(days=3)
                if wo.closed_at <= grace:
                    g["on_time"] += 1
                else:
                    g["overdue"] += 1
            else:
                g["on_time"] += 1
        else:
            if wo.planned_end and wo.planned_end < now:
                g["overdue"] += 1
            else:
                g["pending"] += 1
    out = []
    for grp, g in groups.items():
        compliance = round((g["on_time"] / g["total"]) * 100, 1) if g["total"] else 0
        out.append({"group": grp, "compliance_pct": compliance, **g})
    out.sort(key=lambda x: -x["total"])
    overall_total = sum(g["total"] for g in groups.values())
    overall_ontime = sum(g["on_time"] for g in groups.values())
    overall = round((overall_ontime / overall_total) * 100, 1) if overall_total else 0
    return {"by_group": out, "overall_compliance_pct": overall, "total": overall_total}


@router.get("/backlog-aging")
def backlog_aging(plant_id: str | None = None, db: Session = Depends(get_db)):
    """Backlog aging buckets across open WRs + WOs (not CERRADO/CANCELADO)."""
    now = datetime.now()
    buckets = [
        {"range": "0-7d", "min": 0, "max": 7, "count": 0},
        {"range": "8-30d", "min": 8, "max": 30, "count": 0},
        {"range": "31-60d", "min": 31, "max": 60, "count": 0},
        {"range": "61-90d", "min": 61, "max": 90, "count": 0},
        {"range": ">90d", "min": 91, "max": 99999, "count": 0},
    ]

    def _assign(age_days: int):
        for b in buckets:
            if b["min"] <= age_days <= b["max"]:
                b["count"] += 1
                return

    # WRs that haven't been approved or have pending status. El modelo actual
    # no tiene plant_id, así que no filtramos por planta (las WRs son pocas en
    # relación a las WOs; el total refleja pipeline global de avisos abiertos).
    wr_q = db.query(WorkRequestModel)
    for wr in wr_q.all():
        status = (getattr(wr, "status", "") or "").upper()
        if status in ("CERRADO", "CANCELADO", "RECHAZADO", "APROBADO"):
            continue
        created = getattr(wr, "created_at", None) or getattr(wr, "requested_date", None)
        if not created:
            continue
        age = (now - created).days
        _assign(age)

    # WOs open
    wo_q = _base_wo_query(db, plant_id).filter(
        ~ManagedWorkOrderModel.status.in_(["CERRADO", "CANCELADO"])
    )
    stale = []
    for wo in wo_q.all():
        if not wo.created_at:
            continue
        age = (now - wo.created_at).days
        _assign(age)
        if age > 90:
            stale.append({
                "wo_id": wo.wo_id,
                "wo_number": wo.wo_number,
                "equipment_tag": wo.equipment_tag,
                "age_days": age,
                "priority_code": wo.priority_code,
                "status": wo.status,
            })
    stale.sort(key=lambda x: -x["age_days"])
    total = sum(b["count"] for b in buckets)
    return {"buckets": buckets, "total": total, "stale_items": stale[:20]}


@router.get("/cost-per-equipment")
def cost_per_equipment(plant_id: str | None = None, limit: int = 10, db: Session = Depends(get_db)):
    """Top-N equipment by accumulated WO cost (labor + material + external)."""
    q = _base_wo_query(db, plant_id).filter(ManagedWorkOrderModel.equipment_tag.isnot(None))
    totals: dict[str, dict] = defaultdict(lambda: {"total_cost": 0.0, "labor": 0.0, "material": 0.0, "external": 0.0, "wo_count": 0, "actual_hours": 0.0})
    for wo in q.all():
        tag = wo.equipment_tag or "SIN_EQUIPO"
        t = totals[tag]
        labor = float(wo.labor_cost or 0)
        material = float(wo.material_cost or 0)
        external = float(wo.external_cost or 0)
        t["labor"] += labor
        t["material"] += material
        t["external"] += external
        t["total_cost"] += (labor + material + external) or float(wo.actual_total_cost or 0)
        t["wo_count"] += 1
        t["actual_hours"] += float(wo.actual_hours or 0)
    rows = [{"equipment_tag": k, **v} for k, v in totals.items()]
    rows.sort(key=lambda x: -x["total_cost"])
    total_all = sum(r["total_cost"] for r in rows)
    return {"top": rows[:limit], "total_cost_all": total_all, "equipment_count": len(rows)}


@router.get("/adherence-compliance")
def adherence_compliance(plant_id: str | None = None, days: int = 30, db: Session = Depends(get_db)):
    """Jorge SF-516 — KPIs de desempeño:
    - Adherencia: % OTs cerradas en la fecha/hora exacta planificada (±4h)
    - Cumplimiento: % OTs cerradas dentro de la ventana de 7 días planificada
    """
    now = datetime.now()
    since = now - timedelta(days=days)
    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.closed_at >= since,
        ManagedWorkOrderModel.planned_start.isnot(None),
    )
    rows = q.all()
    total = len(rows)
    if total == 0:
        return {
            "period_days": days,
            "total_closed": 0,
            "adherence_pct": None, "adherence_count": 0,
            "compliance_pct": None, "compliance_count": 0,
        }
    adherent = 0
    compliant = 0
    for wo in rows:
        actual = wo.actual_start or wo.closed_at
        plan_start = wo.planned_start
        if actual and plan_start:
            delta_h = abs((actual - plan_start).total_seconds()) / 3600.0
            if delta_h <= 4.0:
                adherent += 1
            if delta_h <= 24.0 * 7:
                compliant += 1
    return {
        "period_days": days,
        "total_closed": total,
        "adherence_pct": round(adherent / total * 100, 1),
        "adherence_count": adherent,
        "compliance_pct": round(compliant / total * 100, 1),
        "compliance_count": compliant,
    }


@router.get("/program-compliance")
def program_compliance(
    plant_id: str | None = None,
    period: str = "week",
    ref_date: str | None = None,
    db: Session = Depends(get_db),
):
    """SF-574 — Cumplimiento de Programa: HH ejecutadas vs HH planificadas.

    Mide el avance de ejecución de OTs PROGRAMADAS/CERRADAS dentro de un período.
    Distinto de adherence-compliance (que mide puntualidad de fechas): acá se mide
    volumen de horas trabajadas relativo a lo planificado.

    - period: "week" (lun-dom de ref_date) o "day" (24h de ref_date).
    - ref_date: ISO YYYY-MM-DD. Default = hoy.
    - Considera OTs cuya planned_start cae en el período (no las que se cerraron;
      eso sesgaría hacia atrás cuando hay cierre con retraso).
    """
    today = date.today()
    if ref_date:
        try:
            today = date.fromisoformat(ref_date)
        except ValueError:
            pass

    if period == "day":
        start_d = today
        end_d = today
    else:  # week — lunes a domingo
        start_d = today - timedelta(days=today.weekday())
        end_d = start_d + timedelta(days=6)

    start_dt = datetime.combine(start_d, datetime.min.time())
    end_dt = datetime.combine(end_d, datetime.max.time())

    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.planned_start.isnot(None),
        ManagedWorkOrderModel.planned_start >= start_dt,
        ManagedWorkOrderModel.planned_start <= end_dt,
    )

    rows = q.all()
    items = []
    total_planned = 0.0
    total_actual = 0.0
    for wo in rows:
        planned_h = float(wo.estimated_hours or 0)
        actual_h = float(wo.actual_hours or 0)
        total_planned += planned_h
        total_actual += actual_h
        items.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "description": wo.description,
            "equipment_tag": wo.equipment_tag,
            "status": wo.status,
            "planned_h": round(planned_h, 2),
            "actual_h": round(actual_h, 2),
            "planned_start": wo.planned_start.isoformat() if wo.planned_start else None,
        })

    compliance_pct = (
        round((total_actual / total_planned) * 100, 1) if total_planned > 0 else None
    )

    return {
        "period": period,
        "start": start_d.isoformat(),
        "end": end_d.isoformat(),
        "ref_date": today.isoformat(),
        "total_wo": len(rows),
        "total_planned_h": round(total_planned, 2),
        "total_actual_h": round(total_actual, 2),
        "compliance_pct": compliance_pct,
        "items": items,
    }


@router.get("/program-adherence")
def program_adherence(
    plant_id: str | None = None,
    period: str = "week",
    ref_date: str | None = None,
    db: Session = Depends(get_db),
):
    """SF-575 — Adherencia al Programa: % OTs ejecutadas en su fecha planificada.

    A diferencia de adherence-compliance (±4h tolerancia) y program-compliance
    (volumen de horas), acá se mide CUMPLIMIENTO DEL DÍA exacto. Si una OT
    planificada para el lunes se ejecuta el martes, NO cuenta — aunque sí
    contaría para "cumplimiento" semanal en SF-574.

    - period: "week" (lun-dom) o "day".
    - Considera OTs cuya planned_start cae en el período.
    - Adherente = actual_start.date() == planned_start.date().
    """
    today = date.today()
    if ref_date:
        try:
            today = date.fromisoformat(ref_date)
        except ValueError:
            pass

    if period == "day":
        start_d = today
        end_d = today
    else:
        start_d = today - timedelta(days=today.weekday())
        end_d = start_d + timedelta(days=6)

    start_dt = datetime.combine(start_d, datetime.min.time())
    end_dt = datetime.combine(end_d, datetime.max.time())

    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.planned_start.isnot(None),
        ManagedWorkOrderModel.planned_start >= start_dt,
        ManagedWorkOrderModel.planned_start <= end_dt,
    )

    items = []
    adherent = 0
    executed = 0
    for wo in q.all():
        plan_d = wo.planned_start.date() if wo.planned_start else None
        actual_d = (wo.actual_start or wo.closed_at).date() if (wo.actual_start or wo.closed_at) else None
        delta_days = None
        is_adherent = False
        if actual_d and plan_d:
            executed += 1
            delta_days = (actual_d - plan_d).days
            is_adherent = (delta_days == 0)
            if is_adherent:
                adherent += 1
        items.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "description": wo.description,
            "equipment_tag": wo.equipment_tag,
            "status": wo.status,
            "planned_date": plan_d.isoformat() if plan_d else None,
            "actual_date": actual_d.isoformat() if actual_d else None,
            "delta_days": delta_days,
            "is_adherent": is_adherent,
        })

    total = len(items)
    adherence_pct = round(adherent / total * 100, 1) if total > 0 else None
    return {
        "period": period,
        "start": start_d.isoformat(),
        "end": end_d.isoformat(),
        "ref_date": today.isoformat(),
        "total_planned": total,
        "executed": executed,
        "adherent": adherent,
        "non_adherent": executed - adherent,
        "not_executed": total - executed,
        "adherence_pct": adherence_pct,
        "items": items,
    }


@router.get("/backlog-alerts")
def backlog_alerts(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-576 — Avisos Atrasados + OT Atrasadas (ejecutadas no cerradas).

    - Avisos atrasados: WRs en status pendiente de revisión cuya antigüedad
      supera el SLA según prioridad (P1=1d, P2=7d, P3=14d, P4=30d).
      Se respeta sla_deadline si está seteado.
    - OT atrasadas: ManagedWO con actual_end NOT NULL pero status != CERRADO
      (notificación final dada pero cierre admin pendiente).
    """
    now = datetime.now()
    SLA_DAYS = {"P1": 1, "P2": 7, "P3": 14, "P4": 30}
    PENDING_WR = ("DRAFT", "PENDING", "PENDING_VALIDATION", "PENDING_REVIEW")

    wq = db.query(WorkRequestModel).filter(WorkRequestModel.status.in_(PENDING_WR))
    delayed_wrs = []
    for wr in wq.all():
        deadline = wr.sla_deadline
        if deadline is None:
            sla_d = SLA_DAYS.get((wr.priority_code or "P3").upper(), 14)
            deadline = (wr.created_at or now) + timedelta(days=sla_d)
        if now > deadline:
            age_h = (now - (wr.created_at or now)).total_seconds() / 3600.0
            overdue_h = (now - deadline).total_seconds() / 3600.0
            delayed_wrs.append({
                "request_id": wr.request_id,
                "equipment_tag": wr.equipment_tag,
                "priority": wr.priority_code or "P3",
                "status": wr.status,
                "created_at": wr.created_at.isoformat() if wr.created_at else None,
                "sla_deadline": deadline.isoformat(),
                "age_hours": round(age_h, 1),
                "overdue_hours": round(overdue_h, 1),
            })
    delayed_wrs.sort(key=lambda x: -x["overdue_hours"])

    oq = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.actual_end.isnot(None),
        ManagedWorkOrderModel.status != "CERRADO",
    )
    pending_close = []
    for wo in oq.all():
        delta_h = (now - wo.actual_end).total_seconds() / 3600.0 if wo.actual_end else None
        pending_close.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "priority": wo.priority_code,
            "status": wo.status,
            "actual_end": wo.actual_end.isoformat() if wo.actual_end else None,
            "hours_since_end": round(delta_h, 1) if delta_h is not None else None,
        })
    pending_close.sort(key=lambda x: -(x["hours_since_end"] or 0))

    return {
        "delayed_notifications": {"count": len(delayed_wrs), "items": delayed_wrs},
        "pending_close": {"count": len(pending_close), "items": pending_close},
    }


@router.get("/cycle-times")
def cycle_times(
    plant_id: str | None = None,
    days: int = 90,
    db: Session = Depends(get_db),
):
    """SF-585 — Tiempos de ciclo del proceso end-to-end.

    Mide deltas entre hitos para WOs cerradas en los últimos `days`:
      1. Aviso → OT creada
      2. OT creada → Planificada (planned_start)
      3. Planificada → Inicio (actual_start)
      4. Inicio → Cierre (closed_at)

    Devuelve avg/median/p90 por etapa + outliers (>2σ del avg).
    """
    import statistics
    now = datetime.now()
    since = now - timedelta(days=days)

    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.closed_at.isnot(None),
        ManagedWorkOrderModel.closed_at >= since,
    )

    stages = {
        "wr_to_wo":      [],  # wr.created_at -> wo.created_at
        "wo_to_planned": [],  # wo.created_at -> wo.planned_start
        "planned_to_start": [],  # wo.planned_start -> wo.actual_start
        "start_to_close": [],  # wo.actual_start -> wo.closed_at
    }
    rows_for_outliers = []
    for wo in q.all():
        wr = None
        if wo.work_request_id:
            wr = db.query(WorkRequestModel).filter(
                WorkRequestModel.request_id == wo.work_request_id
            ).first()
        wr_dt = wr.created_at if wr else None
        d_wr_wo   = ((wo.created_at - wr_dt).total_seconds() / 86400.0) if (wo.created_at and wr_dt) else None
        d_wo_pl   = ((wo.planned_start - wo.created_at).total_seconds() / 86400.0) if (wo.planned_start and wo.created_at) else None
        d_pl_st   = ((wo.actual_start - wo.planned_start).total_seconds() / 86400.0) if (wo.actual_start and wo.planned_start) else None
        d_st_cl   = ((wo.closed_at - wo.actual_start).total_seconds() / 86400.0) if (wo.actual_start and wo.closed_at) else None

        if d_wr_wo is not None: stages["wr_to_wo"].append(d_wr_wo)
        if d_wo_pl is not None: stages["wo_to_planned"].append(d_wo_pl)
        if d_pl_st is not None: stages["planned_to_start"].append(d_pl_st)
        if d_st_cl is not None: stages["start_to_close"].append(d_st_cl)

        rows_for_outliers.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "wo_type": wo.wo_type,
            "priority": wo.priority_code,
            "wr_to_wo_d": round(d_wr_wo, 2) if d_wr_wo is not None else None,
            "wo_to_planned_d": round(d_wo_pl, 2) if d_wo_pl is not None else None,
            "planned_to_start_d": round(d_pl_st, 2) if d_pl_st is not None else None,
            "start_to_close_d": round(d_st_cl, 2) if d_st_cl is not None else None,
        })

    def stats(values):
        if not values:
            return {"count": 0, "avg": None, "median": None, "p90": None}
        v = sorted(values)
        n = len(v)
        return {
            "count": n,
            "avg": round(sum(v) / n, 2),
            "median": round(statistics.median(v), 2),
            "p90": round(v[max(0, int(0.9 * n) - 1)], 2),
        }

    stage_stats = {k: stats(v) for k, v in stages.items()}

    # Outliers: cualquier OT con al menos un stage > avg + 2σ.
    outliers = []
    sigmas = {
        k: (statistics.stdev(v) if len(v) >= 2 else 0.0)
        for k, v in stages.items()
    }
    for r in rows_for_outliers:
        is_out = False
        for k_field, k_stage in [
            ("wr_to_wo_d", "wr_to_wo"),
            ("wo_to_planned_d", "wo_to_planned"),
            ("planned_to_start_d", "planned_to_start"),
            ("start_to_close_d", "start_to_close"),
        ]:
            v = r.get(k_field)
            avg = stage_stats[k_stage]["avg"]
            sigma = sigmas[k_stage]
            if v is not None and avg is not None and sigma > 0 and v > avg + 2 * sigma:
                is_out = True
                break
        if is_out:
            outliers.append(r)

    return {
        "period_days": days,
        "total_closed": len(rows_for_outliers),
        "stages": stage_stats,
        "outliers": outliers[:50],
    }


@router.get("/reliability-correlation")
def reliability_correlation(
    plant_id: str | None = None,
    days: int = 90,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """SF-586 — Top-N equipos críticos con métricas y correlación.

    Por equipment_tag, en últimos `days`:
      - failure_count: WOs PM03 + WRs no asignados a OT preventiva
      - mtbf_days: días / failures
      - mttr_hours: avg actual_hours en fallas
      - downtime_h: suma de actual_hours en fallas
      - availability_pct: 1 - (downtime_h / 24*days) × 100

    Correlación: equipos con failure_count alto + availability bajo → "alta_correlacion".
    """
    now = datetime.now()
    since = now - timedelta(days=days)
    period_h = days * 24.0

    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.created_at >= since,
        ManagedWorkOrderModel.equipment_tag.isnot(None),
    )

    by_tag = defaultdict(lambda: {"failures": 0, "downtime_h": 0.0, "ttr_samples": []})
    for wo in q.all():
        is_failure = (wo.wo_type == "PM03") or ((wo.priority_code or "") in ("P1", "P2"))
        if not is_failure:
            continue
        tag = wo.equipment_tag
        ah = float(wo.actual_hours or 0)
        by_tag[tag]["failures"] += 1
        by_tag[tag]["downtime_h"] += ah
        if ah > 0:
            by_tag[tag]["ttr_samples"].append(ah)

    rows = []
    avg_failures = (sum(d["failures"] for d in by_tag.values()) / len(by_tag)) if by_tag else 0
    avg_avail = None
    avails = []
    for tag, d in by_tag.items():
        if d["failures"] == 0:
            continue
        mtbf_d = round(days / d["failures"], 1)
        mttr_h = round(sum(d["ttr_samples"]) / len(d["ttr_samples"]), 2) if d["ttr_samples"] else None
        availability_pct = round(max(0.0, 1.0 - (d["downtime_h"] / period_h)) * 100, 1)
        avails.append(availability_pct)
        rows.append({
            "equipment_tag": tag,
            "failure_count": d["failures"],
            "downtime_h": round(d["downtime_h"], 2),
            "mtbf_days": mtbf_d,
            "mttr_hours": mttr_h,
            "availability_pct": availability_pct,
        })
    if avails:
        avg_avail = sum(avails) / len(avails)

    # Correlación: equipo con failure_count > avg + σ y availability < avg - σ.
    if rows:
        import statistics as _st
        sigma_f = _st.stdev([r["failure_count"] for r in rows]) if len(rows) >= 2 else 0
        sigma_a = _st.stdev([r["availability_pct"] for r in rows]) if len(rows) >= 2 else 0
        for r in rows:
            high_failures = r["failure_count"] > avg_failures + sigma_f and sigma_f > 0
            low_avail = avg_avail is not None and r["availability_pct"] < avg_avail - sigma_a and sigma_a > 0
            r["high_correlation"] = bool(high_failures and low_avail)
    rows.sort(key=lambda x: (-x["failure_count"], -x["downtime_h"]))

    return {
        "period_days": days,
        "total_equipment": len(rows),
        "avg_failures": round(avg_failures, 2),
        "avg_availability_pct": round(avg_avail, 1) if avg_avail is not None else None,
        "items": rows[:limit],
    }


@router.post("/reschedule-stale")
def reschedule_stale(plant_id: str | None = None, db: Session = Depends(get_db)):
    """Jorge SF-513 — auto-mover a REPROGRAMADO las OTs PROGRAMADO/EN_EJECUCION
    cuyo planned_end ya pasó y no se cerraron. Devuelve lista de afectadas."""
    now = datetime.now()
    q = _base_wo_query(db, plant_id).filter(
        ManagedWorkOrderModel.status.in_(["PROGRAMADO", "EN_EJECUCION"]),
        ManagedWorkOrderModel.planned_end.isnot(None),
        ManagedWorkOrderModel.planned_end < now,
    )
    affected = []
    for wo in q.all():
        wo.status = "REPROGRAMADO"
        wo.updated_at = now
        affected.append({"wo_id": wo.wo_id, "wo_number": wo.wo_number})
    db.commit()
    return {"rescheduled": len(affected), "items": affected}


@router.get("/summary")
def summary(plant_id: str | None = None, db: Session = Depends(get_db)):
    """Header KPI strip: open WOs, overdue, avg MTTR last 30d, PM compliance."""
    now = datetime.now()
    month_ago = now - timedelta(days=30)
    wo_q = _base_wo_query(db, plant_id)
    total_open = wo_q.filter(~ManagedWorkOrderModel.status.in_(["CERRADO", "CANCELADO"])).count()
    overdue = wo_q.filter(
        ~ManagedWorkOrderModel.status.in_(["CERRADO", "CANCELADO"]),
        ManagedWorkOrderModel.planned_end.isnot(None),
        ManagedWorkOrderModel.planned_end < now,
    ).count()
    closed_30d = wo_q.filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.closed_at >= month_ago,
    ).all()
    actuals = [float(w.actual_hours) for w in closed_30d if w.actual_hours]
    mttr = round(sum(actuals) / len(actuals), 1) if actuals else None
    # Reuse pm_compliance calculation
    pc = pm_compliance(plant_id=plant_id, db=db)
    return {
        "open_wos": total_open,
        "overdue_wos": overdue,
        "mttr_hours_30d": mttr,
        "closed_30d": len(closed_30d),
        "pm_compliance_pct": pc["overall_compliance_pct"],
    }
