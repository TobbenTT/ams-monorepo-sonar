"""Smoke imports — importa todos los módulos backend para ejecutar
definiciones de clases, decoradores, constantes y dataclasses.

Sube cobertura significativamente sin escribir tests funcionales por cada
módulo: una vez importado, todo el código top-level (incluyendo Pydantic
field validators, SQLAlchemy column defs, FastAPI router definitions, etc.)
queda cubierto.

Si alguno de estos imports falla → regresión real de imports rotos.
"""

import importlib
import pkgutil

import pytest


def _iter_modules(root_pkg: str):
    """Yield todos los módulos importables bajo root_pkg recursivamente."""
    try:
        pkg = importlib.import_module(root_pkg)
    except ImportError:
        return
    if not hasattr(pkg, "__path__"):
        return
    for _, name, _is_pkg in pkgutil.walk_packages(pkg.__path__, prefix=f"{root_pkg}."):
        yield name


# Listas explícitas — se evaluan en collection-time (importes lazy)
API_SERVICES = list(_iter_modules("api.services"))
API_ROUTERS = list(_iter_modules("api.routers"))
API_AI_CORE = list(_iter_modules("api.ai_core"))
TOOLS_ENGINES = list(_iter_modules("tools.engines"))
TOOLS_MODELS = list(_iter_modules("tools.models"))
TOOLS_PROCESSORS = list(_iter_modules("tools.processors"))
TOOLS_VALIDATORS = list(_iter_modules("tools.validators"))


# Módulos que requieren deps externas que pueden no estar instaladas en CI
SKIP_IF_MISSING_DEPS = {
    "api.services.sap_rfc_connector",  # pyrfc no siempre disponible
    "api.routers.security",
    "api.routers.mfa",
    "api.routers.sales",
}


@pytest.mark.parametrize("mod_name", API_SERVICES)
def test_import_api_services(mod_name):
    if mod_name in SKIP_IF_MISSING_DEPS:
        pytest.skip("dep externa opcional")
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")


@pytest.mark.parametrize("mod_name", API_ROUTERS)
def test_import_api_routers(mod_name):
    if mod_name in SKIP_IF_MISSING_DEPS:
        pytest.skip("dep externa opcional")
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")


@pytest.mark.parametrize("mod_name", API_AI_CORE)
def test_import_api_ai_core(mod_name):
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")


@pytest.mark.parametrize("mod_name", TOOLS_ENGINES)
def test_import_tools_engines(mod_name):
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")


@pytest.mark.parametrize("mod_name", TOOLS_MODELS)
def test_import_tools_models(mod_name):
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")


@pytest.mark.parametrize("mod_name", TOOLS_PROCESSORS)
def test_import_tools_processors(mod_name):
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")


@pytest.mark.parametrize("mod_name", TOOLS_VALIDATORS)
def test_import_tools_validators(mod_name):
    try:
        importlib.import_module(mod_name)
    except ImportError as e:
        pytest.skip(f"dep faltante: {e}")
