# Schedule Parameters Reference

## Execution Window

| Parameter | Value | Notes |
|-----------|-------|-------|
| Execution Days | 4 | Thursday through Sunday |
| Start Day | Thursday | week_start + 3 days |
| Planning Days | Mon-Wed | Preparation and finalization |
| SHIFT_HOURS | 8.0 | Standard shift capacity per worker |

## Support Task Definitions

| Task Type | Duration | Required Before | Trigger Condition |
|-----------|----------|----------------|-------------------|
| LOTO | 0.5h | Yes | shutdown_required = True |
| GUARD_REMOVAL | 0.5h | Yes | shutdown_required = True |
| CRANE | 1.0h | Yes | MECHANICAL in specialties AND total_hours > 4.0 |
| CLEANING | 0.5h | No (post) | Always |
| COMMISSIONING | 0.5h | No (post) | Always |

## Conflict Detection Thresholds

| Conflict Type | Condition | Default Threshold |
|--------------|-----------|-------------------|
| Area Interference | 2+ packages same area, date, shift | 2 packages |
| Specialist Overallocation | specialty hours > SHIFT_HOURS per date/shift | 8.0 hours |

## Conflict Resolution Types

| Type | Description | Applies To |
|------|-------------|-----------|
| RESCHEDULE | Move package to different day | Area interference |
| ADD_SHIFT | Add afternoon/night shift capacity | Specialist overallocation |
| REASSIGN_SPECIALTY | Move to cross-trained team member | Specialist overallocation (2+ packages) |

## Program Lifecycle

```
DRAFT --> FINAL (conflicts == 0) --> ACTIVE --> COMPLETED
FINAL --> DRAFT (revert, clears finalized_at)
```

## Weekly Cadence

| Day | Activity | Week |
|-----|----------|------|
| Monday | Review backlog, select packages | N-1 |
| Tuesday | Resource leveling, conflict detection | N-1 |
| Wednesday | Finalize program (DRAFT -> FINAL) | N-1 |
| Thursday | Materials/permits verification | N-1 |
| Thursday | Execution begins (Day 1) | N |
| Friday | Execution Day 2 | N |
| Saturday | Execution Day 3 | N |
| Sunday | Execution Day 4 + close-out | N |
| Monday | Review, update metrics (ACTIVE -> COMPLETED) | N+1 |
