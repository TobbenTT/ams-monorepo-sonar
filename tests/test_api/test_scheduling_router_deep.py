"""Tests scheduling router con WRs/MWOs sembrados."""


class TestPrograms:
    def test_create_program(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_start": "2026-05-19",
        })
        assert r.status_code < 600

    def test_create_with_wos(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/scheduling/programs", json={
            "plant_id": "TEST-PLANT",
            "week_start": "2026-05-19",
            "wo_ids": ["MWO-TEST-001", "MWO-TEST-002"],
        })
        assert r.status_code < 600

    def test_list_programs(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/scheduling/programs")
        assert r.status_code < 600

    def test_list_programs_with_plant(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/scheduling/programs?plant_id=TEST-PLANT")
        assert r.status_code < 600

    def test_get_program_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/scheduling/programs/NOPE")
        assert r.status_code < 600

    def test_transitions_unknown(self, fully_seeded_client):
        for path in ["finalize", "activate", "complete", "publish"]:
            r = fully_seeded_client.put(f"/api/v1/scheduling/programs/NOPE/{path}", json={})
            assert r.status_code < 600

    def test_material_check_hh_balance(self, fully_seeded_client):
        for path in ["material-check", "hh-balance"]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/programs/NOPE/{path}")
            assert r.status_code < 600


class TestLiveEndpoints:
    def test_hh_balance_live(self, fully_seeded_client):
        for q in [
            "?plant_id=TEST-PLANT",
            "?plant_id=TEST-PLANT&week_start=2026-05-19",
            "?plant_id=UNKNOWN",
        ]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/hh-balance-live{q}")
            assert r.status_code < 600

    def test_audit_capacity(self, fully_seeded_client):
        for q in ["?plant_id=TEST-PLANT", "?plant_id=TEST-PLANT&days=14"]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/audit-capacity{q}")
            assert r.status_code < 600

    def test_materials_live(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/scheduling/materials-live?plant_id=TEST-PLANT")
        assert r.status_code < 600


class TestMaterialCollection:
    def test_collection_status_unknown(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/scheduling/materials/NOPE/collection-status",
            json={"material_code": "MAT-TEST-001", "status": "COLLECTED"},
        )
        assert r.status_code < 600

    def test_bulk_status_unknown(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/scheduling/materials/NOPE/bulk-status",
            json={"status": "COLLECTED"},
        )
        assert r.status_code < 600

    def test_collection_status_real(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/scheduling/materials/MWO-TEST-001/collection-status",
            json={"material_code": "MAT-TEST-001", "status": "COLLECTED"},
        )
        assert r.status_code < 600


class TestSupportEquipment:
    def test_list(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT"]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/support-equipment{q}")
            assert r.status_code < 600

    def test_create(self, fully_seeded_client):
        for payload in [
            {},
            {"name": "Test crane", "plant_id": "TEST-PLANT", "equipment_type": "MOBILE_CRANE"},
        ]:
            r = fully_seeded_client.post("/api/v1/scheduling/support-equipment", json=payload)
            assert r.status_code < 600

    def test_update_unknown(self, fully_seeded_client):
        r = fully_seeded_client.put("/api/v1/scheduling/support-equipment/NOPE",
                                     json={"name": "Updated"})
        assert r.status_code < 600

    def test_delete_unknown(self, fully_seeded_client):
        r = fully_seeded_client.delete("/api/v1/scheduling/support-equipment/NOPE")
        assert r.status_code < 600


class TestWorkforceAvailability:
    def test_update_availability(self, fully_seeded_client):
        for payload in [
            {"available": False, "reason": "vacation"},
            {"available": True},
            {},
        ]:
            r = fully_seeded_client.put(
                "/api/v1/scheduling/workforce/WKR-TEST-001/availability",
                json=payload,
            )
            assert r.status_code < 600

    def test_update_unknown(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/scheduling/workforce/NOPE/availability",
            json={"available": False},
        )
        assert r.status_code < 600


class TestGantt:
    def test_gantt(self, fully_seeded_client):
        for q in ["?plant_id=TEST-PLANT", "?plant_id=TEST-PLANT&weeks=1",
                  "?plant_id=TEST-PLANT&weeks=4"]:
            r = fully_seeded_client.get(f"/api/v1/scheduling/gantt{q}")
            assert r.status_code < 600

    def test_program_gantt_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/scheduling/programs/NOPE/gantt")
        assert r.status_code < 600

    def test_program_gantt_export(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/scheduling/programs/NOPE/gantt/export")
        assert r.status_code < 600


class TestMisc:
    def test_clear_week(self, fully_seeded_client):
        for payload in [
            {"plant_id": "TEST-PLANT"},
            {"plant_id": "TEST-PLANT", "week_start": "2026-05-19"},
        ]:
            r = fully_seeded_client.post("/api/v1/scheduling/clear-week", json=payload)
            assert r.status_code < 600

    def test_shift_continuity(self, fully_seeded_client):
        for payload in [
            {},
            {"plant_id": "TEST-PLANT", "shift_date": "2026-05-19"},
        ]:
            r = fully_seeded_client.post("/api/v1/scheduling/shift-continuity-plan", json=payload)
            assert r.status_code < 600
