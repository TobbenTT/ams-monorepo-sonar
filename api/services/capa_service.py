"""CAPA service — wraps CAPAEngine for PDCA lifecycle."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import CAPAItemModel
from api.services.audit_service import log_action
from tools.engines.capa_engine import CAPAEngine
from tools.models.schemas import CAPAType, CAPAItem


def create_capa(db: Session, data: dict) -> dict:
    capa_type = CAPAType(data["capa_type"])
    result = CAPAEngine.create_capa(
        capa_type=capa_type,
        title=data["title"],
        description=data["description"],
        plant_id=data["plant_id"],
        source=data.get("source", "manual"),
        assigned_to=data.get("assigned_to", ""),
        equipment_id=data.get("equipment_id"),
    )
    obj = CAPAItemModel(
        capa_id=result.capa_id,
        capa_type=result.capa_type.value,
        title=result.title,
        description=result.description,
        plant_id=result.plant_id,
        equipment_id=result.equipment_id,
        source=result.source,
        current_phase=result.current_phase.value,
        status=result.status.value,
        assigned_to=result.assigned_to,
        created_at=datetime.now(),
    )
    db.add(obj)
    log_action(db, "capa", obj.capa_id, "CREATE")
    db.commit()
    return result.model_dump(mode="json")


def get_capa(db: Session, capa_id: str) -> CAPAItemModel | None:
    return db.query(CAPAItemModel).filter(CAPAItemModel.capa_id == capa_id).first()


def list_capas(db: Session, plant_id: str | None = None, status: str | None = None) -> list[CAPAItemModel]:
    q = db.query(CAPAItemModel)
    if plant_id:
        q = q.filter(CAPAItemModel.plant_id == plant_id)
    if status:
        q = q.filter(CAPAItemModel.status == status)
    return q.order_by(CAPAItemModel.created_at.desc()).all()


def get_summary(db: Session, plant_id: str | None = None) -> dict:
    capas = list_capas(db, plant_id=plant_id)
    capa_objects = []
    for c in capas:
        capa_objects.append(CAPAItem(
            capa_id=c.capa_id,
            capa_type=CAPAType(c.capa_type),
            title=c.title,
            description=c.description,
            plant_id=c.plant_id,
            source=c.source,
            current_phase=c.current_phase,
            status=c.status,
        ))
    return CAPAEngine.get_summary(capa_objects)
