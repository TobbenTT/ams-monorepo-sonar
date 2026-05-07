"""Managed Work Orders router — full OT lifecycle (Jorge Phase 2)."""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.services import managed_wo_service


class WOCreateRequest(BaseModel):
    model_config = {"extra": "ignore"}
    equipment_tag: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=5000)
    wo_type: str = Field(default="PM01", pattern=r"^(PM0[1-9]|CORRECTIVO|PREVENTIVO|PREDICTIVO|MEJORA|INCIDENTE_OPERACIONAL|MONITOREO_CONDICION)$")
    priority_code: str = Field(default="P3", pattern=r"^P[1-4]$")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    work_request_id: str | None = Field(default=None, max_length=50)
    estimated_hours: float = Field(default=4.0, ge=0, le=10000)
    operations: list | None = Field(default=None, max_length=200)
    materials: list | None = Field(default=None, max_length=500)
    tools: list | None = Field(default=None, max_length=200)


class WOFromWRRequest(BaseModel):
    model_config = {"extra": "ignore"}
    work_request_id: str
    plant_id: str | None = None


class WOUpdateRequest(BaseModel):
    model_config = {"extra": "ignore"}
    description: str | None = None
    wo_type: str | None = None
    priority_code: str | None = None
    estimated_hours: float | None = None
    operations: list | None = None
    materials: list | None = None
    tools: list | None = None
    documents: list | None = None
    labour_summary: dict | None = None
    planned_start: str | None = None
    planned_end: str | None = None
    risk_analysis: dict | None = None
    budget_amount: float | None = None
    budget_approved: bool | None = None
    labor_cost: float | None = None
    material_cost: float | None = None
    external_cost: float | None = None
    actual_total_cost: float | None = None
    actual_hours: float | None = None
    shift: str | None = None
    status: str | None = None
    assigned_workers: list | None = None
    planning_group: str | None = None
    work_center: str | None = None
    reservation_code: str | None = None       # Jorge 2026-04-20: última/activa
    reservation_codes: list | None = None      # Jorge 2026-04-20: historial
    cancellation_reason: str | None = None
    contractor_crew_id: str | None = None      # Group C #8


class WOScheduleRequest(BaseModel):
    model_config = {"extra": "ignore"}
    assigned_workers: list | None = None
    planned_start: str | None = None
    planned_end: str | None = None
    shift: str | None = None


class WOCompleteRequest(BaseModel):
    model_config = {"extra": "ignore"}
    actual_hours: float = 0


class WOCloseRequest(BaseModel):
    """Closure payload: supervisor signature is mandatory; optional PIN, notes
    and per-operation actuals (plan-vs-actual capture).

    Acepta `notes` o `closure_notes` (alias) — model storage es `closure_notes`.
    """
    model_config = {"extra": "ignore", "populate_by_name": True}
    signature: str = Field(min_length=2, max_length=120)
    pin: str | None = None
    notes: str | None = Field(default=None, alias="closure_notes")
    actual_hours: float | None = None
    operations: list | None = None
    closure_audio_url: str | None = None  # SF-500
    # Pre-close gates (Jorge 2026-04-30): supervisor confirma manual gates +
    # justifica overrides de gates auto que están en falla.
    gate_acks: dict | None = None         # {"SUPERVISOR_QA": true}
    gate_overrides: dict | None = None    # {"HH_VARIANCE_OK": "razon ≥10 chars"}


class WONoteRequest(BaseModel):
    model_config = {"extra": "ignore"}
    note: str = Field(min_length=1)


class WOProgressRequest(BaseModel):
    model_config = {"extra": "ignore"}
    completion_pct: float = Field(ge=0, le=100)


router = APIRouter(
    prefix="/managed-work-orders",
    tags=["managed-work-orders"],
    dependencies=[Depends(get_current_user)],
)


def _max_depth(obj, depth=0):
    if depth > 12:
        return depth
    if isinstance(obj, dict):
        return max((_max_depth(v, depth + 1) for v in obj.values()), default=depth)
    if isinstance(obj, list):
        return max((_max_depth(v, depth + 1) for v in obj), default=depth)
    return depth


@router.post("/")
def create_work_order(
    data: WOCreateRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    from api.database.models import HierarchyNodeModel
    if not db.query(HierarchyNodeModel.tag).filter(
        HierarchyNodeModel.tag == data.equipment_tag
    ).first():
        raise HTTPException(
            status_code=400,
            detail=f"equipment_tag '{data.equipment_tag}' no existe en la jerarquía",
        )
    # Depth bomb guard (pentest 2026-05-06): rechaza JSON nested >12 niveles
    # en operations/materials/tools para evitar DoS por recursión profunda.
    for fld_name, fld in (("operations", data.operations), ("materials", data.materials), ("tools", data.tools)):
        if fld is not None and _max_depth(fld) > 12:
            raise HTTPException(
                status_code=422,
                detail=f"Campo '{fld_name}' con anidamiento excesivo (>12 niveles)",
            )
    result = managed_wo_service.create_work_order(
        db,
        equipment_tag=data.equipment_tag,
        description=data.description,
        wo_type=data.wo_type,
        priority_code=data.priority_code,
        plant_id=data.plant_id,
        work_request_id=data.work_request_id,
        planned_by=getattr(user, "user_id", ""),
        estimated_hours=data.estimated_hours,
        operations=data.operations,
        materials=data.materials,
        tools=data.tools,
    )
    return result


@router.post("/from-wr")
def create_from_work_request(
    data: WOFromWRRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """Create a WO from an approved Work Request."""
    result = managed_wo_service.create_from_work_request(
        db, data.work_request_id, planned_by=getattr(user, "user_id", ""), plant_id=data.plant_id,
    )
    if not result:
        raise HTTPException(status_code=400, detail="WR not found or not in approvable status")
    return result


@router.get("/")
def list_work_orders(
    status: str | None = None,
    plant_id: str | None = None,
    wo_type: str | None = None,
    priority: str | None = None,
    fast_track: bool | None = None,
    limit: int = 200,
    offset: int = 0,
    light: bool = False,  # when True, returns only the fields needed by lists (≈70% smaller payload)
    paginated: bool = False,  # Group B #4 — opt-in paginated response {items,total,limit,offset,has_more}
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # IDOR fix (pentest 2026-05-06): scope plant para usuarios no-admin/manager.
    user_plant = getattr(user, "plant_id", None)
    if user_plant and user.role not in ("admin", "manager"):
        plant_id = user_plant
    return managed_wo_service.list_work_orders(db, status, plant_id, wo_type, priority, limit, offset, fast_track=fast_track, light=light, paginated=paginated)


@router.get("/stats")
def get_stats(plant_id: str | None = None, db: Session = Depends(get_db)):
    return managed_wo_service.get_stats(db, plant_id)


@router.get("/{wo_id}/impact-score")
def get_impact_score(wo_id: str, db: Session = Depends(get_db)):
    """Multi-criteria impact score for a single WO (replaces the priority-lookup
    hardcode in the OT detail modal). Returns the same 6-factor breakdown
    that the backlog ranker uses so users can see *why* a WO scores what it does."""
    from api.services.agentic_smart_backlog_service import score_managed_wo
    result = score_managed_wo(db, wo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return result


@router.get("/{wo_id}")
def get_work_order(wo_id: str, plant_id: str | None = None, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.get_work_order(db, wo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    # IDOR protection: verify user has access to this plant
    wo_plant = result.get("plant_id")
    if wo_plant and plant_id and wo_plant != plant_id:
        raise HTTPException(status_code=403, detail="Access denied to this work order")
    return result


@router.put("/{wo_id}")
def update_work_order(
    wo_id: str,
    data: WOUpdateRequest,
    request: Request,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    # Group A #3 — block edits on CERRADO (audit/legal lock post-closure)
    from api.database.models import ManagedWorkOrderModel as _M
    existing = db.query(_M).filter(_M.wo_id == wo_id).first()
    if existing and existing.status == "CERRADO":
        raise HTTPException(status_code=409, detail="Work order is closed and locked — cannot be edited.")
    update_data = data.model_dump(exclude_none=True)
    # Handle empty strings as "clear field" for dates and workers
    raw = data.model_dump()
    for field in ['planned_start', 'planned_end', 'assigned_workers']:
        if raw.get(field) == '' or raw.get(field) == []:
            update_data[field] = None
    # Group B #2 — pass authenticated user for audit trail attribution
    update_data.setdefault("updated_by", getattr(user, "user_id", "system"))
    # Fase 9 — If-Match header para optimistic concurrency
    if_match = request.headers.get("if-match")
    if_match_version = None
    if if_match:
        try:
            if_match_version = int(if_match.strip().strip('"'))
        except ValueError:
            pass
    try:
        result = managed_wo_service.update_work_order(db, wo_id, update_data, if_match_version=if_match_version)
    except managed_wo_service.OptimisticLockError as oe:
        raise HTTPException(
            status_code=409,
            detail={
                "error": "version_conflict",
                "message": "La OT fue modificada por otro usuario. Recarga y vuelve a aplicar tus cambios.",
                "current_version": oe.current_version,
                "sent_version": oe.sent_version,
            },
        )
    if not result:
        raise HTTPException(status_code=400, detail="WO not found or not editable (must be PENDIENTE/APROBADO)")
    return result


@router.put("/{wo_id}/draft")
def draft_work_order(
    wo_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.draft_wo(db, wo_id, getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot revert to draft — WO not found or invalid status")
    return result

@router.put("/{wo_id}/plan")
def plan_work_order(
    wo_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.plan_wo(db, wo_id, getattr(user, "user_id", ""))
    if not result:
        # Diagnóstico: leer el WO actual y dar un mensaje útil — diferenciar
        # "no existe" vs "status no permite la transición". Antes el genérico
        # confundía al supervisor durante demo (Gonzalo 2026-05-07).
        from api.database.models import ManagedWorkOrderModel
        wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
        if not wo:
            raise HTTPException(status_code=404, detail=f"WO {wo_id} no encontrada. Refrescá la página y reintentá.")
        from api.services.managed_wo_service import TRANSITIONS
        allowed = TRANSITIONS.get(wo.status, [])
        if "PLANIFICADO" not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"OT en status '{wo.status}' no puede pasar a PLANIFICADO. Transiciones válidas desde {wo.status}: {', '.join(allowed) or 'ninguna (terminal)'}."
            )
        raise HTTPException(status_code=400, detail="Cannot plan — error desconocido")
    return result


@router.put("/{wo_id}/release")
def release_work_order(
    wo_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.release_wo(db, wo_id, getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot release — WO not found or invalid status")
    return result


@router.put("/{wo_id}/schedule")
def schedule_work_order(
    wo_id: str,
    data: WOScheduleRequest = None,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    workers = data.assigned_workers if data else None
    p_start = data.planned_start if data else None
    p_end = data.planned_end if data else None
    p_shift = data.shift if data else None
    result = managed_wo_service.schedule_wo(db, wo_id, getattr(user, "user_id", ""), workers, planned_start=p_start, planned_end=p_end, shift=p_shift)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot schedule — WO not found or invalid status")
    return result


class WORescheduleRequest(BaseModel):
    model_config = {"extra": "ignore"}
    reason: str = Field(..., min_length=3)


@router.put("/{wo_id}/reschedule")
def reschedule_work_order(
    wo_id: str,
    data: WORescheduleRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SF-578 — Supervisor returns WO to planner (REPROGRAMADO).
    Motivo OBLIGATORIO (mínimo 3 caracteres). Queda en reschedule_reason +
    audit log para trazabilidad."""
    reason = (data.reason or "").strip()
    if len(reason) < 3:
        raise HTTPException(status_code=422, detail="Motivo de reprogramación obligatorio (mínimo 3 caracteres)")
    result = managed_wo_service.reschedule_wo(db, wo_id, getattr(user, "user_id", ""), reason=reason)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot reschedule — WO not found or invalid status")
    return result


@router.put("/{wo_id}/start")
def start_work_order(wo_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.start_wo(db, wo_id, getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot start — WO not found or invalid status")
    return result


@router.put("/{wo_id}/complete")
def complete_work_order(
    wo_id: str, data: WOCompleteRequest,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    result = managed_wo_service.complete_wo(db, wo_id, getattr(user, "user_id", ""), data.actual_hours)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot complete — WO not found or invalid status")
    return result


@router.put("/{wo_id}/close")
def close_work_order(
    wo_id: str,
    data: WOCloseRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.close_wo(
        db, wo_id,
        user_id=getattr(user, "user_id", ""),
        signature=data.signature,
        pin=data.pin,
        notes=data.notes,
        actual_hours=data.actual_hours,
        operations=data.operations,
        closure_audio_url=data.closure_audio_url,
        gate_acks=data.gate_acks,
        gate_overrides=data.gate_overrides,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Cannot close — WO not found, invalid status, or missing signature")
    return result


@router.get("/{wo_id}/close-gates")
def get_close_gates(wo_id: str, db: Session = Depends(get_db)):
    """Pre-close gates state — usado por el modal de cierre para mostrar
    qué condiciones están cumplidas y cuáles requieren ack manual o override.
    """
    from api.database.models import ManagedWorkOrderModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="WO not found")
    return managed_wo_service.compute_close_gates(wo)


@router.post("/{wo_id}/sap-sync")
def sap_sync_wo(
    wo_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """Group C #6 — queue WO for SAP PM push. Idempotent."""
    from api.services import sap_sync_service
    result = sap_sync_service.push_wo(db, wo_id, user=getattr(user, "user_id", "system"))
    if not result:
        raise HTTPException(status_code=404, detail="WO not found")
    return result


@router.get("/{wo_id}/sap-sync")
def sap_sync_status(
    wo_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from api.services import sap_sync_service
    result = sap_sync_service.get_status(db, wo_id)
    return result or {"status": "NOT_SYNCED"}


@router.post("/{wo_id}/post-review")
def save_post_closure_review(
    wo_id: str,
    data: dict,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """Jorge 2026-04-21 — guardar review post-cierre (RCM feedback).
    Body: {root_cause_confirmed, lessons_learned, pm_frequency_suggestion,
           spare_parts_accuracy}. Solo válido si OT está CERRADO."""
    from api.database.models import ManagedWorkOrderModel as _M
    from datetime import datetime as _dt
    wo = db.query(_M).filter(_M.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="WO not found")
    if wo.status != "CERRADO":
        raise HTTPException(status_code=400, detail="Solo OTs cerradas pueden tener review")
    review = {
        "root_cause_confirmed": data.get("root_cause_confirmed", ""),
        "lessons_learned": data.get("lessons_learned", ""),
        "pm_frequency_suggestion": data.get("pm_frequency_suggestion", ""),
        "spare_parts_accuracy": data.get("spare_parts_accuracy", ""),
        "reviewed_by": getattr(user, "user_id", "unknown"),
        "reviewed_at": _dt.now().isoformat(),
    }
    wo.post_closure_review = review
    db.commit()
    return review


@router.get("/{wo_id}/history")
def get_wo_history(
    wo_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return full change history for a WO — combines audit_log diffs with
    execution_notes (status transitions + user notes). Newest first."""
    from api.database.models import AuditLogModel, ManagedWorkOrderModel as _M
    wo = db.query(_M).filter(_M.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="WO not found")
    entries = []
    logs = db.query(AuditLogModel).filter(
        AuditLogModel.entity_type == "managed_work_order",
        AuditLogModel.entity_id == wo_id,
    ).order_by(AuditLogModel.timestamp.desc()).limit(500).all()
    for lg in logs:
        entries.append({
            "timestamp": lg.timestamp.isoformat() if lg.timestamp else None,
            "user": lg.user or "system",
            "action": lg.action,
            "changes": (lg.payload or {}).get("changes") if lg.payload else None,
            "source": "audit",
        })
    for n in (wo.execution_notes or []):
        entries.append({
            "timestamp": n.get("timestamp"),
            "user": n.get("user") or "system",
            "action": "NOTE",
            "note": n.get("note"),
            "source": "note",
        })
    entries.sort(key=lambda e: e.get("timestamp") or "", reverse=True)
    return {"wo_id": wo_id, "wo_number": wo.wo_number, "entries": entries}


class WOBulkStatusRequest(BaseModel):
    model_config = {"extra": "ignore"}
    wo_ids: list[str]
    target_status: str = "EN_PROGRAMACION"
    reason: str | None = None


@router.post("/bulk-status")
def bulk_change_status(
    data: WOBulkStatusRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """SF-557 — Cambio masivo de estatus con trazabilidad.

    Permite mover N OTs a un mismo estatus (típicamente EN_PROGRAMACION) en
    una sola operación. Cada cambio queda registrado en audit_log con user,
    timestamp, estatus origen → destino y motivo opcional.
    """
    from datetime import datetime as _dt
    from api.database.models import AuditLogModel, ManagedWorkOrderModel as _M

    target = (data.target_status or "EN_PROGRAMACION").upper()
    user_id = getattr(user, "user_id", "") or "system"
    now = _dt.now()
    results = {"updated": [], "skipped": [], "target_status": target}

    for wo_id in (data.wo_ids or []):
        wo = db.query(_M).filter(_M.wo_id == wo_id).first()
        if not wo:
            results["skipped"].append({"wo_id": wo_id, "reason": "not_found"})
            continue
        if wo.status == target:
            results["skipped"].append({"wo_id": wo_id, "reason": "already_in_status"})
            continue
        prev_status = wo.status
        wo.status = target
        wo.updated_at = now
        db.add(AuditLogModel(
            entity_type="managed_work_order",
            entity_id=wo_id,
            action="STATUS_CHANGE",
            user=user_id,
            payload={
                "changes": {"status": {"from": prev_status, "to": target}},
                "reason": data.reason,
                "bulk": True,
            },
            timestamp=now,
        ))
        results["updated"].append({
            "wo_id": wo_id,
            "wo_number": wo.wo_number,
            "from": prev_status,
            "to": target,
        })

    db.commit()
    return results


@router.post("/{wo_id}/notes")
def add_note(wo_id: str, data: WONoteRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.add_note(db, wo_id, getattr(user, "user_id", ""), data.note)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return result


@router.put("/{wo_id}/progress")
def update_progress(wo_id: str, data: WOProgressRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    result = managed_wo_service.update_progress(db, wo_id, data.completion_pct)
    if not result:
        raise HTTPException(status_code=400, detail="WO not found or not EN_PROGRESO")
    return result


class WOPartialNotifyRequest(BaseModel):
    model_config = {"extra": "ignore"}
    op_seq: int
    hours: float = Field(gt=0)
    technician_id: str | None = None
    shift: str | None = None
    note: str | None = None


@router.post("/{wo_id}/notify-partial")
def notify_partial(
    wo_id: str,
    data: WOPartialNotifyRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SF-572 — Notificación parcial multi-turno. Si todas las ops llegan a 100%
    se gatilla notificación FINAL automática (flag final_auto_triggered=true)."""
    result = managed_wo_service.notify_operation_partial(
        db, wo_id, data.op_seq, data.hours,
        technician_id=data.technician_id or "",
        shift=data.shift or "",
        note=data.note or "",
        user_id=getattr(user, "user_id", ""),
    )
    if not result:
        raise HTTPException(status_code=400, detail="WO/op not found or WO not in execution")
    return result




class WOCancelRequest(BaseModel):
    model_config = {"extra": "ignore"}
    reason: str | None = None
    cancellation_type: str | None = None  # ABSORBED | NOT_NEEDED | OTHER
    absorbed_by_wo_id: str | None = None


@router.get("/{wo_id}/absorbed")
def list_absorbed_wos(wo_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """SF-579 — Lista de OTs canceladas por absorción que apuntan a esta OT PM03."""
    from api.database.models import ManagedWorkOrderModel
    rows = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.absorbed_by_wo_id == wo_id,
        ManagedWorkOrderModel.cancellation_type == "ABSORBED",
    ).all()
    return [{
        "wo_id": w.wo_id,
        "wo_number": w.wo_number,
        "wo_type": w.wo_type,
        "priority_code": w.priority_code,
        "equipment_tag": w.equipment_tag,
        "description": w.description,
        "estimated_hours": w.estimated_hours,
        "cancellation_reason": w.cancellation_reason,
        "cancelled_at": w.updated_at.isoformat() if w.updated_at else None,
    } for w in rows]


class WOSupportEquipUpdate(BaseModel):
    model_config = {"extra": "ignore"}
    support_equipment: list = []


@router.put("/{wo_id}/support-equipment")
def update_support_equipment(
    wo_id: str,
    data: WOSupportEquipUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update support_equipment list directly (bypass optimistic lock).
    Jorge 2026-04-28: equipos de apoyo son metadata accesoria que no debería
    bloquearse por concurrencia (otros campos sí)."""
    from api.database.models import ManagedWorkOrderModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="WO not found")
    if wo.status in ("CERRADO", "CANCELADO"):
        raise HTTPException(status_code=400, detail="WO already closed/cancelled")
    # Jorge 2026-04-30: normalizar items que vienen como string del form
    # (legacy) → dict {tag, name, equipment_type, hours, notes}.
    raw = data.support_equipment or []
    normalized = []
    for s in raw:
        if isinstance(s, dict):
            normalized.append(s)
        elif isinstance(s, str) and s.strip():
            normalized.append({"tag": s.strip(), "name": s.strip(), "equipment_type": "OTHER", "hours": 1, "notes": ""})
    wo.support_equipment = normalized
    # JSON columns en SQLAlchemy: flag_modified obligatorio si se quiere persistir
    # un cambio de la lista. Antes faltaba → el commit no escribía nada en algunos casos.
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(wo, "support_equipment")
    db.commit()
    db.refresh(wo)
    return managed_wo_service._to_dict(wo)


@router.put("/{wo_id}/cancel")
def cancel_work_order(
    wo_id: str,
    payload: WOCancelRequest | None = None,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SF-579 — Cancel a WO with reason + type. type=ABSORBED requires absorbed_by_wo_id."""
    p = payload or WOCancelRequest()
    if p.cancellation_type == "ABSORBED" and not p.absorbed_by_wo_id:
        raise HTTPException(status_code=400, detail="absorbed_by_wo_id required when type=ABSORBED")
    result = managed_wo_service.cancel_wo(
        db, wo_id, getattr(user, "user_id", ""),
        reason=p.reason,
        cancellation_type=p.cancellation_type,
        absorbed_by_wo_id=p.absorbed_by_wo_id,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Cannot cancel - WO not found, already closed, or invalid absorbing OT (must exist and be PM03)")
    return result

@router.delete("/{wo_id}", dependencies=[Depends(require_role("admin", "planner"))])
def delete_work_order(wo_id: str, db: Session = Depends(get_db)):
    from api.database.models import ManagedWorkOrderModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    db.delete(wo)
    db.commit()
    return {"deleted": wo_id, "wo_number": wo.wo_number}


class WOCloseVerifyRequest(BaseModel):
    model_config = {"extra": "ignore"}
    actual_hours: float = 0
    observations: str = ""
    materials_used: list = []


@router.post("/{wo_id}/verify-close")
def verify_close_with_ai(
    wo_id: str,
    data: WOCloseVerifyRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI verification before closing a WO - checks completeness."""
    wo = managed_wo_service.get_work_order(db, wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    issues = []
    warnings = []

    if not data.actual_hours or data.actual_hours <= 0:
        issues.append("Actual hours not recorded")
    if not data.observations:
        warnings.append("No execution observations provided")

    plan_hours = wo.get("estimated_hours", 0) or 0
    if plan_hours > 0 and data.actual_hours > 0:
        variance = abs(data.actual_hours - plan_hours) / plan_hours
        if variance > 0.5:
            pct = int(variance * 100)
            warnings.append("Hours variance is " + str(pct) + "% (planned: " + str(plan_hours) + "h, actual: " + str(data.actual_hours) + "h)")

    ops = wo.get("operations", [])
    if not ops:
        warnings.append("No operations defined for this WO")

    mats = wo.get("materials", [])
    if mats and not data.materials_used:
        warnings.append(str(len(mats)) + " materials were planned but none reported as used")

    import os
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    ai_summary = ""
    if api_key and (data.observations or data.actual_hours):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            wo_num = wo.get("wo_number", "")
            wo_desc = wo.get("description", "")
            wo_equip = wo.get("equipment_tag", "")
            wo_prio = wo.get("priority_code", "")
            obs_text = data.observations or "None provided"
            prompt = (
                "You are a maintenance engineering AI verifying a Work Order closure.\n"
                "WO: " + str(wo_num) + " - " + str(wo_desc) + "\n"
                "Equipment: " + str(wo_equip) + "\n"
                "Priority: " + str(wo_prio) + "\n"
                "Planned hours: " + str(plan_hours) + "h | Actual hours: " + str(data.actual_hours) + "h\n"
                "Operations: " + str(len(ops)) + " steps defined\n"
                "Materials planned: " + str(len(mats)) + " items\n"
                "Observations: " + str(obs_text) + "\n"
                "Materials used: " + str(len(data.materials_used)) + " items reported\n\n"
                "Evaluate if this WO is ready to close. Be concise (2-3 sentences). Flag any concerns. Respond in the same language as the observations."
            )
            resp = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )
            ai_summary = resp.content[0].text
        except Exception as e:
            ai_summary = "AI verification temporarily unavailable"

    ready = len(issues) == 0
    message_parts = []
    if issues:
        message_parts.append("BLOCKING:\n" + "\n".join("- " + i for i in issues))
    if warnings:
        message_parts.append("WARNINGS:\n" + "\n".join("- " + w for w in warnings))
    if ai_summary:
        message_parts.append("AI ASSESSMENT:\n" + ai_summary)
    if ready and not warnings:
        message_parts.append("All checks passed. WO is ready to close.")

    return {
        "ready": ready,
        "issues": issues,
        "warnings": warnings,
        "ai_summary": ai_summary,
        "message": "\n\n".join(message_parts),
    }



@router.post("/{wo_id}/ai-estimate")
def ai_estimate_duration(
    wo_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI predicts actual duration based on WO details and similar past WOs."""
    import os, json
    wo = managed_wo_service.get_work_order(db, wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    # Get similar closed WOs for reference
    from api.database.models import ManagedWorkOrderModel
    similar = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(["CERRADO", "COMPLETED"]),
        ManagedWorkOrderModel.equipment_tag == wo.get("equipment_tag", ""),
    ).order_by(ManagedWorkOrderModel.closed_at.desc()).limit(5).all()

    similar_data = []
    for s in similar:
        similar_data.append({
            "wo_number": s.wo_number,
            "estimated_hours": s.estimated_hours,
            "actual_hours": s.actual_hours,
            "wo_type": s.wo_type,
            "description": (s.description or "")[:80],
        })

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        avg = wo.get("estimated_hours", 4)
        if similar_data:
            actuals = [s["actual_hours"] for s in similar_data if s.get("actual_hours")]
            if actuals:
                avg = sum(actuals) / len(actuals)
        return {"predicted_hours": round(avg, 1), "confidence": 60, "basis": "historical_average", "similar_count": len(similar_data)}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        prompt = (
            "Predict the actual duration for this maintenance work order.\n\n"
            "CURRENT WO:\n"
            "- Type: " + str(wo.get("wo_type", "")) + "\n"
            "- Equipment: " + str(wo.get("equipment_tag", "")) + "\n"
            "- Description: " + str(wo.get("description", ""))[:200] + "\n"
            "- Planned hours: " + str(wo.get("estimated_hours", 4)) + "h\n"
            "- Operations: " + str(len(wo.get("operations", []))) + " steps\n"
            "- Materials: " + str(len(wo.get("materials", []))) + " items\n"
            "- Priority: " + str(wo.get("priority_code", "")) + "\n\n"
            "SIMILAR PAST WOs on same equipment:\n" + json.dumps(similar_data, indent=2) + "\n\n"
            "Return ONLY a JSON object: {\"predicted_hours\": X.X, \"confidence\": 0-100, \"reasoning\": \"brief\"}"
        )
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        import re
        text = resp.content[0].text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result["similar_count"] = len(similar_data)
            result["ai_used"] = True
            return result
        return {"predicted_hours": wo.get("estimated_hours", 4), "confidence": 50, "basis": "fallback", "ai_used": False}
    except Exception as e:
        return {"predicted_hours": wo.get("estimated_hours", 4), "confidence": 30, "error": "AI estimation unavailable", "ai_used": False}



@router.get("/{wo_id}/closure-report")
def generate_closure_report(
    wo_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a PDF closure report for a completed/closed WO."""
    wo = managed_wo_service.get_work_order(db, wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    from io import BytesIO
    from datetime import datetime
    from html import escape as esc

    # Build HTML report
    ops_html = ""
    for i, op in enumerate(wo.get("operations", []) or []):
        if isinstance(op, dict):
            ops_html += f"<tr><td>{i+1}</td><td>{esc(str(op.get('description','')))}</td><td>{esc(str(op.get('specialty','')))}</td><td>{esc(str(op.get('quantity',1)))} x {esc(str(op.get('hours',0)))}h</td></tr>"

    mats_html = ""
    for m in wo.get("materials", []) or []:
        if isinstance(m, dict):
            mats_html += f"<tr><td>{esc(str(m.get('sapId', m.get('code',''))))}</td><td>{esc(str(m.get('description','')))}</td><td>{esc(str(m.get('quantity',0)))} {esc(str(m.get('unit','PZ')))}</td></tr>"

    # Resolve user UUIDs to names
    from api.database.models import UserModel
    _user_cache = {}
    def _resolve_user(uid):
        if not uid or len(str(uid)) < 30: return str(uid)
        if uid in _user_cache: return _user_cache[uid]
        u = db.query(UserModel).filter(UserModel.user_id == uid).first()
        name = (u.full_name or u.username) if u else uid[:12]
        _user_cache[uid] = name
        return name

    # Deduplicate execution notes
    seen_notes = set()
    notes_html = ""
    for n in wo.get("execution_notes", []) or []:
        if isinstance(n, dict):
            note_key = n.get('note', '')
            if note_key in seen_notes: continue
            seen_notes.add(note_key)
            user_name = _resolve_user(n.get('user', ''))
            notes_html += f"<tr><td>{esc(str(n.get('timestamp',''))[:16])}</td><td>{esc(user_name)}</td><td>{esc(str(note_key))}</td></tr>"

    variance = ""
    est = wo.get("estimated_hours", 0) or 0
    act = wo.get("actual_hours", 0) or 0
    if est > 0 and act > 0:
        delta = act - est
        pct = round((act / est) * 100)
        color = "#DC2626" if delta > 0 else "#16A34A"
        variance = f'<span style="color:{color};font-weight:bold">{pct}% ({("+" if delta > 0 else "")}{delta:.1f}h)</span>'

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body {{ font-family: Arial, sans-serif; font-size: 11px; margin: 30px; color: #333; }}
h1 {{ color: #1B5E20; font-size: 18px; border-bottom: 2px solid #1B5E20; padding-bottom: 5px; }}
h2 {{ color: #1B5E20; font-size: 14px; margin-top: 20px; }}
table {{ width: 100%; border-collapse: collapse; margin: 10px 0; }}
th, td {{ border: 1px solid #ddd; padding: 6px 8px; text-align: left; }}
th {{ background: #E8F5E9; color: #1B5E20; font-weight: bold; }}
.info-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }}
.info-item {{ background: #f9f9f9; padding: 8px; border-radius: 4px; }}
.info-label {{ font-size: 9px; color: #888; text-transform: uppercase; }}
.info-value {{ font-size: 12px; font-weight: bold; }}
.header {{ display: flex; justify-content: space-between; align-items: center; }}
.badge {{ display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }}
.footer {{ margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #999; }}
</style></head><body>
<div class="header">
  <h1>WO Closure Report — {esc(str(wo.get("wo_number","")))}</h1>
  <span class="badge" style="background:#E8F5E9;color:#1B5E20">{esc(str(wo.get("status","")))}</span>
</div>

<div class="info-grid">
  <div class="info-item"><div class="info-label">Equipment</div><div class="info-value">{esc(str(wo.get("equipment_tag","")))}</div></div>
  <div class="info-item"><div class="info-label">WO Type</div><div class="info-value">{esc(str(wo.get("wo_type","")))}</div></div>
  <div class="info-item"><div class="info-label">Priority</div><div class="info-value">{esc(str(wo.get("priority_code","")))}</div></div>
  <div class="info-item"><div class="info-label">Plant</div><div class="info-value">{esc(str(wo.get("plant_id","")))}</div></div>
  <div class="info-item"><div class="info-label">Planned Hours</div><div class="info-value">{est}h</div></div>
  <div class="info-item"><div class="info-label">Actual Hours</div><div class="info-value">{act}h {variance}</div></div>
  <div class="info-item"><div class="info-label">Planned Start</div><div class="info-value">{wo.get("planned_start","—")}</div></div>
  <div class="info-item"><div class="info-label">Actual End</div><div class="info-value">{wo.get("actual_end","—")}</div></div>
  <div class="info-item"><div class="info-label">Closed By</div><div class="info-value">{_resolve_user(wo.get("closed_by","")) or "—"}</div></div>
  <div class="info-item"><div class="info-label">Closed At</div><div class="info-value">{wo.get("closed_at","—")}</div></div>
</div>

<h2>Description</h2>
<p>{esc(str(wo.get("description","No description")))}</p>

<h2>Operations</h2>
<table><tr><th>#</th><th>Description</th><th>Specialty</th><th>Resources</th></tr>{ops_html or "<tr><td colspan=4>No operations recorded</td></tr>"}</table>

<h2>Materials</h2>
<table><tr><th>SAP Code</th><th>Description</th><th>Quantity</th></tr>{mats_html or "<tr><td colspan=3>No materials</td></tr>"}</table>

<h2>Costs</h2>
<table>
<tr><th>Category</th><th>Amount</th></tr>
<tr><td>Labor</td><td>${wo.get("labor_cost",0) or 0:,.0f}</td></tr>
<tr><td>Material</td><td>${wo.get("material_cost",0) or 0:,.0f}</td></tr>
<tr><td>External</td><td>${wo.get("external_cost",0) or 0:,.0f}</td></tr>
<tr><td><strong>Total</strong></td><td><strong>${(wo.get("labor_cost",0) or 0) + (wo.get("material_cost",0) or 0) + (wo.get("external_cost",0) or 0):,.0f}</strong></td></tr>
</table>

<h2>Execution History</h2>
<table><tr><th>Time</th><th>User</th><th>Note</th></tr>{notes_html or "<tr><td colspan=3>No notes</td></tr>"}</table>

<div class="footer">
  Generated {datetime.now().strftime("%Y-%m-%d %H:%M")} | AMS Platform | {esc(str(wo.get("wo_number","")))}
</div>
</body></html>"""

    # Return HTML (can be printed to PDF by browser)
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html, media_type="text/html")
