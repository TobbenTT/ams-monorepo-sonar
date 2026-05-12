# Estrategia de Testing AMS / MagEAM

**Reunión:** Martes 12-may-2026 · 15:00–15:45
**Asistentes:** Magdalena Ortega (org), Carlos Iturra, David Cabezas
**Owner:** David Cabezas
**Versión:** 1.0 · 2026-05-12

---

## 1. Resumen ejecutivo

Tenemos una base de 1593 tests pytest backend con 94% de pass rate, una pirámide de testing **incompleta arriba** (frontend sin tests automatizados, E2E manual), y un **proceso UAT informal** con Jorge. Esta reunión define las 4 decisiones clave para cerrar esos huecos antes del cierre de Sprint 7 (vie 15-may) y arrancar Sprint 8 con la pirámide completa.

**Las 4 decisiones para hoy** (ver §10):
1. Fix de 12 tests rojos: ¿full sprint dev day o solo críticos?
2. Vitest + Playwright en CI: ¿SP7 o SP8?
3. Casos de uso por rol (Carlos · 0G1): ¿plazo de entrega?
4. UAT formal cliente: ¿roles y cadencia?

---

## 2. Estado actual — números reales del repo

### 2.1 Cobertura por capa (HEAD `7eb4cec` · medido hoy 12-may 11:30 AM)

| Capa | Stack | Total | Pasando | % | Estado |
|------|-------|-------|---------|---|--------|
| Backend pytest (unit + integration) | pytest + FastAPI TestClient | 1593 collected | 202/214 API · 94% | 🟡 | 8 archivos con import errors, 12 tests fallando |
| Backend security regression | pytest (6 archivos test_security_*) | ~80 tests | la mayoría OK | 🟡 | Cubre IDOR + role escalation + input validation + state integrity + tool access + serialization |
| Frontend unit | (sin framework instalado) | 0 | 0 | ❌ | vitest/jest sin configurar |
| Frontend E2E | Playwright MCP (manual con Claude) | sin contar | n/a | 🟡 | Hoy manual, no automatizado |
| CI/CD | GitHub Actions `.github/workflows/ci.yml` | smoke + full API + build | OK | ✅ | Falla "smoke critical" bloquea merge |
| UAT cliente | informal (jornadas presenciales VSC) | n/a | n/a | ❌ | Sin checklist formal por sprint |
| Coverage de código | no medido | n/a | n/a | ❌ | Sin pytest-cov en CI |
| Performance / carga | no medido | n/a | n/a | ❌ | Sin locust/k6 |

### 2.2 Distribución pytest backend por módulo

| Módulo | Archivos tests | Tests aprox | Estado |
|--------|----------------|-------------|--------|
| WR + WO management | test_managed_wo, test_work_requests, test_ot_calendar_sync | ~70 | 🟡 12 fail en validate + smoke |
| Scheduling | test_scheduling | ~25 | ✅ pass |
| Criticality + FMECA | test_criticality, test_criticality_v2, test_fmea, test_fmeca_workflow | ~60 | ✅ pass |
| Hierarchy + Plant | test_hierarchy | ~30 | ✅ pass |
| RCA + CAPA | test_rca, test_rca_capa | ~45 | 🟡 3 fail DE_KPIs |
| Tasks + Work packages | test_tasks, test_work_packages | ~40 | ✅ pass |
| SAP integration | test_sap, test_sap_status, test_sap_upload | ~35 | ✅ pass |
| Capture + Planner | test_capture, test_planner | ~25 | ✅ pass |
| Dashboard + Analytics | test_dashboard, test_analytics | ~20 | ✅ pass |
| Security regression | test_security_* (×6) | ~80 | 🟡 2 fails post-refactor |
| Engines deterministas | test_*_engine (×30 archivos) | ~400 | ✅ mostly pass |
| Skills system | test_skills_*, test_agent_* | ~120 | ✅ pass |
| Integration E2E backend | test_e2e_full_flow, test_integration/* | ~50 | ✅ pass |
| Inmutabilidad audit log | test_audit_log_immutability | 2 | ✅ pass (SF-660) |

### 2.3 Bugs detectados últimos 30 días (datos del git log)

| Bug | Detectado por | Sprint | Severidad | Causa raíz |
|-----|---------------|--------|-----------|------------|
| BUG-01 WR creado mostraba "WR-2026-XXX" no "AV-NNNNN" | QA presencial VSC | SP7 | Media | Endpoint no devolvía aviso_number |
| BUG-02 View Notifications redirect fail standalone | QA Playwright | SP7 | Media | useNavigate sin fallback |
| BUG-03 WR creado no refresh en /planning si origen /failure-capture | QA presencial | SP7 | Baja | Single dispatch WS event |
| BUG-04 Circunstancias concat en OT description | QA presencial | SP7 | Media | Logic en managed_wo_service |
| IDOR /managed-work-orders/{id} | Security audit | SP7 | **Alta** | Query param plant_id attacker-controlled |
| DMS endpoint sin auth | Security audit | SP7 | **Alta** | Router publico filtrando docs SAP |
| Permission escalation tecnico ver admin endpoints | Security audit | SP6 | **Alta** | Falta require_role en routers |
| Backlog sin scope plant_id | Security audit | SP6 | Media | Cross-plant data leak |
| GOLDFIELDS-SN leak en title/aria | QA visual | SP7 | Baja | Tooltips dev-only no removidos |
| /rag/stats retorna empty con tables presentes | DOM test | SP7 | Baja | Lazy load no triggered |

**Lección:** 4 bugs alta severidad de seguridad encontrados por audit, no por tests automatizados. **Gap claro**: necesitamos tests de seguridad regression en CI antes de cada merge, no solo en audits puntuales.

---

## 3. Estrategia propuesta — pirámide testing AMS

### 3.1 Modelo en niveles

| Nivel | Capa | Stack | Frecuencia | Volumen objetivo |
|-------|------|-------|------------|------------------|
| 5 (vértice) | **UAT cliente** | Manual + checklist | 1× por sprint (cada 2 sem) | 30-50 puntos clave |
| 4 | **E2E Playwright** | Playwright + CI nightly | Diario en `main` | 15 flujos críticos → 30 en Q3 |
| 3 | **Frontend unit** | vitest + @testing-library/react | Pre-commit | 40% componentes críticos |
| 2 | **Integration** | pytest + FastAPI TestClient | Pre-commit + CI | 60% routers cubiertos |
| 1 (base) | **Unit backend** | pytest engines + skills | Pre-commit + CI | 1500+ tests (ya tenemos) |

### 3.2 Cobertura objetivo medida

| Capa | Hoy | Meta SP8 (fin junio) | Meta Q3-2026 | Métrica |
|------|-----|----------------------|--------------|---------|
| Backend pytest pass rate | 94% | **100%** | 100% | tests/total |
| Backend line coverage | no medido | **70%** | 80% | pytest-cov |
| Frontend unit | 0% | **40%** | 70% | vitest --coverage |
| E2E Playwright | manual | **15 flujos CI nightly** | 30 flujos + smoke pre-merge | escenarios automatizados |
| Security regression | 6 archivos | **+ rate limiting + CSRF + JWT replay** | OWASP top 10 cobertura | tests/categoría |
| Performance | 0 | locust básico 100 RPS | 500 RPS sostenido | RPS sin degradación |

### 3.3 Los 15 flujos E2E que automatizamos primero

| # | Flujo | Módulos involucrados | Prioridad |
|---|-------|---------------------|-----------|
| 1 | Login + role check (admin/planner/supervisor/tecnico) | auth, role gates | P1 |
| 2 | Crear WR con foto + audio + IA suggest priority | capture, AI agents | P1 |
| 3 | WR → OT (from-wr) + reservar materiales | managed_wo, inventory | P1 |
| 4 | Drag-drop OT en Scheduling vista Horarios (SF-656) | scheduling, smart assignment | P1 |
| 5 | Reschedule con razón obligatoria (SF-578) | reschedule endpoint | P1 |
| 6 | Cierre OT con firma PIN + supervisor signature | execution, audit | P1 |
| 7 | Audit log scope per role (SF-660) | admin/audit-log, RBAC | P1 |
| 8 | Orphans detection (SF-657) | managed_wo orphans | P2 |
| 9 | Audit capacity sobrecapacidad + shift mismatch (SF-656) | scheduling/audit-capacity | P2 |
| 10 | AI analyze OT función 1 (SF-661) | managed_wo/ai-analyze | P2 |
| 11 | Preparativos state machine RECIBIDO conforme (SF-662) | preparativos | P2 |
| 12 | RAG search OT history → resultado relevante | rag/search ot_history | P2 |
| 13 | Failure capture standalone → Notifications redirect | failure-capture | P2 |
| 14 | Export OT a Excel completo | managed_wo + reports | P3 |
| 15 | Anonimización plant_id (no leak en hover/aria) | UI components | P3 |

---

## 4. Lo que está roto hoy (deuda técnica testing)

### 4.1 12 tests fallando en backend

| Archivo | Tests fallando | Causa probable | ETA fix |
|---------|----------------|----------------|---------|
| `test_api/test_rca.py` | 3 (DE_KPIs) | Fixtures DE KPIs cambiaron tras refactor SF-585 | 2h |
| `test_api/test_smoke_critical.py` | 2 (closure signature) | PIN hash bcrypt expectation desactualizada | 1h |
| `test_api/test_work_requests.py` | 2 (validate approve/reject) | Workflow gates cambiaron en SF-578 reason mandatory | 2h |
| `test_security_input_validation.py` | 1 | Schema validation strict mode tras seguridad audit | 1h |
| `test_security_serialization.py` | 1 | Nuevo campo en response no contemplado | 30min |
| `test_security_tool_access.py` | 1 | Permisos cambiaron tras 0G2 supervisor role | 30min |
| `test_security_state_integrity.py` | 1 | Migration version field SF-562 | 1h |
| `test_security_api_endpoints.py` | 1 | DMS auth agregada bb3ca2b | 1h |

**Total esfuerzo: ~9 horas** (~1 día dev).

### 4.2 8 archivos con import errors de collection

```
test_tool_wrappers_integration.py
test_workflow_edge_cases.py
test_workflow_simulation.py
test_security_tool_access.py (también arriba)
test_orchestrator_agent.py
test_agent_tool_access.py
test_processors/test_planner_engine.py
test_skill_loading.py
```

**Causa común:** reorganización módulos tras consolidación agents/_shared/paths.py. Probablemente imports rotos que no se actualizaron.

**Esfuerzo estimado:** 3-4 horas.

### 4.3 Frontend cero tests automatizados

| Componente crítico | Tests propuestos vitest |
|--------------------|------------------------|
| `Planning.jsx` OT modal | render + tab switch + save + edit |
| `Scheduling.jsx` drag-drop | matching engine + capacity gate |
| `FailureCapture.jsx` | foto + audio + IA suggest + redirect |
| `useAuth` + `usePermissions` hooks | role gates correctos |
| `WorkOrdersPage.jsx` filtros | search + filter combinations |

**Esfuerzo setup inicial:** 2-3 días + 1 día por componente crítico.

---

## 5. Procesos UAT formal cliente — propuesta

### 5.1 Cadencia y formato

| Item | Propuesta |
|------|-----------|
| Frecuencia | **1× por sprint** (cada 2 semanas) |
| Modalidad | 2-3h Google Meet + 1h demo en jornada VSC presencial mensual |
| Documento | Checklist Excel **generado automáticamente** desde Gap Analysis (174 items) |
| Sign-off | Magdalena firma como gate para mergear release-branch a `main` |
| Bugs encontrados | Issue Jira inmediato + label `UAT-sprint-X` |
| Tracking en Confluence | Acta + decisiones + acciones |

### 5.2 Template UAT script (por feature)

```
ID: UAT-SP7-001
Feature: SF-656 Auditoría visual capacidad
Ejecutado por: Jorge Alquinta
Acompañó: David Cabezas

Pre-condición: Ingresar como planner en mageam.com con plant_id GOLDFIELDS-SN
Datos test: Semana 2026-05-04, cap=40h/sem

Pasos:
  1. Ir a /scheduling tab Auditoría
  2. Filtrar semana 4-may, hours_per_week=40
  3. Click Recalcular

Resultado esperado:
  - Banner rojo si hay violaciones
  - Tabla sobrecapacidad con técnicos > 40h
  - Tabla violaciones DAY/NIGHT con OT linkeable

Resultado actual: [ ] OK [ ] FAIL
Notas Jorge:
___________________________________________

Sign-off: [ ] Aprobado [ ] Aprobado con observaciones [ ] Rechazado
```

### 5.3 Roles UAT

| Rol | Responsabilidad |
|-----|----------------|
| **Magdalena Ortega** | Aprobar prioridades + sign-off sprint + escalar bloqueantes con cliente |
| **Jorge Alquinta** | Validación funcional (casos de uso reales) + casos límite minero |
| **Carlos Iturra** | Documentar casos de uso por rol (0G1) — input para tests E2E y UAT scripts |
| **David Cabezas** | Backend tests + Playwright E2E + CI/CD + fix tests rojos + acompañar UAT |
| **Claude / AI** | Regression tests automáticos + análisis cobertura + Playwright DOM exploratorio |

---

## 6. Casos de uso por rol — input crítico para Carlos (0G1)

Carlos tiene pendiente desde la jornada VSC entregar el **diagrama de casos de uso por rol** (camino feliz + tristes + errores). Esto es **input directo** para:
- Los 15 flujos E2E Playwright (§3.3)
- Los UAT scripts por feature (§5.2)
- Los tests de role escalation (test_security_*)

### 6.1 Roles a documentar

| Rol | Camino feliz típico | Caminos tristes | Errores comunes |
|-----|--------------------|-----------------|-----------------|
| **Operador / Mantenedor** | Crear WR con foto en patio | WR rechazada por duplicado | Sin conexión, foto se pierde |
| **Supervisor** | Aprobar WR + asignar planner | Falta info → rechazar con razón | Aprobar duplicado por accidente |
| **Planificador** | WR → OT + reservar materiales + asignar técnicos | Material faltante → bloquear | Asignar técnico vacaciones |
| **Programador** | Drag-drop OT en Scheduling Horarios | Sobrecapacidad → recibir warning | Reservar semana sin completar carpeta |
| **Técnico / Ejecutor** | Recibir OT en patio + ejecutar + firma cierre | OT incompleta → reportar back | Olvidar firma PIN |
| **Ingeniero Confiabilidad** | RCA post-cierre + lecciones | Datos insuficientes → re-solicitar | FMEA sin link a OT |
| **Admin / Manager** | Ver dashboards + audit log + KPIs | Permission escalation intento | Audit log con datos corruptos |

### 6.2 Entregables esperados de Carlos

1. **Diagrama UML casos de uso** por rol (formato draw.io o Mermaid)
2. **Tabla CRUD por entidad por rol** (matriz permisos)
3. **5-7 escenarios narrativos** por rol (1 feliz + 2 tristes + errores)
4. **Validación con Jorge** que los casos reflejen operación real Goldfields

**Plazo propuesto:** LUN-MAR 18-19 may (primera semana SP8).

---

## 7. Pipeline CI/CD actual

### 7.1 `.github/workflows/ci.yml`

```yaml
jobs:
  backend:
    - pytest smoke critical (BLOQUEA merge si falla)
    - pytest full API suite (no bloquea, warnings ok)
  frontend:
    - npm install
    - npm run build
    - lint (no bloquea)
  docker:
    - Build backend image
```

### 7.2 Gaps en pipeline

| Gap | Impacto | Mitigación SP8 |
|-----|---------|----------------|
| Sin coverage reporting | No sabemos qué partes del código nunca se ejecutan en tests | Agregar `pytest-cov` + Codecov badge |
| Sin Playwright E2E | Bugs visuales/flujo cross-page se descubren en producción | Job nuevo `e2e-nightly` con 5 escenarios → escalar a 15 |
| Sin frontend unit | Cambios JSX pueden romper render sin alerta | Agregar `npm run test:unit` con vitest |
| Sin security regression | Tests existen pero no corren en CI | Agregar job `security` con los 6 archivos test_security_* |
| Sin performance baseline | Regresiones de performance pasan inadvertidas | Locust básico → 100 RPS smoke en CI weekly |
| Sin dependency vulnerability scan | 10 vulnerabilities en Dependabot (4 high, 6 moderate) sin atender | Job `audit` con `npm audit --audit-level=high` + `pip-audit` |

---

## 8. Estrategia de regresión

### 8.1 Principios

1. **Cada bug encontrado en producción → test que lo cubra antes del fix.** Ya hacemos esto parcialmente con SF-660 immutability test post audit log policy.
2. **Cada feature nueva → al menos 1 test backend + 1 verificación DOM Playwright.** Lo aplicamos en SF-661, SF-662, SF-656.
3. **Cada cambio de schema BD → test de migration up + down + datos preservados.** Falta esto.
4. **Cada role nuevo → test de role escalation + scope check.** Aplicado en 0G2 supervisor.

### 8.2 Test data strategy

| Tipo data | Estrategia actual | Mejora propuesta |
|-----------|------------------|------------------|
| Unit tests | Fixtures hardcoded en conftest.py | OK como está |
| Integration tests | Database SQLite in-memory por test | OK |
| E2E Playwright | Data real producción mageam.com | **Crear ambiente staging con seed determinístico** |
| UAT cliente | Data semi-real (Goldfields anonimizado) | Sincronizar staging con producción semanal |
| Performance | n/a | Generar dataset 10x producción para load tests |

---

## 9. Riesgos identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|--------------|---------|------------|
| R1 | Tests fallando en `main` se acumulan e infectan otros | Alta | Alto | CI gate estricto + 1 día dedicado a fix por sprint |
| R2 | UAT cliente sin checklist se vuelve subjetivo | Media | Medio | Generar checklist desde Gap Analysis · ya existe |
| R3 | Cambios de schema rompen E2E silenciosamente | Alta | Alto | Playwright en CI nightly + alertas Slack |
| R4 | Cobertura frontend = 0% indefinido | Alta | Alto | Iniciar vitest en SP8 con 5 componentes críticos |
| R5 | **Demo Marco Ovalle MIE 13 expone bug crítico** | Media | **Crítico** | Smoke test manual MAR tarde + revert plan |
| R6 | Tests de seguridad no en CI → vulnerability llega a prod | Alta | Crítico | Job CI dedicado security regression en SP8 W1 |
| R7 | Carlos no entrega 0G1 → tests E2E sin spec | Media | Alto | David escribe spec mínimo en paralelo si demora |
| R8 | UAT cliente Magdalena con poca disponibilidad | Media | Alto | Acotar a 2h cada 2 sem + agenda fija |
| R9 | Dependabot 10 vulnerabilities (4 high) sin atender | Media | Alto | Issue Jira inmediato + dependabot auto-merge | 
| R10 | Bugs encontrados por audits y no por tests | Alta | Alto | Cada bug nuevo → test regression antes del fix (R2 del estándar) |

---

## 10. Decisiones concretas para esta reunión

### Decisión 1 — ¿Cuánto esfuerzo a fix tests rojos esta semana?

| Opción | Esfuerzo | Pros | Contras |
|--------|----------|------|---------|
| A) Full sprint dev day (1 día) | 9h David | Todo el suite verde antes SP8 | Bloquea otros entregables esta semana |
| B) Solo 5 críticos (smoke + WR validate + 2 security) | 4h David | No bloquea cronograma | 7 tests siguen en rojo a SP8 |
| C) Diferir 100% a SP8 W1 | 0h SP7 | No bloquea | Acumula deuda, riesgo de duplicar fail |

**Recomendación:** **B** — fix los 5 críticos antes VIE 15-may + resto agendado SP8 W1.

### Decisión 2 — ¿Cuándo instalamos vitest + Playwright en CI?

| Opción | Esfuerzo | Pros | Contras |
|--------|----------|------|---------|
| A) SP7 esta semana | 2-3 días | Pirámide completa antes Marco Ovalle | Bloquea refactor Ejecución (deadline VIE) |
| B) SP8 W1 (LUN 18-may) | 2-3 días | Inicio limpio post cierre SP7 | 1 semana más sin E2E auto |
| C) Solo Playwright ahora, vitest después | 1 día | Compromiso intermedio | Frontend unit sigue 0% |

**Recomendación:** **B + spike manual** — Playwright manual antes Marco Ovalle MIE, automatización a SP8 W1.

### Decisión 3 — ¿Carlos entrega 0G1 casos de uso cuándo?

| Opción | Plazo | Pros | Contras |
|--------|-------|------|---------|
| A) Esta semana SP7 | VIE 15-may | Input listo para SP8 W1 | Carlos tiene BD cleanup también |
| B) SP8 W1 (LUN-MAR 18-19) | MAR 19-may | Carlos enfocado | Retrasa E2E start 1 sem |
| C) SP8 entero (LUN 18 a VIE 29) | VIE 29-may | Calidad alta | Bloquea 2 semanas de testing |

**Recomendación:** **B** — Carlos entrega 0G1 LUN-MAR 18-19, David empieza E2E MIE 20.

### Decisión 4 — ¿Quién hace UAT formal con cliente?

| Opción | Coord | Ejecuta | Acompaña | Sign-off |
|--------|-------|---------|----------|---------|
| A) Magdalena coord + Jorge ejecuta + David acompaña | Magda | Jorge | David | Magda |
| B) David coord directo con Jorge | David | Jorge | — | Magda async |
| C) Carlos lidera UAT con casos uso suyos | Carlos | Jorge | David | Magda |

**Recomendación:** **A** — Magdalena coordina, Jorge ejecuta operacionalmente, David acompaña técnicamente, Magdalena firma sign-off.

---

## 11. Cronograma testing próximas 3 semanas

| Fecha | Hito | Owner |
|-------|------|-------|
| MAR 12-may tarde | Reunión esta · 4 decisiones tomadas | Todos |
| MIE 13-may AM | Smoke test manual full antes showcase Marco Ovalle | David |
| MIE 13-may PM | Showcase Marco Ovalle / Gold Fields | Jorge presenta · David accompañ |
| JUE 14-may | Refactor módulo Ejecución | David |
| JUE 14-may | Fix de 2 tests críticos (smoke closure + WR validate) | David |
| VIE 15-may | Fix 3 tests críticos restantes (security_*) | David |
| VIE 15-may | **Cierre Sprint 7 VSC + UAT formal piloto** | Magdalena + Jorge |
| LUN 18-may | SP8 W1 inicio · Carlos entrega 0G1 (día 1/2) | Carlos |
| MAR 19-may | Carlos entrega 0G1 final · David instala vitest | Carlos + David |
| MIE 20-may | David configura Playwright CI nightly (3 escenarios) | David |
| JUE 21-may | David completa 5 escenarios Playwright | David |
| VIE 22-may | UAT formal Sprint 7 retroactivo + planning SP8 | Magdalena |
| LUN 25-may | David: pytest-cov + 5 frontend tests vitest | David |
| MIE 27-may | 10/15 escenarios Playwright en CI nightly | David |
| VIE 29-may | UAT Sprint 8 W1 + check cobertura objetivo | Magdalena |
| LUN 1-jun | Meta: 15/15 E2E Playwright + 40% frontend unit + pass rate 100% backend | David |

---

## 12. Costos y esfuerzo

| Iniciativa | Esfuerzo dev | Costo oportunidad |
|-----------|--------------|-------------------|
| Fix tests rojos críticos (5) | 4h | Una tarde MAR-MIE |
| Setup vitest + 5 componentes | 2-3 días | Primera semana SP8 |
| Setup Playwright CI + 5 E2E | 2-3 días | Primera semana SP8 |
| pytest-cov + Codecov badge | 4h | Una tarde SP8 W1 |
| UAT scripts × 30 features | 0.5h cada × 30 = 15h | Reparti SP7-SP8 |
| 0G1 casos de uso (Carlos) | 2 días Carlos | LUN-MAR 18-19 |
| **Total Sprint 7 (testing)** | **1 día David** | **No bloqueante** |
| **Total Sprint 8 W1 (testing)** | **5 días David + 2 días Carlos** | **W1 dedicada** |

---

## 13. Anexos técnicos

### 13.1 Ejemplo test Playwright E2E (flujo SF-656)

```javascript
test('SF-656 audit capacity detects overcap and shift mismatch', async ({ page }) => {
  await page.goto('https://mageam.com/scheduling');
  await page.click('button:has-text("Auditoría")');
  await page.fill('input[type="date"]', '2026-05-04');
  await page.fill('input[type="number"]', '1');
  await page.click('button:has-text("Recalcular")');

  await expect(page.locator('text=/técnico\\(s\\) con sobrecapacidad/')).toBeVisible();
  await expect(page.locator('table').first().locator('tbody tr')).toHaveCount({ greaterThan: 0 });
});
```

### 13.2 Ejemplo pytest backend integration (SF-661)

```python
def test_ai_analyze_returns_function_1(self, seeded_client, db_session):
    wo = _create_wo(seeded_client, db_session, estimated_hours=8, operations=[...])
    r = seeded_client.post(f"/api/v1/managed-work-orders/{wo.wo_id}/ai-analyze")
    assert r.status_code == 200
    body = r.json()
    assert body["version"] == "0.1"
    assert body["summary"]["metrics"]["n_operations"] == 2
    assert body["predictions"] is None  # stub explícito
```

### 13.3 Estructura propuesta `tests/e2e/`

```
tests/e2e/
  playwright.config.ts
  fixtures/
    auth.ts          (login helpers por rol)
    data.ts          (seed determinístico)
  flows/
    01-login.spec.ts
    02-wr-create.spec.ts
    03-wr-to-ot.spec.ts
    04-scheduling-drag.spec.ts
    05-reschedule.spec.ts
    06-close-pin.spec.ts
    07-audit-scope.spec.ts
    08-orphans.spec.ts
    09-audit-capacity.spec.ts
    10-ai-analyze.spec.ts
    11-preparativos.spec.ts
    12-rag-search.spec.ts
    13-failure-capture.spec.ts
    14-export-excel.spec.ts
    15-anonimization.spec.ts
```

---

**Anexos relacionados (en el repo):**
- Gap Analysis 174 items vs Excel Jorge: [1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx](../1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx)
- Audit log policy SF-660: [docs/AUDIT_LOG_POLICY.pdf](../docs/AUDIT_LOG_POLICY.pdf)
- OT-Calendar sync policy SF-659: [docs/OT_CALENDAR_SYNC.pdf](../docs/OT_CALENDAR_SYNC.pdf)
- Tandas SP7/SP8 roadmap: [docs/TANDAS_SP7_SP8_2026-05-11.pdf](../docs/TANDAS_SP7_SP8_2026-05-11.pdf)
- Bug report template SF-658: [docs/BUG_REPORT_TEMPLATE.pdf](../docs/BUG_REPORT_TEMPLATE.pdf)
- CI workflow actual: `.github/workflows/ci.yml`
