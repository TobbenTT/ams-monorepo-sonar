"""End-to-end integration test — full OCP maintenance workflow.

Tests the complete data lifecycle:
  1. Auth: register user → login → JWT token
  2. Hierarchy: create plant → area → system → equipment
  3. Criticality: assess equipment → approve
  4. FMEA: function → functional failure → failure mode → RCM decision
  5. Tasks: create maintenance task → link to failure mode
  6. Work Packages: create → approve
  7. Capture: submit field data → auto-creates work request
  8. Work Requests: list → get → validate → from-hierarchy
  9. Backlog: add from work request → list → optimize
 10. Scheduling: create program → finalize → complete
 11. RCA: create → 5W2H → advance status
 12. Dashboard: executive → KPI summary → alerts
 13. Analytics: Weibull fit → RPN calculation
 14. Reporting: feedback submit & list → admin stats
 15. Cross-module data consistency checks

All tests use an in-memory SQLite database — no external services required.
"""

import uuid

import pytest
from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from api.database.connection import Base, get_db
import api.database.models  # noqa: F401 — ensure all models are imported
from api.main import app


# ═══════════════════════════════════════════════════════════════════════
# TEST DATABASE SETUP
# ═══════════════════════════════════════════════════════════════════════

TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(test_engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


@pytest.fixture(autouse=True)
def test_db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """HTTP client with test DB injected."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ─── Helper: create admin user directly in DB (bypasses auth requirement) ──
def _create_admin_user(db_session):
    from api.database.models import UserModel
    from api.services.auth_service import hash_password

    admin = UserModel(
        user_id="admin-e2e-001",
        email="admin@ocp-test.com",
        username="admin_e2e",
        hashed_password=hash_password("Admin1234!"),
        full_name="E2E Admin",
        role="admin",
        plant_id=None,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    return admin


def _login(client, username="admin_e2e", password="Admin1234!"):
    resp = client.post("/api/v1/auth/login", json={
        "username": username, "password": password,
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ═══════════════════════════════════════════════════════════════════════
# TEST CLASS: FULL WORKFLOW
# ═══════════════════════════════════════════════════════════════════════

class TestFullWorkflow:
    """Runs the complete OCP maintenance workflow end-to-end."""

    # ── 1. AUTH ────────────────────────────────────────────────────────

    def test_01_auth_register_login(self, client, db_session):
        """Register admin, login, verify JWT works."""
        _create_admin_user(db_session)
        login_data = _login(client)

        assert "access_token" in login_data
        assert "refresh_token" in login_data
        assert login_data["user"]["username"] == "admin_e2e"
        assert login_data["user"]["role"] == "admin"

        # Verify /me endpoint with token
        headers = _auth_headers(login_data["access_token"])
        me = client.get("/api/v1/auth/me", headers=headers)
        assert me.status_code == 200
        assert me.json()["email"] == "admin@ocp-test.com"

    def test_02_auth_register_new_user_via_admin(self, client, db_session):
        """Admin registers a planner user, planner logs in."""
        _create_admin_user(db_session)
        login_data = _login(client)
        headers = _auth_headers(login_data["access_token"])

        # Register planner
        resp = client.post("/api/v1/auth/register", headers=headers, json={
            "email": "planner@ocp-test.com",
            "username": "planner_e2e",
            "password": "Planner123!",
            "full_name": "E2E Planner",
            "role": "planner",
            "plant_id": "OCP-JFC1",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "planner"

        # Planner logs in
        planner_login = _login(client, "planner_e2e", "Planner123!")
        assert planner_login["user"]["role"] == "planner"

    def test_03_auth_token_refresh(self, client, db_session):
        """Refresh token generates new access+refresh token pair."""
        _create_admin_user(db_session)
        login_data = _login(client)

        resp = client.post("/api/v1/auth/refresh", json={
            "refresh_token": login_data["refresh_token"],
        })
        assert resp.status_code == 200
        new_tokens = resp.json()
        assert "access_token" in new_tokens
        assert "refresh_token" in new_tokens
        assert new_tokens["user"]["username"] == "admin_e2e"

    def test_04_auth_change_password(self, client, db_session):
        """Change password and verify new password works."""
        _create_admin_user(db_session)
        login_data = _login(client)
        headers = _auth_headers(login_data["access_token"])

        resp = client.put("/api/v1/auth/change-password", headers=headers, json={
            "current_password": "Admin1234!",
            "new_password": "NewAdmin1234!",
        })
        assert resp.status_code == 200

        # Old password should fail
        resp2 = client.post("/api/v1/auth/login", json={
            "username": "admin_e2e", "password": "Admin1234!",
        })
        assert resp2.status_code == 401

        # New password works
        resp3 = _login(client, "admin_e2e", "NewAdmin1234!")
        assert resp3["user"]["username"] == "admin_e2e"

    # ── 2. HIERARCHY ──────────────────────────────────────────────────

    def test_10_hierarchy_create_full_tree(self, client, db_session):
        """Create plant + full hierarchy (plant → area → system → equipment)."""
        # Create plant
        resp = client.post("/api/v1/hierarchy/plants", json={
            "plant_id": "E2E-PLANT",
            "name": "E2E Test Plant",
            "name_fr": "Usine E2E",
            "location": "32.28N, 8.52W",
        })
        assert resp.status_code == 200
        assert resp.json()["plant_id"] == "E2E-PLANT"

        # Create area node
        area = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "AREA",
            "name": "Grinding Area",
            "name_fr": "Zone de broyage",
            "code": "E2E-BRY",
            "level": 2,
            "plant_id": "E2E-PLANT",
        })
        assert area.status_code == 200
        area_id = area.json()["node_id"]

        # Create system node
        system = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "SYSTEM",
            "name": "SAG Mill System",
            "name_fr": "Systeme Broyeur SAG",
            "code": "E2E-BRY-SAG",
            "parent_node_id": area_id,
            "level": 3,
            "plant_id": "E2E-PLANT",
        })
        assert system.status_code == 200
        system_id = system.json()["node_id"]

        # Create equipment node
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT",
            "name": "SAG Mill #1",
            "name_fr": "Broyeur SAG #1",
            "code": "E2E-SAG-001",
            "tag": "E2E-SAG-001",
            "parent_node_id": system_id,
            "level": 4,
            "plant_id": "E2E-PLANT",
            "criticality": "AA",
            "metadata_json": {"manufacturer": "FLSmidth", "model": "SAG 12x6"},
        })
        assert equip.status_code == 200
        equip_id = equip.json()["node_id"]
        assert equip.json()["tag"] == "E2E-SAG-001"

        # Verify hierarchy
        plants = client.get("/api/v1/hierarchy/plants")
        assert any(p["plant_id"] == "E2E-PLANT" for p in plants.json())

        nodes = client.get("/api/v1/hierarchy/nodes", params={"plant_id": "E2E-PLANT"})
        assert len(nodes.json()) >= 3

        # Verify subtree from area
        subtree = client.get(f"/api/v1/hierarchy/nodes/{area_id}/tree")
        assert subtree.status_code == 200
        assert len(subtree.json()) >= 3  # area + system + equipment

        # Verify stats
        stats = client.get("/api/v1/hierarchy/stats", params={"plant_id": "E2E-PLANT"})
        assert stats.status_code == 200
        stats_data = stats.json()
        assert stats_data.get("AREA", 0) >= 1
        assert stats_data.get("EQUIPMENT", 0) >= 1

    # ── 3. CRITICALITY ────────────────────────────────────────────────

    def test_20_criticality_assess_and_approve(self, client, db_session):
        """Assess equipment criticality, verify, and approve."""
        # Setup: create plant + equipment
        client.post("/api/v1/hierarchy/plants", json={
            "plant_id": "CRIT-PLANT", "name": "Criticality Test",
        })
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Pump A",
            "code": "CRIT-PUMP-001", "tag": "CRIT-PUMP-001",
            "level": 4, "plant_id": "CRIT-PLANT",
        })
        equip_id = equip.json()["node_id"]

        # Assess criticality with full matrix
        scores = [
            {"category": "SAFETY", "consequence_level": 4},
            {"category": "HEALTH", "consequence_level": 3},
            {"category": "ENVIRONMENT", "consequence_level": 3},
            {"category": "PRODUCTION", "consequence_level": 5},
            {"category": "OPERATING_COST", "consequence_level": 4},
            {"category": "CAPITAL_COST", "consequence_level": 4},
            {"category": "SCHEDULE", "consequence_level": 3},
            {"category": "REVENUE", "consequence_level": 5},
            {"category": "COMMUNICATIONS", "consequence_level": 2},
            {"category": "COMPLIANCE", "consequence_level": 3},
            {"category": "REPUTATION", "consequence_level": 3},
        ]
        resp = client.post("/api/v1/criticality/assess", json={
            "node_id": equip_id,
            "criteria_scores": scores,
            "probability": 4,
            "method": "FULL_MATRIX",
            "assessed_by": "e2e_tester",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "risk_class" in data
        assert "overall_score" in data
        assert data["overall_score"] > 0
        assessment_id = data["assessment_id"]

        # Verify assessment is retrievable
        get_resp = client.get(f"/api/v1/criticality/{equip_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["risk_class"] == data["risk_class"]
        assert get_resp.json()["status"] == "DRAFT"

        # Approve assessment
        approve_resp = client.put(f"/api/v1/criticality/{assessment_id}/approve")
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "APPROVED"

    def test_21_criticality_risk_class_determination(self, client):
        """Risk class determination from overall score."""
        resp = client.post("/api/v1/criticality/risk-class", json={"overall_score": 85.0})
        assert resp.status_code == 200
        assert "risk_class" in resp.json()

    # ── 4. FMEA ───────────────────────────────────────────────────────

    def test_30_fmea_full_pipeline(self, client, db_session):
        """Function → Functional Failure → Failure Mode → RCM Decision."""
        # Setup hierarchy
        client.post("/api/v1/hierarchy/plants", json={
            "plant_id": "FMEA-PLANT", "name": "FMEA Test",
        })
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Motor FMEA",
            "code": "FMEA-MOT-001", "level": 4, "plant_id": "FMEA-PLANT",
        })
        equip_id = equip.json()["node_id"]

        # Create function
        func_resp = client.post("/api/v1/fmea/functions", json={
            "node_id": equip_id,
            "function_type": "PRIMARY",
            "description": "Drive SAG mill at 8500 kW continuously",
            "description_fr": "Entrainer le broyeur SAG a 8500 kW en continu",
        })
        assert func_resp.status_code == 200
        func_id = func_resp.json()["function_id"]

        # Verify function is listed
        funcs = client.get("/api/v1/fmea/functions", params={"node_id": equip_id})
        assert len(funcs.json()) == 1
        assert funcs.json()[0]["function_id"] == func_id

        # Create functional failure
        ff_resp = client.post("/api/v1/fmea/functional-failures", json={
            "function_id": func_id,
            "failure_type": "TOTAL",
            "description": "Motor fails to run (0 kW output)",
            "description_fr": "Le moteur ne tourne pas (0 kW)",
        })
        assert ff_resp.status_code == 200
        ff_id = ff_resp.json()["failure_id"]

        # Verify functional failure
        ffs = client.get("/api/v1/fmea/functional-failures", params={"function_id": func_id})
        assert len(ffs.json()) == 1

        # Create failure mode
        fm_resp = client.post("/api/v1/fmea/failure-modes", json={
            "functional_failure_id": ff_id,
            "what": "Bearing",
            "mechanism": "WEARS",
            "cause": "RELATIVE_MOVEMENT",
            "failure_pattern": "B_AGE",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "is_hidden": False,
            "strategy_type": "CONDITION_BASED",
            "failure_effect": {
                "evidence": "High vibration on drive end",
                "production_impact": "Complete SAG mill shutdown",
                "physical_damage": "Bearing seizure may damage shaft",
                "estimated_downtime_hours": 48.0,
            },
        })
        assert fm_resp.status_code == 200
        fm_id = fm_resp.json()["failure_mode_id"]
        assert fm_resp.json()["strategy_type"] == "CONDITION_BASED"

        # Get failure mode details
        fm_detail = client.get(f"/api/v1/fmea/failure-modes/{fm_id}")
        assert fm_detail.status_code == 200
        assert fm_detail.json()["mechanism"] == "WEARS"
        assert fm_detail.json()["failure_effect"]["estimated_downtime_hours"] == 48.0

        # List failure modes for the functional failure
        fms_list = client.get("/api/v1/fmea/failure-modes", params={"functional_failure_id": ff_id})
        assert len(fms_list.json()) == 1

        # RCM decision logic
        rcm_resp = client.post("/api/v1/fmea/rcm-decide", json={
            "is_hidden": False,
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "cbm_technically_feasible": True,
            "cbm_economically_viable": True,
            "ft_feasible": True,
            "failure_pattern": "B_AGE",
        })
        assert rcm_resp.status_code == 200
        assert "strategy_type" in rcm_resp.json()
        assert "path" in rcm_resp.json()

    def test_31_fmea_validate_combinations(self, client):
        """Validate FM mechanism+cause combinations."""
        # Valid combination
        valid = client.get("/api/v1/fmea/validate-fm", params={
            "mechanism": "WEARS", "cause": "RELATIVE_MOVEMENT",
        })
        assert valid.status_code == 200

        # Get all combinations
        combos = client.get("/api/v1/fmea/fm-combinations")
        assert combos.status_code == 200
        assert combos.json().get("total_combinations", 0) >= 72

    def test_32_fmea_rpn_calculation(self, client):
        """RPN (Risk Priority Number) calculation."""
        resp = client.post("/api/v1/fmea/fmeca/rpn", json={
            "severity": 8, "occurrence": 5, "detection": 3,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["rpn"] == 120  # 8 * 5 * 3

    def test_33_fmeca_worksheet_lifecycle(self, client, db_session):
        """FMECA worksheet create → list → get."""
        resp = client.post("/api/v1/fmea/fmeca/worksheets", json={
            "equipment_id": "EQ-FMECA-001",
            "equipment_tag": "SAG-ML-001",
            "equipment_name": "SAG Mill Primary",
            "analyst": "e2e_tester",
        })
        assert resp.status_code == 200
        ws_id = resp.json()["worksheet_id"]

        # List worksheets
        ws_list = client.get("/api/v1/fmea/fmeca/worksheets")
        assert len(ws_list.json()) >= 1

        # Get specific worksheet
        ws_detail = client.get(f"/api/v1/fmea/fmeca/worksheets/{ws_id}")
        assert ws_detail.status_code == 200
        assert ws_detail.json()["equipment_tag"] == "SAG-ML-001"

    # ── 5. TASKS ──────────────────────────────────────────────────────

    def test_40_tasks_create_and_link(self, client, db_session):
        """Create maintenance task, link to failure mode."""
        # Setup FMEA chain
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "TASK-PLANT", "name": "Tasks"})
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Motor", "code": "TASK-MOT",
            "level": 4, "plant_id": "TASK-PLANT",
        })
        func = client.post("/api/v1/fmea/functions", json={
            "node_id": equip.json()["node_id"], "function_type": "PRIMARY",
            "description": "Drive pump",
        })
        ff = client.post("/api/v1/fmea/functional-failures", json={
            "function_id": func.json()["function_id"], "failure_type": "TOTAL",
            "description": "Motor stops",
        })
        fm = client.post("/api/v1/fmea/failure-modes", json={
            "functional_failure_id": ff.json()["failure_id"],
            "mechanism": "WEARS", "cause": "RELATIVE_MOVEMENT",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "strategy_type": "CONDITION_BASED", "what": "Bearing",
        })
        fm_id = fm.json()["failure_mode_id"]

        # Create task
        task_resp = client.post("/api/v1/tasks/", json={
            "name": "Inspect motor bearing vibration",
            "name_fr": "Inspecter vibration roulement",
            "task_type": "INSPECT",
            "constraint": "ONLINE",
            "frequency_value": 4,
            "frequency_unit": "WEEKS",
            "consequences": "Bearing seizure",
            "labour_resources": [
                {"specialty": "CONMON_SPECIALIST", "quantity": 1, "hours_per_person": 0.5},
            ],
        })
        assert task_resp.status_code == 200
        task_id = task_resp.json()["task_id"]

        # Verify task
        task_detail = client.get(f"/api/v1/tasks/{task_id}")
        assert task_detail.status_code == 200
        assert task_detail.json()["task_type"] == "INSPECT"
        assert task_detail.json()["frequency_value"] == 4

        # Link task to failure mode
        link_resp = client.post(f"/api/v1/tasks/link-fm/{task_id}/{fm_id}")
        assert link_resp.status_code == 200
        assert link_resp.json()["failure_mode_id"] == fm_id

        # Verify task appears in list
        task_list = client.get("/api/v1/tasks/", params={"failure_mode_id": fm_id})
        assert any(t["task_id"] == task_id for t in task_list.json())

    def test_41_task_name_validation(self, client):
        """Task and work package name validation."""
        resp = client.post("/api/v1/tasks/validate-name", json={
            "name": "Inspect drive motor bearing",
            "task_type": "INSPECT",
        })
        assert resp.status_code == 200

        wp_resp = client.post("/api/v1/tasks/validate-wp-name", json={
            "name": "4W SAG MILL CONMON INSP ON",
        })
        assert wp_resp.status_code == 200

    # ── 6. WORK PACKAGES ──────────────────────────────────────────────

    def test_50_work_packages_create_and_approve(self, client, db_session):
        """Create work package, verify, approve."""
        # Setup: need a node_id
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "WP-PLANT", "name": "WP Test"})
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Pump WP",
            "code": "WP-PUMP-001", "tag": "WP-PUMP-001",
            "level": 4, "plant_id": "WP-PLANT",
        })
        node_id = equip.json()["node_id"]

        # Create work package
        wp_resp = client.post("/api/v1/work-packages/", json={
            "name": "4W PUMP CONMON INSP ON",
            "code": "WP-E2E-001",
            "node_id": node_id,
            "frequency_value": 4,
            "frequency_unit": "WEEKS",
            "constraint": "ONLINE",
            "access_time_hours": 0.0,
            "work_package_type": "STANDALONE",
            "allocated_tasks": [{"task_id": "dummy-task-1", "order": 1, "operation_number": 10}],
            "labour_summary": {
                "total_hours": 2.0,
                "by_specialty": [{"specialty": "MECHANICAL", "hours": 2.0, "people": 1}],
            },
        })
        assert wp_resp.status_code == 200
        wp_id = wp_resp.json()["work_package_id"]
        assert wp_resp.json()["status"] == "DRAFT"

        # Get work package
        wp_detail = client.get(f"/api/v1/work-packages/{wp_id}")
        assert wp_detail.status_code == 200
        assert wp_detail.json()["code"] == "WP-E2E-001"
        assert wp_detail.json()["constraint"] == "ONLINE"

        # Approve
        approve_resp = client.put(f"/api/v1/work-packages/{wp_id}/approve")
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "APPROVED"

        # Verify in list
        wp_list = client.get("/api/v1/work-packages/", params={"node_id": node_id})
        assert any(wp["work_package_id"] == wp_id for wp in wp_list.json())

    def test_51_work_packages_group_tasks(self, client):
        """Group backlog items into work packages."""
        resp = client.post("/api/v1/work-packages/group", json={
            "items": [
                {"backlog_id": "bl-1", "equipment_id": "EQ-1", "equipment_tag": "SAG-001",
                 "area_code": "BRY-SAG", "priority": "P2", "specialties_required": ["MECHANICAL"],
                 "shutdown_required": False, "materials_ready": True, "estimated_hours": 2.0},
                {"backlog_id": "bl-2", "equipment_id": "EQ-1", "equipment_tag": "SAG-001",
                 "area_code": "BRY-SAG", "priority": "P3", "specialties_required": ["MECHANICAL"],
                 "shutdown_required": False, "materials_ready": True, "estimated_hours": 1.5},
                {"backlog_id": "bl-3", "equipment_id": "EQ-2", "equipment_tag": "PUMP-001",
                 "area_code": "BRY-PMP", "priority": "P1", "specialties_required": ["ELECTRICAL"],
                 "shutdown_required": True, "materials_ready": False, "estimated_hours": 8.0},
            ],
        })
        assert resp.status_code == 200

    # ── 7. FIELD CAPTURE ──────────────────────────────────────────────

    def test_60_capture_submit_and_retrieve(self, client, db_session):
        """Submit field capture → auto-creates work request."""
        # Submit capture
        resp = client.post("/api/v1/capture/", json={
            "technician_id": "TECH-042",
            "technician_name": "Ahmed Benali",
            "capture_type": "TEXT",
            "language": "fr",
            "raw_text_input": "Le broyeur SAG fait un bruit anormal de vibration",
            "equipment_tag_manual": "SAG-ML-001",
            "location_hint": "Grinding Area",
        })
        assert resp.status_code == 200
        data = resp.json()
        capture_id = data.get("capture_id")
        assert capture_id is not None

        # Get capture detail
        detail = client.get(f"/api/v1/capture/{capture_id}")
        assert detail.status_code == 200
        assert detail.json()["technician_id"] == "TECH-042"
        assert detail.json()["language"] == "fr"

        # List captures
        capture_list = client.get("/api/v1/capture/")
        assert len(capture_list.json()) >= 1

    # ── 8. WORK REQUESTS ──────────────────────────────────────────────

    def test_70_work_requests_from_hierarchy(self, client, db_session):
        """Create work request directly from hierarchy view."""
        resp = client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "E2E-SAG-001",
            "equipment_name": "SAG Mill #1",
            "plant_id": "E2E-PLANT",
            "problem_description": "Excessive vibration detected during routine inspection",
            "priority": "P2",
        })
        assert resp.status_code == 200
        wr_id = resp.json()["request_id"]
        assert resp.json()["status"] == "DRAFT"

        # Get work request
        detail = client.get(f"/api/v1/work-requests/{wr_id}")
        assert detail.status_code == 200
        assert detail.json()["equipment_tag"] == "E2E-SAG-001"

        # List work requests
        wr_list = client.get("/api/v1/work-requests/")
        assert any(wr["request_id"] == wr_id for wr in wr_list.json())

        # Validate (approve)
        validate_resp = client.put(f"/api/v1/work-requests/{wr_id}/validate", json={
            "action": "APPROVE",
        })
        assert validate_resp.status_code == 200

    def test_71_work_requests_duplicate_check(self, client, db_session):
        """Check for duplicate work requests on same equipment."""
        # Create two WRs for the same equipment
        client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "DUP-TEST-001",
            "problem_description": "Issue 1",
        })
        client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "DUP-TEST-001",
            "problem_description": "Issue 2",
        })

        # Check duplicates
        resp = client.post("/api/v1/work-requests/check-duplicates", json={
            "equipment_tag": "DUP-TEST-001",
        })
        assert resp.status_code == 200
        assert resp.json()["duplicate_count"] >= 2

    def test_72_work_requests_ocr_closure(self, client):
        """OCR-based work order closure endpoint."""
        resp = client.post("/api/v1/work-requests/ocr-closure", json={
            "work_order_id": "WO-12345",
            "actual_hours": 4.5,
            "completion_date": "2026-03-01",
            "findings": "Bearing replaced successfully",
            "spare_parts_used": "SKF 22340 x1",
            "condition_after": "Good",
            "technician_notes": "Shaft journal in acceptable condition",
            "ocr_confidence": 85.0,
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "CLOSURE_SUBMITTED"
        assert resp.json()["sap_transaction"] == "IW32"

    # ── 9. BACKLOG ────────────────────────────────────────────────────

    def test_80_backlog_add_and_optimize(self, client, db_session):
        """Add work request to backlog, list, optimize."""
        # Create a work request first
        wr = client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "BL-SAG-001",
            "problem_description": "Scheduled maintenance needed",
            "priority": "P3",
        })
        wr_id = wr.json()["request_id"]

        # Add to backlog
        add_resp = client.post(f"/api/v1/backlog/add/{wr_id}")
        assert add_resp.status_code == 200

        # List backlog
        bl_list = client.get("/api/v1/backlog/")
        assert len(bl_list.json()) >= 1

        # Optimize backlog
        opt_resp = client.post("/api/v1/backlog/optimize", json={
            "plant_id": "BRY",
            "period_days": 30,
        })
        assert opt_resp.status_code == 200

    # ── 10. SCHEDULING ────────────────────────────────────────────────

    def test_90_scheduling_program_lifecycle(self, client, db_session):
        """Create program → finalize → activate → complete."""
        # Create weekly program
        prog_resp = client.post("/api/v1/scheduling/programs", json={
            "plant_id": "E2E-PLANT",
            "week_number": 12,
            "year": 2026,
        })
        assert prog_resp.status_code == 200
        prog_id = prog_resp.json()["program_id"]

        # Get program
        detail = client.get(f"/api/v1/scheduling/programs/{prog_id}")
        assert detail.status_code == 200
        assert detail.json()["week_number"] == 12
        assert detail.json()["status"] == "DRAFT"

        # Finalize
        fin_resp = client.put(f"/api/v1/scheduling/programs/{prog_id}/finalize")
        assert fin_resp.status_code == 200

        # Activate
        act_resp = client.put(f"/api/v1/scheduling/programs/{prog_id}/activate")
        assert act_resp.status_code == 200

        # Complete
        comp_resp = client.put(f"/api/v1/scheduling/programs/{prog_id}/complete")
        assert comp_resp.status_code == 200

        # List programs
        prog_list = client.get("/api/v1/scheduling/programs", params={"plant_id": "E2E-PLANT"})
        assert any(p["program_id"] == prog_id for p in prog_list.json())

    # ── 11. RCA ───────────────────────────────────────────────────────

    def test_100_rca_full_analysis(self, client, db_session):
        """Create RCA → 5W2H analysis → advance status."""
        # Create RCA
        rca_resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "SAG Mill bearing failure causing 48hr unplanned shutdown",
            "plant_id": "E2E-PLANT",
            "equipment_id": "EQ-SAG-001",
            "max_consequence": 4,
            "frequency": 3,
            "team_members": ["eng_relia", "mech_sup", "planner"],
        })
        assert rca_resp.status_code == 200
        rca_data = rca_resp.json()
        assert rca_data["status"] == "OPEN"
        analysis_id = rca_data["analysis_id"]

        # Run 5W2H
        w2h_resp = client.post(f"/api/v1/rca/analyses/{analysis_id}/5w2h", json={
            "what": "SAG Mill #1 drive end bearing failed catastrophically",
            "when": "2026-02-28 at 14:30 during normal operation",
            "where": "Grinding Area, SAG Mill drive end",
            "who": "Detected by vibration monitoring system, shift operator confirmed",
            "why": "Bearing exceeded operating life, lubrication contamination suspected",
            "how": "Progressive vibration increase over 2 weeks, final seizure",
            "how_much": "48hr shutdown, $250K production loss, $15K bearing + labor",
        })
        assert w2h_resp.status_code == 200

        # Advance to INVESTIGATING
        adv_resp = client.put(f"/api/v1/rca/analyses/{analysis_id}/advance", json={
            "status": "UNDER_INVESTIGATION",
        })
        assert adv_resp.status_code == 200

        # Get full RCA detail
        rca_detail = client.get(f"/api/v1/rca/analyses/{analysis_id}")
        assert rca_detail.status_code == 200
        assert rca_detail.json()["analysis_5w2h"] is not None

        # Summary
        summary = client.get("/api/v1/rca/analyses/summary")
        assert summary.status_code == 200
        assert summary.json()["total"] >= 1

        # List RCAs
        rca_list = client.get("/api/v1/rca/analyses", params={"plant_id": "E2E-PLANT"})
        assert any(r["analysis_id"] == analysis_id for r in rca_list.json())

    # ── 12. DASHBOARD ─────────────────────────────────────────────────

    def test_110_dashboard_endpoints(self, client, db_session):
        """Executive dashboard, KPI summary, alerts."""
        # Executive dashboard
        exec_resp = client.get("/api/v1/dashboard/executive/E2E-PLANT")
        assert exec_resp.status_code == 200
        assert exec_resp.json()["plant_id"] == "E2E-PLANT"
        assert "total_reports" in exec_resp.json()
        assert "total_notifications" in exec_resp.json()

        # KPI summary
        kpi_resp = client.get("/api/v1/dashboard/kpi-summary/E2E-PLANT")
        assert kpi_resp.status_code == 200
        assert "plant_id" in kpi_resp.json()

        # Alerts
        alerts_resp = client.get("/api/v1/dashboard/alerts/E2E-PLANT")
        assert alerts_resp.status_code == 200
        assert "total_active" in alerts_resp.json()

    # ── 13. ANALYTICS ─────────────────────────────────────────────────

    def test_120_analytics_weibull(self, client):
        """Weibull distribution fit from failure intervals."""
        resp = client.post("/api/v1/analytics/weibull-fit", json={
            "failure_intervals": [100, 200, 150, 300, 250, 180, 220, 170, 280, 190],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "beta" in data
        assert "eta" in data
        assert data["beta"] > 0
        assert data["eta"] > 0

    def test_121_analytics_health_score(self, client, db_session):
        """Health score calculation for equipment."""
        # Setup hierarchy
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "HS-PLANT", "name": "Health Score Test"})
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Pump HS",
            "code": "HS-PUMP-001", "tag": "HS-PUMP-001",
            "level": 4, "plant_id": "HS-PLANT",
        })
        node_id = equip.json()["node_id"]

        resp = client.post("/api/v1/analytics/health-score", json={
            "node_id": node_id,
            "plant_id": "HS-PLANT",
            "equipment_tag": "HS-PUMP-001",
            "risk_class": "III_HIGH",
            "pending_backlog_hours": 20.0,
            "capacity_hours_per_week": 40.0,
            "total_failure_modes": 10,
            "fm_with_strategy": 8,
            "active_alerts": 2,
            "critical_alerts": 0,
            "planned_wo": 5,
            "executed_on_time": 4,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "composite_score" in data
        assert "health_class" in data
        assert 0 <= data["composite_score"] <= 100

    def test_122_analytics_kpi(self, client, db_session):
        """KPI calculation for a plant."""
        resp = client.post("/api/v1/analytics/kpis", json={
            "plant_id": "E2E-PLANT",
            "failure_dates": ["2026-01-10", "2026-01-20", "2026-02-05"],
            "total_period_hours": 1440,
            "total_downtime_hours": 72,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)

    # ── 14. ADMIN & FEEDBACK ──────────────────────────────────────────

    def test_130_admin_stats(self, client, db_session):
        """Admin stats endpoint shows database counts."""
        # Setup some data
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "STATS-P", "name": "Stats Plant"})
        client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Eq 1", "code": "STATS-EQ-1",
            "level": 4, "plant_id": "STATS-P",
        })

        resp = client.get("/api/v1/admin/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["plants"] >= 1
        assert data["total_nodes"] >= 1

    def test_131_feedback_submit_and_list(self, client, db_session):
        """Submit feedback and retrieve it."""
        # Submit
        resp = client.post("/api/v1/admin/feedback", json={
            "page": "hierarchy",
            "rating": 5,
            "comment": "E2E test - hierarchy page works perfectly!",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "received"

        # Submit more
        client.post("/api/v1/admin/feedback", json={
            "page": "hierarchy", "rating": 4, "comment": "Good usability",
        })
        client.post("/api/v1/admin/feedback", json={
            "page": "dashboard", "rating": 3, "comment": "Needs more charts",
        })

        # List by page
        fb_hierarchy = client.get("/api/v1/admin/feedback", params={"page": "hierarchy"})
        assert fb_hierarchy.status_code == 200
        assert len(fb_hierarchy.json()) == 2

        # List all
        fb_all = client.get("/api/v1/admin/feedback")
        assert len(fb_all.json()) == 3

    def test_132_audit_log(self, client, db_session):
        """Audit log records actions."""
        resp = client.get("/api/v1/admin/audit-log")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    # ── 15. CROSS-MODULE DATA CONSISTENCY ─────────────────────────────

    def test_200_full_pipeline_consistency(self, client, db_session):
        """Complete pipeline: hierarchy → criticality → FMEA → tasks → WP → capture → backlog.
        Verifies data flows correctly between all modules."""

        # 1. Create plant + equipment hierarchy
        client.post("/api/v1/hierarchy/plants", json={
            "plant_id": "PIPE-PLANT", "name": "Pipeline Test Plant",
            "name_fr": "Usine Test Pipeline",
        })
        area = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "AREA", "name": "Processing Area",
            "code": "PIPE-PROC", "level": 2, "plant_id": "PIPE-PLANT",
        })
        area_id = area.json()["node_id"]

        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Slurry Pump #3",
            "code": "PIPE-PUMP-003", "tag": "PIPE-PUMP-003",
            "parent_node_id": area_id,
            "level": 4, "plant_id": "PIPE-PLANT",
        })
        equip_id = equip.json()["node_id"]

        # 2. Assess criticality
        scores = [{"category": cat, "consequence_level": lvl} for cat, lvl in [
            ("SAFETY", 3), ("HEALTH", 2), ("ENVIRONMENT", 2), ("PRODUCTION", 4),
            ("OPERATING_COST", 3), ("CAPITAL_COST", 3), ("SCHEDULE", 2),
            ("REVENUE", 4), ("COMMUNICATIONS", 1), ("COMPLIANCE", 2), ("REPUTATION", 2),
        ]]
        crit = client.post("/api/v1/criticality/assess", json={
            "node_id": equip_id, "criteria_scores": scores, "probability": 3,
        })
        assert crit.status_code == 200
        crit_class = crit.json()["risk_class"]

        # Verify criticality is saved
        crit_get = client.get(f"/api/v1/criticality/{equip_id}")
        assert crit_get.json()["risk_class"] == crit_class

        # 3. FMEA on this equipment
        func = client.post("/api/v1/fmea/functions", json={
            "node_id": equip_id,
            "function_type": "PRIMARY",
            "description": "Pump slurry at 450 m3/h",
        })
        func_id = func.json()["function_id"]

        ff = client.post("/api/v1/fmea/functional-failures", json={
            "function_id": func_id,
            "failure_type": "PARTIAL",
            "description": "Pump delivers less than 300 m3/h",
        })
        ff_id = ff.json()["failure_id"]

        fm = client.post("/api/v1/fmea/failure-modes", json={
            "functional_failure_id": ff_id,
            "what": "Impeller",
            "mechanism": "WEARS",
            "cause": "RELATIVE_MOVEMENT",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "strategy_type": "CONDITION_BASED",
        })
        fm_id = fm.json()["failure_mode_id"]

        # 4. Create maintenance task and link
        task = client.post("/api/v1/tasks/", json={
            "name": "Inspect pump impeller clearance",
            "task_type": "INSPECT",
            "constraint": "ONLINE",
            "frequency_value": 8,
            "frequency_unit": "WEEKS",
            "consequences": "Impeller wear reduces throughput",
        })
        task_id = task.json()["task_id"]
        client.post(f"/api/v1/tasks/link-fm/{task_id}/{fm_id}")

        # Verify task is linked
        task_detail = client.get(f"/api/v1/tasks/{task_id}")
        assert task_detail.status_code == 200

        # 5. Create work package
        wp = client.post("/api/v1/work-packages/", json={
            "name": "8W PUMP INSP ON",
            "code": "WP-PIPE-001",
            "node_id": equip_id,
            "frequency_value": 8,
            "frequency_unit": "WEEKS",
            "constraint": "ONLINE",
            "work_package_type": "STANDALONE",
            "allocated_tasks": [{"task_id": task_id, "order": 1, "operation_number": 10}],
        })
        wp_id = wp.json()["work_package_id"]

        # 6. Create work request for this equipment
        wr = client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "PIPE-PUMP-003",
            "plant_id": "PIPE-PLANT",
            "problem_description": "Impeller clearance exceeds acceptable limits",
            "priority": "P2",
        })
        wr_id = wr.json()["request_id"]

        # 7. Add to backlog
        bl = client.post(f"/api/v1/backlog/add/{wr_id}")
        assert bl.status_code == 200

        # 8. Verify backlog has the item
        backlog = client.get("/api/v1/backlog/", params={"equipment_tag": "PIPE-PUMP-003"})
        assert len(backlog.json()) >= 1

        # 9. Create scheduling program
        prog = client.post("/api/v1/scheduling/programs", json={
            "plant_id": "PIPE-PLANT", "week_number": 15, "year": 2026,
        })
        prog_id = prog.json()["program_id"]

        # 10. Create RCA for the event
        rca = client.post("/api/v1/rca/analyses", json={
            "event_description": "Pump #3 impeller failure",
            "plant_id": "PIPE-PLANT",
            "equipment_id": equip_id,
        })
        assert rca.json()["status"] == "OPEN"

        # 11. Submit feedback about the workflow
        client.post("/api/v1/admin/feedback", json={
            "page": "pipeline_test",
            "rating": 5,
            "comment": "Full pipeline test passed!",
        })

        # 12. Verify dashboard reflects data
        exec_dash = client.get("/api/v1/dashboard/executive/PIPE-PLANT")
        assert exec_dash.status_code == 200

        # 13. Verify admin stats reflect all created data
        stats = client.get("/api/v1/admin/stats")
        assert stats.json()["plants"] >= 1
        assert stats.json()["total_nodes"] >= 2

        # 14. Health score with real data
        hs = client.post("/api/v1/analytics/health-score", json={
            "node_id": equip_id,
            "plant_id": "PIPE-PLANT",
            "equipment_tag": "PIPE-PUMP-003",
            "risk_class": crit_class,
            "pending_backlog_hours": 8.0,
            "total_failure_modes": 1,
            "fm_with_strategy": 1,
        })
        assert hs.status_code == 200
        assert hs.json()["composite_score"] >= 0


# ═══════════════════════════════════════════════════════════════════════
# STANDALONE ENDPOINT TESTS (not dependent on workflow order)
# ═══════════════════════════════════════════════════════════════════════

class TestHealthAndRoot:
    """App startup, health check, and root endpoint."""

    def test_root_endpoint(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["project"] == "OCP Maintenance AI MVP"
        assert data["version"] == "1.0.0"
        assert "hierarchy" in data["modules"]
        assert "auth" in data["modules"]

    def test_health_check(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ("ok", "degraded")
        assert data["database"] == "ok"
        assert "build" in data

    def test_database_tables_exist(self, db_session):
        inspector = inspect(test_engine)
        tables = inspector.get_table_names()
        expected_tables = [
            "users", "plants", "hierarchy_nodes", "criticality_assessments",
            "functions", "functional_failures", "failure_modes",
            "maintenance_tasks", "work_packages", "work_orders",
            "field_captures", "work_requests", "backlog_items",
            "weekly_programs", "rca_analyses", "user_feedback",
            "health_scores", "kpi_metrics", "notifications", "reports",
            "fmeca_worksheets",
        ]
        for table in expected_tables:
            assert table in tables, f"Table '{table}' not found. Available: {tables}"


class TestErrorHandling:
    """Test 404s, validation errors, and edge cases."""

    def test_node_not_found(self, client):
        resp = client.get("/api/v1/hierarchy/nodes/nonexistent-uuid")
        assert resp.status_code == 404

    def test_criticality_not_found(self, client):
        resp = client.get("/api/v1/criticality/nonexistent-node")
        assert resp.status_code == 404

    def test_work_request_not_found(self, client):
        resp = client.get("/api/v1/work-requests/nonexistent-id")
        assert resp.status_code == 404

    def test_work_package_not_found(self, client):
        resp = client.get("/api/v1/work-packages/nonexistent-id")
        assert resp.status_code == 404

    def test_capture_not_found(self, client):
        resp = client.get("/api/v1/capture/nonexistent-id")
        assert resp.status_code == 404

    def test_rca_not_found(self, client):
        resp = client.get("/api/v1/rca/analyses/nonexistent-id")
        assert resp.status_code == 404

    def test_scheduling_program_not_found(self, client):
        resp = client.get("/api/v1/scheduling/programs/nonexistent-id")
        assert resp.status_code == 404

    def test_auth_invalid_credentials(self, client, db_session):
        _create_admin_user(db_session)
        resp = client.post("/api/v1/auth/login", json={
            "username": "admin_e2e", "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_auth_missing_token(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_empty_lists(self, client):
        """Empty database returns empty lists, not errors."""
        assert client.get("/api/v1/hierarchy/plants").json() == []
        assert client.get("/api/v1/work-requests/").json() == []
        assert client.get("/api/v1/backlog/").json() == []
        assert client.get("/api/v1/capture/").json() == []
        assert client.get("/api/v1/fmea/functions").json() == []

    def test_rpn_validation(self, client):
        """RPN values must be 1-10."""
        resp = client.post("/api/v1/fmea/fmeca/rpn", json={
            "severity": 0, "occurrence": 5, "detection": 5,
        })
        assert resp.status_code == 422  # Validation error

        resp2 = client.post("/api/v1/fmea/fmeca/rpn", json={
            "severity": 11, "occurrence": 5, "detection": 5,
        })
        assert resp2.status_code == 422


class TestDataUpdatesPropagate:
    """Verify that data changes in one module are reflected in queries."""

    def test_plant_creation_updates_stats(self, client, db_session):
        """Creating plants and nodes updates admin stats."""
        stats_before = client.get("/api/v1/admin/stats").json()
        initial_plants = stats_before["plants"]

        client.post("/api/v1/hierarchy/plants", json={
            "plant_id": "PROP-1", "name": "Propagation Test 1",
        })
        client.post("/api/v1/hierarchy/plants", json={
            "plant_id": "PROP-2", "name": "Propagation Test 2",
        })

        stats_after = client.get("/api/v1/admin/stats").json()
        assert stats_after["plants"] == initial_plants + 2

    def test_node_hierarchy_parent_child(self, client, db_session):
        """Children appear in parent's subtree."""
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "PC-PLANT", "name": "PC"})
        area = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "AREA", "name": "Area A", "code": "PC-A",
            "level": 2, "plant_id": "PC-PLANT",
        })
        area_id = area.json()["node_id"]

        # Create 3 children
        for i in range(3):
            client.post("/api/v1/hierarchy/nodes", json={
                "node_type": "SYSTEM", "name": f"System {i+1}", "code": f"PC-SYS-{i+1}",
                "parent_node_id": area_id, "level": 3, "plant_id": "PC-PLANT",
            })

        subtree = client.get(f"/api/v1/hierarchy/nodes/{area_id}/tree")
        assert len(subtree.json()) == 4  # area + 3 systems

    def test_criticality_updates_node(self, client, db_session):
        """Assessing criticality doesn't break node retrieval."""
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "CU-PLANT", "name": "CU"})
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Motor CU", "code": "CU-MOT",
            "level": 4, "plant_id": "CU-PLANT",
        })
        equip_id = equip.json()["node_id"]

        # Assess
        client.post("/api/v1/criticality/assess", json={
            "node_id": equip_id,
            "criteria_scores": [{"category": "SAFETY", "consequence_level": 5}],
            "probability": 5,
        })

        # Node still accessible
        node = client.get(f"/api/v1/hierarchy/nodes/{equip_id}")
        assert node.status_code == 200
        assert node.json()["name"] == "Motor CU"

    def test_multiple_functions_per_node(self, client, db_session):
        """Multiple functions can exist for one node."""
        client.post("/api/v1/hierarchy/plants", json={"plant_id": "MF-PLANT", "name": "MF"})
        equip = client.post("/api/v1/hierarchy/nodes", json={
            "node_type": "EQUIPMENT", "name": "Multi Func", "code": "MF-EQ",
            "level": 4, "plant_id": "MF-PLANT",
        })
        node_id = equip.json()["node_id"]

        client.post("/api/v1/fmea/functions", json={
            "node_id": node_id, "function_type": "PRIMARY", "description": "Primary function",
        })
        client.post("/api/v1/fmea/functions", json={
            "node_id": node_id, "function_type": "SECONDARY", "description": "Secondary function",
        })
        client.post("/api/v1/fmea/functions", json={
            "node_id": node_id, "function_type": "PROTECTIVE", "description": "Protective function",
        })

        funcs = client.get("/api/v1/fmea/functions", params={"node_id": node_id})
        assert len(funcs.json()) == 3

    def test_backlog_filters(self, client, db_session):
        """Backlog filters by priority and equipment tag."""
        # Create WRs with different tags
        wr1 = client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "FILT-A", "priority": "P1",
        })
        wr2 = client.post("/api/v1/work-requests/from-hierarchy", json={
            "equipment_tag": "FILT-B", "priority": "P3",
        })

        client.post(f"/api/v1/backlog/add/{wr1.json()['request_id']}")
        client.post(f"/api/v1/backlog/add/{wr2.json()['request_id']}")

        # Filter by equipment_tag
        resp_a = client.get("/api/v1/backlog/", params={"equipment_tag": "FILT-A"})
        assert len(resp_a.json()) >= 1
        for item in resp_a.json():
            assert item["equipment_tag"] == "FILT-A"
