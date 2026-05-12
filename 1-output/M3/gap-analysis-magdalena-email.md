# Borrador de email a Magdalena Ortega

**De:** David Cabezas
**Para:** Magdalena Ortega
**CC:** Jorge Alquinta
**Asunto:** Gap Analysis AMS vs requerimientos Jorge — entregable 0A2

---

Hola Magdalena,

Tal como acordamos en la jornada VSC del 8-may, te adjunto el gap analysis del software AMS-Production contra el Excel funcional que Jorge Alquinta nos entregó ("Bullets Work Management, KPI, Otros").

**Archivo:** `gap-analysis-magdalena-2026-05-12.xlsx` (6 sheets).

## Resumen ejecutivo

De los **174 items** mapeados:

| Status | # | % | Significado |
|--------|---|---|-------------|
| ✅ HECHO | 98 | 56% | Implementado y verificado en producción (mageam.com) |
| 🟡 PARCIAL | 32 | 18% | Algo existe, falta completar — ver ETA en cada fila |
| 🟠 Pendiente verificar | 44 | 25% | Decision points abstractos o items que necesitan revisión 1:1 con Jorge |
| ❌ PENDIENTE | 0 | 0% | (los pendientes duros están como PARCIAL con ETA SP8) |

## Cobertura por proceso

| Proceso | % cubierto (Done + ½ Partial) | Comentario |
|---------|------|----|
| Identificación (WR creation) | **74%** | Faltan catálogos SAP-style síntoma/causa (Carlos lidera) |
| Planificación (work packages) | **82%** | Faltan workflows JRA + LOTO con UI dedicada |
| Programación (scheduling) | **93%** | Scheduling v2 entregada esta semana — eje vertical = horarios, matching auto |
| Ejecución y Cierre | **80%** | Refactor del módulo en curso, deadline 15-may |
| Análisis de Desempeño | **47%** | Granularidad por work_center pendiente SP8 |
| KPIs | **45%** | Falta integración data plant real (SCADA, ERP — requiere credenciales cliente) |

## Cosas críticas entregadas esta semana

1. **Scheduling v2 vista Horarios** (commit `af700db`) — implementa el spec de Jorge: eje vertical = horas, drag-drop OT, matching automático por skill de la operación.
2. **SF-656 auditoría visual capacidad + turnos** (commit `a80493d`) — endpoint determinista + tab "Auditoría" con banner global y tablas con severidades critical/high.
3. **Audit log policy completa** (SF-660) — tests de inmutabilidad + script de purga 5y + endpoint scoped por rol.
4. **Anonimización Goldfields completa** — `plant_id` ya no leakea ni por hover/aria-label en ningún componente.
5. **Tests pytest** — 15 casos nuevos cubriendo orphans, audit-capacity, AI analyze, preparativos state machine.

## Bloqueantes que necesitamos hablar

- **0B2 data real Goldfields** — sin histórico real, SF-661 funciones 2-7 (predicción HH, riesgos, skill mix, RCA hints) quedan stub.
- **SF-664 decisión BD** — depurar in-place vs reset y carga limpia. Requiere call contigo + Jorge.
- **0E centros de costo + clases de gasto** — propuesto SP8 (más arriba en backlog que Tanda 16 si Magda lo prioriza).
- **Catálogos síntoma/causa SAP** — Carlos lidera, requiere data cliente.

## Próximos pasos cronograma

| Día | Compromiso |
|-----|------------|
| MIE 13 PM | Showcase Marco Ovalle / Gold Fields — Programación completa |
| JUE 14 | Refactor módulo Ejecución |
| **VIE 15** | **Cerrar Ejecución (deadline duro) + cierre Sprint 7 VSC** |
| LUN 18+ | Sprint 8 — agentic IA (Tandas 12-17), preparativos UI, refactor Análisis Desempeño |

Quedo atento a tu feedback. Si querés revisamos juntos las filas con status "Pendiente verificar" — son 44 puntos donde la descripción de Jorge es abstracta o muy específica al flujo SAP de cliente y prefiero validarlo con vos antes de marcar definitivamente.

Saludos,
David

---

**Anexo técnico:**
- Repo: `github.com/ValueStrategyConsulting/AMS-Production` · HEAD: 37015cd
- Deploy: mageam.com (Hetzner VPS · Docker compose · nginx + FastAPI + React)
- 4 agentes IA operando (Orchestrator/Reliability/Planning/Spare-parts) · 36 skills · 59 tablas BD · 562 endpoints API
