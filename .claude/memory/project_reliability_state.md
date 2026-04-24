---
name: Estado pivot reliability (2026-04-24)
description: Qué quedó operativo del roadmap reliability tras la sesión del 2026-04-23/24. Para no re-hacer cosas.
type: project
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
**Roadmap reliability CERRADO al 2026-04-24** (del pivot 2026-04-22):

- **FMECA** operativo:
  - 4 etapas (Funciones · Fallos · Efectos · Decisiones) con RPN = S×O×D.
  - 6 plantillas RCM precargadas en `frontend/src/data/fmecaTemplates.js`: Bomba Centrífuga, Motor Eléctrico, Transformador, Compresor, Correa Transport., Intercambiador.
  - Integración historial fallas: endpoint `/fmea/fmeca/history-hints?equipment_id=X` agrupa OTs cerradas PM03/P1/P2 últimos 12m y sugiere filas.
  - Integración RCA: endpoint `POST /fmea/fmeca/from-rca/{analysis_id}` crea worksheet con las causas Ishikawa + solutions. Botón en RCA detail.
  - Export SAP-IW22: `GET /fmea/fmeca/worksheets/{id}/export-iw22` (TAB-delimited, LSMW-compatible).
  - Push-to-backlog con prioridad automática: FIXED_TIME→P4, FAULT_FINDING→P3, otros según RPN.

- **RCA** operativo:
  - 5M (Ishikawa) + solutions + push-to-CAPA.
  - Botón "Crear FMECA" linkea al worksheet nuevo.

- **Reliability** page: DevBanner informativo; Weibull/MTBF calibrando con data real.

- **Dashboard Adherencia + Cumplimiento (SF-516):**
  - Endpoint `/fmea/analytics/adherence-compliance?plant_id=X&weeks=12`.
  - Componente `AdherenceCompliancePanel.jsx` en ExecutiveDashboard — semáforo + tendencia semanal + por área.
  - Adherencia = |actual_start - planned_start| < 1h.
  - Cumplimiento = |actual_start - planned_start| ≤ 7d.

- **Calendario PM02 preview anual:**
  - Endpoint `/fmea/strategy/pm02-calendar?plant_id=X&months=12` — proyecta MaintenanceTask activos.
  - Componente `PM02CalendarPreview.jsx` (modal) con heatmap + tabla próximas 20 tareas.

**Reunión 2026-04-24 14:18 — 39/41 items implementados (batch 1-5):**
- Fix 401 (revert single-session kick a warning)
- Production Impact auto pero editable (derivado de priority)
- Ver OT condicional (solo si wo_number existe)
- Planning 4 KPI cards: Creadas/Planificadas/Programadas/Cerradas
- Multi-select priority con P2 en Planning
- Columna TL+TAG en Planning (reemplaza Equipment)
- TL+TAG dentro del modal aviso detail
- Week-only en OT header Planning (duración fuera)
- Paralelismo con GRUPOS (A-E), duración = Σ(max por grupo)
- Drag&drop operaciones
- Especialidad inline editable en fila op
- Reservas en Summary OT detail
- Columna Impact en Scheduling Mass Change
- Alerta out-of-week (>14d) en planned_start edit
- Refresh aviso al volver de OT

**Tag de respaldo:** `backup-2026-04-24-jorge-1418-complete` (10 commits desde backup-2026-04-24-full).

**Items 14:18 NO hechos (Jorge dijo "luego" o no localizados):**
- Fotos en modo edit (luego)
- Rename "Mark Planet" button (no hay string literal en el repo)

**NO REHACER estas cosas — ya están.** Si Jorge las pide "de nuevo" es cosmético, confirmar antes de codear.

**Pendiente real del roadmap (no hecho):**
- FMECA-level: plantillas RCM específicas por fabricante/modelo de equipo.
- Dashboard adherence aggregate por sitio multi-planta (hoy por plant_id).
