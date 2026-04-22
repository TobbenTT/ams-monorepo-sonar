"""Tests para RCA features Fase 2 del QA 2026-04-22.

Cubre:
- Save Ishikawa branches vía PUT /rca/analyses/{id}
- Save evidence_5p vía PUT
- POST /rca/analyses/{id}/push-to-capa convierte solutions en ImprovementActions
"""

import pytest


class TestRCAPushToCapa:

    def _create_rca(self, seeded_client):
        r = seeded_client.post("/api/v1/rca/analyses", json={
            "event_description": "Fuga aceite hidraulico",
            "plant_id": "TEST-PLANT",
            "equipment_id": seeded_client._test_ids["equipment_node_id"],
        })
        assert r.status_code == 200
        return r.json()["analysis_id"]

    def test_save_ishikawa_branches(self, seeded_client):
        """Ishikawa 6M se guarda en cause_effect.branches."""
        aid = self._create_rca(seeded_client)
        branches = {
            "METODO": ["Procedimiento desactualizado"],
            "MAQUINA": ["Sello roto", "Rodamiento con huelgo"],
            "MATERIAL": [],
            "MANO_OBRA": [],
            "MEDIO_AMBIENTE": [],
            "MEDICION": [],
        }
        r = seeded_client.put(f"/api/v1/rca/analyses/{aid}", json={
            "cause_effect": {"branches": branches},
        })
        assert r.status_code == 200
        # Re-fetch
        got = seeded_client.get(f"/api/v1/rca/analyses/{aid}").json()
        assert got["cause_effect"]["branches"]["MAQUINA"] == ["Sello roto", "Rodamiento con huelgo"]

    def test_save_evidence_5p(self, seeded_client):
        """evidence_5p se guarda como lista de dicts."""
        aid = self._create_rca(seeded_client)
        evidence = [
            {"category": "PARTS", "description": "Rodamiento dañado", "source": "inspección visual", "fragility_score": 4},
            {"category": "PEOPLE", "description": "Operador reportó ruido 2h antes", "source": "testimonio", "fragility_score": 2},
        ]
        r = seeded_client.put(f"/api/v1/rca/analyses/{aid}", json={"evidence_5p": evidence})
        assert r.status_code == 200
        got = seeded_client.get(f"/api/v1/rca/analyses/{aid}").json()
        assert len(got["evidence_5p"]) == 2
        assert got["evidence_5p"][0]["category"] == "PARTS"

    def test_push_to_capa_creates_improvement_actions(self, seeded_client):
        """Las solutions del RCA se convierten en ImprovementActionModel rows."""
        aid = self._create_rca(seeded_client)
        # Cargar solutions via update
        solutions = [
            {"description": "Reemplazar sello cada 6 meses", "type": "PREVENTIVE", "responsible": "Pedro"},
            {"description": "Instalar sensor de vibración", "type": "IMPROVEMENT", "responsible": "Ana"},
        ]
        seeded_client.put(f"/api/v1/rca/analyses/{aid}", json={"capa_actions": solutions})
        r = seeded_client.post(f"/api/v1/rca/analyses/{aid}/push-to-capa")
        assert r.status_code == 200
        data = r.json()
        assert data["created"] == 2

    def test_push_to_capa_idempotent(self, seeded_client):
        """Segundo push no duplica por título."""
        aid = self._create_rca(seeded_client)
        seeded_client.put(f"/api/v1/rca/analyses/{aid}", json={"capa_actions": [
            {"description": "Mismo título", "type": "CORRECTIVE"},
        ]})
        first = seeded_client.post(f"/api/v1/rca/analyses/{aid}/push-to-capa").json()
        second = seeded_client.post(f"/api/v1/rca/analyses/{aid}/push-to-capa").json()
        assert first["created"] == 1
        assert second["created"] == 0
        assert second["skipped"] == 1

    def test_push_to_capa_empty_solutions(self, seeded_client):
        """Sin solutions no hay error, solo mensaje."""
        aid = self._create_rca(seeded_client)
        r = seeded_client.post(f"/api/v1/rca/analyses/{aid}/push-to-capa")
        assert r.status_code == 200
        data = r.json()
        assert data["created"] == 0
