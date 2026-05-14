"""SQLAlchemy models — almacenamiento del mock SAP."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class MockEquipment(Base):
    __tablename__ = "equipment"
    equipment_id = Column(String(40), primary_key=True)
    equipment_name = Column(String(200))
    functional_location = Column(String(120))
    equipment_category = Column(String(20))
    plant = Column(String(10), default="1000")
    work_center = Column(String(20))
    sap_sync_status = Column(String(20), default="ACTIVE")


class MockFunctionalLocation(Base):
    __tablename__ = "functional_location"
    functional_location = Column(String(120), primary_key=True)
    description = Column(String(200))
    plant = Column(String(10), default="1000")
    superior_functional_location = Column(String(120), nullable=True)
    abc_indicator = Column(String(5), nullable=True)


class MockMaintNotification(Base):
    __tablename__ = "maint_notification"
    notification_number = Column(String(20), primary_key=True)
    notification_type = Column(String(5))  # M1=fault, M2=preventive
    short_text = Column(String(40))
    functional_location = Column(String(120))
    equipment = Column(String(40))
    priority = Column(String(5))
    reported_by_name = Column(String(100))
    reported_date = Column(DateTime, default=datetime.utcnow)
    notification_status = Column(String(20), default="OSNO")  # SAP status code
    raw_payload = Column(Text)  # debug: payload original


class MockMaintOrder(Base):
    __tablename__ = "maint_order"
    maintenance_order = Column(String(20), primary_key=True)
    maintenance_order_type = Column(String(10))  # PM01/PM02/PM03
    main_work_center = Column(String(20))
    functional_location = Column(String(120))
    equipment = Column(String(40))
    plant = Column(String(10), default="1000")
    short_text = Column(String(40))
    priority = Column(String(5))
    planned_start = Column(DateTime, nullable=True)
    planned_end = Column(DateTime, nullable=True)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    order_status = Column(String(20), default="CRTD")
    cost_estimated = Column(Float, default=0.0)
    cost_actual = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    raw_payload = Column(Text)


class MockMaintOrderOperation(Base):
    __tablename__ = "maint_order_operation"
    id = Column(Integer, primary_key=True, autoincrement=True)
    maintenance_order = Column(String(20), index=True)
    operation_activity = Column(String(10))
    description = Column(String(200))
    work_center = Column(String(20))
    planned_work = Column(Float)
    actual_work = Column(Float, default=0)


class MockMaintOrderComponent(Base):
    __tablename__ = "maint_order_component"
    id = Column(Integer, primary_key=True, autoincrement=True)
    maintenance_order = Column(String(20), index=True)
    material = Column(String(40))
    qty_required = Column(Float)
    base_unit = Column(String(5))
    reservation = Column(String(20), nullable=True)
