"""Imports router — file upload → parse → validate → persist (G-18 / Phase B)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import import_service
from tools.models.schemas import ImportSource

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/file")
async def import_file(
    file: UploadFile = File(...),
    source: str = Form(...),
    plant_id: str = Form(...),
    sheet_name: str | None = Form(default=None),
    imported_by: str | None = Form(default=None),
    db: Session = Depends(get_db),
):
    """Parse an Excel/CSV file, validate it, and persist the result.

    Form fields:
    - file: .xlsx or .csv upload
    - source: ImportSource enum value (e.g. EQUIPMENT_HIERARCHY)
    - plant_id: plant identifier (e.g. OCP-JFC)
    - sheet_name (optional): specific sheet for multi-sheet Excel files
    - imported_by (optional): user identifier for audit trail

    Returns: ImportHistoryEntry dict with import_id, status, counts, errors.
    """
    try:
        ImportSource(source)
    except ValueError:
        valid = [s.value for s in ImportSource]
        raise HTTPException(status_code=422, detail=f"Invalid source '{source}'. Valid: {valid}")

    filename = file.filename or "upload"
    if not filename.lower().endswith((".xlsx", ".csv")):
        raise HTTPException(status_code=422, detail="Only .xlsx and .csv files are supported.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    try:
        entry = import_service.import_file(
            db=db,
            plant_id=plant_id,
            source=source,
            filename=filename,
            file_bytes=file_bytes,
            sheet_name=sheet_name or None,
            imported_by=imported_by,
        )
        return entry.model_dump(mode="json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_import_history(
    plant_id: str | None = None,
    source: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Return import history, most recent first.

    Query params:
    - plant_id (optional): filter by plant
    - source (optional): filter by ImportSource value
    - limit (default 100): max rows to return
    """
    if limit < 1 or limit > 500:
        raise HTTPException(status_code=422, detail="limit must be 1–500")
    return import_service.list_import_history(db, plant_id=plant_id, source=source, limit=limit)


@router.get("/sources")
def list_import_sources():
    """Return all available ImportSource values."""
    return [s.value for s in ImportSource]
