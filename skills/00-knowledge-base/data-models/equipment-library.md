# Equipment Library Reference

> **Source**: `Libraries/equipment_library.json`  
> **Conversion Date**: 2026-02-23  
> **Version**: 1.0.0  
> **Equipment Count**: 15

## Used By Skills

- **resolve-equipment** -- Equipment type resolution and identification
- **build-equipment-hierarchy** -- Equipment type definitions for hierarchy construction

---

## Metadata

- **Description**: Phosphate Processing Equipment Type Library — OCP Maintenance AI MVP
- **Source**: Industry data for phosphate beneficiation plants (OCP Group, Morocco)
- **FM Validation**: All failure modes validated against 72-combo VALID_FM_COMBINATIONS (SRC-09)

---

## Equipment Types Summary

| # | ID | Name | Name (FR) | Category | Tag Convention | Power (kW) | Weight (kg) | Op Hrs/Year | Life (years) | Criticality | Sub-Assemblies |
|---|----|------|-----------|----------|----------------|-----------|-------------|-------------|-------------|-------------|----------------|
| 1 | ET-SAG-MILL | SAG Mill | Broyeur SAG | MILL | `{area}-SAG-ML-{seq:03d}` | 8,500 | 450,000 | 7,500 | 30 | AA | 6 |
| 2 | ET-BALL-MILL | Ball Mill | Broyeur à boulets | MILL | `{area}-BAL-ML-{seq:03d}` | 5,000 | 280,000 | 7,500 | 30 | AA | 3 |
| 3 | ET-ROD-MILL | Rod Mill | Broyeur à barres | MILL | `{area}-ROD-ML-{seq:03d}` | 3,000 | 180,000 | 7,200 | 25 | A+ | 2 |
| 4 | ET-SLURRY-PUMP | Slurry Pump | Pompe à boue | PUMP | `{area}-SLP-{seq:03d}` | 250 | 8,000 | 8,000 | 20 | A+ | 4 |
| 5 | ET-FLOTATION-CELL | Flotation Cell | Cellule de flottation | SEPARATOR | `{area}-FLC-{seq:03d}` | 250 | 35,000 | 8,000 | 20 | A+ | 2 |
| 6 | ET-BELT-CONVEYOR | Belt Conveyor | Convoyeur à bande | CONVEYOR | `{area}-CVR-{seq:03d}` | 200 | 45,000 | 7,500 | 20 | A | 4 |
| 7 | ET-THICKENER | Thickener | Épaississeur | SEPARATOR | `{area}-THK-{seq:03d}` | 45 | 80,000 | 8,500 | 25 | A | 2 |
| 8 | ET-BELT-FILTER | Belt Filter | Filtre à bande | FILTER | `{area}-BFT-{seq:03d}` | 45 | 15,000 | 7,500 | 15 | A+ | 3 |
| 9 | ET-ROTARY-DRYER | Rotary Dryer | Sécheur rotatif | DRYER | `{area}-DRY-{seq:03d}` | 500 | 120,000 | 7,000 | 25 | A+ | 3 |
| 10 | ET-CRUSHER | Crusher | Concasseur | CRUSHER | `{area}-CRS-{seq:03d}` | 350 | 85,000 | 6,500 | 25 | A+ | 3 |
| 11 | ET-SCREEN | Vibrating Screen | Crible vibrant | SCREEN | `{area}-SCR-{seq:03d}` | 150 | 12,000 | 7,000 | 15 | A | 2 |
| 12 | ET-CYCLONE | Hydrocyclone | Hydrocyclone | SEPARATOR | `{area}-CYC-{seq:03d}` | 0 | 2,000 | 8,000 | 10 | B | 3 |
| 13 | ET-AGITATOR | Agitator | Agitateur | MIXER | `{area}-AGT-{seq:03d}` | 150 | 5,000 | 8,000 | 20 | A | 2 |
| 14 | ET-COMPRESSOR | Compressor | Compresseur | COMPRESSOR | `{area}-CMP-{seq:03d}` | 350 | 15,000 | 8,000 | 20 | A+ | 3 |
| 15 | ET-HEAT-EXCHANGER | Heat Exchanger | Échangeur de chaleur | HEAT_EXCHANGER | `{area}-HEX-{seq:03d}` | 0 | 8,000 | 8,500 | 20 | B | 2 |

---

## Detailed Equipment Definitions

### ET-SAG-MILL: SAG Mill

- **Name (FR)**: Broyeur SAG
- **Name (AR)**: طاحونة SAG
- **Category**: MILL
- **Tag Convention**: `{area}-SAG-ML-{seq:03d}`
- **Typical Power**: 8,500 kW (range: 5,000 - 12,000 kW)
- **Typical Weight**: 450,000 kg
- **Operational Hours/Year**: 7,500
- **Expected Life**: 30 years
- **Criticality Class**: AA
- **Manufacturers**: FLSmidth, Metso Outotec, ThyssenKrupp

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Main Drive Motor** (Moteur d'entraînement principal) -- Component Ref: `CL-MOTOR-HV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding insulation degrades over time | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure winding insulation resistance | TEST | 6 | MONTHS | ONLINE | 3.2 | 2190 |
| Motor bearing overheats due to lubricant contamination | OVERHEATS_MELTS | CONTAMINATION | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure motor bearing vibration and temperature | INSPECT | 1 | MONTHS | ONLINE | 1.2 | 1460 |
| Motor thermally overloads due to overcurrent | THERMALLY_OVERLOADS | OVERCURRENT | E_RANDOM | EVIDENT_SAFETY | False | CONDITION_BASED | Check motor current draw and protection relay settings | TEST | 3 | MONTHS | ONLINE | 1.0 | 2555 |

**Main Gearbox** (Réducteur principal) -- Component Ref: `CL-GEARBOX-PLANETARY`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox gears wear due to metal-to-metal contact | WEARS | METAL_TO_METAL_CONTACT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Analyze gearbox oil sample for metal particles | INSPECT | 3 | MONTHS | ONLINE | 2.8 | 2555 |
| Gearbox seal degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace gearbox seals | REPLACE | 24 | MONTHS | OFFLINE | 3.5 | 730 |

**Drive Coupling** (Accouplement d'entraînement) -- Component Ref: `CL-COUPLING-FLEX`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Coupling element degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace coupling flex element | REPLACE | 36 | MONTHS | OFFLINE | 3.0 | 1095 |
| Coupling loses preload due to vibration | LOOSES_PRELOAD | VIBRATION | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect coupling alignment and bolt torque | INSPECT | 6 | MONTHS | OFFLINE | 1.1 | 1825 |


#### Sub-Assembly 2: Grinding System (Système de broyage)

**Mill Liner** (Blindage du broyeur) -- Component Ref: `CL-LINER-MILL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Liner wears due to impact shock loading from ore | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure liner thickness using ultrasonic testing | INSPECT | 3 | MONTHS | OFFLINE | 3.8 | 365 |
| Liner cracks due to impact shock loading | CRACKS | IMPACT_SHOCK_LOADING | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect liner for cracks during shutdown | INSPECT | 6 | MONTHS | OFFLINE | 1.5 | 547 |

**Lifter Bar** (Barre de relevage) -- Component Ref: `CL-LIFTER-MILL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Lifter bar wears due to impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure lifter bar height during reline | INSPECT | 6 | MONTHS | OFFLINE | 4.0 | 365 |

**Mill Shell** (Virole du broyeur) -- Component Ref: `CL-SHELL-MILL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Shell cracks due to cyclic loading | CRACKS | CYCLIC_LOADING | C_FATIGUE | EVIDENT_SAFETY | False | CONDITION_BASED | Perform shell NDT inspection for fatigue cracks | INSPECT | 12 | MONTHS | OFFLINE | 2.0 | 3650 |


#### Sub-Assembly 3: Feed System (Système d'alimentation)

**Feed Chute** (Goulotte d'alimentation) -- Component Ref: `CL-CHUTE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Feed chute liner wears due to impact shock from ore | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Inspect feed chute liner wear | INSPECT | 3 | MONTHS | OFFLINE | 3.0 | 365 |

**Feed Trunnion** (Tourillon d'alimentation) -- Component Ref: `CL-TRUNNION`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Trunnion bearing wears due to mechanical overload | WEARS | MECHANICAL_OVERLOAD | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure trunnion bearing vibration | INSPECT | 1 | MONTHS | ONLINE | 2.5 | 1825 |


#### Sub-Assembly 4: Discharge System (Système de décharge)

**Trommel Screen** (Trommel) -- Component Ref: `CL-SCREEN-TROMMEL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Screen panel wears due to impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Inspect and replace worn trommel screen panels | INSPECT | 3 | MONTHS | OFFLINE | 3.5 | 270 |
| Screen blocks due to excessive particle size | BLOCKS | EXCESSIVE_PARTICLE_SIZE | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check trommel discharge for oversized material | INSPECT | 1 | WEEKS | ONLINE | 1.0 | 180 |

**Discharge Trunnion** (Tourillon de décharge) -- Component Ref: `CL-TRUNNION`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Trunnion seal degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace discharge trunnion seal | REPLACE | 18 | MONTHS | OFFLINE | 3.0 | 547 |


#### Sub-Assembly 5: Lubrication System (Système de lubrification)

**Lube Oil Pump** (Pompe à huile) -- Component Ref: `CL-PUMP-LUBE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Lube pump wears due to lubricant contamination | WEARS | LUBRICANT_CONTAMINATION | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check lube oil pump discharge pressure | INSPECT | 1 | WEEKS | ONLINE | 1.8 | 1095 |

**Oil Filter** (Filtre à huile) -- Component Ref: `CL-FILTER-OIL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Oil filter blocks due to contamination | BLOCKS | CONTAMINATION | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace lube oil filter element | REPLACE | 3 | MONTHS | ONLINE | 2.5 | 120 |

**Oil Cooler** (Refroidisseur d'huile) -- Component Ref: `CL-COOLER-OIL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Cooler tubes corrode in corrosive environment | CORRODES | CORROSIVE_ENVIRONMENT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check oil cooler temperature differential | INSPECT | 3 | MONTHS | ONLINE | 2.0 | 1825 |


#### Sub-Assembly 6: Instrumentation (Instrumentation)

**Vibration Sensor** (Capteur de vibration) -- Component Ref: `CL-SENSOR-VIBRATION`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Vibration sensor drifts due to use | DRIFTS | USE | E_RANDOM | HIDDEN_NONSAFETY | True | FAULT_FINDING | Calibrate vibration sensor against reference | CALIBRATE | 12 | MONTHS | OFFLINE | 1.0 | 2190 |


---

### ET-BALL-MILL: Ball Mill

- **Name (FR)**: Broyeur à boulets
- **Name (AR)**: طاحونة كروية
- **Category**: MILL
- **Tag Convention**: `{area}-BAL-ML-{seq:03d}`
- **Typical Power**: 5,000 kW (range: 2,000 - 8,000 kW)
- **Typical Weight**: 280,000 kg
- **Operational Hours/Year**: 7,500
- **Expected Life**: 30 years
- **Criticality Class**: AA
- **Manufacturers**: FLSmidth, Metso Outotec, CITIC

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Main Drive Motor** (Moteur principal) -- Component Ref: `CL-MOTOR-HV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 6 | MONTHS | ONLINE | 3.0 | 2190 |
| Motor bearing overheats from lack of lubrication | OVERHEATS_MELTS | LACK_OF_LUBRICATION | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Monitor motor bearing temperature | INSPECT | 1 | MONTHS | ONLINE | 1.1 | 1460 |

**Gearbox** (Réducteur) -- Component Ref: `CL-GEARBOX-HELICAL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox wears due to breakdown of lubrication | WEARS | BREAKDOWN_OF_LUBRICATION | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Analyze gearbox oil for wear metals | INSPECT | 3 | MONTHS | ONLINE | 2.5 | 2555 |

**Coupling** (Accouplement) -- Component Ref: `CL-COUPLING-FLEX`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Coupling element degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace coupling element | REPLACE | 36 | MONTHS | OFFLINE | 3.0 | 1095 |


#### Sub-Assembly 2: Grinding System (Système de broyage)

**Mill Liner** (Blindage) -- Component Ref: `CL-LINER-MILL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Liner wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure liner thickness | INSPECT | 3 | MONTHS | OFFLINE | 3.5 | 365 |

**Grinding Media** (Corps broyants) -- Component Ref: `CL-MEDIA-BALL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Grinding media wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure ball charge level and add media | INSPECT | 2 | WEEKS | ONLINE | 4.0 | 60 |


#### Sub-Assembly 3: Lubrication System (Système de lubrification)

**Lube Pump** (Pompe de lubrification) -- Component Ref: `CL-PUMP-LUBE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Lube pump wears from lubricant contamination | WEARS | LUBRICANT_CONTAMINATION | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check lube pump pressure and flow | INSPECT | 1 | WEEKS | ONLINE | 1.8 | 1095 |

**Oil Filter** (Filtre à huile) -- Component Ref: `CL-FILTER-OIL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Filter blocks from contamination | BLOCKS | CONTAMINATION | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace oil filter element | REPLACE | 3 | MONTHS | ONLINE | 2.5 | 120 |


---

### ET-ROD-MILL: Rod Mill

- **Name (FR)**: Broyeur à barres
- **Name (AR)**: طاحونة قضبان
- **Category**: MILL
- **Tag Convention**: `{area}-ROD-ML-{seq:03d}`
- **Typical Power**: 3,000 kW (range: 1,500 - 5,000 kW)
- **Typical Weight**: 180,000 kg
- **Operational Hours/Year**: 7,200
- **Expected Life**: 25 years
- **Criticality Class**: A+
- **Manufacturers**: Metso Outotec, FLSmidth

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-HV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 6 | MONTHS | ONLINE | 3.0 | 2190 |

**Gearbox** (Réducteur) -- Component Ref: `CL-GEARBOX-HELICAL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox gear teeth wear from metal-to-metal contact | WEARS | METAL_TO_METAL_CONTACT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Analyze gearbox oil sample | INSPECT | 3 | MONTHS | ONLINE | 2.5 | 2555 |


#### Sub-Assembly 2: Grinding System (Système de broyage)

**Rods** (Barres) -- Component Ref: `CL-MEDIA-ROD`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Rods wear from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Check rod charge level and replace worn rods | INSPECT | 2 | WEEKS | ONLINE | 4.0 | 45 |

**Liner** (Blindage) -- Component Ref: `CL-LINER-MILL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Liner wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure liner thickness during reline | INSPECT | 6 | MONTHS | OFFLINE | 3.5 | 365 |


---

### ET-SLURRY-PUMP: Slurry Pump

- **Name (FR)**: Pompe à boue
- **Name (AR)**: مضخة الطين
- **Category**: PUMP
- **Tag Convention**: `{area}-SLP-{seq:03d}`
- **Typical Power**: 250 kW (range: 75 - 500 kW)
- **Typical Weight**: 8,000 kg
- **Operational Hours/Year**: 8,000
- **Expected Life**: 20 years
- **Criticality Class**: A+
- **Manufacturers**: Weir Minerals, Metso Outotec, KSB

#### Sub-Assembly 1: Wet End (Partie hydraulique)

**Impeller** (Roue) -- Component Ref: `CL-IMPELLER-SLURRY`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Impeller wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure pump discharge pressure and flow | INSPECT | 1 | WEEKS | ONLINE | 2.8 | 180 |
| Impeller corrodes from chemical attack | CORRODES | CHEMICAL_ATTACK | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check impeller condition during wet end inspection | INSPECT | 3 | MONTHS | OFFLINE | 1.8 | 365 |

**Volute Liner** (Chemise de volute) -- Component Ref: `CL-LINER-PUMP`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Volute liner wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace volute liner | REPLACE | 6 | MONTHS | OFFLINE | 3.0 | 270 |

**Throat Bush** (Bague d'étranglement) -- Component Ref: `CL-BUSH-THROAT`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Throat bush wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace throat bush | REPLACE | 4 | MONTHS | OFFLINE | 3.2 | 180 |


#### Sub-Assembly 2: Bearing Assembly (Ensemble palier)

**Drive End Bearing** (Roulement côté entraînement) -- Component Ref: `CL-BEARING-DE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Bearing wears from breakdown of lubrication | WEARS | BREAKDOWN_OF_LUBRICATION | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure bearing vibration | INSPECT | 1 | MONTHS | ONLINE | 2.5 | 730 |

**Non-Drive End Bearing** (Roulement côté libre) -- Component Ref: `CL-BEARING-NDE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Bearing overheats from lack of lubrication | OVERHEATS_MELTS | LACK_OF_LUBRICATION | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Monitor bearing temperature | INSPECT | 1 | MONTHS | ONLINE | 1.2 | 730 |


#### Sub-Assembly 3: Sealing System (Système d'étanchéité)

**Mechanical Seal** (Garniture mécanique) -- Component Ref: `CL-SEAL-MECH`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Seal wears from relative movement | WEARS | RELATIVE_MOVEMENT | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace mechanical seal | REPLACE | 12 | MONTHS | OFFLINE | 2.8 | 365 |
| Seal degrades from chemical attack | DEGRADES | CHEMICAL_ATTACK | D_STRESS | EVIDENT_ENVIRONMENTAL | False | CONDITION_BASED | Check seal leak rate | INSPECT | 1 | WEEKS | ONLINE | 1.5 | 270 |


#### Sub-Assembly 4: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-LV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor thermally overloads from overcurrent | THERMALLY_OVERLOADS | OVERCURRENT | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check motor current draw | INSPECT | 1 | MONTHS | ONLINE | 1.0 | 1825 |


---

### ET-FLOTATION-CELL: Flotation Cell

- **Name (FR)**: Cellule de flottation
- **Name (AR)**: خلية التعويم
- **Category**: SEPARATOR
- **Tag Convention**: `{area}-FLC-{seq:03d}`
- **Typical Power**: 250 kW (range: 100 - 400 kW)
- **Typical Weight**: 35,000 kg
- **Operational Hours/Year**: 8,000
- **Expected Life**: 20 years
- **Criticality Class**: A+
- **Manufacturers**: Metso Outotec, FLSmidth, Eriez

#### Sub-Assembly 1: Agitator System (Système d'agitation)

**Agitator Motor** (Moteur d'agitation) -- Component Ref: `CL-MOTOR-LV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades from excessive temperature | DEGRADES | EXCESSIVE_TEMPERATURE | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Monitor motor winding temperature | INSPECT | 1 | MONTHS | ONLINE | 1.5 | 1825 |

**Impeller** (Turbine) -- Component Ref: `CL-IMPELLER-AGITATOR`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Impeller corrodes from chemical attack | CORRODES | CHEMICAL_ATTACK | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect impeller condition | INSPECT | 6 | MONTHS | OFFLINE | 1.8 | 547 |
| Impeller wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace impeller | REPLACE | 18 | MONTHS | OFFLINE | 2.5 | 547 |

**Agitator Shaft** (Arbre d'agitateur) -- Component Ref: `CL-SHAFT`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Shaft cracks from cyclic loading | CRACKS | CYCLIC_LOADING | C_FATIGUE | EVIDENT_SAFETY | False | CONDITION_BASED | Inspect shaft for fatigue cracks using NDT | INSPECT | 12 | MONTHS | OFFLINE | 2.0 | 2555 |


#### Sub-Assembly 2: Air System (Système d'air)

**Blower** (Soufflante) -- Component Ref: `CL-BLOWER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Blower bearing wears from breakdown of lubrication | WEARS | BREAKDOWN_OF_LUBRICATION | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Monitor blower vibration and temperature | INSPECT | 1 | MONTHS | ONLINE | 2.5 | 1095 |

**Sparger** (Diffuseur d'air) -- Component Ref: `CL-SPARGER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Sparger blocks from contamination | BLOCKS | CONTAMINATION | E_RANDOM | EVIDENT_OPERATIONAL | False | FIXED_TIME | Clean sparger orifices | CLEAN | 3 | MONTHS | OFFLINE | 1.2 | 180 |


---

### ET-BELT-CONVEYOR: Belt Conveyor

- **Name (FR)**: Convoyeur à bande
- **Name (AR)**: ناقل حزامي
- **Category**: CONVEYOR
- **Tag Convention**: `{area}-CVR-{seq:03d}`
- **Typical Power**: 200 kW (range: 30 - 500 kW)
- **Typical Weight**: 45,000 kg
- **Operational Hours/Year**: 7,500
- **Expected Life**: 20 years
- **Criticality Class**: A
- **Manufacturers**: Rulmeca, Martin Engineering, Continental, Fenner Dunlop

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Drive Motor** (Moteur d'entraînement) -- Component Ref: `CL-MOTOR-LV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 12 | MONTHS | ONLINE | 3.0 | 2555 |

**Gearbox** (Réducteur) -- Component Ref: `CL-GEARBOX-HELICAL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox seal degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace gearbox seals | REPLACE | 24 | MONTHS | OFFLINE | 3.5 | 730 |


#### Sub-Assembly 2: Head Pulley (Tambour de tête)

**Pulley** (Tambour) -- Component Ref: `CL-PULLEY`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Pulley lagging wears from relative movement | WEARS | RELATIVE_MOVEMENT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect pulley lagging condition | INSPECT | 3 | MONTHS | OFFLINE | 2.5 | 365 |

**Bearing** (Roulement) -- Component Ref: `CL-BEARING-DE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Pulley bearing wears from lubricant contamination | WEARS | LUBRICANT_CONTAMINATION | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure pulley bearing vibration | INSPECT | 1 | MONTHS | ONLINE | 2.5 | 1095 |


#### Sub-Assembly 3: Belt (Bande)

**Belt Splice** (Jonction de bande) -- Component Ref: `CL-SPLICE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Belt splice breaks from mechanical overload | BREAKS_FRACTURE_SEPARATES | MECHANICAL_OVERLOAD | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect belt splice condition | INSPECT | 1 | MONTHS | ONLINE | 1.5 | 547 |

**Belt Scraper** (Racleur de bande) -- Component Ref: `CL-SCRAPER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Scraper blade wears from relative movement | WEARS | RELATIVE_MOVEMENT | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace belt scraper blade | REPLACE | 3 | MONTHS | OFFLINE | 3.0 | 120 |


#### Sub-Assembly 4: Idlers (Rouleaux)

**Carry Idler** (Rouleau porteur) -- Component Ref: `CL-IDLER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Idler bearing immobilised from contamination | IMMOBILISED | CONTAMINATION | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Walk belt line and inspect for seized idlers | INSPECT | 1 | WEEKS | ONLINE | 1.0 | 730 |


---

### ET-THICKENER: Thickener

- **Name (FR)**: Épaississeur
- **Name (AR)**: مكثف
- **Category**: SEPARATOR
- **Tag Convention**: `{area}-THK-{seq:03d}`
- **Typical Power**: 45 kW (range: 15 - 90 kW)
- **Typical Weight**: 80,000 kg
- **Operational Hours/Year**: 8,500
- **Expected Life**: 25 years
- **Criticality Class**: A
- **Manufacturers**: FLSmidth, Metso Outotec, WesTech

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Drive Motor** (Moteur) -- Component Ref: `CL-MOTOR-LV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 12 | MONTHS | ONLINE | 3.0 | 2555 |

**Gearbox** (Réducteur) -- Component Ref: `CL-GEARBOX-PLANETARY`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox wears from breakdown of lubrication | WEARS | BREAKDOWN_OF_LUBRICATION | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Analyze gearbox oil sample | INSPECT | 6 | MONTHS | ONLINE | 2.5 | 2555 |


#### Sub-Assembly 2: Rake Mechanism (Mécanisme de râteau)

**Rake Arms** (Bras de râteau) -- Component Ref: `CL-RAKE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Rake arm corrodes in corrosive environment | CORRODES | CORROSIVE_ENVIRONMENT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect rake arms for corrosion | INSPECT | 6 | MONTHS | OFFLINE | 2.0 | 1825 |

**Feedwell** (Puits d'alimentation) -- Component Ref: `CL-FEEDWELL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Feedwell corrodes from chemical attack | CORRODES | CHEMICAL_ATTACK | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect feedwell liner condition | INSPECT | 12 | MONTHS | OFFLINE | 2.0 | 1825 |


---

### ET-BELT-FILTER: Belt Filter

- **Name (FR)**: Filtre à bande
- **Name (AR)**: مرشح حزامي
- **Category**: FILTER
- **Tag Convention**: `{area}-BFT-{seq:03d}`
- **Typical Power**: 45 kW (range: 20 - 75 kW)
- **Typical Weight**: 15,000 kg
- **Operational Hours/Year**: 7,500
- **Expected Life**: 15 years
- **Criticality Class**: A+
- **Manufacturers**: FLSmidth, Andritz, BHS-Sonthofen

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-LV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor degrades from excessive temperature | DEGRADES | EXCESSIVE_TEMPERATURE | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check motor temperature | INSPECT | 1 | MONTHS | ONLINE | 1.5 | 1825 |


#### Sub-Assembly 2: Filter Media (Média filtrant)

**Filter Cloth** (Toile filtrante) -- Component Ref: `CL-CLOTH-FILTER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Filter cloth degrades from chemical attack | DEGRADES | CHEMICAL_ATTACK | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace filter cloth | REPLACE | 6 | MONTHS | OFFLINE | 3.0 | 180 |
| Filter cloth blocks from contamination | BLOCKS | CONTAMINATION | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check filter cake moisture content | INSPECT | 1 | DAYS | ONLINE | 1.0 | 60 |


#### Sub-Assembly 3: Vacuum System (Système de vide)

**Vacuum Pump** (Pompe à vide) -- Component Ref: `CL-PUMP-VACUUM`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Vacuum pump wears from entrained air | WEARS | ENTRAINED_AIR | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Monitor vacuum pump pressure and temperature | INSPECT | 1 | WEEKS | ONLINE | 1.8 | 730 |


---

### ET-ROTARY-DRYER: Rotary Dryer

- **Name (FR)**: Sécheur rotatif
- **Name (AR)**: مجفف دوار
- **Category**: DRYER
- **Tag Convention**: `{area}-DRY-{seq:03d}`
- **Typical Power**: 500 kW (range: 200 - 1,000 kW)
- **Typical Weight**: 120,000 kg
- **Operational Hours/Year**: 7,000
- **Expected Life**: 25 years
- **Criticality Class**: A+
- **Manufacturers**: FLSmidth, Metso Outotec, Feeco

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-HV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades from excessive temperature | DEGRADES | EXCESSIVE_TEMPERATURE | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 6 | MONTHS | ONLINE | 2.0 | 1825 |

**Gearbox** (Réducteur) -- Component Ref: `CL-GEARBOX-HELICAL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox wears from metal-to-metal contact | WEARS | METAL_TO_METAL_CONTACT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Analyze gearbox oil sample | INSPECT | 3 | MONTHS | ONLINE | 2.5 | 2555 |


#### Sub-Assembly 2: Shell Assembly (Ensemble virole)

**Shell** (Virole) -- Component Ref: `CL-SHELL-DRYER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Shell cracks from thermal stresses | CRACKS | THERMAL_STRESSES | C_FATIGUE | EVIDENT_SAFETY | False | CONDITION_BASED | Inspect shell for cracks using NDT | INSPECT | 12 | MONTHS | OFFLINE | 2.0 | 3650 |

**Trunnion Bearing** (Palier de tourillon) -- Component Ref: `CL-BEARING-TRUNNION`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Trunnion bearing wears from mechanical overload | WEARS | MECHANICAL_OVERLOAD | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Measure trunnion bearing vibration and temperature | INSPECT | 1 | MONTHS | ONLINE | 2.5 | 1825 |

**Shell Seal** (Joint de virole) -- Component Ref: `CL-SEAL-SHELL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Shell seal degrades from excessive temperature | DEGRADES | EXCESSIVE_TEMPERATURE | B_AGE | EVIDENT_ENVIRONMENTAL | False | FIXED_TIME | Replace shell seal | REPLACE | 12 | MONTHS | OFFLINE | 3.0 | 365 |


#### Sub-Assembly 3: Burner System (Système de brûleur)

**Burner** (Brûleur) -- Component Ref: `CL-BURNER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Burner nozzle blocks from contamination | BLOCKS | CONTAMINATION | E_RANDOM | EVIDENT_OPERATIONAL | False | FIXED_TIME | Clean burner nozzle and inspect flame pattern | CLEAN | 3 | MONTHS | OFFLINE | 1.2 | 180 |


---

### ET-CRUSHER: Crusher

- **Name (FR)**: Concasseur
- **Name (AR)**: كسارة
- **Category**: CRUSHER
- **Tag Convention**: `{area}-CRS-{seq:03d}`
- **Typical Power**: 350 kW (range: 150 - 750 kW)
- **Typical Weight**: 85,000 kg
- **Operational Hours/Year**: 6,500
- **Expected Life**: 25 years
- **Criticality Class**: A+
- **Manufacturers**: Metso Outotec, FLSmidth, ThyssenKrupp, Sandvik

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-HV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor winding degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 6 | MONTHS | ONLINE | 3.0 | 2190 |


#### Sub-Assembly 2: Crushing Chamber (Chambre de concassage)

**Mantle** (Manteau) -- Component Ref: `CL-MANTLE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Mantle wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure mantle wear profile | INSPECT | 3 | MONTHS | OFFLINE | 3.5 | 270 |

**Concave** (Concave) -- Component Ref: `CL-CONCAVE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Concave wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Measure concave wear profile | INSPECT | 3 | MONTHS | OFFLINE | 3.5 | 365 |

**Eccentric** (Excentrique) -- Component Ref: `CL-ECCENTRIC`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Eccentric bearing wears from mechanical overload | WEARS | MECHANICAL_OVERLOAD | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Monitor eccentric bearing vibration and oil analysis | INSPECT | 1 | MONTHS | ONLINE | 2.5 | 1460 |


#### Sub-Assembly 3: Lubrication System (Système de lubrification)

**Oil Filter** (Filtre à huile) -- Component Ref: `CL-FILTER-OIL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Filter blocks from contamination | BLOCKS | CONTAMINATION | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace oil filter element | REPLACE | 3 | MONTHS | ONLINE | 2.5 | 120 |


---

### ET-SCREEN: Vibrating Screen

- **Name (FR)**: Crible vibrant
- **Name (AR)**: غربال اهتزازي
- **Category**: SCREEN
- **Tag Convention**: `{area}-SCR-{seq:03d}`
- **Typical Power**: 150 kW (range: 30 - 300 kW)
- **Typical Weight**: 12,000 kg
- **Operational Hours/Year**: 7,000
- **Expected Life**: 15 years
- **Criticality Class**: A
- **Manufacturers**: Metso Outotec, Schenck Process, Derrick

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Vibrator Motor** (Moteur vibrateur) -- Component Ref: `CL-MOTOR-VIBRATOR`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Vibrator motor overheats from rubbing | OVERHEATS_MELTS | RUBBING | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check vibrator motor temperature and clearances | INSPECT | 1 | MONTHS | ONLINE | 1.2 | 1095 |


#### Sub-Assembly 2: Screen Deck (Grille de criblage)

**Screen Panels** (Panneaux de criblage) -- Component Ref: `CL-PANEL-SCREEN`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Screen panel wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Inspect and replace worn screen panels | INSPECT | 2 | MONTHS | OFFLINE | 3.0 | 90 |
| Screen panel blocks from excessive particle size | BLOCKS | EXCESSIVE_PARTICLE_SIZE | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check screen efficiency and clean blocked panels | INSPECT | 1 | WEEKS | ONLINE | 1.0 | 60 |

**Springs** (Ressorts) -- Component Ref: `CL-SPRING`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Spring breaks from cyclic loading | BREAKS_FRACTURE_SEPARATES | CYCLIC_LOADING | C_FATIGUE | EVIDENT_SAFETY | False | FIXED_TIME | Replace screen springs | REPLACE | 12 | MONTHS | OFFLINE | 2.5 | 547 |


---

### ET-CYCLONE: Hydrocyclone

- **Name (FR)**: Hydrocyclone
- **Name (AR)**: سيكلون مائي
- **Category**: SEPARATOR
- **Tag Convention**: `{area}-CYC-{seq:03d}`
- **Typical Power**: 0 kW (range: 0 - 0 kW)
- **Typical Weight**: 2,000 kg
- **Operational Hours/Year**: 8,000
- **Expected Life**: 10 years
- **Criticality Class**: B
- **Manufacturers**: Weir Minerals, Metso Outotec, FLSmidth

#### Sub-Assembly 1: Inlet Section (Section d'entrée)

**Inlet Liner** (Chemise d'entrée) -- Component Ref: `CL-LINER-CYCLONE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Inlet liner wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Inspect and replace inlet liner | INSPECT | 3 | MONTHS | OFFLINE | 3.0 | 180 |


#### Sub-Assembly 2: Vortex Finder (Tube de vortex)

**Vortex Finder** (Tube de vortex) -- Component Ref: `CL-VORTEX`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Vortex finder wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace vortex finder | REPLACE | 6 | MONTHS | OFFLINE | 3.0 | 270 |


#### Sub-Assembly 3: Apex Section (Section apex)

**Apex Valve** (Buse d'apex) -- Component Ref: `CL-APEX`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Apex valve wears from excessive fluid velocity | WEARS | EXCESSIVE_FLUID_VELOCITY | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace apex valve | REPLACE | 3 | MONTHS | OFFLINE | 3.5 | 120 |


---

### ET-AGITATOR: Agitator

- **Name (FR)**: Agitateur
- **Name (AR)**: محرك تقليب
- **Category**: MIXER
- **Tag Convention**: `{area}-AGT-{seq:03d}`
- **Typical Power**: 150 kW (range: 30 - 350 kW)
- **Typical Weight**: 5,000 kg
- **Operational Hours/Year**: 8,000
- **Expected Life**: 20 years
- **Criticality Class**: A
- **Manufacturers**: Lightnin (SPX), Milton Roy, EKATO

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-LV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Test motor insulation resistance | TEST | 12 | MONTHS | ONLINE | 3.0 | 2555 |

**Gearbox** (Réducteur) -- Component Ref: `CL-GEARBOX-HELICAL`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gearbox seal degrades with age | DEGRADES | AGE | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace gearbox seals | REPLACE | 24 | MONTHS | OFFLINE | 3.5 | 730 |


#### Sub-Assembly 2: Mixing System (Système de mélange)

**Impeller** (Turbine) -- Component Ref: `CL-IMPELLER-AGITATOR`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Impeller corrodes from chemical attack | CORRODES | CHEMICAL_ATTACK | D_STRESS | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect impeller condition during shutdown | INSPECT | 12 | MONTHS | OFFLINE | 1.8 | 730 |

**Shaft** (Arbre) -- Component Ref: `CL-SHAFT`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Shaft cracks from cyclic loading | CRACKS | CYCLIC_LOADING | C_FATIGUE | EVIDENT_SAFETY | False | CONDITION_BASED | Inspect shaft for cracks using NDT | INSPECT | 12 | MONTHS | OFFLINE | 2.0 | 2555 |

**Shaft Seal** (Garniture d'arbre) -- Component Ref: `CL-SEAL-MECH`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Shaft seal wears from relative movement | WEARS | RELATIVE_MOVEMENT | B_AGE | EVIDENT_ENVIRONMENTAL | False | FIXED_TIME | Replace shaft seal | REPLACE | 12 | MONTHS | OFFLINE | 2.8 | 365 |


---

### ET-COMPRESSOR: Compressor

- **Name (FR)**: Compresseur
- **Name (AR)**: ضاغط
- **Category**: COMPRESSOR
- **Tag Convention**: `{area}-CMP-{seq:03d}`
- **Typical Power**: 350 kW (range: 100 - 750 kW)
- **Typical Weight**: 15,000 kg
- **Operational Hours/Year**: 8,000
- **Expected Life**: 20 years
- **Criticality Class**: A+
- **Manufacturers**: Atlas Copco, Ingersoll Rand, Sullair

#### Sub-Assembly 1: Drive System (Système d'entraînement)

**Motor** (Moteur) -- Component Ref: `CL-MOTOR-HV`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Motor thermally overloads from overcurrent | THERMALLY_OVERLOADS | OVERCURRENT | E_RANDOM | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check motor current draw and protection settings | TEST | 3 | MONTHS | ONLINE | 1.0 | 2555 |


#### Sub-Assembly 2: Compression Stage (Étage de compression)

**Intake Valve** (Soupape d'admission) -- Component Ref: `CL-VALVE-INTAKE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Valve seat wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace intake valve | REPLACE | 12 | MONTHS | OFFLINE | 2.5 | 365 |

**Discharge Valve** (Soupape de refoulement) -- Component Ref: `CL-VALVE-DISCHARGE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Valve seat wears from impact shock loading | WEARS | IMPACT_SHOCK_LOADING | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Replace discharge valve | REPLACE | 12 | MONTHS | OFFLINE | 2.5 | 365 |


#### Sub-Assembly 3: Cooling System (Système de refroidissement)

**Aftercooler** (Refroidisseur final) -- Component Ref: `CL-COOLER`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Cooler tubes corrode in corrosive environment | CORRODES | CORROSIVE_ENVIRONMENT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Check cooler temperature differential and clean | INSPECT | 3 | MONTHS | ONLINE | 2.0 | 1825 |


---

### ET-HEAT-EXCHANGER: Heat Exchanger

- **Name (FR)**: Échangeur de chaleur
- **Name (AR)**: مبادل حراري
- **Category**: HEAT_EXCHANGER
- **Tag Convention**: `{area}-HEX-{seq:03d}`
- **Typical Power**: 0 kW (range: 0 - 0 kW)
- **Typical Weight**: 8,000 kg
- **Operational Hours/Year**: 8,500
- **Expected Life**: 20 years
- **Criticality Class**: B
- **Manufacturers**: Alfa Laval, Kelvion, GEA

#### Sub-Assembly 1: Tube Bundle (Faisceau tubulaire)

**Tubes** (Tubes) -- Component Ref: `CL-TUBE-HEX`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Tubes corrode from corrosive environment | CORRODES | CORROSIVE_ENVIRONMENT | B_AGE | EVIDENT_ENVIRONMENTAL | False | CONDITION_BASED | Perform tube wall thickness measurement | INSPECT | 12 | MONTHS | OFFLINE | 2.0 | 1825 |
| Tubes block from contamination buildup | BLOCKS | CONTAMINATION | B_AGE | EVIDENT_OPERATIONAL | False | FIXED_TIME | Clean tube bundle | CLEAN | 6 | MONTHS | OFFLINE | 2.5 | 270 |

**Gaskets** (Joints) -- Component Ref: `CL-GASKET`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Gasket expires with age | EXPIRES | AGE | B_AGE | EVIDENT_ENVIRONMENTAL | False | FIXED_TIME | Replace gaskets during service | REPLACE | 24 | MONTHS | OFFLINE | 3.5 | 730 |


#### Sub-Assembly 2: Baffle System (Système de chicanes)

**Baffles** (Chicanes) -- Component Ref: `CL-BAFFLE`

| What | Mechanism | Cause | Pattern | Consequence | Hidden | Strategy | Task | Type | Freq | Unit | Constraint | Beta | Eta |
|------|-----------|-------|---------|-------------|--------|----------|------|------|------|------|-----------|------|-----|
| Baffle corrodes from corrosive environment | CORRODES | CORROSIVE_ENVIRONMENT | B_AGE | EVIDENT_OPERATIONAL | False | CONDITION_BASED | Inspect baffles during bundle pull | INSPECT | 24 | MONTHS | OFFLINE | 2.0 | 2555 |


---
