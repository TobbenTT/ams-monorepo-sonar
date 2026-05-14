# FM-66: Wears due to Excessive fluid velocity

> **Combination**: 66 of 72
> **Mechanism**: Wears
> **Cause**: Excessive fluid velocity
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — erosive wear is progressive with cumulative throughput; material removal rate is predictable from velocity, particle characteristics, and material properties
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 2.0–4.0 (wear-out), η 3,000–20,000 hours depending on velocity, particle hardness/concentration, and material erosion resistance

## Physical Degradation Process

Wear due to excessive fluid velocity occurs when fluid carrying suspended particles impacts component surfaces at velocities exceeding the design erosion threshold, causing accelerated material removal through particle impact and cutting mechanisms. The erosion rate follows a power-law relationship with velocity (E ∝ V^n, where n = 2.0–3.0 for ductile metals, n = 2.5–4.0 for brittle materials) — doubling the velocity increases the erosion rate by 4–8× for metals and 6–16× for ceramics/linings. This strong velocity dependence means that even small velocity increases above design can dramatically accelerate wear.

The erosion mechanism depends on the particle impact angle: at low angles (15–30°), ductile materials experience maximum erosion through micro-cutting and plowing; at high angles (75–90°), brittle materials experience maximum erosion through surface fatigue and fracture. This means that elbows and bends (where particles impact at oblique angles) erode differently than straight pipe walls or impingement surfaces. Flow disturbances (turbulence, secondary flows, vortex shedding) create localized velocity amplification that causes preferential erosion patterns.

In OCP phosphate processing, velocity-related erosive wear is critical in: slurry pipeline elbows on the Khouribga-Jorf Lasfar pipeline where centrifugal force concentrates particles against the outer wall at velocities up to 4 m/s; pump casing cut-water areas where local velocity reaches 2–3× average pipe velocity; hydrocyclone internal surfaces especially at the apex where vortex velocity is highest; choke valves and control valves where pressure drop accelerates fluid to erosive velocities; and jet mixing nozzles in phosphoric acid reactors.

## Detectable Symptoms (P Condition)

- Wall thinning measurable by UT at known erosion-prone locations (elbows, tees, downstream of restrictions)
- Erosion rate (mm/year) trending above design corrosion/erosion allowance per API 574
- Characteristic erosion patterns visible during internal inspection (horseshoe pattern at elbows, cat-eye at tees)
- Pump efficiency declining (impeller and casing eroding changes hydraulic geometry)
- Pressure drop across piping sections increasing (increased roughness from erosion)
- Localized wall thinning detectable by guided-wave UT or radiographic profile
- External temperature anomalies at thinned sections (thermography)
- Increasing frequency of leak events at erosion-prone locations

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Khouribga-Jorf Lasfar slurry pipeline, process slurry piping | Elbows, tees, reducers, downstream of valves/orifices |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), dredge pumps | Impeller vanes, casing cut-water, throat bush, suction liner |
| Valves (VA) | Slurry control valves, choke valves, knife gate valves | Trim (plug, seat), body bore, downstream body wall |
| Hydrocyclones (HC) | Classification cyclones, desliming cyclones | Apex (spigot), vortex finder, cylinder section, inlet feed chamber |
| Heat exchangers (HE) | Slurry-side tubes, shell-side baffles in slurry service | Tube inlet sections, baffle edges, impingement plates |
| Nozzles (NO) | Jet mixing nozzles, spray nozzles, eductor nozzles | Nozzle bore, mixing chamber, diffuser |
| Storage tanks (TA) | Agitated slurry tanks with inlet nozzles | Tank wall opposite inlet, agitator baffles, outlet nozzle |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | UT wall thickness at erosion-prone locations | 1–6 months | API 574, ASME B31.3 |
| Physical Effects / NDT | Guided-wave UT for screening large pipe areas | 6–12 months | ASTM E2775 |
| Physical Effects / NDT | Radiographic wall thickness profiling | 6–12 months | ASME V Article 2 |
| Primary Effects | Velocity monitoring (flow rate ÷ pipe area) | Continuous | API RP 14E, pipeline design spec |
| Primary Effects | Pump performance trending (head, flow, efficiency) | Monthly–quarterly | ISO 9906 |
| Physical Effects | Dimensional inspection of wear components at overhaul | Per overhaul | OEM specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure wall thickness on Pipeline Elbow [{tag}]`
- **Acceptable limits**: Wall thickness ≥ minimum design thickness per ASME B31.3 / API 574. Erosion rate within design allowance (typically ≤0.5 mm/year for lined pipe, ≤2.0 mm/year for unlined carbon steel in slurry service). Fluid velocity ≤design maximum (typically 3–4 m/s for phosphate slurry per pipeline design). Remaining life ≥ 2× inspection interval.
- **Conditional comments**: If wall at 120–150% of minimum: monitor quarterly, plan replacement at next shutdown. If wall at 100–120% of minimum: plan replacement within 30 days. If wall at or below minimum: remove from service immediately per API 574. If erosion rate increasing: investigate velocity increase (pump speed change, pipeline diameter reduction from deposits, valve position changes). Consider upgrading material at high-erosion locations (chromium carbide overlay, basalt lining, ceramic tiles).

### Fixed-Time (for wear component replacement)

- **Task**: `Replace pump wear components on Slurry Pump [{tag}]`
- **Interval basis**: Based on historical wear rate and component dimensions. Typical: slurry pump impeller 3,000–10,000 hours (depending on material — high-chrome iron lasts 3–5× cast iron); pipeline elbows 12–36 months (depending on velocity and lining); hydrocyclone apex 1,000–5,000 hours; valve trim 5,000–15,000 hours. Always validate with thickness measurement. Design velocity control: maintain minimum transport velocity but avoid excessive velocity (operate within 1.2–1.5× Vc for slurry per Durand equation).

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressurized slurry piping — through-wall erosion causes high-velocity slurry jet (lethal injury risk at >5 bar). Acceptable only for non-pressurized, secondary containment-protected wear elements (gravity chute liners, open-channel wear plates) where through-wall erosion causes manageable spillage.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects (NDT)], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
