"""Test fixtures for API tests — in-memory SQLite, TestClient."""

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from api.database.connection import Base, get_db
import api.database.models  # noqa: F401 — register all ORM models with Base.metadata
from api.main import app

# In-memory SQLite for tests — StaticPool ensures all connections share one DB
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
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Yields a test DB session."""
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """FastAPI TestClient with overridden DB dependency."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_client(client, db_session):
    """Client with a seeded database (plant + hierarchy nodes)."""
    from api.database.models import PlantModel, HierarchyNodeModel
    import uuid

    # Create plant
    plant = PlantModel(plant_id="TEST-PLANT", name="Test Plant", name_fr="Usine Test")
    db_session.add(plant)

    # Create hierarchy: plant -> area -> system -> equipment
    plant_node_id = str(uuid.uuid4())
    area_node_id = str(uuid.uuid4())
    sys_node_id = str(uuid.uuid4())
    eq_node_id = str(uuid.uuid4())

    nodes = [
        HierarchyNodeModel(node_id=plant_node_id, node_type="PLANT", name="Test Plant", code="TEST-PLANT", level=1, plant_id="TEST-PLANT"),
        HierarchyNodeModel(node_id=area_node_id, node_type="AREA", name="Grinding", code="TEST-BRY", parent_node_id=plant_node_id, level=2, plant_id="TEST-PLANT"),
        HierarchyNodeModel(node_id=sys_node_id, node_type="SYSTEM", name="Grinding System", code="TEST-BRY-SYS", parent_node_id=area_node_id, level=3, plant_id="TEST-PLANT"),
        HierarchyNodeModel(node_id=eq_node_id, node_type="EQUIPMENT", name="SAG Mill #1", code="BRY-SAG-ML-001", parent_node_id=sys_node_id, level=4, plant_id="TEST-PLANT", tag="BRY-SAG-ML-001", criticality="AA"),
    ]
    for n in nodes:
        db_session.add(n)
    db_session.commit()

    # Seed M1-3 support data
    from api.database.models import WorkforceModel, InventoryItemModel, ShutdownCalendarModel
    from datetime import date, timedelta

    for i in range(5):
        db_session.add(WorkforceModel(
            worker_id=f"WKR-TEST-{i+1:03d}",
            name=f"Test Technician {i+1}",
            specialty=["MECHANICAL", "ELECTRICAL", "INSTRUMENTATION", "WELDING", "GENERAL"][i],
            shift=["MORNING", "AFTERNOON", "NIGHT", "MORNING", "AFTERNOON"][i],
            plant_id="TEST-PLANT",
            available=True,
            certifications=["SAFETY_BASIC"],
        ))

    for i in range(5):
        db_session.add(InventoryItemModel(
            material_code=f"MAT-TEST-{i+1:03d}",
            warehouse_id="WH-TEST",
            description=f"Test part #{i+1}",
            quantity_on_hand=10,
            quantity_reserved=2,
            quantity_available=8,
            min_stock=2,
            reorder_point=5,
            last_movement_date=date.today(),
        ))

    db_session.add(ShutdownCalendarModel(
        shutdown_id="SD-TEST-01",
        plant_id="TEST-PLANT",
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=31),
        shutdown_type="MINOR_8H",
        areas=["BRY-SAG"],
        description="Test shutdown",
    ))

    db_session.commit()

    # Store IDs for test access
    client._test_ids = {
        "plant_id": "TEST-PLANT",
        "plant_node_id": plant_node_id,
        "area_node_id": area_node_id,
        "system_node_id": sys_node_id,
        "equipment_node_id": eq_node_id,
    }
    return client
