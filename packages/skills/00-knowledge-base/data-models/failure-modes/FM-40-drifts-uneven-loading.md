# FM-40: Drifts due to Uneven loading

> **Combination**: 40 of 72
> **Mechanism**: Drifts
> **Cause**: Uneven loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: C (Gradual increase) — uneven loading effects develop progressively as load distribution changes due to wear, settlement, or process variation
> **ISO 14224 Failure Mechanism**: 3.4 Out of adjustment
> **Weibull Guidance**: β typically 1.5–2.5 (gradual), η 5,000–20,000 hours depending on load uniformity and mechanical system stiffness

## Physical Degradation Process

Drift due to uneven loading occurs when asymmetric or non-uniform mechanical loads progressively shift the calibration or set-point of measurement instruments, mechanical devices, or precision assemblies. The drift mechanism is primarily mechanical: uneven loading creates differential stress and strain across the sensing element or mechanical structure, causing a systematic bias in the measurement or function. The drift develops gradually as the load distribution changes over time due to wear patterns, foundation settlement, material accumulation, or process condition changes.

The specific mechanisms include: belt weigher drift when belt tension varies across the width (off-center loading creates uneven roller pressure on load cells); tank weighing system drift when one or more load cells experience differential settlement or thermal expansion; pressure gauge drift from asymmetric piping loads on the gauge connection (side loads on bourdon tubes create zero offset); mechanical linkage drift when wear in pins and bearings creates backlash that is direction-dependent; and control valve positioner drift when uneven packing friction creates different response in opening vs. closing directions.

In OCP phosphate processing, uneven loading drift is significant for: belt weighers at Khouribga conveyor systems where material distribution varies across belt width (off-center loading from chute design); tank weighing systems on slurry mixing and storage tanks at Jorf Lasfar where differential thermal expansion of the tank and load cells creates seasonal drift; flow measurement instruments on multi-phase slurry lines where uneven phase distribution creates measurement bias; and mechanical level gauges on silos and hoppers where uneven material draw-off creates asymmetric loading on the measuring mechanism.

## Detectable Symptoms (P Condition)

- Weighing instrument reading deviating from independent check (test weight or cross-check with flow totalizer)
- Belt weigher calibration shifting with belt loading position (reading changes when material centering changes)
- Tank weighing system showing different reading depending on fill/empty direction (hysteresis >0.5% of span)
- Control valve positioner showing different opening vs. closing calibration (split range)
- Instrument reading sensitive to external piping loads or equipment vibration
- Progressive calibration shift trending in one direction over multiple calibration cycles
- Load cell output imbalance visible at summing junction (one cell reading higher than others under uniform load)
- Process mass balance discrepancy correlated with operating load variation

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Weighing equipment (WE) | Belt weighers on ET-BELT-CONVEYOR, tank weighing systems, truck scales | Load cells, belt idler rollers, summing junctions, calibration chain |
| Input devices (ID) | Pressure instruments with piping loads, differential pressure transmitters | Sensing diaphragm, impulse piping connections, manifold valves |
| Control valves (CV) | Control valves with high packing friction, large butterfly valves | Positioner feedback, actuator spring, packing friction surfaces |
| Level instruments (LI) | Displacer level transmitters, mechanical float gauges | Displacer torque tube, float mechanism, guide wire/tube |
| Flow meters (FM) | Orifice plate differential pressure, venturi meters | ΔP impulse connections, orifice plate centering, upstream flow profile |
| Safety devices (SD) | Spring-loaded safety valves with piping loads | Spring pack, disc alignment, nozzle ring, pipe reaction forces |
| Conveyor scales (WE) | In-motion weighing on belt conveyors | Speed sensor alignment, weigh idler mounting, calibration frame |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Calibration verification with known reference | 3–6 months | OIML R50/R60, ISA 67.04 |
| Primary Effects | Process mass balance reconciliation | Weekly–monthly | Plant material balance procedure |
| Physical Effects | Load cell balance check (individual cell output comparison) | 3–6 months | OIML R76, manufacturer specification |
| Primary Effects | Valve signature test (opening vs. closing response) | 6–12 months | ISA 75.25, IEC 60534-4 |
| Physical Effects | Foundation level survey at weighing installations | 6–12 months | OIML R76 installation requirements |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Verify calibration of Belt Weigher [{tag}]`
- **Acceptable limits**: Accuracy within ±0.5% of applied test load per OIML R50 Class 0.5. Individual load cell outputs balanced within ±2% of each other under uniform load. Belt tracking centered within ±50 mm. Speed sensor calibration within ±0.1% of reference tachometer. No piping strain on instrument connections (valved off and free-standing check).
- **Conditional comments**: If accuracy exceeds ±0.5%: recalibrate with reference test chain or material test, investigate belt tracking and material centering. If individual load cells unbalanced >5%: check foundation level, re-shim load cells, inspect for mechanical binding. If valve positioner shows >2% split between opening/closing: adjust deadband, inspect packing, re-calibrate positioner. If drift is seasonal (correlates with temperature): investigate differential thermal expansion, consider temperature compensation.

### Fixed-Time (for weighing system maintenance)

- **Task**: `Calibrate belt weigher with test chain on Conveyor [{tag}]`
- **Interval basis**: Belt weighers (custody transfer): calibrate monthly per OIML R50. Belt weighers (process control): calibrate every 3–6 months. Tank weighing systems: verify annually with known water volume or test weights. Control valve positioner: stroke test every 6–12 months. Foundation level survey at weighing installations: every 12 months. Clean and inspect weigh idler rollers and speed sensor every 3–6 months.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for custody transfer weighing systems (commercial transaction accuracy required) or safety instrument measurements. Acceptable for non-critical process indication weighing where moderate drift (±2–5%) has no commercial or safety consequence — e.g., hopper level indication for operator guidance only, provided recalibration is performed at regular intervals.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 3.4 Out of adjustment], [REF-01 §3.5 — CB strategy with operational basis]*
