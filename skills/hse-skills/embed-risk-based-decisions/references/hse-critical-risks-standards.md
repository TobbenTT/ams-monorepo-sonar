# HSE Critical Risks and Safety Standards Reference
## VSC Operational Readiness - Health, Safety & Environment

**Source Documents:**
- `methodology/hse-critical-risks/` (15 documents)
- `methodology/hse-standards/` (24 documents)
- `methodology/process-safety/` (1 document)

**Applicable Skills:**
- create-risk-assessment
- embed-risk-based-decisions
- track-incident-learnings
- manage-moc-workflow
- prepare-pssr-package
- certify-system-readiness
- generate-operating-procedures (safety sections)
- create-maintenance-strategy (safety-critical equipment)
- create-maintenance-manual (safety procedures)
- manage-equipment-preservation
- manage-loop-checking
- map-regulatory-requirements
- generate-esg-report

---

## Table of Contents

| Section | Topic | Source Folder |
|---------|-------|--------------|
| 1 | HSEC Management System Overview | hse-critical-risks |
| 2 | Risk Management Procedure | hse-critical-risks |
| 3 | Critical Risk Standards (13 Standards) | hse-critical-risks |
| 4 | HSE Operational Procedures (24 Procedures) | hse-standards |
| 5 | Process Safety Management | process-safety |
| 6 | Integration with OR Deliverables | Cross-reference |

---

## 1. HSEC Management System Overview

**Source:** `FLR-A9SN-EP-0000-HS-MN-0001.0 Manual HSEC Salares Norte Rev.B.pdf`

The HSEC (Health, Safety, Environment, and Community) Management System provides the overarching framework for managing HSE risks during project execution and operations. Key elements:

### System Structure
- Leadership and Commitment
- Risk Management
- Planning and Objectives
- Support and Resources
- Operational Control
- Performance Evaluation
- Improvement

### Integration with OR
The HSEC Management System must be fully operational before Gate G4 (Safe to Operate). The OR program ensures:
- All HSEC procedures are written and approved
- All personnel are trained on HSEC requirements
- All safety systems are verified and tested
- All permits and regulatory approvals are obtained
- Emergency response plans are in place and tested

---

## 2. Risk Management Procedure

**Source:** `GFSN01-FS-PC-0000-PT-00001 Procedimiento de Gestion de Riesgos Rev0_Firmado.pdf`

### Risk Assessment Process
1. **Hazard Identification**: Systematic identification of hazards using HAZID, HAZOP, bow-tie analysis
2. **Risk Analysis**: Assessment of likelihood and consequence using the risk matrix
3. **Risk Evaluation**: Comparison against risk criteria and ALARP demonstration
4. **Risk Treatment**: Selection and implementation of controls (barriers)
5. **Monitoring and Review**: Ongoing monitoring of risk levels and control effectiveness

### Risk Matrix
Standard 5x5 matrix assessing:
- **Likelihood**: Rare (1) → Almost Certain (5)
- **Consequence Categories**: Safety, Environment, Production, Financial, Reputation
- **Risk Levels**: Low (1-4), Medium (5-9), High (10-15), Very High (16-20), Extreme (25)

### Hierarchy of Controls
1. Elimination
2. Substitution
3. Engineering controls
4. Administrative controls
5. Personal Protective Equipment (PPE)

---

## 3. Critical Risk Standards (13 Standards)

**Source:** `methodology/hse-critical-risks/GFSN03-OP-SY-0000-ST-000XX` series

These 13 standards define the mandatory controls (fatal risk protocols) for the highest-consequence hazards. Each standard follows the same structure:
- Purpose and scope
- Definitions
- Critical controls (mandatory barriers)
- Verification requirements
- Emergency response
- Training requirements

### Standard Catalog

| ID | Standard | Key Controls | Equipment/Systems |
|----|----------|-------------|-------------------|
| ST-00001 | Light Vehicle Driving | Speed limits, journey management, vehicle inspection | Light vehicles, roads |
| ST-00002 | Heavy Mobile Equipment | Exclusion zones, traffic management, operator certification | Trucks, loaders, excavators |
| ST-00003 | Materials Handling | Lifting plans, load limits, inspection regime | Cranes, forklifts, rigging |
| ST-00004 | Lifting Operations | Lift plans, critical lift procedures, competent riggers | Cranes, lifting equipment |
| ST-00005 | Energy Isolation (LOTO) | Lockout/tagout procedures, verification, group isolation | All energy sources |
| ST-00006 | Explosives Management | Storage, handling, blast area management, certification | Explosives, detonators |
| ST-00007 | Electrical Safety | Permits, testing, competent persons, arc flash protection | Electrical systems |
| ST-00008 | Working at Height | Fall protection, edge protection, rescue plan | Scaffolds, ladders, platforms |
| ST-00009 | Confined Spaces | Atmospheric monitoring, rescue plan, competent entry | Vessels, tanks, pits |
| ST-00010 | Excavations | Ground conditions, benching/shoring, edge protection | Trenches, pits |
| ST-00011 | Guards and Protections | Machine guarding, interlocks, barrier inspection | Rotating equipment |
| ST-00012 | Slopes and Geotechnical | Slope monitoring, exclusion zones, inspection | Open pit, embankments |
| ST-00015 | COVID-19 Protocols | Health screening, distancing, PPE, isolation | All areas |

### Integration with Maintenance Strategy
For the Asset Management agent, these critical risk standards define:
- Which equipment requires safety-critical maintenance tasks
- Mandatory inspection frequencies for safety barriers
- Competency requirements for maintenance personnel
- Lock-out/tag-out (LOTO) procedures for each equipment type
- Safety interlocks that must be tested and verified

### Integration with Operating Procedures
For the Operations agent, these standards define:
- Mandatory safety steps in every SOP
- Pre-task risk assessment requirements
- Emergency response procedures to reference
- Training requirements for each operational activity

---

## 4. HSE Operational Procedures (24 Procedures)

**Source:** `methodology/hse-standards/` (24 PDF files)

### Procedure Catalog

| Category | Procedure | Key Content |
|----------|-----------|-------------|
| **Substance Management** | Alcohol and Drugs | Testing protocols, zero tolerance policy, fitness for duty |
| **Work at Height** | Scaffolding | Scaffold erection/dismantling, inspection, tagging system |
| **Site Management** | Barriers and Signage | Barricading, signage standards, exclusion zones |
| **Equipment** | Drager Equipment | Gas detection, calibration, maintenance |
| **PPE** | Personal Protective Equipment | PPE matrix by task, inspection, replacement |
| **Pressure Systems** | Pressurized Equipment | Testing, inspection, certification, failure prevention |
| **Emergency** | Emergency Response (ERC) | Emergency procedures, muster points, communication |
| **Health** | Ergonomics | Manual handling, workstation design, risk assessment |
| **Health** | Psychosocial Factors | Mental health, fatigue management, support programs |
| **Health** | Fatigue and Drowsiness | Hours of work, fatigue risk management, monitoring |
| **Management** | HSEC Manual | Overall management system documentation |
| **Traffic** | Traffic Management | Site traffic rules, speed limits, pedestrian safety |
| **Specialized** | High-Pressure Water Cleaning | Pressure limits, PPE, exclusion zones |
| **Construction** | Structural Steel Assembly | Erection procedures, temporary supports, fall protection |
| **Earthworks** | Earthworks Procedures | Excavation, compaction, ground conditions |
| **Site Management** | Housekeeping | Workplace cleanliness, waste management, storage |
| **Commissioning** | Pre-commissioning and Commissioning | Safety requirements during system startup |
| **Health** | Hearing Protection | Noise monitoring, hearing protection zones, audiometry |
| **Health** | Respiratory Protection | Air monitoring, respiratory equipment, fit testing |
| **Testing** | Hydraulic/Hydrostatic Testing | Test procedures, safety perimeters, pressure limits |
| **Regulatory** | Mining Safety Regulations | DS 132 (Chile) compliance requirements |
| **Health** | Industrial Health and Hygiene | Occupational exposure limits, monitoring, medical surveillance |
| **Hot Work** | Hot Work Procedures | Permits, fire watch, flammable atmosphere checks |
| **Construction** | Concrete Work | Formwork, pouring, curing, safety requirements |

---

## 5. Process Safety Management

**Source:** `methodology/process-safety/Integrating Process Safety, Maintainability, and Operability in Early-Stage Megaproject Design.gdoc`

### Key Concepts
- **Process Safety vs. Personal Safety**: Process safety addresses catastrophic events (explosions, toxic releases), while personal safety addresses individual injuries
- **Layer of Protection Analysis (LOPA)**: Systematic assessment of independent protection layers
- **Safety Integrity Level (SIL)**: Classification of safety instrumented functions
- **Bow-Tie Analysis**: Visual representation of threats, barriers, and consequences for major accident hazards

### Integration with OR
- Process safety studies (HAZOP, LOPA, SIL) must be completed during detailed engineering (Phase 3)
- Results feed directly into:
  - SOP development (safety-critical operating procedures)
  - Maintenance strategies (safety instrumented systems maintenance)
  - Training programs (process safety awareness)
  - Emergency response plans
  - MOC (Management of Change) procedures

---

## 6. Integration with OR Deliverables

### Deliverable-to-Standard Mapping

| OR Deliverable | Critical Risk Standards Required | HSE Procedures Required |
|---------------|--------------------------------|------------------------|
| Operating Procedures (SOPs) | All applicable to operations | All applicable to task |
| Maintenance Procedures | ST-00005 (LOTO), ST-00008 (Height), ST-00009 (Confined Space) | Equipment-specific procedures |
| Training Plans | All standards (awareness training) | All procedures (competency training) |
| Risk Assessments | All standards (barrier identification) | Risk management procedure |
| Emergency Response Plans | All standards (emergency sections) | ERC procedure |
| Commissioning Plans | All standards (commissioning safety) | Pre-comm/comm procedure |
| Staffing Plans | All standards (competency requirements) | All procedures (training requirements) |
| Contract Scopes | All standards (contractor requirements) | All procedures (contractor compliance) |

---

## Changelog
### v1.0 (February 2026)
- Initial HSE reference document compiled from 40 source documents
- Structured for cross-reference by OR agents
