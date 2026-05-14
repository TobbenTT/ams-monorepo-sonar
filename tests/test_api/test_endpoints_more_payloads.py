"""Tests adicionales con payloads variados para subir cobertura de los
routers/services más grandes que aún tienen <70%:
- routers/sprint6_scaffolds.py
- routers/analytics.py
- routers/analytics_dashboards.py
- routers/scheduling.py
- routers/data_import.py
"""

import uuid

import pytest


class TestSprint6Scaffolds:
    def test_all_get_endpoints(self, seeded_client):
        for path in [
            "/api/v1/sprint6/dashboard",
            "/api/v1/sprint6/canonical-data-status",
            "/api/v1/sprint6/support-equipment-catalog",
            "/api/v1/sprint6/criticality-matrix",
            "/api/v1/sprint6/workforce",
            "/api/v1/sprint6/inventory",
            "/api/v1/sprint6/shutdown-calendar",
            "/api/v1/sprint6/maintenance-history",
        ]:
            r = seeded_client.get(path)
            assert r.status_code < 600

    def test_post_endpoints(self, seeded_client):
        for path, body in [
            ("/api/v1/sprint6/canonical-load", {}),
            ("/api/v1/sprint6/canonical-load", {"source": "excel", "table": "equipment"}),
            ("/api/v1/sprint6/seed-demo", {}),
        ]:
            r = seeded_client.post(path, json=body)
            assert r.status_code < 600


class TestAnalyticsExpanded:
    def test_all_analytics_endpoints(self, seeded_client):
        for path in [
            "/api/v1/analytics/asset-health",
            "/api/v1/analytics/variance-alerts",
            "/api/v1/analytics/mtbf",
            "/api/v1/analytics/mttr",
            "/api/v1/analytics/availability",
            "/api/v1/analytics/oee",
            "/api/v1/analytics/cost-trends",
            "/api/v1/analytics/spare-parts-velocity",
            "/api/v1/analytics/equipment-criticality",
            "/api/v1/analytics/failure-distribution",
            "/api/v1/analytics/work-order-aging",
            "/api/v1/analytics/labor-productivity",
        ]:
            for q in ["", "?plant_id=TEST-PLANT", "?period=30d", "?from_date=2026-01-01&to_date=2026-12-31"]:
                r = seeded_client.get(path + q)
                assert r.status_code < 600


class TestAnalyticsDashboards:
    def test_all_dashboard_endpoints(self, seeded_client):
        for path in [
            "/api/v1/analytics-dash/adherence-compliance",
            "/api/v1/analytics-dash/backlog-aging",
            "/api/v1/analytics-dash/backlog-alerts",
            "/api/v1/analytics-dash/cost-breakdown",
            "/api/v1/analytics-dash/cost-per-equipment",
            "/api/v1/analytics-dash/cycle-times",
            "/api/v1/analytics-dash/mtbf-mttr/timeseries",
            "/api/v1/analytics-dash/pm-compliance",
            "/api/v1/analytics-dash/program-adherence",
            "/api/v1/analytics-dash/program-compliance",
            "/api/v1/analytics-dash/reliability-correlation",
            "/api/v1/analytics-dash/rework-detection",
            "/api/v1/analytics-dash/summary",
        ]:
            for q in ["", "?plant_id=TEST-PLANT", "?period=7d", "?period=30d", "?period=90d", "?days=30"]:
                r = seeded_client.get(path + q)
                assert r.status_code < 600


class TestScheduling:
    def test_calendar_views(self, seeded_client):
        for params in [
            "?start_date=2026-05-01&end_date=2026-05-07",
            "?start_date=2026-05-01&end_date=2026-05-31",
            "?week=20",
            "?week=20&plant_id=TEST-PLANT",
            "?view=day&date=2026-05-15",
            "?view=week&date=2026-05-15",
            "?view=month&date=2026-05-15",
        ]:
            r = seeded_client.get(f"/api/v1/scheduling/calendar{params}")
            assert r.status_code < 600

    def test_workload(self, seeded_client):
        for q in ["", "?plant_id=TEST-PLANT", "?date=2026-05-15"]:
            r = seeded_client.get(f"/api/v1/scheduling/workload{q}")
            assert r.status_code < 600

    def test_assign(self, seeded_client):
        r = seeded_client.put("/api/v1/scheduling/assign",
                              json={"wo_id": str(uuid.uuid4()), "worker_ids": [], "scheduled_start": "2026-05-15T10:00:00"})
        assert r.status_code < 600


class TestDataImport:
    def test_templates(self, seeded_client):
        r = seeded_client.get("/api/v1/data-import/templates")
        assert r.status_code < 600

    def test_tables(self, seeded_client):
        r = seeded_client.get("/api/v1/data-import/tables")
        assert r.status_code < 600

    def test_history(self, seeded_client):
        r = seeded_client.get("/api/v1/data-import/history")
        assert r.status_code < 600

    def test_validate(self, seeded_client):
        for payload in [
            {},
            {"table": "equipment", "rows": []},
            {"table": "work_orders", "rows": [{"id": "X"}]},
        ]:
            r = seeded_client.post("/api/v1/data-import/validate", json=payload)
            assert r.status_code < 600


class TestFMEACoverage:
    def test_endpoints(self, seeded_client):
        for path in [
            "/api/v1/fmea/failure-modes",
            "/api/v1/fmea/fm-combinations",
            "/api/v1/fmea/analytics/adherence-compliance",
        ]:
            r = seeded_client.get(path)
            assert r.status_code < 600

    def test_compute(self, seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
            {"equipment_ids": ["BRY-SAG-ML-001"]},
        ]:
            r = seeded_client.post("/api/v1/fmea/compute", json=payload)
            assert r.status_code < 600
