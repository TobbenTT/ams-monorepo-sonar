"""Selector — devuelve la instancia de SAPTransport según env ``SAP_TRANSPORT``.

Singleton lazy. La instancia se cachea por nombre para no re-instanciar
costosos clientes HTTP / RFC en cada call.
"""

import logging
import os
from functools import lru_cache

from .base import SAPTransport

logger = logging.getLogger("ocp_maintenance.sap.selector")

# Mapa nombre → factory. Se usan lazy imports para no pagar el costo de
# importar pyrfc/httpx hasta que efectivamente se elija el transport.
_FACTORIES: dict[str, callable] = {}


def _register(name: str, factory):
    _FACTORIES[name] = factory


def _factory_dry_run():
    from .dry_run import DryRunTransport
    return DryRunTransport()


def _factory_mock():
    from .mock import MockSAPTransport
    return MockSAPTransport()


def _factory_rfc():
    from .rfc import RFCTransport
    return RFCTransport()


def _factory_odata():
    from .odata import ODataTransport
    return ODataTransport()


_register("dry_run", _factory_dry_run)
_register("mock", _factory_mock)
_register("rfc", _factory_rfc)
_register("odata", _factory_odata)


@lru_cache(maxsize=1)
def get_transport() -> SAPTransport:
    """Devuelve la instancia configurada por env. Cacheada (singleton)."""
    name = (os.getenv("SAP_TRANSPORT") or "dry_run").lower().strip()
    if name not in _FACTORIES:
        logger.warning(
            "SAP_TRANSPORT='%s' desconocido — disponibles: %s. Usando dry_run.",
            name, sorted(_FACTORIES.keys()),
        )
        name = "dry_run"
    transport = _FACTORIES[name]()
    logger.info("SAP transport seleccionado: %s", transport)
    return transport


def reset_cache() -> None:
    """Forzar re-instanciación. Útil en tests cuando se cambia env var."""
    get_transport.cache_clear()
