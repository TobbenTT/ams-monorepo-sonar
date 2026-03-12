"""Sync router — offline-first sync endpoints for the field PWA (GAP-W03)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import sync_service
from tools.models.schemas import (
    SyncPullRequest,
    SyncPullResponse,
    SyncPushRequest,
    SyncPushResponse,
    SyncConflictResolution,
)

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/pull", response_model=list[SyncPullResponse])
def sync_pull(body: SyncPullRequest, db: Session = Depends(get_db)):
    """Pull changes since last_sync_at for specified entity types.

    Returns delta (created + updated + deleted since timestamp)
    for each requested entity type.
    """
    return sync_service.pull_entities(db, body)


@router.post("/push", response_model=SyncPushResponse)
def sync_push(body: SyncPushRequest, db: Session = Depends(get_db)):
    """Push offline changes to server.

    Accepts a batch of creates/updates from the offline client.
    Detects conflicts by comparing version numbers.
    Returns accepted count + conflict list + server ID mappings.
    """
    return sync_service.apply_push(db, body)


@router.post("/resolve")
def sync_resolve(body: SyncConflictResolution, db: Session = Depends(get_db)):
    """Resolve a specific sync conflict (LOCAL_WINS or SERVER_WINS)."""
    if body.strategy not in ("LOCAL_WINS", "SERVER_WINS"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid strategy: {body.strategy}. Must be LOCAL_WINS or SERVER_WINS.",
        )

    success = sync_service.resolve_conflict(db, body.conflict_id, body.strategy)
    if not success:
        raise HTTPException(status_code=404, detail=f"Conflict {body.conflict_id} not found")

    return {"status": "resolved", "conflict_id": body.conflict_id, "strategy": body.strategy}
