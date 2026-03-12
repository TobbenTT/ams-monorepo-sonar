---
name: review-3d-model-clashes
description: "Coordinate the 3D model review process and track interdisciplinary clash detection and resolution using structured model review sessions. Triggers: 'clash detection', '3D model clash', 'Navisworks review', 'model review', 'deteccion de interferencias', 'revision del modelo 3D', 'clashes del modelo'."
---

# Review 3D Model Clashes
## Skill ID: review-3d-model-clashes
## Version: 1.0.0
## Category: B - Analysis
## Priority: High

## Purpose

Three-dimensional model reviews and clash detection are the primary quality assurance tools for spatial design coordination in industrial capital projects. As multiple engineering disciplines develop their designs concurrently -- piping routes, structural steel framing, electrical cable trays, instrument tubing, HVAC ducts, equipment placement, and civil underground services -- spatial conflicts are inevitable. A piping spool may route through a structural beam. A cable tray may occupy the same space as a maintenance access platform. A valve handwheel may be inaccessible behind an equipment skid. These conflicts, known as clashes, must be identified and resolved in the 3D model before drawings are issued for construction.

The business case for rigorous clash management is compelling and well-quantified. Industry benchmarks show that resolving a clash in the 3D model costs USD 50-200 (engineering time to re-route or redesign), while the same clash discovered during construction costs USD 5,000-50,000 (field rework including scaffold, cutting, re-fabrication, re-welding, NDE, painting, insulation, and schedule delay). On a medium-scale industrial facility with 5,000-10,000 initial raw clashes, even a 5% miss rate translates to 250-500 field rework events -- representing USD 1.25M-25M in avoidable construction cost. Projects that invest in thorough 3D model review and clash resolution consistently achieve 30-50% reduction in field rework compared to projects with poor model coordination.

Modern clash detection software (Autodesk Navisworks, Intergraph SmartPlant Review, AVEVA E3D Review) can generate clash reports automatically by running geometric intersection checks between discipline models. However, the software output is raw data -- thousands of clashes that include a high proportion of false positives (connections, penetrations, and adjacencies that are not actual conflicts), duplicates, and trivial items. The critical human and analytical step is filtering, classifying, prioritizing, assigning responsibility, and tracking resolution of the genuine clashes. This skill provides the structured framework for that entire process, from raw clash report ingestion through to verified resolution and metrics reporting.

The skill also manages the structured 3D model review sessions (sometimes called model walkthroughs or model reviews) conducted at design milestones, where the project team collectively navigates the 3D model to identify spatial issues, constructability concerns, and operability problems that automated clash detection alone cannot find -- such as maintenance access deficiencies, operator ergonomic issues, and construction sequence conflicts.

## Intent & Specification
The AI agent MUST understand that:

1. **Raw clash reports must be filtered before analysis.** Clash detection software generates large volumes of raw clashes (typically 5,000-20,000 per area run), of which 60-80% are typically false positives, duplicates, or negligible items. The agent must apply filter criteria to reduce the raw count to actionable clashes before classification begins:
   - Tolerance settings per project standards
   - Exclusion groups for connections and penetrations
   - Duplicate detection across multiple viewing angles
   - Trivial proximity filtering within acceptable ranges

2. **Clashes are classified into three categories with distinct resolution requirements**:
   - Hard Clashes: physical geometric intersection between solid objects -- must be resolved by redesign
   - Soft Clashes: clearance violation where objects are closer than the required minimum distance (e.g., pipe too close to structural steel for insulation, insufficient maintenance access around equipment)
   - Time Clashes: construction sequence conflicts where temporary elements or erection sequence creates spatial conflicts not present in the final design

3. **Each genuine clash must be assigned to a single responsible discipline.** The standard rule is: the discipline whose element was placed later (or whose routing is more flexible) takes responsibility for resolution. Standard priority order:
   - Equipment and structural steel have priority (least flexible)
   - Piping yields to structural steel and equipment
   - Cable trays yield to piping
   - Instrument tubing yields to cable trays
   - Exceptions must be managed through the coordination meeting

4. **Clash resolution must be verified in the updated 3D model** before the clash can be marked as resolved. A commitment to resolve is not the same as actual resolution -- the discipline must update the model, and a re-run of the clash detection must confirm the conflict no longer exists. No verbal or email commitment is sufficient without model verification.

5. **Clash metrics are a key indicator of engineering quality and model maturity.** The trend of open clashes over time, the resolution rate per reporting period, and the ratio of new clashes introduced versus clashes resolved provide insight into the health of the interdisciplinary coordination process and the readiness of design packages for IFC release.

## Trigger / Invocation
```
/review-3d-model-clashes
```

### Natural Language Triggers
- "Review the latest clash detection report for Area 100"
- "How many open clashes remain before IFC for the pipe rack?"
- "Generate clash resolution metrics for the weekly model review"
- "Revisar el ultimo informe de deteccion de interferencias del Area 100"
- "Cuantas interferencias abiertas quedan antes del IFC del rack de tuberias?"
- "Generar metricas de resolucion de clashes para la revision semanal del modelo"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_code` | Unique project identifier | String | Project context |
| `clash_report` | Raw clash detection report generated from the 3D modeling tool | .xml / .csv / .html / Navisworks .nwd | 3D Model Coordinator |
| `area_scope` | Plant area, zone, or discipline pair for this clash run | String | Model Coordinator / Engineering Manager |
| `discipline_responsibility_matrix` | Matrix defining default clash resolution responsibility by discipline pair | .xlsx | Engineering Manager or project standard |
| `ifc_schedule` | IFC target dates by area for resolution prioritization | .xlsx / .mpp extract | Project Controls / Execution Agent |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `tolerance_settings` | Clash detection tolerance values used for this run (hard, soft, clearance distances) | Report metadata; if missing, use project standard tolerances |
| `previous_clash_report` | Prior clash report for the same area for delta comparison (new vs. existing) | First report; no delta analysis |
| `filter_exclusion_groups` | Model element groups to exclude from clash detection (connections, penetrations, temporary elements) | Standard project exclusion list |

### Context Enrichment
The agent should automatically:
- Retrieve the current IFC schedule from the Execution agent to prioritize clash resolution by area urgency: areas approaching IFC must have zero open Critical and Major clashes
- Cross-reference with the constructability review findings from conduct-constructability-review to identify clashes that relate to previously flagged constructability issues
- Pull maintenance access clearance requirements from the Asset Management agent for soft clash assessment criteria (minimum clearances around equipment for maintenance access)
- Check the interface register from manage-engineering-interfaces to identify clashes at discipline interface boundaries that may indicate unresolved interface data exchange issues
- Retrieve the previous period's clash metrics to calculate trend data (week-over-week change in open clash count, resolution rate, new clash introduction rate)

## Output Specification

### Document: Clash Review Report (.xlsx)
**Filename**: `VSC_ClashReview_{Area}_{ProjectCode}_v{Version}_{Date}.xlsx`

**Structure**:

1. **Executive Dashboard**
   - Total raw clashes from this detection run
   - Filtered actionable clash count after false positive removal
   - Breakdown by severity: Critical / Major / Minor / Negligible
   - Breakdown by discipline pair (piping-structural, piping-electrical, etc.)
   - Resolution status distribution: Open / In Progress / Resolved / Verified / Closed
   - Trend chart: clash count over time (weekly data points)
   - Resolution rate metrics: clashes resolved per period, net change

2. **Filtered Clash Register**
   - Clash ID (unique per project: CLH-{Area}-{Sequential})
   - Description of the spatial conflict
   - Clashing element A: discipline, element type, tag/component ID
   - Clashing element B: discipline, element type, tag/component ID
   - Clash type: Hard / Soft / Time
   - Severity: Critical / Major / Minor / Negligible
   - Responsible discipline for resolution
   - Assigned engineer name
   - Target resolution date (aligned with area IFC schedule)
   - Current status: Open / In Progress / Resolved / Verified / Closed
   - Resolution description (how the clash was resolved)
   - Verification status: Pending / Verified / Failed

3. **False Positive Log**
   - Clash ID from raw report
   - Reason for dismissal: Connection / Penetration / Within Tolerance / Duplicate / Temporary Construction Element
   - Reviewer who approved the dismissal
   - Date of dismissal decision

4. **Resolution Tracking Dashboard**
   - Open clashes by responsible discipline
   - Aging analysis: < 1 week / 1-2 weeks / 2-4 weeks / > 4 weeks
   - Discipline response rate (clashes actioned within target time / total assigned)
   - Completion forecast per discipline based on current resolution rate

5. **Trend Analysis**
   - Week-over-week charts showing total open clashes
   - New clashes introduced per period from model updates
   - Clashes resolved per period
   - Cumulative resolution rate percentage
   - Net clash movement: resolved minus new (positive = improving)

6. **Critical Clashes Requiring Immediate Design Coordination**
   - All Critical and Major clashes in areas approaching IFC within 4 weeks
   - Detailed description with 3D model screenshot reference
   - Recommended resolution approach with specific design instruction
   - Escalation status and Engineering Manager action required

### Clash Classification Definitions
| Classification | Severity | Description | Resolution Requirement |
|---------------|----------|-------------|----------------------|
| Hard Clash | Critical | Geometric intersection involving pressure-containing or structural load-bearing element | Mandatory redesign; no IFC release until resolved |
| Hard Clash | Major | Geometric intersection requiring significant rerouting or relocation (> 500mm movement) | Redesign required; target 10 working days |
| Hard Clash | Minor | Geometric intersection resolvable with minor adjustment (< 500mm movement) | Field-adjustable but model update preferred |
| Soft Clash | Critical | Clearance violation affecting safety egress, pressure relief paths, or fire protection | Mandatory resolution before IFC |
| Soft Clash | Major | Clearance violation affecting maintenance access or insulation envelope | Resolution required before IFC |
| Soft Clash | Minor | Clearance violation below standard but workable with minor operational impact | Document and accept or resolve |
| Time Clash | Major | Construction sequence conflict preventing planned erection methodology | Sequence redesign or erection hold required |
| Time Clash | Minor | Temporary spatial conflict manageable with construction phasing adjustment | Construction planning mitigation sufficient |

### Standard Project Clearance Requirements (Soft Clash Reference)
| Clearance Type | Minimum Distance | Applicable Standard |
|---------------|-----------------|-------------------|
| Pipe to structural steel (uninsulated) | 150 mm | Project piping standard |
| Pipe to structural steel (insulated) | Insulation thickness + 75 mm | Project piping standard |
| Maintenance access around equipment | 600 mm minimum; 1000 mm preferred | API/client maintenance philosophy |
| Equipment removal envelope | Full equipment length + 500 mm | Vendor maintenance manual |
| Valve handwheel to obstruction | 300 mm clear | Operability standard |
| Cable tray to pipe (uninsulated) | 150 mm | Electrical installation standard |
| Instrument access for calibration | 600 mm clear in front of device | ISA / client standard |
| Emergency egress path width | 1100 mm minimum clear | Local building code / fire code |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Open Clash Count at IFC | Number of unresolved Critical + Major clashes when area is released for IFC | Zero Critical; Zero Major |
| Resolution Rate | Clashes resolved per reporting period / open clashes at start of period | > 30% per weekly cycle |
| False Positive Rate | Clashes dismissed / total raw clashes | 60-80% (indicates proper filtering; rates outside this range suggest tolerance issues) |
| Clash Introduction Rate | New clashes appearing per reporting period from model updates | Declining trend over time as design matures |
| Average Resolution Time | Mean working days from clash identification to verified resolution | < 10 working days for Major; < 5 for Critical |

## Procedure

### Step 1: Ingest and Filter the Raw Clash Report
- Import the raw clash detection report from the 3D modeling tool, recording:
  - Total raw clash count
  - Clash run date and time
  - Tolerance settings used (hard clash distance, soft clash clearance distances)
  - Model revision for each discipline included in the run
  - Software platform and version used for the detection run
- Apply the exclusion filter groups to remove known false positives:
  - Pipe-to-pipe connections at branch points
  - Structural member connections at node points
  - Equipment penetrations through foundations
  - Bolt/nut assemblies intersecting with connection plates
  - Any project-specific exclusion categories defined by the Model Coordinator
- Run duplicate detection to identify and consolidate clashes that represent the same physical conflict:
  - Multiple clash points along the same interference zone
  - Same conflict reported from multiple viewing angles
  - Adjacent clashes on the same two elements within 100mm of each other
- Apply tolerance filtering to remove trivial clashes:
  - Elements within 5mm of each other that do not represent genuine spatial conflicts
  - Clashes within construction installation tolerances per the applicable discipline standard
- Calculate the filtered actionable clash count and the filter efficiency rate:
  - Filter efficiency = (raw clashes - actionable clashes) / raw clashes
  - Expected range: 60-80%; outside this range suggests tolerance calibration issue
- Generate the false positive log documenting every dismissed clash with the reason for dismissal and the reviewer's name for audit trail purposes

### Step 2: Classify and Prioritize Actionable Clashes
- Classify each actionable clash by type using the Clash Classification Definitions:
  - Hard Clash: geometric intersection of solid elements confirmed by coordinate overlap
  - Soft Clash: minimum clearance violation -- check against project clearance standards per the Standard Project Clearance Requirements table
  - Time Clash: construction sequence conflict identified by overlaying the erection sequence timeline on the 3D model
- Assign severity to each clash based on the classification matrix:
  - Critical: structural integrity risk, safety hazard, or clash with pressure-containing element
  - Major: requires significant design change (rerouting piping, relocating equipment, modifying structural steel)
  - Minor: adjustable in the field with minor modifications (small piping trim, cable tray adjustment)
  - Negligible: within practical construction tolerance; noted but no action required
- Prioritize by area urgency:
  - Areas approaching IFC within 4 weeks: highest priority
  - Areas with IFC 4-8 weeks out: standard priority
  - Areas with IFC > 8 weeks out: normal priority
- Assign each clash to the responsible discipline using the discipline responsibility matrix:
  - Identify the specific engineer who must action the resolution
  - Confirm assignment via the weekly coordination meeting
- Set target resolution dates:
  - Critical clashes: within 5 working days
  - Major clashes: within 10 working days
  - Minor clashes: within 20 working days
  - All dates must respect the area IFC schedule

### Step 3: Facilitate Resolution Through Design Coordination
- Distribute the classified clash register to all discipline leads with:
  - Their assigned clashes highlighted
  - Resolution instructions and engineering guidance
  - Target dates and IFC schedule context
- Facilitate the weekly model review session:
  - Navigate the 3D model together with discipline engineers
  - Discuss and agree resolution approaches for complex or disputed clashes
  - Record decisions in the clash register with specific engineering instructions
- For clashes where responsibility is disputed between disciplines:
  - Facilitate a resolution discussion in the coordination meeting
  - If not resolved within the meeting, escalate to the Engineering Manager for a binding ruling
  - Document the ruling and distribute to both discipline leads
- Document agreed resolution approaches with sufficient detail for implementation:
  - Example: "Reroute pipe spool from EL+8.0m to EL+8.5m between grids C3-C4"
  - Include affected element IDs, new coordinates or routing, and any design constraints
- Track resolution progress:
  - Responsible discipline updates their 3D model to implement the agreed resolution
  - Discipline notifies the Model Coordinator that the clash has been addressed
  - Model Coordinator queues the clash for verification re-run
- Record any clashes that cannot be resolved without design basis change or significant cost/schedule impact:
  - Escalate to Engineering Manager and Execution agent
  - Link to the track-design-basis-changes skill if design basis modification is required

### Step 4: Verify Resolution in Updated Model
- After model updates are implemented, run a targeted clash detection re-check:
  - Use the same tolerance settings as the original detection run
  - Focus on the specific clash zone plus 1 meter surrounding volume
  - Confirm the conflict no longer exists in the updated model
- For clashes confirmed as resolved:
  - Update status to "Verified" in the clash register
  - Record the date of the verification check
  - Record the model revision used for verification
- For clashes where the re-check reveals the conflict persists:
  - Reopen the clash and notify the responsible discipline
  - Require explanation of why the resolution was not effective
  - Set a revised target resolution date (maximum 5 additional working days)
- For clashes where the resolution introduced new clashes:
  - Register the new clashes immediately
  - Assign them to the discipline that created the new conflict
  - Prioritize based on the same severity classification
- Update the clash register status to "Closed" when:
  - The clash is verified as resolved in the model
  - The affected IFC drawing package has been updated to reflect the resolution
  - Both conditions must be met before closure
- Maintain the complete audit trail:
  - Original clash detection with coordinates and elements
  - Assigned resolution approach
  - Model update confirmation
  - Verification re-check result
  - Final closure with drawing update confirmation

### Step 5: Report Metrics and Trend Analysis
- Generate the weekly clash review report with dashboard metrics:
  - Total open by severity (Critical / Major / Minor / Negligible)
  - Weekly resolution rate: clashes resolved / clashes open at period start
  - New clashes introduced from model updates during the period
  - Net change: resolved minus new (positive indicates design convergence)
  - Cumulative trend charts showing trajectory toward zero open clashes at IFC
- Calculate the clash density per area:
  - Actionable clashes per kilometer of piping
  - Actionable clashes per equipment count
  - Use density metrics to benchmark design coordination quality across areas
  - Identify areas with abnormally high density requiring additional coordination attention
- Prepare the IFC readiness assessment for each area:
  - Can the area proceed to IFC based on current open clash count?
  - If not, forecast date for achieving zero Critical and Major clashes
  - Calculate remaining resolution workload vs. available time to IFC
- Present the clash status summary to the Engineering Manager:
  - Areas at risk for IFC delay due to unresolved clashes
  - Disciplines with low resolution rates requiring intervention
  - Emerging patterns suggesting systemic coordination issues
  - Recommended management actions with specific timelines
- Feed the clash metrics to the Orchestrator agent for the project management dashboard
- Archive the complete clash record for project as-built documentation and for benchmarking future projects

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Excessive false positives overwhelm the review process | Incorrect tolerance settings or missing exclusion groups in the clash detection setup | Calibrate tolerance settings per project standards; maintain and update exclusion group definitions with each model revision |
| Clashes resolved in design but IFC drawings not updated | Disconnect between 3D model updates and 2D drawing extraction | IFC drawing extraction must include a mandatory post-model-update step; drawing revision confirms model change incorporated |
| Discipline does not update model to resolve clash | Resolution "agreed" in meeting but model not physically modified | Verification re-run required before clash can be closed; no credit for verbal commitment without model update |
| New clashes introduced faster than existing clashes are resolved | Design still in active development with frequent model changes | Increasing clash count is normal in early design phases; concern only when net count is not declining after 60% design completion |
| Critical clashes in areas released for IFC | Premature IFC release without clash review sign-off | IFC release checklist includes mandatory sign-off that zero Critical and Major clashes exist for the area |
| Soft clashes (clearance violations) not detected | Clash detection run only for hard clashes without clearance rules | Project standard mandates both hard clash and soft clash (clearance) detection runs at each model review milestone |
| Model review sessions unproductive | Sessions too large, too long, or without clear agenda | Limit review sessions to one area per meeting; prepare agenda with pre-classified clashes; time-box each discipline discussion |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Critical clash identified affecting pressure-containing or structural element | Immediate (same day) | Engineering Manager and affected discipline leads notified; resolution plan within 48 hours |
| Area approaching IFC with > 5 Major clashes unresolved | 4 weeks before IFC target | Engineering Manager intervention; dedicated clash resolution workshop scheduled within 1 week |
| Discipline resolution rate < 20% per weekly cycle | At weekly review | Discipline Lead notification; resource reallocation or priority adjustment within 5 working days |
| Disputed clash unresolved after 2 coordination meetings | At second meeting | Engineering Manager binding ruling within 5 working days |
| Net open clash count increasing after 60% design completion | At detection | Engineering Manager and Model Coordinator investigation; coordination process audit |
| Clash re-check reveals resolution not implemented in model | At verification | Discipline Lead immediate notification; mandatory model update within 3 working days |
| IFC release requested without clash review sign-off | At IFC request | Model Coordinator and Engineering Manager review; IFC held until clash status confirmed |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% valid classification | Clash severity and type correctly assigned; false positive dismissals justified and auditable |
| Completeness | 25% | 100% coverage | All discipline pairs included in clash detection; all raw clashes processed (classified or dismissed) |
| Consistency | 15% | Uniform standards | Same tolerance settings, exclusion groups, and classification criteria applied across all areas and all runs |
| Format | 10% | Professional | VSC template with clear dashboards, trend charts, and sortable/filterable clash register |
| Actionability | 10% | Immediately usable | Every clash has assigned owner, resolution instruction, and target date; disciplines can act without additional clarification |
| Traceability | 10% | Full audit trail | Every clash tracked from raw report through classification, assignment, resolution, verification, and closure |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | IFC schedule dates by area | Prioritization of clash resolution by area urgency |
| Execution | Construction sequence and erection plans | Time clash identification (construction sequence conflicts) |
| Asset Management | Maintenance access clearance requirements | Soft clash criteria for maintenance envelope violations |
| Operations | Operability clearance requirements (operator access, valve reach) | Soft clash criteria for operational ergonomic violations |
| HSE | Safety clearance requirements (egress routes, fire protection distances) | Soft clash criteria for safety-critical clearance violations |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Clash resolution status as prerequisite for IFC release | IFC readiness decision and construction planning |
| Orchestrator | Clash metrics and trend data for engineering quality reporting | Project management dashboard and governance reporting |
| HSE | Safety-related spatial conflicts (blocked egress, fire protection clearance) | Construction and operational safety risk assessment |
| All Engineering Disciplines | Clash assignments and resolution instructions | Design modification implementation |

## References
- `methodology/or-playbook-and-procedures/` -- OR procedures including 3D model review protocols
- `methodology/capital-projects/` -- Capital project design coordination frameworks
- CII Research Summary 228-1 -- 3D Modeling and Constructability Coordination
- Autodesk Navisworks Manage -- Clash Detection Best Practice Guide
- ISO 19650-2 -- Delivery phase of assets: building information modelling (clash management within BIM framework)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
