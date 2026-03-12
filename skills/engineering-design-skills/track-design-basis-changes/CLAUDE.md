---
name: track-design-basis-changes
description: "Track changes to the project Design Basis Document and assess cascading impact across engineering disciplines, cost, and schedule. Triggers: 'design basis change', 'basis of design update', 'BOD change impact', 'cambio de base de diseno', 'impacto cambio de criterios', 'actualizacion base de diseno'."
---

# Track Design Basis Changes
## Skill ID: track-design-basis-changes
## Version: 1.0.0
## Category: D - Monitoring
## Priority: High

## Purpose

The Design Basis Document (DBD), also known as the Basis of Design (BOD), defines the fundamental engineering parameters upon which all detailed design work is built: process feed compositions, throughput capacities, ambient conditions, seismic criteria, applicable codes and standards, client design philosophies, utility availability, and environmental discharge limits. Every engineering discipline derives its design criteria from this single foundational document. When any parameter in the design basis changes -- whether driven by updated geological data in mining, revised feed quality in oil and gas, new regulatory requirements, or client scope modifications -- the impact cascades through multiple disciplines, potentially affecting hundreds of engineering deliverables, procurement specifications, and construction work packages.

Uncontrolled design basis changes are among the most destructive forces in capital project execution. Industry data from the Construction Industry Institute (CII) shows that projects with poor design change management experience 10-25% cost growth and 15-30% schedule extension compared to well-managed peers. The root cause is rarely the change itself -- it is the failure to identify and manage the full cascade of impacts. A seemingly simple change to the design ambient temperature from 40C to 45C affects HVAC sizing, electrical equipment derating, instrument enclosure ratings, structural steel thermal expansion allowances, and personnel comfort requirements. Missing any one of these downstream impacts creates latent design errors that emerge as field rework during construction.

This skill provides a systematic framework for capturing design basis changes, performing multi-discipline impact cascade analysis, quantifying cost and schedule consequences, tracking the implementation of changes through all affected deliverables, and maintaining an auditable change history. It ensures that every design basis change is treated with the rigor it demands, protecting the project from the compounding effects of unmanaged design drift.

The skill integrates tightly with the formal Engineering Change Request (ECR) and Engineering Change Notice (ECN) governance process, ensuring that design basis changes are properly authorized before implementation and that the full impact is visible to project decision-makers before approval. In Operational Readiness projects, design basis changes during the late engineering phases are particularly disruptive because they can invalidate operations manuals, training materials, maintenance strategies, and spare parts lists that have already been developed based on the original design parameters.

## Intent & Specification
The AI agent MUST understand that:

1. **The Design Basis Document is the master reference for all engineering work.** Any parameter within it has the potential to affect multiple disciplines simultaneously. The agent must maintain a parameter-to-discipline dependency matrix that maps every design basis parameter to:
   - The disciplines it directly influences
   - The deliverable types within each discipline that are affected
   - The severity of the dependency (Critical / High / Medium / Low)
   - This matrix is the core tool for impact cascade analysis and must be established at project inception.

2. **Impact assessment must be exhaustive, not selective.** When a design basis parameter changes, the agent must trace the impact through every discipline in the dependency matrix, not just the discipline that originated the change. Example cascade:
   - A process temperature change affects mechanical design (material selection)
   - Which affects structural design (equipment weight change from different material)
   - Which affects instrument design (transmitter ratings)
   - Which affects electrical design (hazardous area classification if flash point changes)
   - Which affects piping design (stress analysis at new temperature)
   - Missing a single discipline creates a latent error far more expensive to fix in the field.

3. **Cost and schedule impacts must be quantified, not merely described.** Each affected deliverable must be assessed for:
   - Engineering rework hours (using the deliverable weight from the EDDR)
   - Procurement impact (re-quotation, re-specification, or change order to vendor)
   - Construction impact (field modification, rework, or delay)
   - The total impact must be presented as a cost estimate and schedule delta for project management decision-making.

4. **Design basis changes after IFC require Management of Change (MOC) discipline.** Once deliverables have been issued for construction, any design basis change triggers a formal MOC process involving:
   - Field change notices
   - As-built markup requirements
   - Construction impact assessment
   - Stop-work consideration for affected work fronts
   - The governance rigor escalates significantly post-IFC due to the multiplying cost of changes.

5. **A parameter freeze date must be established and enforced.** The project must define a date after which no further design basis changes are accepted without formal Project Manager approval and documented business justification. The agent must:
   - Track all changes relative to this freeze date
   - Flag any post-freeze changes for heightened governance
   - Require written Project Manager approval before impact assessment begins for post-freeze changes

## Trigger / Invocation
```
/track-design-basis-changes
```

### Natural Language Triggers
- "The client has changed the feed composition -- assess the impact"
- "Track the design basis revision from Rev C to Rev D"
- "What deliverables are affected by the updated seismic criteria?"
- "El cliente cambio la composicion del alimentador -- evaluar impacto"
- "Rastrear la revision de la base de diseno de Rev C a Rev D"
- "Que entregables se ven afectados por los nuevos criterios sismicos?"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_code` | Unique project identifier | String | Project context |
| `change_description` | Detailed description of the design basis parameter that changed, including the reason for the change and the originator | Text | Engineering Lead or Client directive |
| `previous_value` | Original design basis value, criteria, or specification with units and reference to the DBD revision | Text/Number | Previous DBD revision |
| `new_value` | Updated design basis value, criteria, or specification with units and source reference | Text/Number | New DBD revision or client directive |
| `parameter_discipline_matrix` | Matrix mapping design basis parameters to affected engineering disciplines and deliverable types | .xlsx | Engineering Manager (or project standard template) |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `deliverable_list` | Current EDDR for identification of specific affected deliverables and their status | Retrieved from manage-engineering-deliverables skill output |
| `cost_rates` | Engineering manhour rates by discipline and procurement re-quotation cost estimates for impact quantification | Project standard rates from Execution agent |
| `freeze_date` | Design basis parameter freeze date for governance classification of the change | No freeze date defined; all changes treated with standard governance |
| `procurement_status` | Current procurement package status (PO issued, in bid, not yet issued) for affected equipment | Retrieved from Contracts & Compliance agent |

### Context Enrichment
The agent should automatically:
- Retrieve the current EDDR from the manage-engineering-deliverables skill to identify the specific deliverables affected by the change, their current lifecycle status, and the engineering effort (weight) required to revise them
- Pull the engineering change register from the Execution agent to assign the correct ECR/ECN number and link the design basis change to the formal change governance process
- Cross-reference with the procurement status register to identify any equipment already on order that may be affected by the changed parameter, enabling immediate assessment of vendor change order implications
- Check for previously assessed design basis changes that may interact with or compound the current change (cumulative impact analysis), preventing the common error of assessing changes in isolation
- Retrieve the latest project risk register to determine if the change triggers any previously identified project risks or requires new risk entries

## Output Specification

### Document: Design Basis Change Impact Report (.md / .xlsx)
**Filename**: `VSC_DesignBasisChange_{ChangeID}_{ProjectCode}_v{Version}_{Date}.md`

**Structure**:

1. **Change Summary**
   - Parameter changed: name, category, DBD section reference
   - Previous value with units and DBD revision reference
   - New value with units and source reference
   - Reason for change: client directive, regulatory update, process optimization, site data update
   - Originator of the change request
   - Date of change request
   - ECR/ECN number (linked to formal governance)
   - Relationship to parameter freeze date: pre-freeze / post-freeze / post-IFC
   - Change classification: process conditions, site data, regulatory, client philosophy, capacity

2. **Discipline Impact Matrix**
   - One row per project discipline
   - Impact severity: Critical / High / Medium / Low / None
   - Nature of impact (brief technical explanation of how the parameter change affects this discipline)
   - Number of deliverables affected within the discipline
   - Estimated rework manhours for the discipline
   - Confirmation status: Assessed / Pending / Confirmed by discipline lead (with sign-off date)

3. **Affected Deliverable Register**
   - Document number
   - Document title
   - Discipline
   - Current lifecycle status
   - Current revision
   - Required action: Revise / Review / Verify / No-Change
   - Estimated rework manhours
   - Target revision completion date
   - Assigned engineer

4. **Cost Impact Assessment** -- Three-part cost analysis:
   - (a) Engineering rework cost: manhours x rates by discipline, separated by discipline to identify largest cost drivers
   - (b) Procurement impact: re-quotation costs, change order estimates, cancellation costs, re-procurement costs
   - (c) Construction impact: field modification costs, delay costs if applicable, additional inspection/testing costs
   - Total estimated cost presented as a range: best case / expected / worst case

5. **Schedule Impact Assessment**
   - Critical path analysis: does the change delay any IFC dates beyond the construction need-by date?
   - Net schedule impact in working days
   - Identification of the longest chain of dependent revisions
   - Recovery options analysis: overtime, additional resources, parallel working
   - Forecast schedule position with and without the change

6. **Recommended Actions and Approvals**
   - Prioritized action list with: action item, responsible party, target date
   - Required approvals: Engineering Manager, Project Manager, Client
   - Decision timeline with consequences of delay
   - Options analysis (if applicable): full implementation vs. partial vs. deferred vs. deviation acceptance

### Parameter-to-Discipline Dependency Matrix (Standard Template)
| Design Basis Parameter Category | Process | Mechanical | Piping | Structural | Electrical | Instrumentation | Civil | HVAC |
|-------------------------------|---------|-----------|--------|-----------|-----------|----------------|-------|------|
| Feed composition / quality | Critical | High | Medium | None | Low | High | None | None |
| Throughput / capacity | Critical | Critical | High | Medium | High | High | Low | Low |
| Design pressure / temperature | Critical | Critical | High | Medium | Low | High | None | None |
| Ambient temperature range | Low | Medium | Medium | High | High | Medium | Medium | Critical |
| Seismic criteria | None | Medium | High | Critical | Medium | Medium | Critical | Low |
| Electrical area classification | None | Low | None | None | Critical | Critical | None | Medium |
| Environmental discharge limits | High | Low | Medium | None | None | High | Medium | None |
| Design codes and standards | Medium | High | High | High | High | High | High | Medium |
| Site geotechnical data | None | None | Low | High | Low | None | Critical | None |
| Utility availability | High | Medium | Medium | None | Critical | Medium | None | High |

### Change Classification Definitions
| Classification | Description | Typical Sources | Governance Level |
|---------------|-------------|----------------|-----------------|
| Process Conditions | Changes to feed composition, throughput, operating temperatures, pressures, or product specifications | Updated geological model, process optimization, market requirements | Engineering Manager approval |
| Site Data | Changes to ambient conditions, seismic criteria, wind loads, geotechnical parameters | Site investigation results, updated meteorological data, regulatory reclassification | Engineering Manager approval |
| Regulatory | Changes to applicable codes, standards, environmental limits, or safety requirements | New regulations, updated standards, regulatory authority directives | Engineering Manager + compliance review |
| Client Philosophy | Changes to design margins, redundancy requirements, material preferences, or operational philosophy | Client design review comments, operational experience, corporate standards update | Project Manager + Client approval |
| Capacity | Changes to plant throughput, storage volumes, utility demand, or product mix | Business case update, market demand change, phased development decision | Project Manager + Client approval |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Impact Assessment Completeness | Disciplines assessed / total project disciplines | 100% -- every discipline must be evaluated |
| Deliverable Identification Accuracy | Affected deliverables identified / actual affected deliverables (measured post-implementation) | > 95% identification rate |
| Cost Estimate Accuracy | Estimated impact vs. actual cost of implementing the change (post-completion comparison) | Within +/- 25% at impact assessment stage |
| Assessment Turnaround Time | Time from change request receipt to completed impact report | < 5 working days for standard changes; < 2 days for urgent changes |
| Change Implementation Tracking | Affected deliverables revised and re-issued / total affected deliverables | 100% implementation before affected areas reach IFC |

## Procedure

### Step 1: Capture and Classify the Change
- Record the design basis change with full detail:
  - Parameter name and DBD section reference
  - Previous value with units and DBD revision reference
  - New value with units and source reference
  - Reason for the change
  - Originator: client, regulatory body, engineering discipline, site investigation, or process optimization
- Assign an ECR number from the engineering change register:
  - Link to the formal change governance process managed by the Execution agent
  - Ensure the change enters the official project change control system
- Classify the change relative to the parameter freeze date:
  - Pre-freeze: normal governance process applies
  - Post-freeze: heightened governance with Project Manager approval required before impact assessment
  - Post-IFC: formal Management of Change process required including construction impact assessment
- Classify the change by parameter type using the Change Classification Definitions:
  - Process conditions (temperatures, pressures, flows, compositions)
  - Site data (ambient conditions, seismic, wind, geotechnical)
  - Regulatory (codes, standards, environmental limits)
  - Client philosophy (design margins, redundancy, material preferences)
  - Capacity (throughput, storage, utility demand)
- Assess urgency based on downstream dependencies:
  - Is the change blocking active engineering work?
  - Are procurement packages about to be issued based on the old parameter?
  - Are construction activities imminent in the affected area?
  - Is the change safety-related requiring immediate implementation?
- Notify the Engineering Manager and all potentially affected discipline leads:
  - Provide the change summary
  - Request preliminary assessment within 2 working days
- Record the change in the design basis change log:
  - Assign a sequential change ID
  - Link to the ECR number
  - Record the cumulative change count since project inception

### Step 2: Perform Multi-Discipline Impact Cascade Analysis
- Load the parameter-to-discipline dependency matrix and identify all affected disciplines:
  - Start with direct dependencies (Critical and High severity in the matrix)
  - Extend to indirect dependencies (Medium and Low)
  - Do not skip any discipline -- every one must be explicitly assessed
- For each affected discipline, conduct a structured assessment:
  - What specific design calculations are affected?
  - What equipment selections may change?
  - What material specifications are impacted?
  - What drawing content must be revised?
  - Document the technical reasoning chain from changed parameter to design impact
- Assess the severity of impact for each discipline:
  - Critical: fundamental design change required, major deliverables revised from scratch
  - High: significant revision to multiple deliverables, recalculation of key parameters
  - Medium: revision to some deliverables, verification checks required
  - Low: minor updates or documentation changes only
  - None: confirmed no impact after analysis (with documented reasoning)
- Identify second-order cascade impacts:
  - Example: process temperature change requires material upgrade (first order)
  - Material upgrade changes equipment weight (second order)
  - Weight change affects structural foundation design (third order)
  - Trace the cascade until all impacts are identified
- Cross-reference with the EDDR to identify every specific affected deliverable:
  - Record document number, current lifecycle status, and current revision
  - Determine required action based on lifecycle status
- For each affected deliverable, determine the required action:
  - Planned or In-Progress: scope update only
  - IFR or IFA: formal revision and resubmission
  - IFC: field change notice and formal revision
- Obtain confirmation from each discipline lead:
  - Impact assessment for their discipline is complete and accurate
  - Sign-off recorded in the impact report

### Step 3: Quantify Cost and Schedule Impact
- Calculate engineering rework cost:
  - Sum weighted manhour effort for all affected deliverables requiring revision
  - Multiply by applicable discipline manhour rate
  - Separate by discipline to identify the largest cost drivers
- Assess procurement impact by cross-referencing the procurement status register:
  - Equipment with POs already issued: estimate vendor change order costs
  - Equipment in bid phase: estimate re-specification and bid extension costs
  - Equipment not yet in procurement: change absorbed at no incremental cost
- Assess construction impact:
  - Identify IFC drawings already issued and in use for construction
  - Estimate field modification costs if construction has progressed past the point of change
  - Calculate delay costs if the change creates a construction hold
  - Estimate additional inspection and testing costs for rework
- Sum all cost components to produce the total estimated cost:
  - Engineering rework + procurement impact + construction impact
  - Present as a range: best case / expected / worst case
- Calculate the schedule impact:
  - Identify the latest forecast revision completion date for any affected critical-path deliverable
  - Compare against the construction need-by date
  - Express schedule impact in working days
- Perform options analysis where applicable:
  - Option A: implement full change
  - Option B: partial implementation
  - Option C: accept existing design with documented deviation
  - Option D: defer change to a future project phase
  - Present each option with cost, schedule, and risk implications
- Present the cost/schedule impact for decision-making:
  - Clear recommendation with supporting rationale
  - Format suitable for Project Manager and Client review

### Step 4: Track Implementation Through Affected Deliverables
- Create a change implementation tracker listing every affected deliverable:
  - Document number
  - Required action: Revise / Review / Verify
  - Responsible engineer
  - Target completion date (driven by IFC schedule)
  - Current status
  - Completion date when done
- Distribute the tracker to all affected discipline leads:
  - Clear instructions on which deliverables must be revised
  - What parameter has changed and the new value
  - By when the revision must be completed
- Monitor implementation status weekly:
  - Update the tracker in the interdisciplinary coordination meeting
  - Flag any deliverables falling behind target
- Verify revised deliverables incorporate the change correctly:
  - Review the revision description on each re-issued document
  - Confirm the changed parameter is reflected in the design
- Ensure the Design Basis Document itself is formally revised:
  - Approved and re-issued with the updated parameter value
  - EDDR reflects the new DBD revision reference
- Track procurement package updates:
  - Affected requisitions and purchase orders reflect the changed design basis
  - Coordinate vendor change orders through the Contracts & Compliance agent
- Close the change in the engineering change register only when:
  - All affected deliverables have been revised and re-issued
  - The DBD revision is issued
  - All procurement updates are confirmed
  - Implementation tracker shows 100% completion

### Step 5: Report, Communicate, and Archive
- Compile the Design Basis Change Impact Report with all sections:
  - Change summary
  - Discipline impact matrix
  - Affected deliverable register
  - Cost impact assessment
  - Schedule impact assessment
  - Recommended actions
- Present to the Engineering Manager and Project Manager for approval decision:
  - Clear recommendation: proceed, defer, or reject
  - Consequences of each option quantified
- For changes requiring Client approval:
  - Prepare a formal change notification package
  - Include the impact report, cost estimate, schedule impact, and options analysis
- Once approved, communicate to all affected discipline leads:
  - Specific instructions on which deliverables require revision
  - Target completion dates
  - Ensure no discipline is left uninformed
- Update the project risk register:
  - If the change introduces new risks (e.g., late-stage design change increasing rework probability)
  - If the change modifies existing risk profiles
- Feed the cost and schedule impact data to the Execution agent:
  - Integration into the project cost report
  - Schedule update
  - Earned value analysis
- Archive the complete change package in the project document control system:
  - Impact report, approval documentation, implementation tracker
  - Revised DBD, all correspondence
  - Cross-references for audit trail and project close-out

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Incomplete discipline impact assessment | Assessor only checks the originating discipline and one or two obvious ones, missing indirect impacts | Mandatory use of the parameter-to-discipline dependency matrix; require explicit "No Impact" confirmation signed by every discipline lead |
| Cumulative impact of multiple small changes not recognized | Each change assessed individually without considering interaction effects between sequential changes | Maintain a cumulative change impact register; periodic review (monthly) of total design basis drift from the original baseline; flag when cumulative changes exceed 5% of parameter set |
| Cost impact understated | Only direct engineering rework hours counted; procurement change orders and construction field modification costs omitted | Impact assessment template mandates three cost categories: engineering, procurement, construction; each must be explicitly assessed even if zero |
| Post-IFC changes handled informally | Change implemented by verbal instruction to construction supervisor without formal MOC documentation | Mandatory MOC process for all post-IFC design basis changes; no field implementation without approved field change notice and updated drawing |
| Parameter freeze date not enforced | Changes continue to be accepted after the freeze date without heightened governance or business justification | Automated flagging of post-freeze changes; Project Manager written approval required before impact assessment begins; change register tracks freeze-date compliance |
| Design basis document revision lag | DBD not updated to reflect approved changes, creating discrepancy between the document and actual design parameters in use | DBD revision cycle triggered automatically by approved change; maximum 10 working days from change approval to revised DBD issue; tracked in the change register |
| Affected deliverables not tracked to closure | Impact report produced but implementation not monitored; some deliverables remain at the old design basis when issued for IFC | Mandatory weekly tracker update in coordination meeting; change not closed in ECR register until 100% implementation confirmed with documentary evidence |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Design basis change with estimated cost impact > USD 100K | At impact assessment completion | Project Manager approval required before implementation; Client notification if contractual cost impact |
| Design basis change affecting construction critical path schedule | At impact assessment completion | Project Manager and Construction Manager joint review; recovery plan required within 48 hours |
| Post-freeze design basis change requested | At request receipt | Engineering Manager and Project Manager written approval required before impact assessment can begin |
| Post-IFC design basis change affecting construction work in progress | Immediate (within 4 hours) | Construction Manager, Engineering Manager, and Project Manager emergency review; stop-work consideration for affected work front |
| Cumulative design basis changes exceeding 10% of original parameter set since project inception | At detection during monthly review | Project Manager and Client joint review; project re-baseline consideration |
| Affected deliverable revision falling behind implementation tracker target by > 10 working days | At weekly review | Discipline Lead notification and Engineering Manager escalation; resource reallocation within 5 working days |
| Client-directed change received without formal change request documentation | At detection | Project Manager notification to client counterpart; formal ECR required before impact assessment can proceed |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | Impact assessment correctly identifies all affected disciplines; cost estimates within +/- 25% of actual (validated post-completion) |
| Completeness | 25% | 100% discipline coverage | Every project discipline explicitly assessed for impact; every affected deliverable identified and registered in the implementation tracker |
| Consistency | 15% | Zero conflicts | Impact assessment aligned with ECR register, EDDR, project schedule, and procurement status; no contradictory information |
| Format | 10% | Professional | VSC template with clear impact matrices, cost breakdown tables, schedule analysis, and executive summary suitable for decision-making |
| Actionability | 10% | Immediately usable | Report enables Project Manager to make approval/rejection decision within one meeting without requesting additional analysis |
| Traceability | 10% | Full audit trail | Change linked to ECR number; every affected deliverable linked to implementation tracker; approvals documented with signatures and dates |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Operations | Process parameter changes (feed composition, throughput, operating conditions, utility requirements) | Source of process-driven design basis changes requiring impact assessment |
| HSE | Regulatory requirement changes (environmental discharge limits, safety standards, hazardous area reclassification) | Source of regulatory-driven design basis changes |
| Execution | Client-directed scope changes, contractual modifications, project schedule and critical path data | Source of client-driven changes; ECR/ECN governance; schedule impact analysis |
| Contracts & Compliance | Procurement status register (POs issued, equipment in bid, vendor data received) | Assessment of procurement impact for affected equipment and materials |
| Asset Management | Equipment standardization requirements from existing plant fleet | Assessment of impact on maintenance strategies and spare parts for changed equipment specifications |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Cost and schedule impact assessment with quantified estimates | Variation/change order management; project cost report update; schedule revision |
| Contracts & Compliance | Revised procurement specifications and vendor change order requirements | Procurement package re-issue, vendor re-quotation, and change order negotiation |
| Asset Management | Revised equipment design parameters and updated datasheets | Maintenance strategy update for changed equipment specifications; spare parts list revision |
| Orchestrator | Design basis change status, cumulative change tracking, and project risk impact | Governance reporting, risk register updates, and client communication |
| All Engineering Disciplines | Updated design parameters, affected deliverable list, and implementation schedule | Design revision implementation across all disciplines per the implementation tracker |

## References
- `methodology/or-playbook-and-procedures/` -- OR procedures including engineering change management and MOC protocols
- `methodology/capital-projects/` -- Capital project change control frameworks and cost estimation standards
- Construction Industry Institute (CII) RT-158 -- Effective Management of Engineering Changes in Capital Projects
- AACE International RP 52R-06 -- Time Impact Analysis as Applied to Construction Projects
- ISO 16739-1 -- Industry Foundation Classes (IFC) for data sharing in the construction and facility management industries (information management for design changes)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
