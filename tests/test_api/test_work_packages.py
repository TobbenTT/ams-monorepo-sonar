"""Tests for work packages API endpoints."""

import pytest


class TestWorkPackageEndpoints:

    def test_list_work_packages_empty(self, client):
        r = client.get("/api/v1/work-packages/")
        assert r.status_code == 200
        assert r.json() == []

    def test_create_work_package(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        r = seeded_client.post("/api/v1/work-packages/", json={
            "name": "12W SAG MILL 001 ONLINE",
            "code": "WP-001",
            "node_id": eq_id,
            "frequency_value": 90,
            "frequency_unit": "DAYS",
            "constraint": "ONLINE",
            "access_time_hours": 0,
            "work_package_type": "STANDALONE",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "12W SAG MILL 001 ONLINE"
        assert data["status"] == "DRAFT"

    def test_get_work_package(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        create_r = seeded_client.post("/api/v1/work-packages/", json={
            "name": "WP TEST", "code": "WP-002", "node_id": eq_id,
            "frequency_value": 30, "frequency_unit": "DAYS",
            "constraint": "ONLINE", "access_time_hours": 0, "work_package_type": "STANDALONE",
        })
        wp_id = create_r.json()["work_package_id"]
        r = seeded_client.get(f"/api/v1/work-packages/{wp_id}")
        assert r.status_code == 200
        assert r.json()["code"] == "WP-002"

    def test_approve_work_package(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        create_r = seeded_client.post("/api/v1/work-packages/", json={
            "name": "WP APPROVE", "code": "WP-003", "node_id": eq_id,
            "frequency_value": 30, "frequency_unit": "DAYS",
            "constraint": "ONLINE", "access_time_hours": 0, "work_package_type": "STANDALONE",
        })
        wp_id = create_r.json()["work_package_id"]
        r = seeded_client.put(f"/api/v1/work-packages/{wp_id}/approve")
        assert r.status_code == 200
        assert r.json()["status"] == "APPROVED"

    def test_approve_nonexistent_wp(self, client):
        r = client.put("/api/v1/work-packages/nonexistent/approve")
        assert r.status_code == 409

    def test_group_tasks(self, client):
        r = client.post("/api/v1/work-packages/group", json={
            "items": [
                {"backlog_id": "B1", "equipment_id": "EQ-001", "equipment_tag": "SAG-001",
                 "area_code": "BRY", "priority": "3", "specialties_required": ["FITTER"],
                 "shutdown_required": False, "materials_ready": True, "estimated_hours": 4.0},
                {"backlog_id": "B2", "equipment_id": "EQ-001", "equipment_tag": "SAG-001",
                 "area_code": "BRY", "priority": "3", "specialties_required": ["FITTER"],
                 "shutdown_required": False, "materials_ready": True, "estimated_hours": 2.0},
            ]
        })
        assert r.status_code == 200
        groups = r.json()
        assert isinstance(groups, list)
        assert len(groups) > 0

    def test_get_wp_not_found(self, client):
        r = client.get("/api/v1/work-packages/nonexistent")
        assert r.status_code == 404
