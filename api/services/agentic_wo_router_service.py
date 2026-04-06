"""WO Router service — takes an approved Work Request and pre-fills a draft Work Order
with crew, materials, and duration estimate based on historical data."""

import logging
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel,
    ManagedWorkOrderModel,
    WorkRequestModel,
)

log = logging.getLogger(__name__)

SPECIALTY_MAP = {
    "MECANICO": ["MECANICO"],
    "ELECTRICO": ["ELECTRICO"],
    "INSTRUMENTACION": ["INSTRUMENTISTA"],
    "HIDRAULICO": ["MECANICO", "HIDRAULICO"],
    "NEUMATICO": ["MECANICO", "INSTRUMENTISTA"],
    "LUBRICACION": ["MECANICO"],
    "ESTRUCTURAL": ["MECANICO"],
}

WO_TYPE_MAP = {
    "EM": "CORRECTIVO",
    "UC": "CORRECTIVO",
    "PR": "PREVENTIVO",
    "PM": "PREVENTIVO",
}


def route_work_request(db: Session, work_request_id: str, plant_id: str) -> dict:
    """Route an approved Work Request into a draft Work Order.

    Looks up historical WOs for the same equipment to estimate duration,
    suggests crew via assignment optimization, checks material availability,
    and creates a draft WO in CREADO status.
    """
    # ------------------------------------------------------------------
    # Step 1 — Load Work Request
    # ------------------------------------------------------------------
    wr = (
        db.query(WorkRequestModel)
        .filter(WorkRequestModel.request_id == work_request_id)
        .first()
    )
    if not wr:
        return {"error": "Work request not found", "work_request_id": work_request_id}

    # ------------------------------------------------------------------
    # Step 2 — Find similar historical WOs
    # ------------------------------------------------------------------
    similar_wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.equipment_tag == wr.equipment_tag,
            ManagedWorkOrderModel.status.in_(["CERRADO", "COMPLETED", "CLOSED"]),
        )
        .order_by(ManagedWorkOrderModel.created_at.desc())
        .limit(20)
        .all()
    )

    hours_list = [
        w.actual_hours for w in similar_wos if w.actual_hours and w.actual_hours > 0
    ]
    avg_hours = sum(hours_list) / len(hours_list) if hours_list else 4.0

    similar_summary = [
        {
            "wo_number": w.wo_number,
            "wo_type": w.wo_type,
            "actual_hours": w.actual_hours,
            "priority_code": w.priority_code,
            "status": w.status,
        }
        for w in similar_wos[:5]
    ]

    # ------------------------------------------------------------------
    # Step 3 — Determine specialties
    # ------------------------------------------------------------------
    classification = wr.ai_classification or {}
    category = classification.get("failure_category", "MECANICO")
    specialties = SPECIALTY_MAP.get(category, ["MECANICO"])

    # ------------------------------------------------------------------
    # Step 4 — Suggest crew via assignment_service
    # ------------------------------------------------------------------
    problem_desc = wr.problem_description or {}
    task_description = problem_desc.get("structured_description", "Maintenance task")

    tasks = [
        {
            "task_id": work_request_id,
            "description": task_description,
            "specialty": specialties[0],
            "duration_hours": avg_hours,
            "priority": wr.priority_code or "P3",
        }
    ]

    try:
        from api.services.assignment_service import optimize_assignments

        crew_suggestion = optimize_assignments(
            db=db,
            tasks=tasks,
            plant_id=plant_id,
            target_date=date.today() + timedelta(days=1),
            target_shift="MORNING",
        )
    except Exception as exc:
        log.warning("Assignment optimization failed: %s", exc)
        crew_suggestion = {
            "assignments": [],
            "message": "Could not optimize — assign manually",
        }

    # ------------------------------------------------------------------
    # Step 5 — Check materials
    # ------------------------------------------------------------------
    materials_status: dict = {}
    try:
        backlog = (
            db.query(BacklogItemModel)
            .filter(BacklogItemModel.work_request_id == work_request_id)
            .first()
        )
        if backlog:
            from api.services.agentic_material_service import check_item_materials

            materials_status = check_item_materials(db, backlog.backlog_id, plant_id)
    except Exception as exc:
        log.warning("Material check failed: %s", exc)
        materials_status = {"error": str(exc), "message": "Material check unavailable"}

    # ------------------------------------------------------------------
    # Step 6 — Create draft WO
    # ------------------------------------------------------------------
    wo_type = classification.get("activity_class", "PM01")
    mapped_wo_type = WO_TYPE_MAP.get(wo_type, wo_type)

    description_text = problem_desc.get("structured_description", "")
    if not description_text and problem_desc.get("original_text"):
        description_text = problem_desc["original_text"][:300]

    operations = [
        {
            "seq": 10,
            "description": classification.get(
                "suggested_action", description_text[:200]
            ),
            "specialty": specialties[0],
            "hours": round(avg_hours, 1),
            "status": "PENDIENTE",
        }
    ]

    materials_list = wr.spare_parts or []

    try:
        from api.services.managed_wo_service import create_work_order

        draft_wo = create_work_order(
            db=db,
            equipment_tag=wr.equipment_tag or wr.equipment_id or "UNKNOWN",
            description=description_text[:300]
            or "Work order from WR " + work_request_id,
            wo_type=mapped_wo_type,
            priority_code=wr.priority_code or "P3",
            plant_id=plant_id,
            work_request_id=work_request_id,
            estimated_hours=round(avg_hours, 1),
            operations=operations,
            materials=materials_list,
        )
    except Exception as exc:
        log.warning("Draft WO creation failed: %s", exc)
        draft_wo = {"error": str(exc), "message": "WO creation failed"}

    return {
        "draft_wo": draft_wo,
        "suggested_crew": crew_suggestion,
        "estimated_hours": round(avg_hours, 1),
        "estimation_source": "historical" if hours_list else "default",
        "similar_wos_count": len(similar_wos),
        "similar_wos": similar_summary,
        "materials_status": materials_status,
        "specialties": specialties,
        "classification": classification,
    }
