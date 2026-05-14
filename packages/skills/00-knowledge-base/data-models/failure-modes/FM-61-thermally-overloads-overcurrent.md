# FM-61: Thermally Overloads (burns, overheats, melts) due to Overcurrent

> **Combination**: 61 of 72
> **Mechanism**: Thermally Overloads (burns, overheats, melts)
> **Cause**: Overcurrent
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — overcurrent events are driven by electrical faults, protection coordination failures, and power quality events; not age-related
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on protection coordination, fault clearing time, and conductor sizing margin

## Physical Degradation Process

Thermal overload due to overcurrent occurs when electrical current flowing through conductors, connections, or components exceeds their continuous thermal rating due to electrical causes (as distinct from FM-60 where the overcurrent is driven by mechanical overload). The primary electrical causes include: phase imbalance creating negative-sequence current that generates double-frequency heating in motor rotors; single-phasing (loss of one phase) forcing the motor to draw √3 times normal current on remaining phases; voltage depression (brownout) causing motors to draw higher current to maintain torque; harmonic distortion from VFDs and non-linear loads creating additional resistive heating; and inadequate conductor sizing where cables are loaded beyond their ampacity rating.

The thermal damage mechanism follows Joule's law (P = I²R): heat generation increases with the square of current. For motor windings, negative-sequence current is particularly damaging because it induces counter-rotating fields in the rotor, generating localized heating in rotor bars and end rings at approximately 6× the rate of positive-sequence current of the same magnitude. Single-phasing is an extreme form of voltage imbalance that can burn out a motor winding within minutes if not detected. Harmonic currents (5th, 7th, 11th) generate additional heating in proportion to the total harmonic distortion (THD) squared, and this heating is not detected by conventional thermal overload relays calibrated for fundamental frequency only.

In OCP phosphate processing, overcurrent thermal failures are driven by several site-specific factors: the extensive MV distribution network across Khouribga mining sites is susceptible to phase loss during cable faults in the overhead line network; VFD-driven slurry pumps and conveyor drives generate significant harmonics (typical THD-I 25–40%) that overload neutral conductors and transformer windings; voltage depression during simultaneous DOL starting of large mill motors at Benguerir causes running motors to draw excess current; and undersized cables in legacy installations (pre-1990 wiring at some Khouribga sites) are loaded beyond original ampacity ratings due to incremental load additions over decades.

## Detectable Symptoms (P Condition)

- Phase current imbalance >5% measured at motor terminals or MCC (per NEMA MG-1 derating requirements)
- Voltage imbalance >2% at the point of common coupling (per IEEE 141)
- Neutral conductor temperature elevated above phase conductors (indicates harmonic loading)
- Motor running current exceeding nameplate at rated voltage with load within normal range (indicates electrical cause)
- Cable surface temperature above ampacity rating detectable by thermography (>70°C for PVC, >90°C for XLPE)
- Transformer winding temperature exceeding rated rise (OA: 65°C rise, ONAN: 65°C per IEC 60076)
- THD-I measurement >15% at VFD output or >8% at point of common coupling (per IEEE 519)
- Protection relay logging frequent overcurrent alarms without tripping (indicates chronic moderate overload)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electric motors (EM) | ET-SAG-MILL drive (CL-MOTOR-HV), ET-BALL-MILL drive, ET-SLURRY-PUMP drive | Stator winding (phase imbalance heating), rotor bars/end rings (negative-sequence heating) |
| Power transformers (PT) | Distribution transformers feeding VFD loads, rectifier duty transformers | Winding insulation (harmonic heating), core (harmonic flux losses), neutral connection |
| Power cables and terminations (PC) | MV/LV feeder cables, cable trays with multiple circuits | Conductor insulation (overtemperature), neutral conductors (triplen harmonics), cable joints |
| Switchgear (SG) | LV MCC panels, LV distribution boards, bus bar trunking | Bus bar connections (loose joints heating), breaker contacts (pitting from harmonics), neutral bus |
| Frequency converters (FC) | VFDs on ET-SLURRY-PUMP, ET-BELT-CONVEYOR, ET-COMPRESSOR | Input rectifier (line-side harmonics), DC link capacitors (ripple current heating), output transistors |
| Capacitor banks (CB) | Power factor correction capacitors at substations | Capacitor elements (harmonic resonance amplification), fuses, discharge resistors |
| Uninterruptible power supply (UP) | UPS systems at control rooms, critical process computers | Inverter output stage, battery connections, input rectifier |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Electrical Effects | Phase current and voltage balance monitoring | Continuous–weekly | NEMA MG-1 §14.36, IEC 60034-26 |
| Electrical Effects | Power quality analysis (harmonics, THD) | 3–6 months | IEEE 519, IEC 61000-4-7 |
| Temperature Effects | Thermography of cables, connections, and motor frames | 1–3 months | NETA MTS, ISO 18434-1 |
| Temperature Effects | Motor winding temperature monitoring (RTD/thermocouple) | Continuous | IEEE 1, IEC 60034-11 |
| Electrical Effects | Neutral current measurement | Monthly–quarterly | IEEE 519, NFPA 70B |
| Primary Effects | Protection relay event log review | Monthly | IEC 61850, IEEE C37.2 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure phase balance on Motor Circuit [{tag}]`
- **Acceptable limits**: Voltage imbalance ≤2% per NEMA MG-1 §14.36 (derate motor 3–5% per 1% imbalance above 1%). Current imbalance ≤5% under balanced load. THD-V ≤5% at PCC per IEEE 519. Neutral current ≤fundamental phase current × 0.1 for balanced systems. Cable temperature ≤rated ampacity temperature (70°C PVC, 90°C XLPE per IEC 60502).
- **Conditional comments**: If voltage imbalance 2–3%: investigate supply, apply NEMA derating factor, correct within 90 days. If voltage imbalance >3% or single phase detected: trip motor immediately — single-phasing can destroy rotor within 2–10 minutes. If THD-I >15% at VFD: install output reactor or sine-wave filter, verify cable derating per IEEE 519. If neutral current >30% of phase current: investigate triplen harmonics, verify neutral conductor sizing.

### Fixed-Time (for protection coordination verification)

- **Task**: `Verify protection settings on Motor Protection Relay [{tag}]`
- **Interval basis**: Review and test motor protection relay settings every 3 years per NETA MTS. Verify: thermal overload curve matches motor thermal damage curve, negative-sequence protection enabled (I₂ trip at 15–25% of I_rated for <5 seconds per IEC 60034-1), ground fault protection set appropriately. For VFD-fed motors: verify protection includes harmonic heating compensation. Power quality survey every 12 months per IEEE 519 to detect changing harmonic environment as new VFDs are added.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for motors >15 kW or motors in critical service — overcurrent burnout requires motor rewinding/replacement (2–12 weeks lead time). Acceptable only for individually protected small motors (<5 kW) with properly coordinated fuse/breaker protection that will clear the overcurrent before thermal damage, and where spares are immediately available.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Electrical Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — CB strategy with operational basis]*
