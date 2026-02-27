"""Tests for analytics API endpoints."""

import pytest


class TestAnalyticsEndpoints:

    def test_calculate_health_score(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        r = seeded_client.post("/api/v1/analytics/health-score", json={
            "node_id": eq_id,
            "plant_id": "TEST-PLANT",
            "equipment_tag": "BRY-SAG-ML-001",
            "risk_class": "III_HIGH",
            "pending_backlog_hours": 50.0,
            "total_failure_modes": 10,
            "fm_with_strategy": 8,
        })
        assert r.status_code == 200
        data = r.json()
        assert "composite_score" in data
        assert "health_class" in data
        assert data["composite_score"] >= 0
        assert data["composite_score"] <= 100

    def test_calculate_kpis_availability(self, seeded_client):
        r = seeded_client.post("/api/v1/analytics/kpis", json={
            "plant_id": "TEST-PLANT",
            "total_period_hours": 8760.0,
            "total_downtime_hours": 120.0,
        })
        assert r.status_code == 200
        data = r.json()
        assert "availability_pct" in data
        assert data["availability_pct"] > 90

    def test_calculate_kpis_mtbf(self, seeded_client):
        r = seeded_client.post("/api/v1/analytics/kpis", json={
            "plant_id": "TEST-PLANT",
            "failure_dates": ["2024-01-15", "2024-06-20", "2024-11-10"],
        })
        assert r.status_code == 200
        data = r.json()
        assert "mtbf_days" in data
        assert data["mtbf_days"] > 0

    def test_fit_weibull(self, client):
        r = client.post("/api/v1/analytics/weibull-fit", json={
            "failure_intervals": [120.0, 180.0, 95.0, 210.0, 150.0],
        })
        assert r.status_code == 200
        data = r.json()
        assert "beta" in data
        assert "eta" in data
        assert data["beta"] > 0
        assert data["eta"] > 0

    def test_predict_failure(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        r = seeded_client.post("/api/v1/analytics/weibull-predict", json={
            "equipment_id": eq_id,
            "equipment_tag": "BRY-SAG-ML-001",
            "failure_intervals": [120.0, 180.0, 95.0, 210.0, 150.0],
            "current_age_days": 100.0,
        })
        assert r.status_code == 200
        data = r.json()
        assert "reliability_current" in data
        assert "predicted_failure_window_days" in data
        assert data["status"] == "DRAFT"

    def test_detect_variance(self, client):
        r = client.post("/api/v1/analytics/variance-detect", json={
            "snapshots": [
                {"plant_id": "P1", "plant_name": "Plant 1", "metric_name": "MTBF", "metric_value": 100.0, "period_start": "2024-01-01", "period_end": "2024-12-31"},
                {"plant_id": "P2", "plant_name": "Plant 2", "metric_name": "MTBF", "metric_value": 105.0, "period_start": "2024-01-01", "period_end": "2024-12-31"},
                {"plant_id": "P3", "plant_name": "Plant 3", "metric_name": "MTBF", "metric_value": 95.0, "period_start": "2024-01-01", "period_end": "2024-12-31"},
                {"plant_id": "P4", "plant_name": "Plant 4", "metric_name": "MTBF", "metric_value": 200.0, "period_start": "2024-01-01", "period_end": "2024-12-31"},
            ],
        })
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_variance_alerts_empty(self, client):
        r = client.get("/api/v1/analytics/variance-alerts")
        assert r.status_code == 200
        assert r.json() == []
