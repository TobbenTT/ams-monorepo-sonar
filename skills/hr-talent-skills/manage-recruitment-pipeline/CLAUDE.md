---
name: manage-recruitment-pipeline
description: >
  End-to-end recruitment pipeline management for industrial Operational Readiness
  projects. Covers requisition creation, sourcing channel optimization, candidate
  screening, interview coordination, offer management, and time-to-fill analytics
  across mining, oil & gas, chemicals, and energy sectors in Latin America.
category: C - Tracking
priority: High
version: 1.0.0
agent: hr-talent
---

# Manage Recruitment Pipeline

## Purpose

This skill provides the HR & Talent agent with a structured, repeatable process
for managing the full recruitment lifecycle during Operational Readiness (OR)
projects. Industrial greenfield and brownfield projects require rapid mobilization
of specialized personnel -- operators, maintenance technicians, HSE professionals,
and supervisory staff -- often in remote locations with limited talent pools.

The skill ensures that workforce acquisition aligns with the staffing plan produced
by the Operations agent, respects project milestone timelines (especially G2/G3
gate requirements), and maintains compliance with local labor regulations across
Chile, Peru, and Colombia.

Effective pipeline management directly impacts OR success: late hires cascade into
compressed training windows, incomplete competency development, and elevated
operational risk during ramp-up.

## Intent & Specification

The skill SHALL:

1. **Create and manage requisitions** derived from the approved staffing plan,
   linking each position to an OR phase (mobilization, commissioning, ramp-up,
   steady-state) and a target onboarding date.
2. **Define sourcing strategies** per role type, including internal transfers,
   industry referrals, specialized headhunters for critical roles, job boards
   (Laborum, Trabajando, LinkedIn), university programs for graduate positions,
   and community hiring commitments for social license compliance.
3. **Implement screening criteria** aligned with competency frameworks from the
   Operations agent, including technical qualifications, certifications (e.g.,
   Class A/B electrician, rigger, SAP PM user), language requirements, and
   fitness-for-duty standards.
4. **Coordinate interview processes** with hiring managers across functional areas,
   providing structured interview guides, technical assessment templates, and
   psychometric evaluation protocols where required by client policy.
5. **Manage offer workflows** including compensation benchmarking against local
   market data, relocation packages for FIFO/DIDO arrangements, and contractual
   terms aligned with the Contracts & Compliance agent's labor framework.
6. **Track time-to-fill metrics** per role category, flagging positions at risk of
   missing onboarding windows and triggering escalation to the Orchestrator when
   critical-path roles exceed acceptable thresholds.
7. **Produce pipeline status reports** in formats consumable by the Orchestrator
   for inclusion in weekly OR progress reporting and gate review packages.

## Trigger / Invocation

### English Triggers
- "Manage the recruitment pipeline for this project"
- "Create requisitions from the staffing plan"
- "What is the current status of open positions?"
- "Track time-to-fill for critical roles"
- "Generate a recruitment pipeline report"
- "Set up sourcing channels for [role type]"
- "Escalate unfilled critical positions"

### Spanish Triggers (Latin American)
- "Gestionar el pipeline de reclutamiento para este proyecto"
- "Crear requisiciones a partir del plan de dotacion"
- "Cual es el estado actual de las posiciones abiertas?"
- "Rastrear el tiempo de cobertura para roles criticos"
- "Generar un reporte del pipeline de reclutamiento"
- "Configurar canales de sourcing para [tipo de cargo]"
- "Escalar posiciones criticas sin cubrir"

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Staffing Plan | Operations agent | MD/XLSX | Approved staffing plan with positions, quantities, start dates, and competency requirements |
| Project Master Schedule | Orchestrator | MD/CSV | Key milestones, gate dates, and commissioning sequence driving hire-by dates |
| Organizational Design | Operations agent | MD | Reporting structure, shift patterns, and role hierarchy |
| Budget Authorization | Execution agent | MD/XLSX | Approved headcount budget with cost-per-hire allowances |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Market Salary Benchmarks | Client / External | XLSX | Compensation data for target geography and role types |
| Community Hiring Commitments | Contracts agent | MD | Social license or regulatory requirements for local hiring percentages |
| Existing Employee Database | Client HRIS | CSV/XLSX | Current workforce for internal transfer identification |
| Psychometric Assessment Framework | Client HR | PDF | Preferred assessment tools and pass criteria |

### Context Enrichment
- The skill reads `methodology/or-concepts/` for OR phase definitions
- Competency framework references are loaded from Operations agent state
- Regulatory hiring requirements are cross-referenced with Contracts & Compliance agent
- HSE certification requirements are validated against HSE agent mandates

## Output Specification

The skill produces the following deliverables:

1. **Recruitment Pipeline Tracker** (`output/hr/recruitment-pipeline-tracker.md`)
   - Requisition register with status per position (Draft, Open, Screening,
     Interview, Offer, Accepted, Onboarding, Filled, Cancelled)
   - Pipeline funnel metrics (applicants per requisition, conversion rates)
   - Time-to-fill actuals vs. targets

2. **Sourcing Strategy Document** (`output/hr/sourcing-strategy.md`)
   - Channel mix per role category
   - Cost-per-channel estimates
   - Diversity and local hiring targets

3. **Requisition Packages** (`output/hr/requisitions/REQ-NNN-[role].md`)
   - Job description, competency requirements, compensation range
   - Screening criteria, interview panel, assessment requirements
   - Target dates aligned to project schedule

4. **Pipeline Risk Register** (`output/hr/recruitment-risks.md`)
   - Positions at risk of missing onboarding windows
   - Mitigation actions (alternative sourcing, adjusted requirements, interim staffing)
   - Escalation status for Orchestrator visibility

5. **Weekly Pipeline Summary** (`output/hr/weekly-pipeline-summary.md`)
   - Dashboard-style summary for inclusion in OR progress reports
   - KPIs: open positions, offers pending, time-to-fill trend, fill rate

## Procedure

### Step 1: Initialize Pipeline from Staffing Plan
- Ingest the approved staffing plan from the Operations agent
- Create one requisition record per unique position, linking to OR phase and
  target onboarding date
- Calculate hire-by dates by subtracting standard lead times:
  - Senior/specialist roles: 90 days
  - Technical/trades roles: 60 days
  - Operational/entry-level roles: 45 days
- Flag any positions where hire-by date has already passed or falls within 14 days
- Validate that all positions have associated competency profiles

### Step 2: Define Sourcing Strategy
- For each role category, select sourcing channels based on:
  - Role seniority and specialization level
  - Geographic availability of talent
  - Client preferences and existing vendor agreements
  - Community hiring commitments from social license agreements
- Assign primary and secondary sourcing channels
- Estimate cost-per-hire per channel
- Establish diversity targets where applicable
- Document sourcing strategy for client approval

### Step 3: Execute Screening and Selection
- Apply screening criteria from competency framework to all applicants
- Verify mandatory certifications against HSE agent requirements
- Conduct structured technical assessments per role type
- Coordinate interview scheduling with hiring managers
- Document evaluation results using standardized scorecards
- Apply psychometric assessments where required by client policy
- Maintain candidate communication cadence (acknowledge within 48h, update weekly)

### Step 4: Manage Offers and Onboarding Handoff
- Generate offer packages using approved compensation bands
- Include relocation/FIFO terms where applicable
- Route offers through approval chain (hiring manager, HR lead, finance)
- Track offer acceptance/decline with reasons
- Upon acceptance, trigger onboarding workflow (handoff to track-employee-onboarding)
- Update pipeline tracker and close requisition
- If declined, return to Step 3 with next-ranked candidate

### Step 5: Report and Optimize
- Generate weekly pipeline summary with key metrics:
  - Total open requisitions by status and department
  - New requisitions opened and positions filled this period
  - Average time-to-fill by role category (current and trailing 30-day)
  - Fill rate: positions filled / positions required per staffing plan
  - Offer acceptance rate and decline reasons
  - Cost-per-hire actuals vs. budget by sourcing channel
- Calculate and trend time-to-fill by role category:
  - Senior/specialist roles: target < 90 days, amber at 75 days, red at 85 days
  - Technical/trades roles: target < 60 days, amber at 45 days, red at 55 days
  - Operational/entry-level roles: target < 45 days, amber at 35 days, red at 40 days
- Identify bottlenecks using pipeline stage duration analysis:
  - Sourcing yield: applicants per requisition below threshold
  - Screening throughput: average days in screening stage
  - Interview scheduling delays: gap between screening pass and interview date
  - Decision delays: time from final interview to offer decision
  - Offer declines: acceptance rate below 80% triggers root cause analysis
- Flag critical-path positions at risk to Orchestrator for escalation:
  - Positions linked to commissioning milestones within 30 days
  - Positions with zero qualified candidates in pipeline
  - Positions where all offers have been declined
- Update recruitment risk register with current threats and mitigations
- Feed recruitment efficiency data to analyze-workforce-metrics skill
- At project completion, produce lessons-learned on recruitment effectiveness:
  - Sourcing channel ROI analysis
  - Accuracy of lead-time assumptions
  - Effectiveness of screening criteria (false positive/negative rates)
  - Client satisfaction with recruitment quality
- Recommend process improvements for future OR projects

## Quality Criteria

| Dimension | Weight | Target | Validation Method |
|-----------|--------|--------|-------------------|
| Technical Accuracy | 30% | All requisitions match staffing plan quantities, competency requirements, and timeline | Cross-reference with Operations staffing plan |
| Completeness | 25% | 100% of positions tracked from requisition through fill or cancellation | Audit pipeline tracker for gaps |
| Consistency | 15% | Screening criteria align with competency frameworks and HSE certification mandates | Cross-agent validation |
| Format | 10% | Professional tables, VSC branding, exportable to client HRIS formats | Template compliance check |
| Actionability | 10% | Hiring managers can act on requisition packages without additional clarification | Stakeholder feedback |
| Traceability | 10% | Every requisition traces to staffing plan line item and OR phase | Reference audit |

**Minimum passing score: 91%**

## Inter-Agent Dependencies

### Upstream (this skill receives from):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Operations | Staffing Plan | REQUIRED -- defines all positions to recruit |
| Operations | Competency Framework | REQUIRED -- screening and assessment criteria |
| Operations | Organizational Design | REQUIRED -- reporting lines and shift patterns |
| Execution | Budget Authorization | REQUIRED -- headcount and cost-per-hire budget |
| Orchestrator | Project Master Schedule | REQUIRED -- milestone dates for hire-by calculation |
| HSE | Certification Requirements | RECOMMENDED -- mandatory safety certifications per role |
| Contracts & Compliance | Community Hiring Commitments | OPTIONAL -- local hiring percentage targets |
| Contracts & Compliance | Labor Contract Framework | RECOMMENDED -- contract types and terms |

### Downstream (this skill provides to):
| Agent | Artifact | Dependency Type |
|-------|----------|-----------------|
| Orchestrator | Weekly Pipeline Summary | REQUIRED -- for OR progress reporting |
| Orchestrator | Pipeline Risk Register | REQUIRED -- for gate review readiness |
| HR & Talent | Onboarding Trigger | REQUIRED -- handoff to track-employee-onboarding |
| Operations | Hired Personnel Roster | REQUIRED -- for training scheduling |
| Execution | Recruitment Cost Actuals | RECOMMENDED -- for OPEX tracking |

## References

- VSC OR Knowledge Base v2.0 (`docs/architecture/_legacy/knowledge-base.md`)
- VSC Multi-Agent Architecture v2 (`docs/architecture/_legacy/multi-agent-architecture.md`)
- VSC Skills Methodology v2 (`skills/VSC_Skills_Methodology_v2.md`)
- ISO 55001:2014 -- Asset Management (workforce as enabling asset)
- Codigo del Trabajo de Chile (Libro I, Titulo I -- Del contrato individual de trabajo)
- IOGP Report 423 -- Workforce Development in Major Projects
- CII RT-318 -- Craft Workforce Availability in Industrial Construction
- Decreto Supremo 132 (Chile) -- Reglamento de Seguridad Minera (workforce qualification)
- D.S. 024-2016-EM (Peru) -- Reglamento de Seguridad y Salud Ocupacional en Mineria
- Resolucion 0312 de 2019 (Colombia) -- Estandares Minimos del SG-SST
- ISO 30414:2018 -- Human Resource Management: Guidelines for Internal and External
  Human Capital Reporting
- SHRM Talent Acquisition Benchmarking Report

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation of manage-recruitment-pipeline skill |
