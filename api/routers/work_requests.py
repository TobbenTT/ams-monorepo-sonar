"""Work requests router — list, get, validate, classify, duplicates, OCR closure."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
from api.schemas import WRValidateRequest
from api.services import work_request_service
from api.services import vision_service
from api.services import context_builder_service as ctx_builder


class DuplicateCheckRequest(BaseModel):
    equipment_tag: str
    problem_description: str = ""
    priority: str | None = None  # filtro severidad (mejora 2026-04-28)


class LinkDuplicateRequest(BaseModel):
    """Vincular un WR como duplicado de otro y cancelarlo automáticamente."""
    duplicate_of_request_id: str
    note: str | None = None


class OCRClosureRequest(BaseModel):
    work_order_id: str
    actual_hours: float = Field(ge=0)
    completion_date: str = ""
    findings: str = ""
    spare_parts_used: str = ""
    condition_after: str = "Good"
    technician_notes: str = ""
    ocr_confidence: float = Field(default=0, ge=0, le=100)


class WRApproveRequest(BaseModel):
    comment: str = Field(min_length=1, description="Mandatory approval comment")
    priority_override: str | None = None  # P1, P2, P3, P4


class WRRejectRequest(BaseModel):
    reason: str = Field(min_length=1, description="Mandatory rejection reason")


class WRAssignWorker(BaseModel):
    worker_id: str
    worker_name: str = ""


class WRAssignRequest(BaseModel):
    workers: list[WRAssignWorker]


class ImageAssistRequest(BaseModel):
    image: str = ""  # single base64 image (legacy)
    images: list = []  # multiple base64 images
    equipment_tag: str = ""
    additional_context: str = ""

class AIFeedbackCreate(BaseModel):
    field_name: str = ""
    predicted_value: str = ""
    actual_value: str = ""
    rating: int = 0  # -1 bad, 0 neutral, 1 good

class AIAssistRequest(BaseModel):
    """Request AI assistance to fill aviso fields based on description."""
    description: str = ""
    equipment_tag: str = ""
    plant_condition: str = ""
    # Fields already filled by user (AI should NOT overwrite these)
    existing_priority: str = ""
    existing_category: str = ""
    existing_action: str = ""


class WRManualCreateRequest(BaseModel):
    """Create a WR directly without AI processing — for manual form entry."""
    equipment_tag: str = ""
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"
    activity_class: str = ""
    failure_category: str = ""
    failure_symptom: str = ""
    failure_object_part: str = ""
    failure_cause: str = ""
    plant_condition: str = ""
    suggested_action: str = ""
    wo_title: str = ""
    equipment_condition: str = ""
    estimated_duration: float = 4
    materials: list = []  # list of str or dict
    resources: list = []  # list of str or dict
    created_by: str = ""
    notification_type: str = "A1"
    reported_by: str = ""
    circumstances: str = ""
    support_equipment: list = []
    documents: list = []
    technical_location: str = ""
    aviso_coding: str = ""
    planning_group: str = ""
    area_empresa: str = ""
    work_center: str = ""
    work_conditions: str = ""


class WRFromHierarchyRequest(BaseModel):
    equipment_tag: str
    equipment_name: str = ""
    plant_id: str = ""
    problem_description: str = ""
    priority: str = "P3"


router = APIRouter(prefix="/work-requests", tags=["work-requests"], dependencies=[Depends(get_current_user)])


@router.get("/search-materials")
def search_materials(q: str = "", category: str = "", limit: int = 20, db: Session = Depends(get_db)):
    """Search SAP materials catalog by description or SAP ID. Supports English query terms."""
    from sqlalchemy import text
    # English->Spanish mapping for common maintenance terms
    EN_ES_MAP = {
        "bearing": "rodamiento", "seal": "sello", "filter": "filtro", "oil": "aceite",
        "grease": "grasa", "belt": "correa", "bolt": "perno", "nut": "tuerca",
        "washer": "golilla", "gasket": "junta", "coupling": "acople", "shaft": "eje",
        "gear": "engranaje", "pump": "bomba", "valve": "valvula", "motor": "motor",
        "cable": "cable", "fuse": "fusible", "contactor": "contactor", "sensor": "sensor",
        "transmitter": "transmisor", "electrode": "electrodo", "welding": "soldadura",
        "paint": "pintura", "screw": "tornillo", "spring": "resorte", "chain": "cadena",
        "hose": "manguera", "pipe": "tuberia", "flange": "brida", "impeller": "impulsor",
    }
    query = "SELECT sap_id, description, category, unit FROM sap_materials WHERE 1=1"
    params = {}
    if q:
        q_lower = q.lower()
        # Check if English term, map to Spanish
        es_term = EN_ES_MAP.get(q_lower, "")
        if es_term:
            query += " AND (sap_id LIKE :q OR LOWER(description) LIKE :q OR LOWER(description) LIKE :q2)"
            params["q"] = f"%{q_lower}%"
            params["q2"] = f"%{es_term}%"
        else:
            query += " AND (sap_id LIKE :q OR LOWER(description) LIKE :q)"
            params["q"] = f"%{q_lower}%"
    if category:
        query += " AND category = :cat"
        params["cat"] = category.upper()
    query += " ORDER BY description LIMIT :lim"
    params["lim"] = limit
    rows = db.execute(text(query), params).fetchall()
    return [{"sapId": r[0], "description": r[1], "category": r[2], "unit": r[3]} for r in rows]


@router.get("/equipment-history/{equipment_tag}")
def get_equipment_history(equipment_tag: str, exclude_id: str | None = None, limit: int = 10, db: Session = Depends(get_db)):
    """Get previous WRs for the same equipment — supervisor reviews history before approving."""
    history = work_request_service.get_equipment_history(db, equipment_tag, exclude_id, limit)
    return {"equipment_tag": equipment_tag, "count": len(history), "history": history}


@router.get("/")
def list_work_requests(status: str | None = None, plant_id: str | None = None, limit: int = 200, offset: int = 0, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel
    items = work_request_service.list_work_requests(db, status, plant_id=plant_id, limit=limit, offset=offset)
    # Batch-load photos from linked captures
    capture_ids = [wr.source_capture_id for wr in items if wr.source_capture_id]
    captures_map = {}
    if capture_ids:
        captures = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id.in_(capture_ids)).all()
        captures_map = {c.capture_id: c.images or [] for c in captures}

    # Build user lookup for resolving created_by UUIDs to names
    from api.database.models import UserModel
    all_users = {u.user_id: u.full_name or u.username for u in db.query(UserModel.user_id, UserModel.full_name, UserModel.username).all()}

    # Resolve equipment names from hierarchy
    from api.database.models import HierarchyNodeModel
    equip_tags = list(set(wr.equipment_tag for wr in items if wr.equipment_tag))
    equipment_names = {}
    if equip_tags:
        nodes = db.query(HierarchyNodeModel.tag, HierarchyNodeModel.name).filter(
            HierarchyNodeModel.tag.in_(equip_tags), HierarchyNodeModel.node_type == "EQUIPMENT"
        ).all()
        equipment_names = {n[0]: n[1] for n in nodes}

    # Batch-load WO numbers for WRs that have linked WOs
    from api.database.models import ManagedWorkOrderModel
    wr_ids = [wr.request_id for wr in items]
    wo_map = {}
    if wr_ids:
        wos = db.query(ManagedWorkOrderModel.work_request_id, ManagedWorkOrderModel.wo_number).filter(
            ManagedWorkOrderModel.work_request_id.in_(wr_ids)
        ).all()
        wo_map = {w[0]: w[1] for w in wos if w[0]}

    import json as _json
    results = []
    for wr in items:
        ai = _json.loads(wr.ai_classification) if isinstance(wr.ai_classification, str) else (wr.ai_classification or {})
        photos = captures_map.get(wr.source_capture_id, [])
        # Fallback: extract photos from documents if no capture photos
        if not photos and wr.documents:
            docs = wr.documents if isinstance(wr.documents, list) else []
            photos = [d.get("data", "") for d in docs if isinstance(d, dict) and d.get("type") == "photo" and d.get("data")]
        results.append({
            "request_id": wr.request_id,
            "aviso_number": getattr(wr, "aviso_number", None),
            "wo_number": wo_map.get(wr.request_id, ""),
            "status": wr.status,
            "equipment_tag": wr.equipment_tag,
            "equipment_name": ai.get("wo_title") or ai.get("equipment_name") or equipment_names.get(wr.equipment_tag, wr.equipment_tag),
            "equipment_confidence": wr.equipment_confidence,
            "plant_id": ai.get("plant_id", ""),
            "priority": wr.priority_code or ai.get("priority_suggested") or ai.get("priority", "P3"),
            "priority_code": wr.priority_code,
            "work_class": wr.work_class,
            "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
            "clase_ot": ai.get("clase_ot", ""),
            "activity_class": ai.get("activity_class", ""),
            "failure_description": (wr.problem_description or {}).get("original_text", "")[:200] if isinstance(wr.problem_description, dict) else "",
            "production_impact": ai.get("production_impact", ""),
            "estimated_duration": ai.get("estimated_duration_hours", 0),
            "problem_description": wr.problem_description,
            "ai_classification": wr.ai_classification,
            "spare_parts": wr.spare_parts,
            "photos": photos,
            "technician_name": ai.get("technician_name", ""),
            "created_by": all_users.get(wr.created_by, wr.created_by) if wr.created_by else "",
            "assigned_to": (wr.validation or {}).get("assigned_to", ""),
            "assigned_to_name": (wr.validation or {}).get("assigned_to_name", ""),
            "approval_comment": wr.approval_comment,
            "rejection_reason": wr.rejection_reason,
            "approver_id": wr.approver_id,
            "approved_at": wr.approved_at.isoformat() if wr.approved_at else None,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            # SAP Aviso fields
            "notification_type": getattr(wr, "notification_type", "A1") or "A1",
            "reported_by": getattr(wr, "reported_by", None),
            "circumstances": getattr(wr, "circumstances", None),
            "support_equipment": getattr(wr, "support_equipment", None),
            "technical_location": ai.get("technical_location", ""),
        })
    return results


@router.get("/tools/deleted")
def list_deleted_before_catch_all(plant_id: str = None, db: Session = Depends(get_db)):
    """List soft-deleted work requests."""
    items = work_request_service.list_deleted_work_requests(db, plant_id)
    import json as _j
    results = []
    for wr in items:
        ai = _j.loads(wr.ai_classification) if isinstance(wr.ai_classification, str) else (wr.ai_classification or {})
        pd = _j.loads(wr.problem_description) if isinstance(wr.problem_description, str) else (wr.problem_description or {})
        results.append({
            "request_id": wr.request_id, "equipment_tag": wr.equipment_tag, "status": wr.status,
            "deleted_at": wr.deleted_at.isoformat() if wr.deleted_at else None,
            "deleted_by": wr.deleted_by, "created_at": wr.created_at.isoformat() if wr.created_at else None,
            "priority_code": wr.priority_code, "work_class": wr.work_class or "",
            "equipment_name": ai.get("wo_title") or ai.get("equipment_name") or wr.equipment_tag,
            "failure_description": pd.get("original_text", "")[:120] if isinstance(pd, dict) else "",
            "created_by": wr.created_by or "", "plant_id": ai.get("plant_id", ""),
            "failure_category": pd.get("failure_mode_detected", ""), "failure_symptom": pd.get("failure_symptom", ""),
            "delete_reason": wr.rejection_reason or "",
        })
    return results


@router.get("/tools/ai-summary")
def ai_summary_before_catch_all(days: int = 7, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return ai_weekly_summary(days=days, db=db, user=user)


@router.get("/tools/ai-predict-failures")
def ai_predict_before_catch_all(equipment_tag: str = "", db: Session = Depends(get_db), user=Depends(get_current_user)):
    return ai_predict_failures(equipment_tag=equipment_tag, db=db, user=user)


@router.get("/{request_id}/impact-score")
def get_wr_impact_score(request_id: str, db: Session = Depends(get_db)):
    """Multi-criteria impact score for a Work Request (replaces the hardcoded
    HIGH/MEDIUM lookup). Same 6 factors as the OT impact-score endpoint."""
    from api.services.agentic_smart_backlog_service import score_work_request
    result = score_work_request(db, request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.get("/{request_id}")
def get_work_request(request_id: str, db: Session = Depends(get_db)):
    from api.database.models import FieldCaptureModel
    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    # Resolve created_by UUID to name
    from api.database.models import UserModel
    _created_name = wr.created_by or ""
    if _created_name and len(_created_name) > 30:  # looks like UUID
        _user = db.query(UserModel).filter(UserModel.user_id == _created_name).first()
        if _user:
            _created_name = _user.full_name or _user.username

    photos = []
    if wr.source_capture_id:
        cap = db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == wr.source_capture_id).first()
        if cap and cap.images:
            photos = cap.images
    # Fallback: photos from documents
    if not photos and wr.documents:
        docs = wr.documents if isinstance(wr.documents, list) else []
        photos = [d.get("data", "") for d in docs if isinstance(d, dict) and d.get("type") == "photo" and d.get("data")]
    import json as _json
    ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else (_json.loads(wr.ai_classification) if isinstance(wr.ai_classification, str) else {})
    pd = wr.problem_description if isinstance(wr.problem_description, dict) else (_json.loads(wr.problem_description) if isinstance(wr.problem_description, str) else {})
    return {
        "request_id": wr.request_id,
        "aviso_number": getattr(wr, "aviso_number", None),
        "source_capture_id": wr.source_capture_id,
        "status": wr.status,
        "equipment_id": wr.equipment_id,
        "equipment_tag": wr.equipment_tag,
        "equipment_name": ai.get("wo_title") or ai.get("equipment_name") or wr.equipment_tag or "",
        "equipment_confidence": wr.equipment_confidence,
        "plant_id": ai.get("plant_id", ""),
        "priority": ai.get("priority_suggested") or ai.get("priority", "P3"),
        "clase_ot": ai.get("clase_ot", ""),
        "activity_class": ai.get("activity_class", ""),
        "technician_name": ai.get("technician_name", ""),
        "technician_id": ai.get("technician_id", ""),
        "plant_condition": ai.get("plant_condition", ""),
        "technical_location": ai.get("technical_location", ""),
        "technical_location_code": ai.get("technical_location_code", ""),
        "estimated_duration": ai.get("estimated_duration_hours", 0),
        "description": pd.get("original_text", ""),
        "suggested_action": pd.get("suggested_action", ""),
        "resources": pd.get("resources", []),
        "materials": pd.get("materials", []),
        "special_equipment": pd.get("special_equipment", ""),
        "failure_catalog": pd.get("failure_catalog"),
        "problem_description": wr.problem_description,
        "ai_classification": wr.ai_classification,
        "spare_parts": wr.spare_parts,
        "image_analysis": wr.image_analysis,
        "validation": wr.validation,
        "assigned_to": (wr.validation or {}).get("assigned_to", ""),
        "assigned_to_name": (wr.validation or {}).get("assigned_to_name", ""),
        "assigned_to_specialty": (wr.validation or {}).get("assigned_to_specialty", ""),
        "assigned_workers": (wr.validation or {}).get("assigned_workers", []),
        "assigned_at": (wr.validation or {}).get("assigned_at", ""),
        "photos": photos,
        "priority_code": wr.priority_code,
        "work_class": wr.work_class,
        "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
        "approval_comment": wr.approval_comment,
        "rejection_reason": wr.rejection_reason,
        "approver_id": wr.approver_id,
        "approved_at": wr.approved_at.isoformat() if wr.approved_at else None,
        "created_by": _created_name,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
        # SAP Aviso fields
        "notification_type": getattr(wr, "notification_type", "A1") or "A1",
        "reported_by": getattr(wr, "reported_by", None),
        "reported_at": getattr(wr, "reported_at", None),
        "circumstances": getattr(wr, "circumstances", None),
        "support_equipment": getattr(wr, "support_equipment", None),
        "documents": getattr(wr, "documents", None),
    }


@router.put("/{request_id}/validate")
def validate_work_request(request_id: str, data: WRValidateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if data.action not in ("APPROVE", "REJECT", "MODIFY"):
        raise HTTPException(status_code=400, detail="action must be APPROVE, REJECT, or MODIFY")
    result = work_request_service.validate_work_request(db, request_id, data.action, data.modifications, user_id=getattr(user, "username", "system"))
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.put("/{request_id}/approve")
def approve_work_request(request_id: str, data: WRApproveRequest, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    """Supervisor approves a WR with mandatory comment (Jorge Work Management)."""
    result = work_request_service.approve_work_request(
        db, request_id, approver_id=getattr(user, "user_id", ""), comment=data.comment,
        priority_override=data.priority_override,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    from api.services.ws_manager import queue_notify
    queue_notify("wr_approved", {"request_id": request_id}, result.get("ai_classification", {}).get("plant_id"))
    return result


class WRConvertPM03Request(BaseModel):
    model_config = {"extra": "ignore"}
    comment: str | None = "Express conversion P1/P2 → PM03"
    estimated_hours: float | None = None
    operations: list | None = None  # [{op_number, description, specialty, planned_hours, quantity}]
    materials: list | None = None   # [{code, description, quantity, unit, reservation_code?}]
    workers_required: list | None = None  # [{specialty, count}]


@router.post("/{request_id}/convert-to-pm03")
def convert_wr_to_pm03(
    request_id: str,
    data: WRConvertPM03Request,
    user=Depends(require_role("admin", "manager", "planner", "supervisor")),
    db: Session = Depends(get_db),
):
    """SF-569 — Conversión rápida Aviso aprobado → OT PM03 con carga express.

    Hace en un solo paso:
      1. Si el WR no está aprobado, lo aprueba con comentario express.
      2. Crea la OT PM03 directamente en PROGRAMADO (fast-track P1/P2).
      3. Sobreescribe ops/HH/materials con lo que envía el supervisor.

    Aplica regla SF-570: si el WR no es P1/P2, fuerza priority_code=P2 para
    asegurar que se cree como PM03 (la decisión de tratar como falla es del
    supervisor que invoca este endpoint).
    """
    from api.database.models import WorkRequestModel
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    # 1. Asegurar aprobación
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED", "APROBADO"):
        work_request_service.approve_work_request(
            db, request_id,
            approver_id=getattr(user, "user_id", ""),
            comment=(data.comment or "Express conversion P1/P2 → PM03"),
            priority_override="P2" if wr.priority_code not in ("P1", "P2") else None,
        )
        db.refresh(wr)
    # 2. Forzar P1/P2 si no lo es (requisito de PM03)
    if wr.priority_code not in ("P1", "P2"):
        wr.priority_code = "P2"
        db.commit()
        db.refresh(wr)
    # 3. Crear OT
    from api.services import managed_wo_service
    wr_plant = (wr.ai_classification or {}).get("plant_id") if isinstance(wr.ai_classification, dict) else None
    result = managed_wo_service.create_from_work_request(
        db, request_id, planned_by=getattr(user, "user_id", ""), plant_id=wr_plant,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create PM03 from WR")
    # 4. Express overrides (ops, materials, HH, workers)
    overrides = {}
    if data.estimated_hours and data.estimated_hours > 0:
        overrides["estimated_hours"] = float(data.estimated_hours)
    if data.operations:
        # Normalizar mínimos
        ops = []
        for i, o in enumerate(data.operations, start=1):
            if not isinstance(o, dict): continue
            ops.append({
                "op_number": int(o.get("op_number", i)),
                "description": (o.get("description") or "Intervención")[:200],
                "op_type": o.get("op_type", "INT"),
                "specialty": o.get("specialty", "Mecánico"),
                "quantity": int(o.get("quantity", 1) or 1),
                "duration": float(o.get("planned_hours", o.get("duration", 1.0)) or 1.0),
                "estimated_hours": float(o.get("planned_hours", o.get("duration", 1.0)) or 1.0),
                "planned_hours": float(o.get("planned_hours", o.get("duration", 1.0)) or 1.0),
                "actual_hours": 0.0,
                "completion_pct": 0.0,
            })
        if ops:
            overrides["operations"] = ops
    if data.materials:
        overrides["materials"] = [
            {
                "code": m.get("code", m.get("sapId", "")),
                "description": m.get("description", ""),
                "quantity": int(m.get("quantity", 1) or 1),
                "unit": m.get("unit", "PZ"),
                "reservation_code": m.get("reservation_code") or None,
            }
            for m in (data.materials or []) if isinstance(m, dict)
        ]
    if overrides:
        managed_wo_service.update_work_order(db, result["wo_id"], overrides)
        # refetch
        from api.services.managed_wo_service import _to_dict as _wo_to_dict
        from api.database.models import ManagedWorkOrderModel
        wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == result["wo_id"]).first()
        result = _wo_to_dict(wo)
    from api.services.audit_service import log_action
    log_action(db, "managed_work_order", result["wo_id"], "EXPRESS_PM03_CONVERSION",
               payload={"work_request_id": request_id, "user": getattr(user, "user_id", "")})
    return result


@router.put("/{request_id}/reject")
def reject_work_request(request_id: str, data: WRRejectRequest, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    """Supervisor rejects a WR with mandatory reason (Jorge Work Management)."""
    result = work_request_service.reject_work_request(
        db, request_id, approver_id=getattr(user, "user_id", ""), reason=data.reason,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    from api.services.ws_manager import queue_notify
    queue_notify("wr_rejected", {"request_id": request_id}, result.get("ai_classification", {}).get("plant_id"))
    return result



@router.put("/{request_id}/link-duplicate")
def link_as_duplicate(
    request_id: str,
    data: LinkDuplicateRequest,
    user=Depends(require_role("admin", "manager", "planner", "supervisor")),
    db: Session = Depends(get_db),
):
    """Vincula este WR como duplicado de otro y lo cancela. Agrega evidencia
    al WR original con referencia al duplicado.
    """
    from api.database.models import WorkRequestModel
    new_wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not new_wr:
        raise HTTPException(status_code=404, detail="WR not found")
    original = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == data.duplicate_of_request_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Original WR not found")
    if original.status in ("CERRADO", "CANCELADO", "RECHAZADO"):
        raise HTTPException(status_code=409, detail="Original WR ya está en estado terminal")

    # Cancelar el duplicado
    orig_av = getattr(original, "aviso_number", None)
    orig_label = f"AV-{str(orig_av).zfill(5)}" if orig_av else (original.request_id or "")[:8]
    new_wr.status = "CANCELADO"
    new_wr.cancellation_reason = f"Duplicado de {orig_label}. {data.note or ''}".strip()

    # Agregar nota al original (en circumstances o validation log)
    note_text = (data.note or "").strip() or "Reportado nuevamente por otro usuario."
    new_av = getattr(new_wr, "aviso_number", None)
    new_label = f"AV-{str(new_av).zfill(5)}" if new_av else (new_wr.request_id or "")[:8]
    from datetime import datetime as _dt
    addendum = f"\n[{_dt.now().isoformat()}] Reporte duplicado vinculado: {new_label} — {note_text}"
    original.circumstances = ((original.circumstances or "") + addendum)[:2000]

    from api.services.audit_service import log_action
    log_action(db, "work_request", request_id, "LINKED_AS_DUPLICATE",
               payload={"duplicate_of": data.duplicate_of_request_id, "user": getattr(user, "user_id", "")})
    db.commit()
    return {
        "request_id": request_id,
        "status": new_wr.status,
        "duplicate_of": data.duplicate_of_request_id,
        "duplicate_of_label": orig_label,
    }


@router.put("/{request_id}/cancel")
def cancel_work_request(
    request_id: str,
    data: dict | None = None,
    db: Session = Depends(get_db),
    # Jorge SF-542: supervisor también puede cancelar avisos.
    user=Depends(require_role("admin", "manager", "planner", "supervisor")),
):
    """Cancel a WR con motivo. SAP-style (Jorge 2026-04-23):
    - El aviso NO se elimina — queda CERRADO con cancellation_reason.
    - Se exige un motivo (body: {reason: str}).
    - No se puede cancelar un WR ya CERRADO."""
    from api.database.models import WorkRequestModel
    from datetime import datetime
    reason = ""
    if isinstance(data, dict):
        reason = (data.get("reason") or data.get("cancellation_reason") or "").strip()
    if not reason:
        raise HTTPException(status_code=400, detail="Motivo de cancelación es obligatorio")
    wr_model = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr_model:
        raise HTTPException(status_code=404, detail="Work request not found")
    # IDOR fix Jorge 2026-04-23: verificar plant del usuario vs aviso
    role = getattr(user, 'role', '') or ''
    user_plant = getattr(user, 'plant_id', None)
    if role not in ('admin', 'ceo') and user_plant and wr_model.plant_id and wr_model.plant_id != user_plant:
        raise HTTPException(status_code=403, detail="Acceso denegado — aviso de otra planta")
    if wr_model.status in ("CERRADO", "CLOSED", "COMPLETED"):
        raise HTTPException(status_code=400, detail="El aviso ya está cerrado")
    # SAP: el cancel pasa a estado final CERRADO (no CANCELADO).
    wr_model.status = "CERRADO"
    wr_model.cancellation_reason = reason[:500]
    wr_model.updated_at = datetime.now()
    db.commit()
    # Jorge 2026-04-27: broadcast para refrescar Identification al toque
    try:
        from api.services.ws_manager import queue_notify
        queue_notify("wr_cancelled", {"request_id": request_id}, wr_model.plant_id)
    except Exception:
        pass
    return {"status": "CERRADO", "request_id": request_id, "cancellation_reason": reason}

@router.put("/{request_id}/assign")
def assign_work_request(request_id: str, data: WRAssignRequest, user=Depends(require_role("admin", "manager", "planner")), db: Session = Depends(get_db)):
    """Assign a validated WR to one or more technicians."""
    from datetime import datetime
    from api.database.models import WorkforceModel
    from sqlalchemy.orm.attributes import flag_modified
    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED", "PENDIENTE", "APROBADO"):
        raise HTTPException(status_code=400, detail=f"Cannot assign WR in status {wr.status}")
    if not data.workers:
        raise HTTPException(status_code=400, detail="At least one worker is required")
    # Validate all workers exist and build the list
    assigned_workers = []
    for w in data.workers:
        worker = db.query(WorkforceModel).filter(WorkforceModel.worker_id == w.worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail=f"Technician {w.worker_id} not found")
        assigned_workers.append({
            "worker_id": worker.worker_id,
            "name": worker.name,
            "specialty": worker.specialty or "",
        })
    # Store in validation JSON (copy dict so SQLAlchemy detects change)
    validation = dict(wr.validation) if isinstance(wr.validation, dict) else {}
    validation["assigned_workers"] = assigned_workers
    validation["assigned_at"] = datetime.now().isoformat()
    # Keep backward compat with single-assign fields (first worker)
    validation["assigned_to"] = assigned_workers[0]["worker_id"]
    validation["assigned_to_name"] = assigned_workers[0]["name"]
    validation["assigned_to_specialty"] = assigned_workers[0]["specialty"]
    wr.validation = validation
    wr.status = "ASSIGNED"
    flag_modified(wr, "validation")
    from api.services.audit_service import log_action
    log_action(db, "work_request", request_id, "ASSIGN")
    db.commit()
    db.refresh(wr)
    names = ", ".join(w["name"] for w in assigned_workers)
    return {"ok": True, "status": wr.status, "assigned_workers": assigned_workers, "assigned_to": names}


class WRCompleteRequest(BaseModel):
    completion_notes: str = ""
    actual_hours: float = 0


class WRCloseRequest(BaseModel):
    closure_notes: str = ""


@router.put("/{request_id}/start")
def start_work_request(request_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Transition WR to IN_PROGRESS."""
    result = work_request_service.start_work_request(db, request_id, user_id=getattr(user, "user_id", ""))
    if not result:
        raise HTTPException(status_code=400, detail="Cannot start — WR not found or invalid status")
    return result


@router.put("/{request_id}/complete")
def complete_work_request(request_id: str, data: WRCompleteRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Transition WR to COMPLETED."""
    result = work_request_service.complete_work_request(
        db, request_id, user_id=getattr(user, "user_id", ""),
        completion_notes=data.completion_notes, actual_hours=data.actual_hours,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Cannot complete — WR not found or not IN_PROGRESS")
    return result


@router.put("/{request_id}/close")
def close_work_request(request_id: str, data: WRCloseRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Technical closure of WR."""
    result = work_request_service.close_work_request(
        db, request_id, user_id=getattr(user, "user_id", ""), closure_notes=data.closure_notes,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Cannot close — WR not found or invalid status")
    return result



@router.put("/{request_id}/reopen")
def reopen_work_request(
    request_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin", "manager")),
):
    """Reopen a cancelled/rejected/closed WR back to PENDING_VALIDATION."""
    from api.database.models import WorkRequestModel
    from datetime import datetime
    wr_model = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr_model:
        raise HTTPException(status_code=404, detail="Work request not found")
    if wr_model.status not in ("CANCELADO", "CANCELLED", "REJECTED", "RECHAZADO", "CERRADO", "CLOSED", "COMPLETED"):
        raise HTTPException(status_code=400, detail=f"Cannot reopen WR in status {wr_model.status}")
    wr_model.status = "PENDING_VALIDATION"
    wr_model.updated_at = datetime.now()
    db.commit()
    return {"status": "PENDING_VALIDATION", "request_id": request_id}

class WRUpdateRequest(BaseModel):
    """Generic update for WR fields (supervisor)."""
    # Jorge 2026-04-27: aceptar field names del frontend Y alias legacy.
    model_config = {"extra": "ignore"}
    priority: str | None = None
    priority_requested: str | None = None  # alias frontend
    description: str | None = None
    failure_description: str | None = None  # alias frontend
    suggested_action: str | None = None
    wo_title: str | None = None             # se persiste en ai_classification
    failure_object_part: str | None = None
    failure_category: str | None = None
    failure_symptom: str | None = None
    failure_cause: str | None = None
    estimated_duration: float | None = None
    production_impact: str | None = None


@router.put("/{request_id}")
def update_work_request(request_id: str, data: WRUpdateRequest, db: Session = Depends(get_db)):
    """Generic update endpoint for WR fields."""
    from datetime import datetime
    from sqlalchemy.orm.attributes import flag_modified
    from api.services.audit_service import log_action

    wr = work_request_service.get_work_request(db, request_id)
    if not wr:
        raise HTTPException(status_code=404, detail="Work request not found")

    # Aliases del frontend → fields canónicos
    priority_in = data.priority or data.priority_requested
    description_in = data.description if data.description is not None else data.failure_description
    if priority_in:
        wr.priority_code = priority_in
    if description_in is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["original_text"] = description_in
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.wo_title is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["wo_title"] = data.wo_title
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")
    if data.failure_object_part is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        cat = dict(pd.get("failure_catalog") or {})
        cat["object_part"] = data.failure_object_part
        pd["failure_catalog"] = cat
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.suggested_action is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["suggested_action"] = data.suggested_action
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.failure_category is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["failure_category"] = data.failure_category
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")
    if data.failure_symptom is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["failure_symptom"] = data.failure_symptom
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.failure_cause is not None:
        pd = dict(wr.problem_description) if isinstance(wr.problem_description, dict) else {}
        pd["failure_cause"] = data.failure_cause
        wr.problem_description = pd
        flag_modified(wr, "problem_description")
    if data.estimated_duration is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["estimated_duration_hours"] = data.estimated_duration
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")
    if data.production_impact is not None:
        ai = dict(wr.ai_classification) if isinstance(wr.ai_classification, dict) else {}
        ai["production_impact"] = data.production_impact
        wr.ai_classification = ai
        flag_modified(wr, "ai_classification")

    wr.updated_at = datetime.now()
    log_action(db, "work_request", request_id, "UPDATE")
    db.commit()
    db.refresh(wr)
    try:
        from api.services.ws_manager import queue_notify
        plant_id = (wr.ai_classification or {}).get("plant_id") if isinstance(wr.ai_classification, dict) else None
        queue_notify("wr_updated", {"request_id": request_id}, plant_id)
    except Exception:
        pass
    return work_request_service._to_dict(wr)


class DeleteWRRequest(BaseModel):
    reason: str = ""

@router.delete("/{request_id}")
def delete_work_request(request_id: str, data: DeleteWRRequest = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Jorge 2026-04-23 — SAP-style: los avisos NUNCA se eliminan, se cancelan con motivo.
    raise HTTPException(
        status_code=410,
        detail="Los avisos no se eliminan. Use PUT /work-requests/{id}/cancel con motivo obligatorio.",
    )


@router.get("/tools/deleted")
def list_deleted(plant_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """List soft-deleted work requests (admin only)."""
    if getattr(user, 'role', '') not in ('admin', 'manager', 'ceo'):
        raise HTTPException(status_code=403, detail="Solo administradores")
    items = work_request_service.list_deleted_work_requests(db, plant_id)
    return [{"request_id": wr.request_id, "equipment_tag": wr.equipment_tag, "status": wr.status,
             "deleted_at": wr.deleted_at.isoformat() if wr.deleted_at else None,
             "deleted_by": wr.deleted_by, "created_at": wr.created_at.isoformat() if wr.created_at else None,
             "priority_code": wr.priority_code,
             "equipment_name": ((__import__('json').loads(wr.ai_classification) if isinstance(wr.ai_classification, str) else (wr.ai_classification or {})).get('wo_title') or wr.equipment_tag)} for wr in items]


@router.post("/tools/restore/{request_id}")
def restore_work_request(request_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Restore a soft-deleted work request (admin only)."""
    if getattr(user, 'role', '') not in ('admin', 'manager', 'ceo'):
        raise HTTPException(status_code=403, detail="Solo administradores")
    ok = work_request_service.restore_work_request(db, request_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found or not deleted")
    return {"ok": True, "request_id": request_id}


@router.delete("/tools/permanent/{request_id}")
def permanent_delete(request_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Jorge 2026-04-23 — SAP no permite borrado físico; solo CERRADO con motivo.
    raise HTTPException(
        status_code=410,
        detail="Borrado permanente deshabilitado. SAP-style: cancelar con motivo → CERRADO.",
    )


@router.post("/{request_id}/classify")
def classify_work_request(request_id: str, db: Session = Depends(get_db)):
    result = work_request_service.classify_work_request(db, request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work request not found")
    return result


@router.post("/check-duplicates")
def check_duplicates(data: DuplicateCheckRequest, db: Session = Depends(get_db)):
    """Find potential duplicate work requests for the same equipment with open status (last 30 days)."""
    from datetime import datetime, timedelta
    open_statuses = ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "IN_PROGRESS", "PENDIENTE", "APROBADO"]
    cutoff = datetime.now() - timedelta(days=30)
    all_wrs = work_request_service.list_work_requests(db, status=None, limit=500, offset=0)
    duplicates = []
    desc_lower = (data.problem_description or "").lower()
    # Extract potential equipment tags from description text
    desc_words = set(desc_lower.replace(",", " ").replace(".", " ").split())
    for wr in all_wrs:
        # Match by equipment_tag if provided, OR by tag mentioned in description
        tag_match = False
        if data.equipment_tag and wr.equipment_tag == data.equipment_tag:
            tag_match = True
        elif not data.equipment_tag and wr.equipment_tag:
            # Check if any WR's equipment_tag appears in the description text
            if wr.equipment_tag.lower() in desc_lower:
                tag_match = True
            # Also check individual words match the tag
            for w in desc_words:
                if len(w) > 3 and w in wr.equipment_tag.lower():
                    tag_match = True
                    break
        if not tag_match:
            continue
        if wr.status not in open_statuses:
            continue
        if wr.created_at and wr.created_at < cutoff:
            continue
        # Basic text similarity check
        wr_desc = ""
        pd = getattr(wr, "problem_description", None)
        if isinstance(pd, dict):
            wr_desc = (pd.get("original_text", "") or "").lower()
        elif isinstance(pd, str):
            wr_desc = pd.lower()
        # Count shared words (basic similarity)
        if desc_lower and wr_desc:
            words_a = set(desc_lower.split())
            words_b = set(wr_desc.split())
            overlap = len(words_a & words_b)
            similarity = overlap / max(len(words_a | words_b), 1)
        else:
            similarity = 0.5  # same equipment = potential duplicate even without text
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        pd_dict = pd if isinstance(pd, dict) else {}
        duplicates.append({
            "request_id": wr.request_id,
            "status": wr.status,
            "equipment_tag": wr.equipment_tag,
            "equipment_name": ai.get("equipment_name", wr.equipment_tag),
            "priority": wr.priority_code or ai.get("priority_suggested", ""),
            "priority_code": wr.priority_code or "",
            "description": wr_desc[:300] if wr_desc else "",
            "failure_description": wr_desc[:300] if wr_desc else "",
            "problem_description": pd if isinstance(pd, dict) else {"original_text": wr_desc},
            "suggested_action": pd_dict.get("suggested_action", "") if isinstance(pd_dict, dict) else "",
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            "similarity": round(similarity, 2),
        })
    duplicates.sort(key=lambda d: d["similarity"], reverse=True)
    return {"equipment_tag": data.equipment_tag, "duplicate_count": len(duplicates), "duplicates": duplicates}


@router.post("/ai-assist-image")
def ai_assist_image(data: ImageAssistRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Analyze equipment photo with Claude Vision to auto-fill aviso form."""
    imgs = data.images if data.images else ([data.image] if data.image else [])
    if not imgs:
        raise HTTPException(status_code=400, detail="No image provided")
    result = vision_service.analyze_images(
        images_base64=imgs,
        equipment_tag=data.equipment_tag,
        additional_context=data.additional_context,
        db=db,
    )
    if "error" in result and not result.get("suggestions"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.post("/ai-assist")
def ai_assist(data: AIAssistRequest, db: Session = Depends(get_db)):
    """AI assistance to fill aviso fields — uses Claude with historical context."""
    import os
    desc = (data.description or "").strip()
    if not desc:
        return {"suggestions": {}, "confidence": 0}

    # Try Claude-powered assist first
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            return _claude_ai_assist(data, db, api_key)
        except Exception as e:
            import logging
            logging.getLogger("ocp_maintenance").warning(f"Claude AI assist failed, using fallback: {e}")

    # Fallback: rule-based
    return _rule_based_assist(data, db)


def _claude_ai_assist(data, db, api_key):
    """Claude-powered AI assist with historical context."""
    import anthropic

    desc = data.description or ""
    equipment_tag = data.equipment_tag or ""

    # Build context
    context_str = ""
    examples_str = ""
    if equipment_tag:
        ctx = ctx_builder.build_equipment_context(db, equipment_tag)
        context_str = ctx_builder.format_context_for_prompt(ctx)
        examples_str = ctx_builder.get_validated_examples(db, equipment_tag, limit=5)

    system_prompt = """You are an industrial maintenance expert for OCP plants (phosphates, Morocco).
Analyze the description and return complete JSON for a SAP PM notification.
IMPORTANT: Respond ONLY with valid JSON, no markdown.
IMPORTANT: Detect the language of the user description. If the description is in Spanish, write ALL text fields (enhanced_description, suggestedAction, workConditions, etc.) in Spanish. If in English, respond in English. Match the user language.

{
  "equipment_tag": "Equipment TAG identified from the description (e.g. PP-CR-001). null if not identifiable",
  "enhanced_description": "Technical description (keep the user's ORIGINAL text as-is, only add equipment name and location if missing)",
  "main_action": "The single main corrective action extracted from the description (e.g. 'Reemplazar placas de acero mandibulas', 'Replace main bearing'). This becomes the WO title - max 70 chars, verb + object format",
  "failureCategory": "MECHANICAL | ELECTRICAL | INSTRUMENTATION | HYDRAULIC | STRUCTURAL",
  "priority": "P1 | P2 | P3 | P4",
  "activityClass": "M001 | M002 | M003",
  "suggestedAction": "Detailed corrective action step by step",
  "failureSymptom": "Symptom from CATALOG (EXACT value)",
  "failureCause": "Cause from CATALOG (EXACT value)",
  "failureObjectPart": "Object part from CATALOG (EXACT value)",
  "estimatedDuration": "hours (numeric string)",
  "plantCondition": "running | stopped | reduced",
  "productionImpact": "CRITICAL | HIGH | MEDIUM | LOW",
  "resources": [
    {"type": "Mechanical", "quantity": 2, "hours": 6},
    {"type": "Electrical", "quantity": 1, "hours": 2},
    {"type": "Rigger", "quantity": 1, "hours": 3},
    {"type": "Helper", "quantity": 1, "hours": 6}
  ],
  "materials": [
    {"sapId": "10001001", "description": "Rodamiento principal", "quantity": 2, "unit": "UD"},
    {"sapId": "10002001", "description": "Kit sellos mecanicos", "quantity": 1, "unit": "UD"},
    {"sapId": "10004010", "description": "Aceite lubricante ISO VG 46", "quantity": 5, "unit": "LT"},
    {"sapId": "10005015", "description": "Pernos fijacion M12x40", "quantity": 12, "unit": "UD"},
    {"sapId": "10002050", "description": "Empaquetadura/junta", "quantity": 2, "unit": "UD"}
  ],
  "supportEquipment": ["Mobile crane", "Hoist", "Scaffolding"],
  "workConditions": "LOTO, clear area, permits, PPE"
}

CRITICAL RESOURCE RULES (YOU MUST FOLLOW THESE — the example above is the MINIMUM):
- resources array MUST have 3-4 entries ALWAYS. One resource type is NEVER enough.
- For ANY mechanical job: Mechanical (2 people, 6-8h) + Electrical (1 person, 2h) + Helper (1-2 people, 4-6h)
- For heavy equipment (pumps, compressors, crushers): ADD Rigger (1 person, 2-4h)
- materials array MUST have 5+ entries for mechanical, 3+ for electrical
- estimatedDuration = hours of the longest resource (critical path), minimum 6h for P1/P2
- NEVER include Supervisor as resource

SAP CODES: 10001XXX=Bearings, 10002XXX=Seals, 10003XXX=Filters, 10004XXX=Lubricants,
10005XXX=Fasteners, 10006XXX=Transmission, 10007XXX=Electrical, 10008XXX=Instrumentation
SUPPORT EQUIPMENT: Mobile crane, Hoist, Forklift, Scaffolding, Compressor, Welder, Pressure washer
CONDITIONS: LOTO, clear area, permits, PPE

FAILURE CATALOG (MANDATORY - use EXACTLY these values, NO free text):

MECHANICAL:
  parts: BEARINGS, MECHANICAL SEALS, COUPLINGS, SHAFTS, GEARS, BELTS, PUMPS, VALVES, FILTERS, IMPELLER, REDUCER/GEARBOX, PISTON/CYLINDER, LINER/WEAR PLATE, CRUSHER JAW, CONVEYOR IDLER, SCREEN PANEL, CYCLONE, COMPRESSOR, HEAT EXCHANGER
  symptoms: HIGH VIBRATION, HIGH TEMPERATURE, ABNORMAL NOISE, SEIZED, NO FLOW, LEAKAGE, VISIBLE WEAR, OIL LEAK, BLOCKAGE, CAVITATION, LOW PRESSURE, EXCESSIVE PLAY, MISALIGNMENT DETECTED, ABNORMAL OIL ANALYSIS
  causes: WEAR, LACK OF LUBRICATION, CORROSION, MISALIGNMENT, BLOCKED, OVERLOAD, FATIGUE, INCORRECT ASSEMBLY, CAVITATION, CONTAMINATION, THERMAL STRESS, ABRASION, EROSION

ELECTRICAL:
  parts: ELECTRIC MOTOR, CABLES / CONDUCTORS, PROTECTIONS, ELECTRICAL PANEL, VARIABLE FREQUENCY DRIVE, CONTACTOR, TRANSFORMER, SWITCHGEAR, CIRCUIT BREAKER, RELAY, GENERATOR, SOFT STARTER
  symptoms: WONT START, OVERHEATING, SHORT CIRCUIT, PROTECTION TRIP, LOW INSULATION, INTERMITTENT OPERATION, EXCESSIVE CONSUMPTION, ARC FLASH, VOLTAGE DROP, GROUND FAULT
  causes: INSULATION LOSS, WEAR, LOOSE CONNECTION, ELECTRICAL OVERLOAD, MOISTURE, EXCESSIVE HEATING, ELECTRICAL SURGE, AGING

INSTRUMENTATION:
  parts: SENSOR / TRANSDUCER, TRANSMITTER, CONTROL VALVE, PLC / DCS, ACTUATOR, POSITIONER, FLOW METER, LEVEL SENSOR, PRESSURE GAUGE, TEMPERATURE PROBE, ANALYZER, SOLENOID VALVE
  symptoms: ERRONEOUS READING, NO SIGNAL, UNSTABLE SIGNAL, NOT RESPONDING, FALSE ALARM, LOST COMMUNICATION, DRIFT, STUCK VALUE
  causes: OUT OF CALIBRATION, CONTAMINATED, PARAMETER LOSS, COMMUNICATION LOSS, OBSTRUCTION, VIBRATION DAMAGE, MEMBRANE DAMAGE

HYDRAULIC:
  parts: HYDRAULIC PUMP, HYDRAULIC CYLINDER, DIRECTIONAL VALVE, PRESSURE RELIEF VALVE, ACCUMULATOR, HYDRAULIC MOTOR, FILTER, HOSE / FITTING
  symptoms: LOW PRESSURE, OVERHEATING, LEAKAGE, SLOW RESPONSE, CAVITATION NOISE, FOAMING, CONTAMINATED OIL
  causes: CONTAMINATION, SEAL WEAR, CAVITATION, OVERHEATING, AIR IN SYSTEM, INCORRECT FLUID, INTERNAL LEAKAGE

STRUCTURAL:
  parts: STEEL STRUCTURE, FOUNDATION, SUPPORT BEAM, PLATFORM / WALKWAY, HOPPER / CHUTE, DUCT / ENCLOSURE, ANCHOR BOLT
  symptoms: CRACK DETECTED, DEFORMATION, CORROSION VISIBLE, BOLT LOOSENING, FOUNDATION SETTLEMENT
  causes: FATIGUE, CORROSION, OVERLOAD, IMPACT, VIBRATION, POOR WELDING

RULE: failureSymptom, failureCause and failureObjectPart MUST be EXACT copies of the values above.
DO NOT invent free text for these fields. Choose the closest catalog value.
ALL THREE fields (failureSymptom, failureCause, failureObjectPart) are MANDATORY — you MUST always fill them.
If unsure, pick the most likely match from the catalog. NEVER leave them empty or null.

P1/P2->M002, P3/P4->M001. ALWAYS include materials with sapId, supportEquipment and workConditions.

RULE equipmentCondition: If priority is P1 or P2, equipmentCondition MUST be "stopped". If LEAKAGE, SEIZED, SHORT CIRCUIT, ARC FLASH, CRACK DETECTED — equipmentCondition MUST be "stopped" regardless of priority.

RULE enhanced_description: PRESERVE the user's original text as much as possible. Do NOT rewrite or rephrase what the user wrote.
- Only add the equipment name and location if the user omitted them
- NEVER include numeric IDs like 000000000189 or 000000000827
- The user's original wording is sacred — do not "improve" or "maquillaje" it

RULE main_action: Extract the SINGLE main corrective action from the user's description.
- Format: verb + object (e.g. "Reemplazar placas de acero mandibulas", "Replace main bearing")
- This becomes the Work Order title — max 70 characters
- Do NOT copy the first step of suggestedAction — identify the principal action from the problem description

RULE suggestedAction: Write numbered steps. Use equipment NAME not numeric TAG. Keep it concise (max 10 steps).

IMPORTANT: Detect the language of the user input and respond in the SAME language.
If user writes in Spanish, respond in Spanish. If in English, respond in English. If in French, respond in French.
Catalog codes (BEARINGS, HIGH VIBRATION, etc.) always stay as-is regardless of language.
The enhanced_description and suggestedAction should match the user's language."""

    # When no equipment_tag provided, give list of known equipment for matching
    if not equipment_tag:
        from api.database.models import HierarchyNodeModel
        equip_nodes = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.node_type == "EQUIPMENT"
        ).limit(200).all()
        if equip_nodes:
            equip_list = ", ".join(
                f"{n.tag or n.code} ({n.name})" for n in equip_nodes if (n.tag or n.code)
            )
            system_prompt += "\n\nKNOWN EQUIPMENT TAGS (match from description if possible):\n" + equip_list

    if context_str:
        system_prompt += "\n\n" + context_str
    if examples_str:
        system_prompt += "\n\n" + examples_str

    # Match user language
    lang_instruction = "IMPORTANT: Detect the language of the user description. Respond in the SAME language. If Spanish, respond in Spanish. If English, respond in English."

    user_msg = f"{lang_instruction}\n\nProblem description: \"{desc}\""
    if equipment_tag:
        user_msg += f"\nEquipment TAG: {equipment_tag}"
        # Lookup functional location and catalog profile
        from api.database.models import HierarchyNodeModel
        node = db.query(HierarchyNodeModel).filter(
            (HierarchyNodeModel.tag == equipment_tag) | (HierarchyNodeModel.code == equipment_tag)
        ).first()
        if node:
            user_msg += f"\nFunctional Location: {node.sap_func_loc or node.code}"
            user_msg += f"\nEquipment Name: {node.name}"
            if node.metadata_json and isinstance(node.metadata_json, dict):
                pg = node.metadata_json.get("planning_group", "")
                if pg: user_msg += f"\nPlanning Group: {pg}"
    if data.plant_condition:
        user_msg += f"\nEquipment condition: {data.plant_condition}"

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=system_prompt,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = response.content[0].text.strip()

    # Parse JSON
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    import json
    suggestions = json.loads(raw)

    # Ensure consistency
    prio = suggestions.get("priority", "P3")
    if prio in ("P1", "P2"):
        suggestions["activityClass"] = "M002"
    elif "activityClass" not in suggestions:
        suggestions["activityClass"] = "M001"

    return {"suggestions": suggestions, "confidence": 0.85, "source": "claude_ai"}



def _calculate_criticality_score(db, equipment_tag: str, priority: str, production_impact: str, failure_category: str) -> dict:
    """Calculate criticality score 1-5 based on multiple factors.
    Returns {score, level, factors, color}."""
    from api.database.models import HierarchyNodeModel, WorkRequestModel
    from sqlalchemy import func

    score = 0
    factors = []

    # Factor 1: Equipment criticality (ABC) — max 2 points
    equip_criticality = None
    if equipment_tag:
        node = db.query(HierarchyNodeModel).filter(
            (HierarchyNodeModel.tag == equipment_tag) |
            (HierarchyNodeModel.sap_equipment_nr == equipment_tag) |
            (HierarchyNodeModel.code == equipment_tag)
        ).first()
        if node:
            equip_criticality = (node.criticality or "").upper()

    if equip_criticality == "A":
        score += 2
        factors.append("Equipment criticality: A (Critical)")
    elif equip_criticality == "B":
        score += 1
        factors.append("Equipment criticality: B (Important)")
    else:
        factors.append("Equipment criticality: C/Unknown (Standard)")

    # Factor 2: Priority — max 1.5 points
    prio_map = {"P1": 1.5, "P2": 1.0, "P3": 0.5, "P4": 0}
    p_score = prio_map.get(priority, 0.5)
    score += p_score
    factors.append(f"Priority: {priority} (+{p_score})")

    # Factor 3: Production impact — max 1.5 points
    impact_map = {"CRITICAL": 1.5, "HIGH": 1.0, "MEDIUM": 0.5, "LOW": 0}
    i_score = impact_map.get((production_impact or "").upper(), 0.5)
    score += i_score
    factors.append(f"Production impact: {production_impact} (+{i_score})")

    # Factor 4: Failure history (recurrence) — max 1 point
    if equipment_tag:
        recent_count = db.query(func.count(WorkRequestModel.request_id)).filter(
            WorkRequestModel.equipment_tag == equipment_tag,
        ).scalar() or 0
        if recent_count >= 5:
            score += 1.0
            factors.append(f"Recurrence: {recent_count} prior WRs on this equipment (+1.0)")
        elif recent_count >= 2:
            score += 0.5
            factors.append(f"Recurrence: {recent_count} prior WRs on this equipment (+0.5)")
        else:
            factors.append(f"Recurrence: {recent_count} prior WRs (no bonus)")

    # Normalize to 1-5 scale (max raw = 6)
    normalized = min(5, max(1, round(score * 5 / 6)))

    # Level and color
    if normalized >= 4:
        level = "CRITICAL"
        color = "red"
    elif normalized >= 3:
        level = "HIGH"
        color = "orange"
    elif normalized >= 2:
        level = "MEDIUM"
        color = "yellow"
    else:
        level = "LOW"
        color = "green"

    return {
        "score": normalized,
        "level": level,
        "color": color,
        "factors": factors,
        "raw_score": round(score, 1),
    }

def _rule_based_assist(data, db):
    """Fallback rule-based AI assist (keyword matching)."""
    desc = (data.description or "").lower()
    suggestions = {}

    # 1. Detect failure category
    if not data.existing_category:
        cat_keywords = {
            "ELECTRICAL": ["electr", "voltaje", "corriente", "cable", "variador", "transformador", "cortocircuito", "fusible"],
            "INSTRUMENTATION": ["instrument", "sensor", "valvula", "transmisor", "plc", "caudalimetro", "presostato", "termocupla", "calibr"],
            "MECHANICAL": ["mecanic", "bomba", "rodamiento", "vibracion", "fuga", "correa", "engranaje", "eje", "sello", "lubricacion", "aceite", "desgaste"],
        }
        detected = "MECHANICAL"
        max_hits = 0
        for cat, kws in cat_keywords.items():
            hits = sum(1 for kw in kws if kw in desc)
            if hits > max_hits:
                max_hits = hits
                detected = cat
        suggestions["failureCategory"] = detected

    # 2. Detect priority
    if not data.existing_priority:
        urgent_kws = ["urgente", "emergencia", "parada", "detenid", "paro", "inmediata", "crítico", "colapso"]
        high_kws = ["importante", "producción afectada", "riesgo", "seguridad"]
        if any(kw in desc for kw in urgent_kws) or data.plant_condition == "stopped":
            suggestions["priority"] = "P1"
        elif any(kw in desc for kw in high_kws):
            suggestions["priority"] = "P2"
        else:
            suggestions["priority"] = "P3"

    # 3. Auto activity class from priority
    prio = suggestions.get("priority", data.existing_priority or "P3")
    suggestions["activityClass"] = "M002" if prio in ("P1", "P2") else "M001"

    # 4. Suggest action
    if not data.existing_action:
        action_map = {
            "bomba": "Reemplazar bomba completa y verificar alineación",
            "rodamiento": "Reemplazar rodamientos y verificar holguras",
            "sello": "Reemplazar sellos mecánicos y verificar estanqueidad",
            "fuga": "Localizar y reparar fuga, reemplazar juntas/sellos",
            "vibración": "Diagnóstico vibracional, reemplazar componente dañado",
            "motor": "Inspección motor eléctrico, verificar aislamiento y conexiones",
            "correa": "Reemplazar correas y verificar tensión/alineación",
            "válvula": "Inspección y calibración de válvula",
            "sensor": "Calibrar/reemplazar sensor y verificar señal",
        }
        for kw, action in action_map.items():
            if kw in desc:
                suggestions["suggestedAction"] = action
                break
        if "suggestedAction" not in suggestions and desc:
            suggestions["suggestedAction"] = "Inspección y intervención correctiva según hallazgos"

    # 5. Suggest duration based on action type
    if prio in ("P1", "P2"):
        suggestions["estimatedDuration"] = "8"
    else:
        suggestions["estimatedDuration"] = "4"

    # 6. Suggest resources
    cat = suggestions.get("failureCategory", data.existing_category or "MECHANICAL")
    default_resources = {
        "MECHANICAL": [{"type": "Mecánico", "quantity": 2, "hours": 4}, {"type": "Supervisor", "quantity": 1, "hours": 1}],
        "ELECTRICAL": [{"type": "Eléctrico", "quantity": 1, "hours": 4}, {"type": "Supervisor", "quantity": 1, "hours": 1}],
        "INSTRUMENTATION": [{"type": "Instrumentación", "quantity": 1, "hours": 3}, {"type": "Supervisor", "quantity": 1, "hours": 1}],
    }
    suggestions["resources"] = default_resources.get(cat, default_resources["MECHANICAL"])

    # 7. Suggest materials from similar closed WRs (historical lookup)
    suggestions["materials"] = []
    if data.equipment_tag:
        closed_wrs = work_request_service.list_work_requests(db, status=None, limit=200, offset=0)
        for wr in closed_wrs:
            if wr.equipment_tag != data.equipment_tag:
                continue
            if wr.status not in ("CLOSED", "COMPLETED", "TECH_CLOSE"):
                continue
            pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
            hist_mats = pd.get("materials", []) if isinstance(pd, dict) else []
            if hist_mats:
                suggestions["materials"] = hist_mats[:5]  # take up to 5
                suggestions["materials_source"] = "historical"
                break

    # 8. Production impact
    is_stopped = data.plant_condition == "stopped"
    if is_stopped and prio in ("P1", "P2"):
        suggestions["productionImpact"] = "CRITICAL"
    elif is_stopped:
        suggestions["productionImpact"] = "HIGH"
    elif prio in ("P1", "P2"):
        suggestions["productionImpact"] = "HIGH"
    elif prio == "P3":
        suggestions["productionImpact"] = "MEDIUM"
    else:
        suggestions["productionImpact"] = "LOW"

    # 9. Failure catalog suggestions
    symptom_map = {
        "fuga": "Fuga externa",
        "vibración": "Vibración anormal",
        "ruido": "Ruido anormal",
        "temperatura": "Sobrecalentamiento",
        "desgaste": "Desgaste prematuro",
        "corrosión": "Corrosión",
        "rotura": "Rotura/Fractura",
    }
    for kw, symptom in symptom_map.items():
        if kw in desc:
            suggestions["failureSymptom"] = symptom
            break

    cause_map = {
        "desgaste": "Desgaste por uso normal",
        "corrosión": "Corrosión química/ambiental",
        "fuga": "Falla de sello/junta",
        "vibración": "Desbalanceo/Desalineación",
        "sobrecarga": "Sobrecarga operativa",
        "fatiga": "Fatiga del material",
    }
    for kw, cause in cause_map.items():
        if kw in desc:
            suggestions["failureCause"] = cause
            break

    return {"suggestions": suggestions, "confidence": 0.75}


@router.post("/{request_id}/feedback")
def submit_ai_feedback(request_id: str, data: AIFeedbackCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Submit feedback on AI prediction accuracy."""
    from api.database.models import AIFeedbackModel, WorkRequestModel
    import uuid
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    equipment_tag = wr.equipment_tag if wr else ""
    fb = AIFeedbackModel(
        feedback_id=str(uuid.uuid4()),
        work_request_id=request_id,
        equipment_tag=equipment_tag,
        field_name=data.field_name,
        predicted_value=data.predicted_value,
        actual_value=data.actual_value,
        rating=data.rating,
        feedback_source="manual",
    )
    db.add(fb)
    db.commit()
    return {"status": "ok", "feedback_id": fb.feedback_id}


@router.get("/tools/ai-feedback-stats")
def get_feedback_stats(equipment_tag: str = "", db: Session = Depends(get_db)):
    """Get aggregated accuracy stats for AI predictions."""
    from api.database.models import AIFeedbackModel
    query = db.query(AIFeedbackModel)
    if equipment_tag:
        query = query.filter(AIFeedbackModel.equipment_tag == equipment_tag.upper())
    feedbacks = query.all()
    if not feedbacks:
        return {"total": 0, "accuracy_pct": None, "by_field": {}}
    total = len(feedbacks)
    positive = sum(1 for f in feedbacks if f.rating > 0)
    by_field = {}
    for f in feedbacks:
        if f.field_name not in by_field:
            by_field[f.field_name] = {"total": 0, "positive": 0, "corrections": []}
        by_field[f.field_name]["total"] += 1
        if f.rating > 0:
            by_field[f.field_name]["positive"] += 1
        elif f.rating < 0:
            by_field[f.field_name]["corrections"].append({
                "predicted": f.predicted_value, "actual": f.actual_value,
            })
    return {"total": total, "accuracy_pct": round(positive / total * 100) if total else 0, "by_field": by_field}

def _generate_wr_id(db):
    """Generate sequential WR ID: WR-YYYY-NNNNN"""
    from datetime import datetime
    from api.database.models import WorkRequestModel
    year = datetime.now().year
    prefix = f"WR-{year}-"
    # Find max existing ID for this year
    last = db.query(WorkRequestModel.request_id).filter(
        WorkRequestModel.request_id.like(f"{prefix}%")
    ).order_by(WorkRequestModel.request_id.desc()).first()
    if last and last[0]:
        try:
            num = int(last[0].split("-")[-1]) + 1
        except (ValueError, IndexError):
            num = 1
    else:
        # Count all WRs as fallback
        total = db.query(WorkRequestModel).count()
        num = total + 1
    return f"{prefix}{num:05d}"


@router.get("/tools/ai-summary")
def ai_weekly_summary(days: int = 7, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Generate AI-powered weekly summary of maintenance activity."""
    import os, json
    from datetime import datetime, timedelta

    cutoff = datetime.now() - timedelta(days=days)

    # Gather data
    all_wrs = work_request_service.list_work_requests(db, status=None, limit=500, offset=0)
    recent_wrs = [wr for wr in all_wrs if wr.created_at and wr.created_at >= cutoff]

    from api.database.models import ManagedWorkOrderModel
    all_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.created_at >= cutoff
    ).all()

    # Build stats
    wr_by_status = {}
    wr_by_priority = {}
    wr_by_equip = {}
    for wr in recent_wrs:
        wr_by_status[wr.status] = wr_by_status.get(wr.status, 0) + 1
        p = wr.priority_code or "?"
        wr_by_priority[p] = wr_by_priority.get(p, 0) + 1
        tag = wr.equipment_tag or "sin-equipo"
        wr_by_equip[tag] = wr_by_equip.get(tag, 0) + 1

    wo_by_status = {}
    total_hours = 0
    for wo in all_wos:
        wo_by_status[wo.status] = wo_by_status.get(wo.status, 0) + 1
        if wo.actual_hours:
            total_hours += wo.actual_hours

    top_equip = sorted(wr_by_equip.items(), key=lambda x: x[1], reverse=True)[:5]

    stats = {
        "period_days": days,
        "total_wrs": len(recent_wrs),
        "wr_by_status": wr_by_status,
        "wr_by_priority": wr_by_priority,
        "total_wos": len(all_wos),
        "wo_by_status": wo_by_status,
        "total_actual_hours": round(total_hours, 1),
        "top_equipment": [{"tag": t, "count": c} for t, c in top_equip],
    }

    # Generate AI summary with Claude
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"stats": stats, "summary": "API key no configurada", "source": "stats_only"}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system="Eres un analista de mantenimiento de planta OCP. Genera un resumen ejecutivo en espanol de la actividad de mantenimiento. Se conciso, usa bullet points. Incluye: estado general, tendencias, equipos problematicos, y recomendaciones.",
            messages=[{"role": "user", "content": f"Datos de los ultimos {days} dias:\n{json.dumps(stats, ensure_ascii=False)}"}],
        )
        summary = response.content[0].text.strip()
        return {"stats": stats, "summary": summary, "source": "claude_ai"}
    except Exception as e:
        return {"stats": stats, "summary": f"Error al generar resumen: {str(e)}", "source": "error"}


@router.post("/ai-verify-close/{wo_id}")
def ai_verify_close(wo_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI verification before closing a work order — checks completeness and flags issues."""
    import os, json
    from api.database.models import ManagedWorkOrderModel

    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")

    # Rule-based checks first
    issues = []
    warnings = []

    # Check operations have actual hours
    ops = wo.operations or []
    if isinstance(ops, list):
        for op in ops:
            if isinstance(op, dict):
                if not op.get("actual_hours") and op.get("planned_hours", 0) > 0:
                    issues.append(f"Operacion '{op.get('description', '?')[:40]}' sin HH reales registradas")

    # Check actual hours vs estimated
    if wo.actual_hours and wo.estimated_hours:
        ratio = wo.actual_hours / wo.estimated_hours
        if ratio > 2:
            warnings.append(f"Duracion real ({wo.actual_hours}h) es {ratio:.1f}x mayor que estimada ({wo.estimated_hours}h)")
        elif ratio < 0.3:
            warnings.append(f"Duracion real ({wo.actual_hours}h) parece muy baja vs estimada ({wo.estimated_hours}h)")
    elif not wo.actual_hours:
        issues.append("No se registraron horas reales totales")

    # Check materials consumed
    mats = wo.materials or []
    if not mats or (isinstance(mats, list) and len(mats) == 0):
        warnings.append("No se registraron materiales consumidos")

    # Check completion percentage
    if wo.completion_pct and wo.completion_pct < 100:
        issues.append(f"Porcentaje de avance es {wo.completion_pct}%, no 100%")

    # Check status chain
    if wo.status not in ("IN_PROGRESS", "COMPLETED"):
        warnings.append(f"Estado actual es '{wo.status}', se esperaba IN_PROGRESS o COMPLETED para cerrar")

    # AI analysis with Claude
    ai_summary = ""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key and (issues or warnings):
        try:
            import anthropic
            wo_data = {
                "wo_id": wo.wo_id,
                "description": wo.description,
                "type": wo.wo_type,
                "priority": wo.priority_code,
                "estimated_hours": wo.estimated_hours,
                "actual_hours": wo.actual_hours,
                "operations_count": len(ops),
                "materials_count": len(mats),
                "issues": issues,
                "warnings": warnings,
            }
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                system="Eres un supervisor de mantenimiento OCP. Revisa los datos de la OT y da una recomendacion corta en espanol sobre si se puede cerrar o que falta completar. Se directo.",
                messages=[{"role": "user", "content": json.dumps(wo_data, ensure_ascii=False)}],
            )
            ai_summary = response.content[0].text.strip()
        except:
            pass

    can_close = len(issues) == 0
    return {
        "wo_id": wo_id,
        "can_close": can_close,
        "issues": issues,
        "warnings": warnings,
        "ai_recommendation": ai_summary,
        "checks_passed": len(issues) == 0 and len(warnings) == 0,
    }


@router.get("/tools/ai-predict-failures")
def ai_predict_failures(equipment_tag: str = "", db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI failure prediction based on equipment history — probability of failure in next 30/60/90 days."""
    import os, json
    from datetime import datetime, timedelta
    from api.database.models import ManagedWorkOrderModel, HierarchyNodeModel, FailureModeModel, FunctionModel, FunctionalFailureModel

    # Gather equipment data
    tag = (equipment_tag or "").upper().strip()
    if not tag:
        # Get all equipment with history and predict for each
        all_tags = [r[0] for r in db.query(ManagedWorkOrderModel.equipment_tag).distinct().all() if r[0]]
        if not all_tags:
            all_tags = [r[0] for r in db.query(HierarchyNodeModel.tag).filter(HierarchyNodeModel.node_type == "EQUIPMENT").limit(20).all() if r[0]]
        predictions = []
        for t in all_tags[:10]:
            pred = _predict_single(db, t)
            if pred:
                predictions.append(pred)
        predictions.sort(key=lambda p: p.get("risk_score", 0), reverse=True)
        return {"predictions": predictions, "total": len(predictions)}

    pred = _predict_single(db, tag)
    return {"predictions": [pred] if pred else [], "total": 1 if pred else 0}


def _predict_single(db, tag):
    """Predict failure for a single equipment tag."""
    from datetime import datetime, timedelta
    from api.database.models import ManagedWorkOrderModel, HierarchyNodeModel
    import os, json

    node = db.query(HierarchyNodeModel).filter(
        (HierarchyNodeModel.tag == tag) | (HierarchyNodeModel.code == tag)
    ).first()

    # Get WO history
    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.equipment_tag == tag
    ).order_by(ManagedWorkOrderModel.created_at.desc()).limit(20).all()

    # Get WR history
    from api.database.models import WorkRequestModel
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.equipment_tag == tag
    ).order_by(WorkRequestModel.created_at.desc()).limit(20).all()

    total_incidents = len(wos) + len(wrs)
    criticality = node.criticality if node else "C"

    # Simple prediction model based on frequency + criticality
    now = datetime.now()
    dates = []
    for wo in wos:
        if wo.created_at:
            dates.append(wo.created_at)
    for wr in wrs:
        if wr.created_at:
            dates.append(wr.created_at)

    if not dates:
        return {
            "equipment_tag": tag,
            "equipment_name": node.name if node else tag,
            "criticality": criticality,
            "total_incidents": 0,
            "risk_score": 10 if criticality in ("A", "A+") else 5,
            "risk_level": "LOW",
            "probability_30d": 5,
            "probability_60d": 10,
            "probability_90d": 15,
            "recommendation": "Sin historial de fallas. Mantener plan preventivo actual.",
            "last_incident": None,
        }

    dates.sort()
    # Calculate mean time between failures (MTBF)
    intervals = []
    for i in range(1, len(dates)):
        delta = (dates[i] - dates[i-1]).days
        if delta > 0:
            intervals.append(delta)

    mtbf = sum(intervals) / len(intervals) if intervals else 365
    days_since_last = (now - dates[-1]).days

    # Risk score (0-100)
    age_factor = min(days_since_last / max(mtbf, 1), 2.0)
    crit_multiplier = {"A+": 2.0, "A": 1.5, "B": 1.0, "C": 0.7}.get(criticality, 1.0)
    freq_factor = min(total_incidents / 5, 2.0)
    risk_score = min(int(age_factor * crit_multiplier * freq_factor * 25), 100)

    # Probabilities
    p30 = min(int(risk_score * 0.8), 95)
    p60 = min(int(risk_score * 1.2), 98)
    p90 = min(int(risk_score * 1.5), 99)

    risk_level = "CRITICAL" if risk_score >= 75 else "HIGH" if risk_score >= 50 else "MEDIUM" if risk_score >= 25 else "LOW"

    # AI recommendation
    ai_rec = ""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key and risk_score > 20:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=150,
                system="Eres experto en mantenimiento predictivo OCP. Da una recomendacion en 2-3 lineas en espanol.",
                messages=[{"role": "user", "content": json.dumps({
                    "equipo": tag, "nombre": node.name if node else tag,
                    "criticidad": criticality, "incidentes": total_incidents,
                    "mtbf_dias": round(mtbf), "dias_desde_ultimo": days_since_last,
                    "risk_score": risk_score
                }, ensure_ascii=False)}],
            )
            ai_rec = response.content[0].text.strip()
        except:
            pass

    if not ai_rec:
        if risk_score >= 75:
            ai_rec = f"URGENTE: {tag} tiene alto riesgo de falla. Programar inspeccion inmediata."
        elif risk_score >= 50:
            ai_rec = f"Programar mantenimiento preventivo para {tag} en los proximos 15 dias."
        else:
            ai_rec = f"Mantener monitoreo normal de {tag}."

    return {
        "equipment_tag": tag,
        "equipment_name": node.name if node else tag,
        "criticality": criticality,
        "total_incidents": total_incidents,
        "mtbf_days": round(mtbf),
        "days_since_last": days_since_last,
        "last_incident": dates[-1].isoformat() if dates else None,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "probability_30d": p30,
        "probability_60d": p60,
        "probability_90d": p90,
        "recommendation": ai_rec,
    }


@router.post("/ai-suggest-schedule")
def ai_suggest_schedule(wo_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI suggests optimal dates for a work order based on priority, workload, and shutdown calendar."""
    import os, json
    from datetime import datetime, timedelta
    from api.database.models import ManagedWorkOrderModel

    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="OT no encontrada")

    now = datetime.now()
    priority = wo.priority_code or "P3"
    est_hours = wo.estimated_hours or 8

    # Priority-based windows
    windows = {"P1": 1, "P2": 7, "P3": 30, "P4": 90}
    max_days = windows.get(priority, 30)

    # Check existing workload
    active_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(["PLANNED", "RELEASED", "SCHEDULED", "IN_PROGRESS"]),
        ManagedWorkOrderModel.planned_start != None,
    ).all()

    # Build daily load map (next 30 days)
    daily_load = {}
    for awo in active_wos:
        if awo.planned_start:
            day = awo.planned_start.strftime("%Y-%m-%d")
            daily_load[day] = daily_load.get(day, 0) + (awo.estimated_hours or 4)

    # Find best slots (days with least workload)
    suggestions = []
    for d in range(1, min(max_days + 1, 31)):
        date = now + timedelta(days=d)
        if date.weekday() >= 5:  # Skip weekends
            continue
        day_str = date.strftime("%Y-%m-%d")
        load = daily_load.get(day_str, 0)
        suggestions.append({
            "date": day_str,
            "day_name": ["Lun", "Mar", "Mie", "Jue", "Vie"][date.weekday()],
            "existing_load_hours": load,
            "available_hours": max(16 - load, 0),
            "fits": load + est_hours <= 16,
        })

    suggestions.sort(key=lambda s: s["existing_load_hours"])
    best = [s for s in suggestions if s["fits"]][:5]
    if not best:
        best = suggestions[:5]

    # AI recommendation
    ai_rec = ""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=100,
                system="Eres planificador de mantenimiento OCP. Recomienda la mejor fecha en 1-2 lineas en espanol.",
                messages=[{"role": "user", "content": json.dumps({
                    "ot": wo.wo_id, "prioridad": priority, "horas_estimadas": est_hours,
                    "mejores_fechas": best[:3],
                }, ensure_ascii=False)}],
            )
            ai_rec = response.content[0].text.strip()
        except:
            pass

    return {
        "wo_id": wo_id,
        "priority": priority,
        "estimated_hours": est_hours,
        "max_days_window": max_days,
        "suggested_dates": best,
        "ai_recommendation": ai_rec or f"Mejor fecha: {best[0]['date']} ({best[0]['day_name']}) con {best[0]['available_hours']}h disponibles" if best else "Sin fechas disponibles",
    }


@router.get("/tools/work-centers")
def list_work_centers(plant_type: str = "", specialty: str = "", db: Session = Depends(get_db)):
    """List work centers, optionally filtered by plant type or specialty."""
    from sqlalchemy import text
    query = "SELECT code, name, plant_type, area_code, area_name, specialty_code, specialty_name, is_external, headcount_day, headcount_night, effective_hours_per_person, shift_hours FROM work_centers WHERE 1=1"
    params = {}
    if plant_type:
        query += " AND plant_type = :pt"
        params["pt"] = plant_type.upper()
    if specialty:
        query += " AND specialty_code = :sp"
        params["sp"] = specialty.upper()
    query += " ORDER BY plant_type, area_code, specialty_code"
    rows = db.execute(text(query), params).fetchall()
    return [{"code": r[0], "name": r[1], "plant_type": r[2], "area_code": r[3], "area_name": r[4],
             "specialty_code": r[5], "specialty_name": r[6], "is_external": bool(r[7]),
             "headcount_day": r[8], "headcount_night": r[9],
             "effective_hours": r[10], "shift_hours": r[11],
             "daily_capacity_day": r[8] * r[10], "daily_capacity_night": r[9] * r[10],
             } for r in rows]


@router.get("/tools/capacity-evaluation")
def capacity_evaluation(week_offset: int = 0, work_center: str = "", db: Session = Depends(get_db)):
    """Evaluate capacity: HH supply vs demand per work center for a given week."""
    from datetime import datetime, timedelta
    from sqlalchemy import text
    from api.database.models import ManagedWorkOrderModel

    now = datetime.now()
    # Calculate week start (Monday)
    week_start = now - timedelta(days=now.weekday()) + timedelta(weeks=week_offset)
    week_end = week_start + timedelta(days=6)

    # Get work centers
    wc_query = "SELECT code, name, specialty_name, headcount_day, headcount_night, effective_hours_per_person FROM work_centers WHERE is_external = 0"
    params = {}
    if work_center:
        wc_query += " AND code = :wc"
        params["wc"] = work_center
    wc_query += " ORDER BY code"
    centers = db.execute(text(wc_query), params).fetchall()

    # Get OTs scheduled in this week
    scheduled_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(["PLANIFICADO", "PROGRAMADO", "EN_EJECUCION", "APROBADO", "PLANNED", "SCHEDULED", "IN_PROGRESS"]),
    ).all()

    # Calculate demand per work center
    demand_by_wc = {}
    for wo in scheduled_wos:
        ops = wo.operations or []
        for op in ops:
            if isinstance(op, dict):
                specialty = (op.get("specialty", "") or "").lower()
                hours = op.get("planned_hours", 0) or op.get("estimated_hours", 0) or 0
                # Map specialty to work center
                for center in centers:
                    if center[2].lower() in specialty or specialty in center[2].lower():
                        code = center[0]
                        demand_by_wc[code] = demand_by_wc.get(code, 0) + hours
                        break

    # Build response
    results = []
    for center in centers:
        code, name, specialty, hc_day, hc_night, eff_hours = center
        daily_supply = hc_day * eff_hours  # day shift supply
        weekly_supply = daily_supply * 5  # 5 working days (can be 6 or 7)
        weekly_demand = demand_by_wc.get(code, 0)
        load_pct = round((weekly_demand / weekly_supply * 100) if weekly_supply > 0 else 0, 1)
        free = round(weekly_supply - weekly_demand, 1)

        results.append({
            "work_center": code,
            "name": name,
            "specialty": specialty,
            "headcount_day": hc_day,
            "headcount_night": hc_night,
            "weekly_supply_hh": round(weekly_supply, 1),
            "weekly_demand_hh": round(weekly_demand, 1),
            "load_pct": load_pct,
            "free_hh": free,
            "overloaded": load_pct > 100,
            "status": "CRITICO" if load_pct > 100 else "ALTO" if load_pct > 80 else "NORMAL" if load_pct > 50 else "BAJO",
        })

    results.sort(key=lambda x: x["load_pct"], reverse=True)

    return {
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_end": week_end.strftime("%Y-%m-%d"),
        "work_centers": results,
        "total_supply": sum(r["weekly_supply_hh"] for r in results),
        "total_demand": sum(r["weekly_demand_hh"] for r in results),
        "overloaded_centers": [r["work_center"] for r in results if r["overloaded"]],
    }


@router.post("/manual")
def create_wr_manual(data: WRManualCreateRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a WR from manual form — calculates confidence from filled fields and goes to PENDING_VALIDATION."""
    import uuid
    from datetime import datetime
    from api.database.models import WorkRequestModel

    now = datetime.now()

    # Calculate AI confidence based on how many fields were filled
    filled_fields = 0
    total_scored = 7  # fields that contribute to confidence
    if data.problem_description.strip():
        filled_fields += 1
    if data.failure_category:
        filled_fields += 1
    if data.failure_symptom:
        filled_fields += 1
    if data.failure_cause:
        filled_fields += 1
    if data.plant_condition:
        filled_fields += 1
    if data.suggested_action.strip():
        filled_fields += 1
    if data.circumstances.strip():
        filled_fields += 1
    confidence = round(filled_fields / total_scored, 2)

    # Derive work order type from priority
    wo_type_map = {"P1": "PM01", "P2": "PM01", "P3": "PM02", "P4": "PM02"}
    wo_type = wo_type_map.get(data.priority, "PM01")

    wr = WorkRequestModel(
        request_id=_generate_wr_id(db),
        status="PENDIENTE",
        equipment_id=data.equipment_tag,
        equipment_tag=data.equipment_tag,
        equipment_confidence=0.9 if data.equipment_name and "(No catalogado)" not in data.equipment_name else 0.5,
        priority_code=data.priority,
        work_class=work_request_service.derive_work_class(data.priority),
        created_by=data.created_by or getattr(user, "full_name", None) or getattr(user, "username", ""),
        problem_description={
            "original_text": data.problem_description,
            "suggested_action": data.suggested_action,
            "failure_mode_detected": data.failure_category,
            "failure_symptom": data.failure_symptom,
            "failure_cause": data.failure_cause,
            "failure_object_part": data.failure_object_part,
            "resources": data.resources,
            "materials": data.materials,
        },
        ai_classification={
            "priority_suggested": data.priority,
            "confidence": confidence,
            "work_order_type": wo_type,
            "failure_type": data.failure_category,
            "failure_class": data.failure_symptom,
            "failure_category": data.failure_cause,
            "recommended_priority": data.priority,
            "plant_id": data.plant_id,
            "equipment_name": data.equipment_name,
            "activity_class": data.activity_class,
            "plant_condition": data.plant_condition,
            "estimated_duration_hours": data.estimated_duration,
            "safety_flags": ["BREAKDOWN"] if data.plant_condition == "stopped" else [],
            "source": "manual_form",
            "wo_title": getattr(data, 'wo_title', '') or '',
            "aviso_coding": data.aviso_coding,
            "technical_location": data.technical_location,
        },
        # SAP Aviso fields
        notification_type=data.notification_type or "A1",
        reported_by=data.reported_by or None,
        reported_at=now if data.reported_by else None,
        circumstances=("\n".join(filter(None, [data.circumstances, ("Working conditions: " + data.work_conditions) if data.work_conditions else None]))) or None,
        support_equipment=[{"tag": s} for s in data.support_equipment] if data.support_equipment else None,
        documents=data.documents if data.documents else None,
        created_at=now,
    )
    db.add(wr)
    from api.services.audit_service import log_action
    log_action(db, "work_request", wr.request_id, "CREATE_MANUAL")
    db.commit()
    db.refresh(wr)
    # Jorge 2026-04-27: broadcast wr_created para que la pestaña Identification
    # se refresque al toque cuando alguien crea un aviso desde Failure Capture.
    # Antes: ningún broadcast → la lista no aparecía hasta navegar fuera y volver.
    try:
        from api.services.ws_manager import queue_notify
        queue_notify(
            "wr_created",
            {"request_id": wr.request_id, "equipment_tag": wr.equipment_tag, "priority": wr.priority_code},
            data.plant_id,
        )
    except Exception:
        pass
    return {
        "request_id": wr.request_id,
        "status": wr.status,
        "equipment_tag": wr.equipment_tag,
        "priority_code": wr.priority_code,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
    }


@router.post("/from-hierarchy")
def create_wr_from_hierarchy(data: WRFromHierarchyRequest, db: Session = Depends(get_db)):
    """Create a work request directly from the hierarchy view for a specific equipment."""
    import uuid
    from datetime import datetime, timezone
    from api.database.models import WorkRequestModel

    wr = WorkRequestModel(
        request_id=str(uuid.uuid4()),
        status="DRAFT",
        equipment_id=data.equipment_tag,
        equipment_tag=data.equipment_tag,
        problem_description=data.problem_description or f"Work request for {data.equipment_name or data.equipment_tag}",
        ai_classification={"priority": data.priority, "source": "hierarchy", "plant_id": data.plant_id},
        created_at=datetime.now(timezone.utc),
    )
    db.add(wr)
    db.commit()
    db.refresh(wr)
    try:
        from api.services.ws_manager import queue_notify
        queue_notify(
            "wr_created",
            {"request_id": wr.request_id, "equipment_tag": wr.equipment_tag},
            data.plant_id,
        )
    except Exception:
        pass
    return {
        "request_id": wr.request_id,
        "status": wr.status,
        "equipment_tag": wr.equipment_tag,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
    }




@router.get("/{wr_id}/criticality-score")
def get_criticality_score(wr_id: str, db: Session = Depends(get_db)):
    """Calculate and return criticality score for a WR."""
    wr = work_request_service.get_work_request(db, wr_id)
    if not wr:
        raise HTTPException(status_code=404, detail="WR not found")
    ai = {}
    if hasattr(wr, 'ai_classification') and wr.ai_classification:
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
    equip_tag = getattr(wr, 'equipment_tag', '') or ''
    priority = ai.get("priority", getattr(wr, 'priority_code', 'P3') or 'P3')
    impact = ai.get("production_impact", "MEDIUM")
    category = ai.get("failureCategory", "")
    return _calculate_criticality_score(db, equip_tag, priority, impact, category)

@router.post("/ocr-closure")
def ocr_work_order_closure(data: OCRClosureRequest, db: Session = Depends(get_db)):
    """Process OCR-based work order closure.
    Accepts data extracted from a photo of a paper work order.
    Returns closure confirmation for SAP integration."""
    return {
        "work_order_id": data.work_order_id,
        "status": "CLOSURE_SUBMITTED",
        "actual_hours": data.actual_hours,
        "completion_date": data.completion_date,
        "findings": data.findings,
        "spare_parts_used": data.spare_parts_used,
        "condition_after": data.condition_after,
        "technician_notes": data.technician_notes,
        "ocr_confidence": data.ocr_confidence,
        "sap_transaction": "IW32",
        "message": "Closure request submitted. SAP transaction IW32 will be triggered on integration.",
    }
