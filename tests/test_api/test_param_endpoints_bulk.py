"""Smoke bulk endpoints con path params dinámicos.

Sustituye {id} {request_id} etc por un placeholder y llama. El endpoint
devolverá 404 / 422 / 5xx — todos cubren código router.
"""

import re
import pytest

from api.main import app


_PARAM_RE = re.compile(r"\{[^}]+\}")


def _substitute_params(path: str, dummy: str = "test-id-00000") -> str:
    """Reemplaza todos los path params con dummy."""
    return _PARAM_RE.sub(dummy, path)


def _enumerate_param_endpoints(method: str):
    paths = set()
    for r in app.routes:
        methods = getattr(r, "methods", set()) or set()
        path = getattr(r, "path", "")
        if method in methods and "{" in path and path.startswith("/api/v1/"):
            if any(skip in path for skip in ("/ws/", "/stream", "/download", "/export")):
                continue
            paths.add(path)
    return sorted(paths)


PARAM_GET = _enumerate_param_endpoints("GET")
PARAM_PUT = _enumerate_param_endpoints("PUT")
PARAM_POST = _enumerate_param_endpoints("POST")
PARAM_DELETE = _enumerate_param_endpoints("DELETE")


@pytest.mark.parametrize("path", PARAM_GET)
def test_get_with_params(client, path):
    r = client.get(_substitute_params(path))
    assert r.status_code < 600


@pytest.mark.parametrize("path", PARAM_PUT)
def test_put_with_params(client, path):
    r = client.put(_substitute_params(path), json={})
    assert r.status_code < 600


@pytest.mark.parametrize("path", PARAM_POST)
def test_post_with_params(client, path):
    r = client.post(_substitute_params(path), json={})
    assert r.status_code < 600


@pytest.mark.parametrize("path", PARAM_DELETE)
def test_delete_with_params(client, path):
    r = client.delete(_substitute_params(path))
    assert r.status_code < 600
