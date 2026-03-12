---
name: analyze-pid-documents
description: "Extract structured data from P&IDs including equipment tags, instrument lists, line lists, control valve schedules, and control narratives. Transforms visual engineering information into actionable databases. Triggers: 'P&ID analysis', 'extract P&ID data', 'instrument index', 'analisis de P&ID', 'extraer datos de diagramas', 'lista de instrumentos'."
---

# Analyze P&ID Documents
## Skill ID: analyze-pid-documents
## Version: 1.0.0
## Category: B - Analysis
## Priority: Critical

## Purpose
Extracts structured, machine-readable data from Piping and Instrumentation Diagrams (P&IDs) to produce actionable databases that feed procurement, construction, commissioning, and operational readiness activities. P&IDs are the single most information-dense engineering document on any capital project, encoding equipment specifications, instrument configurations, piping arrangements, control logic, and safety system architecture in a standardized visual format.

In mining, oil & gas, chemicals, and energy projects across Latin America, the transition from P&ID drawings to structured data is a critical bottleneck. Manual extraction is error-prone and time-consuming, often resulting in incomplete equipment lists, missing instruments from procurement packages, and piping discrepancies discovered during construction. This skill systematically parses P&ID content to generate the master equipment list, instrument index, line list, control valve schedule, control narrative summaries, and safety instrumented system (SIS) device register.

The extracted data serves as the single source of truth for cross-referencing against the master equipment list maintained by Asset Management, the procurement packages assembled by Contracts & Compliance, the construction work packages prepared by Execution, and the commissioning sequences modeled by the Execution agent. Accurate P&ID data extraction in the early detailed design phase prevents cascading errors that surface as punch list items during commissioning.

For projects operating under Chilean standards, the skill ensures that instrument tagging conforms to ISA 5.1 (adopted via NCh-IEC references) and that equipment nomenclature aligns with the project-specific tag numbering philosophy document.

## Intent & Specification
The AI agent MUST understand that:

1. **P&IDs Are the Master Engineering Reference**: P&IDs are the legally controlled engineering documents from which all other discipline documents derive their scope. Equipment shown on P&IDs defines the procurement scope; instruments shown define the I&C scope; lines shown define the piping scope. If it is not on the P&ID, it does not exist in the project scope.
2. **ISA 5.1 Naming Convention is the Standard**: Instrument tag interpretation must follow ISA 5.1 (Instrumentation Symbols and Identification). The agent must correctly decode tag structures (e.g., FIC-2101A = Flow Indicating Controller, Area 21, Loop 01, Train A) and map first-letter/subsequent-letter combinations to measured variable and function.
3. **Cross-Referencing is Mandatory**: Every extracted data element must be cross-referenced against at least one other source document (equipment list, instrument index, line list, control narrative) to detect discrepancies. Unmatched items generate RFIs.
4. **Revision Control is Critical**: P&IDs undergo multiple revisions during detailed design. The agent must track which revision was analyzed and flag any superseded data when a new revision is received.
5. **Safety Systems Require Special Handling**: Safety Instrumented Functions (SIF), relief devices (PSV/PRV), and emergency shutdown (ESD) elements on P&IDs must be extracted into a separate SIS register with SIL ratings, trip setpoints, and cause-and-effect matrix references.

## Trigger / Invocation
```
/analyze-pid-documents
```

### Natural Language Triggers
- "Extract equipment and instrument data from P&IDs"
- "Build the instrument index from P&ID drawings"
- "Generate line list from P&ID set"
- "Extraer datos de equipos e instrumentos de los P&IDs"
- "Construir indice de instrumentos desde diagramas P&ID"
- "Generar lista de lineas desde los P&IDs del proyecto"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `pid_drawings` | Complete set of P&ID drawings for the scope area | .pdf / .dwg / .dgn | Engineering / Document Control |
| `tag_numbering_philosophy` | Project tag numbering convention document | .pdf / .docx | Engineering Lead |
| `master_equipment_list` | Current master equipment list for cross-reference | .xlsx / .csv | Asset Management Agent |
| `process_description` | Process description or basis of design for context | .pdf / .docx | Operations / Process Engineering |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `existing_instrument_index` | Current instrument index if partially developed | Generate new from P&IDs |
| `existing_line_list` | Current piping line list for cross-reference | Generate new from P&IDs |
| `control_narratives` | Control system functional descriptions | Extract basic logic from P&ID symbols |
| `sil_assessment_report` | SIL classification for safety instrumented functions | Flag SIF items for HSE agent follow-up |

### Context Enrichment
The agent should automatically:
- Retrieve the project's ISA 5.1 symbol legend and any project-specific symbol additions from the engineering standards
- Cross-reference extracted equipment tags against the master equipment list to identify discrepancies (missing items, tag mismatches, duplicate tags)
- Map instrument tags to control system I/O counts for DCS/PLC sizing verification
- Identify all safety-related devices (SIF initiators, final elements, PSVs, ESD valves) for separate SIS register compilation
- Check line designations against piping specification break tables to verify correct spec assignment per service conditions

## Output Specification

### Document: P&ID Data Extraction Package
**Filename**: `VSC_PID_DataExtract_{ProjectCode}_{Area}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Extraction Summary
| Column | Description |
|--------|-------------|
| P&ID Drawing Number | Drawing number of each P&ID analyzed |
| Revision | Revision level at time of extraction |
| Area/System | Plant area or system covered by this P&ID |
| Extraction Date | Date this P&ID was processed |
| Equipment Count | Number of equipment items extracted from this drawing |
| Instrument Count | Number of instrument tags extracted from this drawing |
| Line Count | Number of piping lines extracted from this drawing |
| Discrepancy Count | Number of discrepancies identified on this drawing |
| Status | Extraction Complete / Partial / Requires Re-extraction |

#### Sheet 2: Equipment Register
| Column | Description |
|--------|-------------|
| Equipment Tag | Tag number as shown on P&ID (e.g., P-2101A) |
| Description | Equipment description |
| Equipment Type | Classification (Pump, Vessel, Heat Exchanger, Compressor, Conveyor, etc.) |
| P&ID Reference(s) | Drawing number(s) where equipment appears |
| Area/System | Plant area and system assignment |
| Capacity/Rating | Design capacity or rating as shown on P&ID (if annotated) |
| Material of Construction | Material callout shown on P&ID (if annotated) |
| Design Pressure | Design pressure shown on P&ID (if annotated) |
| Design Temperature | Design temperature shown on P&ID (if annotated) |
| Insulation Code | Insulation class shown on P&ID |
| Heat Tracing | Heat tracing requirement (Yes/No/Type) |
| Hazardous Area Class | Zone classification shown on P&ID |
| MEL Match Status | Match / Mismatch / Orphan (P&ID only) / Missing (MEL only) |
| Discrepancy Description | Description of any mismatch with master equipment list |

#### Sheet 3: Instrument Index
| Column | Description |
|--------|-------------|
| Instrument Tag | Full instrument tag as shown on P&ID |
| ISA First Letter | Measured variable (F=Flow, L=Level, P=Pressure, T=Temperature, etc.) |
| ISA Subsequent Letters | Function letters decoded (I=Indicating, C=Controlling, T=Transmitting, etc.) |
| Loop Number | Control loop number |
| Suffix | Tag suffix (A/B for redundancy, H/L for high/low) |
| Measured Variable | Full description of measured variable |
| Function | Full description of instrument function |
| Instrument Type | Transmitter, Switch, Gauge, Indicator, Controller, Valve, Analyzer, etc. |
| I/O Type | AI / AO / DI / DO / Field-mounted (no I/O) |
| Control System | DCS / PLC / SIS / ESD / Local |
| Associated Equipment | Equipment tag the instrument is associated with |
| P&ID Reference | Drawing number where instrument appears |
| Range/Setpoint | Operating range or setpoint if shown on P&ID |
| Service Description | Process service (e.g., "Process Water Flow to Reactor") |
| Calibration Required | Yes / No |

#### Sheet 4: Line List
| Column | Description |
|--------|-------------|
| Line Number | Full line designation per project convention |
| From Equipment | Upstream equipment tag |
| To Equipment | Downstream equipment tag |
| Nominal Diameter | Pipe size (inches or mm) |
| Piping Specification | Material class designation (e.g., A3S, B1H) |
| Insulation Code | Insulation type and thickness code |
| Heat Tracing Code | Tracing type (electric, steam, none) |
| Operating Pressure | Operating pressure (where shown) |
| Operating Temperature | Operating temperature (where shown) |
| Design Pressure | Design pressure (where shown) |
| Design Temperature | Design temperature (where shown) |
| Flow Rate | Process flow rate (where shown) |
| Fluid Service | Service description (e.g., Process Water, Steam, Instrument Air) |
| P&ID Reference | Drawing number where line appears |
| Spec Break | Yes/No -- whether a piping spec break exists on this line |
| Special Requirements | Jacketed, lined, sloped, heat traced, etc. |

#### Sheet 5: Control Valve Schedule
| Column | Description |
|--------|-------------|
| Valve Tag | Control valve tag number |
| Service Description | Process service description |
| Line Number | Associated piping line number |
| Body Size | Valve body size |
| Body Type | Globe, Ball, Butterfly, etc. |
| Action | Air-to-Open (ATO) / Air-to-Close (ATC) |
| Fail Position | Fail Open (FO) / Fail Closed (FC) / Fail Last (FL) |
| Controller Tag | Associated controller instrument tag |
| P&ID Reference | Drawing number |
| Bypass Arrangement | Yes/No, bypass valve size if present |
| Actuator Type | Pneumatic / Electric / Hydraulic |

#### Sheet 6: SIS Device Register
| Column | Description |
|--------|-------------|
| Device Tag | Safety device tag number |
| Device Type | Transmitter / Switch / Valve / Relay / Logic Solver |
| SIF Number | Safety Instrumented Function reference |
| SIL Rating | SIL 1 / SIL 2 / SIL 3 (if shown or from SIL assessment) |
| Function | Initiator / Logic Solver / Final Element |
| Trip Setpoint | Trip setpoint value (if shown on P&ID) |
| C&E Reference | Cause-and-Effect matrix reference |
| P&ID Reference | Drawing number |
| Associated Equipment | Equipment protected by this SIF |
| Voting Architecture | 1oo1, 1oo2, 2oo3 (if shown) |

#### Sheet 7: Discrepancy Register
| Column | Description |
|--------|-------------|
| Discrepancy ID | Unique identifier |
| Category | Missing Item / Tag Mismatch / Specification Conflict / Symbol Ambiguity |
| Severity | Critical / Major / Minor |
| P&ID Reference | Affected P&ID drawing |
| Item Reference | Equipment/instrument/line tag affected |
| Description | Detailed description of the discrepancy |
| Recommended Action | Suggested resolution |
| Responsible Discipline | Discipline that should resolve |
| RFI Number | RFI reference if issued |
| Status | Open / RFI Issued / Resolved |

#### Sheet 8: I/O Summary
| Column | Description |
|--------|-------------|
| Control System | DCS / PLC / SIS / ESD |
| I/O Type | AI / AO / DI / DO |
| Count | Number of I/O points |
| Spare Allowance | Recommended spare capacity (typically 15-20%) |
| Total with Spares | Count plus spare allowance |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Extraction Completeness | % of P&ID items captured in structured data | >= 99% for equipment, >= 98% for instruments |
| Cross-Reference Match Rate | % of extracted items matching master equipment list | >= 95% (remainder generates RFIs) |
| Tag Decoding Accuracy | % of instrument tags correctly decoded per ISA 5.1 | 100% |
| Discrepancy Detection Rate | Number of P&ID vs. equipment list mismatches identified | All identified and documented |
| SIS Coverage | % of safety devices captured in SIS register | 100% |

## Procedure

### Step 1: P&ID Inventory and Revision Verification
- Catalogue all P&ID drawings received, recording drawing number, revision, date, area/system covered, and originating discipline/contractor
- Verify that the P&ID set is complete for the scope area by cross-referencing against the project drawing register; flag any missing P&IDs as RFIs
- Confirm that all P&IDs are at the same or compatible revision level; identify any superseded revisions that should not be used for extraction
- Document the P&ID symbol legend and any project-specific deviations from ISA 5.1 standard symbology
- Record the tag numbering philosophy rules for equipment, instruments, lines, and valves to ensure consistent interpretation across all drawings
- Identify the extraction priority order: process P&IDs first, then utility P&IDs, then package unit P&IDs
- Create the extraction tracking log to monitor progress by drawing

### Step 2: Equipment Data Extraction
- Systematically scan each P&ID for all equipment items (vessels, tanks, columns, heat exchangers, pumps, compressors, fans, filters, reactors, conveyors, crushers, mills, etc.)
- For each equipment item, extract: tag number, description, equipment type, capacity/rating (where shown on P&ID), nozzle connections (size, rating, service), P&ID drawing number and revision
- Identify equipment that appears on multiple P&IDs (e.g., a vessel shown on both the process P&ID and the utility connections P&ID) and consolidate to a single entry with all P&ID cross-references
- Cross-reference every extracted equipment tag against the master equipment list; categorize matches, mismatches (tag exists but details differ), and orphans (on P&ID but not in equipment list, or vice versa)
- Generate the equipment discrepancy report listing all mismatches with recommended resolution action
- Capture special equipment attributes shown on P&IDs: material of construction callouts, design pressure/temperature, insulation class, heat tracing, and hazardous area classification

### Step 3: Instrument and Control System Data Extraction
- Extract all instrument tags from each P&ID, decoding per ISA 5.1: first letter (measured variable), subsequent letters (readout/output functions), loop number, and suffix
- Classify each instrument by I/O type: Analog Input (AI), Analog Output (AO), Digital Input (DI), Digital Output (DO), or field-mounted (no I/O)
- For control valves, extract: tag, body size, action (air-to-open/air-to-close), fail position (FO/FC/FL), associated controller tag, and bypass arrangement
- For safety instrumented devices, extract: tag, SIF number (if shown), function (initiator/logic solver/final element), trip setpoint (if shown), and cause-and-effect matrix reference
- Map instrument-to-equipment associations (e.g., LIT-2101 is mounted on tank T-2101) for maintenance planning purposes
- Compile I/O summary counts by type and by control system (DCS, PLC, SIS, ESD) for control system sizing verification
- Identify all field instruments requiring calibration data sheets (transmitters, gauges, switches, analyzers)

### Step 4: Line List and Piping Data Extraction
- Extract all process and utility lines from each P&ID with line number following the project convention (typically: size-service-area-sequence-spec, e.g., 6"-PW-21-001-A3S)
- For each line, capture: from-equipment, to-equipment, nominal diameter, piping specification (material class), insulation code, heat tracing code, test pressure (if shown), and operating conditions (pressure, temperature, flow)
- Identify piping specification breaks (where line spec changes due to material or rating change) and verify against the piping spec break table
- Flag lines with special requirements: jacketed lines, lined pipes, duplex/exotic materials, cryogenic service, high-pressure (>ANSI 600) ratings
- Cross-reference extracted lines against the existing line list to identify additions, deletions, and modifications between P&ID revisions
- Document all inline items: strainers, check valves, spectacle blinds, orifice plates, static mixers, flame arrestors, and expansion joints with their tag numbers and line associations
- Identify utility connection points (steam, cooling water, instrument air, nitrogen, plant air) and their tie-in locations

### Step 5: Validation, Discrepancy Resolution, and Reporting
- Execute comprehensive cross-reference validation: every equipment item in the instrument index must exist in the equipment register; every line endpoint must connect to a tagged equipment item; every control valve must have an associated controller
- Generate the master discrepancy list categorized by type (missing item, tag mismatch, specification conflict, symbol interpretation ambiguity) and severity (Critical: affects safety/procurement, Major: affects construction, Minor: documentation correction)
- Compile the extraction statistics dashboard: total items extracted by category, cross-reference match rates, discrepancy counts by severity, and SIS device summary
- Produce RFI packages for all Critical and Major discrepancies, formatted for submission to the responsible engineering discipline
- Generate the P&ID data extraction report summarizing scope, methodology, findings, and recommendations for the project engineering team

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Missed equipment items | Equipment shown in marginal areas of drawing or on continuation sheets not tracked | Systematic drawing scan protocol with continuation sheet tracking log |
| Incorrect ISA 5.1 tag decoding | Non-standard tag structures or project-specific deviations not documented | Obtain and verify tag numbering philosophy before extraction; clarify ambiguous tags via RFI |
| Duplicate entries across P&IDs | Same equipment/instrument shown on multiple drawings extracted as separate items | Implement tag-based deduplication with multi-P&ID cross-reference tracking |
| Superseded revision data | Extraction from outdated P&ID revision mixed with current revision | Strict revision verification at extraction start; watermark superseded drawings |
| Safety device misclassification | SIF devices not identified as safety-rated, treated as standard instruments | Separate SIS extraction pass with dedicated safety device checklist; cross-reference SIL assessment |
| Line specification errors | Piping spec breaks misidentified or spec assignments not matching process conditions | Cross-reference spec break table; verify material class against design pressure/temperature and corrosion data |
| Incomplete cross-referencing | Equipment list out of date relative to P&IDs, creating false discrepancies | Verify equipment list revision currency before cross-reference; document revision basis for each source |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Missing P&IDs for scope area | Within 1 day of discovery | Document Control -> Engineering Manager |
| P&ID revision conflict (mixed revisions in set) | Immediately | Engineering Manager -> Document Control Lead |
| Critical discrepancy: safety device missing from P&ID | Immediately | Process Engineering Lead -> HSE Agent -> Engineering Manager |
| >5% equipment tag mismatch rate against master list | Within 2 days of extraction completion | Engineering Manager -> Project Controls |
| Tag numbering philosophy document unavailable | At extraction start | Engineering Manager -> Project Manager |
| Unresolvable symbol interpretation ambiguity | Within 1 day per instance | Discipline Lead -> Engineering Manager (formal RFI) |
| SIF device without SIL classification | Within 1 day of identification | HSE Agent -> Safety Engineering Lead |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >99% | Equipment tags, instrument decoding, line data verified against source P&IDs |
| Completeness | 25% | >98% | All items on all P&IDs captured; no omissions in any extraction category |
| Consistency | 15% | 100% | Tag formats, naming conventions, and classification codes uniform across all drawings |
| Format | 10% | 100% | Standard VSC extraction workbook format; sortable/filterable columns; no merged cells |
| Actionability | 10% | >95% | Each discrepancy has a clear description, recommended action, and responsible party |
| Traceability | 10% | 100% | Every extracted item linked to source P&ID drawing number and revision |

## Inter-Agent Dependencies

### Inputs From
| Agent | Input Provided | Criticality |
|-------|---------------|-------------|
| Execution | Document register with P&ID list and current revisions | Critical |
| Operations | Process descriptions, operating context, functional requirements | Critical |
| Asset Management | Master equipment list for cross-reference validation | High |
| HSE | SIL assessment report, HAZOP action register with P&ID references | High |
| Contracts & Compliance | Vendor P&IDs for package units (compressor packages, skids, etc.) | Medium |

### Outputs Consumed By
| Agent | Output Provided | Trigger |
|-------|----------------|---------|
| Asset Management | Validated equipment register, instrument-equipment associations | Automatic |
| Contracts & Compliance | Instrument index and control valve schedule for procurement packages | Automatic |
| Execution | Line list for construction work packages, I/O counts for control system procurement | Automatic |
| Operations | Control narrative summaries, instrument setpoint register for operator training | On request |
| HSE | SIS device register with SIF references for safety system verification | Automatic |

## References

### Methodology References
- `methodology/or-playbook-and-procedures/` -- VSC OR Playbook for engineering data management procedures
- `methodology/capital-projects/` -- Capital project engineering deliverable definitions and data extraction standards
- `methodology/references-md/` -- Technical reference material for P&ID symbology and ISA standards
- `docs/architecture/_legacy/multi-agent-architecture.md` -- Multi-agent architecture defining data flow between Engineering Design and other agents

### Industry Standards
- **ISA 5.1** -- Instrumentation Symbols and Identification (primary P&ID symbology standard)
- **ISA 5.4** -- Instrument Loop Diagrams
- **IEC 62424** -- Representation of process control engineering - Requests in P&I diagrams and data exchange
- **ISO 14617** -- Graphical symbols for diagrams (supplementary symbology reference)
- **API 14C** -- Recommended Practice for Analysis, Design, Installation, and Testing of Safety Systems for Offshore Production Facilities (safety device P&ID representation)

## Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC Engineering | Initial creation -- Wave 3 |
