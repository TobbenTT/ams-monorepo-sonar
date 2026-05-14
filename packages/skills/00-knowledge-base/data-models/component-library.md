# Component Library Reference

> **Source**: `Libraries/component_library.json`  
> **Conversion Date**: 2026-02-23  
> **Version**: 1.0.0  
> **Component Count**: 30

## Used By Skills

- **suggest-materials** -- Component reference for material suggestions
- **build-equipment-hierarchy** -- Component type definitions for hierarchy construction

---

## Metadata

- **Description**: Standard Industrial Component Type Library — OCP Maintenance AI MVP
- **Source**: Industry data for phosphate beneficiation plants (OCP Group, Morocco)
- **FM Validation**: All failure modes validated against 72-combo VALID_FM_COMBINATIONS (SRC-09)
- **Cross Reference**: Components are referenced by equipment_library.json via component_lib_ref field

---

## Component Types Summary

| # | Component Type ID | Type | Category | Typical Life (hrs) | Failure Modes | Std Tasks |
|---|-------------------|------|----------|-------------------|---------------|-----------|
| 1 | CL-BEARING-SPHERICAL-ROLLER | SPHERICAL_ROLLER_BEARING | BEARINGS | 40,000 | 4 | 3 |
| 2 | CL-BEARING-CYLINDRICAL-ROLLER | CYLINDRICAL_ROLLER_BEARING | BEARINGS | 45,000 | 3 | 3 |
| 3 | CL-BEARING-DEEP-GROOVE-BALL | DEEP_GROOVE_BALL_BEARING | BEARINGS | 50,000 | 3 | 2 |
| 4 | CL-BEARING-THRUST | THRUST_BEARING | BEARINGS | 35,000 | 3 | 3 |
| 5 | CL-SEAL-MECHANICAL | MECHANICAL_SEAL | SEALS | 12,000 | 3 | 2 |
| 6 | CL-SEAL-GLAND-PACKING | GLAND_PACKING | SEALS | 4,000 | 3 | 2 |
| 7 | CL-SEAL-LIP | LIP_SEAL | SEALS | 20,000 | 3 | 2 |
| 8 | CL-SEAL-ORING | O_RING | SEALS | 15,000 | 3 | 2 |
| 9 | CL-MOTOR-LV | LOW_VOLTAGE_MOTOR | MOTORS | 60,000 | 4 | 4 |
| 10 | CL-MOTOR-HV | HIGH_VOLTAGE_MOTOR | MOTORS | 80,000 | 4 | 4 |
| 11 | CL-GEARBOX-HELICAL | HELICAL_GEARBOX | GEARBOXES | 80,000 | 3 | 3 |
| 12 | CL-GEARBOX-PLANETARY | PLANETARY_GEARBOX | GEARBOXES | 100,000 | 4 | 4 |
| 13 | CL-COUPLING-FLEX | FLEXIBLE_COUPLING | COUPLINGS | 40,000 | 3 | 3 |
| 14 | CL-COUPLING-RIGID | RIGID_COUPLING | COUPLINGS | 80,000 | 3 | 2 |
| 15 | CL-COUPLING-FLUID | FLUID_COUPLING | COUPLINGS | 60,000 | 3 | 3 |
| 16 | CL-IMPELLER-SLURRY | SLURRY_IMPELLER | IMPELLERS | 3,000 | 3 | 3 |
| 17 | CL-IMPELLER-PUMP | PUMP_IMPELLER | IMPELLERS | 30,000 | 3 | 2 |
| 18 | CL-IMPELLER-AGITATOR | AGITATOR_IMPELLER | IMPELLERS | 15,000 | 3 | 2 |
| 19 | CL-LINER-MILL | MILL_LINER | LINERS | 6,000 | 3 | 2 |
| 20 | CL-LINER-PUMP | PUMP_LINER | LINERS | 4,000 | 2 | 2 |
| 21 | CL-LINER-CHUTE | CHUTE_LINER | LINERS | 8,000 | 2 | 2 |
| 22 | CL-FILTER-CLOTH | FILTER_CLOTH | FILTERS | 3,000 | 3 | 3 |
| 23 | CL-FILTER-CARTRIDGE | FILTER_CARTRIDGE | FILTERS | 2,000 | 3 | 2 |
| 24 | CL-BELT-CONVEYOR | CONVEYOR_BELT | BELTS | 30,000 | 4 | 3 |
| 25 | CL-BELT-V | V_BELT | BELTS | 15,000 | 3 | 2 |
| 26 | CL-VALVE-GATE | GATE_VALVE | VALVES | 40,000 | 3 | 2 |
| 27 | CL-VALVE-BUTTERFLY | BUTTERFLY_VALVE | VALVES | 30,000 | 3 | 2 |
| 28 | CL-VALVE-CHECK | CHECK_VALVE | VALVES | 30,000 | 3 | 2 |
| 29 | CL-VALVE-PINCH | PINCH_VALVE | VALVES | 10,000 | 3 | 2 |
| 30 | CL-INSTR-PRESSURE | PRESSURE_TRANSMITTER | INSTRUMENTS | 80,000 | 3 | 3 |
| 31 | CL-INSTR-FLOW | FLOW_METER | INSTRUMENTS | 100,000 | 3 | 3 |
| 32 | CL-INSTR-TEMPERATURE | TEMPERATURE_SENSOR | INSTRUMENTS | 80,000 | 3 | 2 |
| 33 | CL-SENSOR-VIBRATION | VIBRATION_SENSOR | INSTRUMENTS | 60,000 | 3 | 2 |

---

## Detailed Component Definitions

### CL-BEARING-SPHERICAL-ROLLER: SPHERICAL_ROLLER_BEARING

- **Category**: BEARINGS
- **Description**: Self-aligning double-row roller bearing for heavy radial and axial loads. Common in crushers, mills, and conveyor pulleys in phosphate processing.
- **Manufacturers**: SKF, FAG, NSK, Timken
- **Common Models**: SKF 22328, SKF 23148, FAG 22330-E1-XL, NSK 23040, Timken 22334
- **Typical Life**: 40,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | BREAKDOWN_OF_LUBRICATION | 2.5 | 35,000 |
| WEARS | LUBRICANT_CONTAMINATION | 2.0 | 25,000 |
| OVERHEATS_MELTS | LACK_OF_LUBRICATION | 1.2 | 15,000 |
| CRACKS | CYCLIC_LOADING | 3.5 | 50,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Inspect bearing for noise, vibration, and temperature anomalies | 4 |
| LUBRICATE | Re-grease bearing per OEM specification | 12 |
| TEST | Vibration analysis — measure overall velocity and envelope acceleration | 8 |

---

### CL-BEARING-CYLINDRICAL-ROLLER: CYLINDRICAL_ROLLER_BEARING

- **Category**: BEARINGS
- **Description**: High radial load capacity roller bearing with line contact. Used in gearbox shafts and motor bearings in phosphate processing plants.
- **Manufacturers**: SKF, FAG, NSK, Timken
- **Common Models**: SKF NU2230, FAG NU330-E-XL, NSK NU328, Timken NU2234
- **Typical Life**: 45,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | BREAKDOWN_OF_LUBRICATION | 2.8 | 40,000 |
| OVERHEATS_MELTS | MECHANICAL_OVERLOAD | 1.5 | 30,000 |
| IMMOBILISED | LACK_OF_LUBRICATION | 1.1 | 20,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Inspect bearing for noise and vibration | 4 |
| LUBRICATE | Re-grease bearing per OEM specification | 12 |
| TEST | Vibration analysis — measure bearing defect frequencies | 8 |

---

### CL-BEARING-DEEP-GROOVE-BALL: DEEP_GROOVE_BALL_BEARING

- **Category**: BEARINGS
- **Description**: General purpose ball bearing for moderate radial and axial loads. Used in electric motors, pumps, and light-duty rotating equipment.
- **Manufacturers**: SKF, FAG, NSK, NTN
- **Common Models**: SKF 6328, FAG 6322, NSK 6324, NTN 6330
- **Typical Life**: 50,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | BREAKDOWN_OF_LUBRICATION | 2.5 | 45,000 |
| OVERHEATS_MELTS | LACK_OF_LUBRICATION | 1.3 | 25,000 |
| CRACKS | IMPACT_SHOCK_LOADING | 1.5 | 60,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Listen for bearing noise and check temperature | 4 |
| LUBRICATE | Re-grease or top-up oil per OEM specification | 16 |

---

### CL-BEARING-THRUST: THRUST_BEARING

- **Category**: BEARINGS
- **Description**: Axial load bearing for vertical shaft applications. Used in thickener drives, vertical pumps, and agitators in phosphate processing.
- **Manufacturers**: SKF, FAG, NSK, Timken
- **Common Models**: SKF 29434, FAG 29340-E1-XL, NSK 29428, Timken T911
- **Typical Life**: 35,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | MECHANICAL_OVERLOAD | 2.2 | 30,000 |
| OVERHEATS_MELTS | LACK_OF_LUBRICATION | 1.2 | 18,000 |
| WEARS | LUBRICANT_CONTAMINATION | 2.0 | 22,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check bearing temperature and axial clearance | 4 |
| LUBRICATE | Replenish lubricant per OEM specification | 8 |
| TEST | Vibration analysis focusing on axial measurements | 12 |

---

### CL-SEAL-MECHANICAL: MECHANICAL_SEAL

- **Category**: SEALS
- **Description**: Rotating mechanical face seal to prevent fluid leakage around pump shafts. Critical in slurry pumps and chemical pumps in phosphate processing.
- **Manufacturers**: John Crane, Flowserve, EagleBurgmann, AESSEAL
- **Common Models**: John Crane Type 21, Flowserve ISC2, EagleBurgmann MG1, AESSEAL CDSA
- **Typical Life**: 12,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | RELATIVE_MOVEMENT | 2.8 | 10,000 |
| DEGRADES | CHEMICAL_ATTACK | 1.5 | 8,000 |
| OVERHEATS_MELTS | LACK_OF_LUBRICATION | 1.3 | 6,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check seal for visible leakage and flush flow rate | 1 |
| REPLACE | Replace mechanical seal assembly | 52 |

---

### CL-SEAL-GLAND-PACKING: GLAND_PACKING

- **Category**: SEALS
- **Description**: Braided packing rings for shaft sealing in pumps and agitators. Economical alternative to mechanical seals for abrasive slurry service.
- **Manufacturers**: Garlock, Chesterton, Klinger, John Crane
- **Common Models**: Garlock 8921, Chesterton 1400, Klinger Top-Pack, John Crane Y2232
- **Typical Life**: 4,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | RELATIVE_MOVEMENT | 3.0 | 3,500 |
| DEGRADES | EXCESSIVE_TEMPERATURE | 2.0 | 3,000 |
| DEGRADES | CHEMICAL_ATTACK | 1.8 | 2,500 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check packing drip rate and adjust gland follower | 1 |
| REPLACE | Replace gland packing rings | 26 |

---

### CL-SEAL-LIP: LIP_SEAL

- **Category**: SEALS
- **Description**: Elastomeric radial shaft seal for oil retention and dust exclusion. Used in gearboxes, pillow blocks, and bearing housings.
- **Manufacturers**: SKF, Freudenberg, Trelleborg, NOK
- **Common Models**: SKF HMS5, Freudenberg Simrit, Trelleborg Turcon, NOK TC Type
- **Typical Life**: 20,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | RELATIVE_MOVEMENT | 3.2 | 18,000 |
| DEGRADES | AGE | 3.5 | 25,000 |
| DEGRADES | EXCESSIVE_TEMPERATURE | 2.0 | 15,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check for oil leakage at seal lips | 4 |
| REPLACE | Replace lip seal during bearing maintenance | 104 |

---

### CL-SEAL-ORING: O_RING

- **Category**: SEALS
- **Description**: Elastomeric static or dynamic O-ring seal for flanges, valve stems, and hydraulic connections. Wide material selection for phosphate processing environments.
- **Manufacturers**: Parker, Trelleborg, Freudenberg, James Walker
- **Common Models**: Parker N0674, Trelleborg Turcon, Freudenberg Merkel, James Walker Elring
- **Typical Life**: 15,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DEGRADES | AGE | 3.0 | 14,000 |
| DEGRADES | CHEMICAL_ATTACK | 1.8 | 10,000 |
| EXPIRES | AGE | 4.0 | 20,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check for visible leakage at O-ring locations | 4 |
| REPLACE | Replace O-ring during overhaul | 104 |

---

### CL-MOTOR-LV: LOW_VOLTAGE_MOTOR

- **Category**: MOTORS
- **Description**: Low voltage (<1kV) squirrel cage induction motor. Standard drive for pumps, conveyors, agitators, and fans up to 500kW in phosphate processing.
- **Manufacturers**: ABB, Siemens, WEG, Nidec
- **Common Models**: ABB M3BP 315, Siemens 1LE1, WEG W22 Premium, Nidec LSPM
- **Typical Life**: 60,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DEGRADES | AGE | 3.0 | 55,000 |
| THERMALLY_OVERLOADS | OVERCURRENT | 1.0 | 40,000 |
| OVERHEATS_MELTS | CONTAMINATION | 1.2 | 30,000 |
| DEGRADES | EXCESSIVE_TEMPERATURE | 1.5 | 35,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check motor current draw, temperature, and vibration | 4 |
| TEST | Measure motor winding insulation resistance (megger test) | 52 |
| LUBRICATE | Re-grease motor bearings per OEM specification | 26 |
| CLEAN | Clean motor cooling fins and air intake | 12 |

---

### CL-MOTOR-HV: HIGH_VOLTAGE_MOTOR

- **Category**: MOTORS
- **Description**: High voltage (3.3kV-11kV) squirrel cage or wound rotor motor for heavy-duty applications. Used on SAG mills, ball mills, crushers, and large compressors.
- **Manufacturers**: ABB, Siemens, WEG, Teco-Westinghouse
- **Common Models**: ABB AXR 500, Siemens H-compact PLUS, WEG HGF, TECO AEHF
- **Typical Life**: 80,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DEGRADES | AGE | 3.2 | 70,000 |
| THERMALLY_OVERLOADS | OVERCURRENT | 1.0 | 50,000 |
| OVERHEATS_MELTS | CONTAMINATION | 1.2 | 40,000 |
| SHORT_CIRCUITS | BREAKDOWN_IN_INSULATION | 2.0 | 60,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Monitor motor current, temperature, and vibration | 4 |
| TEST | Measure motor winding insulation resistance and polarization index | 26 |
| TEST | Partial discharge measurement on stator windings | 52 |
| LUBRICATE | Re-grease motor bearings per OEM specification | 12 |

---

### CL-GEARBOX-HELICAL: HELICAL_GEARBOX

- **Category**: GEARBOXES
- **Description**: Parallel shaft helical gear reducer for conveyors, agitators, and medium-duty mill drives. Robust design for continuous phosphate processing service.
- **Manufacturers**: SEW Eurodrive, Flender (Siemens), Nord, Bonfiglioli
- **Common Models**: SEW MC Series, Flender FZG, Nord Maxxdrive, Bonfiglioli HDO
- **Typical Life**: 80,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | METAL_TO_METAL_CONTACT | 2.8 | 70,000 |
| WEARS | BREAKDOWN_OF_LUBRICATION | 2.5 | 60,000 |
| DEGRADES | AGE | 3.5 | 50,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check gearbox oil level, temperature, and listen for abnormal noise | 4 |
| INSPECT | Analyze oil sample for wear metals and contamination | 12 |
| REPLACE | Change gearbox oil | 52 |

---

### CL-GEARBOX-PLANETARY: PLANETARY_GEARBOX

- **Category**: GEARBOXES
- **Description**: Epicyclic planetary gear reducer for high torque, compact applications. Used on SAG mill, ball mill, and thickener drives.
- **Manufacturers**: Flender (Siemens), David Brown (Textron), SEW Eurodrive, Bonfiglioli
- **Common Models**: Flender PEAG, David Brown Series M, SEW P Series, Bonfiglioli 300 Series
- **Typical Life**: 100,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | METAL_TO_METAL_CONTACT | 2.5 | 80,000 |
| WEARS | BREAKDOWN_OF_LUBRICATION | 2.2 | 70,000 |
| CRACKS | CYCLIC_LOADING | 2.0 | 90,000 |
| DEGRADES | AGE | 3.5 | 60,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check gearbox oil level, temperature, and vibration | 4 |
| INSPECT | Analyze oil sample for wear metals and particle count | 12 |
| REPLACE | Change gearbox oil | 52 |
| REPLACE | Replace gearbox seals | 104 |

---

### CL-COUPLING-FLEX: FLEXIBLE_COUPLING

- **Category**: COUPLINGS
- **Description**: Elastomeric element flexible coupling for misalignment compensation. Used between motors and gearboxes/pumps throughout phosphate processing plants.
- **Manufacturers**: Rexnord Falk, Voith, Regal Rexnord, KTR
- **Common Models**: Falk Steelflex, Voith Turbo, Rexnord Omega, KTR Rotex
- **Typical Life**: 40,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DEGRADES | AGE | 3.0 | 35,000 |
| LOOSES_PRELOAD | VIBRATION | 1.1 | 25,000 |
| BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | 1.5 | 50,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Inspect coupling alignment and element condition | 12 |
| INSPECT | Check coupling bolt torque | 26 |
| REPLACE | Replace coupling flex element | 156 |

---

### CL-COUPLING-RIGID: RIGID_COUPLING

- **Category**: COUPLINGS
- **Description**: Rigid flange or sleeve coupling for precision aligned shafts. Used where zero misalignment tolerance is required.
- **Manufacturers**: Regal Rexnord, Lovejoy, Ringfeder, Ruland
- **Common Models**: Rexnord 7300 Flange, Lovejoy Sleeve, Ringfeder RFN, Ruland SC Series
- **Typical Life**: 80,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| LOOSES_PRELOAD | VIBRATION | 1.2 | 30,000 |
| CRACKS | CYCLIC_LOADING | 2.0 | 70,000 |
| BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | 1.3 | 80,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check coupling bolt torque and alignment | 12 |
| TEST | Laser alignment check | 52 |

---

### CL-COUPLING-FLUID: FLUID_COUPLING

- **Category**: COUPLINGS
- **Description**: Hydrodynamic fluid coupling for soft-start and overload protection. Used on conveyors and crusher drives in phosphate processing.
- **Manufacturers**: Voith, Rexnord, Fluidomat, Transfluid
- **Common Models**: Voith TVV, Voith DTPKW, Fluidomat KPTO, Transfluid KSL
- **Typical Life**: 60,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| OVERHEATS_MELTS | MECHANICAL_OVERLOAD | 1.5 | 40,000 |
| DEGRADES | AGE | 3.0 | 50,000 |
| WEARS | RELATIVE_MOVEMENT | 2.5 | 55,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check fluid coupling oil level and temperature | 4 |
| REPLACE | Change coupling fluid | 52 |
| INSPECT | Inspect fusible plug condition | 12 |

---

### CL-IMPELLER-SLURRY: SLURRY_IMPELLER

- **Category**: IMPELLERS
- **Description**: High-chrome or rubber-lined impeller for slurry pump service. Subject to extreme abrasive wear in phosphate slurry applications.
- **Manufacturers**: Weir Minerals, Metso Outotec, KSB, Schurco Slurry
- **Common Models**: Warman AH Series, Metso HH Series, KSB GIW, Schurco S Series
- **Typical Life**: 3,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.8 | 2,500 |
| CORRODES | CHEMICAL_ATTACK | 1.8 | 4,000 |
| WEARS | IMPACT_SHOCK_LOADING | 2.5 | 3,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Monitor pump discharge pressure and flow for impeller wear | 1 |
| INSPECT | Visual inspection of impeller during pump overhaul | 12 |
| REPLACE | Replace slurry impeller | 26 |

---

### CL-IMPELLER-PUMP: PUMP_IMPELLER

- **Category**: IMPELLERS
- **Description**: Cast or machined impeller for clear water or chemical service centrifugal pumps. Used in phosphate processing utility systems.
- **Manufacturers**: KSB, Sulzer, Grundfos, Flowserve
- **Common Models**: KSB Etanorm, Sulzer CPE, Grundfos CR, Flowserve D Series
- **Typical Life**: 30,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.5 | 25,000 |
| CORRODES | CHEMICAL_ATTACK | 2.0 | 20,000 |
| WEARS | ENTRAINED_AIR | 1.5 | 18,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Monitor pump head and flow for performance degradation | 4 |
| INSPECT | Inspect impeller condition during pump overhaul | 52 |

---

### CL-IMPELLER-AGITATOR: AGITATOR_IMPELLER

- **Category**: IMPELLERS
- **Description**: Turbine or propeller type impeller for agitator and flotation cell mixing applications. Subjected to corrosive slurry environments.
- **Manufacturers**: Lightnin (SPX), EKATO, Milton Roy, NOV
- **Common Models**: Lightnin A310, EKATO Paravisc, Milton Roy Mixing, NOV Chemineer
- **Typical Life**: 15,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| CORRODES | CHEMICAL_ATTACK | 1.8 | 12,000 |
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.5 | 14,000 |
| CRACKS | CYCLIC_LOADING | 2.0 | 20,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Inspect impeller condition during planned shutdown | 26 |
| REPLACE | Replace agitator impeller | 78 |

---

### CL-LINER-MILL: MILL_LINER

- **Category**: LINERS
- **Description**: High-chrome or rubber-steel composite liner for SAG, ball, and rod mills. Critical wear component in phosphate grinding circuits.
- **Manufacturers**: Metso Outotec, FLSmidth, ME Elecmetal, Tega Industries
- **Common Models**: Metso Megaliner, FLSmidth Raptor, ME Elecmetal Maxiliner, Tega IntelliLiner
- **Typical Life**: 6,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | IMPACT_SHOCK_LOADING | 3.8 | 5,000 |
| CRACKS | IMPACT_SHOCK_LOADING | 1.5 | 8,000 |
| BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | 1.3 | 10,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Measure liner thickness using ultrasonic testing | 12 |
| REPLACE | Replace mill liners during reline shutdown | 52 |

---

### CL-LINER-PUMP: PUMP_LINER

- **Category**: LINERS
- **Description**: High-chrome or elastomer liner for slurry pump volute and suction. Protects pump casing from abrasive slurry wear.
- **Manufacturers**: Weir Minerals, Metso Outotec, KSB, Schurco Slurry
- **Common Models**: Warman Frame Plate Liner, Metso HH Liner, KSB GIW Liner, Schurco Liner
- **Typical Life**: 4,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | EXCESSIVE_FLUID_VELOCITY | 3.0 | 3,500 |
| CORRODES | CHEMICAL_ATTACK | 1.8 | 5,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Monitor pump performance for liner wear indication | 1 |
| REPLACE | Replace pump volute liner | 26 |

---

### CL-LINER-CHUTE: CHUTE_LINER

- **Category**: LINERS
- **Description**: Ceramic, rubber, or AR steel liner for transfer chutes and hoppers. Protects structural steel from abrasive ore flow.
- **Manufacturers**: Tega Industries, CMP (Bradken), Multotec, Kingfisher
- **Common Models**: Tega Tufline, CMP ChromeClad, Multotec Maxflo, Kingfisher Ceramic
- **Typical Life**: 8,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | IMPACT_SHOCK_LOADING | 3.0 | 7,000 |
| BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | 1.5 | 12,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Inspect chute liner wear and bolt integrity | 12 |
| REPLACE | Replace chute liner sections | 52 |

---

### CL-FILTER-CLOTH: FILTER_CLOTH

- **Category**: FILTERS
- **Description**: Woven polypropylene or polyester filter cloth for belt filters and drum filters. Key consumable in phosphate dewatering circuits.
- **Manufacturers**: Clear Edge Filtration, Sefar, Andritz, GKD
- **Common Models**: Clear Edge CE750, Sefar Tetex, Andritz AG, GKD Filterweave
- **Typical Life**: 3,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DEGRADES | CHEMICAL_ATTACK | 3.0 | 2,500 |
| BLOCKS | CONTAMINATION | 1.0 | 1,500 |
| WEARS | RELATIVE_MOVEMENT | 2.5 | 3,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check filter cake moisture and cloth condition | 1 |
| CLEAN | Wash filter cloth with high-pressure spray | 1 |
| REPLACE | Replace filter cloth | 26 |

---

### CL-FILTER-CARTRIDGE: FILTER_CARTRIDGE

- **Category**: FILTERS
- **Description**: Pleated or wound cartridge filter element for hydraulic oil, lube oil, and process water filtration. Essential for equipment protection.
- **Manufacturers**: Pall, Parker Hannifin, Hydac, Donaldson
- **Common Models**: Pall HC9800, Parker 937396Q, Hydac 0660R, Donaldson P171580
- **Typical Life**: 2,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| BLOCKS | CONTAMINATION | 2.5 | 1,800 |
| DEGRADES | CHEMICAL_ATTACK | 2.0 | 3,000 |
| EXPIRES | AGE | 4.0 | 4,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check differential pressure across filter element | 1 |
| REPLACE | Replace filter cartridge element | 12 |

---

### CL-BELT-CONVEYOR: CONVEYOR_BELT

- **Category**: BELTS
- **Description**: Multi-ply fabric or steel cord reinforced rubber belt for bulk material transport. Primary material handling element in phosphate processing.
- **Manufacturers**: Continental, Fenner Dunlop, Bridgestone, Goodyear
- **Common Models**: Continental Forte, Fenner Dunlop Ultra-X, Bridgestone BRECOflex, Goodyear Guardian HP
- **Typical Life**: 30,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | RELATIVE_MOVEMENT | 2.5 | 25,000 |
| SEVERS | IMPACT_SHOCK_LOADING | 1.2 | 40,000 |
| DEGRADES | AGE | 3.0 | 35,000 |
| BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | 1.3 | 50,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Walk belt line and inspect for damage, tracking, and splice condition | 1 |
| INSPECT | Measure belt cover thickness | 12 |
| INSPECT | Splice inspection using X-ray or rip detection scan | 26 |

---

### CL-BELT-V: V_BELT

- **Category**: BELTS
- **Description**: V-belt or banded V-belt for fan, pump, and small equipment drives. Simple and economical power transmission element.
- **Manufacturers**: Gates, Continental, Optibelt, Dunlop
- **Common Models**: Gates Super HC, Continental Conti-V, Optibelt Red Power 3, Dunlop Hi-Power
- **Typical Life**: 15,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | RELATIVE_MOVEMENT | 3.0 | 12,000 |
| DEGRADES | AGE | 3.5 | 15,000 |
| BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | 1.5 | 20,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check belt tension and condition | 4 |
| REPLACE | Replace V-belt set | 78 |

---

### CL-VALVE-GATE: GATE_VALVE

- **Category**: VALVES
- **Description**: Full-bore gate valve for isolation service in slurry and water piping. Common throughout phosphate processing pipe networks.
- **Manufacturers**: Weir Minerals, Flowserve, KSB, AVK
- **Common Models**: Weir Isogate, Flowserve Edward, KSB SISTO, AVK Series 36
- **Typical Life**: 40,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.5 | 35,000 |
| CORRODES | CORROSIVE_ENVIRONMENT | 2.0 | 30,000 |
| IMMOBILISED | CONTAMINATION | 1.2 | 20,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Stroke valve to verify operation and check for leakage | 12 |
| LUBRICATE | Lubricate valve stem and gland packing | 12 |

---

### CL-VALVE-BUTTERFLY: BUTTERFLY_VALVE

- **Category**: VALVES
- **Description**: Quarter-turn butterfly valve for throttling and isolation service. Used in slurry, water, and reagent systems in phosphate processing.
- **Manufacturers**: Weir Minerals, Metso Outotec (Neles), Flowserve (Limitorque), Bray
- **Common Models**: Weir BDK, Neles Jamesbury, Flowserve Durco, Bray Series 31
- **Typical Life**: 30,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.5 | 25,000 |
| DEGRADES | CHEMICAL_ATTACK | 1.8 | 20,000 |
| CORRODES | CORROSIVE_ENVIRONMENT | 2.0 | 25,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Stroke valve and check seat leakage | 12 |
| INSPECT | Check actuator operation and limit switches | 26 |

---

### CL-VALVE-CHECK: CHECK_VALVE

- **Category**: VALVES
- **Description**: Non-return check valve for preventing backflow in pump discharge and process piping. Critical for protecting pumps from reverse flow.
- **Manufacturers**: Weir Minerals, Flowserve, KSB, Crane
- **Common Models**: Weir Isogate Check, Flowserve Edward Check, KSB BOA-RVK, Crane Duo-Chek
- **Typical Life**: 30,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | IMPACT_SHOCK_LOADING | 2.5 | 25,000 |
| IMMOBILISED | CONTAMINATION | 1.2 | 15,000 |
| CORRODES | CORROSIVE_ENVIRONMENT | 2.0 | 30,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Verify check valve closes properly — no backflow | 12 |
| INSPECT | Inspect valve internals during planned shutdown | 52 |

---

### CL-VALVE-PINCH: PINCH_VALVE

- **Category**: VALVES
- **Description**: Elastomeric sleeve pinch valve for slurry isolation and throttling. Ideal for highly abrasive phosphate slurry applications.
- **Manufacturers**: Weir Minerals, Red Valve, Flowrox, AKO
- **Common Models**: Weir Isogate WS, Red Valve Series 5200, Flowrox PVE, AKO VMC
- **Typical Life**: 10,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.8 | 8,000 |
| DEGRADES | CHEMICAL_ATTACK | 2.0 | 9,000 |
| DEGRADES | AGE | 3.0 | 12,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| INSPECT | Check pinch valve sleeve condition and leakage | 4 |
| REPLACE | Replace pinch valve sleeve | 52 |

---

### CL-INSTR-PRESSURE: PRESSURE_TRANSMITTER

- **Category**: INSTRUMENTS
- **Description**: Electronic pressure transmitter for process monitoring and control. 4-20mA or HART output for DCS/PLC integration.
- **Manufacturers**: Endress+Hauser, Emerson (Rosemount), Siemens, ABB
- **Common Models**: Rosemount 3051, E+H Cerabar PMP71, Siemens Sitrans P, ABB 2600T
- **Typical Life**: 80,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DRIFTS | USE | 1.0 | 50,000 |
| BLOCKS | CONTAMINATION | 1.2 | 30,000 |
| DEGRADES | EXCESSIVE_TEMPERATURE | 1.5 | 60,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| CALIBRATE | Calibrate pressure transmitter against reference standard | 52 |
| INSPECT | Check impulse lines for blockage and leaks | 12 |
| CLEAN | Clean diaphragm and process connection | 26 |

---

### CL-INSTR-FLOW: FLOW_METER

- **Category**: INSTRUMENTS
- **Description**: Electromagnetic or ultrasonic flow meter for slurry and process water measurement. Essential for process control in phosphate beneficiation.
- **Manufacturers**: Endress+Hauser, Emerson (Rosemount), Krohne, ABB
- **Common Models**: E+H Promag W 400, Rosemount 8750W, Krohne Optiflux 2300, ABB ProcessMaster
- **Typical Life**: 100,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DRIFTS | USE | 1.0 | 70,000 |
| DEGRADES | CHEMICAL_ATTACK | 2.0 | 60,000 |
| WEARS | EXCESSIVE_FLUID_VELOCITY | 2.5 | 80,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| CALIBRATE | Verify flow meter accuracy against reference | 52 |
| INSPECT | Check electrode condition and liner wear | 26 |
| CLEAN | Clean electrode surfaces | 26 |

---

### CL-INSTR-TEMPERATURE: TEMPERATURE_SENSOR

- **Category**: INSTRUMENTS
- **Description**: RTD or thermocouple temperature sensor with thermowell for process and equipment temperature monitoring.
- **Manufacturers**: Endress+Hauser, Emerson (Rosemount), WIKA, Jumo
- **Common Models**: E+H iTHERM TM411, Rosemount 0065, WIKA TR10, Jumo 902150
- **Typical Life**: 80,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DRIFTS | USE | 1.0 | 60,000 |
| OPEN_CIRCUIT | ELECTRICAL_OVERLOAD | 1.2 | 70,000 |
| DEGRADES | EXCESSIVE_TEMPERATURE | 1.5 | 50,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| CALIBRATE | Calibrate temperature sensor against reference thermometer | 52 |
| INSPECT | Check thermowell for corrosion and erosion | 26 |

---

### CL-SENSOR-VIBRATION: VIBRATION_SENSOR

- **Category**: INSTRUMENTS
- **Description**: Piezoelectric accelerometer or velocity sensor for continuous vibration monitoring of rotating equipment.
- **Manufacturers**: SKF, Emerson (CSI), Bruel & Kjaer, PCB Piezotronics
- **Common Models**: SKF CMSS 2200, Emerson CSI 9210, B&K 4507, PCB 622B01
- **Typical Life**: 60,000 hours

**Failure Modes:**

| Mechanism | Cause | Weibull Beta | Weibull Eta (hrs) |
|-----------|-------|-------------|-------------------|
| DRIFTS | USE | 1.0 | 50,000 |
| OPEN_CIRCUIT | ELECTRICAL_OVERLOAD | 1.2 | 60,000 |
| DEGRADES | EXCESSIVE_TEMPERATURE | 1.5 | 40,000 |

**Standard Tasks:**

| Task Type | Description | Frequency (weeks) |
|-----------|-------------|-------------------|
| CALIBRATE | Calibrate vibration sensor against reference source | 52 |
| INSPECT | Check sensor mounting, cable, and signal integrity | 12 |

---
