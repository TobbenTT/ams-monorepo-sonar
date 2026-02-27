"""Tests for backlog API endpoints."""

import pytest


class TestBacklogEndpoints:

    def _create_validated_wr(self, client):
        """Helper: create a work request and validate it."""
        r = client.post("/api/v1/capture/", json={
            "technician_id": "TECH-001",
            "capture_type": "TEXT",
            "language": "en",
            "raw_text_input": "Bearing worn on equipment",
        })
        wr_id = r.json()["work_request_id"]
        client.put(f"/api/v1/work-requests/{wr_id}/validate", json={"action": "APPROVE"})
        return wr_id

    def test_list_backlog_empty(self, client):
        r = client.get("/api/v1/backlog/")
        assert r.status_code == 200
        assert r.json() == []

    def test_add_to_backlog(self, client):
        wr_id = self._create_validated_wr(client)
        r = client.post(f"/api/v1/backlog/add/{wr_id}")
        assert r.status_code == 200
        data = r.json()
        assert "backlog_id" in data
        assert data["work_request_id"] == wr_id

    def test_list_backlog_after_add(self, client):
        wr_id = self._create_validated_wr(client)
        client.post(f"/api/v1/backlog/add/{wr_id}")
        r = client.get("/api/v1/backlog/")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_add_not_found(self, client):
        r = client.post("/api/v1/backlog/add/nonexistent")
        assert r.status_code == 404

    def test_optimize_empty(self, client):
        r = client.post("/api/v1/backlog/optimize", json={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        data = r.json()
        assert data["total_items"] == 0

    def test_optimize_with_items(self, seeded_client):
        wr_id = self._create_validated_wr(seeded_client)
        seeded_client.post(f"/api/v1/backlog/add/{wr_id}")
        r = seeded_client.post("/api/v1/backlog/optimize", json={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        data = r.json()
        assert data["total_items"] >= 1
        assert "optimization_id" in data

    def test_get_optimization_not_found(self, client):
        r = client.get("/api/v1/backlog/optimizations/nonexistent")
        assert r.status_code == 404

    def test_approve_schedule(self, seeded_client):
        wr_id = self._create_validated_wr(seeded_client)
        seeded_client.post(f"/api/v1/backlog/add/{wr_id}")
        opt_r = seeded_client.post("/api/v1/backlog/optimize", json={"plant_id": "TEST-PLANT"})
        opt_id = opt_r.json()["optimization_id"]

        r = seeded_client.put(f"/api/v1/backlog/optimizations/{opt_id}/approve")
        assert r.status_code == 200
        assert r.json()["status"] == "APPROVED"

    def test_get_schedule_empty(self, client):
        r = client.get("/api/v1/backlog/schedule")
        assert r.status_code == 200
