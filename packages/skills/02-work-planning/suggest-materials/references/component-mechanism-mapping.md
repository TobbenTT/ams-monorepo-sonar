# Component-Mechanism Material Mapping Table

Reference table for the `DEFAULT_MATERIAL_MAPPINGS` used by the material mapper engine. This is loaded on demand during Tier 2 (Catalog Match) material suggestion.

## Complete Mapping

| Component | Mechanism | Materials Suggested | Qty | Reason |
|-----------|-----------|-------------------|-----|--------|
| **Bearing** | WORN | Replacement bearing (same type) | 1 | Direct replacement |
| | | Bearing seal kit | 1 | Replace seals during bearing change |
| | | Lubricant (bearing grease) | 1 | Initial lubrication after install |
| **Bearing** | OVERHEATED | Replacement bearing (same type) | 1 | Heat damage replacement |
| | | Bearing seal kit | 1 | Seals likely damaged by heat |
| **Bearing** | CRACKED | Replacement bearing (same type) | 1 | Crack damage replacement |
| **Seal** | LEAKING | Mechanical seal kit | 1 | Seal replacement for leakage |
| | | O-ring set | 1 | Replace auxiliary seals |
| **Seal** | WORN | Mechanical seal kit | 1 | Wear replacement |
| **Impeller** | WORN | Replacement impeller | 1 | Erosion/abrasion replacement |
| | | Impeller wear ring | 1 | Replace clearance ring |
| **Impeller** | CORRODED | Replacement impeller (corrosion-resistant) | 1 | Corrosion replacement |
| **Impeller** | BROKEN | Replacement impeller | 1 | Fracture replacement |
| | | Impeller bolt set | 1 | Replace fasteners |
| **Liner** | WORN | Liner set (wear-resistant) | 1 | Abrasion replacement |
| | | Liner bolt set | 1 | Replace fasteners |
| **Motor** | OVERHEATED | Motor winding repair kit | 1 | Winding insulation damage |
| **Motor** | BROKEN | Replacement motor (same spec) | 1 | Complete motor replacement |
| **Coupling** | WORN | Coupling element/insert | 1 | Elastic element replacement |
| **Coupling** | BROKEN | Replacement coupling | 1 | Complete coupling replacement |
| **Coupling** | LOOSE | Coupling bolt set | 1 | Fastener replacement |
| | | Coupling key | 1 | Key replacement if damaged |
| **Filter** | BLOCKED | Replacement filter element | 2 | Blocked filter replacement |
| **Belt** | WORN | Replacement belt (matched set) | 1 | Belt wear replacement |
| **Belt** | CRACKED | Replacement belt (matched set) | 1 | Belt fatigue replacement |
| **Gearbox** | WORN | Gear set | 1 | Gear wear replacement |
| | | Gearbox oil | 1 | Oil change during overhaul |
| | | Gearbox seal kit | 1 | Replace seals during overhaul |
| **Gearbox** | LEAKING | Gearbox seal kit | 1 | Seal replacement for oil leakage |
| | | Gearbox oil | 1 | Top-up after seal fix |

## Generic Fallback Coverage

The generic fallback activates when no BOM or catalog match exists AND the mechanism is one of:

| Mechanism | Generic Suggestion |
|-----------|-------------------|
| `WORN` | `"Replacement {component_type}"` |
| `BROKEN` | `"Replacement {component_type}"` |
| `CRACKED` | `"Replacement {component_type}"` |
| `DEFORMED` | `"Replacement {component_type}"` |
| Any other | No suggestion returned |
