"""WebSocket connection manager for real-time updates."""

import json
import logging
import time
from collections import deque
from typing import Dict, Set, Optional, Deque
from fastapi import WebSocket

logger = logging.getLogger(__name__)


# Jorge 2026-04-27: ring buffer auditor para diagnosticar problemas WS en
# producción. Guarda los últimos N eventos (connect/disconnect/broadcast/
# errors) accesibles por GET /api/v1/admin/ws/audit.
_AUDIT_MAX = 300
_audit_log: Deque[dict] = deque(maxlen=_AUDIT_MAX)


def _audit(event_type: str, **kwargs) -> None:
    try:
        _audit_log.append({
            "ts": time.time(),
            "type": event_type,
            **kwargs,
        })
    except Exception:
        pass


def get_audit_log(limit: int = 200) -> list[dict]:
    """Returns the last N audit entries (newest first)."""
    items = list(_audit_log)
    items.reverse()
    return items[:limit]


class ConnectionManager:
    """Manages WebSocket connections and broadcasts events.

    Tracks per-connection metadata (client_id, user_id) so we can
    suppress echo events to the originating client and expose presence.
    """

    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}  # plant_id -> set of connections
        self.meta: Dict[WebSocket, dict] = {}        # ws -> {plant_id, client_id, user_id}

    async def connect(
        self,
        websocket: WebSocket,
        plant_id: str = "global",
        client_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ):
        await websocket.accept()
        # Jorge 2026-04-24 14:18: REVERT del kick estricto — causaba 401 al
        # guardar cuando el mismo usuario tenía 2 tabs. Ahora sólo emite
        # warning visual "shared_account" sin kickear (comportamiento original).
        # Si querés volver al kick, descomenta el bloque de arriba del commit
        # 25a3c6f.
        pass
        if plant_id not in self.active:
            self.active[plant_id] = set()
        self.active[plant_id].add(websocket)
        self.meta[websocket] = {
            "plant_id": plant_id,
            "client_id": client_id,
            "user_id": user_id,
        }
        total = sum(len(v) for v in self.active.values())
        logger.info(
            "WS connected: plant=%s client=%s user=%s total=%d",
            plant_id, client_id, user_id, total,
        )
        _audit("connect", plant_id=plant_id, client_id=client_id, user_id=user_id, total=total)

    def disconnect(self, websocket: WebSocket, plant_id: str = "global"):
        pid = plant_id
        m = self.meta.pop(websocket, None)
        if m:
            pid = m.get("plant_id", plant_id)
        if pid in self.active:
            self.active[pid].discard(websocket)
            if not self.active[pid]:
                del self.active[pid]
        logger.info("WS disconnected: plant=%s", pid)
        client_id = (m or {}).get("client_id") if m else None
        user_id = (m or {}).get("user_id") if m else None
        _audit("disconnect", plant_id=pid, client_id=client_id, user_id=user_id)

    def presence_for_user(self, user_id: str) -> int:
        """Return how many live sockets a given user has open (across plants)."""
        if not user_id:
            return 0
        return sum(1 for m in self.meta.values() if m.get("user_id") == user_id)

    async def broadcast(
        self,
        event: str,
        data: dict = None,
        plant_id: str = None,
        origin_client_id: Optional[str] = None,
    ):
        """Broadcast an event to all connected clients (or filtered by plant).

        If `origin_client_id` is set, the connection that initiated the mutation
        will still receive the message but tagged so the UI can skip re-applying
        its own change. That prevents edit-in-progress from being clobbered by
        its own echo when two tabs share the same account.
        """
        payload = {
            "event": event,
            "data": data or {},
            "plant_id": plant_id,
            "origin_client_id": origin_client_id,
        }
        message = json.dumps(payload)
        targets = set()
        if plant_id:
            # broadcast dirigido a un plant específico + global
            if plant_id in self.active:
                targets = set(self.active[plant_id])
            targets |= self.active.get("global", set())
        else:
            # Sin plant_id → broadcast a TODOS los conectados (any plant).
            # Bug QA 2026-04-22: antes iba solo a 'global' → kick_all_users
            # no llegaba a nadie porque los clientes están en sus plants.
            for ws_set in self.active.values():
                targets |= ws_set

        dead = []
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception as e:
                dead.append(ws)
                _audit("send_error", event=event, error=str(e)[:120])

        _audit(
            "broadcast",
            event=event,
            plant_id=plant_id,
            targets=len(targets),
            delivered=len(targets) - len(dead),
            dead=len(dead),
        )

        for ws in dead:
            m = self.meta.get(ws) or {}
            self.disconnect(ws, m.get("plant_id", "global"))


# Singleton
manager = ConnectionManager()


async def notify(
    event: str,
    data: dict = None,
    plant_id: str = None,
    origin_client_id: Optional[str] = None,
):
    """Helper to broadcast from anywhere in the app."""
    await manager.broadcast(event, data, plant_id, origin_client_id=origin_client_id)


# Queue for sync code to enqueue notifications
_pending_events = []


def queue_notify(
    event: str,
    data: dict = None,
    plant_id: str = None,
    origin_client_id: Optional[str] = None,
):
    """Queue a notification from sync code. Flushed by middleware.

    If no `origin_client_id` is given, falls back to the request-scoped
    X-Client-Id header captured by middleware so the originating tab
    can suppress its own echo automatically.
    """
    if origin_client_id is None:
        try:
            from api.services.ws_client_context import get_client_id
            origin_client_id = get_client_id()
        except Exception:
            origin_client_id = None
    _pending_events.append((event, data, plant_id, origin_client_id))


async def flush_notifications():
    """Send all queued notifications. Called by middleware after response."""
    global _pending_events
    events = _pending_events[:]
    _pending_events = []
    for event, data, plant_id, origin_client_id in events:
        await manager.broadcast(event, data, plant_id, origin_client_id=origin_client_id)
