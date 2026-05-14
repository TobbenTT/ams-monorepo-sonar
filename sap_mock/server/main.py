"""Mock SAP S/4HANA OData server — FastAPI app.

Corre como container separado (ocp-sap-mock). El backend AMS apunta acá
cuando ``SAP_TRANSPORT=mock`` y ``SAP_MOCK_URL=http://ocp-sap-mock:8000``.

La idea es que el contrato OData sea idéntico al de SAP S/4HANA Cloud
public APIs, de modo que migrar a SAP real sea solo cambiar la base URL
+ agregar OAuth en el transport AMS.
"""

import asyncio
import json
import logging
import os
import random
import secrets
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session, sessionmaker

from .models import (
    Base, MockEquipment, MockFunctionalLocation, MockMaintNotification,
    MockMaintOrder, MockMaintOrderComponent, MockMaintOrderOperation,
)
from .schemas import (
    EquipmentRead, FunctionalLocationRead,
    MaintNotificationCreate, MaintNotificationRead,
    MaintOrderCreate, MaintOrderPatch, MaintOrderRead,
)

logger = logging.getLogger("ocp_sap_mock")
logging.basicConfig(
    level=os.getenv("MOCK_LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)

# ── Config ──────────────────────────────────────────────────────────
DB_PATH = os.getenv("MOCK_DB_PATH", "/data/mock.db")
LATENCY_MIN = int(os.getenv("MOCK_LATENCY_MS_MIN", "20"))
LATENCY_MAX = int(os.getenv("MOCK_LATENCY_MS_MAX", "150"))
ERROR_RATE = float(os.getenv("MOCK_ERROR_RATE", "0"))  # 0..1
SEED_ON_BOOT = os.getenv("MOCK_SEED_ON_BOOT", "true").lower() == "true"

# ── DB setup ───────────────────────────────────────────────────────
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
    echo=False,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Lifespan: crear tablas + seed ──────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    if SEED_ON_BOOT:
        _seed_initial_data()
    logger.info("Mock SAP server ready · DB=%s · latency=%d-%dms · error_rate=%.2f",
                DB_PATH, LATENCY_MIN, LATENCY_MAX, ERROR_RATE)
    yield


def _seed_initial_data() -> None:
    """Carga maestros iniciales si la DB está vacía."""
    db = SessionLocal()
    try:
        if db.query(MockEquipment).count() > 0:
            return
        # Maestros equipos típicos minera
        equipos = [
            ("3110MI0001", "Molino SAG 11.5x6.4", "SN-3000-3100-3110", "M", "MEC-MOLIN"),
            ("3120BC0002", "Bomba ciclones primaria", "SN-3000-3100-3120", "M", "MEC-FLUI"),
            ("3130MC0001", "Motor electrico molino", "SN-3000-3100-3130", "M", "ELECT-ROT"),
            ("4101CV0003", "Correa transportadora 4101", "SN-4000-4100-4101", "M", "MEC-TRAN"),
            ("5101CO0001", "Compresor aire planta", "SN-5000-5100-5101", "M", "MEC-AIRE"),
            ("3110BN0011", "Tolva bolas SAG", "SN-3000-3100-3110", "S", "MEC-MOLIN"),
            ("3110CP0001", "Gabinete PLC LRS molino", "SN-3000-3100-3110", "S", "ELECT-AUTO"),
        ]
        for eq_id, name, fl, cat, wc in equipos:
            db.add(MockEquipment(
                equipment_id=eq_id, equipment_name=name,
                functional_location=fl, equipment_category=cat,
                work_center=wc,
            ))
        # Functional locations
        for fl_id, desc in [
            ("SN-3000-3100-3110", "Molienda SAG"),
            ("SN-3000-3100-3120", "Molienda Bolas"),
            ("SN-3000-3100-3130", "Motores"),
            ("SN-4000-4100-4101", "Transporte"),
            ("SN-5000-5100-5101", "Compresion"),
        ]:
            db.add(MockFunctionalLocation(functional_location=fl_id, description=desc))
        db.commit()
        logger.info("Seed inicial cargado: %d equipos + 5 funct.loc.", len(equipos))
    finally:
        db.close()


# ── App ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Mock SAP S/4HANA",
    version="1.0.0",
    description="Mock OData v4 server for SAP PM (Plant Maintenance) — replicates contract of S/4HANA Cloud public APIs for offline development and E2E testing.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


# ── Middleware: latencia + error rate simulados ────────────────────
@app.middleware("http")
async def simulate_sap_realism(request, call_next):
    # Latencia random
    if LATENCY_MAX > 0:
        latency_ms = random.randint(LATENCY_MIN, LATENCY_MAX)
        await asyncio.sleep(latency_ms / 1000)
    # Inyectar error 5xx aleatoriamente (skip healthz)
    if ERROR_RATE > 0 and request.url.path not in ("/healthz", "/docs", "/openapi.json"):
        if random.random() < ERROR_RATE:
            logger.warning("Injected 503 (error_rate=%.2f) for %s %s",
                           ERROR_RATE, request.method, request.url.path)
            return Response(
                content=json.dumps({"error": {"code": "SAP_TEMPORARY_UNAVAILABLE", "message": "Simulated transient failure"}}),
                status_code=503,
                media_type="application/json",
            )
    return await call_next(request)


# ── Health ──────────────────────────────────────────────────────────
@app.get("/healthz", tags=["health"])
def healthz(db: Session = Depends(get_db)):
    return {
        "status": "ok",
        "version": app.version,
        "db_path": DB_PATH,
        "counts": {
            "equipment": db.query(MockEquipment).count(),
            "functional_location": db.query(MockFunctionalLocation).count(),
            "notifications": db.query(MockMaintNotification).count(),
            "orders": db.query(MockMaintOrder).count(),
        },
        "config": {
            "latency_ms_min": LATENCY_MIN,
            "latency_ms_max": LATENCY_MAX,
            "error_rate": ERROR_RATE,
        },
    }


# ── Equipment (read-only) ──────────────────────────────────────────
@app.get("/odata/v4/api_equipment", response_model=list[EquipmentRead], tags=["equipment"])
def list_equipment(db: Session = Depends(get_db), top: int = Query(50, alias="$top")):
    rows = db.query(MockEquipment).limit(top).all()
    return [EquipmentRead.model_validate(r, from_attributes=True) for r in rows]


@app.get("/odata/v4/api_equipment/{equipment_id}", response_model=EquipmentRead, tags=["equipment"])
def get_equipment(equipment_id: str, db: Session = Depends(get_db)):
    row = db.query(MockEquipment).filter(MockEquipment.equipment_id == equipment_id).first()
    if not row:
        raise HTTPException(404, "Equipment not found")
    return EquipmentRead.model_validate(row, from_attributes=True)


# ── Functional Location (read-only) ────────────────────────────────
@app.get("/odata/v4/api_functional_location", response_model=list[FunctionalLocationRead], tags=["functional-location"])
def list_floc(db: Session = Depends(get_db), top: int = Query(50, alias="$top")):
    return [FunctionalLocationRead.model_validate(r, from_attributes=True)
            for r in db.query(MockFunctionalLocation).limit(top).all()]


# ── Notifications (PM01/PM03 advisos) ──────────────────────────────
@app.post("/odata/v4/api_maintnotification", response_model=MaintNotificationRead, status_code=201, tags=["notification"])
def create_notification(payload: MaintNotificationCreate, db: Session = Depends(get_db)):
    notif_number = f"100{random.randint(10000, 99999)}"
    row = MockMaintNotification(
        notification_number=notif_number,
        notification_type=payload.notification_type,
        short_text=payload.short_text[:40],
        functional_location=payload.functional_location,
        equipment=payload.equipment,
        priority=payload.priority,
        reported_by_name=payload.reported_by_name,
        notification_status="OSNO",
        raw_payload=payload.model_dump_json(),
    )
    db.add(row)
    db.commit()
    logger.info("Notification %s created (eq=%s)", notif_number, payload.equipment)
    return MaintNotificationRead.model_validate(row, from_attributes=True)


# ── Maintenance Orders ─────────────────────────────────────────────
@app.post("/odata/v4/api_maintorder", response_model=MaintOrderRead, status_code=201, tags=["maint-order"])
def create_maint_order(payload: MaintOrderCreate, db: Session = Depends(get_db)):
    # Validar contract: equipment debe existir (lo que haría SAP real)
    if payload.equipment:
        eq = db.query(MockEquipment).filter(MockEquipment.equipment_id == payload.equipment).first()
        if not eq:
            # SAP devuelve un error de business object
            raise HTTPException(
                422,
                {"error": {"code": "EQUIPMENT_NOT_FOUND", "message": f"Equipment {payload.equipment} not in master data"}},
            )

    order_number = f"40{random.randint(1000000, 9999999)}"
    row = MockMaintOrder(
        maintenance_order=order_number,
        maintenance_order_type=payload.maintenance_order_type,
        main_work_center=payload.main_work_center,
        functional_location=payload.functional_location,
        equipment=payload.equipment,
        plant=payload.plant,
        short_text=payload.short_text[:40],
        priority=payload.priority,
        planned_start=payload.planned_start_datetime,
        planned_end=payload.planned_end_datetime,
        order_status="CRTD",
        raw_payload=payload.model_dump_json(),
    )
    db.add(row)
    db.flush()

    # Ops
    for i, op in enumerate(payload.maint_order_operation_items or []):
        db.add(MockMaintOrderOperation(
            maintenance_order=order_number,
            operation_activity=op.operation_activity or str((i + 1) * 10).zfill(4),
            description=(op.operation_description or "")[:40],
            work_center=op.work_center or payload.main_work_center,
            planned_work=op.operation_planned_work or 0,
        ))
    # Components
    for c in (payload.maint_order_component_items or []):
        db.add(MockMaintOrderComponent(
            maintenance_order=order_number,
            material=c.material,
            qty_required=c.requirement_quantity_in_base_unit,
            base_unit=c.base_unit,
            reservation=c.reservation,
        ))
    db.commit()

    # Backwards-compatible response (también con keys legacy que usa nuestro transport)
    response = MaintOrderRead.model_validate(row, from_attributes=True)
    logger.info("MaintOrder %s created (type=%s, eq=%s)", order_number, payload.maintenance_order_type, payload.equipment)
    return response


@app.patch("/odata/v4/api_maintorder/{order_number}", response_model=MaintOrderRead, tags=["maint-order"])
def patch_maint_order(order_number: str, payload: MaintOrderPatch, db: Session = Depends(get_db)):
    row = db.query(MockMaintOrder).filter(MockMaintOrder.maintenance_order == order_number).first()
    if not row:
        raise HTTPException(404, "Order not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        if hasattr(row, k):
            setattr(row, k, v)
    db.commit()
    return MaintOrderRead.model_validate(row, from_attributes=True)


@app.get("/odata/v4/api_maintorder", response_model=list[MaintOrderRead], tags=["maint-order"])
def list_maint_orders(db: Session = Depends(get_db), top: int = Query(50, alias="$top")):
    rows = db.query(MockMaintOrder).order_by(MockMaintOrder.created_at.desc()).limit(top).all()
    return [MaintOrderRead.model_validate(r, from_attributes=True) for r in rows]


@app.get("/odata/v4/api_maintorder/{order_number}", response_model=MaintOrderRead, tags=["maint-order"])
def get_maint_order(order_number: str, db: Session = Depends(get_db)):
    row = db.query(MockMaintOrder).filter(MockMaintOrder.maintenance_order == order_number).first()
    if not row:
        raise HTTPException(404, "Order not found")
    return MaintOrderRead.model_validate(row, from_attributes=True)


# ── Admin / utilidades ─────────────────────────────────────────────
@app.post("/admin/reset", tags=["admin"])
def admin_reset(db: Session = Depends(get_db)):
    """Borra todos los avisos + órdenes generados (mantiene maestros)."""
    for model in [MockMaintOrderComponent, MockMaintOrderOperation, MockMaintOrder, MockMaintNotification]:
        db.query(model).delete()
    db.commit()
    logger.warning("Admin reset: avisos+órdenes borrados")
    return {"reset": "ok"}


@app.get("/admin/stats", tags=["admin"])
def admin_stats(db: Session = Depends(get_db)):
    return {
        "equipment": db.query(MockEquipment).count(),
        "functional_location": db.query(MockFunctionalLocation).count(),
        "notifications": db.query(MockMaintNotification).count(),
        "orders": db.query(MockMaintOrder).count(),
        "operations": db.query(MockMaintOrderOperation).count(),
        "components": db.query(MockMaintOrderComponent).count(),
        "orders_by_status": dict(
            db.query(MockMaintOrder.order_status, func.count(MockMaintOrder.maintenance_order))
            .group_by(MockMaintOrder.order_status).all()
        ),
        "orders_by_type": dict(
            db.query(MockMaintOrder.maintenance_order_type, func.count(MockMaintOrder.maintenance_order))
            .group_by(MockMaintOrder.maintenance_order_type).all()
        ),
    }
