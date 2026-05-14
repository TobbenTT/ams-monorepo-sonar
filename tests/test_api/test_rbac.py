"""RBAC integration tests — verifica que require_role() bloquea correctamente
endpoints sensibles según el rol del JWT (SF-699).

Estrategia: override get_current_user con un usuario de rol arbitrario y
verificar que admin-only endpoints devuelven 403 para roles no permitidos
y 2xx/4xx-no-403 para roles permitidos.
"""

import pytest
from fastapi.testclient import TestClient

from api.database.connection import get_db
from api.database.models import UserModel
from api.dependencies.auth import get_current_user
from api.main import app


def _user(role: str) -> UserModel:
    return UserModel(
        user_id=f"test-user-{role}",
        username=f"test_{role}",
        hashed_password="not-used",
        role=role,
        is_active=True,
    )


@pytest.fixture
def client_as(db_session):
    """Factory: devuelve TestClient autenticado con el rol que pidas."""
    def _factory(role: str) -> TestClient:
        def _override_db():
            try:
                yield db_session
            finally:
                pass

        async def _override_user():
            return _user(role)

        app.dependency_overrides[get_db] = _override_db
        app.dependency_overrides[get_current_user] = _override_user
        return TestClient(app)

    yield _factory
    app.dependency_overrides.clear()


# ── endpoints admin-only ────────────────────────────────────────────
ADMIN_ONLY = [
    ("POST", "/api/v1/auth/register", {"email": "x@y.com", "username": "x", "password": "Abc12345!", "full_name": "X", "role": "technician"}),
    ("GET", "/api/v1/auth/users", None),
    ("POST", "/api/v1/admin/seed-database", None),
    ("DELETE", "/api/v1/admin/reset-database", None),
    ("POST", "/api/v1/cost-centers/seed-defaults", None),
]

# ── endpoints admin+manager ─────────────────────────────────────────
ADMIN_MANAGER = [
    ("GET", "/api/v1/admin/settings", None),
    ("POST", "/api/v1/cost-centers/", {"code": "CC1", "name": "Test", "plant_id": "TEST-PLANT"}),
]


@pytest.mark.parametrize("method,path,body", ADMIN_ONLY)
@pytest.mark.parametrize("role", ["technician", "planner", "manager", "supervisor"])
def test_admin_only_blocks_non_admin(client_as, method, path, body, role):
    """Cualquier rol != 'admin' debe recibir 403 en endpoints admin-only."""
    c = client_as(role)
    r = c.request(method, path, json=body)
    assert r.status_code == 403, (
        f"{role} accedió a {method} {path} (status={r.status_code}, "
        f"esperaba 403). Body: {r.text[:200]}"
    )


@pytest.mark.parametrize("method,path,body", ADMIN_ONLY)
def test_admin_only_allows_admin(client_as, method, path, body):
    """admin NO debe recibir 403 (puede recibir 4xx/2xx por lógica, pero no 403)."""
    c = client_as("admin")
    r = c.request(method, path, json=body)
    assert r.status_code != 403, (
        f"admin recibió 403 en {method} {path}. Body: {r.text[:200]}"
    )


@pytest.mark.parametrize("method,path,body", ADMIN_MANAGER)
@pytest.mark.parametrize("role", ["technician", "planner", "supervisor"])
def test_admin_manager_blocks_other_roles(client_as, method, path, body, role):
    """Endpoints admin+manager: bloquean technician/planner/supervisor."""
    c = client_as(role)
    r = c.request(method, path, json=body)
    assert r.status_code == 403, f"{role} accedió a {path} (status={r.status_code})"


@pytest.mark.parametrize("method,path,body", ADMIN_MANAGER)
@pytest.mark.parametrize("role", ["admin", "manager"])
def test_admin_manager_allows_both(client_as, method, path, body, role):
    c = client_as(role)
    r = c.request(method, path, json=body)
    assert r.status_code != 403, f"{role} recibió 403 en {path}"


def test_unauthenticated_returns_401(db_session):
    """Sin token → 401 (no 403). Verifica el contrato HTTPBearer."""
    def _override_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = _override_db
    try:
        c = TestClient(app)
        r = c.get("/api/v1/admin/settings")
        assert r.status_code == 401
    finally:
        app.dependency_overrides.clear()
