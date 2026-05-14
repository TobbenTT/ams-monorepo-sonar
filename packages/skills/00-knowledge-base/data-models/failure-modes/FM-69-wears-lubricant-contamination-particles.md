# FM-69: Wears due to Lubricant contamination (particles)

> **Combination**: 69 of 72
> **Mechanism**: Wears
> **Cause**: Lubricant contamination (particles)
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — particle contamination accumulates progressively; wear rate increases as particle population grows
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 1.5–2.5 (gradual), η 5,000–30,000 hours depending on filtration quality, seal effectiveness, and environment cleanliness

## Physical Degradation Process

Wear due to lubricant contamination with particles occurs when hard foreign particles circulating in the lubricant become trapped between moving surfaces, causing three-body abrasive wear and surface fatigue. Particles in the size range of the lubricant film thickness (typically 1–25 μm for hydrodynamic bearings, 0.5–5 μm for rolling element bearings) are most damaging because they bridge the oil film and simultaneously contact both surfaces. Larger particles may not enter the contact zone; smaller particles pass through without significant damage.

The wear progression is autocatalytic: ingressed contaminant particles cause initial wear → wear generates secondary particles → secondary particles cause additional wear → cycle accelerates. Research shows that bearing life is inversely proportional to contamination level — a bearing operating at ISO 4406 cleanliness code 21/19/16 will have only 20% of the life of the same bearing at 15/13/10. The contamination source may be external (ingressed through seals, breathers, or during maintenance) or internal (wear debris from initial running-in, corrosion products, or oil degradation products).

The wear mechanisms are: three-body abrasion where particles trapped between surfaces scratch and groove both surfaces; surface fatigue where particles indent one surface causing subsurface stress concentration and eventual spalling; and embedment where particles embed in the softer surface and act as fixed abrasive points against the harder surface. The damage pattern is diagnostic: particle-induced wear creates randomly oriented scratches (unlike adhesive wear which creates aligned, directional marks).

In OCP phosphate processing, particle contamination is extremely aggressive due to: pervasive phosphate dust environment (particles ingress through shaft seals, breathers, and fill ports); slurry ingress through failed pump mechanical seals; sand and silica particles from mining operations at Khouribga; and inadequate oil handling practices (contamination during top-up, storage, and transfer).

## Detectable Symptoms (P Condition)

- Oil particle count exceeding ISO 4406 target cleanliness code (≥2 codes above target)
- Wear metal concentration increasing (Fe, Cu, Sn — trending upward)
- Ferrography showing cutting wear particles (long, thin, ribbon-like morphology)
- Bearing vibration increasing at defect frequencies (spalling from particle indentation)
- Filter ΔP increasing faster than normal (particle loading)
- Visible contamination in oil sample (particles visible to naked eye = severely contaminated)
- Bearing temperature gradually increasing (surface roughness from wear increases friction)
- Seal leakage increasing (worn seal surfaces)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Gearboxes (GB) | Mill gearboxes, conveyor gearboxes, crusher gearboxes | Gear tooth surfaces, rolling element bearings, thrust bearings |
| Pumps (PU) | ET-SLURRY-PUMP bearings, hydraulic pumps | Shaft bearings, gear pump teeth, piston/barrel assemblies |
| Hydraulic systems (HY) | Mobile equipment hydraulics, process hydraulics | Servo valves (most sensitive), pump, cylinders, control valves |
| Compressors (CO) | Air compressors, gas compressors | Crankshaft bearings, piston rings, cylinder liner |
| Electric motors (EM) | Motor bearings (grease-lubricated) | Rolling element bearings, grease |
| Turbines (TU) | Steam turbines, gas turbines | Journal bearings, thrust pads, governor servo valves |
| Engines (EN) | Diesel engines (mobile equipment, generators) | Crankshaft bearings, camshaft bearings, piston rings, cylinder liner |
| Conveyors (CV) | Conveyor gearboxes, pulley bearings | Gearbox bearings and gears, pulley shaft bearings |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Chemical Effects | Oil particle count (ISO 4406 code) | 1–3 months | ISO 4406, ISO 4407 |
| Chemical Effects | Wear metal analysis (ICP-OES or RDE) | 1–3 months | ASTM D5185, D6595 |
| Chemical Effects | Analytical ferrography (particle morphology) | 3–6 months | ASTM D7684, ISO 21018 |
| Vibration Effects | Vibration monitoring (bearing defect frequencies) | 1–4 weeks | ISO 10816, ISO 13373 |
| Primary Effects | Filter ΔP monitoring | Weekly–monthly | OEM specification |
| Human Senses | Oil appearance check (clarity, particles) | Daily–weekly | Industry practice |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Analyze particle count on Gearbox Oil [{tag}]`
- **Acceptable limits**: ISO 4406 target codes per application: gearboxes 18/16/13; hydraulic systems (servo valves) 16/14/11; hydraulic systems (general) 18/16/13; rolling element bearings 17/15/12; journal bearings 19/17/14 per ISO 4406 and Noria/SKF guidelines.
- **Conditional comments**: If particle count exceeds target by 2 ISO codes: investigate contamination source (seal condition, breather effectiveness, fill port contamination), improve filtration. If particle count exceeds by >4 codes: flush and replace oil, inspect/replace seals, install kidney-loop filtration. If wear metals trending upward correlated with contamination: correct contamination first — wear often stops when cleanliness is restored. If servo valve performance degrading: this is the most sensitive indicator — flush system, install 3 μm absolute filtration upstream of servo valves.

### Fixed-Time (for contamination control maintenance)

- **Task**: `Replace oil filter on Hydraulic System [{tag}]`
- **Interval basis**: Filters: replace per ΔP indication or OEM interval (whichever first), typically 1,000–3,000 hours. Desiccant breathers: replace when color change indicates saturation (3–6 months in dusty OCP environment). Seals: inspect at each opportunity, replace proactively at major overhauls. Implement proactive contamination control: upgrade standard breathers to desiccant type, install quick-connect fill ports with integral filtration, use portable filter carts for oil transfer, store oil in sealed containers per ISO 4406 target achievement.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for hydraulic servo valve systems (contamination causes valve seizure within hours), high-speed bearings, or precision gear systems. Acceptable only for low-speed, low-precision applications (open gearing, chain lubrication) where total-loss lubrication or frequent oil change is more practical than contamination control.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Chemical Effects], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with calendar basis]*
