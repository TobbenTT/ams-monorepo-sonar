"""Managed Work Orders router — full OT lifecycle (Jorge Phase 2)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.services import managed_wo_service


class WOCreateRequest(BaseModel):
    model_config = {"extra": "ignore"}
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
    model_config = {"extra": "ignore"}
    work_request_id: str


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


class WOScheduleRequest(BaseModel):
    model_config = {"extra": "ignore"}
    assigned_workers: list | None = None
    planned_start: str | None = None
    planned_end: str | None = None
    shift: str | None = None


class WOCompleteRequest(BaseModel):
    model_config = {"extra": "ignore"}
    actual_hours: float = 0


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
    # Handle empty strings as "clear field" for dates and workers
    raw = data.model_dump()
    for field in ['planned_start', 'planned_end', 'assigned_workers']:
        if raw.get(field) == '' or raw.get(field) == []:
            update_data[field] = None
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
    p_shift = data.shift if data else None
    result = managed_wo_service.schedule_wo(db, wo_id, getattr(user, "user_id", ""), workers, planned_start=p_start, planned_end=p_end, shift=p_shift)
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




@router.put("/{wo_id}/cancel")
def cancel_work_order(
    wo_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a work order from any non-final status."""
    result = managed_wo_service.cancel_wo(db, wo_id, getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot cancel - WO not found or already closed")
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
