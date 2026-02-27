# FM-70: Wears due to Mechanical overload

> **Combination**: 70 of 72
> **Mechanism**: Wears
> **Cause**: Mechanical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — overload events are unpredictable; accelerated wear depends on severity and duration of overload conditions
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 0.8–1.5 (mostly random), η highly variable depending on overload magnitude and frequency

## Physical Degradation Process

Wear due to mechanical overload occurs when applied loads exceed the design capacity of the tribological system (the bearing, gear mesh, seal, or sliding surface), causing accelerated material removal. Under normal loading, wear surfaces operate with adequate lubricant film separation (specific film thickness λ > 1.5). When load increases beyond design, the lubricant film is squeezed thinner (film thickness is inversely proportional to load⁰·⁷³ per EHL theory), surface asperities begin to contact, and wear rate increases dramatically — the transition from mild wear (<1 μm/1000 hr) to severe wear (>10 μm/1000 hr) can occur with as little as 25% overload above the design capacity.

Overload wear mechanisms include: adhesive wear (high contact pressure causes localized welding of asperities that tear apart, transferring material); surface fatigue (subsurface shear stress from overload exceeds the material fatigue limit, causing spalling craters); and plastic deformation wear (contact stress exceeds surface hardness, causing material flow and displacement). Gear teeth are particularly susceptible — overload causes pitting on the pitch line where contact stress is highest, and scuffing (adhesive wear) at the tooth tip/root where sliding velocity and contact stress combine.

In OCP phosphate processing, overload-induced wear is common in: crusher liner wear that accelerates when processing harder rock zones (work index varies 10–18 kWh/t across Khouribga zones); pump wear ring clearance that increases rapidly when slurry density exceeds design; conveyor belt cover wear that accelerates during material surge loading; mill liner wear during overcharge conditions; and gearbox gear tooth pitting when transmitted torque exceeds design rating.

## Detectable Symptoms (P Condition)

- Wear rate increasing above historical trend (component consuming faster than predicted)
- Operating load (current, pressure, torque) sustained above design rating
- Oil analysis showing increased wear metals correlated with load events
- Bearing/gear surface showing pitting, scoring, or adhesive wear marks
- Component clearance increasing faster than predicted (wear rings, impeller, liners)
- Product quality degradation from worn components (crusher product oversize, screen miscut)
- Vibration increasing at gear mesh frequencies or bearing defect frequencies
- Component replacement frequency increasing from historical baseline

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Crushers (CU) | ET-CRUSHER liners operating above design capacity | Liners (jaw/mantle/concave), toggle plate, eccentric bushing |
| Pumps (PU) | ET-SLURRY-PUMP at high-density service | Wear rings, impeller, throat bush, shaft sleeve |
| Gearboxes (GB) | Overloaded mill gearboxes, conveyor gearboxes | Gear teeth (pitting, scuffing), shaft bearings, thrust bearings |
| Mills (ML) | Mills operating above design throughput | Liners, lifter bars, grate plates, trunnion bearings |
| Conveyors (CV) | Overloaded belt conveyors | Belt cover, pulley lagging, idler bearings, gearbox |
| Compressors (CO) | Compressors at above-design discharge pressure | Piston rings, cylinder liner, crankshaft bearings, valve seats |
| Valves (VA) | Valves handling abrasive fluid above design velocity | Trim (plug, seat), body bore, stem packing |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Load monitoring (power, current, pressure, flow) | Continuous | Equipment design specification |
| Chemical Effects | Oil analysis (wear metals, particle count) | 1–3 months | ISO 4406, ASTM D5185 |
| Vibration Effects | Vibration monitoring (gear mesh, bearing defects) | 1–4 weeks | ISO 10816, ISO 13373 |
| Physical Effects | Component dimensional measurement at overhaul | Per overhaul | OEM specification |
| Primary Effects | Performance monitoring (efficiency, throughput, quality) | Weekly–monthly | ISO 9906, process specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor operating load on Crusher [{tag}]`
- **Acceptable limits**: Operating load ≤100% of design rating continuously. Wear rate within historical prediction. Wear metals within statistical control limits. Component dimensions within OEM tolerance. Product quality meeting specification.
- **Conditional comments**: If load consistently >100% of design: investigate root cause (process overload, material hardness change, incorrect operation), reduce load to design limit. If wear rate >150% of historical: correlate with load data, adjust maintenance interval proportionally. If gear pitting detected: reduce load, improve lubricant (EP additive), plan gear replacement. If impeller/wear ring clearance increasing rapidly: check slurry density and velocity, schedule component replacement earlier than normal interval.

### Fixed-Time (for overload protection)

- **Task**: `Verify overload protection on Drive System [{tag}]`
- **Interval basis**: Motor protection relay settings verification annually per NETA MTS. Crusher hydraulic relief setting test monthly. Torque limiter/shear coupling function test at each planned shutdown. Load-monitoring instrument calibration every 6–12 months. Process parameter limits review annually (verify that control system limits prevent sustained overload).

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for gearboxes, large bearings, or expensive rotating components where overload wear accelerates destruction. Acceptable for inexpensive, easily replaced sacrificial wear parts (shear pins, fusible links, screen panels) specifically designed to wear out as overload protection.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
