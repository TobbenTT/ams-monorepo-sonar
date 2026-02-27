# FM-30: Degrades due to Entrained air

> **Combination**: 30 of 72
> **Mechanism**: Degrades
> **Cause**: Entrained air
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — air entrainment events are unpredictable; driven by process upsets, low liquid levels, seal failures, or piping design issues
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on air entrainment severity and system design

## Physical Degradation Process

Degradation due to entrained air occurs when gas bubbles become trapped in a liquid system, causing progressive damage through cavitation, aeration, and foam-related mechanisms. The degradation pathways include: cavitation erosion where air/vapor bubbles collapse violently near surfaces, generating micro-jets at >100 m/s that erode metal surfaces through fatigue-pitting (material loss rates of 0.01–1.0 mm/year); lubricant degradation where entrained air accelerates oil oxidation (oxygen dissolved in oil at 10% air entrainment reacts 10× faster than normal), generates foam that reduces film thickness, and causes micro-dieseling (compression ignition of air bubbles in high-pressure zones generates localized temperatures >1000°C); hydraulic system degradation where air compressibility causes spongy response, pressure spikes, and loss of positional accuracy; and pump performance degradation where entrained air reduces volumetric efficiency and creates unstable flow.

Air entrainment occurs through: vortex formation at pump suctions (low liquid level or inadequate submergence); air leaks through seals and connections on the suction side of pumps; turbulent mixing at return lines discharging above liquid level; dissolved air coming out of solution at pressure drops (Henry's law); and process gas liberation in chemical reactors. Once entrained, air bubbles are difficult to remove — they circulate through the system causing damage at every high-pressure, high-shear, or high-velocity zone.

In OCP phosphate processing, entrained air degradation is significant for: slurry pump circuits where air entrainment from vortexing at sump/tank suctions causes impeller cavitation erosion; hydraulic systems on mobile equipment at Khouribga where air entry through worn cylinder seals causes valve erosion and control instability; lubrication oil systems on mills and gearboxes where foam from air entrainment through shaft seals reduces bearing film thickness; and phosphoric acid circuits where CO₂ and HF gas liberation creates two-phase flow conditions.

## Detectable Symptoms (P Condition)

- Cavitation noise (distinctive cracking/rattling sound at pump suction or valve downstream)
- Foam visible in oil reservoirs, hydraulic tanks, or process vessels
- Pump discharge pressure fluctuating (>±5% variation at constant speed)
- Hydraulic system response becoming spongy or erratic
- Oil analysis showing increased oxidation rate (TAN increasing faster than normal)
- Vibration spectrum showing broadband high-frequency energy (cavitation signature)
- Cavitation pitting visible on impeller surfaces, valve trim, or bearing surfaces during inspection
- Pump efficiency decreasing (reduced head and flow at constant speed)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP, ET-CENTRIFUGAL-PUMP, ET-VACUUM-PUMP | Impeller (cavitation erosion), casing, wear rings, mechanical seal |
| Hydraulic systems (HY) | Mobile equipment hydraulics, process hydraulic cylinders | Hydraulic pump, servo/proportional valves, cylinder seals |
| Gearboxes (GB) | Gearboxes with circulating oil systems | Oil, bearing surfaces (aerated oil reduces film thickness) |
| Valves (VA) | Control valves in cavitating service, pressure reducing valves | Valve trim (plug, cage, seat), body walls downstream of restriction |
| Compressors (CO) | Liquid ring compressors, oil-flooded screw compressors | Oil system (foam), separator element, bearing surfaces |
| Piping (PI) | Two-phase flow piping, pump suction piping | Pipe wall downstream of flash points, orifice plates, reducers |
| Storage tanks (TA) | Hydraulic reservoirs, lube oil reservoirs | Oil return line (turbulence), baffles, breather systems |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Vibration Effects | Vibration monitoring (cavitation detection — broadband HF) | 1–4 weeks | ISO 10816, ISO 13709 |
| Human Senses | Audible cavitation noise detection | Continuous (operator rounds) | Industry practice |
| Chemical Effects | Oil analysis (foam tendency, air release, oxidation rate) | 1–3 months | ASTM D892, D3427, D974 |
| Primary Effects | Pump performance monitoring (head, flow, NPSH) | Continuous–weekly | ISO 9906, Hydraulic Institute |
| Human Senses | Visual inspection for foam in reservoirs | Daily–weekly | OEM manual |
| Primary Effects | Hydraulic system response testing | Monthly–quarterly | OEM specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred — operations-driven)

- **Primary task**: `Monitor pump NPSH on Slurry Pump [{tag}]`
- **Acceptable limits**: NPSHa ≥ NPSHr + 0.5 m safety margin per ISO 13709. No audible cavitation noise. Pump discharge pressure stable (variation ≤±3%). Oil foam tendency ≤Sequence I: 50/0 mL per ASTM D892. Air release time ≤10 minutes per ASTM D3427. Hydraulic oil reservoir level ≥minimum mark.
- **Conditional comments**: If cavitation detected (noise, vibration, performance drop): verify suction level, check for vortex at pump intake, verify NPSH calculation at actual conditions. If foam in oil reservoir: check for air leaks on suction side, verify return line submerged below oil level, check oil anti-foam additive condition. If hydraulic response spongy: bleed air from system, check cylinder seals, check pump suction line connections. If cavitation erosion found on impeller: correct NPSH deficiency before replacing impeller (otherwise new impeller will erode at same rate).

### Fixed-Time (for system design verification)

- **Task**: `Inspect suction conditions on Pump [{tag}]`
- **Interval basis**: Verify pump suction submergence and anti-vortex provisions at every planned outage. Check suction pipe connections for air tightness annually. Hydraulic system: bleed air from high points after any maintenance activity, verify reservoir level weekly. Oil anti-foam additive replenishment: per oil analysis results. Design review: ensure pump NPSH margin ≥1.3× NPSHr at maximum flow per Hydraulic Institute recommendations.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for critical pumps or hydraulic systems — cavitation erosion destroys impellers within weeks in severe cases, and aerated hydraulic fluid causes control system failure. Acceptable only for non-critical, low-value fluid systems where temporary air entrainment causes minor performance reduction and self-corrects when operating conditions normalize.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Vibration Effects], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — CB strategy with operational basis]*
