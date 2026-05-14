"""DMS Document Management — lookup de documentos por ubicación funcional.

SEC 2026-05-11: agregado require auth. Antes este router era public y filtraba
metadatos de docs SAP del cliente (file_paths, SAP func loc, equipment names) a
cualquier visitante de mageam.com. Ver review de seguridad jornada VSC.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import DMSDocumentModel
from api.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/dms",
    tags=["dms"],
    dependencies=[Depends(get_current_user)],
)

DOC_TYPE_LABEL = {
    "DWG": "Plano",
    "MAF": "Pauta de mantención",
    "MAN": "Manual",
    "PRO": "Procedimiento",
    "CHK": "Checklist",
}


def _doc_to_dict(d: DMSDocumentModel) -> dict:
    return {
        "doc_id": d.doc_id,
        "document_number": d.document_number,
        "document_type": d.document_type,
        "type_label": DOC_TYPE_LABEL.get(d.document_type, d.document_type),
        "document_desc": d.document_desc,
        "version": d.version,
        "sap_func_loc": d.sap_func_loc,
        "sap_func_loc_short": d.sap_func_loc_short,
        "equipment_name": d.equipment_name,
        "file_path": d.file_path,
        "status": d.status,
    }


@router.get("/documents")
def list_documents(
    func_loc: str | None = Query(None, description="SAP functional location (full or partial)"),
    func_loc_short: str | None = Query(None),
    doc_type: str | None = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(DMSDocumentModel).filter(DMSDocumentModel.status == "Activo")
    if func_loc:
        # Match by prefix — catches parent nodes too
        q = q.filter(DMSDocumentModel.sap_func_loc.like(f"{func_loc}%"))
    if func_loc_short:
        q = q.filter(DMSDocumentModel.sap_func_loc_short == func_loc_short)
    if doc_type:
        q = q.filter(DMSDocumentModel.document_type == doc_type)
    docs = q.limit(limit).all()
    return [_doc_to_dict(d) for d in docs]


@router.get("/documents/{document_number}")
def get_document(document_number: str, db: Session = Depends(get_db)):
    doc = db.query(DMSDocumentModel).filter(
        DMSDocumentModel.document_number == document_number
    ).first()
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(404, "Document not found")
    return _doc_to_dict(doc)
