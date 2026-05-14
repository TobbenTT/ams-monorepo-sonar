---
name: plan-training-program
description: "Plan comprehensive training programs for operational workforce. Triggers: 'training program', 'programa de capacitacion', 'entrenamiento'."
---

# Plan Training Program

## Skill ID: M-04

## Version: 1.0.0

## Category: M. Workforce Readiness

## Priority: P2 - Medium (essential for operational competency but typically follows staffing and organizational design)

---

## Purpose

Plan comprehensive training programs for operations and maintenance teams preparing for new facility startup, major expansions, or ongoing workforce development. This skill transforms competency requirements derived from organizational design, operating procedures, and regulatory mandates into a structured training program that includes needs analysis, curriculum design, schedule development, vendor coordination, delivery tracking, and effectiveness evaluation using the Kirkpatrick four-level model.

The workforce readiness challenge is one of the most underestimated risks in industrial Operational Readiness. The World Economic Forum estimates that 40% of the global industrial workforce will need reskilling by 2025 due to technology advancement, digitalization, and changing operational paradigms. For new facility startups in mining, oil and gas, and chemical processing, the training challenge is even more acute: an entirely new workforce must be brought to operational competency in a compressed timeline, often 6-12 months before first production. This workforce typically comprises a mix of experienced hires (who must learn new site-specific systems and procedures), recent graduates (who require foundational and practical training), and promoted personnel (who need to develop new competencies for higher-responsibility roles). The training must cover technical operations, maintenance practices, safety systems, emergency response, environmental compliance, quality management, and digital tools -- often simultaneously.

Training investment typically represents 15-25% of the total Operational Readiness budget, yet it is consistently one of the most underestimated line items. Industry data from the Mining Industry Human Resources Council (MiHR) and the Society for Maintenance and Reliability Professionals (SMRP) indicates that the average training cost per worker for a greenfield mining operation ranges from $15,000 to $40,000, encompassing vendor-provided equipment training, regulatory certification, site-specific procedure training, and on-the-job competency development. Organizations that underestimate training requirements face delayed startups (average 3-6 months when training is inadequate), increased incident rates during ramp-up (2-4x the steady-state rate), accelerated equipment degradation due to operator error, and high early turnover as workers feel unprepared and unsupported. A study by the Aberdeen Group found that best-in-class organizations that invest in structured training programs achieve 20% higher equipment availability, 30% lower maintenance costs, and 50% lower incident rates during the first year of operations compared to industry average.

This skill addresses Pain Point W-03 (Workforce Competency Gap) in the OR System framework. It establishes a systematic training program that maps every role to required competencies, identifies gaps between current and required competency levels, designs curricula that address gaps through the most effective learning methods, coordinates vendor and internal training resources, tracks completion and assessment results, and evaluates training effectiveness at all four Kirkpatrick levels (reaction, learning, behavior, results). The skill integrates with MCP servers for learning management system interaction, material storage, and schedule coordination.

---

## Intent & Specification

### Problem Statement

Industrial organizations preparing for new operations or major changes face a training challenge of enormous scope and complexity. A typical facility with 500-1,000 workers across operations, maintenance, HSE, and support functions may require 200-400 distinct training courses covering technical, safety, regulatory, and behavioral competencies. Without systematic planning, training programs suffer from: incomplete coverage (critical competencies missed), poor sequencing (advanced training delivered before prerequisites), vendor schedule conflicts (OEM training windows missed during construction), inadequate assessment (completion tracked but competency not verified), and no effectiveness measurement (investment returns unknown). The result is a workforce that is formally "trained" but not competent, leading to incidents, quality failures, and delayed ramp-up.

### What the Agent MUST Do

The AI agent MUST understand and execute the following core requirements:

1. **Competency Gap Analysis**: Compare the required competency profile for each role (derived from organizational design, job descriptions, and regulatory requirements) against the current competency levels of assigned or planned personnel. Produce a quantified gap analysis showing the specific competencies that need development, the magnitude of the gap, and the number of personnel affected.

2. **Training Needs Assessment**: Transform competency gaps into training requirements, identifying the most appropriate training method (classroom, e-learning, simulation, on-the-job, vendor-provided, mentoring) for each competency. Consider adult learning principles, the criticality of the competency, and the available time before the competency is needed.

3. **Curriculum Design**: Design a structured curriculum using the ADDIE (Analysis, Design, Development, Implementation, Evaluation) instructional design model. Organize training into logical programs (e.g., Operator Fundamentals, Advanced Process Control, Maintenance Technician Certification) with clear learning objectives, prerequisites, content outlines, assessment methods, and competency standards.

4. **Vendor Training Identification and Coordination**: Identify required vendor-provided training (OEM equipment training, specialized software training, regulatory certification training). Coordinate vendor availability with the project construction and commissioning schedule. Ensure vendor training is delivered at the optimal time -- not too early (knowledge decay) and not too late (needed for commissioning participation).

5. **Schedule Development**: Create a comprehensive training schedule that accounts for prerequisite sequencing, facility/equipment availability (some training requires access to installed equipment), personnel availability (balancing training with other pre-startup activities), trainer/vendor availability, training venue capacity, and the critical path to operational readiness.

6. **Resource Allocation**: Estimate and plan for all training resources: internal trainers, external vendors, training facilities, equipment (simulators, training rigs), materials, travel and accommodation, and training management administration. Produce a training budget aligned with the OR project budget.

7. **Delivery Tracking**: Monitor training delivery against the plan, tracking completion rates, assessment results, no-show rates, and schedule adherence. Identify and escalate deviations that threaten readiness timelines.

8. **Effectiveness Evaluation**: Design and implement training effectiveness evaluation at all four Kirkpatrick levels: Level 1 (Reaction -- participant satisfaction), Level 2 (Learning -- knowledge/skill acquisition), Level 3 (Behavior -- on-the-job application), Level 4 (Results -- operational performance impact). Use evaluation results to improve future training delivery.

---

## Trigger / Invocation

```
/plan-training-program
```

**Aliases**: `/training-plan`, `/training-program`, `/programa-capacitacion`, `/plan-capacitacion`

**Natural Language Triggers (EN)**:
- "Plan the training program for the new facility"
- "Create a training needs analysis"
- "Design a training curriculum for operations and maintenance"
- "Schedule vendor training for equipment commissioning"
- "Track training completion for startup readiness"
- "Evaluate training effectiveness"
- "Build a competency development plan"

**Natural Language Triggers (ES)**:
- "Planificar el programa de capacitacion para la nueva instalacion"
- "Crear un analisis de necesidades de capacitacion"
- "Disenar un curriculo de entrenamiento para operaciones y mantenimiento"
- "Programar la capacitacion de proveedores para puesta en marcha"
- "Seguimiento de la finalizacion de capacitacion para la preparacion de inicio"
- "Evaluar la efectividad de la capacitacion"
- "Construir un plan de desarrollo de competencias"

**Trigger Conditions**:
- Organizational design is approved and staffing plan is in development
- New facility startup requires workforce training program
- Competency matrix identifies gaps requiring training
- Vendor training windows are approaching and need coordination
- Management requests training readiness status for startup go/no-go decision
- Regulatory training requirements are identified through regulatory mapping
- Post-startup evaluation reveals competency deficiencies requiring remediation

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `organizational_design` | .xlsx, .docx | Organizational structure with all roles, reporting lines, and headcount per role. Must include operations, maintenance, HSE, and support functions |
| `competency_requirements` | .xlsx | Required competencies per role with target proficiency levels (1-5 scale). Typically derived from job descriptions, operating procedures, and regulatory requirements |
| `startup_timeline` | .xlsx, .docx | Project schedule showing key milestones: recruitment, equipment installation, commissioning phases, PSSR, first production. Training must be complete before corresponding milestones |
| `workforce_profile` | .xlsx | Current or planned workforce roster with existing qualifications, certifications, experience, and current competency levels (where available) |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| `regulatory_training_requirements` | .xlsx | Mandatory training requirements from regulatory mapping (L-01) including SERNAGEOMIN, SEREMI Salud, SEC, and DT requirements |
| `equipment_list` | .xlsx | Major equipment list with OEM-specific training requirements and vendor contact information |
| `operating_procedures` | .docx | Draft or final operating procedures for curriculum content development |
| `maintenance_strategy` | .docx, .xlsx | Maintenance strategy identifying specialized maintenance training requirements |
| `previous_training_records` | .xlsx | Historical training records for existing personnel being transferred or promoted |
| `training_budget` | .xlsx | Approved training budget allocation and constraints |
| `vendor_contracts` | .pdf | Equipment supply contracts specifying vendor-provided training obligations |
| `site_facilities_plan` | .pdf | Training facility availability (classrooms, workshops, simulators, control room trainer) |
| `similar_facility_training` | .xlsx | Training program from a similar facility for benchmarking and accelerated development |
| `incident_learnings` | .xlsx | Incident investigation findings identifying training-related root causes (from L-02) |

### Context Enrichment

The agent will automatically enrich the training plan by:
- Querying the learning management system (via mcp-lms) for existing courses and content
- Cross-referencing regulatory requirements (from L-01) for mandatory certifications
- Checking incident history (from L-02) for training-related root causes
- Benchmarking training hours per role against industry standards (OPITO, SMRP, MiHR)
- Identifying vendor training obligations from equipment procurement contracts
- Reviewing competency frameworks from industry bodies (OPITO, SMRP, ISA)

### Input Validation Rules

- Organizational design must include all roles that will be present during operations
- Competency requirements must cover technical, safety, regulatory, and behavioral competencies
- Startup timeline must identify the date by which each role must be fully competent
- Workforce profile must indicate whether positions are filled or vacant (affects training scheduling)
- Regulatory training requirements must specify certification validity periods and renewal cycles

---

## Output Specification

### Deliverable 1: Training Needs Analysis (.xlsx)

**Filename**: `{ProjectCode}_Training_Needs_Analysis_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Executive Summary"
- Total roles assessed, total personnel, total unique competencies
- Overall gap magnitude: number of role-competency gaps to close
- Total training hours estimated (classroom, OJT, e-learning)
- Total training courses required (internal, vendor, external)
- Budget estimate summary
- Critical path items (training that gates startup milestones)

#### Sheet 2: "Competency Gap Matrix"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Role_ID | Unique role identifier | OPS-001 |
| B | Role_Title | Role name | Control Room Operator |
| C | Department | Organizational unit | Operations |
| D | Headcount | Number of personnel in this role | 12 |
| E | Competency_ID | Unique competency identifier | COMP-PROC-015 |
| F | Competency_Name | Competency description | Process Control System (DCS) Operation |
| G | Competency_Category | Technical / Safety / Regulatory / Behavioral / Digital | Technical |
| H | Required_Level | Target proficiency level (1-5) | 4 - Proficient |
| I | Current_Level | Current average proficiency level | 2 - Basic |
| J | Gap_Magnitude | Required minus Current | 2 |

See [`references/skill-output-details.md`](references/skill-output-details.md) for complete output field definitions and format details.

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| OPITO (Offshore Petroleum Industry Training Organization) | Competency framework and training standards for oil and gas operations; applied as best practice benchmark for structured competency-based training in all industrial sectors |
| SMRP (Society for Maintenance and Reliability Professionals) | Maintenance competency domains and body of knowledge; defines competency requirements for maintenance roles across five pillars: Business & Management, Manufacturing Process Reliability, Equipment Reliability, Organization & Leadership, Work Management |
| ADDIE Instructional Design Model | Analysis, Design, Development, Implementation, Evaluation -- the foundational framework for all training curriculum development in this skill |
| Kirkpatrick Four-Level Evaluation Model | Reaction, Learning, Behavior, Results -- the standard framework for evaluating training program effectiveness |

### Secondary Standards

| Standard | Application |
|----------|-------------|
| ISO 19011:2018 | Guidelines for auditing management systems -- Specifically Clause 7 on auditor competence and training requirements |
| ISO 10015:2019 | Quality management -- Guidelines for competence management and people development |
| ISO 45001:2018 | Clause 7.2 Competence and Clause 7.3 Awareness -- Requirements for occupational safety competence |
| ISA/IEC 62443 | Industrial cybersecurity training requirements for personnel operating control systems |
| NCCER (National Center for Construction Education and Research) | Standardized craft training curricula for construction and maintenance trades |
| ASNT (American Society for Nondestructive Testing) | NDT technician qualification and certification requirements (Level I, II, III) |

### Chilean Regulatory Training Requirements

| Regulation | Training Requirement | Target Roles | Frequency |
|-----------|---------------------|--------------|-----------|
| DS 132 (SERNAGEOMIN) | Mining safety induction, role-specific safety training, emergency response | All mine site personnel | Initial + annual refresher |
| DS 594 (SEREMI Salud) | Occupational hygiene, hazardous materials handling, PPE usage | All workers exposed to hazards | Initial + when conditions change |
| Ley 16.744 | Occupational risk prevention, right-to-know (Derecho a Saber) | All workers | Initial + annual |
| NCh Elec. 4/2003 (SEC) | Electrical safety for qualified and authorized persons | Electrical workers | Initial + certification renewal |
| DS 43/DS 78 | Hazardous substances management training | Personnel handling hazardous chemicals | Initial + biennial |
| Codigo del Trabajo | Labor rights, internal regulations, anti-harassment | All workers | Initial + when regulations change |
| ONEMI/SENAPRED | Emergency preparedness and evacuation | All workers | Initial + semi-annual drills |

### Key Frameworks

**ADDIE Model Application**:
- **Analysis**: Competency gap analysis, training needs assessment, learner analysis, context analysis
- **Design**: Learning objectives, assessment strategy, content structure, delivery methods, sequencing
- **Development**: Content creation, materials development, trainer preparation, pilot testing
- **Implementation**: Training delivery, logistics management, participant tracking, issue resolution
- **Evaluation**: Four-level Kirkpatrick evaluation, continuous improvement, ROI analysis

**Competency Proficiency Levels**:

| Level | Name | Description | Typical Training Method |
|-------|------|-------------|------------------------|
| 1 | Awareness | Knows the concept exists and its basic purpose | E-learning, orientation |
| 2 | Basic | Can perform basic tasks with guidance and supervision | Classroom + supervised OJT |
| 3 | Competent | Can perform independently under normal conditions | Classroom + OJT + assessment |
| 4 | Proficient | Can handle complex situations and train others | Advanced training + extensive OJT + mentoring |
| 5 | Expert | Can innovate, optimize, and lead in the competency area | Experience + specialized programs + industry engagement |

---

## Step-by-Step Execution

### Phase 1: Analysis (Steps 1-4)
**Step 1: Define Training Program Scope and Objectives**
### Phase 2: Design (Steps 5-8)
**Step 5: Design Training Programs and Curricula**
### Phase 3: Development and Implementation (Steps 9-12)
**Step 9: Develop the Training Schedule**
### Phase 4: Monitoring and Evaluation (Steps 13-16)
**Step 13: Track Training Delivery and Completion**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

### Scoring Table

| Criterion | Weight | Target | Minimum Acceptable | Measurement Method |
|-----------|--------|--------|--------------------|--------------------|
| Competency coverage (all roles and required competencies mapped) | 20% | 100% | >98% | Audit of gap matrix against organizational design and regulatory requirements |
| Training plan completeness (course for every identified gap) | 15% | 100% | >95% | Cross-check of training courses against gap matrix |
| Schedule feasibility (no unresolvable conflicts, prerequisites respected) | 15% | 100% feasible | >95% | Schedule validation against constraints and milestone dates |
| Vendor training confirmed (all required vendor training booked) | 10% | 100% confirmed | >90% | Status of vendor training coordination tracker |
| Completion rate (personnel completing on time) | 15% | >95% | >90% | LMS completion tracking against due dates |
| Assessment pass rate (first attempt) | 10% | >85% | >75% | LMS assessment results analysis |
| Kirkpatrick Level 1 satisfaction | 5% | >4.2/5.0 | >3.8/5.0 | Course evaluation survey averages |
| Kirkpatrick Level 2 knowledge gain | 5% | >25% improvement | >20% | Pre/post assessment comparison |
| Budget adherence | 5% | Within 5% of plan | Within 15% of plan | Actual vs. budgeted training cost |

### Automated Quality Checks

- [ ] Every role in the organizational design has a competency profile
- [ ] Every competency gap has an assigned training course or program
- [ ] Every course has defined learning objectives, assessment method, and pass criteria
- [ ] All prerequisite relationships are defined and sequencing is valid (no circular dependencies)
- [ ] All regulatory-mandated training is included with correct certification requirements
- [ ] All vendor training requirements are identified and in the coordination tracker
- [ ] Training schedule does not exceed venue capacity or trainer availability
- [ ] Budget is allocated for all planned training activities
- [ ] OJT task lists exist for all roles requiring on-the-job training
- [ ] Assessment instruments are defined for all courses
- [ ] Kirkpatrick evaluation instruments are designed for all programs
- [ ] Training completion targets are aligned with startup milestones on the critical path
- [ ] Remediation procedures are defined for assessment failures
- [ ] All training records are configured for regulatory retention requirements

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Input Received | Criticality | MCP Integration |
|-------------|---------------|-------------|-----------------|
| `create-org-design` | Organizational structure, role definitions, headcount plan | Critical | mcp-sharepoint |
| `create-staffing-plan` | Workforce profile, recruitment timeline, personnel assignments | Critical | mcp-sharepoint |
| `track-competency-matrix` | Current competency levels of assigned personnel | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Regulatory training requirements by role and jurisdiction | Critical | mcp-sharepoint |
| `track-incident-learnings` (L-02) | Training-related root causes from incident investigations | High | mcp-sharepoint |
| `create-operations-manual` | Operating procedures driving technical competency requirements | High | mcp-sharepoint |
| `create-maintenance-strategy` | Maintenance competency requirements and specialized training needs | High | mcp-sharepoint |
| `create-commissioning-plan` | Commissioning schedule for vendor training timing and OJT opportunities | Medium | mcp-sharepoint |
| `create-asset-register` | Equipment list for vendor training identification | Medium | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Output Provided | Criticality | MCP Integration |
|-------------|----------------|-------------|-----------------|
| `prepare-pssr-package` | Training readiness certification for pre-startup safety review | Critical | mcp-sharepoint |
| `model-rampup-trajectory` | Training completion milestones affecting ramp-up capability | High | mcp-sharepoint |
| `model-opex-budget` | Training budget for OPEX modeling | Medium | mcp-sharepoint |
| `create-kpi-dashboard` | Training KPIs (completion rate, assessment results, effectiveness) | Medium | mcp-sharepoint |
| `track-competency-matrix` | Updated competency levels after training completion | High | mcp-sharepoint |
| `create-or-framework` | Training program as component of OR readiness assessment | High | mcp-sharepoint |
| `unify-operational-data` (N-01) | Training data for integration into unified operational dashboard | Medium | mcp-sharepoint |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
