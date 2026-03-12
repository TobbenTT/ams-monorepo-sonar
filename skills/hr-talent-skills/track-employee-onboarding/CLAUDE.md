---
name: track-employee-onboarding
description: >
  Structured employee onboarding tracking for industrial Operational Readiness
  projects. Manages pre-arrival logistics, day-1 induction, week-1 integration,
  and month-1 milestone completion. Coordinates HSE induction with the HSE agent
  and technical training enrollment with the Operations agent to ensure personnel
  are competent and authorized before commissioning and ramp-up phases.
category: C - Tracking
priority: High
version: 1.0.0
agent: hr-talent
---

# Track Employee Onboarding

## Purpose

This skill provides the HR & Talent agent with a comprehensive, milestone-driven
onboarding tracking system tailored to industrial OR projects. In mining,
chemicals, and energy operations, onboarding is not merely administrative -- it is
a safety-critical process. Personnel cannot enter operational areas, operate
equipment, or execute procedures without completing mandatory HSE inductions,
site-specific training, and competency verifications.

Delayed or incomplete onboarding directly threatens project timelines: if operators
are not fully inducted before commissioning milestones, the entire ramp-up
trajectory is at risk. This skill ensures every new hire progresses through a
defined onboarding pathway with clear milestones, accountable owners, and
real-time visibility for the Orchestrator and project leadership.

The skill integrates with the recruitment pipeline (upstream handoff from
manage-recruitment-pipeline), HSE induction programs (from the HSE agent), and
technical training plans (from the Operations agent) to create a unified view
of workforce readiness.

## Intent & Specification

The skill SHALL:

1. **Receive onboarding triggers** from the manage-recruitment-pipeline skill upon
   offer acceptance, automatically creating an onboarding record for each new hire
   with pre-populated milestones based on role type and OR phase.
2. **Manage pre-arrival logistics** including IT account provisioning, PPE ordering,
   site access badge requests, accommodation arrangements for FIFO/DIDO workers,
   travel coordination, and document collection (ID, certifications, medical).
3. **Track day-1 induction milestones** including site orientation, HSE general
   induction (coordinated with HSE agent), emergency response briefing, team
   introduction, workstation/locker assignment, and initial system access.
4. **Monitor week-1 integration milestones** including role-specific HSE induction,
   area familiarization walks, buddy/mentor assignment confirmation, first
   supervised task completion, and enrollment in required technical training.
5. **Validate month-1 completion milestones** including all mandatory training
   modules completed, competency assessments passed, probationary review
   conducted, and full authorization to work independently granted.
6. **Generate onboarding dashboards** showing completion rates by milestone phase,
   overdue items with accountable owners, and workforce readiness percentages
   aligned to commissioning sub-system handover dates.
7. **Escalate blockers** such as missing certifications, failed medical clearances,
   or training delays to the Orchestrator for resolution.

## Trigger / Invocation

### English Triggers
- "Track onboarding for new hires"
- "Create onboarding checklist for [employee name / role]"
- "What is the onboarding status for the latest cohort?"
- "Which employees have overdue onboarding milestones?"
- "Generate onboarding completion report"
- "Coordinate HSE induction schedule for new arrivals"
- "Verify month-1 milestones for [department]"

### Spanish Triggers (Latin American)
- "Rastrear la induccion de nuevos empleados"
- "Crear checklist de onboarding para [nombre / cargo]"
- "Cual es el estado de induccion del ultimo grupo?"
- "Cuales empleados tienen hitos de induccion atrasados?"
- "Generar reporte de completitud de onboarding"
- "Coordinar calendario de induccion HSE para nuevos ingresos"
- "Verificar hitos del primer mes para [departamento]"

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Offer Acceptance Notification | manage-recruitment-pipeline | MD/Event | Trigger containing employee details, role, start date, and reporting line |
| HSE Induction Program | HSE agent | MD | Mandatory safety induction modules, durations, and prerequisites per role risk level |
| Technical Training Plan | Operations agent | MD/XLSX | Role-specific training modules, competency targets, and enrollment windows |
| Organizational Design | Operations agent | MD | Reporting structure, buddy/mentor assignments, shift allocation |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Client Onboarding Policy | Client HR | PDF/MD | Client-specific onboarding requirements beyond VSC standard |
| IT Provisioning SLA | Client IT | MD | Lead times for account creation, system access, hardware |
| Accommodation Availability | Client Facilities | XLSX | Camp/housing availability for FIFO workers by date |
| Medical Clearance Requirements | HSE agent | MD | Pre-employment and ongoing medical fitness standards |

### Context Enrichment
- The skill reads `methodology/or-concepts/` for OR phase definitions and gate criteria
- HSE induction content is loaded from HSE agent skills and state
- Training requirements are cross-referenced with Operations agent competency frameworks
- Commissioning sequence milestones from Execution agent inform readiness deadlines

## Output Specification

The skill produces the following deliverables:

1. **Onboarding Tracker** (`output/hr/onboarding-tracker.md`)
   - Master register of all active onboarding records
   - Status per employee: Pre-Arrival, Day-1, Week-1, Month-1, Complete
   - Milestone completion percentages per phase
   - Overdue items highlighted with days overdue and accountable owner

2. **Individual Onboarding Checklists** (`output/hr/onboarding/OB-NNN-[name].md`)
   - Employee-specific checklist with all milestones
   - Completion dates and sign-off records
   - Links to completed training certificates and assessment results

3. **Onboarding Dashboard Summary** (`output/hr/onboarding-dashboard.md`)
   - Aggregate statistics: total onboarding, completion rate, avg days to full authorization
   - Breakdown by department, role type, and OR phase
   - Trend charts showing onboarding velocity

4. **Workforce Readiness Report** (`output/hr/workforce-readiness.md`)
   - Percentage of required workforce fully onboarded per commissioning sub-system
   - Gap analysis: positions filled but not yet authorized vs. commissioning dates
   - Critical path workforce items for gate review

5. **Escalation Log** (`output/hr/onboarding-escalations.md`)
   - Blockers requiring Orchestrator or client intervention
   - Resolution status and impact assessment

## Procedure

### Step 1: Receive and Initialize Onboarding Record
- Upon offer acceptance from manage-recruitment-pipeline, create onboarding record
- Populate employee details: name, role, department, start date, reporting manager
- Assign onboarding template based on role type:
  - **Operator**: Full HSE induction + technical training + equipment authorization
  - **Maintenance Technician**: Full HSE + specialized craft training + SAP PM access
  - **Supervisor**: HSE induction + leadership orientation + system admin access
  - **Professional/Admin**: Basic HSE + functional training + system access
- Calculate milestone target dates:
  - Pre-arrival: complete by start date minus 5 business days
  - Day-1: complete by end of first day
  - Week-1: complete by end of first 7 calendar days
  - Month-1: complete by end of first 30 calendar days
- Notify all milestone owners (HR, HSE, IT, hiring manager, buddy)

### Step 2: Manage Pre-Arrival Phase
- Trigger IT account provisioning request (email, ERP, CMMS access as per role)
- Order PPE based on role risk classification from HSE agent
- Arrange site access badge and security clearance
- For FIFO/DIDO: confirm accommodation, travel booking, roster assignment
- Collect and verify documents: national ID, professional certifications, medical
  clearance, bank details, emergency contacts
- Confirm pre-employment medical if required by site policy
- Send welcome package to employee with site information, first-day logistics,
  dress code, and required documentation list
- Track completion of each pre-arrival item; flag overdue items at start date minus 3 days

### Step 3: Execute Day-1 and Week-1 Milestones
- Day-1 checklist:
  - Site arrival and reception
  - General HSE induction (coordinate with HSE agent for scheduling)
  - Emergency response briefing and muster point identification
  - Workstation / locker / equipment assignment
  - Team introduction and manager welcome meeting
  - IT system login verification
  - Distribute employee handbook and site rules
- Week-1 checklist:
  - Area-specific HSE induction (hazard familiarization walks)
  - Buddy/mentor first meeting and expectations alignment
  - Role-specific orientation sessions with supervisor
  - Enrollment in mandatory technical training modules (from Operations agent)
  - First supervised task or observation shift
  - Complete HR administrative forms (payroll, benefits enrollment)
  - Initial feedback conversation with manager

### Step 4: Validate Month-1 Completion
- Verify all mandatory training modules completed with passing scores
- Confirm competency assessments administered and passed per Operations framework
- Verify all HSE certifications current and recorded in system
- Conduct 30-day probationary review with manager and HR
- Obtain supervisor sign-off for independent work authorization
- Update personnel record with full qualification status
- Close onboarding record and transition to ongoing performance tracking
- For any incomplete items: create remediation plan with revised target dates

### Step 5: Report, Escalate, and Optimize
- Update onboarding dashboard daily during active cohort onboarding
- Generate weekly onboarding status for Orchestrator inclusion in OR reports
- Calculate workforce readiness percentage per commissioning sub-system
- Escalate blockers to Orchestrator:
  - Employees unable to complete HSE induction (medical, certification issues)
  - IT provisioning delays impacting system training
  - Accommodation unavailability for FIFO workers
- At cohort completion, conduct onboarding effectiveness review
- Document lessons learned and recommend template improvements
- Archive completed onboarding records in `output/hr/onboarding/archive/`

## Quality Criteria

| Dimension | Weight | Target | Validation Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All milestone checklists match HSE and Operations requirements; no safety-critical items omitted | Cross-reference with HSE induction program and Operations training plan |
| Completeness | 25% | 100% of new hires have onboarding records; all 4 phases tracked to completion or documented exception | Audit onboarding tracker for coverage gaps |
| Consistency | 15% | Onboarding templates standardized across role types; consistent milestone definitions | Template compliance review |
| Format | 10% | Clean tabular format, VSC branding, exportable to client HRIS | Visual inspection and export test |
| Actionability | 10% | Milestone owners can identify and act on their items without ambiguity | Owner feedback survey |
| Traceability | 10% | Each milestone traces to source requirement (HSE induction, training plan, client policy) | Reference audit per checklist item |

**Minimum passing score: 91%**

## Inter-Agent Dependencies

### Upstream (this skill receives from):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| HR & Talent (self) | Offer Acceptance from manage-recruitment-pipeline | REQUIRED -- triggers onboarding |
| HSE | HSE Induction Program and Schedule | REQUIRED -- defines safety training milestones |
| Operations | Technical Training Plan | REQUIRED -- defines competency milestones |
| Operations | Organizational Design | REQUIRED -- reporting lines, buddy assignments |
| Operations | Competency Framework | REQUIRED -- assessment criteria for month-1 validation |
| Execution | Commissioning Schedule | RECOMMENDED -- readiness deadlines per sub-system |
| Contracts & Compliance | Labor Contract Terms | RECOMMENDED -- probation period, notice requirements |

### Downstream (this skill provides to):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Orchestrator | Workforce Readiness Report | REQUIRED -- for gate review and OR progress |
| Orchestrator | Onboarding Escalations | REQUIRED -- for blocker resolution |
| Operations | Onboarding Completion Confirmation | REQUIRED -- training enrollment and authorization status |
| HSE | HSE Induction Completion Records | REQUIRED -- for compliance tracking |
| HR & Talent (self) | Completed Onboarding Records | REQUIRED -- for administer-training-records continuity |

## References

- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)
- VSC Skills Methodology v2 (`skills/VSC_Skills_Methodology_v2.md`)
- ISO 45001:2018 -- Occupational Health and Safety (Clause 7.2 Competence)
- Decreto Supremo 132 (Chile) -- Reglamento de Seguridad Minera
- IOGP Report 459 -- Life-Saving Rules Implementation Guide
- CII RT-244 -- Construction Workforce Development Best Practices

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation of track-employee-onboarding skill |
