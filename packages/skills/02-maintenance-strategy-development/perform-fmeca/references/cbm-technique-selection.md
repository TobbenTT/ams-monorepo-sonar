# CBM Technique Selection Guide

## 1. Technique Selection Reasoning Framework

The Reliability Engineer MUST reason about the right detection technique for each CONDITION_BASED failure mode. Techniques are NOT limited to a fixed list — any technique from Moubray's 9 categories (54+ techniques) may be appropriate.

**Reasoning process (in order of priority):**

1. **What is the failure mechanism?** (e.g., WEARS, CORRODES, CRACKS, OVERHEATS_MELTS)
2. **What physical evidence does this mechanism produce before functional failure?** (the P condition — e.g., vibration change, temperature rise, wear particles, wall thinning)
3. **Which monitoring category detects that evidence?** (from the 9 categories in Section 2)
4. **What is the P-F interval for that technique on this component?** (must be long enough for practical monitoring and corrective action)
5. **Is it technically feasible?** (equipment accessible, technology available, operator competence)
6. **Is it economically viable?** (cost of monitoring vs. cost of failure consequence)

**Selection rules:**

- If multiple techniques apply, prefer the one with the **longest P-F interval** (more warning time).
- If no technique provides adequate P-F interval, the strategy may need to change to FIXED_TIME or REDESIGN.
- When RCM is correctly applied, condition monitoring is technically feasible for no more than **20% of failure modes**, and worth doing in **less than half of those** (Moubray §8.6). All on-condition categories together are suitable for about **25-35% of failure modes**.

---

## 2. Moubray's 9 Categories of On-Condition Techniques

| Category | Techniques | Detects | Typical P-F |
| --- | --- | --- | --- |
| **1. Dynamic Effects** | Broad-band vibration, FFT spectrum analysis, time waveform, shock pulse, acoustic emission, envelope analysis | Imbalance, misalignment, looseness, bearing defects, gear mesh faults | Weeks to months |
| **2. Particle Effects** | Ferrography, spectrometric oil analysis, mesh obscuration, particle counting (ISO 4406), wear debris analysis | Wear particles, contamination, component degradation | Months |
| **3. Chemical Effects** | Oil chemistry (TAN/TBN), viscosity analysis, dissolved gas analysis (DGA), oxidation analysis, coolant analysis | Fluid degradation, chemical attack, insulation decomposition | Months |
| **4. Physical Effects (NDT)** | Visual inspection, dye penetrant (DPI), magnetic particle (MPI), radiography, eddy current, ultrasonic thickness (UT), ultrasonic flaw detection | Cracks, corrosion, erosion, wall thinning, dimensional changes | Weeks to months |
| **5. Temperature Effects** | Thermography (IR), pyrometry, temperature indicators/crayons, differential temperature, continuous temperature monitoring | Overheating, thermal degradation, friction, electrical resistance | Days to weeks |
| **6. Electrical Effects** | Insulation resistance (megger), hi-pot testing, motor current analysis (MCSA), winding resistance, harmonic analysis, power factor | Insulation degradation, winding faults, rotor bar defects | Weeks to months |
| **7. Primary Effects** | Pressure gauges, flow measurement, level monitoring, process parameter trending, efficiency calculation, performance curves | Performance degradation, blockage, leakage, capacity loss | Days to weeks |
| **8. Product Quality** | SPC charts, dimensional measurement, moisture content, filling levels | Output quality degradation indicating equipment deterioration | Days to weeks |
| **9. Human Senses** | Visual observation, auditory (abnormal sounds), tactile (heat, vibration), olfactory (burning, chemicals) | Any obvious abnormal condition | Hours to days |

---

## 3. Common Defaults by (mi_category, mechanism)

These are **starting-point suggestions** for the most common combinations. The agent MUST use engineering judgment to override these when a better technique exists for the specific equipment context.

| mi_category | mechanism | Suggested Technique | Reasoning | Override When |
| --- | --- | --- | --- | --- |
| MOTOR | WEARS | Vibration analysis | Detects imbalance, misalignment, bearing degradation | Use MCSA if VFD-driven; use acoustic emission for high-speed motors |
| MOTOR | SHORT_CIRCUITS | Insulation resistance testing | Detects winding insulation degradation per IEEE 43 | Use partial discharge for HV motors >6kV |
| MOTOR | OVERHEATS_MELTS | Thermography | Detects hot spots and thermal anomalies | Use embedded RTDs if continuous monitoring installed |
| GEARBOX | WEARS | Oil analysis | Detects wear particles and contamination per ISO 4406 | Add vibration if critical; use ferrography for detailed analysis |
| GEARBOX | CRACKS | Vibration analysis | Detects gear mesh frequency changes | Use acoustic emission for early-stage crack detection |
| BEARING | WEARS | Vibration analysis | Envelope analysis per ISO 13373 | Use ultrasound for slow-speed (<60 RPM) bearings |
| BEARING | OVERHEATS_MELTS | Thermography | Thermal gradient detection | Use embedded temperature sensors if available |
| COUPLING | LOOSES_PRELOAD | Visual inspection | Gap/alignment check | Use laser alignment if precision required |
| GEAR | WEARS | Visual inspection | Tooth surface wear evidence | Use vibration spectrum analysis for online monitoring |
| STRUCTURE | CORRODES | Visual inspection | External corrosion evidence | Use UT for structural members with known corrosion history |
| PUMP | WEARS | Performance monitoring | Discharge pressure/flow vs. OEM curve | Add vibration for bearing condition |
| FILTER | BLOCKS | Differential pressure | ΔP across filter element | Visual if no gauge installed |
| HEAT_EXCHANGER | CORRODES | Ultrasonic thickness | Wall thickness per ASME | Use eddy current for tube bundles |
| HEAT_EXCHANGER | BLOCKS | Pressure/temperature measurement | ΔP across tubes or approach temperature | Use flow measurement if ΔP not available |
| VESSEL | CORRODES | Ultrasonic thickness | Wall thickness per API 510 | Use radiography for inaccessible areas |
| VESSEL | CRACKS | Ultrasonic flaw detection | Defect detection per ASME V | Use MPI for surface cracks on ferromagnetic material |
| PIPE | CORRODES | Visual inspection | External corrosion evidence | Use UT for internal corrosion; use guided wave UT for insulated pipes |
| IMPELLER | SEVERS | Performance monitoring | Impeller OD measurement or pump curve deviation | Use UT for erosion depth measurement |
| IMPELLER | CORRODES | Visual inspection | Surface degradation evidence | Use performance curve comparison for online detection |
| SHAFT | WEARS | Visual inspection | Wear marks, dimensional check | Use vibration for online shaft condition monitoring |
| BLOWER | WEARS | Vibration analysis | Detects imbalance, bearing degradation | Use performance monitoring for efficiency tracking |
| BLOWER | LOOSES_PRELOAD | Visual inspection | Bolt looseness, gap checks | Use vibration for online looseness detection |
| NOZZLE | BLOCKS | Visual inspection | Blockage evidence, flow pattern | Use pressure measurement for quantitative data |
| VALVE | CORRODES | Visual inspection | External corrosion evidence | Use acoustic emission for internal leakage detection |
| VALVE | BLOCKS | Visual inspection | Valve condition, position | Use acoustic emission for internal seat leakage |
| BELT | WEARS | Visual inspection | Wear evidence, cracking, stretch | Use tension measurement for quantitative data |
| BURNER | DEGRADES | Visual inspection | Flame pattern, tip condition | Use thermography for flame temperature distribution |
| ELECTRICAL | SHORT_CIRCUITS | Insulation resistance testing | Megger testing per IEEE 43 | Use hi-pot for acceptance testing |
| ELECTRICAL | THERMALLY_OVERLOADS | Thermography | Junction/connection temperature | Use current monitoring for continuous trending |

---

## 4. Technique Standards & P-F Intervals

| Technique | Primary Standards | Alert Threshold | Alarm Threshold | Typical P-F | Task Frequency (≤50% P-F) |
| --- | --- | --- | --- | --- | --- |
| Vibration (overall) | ISO 10816-3, ISO 20816-1 | Zone A/B boundary | Zone C/D boundary | 1-6 months | 2-12 weeks |
| Vibration (envelope) | ISO 13373 | Trend +50% | Trend +100% | 2-8 weeks | 1-4 weeks |
| Oil analysis (routine) | ISO 4406, ASTM D6224 | Trend +25% baseline | Fe >100ppm or trend +50% | 3-9 months | 6-18 weeks |
| Oil analysis (ferrography) | ASTM D7684 | Abnormal particles | Severe particles | 2-6 months | 4-12 weeks |
| Thermography | NETA MTS, ISO 18434 | ΔT >10°C | ΔT >25°C or abs >Class limit | 1-3 months | 2-6 weeks |
| Ultrasonic thickness | ASME B31.3, API 510/570 | Wall <75% nominal | Wall <min design | 6-24 months | 3-12 months |
| Insulation resistance | IEEE 43, IEC 60085 | <100 MΩ (new), trend -25% | <5 MΩ or <1 MΩ/kV | 3-12 months | 6-26 weeks |
| MCSA | IEEE C37, NEMA MG-1 | Sideband amplitude +3dB | Sideband +6dB | 2-6 months | 4-12 weeks |
| Acoustic emission | ISO 22096, ASTM E1932 | Activity above baseline | Rapid AE rate increase | 1-4 weeks | 3-14 days |
| DGA (transformers) | IEEE C57.104, IEC 60599 | Key gas above normal | Key gas above caution | 3-12 months | 6-26 weeks |
| Performance monitoring | OEM performance curves | Efficiency drop >5% | Efficiency drop >10% | 1-4 weeks | 3-14 days |
| Eddy current | ASTM E426, ISO 15548 | Indication above threshold | Indication exceeding acceptance | 6-12 months | 3-6 months |
| MPI | ASTM E1444, ISO 9934 | Any relevant indication | Indication exceeding code acceptance | Weeks to months | Per shutdown schedule |
| DPI | ASTM E165, ISO 3452 | Any relevant indication | Indication exceeding code acceptance | Weeks to months | Per shutdown schedule |
| Visual (human senses) | — | Evidence observed | Progression confirmed | Hours to days | Per route schedule |

---

## 5. Task Name Patterns by Technique (Extensible)

The naming pattern follows the structure: `{Verb} {object} on/for {MI} [{tag}]`

| Technique Category | Verb + Object Pattern | Example |
| --- | --- | --- |
| Vibration analysis | `Perform vibration analysis on {MI}` | Perform vibration analysis on Drive Motor [BRY-SAG-ML-001] |
| Oil analysis | `Take oil sample on {MI}` | Take oil sample on Main Gearbox [BRY-SAG-ML-001] |
| Thermography | `Perform thermography on {MI}` | Perform thermography on Drive Motor [BRY-SAG-ML-001] |
| Ultrasonic thickness | `Perform ultrasound inspection on {MI}` | Perform ultrasound inspection on Vessel [BRY-SAG-ML-001] |
| Ultrasonic flaw detection | `Perform ultrasonic flaw detection on {MI}` | Perform ultrasonic flaw detection on Shell [BRY-SAG-ML-001] |
| Insulation testing | `Measure insulation resistance on {MI}` | Measure insulation resistance on Drive Motor [BRY-SAG-ML-001] |
| MCSA | `Perform motor current analysis on {MI}` | Perform motor current analysis on Drive Motor [BRY-SAG-ML-001] |
| Acoustic emission | `Perform acoustic emission monitoring on {MI}` | Perform acoustic emission monitoring on Vessel [BRY-SAG-ML-001] |
| DGA | `Take DGA sample on {MI}` | Take DGA sample on Power Transformer [UTL-TRF-PP-001] |
| Performance monitoring | `Measure {parameter} on {MI}` | Measure discharge pressure on Feed Pump [BRY-SAG-ML-001] |
| Differential pressure | `Measure differential pressure on {MI}` | Measure differential pressure on Oil Filter [BRY-SAG-ML-001] |
| Visual inspection | `Inspect {MI} for {evidence}` | Inspect Shell for corrosion, pitting, and material degradation [BRY-SAG-ML-001] |
| Eddy current | `Perform eddy current inspection on {MI}` | Perform eddy current inspection on Tube Bundle [BRY-SAG-ML-001] |
| MPI | `Perform magnetic particle inspection on {MI}` | Perform magnetic particle inspection on Pinion Shaft [BRY-SAG-ML-001] |
| DPI | `Perform dye penetrant inspection on {MI}` | Perform dye penetrant inspection on Weld Joint [BRY-SAG-ML-001] |
| Laser alignment | `Perform laser alignment on {MI}` | Perform laser alignment on Motor Coupling [BRY-SAG-ML-001] |
| *(new technique)* | `{Verb} {technique object} on/for {MI}` | Agent applies the pattern consistently |

When the agent selects a technique NOT in this table, it MUST follow the same `{Verb} {object} on/for {MI} [{tag}]` convention and document the rationale for the technique choice.
