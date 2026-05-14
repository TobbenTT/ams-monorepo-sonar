---
name: create-training-plan
description: "Create training plans with competency gap analysis and training schedules. Triggers: 'training plan', 'competency development', 'plan de capacitacion'."
---

# Create Training Plan
## Skill ID: create-training-plan
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Generates comprehensive training plans with competency gap analysis for industrial operations and maintenance workforces. This skill identifies the competencies required for each role, assesses the current (or expected) competency levels of the workforce, quantifies the gaps, and designs a structured training program to close those gaps before commissioning and throughout steady-state operations.

Training is one of the most critical and time-constrained Operational Readiness workstreams. Inadequately trained personnel lead to safety incidents, equipment damage, production losses, and extended ramp-up periods. The training plan must be realistic in scope, sequenced correctly (foundational before advanced), and aligned with the workforce buildup schedule.

## Intent & Specification
The AI agent MUST understand that:

1. **Competency-Based Approach**: Training is driven by the gap between required competencies (from role profiles and job tasks) and actual competencies (from workforce assessment). Training fills the gap, nothing more, nothing less.
2. **Gap Analysis is Quantitative**: The gap analysis must produce measurable data - competency scores, gap sizes, training hours required - not vague qualitative statements.
3. **Sequencing Matters**: Training must follow a logical learning path: safety first, then fundamentals, then system-specific, then advanced. Operators cannot learn emergency procedures before they understand normal operations.
4. **Multiple Delivery Methods**: Not all training is classroom-based. The plan must include on-the-job training (OJT), simulator training, vendor training, self-directed learning, mentoring, and competency assessments.
5. **Time Constraints Are Real**: Training must complete before the person needs to perform the role. The schedule must be realistic given the number of trainees, trainer availability, and facility access.
6. **Compliance Training is Non-Negotiable**: Regulatory and safety certifications (first aid, fire fighting, confined space, electrical safety, etc.) must be completed before personnel can work on site.
7. **Language**: Spanish (Latin American).

## Trigger / Invocation
```
/create-training-plan
```

### Natural Language Triggers
- "Create a training plan for [facility/team]"
- "Develop competency gap analysis for [workforce]"
- "Design training program for [operations/maintenance]"
- "Crear plan de capacitacion para [planta/equipo]"
- "Desarrollar analisis de brechas de competencia"
- "Disenar programa de entrenamiento"

## Guided Mode

This skill supports guided mode. When triggered, execute the Guided Mode Protocol
(defined in the agent CLAUDE.md) BEFORE proceeding to Step-by-Step Execution.

**GM-1 Summary:** 4 required + 7 optional questions covering staffing plan, competency
requirements, operations/maintenance manuals, training infrastructure, regulatory
certifications, and timeline.
See `references/guided-mode-questions.md` for the complete question sequence.

**Dependency checks:** Requires create-staffing-plan output. Strongly benefits from
create-operations-manual and create-maintenance-strategy outputs.

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `staffing_plan` | Roles, headcount, competency profiles, buildup schedule | .xlsx / .docx | create-staffing-plan |
| `competency_requirements` | Required competencies per role with target levels | .xlsx | Staffing plan / Role profiles |
| `operations_manuals` | SOPs that operators must be trained on | .docx | create-operations-manual |
| `maintenance_manuals` | Maintenance procedures that technicians must be trained on | .docx | create-maintenance-manual |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `current_workforce_assessment` | Current skill/competency levels of existing staff | Assume all new hires (greenfield) |
| `maintenance_strategy` | RCM results indicating skill requirements | Extract from maintenance manual |
| `vendor_training_offerings` | OEM training courses available | Research common vendors |
| `training_facilities` | Available classrooms, workshops, simulators | Assume need to provision |
| `regulatory_training_requirements` | Mandatory certifications by jurisdiction | Chilean regulations (DS 132, DS 594) |
| `commissioning_schedule` | Key dates for training completion deadlines | Derive from buildup schedule |
| `training_budget` | Budget constraints for training | Estimate based on headcount |
| `existing_training_programs` | Current training materials or programs (brownfield) | None |
| `simulator_availability` | Operator Training Simulator (OTS) available | Recommend if applicable |
| `language_requirements` | Languages required for training delivery | Spanish primary, English for vendors |

### Context Enrichment
The agent should automatically:
- Extract competency requirements from role profiles in the staffing plan
- Identify all procedures that require training from operations and maintenance manuals
- Retrieve regulatory training requirements for the jurisdiction
- Research vendor training programs for major equipment
- Estimate training durations based on competency complexity and learning methods

## Output Specification

### Document 1: Gap Analysis Workbook (.xlsx)
**Filename**: `VSC_GapAnalysis_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Competency Framework
| Column | Description |
|--------|-------------|
| Competency ID | Unique identifier (e.g., COMP-OPS-001) |
| Competency Category | Technical / Safety / Behavioral / Systems / Management |
| Competency Name | Descriptive name |
| Competency Description | What this competency means |
| Level 1 Definition | Awareness - Knows the concept |
| Level 2 Definition | Basic - Can perform with guidance |
| Level 3 Definition | Competent - Can perform independently |
| Level 4 Definition | Proficient - Can handle complex situations and mentor others |
| Level 5 Definition | Expert - Can design, optimize, and innovate |

#### Sheet 2: Role-Competency Matrix
| Column | Description |
|--------|-------------|
| Role/Position | Job title from staffing plan |
| Department | Operations / Maintenance / HSE / etc. |
| Competency ID | Reference to competency framework |
| Competency Name | Competency name |
| Required Level | Target competency level (1-5) for this role |
| Priority | Critical / Important / Desirable |
| Certification Required | Specific certification if applicable |

#### Sheet 3: Individual Gap Analysis (per person or role-aggregate)
| Column | Description |
|--------|-------------|
| Employee Name / Role Placeholder | Individual or role group |
| Role/Position | Assigned role |
| Competency ID | Competency reference |
| Competency Name | Competency name |
| Required Level | Target level |
| Current Level | Assessed current level (0-5, 0 = no competency) |
| Gap | Required - Current (positive = needs training) |
| Gap Classification | None / Minor (1) / Moderate (2) / Major (3+) |
| Training Method | Classroom / OJT / Simulator / Vendor / Self-directed / Mentoring |
| Estimated Training Hours | Hours to close the gap |
| Training Priority | Immediate / Pre-commissioning / First 6 months / Ongoing |

#### Sheet 4: Training Hours Summary
| Column | Description |
|--------|-------------|
| Role/Position | Job title |
| Headcount | Number of people in this role |
| Compliance Training (hrs) | Regulatory/safety training hours per person |
| Technical Training (hrs) | Technical skills training hours per person |
| Systems Training (hrs) | DCS, CMMS, other systems training hours per person |
| OJT Hours | On-the-job training hours per person |
| Vendor Training (hrs) | OEM training hours per person |
| Total Training (hrs/person) | Total hours per person |
| Total Training (hrs all) | Total hours x headcount |
| Training Duration (weeks) | Estimated calendar weeks to complete |

#### Sheet 5: Training Calendar
| Column | Description |
|--------|-------------|
| Training Course ID | Unique course identifier |
| Course Name | Descriptive name |
| Target Audience | Roles that attend |
| Attendees per Session | Class size |
| Number of Sessions | Sessions needed for all attendees |
| Duration (days) | Course length |
| Delivery Method | Classroom / OJT / Simulator / Vendor / Online |
| Trainer/Provider | Internal / External provider name |
| Planned Start Date | Scheduled start |
| Planned End Date | Scheduled completion |
| Location | Training venue |
| Estimated Cost | Cost per session |
| Pre-requisites | Courses that must be completed first |

#### Sheet 6: Training Budget
| Column | Description |
|--------|-------------|
| Cost Category | Internal trainers / External trainers / Vendor courses / Travel / Materials / Facilities / Certification fees |
| Description | Detail |
| Unit Cost | Cost per unit |
| Quantity | Number of units |
| Total Cost | Calculated total |
| Timeline | When cost is incurred |

### Document 2: Training Plan Report (.docx)
**Filename**: `VSC_PlanCapacitacion_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page**
2. **Executive Summary**
   - Training program overview
   - Total training hours and estimated duration
   - Key gap findings
   - Budget summary
   - Critical path items
3. **Introduction & Scope**
   - 3.1 Scope of the training plan
   - 3.2 Training philosophy and approach
   - 3.3 Methodology (competency-based training development)
   - 3.4 Standards and regulations applied
4. **Competency Framework**
   - 4.1 Competency model overview
   - 4.2 Competency categories and definitions
   - 4.3 Proficiency level definitions
   - 4.4 Role-competency mapping summary
5. **Gap Analysis Results**
   - 5.1 Gap analysis methodology
   - 5.2 Summary findings by department
   - 5.3 Critical gaps requiring immediate attention
   - 5.4 Gap distribution charts (by category, by severity)
   - 5.5 Aggregate training hours required
6. **Training Program Design**
   - 6.1 Training curriculum overview
   - 6.2 Phase 1: Compliance and safety training
   - 6.3 Phase 2: Fundamental technical training
   - 6.4 Phase 3: System-specific training
   - 6.5 Phase 4: Advanced and specialized training
   - 6.6 Phase 5: On-the-job training and competency verification
   - 6.7 Ongoing/continuous training program
7. **Training Delivery**
   - 7.1 Delivery methods and their application
   - 7.2 Classroom training program
   - 7.3 On-the-job training (OJT) program
   - 7.4 Simulator training program (if applicable)
   - 7.5 Vendor training program
   - 7.6 Self-directed/e-learning program
   - 7.7 Mentoring and coaching program
8. **Training Schedule**
   - 8.1 Master training calendar
   - 8.2 Alignment with workforce buildup
   - 8.3 Alignment with commissioning schedule
   - 8.4 Critical path training items
   - 8.5 Training resource requirements (trainers, rooms, equipment)
9. **Competency Assessment & Verification**
   - 9.1 Assessment methodology
   - 9.2 Written and practical examination design
   - 9.3 OJT sign-off process
   - 9.4 Competency card/passport system
   - 9.5 Re-assessment and refresher training triggers
10. **Training Resources**
    - 10.1 Internal trainers required
    - 10.2 External training providers
    - 10.3 Training facilities requirements
    - 10.4 Training materials and equipment
    - 10.5 Training management system (LMS) requirements
11. **Budget**
    - 11.1 Cost summary by category
    - 11.2 Cost by training phase
    - 11.3 Monthly cash flow projection
12. **Training KPIs**
    - 12.1 Training completion rates
    - 12.2 Competency assessment pass rates
    - 12.3 Training effectiveness metrics
    - 12.4 Training plan adherence
13. **Appendices**
    - A: Detailed competency framework
    - B: Course catalog with descriptions
    - C: Gap analysis detail (reference to .xlsx)
    - D: Training material development plan
    - E: Competency assessment templates

## Methodology & Standards

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 10015** | Quality management - guidelines for competence management and people development |
| **EN 15628** | Maintenance - qualification of maintenance personnel |
| **DS 132 (Chile)** | Mining safety - mandatory training requirements |
| **DS 594 (Chile)** | Workplace safety - health and safety training |
| **ISO 55001** | Asset management - competence requirements |

### Competency-Based Training Development (CBTD) Methodology
1. **Define Competencies**: Identify what knowledge, skills, and abilities are required for each role
2. **Assess Current State**: Evaluate existing competency levels through testing, observation, or self-assessment
3. **Analyze Gaps**: Quantify the difference between required and current competency levels
4. **Design Training**: Create learning interventions targeted at closing specific gaps
5. **Deliver Training**: Execute the training program using appropriate methods
6. **Assess Competency**: Verify that training has achieved the required competency level
7. **Maintain and Improve**: Ongoing refresher training and continuous improvement

### Training Hour Estimation Guidelines
| Gap Size | Training Method | Estimated Hours |
|----------|----------------|-----------------|
| Level 0 to 1 (Awareness) | Classroom / E-learning | 4-8 hours |
| Level 0 to 2 (Basic) | Classroom + OJT | 16-40 hours |
| Level 0 to 3 (Competent) | Classroom + OJT + Practice | 80-200 hours |
| Level 0 to 4 (Proficient) | Above + mentoring + experience | 200-500 hours |
| Level 1 to 3 (two levels) | Classroom + OJT | 40-120 hours |
| Level 2 to 3 (one level) | OJT + Practice | 20-60 hours |
| Level 3 to 4 (one level) | Mentoring + Advanced OJT | 60-200 hours |

## Step-by-Step Execution

### Phase 1: Competency Framework (Steps 1-3)
1. **Define Competency Model**: Create the competency framework:
   - Identify competency categories (Technical, Safety, Behavioral, Systems, Management)
   - Define specific competencies within each category
   - Write clear proficiency level definitions (1-5) for each competency
   - Create the competency dictionary
2. **Map Competencies to Roles**: For each role in the staffing plan:
   - Identify all required competencies
   - Set the target proficiency level for each competency
   - Classify priority (Critical / Important / Desirable)
   - Identify mandatory certifications
3. **Validate Framework**: Cross-check competency requirements against:
   - Operations manual tasks (operators must be competent in all SOPs they execute)
   - Maintenance manual procedures (technicians must be competent in all procedures they perform)
   - Regulatory requirements (mandatory certifications and training)
   - Equipment vendor requirements (OEM-certified training)

### Phase 2: Gap Analysis (Steps 4-6)
4. **Assess Current Competency Levels**:
   - If workforce assessment data is provided: use assessed levels
   - If new hires (greenfield): assume baseline levels based on:
     - Education level provides Level 1 in related technical areas
     - Relevant experience provides Level 2-3 in specific areas
     - Certifications provide Level 3 in certified areas
     - No experience = Level 0
5. **Calculate Gaps**: For each person-competency pair:
   - Gap = Required Level - Current Level
   - Classify: None (0), Minor (1), Moderate (2), Major (3+)
   - Flag critical gaps (safety-related, commissioning-deadline-driven)
6. **Summarize and Prioritize**:
   - Aggregate total training hours by role, department, and competency category
   - Identify top 10 critical gaps across the organization
   - Calculate total training program scope (hours, cost, duration)
   - Identify gaps that cannot be closed by training alone (require recruitment of experienced staff)

### Phase 3: Training Program Design (Steps 7-10)
7. **Design Training Curriculum**: Structure the program into phases:
   - **Phase 1 (Month 1-2)**: HSE induction, regulatory compliance, site orientation
   - **Phase 2 (Month 2-4)**: Process fundamentals, equipment fundamentals, basic systems
   - **Phase 3 (Month 4-7)**: System-specific training (operations/maintenance per system)
   - **Phase 4 (Month 7-9)**: Advanced procedures, abnormal operations, emergency response
   - **Phase 5 (Month 9-12+)**: OJT, supervised practice, competency verification
8. **Design Individual Courses**: For each training need:
   - Course title, code, and description
   - Learning objectives (SMART: Specific, Measurable, Achievable, Relevant, Time-bound)
   - Target audience (roles)
   - Duration and delivery method
   - Pre-requisites
   - Assessment method
   - Trainer/provider
   - Materials required
9. **Select Delivery Methods**: Match training to the most effective delivery:
   - Safety/compliance: Classroom + practical exercises
   - Process fundamentals: Classroom + videos + site tours
   - Operating procedures: Classroom + simulator (if available) + OJT
   - Maintenance procedures: Workshop + OJT under supervision
   - Systems (DCS, CMMS): Hands-on lab training
   - Management/behavioral: Workshop + coaching
10. **Build Training Schedule**: Create the master training calendar:
    - Sequence courses respecting pre-requisites
    - Align with workforce buildup (train people as they arrive)
    - Align with commissioning milestones (competent before startup)
    - Balance trainer workload and facility availability
    - Account for concurrent training of multiple groups

### Phase 4: Document Generation & Quality (Steps 11-13)
11. **Generate Gap Analysis Workbook (.xlsx)**: Compile all analysis.
12. **Generate Training Plan Report (.docx)**: Write the narrative document.
13. **Quality Review**: Verify completeness, feasibility, and alignment.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Gap Analysis Rigor | 25% | Every role has complete competency assessment; gaps are quantified |
| Training-Gap Alignment | 20% | Every significant gap has a targeted training intervention |
| Schedule Feasibility | 20% | Training schedule is realistic and aligned with buildup/commissioning |
| Regulatory Compliance | 15% | All mandatory training and certifications are included |
| Completeness | 10% | All roles, all competencies, all training phases covered |
| Budget Realism | 10% | Cost estimates reflect market rates and realistic delivery |

### Automated Quality Checks
- [ ] Every role in the staffing plan has competency requirements defined
- [ ] Every competency has proficiency level definitions (1-5)
- [ ] Gap analysis covers all role-competency pairs
- [ ] Total training hours per person are feasible within the schedule
- [ ] Regulatory training is scheduled before on-site work begins
- [ ] Pre-requisite sequences are respected in the training calendar
- [ ] Training completion dates are before commissioning milestones
- [ ] Every course has defined learning objectives and assessment method
- [ ] Budget includes all cost categories (trainers, materials, travel, facilities, certification fees)
- [ ] OJT program includes sign-off criteria
- [ ] No placeholder text remaining
- [ ] Training hours align with gap severity (major gaps get more hours)

## MCP Integrations

- **mcp-sharepoint**: Store and retrieve training plan documents, competency frameworks, course materials, and gap analysis workbooks
- **project-database**: Track training schedule, course completion status, competency assessment results, and gap closure progress per trainee
- **mcp-outlook**: Send training session notifications, course enrollment confirmations, and assessment reminders to trainees and trainers

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-staffing-plan` | Role profiles, competency requirements, buildup schedule | Critical |
| `create-operations-manual` | Operating procedures requiring operator training | Critical |
| `create-maintenance-manual` | Maintenance procedures requiring technician training | Critical |
| `create-maintenance-strategy` | Skill requirements from RCM analysis | High |
| `hse-agent` | Regulatory training requirements, HSE training content | High |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-kpi-dashboard` | Training KPI definitions | Automatic |
| `create-contract-scope` | External training provider scope of work | On request |
| `create-change-mgmt-plan` | Training component of change management | On request |
| `simulator-configuration-agent` | Training scenarios for OTS | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | Safety training content validation | During Phase 1 design |
| `create-staffing-plan` | Competency profile alignment | During gap analysis |
| `vendor-management-agent` | Vendor training availability and pricing | During schedule design |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_TrainingPlan_Template_v2.0.docx` - Training plan report template
- `VSC_GapAnalysis_Template_v2.0.xlsx` - Gap analysis workbook template
- `VSC_CompetencyFramework_Template_v1.5.xlsx` - Competency model template
- `VSC_CourseDesign_Template_v1.0.docx` - Individual course design template

### Reference Standards
- ISO 10015:2019 - Competence management and people development
- EN 15628:2014 - Qualification of maintenance personnel
- ADDIE Model (Analysis, Design, Development, Implementation, Evaluation)
- Bloom's Taxonomy for learning objective classification
- Kirkpatrick's Four Levels of Training Evaluation

## Examples

### Example: Competency Gap Analysis Entry

**Role**: Operator de Planta - Concentradora
**Person**: New hire, Tecnico Nivel Superior en Metalurgia Extractiva, 3 years experience in copper flotation

| Competency | Required Level | Current Level | Gap | Training Method | Hours |
|-----------|---------------|--------------|-----|----------------|-------|
| HSE Induction & Site Safety | 3 | 0 | 3 | Classroom + Field | 40 |
| Process Fundamentals - Flotation | 3 | 2 | 1 | Classroom + OJT | 24 |
| Process Fundamentals - Grinding | 3 | 1 | 2 | Classroom + OJT | 60 |
| DCS Operation (ABB 800xA) | 3 | 1 | 2 | Lab + Simulator | 40 |
| Normal Operations - Flotation | 4 | 2 | 2 | OJT + Mentor | 80 |
| Normal Operations - Grinding | 3 | 0 | 3 | Classroom + OJT | 120 |
| Startup Procedures | 3 | 1 | 2 | Simulator + OJT | 40 |
| Shutdown Procedures | 3 | 1 | 2 | Simulator + OJT | 40 |
| Emergency Response | 3 | 0 | 3 | Classroom + Drill | 24 |
| Sampling & Quality | 3 | 2 | 1 | OJT | 16 |
| First Aid & CPR | 2 | 0 | 2 | Certified course | 16 |
| Fire Fighting | 2 | 0 | 2 | Certified course | 8 |
| **TOTAL** | | | | | **508** |

**Estimated Training Duration**: 16 weeks (based on 32 training hours/week, mixed classroom and OJT)
