"""Tests for admin API endpoints."""

import pytest


class TestAdminEndpoints:

    def test_stats_empty(self, client):
        r = client.get("/api/v1/admin/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["plants"] == 0

    def test_stats_with_data(self, seeded_client):
        r = seeded_client.get("/api/v1/admin/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["plants"] == 1
        assert data["total_nodes"] == 4

    def test_audit_log_empty(self, client):
        r = client.get("/api/v1/admin/audit-log")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_audit_log_after_action(self, seeded_client):
        # The seeded_client fixture creates a plant, which generates audit entries
        # But it's inserted directly, not via service. Let's create one via API.
        seeded_client.post("/api/v1/hierarchy/plants", json={"plant_id": "P-AUDIT", "name": "Audit Test"})
        r = seeded_client.get("/api/v1/admin/audit-log")
        assert r.status_code == 200
        entries = r.json()
        assert len(entries) > 0

    def test_agent_status(self, client):
        r = client.get("/api/v1/admin/agent-status")
        assert r.status_code == 200
        data = r.json()
        assert "api_key_configured" in data
        assert "agents_available" in data

    def test_reset_database(self, client):
        # Create some data first
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "P-RESET", "name": "Reset Test"})
        # Reset
        r = client.delete("/api/v1/admin/reset-database")
        assert r.status_code == 200
        # Verify empty
        r2 = client.get("/api/v1/hierarchy/plants")
        assert r2.json() == []
