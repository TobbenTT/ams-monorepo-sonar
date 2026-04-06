"""Agentic Shift Handover service — generates structured shift handover reports.

Aggregates work order activity, technician progress, safety notifications,
and SLA-critical backlog items into a structured handover report for the
incoming shift supervisor.

Pipeline:
  1. Query work orders for the shift window (completed, in-progress, started)
  2. Query technician progress from work assignments
  3. Query safety notifications (WARNING/CRITICAL) from the shift
  4. Query SLA-imminent backlog / work requests
  5. Generate structured summary via Claude (with template fallback)
"""

import json
import logging
import os
from datetime import datetime, timedelta, date

from sqlalchemy.orm import Session

from api.database.models import (
    ManagedWorkOrderModel,
    WorkAssignmentModel,
    NotificationModel,
    BacklogItemModel,
    WorkRequestModel,
    WorkforceModel,
)

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shift window helpers
# ---------------------------------------------------------------------------

def _shift_window(shift_date: str | None, shift_type: str) -> tuple[datetime, datetime]:
    """Return (start, end) datetimes for the requested shift window."""
    if shift_date:
        d = date.fromisoformat(shift_date)
    else:
        d = date.today()

    if shift_type == "NIGHT":
        start = datetime(d.year, d.month, d.day, 19, 0, 0)
        next_day = d + timedelta(days=1)
        end = datetime(next_day.year, next_day.month, next_day.day, 7, 0, 0)
    else:  # MORNING (default)
        start = datetime(d.year, d.month, d.day, 7, 0, 0)
        end = datetime(d.year, d.month, d.day, 19, 0, 0)

    return start, end


# ---------------------------------------------------------------------------
# Step 1 — Query work orders for the shift
# ---------------------------------------------------------------------------

def _query_shift_work_orders(
    db: Session, plant_id: str, shift_start: datetime, shift_end: datetime,
) -> dict:
    """Query WOs with actual_start in the shift window, split by status."""
    wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.actual_start >= shift_start,
            ManagedWorkOrderModel.actual_start < shift_end,
        )
        .all()
    )

    def _wo_dict(wo: ManagedWorkOrderModel) -> dict:
        return {
            "wo_id": wo.wo_id,
            "equipment_tag": wo.equipment_tag,
            "wo_type": wo.wo_type,
            "status": wo.status,
            "priority_code": wo.priority_code,
            "shift": "MORNING" if wo.actual_start and wo.actual_start.hour < 19 else "NIGHT",
            "assigned_workers": wo.assigned_workers or [],
            "actual_start": wo.actual_start.isoformat() if wo.actual_start else None,
            "actual_end": wo.actual_end.isoformat() if wo.actual_end else None,
        }

    completed = [_wo_dict(w) for w in wos if w.status == "CERRADO"]
    in_progress = [_wo_dict(w) for w in wos if w.status in ("EN_EJECUCION", "LIBERADO")]
    started = [_wo_dict(w) for w in wos if w.status not in ("CERRADO", "EN_EJECUCION", "LIBERADO")]

    return {
        "completed": completed,
        "in_progress": in_progress,
        "started": started,
        "all": wos,  # raw ORM objects for pending-materials check
    }


# ---------------------------------------------------------------------------
# Step 2 — Technician progress
# ---------------------------------------------------------------------------

def _query_technician_progress(
    db: Session, plant_id: str, shift_date: str | None,
) -> list[dict]:
    """Query work assignments for the shift date, grouped by technician."""
    if shift_date:
        d = date.fromisoformat(shift_date)
    else:
        d = date.today()

    assignments = (
        db.query(WorkAssignmentModel)
        .filter(
            WorkAssignmentModel.plant_id == plant_id,
            WorkAssignmentModel.scheduled_date == d,
        )
        .all()
    )

    # Group by assigned_to
    by_tech: dict[str, list] = {}
    for a in assignments:
        tech = a.assigned_to or "SIN_ASIGNAR"
        by_tech.setdefault(tech, []).append(a)

    results = []
    for name, tasks in by_tech.items():
        progress_values = [t.progress_pct for t in tasks if t.progress_pct is not None]
        progress_avg = round(sum(progress_values) / len(progress_values), 1) if progress_values else 0.0
        completed_count = sum(1 for t in tasks if t.status == "COMPLETED" or t.progress_pct == 100.0)

        # Collect handover notes
        handover_notes = [
            t.shift_handover_notes for t in tasks if t.shift_handover_notes
        ]
        notes_str = " | ".join(handover_notes) if handover_notes else None

        results.append({
            "name": name,
            "tasks_assigned": len(tasks),
            "progress_avg_pct": progress_avg,
            "shift_handover_notes": notes_str,
            "completed_count": completed_count,
        })

    return results


# ---------------------------------------------------------------------------
# Step 3 — Safety notifications
# ---------------------------------------------------------------------------

def _query_safety_notifications(
    db: Session, plant_id: str, shift_start: datetime, shift_end: datetime,
) -> list[dict]:
    """Query WARNING/CRITICAL notifications created during the shift window."""
    notifications = (
        db.query(NotificationModel)
        .filter(
            NotificationModel.plant_id == plant_id,
            NotificationModel.created_at >= shift_start,
            NotificationModel.created_at < shift_end,
            NotificationModel.level.in_(["WARNING", "CRITICAL"]),
        )
        .all()
    )

    return [
        {
            "title": n.title,
            "message": n.message,
            "level": n.level,
            "equipment_id": n.equipment_id,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


# ---------------------------------------------------------------------------
# Step 4 — SLA-imminent items
# ---------------------------------------------------------------------------

def _query_sla_urgent(db: Session) -> list[dict]:
    """Query work requests with SLA deadline within next 24 hours and not completed."""
    now = datetime.now()
    deadline_limit = now + timedelta(hours=24)

    items = (
        db.query(WorkRequestModel)
        .filter(
            WorkRequestModel.sla_deadline != None,  # noqa: E711
            WorkRequestModel.sla_deadline < deadline_limit,
            WorkRequestModel.status.notin_(["COMPLETED", "CLOSED", "CANCELADO"]),
        )
        .all()
    )

    return [
        {
            "request_id": wr.request_id,
            "equipment_tag": wr.equipment_tag,
            "priority": wr.priority_code,
            "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
            "status": wr.status,
        }
        for wr in items
    ]


# ---------------------------------------------------------------------------
# Attention flags
# ---------------------------------------------------------------------------

def _build_attention_flags(
    in_progress_wos: list[dict],
    safety: list[dict],
    sla_urgent: list[dict],
    technician_progress: list[dict],
    shift_end: datetime,
) -> list[str]:
    """Build attention flags for items needing immediate attention."""
    flags: list[str] = []

    # Any P1 WO still in_progress
    for wo in in_progress_wos:
        if wo.get("priority_code") == "P1":
            flags.append(
                f"OT P1 en progreso: {wo['wo_id']} — equipo {wo['equipment_tag']}"
            )

    # Any CRITICAL safety notification
    for notif in safety:
        if notif.get("level") == "CRITICAL":
            flags.append(
                f"Alerta CRITICA de seguridad: {notif['title']}"
            )

    # SLA breach within 12 hours
    now = datetime.now()
    twelve_hours = now + timedelta(hours=12)
    for item in sla_urgent:
        if item.get("sla_deadline"):
            try:
                deadline = datetime.fromisoformat(item["sla_deadline"])
                if deadline < twelve_hours:
                    flags.append(
                        f"SLA critico (<12h): {item['equipment_tag']} — "
                        f"vence {item['sla_deadline']}"
                    )
            except (ValueError, TypeError):
                pass

    # Technician with progress < 50% and shift ending
    hours_remaining = (shift_end - now).total_seconds() / 3600
    if hours_remaining < 3:  # shift ending soon
        for tech in technician_progress:
            if tech["progress_avg_pct"] < 50.0 and tech["tasks_assigned"] > 0:
                flags.append(
                    f"Tecnico {tech['name']} con progreso bajo ({tech['progress_avg_pct']}%) "
                    f"— turno por terminar"
                )

    return flags


# ---------------------------------------------------------------------------
# Pending materials
# ---------------------------------------------------------------------------

def _find_pending_materials(wos_raw: list) -> list[dict]:
    """Identify WOs where materials are not ready (qty_available < qty_required)."""
    pending = []
    for wo in wos_raw:
        if wo.status == "CERRADO":
            continue
        materials = wo.materials or []
        for mat in materials:
            qty_req = mat.get("qty_required", 0)
            qty_avail = mat.get("qty_available", 0)
            if qty_req > 0 and qty_avail < qty_req:
                pending.append({
                    "wo_id": wo.wo_id,
                    "equipment_tag": wo.equipment_tag,
                    "material_code": mat.get("code", "N/A"),
                    "description": mat.get("description", ""),
                    "qty_required": qty_req,
                    "qty_available": qty_avail,
                })
                break  # one flag per WO is enough
    return pending


# ---------------------------------------------------------------------------
# Notes for next shift
# ---------------------------------------------------------------------------

def _collect_notes_for_next_shift(technician_progress: list[dict]) -> str:
    """Aggregate shift_handover_notes from all technicians into a single string."""
    notes = []
    for tech in technician_progress:
        if tech.get("shift_handover_notes"):
            notes.append(f"[{tech['name']}] {tech['shift_handover_notes']}")

    return "\n".join(notes) if notes else "Sin notas especiales para el proximo turno."


# ---------------------------------------------------------------------------
# Step 5 — AI summary (with fallback)
# ---------------------------------------------------------------------------

def _build_handover_prompt(
    completed: list[dict],
    in_progress: list[dict],
    safety: list[dict],
    sla: list[dict],
) -> str:
    """Build the Spanish prompt for the shift handover summary."""
    return (
        "Eres un supervisor de mantenimiento. "
        "Genera un resumen de entrega de turno basado en: "
        f"OTs completadas: {json.dumps(completed, ensure_ascii=False, default=str)}. "
        f"OTs en progreso: {json.dumps(in_progress, ensure_ascii=False, default=str)}. "
        f"Alertas de seguridad: {json.dumps(safety, ensure_ascii=False, default=str)}. "
        f"Items SLA critico: {json.dumps(sla, ensure_ascii=False, default=str)}. "
        "Incluye: 1) Estado general, 2) Pendientes criticos para el proximo turno, "
        "3) Notas especiales.\n\n"
        "Responde SOLO con el texto del resumen (sin JSON, sin titulos de seccion)."
    )


def _generate_summary_with_claude(
    completed: list[dict],
    in_progress: list[dict],
    safety: list[dict],
    sla: list[dict],
) -> str:
    """Call Claude to generate the shift handover summary. Returns plain text."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.info("ANTHROPIC_API_KEY not set — using fallback handover summary")
        return _fallback_summary(completed, in_progress, safety, sla)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        prompt = _build_handover_prompt(completed, in_progress, safety, sla)

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        if text:
            return text

        log.warning("Claude returned empty response — using fallback handover summary")
        return _fallback_summary(completed, in_progress, safety, sla)
    except Exception as exc:
        log.warning("Claude handover summary failed: %s — using fallback", exc)
        return _fallback_summary(completed, in_progress, safety, sla)


def _fallback_summary(
    completed: list[dict],
    in_progress: list[dict],
    safety: list[dict],
    sla: list[dict],
) -> str:
    """Template-based fallback summary when Claude is unavailable."""
    n_completed = len(completed)
    n_in_progress = len(in_progress)
    n_safety = len(safety)
    n_sla = len(sla)

    critical_safety = [s for s in safety if s.get("level") == "CRITICAL"]
    p1_in_progress = [w for w in in_progress if w.get("priority_code") == "P1"]

    summary = (
        f"Durante este turno se completaron {n_completed} ordenes de trabajo "
        f"y {n_in_progress} permanecen en progreso."
    )

    if p1_in_progress:
        summary += (
            f" Se identificaron {len(p1_in_progress)} OT(s) de prioridad P1 aun en ejecucion "
            f"que requieren seguimiento inmediato del proximo turno."
        )

    if critical_safety:
        summary += (
            f" ATENCION: Se registraron {len(critical_safety)} alerta(s) de seguridad "
            f"de nivel CRITICO durante el turno."
        )
    elif n_safety > 0:
        summary += (
            f" Se registraron {n_safety} alerta(s) de seguridad (nivel WARNING o superior)."
        )
    else:
        summary += " No se registraron alertas de seguridad durante el turno."

    if n_sla > 0:
        summary += (
            f" Existen {n_sla} item(s) con SLA proximo a vencer (menos de 24 horas) "
            f"que deben ser priorizados."
        )

    summary += (
        " Se recomienda al turno entrante revisar las OTs en progreso, "
        "verificar disponibilidad de materiales, y atender los pendientes criticos."
    )

    return summary


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def generate_handover(
    db: Session,
    plant_id: str = "OCP-JFC1",
    shift_date: str | None = None,
    shift_type: str = "MORNING",
) -> dict:
    """Generate a structured shift handover report.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session (read-only).
    plant_id : str
        SAP plant code (default ``OCP-JFC1``).
    shift_date : str | None
        ISO date string (YYYY-MM-DD). Defaults to today.
    shift_type : str
        ``"MORNING"`` (07:00-19:00) or ``"NIGHT"`` (19:00-07:00).

    Returns
    -------
    dict
        Complete handover report with shift_summary, work orders,
        attention_flags, safety_incidents, technician_progress, etc.
    """
    log.info(
        "ShiftHandover: generating %s handover for plant %s, date %s",
        shift_type, plant_id, shift_date or "today",
    )

    effective_date = shift_date or date.today().isoformat()
    shift_start, shift_end = _shift_window(shift_date, shift_type)

    # Step 1 — Work orders for the shift
    wo_data = _query_shift_work_orders(db, plant_id, shift_start, shift_end)
    completed = wo_data["completed"]
    in_progress = wo_data["in_progress"]
    log.info(
        "ShiftHandover: %d completed, %d in-progress, %d other WOs",
        len(completed), len(in_progress), len(wo_data["started"]),
    )

    # Step 2 — Technician progress
    technician_progress = _query_technician_progress(db, plant_id, shift_date)
    log.info("ShiftHandover: %d technicians tracked", len(technician_progress))

    # Step 3 — Safety notifications
    safety_incidents = _query_safety_notifications(db, plant_id, shift_start, shift_end)
    log.info("ShiftHandover: %d safety notifications", len(safety_incidents))

    # Step 4 — SLA-imminent items
    sla_urgent = _query_sla_urgent(db)
    log.info("ShiftHandover: %d SLA-urgent items", len(sla_urgent))

    # Step 5 — AI summary
    shift_summary = _generate_summary_with_claude(
        completed, in_progress, safety_incidents, sla_urgent,
    )

    # Derived data
    attention_flags = _build_attention_flags(
        in_progress, safety_incidents, sla_urgent, technician_progress, shift_end,
    )
    pending_materials = _find_pending_materials(wo_data["all"])
    notes_for_next_shift = _collect_notes_for_next_shift(technician_progress)

    return {
        "shift_date": effective_date,
        "shift_type": shift_type,
        "plant_id": plant_id,
        "generated_at": datetime.now().isoformat(),
        "shift_summary": shift_summary,
        "completed_wos": completed,
        "in_progress_wos": in_progress,
        "attention_flags": attention_flags,
        "safety_incidents": safety_incidents,
        "pending_materials": pending_materials,
        "sla_urgent": sla_urgent,
        "technician_progress": technician_progress,
        "notes_for_next_shift": notes_for_next_shift,
    }
