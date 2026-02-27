"""Tests for tasks API endpoints."""

import pytest


class TestTaskEndpoints:

    def test_list_tasks_empty(self, client):
        r = client.get("/api/v1/tasks/")
        assert r.status_code == 200
        assert r.json() == []

    def test_validate_task_name_valid(self, client):
        r = client.post("/api/v1/tasks/validate-name", json={
            "name": "Inspect bearing condition",
            "task_type": "INSPECT",
        })
        assert r.status_code == 200
        assert "issues" in r.json()

    def test_validate_task_name_too_long(self, client):
        r = client.post("/api/v1/tasks/validate-name", json={
            "name": "A" * 80,
            "task_type": "INSPECT",
        })
        assert r.status_code == 200
        assert r.json()["valid"] is False

    def test_validate_wp_name_valid(self, client):
        r = client.post("/api/v1/tasks/validate-wp-name", json={
            "name": "12W SAG MILL 001 ONLINE",
        })
        assert r.status_code == 200
        assert "issues" in r.json()

    def test_validate_wp_name_too_long(self, client):
        r = client.post("/api/v1/tasks/validate-wp-name", json={
            "name": "A" * 50,
        })
        assert r.status_code == 200
        assert r.json()["valid"] is False

    def test_create_task(self, client):
        r = client.post("/api/v1/tasks/", json={
            "name": "Inspect bearing vibration",
            "name_fr": "Inspecter vibration roulement",
            "task_type": "INSPECT",
            "constraint": "ONLINE",
            "access_time_hours": 0,
            "frequency_value": 90,
            "frequency_unit": "DAYS",
            "consequences": "Bearing failure if not detected",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["task_type"] == "INSPECT"
        assert data["status"] == "DRAFT"

    def test_get_task(self, client):
        create_r = client.post("/api/v1/tasks/", json={
            "name": "Test task", "name_fr": "", "task_type": "CHECK",
            "constraint": "ONLINE", "access_time_hours": 0,
            "frequency_value": 30, "frequency_unit": "DAYS", "consequences": "Test",
        })
        task_id = create_r.json()["task_id"]
        r = client.get(f"/api/v1/tasks/{task_id}")
        assert r.status_code == 200
        assert r.json()["name"] == "Test task"

    def test_get_task_not_found(self, client):
        r = client.get("/api/v1/tasks/nonexistent")
        assert r.status_code == 404
