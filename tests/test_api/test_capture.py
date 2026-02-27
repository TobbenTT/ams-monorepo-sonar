"""Tests for capture API endpoints."""

import pytest


class TestCaptureEndpoints:

    def test_submit_capture_text(self, client):
        r = client.post("/api/v1/capture/", json={
            "technician_id": "TECH-001",
            "technician_name": "Test Tech",
            "capture_type": "TEXT",
            "language": "en",
            "raw_text_input": "Bearing worn on pump BRY-SAG-PP-001",
        })
        assert r.status_code == 200
        data = r.json()
        assert "capture_id" in data
        assert "work_request_id" in data
        assert data["status"] == "DRAFT"

    def test_submit_capture_voice(self, client):
        r = client.post("/api/v1/capture/", json={
            "technician_id": "TECH-002",
            "technician_name": "Voice Tech",
            "capture_type": "VOICE",
            "language": "en",
            "raw_voice_text": "Motor overheating on the crusher line",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "DRAFT"

    def test_list_captures_empty(self, client):
        r = client.get("/api/v1/capture/")
        assert r.status_code == 200
        assert r.json() == []

    def test_list_captures_after_submit(self, client):
        client.post("/api/v1/capture/", json={
            "technician_id": "TECH-001",
            "capture_type": "TEXT",
            "language": "en",
            "raw_text_input": "Test capture",
        })
        r = client.get("/api/v1/capture/")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_get_capture_not_found(self, client):
        r = client.get("/api/v1/capture/nonexistent")
        assert r.status_code == 404
