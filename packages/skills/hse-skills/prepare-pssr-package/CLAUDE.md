---
name: prepare-pssr-package
description: "Prepare Pre-Startup Safety Review (PSSR) packages for system commissioning. Triggers: 'PSSR', 'pre-startup safety', 'revision de seguridad pre-arranque'."
---

# Prepare PSSR Package
## Skill ID: DOC-04
## Version: 1.0.0
## Category: B. Document Management
## Priority: P0 - Safety Critical
## Agent: Agent 2 - Documentation & Knowledge Management

## Purpose

Prepare comprehensive Pre-Startup Safety Review (PSSR) packages that verify all safety, operational, maintenance, and regulatory requirements are satisfied before introducing hazardous materials or energy into a new or modified process system. This skill automates the assembly, verification, and tracking of PSSR documentation while maintaining the rigor required for process safety compliance.

The PSSR is the final safety gate before a process system becomes operational. It is the last opportunity to catch deficiencies in design, construction, documentation, training, and emergency preparedness before hydrocarbons, chemicals, or other hazardous materials are introduced. Industry data paints a stark picture: 30-40% of startup incidents can be traced to failures in the Pre-Startup Safety Review process (Center for Chemical Process Safety - CCPS, "Guidelines for Performing Effective Pre-Startup Safety Reviews," 2007; CSB investigation findings). These failures include incomplete PSSR checklists, missing documentation items that were "waived" without proper risk assessment, and PSSRs conducted as administrative exercises rather than genuine safety reviews.

The consequences of PSSR failures are severe. The CSB investigation of the 2005 BP Texas City explosion found that inadequate startup procedures and incomplete safety reviews were contributing factors in an incident that killed 15 workers and injured 180. OSHA PSM enforcement data shows that PSSR violations consistently rank among the top 5 most-cited PSM elements, with penalties ranging from $15,000 to $156,259 per violation.

This skill directly addresses Pain Point CE-04 (Commissioning/Engineering Gap - Startup Incident Prevention) by ensuring that every PSSR package is complete, documented, verified, and traceable before startup authorization is granted.

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **PSSR Checklist Generation**: Generate system-specific PSSR checklists based on the scope of work (new installation, modification, or temporary change). Checklists must cover all elements required by OSHA 29 CFR 1910.119(i), including construction verification, equipment inspection, operating procedures, training, process safety information, and emergency response readiness. Checklists must be tailored to the specific equipment, hazards, and regulatory requirements of the system being reviewed.

2. **Document Package Assembly**: Automatically assemble all supporting documents required for the PSSR into a structured package. This includes approved P&IDs (as-built), operating procedures (current and approved), training records (all operators certified), punch list closure records, inspection certificates, commissioning test results, HAZOP recommendations closure status, and MOC completion verification. The agent must verify each document is present, at the correct revision, and approved.

3. **Gap Analysis & Risk Assessment**: Identify gaps in the PSSR package -- missing documents, incomplete checklist items, unresolved punch list items, outstanding HAZOP recommendations. For each gap, assess the risk: can the gap be accepted for startup with a compensating measure, or is it a "hold" that must be resolved before startup? This risk-based approach prevents both unnecessary delays (holding startup for trivial items) and unsafe startups (proceeding with critical gaps).

4. **Multi-Party Coordination**: PSSRs require input and sign-off from multiple parties: operations, maintenance, safety/HSE, engineering, commissioning, and sometimes the owner/operator, regulatory authorities, and insurance underwriters. The agent must track the status of each party's review, follow up on outstanding items, and consolidate all approvals into the final authorization package.

5. **Regulatory Compliance Verification**: Ensure the PSSR package satisfies all applicable regulatory requirements including OSHA 29 CFR 1910.119(i), EPA 40 CFR 68.77, Chilean DS 132 (mining operations), and any site-specific requirements from regulatory permits or consent conditions.

6. **Historical Tracking & Lessons Learned**: Maintain a register of all PSSRs conducted, their findings, open items, and closure dates. Analyze patterns in PSSR findings to identify systemic issues (e.g., consistently missing training records, recurring punch list categories) and feed back into project execution improvement.

## Trigger / Invocation

```
/prepare-pssr-package
```

**Aliases**: `/pssr`, `/pre-startup-review`, `/startup-safety-review`, `/revision-pre-arranque`

**Trigger Conditions**:
- A new system or equipment is approaching mechanical completion and commissioning
- A Management of Change (MOC) requires PSSR before returning modified system to service
- A system is being restarted after an extended shutdown (>6 months) or turnaround
- A temporary modification is being authorized for startup
- Regulatory authority or insurance underwriter requires PSSR documentation
- User requests PSSR package preparation for a specific system

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| System/Scope Definition | .docx, .xlsx | Clear definition of the system boundaries for this PSSR: equipment included, drawing references, PO numbers, battery limits. Must answer "what exactly are we reviewing?" |
| PSSR Trigger Type | Selection | New Installation / Modification (MOC) / Restart After Extended Shutdown / Temporary Change -- determines which checklist elements apply |
| As-Built P&IDs | .pdf, .dwg | Current as-built P&IDs showing the system as it has been constructed/modified. Must reflect red-line markups from construction. |
| Commissioning Completion Records | .xlsx, .pdf | Pre-commissioning and commissioning test results showing equipment has been tested and is ready for operation |
| Punch List Status | .xlsx | Current status of all construction/commissioning punch list items for the system, showing which are closed and which remain open (Category A/B/C) |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Operating Procedures (SOPs/EOPs) | .docx | Approved operating procedures for the system (verified current by DOC-03) |
| Training Completion Records | .xlsx | Records showing all operators and maintenance technicians have completed required training for this system |
| HAZOP Action Item Register | .xlsx | Status of all HAZOP recommendations for this system -- which are closed, which remain open |
| MOC Documentation | .docx, .xlsx | If trigger is a MOC: complete MOC package including risk assessment, approvals, and affected documentation list |
| Equipment Inspection Certificates | .pdf | Third-party inspection certificates (pressure vessels, lifting equipment, electrical installations) |
| Environmental Permit Conditions | .docx | Specific permit conditions that must be verified before introducing hazardous materials |
| Emergency Response Plan | .docx | Site emergency response plan updated for the new/modified system |
| Spare Parts Readiness | .xlsx | Confirmation that critical spare parts are available for the system |
| Previous PSSR Records | .xlsx | Historical PSSRs for similar systems (for lessons learned application) |
| Regulatory Agency Correspondence | .pdf | Any correspondence with regulatory authorities regarding startup conditions |
| Insurance Requirements | .docx | Insurance underwriter requirements for startup authorization |

### Input Validation Rules

- As-built P&IDs must be explicitly marked as "As-Built" or have red-line markups applied; IFC-only P&IDs generate a warning
- Operating procedures must be current (verified against DOC-03 currency tracker); outdated procedures are a HOLD item
- Training records must show completion dates within 12 months; older records require refresher training verification
- Punch list items classified as Category A (safety-critical) must be closed; open Category A items are automatic HOLD
- HAZOP recommendations classified as "Critical" must be closed or have approved interim safeguards documented
- Equipment certificates must be current (within inspection validity period)

## Output Specification

### Primary Output: PSSR Package (.xlsx + .pdf compilation)

**Filename**: `{ProjectCode}_PSSR_{SystemCode}_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "PSSR Cover Sheet"
| Field | Content |
|-------|---------|
| PSSR Reference Number | PSSR-{SiteCode}-{Year}-{Sequence} (e.g., PSSR-MDP-2026-015) |
| System Description | SAG Mill Grinding Circuit - System 100 |
| System Boundaries | Equipment tags 100-ML-001 through 100-CV-025 per P&IDs 100-001 through 100-015 |
| PSSR Trigger | New Installation |
| PSSR Team Members | Names, roles, and signatures of all PSSR team participants |
| PSSR Date(s) | Date(s) of PSSR walkdown and review meeting |
| PSSR Decision | APPROVED / APPROVED WITH CONDITIONS / NOT APPROVED |
| Conditions (if any) | List of conditions that must be met before or during startup |
| Authorization Signatures | Operations Manager, HSE Manager, Plant Manager |
| Target Startup Date | 2026-05-15 |

#### Sheet 2: "PSSR Checklist"
Comprehensive checklist organized by OSHA 29 CFR 1910.119(i) elements:

| # | Category | Checklist Item | Required (Y/N) | Status | Evidence Document | Verified By | Date | Comments |
|---|----------|---------------|----------------|--------|-------------------|-------------|------|----------|
| 1.1 | Construction | Construction and equipment is in accordance with design specifications | Y | PASS | Commissioning completion certificate CC-100-001 | J. Martinez | 2026-04-28 | |
| 1.2 | Construction | As-built P&IDs reflect actual installed configuration | Y | PASS | As-built P&IDs 100-001 Rev D through 100-015 Rev C | M. Chen | 2026-04-28 | 3 red-line items pending final drafting |
| 2.1 | Safety | Safety, operating, maintenance, and emergency procedures are in place and adequate | Y | CONDITIONAL | SOP-100-001 Rev 3, EOP-100-001 Rev 2 | C. Mendez | 2026-04-29 | SOP-100-003 in final review; expected 2026-05-05 |
| 2.2 | Safety | Process hazard analysis recommendations resolved or addressed | Y | CONDITIONAL | HAZOP-100 Rev 5 Action Register | P. Silva | 2026-04-29 | 2 of 47 recommendations open; interim safeguards documented |
| 3.1 | Training | Each employee involved in operating a process has been trained | Y | FAIL | Training records TR-100-2026 | R. Torres | 2026-04-29 | 3 of 24 operators have not completed practical assessment |

**Checklist Categories**:
1. Construction & Equipment Verification
2. Safety Systems & Safeguards
3. Operating Procedures
4. Emergency Procedures
5. Training & Competency
6. Process Safety Information
7. Maintenance Readiness
8. Environmental Compliance
9. Regulatory Requirements
10. Management of Change
11. Punch List Resolution
12. Spare Parts & Materials
13. Emergency Response
14. Insurance Requirements
15. Final Walkdown Verification

#### Sheet 3: "Document Verification Matrix"
| Document Type | Required | Document Number | Revision | Approved | Current | Location | Status |
|--------------|----------|----------------|----------|----------|---------|----------|--------|
| As-Built P&IDs | Y | P&ID-100-001 through -015 | Rev C-D | Y | Y | SharePoint/Drawings | COMPLETE |
| Operating Procedures | Y | SOP-100-001 to -005 | Rev 2-3 | 4 of 5 | Y | SharePoint/Procedures | 80% - SOP-100-003 pending |
| Emergency Procedures | Y | EOP-100-001 to -003 | Rev 2 | Y | Y | SharePoint/Procedures | COMPLETE |
| Vendor O&M Manuals | Y | VDR per VDRR Sheet | Various | Y | Y | SharePoint/Vendor Docs | 95% - 2 manuals pending |
| Training Records | Y | TR-100-2026 | Current | Partial | Y | Training Database | 87.5% - 3 operators incomplete |
| HAZOP Study | Y | HAZOP-100 Rev 5 | Rev 5 | Y | Y | SharePoint/Safety | COMPLETE |
| Inspection Certificates | Y | INSP-100-ML-001 etc. | Current | Y | Y | SharePoint/Inspection | COMPLETE |

#### Sheet 4: "Open Items & Risk Assessment"
For each PSSR item that is not fully satisfied:

| Item # | Description | Category | Risk Assessment | Compensating Measure | Disposition | Due Date | Owner | Status |
|--------|-------------|----------|----------------|---------------------|------------|----------|-------|--------|
| OI-001 | SOP-100-003 (Ball Mill Startup) not yet approved | Procedures | MEDIUM - experienced operators available; similar procedure from Phase 1 exists | Senior operator to supervise all ball mill startups until approved SOP available | CONDITIONAL ACCEPT | 2026-05-05 | C. Mendez | IN PROGRESS |
| OI-002 | 3 operators not yet completed practical assessment | Training | MEDIUM - all 3 have completed classroom training; practical pending | 3 operators restricted to supervised duties only until assessment complete | CONDITIONAL ACCEPT | 2026-05-10 | R. Torres | IN PROGRESS |
| OI-003 | HAZOP Rec #34: Install additional temperature alarm on bearing | Safety | LOW - vibration monitoring provides alternative early warning | Temporary increased operator round frequency (2-hourly vs. 4-hourly) | CONDITIONAL ACCEPT | 2026-06-15 | J. Martinez | OPEN |

#### Sheet 5: "PSSR Walkdown Findings"
Findings from the physical walkdown of the system:

| Finding # | Location | Description | Category | Photo Ref | Risk | Action Required | Owner | Due Date |
|-----------|----------|-------------|----------|-----------|------|----------------|-------|----------|
| WD-001 | Pump 100-PP-001A | Safety guard missing on coupling | Safety | IMG-001 | HIGH - HOLD | Install guard before startup | Mechanical | 2026-05-01 |
| WD-002 | Panel 100-PNL-03 | Emergency stop button partially obstructed by cable tray | Safety | IMG-002 | HIGH - HOLD | Relocate cable tray or E-Stop button | E&I | 2026-05-03 |
| WD-003 | Mill area | Emergency shower/eyewash not tested | HSE | IMG-003 | MEDIUM | Test and certify per ANSI Z358.1 | HSE | 2026-05-05 |

#### Sheet 6: "Authorization & Sign-Off"
Final authorization page with:
- PSSR team signatures and dates
- PSSR decision (Approved / Approved with Conditions / Not Approved)
- Conditions for conditional approval (if any)
- Startup authorization chain (who authorizes introduction of hazardous materials)
- Regulatory notification requirements (if applicable)
- Insurance notification requirements (if applicable)

### Secondary Output: PSSR Summary Report (.docx)

**Filename**: `{ProjectCode}_PSSR_Summary_{SystemCode}_v{version}_{date}.docx`

Narrative report (5-10 pages) including:
1. Executive Summary with PSSR decision
2. Scope and system description
3. PSSR methodology and team composition
4. Key findings summary
5. Open items and compensating measures
6. Risk assessment summary
7. Conditions for startup (if conditional approval)
8. Recommendation for management authorization

### Formatting Standards
- Header row: Bold, dark red background (#990000), white font
- Status coding: PASS=Green, CONDITIONAL=Amber, FAIL=Red, N/A=Grey
- Risk coding: HIGH=Red fill, MEDIUM=Amber fill, LOW=Green fill
- All HOLD items highlighted with red bold text
- Document reference hyperlinks to SharePoint locations where possible
- Photo references linked to embedded images or separate photo log
- Signature blocks formatted for both digital and wet signatures
- Watermark: "CONTROLLED DOCUMENT" on all pages

## Methodology & Standards

### Primary Regulatory Standards
- **OSHA 29 CFR 1910.119(i)** - Pre-Startup Safety Review: Core US PSM requirement. Requires PSSR for new facilities and for modified facilities when the modification is significant enough to require a change in process safety information. Must confirm: (1) Construction/equipment per design, (2) Safety/operating/maintenance/emergency procedures in place, (3) PHA recommendations resolved, (4) Training completed, (5) Modified facilities: MOC requirements met.
- **EPA 40 CFR 68.77** - Pre-Startup Review: RMP program requirement mirroring OSHA PSM PSSR requirements.
- **API RP 750** - Management of Process Hazards: Industry recommended practice for process hazard management including pre-startup reviews.

### International Standards
- **Seveso III Directive (2012/18/EU) Article 12** - Requires major accident prevention policy including procedures for startup and normal operation
- **UK COMAH Regulations** - Control of Major Accident Hazards: Requires demonstration of safe startup capabilities
- **IEC 61511-1** - Functional Safety: Requires verification of safety instrumented systems before startup (SIF/SIL validation)

### Chilean Regulatory Standards
- **DS 132 Art. 21** - Reglamento de Seguridad Minera: Requires pre-startup safety verification for mining operations
- **DS 594** - Workplace safety conditions must be verified before operation
- **SERNAGEOMIN requirements** - Mining-specific startup authorization requirements

### Industry Standards
- **CCPS "Guidelines for Performing Effective Pre-Startup Safety Reviews"** (2007): Definitive industry guide for PSSR methodology, checklists, and best practices
- **NFPA 45, 652, 654** - Fire protection verification requirements for startup
- **ASME codes** - Pressure equipment verification before service
- **API 510, 570, 653** - Inspection requirements before operation
- **IEEE standards** - Electrical system commissioning and startup requirements

### Industry Statistics
- 30-40% of startup incidents are attributable to PSSR failures or incomplete reviews (CCPS data)
- Average time to complete a PSSR for a major system: 2-4 weeks (including documentation assembly)
- Typical PSSR checklist: 100-300 items depending on system complexity
- OSHA PSM PSSR citation frequency: #4 most-cited PSM element (behind PHA, Operating Procedures, and Mechanical Integrity)
- Average PSSR open items at first review: 15-25% of checklist items (industry benchmark)
- Cost of OSHA PSM PSSR violation: $15,000-$156,259 per citation (2024 rates)
- Ratio of PSSR preparation effort (documentation assembly) to actual review: approximately 80:20 -- most effort is in gathering and verifying documents
- Startup delay due to incomplete PSSR: average 2-4 weeks per occurrence (IPA project benchmarks)

## Step-by-Step Execution

### Phase 1: Scope Definition & Checklist Generation (Steps 1-3)

**Step 1: Define PSSR Scope and Boundaries**
- Confirm system boundaries:
  - Equipment list (all tags within PSSR scope)
  - P&ID references (all drawings showing the system)
  - Physical boundaries (battery limits, isolation points)
  - Functional boundaries (what the system does, interfaces with adjacent systems)
- Determine PSSR trigger type and applicable regulatory requirements:
  - New Installation: Full PSSR per OSHA 29 CFR 1910.119(i)(1)-(4)
  - Modification (MOC): PSSR per OSHA 29 CFR 1910.119(i)(1)-(5); includes MOC verification
  - Restart: Scope based on duration and nature of shutdown; risk-based checklist
  - Temporary Change: Focused PSSR on temporary change scope; includes reversal requirements
- Identify PSSR team:
  - Operations representative (mandatory)
  - Maintenance representative (mandatory)
  - HSE representative (mandatory)
  - Engineering representative (mandatory)
  - Commissioning lead (for new installations)
  - Process safety engineer (for HHC or HHE facilities)
  - Additional: regulatory liaison, insurance representative (if required)

**Step 2: Generate System-Specific Checklist**
- Start with master PSSR checklist template (all 15 categories)
- Tailor to specific system by:
  - Including equipment-specific items (e.g., rotating equipment checks for pumps/compressors)
  - Including process-specific items (e.g., chemical compatibility checks for reagent systems)
  - Including regulatory-specific items (e.g., environmental permit conditions for emissions sources)
  - Excluding non-applicable items (e.g., pressure vessel certification for electrical-only systems) with documented rationale
- For MOC-triggered PSSRs:
  - Add MOC-specific items (change documentation complete, affected procedures updated, affected personnel notified)
  - Focus checklist on areas of change and immediately adjacent systems
- Number all checklist items sequentially by category
- Assign required evidence documents to each checklist item
- Set responsibility for each checklist item (which PSSR team member verifies)

**Step 3: Identify Required Documents**
- Generate document requirement list based on checklist items:
  - As-built P&IDs (verified current per DOC-03)
  - Operating procedures (verified current and approved per DOC-02)
  - Emergency procedures (verified current)
  - Training records (per create-training-plan output)
  - Commissioning test records (completion certificates, test results)
  - Equipment inspection certificates (pressure vessels, lifting equipment, electrical)
  - HAZOP study and action item closure status
  - MOC documentation (if applicable)
  - Vendor O&M manuals (per DOC-01 handover status)
  - Spare parts readiness confirmation (per PROC-01)
  - Environmental permit conditions compliance evidence
  - Safety system verification records (SIF/SIL testing results)
  - Fire protection system commissioning records
  - Emergency response plan (updated for new system)
  - Punch list status report (all Category A items closed)
- Query document management system (via mcp-sharepoint) for each required document
- Flag missing documents, wrong revisions, and unapproved documents

### Phase 2: Document Assembly & Verification (Steps 4-6)

**Step 4: Assemble Document Package**
- For each required document:
  - Retrieve from SharePoint document library (via mcp-sharepoint)
  - Verify revision matches expected (as-built/current revision)
  - Verify approval status (must be formally approved, not draft)
  - Verify currency (review date within required period, verified by DOC-03)
  - Extract key data (approval date, approver, revision history)
  - Add to PSSR package with cross-reference to checklist item
- For documents that exist but have issues:
  - Wrong revision: Flag and identify correct revision; escalate to document owner
  - Not yet approved: Flag as HOLD; track approval workflow status
  - Outdated (past review date): Flag as HOLD; coordinate with DOC-03 for urgent review
- For documents that do not exist (not yet created):
  - Flag as CRITICAL GAP
  - Identify responsible party and estimated creation timeline
  - Assess if startup can proceed without this document (risk assessment in Step 5)

**Step 5: Gap Analysis & Risk Assessment**
- Compile all gaps from Step 4 into structured gap list
- For each gap, perform risk assessment:
  - **Severity**: What is the worst-case consequence if we proceed without this item?
    - High: Potential for injury, environmental release, or regulatory violation
    - Medium: Potential for equipment damage or operational disruption
    - Low: Administrative non-conformance with no safety impact
  - **Likelihood**: How likely is the gap to cause a problem during startup?
    - High: Gap directly affects startup activities
    - Medium: Gap affects ongoing operation but not immediate startup
    - Low: Gap is administrative/housekeeping
  - **Compensating Measures**: What interim measures can mitigate the risk?
    - Specific, actionable measures (not generic statements)
    - Time-limited (compensating measure has an expiration date)
    - Monitored (someone is responsible for ensuring measure is in place)
- Classify each gap:
  - **HOLD**: Must be resolved before startup. No acceptable compensating measure exists. Examples: safety guard missing, untrained operator assigned to critical task, safety interlock not tested.
  - **CONDITIONAL ACCEPT**: Can proceed with documented compensating measure. Time-limited closure required. Examples: one SOP in final review with experienced operator supervision available; alarm not yet rationalized but manual monitoring in place.
  - **ACCEPT**: Low-risk item that does not affect safe startup. Track for closure but do not delay startup. Examples: final as-built P&ID drafting pending (red-lines are current); spare parts order placed but not yet received for non-critical item.

**Step 6: Consolidate PSSR Package**
- Assemble final PSSR workbook with all sheets
- Generate PSSR summary report document
- Create document verification matrix showing status of every required document
- Compile open items register with risk assessments and compensating measures
- Prepare PSSR walkdown agenda (checklist items requiring physical verification)
- Schedule PSSR review meeting with all team members
- Distribute PSSR package to team members for pre-review (via mcp-sharepoint and mcp-outlook)

### Phase 3: PSSR Execution & Authorization (Steps 7-9)

**Step 7: PSSR Walkdown**
- Conduct physical walkdown of the system with PSSR team
- Verify each walkdown checklist item in the field:
  - Equipment installed per P&ID and design specifications
  - Safety devices in place and functional (safety showers, fire extinguishers, emergency exits)
  - Safety interlocks tested and verified
  - Valve positions match startup lineup requirements
  - Electrical isolation points clearly labeled
  - Warning signs and labels in place
  - Housekeeping acceptable (no construction debris, tripping hazards)
  - Emergency access/egress unobstructed
  - Temporary construction items removed (scaffolding, temporary lighting, laydown areas)
- Document walkdown findings with photos
- Classify findings as HOLD or acceptable
- Update PSSR package with walkdown results

**Step 8: PSSR Review Meeting**
- Conduct formal PSSR review meeting with full team
- Review each checklist category systematically:
  - Present evidence for each item
  - Discuss and resolve any disagreements
  - Reach consensus on PASS/CONDITIONAL/FAIL for each item
  - Document compensating measures for CONDITIONAL items
  - Identify HOLD items requiring resolution
- Make PSSR decision:
  - **APPROVED**: All items PASS or acceptable with low-risk conditions
  - **APPROVED WITH CONDITIONS**: Some items CONDITIONAL; compensating measures documented; time-limited closures assigned. Startup may proceed.
  - **NOT APPROVED**: HOLD items remain unresolved. Startup may NOT proceed. Specify what must be resolved before re-review.
- Document meeting minutes, attendees, decisions, and action items
- Obtain team member signatures on PSSR authorization sheet

**Step 9: Authorization & Close-Out**
- If APPROVED or APPROVED WITH CONDITIONS:
  - Prepare startup authorization memorandum
  - Route for management signatures (Operations Manager, HSE Manager, Plant Manager)
  - Notify all parties of authorization and conditions
  - Issue formal startup authorization to operations team
  - Track conditional item closures:
    - Daily status update on open conditions
    - Escalate overdue conditions to management
    - Close conditions with evidence documentation
    - When all conditions closed, issue unconditional approval
- If NOT APPROVED:
  - Issue formal hold notification with specific requirements for resolution
  - Track resolution of HOLD items
  - Schedule re-review date
  - Repeat Steps 4-8 for HOLD items when resolved
- Archive complete PSSR package:
  - All checklists, evidence documents, meeting minutes, authorization
  - Store in permanent project records (per document retention policy)
  - Register in PSSR tracking database for historical analysis

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Checklist item coverage (% of applicable items addressed) | 100% | 100% (no skipping items) |
| Document verification accuracy (correct rev, approved, current) | 100% | >99% |
| HOLD item resolution before startup | 100% | 100% (non-negotiable for safety) |
| Conditional item closure within specified timeframe | 100% | >95% |
| PSSR team attendance (all required disciplines represented) | 100% | 100% |
| Walkdown finding documentation (photo evidence) | >90% | >80% |
| Time from PSSR initiation to decision | <14 days | <21 days |
| Open item tracking accuracy | 100% | >99% |
| Historical PSSR data capture (for lessons learned) | 100% | >95% |
| Regulatory compliance verification | 100% | 100% |

### Qualitative Standards

- **Safety First**: No HOLD item may be bypassed or waived without formal risk assessment documented and signed by the Plant Manager and HSE Manager. The PSSR is a safety gate, not a schedule gate.
- **Evidence-Based**: Every checklist item must have traceable evidence documentation. "Verified by observation" is acceptable for walkdown items but must be supported by dated photos and verifier signature.
- **Risk-Based Decision Making**: Conditional approvals must have genuine compensating measures, not administrative workarounds. "We'll fix it later" is not a compensating measure.
- **Multi-Discipline Verification**: No single individual can approve a PSSR alone. The team must include operations, maintenance, HSE, and engineering as minimum.
- **Transparency**: The PSSR decision and all conditions must be clearly communicated to everyone involved in startup operations. No startup should occur with unaware operators.

### Validation Process
1. Pre-PSSR: Verify all required documents are assembled (>95% before scheduling review)
2. During PSSR: Verify all checklist items are addressed (no blank items)
3. Post-PSSR: Verify all signatures obtained, all conditions time-bound, tracking system active
4. Post-Startup: Verify all conditional items closed within specified timeframe
5. Annual: Analyze PSSR findings trends; feed into project execution improvement

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-vendor-documentation` (DOC-01) | Vendor documents & certificates | Provides vendor O&M manuals, test certificates, and inspection records for PSSR package |
| `generate-operating-procedures` (DOC-02) | Operating procedures | Provides approved SOPs and EOPs required for PSSR verification |
| `track-document-currency` (DOC-03) | Currency verification | Verifies all documents in PSSR package are current and at correct revision |
| `manage-moc-workflow` (DOC-05) | MOC completion status | For MOC-triggered PSSRs, provides MOC closure verification and affected document lists |
| `create-training-plan` | Training completion records | Provides evidence that all operators have completed required training |
| `create-commissioning-plan` | Commissioning test results | Provides commissioning completion certificates and test records |
| `generate-initial-spares-list` (PROC-01) | Spare parts readiness | Confirms critical spare parts are available for startup |
| `create-risk-assessment` | HAZOP recommendation status | Provides status of all HAZOP/PHA recommendations for the system |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| Agent 3 - Operations | Startup authorization | PSSR approval is the gate for startup authorization to operations team |
| `track-incident-learnings` (COMP-02) | PSSR finding patterns | PSSR findings feed into incident prevention analytics and learning loops |
| `audit-compliance-readiness` (COMP-04) | Compliance evidence | PSSR records provide evidence for PSM compliance audits |
| Agent 1 - Project Management | Schedule impact | PSSR status directly impacts project commissioning schedule |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `map-regulatory-requirements` (COMP-01) | Regulatory verification | Ensures all applicable regulatory requirements are included in PSSR checklist |
| `create-maintenance-strategy` | Maintenance readiness | Verifies maintenance programs are established for new equipment |

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
