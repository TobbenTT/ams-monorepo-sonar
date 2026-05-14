"""Production calendar service — CRUD for shutdown windows, holidays, maintenance windows."""

import uuid
import logging
from datetime import date
from sqlalchemy.orm import Session
from api.database.models import ShutdownCalendarModel

logger = logging.getLogger(__name__)

VALID_EVENT_TYPES = [
    "MINOR_8H", "MAJOR_20H_PLUS",
    "HOLIDAY", "MAINTENANCE_WINDOW", "PRODUCTION_STOP",
]


def list_events(db: Session, plant_id: str | None = None, year: int | None = None, month: int | None = None):
    q = db.query(ShutdownCalendarModel)
    if plant_id:
        q = q.filter(ShutdownCalendarModel.plant_id == plant_id)
    if year:
        q = q.filter(
            db.func.extract("year", ShutdownCalendarModel.start_date) == year
        )
    if month:
        q = q.filter(
            db.func.extract("month", ShutdownCalendarModel.start_date) == month
        )
    q = q.order_by(ShutdownCalendarModel.start_date)
    return [_to_dict(e) for e in q.all()]


def create_event(
    db: Session,
    plant_id: str,
    start_date: str,
    end_date: str,
    event_type: str,
    description: str = "",
    areas: list | None = None,
):
    ev = ShutdownCalendarModel(
        shutdown_id=str(uuid.uuid4())[:12],
        plant_id=plant_id,
        start_date=date.fromisoformat(start_date),
        end_date=date.fromisoformat(end_date),
        shutdown_type=event_type,
        description=description,
        areas=areas or [],
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    logger.info("Calendar event created: %s (%s)", ev.shutdown_id, event_type)
    return _to_dict(ev)


def get_event(db: Session, event_id: str):
    ev = db.query(ShutdownCalendarModel).filter_by(shutdown_id=event_id).first()
    return _to_dict(ev) if ev else None


def update_event(db: Session, event_id: str, data: dict):
    ev = db.query(ShutdownCalendarModel).filter_by(shutdown_id=event_id).first()
    if not ev:
        return None
    for field in ("start_date", "end_date"):
        if field in data and data[field]:
            setattr(ev, field, date.fromisoformat(data[field]))
    if "event_type" in data and data["event_type"]:
        ev.shutdown_type = data["event_type"]
    if "description" in data and data["description"] is not None:
        ev.description = data["description"]
    if "areas" in data:
        ev.areas = data["areas"]
    db.commit()
    db.refresh(ev)
    return _to_dict(ev)


def delete_event(db: Session, event_id: str):
    ev = db.query(ShutdownCalendarModel).filter_by(shutdown_id=event_id).first()
    if not ev:
        return False
    db.delete(ev)
    db.commit()
    return True


def _to_dict(ev: ShutdownCalendarModel) -> dict:
    return {
        "event_id": ev.shutdown_id,
        "plant_id": ev.plant_id,
        "start_date": ev.start_date.isoformat() if ev.start_date else None,
        "end_date": ev.end_date.isoformat() if ev.end_date else None,
        "event_type": ev.shutdown_type,
        "description": ev.description,
        "areas": ev.areas or [],
    }
