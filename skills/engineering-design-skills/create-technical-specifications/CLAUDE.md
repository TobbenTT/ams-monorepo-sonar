---
name: create-technical-specifications
description: "Generate comprehensive technical specifications for equipment and material procurement combining process requirements, mechanical design criteria, materials of construction, instrumentation needs, and applicable codes/standards. Triggers: 'technical specification', 'equipment spec', 'procurement spec', 'especificacion tecnica', 'spec de equipo', 'especificacion de compra'."
---

# Create Technical Specifications
## Skill ID: create-technical-specifications
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Critical

## Purpose
Generates comprehensive technical specifications for equipment and material procurement that serve as the contractual technical basis for vendor quotations, purchase orders, and fabrication. A technical specification transforms the engineering design intent into a structured document that defines what the equipment must do (process/performance requirements), how it must be built (mechanical design, materials, fabrication standards), how it must be controlled (instrumentation and electrical requirements), how it must be tested (factory and site acceptance testing), and what documentation the vendor must provide.

In mining, oil & gas, chemicals, and energy capital projects across Latin America, the technical specification is the single most important procurement document. A well-written specification produces competitive, comparable vendor quotations, reduces resubmission cycles during vendor document review, and ensures that delivered equipment meets the operational requirements from day one. A poorly written specification results in vendor disputes, change orders, equipment that does not fit the layout, materials that corrode in service, and instruments that cannot integrate with the control system -- all of which surface as commissioning defects or early-life failures.

This skill produces equipment-type-specific technical specifications following a standardized structure (General Requirements / Process Data / Mechanical Design / Materials of Construction / Instrumentation & Control / Electrical / Testing & Inspection / Documentation / Spare Parts) while incorporating the applicable design codes and standards (API, ASME, IEC, ISO, NCh) appropriate to the equipment type and the project jurisdiction.

For Chilean projects, the specifications must reference applicable NCh standards adopted from international standards, SEC requirements for electrical equipment, SERNAGEOMIN requirements for mining-specific equipment, and seismic design requirements per NCh 2369 (industrial structures) or NCh 433 as applicable. Material selections must account for the specific process environments encountered in Chilean industry (high-altitude desert conditions for mining, coastal corrosion for desalination/ports, seismic resilience across all sectors).

Industry data indicates that 60-70% of vendor document resubmission cycles originate from specification ambiguities or omissions, not from vendor deficiencies. A specification that takes an additional 20-40 hours of engineering effort to write properly typically saves 100-200 hours of downstream vendor management, procurement resolution, and commissioning troubleshooting. The specification is the most leveraged engineering deliverable on any equipment procurement.

## Intent & Specification
The AI agent MUST understand that:

1. **Specifications Define Contractual Requirements**: Every "shall" statement in a technical specification becomes a contractual obligation for the vendor. The agent must use precise requirement language: "shall" for mandatory requirements, "should" for recommended practices, "may" for optional features, and "will" for statements of fact about the project conditions. Vague requirements like "suitable for the service" are unacceptable; every requirement must be specific and verifiable.
2. **Equipment Type Determines Specification Structure**: Different equipment types require different specification sections and design code references. A centrifugal pump specification references API 610; a pressure vessel references ASME Section VIII Division 1; a motor references IEC 60034; a control valve references IEC 60534 and ISA 75. The agent must select the correct code framework for each equipment type.
3. **Material Selection is Process-Environment Dependent**: Materials of construction must be specified based on the process fluid, temperature, pressure, and corrosive/erosive conditions, not merely by generic material grade. The agent must consider chloride stress corrosion cracking (common in Chilean desalination and copper processing), sulfide stress cracking (oil & gas sour service), high-temperature hydrogen attack, erosion in slurry service (mining), and atmospheric corrosion in coastal or desert environments.
4. **Specifications Must Be Procurement-Ready**: The output must be in a format that can be directly attached to a Request for Quotation (RFQ) or Purchase Order. It must include all information a vendor needs to provide a compliant quotation without additional technical clarification, including process data sheets, nozzle schedules, utility requirements, and documentation requirements (VDRL).
5. **Testing and Inspection Requirements Must Be Explicit**: Factory Acceptance Testing (FAT), material certification requirements, Non-Destructive Examination (NDE) extent, hydrostatic/pneumatic test pressures, and performance test criteria must be clearly defined. Ambiguity in testing requirements is the most common source of vendor disputes and cost overruns on equipment procurement.

## Trigger / Invocation
```
/create-technical-specifications
```

### Natural Language Triggers
- "Create technical specification for the process water pump package"
- "Generate equipment spec for the pressure vessel V-2101"
- "Write procurement specification for the conveyor drive system"
- "Crear especificacion tecnica para el paquete de bombas de agua de proceso"
- "Generar especificacion de equipo para el estanque a presion V-2101"
- "Escribir especificacion de compra para el sistema de accionamiento de transportador"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `equipment_datasheet` | Process/mechanical data sheet with operating and design conditions | .xlsx / .pdf | Process Engineering / Mechanical Engineering |
| `process_description` | Process flow description and operating philosophy for the equipment | .pdf / .docx | Operations / Process Engineering |
| `design_basis` | Project design basis memorandum with general design criteria, site conditions, and applicable standards | .pdf / .docx | Engineering Lead |
| `equipment_type` | Equipment type classification (pump, vessel, heat exchanger, motor, valve, conveyor, crusher, etc.) | Text | User |
| `project_location` | Site location and environmental conditions (altitude, seismic zone, ambient temperature range, atmospheric corrosion category) | Text / .docx | Project Engineering |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `corrosion_study` | Materials/corrosion engineering study for the process environment | Apply standard materials per industry practice for the specified service |
| `p_and_ids` | P&IDs showing the equipment and associated instrumentation | Extract instrument requirements from data sheet |
| `layout_drawings` | Plot plan or equipment arrangement drawings for dimensional constraints | No dimensional constraints applied (vendor proposes) |
| `existing_specification` | Reference specification from similar project or client standard | VSC standard specification template for equipment type |

### Context Enrichment
The agent should automatically:
- Select the correct primary design code based on equipment type (API 610 for centrifugal pumps, ASME VIII for pressure vessels, API 660 for shell & tube heat exchangers, IEC 60034 for motors, etc.)
- Determine the applicable seismic design requirements based on project location (NCh 2369 for Chilean industrial facilities, UBC/IBC for international projects)
- Identify the hazardous area classification from the project HAZOP/area classification study to specify appropriate equipment Ex protection
- Retrieve ambient conditions (temperature range, altitude, humidity, atmospheric corrosion category) from the project design basis
- Check whether the equipment is within a SIL-rated Safety Instrumented Function, which would impose additional specification requirements per IEC 61511

## Output Specification

### Document: Technical Specification
**Filename**: `VSC_TechSpec_{ProjectCode}_{EquipType}_{TagOrService}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page and Document Control** -- VSC branding, project identification, equipment tag/service, revision history, approval matrix
2. **General Requirements** -- Scope, applicable codes and standards, design life, site conditions (altitude, ambient temperature, seismic zone, atmospheric conditions), hazardous area classification, quality assurance requirements
3. **Process Data / Performance Requirements** -- Operating and design conditions (pressure, temperature, flow, composition), performance guarantee points, turndown requirements, operating modes (continuous/batch/standby), process data sheet
4. **Mechanical Design Requirements** -- Design code compliance, pressure/temperature ratings, nozzle schedule with sizes/ratings/orientations, allowable vibration limits, noise limits, piping loads, seismic loads, wind loads
5. **Materials of Construction** -- Material specifications for all major components (ASTM/EN designation), corrosion allowance, prohibited materials, special requirements (impact testing, hardness limits, PWHT), material certification requirements (MTR 3.1/3.2)
6. **Instrumentation and Control** -- Local instruments (gauges, indicators), transmitters and switches with I/O requirements, control system interface (DCS/PLC/SIS), signal types, junction box requirements, cable entry requirements, instrument data sheets
7. **Electrical Requirements** -- Motor specifications (voltage, power, starting method, enclosure, insulation class, service factor), hazardous area classification and Ex protection type, cable entry, earthing, space heater, and VFD requirements where applicable
8. **Testing and Inspection** -- Factory Acceptance Test (FAT) requirements, NDE extent, hydrostatic/pneumatic test, performance test criteria, material verification (PMI), witness points, Site Acceptance Test (SAT) criteria
9. **Documentation Requirements (VDRL)** -- Complete list of vendor documents required with submission milestones, number of copies, and format
10. **Spare Parts** -- Commissioning spares (2-year operation), capital spares (major overhaul components), recommended spare parts with quantities and estimated pricing
11. **Packaging, Preservation, and Shipping** -- Packaging standard, preservation requirements (nitrogen blanketing, VCI, desiccant), shipping marks, storage requirements at site
12. **Appendices** -- Process data sheet, nozzle schedule, applicable specification cross-references, project-specific standard drawings

### Appendix: Nozzle Schedule Template
| Column | Description |
|--------|-------------|
| Nozzle Mark | Nozzle designation (N1, N2, N3, etc.) |
| Service | Process service description |
| Size (NPS) | Nominal pipe size |
| Rating (ANSI) | Pressure rating class (150/300/600/900/1500) |
| Facing | Raised Face (RF) / Ring Type Joint (RTJ) / Flat Face (FF) |
| Orientation | Clock position and elevation relative to datum |
| Connected To | Line number or equipment tag connected to this nozzle |
| Notes | Special requirements (reinforcement, thermal sleeve, etc.) |

### Appendix: Material Selection Summary Template
| Column | Description |
|--------|-------------|
| Component | Equipment component (shell, head, internals, shaft, impeller, etc.) |
| Material Specification | ASTM/EN material designation (e.g., ASTM A516 Gr 70, ASTM A312 TP316L) |
| Corrosion Allowance (mm) | Additional wall thickness for corrosion/erosion |
| PWHT Required | Yes / No / Per Code |
| Impact Test Required | Yes / No -- and test temperature if required |
| Hardness Limit | Maximum hardness (HRC/HBW) if applicable (e.g., 22 HRC for sour service per NACE MR0175) |
| Certification | EN 10204 Type 3.1 / 3.2 / Certificate of Conformance |
| Notes | Special requirements (solution annealing, positive material identification, etc.) |

### Appendix: VDRL Template
| Column | Description |
|--------|-------------|
| Item | Sequential VDRL line item number |
| Document Type | GA Drawing / Data Sheet / Calculation / Test Procedure / O&M Manual / Spare Parts List / Certificate / etc. |
| Description | Specific document description |
| Submission Milestone | With Order / Before Fabrication / Before Shipment / With Shipment / After Commissioning |
| Copies | Number of hard and soft copies required |
| Format | PDF / DWG / Native / Hard Copy |
| Review Required | Yes (A/B/C/D review) / No (For Information Only) |
| Notes | Any special requirements for this document |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Specification Completeness | % of applicable sections fully populated for the equipment type | 100% for all mandatory sections |
| Code Reference Accuracy | All design codes correctly cited and edition/year specified | 100% accuracy |
| Vendor RFQ Readiness | Specification usable for RFQ without additional technical clarification | Zero clarification RFIs from vendors |
| Material Selection Adequacy | Materials specified appropriate for the defined process environment | Validated against corrosion engineering practice |
| Dimensional Compatibility | Nozzle sizes, orientations, and equipment dimensions compatible with plant layout | Verified against layout drawings (where available) |

## Procedure

### Step 1: Equipment Classification and Code Framework Selection
- Identify the equipment type and assign the primary design code(s) using the equipment-code mapping:

| Equipment Type | Primary Design Code | Secondary Codes |
|---------------|-------------------|-----------------|
| Centrifugal Pumps | API 610 / ISO 5199 | API 682 (mechanical seals), HI standards |
| Positive Displacement Pumps | API 674/675/676 | HI standards |
| Centrifugal Compressors | API 617 | API 614 (lube oil), API 670 (monitoring) |
| Reciprocating Compressors | API 618 | API 614, API 670 |
| Pressure Vessels | ASME VIII Div 1/2 | ASME II (materials), PD 5500, EN 13445 |
| Heat Exchangers (Shell & Tube) | API 660 / TEMA | ASME VIII, HEI standards |
| Air-Cooled Heat Exchangers | API 661 | ASME VIII |
| Storage Tanks (Atmospheric) | API 650 | API 653 (inspection), API 2000 (venting) |
| Electric Motors | IEC 60034 / NEMA MG1 | IEC 60079 (Ex), IEEE 841 |
| Control Valves | IEC 60534 / ISA 75 | API 6D (pipeline valves) |
| Safety Relief Valves | API 520/521/526 | ASME VIII (set pressure) |
| Conveyors (Mining) | CEMA / DIN 22101 | AS 1332 (belting) |
| Crushers/Mills (Mining) | Vendor-specific | SME standards |

- Determine the secondary codes applicable to the project jurisdiction: Chilean standards (NCh 2369 seismic, NCh-Elec 4/2003 electrical installations, SEC regulations), Latin American regional standards, and any client-specific standards
- Establish the design life requirement (typically 20-25 years for process equipment, 15-20 years for rotating equipment, 30+ years for structural elements) and document the basis
- Identify whether the equipment is in a hazardous area and determine the required protection level (Ex d, Ex e, Ex ia/ib, Ex p) per the project area classification study (IEC 60079 series); for Chilean projects verify SEC certification requirements
- Determine quality assurance requirements: ASME U-stamp, API monogram, ISO 9001 certification, PED compliance, and any client-specific QA requirements
- Select the specification template appropriate to the equipment type from the VSC template library; if no template exists, adapt the closest available template and flag for engineering manager approval
- Establish the document structure identifying which sections are mandatory versus optional for this equipment type, and which sections require input from other disciplines (HSE for hazardous area, Operations for operating philosophy, Asset Management for standardization)

### Step 2: Process and Performance Requirements Definition
- Extract all process conditions from the equipment data sheet: normal operating, design, maximum, minimum, startup, shutdown, and upset conditions for pressure, temperature, flow rate, and fluid composition
- Define performance guarantee points: the specific operating conditions at which the vendor must guarantee equipment performance, with acceptance tolerances (typically: flow +/- 0%, head/pressure +5%/-0%, power -0%/+5%, efficiency minimum guaranteed)
- Specify turndown requirements: minimum stable operating flow (for pumps), minimum load (for compressors), minimum capacity (for heat exchangers), with stability criteria
- Document fluid properties at all operating conditions: density, viscosity, vapor pressure, corrosion data, solids content (for slurry service), gas composition (for compressors), fouling factors (for heat exchangers)
- Define operating modes and duty cycle: continuous/intermittent/standby, number of starts per day/year, emergency operating scenarios, and any cycling requirements
- For mining equipment (conveyors, crushers, mills, screens): define material properties (PSD, Bond work index, abrasion index, moisture content), throughput requirements, and availability targets
- Define utility requirements: cooling water (flow, pressure, temperature, quality), instrument air (pressure, dew point, quality per ISA 7.0.01), electrical power (voltage, frequency, available short circuit capacity), steam (pressure, temperature, quality), and any special utilities
- For heat exchangers: specify fouling factors per TEMA Table RGP-T-2.4 or project-specific values, tube material and configuration (plain/finned, U-tube/straight), and cleaning provisions (removable bundle, chemical cleaning connections)
- Compile the complete process data sheet as an appendix to the specification, ensuring all operating cases are tabulated (normal, turndown, maximum, startup, shutdown, upset)

### Step 3: Mechanical Design and Materials Specification
- Define mechanical design requirements per the applicable design code: design pressure and temperature (with appropriate margin above operating conditions per code requirements), nozzle schedule using the Nozzle Schedule Template appendix, and piping load allowances (forces and moments at each nozzle per API/ASME standard)
- Specify seismic design requirements per NCh 2369 (for Chilean projects) or applicable local code: importance factor, seismic zone, soil classification, response spectrum, and allowable stress increase factors; for mining sites in northern Chile (Zones 2-3), seismic requirements are particularly stringent
- Define vibration limits per applicable standard: ISO 10816/20816 for rotating equipment, API 610 Table 4 for pumps, API 617 for compressors; specify both acceptance limits (new equipment) and alarm/trip limits (operational monitoring)
- Define noise limits: typically 85 dBA at 1m for general equipment, 80 dBA for control rooms, with specific limits per Chilean occupational health regulations (DS 594 -- Reglamento sobre Condiciones Sanitarias y Ambientales Basicas en los Lugares de Trabajo); specify vendor responsibility for noise attenuation if standard equipment exceeds limits
- Specify materials of construction for all major components using ASTM/EN material designations and compile using the Material Selection Summary Template appendix: casing/shell, internals/impeller, shaft, bearings, seals, gaskets, bolting, and weld filler metals
- Apply material selection rules based on process environment: carbon steel suitability check (Nelson curves for H2 service, chloride concentration limits for stainless steel selection, minimum design metal temperature for Charpy impact testing per UCS-66/UCS-68), corrosion-resistant alloy selection for aggressive services (Alloy 625, Super Duplex, Hastelloy as required), erosion-resistant materials for slurry service (Ni-Hard, high-chrome white iron, rubber lining, polyurethane lining)
- Define corrosion allowance per component (typically 3.0mm for carbon steel in non-corrosive service, higher for corrosive services), specify prohibited materials (e.g., copper alloys in ammonia service, austenitic SS in chloride environments above 50 ppm without specific qualification, carbon steel in caustic service above 50C without stress relief)
- Define material certification requirements: EN 10204 Type 3.1 minimum for pressure-retaining parts, Type 3.2 for critical service or client requirement; specify Positive Material Identification (PMI) requirements for alloy components
- For sour service equipment (per NACE MR0175/ISO 15156): specify hardness limits (22 HRC max for carbon steel, 28 HRC for CRA), material restrictions, and required weld procedure qualifications

### Step 4: Instrumentation, Electrical, and Control Requirements
- Define local instrumentation requirements: pressure gauges (range, dial size, connection), temperature indicators (type, range, well material), level gauges (type, material, connection), flow indicators, and vibration monitoring provisions
- Specify transmitters and switches with: measured variable, range, output signal (4-20mA HART, Foundation Fieldbus, Profibus), accuracy class, process connection, wetted material, enclosure rating, and hazardous area certification
- Define the control system interface: DCS, PLC, or SIS connection requirements, I/O type summary, marshalling/junction box requirements, cable type and routing requirements, and any package-mounted PLC or local control panel specifications
- For motor-driven equipment: specify motor voltage, frequency, starting method (DOL, star-delta, VFD), enclosure (TEFC, TENV, Ex-rated), insulation class, service factor, bearing type, and space heater requirements
- For VFD-driven equipment: specify VFD requirements including harmonic distortion limits, input/output filter requirements, bypass provisions, and communication protocol
- Define electrical area classification requirements: equipment zone classification (Zone 0/1/2 or Division 1/2), gas group, temperature class, and required Ex protection type with IECEx/ATEX certification
- Specify cable entry requirements, earthing/grounding provisions, and lightning protection per NCh-Elec 4/2003 and IEC 62305

### Step 5: Testing and Inspection Requirements
- Define Factory Acceptance Test (FAT) requirements by test category:
  - Hydrostatic/pneumatic test: test pressure per code (typically 1.3x or 1.5x design pressure), test medium, hold time, acceptance criteria, and witnessing requirement (mandatory witness / witness option / vendor certification acceptable)
  - Performance test: operating conditions to simulate, acceptance criteria with numerical tolerances, test duration, data recording requirements, and witnessing requirement
  - Material verification: Positive Material Identification (PMI) extent (100% for alloy materials, sampling for carbon steel), hardness testing locations and acceptance limits
  - Dimensional check: critical dimensions to verify, tolerances, and reporting format
  - Special tests by equipment type: NPSH test (pumps), mechanical run test with vibration survey (rotating equipment, minimum 4 hours per API), sound level test, string test for compressor packages
- Define Non-Destructive Examination (NDE) requirements: radiography extent (%), ultrasonic testing, magnetic particle inspection, liquid penetrant inspection, and hardness testing -- per applicable code minimums plus any project enhancements for critical service or sour service (NACE MR0175)
- Define Site Acceptance Test (SAT) requirements: installation verification, alignment check (laser alignment required for rotating equipment), field performance test conditions and acceptance criteria, vibration survey (per ISO 10816/20816), and vendor commissioning support requirements (days on site, scope of assistance)
- Specify painting and coating requirements: surface preparation standard (SSPC/NACE), coating system by service (outdoor, indoor, submerged, insulated), DFT requirements, and inspection/testing (holiday testing, adhesion testing)

### Step 6: Documentation, Spare Parts, and Final Compilation
- Specify documentation requirements using the VDRL appendix template: list every document the vendor must submit with submission milestone (with order, before fabrication, before shipment, with shipment, after commissioning), number of copies, format (PDF + native), and whether project review (A/B/C/D) is required
- Define spare parts requirements in three categories: commissioning spares (2-year normal consumption items), capital spares (major components for overhaul, e.g., complete rotating assembly, tube bundle), and insurance spares (long-lead critical items), with quantities, part numbers, and estimated pricing required from vendor
- Define packaging, preservation, shipping, and storage requirements appropriate to the project location: packaging grade per ASTM D3951, preservation method (nitrogen blanketing for internals, VCI wrap for machined surfaces, desiccant for enclosed spaces), shipping marks and documentation, and long-term storage requirements (rotating shaft quarterly, preservation renewal schedule)
- For mining sites at altitude (>2,500m ASL), specify derating requirements for motors, engines, and air-cooled equipment, and any altitude-specific packaging/preservation needs
- Compile the complete specification document and perform the internal consistency check: verify materials of construction are consistent between Section 5 (Materials) and Section 3 (Process Data for corrosion context); verify nozzle schedule matches piping model; verify instrument requirements match control system architecture; verify motor ratings match electrical load list
- Perform final quality check against the specification completeness checklist for the equipment type
- Issue the specification for internal discipline review before release for procurement

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|------------|---------------------|
| Vague or unverifiable requirements | Using subjective language ("adequate," "suitable") instead of quantified criteria | Enforce "shall" + measurable value for every requirement; review each requirement for verifiability |
| Wrong design code referenced | Specifying API 610 for a positive displacement pump, or ASME VIII for atmospheric tanks | Equipment type to code mapping table in Step 1; engineering manager review of code selections |
| Material incompatible with process environment | Insufficient corrosion engineering input or generic material selection without service consideration | Mandatory corrosion data review for every material selection; flag aggressive services for specialist review |
| Nozzle schedule conflicts with piping layout | Nozzle sizes, ratings, or orientations specified without checking against piping isometrics | Cross-reference nozzle schedule against layout/piping model before specification issue |
| Testing requirements under-specified | Omitting FAT witness points or not defining performance test acceptance criteria | Use equipment-type-specific testing checklist; define acceptance criteria with numerical tolerances |
| Instrument signals incompatible with control system | Specifying analog instruments for a digital system, or wrong communication protocol | Verify I/O types and communication protocols against control system architecture document |
| Seismic requirements omitted for Chilean projects | International specification template used without adaptation for Chilean seismic zone | Mandatory NCh 2369 compliance section for all specifications on Chilean projects; automated check |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Process data sheet incomplete or unavailable | Before specification writing begins | Process Engineering Lead -> Engineering Manager |
| Material selection for aggressive/novel service requires specialist input | Within 2 days of identification | Materials/Corrosion Engineer -> Engineering Manager |
| Specification requires client-proprietary standard not available to project | Within 1 day of identification | Engineering Manager -> Client Technical Representative |
| Conflicting requirements between design codes | Within 2 days of identification | Discipline Lead -> Engineering Manager (formal technical query) |
| Equipment in SIL-rated service requiring enhanced specification | At specification initiation | HSE Agent -> Safety Engineering Lead -> Engineering Manager |
| Specification for equipment type without VSC template | At specification initiation | Discipline Lead -> Engineering Manager (develop new template or adapt closest) |
| Budget constraint conflicting with technical requirement | When identified during specification development | Engineering Manager -> Project Manager -> Client (value engineering discussion) |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >98% | All design code references correct; process conditions match data sheet; material selections appropriate for service |
| Completeness | 25% | 100% | All mandatory sections populated for the equipment type; all appendices included; VDRL complete |
| Consistency | 15% | 100% | Internal consistency between sections (materials, instruments, nozzles); consistent units throughout |
| Format | 10% | 100% | VSC standard specification format; professional layout; correct document numbering and revision control |
| Actionability | 10% | >95% | Vendor can prepare a compliant quotation from this specification alone without additional technical clarification |
| Traceability | 10% | 100% | Every requirement traceable to a design code clause, process data sheet value, or project design basis criterion |

### Automated Quality Checks
- [ ] Every requirement uses "shall" (mandatory), "should" (recommended), or "may" (optional) -- no vague terms like "adequate" or "suitable"
- [ ] Design code(s) correctly identified for the equipment type with edition/year specified
- [ ] Process data sheet included as appendix with all operating cases populated (no blank cells in critical fields)
- [ ] Materials of construction specified by ASTM/EN designation for all major components (no generic descriptions like "stainless steel")
- [ ] Nozzle schedule complete with size, rating, facing, and orientation for every nozzle
- [ ] Seismic design requirements specified for Chilean projects per NCh 2369
- [ ] Hazardous area classification specified where applicable with Ex protection type and certification requirement
- [ ] FAT and SAT acceptance criteria defined with numerical tolerances (not "satisfactory" or "acceptable")
- [ ] VDRL complete with all required vendor documents, submission milestones, and review requirements
- [ ] Spare parts section includes commissioning spares, capital spares, and recommended spares list
- [ ] Internal consistency verified: materials match across all sections, instruments match I/O summary, nozzle sizes match piping
- [ ] Units consistent throughout document (SI or Imperial as per project standard, not mixed)

## Inter-Agent Dependencies

### Inputs From
| Agent | Input Provided | Criticality |
|-------|---------------|-------------|
| Operations | Process data sheets, operating philosophy, performance requirements | Critical |
| HSE | Hazardous area classification, SIL requirements, safety system specifications | Critical |
| Asset Management | Equipment standardization requirements, maintenance-driven design preferences, CMMS tag structure | High |
| Execution | Project schedule for specification delivery milestones, layout constraints | High |
| Contracts & Compliance | Commercial terms affecting specification (approved vendor lists, local content requirements) | Medium |

### Outputs Consumed By
| Agent | Output Provided | Trigger |
|-------|----------------|---------|
| Contracts & Compliance | Complete technical specifications for RFQ preparation and purchase order placement | Automatic upon specification approval |
| Execution | Specification-driven construction planning data (weights, dimensions, utility requirements) | On request |
| Asset Management | Equipment design basis for maintenance strategy development, spare parts specification | Automatic at specification issue |
| Operations | Performance specification data for operating procedure development | On request |
| Engineering Design (review-vendor-data-sheets) | Specification requirements as the review basis for vendor submissions | Automatic link |

## References

### Methodology References
- `methodology/or-playbook-and-procedures/` -- VSC OR Playbook for engineering specification development standards
- `methodology/capital-projects/` -- Capital project specification management and approval procedures
- `methodology/contract-tender-technical-specifications/` -- Existing specification examples and templates by equipment type
- `docs/architecture/_legacy/multi-agent-architecture.md` -- Multi-agent architecture defining specification data flow

### Industry Standards
- **API 610/617/618/660/661** -- Equipment-specific API standards for rotating and static equipment (pump, compressor, reciprocating compressor, heat exchanger, air-cooled heat exchanger)
- **ASME BPVC Section VIII** -- Pressure vessel design and fabrication code
- **IEC 60034 / NEMA MG1** -- Electric motor specification standards
- **IEC 60534 / ISA 75** -- Control valve specification standards
- **NCh 2369** -- Chilean seismic design of industrial structures and equipment
- **NCh-Elec 4/2003** -- Chilean electrical installation regulations

## Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC Engineering | Initial creation -- Wave 3 |
