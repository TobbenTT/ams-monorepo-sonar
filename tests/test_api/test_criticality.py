"""Tests for criticality API endpoints."""

import pytest

SAMPLE_CRITERIA = [
    {"category": "SAFETY", "consequence_level": 4},
    {"category": "HEALTH", "consequence_level": 3},
    {"category": "ENVIRONMENT", "consequence_level": 2},
    {"category": "PRODUCTION", "consequence_level": 3},
    {"category": "OPERATING_COST", "consequence_level": 2},
    {"category": "CAPITAL_COST", "consequence_level": 1},
    {"category": "SCHEDULE", "consequence_level": 2},
    {"category": "REVENUE", "consequence_level": 3},
    {"category": "COMMUNICATIONS", "consequence_level": 2},
    {"category": "COMPLIANCE", "consequence_level": 3},
    {"category": "REPUTATION", "consequence_level": 2},
]


class TestCriticalityEndpoints:

    def test_assess_criticality(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        r = seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id,
            "criteria_scores": SAMPLE_CRITERIA,
            "probability": 3,
        })
        assert r.status_code == 200
        data = r.json()
        assert "risk_class" in data
        assert "overall_score" in data
        assert data["status"] == "DRAFT"

    def test_get_assessment(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id, "criteria_scores": SAMPLE_CRITERIA, "probability": 3,
        })
        r = seeded_client.get(f"/api/v1/criticality/{eq_id}")
        assert r.status_code == 200
        assert r.json()["node_id"] == eq_id

    def test_get_assessment_not_found(self, seeded_client):
        r = seeded_client.get("/api/v1/criticality/nonexistent")
        assert r.status_code == 404

    def test_approve_assessment(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        create_r = seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id, "criteria_scores": SAMPLE_CRITERIA, "probability": 3,
        })
        assessment_id = create_r.json()["assessment_id"]
        r = seeded_client.put(f"/api/v1/criticality/{assessment_id}/approve")
        assert r.status_code == 200
        assert r.json()["status"] == "APPROVED"

    def test_determine_risk_class(self, client):
        r = client.post("/api/v1/criticality/risk-class", json={"overall_score": 85})
        assert r.status_code == 200
        assert "risk_class" in r.json()

    def test_determine_risk_class_low(self, client):
        r = client.post("/api/v1/criticality/risk-class", json={"overall_score": 3})
        assert r.json()["risk_class"] == "I_LOW"

    def test_determine_risk_class_critical(self, client):
        r = client.post("/api/v1/criticality/risk-class", json={"overall_score": 90})
        assert r.json()["risk_class"] == "IV_CRITICAL"
