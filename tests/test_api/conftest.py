"""Test fixtures for API tests — in-memory SQLite, TestClient."""

# Set required env vars BEFORE importing api.main — lifespan exige JWT_SECRET_KEY>=32.
import os as _os
_os.environ.setdefault("JWT_SECRET_KEY", "pytest_jwt_key_at_least_32_chars_long_for_local_and_ci_runs")
_os.environ.setdefault("TESTING", "1")
_os.environ.setdefault("DEBUG", "1")

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from api.database.connection import Base, get_db
from api.database.models import UserModel
import api.database.models  # noqa: F401 — register all ORM models with Base.metadata
from api.dependencies.auth import get_current_user
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


def _make_test_user(role="admin"):
    """Create a fake UserModel for test authentication."""
    return UserModel(
        user_id="test-user-001",
        username="testadmin",
        hashed_password="not-used-in-tests",
        role=role,
        is_active=True,
    )


@pytest.fixture
def client(db_session):
    """FastAPI TestClient with overridden DB and auth dependencies."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    async def _override_get_current_user():
        return _make_test_user("admin")

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_current_user] = _override_get_current_user
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


@pytest.fixture
def fully_seeded_client(seeded_client, db_session):
    """Client + WRs + MWOs reales en distintos estados para tests profundos."""
    from datetime import datetime, timedelta
    from api.database.models import (
        WorkRequestModel, ManagedWorkOrderModel, FieldCaptureModel,
        AuditLogModel, NotificationDeliveryModel,
    )

    # 5 WRs en distintos estados (usa schema real)
    now = datetime.now()
    eq_id = seeded_client._test_ids["equipment_node_id"]
    wrs = [
        WorkRequestModel(
            request_id=f"WR-TEST-{i:03d}",
            equipment_id=eq_id,
            equipment_tag="BRY-SAG-ML-001",
            problem_description=f"Test WR {i}",
            status=status,
            priority_code=prio,
            work_class="PM01",
            created_by="test-user-001",
            created_at=now - timedelta(days=i),
            ai_classification={"plant_id": "TEST-PLANT"},
        )
        for i, (status, prio) in enumerate([
            ("DRAFT", "P3"),
            ("PENDING_VALIDATION", "P3"),
            ("VALIDATED", "P2"),
            ("APPROVED", "P1"),
            ("REJECTED", "P3"),
        ], start=1)
    ]
    for w in wrs:
        db_session.add(w)

    # 5 MWOs en distintos estados
    mwos = [
        ManagedWorkOrderModel(
            wo_id=f"MWO-TEST-{i:03d}",
            wo_number=f"WO-{1000+i}",
            plant_id="TEST-PLANT",
            equipment_id=eq_id,
            equipment_tag="BRY-SAG-ML-001",
            description=f"Test MWO {i}",
            wo_type="PM01",
            priority_code="P3",
            status=status,
            estimated_hours=4.0,
            planned_start=now + timedelta(days=i),
            planned_end=now + timedelta(days=i, hours=4),
            assigned_workers=[],
            operations=[],
            materials=[],
            tools=[],
            planned_by="test-user-001",
            created_at=now - timedelta(days=i),
        )
        for i, status in enumerate([
            "PLANIFICADO", "EN_PROGRAMACION", "PROGRAMADO", "EN_EJECUCION", "EJECUTADO",
        ], start=1)
    ]
    for m in mwos:
        db_session.add(m)

    # 3 Field captures
    for i in range(3):
        db_session.add(FieldCaptureModel(
            capture_id=f"CAP-TEST-{i:03d}",
            technician_id="WKR-TEST-001",
            capture_type="TEXT",
            language="es",
            raw_text=f"Test capture {i}",
            equipment_tag_manual="BRY-SAG-ML-001",
            created_at=now - timedelta(hours=i),
        ))

    # Algunas notification deliveries
    for i in range(3):
        db_session.add(NotificationDeliveryModel(
            event_type="WORK_REQUEST_CREATED",
            entity_type="work_request",
            entity_id=f"WR-TEST-{i+1:03d}",
            recipient="test@example.com",
            template="WORK_REQUEST_CREATED_REQUESTER",
            status=["PENDING", "SENT", "RETRY"][i],
            retries=i,
        ))

    db_session.commit()
    seeded_client._test_ids.update({
        "wr_draft": "WR-TEST-001",
        "wr_pending": "WR-TEST-002",
        "wr_validated": "WR-TEST-003",
        "wr_approved": "WR-TEST-004",
        "wr_rejected": "WR-TEST-005",
        "mwo_planificado": "MWO-TEST-001",
        "mwo_en_programacion": "MWO-TEST-002",
        "mwo_programado": "MWO-TEST-003",
        "mwo_ejecutando": "MWO-TEST-004",
        "mwo_ejecutado": "MWO-TEST-005",
        "capture_id": "CAP-TEST-000",
    })
    return seeded_client
