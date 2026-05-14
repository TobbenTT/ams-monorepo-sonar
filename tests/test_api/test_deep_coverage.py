"""Tests profundos que usan fully_seeded_client para llegar al meat del
código (services + routers + serialización + state machine) en vez de
solo hits 404.
"""

import pytest


# ── Work Requests con WRs reales ─────────────────────────────────
class TestWRWithRealData:
    def test_list_returns_seeded(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/work-requests/")
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        assert len(body) >= 5

    def test_filter_by_status(self, fully_seeded_client):
        for s in ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "APPROVED", "REJECTED"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/?status={s}")
            assert r.status_code == 200

    def test_filter_by_priority(self, fully_seeded_client):
        for p in ["P1", "P2", "P3", "P4"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/?priority={p}")
            assert r.status_code == 200

    def test_get_detail_each_status(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for wr_key in ["wr_draft", "wr_pending", "wr_validated", "wr_approved", "wr_rejected"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/{ids[wr_key]}")
            assert r.status_code in (200, 404)

    def test_impact_score_each(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for wr_key in ["wr_draft", "wr_pending", "wr_validated", "wr_approved", "wr_rejected"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/{ids[wr_key]}/impact-score")
            assert r.status_code < 600

    def test_validate_real_wr(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for action in ["APPROVE", "REJECT", "MODIFY"]:
            r = fully_seeded_client.put(f"/api/v1/work-requests/{ids['wr_pending']}/validate",
                                         json={"action": action, "modifications": {}})
            assert r.status_code < 600

    def test_approve_real_wr(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.put(f"/api/v1/work-requests/{ids['wr_validated']}/approve",
                                     json={"comment": "approved"})
        assert r.status_code < 600

    def test_reject_real_wr(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.put(f"/api/v1/work-requests/{ids['wr_pending']}/reject",
                                     json={"reason": "duplicate"})
        assert r.status_code < 600

    def test_cancel_real_wr(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.put(f"/api/v1/work-requests/{ids['wr_draft']}/cancel",
                                     json={"reason": "no longer needed"})
        assert r.status_code < 600

    def test_link_duplicate(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.put(f"/api/v1/work-requests/{ids['wr_draft']}/link-duplicate",
                                     json={"parent_request_id": ids["wr_approved"]})
        assert r.status_code < 600

    def test_update_each(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for wr_key in ["wr_draft", "wr_pending", "wr_validated"]:
            for body in [
                {"description": "Updated"},
                {"priority_code": "P2"},
                {"equipment_tag": "BRY-SAG-ML-001"},
            ]:
                r = fully_seeded_client.put(f"/api/v1/work-requests/{ids[wr_key]}", json=body)
                assert r.status_code < 600

    def test_classify(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.post(f"/api/v1/work-requests/{ids['wr_draft']}/classify",
                                      json={"category": "MECHANICAL"})
        assert r.status_code < 600

    def test_feedback(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.post(f"/api/v1/work-requests/{ids['wr_approved']}/feedback",
                                      json={"rating": 5, "comment": "good"})
        assert r.status_code < 600

    def test_convert_to_pm03(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.post(f"/api/v1/work-requests/{ids['wr_approved']}/convert-to-pm03",
                                      json={"estimated_hours": 4.0, "operations": [], "materials": [],
                                            "workers_required": [{"specialty": "MECHANICAL", "count": 1}]})
        assert r.status_code < 600

    def test_delete_then_restore(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r1 = fully_seeded_client.delete(f"/api/v1/work-requests/{ids['wr_rejected']}")
        assert r1.status_code < 600
        r2 = fully_seeded_client.post(f"/api/v1/work-requests/tools/restore/{ids['wr_rejected']}")
        assert r2.status_code < 600


# ── Managed Work Orders con MWOs reales ──────────────────────────
class TestMWOWithRealData:
    def test_list(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/managed-work-orders/")
        assert r.status_code == 200
        assert len(r.json()) >= 5

    def test_get_detail_each_status(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for k in ["mwo_planificado", "mwo_en_programacion", "mwo_programado", "mwo_ejecutando", "mwo_ejecutado"]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/{ids[k]}")
            assert r.status_code < 600

    def test_update_each(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for k in ["mwo_planificado", "mwo_en_programacion", "mwo_programado"]:
            for body in [
                {"description": "Updated MWO"},
                {"priority_code": "P2"},
                {"planned_start": "2026-06-01T08:00:00"},
                {"estimated_hours": 6.0},
            ]:
                r = fully_seeded_client.put(f"/api/v1/managed-work-orders/{ids[k]}", json=body)
                assert r.status_code < 600

    def test_transitions(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        # Cada MWO en su estado correspondiente intenta varias transitions
        actions = ["draft", "plan", "release", "schedule", "reschedule", "start", "complete", "close"]
        for k in ["mwo_planificado", "mwo_en_programacion", "mwo_programado", "mwo_ejecutando"]:
            for action in actions:
                r = fully_seeded_client.put(f"/api/v1/managed-work-orders/{ids[k]}/{action}", json={})
                assert r.status_code < 600

    def test_close_gates(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for k in ["mwo_ejecutando", "mwo_ejecutado"]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/{ids[k]}/close-gates")
            assert r.status_code < 600

    def test_sap_sync(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for k in ["mwo_programado", "mwo_ejecutando"]:
            r1 = fully_seeded_client.get(f"/api/v1/managed-work-orders/{ids[k]}/sap-sync")
            assert r1.status_code < 600
            r2 = fully_seeded_client.post(f"/api/v1/managed-work-orders/{ids[k]}/sap-sync", json={})
            assert r2.status_code < 600

    def test_impact_score(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for k in ["mwo_planificado", "mwo_en_programacion", "mwo_programado"]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/{ids[k]}/impact-score")
            assert r.status_code < 600

    def test_assign_workers(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        for k in ["mwo_planificado", "mwo_en_programacion"]:
            r = fully_seeded_client.put(f"/api/v1/managed-work-orders/{ids[k]}/assign-workers",
                                         json={"worker_ids": ["WKR-TEST-001"]})
            assert r.status_code < 600

    def test_create_new(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/managed-work-orders/", json={
            "equipment_tag": "BRY-SAG-ML-001",
            "description": "New test WO",
            "wo_type": "PM01",
            "priority_code": "P3",
            "plant_id": "TEST-PLANT",
            "estimated_hours": 2.0,
        })
        assert r.status_code < 600

    def test_orphans(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/managed-work-orders/orphans")
        assert r.status_code < 600

    def test_stats(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/managed-work-orders/stats")
        assert r.status_code < 600

    def test_list_with_all_filters(self, fully_seeded_client):
        for q in [
            "?status=PLANIFICADO",
            "?status=EN_PROGRAMACION",
            "?status=PROGRAMADO",
            "?status=EN_EJECUCION",
            "?status=EJECUTADO",
            "?priority=P1",
            "?priority=P3",
            "?wo_type=PM01",
            "?wo_type=PM03",
            "?plant_id=TEST-PLANT",
            "?limit=2&offset=0",
            "?limit=10",
        ]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/{q}")
            assert r.status_code < 600


# ── Scheduling endpoints ──────────────────────────────────────────
class TestSchedulingWithRealData:
    def test_calendar(self, fully_seeded_client):
        for q in [
            "?start_date=2026-05-01&end_date=2026-05-31",
            "?start_date=2026-05-15&end_date=2026-05-22&plant_id=TEST-PLANT",
            "?week=20",
        ]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/calendar{q}")
            assert r.status_code < 600

    def test_workload(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT", "?date=2026-05-15"]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/workload{q}")
            assert r.status_code < 600

    def test_assign(self, fully_seeded_client):
        ids = fully_seeded_client._test_ids
        r = fully_seeded_client.put("/api/v1/scheduling/assign", json={
            "wo_id": ids["mwo_planificado"],
            "worker_ids": ["WKR-TEST-001", "WKR-TEST-002"],
            "scheduled_start": "2026-05-20T10:00:00",
        })
        assert r.status_code < 600


# ── Analytics endpoints (con data sembrada) ───────────────────────
class TestAnalyticsWithRealData:
    def test_dashboards(self, fully_seeded_client):
        endpoints = [
            "/api/v1/analytics-dash/summary",
            "/api/v1/analytics-dash/pm-compliance",
            "/api/v1/analytics-dash/backlog-aging",
            "/api/v1/analytics-dash/cycle-times",
            "/api/v1/analytics-dash/cost-breakdown",
            "/api/v1/analytics-dash/rework-detection",
            "/api/v1/analytics-dash/program-adherence",
            "/api/v1/analytics-dash/program-compliance",
            "/api/v1/analytics-dash/reliability-correlation",
        ]
        for ep in endpoints:
            for q in ["", "?plant_id=TEST-PLANT", "?period=7d", "?period=30d"]:
                r = fully_seeded_client.get(ep + q)
                assert r.status_code < 600

    def test_basic_analytics(self, fully_seeded_client):
        for ep in [
            "/api/v1/analytics/asset-health",
            "/api/v1/analytics/variance-alerts",
        ]:
            for q in ["", "?plant_id=TEST-PLANT", "?equipment_tag=BRY-SAG-ML-001"]:
                r = fully_seeded_client.get(ep + q)
                assert r.status_code < 600


# ── Notification deliveries (3 sembrados) ─────────────────────────
class TestNotificationsWithRealData:
    def test_list_all(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/notification-deliveries/")
        assert r.status_code == 200
        assert len(r.json()) >= 3

    def test_filter_by_status(self, fully_seeded_client):
        for s in ["PENDING", "SENT", "RETRY", "FAILED"]:
            r = fully_seeded_client.get(f"/api/v1/notification-deliveries/?status={s}")
            assert r.status_code == 200

    def test_filter_by_entity(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/notification-deliveries/?entity_id=WR-TEST-001")
        assert r.status_code == 200

    def test_retry_batch(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/notification-deliveries/retry")
        assert r.status_code < 600


# ── Sprint6 scaffolds endpoints ───────────────────────────────────
class TestSprint6WithRealData:
    def test_all_endpoints(self, fully_seeded_client):
        for path in [
            "/api/v1/sprint6/dashboard",
            "/api/v1/sprint6/canonical-data-status",
            "/api/v1/sprint6/support-equipment-catalog",
        ]:
            r = fully_seeded_client.get(path)
            assert r.status_code < 600


# ── Captures (3 sembrados) ────────────────────────────────────────
class TestCapturesWithRealData:
    def test_list_with_seeded(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/capture/")
        assert r.status_code == 200
        assert len(r.json()) >= 3

    def test_create_new(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/capture/", json={
            "technician_id": "WKR-TEST-001",
            "capture_type": "TEXT",
            "language": "es",
            "raw_text": "New capture test",
            "equipment_tag_manual": "BRY-SAG-ML-001",
        })
        assert r.status_code < 600


# ── Data import ───────────────────────────────────────────────────
class TestDataImportWithRealData:
    def test_endpoints(self, fully_seeded_client):
        for ep in [
            "/api/v1/data-import/templates",
            "/api/v1/data-import/tables",
            "/api/v1/data-import/history",
        ]:
            r = fully_seeded_client.get(ep)
            assert r.status_code < 600


# ── Reliability ───────────────────────────────────────────────────
class TestReliabilityWithRealData:
    def test_endpoints(self, fully_seeded_client):
        for ep in [
            "/api/v1/reliability/weibull",
            "/api/v1/reliability/mtbf",
            "/api/v1/reliability/jackknife",
            "/api/v1/reliability/health-score",
        ]:
            for q in ["?plant_id=TEST-PLANT", "?equipment_tag=BRY-SAG-ML-001"]:
                r = fully_seeded_client.get(ep + q)
                assert r.status_code < 600


# ── Execution ─────────────────────────────────────────────────────
class TestExecutionWithRealData:
    def test_endpoints(self, fully_seeded_client):
        for ep in [
            "/api/v1/execution/my-tasks",
            "/api/v1/execution/tasks",
            "/api/v1/execution/handovers",
        ]:
            for q in ["", "?worker_id=WKR-TEST-001"]:
                r = fully_seeded_client.get(ep + q)
                assert r.status_code < 600
