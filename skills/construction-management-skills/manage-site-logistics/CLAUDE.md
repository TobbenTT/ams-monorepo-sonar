---
name: manage-site-logistics
description: "Plan and manage construction site logistics including laydown areas, temporary facilities, access roads, material flow, and crane planning. Triggers: 'site logistics', 'laydown areas', 'logistica de sitio', 'areas de acopio', 'instalaciones temporales'."
---

# Manage Site Logistics

## Skill ID: CONST-12

## Version: 1.0.0

## Category: C-Planning (Construction Management)

## Priority: P1 - High

---

## Purpose

Plan and manage construction site logistics including laydown areas, temporary facilities, access roads, material receipt and storage, crane and heavy lift planning, and material flow to work fronts. Site logistics is the physical infrastructure that enables construction execution -- when it works well, it is invisible; when it fails, every construction activity suffers delays, cost overruns, and safety incidents.

Poor site logistics is a silent schedule killer. Unlike engineering delays or procurement problems that appear as discrete events, logistics failures create a continuous drag on productivity that is difficult to measure but devastating in aggregate. Industry benchmarks from CII (Construction Industry Institute) show that construction craft workers in poorly organized sites spend 35-45% of their time on non-productive activities (traveling to work fronts, waiting for materials, waiting for crane access, searching for tools). Well-managed site logistics can reduce this to 15-20%, effectively increasing productive labor by 20-30% without adding a single worker.

Key value drivers:
- **Productivity improvement**: Efficient material flow reduces craft idle time by 20-30%, equivalent to adding significant workforce without additional cost
- **Safety enhancement**: Proper traffic management, designated pedestrian routes, and organized laydown prevent the leading causes of construction site fatalities (struck-by, caught-between)
- **Cost avoidance**: Preventing double-handling of materials (receiving to laydown to work front vs. direct delivery) saves 3-8% of total construction labor cost
- **Schedule protection**: Pre-planned crane availability and heavy lift sequences prevent the cascading delays caused by crane conflicts and blocked access
- **Material preservation**: Proper storage and protection prevents weather damage, theft, and deterioration of materials awaiting installation

This skill covers the complete site logistics lifecycle from initial site layout planning through daily logistics operations to demobilization. It integrates with all construction disciplines because every discipline depends on logistics for materials, equipment, access, and lifting services.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Site Layout Planning**: The site layout must be designed as a dynamic plan that evolves through construction phases -- laydown areas, temporary facilities, access roads, and crane positions change as construction progresses from earthworks through structural through mechanical completion. Each phase requires a distinct site layout plan showing current and planned changes
2. **Laydown Area Management**: Laydown areas must be allocated by discipline and contractor with clear boundaries, access protocols, and inventory tracking. Over-allocation leads to material searching and confusion; under-allocation leads to materials stored in construction areas blocking work. Allocation must consider material type (structural steel vs. piping vs. electrical cable), protection requirements, and proximity to installation point
3. **Material Receipt and Flow**: The material logistics chain from gate receipt through inspection, storage, preservation, and delivery to work front must be managed as a pull system driven by construction sequence need dates, not a push system driven by procurement delivery dates. Materials should flow to the point of installation with minimum intermediate handling
4. **Crane and Heavy Lift Planning**: Crane positions, reach diagrams, load charts, and scheduling must be coordinated across all construction activities to prevent conflicts. Heavy lifts (equipment setting, vessel erection, module installation) require dedicated planning with engineered lift plans, ground bearing validation, and exclusion zone management
5. **Traffic and Access Management**: Site traffic must be segregated (heavy vehicles, light vehicles, pedestrians) with one-way systems, speed controls, and designated crossing points. Access to construction areas must be controlled to prevent unauthorized entry and ensure emergency vehicle access at all times

---

## Trigger / Invocation

```
/manage-site-logistics
```

### Natural Language Triggers

- "Plan the construction site logistics layout"
- "Set up laydown area allocation for the project"
- "Develop the crane and heavy lift plan"
- "Planificar la logistica del sitio de construccion"
- "Gestionar las areas de acopio y almacenamiento"
- "Desarrollar el plan de izaje y gruas"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Site Survey and Topography | Engineering Design | .dwg / .pdf | Site boundaries, contours, existing infrastructure, underground services |
| Construction Sequence | plan-construction-sequence | .xlsx / .docx | Area-by-area construction start/finish dates driving logistics phasing |
| Equipment List with Weights/Dimensions | Engineering Design | .xlsx | All equipment items with lifting weight, installed weight, and envelope dimensions |
| Material Delivery Schedule | Contracts & Compliance | .xlsx | Delivery dates and quantities for all bulk and tagged materials |
| HSE Site Safety Plan | HSE | .docx | Safety zones, exclusion areas, emergency access requirements, speed limits |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Geotechnical Report | Engineering | .pdf | Conservative ground bearing capacity assumed for crane pad design |
| Modularization Strategy | Engineering Design | .docx | All construction assumed stick-built; no module receipt areas planned |
| Contractor Mobilization Plan | Contracts & Compliance | .docx | Generic mobilization assumptions based on workforce histogram |

### Context Enrichment

- Retrieve area start dates and discipline sequencing from plan-construction-sequence skill output
- Access equipment preservation requirements from manage-preservation-program for storage planning
- Pull material delivery forecasts from track-long-lead-procurement for laydown capacity planning
- Query subcontractor mobilization dates from coordinate-subcontractors for temporary facilities sizing
- Access weather data for the site location to plan covered storage and seasonal logistics adjustments

---

## Output Specification

### Document 1: Site Logistics Plan (.docx)

**Filename**: `{ProjectCode}_Site_Logistics_Plan_v{Version}_{YYYYMMDD}.docx`

**Structure:**

1. **Site Layout Plan (by Phase)**
   - Phase 1 (Earthworks/Civil): laydown areas, access roads, temporary offices, initial crane pads
   - Phase 2 (Structural/Equipment): expanded laydown, crane positions for steel erection and equipment setting
   - Phase 3 (Mechanical/E&I): piping fabrication areas, cable laydown, instrument storage
   - Phase 4 (Pre-commissioning): reduced laydown, commissioning support areas, chemical storage
   - Phase 5 (Demobilization): progressive handback of temporary areas

2. **Laydown Area Allocation**
   - Area-by-area allocation map with dimensions and capacity (tonnes or units)
   - Discipline/contractor allocation with shared area protocols
   - Material preservation requirements per laydown area (covered, sheltered, heated, desiccated)
   - Inventory tracking system description and tagging protocol

3. **Temporary Facilities Plan**
   - Construction offices (owner, contractors, subcontractors): location, size, utilities
   - Warehouses: covered storage capacity by material type
   - Fabrication shops: piping pre-fabrication, structural fit-up, electrical panel assembly
   - Worker amenities: crib rooms, washrooms, parking, bus staging
   - Utility connections: temporary power, water, compressed air, communications

4. **Traffic Management Plan**
   - Road network: permanent and temporary roads, one-way systems, turning circles
   - Vehicle segregation: heavy haul routes, light vehicle routes, pedestrian routes
   - Speed controls and signage plan
   - Gate control: vehicle inspection, material receipt, personnel access
   - Emergency access routes and muster points

5. **Crane and Heavy Lift Plan**
   - Crane fleet: type, capacity, boom length, location by phase
   - Crane reach diagrams overlaid on site plan per phase
   - Heavy lift plan register: all lifts > 20 tonnes with engineered lift plans required
   - Ground bearing capacity requirements per crane pad location
   - Crane scheduling protocol and conflict resolution process

6. **Material Flow Plan**
   - Receiving protocol: gate receipt, inspection, tagging, transport to laydown
   - Storage-to-work-front delivery: pull system triggers, transport methods, staging areas
   - Just-in-time delivery opportunities for high-volume bulk materials
   - Returns and surplus material management

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Laydown Utilization | Actual usage / allocated capacity per area | 70-85% (avoid over-allocation) |
| Material Wait Time | Average time craft waits for material at work front | < 30 minutes per shift |
| Crane Utilization | Productive crane hours / available crane hours | > 65% |
| Double-Handling Rate | Materials moved more than once before installation | < 15% of total material movements |
| Traffic Incidents | Vehicle/pedestrian near-misses or incidents per month | Zero LTIs; < 2 near-misses/month |

---

## Procedure

### Step 1: Develop Site Layout by Construction Phase

1. Obtain the site survey, boundaries, and existing infrastructure from the engineering design package
2. Overlay the construction sequence onto the site plan to identify which areas are under active construction in each phase and which areas are available for logistics use
3. Identify permanent infrastructure that constrains logistics (existing roads, buildings, pipelines, overhead power lines, underground services)
4. Designate laydown areas based on proximity to installation areas, ground conditions (level, compacted, drained), and access road connectivity
5. Position temporary facilities (offices, warehouses, fabrication shops) considering: proximity to construction areas, utility connections, security, and future handback requirements
6. Plan temporary roads connecting laydown areas to construction work fronts, ensuring adequate turning radii for delivery trucks and trailer access
7. Validate site layout against HSE requirements: emergency access, exclusion zones, safe distances from hazardous materials, fire hydrant access

### Step 2: Plan Laydown Areas and Material Storage

1. Calculate laydown area requirements by material type: structural steel (tonnes per m2 stacked), piping (linear meters per m2 racked), electrical cable (drums per m2), equipment (footprint plus access clearance), instruments (covered storage m2)
2. Allocate laydown areas to disciplines and contractors with clear boundary markings and signage
3. Define material preservation requirements per laydown area: open storage (structural steel, large equipment), covered storage (motors, gearboxes, instruments), climate-controlled storage (electronics, specialty chemicals, lubricants)
4. Establish the material receiving protocol: gate entry, weighbridge (if applicable), receiving inspection, material identification and tagging, transport to designated laydown area, storage per preservation requirements
5. Implement inventory tracking: barcode or RFID tagging at receipt, location tracking in laydown, issue tracking to work front, surplus return protocol
6. Plan the phased handback of laydown areas as construction progresses and material volumes decrease, converting temporary laydown back to permanent use or landscaping

### Step 3: Plan Crane Fleet and Heavy Lifts

1. Compile the heavy lift register from the equipment list: all items requiring crane assistance for installation, with lifting weight, installed position (height, reach), and planned installation date from the construction sequence
2. Select the crane fleet (type, capacity, boom configuration) to cover all lifts with adequate safety margin (minimum 80% of crane rated capacity at the required radius)
3. Develop crane position plans showing crane pad locations, reach diagrams, and exclusion zones for each major phase of construction
4. Validate ground bearing capacity at crane pad locations against crane ground loading requirements; specify crane pad construction (compacted gravel, concrete mats, timber mats) where native ground is insufficient
5. Sequence heavy lifts to avoid conflicts: no two critical lifts requiring the same crane on the same day unless a backup plan is documented
6. Identify lifts requiring engineered lift plans (typically > 80% of crane capacity, tandem lifts, blind lifts, lifts over live facilities) and schedule engineering reviews
7. Establish the crane scheduling protocol: daily crane schedule issued at end of prior day, crane priority rules (critical path first, then by area, then first-come), conflict escalation to Construction Manager

### Step 4: Implement Traffic and Access Management

1. Design the site road network: permanent roads (aligned with final facility layout where possible), temporary roads (designed for removal), one-way circuits for heavy vehicles, separate light vehicle routes
2. Designate pedestrian routes physically separated from vehicle traffic with barriers, not just painted lines; pedestrian crossings at controlled points with stop signs for vehicles
3. Establish gate control procedures: personnel access (induction card required), vehicle access (inspection, load verification), material delivery (appointment system to prevent gate queuing)
4. Install speed controls: speed bumps at 200m intervals on temporary roads, radar speed signs at entries, 15 km/h in congested areas, 30 km/h on haul roads
5. Plan emergency access: all construction areas accessible to emergency vehicles at all times; no temporary storage blocking emergency routes; daily verification of emergency access as part of HSE inspection
6. Create the traffic management plan document with site maps showing all routes, signage locations, speed zones, and pedestrian crossings for contractor induction briefings

### Step 5: Manage Daily Logistics Operations

1. Issue the daily logistics schedule: crane assignments by area and time, material deliveries expected, heavy haul movements planned, road closures for heavy lifts, laydown area changes
2. Conduct morning logistics coordination meeting (15 minutes) with all contractor logistics coordinators: confirm crane schedule, resolve material delivery conflicts, address access issues
3. Monitor laydown area utilization and intervene when areas exceed capacity or materials are stored in unauthorized locations
4. Track material delivery performance: on-time delivery rate, material damage rate, receiving inspection rejection rate, time from gate to laydown
5. Coordinate heavy lifts: pre-lift safety briefing, exclusion zone establishment, weather verification (wind speed < limits), lift execution supervision, post-lift area release
6. Update site layout plans weekly to reflect as-built changes: new temporary roads, modified laydown boundaries, crane relocations, temporary facility additions or removals
7. Report logistics KPIs weekly: crane utilization, material wait time, laydown utilization, traffic incidents, delivery performance

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Laydown areas overwhelmed with materials | Materials delivered based on procurement schedule, not construction need dates | Implement pull-based material delivery aligned with construction sequence; refuse early deliveries without designated storage |
| Crane conflicts between areas | No centralized crane scheduling; each contractor assumes crane availability | Mandatory centralized crane scheduling with daily allocation and conflict resolution protocol |
| Material damage in storage | Inadequate preservation in laydown (weather exposure, ground contact, stacking damage) | Define preservation requirements per material type; audit laydown conditions weekly; reject non-compliant storage |
| Traffic incident (vehicle-pedestrian) | Inadequate segregation of vehicles and pedestrians; no physical barriers | Physical separation barriers required; controlled pedestrian crossings; zero tolerance for shortcutting |
| Double-handling of materials | Materials stored far from installation point; no staging areas near work fronts | Plan material staging areas adjacent to active construction areas; use direct-to-work-front delivery where possible |
| Temporary facilities insufficient for peak workforce | Facilities sized for average workforce, not peak; no phasing plan | Size facilities for peak plus 10% contingency; plan phased expansion aligned with workforce buildup |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Laydown area at > 90% capacity with additional deliveries pending | Within 24 hours | Logistics Manager -> Construction Manager -> Project Manager |
| Crane breakdown on critical path activity | Immediately | Crane Supervisor -> Construction Manager -> Project Director (for backup crane mobilization) |
| Material delivery rejected at gate (damage, wrong specification) | Within 4 hours | Receiving Inspector -> Logistics Manager -> Procurement Manager |
| Unauthorized material storage blocking access or emergency routes | Immediately | HSE Officer -> Construction Manager -> offending Contractor PM |
| Traffic incident (near-miss or injury) | Immediately per HSE protocol | Site HSE -> Construction Manager -> Project Director -> Client HSE |
| Temporary road failure (washout, subsidence) | Within 4 hours | Logistics Manager -> Civil Supervisor -> Construction Manager |
| Heavy lift weather delay > 2 days impacting critical path | After day 2 of delay | Crane Supervisor -> Construction Manager -> Project Controls -> Project Director |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Crane selections verified against load charts; laydown capacities calculated from material quantities | Engineering review of crane plans; laydown capacity calculation audit |
| Completeness | 25% | All logistics elements covered: laydown, cranes, traffic, facilities, material flow, phasing | Checklist verification against scope of work |
| Consistency | 15% | Site layout aligns with construction sequence, HSE plan, and commissioning requirements | Cross-reference review with upstream skills |
| Format | 10% | Professional site layout drawings, clear legends, VSC branding on documents | Template compliance check |
| Actionability | 10% | Contractors can implement logistics plan directly without interpretation | Contractor review session with feedback |
| Traceability | 10% | Every logistics decision traceable to construction sequence, material schedule, or safety requirement | Decision log audit |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | Data Required | Criticality |
|---------------|---------------|-------------|
| Execution (site plan) | Site survey, boundaries, existing infrastructure layout | Critical |
| plan-construction-sequence | Area-by-area construction start dates and discipline sequence | Critical |
| Contracts & Compliance (material deliveries) | Material delivery dates and quantities for laydown planning | Critical |
| Engineering Design | Equipment weights, dimensions, and lifting requirements | Critical |
| HSE | Safety zones, exclusion areas, emergency access requirements, speed limits | High |

### Outputs Consumed By

| Agent / Skill | Data Provided | Trigger |
|---------------|---------------|---------|
| All construction activities | Daily logistics schedule: crane assignments, material deliveries, road closures | Daily |
| coordinate-subcontractors | Work-front access assignments, laydown area allocations, facility assignments | At contractor mobilization |
| track-construction-progress | Logistics constraint log (delays caused by logistics issues) | Weekly |
| manage-preservation-program | Laydown area conditions and material storage audit results | Weekly |
| HSE | Traffic management plan, heavy lift plans for safety review | At plan issue and per lift |

---

## References

- **VSC OR Playbook** -- Construction Site Management section (Level 4)
- **CII RS-272** -- Construction Site Layout Planning: best practices for laydown and temporary facilities
- **OSHA 29 CFR 1926** -- Safety and Health Regulations for Construction: traffic management and crane operations
- **ASME B30 series** -- Cranes and lifting equipment standards: load charts, inspection, and operation
- **ISO 21500:2021** -- Project Management: resource management and logistics planning

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
