# FM-68: Wears due to Low pressure

> **Combination**: 68 of 72
> **Mechanism**: Wears
> **Cause**: Low pressure
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — low pressure conditions are driven by unpredictable process upsets, instrument failures, or piping restrictions
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on frequency and severity of low-pressure events

## Physical Degradation Process

Wear due to low pressure occurs when insufficient pressure at critical locations allows the development of cavitation, flashing, or loss of lubricant film, resulting in accelerated material removal. The primary mechanism is cavitation: when local static pressure drops below the fluid's vapor pressure, vapor bubbles form and then collapse violently when they reach a higher-pressure zone, eroding surfaces through the same mechanism described in FM-65. Low pressure specifically refers to the root cause condition (insufficient NPSH at pump suction, pressure drop through restrictions, vacuum conditions) rather than the entrained air cause.

Low pressure wear mechanisms include: pump cavitation from insufficient suction pressure (NPSH available < NPSH required), which is the most common and destructive; flashing wear in control valves where liquid pressure drops below vapor pressure at the vena contracta, creating two-phase flow with impact erosion; vacuum-induced air ingress that creates mixed-phase flow with erosive bubble collapse; and loss of hydrodynamic bearing film when oil supply pressure drops below the minimum needed to maintain the bearing oil wedge, causing metal-to-metal contact wear.

The low-pressure condition arises from: pump suction lift exceeding design limits; suction strainer blockage reducing available NPSH; high suction losses from corroded or restricted piping; control valve sizing creating excessive pressure drop; system elevation changes not accounted for in design; and loss of pressurization on oil supply systems (pump failure, filter blockage, pipe leak).

In OCP phosphate processing, low-pressure wear is significant for: slurry pump suction where high slurry density (SG 1.3–1.6) increases NPSH required; deep sump installations at Khouribga where suction lift approaches cavitation limits; control valves on phosphoric acid circuits where high-temperature acid (80–110°C) has vapor pressure approaching operating pressure; and mill lube oil systems where filter blockage or pump degradation reduces supply pressure to bearings.

## Detectable Symptoms (P Condition)

- Pump suction pressure below minimum per design (vacuum gauge reading approaching NPSHr)
- Cavitation noise at pump suction (crackling sound)
- Pump vibration increasing (broadband high-frequency signature)
- Control valve downstream noise and vibration (flashing/cavitation)
- Oil supply pressure below minimum at bearing entry (pressure gauge reading declining)
- Pump performance degradation (reduced head and flow from cavitation)
- Suction strainer ΔP increasing (reducing available NPSH)
- Bearing temperature rising (loss of oil film from low supply pressure)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP on suction lift, deep sump pumps | Impeller (cavitation erosion), wear rings, suction liner, throat bush |
| Valves (VA) | Control valves with high ΔP, pressure-reducing valves | Trim (plug, cage, seat), body downstream wall |
| Bearings (BE) | Mill trunnion bearings, turbine journal bearings | Bearing surfaces (babbitt, bronze), thrust pads, journal surfaces |
| Compressors (CO) | Compressor suction with restrictions, vacuum compressors | Piston rings, cylinder liner, valves |
| Piping (PI) | Downstream of control valves, after pressure-reducing stations | Pipe wall at flashing zones, elbows, tee branches |
| Hydraulic systems (HY) | Hydraulic systems with low charge pressure | Pump gears/pistons, servo valves, cylinder walls |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Suction pressure monitoring | Continuous | ISO 13709, HI 9.6.1 |
| Vibration Effects | Vibration monitoring (cavitation detection) | 1–4 weeks | ISO 10816 |
| Primary Effects | Pump NPSH verification at operating conditions | Monthly–quarterly | ISO 9906, HI 9.6.1 |
| Primary Effects | Lube oil supply pressure monitoring | Continuous | OEM specification |
| Primary Effects | Suction strainer ΔP monitoring | Weekly–monthly | OEM specification |
| Human Senses | Cavitation noise detection (operator rounds) | Daily | Industry practice |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor suction pressure on Pump [{tag}]`
- **Acceptable limits**: NPSHa ≥ NPSHr × 1.3 at maximum flow per HI 9.6.1. Suction strainer ΔP ≤ OEM maximum. Oil supply pressure ≥ OEM minimum at all operating speeds. No cavitation noise during normal operation. Control valve ΔP within anti-cavitation trim design limits.
- **Conditional comments**: If NPSHa approaching NPSHr: check suction strainer (clean if ΔP >2× clean), verify suction level, check for piping restrictions. If cavitation persists after suction optimization: consider lowering pump elevation, increasing suction pipe diameter, or installing inducer. If control valve cavitating: install multi-stage anti-cavitation trim per IEC 60534. If oil supply pressure low: check oil pump, replace filter, check for leaks. If bearing temperature rising due to low oil pressure: trip equipment before bearing damage occurs.

### Fixed-Time (for suction system maintenance)

- **Task**: `Clean suction strainer on Pump [{tag}]`
- **Interval basis**: Suction strainer inspection/cleaning per ΔP indication or at minimum every 3 months in slurry service. NPSH verification at every pump speed change or process modification. Oil filter replacement per OEM interval or ΔP bypass indication (whichever first). Design review of suction piping if cavitation is chronic — NPSH margin should be permanently ≥1.3× per HI 9.6.1.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for critical pumps or bearing lubrication systems — cavitation and oil film loss cause rapid, expensive damage. Acceptable only for non-critical small pumps where occasional mild cavitation during transient conditions is tolerable and self-correcting.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
