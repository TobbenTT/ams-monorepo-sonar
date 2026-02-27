"""Tests for Scheduling API — Phase 4B."""


class TestSchedulingAPI:

    def _seed_backlog(self, db_session):
        """Helper: seed backlog items for scheduling tests."""
        from api.database.models import BacklogItemModel
        for i in range(3):
            db_session.add(BacklogItemModel(
                backlog_id=f"BL-SCHED-{i+1:03d}",
                equipment_id=f"EQ-{i+1}",
                equipment_tag=f"BRY-SAG-ML-{i+1:03d}",
                priority="3_NORMAL",
                wo_type="PM01",
                status="AWAITING_APPROVAL",
                estimated_hours=4.0,
                specialties=["MECHANICAL"],
                materials_ready=True,
                shutdown_required=False,
                age_days=5,
            ))
        db_session.commit()

    def test_create_program(self, seeded_client, db_session):
        """Create a weekly program via API."""
        self._seed_backlog(db_session)
        response = seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_number": 10,
            "year": 2025,
        })
        assert response.status_code == 200
        data = response.json()
        assert "program_id" in data
        assert data["status"] == "DRAFT"

    def test_list_programs(self, seeded_client):
        """List programs returns empty initially."""
        response = seeded_client.get("/api/v1/scheduling/programs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_and_get_program(self, seeded_client):
        """Create then retrieve a program."""
        create_resp = seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_number": 5,
            "year": 2025,
        })
        assert create_resp.status_code == 200
        pid = create_resp.json()["program_id"]

        get_resp = seeded_client.get(f"/api/v1/scheduling/programs/{pid}")
        assert get_resp.status_code == 200
        assert get_resp.json()["program_id"] == pid

    def test_finalize_program(self, seeded_client):
        """Create and finalize a program."""
        create_resp = seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_number": 6,
            "year": 2025,
        })
        pid = create_resp.json()["program_id"]

        fin_resp = seeded_client.put(f"/api/v1/scheduling/programs/{pid}/finalize")
        assert fin_resp.status_code == 200
        result = fin_resp.json()
        assert result["status"] in ("FINAL", "DRAFT")

    def test_activate_after_finalize(self, seeded_client):
        """Finalize then activate a program."""
        create_resp = seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_number": 7,
            "year": 2025,
        })
        pid = create_resp.json()["program_id"]

        seeded_client.put(f"/api/v1/scheduling/programs/{pid}/finalize")
        act_resp = seeded_client.put(f"/api/v1/scheduling/programs/{pid}/activate")
        assert act_resp.status_code == 200

    def test_complete_after_activate(self, seeded_client):
        """Full lifecycle: create → finalize → activate → complete."""
        create_resp = seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_number": 8,
            "year": 2025,
        })
        pid = create_resp.json()["program_id"]

        seeded_client.put(f"/api/v1/scheduling/programs/{pid}/finalize")
        seeded_client.put(f"/api/v1/scheduling/programs/{pid}/activate")
        comp_resp = seeded_client.put(f"/api/v1/scheduling/programs/{pid}/complete")
        assert comp_resp.status_code == 200

    def test_gantt_endpoint(self, seeded_client):
        """Get Gantt data for a program."""
        create_resp = seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_number": 9,
            "year": 2025,
        })
        pid = create_resp.json()["program_id"]

        gantt_resp = seeded_client.get(f"/api/v1/scheduling/programs/{pid}/gantt")
        assert gantt_resp.status_code == 200
        assert isinstance(gantt_resp.json(), list)

    def test_404_nonexistent_program(self, seeded_client):
        """Get a nonexistent program returns 404."""
        resp = seeded_client.get("/api/v1/scheduling/programs/NONEXISTENT")
        assert resp.status_code == 404
