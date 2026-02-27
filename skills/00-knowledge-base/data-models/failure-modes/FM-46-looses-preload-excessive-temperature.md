# FM-46: Looses Preload due to Excessive temperature

> **Combination**: 46 of 72
> **Mechanism**: Looses Preload
> **Cause**: Excessive temperature
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — temperature excursions beyond design are unpredictable process upsets; preload loss occurs rapidly during the event rather than progressively with age
> **ISO 14224 Failure Mechanism**: 1.5 Looseness
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on temperature excursion magnitude, bolt/gasket material, and thermal protection adequacy

## Physical Degradation Process

Preload loss due to excessive temperature occurs when a bolted or clamped assembly is exposed to temperatures significantly above its design rating, causing three simultaneous mechanisms: differential thermal expansion between bolt and flange materials (if materials have different coefficients of thermal expansion, the preload changes — typically, austenitic stainless steel bolts in carbon steel flanges lose preload as the bolts expand more than the flange); reduction in bolt material yield strength at elevated temperature (carbon steel loses ~30% yield strength at 400°C, ~50% at 500°C per ASME B16.5), causing permanent bolt elongation at loads that were elastic at ambient temperature; and gasket material degradation where temperature exceeds the gasket's maximum service rating (spiral wound with graphite filler: 450°C, PTFE: 260°C, rubber: 80–150°C), causing gasket burnout, embrittlement, or thermal decomposition.

Unlike creep (FM-45) which is a slow, predictable process at normal operating temperatures, excessive temperature preload loss occurs during abnormal transient events — furnace upsets, cooling system failures, fire exposure, or process runaways. The damage can be immediate and severe: a single temperature excursion can permanently relax bolt preload if the bolt material exceeds its elastic limit at the elevated temperature. Thermal shock (rapid heating or cooling) is particularly damaging because it creates transient differential expansion that can exceed the bolt elongation, temporarily unloading the gasket and allowing process fluid ingress that further degrades the seal.

In OCP phosphate processing, excessive temperature events occur during: kiln and dryer upsets at Khouribga and Youssoufia (flame impingement on casing flanges during refractory failure — temperatures can exceed 500°C locally); steam system overpressure events causing superheated steam exposure; exothermic reaction runaways in phosphoric acid attack tanks at Jorf Lasfar; and fire events in cable trays near process piping. The prevalence of PTFE-lined gaskets in phosphoric acid service (for corrosion resistance) means that even moderate temperature excursions (>260°C) can decompose the gasket material, releasing toxic fumes and causing sudden seal failure.

## Detectable Symptoms (P Condition)

- Temperature alarms indicating process temperature above design basis (DCS/SCADA high-high alarm)
- Visible discoloration of bolt heads or nuts indicating exposure to excessive temperature (temper colors: straw at 200°C, blue at 300°C, black at >400°C for carbon steel)
- Gasket material decomposition visible as charring, brittleness, or powdering at flange edges
- Bolt torque check after temperature event showing <60% of specified preload (per ASME PCC-1)
- Flange distortion measurable after thermal event (>0.15 mm out-of-flat per ASME B16.5)
- Leakage developing immediately after or during a temperature excursion event
- Bolt hardness reduction measured by portable hardness tester (>15% loss indicates over-tempering)
- Paint or thermal indicator labels on flanges showing evidence of temperature exceedance

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Rotary equipment (RO) | Rotary kilns (Khouribga, Youssoufia), rotary dryers, calciners | Shell flange bolting, seal ring connections, hot gas duct flanges |
| Pressure vessels (VE) | Steam drums, superheaters, high-temperature reactors | Manway studs, nozzle flange bolting, safety valve flanges |
| Heat exchangers (HE) | Waste heat boilers, acid coolers, steam generators | Tube sheet bolting, channel cover bolting, expansion bellows flanges |
| Piping (PI) | Steam piping, phosphoric acid hot piping, kiln gas ducts | Flange gaskets at temperature transitions, expansion joint bolting |
| Valves (VA) | High-temperature isolation valves, steam control valves, PSVs | Bonnet bolting, body-bonnet gaskets, packing gland |
| Boilers (BO) | Waste heat boilers at Jorf Lasfar, auxiliary steam boilers | Handhole/manhole gaskets, header connection bolting, safety valve flanges |
| Furnaces and fired equipment (FU) | Phosphate dryers, calciners, reactivation furnaces | Combustion chamber flanges, duct connections, sight glass seals |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Process temperature monitoring (DCS/SCADA) | Continuous | Process design specification |
| Temperature Effects | Temperature indicating paint/labels on critical flanges | Event-based | ASTM E1321 (equivalent) |
| Physical Effects | Post-event bolt torque verification | After each event | ASME PCC-1, EN 1591-4 |
| Physical Effects | Post-event flange flatness measurement | After each event | ASME B16.5, ASME PCC-2 |
| Human Senses | Visual inspection for heat discoloration and gasket damage | 1–4 weeks | API 574, ASME PCC-2 |
| Physical Effects / NDT | Bolt hardness testing after temperature excursion | After each event | ASTM E110, ISO 6506 |

## Maintenance Strategy Guidance

### Condition-Based (preferred — event-driven)

- **Primary task**: `Inspect bolt condition on Flange Joint [{tag}] after temperature event`
- **Acceptable limits**: Bolt preload ≥80% of target after temperature excursion per ASME PCC-1. No visible gasket discoloration, charring, or embrittlement. Bolt hardness within 10% of specification per ASTM A193/A320. Flange flatness within ASME B16.5 Table 6.2 tolerances.
- **Conditional comments**: If temperature excursion >120% of gasket maximum rating: replace gasket at next depressurization regardless of visible condition (material properties are permanently degraded). If bolt temper colors indicate >350°C exposure: replace all bolts in the joint (yield strength permanently reduced). If flange distortion >0.15 mm: machine flange faces before re-gasketing. If temperature exceeded bolt material creep threshold: replace bolts AND evaluate flange integrity per ASME PCC-2 fitness-for-service.

### Fixed-Time (for thermal protection verification)

- **Task**: `Verify thermal protection on High-Temperature Flange [{tag}]`
- **Interval basis**: Verify temperature alarm setpoints annually (alarm must activate before bolt/gasket thermal limit is reached). Inspect thermal insulation on hot flanges every 12 months (damaged insulation exposes bolting to excessive temperature). For PTFE gaskets in acid service: verify temperature monitoring functional and alarm set at 230°C (30°C below PTFE decomposition). Test emergency cooling systems on critical vessels annually.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for joints in high-temperature service containing hazardous fluids — sudden seal failure from thermal damage can cause burns, toxic release, or fire. Acceptable only for low-consequence joints in non-hazardous service where temporary leakage can be safely contained (e.g., cooling water flanges with secondary containment).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 1.5 Looseness], [REF-01 §3.5 — CB strategy with operational basis]*
