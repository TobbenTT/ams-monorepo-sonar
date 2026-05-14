# FM-36: Distorts due to Use

> **Combination**: 36 of 72
> **Mechanism**: Distorts
> **Cause**: Use
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — normal operational forces cause progressive, cumulative distortion over time; deformation rate is relatively predictable based on operating hours and load profile
> **ISO 14224 Failure Mechanism**: 1.4 Deformation
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 10,000–50,000 hours depending on design margin, load spectrum, and material creep properties

## Physical Degradation Process

Distortion due to normal use occurs when the cumulative effect of regular operational loads progressively changes the component's geometry over its service life. Even though individual load cycles are within the design envelope, repeated plastic micro-strain at highly stressed locations (stress concentrations, welds, contact zones) accumulates over thousands of operating cycles. This mechanism is distinct from overload distortion (FM-34) where loads exceed design limits — here, the loads are normal but the cumulative effect of millions of cycles causes measurable dimensional change.

The primary mechanisms of use-related distortion include: ratcheting (cyclic plasticity where the stress range spans from compressive to tensile yield, causing incremental permanent strain in one direction each cycle); creep at ambient or moderately elevated temperature under sustained load (significant for polymeric components and lead/tin alloys even at room temperature); settling and embedment of contact surfaces under sustained compression (bolted joints, bearing seats, gasket surfaces); and progressive ovalization of cylindrical components subjected to repeated bending (pipes, shafts, mill shells). The rate of distortion typically decreases over time (primary creep/settling phase) and then stabilizes at a steady-state rate — but total accumulated distortion continues to increase.

In OCP phosphate processing, use-related distortion is significant in: SAG mill and ball mill shells that progressively ovalize under repeated charge loading (rotating shell cycles between loaded and unloaded conditions 10–15 times per minute); kiln riding rings that progressively wear and ovalize, changing the kiln axis alignment; conveyor pulleys that develop permanent crown loss from repeated belt contact; pump impellers that progressively distort from hydraulic loading (cavitation adds pitting that changes geometry); filter press plates that warp from repeated pressure/release cycling; and crane runway beams that develop permanent deflection from cumulative service loading over decades.

## Detectable Symptoms (P Condition)

- Progressive dimensional change measurable against as-built or previous survey data
- Mill shell ovality increasing (>0.5% of diameter indicates investigation needed)
- Pulley crown profile flattening (measured by straight-edge or profilometer)
- Impeller vane geometry change detectable by dimensional inspection (throat area increase)
- Filter plate warpage measurable by straightedge (>0.5 mm flatness deviation)
- Kiln riding ring ovality increasing (differential tire-to-shell gap measurement)
- Crane runway beam permanent deflection increasing (detected by rail survey)
- Increasing vibration from progressive geometry change (unbalance, misalignment)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL (shell ovalization) | Mill shell, trunnion bearings (progressive loading), head/end walls |
| Rotary equipment (RO) | Rotary kilns, rotary dryers (riding ring ovality) | Riding rings (tires), kiln shell, support rollers, thrust rollers |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR pulleys, idler rollers | Drive pulley crown, tail pulley lagging, idler shell |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), process pumps | Impeller vanes, wear rings (progressive opening), casing volute |
| Presses (PR) | Filter presses, belt press filters | Filter plates, press frame, tie bars, guide rails |
| Cranes (CR) | Overhead cranes, runway beams (cumulative deflection) | Runway beams, bridge girders, wheel treads |
| Valves (VA) | Control valves in continuous service | Valve plug/trim (erosion + distortion), seat rings, packing followers |
| Heat exchangers (HE) | Tube bundle (tube bowing), plate heat exchangers | Tubes (bowing from thermal cycling), plates (permanent set), gasket grooves |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Dimensional survey against baseline (as-built comparison) | 6–24 months | OEM specification, API 686 |
| Physical Effects | Mill shell ovality measurement | 12–24 months | OEM specification |
| Physical Effects | Kiln alignment survey (riding ring/shell gap) | 6–12 months | Kiln alignment specification |
| Vibration Effects | Vibration trending for progressive geometry change | 1–4 weeks | ISO 10816, ISO 20816 |
| Physical Effects | Pulley profile measurement | 12–24 months | CEMA standard |
| Primary Effects | Performance monitoring (efficiency, capacity trending) | Monthly–quarterly | ISO 9906 (pumps), process design |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure shell ovality on Mill [{tag}]`
- **Acceptable limits**: Mill shell ovality ≤0.5% of diameter per OEM specification. Kiln riding ring gap differential ≤design tolerance (typically ±5 mm). Pulley crown within ±0.5 mm of design profile. Impeller throat area within ±5% of design per ISO 9906. Filter plate flatness within ±0.5 mm.
- **Conditional comments**: If mill shell ovality 0.5–1.0%: monitor trend, plan investigation at next reline shutdown. If ovality >1.0%: engineer assessment for continued operation, consider load reduction. If kiln riding ring gap exceeds tolerance: adjust support rollers, plan riding ring maintenance. If pump impeller distortion >5%: schedule impeller replacement (efficiency loss typically >3% per 5% geometry change). If filter plate warped >1 mm: replace plate (leak risk between plates).

### Fixed-Time (for progressive distortion management)

- **Task**: `Perform alignment survey on Kiln [{tag}]`
- **Interval basis**: Kiln alignment survey every 6–12 months (riding ring adjustment based on survey results). Mill shell ovality measurement at every reline (typically 18–36 months). Pump impeller dimensional check at every major overhaul (typically 5,000–15,000 hours in slurry service). Crane runway survey annually. Filter plate dimensional check every 2 years or when leakage rate increases. All measurements compared to as-built baseline to detect cumulative change.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for non-precision components where progressive dimensional change does not affect function until an obvious threshold — e.g., general structural members where deflection is cosmetic, gravity flow channels where minor profile change has negligible effect. NOT acceptable for precision assemblies (bearings, gears, seals), rotating equipment, pressure boundaries, or any component where geometry change creates secondary failure modes.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 1.4 Deformation], [REF-01 §3.5 — CB strategy with operational basis]*
