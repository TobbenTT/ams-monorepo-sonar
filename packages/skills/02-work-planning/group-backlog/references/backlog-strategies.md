# Backlog Grouping Strategies Reference

## Strategy Parameters

| Strategy | Key Field | Prefix | Pre-Filter | Min Group Size |
|----------|-----------|--------|------------|----------------|
| Equipment | `equipment_tag` | `GRP-EQ-` | None | 2 |
| Area | `area_code` | `GRP-AREA-` | None | 2 |
| Shutdown | `area_code` | `GRP-SD-` | `shutdown_required=True AND materials_ready=True` | 2 |

## Area Code Parsing

The `area_code` is derived from the `equipment_tag` by taking the first two hyphen-delimited segments:

| Equipment Tag | Area Code |
|---------------|-----------|
| `BRY-SAG-ML-001` | `BRY-SAG` |
| `BRY-CRU-CR-010` | `BRY-CRU` |
| `BRY-CON-CV-003` | `BRY-CON` |
| `BRY-PMP-PP-002` | `BRY-PMP` |

## Deduplication Logic

1. Merge all groups from all strategies.
2. Sort by `total_hours` descending.
3. Iterate: keep group if no item overlap with `seen_items`, otherwise skip.
4. Larger groups win over smaller groups.

## Worked Example

**Input backlog (5 items):**

| backlog_id | equipment_tag | area_code | priority | specialties | shutdown | materials_ready | hours |
|-----------|---------------|-----------|----------|-------------|----------|----------------|-------|
| BL-001 | BRY-SAG-ML-001 | BRY-SAG | P2 | [MECHANICAL] | true | true | 4.0 |
| BL-002 | BRY-SAG-ML-001 | BRY-SAG | P3 | [MECHANICAL] | true | true | 2.0 |
| BL-003 | BRY-SAG-EL-002 | BRY-SAG | P2 | [ELECTRICIAN] | false | true | 3.0 |
| BL-004 | BRY-CRU-ML-010 | BRY-CRU | P1 | [MECHANICAL] | false | true | 5.0 |
| BL-005 | BRY-SAG-ML-001 | BRY-SAG | P2 | [FITTER] | false | false | 1.5 |

**Strategy 1 -- Equipment:** `BRY-SAG-ML-001` -> BL-001, BL-002, BL-005 (7.5h) KEPT
**Strategy 2 -- Area:** `BRY-SAG` -> BL-001, BL-002, BL-003, BL-005 (10.5h) KEPT
**Strategy 3 -- Shutdown:** `BRY-SAG` -> BL-001, BL-002 (6.0h) KEPT

**After dedup (sorted by hours):**
1. `GRP-AREA-BRY-SAG` (10.5h) -- KEPT
2. `GRP-EQ-BRY-SAG-ML-001` (7.5h) -- SKIPPED (overlap)
3. `GRP-SD-BRY-SAG` (6.0h) -- SKIPPED (overlap)

**Final result**: 1 group with 4 items.

## Stratification Output Format

```json
{
  "by_priority": {"P1": 1, "P2": 3, "P3": 1},
  "by_shutdown": {"requires_shutdown": 2, "online": 3},
  "by_materials": {"ready": 4, "not_ready": 1},
  "by_area": {"BRY-SAG": 4, "BRY-CRU": 1},
  "total": 5,
  "total_hours": 15.5,
  "schedulable_now": 2
}
```
