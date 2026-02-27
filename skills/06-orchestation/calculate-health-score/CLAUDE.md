---
name: calculate-health-score
description: >
  Use this skill when a user needs to compute an Asset Health Index (0-100) from five weighted
  dimensions: criticality (0.25), backlog pressure (0.20), strategy coverage (0.25), condition
  status (0.15), and execution compliance (0.15). Classifies as HEALTHY (>=75), AT_RISK (>=50),
  CRITICAL (>0), or UNKNOWN (0). Includes trend analysis (IMPROVING/STABLE/DEGRADING with
  +/-5 threshold) and per-dimension recommendations.
  Triggers EN: health score, asset health, health index, condition assessment, equipment health,
  health trend, composite score, asset health index.
  Triggers ES: puntaje de salud, salud del activo, indice de salud, evaluacion de condicion,
  salud del equipo, tendencia de salud, indice de salud del activo.
---

# Calculate Health Score

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

You are a Reliability Engineer specializing in asset health monitoring. Your task is to compute a composite Asset Health Index from five weighted dimensions, classify the health status, determine trends compared to previous scores, and generate actionable recommendations for dimensions scoring below 50. You must explain the methodology clearly and ensure all calculations are transparent.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `node_id` | string | Yes | Equipment or hierarchy node ID |
| `plant_id` | string | Yes | SAP plant code |
| `equipment_tag` | string | Yes | Technical equipment tag |
| `risk_class` | enum | Yes | I_LOW, II_MEDIUM, III_HIGH, IV_CRITICAL |
| `pending_backlog_hours` | float | Yes | Hours of deferred maintenance |
| `capacity_hours_per_week` | float | Yes | Weekly maintenance labor capacity (default: 40.0) |
| `total_failure_modes` | integer | Yes | Total known failure modes |
| `fm_with_strategy` | integer | Yes | FMs with approved strategy |
| `active_alerts` | integer | Yes | Active condition monitoring alerts |
| `critical_alerts` | integer | Yes | Critical-severity alerts |
| `planned_wo` | integer | Yes | Planned work orders in period |
| `executed_on_time` | integer | Yes | WOs executed on schedule |
| `weights` | dict | No | Custom dimension weights (must sum to ~1.0) |
| `previous_score` | float | No | Previous composite for trend |

## 3. Flujo de Ejecucion

### Step 1: Calculate Each Dimension Score

**Dim 1: Criticality (weight 0.25)**

| Risk Class | Score |
|------------|-------|
| I_LOW | 90 |
| II_MEDIUM | 70 |
| III_HIGH | 40 |
| IV_CRITICAL | 15 |

Unrecognized -> 50.

**Dim 2: Backlog Pressure (weight 0.20)**
```
weeks = pending_backlog_hours / capacity_hours_per_week
score = CLAMP(ROUND(100 x (1 - weeks/8), 1), 0, 100)
```
If capacity <= 0: score = 0. Max threshold = 8 weeks.

**Dim 3: Strategy Coverage (weight 0.25)**
```
score = ROUND(100 x fm_with_strategy / total_failure_modes, 1)
```
If total_failure_modes = 0: score = 0.

**Dim 4: Condition Status (weight 0.15)**
```
weighted_alerts = active_alerts + (critical_alerts x 2)
score = CLAMP(ROUND(100 x (1 - weighted_alerts/10), 1), 0, 100)
```
Critical alerts have 3x effective weight (1x in active + 2x multiplier).

**Dim 5: Execution Compliance (weight 0.15)**
```
score = ROUND(100 x executed_on_time / planned_wo, 1)
```
If planned_wo = 0: score = 100.0 (no plans = no non-compliance).

### Step 2: Calculate Composite Score
```
composite = SUM(dim_score x dim_weight) / SUM(weights)
composite = ROUND(composite, 1)
```

### Step 3: Determine Health Class

| Composite | Class |
|-----------|-------|
| >= 75 | HEALTHY |
| >= 50 | AT_RISK |
| > 0 | CRITICAL |
| 0 | UNKNOWN |

### Step 4: Determine Trend (if previous score available)
```
delta = current - previous
delta > 5  -> IMPROVING
delta < -5 -> DEGRADING
else       -> STABLE
```
Threshold is exactly 5.0: delta of +5.0 is STABLE, +5.01 is IMPROVING.

### Step 5: Generate Recommendations
For each dimension with score < 50:

| Dimension | Recommendation |
|-----------|---------------|
| CRITICALITY | "High criticality asset -- review risk mitigation strategies" |
| BACKLOG_PRESSURE | "Excessive backlog -- prioritize scheduling or increase capacity" |
| STRATEGY_COVERAGE | "Low strategy coverage -- complete FMEA and assign maintenance strategies" |
| CONDITION_STATUS | "Active condition alerts -- investigate and resolve monitoring alarms" |
| EXECUTION_COMPLIANCE | "Low execution compliance -- review scheduling and resource allocation" |

### Step 6: Compile and Report
Present: equipment ID, dimension score table, composite with class, trend, recommendations.

## 4. Logica de Decision

### Composite Score Calculation

```
FOR each dimension:
    score = dimension formula
    weighted = score x weight
composite = SUM(weighted) / SUM(weights)
ROUND to 1 decimal

IF composite >= 75: HEALTHY
ELIF >= 50: AT_RISK
ELIF > 0: CRITICAL
ELSE: UNKNOWN

IF previous_score:
    delta = composite - previous
    IF delta > 5: IMPROVING
    ELIF delta < -5: DEGRADING
    ELSE: STABLE

FOR each dim where score < 50: ADD recommendation
```

### Default Weights

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| CRITICALITY | 0.25 | Asset importance |
| BACKLOG_PRESSURE | 0.20 | Resource pressure |
| STRATEGY_COVERAGE | 0.25 | Maintenance plan completeness |
| CONDITION_STATUS | 0.15 | Monitoring tier |
| EXECUTION_COMPLIANCE | 0.15 | Monitoring tier |

## 5. Validacion

1. All dimension scores in [0, 100].
2. Weights must be positive, should sum to 1.0 (engine normalizes if not).
3. risk_class: I_LOW, II_MEDIUM, III_HIGH, IV_CRITICAL.
4. capacity_hours_per_week > 0 for backlog to work (else score = 0).
5. total_failure_modes >= fm_with_strategy.
6. Trend threshold exactly 5.0: delta +5.0 = STABLE, +5.01 = IMPROVING.
7. critical_alerts treated independently from active_alerts in formula.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| GFSN Equipment Data | `../../knowledge-base/gfsn/ref-13` | For equipment-specific health benchmarks and failure mode counts |
| Health Score Examples | `references/health-score-examples.md` | For worked example with full calculation and dimension details |

## Common Pitfalls

1. **Criticality score is inverse.** Higher criticality = LOWER health score. IV_CRITICAL = 15 pts.
2. **Backlog clamping.** Score cannot go below 0 even with > 8 weeks backlog. Cannot exceed 100.
3. **Condition status double-counting.** Critical alerts: 1x in active_alerts + 2x multiplier = 3x effective.
4. **Zero planned WOs = 100% compliance.** Intentional -- no plans = no non-compliance. Can mask poor planning.
5. **Trend threshold is strict.** delta = 5.0 exactly is STABLE, not IMPROVING.
6. **Custom weights not summing to 1.0.** Engine normalizes, but intent should be weights that sum to 1.0.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
