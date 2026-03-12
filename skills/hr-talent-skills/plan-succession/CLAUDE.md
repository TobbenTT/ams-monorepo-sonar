---
name: plan-succession
description: "Plan succession for critical roles including readiness assessment, development plans, and single-point-of-failure analysis. Triggers: 'succession planning', 'plan de sucesion', 'roles criticos', 'single point of failure', 'liderazgo clave'."
---

# Plan Succession

## Skill ID: HR-D-01
## Version: 1.0.0
## Category: D - Planning (HR & Talent Agent)
## Priority: P2 - Medium

---

## Purpose

Plan and manage workforce succession for critical roles in industrial operations, including identification of key positions, readiness assessment of potential successors, creation of individualized development plans, and elimination of single-point-of-failure (SPOF) risks in the organizational structure. This skill ensures operational continuity by maintaining a pipeline of ready successors for roles whose vacancy would critically impact safety, production, or regulatory compliance.

Succession planning is a strategic imperative for asset-intensive industries where specialized knowledge and operational experience cannot be quickly replaced:

- **Critical role vacancy costs**: In mining and oil & gas operations, an unplanned vacancy in a key technical or leadership role can cost USD 500K-2M in production losses, contractor premiums, and delayed ramp-up (Deloitte Mining & Metals Workforce Report, 2023). A plant superintendent vacancy during commissioning can delay first production by 2-6 months.
- **Demographic cliff in industrial sectors**: 45-55% of experienced supervisors and technical specialists in Latin American mining and energy operations will reach retirement age within the next 7-10 years (COCHILCO Workforce Study, 2023). Chilean mining operations are particularly exposed, with average workforce age in technical roles exceeding 48 years.
- **Single-point-of-failure risk**: Many industrial operations have roles where only one person possesses the critical knowledge -- the DCS specialist who configured the control system, the reliability engineer who built the maintenance strategy, the environmental compliance manager who holds all regulatory relationships. If that person leaves (voluntary or involuntary), the organization faces an immediate capability gap.
- **Knowledge loss is irreversible without planning**: Tacit knowledge (how to troubleshoot a specific compressor anomaly, which regulatory inspector requires which documentation format, how to manage the union during a turnaround) takes years to develop and is lost permanently when the holder departs without structured knowledge transfer.
- **Chilean labor market constraints**: Remote industrial operations (Atacama, Antofagasta, Magallanes) face limited local talent pools. Replacement timelines for specialized roles (metallurgist, process safety engineer, maintenance planner) average 6-12 months including recruitment, relocation, and ramp-up. Succession planning reduces this to weeks through internal pipeline readiness.
- **OR project specificity**: During Operational Readiness projects, succession planning must account for the transition from project-mode (temporary EPC staff) to operations-mode (permanent operations team). Key knowledge holders from the EPC phase must transfer knowledge before demobilization, and operations successors must be identified and developed before handover milestones.

This skill transforms succession from an ad-hoc exercise into a systematic, data-driven program that identifies critical roles, assesses successor readiness, creates targeted development plans, and tracks progress toward full succession coverage.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Critical Role Identification**: The agent must systematically identify roles that require succession planning:
   - **Impact Assessment Criteria**: Role's impact on safety (can vacancy cause safety incidents?), production (can vacancy halt or reduce production?), regulatory compliance (does role hold critical permits or relationships?), knowledge concentration (is specialized knowledge held by one person?), and replacement difficulty (how long to recruit externally?).
   - **Criticality Classification**: Tier 1 (Critical -- vacancy causes immediate operational impact; requires succession coverage within 48 hours), Tier 2 (Important -- vacancy causes significant impact within 2-4 weeks; requires succession pipeline), Tier 3 (Standard -- vacancy manageable through redistribution; standard recruitment timeline acceptable).
   - **SPOF Analysis**: Identify roles where only one person currently possesses the required competency at Level 4-5 (Proficient/Expert). Flag these as single-point-of-failure risks requiring immediate mitigation.

2. **Successor Identification and Readiness Assessment**: The agent must evaluate potential successors:
   - **Readiness Levels**: Ready Now (can assume role within 0-6 months with minimal development), Ready Soon (can assume role within 6-18 months with targeted development), Ready Later (has potential but requires 18-36 months of development), Not Ready (does not currently demonstrate potential for this role).
   - **Assessment Dimensions**: Performance track record (from `track-workforce-performance`), competency alignment (from `track-competency-matrix`), leadership potential, learning agility, mobility willingness (particularly important for Chilean operations with remote sites), and career aspiration alignment.
   - **9-Box Grid Integration**: Cross-reference performance ratings (X-axis) with leadership potential assessments (Y-axis) to place candidates in the 9-box talent grid. Top-right quadrant (high performance + high potential) are primary succession candidates.

3. **Development Plan Creation**: For each successor-role pair, the agent must create a tailored development plan:
   - **Competency Gap Closure**: Specific training, certification, or experience required to close gaps between current competency and role requirements.
   - **Stretch Assignments**: Temporary role expansions, project leadership opportunities, or cross-functional rotations that build required capabilities.
   - **Mentoring/Coaching**: Pairing with the current role holder or another senior leader for knowledge transfer (particularly for tacit knowledge).
   - **Exposure**: Board/committee participation, external conference attendance, industry network building, regulatory relationship development.
   - **Timeline**: Milestone-based development plan aligned to readiness target date.

4. **Knowledge Transfer Planning**: For high-risk succession scenarios (imminent retirement, SPOF roles):
   - **Knowledge Mapping**: Identify critical tacit and explicit knowledge held by the current role holder (links to `capture-expert-knowledge` skill).
   - **Transfer Methods**: Structured shadowing, documented procedures, video/audio recording of expert reasoning, mentoring sessions, collaborative problem-solving exercises.
   - **Transfer Verification**: Assess whether successor has acquired the knowledge through practical demonstration and competency assessment.

5. **Emergency Succession**: For each Tier 1 critical role, the agent must maintain an emergency succession plan:
   - **Immediate Cover**: Who assumes the role within 24-48 hours if the incumbent is suddenly unavailable?
   - **Interim Cover**: Who manages the role for 1-6 months while permanent succession is activated?
   - **Permanent Succession**: Who is being developed as the long-term successor?
   - **External Contingency**: Pre-identified external candidates or consulting firms that could provide interim capability.

6. **Succession Metrics and Monitoring**: The agent must track succession health:
   - Succession coverage ratio (% of Tier 1 roles with at least one Ready Now successor)
   - Successor pipeline depth (average number of identified successors per critical role)
   - Readiness improvement rate (% of successors who advanced one readiness level in the past 12 months)
   - SPOF elimination rate (% of identified SPOFs that have been mitigated)
   - Time-to-readiness (average months from identification to Ready Now status)
   - Diversity of succession pipeline (gender, age, background representation)

7. **Language**: Spanish (Latin American / Chilean context) for all deliverables; English technical terms preserved where industry standard.

---

## Trigger / Invocation

```
/plan-succession
```

### Natural Language Triggers
- "Identify critical roles that need succession plans"
- "Who are the successors for the plant manager?"
- "Assess readiness of potential successors for key roles"
- "We have a single point of failure in the DCS team"
- "Build development plans for succession candidates"
- "Identificar roles criticos que necesitan plan de sucesion"
- "Quien puede reemplazar al superintendente de planta?"
- "Evaluar preparacion de sucesores para puestos clave"
- "Tenemos un punto unico de falla en el equipo de mantenimiento"
- "Crear planes de desarrollo para candidatos de sucesion"

### Aliases
- `/succession-planning`
- `/sucesion`
- `/critical-roles`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `organizational_structure` | Current org chart with roles, reporting relationships, and incumbents | .xlsx / .docx | `create-org-design` / HR system |
| `employee_roster` | Active employees with name, role, tenure, age, contract type, location | .xlsx | HR system / mcp-sharepoint |
| `performance_data` | Current and historical performance ratings (minimum 2 cycles) | .xlsx | `track-workforce-performance` / HR system |
| `competency_matrix` | Current competency assessments mapped to roles | .xlsx | `track-competency-matrix` |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `retirement_projections` | Planned retirement dates, age profile, early retirement risk | Estimated from age data (retirement at 65 for men, 60 for women per Chilean law) |
| `turnover_data` | Historical voluntary turnover by department and role | Industry average turnover rates applied (8-12% for mining, 10-15% for O&G) |
| `talent_assessments` | 9-box grid placements, leadership potential assessments, career aspirations | Assessment conducted as part of this skill |
| `previous_succession_plan` | Existing succession plans for update and comparison | Clean-sheet succession plan created |
| `knowledge_maps` | Critical knowledge documentation from `capture-expert-knowledge` | Knowledge mapping initiated as part of SPOF analysis |
| `training_catalog` | Available training programs, certifications, and development resources | Generic development interventions recommended |
| `mobility_preferences` | Employee willingness to relocate or change shift patterns | All candidates assumed mobile; preferences verified during planning |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve Chilean workforce demographics and retirement age regulations (DFL 3500, pension system)
- Access COCHILCO and industry workforce trend data for mining sector succession benchmarks
- Pull role criticality assessment frameworks (SHRM, CEB/Gartner succession planning methodology)
- Retrieve 9-box talent grid methodology and calibration guidelines
- Access development plan templates with industrial sector stretch assignment examples
- Retrieve emergency succession plan templates for safety-critical operations

---

## Output Specification

### Deliverable 1: Succession Planning Report (.docx)

**Filename**: `{ProjectCode}_Succession_Plan_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 30-50 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, assessment date
2. **Executive Summary** (3-4 pages)
   - Succession coverage health score
   - Number of critical roles, SPOF count, coverage gaps
   - Top 5 highest-risk succession scenarios
   - Key investment recommendations
   - Timeline for achieving target succession coverage
3. **Critical Role Assessment** (5-8 pages)
   - Role criticality matrix (impact vs. replacement difficulty)
   - Tier 1, 2, 3 role classification with justification
   - SPOF analysis: roles with zero backup
   - Retirement and turnover exposure by role
4. **Successor Pipeline** (8-12 pages)
   - Successor map for each Tier 1 and Tier 2 role
   - Readiness assessment per successor (Ready Now / Ready Soon / Ready Later)
   - 9-box talent grid with placement rationale
   - Successor pipeline depth analysis
   - Diversity analysis of succession pipeline
5. **Development Plans** (5-8 pages)
   - Individualized development plan for each primary successor
   - Competency gaps to close with specific interventions
   - Stretch assignments and rotation schedule
   - Mentoring and knowledge transfer plans
   - Investment required (training costs, temporary backfill during rotations)
6. **Emergency Succession Playbook** (3-5 pages)
   - Immediate cover assignments for all Tier 1 roles
   - Interim management arrangements (1-6 months)
   - External contingency contacts
   - Communication protocol for unplanned vacancy
7. **Knowledge Transfer Plan** (3-5 pages)
   - Critical knowledge at risk (SPOF roles and near-retirement incumbents)
   - Knowledge transfer schedule and methods
   - Transfer verification milestones
8. **Succession Metrics and Monitoring** (2-3 pages)
   - Current succession KPIs vs. targets
   - Improvement roadmap and timeline
   - Reporting cadence and governance
9. **Appendices**
   - A: Role criticality scoring detail
   - B: Individual successor profiles
   - C: Development plan templates
   - D: Emergency succession contact list

### Deliverable 2: Succession Tracker Workbook (.xlsx)

**Filename**: `{ProjectCode}_Succession_Tracker_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Critical Roles Register (all Tier 1-3 roles with criticality scores), Successor Pipeline (role-successor pairs with readiness levels), 9-Box Grid Data (performance x potential placements), Development Plans (actions, owners, timelines, status), SPOF Register (single-point-of-failure roles with mitigation status), Emergency Succession (immediate cover assignments), Knowledge Transfer Log (transfer activities and completion), Dashboard (succession coverage KPIs and charts)

### Deliverable 3: Succession Dashboard (.pptx)

**Filename**: `{ProjectCode}_Succession_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (10-12 slides)**: Succession health score, critical role coverage map, SPOF count and trend, 9-box talent grid, successor readiness distribution, development investment summary, retirement risk timeline, emergency succession readiness.

---

## Procedure

### Step 1: Identify and Classify Critical Roles
- Review organizational structure and role profiles from `create-org-design`.
- Assess each role against impact criteria: safety, production, regulatory, knowledge, replaceability.
- Classify roles into Tier 1 (Critical), Tier 2 (Important), Tier 3 (Standard).
- Conduct SPOF analysis: identify roles where only one person has Level 4-5 competency.
- Map retirement and turnover risk overlay to role criticality.
- Output: Critical Roles Register with Tier classification and SPOF flags.

### Step 2: Assess Successor Readiness and Build Pipeline
- For each Tier 1 and Tier 2 role, identify 2-3 potential successors from the internal workforce.
- Assess each candidate against role requirements using performance data, competency assessments, and leadership potential indicators.
- Place candidates on 9-box talent grid (performance x potential).
- Classify readiness: Ready Now, Ready Soon, Ready Later, Not Ready.
- Identify roles with insufficient pipeline (zero or one candidate) for external talent mapping.
- Output: Successor pipeline map, 9-box grid, readiness assessment report.

### Step 3: Create Development Plans and Knowledge Transfer Schedule
- For each primary successor, identify competency gaps between current state and role requirements.
- Design development plan with specific interventions: training, stretch assignments, mentoring, exposure.
- For SPOF and near-retirement roles, create knowledge transfer schedule using methods from `capture-expert-knowledge`.
- Estimate development investment (costs, time, temporary backfill needs).
- Assign development plan owners (typically the successor's current manager + HR partner).
- Output: Individualized development plans, knowledge transfer schedule, investment estimate.

### Step 4: Establish Emergency Succession Protocol
- For each Tier 1 role, designate an immediate cover (who steps in within 24-48 hours).
- Designate interim cover (who manages 1-6 months) if different from immediate cover.
- Document decision authority transfer, system access requirements, and key relationship handover.
- Identify external contingency options (consulting firms, industry network contacts).
- Create communication protocol for unplanned vacancy scenarios.
- Output: Emergency Succession Playbook with named covers and activation protocol.

### Step 5: Generate Deliverables and Establish Monitoring Cadence
- Compile all data into the Succession Planning Report.
- Build the Succession Tracker Workbook with all analytical sheets and formulas.
- Generate the Succession Dashboard for executive and board presentation.
- Calculate succession KPIs: coverage ratio, pipeline depth, SPOF count, readiness rate.
- Establish quarterly review cadence for succession plan updates.
- Archive succession documentation with restricted access (HR and executive leadership only).
- Output: All three deliverables validated and stored in project output folder.

---

## Quality Criteria

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Role Criticality Accuracy | 20% | All safety-critical, production-critical, and regulatory-critical roles correctly identified and classified | Cross-reference with operations, HSE, and compliance agents; validate against incident and production data |
| Successor Assessment Rigor | 25% | Readiness assessments based on documented evidence (performance data, competency scores, potential indicators), not subjective opinion | Audit trail: every readiness rating links to supporting data points |
| SPOF Identification | 20% | All single-point-of-failure risks identified; no critical SPOF missed | Competency matrix cross-check: identify all competencies with single Level 4-5 holder |
| Development Plan Specificity | 15% | Each development plan has specific, time-bound actions with clear owners and measurable milestones | Review: sample 30% of development plans for specificity and feasibility |
| Emergency Succession Coverage | 10% | Every Tier 1 role has named emergency cover with documented authority transfer | Emergency succession drill: tabletop exercise for 3 highest-risk scenarios |
| Pipeline Diversity | 10% | Succession pipeline reflects organizational diversity objectives; no systemic bias in identification | Demographic analysis of pipeline vs. eligible population |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `create-org-design` (Operations) | Organizational structure, role definitions, reporting lines | Critical | Internal |
| `track-competency-matrix` (Operations) | Competency assessments, proficiency levels per individual | Critical | Internal |
| `track-workforce-performance` (HR & Talent) | Performance ratings, 9-box grid data, high-potential flags | Critical | Internal |
| `capture-expert-knowledge` (Operations) | Knowledge maps, tacit knowledge documentation for SPOF roles | High | Internal |
| `model-staffing-requirements` (Operations) | Future staffing needs, new role creation, expansion plans | Medium | Internal |
| `manage-employee-lifecycle` (HR & Talent) | Retirement dates, resignation notices, transfer requests | High | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `plan-training-program` (Operations) | Succession-driven training requirements and development plans | Automatic |
| `capture-expert-knowledge` (Operations) | SPOF roles requiring urgent knowledge capture | Automatic |
| `track-workforce-performance` (HR & Talent) | High-potential list for performance cycle calibration | On request |
| `manage-employee-lifecycle` (HR & Talent) | Succession-triggered promotions and role transitions | On succession activation |
| `orchestrate-or-program` (Orchestrator) | Succession readiness status for OR gate reviews | On request |
| `create-staffing-plan` (Operations) | Succession gaps requiring external recruitment | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve employee data, org charts; store succession plans (restricted access) | `GET /lists/{list}`, `POST /documents/{library}` |
| **mcp-excel** | Generate succession tracker workbook with formulas and dashboards | `POST /workbooks`, `PUT /sheets/{sheet}` |
| **mcp-hris** | Retrieve employee master data, retirement dates, career history | `GET /employees`, `GET /career-history/{employee}` |

---

## References

- COCHILCO (Comision Chilena del Cobre) Workforce Studies -- mining sector demographics and talent pipeline data
- DFL 3500 (Chilean Pension System) -- retirement age and early retirement provisions
- Deloitte Mining & Metals Workforce Report (2023) -- succession planning benchmarks
- SHRM Succession Planning Toolkit -- methodology, templates, and best practices
- CEB/Gartner High-Potential Identification Framework -- 9-box grid methodology
- "Effective Succession Planning" (William Rothwell, 6th Edition) -- academic framework
- VSC OR Knowledge Base: `methodology/or-concepts/` workforce readiness and knowledge transfer sections
- ISO 55001 -- Asset Management competency requirements for succession in asset-critical roles

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC OR System | Initial skill creation for HR & Talent agent |
