"""Import service — bridges API router with DataImportEngine + FileParserEngine (G-18 / Phase B)."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from api.database.models import ImportHistoryModel
from tools.engines.data_import_engine import DataImportEngine
from tools.models.schemas import ImportHistoryEntry, ImportResult, ImportSource


def _result_status(result: ImportResult) -> str:
    """Derive import status string from result counts."""
    if result.error_rows == 0 and result.total_rows > 0:
        return "success"
    if result.valid_rows > 0:
        return "partial"
    return "failed"


def import_file(
    db: Session,
    plant_id: str,
    source: str,
    filename: str,
    file_bytes: bytes,
    sheet_name: Optional[str] = None,
    imported_by: Optional[str] = None,
) -> ImportHistoryEntry:
    """Parse a file, validate it, and persist the result to DB.

    Steps:
    1. Parse + validate via DataImportEngine.parse_and_validate()
    2. Derive status (success / partial / failed)
    3. Persist ImportHistoryModel row
    4. Return ImportHistoryEntry
    """
    source_enum = ImportSource(source)
    result: ImportResult = DataImportEngine.parse_and_validate(
        file_content=file_bytes,
        filename=filename,
        source=source_enum,
        sheet_name=sheet_name,
    )

    status = _result_status(result)
    file_size_kb = len(file_bytes) // 1024

    errors_serialisable = [
        {"row": e.row, "column": e.column, "message": e.message, "severity": e.severity}
        for e in result.errors
    ]

    row = ImportHistoryModel(
        plant_id=plant_id,
        source=source,
        filename=filename,
        file_size_kb=file_size_kb,
        total_rows=result.total_rows,
        valid_rows=result.valid_rows,
        error_rows=result.error_rows,
        status=status,
        errors_json=json.dumps(errors_serialisable) if errors_serialisable else None,
        imported_by=imported_by,
        imported_at=datetime.now(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return ImportHistoryEntry(
        import_id=row.import_id,
        plant_id=row.plant_id,
        source=source_enum,
        filename=row.filename,
        file_size_kb=row.file_size_kb,
        total_rows=row.total_rows,
        valid_rows=row.valid_rows,
        error_rows=row.error_rows,
        status=row.status,
        errors=result.errors,
        imported_by=row.imported_by,
        imported_at=row.imported_at,
    )


def list_import_history(
    db: Session,
    plant_id: Optional[str] = None,
    source: Optional[str] = None,
    limit: int = 100,
) -> list[dict]:
    """Return import history entries, most recent first."""
    q = db.query(ImportHistoryModel)
    if plant_id:
        q = q.filter(ImportHistoryModel.plant_id == plant_id)
    if source:
        q = q.filter(ImportHistoryModel.source == source)
    rows = q.order_by(ImportHistoryModel.imported_at.desc()).limit(limit).all()

    result = []
    for r in rows:
        errors = json.loads(r.errors_json) if r.errors_json else []
        result.append({
            "import_id": r.import_id,
            "plant_id": r.plant_id,
            "source": r.source,
            "filename": r.filename,
            "file_size_kb": r.file_size_kb,
            "total_rows": r.total_rows,
            "valid_rows": r.valid_rows,
            "error_rows": r.error_rows,
            "status": r.status,
            "errors": errors,
            "imported_by": r.imported_by,
            "imported_at": r.imported_at.isoformat() if r.imported_at else None,
        })
    return result
