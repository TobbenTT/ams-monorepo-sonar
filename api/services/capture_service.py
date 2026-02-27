"""Capture service — processes field captures into structured work requests."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import FieldCaptureModel, WorkRequestModel
from api.services.audit_service import log_action
from tools.processors.pii_redactor import redact
from tools.processors.field_capture_processor import FieldCaptureProcessor
from tools.models.schemas import FieldCaptureInput, CaptureType, Language


def process_capture(db: Session, data: dict) -> dict:
    """Process a field capture: persist raw capture, run processor, persist work request."""
    capture_input = FieldCaptureInput(
        timestamp=datetime.now(),
        technician_id=data.get("technician_id", "UNKNOWN"),
        technician_name=data.get("technician_name", "Unknown"),
        capture_type=CaptureType(data.get("capture_type", "TEXT")),
        language_detected=Language(data.get("language", "en")),
        raw_voice_text=data.get("raw_voice_text"),
        raw_text_input=data.get("raw_text_input"),
        images=[],
        equipment_tag_manual=data.get("equipment_tag_manual"),
        location_hint=data.get("location_hint"),
    )

    # Persist raw capture
    capture_model = FieldCaptureModel(
        capture_id=capture_input.capture_id,
        technician_id=capture_input.technician_id,
        capture_type=capture_input.capture_type.value,
        language=capture_input.language_detected.value,
        raw_text=capture_input.raw_text_input,
        raw_voice_text=capture_input.raw_voice_text,
        images=None,
        equipment_tag_manual=capture_input.equipment_tag_manual,
        location_hint=capture_input.location_hint,
        created_at=datetime.now(),
    )
    db.add(capture_model)
    log_action(db, "field_capture", capture_model.capture_id, "CREATE")

    # Build equipment registry from hierarchy nodes
    from api.database.models import HierarchyNodeModel
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT"
    ).all()
    equipment_registry = [
        {
            "equipment_id": n.node_id,
            "tag": n.tag or n.code,
            "description": n.name,
            "description_fr": n.name_fr or "",
            "aliases": [],
        }
        for n in nodes
    ]

    # Process
    processor = FieldCaptureProcessor(equipment_registry)
    wr = processor.process(capture_input)

    # Persist work request
    wr_model = WorkRequestModel(
        request_id=wr.request_id,
        source_capture_id=capture_input.capture_id,
        status=wr.status.value,
        equipment_id=wr.equipment_identification.equipment_id,
        equipment_tag=wr.equipment_identification.equipment_tag,
        equipment_confidence=wr.equipment_identification.confidence_score,
        resolution_method=wr.equipment_identification.resolution_method.value,
        problem_description=wr.problem_description.model_dump(mode="json"),
        ai_classification=wr.ai_classification.model_dump(mode="json"),
        spare_parts=[sp.model_dump(mode="json") for sp in wr.spare_parts_suggested],
        image_analysis=wr.image_analysis.model_dump(mode="json") if wr.image_analysis else None,
        validation=wr.validation.model_dump(mode="json"),
        created_at=datetime.now(),
    )
    db.add(wr_model)
    log_action(db, "work_request", wr_model.request_id, "CREATE")
    db.commit()

    return {
        "capture_id": capture_input.capture_id,
        "work_request_id": wr.request_id,
        "status": wr.status.value,
        "equipment_tag": wr.equipment_identification.equipment_tag,
        "equipment_confidence": wr.equipment_identification.confidence_score,
        "failure_mode_detected": wr.problem_description.failure_mode_detected,
        "priority_suggested": wr.ai_classification.priority_suggested.value,
        "spare_parts_count": len(wr.spare_parts_suggested),
    }


def get_capture(db: Session, capture_id: str) -> FieldCaptureModel | None:
    return db.query(FieldCaptureModel).filter(
        FieldCaptureModel.capture_id == capture_id
    ).first()


def list_captures(db: Session) -> list[FieldCaptureModel]:
    return db.query(FieldCaptureModel).order_by(FieldCaptureModel.created_at.desc()).all()
