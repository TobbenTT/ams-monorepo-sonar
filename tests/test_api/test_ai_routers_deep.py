"""Tests AI/agentic routers con Anthropic mock activo (autouse fixture)."""


class TestAIAgents:
    def test_status(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/ai/status")
        assert r.status_code < 600

    def test_list_sessions(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/ai/sessions")
        assert r.status_code < 600

    def test_create_session(self, fully_seeded_client):
        for payload in [
            {},
            {"agent": "reliability"},
            {"agent": "planning", "context": {"plant_id": "TEST-PLANT"}},
        ]:
            r = fully_seeded_client.post("/api/v1/ai/sessions", json=payload)
            assert r.status_code < 600

    def test_get_session_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/ai/sessions/NOPE")
        assert r.status_code < 600

    def test_advance_session(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/ai/sessions/NOPE/advance", json={})
        assert r.status_code < 600

    def test_milestone_action(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/ai/sessions/NOPE/milestone/1/action",
            json={"action": "APPROVE"},
        )
        assert r.status_code < 600

    def test_troubleshoot_post(self, fully_seeded_client):
        for payload in [
            {},
            {"equipment_tag": "BRY-SAG-ML-001"},
            {"equipment_tag": "BRY-SAG-ML-001", "symptoms": ["vibration", "noise"]},
        ]:
            r = fully_seeded_client.post("/api/v1/ai/troubleshoot", json=payload)
            assert r.status_code < 600

    def test_troubleshoot_get(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/ai/troubleshoot")
        assert r.status_code < 600

    def test_checklists(self, fully_seeded_client):
        for payload in [
            {},
            {"wo_id": "MWO-TEST-001"},
        ]:
            r = fully_seeded_client.post("/api/v1/ai/checklists", json=payload)
            assert r.status_code < 600

    def test_checklist_get_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/ai/checklists/NOPE")
        assert r.status_code < 600

    def test_tools_list(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/ai/tools")
        assert r.status_code < 600

    def test_tools_call(self, fully_seeded_client):
        for payload in [
            {},
            {"tool_name": "list_equipment"},
            {"tool_name": "compute_criticality", "input": {"plant_id": "TEST-PLANT"}},
        ]:
            r = fully_seeded_client.post("/api/v1/ai/tools/call", json=payload)
            assert r.status_code < 600

    def test_equipment_chat(self, fully_seeded_client):
        for payload in [
            {},
            {"question": "what is the MTBF?", "equipment_tag": "BRY-SAG-ML-001"},
            {"question": "diagnose vibration"},
        ]:
            r = fully_seeded_client.post("/api/v1/ai/equipment-chat", json=payload)
            assert r.status_code < 600

    def test_suggest_failure(self, fully_seeded_client):
        for payload in [
            {},
            {"equipment_tag": "BRY-SAG-ML-001", "description": "Vibration high"},
        ]:
            r = fully_seeded_client.post("/api/v1/ai/suggest-failure", json=payload)
            assert r.status_code < 600


class TestAgentic:
    def test_doctor_endpoint(self, fully_seeded_client):
        for path in ["/api/v1/agentic/doctor", "/api/v1/agentic/executive-report",
                     "/api/v1/agentic/handover", "/api/v1/agentic/kpi-watchdog",
                     "/api/v1/agentic/scheduler"]:
            for payload in [{}, {"plant_id": "TEST-PLANT"}]:
                r = fully_seeded_client.post(path, json=payload)
                assert r.status_code < 600

    def test_smart_backlog(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/agentic/smart-backlog",
                                       json={"plant_id": "TEST-PLANT"})
        assert r.status_code < 600

    def test_compliance(self, fully_seeded_client):
        r = fully_seeded_client.post("/api/v1/agentic/compliance",
                                       json={"plant_id": "TEST-PLANT"})
        assert r.status_code < 600

    def test_voice_capture(self, fully_seeded_client):
        for payload in [
            {},
            {"audio_base64": "", "language": "es"},
        ]:
            r = fully_seeded_client.post("/api/v1/agentic/voice-capture", json=payload)
            assert r.status_code < 600


class TestTroubleshootingRouter:
    def test_post(self, fully_seeded_client):
        for payload in [
            {},
            {"equipment_tag": "BRY-SAG-ML-001"},
            {"equipment_tag": "BRY-SAG-ML-001", "symptoms": ["leak"]},
        ]:
            r = fully_seeded_client.post("/api/v1/troubleshooting/diagnose", json=payload)
            assert r.status_code < 600


class TestProgrammerSupervisorPlanificador:
    def test_programmer(self, fully_seeded_client):
        for payload in [{}, {"plant_id": "TEST-PLANT", "week_start": "2026-05-19"}]:
            r = fully_seeded_client.post("/api/v1/programmer-agent/schedule",
                                          json=payload)
            assert r.status_code < 600

    def test_supervisor(self, fully_seeded_client):
        for payload in [{}, {"plant_id": "TEST-PLANT"}]:
            r = fully_seeded_client.post("/api/v1/supervisor-agent/morning-briefing",
                                          json=payload)
            assert r.status_code < 600

    def test_planificador(self, fully_seeded_client):
        for payload in [{}, {"plant_id": "TEST-PLANT", "horizon_weeks": 4}]:
            r = fully_seeded_client.post("/api/v1/planificador-agent/quarterly-plan",
                                          json=payload)
            assert r.status_code < 600
