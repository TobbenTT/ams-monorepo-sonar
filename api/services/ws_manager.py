"""WebSocket connection manager for real-time updates."""

import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts events."""

    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}  # plant_id -> set of connections

    async def connect(self, websocket: WebSocket, plant_id: str = "global"):
        await websocket.accept()
        if plant_id not in self.active:
            self.active[plant_id] = set()
        self.active[plant_id].add(websocket)
        logger.info("WS connected: plant=%s, total=%d", plant_id, sum(len(v) for v in self.active.values()))

    def disconnect(self, websocket: WebSocket, plant_id: str = "global"):
        if plant_id in self.active:
            self.active[plant_id].discard(websocket)
            if not self.active[plant_id]:
                del self.active[plant_id]
        logger.info("WS disconnected: plant=%s", plant_id)

    async def broadcast(self, event: str, data: dict = None, plant_id: str = None):
        """Broadcast an event to all connected clients (or filtered by plant)."""
        message = json.dumps({"event": event, "data": data or {}, "plant_id": plant_id})
        targets = set()
        if plant_id and plant_id in self.active:
            targets = self.active[plant_id]
        # Also send to "global" listeners
        targets = targets | self.active.get("global", set())

        dead = []
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append((ws, plant_id))

        for ws, pid in dead:
            self.disconnect(ws, pid)


# Singleton
manager = ConnectionManager()


async def notify(event: str, data: dict = None, plant_id: str = None):
    """Helper to broadcast from anywhere in the app."""
    await manager.broadcast(event, data, plant_id)


# Queue for sync code to enqueue notifications
_pending_events = []


def queue_notify(event: str, data: dict = None, plant_id: str = None):
    """Queue a notification from sync code. Flushed by middleware."""
    _pending_events.append((event, data, plant_id))


async def flush_notifications():
    """Send all queued notifications. Called by middleware after response."""
    global _pending_events
    events = _pending_events[:]
    _pending_events = []
    for event, data, plant_id in events:
        await manager.broadcast(event, data, plant_id)
