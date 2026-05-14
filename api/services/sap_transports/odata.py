"""OData transport — S/4HANA Cloud (REST) según especificación SAP API Hub.

Usa OAuth2 client credentials para auth. Config vía env:
  SAP_ODATA_BASE_URL    p.e. https://my-customer.s4hana.cloud.sap
  SAP_ODATA_CLIENT_ID
  SAP_ODATA_CLIENT_SECRET
  SAP_ODATA_TOKEN_URL   (default: ``{base}/sap/bc/sec/oauth2/token``)
  SAP_ODATA_TIMEOUT     (default: 15s)

Endpoints standard S/4HANA:
  POST /sap/opu/odata/sap/API_MAINTNOTIFICATION/MaintenanceNotification
  POST /sap/opu/odata/sap/API_MAINTENANCEORDER/MaintenanceOrder
  GET  /sap/opu/odata/sap/API_EQUIPMENT/Equipment('{eq_id}')

Esta implementación es la base — al conectarse al SAP real del cliente
(o trial S/4HANA Cloud), se ajustan los path exactos del endpoint.
"""

import logging
import os
import time
from typing import Any

import httpx

from .base import SAPTransport, SendResult, SendStatus

logger = logging.getLogger("ocp_maintenance.sap.odata")


class ODataTransport(SAPTransport):
    name = "odata"

    def __init__(self):
        self.base_url = os.getenv("SAP_ODATA_BASE_URL", "").rstrip("/")
        self.client_id = os.getenv("SAP_ODATA_CLIENT_ID", "")
        self.client_secret = os.getenv("SAP_ODATA_CLIENT_SECRET", "")
        self.token_url = os.getenv(
            "SAP_ODATA_TOKEN_URL",
            f"{self.base_url}/sap/bc/sec/oauth2/token" if self.base_url else "",
        )
        self.timeout = float(os.getenv("SAP_ODATA_TIMEOUT", "15"))
        self._token: str | None = None
        self._token_expires_at: float = 0

    def _configured(self) -> bool:
        return all([self.base_url, self.client_id, self.client_secret])

    def _get_token(self) -> str:
        """OAuth2 client_credentials con cache simple."""
        if self._token and time.time() < self._token_expires_at - 60:
            return self._token
        with httpx.Client(timeout=self.timeout) as client:
            r = client.post(
                self.token_url,
                data={"grant_type": "client_credentials"},
                auth=(self.client_id, self.client_secret),
            )
            r.raise_for_status()
            data = r.json()
            self._token = data["access_token"]
            self._token_expires_at = time.time() + int(data.get("expires_in", 3600))
            return self._token

    def _convert_order_payload(self, payload: dict) -> dict:
        """Mapea nuestro payload BAPI_ALM shape → OData MaintenanceOrder shape."""
        order = payload.get("ORDER") or {}
        return {
            "MaintenanceOrderType": order.get("TYPE", "PM01"),
            "MainWorkCenter": order.get("WORK_CENTER", ""),
            "FunctionalLocation": order.get("TECH_LOCATION", ""),
            "Equipment": order.get("EQUIPMENT", ""),
            "MaintOrderPlanningPlant": order.get("PLANT", ""),
            "MaintOrderShortText": order.get("DESCRIPTION", "")[:40],  # SAP limit
            "MaintenancePriority": order.get("PRIORITY", "P3"),
            "PlannedStartDateTime": order.get("PLAN_START"),
            "PlannedEndDateTime": order.get("PLAN_END"),
            "MaintOrderOperationItems": [
                {
                    "OperationActivity": str(i + 1).zfill(4),
                    "OperationDescription": (op.get("DESC", "") or "")[:40],
                    "WorkCenter": op.get("WORK_CENTER", ""),
                    "OperationPlannedWork": op.get("PLAN_HOURS", 0),
                }
                for i, op in enumerate(payload.get("OPERATIONS") or [])
            ],
            "MaintOrderComponentItems": [
                {
                    "Material": comp.get("MATERIAL", ""),
                    "RequirementQuantityInBaseUnit": comp.get("QTY", 0),
                    "BaseUnit": comp.get("UOM", "EA"),
                    "Reservation": comp.get("RESERVATION", ""),
                }
                for comp in (payload.get("COMPONENTS") or [])
                if comp.get("MATERIAL")
            ],
        }

    def send(self, payload: dict) -> SendResult:
        if not self._configured():
            logger.warning("ODataTransport sin config (SAP_ODATA_BASE_URL/CLIENT_ID/SECRET) — fallback dry-run")
            from .dry_run import DryRunTransport
            return DryRunTransport().send(payload)
        try:
            token = self._get_token()
        except Exception as e:
            return SendResult(status=SendStatus.ERROR, error_message=f"OAuth2 token failed: {e}")
        try:
            odata_body = self._convert_order_payload(payload)
            with httpx.Client(timeout=self.timeout) as client:
                r = client.post(
                    f"{self.base_url}/sap/opu/odata/sap/API_MAINTENANCEORDER/MaintenanceOrder",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    json=odata_body,
                )
                if r.status_code >= 400:
                    return SendResult(
                        status=SendStatus.ERROR,
                        error_message=f"HTTP {r.status_code}: {r.text[:400]}",
                        raw_response=r.text,
                    )
                data: dict[str, Any] = r.json()
                sap_ref = data.get("MaintenanceOrder") or data.get("d", {}).get("MaintenanceOrder", "")
                return SendResult(
                    status=SendStatus.SUCCESS,
                    sap_ref=str(sap_ref) if sap_ref else None,
                    raw_response=data,
                )
        except httpx.TimeoutException as e:
            return SendResult(status=SendStatus.ERROR, error_message=f"timeout: {e}")
        except Exception as e:
            return SendResult(status=SendStatus.ERROR, error_message=f"unexpected: {e}")

    def healthcheck(self) -> bool:
        if not self._configured():
            return False
        try:
            self._get_token()
            return True
        except Exception:
            return False
