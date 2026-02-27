# Planning KPI Formulas Reference

## Complete KPI Table

| # | KPI Name | Formula | Target | Direction | Unit |
|---|----------|---------|--------|-----------|------|
| 1 | wo_completion | (wo_completed / wo_planned) * 100 | >= 90.0% | Higher | % |
| 2 | manhour_compliance | (manhours_actual / manhours_planned) * 100 | 85-115% | Range | % |
| 3 | pm_plan_compliance | KPIEngine.calculate_pm_compliance() | >= 95.0% | Higher | % |
| 4 | backlog_weeks | backlog_hours / weekly_capacity_hours | <= 4.0 | Lower | weeks |
| 5 | reactive_work | KPIEngine.calculate_reactive_ratio() | <= 20.0% | Lower | % |
| 6 | schedule_adherence | KPIEngine.calculate_schedule_compliance() | >= 85.0% | Higher | % |
| 7 | release_horizon | release_horizon_days (direct) | <= 7.0 | Lower | days |
| 8 | pending_notices | (pending_notices / total_notices) * 100 | <= 15.0% | Lower | % |
| 9 | scheduled_capacity | (scheduled_cap_hrs / total_cap_hrs) * 100 | 80-95% | Range | % |
| 10 | proactive_work | (proactive_wo / total_wo) * 100 | >= 70.0% | Higher | % |
| 11 | planning_efficiency | (planned_wo / total_wo) * 100 | >= 85.0% | Higher | % |

## Worked Example

**Input:**
```
wo_planned=100, wo_completed=92, manhours_planned=800, manhours_actual=880
pm_planned=40, pm_executed=39, backlog_hours=900, weekly_capacity_hours=240
corrective_count=18, total_wo=100, schedule_planned=90, schedule_executed=80
release_horizon_days=5, pending_notices=10, total_notices=80
scheduled_capacity_hours=210, total_capacity_hours=240
proactive_wo=75, planned_wo=88
```

**Results:**

| # | KPI | Value | Target | Status |
|---|-----|-------|--------|--------|
| 1 | wo_completion | 92.0% | >= 90% | ON_TARGET |
| 2 | manhour_compliance | 110.0% | 85-115% | ON_TARGET |
| 3 | pm_plan_compliance | 97.5% | >= 95% | ON_TARGET |
| 4 | backlog_weeks | 3.8 wks | <= 4 wks | ON_TARGET |
| 5 | reactive_work | 18.0% | <= 20% | ON_TARGET |
| 6 | schedule_adherence | 88.9% | >= 85% | ON_TARGET |
| 7 | release_horizon | 5.0 days | <= 7 days | ON_TARGET |
| 8 | pending_notices | 12.5% | <= 15% | ON_TARGET |
| 9 | scheduled_capacity | 87.5% | 80-95% | ON_TARGET |
| 10 | proactive_work | 75.0% | >= 70% | ON_TARGET |
| 11 | planning_efficiency | 88.0% | >= 85% | ON_TARGET |

on_target=11, overall_health=HEALTHY
