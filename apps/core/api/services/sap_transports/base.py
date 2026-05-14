"""Interfaz abstracta SAPTransport — contrato común de todos los transportes."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Any


class SendStatus(str, Enum):
    SUCCESS = "SUCCESS"   # SAP confirmó la operación (sap_ref retornado)
    ERROR = "ERROR"       # SAP rechazó (negocio o conexión); se reintenta
    DRY_RUN = "DRY_RUN"   # No se envió (default sin SAP real)


@dataclass
class SendResult:
    """Resultado de SAPTransport.send().

    - ok=True → operación aceptada por SAP (status SUCCESS o DRY_RUN)
    - ok=False → fallo; ``error_message`` describe la causa; reintenta el worker
    - sap_ref → identificador devuelto por SAP (ej. número de OT o aviso real).
                Solo presente con status=SUCCESS.
    """
    status: SendStatus
    sap_ref: str | None = None
    error_message: str | None = None
    raw_response: Any = None

    @property
    def ok(self) -> bool:
        return self.status in (SendStatus.SUCCESS, SendStatus.DRY_RUN)


class SAPTransport(ABC):
    """Implementar este contrato para cada protocolo (RFC, OData, mock, etc.)."""

    name: str = "abstract"

    @abstractmethod
    def send(self, payload: dict) -> SendResult:
        """Envía un payload BAPI_ALM_ORDER-shaped a SAP.

        El ``payload`` viene de ``sap_sync_service.build_payload(wo)`` y tiene
        claves ORDER / OPERATIONS / COMPONENTS / CLOSURE. Cada transport mapea
        a su protocolo (RFC BAPI call, OData POST, mock HTTP, etc.).
        """
        raise NotImplementedError

    def healthcheck(self) -> bool:
        """Verifica que el transporte puede alcanzar SAP. Por defecto True."""
        return True

    # ── Read operations (GET) ──────────────────────────────────────
    # Default: no soportadas. Cada transport implementa si aplica.
    def list_equipment(self, top: int = 25) -> list[dict]:
        """Lista equipos del master data SAP. Override según protocolo."""
        return []

    def list_maintenance_orders(self, top: int = 25) -> list[dict]:
        """Lista órdenes de mantenimiento existentes en SAP."""
        return []

    def __repr__(self) -> str:
        return f"<SAPTransport name={self.name!r}>"
