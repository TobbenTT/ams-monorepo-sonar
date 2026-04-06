"""Scheduling router — weekly program management, Gantt, HH balance, materials."""

from pydantic import BaseModel
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.schemas import ProgramCreate
from api.services import scheduling_service

router = APIRouter(prefix="/scheduling", tags=["scheduling"], dependencies=[Depends(get_current_user)])


@router.post("/programs")
def create_program(data: ProgramCreate, db: Session = Depends(get_db)):
    return scheduling_service.create_program(db, data.plant_id, data.week_number, data.year)


@router.get("/programs")
def list_programs(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return scheduling_service.list_programs(db, plant_id, status)


@router.get("/programs/{program_id}")
def get_program(program_id: str, db: Session = Depends(get_db)):
    model = scheduling_service.get_program(db, program_id)
    if not model:
        raise HTTPException(status_code=404, detail="Program not found")
    return {
        "program_id": model.program_id,
        "plant_id": model.plant_id,
        "week_number": model.week_number,
        "year": model.year,
        "status": model.status,
        "total_hours": model.total_hours,
        "work_packages": model.work_packages,
        "resource_slots": model.resource_slots,
        "conflicts": model.conflicts,
        "support_tasks": model.support_tasks,
        "created_at": model.created_at.isoformat() if model.created_at else None,
        "finalized_at": model.finalized_at.isoformat() if model.finalized_at else None,
        "published_at": model.published_at.isoformat() if model.published_at else None,
        "published_by": model.published_by,
        "material_status": model.material_status,
        "hh_balance": model.hh_balance,
    }


@router.put("/programs/{program_id}/finalize")
def finalize_program(program_id: str, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    result = scheduling_service.finalize_program(db, program_id)
    if not result:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.put("/programs/{program_id}/activate")
def activate_program(program_id: str, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    result = scheduling_service.activate_program(db, program_id)
    if not result:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.put("/programs/{program_id}/complete")
def complete_program(program_id: str, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    result = scheduling_service.complete_program(db, program_id)
    if not result:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


# ── Phase 3: Publish program ─────────────────────────────────────────

@router.put("/programs/{program_id}/publish")
def publish_program(
    program_id: str,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    """Publish a finalized program — makes it visible to all and locks edits."""
    result = scheduling_service.publish_program(db, program_id, getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot publish — program not found or not finalized/active")
    return result


# ── Phase 3: Material check ──────────────────────────────────────────

@router.get("/programs/{program_id}/material-check")
def material_check(program_id: str, db: Session = Depends(get_db)):
    """Check material availability for all WOs/work packages in a program."""
    result = scheduling_service.check_materials(db, program_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


# ── Phase 3: HH balance ─────────────────────────────────────────────

@router.get("/programs/{program_id}/hh-balance")
def hh_balance(program_id: str, db: Session = Depends(get_db)):
    """Calculate manpower hours balance: capacity vs assigned by specialty."""
    result = scheduling_service.hh_balance(db, program_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


# ── Phase 3: Gantt from managed WOs ─────────────────────────────────

@router.get("/gantt")
def get_gantt_managed(
    plant_id: str = "OCP-JFC1",
    weeks: int = 2,
    db: Session = Depends(get_db),
):
    """Gantt data from managed_work_orders for next N weeks."""
    return scheduling_service.get_gantt_managed(db, plant_id, weeks)


# ── Existing Gantt endpoints ─────────────────────────────────────────

@router.get("/programs/{program_id}/gantt")
def get_gantt(program_id: str, db: Session = Depends(get_db)):
    result = scheduling_service.get_gantt(db, program_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Program not found")
    return result


@router.get("/programs/{program_id}/gantt/export")
def export_gantt_excel(program_id: str, db: Session = Depends(get_db)):
    filepath = scheduling_service.export_gantt_excel(db, program_id)
    if not filepath:
        raise HTTPException(status_code=404, detail="Program not found")
    return FileResponse(
        filepath,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"gantt_{program_id}.xlsx",
    )



# ── AI Auto-Schedule ─────────────────────────────────────────────────

class AIAutoScheduleRequest(BaseModel):
    plant_id: str = "OCP-JFC1"
    week_start: str = ""  # ISO date, defaults to current week


from pydantic import BaseModel as BaseModel2


@router.post("/ai-auto-schedule")
def ai_auto_schedule(
    data: AIAutoScheduleRequest = None,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI auto-assigns unscheduled WOs to optimal technicians based on
    skills, availability, priority, and workload balance."""
    import os, json
    from api.database.models import ManagedWorkOrderModel
    from api.services import assignment_service

    plant_id = data.plant_id if data else "OCP-JFC1"

    # Get unscheduled WOs (PLANIFICADO + RELEASED)
    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(["PLANIFICADO", "RELEASED", "CREADO"]),
        ManagedWorkOrderModel.plant_id == plant_id,
    ).order_by(
        # P1 first, then P2, etc.
        ManagedWorkOrderModel.priority_code.asc(),
        ManagedWorkOrderModel.created_at.asc(),
    ).limit(20).all()

    if not wos:
        return {"assignments": [], "message": "No unscheduled WOs found"}

    # Get available technicians
    techs = assignment_service.get_technician_profiles(db, plant_id=plant_id)
    if not techs:
        return {"assignments": [], "message": "No technicians available"}

    # Build context for AI
    wo_list = []
    for wo in wos:
        ops = wo.operations or []
        specialties = list(set(op.get("specialty", "") for op in ops if isinstance(op, dict)))
        wo_list.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "priority": wo.priority_code,
            "equipment": wo.equipment_tag,
            "description": (wo.description or "")[:100],
            "hours": wo.estimated_hours or 4,
            "specialties_needed": specialties or ["MECHANICAL"],
            "wo_type": wo.wo_type,
        })

    tech_list = []
    for t in techs:
        tech_list.append({
            "worker_id": t.get("worker_id",""),
            "name": t.get("name",""),
            "specialty": t.get("specialty",""),
            "shift": t.get("shift",""),
            "available": t.get("available",True),
            "years_exp": t.get("years_experience",0),
            "equipment_expertise": (t.get("equipment_expertise",[]) or [])[:5],
        })

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        # Fallback: simple round-robin assignment
        assignments = []
        available_techs = [t for t in tech_list if t.get("available", True)]
        if not available_techs:
            available_techs = tech_list[:20]  # fallback: use first 20
        today = datetime.now().date()
        # Spread across current work week (Mon-Fri)
        weekday = today.weekday()
        monday = today - timedelta(days=weekday)
        work_days = [monday + timedelta(days=d) for d in range(5)]
        
        # Track how many WOs each tech has, to spread across days
        tech_wo_count = {}
        for i, wo in enumerate(wo_list):
            if not available_techs:
                break
            tech = available_techs[i % len(available_techs)]
            tid = tech["worker_id"]
            n = tech_wo_count.get(tid, 0)
            tech_wo_count[tid] = n + 1
            day = work_days[n % len(work_days)]
            shift = "night" if n % 2 == 1 else "day"
            assignments.append({
                "wo_id": wo["wo_id"],
                "wo_number": wo["wo_number"],
                "worker_id": tid,
                "worker_name": tech["name"],
                "suggested_date": day.isoformat(),
                "reason": "AI fallback: round-robin by specialty",
                "shift": shift,
            })
        return {"assignments": assignments, "message": f"Assigned {len(assignments)} WOs to {len(set(a['worker_id'] for a in assignments))} technicians", "ai_used": False}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        prompt = (
            "You are a maintenance scheduling AI. Assign these work orders to the best technicians.\n\n"
            "WORK ORDERS:\n" + json.dumps(wo_list, indent=2) + "\n\n"
            "TECHNICIANS:\n" + json.dumps(tech_list, indent=2) + "\n\n"
            "Rules:\n"
            "- Match specialty: mechanical WOs to FITTER/MECHANICAL techs, electrical to ELECTRICAL, etc.\n"
            "- P1/P2 get the most experienced technicians\n"
            "- Balance workload across technicians (don't overload one person)\n"
            "- Consider equipment_expertise match when possible\n"
            "- Assign shift: 'day' or 'night' based on priority (P1 = day shift priority)\n\n"
            "Return ONLY a JSON array of assignments:\n"
            '[{"wo_id": "...", "wo_number": "...", "worker_id": "...", "worker_name": "...", "reason": "brief reason", "shift": "day|night", "suggested_date": "YYYY-MM-DD"}]'
        )

        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )

        text = resp.content[0].text
        # Strip markdown code blocks
        text = text.replace('```json', '').replace('```', '').strip()
        import logging; logging.getLogger(__name__).info("AI auto-schedule response: %s", text[:200])
        # Extract JSON from response
        import re
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            assignments = json.loads(json_match.group())
        else:
            assignments = []

        # Fallback if AI returned empty
        if not assignments:
            available_techs = [t for t in tech_list if t.get("available", True)]
            for i, wo in enumerate(wo_list):
                if not available_techs:
                    break
                tech = available_techs[i % len(available_techs)]
                assignments.append({
                    "wo_id": wo["wo_id"],
                    "wo_number": wo["wo_number"],
                    "worker_id": tech["worker_id"],
                    "worker_name": tech["name"],
                    "reason": "AI fallback: round-robin by specialty",
                    "shift": "day",
                    "suggested_date": (datetime.now()).strftime("%Y-%m-%d"),
                })

        return {
            "assignments": assignments,
            "message": "AI assigned " + str(len(assignments)) + " work orders to " + str(len(set(a.get("worker_id", "") for a in assignments))) + " technicians",
            "ai_used": True,
            "wo_count": len(wo_list),
            "tech_count": len(tech_list),
        }

    except Exception as e:
        return {"assignments": [], "message": "AI error: " + str(e)[:100], "ai_used": False}


# ── AI Daily Briefing ────────────────────────────────────────────────

@router.post("/ai-daily-briefing")
def ai_daily_briefing(
    plant_id: str = "OCP-JFC1",
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate AI daily briefing for the execution meeting."""
    import os, json
    from api.database.models import ManagedWorkOrderModel

    # Gather data
    all_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
    ).all()

    by_status = {}
    for wo in all_wos:
        by_status.setdefault(wo.status, []).append(wo)

    in_exec = by_status.get("EN_EJECUCION", []) + by_status.get("IN_PROGRESS", [])
    scheduled = by_status.get("PROGRAMADO", []) + by_status.get("SCHEDULED", [])
    completed_today = [w for w in by_status.get("CERRADO", []) + by_status.get("COMPLETED", [])
                       if w.closed_at and w.closed_at.date() == datetime.now().date()]
    overdue = [w for w in in_exec if w.planned_end and w.planned_end < datetime.now()]
    fast_track = [w for w in all_wos if w.is_fast_track and w.status not in ("CERRADO", "CANCELADO", "COMPLETED")]

    summary_data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "plant": plant_id,
        "in_execution": len(in_exec),
        "scheduled_today": len(scheduled),
        "completed_today": len(completed_today),
        "overdue": len(overdue),
        "fast_track_active": len(fast_track),
        "total_open": len([w for w in all_wos if w.status not in ("CERRADO", "CANCELADO", "COMPLETED")]),
        "total_hh_planned": sum(w.estimated_hours or 0 for w in in_exec),
        "overdue_details": [{"wo": w.wo_number, "equip": w.equipment_tag, "priority": w.priority_code, "planned_end": w.planned_end.isoformat() if w.planned_end else ""} for w in overdue[:5]],
        "fast_track_details": [{"wo": w.wo_number, "equip": w.equipment_tag, "priority": w.priority_code, "desc": (w.description or "")[:60]} for w in fast_track[:5]],
    }

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"briefing": "AI unavailable. Manual data:\n" + json.dumps(summary_data, indent=2), "data": summary_data}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        prompt = (
            "You are the AI assistant for a daily maintenance execution meeting at a mining plant.\n"
            "Generate a concise daily briefing (max 300 words) covering:\n"
            "1. Executive summary (1-2 sentences)\n"
            "2. Active emergencies / fast-track WOs\n"
            "3. Overdue WOs requiring attention\n"
            "4. Today's workload summary\n"
            "5. Key risks or recommendations\n\n"
            "Data:\n" + json.dumps(summary_data, indent=2) + "\n\n"
            "Format with markdown headers. Be direct and actionable. Respond in English."
        )

        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        briefing = resp.content[0].text
        return {"briefing": briefing, "data": summary_data, "ai_used": True}

    except Exception as e:
        return {"briefing": "AI error: " + str(e)[:100], "data": summary_data, "ai_used": False}
