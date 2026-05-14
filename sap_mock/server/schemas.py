"""Pydantic schemas — contrato OData S/4HANA-compatible.

Los nombres de campos siguen exactamente el contrato de las APIs públicas
de SAP S/4HANA Cloud (CamelCase + nombres SAP-style):
  - https://api.sap.com/api/API_EQUIPMENT
  - https://api.sap.com/api/API_MAINTNOTIFICATION
  - https://api.sap.com/api/API_MAINTORDER
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# El response usa serialization_alias para que el JSON salga con keys SAP-style
# (PascalCase) PERO el from_attributes lee del ORM por snake_case correcto.
# Para entrada usamos populate_by_name=True (acepta ambas).
_RESPONSE_CFG = ConfigDict(from_attributes=True, populate_by_name=True)


# ── Equipment ───────────────────────────────────────────────────────
class EquipmentRead(BaseModel):
    model_config = _RESPONSE_CFG
    equipment_id: str = Field(serialization_alias="EquipmentID")
    equipment_name: str | None = Field(default=None, serialization_alias="EquipmentName")
    functional_location: str | None = Field(default=None, serialization_alias="FunctionalLocation")
    equipment_category: str | None = Field(default=None, serialization_alias="EquipmentCategory")
    plant: str | None = Field(default=None, serialization_alias="MaintenancePlant")
    work_center: str | None = Field(default=None, serialization_alias="MainWorkCenter")


# ── Functional Location ────────────────────────────────────────────
class FunctionalLocationRead(BaseModel):
    model_config = _RESPONSE_CFG
    functional_location: str = Field(serialization_alias="FunctionalLocation")
    description: str | None = Field(default=None, serialization_alias="FunctionalLocationDesc")
    plant: str | None = Field(default=None, serialization_alias="MaintenancePlant")
    superior_functional_location: str | None = Field(default=None, serialization_alias="SuperiorFunctionalLocation")


# ── Maintenance Notification ───────────────────────────────────────
class MaintNotificationCreate(BaseModel):
    notification_type: str = "M1"
    short_text: str
    functional_location: str | None = None
    equipment: str | None = None
    priority: str = "3"
    reported_by_name: str | None = None


class MaintNotificationRead(BaseModel):
    model_config = _RESPONSE_CFG
    notification_number: str = Field(serialization_alias="MaintenanceNotification")
    notification_type: str = Field(serialization_alias="NotificationType")
    short_text: str = Field(serialization_alias="NotificationText")
    functional_location: str | None = Field(default=None, serialization_alias="FunctionalLocation")
    equipment: str | None = Field(default=None, serialization_alias="Equipment")
    priority: str = Field(serialization_alias="MaintNotifPriority")
    notification_status: str = Field(serialization_alias="NotificationProcessingStatus")
    reported_date: datetime = Field(serialization_alias="ReportedDate")


# ── Maintenance Order ──────────────────────────────────────────────
class MaintOrderOperationCreate(BaseModel):
    operation_activity: str | None = None
    operation_description: str | None = None
    work_center: str | None = None
    operation_planned_work: float = 0


class MaintOrderComponentCreate(BaseModel):
    material: str
    requirement_quantity_in_base_unit: float = 0
    base_unit: str = "EA"
    reservation: str | None = None


class MaintOrderCreate(BaseModel):
    """Payload de creación que envía AMS (transport odata.py) —
    sus keys son las que usa el contrato S/4HANA."""
    model_config = ConfigDict(extra="allow")
    maintenance_order_type: str = Field(default="PM01")
    main_work_center: str | None = None
    functional_location: str | None = None
    equipment: str | None = None
    plant: str = Field(default="1000")
    short_text: str
    priority: str = "3"
    planned_start_datetime: datetime | None = None
    planned_end_datetime: datetime | None = None
    maint_order_operation_items: list[MaintOrderOperationCreate] = Field(default_factory=list)
    maint_order_component_items: list[MaintOrderComponentCreate] = Field(default_factory=list)


class MaintOrderPatch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    actual_start: datetime | None = None
    actual_end: datetime | None = None
    order_status: str | None = None
    cost_actual: float | None = None
    short_text: str | None = None


class MaintOrderRead(BaseModel):
    model_config = _RESPONSE_CFG
    maintenance_order: str = Field(serialization_alias="MaintenanceOrder")
    maintenance_order_type: str = Field(serialization_alias="MaintenanceOrderType")
    main_work_center: str | None = Field(default=None, serialization_alias="MainWorkCenter")
    functional_location: str | None = Field(default=None, serialization_alias="FunctionalLocation")
    equipment: str | None = Field(default=None, serialization_alias="Equipment")
    plant: str = Field(serialization_alias="MaintenancePlanningPlant")
    short_text: str = Field(serialization_alias="MaintOrderShortText")
    priority: str = Field(serialization_alias="MaintenancePriority")
    order_status: str = Field(serialization_alias="MaintenanceOrderStatus")
    planned_start: datetime | None = Field(default=None, serialization_alias="PlannedStartDateTime")
    planned_end: datetime | None = Field(default=None, serialization_alias="PlannedEndDateTime")
    cost_estimated: float | None = Field(default=None, serialization_alias="TotalCostsAtEstimatedCosts")
    cost_actual: float | None = Field(default=None, serialization_alias="TotalCostsAtActualCosts")
