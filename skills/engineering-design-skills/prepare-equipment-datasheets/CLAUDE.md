---
name: prepare-equipment-datasheets
description: "Prepare comprehensive equipment data sheets capturing process, mechanical, material, and instrumentation data for procurement, manufacturing, and installation. Triggers: 'equipment datasheet', 'process datasheet', 'mechanical datasheet', 'hoja de datos de equipo', 'datasheet de equipo', 'ficha tecnica de equipos'."
---

# Prepare Equipment Datasheets
## Skill ID: prepare-equipment-datasheets
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Critical

## Purpose

Equipment data sheets are the primary technical communication documents between engineering and equipment vendors. They translate the process requirements defined in the heat and material balance, P&IDs, and process simulations into the specific mechanical, electrical, instrumentation, and material parameters that vendors need to quote, design, manufacture, test, and deliver equipment. Every major piece of equipment in an industrial facility -- pumps, compressors, heat exchangers, pressure vessels, tanks, columns, filters, conveyors, crushers, screens, and their associated drivers -- requires a data sheet that captures the full operating envelope: normal operation, design conditions, upset conditions, turndown conditions, and startup/shutdown transients.

The quality and completeness of equipment data sheets directly determines the quality of vendor proposals, the accuracy of procurement costs, and ultimately whether the delivered equipment will actually perform as required in the operating plant. Incomplete or inaccurate data sheets cause a cascade of problems: vendors quote equipment that does not meet the actual operating conditions, procurement packages require multiple rounds of clarification extending the procurement cycle by 4-8 weeks, manufactured equipment arrives on site only to discover it does not fit the process requirements, and operations inherits equipment with inadequate margins or missing features that compromise plant performance for decades.

In Operational Readiness projects, data sheets serve a dual purpose: they are the basis for equipment procurement, and they become the foundational technical records for the asset management system. The data sheet, supplemented by vendor-confirmed data and as-built information, populates the equipment master data in SAP PM/MM or equivalent CMMS, defining the technical parameters against which maintenance strategies, spare parts inventories, and condition monitoring programs are developed. Getting the data sheet right at the engineering stage therefore has compounding benefits through the entire asset lifecycle.

This skill covers all standard equipment types found in mining, oil and gas, chemical, and power generation facilities. It applies the correct industry standard format for each equipment category (API for rotating equipment, TEMA/API for heat exchangers, ASME for pressure vessels, ISA for instruments, IEC for electrical equipment) and ensures that data sheets evolve correctly through the project lifecycle from preliminary through requisition, purchase, and as-built revisions.

## Intent & Specification
The AI agent MUST understand that:

1. **Equipment data sheets must capture all operating cases**, not just the normal design point. Process equipment operates across a range of conditions:
   - Normal steady-state operation
   - Maximum throughput (rated capacity)
   - Minimum turndown
   - Startup (cold start and warm restart)
   - Shutdown (normal and emergency)
   - Cleaning and maintenance conditions
   - Upset scenarios (blocked outlet, loss of cooling, power failure)
   - The data sheet must present process duty data for all cases that affect equipment sizing and selection, because vendors must design for the controlling case -- which is often not the normal operating point.

2. **Different equipment types require different standard formats and design codes**:
   - Centrifugal pumps: API 610 (including Annex H data sheet format)
   - Reciprocating pumps: API 674
   - Rotary pumps: API 676
   - Centrifugal compressors: API 617
   - Reciprocating compressors: API 618
   - Screw compressors: API 619
   - Shell-and-tube heat exchangers: TEMA R/C/B + API 660
   - Plate heat exchangers: vendor standard format
   - Pressure vessels: ASME VIII Div. 1/2 + project vessel data sheet
   - Storage tanks: API 650 (atmospheric) / API 620 (low pressure)
   - Columns and towers: ASME VIII + internals vendor data sheet
   - Instruments: ISA standards per instrument type
   - Electrical equipment: IEC/IEEE per equipment type
   - Using the wrong standard or format for an equipment type invalidates the vendor quotation.

3. **Data sheets evolve through defined project phases**:
   - Preliminary: for budget estimation (+/- 30% accuracy), process duty data only
   - Requisition: for vendor bidding, complete process and mechanical requirements, material selection, applicable standards
   - Purchase: incorporating vendor-confirmed data, agreed exceptions, and final commercial terms
   - As-Built: incorporating actual manufactured data, test results, and any field modifications
   - Each revision must be clearly identified and the current project phase stated.

4. **Material selection must be validated against the corrosion and materials selection study** (or corporate material selection guide). Material specifications on data sheets (wetted parts, non-wetted parts, gaskets, seals, bolting) must be traceable to the corrosion study recommendations, not assumed from similar projects.

5. **Standardization and interchangeability with the existing asset fleet** must be considered for brownfield projects and expansions. The Asset Management agent provides guidance on preferred manufacturers, standard sizes, interchangeable parts, and established maintenance-friendly configurations that should be reflected in the data sheet where technically feasible.

## Trigger / Invocation
```
/prepare-equipment-datasheets
```

### Natural Language Triggers
- "Prepare the pump datasheets for Area 200 centrifugal pumps"
- "Create the heat exchanger datasheet for E-2001 shell-and-tube exchanger"
- "Generate instrument datasheets for the flow meters in Unit 300"
- "Preparar las hojas de datos de las bombas centrifugas del Area 200"
- "Crear la hoja de datos del intercambiador de calor E-2001"
- "Actualizar el datasheet del recipiente con los datos confirmados del vendor"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `equipment_tag` | Equipment tag number(s) following the project tagging convention | String / List | Equipment list / P&IDs |
| `equipment_type` | Equipment category (pump, compressor, vessel, exchanger, tank, instrument, motor, etc.) | Enum | Equipment list |
| `process_conditions` | Operating and design conditions for all relevant cases (normal, design, upset, turndown, startup) including flows, pressures, temperatures, and fluid compositions | .xlsx / Table | Process simulation / Heat and Material Balance |
| `project_code` | Unique project identifier | String | Project context |
| `applicable_codes_standards` | Project design code and standard specifications per equipment type | .docx / Text | Project engineering standards |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `material_selection_report` | Corrosion study or material selection guide specifying materials of construction for wetted and non-wetted parts | Apply project default materials per service classification |
| `site_conditions` | Ambient temperature range, altitude, seismic zone classification, humidity, dust/sand conditions | From project Design Basis Document |
| `standardization_requirements` | Preferred manufacturers, standard sizes, interchangeable components from the existing plant asset register | No standardization constraints (greenfield assumed) |
| `datasheet_phase` | Current project phase determining the data sheet revision level (Preliminary/Requisition/Purchase/As-Built) | Requisition (default for most engineering work) |

### Context Enrichment
The agent should automatically:
- Retrieve the latest heat and material balance from the Operations/Process agent to ensure process duty data is current and consistent with the most recent process simulation
- Pull P&ID references from the engineering document control system to include the correct P&ID drawing numbers and revision on each data sheet
- Cross-reference with the hazardous area classification from the HSE agent to determine the electrical area classification (Zone 0/1/2 or Div 1/2) and temperature class for motors and instruments
- Check the Asset Management agent for standardization preferences, maintenance-friendly features, and spare parts interchangeability requirements from the existing plant fleet
- Retrieve the SIL (Safety Integrity Level) requirements from the HSE agent for safety-instrumented functions that affect instrument data sheet specifications

## Output Specification

### Document: Equipment Data Sheet (.xlsx)
**Filename**: `VSC_Datasheet_{EquipmentTag}_{ProjectCode}_v{Version}_{Date}.xlsx`

**Structure**:

1. **Equipment Identification**
   - Equipment tag number
   - Service description (process function)
   - P&ID reference (drawing number and revision)
   - Location: area, unit, elevation
   - Equipment type and sub-type
   - Applicable design codes and standards
   - Project phase: Preliminary / Requisition / Purchase / As-Built
   - Data sheet revision number and date

2. **Process Duty Data**
   - Table with all operating cases as columns: Normal, Design, Maximum, Minimum/Turndown, Startup, Upset
   - Process parameters as rows:
     - Flow rate (mass and volumetric)
     - Inlet pressure and outlet pressure
     - Inlet temperature and outlet temperature
     - Fluid composition (including trace components)
     - Density at operating conditions
     - Viscosity at operating conditions
     - Vapor pressure at operating temperature
     - Specific heat capacity
     - Molecular weight (for gas/vapor service)
     - Fouling factors (for heat exchangers)
     - NPSH available (for pumps)

3. **Mechanical Design Data**
   - Design pressure (with calculation basis reference)
   - Design temperature (with calculation basis reference)
   - Minimum design metal temperature (MDMT)
   - Corrosion/erosion allowance (with corrosion study reference)
   - Test pressure (hydrostatic or pneumatic, with test medium)
   - Design code: ASME VIII, API 610, TEMA, etc.
   - Seismic design criteria (zone, acceleration, importance factor)
   - Wind load criteria
   - Nozzle loads (if applicable, per API 650 Annex E or vendor requirements)

4. **Materials of Construction**
   - Pressure-containing parts: shell, heads, tubes, tube sheet, internals
   - Non-pressure parts: supports, lifting lugs, name plate
   - Gaskets and seals: type, material, rating
   - Bolting: material grade, size range
   - Paint/coating system: internal and external
   - Insulation type and thickness (if specified at data sheet stage)

5. **Driver and Utility Requirements**
   - Motor data: rated power, absorbed power, service factor
   - Electrical: voltage, frequency, number of phases
   - Motor speed (synchronous and full-load)
   - Enclosure type: TEFC, explosion-proof, weather-protected
   - Hazardous area classification: Zone/Division, gas group, temperature class
   - Starting method: DOL, VFD, soft starter, star-delta
   - Steam data (if steam-driven): pressure, temperature, flow
   - Cooling water requirements: flow, pressure, temperature limits
   - Instrument air supply pressure

6. **Instrumentation and Control**
   - Process connections for instruments: size, rating, type, location
   - Control valve requirements: Cv, rangeability, fail position
   - Safety instrumented functions: SIF reference, SIL rating
   - Local gauges: pressure gauges, temperature indicators, level glasses
   - Transmitters: type, range, output signal, process connection
   - Switches: type, setpoint, action on activation

7. **Nozzle Schedule** (for vessels, exchangers, tanks)
   - Nozzle mark: N1, N2, N3, etc.
   - Service description for each nozzle
   - Nominal size (NPS)
   - Pressure rating (Class 150, 300, 600, etc.)
   - Facing type: RF, RTJ, FF
   - Orientation: elevation above tangent line and clock position (azimuth)
   - Projection from vessel wall

8. **Notes and Special Requirements**
   - Preservation requirements during storage and construction
   - Spare parts recommendations (commissioning spares, capital spares, operating spares)
   - Vendor data requirements: test certificates, material certificates, performance curves
   - Project-specific requirements: noise limits, vibration limits, efficiency guarantees

### Equipment Type to Design Code Mapping
| Equipment Type | Primary Design Code | Data Sheet Standard | Key Annexes/Tables |
|---------------|--------------------|--------------------|-------------------|
| Centrifugal Pump | API 610 | API 610 Annex H | H.1 (process), H.2 (mechanical) |
| Reciprocating Pump | API 674 | API 674 Data Sheet | Appendix A |
| Rotary Pump | API 676 | API 676 Data Sheet | Appendix A |
| Centrifugal Compressor | API 617 | API 617 Data Sheet | Appendix A |
| Reciprocating Compressor | API 618 | API 618 Data Sheet | Appendix A |
| Shell-and-Tube Exchanger | TEMA + API 660 | TEMA Data Sheet | TEMA-N-2 |
| Pressure Vessel | ASME VIII Div. 1 | Project Standard | Per project vessel data sheet template |
| Atmospheric Tank | API 650 | API 650 Data Sheet | Annex E (seismic), Annex V (overfill) |
| Low-Pressure Tank | API 620 | API 620 Data Sheet | Per project standard |
| Fired Heater | API 560 | API 560 Data Sheet | Per project standard |
| Electric Motor | IEC 60034 / IEEE 841 | Project Standard | Per project electrical data sheet |
| Flow Instrument | ISA / IEC 61511 | Project Standard | Per instrument type |

### Data Sheet Lifecycle Status Definitions
| Phase | Status Code | Content Requirement | Accuracy Level |
|-------|------------|--------------------|----|
| Preliminary | PRELIM | Process duty data only; mechanical data estimated | +/- 30% budget |
| Requisition | REQ | Complete process, mechanical, material, utility data | Bid-quality |
| Purchase | PO | Vendor-confirmed data, agreed exceptions, serial numbers | Contract-quality |
| As-Built | AB | Actual manufactured data, FAT results, field modifications | As-installed record |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Data Sheet Completeness | Mandatory fields completed / total mandatory fields per applicable standard | 100% for Requisition phase; 100% for Purchase phase |
| Process Data Traceability | Data sheet process values traceable to H&MB case number and simulation revision | 100% traceability |
| Material Selection Compliance | Materials on data sheet match corrosion study recommendations | 100% compliance |
| Standard Compliance | Data sheet format and content per applicable API/ASME/TEMA/ISA standard | 100% compliance with project design standards |
| Cycle Time | Time from process data availability to issued data sheet | < 5 working days per data sheet (Requisition phase) |

## Procedure

### Step 1: Gather Input Data and Select Applicable Standard
- Identify the equipment type and select the applicable design code and data sheet format using the Equipment Type to Design Code Mapping table
- Retrieve the latest heat and material balance and identify all operating cases relevant to equipment sizing:
  - Normal steady-state
  - Design/rated capacity
  - Maximum throughput
  - Minimum turndown
  - Startup (cold and hot)
  - Shutdown (normal and emergency)
  - Cleaning
  - Upset or emergency conditions
- Extract the process duty data for each operating case:
  - Mass and volumetric flow rates
  - Inlet and outlet pressures
  - Inlet and outlet temperatures
  - Fluid composition (including trace components affecting corrosion or phase behavior)
  - Fluid physical properties: density, viscosity, specific heat, vapor pressure, molecular weight
- Confirm the controlling operating case:
  - The case that defines the maximum equipment size and pressure rating
  - Ensure appropriate design margins are applied per project standards
- Retrieve the material selection from the corrosion study:
  - Wetted materials for pressure-containing parts
  - Non-wetted materials for structural components
  - Gasket specifications for the specific process service
  - Seal materials compatible with the process fluid
- Confirm site-specific conditions:
  - Ambient temperature extremes (for MDMT and motor derating)
  - Altitude (for derating of air-cooled equipment and electrical motors)
  - Seismic zone classification and design acceleration
  - Hazardous area classification from the HSE agent

### Step 2: Populate Process and Mechanical Design Data
- Complete the process duty table for all operating cases:
  - Ensure units are consistent (SI or project-standard units)
  - Include both mass and volumetric flow rates
  - Calculate physical properties at the correct temperature and pressure conditions
- Calculate design pressure per project standards:
  - Design pressure = greater of (highest operating pressure + 10%) or (highest operating pressure + 2 bar)
  - Never less than the relief device set pressure
  - For vacuum service: full vacuum (0 bar abs) unless specifically justified
- Calculate design temperature per project standards:
  - Design temperature = maximum operating temperature + 25C margin, or maximum upset temperature, whichever is higher
  - For low-temperature service: MDMT = minimum operating temperature minus appropriate margin
- Define the corrosion/erosion allowance:
  - 1.5mm typical for carbon steel in non-corrosive service
  - Up to 6mm for erosive slurry service
  - Confirm specific value with the materials engineer and corrosion study
- For pumps specifically:
  - Calculate differential head from process conditions
  - Calculate NPSH available from suction vessel conditions
  - Specify hydraulic requirements and duty point
  - Determine driver power with service factor (typically 1.15 for motors up to 75kW, 1.10 above)
  - Specify seal type and API Plan number
- For heat exchangers specifically:
  - Specify both shell-side and tube-side process data
  - Define fouling factors per TEMA or project standard
  - Select TEMA class: R (refinery), C (chemical), B (general)
  - Define exchanger configuration: number of shell and tube passes
  - Document thermal design basis and heat duty
- For vessels specifically:
  - Specify all nozzle loads if available from piping stress analysis
  - Define agitator requirements if applicable
  - Specify internals: trays, packings, demisters, distributors
  - Define access requirements: manholes, inspection openings, davits

### Step 3: Specify Materials, Utilities, and Instrumentation
- Complete the materials of construction table with corrosion study traceability:
  - Shell and heads: material grade and specification (e.g., SA-516 Gr. 70, SA-240 Tp. 316L)
  - Tubes: material specification (e.g., SA-213 TP 316L)
  - Bolting: specification (e.g., SA-193 B7 studs + SA-194 2H nuts)
  - Gaskets: type and specification (e.g., spiral wound SS316/graphite per ASME B16.20)
  - Record the corrosion study recommendation reference for each material selection
- Specify driver requirements:
  - Motor power: rated and absorbed (kW)
  - Voltage and frequency per project electrical standard
  - Motor speed: synchronous and full-load RPM
  - Enclosure type: TEFC, Ex d, Ex e, Ex n per area classification
  - Starting method: DOL, VFD, soft starter
  - Hazardous area certification requirements
- Specify utility requirements:
  - Cooling water: flow rate, supply/return pressure, temperature limits
  - Instrument air: supply pressure
  - Steam (if applicable): pressure, temperature, flow for steam-driven equipment or tracing
  - Electrical supply for local instruments and controls
- Specify instrumentation requirements:
  - Process connections: size, rating, type for pressure, temperature, level, and flow measurement
  - Control valve sizing data: Cv calculation basis, required rangeability
  - Safety instrumented function SIL ratings per the SIF register
  - Alarm and trip setpoints with engineering units
- For vessels and exchangers, complete the nozzle schedule:
  - Nozzle mark (N1, N2, N3...)
  - Service description for each nozzle
  - Nominal size and pressure rating
  - Facing type (RF, RTJ, FF)
  - Orientation: clock position and elevation above tangent line
  - Projection from vessel wall

### Step 4: Apply Quality Checks and Validate Consistency
- Verify design conditions envelope all operating cases:
  - Design pressure >= highest operating pressure + margin for all cases
  - Design temperature >= highest operating temperature + margin for all cases
  - Check each operating case individually, including upset and startup transients
- Verify NPSH adequacy for pumps:
  - NPSH available (from process) exceeds NPSH required (from pump curve or vendor)
  - Project margin applied: typically 1.0m or 10%, whichever is greater
  - Check at all relevant operating cases, not just the normal duty point
- Verify material selection consistency:
  - Materials of construction match the corrosion study for this specific service
  - Flag any deviations for materials engineer review and documented acceptance
  - Check compatibility between wetted materials and process fluid at all operating temperatures
- Cross-reference instrument tags:
  - All instrument tags on the data sheet match the P&IDs
  - Tag numbers are correct and consistent across data sheet and P&ID
- Verify electrical data consistency:
  - Motor voltage and frequency match project electrical design basis
  - Hazardous area classification matches the area classification drawings
  - Motor enclosure type is suitable for the classified zone
- Confirm unit consistency and completeness:
  - No mixing of SI and Imperial without clear labeling
  - All mandatory fields per the applicable standard are populated
  - No placeholder text (TBD, XXX, TBC) remains in the Requisition-phase data sheet
  - Any intentionally blank fields are marked "N/A" with justification

### Step 5: Issue, Track Revisions, and Manage Vendor Data Integration
- Issue the data sheet with proper document control:
  - Document number per project convention
  - Revision number and status: Preliminary / IFR / IFA / IFC
  - Preparation date, prepared by, checked by, approved by
  - Record in the EDDR via manage-engineering-deliverables
- Transmit to the procurement team via the Contracts & Compliance agent:
  - Include the data sheet as part of the requisition package
  - Attach the inquiry technical evaluation criteria
  - Define which data sheet fields are mandatory vendor compliance items
- When vendor quotations are received:
  - Review vendor-proposed exceptions to the data sheet
  - Classify each exception: acceptable, conditionally acceptable, or requires compliance
  - Document the technical assessment of each exception
- Update the data sheet to "Purchase" revision incorporating:
  - Vendor-confirmed performance data (actual pump curves, thermal performance)
  - Agreed exceptions with documented technical justification
  - Final materials as confirmed by the vendor
  - Vendor-assigned model and serial numbers
- After factory acceptance testing (FAT):
  - Update to "As-Built" revision with actual test data
  - Incorporate material test certificates
  - Record dimensional verification results
  - Document any field modifications made during installation and commissioning
- Transmit the final As-Built data sheet to the Asset Management agent:
  - For population of equipment master data in SAP PM/MM or equivalent CMMS
  - For maintenance strategy development based on actual equipment parameters
  - For spare parts identification based on vendor-confirmed components

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Process data from outdated H&MB revision | Data sheet prepared using an old simulation run while process design continued to evolve | Mandatory H&MB revision number recorded on data sheet; check current revision before each data sheet issue |
| Design conditions do not envelope upset or transient cases | Only normal operation used for design; startup or upset cases not considered | Require process engineer sign-off that all operating cases affecting equipment sizing have been included |
| Material selection not validated against corrosion study | Materials assumed from similar projects or previous experience without checking the project-specific corrosion study | Materials of construction section must reference the corrosion study recommendation number; materials engineer sign-off required |
| Wrong design code applied | API 610 format used for a positive displacement pump, or TEMA format used for a plate exchanger | Equipment type to design code mapping table maintained as a project standard; engineering checker verifies code applicability |
| Nozzle orientation not coordinated with piping/structural design | Nozzle schedule prepared in isolation without considering pipe routing and support steel arrangement | Nozzle orientation review with piping and structural disciplines before data sheet goes to IFA |
| Instrument data sheet disconnected from the main equipment data sheet | Instrument process conditions not matching the equipment process data | Cross-reference check between equipment data sheet process conditions and instrument data sheet process conditions; single source of truth from the H&MB |
| Vendor data not integrated into Purchase revision | Data sheet remains at Requisition revision after PO is placed; vendor-confirmed data not captured | Mandatory data sheet update milestone within 4 weeks of vendor data receipt; tracked in EDDR |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| H&MB revision change after data sheets issued for requisition | At detection | Process Lead and Engineering Manager notified; impact assessment on all affected data sheets within 5 working days |
| Material selection conflict between corrosion study and project cost targets | At data sheet preparation | Materials Engineer and Engineering Manager resolution; no material downgrade without documented risk acceptance |
| Vendor exception to mandatory data sheet requirement | During vendor bid evaluation | Engineering Manager assessment; no acceptance without documented technical justification and risk review |
| Data sheet not issued within 5 working days of process data availability | At detection | Discipline Lead notification; resource reallocation or priority adjustment |
| Critical equipment data sheet missing NPSH verification or design pressure validation | During quality check | Immediate hold on data sheet issue; process engineer calculation verification required |
| As-Built data sheet not completed within 8 weeks of equipment commissioning | At detection | Engineering Manager and Asset Management agent escalation; data sheet completion prioritized for CMMS population |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | 100% compliance | Process data matches H&MB; design conditions correctly calculated; materials match corrosion study |
| Completeness | 25% | 100% mandatory fields | All required fields per applicable standard populated; no TBD or placeholder text in Requisition phase |
| Consistency | 15% | Zero conflicts | Units consistent; tag numbers match P&IDs; electrical data matches area classification; instrument data matches process conditions |
| Format | 10% | Professional | Correct standard format per equipment type; VSC header and revision control; clear and legible |
| Actionability | 10% | Immediately usable | Vendor can prepare a quotation from the data sheet without requesting additional information |
| Traceability | 10% | Full audit trail | H&MB revision referenced; corrosion study referenced; design code referenced; revision history maintained |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Operations | Process simulation data, heat and material balance, and utility requirements | Process duty data for all operating cases |
| HSE | Hazardous area classification, SIL requirements, relief device sizing basis | Electrical classification, safety instrument specifications, design pressure basis |
| Asset Management | Standardization requirements, preferred manufacturers, interchangeable components | Equipment selection alignment with existing plant fleet |
| Execution | Project design basis (site conditions, seismic zone, ambient temperature) | Site-specific design parameters for all equipment data sheets |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Contracts & Compliance | Data sheets as part of procurement requisition packages | Vendor bid solicitation and technical evaluation |
| Asset Management | As-Built data sheets for CMMS master data population | Equipment register, maintenance strategy, and spare parts definition |
| Execution | Equipment data (weights, dimensions, nozzle connections) for construction planning | Lifting plans, foundation design verification, and installation sequence planning |
| Operations | Confirmed equipment operating parameters for operations manual development | Operating procedure parameters, alarm setpoints, and operating limits |
| All Engineering Disciplines | Equipment mechanical data for interconnecting design (piping, structural, electrical) | Pipe stress analysis (nozzle loads), foundation design (equipment loads), cable sizing (motor data) |

## References
- `methodology/or-playbook-and-procedures/` -- OR procedures including equipment data management
- `methodology/capital-projects/` -- Capital project engineering procurement frameworks
- API 610 -- Centrifugal Pumps for Petroleum, Petrochemical and Natural Gas Industries (including Annex H data sheets)
- API 660 -- Shell-and-Tube Heat Exchangers
- ASME BPVC Section VIII -- Pressure Vessels
- TEMA Standards of the Tubular Exchanger Manufacturers Association
- API 650 -- Welded Tanks for Oil Storage

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
