"""Tests for hierarchy builder engine (D6)."""

import pytest
from tools.engines.hierarchy_builder_engine import (
    build_from_vendor,
    auto_assign_criticality,
    generate_tag,
    generate_standard_failure_modes,
    _load_equipment_library,
)


class TestGenerateTag:
    """Tag generation tests."""

    def test_basic_tag(self):
        assert generate_tag("BRY", "SAG", 1) == "BRY-SAG-001"

    def test_sequence_padding(self):
        assert generate_tag("FLT", "FCL", 12) == "FLT-FCL-012"

    def test_high_sequence(self):
        assert generate_tag("PMP", "SLP", 100) == "PMP-SLP-100"


class TestAutoCriticality:
    """Criticality auto-assignment tests."""

    def test_high_power_gets_aa(self):
        crit = auto_assign_criticality("SAG_MILL", 8500)
        assert crit in ("AA", "A+")

    def test_medium_power_gets_a(self):
        crit = auto_assign_criticality("UNKNOWN_TYPE", 600)
        assert crit == "A"

    def test_low_power_gets_b_or_c(self):
        crit = auto_assign_criticality("UNKNOWN_TYPE", 50)
        assert crit in ("B", "C")

    def test_known_type_uses_library(self):
        crit = auto_assign_criticality("SAG_MILL", 0)
        # SAG_MILL should return AA from library regardless of power
        assert crit == "AA"


class TestBuildFromVendor:
    """Build hierarchy from vendor data."""

    def test_basic_build(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="BRY",
            equipment_type="SAG_MILL",
            model="36x20",
            manufacturer="FLSmidth",
            power_kw=8500,
        )
        assert "equipment_tag" in result
        assert result["nodes_created"] >= 1
        assert result["criticality_suggestion"] == "AA"

    def test_creates_sub_assemblies(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="BRY",
            equipment_type="SAG_MILL",
        )
        assert len(result["sub_assemblies"]) >= 3
        assert len(result["maintainable_items"]) >= 3

    def test_generates_failure_modes(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="BRY",
            equipment_type="SAG_MILL",
        )
        assert result["failure_modes_generated"] >= 1
        for fm in result.get("failure_modes", []):
            assert "mechanism" in fm
            assert "cause" in fm

    def test_hierarchy_nodes_have_required_fields(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="PMP",
            equipment_type="SLURRY_PUMP",
        )
        for node in result["hierarchy_nodes"]:
            assert "node_id" in node
            assert "node_type" in node
            assert "name" in node
            assert "level" in node
            assert node["plant_id"] == "TEST-PLANT"

    def test_equipment_node_metadata(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="BRY",
            equipment_type="SAG_MILL",
            model="36x20",
            manufacturer="FLSmidth",
            power_kw=8500,
            weight_kg=285000,
        )
        eq_node = result["hierarchy_nodes"][0]
        assert eq_node["node_type"] == "EQUIPMENT"
        meta = eq_node["metadata_json"]
        assert meta["manufacturer"] == "FLSmidth"
        assert meta["power_kw"] == 8500
        assert meta["weight_kg"] == 285000

    def test_unknown_equipment_type_warning(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="TST",
            equipment_type="NONEXISTENT_TYPE",
        )
        assert len(result["warnings"]) >= 1
        assert result["nodes_created"] == 1  # only equipment node

    def test_node_types_correct(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="FLT",
            equipment_type="FLOTATION_CELL",
        )
        types = [n["node_type"] for n in result["hierarchy_nodes"]]
        assert "EQUIPMENT" in types
        if len(types) > 1:
            assert "SUB_ASSEMBLY" in types

    def test_level_values_correct(self):
        result = build_from_vendor(
            plant_id="TEST-PLANT",
            area_code="CVY",
            equipment_type="BELT_CONVEYOR",
        )
        for node in result["hierarchy_nodes"]:
            if node["node_type"] == "EQUIPMENT":
                assert node["level"] == 4
            elif node["node_type"] == "SUB_ASSEMBLY":
                assert node["level"] == 5
            elif node["node_type"] == "MAINTAINABLE_ITEM":
                assert node["level"] == 6


class TestGenerateStandardFailureModes:
    """Failure mode generation from library."""

    def test_sag_mill_failure_modes(self):
        fms = generate_standard_failure_modes("SAG_MILL")
        assert len(fms) >= 1
        for fm in fms:
            assert "mechanism" in fm
            assert "cause" in fm
            assert "sub_assembly" in fm
            assert "maintainable_item" in fm

    def test_unknown_type_returns_empty(self):
        fms = generate_standard_failure_modes("NONEXISTENT")
        assert fms == []

    def test_failure_modes_have_weibull(self):
        fms = generate_standard_failure_modes("SAG_MILL")
        has_weibull = any(fm.get("weibull_beta") is not None for fm in fms)
        assert has_weibull


class TestEquipmentLibrary:
    """Equipment library loading tests."""

    def test_library_loads(self):
        lib = _load_equipment_library()
        assert "equipment_types" in lib
        assert len(lib["equipment_types"]) >= 10

    def test_all_types_have_sub_assemblies(self):
        lib = _load_equipment_library()
        for et in lib["equipment_types"]:
            assert "sub_assemblies" in et, f"{et['equipment_type']} missing sub_assemblies"
            assert len(et["sub_assemblies"]) >= 1, f"{et['equipment_type']} has no sub_assemblies"


class TestHierarchyBuilderAPI:
    """API endpoint tests (requires test client)."""

    @pytest.fixture
    def client(self):
        from sqlalchemy import create_engine, event
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy.pool import StaticPool
        from fastapi.testclient import TestClient
        from api.database.connection import Base, get_db
        import api.database.models  # noqa: F401
        from api.main import app

        engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

        @event.listens_for(engine, "connect")
        def _fk(dbapi_conn, _):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)

        def _override():
            s = Session()
            try:
                yield s
            finally:
                s.close()

        app.dependency_overrides[get_db] = _override
        c = TestClient(app)

        # Create test plant
        c.post("/api/v1/hierarchy/plants", json={"plant_id": "HB-TEST", "name": "Builder Test Plant", "name_fr": "Usine Test"})
        yield c
        app.dependency_overrides.clear()

    def test_build_from_vendor_endpoint(self, client):
        resp = client.post("/api/v1/hierarchy/build-from-vendor", json={
            "plant_id": "HB-TEST",
            "area_code": "BRY",
            "equipment_type": "SAG_MILL",
            "model": "36x20",
            "manufacturer": "FLSmidth",
            "power_kw": 8500,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["nodes_persisted"] >= 1
        assert data["criticality_suggestion"] == "AA"

    def test_build_missing_plant(self, client):
        resp = client.post("/api/v1/hierarchy/build-from-vendor", json={
            "plant_id": "NONEXISTENT",
            "area_code": "BRY",
            "equipment_type": "SAG_MILL",
        })
        assert resp.status_code == 400

    def test_build_missing_required_fields(self, client):
        resp = client.post("/api/v1/hierarchy/build-from-vendor", json={
            "plant_id": "HB-TEST",
        })
        assert resp.status_code == 422

    def test_built_nodes_visible_in_hierarchy(self, client):
        # Build
        client.post("/api/v1/hierarchy/build-from-vendor", json={
            "plant_id": "HB-TEST",
            "area_code": "PMP",
            "equipment_type": "SLURRY_PUMP",
        })
        # Check stats
        resp = client.get("/api/v1/hierarchy/stats", params={"plant_id": "HB-TEST"})
        assert resp.status_code == 200
        stats = resp.json()
        assert stats.get("EQUIPMENT", 0) >= 1
