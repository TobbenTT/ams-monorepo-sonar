"""Tests for Dashboard API — Phase 6."""


class TestDashboardAPI:

    def test_executive_dashboard(self, client):
        response = client.get("/api/v1/dashboard/executive/TEST-PLANT")
        assert response.status_code == 200
        data = response.json()
        assert data["plant_id"] == "TEST-PLANT"
        assert "total_reports" in data
        assert "total_notifications" in data

    def test_kpi_summary_no_data(self, client):
        response = client.get("/api/v1/dashboard/kpi-summary/TEST-PLANT")
        assert response.status_code == 200
        data = response.json()
        assert data["has_data"] is False

    def test_kpi_summary_with_report(self, client):
        client.post("/api/v1/reporting/reports/monthly", json={
            "plant_id": "KPI-PLANT", "month": 1, "year": 2025,
        })
        response = client.get("/api/v1/dashboard/kpi-summary/KPI-PLANT")
        assert response.status_code == 200
        data = response.json()
        assert data["has_data"] is True

    def test_dashboard_alerts(self, client):
        response = client.get("/api/v1/dashboard/alerts/TEST-PLANT")
        assert response.status_code == 200
        data = response.json()
        assert data["plant_id"] == "TEST-PLANT"
        assert "total_active" in data
