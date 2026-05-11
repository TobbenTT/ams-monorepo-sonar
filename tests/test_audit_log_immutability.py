"""SF-660 (audit log policy §10) — verifica que ningún código de aplicación
elimine filas del audit_log. Solo el script de purga >5 años puede hacerlo.

Falla si encuentra cualquiera de estos patrones en código fuera de la allowlist:
    - `db.delete(AuditLogModel)`
    - `db.execute("DELETE FROM audit_log")`
    - cualquier `.delete()` con AuditLogModel
    - `DELETE FROM audit_log` raw SQL
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

# Paths que pueden borrar legítimamente (script de purga + reseed demo + este test)
ALLOWLIST = {
    REPO_ROOT / "scripts" / "purge_audit_log_5y.py",
    # Reseed demo wipea TODAS las tablas para reset de ambiente, no es código de app.
    REPO_ROOT / "scripts" / "seed_goldfields_demo.py",
    Path(__file__).resolve(),
}

# Patrones prohibidos
PATTERNS = [
    re.compile(r"\bdelete\s*\(\s*AuditLogModel\b"),
    re.compile(r"DELETE\s+FROM\s+audit_log\b", re.IGNORECASE),
    re.compile(r"AuditLogModel[^)]*\.delete\s*\("),
    re.compile(r"query\s*\(\s*AuditLogModel\s*\)[^)]*\.delete\s*\("),
]

# Directorios a escanear
SCAN_DIRS = ["api", "agents", "tools", "scripts"]

SKIP_DIRS = {"__pycache__", ".pytest_cache", "node_modules", ".venv", "venv", "dist", "build"}


def _iter_py_files():
    for d in SCAN_DIRS:
        root = REPO_ROOT / d
        if not root.exists():
            continue
        for path in root.rglob("*.py"):
            if any(part in SKIP_DIRS for part in path.parts):
                continue
            if path.resolve() in ALLOWLIST:
                continue
            yield path


def test_no_audit_log_deletes_in_application_code():
    """Falla si encuentra DELETE FROM audit_log o AuditLogModel.delete() en código
    fuera del script de purga autorizado."""
    offenders: list[tuple[Path, int, str]] = []
    for path in _iter_py_files():
        try:
            content = path.read_text(encoding="utf-8")
        except Exception:
            continue
        for i, line in enumerate(content.splitlines(), 1):
            # Skip comentarios obvios
            stripped = line.strip()
            if stripped.startswith("#"):
                continue
            for pat in PATTERNS:
                if pat.search(line):
                    offenders.append((path.relative_to(REPO_ROOT), i, line.strip()))
                    break

    if offenders:
        msg_lines = [
            "Encontrado código que borra audit_log fuera del script de purga autorizado.",
            "Solo scripts/purge_audit_log_5y.py puede eliminar filas del audit_log.",
            "Si necesitás corregir un evento, agregá un nuevo registro con action=CORRECTION",
            "y payload.corrects = <audit_id>. Ver docs/AUDIT_LOG_POLICY.md §6.",
            "",
            "Offending lines:",
        ]
        for path, lineno, src in offenders:
            msg_lines.append(f"  {path}:{lineno}  {src[:120]}")
        raise AssertionError("\n".join(msg_lines))


def test_audit_log_model_is_append_only_in_router():
    """Sanity: el router admin/audit-log no tiene endpoint DELETE."""
    admin_py = REPO_ROOT / "api" / "routers" / "admin.py"
    if not admin_py.exists():
        return  # router en otro archivo, no aplicar
    content = admin_py.read_text(encoding="utf-8")
    # Busca decoradores DELETE sobre rutas que mencionen audit
    bad = re.findall(
        r"@router\.delete\([^)]*audit[^)]*\)",
        content,
        flags=re.IGNORECASE,
    )
    assert not bad, f"Router admin tiene endpoint DELETE sobre audit_log: {bad}"
