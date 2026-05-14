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


from fastapi import Header, Request
import os as _os_admin


# Endpoint que NO requiere auth estándar (bypass el dependencies=[get_current_user]
# del router) porque lo usa deploy.sh con X-Internal-Key.
_kick_router = APIRouter(prefix="/admin", tags=["admin-public"])


@_kick_router.post("/kick-all-users")
async def kick_all_users(
    request: Request,
    message: str = "Servidor actualizado. Volvé a iniciar sesión en unos segundos.",
):
    """Jorge 2026-04-21 — fuerza logout de todos los usuarios conectados.
    Auth via X-Internal-Key (DEPLOY_SECRET env var) o Authorization Bearer
    con role admin. Llamado desde /root/deploy.sh antes de reiniciar."""
    deploy_secret = _os_admin.environ.get("DEPLOY_SECRET", "")
    x_internal_key = request.headers.get("x-internal-key") or ""
    # Security fix audit 2026-04-23: hmac.compare_digest para evitar timing attack
    import hmac as _hmac
    is_internal = bool(deploy_secret) and _hmac.compare_digest(x_internal_key, deploy_secret)
    # Si no es internal, exigir admin via token
    if not is_internal:
        from api.services.auth_service import decode_token
        auth = request.headers.get("authorization", "")
        token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
        if not token:
            raise HTTPException(status_code=401, detail="missing auth")
        try:
            payload = decode_token(token)
        except Exception:
            raise HTTPException(status_code=401, detail="invalid token")
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="admin only")
    from api.services.ws_manager import manager
    await manager.broadcast("force_logout", {"message": message})
    return {"kicked": True}


# Registrar el router público en main.py — se hace vía router.include_router
# pero main.py arma la app, así que lo exponemos acá para montarlo.
public_kick_router = _kick_router


@router.post("/seed-database", dependencies=[Depends(require_role("admin"))])
def seed_database(db: Session = Depends(get_db)):
    from api.seed import seed_all
    result = seed_all(db)
    return result


@router.post("/seed-demo-plant", dependencies=[Depends(require_role("admin"))])
def seed_demo_plant_endpoint(
    plant_code: str = "DEMO-CORP",
    plant_name: str = "Demo Mining Corporation",
    location: str = "International",
    db: Session = Depends(get_db),
):
    """Create a fully-populated demo plant for sales presentations (idempotent)."""
    from api.seed_demo import seed_demo_plant
    return seed_demo_plant(db, plant_code, plant_name, location)


@router.get("/audit-log")
def get_audit_log(
    entity_type: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SF-660 (audit log policy §5) — scoping por rol:
       - admin/manager: ven todo, filtros libres.
       - supervisor: ven todo de su planta + sus propias acciones.
       - planner/engineer/tecnico: solo sus propias acciones.
    """
    q = db.query(AuditLogModel)
    if entity_type:
        q = q.filter(AuditLogModel.entity_type == entity_type)

    role = getattr(user, "role", None)
    uid = getattr(user, "user_id", None)
    user_plant = getattr(user, "plant_id", None)

    if role in ("admin", "manager"):
        pass  # acceso total
    elif role == "supervisor":
        # Filtro: payload.plant_id == user_plant O user == uid
        # SQLite no soporta JSON ops portables, así que filtramos en Python tras query
        # con un límite ampliado para no perder datos
        rows = q.order_by(AuditLogModel.timestamp.desc()).limit(min(limit * 5, 2000)).all()
        entries = []
        for r in rows:
            if r.user == uid:
                entries.append(r)
                continue
            if user_plant and isinstance(r.payload, dict):
                pid = r.payload.get("plant_id") or r.payload.get("plantId")
                if pid == user_plant:
                    entries.append(r)
            if len(entries) >= limit:
                break
    elif role in ("planner", "engineer", "tecnico"):
        q = q.filter(AuditLogModel.user == uid)
        entries = q.order_by(AuditLogModel.timestamp.desc()).limit(limit).all()
    else:
        raise HTTPException(status_code=403, detail=f"Rol '{role}' no tiene acceso al audit log")

    if role in ("admin", "manager"):
        entries = q.order_by(AuditLogModel.timestamp.desc()).limit(limit).all()
    # Resolve user IDs to usernames
    user_ids = set(e.user for e in entries if e.user and e.user != 'system')
    user_map = {}
    if user_ids:
        from api.database.models import UserModel
        users = db.query(UserModel).filter(UserModel.user_id.in_(user_ids)).all()
        user_map = {u.user_id: u.full_name or u.username for u in users}
    # Resolve WO IDs to WO numbers
    wo_ids = set(e.entity_id for e in entries if e.entity_type in ('managed_work_order', 'work_order') and e.entity_id)
    wo_map = {}
    if wo_ids:
        from api.database.models import ManagedWorkOrderModel
        wos = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id.in_(wo_ids)).all()
        wo_map = {w.wo_id: w.wo_number for w in wos}
    # Resolve WR IDs
    wr_ids = set(e.entity_id for e in entries if e.entity_type == 'work_request' and e.entity_id)
    wr_map = {}
    if wr_ids:
        from api.database.models import WorkRequestModel
        wrs = db.query(WorkRequestModel).filter(WorkRequestModel.request_id.in_(wr_ids)).all()
        wr_map = {w.request_id: w.request_id for w in wrs}
    return [
        {"id": e.id, "entity_type": e.entity_type,
         "entity_id": wo_map.get(e.entity_id, wr_map.get(e.entity_id, e.entity_id)),
         "entity_id_raw": e.entity_id,
         "action": e.action, "user": user_map.get(e.user, e.user), "user_id": e.user,
         "payload": e.payload,
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






# ── Platform Settings (per-plant, in-memory) ──
# Keyed by plant_id; "_global" holds cross-plant defaults.
_platform_settings: dict[str, dict] = {}

_GLOBAL_DEFAULTS = {
    "theme": "light",
    "language": "es",
    "dateFormat": "DD-MM-YYYY",
    "timeFormat": "24h",
    "auditRetentionDays": 365,
    "notificationRetentionDays": 30,
    "sessionTimeoutMinutes": 30,
    "passwordMinLength": 8,
    "twoFactorEnforced": False,
    "rateLimitPerMin": 100,
    "fileUploadMaxMB": 100,
    "ragEnabled": True,
    "agenticEnabled": True,
    "csvInjectionGuard": True,
    "wsAuthRequired": True,
}


_PLANT_DEFAULTS = {
    "OCP-JFC1": {
        "companyName": "OCP Group",
        "timezone": "gmt+1",
        "currency": "mad",
        "defaultPlant": "OCP-JFC1",
    },
    # 0D1 (reunión VSC 2026-05-11): anonimización del cliente real.
    "GOLDFIELDS-SN": {
        "companyName": "Cliente Minero CL-SN",
        "timezone": "gmt-3",
        "currency": "usd",
        "defaultPlant": "GOLDFIELDS-SN",
    },
    "FLUOR-ALFA": {
        "companyName": "Fluor Corporation",
        "timezone": "gmt-5",
        "currency": "usd",
        "defaultPlant": "FLUOR-ALFA",
    },
    "DEMO-CORP": {
        "companyName": "Demo Mining Corporation",
        "timezone": "gmt+0",
        "currency": "usd",
        "defaultPlant": "DEMO-CORP",
    },
}


@router.get("/settings", dependencies=[Depends(require_role("admin", "manager"))])
def get_settings(plant_id: str | None = None):
    """Return platform settings: globals (theme, retention, security flags)
    overlay con plant defaults overlay con stored. Pre-fix retornaba {} sin
    plant_id."""
    key = plant_id or "_global"
    stored = _platform_settings.get(key, {})
    plant_defaults = _PLANT_DEFAULTS.get(plant_id or "", {})
    return {**_GLOBAL_DEFAULTS, **plant_defaults, **stored}


@router.put("/settings", dependencies=[Depends(require_role("admin"))])
def save_settings(data: dict, plant_id: str | None = None):
    """Save platform settings for a given plant (admin only)."""
    key = plant_id or "_global"
    _platform_settings.setdefault(key, {}).update(data)
    return {"status": "saved", "plant_id": key, "settings": _platform_settings[key]}


@router.post("/test-email", dependencies=[Depends(require_role("admin"))])
def test_email(data: dict):
    """Send a test email notification."""
    from api.services.email_service import send_notification, is_configured
    if not is_configured():
        return {"ok": False, "error": "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars."}
    to = data.get("to", "")
    if not to:
        return {"ok": False, "error": "Missing 'to' email address"}
    ok = send_notification(to, "Test Notification", "This is a test email from AMS Platform. If you received this, email notifications are working correctly.")
    return {"ok": ok, "message": f"Email {'sent' if ok else 'failed'} to {to}"}


@router.get("/email-status", dependencies=[Depends(require_role("admin", "manager"))])
def email_status():
    """Check if email is configured."""
    from api.services.email_service import is_configured, SMTP_HOST
    return {"configured": is_configured(), "smtp_host": SMTP_HOST or None}

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


# ── WebSocket Audit (Jorge 2026-04-27) ───────────────────────────────
# Diagnóstico en producción cuando hay sospecha de WS issues / "no se
# actualiza en tiempo real". Ring buffer in-memory de los últimos 300
# eventos (connect/disconnect/broadcast/error) — se pierde al restart.

@router.get("/ws/connections", dependencies=[Depends(require_role("admin", "manager"))])
def ws_connections():
    from api.services.ws_manager import manager
    out = []
    for _ws, meta in manager.meta.items():
        out.append({
            "plant_id": meta.get("plant_id"),
            "client_id": meta.get("client_id"),
            "user_id": meta.get("user_id"),
        })
    by_plant = {p: len(s) for p, s in manager.active.items()}
    return {"total": len(out), "by_plant": by_plant, "connections": out}


@router.get("/ws/audit", dependencies=[Depends(require_role("admin", "manager"))])
def ws_audit_log(limit: int = 200):
    from api.services.ws_manager import get_audit_log
    return {"events": get_audit_log(limit=limit)}


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
