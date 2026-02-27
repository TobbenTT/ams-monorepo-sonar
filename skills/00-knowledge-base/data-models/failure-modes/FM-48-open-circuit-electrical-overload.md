# FM-48: Open-Circuit due to Electrical overload

> **Combination**: 48 of 72
> **Mechanism**: Open-Circuit
> **Cause**: Electrical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — electrical overload events are unpredictable and not age-related; failure depends on transient conditions exceeding conductor or component ratings
> **ISO 14224 Failure Mechanism**: 4.2 Open circuit
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on circuit protection adequacy and load profile

## Physical Degradation Process

Open-circuit failure due to electrical overload occurs when current flowing through a conductor, connection, or component exceeds its thermal capacity, causing the conductor material to heat beyond its melting point or the connection to fail mechanically due to thermal expansion stresses. The fundamental physics follows Joule's law (P = I²R): when current exceeds rated values, resistive heating increases with the square of current. At connection points where contact resistance is higher (crimps, bolted joints, terminal lugs), localized hot spots develop first.

The failure progression depends on the magnitude and duration of the overload. Sustained moderate overloads (110–150% of rated current) cause gradual conductor annealing, insulation degradation, and progressive loosening of bolted connections through thermal cycling. Severe overloads (>200% of rated current) cause rapid conductor fusing — the conductor melts and separates, creating an open circuit. For fuse elements and thermal overload relays, this is the intended protective function. For conductors and connections, it represents an uncontrolled failure that can cause arcing, fire, and cascading equipment damage.

In OCP phosphate processing, open-circuit failures are most common in motor circuits driving heavily loaded SAG mills and ball mills where starting currents reach 600–800% of full load current. Direct-on-line (DOL) starts of large HV motors at Khouribga and Benguerir beneficiation plants impose severe thermal stress on cable terminations, bus bar connections, and motor terminal boxes. Additionally, harmonic-rich environments created by VFD-driven slurry pumps and conveyor drives cause additional heating in neutral conductors and can overload undersized cables.

## Detectable Symptoms (P Condition)

- Elevated temperature at connections detectable by thermography (ΔT >10°C above adjacent conductor baseline)
- Increasing contact resistance measured during micro-ohm testing (>50% above initial baseline)
- Discoloration, heat marks, or oxide formation visible on conductor surfaces at connection points
- Circuit breaker or overload relay tripping on overcurrent (repeated trips indicate developing problem)
- Voltage drop across connections exceeding 50 mV under load (indicates high resistance joint)
- Burning smell near electrical panels or junction boxes
- Flickering or intermittent loss of supply to downstream loads
- Motor current analysis showing phase imbalance >5% (indicates one phase connection degrading)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electric motors (EM) | ET-SAG-MILL drive (CL-MOTOR-HV), ET-BALL-MILL drive, ET-CRUSHER drive | Motor terminal connections, cable lugs, junction box connections |
| Switchgear (SG) | MV/LV switchgear at beneficiation plants, MCC panels | Bus bar connections, breaker contacts, cable terminations, fuses |
| Power cables and terminations (PC) | MV cables to mill motors, LV feeder cables, control cables | Cable conductors, terminations, splices, crimped connections |
| Frequency converters (FC) | VFDs on ET-SLURRY-PUMP, ET-BELT-CONVEYOR | DC link fuses, output thyristors/IGBTs, input reactor connections |
| Uninterruptible power supply (UP) | UPS systems at control rooms | DC fuses, battery connections, inverter output connections |
| Electric generators (EG) | Emergency diesel generators | Output breaker connections, neutral connections, exciter wiring |
| Control logic units (CL) | PLC/DCS I/O modules, relay logic panels | Internal fuses, terminal strip connections, I/O card connectors |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Thermography of electrical connections and panels | 1–3 months | NETA MTS, ISO 18434-1 |
| Electrical Effects | Micro-ohm (contact resistance) testing | 6–12 months | IEC 62271-100, NETA MTS |
| Electrical Effects | Motor current analysis (phase balance) | 1–3 months | NEMA MG-1, IEEE C37 |
| Primary Effects | Voltage drop measurement across connections under load | 6–12 months | NETA MTS Table 100.12 |
| Human Senses | Visual inspection for discoloration and heat marks | 1–4 weeks | NFPA 70B |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform thermography on Electrical Connections [{tag}]`
- **Acceptable limits**: ΔT ≤10°C above similar loaded connection per NETA MTS. Absolute temperature ≤70°C for standard insulation. Phase-to-phase temperature difference ≤5°C under balanced load.
- **Conditional comments**: If ΔT 10–25°C (NETA Priority 3): schedule repair at next planned outage, increase monitoring to monthly. If ΔT 25–40°C (NETA Priority 2): schedule repair within 2 weeks, reduce load if possible. If ΔT >40°C or absolute >105°C (NETA Priority 1): de-energize and repair immediately — imminent open-circuit or fire risk.

### Fixed-Time (for connection maintenance)

- **Task**: `Re-torque electrical connections on Motor Terminal Box [{tag}]`
- **Interval basis**: Every 12 months for the first 2 years after installation (to address initial bedding-in), then every 3–5 years. In high-vibration environments (mill drives, crushers): annual re-torque. Torque values per manufacturer specification or NEMA/IEC terminal standards.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for properly protected circuits where the open-circuit device IS the protective element (fuses, thermal overloads) — these are designed to open-circuit on overload. NOT acceptable for unprotected connections, bus bars, or cable terminations where open-circuit would cause arcing or fire. For fuse replacement, maintain adequate spares inventory.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 4.2 Open circuit], [REF-01 §3.5 — CB strategy with operational basis]*
