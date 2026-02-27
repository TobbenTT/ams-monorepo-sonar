"""Planner service — generates AI recommendations for work requests."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import (
    WorkRequestModel, PlannerRecommendationModel,
    WorkforceModel, InventoryItemModel, ShutdownCalendarModel, BacklogItemModel,
)
from api.services.audit_service import log_action
from tools.processors.planner_engine import PlannerEngine
from tools.models.schemas import (
    StructuredWorkRequest, EquipmentIdentification, ProblemDescription,
    AIClassification, Validation, WorkOrderType, Priority, ResolutionMethod,
    WorkRequestStatus,
)


def generate_recommendation(db: Session, work_request_id: str) -> dict | None:
    """Generate a planner recommendation for a work request."""
    wr = db.query(WorkRequestModel).filter(
        WorkRequestModel.request_id == work_request_id
    ).first()
    if not wr:
        return None

    # Reconstruct StructuredWorkRequest from DB model
    structured_wr = _reconstruct_work_request(wr)

    # Load context data
    workforce = _load_workforce(db)
    inventory = _load_inventory(db)
    shutdowns = _load_shutdowns(db)
    backlog = _load_backlog(db)

    # Generate recommendation
    recommendation = PlannerEngine.recommend(
        structured_wr, workforce, inventory, shutdowns, backlog
    )

    # Persist
    rec_model = PlannerRecommendationModel(
        recommendation_id=recommendation.recommendation_id,
        work_request_id=work_request_id,
        resource_analysis=recommendation.resource_analysis.model_dump(mode="json"),
        scheduling_suggestion=recommendation.scheduling_suggestion.model_dump(mode="json"),
        risk_assessment=recommendation.risk_assessment.model_dump(mode="json"),
        planner_action=recommendation.planner_action_required.value,
        ai_confidence=recommendation.ai_confidence,
        generated_at=datetime.now(),
    )
    db.add(rec_model)
    log_action(db, "planner_recommendation", rec_model.recommendation_id, "CREATE")
    db.commit()

    return {
        "recommendation_id": recommendation.recommendation_id,
        "work_request_id": work_request_id,
        "planner_action": recommendation.planner_action_required.value,
        "ai_confidence": recommendation.ai_confidence,
        "risk_level": recommendation.risk_assessment.risk_level.value,
        "recommended_date": recommendation.scheduling_suggestion.recommended_date.isoformat(),
        "resource_analysis": recommendation.resource_analysis.model_dump(mode="json"),
        "scheduling_suggestion": recommendation.scheduling_suggestion.model_dump(mode="json"),
        "risk_assessment": recommendation.risk_assessment.model_dump(mode="json"),
    }


def get_recommendation(db: Session, recommendation_id: str) -> PlannerRecommendationModel | None:
    return db.query(PlannerRecommendationModel).filter(
        PlannerRecommendationModel.recommendation_id == recommendation_id
    ).first()


def apply_action(
    db: Session, recommendation_id: str, action: str, modifications: dict | None = None
) -> dict | None:
    """Apply a planner action to a recommendation."""
    rec = get_recommendation(db, recommendation_id)
    if not rec:
        return None

    rec.planner_action = action
    log_action(db, "planner_recommendation", recommendation_id, f"ACTION_{action}")

    # Update work request status based on action
    wr = db.query(WorkRequestModel).filter(
        WorkRequestModel.request_id == rec.work_request_id
    ).first()
    if wr:
        if action == "APPROVE":
            wr.status = "VALIDATED"
        elif action == "DEFER":
            wr.status = "PENDING_VALIDATION"

    db.commit()
    db.refresh(rec)

    return {
        "recommendation_id": rec.recommendation_id,
        "work_request_id": rec.work_request_id,
        "planner_action": rec.planner_action,
        "ai_confidence": rec.ai_confidence,
    }


def _reconstruct_work_request(wr: WorkRequestModel) -> StructuredWorkRequest:
    """Reconstruct a StructuredWorkRequest from DB model."""
    pd = wr.problem_description or {}
    ai = wr.ai_classification or {}

    return StructuredWorkRequest(
        request_id=wr.request_id,
        source_capture_id=wr.source_capture_id or "",
        created_at=wr.created_at or datetime.now(),
        status=WorkRequestStatus(wr.status) if wr.status in [e.value for e in WorkRequestStatus] else WorkRequestStatus.DRAFT,
        equipment_identification=EquipmentIdentification(
            equipment_id=wr.equipment_id,
            equipment_tag=wr.equipment_tag,
            confidence_score=wr.equipment_confidence or 0.0,
            resolution_method=ResolutionMethod(wr.resolution_method) if wr.resolution_method in [e.value for e in ResolutionMethod] else ResolutionMethod.MANUAL,
        ),
        problem_description=ProblemDescription(
            original_text=pd.get("original_text", ""),
            structured_description=pd.get("structured_description", ""),
            structured_description_fr=pd.get("structured_description_fr", ""),
            failure_mode_detected=pd.get("failure_mode_detected"),
            failure_mode_code=pd.get("failure_mode_code"),
            affected_component=pd.get("affected_component"),
        ),
        ai_classification=AIClassification(
            work_order_type=WorkOrderType(ai.get("work_order_type", "PM01_INSPECTION")),
            priority_suggested=Priority(ai.get("priority_suggested", "3_NORMAL")),
            priority_justification=ai.get("priority_justification", ""),
            estimated_duration_hours=ai.get("estimated_duration_hours", 4.0),
            required_specialties=ai.get("required_specialties", ["MECHANICAL"]),
            safety_flags=ai.get("safety_flags", []),
        ),
        spare_parts_suggested=[],
        validation=Validation(),
    )


def _load_workforce(db: Session) -> list[dict]:
    workers = db.query(WorkforceModel).all()
    return [
        {
            "worker_id": w.worker_id, "name": w.name, "specialty": w.specialty,
            "shift": w.shift, "available": w.available,
            "certifications": w.certifications or [],
        }
        for w in workers
    ]


def _load_inventory(db: Session) -> list[dict]:
    items = db.query(InventoryItemModel).all()
    return [
        {
            "material_code": i.material_code, "description": i.description,
            "quantity_available": i.quantity_available, "warehouse": i.warehouse_id,
        }
        for i in items
    ]


def _load_shutdowns(db: Session) -> list[dict]:
    sds = db.query(ShutdownCalendarModel).all()
    return [
        {
            "shutdown_id": s.shutdown_id, "start_date": s.start_date.isoformat(),
            "end_date": s.end_date.isoformat(), "type": s.shutdown_type,
            "areas": s.areas or [], "description": s.description,
        }
        for s in sds
    ]


def _load_backlog(db: Session) -> list[dict]:
    items = db.query(BacklogItemModel).all()
    return [
        {
            "backlog_id": b.backlog_id, "equipment_tag": b.equipment_tag,
            "priority": b.priority, "specialties": b.specialties or [],
            "shutdown_required": b.shutdown_required,
        }
        for b in items
    ]
