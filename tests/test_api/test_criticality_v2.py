"""Tests for criticality features agregadas en Fase 4 (QA 2026-04-22).

Cubre:
- GET /criticality/by-plant lista assessments por planta.
- Approve propaga risk_class → hierarchy_nodes.criticality (letra AA/A+/A/B).
"""

import pytest


SAMPLE_CRITERIA = [
    {"category": "SAFETY", "consequence_level": 5},
    {"category": "PRODUCTION", "consequence_level": 5},
    {"category": "ENVIRONMENT", "consequence_level": 2},
    {"category": "OPERATING_COST", "consequence_level": 3},
    {"category": "SCHEDULE", "consequence_level": 3},
    {"category": "COMPLIANCE", "consequence_level": 2},
]


class TestCriticalityByPlant:

    def test_list_by_plant_empty(self, seeded_client):
        """Sin evaluaciones, el endpoint igual devuelve los equipos del plant."""
        r = seeded_client.get("/api/v1/criticality/by-plant", params={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Todos los equipos sin assessment (assessment_id=None)
        assert any(x["assessment_id"] is None for x in data)

    def test_list_by_plant_after_assess(self, seeded_client):
        """Después de crear una evaluación, aparece con overall_score y letter."""
        eq_id = seeded_client._test_ids["equipment_node_id"]
        seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id, "criteria_scores": SAMPLE_CRITERIA, "probability": 5,
        })
        r = seeded_client.get("/api/v1/criticality/by-plant", params={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        data = r.json()
        assessed = [x for x in data if x["node_id"] == eq_id]
        assert len(assessed) == 1
        assert assessed[0]["assessment_id"] is not None
        assert assessed[0]["overall_score"] is not None
        # Score = max(5) * probabilidad(5) = 25 → IV_CRITICAL → AA
        assert assessed[0]["letter"] == "AA"

    def test_approve_propagates_letter_to_node(self, seeded_client):
        """Approve debe copiar AA/A+/A/B al campo hierarchy_nodes.criticality."""
        from api.database.models import HierarchyNodeModel
        eq_id = seeded_client._test_ids["equipment_node_id"]

        create_r = seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id, "criteria_scores": SAMPLE_CRITERIA, "probability": 5,
        })
        assessment_id = create_r.json()["assessment_id"]
        approve_r = seeded_client.put(f"/api/v1/criticality/{assessment_id}/approve")
        assert approve_r.status_code == 200

        # Verificar via by-plant endpoint
        list_r = seeded_client.get("/api/v1/criticality/by-plant", params={"plant_id": "TEST-PLANT"})
        row = next(x for x in list_r.json() if x["node_id"] == eq_id)
        assert row["status"] == "APPROVED"
        assert row["node_criticality"] == "AA"   # propagado al nodo

    def test_low_risk_mapping(self, seeded_client):
        """Score bajo (I_LOW) → letra B en el nodo."""
        eq_id = seeded_client._test_ids["equipment_node_id"]
        low_criteria = [
            {"category": "SAFETY", "consequence_level": 1},
            {"category": "PRODUCTION", "consequence_level": 1},
        ]
        create_r = seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id, "criteria_scores": low_criteria, "probability": 2,
        })
        aid = create_r.json()["assessment_id"]
        seeded_client.put(f"/api/v1/criticality/{aid}/approve")
        list_r = seeded_client.get("/api/v1/criticality/by-plant", params={"plant_id": "TEST-PLANT"})
        row = next(x for x in list_r.json() if x["node_id"] == eq_id)
        assert row["letter"] == "B"
