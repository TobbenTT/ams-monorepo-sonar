"""Sync service — delta calculation, conflict detection, and resolution for offline mode."""

import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import (
    FieldCaptureModel,
    WorkRequestModel,
    HierarchyNodeModel,
    WorkOrderModel,
    SyncConflictModel,
)
from api.services.audit_service import log_action
from tools.models.schemas import (
    SyncEntityType,
    SyncDeltaItem,
    SyncPullRequest,
    SyncPullResponse,
    SyncPushItem,
    SyncPushRequest,
    SyncPushResponse,
    ConflictRecord,
)


# ── Entity type → ORM model mapping ──────────────────────────────────

_ENTITY_MODEL_MAP = {
    SyncEntityType.CAPTURES: FieldCaptureModel,
    SyncEntityType.WORK_REQUESTS: WorkRequestModel,
    SyncEntityType.WORK_ORDERS: WorkOrderModel,
    SyncEntityType.HIERARCHY_NODES: HierarchyNodeModel,
}

_ENTITY_PK_MAP = {
    SyncEntityType.CAPTURES: "capture_id",
    SyncEntityType.WORK_REQUESTS: "request_id",
    SyncEntityType.WORK_ORDERS: "work_order_id",
    SyncEntityType.HIERARCHY_NODES: "node_id",
}


def _get_modified_at(model_instance) -> datetime:
    """Extract the most relevant timestamp from a model instance."""
    for attr in ("modified_at", "created_at", "calculated_at", "generated_at"):
        val = getattr(model_instance, attr, None)
        if val is not None:
            return val
    return datetime.now()


def _model_to_dict(model_instance, entity_type: SyncEntityType) -> dict:
    """Convert an ORM model to a plain dict for sync transport."""
    result = {}
    for col in model_instance.__table__.columns:
        val = getattr(model_instance, col.name)
        if isinstance(val, datetime):
            val = val.isoformat()
        elif hasattr(val, "isoformat"):
            val = val.isoformat()
        result[col.name] = val
    return result


# ── Pull (server → client) ───────────────────────────────────────────

def calculate_delta(
    db: Session,
    entity_type: SyncEntityType,
    since: datetime,
    limit: int = 100,
) -> SyncPullResponse:
    """Calculate delta items for a given entity type since a timestamp."""
    model_cls = _ENTITY_MODEL_MAP.get(entity_type)
    if model_cls is None:
        return SyncPullResponse(
            entity_type=entity_type,
            items=[],
            server_timestamp=datetime.now(),
            has_more=False,
        )

    pk_field = _ENTITY_PK_MAP[entity_type]

    # Determine the timestamp column to filter on
    ts_col = None
    for attr_name in ("modified_at", "created_at"):
        if hasattr(model_cls, attr_name):
            ts_col = getattr(model_cls, attr_name)
            break

    if ts_col is None:
        # No timestamp column — return all records (hierarchy nodes may lack timestamps)
        query = db.query(model_cls).limit(limit + 1)
    else:
        query = db.query(model_cls).filter(ts_col >= since).order_by(ts_col).limit(limit + 1)

    rows = query.all()
    has_more = len(rows) > limit
    rows = rows[:limit]

    items = []
    for row in rows:
        version = getattr(row, "version", 1)
        items.append(SyncDeltaItem(
            id=getattr(row, pk_field),
            action="updated",  # For delta sync, existing records are "updated"
            data=_model_to_dict(row, entity_type),
            version=version,
            modified_at=_get_modified_at(row),
        ))

    return SyncPullResponse(
        entity_type=entity_type,
        items=items,
        server_timestamp=datetime.now(),
        has_more=has_more,
    )


def pull_entities(
    db: Session,
    request: SyncPullRequest,
) -> list[SyncPullResponse]:
    """Pull deltas for multiple entity types."""
    responses = []
    for entity_type in request.entity_types:
        resp = calculate_delta(db, entity_type, request.since, request.limit)
        responses.append(resp)
    return responses


# ── Push (client → server) ───────────────────────────────────────────

def apply_push(db: Session, request: SyncPushRequest) -> SyncPushResponse:
    """Apply a batch of offline changes to the server."""
    accepted = 0
    conflicts: list[ConflictRecord] = []
    server_ids: dict[str, str] = {}

    for item in request.items:
        result = _apply_single_push(db, item)
        if result["status"] == "accepted":
            accepted += 1
            server_ids[item.local_id] = result["server_id"]
        elif result["status"] == "conflict":
            conflicts.append(result["conflict"])

    if accepted > 0:
        db.commit()

    return SyncPushResponse(
        accepted=accepted,
        conflicts=conflicts,
        server_ids=server_ids,
    )


def _apply_single_push(db: Session, item: SyncPushItem) -> dict:
    """Process a single push item. Returns status dict."""
    if item.entity_type == SyncEntityType.CAPTURES:
        return _push_capture(db, item)
    elif item.entity_type == SyncEntityType.WORK_REQUESTS:
        return _push_work_request(db, item)
    else:
        # Read-only entity types can't be pushed
        return {"status": "rejected", "reason": f"Entity type {item.entity_type} is read-only"}


def _push_capture(db: Session, item: SyncPushItem) -> dict:
    """Push a field capture from offline."""
    if item.action == "create":
        server_id = str(uuid.uuid4())
        data = item.data
        capture = FieldCaptureModel(
            capture_id=server_id,
            technician_id=data.get("technicianId", data.get("technician_id", "UNKNOWN")),
            capture_type=data.get("captureType", data.get("capture_type", "TEXT")),
            language=data.get("language", "en"),
            raw_text=data.get("rawText", data.get("raw_text", "")),
            raw_voice_text=data.get("rawVoiceText", data.get("raw_voice_text")),
            equipment_tag_manual=data.get("equipmentTag", data.get("equipment_tag")),
            location_hint=data.get("locationHint", data.get("location_hint")),
            created_at=item.offline_created_at,
        )
        # Set version if column exists
        if hasattr(capture, "version"):
            capture.version = 1
        if hasattr(capture, "synced_at"):
            capture.synced_at = datetime.now()

        db.add(capture)
        log_action(db, "field_capture", server_id, "CREATE", user=f"offline:{item.local_id}")
        return {"status": "accepted", "server_id": server_id}

    elif item.action == "update":
        # For updates, detect conflicts
        existing = db.query(FieldCaptureModel).filter(
            FieldCaptureModel.capture_id == item.data.get("serverId", item.data.get("server_id"))
        ).first()
        if existing is None:
            return {"status": "rejected", "reason": "Entity not found"}

        existing_version = getattr(existing, "version", 1)
        client_version = item.data.get("version", 1)

        if client_version < existing_version:
            conflict = _create_conflict(
                entity_type=SyncEntityType.CAPTURES,
                entity_id=existing.capture_id,
                local_data=item.data,
                server_data=_model_to_dict(existing, SyncEntityType.CAPTURES),
                local_modified_at=item.offline_created_at,
                server_modified_at=_get_modified_at(existing),
            )
            return {"status": "conflict", "conflict": conflict}

        # Apply update
        if item.data.get("rawText") or item.data.get("raw_text"):
            existing.raw_text = item.data.get("rawText", item.data.get("raw_text"))
        if hasattr(existing, "version"):
            existing.version = existing_version + 1
        if hasattr(existing, "synced_at"):
            existing.synced_at = datetime.now()

        return {"status": "accepted", "server_id": existing.capture_id}

    return {"status": "rejected", "reason": f"Unknown action: {item.action}"}


def _push_work_request(db: Session, item: SyncPushItem) -> dict:
    """Push a work request update from offline."""
    if item.action == "create":
        server_id = str(uuid.uuid4())
        data = item.data
        wr = WorkRequestModel(
            request_id=server_id,
            status=data.get("status", "DRAFT"),
            equipment_id=data.get("equipment_id", ""),
            equipment_tag=data.get("equipment_tag", ""),
            equipment_confidence=float(data.get("equipment_confidence", 0.0)),
            resolution_method=data.get("resolution_method", "MANUAL"),
            problem_description=data.get("problem_description"),
            created_at=item.offline_created_at,
        )
        if hasattr(wr, "version"):
            wr.version = 1
        if hasattr(wr, "synced_at"):
            wr.synced_at = datetime.now()

        db.add(wr)
        log_action(db, "work_request", server_id, "CREATE", user=f"offline:{item.local_id}")
        return {"status": "accepted", "server_id": server_id}

    return {"status": "rejected", "reason": f"Unsupported action: {item.action}"}


# ── Conflict detection & resolution ──────────────────────────────────

def _create_conflict(
    entity_type: SyncEntityType,
    entity_id: str,
    local_data: dict,
    server_data: dict,
    local_modified_at: datetime,
    server_modified_at: datetime,
) -> ConflictRecord:
    """Create a conflict record for differing field values."""
    # Find first differing field
    diff_field = "unknown"
    local_val = ""
    server_val = ""
    for key in local_data:
        if key in server_data and str(local_data[key]) != str(server_data.get(key)):
            diff_field = key
            local_val = str(local_data[key])
            server_val = str(server_data.get(key, ""))
            break

    return ConflictRecord(
        entity_type=entity_type,
        entity_id=entity_id,
        field=diff_field,
        local_value=local_val,
        server_value=server_val,
        local_modified_at=local_modified_at,
        server_modified_at=server_modified_at,
    )


def detect_conflicts(
    local_item: SyncPushItem,
    server_data: dict,
    server_version: int,
    server_modified_at: datetime,
) -> ConflictRecord | None:
    """Detect if a conflict exists between local and server versions."""
    client_version = local_item.data.get("version", 1)
    if client_version < server_version:
        return _create_conflict(
            entity_type=local_item.entity_type,
            entity_id=local_item.data.get("serverId", local_item.data.get("server_id", "")),
            local_data=local_item.data,
            server_data=server_data,
            local_modified_at=local_item.offline_created_at,
            server_modified_at=server_modified_at,
        )
    return None


def resolve_conflict(db: Session, conflict_id: str, strategy: str) -> bool:
    """Resolve a conflict using the given strategy (LOCAL_WINS or SERVER_WINS)."""
    conflict_model = db.query(SyncConflictModel).filter(
        SyncConflictModel.conflict_id == conflict_id
    ).first()

    if conflict_model is None:
        return False

    if strategy == "LOCAL_WINS":
        # Apply local value to server
        model_cls = _ENTITY_MODEL_MAP.get(SyncEntityType(conflict_model.entity_type))
        pk_field = _ENTITY_PK_MAP.get(SyncEntityType(conflict_model.entity_type))
        if model_cls and pk_field:
            entity = db.query(model_cls).filter(
                getattr(model_cls, pk_field) == conflict_model.entity_id
            ).first()
            if entity and hasattr(entity, conflict_model.field):
                setattr(entity, conflict_model.field, conflict_model.local_value)
                if hasattr(entity, "version"):
                    entity.version += 1

    # Mark conflict as resolved
    conflict_model.resolution = strategy
    conflict_model.resolved_at = datetime.now()
    db.commit()
    log_action(db, "sync_conflict", conflict_id, "RESOLVE", user=f"strategy:{strategy}")
    return True
