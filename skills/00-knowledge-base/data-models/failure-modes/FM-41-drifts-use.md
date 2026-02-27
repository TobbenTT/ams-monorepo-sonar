# FM-41: Drifts due to Use

> **Combination**: 41 of 72
> **Mechanism**: Drifts
> **Cause**: Use
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — normal operational use causes progressive, predictable drift in calibration as sensing elements age, springs relax, and mechanical tolerances increase
> **ISO 14224 Failure Mechanism**: 3.4 Out of adjustment
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 5,000–30,000 hours depending on instrument type, process conditions, and operating environment severity

## Physical Degradation Process

Drift due to normal use occurs when the cumulative effect of regular operation progressively shifts the output of measurement instruments, set-points of protective devices, or calibration of precision equipment away from their calibrated values. This is the expected, designed-for aging of instrument systems — all measurement devices drift over time due to inherent material aging, mechanical wear, and environmental exposure. The rate of drift is the primary factor in determining calibration intervals.

The specific aging mechanisms include: elastic after-effect (anelasticity) in metallic sensing elements (bourdon tubes, bellows, diaphragms) where repeated stress cycling causes progressive zero shift; electrode aging in electrochemical sensors (pH glass electrodes: impedance increases with age causing slower response and drift; reference electrodes: electrolyte depletion shifts reference potential); spring relaxation in mechanical devices (safety valves, pressure regulators, mechanical switches) where sustained compression causes stress relaxation and set-point increase; electronic component aging (capacitor dielectric absorption, resistor value drift, op-amp offset drift); and wear in mechanical linkages (potentiometer wipers, gear trains, lever pivots) creating backlash and non-linearity.

In OCP phosphate processing, use-related drift rates are accelerated by the harsh operating environment: pH electrodes in phosphoric acid service at Jorf Lasfar drift faster than nominal due to acid attack on the glass membrane (typical pH electrode life 3–6 months vs. 12–24 months in clean water); pressure transmitters in slurry service experience diaphragm coating and wear that shifts zero; thermocouples in kiln exhaust gas at Khouribga experience junction degradation from thermal cycling; safety valves on phosphoric acid vessels drift upward in set-point as spring relaxation and seat corrosion combine; and electromagnetic flow meters on slurry pipelines experience electrode fouling that shifts the flow signal.

## Detectable Symptoms (P Condition)

- Progressive calibration drift trending over multiple calibration cycles (consistent direction shift)
- As-found calibration data showing systematic shift from as-left values
- Instrument reading gradually diverging from redundant measurement
- Control loop performance slowly degrading (increasing offset, longer settling time)
- Safety valve set-point drifting above nameplate pressure at successive pop tests
- pH electrode response time increasing (>30 seconds to reach 95% of step change)
- Mechanical gauge hysteresis increasing (difference between increasing and decreasing readings)
- Smart transmitter diagnostics showing sensor aging parameters approaching limits

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Input devices (ID) | All process transmitters (CL-INSTR-PRESSURE, CL-INSTR-FLOW, CL-INSTR-LEVEL, CL-INSTR-TEMPERATURE) | Sensing elements, electronics, mechanical components |
| Analyzers (AN) | pH analyzers, turbidity meters, density meters, gas analyzers | pH glass electrode, reference electrode, optical windows, sample systems |
| Safety devices (SD) | Pressure safety valves (PSVs), thermal safety devices, SIS instruments | Spring pack, seat/disc, pilot valves, sensing elements |
| Control valves (CV) | Control valves with positioners, I/P converters | Positioner feedback mechanism, I/P converter, actuator spring |
| Flow meters (FM) | Electromagnetic flow meters, Coriolis meters, turbine meters | Electrodes (EMF), drive/sensor coils (Coriolis), turbine bearings |
| Level instruments (LI) | DP level transmitters, guided wave radar, capacitance probes | Sensing diaphragm, electronics drift, probe contamination |
| Weighing equipment (WE) | Belt weighers, platform scales, tank weighing | Load cell creep, summing electronics, speed sensor |
| Temperature instruments (TI) | Thermocouples (all types), RTDs, infrared pyrometers | TC junction (drift from diffusion), RTD element (strain relief), IR lens |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Scheduled calibration verification | 3–24 months | ISA 67.04, IEC 61511, API 576 |
| Primary Effects | As-found/as-left calibration data trending | Each calibration | ISA TR84.00.03 |
| Primary Effects | Redundant instrument cross-checking | Continuous | IEC 61511, ISA 84 |
| Primary Effects | Smart transmitter diagnostics monitoring | Monthly–quarterly | NAMUR NE 107, ISA 108 |
| Primary Effects | Control loop performance monitoring | Weekly–monthly | ISA 67.04 |
| Primary Effects | Safety valve pop-test and set-point verification | Per API 576 | API 576, ASME PCC-3 |

## Maintenance Strategy Guidance

### Condition-Based (preferred where feasible)

- **Primary task**: `Verify calibration of Process Transmitter [{tag}]`
- **Acceptable limits**: As-found deviation ≤±0.5% of span for SIS instruments per ISA 67.04. As-found deviation ≤±1.0% of span for non-safety process instruments. Safety valve set-point within ±3% of nameplate per API 576. pH electrode slope >85% of Nernst theoretical (>50 mV/pH at 25°C). Thermocouple drift ≤±1.1°C or ±0.4% (whichever is greater) per IEC 60584 tolerance class.
- **Conditional comments**: If SIS instrument drift >0.5% of span: recalibrate, assess if calibration interval should be shortened per ISA TR84.00.03 methodology. If pH electrode slope <85%: replace electrode. If thermocouple drift >tolerance class: replace thermocouple (junction diffusion is irreversible). If safety valve set-point drift >3%: overhaul valve (lapping seat, replacing spring if relaxed), re-test. Track drift rate over multiple calibration cycles to optimize calibration intervals — extend intervals if drift is consistently within tolerance, shorten if approaching limits.

### Fixed-Time (primary strategy for calibration programs)

- **Task**: `Calibrate instrument on Process Transmitter [{tag}]`
- **Interval basis**: Calibration intervals based on instrument type, service severity, and safety criticality. Typical intervals for OCP: safety instruments (SIS/SIF) per SIL calculation, typically 6–12 months per IEC 61511; process transmitters in clean service 12–24 months; process transmitters in slurry/acid service 3–6 months; pH electrodes in acid service 1–3 months; thermocouples in high-temperature service 12 months; safety valves per API 576 (typically 3–5 years, reduced for severe service); belt weighers 1–6 months per OIML R50. Use as-found/as-left data to validate and adjust intervals per ISA TR84.00.03.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for safety instruments (SIS/SIF), custody transfer measurements, environmental compliance monitors, or any measurement used for safety-critical decisions. Acceptable only for non-critical local indication instruments where moderate drift has negligible process consequence AND where the instrument is periodically compared to a calibrated reference.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 3.4 Out of adjustment], [REF-01 §3.5 — FT strategy with operational basis]*
