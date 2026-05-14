---
name: track-punchlist-items
description: "Track and manage punch list items during commissioning and handover. Triggers: 'punch list', 'punchlist', 'lista de pendientes'."
---

# Track Punch List Items

## Skill ID: R-02
## Version: 1.0.0
## Category: R. Commissioning Intelligence
## Priority: P2 - Medium

---

## Purpose

Track and manage punch list items from construction walkthroughs through mechanical completion, pre-commissioning, commissioning, and operational acceptance, providing a unified database that classifies, prioritizes, assigns, and drives to closure every deficiency identified throughout the turnover process. This skill ensures that the thousands of punch list items generated during a megaproject's final phases are systematically captured, categorized by severity (A/B/C classification), assigned to responsible parties with target dates, photographically documented, progress-tracked in real time, and escalated when resolution stalls -- preventing the single most common cause of delayed project handover.

Unresolved punch list items are the number one cause of delayed handover in capital projects (Pain Point **OG-01**). The average megaproject generates between 5,000 and 50,000 individual punch items during the construction-to-operations transition phase (IPA Benchmarking, 2022; CII Research Summary 212-11). A 2021 study by McKinsey & Company found that punch list management inefficiency accounts for 15-25% of the total delay experienced during the final 20% of project execution, with the average megaproject carrying 2,000-4,000 unresolved punch items at the point where commissioning should begin. Each unresolved Category A punch item (safety-critical or preventing energization) delays the entire commissioning sequence for its associated system, creating a cascading schedule impact that propagates through the commissioning logic network.

The root causes of punch list management failure are well-documented and systemic. First, punch items are generated from multiple sources -- construction QC walkthroughs, client inspections, pre-commissioning testing, commissioning testing, PSSR walkthroughs, and operational readiness reviews -- but are often tracked in disconnected spreadsheets, email threads, and paper forms that cannot provide a unified status view. Second, the sheer volume of items (often exceeding 10,000 for large projects) overwhelms manual tracking methods, leading to items being lost, duplicated, or mis-classified. Third, the A/B/C classification system is critical for sequencing close-out efforts but is inconsistently applied: items classified as Category C (deferrable) that are actually Category A (must fix before energization) create false confidence in system readiness. Fourth, photo documentation is frequently incomplete or disconnected from the punch item database, making it impossible for reviewers to assess severity remotely or verify close-out without physical re-inspection.

The financial impact is substantial. Industry data indicates that the cost of resolving a punch item increases 3-5x once a system has been turned over to operations (due to operational constraints, permitting requirements, and production loss during repairs). A project that defers 500 Category B items to operations instead of resolving them during construction faces $2-10 million in incremental close-out costs plus ongoing operational risk. OSHA enforcement data shows that unresolved safety-related punch items (Category A) discovered during PSSR represent the most common PSSR failure mode, accounting for 35-40% of PSSR "Not Approved" decisions (OSHA PSM audit data, 2020-2023). This skill eliminates these failure modes by providing a centralized, photographically documented, classification-enforced, real-time tracked punch list management system.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | R-02                                                                                        |
| **Agent**              | Agent 8 -- Commissioning Intelligence                                                        |
| **Domain**             | Commissioning Intelligence                                                                   |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | Medium-High                                                                                  |
| **Estimated Duration** | Setup: 3-5 days; Execution: continuous throughout commissioning (typically 6-18 months)       |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | OG-01: Unresolved punch list items are #1 cause of delayed handover (IPA, 2022)           |
| **Secondary Pain**     | MP-03: 60% of commissioning delays from incorrect sequencing (punch items as hidden blockers)|
| **Value Created**      | Reduce handover delay by 30-50%; reduce post-turnover punch close-out cost by 60-80%         |

### Functional Intent

This skill SHALL:

1. **Centralize Punch List Data**: Maintain a single, authoritative punch list database that consolidates items from all sources (construction walkthroughs, QC inspections, pre-commissioning tests, commissioning tests, PSSR walkthroughs, client inspections, regulatory inspections) into a unified, searchable, filterable repository with no duplicate entries and complete traceability from identification to close-out.

2. **Enforce A/B/C Classification**: Apply rigorous, standards-based classification to every punch item using the three-tier severity system: Category A (must resolve before mechanical completion acceptance or energization -- safety-critical and code violations), Category B (must resolve before process fluid introduction or startup -- functional deficiencies), and Category C (may defer to operations -- cosmetic, minor, or items that do not affect safe startup). Classification must be validated against ASME/OSHA/company-specific criteria, not left to subjective field judgment.

3. **Manage Photo Documentation**: Require and store photographic evidence for every punch item at identification and at close-out, creating a visual audit trail that enables remote severity assessment, close-out verification without physical re-inspection, and historical documentation for dispute resolution.

4. **Track Progress to Closure**: Provide real-time tracking of punch item resolution from identification through assignment, action, verification, and close-out, with automated escalation when items exceed their target resolution dates, daily/weekly status reporting, and trend analysis to forecast close-out completion.

5. **Generate Priority Dashboards**: Produce interactive dashboards showing punch item status by system, area, classification, responsible party, age, and trend, enabling commissioning management to make data-driven decisions about resource allocation, system turnover readiness, and handover timing.

6. **Support Handover Certification**: Generate system-level and project-level punch list close-out certificates that provide formal evidence of deficiency resolution for PSSR packages, mechanical completion certificates, and operational acceptance documentation.

---

## Trigger / Invocation

### Direct Invocation

```
/track-punchlist-items --project [name] --action [create|update|report|dashboard|certificate]
```

### Command Variants
- `/track-punchlist-items create --project [name] --system [system_code]` -- Create new punch list items
- `/track-punchlist-items update --project [name] --item [item_id]` -- Update existing item status
- `/track-punchlist-items report --project [name] --format [xlsx|pdf|dashboard]` -- Generate status report
- `/track-punchlist-items dashboard --project [name]` -- Display interactive dashboard
- `/track-punchlist-items certificate --project [name] --system [system_code]` -- Generate close-out certificate
- `/track-punchlist-items escalate --project [name]` -- Trigger escalation for overdue items

### Aliases
- `/punchlist`, `/punch-list`, `/deficiency-tracker`, `/snag-list`, `/lista-pendientes`, `/punch`

### Natural Language Triggers (EN)
- "Add a new punch list item for system X"
- "What is the punch list status for the grinding circuit?"
- "How many Category A items are still open?"
- "Show me overdue punch items"
- "Generate a punch list close-out certificate for system 100"
- "Who has the most open punch items assigned to them?"

### Natural Language Triggers (ES)
- "Agregar un nuevo item de punch list para el sistema X"
- "Cual es el estado del punch list del circuito de molienda?"
- "Cuantos items Categoria A siguen abiertos?"
- "Mostrar items de punch vencidos"
- "Generar certificado de cierre de punch list para sistema 100"

### Contextual Triggers
- Construction walkthrough completed (batch punch item creation)
- Pre-commissioning test completed with deficiencies (automatic item generation from test results)
- System approaching MC milestone (T-14 days triggers punch list status assessment)
- PSSR preparation initiated (triggers punch item close-out acceleration for the system)
- Weekly reporting cycle (automatic weekly status report generation)
- Item exceeds target date (automatic escalation notification)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_code` | text | User | Project identifier for database organization and file naming |
| `system_list` | .xlsx | Commissioning / R-01 output | List of commissioning systems with codes, names, and boundary definitions for organizing punch items by system |
| `punch_item_data` | form / .xlsx / photo | Field inspectors / walkthrough teams | Individual punch item details: location, description, classification, photo, responsible party. Can be entered via form (single item), bulk upload (xlsx), or mobile capture |
| `responsible_party_register` | .xlsx | Project management | List of contractors, vendors, and internal teams who can be assigned punch items, with contact information and discipline specialties |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `construction_completion_status` | .xlsx | Construction management | Current construction completion percentage by system/area for context on expected punch item volumes |
| `commissioning_schedule` | .xlsx | R-01 output / mcp-project-online | Commissioning sequence model for aligning punch item target dates with commissioning milestones |
| `equipment_list` | .xlsx | `create-asset-register` | Equipment register for linking punch items to specific equipment tags |
| `contract_scope_matrix` | .xlsx | Procurement / Contracts | Contractor scope boundaries for automatic assignment routing |
| `previous_project_punch_data` | .xlsx | Knowledge base / mcp-sharepoint | Historical punch list data from similar projects for benchmarking and trend prediction |
| `classification_criteria` | .docx | Company standards | Project-specific A/B/C classification criteria (if different from default ASME/OSHA-based criteria) |
| `photos` | .jpg / .png | Field capture / mcp-sharepoint | Photographic evidence for punch items (at identification and at close-out) |

### Context Enrichment

The skill automatically enriches inputs by:
- Querying `model-commissioning-sequence` (R-01) for system milestone dates to set default target resolution dates
- Retrieving equipment details from `create-asset-register` for tag-level punch item context
- Cross-referencing with `prepare-pssr-package` (DOC-04) for PSSR readiness assessment
- Checking `manage-loop-checking` (R-03) for instrumentation-related punch items from loop check failures
- Querying project-database for current punch list database status

### Input Validation Rules

```yaml
validation:
  punch_item:
    required_fields: ["item_id", "system_code", "location", "description", "classification", "responsible_party", "target_date"]
    classification_values: ["A", "B", "C"]
    photo_required: true
    description_min_length: 20
    target_date_must_be_future: true
  system_list:
    required_columns: ["system_code", "system_name", "area", "mc_target_date"]
    system_code_format: "SYS-[A-Z0-9]{3,6}"
  responsible_party:
    required_columns: ["party_code", "party_name", "discipline", "contact_email"]
    must_have_active_contract: true
```

---

## Output Specification

### Deliverable 1: Punch List Database (.xlsx / Airtable)

**Filename**: `{ProjectCode}_Punchlist_Database_v{Version}_{YYYYMMDD}.xlsx`

**Database Structure**:

#### Sheet 1 / Table: "Punch List Master"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Item_ID | Unique punch item identifier | PL-CA2026-00001 |
| B | System_Code | Commissioning system | SYS-200-GRIND |
| C | Area | Plant area | Area 200 - Grinding |
| D | Location | Specific location description | SAG Mill 200-ML-001, drive end bearing housing |
| E | Equipment_Tag | Equipment tag (if applicable) | 200-ML-001 |
| F | Discipline | Mechanical / Piping / Electrical / Instrument / Civil / Structural / HSE | Mechanical |
| G | Description | Detailed deficiency description (min 20 chars) | Foundation bolt on drive end bearing pedestal not torqued to specification. Vendor spec requires 850 Nm, measured 620 Nm. |
| H | Classification | A / B / C | A |
| I | Classification_Basis | Rationale for classification | Category A: Equipment cannot be safely operated with undertorqued foundation bolts. Vibration risk and potential catastrophic bearing failure. |
| J | Source | How the item was identified | MC Walkthrough - 2026-05-15 |
| K | Identified_By | Person who identified the item | J. Martinez, QC Inspector |
| L | Identification_Date | Date item was identified | 2026-05-15 |
| M | Photo_ID_Ref | Photo reference at identification | IMG-PL-00001-ID.jpg |
| N | Responsible_Party | Assigned responsible contractor/team | ABC Mechanical Contractors |
| O | Responsible_Contact | Contact person | M. Rodriguez, Superintendent |
| P | Target_Date | Target resolution date | 2026-05-22 |
| Q | Priority | Numeric priority (1=Highest within classification) | 1 |
| R | Status | Open / In Progress / Resolved / Verified / Closed / Rejected | Open |
| S | Resolution_Description | How the item was resolved | Foundation bolts re-torqued to 850 Nm per vendor spec. Torque wrench cert #TW-2026-045. |
| T | Resolution_Date | Date resolution was completed | |
| U | Photo_Closeout_Ref | Photo reference at close-out | |
| V | Verified_By | Person who verified close-out | |
| W | Verification_Date | Date close-out was verified | |
| X | Days_Open | Calendar days from identification to closure | |
| Y | Days_Overdue | Calendar days past target date (0 if on time) | |
| Z | Escalation_Level | None / Level 1 (supervisor) / Level 2 (manager) / Level 3 (director) | None |
| AA | Notes | Additional notes, cross-references, history | |
| AB | STP_Reference | System Turnover Package reference | STP-SYS200-GRIND |
| AC | PSSR_Impact | Does this item affect PSSR? (Yes/No) | Yes - Category A must be closed before PSSR |

#### Sheet 2: "Classification Criteria Reference"

| Classification | Criteria | Examples | Resolution Gate |
|---------------|----------|----------|----------------|
| **A - Safety Critical** | Items that pose a direct safety hazard, violate code requirements, or prevent safe energization/operation. MUST be resolved before MC acceptance or energization. | Missing safety guard on rotating equipment; Pressure relief valve not installed; Structural deficiency affecting load capacity; Electrical code violation; Missing fire protection | Before MC acceptance and system energization |
| **B - Pre-Startup Required** | Items that affect system functionality, performance, or compliance but do not pose an immediate safety hazard. MUST be resolved before process fluid introduction or sustained operation. | Instrument not calibrated; Control valve not stroking to spec; Insulation incomplete; Paint/coating deficiency affecting corrosion protection; Vendor documentation not delivered | Before startup / process introduction |
| **C - Deferrable to Operations** | Items that are cosmetic, minor, or can be safely managed during operations without affecting safety or sustained performance. MAY be deferred to operations with documented acceptance. | Touch-up paint; Minor concrete surface defects; Landscape/drainage grading; Signage/labeling incomplete; Spare parts not yet received (non-critical) | During first 90 days of operations or as agreed |

#### Sheet 3: "Escalation Protocol"

| Days Overdue | Escalation Level | Action | Notification Recipients |
|-------------|-----------------|--------|------------------------|
| 0-3 days | Level 0 - Awareness | Automated reminder to responsible party | Responsible contact |
| 4-7 days | Level 1 - Supervisor | Escalation to contractor/team supervisor | Responsible contact + supervisor + commissioning coordinator |
| 8-14 days | Level 2 - Manager | Escalation to contractor/department manager | All Level 1 + commissioning manager + project manager |
| 15+ days | Level 3 - Director | Escalation to project director with formal notice | All Level 2 + project director + contract administrator |
| 21+ days (Cat A only) | Level 4 - Executive | Executive escalation with schedule impact assessment | All Level 3 + VP Operations + VP Projects |

### Deliverable 2: Priority Dashboard (Power BI / Airtable Dashboard)

**Dashboard Components**:

1. **Executive Summary Panel**
   - Total punch items: Open / In Progress / Closed (donut chart)
   - Category breakdown: A / B / C (stacked bar)
   - Trend line: items opened vs. closed per week (area chart)
   - Forecast: projected close-out date at current velocity

2. **System Readiness View**
   - System-by-system punch item status (horizontal bar chart with RAG coding)
   - Systems approaching MC milestone with open Category A count (alert table)
   - PSSR readiness indicator per system (traffic light)

3. **Responsible Party Performance**
   - Open items by responsible party (bar chart sorted by count)
   - Overdue items by responsible party (highlighted table)
   - Average resolution time by responsible party (benchmark comparison)

4. **Aging Analysis**
   - Item age distribution: 0-7 days / 8-14 days / 15-30 days / 30+ days (histogram)
   - Overdue items heat map by system and responsible party
   - Escalation status summary

5. **Trend Analysis**
   - Weekly open/close rate with burn-down forecast
   - Classification distribution trend (detecting classification drift)
   - Failure mode Pareto (what types of deficiencies recur most)
   - S-curve: cumulative items identified vs. cumulative items closed

### Deliverable 3: Weekly Status Report (.docx)

**Filename**: `{ProjectCode}_Punchlist_Weekly_Report_{YYYYMMDD}.docx`

**Document Structure (5-8 pages)**:

1. **Executive Summary** (1 page)
   - Period covered
   - Key statistics: opened, closed, net change, total open
   - Category A status (CRITICAL: must be zero before energization)
   - Top 3 risks/issues

2. **Statistics Dashboard** (1-2 pages)
   - Summary table by system
   - Summary table by classification
   - Summary table by responsible party
   - Trend charts (opened vs. closed per week)

3. **Category A Focus** (1 page)
   - Every open Category A item listed with status, owner, and target date
   - Category A items closed this period
   - Impact assessment on commissioning schedule

4. **Overdue Items** (1-2 pages)
   - All overdue items with days overdue, escalation level, and mitigation
   - Responsible party performance ranking
   - Escalation actions taken this period

5. **Look-Ahead** (1 page)
   - Systems approaching MC milestone in next 2 weeks
   - Expected punch item close-out volume next week
   - Resource requirements for close-out acceleration
   - Risks and mitigations

### Deliverable 4: Close-Out Certificate (.docx)

**Filename**: `{ProjectCode}_Punchlist_Closeout_Certificate_{SystemCode}_{YYYYMMDD}.docx`

**Certificate Structure (3-5 pages)**:

1. **Certificate Header**
   - Project name and code
   - System code and name
   - Certificate date and reference number
   - Certificate type: MC Close-Out / Pre-Comm Close-Out / Full Close-Out

2. **Punch List Summary**
   - Total items identified for this system
   - Items closed: count and percentage
   - Items deferred to operations (Category C only, with documented acceptance)
   - Zero open Category A items (mandatory for certificate issuance)
   - Zero open Category B items (mandatory for startup close-out certificate)

3. **Deferred Items Register** (if any Category C items deferred)
   - Each deferred item with justification for deferral
   - Accepted risk statement
   - Target resolution date during operations
   - Operations manager acceptance signature

4. **Sign-Off Block**
   - Construction manager signature (certifying all construction punch items resolved)
   - Commissioning manager signature (certifying all commissioning punch items resolved)
   - Operations manager signature (accepting any deferred items)
   - HSE manager signature (certifying no outstanding safety items)
   - Project manager signature (overall approval)

### Formatting Standards
- Classification color coding: Category A = Red (#CC0000), Category B = Amber (#FF8C00), Category C = Green (#008000)
- Status colors: Open = Red, In Progress = Amber, Resolved = Light Green, Verified = Green, Closed = Dark Green, Rejected = Gray
- Overdue items: Bold text with red background highlight
- Header row: Bold, navy background (#001F3F), white font
- Photos: embedded thumbnails in database with hyperlinks to full-resolution images
- Freeze panes on header row and Item_ID column
- Data validation dropdowns for Classification, Status, Discipline, and Responsible Party
- Conditional formatting for Days_Overdue (green <0, amber 1-7, red >7)

---

## Methodology & Standards

### Primary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| ASME Mechanical Completion Definitions | ASME standards for what constitutes mechanical completion | Defines the boundary between construction punch (pre-MC) and commissioning punch (post-MC) |
| OSHA 29 CFR 1910.119(i) | Pre-Startup Safety Review Requirements | Category A punch items must be closed before PSSR approval; establishes safety-critical classification criteria |
| NORSOK Z-007 | Mechanical Completion and Commissioning | System turnover package punch list management protocols and classification framework |
| IEC 62337:2012 | Commissioning of Electrical, Instrumentation and Control Systems | Commissioning deficiency identification and resolution protocols for E&I systems |

### Secondary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| API RP 750 | Management of Process Hazards | Safety-critical deficiency identification criteria for process facilities |
| ISO 19011 | Guidelines for Auditing Management Systems | Audit-based deficiency identification methodology applicable to walkthroughs |
| CII RT-212 | Commissioning and Startup Best Practices | Industry benchmarking data for punch list volumes, resolution rates, and close-out timelines |
| OSHA 29 CFR 1926 | Construction Safety Standards | Safety-related deficiency classification for construction phase punch items |

### Key Frameworks
- **A/B/C Classification System**: Industry-standard three-tier severity classification used by major EPC contractors (Bechtel, Fluor, Worley, SNC-Lavalin) and owner organizations. Category A items are non-negotiable safety/code requirements; Category B items are functional requirements for startup; Category C items are deferrable to operations.
- **NORSOK Z-007 Handover Model**: Defines the punch list management protocol within the system turnover process, including requirements for punch list freeze (no new items after a defined cutoff date without formal approval), backlog management, and close-out certification.
- **CII Deficiency Resolution Cost Model**: Industry research showing that deficiency resolution cost escalates 3-5x after system turnover to operations, providing the economic justification for aggressive pre-turnover close-out.

### Industry Statistics

| Statistic | Source | Year |
|-----------|--------|------|
| Average megaproject generates 5,000-50,000 punch items | IPA Benchmarking | 2022 |
| Unresolved punch items are #1 cause of delayed handover | IPA / CII | 2022 |
| 15-25% of final project delay is attributable to punch list inefficiency | McKinsey & Company | 2021 |
| Deficiency resolution cost escalates 3-5x after turnover to operations | CII Research | 2020 |
| 35-40% of PSSR "Not Approved" decisions due to open Category A items | OSHA PSM audit data | 2023 |
| Average punch item resolution time: 7-14 days (construction), 30-90 days (operations) | Industry benchmark | 2022 |
| Photo documentation reduces close-out verification time by 60% | ARC Advisory Group | 2021 |
| Centralized punch list tracking reduces duplicate entries by 40-50% | EPC contractor data | 2023 |

---

## Step-by-Step Execution

### Phase 1: Setup and Protocol Establishment (Steps 1-3)

**Step 1: Establish Punch List Creation Protocol**
- Configure the punch list database in project-database with all required fields per the output specification
- Define project-specific A/B/C classification criteria (customize default criteria based on project type, regulatory environment, and client requirements)
- Establish unique item numbering convention: `PL-{ProjectCode}-{5-digit sequence}` (e.g., PL-CA2026-00001)
- Configure photo upload protocol: mandatory identification photo, mandatory close-out photo, naming convention aligned with item ID
- Define walkthrough protocols: who can create items, minimum description quality, mandatory fields
- Create mobile data capture forms (via project-database forms) for field use
- Distribute punch list creation protocol to all stakeholders (construction, commissioning, operations, QC, HSE)
- Conduct training session for all punch list contributors on classification criteria and data entry standards

**Step 2: Classify Items Using A/B/C System**
- For each new punch item entered in the database:
  - Apply classification criteria based on the deficiency type and its impact on safety, functionality, and compliance
  - Validate classification: Category A items must cite a specific safety standard, code requirement, or regulatory obligation
  - Category B items must describe a specific functional or performance impact
  - Category C items must confirm no safety, functional, or compliance impact
  - Cross-reference classification with `prepare-pssr-package` (DOC-04) PSSR checklist requirements
- Implement classification review workflow:
  - Field inspector proposes initial classification
  - Commissioning coordinator reviews and validates within 24 hours
  - Disputed classifications escalated to commissioning manager for final determination
  - All classification changes logged with rationale (audit trail)
- Run automated classification validation checks:
  - Items containing keywords "safety," "guard," "interlock," "relief," "emergency" flagged for Category A review
  - Items containing keywords "calibration," "alignment," "leak," "performance" flagged for Category B review
  - No item may be classified Category C without a positive statement that it does not affect safety or startup

**Step 3: Document with Photography**
- For each punch item at identification:
  - Capture photograph showing the deficiency clearly with context (surrounding equipment visible)
  - Include measurement reference where applicable (ruler, tape measure visible in photo)
  - Capture tag number or location marker in the photograph
  - Upload photo to mcp-sharepoint (punch list photo library) with naming convention: `IMG-{Item_ID}-ID-{sequence}.jpg`
  - Link photo to the punch item record in project-database
- For each punch item at close-out:
  - Capture photograph showing the completed repair/correction
  - Photo must show the same angle/perspective as the identification photo for comparison
  - Upload to mcp-sharepoint with naming convention: `IMG-{Item_ID}-CO-{sequence}.jpg`
  - Link close-out photo to the punch item record
- Store all photos in mcp-sharepoint organized by system and item ID

### Phase 2: Assignment and Tracking (Steps 4-7)

**Step 4: Assign Responsible Parties**
- For each punch item, determine the responsible party:
  - Construction deficiencies: assign to the responsible construction contractor per the contract scope matrix
  - Vendor equipment deficiencies: assign to the equipment vendor per the purchase order warranty terms
  - Design deficiencies: assign to the engineering team for redesign/resolution
  - Commissioning-discovered deficiencies: assign based on root cause (contractor workmanship, vendor equipment, or design)
- Automatic assignment routing: use the contract scope matrix to auto-suggest responsible party based on system, discipline, and equipment tag
- Notify responsible party via mcp-outlook with:
  - Item details (ID, description, classification, location, photo)
  - Target resolution date
  - Required resolution evidence (close-out photo, test certificate, inspection record)
  - Escalation protocol (what happens if target date is missed)
- Track assignment acceptance: responsible party must acknowledge receipt within 48 hours

**Step 5: Set Target Dates**
- Assign target resolution dates based on classification and commissioning schedule:
  - **Category A items**: Target = MC milestone date for the system minus 7 days (must be closed before MC acceptance)
  - **Category B items**: Target = Commissioning start date for the system minus 3 days (must be closed before commissioning)
  - **Category C items**: Target = TCCC date for the system or 90 days post-startup (whichever is agreed)
- For items identified during commissioning (post-MC):
  - Category A: 72-hour resolution target (safety-critical, stops work)
  - Category B: 7-day resolution target
  - Category C: 30-day resolution target
- Adjust target dates when commissioning schedule changes (automatic re-calculation via link to R-01 schedule)
- Flag items where target date is earlier than reasonable resolution time (e.g., major equipment repair cannot be completed in 3 days)

**Step 6: Track Progress**
- Update punch item status in project-database as resolution progresses:
  - **Open**: Item identified, assigned, awaiting action
  - **In Progress**: Responsible party has acknowledged and begun resolution work
  - **Resolved**: Responsible party reports resolution complete, awaiting verification
  - **Verified**: Independent verification confirms resolution is acceptable (close-out photo reviewed, test results confirmed)
  - **Closed**: Formally closed with all evidence documented
  - **Rejected**: Close-out attempt rejected; returned to "Open" with rejection reason
- Calculate real-time metrics:
  - Open item count by system, classification, responsible party, discipline
  - Close-out rate: items closed per day/week, trending over time
  - Average resolution time by classification and responsible party
  - Backlog aging: distribution of open items by age bracket
  - Burn-down forecast: projected date when all items will be closed at current velocity
- Update dashboard in project-database daily (automated)
- Generate daily flash notification to commissioning management for Category A items

**Step 7: Trigger Escalations**
- Implement automated escalation protocol per the Escalation Protocol table:
  - Level 0 (0-3 days overdue): Automated email reminder to responsible contact via mcp-outlook
  - Level 1 (4-7 days overdue): Escalation email to supervisor with item details and schedule impact
  - Level 2 (8-14 days overdue): Escalation to manager with formal notice and contract reference
  - Level 3 (15+ days overdue): Escalation to project director with schedule impact assessment and potential liquidated damages reference
  - Level 4 (21+ days, Category A only): Executive escalation with full impact analysis
- Log all escalation actions in the punch item record (audit trail)
- Escalation de-escalates automatically when item status changes to "Resolved" or "Closed"
- Generate weekly escalation summary report for commissioning management

### Phase 3: Reporting and Backlog Management (Steps 8-10)

**Step 8: Generate Weekly Reports**
- Compile weekly punch list status report per the output specification:
  - Pull data from project-database for the reporting period
  - Calculate period statistics: items opened, items closed, net change
  - Generate trend charts: weekly open/close rate, cumulative S-curve
  - List all open Category A items with status narrative
  - List all overdue items with escalation status
  - Generate responsible party performance ranking
  - Identify systems approaching MC milestone with punch list readiness assessment
- Distribute report via mcp-outlook to:
  - Commissioning management (full report)
  - Construction management (items assigned to construction contractors)
  - Project management (executive summary)
  - Client representatives (summary with Category A focus)
- Store report in mcp-sharepoint (commissioning reports library)

**Step 9: Manage Backlog**
- Conduct weekly backlog review meeting (agenda generated automatically):
  - Review all Category A items (individual item review)
  - Review overdue items at Level 2+ escalation
  - Review items approaching target date (due within 7 days)
  - Identify systemic issues (same contractor repeatedly overdue, same deficiency type recurring)
  - Reallocate resources to accelerate high-priority close-out
- Analyze punch item patterns:
  - Pareto analysis: top 5 deficiency types by volume
  - Responsible party performance: who resolves fastest, who is consistently late
  - System hotspots: which systems have disproportionate punch item volumes (indicating construction quality issues)
  - Classification accuracy: sample audit of 5% of items to verify correct A/B/C classification
- Adjust resource allocation:
  - Redeploy additional crews to systems with approaching milestones and high open item counts
  - Request additional vendor support for equipment-specific deficiencies
  - Escalate systemic contractor performance issues to contract administration

**Step 10: Verify Close-Out**
- For each item reported as "Resolved":
  - Review close-out photo against identification photo
  - Verify resolution description is adequate and matches the deficiency description
  - For Category A items: require physical re-inspection by QC inspector or commissioning coordinator
  - For Category B items: accept photo evidence and test records for items that can be verified remotely; require physical verification for items requiring functional testing
  - For Category C items: accept photo evidence for close-out verification
- If verification fails:
  - Change status to "Rejected" with rejection reason
  - Notify responsible party with specific requirements for acceptable close-out
  - Reset target date (original target + 3 days)
  - Log rejection in item history
- If verification passes:
  - Change status to "Closed"
  - Record verifier name and date
  - Update system close-out statistics

### Phase 4: Certification and Handover (Steps 11-12)

**Step 11: Generate Handover Certification**
- When a system meets close-out criteria, generate the Close-Out Certificate:
  - **MC Close-Out**: All Category A items closed (zero open Category A). Category B and C may remain open.
  - **Pre-Startup Close-Out**: All Category A AND Category B items closed. Category C may remain open with documented acceptance.
  - **Full Close-Out**: All items closed OR remaining items formally deferred to operations with acceptance.
- Certificate generation validation checks:
  - Verify zero open Category A items (mandatory, non-overridable)
  - Verify zero open Category B items (for Pre-Startup and Full certificates)
  - Verify all deferred Category C items have operations manager acceptance
  - Verify all photos are linked (identification and close-out)
  - Verify all sign-off fields are populated
- Route certificate for signatures via mcp-outlook workflow:
  - Construction manager -> Commissioning manager -> Operations manager -> HSE manager -> Project manager
- Store signed certificate in mcp-sharepoint (commissioning certificates library)
- Link certificate to `prepare-pssr-package` (DOC-04) as PSSR evidence

**Step 12: Archive and Lessons Learned**
- Archive complete punch list database at project close-out:
  - Export full database from project-database to .xlsx format
  - Include all photos in a structured folder (organized by system and item ID)
  - Include all reports, certificates, and escalation records
  - Store archive in mcp-sharepoint (project close-out library)
- Generate lessons learned analysis:
  - Total punch items by project (benchmark against industry data: items per $1M project cost)
  - Resolution time statistics by classification and responsible party
  - Most common deficiency types (Pareto analysis for future project prevention)
  - Classification accuracy audit results
  - Escalation frequency and effectiveness analysis
  - Recommendations for future project punch list management improvements
- Feed lessons learned into `generate-lessons-learned` and `capture-and-classify-knowledge` (KM-01) for organizational learning

---

## Quality Criteria

### Scoring Table

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Data completeness | All required fields populated for every item | 15% | 100% | >98% |
| Photo documentation | Items with both ID and close-out photos | 15% | 100% | >95% |
| Classification accuracy | Correct A/B/C classification (sample audit) | 15% | >95% | >90% |
| Resolution timeliness | Items closed on or before target date | 15% | >80% | >70% |
| Category A close-out | Cat A items closed before system energization | 10% | 100% | 100% (non-negotiable) |
| Category B close-out | Cat B items closed before startup | 10% | 100% | >95% |
| Dashboard currency | Dashboard data refresh frequency | 5% | Real-time (<1 hour lag) | <24 hours |
| Report timeliness | Weekly report issued on schedule | 5% | 100% | >95% |
| Escalation effectiveness | Overdue items resolved within 7 days of escalation | 5% | >90% | >80% |
| Duplicate rate | Duplicate items in database | 5% | <1% | <3% |

### Automated Quality Checks

1. **Completeness check**: Flag items missing any required field (description, classification, photo, responsible party, target date)
2. **Classification validation**: Flag Category A items without specific safety/code reference in classification basis
3. **Photo linkage check**: Flag items without linked identification photo
4. **Target date feasibility**: Flag items with target date earlier than identification date + minimum resolution time
5. **Duplicate detection**: Automated comparison of new items against existing items by system, location, and description similarity (>80% text match triggers duplicate warning)
6. **Overdue alert**: Flag all items past target date without resolution
7. **Classification drift detection**: Alert if Category C percentage exceeds 60% (possible under-classification)
8. **Stale item detection**: Flag items with no status update in >14 days
9. **Close-out evidence check**: Flag items marked "Resolved" without close-out photo or resolution description
10. **Certificate eligibility check**: Verify all close-out criteria met before allowing certificate generation

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `model-commissioning-sequence` (R-01) | System definitions and commissioning milestone dates for target date calculation | Critical | project-database |
| `create-asset-register` | Equipment register for tag-level punch item context | High | mcp-sharepoint |
| `create-commissioning-plan` | Overall commissioning plan with punch list management philosophy | High | mcp-sharepoint |
| `manage-loop-checking` (R-03) | Failed loop check items fed as punch list items | High | project-database |
| Construction QC system | Construction walkthrough deficiency reports | Critical | mcp-sharepoint |
| Client/regulatory inspections | Third-party inspection findings | High | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Criticality | MCP Channel |
|-------------|----------------|-------------|-------------|
| `prepare-pssr-package` (DOC-04) | Punch list close-out status and certificates for PSSR evidence | Critical | mcp-sharepoint |
| `model-commissioning-sequence` (R-01) | Punch list readiness status affecting commissioning sequence feasibility | High | project-database |
| `track-or-deliverables` (H-02) | Punch list KPIs for OR tracking dashboard | High | project-database |
| `create-rampup-plan` | Deferred Category C item register for operations phase management | Medium | mcp-sharepoint |
| `generate-lessons-learned` | Punch list analysis and lessons for organizational learning | Medium | mcp-sharepoint |
| `create-kpi-dashboard` | Punch list statistics for project performance dashboards | Medium | mcp-sharepoint |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
