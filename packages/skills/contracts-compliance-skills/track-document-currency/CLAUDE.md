---
name: track-document-currency
description: "Track document version currency and ensure all project documents are up to date. Triggers: 'document currency', 'version control', 'vigencia de documentos'."
---

# Track Document Currency
## Skill ID: DOC-03
## Version: 1.0.0
## Category: B. Document Management
## Priority: P1 - Critical
## Agent: Agent 2 - Documentation & Knowledge Management

## Purpose

Audit the currency of all operational documents across the plant, flag outdated items, generate compliance gap reports, and trigger review/update workflows. This skill provides continuous monitoring of document revision status, review due dates, and content accuracy to ensure that the operating facility always has current, accurate documentation available to personnel who need it.

Document currency is one of the most persistent and costly problems in industrial operations. Industry research consistently shows that 30-40% of worker productive time is consumed by searching for, verifying, and reconciling documentation (McKinsey Global Institute; AIIM International research). In process industries, this translates directly to safety risk: operators referencing outdated procedures, maintenance technicians using superseded drawings, and engineers making decisions based on stale data. The US Chemical Safety Board (CSB) has identified outdated operating procedures as a contributing factor in multiple major incidents, including the 2005 BP Texas City refinery explosion (15 fatalities) where outdated startup procedures were a cited cause.

This skill directly addresses Pain Point A-02 (Administrative Gap - Worker Time Lost Searching for Documents) by establishing automated currency auditing, proactive notification of upcoming review deadlines, and real-time visibility into the documentation health of the facility.

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Document Inventory & Baseline**: Maintain a comprehensive inventory of all controlled documents in the facility, including operating procedures (SOPs/EOPs/SWPs), engineering drawings (P&IDs, electrical schematics, plot plans), equipment data sheets, safety studies (HAZOP, SIL, LOPA), permits, licenses, and certificates. Each document must have defined review frequency, accountable owner, and currency criteria.

2. **Automated Currency Auditing**: Continuously scan the document management system to identify documents approaching or past their review due date. Generate graduated alerts at 90-day, 60-day, 30-day, and 0-day thresholds. OSHA 29 CFR 1910.119(f)(1) requires operating procedures to be reviewed and certified as current annually; this skill ensures 100% compliance with this requirement.

3. **Content Accuracy Verification**: Beyond simple date-based currency checks, the agent must perform intelligent content verification by cross-referencing documents against source data changes. For example, if a P&ID is revised, all procedures referencing that P&ID must be flagged for content review. If an equipment tag number changes, all documents referencing that tag must be updated.

4. **Change Cascade Analysis**: When a source document changes (e.g., a P&ID revision), automatically identify all downstream documents that may be affected and generate a change cascade report showing the full impact scope. This prevents the common failure mode where a drawing is updated but referencing procedures remain outdated.

5. **Currency Dashboard & Reporting**: Provide real-time visibility into overall documentation health through dashboards showing currency percentages by document type, area, discipline, and owner. Generate periodic reports for management review, regulatory compliance, and audit preparation.

6. **Review Workflow Initiation**: When documents are identified as due for review or flagged as potentially outdated, automatically initiate review workflows by notifying document owners, assigning review tasks, and tracking completion through to re-certification.

## Trigger / Invocation

```
/track-document-currency
```

**Aliases**: `/doc-currency`, `/document-audit`, `/currency-check`, `/vigencia-documentos`

**Trigger Conditions**:
- Scheduled daily automated scan of document management system
- A source document (P&ID, control narrative) is revised, triggering cascade analysis
- Management requests documentation currency status report
- Pre-audit preparation requires documentation health assessment
- A MOC (Management of Change) is initiated that may affect existing documents
- New regulatory requirement is identified that may affect documentation standards
- User requests currency status for a specific system, area, or document type

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Master Document Register (MDR) | .xlsx, SharePoint List | Complete inventory of all controlled documents with: document number, title, type, revision, approval date, review due date, owner, associated system/area |
| Document Review Policy | .docx | Company/plant policy defining review frequencies by document type (e.g., SOPs: annual; P&IDs: biennial; safety studies: 5-year) |
| Document Management System Access | SharePoint connection | Connection to the plant's document management system for automated scanning of document metadata, revisions, and dates |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Cross-Reference Matrix | .xlsx | Matrix showing relationships between documents (e.g., SOP-100-001 references P&ID-100-001, P&ID-100-002) |
| Equipment Tag Change Log | .xlsx | Log of all equipment tag number changes, additions, and deletions |
| MOC Register | .xlsx | Active and completed Management of Change records with affected documentation lists |
| Regulatory Calendar | .xlsx | Calendar of regulatory submission deadlines requiring current documentation |
| Previous Audit Findings | .docx, .xlsx | Previous internal/external audit findings related to document currency |
| Organizational Chart | .xlsx | Current org chart for validating document owner assignments (detect orphaned documents from personnel changes) |
| P&ID Revision Log | .xlsx | Log of all P&ID revisions with change descriptions for cascade analysis |

### Input Validation Rules

- Documents without review due dates are flagged as non-compliant and assigned default review frequency per document type
- Documents without assigned owners are flagged as "orphaned" requiring immediate reassignment
- Review frequencies shorter than regulatory minimum requirements are accepted; longer frequencies are flagged
- Documents in the DMS not appearing in the MDR are flagged as "unregistered" requiring investigation
- Documents in the MDR not found in the DMS are flagged as "missing" requiring immediate action

## Output Specification

### Primary Output: Document Currency Report (.xlsx)

**Filename**: `{SiteCode}_Document_Currency_Report_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Currency Dashboard"
High-level summary:

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Controlled Documents | 12,456 | - | - |
| Documents Current | 10,234 (82.2%) | >95% | RED |
| Documents Due for Review (next 90 days) | 876 (7.0%) | - | AMBER |
| Documents Overdue for Review | 1,346 (10.8%) | <5% | RED |
| Documents with No Owner Assigned | 23 (0.2%) | 0% | RED |
| Documents Not Found in DMS | 12 (0.1%) | 0% | RED |
| Average Days Overdue (overdue documents) | 147 days | - | - |
| PSM Operating Procedures Current | 78.5% | 100% | RED |
| Safety Studies Current | 91.2% | 100% | AMBER |

Currency by Document Type:
| Document Type | Total | Current | Due (<90d) | Overdue | Currency % |
|--------------|-------|---------|-----------|---------|------------|
| SOPs - Standard Operating Procedures | 342 | 268 | 34 | 40 | 78.4% |
| EOPs - Emergency Operating Procedures | 87 | 72 | 8 | 7 | 82.8% |
| P&IDs | 1,234 | 1,190 | 22 | 22 | 96.4% |
| Equipment Data Sheets | 3,456 | 3,100 | 178 | 178 | 89.7% |
| Safety Studies (HAZOP/SIL/LOPA) | 89 | 81 | 4 | 4 | 91.0% |
| Certificates & Permits | 234 | 198 | 18 | 18 | 84.6% |
| Maintenance Procedures | 567 | 456 | 56 | 55 | 80.4% |

See [`references/skill-output-details.md`](references/skill-output-details.md) for complete output field definitions and format details.

## Methodology & Standards

### Primary Standards
- **OSHA 29 CFR 1910.119(f)(1)**: "The employer shall certify annually that these operating procedures are current and accurate." This is the foundational regulatory requirement driving annual SOP currency reviews.
- **OSHA 29 CFR 1910.119(d)**: Process Safety Information must be kept current. P&IDs and other PSI documents must reflect the as-built/as-operated condition.
- **ISO 9001:2015 Section 7.5.3**: Control of Documented Information -- requires organizations to ensure documents are available, suitable, and adequately protected.
- **ISO 55001**: Asset Management -- requires documented information relevant to asset management to be controlled and maintained.

### Regulatory Review Frequencies (Minimum)
| Document Type | OSHA PSM Requirement | Recommended Best Practice |
|--------------|---------------------|--------------------------|
| Operating Procedures (SOPs) | Annual certification | Annual review + update |
| Emergency Procedures (EOPs) | Annual certification | Annual review + drill validation |
| P&IDs | "Keep current" (no specific period) | Biennial review; update within 6 months of any change |
| Process Hazard Analysis | Revalidation every 5 years | 5-year cycle; interim review after significant changes |
| Safety Data Sheets (SDS) | Current versions available | Update within 90 days of new revision from manufacturer |
| Equipment Inspection Reports | Per API/ASME inspection intervals | Per RBI program schedule |
| Environmental Permits | Per permit conditions | 90 days before expiration for renewal |
| Training Records | Per employee certification periods | Annual competency verification |

### Chilean Regulatory Requirements
- **DS 594 Art. 3**: Employers must maintain updated documentation of workplace conditions
- **DS 132 Art. 16 (Mining)**: Safety procedures must be reviewed annually and after incidents
- **Ley 16.744**: Occupational safety documentation must be current and accessible
- **SERNAGEOMIN regulations**: Mining-specific procedure review requirements

### Industry Statistics
- 30-40% of worker productive time is spent searching for information (McKinsey Global Institute)
- Average industrial worker spends 2.5 hours per day looking for information they need (IDC Research)
- 7.5% of all documents in organizations are lost; 3% are misfiled (PricewaterhouseCoopers)
- Document retrieval cost: $120 average per search incident; $220 average to recreate a lost document (AIIM)
- Organizations with automated document management reduce search time by 75% (AIIM benchmark)
- Non-compliance with OSHA PSM document currency requirements: Average penalty $15,000-$70,000 per citation; willful violations up to $156,259 per violation (2024 rates)
- 82% of process safety incidents have document currency as a contributing factor (UK HSE analysis)

## Step-by-Step Execution

### Phase 1: Document Inventory & Baseline (Steps 1-3)

**Step 1: Build Master Document Inventory**
- Connect to SharePoint document management system (via mcp-sharepoint)
- Extract complete document inventory including:
  - Document number, title, type, discipline
  - Current revision and revision date
  - Approval date and approver
  - Document owner (individual or role)
  - Associated system/area/equipment
  - Review frequency (from document type or explicit metadata)
  - Last review date and next review due date
  - File location and access path
- Cross-reference against Master Document Register (MDR)
- Identify discrepancies:
  - Documents in DMS not in MDR (unregistered documents)
  - Documents in MDR not in DMS (missing documents)
  - Metadata inconsistencies (different revision in MDR vs. DMS)

**Step 2: Establish Document Relationships (Cross-Reference Map)**
- Build a document dependency graph:
  - P&IDs -> referenced by SOPs, maintenance procedures, equipment data sheets
  - Control narratives -> referenced by SOPs, alarm response procedures
  - HAZOP studies -> reference P&IDs, generate recommendations for SOPs and safeguards
  - Equipment data sheets -> referenced by maintenance procedures, inspection plans
  - Vendor manuals -> referenced by SOPs, maintenance procedures
- Parse document content (where accessible) to automatically detect cross-references:
  - Scan for document number patterns in text
  - Scan for equipment tag numbers to establish equipment-document links
  - Scan for drawing references in procedures
- Store relationship map for cascade analysis in Phase 2

**Step 3: Calculate Currency Baseline**
- For each document, determine currency status:
  - **Current**: Last review date + review frequency > today AND no known source document changes pending review
  - **Due for Review**: Last review date + review frequency - 90 days < today < Last review date + review frequency
  - **Overdue**: Last review date + review frequency < today
  - **Content Review Required**: Source document has been revised since last review of this document
  - **Missing Review Date**: No review date recorded -- flag for immediate attention
- Calculate overall currency percentages by type, area, discipline, owner
- Establish baseline metrics for trend tracking
- Identify highest-risk gaps (safety-critical documents that are overdue)

### Phase 2: Continuous Monitoring & Alerting (Steps 4-6)

**Step 4: Daily Automated Scan**
- Run daily scan of document management system for:
  - Documents newly past their review due date (transition from "Due" to "Overdue")
  - Documents approaching review due date thresholds (90/60/30 days)
  - Source document revisions that trigger cascade reviews
  - New documents added to DMS requiring registration in MDR
  - Documents removed or archived requiring MDR update
  - Owner changes (personnel who left the organization whose documents need reassignment)
- Log scan results and compare with previous day to identify changes

**Step 5: Generate Graduated Alerts**
- For documents approaching or past review due date:
  - **90 days before due**: Generate courtesy notification to document owner
    - Low urgency, informational tone
    - Include link to document in DMS
    - Suggest scheduling review in work plan
  - **60 days before due**: Generate reminder with review initiation link
    - Medium urgency
    - Include estimated review effort (hours) based on document type and size
    - Copy department coordinator for planning
  - **30 days before due**: Generate urgent reminder
    - High urgency
    - Warning that non-compliance escalation will occur if not initiated
    - Copy department manager
  - **On due date (0 days)**: Generate overdue notification
    - Escalation to department manager
    - Include regulatory non-compliance risk statement
    - Request action plan with completion date
  - **30 days overdue**: Generate senior management escalation
    - Copy plant manager or operations director
    - Include cumulative compliance impact
  - **90 days overdue**: Generate executive escalation
    - Formal memo to site leadership
    - Include regulatory penalty risk assessment
    - Request immediate resource allocation

**Step 6: Change Cascade Analysis**
- When a source document revision is detected:
  - Query the document relationship map (Step 2) to identify all dependent documents
  - Generate change cascade report showing:
    - Source document: what changed and why
    - Affected documents: list of all documents referencing the source
    - Impact assessment: which affected documents likely need content updates vs. review-only
    - Priority: safety-critical documents first, then operational, then informational
  - Initiate review workflows for affected documents
  - Track completion of cascade reviews until all affected documents are confirmed current

### Phase 3: Reporting & Compliance (Steps 7-10)

**Step 7: Generate Weekly Currency Report**
- Compile weekly summary showing:
  - Overall currency percentage (vs. target and trend)
  - New overdue documents this week
  - Documents brought current this week
  - Upcoming reviews next 30 days
  - Highest-risk overdue documents (safety-critical)
  - Department compliance ranking
- Distribute to operations leadership and department managers (via mcp-outlook)
- Publish to SharePoint dashboard (via mcp-sharepoint)

**Step 8: Generate Monthly Management Report**
- Comprehensive monthly report including:
  - Currency trend analysis (12-month rolling graph)
  - Compliance rate by OSHA PSM category
  - Department performance comparison
  - Resource requirements to close overdue backlog
  - Projected timeline to achieve 95% currency target at current rate
  - Cost of non-compliance: estimated regulatory penalty exposure
  - Top 10 highest-risk overdue documents with impact assessment
- Include actionable recommendations for management

**Step 9: Pre-Audit Compliance Assessment**
- When triggered before a regulatory audit or internal audit:
  - Generate comprehensive compliance snapshot
  - Map each auditable requirement to documentation evidence
  - Identify gaps that auditors are likely to find
  - Prioritize gap closure activities by regulatory risk
  - Generate audit-ready document index with current status
  - Prepare response narratives for known non-conformances

**Step 10: Trend Analysis & Continuous Improvement**
- Analyze 12-month trends to identify:
  - Chronic problem areas (departments or document types consistently low)
  - Root causes: insufficient resources, unclear ownership, process failures
  - Seasonal patterns (e.g., currency drops during turnaround periods)
  - Effectiveness of interventions (did management attention improve compliance?)
- Generate improvement recommendations:
  - Resource allocation suggestions
  - Process improvements (e.g., stagger review dates to avoid bottlenecks)
  - Technology improvements (e.g., automated content comparison tools)
  - Training needs (document owners who consistently miss deadlines)

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Document inventory completeness (MDR vs. DMS reconciliation) | 100% | >98% |
| Automated scan coverage (% of documents scanned daily) | 100% | >99% |
| Alert delivery accuracy (correct recipients, correct thresholds) | 100% | >99% |
| Cross-reference map coverage (% of relationships identified) | >90% | >80% |
| Weekly report delivery timeliness | Every Monday 08:00 | Within 24 hours |
| PSM operating procedure currency rate | >95% | >90% |
| Overall document currency rate | >90% | >85% |
| Orphaned document resolution time | <30 days | <60 days |
| Change cascade identification time | <24 hours from source change | <48 hours |
| False positive rate (incorrectly flagged as outdated) | <2% | <5% |

### Qualitative Standards

- **Accuracy**: Currency assessments must be factually correct. A document flagged as "overdue" must genuinely be past its review date. False positives erode trust in the system.
- **Actionability**: Every alert must include specific actions the recipient should take, estimated effort, and deadline. Alerts without clear next steps are ignored.
- **Proportionality**: Alert escalation must match risk. A low-criticality document 30 days overdue should not generate the same alarm as a safety-critical SOP 180 days overdue.
- **Completeness**: The system must account for ALL controlled documents. Unknown gaps are the most dangerous -- the system must actively seek out unregistered or untracked documents.
- **Transparency**: Document owners must be able to see their compliance status at any time, not just when they receive alerts. Self-service dashboards are essential.

### Validation Process
1. Monthly reconciliation of MDR against DMS (detect unregistered documents)
2. Quarterly cross-reference map validation (sample 10% of relationships for accuracy)
3. Alert delivery audit (verify alerts sent to correct recipients at correct thresholds)
4. Annual review of review frequencies against current regulatory requirements
5. Post-audit comparison (were audit findings consistent with currency report findings?)

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-vendor-documentation` (DOC-01) | Vendor document register | Provides register of vendor documents that require ongoing currency tracking post-handover |
| `generate-operating-procedures` (DOC-02) | Procedure register | Provides register of all generated procedures with review dates and owners |
| `manage-moc-workflow` (DOC-05) | MOC affected document lists | Provides lists of documents affected by Management of Change actions requiring review |
| Agent 1 - Project Management | P&ID revision notifications | Notifies when P&IDs are revised, triggering cascade analysis |
| Agent 5 - Maintenance | Equipment modification records | Provides records of equipment changes that may affect document currency |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `prepare-pssr-package` (DOC-04) | Currency verification | Verifies that all documents in a PSSR package are current before submission |
| `audit-compliance-readiness` (COMP-04) | Compliance status | Provides documentation currency data for pre-audit compliance assessments |
| `generate-operating-procedures` (DOC-02) | Rewrite triggers | Identifies procedures that need major rewrite vs. minor review |
| Agent 3 - Operations | Operator access | Ensures operators always access current document versions |
| Agent 6 - Compliance | Regulatory evidence | Provides documentation currency evidence for regulatory compliance demonstrations |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `manage-moc-workflow` (DOC-05) | Bidirectional | MOC triggers document reviews; document currency status informs MOC impact assessments |
| `map-regulatory-requirements` (COMP-01) | Regulatory alignment | Regulatory requirement changes may alter document review frequency requirements |

  #  Document No.        Title                                Days    Risk
  1  SOP-100-001         SAG Mill Startup Procedure           312     CRITICAL
  2  EOP-200-003         Loss of Cooling Water - Flotation    287     CRITICAL
  3  SOP-300-002         Thickener Operation                  245     HIGH
  4  SWP-HSE-015         Confined Space Entry - Tanks         234     CRITICAL
  5  EOP-100-005         SAG Mill Emergency Stop Recovery     210     CRITICAL
  6  HAZOP-100-Rev5      Grinding Circuit HAZOP Revalidation  198     HIGH
  7  SOP-400-001         Filtration Plant Startup             187     HIGH
  8  SOP-100-003         Ball Mill Startup Procedure          176     HIGH
  9  EOP-500-001         Tailings Pipeline Rupture Response   165     CRITICAL
  10 SWP-HSE-008         Hot Work Procedure - Process Area    156     HIGH

CHANGE CASCADE ANALYSIS (Last 30 Days):
  Source Change:  P&ID-100-001 Rev D -> Rev E (Added temperature instrument TI-100-025)
  Affected:       3 documents require review
    - SOP-100-001 (SAG Mill Startup) - STATUS: ALREADY OVERDUE
    - SOP-100-002 (SAG Mill Normal Operation) - STATUS: REVIEW INITIATED
    - EDS-100-ML-001 (SAG Mill Data Sheet) - STATUS: PENDING

MONTHLY REVIEW ACTIVITY:
  Reviews completed this month:        45
  Reviews initiated this month:        62
  Average review duration:             12 days
  Reviews overdue for completion:      18

DEPARTMENT COMPLIANCE RANKING:
  1. Electrical & Instrumentation:  91.2%  [AMBER]
  2. Process Engineering:           87.5%  [AMBER]
  3. Mechanical Maintenance:        83.4%  [RED]
  4. Operations - Area 100:         79.8%  [RED]
  5. Operations - Area 200:         77.2%  [RED]
  6. HSE Department:                76.1%  [RED]

ACTIONS REQUIRED:
  1. IMMEDIATE: Review and update SOP-100-001 (312 days overdue, safety-critical)
  2. IMMEDIATE: Review EOP-200-003 and EOP-100-005 (emergency procedures, 287/210 days overdue)
  3. URGENT: Reassign 23 orphaned documents from departed personnel
  4. PLAN: Schedule 34 SOP reviews due in next 90 days across Operations team
  5. RESOURCE: Estimated 680 person-hours needed to clear overdue backlog
```

### Example Alert Email (30-Day Urgent Reminder)

```
TO: carlos.mendez@minera.cl (Document Owner)
CC: patricia.silva@minera.cl (Operations Manager)
SUBJECT: URGENT - Document Review Due in 30 Days: SOP-200-001 Flotation Circuit Startup

Dear Carlos,

This is an urgent reminder that the following document is due for annual review
in 30 days:

  Document:    SOP-200-001
  Title:       Flotation Circuit - Normal Startup Procedure
  Type:        Standard Operating Procedure (PSM-regulated)
  Current Rev: Rev 3 (approved 2025-03-17)
  Review Due:  2026-03-17
  Days Until Due: 30

REGULATORY NOTE: This document is subject to OSHA 29 CFR 1910.119(f)(1) annual
certification requirement. Failure to complete review by the due date constitutes
a regulatory non-conformance.

ADDITIONAL NOTE: Since the last review, the following source documents have been
revised and may require corresponding updates to this procedure:
  - P&ID-200-001 (Rev C -> Rev D, dated 2025-09-22): Added bypass valve XV-200-025
  - Control Narrative CN-200-001 (Rev 2 -> Rev 3, dated 2025-11-10): Modified startup sequence

Estimated review effort: 8-12 hours (based on document size and scope of source changes)

Please initiate the review workflow by clicking the link below:
[INITIATE REVIEW] -> {SharePoint workflow link}

If you are unable to complete this review by the due date, please notify your
manager and the Document Control team immediately to arrange alternative resources.

Regards,
OR System - Document Currency Tracker (Agent 2)
```

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
