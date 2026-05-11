# Architecture diagrams — MAGEAM

Generado automáticamente por `scripts/gen_architecture_diagrams.py` el 1778505950.8545032.

## Files

- **`bd_schema.mmd`** — Diagrama ER en Mermaid. Pegar en https://mermaid.live o renderizar con
  `mmdc -i bd_schema.mmd -o bd_schema.png`.
- **`bd_schema.dbml`** — DBML compatible con https://dbdiagram.io (importar para vista interactiva
  con todas las relaciones).
- **`use_cases.mmd`** — Casos de uso por rol (flowchart). Mermaid.
- **`api_inventory.md`** — Inventario completo de endpoints por rol.

## Stats

- **66 tablas** (SQLAlchemy models)
- **548 endpoints** (FastAPI routers)
- **939 columnas** totales

## Regenerar

```bash
.venv/Scripts/python scripts/gen_architecture_diagrams.py
```

## Cobertura

Endpoints con gate de rol explícito (`require_role(...)`):
- **Administrador** (`admin`): 17 endpoints
- **Gerente** (`manager`): 12 endpoints
- **Planificador** (`planner`): 8 endpoints
- **Supervisor** (`supervisor`): 1 endpoints

Endpoints sin gate explícito (solo auth): 531
