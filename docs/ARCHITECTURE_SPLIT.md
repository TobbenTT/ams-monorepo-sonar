# AMS — Plan de separación del monorepo (para no morir en el intento)

**Fecha**: 2026-05-14
**Autor**: David + Claude
**Estado**: PROPUESTA — testeable en local con `docker-compose.split.yml`

## Diagnóstico actual (LOC reales, sin node_modules)

| Área | LOC | Archivos críticos |
|------|----:|-------------------|
| `frontend/src/` | 25,655 (sin deps) | 65 pages; 8 archivos > 2000 LOC |
| `api/` | 54,336 | **57 routers** monolíticos |
| `tools/` | 24,848 | `schemas.py` 3,498 LOC (god-file) |
| `tests/` | 20,554 | 27% coverage según Carlos |
| `scripts/` | 21,342 | ~50% son one-shots desechables |
| `agents/` | 5,764 | OK, modular |
| `field_app/` | 4,710 | OK, ya separado físicamente |
| `sap_mock/` | 680 | OK, ya containerizado |

**Top 5 monstruos** (los que más duelen al tocar):

1. `frontend/src/pages/Scheduling.jsx` — **6,543 LOC** (split por vista pendiente)
2. `frontend/src/pages/Planning.jsx` — 5,093 LOC
3. `tools/models/schemas.py` — 3,498 LOC (god-file de Pydantic)
4. `frontend/src/pages/FailureCapture.jsx` — 3,393 LOC
5. `frontend/src/pages/WorkOrdersPage.jsx` — 3,289 LOC

## Acoplamiento real (medido por imports)

```
api/        ──→ tools/ (mucho)
api/        ──→ agents/ (1 import: StrategyWorkflow)
api/        ──→ sap_mock/ (1 import: generate_mock_data — seeding)
tools/      ──→ api/config.settings (1 import)
agents/     ──→ tools/ (varios)
agents/     ──→ api/ (CERO)
frontend/   ──→ HTTP only
field_app/  ──→ HTTP only
sap_mock/   ──→ standalone
```

**Conclusión**: el repo NO es un plato de espagueti. Las capas existen, el problema es que **se despliegan juntas** y los archivos individuales crecieron sin freno.

## La separación no es "split el repo en 5 repos"

Eso sería 6 meses de yak-shaving y nadie quiere mantener 5 GitHub Actions. La separación realista tiene 3 capas, de barato a caro:

### Fase 1 — Boundaries explícitas (1 semana, riesgo bajo) ✅ TESTABLE LOCAL

Mantener UN repo, pero deployar los servicios independientes con `docker-compose.split.yml`:

```
ams-core           ← api/ + tools/ + agents/ + skills/  (Python FastAPI)
ams-admin          ← frontend/                          (React, build estático)
ams-field          ← field_app/                         (React mobile)
ams-sap-mock       ← sap_mock/server/                   (ya hecho)
ams-nginx          ← reverse proxy delante de todo
```

**Beneficio**: rebuild de admin no toca ams-core. Rebuild de field no toca admin. Cada equipo redespliega su servicio.

**Lo que NO se rompe**: cero refactor de código, cero migración de DB, los imports siguen funcionando porque siguen en el mismo repo.

### Fase 2 — Modularizar dentro del repo (1 mes, riesgo medio)

Agrupar 57 routers por dominio sin moverlos físicamente:

```
api/routers/
  sap/        sap.py, sap_pm.py
  work/       work_requests.py, work_packages.py, capture.py, tasks.py
  schedule/   scheduling.py, planner.py, backlog.py, assignments.py
  reliability/ reliability.py, criticality.py, fmea.py, rca.py
  admin/      admin.py, auth.py, audit.py
  ai/         ai_agents.py, agentic.py, troubleshooting.py
```

Romper `tools/models/schemas.py` en submódulos por dominio (`schemas/sap.py`, `schemas/work.py`, etc.).

Romper los monstruos del frontend en sub-componentes por vista (ya está en el backlog del proyecto post-2026-05-15).

### Fase 3 — Servicio AI agents independiente (3 meses, riesgo alto)

`agents/ + skills/ + tools/` salen como `ams-agents` con su propio repo y se comunican con `ams-core` solo via HTTP.

**Solo hacer si** Phase 1 + 2 no resuelven el dolor. Probablemente no haga falta.

## Lo que cambia para Carlos (deuda técnica)

- **2048 errores ruff/eslint** → atacar dominio por dominio después de Fase 2 (más fácil cuando los archivos están agrupados)
- **27% cobertura → 50%** → priorizar tests por dominio agrupado, no por archivo

## Acción siguiente

1. **Hoy**: probar `docker-compose.split.yml` local — verificar que los 4 servicios arrancan independientes
2. **Esta semana**: presentar plan a Magda + Carlos en próximo daily
3. **Próxima semana**: decidir si Fase 2 se hace antes o después de la migración SQLite→relacional de Carlos
