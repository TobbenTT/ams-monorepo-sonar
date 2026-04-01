"""Admin router — seed database, audit log, stats, agent status."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from fastapi.responses import StreamingResponse
import json, io
from datetime import datetime, date
from api.database.models import AuditLogModel, UserFeedbackModel
from api.schemas import FeedbackCreate
from api.services import hierarchy_service, agent_service
from api.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_user)])


@router.post("/seed-database", dependencies=[Depends(require_role("admin"))])
def seed_database(db: Session = Depends(get_db)):
    from api.seed import seed_all
    result = seed_all(db)
    return result


@router.get("/audit-log", dependencies=[Depends(require_role("admin", "manager"))])
def get_audit_log(entity_type: str | None = None, limit: int = 100, db: Session = Depends(get_db)):
    q = db.query(AuditLogModel)
    if entity_type:
        q = q.filter(AuditLogModel.entity_type == entity_type)
    entries = q.order_by(AuditLogModel.timestamp.desc()).limit(limit).all()
    return [
        {"id": e.id, "entity_type": e.entity_type, "entity_id": e.entity_id,
         "action": e.action, "user": e.user,
         "timestamp": e.timestamp.isoformat() if e.timestamp else None}
        for e in entries
    ]


@router.get("/stats", dependencies=[Depends(get_current_user)])
def get_stats(db: Session = Depends(get_db)):
    node_counts = hierarchy_service.count_nodes_by_type(db)
    plants = hierarchy_service.list_plants(db)
    return {
        "plants": len(plants),
        "hierarchy_nodes": node_counts,
        "total_nodes": sum(node_counts.values()),
    }


@router.delete("/reset-database", dependencies=[Depends(require_role("admin"))])
def reset_database(db: Session = Depends(get_db)):
    from api.database.models import (
        VarianceAlertModel, HealthScoreModel, KPIMetricsModel,
        FailurePredictionModel, CAPAItemModel, ExpertCardModel,
        SAPUploadPackageModel, WorkPackageModel, MaintenanceTaskModel,
        FailureModeModel, FunctionalFailureModel, FunctionModel,
        CriticalityAssessmentModel, WorkOrderModel, HierarchyNodeModel, PlantModel,
        FieldCaptureModel, WorkRequestModel, PlannerRecommendationModel,
        BacklogItemModel, OptimizedBacklogModel, WorkforceModel,
        ShutdownCalendarModel, InventoryItemModel,
    )
    for model in [
        AuditLogModel,
        OptimizedBacklogModel, PlannerRecommendationModel, BacklogItemModel,
        WorkRequestModel, FieldCaptureModel,
        InventoryItemModel, ShutdownCalendarModel, WorkforceModel,
        VarianceAlertModel, HealthScoreModel, KPIMetricsModel,
        FailurePredictionModel, CAPAItemModel, ExpertCardModel,
        SAPUploadPackageModel, WorkPackageModel, MaintenanceTaskModel,
        FailureModeModel, FunctionalFailureModel, FunctionModel,
        CriticalityAssessmentModel, WorkOrderModel, HierarchyNodeModel, PlantModel,
    ]:
        db.query(model).delete()
    db.commit()
    return {"status": "Database reset complete"}


@router.get("/agent-status", dependencies=[Depends(require_role("admin", "manager"))])
def agent_status():
    return agent_service.get_status()




@router.get("/export-data", dependencies=[Depends(require_role("admin", "manager"))])
def export_all_data(db: Session = Depends(get_db)):
    """Export all major tables as a JSON backup."""
    from api.database.models import (
        PlantModel, HierarchyNodeModel, WorkOrderModel, WorkRequestModel,
        FieldCaptureModel, WorkforceModel, InventoryItemModel,
        KPIMetricsModel, FailureModeModel, BacklogItemModel,
        CriticalityAssessmentModel, UserModel,
    )

    def serialize(obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return str(obj)

    def table_to_list(model):
        rows = db.query(model).all()
        result = []
        for row in rows:
            d = {}
            for col in row.__table__.columns:
                val = getattr(row, col.name)
                if isinstance(val, (datetime, date)):
                    d[col.name] = val.isoformat() if val else None
                elif isinstance(val, dict) or isinstance(val, list):
                    d[col.name] = val
                else:
                    d[col.name] = val
            result.append(d)
        return result

    data = {
        "exported_at": datetime.now().isoformat(),
        "tables": {
            "plants": table_to_list(PlantModel),
            "hierarchy_nodes": table_to_list(HierarchyNodeModel),
            "work_orders": table_to_list(WorkOrderModel),
            "work_requests": table_to_list(WorkRequestModel),
            "field_captures": table_to_list(FieldCaptureModel),
            "workforce": table_to_list(WorkforceModel),
            "inventory": table_to_list(InventoryItemModel),
            "kpi_metrics": table_to_list(KPIMetricsModel),
            "failure_modes": table_to_list(FailureModeModel),
            "backlog": table_to_list(BacklogItemModel),
            "criticality": table_to_list(CriticalityAssessmentModel),
        }
    }

    content = json.dumps(data, default=serialize, indent=2, ensure_ascii=False)
    buffer = io.BytesIO(content.encode("utf-8"))
    filename = f"ocp-backup-{datetime.now().strftime('%Y-%m-%d')}.json"

    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/import-sources")
def list_import_sources():
    """Return available import source types."""
    from tools.models.schemas import ImportSource
    return [{"value": s.value, "label": s.value.replace("_", " ").title()} for s in ImportSource]

@router.post("/feedback", dependencies=[Depends(get_current_user)])
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    fb = UserFeedbackModel(
        page=data.page,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(fb)
    db.commit()
    return {"feedback_id": fb.feedback_id, "status": "received"}


@router.get("/feedback", dependencies=[Depends(require_role("admin", "manager"))])
def list_feedback(page: str | None = None, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(UserFeedbackModel)
    if page:
        q = q.filter(UserFeedbackModel.page == page)
    entries = q.order_by(UserFeedbackModel.created_at.desc()).limit(limit).all()
    return [
        {"feedback_id": f.feedback_id, "page": f.page, "rating": f.rating,
         "comment": f.comment, "created_at": f.created_at.isoformat() if f.created_at else None}
        for f in entries
    ]
