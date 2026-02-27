# FM-52: Overheats/Melts due to Mechanical overload

> **Combination**: 52 of 72
> **Mechanism**: Overheats/Melts
> **Cause**: Mechanical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — mechanical overload events causing overheating are unpredictable; driven by process upsets, abnormal loads, or misoperation
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on overload margin and thermal mass

## Physical Degradation Process

Overheating due to mechanical overload occurs when excessive mechanical loads increase frictional forces, contact pressures, and hydrodynamic shear in bearings, gears, seals, and coupling surfaces beyond the heat dissipation capacity. The mechanisms include: bearing overheating when radial or axial loads exceed the bearing's dynamic load rating, crushing the lubricant film and generating metal-to-metal contact heat; gear tooth overheating when transmitted torque exceeds the gear's thermal rating, causing lubricant film breakdown at the pitch line; seal overheating when shaft deflection from overload increases seal face contact pressure and generates excess friction heat; and coupling overheating when misalignment from overload-induced deflection causes sliding friction at coupling surfaces.

The critical difference from FM-51 (overheating from lack of lubrication) is that here the lubricant supply is adequate but the mechanical load exceeds what the lubricant film can support — the specific film thickness (λ = h_min / σ_composite) drops below 1.0 due to increased load rather than decreased lubricant availability. The overheating is a consequence of exceeding the bearing's load-speed-viscosity envelope rather than lubricant deficiency.

In OCP phosphate processing, mechanical overload-induced overheating occurs when: crusher bearings overheat from processing abnormally hard rock or tramp metal; slurry pump bearings overheat from increased hydraulic loads (high-density slurry, downstream valve throttling); conveyor drive gearboxes overheat during material surge loading or belt jam conditions; mill bearings overheat during charge buildup or liner failure; and compressor bearings overheat during high-pressure discharge conditions.

## Detectable Symptoms (P Condition)

- Bearing temperature rising while lubricant level/condition is normal (distinguishes from FM-51)
- Operating load (current, pressure, torque) simultaneously elevated above normal range
- Bearing vibration increasing in low-frequency range (1×, 2× shaft speed — load-related harmonics)
- Mechanical seal leakage rate increasing (shaft deflection from overload)
- Gearbox oil temperature exceeding OEM limit despite adequate oil level and cooler function
- Coupling element temperature elevated (elastomeric coupling: softening; gear coupling: scoring)
- Equipment slowing down or stalling under load
- Protection system alarms (motor overcurrent, high bearing temperature, high gearbox pressure)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Crushers (CU) | ET-CRUSHER (jaw, cone, gyratory) | Main shaft bearings, eccentric bearings, spider bearing |
| Pumps (PU) | ET-SLURRY-PUMP, ET-CENTRIFUGAL-PUMP | Shaft bearings, mechanical seal, thrust bearing |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL | Trunnion bearings, pinion bearings, ring gear mesh |
| Gearboxes (GB) | Mill gearboxes, conveyor drive gearboxes | Gear tooth contact surfaces, shaft bearings, thrust bearings |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR drives, bucket elevator drives | Drive pulley bearings, gearbox, coupling |
| Compressors (CO) | Process air compressors, instrument air compressors | Crankshaft bearings, crosshead bearings, piston rings |
| Fans (FA) | Large ID/FD fans | Shaft bearings, coupling, drive components |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Bearing temperature monitoring | Continuous–weekly | ISO 10816, OEM specification |
| Vibration Effects | Vibration monitoring (load-related patterns) | 1–4 weeks | ISO 10816, ISO 13373 |
| Primary Effects | Load monitoring (motor current, process parameters) | Continuous | Equipment design specification |
| Chemical Effects | Lubricant analysis (thermal degradation markers) | 1–3 months | ASTM D6224, ISO 4406 |
| Temperature Effects | Gearbox oil temperature monitoring | Continuous | OEM specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor bearing temperature and load on Crusher [{tag}]`
- **Acceptable limits**: Bearing temperature within OEM specification at rated load. Motor current ≤100% FLA. Gearbox oil temperature ≤OEM maximum (typically 80–95°C). No mechanical seal leakage above normal weepage. Vibration within ISO 10816 zone B.
- **Conditional comments**: If bearing temperature rising with simultaneous load increase: reduce load to rated within 1 hour, investigate load source. If bearing temperature rising at normal load: check lubricant (this may actually be FM-51), check alignment, check bearing condition. If gearbox oil temperature exceeds limit: reduce load, verify oil cooler function. If repeated overload events: investigate process controls, consider installing overload protection (shear pins, torque limiters, slip clutches).

### Fixed-Time (for overload protection verification)

- **Task**: `Test overload protection on Crusher Drive [{tag}]`
- **Interval basis**: Verify motor thermal overload settings annually per NETA MTS. Test torque limiter / shear pin function at each planned shutdown. Verify high-temperature alarm and trip set-points on bearing temperature monitors quarterly. For crushers: verify hydraulic relief system function monthly (prevents sustained mechanical overload on main bearings).

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for large rotating equipment (mills, crushers, large pumps) — overheating-induced bearing seizure causes extended downtime (bearing replacement 1–4 weeks). Acceptable only for small, non-critical equipment with adequate thermal protection (thermal overload, high-temp trip) where unplanned shutdown is tolerable and spare parts are immediately available.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — CB strategy with operational basis]*
