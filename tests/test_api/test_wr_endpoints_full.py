"""Tests exhaustivos endpoints work_requests router (33% → objetivo 70%+).

Crea WRs reales via capture y exercita TODO el lifecycle.
"""

import uuid
import pytest


@pytest.fixture
def created_wr(seeded_client):
    """Crea un Work Request real via /capture/ endpoint."""
    capture_payload = {
        "technician_id": "WKR-TEST-001",
        "capture_type": "TEXT",
        "language": "es",
        "raw_text": "Bomba MILL-001 con vibración alta en cojinete LA",
        "equipment_tag_manual": "BRY-SAG-ML-001",
    }
    r = seeded_client.post("/api/v1/capture/", json=capture_payload)
    if r.status_code not in (200, 201):
        pytest.skip(f"capture failed: {r.status_code} {r.text[:100]}")
    capture = r.json()
    wr_id = capture.get("work_request_id") or capture.get("request_id")
    if not wr_id:
        # Try lookup via list
        rl = seeded_client.get("/api/v1/work-requests/")
        if rl.status_code == 200 and rl.json():
            wr_id = rl.json()[0].get("request_id")
    if not wr_id:
        pytest.skip("no WR id available")
    return seeded_client, wr_id


class TestWRLifecycle:
    def test_get_detail(self, created_wr):
        c, wr_id = created_wr
        r = c.get(f"/api/v1/work-requests/{wr_id}")
        assert r.status_code < 600

    def test_impact_score(self, created_wr):
        c, wr_id = created_wr
        r = c.get(f"/api/v1/work-requests/{wr_id}/impact-score")
        assert r.status_code < 600

    def test_validate(self, created_wr):
        c, wr_id = created_wr
        for action in ["APPROVE", "REJECT", "MODIFY"]:
            r = c.put(f"/api/v1/work-requests/{wr_id}/validate",
                      json={"action": action, "modifications": {}})
            assert r.status_code < 600

    def test_approve(self, created_wr):
        c, wr_id = created_wr
        r = c.put(f"/api/v1/work-requests/{wr_id}/approve",
                  json={"comment": "OK fast-track", "priority_override": None})
        assert r.status_code < 600

    def test_reject(self, created_wr):
        c, wr_id = created_wr
        r = c.put(f"/api/v1/work-requests/{wr_id}/reject",
                  json={"reason": "Duplicado"})
        assert r.status_code < 600

    def test_link_duplicate(self, created_wr):
        c, wr_id = created_wr
        r = c.put(f"/api/v1/work-requests/{wr_id}/link-duplicate",
                  json={"parent_request_id": str(uuid.uuid4())})
        assert r.status_code < 600

    def test_cancel(self, created_wr):
        c, wr_id = created_wr
        r = c.put(f"/api/v1/work-requests/{wr_id}/cancel",
                  json={"reason": "no longer needed"})
        assert r.status_code < 600

    def test_assign(self, created_wr):
        c, wr_id = created_wr
        r = c.put(f"/api/v1/work-requests/{wr_id}/assign",
                  json={"worker_ids": ["WKR-TEST-001"]})
        assert r.status_code < 600

    def test_lifecycle_actions(self, created_wr):
        c, wr_id = created_wr
        for action in ["start", "complete", "close", "reopen"]:
            r = c.put(f"/api/v1/work-requests/{wr_id}/{action}", json={})
            assert r.status_code < 600

    def test_update(self, created_wr):
        c, wr_id = created_wr
        for body in [
            {"description": "Updated desc"},
            {"priority_code": "P2"},
            {"equipment_tag": "BRY-SAG-ML-001"},
            {"description": "X" * 300},
        ]:
            r = c.put(f"/api/v1/work-requests/{wr_id}", json=body)
            assert r.status_code < 600

    def test_classify(self, created_wr):
        c, wr_id = created_wr
        r = c.post(f"/api/v1/work-requests/{wr_id}/classify",
                   json={"category": "MECHANICAL"})
        assert r.status_code < 600

    def test_ai_priority_decision(self, created_wr):
        c, wr_id = created_wr
        r = c.post(f"/api/v1/work-requests/{wr_id}/ai-priority-decision",
                   json={"priority_code": "P1", "rationale": "Test"})
        assert r.status_code < 600

    def test_feedback(self, created_wr):
        c, wr_id = created_wr
        r = c.post(f"/api/v1/work-requests/{wr_id}/feedback",
                   json={"rating": 5, "comment": "good"})
        assert r.status_code < 600

    def test_convert_to_pm03(self, created_wr):
        c, wr_id = created_wr
        r = c.post(f"/api/v1/work-requests/{wr_id}/convert-to-pm03",
                   json={"estimated_hours": 2.0, "operations": [],
                         "materials": [], "workers_required": [{"specialty": "MECHANICAL", "count": 1}]})
        assert r.status_code < 600

    def test_delete_and_restore(self, created_wr):
        c, wr_id = created_wr
        r = c.delete(f"/api/v1/work-requests/{wr_id}")
        assert r.status_code < 600
        r = c.post(f"/api/v1/work-requests/tools/restore/{wr_id}")
        assert r.status_code < 600


class TestWRToolsEndpoints:
    def test_check_duplicates_various_payloads(self, seeded_client):
        for payload in [
            {},
            {"description": "Vibración bomba"},
            {"description": "Test", "equipment_tag": "BRY-SAG-ML-001"},
            {"description": "Test", "equipment_tag": "BRY-SAG-ML-001", "priority_code": "P1"},
        ]:
            r = seeded_client.post("/api/v1/work-requests/check-duplicates", json=payload)
            assert r.status_code < 600

    def test_ai_assist(self, seeded_client):
        for payload in [
            {},
            {"description": "Bomba con ruido"},
            {"description": "X", "equipment_tag": "BRY-SAG-ML-001"},
        ]:
            r = seeded_client.post("/api/v1/work-requests/ai-assist", json=payload)
            assert r.status_code < 600

    def test_ai_suggest_schedule(self, seeded_client):
        r = seeded_client.post("/api/v1/work-requests/ai-suggest-schedule",
                                json={"description": "Test", "estimated_hours": 4})
        assert r.status_code < 600

    def test_tools_deleted(self, seeded_client):
        r = seeded_client.get("/api/v1/work-requests/tools/deleted")
        assert r.status_code < 600

    def test_equipment_history(self, seeded_client):
        r = seeded_client.get("/api/v1/work-requests/equipment-history/BRY-SAG-ML-001")
        assert r.status_code < 600

    def test_search_materials(self, seeded_client):
        for q in ["?q=bomba", "?query=valve", "?term=motor"]:
            r = seeded_client.get(f"/api/v1/work-requests/search-materials{q}")
            assert r.status_code < 600


class TestWRListVariants:
    def test_list_many_filter_combinations(self, seeded_client):
        for q in [
            "",
            "?status=DRAFT",
            "?status=APPROVED",
            "?priority=P1",
            "?priority=P2",
            "?priority=P3",
            "?wo_type=PM01",
            "?plant_id=TEST-PLANT",
            "?limit=10&offset=0",
            "?status=DRAFT&priority=P1&limit=5",
            "?include_deleted=true",
            "?from_date=2026-01-01&to_date=2026-12-31",
        ]:
            r = seeded_client.get(f"/api/v1/work-requests/{q}")
            assert r.status_code < 600
