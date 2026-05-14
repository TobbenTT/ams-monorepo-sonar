# Verify Construction Quality

## Skill ID: CONST-01

## Version: 1.0.0

## Category: Construction (Agent 6 - Execution)

## Priority: P1 - Critical

---

## Purpose

Conduct systematic construction quality verification through operability walkdowns, punchlist management, and quality inspection tracking, ensuring that constructed facilities meet design specifications and are fit for commissioning and operation. Construction quality defects discovered late in the project lifecycle cost 5-10x more to remediate than those caught during construction.

This skill addresses the critical interface between construction completion and commissioning readiness. Without rigorous quality verification, defects propagate into the commissioning phase — causing delays, rework, safety incidents, and cost overruns that compound exponentially. The skill provides a structured framework for early detection and systematic resolution of construction deficiencies.

Key value drivers:
- **Cost avoidance**: Catching defects during construction vs. commissioning saves 5-10x in remediation costs
- **Schedule protection**: Systematic punchlist management prevents MC/RFSU milestone delays
- **Safety assurance**: Operability walkdowns identify safety hazards before personnel are exposed during operations
- **Contractor accountability**: Trend analysis provides objective data for contractor performance management

---

## Intent & Specification

The AI agent MUST:

1. **Operability Walkdown Protocol**: Define and track walkdown inspections where operations, maintenance, and HSE personnel inspect constructed facilities for operability issues before handover
2. **Punchlist Management**: Create, categorize (A/B/C), track, and report punchlist items from walkdowns, inspections, and commissioning activities
3. **Quality Inspection Tracking**: Monitor quality inspection results (welding, civil, structural, piping, electrical, instrumentation) and identify systemic quality issues
4. **Deficiency Trending**: Analyze deficiency data to identify patterns by contractor, discipline, area, and type to enable proactive quality intervention

### Constraints

- Category A punchlist items MUST be resolved before Mechanical Completion (MC)
- Operability walkdowns must include operations, maintenance, and HSE representatives
- Quality data must be traceable to specific location (area/system/equipment tag)
- Must integrate with progressive handover tracking
- All walkdown teams must be briefed on design intent before inspection
- Photo evidence is mandatory for all Category A and B findings
- Punchlist items must be assigned within 24 hours of identification
- Trend reports must be distributed within 48 hours of data collection period end

### Punchlist Category Definitions

| Category | Definition | Resolution Deadline | Approval Authority |
|----------|-----------|--------------------|--------------------|
| **A** | Safety-critical or operability blocker. System cannot operate safely or at all. | Before Mechanical Completion (MC) | Construction Manager + HSE Manager |
| **B** | Important deficiency affecting performance, maintainability, or code compliance. System can operate but with limitations. | Before Ready for Start-Up (RFSU) | Commissioning Manager |
| **C** | Cosmetic, minor, or non-critical items. No impact on safe operation or performance. | Before Provisional Completion (PC) | Operations Manager |

---

## VSC Failure Modes Table Reference

When documenting equipment deficiencies or construction quality issues that relate to equipment failure potential, reference the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). Construction defects that could lead to premature equipment failure MUST be classified using:

**[WHAT fails] → [Mechanism] due to [Cause]**

Examples of construction-related failure mode classification:
- "Pump bearing housing → Fatigue cracking due to misalignment from construction error"
- "Pipe flange joint → External leakage due to incorrect bolt torque during installation"
- "Motor winding → Insulation breakdown due to moisture ingress from incomplete weather protection"
- "Structural steel → Corrosion due to incomplete surface preparation before coating"
- "Instrument tubing → Vibration-induced fatigue due to inadequate support spacing"

This classification enables:
1. Traceability from construction defect to potential operational failure
2. Prioritization of punchlist items based on failure consequence
3. Integration with RCM/FMECA analyses in the Asset Management agent
4. Root cause analysis linking early-life failures back to construction quality

---

## Trigger / Invocation

### Manual Triggers

```
verify-construction-quality walkdown --area [area-id] --team [ops|maint|hse|all]
verify-construction-quality punchlist --action [create|update|report] --system [system-id]
verify-construction-quality trend --period [weekly|monthly] --groupby [contractor|discipline|area]
verify-construction-quality dashboard --view [summary|detail|mc-readiness]
verify-construction-quality export --format [xlsx|pdf|docx] --scope [area|system|project]
```

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| Construction area reaches 85% physical completion | Schedule walkdown campaign for the area | High |
| Punchlist Category A count exceeds threshold per system | Escalation alert to Construction Manager | Critical |
| Quality rejection rate exceeds 5% for any inspection category | Generate quality alert and trend analysis | High |
| Walkdown scheduled date - 5 days | Send preparation notification to walkdown team | Medium |
| Punchlist item overdue by >7 days | Escalation notification to responsible party manager | High |
| MC milestone date - 14 days | Generate MC readiness assessment per system | Critical |

---

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Construction Progress | Construction Mgmt | Yes | Physical % complete by area/system |
| Quality Inspection Records | QA/QC | Yes | Inspection results, NCRs, test certificates |
| Design Drawings | Engineering | Yes | As-designed specifications for verification |
| Walkdown Checklists | Operations/Maintenance | Yes | Operability criteria per discipline |
| Punchlist Register (existing) | Construction | No | Pre-existing punchlist if available |
| Equipment Tag Register | Engineering/Asset Mgmt | Yes | Equipment tags for traceability |
| Construction Schedule | Project Controls | Yes | MC/RFSU/PC milestone dates per system |
| Contractor Quality Plans | Contractors | Yes | Contractor-specific quality management procedures |
| Previous Walkdown Reports | Document Control | No | Historical walkdown findings for trend baseline |
| Site Environmental Conditions | HSE/Site Mgmt | No | Weather and environmental factors affecting quality |

### Input Validation Rules

1. Construction progress data must be updated within the last 7 days
2. Design drawings must be current revision (check revision register)
3. Walkdown checklists must be approved by discipline lead before use
4. Equipment tag register must match the project master equipment list (MEL)
5. Construction schedule must reflect the latest approved baseline or reforecast

---

## Output Specification

### Document 1: Operability Walkdown Report (.docx)

**Structure:**

1. **Walkdown Summary**
   - Area identification (area code, name, description)
   - Walkdown date(s) and duration
   - Team composition (names, roles, organizations)
   - Scope description (systems covered, boundaries)
   - Weather/environmental conditions during walkdown

2. **Findings by Category**
   - Category A findings (safety/operability blockers) — highlighted in red
   - Category B findings (important, pre-RFSU) — highlighted in amber
   - Category C findings (cosmetic/minor, pre-PC) — highlighted in green
   - Each finding includes: unique ID, description, location (area/system/tag), photo reference, recommended action

3. **Photo Evidence**
   - Tagged to findings with cross-references
   - Annotated with location, direction, equipment tag
   - Before/after photos where corrective action has been taken

4. **Deficiency Classification**
   - Safety deficiencies (life safety, process safety, fire protection)
   - Operability deficiencies (access, ergonomics, maintainability, operating envelope)
   - Maintainability deficiencies (access for maintenance, lifting provisions, isolation points)
   - Accessibility deficiencies (walkways, platforms, ladder access, emergency egress)

5. **Recommended Actions with Responsible Party and Due Date**
   - Each finding mapped to a responsible party (contractor/owner/vendor)
   - Due date aligned with relevant milestone (MC/RFSU/PC)
   - Estimated effort and cost for remediation
   - Risk assessment if remediation is delayed

6. **Appendices**
   - Walkdown checklist (completed, signed)
   - Attendee sign-in sheet
   - Area map with walkdown route marked
   - Reference drawings used during walkdown

### Document 2: Punchlist Register (.xlsx)

**Sheets:**

1. **Active Items**
   - All open punchlist items
   - Columns: Item ID, Date Found, System, Area, Equipment Tag, Description, Category (A/B/C), Photo Ref, Responsible Party, Due Date, Status, Days Open, Escalation Flag
   - Conditional formatting: Red for overdue, Amber for due within 7 days

2. **Resolved Items**
   - Closed items with complete resolution record
   - Columns: All active columns plus Resolution Date, Resolution Description, Verified By, Verification Date, Close-out Photo Ref

3. **Dashboard**
   - Pivot tables and charts: counts by category, area, contractor, discipline
   - Aging analysis: items by age bucket (0-7, 8-14, 15-30, 30+ days)
   - Resolution rate: items closed vs. opened per week
   - Overdue items count and trend

4. **Trend Charts**
   - Deficiency trends over time by type (line charts)
   - Contractor performance comparison (bar charts)
   - Discipline breakdown (pie charts)
   - Resolution velocity (items closed per week)

5. **MC Readiness**
   - Per-system Category A status (go/no-go for MC)
   - Traffic light summary: Green (0 Cat A), Amber (Cat A with plan), Red (Cat A no plan)
   - System-level readiness checklist
   - Projected MC date based on current resolution rate

---

## Methodology & Standards

### Primary Standards
- **ISO 19011**: Auditing management systems — applied to walkdown methodology and systematic inspection approach
- **ASME/ANSI standards**: For mechanical, piping, and vessel inspection criteria
- **IEC 61511**: Safety Instrumented Systems verification and validation during construction
- **AWS D1.1**: Structural welding code (welding quality inspection criteria)
- **ASME B31.3**: Process piping (piping quality inspection criteria)

### Industry Best Practices
- **AACE RP 96R-18**: Commissioning readiness verification — defines punchlist management best practices
- **CII RT-012**: Pre-project planning — quality management integration
- **COAA Best Practice**: Construction Owners Association of Alberta — walkdown protocols

### Client-Specific
- Client construction quality management plan
- Project-specific quality procedures and ITPs (Inspection and Test Plans)
- Contractor quality management plans

### VSC Methodology Integration
- **OR Playbook**: Construction quality verification is part of Level 5 (Commissioning & Startup) readiness
- **Progressive Handover**: Punchlist resolution gates milestone achievement
- **Quality Gates**: Construction quality metrics feed into OR Gate Reviews

---

## Step-by-Step Execution

### Step 1: Plan Walkdown Campaign

**Objective:** Establish a comprehensive walkdown plan that covers all construction areas systematically.

1. **Identify areas reaching 85%+ completion**
   - Review construction progress report (weekly update from Project Controls)
   - Filter areas by physical completion percentage
   - Prioritize areas on the critical path to MC/RFSU

2. **Schedule walkdown teams**
   - Minimum team composition: operations, maintenance, HSE, commissioning
   - Optional additional members: process engineering, electrical/instrument specialist
   - Schedule 2-4 hours per area walkdown (adjust based on area size/complexity)
   - Avoid scheduling during active construction in the area (safety)

3. **Prepare area-specific walkdown checklists**
   - Base checklist from standard template (by discipline)
   - Customize for area-specific equipment and systems
   - Include key design parameters for verification
   - Add lessons learned from previous walkdowns

4. **Brief team on design intent and operational requirements**
   - Distribute area P&IDs, layout drawings, equipment specifications
   - Explain the operational philosophy for the area
   - Highlight critical equipment and safety systems
   - Review any known construction issues or concerns

### Step 2: Execute Walkdowns

**Objective:** Conduct thorough, systematic inspections that identify all operability issues.

1. **Systematic area-by-area inspection**
   - Follow predefined walkdown route (floor-by-floor, system-by-system)
   - Use checklist to ensure comprehensive coverage
   - Inspect all equipment, piping, electrical, instrumentation, structural, civil

2. **Document findings with photos, tag numbers, GPS/area codes**
   - Take clear photos with scale reference (pen, ruler, or known object)
   - Record exact location: area code, system number, equipment tag, elevation
   - Note finding description in sufficient detail for someone not present to understand

3. **Classify each finding**
   - **Category A**: Safety/operability blocker — system CANNOT operate safely
     - Examples: missing safety guards, incomplete grounding, blocked emergency exits, missing safety showers, SIS not connected
   - **Category B**: Important, fix before RFSU — system CAN operate but with limitations
     - Examples: incorrect nameplate, missing insulation, access platform gap, incorrect paint color for safety coding
   - **Category C**: Cosmetic/minor, fix before PC — no operational impact
     - Examples: cosmetic paint damage, minor cleanup, signage corrections

4. **Record findings in punchlist register immediately**
   - Use mobile device or tablet for real-time entry
   - Auto-assign unique punchlist item ID
   - Attach photos to register entry

### Step 3: Manage Punchlist

**Objective:** Drive systematic resolution of all punchlist items aligned with project milestones.

1. **Assign each item to responsible party (contractor/owner)**
   - Determine if deficiency is contractor scope (construction defect) or owner scope (design change, operations preference)
   - Notify responsible party within 24 hours of finding
   - Obtain acknowledgment and proposed resolution date

2. **Set due dates aligned with MC/RFSU/PC milestones**
   - Category A: Due before MC milestone date (or 14 days from finding, whichever is sooner)
   - Category B: Due before RFSU milestone date
   - Category C: Due before PC milestone date
   - For critical path systems, apply accelerated timelines

3. **Track resolution status daily**
   - Daily update of punchlist register
   - Morning status meeting: review overdue items, items due today, items due this week
   - Escalation protocol: 7 days overdue → supervisor, 14 days → manager, 21 days → project director

4. **Verify completed items (re-inspect and sign off)**
   - Physical re-inspection required for all Category A items
   - Photo evidence of resolution required for Category A and B items
   - Sign-off by walkdown team member (not the person who did the work)
   - Update punchlist register with close-out details

### Step 4: Analyze Quality Trends

**Objective:** Identify systemic quality issues and enable proactive intervention.

1. **Aggregate deficiency data weekly**
   - Pull data from punchlist register, QA/QC inspection database, NCR register
   - Normalize data by construction volume (defects per 1000 man-hours or per system)

2. **Analyze by multiple dimensions**
   - **By contractor**: Which contractors have highest deficiency rates?
   - **By discipline**: Which disciplines show most issues (piping, electrical, civil, etc.)?
   - **By area**: Which areas have highest concentrations of defects?
   - **By deficiency type**: What types of defects recur most frequently?
   - **By severity**: What is the distribution of A/B/C categories?

3. **Identify systemic issues**
   - Pattern recognition: >3 similar defects from same contractor/discipline = systemic
   - Root cause analysis for systemic issues
   - Compare against industry benchmarks for deficiency rates

4. **Generate trend reports for construction management**
   - Weekly trend report with charts and analysis
   - Highlight emerging patterns before they become widespread
   - Quantify cost and schedule impact of deficiency trends

5. **Recommend corrective actions for systemic issues**
   - Contractor re-training or personnel replacement
   - Enhanced inspection hold points (increase from sample to 100%)
   - Design clarification if defects stem from unclear specifications
   - Process change if defects stem from inadequate construction methods

---

## Quality Criteria

| Criterion | Metric | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Walkdown Coverage | % of construction areas walked down before MC | 100% | Walkdown register vs. area list |
| Cat A Resolution | Category A items cleared before MC | 100% | Punchlist register |
| Cat B Resolution | Category B items cleared before RFSU | >95% | Punchlist register |
| Finding Documentation | Findings with photo evidence and tag numbers | >90% | Audit of punchlist entries |
| Trend Reporting | Weekly trend reports produced on time | 100% | Report distribution log |
| Assignment Timeliness | Findings assigned within 24 hours | >95% | Punchlist register timestamps |
| Re-inspection Rate | Completed items physically re-inspected | 100% Cat A, >80% Cat B | Close-out records |
| Escalation Compliance | Overdue items escalated per protocol | 100% | Escalation log |

### Quality Gate Checklist

Before marking this skill as complete for a given area/system, ALL of the following must be true:

- [ ] All scheduled walkdowns completed for the area
- [ ] All findings entered in punchlist register with photos
- [ ] All Category A items resolved and verified
- [ ] >95% of Category B items resolved and verified
- [ ] Trend analysis report produced for the period
- [ ] Systemic issues identified and corrective actions assigned
- [ ] MC readiness assessment updated in readiness matrix
- [ ] All walkdown reports stored in document management system

---

## MCP Integrations

### mcp-sharepoint

- **Read**: Retrieve design drawings, inspection records, quality plans, walkdown checklists, ITPs, contractor quality procedures, previous walkdown reports
- **Write**: Store walkdown reports, punchlist registers, trend analyses, photo evidence packages, quality alert notices
- **Permissions**: Read access to Engineering and QA/QC libraries; Write access to Construction Quality folder
- **Folder Structure**: `/{project}/Construction/Quality/Walkdowns/`, `/{project}/Construction/Quality/Punchlist/`, `/{project}/Construction/Quality/Trends/`

### project-database

- **Read/Write**: Punchlist database — track all items with category, status, responsible, resolution, photo links
- **Dashboard**: Real-time punchlist counts, aging analysis, MC readiness traffic lights per system
- **Views**: By area, by contractor, by discipline, by category, overdue items, due this week
- **Automations**: Send notification when item assigned, send reminder when due date approaching, send escalation when overdue
- **Base Structure**:
  - Table 1: Punchlist Items (master record)
  - Table 2: Walkdowns (walkdown events with team, area, date)
  - Table 3: Trend Data (weekly aggregated metrics)
  - Table 4: Systemic Issues (identified patterns with corrective actions)

### mcp-outlook

- **Send**: Walkdown scheduling invitations, daily punchlist status updates, Category A escalation notices, weekly trend reports
- **Calendar**: Schedule walkdown campaigns, set milestone verification dates, set escalation reminders
- **Templates**: Walkdown invitation, daily status, escalation notice, trend report cover email
- **Distribution Lists**: Walkdown teams, construction management, project management, HSE team

### mcp-jira

- **Read/Write**: Track quality NCRs and corrective actions, link punchlist items to construction work packages
- **Workflows**: NCR lifecycle (open → investigate → corrective action → verify → close)
- **Labels**: By contractor, by discipline, by severity, systemic vs. isolated
- **Dashboards**: NCR aging, resolution rate, contractor performance scorecard

---

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| agent-execution (construction) | Self | Quality verification is an integral part of construction management scope |
| agent-execution (commissioning) | Downstream | Punchlist resolution status directly feeds commissioning readiness assessment |
| track-progressive-handover.md | Downstream | Punchlist resolution gates MC/RFSU/PC milestone achievement |
| agent-operations | Bilateral | Operations team members participate in walkdowns; operations requirements drive walkdown criteria |
| agent-asset-management | Bilateral | Maintenance team members participate in walkdowns; maintainability criteria drive findings |
| agent-hse | Bilateral | HSE team participates in walkdowns; safety items receive highest priority (Cat A default) |
| verify-construction-quality.md → manage-equipment-preservation.md | Downstream | Construction defects affecting equipment integrity trigger preservation review |
| verify-construction-quality.md → certify-system-readiness.md | Downstream | Punchlist status is a prerequisite for TCCC certificate approval |

### Dependency Protocols

1. **Walkdown Team Assembly**: Agent must coordinate with Operations, Asset Management, and HSE agents to confirm walkdown team availability at least 5 business days before scheduled walkdown
2. **Finding Escalation**: Category A safety findings must be immediately communicated to HSE agent for risk assessment
3. **Handover Gate**: Agent must confirm punchlist status with track-progressive-handover.md before any milestone can be approved
4. **Commissioning Readiness**: Agent must provide current punchlist status to commissioning agent upon request for RFSU assessment

---

## Templates & References

### Templates (stored in `methodology/templates/construction-quality/`)

1. **Operability Walkdown Checklist Template** — discipline-specific (mechanical, electrical, instrumentation, civil, structural, piping)
   - General operability items (access, egress, lighting, ventilation)
   - Discipline-specific items (valve accessibility, instrument readability, motor rotation direction)
   - Safety-specific items (emergency showers, fire protection, grounding, guarding)

2. **Punchlist Register Template (.xlsx)** — standard 5-sheet workbook as defined in Output Specification
   - Pre-built conditional formatting and pivot tables
   - Auto-calculated aging and status fields
   - Built-in dashboard charts

3. **Quality NCR Form Template** — for systemic issues requiring formal non-conformance reporting
   - NCR description and evidence
   - Root cause analysis section (5-Why, Fishbone)
   - Corrective action plan
   - Verification of effectiveness

4. **Deficiency Photo Documentation Standard** — guidelines for photo evidence
   - Photo composition requirements (scale, context, detail)
   - Naming convention: `[PL-ID]_[Area]_[Tag]_[Date]_[Seq].jpg`
   - Storage location and backup requirements

### References

- AACE International Recommended Practice 96R-18
- ISO 19011:2018 Guidelines for auditing management systems
- CII Construction Industry Institute — Quality Management publications
- VSC OR Playbook — Construction Quality section
- VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`)

---

## Examples

### Example 1: Pre-MC Operability Walkdown

**Context:** SAG mill area (Area 310) at a copper concentrator project

**Input:**
- Area 310 at 92% construction completion
- MC target in 3 weeks
- 4-person walkdown team: operations superintendent, maintenance planner, electrical technician, HSE advisor
- 87 equipment items in the area

**Process:**
1. Team briefed on SAG mill operational philosophy, critical safety systems, and design parameters
2. 2-day walkdown conducted (Day 1: ground level + mill floor; Day 2: upper levels + electrical rooms)
3. 47 findings identified and documented with photos
4. Findings classified: 3 Category A, 28 Category B, 16 Category C

**Category A Findings (must resolve before MC):**
- PL-310-001: Missing safety guard on mill discharge conveyor tail pulley — safety risk to operations personnel
- PL-310-002: Incomplete grounding on 4.16kV switchgear Bus 2 — electrical safety hazard
- PL-310-003: Emergency exit from mill building blocked by temporary construction materials — egress violation

**Output:**
- Walkdown report (28 pages) with 47 findings, 94 photos
- Punchlist register updated with 47 new items
- Category A items assigned to contractors with 5-day deadline
- MC Readiness = NOT READY (3 Cat A items open)
- Estimated remediation cost: $12,500 for Cat A items
- Follow-up walkdown scheduled for Day MC-7 to verify Cat A resolution

### Example 2: Systemic Quality Issue Detection

**Context:** Multi-area punchlist data analysis at a process plant construction project

**Input:**
- Punchlist data from 5 completed walkdowns (Areas 100, 200, 300, 310, 400)
- 312 total punchlist items across 5 areas
- Data shows 23% of piping-related items (18 of 78) are "incorrect support spacing" from Contractor XYZ

**Process:**
1. Trend analysis identifies that Contractor XYZ piping support spacing defects are 4x higher than other contractors
2. Compare actual support spacing measurements vs. design standard (ASME B31.3 + project specification)
3. Root cause investigation: Contractor XYZ using outdated support spacing table (Rev A instead of Rev C)
4. Calculate affected areas: 5 areas completed + 3 areas in progress = potential 8 areas impacted
5. Estimate remediation scope: 45 additional supports to be installed, 12 existing supports to be relocated

**Output:**
- Quality Alert Notice issued to Construction Manager (same day)
- Root cause report: Contractor XYZ using outdated design document
- Recommended corrective actions:
  1. Contractor re-training on current support spacing requirements (Rev C)
  2. 100% inspection of remaining piping supports in Areas 500, 600, 700 (not yet walked down)
  3. Re-inspection of piping supports in 5 completed areas
- Estimated remediation cost: $85,000
- Updated trend report showing contractor performance comparison
- NCR issued to Contractor XYZ with corrective action deadline

### Example 3: MC Readiness Dashboard

**Context:** Project approaching MC milestone for Phase 1 (15 systems)

**Input:**
- 15 systems in Phase 1 scope
- MC target date: 45 days from now
- Current punchlist: 1,245 total items (89 Cat A, 567 Cat B, 589 Cat C)

**Process:**
1. Generate per-system Cat A status
2. Calculate resolution velocity (Cat A items closed per week over last 4 weeks)
3. Project Cat A clearance date per system based on current velocity
4. Identify systems at risk of missing MC

**Output:**
- MC Readiness Dashboard:
  - 8 systems GREEN (0 Cat A items)
  - 4 systems AMBER (Cat A items with resolution plan projecting clearance before MC)
  - 3 systems RED (Cat A resolution rate insufficient to clear before MC)
- Risk report for 3 RED systems with specific blockers and recommended acceleration actions
- Resource request: additional contractor crews needed for 3 RED systems
- Updated project schedule impact assessment: 2 of 3 RED systems on critical path, potential 10-day MC delay without intervention

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | VSC OR Team | Initial release |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Skill Owner | Agent 6 - Execution | | |
| Methodology Lead | VSC OR PMO | | |
| Quality Reviewer | Quality Validator Agent | | |
