"""SAP router — upload generation, approval, mock data access."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import SAPUploadRequest, SAPTransitionRequest
from api.services import sap_service

router = APIRouter(prefix="/sap", tags=["sap"], dependencies=[Depends(get_current_user)])


@router.post("/generate-upload")
def generate_upload(data: SAPUploadRequest, db: Session = Depends(get_db)):
    obj = sap_service.generate_upload(
        db,
        plant_code=data.plant_code,
        maintenance_plan=data.maintenance_plan,
        maintenance_items=data.maintenance_items,
        task_lists=data.task_lists,
    )
    return {"package_id": obj.package_id, "status": obj.status}


@router.get("/uploads/{package_id}")
def get_upload(package_id: str, db: Session = Depends(get_db)):
    obj = sap_service.get_upload(db, package_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Upload package not found")
    return {
        "package_id": obj.package_id, "plant_code": obj.plant_code,
        "status": obj.status, "generated_at": obj.generated_at.isoformat() if obj.generated_at else None,
        "maintenance_plan": obj.maintenance_plan,
        "maintenance_items": obj.maintenance_items,
        "task_lists": obj.task_lists,
    }


@router.get("/uploads")
def list_uploads(plant_code: str | None = None, plant_id: str | None = None, db: Session = Depends(get_db)):
    uploads = sap_service.list_uploads(db, plant_code=plant_code or plant_id)
    return [
        {
            "package_id": u.package_id,
            "upload_id": u.package_id,
            "plant_code": u.plant_code,
            "status": u.status,
            "template_type": "SAP_PM",
            "record_count": len(u.maintenance_items or []) if hasattr(u, "maintenance_items") else 0,
        }
        for u in uploads
    ]


@router.put("/uploads/{package_id}/approve")
def approve_upload(package_id: str, db: Session = Depends(get_db)):
    result = sap_service.approve_upload(db, package_id)
    if "error" in result:
        raise HTTPException(status_code=409, detail=result["error"])
    return result


@router.post("/validate-transition")
def validate_transition(data: SAPTransitionRequest):
    return sap_service.validate_state_transition(
        entity_type=data.entity_type,
        current_state=data.current_state,
        target_state=data.target_state,
    )


@router.get("/mock/{transaction}")
def get_mock_data(transaction: str):
    result = sap_service.get_mock_data(transaction)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── SAP Sync queue (Strategy Pattern transport layer) ───────────────
from api.services import sap_sync_service


@router.get("/transport/info")
def transport_info():
    """Cuál transport está activo (env SAP_TRANSPORT) + healthcheck."""
    from api.services.sap_transports import get_transport
    t = get_transport()
    return {"name": t.name, "healthy": t.healthcheck()}


@router.get("/queue")
def queue_status(db: Session = Depends(get_db), limit: int = 50):
    """Estado actual de la cola sap_sync_log con totales por status."""
    from api.database.models import SapSyncLogModel
    from sqlalchemy import func
    counts = dict(
        db.query(SapSyncLogModel.status, func.count(SapSyncLogModel.id))
        .group_by(SapSyncLogModel.status).all()
    )
    recent = (
        db.query(SapSyncLogModel)
        .order_by(SapSyncLogModel.created_at.desc())
        .limit(limit).all()
    )
    return {
        "counts": counts,
        "recent": [
            {
                "id": r.id,
                "entity_id": r.entity_id,
                "status": r.status,
                "attempts": r.attempts,
                "sap_ref": r.sap_ref,
                "last_error": r.last_error,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            }
            for r in recent
        ],
    }


@router.post("/queue/process")
def queue_process(db: Session = Depends(get_db), max_batch: int = 10):
    """Procesa batch de la cola (manual). En prod corre como cron/worker."""
    stats = sap_sync_service.process_pending(db, max_batch=max_batch)
    return stats


@router.post("/sync-wo/{wo_id}")
def sync_wo_manually(wo_id: str, db: Session = Depends(get_db)):
    """Encolar una OT específica para sync a SAP."""
    result = sap_sync_service.push_wo(db, wo_id)
    if not result:
        raise HTTPException(status_code=404, detail="WO not found")
    return result
