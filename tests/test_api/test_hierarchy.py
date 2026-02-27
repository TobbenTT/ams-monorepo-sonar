"""Tests for hierarchy API endpoints."""

import pytest


class TestHierarchyEndpoints:

    def test_root(self, client):
        r = client.get("/")
        assert r.status_code == 200
        assert "modules" in r.json()

    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_list_plants_empty(self, client):
        r = client.get("/api/v1/hierarchy/plants")
        assert r.status_code == 200
        assert r.json() == []

    def test_create_plant(self, client):
        r = client.post("/api/v1/hierarchy/plants", json={"plant_id": "P1", "name": "Plant 1"})
        assert r.status_code == 200
        assert r.json()["plant_id"] == "P1"

    def test_list_plants_after_create(self, client):
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "P1", "name": "Plant 1"})
        r = client.get("/api/v1/hierarchy/plants")
        assert len(r.json()) == 1

    def test_create_node(self, seeded_client):
        import uuid
        r = seeded_client.post("/api/v1/hierarchy/nodes", json={
            "node_id": str(uuid.uuid4()),
            "node_type": "SUB_ASSEMBLY",
            "name": "Drive System",
            "code": "BRY-SAG-ML-001-SA01",
            "parent_node_id": seeded_client._test_ids["equipment_node_id"],
            "level": 5,
            "plant_id": "TEST-PLANT",
        })
        assert r.status_code == 200
        assert r.json()["node_type"] == "SUB_ASSEMBLY"

    def test_get_node(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        r = seeded_client.get(f"/api/v1/hierarchy/nodes/{eq_id}")
        assert r.status_code == 200
        assert r.json()["name"] == "SAG Mill #1"

    def test_get_node_not_found(self, client):
        r = client.get("/api/v1/hierarchy/nodes/nonexistent")
        assert r.status_code == 404

    def test_list_nodes_by_type(self, seeded_client):
        r = seeded_client.get("/api/v1/hierarchy/nodes", params={"node_type": "EQUIPMENT"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["node_type"] == "EQUIPMENT"

    def test_get_subtree(self, seeded_client):
        plant_id = seeded_client._test_ids["plant_node_id"]
        r = seeded_client.get(f"/api/v1/hierarchy/nodes/{plant_id}/tree")
        assert r.status_code == 200
        assert len(r.json()) == 4  # plant, area, system, equipment

    def test_node_stats(self, seeded_client):
        r = seeded_client.get("/api/v1/hierarchy/stats", params={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        stats = r.json()
        assert stats["EQUIPMENT"] == 1
        assert stats["PLANT"] == 1
