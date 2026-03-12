"""Smoke tests — validate the complete localhost experience.

Tests the FastAPI app startup, all route registration, health checks,
database initialization, seed data loading, and every major API endpoint.
Also validates Streamlit module imports and i18n translations.
"""

import uuid

import pytest
from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from api.database.connection import Base, get_db
from api.database.models import UserModel
import api.database.models  # noqa: F401
from api.dependencies.auth import get_current_user
from api.main import app, create_app


# ── Test DB Setup ──────────────────────────────────────────────────────

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
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    async def _override_get_current_user():
        return UserModel(
            user_id="test-user-001", username="testadmin",
            hashed_password="x", role="admin", is_active=True,
        )

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_current_user] = _override_get_current_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_client(client, db_session):
    """Client with seeded plant + hierarchy for endpoint testing."""
    from api.database.models import PlantModel, HierarchyNodeModel

    plant = PlantModel(plant_id="SMOKE-PLANT", name="Smoke Test Plant", name_fr="Usine Fumee")
    db_session.add(plant)

    plant_node_id = str(uuid.uuid4())
    area_node_id = str(uuid.uuid4())
    sys_node_id = str(uuid.uuid4())
    eq_node_id = str(uuid.uuid4())

    nodes = [
        HierarchyNodeModel(node_id=plant_node_id, node_type="PLANT", name="Smoke Plant", code="SMOKE-PLANT", level=1, plant_id="SMOKE-PLANT"),
        HierarchyNodeModel(node_id=area_node_id, node_type="AREA", name="Grinding", code="SMOKE-BRY", parent_node_id=plant_node_id, level=2, plant_id="SMOKE-PLANT"),
        HierarchyNodeModel(node_id=sys_node_id, node_type="SYSTEM", name="SAG System", code="SMOKE-BRY-SYS", parent_node_id=area_node_id, level=3, plant_id="SMOKE-PLANT"),
        HierarchyNodeModel(node_id=eq_node_id, node_type="EQUIPMENT", name="SAG Mill", code="SMOKE-SAG-001", parent_node_id=sys_node_id, level=4, plant_id="SMOKE-PLANT", tag="SMOKE-SAG-001", criticality="AA"),
    ]
    for n in nodes:
        db_session.add(n)
    db_session.commit()

    client._test_ids = {
        "plant_id": "SMOKE-PLANT",
        "plant_node_id": plant_node_id,
        "area_node_id": area_node_id,
        "system_node_id": sys_node_id,
        "equipment_node_id": eq_node_id,
    }
    return client


# ════════════════════════════════════════════════════════════════════════
# SECTION 1: APP STARTUP & ROUTE REGISTRATION
# ════════════════════════════════════════════════════════════════════════

class TestAppStartup:

    def test_create_app_returns_fastapi_instance(self):
        from fastapi import FastAPI
        test_app = create_app()
        assert isinstance(test_app, FastAPI)

    def test_app_title(self):
        test_app = create_app()
        assert test_app.title == "OCP Maintenance AI MVP"

    def test_app_version(self):
        test_app = create_app()
        assert test_app.version == "1.0.0"

    def test_all_routers_registered(self, client):
        routes = [route.path for route in app.routes]
        expected_prefixes = [
            "/api/v1/hierarchy",
            "/api/v1/criticality",
            "/api/v1/fmea",
            "/api/v1/tasks",
            "/api/v1/work-packages",
            "/api/v1/sap",
            "/api/v1/analytics",
            "/api/v1/admin",
            "/api/v1/capture",
            "/api/v1/work-requests",
            "/api/v1/planner",
            "/api/v1/backlog",
            "/api/v1/scheduling",
            "/api/v1/reliability",
            "/api/v1/reporting",
            "/api/v1/dashboard",
            "/api/v1/rca",
        ]
        for prefix in expected_prefixes:
            matching = [r for r in routes if r.startswith(prefix)]
            assert len(matching) > 0, f"No routes found for prefix {prefix}"

    def test_root_endpoint(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["project"] == "OCP Maintenance AI MVP"
        assert data["version"] == "1.0.0"
        assert "modules" in data
        expected_modules = [
            "hierarchy", "criticality", "fmea", "tasks", "work-packages",
            "sap", "analytics", "admin", "capture", "work-requests",
            "planner", "backlog", "scheduling", "reliability",
            "reporting", "dashboard", "rca",
        ]
        for module in expected_modules:
            assert module in data["modules"], f"Module '{module}' missing from root"

    def test_health_check(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ("ok", "degraded")
        assert "version" in data
        assert "database" in data


# ════════════════════════════════════════════════════════════════════════
# SECTION 2: DATABASE INITIALIZATION
# ════════════════════════════════════════════════════════════════════════

class TestDatabaseInit:

    def test_tables_created(self, db_session):
        inspector = inspect(test_engine)
        tables = inspector.get_table_names()
        expected = ["plants", "hierarchy_nodes"]
        for table in expected:
            assert table in tables, f"Table '{table}' not found"

    def test_empty_database_queries_succeed(self, client):
        resp = client.get("/api/v1/hierarchy/plants")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_admin_stats_on_empty_db(self, client):
        resp = client.get("/api/v1/admin/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["plants"] == 0
        assert data["total_nodes"] == 0


# ════════════════════════════════════════════════════════════════════════
# SECTION 3: SEED DATA
# ════════════════════════════════════════════════════════════════════════

class TestSeedData:

    def test_seed_creates_plant(self, seeded_client):
        resp = seeded_client.get("/api/v1/hierarchy/plants")
        assert resp.status_code == 200
        plants = resp.json()
        assert any(p["plant_id"] == "SMOKE-PLANT" for p in plants)

    def test_seed_creates_hierarchy(self, seeded_client):
        resp = seeded_client.get("/api/v1/hierarchy/nodes", params={"plant_id": "SMOKE-PLANT"})
        assert resp.status_code == 200
        nodes = resp.json()
        assert len(nodes) >= 4

    def test_seed_hierarchy_has_all_levels(self, seeded_client):
        resp = seeded_client.get("/api/v1/hierarchy/nodes", params={"plant_id": "SMOKE-PLANT"})
        types = {n["node_type"] for n in resp.json()}
        for expected_type in ["PLANT", "AREA", "SYSTEM", "EQUIPMENT"]:
            assert expected_type in types

    def test_seed_stats_populated(self, seeded_client):
        resp = seeded_client.get("/api/v1/admin/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["plants"] >= 1
        assert data["total_nodes"] >= 4


# ════════════════════════════════════════════════════════════════════════
# SECTION 4: MAJOR API ENDPOINTS
# ════════════════════════════════════════════════════════════════════════

class TestHierarchyEndpoints:

    def test_list_plants(self, seeded_client):
        resp = seeded_client.get("/api/v1/hierarchy/plants")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_list_nodes(self, seeded_client):
        resp = seeded_client.get("/api/v1/hierarchy/nodes", params={"plant_id": "SMOKE-PLANT"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 4

    def test_get_single_node(self, seeded_client):
        eq_id = seeded_client._test_ids["equipment_node_id"]
        resp = seeded_client.get(f"/api/v1/hierarchy/nodes/{eq_id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "SAG Mill"

    def test_get_subtree(self, seeded_client):
        plant_node_id = seeded_client._test_ids["plant_node_id"]
        resp = seeded_client.get(f"/api/v1/hierarchy/nodes/{plant_node_id}/tree")
        assert resp.status_code == 200
        assert len(resp.json()) == 4

    def test_node_stats(self, seeded_client):
        resp = seeded_client.get("/api/v1/hierarchy/stats", params={"plant_id": "SMOKE-PLANT"})
        assert resp.status_code == 200
        stats = resp.json()
        assert stats["EQUIPMENT"] == 1

    def test_node_not_found(self, client):
        resp = client.get("/api/v1/hierarchy/nodes/nonexistent-id")
        assert resp.status_code == 404


class TestCriticalityEndpoints:

    def test_assess_criticality(self, seeded_client):
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

    def test_get_criticality_not_found(self, client):
        resp = client.get("/api/v1/criticality/nonexistent-node")
        assert resp.status_code == 404


class TestFMEAEndpoints:

    def test_fm_combinations(self, client):
        resp = client.get("/api/v1/fmea/fm-combinations")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("total_combinations", 0) >= 72

    def test_validate_fm_combination(self, client):
        resp = client.get("/api/v1/fmea/validate-fm", params={
            "mechanism": "WEARS", "cause": "RELATIVE_MOVEMENT",
        })
        assert resp.status_code == 200

    def test_rcm_decision(self, client):
        resp = client.post("/api/v1/fmea/rcm-decide", json={
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


class TestAnalyticsEndpoints:

    def test_weibull_fit(self, client):
        resp = client.post("/api/v1/analytics/weibull-fit", json={
            "failure_intervals": [100, 200, 150, 300, 250, 180, 220],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "beta" in data
        assert "eta" in data


class TestDashboardEndpoints:

    def test_executive_dashboard(self, client):
        resp = client.get("/api/v1/dashboard/executive/SMOKE-PLANT")
        assert resp.status_code == 200
        data = resp.json()
        assert data["plant_id"] == "SMOKE-PLANT"

    def test_kpi_summary(self, client):
        resp = client.get("/api/v1/dashboard/kpi-summary/SMOKE-PLANT")
        assert resp.status_code == 200

    def test_dashboard_alerts(self, client):
        resp = client.get("/api/v1/dashboard/alerts/SMOKE-PLANT")
        assert resp.status_code == 200


class TestAdminEndpoints:

    def test_stats(self, client):
        resp = client.get("/api/v1/admin/stats")
        assert resp.status_code == 200
        assert "plants" in resp.json()

    def test_audit_log(self, client):
        resp = client.get("/api/v1/admin/audit-log")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_agent_status(self, client):
        resp = client.get("/api/v1/admin/agent-status")
        assert resp.status_code == 200

    def test_feedback_submit_and_list(self, client):
        resp = client.post("/api/v1/admin/feedback", json={
            "page": "smoke_test", "rating": 5, "comment": "Smoke test feedback",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "received"

        resp2 = client.get("/api/v1/admin/feedback", params={"page": "smoke_test"})
        assert resp2.status_code == 200
        assert len(resp2.json()) == 1


class TestRCAEndpoints:

    def test_create_rca(self, client):
        resp = client.post("/api/v1/rca/analyses", json={
            "event_description": "Smoke test event",
            "plant_id": "SMOKE-PLANT",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "OPEN"
        assert "analysis_id" in data

    def test_rca_summary(self, client):
        resp = client.get("/api/v1/rca/analyses/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data


# ════════════════════════════════════════════════════════════════════════
# SECTION 5: REACT FRONTEND FILES
# ════════════════════════════════════════════════════════════════════════

class TestReactFrontendFiles:

    def test_api_module_exists(self):
        from pathlib import Path
        api_path = Path("frontend/src/api.js")
        assert api_path.exists(), "frontend/src/api.js missing"
        source = api_path.read_text(encoding="utf-8")
        for func in ["listPlants", "listNodes", "getStats", "seedDatabase", "getExecutiveDashboard"]:
            assert func in source, f"api.js missing function: {func}"

    def test_react_pages_exist(self):
        from pathlib import Path
        pages_dir = Path("frontend/src/pages")
        page_files = sorted(pages_dir.glob("*.jsx"))
        assert len(page_files) == 28, f"Expected 28 pages, found {len(page_files)}"

    def test_react_components_exist(self):
        from pathlib import Path
        for comp in ["Sidebar.jsx", "Header.jsx", "Shared.jsx", "Toast.jsx", "ConfirmDialog.jsx", "ErrorBoundary.jsx"]:
            assert (Path("frontend/src/components") / comp).exists(), f"Component missing: {comp}"

    def test_vite_config_exists(self):
        from pathlib import Path
        assert Path("frontend/vite.config.js").exists()

    def test_package_json_has_react(self):
        import json
        from pathlib import Path
        pkg = json.loads(Path("frontend/package.json").read_text(encoding="utf-8"))
        assert "react" in pkg.get("dependencies", {}), "react not in dependencies"
        assert "react-dom" in pkg.get("dependencies", {}), "react-dom not in dependencies"
