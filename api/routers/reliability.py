"""Reliability router — spare parts, shutdowns, MoC, OCR, Jack-Knife, Pareto, LCC, RBI."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import (
    SparePartsRequest, ShutdownCreate, MOCCreate, MOCAdvance,
    OCRRequest, JackknifRequest, ParetoRequest, LCCRequest, RBIRequest,
)
from api.services import reliability_service

router = APIRouter(prefix="/reliability", tags=["reliability"], dependencies=[Depends(get_current_user)])


# ── Spare Parts ──────────────────────────────────────────────────────

@router.post("/spare-parts/analyze")
def analyze_spare_parts(data: SparePartsRequest, db: Session = Depends(get_db)):
    return reliability_service.analyze_spare_parts(db, data.plant_id, data.parts)


# ── Shutdowns ────────────────────────────────────────────────────────

@router.get("/shutdowns")
def list_shutdowns(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return reliability_service.list_shutdowns(db, plant_id=plant_id, status=status)


@router.post("/shutdowns")
def create_shutdown(data: ShutdownCreate, db: Session = Depends(get_db)):
    return reliability_service.create_shutdown(
        db,
        data.plant_id,
        data.name,
        data.planned_start,
        data.planned_end,
        data.work_orders,
    )


@router.get("/shutdowns/{shutdown_id}")
def get_shutdown(shutdown_id: str, db: Session = Depends(get_db)):
    result = reliability_service.get_shutdown(db, shutdown_id)
    if not result:
        raise HTTPException(status_code=404, detail="Shutdown not found")
    return result


@router.put("/shutdowns/{shutdown_id}/start")
def start_shutdown(shutdown_id: str, db: Session = Depends(get_db)):
    result = reliability_service.start_shutdown(db, shutdown_id)
    if not result:
        raise HTTPException(status_code=404, detail="Shutdown not found")
    return result


@router.put("/shutdowns/{shutdown_id}/complete")
def complete_shutdown(shutdown_id: str, db: Session = Depends(get_db)):
    result = reliability_service.complete_shutdown(db, shutdown_id)
    if not result:
        raise HTTPException(status_code=404, detail="Shutdown not found")
    return result


# ── MoC ──────────────────────────────────────────────────────────────

@router.post("/moc")
def create_moc(data: MOCCreate, db: Session = Depends(get_db)):
    return reliability_service.create_moc(
        db,
        data.plant_id,
        data.title,
        data.description,
        data.category,
        data.requester_id,
        data.affected_equipment,
        data.risk_level,
    )


@router.get("/mocs")
def list_mocs(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return reliability_service.list_mocs(db, plant_id, status)


@router.get("/moc/{moc_id}")
def get_moc(moc_id: str, db: Session = Depends(get_db)):
    result = reliability_service.get_moc(db, moc_id)
    if not result:
        raise HTTPException(status_code=404, detail="MoC not found")
    return result


@router.put("/moc/{moc_id}/advance")
def advance_moc(moc_id: str, data: MOCAdvance, db: Session = Depends(get_db)):
    d = data.model_dump()
    action = d.pop("action", "")
    result = reliability_service.advance_moc(db, moc_id, action, **d)
    if not result:
        raise HTTPException(status_code=404, detail="MoC not found")
    return result


# ── OCR ──────────────────────────────────────────────────────────────

@router.post("/ocr/analyze")
def calculate_ocr(data: OCRRequest, db: Session = Depends(get_db)):
    return reliability_service.calculate_ocr(db, data.model_dump())


# ── Jack-Knife ───────────────────────────────────────────────────────

@router.post("/jackknife/analyze")
def analyze_jackknife(data: JackknifRequest, db: Session = Depends(get_db)):
    return reliability_service.analyze_jackknife(db, data.plant_id, data.equipment_data)


# ── Pareto ───────────────────────────────────────────────────────────

@router.post("/pareto/analyze")
def analyze_pareto(data: ParetoRequest, db: Session = Depends(get_db)):
    return reliability_service.analyze_pareto(db, data.plant_id, data.metric_type, data.records)


# ── LCC ──────────────────────────────────────────────────────────────

@router.post("/lcc/calculate")
def calculate_lcc(data: LCCRequest, db: Session = Depends(get_db)):
    return reliability_service.calculate_lcc(db, data.model_dump())


# ── RBI ──────────────────────────────────────────────────────────────

@router.post("/rbi/assess")
def assess_rbi(data: RBIRequest, db: Session = Depends(get_db)):
    return reliability_service.assess_rbi(db, data.plant_id, data.equipment_list)
