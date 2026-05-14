# Diagnostico Autonomo y Continuo de Condiciones

## Metadata
- **Authors:** Eduardo Ingegneri
- **Session:** S15 MAPLA 2024
- **Topic:** Autonomous and continuous condition diagnostics platform that automates the condition monitoring workflow -- from data collection across disparate sources to root cause identification and maintenance recommendations -- using asset models based on FTA and FMECA.

## Key Points
- **Industry context (McKinsey 2022):**
  - Companies struggle to control asset productivity
  - Maintenance costs are rising above inflation
  - Skilled worker shortage is a critical challenge
  - Knowledge transfer is largely unstructured
  - Best-practice organizations dedicate 70-85% of technician hours to preventive maintenance
- **Core problem:** Subject matter experts get trapped in repetitive tasks -- manually collecting data from disparate systems -- leaving little time for deep analysis
- **Condition monitoring routine has four phases:**
  1. Identify existing conditions (read meters, alarms, perform inspections)
  2. Understand why conditions occur (correlate signals, trend historical values, compare with FTA/FMECA)
  3. Predict what will happen next (estimate severity, calculate health index, cascade criticality)
  4. Recommend solutions (schedule maintenance, update FTA/FMECA)
- **Asset Model approach:** Each asset type has a model defining conditions, input variables (online + static parameters), severity levels, possible causes, and recommended actions
- Models are built from **Fault Tree Analysis (FTA)** and **Failure Mode Effects and Criticality Analysis (FMECA)**
- **Platform capabilities:**
  - Structured data collection from disparate field networks, sensors, and CM systems
  - Automated continuous analysis of large datasets (vendor-agnostic)
  - Early detection of imminent problems and performance losses
  - Root cause identification with recommended actions
  - Health index and severity-oriented maintenance screens
- **Four types of algorithms:**
  1. **Efficiency:** Monitors electrical and thermodynamic efficiency as a failure indicator
  2. **Spectral vibration analysis:** FFT conversion with automated analysis based on Ball Pass Frequency (BPF)
  3. **Multivariable:** Combines process and asset data for broader coverage
  4. **Embedded monitoring:** Uses device error codes and alarm words
- **Pre-built asset models include:**
  - **Transformers:** Dielectric saturation, oil aging/oxidation, partial discharges, gas analysis (DGA), paper insulation degradation (DP/2FAL), remaining useful life
  - **AC Motors:** Winding overheat causes, harmonic distortions, efficiency/slip, lubrication scheduling, insulation condition, bearing analysis, start counts
  - **Centrifugal Pumps:** OEM curve deviation, bearing overheat causes, lubrication scheduling, efficiency level
  - **Variable Frequency Drives:** 60+ alarm types, 80+ fault types, internal electronics monitoring, power module/IGBT monitoring

## Relevance to Asset Management
- Directly addresses the gap between data availability and actionable maintenance intelligence
- Automates the condition monitoring workflow that typically requires scarce specialist expertise
- The FTA/FMECA-based asset model approach aligns with ISO 55000 asset management principles
- Health index calculation enables risk-based maintenance prioritization across asset portfolios
- Pre-built models for transformers, motors, pumps, and VFDs cover the most critical rotating and electrical equipment in mining
- Scalable solution that reduces dependency on individual expert knowledge

## Keywords
condition monitoring, autonomous diagnostics, health index, FTA, FMECA, asset model, predictive maintenance, vibration analysis, FFT, efficiency monitoring, transformers, AC motors, centrifugal pumps, VFD, root cause analysis, severity assessment, RCM
