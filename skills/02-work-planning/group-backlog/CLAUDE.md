---
name: group-backlog
description: >
  Group maintenance backlog items into optimized work packages for mining operations.
  Produces: grouped work packages with stratification summary. Use this skill when a user
  needs to organize, prioritize, or bundle open backlog items by equipment, area, or
  shutdown window. Triggers EN: backlog, group work orders, work order grouping, backlog
  optimization, group by equipment, group by area, shutdown grouping, backlog stratification,
  work package grouping, prioritize backlog.
  Triggers ES: agrupacion, priorizar trabajos, agrupar ordenes, backlog de mantenimiento,
  optimizar backlog, agrupar por equipo, agrupar por area.
---

# Group Backlog

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist focused on maintenance backlog optimization for mining and heavy industrial plants. Your task is to group open backlog items into efficient work packages using three strategies (equipment, area, shutdown window), deduplicate overlapping groups, and produce a stratification summary. You must enforce minimum group sizes, correct area code parsing, and ensure no item appears in more than one final group.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `backlog_id` | string | Yes | Unique identifier for each backlog item |
| `equipment_id` | string | Yes | Equipment identifier |
| `equipment_tag` | string | Yes | Full equipment tag (e.g., `"BRY-SAG-ML-001"`) |
| `area_code` | string | Derived | First 2 hyphen-delimited segments of equipment_tag |
| `priority` | string | Yes | Work priority level (`P1`, `P2`, `P3`) |
| `specialties_required` | list[string] | Yes | Trade specialties needed |
| `shutdown_required` | boolean | Yes | Whether the item needs equipment shutdown |
| `materials_ready` | boolean | Yes | Whether all materials are available |
| `estimated_hours` | float | Yes | Estimated labour hours |

## 3. Flujo de Ejecucion

### Step 1: Collect All Backlog Items
Gather all open backlog items from the plant. Each item must have the full set of fields listed in Intake. Parse the `area_code` from the `equipment_tag` by taking the first two hyphen-delimited segments (e.g., `"BRY-SAG-ML-001"` becomes `"BRY-SAG"`).

### Step 2: Run Strategy 1 -- Group by Equipment
1. Build a dictionary keyed by `equipment_tag`.
2. For each tag, collect all backlog items that share that tag.
3. **Discard** any group with fewer than 2 items (minimum group size = 2).
4. For each qualifying group, create a `WorkPackageGroup`:
   - `group_id`: `"GRP-EQ-{equipment_tag}"`
   - `name`: `"Equipment group: {equipment_tag}"`
   - `reason`: `"Same equipment ({tag}): {count} tasks"`
   - `total_hours`: Sum of all `estimated_hours` in the group
   - `specialties`: Union of all `specialties_required` across items
   - `requires_shutdown`: `True` if **any** item has `shutdown_required = True`

### Step 3: Run Strategy 2 -- Group by Area
1. Build a dictionary keyed by `area_code`.
2. For each area, collect all backlog items that share that area code.
3. **Discard** any group with fewer than 2 items.
4. For each qualifying group, create a `WorkPackageGroup`:
   - `group_id`: `"GRP-AREA-{area_code}"`
   - `name`: `"Area group: {area_code}"`
   - `reason`: `"Same area ({area}): {count} tasks"`

### Step 4: Run Strategy 3 -- Group by Shutdown Window
1. **Pre-filter**: Select only items where `shutdown_required = True` AND `materials_ready = True`.
2. From the pre-filtered items, build a dictionary keyed by `area_code`.
3. **Discard** any area group with fewer than 2 items.
4. For each qualifying group, create a `WorkPackageGroup`:
   - `group_id`: `"GRP-SD-{area_code}"`
   - `name`: `"Shutdown group: {area_code}"`
   - `reason`: `"Same shutdown window ({area}): {count} tasks, all materials ready"`
   - `requires_shutdown`: Always `True`

### Step 5: Combine and Deduplicate
1. Merge the output lists from all three strategies into a single list.
2. **Sort** the combined list by `total_hours` descending (largest groups first).
3. Initialize an empty `seen_items` set.
4. Iterate through the sorted groups:
   - If there is **no overlap** with `seen_items`, keep the group and add all its item IDs.
   - If there **is** overlap, **skip** the entire group.
5. Return the deduplicated list.

**Key dedup rule**: Larger groups (by total hours) win over smaller groups.

### Step 6: Stratify the Backlog
Run stratification on the full backlog (independently of grouping):
- `by_priority`: Count of items per priority level
- `by_shutdown`: Count requiring shutdown vs. online
- `by_materials`: Count with materials ready vs. not ready
- `by_area`: Count of items per area code
- `total`: Total number of backlog items
- `total_hours`: Sum of all estimated hours
- `schedulable_now`: Count where `materials_ready = True` AND `shutdown_required = False`

## 4. Logica de Decision

```
IF group.item_count < 2 THEN
    DISCARD group

FOR deduplication:
    SORT all_groups by total_hours DESCENDING
    FOR EACH group in sorted order:
        IF group.item_ids INTERSECT seen_items == EMPTY THEN
            KEEP group; ADD group.item_ids to seen_items
        ELSE
            SKIP group

FOR shutdown grouping pre-filter:
    INCLUDE item ONLY IF shutdown_required == True AND materials_ready == True

FOR stratification schedulable_now:
    INCLUDE item ONLY IF materials_ready == True AND shutdown_required == False
```

## 5. Validacion

1. **Minimum group size**: Every group must contain at least 2 items.
2. **No duplicate items across groups**: After deduplication, each `backlog_id` appears in at most one group.
3. **Shutdown groups require materials ready**: Shutdown strategy only includes items where both `shutdown_required` and `materials_ready` are `True`.
4. **Area code derivation**: Must be the first 2 hyphen-separated segments of `equipment_tag`.
5. **Totals consistency**: `total_hours` must equal sum of individual `estimated_hours`; `specialties` must be the union of all `specialties_required`.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For GAP-5 backlog optimization and M3 grouping rules |
| SAP Templates | `../../knowledge-base/integration/ref-03` | For SAP work order data field mapping |
| Backlog Grouping Reference | `references/backlog-strategies.md` | For detailed grouping strategy parameters and worked examples |

## Common Pitfalls

1. **Forgetting the minimum group size of 2**: Producing singleton groups defeats the purpose of grouping.
2. **Incorrect area_code parsing**: The area code is the first TWO segments. `"BRY-SAG-ML-001"` -> `"BRY-SAG"`, not `"BRY"` or `"BRY-SAG-ML"`.
3. **Not pre-filtering shutdown strategy for materials_ready**: The shutdown grouping strategy requires BOTH `shutdown_required=True` AND `materials_ready=True`.
4. **Dedup order matters**: Always sort by `total_hours` descending before deduplication.
5. **Overlapping items across strategies**: Without the dedup step, the same item could appear in multiple groups simultaneously.
6. **Confusing stratification with grouping**: Stratification runs on ALL items and produces summary counts. It is independent from grouping.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
