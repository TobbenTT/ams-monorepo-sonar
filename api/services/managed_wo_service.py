"""Managed Work Orders service — full OT lifecycle (Jorge Phase 2)."""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.models import ManagedWorkOrderModel, WorkRequestModel
from api.services.audit_service import log_action


# Valid status transitions
TRANSITIONS = {
    "CREADO": ["PLANIFICADO", "PROGRAMADO", "CANCELADO"],
    "PLANIFICADO": ["PROGRAMADO", "CANCELADO"],
    "PROGRAMADO": ["PROGRAMADO", "EN_EJECUCION", "REPROGRAMADO", "CANCELADO"],
    "REPROGRAMADO": ["PROGRAMADO", "CANCELADO"],
    "EN_EJECUCION": ["EN_EJECUCION", "CERRADO", "REPROGRAMADO"],
    "CERRADO": [],
    "CANCELADO": [],
    # Legacy compat: old statuses redirect to new equivalents
    "PENDIENTE": ["PLANIFICADO", "CANCELADO"],
    "APROBADO": ["PROGRAMADO", "EN_EJECUCION", "CANCELADO"],
    "EN_PROGRESO": ["CERRADO", "REPROGRAMADO"],
}

WO_TYPES = ("PM01", "PM02", "PM03", "PM05")


def _generate_wo_number(db: Session) -> str:
    """Auto-generate sequential WO number: OT-YYYY-NNNNN."""
    year = datetime.now().year
    prefix = f"OT-{year}-"
    last = (
        db.query(ManagedWorkOrderModel)
        .filter(ManagedWorkOrderModel.wo_number.like(f"{prefix}%"))
        .order_by(ManagedWorkOrderModel.wo_number.desc())
        .first()
    )
    if last:
        try:
            seq = int(last.wo_number.split("-")[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f"{prefix}{seq:05d}"


def _to_dict(wo: ManagedWorkOrderModel) -> dict:
    return {
        "wo_id": wo.wo_id,
        "wo_number": wo.wo_number,
        "work_request_id": wo.work_request_id,
        "plant_id": wo.plant_id,
        "equipment_id": wo.equipment_id,
        "equipment_tag": wo.equipment_tag,
        "description": wo.description,
        "wo_type": wo.wo_type,
        "priority_code": wo.priority_code,
        "work_class": wo.work_class,
        "operations": wo.operations or [],
        "materials": wo.materials or [],
        "tools": wo.tools or [],
        "documents": wo.documents or [],
        "labour_summary": wo.labour_summary or {},
        "planned_start": wo.planned_start.isoformat() if wo.planned_start else None,
        "planned_end": wo.planned_end.isoformat() if wo.planned_end else None,
        "actual_start": wo.actual_start.isoformat() if wo.actual_start else None,
        "actual_end": wo.actual_end.isoformat() if wo.actual_end else None,
        "estimated_hours": wo.estimated_hours,
        "actual_hours": wo.actual_hours,
        "status": wo.status,
        "planned_by": wo.planned_by,
        "released_by": wo.released_by,
        "released_at": wo.released_at.isoformat() if wo.released_at else None,
        "closed_by": wo.closed_by,
        "closed_at": wo.closed_at.isoformat() if wo.closed_at else None,
        "assigned_workers": wo.assigned_workers or [],
        "completion_pct": wo.completion_pct,
        "execution_notes": wo.execution_notes or [],
        "risk_analysis": wo.risk_analysis,
        "budget_approved": wo.budget_approved,
        "budget_amount": wo.budget_amount,
        "labor_cost": wo.labor_cost,
        "material_cost": wo.material_cost,
        "external_cost": wo.external_cost,
        "actual_total_cost": wo.actual_total_cost,
        "is_fast_track": wo.is_fast_track,
        "shift": getattr(wo, "shift", "day") or "day",
        "created_at": wo.created_at.isoformat() if wo.created_at else None,
        "updated_at": wo.updated_at.isoformat() if wo.updated_at else None,
    }


def _auto_planning_group(wo_type: str, priority: str, description: str) -> str:
    """Auto-assign planning group based on WO type and content."""
    dl = (description or '').lower()
    if any(k in dl for k in ['electr', 'motor', 'panel', 'cable', 'voltage', 'circuit']):
        return 'ELEC-01'
    if any(k in dl for k in ['instrum', 'sensor', 'transm', 'plc', 'dcs', 'calibra', 'valvula control']):
        return 'INST-01'
    if any(k in dl for k in ['estructur', 'soldadura', 'weld', 'crack', 'corrosion', 'foundation']):
        return 'STRU-01'
    if wo_type == 'PM02':
        return 'PREV-01'
    return 'MECH-01'


def _auto_work_center(planning_group: str, plant_id: str) -> str:
    """Auto-assign work center based on planning group."""
    prefix = (plant_id or 'PLT')[:3].upper()
    center_map = {
        'MECH-01': f'{prefix}-MEC01',
        'ELEC-01': f'{prefix}-ELE01',
        'INST-01': f'{prefix}-INS01',
        'STRU-01': f'{prefix}-STR01',
        'PREV-01': f'{prefix}-PRV01',
    }
    return center_map.get(planning_group, f'{prefix}-GEN01')


def create_work_order(
    db: Session,
    equipment_tag: str,
    description: str,
    wo_type: str = "PM01",
    priority_code: str = "P3",
    plant_id: str = "OCP-JFC1",
    work_request_id: str | None = None,
    planned_by: str | None = None,
    estimated_hours: float = 4.0,
    operations: list | None = None,
    materials: list | None = None,
    tools: list | None = None,
    planning_group: str | None = None,
    work_center: str | None = None,
) -> dict:
    """Create a new managed work order (optionally from an approved WR).
    P1/P2 priorities trigger fast track: OT created directly in RELEASED status."""
    wo_number = _generate_wo_number(db)
    work_class = "NO_PROGRAMADO" if priority_code in ("P1", "P2") else "PROGRAMADO"
    is_fast_track = priority_code in ("P1", "P2")

    # Auto-estimate budget from hours (default labor rate $50/hr)
    LABOR_RATE = 50.0
    auto_budget = round(estimated_hours * LABOR_RATE, 2)

    # Auto-assign planning group and work center if not provided
    pg = planning_group or _auto_planning_group(wo_type, priority_code, description)
    wc = work_center or _auto_work_center(pg, plant_id)

    wo = ManagedWorkOrderModel(
        wo_number=wo_number,
        work_request_id=work_request_id,
        plant_id=plant_id,
        equipment_id=equipment_tag,
        equipment_tag=equipment_tag,
        description=description,
        wo_type=wo_type,
        priority_code=priority_code,
        work_class=work_class,
        planning_group=pg,
        work_center=wc,
        planned_by=planned_by,
        estimated_hours=estimated_hours,
        budget_amount=auto_budget,
        operations=operations or [],
        materials=materials or [],
        tools=tools or [],
        is_fast_track=is_fast_track,
    )

    # Fast track: P1/P2 skip planning → go directly to APROBADO
    if is_fast_track:
        wo.status = "PROGRAMADO"
        wo.released_by = planned_by
        wo.released_at = datetime.now()
        wo.execution_notes = [{
            "timestamp": datetime.now().isoformat(),
            "user": planned_by or "system",
            "note": f"[FAST TRACK] OT creada directamente en PROGRAMADO por prioridad {priority_code}",
        }]

    db.add(wo)
    log_action(db, "managed_work_order", wo.wo_id, "CREATE")
    if is_fast_track:
        log_action(db, "managed_work_order", wo.wo_id, "FAST_TRACK_PROGRAMADO")
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def create_from_work_request(db: Session, request_id: str, planned_by: str = "") -> dict | None:
    """Create a WO from an approved WR — copies equipment, priority, description, operations, materials."""
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr:
        return None
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED", "APROBADO"):
        return None

    ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
    pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
    desc_text = pd.get("original_text", "") if isinstance(pd, dict) else str(wr.problem_description or "")

    # Build materials from WR spare_parts or materials field
    materials = []
    wr_mats = getattr(wr, "materials", None)
    if isinstance(wr_mats, list) and wr_mats:
        for m in wr_mats:
            if isinstance(m, dict):
                materials.append({
                    "code": m.get("sapId", m.get("code", m.get("material_code", ""))),
                    "description": m.get("description", m.get("name", "")),
                    "quantity": int(m.get("quantity", 1) or 1),
                    "unit": m.get("unit", "PZ"),
                })
    if not materials and isinstance(wr.spare_parts, list):
        for sp in wr.spare_parts:
            if isinstance(sp, dict):
                materials.append({
                    "code": sp.get("code", sp.get("sapId", sp.get("material_code", ""))),
                    "description": sp.get("description", sp.get("name", "")),
                    "quantity": int(sp.get("quantity", sp.get("qty", 1)) or 1),
                    "unit": sp.get("unit", "PZ"),
                })
    if not materials and isinstance(pd, dict):
        for m in (pd.get("materials", []) or []):
            if isinstance(m, dict):
                materials.append({
                    "code": m.get("sapId", m.get("code", "")),
                    "description": m.get("description", ""),
                    "quantity": int(m.get("quantity", 1) or 1),
                    "unit": m.get("unit", "PZ"),
                })

    # Build operations from WR resources or classification data
    operations = []
    op_num = 1
    suggested = pd.get("suggested_action", "") if isinstance(pd, dict) else ""
    if not suggested:
        suggested = ai.get("recommended_action", "")
    failure_type = ai.get("failure_type", "")
    failure_class = ai.get("failure_class", "")
    est_hours = ai.get("estimated_duration_hours", 4.0) or 4.0

    # Try WR resources first (populated by user or AI)
    wr_resources = getattr(wr, "resources", None)
    if isinstance(wr_resources, list) and wr_resources:
        for res in wr_resources:
            if isinstance(res, dict):
                qty = int(res.get("quantity", 1) or 1)
                dur = float(res.get("hours", 1) or 1)
                operations.append({
                    "op_number": op_num,
                    "description": suggested or res.get("type", "Intervención"),
                    "op_type": res.get("op_type", "INT"),
                    "specialty": res.get("type", failure_type or "Mecánico"),
                    "quantity": qty,
                    "duration": dur,
                    "estimated_hours": qty * dur,
                    "planned_hours": qty * dur,
                })
                op_num += 1
    else:
        # Fallback: build from AI classification
        if suggested:
            operations.append({
                "op_number": op_num,
                "description": suggested,
                "op_type": "INT",
                "specialty": failure_type or "Mecánico",
                "quantity": 1,
                "duration": est_hours,
                "estimated_hours": est_hours,
                "planned_hours": est_hours,
            })
            op_num += 1

        if failure_class and failure_class != suggested:
            operations.append({
                "op_number": op_num,
                "description": f"Inspección: {failure_class}",
                "op_type": "INT",
                "specialty": failure_type or "Mecánico",
                "quantity": 1,
                "duration": 1.0,
                "estimated_hours": 1.0,
                "planned_hours": 1.0,
            })
            op_num += 1

    # Fallback: at least one generic operation
    if not operations:
        operations.append({
            "op_number": 1,
            "description": suggested or desc_text[:200] or "Intervención correctiva",
            "op_type": "INT",
            "specialty": failure_type or "Mecánico",
            "quantity": 1,
            "duration": est_hours,
            "estimated_hours": est_hours,
            "planned_hours": est_hours,
        })

    wo_type_map = {"P1": "PM01", "P2": "PM01", "P3": "PM02", "P4": "PM02"}
    text_to_pm = {"CORRECTIVO": "PM01", "PREVENTIVO": "PM02", "PREDICTIVO": "PM03", "MEJORA": "PM03"}
    raw_type = ai.get("work_order_type", "")
    wo_type = text_to_pm.get(raw_type, raw_type) if raw_type and not raw_type.startswith("PM") else (raw_type or wo_type_map.get(wr.priority_code, "PM01"))

    return create_work_order(
        db=db,
        equipment_tag=wr.equipment_tag,
        description=desc_text,
        wo_type=wo_type,
        priority_code=wr.priority_code or "P3",
        plant_id=ai.get("plant_id", "OCP-JFC1"),
        work_request_id=request_id,
        planned_by=planned_by,
        estimated_hours=ai.get("estimated_duration_hours", 4.0) or 4.0,
        operations=operations,
        materials=materials,
    )


def get_work_order(db: Session, wo_id: str) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    return _to_dict(wo) if wo else None


def list_work_orders(
    db: Session,
    status: str | None = None,
    plant_id: str | None = None,
    wo_type: str | None = None,
    priority: str | None = None,
    limit: int = 200,
    offset: int = 0,
    fast_track: bool | None = None,
) -> list[dict]:
    q = db.query(ManagedWorkOrderModel)
    if status:
        q = q.filter(ManagedWorkOrderModel.status == status)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    if wo_type:
        q = q.filter(ManagedWorkOrderModel.wo_type == wo_type)
    if priority:
        q = q.filter(ManagedWorkOrderModel.priority_code == priority)
    if fast_track is not None:
        q = q.filter(ManagedWorkOrderModel.is_fast_track == fast_track)
    items = q.order_by(ManagedWorkOrderModel.created_at.desc()).offset(offset).limit(limit).all()
    return [_to_dict(wo) for wo in items]


def update_work_order(db: Session, wo_id: str, data: dict) -> dict | None:
    """Update planning fields on a WO (before execution starts)."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if wo.status not in ("CREADO", "PLANIFICADO", "PROGRAMADO", "PENDIENTE", "APROBADO"):
        return None

    updatable = [
        "description", "wo_type", "priority_code", "estimated_hours",
        "operations", "materials", "tools", "documents", "labour_summary",
        "planned_start", "planned_end", "risk_analysis", "budget_amount", "budget_approved",
        "labor_cost", "material_cost", "external_cost", "actual_total_cost", "actual_hours", "shift",
        "assigned_workers", "status", "planning_group", "work_center",
    ]
    for key in updatable:
        if key in data:
            val = data[key]
            if key in ("planned_start", "planned_end"):
                if val is None or val == '' or val == 'null':
                    val = None
                elif isinstance(val, str):
                    try:
                        val = datetime.fromisoformat(val)
                    except ValueError:
                        val = None
            setattr(wo, key, val)

    if "priority_code" in data:
        wo.work_class = "NO_PROGRAMADO" if data["priority_code"] in ("P1", "P2") else "PROGRAMADO"

    wo.updated_at = datetime.now()
    log_action(db, "managed_work_order", wo_id, "UPDATE")
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def _transition(db: Session, wo_id: str, target_status: str, user_id: str = "", **kwargs) -> dict | None:
    """Generic status transition with validation + timestamp logging."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    allowed = TRANSITIONS.get(wo.status, [])
    if target_status not in allowed:
        return None

    old_status = wo.status
    wo.status = target_status
    wo.updated_at = datetime.now()

    # ── Timestamp logging: record every status change ──
    notes = list(wo.execution_notes or [])
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
        "note": f"Status: {old_status} -> {target_status}",
    })
    wo.execution_notes = notes

    # ── Status-specific side effects ──
    if target_status == "PLANIFICADO":
        wo.planned_by = user_id or wo.planned_by
    elif target_status == "PROGRAMADO":
        wo.released_by = user_id
        wo.released_at = datetime.now()
    elif target_status == "REPROGRAMADO":
        # Return to planner — supervisor could not execute
        pass
    elif target_status == "EN_EJECUCION":
        wo.actual_start = wo.actual_start or datetime.now()
    elif target_status == "CERRADO":
        wo.actual_end = wo.actual_end or datetime.now()
        wo.completion_pct = 100.0
        wo.closed_by = user_id
        wo.closed_at = datetime.now()
        if "actual_hours" in kwargs:
            wo.actual_hours = kwargs["actual_hours"]
    # Legacy compat
    elif target_status == "APROBADO":
        wo.released_by = user_id
        wo.released_at = datetime.now()
    elif target_status == "EN_PROGRESO":
        wo.actual_start = wo.actual_start or datetime.now()

    # Extra kwargs
    if "assigned_workers" in kwargs:
        wo.assigned_workers = kwargs["assigned_workers"]

    _create_notification(db, wo, old_status, target_status, user_id)
    log_action(db, "managed_work_order", wo_id, target_status)
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def plan_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Planner completes planning -> PLANIFICADO."""
    return _transition(db, wo_id, "PLANIFICADO", user_id)


def _parse_date(val):
    """Convert string date to datetime object if needed."""
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        try:
            # Handle: "2026-04-01T12:00:00Z", "2026-04-01 12:00:00.123", "2026-04-01"
            val = val.replace("Z", "+00:00").replace(" ", "T")
            return datetime.fromisoformat(val)
        except (ValueError, TypeError):
            try:
                return datetime.strptime(val[:10], "%Y-%m-%d")
            except (ValueError, TypeError):
                return datetime.now()
    return val


def schedule_wo(db: Session, wo_id: str, user_id: str = "", assigned_workers: list | None = None, planned_start=None, planned_end=None, shift: str = None) -> dict | None:
    """Programmer schedules -> PROGRAMADO."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if wo and planned_start:
        wo.planned_start = _parse_date(planned_start)
    if wo and planned_end:
        wo.planned_end = _parse_date(planned_end)
    if wo and shift:
        wo.shift = shift
    return _transition(db, wo_id, "PROGRAMADO", user_id, assigned_workers=assigned_workers)


def reschedule_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Supervisor returns to planner -> REPROGRAMADO."""
    return _transition(db, wo_id, "REPROGRAMADO", user_id)


def release_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Alias for plan_wo (legacy compat)."""
    return plan_wo(db, wo_id, user_id)


# Legacy alias
approve_wo = plan_wo


def reject_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Legacy: reject now cancels."""
    return _transition(db, wo_id, "CANCELADO", user_id)


def cancel_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    return _transition(db, wo_id, "CANCELADO", user_id)


# schedule_wo defined above with plan_wo/reschedule_wo


def start_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Supervisor starts execution -> EN_EJECUCION."""
    return _transition(db, wo_id, "EN_EJECUCION", user_id)


def complete_wo(db: Session, wo_id: str, user_id: str = "", actual_hours: float = 0) -> dict | None:
    """Complete is now mapped to close (CERRADO) since COMPLETED status no longer exists."""
    return _transition(db, wo_id, "CERRADO", user_id, actual_hours=actual_hours)


def close_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    return _transition(db, wo_id, "CERRADO", user_id)


def add_note(db: Session, wo_id: str, user_id: str, note: str) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    notes = list(wo.execution_notes or [])
    notes.append({"timestamp": datetime.now().isoformat(), "user": user_id, "note": note})
    wo.execution_notes = notes
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def update_progress(db: Session, wo_id: str, pct: float) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo or wo.status not in ("EN_EJECUCION", "EN_PROGRESO"):
        return None
    wo.completion_pct = min(max(pct, 0), 100)
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def get_stats(db: Session, plant_id: str | None = None) -> dict:
    """Summary stats for dashboard KPIs."""
    q = db.query(ManagedWorkOrderModel)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    all_wos = q.all()
    by_status = {}
    by_type = {}
    total_estimated = 0.0
    total_actual = 0.0
    for wo in all_wos:
        by_status[wo.status] = by_status.get(wo.status, 0) + 1
        by_type[wo.wo_type] = by_type.get(wo.wo_type, 0) + 1
        total_estimated += wo.estimated_hours or 0
        total_actual += wo.actual_hours or 0
    return {
        "total": len(all_wos),
        "by_status": by_status,
        "by_type": by_type,
        "total_estimated_hours": round(total_estimated, 1),
        "total_actual_hours": round(total_actual, 1),
    }


def draft_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Revert WO to CREADO (draft) status — only from PLANIFICADO or PROGRAMADO."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if wo.status not in ("PLANIFICADO", "PROGRAMADO", "PENDIENTE", "APROBADO", "CREADO"):
        return None
    old_status = wo.status
    wo.status = "CREADO"
    wo.updated_at = datetime.now()
    notes = list(wo.execution_notes or [])
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
        "note": f"Status: {old_status} -> CREADO (reverted to draft)",
    })
    wo.execution_notes = notes
    log_action(db, "managed_work_order", wo_id, "DRAFT")
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def _create_notification(db: Session, wo, old_status: str, new_status: str, user_id: str = ""):
    """Create in-app notification when WO status changes."""
    try:
        from api.database.models import NotificationModel
        title_map = {
            "PLANIFICADO": "WO Planned",
            "PROGRAMADO": "WO Scheduled",
            "EN_EJECUCION": "WO Started",
            "CERRADO": "WO Closed",
            "CANCELADO": "WO Cancelled",
            "REPROGRAMADO": "WO Rescheduled",
        }
        title = title_map.get(new_status, f"WO Status: {new_status}")
        message = f"{wo.wo_number} ({wo.equipment_tag}) moved from {old_status} to {new_status}"
        if wo.priority_code in ("P1", "P2"):
            message += f" [PRIORITY: {wo.priority_code}]"

        # Notify assigned workers
        targets = []
        if wo.assigned_workers:
            for w in wo.assigned_workers:
                if isinstance(w, dict):
                    targets.append(w.get("worker_id", ""))
        if wo.planned_by:
            targets.append(wo.planned_by)
        if not targets:
            targets = [""]  # broadcast

        for target in targets[:5]:
            from api.database.models import _uuid
            notif = NotificationModel(
                notification_id=_uuid(),
                notification_type="WO_STATUS_CHANGE",
                title=title,
                message=message,
                level=wo.priority_code or "P3",
                plant_id=wo.plant_id or "OCP-JFC1",
                equipment_id=wo.equipment_tag or "",
                recipient_id=target,
                channel="IN_APP",
                acknowledged=False,
            )
            db.add(notif)
    except Exception:
        pass  # Don't fail the transition if notification fails
