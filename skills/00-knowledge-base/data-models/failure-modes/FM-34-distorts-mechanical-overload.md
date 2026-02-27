# FM-34: Distorts due to Mechanical overload

> **Combination**: 34 of 72
> **Mechanism**: Distorts
> **Cause**: Mechanical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — mechanical overload distortion events are unpredictable; driven by process upsets, misoperation, or abnormal load conditions
> **ISO 14224 Failure Mechanism**: 1.4 Deformation
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on design safety factor margin and load variability

## Physical Degradation Process

Distortion due to mechanical overload occurs when sustained or repeated loads exceed the material's yield strength, causing permanent plastic deformation. Unlike impact distortion (FM-33) which is a sudden event, mechanical overload distortion can develop gradually under sustained excessive loads — a beam subjected to sustained overload will creep and deflect progressively at ambient temperature if the stress exceeds approximately 60% of yield for structural steel. The distortion mechanism depends on the loading type: bending overload causes permanent curvature; compressive overload causes buckling (Euler critical load for slender members); torsional overload causes permanent twist; and combined loading creates complex distortion patterns.

The most critical aspect of mechanical overload distortion is that once plastic deformation occurs, the component's geometry has permanently changed, creating: misalignment of connected components, stress redistribution that overloads adjacent members, loss of fit and function in precision assemblies, and residual stresses that reduce future load capacity. Distortion is often the first visible evidence that operating loads exceed design assumptions — it serves as a warning before fracture if the material is ductile.

In OCP phosphate processing, mechanical overload distortion occurs in: conveyor belt structure during material surge loading (belt overload causes stringer deflection and idler frame distortion); crane structural members during overloading events; piping systems where thermal expansion loads exceed design (inadequate expansion loops); pump shaft deflection from hydraulic overload (excessive head or flow); tank shell buckling from excessive vacuum or external pressure; and structural steel columns at aging installations where cumulative loading from equipment additions exceeds original design capacity.

## Detectable Symptoms (P Condition)

- Visible permanent deflection, bowing, or twisting of structural members
- Alignment deviation from original survey data (>5 mm displacement at connection points)
- Increasing deflection under constant load (indicating ongoing plastic deformation)
- Buckling or rippling of thin-walled structures (tank shells, ductwork, chute walls)
- Bearing overload from shaft deflection (elevated bearing temperature, increased vibration)
- Bolt gap opening at flanged connections (distorted flanges no longer mate properly)
- Floor or foundation settlement measurable by level survey
- Equipment performance degradation from geometry change (pump efficiency drop, valve leakage)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Structural steel (ST) | Equipment support frames, pipe racks, headframes, conveyor galleries | Columns (buckling), beams (permanent deflection), bracing (permanent elongation) |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER), bucket elevator casings | Conveyor stringers, head/tail frames, take-up frames, chute structures |
| Storage tanks (TA) | Phosphoric acid tanks, water tanks, slurry tanks | Tank shell (buckling from vacuum), roof structure, wind girders, foundation ring |
| Piping (PI) | Process piping, utility piping, steam piping | Pipe wall (ovalization at bends), pipe supports (overloaded), expansion bellows |
| Cranes (CR) | Overhead cranes, gantry cranes, jib cranes | Crane beams, trolley frame, boom sections, end trucks |
| Pumps (PU) | ET-SLURRY-PUMP, ET-CENTRIFUGAL-PUMP | Pump shaft (permanent bend), baseplate (distortion), casing (hydraulic overload) |
| Pressure vessels (VE) | Vacuum vessels, atmospheric tanks, process columns | Shell (vacuum collapse), skirt (overload), saddle supports |
| Gearboxes (GB) | Mill gearboxes, conveyor drive gearboxes | Housing (mounting foot distortion), shaft (torsional yield), gear teeth (plastic deformation) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual inspection for deformation and buckling | 1–4 weeks | API 574, AS 4100 |
| Physical Effects | Structural survey (deflection, plumb, level) | 6–12 months | AS 4100, AISC 360 |
| Physical Effects | Alignment measurement at machinery | 3–6 months | API 686, ISO 10816 |
| Primary Effects | Load monitoring (strain gauges, load cells) | Continuous–monthly | ASTM E1012, equipment design |
| Physical Effects / NDT | Tank shell profile measurement (shell roundness) | 12–24 months | API 653, API 579 |
| Vibration Effects | Vibration monitoring for misalignment symptoms | 1–4 weeks | ISO 10816, ISO 20816 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Survey structural deflection of Equipment Frame [{tag}]`
- **Acceptable limits**: Beam deflection ≤L/360 under service load per AS 4100. Column out-of-plumb ≤H/500 per AS 4100. Tank shell out-of-roundness ≤1% of diameter per API 653. Shaft straightness ≤25 μm TIR for precision machinery per API 686. Piping expansion within calculated thermal movement ±10%.
- **Conditional comments**: If deflection L/360–L/200: engineer assessment for continued service, install additional support or bracing within 90 days. If deflection >L/200 or increasing under constant load: de-rate structure, restrict loading, plan reinforcement or replacement. If tank shell buckle identified: assess per API 579 fitness-for-service, reduce operating level, plan repair. If shaft permanent bow >50 μm: replace shaft at next opportunity (straightening of hardened shafts risks crack initiation).

### Fixed-Time (for structural integrity programs)

- **Task**: `Perform structural integrity survey of Platform [{tag}]`
- **Interval basis**: Comprehensive structural survey every 5 years for major process structures per AS 4100 or equivalent. Tank floor and shell survey per API 653 inspection intervals (typically 5–10 years external, 10–20 years internal based on corrosion rate). Crane runway survey annually per AS 1418. Foundation settlement survey every 2–5 years for heavy equipment (mills, crushers). Compare to as-built survey data to detect cumulative distortion.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for primary structural members, pressure-containing equipment, or machinery foundations — distortion causes cascading failures (misalignment, bearing overload, seal failure). Acceptable only for non-structural elements where distortion has no functional or safety consequence — e.g., aesthetic cladding, non-load-bearing partitions.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 1.4 Deformation], [REF-01 §3.5 — CB strategy with operational basis]*
