# Management Review Parameters Reference

## Health Trend Thresholds

| Delta | Trend |
|-------|-------|
| > +5.0 | IMPROVING |
| < -5.0 | DEGRADING |
| -5.0 to +5.0 (inclusive) | STABLE |
| No previous data | STABLE |

## KPI Trend Directions

| KPI | Direction | Higher is Better? |
|-----|-----------|-------------------|
| mtbf | Higher is better | Yes |
| mttr | Lower is better | No |
| availability | Higher is better | Yes |
| schedule_compliance | Higher is better | Yes |
| reactive_ratio | Lower is better | No |

## KPI Trend Threshold

```
threshold = abs(previous_value) * 0.05
IF previous_value == 0 THEN threshold = 1.0
IF abs(diff) < threshold THEN STABLE
```

## Key Finding Templates (Max 5)

1. "Portfolio health: {avg}/100 -- {critical} critical, {at_risk} at-risk assets"
2. "{N} critical variance alert(s) detected across plant portfolio"
3. "{N} overdue CAPA item(s) require immediate attention" OR "{N} open CAPA item(s) in progress"
4. "Equipment availability: {pct}%"
5. "Reactive ratio at {pct}% -- target is below 20%"

## Recommended Action Templates

| Trigger | Action |
|---------|--------|
| health_trend == DEGRADING | "Investigate root cause of declining asset health scores" |
| critical_assets exist | "Prioritize intervention for critical assets: {tag1}, {tag2}, {tag3}" |
| critical_variance_alerts | "Investigate performance deviation at: {plant1}, {plant2}, {plant3}" |
| overdue_capas > 0 | "Resolve {N} overdue CAPA item(s)" |
| reactive_ratio > 30% | "Increase preventive maintenance coverage to reduce reactive ratio" |
| pm_compliance < 80% | "PM compliance at {pct}% -- review scheduling and resource allocation" |

## Neuro-Architecture Principles

- **Anchoring Bias**: Present balanced start screen (good + bad)
- **Hidden Profile Bias**: Include per-plant breakdowns beneath aggregates
- **CLT Chunking**: Max 5 top-level categories to prevent cognitive overload
