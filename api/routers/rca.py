"""RCA & Defect Elimination router — root cause analysis, planning KPIs, DE KPIs."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import RCACreate, RCAUpdate, FiveW2HRequest, RCAAdvance, PlanningKPIRequest, DEKPIRequest
from api.services import rca_service

router = APIRouter(prefix="/rca", tags=["rca"], dependencies=[Depends(get_current_user)])


# ── RCA Analyses ──────────────────────────────────────────────────────

@router.post("/analyses")
def create_rca(data: RCACreate, db: Session = Depends(get_db)):
    return rca_service.create_rca(
        db,
        event_description=data.event_description,
        plant_id=data.plant_id,
        equipment_id=data.equipment_id,
        max_consequence=data.max_consequence,
        frequency=data.frequency,
        team_members=data.team_members,
    )


@router.get("/analyses")
def list_rcas(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return rca_service.list_rcas(db, plant_id, status)


@router.get("/analyses/summary")
def get_rca_summary(
    plant_id: str | None = None,
    db: Session = Depends(get_db),
):
    return rca_service.get_rca_summary(db, plant_id)


@router.get("/analyses/{analysis_id}")
def get_rca(analysis_id: str, db: Session = Depends(get_db)):
    result = rca_service.get_rca(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="RCA analysis not found")
    return result


@router.put("/analyses/{analysis_id}")
def update_rca(analysis_id: str, data: RCAUpdate, db: Session = Depends(get_db)):
    result = rca_service.update_rca(db, analysis_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="RCA analysis not found")
    return result


@router.post("/analyses/{analysis_id}/5w2h")
def run_5w2h(analysis_id: str, data: FiveW2HRequest, db: Session = Depends(get_db)):
    result = rca_service.run_5w2h(db, analysis_id, data.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="RCA analysis not found")
    return result


@router.put("/analyses/{analysis_id}/advance")
def advance_status(analysis_id: str, data: RCAAdvance, db: Session = Depends(get_db)):
    result = rca_service.advance_rca_status(db, analysis_id, data.status)
    if not result:
        raise HTTPException(status_code=404, detail="RCA analysis not found")
    return result


@router.post("/analyses/{analysis_id}/push-to-capa")
def push_to_capa(analysis_id: str, db: Session = Depends(get_db)):
    """Convierte las solutions del RCA en ImprovementAction (CAPA) rows.
    Idempotente: omite las que ya fueron creadas (tracked via source_ref)."""
    result = rca_service.push_solutions_to_capa(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="RCA analysis not found")
    return result


# ── Planning KPIs ─────────────────────────────────────────────────────

@router.post("/planning-kpis/calculate")
def calculate_planning_kpis(data: PlanningKPIRequest, db: Session = Depends(get_db)):
    return rca_service.calculate_planning_kpis(db, data.model_dump())


@router.get("/planning-kpis")
def list_planning_kpi_snapshots(
    plant_id: str | None = None,
    db: Session = Depends(get_db),
):
    return rca_service.list_planning_kpi_snapshots(db, plant_id)


# ── DE KPIs ───────────────────────────────────────────────────────────

@router.post("/de-kpis/calculate")
def calculate_de_kpis(data: DEKPIRequest, db: Session = Depends(get_db)):
    return rca_service.calculate_de_kpis(db, data.model_dump())


@router.get("/de-kpis")
def list_de_kpi_snapshots(
    plant_id: str | None = None,
    db: Session = Depends(get_db),
):
    return rca_service.list_de_kpi_snapshots(db, plant_id)
