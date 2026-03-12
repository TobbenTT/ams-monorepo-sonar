---
name: manage-engineering-interfaces
description: "Manage the Interface Register tracking all technical interfaces between engineering disciplines, between the project and external parties, and between engineering packages. Triggers: 'engineering interface', 'interface register', 'discipline coordination', 'registro de interfaces', 'coordinacion interdisciplinaria', 'gestion de interfaces'."
---

# Manage Engineering Interfaces
## Skill ID: manage-engineering-interfaces
## Version: 1.0.0
## Category: C - Planning
## Priority: High

## Purpose

Engineering interfaces are the technical boundaries and data exchange points where one discipline's output becomes another discipline's input, where the project scope meets external parties (utilities, neighboring facilities, regulatory bodies), and where separate engineering packages share physical or logical boundaries (OSBL/ISBL, different EPC contractors, owner-furnished equipment). Unmanaged interfaces are consistently identified in project post-mortem analyses as one of the top three sources of design errors, field rework, and cost overruns on industrial capital projects.

In a typical mining concentrator or oil and gas processing facility, there are hundreds of engineering interfaces. Process engineering provides heat and material balance data to mechanical engineering for equipment sizing. Mechanical engineering provides equipment nozzle loads to structural engineering for foundation design. Piping engineering provides pipe support loads to structural engineering. Electrical engineering needs motor data from mechanical engineering to size cables and switchgear. Instrumentation engineering needs process conditions from process engineering to specify transmitters and control valves. Each of these data exchanges has a timing dependency -- the receiving discipline cannot complete its work until the providing discipline delivers the required data. When an interface is not identified, not defined, not tracked, or not resolved on time, the receiving discipline either waits (causing schedule delay) or assumes data (causing potential design errors that emerge as field rework).

Beyond interdisciplinary interfaces within the project team, there are external interfaces that carry even higher risk:
- Tie-in points to existing plant utilities (steam, cooling water, compressed air, electrical power)
- Boundary conditions with adjacent facilities (shared roads, drainage, fire protection)
- Connections to public infrastructure (power grid, municipal water supply, transportation routes)
- Compliance interfaces with regulatory authorities (environmental permits, building approvals)

These external interfaces often involve third parties with different priorities, timelines, and communication protocols, making proactive management essential. External interface failures can delay construction by months if a utility connection is not available when needed.

This skill provides the systematic framework for identifying all interfaces at project inception, registering them in a structured Interface Register, defining the required data exchange for each interface, tracking resolution through to formal closure, and escalating overdue interfaces before they become critical path blockers. The Interface Register is maintained as a living document throughout the engineering phase and is a key input to the weekly interdisciplinary coordination meetings.

## Intent & Specification
The AI agent MUST understand that:

1. **Every discipline pair must be systematically assessed for interfaces** using a discipline coordination matrix. The agent must not rely on ad hoc identification; it must generate the complete NxN matrix of discipline combinations and confirm interface existence or absence for each pair. For a project with 8 engineering disciplines, this means 28 unique pairs to assess. Each pair must be explicitly evaluated and documented, even if the conclusion is "no interface required."

2. **Each interface must be defined with precision.** Required elements include:
   - Unique interface ID (format: IF-{Provider}-{Consumer}-{Sequential})
   - Clear description of the data or information to be exchanged
   - Providing discipline (owner responsible for delivering the data)
   - Receiving discipline (consumer who needs the data)
   - Specific deliverable or data format required
   - Required date (aligned with the receiving discipline's schedule)
   - Current resolution status
   - Vague definitions such as "mechanical data to structural" are not acceptable. The interface must specify "equipment nozzle loads for vessels V-2001, V-2002, V-2003 per API 650 Annex E format."

3. **Interface resolution follows a defined lifecycle**:
   - Identified: Interface exists but data requirements not yet defined
   - Defined: Data requirements specified and agreed between providing and receiving parties
   - Data Exchanged: Providing discipline has issued the required data via formal transmittal
   - Agreed: Receiving discipline confirms the data is acceptable and sufficient for design purposes
   - Closed: Interface formally closed with sign-off from both discipline leads
   - Disputed: Parties disagree on data content or requirements; escalated to Engineering Manager

4. **The Interface Register must be the agenda backbone for the weekly interdisciplinary coordination meeting.** Open and overdue interfaces drive the meeting agenda, and meeting minutes must record status updates, commitments, and escalation decisions for each active interface.

5. **External interfaces require formal Interface Agreements (IAs)** -- signed documents that define the scope, responsibilities, deliverables, schedule, and dispute resolution mechanism for each party. Internal discipline interfaces may be managed through the standard register, but external interfaces (OSBL/ISBL boundaries, utility tie-ins, third-party connections) must have contractual-quality documentation with legal standing.

## Trigger / Invocation
```
/manage-engineering-interfaces
```

### Natural Language Triggers
- "Set up the engineering interface register for the project"
- "What are the open interfaces between process and mechanical engineering?"
- "Track the interface resolution status for Area 200"
- "Configurar el registro de interfaces de ingenieria para el proyecto"
- "Cuales son las interfaces abiertas entre ingenieria de procesos y mecanica?"
- "Preparar el informe de estado de interfaces para la reunion de coordinacion semanal"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_code` | Unique project identifier | String | Project context |
| `discipline_list` | Engineering disciplines active on the project with discipline lead names and contact details | .xlsx / List | Project organization chart / Engineering Manager |
| `project_schedule` | Engineering schedule with discipline milestones for interface timing alignment | .xlsx / .mpp extract | Project Controls / Execution Agent |
| `scope_definition` | Project scope description including OSBL/ISBL boundaries, battery limits, and external connections | .docx / .pdf | Project scope documents |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `existing_register` | Current interface register if updating an established register rather than creating new | New register created from scratch using discipline matrix |
| `external_party_contacts` | Contact details and schedule commitments from external parties (utility providers, adjacent operators, regulatory bodies) | To be determined during interface identification phase |
| `standard_interface_template` | Project-specific or corporate interface agreement template for external interfaces | VSC standard interface agreement template |
| `historical_interface_data` | Interface registers from similar past projects for reference and completeness checking | None; standard industry interface list used |

### Context Enrichment
The agent should automatically:
- Generate the complete discipline coordination matrix (NxN) from the discipline list to ensure systematic interface identification with no discipline pair omitted
- Cross-reference the EDDR from manage-engineering-deliverables to identify deliverables that serve as interface data (e.g., P&IDs are an interface from Process to Piping, datasheets are an interface from Process to Mechanical)
- Retrieve the project schedule milestones from the Execution agent to set interface required dates aligned with the receiving discipline's planned design activity start dates
- Check the contracts register from Contracts & Compliance for any contractual interfaces between the owner, EPC contractor, and sub-contractors that must be registered and managed
- Pull external utility connection requirements from the site data and design basis to pre-populate external interface definitions for power, water, gas, telecommunications, and other utility tie-ins

## Output Specification

### Document: Engineering Interface Register (.xlsx)
**Filename**: `VSC_InterfaceRegister_{ProjectCode}_v{Version}_{Date}.xlsx`

**Structure**:

1. **Interface Register Summary Dashboard**
   - Total interface count with breakdown by type (inter-discipline / external / package boundary)
   - Status distribution chart: Identified / Defined / Data Exchanged / Agreed / Closed / Overdue / Disputed
   - Interface closure rate trend chart (weekly, cumulative)
   - Overdue count by discipline pair in horizontal bar chart
   - Traffic-light status by providing discipline (Green: all on schedule; Amber: 1-2 overdue; Red: 3+ overdue)

2. **Master Interface Register**
   - Interface ID (unique identifier per project convention)
   - Description (specific data exchange requirement)
   - Interface type (inter-discipline / external / package boundary)
   - Providing discipline or party (with lead name)
   - Receiving discipline or party (with lead name)
   - Required deliverable or data format
   - Required date (from receiving discipline schedule)
   - Actual delivery date
   - Current status (per lifecycle definitions)
   - Transmittal reference (when data exchanged)
   - Remarks and escalation flags

3. **Discipline Coordination Matrix**
   - NxN matrix with all project disciplines on both axes
   - Each cell shows: interface count, aggregate status (color-coded), and overdue count
   - Green cells: all interfaces closed or on schedule
   - Amber cells: some interfaces open but within schedule
   - Red cells: overdue interfaces exist requiring action

4. **Overdue Interface Analysis**
   - All interfaces past their required date with data not yet exchanged
   - Days overdue with aging category (1-5 days / 5-10 days / 10-20 days / >20 days)
   - Impact assessment on the receiving discipline (what work is blocked or at risk)
   - Root cause documented by the providing discipline
   - Recovery plan with committed recovery date
   - Escalation status and responsible manager

5. **External Interface Agreements Status**
   - IA reference number and external party name
   - IA lifecycle status: Draft / Issued / Under Review / Signed / Active / Data Exchanged / Closed
   - Key milestone dates (IA target sign date, data exchange dates, closure date)
   - Compliance assessment (external party meeting commitments: Yes / Partially / No)

6. **Weekly Coordination Meeting Pack**
   - Pre-formatted agenda listing all open interfaces sorted by priority
   - Overdue interfaces requiring immediate action (with escalation status)
   - Newly identified interfaces since last meeting
   - Interfaces approaching required date within next 2 weeks (early warning)
   - Action items from previous meeting with completion status

### Standard Interdisciplinary Interface List (Reference)

| Provider Discipline | Receiver Discipline | Typical Interface Data |
|--------------------|--------------------|----------------------|
| Process | Mechanical | Equipment duty data, process conditions, fluid properties |
| Process | Piping | Line list, P&IDs, operating conditions per line |
| Process | Instrumentation | Process conditions for instrument specification, control valve sizing data |
| Process | Electrical | Motor load list, electrical heat tracing requirements |
| Mechanical | Structural | Equipment weights, nozzle loads, dynamic loads |
| Mechanical | Piping | Equipment nozzle orientation and sizes, allowable nozzle loads |
| Mechanical | Instrumentation | Instrument connection sizes and locations on equipment |
| Piping | Structural | Pipe support loads, thermal expansion loads, anchor forces |
| Piping | Civil | Underground pipe routing, sleeves, penetrations |
| Electrical | Civil | Cable trench routing, grounding grid layout |
| Electrical | Structural | Cable tray support loads, transformer pad requirements |
| Instrumentation | Electrical | Instrument power supply requirements, cable schedule |
| Structural | Civil | Foundation loads, anchor bolt patterns, base plate details |
| All Disciplines | HSE | Hazardous area boundary data, safety-critical design parameters |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Interface Closure Rate | Closed interfaces / total registered interfaces | > 90% closed at 80% engineering completion |
| Overdue Interface Count | Interfaces past required date with data not yet exchanged | Zero overdue at any reporting period |
| Average Resolution Time | Mean working days from interface identification to formal closure | < 20 working days for internal; < 40 for external |
| External IA Coverage | External interfaces with signed Interface Agreements / total external interfaces | 100% IA coverage before detailed design commences |
| Coordination Meeting Effectiveness | Interfaces resolved per weekly meeting cycle / total open interfaces discussed | > 30% resolution rate per meeting cycle |

## Procedure

### Step 1: Identify and Register All Interfaces
- Build the discipline coordination matrix: list all engineering disciplines on both axes of an NxN table
- For each unique discipline pair, systematically assess the data exchanges required between them
- Draw on standard industry interface lists for the facility type (mining, oil & gas, chemical, power) as a completeness reference
- For each identified interface, create a register entry with:
  - Unique interface ID: IF-{ProviderCode}-{ReceiverCode}-{Sequential number}
  - Detailed description of the specific data or information to be exchanged
  - Providing discipline (the party who must produce and deliver the data)
  - Receiving discipline (the party who needs the data to proceed with design work)
  - Required deliverable format (document type, data table, 3D model extract, etc.)
  - Required date (to be defined in Step 2)
- Identify external interfaces systematically by reviewing:
  - Utility connections: power supply, water supply, natural gas, compressed air, telecommunications
  - Boundary conditions: neighboring facilities, shared infrastructure, environmental discharge points
  - Public infrastructure: road connections, rail connections, port facilities
  - Regulatory interfaces: environmental permits, building permits, mining permits
- For each external interface, initiate a formal Interface Agreement process:
  - Draft the IA document using the project template
  - Circulate to the external party for review and comment
  - Track negotiation and resolve any commercial or technical disagreements
  - Obtain signatures from authorized representatives of both parties
- Identify package boundary interfaces:
  - OSBL/ISBL demarcation points (battery limits)
  - Split-scope boundaries between multiple EPC contractors
  - Owner-furnished equipment (OFE) interfaces where engineering responsibility transfers
- Conduct a completeness review with each discipline lead to confirm all required interfaces have been identified
- Baseline the total interface count and generate the initial planned interface closure S-curve

### Step 2: Define Interface Requirements and Schedule
- For each interface, work with the providing and receiving disciplines to define:
  - The specific deliverable or data content required (not just "process data" but "heat and material balance Case 1 through Case 5 for streams S-201 through S-215")
  - The format and level of detail required (preliminary for concept, final for detailed design)
  - The acceptance criteria (what makes the data sufficient for the receiving discipline)
- Establish the required date for each interface:
  - Start with the receiving discipline's planned design activity start date
  - Subtract the lead time needed for the receiving discipline to review and incorporate the data (typically 2-4 weeks)
  - The result is the interface required date -- the latest date by which the providing discipline must deliver
- Validate interface dates against the project schedule:
  - Cross-check that the providing discipline can realistically deliver by the required date given its own deliverable schedule
  - Identify date conflicts where the providing discipline's planned output is later than the receiving discipline's need
  - Work with both parties and the Engineering Manager to resolve conflicts (re-prioritize, provide preliminary data, phase the interface)
- For external interfaces, align the interface schedule with the external party's commitments per the signed IA
- Assign a single accountable owner for each interface: the discipline lead of the providing party
- Record all interface definitions and dates in the Interface Register and issue the baseline register to all discipline leads

### Step 3: Track Resolution and Data Exchange
- Monitor interface status weekly, updating the register with:
  - Data exchanged: date, transmittal reference number, and description of data provided
  - Receiving discipline acknowledgment of receipt
  - Any comments, queries, or requests for additional data from the receiving discipline
  - Formal agreement/closure confirmation when data is accepted as complete and sufficient
- For interfaces where data has been exchanged but the receiving discipline raises queries:
  - Log each query in the interface register with date and description
  - Track the query-response cycle until the receiving discipline is satisfied
  - Do not advance the interface status to "Agreed" until all queries are resolved
- Flag overdue interfaces (past required date with data not yet exchanged):
  - Notify the providing discipline lead on the required date
  - Set a recovery commitment date (maximum 5 working days from the required date)
  - If not resolved within 5 working days, escalate to the Engineering Manager
- Track disputed interfaces separately:
  - Document the specific disagreement between providing and receiving disciplines
  - Facilitate a resolution discussion in the coordination meeting
  - If parties cannot agree within 10 working days, escalate to the Engineering Manager for a binding ruling
- Update the interface closure trend chart weekly to compare actual closures against the planned S-curve
- Identify systemic patterns: if one discipline is consistently late on multiple interfaces, flag as a resource or process issue requiring management intervention

### Step 4: Manage External and Package Boundary Interfaces
- For each external Interface Agreement, track the IA lifecycle:
  - Draft prepared and issued to external party
  - Under review by external party (track duration vs. agreed review period)
  - Signed by both parties (record effective date)
  - Active: data exchange underway per IA schedule
  - Data exchanged: all IA deliverables provided and acknowledged
  - Closed: both parties confirm all obligations met and sign closure certificate
- Monitor external party commitments against their IA schedule:
  - Flag delays immediately upon detection
  - Coordinate with the Project Manager for formal written communication to the external party
  - Document all external party delays for potential contractual claim support
- For OSBL/ISBL boundary interfaces, maintain a boundary condition register:
  - Define exact conditions at each battery limit point: pressure, temperature, flow rate, composition, electrical voltage/frequency, control signal protocol
  - Both parties must formally agree and sign off on boundary conditions
  - Any change to boundary conditions requires re-agreement from both parties
- For split-scope contractor interfaces:
  - Ensure the IA clearly defines which party is responsible for each element at the boundary
  - Verify design compatibility at the boundary (pipe sizes, flange ratings, cable sizes, control protocols)
  - Conduct joint design review at boundaries before either party issues IFC drawings
- For owner-furnished equipment (OFE):
  - Track the owner's data provision schedule
  - Verify that vendor technical data is transmitted to the engineering team on time
  - Flag any delays in OFE vendor data that could block engineering design
- Conduct periodic interface alignment meetings with external parties (frequency per IA terms, typically monthly)

### Step 5: Report, Coordinate, and Close
- Prepare the weekly coordination meeting pack:
  - Agenda of all open and overdue interfaces, sorted by priority (overdue first, approaching required date second)
  - Status updates on all interfaces discussed in the previous meeting
  - Newly identified interfaces requiring registration
  - Summary metrics: total open, total overdue, resolution rate, trend direction
- Facilitate the weekly interdisciplinary coordination meeting:
  - Record decisions, commitments, and escalation actions in structured meeting minutes
  - Assign clear action items with owners and due dates for each unresolved interface
  - Ensure each discipline lead confirms their interface commitments for the coming week
- Generate the weekly/monthly interface status report for the Engineering Manager and Project Manager:
  - Dashboard metrics with trend indicators
  - Closure rate comparison against planned S-curve
  - Overdue analysis with root causes and recovery plans
  - Escalation summary with management actions required
- Feed interface status data to the Execution agent for integration into the project progress report and schedule risk assessment
- Feed interface metrics to the Orchestrator agent for the project management dashboard and gate review packages
- Close interfaces formally when:
  - The receiving discipline confirms the data is complete, correct, and sufficient for design
  - Both discipline leads sign the closure record
  - The closure is recorded in the register with date, transmittal reference, and sign-off evidence
- At project completion, archive the Interface Register as part of close-out documentation and capture lessons learned

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Interfaces not identified at project start | Ad hoc identification instead of systematic matrix approach | Mandatory discipline coordination matrix generated at project inception; completeness review with all discipline leads; reference to standard industry interface lists |
| Interface definitions too vague | "Process data to mechanical" without specifying content, format, or acceptance criteria | Interface definition template requiring specific deliverable description, format, and explicit acceptance criteria before the interface is baselined |
| Interface dates not aligned with schedule | Arbitrary dates set without reference to the receiving discipline's actual need date | Interface dates derived from project schedule with reverse calculation from receiving discipline's planned start; validated by both parties |
| External interfaces managed informally | No formal Interface Agreement; reliance on verbal commitments or email exchanges | Mandatory signed IA for all external interfaces; no design work at boundary points without signed IA; formal correspondence for all external interface communications |
| Overdue interfaces not escalated | Overdue list grows without consequence; register becomes a static reporting tool | Automatic escalation triggers: discipline lead at required date; Engineering Manager at +5 days; Project Manager at +10 days; non-negotiable |
| Providing discipline deprioritizes interface data | Interface data seen as "other people's work" rather than a project obligation | Interface data provision explicitly included in the providing discipline's deliverable schedule, progress measurement, and KPI tracking |
| Boundary condition mismatch at package limits | Each party designs to their own assumed boundary conditions without formal agreement | Boundary condition register with formal sign-off from both parties before detailed design begins; joint review before IFC |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Interface data not provided by required date | At required date | Providing discipline lead notification; recovery commitment required within 3 working days |
| Interface overdue by > 5 working days | 5 days past required date | Engineering Manager formal escalation; resource reallocation or schedule adjustment within 5 working days |
| Interface overdue by > 15 working days | 15 days past required date | Project Manager escalation; quantified impact on receiving discipline schedule; corrective action plan required |
| Disputed interface between disciplines unresolved | After 10 working days without resolution | Engineering Manager binding ruling within 5 working days; documented decision distributed to both parties |
| External party late on IA commitment | At IA committed date | Project Manager formal letter to external party; contractual remedies evaluated; alternative supply options assessed |
| Pattern of late interfaces from one discipline (3+ overdue simultaneously) | At detection in weekly review | Engineering Manager investigation; root cause analysis; corrective action plan with specific targets |
| Package boundary condition mismatch between contractors | At detection during design review | Engineering Manager and Project Manager joint review; both contractors notified; resolution workshop within 10 working days |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >95% accuracy | Interface definitions correctly capture the actual data dependency; no missing interfaces discovered post-IFC that cause design rework |
| Completeness | 25% | 100% coverage | Every discipline pair assessed via NxN matrix; all external connections registered; all package boundaries documented |
| Consistency | 15% | Zero conflicts | Interface dates aligned with project schedule; interface status consistent with actual transmittal records; no contradictory data |
| Format | 10% | Professional | VSC template with discipline coordination matrix, status dashboard, trend charts, and clear tabular register suitable for meeting use |
| Actionability | 10% | Immediately usable | Weekly coordination pack enables productive meeting with clear action items, accountability, and decision support for Engineering Manager |
| Traceability | 10% | Full audit trail | Every interface data exchange traceable to transmittal reference and date; closure records signed by both discipline leads |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Project schedule with discipline milestones and construction sequence | Interface date setting, alignment, and priority assessment |
| Execution | Contractual interfaces between owner, EPC, and sub-contractors | Package boundary interface identification and IA requirements |
| Contracts & Compliance | Vendor data submission schedule and OFE interface commitments | External vendor interface registration and schedule tracking |
| Operations | Operational requirements driving discipline interfaces (process data, utility demands) | Process-to-discipline interface definition and priority setting |
| HSE | Safety-related interfaces (HAZOP action items requiring multi-discipline response) | Safety interface identification, tracking, and escalation |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Interface closure status impacting construction readiness and schedule risk | Project schedule risk assessment, reporting, and mitigation planning |
| Orchestrator | Interface metrics, coordination meeting outcomes, and escalation summary | Project management dashboard, governance reporting, and gate review inputs |
| HSE | Safety-related interface resolution status and timeline | Regulatory compliance verification and safety review close-out tracking |
| All Engineering Disciplines | Interface data availability and resolution status per discipline | Design coordination, deliverable scheduling, and resource planning |
| Contracts & Compliance | External interface compliance status and IA performance tracking | Vendor and contractor performance assessment and contractual compliance |

## References
- `methodology/or-playbook-and-procedures/` -- OR procedures including engineering coordination protocols and interface management frameworks
- `methodology/capital-projects/` -- Capital project interface management standards and coordination meeting procedures
- CII Research Summary 72-1 -- Interface Management on Capital Projects (identification, classification, and resolution methodology)
- AACE International RP 46R-11 -- Required Skills and Knowledge of an Interface Manager
- ISO 19650 -- Organization and digitization of information about buildings and civil engineering works (interface management within BIM frameworks)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
