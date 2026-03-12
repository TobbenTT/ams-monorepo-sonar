# Maintenance Readiness Methodology Reference
## VSC Operational Readiness - Asset Management & Maintenance Engineering

**Source Documents:**
- `methodology/maintenance-readiness/` (17 documents)
- `methodology/maintenance-procedures/` (5 documents)
- `methodology/Failure Modes (Mechanism + Cause).xlsx`
- `methodology/asset-management-iso-55000/` (5 documents)

**Applicable Skills:**
- create-maintenance-strategy
- create-maintenance-manual
- create-spare-parts-strategy
- create-work-management-manual
- create-shutdown-plan
- create-asset-register
- analyze-equipment-criticality
- analyze-failure-patterns
- analyze-reliability
- assess-am-maturity
- benchmark-maintenance-kpis
- design-sap-pm-blueprint
- develop-maintenance-strategy
- develop-samp
- generate-initial-spares-list
- load-sap-master-data
- model-ram-simulation
- optimize-pm-program
- optimize-mro-inventory
- plan-turnaround
- manage-equipment-preservation
- track-incident-learnings

---

## Table of Contents

| Section | Topic | Key Source |
|---------|-------|-----------|
| 1 | Asset Management Framework (ISO 55000) | asset-management-iso-55000/ |
| 2 | Asset Criticality Analysis Methodology | maintenance-readiness/ |
| 3 | RCM / FMECA Methodology | maintenance-readiness/ |
| 4 | VSC Failure Modes Table | Failure Modes (Mechanism + Cause).xlsx |
| 5 | Maintenance Strategy Development | maintenance-readiness/ |
| 6 | Preventive Maintenance Planning | maintenance-readiness/ |
| 7 | Spare Parts Criticality Analysis | maintenance-readiness/ |
| 8 | RAM Analysis Methodology | maintenance-readiness/ |
| 9 | Work Management System | maintenance-readiness/ |
| 10 | Shutdown/Turnaround Management | maintenance-readiness/ |
| 11 | Maintenance Procedure Examples | maintenance-procedures/ |
| 12 | Maintenance Software Architecture | maintenance-readiness/ |
| 13 | Maintenance Readiness Checklist | maintenance-readiness/ |

---

## 1. Asset Management Framework (ISO 55000)

**Sources:**
- `asset-management-iso-55000--Implementing ISO 55000 Assetivity.pdf`
- `asset-management-iso-55000--ISO 55000.pptx`
- `asset-management-iso-55000--ISO_55002_2018(es).PDF`
- `asset-managmenet-pass55-2008.pdf`

### ISO 55000 Series Overview

| Standard | Focus |
|----------|-------|
| ISO 55000 | Overview, principles, terminology |
| ISO 55001 | Requirements for an asset management system |
| ISO 55002 | Guidelines for the application of ISO 55001 |
| PAS 55 | Predecessor standard (British Standards Institution) |

### Key Principles
1. **Value**: Assets exist to provide value to the organization and its stakeholders
2. **Alignment**: Asset management translates organizational objectives into technical and financial decisions
3. **Leadership**: Leadership and workplace culture are determinants of value realization
4. **Assurance**: Asset management gives assurance that assets will fulfill their required purpose

### Asset Management System Components
- **Strategic Asset Management Plan (SAMP)**: Translates organizational objectives into AM objectives
- **Asset Management Plans**: Detailed plans for managing specific asset groups
- **Asset Management Policy**: Organization's commitment to AM
- **Asset Information**: Data and knowledge about assets
- **Performance Evaluation**: Monitoring, measurement, analysis, evaluation

### Maturity Model (PAS 55 / ISO 55001)
| Level | Description | Characteristics |
|-------|-------------|----------------|
| 0 | Innocent | No formal AM approach, reactive |
| 1 | Aware | Some AM activities, ad hoc |
| 2 | Developing | AM plans in place, partially implemented |
| 3 | Competent | AM system operational, consistent |
| 4 | Optimizing | AM drives business strategy, continuous improvement |
| 5 | Excellent | World-class AM, industry benchmark |

---

## 2. Asset Criticality Analysis Methodology

**Sources:**
- `maintenance-readiness/asset-criticality-analysis-report-*.pdf`
- `maintenance-readiness/asset-criticality-analysis-procedure-*.pdf`
- `maintenance-readiness/asset-criticality-analysis-ppt-*.pdf`

### Criticality Classification

The VSC methodology uses a 4-tier criticality classification:

| Tier | Code | Criteria | Maintenance Strategy Depth |
|------|------|----------|---------------------------|
| Critical | AA | Safety/environmental/production impact is catastrophic | Full RCM analysis (SAE JA1011) |
| High | A | Significant impact on production or safety | Simplified FMECA |
| Medium | B | Moderate impact, alternatives available | Component library / standard task lists |
| Low | C | Minimal impact, easily replaced | Vendor recommendations / run-to-failure |

### Criticality Assessment Matrix

Assessment factors (scored 1-5):
- **Safety**: Potential for injury or fatality
- **Environment**: Potential for environmental damage
- **Production**: Impact on throughput/capacity
- **Cost of Repair**: Direct maintenance cost
- **Frequency of Failure**: Expected failure rate (from OREDA or site data)
- **Detection**: Ability to detect failure before consequence

**Criticality Score** = Safety × (Environment + Production + Cost) × Frequency / Detection

### Process
1. Compile asset register with equipment taxonomy (ISO 14224)
2. Assign criticality assessment team (Operations, Maintenance, HSE)
3. Score each equipment item against the matrix
4. Classify into tiers (AA/A/B/C)
5. Validate with plant management
6. Document results in criticality matrix (.xlsx)

---

## 3. RCM / FMECA Methodology

### Reliability Centered Maintenance (RCM) per SAE JA1011/JA1012

**The 7 RCM Questions:**
1. What are the functions and associated performance standards of the asset in its present operating context?
2. In what ways can it fail to fulfill its functions? (Functional failures)
3. What causes each functional failure? (Failure modes)
4. What happens when each failure occurs? (Failure effects)
5. In what way does each failure matter? (Failure consequences)
6. What should be done to predict or prevent each failure? (Proactive tasks)
7. What should be done if a suitable proactive task cannot be found? (Default actions)

### FMECA Process (IEC 60812)

| Step | Activity | Output |
|------|----------|--------|
| 1 | Define system boundaries and functions | Functional block diagram |
| 2 | Identify failure modes using VSC Failure Modes Table | Failure mode list |
| 3 | Determine failure effects (local, system, end) | Effects analysis |
| 4 | Assess failure consequences | Consequence classification |
| 5 | Estimate failure likelihood | Frequency assessment |
| 6 | Calculate Risk Priority Number (RPN) | RPN = Severity × Occurrence × Detection |
| 7 | Determine maintenance tasks | Task selection (PM, PdM, RTF) |
| 8 | Define task intervals | Interval optimization |

### Maintenance Task Selection Logic

```
Is the failure hidden?
├── YES → Can a scheduled task detect it?
│   ├── YES → Failure Finding Task (FFT)
│   └── NO → Redesign required
└── NO → What is the consequence?
    ├── Safety/Environment →
    │   ├── Condition-based task feasible? → CBM
    │   ├── Scheduled restoration feasible? → Time-based PM
    │   ├── Scheduled discard feasible? → Replacement PM
    │   └── None applicable → Redesign required
    ├── Operational →
    │   ├── Condition-based task feasible AND cost-effective? → CBM
    │   ├── Scheduled restoration feasible AND cost-effective? → PM
    │   └── Run-to-failure is cheapest → RTF (with contingency plan)
    └── Non-operational →
        ├── Preventive task cost < repair cost? → PM
        └── Otherwise → RTF
```

---

## 4. VSC Failure Modes Table

**Source:** `methodology/Failure Modes (Mechanism + Cause).xlsx`

**MANDATORY REFERENCE for all RCM/FMECA/reliability work.**

### Structure
All failure modes follow the standard format:
**[WHAT (Component/Part)] → [Mechanism] due to [Cause]**

### 18 Failure Mechanisms
1. Corrosion
2. Erosion
3. Fatigue
4. Wear
5. Overheating
6. Deformation
7. Fracture/Cracking
8. Leakage
9. Blockage/Plugging
10. Vibration
11. Electrical Failure
12. Instrumentation Failure
13. Control System Failure
14. Lubrication Failure
15. Seal Failure
16. Bearing Failure
17. Material Degradation
18. External Damage

### 46 Failure Causes (Grouped)
**Design-Related (8):**
- Inadequate design, material selection error, undersizing, incorrect specification, design life exceeded, inadequate protection, wrong material compatibility, design deficiency

**Operation-Related (10):**
- Operating beyond limits, improper startup/shutdown, operator error, process upset, overloading, abnormal conditions, incorrect operation sequence, speed exceedance, temperature exceedance, pressure exceedance

**Maintenance-Related (8):**
- Inadequate maintenance, incorrect procedure, missed inspection, improper repair, wrong spare part, insufficient lubrication, poor workmanship, contamination during maintenance

**Environmental (6):**
- Aggressive environment, temperature cycling, humidity/moisture, UV degradation, chemical exposure, marine/coastal environment

**Age/Wear (5):**
- Normal wear and tear, end of useful life, aging degradation, cyclic loading, cumulative damage

**External (5):**
- External impact, third-party damage, natural disaster, vandalism, construction damage

**Quality (4):**
- Manufacturing defect, material defect, assembly error, quality control failure

### Usage Rule
**ALL agents MUST use this table when identifying failure modes.** No ad-hoc or free-text failure mode descriptions are permitted. Every failure mode entry must map to a valid Mechanism + Cause combination from this table.

---

## 5. Maintenance Strategy Development

**Source:** `maintenance-readiness/maintenance-readiness-VSC-services-*.pdf`

### Strategy Development Process
1. **Asset Register Creation**: Complete inventory with taxonomy (ISO 14224)
2. **Criticality Analysis**: Classify all assets (AA/A/B/C)
3. **Strategy by Tier**:
   - AA: Full RCM → PM Plan + CBM recommendations
   - A: Simplified FMECA → PM Plan
   - B: Component Library → Standard task lists
   - C: Vendor recommendations → Basic PM
4. **PM Plan Consolidation**: Merge all individual plans into master PM schedule
5. **CBM Program Design**: Define technologies, routes, frequencies
6. **Spare Parts Strategy**: Critical spares identification and stocking
7. **KPI Framework**: Define targets (MTBF, MTTR, availability)

### Deliverables
| Deliverable | Format | Content |
|-------------|--------|---------|
| Maintenance Strategy Report | .docx | Complete methodology, findings, recommendations |
| Criticality Matrix | .xlsx | All assets classified with scoring |
| FMECA Worksheets | .xlsx | Failure modes, effects, tasks per equipment |
| PM Plan (Master Schedule) | .xlsx | Consolidated preventive maintenance schedule |
| CBM Program | .docx | Predictive maintenance technologies and routes |
| Spare Parts List | .xlsx | Critical and insurance spares with quantities |
| KPI Targets | .xlsx | Performance targets by system/area |

---

## 6. Preventive Maintenance Planning

### PM Task Structure
Each PM task in the plan includes:
| Field | Description |
|-------|-------------|
| Tag Number | Equipment identifier |
| Task Description | What to do (inspect, replace, test, etc.) |
| Task Type | Visual, Operational, Invasive, Condition-Based |
| Frequency | Interval (hours, days, weeks, months) |
| Duration | Estimated time to complete |
| Trade | Required craft (mechanical, electrical, instrumentation) |
| Crew Size | Number of people required |
| Shutdown Required | Yes/No (affects scheduling) |
| Safety Requirements | LOTO, permits, PPE required |
| Spare Parts | Parts consumed by this task |
| Reference Documents | Vendor manual, procedure reference |

---

## 7. Spare Parts Criticality Analysis

**Source:** `maintenance-readiness/Spare Part Criticality Analysis.xlsx`

### Criticality Classification for Spares
| Category | Criteria | Stocking Policy |
|----------|----------|----------------|
| Insurance Spares | Long lead time, catastrophic impact if unavailable | Stock from Day 1, minimum 1 unit |
| Critical Spares | Significant production impact, moderate lead time | Stock based on failure rate analysis |
| Standard Spares | Available locally, short lead time | Stock based on consumption history |
| Consumables | Regular replacement items | Stock based on PM plan consumption |

### Analysis Factors
- Equipment criticality (from criticality analysis)
- Failure rate (from FMECA)
- Lead time (from procurement data)
- Cost of spare part
- Cost of downtime per hour
- Storage requirements
- Shelf life limitations

---

## 8. RAM Analysis Methodology

**Source:** `maintenance-readiness/RAM Failure Model.xlsx`, `maintenance-readiness/ram-analysis-report-*.pdf`

### RAM = Reliability, Availability, Maintainability

**Key Metrics:**
- **Reliability (R)**: Probability of operating without failure for a specified period
  - MTBF (Mean Time Between Failures)
  - Failure Rate (λ = 1/MTBF)
- **Availability (A)**: Proportion of time the system is operational
  - A = MTBF / (MTBF + MTTR + MLDT)
- **Maintainability (M)**: Ease and speed of restoring to operational state
  - MTTR (Mean Time To Repair)
  - MLDT (Mean Logistics Delay Time)

### RAM Simulation
Monte Carlo simulation to model system behavior:
1. Define system configuration (series, parallel, standby)
2. Input failure and repair distributions for each component
3. Run simulation (typically 10,000+ iterations)
4. Calculate system availability, production throughput, bottlenecks
5. Identify critical components driving system unreliability
6. Test improvement scenarios (redundancy, PM optimization)

---

## 9. Work Management System

**Source:** `maintenance-readiness/maintenance-manual-*.pdf`

### Work Management Process
1. **Work Identification**: Defect reporting, PM generation, CBM alerts
2. **Work Planning**: Scope, resources, materials, permits, procedures
3. **Work Scheduling**: Weekly schedule, shutdown integration
4. **Work Execution**: Job execution with quality checks
5. **Work Completion**: Close work order, record actual data
6. **Work Analysis**: KPI calculation, trend analysis, improvement

### CMMS Configuration Requirements
- Equipment hierarchy (plant > area > system > equipment > component)
- PM plans and task lists
- Spare parts catalog linked to equipment
- Work order templates
- Failure coding (using VSC Failure Modes Table)
- KPI dashboards

---

## 10. Shutdown/Turnaround Management

**Source:** `maintenance-readiness/shutdown-procedure-*.pdf`

### Shutdown Planning Process
1. **Scope Definition**: Work list compilation (PM, corrective, modifications)
2. **Schedule Development**: Critical path, resource leveling
3. **Material Procurement**: Long-lead items, pre-staging
4. **Contractor Management**: SOW development, safety requirements
5. **Execution**: Daily progress, safety meetings, quality holds
6. **Closeout**: Punch list, lessons learned, performance analysis

---

## 11. Maintenance Procedure Examples

**Source:** `methodology/maintenance-procedures/` (5 DOCX files)

### Available Procedure Templates

| Procedure | Equipment Type | Key Content |
|-----------|---------------|-------------|
| Battery Charger Maintenance | Electrical - UPS/Battery | Inspection, testing, replacement criteria |
| SCADA Panel Maintenance | Electrical - Control | Cleaning, functional testing, calibration |
| Mill Drive System Maintenance | Mechanical - Drive (LRS) | Alignment, lubrication, wear measurement |
| Conveyor Belt Replacement | Mechanical - Conveyor | Belt tracking, splice procedure, tensioning |
| Crusher Liner Replacement | Mechanical - Crusher | Removal, inspection, installation, torque |

### Standard Procedure Format
Each maintenance procedure follows:
1. Purpose and scope
2. Safety requirements (PPE, LOTO, permits)
3. Tools and materials required
4. Step-by-step instructions
5. Quality acceptance criteria
6. Records and documentation

---

## 12. Maintenance Software Architecture

**Source:** `maintenance-readiness/maintenance-software-architecture-analysis-*.pdf`

### CMMS Options
| System | Strengths | Best For |
|--------|-----------|---------|
| SAP PM/EAM | Enterprise integration, complex assets | Large mining, oil & gas |
| Maximo (IBM) | Asset-intensive industries, strong analytics | Utilities, government |
| Infor EAM | Cloud-native, modern UX | Mid-size operations |

### Implementation Requirements for OR
1. Master data migration plan
2. Equipment hierarchy configuration
3. PM plan upload and scheduling
4. Work order workflow configuration
5. Spare parts catalog integration
6. Failure coding setup (VSC Failure Modes Table)
7. Reporting and KPI dashboards
8. User training

---

## 13. Maintenance Readiness Checklist

**Source:** `maintenance-readiness/maintenance-readiness-ASR-BP-106-*.pdf`

### Readiness Criteria by Gate

| Gate | Criteria | Metric |
|------|----------|--------|
| G1 | Maintenance philosophy defined | Document approved |
| G2 | Criticality analysis complete | 100% assets classified |
| G2 | Maintenance strategy approved | Document approved per tier |
| G3 | PM plans loaded in CMMS | 100% AA/A equipment |
| G3 | Spare parts ordered | 100% critical/insurance spares |
| G3 | Maintenance staff recruited | >90% positions filled |
| G3 | Training completed | >80% competency assessments passed |
| G4 | CMMS fully operational | All modules configured and tested |
| G4 | PM schedule active | First PM cycle executing |
| G5 | Maintenance KPIs on target | MTBF, availability within 10% of target |

---

## Changelog
### v1.0 (February 2026)
- Initial maintenance readiness reference compiled from 27 source documents
- VSC Failure Modes Table fully documented
- Cross-referenced with ISO 55000, SAE JA1011, IEC 60812
