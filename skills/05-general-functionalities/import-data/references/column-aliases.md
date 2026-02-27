# Column Alias Table for Auto-Detection

When importing data, the engine tries to auto-detect column mappings by matching source headers against known aliases for each target column.

## Complete Alias Mapping

| Target Column | Known Aliases |
|--------------|--------------|
| `equipment_id` | equipment_id, equip_id, eq_id, asset_id, tag, functional_location |
| `description` | description, desc, name, equipment_name, asset_name |
| `equipment_type` | equipment_type, type, equip_type, asset_type, category |
| `failure_date` | failure_date, date, event_date, occurrence_date |
| `failure_mode` | failure_mode, mode, fm, failure_type |
| `task_description` | task_description, task, description, activity |
| `frequency` | frequency, interval, cycle, periodicity |
| `parent_id` | parent_id, parent, superior, parent_equipment |
| `criticality` | criticality, crit, risk_class, criticality_class |
| `downtime_hours` | downtime_hours, downtime, duration_hours, repair_hours |
| `cost` | cost, repair_cost, total_cost, amount |

## Required Columns by Import Type

| Import Source | Required Columns |
|--------------|-----------------|
| EQUIPMENT_HIERARCHY | equipment_id, description, equipment_type |
| FAILURE_HISTORY | equipment_id, failure_date, failure_mode |
| MAINTENANCE_PLAN | equipment_id, task_description, frequency |

## Mapping Confidence Calculation

```
confidence = number_of_successfully_mapped_targets / total_required_columns
```

Examples:
- 1.0 = all 3 required columns mapped (3/3)
- 0.67 = 2 of 3 required columns mapped (2/3)
- 0.33 = 1 of 3 required columns mapped (1/3)
- 0.0 = no columns mapped (0/3)

## Matching Rules

1. Comparison is case-insensitive: `header.lower().strip()` vs `alias.lower()`
2. First matching alias wins for each target column
3. Unmapped columns are preserved in the output (pass-through)
4. Manual column_mapping overrides auto-detection entirely
