---
name: create-operations-manual
description: "Create comprehensive operations manuals including SOPs, emergency procedures, and operating parameters. Triggers: 'operations manual', 'SOPs', 'manual de operaciones', 'procedimientos operativos'."
---

# Create Operations Manual
## Skill ID: create-operations-manual
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Critical

## Purpose
Generates comprehensive Standard Operating Procedures (SOPs) and operations manuals for industrial facilities, covering normal operations, startup, shutdown, and emergency procedures. These manuals are the primary reference documents that operating personnel use daily to safely and efficiently operate process equipment and systems.

Operations manuals are a critical deliverable in Operational Readiness. Without properly documented procedures, operators rely on tribal knowledge, which creates safety risks, inconsistent operations, and production losses. Well-crafted operations manuals enable new operators to perform their duties safely and reduce the time to achieve stable operations after commissioning.

## Intent & Specification
The AI agent MUST understand that:

1. **Safety is Paramount**: Every procedure must integrate safety considerations. An operations manual that does not address hazards, protective measures, and emergency responses is fundamentally deficient.
2. **Procedures Must Be Usable in the Field**: Operations manuals are used by operators at the control panel and in the field. Language must be clear, direct, and action-oriented. Avoid verbose engineering descriptions - operators need step-by-step instructions.
3. **Four Operating Modes Required**: Each system requires procedures for:
   - Normal Operation (steady-state monitoring and control)
   - Startup (initial and normal startup sequences)
   - Shutdown (normal and emergency shutdown)
   - Emergency/Abnormal Operations (troubleshooting and response)
4. **System-by-System Organization**: Each process system gets its own manual section or standalone document. A "system" is defined by process boundaries (typically aligned with P&ID sheets).
5. **ISA-5.1 Compliance**: All instrument and control references must follow ISA-5.1 symbology and tag numbering conventions, matching the P&IDs.
6. **Living Documents**: Manuals must be structured for easy updates as operating experience accumulates. Version control and management of change integration are essential.
7. **Language**: Spanish (Latin American), with instrument tags and technical nomenclature maintained in their standard English-origin form as used on P&IDs.

## Trigger / Invocation
```
/create-operations-manual
```

### Natural Language Triggers
- "Create operations manual for [system/plant]"
- "Generate SOPs for [process unit]"
- "Write startup/shutdown procedures for [equipment]"
- "Develop operating procedures for [system]"
- "Crear manual de operaciones para [sistema/planta]"
- "Generar procedimientos operativos estandar"
- "Escribir procedimientos de arranque/parada"

## Guided Mode

This skill supports guided mode. When triggered, execute the Guided Mode Protocol
(defined in the agent CLAUDE.md) BEFORE proceeding to Step-by-Step Execution.

**GM-1 Summary:** 5 required + 8 optional questions covering system boundaries,
process descriptions, P&IDs, control philosophy, safety systems, operating
procedures, and environmental requirements.
See `references/guided-mode-questions.md` for the complete question sequence.

**Dependency checks:** Requires process engineering documents (P&IDs, process descriptions).
Best results when equipment hierarchy and HAZOP are available.

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `p_and_ids` | Piping and Instrumentation Diagrams for the system(s) | .pdf / .dwg | Engineering |
| `process_description` | Narrative process description explaining how the system works | .docx / .pdf | Engineering |
| `equipment_datasheets` | Technical data for major equipment (pumps, vessels, heat exchangers, etc.) | .pdf / .xlsx | Vendor / Engineering |
| `system_boundaries` | Definition of system scope and interfaces with other systems | .docx / Text | Engineering / User |
| `control_philosophy` | Description of control strategies, interlocks, and automation level | .docx / .pdf | Instrument & Control Engineering |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `hazop_report` | Hazard and Operability Study results | Extract hazards from process description |
| `cause_and_effect_matrix` | Safety system C&E diagrams | Derive from control philosophy |
| `alarm_rationalization` | Alarm setpoints and priorities | Extract from P&IDs and datasheets |
| `interlock_list` | Safety interlock descriptions and setpoints | Extract from control philosophy |
| `environmental_permits` | Discharge limits, emission standards | Apply regulatory defaults |
| `previous_operating_manuals` | Existing procedures for similar systems | None |
| `dcs_screen_layouts` | Control system HMI screen designs | Reference by tag |
| `material_safety_data` | MSDS for chemicals in the process | Search database |
| `operator_competency_level` | Expected skill level of operators | Competent technician |
| `language` | Output language | `es-CL` |

### Context Enrichment
The agent should automatically:
- Cross-reference P&ID tag numbers with equipment datasheets for operating parameters
- Extract safety interlock setpoints and alarm values from C&E matrices
- Identify all chemical hazards from process stream compositions
- Retrieve HSE requirements from the hse-agent for the applicable jurisdiction
- Identify environmental compliance requirements (discharge limits, emission limits)
- Search knowledge base for similar procedures from past projects

## Output Specification

### Document: Operations Manual (.docx) - One per System
**Filename**: `VSC_ManualOps_{ProjectCode}_{SystemCode}_{SystemName}_{Version}_{Date}.docx`

**Master Structure** (per system manual):

#### Part 1: System Overview
1. **System Description**
   - 1.1 Purpose and function of the system
   - 1.2 System boundaries and interfaces
   - 1.3 Process flow description (simplified)
   - 1.4 Reference P&IDs (list with revision numbers)
   - 1.5 Major equipment list with tag numbers
   - 1.6 Design basis and operating parameters table

2. **Safety Information**
   - 2.1 Hazards associated with this system
   - 2.2 Personal Protective Equipment (PPE) requirements
   - 2.3 Chemical hazards and MSDS references
   - 2.4 Safety interlocks and their functions
   - 2.5 Emergency isolation valves and locations
   - 2.6 Fire and gas detection coverage
   - 2.7 Environmental protection measures

3. **Control and Instrumentation Overview**
   - 3.1 Control strategy summary
   - 3.2 Key control loops (PID controllers with setpoints)
   - 3.3 Critical alarm summary (tag, description, setpoint, priority, action)
   - 3.4 Safety instrumented systems (SIS) relevant to this system
   - 3.5 DCS/HMI screen references

4. **Operating Parameters**
   - 4.1 Normal operating ranges table
   - 4.2 Design limits table
   - 4.3 Alarm and trip setpoints table
   - 4.4 Process quality specifications

#### Part 2: Normal Operations
5. **Steady-State Operating Procedure**
   - 5.1 Pre-conditions for normal operation
   - 5.2 Routine monitoring activities (hourly/shift/daily)
   - 5.3 Field rounds checklist (what to inspect, where, frequency)
   - 5.4 Log sheet entries required
   - 5.5 Routine adjustments and optimizations
   - 5.6 Product quality monitoring
   - 5.7 Routine sampling procedures
   - 5.8 Shift handover requirements

6. **Rate Changes and Load Adjustments**
   - 6.1 Throughput increase procedure
   - 6.2 Throughput decrease procedure
   - 6.3 Product grade change procedure (if applicable)
   - 6.4 Feed quality variation response

#### Part 3: Startup Procedures
7. **Initial Startup (Commissioning)**
   - 7.1 Prerequisites and pre-startup checklist
   - 7.2 Pre-startup safety review (PSSR) requirements
   - 7.3 Utility systems verification
   - 7.4 Initial startup sequence (step-by-step)
   - 7.5 First-fill and priming procedures
   - 7.6 Performance verification tests
   - 7.7 Handover from commissioning to operations criteria

8. **Normal Startup (After Shutdown)**
   - 8.1 Pre-startup checklist
   - 8.2 Pre-startup safety checks
   - 8.3 Startup sequence (step-by-step)
   - 8.4 Transition to normal operation criteria
   - 8.5 Post-startup monitoring (first 4 hours)

#### Part 4: Shutdown Procedures
9. **Normal (Planned) Shutdown**
   - 9.1 Pre-shutdown notifications and preparations
   - 9.2 Load reduction sequence
   - 9.3 Shutdown sequence (step-by-step)
   - 9.4 System isolation and de-energization
   - 9.5 System preservation (for extended shutdowns)
   - 9.6 Post-shutdown checks

10. **Emergency Shutdown**
    - 10.1 ESD activation criteria
    - 10.2 Automatic ESD sequence description
    - 10.3 Manual emergency shutdown procedure
    - 10.4 Post-ESD immediate actions
    - 10.5 Post-ESD system assessment
    - 10.6 Restart after emergency shutdown

#### Part 5: Abnormal and Emergency Operations
11. **Troubleshooting Guide**
    - 11.1 Symptom-based troubleshooting matrix
    - 11.2 Common operational problems and solutions
    - 11.3 Equipment-specific troubleshooting

12. **Emergency Procedures**
    - 12.1 Loss of power (total and partial)
    - 12.2 Loss of cooling water
    - 12.3 Loss of instrument air
    - 12.4 Loss of steam (if applicable)
    - 12.5 Fire in the area
    - 12.6 Chemical spill/release
    - 12.7 Equipment failure scenarios
    - 12.8 Evacuation procedures specific to this system area

#### Part 6: Appendices
- A: P&ID index and revision register
- B: Equipment operating parameter summary table
- C: Complete alarm and trip setpoint list
- D: Interlock description sheets
- E: Field round checklists (printable)
- F: Log sheet templates
- G: Emergency contact numbers
- H: Glossary and abbreviations

### Procedure Writing Standards

Each step-by-step procedure MUST follow this format:
```
PROCEDIMIENTO: [Procedure Name]
Codigo: [SOP-XXX-YYY-ZZZ]
Sistema: [System Name and Code]
Revision: [Rev. Number]
Fecha: [Date]

PRECONDICIONES:
[ ] Condicion 1 verificada
[ ] Condicion 2 verificada
[ ] Condicion N verificada

PPE REQUERIDO:
- [List specific PPE]

HERRAMIENTAS/MATERIALES:
- [List required tools and materials]

RIESGOS Y PRECAUCIONES:
- [Hazard 1]: [Precaution 1]
- [Hazard 2]: [Precaution 2]

PROCEDIMIENTO:
Paso | Accion | Responsable | Verificacion/Criterio
-----|--------|-------------|----------------------
1    | [Verb] [Object] [Condition/Standard] | Operador Panel | [What confirms step is complete]
2    | [Verb] [Object] [Condition/Standard] | Operador Campo | [What confirms step is complete]
...

NOTAS:
- [Important operational notes]

ADVERTENCIAS:
⚠ [Safety warnings in bold]

REGISTRO:
- [What to record in the log]
```

### Writing Style Requirements
- **Active voice, imperative mood**: "Open valve XV-2101" not "Valve XV-2101 should be opened"
- **Specific and measurable**: "Increase temperature to 85 C at a rate of 2 C/min" not "Gradually increase temperature"
- **Tag numbers always included**: "Check pressure on PI-2105 (Reactor Inlet Pressure)" not just "Check reactor pressure"
- **Units always specified**: "Maintain level between 60-70% on LT-2110" not "Keep level normal"
- **Warnings BEFORE the step**: Place safety warnings before the step they relate to, not after
- **One action per step**: Each step describes one clear action
- **Conditional steps clearly marked**: "IF pressure > 10 bar, THEN open PV-2103 to depressurize"

## Methodology & Standards

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISA-5.1** | Instrumentation symbols and identification - all P&ID references |
| **ISA-18.2** | Management of alarm systems - alarm references and classifications |
| **IEC 61511** | Safety instrumented systems - SIS procedure integration |
| **ISO 45001** | Occupational health and safety - safety integration in procedures |

### Secondary Standards
| Standard | Application |
|----------|-------------|
| **API RP 54/T-1** | Occupational safety for oil & gas (if applicable) |
| **NFPA 30/70** | Flammable liquids / Electrical safety |
| **DS 132 (Chile)** | Reglamento de Seguridad Minera (mining sector) |
| **DS 594 (Chile)** | Condiciones Sanitarias y Ambientales Basicas en los Lugares de Trabajo |
| **OSHA 29 CFR 1910.119** | Process Safety Management (reference for PSSR) |

### Procedure Writing Methodology
1. **Process Understanding**: Study P&IDs and process descriptions to understand system function
2. **Safety Layer Identification**: Identify all hazards, interlocks, and protective systems
3. **Operational Logic Mapping**: Map the logical sequence of operations (decision trees for each operating mode)
4. **Parameter Extraction**: Extract all operating parameters, setpoints, alarm values from engineering data
5. **Step-by-Step Development**: Write procedures using the format standard (one action per step, active voice)
6. **HSE Integration**: Integrate safety warnings, PPE requirements, and emergency responses
7. **Cross-Reference Validation**: Verify all tag numbers, setpoints, and equipment references against source documents

## Step-by-Step Execution

### Phase 1: System Analysis (Steps 1-4)
1. **Parse P&IDs**: Extract from each P&ID:
   - All equipment items (vessels, exchangers, pumps, etc.) with tag numbers
   - All instruments and control devices with tag numbers
   - All control loops and their configurations
   - All safety interlocks and ESD valves
   - All manual valves critical to operation
   - Process streams and interconnections with other systems
2. **Parse Process Description**: Understand:
   - What the system does (function)
   - How it works (process mechanism)
   - Normal operating conditions (T, P, flow, level, composition)
   - Design conditions and limits
   - Feed requirements and product specifications
3. **Extract Operating Parameters**: Build a comprehensive parameter table:
   - For each control loop: setpoint, operating range, alarm setpoints
   - For each equipment: operating limits, design limits
   - For each instrument: range, alarm/trip values
   - For each quality parameter: target, acceptable range
4. **Identify Hazards**: From HAZOP, P&IDs, and process description:
   - Chemical hazards (toxic, flammable, corrosive, reactive)
   - Physical hazards (pressure, temperature, rotating equipment)
   - Environmental hazards (emissions, discharges, noise)
   - Ergonomic hazards (confined spaces, heights, manual handling)

### Phase 2: Procedure Development (Steps 5-8)
5. **Develop Normal Operations Procedure**:
   - Define steady-state monitoring activities
   - Create field round routes and checklists
   - Document routine adjustments and their triggers
   - Define shift handover requirements
   - Include routine sampling and quality checks
6. **Develop Startup Procedures**:
   - Create comprehensive pre-startup checklists
   - Define the startup sequence step-by-step
   - Include first-fill/priming for initial commissioning startup
   - Define hold points for verification
   - Specify criteria for "system is now in normal operation"
7. **Develop Shutdown Procedures**:
   - Normal shutdown: orderly sequence, preservation steps
   - Emergency shutdown: rapid sequence, immediate safety actions
   - Define criteria for different levels of shutdown (partial/full)
   - Post-shutdown activities and system preservation
8. **Develop Abnormal/Emergency Procedures**:
   - Create troubleshooting matrix (symptom > possible cause > action)
   - Document emergency response for each identified scenario
   - Include loss-of-utility responses (power, water, air, steam)
   - Include fire/explosion/release response for this system area

### Phase 3: Safety Integration (Steps 9-10)
9. **Integrate HSE Content**: For every procedure:
   - Add PPE requirements at the beginning
   - Insert safety warnings BEFORE the relevant step
   - Reference safety interlocks and their bypass procedures
   - Include permit-to-work requirements where applicable
   - Add environmental compliance checks
10. **Validate with HSE Agent**: Send procedures to hse-agent for:
    - Verification that all identified hazards are addressed
    - Confirmation of PPE requirements
    - Validation of emergency response procedures
    - Regulatory compliance check

### Phase 4: Document Assembly & Quality (Steps 11-13)
11. **Compile Manual**: Assemble all procedures into the standard manual structure.
12. **Cross-Reference Check**:
    - Every tag number mentioned matches P&ID
    - Every setpoint matches the datasheet or control philosophy
    - Every alarm value matches the alarm rationalization
    - Equipment operating parameters are internally consistent
    - All procedures reference the correct P&ID revision
13. **Readability Review**:
    - Steps are clear and unambiguous
    - No step contains more than one action
    - Conditional logic (IF/THEN) is clearly structured
    - Units are consistently applied
    - Technical terms are used correctly and consistently

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Technical Accuracy | 25% | All parameters, setpoints, tag numbers match engineering documents |
| Safety Integration | 25% | Every procedure addresses hazards, PPE, and emergency response |
| Completeness | 20% | All four operating modes covered for each system |
| Usability | 15% | Procedures are clear, concise, and usable by field operators |
| Standards Compliance | 10% | ISA-5.1 symbology, procedure formatting standards met |
| Consistency | 5% | Terminology, style, and format consistent throughout |

### Automated Quality Checks
- [ ] Every equipment tag referenced exists on the P&IDs
- [ ] Every instrument tag follows ISA-5.1 naming convention
- [ ] All setpoints have units specified
- [ ] Normal operating ranges are within design limits
- [ ] Alarm setpoints are outside normal range but within design limits
- [ ] Trip setpoints are outside alarm setpoints but within design limits
- [ ] Every startup procedure has a pre-startup checklist
- [ ] Every procedure specifies PPE requirements
- [ ] Safety warnings appear BEFORE the step they relate to
- [ ] Each step contains exactly one action
- [ ] All procedures use active voice, imperative mood
- [ ] Conditional steps use IF/THEN format
- [ ] Emergency shutdown procedures exist for every system
- [ ] Loss-of-utility procedures address all relevant utilities
- [ ] All P&ID revision numbers are current
- [ ] No placeholder text (TBD, XXX, [INSERT]) remaining
- [ ] Table of contents accurately reflects document structure

## MCP Integrations

- **mcp-sharepoint**: Store and version operations manuals, SOPs, and field round checklists in the project document repository
- **mcp-cmms**: Retrieve equipment operating parameters, alarm setpoints, and tag references for procedure cross-validation
- **mcp-onedrive**: Enable collaborative drafting and SME review of procedure sections before formal approval

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `engineering-data-agent` | P&IDs, datasheets, control philosophy | Critical |
| `process-engineering-agent` | Process descriptions, material balances | Critical |
| `hse-agent` | HAZOP results, safety requirements, regulatory compliance | Critical |
| `instrument-control-agent` | Alarm rationalization, interlock details, DCS layouts | High |
| `commissioning-agent` | Initial startup requirements, PSSR criteria | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-training-plan` | Operations manual as basis for operator training content | Automatic |
| `create-staffing-plan` | Operating task requirements for shift manning calculation | Automatic |
| `simulator-configuration-agent` | Procedures for OTS (Operator Training Simulator) scenario design | On request |
| `commissioning-agent` | Operating procedures for use during commissioning | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | Safety content validation | During safety integration phase |
| `process-engineering-agent` | Technical accuracy review | During parameter extraction |
| `instrument-control-agent` | Control system accuracy verification | During control description writing |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_OperationsManual_Template_v2.5.docx` - Standard operations manual template
- `VSC_SOP_Template_v1.3.docx` - Individual procedure template
- `VSC_FieldRound_Checklist_Template_v1.0.xlsx` - Field round template
- `VSC_LogSheet_Template_v1.0.xlsx` - Operator log sheet template

### Reference Documents
- ISA-5.1-2022 Instrumentation Symbols and Identification
- VSC Procedure Writing Guide v3.0
- VSC Operating Parameter Table Template
- Industry-specific procedure examples from knowledge base

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.
