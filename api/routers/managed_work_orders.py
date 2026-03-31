"""Managed Work Orders router — full OT lifecycle (Jorge Phase 2)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.services import managed_wo_service


class WOCreateRequest(BaseModel):
    equipment_tag: str
    description: str = ""
    wo_type: str = "PM01"
    priority_code: str = "P3"
    plant_id: str = "OCP-JFC1"
    work_request_id: str | None = None
    estimated_hours: float = 4.0
    operations: list | None = None
    materials: list | None = None
    tools: list | None = None


class WOFromWRRequest(BaseModel):
    work_request_id: str


class WOUpdateRequest(BaseModel):
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


class WOScheduleRequest(BaseModel):
    assigned_workers: list | None = None
    planned_start: str | None = None
    planned_end: str | None = None


class WOCompleteRequest(BaseModel):
    actual_hours: float = 0


class WONoteRequest(BaseModel):
    note: str = Field(min_length=1)


class WOProgressRequest(BaseModel):
    completion_pct: float = Field(ge=0, le=100)


router = APIRouter(
    prefix="/managed-work-orders",
    tags=["managed-work-orders"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/")
def create_work_order(
    data: WOCreateRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
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
        db, data.work_request_id, planned_by=getattr(user, "user_id", ""),
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
    db: Session = Depends(get_db),
):
    return managed_wo_service.list_work_orders(db, status, plant_id, wo_type, priority, limit, offset, fast_track=fast_track)


@router.get("/stats")
def get_stats(plant_id: str | None = None, db: Session = Depends(get_db)):
    return managed_wo_service.get_stats(db, plant_id)


@router.get("/{wo_id}")
def get_work_order(wo_id: str, db: Session = Depends(get_db)):
    result = managed_wo_service.get_work_order(db, wo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return result


@router.put("/{wo_id}")
def update_work_order(
    wo_id: str,
    data: WOUpdateRequest,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    update_data = data.model_dump(exclude_none=True)
    result = managed_wo_service.update_work_order(db, wo_id, update_data)
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
        raise HTTPException(status_code=400, detail="Cannot plan — WO not found or invalid status")
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
    result = managed_wo_service.schedule_wo(db, wo_id, getattr(user, "user_id", ""), workers, planned_start=p_start, planned_end=p_end)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot schedule — WO not found or invalid status")
    return result


@router.put("/{wo_id}/reschedule")
def reschedule_work_order(
    wo_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Supervisor returns WO to planner (REPROGRAMADO)."""
    result = managed_wo_service.reschedule_wo(db, wo_id, getattr(user, "user_id", ""))
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
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    result = managed_wo_service.close_wo(db, wo_id, getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot close — WO not found or invalid status")
    return result


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
    """AI verification before closing a WO — checks completeness."""
    wo = managed_wo_service.get_work_order(db, wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    issues = []
    warnings = []

    # Check required fields
    if not data.actual_hours or data.actual_hours <= 0:
        issues.append("Actual hours not recorded")
    if not data.observations:
        warnings.append("No execution observations provided")

    # Check hours variance
    plan_hours = wo.get("estimated_hours", 0) or 0
    if plan_hours > 0 and data.actual_hours > 0:
        variance = abs(data.actual_hours - plan_hours) / plan_hours
        if variance > 0.5:
            warnings.append(f"Hours variance is {variance*100:.0f}% (planned: {plan_hours}h, actual: {data.actual_hours}h) — consider adding justification")

    # Check operations exist
    ops = wo.get("operations", [])
    if not ops:
        warnings.append("No operations defined for this WO")

    # Check materials
    mats = wo.get("materials", [])
    if mats and not data.materials_used:
        warnings.append(f"{len(mats)} materials were planned but none reported as used")

    # Try AI verification if API key available
    import os
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    ai_summary = ""
    if api_key and (data.observations or data.actual_hours):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            prompt = f"""You are an maintenance engineering AI verifying a Work Order closure.
WO: {wo.get(wo_number, )} - {wo.get(description, )}
Equipment: {wo.get(equipment_tag, )}
Priority: {wo.get(priority_code, )}
Planned hours: {plan_hours}h | Actual hours: {data.actual_hours}h
Operations: {len(ops)} steps defined
Materials planned: {len(mats)} items
Observations: {data.observations or None provided}
Materials used: {len(data.materials_used)} items reported

Evaluate if this WO is ready to close. Be concise (2-3 sentences). Flag any concerns.
Respond in English."""
            resp = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )
            ai_summary = resp.content[0].text
        except Exception as e:
            ai_summary = f"AI verification unavailable: {str(e)[:80]}"

    ready = len(issues) == 0
    message_parts = []
    if issues:
        message_parts.append("BLOCKING:\n" + "\n".join(f"• {i}" for i in issues))
    if warnings:
        message_parts.append("WARNINGS:\n" + "\n".join(f"• {w}" for w in warnings))
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
