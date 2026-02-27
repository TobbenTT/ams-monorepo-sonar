# FM-01: Arcs due to Breakdown in insulation

> **Combination**: 1 of 72
> **Mechanism**: Arcs
> **Cause**: Breakdown in insulation
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — insulation degrades progressively with thermal aging, moisture ingress, and dielectric stress until breakdown voltage is exceeded
> **ISO 14224 Failure Mechanism**: 4.1 Short circuiting / 4.5 Earth/isolation fault
> **Weibull Guidance**: β typically 2.5–3.5 (wear-out), η 15,000–25,000 hours depending on insulation class and thermal environment

## Physical Degradation Process

Electrical arcing occurs when the dielectric strength of insulation material deteriorates below the applied voltage gradient. Insulation aging follows an Arrhenius relationship: every 10°C rise above rated temperature approximately halves insulation life. The degradation begins at a molecular level as thermal energy breaks polymer chains in organic insulation materials (polyester, epoxy, mica composites), reducing dielectric strength progressively over years of service.

Moisture ingress, contamination, and partial discharge activity create carbonized tracking paths that progressively reduce the breakdown voltage. Partial discharges (PD) are particularly insidious — small internal voids in the insulation experience localized electrical breakdown, generating ozone and nitric acid that erode surrounding material. This creates a self-accelerating degradation loop: PD erodes insulation, creating larger voids, which produce more intense PD. Once the dielectric barrier is breached, an arc forms generating temperatures exceeding 5,000°C, causing rapid carbonization of surrounding insulation, copper melting, and potential phase-to-phase or phase-to-ground faults.

In OCP phosphate processing, high ambient temperatures near dryers and kilns (often exceeding 45°C), combined with phosphate dust ingress and coastal humidity near Jorf Lasfar and Safi facilities, accelerate insulation degradation on HV motors driving SAG mills and ball mills. The combination of thermal stress, moisture, and conductive phosphate dust is particularly aggressive — phosphate dust absorbs moisture and becomes conductive, creating surface tracking paths across insulation surfaces that would otherwise last decades.

## Detectable Symptoms (P Condition)

- Decreasing insulation resistance trend (megger readings declining >10% per year from initial baseline)
- Partial discharge activity >100 pC detectable by ultrasonic sensors or online PD monitors
- Ozone smell near electrical enclosures (indicates corona/partial discharge activity)
- Discoloration or carbon tracking visible on insulation surfaces during visual inspection
- Elevated temperature at connection points (thermography ΔT >10°C above baseline)
- Dissolved gas analysis showing acetylene (C₂H₂) >1 ppm in oil-filled equipment (transformers)
- Tan delta (dissipation factor) trending upward >0.5% above baseline per IEEE 286
- Surge comparison test showing waveform distortion indicating turn-to-turn insulation weakness

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electric motors (EM) | ET-SAG-MILL drive (CL-MOTOR-HV), ET-BALL-MILL drive, ET-CRUSHER drive, ET-COMPRESSOR drive | Stator winding, rotor bars, terminal box connections, slot wedges |
| Power transformers (PT) | Substation transformers at beneficiation plants, rectifier transformers | Winding insulation, bushings, tap changer contacts, lead insulation |
| Switchgear (SG) | MV switchgear feeding mill motors, MCC panels | Circuit breaker contacts, bus bar insulators, cable terminations |
| Electric generators (EG) | Emergency diesel generators at Jorf Lasfar and Safi | Stator winding, rotor winding, exciter insulation |
| Frequency converters (FC) | VFDs on ET-SLURRY-PUMP, ET-BELT-CONVEYOR drives | Power semiconductors, DC link capacitors, output filter inductors |
| Power cables and terminations (PC) | MV cables feeding mill motors, feeder cables | Cable insulation (XLPE, EPR), terminations, splices, joints |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Electrical Effects | Insulation resistance testing (megger) | 6–12 months | IEEE 43, IEC 60085 |
| Electrical Effects | Partial discharge monitoring (online or offline) | 2–6 months | IEC 60270, IEEE 1434 |
| Electrical Effects | Tan delta / dissipation factor testing | 6–12 months | IEEE 286, IEC 60034-27 |
| Electrical Effects | Surge comparison testing (offline) | 12–24 months | IEEE 522 |
| Temperature Effects | Thermography of connections and windings | 1–3 months | NETA MTS, ISO 18434 |
| Chemical Effects | Dissolved gas analysis (oil-filled equipment only) | 6–12 months | IEEE C57.104, IEC 60599 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure insulation resistance on Motor Winding [{tag}]`
- **Acceptable limits**: Insulation resistance ≥100 MΩ for new; investigate if <50% of initial value per IEEE 43. Minimum acceptable: (kV rating + 1) MΩ at 40°C per IEEE 43 Table 3
- **Conditional comments**: If resistance <50 MΩ: schedule rewinding within 30 days, increase monitoring to monthly. If <1 MΩ/kV: do not energize, replace winding before return to service. If PD >500 pC: schedule offline assessment within 14 days.

### Fixed-Time (for age-related pattern B)

- **Task**: `Replace cable terminations on Motor [{tag}]`
- **Interval basis**: Insulation class thermal life rating at rated temperature — Class B: 25 years, Class F: 20 years, Class H: 15 years. Derate by 50% in high ambient temperature environments (>40°C continuous).

### Run-to-Failure (applicability criteria)

- **Applicability**: Only when redundant supply exists (duty/standby configuration) and failure has no safety consequence. NEVER for SAG/ball mill main drives or single-source feeders. Acceptable for redundant lighting circuits, non-critical auxiliary supplies.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, P-F Interval], [ISO 14224 Table B.2 — 4.1/4.5 Electrical failure], [REF-01 §3.5 — Strategy Types CB/FT/RTF]*
