# FM-59: Short-Circuits due to Contamination

> **Combination**: 59 of 72
> **Mechanism**: Short-Circuits
> **Cause**: Contamination
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — conductive contaminant accumulation is progressive with exposure time; probability of short-circuit increases as deposit thickness and moisture absorption grow
> **ISO 14224 Failure Mechanism**: 4.1 Short circuiting
> **Weibull Guidance**: β typically 1.5–2.5 (gradual wear-out), η 3,000–15,000 hours depending on environment cleanliness, enclosure integrity (IP rating), and cleaning frequency

## Physical Degradation Process

Short-circuit failure due to contamination occurs when electrically conductive or hygroscopic foreign materials accumulate on insulation surfaces between conductors at different potentials, creating unintended current paths. The contamination layer itself may be weakly conductive (carbon dust, metalite residues, salt deposits), but when combined with moisture absorption, the surface resistance drops dramatically — a dry dust layer may have surface resistance >100 MΩ, while the same layer wetted with condensation can drop to <1 kΩ, sufficient to initiate a tracking arc.

The degradation mechanism is progressive: airborne particles settle on insulation surfaces inside electrical enclosures (despite IP-rated enclosures, fine dust penetrates through cable glands, ventilation openings, and seal degradation). Over time, the deposit layer thickens and creates preferential paths between conductors. Hygroscopic contaminants (salt spray, phosphoric acid mist, gypsum dust) absorb atmospheric moisture, particularly during temperature cycles when surfaces cool below the dew point. The resulting conductive surface film allows leakage current to flow, generating localized heating that carbonizes the insulation surface. Each carbonization event extends the conductive track until it bridges the full gap between conductors, causing a flashover short circuit.

In OCP phosphate processing, contamination-induced short circuits are among the most frequent electrical failure modes due to the pervasive dust environment. Phosphate rock crushing and screening at Khouribga and Benguerir generates fine mineral dust (10–50 μm) that penetrates MCC panels and motor terminal boxes. At Jorf Lasfar and Safi chemical processing plants, phosphoric acid mist and gypsum dust (from phosphogypsum stacks) create highly conductive deposits when combined with coastal humidity. The combination of 85%+ relative humidity and conductive phosphate/gypsum dust is particularly aggressive — short-circuit incidents in MV switchgear at Jorf Lasfar correlate strongly with seasonal humidity peaks (October–March).

## Detectable Symptoms (P Condition)

- Visible dust, salt, or chemical deposits on bus bars, insulators, and terminal connections inside enclosures
- Surface leakage current detectable by ultrasonic emission (40 kHz range) near contaminated insulators
- Decreasing surface insulation resistance (<100 MΩ at 500V DC between phases) on contaminated surfaces
- Discoloration or carbon tracking marks on insulation surfaces, especially near edges and creepage paths
- Increasing earth leakage current on residual current monitors (>30% above clean baseline)
- Moisture condensation visible inside electrical enclosures during temperature transitions
- Enclosure IP rating compromised: visible gaps at cable entries, damaged gaskets, missing covers
- Partial discharge activity at contaminated insulator surfaces (detectable by TEV sensors)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Switchgear (SG) | MV switchgear (6.6/11 kV) at beneficiation plants, LV MCC panels, outdoor ring main units | Bus bar insulators, circuit breaker arc chutes, CT/VT insulation, cable terminations |
| Electric motors (EM) | ET-SAG-MILL drive (CL-MOTOR-HV), ET-CRUSHER drive, ET-BELT-CONVEYOR drive | Terminal box connections, winding end-turns (open drip-proof motors), slip ring assemblies |
| Control logic units (CL) | PLC/DCS cabinets, relay protection panels, marshalling cabinets | PCB surfaces, relay contacts, terminal strips, backplane connectors |
| Power transformers (PT) | Outdoor distribution transformers, dry-type transformers in substations | External bushings, tap changer contacts (on-load type), terminal connections |
| Frequency converters (FC) | VFDs on ET-SLURRY-PUMP, ET-BELT-CONVEYOR drives | Power module heat sinks, DC link bus bars, control board components |
| Junction boxes (JB) | Field junction boxes on slurry circuits, instrument marshalling boxes | Terminal strips, cable glands, grounding connections |
| Lighting systems (LS) | Explosion-proof lighting in hazardous areas, outdoor floodlighting | Lamp holders, ballast connections, terminal blocks |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual inspection of enclosure cleanliness and sealing | 1–4 weeks | NFPA 70B §11.17, IEC 60364-6 |
| Electrical Effects | Surface insulation resistance measurement | 3–6 months | IEC 62631-3, IEEE 43 (adapted) |
| Electrical Effects | Partial discharge survey (TEV/ultrasonic) | 3–6 months | IEC 60270, IEEE 1434 |
| Electrical Effects | Earth leakage current monitoring | Continuous | IEC 60364-5-53 |
| Temperature Effects | Thermography of contaminated surfaces under load | 1–3 months | NETA MTS, ISO 18434-1 |
| Physical Effects | Enclosure integrity audit (IP rating verification) | 6–12 months | IEC 60529 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect cleanliness of Switchgear Enclosure [{tag}]`
- **Acceptable limits**: No visible conductive deposits on insulation surfaces. Surface insulation resistance ≥100 MΩ at 500V DC between phases. No evidence of tracking or carbonization. Enclosure IP rating intact (gaskets, glands, covers sealed). No condensation inside enclosure.
- **Conditional comments**: If light dust deposit without tracking: schedule cleaning at next planned outage (within 90 days). If moderate deposit with early tracking marks or surface resistance <100 MΩ: clean within 30 days, investigate enclosure sealing. If heavy contamination with active tracking, carbon marks, or PD detected: de-energize and clean immediately, repair insulation damage, restore enclosure IP rating before re-energizing.

### Fixed-Time (for contamination management)

- **Task**: `Clean and inspect insulation surfaces in MCC Panel [{tag}]`
- **Interval basis**: Based on environment contamination severity: heavy dust environments (Khouribga crushing, Benguerir screening) every 3–6 months, chemical processing (Jorf Lasfar acid plant) every 6–12 months with HEPA-filtered enclosures, clean indoor environments every 12–24 months. Cleaning method: dry vacuuming with HEPA filter, followed by solvent wipe (isopropanol) for chemical deposits per NFPA 70B §11.17. Compressed air blowing is NOT recommended (redistributes dust and can damage components).

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for MV/HV switchgear or motor circuits — contamination-induced short circuits cause arc flash hazards (incident energy >40 cal/cm² in MV gear), equipment destruction, and extended outages. Acceptable only for individually fused, low-energy control circuits where the protective device limits fault energy and no safety consequence exists.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Human Senses], [ISO 14224 Table B.2 — 4.1 Short circuiting], [REF-01 §3.5 — FT strategy with calendar basis]*
