# SAP Field Constraints Reference

## Field Length Limits

| Field | Max Length | Notes |
|-------|-----------|-------|
| Operation short_text | 72 chars | Truncated with [:72] |
| MI description | 40 chars | From WP name |
| Plan description | 40 chars | From plan_description input |

## Code Mappings

### Constraint to System Condition
| Constraint | system_condition | Label |
|-----------|-----------------|-------|
| ONLINE | 1 | Running |
| OFFLINE | 3 | Stopped |
| (default) | 1 | Running |

### Frequency Unit to SAP Cycle Unit
| Frequency Unit | SAP cycle_unit |
|---------------|----------------|
| DAYS | DAY |
| WEEKS | WK |
| MONTHS | MON |
| YEARS | YR |
| HOURS | H |
| OPERATING_HOURS | H |

## Default Values

| Field | Default | Notes |
|-------|---------|-------|
| order_type | PM03 | Always for planned maintenance |
| control_key | PMIN | Always for PM operations |
| planner_group | 1 | Default planner group |
| priority | 4 | Default planned priority |
| call_horizon_pct | 50 | Standard call horizon |
| scheduling_period | 14 DAY | Standard scheduling window |
| min_duration | 0.5h | SAP rejects zero-duration |
| min_workers | 1 | Minimum 1 worker per operation |

## SAP PM Lifecycles

**Work Order:** Created -> Released -> In Progress -> Technically Complete -> Closed
**Notification:** Created -> In Process -> Completed -> Closed

## Cross-Reference Format

- Maintenance Item: `$MI{idx}` (e.g., $MI1, $MI2)
- Task List: `$TL{idx}` (e.g., $TL1, $TL2)
- Each $MI references exactly one $TL via task_list_ref
