"""SAP transports — pluggable strategy for sending payloads to SAP.

Selección por env var ``SAP_TRANSPORT``:
  - ``dry_run`` (default) → solo loguea, no conecta a SAP real
  - ``rfc``               → BAPI/RFC clásicos vía sap_rfc_connector (pyrfc)
  - ``odata``             → REST OData S/4HANA Cloud
  - ``mock``              → Mock-SAP Docker (servicio ocp-sap-mock)

Cualquier transport implementa ``SAPTransport.send(payload) -> SendResult``.
Para agregar uno nuevo: subclasear ``SAPTransport``, registrar en ``selector.py``.
"""

from .base import SAPTransport, SendResult, SendStatus
from .selector import get_transport

__all__ = ["SAPTransport", "SendResult", "SendStatus", "get_transport"]
