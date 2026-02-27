# FM-55: Severs (cut, tear, hole) due to Abrasion

> **Combination**: 55 of 72
> **Mechanism**: Severs (cut, tear, hole)
> **Cause**: Abrasion
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — abrasive severing is progressive with cumulative throughput or operating hours; material removal rate is relatively predictable based on abrasive characteristics and contact conditions
> **ISO 14224 Failure Mechanism**: 2.3 Erosion
> **Weibull Guidance**: β typically 2.0–4.0 (wear-out), η 2,000–15,000 hours depending on abrasive particle hardness, material hardness, and contact geometry

## Physical Degradation Process

Severing due to abrasion occurs when hard particles in contact with a softer surface progressively remove material through cutting, plowing, and micro-fracture mechanisms until the wall section is completely penetrated, creating a hole, cut, or tear. This differs from general wear (which reduces dimensions) in that severing represents through-wall penetration — the transition from a contained system to a breached one. The material removal rate follows Archard's equation, proportional to contact pressure, sliding distance, and the ratio of abrasive hardness to surface hardness.

Three-body abrasion (loose particles between two surfaces) is the dominant mechanism in slurry transport systems: phosphate rock particles (Mohs hardness 5–6 for apatite, 7 for quartz inclusions) carried in process fluid contact pipe walls, pump casings, and valve bodies. Two-body abrasion occurs at belt conveyor contact surfaces where material slides against wear plates and chute liners. The penetration rate accelerates once wall thinning begins because: reduced wall thickness increases local stress (hoop stress in piping is inversely proportional to wall thickness), reduced material cross-section increases local temperature, and flow turbulence increases at thinned sections creating localized erosion vortices.

In OCP phosphate processing, abrasive severing is one of the highest-frequency failure modes due to the inherent abrasiveness of phosphate ore. Critical locations include: slurry pipeline elbows and bends at Khouribga (where centrifugal force concentrates particles against the outer wall — the "erosion elbow" pattern); pump casing cut-water areas on ET-SLURRY-PUMP units (where velocity is highest); hydrocyclone apex and vortex finder tips; belt conveyor transfer chutes and impact zones at Benguerir; and filter cloth on ET-BELT-FILTER units where fine abrasive particles perforate the weave. The quartz content of OCP phosphate ore (5–15% SiO₂) is the primary driver — quartz at Mohs 7 is harder than most liner materials.

## Detectable Symptoms (P Condition)

- Wall thickness trending below minimum per API 574 corrosion/erosion allowance (UT thickness measurement)
- Wall thickness rate-of-loss >0.5 mm/year sustained (indicates aggressive abrasive service)
- Visible wear grooves, channels, or thinning patterns on internal surfaces during inspection
- Localized hot spots on pipe/vessel exterior detectable by thermography (thinned wall conducts more heat)
- Increasing leak rate at pump casing or valve body (weeping through thinned sections)
- Belt conveyor material spillage at transfer points (chute liner perforation)
- Filter cloth blinding or hole formation (increased pressure drop with reduced filtrate clarity)
- Acoustic emission activity at pipe elbows and pump casings (particle impact signatures)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Slurry pipelines (Khouribga-Jorf Lasfar), tailings pipelines | Elbows, tees, reducers, straight sections at high-velocity zones |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), dredge pumps | Pump casing (cut-water), impeller vanes, throat bush, suction liner |
| Valves (VA) | ET-SLURRY-PUMP discharge valves (CL-VALVE-PINCH), knife gate valves | Valve body/liner, seat faces, disc/gate, pinch tube |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR transfer chutes, bucket elevator casings | Chute liner plates, wear plates, skirt rubber, belt surface |
| Filters and strainers (FS) | ET-BELT-FILTER (CL-FILTER-CLOTH), vacuum drum filters | Filter cloth, filter plate frames, drainage channels |
| Hydrocyclones (HC) | Classification cyclones at Khouribga/Benguerir | Apex liner, vortex finder, cylinder liner, inlet feed chamber |
| Storage tanks (TA) | Slurry mixing tanks, agitated feed tanks | Tank floor (settled solids abrasion), agitator baffles, overflow weirs |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Ultrasonic thickness measurement (UT) | 1–6 months | API 574, ASME B31.3 |
| Physical Effects / NDT | Radiographic thickness profiling (RT) | 6–12 months | ASME V Article 2 |
| Physical Effects / NDT | Acoustic emission monitoring at elbows | 1–3 months | ASTM E1932, EN 13554 |
| Temperature Effects | Thermography for wall thinning detection | 1–3 months | ISO 18434-1 |
| Human Senses | Visual inspection of accessible liner surfaces | 1–4 weeks | API 574, ASME PCC-2 |
| Primary Effects | Leak detection (visual, acoustic) | Continuous–daily | EN 1779 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure wall thickness on Slurry Pipe Elbow [{tag}]`
- **Acceptable limits**: Wall thickness ≥ minimum design thickness + corrosion/erosion allowance per API 574. Rate-of-loss used to predict remaining life — intervene when remaining life <2× inspection interval. For slurry piping: minimum 60% of original nominal wall thickness. For pump casings: minimum thickness per OEM specification.
- **Conditional comments**: If wall at 110–130% of minimum: increase monitoring frequency to monthly, plan replacement at next outage. If wall at 100–110% of minimum: schedule replacement within 30 days. If wall at or below minimum design thickness: remove from service immediately per API 574 — risk of sudden rupture. If rate-of-loss increasing: investigate process changes (slurry density, velocity, particle size distribution).

### Fixed-Time (for predictable abrasive environments)

- **Task**: `Replace chute liner plates on Conveyor Transfer [{tag}]`
- **Interval basis**: Based on historical wear rate and liner thickness. Typical intervals: slurry pipe elbows (Ni-Hard or chrome carbide overlay) 6–18 months; pump casing liners 3,000–8,000 operating hours; conveyor chute liners (AR400/AR500) 6–12 months; hydrocyclone apex liners 1,000–4,000 hours; filter cloth 500–2,000 hours depending on slurry abrasiveness. Always measure actual thickness to validate/adjust interval.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressurized slurry piping or pump casings — through-wall penetration causes high-velocity slurry jet release (erosive and potentially lethal at operating pressures >5 bar). Acceptable only for non-pressurized, non-hazardous wear surfaces where perforation causes minor spillage with secondary containment available — e.g., gravity chute liner plates with spill collection.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.3 Erosion], [REF-01 §3.5 — CB strategy with operational basis]*
