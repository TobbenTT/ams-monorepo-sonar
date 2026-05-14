"""Supervisor Agent endpoints — Jorge bullets r64 #1 + #2."""
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.dependencies.auth import get_current_user
from api.database.connection import get_db
from api.services import supervisor_agent_service as svc

router = APIRouter(prefix="/supervisor-agent", tags=["supervisor-agent"])


class ShiftReadinessRequest(BaseModel):
    plant_id: str = "OCP-JFC1"
    shift_date: str | None = None        # ISO date; defaults today
    shift: Literal["day", "night"] = "day"
    absent_worker_ids: list[str] = []
    equipment_unavailable: list[str] = []
    use_claude: bool = True


class ProductionVsProgramRequest(BaseModel):
    plant_id: str = "OCP-JFC1"
    shift_date: str | None = None
    production_goal: float
    production_actual: float
    production_unit: str = "ton"
    equipment_availability_goal: float = 92.0
    equipment_availability_actual: float = 88.0
    use_claude: bool = True


def _parse_date(s: str | None) -> datetime:
    if not s:
        return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return datetime.fromisoformat(s)


@router.post("/shift-start-readiness")
def shift_readiness(
    body: ShiftReadinessRequest,
    _user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bullet r64 #1 — HH real al inicio jornada + impacto ausentismo + sugerencias."""
    return svc.shift_start_readiness(
        db, body.plant_id, _parse_date(body.shift_date), body.shift,
        body.absent_worker_ids, body.equipment_unavailable, body.use_claude,
    )


@router.post("/production-vs-program")
def prod_vs_program(
    body: ProductionVsProgramRequest,
    _user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bullet r64 #2 — análisis programa mtto vs metas producción + sugerencias."""
    return svc.production_vs_program(
        db, body.plant_id, _parse_date(body.shift_date),
        body.production_goal, body.production_actual, body.production_unit,
        body.equipment_availability_goal, body.equipment_availability_actual,
        body.use_claude,
    )
