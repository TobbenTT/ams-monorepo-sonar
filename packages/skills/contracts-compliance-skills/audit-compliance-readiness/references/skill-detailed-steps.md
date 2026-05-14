# Detailed Step-by-Step Execution - audit-compliance-readiness

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Scope Definition & Regulatory Mapping (Steps 1-4)

**Step 1: Define assessment scope and boundaries.**
- Confirm facility scope: which sites, operations, and legal entities are included
- Confirm assessment type: comprehensive (all domains) or focused (specific domain or upcoming audit)
- Confirm regulatory jurisdictions: national, regional, local
- Identify industry-specific regulatory requirements based on sector
- Determine whether contractual and voluntary standards are in scope
- Confirm assessment period (current snapshot or historical trend)
- Identify key stakeholders and report recipients
- **Quality gate**: Scope documented and approved by assessment sponsor

**Step 2: Build or update the regulatory requirements register.**
- If a register exists: validate currency (check for regulatory changes since last update via mcp-web-monitor)
- If no register exists: build from scratch using:
  - National regulatory databases (BCN, Ley Chile) for applicable Chilean law
  - SERNAGEOMIN, SMA, SEC, DGA regulatory requirement lists
  - Industry association compliance guides (Consejo Minero, IOGP, WEC)
  - ISO management system requirement matrices
  - Contractual compliance obligation extractions
- For each requirement, capture:
  - Requirement ID (unique identifier)
  - Source regulation / standard / contract
  - Specific clause or article number
  - Requirement description (what is required)
  - Compliance evidence type (permit, record, inspection, procedure, monitoring data)
  - Compliance frequency (one-time, periodic, continuous)
  - Applicable domain (OHS, Environment, Mining, Labor, Fire, Equipment, Governance)
  - Responsible function (Operations, Maintenance, HSE, HR, Legal, Finance)
  - Penalty for non-compliance (type, amount, severity)
- Total requirements typically: Mining 200-500+, Oil & Gas 150-400+, Power 100-300+
- **Quality gate**: Register covers all applicable agencies; >95% of known requirements captured

**Step 3: Identify compliance evidence sources.**
- For each requirement category, map the evidence sources:
  - Permits and licenses: Corporate records, mcp-sharepoint document libraries
  - Management system documentation: Quality/EHS document management systems
  - Training records: LMS (Learning Management System), HR records
  - Inspection certificates: Asset management systems, equipment files
  - Monitoring data: SCADA, environmental monitoring databases, lab results
  - Emergency preparedness: ERP documents, drill records
  - Financial records: ERP, accounting systems
  - Incident records: Incident management databases
- Attempt to retrieve available evidence via MCP integrations
- Document gaps where evidence sources are inaccessible or unavailable
- **Quality gate**: Evidence source mapped for >80% of requirements; access confirmed or gap documented

**Step 4: Retrieve recent regulatory enforcement context.**
- Query mcp-web-monitor for:
  - Recent SMA sanctions and enforcement actions in the sector (last 12 months)
  - Recent SERNAGEOMIN enforcement actions and focus areas
  - New regulations published or about to take effect
  - Regulatory guidance changes or interpretive letters
  - Industry peer compliance issues (published sanctions)
- Identify current regulatory focus areas (e.g., tailings safety post-Brumadinho, water management in drought conditions, dust emissions in communities)
- Flag any regulation changes that create new requirements not in the register
- **Quality gate**: Regulatory intelligence is current within 30 days

### Phase 2: Evidence Assessment & Gap Identification (Steps 5-8)

**Step 5: Assess permit and license compliance.**
- For each required permit/license:
  - Verify permit exists in document repository
  - Check currency: is the permit within its validity period?
  - Check conditions: are permit conditions being satisfied? (cross-reference monitoring data)
  - Check amendments: have any scope changes required permit amendments not yet obtained?
  - Check reporting: are periodic reports to the regulator being submitted on time?
- For missing or expired permits: classify as Critical gap
- For permits with unmet conditions: classify as High gap
- For permits approaching expiry (within 6 months): classify as Medium gap with proactive renewal action
- **Quality gate**: All required permits assessed; no permit status left as "unknown"

**Step 6: Assess management system and procedural compliance.**
- For each management system requirement (ISO 45001, ISO 14001, etc.):
  - Verify documented procedure exists
  - Check procedure is current (review date within policy period, typically annual)
  - Check procedure is accessible to relevant personnel
  - Verify implementation evidence (records, audit results, management reviews)
  - Check corrective action status from previous audits
- For operating procedures (SOPs):
  - Verify SOPs exist for all regulatory-required activities
  - Check SOPs are current and approved
  - Verify training records demonstrate personnel are trained on applicable SOPs
- For emergency preparedness:
  - Verify ERP exists, is current, and covers all required scenarios
  - Check emergency drill records (frequency, participation, lessons learned)
  - Verify emergency equipment is maintained and inspected
- **Quality gate**: Management system assessment covers all certified systems; procedure currency verified

**Step 7: Assess equipment and infrastructure compliance.**
- For pressure equipment:
  - Verify inspection certificates are current (hydrostatic test, thickness measurement, NDE)
  - Check inspection due dates against regulatory frequencies
  - Verify pressure relief valve testing records
- For lifting equipment:
  - Verify crane, hoist, and forklift inspection certificates
  - Check operator certification records
  - Verify load testing records
- For electrical installations:
  - Verify electrical safety certificates (SEC declarations)
  - Check protective device testing records (RCDs, circuit breakers)
  - Verify hazardous area classification and equipment certification (ATEX/IECEx)
- For fire protection:
  - Verify fire detection system testing records
  - Check fire suppression system inspection records (sprinklers, foam, gas)
  - Verify fire extinguisher inspection and hydrostatic test records
  - Check fire door and passive fire protection inspection records
- For vehicles and mobile equipment:
  - Verify vehicle inspection certificates
  - Check operator license validity
  - Verify safety equipment compliance (lights, alarms, cameras, seatbelts)
- **Quality gate**: All regulated equipment categories assessed; inspection certificates verified or gap documented

**Step 8: Assess training and competency compliance.**
- For each regulatory training requirement:
  - Identify required training (e.g., DS 132 induction, hazardous materials, confined space, working at height, first aid, fire safety)
  - Check training records for completion rates
  - Verify certification validity periods (e.g., blasting licenses, crane operator certificates, electrical authorizations)
  - Check refresher training compliance
- Calculate training compliance rate by requirement and by workforce segment
- Identify personnel with expired or missing mandatory training
- **Quality gate**: Training compliance assessed for all regulatory training requirements; individual gaps identified by name

### Phase 3: Scoring, Analysis & Action Planning (Steps 9-12)

**Step 9: Score compliance status for each requirement.**
- Apply scoring methodology (Compliant / Partially Compliant / Non-Compliant / Not Applicable / Not Assessed)
- For each gap: assign risk score (Severity x Likelihood of Detection)
- Classify gaps by criticality:
  - Critical (15-25): Immediate action required, potential for shutdown or serious penalty
  - High (10-14): Action within 30 days, significant regulatory exposure
  - Medium (5-9): Action within 90 days, moderate exposure
  - Low (1-4): Action within 180 days, administrative or minor exposure
- Calculate domain compliance scores (weighted by requirement risk)
- Calculate overall compliance score
- Determine compliance maturity level (Level 1-5)
- **Quality gate**: Every requirement has a score; no requirements left as "Not Assessed" without documented reason

**Step 10: Identify systemic gaps and patterns.**
- Analyze gaps across domains for systemic patterns:
  - Document control failures: Multiple gaps related to expired or missing documentation
  - Training system failures: Widespread training non-compliance suggesting LMS or scheduling issues
  - Inspection program gaps: Multiple expired certifications suggesting inadequate inspection scheduling
  - Management review gaps: Missing management review records across multiple systems
  - Change management failures: Compliance gaps arising from unmanaged changes
- Identify root causes for systemic issues
- Prioritize systemic fixes (one corrective action may close multiple gaps)
- **Quality gate**: At least 3 systemic patterns analyzed; root causes documented for each

**Step 11: Generate prioritized action plan.**
- For each compliance gap, generate remediation action:
  - Action description: Specific, actionable description of what must be done
  - Responsible party: Named individual or role responsible
  - Required resources: Personnel time, external services, capital investment
  - Estimated cost: Budget required for remediation
  - Target completion date: Based on gap criticality and remediation complexity
  - Dependencies: Other actions that must complete first
  - Evidence of closure: What documentation proves the gap is closed
- Organize actions into phases:
  - Phase 1 Quick Wins (0-30 days): Low-cost, immediate-impact actions (document updates, training scheduling, overdue inspections)
  - Phase 2 Medium-Term (30-90 days): Moderate-effort actions (procedure development, equipment modifications, permit applications)
  - Phase 3 Long-Term (90-365 days): Major-effort actions (capital projects, management system implementations, organizational changes)
- Calculate total remediation cost by phase and domain
- Identify actions requiring capital budget approval
- **Quality gate**: Every gap has an assigned action; all actions have responsible parties and target dates

**Step 12: Generate compliance trend analysis (if prior assessments exist).**
- Compare current scores with previous assessment by domain
- Calculate improvement/deterioration rate
- Identify domains with improving trend (effective management attention)
- Identify domains with deteriorating trend (emerging risk)
- Identify new gaps not present in previous assessment (new requirements or new non-compliances)
- Identify closed gaps from previous assessment (remediation effectiveness)
- Project compliance trajectory: when will target compliance level be achieved at current rate?
- **Quality gate**: Trend analysis is mathematically correct; improvements and deteriorations have explanatory narrative

### Phase 4: Report Generation & Monitoring Setup (Steps 13-16)

**Step 13: Compile compliance audit report.**
- Write executive summary with overall score, critical gaps, and key recommendations
- Write regulatory landscape section with current enforcement context
- Write domain-by-domain assessment with evidence references
- Write gap analysis summary with visualizations (heat maps, Pareto charts, risk matrices)
- Write action plan with phased remediation roadmap
- Write pre-audit preparation guide (if applicable)
- Include appendices with complete regulatory register and evidence inventory
- **Quality gate**: Report covers all in-scope domains; no sections left incomplete

**Step 14: Build compliance gap register workbook.**
- Populate gap register with all identified gaps, risk scores, and remediation actions
- Create compliance scorecard sheet with domain-by-domain scores and RAG status
- Create regulatory register sheet with complete requirement list and compliance status
- Create evidence inventory sheet listing all documents reviewed
- Create trend analysis sheet with period-over-period comparison (if applicable)
- Add data validation, conditional formatting, and pivot table capability
- **Quality gate**: Workbook is internally consistent; gap counts match report narrative

**Step 15: Generate compliance dashboard.**
- Create overall compliance score visualization (dial/gauge chart)
- Create domain compliance heat map
- Create gap severity distribution chart (critical, high, medium, low)
- Create action plan tracker (open actions by status, overdue actions, completion trend)
- Create regulatory deadline calendar (upcoming permit renewals, reporting deadlines, audit dates)
- Create trend visualization (compliance score over time by domain)
- Publish to Power BI or format as executive presentation
- **Quality gate**: Dashboard data matches report and workbook; visualizations are clear and actionable

**Step 16: Establish monitoring and reassessment schedule.**
- Define reassessment frequency based on compliance maturity and risk level:
  - Compliance <75%: Monthly reassessment of critical gaps
  - Compliance 75-85%: Quarterly comprehensive reassessment
  - Compliance 85-95%: Semi-annual reassessment with monthly KPI tracking
  - Compliance >95%: Annual comprehensive assessment with quarterly spot checks
- Set up automated alerts via mcp-web-monitor for:
  - New regulation publications affecting the facility
  - Upcoming permit expiry dates (T-90, T-60, T-30 days)
  - Upcoming inspection due dates (T-60, T-30, T-14 days)
  - Regulatory enforcement actions in the sector (peer monitoring)
- Define compliance KPIs for ongoing monitoring:
  - Overall compliance score
  - Number of open critical/high gaps
  - Action plan completion rate
  - Permit currency rate
  - Training compliance rate
  - Inspection currency rate
- **Quality gate**: Monitoring schedule documented; automated alerts configured

---
