# FM-02: Blocks due to Contamination

> **Combination**: 2 of 72
> **Mechanism**: Blocks
> **Cause**: Contamination
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — contamination accumulates progressively with exposure time, causing gradual flow restriction until functional failure
> **ISO 14224 Failure Mechanism**: 5.1 Blockage/plugged
> **Weibull Guidance**: β typically 2.0–3.0 (wear-out), η 1,000–5,000 hours depending on fluid cleanliness, filtration effectiveness, and temperature

## Physical Degradation Process

Foreign particles, scale, biological growth, or process byproducts progressively accumulate on internal surfaces and flow passages, reducing the effective cross-sectional area available for flow. The rate of accumulation depends on fluid cleanliness (particle concentration and size distribution), velocity profile (low-velocity zones promote deposition), temperature (which affects deposit adhesion, solubility, and biological growth rate), and surface roughness (rougher surfaces trap particles more readily). As restriction increases, differential pressure across the component rises, flow rate decreases, and upstream pressure builds.

The blockage progression typically follows three stages: initial fouling layer formation (particles adhere to surface, establishing a base layer within days to weeks); progressive accumulation (deposit thickness grows, flow restriction increases at an accelerating rate as the reduced passage increases local velocity and turbulence which traps more particles); and complete blockage (flow passage is fully occluded or pressure drop exceeds the driving force available). Partial blockage may persist for extended periods if fluid velocity through the remaining passage is sufficient to prevent further deposition — a self-regulating equilibrium that masks the true severity.

In OCP phosphate slurry circuits, the primary contaminants are: calcium sulfate (gypsum) scale in phosphoric acid heat exchangers and piping at Jorf Lasfar (CaSO₄ solubility decreases with temperature, so cooling circuits are most affected); fine phosphate clay particles (attapulgite, palygorskite) that form gel-like deposits in low-velocity zones; marine biological fouling (barnacles, mussels, algal biofilm) in seawater cooling systems at Jorf Lasfar and Safi; and calcium fluoride (CaF₂) deposits in filtration circuits where fluorine from phosphate rock precipitates with calcium.

## Detectable Symptoms (P Condition)

- Increasing differential pressure across the component (ΔP trending >50% above clean baseline)
- Decreasing flow rate at constant upstream pressure (>10% below design)
- Rising upstream pressure with constant downstream demand
- Visible deposits or discoloration at inlet/outlet during visual inspection
- Increasing motor current on driven pumps (higher head required to maintain flow)
- Heat exchanger approach temperature increasing (fouled surface reduces heat transfer)
- Process fluid temperature deviation from design due to reduced cooling/heating capacity
- Instrument impulse lines giving sluggish or erratic readings

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Filters and strainers (FS) | ET-BELT-FILTER cloth (CL-FILTER-CLOTH), oil filters (CL-FILTER-CARTRIDGE), Y-strainers | Filter element, basket, cartridge, screen, filter plate drainage channels |
| Valves (VA) | ET-SLURRY-PUMP suction valves (CL-VALVE-PINCH), control valves, small-bore isolation valves | Seat, disc/ball, body bore, small-bore connections, actuator vent ports |
| Pumps (PU) | ET-SLURRY-PUMP suction strainer (CL-IMPELLER-SLURRY), metering pumps | Suction strainer, impeller eye, wear ring clearance, balance holes |
| Heat exchangers (HE) | ET-HEAT-EXCHANGER (phosphoric acid coolers), seawater coolers, lube oil coolers | Tube bundle (internal and external), plates, baffles, nozzles |
| Piping (PI) | Slurry pipelines, impulse lines, sample lines, drain lines | Small-bore branches, dead legs, restriction orifices, pipe bends |
| Input devices (ID) | Pressure transmitters (CL-INSTR-PRESSURE), flow meters (CL-INSTR-FLOW), level probes | Impulse lines, sensing ports, orifice plates, sample lines, probe tips |
| Cooling systems (CS) | Seawater cooling circuits at Jorf Lasfar/Safi, closed-loop glycol systems | Cooling towers (fill media), spray nozzles, condenser tubes |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Differential pressure measurement across component | 1–4 weeks | OEM max ΔP specification |
| Primary Effects | Flow rate monitoring vs. design baseline | 1–4 weeks | Process design specification |
| Primary Effects | Heat transfer performance monitoring (UA trending) | 1–4 weeks | TEMA, ASME PTC 12.5 |
| Human Senses | Visual inspection of strainer/filter condition | 1–3 days | OEM service manual |
| Chemical Effects | Process fluid analysis (solids content, scaling indices) | Monthly–quarterly | ASTM D2540, Langelier/Ryznar index |
| Temperature Effects | Thermography for blocked passages (temperature anomalies) | 1–3 months | ISO 18434-1 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure differential pressure on Filter [{tag}]`
- **Acceptable limits**: ΔP ≤ 2× clean baseline per OEM specification. Flow rate ≥90% of design at rated operating conditions. Heat exchanger approach temperature ≤design + 5°C.
- **Conditional comments**: If ΔP 2–3× baseline: plan element cleaning/replacement within 2 weeks. If ΔP >3× baseline or exceeds OEM maximum: replace/clean immediately to prevent bypass or upstream damage. If heat exchanger UA <70% of design: schedule chemical or mechanical cleaning within 30 days. If instrument impulse line blocked: flush immediately (loss of process measurement is a safety risk for critical loops).

### Fixed-Time (for known fouling environments)

- **Task**: `Replace filter element on Filter [{tag}]`
- **Interval basis**: OEM recommended interval adjusted for process fluid cleanliness. Typical intervals: phosphate slurry service 1–3 months; seawater cooling (biofouling) 3–6 months with chlorination; oil filters 1,000–3,000 hours or per OEM; instrument impulse lines (manual flush) weekly to monthly in slurry service. For heat exchangers: chemical CIP (clean-in-place) every 3–6 months using appropriate chemistry (acid wash for scale, biocide for biofilm per TEMA guidelines).

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable when redundant/standby filtration exists and blockage has no safety or production consequence (e.g., duplex filter arrangement with auto-switchover). NOT acceptable for single-path filters protecting critical equipment, instrument impulse lines providing safety-critical measurements, or heat exchangers where blockage leads to overheating failure.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 5.1 Blockage/plugged], [REF-01 §3.5 — CB strategy with calendar basis]*
