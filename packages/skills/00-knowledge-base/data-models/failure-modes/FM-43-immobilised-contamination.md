# FM-43: Immobilised (binds/jams) due to Contamination

> **Combination**: 43 of 72
> **Mechanism**: Immobilised (binds/jams)
> **Cause**: Contamination
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — contaminant accumulation progressively restricts movement until component seizes; probability of seizure increases gradually with exposure time
> **ISO 14224 Failure Mechanism**: 1.6 Sticking
> **Weibull Guidance**: β typically 1.5–2.5 (moderate wear-out), η 2,000–10,000 hours depending on contamination severity and clearance tolerances

## Physical Degradation Process

Immobilisation due to contamination occurs when foreign particles, corrosion products, process deposits, or biological growth accumulate in the clearance spaces between moving parts, progressively restricting movement until the component binds or seizes completely. The process begins when particles enter the clearance zone between sliding or rotating surfaces — valve stems and packing, actuator pistons and cylinders, bearing races, impeller wear rings. As particles accumulate, friction forces increase, requiring greater force to move the component. Eventually, the accumulated material packs tightly enough to prevent any movement.

The contamination sources vary by application: in slurry service, fine solid particles (phosphate rock fines, calcium sulfate crystals) penetrate seals and settle in low-velocity zones. In pneumatic and hydraulic systems, rust flakes, seal wear particles, and moisture-induced corrosion products migrate to close-tolerance components. In outdoor environments, wind-blown dust and sand enter through degraded seals. The rate of immobilisation depends on particle hardness relative to component materials, clearance tolerances (tighter clearances jam faster), fluid velocity (low velocity allows settling), and seal effectiveness.

In OCP phosphate processing, valve stem seizure is the most common manifestation of this failure mode. Pinch valves and butterfly valves in slurry circuits at Khouribga and Benguerir beneficiation plants are continuously exposed to abrasive phosphate slurry. Fine particles penetrate stem seals and pack around stems, causing the valve to bind during actuation. Similarly, actuator pistons on control valves in phosphoric acid service at Jorf Lasfar experience corrosion product buildup that restricts piston movement, leading to sluggish or failed actuation.

## Detectable Symptoms (P Condition)

- Increased actuating force or torque required to move the component (measurable by actuator pressure or motor current trending)
- Sluggish or delayed response to control signals (valve stroke time increasing >25% from commissioning baseline)
- Valve partial stroke test showing increased friction signature or failure to achieve full stroke
- Audible grinding, squealing, or sticking sounds during operation
- Visible contamination around seals, packing glands, or exposed moving surfaces
- Actuator air supply pressure increasing to maintain same stroke speed (pneumatic valves)
- Position feedback signal showing erratic or stepped movement instead of smooth travel

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Valves (VA) | ET-SLURRY-PUMP discharge valves (CL-VALVE-PINCH), control valves in acid circuits | Valve stem, packing gland, actuator piston, ball/disc guide |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), dosing pumps | Wear ring clearance, shaft sleeves, mechanical seal faces |
| Compressors (CO) | ET-COMPRESSOR instrument air compressors | Valve plates (reciprocating), slide valves (screw), inlet guide vanes |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR take-up mechanisms, screw conveyors | Take-up screw, idler bearings, chain links, screw flights |
| Cranes (CR) | Overhead cranes in maintenance workshops | Wire rope sheaves, hook swivel, slewing ring bearing |
| Control logic units (CL) — actuators | Pneumatic/hydraulic actuators throughout plant | Piston seals, cylinder bore, spring cartridge |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Valve partial stroke testing (PST) | 1–4 weeks | IEC 61508, ISA 84 |
| Primary Effects | Actuator pressure/current trending | 1–4 weeks | OEM specification |
| Primary Effects | Valve signature analysis (stroke time, friction) | 1–6 months | ISA 75.13, NAMUR NE 107 |
| Human Senses | Visual inspection of seals and exposed surfaces | 1–4 weeks | OEM service manual |
| Dynamic Effects | Acoustic monitoring during valve operation | 1–3 months | OEM baseline |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform partial stroke test on Control Valve [{tag}]`
- **Acceptable limits**: Full stroke achieved within ±5% of commissioning stroke time. Breakaway pressure ≤120% of commissioning value. No stiction band >2% of full travel per ISA 75.13.
- **Conditional comments**: If stroke time >125% of baseline: schedule stem cleaning and packing inspection at next opportunity (within 30 days). If valve fails to achieve full stroke: schedule immediate corrective action — risk of fail-to-close/open on demand. If breakaway pressure >150% baseline: plan stem and packing replacement within 14 days.

### Fixed-Time (for severe contamination environments)

- **Task**: `Clean and inspect valve stem and packing on Valve [{tag}]`
- **Interval basis**: Every 6–12 months in slurry service (phosphate circuits). Every 12–24 months in clean fluid service. Coordinate with planned shutdowns for offline valves. Includes stem cleaning, packing replacement, and actuator cylinder inspection.

### Run-to-Failure (applicability criteria)

- **Applicability**: Only for manual valves in non-critical service with no safety function. NEVER for ESD valves, PSVs, or control valves in production-critical loops. If valve seizure could prevent emergency isolation, failure-finding (FFI) via periodic full-stroke testing is mandatory.

---

*Cross-references: [RCM2 Moubray Ch.9 — Failure-Finding for hidden function valves], [ISO 14224 Table B.2 — 1.6 Sticking], [REF-01 §3.4 — FFI strategy for hidden failures]*
