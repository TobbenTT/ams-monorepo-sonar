# FM-45: Looses Preload due to Creep

> **Combination**: 45 of 72
> **Mechanism**: Looses Preload
> **Cause**: Creep
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — creep is a time-dependent, thermally activated process; preload loss is progressive and relatively predictable based on temperature, stress, and material properties
> **ISO 14224 Failure Mechanism**: 1.5 Looseness
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 20,000–60,000 hours depending on temperature, initial preload, and gasket/bolt material

## Physical Degradation Process

Preload loss due to creep occurs when materials in a bolted or clamped assembly undergo slow, time-dependent plastic deformation under sustained stress at elevated temperature. Creep is a thermally activated process that becomes significant when the material temperature exceeds approximately 30–40% of its absolute melting temperature (for carbon steel: >300°C; for polymeric gaskets: >60°C; for PTFE: >100°C). The creep mechanism progresses through three stages: primary creep (decelerating strain rate as work hardening occurs), secondary creep (steady-state strain rate — the dominant design consideration), and tertiary creep (accelerating strain rate leading to rupture).

In bolted joints, creep occurs simultaneously in multiple components: the gasket material creeps (thins) under compressive stress, reducing the bolt elongation and therefore the clamping force; the bolt itself creeps at elevated temperature, reducing its elastic stored energy; and the flange material creeps under bending loads, changing the load distribution across the gasket. The net effect is progressive reduction in clamping force (preload) that follows a logarithmic time relationship — the majority of creep relaxation occurs in the first 1,000–5,000 hours, with the rate decreasing thereafter. However, each thermal cycle resets some of this relaxation, so cyclic temperature service accelerates cumulative preload loss.

In OCP phosphate processing, creep-induced preload loss is most significant in: flanged joints on phosphoric acid piping at Jorf Lasfar where process temperatures reach 80–110°C with PTFE-lined gaskets; bolted connections on rotary kiln and dryer shells at Khouribga and Youssoufia where temperatures reach 300–900°C; expansion joint flanges on hot gas ducts; and pressure vessel manway gaskets that operate at elevated temperature and pressure. The combination of phosphoric acid corrosion and elevated temperature is particularly aggressive — bolt material degradation from acid exposure compounds the creep mechanism.

## Detectable Symptoms (P Condition)

- Bolt torque check showing <80% of specified installation torque (measured by calibrated torque wrench per ASME PCC-1)
- Visible gasket extrusion at flange edges (gasket material squeezing outward under compression)
- Flange gap opening measurable by feeler gauge (>0.1 mm gap at any point around circumference)
- Minor weeping or seepage at gasketed joints (first evidence of seal compromise)
- Ultrasonic bolt tension measurement showing >10% preload loss from installation value per ASTM E1685
- Flange rotation (warping) detectable by straightedge or dial indicator (>0.1° per ASME PCC-1)
- Increasing leak rate at pressure testing compared to previous hydro-test results

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pressure vessels (VE) | Phosphoric acid reactors, separators, digesters, autoclaves | Manway gaskets, nozzle flange gaskets, sight glass seals |
| Heat exchangers (HE) | ET-HEAT-EXCHANGER (acid coolers), shell-and-tube units | Tube sheet gaskets, channel cover gaskets, floating head packing |
| Piping (PI) | Phosphoric acid piping, steam piping, hot gas ducts | Flange gaskets (spiral wound, PTFE, graphite), expansion joint flanges |
| Valves (VA) | High-temperature isolation valves, pressure relief valves | Bonnet gaskets, body-bonnet bolting, packing gland studs |
| Pumps (PU) | ET-SLURRY-PUMP (CL-SEAL-MECHANICAL), acid transfer pumps | Casing split-line gaskets, stuffing box gland packing |
| Rotary equipment (RO) | Rotary kilns, rotary dryers at Khouribga/Youssoufia | Shell flange connections, riding ring bolts, gear guard bolting |
| Compressors (CO) | Process gas compressors, high-pressure air | Cylinder head gaskets, intercooler flange gaskets, packing case bolting |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Ultrasonic bolt tension measurement | 6–12 months | ASTM E1685, EN 14399 |
| Physical Effects | Torque audit (calibrated wrench verification) | 6–12 months | ASME PCC-1, EN 1591-4 |
| Human Senses | Visual inspection for leakage, gasket extrusion | 1–4 weeks | ASME PCC-2 §5, API 574 |
| Primary Effects | Leak detection (snoop fluid, acoustic emission) | 1–3 months | EN 1779, ASTM E1002 |
| Physical Effects | Flange gap measurement (feeler gauge) | 6–12 months | ASME PCC-1 Appendix O |

## Maintenance Strategy Guidance

### Condition-Based (preferred for critical joints)

- **Primary task**: `Measure bolt tension on Flange Joint [{tag}]`
- **Acceptable limits**: Bolt preload ≥80% of target installation preload per ASME PCC-1. No visible gasket extrusion beyond outer bolt circle. No detectable leakage by visual or snoop test. Flange gap uniform within ±0.2 mm around circumference.
- **Conditional comments**: If preload 70–80% of target: schedule re-torque at next planned outage (within 90 days), re-torque using star pattern per ASME PCC-1 §5. If preload <70% or visible gasket extrusion: plan gasket replacement at next outage (cannot reliably re-torque a crept gasket). If active leakage at process temperature: apply emergency clamp if available, schedule depressurize-and-repair within 7 days per API 574 risk assessment.

### Fixed-Time (primary strategy for thermal creep)

- **Task**: `Re-torque hot bolting on Flange Joint [{tag}]`
- **Interval basis**: Initial re-torque at 24 hours after commissioning (to address embedment and initial creep). Subsequent re-torque at first planned thermal shutdown. Thereafter: every 12–24 months for joints operating >200°C; every 24–48 months for joints operating 80–200°C. For PTFE/expanded PTFE gaskets: re-torque at 6–12 months regardless of temperature due to PTFE's high creep rate. Use live-loaded (Belleville washer) bolting for critical joints to compensate for creep between re-torque intervals per ASME PCC-1 Appendix L.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable only for low-consequence joints where leakage has no safety, environmental, or significant production impact — e.g., drain flanges with secondary containment, utility water flanges. NEVER acceptable for joints containing hazardous fluids (acids, steam >100°C, flammable gases), pressure vessels, or joints where leakage could cause environmental contamination.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 1.5 Looseness], [REF-01 §3.5 — FT strategy with calendar basis]*
