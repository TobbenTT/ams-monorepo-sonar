"""API tests for RCA & Defect Elimination router — Phase 8."""

from datetime import date, timedelta

import pytest


class TestRCAEndpoints:
    """Tests for /api/v1/rca/* endpoints."""

    def test_create_rca(self, client):
        resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "SAG Mill gearbox bearing failure",
            "plant_id": "TEST-PLANT",
            "equipment_id": "BRY-SAG-ML-001",
            "max_consequence": 4,
            "frequency": 3,
            "team_members": ["J. Garcia", "M. Benali"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "analysis_id" in data
        assert data["level"] in ("1", "2", "3")
        assert data["status"] == "OPEN"

    def test_create_rca_level_classification(self, client):
        # High consequence x frequency => Level 3
        resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "Catastrophic pump failure",
            "plant_id": "TEST-PLANT",
            "max_consequence": 5,
            "frequency": 4,
        })
        assert resp.status_code == 200
        assert resp.json()["level"] == "3"

        # Low consequence x frequency => Level 1
        resp2 = client.post("/api/v1/rca/analyses", json={
            "event_description": "Minor valve leak",
            "plant_id": "TEST-PLANT",
            "max_consequence": 1,
            "frequency": 2,
        })
        assert resp2.status_code == 200
        assert resp2.json()["level"] == "1"

    def test_list_rcas(self, client):
        # Create two analyses
        client.post("/api/v1/rca/analyses", json={
            "event_description": "Event A", "plant_id": "TEST-PLANT",
        })
        client.post("/api/v1/rca/analyses", json={
            "event_description": "Event B", "plant_id": "TEST-PLANT",
        })
        resp = client.get("/api/v1/rca/analyses", params={"plant_id": "TEST-PLANT"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_get_rca(self, client):
        create_resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "Belt conveyor alignment issue",
            "plant_id": "TEST-PLANT",
        })
        analysis_id = create_resp.json()["analysis_id"]
        resp = client.get(f"/api/v1/rca/analyses/{analysis_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["event_description"] == "Belt conveyor alignment issue"
        assert data["status"] == "OPEN"

    def test_get_rca_not_found(self, client):
        resp = client.get("/api/v1/rca/analyses/nonexistent-id")
        assert resp.status_code == 404

    def test_run_5w2h(self, client):
        create_resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "Pump seal failure",
            "plant_id": "TEST-PLANT",
        })
        analysis_id = create_resp.json()["analysis_id"]

        resp = client.post(f"/api/v1/rca/analyses/{analysis_id}/5w2h", json={
            "what": "Pump seal failed causing leak",
            "when": "2026-02-20 08:30",
            "where": "SAG Mill lubrication system",
            "who": "Maintenance crew A",
            "why": "Seal degradation from heat exposure",
            "how": "Visible oil leak at shaft seal",
            "how_much": "4 hours downtime, $5000 repair cost",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "5w2h" in data
        assert "WHAT" in data["5w2h"]["report"]

    def test_rca_summary(self, client):
        client.post("/api/v1/rca/analyses", json={
            "event_description": "Event 1", "plant_id": "P1",
        })
        client.post("/api/v1/rca/analyses", json={
            "event_description": "Event 2", "plant_id": "P1",
        })
        resp = client.get("/api/v1/rca/analyses/summary", params={"plant_id": "P1"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        assert data["open"] == 2

    def test_advance_rca_status(self, client):
        create_resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "Gearbox failure",
            "plant_id": "TEST-PLANT",
        })
        analysis_id = create_resp.json()["analysis_id"]

        # OPEN -> UNDER_INVESTIGATION
        resp = client.put(f"/api/v1/rca/analyses/{analysis_id}/advance", json={
            "status": "UNDER_INVESTIGATION",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "UNDER_INVESTIGATION"

        # UNDER_INVESTIGATION -> COMPLETED
        resp2 = client.put(f"/api/v1/rca/analyses/{analysis_id}/advance", json={
            "status": "COMPLETED",
        })
        assert resp2.status_code == 200
        assert resp2.json()["status"] == "COMPLETED"


class TestPlanningKPIEndpoints:
    """Tests for /api/v1/rca/planning-kpis/* endpoints."""

    def _sample_input(self):
        today = date.today()
        return {
            "plant_id": "TEST-PLANT",
            "period_start": (today - timedelta(days=7)).isoformat(),
            "period_end": today.isoformat(),
            "wo_planned": 100, "wo_completed": 92,
            "manhours_planned": 800.0, "manhours_actual": 780.0,
            "pm_planned": 50, "pm_executed": 48,
            "backlog_hours": 300.0, "weekly_capacity_hours": 200.0,
            "corrective_count": 15, "total_wo": 100,
            "schedule_compliance_planned": 90,
            "schedule_compliance_executed": 82,
            "release_horizon_days": 5,
            "pending_notices": 12, "total_notices": 100,
            "scheduled_capacity_hours": 170.0,
            "total_capacity_hours": 200.0,
            "proactive_wo": 75, "planned_wo": 88,
        }

    def test_calculate_planning_kpis(self, client):
        resp = client.post("/api/v1/rca/planning-kpis/calculate", json=self._sample_input())
        assert resp.status_code == 200
        data = resp.json()
        assert "kpis" in data
        assert "overall_health" in data
        assert len(data["kpis"]) == 11

    def test_planning_kpis_health_calculation(self, client):
        resp = client.post("/api/v1/rca/planning-kpis/calculate", json=self._sample_input())
        data = resp.json()
        assert data["overall_health"] in ("HEALTHY", "AT_RISK", "CRITICAL")
        assert data["on_target_count"] + data["below_target_count"] == 11

    def test_list_planning_kpi_snapshots(self, client):
        client.post("/api/v1/rca/planning-kpis/calculate", json=self._sample_input())
        resp = client.get("/api/v1/rca/planning-kpis", params={"plant_id": "TEST-PLANT"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["plant_id"] == "TEST-PLANT"


class TestDEKPIEndpoints:
    """Tests for /api/v1/rca/de-kpis/* endpoints."""

    def _sample_input(self):
        today = date.today()
        return {
            "plant_id": "TEST-PLANT",
            "period_start": (today - timedelta(days=30)).isoformat(),
            "period_end": today.isoformat(),
            "events_reported": 18, "events_required": 20,
            "meetings_held": 9, "meetings_required": 10,
            "actions_implemented": 14, "actions_planned": 16,
            "savings_achieved": 85000.0, "savings_target": 100000.0,
            "failures_current": 8, "failures_previous": 12,
        }

    def test_calculate_de_kpis(self, client):
        resp = client.post("/api/v1/rca/de-kpis/calculate", json=self._sample_input())
        assert resp.status_code == 200
        data = resp.json()
        assert "kpis" in data
        assert "health" in data
        kpis = data["kpis"]["kpis"]
        assert len(kpis) == 5

    def test_de_kpis_health_assessment(self, client):
        resp = client.post("/api/v1/rca/de-kpis/calculate", json=self._sample_input())
        data = resp.json()
        health = data["health"]
        assert health["maturity_level"] in ("INITIAL", "DEVELOPING", "ESTABLISHED", "OPTIMIZING")
        assert 0 <= health["program_score"] <= 100

    def test_list_de_kpi_snapshots(self, client):
        client.post("/api/v1/rca/de-kpis/calculate", json=self._sample_input())
        resp = client.get("/api/v1/rca/de-kpis", params={"plant_id": "TEST-PLANT"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["plant_id"] == "TEST-PLANT"
        assert data[0]["maturity_level"] in ("INITIAL", "DEVELOPING", "ESTABLISHED", "OPTIMIZING")
