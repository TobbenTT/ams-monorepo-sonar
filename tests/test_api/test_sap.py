"""Tests for SAP API endpoints."""

import pytest


class TestSAPEndpoints:

    def test_generate_upload(self, client):
        r = client.post("/api/v1/sap/generate-upload", json={
            "plant_code": "OCP-JFC1",
            "maintenance_plan": {"plan_id": "MP-001", "description": "Test plan"},
            "maintenance_items": [],
            "task_lists": [],
        })
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "GENERATED"
        assert "package_id" in data

    def test_list_uploads(self, client):
        client.post("/api/v1/sap/generate-upload", json={
            "plant_code": "OCP-JFC1", "maintenance_plan": {}, "maintenance_items": [], "task_lists": [],
        })
        r = client.get("/api/v1/sap/uploads")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_get_upload(self, client):
        create_r = client.post("/api/v1/sap/generate-upload", json={
            "plant_code": "OCP-JFC1", "maintenance_plan": {}, "maintenance_items": [], "task_lists": [],
        })
        pkg_id = create_r.json()["package_id"]
        r = client.get(f"/api/v1/sap/uploads/{pkg_id}")
        assert r.status_code == 200
        assert r.json()["plant_code"] == "OCP-JFC1"

    def test_get_upload_not_found(self, client):
        r = client.get("/api/v1/sap/uploads/nonexistent")
        assert r.status_code == 404

    def test_validate_state_transition_valid(self, client):
        r = client.post("/api/v1/sap/validate-transition", json={
            "entity_type": "approval",
            "current_state": "DRAFT",
            "target_state": "REVIEWED",
        })
        assert r.status_code == 200
        assert r.json()["valid"] is True

    def test_validate_state_transition_invalid(self, client):
        r = client.post("/api/v1/sap/validate-transition", json={
            "entity_type": "approval",
            "current_state": "DRAFT",
            "target_state": "APPROVED",
        })
        assert r.status_code == 200
        assert r.json()["valid"] is False

    def test_mock_data_unknown_transaction(self, client):
        r = client.get("/api/v1/sap/mock/UNKNOWN")
        assert r.status_code == 404
