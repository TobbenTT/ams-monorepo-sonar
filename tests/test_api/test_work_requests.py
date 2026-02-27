"""Tests for work requests API endpoints."""

import pytest


class TestWorkRequestEndpoints:

    def _create_work_request(self, client):
        """Helper: submit capture to create a work request."""
        r = client.post("/api/v1/capture/", json={
            "technician_id": "TECH-001",
            "capture_type": "TEXT",
            "language": "en",
            "raw_text_input": "Bearing worn on equipment, vibration detected",
        })
        return r.json()

    def test_list_work_requests_empty(self, client):
        r = client.get("/api/v1/work-requests/")
        assert r.status_code == 200
        assert r.json() == []

    def test_list_work_requests_after_capture(self, client):
        self._create_work_request(client)
        r = client.get("/api/v1/work-requests/")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_get_work_request(self, client):
        data = self._create_work_request(client)
        wr_id = data["work_request_id"]
        r = client.get(f"/api/v1/work-requests/{wr_id}")
        assert r.status_code == 200
        assert r.json()["request_id"] == wr_id

    def test_get_work_request_not_found(self, client):
        r = client.get("/api/v1/work-requests/nonexistent")
        assert r.status_code == 404

    def test_validate_approve(self, client):
        data = self._create_work_request(client)
        wr_id = data["work_request_id"]
        r = client.put(f"/api/v1/work-requests/{wr_id}/validate", json={
            "action": "APPROVE",
        })
        assert r.status_code == 200
        assert r.json()["status"] == "VALIDATED"

    def test_validate_reject(self, client):
        data = self._create_work_request(client)
        wr_id = data["work_request_id"]
        r = client.put(f"/api/v1/work-requests/{wr_id}/validate", json={
            "action": "REJECT",
        })
        assert r.status_code == 200
        assert r.json()["status"] == "REJECTED"

    def test_validate_invalid_action(self, client):
        data = self._create_work_request(client)
        wr_id = data["work_request_id"]
        r = client.put(f"/api/v1/work-requests/{wr_id}/validate", json={
            "action": "INVALID",
        })
        assert r.status_code == 400

    def test_classify_work_request(self, client):
        data = self._create_work_request(client)
        wr_id = data["work_request_id"]
        r = client.post(f"/api/v1/work-requests/{wr_id}/classify")
        assert r.status_code == 200
