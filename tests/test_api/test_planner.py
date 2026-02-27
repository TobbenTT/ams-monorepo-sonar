"""Tests for planner API endpoints."""

import pytest


class TestPlannerEndpoints:

    def _create_work_request(self, client):
        """Helper: submit capture to create a work request."""
        r = client.post("/api/v1/capture/", json={
            "technician_id": "TECH-001",
            "capture_type": "TEXT",
            "language": "en",
            "raw_text_input": "Bearing worn on equipment, vibration detected",
        })
        return r.json()

    def test_generate_recommendation(self, seeded_client):
        data = self._create_work_request(seeded_client)
        wr_id = data["work_request_id"]
        r = seeded_client.post(f"/api/v1/planner/recommend/{wr_id}")
        assert r.status_code == 200
        rec = r.json()
        assert "recommendation_id" in rec
        assert "planner_action" in rec
        assert rec["ai_confidence"] > 0

    def test_generate_recommendation_not_found(self, client):
        r = client.post("/api/v1/planner/recommend/nonexistent")
        assert r.status_code == 404

    def test_get_recommendation(self, seeded_client):
        data = self._create_work_request(seeded_client)
        wr_id = data["work_request_id"]
        rec_r = seeded_client.post(f"/api/v1/planner/recommend/{wr_id}")
        rec_id = rec_r.json()["recommendation_id"]

        r = seeded_client.get(f"/api/v1/planner/recommendations/{rec_id}")
        assert r.status_code == 200
        assert r.json()["recommendation_id"] == rec_id

    def test_apply_approve_action(self, seeded_client):
        data = self._create_work_request(seeded_client)
        wr_id = data["work_request_id"]
        rec_r = seeded_client.post(f"/api/v1/planner/recommend/{wr_id}")
        rec_id = rec_r.json()["recommendation_id"]

        r = seeded_client.put(f"/api/v1/planner/recommendations/{rec_id}/action", json={
            "action": "APPROVE",
        })
        assert r.status_code == 200
        assert r.json()["planner_action"] == "APPROVE"

    def test_apply_invalid_action(self, seeded_client):
        data = self._create_work_request(seeded_client)
        wr_id = data["work_request_id"]
        rec_r = seeded_client.post(f"/api/v1/planner/recommend/{wr_id}")
        rec_id = rec_r.json()["recommendation_id"]

        r = seeded_client.put(f"/api/v1/planner/recommendations/{rec_id}/action", json={
            "action": "INVALID",
        })
        assert r.status_code == 400
