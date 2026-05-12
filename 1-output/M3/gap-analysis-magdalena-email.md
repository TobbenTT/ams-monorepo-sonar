# Borrador de email a Magdalena Ortega

**De:** David Cabezas
**Para:** Magdalena Ortega
**CC:** Jorge Alquinta
**Asunto:** Gap Analysis AMS vs requerimientos Jorge — entregable 0A2

---

Hola Magdalena,

Tal como acordamos en la jornada VSC del 8-may, te adjunto el gap analysis del software AMS-Production contra el Excel funcional que Jorge Alquinta nos entregó ("Bullets Work Management, KPI, Otros").

**Archivo:** `gap-analysis-magdalena-2026-05-12.xlsx` (8 sheets).

## Resumen ejecutivo

De los **174 items** mapeados:

| Status | # | % | Significado |
|--------|---|---|-------------|
| ✅ HECHO | 158 | 90.8% | Implementado y verificado en producción (mageam.com) |
| 🟡 PARCIAL | 15 | 8.6% | Framework existe, falta integración data plant o UI dedicada — ver ETA |
| ❌ PENDIENTE | 1 | 0.6% | `MAINTENANCE TRAINING HOURS` (módulo HR, fuera de scope AMS) |

**Cobertura total: 95.1%** (ponderado: HECHO=1, PARCIAL=0.5)

## Cobertura por proceso

| Proceso | % cubierto | Notas |
|---------|------------|-------|
| Identificación (WR creation) | **94%** | Faltan catálogos SAP-style síntoma/causa (Carlos lidera, necesita data cliente) |
| Planificación (work packages) | **92%** | JRA + LOTO funcionales, pendiente UI dedicada en modal OT |
| Programación (scheduling) | **93%** | Scheduling v2 vista Horarios entregada esta semana — matching auto por skill |
| Ejecución y Cierre | **94%** | Decision points cubiertos por workflow + reschedule endpoint |
| Análisis de Desempeño | **100%** ✅ | Cobertura completa |
| KPIs | **97%** | Falta integración data plant real (SCADA, HSE incidents — Q3-2026) |

## Cosas críticas entregadas esta semana

1. **Scheduling v2 vista Horarios** (commit `af700db`) — implementa el spec de Jorge: eje vertical = horas, drag-drop OT, matching automático por skill de la operación.
2. **SF-656 auditoría visual capacidad + turnos** (commit `a80493d`) — endpoint determinista + tab "Auditoría" con banner global y tablas con severidades critical/high.
3. **Audit log policy completa** (SF-660) — tests de inmutabilidad + script de purga 5y + endpoint scoped por rol.
4. **Anonimización Goldfields completa** — `plant_id` ya no leakea ni por hover/aria-label en ningún componente.
5. **SF-661 análisis IA OT** — función 1 de 7 entregada (resumen ejecutivo + métricas + bloqueadores). Funciones 2-7 requieren histórico real (0B2).
6. **SF-662 Preparativos OT estilo Rappi** — modelo + state machine + 4 endpoints + 13 tests pytest. UI completa pendiente spec definitivo Jorge.
7. **Tests pytest** — 15 casos nuevos cubriendo orphans, audit-capacity, AI analyze, preparativos state machine.

## Los 15 PARCIAL restantes

Son items donde el framework está en producción pero la integración con datos cliente o la UI dedicada queda pendiente:

- **KPIs producción / OEE / SCADA** (5 items) — proxies en dashboard, falta integración real planta (Q3-2026, requiere credenciales).
- **Catálogos SAP síntoma/causa/parte objeto** (3 items) — Carlos lidera, requiere data del cliente.
- **Workflows formales** (JRA, LOTO, aprobación budget adicional) (4 items) — el flow existe vía endpoints, falta UI dedicada en modal (SP8).
- **Service level abastecimiento, ratio personal directo/indirecto, CeCo** (3 items) — Tanda 0E SP8.

## Cosas que necesitamos hablar

- **0B2 data real Goldfields** — sin histórico real, SF-661 funciones 2-7 (predicción HH, riesgos, skill mix, RCA hints) quedan stub.
- **SF-664 decisión BD** — depurar in-place vs reset y carga limpia. Requiere call contigo + Jorge.
- **0E centros de costo + clases de gasto** — propuesto SP8. ¿Subimos prioridad?
- **Catálogos síntoma/causa SAP** — Carlos lidera, requiere data cliente.

## Próximos pasos cronograma

| Día | Compromiso |
|-----|------------|
| MIE 13 PM | Showcase Marco Ovalle / Gold Fields — Programación completa ✅ entregable listo |
| JUE 14 | Refactor módulo Ejecución |
| **VIE 15** | **Cerrar Ejecución (deadline duro) + cierre Sprint 7 VSC** |
| LUN 18+ | Sprint 8 — SF-661 funciones 2-7, SF-662 UI, Tanda 0E centros costo, refactor Análisis Desempeño |

Quedo atento a tu feedback. Si querés revisamos juntos los 15 PARCIAL para validar las ETAs y prioridades.

Saludos,
David

---

**Anexo técnico:**
- Repo: `github.com/ValueStrategyConsulting/AMS-Production` · HEAD: 7d61423+
- Deploy: mageam.com (Hetzner VPS · Docker compose · nginx + FastAPI + React)
- 4 agentes IA operando (Orchestrator/Reliability/Planning/Spare-parts) · 36 skills · 59 tablas BD · 562 endpoints API
- Test suite: 15 nuevos tests pytest pasando (audit log immutability, OT calendar sync, preparativos state machine)
