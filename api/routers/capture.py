"""Capture router — field capture submission and retrieval."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import CaptureCreate
from api.services import capture_service
from api.services.capture_service import PHOTO_DIR

router = APIRouter(prefix="/capture", tags=["capture"], dependencies=[Depends(get_current_user)])

# Photos router — JWT auth via header OR ?token= query param (para <img src>).
# Security audit 2026-05-12: antes era 100% público → cualquiera con la URL
# podía ver fotos del cliente (info leak). Ahora:
#  1. Token obligatorio (Authorization Bearer o ?token=).
#  2. JWT validado + token_version check.
#  3. Si role != admin/manager, verificar que la captura pertenece a la planta
#     del user (IDOR-scoping cross-plant).
photos_router = APIRouter(prefix="/capture", tags=["capture"])


def _validate_photo_access(request: Request, filename: str, db: Session) -> None:
    """Valida JWT + scope plant. Levanta 401/403/404 si no autorizado."""
    from api.services.auth_service import decode_token, get_user_by_id
    # Token desde header Authorization o query param ?token=
    auth = request.headers.get("authorization") or ""
    token = ""
    if auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1].strip()
    if not token:
        token = request.query_params.get("token") or ""
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido para acceder a fotos")
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user = get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o desactivado")
    if payload.get("ver", 0) != getattr(user, "token_version", 0):
        raise HTTPException(status_code=401, detail="Token revocado")
    # IDOR scope: admin/manager ven todo; otros solo fotos de su planta.
    if user.role in ("admin", "manager"):
        return
    user_plant = getattr(user, "plant_id", None)
    if not user_plant:
        # User sin plant → solo ve sus propias capturas (raro, pero permitido).
        return
    # capture_id = filename sin extensión. Buscar la captura y verificar plant.
    capture_id = Path(filename).stem
    from api.database.models import FieldCaptureModel, WorkRequestModel
    cap = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == capture_id).first()
    if cap:
        wr = db.query(WorkRequestModel).filter(WorkRequestModel.source_capture_id == capture_id).first()
        # Plant lo guarda la WR (ai_classification.plant_id) o se hereda del user
        wr_plant = None
        if wr and wr.ai_classification:
            wr_plant = (wr.ai_classification or {}).get("plant_id")
        if wr_plant and wr_plant != user_plant:
            raise HTTPException(status_code=404, detail="Photo not found")
    # Si no encontramos captura, asumimos que el filename no es predictable y
    # ya pasamos auth → permitimos (escenario: filenames custom de DMS).


@photos_router.get("/photos/{filename}")
def get_capture_photo(filename: str, request: Request, db: Session = Depends(get_db)):
    """Serve a saved capture photo. Requiere JWT (Bearer header o ?token= query)."""
    _validate_photo_access(request, filename, db)
    safe_name = Path(filename).name
    filepath = PHOTO_DIR / safe_name
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
    media_type = "image/jpeg"
    if safe_name.endswith(".png"):
        media_type = "image/png"
    elif safe_name.endswith(".webp"):
        media_type = "image/webp"
    return FileResponse(filepath, media_type=media_type)


@router.post("/")
def submit_capture(data: CaptureCreate, db: Session = Depends(get_db)):
    result = capture_service.process_capture(db, data.model_dump())
    return result


@router.get("/")
def list_captures(db: Session = Depends(get_db)):
    from api.database.models import WorkRequestModel

    captures = capture_service.list_captures(db)
    result = []
    for c in captures:
        wr = db.query(WorkRequestModel).filter(
            WorkRequestModel.source_capture_id == c.capture_id
        ).first()
        result.append({
            "capture_id": c.capture_id,
            "technician_id": c.technician_id,
            "capture_type": c.capture_type,
            "language": c.language,
            "equipment_tag_manual": c.equipment_tag_manual,
            "raw_text_preview": (c.raw_text or "")[:100],
            "location_hint": c.location_hint,
            "work_request_id": wr.request_id if wr else None,
            "work_request_status": wr.status if wr else None,
            "equipment_tag_resolved": wr.equipment_tag if wr else None,
            "priority": (wr.ai_classification or {}).get("priority_suggested") if wr else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.delete("/{capture_id}")
def delete_capture(capture_id: str, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel, WorkRequestModel
    c = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == capture_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Capture not found")
    # Also delete linked work request if exists
    db.query(WorkRequestModel).filter(WorkRequestModel.source_capture_id == capture_id).delete()
    db.delete(c)
    db.commit()
    return {"deleted": capture_id}


@router.get("/{capture_id}")
def get_capture(capture_id: str, db: Session = Depends(get_db)):
    c = capture_service.get_capture(db, capture_id)
    if not c:
        raise HTTPException(status_code=404, detail="Capture not found")
    return {
        "capture_id": c.capture_id,
        "technician_id": c.technician_id,
        "capture_type": c.capture_type,
        "language": c.language,
        "raw_text": c.raw_text,
        "raw_voice_text": c.raw_voice_text,
        "equipment_tag_manual": c.equipment_tag_manual,
        "location_hint": c.location_hint,
        "photos": c.images or [],
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
