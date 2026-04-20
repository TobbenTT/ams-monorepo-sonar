"""Tests for Managed Work Orders — 3 critical flows (Jose/Jorge Phase 2).

Covers:
1. Status transitions — valid path and rejection of invalid ones (incl. 2-step EN_PROGRAMACION → PROGRAMADO).
2. Reservar preserves assignments — schedule_wo() called without workers must keep existing
   planned_start/assigned_workers (the 2-step "Reservar Semana" flow from Jose).
3. Batch close — closing N completed WOs sequentially all succeed (Bandeja de Cierre).
"""

import pytest


def _create_wo(client, plant_id="TEST-PLANT", priority="P3", equipment_tag="BRY-SAG-ML-001"):
    """Helper: create a WO and return its dict."""
    r = client.post("/api/v1/managed-work-orders/", json={
        "equipment_tag": equipment_tag,
        "description": "Test WO",
        "wo_type": "PM01",
        "priority_code": priority,
        "plant_id": plant_id,
        "estimated_hours": 4.0,
    })
    assert r.status_code == 200, r.text
    return r.json()


class TestStatusTransitions:
    """2-step flow (Jose): CREADO → LIBERADO → PLANIFICADO → EN_PROGRAMACION → PROGRAMADO."""

    def test_full_happy_path_transitions(self, seeded_client):
        wo = _create_wo(seeded_client)
        wo_id = wo["wo_id"]
        assert wo["status"] == "CREADO"

        # CREADO → LIBERADO
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/release")
        assert r.status_code == 200
        # "release" endpoint is an alias for plan() → goes to PLANIFICADO
        assert r.json()["status"] == "PLANIFICADO"

        # PLANIFICADO → EN_PROGRAMACION (via generic update)
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}", json={"status": "EN_PROGRAMACION"})
        assert r.status_code == 200
        assert r.json()["status"] == "EN_PROGRAMACION"

        # EN_PROGRAMACION → PROGRAMADO (Reservar)
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/schedule", json={})
        assert r.status_code == 200
        assert r.json()["status"] == "PROGRAMADO"

        # PROGRAMADO → EN_EJECUCION
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/start")
        assert r.status_code == 200
        assert r.json()["status"] == "EN_EJECUCION"

        # EN_EJECUCION → CERRADO
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/close")
        assert r.status_code == 200
        assert r.json()["status"] == "CERRADO"

    def test_invalid_transition_rejected(self, seeded_client):
        """CERRADO is final — no further transitions allowed."""
        wo = _create_wo(seeded_client)
        wo_id = wo["wo_id"]

        # Walk WO to CERRADO
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/release")
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}", json={"status": "EN_PROGRAMACION"})
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/schedule", json={})
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/start")
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/close")

        # Attempt to start again — must fail (service returns None → 400)
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/start")
        assert r.status_code == 400

    def test_fast_track_p1_goes_to_programado(self, seeded_client):
        """P1/P2 priorities skip planning and land directly in PROGRAMADO."""
        wo = _create_wo(seeded_client, priority="P1")
        assert wo["status"] == "PROGRAMADO"
        assert wo["is_fast_track"] is True


class TestReservarPreservesAssignments:
    """Critical for Jose's 2-step flow: Reservar must not clear planned_start/workers."""

    def test_schedule_without_workers_preserves_existing(self, seeded_client, db_session):
        """schedule_wo called twice — second call (Reservar) must preserve workers from first."""
        wo = _create_wo(seeded_client)
        wo_id = wo["wo_id"]

        # Advance to EN_PROGRAMACION with assigned workers + dates
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/release")
        seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}", json={
            "status": "EN_PROGRAMACION",
            "planned_start": "2026-05-01T08:00:00",
            "planned_end": "2026-05-01T12:00:00",
            "assigned_workers": [{"worker_id": "WKR-TEST-001", "name": "Test Technician 1"}],
        })

        # Now "Reservar" — transition to PROGRAMADO with no body (the individual Reservar button)
        r = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/schedule", json={})
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "PROGRAMADO"
        # Workers and planned dates must be preserved (regression guard for Jose's flow)
        assert body["assigned_workers"], "assigned_workers was wiped by Reservar"
        assert body["assigned_workers"][0]["worker_id"] == "WKR-TEST-001"
        assert body["planned_start"] is not None


class TestBatchClose:
    """Bandeja de Cierre: close many WOs in sequence — all must succeed."""

    def test_batch_close_n_work_orders(self, seeded_client):
        """Create 5 WOs, walk them to EN_EJECUCION, close all sequentially."""
        ids = []
        for _ in range(5):
            wo = _create_wo(seeded_client)
            wo_id = wo["wo_id"]
            seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/release")
            seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}", json={"status": "EN_PROGRAMACION"})
            seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/schedule", json={})
            seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/start")
            ids.append(wo_id)

        # Batch close loop (mirrors Execution.jsx handleBatchClose)
        closed = 0
        for wo_id in ids:
            r1 = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}", json={
                "actual_hours": 3.5,
                "labor_cost": 3.5 * 50,
                "actual_total_cost": 3.5 * 50,
            })
            assert r1.status_code == 200
            r2 = seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}/close")
            assert r2.status_code == 200
            assert r2.json()["status"] == "CERRADO"
            closed += 1

        assert closed == 5

        # Verify all show up in list filter status=CERRADO
        r = seeded_client.get("/api/v1/managed-work-orders/?status=CERRADO&plant_id=TEST-PLANT")
        assert r.status_code == 200
        assert len([wo for wo in r.json() if wo["wo_id"] in ids]) == 5
