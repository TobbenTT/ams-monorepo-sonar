# FM-18: Corrodes due to Poor electrical insulation

> **Combination**: 18 of 72
> **Mechanism**: Corrodes
> **Cause**: Poor electrical insulation
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — stray current corrosion accelerates as insulation degrades further, increasing leakage current and corrosion rate in a self-reinforcing cycle
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 1.5–2.5 (wear-out), η 20,000–80,000 hours depending on insulation degradation rate, stray current magnitude, and soil/electrolyte resistivity

## Physical Degradation Process

Corrosion due to poor electrical insulation occurs through the mechanism of stray current corrosion — when electrical current leaves its intended conductor path and flows through metallic structures (piping, tanks, structural steel) via the surrounding electrolyte (soil moisture, water, concrete). At the point where stray current exits the metal structure to return to its source (the anodic discharge point), metal dissolution occurs at a rate directly proportional to the current per Faraday's Law: 1 ampere of DC stray current dissolves approximately 9 kg of steel per year. This makes stray current corrosion potentially the most rapid and destructive form of corrosion — far exceeding natural galvanic or environmental corrosion rates.

Stray current sources include: cathodic protection systems with improper current distribution (overprotection of one structure diverts current through adjacent structures); DC transit systems (railways, electric cranes on DC drives); DC welding operations near buried piping; impressed current CP systems with failed insulating joints (current flows through the protected structure to adjacent unprotected structures); and AC power system ground faults creating AC corrosion on buried piping (AC corrosion occurs at ≈1% of the equivalent DC rate but can still cause perforation at current densities >30 A/m²). Poor electrical insulation — degraded insulating flanges, damaged cable insulation, corroded grounding systems, and failed insulating coatings on buried piping — enables these stray currents by providing unintended conductive paths.

The distinguishing characteristic of stray current corrosion is its extreme localization: attack is concentrated at discrete current discharge points where the current leaves the metal to enter the electrolyte, creating deep pits or through-wall perforations in a small area while surrounding metal is completely unaffected. The corrosion products are often absent (dissolved metal ions migrate away from the anode in the electric field), making visual detection difficult — the first indication may be through-wall leakage.

In OCP phosphate processing, stray current corrosion risks include: buried piping near the extensive cathodic protection systems on the Jorf Lasfar slurry pipeline and coastal facilities (improper CP design or failed insulating flanges divert protection current through unprotected structures); DC-powered mobile equipment (electric draglines, battery-powered vehicles) creating ground currents in the mining areas; DC welding operations on structures connected to buried piping systems; railway systems for phosphate rock transport (DC traction current returning through rails creates stray currents that affect adjacent buried piping and structures); and AC power system ground faults at industrial facilities creating transient high-current paths through grounding grids and connected metallic structures.

## Detectable Symptoms (P Condition)

- Localized deep pitting or perforation at discrete points on buried or submerged piping (stray current discharge)
- Pipe-to-soil potential surveys showing interference (positive potential shifts near foreign CP systems)
- Insulating flange resistance below specification (<1 MΩ — indicates insulation failure)
- Unexpected CP current drain (current output increasing without corresponding coating deterioration)
- Through-wall leaks on buried piping at locations inconsistent with general corrosion pattern
- Close-interval potential survey (CIPS) showing potential gradients near DC power sources
- Accelerated corrosion on one side of pipe only (toward current source — directional pattern)
- AC voltage measurable on buried piping near power line crossings (>15V AC = interference risk)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Buried piping (PI) | Slurry pipelines, water pipelines, fire water piping | External pipe wall at current discharge points, coating holidays, insulating joints |
| Storage tanks (TA) | Buried or partially buried tanks, tank farm piping | Tank bottom plates, tank-to-piping connections, grounding connections |
| Structural steel (ST) | Buried structural foundations, piling, sheet piling | Embedded steel, pile surfaces below grade, steel-to-concrete interfaces |
| Cathodic protection (CP) | CP systems on pipelines, tanks, marine structures | Anode beds, junction boxes, insulating flanges, reference electrodes |
| Electrical installations (EI) | Grounding systems, cable trays, conduit | Grounding grid, cable conduit (metallic), tray support connections |
| Cranes (CR) | Electric draglines at Khouribga (DC drive), rail-mounted cranes | Rail-to-ground connections, structural legs, buried cable paths |
| Railways (RW) | Phosphate ore rail transport systems | Rail bonds, buried track structures, adjacent pipeline crossings |
| Marine structures (MS) | Jorf Lasfar port facilities, seawater intake structures | Piling, sheet pile walls, underwater structural connections |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Electrical Effects | Pipe-to-soil potential survey (structure potential monitoring) | 3–12 months | NACE SP0169, ISO 15589-1 |
| Electrical Effects | Close-interval potential survey (CIPS) for stray current detection | 12–24 months | NACE TM0497 |
| Electrical Effects | Insulating flange/joint resistance testing | 12 months | NACE SP0286 |
| Electrical Effects | Stray current monitoring (data loggers at suspect locations) | Continuous during investigation | NACE SP0169 |
| Physical Effects / NDT | ILI (inline inspection) for buried pipeline corrosion mapping | 3–5 years | NACE SP0102, API 1163 |
| Electrical Effects | AC interference measurement near power crossings | 12 months | NACE SP21424, CAN/CSA-C22.3 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform pipe-to-soil potential survey on Pipeline [{tag}]`
- **Acceptable limits**: Pipe-to-soil potential ≤ -850 mV CSE (copper-sulfate electrode) per NACE SP0169 criteria (adequate protection). No positive potential shifts indicating stray current interference. Insulating flange resistance ≥1 MΩ dry per NACE SP0286. AC voltage on buried piping <15V AC per NACE SP21424. No evidence of stray current discharge (abnormal potential gradients).
- **Conditional comments**: If positive potential shift detected: investigate stray current source — install bond or drainage bond to mitigate per NACE SP0169. If insulating flange resistance <1 MΩ: replace insulating gasket set and verify isolation. If through-wall leak at discrete point: excavate, assess damage extent by UT, repair or replace affected section, investigate and mitigate stray current source. If AC interference >15V: install AC mitigation (zinc ribbon grounding, solid-state decoupler, or distributed anodes) per NACE SP21424.

### Fixed-Time (for CP and insulation system maintenance)

- **Task**: `Test insulating flange integrity on Pipeline [{tag}]`
- **Interval basis**: Annual pipe-to-soil potential survey per NACE SP0169 for all CP-protected structures. Insulating flange/joint testing: annually. CP system rectifier output monitoring: monthly. CIPS on critical buried pipelines: every 3–5 years. AC interference assessment at power line crossings: initially and after any power system changes. When new DC power installations are planned (substations, welding shops, DC drives): mandatory stray current impact assessment on adjacent buried structures per NACE SP0169 before commissioning.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for buried piping containing hazardous fluids (slurry pipelines, acid piping, fuel piping) — through-wall penetration causes uncontrolled release with environmental and safety consequences. NEVER acceptable for CP system components (failure removes corrosion protection from the protected structure). Acceptable only for non-critical, above-ground metallic structures where stray current corrosion risk is inherently low and any deterioration is visually detectable before structural failure.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Electrical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
