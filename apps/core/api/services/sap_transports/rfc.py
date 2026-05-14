"""RFC transport — wrapper sobre sap_rfc_connector existente (pyrfc).

Si ``pyrfc`` está instalado y SAP_AVAILABLE=True, llama BAPI_ALM_ORDER_MAINTAIN
para crear/actualizar OTs. Si no está disponible, degrada a dry-run.

Config via env (mismas que sap_rfc_connector):
  SAP_ASHOST, SAP_SYSNR, SAP_CLIENT, SAP_USER, SAP_PASSWD, SAP_LANG
"""

import logging
import os

from .base import SAPTransport, SendResult, SendStatus

logger = logging.getLogger("ocp_maintenance.sap.rfc")


class RFCTransport(SAPTransport):
    name = "rfc"

    def __init__(self):
        # Lazy-import; pyrfc puede no estar instalado en algunos entornos
        try:
            from api.services.sap_rfc_connector import SAP_AVAILABLE, SAPRFCConnector  # noqa: F401
            self._available = SAP_AVAILABLE
            if SAP_AVAILABLE:
                # Construir el connector con env config
                self._connector = SAPRFCConnector(config=self._build_config())
            else:
                self._connector = None
                logger.warning("pyrfc no instalado — RFC transport en modo dry-run automático")
        except Exception as e:
            self._available = False
            self._connector = None
            logger.error("RFC transport init falló: %s", e)

    @staticmethod
    def _build_config():
        from api.services.sap_rfc_connector import SAPConfig  # type: ignore[attr-defined]
        return SAPConfig(
            ashost=os.getenv("SAP_ASHOST", ""),
            sysnr=os.getenv("SAP_SYSNR", "00"),
            client=os.getenv("SAP_CLIENT", "100"),
            user=os.getenv("SAP_USER", ""),
            passwd=os.getenv("SAP_PASSWD", ""),
            lang=os.getenv("SAP_LANG", "ES"),
        )

    def send(self, payload: dict) -> SendResult:
        if not self._available or not self._connector:
            # Degradar limpio a dry-run cuando pyrfc no está disponible
            from .dry_run import DryRunTransport
            return DryRunTransport().send(payload)
        try:
            result = self._connector.create_maintenance_order(payload)
            if result.get("status") == "SUCCESS":
                return SendResult(
                    status=SendStatus.SUCCESS,
                    sap_ref=result.get("order_number"),
                    raw_response=result,
                )
            return SendResult(
                status=SendStatus.ERROR,
                error_message=result.get("message", "RFC call failed"),
                raw_response=result,
            )
        except Exception as e:
            return SendResult(status=SendStatus.ERROR, error_message=str(e))

    def healthcheck(self) -> bool:
        if not self._available:
            return False
        try:
            return self._connector.ping() if self._connector else False
        except Exception:
            return False
