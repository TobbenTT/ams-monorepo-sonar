# ISO 14224:2016 — Plant & Equipment Taxonomy Reference

> **Purpose**: Canonical reference for building plant hierarchies, equipment classification, metadata management and reliability data collection. All hierarchy-building skills (`build-equipment-hierarchy`, `resolve-equipment`, `import-data`) and reliability agent skills (`perform-fmeca`, `validate-failure-modes`, `assess-criticality`) SHALL conform to the taxonomy, boundary definitions, and data structures defined in this document.
>
> **Source**: BS EN ISO 14224:2016 — *Petroleum, petrochemical and natural gas industries — Collection and exchange of reliability and maintenance data for equipment*
>
> **Document ID**: REF-STD-03

---

## Table of Contents

1. [Scope & Applicability](#1-scope--applicability)
2. [Taxonomy Hierarchy — 9 Levels](#2-taxonomy-hierarchy--9-levels)
3. [Level-by-Level Reference Tables](#3-level-by-level-reference-tables)
4. [Equipment Boundary Definitions](#4-equipment-boundary-definitions)
5. [Equipment Data — Common Attributes](#5-equipment-data--common-attributes)
6. [Equipment-Specific Data (Annex A)](#6-equipment-specific-data-annex-a)
7. [Equipment Subdivision: Subunits & Maintainable Items](#7-equipment-subdivision-subunits--maintainable-items)
8. [Failure Data Model](#8-failure-data-model)
9. [Maintenance Data Model](#9-maintenance-data-model)
10. [Failure Mechanisms — Code Tables](#10-failure-mechanisms--code-tables)
11. [Failure Causes — Code Tables](#11-failure-causes--code-tables)
12. [Detection Methods](#12-detection-methods)
13. [Maintenance Activities](#13-maintenance-activities)
14. [Timeline & Operating Period Definitions](#14-timeline--operating-period-definitions)
15. [RM Parameters by Taxonomy Level](#15-rm-parameters-by-taxonomy-level)
16. [Data Quality Requirements](#16-data-quality-requirements)
17. [Practical Rules for Hierarchy Building](#17-practical-rules-for-hierarchy-building)
18. [Mapping to Our Software Templates](#18-mapping-to-our-software-templates)
19. [Appendix A — Complete Equipment Class Catalogue](#appendix-a--complete-equipment-class-catalogue)
20. [Appendix B — Complete Equipment Subdivision Examples](#appendix-b--complete-equipment-subdivision-examples)

---

## 1. Scope & Applicability

ISO 14224 provides a **comprehensive basis for the collection of reliability and maintenance (RM) data** in a standard format. It defines:

- **Data collection principles** and a "reliability language" for communicating operational experience
- **Failure modes** as a normative "reliability thesaurus" for quantitative and qualitative applications
- **Minimum data requirements** for equipment, failure, and maintenance data categories
- **Standardized data format** to facilitate RM data exchange between plants, owners, manufacturers, and contractors

### What it covers
- Equipment taxonomy (9-level hierarchy from Industry down to Part)
- Equipment boundary definitions (what is inside/outside each equipment class)
- Equipment attributes — common and class-specific
- Failure data (mode, mechanism, cause, detection, consequence)
- Maintenance data (category, activity, resources, times)
- Data quality assurance practices

### What it does NOT cover
- Direct cost data
- Laboratory/manufacturing test data
- Complete equipment datasheets
- Analysis methodologies (but includes basic reliability parameter calculations in annexes)

### Applicability to our software
This standard is the **primary reference** for:
- **`build-equipment-hierarchy`** — Taxonomy levels 1-8, naming, parent-child relationships
- **`validate-failure-modes`** — Normative failure mode codes per equipment category (Annex B)
- **`perform-fmeca`** — Failure mechanism, failure cause, detection method catalogues
- **`assess-criticality`** — Consequence classification, failure impact levels
- **`import-data`** / **`export-data`** — Data format, coded fields, minimum required fields
- **`resolve-equipment`** — Equipment class codes, type classifications, boundary definitions

---

## 2. Taxonomy Hierarchy — 9 Levels

The ISO 14224 taxonomy is a **systematic classification of items into generic groups** based on factors common to several items (location, use, equipment subdivision, etc.). The hierarchy has **two main segments**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USE / LOCATION DATA                          │
│  (Context — where and how the equipment is used)               │
│                                                                 │
│  Level 1: Industry                                              │
│  Level 2: Business Category                                     │
│  Level 3: Installation Category                                 │
│  Level 4: Plant / Unit Category                                 │
│  Level 5: Section / System                                      │
├─────────────────────────────────────────────────────────────────┤
│                    EQUIPMENT SUBDIVISION                         │
│  (Inventory — the equipment and its internal structure)         │
│                                                                 │
│  Level 6: Equipment Class / Unit                                │
│  Level 7: Subunit                                               │
│  Level 8: Component / Maintainable Item (MI)                    │
│  Level 9: Part (optional)                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Levels 1-5** represent high-level categorization related to industries and plant application **regardless of equipment units**. An equipment unit (e.g., pump) can be used in many industries and plant configurations — for reliability analysis it is necessary to have the operating context.

2. **Levels 6-9** are related to the equipment unit (inventory) with subdivision in lower indenture levels corresponding to a **parent-child relationship**.

3. The standard **focuses on Level 6** (equipment unit) for RM data collection and indirectly on lower levels (subunits and components).

4. The number of subdivision levels varies per equipment class and can be decided by the data collector.

5. **Items can appear at different levels** depending on context or size. Example: a valve is an equipment class (Level 6) topside but may be a maintainable item (Level 8) in a subsea context. Avoid double-counting.

---

## 3. Level-by-Level Reference Tables

### Level 1 — Industry

| Value |
|-------|
| Petroleum |
| Natural gas |
| Petrochemical |

### Level 2 — Business Category

| Value | Description |
|-------|-------------|
| Upstream (E&P) | Exploration and production |
| Midstream | Transportation, processing, storage |
| Downstream (Refining) | Refining operations |
| Petrochemical | Chemical processing |

### Level 3 — Installation Category (Table A.1)

| Upstream (E&P) | Midstream | Downstream | Petrochemical |
|-----------------|-----------|------------|---------------|
| Oil/gas production facility (offshore/onshore) | Liquefied natural gas (LNG) | Refinery | Petrochemical complex |
| SAGD facility (onshore) | Liquefied petroleum gas (LPG) | Terminal | |
| Drilling facility (offshore/onshore) | Gas processing | | |
| Maritime vessel | Terminal | | |
| Terminal | Storage | | |
| Pipeline | Pipeline | | |
| Floating LNG (FLNG) | Shipping | | |
| Energy plant | | | |

### Level 4 — Plant/Unit Category (Table A.2)

| Upstream (E&P) | Midstream | Downstream | Petrochemical |
|-----------------|-----------|------------|---------------|
| Mobile offshore drilling unit (MODU) | NGL extraction | Crude Distillation Unit | Methanol |
| Onshore drilling rig | NGL fractionation | Delayed Coking Unit | Ethylene |
| Offshore platform | Pipeline compressor station | Hydrotreating Unit | Polyethylene |
| FPSO / FDPSO | Pipeline pump station | Fluid Catalytic Cracking | Polypropylene |
| Floating storage unit (FSU) | Utilities | Sulfur-recovery unit | Polyvinylchloride |
| Tension leg platform (TLP) | Offloading | Hydrogen generation | Acetic Acid |
| Compliant tower | | Tail Gas Recovery Unit | Biofuel |
| Subsea production | | Utilities | |
| Onshore production plant | | Offsite and support | |

### Level 5 — Section/System (Table A.3)

Organized into four groups:

**Process (Industry-specific)**
- S1–S27: Upstream systems (oil processing, gas processing, water injection, subsea, drilling, etc.)
- S28–S39: Midstream systems (LNG processing, fractionation, refrigeration, etc.)
- S40–S56: Downstream systems (crude distillation, hydrotreating, FCC, etc.)
- S57–S66: Petrochemical systems (steam cracking, polymerization, etc.)

**Safety and Control (All business categories)**
- S67: Emergency depressurization (EDP/Blowdown)
- S68: Emergency shutdown (ESD)
- S69: Process shutdown (PSD)
- S70: Fire and gas detection
- S71: Fire water
- S72: Fire-fighting
- S73: Flare
- S74: Process control
- S75: Emergency communication
- S76: Evacuation system
- S77: Inert gas
- S78: Open drains

**Utilities (All business categories)**
- S79: Steam
- S80: Main power
- S81: Emergency power
- S82: Essential power
- S83: Instrument air
- S84: Utility air
- S85: Cooling
- S86: Heating
- S87: Nitrogen
- S88: Chemical injection
- S89: Loading
- S90: Helicopter refuelling
- S91: Electrical power protection

**Auxiliaries (All business categories)**
- S92: Fiscal metering
- S93: Telecommunications
- S94: HVAC
- S95: Disconnection
- S96: Materials handling
- S97: Saturation diving

### Level 6 — Equipment Class (Table A.4)

See [Appendix A](#appendix-a--complete-equipment-class-catalogue) for the complete catalogue.

### Level 7 — Subunit

Equipment-class-specific. Defined per equipment class in Annex A. Common subunits across many equipment classes include:
- Control and monitoring
- Lubrication system
- Cooling system
- Shaft seal system
- Power transmission
- Miscellaneous

### Level 8 — Component / Maintainable Item (MI)

The group of parts that are commonly maintained (repaired/restored) as a whole. Examples:
- Cooler, coupling, gearbox, lubrication oil pump
- Instrument loop, motor, valve, filter
- Pressure sensor, temperature sensor, electric circuit

> **Note**: For some equipment (e.g., piping), there might be no MI; the part could be "elbow".

### Level 9 — Part (Optional)

A single piece of equipment. Examples:
- Seal, tube, shell, impeller, gasket, filter plate, bolt, nut

---

## 4. Equipment Boundary Definitions

### Purpose
A clear boundary description is **imperative** for collecting, merging, and analysing RM data from different sources. It ensures communication between operators and manufacturers, and prevents analysis based on incompatible data.

### Rules for Defining Boundaries

1. **Do NOT include** items of unique design or configuration-dependent items. Include only items that are generic for the equipment class to compare "like with like."

2. **Exclude connected items** from the equipment-class boundary unless specifically included. Failures at connections (e.g., leak) that cannot be solely related to the connected item should be included.

3. **Driver/driven shared subunits**: If a driver and driven unit share a common subunit (e.g., lubrication system), relate failure and maintenance events to the **driven unit** as a general rule.

4. **Instrumentation**: Include only where it has a specific control/monitoring function for the equipment unit and/or is locally mounted. Exclude general SCADA systems.

5. **Use P&ID** when defining items within the equipment class boundary.

6. **Boundaries shall NOT overlap** among different equipment classes. If unavoidable, identify and treat cases appropriately during analysis.

7. **Any deviation** from the boundaries given in this standard, or new boundaries, must be specified.

### Example: Pump Boundary

```
     ┌──────────────────────────────────────────────────┐
     │              PUMP BOUNDARY                        │
     │                                                   │
     │  ┌─────────┐  ┌─────────┐  ┌──────────────┐     │
     │  │ Pump    │  │ Shaft   │  │ Control &    │     │
     │  │ Unit    │  │ Seals   │  │ Monitoring   │     │
     │  └─────────┘  └─────────┘  └──────────────┘     │
     │  ┌─────────┐  ┌─────────┐  ┌──────────────┐     │
     │  │ Power   │  │ Lubri-  │  │ Miscellaneous│     │
     │  │ Trans.  │  │ cation  │  │              │     │
     │  └─────────┘  └─────────┘  └──────────────┘     │
     └────────┬──────────────────────────┬──────────────┘
              │ OUTSIDE BOUNDARY         │
              v                          v
     Inlet/outlet valves         Driver (electric motor,
     Suction strainer            gas turbine, engine)
```

- Inlet and outlet valves and suction strainer are **NOT** within the boundary
- Pump drivers and their auxiliary systems are **NOT** included
- Driver units are recorded as **separate inventories**
- A reference number in the pump inventory links to the appropriate driver inventory

---

## 5. Equipment Data — Common Attributes

All equipment classes share a common set of data fields (Table 5 in ISO 14224). Fields marked `(*)` are **minimum required data**.

### Use/Location Attributes (Levels 1-5)

| Field | Level | Required | Description | Example |
|-------|-------|----------|-------------|---------|
| Industry | 1 | Yes | Type of main industry | Petroleum |
| Business category | 2 | (*) | Business/processing stream | E&P |
| Installation category | 3 | Yes | Type of facility | Oil/gas production |
| Installation code/name | 3 | (*) | Unique installation identifier | Delta |
| Owner code/name | 4 | Yes | Owner identifier | Smith Ltd. |
| Geographic location | 3 | Yes | Geographic region | UKCS |
| Plant/Unit category | 4 | (*) | Type of plant/unit | Oil/gas platform |
| Plant/Unit code/name | 4 | (*) | Unique plant identifier | Alpha 1 |
| Section/System | 5 | (*) | Main section/system | Oil processing |
| Operation category | 5 | Yes | Operating mode | Remote control |

### Equipment Attributes (Level 6-8)

| Field | Level | Required | Description | Example |
|-------|-------|----------|-------------|---------|
| Equipment class | 6 | (*) | Class per Annex A | Pump |
| Equipment type | 6 | (*) | Type per Annex A | Centrifugal |
| Equipment ID / tag number | 6 | (*) | Functional location ID | P101-A |
| Equipment description | 6 | Yes | Nomenclature | Transfer pump |
| Unique equipment ID (serial) | 6 | Yes | Manufacturer serial number | 12345XL |
| Manufacturer's name | 6 | (*) | | Johnson |
| Manufacturer's model | 6 | Yes | Model designation | Mark I |
| Design data (class-specific) | 6-8 | Varies | Capacity, power, speed, etc. | See Annex A |

### Operation (Normal Use) Attributes

| Field | Level | Required | Description | Example |
|-------|-------|----------|-------------|---------|
| Normal operating state/mode | 6 | (*) | Running, standby, intermittent | Running |
| Initial commissioning date | 6 | Yes | First startup date | 2003-01-01 |
| Start date of current service | 6 | (*) | Current service start | 2003-02-01 |
| Surveillance time (hours) | 6 | (*) | Calendar hours monitored | 8,950 |
| Operational time (hours) | 6 | Yes | Actual running hours | 7,540 |
| Number of periodic test demands | 6-8 | (*) | Count during surveillance | 4 |
| Number of operational demands | 6-8 | (*) | Count during surveillance | 4 |
| Operating parameters (class-specific) | 6 | Varies | Ambient, power, etc. | See Annex A |

### Important Notes on Equipment Identification

- **Tag number**: Identifies equipment function and physical location. Remains same if equipment is replaced.
- **Serial number (unique ID)**: Identifies the specific physical unit. Changes when equipment is swapped out.
- **Both are needed** to track equipment at its location AND track individual equipment units across locations.

---

## 6. Equipment-Specific Data (Annex A)

Each equipment class has additional design/operational parameters. Priority levels:
- **High** = Compulsory
- **Medium** = Highly desirable
- **Low** = Desirable

### Example: Centrifugal Pumps

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of pump | Centrifugal, reciprocating, rotary, axial | High |
| Pump application | Fire water, injection, transfer, export, etc. | High |
| Type of driven unit | Equipment class and ID code | High |
| Design pressure (discharge) | Pascal (bar) | High |
| Design temperature | Degrees Celsius | Medium |
| Design flow rate | m3/h | High |
| Design head | Metres | High |
| Speed | RPM | Medium |
| Number of stages | Count | Medium |
| Fluid type | Crude oil, water, gas, etc. | High |
| Fluid corrosiveness/erosiveness | Benign, moderate, severe | Medium |
| Seal type | Mechanical, packed, etc. | Medium |

### Example: Compressors

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of compressor | Centrifugal, reciprocating, screw, axial | High |
| Type of driven unit | Equipment class and ID code | High |
| Power - design (max) | Kilowatt | High |
| Power - operating | Kilowatt | Low |
| Inlet flow | m3/h | Medium |
| Discharge pressure (design) | Pascal (bar) | High |
| Suction pressure (design) | Pascal (bar) | Medium |
| Speed | RPM | Medium |
| Number of stages | Count | Medium |
| Gas handled | Molar mass (g/mol) | Low |
| Gas corrosiveness/erosiveness | Benign, moderate, severe | Medium |

### Example: Heat Exchangers

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of heat exchanger | Shell-and-tube, plate, air-cooled, etc. | High |
| Design pressure (shell/tube) | Pascal (bar) | High |
| Design temperature (shell/tube) | Degrees Celsius | High |
| Design heat duty | kW | Medium |
| Flow rate (shell/tube) | m3/h | Medium |
| Fluid type (shell/tube) | Code | High |
| Material (shell/tube) | Code | Medium |

### Example: Gas Turbines

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of gas turbine | Aeroderivative, industrial, micro | High |
| Type of driven unit | Equipment class and ID code | High |
| Power - design (ISO) | Kilowatt | High |
| Power - operating | Kilowatt | Low |
| Heat rate | kJ/kWh | Medium |
| Speed - gas generator | RPM | Medium |
| Speed - power turbine | RPM | Medium |
| Fuel type | Gas, liquid, dual | High |
| Inlet temperature (design) | Degrees Celsius | Medium |
| Exhaust temperature (design) | Degrees Celsius | Medium |

### Example: Electric Motors

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of motor | Induction, synchronous, DC | High |
| Type of driven unit | Equipment class and ID code | High |
| Power rating | Kilowatt | High |
| Voltage | Volt | High |
| Speed | RPM | Medium |
| Enclosure type | TEFC, ODP, explosion proof | High |
| Insulation class | B, F, H | Medium |
| Starting method | DOL, star-delta, VFD, soft start | Medium |

### Example: Valves

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Valve type | Gate, globe, ball, butterfly, check, plug, needle | High |
| Valve application | Process, ESD, PSV, bypass, blowdown, monitoring | High |
| Valve size (nominal) | Millimetres or inches | High |
| Pressure class | ANSI class (150, 300, 600, etc.) | High |
| Body material | Carbon steel, stainless, alloy, etc. | High |
| Actuator type | Pneumatic, hydraulic, electric, manual | High |
| Fail-safe mode | Fail-open, fail-close, fail-as-is | High |
| Fluid type | Code | High |
| Fluid corrosiveness/erosiveness | Benign, moderate, severe | Medium |

### Example: Pressure Vessels

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of vessel | Separator, scrubber, column, reactor, drum | High |
| Design pressure | Pascal (bar) | High |
| Design temperature | Degrees Celsius | High |
| Volume | Cubic metres | Medium |
| Shell material | Code | High |
| Fluid type | Code | High |
| Internal coating/lining | Yes/No, type | Medium |

### Example: Switchgear

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Type of switchgear | Air-insulated, gas-insulated, vacuum | High |
| Voltage level | Low (<1kV), Medium (1-36kV), High (>36kV) | High |
| Rated current | Amperes | High |
| Short-circuit rating | kA | High |
| Number of circuits | Count | Medium |
| Enclosure type | Indoor, outdoor, explosion proof | High |

### Example: Input Devices (Sensors/Transmitters)

| Parameter | Unit/Code | Priority |
|-----------|-----------|----------|
| Location on installation | Drill floor, process, control room, etc. | High |
| Application | Process control, ESD, PSD, monitoring | High |
| Category | Transmitter, transducer, switch, pushbutton | High |
| Sensing principle | Varies by measured variable | High |
| Fluid/gas corrosiveness | Benign, moderate, severe | Medium |

---

## 7. Equipment Subdivision: Subunits & Maintainable Items

Each equipment class is subdivided into **subunits** (Level 7) and **maintainable items** (Level 8). The standard provides recommended subdivisions for each equipment class in Annex A.

### Common Subunit Pattern

Most rotating and complex equipment share these subunits:

| Subunit | Description | Typical MIs |
|---------|-------------|-------------|
| **Main unit** (varies by class) | Core functional component | Impeller, rotor, stator, casing, internals |
| **Control and monitoring** | Sensors, actuators, logic | Actuating device, control unit, sensors, valves, wiring |
| **Lubrication system** | Oil supply and filtration | Reservoir, pump, motor, filter, cooler, valves, piping |
| **Shaft seal system** | Prevent fluid leakage | Seal-gas equipment, seal, piping |
| **Cooling system** | Temperature management | Cooler, fan/pump, valves, piping |
| **Power transmission** | Transfer mechanical energy | Coupling, gearbox, clutch |
| **Miscellaneous** | Catch-all for other items | Others, structural components |

### Example Subdivision: Compressors (Table A.10)

| Subunit | Maintainable Items |
|---------|-------------------|
| Compressor unit | Rotor w/impellers, casing, diaphragms, inlet vanes, radial bearing, thrust bearing, seals, inlet screen, valves |
| Gear | Gear wheels, radial bearing, thrust bearing, seals |
| Control and monitoring | Actuating device, control unit, internal power supply, monitoring, sensors, valves, wiring |
| Lubrication system | Reservoir, pump, motor, filter, cooler, valves, piping, seals, oil |
| Shaft seal system | Seal-gas equipment, seal gas, piping, seals |
| Cooling system | Cooler, fan/pump, control valve, piping |
| Miscellaneous | Others |

### Example Subdivision: Gas Turbines (Table A.18)

| Subunit | Maintainable Items |
|---------|-------------------|
| Air intake and exhaust | Inlet filter, silencer, ducting, expansion bellows, anti-icing |
| Compressor section | Rotor w/blades, inlet guide vanes, stator, casing, radial bearing, thrust bearing, seals |
| Combustion section | Fuel nozzle, combustor liner, igniters, crossover tubes |
| Turbine section | Rotor w/blades, stator, nozzle, casing, radial bearing, thrust bearing, seals, cooling internals |
| Control and monitoring | Actuating device, control unit, internal power supply, monitoring, sensors, valves, wiring, piping |
| Lubrication system | Reservoir, pump, motor, filter, cooler, valves, piping, seals, oil |
| Starting system | Starter motor, clutch, valves |
| Fuel gas system | Filter, valves, piping, flow divider |
| Shaft seal / bearing seal | Seal gas, piping, seals |
| Cooling system | Cooler, fan/pump, control valve, piping |
| Power transmission | Coupling, gearbox, clutch |
| Miscellaneous | Enclosure, fire protection, ventilation, base frame, others |

### Example Subdivision: Pumps (Table A.22)

| Subunit | Maintainable Items |
|---------|-------------------|
| Pump unit | Impeller, casing, wear ring, diffuser, radial bearing, thrust bearing, shaft |
| Power transmission | Coupling, gearbox, clutch |
| Control and monitoring | Actuating device, control unit, sensors, valves, wiring |
| Lubrication system | Reservoir, pump, motor, filter, cooler, valves, piping, oil |
| Shaft seal system | Mechanical seal, packing, seal support system, piping |
| Miscellaneous | Base plate, suction strainer (if inside boundary), others |

### Example Subdivision: Valves (Table A.38)

| Subunit | Maintainable Items |
|---------|-------------------|
| Valve mechanics | Seat, disc/ball/gate, stem, body, bonnet, bellows, gasket, bolts, packing |
| Valve actuator | Actuator, spring, solenoid, positioner, piston, diaphragm |
| Control and monitoring | Sensors, limit switch, wiring, piping |
| Miscellaneous | Others |

### Example Subdivision: Heat Exchangers (Table A.30)

| Subunit | Maintainable Items |
|---------|-------------------|
| Heat transfer elements | Tubes/plates, tube sheet, baffles, gaskets |
| Structural | Shell, channel/header, cover, nozzles, saddles/supports |
| Control and monitoring | Sensors, valves, wiring |
| Miscellaneous | Expansion bellows, anodes, others |

### Example Subdivision: Pressure Vessels (Table A.34)

| Subunit | Maintainable Items |
|---------|-------------------|
| Vessel | Shell, heads, nozzles, manways, supports |
| Internals | Trays, packing, demister, distributor, baffles |
| Control and monitoring | Sensors (level, pressure, temperature), valves, wiring |
| Miscellaneous | Insulation, coating/lining, anodes, others |

### Example Subdivision: Electric Motors (Table A.14)

| Subunit | Maintainable Items |
|---------|-------------------|
| Motor unit | Rotor, stator, radial bearing, thrust bearing, fan, frame/casing |
| Control and monitoring | Starter, contactor, overload relay, sensors, wiring |
| Lubrication system | Grease fittings, oil reservoir (if applicable), filter |
| Cooling system | Fan, air filter, heat exchanger (for large motors) |
| Miscellaneous | Terminal box, base plate, others |

### Example Subdivision: Switchgear (Table A.52)

| Subunit | Maintainable Items |
|---------|-------------------|
| Circuit breaker | Main contacts, arc chamber, operating mechanism, trip unit |
| Disconnector | Main contacts, operating mechanism, interlocks |
| Bus bar | Conductors, insulators, connections |
| Control and monitoring | Protection relay, metering, sensors, wiring, communication |
| Miscellaneous | Enclosure, ventilation, cable terminations, others |

### Example Subdivision: Fire & Gas Detectors (Table A.62)

| Subunit | Maintainable Items |
|---------|-------------------|
| Detector element | Sensing element, housing, mounting |
| Control unit | Logic processor, power supply, communication module |
| Connection means | Cabling, junction box, connectors |
| Miscellaneous | Weather protection, sunshield, others |

---

## 8. Failure Data Model

### Failure Record Structure (Table 6)

Every failure event SHALL be reported with the following fields:

| Category | Field | Required | Description |
|----------|-------|----------|-------------|
| **Identification** | Failure record | (*) | Unique failure record ID |
| | Equipment ID/Location | (*) | Tag number (see Table 5) |
| **Failure data** | Failure date | (*) | Date of failure detection (YYYY/MM/DD) |
| | Failure mode | (*) | Usually at equipment-unit level (Level 6) |
| | Failure impact on plant safety | Yes | Qualitative or quantitative consequence |
| | Failure impact on plant operations | Yes | Qualitative or quantitative consequence |
| | Failure impact on equipment function | (*) | **Critical**, **Degraded**, or **Incipient** |
| | Failure mechanism | Yes | Physical/chemical process (see Table B.2) |
| | Failure cause | Yes | Root cause category (see Table B.3) |
| | Subunit failed | Yes | Name of subunit (Level 7) |
| | Component/MI failed | Yes | Name of MI (Level 8) |
| | Detection method | Yes | How failure was discovered (see Table B.4) |
| | Operating condition at failure | (*) | Run-down, start-up, running, hot standby, idle, cold standby, testing |
| **Remarks** | Additional information | Yes | Free text on circumstances |

### Failure Impact Classification

| Impact Level | Code | Description |
|-------------|------|-------------|
| **Critical** | C | Complete loss of function |
| **Degraded** | D | Function degraded below acceptable limit |
| **Incipient** | I | Imperfection that is likely to result in functional failure if not corrected |

### Failure Mode Categories

Failure modes relate to three types:
1. **Desired function not obtained** (e.g., failure to start on demand)
2. **Specified function lost or outside limits** (e.g., spurious stop, high output, external leakage)
3. **Failure indication observed but no immediate critical impact** (e.g., initial wear, vibration, minor in-service problems)

See Annex B (Tables B.6-B.15) for normative failure mode codes per equipment category.

### Summary of Failure Mode Codes by Equipment Category

#### Rotating Equipment (Table B.6)

| Code | Failure Mode | Description |
|------|-------------|-------------|
| AIR | Abnormal instrument reading | Instrument reading known to be incorrect |
| BRD | Breakdown | Severe damage preventing function |
| ELP | External leakage - process medium | Leakage to external environment |
| ELU | External leakage - utility medium | Leakage of utility fluid |
| ERO | Erratic output | Fluctuating, unstable output |
| FTS | Fail to start on demand | Does not start when required |
| HIO | High output | Output above acceptable upper limit |
| INL | Internal leakage | Leakage across internal barrier |
| LOO | Low output | Output below acceptable lower limit |
| NOI | Noise | Abnormal noise |
| OHE | Overheating | Temperature above acceptable limit |
| PLU | Plugged/choked | Flow restricted/blocked |
| SER | Minor in-service problems | Loose items, discoloration, dirt |
| STD | Structural deficiency | Cracks, wear, material damage |
| UST | Spurious stop | Unexpected stop/shutdown |
| VIB | Vibration | Abnormal/excessive vibration |
| OTH | Other | Other failure modes |
| UNK | Unknown | Too little information |

#### Valves (Table B.8)

| Code | Failure Mode | Description |
|------|-------------|-------------|
| DOP | Delayed operation | Delayed response to command |
| ELP | External leakage - process | Leakage to external environment |
| ELU | External leakage - utility | Leakage of utility fluid |
| FTC | Fail to close on demand | Does not close when required |
| FTO | Fail to open on demand | Does not open when required |
| FTR | Fail to regulate | Cannot maintain setpoint |
| INL | Internal leakage | Leakage past closed position |
| PLU | Plugged/choked | Flow restricted/blocked |
| SER | Minor in-service problems | Loose items, discoloration, dirt |
| SPO | Spurious operation | Opens/closes without demand |
| STD | Structural deficiency | Cracks, corrosion, material damage |
| OTH | Other | Other failure modes |
| UNK | Unknown | Too little information |

---

## 9. Maintenance Data Model

### Maintenance Record Structure (Table 8)

| Category | Field | Required | Description |
|----------|-------|----------|-------------|
| **Identification** | Maintenance record | (*) | Unique maintenance ID |
| | Equipment ID/Location | (*) | Tag number |
| | Failure record | (*) | Corresponding failure ID (N/A for PM) |
| **Maintenance data** | Date of maintenance | (*) | Start date |
| | Maintenance category | (*) | **Corrective** or **Preventive** |
| | Maintenance priority | Yes | High, medium, or low |
| | Interval (planned) | Yes | Calendar or operating interval (PM only) |
| | Maintenance activity | Yes | Activity type (see Table B.5) |
| | Maintenance impact on plant operations | Yes | Zero, partial, or total |
| | Subunit maintained | Yes | Level 7 name |
| | Component/MI maintained | Yes | Level 8 name |
| | Spare part location | Yes | Local/distant, manufacturer |
| **Resources** | Man-hours per discipline | Yes | Mechanical, electrical, instrument, others |
| | Total man-hours | Yes | Total maintenance man-hours |
| | Equipment resources | Yes | Intervention vessel, crane, etc. |
| **Times** | Active maintenance time | (*) | Duration of active maintenance work |
| | Down time | (*) | Duration in down state |
| | Maintenance delays/problems | Yes | Logistics, weather, lack of spares, etc. |
| **Remarks** | Additional information | Yes | Free text |

### Maintenance Categories (Figure 6)

```
Maintenance
|
+-- Corrective Maintenance (after failure)
|   +-- Immediate
|   +-- Deferred
|
+-- Preventive Maintenance (before failure)
    +-- Condition-based (CBM)
    |   +-- Continuous monitoring
    |   +-- Periodic monitoring
    +-- Predetermined
    |   +-- Scheduled service
    |   +-- Periodic replacement
    +-- Periodic test (hidden failures)
    +-- Inspection
```

### Usefulness of Maintenance Data (Table 7)

| Data Category | Priority | Analysis Value |
|--------------|----------|----------------|
| Corrective maintenance | Required | Repair time (MTTRes/MRT), amount of CM, replacement/repair strategy |
| Actual preventive maintenance | Optional | Full lifetime story, total resources, total down time, PM effect on failure rate, CM/PM balance |
| Planned PM programme | Optional | Backlog tracking, programme updates based on experience |

---

## 10. Failure Mechanisms — Code Tables

Six major categories with subcodes (Table B.2):

### 1. Mechanical Failure

| Code | Notation | Description |
|------|----------|-------------|
| 1.0 | General | Mechanical defect, no further detail |
| 1.1 | Leakage | External/internal leakage (liquids or gases) |
| 1.2 | Vibration | Abnormal vibration |
| 1.3 | Clearance/alignment failure | Faulty clearance or alignment |
| 1.4 | Deformation | Distortion, bending, buckling, creeping |
| 1.5 | Looseness | Disconnection, loose items |
| 1.6 | Sticking | Sticking, seizure, jamming |

### 2. Material Failure

| Code | Notation | Description |
|------|----------|-------------|
| 2.0 | General | Material defect, no further detail |
| 2.1 | Cavitation | Relevant for pumps and valves |
| 2.2 | Corrosion | All types (wet electrochemical, dry chemical) |
| 2.3 | Erosion | Erosive wear |
| 2.4 | Wear | Abrasive/adhesive wear, scoring, galling, fretting |
| 2.5 | Breakage | Fracture, breach, crack |
| 2.6 | Fatigue | Breakage traced to fatigue |
| 2.7 | Overheating | Material damage due to overheating/burning |
| 2.8 | Burst | Item burst, blown, exploded, imploded |

### 3. Instrument Failure

| Code | Notation | Description |
|------|----------|-------------|
| 3.0 | General | Instrumentation failure, no detail |
| 3.1 | Control failure | No or faulty regulation |
| 3.2 | No signal/indication/alarm | No signal when expected |
| 3.3 | Faulty signal/indication/alarm | Wrong, spurious, intermittent, oscillating |
| 3.4 | Out of adjustment | Calibration error, parameter drift |
| 3.5 | Software error | Faulty control/monitoring due to software |
| 3.6 | Common cause/mode failure | Multiple instrument items failed simultaneously |

### 4. Electrical Failure

| Code | Notation | Description |
|------|----------|-------------|
| 4.0 | General | Electrical failure, no detail |
| 4.1 | Short circuiting | Short circuit |
| 4.2 | Open circuit | Disconnection, broken wire/cable |
| 4.3 | No power/voltage | Missing/insufficient power supply |
| 4.4 | Faulty power/voltage | Overvoltage, faulty supply |
| 4.5 | Earth/isolation fault | Earth fault, low electrical resistance |

### 5. External Influence

| Code | Notation | Description |
|------|----------|-------------|
| 5.0 | General | External event, no detail |
| 5.1 | Blockage/plugged | Fouling, contamination, icing, hydrates |
| 5.2 | Contamination | Contaminated fluid/gas/surface |
| 5.3 | Miscellaneous external | Foreign objects, impacts, environmental influence |

### 6. Miscellaneous

| Code | Notation | Description |
|------|----------|-------------|
| 6.0 | General | Does not fit other categories |
| 6.1 | No cause found | Investigated but not revealed |
| 6.2 | Combined causes | Several causes (code predominant one if possible) |
| 6.3 | Other | No code applicable — use free text |
| 6.4 | Unknown | No information available |

> **Guidance**: Always prefer subcodes (1.1, 1.2, etc.) over general category codes (1.0, 2.0, etc.). Avoid codes 6.3 and 6.4 when possible.

---

## 11. Failure Causes — Code Tables

Five categories (Table B.3) — intended to capture **root causes**:

### 1. Design-Related Causes

| Code | Notation | Description |
|------|----------|-------------|
| 1.0 | General | Inadequate design/configuration |
| 1.1 | Improper capacity | Inadequate dimensioning |
| 1.2 | Improper material | Wrong material selection |

### 2. Fabrication/Installation-Related

| Code | Notation | Description |
|------|----------|-------------|
| 2.0 | General | Fabrication or installation failure |
| 2.1 | Fabrication failure | Manufacturing/processing failure |
| 2.2 | Installation failure | Assembly failure (post-maintenance not included) |

### 3. Operation/Maintenance-Related

| Code | Notation | Description |
|------|----------|-------------|
| 3.0 | General | Operation/maintenance failure, no detail |
| 3.1 | Off-design service | Unintended service conditions |
| 3.2 | Operating error | Human error during operation |
| 3.3 | Maintenance error | Human error during maintenance |
| 3.4 | Expected wear and tear | Normal operational wear |

### 4. Management-Related

| Code | Notation | Description |
|------|----------|-------------|
| 4.0 | General | Management issue, no detail |
| 4.1 | Documentation error | Faulty procedures, specs, drawings |
| 4.2 | Management error | Planning, organization, QA failure |

### 5. Miscellaneous

| Code | Notation | Description |
|------|----------|-------------|
| 5.0 | General | Other causes |
| 5.1 | No cause found | Investigated, no cause revealed |
| 5.2 | Common cause | Common cause/mode |
| 5.3 | Combined causes | Several simultaneous causes |
| 5.4 | Other unit/cascading | Failure caused by another equipment failure |
| 5.5 | Other | Free text |
| 5.6 | Unknown | No information |

> **Important**: Failure cause is often unknown at initial recording. A Root Cause Analysis (RCA) may be needed, especially for failures with safety/environmental consequences, abnormally high rates, or high repair costs.

---

## 12. Detection Methods

Eleven categories (Table B.4):

| Code | Method | Description | Activity Type |
|------|--------|-------------|---------------|
| 1 | Periodic maintenance | During preventive service/overhaul | Scheduled |
| 2 | Functional testing | Activating function, comparing against standard | Scheduled |
| 3 | Inspection | Planned inspection (visual, NDT) | Scheduled |
| 4 | Periodic condition monitoring | Scheduled CBM (thermography, vibration, oil analysis) | Scheduled |
| 5 | Pressure testing | During pressure test | Scheduled |
| 6 | Continuous condition monitoring | Continuous surveillance of process parameters | Continuous |
| 7 | Production interference | Discovered by production upset/reduction | Casual |
| 8 | Casual observation | Routine/casual operator checks (noise, smell, leakage) | Casual |
| 9 | Corrective maintenance | Observed during corrective maintenance | Casual |
| 10 | On demand | Discovered during on-demand activation attempt | Casual |
| 11 | Other | Other method or combination | Other |

---

## 13. Maintenance Activities

Twelve codes (Table B.5):

| Code | Activity | Description | Typical Use |
|------|----------|-------------|-------------|
| 1 | Replace | Replacement with new/refurbished item of same type | C, P |
| 2 | Repair | Manual action to restore to original state (weld, plug, reconnect) | C |
| 3 | Modify | Replace/change with different type/material/design | C, P |
| 4 | Adjust | Bring out-of-tolerance into tolerance (align, calibrate, balance) | C, P |
| 5 | Refit | Minor repair/servicing (polish, clean, paint, lube, oil change) | C, P |
| 6 | Check | Failure investigated, no action or deferred. Regain function by restart/reset | C |
| 7 | Service | Periodic service: cleaning, replenishment, adjustments | P |
| 8 | Test | Periodic test of function or performance | P |
| 9 | Inspection | Periodic inspection/check with or without dismantling | P |
| 10 | Overhaul | Major comprehensive inspection/overhaul with extensive disassembly | C, P |
| 11 | Combination | Several activities combined | C, P |
| 12 | Other | Other maintenance activity | C, P |

> **C** = Corrective maintenance; **P** = Preventive maintenance

> **Priority rule**: When several activities are involved, "replace", "repair", "overhaul" and "modify" should have priority over "refit" and "adjust".

> **Note**: "Modification" is not a maintenance category but is often performed by maintenance personnel. A modification can influence reliability and performance.

---

## 14. Timeline & Operating Period Definitions

### State Definitions

```
Total Time
|
+-- Down Time
|   +-- Planned Down Time
|   |   +-- Preventive Maintenance (preparation + active PM + reserve)
|   |   +-- Other Planned Outages (modification, etc.)
|   +-- Unplanned Down Time
|       +-- Corrective Maintenance (preparation + repair)
|       +-- Other Unplanned Outages (shutdown problems, restrictions)
|
+-- Up Time
    +-- Operating Time
    |   +-- Running
    |   +-- Start-up
    |   +-- Run-down
    +-- Non-Operating Time
        +-- Hot Standby (ready for immediate operation = "operating")
        +-- Idle
        +-- Cold Standby (requires activities before ready = NOT operating)
```

### Key Definitions

| Term | Definition |
|------|-----------|
| **Surveillance period** | Calendar time period for RM data collection |
| **Operating time** | Time when equipment is performing its intended function |
| **Hot standby** | Ready for immediate operation = considered "operating" |
| **Cold standby** | Requires preparation before operation = NOT operating |
| **Down time** | Calendar time from equipment stop until reconnected to service after test |
| **Active maintenance time** | Calendar time during which maintenance work is actually performed |
| **Active repair time** | Effective time to achieve repair |

### Maintenance Time Breakdown

```
Down Time
|
+-- Preparation and/or delay (logistics, mobilization)
+-- Active maintenance time
|   +-- Fault diagnosis
|   +-- Repair action
|   +-- Testing (as required)
+-- Post-maintenance activities

Note: Active repair time <= Down time (normally)
Exception: Active repair time > Down time if maintenance performed while equipment operates
```

---

## 15. RM Parameters by Taxonomy Level

The relationship between recorded RM data and hierarchy levels (Table 3):

| Recorded RM Data | L4 Plant | L5 System | L6 Equipment | L7 Subunit | L8 MI |
|-----------------|:---:|:---:|:---:|:---:|:---:|
| Impact of failure on safety | X | | | | |
| Impact of maintenance on safety | X | | | | |
| Impact of failure on operations | X | (X) | | | |
| Impact of maintenance on operations | X | (X) | | | |
| Failure impact on equipment | | | X | (X) | (X) |
| Failure mode | | (X) | **X** | (X) | (X) |
| Failure mechanism | | (X) | (X) | **X** | |
| Failure cause | | | (X) | **X** | |
| Detection method | | (X) | **X** | (X) | (X) |
| Subunit failed | | | **X** | | |
| Component/MI failed | | | **X** | | |
| Down time | | (X) | (X) | **X** | |
| Active maintenance time | | | **X** | (X) | (X) |

> **X** = default level; **(X)** = possible alternative

---

## 16. Data Quality Requirements

### Characteristics of High-Quality Data

1. **Completeness** — data in relation to specification
2. **Compliance** — with definitions of reliability parameters, data types and formats
3. **Accuracy** — correct input, transfer, handling and storage
4. **Sufficient population** — adequate surveillance period for statistical confidence
5. **Relevance** — data relevant to the needs of the users

### Common Problems to Address

| Issue | Challenge |
|-------|-----------|
| **Source** | Data can be spread over several systems; carefully evaluate in planning |
| **Interpretation** | Source data can be interpreted differently; require training and quality checks |
| **Data format** | Use coded fields for consistency; supplement with free text |
| **Data collection method** | Use state-of-the-art conversion algorithms for automated transfer |
| **Competence** | Employ people with sufficient know-how; avoid low-competence personnel |

### Planning Measures (Before Collection)

1. Define the **objective** for collecting data
2. Investigate **data sources** to ensure relevant quality data are available
3. Define the **taxonomical information** for each equipment unit
4. Identify **installation date, population, operating periods**
5. Define **boundaries** for each equipment class
6. Apply **uniform failure definitions** and classification methods
7. Apply **uniform maintenance definitions** and classification methods

---

## 17. Practical Rules for Hierarchy Building

These rules are derived from ISO 14224 for use by the `build-equipment-hierarchy` skill:

### Rule 1: Always Follow the 9-Level Structure

Every equipment record MUST have data for Levels 1-6. Levels 7-8 are highly recommended. Level 9 is optional.

### Rule 2: Use Standard Classification Tables

- Level 3: Use Table A.1 categories
- Level 4: Use Table A.2 categories
- Level 5: Use Table A.3 system codes (S1-S97)
- Level 6: Use Table A.4 equipment class codes

### Rule 3: Define Boundaries Before Collecting Data

For every equipment class being registered, the boundary MUST be documented:
- What subunits/MIs are INSIDE the boundary
- What connected items are OUTSIDE
- How drivers/driven relationships are handled

### Rule 4: Avoid Overlapping Boundaries

If an instrument is included within a pump boundary, do NOT also register it as a separate instrument equipment class.

### Rule 5: Context Determines Level

The same physical item can appear at different levels depending on context:
- Valve as equipment class (Level 6) = topside standalone valve
- Valve as maintainable item (Level 8) = valve inside a gas turbine fuel system

### Rule 6: Mandatory Minimum Data Fields

The following fields are **mandatory** for every equipment record: Business category, Installation code/name, Plant/Unit category, Plant/Unit code, Section/System, Equipment class, Equipment type, Equipment ID (tag), Manufacturer's name, Normal operating state, Start date of current service, Surveillance time.

### Rule 7: Use Coded Fields

All categorical data MUST use standardized codes from the ISO 14224 tables. Free text supplements but does NOT replace codes.

### Rule 8: Track Both Tag and Serial Numbers

- **Tag number** = functional location (stays when equipment is swapped)
- **Serial number** = specific physical unit (changes when equipment is replaced)

### Rule 9: Link Driver and Driven Units

When equipment has a driver (e.g., electric motor driving a pump), register them as separate equipment records with a cross-reference.

### Rule 10: Include Subunit and MI Subdivisions

For each equipment class, use the standard subdivision tables from Annex A. Always include:
- At least the recommended subunits
- "Others" or "Unknown" category for items not listed
- Instrumentation as a maintainable item within the appropriate subunit

---

## 18. Mapping to Our Software Templates

### Template 01 — Equipment Hierarchy

| Template Column | ISO 14224 Source |
|----------------|-----------------|
| Industry | Level 1 |
| Business Category | Level 2 |
| Installation | Level 3 (Table A.1) |
| Plant/Unit | Level 4 (Table A.2) |
| Section/System | Level 5 (Table A.3, codes S1-S97) |
| Equipment Class | Level 6 (Table A.4, with code) |
| Equipment Type | Level 6 subtype |
| Tag Number | Equipment ID |
| Serial Number | Unique equipment identification |
| Manufacturer | Manufacturer's name |
| Model | Manufacturer's model designation |
| Commissioning Date | Initial commissioning date |
| Operating State | Normal operating state/mode |

### Template 03 — Failure Modes

| Template Column | ISO 14224 Source |
|----------------|-----------------|
| Equipment Class | Level 6 (Table A.4) |
| Failure Mode Code | Tables B.6-B.15 |
| Failure Mode Description | Tables B.6-B.15 |
| Failure Mechanism | Table B.2 |
| Failure Cause | Table B.3 |
| Detection Method | Table B.4 |
| Failure Impact | Critical / Degraded / Incipient |

### Template 06 — Work Order History

| Template Column | ISO 14224 Source |
|----------------|-----------------|
| Maintenance Category | Corrective / Preventive (Figure 6) |
| Maintenance Activity | Table B.5 (12 codes) |
| Subunit Maintained | Level 7 per Annex A |
| MI Maintained | Level 8 per Annex A |
| Active Maintenance Time | Figure 4 definition |
| Down Time | Figure 4 definition |
| Man-hours | Table 8 fields |

---

## Appendix A — Complete Equipment Class Catalogue

### Level 6 Equipment Classes (Table A.4)

#### Rotating Equipment (Category A.2.2)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Blowers and fans | BL | Centrifugal, axial | Not detailed |
| Centrifuges | CF | Decanter, disc | Not detailed |
| Combustion engines | CE | Diesel, gas, dual-fuel | A.2.2.1 |
| Compressors | CO | Centrifugal, reciprocating, screw, axial | A.2.2.2 |
| Electric generators | EG | Synchronous, induction | A.2.2.3 |
| Electric motors | EM | Induction, synchronous, DC | A.2.2.4 |
| Gas turbines | GT | Aeroderivative, industrial | A.2.2.5 |
| Liquid expanders | LE | Hydraulic turbine | Not detailed |
| Mixers | MI | Agitator | Not detailed |
| Pumps | PU | Centrifugal, reciprocating, rotary, axial | A.2.2.6 |
| Steam turbines | ST | Back-pressure, condensing, extraction | A.2.2.7 |
| Turbo expanders | TE | Centrifugal, axial | A.2.2.8 |

#### Mechanical Equipment (Category A.2.3)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Conveyors and elevators | CV | Belt, screw, bucket | Not detailed |
| Cranes | CR | Pedestal, overhead, gantry | A.2.3.1 |
| Filters and strainers | FS | Cartridge, bag, basket | Not detailed |
| Heat exchangers | HE | Shell-and-tube, plate, air-cooled | A.2.3.2 |
| Heaters and boilers | HB | Fired heater, waste heat recovery, boiler | A.2.3.3 |
| Loading arms | LA | Marine, road/rail | Not detailed |
| Onshore pipelines | PL | Carbon steel, alloy | Not detailed |
| Piping | PI | Carbon steel, stainless steel, alloy | A.2.3.5 |
| Pressure vessels | VE | Separator, scrubber, column, reactor | A.2.3.4 |
| Silos | SI | Bulk storage | Not detailed |
| Steam ejectors | SE | Single/multi-stage | Not detailed |
| Storage tanks | TA | Fixed roof, floating roof, pressurized | A.2.3.9 |
| Swivels | SW | Toroidal, in-line | A.2.3.8 |
| Turrets | TU | External, internal | A.2.3.7 |
| Winches | WI | Anchor handling, towing, mooring | A.2.3.6 |

#### Electrical Equipment (Category A.2.4)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Frequency converters | FC | VFD, soft starter | A.2.4.4 |
| Power cables and terminations | PC | LV, MV, HV | Not detailed |
| Power transformers | PT | Oil-filled, dry-type | A.2.4.2 |
| Switchgear | SG | Low voltage, medium voltage, high voltage | A.2.4.3 |
| Uninterruptible power supply | UP | Static, rotary | A.2.4.1 |

#### Safety and Control (Category A.2.5)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Control logic units | CL | PLC, DCS, SIS | A.2.5.3 |
| Emergency communication | EC | PA, radio, beacon | Not detailed |
| Escape/evacuation/rescue | ER | Lifeboat, life raft, chute | Not detailed |
| Fire and gas detectors | FG | Heat, smoke, flame, gas (combustible/toxic) | A.2.5.1 |
| Input devices (sensors) | ID | Pressure, temperature, level, flow, speed, vibration | A.2.5.4 |
| Lifeboats | LB | Free-fall, davit-launched | A.2.5.7 |
| Nozzles | NO | Deluge, sprinkler, monitor | A.2.5.6 |
| Valves | VA | Gate, globe, ball, butterfly, check, plug, needle | A.2.5.2 |

#### Subsea Equipment (Category A.2.6)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Flowlines | FL | Rigid, flexible | A.2.6.4 |
| Risers | RI | Rigid, flexible, hybrid | A.2.6.3 |
| Subsea compressors | SC | Centrifugal, helico-axial | A.2.6.8 |
| Subsea production control | SP | MCS, HPU, EPU | A.2.6.1 |
| Subsea pumps | SB | Centrifugal, twin-screw | A.2.6.7 |
| Subsea wellhead and X-mas trees | XT | Horizontal, vertical | A.2.6.2 |
| Umbilicals | UM | Static, dynamic | A.2.6.5 |
| Xmas tree connectors | XC | Collet, clamp | A.2.6.6 |

#### Well Completion Equipment (Category A.2.7)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Annulus safety valves (ASV) | AV | Flapper, ball | A.2.7.3 |
| Downhole safety valves (DHSV) | DV | SCSSV, SSCSV | A.2.7.2 |
| Electrical submersible pumps (ESP) | EP | Centrifugal, progressive cavity | A.2.7.6 |
| Gas-lift valves | GL | IPO, PPO | A.2.7.5 |
| Other well completion equipment | OW | Packer, sliding sleeve | A.2.7.4 |
| Surface wellhead and X-mas trees | WH | Conventional, compact | A.2.7.7 |
| Well completion tubing/casing | TC | Production tubing, casing | A.2.7.1 |

#### Drilling Equipment (Category A.2.8)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Drilling mud processing equipment | DM | Shale shaker, centrifuge, degasser | A.2.8.5 |
| Subsea BOP | SB | Annular, ram | A.2.8.1 |
| Surface BOP | SF | Annular, ram | A.2.8.2 |
| Top drives | TD | AC, hydraulic | A.2.8.3 |
| Drilling risers | DR | Marine, slimline | A.2.8.4 |

#### Well Intervention Equipment (Category A.2.9)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Surface well control equipment | WC | Stripper, lubricator | A.2.9.1 |
| Subsea well intervention (open water) | OI | ROV-based, riserless | A.2.9.2 |

#### Marine Equipment (Category A.2.10)

| Equipment Class | Code | Type Examples | Annex Section |
|----------------|------|---------------|---------------|
| Jacking and fixation | JF | Rack and pinion, hydraulic | A.2.10.1 |

---

## Appendix B — Complete Equipment Subdivision Examples

### Summary of Subunit Structure by Equipment Class

| Equipment Class | Code | Typical Subunits |
|----------------|------|-----------------|
| Compressors | CO | Compressor unit, Gear, Control & monitoring, Lubrication, Shaft seal, Cooling, Miscellaneous |
| Pumps | PU | Pump unit, Power transmission, Control & monitoring, Lubrication, Shaft seal, Miscellaneous |
| Gas turbines | GT | Air intake/exhaust, Compressor section, Combustion, Turbine section, Control & monitoring, Lubrication, Starting system, Fuel gas system, Shaft seal, Cooling, Power transmission, Miscellaneous |
| Electric motors | EM | Motor unit, Control & monitoring, Lubrication, Cooling, Miscellaneous |
| Electric generators | EG | Generator unit, Control & monitoring, Lubrication, Cooling, Excitation, Miscellaneous |
| Steam turbines | ST | Turbine unit, Gear, Control & monitoring, Lubrication, Shaft seal, Cooling, Miscellaneous |
| Combustion engines | CE | Engine block, Fuel system, Air intake/exhaust, Cooling, Lubrication, Starting, Control & monitoring, Power transmission, Miscellaneous |
| Turbo expanders | TE | Expander turbine, Control & monitoring, Lubrication, Shaft seal, Miscellaneous |
| Heat exchangers | HE | Heat transfer elements, Structural, Control & monitoring, Miscellaneous |
| Pressure vessels | VE | Vessel, Internals, Control & monitoring, Miscellaneous |
| Heaters and boilers | HB | Radiant section, Convection section, Burner, Stack, Control & monitoring, Fuel system, Miscellaneous |
| Piping | PI | Pipe, Fittings, Flanges, Supports, Miscellaneous |
| Storage tanks | TA | Shell/roof, Internal components, Foundation, Control & monitoring, Miscellaneous |
| Cranes | CR | Hoisting system, Boom/jib, Slewing, Travel/drive, Control & monitoring, Miscellaneous |
| Winches | WI | Drum, Drive, Brake, Control & monitoring, Miscellaneous |
| Valves | VA | Valve mechanics, Valve actuator, Control & monitoring, Miscellaneous |
| Fire & gas detectors | FG | Detector element, Control unit, Connection means, Miscellaneous |
| Input devices | ID | Sensor & electronics, Miscellaneous |
| Control logic units | CL | Logic processor, I/O module, Power supply, Communication, Miscellaneous |
| Switchgear | SG | Circuit breaker, Disconnector, Bus bar, Control & monitoring, Miscellaneous |
| Power transformers | PT | Winding, Core, Cooling, Bushings, Tap changer, Control & monitoring, Miscellaneous |
| UPS | UP | Rectifier/charger, Inverter, Battery, Static switch, Control & monitoring, Miscellaneous |
| Frequency converters | FC | Rectifier, DC link, Inverter, Control & monitoring, Cooling, Miscellaneous |
| Lifeboats | LB | Hull, Propulsion, Release mechanism, Life support, Control & monitoring, Miscellaneous |

---

## Quick Reference Card

### Minimum Required Data for Equipment Registration

```
MANDATORY FIELDS (marked * in ISO 14224):
+-- Business category (Level 2)
+-- Installation code/name (Level 3)
+-- Plant/Unit category (Level 4)
+-- Plant/Unit code/name (Level 4)
+-- Section/System (Level 5)
+-- Equipment class (Level 6)
+-- Equipment type (Level 6)
+-- Equipment ID / tag number (Level 6)
+-- Manufacturer's name (Level 6)
+-- Normal operating state/mode (Level 6)
+-- Start date of current service (Level 6)
+-- Surveillance time (Level 6)
```

### Minimum Required Data for Failure Recording

```
MANDATORY FIELDS (marked * in ISO 14224):
+-- Failure record ID
+-- Equipment ID / tag number
+-- Failure date
+-- Failure mode (at equipment-unit level)
+-- Failure impact on equipment function (Critical/Degraded/Incipient)
+-- Operating condition at failure
```

### Minimum Required Data for Maintenance Recording

```
MANDATORY FIELDS (marked * in ISO 14224):
+-- Maintenance record ID
+-- Equipment ID / tag number
+-- Failure record (for corrective maintenance)
+-- Date of maintenance
+-- Maintenance category (Corrective/Preventive)
+-- Active maintenance time
+-- Down time
```

---

> **Version**: 1.0
> **Based on**: BS EN ISO 14224:2016 (Third edition, corrected)
> **Created for**: OCP Maintenance AI — Reliability Agent & Hierarchy Skills
> **Skills that reference this document**: `build-equipment-hierarchy`, `validate-failure-modes`, `perform-fmeca`, `assess-criticality`, `resolve-equipment`, `import-data`, `export-data`, `suggest-materials`
