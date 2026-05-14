"""Tests profundos sprint6_scaffolds y analytics routers."""

import uuid


class TestSprint6GetEndpoints:
    def test_all_simple_gets(self, fully_seeded_client):
        for path in [
            "/api/v1/sprint6/unscheduled-work",
            "/api/v1/sprint6/supervisor-board",
            "/api/v1/sprint6/critical-backlog-audit",
            "/api/v1/sprint6/chronic-failures",
            "/api/v1/sprint6/ot-discrepancies",
            "/api/v1/sprint6/noncompliance-categorize",
            "/api/v1/sprint6/skills-gaps",
            "/api/v1/sprint6/stockout-predict",
            "/api/v1/sprint6/erp-sync/status",
            "/api/v1/sprint6/digital-checklists/templates",
            "/api/v1/sprint6/auto-assign-resources",
            "/api/v1/sprint6/inactive-resources",
            "/api/v1/sprint6/equipment-autocomplete",
            "/api/v1/sprint6/ai-feedback/stats",
            "/api/v1/sprint6/canonical-data-status",
            "/api/v1/sprint6/support-equipment-catalog",
        ]:
            for q in ["", "?plant_id=TEST-PLANT"]:
                r = fully_seeded_client.get(path + q)
                assert r.status_code < 600

    def test_get_with_param_wo_id(self, fully_seeded_client):
        for path_template in [
            "/api/v1/sprint6/smart-assignment-suggest/{wo}",
            "/api/v1/sprint6/work-documents/{wo}",
            "/api/v1/sprint6/ops-schedule/{wo}",
            "/api/v1/sprint6/skills-inference/{wo}",
            "/api/v1/sprint6/stock-check/{wo}",
        ]:
            r = fully_seeded_client.get(path_template.format(wo="MWO-TEST-001"))
            assert r.status_code < 600
            r2 = fully_seeded_client.get(path_template.format(wo=str(uuid.uuid4())))
            assert r2.status_code < 600

    def test_equipment_autocomplete_with_search(self, fully_seeded_client):
        for q in ["?search=BRY", "?search=SAG", "?search=ML",
                  "?search=BRY-SAG-ML-001", "?search=&plant_id=TEST-PLANT"]:
            r = fully_seeded_client.get(f"/api/v1/sprint6/equipment-autocomplete{q}")
            assert r.status_code < 600


class TestSprint6Filters:
    def test_unscheduled_filters(self, fully_seeded_client):
        for q in ["", "?priority=P1", "?priority=P2", "?plant_id=TEST-PLANT",
                  "?priority=P1&plant_id=TEST-PLANT"]:
            r = fully_seeded_client.get(f"/api/v1/sprint6/unscheduled-work{q}")
            assert r.status_code < 600

    def test_supervisor_board_filters(self, fully_seeded_client):
        for q in ["", "?date=2026-05-19", "?plant_id=TEST-PLANT",
                  "?shift=DAY", "?shift=NIGHT"]:
            r = fully_seeded_client.get(f"/api/v1/sprint6/supervisor-board{q}")
            assert r.status_code < 600

    def test_chronic_failures_filters(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT", "?days=30", "?days=90", "?days=365"]:
            r = fully_seeded_client.get(f"/api/v1/sprint6/chronic-failures{q}")
            assert r.status_code < 600

    def test_skills_gaps(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT", "?specialty=MECANICO"]:
            r = fully_seeded_client.get(f"/api/v1/sprint6/skills-gaps{q}")
            assert r.status_code < 600


class TestAnalyticsPOST:
    def test_health_score(self, fully_seeded_client):
        for payload in [
            {},
            {"equipment_tag": "BRY-SAG-ML-001"},
            {"equipment_ids": ["BRY-SAG-ML-001"]},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/health-score", json=payload)
            assert r.status_code < 600

    def test_kpis(self, fully_seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
            {"plant_id": "TEST-PLANT", "period_days": 30},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/kpis", json=payload)
            assert r.status_code < 600

    def test_weibull(self, fully_seeded_client):
        for payload in [
            {},
            {"equipment_tag": "BRY-SAG-ML-001"},
            {"failures": [{"time": 1000}, {"time": 2000}, {"time": 3000}]},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/weibull-fit", json=payload)
            assert r.status_code < 600

            r2 = fully_seeded_client.post("/api/v1/analytics/weibull-predict", json=payload)
            assert r2.status_code < 600

    def test_variance(self, fully_seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
            {"equipment_tag": "BRY-SAG-ML-001", "threshold": 0.15},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/variance-detect", json=payload)
            assert r.status_code < 600

    def test_classify_noncompliance(self, fully_seeded_client):
        for payload in [
            {},
            {"wo_id": "MWO-TEST-001"},
            {"wo_id": "MWO-TEST-001", "reason": "delay"},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/classify-noncompliance",
                                          json=payload)
            assert r.status_code < 600

    def test_chronic_failures_analyze(self, fully_seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
            {"plant_id": "TEST-PLANT", "lookback_days": 90},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/chronic-failures-analyze",
                                          json=payload)
            assert r.status_code < 600

    def test_stock_oc_recommend(self, fully_seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/stock-oc-recommend",
                                          json=payload)
            assert r.status_code < 600


class TestAnalyticsGET:
    def test_asset_health(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT", "?equipment_tag=BRY-SAG-ML-001",
                  "?plant_id=TEST-PLANT&equipment_tag=BRY-SAG-ML-001"]:
            r = fully_seeded_client.get(f"/api/v1/analytics/asset-health{q}")
            assert r.status_code < 600

    def test_variance_alerts(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT", "?days=7", "?days=30"]:
            r = fully_seeded_client.get(f"/api/v1/analytics/variance-alerts{q}")
            assert r.status_code < 600

    def test_page_data(self, fully_seeded_client):
        for plant in ["TEST-PLANT", "UNKNOWN", "OCP-JFC1"]:
            r = fully_seeded_client.get(f"/api/v1/analytics/page-data/{plant}")
            assert r.status_code < 600


class TestAnalyticsRecalculate:
    def test_recalculate(self, fully_seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT"},
            {"plant_id": "TEST-PLANT", "force": True},
        ]:
            r = fully_seeded_client.post("/api/v1/analytics/recalculate", json=payload)
            assert r.status_code < 600
