"""Request-scoped client id for WebSocket echo suppression.

The frontend sends `X-Client-Id` (a per-tab uuid kept in sessionStorage)
on every mutation. Middleware stores it here so queue_notify() can tag
the resulting broadcast with `origin_client_id`. The originating tab
then ignores its own echo in wsSingleton.js.
"""

from contextvars import ContextVar
from typing import Optional

_current_client_id: ContextVar[Optional[str]] = ContextVar("ws_client_id", default=None)


def set_client_id(value: Optional[str]):
    return _current_client_id.set(value or None)


def reset_client_id(token):
    try:
        _current_client_id.reset(token)
    except Exception:
        pass


def get_client_id() -> Optional[str]:
    return _current_client_id.get()
