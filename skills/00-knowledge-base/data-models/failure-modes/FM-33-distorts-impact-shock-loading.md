# FM-33: Distorts due to Impact/shock loading

> **Combination**: 33 of 72
> **Mechanism**: Distorts
> **Cause**: Impact/shock loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — impact events are unpredictable; distortion depends on random tramp material, accidental contact, or process upsets
> **ISO 14224 Failure Mechanism**: 1.4 Deformation
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on impact frequency, energy magnitude, and material yield strength

## Physical Degradation Process

Distortion due to impact/shock loading occurs when a sudden, high-energy mechanical impact generates stresses exceeding the material's yield strength but below its ultimate tensile strength, causing permanent plastic deformation without fracture. The component retains structural continuity but its geometry is permanently altered — bent, dented, buckled, or twisted out of its original shape. The degree of distortion depends on the impact energy (mass × velocity²/2), the material's yield strength and strain hardening behavior, the component geometry (thin sections and unsupported spans distort more readily), and the impact location relative to supports.

Impact distortion differs from impact severing (FM-56) in that the material does not separate — it deforms plastically. However, distortion creates secondary problems: altered geometry changes load paths and creates stress concentrations; bent shafts create unbalance and bearing overload; dented pipes reduce flow area; warped frames create misalignment. In many cases, the distortion itself is the functional failure because dimensional tolerances are exceeded, even though the component is physically intact. Cumulative distortion from repeated sub-critical impacts is particularly insidious — each event adds incremental plastic strain that does not recover.

In OCP phosphate processing, impact distortion is prevalent at: conveyor structure steelwork at loading and transfer points where falling rock impacts structural members; chute and hopper walls that deform from direct material impact; crusher guards and frames that distort from tramp metal impact; pump casings that distort when oversize material jams the impeller; pipe supports and hangers that distort from thermal expansion loads or accidental contact by mobile equipment; and electrical conduit and cable tray that distort from accidental contact during maintenance activities.

## Detectable Symptoms (P Condition)

- Visible bending, denting, or buckling of structural members or equipment surfaces
- Alignment deviation exceeding tolerance (measurable by dial indicator, laser alignment, or optical survey)
- Shaft runout increasing (>50 μm for pump/motor shafts per ISO 10816)
- Increased vibration from distortion-induced unbalance or misalignment
- Pipe cross-section deformation measurable by profile gauge or internal caliper
- Guard or enclosure interference with rotating parts (reduced clearance)
- Structural member out-of-straightness exceeding L/1000 per AS 4100
- Bearing temperature increase from misalignment caused by distorted support structure

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR structure, transfer chutes, bucket elevators | Conveyor stringers, chute walls, hopper walls, idler frames |
| Crushers (CU) | ET-CRUSHER guards, feed chute, discharge chute | Feed chute walls, crusher frame, guard panels, discharge hopper |
| Piping (PI) | Slurry piping, pipe supports, small-bore connections | Pipe wall (dents), pipe supports/hangers, instrument tubing |
| Pumps (PU) | ET-SLURRY-PUMP casing, ET-CENTRIFUGAL-PUMP baseplate | Pump casing (distortion from jammed impeller), baseplate, coupling guard |
| Storage tanks (TA) | Ore bins, feed hoppers, day tanks | Tank shell (dents from external impact), roof structure, stairway/platform |
| Structural steel (ST) | Equipment support frames, pipe racks, handrails, platforms | Columns, beams, bracing, handrails, grating supports |
| Electrical installations (EI) | Cable trays, conduit, junction boxes | Cable tray sections, conduit runs, junction box covers |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual inspection for dents, bends, and deformation | 1–4 weeks | API 574, AS 4100 |
| Physical Effects | Alignment measurement (dial indicator, laser) | 3–6 months | ISO 10816, API 686 |
| Vibration Effects | Vibration monitoring for unbalance/misalignment | 1–4 weeks | ISO 10816, ISO 20816 |
| Physical Effects | Structural survey (straightness, plumb, level) | 6–12 months | AS 4100, AISC 360 |
| Physical Effects / NDT | Profile measurement of distorted sections | After each event | ASME B31.3, API 579 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect structural alignment of Conveyor Frame [{tag}]`
- **Acceptable limits**: Straightness within L/1000 for structural columns, L/500 for beams per AS 4100. Shaft runout ≤25 μm for precision applications, ≤50 μm for general service per ISO 10816. Pipe dent depth ≤6% of pipe diameter per ASME B31.3. No interference between guards and rotating parts (minimum 25 mm clearance).
- **Conditional comments**: If structural member out-of-straightness L/500–L/300: engineer assessment for adequacy, consider bracing or reinforcement. If shaft runout >50 μm: realign or straighten shaft (press straightening or thermal methods) at next opportunity. If pipe dent >6% of diameter: fitness-for-service assessment per API 579 Level 1/2 — may require cut-out and spool replacement. If distortion is recurring: install impact protection (rock guards, deflector plates, bollards, bumper rails).

### Fixed-Time (for impact-prone areas)

- **Task**: `Inspect impact protection on Transfer Chute [{tag}]`
- **Interval basis**: Visual inspection of impact protection devices (wear plates, rock guards, deflector plates) every 3–6 months. Replace deformed sacrificial elements (impact plates, bumper rails) when deformation exceeds 50% of original section. Post-impact engineering assessment after any significant event (mobile equipment collision, large rock impact). Install additional protection where recurring impacts are identified.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for non-structural, non-safety, cosmetic elements where distortion does not affect function — e.g., panel covers, non-pressurized enclosures, decorative elements. NOT acceptable for structural load-bearing members, pressure-containing equipment, rotating machinery supports, or guards protecting personnel from moving parts.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Human Senses], [ISO 14224 Table B.2 — 1.4 Deformation], [REF-01 §3.5 — CB strategy with operational basis]*
