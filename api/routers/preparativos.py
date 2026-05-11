"""SF-662 (Tanda 14 SP8) — Preparativos OT estilo Rappi.

Endpoints CRUD para tracking de repuestos/insumos despachados bodega → patio por OT.
Estados Rappi: PENDIENTE → DESPACHADO → EN_TRANSITO → RECIBIDO (con firma) → ANOMALIA.

Spec en docs/REMAINING_TICKETS_2026-05-11.md (sección SF-662).
"""
from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import PreparativoOTModel
from api.dependencies.auth import get_current_user
from api.services import audit_service

router = APIRouter(
    prefix="/preparativos",
    tags=["preparativos"],
    dependencies=[Depends(get_current_user)],
)

_ALLOWED_TRANSITIONS = {
    "PENDIENTE":   {"DESPACHADO"},
    "DESPACHADO":  {"EN_TRANSITO", "ANOMALIA"},
    "EN_TRANSITO": {"RECIBIDO", "ANOMALIA"},
    "RECIBIDO":    set(),
    "ANOMALIA":    {"DESPACHADO"},  # corregir + reintentar
}


def _to_dict(p: PreparativoOTModel) -> dict:
    return {
        "prep_id": p.prep_id,
        "wo_id": p.wo_id,
        "plant_id": p.plant_id,
        "item_code": p.item_code,
        "item_desc": p.item_desc,
        "qty": p.qty,
        "unit": p.unit,
        "status": p.status,
        "dispatched_at": p.dispatched_at.isoformat() if p.dispatched_at else None,
        "dispatched_by": p.dispatched_by,
        "received_at": p.received_at.isoformat() if p.received_at else None,
        "received_by": p.received_by,
        "conforme": p.conforme,
        "layout_url": p.layout_url,
        "notes": p.notes,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


class PrepCreate(BaseModel):
    wo_id: str
    item_code: str
    item_desc: str | None = None
    qty: float = 0
    unit: str | None = None
    plant_id: str | None = None
    layout_url: str | None = None
    notes: str | None = None


class PrepTransition(BaseModel):
    new_status: str
    conforme: bool | None = None
    notes: str | None = None


@router.get("/")
def list_prep(wo_id: str | None = None, plant_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(PreparativoOTModel)
    if wo_id:
        q = q.filter(PreparativoOTModel.wo_id == wo_id)
    if plant_id:
        q = q.filter(PreparativoOTModel.plant_id == plant_id)
    items = q.order_by(PreparativoOTModel.created_at.desc()).all()
    return {"items": [_to_dict(p) for p in items], "count": len(items)}


@router.post("/")
def create_prep(data: PrepCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = PreparativoOTModel(
        wo_id=data.wo_id,
        item_code=data.item_code,
        item_desc=data.item_desc,
        qty=data.qty,
        unit=data.unit,
        plant_id=data.plant_id,
        layout_url=data.layout_url,
        notes=data.notes,
        status="PENDIENTE",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    audit_service.log_action(
        db,
        entity_type="preparativo_ot",
        entity_id=p.prep_id,
        action="CREATE",
        user=getattr(user, "user_id", "system"),
        payload={"wo_id": data.wo_id, "item_code": data.item_code, "qty": data.qty},
    )
    return _to_dict(p)


@router.put("/{prep_id}/transition")
def transition_prep(prep_id: str, data: PrepTransition, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(PreparativoOTModel).filter(PreparativoOTModel.prep_id == prep_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Preparativo no encontrado")
    if data.new_status not in _ALLOWED_TRANSITIONS.get(p.status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Transición {p.status} → {data.new_status} no permitida",
        )
    old_status = p.status
    p.status = data.new_status
    uid = getattr(user, "user_id", "system")
    now = datetime.now()
    if data.new_status == "DESPACHADO":
        p.dispatched_at = now
        p.dispatched_by = uid
    elif data.new_status == "RECIBIDO":
        p.received_at = now
        p.received_by = uid
        # Conforme es obligatorio al recibir (firma de aceptación)
        if data.conforme is None:
            raise HTTPException(status_code=400, detail="Campo 'conforme' obligatorio al recibir")
        p.conforme = data.conforme
    if data.notes:
        p.notes = (p.notes or "") + ("\n" if p.notes else "") + f"[{now.isoformat()}] {data.notes}"
    db.commit()
    db.refresh(p)
    audit_service.log_action(
        db,
        entity_type="preparativo_ot",
        entity_id=p.prep_id,
        action="TRANSITION",
        user=uid,
        payload={"old_status": old_status, "new_status": data.new_status, "conforme": data.conforme},
    )
    return _to_dict(p)


@router.get("/by-wo/{wo_id}/summary")
def summary_by_wo(wo_id: str, db: Session = Depends(get_db)):
    """Resumen por OT: cuántos preparativos en cada estado.

    Útil para mostrar badge en el header de la OT ("3/5 recibidos") y para gate
    'No iniciar OT hasta que todos los preparativos estén RECIBIDO conforme'.
    """
    items = db.query(PreparativoOTModel).filter(PreparativoOTModel.wo_id == wo_id).all()
    counts = {"PENDIENTE": 0, "DESPACHADO": 0, "EN_TRANSITO": 0, "RECIBIDO": 0, "ANOMALIA": 0}
    for p in items:
        counts[p.status] = counts.get(p.status, 0) + 1
    total = len(items)
    received_conformes = sum(1 for p in items if p.status == "RECIBIDO" and p.conforme)
    return {
        "wo_id": wo_id,
        "total": total,
        "by_status": counts,
        "received_conformes": received_conformes,
        "ready_to_execute": total > 0 and received_conformes == total,
    }
