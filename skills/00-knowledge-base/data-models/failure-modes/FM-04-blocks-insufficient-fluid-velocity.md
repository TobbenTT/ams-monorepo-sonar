# FM-04: Blocks due to Insufficient fluid velocity

> **Combination**: 4 of 72
> **Mechanism**: Blocks
> **Cause**: Insufficient fluid velocity
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: D (Random with initial break-in) — velocity-related blockage depends on operating conditions (flow rate, solids concentration) that vary unpredictably; however, newly commissioned or restarted lines have higher risk
> **ISO 14224 Failure Mechanism**: 5.1 Blockage/plugged
> **Weibull Guidance**: β typically 0.8–1.5 (mostly random), η highly variable depending on slurry properties, pipe diameter, and operating regime

## Physical Degradation Process

Blockage due to insufficient fluid velocity occurs when the flow velocity in a conduit drops below the critical deposition velocity (Vc), allowing suspended solids to settle, accumulate, and eventually form a stationary bed that progressively reduces the flow cross-section until complete blockage occurs. For slurry pipelines, the critical deposition velocity depends on particle size, density, concentration, pipe diameter, and pipe inclination. Below Vc, particles begin to saltate (bounce along the pipe bottom), then form a sliding bed, and finally a stationary bed. Each layer of deposited material further reduces the available cross-section, increasing resistance and potentially reducing velocity further — a positive feedback loop that accelerates toward complete blockage.

The critical deposition velocity for phosphate slurry typically ranges from 1.5–3.0 m/s depending on solids concentration (15–35% by weight), particle size distribution (d50 typically 50–200 μm), and pipe diameter (100–500 mm). Operating below Vc can occur during: pump speed reduction (intentional turndown or VFD slowdown), partial system shutdown (reduced demand leaving some pipeline branches at sub-critical velocity), pump wear (impeller diameter loss reducing output head and flow), and startup/shutdown transitions where velocity passes through the settling zone. Horizontal pipe runs and upward-inclined sections are most susceptible; vertical and downward-inclined sections are less affected due to gravity-assisted transport.

In OCP phosphate processing, velocity-related blockage is a critical operational concern in: long-distance slurry pipelines from Khouribga to Jorf Lasfar (187 km — the world's longest phosphate slurry pipeline, where maintaining minimum velocity across the entire profile including elevation changes is essential); launders and gravity flow channels at beneficiation plants; pipeline branches serving multiple destinations where flow splitting reduces velocity below Vc in some branches; cyclone feed distributor pipes where uneven distribution causes some paths to receive insufficient flow; and tailings disposal pipelines that operate at variable throughput.

## Detectable Symptoms (P Condition)

- Pipeline velocity falling below design minimum (measured by electromagnetic flow meter or ultrasonic Doppler)
- Increasing pipeline pressure drop at constant flow rate (deposited bed increases friction)
- Rising pump discharge pressure for same flow rate (pipeline resistance increasing)
- Density meter at pipeline discharge showing lower density than inlet (solids depositing in line)
- Pipeline vibration pattern change (bed formation creates flow turbulence detectable by accelerometer)
- Gravity flow channels showing reduced freeboard and material accumulation
- Partial blockage symptoms: intermittent flow surges as bed material is periodically flushed and re-deposited
- Pump power consumption decreasing without flow rate decrease (characteristic of bed formation reducing effective pipe diameter)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Khouribga-Jorf Lasfar slurry pipeline, beneficiation slurry lines, tailings pipelines | Horizontal straight sections, pipeline low points, branch connections, upward inclines |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), booster pumps on slurry pipelines | Suction piping (low velocity at turndown), pump casing (solids settling during shutdown) |
| Valves (VA) | Slurry isolation valves, diverter valves, control valves | Valve body cavities (dead zones during partial opening), bypass lines |
| Gravity flow channels (GF) | Launders, troughs, distribution channels at beneficiation plants | Channel bends, flat-bottom sections, junction points, weir areas |
| Storage tanks (TA) | Slurry mixing tanks, settling tanks, agitated feed tanks | Tank bottom (solids accumulation), outlet nozzle (rat-holing), agitator suction zone |
| Heat exchangers (HE) | Slurry coolers, process fluid heaters handling suspensions | Tube-side (horizontal tubes), shell-side baffled zones (low-velocity pockets) |
| Hydrocyclones (HC) | Classification cyclones, desliming cyclones | Feed distribution piping, individual cyclone feed branches |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Pipeline flow velocity monitoring (electromagnetic or ultrasonic) | Continuous | Durand equation, Wilson model (slurry design) |
| Primary Effects | Pipeline pressure drop trending vs. flow rate | Continuous–daily | Pipeline hydraulic design specification |
| Primary Effects | Slurry density measurement at inlet/outlet | Continuous | ISO 12242, ASTM D4380 |
| Vibration Effects | Pipeline vibration monitoring (bed detection) | Continuous–weekly | Industry practice (flow-induced vibration) |
| Human Senses | Visual inspection of gravity channels for accumulation | Daily–weekly | Operational procedure |
| Primary Effects | Pump performance monitoring (head-flow curve shift) | Weekly–monthly | ISO 9906 |

## Maintenance Strategy Guidance

### Condition-Based (preferred — operations-driven)

- **Primary task**: `Monitor slurry velocity on Pipeline [{tag}]`
- **Acceptable limits**: Velocity ≥ 1.2 × critical deposition velocity (Vc) at all operating conditions per pipeline design specification. For OCP phosphate slurry (d50 100 μm, SG 2.7, Cv 20–30%): typical Vc 2.0–2.5 m/s, minimum operating velocity 2.5–3.0 m/s. Pressure drop within ±20% of clean-pipe design curve at operating flow rate.
- **Conditional comments**: If velocity drops to 1.0–1.2 × Vc: increase pump speed or reduce solids concentration to restore velocity within 4 hours. If velocity <1.0 × Vc for >30 minutes: initiate water flush cycle to re-suspend deposited solids before bed consolidates. If pressure drop increasing >30% at constant flow: partial bed has formed — schedule high-velocity flush (1.5 × normal velocity for 30 minutes) or pigging operation. If complete blockage occurs: do NOT increase pump pressure (risk of pipeline rupture) — isolate, assess, and plan mechanical clearing or section replacement.

### Fixed-Time (for pipeline integrity)

- **Task**: `Flush slurry pipeline with water on Pipeline [{tag}]`
- **Interval basis**: Water flush at every planned shutdown (before pipeline sits idle >4 hours) to prevent solids settling and consolidation. For pipelines that operate intermittently: mandatory flush within 2 hours of shutdown, mandatory re-slurry sequence before restart. For gravity channels: manual clean-out at regular intervals based on accumulation rate (typically weekly to monthly). Pipeline pigging: every 6–12 months for long-distance pipelines to remove residual deposits and verify internal condition.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for long-distance slurry pipelines (Khouribga-Jorf Lasfar) — complete blockage in a 187 km pipeline would require weeks to clear and represents massive production loss. NEVER acceptable for pipelines transporting materials that set or consolidate (cement slurry, gypsum, calcium carbonate) — once hardened, mechanical clearing may be impossible. Acceptable only for short, easily accessible gravity channels with simple clean-out access and low-consequence service.

---

*Cross-references: [RCM2 Moubray Ch.5 — Functional Failures (loss of throughput)], [ISO 14224 Table B.2 — 5.1 Blockage/plugged], [REF-01 §3.5 — CB strategy with operational basis]*
