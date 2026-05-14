# Reunión Técnica MagEAM — David ↔ Carlos

**Cuándo:** Martes 12-may-2026 · 9:15–10:15 am (1 h)
**Org:** Carlos Iturra
**Asistentes:** Carlos Iturra · David Cabezas
**Versión:** 1.0 · 2026-05-12

---

## 1. Estado AMS-Production (último 5 días)

**HEAD actual:** `b98582f`  ·  **Producción:** mageam.com (Hetzner VPS)
**Stack:** React 19 + Vite · FastAPI + SQLAlchemy 2.0 · SQLite · Docker Compose · nginx

### 1.1 Tickets SP7 cerrados (14 listos para transicionar en Jira)

| Ticket | Descripción | Commit |
|--------|-------------|--------|
| SF-666 | Buscador SP por TL | `7a64b8d` |
| SF-667 | Rename "Priorizar con IA"→"por riesgo" | `88366b6` |
| SF-669 | Buscador OTs Scheduling multi-campo | `8ad71d9` |
| SF-671 | Eliminar Cuadrilla Contratista | `88366b6` |
| SF-673 | Eliminar campo Sugerencia auto IA | `88366b6` |
| SF-674 | Comments fecha + audio (Web Speech API) | `ffa7a80` |
| SF-675 | Reestructurar Equipos Apoyo (5 cambios) | `c9e6009` |
| SF-676 | Material nuevo no muestra reserva | `ec2fa31` |
| SF-677 | Puestos de Trabajo IA inconsistencia | `ffa7a80` |
| SF-678 | Código WR formato AV-NNNNN | `88366b6` |
| SF-679 | Reubicar IA Assistant antes WO Title | `88366b6` |
| SF-680 | Reubicar "What Happened" antes Title | `88366b6` |
| SF-681 | Prioridad manual no auto | `ffa7a80` |
| SF-682 | Cantidad reemplaza valor | `88366b6` |

### 1.2 Features nuevas operativas en producción

| ID | Feature | Estado |
|----|---------|--------|
| SF-656 | Auditoría visual capacidad + violaciones día/noche | ✅ Tab dedicada en Scheduling |
| SF-657 | Endpoint `/orphans` (6 tipos huérfanas) | ✅ 6 detectadas de 142 OTs |
| SF-659 | Política OT-Calendar sync documentada | ✅ docs/OT_CALENDAR_SYNC.pdf |
| SF-660 | Audit log policy + tests inmutabilidad + script purga 5y | ✅ Endpoint scoped por rol |
| SF-661 v0.2 | IA Analyze OT — 4/7 funciones | ✅ Detecta LOTO/ATEX/altura automático |
| SF-662 | Preparativos OT estilo Rappi (modelo + API + 13 tests) | ✅ Backend, UI pendiente |
| Scheduling v2 | Vista Horarios eje vertical + drag-drop + skill matching | ✅ Operativo |
| 0F | RAG re-indexed con 56 OTs cerradas | ✅ LanceDB ot_history |
| 0G2 | Supervisor role + Agentic admin-only | ✅ PERMISSIONS + route guards |
| 0D1 | Anonimización completa Goldfields (plant alias local) | ✅ Cero leaks en DOM scan |

### 1.3 0A2 Gap Analysis entregable Magdalena

- **174 items** del Excel Jorge mapeados vs código actual
- **Cobertura 95.1%** (158 HECHO + 15 PARCIAL + 1 PENDIENTE + 0 verif)
- Per proceso: Análisis Desempeño 100% · KPIs 97% · Identificación 94% · Ejecución 94% · Programación 93% · Planificación 92%
- Entregables: `1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx` + email PDF

---

## 2. Lo que Carlos tiene que entregar (0G1 — bloqueador SP8)

### 2.1 Spec acordado en jornada VSC 2026-05-08

> "Diagrama de casos de uso por rol (operador/mantenedor/supervisor/planificador/admin): camino feliz + caminos tristes + errores. Define accesos y funcionalidades por rol"

**Plazo propuesto:** LUN-MAR 18-19 may (primera semana SP8).

### 2.2 Mi propuesta de scope (para alinear hoy con Carlos)

Para que sea **input directo a los 15 E2E Playwright** + **UAT scripts** + **tests de role escalation**, Carlos debería entregar:

| Entregable | Formato | Detalle |
|------------|---------|---------|
| Diagrama UML casos de uso × rol | draw.io o Mermaid | 7 roles × ~5 use cases = 35 escenarios |
| Matriz CRUD × entidad × rol | Excel | Permisos read/create/update/delete por módulo |
| Escenarios narrativos | Markdown 1 página c/u | 1 feliz + 2 tristes + errores comunes por rol |
| Validación con Jorge | sign-off | Que reflejen operación real Goldfields |

### 2.3 Roles a documentar

| Rol | Camino feliz típico | Caminos tristes | Errores comunes |
|-----|---------------------|------------------|-----------------|
| **Operador / Mantenedor** | Crear WR con foto en patio | WR rechazada por duplicado | Sin conexión, foto se pierde |
| **Supervisor** | Aprobar WR + asignar planner | Falta info → rechazar con razón | Aprobar duplicado por accidente |
| **Planificador** | WR → OT + reservar materiales + asignar técnicos | Material faltante → bloquear | Asignar técnico vacaciones |
| **Programador** | Drag-drop OT en Scheduling Horarios | Sobrecapacidad → recibir warning | Reservar semana sin completar carpeta |
| **Técnico / Ejecutor** | Recibir OT en patio + ejecutar + firma cierre | OT incompleta → reportar back | Olvidar firma PIN |
| **Ingeniero Confiabilidad** | RCA post-cierre + lecciones | Datos insuficientes → re-solicitar | FMEA sin link a OT |
| **Admin / Manager** | Ver dashboards + audit log + KPIs | Permission escalation intento | Audit log con datos corruptos |

### 2.4 Datos que ya tenemos para Carlos

- **PERMISSIONS matrix actual**: `frontend/src/hooks/usePermissions.js` (24 módulos × 6 roles)
- **State transitions OT**: `_STATUS_ORDER` en `api/services/managed_wo_service.py:857`
- **Audit log policy**: `docs/AUDIT_LOG_POLICY.pdf` cubre 14 entidades × acciones
- **OT-Calendar sync rules**: `docs/OT_CALENDAR_SYNC.pdf` 5 reglas de conflictos

---

## 3. Casos de uso ya implementados (referencia para Carlos)

### 3.1 Operador / Mantenedor

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| OP-01 | Crear WR con foto + audio + IA suggest | `POST /capture/` + `POST /capture/audio` | `/failure-capture` |
| OP-02 | Ver WRs propios | `GET /work-requests/?created_by=me` | `/work-orders` tab WRs |
| OP-03 | Comentar en OT | `POST /managed-work-orders/{id}/notes` | OT modal tab Comentarios |
| OP-04 | Reportar incidente durante ejecución | WR adicional | tab Comentarios + crear nuevo WR |

### 3.2 Supervisor

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| SU-01 | Aprobar/rechazar WR con razón | `PUT /work-requests/{id}/approve` | WR detail modal |
| SU-02 | Ver tablero del supervisor (su planta) | `GET /managed-work-orders/?plant_id=...` | `/supervisor-board` |
| SU-03 | Asignar técnicos a OT | `PUT /managed-work-orders/{id}` con `assigned_workers` | Modal OT tab Operations |
| SU-04 | Firmar cierre OT con PIN | `PUT /managed-work-orders/{id}/close` | Modal OT botón Cerrar OT |
| SU-05 | Ver audit log scope su planta | `GET /admin/audit-log` (role-scoped SF-660) | `/audit-log` |

### 3.3 Planificador

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| PL-01 | Aprobar WR + crear OT | `POST /managed-work-orders/from-wr` | WR detail modal |
| PL-02 | Editar operaciones OT | `PUT /managed-work-orders/{id}` | Modal OT tab Operations |
| PL-03 | Reservar materiales | `POST /materials/reserve` | Modal OT tab Materials |
| PL-04 | Análisis IA OT | `POST /managed-work-orders/{id}/ai-analyze` | Botón 🤖 Analizar IA |
| PL-05 | Ver orphans para resolver | `GET /managed-work-orders/orphans` | `/work-orders` filter |
| PL-06 | Liberar OT a programación | `PUT /managed-work-orders/{id}/release` | Botón Release modal |

### 3.4 Programador

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| PR-01 | Vista Horarios drag-drop OT | `PUT /managed-work-orders/{id}` con planned_start | `/scheduling` vista Horarios |
| PR-02 | Matching automático técnicos por skill | (cliente — `matchTechniciansForWO`) | Drag-drop auto-asigna |
| PR-03 | Reservar semana con gate sobrecapacidad | `POST /scheduling/reserve-week` | Botón Reservar Semana |
| PR-04 | Auditar capacidad + turnos | `GET /scheduling/audit-capacity` | Tab Auditoría |
| PR-05 | Reschedule con razón obligatoria | `PUT /managed-work-orders/{id}/reschedule` | Modal reschedule |
| PR-06 | HH Balance live por work center | `GET /scheduling/hh-balance-live` | Tab HH Balance |

### 3.5 Técnico / Ejecutor

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| TE-01 | Ver OTs asignadas hoy | `GET /managed-work-orders/?assigned_to=me&status=PROGRAMADO` | Inbox tab |
| TE-02 | Iniciar OT (start execution) | `PUT /managed-work-orders/{id}/start` | Botón Start Execution |
| TE-03 | Notificar HH parcial | `PUT /managed-work-orders/{id}/progress` | Tab Notif. HH |
| TE-04 | Completar operación | `PUT /managed-work-orders/{id}` con `actual_hours` op | Tab Operations |
| TE-05 | Cerrar OT con firma PIN | `PUT /managed-work-orders/{id}/close` | Modal cierre |

### 3.6 Ingeniero Confiabilidad

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| IC-01 | FMECA worksheet equipment | `POST /fmea/fmeca/worksheets` | `/fmeca` |
| IC-02 | RCA post-cierre OT | `POST /rca/draft-from-wo` | `/rca` |
| IC-03 | Ver Pareto fallas | `GET /reliability/pareto` | `/reliability` |
| IC-04 | Calcular criticidad | `POST /criticality/{id}` | `/criticality` |
| IC-05 | Improvement actions / CAPA | `POST /improvement-actions/` | `/improvement-actions` |

### 3.7 Admin / Manager

| # | Use case | Endpoint | Vista frontend |
|---|----------|----------|----------------|
| AD-01 | Dashboard ejecutivo | `GET /dashboard/executive` | `/dashboard` |
| AD-02 | Audit log completo | `GET /admin/audit-log` (sin scope) | `/audit-log` |
| AD-03 | Agentic Capabilities (admin-only) | `GET /agentic/*` | `/agentic-capabilities` |
| AD-04 | Configurar plantas + roles | `PUT /admin/settings` | `/settings` |
| AD-05 | Data Import | `POST /data-import/upload` | `/data-import` |

---

## 4. Decisiones técnicas pendientes (necesitamos alinear hoy)

### 4.1 Casos de uso 0G1 — Carlos
- ¿Plazo final? Propuesta: LUN-MAR 18-19 may
- ¿Formato draw.io o Mermaid? Yo prefiero Mermaid (text en repo, versionable)
- ¿Carlos hace los 7 roles o nos repartimos?

### 4.2 BD: depurar in-place vs reset (SF-664)
- A) Limpiar BD actual (3 días Carlos)
- B) Reset y recargar planillas cliente (5 días)
- Decisión final con Magdalena + Jorge Alquinta

### 4.3 ¿Carlos lidera bancos de datos showcase (0G3)?
- Multi-cliente: planta concentradora · planta óxido · mina abierta
- Para presentar a clientes diversos (no solo el anonimizado Goldfields)
- ¿Esfuerzo Carlos? ¿Yo aporto algún script base?

### 4.4 Showcase Marco Ovalle MIE 13 PM
- Programación tiene que estar cerrada (Jorge presenta)
- ¿Carlos arma la narrativa con sus casos de uso o sin ellos?
- Demo de Scheduling v2 + IA Analyze v0.2 + Auditoría capacidad

---

## 5. Reunión Magdalena (paralela)

Magdalena en daily preguntó:
- **Avances reliability** → ✅ ver §1.2
- **Avances scheduling** → ✅ ver §1.2 + Scheduling v2
- **Avances cierre/notificación** → ✅ operativo, refactor pendiente VIE 15
- **OT en CREADO/LIBERADO en supervisor board** → filtrado ON propósito (José/Jorge 2026-04-30). ¿Carlos sabe si revisamos esta decisión?
- **Reagrupar bloques izquierda Scheduling** → Jorge prepara spec antes
- **Confirmación feedback work management** → ✅ 14 tickets SP7 listos (ver §1.1)
- **Drive logos MagORAI + MagEAM** → necesito URL para aplicar al frontend

---

## 6. Próximos hitos cronograma

| Fecha | Hito | Owner |
|-------|------|-------|
| **MAR 12** (hoy) | Reunión técnica David ↔ Carlos · Reunión testing strategy Magda (15:00) | Todos |
| MIE 13 PM | **Showcase Marco Ovalle / Gold Fields** — Programación cerrada | Jorge presenta |
| JUE 14 | Refactor módulo Ejecución | David |
| **VIE 15** | **Cierre Sprint 7 VSC + UAT formal piloto** | Magdalena + Jorge |
| LUN 18 | SP8 W1 inicio · Carlos entrega 0G1 día 1/2 | Carlos |
| MAR 19 | Carlos entrega 0G1 final · David instala vitest | Carlos + David |
| MIE 20 | David configura Playwright CI nightly (3 escenarios) | David |
| VIE 22 | UAT formal Sprint 7 retroactivo + planning SP8 | Magdalena |

---

## 7. Documentos de referencia (para que Carlos los consulte)

| Doc | Path | Uso |
|-----|------|-----|
| Gap Analysis 95.1% | `1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx` | Mapping 174 items vs código |
| Testing strategy | `1-output/M3/testing-strategy-magam-2026-05-12.pdf` | Pirámide + decisiones SP7-SP8 |
| Audit log policy | `docs/AUDIT_LOG_POLICY.pdf` | 14 entidades cubiertas · acceso por rol |
| OT-Calendar sync | `docs/OT_CALENDAR_SYNC.pdf` | 5 reglas de conflictos |
| Tandas SP7/SP8 | `docs/TANDAS_SP7_SP8_2026-05-11.pdf` | Roadmap completo |
| Bug template | `docs/BUG_REPORT_TEMPLATE.pdf` | Para casos tristes Carlos |
| Remaining tickets | `docs/REMAINING_TICKETS_2026-05-11.pdf` | Status SF-661..665 |
| AMS skills system | `agents/_shared/paths.py` | Estructura agente IA |
| PERMISSIONS matrix | `frontend/src/hooks/usePermissions.js:27-73` | Permisos por rol |

---

**Notas de la reunión** (a llenar durante):

```
Decisiones tomadas:
1.
2.
3.
4.

Acciones para Carlos (con plazo):
1.
2.
3.

Acciones para David (con plazo):
1.
2.
3.

Bloqueantes identificados:
1.
2.
```
