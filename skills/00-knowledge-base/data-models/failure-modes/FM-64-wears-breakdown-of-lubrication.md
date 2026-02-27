# FM-64: Wears due to Breakdown of lubrication

> **Combination**: 64 of 72
> **Mechanism**: Wears
> **Cause**: Breakdown of lubrication
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — lubricant effectiveness degrades progressively with operating hours; wear rate increases predictably as lubricant condition deteriorates
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 5,000–25,000 hours depending on lubricant quality, operating temperature, and contamination level

## Physical Degradation Process

Wear due to breakdown of lubrication occurs when the lubricant's protective properties degrade to the point where it can no longer maintain an adequate separating film between moving surfaces, resulting in metal-to-metal contact and accelerated material removal. Lubricant breakdown mechanisms include: oxidation (thermal and catalytic) that increases viscosity, forms sludge and varnish, and generates acids; thermal cracking at hot spots that reduces viscosity below the minimum for film formation; additive depletion (anti-wear, EP, anti-oxidant additives are consumed during service); water contamination that hydrolyzes additives and creates emulsions with poor lubricity; and shear thinning of viscosity index improvers in multi-grade oils.

The transition from adequate to inadequate lubrication is gradual — the specific film thickness (λ) decreases as lubricant properties deteriorate until λ drops below 1.0 (boundary lubrication) and asperity contact begins. Initial contact is mild (adhesive micro-wear) but escalates rapidly as wear debris contaminates the lubricant further, creating an autocatalytic degradation cycle. The wear mode transitions from mild oxidative wear (~1 μm/1000 hours) to severe adhesive/abrasive wear (~10–100 μm/1000 hours) once the lubricant film collapses.

In OCP phosphate processing, lubrication breakdown-driven wear is accelerated by: high operating temperatures in mill and crusher gearboxes (oil sump temperatures 70–90°C accelerate oxidation); contamination ingress (phosphate dust, water, process material through failed seals); extended oil change intervals on equipment that is difficult to shut down; mixing of incompatible lubricants during top-ups; and use of incorrect viscosity grade (common when OEM-specified lubricant is not available and substitutes are used).

## Detectable Symptoms (P Condition)

- Oil analysis showing: oxidation increase (FTIR absorption >25 abs/cm), viscosity change >20%, TAN >2.0 mg KOH/g
- Wear metal concentration increasing trend (Fe, Cu, Sn, Al, Cr — element depends on worn component material)
- Varnish or sludge deposits visible on equipment surfaces during inspection
- Bearing/gear surface showing micro-pitting, scoring, or adhesive wear marks
- Vibration increasing in high-frequency range (bearing defect frequencies emerging)
- Bearing temperature rising at constant load (increased friction from poor lubrication)
- Oil appearance degraded (dark, hazy, odorous, or thick)
- Filtration ΔP increasing (breakdown products loading filters)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Gearboxes (GB) | Mill gearboxes, conveyor gearboxes, crusher gearboxes | Gear tooth surfaces, shaft bearings, thrust bearings |
| Pumps (PU) | ET-SLURRY-PUMP bearings, ET-CENTRIFUGAL-PUMP bearings | Shaft bearings (rolling element and sleeve), thrust bearings |
| Compressors (CO) | Screw compressors, reciprocating compressors | Crankshaft bearings, crosshead pins, cylinder liners |
| Electric motors (EM) | Large motor bearings (>50 kW) | Drive-end and non-drive-end bearings |
| Conveyors (CV) | ET-BELT-CONVEYOR drive components, idler bearings | Drive pulley bearings, gearbox, idler bearings |
| Crushers (CU) | ET-CRUSHER main shaft, eccentric bearings | Main shaft bearing, eccentric bearing, toggle seats |
| Turbines (TU) | Steam turbines (cogeneration), hydraulic turbines | Journal bearings, thrust bearings, governor mechanism |
| Engines (EN) | Diesel engines (mobile equipment, generators) | Crankshaft bearings, piston rings, camshaft, valve train |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Chemical Effects | Oil analysis (oxidation, viscosity, TAN, wear metals) | 1–3 months | ASTM D974, D445, D6224, E2412, ISO 4406 |
| Chemical Effects | Ferrography (wear particle morphology and severity) | 3–6 months | ASTM D7684, ISO 21018 |
| Vibration Effects | Vibration monitoring (bearing defect frequencies) | 1–4 weeks | ISO 10816, ISO 13373 |
| Temperature Effects | Bearing temperature monitoring | Continuous–weekly | ISO 10816, OEM specification |
| Human Senses | Oil appearance and level check | Daily–weekly | OEM manual |
| Chemical Effects | Oil filter debris analysis | At each filter change | Industry practice |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Analyze lubricant condition on Gearbox [{tag}]`
- **Acceptable limits**: TAN ≤2.0 mg KOH/g per ASTM D974. Viscosity within ±15% of nominal grade per ISO 3448. Oxidation ≤25 abs/cm per ASTM E2412. Water ≤200 ppm. Wear metals within statistical trend (no step-change increase). Particle count within target per ISO 4406.
- **Conditional comments**: If TAN 2.0–4.0 or oxidation 25–50 abs/cm: plan oil change within 30 days. If TAN >4.0 or wear metals trending sharply upward: change oil immediately AND investigate wear source. If varnish detected: consider varnish removal system (electrostatic precipitator) before oil change. If viscosity dropped >20%: suspect thermal cracking or fuel dilution, investigate root cause. Track oil analysis trends to optimize change intervals — extend if oil consistently within limits, shorten if degradation is rapid.

### Fixed-Time (for oil change programs)

- **Task**: `Change lubricating oil on Gearbox [{tag}]`
- **Interval basis**: Per OEM recommendation validated by oil analysis trend data. Typical: mineral oil in enclosed gearboxes 4,000–8,000 hours; synthetic PAO/PAG 8,000–16,000 hours; engine oil per OEM (typically 250–500 hours for diesel). Adjust interval for OCP conditions: reduce by 30% if operating temperature consistently >80°C; reduce by 50% if contamination above target despite filtration. Always perform oil analysis at change to validate interval.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for critical bearings or gear systems — lubrication breakdown causes accelerating wear that destroys components within weeks once the film collapses. Acceptable only for non-critical, small, sealed-for-life bearings (e.g., sealed conveyor idler bearings) where the factory lubricant is designed to last the bearing's rated life.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Chemical Effects], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
