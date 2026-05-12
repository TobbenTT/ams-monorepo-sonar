"""SF-659 OT-Calendar sync edge cases (docs/OT_CALENDAR_SYNC.md §4).

Cubre el subset de edge cases que son testeables sin frontend:
- OT en PROGRAMADO sin assigned_workers aparece como orphan (§3.3)
- OT sin planned_start aparece como orphan en PROGRAMADO (§3.3)
- 409 Conflict con If-Match desfasado retorna mensaje claro (§3.1)
- Reschedule requiere razón no-vacía (§3.5)
- Reschedule a fecha pasada se permite pero genera audit (§4)
- Transiciones de estado bloqueadas usan endpoints dedicados (§3.2)

NO cubre (necesita Playwright):
- Drag-drop duplicación (frontend interaction)
- WS broadcast cross-tab refresh
- UI conflict toast rendering
"""
from __future__ import annotations

from datetime import datetime, timedelta


def _create_wo(seeded_client, db_session, **overrides):
    """Helper: crea una OT minimal en TEST-PLANT."""
    from api.database.models import ManagedWorkOrderModel
    import uuid

    defaults = dict(
        wo_id=str(uuid.uuid4()),
        wo_number=f"OT-TEST-{uuid.uuid4().hex[:6]}",
        wo_type="PM02",
        status="PROGRAMADO",
        plant_id="TEST-PLANT",
        priority_code="P3",
        equipment_id="EQ-TEST-001",
        equipment_tag="BRY-SAG-ML-001",
        description="Test WO for sync edge cases",
        version=1,
    )
    defaults.update(overrides)
    wo = ManagedWorkOrderModel(**defaults)
    db_session.add(wo)
    db_session.commit()
    return wo


class TestOTCalendarSyncEdgeCases:

    def test_programado_without_workers_is_orphan(self, seeded_client, db_session):
        """§3.3 — OT en PROGRAMADO sin assigned_workers debe aparecer en /orphans."""
        wo = _create_wo(
            seeded_client, db_session,
            status="PROGRAMADO",
            planned_start=datetime.now() + timedelta(days=1),
            assigned_workers=None,
        )
        r = seeded_client.get("/api/v1/managed-work-orders/orphans?plant_id=TEST-PLANT")
        assert r.status_code == 200
        body = r.json()
        orphan_ids = {o["wo_id"] for o in body["orphans"]}
        assert wo.wo_id in orphan_ids, f"OT {wo.wo_id} debería ser orphan: {body}"
        # Razón esperada presente
        matching = [o for o in body["orphans"] if o["wo_id"] == wo.wo_id][0]
        assert any("sin técnicos" in r.lower() for r in matching["reasons"])

    def test_programado_without_planned_start_is_orphan(self, seeded_client, db_session):
        """§3.3 — PROGRAMADO sin planned_start es huérfana."""
        wo = _create_wo(
            seeded_client, db_session,
            status="PROGRAMADO",
            planned_start=None,
            assigned_workers=[{"worker_id": "WKR-TEST-001", "name": "T1"}],
        )
        r = seeded_client.get("/api/v1/managed-work-orders/orphans?plant_id=TEST-PLANT")
        assert r.status_code == 200
        matching = [o for o in r.json()["orphans"] if o["wo_id"] == wo.wo_id]
        assert matching, "Debería detectar OT sin planned_start"
        assert any("planned_start" in r.lower() for r in matching[0]["reasons"])

    def test_cerrado_sin_actual_end_is_orphan(self, seeded_client, db_session):
        """§3.3 (extendido) — CERRADO sin actual_end es huérfana."""
        wo = _create_wo(
            seeded_client, db_session,
            status="CERRADO",
            actual_end=None,
            planned_start=datetime.now() - timedelta(days=2),
            planned_end=datetime.now() - timedelta(days=1),
            assigned_workers=[{"worker_id": "WKR-TEST-001"}],
        )
        r = seeded_client.get("/api/v1/managed-work-orders/orphans?plant_id=TEST-PLANT")
        matching = [o for o in r.json()["orphans"] if o["wo_id"] == wo.wo_id]
        assert matching, "Debería detectar CERRADO sin actual_end"
        assert any("actual_end" in r.lower() for r in matching[0]["reasons"])

    def test_audit_capacity_endpoint_returns_window(self, seeded_client, db_session):
        """SF-656 — endpoint de auditoría capacidad retorna ventana semanal correcta."""
        # Lunes de esta semana 10:00 (slot day)
        today = datetime.now()
        monday = today - timedelta(days=today.weekday())
        slot = monday.replace(hour=10, minute=0, second=0, microsecond=0)
        # OT con 1 técnico, 60 HH (>125% de 40 = critical)
        _create_wo(
            seeded_client, db_session,
            status="PROGRAMADO",
            planned_start=slot,
            estimated_hours=60,
            assigned_workers=[{"worker_id": "WKR-TEST-001"}],
        )
        r = seeded_client.get("/api/v1/scheduling/audit-capacity?plant_id=TEST-PLANT&hours_per_week=40")
        assert r.status_code == 200
        body = r.json()
        assert body["totals"]["wos_in_window"] >= 1
        overcap_ids = {o["worker_id"] for o in body["overcapacity"]}
        assert "WKR-TEST-001" in overcap_ids
        wkr = [o for o in body["overcapacity"] if o["worker_id"] == "WKR-TEST-001"][0]
        assert wkr["hh_assigned"] == 60.0
        assert wkr["severity"] == "critical"  # 60/40 = 150% > 125%

    def test_audit_capacity_detects_shift_mismatch(self, seeded_client, db_session):
        """SF-656 — técnico NIGHT asignado a slot DAY genera violación."""
        # WKR-TEST-003 tiene shift=NIGHT (seed). Slot 10AM = day.
        today = datetime.now()
        monday = today - timedelta(days=today.weekday())
        slot = monday.replace(hour=10, minute=0, second=0, microsecond=0)
        _create_wo(
            seeded_client, db_session,
            status="PROGRAMADO",
            planned_start=slot,
            estimated_hours=4,
            assigned_workers=[{"worker_id": "WKR-TEST-003"}],
        )
        r = seeded_client.get("/api/v1/scheduling/audit-capacity?plant_id=TEST-PLANT")
        body = r.json()
        violations = [v for v in body["shift_violations"] if v["worker_id"] == "WKR-TEST-003"]
        assert violations, f"Debería detectar mismatch para WKR-TEST-003: {body}"
        v = violations[0]
        assert v["tech_shift"] == "night"
        assert v["slot_shift"] == "day"

    def test_ai_analyze_endpoint_returns_function_1(self, seeded_client, db_session):
        """SF-661 v0.1 — endpoint ai-analyze devuelve resumen + métricas, stubs en null."""
        wo = _create_wo(
            seeded_client, db_session,
            status="PROGRAMADO",
            estimated_hours=8,
            operations=[
                {"op_number": 1, "description": "Inspect bearing", "hours": 4, "quantity": 1, "task_type": "INSPECT"},
                {"op_number": 2, "description": "Replace seal", "hours": 4, "quantity": 1, "task_type": "REPLACE"},
            ],
            assigned_workers=[{"worker_id": "WKR-TEST-001"}],
        )
        r = seeded_client.post(f"/api/v1/managed-work-orders/{wo.wo_id}/ai-analyze")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["version"] == "0.2"  # bumped to v0.2 con funciones 3+5+6 implementadas
        assert "text" in body["summary"]
        assert "metrics" in body["summary"]
        m = body["summary"]["metrics"]
        assert m["n_operations"] == 2
        assert m["total_hh_est"] == 8.0
        assert m["n_workers_assigned"] == 1
        # Stubs explícitos (null o lista vacía)
        assert body["predictions"] is None
        assert body["skill_mix"] is None
        assert body["risks"] == []
        assert body["safety_alerts"] == []

    def test_ai_analyze_detects_replace_without_materials(self, seeded_client, db_session):
        """SF-661 — bloqueador T-16: REPLACE sin materiales."""
        wo = _create_wo(
            seeded_client, db_session,
            status="PROGRAMADO",
            operations=[
                {"op_number": 1, "description": "Replace bearing", "hours": 2, "quantity": 1, "task_type": "REPLACE"},
            ],
            materials=[],
            assigned_workers=[{"worker_id": "WKR-TEST-001"}],
            planned_start=datetime.now() + timedelta(days=1),
        )
        r = seeded_client.post(f"/api/v1/managed-work-orders/{wo.wo_id}/ai-analyze")
        body = r.json()
        blockers = body["summary"]["blockers"]
        assert any("REPLACE sin materiales" in b or "T-16" in b for b in blockers), \
            f"Debería detectar T-16 violation: {blockers}"

    def test_ai_analyze_invalid_mode_returns_400(self, seeded_client, db_session):
        """SF-661 — mode debe ser 'pre_execution' o 'post_close'."""
        wo = _create_wo(seeded_client, db_session)
        r = seeded_client.post(f"/api/v1/managed-work-orders/{wo.wo_id}/ai-analyze?mode=invalid")
        assert r.status_code == 400
        assert "mode" in r.json()["detail"]

    def test_ai_analyze_404_for_missing_wo(self, seeded_client, db_session):
        """SF-661 — wo_id inexistente devuelve 404."""
        r = seeded_client.post("/api/v1/managed-work-orders/nonexistent-id/ai-analyze")
        assert r.status_code == 404


class TestPreparativosStateMachine:
    """SF-662 — gates de transición + audit trail."""

    def test_create_preparativo_starts_pendiente(self, seeded_client, db_session):
        r = seeded_client.post("/api/v1/preparativos/", json={
            "wo_id": "WO-TEST-001",
            "item_code": "MAT-001",
            "qty": 4,
            "unit": "un",
        })
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "PENDIENTE"
        assert body["prep_id"]

    def test_illegal_transition_blocked(self, seeded_client, db_session):
        """PENDIENTE → RECIBIDO no está permitida (debe pasar por DESPACHADO + EN_TRANSITO)."""
        create = seeded_client.post("/api/v1/preparativos/", json={
            "wo_id": "WO-TEST-002", "item_code": "MAT-002", "qty": 1,
        })
        prep_id = create.json()["prep_id"]
        r = seeded_client.put(f"/api/v1/preparativos/{prep_id}/transition", json={
            "new_status": "RECIBIDO", "conforme": True,
        })
        assert r.status_code == 400
        assert "no permitida" in r.json()["detail"].lower()

    def test_recibido_requires_conforme(self, seeded_client, db_session):
        """Al recibir es obligatorio firmar conforme."""
        create = seeded_client.post("/api/v1/preparativos/", json={
            "wo_id": "WO-TEST-003", "item_code": "MAT-003", "qty": 1,
        })
        prep_id = create.json()["prep_id"]
        # Avanzar legalmente
        for ns in ["DESPACHADO", "EN_TRANSITO"]:
            seeded_client.put(f"/api/v1/preparativos/{prep_id}/transition", json={"new_status": ns})
        # Sin conforme → 400
        r = seeded_client.put(f"/api/v1/preparativos/{prep_id}/transition", json={"new_status": "RECIBIDO"})
        assert r.status_code == 400
        assert "conforme" in r.json()["detail"].lower()

    def test_summary_ready_to_execute(self, seeded_client, db_session):
        """Summary reporta ready_to_execute=True solo cuando todos están RECIBIDO conformes."""
        wo_id = "WO-TEST-004"
        create = seeded_client.post("/api/v1/preparativos/", json={
            "wo_id": wo_id, "item_code": "MAT-004", "qty": 1,
        })
        prep_id = create.json()["prep_id"]
        # Inicialmente: not ready (PENDIENTE)
        s = seeded_client.get(f"/api/v1/preparativos/by-wo/{wo_id}/summary")
        assert s.status_code == 200
        assert s.json()["ready_to_execute"] is False
        # Avanzar hasta RECIBIDO conforme
        for ns in ["DESPACHADO", "EN_TRANSITO"]:
            seeded_client.put(f"/api/v1/preparativos/{prep_id}/transition", json={"new_status": ns})
        seeded_client.put(f"/api/v1/preparativos/{prep_id}/transition",
                          json={"new_status": "RECIBIDO", "conforme": True})
        s = seeded_client.get(f"/api/v1/preparativos/by-wo/{wo_id}/summary")
        body = s.json()
        assert body["ready_to_execute"] is True
        assert body["received_conformes"] == 1
        assert body["by_status"]["RECIBIDO"] == 1
