"""Mock-SAP transport — habla con el servicio ocp-sap-mock (FastAPI) por HTTP.

Útil para desarrollo + tests E2E sin necesitar SAP real ni cuenta SAP.
URL del mock se configura por env ``SAP_MOCK_URL`` (default ``http://localhost:8030``).

El servicio mock simula los endpoints OData de S/4HANA:
- POST /odata/v4/api_maintnotification → crear aviso
- POST /odata/v4/api_maintorder → crear/actualizar OT
- GET /odata/v4/api_equipment(id) → leer equipo
"""

import logging
import os

import httpx

from .base import SAPTransport, SendResult, SendStatus

logger = logging.getLogger("ocp_maintenance.sap.mock")

DEFAULT_MOCK_URL = os.getenv("SAP_MOCK_URL", "http://localhost:8030")
DEFAULT_TIMEOUT = float(os.getenv("SAP_MOCK_TIMEOUT", "10"))


class MockSAPTransport(SAPTransport):
    name = "mock"

    def __init__(self, base_url: str | None = None, timeout: float | None = None):
        self.base_url = (base_url or DEFAULT_MOCK_URL).rstrip("/")
        self.timeout = timeout or DEFAULT_TIMEOUT

    @staticmethod
    def _to_odata_body(payload: dict) -> dict:
        """Map AMS payload (BAPI_ALM shape) → contrato Mock-SAP."""
        order = payload.get("ORDER") or {}
        return {
            "maintenance_order_type": order.get("TYPE", "PM01"),
            "main_work_center": order.get("WORK_CENTER") or order.get("PLANNING_GROUP") or "",
            "functional_location": order.get("TECH_LOCATION") or "",
            "equipment": order.get("EQUIPMENT") or "",
            "plant": order.get("PLANT", "1000"),
            "short_text": (order.get("DESCRIPTION") or order.get("WO_NUMBER", ""))[:40],
            "priority": (order.get("PRIORITY") or "P3").replace("P", ""),
            "planned_start_datetime": order.get("PLAN_START"),
            "planned_end_datetime": order.get("PLAN_END"),
            "maint_order_operation_items": [
                {
                    "operation_activity": str((i + 1) * 10).zfill(4),
                    "operation_description": (op.get("DESC") or "")[:40],
                    "work_center": op.get("WORK_CENTER", ""),
                    "operation_planned_work": op.get("PLAN_HOURS", 0),
                }
                for i, op in enumerate(payload.get("OPERATIONS") or [])
            ],
            "maint_order_component_items": [
                {
                    "material": c.get("MATERIAL", ""),
                    "requirement_quantity_in_base_unit": c.get("QTY", 0),
                    "base_unit": c.get("UOM", "EA"),
                    "reservation": c.get("RESERVATION"),
                }
                for c in (payload.get("COMPONENTS") or [])
                if c.get("MATERIAL")
            ],
        }

    def send(self, payload: dict) -> SendResult:
        order = payload.get("ORDER") or {}
        wo_num = order.get("WO_NUMBER", "")
        try:
            with httpx.Client(timeout=self.timeout) as client:
                r = client.post(
                    f"{self.base_url}/odata/v4/api_maintorder",
                    json=self._to_odata_body(payload),
                )
                if r.status_code >= 400:
                    return SendResult(
                        status=SendStatus.ERROR,
                        error_message=f"HTTP {r.status_code}: {r.text[:300]}",
                        raw_response=r.text,
                    )
                data = r.json()
                sap_ref = data.get("MaintenanceOrder") or data.get("sap_order_number") or wo_num
                logger.info("[mock] OK wo=%s → sap_ref=%s", wo_num, sap_ref)
                return SendResult(
                    status=SendStatus.SUCCESS,
                    sap_ref=str(sap_ref),
                    raw_response=data,
                )
        except httpx.TimeoutException as e:
            return SendResult(status=SendStatus.ERROR, error_message=f"timeout: {e}")
        except httpx.ConnectError as e:
            return SendResult(
                status=SendStatus.ERROR,
                error_message=f"connection refused — ¿está corriendo ocp-sap-mock en {self.base_url}? ({e})",
            )
        except Exception as e:
            return SendResult(status=SendStatus.ERROR, error_message=f"unexpected: {e}")

    def healthcheck(self) -> bool:
        try:
            with httpx.Client(timeout=3) as client:
                r = client.get(f"{self.base_url}/healthz")
                return r.status_code == 200
        except Exception:
            return False

    # ── Read operations ──────────────────────────────────────────
    def _get(self, path: str, top: int = 25) -> list[dict]:
        try:
            with httpx.Client(timeout=self.timeout) as client:
                r = client.get(f"{self.base_url}{path}", params={"$top": top})
                if r.status_code >= 400:
                    return []
                data = r.json()
                return data if isinstance(data, list) else data.get("value", [])
        except Exception as e:
            logger.warning("mock GET %s → %s", path, e)
            return []

    def list_equipment(self, top: int = 25) -> list[dict]:
        return self._get("/odata/v4/api_equipment", top)

    def list_maintenance_orders(self, top: int = 25) -> list[dict]:
        return self._get("/odata/v4/api_maintorder", top)
