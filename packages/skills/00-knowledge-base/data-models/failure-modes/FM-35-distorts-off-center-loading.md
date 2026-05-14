# FM-35: Distorts due to Off-center loading

> **Combination**: 35 of 72
> **Mechanism**: Distorts
> **Cause**: Off-center loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: C (Gradual increase) — off-center loading effects accumulate progressively as misalignment, uneven wear, or asymmetric loading develop over time
> **ISO 14224 Failure Mechanism**: 1.4 Deformation
> **Weibull Guidance**: β typically 1.5–2.5 (gradual wear-out), η 5,000–25,000 hours depending on load eccentricity magnitude and component stiffness

## Physical Degradation Process

Distortion due to off-center loading occurs when loads are applied asymmetrically to a component, creating bending moments and eccentric stresses that progressively deform the component away from its designed geometry. Unlike concentric loading where stress distributes uniformly, eccentric loading concentrates stress on one side — a column loaded 10% off-center can experience 50% higher stress on the loaded side than the far side. This stress asymmetry causes preferential yielding and progressive deformation toward the loaded side.

Off-center loading develops through several mechanisms: uneven material distribution on conveyor belts (belt tracking and material centering problems); unbalanced charge distribution in rotating mills; eccentric loading on crane hooks from angled lifts; foundation settlement creating differential loading on equipment supports; misaligned couplings creating radial offset loads; and worn bearings allowing shaft displacement. The distortion is self-reinforcing — once eccentricity begins, the geometric shift increases the moment arm of the applied load, which increases the eccentricity further (a positive feedback loop). For slender members, this can lead to buckling at loads well below the concentric design capacity (Euler buckling with eccentricity).

In OCP phosphate processing, off-center loading distortion is particularly significant in: SAG mill and ball mill shells where charge distribution becomes asymmetric during low-speed operation or during startup/shutdown (unbalanced charge creates massive eccentric loads on trunnion bearings and foundations); conveyor belts where material loads are consistently off-center due to chute design or material flow patterns, causing frame and idler distortion on the heavy side; crane runway beams subjected to eccentric wheel loads during diagonal travel; storage silos and hoppers where eccentric draw-off creates asymmetric wall loads; and filter presses where uneven cake distribution creates frame distortion.

## Detectable Symptoms (P Condition)

- Belt mistracking (belt running consistently to one side, indicating off-center loading)
- Differential bearing temperature (loaded side bearing hotter than unloaded side by >10°C)
- Uneven wear patterns on bearings, bushings, or liner surfaces (one side worn more than opposite)
- Structural member deflection asymmetric (one side deflecting more than design permits)
- Shaft orbit analysis showing eccentric displacement pattern
- Foundation settlement differential >5 mm between supports (measurable by precision level survey)
- Crane runway rail differential elevation >3 mm per 6 m span (measured by rail survey)
- Visible lean or tilt of equipment or structure from original plumb position

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL (charge distribution) | Trunnion bearings, shell (ovalization), foundation pedestals, girth gear mesh |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR with off-center loading | Conveyor frame (lateral distortion), idler shafts, pulley shafts, drive frame |
| Cranes (CR) | Overhead cranes, gantry cranes (eccentric wheel loads) | Runway beams, end trucks, bridge girders, wheel assemblies |
| Storage tanks (TA) | Silos, hoppers with eccentric discharge | Silo walls (asymmetric pressure), hopper cone, support columns, foundation ring |
| Presses (PR) | Filter presses (ET-BELT-FILTER), hydraulic presses | Press frame (racking), tie bars, platens, guide rails |
| Pumps (PU) | Pumps with misaligned coupling or piping loads | Pump shaft, bearing housings, baseplate, casing (nozzle loads) |
| Structural steel (ST) | Columns with eccentric connections, portal frames | Column flanges, beam-column connections, base plates |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Alignment and level survey | 3–12 months | API 686, AS 4100 |
| Vibration Effects | Vibration orbit analysis (shaft eccentricity) | 1–4 weeks | ISO 10816, ISO 7919 |
| Temperature Effects | Differential bearing temperature monitoring | Continuous–weekly | ISO 10816, OEM specification |
| Human Senses | Visual inspection for belt mistracking and uneven wear | Daily–weekly | CEMA standard, OEM manual |
| Physical Effects | Foundation settlement survey (precision leveling) | 6–12 months | ASCE 7, AS 4100 |
| Primary Effects | Load distribution measurement (strain gauges on supports) | Monthly–quarterly | ASTM E1012 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Check belt tracking on Belt Conveyor [{tag}]`
- **Acceptable limits**: Belt centered within ±50 mm of centerline. Bearing temperature difference between sides ≤10°C. Foundation settlement differential ≤5 mm between adjacent supports. Crane rail elevation differential ≤3 mm per 6 m span per AS 1418. Shaft orbit within ≤50% of bearing clearance.
- **Conditional comments**: If belt consistently off-center >50 mm: adjust idler training, inspect chute alignment, install centering idlers within 30 days. If differential bearing temperature >10°C: investigate load distribution, check alignment, correct within 60 days. If foundation settlement >5 mm differential: re-shim equipment to restore level, investigate settlement cause (soil consolidation, undermining). If crane rail elevation differential >5 mm: re-rail or pack to correct, restrict diagonal travel until corrected.

### Fixed-Time (for alignment verification)

- **Task**: `Survey foundation level on Mill Foundation [{tag}]`
- **Interval basis**: Precision level survey every 12 months for critical rotating equipment foundations (mills, large pumps, compressors). Crane runway rail survey every 12 months per AS 1418. Conveyor alignment survey every 6–12 months. Compare to as-built baseline — any trending settlement should trigger geotechnical investigation. Re-level/re-shim equipment when differential exceeds 3 mm.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for rotating equipment foundations, crane runways, or structural frames — eccentric loading accelerates bearing failure, gear mesh damage, and structural fatigue. Acceptable only for non-precision, non-critical applications where minor eccentricity has no functional consequence (e.g., storage shelving, non-precision benches).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 1.4 Deformation], [REF-01 §3.5 — CB strategy with operational basis]*
