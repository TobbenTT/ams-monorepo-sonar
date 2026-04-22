"""Tests para el flujo FMECA completo (Fase 1 + 3 del QA 2026-04-22).

Cubre:
- POST /fmea/fmeca/worksheets con equipment_id
- GET /fmea/fmeca/worksheets-summary (endpoint nuevo, no flattened)
- POST /fmea/fmeca/worksheets/{id}/rows con S/O/D → RPN
- POST /fmea/fmeca/worksheets/{id}/push-to-backlog crea BacklogItems (Fase 3c)
- GET /fmea/fmeca/suggestions detecta equipos con P1/P2 sin worksheet (Fase 3a)
"""

import pytest
from datetime import datetime


class TestFMECAWorksheets:

    def _create(self, seeded_client, tag_suffix="TEST"):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        r = seeded_client.post("/api/v1/fmea/fmeca/worksheets", json={
            "equipment_id": eq_id,
            "equipment_tag": f"BRY-{tag_suffix}",
            "equipment_name": f"Equipo {tag_suffix}",
            "analyst": "pytest",
        })
        assert r.status_code == 200
        return r.json()["worksheet_id"]

    def test_create_worksheet(self, seeded_client):
        ws_id = self._create(seeded_client)
        assert ws_id.startswith("FMECA-")

    def test_summary_endpoint_returns_worksheet_not_row(self, seeded_client):
        """El nuevo /worksheets-summary devuelve 1 entry por worksheet, no flattened."""
        self._create(seeded_client, "SUM1")
        r = seeded_client.get("/api/v1/fmea/fmeca/worksheets-summary", params={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        assert all("worksheet_id" in x and "row_count" in x and "max_rpn" in x for x in items)

    def test_summary_includes_equipment_criticality(self, seeded_client):
        """Summary debe incluir criticidad del equipo (Fase 4c cross-wire)."""
        self._create(seeded_client, "CRIT")
        r = seeded_client.get("/api/v1/fmea/fmeca/worksheets-summary", params={"plant_id": "TEST-PLANT"})
        ws = r.json()[0]
        assert "equipment_criticality" in ws
        # El seed pone criticality='AA' en el equipo
        assert ws["equipment_criticality"] == "AA"

    def test_add_row_computes_rpn(self, seeded_client):
        ws_id = self._create(seeded_client, "RPN")
        r = seeded_client.post(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/rows", json={
            "function_description": "Transportar pulpa",
            "functional_failure": "No transporta",
            "failure_mode": "Rodamiento agarrotado",
            "failure_effect": "Parada de línea",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "severity": 8, "occurrence": 5, "detection": 4,
        })
        assert r.status_code == 200
        row = r.json()["row"]
        assert row["rpn"] == 8 * 5 * 4  # 160
        assert row["rpn_category"] == "HIGH"

    def test_push_to_backlog(self, seeded_client):
        """Fase 3c — push-to-backlog crea BacklogItem rows desde filas con strategy."""
        from api.database.models import BacklogItemModel
        ws_id = self._create(seeded_client, "PUSH")
        # Crear fila con consecuencia para que run-decisions le asigne strategy
        seeded_client.post(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/rows", json={
            "function_description": "Enfriar",
            "functional_failure": "Sobre-temperatura",
            "failure_mode": "Fuga de refrigerante",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "severity": 8, "occurrence": 5, "detection": 4,
        })
        # Run decisions para que RCM engine asigne strategy_type
        seeded_client.put(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/run-decisions")
        # Push
        r = seeded_client.post(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/push-to-backlog")
        assert r.status_code == 200
        data = r.json()
        assert data["created"] >= 1

    def test_push_to_backlog_idempotent(self, seeded_client):
        """Segundo push no duplica items."""
        ws_id = self._create(seeded_client, "IDEM")
        seeded_client.post(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/rows", json={
            "function_description": "F", "functional_failure": "FF",
            "failure_mode": "FM", "failure_consequence": "EVIDENT_OPERATIONAL",
            "severity": 7, "occurrence": 4, "detection": 3,
        })
        seeded_client.put(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/run-decisions")
        first = seeded_client.post(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/push-to-backlog").json()
        second = seeded_client.post(f"/api/v1/fmea/fmeca/worksheets/{ws_id}/push-to-backlog").json()
        assert first["created"] >= 1
        assert second["created"] == 0
        assert second["skipped"] >= 1


class TestFMECASuggestions:

    def test_suggestions_empty_without_closed_wos(self, seeded_client):
        """Sin OTs P1/P2 cerradas, no hay sugerencias."""
        r = seeded_client.get("/api/v1/fmea/fmeca/suggestions", params={"plant_id": "TEST-PLANT"})
        assert r.status_code == 200
        assert r.json() == []

    def test_suggestions_lists_equipment_with_p1_closures(self, seeded_client, db_session):
        """Equipo con OT P1 CERRADO y sin worksheet debe aparecer."""
        from api.database.models import ManagedWorkOrderModel
        from datetime import datetime, timedelta
        eq_id = seeded_client._test_ids["equipment_node_id"]
        db_session.add(ManagedWorkOrderModel(
            wo_number="OT-TEST-001",
            equipment_id=eq_id,
            equipment_tag="BRY-SAG-ML-001",
            description="Falla crítica",
            wo_type="PM03",
            priority_code="P1",
            status="CERRADO",
            plant_id="TEST-PLANT",
            closed_at=datetime.now() - timedelta(days=3),
        ))
        db_session.commit()
        r = seeded_client.get("/api/v1/fmea/fmeca/suggestions", params={"plant_id": "TEST-PLANT"})
        items = r.json()
        assert any(x["equipment_id"] == eq_id for x in items)
        sug = next(x for x in items if x["equipment_id"] == eq_id)
        assert sug["critical_closure_count"] >= 1
