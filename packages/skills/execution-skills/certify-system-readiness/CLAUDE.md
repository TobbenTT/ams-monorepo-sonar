---
name: certify-system-readiness
description: "Certify system readiness for operations including PSSR and safety verification. Triggers: 'system readiness', 'PSSR', 'readiness certification', 'certificacion de sistemas'."
---

# Certify System Readiness

## Skill ID: CSNG-01

## Version: 1.0.0

## Category: Commissioning (Agent 6 - Execution)

## Priority: P1 - Critical

---

## Purpose

Manage the Turn-over, Care, Custody, and Control Certificate (TCCC) process and system readiness certification, ensuring each system is formally verified as ready for operational startup. The TCCC certificate is the definitive document that transfers a system from the construction/commissioning team to the operations team, and its absence or incompleteness is the single biggest cause of delayed startups.

The TCCC process represents the formal intersection of all operational readiness workstreams. It is the moment where construction completion, commissioning verification, operations readiness, safety clearance, and documentation completeness are all validated simultaneously. A well-managed TCCC process ensures that operations accepts only systems that are truly ready — protecting both safety and production targets.

Key value drivers:
- **Startup schedule protection**: TCCC is typically on the critical path to first production; delays in TCCC directly delay revenue
- **Safety assurance**: PSSR integration ensures no system starts without comprehensive safety verification
- **Accountability transfer**: Clear CCC (Care, Custody, Control) transfer prevents ambiguity about who is responsible for the system
- **Warranty activation**: TCCC date triggers warranty periods — premature or delayed TCCC has financial implications
- **Insurance compliance**: Insurer typically requires documented TCCC before operational insurance coverage activates

---

## Intent & Specification

The AI agent MUST:

1. **TCCC Certificate Management**: Create, populate, track, and manage TCCC certificates for each system/subsystem, ensuring all prerequisite conditions are met before certificate sign-off
2. **Pre-Startup Safety Review (PSSR)**: Integrate PSSR checklist results into system readiness verification, ensuring no system starts without safety clearance
3. **System Readiness Matrix**: Maintain a comprehensive readiness matrix showing all systems' status across dimensions: construction, commissioning, operations readiness, safety, documentation
4. **Post-RFSU Monitoring**: Track system performance during the initial operating period (typically 30-90 days) to verify sustained readiness before Final Acceptance

### Constraints

- TCCC requires sign-off from: Construction Manager, Commissioning Manager, Operations Manager, HSE Manager
- No system may start without completed PSSR
- Must track 100% of safety-critical systems individually
- Must integrate with progressive handover milestones
- Outstanding Category A punchlist items prevent TCCC approval (absolute requirement)
- Outstanding Category B punchlist items must have documented acceptance rationale signed by Operations Manager
- TCCC effective date triggers warranty start date and insurance coverage activation
- All TCCC evidence packages must be retained for minimum 10 years (regulatory and insurance requirement)
- Post-RFSU monitoring must continue for the full specified period even if system appears to be performing well

### TCCC Prerequisite Checklist

Before a TCCC can be submitted for approval, ALL of the following must be confirmed:

| # | Prerequisite | Responsible Agent | Verification Method |
|---|-------------|-------------------|-------------------|
| 1 | Mechanical Completion certificate issued | agent-execution (construction) | MC certificate document |
| 2 | All commissioning procedures executed and signed | agent-execution (commissioning) | Commissioning procedure records |
| 3 | Performance test completed with acceptable results | agent-execution (commissioning) | Performance test report |
| 4 | Pre-Startup Safety Review (PSSR) completed and cleared | agent-hse | PSSR clearance certificate |
| 5 | Category A punchlist items: ZERO | verify-construction-quality.md | Punchlist register |
| 6 | Category B punchlist items: accepted or resolved | verify-construction-quality.md | Acceptance documentation |
| 7 | Operating procedures approved and accessible | agent-operations | SOP approval records |
| 8 | Operators trained and qualified | agent-operations | Training completion records |
| 9 | Maintenance strategy defined and CMMS populated | agent-asset-management | CMMS setup confirmation |
| 10 | Critical spare parts in warehouse | agent-asset-management | Spare parts receipt confirmation |
| 11 | As-built documentation available | Engineering/Doc Control | Document transmittal records |
| 12 | Equipment preservation de-preserved and verified | manage-equipment-preservation.md | De-preservation records |

---

## Trigger / Invocation

### Manual Triggers

```
certify-system-readiness tccc --system [system-id] --action [create|update|submit|approve]
certify-system-readiness pssr --system [system-id] --action [initiate|update|clear]
certify-system-readiness matrix --view [summary|detail|critical-path]
certify-system-readiness post-rfsu --system [system-id] --action [start|update|review|close]
certify-system-readiness report --type [readiness|tccc-status|post-rfsu] --scope [system|phase|project]
```

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| System achieves RFSU status | Trigger TCCC preparation (create draft certificate) | Critical |
| All PSSR checklist items cleared for a system | Notify TCCC coordinator that PSSR gate is cleared | High |
| All 12 prerequisites confirmed for a system | Auto-generate TCCC package for approval routing | Critical |
| Post-RFSU monitoring period complete | Trigger Final Acceptance review | High |
| TCCC approval routing: signature received | Notify next signatory in sequence | High |
| TCCC approval: all 4 signatures received | Activate CCC transfer, update handover tracker | Critical |
| Post-RFSU KPI deviation >10% from design | Alert to operations and commissioning managers | High |

---

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| System Breakdown | Engineering | Yes | Complete system/subsystem hierarchy with boundaries |
| RFSU Certificates | Commissioning | Yes | Proof of commissioning completion per system |
| PSSR Checklists | HSE Agent | Yes | Safety review results per system |
| Operations Readiness | Operations Agent | Yes | Staff, procedures, spares status per system |
| Punchlist Status | Construction | Yes | Category A/B resolution confirmation per system |
| Performance Test Results | Commissioning | Yes | System performance vs. design criteria |
| Training Records | Operations (training) | Yes | Operator qualification per system |
| Maintenance Readiness | Asset Management | Yes | CMMS setup, maintenance plans, spare parts status |
| As-Built Documentation | Engineering/Doc Control | Yes | Updated P&IDs, equipment datasheets, vendor manuals |
| Equipment Preservation Records | Construction | No | De-preservation confirmation per system |
| Vendor Commissioning Reports | Vendors | No | Vendor sign-off on their equipment within the system |
| Insurance Requirements | Risk/Finance | No | Insurer TCCC requirements and coverage activation triggers |

### Input Validation Rules

1. System breakdown must be the approved project system breakdown (not a draft or working version)
2. RFSU certificates must be signed by the Commissioning Manager
3. PSSR checklists must be completed by a qualified PSSR team (not individual review)
4. Punchlist status must be confirmed within the last 72 hours before TCCC submission
5. Performance test results must show system meets at minimum 95% of design capacity or have documented acceptance of reduced performance

---

## Output Specification

### Document 1: TCCC Certificate (.docx)

**Structure:**

1. **Certificate Header**
   - Certificate unique ID (format: TCCC-[System ID]-[Rev])
   - System identification: ID, name, description
   - System boundaries: included equipment, tag range, physical boundaries
   - Associated P&ID references
   - Design capacity and key parameters

2. **Construction Completion Confirmation**
   - MC certificate reference number and date
   - Construction contractor name
   - Confirmation that all construction scope complete per design
   - Reference to final as-built documentation

3. **Commissioning Completion Confirmation**
   - RFSU certificate reference number and date
   - List of commissioning procedures executed (with reference numbers)
   - Performance test summary: key parameters vs. design (table format)
   - Commissioning contractor name (if different from construction)

4. **PSSR Clearance**
   - PSSR reference number and date
   - PSSR team composition
   - Confirmation all PSSR items cleared (or documented acceptance of outstanding items)
   - Reference to PSSR close-out report

See [`references/skill-output-details.md`](references/skill-output-details.md) for complete output field definitions and format details.

## Methodology & Standards

### Primary Standards
- **AACE RP 96R-18**: Commissioning and Startup Best Practices — defines TCCC process and system readiness verification
- **API 750**: Management of Process Hazards — PSSR requirements for process facilities
- **OSHA 1910.119**: Process Safety Management (PSM) — pre-startup safety review regulatory requirement (USA)
- **DS-IEC 61511**: Safety Instrumented Systems — SIS verification requirements before startup

### Asset Management Standards
- **ISO 55001**: Asset Management — Management Systems — defines handover and acceptance requirements
- **EN 16646**: Maintenance within Physical Asset Management — maintenance readiness at handover

### Industry Best Practices
- **CII RT-012**: Pre-Project Planning — system completion and handover best practices
- **COAA Best Practice**: Construction Owners Association of Alberta — turnover protocols
- **Energy Institute Guidelines**: Commissioning and startup of new facilities

### Client-Specific
- Client commissioning and startup procedures
- Client PSSR procedure and checklist
- Project-specific TCCC template and requirements

### VSC Methodology Integration
- **OR Playbook**: TCCC is the culmination of Level 5 (Commissioning & Startup) and the entry gate to Level 6 (Operations)
- **Progressive Handover**: TCCC is the formal handover instrument in the progressive handover framework
- **Quality Gates**: TCCC represents the final quality gate before operational startup

---

## Step-by-Step Execution

### Step 1: Prepare TCCC Template

**Objective:** Create system-specific TCCC certificate with all required sections and prerequisite conditions defined.

1. **Define system boundaries**
   - Obtain approved system breakdown structure
   - For each system: identify included equipment (tag list), physical boundaries (area/building), functional boundaries (what the system does)
   - Document exclusions: equipment or functions NOT part of this system
   - Create system boundary diagram (annotated P&ID excerpt)

2. **Create system-specific TCCC certificate from template**
   - Use project TCCC template (from `methodology/templates/commissioning/`)
   - Populate header: system ID, name, description, boundaries
   - Attach equipment list, P&ID references, design parameters

3. **Populate known information**
   - System description and design intent
   - Equipment list with tag numbers and descriptions
   - Design parameters (capacity, throughput, temperature, pressure, etc.)
   - Associated P&ID and drawing references

4. **Identify all prerequisite conditions for sign-off**
   - Map each of the 12 prerequisites to responsible parties
   - Set target dates for each prerequisite completion
   - Identify long-lead prerequisites and start tracking early
   - Create prerequisite tracking checklist for the system

### Step 2: Verify Prerequisites

**Objective:** Systematically confirm all 12 prerequisites are met before proceeding with TCCC approval.

1. **Confirm construction completion (MC certificate issued)**
   - Verify MC certificate signed and filed
   - Confirm MC scope matches TCCC system boundary
   - Check MC date is within acceptable timeframe (MC typically precedes TCCC by 2-8 weeks)

2. **Confirm commissioning completion (all commissioning procedures executed)**
   - Verify all commissioning procedures for the system are executed and signed
   - Check for any failed or incomplete tests
   - Confirm performance test completed with acceptable results
   - Obtain vendor sign-offs for vendor-commissioned equipment

3. **Verify PSSR completed and all items cleared or accepted**
   - Confirm PSSR conducted by qualified team
   - Review PSSR findings: all critical items must be cleared
   - Non-critical PSSR items may be accepted with documented rationale and risk assessment
   - Obtain PSSR clearance certificate from HSE

4. **Confirm operations readiness**
   - Operating procedures: all required SOPs approved and accessible to operators
   - Training: minimum number of qualified operators per shift confirmed
   - Maintenance: CMMS populated with equipment, maintenance plans active, first PM scheduled
   - Spare parts: critical and insurance spares confirmed in warehouse
   - Emergency response: emergency procedures tested for the system

5. **Verify outstanding punchlist items are acceptable**
   - Category A: must be ZERO (absolute requirement)
   - Category B: each must have documented acceptance rationale signed by Operations Manager
   - Category C: count documented, no individual acceptance required
   - Punchlist status must be confirmed within 72 hours of TCCC submission

### Step 3: Assemble Evidence Package

**Objective:** Compile all supporting documentation into a comprehensive evidence package attached to the TCCC.

1. **Collect all supporting certificates and records**
   - MC certificate (construction)
   - RFSU certificate (commissioning)
   - PSSR clearance certificate (HSE)
   - Vendor commissioning certificates (if applicable)
   - Equipment preservation de-preservation records

2. **Compile test results and performance data**
   - All commissioning procedure records (signed)
   - Performance test results with comparison to design criteria
   - SIS proof test results (if applicable)
   - Pressure test / leak test certificates
   - Electrical test certificates (megger, hi-pot, relay calibration)

3. **Gather training completion records**
   - Operator training completion certificates per individual
   - Competency assessment results
   - Trainer qualification records
   - Shift staffing plan showing qualified operators assigned

4. **Document any outstanding items with acceptance rationale**
   - Category B punchlist items: individual acceptance documentation
   - Outstanding PSSR items (if any): risk assessment and acceptance
   - Known limitations or conditions of operation
   - Monitoring or follow-up actions required during post-RFSU period

### Step 4: Route for Approval

**Objective:** Obtain all four required signatures through a structured approval process.

1. **Submit TCCC to Construction Manager**
   - Present evidence of construction completion
   - Confirm punchlist status (Cat A = 0, Cat B accepted)
   - Construction Manager reviews and signs
   - If rejected: document reasons, return to Step 2 for remediation

2. **Submit to Commissioning Manager**
   - Present evidence of commissioning completion
   - Confirm all tests passed and performance acceptable
   - Commissioning Manager reviews and signs
   - If rejected: document reasons, return to Step 2

3. **Submit to Operations Manager**
   - Present evidence of operations readiness
   - Confirm trained staff, approved procedures, spare parts, maintenance plans
   - Operations Manager accepts CCC transfer
   - Operations Manager reviews and signs
   - If rejected: document reasons, return to Step 2

4. **Submit to HSE Manager**
   - Present PSSR clearance evidence
   - Confirm safety systems verified and emergency procedures tested
   - HSE Manager reviews and signs
   - If rejected: document reasons, return to Step 2

5. **All 4 signatures = system transferred to operations**
   - TCCC effective date = date of last signature
   - Document control files the approved TCCC
   - Notification sent to all stakeholders

### Step 5: Activate CCC Transfer

**Objective:** Execute all administrative actions associated with system transfer to operations.

1. **Record effective date of transfer**
   - TCCC effective date becomes the CCC transfer date
   - All project tracking systems updated with transfer date
   - Progressive handover tracker updated

2. **Activate warranty period**
   - Notify procurement/contracts of warranty start date per equipment
   - Create warranty tracking entries in CMMS or contract management system
   - Warranty expiry dates calculated and recorded

3. **Update insurance coverage**
   - Notify insurance broker of system operational status
   - Construction All-Risk (CAR) policy coverage transitions to operational policy
   - Confirm coverage effective from TCCC date

4. **Transfer system to operations care, custody, and control**
   - Operations assumes 24/7 responsibility for the system
   - Maintenance team begins executing maintenance plans
   - Operations enters system into daily production reporting
   - Emergency response procedures activated for the system

5. **Update progressive handover tracker**
   - Mark system as "Transferred to Operations"
   - Update overall project transfer percentage
   - Recalculate critical path for remaining systems

### Step 6: Post-RFSU Monitoring

**Objective:** Verify sustained system performance during the initial operating period before Final Acceptance.

1. **Define performance criteria for 30/60/90-day monitoring**
   - Throughput: % of design capacity achieved and sustained
   - Availability: system uptime vs. planned operating time
   - Quality: product quality within specification
   - Safety: zero safety incidents attributable to system readiness gaps
   - Maintenance: unplanned maintenance events count and severity
   - Environmental: emissions/discharges within permit limits

2. **Track system performance against design parameters**
   - Daily data collection from operations
   - Weekly performance summary report
   - Comparison to design parameters and ramp-up curve
   - Deviation analysis for any underperformance

3. **Document and resolve operational issues**
   - Log all operational issues discovered during monitoring period
   - Classify: design issue, construction defect, commissioning gap, operations error, normal break-in
   - Track resolution of each issue
   - Escalate unresolved issues that affect performance criteria

4. **At end of monitoring period, recommend Final Acceptance or extended monitoring**
   - **Final Acceptance criteria met**: All performance criteria sustained for monitoring period
     - Issue Final Acceptance Certificate
     - Close out post-RFSU monitoring
     - Transition to normal operations performance reporting
   - **Extended monitoring**: Performance criteria not consistently met
     - Document specific gaps
     - Define corrective actions required
     - Extend monitoring period (typically 30-day increments)
     - Re-evaluate at end of extension

---

## Quality Criteria

| Criterion | Metric | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| Certificate Completeness | All TCCC fields populated with valid data | 100% | Certificate audit checklist |
| PSSR Compliance | Systems started with completed PSSR | 100% | PSSR clearance register |
| Signature Completeness | All 4 signatories signed before startup | 100% | TCCC signature audit |
| Evidence Package | All 12 prerequisite documents attached | 100% | Evidence package checklist |
| Post-RFSU Tracking | Monitoring data recorded per schedule | Weekly for 90 days | Monitoring log review |
| Prerequisite Verification | All 12 prerequisites verified within 72 hours of TCCC submission | 100% | Verification timestamp check |
| Approval Cycle Time | Time from TCCC submission to final signature | <10 business days | TCCC tracking log |
| Final Acceptance Rate | Systems achieving Final Acceptance within initial monitoring period | >85% | Post-RFSU monitoring records |

### Quality Gate Checklist

Before submitting a TCCC for approval, ALL must be confirmed:

- [ ] System boundary clearly defined with equipment list and P&ID references
- [ ] MC certificate issued and filed
- [ ] All commissioning procedures executed and signed
- [ ] Performance test completed with acceptable results
- [ ] PSSR completed and all items cleared (or accepted with documented rationale)
- [ ] Category A punchlist items: ZERO
- [ ] Category B punchlist items: accepted with signed rationale (or resolved)
- [ ] Operating procedures approved and accessible
- [ ] Minimum qualified operators confirmed per shift
- [ ] CMMS populated and maintenance plans active
- [ ] Critical spare parts confirmed in warehouse
- [ ] As-built documentation available
- [ ] Equipment de-preservation confirmed
- [ ] Evidence package assembled and complete
- [ ] TCCC reviewed by TCCC coordinator before routing

---

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| agent-execution (commissioning) | Self | TCCC is the culmination of the commissioning process |
| agent-execution (construction) | Upstream | MC certificates and punchlist status are TCCC prerequisites |
| track-progressive-handover.md | Bilateral | TCCC is the formal handover instrument; handover tracker must reflect TCCC status |
| agent-operations | Upstream | Operations readiness confirmation (staff, SOPs, training) required for TCCC |
| agent-hse | Upstream | PSSR clearance required for TCCC; no system starts without PSSR |
| agent-asset-management | Upstream | Spare parts availability and maintenance readiness confirmation required |
| agent-asset-management (CMMS) | Upstream | CMMS populated with equipment and maintenance plans active |
| manage-equipment-preservation.md | Upstream | De-preservation confirmation required before TCCC |
| verify-construction-quality.md | Upstream | Punchlist resolution status is a direct TCCC prerequisite |
| orchestrate-or-agents | Reporting | System readiness status reported in OR gate reviews |

### Dependency Protocols

1. **Prerequisite Collection**: Agent must proactively request prerequisite confirmation from all upstream agents starting 30 days before target TCCC date
2. **PSSR Coordination**: Agent must coordinate with HSE agent to schedule PSSR at least 14 days before target TCCC date to allow time for finding resolution
3. **Operations Acceptance**: Agent must present system status to Operations Manager for preliminary review at least 7 days before formal TCCC submission
4. **Handover Tracker Update**: Agent must update progressive handover tracker within 24 hours of TCCC approval
5. **Post-RFSU Reporting**: Agent must provide weekly post-RFSU performance summaries to orchestrate-or-agents for inclusion in project status reports

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

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
