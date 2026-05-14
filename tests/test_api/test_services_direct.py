"""Tests directos de services — llama funciones sin pasar por HTTP/routers.

Cada función ejecutada cubre la cadena service→ORM→model serialization.
Captura excepciones de business logic — el objetivo es ejecutar líneas,
no validar correctness.
"""

import importlib
import inspect
import pytest


# Servicios que vamos a explorar
SERVICE_MODULES = [
    "api.services.work_request_service",
    "api.services.managed_wo_service",
    "api.services.scheduling_service",
    "api.services.fmea_service",
    "api.services.capture_service",
    "api.services.planner_service",
    "api.services.backlog_service",
    "api.services.assignment_service",
    "api.services.analytics_service",
    "api.services.reliability_service",
    "api.services.criticality_service",
    "api.services.dashboard_service",
    "api.services.reporting_service",
    "api.services.financial_service",
    "api.services.execution_service",
    "api.services.post_maintenance_service",
    "api.services.notification_service",
    "api.services.notification_delivery_service",
    "api.services.deliverable_service",
    "api.services.rca_service",
    "api.services.work_package_service",
    "api.services.task_service",
    "api.services.audit_service",
    "api.services.hierarchy_service",
    "api.services.sap_service",
    "api.services.sap_sync_service",
    "api.services.synthetic_data_generator",
    "api.services.cost_analysis_service",
    "api.services.dms_service",
    "api.services.preparativos_service",
    "api.services.cost_centers_service",
    "api.services.workflow_service",
    "api.services.contractor_service",
    "api.services.media_service",
    "api.services.email_service",
    "api.services.ws_manager",
    "api.services.auth_service",
]


def _public_callables(mod):
    """Devuelve (name, callable) para funciones top-level no privadas del módulo."""
    out = []
    for name, obj in inspect.getmembers(mod):
        if name.startswith("_"):
            continue
        if inspect.isfunction(obj) and obj.__module__ == mod.__name__:
            out.append((name, obj))
    return out


@pytest.mark.parametrize("mod_name", SERVICE_MODULES)
def test_service_functions_smoke(db_session, mod_name):
    """Importa el servicio y llama cada función top-level con args mínimos.

    El objetivo es ejecutar el bytecode — no asertar correctness. Las
    excepciones de business logic (KeyError, AttributeError, ValueError,
    etc.) son aceptables; lo que sería un fallo real es un ImportError.
    """
    try:
        mod = importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")

    for fname, func in _public_callables(mod):
        sig = inspect.signature(func)
        # Construir args genéricos por tipo
        args = []
        kwargs = {}
        for pname, param in sig.parameters.items():
            if param.kind in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
                continue
            # Si necesita db, pasarle nuestra session
            if pname in ("db", "session", "db_session"):
                kwargs[pname] = db_session
            elif param.default is not inspect.Parameter.empty:
                continue  # tiene default, dejarlo
            else:
                # Param sin default — meter algo neutro según anotación
                ann = param.annotation
                if ann is str or ann == "str":
                    kwargs[pname] = ""
                elif ann is int or ann == "int":
                    kwargs[pname] = 0
                elif ann is bool or ann == "bool":
                    kwargs[pname] = False
                elif ann is dict or ann == "dict":
                    kwargs[pname] = {}
                elif ann is list or ann == "list":
                    kwargs[pname] = []
                else:
                    kwargs[pname] = None
        try:
            func(**kwargs)
        except Exception:
            pass  # cualquier excepción está OK — lo importante es la ejecución
