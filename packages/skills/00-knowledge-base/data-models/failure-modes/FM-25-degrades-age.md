# FM-25: Degrades due to Age

> **Combination**: 25 of 72
> **Mechanism**: Degrades
> **Cause**: Age
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — material properties deteriorate progressively with calendar time regardless of operating conditions; degradation rate is predictable based on material type and environment
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 2.5–4.0 (wear-out), η 30,000–100,000 hours depending on material type, environment, and storage/operating conditions

## Physical Degradation Process

Degradation due to age occurs when material properties deteriorate as a time-dependent function of environmental exposure, regardless of whether the equipment is operating or in storage. The primary aging mechanisms are: polymer chain scission from thermal oxidation (rubber, plastics, elastomers lose elasticity and become brittle); UV photodegradation of organic materials (surface embrittlement, chalking, and cracking of exposed polymers); evaporation and migration of plasticizers from PVC and rubber compounds (hardening, shrinkage); hydrolysis of ester-based compounds (polyurethane, polyester — moisture breaks polymer chains); and physical aging of amorphous polymers (densification and embrittlement below glass transition temperature).

For metallic components, age-related degradation includes: temper embrittlement of steels at moderate temperatures (375–575°C) over extended service periods; hydrogen aging of cast iron (absorbed hydrogen reduces toughness over decades); and precipitation hardening/overaging of aluminum alloys and some stainless steels. For electronic components, aging includes: capacitor dielectric degradation (reduced capacitance, increased leakage), resistor drift, and semiconductor junction degradation.

The critical feature is that aging occurs on a calendar-time basis — components in storage age at the same rate (or sometimes faster, due to poor storage conditions) as installed components. This makes shelf life management essential for spare parts containing polymeric materials. Environmental factors accelerate aging: heat, UV, ozone, and humidity all increase polymer degradation rates.

In OCP phosphate processing, age degradation is significant for: elastomeric seals and gaskets throughout the plants (EPDM, Viton, nitrile — all have finite calendar life); conveyor belt rubber (surface oxidation and ozone cracking on outdoor belts at Khouribga); fire protection equipment (extinguishing agent effectiveness degrades with age, hose materials embrittle); control system electronic components (capacitor aging in PLC/DCS modules and UPS systems); and polymer-lined piping and vessels (liner material aging independent of process exposure).

## Detectable Symptoms (P Condition)

- Elastomer hardness increasing (Shore A >15% above as-new specification per ASTM D2240)
- Surface cracking, crazing, or chalking on polymer/rubber surfaces
- Loss of elasticity (compression set >50% of original per ASTM D395)
- Electronic component parameter drift (capacitance, resistance, insulation values changing)
- PLC/DCS self-diagnostics reporting component aging or degradation warnings
- UPS battery capacity decreasing below 80% of rated per IEEE 450
- Fire extinguisher pressure dropping below minimum gauge reading
- Polymer material becoming brittle (breaking when flexed rather than bending)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Seals and gaskets (SG) | All process seals, O-rings, gaskets throughout plants | Elastomeric O-rings, flat gaskets, expansion joint bellows |
| Conveyors (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER) | Belt rubber (cover and carcass), lagging rubber, skirting rubber |
| Safety devices (SD) | Fire extinguishers, fire hoses, breathing apparatus | Extinguishing agent, hose material, SCBA components, detector elements |
| Uninterruptible power supply (UP) | UPS systems, emergency battery banks | Lead-acid batteries, electrolytic capacitors, fan bearings |
| Control logic units (CL) | PLC/DCS modules, relay panels, safety controllers | Electrolytic capacitors, CMOS batteries, optocouplers, power supplies |
| Piping (PI) | Rubber-lined piping, PVC piping, HDPE piping | Polymer pipe material, rubber lining, adhesive bonds |
| Hoses (HO) | Hydraulic hoses, process hoses, fire hoses | Rubber/thermoplastic tube, reinforcement, cover material |
| Electrical installations (EI) | Cable insulation, conduit seals, terminal blocks | PVC/XLPE cable insulation, rubber cable glands, polymer terminal blocks |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Hardness testing of elastomeric components | 6–12 months | ASTM D2240, ISO 7619 |
| Physical Effects | Compression set testing of seals | 12–24 months | ASTM D395, ISO 815 |
| Human Senses | Visual inspection for cracking, chalking, discoloration | 1–6 months | OEM specification, industry practice |
| Electrical Effects | Capacitor ESR/capacitance measurement | 12–24 months | IEC 61709, manufacturer specification |
| Primary Effects | UPS battery capacity test (load bank) | 6–12 months | IEEE 450, IEC 60896 |
| Primary Effects | Fire protection system functional test | 6–12 months | NFPA 10/25, AS 1851 |

## Maintenance Strategy Guidance

### Condition-Based (where feasible)

- **Primary task**: `Test battery capacity on UPS [{tag}]`
- **Acceptable limits**: Battery capacity ≥80% of rated at C/10 rate per IEEE 450. Elastomer hardness within ±15 points of as-new Shore A. Compression set ≤50%. No visible cracking, crazing, or brittleness on polymer components. Electronic component parameters within ±10% of specification.
- **Conditional comments**: If battery capacity 70–80%: increase monitoring to quarterly, plan replacement within 12 months. If battery capacity <70%: replace within 30 days (unreliable backup duration). If elastomer hardened or cracked: replace at next opportunity regardless of service age (material has exceeded useful life). If capacitor ESR increased >2× specification: plan board replacement at next outage.

### Fixed-Time (primary strategy for age-limited components)

- **Task**: `Replace elastomeric seals on Safety Valve [{tag}]`
- **Interval basis**: Component-specific calendar life limits: EPDM/nitrile O-rings: 5–8 years installed, 3–5 years in storage; Viton seals: 10–15 years; PTFE: 15–20 years; conveyor belt rubber: 10–15 years (outdoor, tropical); hydraulic hoses: 6–8 years per SAE J1273; UPS lead-acid batteries: 3–5 years (VRLA) or 15–20 years (flooded) per IEEE 450; PLC electrolytic capacitors: 7–10 years; fire extinguishers: per NFPA 10 (5–12 years depending on type). Apply shelf-life management (FIFO) for polymer spare parts.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for safety-critical components (fire protection, breathing apparatus, safety valve seals, UPS batteries). Acceptable for non-critical cosmetic polymers (equipment labels, covers, non-functional gaskets) where age degradation has no safety, environmental, or production consequence.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.6 — Scheduled Discard Tasks], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — SD strategy with calendar basis]*
