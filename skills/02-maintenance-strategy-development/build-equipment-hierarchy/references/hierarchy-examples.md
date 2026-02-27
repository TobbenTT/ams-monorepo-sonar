# Equipment Hierarchy - Worked Examples and Reference Tables

## Worked Example: Register a SAG Mill

### Inputs
- plant_id: "OCP-JFC1"
- area_code: "BRY"
- equipment_type: "SAG_MILL"
- model: "36x20"
- manufacturer: "FLSmidth"
- power_kw: 12000
- weight_kg: 450000
- sequence: 1

### Step-by-Step Walkthrough

**Step 1: Library Lookup**
- Uppercase: SAG_MILL
- Alias: SAG_MILL -> SAG
- Find equipment type with SAG in equipment_type_id -> Found

**Step 2: Generate Tag**
- Library convention: "{area}-SAG-ML-{seq:03d}"
- Equipment code: "SAG-ML"
- Tag = "BRY-SAG-ML-001"

**Step 3: Auto-criticality**
- Library has criticality_class: "AA" -> Use "AA"
- (Power 12000 >= 5000 would also give AA, but library takes precedence)

**Step 4: Build Hierarchy**
- Equipment node: BRY-SAG-ML-001 (Level 4)
- Sub-assemblies (Level 5):
  - BRY-SAG-ML-001-DRI (Drive System)
  - BRY-SAG-ML-001-MIL (Mill Shell)
  - BRY-SAG-ML-001-LUB (Lubrication)
- Maintainable items (Level 6):
  - BRY-SAG-ML-001-DRI-PIN01 (Pinion Gear)
  - BRY-SAG-ML-001-DRI-BEA02 (Bearings)

**Step 5: Failure Modes**
- Pinion Gear: WEARS / ABRASION (beta=2.5, eta=1800)
- Bearings: OVERHEATS_MELTS / LACK_OF_LUBRICATION (beta=1.8, eta=900)

**Step 6: Task Templates**
- "Inspect pinion gear wear pattern" / INSPECT / 90 DAYS / OFFLINE
- "Check bearing temperature" / CHECK / 8 OPERATING_HOURS / ONLINE

### Result
```
equipment_tag: "BRY-SAG-ML-001"
nodes_created: 12
criticality_suggestion: "AA"
failure_modes_generated: 8
sub_assemblies: ["Drive System", "Mill Shell", "Lubrication"]
warnings: []
```

## Tag Naming Examples

| Equipment Type | Area | Sequence | Generated Tag |
|---------------|------|----------|---------------|
| SAG Mill | BRY | 1 | BRY-SAG-ML-001 |
| Ball Mill | BRY | 2 | BRY-BALL-ML-002 |
| Slurry Pump | MIN | 1 | MIN-SLU-PU-001 |
| Unknown "Pump" | MIN | 1 | MIN-PUM-001 |
| Crusher | BRY | 3 | BRY-CRU-003 |

## Node Structure Fields

| Field | Type | Description |
|-------|------|-------------|
| node_id | UUID | Unique identifier |
| node_type | enum | EQUIPMENT, SUB_ASSEMBLY, or MAINTAINABLE_ITEM |
| name | string | Display name (English) |
| name_fr | string | Display name (French) |
| code | string | Generated tag/code |
| tag | string | Same as code |
| parent_node_id | UUID/null | Parent node (null for equipment) |
| level | integer | 4, 5, or 6 |
| plant_id | string | Plant identifier |
| criticality | string | Criticality class (equipment and SA) |
| status | string | Always "ACTIVE" for new nodes |
| order | integer | Sequential within parent (SA and MI) |
| metadata_json | dict | Technical data (equipment and MI) |

## Power-Based Criticality Assignment

| Power Rating (kW) | Criticality Class |
|-------------------|-------------------|
| >= 5000 | AA |
| >= 2000 | A+ |
| >= 500 | A |
| >= 100 | B |
| < 100 (or 0) | C |

Evaluated top-down; first matching threshold applies.
Library criticality always takes precedence over power-based assignment.
