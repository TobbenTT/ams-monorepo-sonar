"""Tests for FMEA API endpoints."""

import pytest


class TestFMEAEndpoints:

    def test_validate_valid_combination(self, client):
        r = client.get("/api/v1/fmea/validate-fm", params={
            "mechanism": "WEARS", "cause": "MECHANICAL_OVERLOAD",
        })
        assert r.status_code == 200
        assert r.json()["valid"] is True

    def test_validate_invalid_combination(self, client):
        r = client.get("/api/v1/fmea/validate-fm", params={
            "mechanism": "WEARS", "cause": "LIGHTNING",
        })
        assert r.status_code == 200
        assert r.json()["valid"] is False

    def test_get_all_fm_combinations(self, client):
        r = client.get("/api/v1/fmea/fm-combinations")
        assert r.status_code == 200
        data = r.json()
        assert data["total_combinations"] == 72
        assert "WEARS" in data["mechanisms"]

    def test_get_causes_for_mechanism(self, client):
        r = client.get("/api/v1/fmea/fm-combinations", params={"mechanism": "CORRODES"})
        assert r.status_code == 200
        data = r.json()
        assert "causes" in data
        assert len(data["causes"]) > 0
        assert "CHEMICAL_ATTACK" in data["causes"]

    def test_rcm_decide_condition_based(self, client):
        r = client.post("/api/v1/fmea/rcm-decide", json={
            "is_hidden": False,
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "cbm_technically_feasible": True,
            "cbm_economically_viable": True,
            "ft_feasible": True,
            "failure_pattern": "B_AGE",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["strategy_type"] == "CONDITION_BASED"
        assert "path" in data

    def test_rcm_decide_run_to_failure(self, client):
        r = client.post("/api/v1/fmea/rcm-decide", json={
            "is_hidden": False,
            "failure_consequence": "EVIDENT_NONOPERATIONAL",
            "cbm_technically_feasible": False,
            "cbm_economically_viable": False,
            "ft_feasible": False,
            "failure_pattern": "E_RANDOM",
        })
        assert r.status_code == 200
        assert r.json()["strategy_type"] == "RUN_TO_FAILURE"

    def test_list_failure_modes_empty(self, client):
        r = client.get("/api/v1/fmea/failure-modes")
        assert r.status_code == 200
        assert r.json() == []

    def test_create_failure_mode(self, seeded_client):
        import uuid
        # First create function and functional failure
        eq_id = seeded_client._test_ids["equipment_node_id"]
        func_r = seeded_client.post("/api/v1/fmea/functions", json={
            "node_id": eq_id, "function_type": "PRIMARY", "description": "Grind ore",
        })
        func_id = func_r.json()["function_id"]

        ff_r = seeded_client.post("/api/v1/fmea/functional-failures", json={
            "function_id": func_id, "failure_type": "TOTAL", "description": "Cannot grind ore",
        })
        ff_id = ff_r.json()["failure_id"]

        r = seeded_client.post("/api/v1/fmea/failure-modes", json={
            "functional_failure_id": ff_id,
            "what": "Bearing",
            "mechanism": "WEARS",
            "cause": "MECHANICAL_OVERLOAD",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "strategy_type": "CONDITION_BASED",
            "is_hidden": False,
        })
        assert r.status_code == 200
        assert r.json()["what"] == "Bearing"

    def test_create_failure_mode_invalid_combo(self, seeded_client):
        import uuid
        eq_id = seeded_client._test_ids["equipment_node_id"]
        func_r = seeded_client.post("/api/v1/fmea/functions", json={
            "node_id": eq_id, "function_type": "PRIMARY", "description": "Test",
        })
        ff_r = seeded_client.post("/api/v1/fmea/functional-failures", json={
            "function_id": func_r.json()["function_id"], "failure_type": "TOTAL", "description": "Test",
        })
        r = seeded_client.post("/api/v1/fmea/failure-modes", json={
            "functional_failure_id": ff_r.json()["failure_id"],
            "what": "Bearing",
            "mechanism": "WEARS",
            "cause": "LIGHTNING",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "strategy_type": "CONDITION_BASED",
            "is_hidden": False,
        })
        assert r.status_code == 422
