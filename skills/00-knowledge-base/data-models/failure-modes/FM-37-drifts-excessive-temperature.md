# FM-37: Drifts due to Excessive temperature (hot/cold)

> **Combination**: 37 of 72
> **Mechanism**: Drifts
> **Cause**: Excessive temperature (hot/cold)
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — temperature excursion events are unpredictable; drift magnitude depends on the severity and duration of the thermal excursion
> **ISO 14224 Failure Mechanism**: 3.4 Out of adjustment
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on temperature excursion frequency and instrument/component thermal sensitivity

## Physical Degradation Process

Drift due to excessive temperature occurs when a measurement instrument, control device, or precision component is exposed to temperatures outside its rated operating range, causing its output or set-point to shift from the calibrated value. The drift mechanisms include: thermal expansion of sensing elements changing their zero point and span (metallic strain gauges, bourdon tubes, bimetallic elements); semiconductor junction voltage shift with temperature (pressure transmitters, thermocouples, pH electrodes); fluid property changes in hydraulic/pneumatic actuators (viscosity change affecting response); spring rate change in mechanical devices (relief valves, regulators, switch contacts); and permanent material property change after thermal excursion (annealing of strain-hardened springs, aging of piezoelectric crystals).

The drift can be temporary (returning to normal when temperature normalizes) or permanent (thermal excursion permanently alters the sensing element or mechanical set-point). Temporary drift is predictable and can be compensated by temperature correction algorithms in modern smart transmitters. Permanent drift requires recalibration or replacement. The critical distinction is that drift due to excessive temperature occurs at temperatures OUTSIDE the instrument's specified operating range — within-range temperature effects are compensated by design.

In OCP phosphate processing, temperature-induced drift is significant for: pressure transmitters near kilns and dryers at Khouribga/Youssoufia where ambient temperatures can exceed 60°C (many transmitters rated to 55°C only); pH and ORP electrodes in phosphoric acid circuits at Jorf Lasfar where process temperatures reach 80–110°C; safety relief valves on steam systems where thermal effects change the set-point; flow meters on hot slurry lines; and outdoor instrumentation at all sites during summer heat waves (ambient >45°C in inland Morocco) or cold winter nights (<0°C at Khouribga altitude).

## Detectable Symptoms (P Condition)

- Instrument reading deviating from independent cross-check or redundant measurement by >1% of span
- Calibration drift detected during scheduled verification (>0.5% of span shift since last calibration)
- Instrument ambient temperature alarm or diagnostic flag indicating out-of-range operation
- Control loop performance degradation (increasing oscillation, offset, or hunting)
- Safety relief valve leak-by or premature lift (set-point drift from thermal effects)
- Actuator response time change (hydraulic fluid viscosity affected by temperature)
- Process quality deviation correlated with temperature excursion events
- Smart transmitter self-diagnostics reporting sensor error or compensation limit reached

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Input devices (ID) | Pressure transmitters (CL-INSTR-PRESSURE), temperature sensors, pH meters | Sensing elements, signal conditioning electronics, reference junctions |
| Analyzers (AN) | pH/ORP analyzers, conductivity meters, gas analyzers | Electrode assemblies, reference cells, optical sensors, sample conditioning |
| Control valves (CV) | Control valves with positioners, actuators | Positioner electronics, pneumatic actuators (air viscosity), spring packs |
| Safety devices (SD) | Pressure safety valves (PSVs), temperature safety switches | Spring set-point, pilot valve, thermal relief valves |
| Flow meters (FM) | Electromagnetic flow meters, Coriolis meters, ultrasonic meters | Coil electronics, signal processors, transducer elements |
| Level instruments (LI) | Level transmitters, radar/ultrasonic level gauges | Transducer elements, electronics modules, float mechanisms |
| Control logic units (CL) | PLC/DCS modules in high-temperature locations | I/O cards, power supplies, communication modules |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Calibration verification (comparison with reference) | 3–12 months | ISA 67.04, IEC 61511 |
| Primary Effects | Redundant instrument cross-checking | Continuous | IEC 61511 (SIS), ISA 84 |
| Temperature Effects | Instrument ambient temperature monitoring | Continuous | OEM rated operating range |
| Electrical Effects | Smart transmitter diagnostics review | Monthly–quarterly | NAMUR NE 107, ISA 108 |
| Primary Effects | Control loop performance monitoring | Weekly–monthly | ISA 67.04, IEC 61131 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Verify calibration of Pressure Transmitter [{tag}]`
- **Acceptable limits**: Drift ≤±0.5% of calibrated span per ISA 67.04 for safety-related instruments. Drift ≤±1.0% of span for non-safety process instruments. Ambient temperature within manufacturer-specified operating range. No active diagnostic alarms on smart transmitters.
- **Conditional comments**: If drift 0.5–1.0% on safety instrument: recalibrate within 30 days, investigate temperature exposure. If drift >1.0%: recalibrate immediately, install sun shade or thermal barrier if ambient temperature is the cause. If permanent drift detected after thermal event: replace sensing element (calibration will not hold). If repeated drift on same instrument: relocate to cooler/more stable environment or upgrade to higher-temperature-rated model.

### Fixed-Time (for calibration programs)

- **Task**: `Calibrate pressure transmitter on Instrument [{tag}]`
- **Interval basis**: Safety-instrumented system (SIS) instruments: per SIL verification calculation, typically 6–12 months per IEC 61511. Process instruments in stable environment: 12–24 months. Instruments in harsh thermal environment (near kilns, dryers): 3–6 months until drift rate is characterized. pH electrodes in hot acid service: 1–3 months (high drift rate). Safety relief valves: per API 576 (typically 3–5 years), reduced to 1–3 years if thermal cycling is severe.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for safety-instrumented systems (SIS/SIF) or instruments providing measurements for safety-critical decisions. Acceptable only for non-critical process indication instruments where drift causes minor process inefficiency rather than safety or environmental risk, AND where redundant measurement exists.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 3.4 Out of adjustment], [REF-01 §3.5 — CB strategy with operational basis]*
