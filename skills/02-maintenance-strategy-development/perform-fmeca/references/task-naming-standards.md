# Task Naming Standards, Acceptable Limits & Conditional Comments

## Section A: Task Name Patterns by Strategy Type

| Strategy | Pattern | Example |
| --- | --- | --- |
| CONDITION_BASED | Per technique (see `cbm-technique-selection.md` Section 5) | `Perform vibration analysis on Drive Motor [BRY-SAG-ML-001]` |
| FIXED_TIME (replacement) | `Replace {MI} [{tag}]` | `Replace Mill Liner [BRY-SAG-ML-001]` |
| FIXED_TIME (overhaul) | `Overhaul {MI} [{tag}]` | `Overhaul Main Gearbox [BRY-SAG-ML-001]` |
| FIXED_TIME (service) | `Service {MI} [{tag}]` | `Service Lubrication System [BRY-SAG-ML-001]` |
| FAULT_FINDING | `Test {MI} function [{tag}]` | `Test Vibration Sensor function [BRY-SAG-ML-001]` |
| RUN_TO_FAILURE | No primary task defined | — |
| REDESIGN | No primary task — generates engineering change request | — |

**General naming rules:**

- Maximum 72 characters (SAP field constraint per T-18)
- Start with a verb (Inspect, Perform, Measure, Take, Replace, Overhaul, Service, Test)
- Include MI name and equipment tag
- Use `[{tag}]` suffix for equipment identification
- Do NOT use ALL CAPS (per T-19)

---

## Section B: Acceptable Limits Formulation Standard

**Principle:** The acceptable limit defines the **P (potential failure) detection threshold** — the measurable boundary between "acceptable condition" and "action required." It must be specific enough that a technician can make a clear pass/fail judgment in the field.

### Formulation by Technique Category

| Technique Category | Acceptable Limits Template | How to Determine Values |
| --- | --- | --- |
| Vibration | `Vibration ≤ {value} {unit} per {standard}, {zone/group reference}` | ISO 10816-3 Table 1: Group 1 (>300kW): 4.5 mm/s A/B boundary; Group 2 (15-300kW): 3.5 mm/s; Group 4 (pumps): 3.5 mm/s. Use ISO 20816 for new installations. |
| Oil analysis | `{parameter} ≤ {value} {unit}, ISO cleanliness ≤ {code} per ISO 4406` | Fe: gearbox=100ppm, hydraulic=50ppm. Viscosity: ±10% of baseline. Particle count per OEM or ISO 4406 target code. TAN/TBN per lubricant spec. |
| Thermography | `ΔT ≤ {value}°C above {reference}, absolute ≤ {max}°C` | Electrical connections: ΔT 10°C (alert), 25°C (alarm). Motors/bearings: ΔT 15°C. Reference = baseline or ambient. Absolute max per insulation class (B=130°C, F=155°C, H=180°C). |
| Ultrasonic thickness | `Wall thickness ≥ {min} mm per {design code}` | Min wall from: ASME B31.3 (piping), API 510 (vessels), API 570 (piping). Calculate: nominal - corrosion allowance - retirement thickness. |
| Insulation resistance | `Insulation resistance ≥ {value} MΩ per {standard}` | IEEE 43: minimum = kV rating + 1 MΩ. Trending: investigate if <50% of initial value. New motors: typically ≥100 MΩ. |
| Performance monitoring | `{parameter} within {range} of {reference curve/value}` | From OEM performance curves: efficiency within 5% of design, flow within 10% of rated, pressure within 5% of rated. |
| MCSA | `Sideband amplitude ≤ {dB} below fundamental per {standard}` | Healthy: sidebands >50dB below fundamental. Alert: -46dB. Alarm: -40dB. Per IEEE and NEMA motor standards. |
| Acoustic emission | `AE count rate ≤ {value} per {time unit} above baseline` | Equipment-specific — establish baseline during commissioning, alert at 2x baseline, alarm at 5x. Per ISO 22096. |
| DGA | `Key gas ≤ {ppm} per {standard}, TDCG ≤ {ppm}` | IEEE C57.104 Table 1: H2 ≤100ppm, CH4 ≤120ppm, C2H2 ≤1ppm (normal). TDCG ≤720ppm. |
| NDT (DPI/MPI/eddy current) | `No indications exceeding {acceptance criteria} per {code}` | ASME Section V for examination methods. ASME Section VIII Div.1 for acceptance criteria. AWS D1.1 for weld acceptance. |
| Visual inspection | `No evidence of {evidence_descriptor}` | Per mechanism: WEARS = "wear, scoring, or material loss"; CORRODES = "corrosion, pitting, or material degradation"; CRACKS = "cracking or crack propagation". Include dimensional tolerance if quantifiable. |
| Differential pressure | `ΔP ≤ {value} {unit} across {component}` | Clean filter ΔP as baseline. Alert at 2x baseline. Alarm at 3x baseline or OEM max ΔP. |
| *(new technique)* | `{Measurable parameter} {operator} {threshold} {unit} per {standard/reference}` | Agent must identify the measurable parameter, determine the threshold from standards/OEM/baseline, and cite the source. |

---

## Section C: Conditional Comments Standard

Every acceptable limit MUST have a paired conditional comment that specifies:

1. **What to do at ALERT level** (investigate, increase monitoring frequency, plan corrective action)
2. **What to do at ALARM level** (take immediate corrective action, stop equipment if safety-critical)
3. **Timeframe for action** based on the nett P-F interval (P-F interval minus task interval)

### Templates by Technique Category

| Technique Category | Conditional Comment Template |
| --- | --- |
| Vibration | `If vibration >{alarm} mm/s (Zone C/D): schedule corrective action within {nett_PF} days. If >{danger} mm/s: stop equipment, inspect immediately.` |
| Oil analysis | `If Fe >{alarm} ppm or viscosity outside ±{%}%: schedule oil change and investigate wear source within {nett_PF} days. If ferrous debris detected: stop and inspect internals.` |
| Thermography | `If ΔT >{alarm}°C or absolute >{max}°C: reduce load, schedule inspection within {nett_PF} days. If ΔT >2x alarm: stop equipment immediately.` |
| Ultrasonic thickness | `If wall <{alert} mm: increase monitoring frequency to {interval}. If wall <{min} mm: remove from service, replace/repair.` |
| Insulation resistance | `If resistance <{alarm} MΩ: schedule motor rewinding/replacement. If <{critical} MΩ: do not energize, replace before return to service.` |
| Performance monitoring | `If {parameter} outside {range}: investigate root cause. If degradation >10% of design: schedule overhaul/repair within {nett_PF} days.` |
| MCSA | `If sideband amplitude >{alarm} dB: schedule motor inspection within {nett_PF} days. If >{critical} dB: remove from service for rotor/stator inspection.` |
| Acoustic emission | `If AE rate >2x baseline: increase monitoring frequency. If >5x baseline: schedule inspection/repair within {nett_PF} days.` |
| DGA | `If key gas >{caution} ppm: increase sampling frequency to monthly. If >{warning} ppm: schedule transformer inspection, consider de-energizing.` |
| NDT | `If indications exceeding {code} acceptance: remove from service. Perform engineering assessment before return to service per {code}.` |
| Visual inspection | `If {evidence} observed: document extent, photograph, report to supervisor. If progression confirmed vs. previous inspection: escalate to RCA and schedule corrective action.` |
| Differential pressure | `If ΔP >{alert}: plan filter/element replacement. If ΔP >{alarm} or OEM max: replace immediately to prevent bypass.` |
| Fault-finding | `If device fails functional test: replace/repair immediately. Do not return protected equipment to service until function verified.` |
| *(new technique)* | `If {parameter} outside limits: {specific corrective action}. If {critical condition}: {immediate action}.` |

---

## Section D: Fault-Finding Task Standards

| Device Type | Task Name | Acceptable Limits | Conditional Comments |
| --- | --- | --- | --- |
| Vibration Sensor | `Test Vibration Sensor function [{tag}]` | `Sensor output responds within ±5% of calibrated reference signal` | `If fails: replace and recalibrate within 48 hours` |
| Temperature Sensor | `Test Temperature Sensor function [{tag}]` | `Reads within ±2°C of calibrated reference at ambient and elevated temperature` | `If fails: replace and verify alarm setpoints` |
| Pressure Sensor/Gauge | `Test Pressure Sensor function [{tag}]` | `Reads within ±1% FS of calibrated reference per ISA 51.1` | `If fails: replace, verify process interlock operation` |
| Level Sensor | `Test Level Sensor function [{tag}]` | `Triggers at set-point level ±50mm` | `If fails: replace and verify interlock chain` |
| Protective Relay | `Test Protective Relay function [{tag}]` | `Trips within rated time at pickup setting per IEEE C37.90` | `If fails to trip: replace immediately, do not return protected equipment to service` |
| Safety/Relief Valve | `Test Safety Valve function [{tag}]` | `Opens at set pressure ±3% per ASME BPVC Section VIII` | `If fails to open: replace and recertify before returning to service` |
| Emergency Stop | `Test Emergency Stop function [{tag}]` | `System stops within rated time, all interlocks engage` | `If fails: lock out equipment, repair before returning to service` |
| Fire/Gas Detector | `Test Fire/Gas Detector function [{tag}]` | `Responds to test gas/heat source within rated sensitivity and time` | `If fails: replace, do not leave area unprotected — arrange temporary monitoring` |
| UPS/Backup Power | `Test UPS function [{tag}]` | `Maintains rated output for minimum rated duration under test load` | `If fails: repair/replace, arrange temporary backup for critical loads` |
| Buchholz Relay | `Test Buchholz Relay function [{tag}]` | `Relay activates on simulated gas accumulation per IEC 60076` | `If fails: replace, do not return transformer to service until protection verified` |
| *(new device)* | `Test {device} function [{tag}]` | `{Device-specific pass/fail criteria referencing manufacturer spec or standard}` | `If fails: {specific corrective action}, do not return to service until verified` |

### FFI Interval Guidance (Moubray §9.2-9.3)

For fault-finding tasks, the failure-finding interval (FFI) is calculated as:

```
FFI = 2 × Unavailability × MTBF(protective device)
```

Where unavailability = (1 - desired availability). Example: If desired availability = 99% and MTBF = 8 years, then FFI = 2 × 0.01 × 8 = 0.16 years ≈ 2 months.

| Desired Availability | FFI as % of MTBF |
| --- | --- |
| 90% | 20% |
| 95% | 10% |
| 97% | 6% |
| 99% | 2% |
| 99.5% | 1% |
| 99.9% | 0.2% |

---

## Section E: Acceptable Limits Formulation Rules (Universal)

These 7 rules apply to ALL techniques, both existing and new:

1. **ALWAYS measurable** — Use numeric thresholds with units, or clear pass/fail criteria. NEVER use "Within OEM specifications" alone as an acceptable limit.

2. **ALWAYS reference a standard** — Cite ISO, IEEE, API, ASME, NETA, IEC, OEM specification, or an established baseline. The source of the threshold must be traceable.

3. **Include the reference point** — State "above baseline", "of nominal", "per design curve", "of full scale", or similar. The technician must know what the threshold is relative to.

4. **Specify alert AND alarm where applicable** — Alert = investigate and plan corrective action; Alarm = act immediately. Not all techniques have two levels (visual is typically pass/fail), but where measurable trending exists, both levels should be defined.

5. **P-F interval consistency** — Task frequency MUST be ≤ 50% of the P-F interval for the selected technique. If the task cannot be performed at this frequency, the technique or strategy must be reconsidered.

6. **Site-specific calibration** — Default thresholds from standards are starting points. When historical data from the specific equipment is available, thresholds should be adjusted to reflect actual site conditions, operating context, and failure history.

7. **Field-executable** — The technician must be able to evaluate the limit in the field with the tools available for that task. If specialized equipment is needed (vibration analyzer, IR camera, ultrasonic gauge), this must be stated in the task definition so the Planning Specialist can allocate the right resources.
