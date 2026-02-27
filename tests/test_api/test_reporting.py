"""Tests for Reporting API — Phase 6."""


class TestReportingAPI:

    def test_generate_weekly_report(self, client):
        response = client.post("/api/v1/reporting/reports/weekly", json={
            "plant_id": "TEST-PLANT", "week": 10, "year": 2025,
            "safety_incidents": 0, "backlog_hours": 120.0,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["week_number"] == 10
        assert data["metadata"]["report_type"] == "WEEKLY_MAINTENANCE"

    def test_generate_monthly_report(self, client):
        response = client.post("/api/v1/reporting/reports/monthly", json={
            "plant_id": "TEST-PLANT", "month": 6, "year": 2025,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["month"] == 6

    def test_generate_quarterly_report(self, client):
        response = client.post("/api/v1/reporting/reports/quarterly", json={
            "plant_id": "TEST-PLANT", "quarter": 2, "year": 2025,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["quarter"] == 2

    def test_list_reports(self, client):
        client.post("/api/v1/reporting/reports/weekly", json={
            "plant_id": "TEST-PLANT", "week": 1, "year": 2025,
        })
        response = client.get("/api/v1/reporting/reports", params={"plant_id": "TEST-PLANT"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1

    def test_get_report(self, client):
        create_resp = client.post("/api/v1/reporting/reports/weekly", json={
            "plant_id": "TEST-PLANT", "week": 5, "year": 2025,
        })
        report_id = create_resp.json()["metadata"]["report_id"]
        get_resp = client.get(f"/api/v1/reporting/reports/{report_id}")
        assert get_resp.status_code == 200

    def test_get_report_not_found(self, client):
        response = client.get("/api/v1/reporting/reports/nonexistent-id")
        assert response.status_code == 404

    def test_calculate_de_kpis(self, client):
        response = client.post("/api/v1/reporting/de-kpis/calculate", json={
            "plant_id": "TEST", "period_start": "2025-01-01", "period_end": "2025-03-31",
            "events_reported": 18, "events_required": 20,
            "meetings_held": 10, "meetings_required": 12,
            "actions_implemented": 15, "actions_planned": 20,
            "savings_achieved": 50000, "savings_target": 80000,
            "failures_current": 8, "failures_previous": 12,
        })
        assert response.status_code == 200
        data = response.json()
        assert "kpis" in data
        assert len(data["kpis"]) == 5

    def test_assess_de_program_health(self, client):
        response = client.post("/api/v1/reporting/de-kpis/program-health", json={
            "plant_id": "TEST", "period_start": "2025-01-01", "period_end": "2025-03-31",
            "events_reported": 18, "events_required": 20,
            "meetings_held": 10, "meetings_required": 12,
            "actions_implemented": 15, "actions_planned": 20,
            "savings_achieved": 50000, "savings_target": 80000,
            "failures_current": 8, "failures_previous": 12,
        })
        assert response.status_code == 200
        data = response.json()
        assert "maturity_level" in data

    def test_generate_notifications(self, client):
        response = client.post("/api/v1/reporting/notifications/generate", json={
            "plant_id": "TEST-PLANT",
            "health_scores": [{"equipment_id": "EQ-1", "composite_score": 15}],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_notifications"] >= 1

    def test_list_notifications(self, client):
        client.post("/api/v1/reporting/notifications/generate", json={
            "plant_id": "TEST-PLANT",
            "health_scores": [{"equipment_id": "EQ-1", "composite_score": 10}],
        })
        response = client.get("/api/v1/reporting/notifications", params={"plant_id": "TEST-PLANT"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_validate_import(self, client):
        response = client.post("/api/v1/reporting/import/validate", json={
            "source": "EQUIPMENT_HIERARCHY",
            "rows": [{"equipment_id": "EQ-1", "description": "Pump", "equipment_type": "ROTATING"}],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid_rows"] == 1

    def test_export_data(self, client):
        response = client.post("/api/v1/reporting/export", json={
            "export_type": "equipment",
            "hierarchy_data": [{"equipment_id": "EQ-1", "description": "Pump"}],
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["sheets"]) >= 1

    def test_cross_module_analysis(self, client):
        response = client.post("/api/v1/reporting/cross-module/analyze", json={
            "plant_id": "TEST-PLANT",
            "equipment_criticality": [
                {"equipment_id": "EQ-1", "criticality": "AA"},
                {"equipment_id": "EQ-2", "criticality": "B"},
            ],
            "failure_records": [
                {"equipment_id": "EQ-1"}, {"equipment_id": "EQ-1"},
                {"equipment_id": "EQ-2"},
            ],
        })
        assert response.status_code == 200
        data = response.json()
        assert "correlations" in data
