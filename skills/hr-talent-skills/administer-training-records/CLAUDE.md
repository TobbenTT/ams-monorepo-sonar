---
name: administer-training-records
description: >
  Training record administration and competency gap tracking for industrial
  Operational Readiness projects. Manages training enrollment, completion tracking,
  certification expiry monitoring, and competency gap identification across mining,
  oil & gas, chemicals, and energy workforces in Latin America. Ensures all
  personnel meet mandatory competency requirements before commissioning and
  ramp-up phases.
category: C - Tracking
priority: Medium
version: 1.0.0
agent: hr-talent
---

# Administer Training Records

## Purpose

This skill provides the HR & Talent agent with a systematic training records
management capability that serves as the single source of truth for all workforce
training and competency data during OR projects. In industrial operations,
training records are not merely administrative artifacts -- they are regulatory
evidence. Labor inspectorates (Direccion del Trabajo in Chile, SUNAFIL in Peru,
MinTrabajo in Colombia) and safety regulators (SERNAGEOMIN, OSINERGMIN, ANM)
require documented proof that every worker has received and passed the training
required for their assigned tasks.

During OR projects, training volumes are massive: hundreds of personnel must
complete dozens of training modules -- from general HSE induction to equipment-
specific operating procedures -- within compressed timelines. Without rigorous
record keeping, projects face regulatory non-compliance, delayed commissioning
approvals, and elevated operational risk from personnel working beyond their
demonstrated competency.

This skill integrates with the Operations agent's training plan, the HSE agent's
safety training programs, and the track-employee-onboarding skill to create a
comprehensive training record system that supports both operational decision-
making and regulatory audit readiness.

## Intent & Specification

The skill SHALL:

1. **Maintain a master training records database** for all project personnel,
   linking each employee to their required training modules (from Operations and
   HSE agents), completion status, assessment results, certification dates, and
   expiry dates.
2. **Track training enrollment and attendance** for all scheduled training events,
   generating attendance registers, tracking no-shows and rescheduling, and
   calculating training completion rates by department and module.
3. **Monitor certification and qualification expiry dates** with configurable
   advance warning periods (90-day, 60-day, 30-day, and 14-day alerts) to ensure
   timely recertification before credentials lapse.
4. **Identify and report competency gaps** by comparing current training records
   against the competency matrix defined by the Operations agent, highlighting
   personnel who lack required qualifications for their assigned roles or
   upcoming commissioning activities.
5. **Generate training compliance reports** showing completion rates against
   regulatory and project requirements, suitable for internal management review,
   client assurance, and regulatory audit.
6. **Archive training evidence** including attendance records, assessment scores,
   certificates, and sign-off documents in an organized, auditable structure.
7. **Support gate review readiness** by producing training completion summaries
   that demonstrate workforce competency readiness for G2 (commissioning start)
   and G3 (operations start) gate reviews.

## Trigger / Invocation

### English Triggers
- "Track training records for the project workforce"
- "What training modules are overdue for [department]?"
- "Generate a training completion report"
- "Which certifications are expiring in the next 90 days?"
- "Identify competency gaps for commissioning readiness"
- "Enroll [team/department] in [training module]"
- "Update training record for [employee name]"
- "Produce training evidence package for regulatory audit"

### Spanish Triggers (Latin American)
- "Rastrear registros de capacitacion de la fuerza laboral del proyecto"
- "Cuales modulos de capacitacion estan atrasados para [departamento]?"
- "Generar un reporte de completitud de capacitaciones"
- "Cuales certificaciones vencen en los proximos 90 dias?"
- "Identificar brechas de competencia para la puesta en marcha"
- "Inscribir a [equipo/departamento] en [modulo de capacitacion]"
- "Actualizar registro de capacitacion de [nombre empleado]"
- "Producir paquete de evidencia de capacitacion para auditoria regulatoria"

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Training Plan | Operations agent | MD/XLSX | Required training modules per role with target completion dates |
| Competency Framework | Operations agent | MD/XLSX | Competency matrix mapping roles to required qualifications |
| HSE Training Program | HSE agent | MD | Mandatory safety training modules, content, and assessment criteria |
| Workforce Register | manage-recruitment-pipeline | MD/XLSX | All active personnel with roles, departments, and hire dates |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Existing Training Records | Client HR / LMS | CSV/XLSX | Historical training data for transferred or existing employees |
| Training Provider Catalog | Client / External | MD/PDF | Available training providers, courses, schedules, and costs |
| Regulatory Training Requirements | Contracts & Compliance agent | MD | Jurisdiction-specific mandatory training by role type |
| Onboarding Completion Data | track-employee-onboarding | MD | Training completions during onboarding phase |

### Context Enrichment
- The skill reads `methodology/or-concepts/` for OR phase training requirements
- HSE training standards are loaded from HSE agent state and skills
- Competency framework references are loaded from Operations agent
- Commissioning sequence from Execution agent defines training urgency priorities
- Regulatory training mandates from Contracts & Compliance agent inform compliance tracking

## Output Specification

The skill produces the following deliverables:

1. **Master Training Records Register** (`output/hr/training-records-register.md`)
   - Employee-by-module matrix showing completion status
   - Status values: Not Required, Enrolled, In Progress, Completed, Failed, Expired
   - Completion dates, assessment scores, certificate numbers, expiry dates
   - Filterable by department, role type, module category, and status

2. **Training Completion Dashboard** (`output/hr/training-completion-dashboard.md`)
   - Overall completion rate (completed / required modules)
   - Completion rate by department, role type, and training category
   - Overdue modules count and aging (days overdue)
   - Trend line showing completion rate progression over time
   - Traffic-light indicators per department

3. **Competency Gap Report** (`output/hr/competency-gap-report.md`)
   - Personnel lacking required competencies for current role
   - Personnel lacking competencies for upcoming commissioning activities
   - Gap severity classification (Critical, High, Medium, Low)
   - Remediation plan: training enrollment, timeline, and accountable owner
   - Impact assessment on commissioning schedule

4. **Certification Expiry Tracker** (`output/hr/certification-expiry-tracker.md`)
   - All certifications with expiry dates sorted by urgency
   - Alert status: Green (>90 days), Yellow (60-90 days), Orange (30-60 days),
     Red (<30 days), Expired
   - Recertification enrollment status
   - Impact assessment for expired/expiring certifications on work authorization

5. **Training Compliance Report** (`output/hr/training-compliance-report.md`)
   - Regulatory training requirements vs. actual completion
   - Non-compliance items with specific regulatory reference
   - Evidence package index for audit readiness
   - Corrective actions for non-compliance items

6. **Gate Readiness Training Summary** (`output/hr/gate-training-readiness.md`)
   - Training completion percentage for personnel assigned to gate activities
   - Outstanding training items blocking gate advancement
   - Projected completion dates for outstanding items
   - Risk assessment for gate review

## Procedure

### Step 1: Establish Training Requirements Baseline
- Ingest the Operations agent's training plan and competency framework
- Ingest the HSE agent's safety training program and mandatory modules
- Request regulatory training requirements from Contracts & Compliance agent:
  - Chile: DS 132 (mining safety training), DS 40 (hazardous substances),
    NCh-ISO 45001 requirements
  - Peru: DS 024-2016-EM (mining safety training), Ley 29783 (SST training)
  - Colombia: Resolucion 0312 de 2019 (SG-SST training), Decreto 1072 de 2015
- Build the master training requirements matrix:
  - Rows: every role type in the organizational design
  - Columns: every training module (HSE, technical, regulatory, soft skills)
  - Cell values: Required (mandatory), Recommended (beneficial), N/A
- Assign target completion dates per module based on:
  - Regulatory deadlines (before work starts)
  - Commissioning sequence (before sub-system handover)
  - Onboarding milestones (within 30 days of hire)
- Validate requirements matrix with Operations, HSE, and client training lead

### Step 2: Initialize Individual Training Records
- For each active employee in workforce register, create training record:
  - Employee ID, name, role, department, hire date, site assignment
  - Applicable training modules (based on role-requirements matrix)
  - Target completion dates per module
  - Current status: Not Started (for new hires), or import existing completion
    data from client LMS/HRIS for transferred employees
- Import existing certifications and qualifications:
  - Verify authenticity and validity of imported certificates
  - Map external certifications to project training requirements
  - Record expiry dates for all time-limited certifications
- Identify training gaps for employees with prior completions:
  - Modules required but not yet completed or enrolled
  - Certifications required but not held or expired
- Generate initial competency gap report for project leadership

### Step 3: Track Training Execution
- For each scheduled training event:
  - Record enrollment list and confirm participant attendance
  - Capture attendance register (sign-in/sign-out with times)
  - Record assessment results (pass/fail, score if applicable)
  - Issue and file completion certificates
  - Update master training records register
- For failed assessments:
  - Schedule reassessment within policy timeframe
  - Notify supervisor and HR lead
  - If second failure: escalate to Operations agent for role reassignment consideration
- Track training logistics:
  - Module scheduling conflicts with operational commitments
  - Trainer availability and facility booking
  - Training cost tracking for budget management
- Update onboarding records via track-employee-onboarding for new hire training

### Step 4: Monitor Certifications and Detect Gaps
- Run certification expiry scan weekly:
  - Flag certifications expiring within 90, 60, 30, and 14 days
  - Auto-generate recertification enrollment recommendations
  - Notify employee, supervisor, and HR lead per alert thresholds
  - For expired certifications: immediately flag work authorization impact
- Run competency gap analysis monthly (or on-demand for gate reviews):
  - Compare current training completion against requirements matrix
  - Identify personnel not meeting minimum competency for assigned role
  - Classify gaps by severity:
    - **Critical**: safety-related competency gap, personnel cannot work unsupervised
    - **High**: regulatory compliance gap, potential audit finding
    - **Medium**: operational competency gap, reduced effectiveness
    - **Low**: developmental gap, no immediate operational impact
  - Generate remediation plan with enrollment dates and projected completion
- Cross-reference competency readiness with commissioning schedule:
  - For each upcoming commissioning activity, verify assigned personnel have
    completed all required training
  - Flag activities at risk due to training gaps
  - Recommend mitigation: accelerated training, alternative personnel, defer activity

### Step 5: Report, Archive, and Support Audits
- Generate weekly training completion dashboard for Orchestrator
- Produce monthly training compliance report with regulatory alignment status
- For gate reviews (G2, G3), produce gate readiness training summary:
  - Percentage of gate-related workforce fully trained
  - Outstanding items with projected completion dates
  - Risk assessment and mitigation for any gaps
- Archive training evidence in structured format:
  - `output/hr/training-evidence/[employee-id]/[module]/`
  - Contents: attendance record, assessment result, certificate, sign-off
  - Index file linking evidence to regulatory requirement
- Maintain audit readiness package:
  - Summary of all regulatory training requirements and compliance status
  - Evidence index with document references
  - Non-compliance corrective action log
- Feed training effectiveness data to analyze-workforce-metrics:
  - Training hours per employee
  - First-pass assessment rates
  - Training cost per employee
- At project completion, produce training program lessons learned:
  - Module effectiveness ratings
  - Schedule adherence analysis
  - Recommendations for future OR projects

## Quality Criteria

| Dimension | Weight | Target | Validation Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | Training requirements correctly mapped from Operations and HSE; all regulatory mandates captured; assessment results accurately recorded | Cross-reference with source training plans and regulatory requirements |
| Completeness | 25% | 100% of workforce has training records; all required modules tracked; no gaps in certification expiry monitoring | Coverage audit against workforce register and requirements matrix |
| Consistency | 15% | Uniform record structure across all employees; consistent status definitions; standard certification validation process | Template compliance review |
| Format | 10% | Clean tabular format; VSC branding; exportable to client LMS; suitable for regulatory audit presentation | Template compliance and export test |
| Actionability | 10% | Gap reports include specific remediation actions with owners and dates; expiry alerts actionable by supervisors | Stakeholder usability feedback |
| Traceability | 10% | Every training requirement traces to regulatory article, client policy, or Operations competency framework; every completion links to evidence document | Reference and evidence audit |

**Minimum passing score: 91%**

## Inter-Agent Dependencies

### Upstream (this skill receives from):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Operations | Training Plan | REQUIRED -- defines training modules and target dates |
| Operations | Competency Framework | REQUIRED -- defines qualification requirements per role |
| HSE | Safety Training Program | REQUIRED -- defines mandatory HSE training modules |
| HR & Talent (self) | Workforce Register from manage-recruitment-pipeline | REQUIRED -- personnel to track |
| HR & Talent (self) | Onboarding Completion Data from track-employee-onboarding | REQUIRED -- training during onboarding |
| Contracts & Compliance | Regulatory Training Requirements | RECOMMENDED -- jurisdiction-specific mandates |
| Execution | Commissioning Schedule | RECOMMENDED -- training urgency prioritization |

### Downstream (this skill provides to):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Orchestrator | Training Completion Dashboard | REQUIRED -- for OR progress reporting |
| Orchestrator | Gate Readiness Training Summary | REQUIRED -- for G2/G3 gate reviews |
| Operations | Competency Gap Report | REQUIRED -- for workforce planning and role adjustments |
| HSE | HSE Training Completion Records | REQUIRED -- for safety compliance assurance |
| HR & Talent (self) | Training Metrics to analyze-workforce-metrics | RECOMMENDED -- analytics input |
| HR & Talent (self) | Certification Data to track-employee-certifications | REQUIRED -- shared certification tracking |

## References

- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)
- VSC Skills Methodology v2 (`skills/VSC_Skills_Methodology_v2.md`)
- ISO 45001:2018 -- Clause 7.2 Competence and Clause 7.3 Awareness
- ISO 55001:2014 -- Clause 7.2 Competence (asset management workforce)
- Decreto Supremo 132 (Chile) -- Titulo X: De la Capacitacion
- D.S. 024-2016-EM (Peru) -- Capitulo V: Capacitacion
- Resolucion 0312 de 2019 (Colombia) -- Estandares Minimos del SG-SST
- IOGP Report 423 -- Workforce Development in Major Capital Projects
- ANSI/ASIS SPC.1-2009 -- Organizational Resilience (competence requirements)

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation of administer-training-records skill |
