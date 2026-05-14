# FM-51: Overheats/Melts due to Lack of lubrication

> **Combination**: 51 of 72
> **Mechanism**: Overheats/Melts
> **Cause**: Lack of lubrication
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — lubricant depletes progressively with operating time; overheating occurs when lubricant level, film thickness, or effectiveness drops below the minimum required for heat dissipation
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 2.0–4.0 (wear-out for scheduled depletion) or 0.8–1.2 (random for sudden loss), η 3,000–20,000 hours depending on lubricant type, relubrication practice, and operating conditions

## Physical Degradation Process

Overheating due to lack of lubrication occurs when insufficient lubricant at the contact interface between moving parts fails to maintain a protective hydrodynamic or elastohydrodynamic film, resulting in metal-to-metal contact that generates frictional heat far exceeding the assembly's heat dissipation capacity. Lubricant serves dual functions: reducing friction (coefficient of friction drops from ~0.3 for dry steel-on-steel to ~0.005 for hydrodynamic oil film) and transporting heat away from the contact zone. When lubricant is insufficient, both functions are lost simultaneously — friction heat generation increases 60-fold while heat removal decreases.

The temperature escalation during lubrication failure is extremely rapid — bearing temperatures can rise from normal operating (60–80°C) to seizure temperature (>250°C) within minutes once the lubricant film collapses. The sequence is: boundary lubrication (marginal film, micro-welding begins, temperature rises 20–50°C above normal), mixed lubrication breakdown (metal-to-metal contact increases, temperature rises rapidly), and seizure/melting (bearing material softens and extrudes, shaft scores, and components weld together). For babbitt bearing material, melting occurs at 230–340°C; for bronze bushings at ~1000°C; and for steel rolling elements at ~1400°C.

Lubrication loss occurs through: gradual depletion (grease hardens and loses effectiveness, oil level drops from evaporation/leakage); sudden loss (oil line fracture, seal failure, drain plug loss); lubricant degradation (oxidation, contamination, thermal breakdown reducing viscosity); incorrect lubricant application (wrong viscosity grade, inadequate quantity, wrong relubrication interval); and blocked lubricant supply (oil filter blockage, grease line obstruction, oil pump failure).

In OCP phosphate processing, lubrication-related overheating is critical for: SAG mill and ball mill trunnion bearings (hydrodynamic sleeve bearings carrying enormous loads — lubrication failure causes immediate catastrophic damage); conveyor pulley and idler bearings (high-speed, dusty environment — grease contamination and depletion); slurry pump bearings (shaft deflection from hydraulic loads combined with seal leakage contaminating lubricant); crusher bearings (extreme loads, shock loading, dust ingress); and gearbox bearings (tooth contact lubrication critical for heat dissipation).

## Detectable Symptoms (P Condition)

- Bearing temperature rising above normal operating baseline (>10°C above trend per ISO 10816)
- Bearing temperature rate-of-change accelerating (>2°C/hour indicates developing lubrication problem)
- Increased vibration in high-frequency range (>5 kHz envelope/demodulation spectrum indicating metal-to-metal contact)
- Audible bearing noise change (grinding, squealing, or rumbling indicating lubrication distress)
- Oil level below minimum mark on sight glass or level gauge
- Grease condition degraded (hardened, discolored, oxidized) visible at bearing seals
- Oil analysis showing: viscosity drop >20%, oxidation increase, increased wear metals (Fe, Cu, Sn, Al)
- Lubricant leakage visible at seals, drain connections, or oil lines

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP bearings, ET-CENTRIFUGAL-PUMP, ET-VACUUM-PUMP | Shaft bearings (rolling element or sleeve), thrust bearings |
| Mills (ML) | ET-SAG-MILL trunnion bearings, ET-BALL-MILL pinion bearings | Trunnion bearings (hydrodynamic), pinion shaft bearings, ring gear lubrication |
| Crushers (CU) | ET-CRUSHER main shaft bearing, eccentric bearing | Main shaft bearing (bronze bushing), eccentric bearing, toggle seats |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR pulley bearings, idler bearings | Drive pulley bearings, tail pulley bearings, take-up bearings, idlers |
| Compressors (CO) | Reciprocating compressor crosshead, crankshaft bearings | Crankshaft bearings, crosshead pin, piston rod packing |
| Gearboxes (GB) | Mill gearboxes, conveyor gearboxes, crusher gearboxes | Gear tooth contact, input/output shaft bearings, thrust bearings |
| Fans (FA) | ID/FD fans, process fans | Shaft bearings (pillow blocks), coupling bearings |
| Electric motors (EM) | Large motor bearings (>100 kW) | Drive-end and non-drive-end bearings |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Bearing temperature monitoring (RTD, thermocouple, thermography) | Continuous–weekly | ISO 10816, ISO 281, OEM specification |
| Vibration Effects | Vibration monitoring (high-frequency envelope analysis) | 1–4 weeks | ISO 10816, ISO 13373 |
| Vibration Effects | Ultrasonic bearing monitoring (>20 kHz) | 1–4 weeks | ISO 29821 |
| Chemical Effects | Lubricant analysis (viscosity, contamination, wear metals) | 1–3 months | ISO 4406, ASTM D445, ASTM D6595 |
| Human Senses | Oil level check and grease condition visual inspection | Daily–weekly | OEM lubrication manual |
| Primary Effects | Oil flow/pressure monitoring in circulating systems | Continuous | OEM specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred for critical bearings)

- **Primary task**: `Monitor bearing temperature on Mill Trunnion [{tag}]`
- **Acceptable limits**: Bearing temperature ≤OEM maximum (typically 80°C for rolling element, 70°C for sleeve bearings). Temperature rise above ambient ≤40°C per ISO 10816. Rate of temperature rise ≤1°C/hour steady-state. Oil level within sight glass operating range. Oil viscosity within ±15% of specified grade per ISO 3448.
- **Conditional comments**: If temperature 10–20°C above baseline at constant load: check oil level/condition, verify lubrication supply, investigate within 7 days. If temperature >20°C above baseline or rate >2°C/hour: shut down immediately — lubrication failure is imminent, investigate before restart. If ultrasonic dB level increases >8 dB: lubrication film is marginal, apply lubricant immediately and investigate root cause. Trip alarms: shut down at 95°C for rolling element bearings, 85°C for babbitt sleeve bearings (near melt point).

### Fixed-Time (for relubrication programs)

- **Task**: `Relubricate bearing on Pump [{tag}]`
- **Interval basis**: Grease relubrication per SKF formula: t_f = K × (14×10⁶ / (n × √d)) − 4d, adjusted for temperature, contamination, and vertical shaft orientation per SKF Group guidelines. Typical OCP intervals: conveyor idler bearings 3–6 months; pulley bearings monthly; pump bearings monthly to quarterly; motor bearings quarterly to semi-annually. Oil change: per OEM or oil analysis — typically 3,000–8,000 hours for mineral oil, 8,000–15,000 for synthetic. Circulating oil systems: continuous with online filtration and scheduled oil analysis.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for any bearing in critical service — lubrication failure leads to seizure within minutes, causing shaft damage, housing damage, and potential secondary failures (coupling failure, seal failure, process leak). Acceptable ONLY for sealed-for-life bearings on non-critical, low-cost equipment where the bearing is designed to operate its full rated life on factory lubricant and replacement is simple (e.g., sealed conveyor idler bearings with quick-change design).

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks (relubrication)], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — FT strategy with operational basis]*
