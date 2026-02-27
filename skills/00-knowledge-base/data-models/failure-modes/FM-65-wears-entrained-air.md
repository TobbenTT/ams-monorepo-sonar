# FM-65: Wears due to Entrained air

> **Combination**: 65 of 72
> **Mechanism**: Wears
> **Cause**: Entrained air
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — air entrainment severity depends on unpredictable operating conditions (liquid levels, seal integrity, flow disturbances)
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on cavitation severity and material hardness

## Physical Degradation Process

Wear due to entrained air occurs through cavitation erosion — when air or vapor bubbles entrained in a flowing liquid collapse (implode) near component surfaces, generating micro-jets and shock waves that progressively remove material. The bubble collapse generates pressures exceeding 1 GPa and temperatures >5,000°C at the bubble interface, sufficient to plastically deform and fatigue any engineering material. Each individual collapse removes a microscopic amount of material (nanograms), but at typical cavitation rates of 10⁶–10⁸ collapses per second, cumulative material removal rates of 0.1–10 mm/year are common.

This differs from FM-30 (Degrades due to Entrained air) which focuses on degradation of the fluid medium. Here, the focus is on the physical material removal (wear) from component surfaces. The two mechanisms often co-exist — entrained air simultaneously degrades the fluid and erodes the surfaces. Cavitation wear has a distinctive appearance: a rough, sponge-like, deeply pitted surface concentrated in specific zones where bubble collapse is most intense (downstream of flow restrictions, at impeller vane tips, and near vortex cores).

Cavitation intensity depends on: the pressure margin between local static pressure and vapor pressure (NPSHa - NPSHr); fluid velocity at the cavitation zone; entrained gas bubble population and size distribution; and material cavitation erosion resistance (proportional to hardness and strain energy per ASTM G32). Harder materials resist cavitation better — stellite-faced impellers last 5–10× longer than cast iron in the same cavitating service.

In OCP phosphate processing, cavitation wear is significant for: slurry pump impellers and casings at Khouribga/Benguerir where NPSH margin is marginal in deep sump applications; control valve trim downstream of pressure reduction (flashing and cavitation in phosphoric acid service at Jorf Lasfar); hydrocyclone feed pumps where air is entrained from the sump; and cooling water pumps with suction lift applications at coastal facilities.

## Detectable Symptoms (P Condition)

- Cavitation noise (distinctive crackling, similar to gravel in a tumbling drum)
- Impeller surface showing characteristic spongy cavitation erosion pattern during inspection
- Pump head and efficiency decreasing (cavitation reduces hydraulic performance)
- Vibration spectrum showing broadband high-frequency energy (>5 kHz)
- Material analysis of oil/fluid showing cavitation wear particles (characteristic rounded pits on particle surfaces)
- Wall thinning concentrated at predictable cavitation zones (downstream of restrictions, impeller vane leading edges)
- Valve trim showing localized erosion at vena contracta region
- Increasing pump maintenance frequency (seal failures from shaft vibration caused by cavitation)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), cooling water pumps | Impeller vanes (suction side), casing tongue, wear rings, inducer |
| Valves (VA) | Control valves, pressure-reducing valves, check valves | Valve trim (plug, seat, cage), body walls downstream of restriction |
| Piping (PI) | Downstream of control valves, pump suction piping | Pipe wall at vena contracta, downstream of orifice plates |
| Hydraulic systems (HY) | Hydraulic pumps, actuator cylinders | Pump gears/pistons, valve spools, cylinder walls |
| Hydrocyclones (HC) | Classification cyclones, desliming cyclones | Vortex finder inner surface, apex liner, inlet chamber |
| Turbines (TU) | Hydraulic turbines, steam turbines (wet stage) | Runner blades, guide vanes, nozzle rings |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Vibration Effects | Vibration monitoring (broadband HF cavitation) | 1–4 weeks | ISO 10816, ISO 13709 |
| Human Senses | Cavitation noise detection (stethoscope or ultrasonic) | Weekly (operator rounds) | Industry practice |
| Primary Effects | Pump performance curve (head-flow-NPSH verification) | Monthly–quarterly | ISO 9906, HI 9.6.1 |
| Physical Effects / NDT | UT wall thickness at known cavitation zones | 3–12 months | API 574 |
| Physical Effects | Impeller/trim dimensional inspection at overhaul | Per overhaul cycle | OEM specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor NPSH and vibration on Pump [{tag}]`
- **Acceptable limits**: NPSHa ≥ NPSHr × 1.3 at all operating conditions per HI 9.6.1. No audible cavitation noise. Vibration broadband HF energy within acceptance per ISO 10816. Pump efficiency within 5% of best efficiency point (BEP). No visible cavitation damage on impeller at last inspection.
- **Conditional comments**: If cavitation detected at design flow: verify suction conditions (level, strainer ΔP, piping losses), correct NPSH deficiency. If cavitation at low flow: install minimum flow recirculation line. If impeller cavitation damage <2 mm depth: continue monitoring, plan replacement at next overhaul. If >2 mm depth or performance degraded: schedule impeller replacement, upgrade to cavitation-resistant material (duplex stainless, stellite overlay). If valve trim cavitating: install anti-cavitation trim (multi-stage, labyrinth type per ISA 75.01).

### Fixed-Time (for components in known cavitating service)

- **Task**: `Inspect impeller condition on Pump [{tag}]`
- **Interval basis**: Pump impeller inspection at each major overhaul. Typical impeller life in cavitating slurry service: cast iron 2,000–5,000 hours; high-chrome iron 5,000–12,000 hours; duplex stainless/stellite 10,000–25,000 hours. Control valve trim in cavitating service: inspect annually, replace when erosion exceeds 10% of flow area per IEC 60534. NPSH verification at every process change affecting suction conditions.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for main process pumps — cavitation wear destroys impellers and causes pump failure within weeks in severe cases. Acceptable only for non-critical, small pumps with readily available spares where temporary cavitation during transient conditions is unavoidable and self-correcting.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Vibration Effects], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
