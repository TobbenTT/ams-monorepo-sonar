# PDCA Lifecycle Reference

## PDCA Phase Transitions

```
PLAN --> DO --> CHECK --+--> ACT --> PLAN (new cycle)
                       |
                       +--> DO (rework loop)
```

| Current Phase | Allowed Next Phases | Notes |
|--------------|-------------------|-------|
| PLAN | DO | Planning complete, begin execution |
| DO | CHECK | Execution complete, begin verification |
| CHECK | ACT, DO | ACT = standardize; DO = rework needed |
| ACT | PLAN | Start new improvement cycle |

## Status Lifecycle

```
OPEN --> IN_PROGRESS --> CLOSED --> VERIFIED (terminal)
              |             |
              v             v
            OPEN      IN_PROGRESS (reopen)
```

| Current | Allowed Next | Side Effects |
|---------|-------------|-------------|
| OPEN | IN_PROGRESS | None |
| IN_PROGRESS | CLOSED | closed_at = now |
| IN_PROGRESS | OPEN | Reset closed_at, verified_at, effectiveness_verified |
| CLOSED | VERIFIED | Requires effectiveness_verified=True; sets verified_at |
| CLOSED | IN_PROGRESS | Reopen for rework |
| VERIFIED | (none) | Terminal state |

## Overdue Rules

- Only OPEN and IN_PROGRESS CAPAs can be overdue
- No target_date = never overdue
- reference_date > target_date = overdue

## Summary Metrics

```json
{
  "total": "count of all CAPAs",
  "open": "status == OPEN",
  "in_progress": "status == IN_PROGRESS",
  "closed": "status == CLOSED",
  "verified": "status == VERIFIED",
  "overdue": "is_overdue() == True",
  "corrective": "capa_type == CORRECTIVE",
  "preventive": "capa_type == PREVENTIVE",
  "by_phase": {"PLAN": 0, "DO": 0, "CHECK": 0, "ACT": 0}
}
```
