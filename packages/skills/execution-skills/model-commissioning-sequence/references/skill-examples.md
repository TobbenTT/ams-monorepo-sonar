# Examples - model-commissioning-sequence

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Mining Concentrator Commissioning Sequence

```
COMMISSIONING SEQUENCE MODEL - Cerro Alto Copper Concentrator
================================================================
Project Code: CA-2026    |    Total Systems: 12
Total Activities: 2,840  |    Duration: 26 weeks (MC to Commercial Ops)
Critical Path: 182 days  |    Float on CP: 0 days

COMMISSIONING SEQUENCE (System Level):
  Week 1-4:   UTILITY SYSTEMS
    SYS-UTIL-PWR  Electrical Power Distribution     [CRITICAL PATH]
    SYS-UTIL-AIR  Compressed Air System
    SYS-UTIL-WAT  Process & Potable Water
    SYS-UTIL-N2   Nitrogen Supply System

  Week 3-8:   PRIMARY PROCESS
    SYS-100-CRUSH Primary Crushing                   [CRITICAL PATH]
    SYS-100-CONV  Conveying Systems
    SYS-100-STOCK Stockpile & Reclaim

  Week 6-14:  SECONDARY PROCESS
    SYS-200-GRIND SAG & Ball Mill Grinding           [CRITICAL PATH]
    SYS-200-CLASS Classification & Cyclones

  Week 10-18: TERTIARY PROCESS
    SYS-300-FLOAT Rougher/Cleaner Flotation          [CRITICAL PATH]
    SYS-300-REAG  Reagent Systems

  Week 14-22: PRODUCT HANDLING
    SYS-400-THICK Thickening & Filtration             [CRITICAL PATH]
    SYS-400-TAIL  Tailings Management

  Week 18-26: PERFORMANCE TESTING & TCCC
    Integrated system testing
    72-hour performance guarantee test
    TCCC certificate and handover                     [CRITICAL PATH]

CRITICAL PATH ANALYSIS:
  Path: PWR -> CRUSH -> GRIND -> FLOAT -> THICK -> TCCC
  Duration: 182 days (26 weeks)
  Key Risks:
    1. SAG Mill liner installation delay (Impact: 14 days)
    2. Flotation cell vendor support window conflict (Impact: 7 days)
    3. Power utility connection delayed by utility provider (Impact: 21 days)

RESOURCE SUMMARY:
  Peak commissioning crew: 85 persons (Week 10-14)
  Vendor support windows: 8 vendors, 42 vendor-weeks total
  Operations support: 24 operators from Week 8 onward
```

### Example 2: Gas Processing Plant Commissioning Sequence

```
COMMISSIONING SEQUENCE MODEL - Atacama Gas Processing Facility
================================================================
Project Code: AGP-2026   |    Total Systems: 18
Total Activities: 4,120  |    Duration: 34 weeks (MC to Commercial Ops)
Critical Path: 238 days  |    Float on CP: 0 days

COMMISSIONING SEQUENCE (System Level):
  Week 1-6:   UTILITY & SAFETY SYSTEMS
    SYS-U01  Electrical Power (69kV/4.16kV/480V)     [CRITICAL PATH]
    SYS-U02  Instrument Air / Plant Air
    SYS-U03  Cooling Water (Open & Closed Loop)
    SYS-U04  Fire Protection (Firewater, Foam, Gas)    [SAFETY - PARALLEL]
    SYS-U05  Emergency Shutdown System (ESD/F&G)       [SAFETY - PARALLEL]

  Week 5-12:  FRONT-END PROCESS
    SYS-P01  Inlet Gas Receiving & Slug Catcher       [CRITICAL PATH]
    SYS-P02  Inlet Compression
    SYS-P03  Gas Treating (Amine System)               [CRITICAL PATH]

  Week 10-18: CORE PROCESS
    SYS-P04  Molecular Sieve Dehydration               [CRITICAL PATH]
    SYS-P05  Turboexpander / Demethanizer
    SYS-P06  NGL Fractionation Train                   [CRITICAL PATH]
    SYS-P07  Sales Gas Compression & Metering

  Week 16-24: PRODUCT & UTILITIES
    SYS-P08  LPG Storage & Loading
    SYS-P09  Condensate Stabilization & Storage
    SYS-P10  Flare & Blowdown System
    SYS-P11  Hot Oil System
    SYS-P12  Chemical Injection Systems
    SYS-P13  Produced Water Treatment

  Week 22-34: INTEGRATED TESTING & TCCC
    Nitrogen purge and inerting
    Hydrocarbon introduction (controlled feed-in)      [CRITICAL PATH]
    72-hour sustained operation demonstration
    Performance guarantee testing (14 days)
    TCCC and handover to operations                    [CRITICAL PATH]

PREREQUISITE DEPENDENCY HIGHLIGHTS:
  +--------------------+-------------------+---------------------+
  | Dependent System   | Prerequisite      | Type                |
  +--------------------+-------------------+---------------------+
  | P01 Inlet Gas      | U01 Power         | Utility             |
  | P01 Inlet Gas      | U04 Fire Prot.    | Safety (MANDATORY)  |
  | P01 Inlet Gas      | U05 ESD/F&G       | Safety (MANDATORY)  |
  | P03 Gas Treating   | P01 Inlet Gas     | Process             |
  | P03 Gas Treating   | U03 Cooling Water | Utility             |
  | P04 Mol Sieve      | P03 Gas Treating  | Process             |
  | P06 NGL Frac       | P04 Mol Sieve     | Process             |
  | P06 NGL Frac       | P11 Hot Oil       | Utility             |
  | HC Introduction    | ALL safety systems| Safety (MANDATORY)  |
  | HC Introduction    | PSSR Approved     | Regulatory          |
  +--------------------+-------------------+---------------------+

VENDOR SUPPORT MATRIX:
  +-------------------+----------+---------+-------+----------+
  | Vendor            | System   | Arrive  | Weeks | Status   |
  +-------------------+----------+---------+-------+----------+
  | Siemens           | U01,P02  | Week 3  | 6     | Confirmed|
  | BASF Amine        | P03      | Week 8  | 4     | Confirmed|
  | UOP Mol Sieve     | P04      | Week 12 | 3     | Pending  |
  | Atlas Copco       | P02,P07  | Week 7  | 5     | Confirmed|
  | Honeywell DCS     | ALL      | Week 1  | 20    | Confirmed|
  | Cameron Valves    | P01,P10  | Week 6  | 3     | At Risk  |
  +-------------------+----------+---------+-------+----------+
  ACTION: Cameron Valves at risk due to factory delay.
  Mitigation: Pre-position backup valve technician from local service center.
```
