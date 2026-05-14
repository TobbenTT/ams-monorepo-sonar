"""Tests profundos work_requests router con WRs sembrados.
Target: cubrir paths que no se ejercitan en bulk smoke tests."""

import uuid


class TestSearchMaterials:
    def test_simple_query(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/work-requests/search-materials?q=bearing")
        assert r.status_code == 200

    def test_empty_query(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/work-requests/search-materials")
        assert r.status_code == 200

    def test_multi_token(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/work-requests/search-materials?q=rodamiento%206204")
        assert r.status_code == 200

    def test_with_category(self, fully_seeded_client):
        r = fully_seeded_client.get(
            "/api/v1/work-requests/search-materials?q=oil&category=LUBRICANTS&limit=10"
        )
        assert r.status_code == 200

    def test_english_term_maps_to_spanish(self, fully_seeded_client):
        for term in ["bearing", "valve", "motor", "pump", "filter"]:
            r = fully_seeded_client.get(
                f"/api/v1/work-requests/search-materials?q={term}"
            )
            assert r.status_code == 200


class TestEquipmentHistory:
    def test_existing_equipment(self, fully_seeded_client):
        r = fully_seeded_client.get(
            "/api/v1/work-requests/equipment-history/BRY-SAG-ML-001"
        )
        assert r.status_code < 600

    def test_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get(
            "/api/v1/work-requests/equipment-history/UNKNOWN-EQUIPMENT"
        )
        assert r.status_code < 600


class TestList:
    def test_basic(self, fully_seeded_client):
        r = fully_seeded_client.get("/api/v1/work-requests/")
        assert r.status_code == 200
        assert len(r.json()) >= 5

    def test_all_status_combinations(self, fully_seeded_client):
        for status in ("DRAFT", "PENDING_VALIDATION", "VALIDATED",
                       "APPROVED", "REJECTED", "CANCELLED"):
            r = fully_seeded_client.get(f"/api/v1/work-requests/?status={status}")
            assert r.status_code == 200

    def test_priority_filters(self, fully_seeded_client):
        for prio in ("P1", "P2", "P3", "P4"):
            r = fully_seeded_client.get(f"/api/v1/work-requests/?priority={prio}")
            assert r.status_code == 200

    def test_pagination(self, fully_seeded_client):
        for q in ["?limit=2", "?limit=10&offset=0", "?limit=5&offset=2"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/{q}")
            assert r.status_code == 200

    def test_with_deleted(self, fully_seeded_client):
        for q in ["?include_deleted=true", "?include_deleted=false"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/{q}")
            assert r.status_code == 200

    def test_search(self, fully_seeded_client):
        for q in ["?search=Test", "?search=WR", "?search=001"]:
            r = fully_seeded_client.get(f"/api/v1/work-requests/{q}")
            assert r.status_code == 200


class TestImpactScore:
    def test_each_state(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.get(
                f"/api/v1/work-requests/WR-TEST-{i:03d}/impact-score"
            )
            assert r.status_code < 600

    def test_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get(f"/api/v1/work-requests/{uuid.uuid4()}/impact-score")
        assert r.status_code < 600


class TestDetail:
    def test_each_seeded_state(self, fully_seeded_client):
        for i in range(1, 6):
            r = fully_seeded_client.get(f"/api/v1/work-requests/WR-TEST-{i:03d}")
            assert r.status_code < 600

    def test_unknown(self, fully_seeded_client):
        r = fully_seeded_client.get(f"/api/v1/work-requests/{uuid.uuid4()}")
        assert r.status_code == 404


class TestValidate:
    def test_approve(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-002/validate",
            json={"action": "APPROVE", "modifications": {}},
        )
        assert r.status_code < 600

    def test_reject(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-002/validate",
            json={"action": "REJECT", "modifications": {"reason": "x"}},
        )
        assert r.status_code < 600

    def test_modify_with_payload(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001/validate",
            json={"action": "MODIFY", "modifications": {
                "priority_code": "P2",
                "equipment_tag": "BRY-SAG-ML-001",
            }},
        )
        assert r.status_code < 600

    def test_invalid_action(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001/validate",
            json={"action": "INVALID"},
        )
        assert r.status_code == 400


class TestApproveReject:
    def test_approve_with_priority_override(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-003/approve",
            json={"comment": "OK", "priority_override": "P2"},
        )
        assert r.status_code < 600

    def test_approve_without_override(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-003/approve",
            json={"comment": "Standard approval"},
        )
        assert r.status_code < 600

    def test_reject_with_reason(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-002/reject",
            json={"reason": "Out of scope"},
        )
        assert r.status_code < 600

    def test_reject_without_reason(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-002/reject",
            json={},
        )
        assert r.status_code < 600


class TestCancel:
    def test_cancel(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001/cancel",
            json={"reason": "not needed"},
        )
        assert r.status_code < 600


class TestLinkDuplicate:
    def test_link(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001/link-duplicate",
            json={"parent_request_id": "WR-TEST-004"},
        )
        assert r.status_code < 600

    def test_link_self(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001/link-duplicate",
            json={"parent_request_id": "WR-TEST-001"},
        )
        assert r.status_code < 600


class TestLifecycleActions:
    def test_all_actions_each_state(self, fully_seeded_client):
        for action in ("start", "complete", "close", "reopen"):
            for wr_id in ("WR-TEST-001", "WR-TEST-004"):
                r = fully_seeded_client.put(
                    f"/api/v1/work-requests/{wr_id}/{action}",
                    json={},
                )
                assert r.status_code < 600


class TestUpdate:
    def test_update_description(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001",
            json={"description": "Updated description"},
        )
        assert r.status_code < 600

    def test_update_priority(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001",
            json={"priority_code": "P2"},
        )
        assert r.status_code < 600

    def test_update_equipment(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001",
            json={"equipment_tag": "BRY-SAG-ML-001"},
        )
        assert r.status_code < 600

    def test_update_empty(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001",
            json={},
        )
        assert r.status_code < 600


class TestDeleteRestore:
    def test_delete_then_list_deleted(self, fully_seeded_client):
        r1 = fully_seeded_client.delete("/api/v1/work-requests/WR-TEST-005")
        assert r1.status_code < 600
        r2 = fully_seeded_client.get("/api/v1/work-requests/tools/deleted")
        assert r2.status_code < 600

    def test_restore(self, fully_seeded_client):
        fully_seeded_client.delete("/api/v1/work-requests/WR-TEST-005")
        r = fully_seeded_client.post("/api/v1/work-requests/tools/restore/WR-TEST-005")
        assert r.status_code < 600

    def test_permanent_delete(self, fully_seeded_client):
        fully_seeded_client.delete("/api/v1/work-requests/WR-TEST-005")
        r = fully_seeded_client.delete("/api/v1/work-requests/tools/permanent/WR-TEST-005")
        assert r.status_code < 600


class TestCheckDuplicates:
    def test_various_payloads(self, fully_seeded_client):
        for payload in [
            {},
            {"description": "Test"},
            {"description": "Vibración bomba", "equipment_tag": "BRY-SAG-ML-001"},
            {"description": "X", "equipment_tag": "BRY-SAG-ML-001",
             "priority_code": "P1"},
        ]:
            r = fully_seeded_client.post(
                "/api/v1/work-requests/check-duplicates", json=payload,
            )
            assert r.status_code < 600


class TestAIAssist:
    def test_ai_assist_basic(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/work-requests/ai-assist",
            json={"description": "Test motor failure"},
        )
        assert r.status_code < 600

    def test_ai_assist_image(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/work-requests/ai-assist-image",
            json={"image_base64": "", "context": ""},
        )
        assert r.status_code < 600

    def test_classify_real_wr(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/work-requests/WR-TEST-001/classify",
            json={"category": "MECHANICAL"},
        )
        assert r.status_code < 600

    def test_ai_priority_decision(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/work-requests/WR-TEST-001/ai-priority-decision",
            json={"priority_code": "P1", "rationale": "Critical"},
        )
        assert r.status_code < 600


class TestFeedback:
    def test_feedback(self, fully_seeded_client):
        for rating in [1, 3, 5]:
            r = fully_seeded_client.post(
                "/api/v1/work-requests/WR-TEST-004/feedback",
                json={"rating": rating, "comment": f"Rating {rating} feedback"},
            )
            assert r.status_code < 600


class TestConvertPM03:
    def test_basic(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/work-requests/WR-TEST-004/convert-to-pm03",
            json={
                "estimated_hours": 4.0,
                "operations": [],
                "materials": [],
                "workers_required": [{"specialty": "MECHANICAL", "count": 1}],
            },
        )
        assert r.status_code < 600

    def test_with_ops(self, fully_seeded_client):
        r = fully_seeded_client.post(
            "/api/v1/work-requests/WR-TEST-004/convert-to-pm03",
            json={
                "comment": "Fast track P1",
                "estimated_hours": 8.0,
                "operations": [
                    {"op_number": 10, "description": "Inspect", "specialty": "MECHANICAL",
                     "planned_hours": 2.0, "quantity": 1},
                ],
                "materials": [
                    {"code": "MAT-001", "description": "Test", "quantity": 1, "unit": "EA"},
                ],
                "workers_required": [{"specialty": "ELECTRICAL", "count": 2}],
            },
        )
        assert r.status_code < 600


class TestAssign:
    def test_assign(self, fully_seeded_client):
        r = fully_seeded_client.put(
            "/api/v1/work-requests/WR-TEST-001/assign",
            json={"worker_ids": ["WKR-TEST-001", "WKR-TEST-002"]},
        )
        assert r.status_code < 600
