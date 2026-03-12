# Detailed Step-by-Step Execution - track-competency-matrix

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

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
