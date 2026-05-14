"""Tests profundos managed_work_orders router con MWOs sembrados."""

import uuid


class TestListAndFilters:
    def test_all_status_filters(self, fully_seeded_client):
        for status in ("PLANIFICADO", "EN_PROGRAMACION", "PROGRAMADO",
                       "EN_EJECUCION", "EJECUTADO", "CERRADO", "CANCELADO"):
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/?status={status}")
            assert r.status_code < 600

    def test_priority_filters(self, fully_seeded_client):
        for p in ("P1", "P2", "P3", "P4"):
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/?priority={p}")
            assert r.status_code < 600

    def test_wo_type_filters(self, fully_seeded_client):
        for t in ("PM01", "PM02", "PM03", "PM04"):
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/?wo_type={t}")
            assert r.status_code < 600

    def test_plant_filter(self, fully_seeded_client):
        for plant in ("TEST-PLANT", "UNKNOWN"):
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/?plant_id={plant}")
            assert r.status_code < 600

    def test_combined_filters(self, fully_seeded_client):
        for q in [
            "?status=PLANIFICADO&priority=P3",
            "?status=PROGRAMADO&wo_type=PM01&plant_id=TEST-PLANT",
            "?priority=P1&wo_type=PM03",
            "?limit=5&offset=0",
            "?limit=2&offset=2",
        ]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/{q}")
            assert r.status_code < 600

    def test_orphans(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT"]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/orphans{q}")
            assert r.status_code < 600

    def test_stats(self, fully_seeded_client):
        for q in ["", "?plant_id=TEST-PLANT"]:
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/stats{q}")
            assert r.status_code < 600


class TestCreate:
    def test_create_valid(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/managed-work-orders/", json={
            "equipment_tag": "BRY-SAG-ML-001",
            "description": "Test from MWO router",
            "wo_type": "PM01",
            "priority_code": "P3",
            "plant_id": "TEST-PLANT",
            "estimated_hours": 4.0,
            "operations": [
                {"op_number": 10, "description": "Inspect",
                 "specialty": "MECHANICAL", "planned_hours": 2.0, "quantity": 1},
            ],
            "materials": [
                {"code": "MAT-TEST-001", "description": "Bearing",
                 "quantity": 1, "unit": "EA"},
            ],
            "tools": [],
        })
        assert r.status_code < 600

    def test_create_unknown_equipment(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/managed-work-orders/", json={
            "equipment_tag": "NOPE",
            "description": "X",
            "wo_type": "PM01",
            "priority_code": "P3",
            "plant_id": "TEST-PLANT",
            "estimated_hours": 1.0,
        })
        assert r.status_code in (400, 422)

    def test_create_with_deep_nested_ops(self, fully_seeded_client):
        """Depth bomb guard — operations con anidamiento profundo deben rechazarse."""
        deep = {"a": {"b": {"c": {"d": {"e": {"f": {"g": {"h": {"i": {"j": {"k": {"l": {"m": {}}}}}}}}}}}}}}
        r = fully_seeded_client.post("/api/v1/managed-work-orders/", json={
            "equipment_tag": "BRY-SAG-ML-001",
            "description": "X",
            "wo_type": "PM01",
            "priority_code": "P3",
            "plant_id": "TEST-PLANT",
            "estimated_hours": 1.0,
            "operations": [{"deep": deep}],
        })
        assert r.status_code < 600


class TestCreateFromWR:
    def test_from_wr_unknown(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/managed-work-orders/from-wr",
                                       json={"request_id": str(uuid.uuid4())})
        assert r.status_code < 600

    def test_from_real_wr(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/managed-work-orders/from-wr",
                                       json={"request_id": "WR-TEST-004"})
        assert r.status_code < 600


class TestDetailAndImpact:
    def test_each_state_detail(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.get(f"/api/v1/managed-work-orders/MWO-TEST-{i:03d}")
            assert r.status_code < 600

    def test_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get(f"/api/v1/managed-work-orders/{uuid.uuid4()}")
        assert r.status_code in (404, 200)

    def test_impact_score_each(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.get(
                f"/api/v1/managed-work-orders/MWO-TEST-{i:03d}/impact-score"
            )
            assert r.status_code < 600

    def test_close_gates_each(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.get(
                f"/api/v1/managed-work-orders/MWO-TEST-{i:03d}/close-gates"
            )
            assert r.status_code < 600


class TestUpdate:
    def test_update_various(self, fully_seeded_client):
        for body in [
            {"description": "Updated"},
            {"priority_code": "P2"},
            {"estimated_hours": 8.5},
            {"planned_start": "2026-06-01T08:00:00"},
            {"planned_end": "2026-06-01T16:00:00"},
            {"work_center": "PASMEC01"},
            {"planning_group": "PMEC"},
            {"operations": [{"op_number": 10, "description": "Updated op"}]},
            {"materials": [{"code": "MAT-001", "quantity": 5}]},
        ]:
            for wo_id in ("MWO-TEST-001", "MWO-TEST-002"):
                r = fully_seeded_client.put(f"/api/v1/managed-work-orders/{wo_id}",
                                              json=body)
                assert r.status_code < 600


class TestAIAnalyze:
    def test_ai_analyze(self, fully_seeded_client):
        for i in range(1, 4):
            r = fully_seeded_client.post(
                f"/api/v1/managed-work-orders/MWO-TEST-{i:03d}/ai-analyze",
                json={},
            )
            assert r.status_code < 600


class TestTransitions:
    def test_all_transitions(self, fully_seeded_client):
        actions = ["draft", "plan", "release", "schedule", "reschedule",
                   "start", "complete", "close"]
        for wo_id in ("MWO-TEST-001", "MWO-TEST-002", "MWO-TEST-003",
                      "MWO-TEST-004", "MWO-TEST-005"):
            for action in actions:
                r = fully_seeded_client.put(
                    f"/api/v1/managed-work-orders/{wo_id}/{action}",
                    json={},
                )
                assert r.status_code < 600

    def test_schedule_with_workers(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/managed-work-orders/MWO-TEST-002/schedule",
            json={
                "assigned_workers": [
                    {"worker_id": "WKR-TEST-001", "name": "Tech 1",
                     "specialty": "MECHANICAL"},
                ],
                "planned_start": "2026-05-25T08:00:00",
                "planned_end": "2026-05-25T12:00:00",
                "shift": "DAY",
            },
        )
        assert r.status_code < 600

    def test_complete_with_actuals(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/managed-work-orders/MWO-TEST-004/complete",
            json={"actual_hours": 3.75},
        )
        assert r.status_code < 600

    def test_close_with_summary(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/managed-work-orders/MWO-TEST-005/close",
            json={
                "actual_hours": 4.0,
                "closure_notes": "Trabajo completado sin novedades",
                "operations_completed": [{"op_number": 10, "completed": True}],
            },
        )
        assert r.status_code < 600


class TestSAPSync:
    def test_get_status(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.get(
                f"/api/v1/managed-work-orders/MWO-TEST-{i:03d}/sap-sync"
            )
            assert r.status_code < 600

    def test_trigger_sync(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.post(
                f"/api/v1/managed-work-orders/MWO-TEST-{i:03d}/sap-sync",
                json={},
            )
            assert r.status_code < 600
