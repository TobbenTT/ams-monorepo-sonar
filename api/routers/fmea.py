"""FMEA router — failure modes, RCM decision, FM validation endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import (
    FailureModeCreate, RCMDecideRequest,
    FunctionCreate, FunctionalFailureCreate, FMECAWorksheetCreate, RPNRequest,
)
from api.services import fmea_service

router = APIRouter(prefix="/fmea", tags=["fmea"], dependencies=[Depends(get_current_user)])


@router.post("/failure-modes")
def create_failure_mode(data: FailureModeCreate, db: Session = Depends(get_db)):
    try:
        obj = fmea_service.create_failure_mode(db, data.model_dump())
        return {
            "failure_mode_id": obj.failure_mode_id,
            "what": obj.what,
            "mechanism": obj.mechanism,
            "cause": obj.cause,
            "strategy_type": obj.strategy_type,
        }
    except ValueError as e:
        logger.error("Failure mode creation validation error: %s", e)
        raise HTTPException(status_code=422, detail="Validation error")


@router.get("/failure-modes/{fm_id}")
def get_failure_mode(fm_id: str, db: Session = Depends(get_db)):
    obj = fmea_service.get_failure_mode(db, fm_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    return {
        "failure_mode_id": obj.failure_mode_id,
        "what": obj.what,
        "mechanism": obj.mechanism,
        "cause": obj.cause,
        "failure_consequence": obj.failure_consequence,
        "strategy_type": obj.strategy_type,
        "failure_effect": obj.failure_effect,
    }


@router.get("/failure-modes")
def list_failure_modes(functional_failure_id: str | None = None, db: Session = Depends(get_db)):
    fms = fmea_service.list_failure_modes(db, functional_failure_id=functional_failure_id)
    return [{"failure_mode_id": fm.failure_mode_id, "what": fm.what, "mechanism": fm.mechanism, "cause": fm.cause, "strategy_type": fm.strategy_type} for fm in fms]


@router.get("/validate-fm")
def validate_fm_combination(mechanism: str, cause: str):
    return fmea_service.validate_fm_combination(mechanism, cause)


@router.get("/fm-combinations")
def get_valid_combinations(mechanism: str | None = None):
    return fmea_service.get_valid_combinations(mechanism)


@router.post("/rcm-decide")
def rcm_decide(data: RCMDecideRequest):
    return fmea_service.rcm_decide(data.model_dump())


@router.get("/functions")
def list_functions(node_id: str | None = None, db: Session = Depends(get_db)):
    funcs = fmea_service.list_functions(db, node_id=node_id)
    return [
        {
            "function_id": f.function_id,
            "node_id": f.node_id,
            "function_type": f.function_type,
            "description": f.description,
            "description_fr": f.description_fr,
        }
        for f in funcs
    ]


@router.post("/functions")
def create_function(data: FunctionCreate, db: Session = Depends(get_db)):
    obj = fmea_service.create_function(db, **data.model_dump())
    return {"function_id": obj.function_id, "node_id": obj.node_id, "function_type": obj.function_type}


@router.get("/functional-failures")
def list_functional_failures(function_id: str | None = None, db: Session = Depends(get_db)):
    ffs = fmea_service.list_functional_failures(db, function_id=function_id)
    return [
        {
            "failure_id": ff.failure_id,
            "function_id": ff.function_id,
            "failure_type": ff.failure_type,
            "description": ff.description,
            "description_fr": ff.description_fr,
        }
        for ff in ffs
    ]


@router.post("/functional-failures")
def create_functional_failure(data: FunctionalFailureCreate, db: Session = Depends(get_db)):
    obj = fmea_service.create_functional_failure(db, **data.model_dump())
    return {"failure_id": obj.failure_id, "function_id": obj.function_id, "failure_type": obj.failure_type}


# ── Phase 7: FMECA Worksheet Endpoints ──────────────────────────────

@router.get("/fmeca/worksheets")
def list_fmeca_worksheets(
    equipment_id: str | None = None,
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return fmea_service.list_fmeca_worksheets(db, equipment_id=equipment_id, plant_id=plant_id, status=status)


@router.get("/fmeca/worksheets-summary")
def list_fmeca_worksheets_summary(
    plant_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    """Nueva vista: un entry por worksheet (para navegación master/detail)."""
    return fmea_service.list_fmeca_worksheets_summary(db, plant_id=plant_id, status=status)


@router.get("/fmeca/suggestions")
def list_fmeca_suggestions(
    plant_id: str | None = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Fase 3a — equipos con OTs P1/P2 cerradas y sin worksheet FMECA.
    Sugiere crear análisis (ordenado por conteo de fallas críticas)."""
    return fmea_service.list_fmeca_suggestions(db, plant_id=plant_id, limit=limit)


@router.get("/fmeca/history-hints")
def fmeca_history_hints(equipment_id: str, months: int = 12, db: Session = Depends(get_db)):
    """Jorge 2026-04-23: FMECA ↔ Fallas & Eventos. Dado un equipo, devuelve
    sugerencias de filas FMECA extraídas del historial de OTs cerradas PM03/P1/P2."""
    return fmea_service.fmeca_history_hints(db, equipment_id=equipment_id, months=months)


@router.post("/fmeca/worksheets")
def create_fmeca_worksheet(data: FMECAWorksheetCreate, db: Session = Depends(get_db)):
    return fmea_service.create_fmeca_worksheet(db, data.model_dump())


@router.get("/fmeca/worksheets/{worksheet_id}")
def get_fmeca_worksheet(worksheet_id: str, db: Session = Depends(get_db)):
    result = fmea_service.get_fmeca_worksheet(db, worksheet_id)
    if not result:
        raise HTTPException(status_code=404, detail="FMECA worksheet not found")
    return result


@router.post("/fmeca/worksheets/{worksheet_id}/rows")
def add_fmeca_row(worksheet_id: str, data: dict, db: Session = Depends(get_db)):
    result = fmea_service.add_fmeca_row(db, worksheet_id, data)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/fmeca/rpn")
def calculate_rpn(data: RPNRequest):
    return fmea_service.calculate_rpn_service(
        severity=data.severity,
        occurrence=data.occurrence,
        detection=data.detection,
    )


@router.put("/fmeca/worksheets/{worksheet_id}/run-decisions")
def run_fmeca_decisions(worksheet_id: str, db: Session = Depends(get_db)):
    result = fmea_service.run_fmeca_decisions(db, worksheet_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/fmeca/worksheets/{worksheet_id}/generate-tasks")
def generate_fmeca_tasks(worksheet_id: str, db: Session = Depends(get_db)):
    result = fmea_service.generate_tasks_from_fmeca(db, worksheet_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/fmeca/worksheets/{worksheet_id}/push-to-backlog")
def push_fmeca_to_backlog(worksheet_id: str, db: Session = Depends(get_db)):
    """Fase 3c — convierte filas del FMECA con estrategia en BacklogItem rows."""
    result = fmea_service.push_fmeca_to_backlog(db, worksheet_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/fmeca/worksheets/{worksheet_id}/summary")
def get_fmeca_summary(worksheet_id: str, db: Session = Depends(get_db)):
    result = fmea_service.get_fmeca_summary(db, worksheet_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
