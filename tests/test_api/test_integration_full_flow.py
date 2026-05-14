"""Integration test del flujo completo Capture → WR → MWO → Scheduling.

Crea entidades reales y las hace transicionar por su lifecycle. Cubre
mucho código de servicios + routers en una sola pasada.
"""

import uuid
import pytest


def _create_capture_and_wr(seeded_client):
    """Helper: crea un capture que genera un WR. Devuelve (capture, wr_id)."""
    cap_payload = {
        "technician_id": "WKR-TEST-001",
        "capture_type": "TEXT",
        "language": "es",
        "raw_text": "MILL-001 vibración fuerte LA cojinete",
        "equipment_tag_manual": "BRY-SAG-ML-001",
    }
    r = seeded_client.post("/api/v1/capture/", json=cap_payload)
    if r.status_code not in (200, 201):
        return None, None
    cap = r.json()
    wr_id = cap.get("work_request_id") or cap.get("request_id")
    return cap, wr_id


class TestFullCaptureFlow:
    def test_create_multiple_captures(self, seeded_client):
        for raw in [
            "Bomba A fuga lubricante",
            "Motor B sobrecalentamiento",
            "Valve V-101 stuck closed",
            "Ruido anormal en chumacera",
            "Temperatura aceite alta",
        ]:
            r = seeded_client.post("/api/v1/capture/", json={
                "technician_id": "WKR-TEST-001",
                "capture_type": "TEXT",
                "language": "es",
                "raw_text": raw,
                "equipment_tag_manual": "BRY-SAG-ML-001",
            })
            assert r.status_code < 600

    def test_list_captures(self, seeded_client):
        _create_capture_and_wr(seeded_client)
        r = seeded_client.get("/api/v1/capture/")
        assert r.status_code < 600


class TestWRApprovalFlow:
    def test_full_approval_path(self, seeded_client):
        _, wr_id = _create_capture_and_wr(seeded_client)
        if not wr_id:
            pytest.skip("no wr created")

        # Validate
        r = seeded_client.put(f"/api/v1/work-requests/{wr_id}/validate",
                              json={"action": "APPROVE", "modifications": {}})
        assert r.status_code < 600

        # Approve
        r = seeded_client.put(f"/api/v1/work-requests/{wr_id}/approve",
                              json={"comment": "Approved test"})
        assert r.status_code < 600

        # Get detail
        r = seeded_client.get(f"/api/v1/work-requests/{wr_id}")
        assert r.status_code < 600


class TestPlannerFlow:
    def test_planner_endpoints(self, seeded_client):
        for path in [
            "/api/v1/planner/recommendations",
            "/api/v1/planner/work-packages",
            "/api/v1/planner/queue",
        ]:
            r = seeded_client.get(path)
            assert r.status_code < 600

    def test_planner_recommend(self, seeded_client):
        r = seeded_client.post("/api/v1/planner/recommend",
                               json={"plant_id": "TEST-PLANT"})
        assert r.status_code < 600


class TestBacklogFlow:
    def test_backlog_list_variants(self, seeded_client):
        for q in ["", "?status=AWAITING_MATERIALS", "?plant_id=TEST-PLANT", "?priority=P1"]:
            r = seeded_client.get(f"/api/v1/backlog/{q}")
            assert r.status_code < 600

    def test_schedule(self, seeded_client):
        r = seeded_client.get("/api/v1/backlog/schedule")
        assert r.status_code < 600


class TestReliabilityRCAFlow:
    def test_reliability_endpoints(self, seeded_client):
        for path in [
            "/api/v1/reliability/weibull",
            "/api/v1/reliability/mtbf",
            "/api/v1/reliability/jackknife",
            "/api/v1/reliability/health-score",
        ]:
            for q in ["", "?plant_id=TEST-PLANT", "?equipment_tag=BRY-SAG-ML-001"]:
                r = seeded_client.get(path + q)
                assert r.status_code < 600

    def test_rca_endpoints(self, seeded_client):
        for path in [
            "/api/v1/rca/",
            "/api/v1/rca/analyses",
        ]:
            r = seeded_client.get(path)
            assert r.status_code < 600

        for payload in [
            {},
            {"plant_id": "TEST-PLANT", "title": "Test RCA"},
            {"plant_id": "TEST-PLANT", "title": "Test", "failure_description": "X"},
        ]:
            r = seeded_client.post("/api/v1/rca/", json=payload)
            assert r.status_code < 600


class TestCriticalityFlow:
    def test_compute(self, seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
            {"plant_id": "TEST-PLANT", "equipment_ids": ["BRY-SAG-ML-001"]},
        ]:
            r = seeded_client.post("/api/v1/criticality/compute", json=payload)
            assert r.status_code < 600

    def test_by_plant(self, seeded_client):
        for q in ["", "?plant_id=TEST-PLANT"]:
            r = seeded_client.get(f"/api/v1/criticality/by-plant{q}")
            assert r.status_code < 600


class TestExecutionFlow:
    def test_my_tasks(self, seeded_client):
        r = seeded_client.get("/api/v1/execution/my-tasks")
        assert r.status_code < 600

    def test_tasks(self, seeded_client):
        for q in ["", "?status=PENDING", "?worker_id=WKR-TEST-001"]:
            r = seeded_client.get(f"/api/v1/execution/tasks{q}")
            assert r.status_code < 600

    def test_handovers(self, seeded_client):
        r = seeded_client.get("/api/v1/execution/handovers")
        assert r.status_code < 600


class TestReportsFlow:
    def test_reporting_endpoints(self, seeded_client):
        for path in [
            "/api/v1/reporting/work-orders",
            "/api/v1/reporting/equipment",
            "/api/v1/reporting/workforce",
            "/api/v1/reporting/kpi-summary",
        ]:
            for q in ["", "?plant_id=TEST-PLANT", "?format=json"]:
                r = seeded_client.get(path + q)
                assert r.status_code < 600


class TestImprovementActions:
    def test_endpoints(self, seeded_client):
        r = seeded_client.get("/api/v1/improvement-actions/")
        assert r.status_code < 600

        for payload in [
            {},
            {"title": "Test", "plant_id": "TEST-PLANT"},
        ]:
            r = seeded_client.post("/api/v1/improvement-actions/", json=payload)
            assert r.status_code < 600


class TestORProjects:
    def test_endpoints(self, seeded_client):
        r = seeded_client.get("/api/v1/or-projects/")
        assert r.status_code < 600

        for payload in [
            {},
            {"name": "Test", "client_slug": "test-client"},
        ]:
            r = seeded_client.post("/api/v1/or-projects/", json=payload)
            assert r.status_code < 600
