# FM-62: Washes Off due to Excessive fluid velocity

> **Combination**: 62 of 72
> **Mechanism**: Washes Off
> **Cause**: Excessive fluid velocity
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: C (Gradual increase) — erosive removal of surface treatments progresses with cumulative fluid exposure; rate accelerates as protective layer thins
> **ISO 14224 Failure Mechanism**: 2.3 Erosion
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 5,000–20,000 hours depending on fluid velocity, particle loading, and coating hardness

## Physical Degradation Process

Wash-off due to excessive fluid velocity occurs when the kinetic energy of fluid flow exceeds the adhesion strength of surface treatments, coatings, or protective layers. The mechanism involves both pure hydrodynamic erosion (fluid shear stress removing material) and particle-assisted erosion (entrained solids impacting at high velocity). The critical parameter is the wall shear stress, which is proportional to the square of fluid velocity — doubling velocity quadruples the erosive force. Surface treatments are progressively removed starting at areas of highest velocity: pipe bends, reducer transitions, valve throat areas, pump volute tongues, and impeller tip regions.

The degradation follows a characteristic progression: initial loss of the outermost protective layer (paint, epoxy coating, rubber lining), exposure of the substrate material, accelerated corrosion or erosion of the unprotected substrate, and eventual wall thinning or perforation. For internal coatings in chemical service, the loss of protective lining exposes the base metal to chemical attack, combining erosion with corrosion (erosion-corrosion synergy) that dramatically accelerates material loss. The angle of particle impingement also matters: ductile materials erode fastest at shallow angles (15–30°), while brittle materials and ceramics erode fastest at normal incidence (90°).

In OCP phosphate processing, this failure mode is critical in slurry pipeline systems where phosphate rock slurry (10–40% solids by weight) flows at velocities of 2–5 m/s. Rubber-lined pipes and polyurethane-coated components at Khouribga and Benguerir lose their protective linings progressively at elbows, tees, and reducer sections. Pump volute linings in ET-SLURRY-PUMP applications experience concentrated wash-off at the volute tongue where fluid velocity is highest. Phosphoric acid piping at Jorf Lasfar, where acid carries suspended gypsum crystals, suffers similar erosive loss of PTFE and rubber linings.

## Detectable Symptoms (P Condition)

- Increasing wall thickness loss measured by ultrasonic thickness testing (>10% reduction from baseline)
- Visible lining wear, thinning, or bare spots during internal visual inspection
- Change in fluid color or downstream particle content indicating coating/lining material in the stream
- Increasing vibration or noise at areas of high velocity (turbulence signature changes as surface roughness increases)
- Leakage at flanged connections or through pipe walls (late-stage symptom indicating perforation)
- Process fluid contamination with coating material particles detectable in downstream filters
- Localized external corrosion appearing over areas where internal lining has been lost (wet spots, rust staining)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Slurry pipelines (rubber-lined), phosphoric acid piping (PTFE-lined) | Internal lining (rubber, PTFE, polyurethane), elbows, reducers, tees |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), phosphoric acid pumps | Volute lining, impeller coating, wear plates, throat bush |
| Valves (VA) | ET-SLURRY-PUMP discharge valves (CL-VALVE-PINCH), control valves | Seat coating, ball/disc coating, body lining, trim surfaces |
| Heat exchangers (HE) | ET-HEAT-EXCHANGER tube internals, plate heat exchangers | Tube protective coating, plate gasket surfaces, nozzle linings |
| Filters and strainers (FS) | ET-BELT-FILTER feed distributors, screen panels | Screen coating, distributor lining, weir plates |
| Pressure vessels (VE) | Cyclone feed boxes, classifier overflow launders | Internal lining (rubber, ceramic tiles), overflow weirs, vortex finders |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Ultrasonic thickness measurement at high-velocity points | 1–6 months | ASME B31.3, API 570, API 574 |
| Human Senses | Internal visual inspection during planned shutdowns | 3–12 months | OEM lining specification |
| Primary Effects | Downstream particle/solids monitoring for coating material | 1–4 weeks | Process quality monitoring |
| Dynamic Effects | Vibration monitoring for turbulence changes at bends | 1–3 months | ISO 10816 baseline comparison |
| Temperature Effects | Thermography for wet spots on externally insulated piping | 1–3 months | ISO 18434 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure wall thickness on Pipe Elbow [{tag}]`
- **Acceptable limits**: Wall thickness ≥ minimum required per ASME B31.3 or API 570 design calculation. Alert at 150% of minimum. Alarm at 120% of minimum. Lining thickness ≥50% of original per OEM specification.
- **Conditional comments**: If wall thickness <150% of minimum: increase measurement frequency to monthly, plan lining replacement at next opportunity. If <120% of minimum: schedule replacement within 30 days, consider temporary velocity reduction. If at or below minimum: remove from service immediately, replace before return to operation.

### Fixed-Time (for known high-erosion zones)

- **Task**: `Replace rubber lining on Slurry Pipeline Elbow [{tag}]`
- **Interval basis**: Based on historical lining life data at specific locations. Typical intervals in OCP slurry service: elbows and tees 12–18 months, straight sections 24–36 months, pump volute linings 6–12 months. Coordinate with planned shutdown schedule. Velocity reduction (larger pipe diameter) extends lining life exponentially.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER for pressure-containing components — loss of lining leads to rapid base metal erosion and potential pipe perforation with safety consequences (high-pressure slurry release). NEVER for acid service piping. Acceptable only for non-pressure atmospheric components: launder linings, chute linings, non-pressurized overflow weirs where failure causes spillage but no injury risk.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Direct contact with product causes wear-out pattern], [ISO 14224 Table B.2 — 2.3 Erosion], [REF-01 §3.5 — CB strategy with operational units (hours/tonnes)]*
