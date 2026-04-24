---
name: Setup de tests + CI del backend
description: Dónde viven los tests, cómo correrlos, qué cubre cada archivo. Útil al tocar auth, criticality, fmeca, rca, security.
type: reference
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
**Tests backend viven en `tests/test_api/`** — 162 pre-existentes + 4 nuevos del QA 2026-04-22.

**Config:**
- `tests/test_api/conftest.py` setea `JWT_SECRET_KEY`, `TESTING`, `DEBUG` automáticamente al importarse — NO hace falta exportarlos a mano.
- Fixture `seeded_client` crea plant `TEST-PLANT` + hierarchy + equipment (`equipment_node_id`).
- Fixture `client` solo da TestClient sin seed.

**Archivos nuevos (agregados en QA 2026-04-22):**
- `test_criticality_v2.py` — endpoint `/criticality/by-plant`, propagación de letra al nodo al approve.
- `test_fmeca_workflow.py` — `/worksheets-summary`, `/push-to-backlog`, `/suggestions` (equipos con P1/P2 cerrados).
- `test_rca_capa.py` — save `cause_effect.branches`, save `evidence_5p`, `/push-to-capa` idempotente.
- `test_auth_security.py` — password policy, login rate limit (10/min por IP), CSP/COOP headers.

**CI:** `.github/workflows/ci.yml` corre en cada push a `feature/**`, `main`, `demo-seed-data`:
1. Backend · pytest smoke → `test_smoke_critical.py` (failing-blocks CI)
2. Backend · full suite → resto de `test_api/*` (allow-fail)
3. Frontend · npm build + lint (lint allow-fail)
4. Docker · backend image build

**Deploy local (VPS):** `/root/deploy.sh all` corre pytest **antes** de rebuild. Si fallan → aborta. Flag `--skip-tests` para emergencias.

**Correr local:** `python -m pytest tests/test_api -q` — tarda ~35s por archivo, ~5min full suite en Windows. Usar CI para full runs.
