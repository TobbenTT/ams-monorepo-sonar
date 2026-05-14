---
name: conduct-constructability-review
description: "Facilitate constructability and operability reviews of engineering designs to identify issues that create construction difficulties, safety hazards, or maintainability problems before IFC. Triggers: 'constructability review', 'buildability assessment', 'operability review', 'revision de constructibilidad', 'revision de operabilidad', 'evaluacion de constructibilidad'."
---

# Conduct Constructability Review
## Skill ID: conduct-constructability-review
## Version: 1.0.0
## Category: B - Analysis
## Priority: High

## Purpose

Constructability and operability reviews are structured evaluations of engineering designs conducted at key project milestones to identify features that will create problems during construction, commissioning, or long-term operation. These reviews bring field construction experience, operations knowledge, and maintenance expertise into the design process before drawings are finalized and issued for construction. The fundamental principle is that changes made on paper cost orders of magnitude less than changes made in the field: a piping routing change on a 3D model costs a few engineering hours, while the same change during construction involves scaffolding, cutting, re-welding, NDE, re-insulation, and schedule delay -- typically 10-50x the design-phase cost.

Industry data from the Construction Industry Institute (CII) consistently demonstrates that formal constructability programs reduce total installed cost by 6-10% and schedule duration by 7-12% on industrial capital projects. The savings come from three primary sources: elimination of design features that cause field rework (poor access, impossible lifting sequences, interference with existing structures), optimization of construction methods (modularization opportunities, pre-fabrication potential, construction-friendly material selections), and early identification of safety hazards during installation (heavy lifts over live equipment, hot work near operating units, work at height in confined areas).

Operability and maintainability reviews complement the constructability assessment by ensuring that designs accommodate the long-term needs of the operations and maintenance teams: adequate access for routine inspection and maintenance, practical valve and instrument locations reachable without scaffolding, sufficient clearance for equipment removal and replacement, and logical process layouts that support safe and efficient plant operation. In Operational Readiness projects, these reviews are critical because the OR team represents the future plant owner's interests during the design phase, ensuring that the facility being built will actually be operable and maintainable by the operations team that will inherit it.

This skill provides the structured framework for conducting these reviews at defined milestones, capturing findings in a rigorous register, classifying them by impact, tracking resolution through design modifications, and quantifying the value of implemented recommendations. The framework applies to both greenfield and brownfield projects, with specific criteria for simultaneous operations (SIMOPS) in brownfield environments.

## Intent & Specification
The AI agent MUST understand that:

1. **Constructability reviews must be conducted at defined design milestones** -- typically at 30% design (concept/layout review), 60% design (detailed review of IFR packages), and 90% design (final review before IFC). The review scope and depth must be calibrated to the design milestone:
   - 30% review: focus on plot plan, major equipment layout, crane access, modularization feasibility
   - 60% review: detailed review of piping routing, structural steel, equipment setting, instrument access
   - 90% review: final verification that all previous findings are resolved, focus on remaining constructability risks
   - Reviewing too early yields generic findings with insufficient design detail; reviewing too late means designs are already locked and changes become costly.

2. **Reviews must be multi-disciplinary and include field-experienced personnel.** The review team must include:
   - Construction supervisors with field erection experience in the area type
   - Rigging specialists for heavy lift areas (equipment > 5 tonnes)
   - Operations representatives who understand daily plant operation
   - Maintenance engineers who know equipment teardown requirements
   - HSE representative for construction and operational safety assessment
   - Lead designers for the disciplines under review
   - A piping layout must be assessed not only for process function but also for crane access, scaffolding requirements, insulation clearances, and operator access.

3. **Findings must be classified by four impact categories**:
   - Safety: must be resolved before IFC -- non-negotiable, no IFC release without closure
   - Schedule Critical: affects construction critical path or erection sequence
   - Cost Impact: significant material or labor savings opportunity if design is modified
   - Improvement: preferred practice that enhances quality, efficiency, or operability but is not mandatory
   - This classification drives prioritization, governance, and escalation.

4. **Recommendations must be specific and actionable** with enough engineering detail for implementation. Unacceptable: "improve access to valve." Acceptable: "Relocate HV-2501 from EL+12.0m to EL+6.0m on pipe rack column C4, providing grade-level handwheel access and eliminating the need for scaffold erection for each operation." Every finding must include:
   - Specific location (area, elevation, grid reference, equipment tag)
   - Affected drawing number with revision and grid coordinates
   - Description of the issue and why it matters
   - Recommended solution with dimensions where applicable

5. **The review must cover both greenfield and brownfield considerations.** For brownfield projects or expansions adjacent to operating plants, additional criteria apply:
   - Tie-in methodology to live systems requiring shutdown or hot-tap
   - Construction exclusion zones around operating equipment
   - Simultaneous operations (SIMOPS) constraints on crane operations and hot work
   - Vibration/noise impact on operating equipment
   - Preservation of emergency egress routes for the existing operating facility

## Trigger / Invocation
```
/conduct-constructability-review
```

### Natural Language Triggers
- "Conduct a constructability review of the structural steel design for Area 400"
- "Review the pipe rack layout for construction access and lifting feasibility"
- "Assess the instrument installation details for field practicality"
- "Realizar revision de constructibilidad del diseno de acero estructural del Area 400"
- "Revisar el rack de tuberias para acceso de construccion y factibilidad de izaje"
- "Evaluar los detalles de instalacion de instrumentos para viabilidad en campo"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_code` | Unique project identifier | String | Project context |
| `design_documents` | Engineering drawings, 3D model views, or specifications to be reviewed, with current revision numbers | .pdf / .dwg / 3D model screenshots | Engineering disciplines |
| `area_scope` | Plant area, system, or discipline package under review with geographic boundaries defined | String | Review plan / Engineering Manager |
| `site_constraints` | Known site conditions: soil bearing capacity, access roads, laydown areas, proximity to live plant, weather windows, crane pad locations | .docx / Text | Construction planning / Site survey |
| `design_milestone` | Current design completion percentage (30%, 60%, 90%) to calibrate review depth and expected level of design maturity | String | Project schedule |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `construction_method_statement` | Planned construction methods, erection sequence, modular assembly strategy, and crane utilization plan | General industrial practice for the facility type assumed |
| `crane_data` | Available crane types, capacities, boom lengths, and maximum operating radii for the project | To be confirmed during review; flagged as a constraint if unavailable |
| `modularization_strategy` | Project decision on modular vs. stick-built construction approach and module size/weight limits | Stick-built assumed unless otherwise specified |
| `operating_plant_constraints` | Brownfield constraints: exclusion zones, tie-in windows, SIMOPS limitations, operating plant emergency procedures | Not applicable (greenfield assumed) |

### Context Enrichment
The agent should automatically:
- Retrieve the latest 3D model clash report from the review-3d-model-clashes skill to avoid duplicating findings already identified through automated clash detection and to focus review effort on issues that software cannot detect
- Pull the construction schedule and erection sequence from the Execution agent to assess whether the proposed design supports the planned construction methodology, crane positions, and module assembly sequence
- Retrieve HSE requirements from the HSE agent including permit requirements, hot work restrictions, confined space entry procedures, and safety exclusion zones relevant to the area under review
- Check the Asset Management agent for maintenance access standards, equipment removal clearance requirements, and preferred maintenance-friendly design features that the operations team expects in the final facility
- Cross-reference with previous constructability review findings from other areas of the same project to identify recurring themes or systemic design issues that indicate a root cause requiring design standard correction

## Output Specification

### Document: Constructability Review Report (.md / .xlsx)
**Filename**: `VSC_ConstructabilityReview_{Area}_{ProjectCode}_v{Version}_{Date}.md`

**Structure**:

1. **Review Scope and Methodology**
   - Area reviewed with geographic boundaries
   - Design documents assessed: list with drawing numbers and revision
   - Review team composition: names, roles, years of field experience
   - Review date and duration
   - Design milestone stage (30% / 60% / 90%)
   - Review criteria/checklist applied
   - Limitations or areas excluded from the review with justification

2. **Executive Summary**
   - Total findings by classification: Safety / Schedule Critical / Cost Impact / Improvement
   - Estimated total value of recommendations if implemented
   - Number of critical safety findings requiring immediate action
   - Overall constructability assessment rating: Good / Acceptable / Needs Improvement / Unacceptable
   - Brief justification for the rating

3. **Findings Register**
   - Finding ID: CR-{Area}-{Sequential}
   - Detailed description of the constructability or operability issue
   - Classification: Safety / Schedule Critical / Cost Impact / Improvement
   - Affected drawing numbers with revision and grid reference
   - Specific actionable recommendation with engineering detail
   - Estimated cost/schedule impact or savings value
   - Responsible discipline for resolution
   - Target resolution date
   - Current status: Open / In Progress / Resolved / Verified / Closed / Rejected

4. **Prioritized Action List**
   - Safety findings listed first with mandatory resolution requirement
   - Followed by schedule-critical, cost-impact, and improvement items
   - Each with clear engineering instruction
   - Responsible discipline and timeline
   - Formatted as a printable action tracker for the Engineering Manager

5. **Cost and Schedule Savings Analysis**
   - Quantified estimate of savings from implementing recommendations
   - Breakdown by category:
     - Reduced scaffolding requirements
     - Eliminated field rework
     - Simplified erection sequence
     - Improved pre-fabrication potential
     - Modularization opportunity
     - Reduced construction duration
   - Summary business case: review cost vs. estimated savings (typical ROI: 10:1 to 30:1)

6. **Operability and Maintainability Findings**
   - Valve accessibility for routine operation (handwheel reach, platform requirements)
   - Instrument accessibility for calibration without scaffolding
   - Equipment removal routes and laydown space
   - Maintenance clearances per industry standards
   - Emergency egress route assessment
   - Operator line-of-sight for field monitoring
   - Chemical containment/drainage adequacy

### Constructability Review Checklist Categories
| Category | Key Assessment Items |
|----------|---------------------|
| Crane Access & Heavy Lifts | Crane pad locations, operating radius, lift weights, tandem lift requirements, mobile crane ground bearing, overhead obstructions |
| Structural Steel Erection | Erection sequence feasibility, bolted vs. welded connections, splice locations, temporary bracing, member sizes vs. crane capacity |
| Piping Installation | Spool sizes vs. access openings, field weld locations, hydrotest isolation, slope requirements, expansion loop access, insulation clearance |
| Equipment Setting | Equipment delivery route, rigging access, anchor bolt template availability, grouting access, alignment tolerance, nozzle orientation vs. piping |
| Electrical Installation | Cable tray routing practicality, pull box access, termination space, grounding connections, lighting in congested areas |
| Instrumentation | Transmitter accessibility, tubing runs, junction box locations, calibration access, impulse line routing |
| Civil Works | Underground services conflict with foundations, drainage slope, access road routing, laydown area proximity, soil conditions for temporary works |
| Operability | Valve handwheel reach (max 2.0m without platform), instrument read height, sample point access, operator walking routes, DCS field station locations |
| Maintainability | Tube bundle pull space, motor removal clearance, filter element access, crane access for major maintenance, laydown space for disassembly |
| Safety During Construction | Work at height, confined space entry, hot work near operating units, SIMOPS constraints, excavation near existing services, temporary fall protection |

### Finding Classification Definitions
| Classification | Definition | Resolution Requirement | IFC Impact |
|---------------|-----------|----------------------|-----------|
| Safety | Design feature creates a hazard during construction, commissioning, or operation that could result in injury, environmental release, or equipment damage | Mandatory resolution before IFC; no exceptions | IFC held until finding resolved and verified |
| Schedule Critical | Design feature will delay construction critical path, require out-of-sequence work, or prevent efficient module assembly | Resolution avoids direct schedule impact; priority action required | IFC conditional on resolution plan |
| Cost Impact | Design modification would save significant construction cost through scaffold reduction, simplified erection, reduced field welding, or improved pre-fabrication | Resolution represents quantifiable savings; strong recommendation to implement | IFC not conditional; savings opportunity |
| Improvement | Better practice recommendation that enhances construction quality, operational efficiency, or maintenance access but is not essential | Recommended but not mandatory; accepted or rejected with documented justification | No IFC impact |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Finding Identification Rate | Number of actionable findings per review session per area | > 15 findings per area at 60% design milestone |
| Safety Finding Resolution | Safety-classified findings resolved and verified before IFC release | 100% resolution mandatory before IFC |
| Recommendation Acceptance Rate | Design recommendations accepted by engineering team / total recommendations | > 80% acceptance rate |
| Value of Implemented Recommendations | Estimated construction cost savings from accepted and implemented recommendations | > 2% of area estimated construction cost |
| Review Coverage | Areas/disciplines with completed constructability reviews / total project areas | 100% coverage at both 60% and 90% milestones |

## Procedure

### Step 1: Plan the Review
- Confirm the review scope:
  - Which plant areas are to be reviewed
  - Which discipline packages are included
  - Which design documents will be assessed
  - Ensure scope is manageable (typically one major area per half-day session)
- Assemble the review team ensuring adequate field experience:
  - Construction superintendent or supervisor with erection experience in the area type
  - Rigging/heavy lift specialist for areas with equipment > 5 tonnes
  - Operations representative from the Operations agent familiar with the process
  - Maintenance representative from the Asset Management agent
  - HSE representative for safety assessment
  - Lead designers for the disciplines under review
- Distribute design documents at least 5 working days before the review:
  - Include the constructability review checklist specific to the facility type and area
  - Include the 3D model navigation file for preliminary individual review
- Prepare the area-specific review checklist:
  - Select applicable categories from the standard Constructability Review Checklist
  - Add project-specific or site-specific criteria (seismic restraint access, Arctic conditions, dust exposure)
- Set up session logistics:
  - Meeting room with large-screen display of 3D model (minimum 70" screen)
  - Hard copies of key plan and section drawings
  - Findings register template open in real-time for immediate data entry
  - Previous review findings for context
- Brief the review team on:
  - Review methodology and classification criteria
  - Expected output format
  - Importance of specific, actionable recommendations
- For brownfield reviews, obtain current operating plant constraints:
  - Active exclusion zones
  - Scheduled shutdown windows for tie-in work
  - SIMOPS restrictions
  - Existing plant emergency response plan

### Step 2: Conduct the Physical Review
- Navigate through each area systematically using the 3D model:
  - Start with overall plot plan and access routes
  - Progress to each major equipment item
  - Then piping routing
  - Then structural steel and platforms
  - Then electrical and instrumentation installations
- For each area, assess construction feasibility:
  - Can structural steel be erected with available cranes from planned lift points?
  - Can piping spools be installed without removing adjacent structures?
  - Is there adequate access for field welding, NDE, and hydrotest?
  - Can equipment be set from designated crane pads with available capacity?
  - Are temporary construction facilities (scaffold, shoring, formwork) practical?
- For each area, assess operability:
  - Can operators safely access all valves and instruments for routine operation?
  - Are control valves and manual isolation valves at accessible elevations (handwheel max 2.0m)?
  - Is there adequate clearance for equipment maintenance including tube bundle extraction?
  - Are emergency egress routes unobstructed and code-compliant?
  - Is the process layout logical for operating workflow during normal and upset conditions?
- For each area, assess maintainability:
  - Can the largest maintenance item be extracted with permanent or mobile crane from a practical access point?
  - Is there adequate laydown space (minimum 1.5x component length)?
  - Are instrument connections accessible without scaffold for calibration and replacement?
  - Is there crane access for major maintenance events?
- Record each finding in real time with sufficient detail:
  - Specific location: area, elevation, grid reference, equipment tag
  - Affected drawing number with revision and grid coordinates
  - Description: what is wrong and why it matters
  - Recommended solution: specific design modification with dimensions
- Capture 3D model screenshots or annotated photos for spatial issues
- For brownfield reviews, specifically assess:
  - Tie-in access and methodology (can tie-in be performed without plant shutdown?)
  - Construction equipment proximity to operating equipment
  - Worker exposure to operating plant hazards
  - Impact of construction noise on control room communication

### Step 3: Classify, Prioritize, and Value Findings
- Classify each finding using the Finding Classification Definitions:
  - Safety: hazard during construction, commissioning, or operation
  - Schedule Critical: delays construction critical path
  - Cost Impact: quantifiable savings opportunity
  - Improvement: better practice recommendation
- For Safety findings:
  - Define the specific hazard
  - Assess risk level using the project risk matrix (consequence x likelihood)
  - Document the mandatory resolution requirement
  - Reference the applicable safety standard or regulation
- For Schedule Critical findings:
  - Quantify potential schedule impact in working days
  - Identify affected construction activities and critical path relationship
  - Coordinate with Execution agent for schedule analysis
- For Cost Impact findings, estimate savings using parametric methods:
  - Scaffold cost: USD 50-150/m2 per erection cycle
  - Crane mobilization/demobilization: USD 10K-100K per move
  - Field weld rework: USD 500-5,000 per weld depending on size and NDE
  - Additional piping fabrication: USD per inch-diameter
  - Construction labor rate multipliers for the project region
- For Improvement findings:
  - Describe benefit qualitatively (improved operator safety, reduced maintenance time)
  - Assign priority: High / Medium / Low based on long-term benefit magnitude
- Sort the findings register by classification (Safety first):
  - Within each classification, sort by estimated value or impact
  - Produce the prioritized action list
- Calculate total estimated value of all recommendations:
  - This is the business case for the constructability review program
  - Typical range: 2-8% of area construction cost

### Step 4: Track Resolution and Verify Design Modifications
- Issue the findings register within 3 working days of the review session:
  - Each finding assigned to a responsible discipline
  - Target resolution date aligned with the IFC schedule
- Track status through the resolution lifecycle:
  - Open: assigned, awaiting action
  - In Progress: design modification underway
  - Resolved: design changed in model/drawings, awaiting verification
  - Verified: updated model/drawing reviewed and confirms issue resolved
  - Closed: formally accepted and signed off
  - Rejected: recommendation declined with documented justification
- For Safety findings, implement a mandatory hold:
  - Affected area cannot be released for IFC until all Safety findings resolved and verified
  - Engineering Manager sign-off required confirming closure
- For rejected findings, require written justification:
  - Discipline lead explains why recommendation cannot be implemented
  - Reviewed and formally accepted by Engineering Manager
  - If rejection involves Safety finding, require Project Manager approval
- Conduct verification review of resolved findings:
  - Use updated 3D model or revised drawings
  - Confirm design modification addresses the issue
  - Confirm no new problems or clashes introduced
- Report resolution metrics weekly:
  - Open / In Progress / Resolved / Verified / Rejected counts
  - Escalation triggers for overdue items
- Before each subsequent review milestone (e.g., 90% review):
  - Verify status of all findings from previous milestone review
  - Ensure nothing has been lost or forgotten

### Step 5: Report, Quantify Value, and Capture Lessons Learned
- Compile the Constructability Review Report with all sections:
  - Review scope and methodology
  - Executive summary
  - Findings register
  - Prioritized action list
  - Cost and schedule savings analysis
  - Operability/maintainability section
- Present key findings to Engineering Manager and Project Manager:
  - Safety findings requiring immediate action (with risk assessment)
  - Highest-value cost savings opportunities
  - Schedule-critical items requiring priority action
  - Overall constructability assessment rating
- Feed safety-related findings to the HSE agent:
  - Integration into construction risk assessment
  - Construction method statements and risk registers updated
- Feed schedule-critical findings to the Execution agent:
  - Construction planning and sequence optimization
  - Modularization opportunities identified during review
- Update the Orchestrator agent:
  - Review completion status
  - Finding count by classification
  - Estimated value of recommendations
  - Unresolved Safety findings for governance reporting
- Calculate the constructability review program ROI:
  - Total estimated savings / cost of conducting reviews (team time, preparation, documentation)
  - Typical ROI: 10:1 to 30:1
- Capture recurring themes and systemic design issues as lessons learned:
  - If multiple areas have the same type of issue (insufficient maintenance access, crane access obstructed)
  - Propose updates to engineering design standards or review checklists
  - Prevent recurrence in current and future projects

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Review conducted too late in design process | Reviews scheduled after IFC or within days of IFC when changes are prohibitively expensive | Mandatory review gates at 30%, 60%, and 90% design milestones; IFC release checklist requires constructability review sign-off |
| Review team lacks genuine field experience | Review conducted by designers or junior engineers without construction, operations, or maintenance field time | Mandatory participation requirements: construction supervisor with 5+ years field experience, operations rep with plant operating experience, maintenance engineer with field maintenance experience |
| Findings too vague to be actionable | "Improve access" or "consider alternative" without specific location, dimension, or design modification | Review facilitation training; require specific drawing reference, grid coordinates, and concrete recommendation for every finding before it is accepted into the register |
| Safety findings not tracked to mandatory resolution | Safety findings recorded but not resolved before IFC due to schedule pressure | Safety findings flagged as mandatory IFC hold points; Engineering Manager sign-off required for IFC release; no override without Project Manager written authorization |
| Design team dismisses all findings as impractical | Adversarial relationship between review team and design engineers; designers perceive review as criticism | Frame constructability review as collaborative value creation; include designers in the review team; present findings as opportunities with quantified savings |
| Operability and maintainability review omitted | Review focuses exclusively on construction methods without considering 30-year operating life | Review checklist explicitly includes operability and maintainability sections with dedicated agenda time and mandatory operations/maintenance team participation |
| Brownfield SIMOPS constraints not addressed | Standard greenfield checklist applied to a brownfield expansion without assessing simultaneous operations risks | Brownfield-specific checklist supplement covering tie-ins, exclusion zones, construction traffic management, and simultaneous operations safety assessment |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Safety-classified finding identified during review | Immediate (same day as review) | Engineering Manager notified before end of review session; design work paused on affected area until resolution plan is agreed |
| Safety finding unresolved when IFC target date is within 10 working days | 10 working days before IFC | Engineering Manager and Project Manager joint review; IFC release formally held until safety finding is resolved and verified |
| Schedule-critical finding with > 5 working days potential construction delay | Within 48 hours of finding classification | Construction Manager and Engineering Manager joint review; recovery plan required within 48 hours |
| > 30% of findings rejected by design team without Engineering Manager acceptance | At weekly tracking review | Engineering Manager review of all rejections; independent peer review if systemic disagreement persists between review team and designers |
| Required constructability review not conducted at defined milestone | When milestone is reached without review scheduled | Project Manager escalation; IFC release conditioned on constructability review completion; no waiver without documented risk acceptance |
| Recurring systemic design issue identified across 3+ areas | At detection during review or tracking | Engineering Manager root cause investigation; update to applicable design standard, specification, or design guide required within 15 working days |
| Brownfield SIMOPS risk requiring operating plant involvement | Immediate (during review session) | Construction Manager, Operations Manager (existing plant), and HSE Manager joint assessment within 48 hours; SIMOPS risk assessment protocol activated |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >90% valid findings | Findings confirmed as genuine constructability/operability issues by independent construction expert review; less than 10% false positive rate |
| Completeness | 25% | Full trade coverage | All construction trades assessed (civil, structural, mechanical, piping, electrical, instrumentation); operability and maintainability sections completed; all checklist categories addressed |
| Consistency | 15% | Uniform standard | Same classification criteria, review depth, and checklist applied across all project areas and all milestone reviews; no area receives less rigorous review than others |
| Format | 10% | Professional | VSC template with clear finding descriptions, specific drawing references with grid coordinates, actionable recommendations, and quantified savings estimates |
| Actionability | 10% | Immediately usable | Every finding includes enough engineering detail for the responsible discipline to implement the design change without requesting additional clarification or holding follow-up meetings |
| Traceability | 10% | Full audit trail | Every finding linked to specific drawing number, revision, and grid reference; resolution tracked with evidence of design modification in updated model/drawing |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Construction schedule, erection sequence, method statements, crane plans, and site logistics plan | Construction context for assessing whether design supports the planned construction methodology |
| Operations | Operability requirements, operator workflow description, maintenance access standards, and daily operational needs | Operability and maintainability assessment criteria from the future plant owner's perspective |
| HSE | Safety exclusion zones, construction permit requirements, SIMOPS constraints, and hazard register for the area | Safety context for assessing construction-phase and operation-phase hazards created by design features |
| Asset Management | Maintenance access standards per equipment type, equipment removal clearance specifications, spare parts access requirements | Maintainability review criteria ensuring long-term maintenance feasibility |
| Orchestrator | Review schedule aligned with design milestones and governance calendar | Timing of constructability reviews at 30%, 60%, and 90% design completion gates |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Constructability findings affecting construction planning, erection sequence, and crane utilization | Construction schedule optimization, method statement updates, and cost estimate refinement |
| Orchestrator | Finding count by classification, estimated savings value, constructability rating, and unresolved safety findings | Project governance reporting, gate review inputs, and management dashboard updates |
| HSE | Safety-classified constructability findings requiring construction risk assessment updates | Construction risk register updates, method statement safety reviews, and permit planning |
| All Engineering Disciplines | Specific design modification recommendations with drawing references and implementation instructions | Design revision implementation in models and drawings before IFC release |
| Asset Management | Maintainability findings documenting design features that affect long-term maintenance costs and access | Operational readiness documentation and maintenance strategy input for the operating phase |

## References
- `methodology/or-playbook-and-procedures/` -- OR procedures including design review protocols and constructability review frameworks
- `methodology/capital-projects/` -- Capital project constructability review standards and design phase management
- Construction Industry Institute (CII) RT-34 -- Constructability: A Primer (quantified benefits of formal constructability programs)
- CII Implementation Resource 34-3 -- Project-Level Constructability Model and Assessment Checklists
- ASCE/CII Best Practice -- Constructability Review Process for Industrial Projects (review methodology and team composition guidance)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
