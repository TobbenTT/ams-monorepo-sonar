# Track Progressive Handover
## Skill ID: PROJ-02
## Version: 1.0.0
## Category: Project Management (Agent 6 - Execution)
## Priority: P1 - Critical

---

## Purpose

Track and manage the progressive handover of systems and facilities from construction/commissioning to operations, ensuring each system passes through defined milestones (MC -> RFSU -> PC -> Commercial Operation) with full documentation and operational readiness verification at each stage.

Progressive handover is one of the most complex activities in any capital project. Unlike traditional "big bang" handover where the entire facility is handed over at once, progressive handover transfers individual systems incrementally as they become ready. This approach enables earlier commissioning start, spreads the operations readiness workload, and allows early identification of systemic issues. However, it introduces significant complexity: at any given time, different systems are at different stages of readiness, creating a patchwork of responsibilities, insurance coverage, and care/custody/control (CCC) arrangements.

Industry research from IPA and CII shows that projects using structured progressive handover achieve 15-25% shorter overall schedule duration compared to batch handover, but only when the handover process is rigorously managed. Without proper tracking, the benefits are lost to confusion over system boundaries, incomplete documentation, and unclear accountability. The #1 failure mode is "premature handover" -- accepting systems that are not truly ready, which transfers the burden of defect resolution from the contractor (who has the resources and incentive to fix) to the owner's operations team (who does not).

This skill provides the framework for tracking every system through every milestone, with objective readiness criteria at each stage. It integrates punchlist management, operations readiness verification, documentation completeness, and CCC transfer into a single coherent tracking system.

A properly managed progressive handover typically achieves: 95%+ documentation completeness at each milestone, zero Category A punchlist items at MC, operations team fully ready to receive at RFSU, and measurable reduction in first-year reliability issues due to better handover quality.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Milestone Tracking**: Monitor each system's progress through the handover milestones: Mechanical Completion (MC), Ready for Start-Up (RFSU), Provisional Completion/Practical Completion (PC), and Final Acceptance/Commercial Operation. For each milestone, the agent must:
   - Maintain a clear definition of milestone criteria per system type
   - Track prerequisite completion (what must be done BEFORE the milestone can be achieved)
   - Generate readiness assessments at T-30, T-14, and T-7 days before each milestone
   - Record milestone achievement date and certificate references
   - Track time between milestones (MC-to-RFSU, RFSU-to-PC) against plan

2. **Documentation Completeness**: Verify that required documentation is complete at each milestone before sign-off. The agent must:
   - Maintain documentation checklists per system type and milestone
   - Track document status through: Not Started -> In Progress -> Submitted -> Reviewed -> Accepted
   - Distinguish between "received" and "accepted" (quality verified)
   - Calculate overall documentation completeness percentage per system per milestone
   - Identify critical document gaps that block milestone achievement

3. **Punchlist Integration**: Track punchlist items (Category A, B, C) and their resolution status per system. The agent must:
   - Maintain punchlist register with categorization:
     - Category A: Must be cleared before MC (safety-critical, functionality-blocking)
     - Category B: Must be cleared before PC (cosmetic, minor defects, non-critical functionality)
     - Category C: Long-lead or warranty items tracked to final acceptance
   - Track punchlist item resolution from identification through verification
   - Generate punchlist statistics per system, contractor, and category
   - Escalate Category A items approaching milestone dates
   - Analyze punchlist trends (are new items being created faster than resolved?)

4. **Operations Readiness**: Verify that operations team is ready to receive each system (trained staff, procedures in place, spare parts available). The agent must:
   - Maintain operations readiness checklist per system covering:
     - Personnel: trained operators assigned per shift
     - Procedures: SOPs reviewed, approved, and accessible
     - Spare parts: critical and commissioning spares on site
     - Maintenance: maintenance plans loaded in CMMS
     - Safety: HAZOP/risk assessment complete, safety systems verified
     - Permits: operating permits obtained
   - Calculate operations readiness score per system (0-100%)
   - Identify readiness gaps and assign corrective actions
   - Verify readiness before RFSU sign-off (mandatory gate)

Constraints:
- Must follow contractual milestone definitions (which may differ from VSC standard)
- Must integrate with commissioning sequence from certify-system-readiness.md
- Must track care, custody, and control (CCC) transfer at each milestone
- Must verify insurance and warranty transfer at each stage
- Must support multiple parallel handover streams (different systems at different milestones)
- Must maintain audit trail of all milestone decisions (achieve, defer, reject)
- Must produce outputs in Spanish (Latin American) with English technical terms preserved
- Must coordinate with EPC interface management (manage-epc-interfaces.md)

---

## Trigger / Invocation

```
/track-progressive-handover
```

### Command Triggers
- `track-progressive-handover status --system [system-id]`
- `track-progressive-handover milestone --system [system-id] --milestone [MC|RFSU|PC|CO]`
- `track-progressive-handover readiness-check --system [system-id]`
- `track-progressive-handover punchlist --system [system-id] --category [A|B|C|all]`
- `track-progressive-handover report --type [status|milestone|readiness]`
- `track-progressive-handover ccc --system [system-id] --action [transfer|verify]`

### Natural Language Triggers
- "Check handover status for [system name]"
- "Is [system] ready for RFSU?"
- "Generate handover status report"
- "Show me all systems approaching MC"
- "What are the punchlist items blocking [system] handover?"
- "Track operations readiness for [system]"
- "Transfer care, custody, and control for [system]"
- "Verificar estado de transferencia progresiva"
- "Estado de preparacion operacional para [sistema]"
- "Generar informe de avance de transferencia"

### Aliases
- `/handover-tracker`
- `/progressive-handover`
- `/milestone-tracker`
- `/system-handover`

### Automatic Triggers
- System approaching MC/RFSU/PC milestone (T-30, T-14, T-7 days)
- All Category A punchlist items cleared for a system (MC gate check)
- Operations readiness checklist completed (RFSU gate check)
- Performance tests completed (PC gate check)
- New punchlist items added that may affect milestone dates
- Weekly reporting cycle

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| System Breakdown | Engineering | Yes | .xlsx / .csv | System/subsystem hierarchy with tag numbers, descriptions, and boundaries |
| Milestone Definitions | Contract | Yes | .docx / .pdf | Contractual milestone criteria for MC, RFSU, PC, Final Acceptance |
| Punchlist Register | Construction/Commissioning | Yes | .xlsx | Category A/B/C items per system with status tracking |
| Operations Readiness Checklist | Operations Agent | Yes | .xlsx | Readiness criteria per system (personnel, procedures, spares, etc.) |
| Commissioning Completion Certificates | Commissioning | Yes | .pdf / .docx | System-level completion status and test results |
| Training Records | Operations (training) | Yes | .xlsx | Staff trained per system, competency verification records |
| Spare Parts Status | Asset Management | Yes | .xlsx | Critical and commissioning spares availability per system |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| Project Master Schedule | Project Controls | No | .xml / .xer | Milestone dates extracted from contract |
| EPC Interface Register | manage-epc-interfaces.md | No | .xlsx | Interface status tracked independently |
| Maintenance Plans | Asset Management | No | .xlsx | Maintenance readiness flagged as incomplete |
| HAZOP/Risk Assessments | HSE Agent | No | .docx / .xlsx | Safety readiness flagged as incomplete |
| Operating Permits | Regulatory | No | .pdf | Permit readiness flagged as incomplete |
| Insurance Certificates | Legal/Finance | No | .pdf | Insurance transfer tracked as action item |
| Previous Project Handover Data | VSC Knowledge Base | No | .xlsx | Industry benchmark data applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Map system boundaries from engineering documentation
- Generate milestone checklists based on system type (rotating equipment systems, static systems, electrical systems, instrumentation/control systems, civil/structural)
- Retrieve standard documentation requirements per milestone from VSC templates
- Pull punchlist categorization criteria from contract conditions
- Access AACE RP 96R-18 for commissioning and startup best practices
- Retrieve industry benchmark data for handover duration and documentation completeness
- Cross-reference with EPC interface register (manage-epc-interfaces.md) for documentation gaps
- Query operations readiness standards from ISO 55001 asset management requirements

---

## Output Specification

### Document 1: Progressive Handover Tracker (.xlsx)

**Filename**: `{ProjectCode}_Progressive_Handover_Tracker_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Milestone Dashboard** -- All systems with current milestone status
   - Columns: System ID, System Name, System Type, Area, MC Planned, MC Actual, MC Status, RFSU Planned, RFSU Actual, RFSU Status, PC Planned, PC Actual, PC Status, CO Planned, CO Actual, CO Status, Overall Status, Days Behind/Ahead, Critical Path (Y/N)
   - Traffic light formatting: Green (achieved or on track), Amber (at risk, <14 days to milestone), Red (overdue or blocked)
   - Summary row: total systems, % at each milestone, critical path systems

2. **MC Readiness** -- Per-system Mechanical Completion checklist and status
   - Columns: System ID, MC Checklist Item, Category (Construction/Documentation/Punchlist/Safety), Required (Y/N), Status (Not Started/In Progress/Complete/N/A), Responsible Party, Due Date, Notes
   - Standard MC criteria: construction complete, as-built drawings received, Category A punchlist = 0, hydro/pressure test complete, alignment/rotation checks complete, insulation complete, painting complete
   - Per-system completeness percentage
   - Category A punchlist count and status

3. **RFSU Readiness** -- Per-system Ready for Start-Up checklist including operations readiness
   - Columns: System ID, RFSU Checklist Item, Category (Commissioning/Operations/Safety/Documentation), Required (Y/N), Status, Responsible Party, Due Date, Notes
   - Standard RFSU criteria: commissioning activities complete, safety systems verified, operators trained, SOPs in place, critical spares available, maintenance plans loaded, loop checks complete, interlock tests complete
   - Operations readiness score per system
   - Commissioning completion percentage

4. **PC/Final Acceptance** -- Commercial operation criteria
   - Columns: System ID, PC Checklist Item, Category (Performance/Documentation/Warranty/Commercial), Required (Y/N), Status, Responsible Party, Due Date, Notes
   - Standard PC criteria: performance test complete and passed, all Category B punchlist resolved, complete document set received, warranty activated, insurance transferred, CCC transfer complete
   - Performance test results summary

5. **Punchlist Summary** -- Category A/B/C counts and resolution rates
   - Columns: Punch Item ID, System ID, Category (A/B/C), Description, Discipline, Responsible Contractor, Date Identified, Date Due, Date Closed, Status, Verification Status, Linked Milestone, VSC FM Code (if equipment-related)
   - Summary tables: by system, by category, by contractor, by discipline
   - Resolution rate trends (weekly closure rate vs. creation rate)
   - Aging analysis for open items

6. **CCC Transfer Log** -- Care, custody, control transfer records
   - Columns: System ID, Transfer Date, Transfer Type (MC/RFSU/PC), From (Contractor), To (Owner), Insurance Coverage, Warranty Start Date, Warranty End Date, CCC Certificate Number, Signed By (Contractor), Signed By (Owner), Notes
   - Insurance and warranty tracking per system
   - Outstanding CCC transfers highlighted

7. **Operations Readiness Matrix** -- Detailed readiness scoring per system
   - Columns: System ID, Personnel Score (0-100), Procedures Score (0-100), Spare Parts Score (0-100), Maintenance Score (0-100), Safety Score (0-100), Permits Score (0-100), Overall Score (weighted average), Readiness Status (Ready/Conditional/Not Ready)
   - Weighting: Personnel 25%, Procedures 20%, Spare Parts 15%, Maintenance 15%, Safety 15%, Permits 10%
   - Color coding: Green (>90%), Amber (70-90%), Red (<70%)

### Document 2: Handover Status Report (.docx)

**Filename**: `{ProjectCode}_Handover_Status_Report_v{Version}_{YYYYMMDD}.docx`

**Structure:**

1. **Cover Page** -- VSC branding, project identification, reporting period, revision status
2. **Document Control** -- Revision history, review matrix, distribution list
3. **Executive Summary** (1-2 pages)
   - Overall handover progress: X of Y systems at MC, X at RFSU, X at PC, X at CO
   - Key achievement since last report
   - Top 3 risks/issues requiring management attention
   - Forecast for next 30 days
4. **Overall Progress** (2-3 pages)
   - Milestone achievement chart (planned vs. actual cumulative S-curve)
   - % of systems at each milestone (stacked bar chart data)
   - Systems achieved milestones this period
   - Systems forecast for milestones next period
   - Schedule performance analysis (days ahead/behind plan)
5. **Critical Path Systems** (1-2 pages)
   - Systems on critical path to commercial operation
   - Current status and forecast for each critical system
   - Blockers and mitigation actions
   - Impact of delays on overall commercial operation date
6. **Punchlist Health** (2-3 pages)
   - Category A resolution rate (must be 100% before MC)
   - Category B resolution rate (must be 100% before PC)
   - Category C tracking to final acceptance
   - Weekly creation vs. closure trend
   - Top contractors by open punchlist count
   - Aging analysis (items open > 30, 60, 90 days)
7. **Operations Readiness Score per System** (2-3 pages)
   - Readiness score dashboard by system
   - Gap analysis: which readiness categories are lagging
   - Action plan for readiness improvement
   - Timeline to achieve full readiness per system
8. **Upcoming Milestones** (1 page)
   - Next 30 days milestone schedule
   - Readiness status for each upcoming milestone
   - Go/No-Go recommendation for each
9. **Risks and Escalations** (1-2 pages)
   - Handover-related risks with mitigation status
   - Items requiring management decision
   - Resource constraints affecting handover
10. **Appendices**
    - A: Detailed milestone status by system
    - B: Complete punchlist statistics
    - C: Operations readiness detail by system
    - D: CCC transfer log

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **AACE RP 96R-18** | Commissioning and Startup Planning -- handover milestone definitions and best practices |
| **ISO 55001:2014** | Asset Management -- requirements for asset information handover and operations readiness |
| **FIDIC Conditions of Contract** | Practical Completion definitions, defects liability, taking-over procedures |
| **ISO 21500:2021** | Project Management -- milestone management and stakeholder handover protocols |
| **ISO 19650** | Information management -- documentation requirements at handover |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **API RP 17TR8** | High-Pressure/High-Temperature Integrity Management -- handover for critical systems |
| **NORSOK Z-007** | Mechanical Completion and Commissioning -- Nordic standard for MC/RFSU criteria |
| **BS 8536** | Facility Management Briefing -- soft landings framework for operations readiness |
| **CII RT-171** | Project Handover Best Practices |
| **COAA** | Commissioning and Startup Best Practices |

### Milestone Definitions Framework

#### Mechanical Completion (MC)
MC certifies that a system has been constructed in accordance with design documents, all equipment is installed, and the system is physically complete and safe for commissioning activities to begin.

**Standard MC Criteria:**
- All equipment installed per design (verified by construction walkdown)
- Piping installed, hydro-tested, and reinstated
- Electrical installation complete, insulation resistance tested
- Instrumentation installed and loop-checked
- Structural steel and civil works complete
- Insulation, painting, and fireproofing complete
- Category A punchlist items = zero
- As-built drawings submitted (may be preliminary)
- Equipment vendor data received
- Hazardous area certification complete (if applicable)

#### Ready for Start-Up (RFSU)
RFSU certifies that a system has been successfully commissioned (all pre-commissioning and commissioning activities complete), the operations team is ready to operate, and the system is safe for introduction of process fluids and energization.

**Standard RFSU Criteria:**
- All MC requirements met
- Pre-commissioning activities complete (flushing, cleaning, drying, alignment)
- Commissioning activities complete (cold/hot function tests, control loop tuning)
- Safety system verification complete (interlocks, shutdowns, fire protection)
- Operating procedures reviewed, approved, and accessible to operators
- Operators trained on system operation (verified by competency assessment)
- Critical spare parts on site
- Maintenance plans loaded in CMMS with initial work orders generated
- Emergency response plan in place for the system
- CCC transferred from contractor to owner (or clear protocol for transfer during startup)

#### Practical Completion (PC)
PC certifies that a system has demonstrated its design performance through formal performance testing and is ready for commercial operation. All significant defects have been resolved.

**Standard PC Criteria:**
- All RFSU requirements met
- Performance test completed and passed (meets performance guarantees)
- Category B punchlist items resolved or formally accepted for post-PC resolution
- Complete as-built document set received and accepted
- Warranty certificates activated
- Insurance coverage transferred to operational policy
- CCC fully transferred to owner
- Operations team operating the system independently

#### Final Acceptance / Commercial Operation (CO)
CO certifies that the defects liability period has expired, all outstanding obligations are fulfilled, and the facility is fully operational and self-sustaining.

**Standard CO Criteria:**
- All PC requirements met
- Defects liability period expired
- All Category C punchlist items resolved
- Final documentation complete
- Retentions released (per contract terms)
- Final account settled
- Lessons learned captured

### Care, Custody, and Control (CCC) Transfer Protocol

CCC transfer is the formal handover of responsibility for a system from one party (typically the EPC contractor) to another (typically the owner). The transfer affects:

| Aspect | Before CCC Transfer | After CCC Transfer |
|--------|---------------------|-------------------|
| **Physical care** | Contractor maintains and protects | Owner maintains and protects |
| **Insurance** | Contractor's construction all-risk policy | Owner's operational insurance policy |
| **Security** | Contractor controls access | Owner controls access |
| **Utilities** | Contractor responsible for consumption | Owner responsible for consumption |
| **Personnel** | Contractor staffs operations | Owner staffs operations |
| **Liability** | Contractor bears loss risk | Owner bears loss risk (except defects) |

---

## Step-by-Step Execution

### Phase 1: Framework Setup (Steps 1-3)

**Step 1: Define Handover Framework**
1. Map all systems requiring handover from the system breakdown structure
2. Confirm system boundaries align with commissioning sequence (certify-system-readiness.md)
3. Define milestone criteria per system type (may vary for mechanical, electrical, instrumentation, civil systems)
4. Create handover checklists per milestone, customized from contract requirements and VSC standards
5. Establish CCC transfer protocol (timing, documentation, insurance switch-over)
6. Define punchlist categorization criteria aligned with contract
7. Set up operations readiness scoring methodology (categories, weights, thresholds)
8. **Quality gate**: Handover framework document approved by project management and EPC contractor

**Step 2: Baseline Milestone Schedule**
1. Extract planned milestone dates from project master schedule
2. Validate milestone sequence is logical (MC before RFSU before PC before CO for each system)
3. Identify critical path systems (those that gate commercial operation)
4. Map dependencies between systems (e.g., utility system RFSU before process system RFSU)
5. Create baseline handover S-curve (planned cumulative milestones over time)
6. Identify resource constraints (limited commissioning crews, shared test equipment)
7. **Quality gate**: Baseline milestone schedule accepted by all parties

**Step 3: Initialize Tracking System**
1. Create the Progressive Handover Tracker workbook with all sheets
2. Populate system list from system breakdown structure
3. Load milestone checklists for each system
4. Import existing punchlist data (if available)
5. Configure operations readiness checklist per system
6. Set up automatic milestone approach alerts (T-30, T-14, T-7)
7. Establish reporting templates and distribution lists
8. **Quality gate**: Tracking system functional and populated with baseline data

### Phase 2: MC Milestone Tracking (Steps 4-5)

**Step 4: Track MC Milestone**
1. Monitor construction completion per system against MC checklist
2. Track punchlist Category A items daily -- these must be ZERO for MC
3. Verify as-built documentation received (at minimum: preliminary as-builts, vendor data, test certificates)
4. Confirm safety certification complete (hazardous area, pressure equipment, structural)
5. Conduct MC readiness assessment at T-14 days:
   - MC checklist completion percentage
   - Category A punchlist count and resolution forecast
   - Documentation completeness assessment
   - Outstanding work scope
6. If ready: schedule MC walkdown with EPC and Owner representatives
7. Conduct MC walkdown: physical verification of construction completeness
8. Issue MC certificate or rejection notice with specific deficiency list
9. **Quality gate**: MC certificate signed only when ALL criteria met

**Step 5: Manage Post-MC Transition**
1. Record MC achievement date in tracker
2. Initiate CCC transition protocol (if CCC transfers at MC)
3. Verify insurance coverage alignment for commissioning activities
4. Confirm commissioning team access and safety protocols
5. Monitor Category B punchlist resolution progress
6. Track commissioning activity start and progress
7. Update milestone S-curve with actual MC dates

### Phase 3: RFSU Milestone Tracking (Steps 6-7)

**Step 6: Track RFSU Milestone**
1. Monitor commissioning activities completion against RFSU checklist
2. Verify operations readiness using the Operations Readiness Matrix:
   - **Personnel (25%)**: Operators assigned, trained, competency verified
   - **Procedures (20%)**: SOPs written, reviewed, approved, accessible
   - **Spare Parts (15%)**: Critical spares on site, commissioning spares available
   - **Maintenance (15%)**: Plans loaded in CMMS, initial work orders generated
   - **Safety (15%)**: HAZOP complete, safety systems verified, emergency plan in place
   - **Permits (10%)**: Operating permits obtained, environmental approvals in place
3. Conduct RFSU readiness assessment at T-14 days:
   - RFSU checklist completion percentage
   - Operations readiness score (target: >90%)
   - Commissioning test results (all passed?)
   - Remaining commissioning activities and forecast
4. If ready: schedule RFSU review meeting with commissioning, operations, and project management
5. Decision: Go (issue RFSU certificate), Conditional Go (with specific conditions), No-Go (with remediation plan)
6. **Quality gate**: RFSU certificate signed only when operations readiness score >90% AND all mandatory checklist items complete

**Step 7: Manage Post-RFSU Transition**
1. Record RFSU achievement date in tracker
2. Complete CCC transfer to operations (if not done at MC)
3. Initiate system startup activities per commissioning plan
4. Monitor initial operations for issues
5. Track performance test scheduling and execution
6. Continue Category B punchlist resolution
7. Update milestone S-curve with actual RFSU dates

### Phase 4: PC and CO Tracking (Steps 8-9)

**Step 8: Track PC / Commercial Operation**
1. Verify performance test completion and results against contract guarantees
2. Confirm all Category B punchlist items resolved or formally accepted for post-PC resolution
3. Verify complete as-built document set received and quality-checked
4. Confirm warranty certificates activated per contract terms
5. Verify insurance coverage transferred to operational policy
6. Confirm CCC fully transferred to owner (if not done earlier)
7. Conduct PC readiness assessment:
   - Performance test passed?
   - Documentation 100% complete?
   - Category B punchlist resolved?
   - Warranty and insurance active?
8. Issue PC certificate or rejection notice
9. Record PC achievement date and initiate defects liability period tracking
10. **Quality gate**: PC certificate signed only when performance guarantees demonstrated

**Step 9: Track Final Acceptance**
1. Monitor defects liability period (typically 12-24 months from PC)
2. Track Category C punchlist items to closure
3. Verify final documentation complete
4. Monitor retentions release schedule
5. Track final account settlement
6. Capture lessons learned for each system handover
7. Issue Final Acceptance certificate when all obligations fulfilled
8. **Quality gate**: Final Acceptance only when ALL obligations complete

### Phase 5: Reporting & Continuous Improvement (Step 10)

**Step 10: Generate Reports and Capture Lessons**
1. Weekly handover status update (automated from tracker data)
2. Bi-weekly punchlist health report
3. Monthly handover progress report with S-curve comparison
4. Milestone-specific readiness reports (at T-30 for each milestone)
5. Post-milestone lessons learned workshops
6. End-of-project handover lessons learned report
7. Propose methodology improvements based on experience

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Milestone Accuracy | 25% | Systems at correct milestone status (verified against evidence) | 100% |
| Punchlist Resolution | 20% | Category A items cleared before MC | 100% |
| Documentation Completeness | 20% | Required documents accepted at each milestone | >95% |
| Operations Readiness | 15% | Systems with operations readiness score >90% at RFSU | 100% |
| Report Currency | 10% | Tracker updated within 48 hours of events | >95% |
| CCC Accuracy | 10% | CCC transfer records complete and accurate | 100% |

### Automated Quality Checks

- [ ] Every system in the breakdown structure has a corresponding entry in the handover tracker
- [ ] Every system has planned milestone dates for MC, RFSU, PC, and CO
- [ ] No system has achieved RFSU without first achieving MC (milestone sequence logic)
- [ ] No system has achieved PC without first achieving RFSU
- [ ] Category A punchlist items = 0 for every system with MC achieved
- [ ] Operations readiness score >= 90% for every system with RFSU achieved
- [ ] CCC transfer record exists for every system past MC
- [ ] Insurance and warranty records exist for every system past PC
- [ ] Documentation completeness calculated correctly against checklist
- [ ] Punchlist counts reconcile between summary and detail sheets
- [ ] No "TBD," "pending," or placeholder entries in milestone certificates
- [ ] All milestone certificates have both EPC and Owner signatures recorded
- [ ] Weekly reports contain data no older than 5 business days
- [ ] Critical path systems identified and flagged in dashboard

---

## MCP Integrations

### mcp-sharepoint

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read** | Retrieve milestone certificates | MC, RFSU, PC certificates and supporting evidence |
| **Read** | Access punchlist registers | Construction and commissioning punchlist data |
| **Read** | Retrieve as-built documentation | Track document submissions against TOP checklist |
| **Read** | Access training records | Operator training completion and competency records |
| **Write** | Store handover status reports | Weekly, monthly, and milestone-specific reports |
| **Write** | Store CCC transfer certificates | Formal CCC transfer documentation with signatures |
| **Write** | Store milestone sign-off documents | Completed milestone checklists and certificates |
| **Write** | Store readiness assessments | Operations readiness reports per system |

### project-database

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Progressive handover database | Track all systems, milestones, punchlist items, readiness scores in real-time |
| **Read/Write** | Punchlist management | Full punchlist lifecycle tracking with categorization, aging, and resolution |
| **Read/Write** | Operations readiness scoring | Per-system readiness matrix with automatic score calculation |
| **Dashboard** | Milestone status views | Real-time traffic light dashboard by system, area, milestone |
| **Dashboard** | Punchlist analytics | Resolution trends, aging analysis, contractor performance |
| **Dashboard** | S-curve visualization | Planned vs. actual milestone achievement curves |
| **Workflow** | Milestone alerts | Automated notifications at T-30, T-14, T-7 before milestones |

### mcp-outlook

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Send** | Milestone approaching notifications | Automated alerts to responsible parties for upcoming milestones |
| **Send** | Handover readiness reports | Distribute weekly status reports to project team |
| **Send** | Escalation of blocking items | Alert project management when milestones are at risk |
| **Send** | CCC transfer notifications | Formal notification of CCC transfer with insurance implications |
| **Calendar** | Milestone review meetings | Schedule MC/RFSU/PC review meetings with all parties |
| **Calendar** | CCC transfer ceremonies | Schedule formal handover events |
| **Read** | Receive milestone approvals | Capture email-based milestone sign-off confirmations |

### mcp-jira

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Punchlist items as issues | Track punchlist items with workflow (Open -> In Progress -> Resolved -> Verified -> Closed) |
| **Read/Write** | Readiness action items | Track operations readiness gap corrective actions |
| **Link** | Commissioning tasks | Link to commissioning tasks from certify-system-readiness.md |
| **Dashboard** | Punchlist burndown | Track punchlist resolution rate against milestone deadlines |
| **Workflow** | Milestone gates | Implement milestone gate reviews as Jira workflows |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| agent-execution (commissioning) | Upstream | Commissioning completion certificates feed handover milestones | Critical |
| agent-execution (construction) | Upstream | MC certificates, construction walkdown results, punchlist items | Critical |
| agent-operations | Bilateral | Operations readiness verification (trained staff, SOPs, permits) | Critical |
| agent-asset-management | Bilateral | Spare parts availability, maintenance plans loaded in CMMS | High |
| agent-hse | Upstream | Safety system verification, HAZOP completion, operating permits | High |
| agent-contracts-compliance | Upstream | Contractual milestone definitions, warranty terms, insurance requirements | High |
| manage-epc-interfaces.md | Upstream | Interface status and TOP documentation completeness | High |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| agent-operations | Downstream | System handover triggers operations team to take responsibility | At RFSU/CCC transfer |
| agent-asset-management | Downstream | Warranty tracking post-handover, maintenance plan activation | At PC milestone |
| agent-execution (finance) | Downstream | Milestone achievements trigger payment milestones | At MC/RFSU/PC |
| orchestrate-or-agents | Reporting | Handover progress feeds into OR gate review reports | Monthly / at gates |
| manage-change-control.md | Bilateral | Scope changes affecting handover milestones | On change identification |
| forecast-program-completion.md | Downstream | Milestone achievement data feeds completion forecasting | Monthly |

---

## Templates & References

### Document Templates
- `VSC_Progressive_Handover_Tracker_Template_v2.0.xlsx` -- Standard tracker with all sheets pre-formatted
- `VSC_MC_Certificate_Template_v1.5.docx` -- Mechanical Completion certificate with checklist
- `VSC_RFSU_Certificate_Template_v1.5.docx` -- Ready for Start-Up certificate with checklist
- `VSC_PC_Certificate_Template_v1.5.docx` -- Practical Completion certificate with checklist
- `VSC_CCC_Transfer_Form_v1.0.docx` -- Care, Custody, and Control transfer form
- `VSC_Operations_Readiness_Checklist_v2.0.xlsx` -- Per-system readiness assessment template
- `VSC_Punchlist_Register_Template_v1.5.xlsx` -- Punchlist tracking with categorization
- `VSC_Handover_Status_Report_Template_v1.0.docx` -- Weekly/monthly report template

### Reference Data Sources
- AACE RP 96R-18: Commissioning and Startup Planning Best Practices
- CII RT-171: Planning for Startup -- Lessons Learned
- NORSOK Z-007: Mechanical Completion and Commissioning Standard
- BS 8536: Facility Management Briefing -- Soft Landings
- IPA Research: Progressive Handover in Megaprojects
- VSC Internal Lessons Learned Database: Handover experiences from prior projects

### Knowledge Base
- Past progressive handover projects by industry sector (mining, O&G, power, chemicals)
- System-type-specific milestone checklists (rotating equipment, static, electrical, instrumentation, civil)
- Common handover pitfalls and mitigation strategies
- Operations readiness benchmarks by industry
- Punchlist management best practices
- CCC transfer protocol templates by contracting strategy (EPC, EPCM, multi-contract)

---

## Examples

### Example 1: System Approaching RFSU

**Input:** Cooling water system (SYS-CW-001), MC achieved 21 days ago, commissioning 95% complete. Operations team has been training on the system. Project manager requests RFSU readiness assessment.

**Process:**
1. Review RFSU checklist (14 items across Commissioning, Operations, Safety, Documentation):
   - Commissioning: 12/14 commissioning activities complete, 2 remaining (control loop tuning for TCV-001, performance verification for pump PP-CW-001A)
   - Operations: SOPs written and approved, 6/8 operators trained (2 pending night shift training)
   - Safety: Interlocks tested, emergency shutdown verified, fire protection confirmed
   - Spare parts: Critical spares on site (mechanical seal, coupling, impeller)
   - Maintenance: Maintenance plans loaded in SAP PM, first PMs scheduled
   - Documentation: 42/45 documents accepted (3 pending: updated P&IDs after commissioning changes)
2. Calculate operations readiness score:
   - Personnel: 75% (6/8 operators, night shift gap)
   - Procedures: 100% (all SOPs approved)
   - Spare Parts: 95% (1 non-critical spare on order)
   - Maintenance: 90% (plans loaded, first PMs need scheduling verification)
   - Safety: 100% (all safety items verified)
   - Permits: 100% (operating permit obtained)
   - Overall: 91.5% (weighted average)
3. Identify 2 outstanding commissioning punch items (Category B, accepted for post-RFSU)
4. Prepare RFSU readiness report with conditional recommendation

**Output:**
- RFSU readiness report showing 12/14 checklist items complete
- Operations readiness score: 91.5% (above 90% threshold)
- 2 Category B commissioning items accepted for post-RFSU resolution
- 2 conditions for RFSU: (1) complete night shift operator training within 7 days, (2) receive updated P&IDs within 5 days
- Recommendation: Conditional Go for RFSU sign-off with stated conditions
- Updated Progressive Handover Tracker with current status

### Example 2: Blocking Category A Punchlist

**Input:** Concentrate thickener system (SYS-TK-003) has 3 Category A punchlist items preventing MC. MC was planned for 10 days ago. Project is 10 days behind on this system.

**Process:**
1. Analyze the 3 Category A items:
   - PL-A-0147: Missing pressure transmitter PT-TK-3301 (instrument not installed, vendor delivery delayed)
   - PL-A-0148: Structural steel defect on thickener bridge walkway (weld defect identified during NDE inspection)
   - PL-A-0149: Missing motor test certificate for agitator drive (vendor has not provided documentation)
2. Assess impact:
   - PL-A-0147: Blocks MC (safety interlock depends on this instrument). Vendor delivery forecast: 5 days
   - PL-A-0148: Blocks MC (access safety issue). Repair estimate: 3 days once welding crew mobilized
   - PL-A-0149: Review if truly Category A or can be downgraded to B with engineering justification
3. Escalate to construction manager and EPC contractor:
   - Request expedited instrument delivery with air freight option
   - Mobilize welding crew for structural repair within 48 hours
   - Engineering review of motor test certificate necessity for MC vs. PC
4. Track resolution daily with status updates
5. Update milestone forecast: MC delayed minimum 5 days from today (instrument delivery is critical path)

**Output:**
- Escalation report with resolution plan for each Category A item
- Updated milestone forecast: MC for SYS-TK-003 delayed to [date + 5 days]
- Impact assessment: 5-day delay on this system, evaluate cascading impact on thickener commissioning and overall critical path
- Risk register entry: Risk-HO-023, "Thickener MC delay due to missing instrument and structural defect"
- Daily tracking protocol established until Category A items resolved
- Engineering review request for PL-A-0149 (potential downgrade to Category B)

### Example 3: Multi-System Handover Dashboard

**Input:** Large copper concentrator project with 24 systems. Month 28 of 36-month project. Project manager requests comprehensive handover status for steering committee.

**Process:**
1. Compile milestone status for all 24 systems:
   - MC achieved: 14 systems (58%)
   - RFSU achieved: 8 systems (33%)
   - PC achieved: 2 systems (8%) (utility systems: compressed air, potable water)
   - Not yet MC: 10 systems (42%)
2. Analyze critical path: grinding circuit (SYS-GR-001) on critical path, MC planned in 15 days, currently at risk (2 Category A items)
3. Punchlist health: 847 total items, 12 Category A (all assigned to 10 not-yet-MC systems), 234 Category B, 601 Category C
4. Operations readiness: average score across all systems = 72%, ranging from 95% (utility systems) to 45% (grinding and flotation -- procedures not yet complete)
5. Handover S-curve: currently tracking 8% behind plan (14 MC vs. planned 16 MC)

**Output:**
- Handover Status Report (12 pages) for steering committee
- Executive dashboard showing 58% MC, 33% RFSU, 8% PC
- Critical path analysis: grinding circuit is the pacing system
- Punchlist summary: 12 Category A items blocking MC for remaining systems
- Operations readiness gap analysis: procedure development is the #1 bottleneck
- 30-day forecast: expect 4 additional MC, 3 additional RFSU
- Recommended actions: (1) accelerate SOP development for grinding/flotation, (2) resolve grinding circuit Category A items within 10 days, (3) increase commissioning crew for parallel RFSU activities
