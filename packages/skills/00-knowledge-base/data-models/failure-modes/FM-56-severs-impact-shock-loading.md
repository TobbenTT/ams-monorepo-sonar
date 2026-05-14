# FM-56: Severs (cut, tear, hole) due to Impact/shock loading

> **Combination**: 56 of 72
> **Mechanism**: Severs (cut, tear, hole)
> **Cause**: Impact/shock loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — impact/shock events are unpredictable; severing depends on random tramp material, process upsets, or accidental contact
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on impact frequency, energy, and material toughness

## Physical Degradation Process

Severing due to impact or shock loading occurs when a sudden, high-energy mechanical impact exceeds the material's ultimate tensile strength or fracture toughness at the point of contact, causing immediate penetration, tearing, or puncture of the component wall. Unlike abrasive severing (FM-55) which is progressive, impact severing can occur as a single catastrophic event — a single oversized rock fragment entering a pump can puncture the casing in one event. The failure mechanism depends on material ductility: ductile materials (mild steel, rubber) absorb impact energy through plastic deformation before tearing; brittle materials (cast iron, ceramics, hardened liners) fracture with minimal deformation.

The impact energy required for severing depends on material thickness, yield strength, and geometry. For thin-walled components (conveyor belts, filter cloths, rubber linings), relatively low-energy impacts can puncture through the section. For thicker components (pump casings, pipe walls), single-event puncture requires very high energy — but repeated sub-critical impacts create cumulative damage through progressive denting, work hardening, and micro-crack initiation that eventually leads to through-wall failure. This cumulative mechanism means that components in impact-prone service may appear sound between inspections but have significant internal damage.

In OCP phosphate processing, impact severing is most common at: belt conveyor loading points where large rock fragments (>300 mm) free-fall onto the belt surface, puncturing or tearing the rubber cover and carcass — this is the #1 cause of belt replacement at Khouribga; crusher liners where uncrushable tramp metal (excavator teeth, drill bits, ground engagement tools) impacts manganese steel liners, causing localized fracture or puncture; pump casings on ET-SLURRY-PUMP units where oversize material bypasses the screening circuit; chute and hopper walls at transfer points where direct impact of falling material creates localized penetration; and piping at slug-catcher points in two-phase flow systems.

## Detectable Symptoms (P Condition)

- Visible dents, gouges, or deformation on component surfaces indicating previous impact events
- Belt damage detectable by longitudinal rip detection systems (electromagnetic loop or sensor cord)
- Increasing thickness variation across component surface (UT measurement showing impact thinning)
- Visible surface cracking around impact sites (especially on brittle materials like cast iron or hardened liners)
- Material spillage or leakage at previously sound locations after impact event
- Acoustic emission bursts during operation indicating impact events (>60 dB above background)
- Conveyor belt cord breakage detectable by X-ray or magnetic inspection
- Impact zone hardness increase measured by portable hardness tester (>15% increase indicates work hardening and embrittlement)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER), bucket elevators | Belt rubber cover and carcass, impact idlers, loading chute wear plates |
| Crushers (CU) | ET-CRUSHER (CL-LINER-MANGANESE), jaw/cone/impact crushers | Manganese liners, blow bars, toggle plates (designed sacrificial element) |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), gravel pumps | Pump casing, impeller, suction liner, throat bush |
| Piping (PI) | Slurry pipelines at bends, tailings lines, gravity chutes | Pipe wall at impact zones (elbows, tees, dead legs) |
| Storage tanks (TA) | Ore bins, feed hoppers, surge bins | Hopper walls at impact zones, bin gates, cone sections |
| Filters and strainers (FS) | ET-BELT-FILTER (CL-FILTER-CLOTH), drum filters | Filter cloth, filter plate, drainage screen |
| Screens (SC) | Vibrating screens, trommel screens at SAG mills | Screen panels (polyurethane, rubber, woven wire), side plates |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Belt rip detection (electromagnetic loop, sensor cord) | Continuous | DIN 22109, ISO 15236 |
| Physical Effects / NDT | Ultrasonic thickness measurement at impact zones | 3–6 months | API 574, ASME B31.3 |
| Physical Effects / NDT | Visual/magnetic belt inspection (cord condition) | 3–6 months | ISO 15236, DIN 22110 |
| Human Senses | Visual inspection for dents, gouges, and deformation | 1–4 weeks | API 574 |
| Vibration Effects | Impact detection monitoring (shock pulse/envelope) | Continuous–weekly | ISO 10816 (adapted) |
| Physical Effects / NDT | Magnetic particle inspection (MPI) at impact sites | 6–12 months | ASME V Article 7, ISO 9934 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect belt condition at Loading Zone [{tag}]`
- **Acceptable limits**: Belt cover rubber thickness ≥50% of original per DIN 22102. No carcass exposure or cord breakage. Pipe/casing wall thickness ≥ minimum design per API 574. No visible through-wall damage or cracking at impact zones. Impact dent depth ≤10% of wall thickness.
- **Conditional comments**: If belt cover <50% but carcass intact: plan belt replacement at next major shutdown (within 6 months), install impact idlers if not present. If carcass damage or cord breakage detected: schedule belt splice repair within 2 weeks (for localized damage) or belt replacement within 30 days (for distributed damage). If pipe wall impact dent >10% of thickness: UT scan surrounding area for crack initiation, plan pad weld or section replacement. If pump casing punctured: immediate shutdown, replace casing.

### Fixed-Time (for impact-prone components)

- **Task**: `Replace impact idlers on Belt Conveyor [{tag}]`
- **Interval basis**: Impact idlers at loading zones: every 12–18 months (rubber rings degrade from repeated impact). Crusher blow bars (impact crushers): replace based on weight loss (typically 20–40% of original weight). Screen panels at primary screening: 2,000–6,000 operating hours depending on material. Hopper liner plates at impact zones: 6–12 months. Install impact beds or cradles at conveyor loading points to reduce belt damage (design intervention to extend belt life).

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for sacrificial/consumable elements designed to absorb impact (crusher toggle plates, impact curtains, dead-bed material in chutes) where the severing IS the intended protective function. NOT acceptable for primary containment boundaries (pipe walls, pump casings, belt carcass, pressure vessels) where through-wall puncture causes safety, environmental, or major production consequences.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with operational basis]*
