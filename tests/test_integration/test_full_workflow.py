"""Integration tests — end-to-end workflow across modules.

Tests the complete flow: seed → hierarchy → criticality → FMEA → RCM →
tasks → scheduling → RCA → KPIs → feedback.
"""

import pytest


class TestEndToEndWorkflow:
    """Full M1-M4 workflow integration test."""

    def test_seed_and_browse_hierarchy(self, seeded_client):
        """Step 1: Verify seeded data is accessible."""
        resp = seeded_client.get("/api/v1/hierarchy/plants")
        assert resp.status_code == 200
        plants = resp.json()
        assert len(plants) >= 1
        assert any(p["plant_id"] == "TEST-PLANT" for p in plants)

        # Browse nodes
        resp = seeded_client.get("/api/v1/hierarchy/nodes", params={"plant_id": "TEST-PLANT"})
        assert resp.status_code == 200
        nodes = resp.json()
        assert len(nodes) >= 4

    def test_hierarchy_stats(self, seeded_client):
        """Step 2: Verify hierarchy stats aggregation."""
        resp = seeded_client.get("/api/v1/hierarchy/stats", params={"plant_id": "TEST-PLANT"})
        assert resp.status_code == 200
        stats = resp.json()
        assert stats.get("EQUIPMENT", 0) >= 1

    def test_criticality_assessment(self, seeded_client):
        """Step 3: Run criticality assessment on equipment."""
        eq_id = seeded_client._test_ids["equipment_node_id"]
        scores = [{"category": cat, "consequence_level": 3} for cat in [
            "SAFETY", "HEALTH", "ENVIRONMENT", "PRODUCTION", "OPERATING_COST",
            "CAPITAL_COST", "SCHEDULE", "REVENUE", "COMMUNICATIONS", "COMPLIANCE", "REPUTATION",
        ]]
        resp = seeded_client.post("/api/v1/criticality/assess", json={
            "node_id": eq_id, "criteria_scores": scores, "probability": 3,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "risk_class" in data
        assert "overall_score" in data

    def test_fmea_fm_validation(self, seeded_client):
        """Step 4: Validate failure mode combinations."""
        resp = seeded_client.get("/api/v1/fmea/fm-combinations")
        assert resp.status_code == 200
        combos = resp.json()
        assert combos.get("total_combinations", 0) >= 72

    def test_rcm_decision(self, seeded_client):
        """Step 5: Run RCM decision tree."""
        resp = seeded_client.post("/api/v1/fmea/rcm-decide", json={
            "is_hidden": False,
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "cbm_technically_feasible": True,
            "cbm_economically_viable": True,
            "ft_feasible": True,
            "failure_pattern": "B_AGE",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "strategy_type" in data
        assert "path" in data

    def test_rca_create_and_5w2h(self, seeded_client):
        """Step 6: Create RCA and run 5W+2H analysis."""
        # Create
        resp = seeded_client.post("/api/v1/rca/analyses", json={
            "event_description": "Integration test: pump seal failure",
            "plant_id": "TEST-PLANT",
            "max_consequence": 4,
            "frequency": 3,
        })
        assert resp.status_code == 200
        rca = resp.json()
        analysis_id = rca["analysis_id"]
        assert rca["status"] == "OPEN"

        # 5W+2H
        resp2 = seeded_client.post(f"/api/v1/rca/analyses/{analysis_id}/5w2h", json={
            "what": "Pump seal failure causing oil leak",
            "when": "2026-02-20 08:30",
            "where": "SAG Mill lubrication system",
            "who": "Maintenance crew A",
            "why": "Seal degradation from heat",
            "how": "Visible oil leak at shaft seal",
            "how_much": "4 hours downtime",
        })
        assert resp2.status_code == 200
        assert "5w2h" in resp2.json()

    def test_planning_kpis(self, seeded_client):
        """Step 7: Calculate planning KPIs."""
        from datetime import date, timedelta
        today = date.today()
        resp = seeded_client.post("/api/v1/rca/planning-kpis/calculate", json={
            "plant_id": "TEST-PLANT",
            "period_start": (today - timedelta(days=7)).isoformat(),
            "period_end": today.isoformat(),
            "wo_planned": 100, "wo_completed": 92,
            "manhours_planned": 800.0, "manhours_actual": 780.0,
            "pm_planned": 50, "pm_executed": 48,
            "backlog_hours": 300.0, "weekly_capacity_hours": 200.0,
            "corrective_count": 15, "total_wo": 100,
            "schedule_compliance_planned": 90,
            "schedule_compliance_executed": 82,
            "release_horizon_days": 5,
            "pending_notices": 12, "total_notices": 100,
            "scheduled_capacity_hours": 170.0,
            "total_capacity_hours": 200.0,
            "proactive_wo": 75, "planned_wo": 88,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["kpis"]) == 11
        assert data["overall_health"] in ("HEALTHY", "AT_RISK", "CRITICAL")

    def test_de_kpis(self, seeded_client):
        """Step 8: Calculate DE KPIs."""
        from datetime import date, timedelta
        today = date.today()
        resp = seeded_client.post("/api/v1/rca/de-kpis/calculate", json={
            "plant_id": "TEST-PLANT",
            "period_start": (today - timedelta(days=30)).isoformat(),
            "period_end": today.isoformat(),
            "events_reported": 18, "events_required": 20,
            "meetings_held": 9, "meetings_required": 10,
            "actions_implemented": 14, "actions_planned": 16,
            "savings_achieved": 85000.0, "savings_target": 100000.0,
            "failures_current": 8, "failures_previous": 12,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "kpis" in data
        assert "health" in data

    def test_feedback_submission(self, client):
        """Step 9: Submit and retrieve user feedback."""
        resp = client.post("/api/v1/admin/feedback", json={
            "page": "hierarchy",
            "rating": 5,
            "comment": "Integration test feedback",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "received"

        # List feedback
        resp2 = client.get("/api/v1/admin/feedback", params={"page": "hierarchy"})
        assert resp2.status_code == 200
        feedback = resp2.json()
        assert len(feedback) == 1
        assert feedback[0]["rating"] == 5

    def test_admin_stats(self, seeded_client):
        """Step 10: Verify system stats endpoint."""
        resp = seeded_client.get("/api/v1/admin/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["plants"] >= 1
        assert data["total_nodes"] >= 4


class TestCrossModuleConsistency:
    """Verify data consistency across modules."""

    def test_rca_summary_matches_individual(self, client):
        """RCA summary counts should match individual analyses."""
        # Create 3 RCAs
        for i in range(3):
            client.post("/api/v1/rca/analyses", json={
                "event_description": f"Event {i+1}",
                "plant_id": "CROSS-TEST",
            })

        # Check summary
        summary = client.get("/api/v1/rca/analyses/summary", params={"plant_id": "CROSS-TEST"}).json()
        assert summary["total"] == 3
        assert summary["open"] == 3

        # List should match
        items = client.get("/api/v1/rca/analyses", params={"plant_id": "CROSS-TEST"}).json()
        assert len(items) == 3

    def test_kpi_snapshots_persist(self, client):
        """KPI calculations should be stored as snapshots."""
        from datetime import date, timedelta
        today = date.today()

        # Calculate twice
        for _ in range(2):
            client.post("/api/v1/rca/planning-kpis/calculate", json={
                "plant_id": "SNAP-TEST",
                "period_start": (today - timedelta(days=7)).isoformat(),
                "period_end": today.isoformat(),
                "wo_planned": 100, "wo_completed": 90,
                "manhours_planned": 800, "manhours_actual": 750,
                "pm_planned": 50, "pm_executed": 45,
                "backlog_hours": 400, "weekly_capacity_hours": 200,
                "corrective_count": 20, "total_wo": 100,
                "schedule_compliance_planned": 85,
                "schedule_compliance_executed": 78,
                "release_horizon_days": 3,
                "pending_notices": 15, "total_notices": 100,
                "scheduled_capacity_hours": 160,
                "total_capacity_hours": 200,
                "proactive_wo": 65, "planned_wo": 80,
            })

        # Should have 2 snapshots
        snapshots = client.get("/api/v1/rca/planning-kpis", params={"plant_id": "SNAP-TEST"}).json()
        assert len(snapshots) == 2

    def test_health_endpoint(self, client):
        """Health check should always return ok."""
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_root_endpoint(self, client):
        """Root endpoint should list all modules."""
        resp = client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert "modules" in data
        assert "rca" in data["modules"]
