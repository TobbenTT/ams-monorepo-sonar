# FM-50: Overheats/Melts due to Electrical overload

> **Combination**: 50 of 72
> **Mechanism**: Overheats/Melts
> **Cause**: Electrical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — electrical overload events are unpredictable; overheating depends on transient conditions exceeding equipment thermal capacity
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on overload magnitude, thermal mass, and protection response time

## Physical Degradation Process

Overheating due to electrical overload occurs when current flowing through electrical equipment exceeds its continuous thermal rating, generating resistive heating (P = I²R) that raises the temperature beyond the material's thermal limit. This mechanism is closely related to FM-60 (thermal overload from mechanical cause) and FM-61 (thermal overload from overcurrent), but here the focus is on the overheating/melting outcome rather than the electrical root cause.

The overheating progression depends on the overload severity: moderate sustained overloads (110–130% of rated current) cause slow temperature rise over minutes to hours, potentially without triggering inverse-time protection if the overload is just above the relay's service factor; severe overloads (>200% of rated current) cause rapid temperature rise within seconds, typically tripping instantaneous protection but potentially causing localized hot-spot damage at high-resistance connections before the protective device operates; and repetitive short-duration overloads that individually clear protection but cumulatively degrade insulation through thermal cycling.

The melting outcome occurs at connections and conductors where contact resistance is high — bolted joints, crimped connections, and corroded terminals. At these points, local temperature can reach conductor melting point (copper: 1085°C) even when the bulk conductor temperature is within limits. The resulting molten metal can ignite surrounding insulation, creating an arc flash event. Connection overheating is self-accelerating: increased temperature increases contact resistance, which increases heat generation — a thermal runaway condition.

In OCP phosphate processing, electrical overheating is driven by: high-inertia motor starting (SAG mill motors drawing 600% FLA for 15–30 seconds during DOL start); unbalanced loads on transformers feeding multiple drives; loose connections that develop from vibration in plant environments; undersized cables in legacy installations with accumulated load additions; and harmonic heating from VFD-driven loads.

## Detectable Symptoms (P Condition)

- Connection temperature elevated above adjacent conductor (thermography ΔT >10°C per NETA MTS)
- Motor winding temperature trending above thermal class rating (RTD/thermocouple reading)
- Cable surface temperature exceeding ampacity rating (thermography >70°C for PVC insulation)
- Transformer top oil temperature exceeding nameplate rating (>105°C for OA class per IEC 60076)
- Burning or acrid smell near electrical enclosures (insulation overheating)
- Discoloration of conductor insulation or connection hardware (heat marks)
- Protection relay logging frequent thermal alarm events without trip
- Power quality monitoring showing sustained current above nameplate rating

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electric motors (EM) | ET-SAG-MILL drive (CL-MOTOR-HV), ET-BALL-MILL drive | Stator windings, rotor bars, terminal connections, cable lugs |
| Power transformers (PT) | Distribution transformers, VFD input transformers | Winding insulation, core laminations, bushing connections |
| Switchgear (SG) | MV switchgear, LV MCC panels, bus bar trunking | Bus bar connections, breaker contacts, fuse holders, cable terminations |
| Power cables (PC) | MV/LV feeder cables, motor cables | Conductor insulation, cable joints, terminations |
| Frequency converters (FC) | VFDs on ET-SLURRY-PUMP, ET-BELT-CONVEYOR | IGBT modules, DC link bus bars, input/output connections |
| Electric generators (EG) | Emergency diesel generators | Stator winding, output breaker connections, neutral |
| Heating equipment (HT) | Electric trace heating, immersion heaters | Heating elements, terminal connections, control contactors |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Thermography of connections and equipment | 1–3 months | NETA MTS, ISO 18434-1 |
| Temperature Effects | Motor/transformer temperature monitoring | Continuous | IEEE 1, IEC 60076, IEC 60034-11 |
| Electrical Effects | Current monitoring (continuous or periodic) | Continuous–weekly | NEMA MG-1, IEC 60034-1 |
| Electrical Effects | Contact resistance measurement (micro-ohm) | 6–12 months | NETA MTS, IEC 62271 |
| Human Senses | Smell/visual inspection for overheating signs | 1–4 weeks | NFPA 70B |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform thermography on Electrical Panel [{tag}]`
- **Acceptable limits**: Connection ΔT ≤10°C above similar loaded connection per NETA MTS. Absolute connection temperature ≤70°C for standard insulation. Motor winding ≤thermal class limit minus 10°C margin. Transformer top oil ≤maximum per nameplate. No phase temperature imbalance >5°C.
- **Conditional comments**: If ΔT 10–25°C (NETA Priority 3): schedule repair at next planned outage, increase monitoring to monthly. If ΔT 25–40°C (NETA Priority 2): schedule repair within 2 weeks, reduce load if possible. If ΔT >40°C or absolute >105°C (NETA Priority 1): de-energize and repair immediately — imminent failure and fire risk. For recurrent hot connections: replace with higher-rated connection hardware, verify torque, apply anti-oxidant compound.

### Fixed-Time (for connection maintenance)

- **Task**: `Re-torque connections on MCC Panel [{tag}]`
- **Interval basis**: Initial re-torque at 6 months after installation (thermal cycling bedding-in). Subsequent re-torque every 3–5 years for general service. In high-vibration environments (near mills, crushers): annual re-torque. Torque values per NEMA or IEC terminal standards. Apply belleville washers on critical power connections to maintain preload. Contact resistance measurement at each re-torque event to baseline connection quality.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable only where the overheating element IS the designed protective device (fuses) — fuses are designed to overheat and melt as their protection function. NOT acceptable for bus bars, cable terminations, motor connections, or any unprotected conductor where overheating can cause arc flash, fire, or cascading failure.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — CB strategy with operational basis]*
