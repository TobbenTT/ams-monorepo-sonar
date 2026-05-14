"""Root conftest — añade apps/core y packages/ al sys.path para que los
imports `from api.x`, `from tools.x`, `from agents.x`, `from skills.x` sigan
funcionando tras el reordenamiento monorepo (apps/ + packages/).

Esto preserva miles de líneas de imports existentes sin tocarlos."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
for p in (ROOT / "apps" / "core", ROOT / "packages", ROOT / "apps"):
    if p.exists() and str(p) not in sys.path:
        sys.path.insert(0, str(p))
