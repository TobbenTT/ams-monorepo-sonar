"""Process Gap endpoints — Sprint 7 VSC (Jorge QA jornada 2026-05-08).

Cubre tickets SF-685, SF-687, SF-689, SF-690, SF-692, SF-693, SF-717, SF-718, SF-719.

Cada gap es un workflow de proceso que faltaba modelar formalmente. Los modelos
viven en `api/database/models.py` (AdditionalWorkModel, GapHandoverModel,
TrainingHourRecordModel + closing_checklist JSON en ManagedWorkOrder).
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.connection import get_db
from api.database.models import (
    AdditionalWorkModel,
    GapHandoverModel,
    TrainingHourRecordModel,
    WorkforceModel,
    ManagedWorkOrderModel,
)
from api.dependencies.auth import get_current_user, require_role
from api.services.audit_service import log_action


router = APIRouter(prefix="/process-gaps", tags=["process-gaps"])


# ── SF-689 / SF-685 / SF-717 / SF-718 — Additional Work ──────────────

class AdditionalWorkCreate(BaseModel):
    parent_wo_id: str
    plant_id: str
    equipment_tag: str | None = None
    description: str = Field(min_length=3, max_length=2000)
    estimated_hours: float = Field(ge=0, le=1000)
    estimated_cost: float = Field(ge=0)


class FeasibilityCheckRequest(BaseModel):
    """SF-718 — validación factibilidad (resources/skills/calendar)."""
    has_skills: bool
    has_resources: bool
    has_calendar_slot: bool
    notes: str | None = None


class BudgetApprovalRequest(BaseModel):
    """SF-717 — aprobación presupuesto adicional."""
    approved: bool
    comment: str | None = None


@router.post("/additional-work", status_code=201)
def create_additional_work(
    data: AdditionalWorkCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SF-689 — Registrar trabajo adicional detectado durante ejecución.

    Workflow: pending → feasibility_validated → budget_approved → executed.
    """
    aw = AdditionalWorkModel(
        parent_wo_id=data.parent_wo_id,
        plant_id=data.plant_id,
        equipment_tag=data.equipment_tag,
        description=data.description,
        estimated_hours=data.estimated_hours,
        estimated_cost=data.estimated_cost,
        status="pending",
        created_by=getattr(user, "user_id", "") or getattr(user, "username", ""),
    )
    db.add(aw)
    db.commit()
    db.refresh(aw)
    log_action(db, "additional_work", aw.aw_id, "CREATE", user=getattr(user, "user_id", ""))
    return {"aw_id": aw.aw_id, "status": aw.status}


@router.get("/additional-work")
def list_additional_work(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(AdditionalWorkModel)
    if plant_id:
        q = q.filter(AdditionalWorkModel.plant_id == plant_id)
    if status:
        q = q.filter(AdditionalWorkModel.status == status)
    rows = q.order_by(AdditionalWorkModel.created_at.desc()).limit(200).all()
    return [
        {
            "aw_id": r.aw_id,
            "parent_wo_id": r.parent_wo_id,
            "description": r.description,
            "status": r.status,
            "estimated_hours": r.estimated_hours,
            "estimated_cost": r.estimated_cost,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.put("/additional-work/{aw_id}/feasibility")
def validate_feasibility(
    aw_id: str,
    data: FeasibilityCheckRequest,
    user=Depends(require_role("admin", "manager", "planner", "supervisor")),
    db: Session = Depends(get_db),
):
    """SF-718 — Validar factibilidad del trabajo adicional."""
    aw = db.query(AdditionalWorkModel).filter(AdditionalWorkModel.aw_id == aw_id).first()
    if not aw:
        raise HTTPException(status_code=404, detail="Trabajo adicional no encontrado")
    aw.feasibility_check = {
        "has_skills": data.has_skills,
        "has_resources": data.has_resources,
        "has_calendar_slot": data.has_calendar_slot,
        "notes": data.notes,
        "validated_by": getattr(user, "user_id", ""),
        "validated_at": datetime.now().isoformat(),
    }
    feasible = data.has_skills and data.has_resources and data.has_calendar_slot
    aw.status = "feasibility_validated" if feasible else "rejected"
    if not feasible:
        aw.rejection_reason = "Factibilidad rechazada: " + ", ".join(
            f for f, ok in [("skills", data.has_skills), ("resources", data.has_resources), ("slot", data.has_calendar_slot)] if not ok
        )
    db.commit()
    return {"aw_id": aw.aw_id, "status": aw.status, "feasible": feasible}


@router.put("/additional-work/{aw_id}/budget")
def approve_budget(
    aw_id: str,
    data: BudgetApprovalRequest,
    user=Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """SF-685 + SF-717 — Aprobación de presupuesto adicional (solo manager+)."""
    aw = db.query(AdditionalWorkModel).filter(AdditionalWorkModel.aw_id == aw_id).first()
    if not aw:
        raise HTTPException(status_code=404, detail="Trabajo adicional no encontrado")
    if aw.status != "feasibility_validated":
        raise HTTPException(
            status_code=409,
            detail=f"Solo se puede aprobar presupuesto desde 'feasibility_validated'. Status actual: {aw.status}",
        )
    if data.approved:
        aw.status = "budget_approved"
        aw.budget_approved_by = getattr(user, "user_id", "")
        aw.budget_approved_at = datetime.now()
    else:
        aw.status = "rejected"
        aw.rejection_reason = data.comment or "Presupuesto rechazado"
    db.commit()
    return {"aw_id": aw.aw_id, "status": aw.status}


# ── SF-687 / SF-719 — Equipment Handover ─────────────────────────────

class HandoverCreate(BaseModel):
    wo_id: str
    equipment_tag: str
    equipment_condition: Literal["operational", "with_observations", "rejected"] = "operational"
    observations: str | None = None
    remaining_parts: list[dict] | None = None
    received_by: str | None = None  # supervisor producción si ya está identificado
    signature_text: str | None = None


class HandoverAccept(BaseModel):
    accepted: bool
    observations: str | None = None


@router.post("/handover", status_code=201)
def create_handover(
    data: HandoverCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SF-719 — Mantenedor inicia entrega formal de equipo a operaciones."""
    h = GapHandoverModel(
        wo_id=data.wo_id,
        equipment_tag=data.equipment_tag,
        handed_over_by=getattr(user, "user_id", "") or getattr(user, "username", ""),
        received_by=data.received_by,
        equipment_condition=data.equipment_condition,
        observations=data.observations,
        remaining_parts=data.remaining_parts,
        signature_text=data.signature_text,
        handover_status="pending",
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    log_action(db, "equipment_handover", h.handover_id, "CREATE", user=getattr(user, "user_id", ""))
    return {"handover_id": h.handover_id, "status": h.handover_status}


@router.put("/handover/{handover_id}/accept")
def accept_handover(
    handover_id: str,
    data: HandoverAccept,
    user=Depends(require_role("admin", "manager", "supervisor")),
    db: Session = Depends(get_db),
):
    """SF-687 — Supervisor producción acepta o rechaza la entrega."""
    h = db.query(GapHandoverModel).filter(GapHandoverModel.handover_id == handover_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Handover no encontrado")
    if h.handover_status != "pending":
        raise HTTPException(status_code=409, detail=f"Handover ya está en estado {h.handover_status}")
    h.received_by = getattr(user, "user_id", "")
    h.accepted_at = datetime.now()
    h.handover_status = "accepted" if data.accepted else "rejected"
    if data.observations:
        h.observations = (h.observations or "") + "\n[supervisor] " + data.observations
    db.commit()
    return {"handover_id": h.handover_id, "status": h.handover_status}


@router.get("/handover")
def list_handovers(
    wo_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(GapHandoverModel)
    if wo_id:
        q = q.filter(GapHandoverModel.wo_id == wo_id)
    if status:
        q = q.filter(GapHandoverModel.handover_status == status)
    rows = q.order_by(GapHandoverModel.created_at.desc()).limit(200).all()
    return [
        {
            "handover_id": r.handover_id,
            "wo_id": r.wo_id,
            "equipment_tag": r.equipment_tag,
            "status": r.handover_status,
            "condition": r.equipment_condition,
            "handed_over_by": r.handed_over_by,
            "received_by": r.received_by,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "accepted_at": r.accepted_at.isoformat() if r.accepted_at else None,
        }
        for r in rows
    ]


# ── SF-690 — Closing Checklist (vive en WO.closing_checklist JSON) ───

DEFAULT_CLOSING_CHECKLIST = [
    {"item": "tools_returned", "label": "Herramientas devueltas", "checked": False, "required": True},
    {"item": "waste_disposed", "label": "Residuos dispuestos correctamente", "checked": False, "required": True},
    {"item": "area_cleaned", "label": "Área de trabajo limpia", "checked": False, "required": True},
    {"item": "lockout_removed", "label": "Bloqueos LOTO removidos", "checked": False, "required": True},
    {"item": "safety_briefing_signed", "label": "Charla de seguridad firmada", "checked": False, "required": False},
]


@router.get("/closing-checklist/{wo_id}")
def get_closing_checklist(wo_id: str, db: Session = Depends(get_db)):
    """SF-690 — Devuelve el checklist actual de cierre de la OT."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")
    return {
        "wo_id": wo_id,
        "checklist": wo.closing_checklist or DEFAULT_CLOSING_CHECKLIST,
    }


class ChecklistUpdate(BaseModel):
    checklist: list[dict]


@router.put("/closing-checklist/{wo_id}")
def update_closing_checklist(
    wo_id: str,
    data: ChecklistUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SF-690 — Actualiza items del checklist al cerrar OT. Bloquea cierre si
    items required no están checked (validation en service layer)."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")
    wo.closing_checklist = data.checklist
    db.commit()
    return {"wo_id": wo_id, "checklist": wo.closing_checklist}


# ── SF-692 — Training Hours ──────────────────────────────────────────

class TrainingRecordCreate(BaseModel):
    worker_id: str
    plant_id: str
    training_date: date
    hours: float = Field(gt=0, le=24)
    training_type: Literal["safety", "technical", "refresh", "certification"]
    topic: str = Field(min_length=2, max_length=200)
    provider: str | None = None
    certificate_url: str | None = None


@router.post("/training-hours", status_code=201)
def create_training_record(
    data: TrainingRecordCreate,
    user=Depends(require_role("admin", "manager", "supervisor")),
    db: Session = Depends(get_db),
):
    """SF-692 — Registrar horas de capacitación de un técnico."""
    r = TrainingHourRecordModel(**data.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"record_id": r.record_id}


@router.get("/training-hours/summary")
def training_hours_summary(
    plant_id: str | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
):
    """SF-692 — KPI horas capacitación por trabajador + agregado planta."""
    q = db.query(
        TrainingHourRecordModel.worker_id,
        func.sum(TrainingHourRecordModel.hours).label("total_hours"),
    )
    if plant_id:
        q = q.filter(TrainingHourRecordModel.plant_id == plant_id)
    if year:
        from sqlalchemy import extract
        q = q.filter(extract("year", TrainingHourRecordModel.training_date) == year)
    q = q.group_by(TrainingHourRecordModel.worker_id)
    by_worker = {r.worker_id: float(r.total_hours or 0) for r in q.all()}
    total = sum(by_worker.values())
    return {
        "plant_id": plant_id,
        "year": year,
        "by_worker": by_worker,
        "total_hours": total,
        "worker_count": len(by_worker),
        "avg_hours_per_worker": (total / len(by_worker)) if by_worker else 0,
    }


# ── SF-693 — KPI Personal Directo vs Indirecto ───────────────────────

# Clasificación heurística: las specialties operativas son DIRECTO (trabajan
# manos en equipo); planner/supervisor/manager/inspector son INDIRECTO.
DIRECT_SPECIALTIES = {
    "MECHANICAL", "ELECTRICAL", "INSTRUMENTATION", "WELDING", "GENERAL",
    "MECANICO", "ELECTRICO", "INSTRUMENTACION", "SOLDADOR",
}


@router.get("/staffing-ratio")
def staffing_ratio(plant_id: str | None = None, db: Session = Depends(get_db)):
    """SF-693 — KPI ratio personal directo (mantenedores) vs indirecto
    (planners/supervisors/managers). Plantas saludables ~70/30."""
    q = db.query(WorkforceModel).filter(WorkforceModel.available == True)
    if plant_id:
        q = q.filter(WorkforceModel.plant_id == plant_id)
    rows = q.all()
    direct = sum(1 for r in rows if (r.specialty or "").upper() in DIRECT_SPECIALTIES)
    indirect = len(rows) - direct
    total = len(rows)
    return {
        "plant_id": plant_id,
        "direct_count": direct,
        "indirect_count": indirect,
        "total": total,
        "direct_pct": (direct * 100 / total) if total else 0,
        "indirect_pct": (indirect * 100 / total) if total else 0,
        "ratio_direct_to_indirect": (direct / indirect) if indirect else None,
        "healthy_target": "70% directo / 30% indirecto",
    }


# ── SF-686 — UI Risk Score (re-expose existing AI risk in dedicated endpoint) ──

@router.get("/risk-analysis/{wo_id}")
def get_risk_analysis(wo_id: str, db: Session = Depends(get_db)):
    """SF-686 — Devuelve el risk score del AI engine + breakdown para UI dedicada.

    El score ya se calcula en `ManagedWorkOrderModel.risk_analysis` (JSON). Este
    endpoint lo expone como recurso de primera clase para que el frontend tenga
    una UI dedicada (panel modal con visualización detallada)."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")
    risk = wo.risk_analysis or {}
    return {
        "wo_id": wo_id,
        "equipment_tag": wo.equipment_tag,
        "overall_score": risk.get("overall_score") or risk.get("ai_score"),
        "components": {
            "criticality": risk.get("criticality_score"),
            "urgency_sla": risk.get("urgency_score"),
            "historical_pareto": risk.get("pareto_score"),
            "production_impact": risk.get("impact_score"),
        },
        "recommendations": risk.get("recommendations") or [],
        "computed_at": risk.get("computed_at"),
    }
