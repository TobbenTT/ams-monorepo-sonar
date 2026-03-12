---
name: manage-moc-workflow
description: "Manage Management of Change (MOC) workflows for operational changes. Triggers: 'MOC workflow', 'management of change', 'gestion del cambio operacional'."
---

# Manage MOC Workflow

## Skill ID: I-05
## Version: 1.0.0
## Category: I. Documentation Lifecycle
## Priority: P1 - High

---

## Purpose

Manage end-to-end Management of Change (MOC) workflows for industrial operations, ensuring that every change to process, equipment, technology, procedures, or organization is systematically evaluated for risk, properly approved, fully implemented, and formally closed before the change becomes operational. This skill automates MOC form generation, impact assessment routing, multi-party approval coordination, implementation tracking, and post-change verification while maintaining the rigorous documentation trail required by process safety regulations.

Management of Change is one of the most critical elements of process safety management. When change management fails, the consequences are catastrophic. The CSB (Chemical Safety and Hazard Investigation Board) has identified inadequate management of change as a contributing or root cause in over 40% of investigated incidents, including the 2005 BP Texas City explosion (15 fatalities), the 2010 Tesoro Anacortes refinery explosion (7 fatalities), and the 2019 Philadelphia Energy Solutions refinery fire. OSHA PSM enforcement data consistently ranks MOC violations among the top 3 most-cited elements, with penalties up to $156,259 per willful violation.

This skill directly addresses Pain Point D-07 from the Corporate Pain Points Research Report, which documents that safety incidents traced to inadequate change management represent a recurring pattern across capital-intensive industries. Research by the Center for Chemical Process Safety (CCPS) indicates that 80% of process safety incidents involve some form of unmanaged change -- either a change that was not recognized as a change, a change that bypassed the MOC process, or a change where the MOC was completed but implementation was incomplete. The Mary Kay O'Connor Process Safety Center at Texas A&M University found that organizations with mature MOC systems experience 60-80% fewer process safety events than those with informal change management.

Beyond safety, poor change management drives operational problems: engineering changes that cascade into undocumented procedure modifications, equipment modifications that invalidate maintenance strategies, organizational changes that create competency gaps, and technology changes that outpace training programs. Each of these cascades erodes the integrity of the operational management system built during the Operational Readiness program.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **MOC Initiation & Classification**: Generate properly classified MOC forms based on the type of change (process, equipment, technology, procedural, organizational, temporary, emergency). Classification determines the required impact assessment scope, approval authority level, and pre-startup review requirements. The agent must distinguish between changes that require MOC (modifications to process safety information) and replacements-in-kind (RIK) that do not trigger MOC but must be documented.

2. **Impact Assessment Coordination**: Route MOC packages to affected disciplines for impact assessment. Every change has potential cascading effects across multiple domains: a process parameter change may affect operating procedures, alarm settings, safety instrumented systems, environmental permits, training requirements, and maintenance strategies. The agent must identify all affected domains, solicit impact assessments from each, and consolidate findings into a comprehensive impact evaluation.

3. **Risk Assessment Integration**: Ensure every MOC includes an appropriate risk assessment proportionate to the change's complexity and potential consequences. Simple changes may require a "What-If" analysis; complex changes may require a full HAZOP or LOPA. The agent must determine the appropriate risk assessment methodology, coordinate its execution, and verify that all identified risks have acceptable mitigation.

4. **Multi-Level Approval Routing**: Route MOC packages through the appropriate approval chain based on change classification and risk level. Low-risk procedural changes may require supervisor approval; high-risk process changes may require Plant Manager and corporate HSE approval. The agent must track approval status, send reminders for overdue approvals, and escalate stalled MOCs.

5. **Implementation Tracking**: Track all implementation actions required before the change becomes operational. This includes: updating P&IDs and other process safety information, revising operating procedures, updating CMMS and maintenance plans, conducting affected-personnel training, modifying safety instrumented systems, updating emergency response plans, and obtaining any required regulatory approvals or permit modifications.

6. **Pre-Startup Safety Review (PSSR) Coordination**: For MOCs that modify process equipment or change process parameters, ensure that a PSSR is conducted before the change becomes operational. The agent coordinates with the prepare-pssr-package (I-04) skill to generate the MOC-triggered PSSR.

7. **Temporary Change Management**: Track temporary changes with defined expiration dates. Temporary changes that exceed their authorized duration are escalated. Temporary changes must be either removed (restored to original condition) or converted to permanent changes (with full permanent MOC) before expiration.

8. **Emergency Change Management**: Support emergency changes that must be implemented immediately for safety reasons. Emergency MOCs receive expedited processing but must still be retroactively documented, assessed, and approved within 72 hours of implementation.

9. **MOC Register & Analytics**: Maintain a complete register of all MOCs with their status, and analyze MOC data for patterns: recurring change types, approval bottleneck identification, implementation closure rates, and correlation between MOC quality and incident rates.

---

## Trigger / Invocation

```
/manage-moc-workflow
```

**Aliases**: `/moc`, `/management-of-change`, `/change-management-workflow`, `/gestion-del-cambio`

**Primary Trigger Commands:**
- `manage-moc-workflow initiate --type [process|equipment|technology|procedural|organizational|temporary|emergency]`
- `manage-moc-workflow status --moc-id [MOC-XXXX]`
- `manage-moc-workflow approve --moc-id [MOC-XXXX] --approver [name]`
- `manage-moc-workflow implement --moc-id [MOC-XXXX] --action [action-id]`
- `manage-moc-workflow close --moc-id [MOC-XXXX]`
- `manage-moc-workflow report --period [monthly|quarterly|annual]`
- `manage-moc-workflow audit --scope [site|department|period]`
- `manage-moc-workflow expire-check --scope [all-temporary]`

**Trigger Conditions:**
- User requests a new MOC for a proposed change
- Engineering change notice (ECN) received from EPC or engineering team
- Equipment modification requested by maintenance or operations
- Procedure revision requested that alters process safety information
- Organizational restructuring that affects safety-critical roles
- Temporary change approaching or exceeding expiration date
- Emergency change implemented and requiring retroactive documentation
- Regulatory change requiring process or procedure modification
- Technology upgrade or software change affecting process control systems
- Audit finding requiring corrective change with MOC documentation

---

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Change Description | Text | Clear, detailed description of the proposed change: what is being changed, from what current state, to what new state, and why |
| Change Type | Selection | Process / Equipment / Technology / Procedural / Organizational / Temporary / Emergency |
| Change Scope | .docx, text | System boundaries, equipment affected, area/unit, drawing references |
| Originator | Text | Person requesting the change with role and department |
| Justification | Text | Business or safety rationale for the change, including consequences of not making the change |
| Proposed Implementation Date | Date | Target date for the change to become operational |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Affected P&IDs | .pdf, .dwg | Current P&IDs showing the systems to be changed |
| Preliminary Risk Assessment | .xlsx, .docx | If the originator has already conducted a risk assessment |
| Budget Estimate | Number | Estimated cost of implementing the change |
| Duration (Temporary Changes) | Date range | Start and end dates for temporary changes, maximum 90 days |
| Related MOCs | MOC IDs | Previous or concurrent MOCs related to this change |
| Vendor Documentation | .pdf | Vendor recommendations or technical data supporting the change |
| Regulatory Correspondence | .pdf | Any regulatory communications related to the change |
| Incident/Event Reference | Text | If the change is in response to an incident or near-miss |
| Drawing Markups | .pdf, .dwg | Red-line markups showing proposed change on drawings |
| Process Simulation Data | .xlsx | Process simulation results supporting the change (if applicable) |

### Input Validation Rules

- Change description must be specific enough to determine scope (reject vague descriptions like "improve pump performance")
- Temporary changes must have an expiration date no more than 90 days from implementation (per OSHA PSM guidance)
- Emergency changes must include immediate safety justification and must be initiated within 24 hours of emergency implementation
- Equipment tag numbers must match the asset register (validated against mcp-cmms)
- P&ID references must be validated against the document management system (mcp-sharepoint)
- Budget estimates above $100,000 require additional financial approval routing

---

## Output Specification

### Primary Output: MOC Package (.xlsx + .docx)

**Filename:** `{SiteCode}_MOC_{MOC-Number}_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "MOC Cover Sheet"
| Field | Content |
|-------|---------|
| MOC Number | MOC-{SiteCode}-{Year}-{Sequence} (e.g., MOC-MDP-2026-047) |
| Change Title | Brief descriptive title (max 80 characters) |
| Change Type | Process / Equipment / Technology / Procedural / Organizational / Temporary / Emergency |
| Change Classification | Minor / Moderate / Major / Critical (determines approval level) |
| Originator | Name, role, department |
| Date Initiated | YYYY-MM-DD |
| Affected System(s) | System codes and descriptions |
| Affected Equipment | Equipment tag numbers |
| Affected P&IDs | Drawing numbers and revisions |
| Affected Area(s) | Plant area/unit codes |
| Change Duration | Permanent / Temporary (expiry date) |
| Risk Level | Low / Medium / High / Critical |
| MOC Status | Initiated / Under Review / Approved / In Implementation / Awaiting PSSR / Closed / Rejected |
| Approval Authority | Based on classification and risk level |

#### Sheet 2: "Change Description & Justification"
- Detailed description of current state
- Detailed description of proposed change
- Technical justification
- Business justification
- Consequences of not implementing the change
- Alternatives considered and reasons for rejection
- Diagrams, markups, or sketches (embedded or referenced)

#### Sheet 3: "Impact Assessment Matrix"
| Domain | Assessed By | Impact | Details | Actions Required | Status |
|--------|-------------|--------|---------|-----------------|--------|
| Process Safety Information | Process Engineer | YES | P&IDs require update; process data sheets affected | Update P&IDs to as-built; revise PDS-100-003 | PENDING |
| Operating Procedures | Operations Superintendent | YES | SOP-100-005 requires revision for new setpoints | Revise SOP-100-005 Section 4.3; retrain 12 operators | PENDING |
| Maintenance Procedures | Maintenance Planner | YES | New bearing type requires updated PM task | Update PM task PMT-100-PP-001-Q1; add new spare part | PENDING |
| Training Requirements | Training Coordinator | YES | Operators need training on new operating parameters | 2-hour classroom + 1-hour practical per operator | PENDING |
| Safety Instrumented Systems | Instrument Engineer | NO | SIS logic unaffected; alarm setpoints unchanged | None | COMPLETE |
| Emergency Response | HSE Manager | NO | Emergency scenarios unchanged | None | COMPLETE |
| Environmental Permits | Environmental Specialist | REVIEW | Potential air quality impact; need emission calculation | Complete dispersion modeling by {date} | IN PROGRESS |
| Regulatory Compliance | Legal/Compliance | NO | No regulatory change triggered | None | COMPLETE |
| CMMS/Asset Data | CMMS Administrator | YES | Equipment parameters require update in SAP | Update functional location and BOM in SAP PM | PENDING |
| Spare Parts | Warehouse Manager | YES | New bearing type required; old type to be phased out | Order 2x new bearings; return old stock | PENDING |
| Alarm Management | Alarm Management Lead | YES | 2 alarm setpoints require modification | Submit Alarm MOC form; update alarm database | PENDING |
| Insurance | Risk Manager | NO | No change to insured values or risk profile | None | COMPLETE |

#### Sheet 4: "Risk Assessment"
- Risk assessment methodology used (What-If, HAZOP, LOPA, Bow-Tie)
- Identified hazards and scenarios
- Risk ranking before mitigation
- Recommended safeguards and mitigations
- Residual risk after mitigation
- ALARP demonstration (for High/Critical changes)

#### Sheet 5: "Approval Register"
| Approver Role | Name | Required/Advisory | Approval Status | Date | Signature | Comments |
|---------------|------|------------------|----------------|------|-----------|----------|
| Area Supervisor | J. Martinez | Required | APPROVED | 2026-03-15 | [sig] | |
| Operations Manager | C. Mendez | Required | APPROVED | 2026-03-16 | [sig] | Condition: training complete before implementation |
| HSE Manager | P. Silva | Required | PENDING | -- | -- | Awaiting environmental review |
| Maintenance Manager | R. Torres | Advisory | APPROVED | 2026-03-15 | [sig] | Spare parts lead time: 4 weeks |
| Plant Manager | A. Rodriguez | Required (Major) | PENDING | -- | -- | Will approve after HSE sign-off |

#### Sheet 6: "Implementation Action Tracker"
| Action # | Description | Responsible | Due Date | Status | Evidence | Verified By |
|----------|-------------|-------------|----------|--------|----------|-------------|
| IMP-001 | Update P&ID 100-005 Rev D to show new pump impeller | Drafting | 2026-04-01 | IN PROGRESS | -- | -- |
| IMP-002 | Revise SOP-100-005 Section 4.3 with new setpoints | Ops Engineer | 2026-04-05 | NOT STARTED | -- | -- |
| IMP-003 | Conduct operator training (12 operators x 3 hours) | Training | 2026-04-10 | NOT STARTED | -- | -- |
| IMP-004 | Order 2x new bearings (8-week lead time) | Procurement | 2026-03-20 | ORDERED | PO-2026-1234 | -- |
| IMP-005 | Update SAP PM: equipment BOM and PM task | CMMS Admin | 2026-04-01 | NOT STARTED | -- | -- |
| IMP-006 | Complete environmental dispersion modeling | Env. Specialist | 2026-04-15 | IN PROGRESS | -- | -- |
| IMP-007 | Conduct PSSR before startup | PSSR Team | 2026-04-20 | NOT STARTED | -- | -- |

#### Sheet 7: "PSSR Requirements" (if applicable)
- PSSR required: YES/NO (based on MOC classification)
- PSSR scope: description of what the PSSR must verify
- PSSR team composition
- PSSR scheduled date
- PSSR status and link to prepare-pssr-package (I-04)

#### Sheet 8: "Temporary Change Log" (if applicable)
| Field | Content |
|-------|---------|
| Temporary Change Authorization Date | 2026-03-15 |
| Maximum Duration | 90 days |
| Expiration Date | 2026-06-13 |
| Reversal Plan | Detailed description of how to restore original condition |
| Extension Request (if any) | Date requested, justification, new expiry |
| Conversion to Permanent | If converting, reference permanent MOC number |
| Actual Removal/Conversion Date | YYYY-MM-DD |
| Restoration Verified By | Name, date, signature |

### Secondary Output: MOC Summary Report (.docx)
**Filename:** `{SiteCode}_MOC_Summary_{MOC-Number}_{date}.docx`

Narrative report (3-8 pages) for management review:
1. Change summary and justification
2. Impact assessment summary
3. Risk assessment findings and mitigations
4. Approval status
5. Implementation plan and schedule
6. PSSR requirements (if applicable)
7. Recommendation for approval

### Tertiary Output: MOC Register & Analytics (.xlsx)
**Filename:** `{SiteCode}_MOC_Register_{period}.xlsx`

Site-wide MOC register with analytics:
- All active MOCs with status
- Overdue implementation actions
- Temporary changes approaching expiration
- MOC cycle time analysis (initiation to closure)
- MOC volume trends by type and department
- Implementation closure rate
- Correlation analysis: MOC quality vs. incident data

### Formatting Standards
- Header row: Bold, dark blue background (#003366), white font
- Status coding: COMPLETE=Green, IN PROGRESS=Amber, NOT STARTED=Grey, OVERDUE=Red, REJECTED=Dark Red
- Risk coding: CRITICAL=Red, HIGH=Orange, MEDIUM=Amber, LOW=Green
- All PSSR-required MOCs highlighted with bold border
- Temporary change expiration dates highlighted in yellow when within 14 days
- Overdue actions highlighted in red with automatic escalation flag

---

## Methodology & Standards

### Primary Regulatory Standards

- **OSHA 29 CFR 1910.119(l)** - Management of Change: Core US PSM requirement. Requires written procedures to manage changes (except RIK) to process chemicals, technology, equipment, and procedures. Must address: (1) technical basis for change, (2) impact on safety and health, (3) modifications to operating procedures, (4) necessary time period for change, (5) authorization requirements for change. Affected employees must be informed and trained before startup.
- **EPA 40 CFR 68.75** - Management of Change: RMP program requirement mirroring OSHA PSM MOC requirements.
- **API RP 750** - Management of Process Hazards: Industry recommended practice for process hazard management including MOC.

### International Standards

- **Seveso III Directive (2012/18/EU) Article 10** - Requires safety management system including MOC procedures for major hazard sites.
- **UK COMAH Regulations** - Control of Major Accident Hazards: Requires formal MOC as part of the Safety Report.
- **IEC 61511-1 (SIS)** - Functional Safety: Requires management of change for safety instrumented systems, including SIL verification after modification.
- **ISO 45001:2018** - Occupational Health and Safety Management Systems: Section 8.1.3 requires management of change processes.

### Chilean Regulatory Standards

- **DS 132 Art. 21** - Reglamento de Seguridad Minera: Requires authorization and safety review before equipment or process modifications in mining operations.
- **DS 594** - Workplace safety conditions: Changes affecting workplace safety must be assessed and controlled.
- **SERNAGEOMIN Circular Letters** - Mining-specific change management requirements, particularly for tailings facilities, ventilation systems, and geotechnical modifications.
- **SMA (Superintendencia del Medio Ambiente)** - Environmental permit conditions may require notification or approval of changes affecting emissions or discharges.

### Industry Best Practices

- **CCPS "Guidelines for the Management of Change for Process Safety"** (2008): Comprehensive industry guidance for MOC programs, including scope determination, impact assessment, risk evaluation, approval, implementation, and close-out.
- **CCPS "Recognizing and Responding to Normalization of Deviance"** (2018): Addresses how accumulated small changes, each individually "acceptable," can collectively drift the operation into a dangerous state.
- **API 750** - Management of Process Hazards: Addresses MOC within the broader process safety context.
- **Energy Institute "Hearts and Minds" MOC guidance**: Behavioral aspects of change management.

### Industry Statistics

- 80% of process safety incidents involve some form of unmanaged change (CCPS, 2018 data)
- MOC violations rank top 3 in OSHA PSM citations annually (OSHA enforcement data)
- Average MOC cycle time (initiation to closure): 45-90 days for moderate changes (industry benchmark)
- Typical MOC volume: 200-500 per year for a medium-size refinery or chemical plant (CCPS data)
- 40% of MOCs are incomplete at time of implementation -- i.e., not all implementation actions closed (CCPS audit data)
- 25% of temporary changes exceed their authorized duration (industry audit findings)
- Organizations with mature MOC programs: 60-80% fewer process safety events (Mary Kay O'Connor Center, Texas A&M)
- Cost of OSHA PSM MOC violation: $15,811 (serious) to $156,259 (willful) per citation (2024 rates)
- Average cost of a process safety incident attributable to MOC failure: $10M-$100M+ (CSB investigation data)

### MOC Classification Matrix

| Change Type | Classification Criteria | Risk Assessment Required | Approval Authority |
|------------|------------------------|------------------------|--------------------|
| **Minor** | No change to PSI; no SIS impact; single equipment; operating within existing envelope | What-If (documented) | Area Supervisor |
| **Moderate** | Changes to PSI; affects operating procedures; single system; within design limits | What-If or Checklist HAZOP | Operations Manager + HSE |
| **Major** | Changes to process conditions beyond design basis; SIS modifications; multiple systems | Full HAZOP node review | Plant Manager + HSE Manager |
| **Critical** | New process chemistry; significant capacity increase; changes to relief system design basis | Full HAZOP + LOPA + Independent Review | VP Operations + Corporate HSE |

---

## Step-by-Step Execution

### Phase 1: MOC Initiation & Classification (Steps 1-3)
**Step 1: Receive and Validate Change Request**
### Phase 2: Risk Assessment & Approval (Steps 4-7)
**Step 4: Consolidate Impact Assessments**
### Phase 3: Implementation & Verification (Steps 8-12)
**Step 8: Execute Implementation Actions**
### Phase 4: Analytics & Continuous Improvement (Steps 13-14)
**Step 13: Generate MOC Analytics Report**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| MOC Completeness | All required sections populated, no blanks | 100% | 100% |
| Classification Accuracy | MOC classification validated by HSE review | >95% correct | >90% |
| Impact Assessment Coverage | All affected domains identified and assessed | 100% | >95% |
| Risk Assessment Conducted | Appropriate risk assessment per classification | 100% | 100% |
| Approval Turnaround | Approvals obtained within target cycle time | <10 business days | <15 business days |
| Implementation Closure Rate | Actions closed on time | >95% | >85% |
| Training Completion | All affected personnel trained before operational | 100% | 100% |
| PSSR Completion | PSSR conducted before startup (when required) | 100% | 100% |
| Temporary Change Compliance | Temporary changes removed/converted before expiry | 100% | >95% |
| Documentation Update | All PSI documents updated to reflect change | 100% | 100% |
| MOC Closure Rate | MOCs closed within 90 days of implementation | >90% | >80% |
| Emergency MOC Retroactive | Emergency MOCs fully documented within 72 hours | 100% | 100% |
| Archive Completeness | All MOC records archived per retention policy | 100% | 100% |
| Regulatory Compliance | MOC process satisfies OSHA/EPA/local requirements | 100% | 100% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `agent-operations` | Change origination | Operations team initiates MOCs for process and procedural changes; provides operating context and impact assessment |
| `agent-maintenance` | Change origination | Maintenance team initiates MOCs for equipment modifications; provides technical impact assessment and PM plan updates |
| `agent-hse` | Risk assessment | HSE provides risk assessment facilitation, safety impact evaluation, and regulatory compliance verification |
| `manage-vendor-documentation` (I-01) | Vendor data | Vendor documentation supporting equipment modifications and technology changes |
| `generate-operating-procedures` (I-02) | Procedure status | Current procedure revision status for impact assessment and update tracking |
| `track-document-currency` (I-03) | Document currency | Verification that all affected documents are current before MOC modifies them |
| `map-regulatory-requirements` (L-01) | Regulatory mapping | Identifies which regulatory requirements are affected by the proposed change |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `prepare-pssr-package` (I-04) | PSSR trigger | MOC completion triggers PSSR when equipment or process changes are involved |
| `track-incident-learnings` (L-02) | Change correlation | MOC data feeds into incident analysis to correlate changes with safety events |
| `audit-compliance-readiness` (L-04) | Compliance evidence | MOC register and records provide evidence for PSM/regulatory compliance audits |
| `generate-operating-procedures` (I-02) | Procedure updates | MOC implementation actions include procedure revision requirements |
| `develop-maintenance-strategy` (J-01) | Strategy updates | Equipment changes may trigger maintenance strategy revisions |
| `optimize-pm-program` (J-02) | PM plan updates | Equipment MOCs require PM program modifications in CMMS |
| `track-competency-matrix` (M-02) | Training triggers | MOCs generate training requirements for affected personnel |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `agent-project` | EPC interface | Engineering change notices from EPC phase feed into MOC process during commissioning |
| `agent-doc-control` | Document management | Document control manages revision control for all documents affected by MOCs |
| `orchestrate-or-program` (H-01) | OR integration | MOCs during OR phase tracked as part of overall OR program management |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
