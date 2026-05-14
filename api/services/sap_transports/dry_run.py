"""DryRun transport — implementación default cuando no hay SAP real.

No conecta a ningún sistema; solo loguea el payload y devuelve un sap_ref
sintético tipo ``DRYRUN-{wo_id}-{timestamp}``. Útil en dev, tests y CI/CD.
"""

import logging
from datetime import datetime

from .base import SAPTransport, SendResult, SendStatus

logger = logging.getLogger("ocp_maintenance.sap.dry_run")


class DryRunTransport(SAPTransport):
    name = "dry_run"

    def send(self, payload: dict) -> SendResult:
        order = payload.get("ORDER") or {}
        wo_id = order.get("WO_ID", "unknown")
        wo_num = order.get("WO_NUMBER", "")
        ops_n = len(payload.get("OPERATIONS") or [])
        mat_n = len(payload.get("COMPONENTS") or [])
        sap_ref = f"DRYRUN-{wo_num or wo_id}-{int(datetime.now().timestamp())}"
        logger.info(
            "[DRY-RUN] would send to SAP: wo=%s ops=%d materials=%d → sap_ref=%s",
            wo_num or wo_id, ops_n, mat_n, sap_ref,
        )
        return SendResult(
            status=SendStatus.DRY_RUN,
            sap_ref=sap_ref,
            raw_response={"dry_run": True, "payload_preview": {
                "wo": wo_num, "ops_n": ops_n, "mat_n": mat_n,
            }},
        )

    def healthcheck(self) -> bool:
        return True
