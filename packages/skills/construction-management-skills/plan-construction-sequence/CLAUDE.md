---
name: plan-construction-sequence
description: "Develop the construction execution sequence defining the order in which areas, disciplines, and systems are built. Triggers: 'construction sequence', 'build sequence', 'secuencia de construccion', 'secuencia constructiva', 'plan de ejecucion de construccion'."
---

# Plan Construction Sequence

## Skill ID: CONST-11

## Version: 1.0.0

## Category: C-Planning (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Develop the construction execution sequence defining the order in which areas, disciplines, and systems are built, considering engineering deliverable readiness, material availability, resource constraints, commissioning priorities, and constructability factors. The construction sequence is the backbone of the construction schedule -- without it, the project lacks a physical logic that drives resource loading, material procurement priorities, and subcontractor mobilization timing.

The fundamental principle behind this skill is commissioning-driven construction: systems needed first for commissioning must be built first. This reverses the traditional approach where construction proceeds by area convenience and instead aligns every construction activity with the downstream need date for commissioning and operational readiness. Industry data from IPA (Independent Project Analysis) shows that projects employing commissioning-driven construction sequencing achieve 15-25% better schedule performance than those using traditional area-based approaches.

Key value drivers:
- **Schedule optimization**: Commissioning-driven sequencing ensures no idle time between construction completion and commissioning start for critical systems
- **Resource efficiency**: Proper sequencing enables resource leveling that avoids peaks exceeding site capacity, reducing overtime and fatigue-related incidents
- **Material prioritization**: Sequence drives procurement priorities, ensuring long-lead materials arrive when needed for the critical path, not just when convenient
- **Risk reduction**: Explicit identification of sequence assumptions and their risks enables proactive mitigation before delays materialize
- **Constructability integration**: Embedding constructability reviews into the sequence prevents field rework caused by impractical installation orders

The construction sequence must balance multiple competing constraints: engineering deliverable readiness (IFC drawings), material and equipment delivery dates, labor resource availability by discipline, physical access and laydown requirements, commissioning priorities, and seasonal or environmental factors. This skill provides the structured methodology to optimize across all these dimensions.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Commissioning-Driven Logic**: The construction sequence must be derived backwards from the commissioning sequence -- identifying which systems must be mechanically complete first to support utility commissioning, then working backwards through the discipline physical logic (civil, structural, equipment, piping, E&I, insulation, painting) to establish construction start dates per area and system
2. **Area Release Criteria**: No construction activity may begin in an area until the area release criteria are satisfied: IFC drawings issued for the relevant discipline, bulk materials received or confirmed in transit, construction prerequisites complete (prior discipline work, temporary facilities, access), and contractor mobilized with qualified crews
3. **Discipline Physical Logic**: The construction sequence must respect the immutable physical logic of construction: civil works before structural steel, structural steel before equipment setting, equipment before piping, piping before electrical and instrumentation, E&I before insulation and fireproofing -- with explicit identification of any deviations and their justification
4. **Resource Leveling**: The construction sequence must be validated against site capacity constraints (peak workforce, crane availability, laydown area limits, access road capacity) and adjusted to level resource demand within practical limits while protecting critical path activities
5. **Risk Register for Sequence Assumptions**: Every assumption underlying the construction sequence (material delivery dates, engineering deliverable dates, productivity rates, weather windows) must be explicitly documented in a risk register with contingency plans for the top 10 sequence risks

---

## Mandatory Validation (REQUIRED)

Before finalizing ANY construction sequence, the agent MUST:

1. Structure all activities as `SequenceActivity` objects with `activity_id`, `area`, `discipline`, and `planned_start`/`planned_finish` dates
2. Call `validate_construction_sequence` with the complete activity list
3. If `is_valid` is `false`, correct ALL violations before proceeding
4. Call `inject_construction_dependencies` to auto-populate `depends_on` fields
5. Write the validated sequence to session state entity `construction_sequence`

Any sequence that fails validation MUST NOT be presented at the gate review.

---

## Trigger / Invocation

```
/plan-construction-sequence
```

### Natural Language Triggers

- "Develop the construction sequence for the project"
- "Create a commissioning-driven build sequence"
- "Plan the construction execution order by area and discipline"
- "Desarrollar la secuencia de construccion del proyecto"
- "Crear la secuencia constructiva por area y disciplina"
- "Planificar el orden de ejecucion de construccion"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Commissioning Sequence | Operations / Execution | .xlsx / .docx | System commissioning priority and sequence with target dates |
| Engineering Deliverable Schedule | Engineering Design | .xlsx / .xer | IFC drawing issue dates by area, system, and discipline |
| Material Delivery Schedule | Contracts & Compliance | .xlsx | Confirmed and forecast delivery dates for bulk and tagged materials |
| Site Capacity Constraints | Execution | .docx / .xlsx | Maximum workforce, crane availability, laydown limits, access constraints |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Constructability Review Reports | Construction Management | .docx | Agent applies standard constructability heuristics |
| Historical Productivity Rates | VSC Knowledge Base | .xlsx | Industry-standard productivity rates by discipline and region |
| Seasonal / Weather Constraints | HSE / Site Management | .docx | No seasonal constraints assumed |
| Modularization Strategy | Engineering Design | .docx | All construction assumed stick-built |

### Context Enrichment

- Retrieve commissioning system priorities from model-commissioning-sequence skill output
- Extract long-lead equipment delivery dates from track-long-lead-procurement skill data
- Pull resource availability constraints from the master project schedule (Primavera P6 or MS Project)
- Access constructability lessons learned from VSC knowledge base for similar project types
- Query site logistics plan from manage-site-logistics skill for laydown and access constraints

---

## Output Specification

### Document 1: Construction Sequence Plan (.docx)

**Filename**: `{ProjectCode}_Construction_Sequence_Plan_v{Version}_{YYYYMMDD}.docx`

**Structure:**

1. **Executive Summary**
   - Project overview and construction scope summary
   - Commissioning-driven sequencing rationale
   - Key sequence milestones and critical path summary
   - Top 5 sequence risks and mitigation strategies

2. **Commissioning Priority Mapping**
   - System-by-system commissioning priority table
   - Required mechanical completion dates derived from commissioning sequence
   - Utility systems prioritization (power, water, air, fuel, communications)
   - Pre-commissioning requirements by system

3. **Area-by-Area Sequence**
   - Construction area definition and boundaries on site plan
   - Per-area sequence: discipline order, start/finish dates, prerequisites
   - Area release criteria checklist per area
   - Inter-area dependencies and constraints

4. **Discipline Physical Logic**
   - Standard discipline sequence with lead/lag relationships
   - Deviations from standard logic with engineering justification
   - Concurrent work opportunities (multiple disciplines in same area)
   - Discipline interface management requirements

5. **Resource Loading and Leveling**
   - Workforce histogram by discipline and month
   - Peak workforce analysis vs. site capacity
   - Crane utilization schedule by area and period
   - Resource leveling adjustments and their schedule impact

6. **Sequence Risk Register**
   - Top 20 sequence assumptions with risk rating
   - Contingency plans for top 10 risks
   - Schedule float analysis per sequence path
   - Early warning indicators for each risk

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Commissioning Alignment | % of MC dates supporting commissioning sequence | 100% |
| Critical Path Float | Days of float on critical construction path | > 10 days |
| Resource Peak vs. Capacity | Peak workforce / site capacity ratio | < 90% |
| Area Release Readiness | % areas with all prerequisites met at planned start | > 85% |
| Sequence Risk Coverage | % of sequence assumptions with documented contingency | 100% |

---

## Procedure

### Step 1: Map Commissioning Priorities to Construction Milestones

1. Obtain the commissioning sequence from model-commissioning-sequence skill or project commissioning plan
2. Identify the first systems required for commissioning (typically utilities: power, water, compressed air, fuel gas, instrument air, communications)
3. Establish required Mechanical Completion (MC) dates for each system by back-calculating from commissioning start dates, allowing for pre-commissioning activities (flushing, pressure testing, loop checking)
4. Map each system to its physical construction areas (a system may span multiple areas; an area may contain multiple systems)
5. Prioritize construction areas based on the earliest MC date of any system they contain
6. Document the commissioning-to-construction priority mapping in a traceability matrix
7. Validate the mapping with the commissioning team to confirm no systems are missing or mis-prioritized

### Step 2: Define Discipline Physical Logic per Area

1. Establish the standard discipline sequence for each area type (process, utilities, infrastructure, buildings): civil foundations, structural steel erection, equipment setting, piping installation, electrical installation, instrumentation installation, insulation and fireproofing, painting and coating
2. Determine lead/lag relationships between disciplines based on physical dependencies (e.g., structural steel must support pipe racks before piping can start on those racks)
3. Identify opportunities for concurrent work within the same area where physical interference is manageable (e.g., underground piping concurrent with above-grade structural steel)
4. Calculate discipline durations using quantity take-offs and productivity rates (hours per unit installed) adjusted for site-specific factors (altitude, temperature, workforce skill level)
5. Document any deviations from standard physical logic with engineering justification (e.g., early installation of heavy equipment before structural steel completion due to crane access constraints)
6. Create the per-area discipline bar chart showing the cascade of discipline activities from area release to MC

### Step 3: Validate Area Release Criteria

1. Define area release criteria for each area: required IFC drawings by discipline, bulk materials by type (concrete, steel, piping, cable), tagged equipment items, access prerequisites, prior discipline completion milestones
2. Cross-reference area release criteria against engineering deliverable schedule to confirm IFC drawings will be available at planned area start dates
3. Cross-reference against material delivery schedule to confirm bulk materials and tagged equipment will be on site when needed
4. Identify areas where release criteria cannot be met at planned start date and quantify the delay impact
5. Develop mitigation strategies for areas at risk: accelerate engineering, expedite materials, split area into sub-areas to enable partial start, re-sequence to start in a different area first
6. Produce the Area Release Status Matrix showing green/amber/red status per area and release criterion

### Step 4: Level Resources Against Site Capacity

1. Aggregate the workforce demand from all areas and disciplines into a project-level workforce histogram by trade and by month
2. Compare peak workforce demand against site capacity constraints (camp capacity, parking, access road throughput, lunch facilities, safety induction capacity)
3. Identify periods where demand exceeds capacity and determine which activities can be shifted without impacting the critical path (activities with positive float)
4. Adjust the construction sequence to level peak demand within capacity constraints, prioritizing critical path activities and commissioning-driven priorities
5. Validate crane utilization schedule to confirm no crane conflicts between areas (two areas requiring the same crane at the same time)
6. Document all resource leveling adjustments and their impact on area completion dates and MC milestones
7. Produce the final resource-leveled construction sequence as the project construction baseline

### Step 5: Document Sequence Risks and Contingencies

1. Identify all assumptions underlying the construction sequence: material delivery dates, engineering issue dates, productivity rates, weather assumptions, subcontractor mobilization dates, permit dates, third-party tie-in windows
2. Assess each assumption for probability of failure and schedule impact if the assumption fails, using a 5x5 risk matrix
3. Rank assumptions by risk score (probability x impact) and identify the top 20 sequence risks
4. Develop contingency plans for the top 10 risks: alternative sequences, schedule float buffers, acceleration measures, resource reallocation options
5. Define early warning indicators for each risk (e.g., "If IFC drawings for Area 200 not issued by [date], trigger contingency plan C-200-01")
6. Establish a risk monitoring cadence (weekly review of sequence assumptions against actual progress)
7. Document the complete sequence risk register and integrate it with the project risk register

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Sequence ignores commissioning priorities | Construction planned by area convenience without reference to commissioning needs | Always start sequence development from commissioning sequence working backwards |
| Unrealistic area release assumptions | Engineering or material deliveries assumed on time without verification | Cross-reference every release criterion against actual delivery forecasts, not contract dates |
| Resource peaks exceed site capacity | Activities scheduled to earliest physical start without resource leveling | Mandatory resource leveling step before baseline approval; validate against camp and logistics capacity |
| No float on critical path | Over-optimistic productivity assumptions compress all float | Apply contingency factors to productivity rates; maintain minimum 10 days float on critical path |
| Discipline interface conflicts | Multiple disciplines working in same area without coordination | Define concurrent work rules per area; require daily coordination meetings for multi-discipline areas |
| Weather impacts not addressed | Seasonal constraints (rain, extreme heat, freezing) ignored in sequence | Incorporate regional weather data; schedule weather-sensitive activities in optimal windows |
| Modularization not integrated | Modular fabrication/delivery schedule not coordinated with stick-build sequence | Include module delivery and setting in the construction sequence with crane and laydown coordination |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| IFC drawings delayed > 2 weeks beyond planned area release date | Immediately upon confirmation | Construction Manager -> Project Manager -> Engineering Manager |
| Material delivery delay impacting critical path area | Upon receipt of revised delivery forecast | Construction Manager -> Procurement Manager -> Project Director |
| Peak workforce demand exceeds site capacity by > 10% | During resource leveling analysis | Construction Manager -> Site Manager -> Project Director |
| Commissioning sequence change requiring construction re-sequence | Within 48 hours of change notification | Construction Manager -> Commissioning Manager -> Project Director |
| Subcontractor unable to mobilize by planned area start date | At T-30 days before planned mobilization | Construction Manager -> Contracts Manager -> Project Manager |
| Weather event disrupts planned sequence for > 5 days | Daily during weather event | Construction Manager -> Site Manager -> Project Director |
| Critical path float eroded to < 5 days | Weekly during schedule update | Construction Manager -> Project Controls -> Project Director |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Discipline logic correct; durations realistic per industry benchmarks | Peer review by construction superintendent |
| Completeness | 25% | All areas, disciplines, and systems included; no gaps in sequence | Cross-check against system breakdown and area list |
| Consistency | 15% | Sequence aligns with commissioning plan, procurement schedule, and resource plan | Traceability matrix verification |
| Format | 10% | Professional layout, VSC branding, clear graphics and bar charts | Template compliance check |
| Actionability | 10% | Contractors can use the sequence directly for planning without interpretation | Contractor review and feedback |
| Traceability | 10% | Every sequence decision traceable to commissioning priority, constraint, or risk | Assumption register completeness check |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | Data Required | Criticality |
|---------------|---------------|-------------|
| Operations (model-commissioning-sequence) | Commissioning sequence with system priorities and target dates | Critical |
| Execution (master schedule) | Project milestones, schedule constraints, resource ceilings | Critical |
| Contracts & Compliance (track-long-lead-procurement) | Material and equipment delivery dates (confirmed and forecast) | Critical |
| Engineering Design | IFC drawing issue schedule by area, discipline, and system | Critical |
| HSE | Seasonal constraints, permit requirements, safety zone restrictions | High |

### Outputs Consumed By

| Agent / Skill | Data Provided | Trigger |
|---------------|---------------|---------|
| track-construction-progress | Construction baseline schedule for progress measurement | At baseline approval |
| coordinate-subcontractors | Mobilization timing, area assignment, discipline sequencing per contractor | At contractor award |
| manage-site-logistics | Area start dates for logistics planning, heavy lift schedule, laydown timing | At sequence approval |
| Execution (project controls) | Resource-loaded schedule for cost and schedule forecasting | At baseline approval |
| Contracts & Compliance | Material need-by dates for procurement expediting | At sequence approval |

---

## References

- **VSC OR Playbook** -- Construction Execution Planning section (Level 4-5)
- **AACE RP 10S-90** -- Cost Engineering Terminology: construction sequencing and scheduling definitions
- **CII RT-184** -- Advanced Work Packaging: work package sequencing best practices
- **PMI Practice Standard for Scheduling** -- Sequencing logic and resource leveling methodology
- **ISO 21500:2021** -- Project Management: schedule development and resource management

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
