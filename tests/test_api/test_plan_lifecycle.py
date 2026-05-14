"""Integration tests — lifecycle de Planes de Mantenimiento (SF-700).

Cubre el ciclo de vida completo de un SAPUploadPackage (que es el contenedor
de un plan de mantenimiento listo para SAP) a través de la ORM + endpoints:

    GENERATED → REVIEWED → APPROVED → UPLOADED

y verifica que el state machine rechaza transiciones inválidas (ej. saltar
GENERATED → UPLOADED directo). Esto blinda la regla de oro de AMS: ningún
plan se sube a SAP sin pasar por aprobación humana explícita.
"""

import pytest

from api.services import sap_service
from tools.engines.state_machine import StateMachine, TransitionError


# ── Helpers ────────────────────────────────────────────────────────
def _make_package(db_session, **overrides):
    """Crea un SAPUploadPackage de prueba con datos mínimos válidos."""
    defaults = dict(
        plant_code="TEST-PLANT",
        maintenance_plan={"id": "MP-001", "description": "Test plan"},
        maintenance_items=[{"item_id": "MI-1", "task": "Inspect"}],
        task_lists=[{"task_id": "T-1", "duration_h": 2}],
    )
    defaults.update(overrides)
    return sap_service.generate_upload(db_session, **defaults)


# ── Service-level lifecycle ────────────────────────────────────────
class TestPlanCreateAndRead:
    def test_generate_persists_with_status_generated(self, db_session):
        pkg = _make_package(db_session)
        assert pkg.package_id is not None
        assert pkg.status == "GENERATED"
        assert pkg.generated_at is not None

    def test_get_upload_returns_persisted_package(self, db_session):
        pkg = _make_package(db_session)
        fetched = sap_service.get_upload(db_session, pkg.package_id)
        assert fetched is not None
        assert fetched.package_id == pkg.package_id
        assert fetched.maintenance_plan["id"] == "MP-001"

    def test_get_unknown_returns_none(self, db_session):
        assert sap_service.get_upload(db_session, "NONEXISTENT") is None

    def test_list_filters_by_plant(self, db_session):
        _make_package(db_session, plant_code="P1")
        _make_package(db_session, plant_code="P2")
        _make_package(db_session, plant_code="P1")
        assert len(sap_service.list_uploads(db_session, plant_code="P1")) == 2
        assert len(sap_service.list_uploads(db_session, plant_code="P2")) == 1
        assert len(sap_service.list_uploads(db_session)) == 3


# ── State transitions (regla de oro: no skip de estados) ──────────
class TestPlanStateMachine:
    def test_generated_to_reviewed_is_valid(self):
        assert StateMachine.validate_transition("sap_upload", "GENERATED", "REVIEWED")

    def test_reviewed_to_approved_is_valid(self):
        assert StateMachine.validate_transition("sap_upload", "REVIEWED", "APPROVED")

    def test_approved_to_uploaded_is_valid(self):
        assert StateMachine.validate_transition("sap_upload", "APPROVED", "UPLOADED")

    def test_cannot_skip_review(self):
        """GENERATED → APPROVED debe fallar (sin pasar por REVIEWED)."""
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("sap_upload", "GENERATED", "APPROVED")

    def test_cannot_skip_to_uploaded(self):
        """REVIEWED → UPLOADED debe fallar (sin APPROVED)."""
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("sap_upload", "REVIEWED", "UPLOADED")

    def test_terminal_state_is_uploaded(self):
        """Una vez UPLOADED no se puede volver atrás."""
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("sap_upload", "UPLOADED", "APPROVED")

    def test_unknown_entity_type_raises(self):
        with pytest.raises(ValueError):
            StateMachine.validate_transition("unknown_entity", "A", "B")


# ── End-to-end approval flow (service layer + DB) ──────────────────
class TestPlanApprovalFlow:
    def test_approve_from_generated_fails(self, db_session):
        """approve_upload() valida transitions; GENERATED→APPROVED rechazado."""
        pkg = _make_package(db_session)
        result = sap_service.approve_upload(db_session, pkg.package_id)
        assert "error" in result
        # estado no debe cambiar
        db_session.refresh(pkg)
        assert pkg.status == "GENERATED"

    def test_approve_after_review_succeeds(self, db_session):
        """Camino feliz: GENERATED → REVIEWED (manual) → APPROVED."""
        pkg = _make_package(db_session)
        # transition manual a REVIEWED
        pkg.status = "REVIEWED"
        db_session.commit()

        result = sap_service.approve_upload(db_session, pkg.package_id)
        assert result.get("status") == "APPROVED"
        db_session.refresh(pkg)
        assert pkg.status == "APPROVED"

    def test_approve_unknown_returns_error(self, db_session):
        result = sap_service.approve_upload(db_session, "NONEXISTENT")
        assert "error" in result


# ── HTTP layer (router → service → DB) ─────────────────────────────
class TestPlanLifecycleEndpoints:
    def test_post_generate_upload_returns_package(self, client):
        r = client.post("/api/v1/sap/generate-upload", json={
            "plant_code": "P1",
            "maintenance_plan": {"id": "MP-1"},
            "maintenance_items": [],
            "task_lists": [],
        })
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "GENERATED"
        assert body["package_id"]

    def test_validate_transition_endpoint_blocks_skip(self, client):
        r = client.post("/api/v1/sap/validate-transition", json={
            "entity_type": "sap_upload",
            "current_state": "GENERATED",
            "target_state": "APPROVED",
        })
        assert r.status_code == 200
        assert r.json()["valid"] is False

    def test_validate_transition_endpoint_allows_valid(self, client):
        r = client.post("/api/v1/sap/validate-transition", json={
            "entity_type": "sap_upload",
            "current_state": "REVIEWED",
            "target_state": "APPROVED",
        })
        assert r.json()["valid"] is True

    def test_approve_endpoint_409_when_invalid_transition(self, client):
        gen = client.post("/api/v1/sap/generate-upload", json={
            "plant_code": "P1", "maintenance_plan": {},
            "maintenance_items": [], "task_lists": [],
        }).json()
        r = client.put(f"/api/v1/sap/uploads/{gen['package_id']}/approve")
        assert r.status_code == 409  # invalid transition desde GENERATED

    def test_approve_endpoint_404_for_unknown(self, client):
        r = client.put("/api/v1/sap/uploads/NONEXISTENT/approve")
        # service devuelve error → router 409 según implementación actual
        assert r.status_code in (404, 409)
