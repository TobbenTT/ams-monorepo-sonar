# Shutdown Parameters Reference

## Lifecycle States

| State | Description | Terminal |
|-------|-------------|---------|
| PLANNED | Event created, not yet started | No |
| IN_PROGRESS | Execution underway | No |
| COMPLETED | Execution finished | Yes |
| CANCELLED | Event cancelled before start | Yes |

## Valid Transitions

| From | To | Method |
|------|----|--------|
| PLANNED | IN_PROGRESS | start_shutdown |
| PLANNED | CANCELLED | cancel_shutdown |
| IN_PROGRESS | COMPLETED | complete_shutdown |

## Metrics Formulas

### Planned Hours
```
planned_hours = max(0.0, (planned_end - planned_start).total_seconds() / 3600)
Rounded to 1 decimal place.
```

### Schedule Compliance
```
schedule_compliance = min(100.0, round((planned_hours / actual_hours) * 100, 1))
Minimum planned_hours = 1.0 (avoid division by zero)
Default actual_hours = planned_hours if 0
```

### Scope Completion
```
completed_count = len([wo for wo in completed_wos if wo in work_orders])
scope_completion = round((completed_count / total_wos) * 100, 1) if total_wos > 0 else 0.0
```

### Planned vs Actual Ratio
```
ratio = round(planned_hours / actual_hours, 2) if actual_hours > 0 else 1.0
> 1.0 = ahead of schedule
< 1.0 = overran
```

## Worked Example

| Step | Action | Status | Hours | Completion | Delays |
|------|--------|--------|-------|------------|--------|
| Create | Plan 84.0h shutdown, 5 WOs | PLANNED | 84.0 planned | 0% | 0h |
| Start | Begin at 06:30 | IN_PROGRESS | actual_start set | 0% | 0h |
| Update 1 | WO-001, WO-002 done | IN_PROGRESS | ~29.5h | 40% | +2.0h |
| Update 2 | WO-003, WO-004 done | IN_PROGRESS | ~59.5h | 80% | +1.5h (3.5h total) |
| Complete | End at 20:00 | COMPLETED | 85.5h actual | 80% | 3.5h total |

**Metrics:**
- schedule_compliance = min(100, 84.0/85.5*100) = 98.2%
- scope_completion = 80.0% (4/5 WOs)
- planned_vs_actual = 84.0/85.5 = 0.98
- total_delays = 3.5h
