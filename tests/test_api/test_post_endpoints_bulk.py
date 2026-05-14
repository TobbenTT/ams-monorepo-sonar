"""Smoke bulk POST/PUT/DELETE endpoints — cubre router handlers + validators
+ services hasta el primer error de business logic.

No verifica correctness — solo ejecuta el código. Acepta 4xx / 5xx, solo
asegura que el TestClient no crashe internamente.
"""

import pytest

from api.main import app


def _enumerate_endpoints_by_method(method: str):
    """Devuelve endpoints sin params dinámicos para el método dado."""
    paths = set()
    for r in app.routes:
        methods = getattr(r, "methods", set()) or set()
        path = getattr(r, "path", "")
        if method in methods and "{" not in path and path.startswith("/api/v1/"):
            if any(skip in path for skip in ("/ws/", "/stream", "/download", "/export")):
                continue
            paths.add(path)
    return sorted(paths)


POST_ENDPOINTS = _enumerate_endpoints_by_method("POST")
PUT_ENDPOINTS = _enumerate_endpoints_by_method("PUT")
DELETE_ENDPOINTS = _enumerate_endpoints_by_method("DELETE")


@pytest.mark.parametrize("path", POST_ENDPOINTS)
def test_post_endpoint_smoke(client, path):
    """POST con body vacío — debe responder algo (4xx/5xx OK)."""
    r = client.post(path, json={})
    assert r.status_code < 600


@pytest.mark.parametrize("path", PUT_ENDPOINTS)
def test_put_endpoint_smoke(client, path):
    r = client.put(path, json={})
    assert r.status_code < 600


@pytest.mark.parametrize("path", DELETE_ENDPOINTS)
def test_delete_endpoint_smoke(client, path):
    r = client.delete(path)
    assert r.status_code < 600
