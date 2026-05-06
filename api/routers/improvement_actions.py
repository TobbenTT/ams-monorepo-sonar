"""Improvement Actions router — CRUD + lifecycle management."""

import uuid
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from api.database.connection import get_db
from api.database.models import ImprovementActionModel, WorkRequestModel
from api.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/improvement-actions",
    tags=["improvement-actions"],
    dependencies=[Depends(get_current_user)],
)


# ── Schemas ──────────────────────────────────────────────────────────

class ActionCreate(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    description: str = Field(default="", max_length=5000)
    plant_id: str = Field(default="", max_length=50)
    equipment_id: str | None = None
    equipment_tag: str = Field(default="", max_length=100)
    source_type: str = Field(default="MANUAL", max_length=30)
    source_ref: str | None = None
    action_type: str = Field(default="CORRECTIVE", max_length=30)
    priority: str = Field(default="MEDIUM", max_length=10)
    category: str = Field(default="", max_length=50)
    assigned_to: str = Field(default="", max_length=100)
    target_date: date | None = None
    notes: str = Field(default="", max_length=5000)
    ai_generated: bool = False
    ai_suggestion: str = Field(default="", max_length=5000)


class ActionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    category: str | None = None
    assigned_to: str | None = None
    target_date: date | None = None
    notes: str | None = None
    resolution: str | None = None
    status: str | None = None


def _row_to_dict(row: ImprovementActionModel) -> dict:
    return {
        "action_id": row.action_id,
        "title": row.title,
        "description": row.description,
        "plant_id": row.plant_id,
        "equipment_id": row.equipment_id,
        "equipment_tag": row.equipment_tag,
        "source_type": row.source_type,
        "source_ref": row.source_ref,
        "action_type": row.action_type,
        "priority": row.priority,
        "category": row.category,
        "assigned_to": row.assigned_to,
        "created_by": row.created_by,
        "target_date": row.target_date.isoformat() if row.target_date else None,
        "completed_at": row.completed_at.isoformat() if row.completed_at else None,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "status": row.status,
        "ai_generated": row.ai_generated,
        "ai_suggestion": row.ai_suggestion,
        "notes": row.notes,
        "resolution": row.resolution,
        "is_overdue": (
            row.status in ("OPEN", "IN_PROGRESS")
            and row.target_date is not None
            and row.target_date < date.today()
        ),
    }


# ── Endpoints ────────────────────────────────────────────────────────

@router.get("/")
def list_actions(
    plant_id: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    assigned_to: str | None = None,
    source_type: str | None = None,
    limit: int = Query(default=200, le=1000),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(ImprovementActionModel)
    if plant_id:
        q = q.filter(ImprovementActionModel.plant_id == plant_id)
    if status:
        q = q.filter(ImprovementActionModel.status == status)
    if priority:
        q = q.filter(ImprovementActionModel.priority == priority)
    if assigned_to:
        q = q.filter(ImprovementActionModel.assigned_to == assigned_to)
    if source_type:
        q = q.filter(ImprovementActionModel.source_type == source_type)
    total = q.count()
    rows = q.order_by(desc(ImprovementActionModel.created_at)).offset(offset).limit(limit).all()
    return {"items": [_row_to_dict(r) for r in rows], "total": total}


@router.get("/summary")
def get_summary(plant_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(ImprovementActionModel)
    if plant_id:
        q = q.filter(ImprovementActionModel.plant_id == plant_id)
    all_actions = q.all()
    today = date.today()
    total = len(all_actions)
    in_progress = sum(1 for a in all_actions if a.status == "IN_PROGRESS")
    open_count = sum(1 for a in all_actions if a.status == "OPEN")
    completed = sum(1 for a in all_actions if a.status in ("COMPLETED", "VERIFIED"))
    cancelled = sum(1 for a in all_actions if a.status == "CANCELLED")
    overdue = sum(
        1 for a in all_actions
        if a.status in ("OPEN", "IN_PROGRESS") and a.target_date and a.target_date < today
    )
    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled,
        "overdue": overdue,
    }


@router.get("/{action_id}")
def get_action(action_id: str, db: Session = Depends(get_db)):
    row = db.query(ImprovementActionModel).filter_by(action_id=action_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Action not found")
    return _row_to_dict(row)


@router.post("/", status_code=201)
def create_action(
    data: ActionCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    row = ImprovementActionModel(
        action_id=str(uuid.uuid4()),
        title=data.title,
        description=data.description,
        plant_id=data.plant_id,
        equipment_id=data.equipment_id,
        equipment_tag=data.equipment_tag,
        source_type=data.source_type,
        source_ref=data.source_ref,
        action_type=data.action_type,
        priority=data.priority,
        category=data.category,
        assigned_to=data.assigned_to,
        target_date=data.target_date,
        notes=data.notes,
        ai_generated=data.ai_generated,
        ai_suggestion=data.ai_suggestion,
        created_by=user.get("username", "") if isinstance(user, dict) else getattr(user, "username", ""),
        status="OPEN",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _row_to_dict(row)


@router.put("/{action_id}")
def update_action(action_id: str, data: ActionUpdate, db: Session = Depends(get_db)):
    row = db.query(ImprovementActionModel).filter_by(action_id=action_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Action not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "status":
            # Handle completion timestamp
            if value in ("COMPLETED", "VERIFIED") and row.status not in ("COMPLETED", "VERIFIED"):
                row.completed_at = datetime.now()
            elif value not in ("COMPLETED", "VERIFIED"):
                row.completed_at = None
        setattr(row, field, value)
    row.updated_at = datetime.now()
    db.commit()
    db.refresh(row)
    return _row_to_dict(row)


@router.delete("/{action_id}")
def delete_action(action_id: str, db: Session = Depends(get_db)):
    row = db.query(ImprovementActionModel).filter_by(action_id=action_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Action not found")
    db.delete(row)
    db.commit()
    return {"deleted": True, "action_id": action_id}


@router.post("/analyze-deviations")
def analyze_deviations(
    plant_id: str = Query(default="OCP-JFC1"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Analyze recent work requests to auto-generate improvement actions from deviations."""
    # Get recent WRs (WorkRequestModel has no plant_id — get all recent ones)
    wrs = (
        db.query(WorkRequestModel)
        .order_by(desc(WorkRequestModel.created_at))
        .limit(100)
        .all()
    )

    created = []
    username = user.get("username", "") if isinstance(user, dict) else getattr(user, "username", "")

    # Detect patterns: repeated equipment failures
    equipment_counts = {}
    for wr in wrs:
        tag = wr.equipment_tag or ""
        if tag:
            equipment_counts[tag] = equipment_counts.get(tag, 0) + 1

    # Create actions for equipment with 3+ failures
    for tag, count in equipment_counts.items():
        if count >= 3:
            # Check if action already exists for this
            existing = (
                db.query(ImprovementActionModel)
                .filter_by(equipment_tag=tag, source_type="DEVIATION")
                .filter(ImprovementActionModel.status.in_(["OPEN", "IN_PROGRESS"]))
                .first()
            )
            if existing:
                continue

            sample_wr = next((w for w in wrs if w.equipment_tag == tag), None)
            action = ImprovementActionModel(
                action_id=str(uuid.uuid4()),
                title=f"Recurring failures on {tag} ({count} events)",
                description=f"Equipment {tag} has {count} work requests in the analysis period. Investigate root cause and implement preventive measures.",
                plant_id=plant_id,
                equipment_tag=tag,
                equipment_id=sample_wr.equipment_name if sample_wr else "",
                source_type="DEVIATION",
                source_ref=f"{count} WRs",
                action_type="PREVENTIVE",
                priority="HIGH" if count >= 5 else "MEDIUM",
                category="Reliability",
                ai_generated=True,
                ai_suggestion=f"AI detected {count} failures on {tag}. Consider RCA analysis and preventive maintenance review.",
                created_by=username,
                status="OPEN",
            )
            db.add(action)
            created.append(_row_to_dict(action))

    # Detect overdue/delayed WRs pattern
    delayed_count = sum(1 for wr in wrs if (wr.status or "").lower() in ("overdue", "delayed", "late"))
    if delayed_count >= 5:
        existing = (
            db.query(ImprovementActionModel)
            .filter_by(source_type="DEVIATION", category="Planning")
            .filter(ImprovementActionModel.status.in_(["OPEN", "IN_PROGRESS"]))
            .first()
        )
        if not existing:
            action = ImprovementActionModel(
                action_id=str(uuid.uuid4()),
                title=f"High rate of delayed work requests ({delayed_count} in period)",
                description=f"{delayed_count} work requests are overdue or delayed. Review planning standards and resource allocation.",
                plant_id=plant_id,
                source_type="DEVIATION",
                source_ref=f"{delayed_count} delayed WRs",
                action_type="IMPROVEMENT",
                priority="HIGH",
                category="Planning",
                ai_generated=True,
                ai_suggestion="AI suggests reviewing HH calendar and estimated preventive standards to reduce planning delays.",
                created_by=username,
                status="OPEN",
            )
            db.add(action)
            created.append(_row_to_dict(action))

    db.commit()
    return {
        "analyzed_wrs": len(wrs),
        "actions_created": len(created),
        "actions": created,
    }
