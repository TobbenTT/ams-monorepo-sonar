"""Autogenerar diagramas de arquitectura desde el código fuente.

Outputs en docs/architecture/:
- bd_schema.mmd      Mermaid ER diagram (relacional)
- bd_schema.dbml     DBML (dbdiagram.io compatible)
- use_cases.mmd      Mermaid flowchart por rol
- api_inventory.md   Inventario endpoints × roles
- README.md          Doc índice

Ejecutar:
    .venv/Scripts/python scripts/gen_architecture_diagrams.py
"""
from __future__ import annotations

import ast
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
MODELS_FILE = ROOT / "api" / "database" / "models.py"
ROUTERS_DIR = ROOT / "api" / "routers"
OUT_DIR = ROOT / "docs" / "architecture"
OUT_DIR.mkdir(parents=True, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────
# 1. Parsear models.py — extraer tablas + columnas + FKs
# ─────────────────────────────────────────────────────────────────────
def parse_models():
    tree = ast.parse(MODELS_FILE.read_text(encoding="utf-8"))
    tables = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.ClassDef):
            continue
        # SQLAlchemy model: hereda de Base
        is_model = any(
            (isinstance(b, ast.Name) and b.id == "Base") for b in node.bases
        )
        if not is_model:
            continue
        tablename = None
        cols = []
        for stmt in node.body:
            if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1:
                t = stmt.targets[0]
                if isinstance(t, ast.Name) and t.id == "__tablename__":
                    if isinstance(stmt.value, ast.Constant):
                        tablename = stmt.value.value
            # mapped columns: Mapped[Type] = mapped_column(...)
            if isinstance(stmt, ast.AnnAssign) and isinstance(stmt.target, ast.Name):
                col_name = stmt.target.id
                col_type = "?"
                if isinstance(stmt.annotation, ast.Subscript):
                    if isinstance(stmt.annotation.slice, ast.Name):
                        col_type = stmt.annotation.slice.id
                    elif isinstance(stmt.annotation.slice, ast.BinOp):
                        # str | None
                        if isinstance(stmt.annotation.slice.left, ast.Name):
                            col_type = stmt.annotation.slice.left.id
                    elif isinstance(stmt.annotation.slice, ast.Subscript):
                        col_type = ast.unparse(stmt.annotation.slice)
                fk_target = None
                pk = False
                if stmt.value:
                    src = ast.unparse(stmt.value)
                    if "primary_key=True" in src:
                        pk = True
                    fkm = re.search(r'ForeignKey\("([^"]+)"', src)
                    if fkm:
                        fk_target = fkm.group(1)
                cols.append({"name": col_name, "type": col_type, "pk": pk, "fk": fk_target})
        if tablename:
            tables.append({"class": node.name, "table": tablename, "cols": cols})
    return tables


# ─────────────────────────────────────────────────────────────────────
# 2. Parsear routers — extraer endpoints + role gates
# ─────────────────────────────────────────────────────────────────────
ROUTE_RE = re.compile(r'@router\.(get|post|put|delete|patch)\("([^"]+)"')
ROLE_RE = re.compile(r'require_role\(([^)]+)\)')
PREFIX_RE = re.compile(r'APIRouter\([^)]*prefix=["\']([^"\']+)["\']')


def parse_routers():
    endpoints = []
    for f in sorted(ROUTERS_DIR.glob("*.py")):
        if f.name.startswith("_"):
            continue
        text = f.read_text(encoding="utf-8", errors="ignore")
        m = PREFIX_RE.search(text)
        prefix = m.group(1) if m else ""
        # Sweep through lines collecting route + nearby role decorator
        lines = text.split("\n")
        for i, line in enumerate(lines):
            rm = ROUTE_RE.search(line)
            if not rm:
                continue
            method = rm.group(1).upper()
            path = rm.group(2)
            # Look ahead for def + Depends(require_role(...))
            func_line = ""
            for j in range(i + 1, min(i + 30, len(lines))):
                func_line += "\n" + lines[j]
                if lines[j].startswith("def ") or lines[j].startswith("async def "):
                    break
            rolm = ROLE_RE.search(func_line)
            roles = []
            if rolm:
                roles = [r.strip().strip("\"'") for r in rolm.group(1).split(",")]
            endpoints.append({
                "file": f.name,
                "method": method,
                "path": f"{prefix}{path}",
                "roles": roles,
            })
    return endpoints


# ─────────────────────────────────────────────────────────────────────
# 3. Generar Mermaid ER diagram
# ─────────────────────────────────────────────────────────────────────
def render_mermaid_er(tables):
    out = ["erDiagram"]
    for t in tables:
        # Mermaid ER: TABLE { type name PK/FK }
        out.append(f"    {t['table'].upper()} {{")
        for c in t["cols"][:15]:  # limitar 15 cols/tabla para legibilidad
            flag = ""
            if c["pk"]:
                flag = " PK"
            elif c["fk"]:
                flag = " FK"
            t_short = c["type"][:20]
            out.append(f"        {t_short} {c['name']}{flag}")
        if len(t["cols"]) > 15:
            out.append(f"        _ et_{len(t['cols']) - 15}_cols_mas_")
        out.append("    }")
    # Relaciones FK
    out.append("")
    for t in tables:
        for c in t["cols"]:
            if c["fk"]:
                fk_table = c["fk"].split(".")[0]
                # Solo si la tabla destino existe
                if any(x["table"] == fk_table for x in tables):
                    out.append(f"    {fk_table.upper()} ||--o{{ {t['table'].upper()} : \"{c['name']}\"")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────
# 4. Generar DBML (dbdiagram.io)
# ─────────────────────────────────────────────────────────────────────
def render_dbml(tables):
    out = ["// MAGEAM — Schema generado automáticamente desde api/database/models.py",
           "// Importar en https://dbdiagram.io para visualización interactiva.\n"]
    for t in tables:
        out.append(f"Table {t['table']} {{")
        for c in t["cols"]:
            attrs = []
            if c["pk"]:
                attrs.append("pk")
            if c["fk"]:
                attrs.append(f"ref: > {c['fk'].replace('.', '.')}")
            t_short = c["type"][:30]
            line = f"  {c['name']} {t_short}"
            if attrs:
                line += f" [{', '.join(attrs)}]"
            out.append(line)
        out.append("}\n")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────
# 5. Use cases por rol
# ─────────────────────────────────────────────────────────────────────
ROLE_LABELS = {
    "admin": "Administrador",
    "manager": "Gerente",
    "planner": "Planificador",
    "supervisor": "Supervisor",
    "tecnico": "Técnico",
}


def render_use_cases(endpoints):
    by_role = defaultdict(list)
    for e in endpoints:
        if not e["roles"]:
            by_role["público (auth requerida)"].append(e)
        else:
            for r in e["roles"]:
                by_role[r].append(e)
    out = ["flowchart LR"]
    for role, lst in by_role.items():
        clean_role = re.sub(r"[^a-z]", "", role.lower())
        out.append(f"    {clean_role}([{ROLE_LABELS.get(role, role)}])")
        # Agrupar por router (file)
        groups = defaultdict(list)
        for e in lst:
            groups[e["file"].replace(".py", "")].append(e)
        for grp, es in list(groups.items())[:8]:
            node_id = f"{clean_role}_{re.sub('[^a-z]', '', grp.lower())}"
            out.append(f'    {node_id}["{grp}<br/>({len(es)} endpoints)"]')
            out.append(f"    {clean_role} --> {node_id}")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────
# 6. API inventory por rol
# ─────────────────────────────────────────────────────────────────────
def render_api_inventory(endpoints):
    by_role = defaultdict(list)
    for e in endpoints:
        roles = e["roles"] or ["(autenticado)"]
        for r in roles:
            by_role[r].append(e)
    out = ["# API Inventory por Rol\n",
           f"Total endpoints: **{len(endpoints)}**\n"]
    for role in sorted(by_role.keys()):
        es = by_role[role]
        label = ROLE_LABELS.get(role, role)
        out.append(f"\n## {label} ({role}) — {len(es)} endpoints\n")
        by_file = defaultdict(list)
        for e in es:
            by_file[e["file"]].append(e)
        for f, lst in sorted(by_file.items()):
            out.append(f"\n### `{f}` ({len(lst)})\n")
            out.append("| Método | Endpoint |")
            out.append("|---|---|")
            for e in lst:
                out.append(f"| `{e['method']}` | `{e['path']}` |")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────
def main():
    print("Parseando models.py...")
    tables = parse_models()
    print(f"  {len(tables)} tablas encontradas")

    print("Parseando routers/...")
    endpoints = parse_routers()
    print(f"  {len(endpoints)} endpoints encontrados")

    (OUT_DIR / "bd_schema.mmd").write_text(render_mermaid_er(tables), encoding="utf-8")
    (OUT_DIR / "bd_schema.dbml").write_text(render_dbml(tables), encoding="utf-8")
    (OUT_DIR / "use_cases.mmd").write_text(render_use_cases(endpoints), encoding="utf-8")
    (OUT_DIR / "api_inventory.md").write_text(render_api_inventory(endpoints), encoding="utf-8")

    readme = f"""# Architecture diagrams — MAGEAM

Generado automáticamente por `scripts/gen_architecture_diagrams.py` el {Path(__file__).stat().st_mtime}.

## Files

- **`bd_schema.mmd`** — Diagrama ER en Mermaid. Pegar en https://mermaid.live o renderizar con
  `mmdc -i bd_schema.mmd -o bd_schema.png`.
- **`bd_schema.dbml`** — DBML compatible con https://dbdiagram.io (importar para vista interactiva
  con todas las relaciones).
- **`use_cases.mmd`** — Casos de uso por rol (flowchart). Mermaid.
- **`api_inventory.md`** — Inventario completo de endpoints por rol.

## Stats

- **{len(tables)} tablas** (SQLAlchemy models)
- **{len(endpoints)} endpoints** (FastAPI routers)
- **{sum(len(t['cols']) for t in tables)} columnas** totales

## Regenerar

```bash
.venv/Scripts/python scripts/gen_architecture_diagrams.py
```

## Cobertura

Endpoints con gate de rol explícito (`require_role(...)`):
"""
    role_counts = defaultdict(int)
    for e in endpoints:
        if e["roles"]:
            for r in e["roles"]:
                role_counts[r] += 1
    for role, cnt in sorted(role_counts.items(), key=lambda x: -x[1]):
        readme += f"- **{ROLE_LABELS.get(role, role)}** (`{role}`): {cnt} endpoints\n"
    no_role_count = sum(1 for e in endpoints if not e["roles"])
    readme += f"\nEndpoints sin gate explícito (solo auth): {no_role_count}\n"

    (OUT_DIR / "README.md").write_text(readme, encoding="utf-8")
    print(f"\nOK — outputs en {OUT_DIR}")
    for f in sorted(OUT_DIR.iterdir()):
        print(f"  {f.name} ({f.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
