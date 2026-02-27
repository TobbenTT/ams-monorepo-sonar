---
name: conduct-management-review
description: >
  Aggregate asset health, KPIs, variance alerts, and CAPAs into an executive management
  review summary with trend analysis for mining operations per ISO 55002 Section 9.3.
  Produces: executive review with health trends, KPI trends, key findings, and recommended
  actions. Use this skill when a user needs to prepare or conduct a management review.
  Triggers EN: management review, executive review, ISO 55002 9.3, asset health summary,
  KPI trends, management summary, health trend, performance review, portfolio review.
  Triggers ES: revision gerencial, revision de gestion, resumen ejecutivo, tendencias
  de salud, revision de desempeno.
---

# Conduct Management Review

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for preparing executive management reviews per ISO 55002 Section 9.3. You must aggregate asset health scores, compute trends (using a 5-point delta threshold), count CAPA metrics, determine KPI trends (using 5% threshold), generate max-5 key findings (CLT chunking), and produce actionable recommendations. You mitigate anchoring bias by presenting balanced data and prevent hidden profile bias by including per-plant breakdowns.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `period_start` | date | Yes | Review period start |
| `period_end` | date | Yes | Review period end |
| `kpi_summary` | KPIMetrics | No | KPI metrics (mtbf, mttr, availability, etc.) |
| `health_scores` | list[AssetHealthScore] | No | Per-equipment health scores |
| `variance_alerts` | list[PlantVarianceAlert] | No | Multi-plant variance alerts |
| `capas` | list[CAPAItem] | No | CAPA items for this plant |
| `previous_avg_health` | float | No | Previous period average health |
| `previous_kpis` | KPIMetrics | No | Previous period KPIs for trends |

## 3. Flujo de Ejecucion

### Step 1: Calculate Average Health Score
If health_scores provided: avg_health = round(sum(composite_score) / count, 1). Else: 0.0.

### Step 2: Determine Health Trend
```
IF no previous_avg_health -> STABLE
delta = current - previous
IF delta > 5.0 -> IMPROVING
IF delta < -5.0 -> DEGRADING
ELSE -> STABLE
```

### Step 3: Count CAPA Metrics
- open_capas: status IN (OPEN, IN_PROGRESS)
- overdue_capas: open + target_date not None + period_end > target_date

### Step 4: Compute KPI Trends
For each KPI: diff = current - previous, threshold = abs(previous) * 0.05 (or 1.0 if 0).
- abs(diff) < threshold -> STABLE
- Higher-is-better: diff > 0 -> IMPROVING, diff < 0 -> DEGRADING
- Lower-is-better (mttr, reactive_ratio): diff < 0 -> IMPROVING, diff > 0 -> DEGRADING
- Missing data -> NO_DATA

### Step 5: Generate Key Findings (Max 5)
1. Health overview: "{avg}/100 -- {critical} critical, {at_risk} at-risk"
2. Critical variance alerts count
3. CAPA status (overdue or open count)
4. Equipment availability %
5. High reactive ratio warning (if > 30%)

### Step 6: Generate Recommended Actions
1. Degrading health -> investigate root cause
2. Critical assets -> prioritize intervention (max 3 tags)
3. Critical variance alerts -> investigate deviation (max 3 plants)
4. Overdue CAPAs -> resolve
5. High reactive ratio (> 30%) -> increase PM coverage
6. Low PM compliance (< 80%) -> review scheduling

## 4. Logica de Decision

### Health Trend
```
delta > +5.0  --> IMPROVING
delta < -5.0  --> DEGRADING
|delta| <= 5.0 --> STABLE
no previous   --> STABLE
```

### KPI Trend
```
threshold = max(abs(previous) * 0.05, 1.0 if previous == 0)
|diff| < threshold  --> STABLE
Higher better: diff > 0 --> IMPROVING, diff < 0 --> DEGRADING
Lower better: diff < 0 --> IMPROVING, diff > 0 --> DEGRADING
```

### Action Triggers
```
health_trend == DEGRADING       --> Investigate declining health
critical_assets exist           --> Prioritize intervention (max 3)
critical_variance_alerts exist  --> Investigate deviation (max 3)
overdue_capas > 0               --> Resolve overdue CAPAs
reactive_ratio_pct > 30         --> Increase PM coverage
pm_compliance_pct < 80          --> Review scheduling
```

## 5. Validacion

1. ISO 55002 Section 9.3 structure: performance, health trends, corrective actions, recommendations.
2. CLT chunking: maximum 5 top-level categories.
3. Anchoring Bias: balanced picture (good and bad).
4. Hidden Profile Bias: per-plant breakdowns beneath aggregates.
5. Health trend requires > 5.0 point change.
6. KPI trend uses 5% threshold.
7. Critical asset listing capped at 3.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For KPI definitions and targets |
| DE Procedure | `../../knowledge-base/gfsn/ref-15` | For DE KPI thresholds |
| ISO 55002 Standards | `../../knowledge-base/standards/` | For Section 9.3 management review requirements |
| Review Parameters | `references/review-parameters.md` | For thresholds, trend rules, and finding templates |

## Common Pitfalls

1. **Health trend dead zone**: Delta of exactly +/- 5.0 is STABLE, not a trend change.
2. **KPI trend threshold**: When previous is 0, threshold defaults to 1.0 (not 0).
3. **Overdue CAPAs use period_end, not today**: Reflects the period being reviewed.
4. **Findings are conditional**: Not all findings generated every time.
5. **Actions limited to 3 examples**: Critical assets and variance alerts list max 3 items.
6. **Lower-is-better KPI inversion**: MTTR and reactive_ratio have inverted trend logic.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
