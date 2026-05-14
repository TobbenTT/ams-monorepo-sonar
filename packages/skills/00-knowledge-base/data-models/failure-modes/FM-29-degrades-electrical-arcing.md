# FM-29: Degrades due to Electrical arcing

> **Combination**: 29 of 72
> **Mechanism**: Degrades
> **Cause**: Electrical arcing
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: C (Gradual increase) — arcing damage accumulates progressively with each switching or fault event; degradation rate increases as contact surfaces deteriorate
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 1.5–2.5 (gradual), η 5,000–50,000 operations depending on current magnitude, arcing duration, and contact material

## Physical Degradation Process

Degradation due to electrical arcing occurs when repetitive arcing events progressively damage contact surfaces, insulation, and surrounding materials in electrical switching equipment. Each time a circuit breaker, contactor, relay, or switch operates, an arc forms during contact separation (breaking arc) or just before contact closure (closing pre-strike). The arc plasma temperature exceeds 5,000°C, causing localized melting, vaporization, and material transfer between contacts. Over thousands of operations, contacts erode, pit, and develop resistive surface layers that increase contact resistance and temperature during current conduction.

The degradation progression involves: contact erosion (material loss from arc ablation — typically 10–100 μg per operation for AC contactors); contact pitting and cratering (asymmetric material transfer creates rough surfaces); oxide and carbon deposit formation on contact surfaces (increases contact resistance); arc chute degradation (arc-quenching materials: ceramic plates, deion grids become contaminated, cracked, or eroded, reducing arc-interrupting capability); and insulation carbonization (arcing deposits conductive carbon on insulating surfaces, eventually creating tracking paths).

In OCP phosphate processing, arcing degradation is significant for: motor contactors that cycle frequently (slurry pump auto-start/stop, conveyor sequencing — some contactors operate >100 times per day); circuit breakers on motor circuits that experience frequent overcurrent trips; relay contacts in control circuits; slip ring brushes on wound rotor motors; and VFD input/output contactors. The phosphate dust environment compounds the problem — conductive dust on contact surfaces increases the arc energy by creating additional pre-strike paths.

## Detectable Symptoms (P Condition)

- Contact resistance increasing (micro-ohm test >50% above as-new baseline per NETA MTS)
- Visible contact pitting, erosion, or material transfer during inspection
- Arc chute discoloration, cracking, or contamination visible during inspection
- Contactor or breaker operating time increasing (sluggish operation from worn mechanism)
- Welded contacts (contacts fail to separate — sticking closed)
- Increased noise during contactor operation (chattering from worn contacts or weak spring)
- Temperature rise at contact points detectable by thermography (ΔT >10°C per NETA MTS)
- Insulation surface carbon deposits visible during inspection

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Switchgear (SG) | MV circuit breakers, LV MCC contactors, motor starters | Main contacts, arcing contacts, arc chutes, operating mechanisms |
| Control logic units (CL) | Relay panels, interposing relays, timer contacts | Relay contacts (auxiliary and main), contact springs, coils |
| Electric motors (EM) | Wound rotor motors with slip rings | Slip ring brushes, brush holders, slip ring surface |
| Frequency converters (FC) | VFD bypass contactors, input/output switchgear | Contactor contacts, fuse elements, pre-charge contacts |
| Electric generators (EG) | Generator output breakers, synchronizing contactors | Main contacts, arcing tips, arc chutes |
| Uninterruptible power supply (UP) | UPS static bypass switches, maintenance bypass contactors | Transfer switch contacts, bypass contactor |
| Heating equipment (HT) | Heater element switching contactors | Contactor contacts (high inrush on resistive loads) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Electrical Effects | Contact resistance measurement (micro-ohm) | 6–12 months | NETA MTS, IEC 62271-100 |
| Temperature Effects | Thermography of contacts under load | 1–3 months | NETA MTS, ISO 18434-1 |
| Primary Effects | Operation counter review (cumulative operations) | Monthly–quarterly | OEM rated operations life |
| Electrical Effects | Breaker timing test (contact travel analysis) | 12–24 months | NETA MTS, IEC 62271-100 |
| Human Senses | Visual inspection of contacts and arc chutes | 6–12 months | NFPA 70B, IEC 60947 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure contact resistance on Circuit Breaker [{tag}]`
- **Acceptable limits**: Contact resistance ≤OEM specification or ≤150% of as-new value per NETA MTS. No visible contact welding or excessive pitting. Arc chute intact with no cracking or contamination. Operating time within OEM specification. Operation count below OEM-rated mechanical/electrical endurance.
- **Conditional comments**: If contact resistance 150–200% of baseline: schedule contact cleaning or replacement at next outage. If contact resistance >200% or visible pitting >50% of contact area: replace contacts before next operational cycle. If arc chute damaged or contaminated: replace arc chute set. If operation counter approaching rated endurance (typically 10,000–100,000 operations for contactors per IEC 60947): plan replacement regardless of contact condition. If contacts welded (stuck closed): replace immediately — loss of switching function.

### Fixed-Time (for operation-count-based replacement)

- **Task**: `Replace contactor contacts on Motor Starter [{tag}]`
- **Interval basis**: Based on cumulative operations vs. OEM-rated electrical endurance life. Typical: MV vacuum interrupters 10,000–30,000 operations; LV contactors 100,000–1,000,000 operations (AC-3 duty per IEC 60947); relay contacts 100,000–10,000,000 operations. For high-cycling applications (>50 operations/day): monitor operation counter and plan replacement at 80% of rated life. For MV vacuum breakers: X-ray contact gap measurement every 3–5 years per IEC 62271-100.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for low-duty contactors and relays in non-critical circuits where contact degradation causes only minor disruption and the device has adequate short-circuit protection upstream. NOT acceptable for circuit breakers (degraded arc interruption capability can cause failure to clear faults — catastrophic arc flash risk) or contactors controlling safety-critical loads (loss of switching function prevents safe shutdown).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Electrical Effects], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — CB strategy with operational basis]*
