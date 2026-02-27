"""Tests for Reliability API — Phase 5."""


class TestReliabilityAPI:

    def test_analyze_spare_parts(self, client):
        response = client.post("/api/v1/reliability/spare-parts/analyze", json={
            "plant_id": "TEST-PLANT",
            "parts": [
                {"part_id": "SP-1", "equipment_id": "EQ-1", "description": "Bearing",
                 "equipment_criticality": "HIGH", "failure_impact": "PRODUCTION_STOP",
                 "movements_per_year": 15, "annual_cost": 50000, "unit_cost": 500,
                 "daily_consumption": 0.5, "lead_time_days": 30, "current_stock": 10},
            ],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_parts"] == 1
        assert len(data["results"]) == 1

    def test_create_shutdown(self, client):
        response = client.post("/api/v1/reliability/shutdowns", json={
            "plant_id": "TEST-PLANT",
            "name": "Test Shutdown",
            "planned_start": "2025-06-01T06:00:00",
            "planned_end": "2025-06-03T18:00:00",
            "work_orders": ["WO-001", "WO-002"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "shutdown_id" in data
        assert data["status"] == "PLANNED"

    def test_get_shutdown(self, client):
        create_resp = client.post("/api/v1/reliability/shutdowns", json={
            "plant_id": "TEST-PLANT", "name": "Test",
            "planned_start": "2025-06-01T06:00:00",
            "planned_end": "2025-06-02T06:00:00",
            "work_orders": ["WO-001"],
        })
        sid = create_resp.json()["shutdown_id"]
        get_resp = client.get(f"/api/v1/reliability/shutdowns/{sid}")
        assert get_resp.status_code == 200
        assert get_resp.json()["shutdown_id"] == sid

    def test_shutdown_lifecycle(self, client):
        create_resp = client.post("/api/v1/reliability/shutdowns", json={
            "plant_id": "TEST-PLANT", "name": "Lifecycle Test",
            "planned_start": "2025-06-01T06:00:00",
            "planned_end": "2025-06-02T06:00:00",
            "work_orders": ["WO-001"],
        })
        sid = create_resp.json()["shutdown_id"]
        start_resp = client.put(f"/api/v1/reliability/shutdowns/{sid}/start")
        assert start_resp.status_code == 200
        assert start_resp.json()["status"] == "IN_PROGRESS"
        comp_resp = client.put(f"/api/v1/reliability/shutdowns/{sid}/complete")
        assert comp_resp.status_code == 200
        assert comp_resp.json()["status"] == "COMPLETED"

    def test_create_moc(self, client):
        response = client.post("/api/v1/reliability/moc", json={
            "plant_id": "TEST-PLANT",
            "title": "Replace bearing type",
            "description": "Test",
            "category": "EQUIPMENT_MODIFICATION",
            "requester_id": "REQ-001",
        })
        assert response.status_code == 200
        data = response.json()
        assert "moc_id" in data
        assert data["status"] == "DRAFT"

    def test_list_mocs(self, client):
        client.post("/api/v1/reliability/moc", json={
            "plant_id": "TEST-PLANT", "title": "Test MoC",
            "description": "", "category": "PROCESS_CHANGE", "requester_id": "REQ",
        })
        response = client.get("/api/v1/reliability/mocs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_advance_moc(self, client):
        create_resp = client.post("/api/v1/reliability/moc", json={
            "plant_id": "TEST-PLANT", "title": "Advance Test",
            "description": "", "category": "EQUIPMENT_MODIFICATION", "requester_id": "REQ",
        })
        moc_id = create_resp.json()["moc_id"]
        adv_resp = client.put(f"/api/v1/reliability/moc/{moc_id}/advance", json={"action": "submit"})
        assert adv_resp.status_code == 200
        assert adv_resp.json()["status"] == "SUBMITTED"

    def test_calculate_ocr(self, client):
        response = client.post("/api/v1/reliability/ocr/analyze", json={
            "equipment_id": "EQ-001", "failure_rate": 2.0,
            "cost_per_failure": 50000, "cost_per_pm": 5000,
            "current_pm_interval_days": 90,
        })
        assert response.status_code == 200
        data = response.json()
        assert "optimal_interval_days" in data

    def test_analyze_jackknife(self, client):
        response = client.post("/api/v1/reliability/jackknife/analyze", json={
            "plant_id": "TEST-PLANT",
            "equipment_data": [
                {"equipment_id": "EQ-1", "equipment_tag": "SAG-001",
                 "failure_count": 10, "total_downtime_hours": 100, "operating_hours": 8760},
            ],
        })
        assert response.status_code == 200
        assert response.json()["equipment_count"] == 1

    def test_analyze_pareto(self, client):
        response = client.post("/api/v1/reliability/pareto/analyze", json={
            "plant_id": "TEST-PLANT",
            "metric_type": "failures",
            "records": [
                {"equipment_id": "EQ-1", "equipment_tag": "T1"},
                {"equipment_id": "EQ-1", "equipment_tag": "T1"},
                {"equipment_id": "EQ-2", "equipment_tag": "T2"},
            ],
        })
        assert response.status_code == 200
        assert response.json()["metric_type"] == "failures"

    def test_calculate_lcc(self, client):
        response = client.post("/api/v1/reliability/lcc/calculate", json={
            "equipment_id": "EQ-001", "acquisition_cost": 100000,
            "installation_cost": 20000, "annual_operating_cost": 15000,
            "annual_maintenance_cost": 10000, "expected_life_years": 20,
            "discount_rate": 0.08, "salvage_value": 5000,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_lcc"] > 0

    def test_assess_rbi(self, client):
        response = client.post("/api/v1/reliability/rbi/assess", json={
            "plant_id": "TEST-PLANT",
            "equipment_list": [
                {"equipment_id": "EQ-1", "equipment_type": "PRESSURE_VESSEL",
                 "damage_mechanisms": ["CORROSION"], "age_years": 10},
            ],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_equipment"] == 1

    def test_shutdown_not_found(self, client):
        response = client.get("/api/v1/reliability/shutdowns/NONEXISTENT")
        assert response.status_code == 404

    def test_moc_not_found(self, client):
        response = client.get("/api/v1/reliability/moc/NONEXISTENT")
        assert response.status_code == 404
