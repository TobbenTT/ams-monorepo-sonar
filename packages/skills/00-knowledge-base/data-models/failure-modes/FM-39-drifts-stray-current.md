# FM-39: Drifts due to Stray current

> **Combination**: 39 of 72
> **Mechanism**: Drifts
> **Cause**: Stray current
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — stray current effects accumulate progressively as grounding systems degrade, EMI sources multiply, or cathodic protection systems age
> **ISO 14224 Failure Mechanism**: 3.4 Out of adjustment
> **Weibull Guidance**: β typically 1.5–2.5 (gradual), η 5,000–20,000 hours depending on electrical environment quality and shielding/grounding integrity

## Physical Degradation Process

Drift due to stray current occurs when unwanted electrical currents flowing through unintended paths (earth, structural steel, piping, instrument signal cables) introduce parasitic voltages or currents into measurement circuits, causing the instrument reading to shift from the true process value. Stray currents originate from: ground fault leakage currents flowing through the plant grounding grid; VFD-generated common-mode noise coupling into instrument cables through capacitive or inductive pathways; cathodic protection systems where protection current follows unintended paths through instrumentation circuits; welding operations where return current flows through nearby piping and instruments; and electromagnetic interference (EMI) from high-power equipment (arc furnaces, large motors, switchgear) coupling into signal wiring.

The drift mechanism depends on the coupling pathway: galvanic coupling (direct metal contact) creates DC offsets in thermocouple and millivolt circuits; capacitive coupling creates AC noise that biases average readings; inductive coupling creates voltage spikes correlated with switching events; and ground loops (multiple grounding points at different potentials) create circulating currents that offset measurement signals. For low-level signals (thermocouples: 0–50 mV, RTDs: 0–10 Ω change, pH: 0–1400 mV), even small stray currents of microamperes can cause significant reading errors.

In OCP phosphate processing, stray current drift is particularly problematic at: the Jorf Lasfar industrial complex where extensive VFD installations create high common-mode noise (slurry pumps, conveyor drives); cathodic protection systems on underground piping and tank bottoms that can couple into nearby instrument circuits; welding-intensive maintenance areas at Khouribga where arc welding return currents find paths through instrumentation; large motor starting events that create ground potential shifts; and long instrument cable runs in cable trays parallel to power cables where electromagnetic coupling is maximized.

## Detectable Symptoms (P Condition)

- Instrument reading offset that varies with nearby electrical equipment operation (correlates with motor starts, VFD operation, or welding)
- Difference between instrument reading and portable calibrator when process is stable (offset present only in installed condition)
- Noisy or fluctuating instrument signal detectable on oscilloscope or signal analyzer
- Thermocouple reading offset from RTD measuring same process point (ground loop in TC circuit)
- pH measurement drifting when nearby cathodic protection system is energized
- Instrument loop current showing AC ripple >1% of span (measurable by oscilloscope on 4-20 mA loop)
- Increased control loop variability correlated with electrical events in the plant
- EMI survey showing field strength exceeding instrument immunity rating per IEC 61326

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Input devices (ID) | Thermocouples, RTDs, pH meters, low-level signal instruments | Thermocouple extension wire, RTD leads, signal cables, transmitter electronics |
| Analyzers (AN) | pH/ORP analyzers at Jorf Lasfar, conductivity meters, dissolved oxygen | Reference electrode, measuring electrode, preamplifier, signal cable |
| Control logic units (CL) | PLC/DCS analog input modules, safety system inputs | Analog input cards (common mode rejection), communication interfaces |
| Flow meters (FM) | Electromagnetic flow meters (affected by stray DC currents) | Electrode-to-fluid interface, signal cable shield, electronics module |
| Weighing equipment (WE) | Belt weighers, tank weighing systems | Load cell cables, summing junction box, transmitter analog circuits |
| Level instruments (LI) | Capacitance level probes, guided wave radar | Probe-to-vessel electrical connection, cable shield continuity |
| Safety devices (SD) | SIS input instruments, fire/gas detection sensors | Sensor signal circuit, barrier modules, field wiring |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Electrical Effects | Instrument signal quality analysis (noise, ripple) | 3–6 months | IEC 61326, NAMUR NE 21 |
| Electrical Effects | Ground resistance measurement (instrument grounding) | 6–12 months | IEEE 142, IEC 60364-5-54 |
| Primary Effects | Calibration verification (installed vs. bench comparison) | 6–12 months | ISA 67.04 |
| Electrical Effects | EMI survey near sensitive instruments | 12–24 months | IEC 61326-1 |
| Electrical Effects | Cable shield continuity and insulation test | 12–24 months | IEC 62153, NAMUR NE 21 |
| Primary Effects | Redundant instrument cross-checking | Continuous | IEC 61511 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure signal quality on Instrument Loop [{tag}]`
- **Acceptable limits**: AC noise on 4-20 mA signal ≤1% of span (≤0.16 mA peak-to-peak) per NAMUR NE 21. DC offset between installed reading and portable reference ≤0.5% of span. Ground resistance of instrument earth ≤10 Ω per IEEE 142. Cable shield connected at transmitter end only (single-point grounding) per ISA RP12.06.
- **Conditional comments**: If noise >1% of span: check cable shield continuity, verify single-point grounding, check routing separation from power cables (minimum 300 mm per IEC 61000-5-2). If DC offset present only when installed: check for ground loops, isolate with signal isolator or isolating barrier. If drift correlates with CP system: install galvanic isolator on affected instrument circuits. If EMI from VFDs: install ferrite chokes on instrument cables, consider fiber-optic signal transmission for critical loops.

### Fixed-Time (for grounding system maintenance)

- **Task**: `Test instrument grounding on Instrument Earth Grid [{tag}]`
- **Interval basis**: Instrument earth resistance test every 12 months per IEEE 142 (target ≤10 Ω, investigate if >25 Ω). Cable shield integrity test every 12–24 months. Power cable/instrument cable separation audit every 24 months (new installations or modifications may compromise separation). Cathodic protection system interference survey every 12 months per NACE SP0169 where CP systems operate near instrumentation.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for safety-instrumented systems (SIS) or measurements used for custody transfer, environmental compliance, or safety-critical control. Acceptable only for non-critical local indication where moderate drift has no process consequence and the instrument is cross-checked by redundant measurements.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Electrical Effects], [ISO 14224 Table B.2 — 3.4 Out of adjustment], [REF-01 §3.5 — CB strategy with calendar basis]*
