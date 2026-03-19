"""Production calendar router — shutdown windows, holidays, maintenance windows."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import CalendarEventCreate, CalendarEventUpdate
from api.services import calendar_service

router = APIRouter(prefix="/calendar", tags=["calendar"], dependencies=[Depends(get_current_user)])


@router.get("/events")
def list_events(
    plant_id: str | None = None,
    year: int | None = None,
    month: int | None = None,
    db: Session = Depends(get_db),
):
    return calendar_service.list_events(db, plant_id=plant_id, year=year, month=month)


@router.post("/events")
def create_event(data: CalendarEventCreate, db: Session = Depends(get_db)):
    return calendar_service.create_event(
        db,
        plant_id=data.plant_id,
        start_date=data.start_date,
        end_date=data.end_date,
        event_type=data.event_type,
        description=data.description,
        areas=data.areas,
    )


@router.get("/events/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    ev = calendar_service.get_event(db, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return ev


@router.put("/events/{event_id}")
def update_event(event_id: str, data: CalendarEventUpdate, db: Session = Depends(get_db)):
    result = calendar_service.update_event(db, event_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return result


@router.delete("/events/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db)):
    ok = calendar_service.delete_event(db, event_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return {"status": "deleted", "event_id": event_id}
