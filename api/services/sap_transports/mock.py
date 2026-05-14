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

    def send(self, payload: dict) -> SendResult:
        order = payload.get("ORDER") or {}
        wo_num = order.get("WO_NUMBER", "")
        try:
            with httpx.Client(timeout=self.timeout) as client:
                r = client.post(
                    f"{self.base_url}/odata/v4/api_maintorder",
                    json=payload,
                )
                if r.status_code >= 400:
                    return SendResult(
                        status=SendStatus.ERROR,
                        error_message=f"HTTP {r.status_code}: {r.text[:300]}",
                        raw_response=r.text,
                    )
                data = r.json()
                sap_ref = data.get("sap_order_number") or data.get("order_number") or wo_num
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
