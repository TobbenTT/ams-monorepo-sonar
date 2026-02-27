---
name: calculate-planning-kpis
description: >
  Calculate the 11 GFSN Planning KPIs with targets, status determination, and overall health
  classification for mining maintenance operations. Produces: 11 KPI values with status,
  overall health rating (HEALTHY/AT_RISK/CRITICAL). Use this skill when a user needs to
  evaluate planning performance metrics or monitor maintenance KPI compliance.
  Triggers EN: planning KPI, schedule compliance, backlog age, KPI calculation, planning
  metrics, wo completion rate, reactive work ratio, PM compliance, backlog weeks, planning
  health, maintenance KPIs, planning efficiency.
  Triggers ES: KPI planificacion, cumplimiento de programa, edad de backlog, metricas de
  planificacion, indicadores de mantenimiento.
---

# Calculate Planning KPIs

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for calculating and interpreting the 11 GFSN Planning KPIs per REF-14 Section 8. You must apply correct formulas, respect target thresholds (including range-based and lower-is-better KPIs), handle division-by-zero guards, and classify overall planning health. You always round to 1 decimal place and treat None values as BELOW_TARGET.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `period_start` | date | Yes | Start of reporting period |
| `period_end` | date | Yes | End of reporting period |
| `wo_planned` | int | Yes | Work orders planned |
| `wo_completed` | int | Yes | Work orders completed |
| `manhours_planned` | float | Yes | Total planned man-hours |
| `manhours_actual` | float | Yes | Total actual man-hours |
| `pm_planned` | int | Yes | PM work orders planned |
| `pm_executed` | int | Yes | PM work orders executed |
| `backlog_hours` | float | Yes | Total outstanding backlog hours |
| `weekly_capacity_hours` | float | Yes | Weekly labour capacity |
| `corrective_count` | int | Yes | Number of corrective (reactive) work orders |
| `total_wo` | int | Yes | Total work orders in the period |
| `schedule_compliance_planned` | int | Yes | Scheduled work orders |
| `schedule_compliance_executed` | int | Yes | Scheduled WOs completed on time |
| `release_horizon_days` | int | Yes | Days between WO release and execution |
| `pending_notices` | int | Yes | Pending notifications/notices |
| `total_notices` | int | Yes | Total notifications/notices |
| `scheduled_capacity_hours` | float | Yes | Hours scheduled against capacity |
| `total_capacity_hours` | float | Yes | Total available capacity hours |
| `proactive_wo` | int | Yes | Proactive work orders (PM + PdM + improvement) |
| `planned_wo` | int | Yes | Planned work orders (with full planning) |

## 3. Flujo de Ejecucion

### Step 1: KPI 1 -- WO Completion Rate
- Formula: `(wo_completed / wo_planned) * 100`
- Target: >= 90.0%. Guard: wo_planned == 0 -> None
- Status: ON_TARGET if >= 90.0, else BELOW_TARGET

### Step 2: KPI 2 -- Man-hour Compliance
- Formula: `(manhours_actual / manhours_planned) * 100`
- Target: 85.0% -- 115.0% (range). Guard: manhours_planned == 0 -> None
- Status: ON_TARGET if 85.0 <= value <= 115.0; BELOW_TARGET if < 85.0; ABOVE_TARGET if > 115.0

### Step 3: KPI 3 -- PM Plan Compliance
- Formula: Delegated to `KPIEngine.calculate_pm_compliance(pm_planned, pm_executed)`
- Target: >= 95.0%. Status: ON_TARGET if >= 95.0, else BELOW_TARGET

### Step 4: KPI 4 -- Backlog Weeks
- Formula: `backlog_hours / weekly_capacity_hours`
- Target: <= 4.0 weeks. Unit: weeks. Guard: weekly_capacity_hours == 0 -> None
- Status: ON_TARGET if <= 4.0, else ABOVE_TARGET

### Step 5: KPI 5 -- Reactive Work %
- Formula: Delegated to `KPIEngine.calculate_reactive_ratio(corrective_count, total_wo)`
- Target: <= 20.0%. Status: ON_TARGET if <= 20.0, else ABOVE_TARGET

### Step 6: KPI 6 -- Schedule Adherence
- Formula: Delegated to `KPIEngine.calculate_schedule_compliance(planned, executed)`
- Target: >= 85.0%. Status: ON_TARGET if >= 85.0, else BELOW_TARGET

### Step 7: KPI 7 -- Release Horizon
- Formula: Direct value from `release_horizon_days` (float)
- Target: <= 7.0 days. Status: ON_TARGET if <= 7.0, else ABOVE_TARGET

### Step 8: KPI 8 -- Pending Notices %
- Formula: `(pending_notices / total_notices) * 100`
- Target: <= 15.0%. Guard: total_notices == 0 -> None
- Status: ON_TARGET if <= 15.0, else ABOVE_TARGET

### Step 9: KPI 9 -- Scheduled Capacity
- Formula: `(scheduled_capacity_hours / total_capacity_hours) * 100`
- Target: 80.0% -- 95.0% (range). Guard: total_capacity_hours == 0 -> None
- Status: ON_TARGET if 80.0 <= value <= 95.0; BELOW_TARGET if < 80.0; ABOVE_TARGET if > 95.0

### Step 10: KPI 10 -- Proactive Work %
- Formula: `(proactive_wo / total_wo) * 100`
- Target: >= 70.0%. Guard: total_wo == 0 -> None
- Status: ON_TARGET if >= 70.0, else BELOW_TARGET

### Step 11: KPI 11 -- Planning Efficiency
- Formula: `(planned_wo / total_wo) * 100`
- Target: >= 85.0%. Guard: total_wo == 0 -> None
- Status: ON_TARGET if >= 85.0, else BELOW_TARGET

### Step 12: Determine Overall Health
1. Count KPIs with status == ON_TARGET (`on_target`).
2. `below_target = 11 - on_target`
3. Classification:
   - on_target >= 9 -> HEALTHY
   - on_target >= 6 -> AT_RISK
   - on_target < 6 -> CRITICAL

## 4. Logica de Decision

### Status Determination -- Higher is Better
```
IF value is None     -> BELOW_TARGET
IF value >= target   -> ON_TARGET
ELSE                 -> BELOW_TARGET
```

### Status Determination -- Lower is Better
```
IF value is None     -> BELOW_TARGET
IF value <= target   -> ON_TARGET
ELSE                 -> ABOVE_TARGET
```

### Status Determination -- Range Check
```
IF value is None         -> BELOW_TARGET
IF low <= value <= high  -> ON_TARGET
IF value < low           -> BELOW_TARGET
IF value > high          -> ABOVE_TARGET
```

### Overall Health
```
on_target >= 9  -->  HEALTHY
on_target >= 6  -->  AT_RISK
on_target <  6  -->  CRITICAL
```

## 5. Validacion

1. **All 11 KPIs must be present**: Output must always contain exactly 11 KPI entries.
2. **Division by zero guards**: Any formula with a denominator must check for zero and produce None.
3. **Rounding**: All values rounded to 1 decimal place via `round(value, 1)`.
4. **None values are BELOW_TARGET**: In health classification, None KPIs count against on-target.
5. **Delegated KPIs**: KPIs 3, 5, and 6 delegate to KPIEngine methods.
6. **Range KPIs**: KPIs 2 and 9 use range-based status checks.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For Phase 4A: 11 Planning KPI definitions and targets |
| SAP Templates | `../../knowledge-base/integration/ref-03` | For SAP work order data extraction |
| KPI Formulas Reference | `references/kpi-formulas.md` | For detailed formula table and worked example |

## Common Pitfalls

1. **Confusing "lower is better" KPIs**: KPIs 4, 5, 7, and 8 use lower-is-better logic.
2. **Forgetting range-based KPIs**: KPIs 2 and 9 have valid ranges. A value of 120% on KPI 2 is ABOVE_TARGET (bad).
3. **None values counted as BELOW_TARGET**: KPIs with None worsen the overall health rating.
4. **Overall health thresholds are inclusive**: >= 9 means 9, 10, or 11 on target.
5. **Delegated KPIs use external engine**: KPIs 3, 5, and 6 call KPIEngine static methods.
6. **ABOVE_TARGET is NOT ON_TARGET**: For range and lower-is-better KPIs, exceeding upper bound counts against health.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
