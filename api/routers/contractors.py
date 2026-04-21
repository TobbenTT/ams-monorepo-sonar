"""Group C #8 — Contractors & crews management.

Minimal CRUD so a planner can assign a contractor crew to a WO via
ManagedWorkOrder.contractor_crew_id. Full performance-tracking
(SF-367) stays in scaffolding.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import ContractorModel, ContractorCrewModel
from api.dependencies.auth import get_current_user, require_role


class ContractorIn(BaseModel):
    model_config = {"extra": "ignore"}
    plant_id: str
    name: str = Field(min_length=2, max_length=200)
    tax_id: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    hourly_rate: float | None = None


class CrewIn(BaseModel):
    model_config = {"extra": "ignore"}
    contractor_id: str
    name: str = Field(min_length=2, max_length=120)
    specialty: str | None = None
    size: int = 1


router = APIRouter(
    prefix="/contractors",
    tags=["contractors"],
    dependencies=[Depends(get_current_user)],
)


def _contractor_dict(c: ContractorModel) -> dict:
    return {
        "contractor_id": c.contractor_id,
        "plant_id": c.plant_id,
        "name": c.name,
        "tax_id": c.tax_id,
        "contact_name": c.contact_name,
        "contact_phone": c.contact_phone,
        "hourly_rate": c.hourly_rate,
        "active": c.active,
    }


def _crew_dict(cr: ContractorCrewModel) -> dict:
    return {
        "crew_id": cr.crew_id,
        "contractor_id": cr.contractor_id,
        "name": cr.name,
        "specialty": cr.specialty,
        "size": cr.size,
        "active": cr.active,
    }


@router.get("/")
def list_contractors(plant_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(ContractorModel).filter(ContractorModel.active == True)
    if plant_id:
        q = q.filter(ContractorModel.plant_id == plant_id)
    return [_contractor_dict(c) for c in q.order_by(ContractorModel.name).all()]


@router.post("/")
def create_contractor(
    data: ContractorIn,
    user=Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    c = ContractorModel(**data.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return _contractor_dict(c)


@router.get("/{contractor_id}/crews")
def list_crews(contractor_id: str, db: Session = Depends(get_db)):
    rows = db.query(ContractorCrewModel).filter(
        ContractorCrewModel.contractor_id == contractor_id,
        ContractorCrewModel.active == True,
    ).order_by(ContractorCrewModel.name).all()
    return [_crew_dict(c) for c in rows]


@router.post("/{contractor_id}/crews")
def create_crew(
    contractor_id: str,
    data: CrewIn,
    user=Depends(require_role("admin", "manager", "planner")),
    db: Session = Depends(get_db),
):
    if data.contractor_id != contractor_id:
        raise HTTPException(status_code=400, detail="contractor_id mismatch")
    cr = ContractorCrewModel(**data.model_dump())
    db.add(cr); db.commit(); db.refresh(cr)
    return _crew_dict(cr)


@router.get("/crews/all")
def list_all_crews(plant_id: str | None = None, db: Session = Depends(get_db)):
    """Flat list of crews across contractors — joins contractor name so the
    planner dropdown can show 'Contractor — Crew (specialty)'."""
    q = (
        db.query(ContractorCrewModel, ContractorModel)
        .join(ContractorModel, ContractorCrewModel.contractor_id == ContractorModel.contractor_id)
        .filter(ContractorCrewModel.active == True, ContractorModel.active == True)
    )
    if plant_id:
        q = q.filter(ContractorModel.plant_id == plant_id)
    out = []
    for cr, c in q.all():
        d = _crew_dict(cr)
        d["contractor_name"] = c.name
        d["plant_id"] = c.plant_id
        out.append(d)
    return out
