# FM-44: Immobilised (binds/jams) due to Lack of lubrication

> **Combination**: 44 of 72
> **Mechanism**: Immobilised (binds/jams)
> **Cause**: Lack of lubrication
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — lubricant film depletes progressively through evaporation, oxidation, or consumption until metal-to-metal contact causes seizure
> **ISO 14224 Failure Mechanism**: 1.6 Sticking
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 3,000–15,000 hours depending on lubricant type, temperature, and re-lubrication interval

## Physical Degradation Process

Immobilisation due to lack of lubrication occurs when the lubricant film separating moving surfaces becomes insufficient to prevent direct metal-to-metal contact. As the lubricant film thins or breaks down, friction increases exponentially, generating localized heat that further degrades remaining lubricant and causes thermal expansion of the contacting surfaces. This creates a positive feedback loop: increased friction generates heat, which thins the lubricant further, which increases friction. Eventually, thermal expansion closes the clearance gap completely and the surfaces seize together through adhesive bonding (cold welding) at contact asperities.

Lubricant insufficiency can result from several root causes: grease consumption through evaporation (base oil loss at elevated temperatures), oxidation degradation (lubricant polymerizes into varnish and sludge that has no lubricating value), contamination that displaces or degrades lubricant, physical loss through leaking seals, blocked grease supply lines, or simply missed re-lubrication intervals. For oil-lubricated systems, low oil level, oil pump failure, or blocked oil passages produce the same effect. The time from detectable lubrication deficiency to seizure can be very short (hours to days for high-speed bearings), making early detection critical.

In OCP phosphate processing, bearing seizure on conveyor idlers and pulley bearings is a frequent manifestation. ET-BELT-CONVEYOR systems at Khouribga stretch for kilometers with thousands of idler bearings, many in remote locations where re-lubrication schedules are difficult to maintain. High ambient temperatures (>45°C in summer) accelerate grease base oil evaporation, particularly on return idlers near dryer and kiln discharge areas. SAG mill and ball mill trunnion bearings represent the highest-consequence application — trunnion bearing seizure can cause catastrophic mill damage and extended production loss.

## Detectable Symptoms (P Condition)

- Elevated bearing temperature trending upward (thermography ΔT >15°C above normal operating baseline)
- Increasing vibration amplitude, particularly at bearing defect frequencies (BPFO, BPFI, BSF per ISO 15243)
- Audible noise change — progression from smooth hum to rumbling, grinding, or squealing
- Grease or oil discoloration visible at bearing seals (darkened, burnt appearance indicates thermal degradation)
- Dry or minimal lubricant observed during visual inspection of grease points
- Oil analysis showing low oil level, elevated wear particle counts (Fe, Cu, Sn >trending threshold), or depleted additives
- Stiff or jerky rotation when turned by hand during shutdown inspection

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP (CL-BEARING-RADIAL), centrifugal process pumps | Radial bearings, thrust bearings, shaft sleeves |
| Compressors (CO) | ET-COMPRESSOR, reciprocating and screw compressors | Main bearings, crosshead bearings (reciprocating), rotor bearings (screw) |
| Electric motors (EM) | ET-SAG-MILL drive, ET-BALL-MILL drive, ET-CRUSHER drive motors | Motor bearings (DE and NDE), fan bearings |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BEARING-RADIAL) | Idler bearings, pulley bearings, take-up bearings, gearbox bearings |
| Cranes (CR) | Overhead cranes, gantry cranes | Slewing bearing, hoist drum bearings, rope sheave bearings |
| Gas turbines (GT) | Not typical at OCP but applicable generically | Journal bearings, thrust bearings |
| Blowers and fans (BL) | Ventilation fans, dust collection fans | Fan bearings, motor bearings |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Dynamic Effects | Vibration analysis (envelope/demodulation for bearing defects) | 2–8 weeks | ISO 10816-3, ISO 15243 |
| Temperature Effects | Thermography of bearing housings | 1–4 weeks | ISO 18434, NETA MTS |
| Particle Effects | Oil analysis — wear particle count and ferrography | 1–3 months | ISO 4406, ASTM D7684 |
| Chemical Effects | Grease condition analysis (consistency, base oil content, oxidation) | 3–6 months | ASTM D217, ASTM D5483 |
| Human Senses | Listen for abnormal bearing noise, feel for excessive heat | Daily–weekly | Operator training |

## Maintenance Strategy Guidance

### Condition-Based (preferred for critical bearings)

- **Primary task**: `Perform vibration analysis on Bearing Housing [{tag}]`
- **Acceptable limits**: Overall vibration ≤4.5 mm/s RMS per ISO 10816-3 Group 1 (Zone A/B boundary). Bearing defect frequencies (envelope spectrum) amplitude ≤0.5 gE. Temperature ≤80°C absolute (grease-lubricated) or per OEM specification.
- **Conditional comments**: If vibration 4.5–7.1 mm/s (Zone C): increase monitoring to weekly, plan bearing replacement at next opportunity within 30 days. If >7.1 mm/s (Zone D): schedule immediate replacement, risk of seizure. If bearing temperature >90°C: stop equipment, investigate lubrication immediately.

### Fixed-Time — Scheduled Lubrication (primary preventive strategy)

- **Task**: `Lubricate Bearing on Motor [{tag}]`
- **Interval basis**: Calculate re-lubrication interval per SKF formula: t = K × (14,000,000 / (n × √d) - 4d) adjusted for temperature, contamination, and load factors. Typical intervals: conveyor idlers 3–6 months, mill motor bearings 1–3 months, pump bearings 1–3 months. Use OEM-specified grease type and quantity — over-greasing causes bearing overheating.

### Run-to-Failure (applicability criteria)

- **Applicability**: Only for sealed-for-life bearings where re-lubrication is not possible by design (small motor bearings, some idler bearings). These bearings are designed for scheduled discard at end of grease life. NEVER allow RTF on re-lubricatable bearings — the consequence is seizure and potential fire (grease ignition at >250°C).

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — When age-related patterns occur (direct contact with product)], [ISO 14224 Table B.2 — 1.6 Sticking], [REF-01 §3.5 — FT strategy for lubrication tasks]*
