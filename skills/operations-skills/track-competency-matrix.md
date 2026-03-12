# Track Competency Matrix

## Skill ID: M-02
## Version: 1.0.0
## Category: M. Workforce Readiness (Agent 5)
## Priority: P1 - Critical

---

## Purpose

Track and manage the workforce competency matrix for industrial operations, performing continuous gap analysis between required competencies and current workforce capabilities, and generating targeted gap closure plans with progress monitoring. This skill maintains a living competency database that maps every role to its required competencies, assesses each individual against those requirements, identifies gaps, and tracks closure through training, certification, mentoring, and on-the-job development.

Competency management is the connective tissue between staffing (having the right number of people) and performance (having people who can actually do the job). Industry data consistently demonstrates that competency gaps are a primary driver of operational failure during ramp-up and steady-state operations:

- **75% of asset-intensive organizations report skills gaps that directly impact operational performance** (Pain Point OG-02, Aberdeen Group / PwC Industrial Survey 2023). These gaps manifest as: incorrect operating procedures followed, maintenance tasks performed incorrectly, safety systems bypassed due to lack of understanding, and decisions made without adequate technical knowledge.
- **Maintenance skill deficiency is the second-highest contributor to maintenance cost variance** (Pain Point SM-04, SMRP Benchmarking Study). Facilities with competency management programs achieve 15-25% better maintenance cost performance than those without, because competent technicians complete tasks correctly the first time, reducing rework and secondary damage.
- **The retirement wave is accelerating**: 50% of experienced industrial workers in mature economies will retire by 2030 (Pain Point E-05), taking decades of tacit knowledge with them. Without a structured competency framework, organizations cannot identify which competencies are at risk or plan knowledge transfer systematically.
- **Commissioning incidents are disproportionately caused by competency gaps**: CSB investigation data shows that 40-50% of startup incidents involve personnel performing tasks for which they were not fully competent. Pre-Startup Safety Reviews (PSSRs) increasingly require documented competency verification as a gate condition.
- **Regulatory compliance demands documented competency**: Chilean DS 132 (mining safety), ISO 45001, and process safety management frameworks all require that organizations demonstrate personnel competency for safety-critical roles. A competency matrix provides the auditable evidence.

This skill transforms competency management from a static spreadsheet exercise into a dynamic, data-driven system that continuously monitors competency coverage, predicts emerging gaps (retirements, new technology introduction, regulatory changes), and drives targeted development actions.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Competency Framework Selection and Customization**: The agent must select and apply industry-recognized competency frameworks appropriate to the sector:
   - **Mining**: OPITO (Offshore Petroleum Industry Training Organization, adapted for mining), Chilean NCh competency standards, MineSafe competency profiles
   - **Maintenance**: SMRP (Society for Maintenance & Reliability Professionals) Body of Knowledge, CMRP certification competency domains
   - **Oil & Gas**: OPITO standards, API competency requirements, IADC standards
   - **Process Safety**: CCPS (Center for Chemical Process Safety) competency guidelines
   - Frameworks must be customized to the specific operation (not all competencies apply to all sites)

2. **Multi-Dimensional Competency Assessment**: Each competency must be assessed across multiple dimensions:
   - **Knowledge**: Theoretical understanding (can explain the concept)
   - **Skill**: Practical ability (can perform the task)
   - **Experience**: Time and breadth of application (has done it in various conditions)
   - **Certification**: Formal qualification or license (regulatory requirement met)

3. **Proficiency Level Scale**: Use a standardized 5-level proficiency scale:
   - Level 0: No competency (unaware)
   - Level 1: Awareness (understands concepts, cannot perform independently)
   - Level 2: Basic (can perform with supervision and guidance)
   - Level 3: Competent (can perform independently to standard)
   - Level 4: Proficient (can perform at high level, can troubleshoot, can mentor others)
   - Level 5: Expert (recognized authority, can develop procedures, can train and assess)

4. **Gap Criticality Classification**: Competency gaps must be classified by criticality:
   - **Safety-Critical**: Gap in a competency required for safe operations (e.g., confined space entry, isolation procedures, emergency response). These gaps are BLOCKERS -- the individual cannot perform the role until the gap is closed.
   - **Regulatory-Mandated**: Gap in a competency with regulatory certification requirement. Must be closed before regulatory deadline or individual is removed from the role.
   - **Operational-Impact**: Gap affects operational performance but is not a safety or regulatory issue. Must be closed within defined timeline (typically 6-12 months).
   - **Development**: Gap relates to career development or future capability building. Planned closure within 12-24 months.

5. **Dynamic Gap Tracking**: The competency matrix must be a living system, updated when:
   - New employees join (initial assessment)
   - Training is completed (competency upgrade)
   - Assessments are conducted (validation)
   - Certifications expire (competency downgrade)
   - New equipment or technology is introduced (new competency requirements)
   - Roles change (different competency profile)
   - Regulations change (new competency requirements)

6. **Predictive Gap Analysis**: The agent must project future competency gaps based on:
   - Planned retirements and expected turnover
   - New projects or equipment additions
   - Regulatory changes creating new requirements
   - Technology changes (automation, AI, new maintenance technologies)

7. **Language**: Spanish (Latin American) for deliverables; competency framework terminology preserved in original language (typically English for OPITO, SMRP).

---

## Trigger / Invocation

```
/track-competency-matrix
```

### Natural Language Triggers
- "Build a competency matrix for the operations team"
- "What are our competency gaps?"
- "Track competency development progress"
- "Assess workforce readiness against required competencies"
- "Who is qualified to perform [specific task]?"
- "Construir matriz de competencias para [equipo/planta]"
- "Analizar brechas de competencias de la dotacion"
- "Quien esta calificado para [tarea especifica]?"

### Aliases
- `/competency-matrix`
- `/competency-gaps`
- `/skills-matrix`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `role_profiles` | Defined roles with descriptions, responsibilities, and reporting relationships (from organizational design or staffing model) | .xlsx / .docx | `model-staffing-requirements` / `create-org-design` / mcp-sharepoint |
| `staffing_register` | Current employees/contractors assigned to each role, with name, role, start date, and employment status | .xlsx | HR system / mcp-sharepoint |
| `industry_sector` | Primary industry for competency framework selection | Text | User |
| `facility_profile` | Facility description, technology, equipment types, and process complexity for competency scope definition | .docx / text | User / mcp-sharepoint |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `existing_competency_matrix` | Current competency assessments if available (for brownfield operations) | Clean-sheet competency assessment initiated |
| `training_records` | Completed training and certification records from LMS | All competencies assessed as Level 0 until assessment |
| `certification_register` | Current regulatory certifications with expiry dates | Certification compliance flagged for verification |
| `maintenance_strategy` | Maintenance strategy output (for maintenance-specific competency requirements) | Generic maintenance competency profile applied |
| `operating_procedures` | SOP register (for operations-specific competency mapping) | Generic operations competency profile applied |
| `retirement_projections` | Planned retirement dates and workforce age profile | Retirement risk assessed from age data if available |
| `technology_roadmap` | Planned technology changes (new equipment, automation, digital tools) | Current competency requirements only |
| `regulatory_training_register` | Mandatory regulatory training requirements (DS 132, DS 594, etc.) | Chilean regulatory training requirements applied |
| `incident_records` | Safety incident records (to identify competency-related contributing factors) | Incident-driven competency analysis not performed |
| `performance_reviews` | Employee performance assessment data | Competency assessment based on training records and certification only |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve OPITO competency standards applicable to the industry
- Access SMRP Body of Knowledge for maintenance competency domains
- Retrieve Chilean regulatory training requirements (DS 132 for mining, DS 594 for workplace safety)
- Pull certification requirements by role (blasting license, crane operation, electrical authorization, etc.)
- Access ISO 45001 and process safety competency requirements
- Retrieve competency framework templates from VSC knowledge base
- Access industry competency benchmark data (typical proficiency distributions)

---

## Output Specification

### Deliverable 1: Competency Matrix Report (.docx)

**Filename**: `{ProjectCode}_Competency_Matrix_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 30-50 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, assessment date
2. **Executive Summary** (3-4 pages)
   - Overall competency coverage score
   - Critical gaps requiring immediate action
   - Gap distribution by criticality (safety-critical, regulatory, operational, development)
   - Top 10 roles at highest competency risk
   - Key recommendations and investment required
3. **Competency Framework** (5-8 pages)
   - Framework source and customization rationale
   - Competency domains and categories
   - Proficiency level definitions
   - Assessment methodology
4. **Role-Competency Mapping** (5-10 pages)
   - Competency profile for each role (required competencies and minimum proficiency levels)
   - Competency groupings: technical core, safety-critical, regulatory-mandated, leadership, digital
5. **Current State Assessment** (5-10 pages)
   - Workforce competency heat map (role x competency, color-coded by proficiency)
   - Gap analysis summary by department and role
   - Safety-critical competency coverage
   - Regulatory certification compliance status
   - Competency distribution curves (% of workforce at each proficiency level)
6. **Gap Analysis** (5-8 pages)
   - Critical gaps register with risk classification
   - Gap concentration analysis (which roles, which competencies)
   - Systemic gaps (competencies with organization-wide deficiency)
   - Individual gap profiles for key roles
7. **Predictive Analysis** (3-5 pages)
   - Retirement risk by competency domain
   - Technology change competency impact
   - Emerging competency requirements (next 2-5 years)
   - Competency attrition forecast
8. **Gap Closure Plan** (5-8 pages)
   - Prioritized closure actions by criticality
   - Training interventions required
   - Certification programs to initiate
   - Mentoring and OJT assignments
   - Timeline and cost estimate
   - Progress tracking KPIs
9. **Appendices**
   - A: Complete competency matrix (individual x competency)
   - B: Competency domain descriptions
   - C: Assessment methodology detail
   - D: Certification requirements register

### Deliverable 2: Competency Matrix Workbook (.xlsx)

**Filename**: `{ProjectCode}_Competency_Matrix_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Competency Framework (domains, categories, proficiency scales), Role Profiles (required competencies per role), Individual Assessments (person x competency with proficiency scores), Gap Analysis (auto-calculated gaps), Certification Tracker (certifications with expiry dates), Gap Closure Plan (actions, owners, dates, status), Dashboard (summary KPIs and charts), Trend Analysis (period-over-period)

### Deliverable 3: Competency Dashboard (.pptx / Power BI)

**Filename**: `{ProjectCode}_Competency_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (12-15 slides)**: Overall competency health score, competency heat map by department, critical gap summary, certification compliance tracker, gap closure progress, retirement risk assessment, competency trend over time.

---

## Methodology & Standards

### Primary Competency Frameworks

| Framework | Application | Scope |
|-----------|-------------|-------|
| **OPITO Standards** | International offshore and industrial operations competency standards; provides structured competency profiles for operations and maintenance roles | Operations, maintenance, HSE roles |
| **SMRP Body of Knowledge** | Maintenance and reliability competency domains; basis for CMRP certification | Maintenance, reliability, asset management roles |
| **ISCO-08 / NCh 2728** | International Standard Classification of Occupations / Chilean competency standards | General occupational competency mapping |
| **ISO 17024** | Conformity assessment for personnel certification | Certification program design |
| **ISO 45001, Clause 7.2** | Competence requirements for OHS management systems | All roles with safety responsibilities |
| **CCPS (AIChE)** | Process safety competency guidelines | Process safety roles |
| **API RP 770** | Competency for refinery/petrochemical personnel | O&G operations and maintenance |
| **IEC 62443** | Cybersecurity competency for industrial control systems | ICS/SCADA personnel |

### SMRP Maintenance Competency Domains

```
SMRP Body of Knowledge - 5 Pillars:
  1.0 Business & Management
    1.1 Business Impact of Maintenance & Reliability
    1.2 Organizational Leadership
    1.3 Communication and Stakeholder Management
    1.4 Budgeting and Financial Management
    1.5 Regulatory Compliance

  2.0 Manufacturing Process Reliability
    2.1 Manufacturing Process Design
    2.2 Process Operations Optimization
    2.3 Process Quality and Control

  3.0 Equipment Reliability
    3.1 Equipment Design and Installation
    3.2 Equipment Condition Monitoring
    3.3 Equipment Failure Analysis
    3.4 Equipment Maintenance Strategies

  4.0 Organization & Leadership
    4.1 Maintenance Organization Structure
    4.2 Workforce Planning and Development
    4.3 Performance Management
    4.4 Change Management

  5.0 Work Management
    5.1 Work Identification and Prioritization
    5.2 Planning and Scheduling
    5.3 Execution and Follow-Up
    5.4 Materials Management
    5.5 Continuous Improvement
```

### Proficiency Level Definitions (Detailed)

| Level | Name | Knowledge | Skill | Experience | Assessment Evidence |
|-------|------|-----------|-------|------------|---------------------|
| 0 | None | No knowledge of the competency | Cannot perform any related task | No exposure | N/A |
| 1 | Awareness | Can describe basic concepts; understands why the competency matters | Cannot perform the task independently; needs instruction | Has observed the task being performed | Written knowledge test (>60%) |
| 2 | Basic | Can explain the methodology and key steps | Can perform the task with supervision and guidance | Has performed the task <10 times under supervision | Supervised practical assessment; knowledge test (>70%) |
| 3 | Competent | Can explain methodology, standards, and exceptions | Can perform the task independently to standard quality | Has performed the task >10 times independently; 6+ months experience | Independent practical assessment; knowledge test (>80%); supervisor endorsement |
| 4 | Proficient | Deep understanding of methodology, troubleshooting, and optimization | Can perform at high level; can adapt to non-standard conditions; can troubleshoot | 2+ years of regular application; diverse conditions | Peer assessment; demonstrated troubleshooting; mentoring ability; knowledge test (>90%) |
| 5 | Expert | Can develop methods, train others, and advance the discipline | Recognized authority; can develop procedures and standards; can assess others | 5+ years; recognized by organization as SME | External recognition; published work; assessment qualification; knowledge test (>95%) |

### Gap Risk Classification Matrix

| Gap Type | Description | Closure SLA | Consequence if Unresolved |
|----------|-------------|-------------|---------------------------|
| **Safety-Critical** | Gap in competency required for safe task execution (isolations, confined space, emergency response, high-risk work) | Must close BEFORE person performs the task | Serious injury, fatality, regulatory prosecution |
| **Regulatory-Mandated** | Gap in competency with regulatory certification requirement (blasting license, electrical authorization, crane operation) | Must close BEFORE regulatory deadline or next audit | Regulatory fine, stop-work order, permit revocation |
| **Operational-Impact** | Gap affects quality, productivity, or asset reliability (maintenance techniques, process optimization, diagnostic skills) | Close within 6 months (Phase 1) to 12 months (Phase 2) | Reduced productivity, higher maintenance costs, quality issues |
| **Development** | Gap in career development, leadership, or future capability (supervisory skills, digital literacy, advanced analytics) | Close within 12-24 months | Limited career progression, succession risk, digital readiness gap |

### Industry Competency Benchmarks

| Metric | World-Class | Top Quartile | Median | Bottom Quartile |
|--------|------------|--------------|--------|-----------------|
| Competency coverage (% roles fully competent) | >90% | 80-90% | 65-80% | <65% |
| Safety-critical competency compliance | 100% | >97% | 90-97% | <90% |
| Certification currency (% current) | >98% | 95-98% | 85-95% | <85% |
| Training hours per employee per year | >60 hrs | 40-60 hrs | 20-40 hrs | <20 hrs |
| Time to full competency (new hire) | <6 months | 6-9 months | 9-12 months | >12 months |
| Competency-related incident rate | <5% of incidents | 5-10% | 10-20% | >20% |
| Expert-to-total workforce ratio | >10% | 7-10% | 4-7% | <4% |

---

## Step-by-Step Execution

### Phase 1: Framework Design & Role Mapping (Steps 1-4)

**Step 1: Select and customize the competency framework.**
- Identify the primary competency framework based on industry sector:
  - Mining: OPITO adapted + SMRP + Chilean NCh competency standards
  - Oil & Gas: OPITO + API RP 770 + SMRP
  - Power: NERC reliability competencies + SMRP
  - Chemical: CCPS + SMRP + API
  - General industrial: SMRP + ISO 45001 competency requirements
- Customize framework for the specific operation:
  - Add equipment-specific competencies (e.g., SAG mill operation, flotation cell optimization, crusher maintenance)
  - Add technology-specific competencies (e.g., DCS operation, CBM technologies, CMMS usage)
  - Add site-specific competencies (e.g., altitude work procedures, specific environmental conditions)
  - Remove non-applicable competencies (e.g., marine operations for inland site)
- Define competency categories:
  - Core Technical (operations, maintenance, process)
  - Safety-Critical (isolations, emergency response, confined space, working at height)
  - Regulatory (certifications, licenses, statutory training)
  - Digital/Technology (CMMS, DCS, data analytics, CBM software)
  - Leadership/Management (supervision, planning, communication, decision-making)
- Document the framework with definitions for each competency
- **Quality gate**: Framework covers all critical functions; competency definitions are clear and assessable

**Step 2: Build role-competency profiles.**
- For each role in the organization (from staffing model or org design):
  - Assign applicable competencies from the framework
  - Set minimum required proficiency level for each competency (level 1-5)
  - Classify each competency as: safety-critical, regulatory-mandated, operational-impact, or development
  - Identify certification requirements with issuing authority and validity period
- Create competency profiles by role family:
  - Control room operator: process knowledge (L3), DCS operation (L4), emergency response (L3), first aid (L2), etc.
  - Mechanical fitter: mechanical skills (L3), isolation procedures (L3), welding (L2-L4 depending on role), crane rigging (L2), etc.
  - Instrument technician: instrumentation (L3), control systems (L3), calibration (L4), SIS testing (L3), etc.
  - Shift supervisor: all technician competencies (L3+), supervision (L3), incident command (L3), decision-making (L3), etc.
- Validate profiles with SMEs (or against OPITO/SMRP standard profiles)
- **Quality gate**: Every role has a complete competency profile; safety-critical competencies explicitly flagged

**Step 3: Identify regulatory certification requirements.**
- Map all regulatory certifications required by role:
  - Mining (Chile): DS 132 induction, blasting license (SERNAGEOMIN), explosives handling, mine rescue
  - Electrical: SEC electrical authorization (categories A, B, C, D), high voltage switching
  - Lifting: Crane operator license (by crane type and capacity), rigger/signaler certification
  - Confined space: Entry certification per DS 594 / DS 132
  - Working at height: Fall protection training certification
  - First aid: First responder / paramedic certification
  - Hazardous materials: HAZMAT handling per DS 148
  - Fire safety: Fire warden / fire fighting team certification
  - Vehicles: Heavy vehicle license categories per Chilean regulations
  - Pressure equipment: Boiler operator license where applicable
- Record for each certification:
  - Issuing authority
  - Validity period (1 year, 2 years, indefinite)
  - Renewal requirements (re-training, re-examination)
  - Lead time to obtain (weeks/months)
  - Cost per certification
- **Quality gate**: All regulatory certifications mapped to roles; no regulatory requirement omitted

**Step 4: Populate the workforce register.**
- Load current workforce data:
  - Name, employee ID, role, department, start date, location
  - Employment type (permanent, contract, temporary)
  - Age and projected retirement date (for retirement risk analysis)
  - Current certifications with expiry dates
  - Training history (completed courses, dates, providers)
- If brownfield (existing operation): import existing competency assessment data
- If greenfield (new operation): create blank assessment records for new hires as they are recruited
- Verify data completeness:
  - All active employees have a role assignment
  - All employees have certification records (even if blank)
  - Age/tenure data available for retirement analysis
- **Quality gate**: Workforce register covers >95% of active personnel; role assignments verified

### Phase 2: Assessment & Gap Analysis (Steps 5-8)

**Step 5: Conduct competency assessments.**
- For each individual against their role profile:
  - Assess current proficiency level (0-5) for each required competency
  - Assessment methods (in order of reliability):
    1. Practical assessment by qualified assessor (most reliable)
    2. Supervisor assessment based on observed performance
    3. Training record verification (completed courses mapped to competencies)
    4. Certification verification (valid certificate = meets certification component)
    5. Self-assessment validated by supervisor (least reliable, used as starting point)
  - Record assessment date, assessor, method, and evidence
- For new hires without history: conduct structured initial assessment during onboarding
- For experienced workers: validate competencies through supervisor endorsement + certification review
- Flag any competency where assessment method is "self-assessment only" for priority reassessment
- **Quality gate**: >80% of workforce has been assessed for all role competencies; assessment method documented

**Step 6: Calculate competency gaps.**
- For each individual x competency combination:
  - Gap = Required Level - Current Level
  - If Gap <= 0: Meets or exceeds requirement (GREEN)
  - If Gap = 1 and non-safety-critical: Minor development need (AMBER)
  - If Gap >= 2 OR any safety-critical gap: Significant gap (RED)
- Aggregate gaps by:
  - Individual: Total gaps, critical gaps, gap closure priority
  - Role: Average proficiency vs. required, % meeting requirements
  - Department: Competency coverage score, weakest areas
  - Competency: Organization-wide proficiency distribution, % meeting minimum
  - Criticality: Safety-critical gaps (blocking), regulatory gaps (deadline-driven), operational gaps, development gaps
- Calculate overall competency coverage score:
  - Score = (Competency-role instances meeting minimum) / (Total competency-role instances) x 100%
  - Target: >85% overall, 100% for safety-critical
- **Quality gate**: Gap calculations verified; safety-critical gaps identified with zero tolerance

**Step 7: Identify systemic competency gaps.**
- Analyze gap patterns across the organization:
  - **Technology gaps**: Multiple roles lacking the same technology competency (e.g., DCS operation, CMMS usage, CBM technologies)
  - **Safety knowledge gaps**: Widespread deficiency in safety procedures (e.g., isolation, confined space, emergency response)
  - **Leadership gaps**: Supervisory and management competencies consistently below requirement
  - **New capability gaps**: Competencies required for future state not yet developed in any current employee (e.g., data analytics, AI tool usage, advanced CBM interpretation)
- Identify root causes for systemic gaps:
  - No training program exists for the competency
  - Training exists but has not been deployed to all required personnel
  - Competency was recently added (new requirement) with no time yet for development
  - Expert loss (retirement/turnover) has degraded organizational capability
- **Quality gate**: At least 3 systemic gap patterns identified and analyzed

**Step 8: Perform predictive competency risk analysis.**
- **Retirement risk analysis**:
  - Identify employees within 5 years of retirement (age 55-60 in Chile, typical mining retirement at 60)
  - Map their competency profiles to identify at-risk competencies
  - For each competency where the retiree is Level 4 or 5: identify successors at Level 3+
  - Flag competencies with no successor at Level 3+ as "critical knowledge risk"
- **Turnover risk analysis**:
  - Apply historical turnover rate by role category
  - Project expected departures over next 12-24 months
  - Identify competencies most vulnerable to turnover
- **Technology change impact**:
  - If technology roadmap available: identify new competency requirements from planned changes
  - Common: automation expansion (reduces operational headcount, increases technology competency needs), predictive analytics, digital twins, remote monitoring
  - Quantify gap: number of people needing new competency development
- **Regulatory change impact**:
  - New regulations may create new competency/certification requirements
  - Estimate lead time and cost to develop new competencies
- **Quality gate**: Predictive analysis covers at least retirement and turnover scenarios; risk quantified

### Phase 3: Gap Closure Planning & Tracking (Steps 9-12)

**Step 9: Design gap closure interventions by competency type.**
- For each identified gap, select the appropriate closure intervention:

  | Gap Type | Intervention | Typical Duration | Cost Range |
  |----------|-------------|-----------------|------------|
  | Knowledge gap | Classroom training, e-learning, technical reading | 1-5 days | $200-$2,000/person |
  | Skill gap | Hands-on workshop, simulator training, OJT | 1-4 weeks | $1,000-$10,000/person |
  | Experience gap | Structured OJT, job rotation, mentoring | 3-12 months | Cost of supervision time |
  | Certification gap | External certification program, exam | 1-10 days + exam | $500-$5,000/person |
  | Expert development | Advanced courses, conference, peer exchange, project assignment | 6-24 months | $5,000-$20,000/person |
  | Safety-critical gap | Immediate supervised training + practical assessment BEFORE task execution | 1-5 days | Variable |

- For systemic gaps: design organizational learning programs (not individual interventions)
- For retirement risk: initiate knowledge transfer programs (link to `capture-expert-knowledge`)
- **Quality gate**: Every critical and high-priority gap has an assigned intervention

**Step 10: Prioritize and sequence gap closure actions.**
- Prioritize gaps using the risk classification:
  1. Safety-critical gaps: Close IMMEDIATELY (blocking)
  2. Regulatory certification gaps: Close BEFORE deadline or next audit
  3. High-impact operational gaps: Close within Phase 1 (0-6 months)
  4. Medium-impact operational gaps: Close within Phase 2 (6-12 months)
  5. Development gaps: Close within Phase 3 (12-24 months)
- Sequence training interventions considering:
  - Prerequisite dependencies (basic before advanced)
  - Trainer/assessor availability
  - Operational impact of releasing people for training
  - Training facility availability
  - Budget phasing
- Generate gap closure timeline (Gantt chart by individual or by competency)
- **Quality gate**: All safety-critical gaps have closure actions within 30 days

**Step 11: Calculate gap closure investment.**
- For each gap closure action, estimate:
  - Direct training cost (course fees, materials, travel, accommodation)
  - Indirect cost (lost productivity during training)
  - Certification/examination fees
  - Trainer/assessor costs (internal or external)
  - Infrastructure cost (training facilities, simulators, equipment)
- Aggregate by:
  - Phase (Phase 1, 2, 3)
  - Department
  - Competency domain
  - Training type (classroom, OJT, external, certification)
- Calculate ROI:
  - Avoided incident cost (safety-critical gaps)
  - Avoided regulatory penalties (regulatory gaps)
  - Productivity improvement (operational gaps)
  - Retention benefit (development investment)
- **Quality gate**: Investment estimate covers all prioritized gap closure actions

**Step 12: Establish ongoing tracking and reassessment.**
- Define KPIs for competency management:
  - Overall competency coverage score (target: >85%, increasing quarterly)
  - Safety-critical competency compliance (target: 100%)
  - Certification currency rate (target: >98%)
  - Gap closure rate (gaps closed per quarter)
  - Training completion rate (% of planned training delivered)
  - Time to competency for new hires
  - Competency-related incident rate (trending toward zero)
- Define reassessment schedule:
  - Safety-critical competencies: Assess annually (minimum)
  - Regulatory certifications: Track expiry dates continuously
  - Operational competencies: Reassess every 2 years or on role change
  - Development competencies: Assess annually during performance review
- Configure alerts:
  - Certification expiry (T-90, T-60, T-30 days before expiry)
  - New employee initial assessment due (T+30 days from hire date)
  - Gap closure action overdue (target date + 14 days)
  - Competency coverage score declining (5% drop triggers alert)
- **Quality gate**: KPIs defined; tracking system configured; alert triggers active

### Phase 4: Deliverable Generation & Validation (Steps 13-16)

**Step 13: Generate the competency heat map.**
- Create a visual matrix (rows = individuals or roles, columns = competencies)
- Color-code cells: Green (meets/exceeds), Amber (1-level gap, non-critical), Red (2+ level gap or safety-critical gap), Grey (not required for this role)
- Generate summary views:
  - By department: aggregated competency health by team
  - By competency domain: organizational strength and weakness areas
  - By criticality: safety-critical coverage vs. development gaps
- Include trend arrows (improving, stable, declining) for competencies with historical data
- **Quality gate**: Heat map is readable and actionable; no data display errors

**Step 14: Compile the competency matrix report.**
- Write executive summary with overall health score, critical gaps, and investment required
- Document competency framework with clear proficiency definitions
- Present role-competency profiles for all roles
- Present gap analysis with visualizations (heat maps, gap distributions, Pareto charts)
- Present predictive analysis (retirement, turnover, technology change risks)
- Document gap closure plan with timelines, costs, and accountability
- Include appendices with detailed individual assessments and certification tracker
- **Quality gate**: Report narrative is consistent with workbook data; no discrepancies

**Step 15: Build the competency matrix workbook.**
- Create all sheets with formulas for automatic gap calculation
- Add conditional formatting for visual gap identification
- Add data validation for consistent proficiency scoring
- Create pivot tables for flexible analysis by department, role, competency, criticality
- Create dashboard sheet with summary KPIs and charts
- Add trend analysis sheet for period-over-period comparison
- Protect formulas and structural elements while allowing data entry in assessment cells
- **Quality gate**: Workbook formulas are correct; conditional formatting works; data validation prevents errors

**Step 16: Generate competency dashboard and deliver.**
- Create executive dashboard with:
  - Overall competency health score (gauge chart)
  - Department competency heat map
  - Critical gap count and trend
  - Certification compliance tracker
  - Gap closure progress (actual vs. plan)
  - Retirement risk indicator
  - Training investment vs. budget
- Publish to Power BI or format as executive presentation
- Store all deliverables in mcp-sharepoint
- Submit gap closure actions to mcp-lms for training program integration
- **Quality gate**: Dashboard data matches workbook; all deliverables stored and accessible

---

## Quality Criteria

### Assessment Quality (Target: >85% Agreement with Independent SME Assessment)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Framework Completeness | 20% | Competency framework covers all critical operational, safety, and regulatory requirements | Cross-reference with OPITO/SMRP standards; SME review |
| Assessment Accuracy | 25% | Competency proficiency ratings reflect actual individual capabilities | Spot-check: independent assessor re-assesses 10% of workforce; compare results |
| Gap Identification | 20% | All material competency gaps identified; no critical gaps missed | SME review of gap analysis; incident data correlation |
| Closure Plan Specificity | 15% | Gap closure actions are specific, achievable, and appropriately resourced | Implementation feasibility review |
| Regulatory Compliance | 15% | All regulatory certification requirements identified and tracked | Regulatory requirement cross-check |
| Predictive Accuracy | 5% | Retirement and turnover-driven gap predictions are based on valid data | Demographic data validation |

### Automated Quality Checks

- [ ] Every role in the organization has a complete competency profile
- [ ] Every employee has been assessed for all competencies in their role profile
- [ ] Every safety-critical gap has a closure action with target date within 30 days
- [ ] Every regulatory certification is tracked with expiry date
- [ ] No expired certification is marked as "current"
- [ ] Gap calculation: Required Level - Current Level is correctly computed for every cell
- [ ] Overall competency coverage score is arithmetically correct
- [ ] Department scores aggregate correctly to organizational score
- [ ] No "TBD" or blank entries in safety-critical competency assessments
- [ ] All Level 5 (Expert) assessments are validated by a second assessor or evidence
- [ ] Retirement risk analysis covers all employees within 5 years of retirement age
- [ ] Gap closure plan total cost is internally consistent (detail sums match summary)
- [ ] Trend data shows correct period-over-period change calculations

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `model-staffing-requirements` (M-01) | Role definitions, FTE counts, organizational structure | Critical | Internal |
| `create-org-design` | Role profiles, reporting relationships, RACI | Critical | Internal |
| `develop-maintenance-strategy` (MAINT-01) | Maintenance skill requirements (CBM technologies, RCM competencies) | High | Internal |
| Agent 4 (HSE) / `agent-hse` | Safety-critical competency requirements, regulatory training mandates | Critical | mcp-sharepoint |
| Agent 2 (Operations) / `agent-operations` | Operating competency requirements, process-specific knowledge | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Regulatory certification requirements by role | High | Internal |
| Agent 5 (HR) / `agent-hr` | Workforce data, training records, retirement projections | Critical | mcp-sharepoint |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `plan-training-program` (M-04) | Competency gaps requiring training interventions | Automatic |
| `capture-expert-knowledge` (M-03) | Expert competencies at retirement risk for knowledge capture | Automatic |
| `orchestrate-or-program` (H-01) | Competency readiness status for OR gate reviews | Automatic |
| `audit-compliance-readiness` (L-04) | Training and certification compliance status | On request |
| `generate-or-gate-review` (H-03) | Competency readiness data for gate review package | On request |
| `create-staffing-plan` | Competency-enhanced role profiles for staffing plan | On request |
| Agent 5 (HR) / `agent-hr` | Gap closure actions for workforce development planning | Automatic |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-lms** | Retrieve training completion records; submit gap closure training requirements; track certification status; manage learning paths | `GET /training-records/{employee}`, `GET /certifications/{employee}`, `POST /learning-plans`, `GET /courses` |
| **mcp-sharepoint** | Retrieve role profiles, workforce data, organizational structure; store competency matrix deliverables | `GET /documents/{library}`, `POST /documents/{library}`, `GET /lists/{list}` |
| **mcp-excel** | Generate competency matrix workbook with formulas, conditional formatting, and dashboard charts | `POST /workbooks`, `PUT /sheets/{sheet}`, `GET /workbooks/{id}` |

---

## Templates & References

### Document Templates
- `VSC_Competency_Matrix_Report_Template_v2.0.docx` -- Competency matrix report template with VSC branding
- `VSC_Competency_Matrix_Workbook_Template_v4.0.xlsx` -- Matrix workbook with formulas, conditional formatting, and dashboards
- `VSC_Competency_Framework_Mining_v3.0.xlsx` -- Pre-built competency framework for mining operations
- `VSC_Competency_Framework_O&G_v2.0.xlsx` -- Pre-built competency framework for oil & gas operations
- `VSC_Certification_Tracker_Chile_v2.0.xlsx` -- Chilean regulatory certification tracker with expiry alerts
- `VSC_Competency_Dashboard_Template_v1.5.pptx` -- Executive competency dashboard presentation

### Reference Data Sources
- OPITO Competency Standards (offshore and industrial operations)
- SMRP Body of Knowledge (5 pillars, maintenance and reliability competency)
- CMRP Study Guide (Certified Maintenance & Reliability Professional competency map)
- API RP 770 (Competency requirements for petroleum industry)
- ISO 45001:2018 Clause 7.2 (Competence requirements for OHS)
- CCPS (AIChE) Competency Guidelines for Process Safety
- Chilean DS 132 (mining safety training requirements)
- Chilean DS 594 (workplace safety training requirements)
- Chilean DS 40 (occupational safety prevention requirements)
- NCh 2728 (Chilean national competency standards)
- SERNAGEOMIN training and certification requirements for mining roles
- SEC certification categories for electrical workers

### Knowledge Base
- Industry competency profiles by role (mining, O&G, power, water)
- Competency assessment tool repositories
- Gap closure program designs from prior projects
- Training vendor database by competency domain and Chilean region
- Certification body contact information and program details
- Competency-related incident case studies

---

## Examples

### Example 1: Maintenance Competency Matrix (Copper Concentrator)

**Scope**: 99 maintenance FTEs across mechanical, electrical, instrumentation, and predictive crafts
**Framework**: SMRP BoK adapted + OPITO adapted + Chilean regulatory requirements

**Competency Profile: Mechanical Fitter (Level 3 Required)**

| Competency | Category | Required Level | Safety-Critical | Regulatory |
|-----------|----------|---------------|-----------------|------------|
| Pump maintenance & repair | Technical Core | 3 | No | No |
| Conveyor maintenance | Technical Core | 3 | No | No |
| Crusher maintenance | Technical Core | 3 | No | No |
| Bearing replacement & alignment | Technical Core | 4 | No | No |
| Welding (basic structural) | Technical Core | 2 | No | Yes (if certified) |
| Hydraulic systems | Technical Core | 3 | No | No |
| Mechanical seals | Technical Core | 3 | No | No |
| Isolation & LOTO procedures | Safety-Critical | 3 | YES | Yes (DS 132) |
| Confined space entry | Safety-Critical | 2 | YES | Yes (DS 132) |
| Working at height | Safety-Critical | 2 | YES | Yes (DS 132) |
| Crane rigging & lifting | Safety-Critical | 2 | YES | Yes |
| Hot work permit procedures | Safety-Critical | 2 | YES | Yes (DS 132) |
| Emergency response (role-specific) | Safety-Critical | 2 | YES | Yes |
| First aid (basic) | Safety-Critical | 2 | YES | Yes (DS 594) |
| CMMS work order execution | Digital | 2 | No | No |
| Technical drawing interpretation | Technical Core | 3 | No | No |
| Precision maintenance (alignment, balancing) | Technical Core | 3 | No | No |

**Assessment Results Summary** (32 mechanical fitters assessed):

| Competency Coverage Category | Count | % |
|------------------------------|-------|---|
| Meets all requirements (GREEN) | 18 | 56% |
| Minor gaps only (1-level, non-critical) | 8 | 25% |
| Significant gaps (2+ level OR safety-critical gap) | 6 | 19% |

**Critical Findings**:
- 4 fitters lack formal confined space entry certification (regulatory gap) -- IMMEDIATE ACTION
- 6 fitters have never operated on SAG mill liners (experience gap in key equipment) -- OJT program needed
- CMMS proficiency is universally low (Level 1 average vs. Level 2 required) -- organizational training needed
- 2 fitters approaching retirement (age 58, 59) hold Level 5 expertise in crusher maintenance with no Level 4 successor

### Example 2: Certification Expiry Alert

```
CERTIFICATION EXPIRY ALERT
Generated: 2026-02-17

Certifications expiring within 90 days:

| Employee | Certification | Expiry Date | Days Remaining | Action Required |
|----------|--------------|-------------|----------------|-----------------|
| J. Rodriguez | Blasting License (SERNAGEOMIN) | 2026-03-15 | 26 days | Renewal application submitted? |
| M. Gonzalez | Crane Operator (50T mobile) | 2026-04-01 | 43 days | Schedule recertification exam |
| P. Silva | SEC Electrical Auth. Cat. B | 2026-04-22 | 64 days | Renewal training scheduled? |
| R. Fernandez | First Aid (paramedic level) | 2026-05-10 | 82 days | Re-training course available May 5 |
| A. Morales | Working at Height | 2026-05-15 | 87 days | Annual refresher needed |

Actions:
1. J. Rodriguez: URGENT - If blasting license expires, cannot perform blasting duties.
   Contact SERNAGEOMIN for renewal timeline. If renewal takes >26 days,
   reassign duties temporarily.
2. M. Gonzalez: Schedule with certification provider. Typical lead time: 2-3 weeks.
3-5. Schedule renewals through LMS training calendar.
```

### Example 3: Retirement Risk Competency Analysis

```
RETIREMENT RISK ANALYSIS
Employees within 5 years of retirement: 23 of 223 permanent FTEs (10.3%)

CRITICAL KNOWLEDGE RISK (Expert competency with no Level 4 successor):

| Retiree | Role | Years to Retire | Critical Competency | Current Successors (L3+) |
|---------|------|----------------|--------------------|-----------------------|
| E. Vega | Senior Instrument Tech | 2.1 years | SIS testing & validation (L5) | 1 at L3, 0 at L4 |
| H. Muñoz | Crusher Specialist | 1.4 years | Gyratory crusher overhaul (L5) | 0 at L3+ |
| F. Rojas | Process Supervisor | 3.2 years | Flotation circuit optimization (L5) | 2 at L3, 0 at L4 |
| C. Díaz | Electrical Supervisor | 2.8 years | HV switchgear maintenance (L5) | 1 at L3, 0 at L4 |

RECOMMENDED ACTIONS:
1. H. Muñoz (HIGHEST RISK - 1.4 years, zero successors):
   - Initiate capture-expert-knowledge immediately
   - Assign 2 mechanical fitters to mentoring program under Muñoz
   - Accelerate OJT: Include both mentees in next 2 crusher overhauls
   - Target: At least 1 successor at Level 3 within 12 months

2. E. Vega (HIGH RISK - 2.1 years):
   - Assign current L3 instrument tech to SIS specialist development
   - Schedule IEC 61511 functional safety training (external)
   - Target: 1 successor at Level 4 within 18 months

3. F. Rojas and C. Díaz (MODERATE RISK - 2.8-3.2 years):
   - Begin structured mentoring programs
   - Document tacit knowledge through capture-expert-knowledge skill
   - Target: 1 successor at Level 4 within 24 months each
```
