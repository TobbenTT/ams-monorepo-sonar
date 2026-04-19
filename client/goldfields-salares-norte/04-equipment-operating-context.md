# Salares Norte -- Equipment Operating Context

This document describes the **specific operating conditions** for each major equipment type at Salares Norte that modify failure modes, failure rates, and maintenance requirements compared to sea-level operations.

---

## 1. Slurry Pumps (PU)

### Operating Context

| Parameter | Condition |
|---|---|
| Media | Silica-rich slurry (quartz, Mohs 7) |
| Solids Concentration | 30-60% w/w depending on circuit position |
| Temperature | Near-freezing in winter (risk of ice formation in standby pumps) |
| Altitude Effect | Reduced NPSH available; increased cavitation risk |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Impeller erosive wear | Silica abrasion -- 2-3x accelerated vs typical ore | High |
| Volute/casing wear-through | Silica abrasion at cutwater and sidewalls | High |
| Seal failure (gland packing or mechanical) | Abrasive ingress + thermal cycling of seal faces | Medium-High |
| Bearing failure | Vibration from worn impeller imbalance; seal leakage contamination | Medium |
| Frozen standby pump | Stagnant slurry in casing freezes solid; casing cracks | Critical |
| Cavitation damage | Reduced atmospheric NPSH at 4,500 m | Medium |

### Maintenance Implications

- Wet-end life: **2,000-4,000 hours** (vs 6,000-8,000 at low-abrasion sites).
- Complete pump swap-out units required on-site for all critical-path pumps.
- Standby pumps must have **recirculation bypasses or heat tracing** to prevent freezing.
- High-chrome iron or rubber-lined wet ends; natural rubber NOT suitable for this ore.
- NPSH calculations must use **55-60 kPa atmospheric pressure** (not 101.3 kPa).

---

## 2. Conveyors (CV)

### Operating Context

| Parameter | Condition |
|---|---|
| Material | Crushed silica ore (highly abrasive) |
| Temperature Range | -20C to +30C |
| UV Exposure | Extreme (outdoor sections) |
| Wind | Persistent, moderate-to-strong |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Belt cover wear (carry side) | Silica abrasion at loading points | High |
| Belt cover cracking | UV degradation + thermal cycling | Medium-High |
| Belt splice failure | Thermal cycling weakens vulcanized splices | High |
| Idler bearing failure | Dust ingress through seals; cold-start shock loading | Medium |
| Cold-start belt tracking issues | Belt stiffens at -20C, tracking wanders on startup | Medium |
| Pulley lagging failure | Thermal cycling + abrasion delaminate lagging | Medium |
| Structure fatigue | Wind loading + thermal expansion/contraction cycles | Low-Medium |

### Maintenance Implications

- Belt compound must be rated to **-30C minimum** to prevent cold-start cracking.
- Belt cover inspection frequency: **monthly** for UV-exposed sections (vs quarterly standard).
- Idler replacement rate approximately **1.5-2x** normal due to dust and thermal cycling.
- Splice inspection by NDT (cord monitoring) **quarterly** for critical conveyors.
- All outdoor pulleys and drives require **synthetic lubricants** (winter viscosity).
- Conveyor galleries or covers recommended where economically feasible to reduce UV and wind exposure.

---

## 3. Crushers (CR)

### Operating Context

| Parameter | Condition |
|---|---|
| Ore | High-silica epithermal ore (quartz, Mohs 7) |
| Feed Size | ROM up to 800-1,000 mm |
| Temperature | Ambient; cold lubricant viscosity at start-up |
| Altitude Effect | Reduced cooling capacity for hydraulic systems and lubrication |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Mantle/concave wear | Extreme abrasion from silica ore | High (scheduled) |
| Main shaft bearing failure | Cold lubricant viscosity at startup; thermal cycling | Critical |
| Hydraulic system failure | Cavitation from altitude; cold oil viscosity | High |
| Spider bushing wear | Impact loads + cold startup conditions | Medium |
| Foundation bolt loosening | Thermal cycling relaxation | Medium |
| Countershaft bearing/seal failure | Dust ingress + abrasion | Medium |

### Maintenance Implications

- Liner change frequency is a **major scheduled maintenance driver** -- plan for 2,000-4,000 hours between changes depending on ore hardness variability.
- Lubrication system must have **oil heaters** for cold-start pre-warming.
- Hydraulic fluid: synthetic ISO VG 32-46 with pour point below -35C.
- Crusher must be included in the **summer shutdown** window for major liner changes.
- Foundation bolts: torque verification **quarterly** due to thermal cycling.

---

## 4. SAG and Ball Mills (ML)

### Operating Context

| Parameter | Condition |
|---|---|
| Power | 4 MW each (SAG + Ball) -- largest single loads on site |
| Ore | High-silica, highly abrasive |
| Operating Hours | Near-continuous (target >92% availability) |
| Temperature | Mill shell differential: ambient outside (-20C) to +60-80C inside |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Liner wear | Silica abrasion + impact | High (scheduled) |
| Shell bolt loosening/failure | Thermal cycling + vibration | High |
| Trunnion bearing wear | High loads; lubricant management at altitude | Critical |
| Gearbox failure | Thermal cycling; altitude-derated cooling | Critical |
| Ring gear/pinion wear | Alignment sensitivity; temperature-induced deflections | High |
| Motor failure | Altitude derating; insulation degradation from condensation | Critical |

### Maintenance Implications

- Mill reline: **2x per year minimum** for SAG (abrasive ore); coordinate with summer shutdown.
- Shell bolt inspection: **monthly** torque checks on sample pattern.
- Trunnion bearing oil: **synthetic, heated reservoir** -- continuous monitoring via ABB Genix.
- Mill motor: Class H insulation minimum; space heaters must run whenever motor is de-energized.
- Gearbox oil cooling: oversized cooler or supplemental cooling required (35-40% reduced air cooling efficiency at altitude).

---

## 5. Electric Motors (EM)

### Operating Context

| Parameter | Condition |
|---|---|
| Altitude | 4,500 m -- 35% air density reduction |
| Temperature | -20C to +40C ambient (with solar radiation on motor frame) |
| Condensation | Daily thermal cycling drives moisture into windings |
| Dust | Silica fines penetrate cooling circuits |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Winding insulation failure | Overheating (derating), condensation, thermal cycling | Critical |
| Bearing failure | Condensation contamination; cold-start lubrication | High |
| Cooling fan/shroud failure | UV degradation of plastic fan; dust accumulation in fins | Medium |
| Terminal box condensation | Diurnal temperature swings cause condensation on terminals | Medium |
| VFD-driven insulation stress | Altitude reduces partial discharge inception voltage | High |

### Maintenance Implications

- All motors >30 kW on critical path must be **rated for 4,500 m** or derated 35%.
- Insulation class: **Class F minimum, Class H preferred** with Class B temperature rise.
- **Anti-condensation heaters (space heaters)** must be wired and operational on all motors >75 kW; auto-energize when motor is stopped.
- Bearing lubrication: synthetic grease rated to -40C; re-greasing interval **0.75x OEM**.
- Partial discharge testing: **annually** for all motors >200 kW and all VFD-driven motors.
- Motor cooling fins: cleaning schedule **quarterly** (silica dust accumulation).

---

## 6. Electrical Panels and Switchgear

### Operating Context

| Parameter | Condition |
|---|---|
| Altitude | 4,500 m -- reduced dielectric strength of air |
| Humidity | Near-zero average, BUT condensation events are frequent |
| Temperature | Panels in unheated buildings may reach -10C |
| Dust | Fine silica penetrates enclosures |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Arc flash at below-rated voltage | Reduced air dielectric at altitude | Critical |
| Contact pitting/welding | Reduced arc quenching capability | High |
| Insulation tracking | Condensation + dust on busbars/insulators | High |
| Relay/PLC malfunction | Condensation on electronics; temperature extremes | Medium |
| Cable termination failure | Thermal cycling loosens crimps and bolted connections | Medium |

### Maintenance Implications

- All switchgear must be **rated for 4,500 m** per IEC 62271 or derated.
- Creepage and clearance distances: verify compliance at reduced air density.
- **Heated, dehumidified electrical rooms** are mandatory -- heater failure is a high-priority alarm.
- Thermographic survey: **monthly** for all MV and HV panels.
- Torque verification of busbar connections: **annually** (thermal cycling relaxation).
- IP rating of panel enclosures: **IP54 minimum** for process areas (dust + condensation).
- NETA MTS testing schedule: **annually** for protective relays and circuit breakers.

---

## 7. Piping Systems

### Operating Context

| Parameter | Condition |
|---|---|
| Fluids | Water, slurry, cyanide solution, acid/alkali reagents |
| Temperature | -20C ambient (freezing risk on ALL water-bearing lines) |
| Abrasion | Silica slurry at high velocity |
| Corrosion | Cyanide environment, pH extremes |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Freezing / ice blockage | Stagnant fluid at -20C; failed heat tracing | Critical |
| Pipe burst from ice expansion | Frozen water expands ~9% | Critical |
| Erosive wear-through | Silica slurry at elbows, tees, reducers | High |
| Corrosion (internal) | Cyanide, acid, alkaline solutions | Medium-High |
| Flange/gasket leaks | Thermal cycling loosens bolts; gasket cold-set | Medium |
| Support/hanger failure | Thermal expansion/contraction cycles | Low-Medium |

### Maintenance Implications

- **Heat tracing** on all water-bearing piping: electric preferred, with redundant circuits on critical lines.
- Heat tracing annual verification in March (winterization program).
- Ultrasonic thickness monitoring on slurry piping: **quarterly** at elbows and tees.
- Flange bolt torque verification: **semi-annually** for critical flanges.
- No dead legs permitted -- any piping modification must be reviewed for freeze risk.
- Gasket material: spiral-wound with **flexible graphite filler** (temperature range -200C to +450C).

---

## 8. Filters -- Dry Stack Tailings (FL)

### Operating Context

| Parameter | Condition |
|---|---|
| Equipment | 3x Metso VPA Vertical Plate Pressure Filters |
| Duty | Continuous filtration of tailings slurry to >86% water recovery |
| Criticality | Loss of all three = plant shutdown (no alternative tailings disposal) |
| Temperature | Filter building partially enclosed; ambient temps reach -10C interior |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Filter cloth wear/blinding | Silica abrasion + chemical attack | High (scheduled) |
| Hydraulic cylinder seal failure | Pressure cycling (thousands of cycles/day) + cold temps | High |
| Plate cracking | Pressure cycling fatigue + thermal cycling | Medium-High |
| Feed pump failure | Silica abrasion (see slurry pumps) | High |
| Manifold/valve wear | Abrasive slurry + cycling | Medium |
| Frozen filtrate lines | Inadequate heat tracing on filtrate return | Critical |

### Maintenance Implications

- Filter cloth replacement: **scheduled at summer shutdown** + as-needed based on filtrate clarity.
- Hydraulic seal material: **FKM (Viton)** or HNBR -- standard NBR will fail from cold and cycling.
- Hydraulic oil: **synthetic ISO VG 32** with pour point below -35C.
- Spare hydraulic cylinders: **2 per filter minimum** on-site.
- **N+1 philosophy**: With 3 filters, the plant can tolerate one offline for maintenance during normal operations. Loss of two simultaneously is near-critical.
- Filtrate piping heat tracing: **redundant circuits** with alarm on failure.

---

## 9. Thickeners and CCD Train (TH)

### Operating Context

| Parameter | Condition |
|---|---|
| Equipment | Multi-stage CCD thickener train |
| Media | Cyanide-bearing slurry with silica solids |
| Temperature | Open-top vessels; surface exposed to ambient |
| Wind | Affects surface evaporation and overflow weir performance |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Rake mechanism wear | Silica solids settling and compacting; torque overloads | High |
| Rake drive gearbox failure | Altitude-derated cooling; cold-start viscosity | High |
| Feed well erosion | Abrasive slurry impingement | Medium |
| Overflow launder corrosion | Cyanide solution + UV exposure on exposed launders | Medium |
| Underflow pump failure | See slurry pump context (PU) | High |
| Ice formation on surface | Winter freezing of dilute overflow; ice loading on rakes | Medium-High |

### Maintenance Implications

- Rake torque monitoring: **continuous via DCS** with high-torque alarm.
- Rake arm and blade inspection: **annual** during summer shutdown (drain-down required).
- Drive gearbox: synthetic oil, heated sump, **0.75x OEM interval**.
- Surface ice management: may require heating or recirculation in extreme cold.
- Underflow pump: same maintenance strategy as all silica-service slurry pumps.

---

## 10. Heat Exchangers (HX)

### Operating Context

| Parameter | Condition |
|---|---|
| Types | Shell-and-tube, plate-and-frame (process and utility) |
| Temperature Differential | Extreme -- process side may be +60C, ambient side -20C |
| Water Quality | Recycled process water with dissolved solids |
| Criticality | Some are sole path for heat recovery / freeze protection |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Tube/plate fouling | Process water scaling and solids deposition | High |
| Thermal fatigue cracking | Repeated thermal shock from temperature differentials | High |
| Gasket failure (plate type) | Thermal cycling + chemical attack | Medium-High |
| Tube-sheet joint leakage | Differential expansion between tubes and shell | Medium |
| Freezing on shell side | Cooling water freezing in idle or low-flow conditions | Critical |

### Maintenance Implications

- Fouling monitoring: **track approach temperatures** via DCS; clean when delta exceeds threshold.
- Plate heat exchangers: gasket replacement at **0.75x OEM interval** (thermal cycling).
- Shell-and-tube: tube integrity testing (eddy current) **annually** during summer shutdown.
- Anti-freeze protection: glycol on all cooling water circuits exposed to ambient; concentration check **annually** (March winterization).
- Thermal stress analysis: critical exchangers should be designed for ASME VIII Div 2 fatigue assessment.

---

## 11. Tanks and Vessels (TK)

### Operating Context

| Parameter | Condition |
|---|---|
| Types | Leach tanks, reagent tanks, water tanks, thickeners |
| Contents | Cyanide solution, acid, water, slurry |
| Environment | High UV, extreme thermal cycling, wind loading |
| Location | Mostly outdoor, exposed |

### Dominant Failure Modes

| Failure Mode | Driver | Severity |
|---|---|---|
| Internal corrosion | Cyanide, pH extremes | High |
| External coating failure | UV + thermal cycling | Medium |
| Nozzle/flange leaks | Thermal cycling + wind vibration | Medium |
| Foundation settlement | Freeze-thaw of foundation soils | Low-Medium |
| Roof/shell buckling | Wind loading + vacuum events | Medium |
| Contents freezing | Water or dilute solution tanks in winter | High |

### Maintenance Implications

- Internal coating (lining) inspection: **annual** via confined space entry during summer shutdown.
- External coating: **annual** visual survey; touch-up at first sign of UV-induced chalking.
- Tank shell thickness: **5-year API 653 inspection** cycle (accelerated from 10-year for aggressive environment).
- Nozzle flange bolts: torque check **semi-annually**.
- Agitator and mixer maintenance per rotating equipment standards.
- Tank heating/insulation for all tanks containing dilute aqueous solutions.

---

## Summary: Equipment Criticality and Interval Modifiers

| Equipment | Criticality | Primary Degradation Driver | Interval Factor vs Sea Level |
|---|---|---|---|
| Slurry Pumps (PU) | A | Silica abrasion | 0.50 -- 0.65x |
| Conveyors (CV) | A/B | UV + thermal cycling + abrasion | 0.65 -- 0.75x |
| Crushers (CR) | A | Silica abrasion + cold lube | 0.65 -- 0.75x |
| SAG/Ball Mills (ML) | A | Abrasion + thermal cycling | 0.70 -- 0.80x |
| Electric Motors (EM) | A | Derating + condensation | 0.75x |
| Switchgear | A | Altitude + condensation | 0.80x (testing), 1.0x (replacement) |
| Piping | A/B | Freezing + erosion | 0.75x (inspection) |
| Filters (FL) | A | Pressure cycling + abrasion | 0.70x |
| Thickeners (TH) | A | Abrasion + cold | 0.75x |
| Heat Exchangers (HX) | B | Thermal fatigue + fouling | 0.75x |
| Tanks (TK) | B | Corrosion + UV | 0.80x |

---

## Sources

1. Gold Fields Chile -- Process plant design and operating parameters
2. Mining Technology -- "Salares Norte Project, Atacama, Chile"
3. Metso Outotec -- Vertical Plate Pressure Filter technical documentation
4. ABB -- 800xA and Genix condition monitoring capabilities
5. API 610 -- Centrifugal pumps for petroleum, petrochemical, and natural gas industries
6. API 653 -- Tank inspection, repair, alteration, and reconstruction
7. NETA MTS -- Maintenance Testing Specifications for electrical equipment
8. ISO 10816 -- Mechanical vibration evaluation
9. IEC 62271 -- High-voltage switchgear, altitude correction factors
10. Gold Fields Integrated Annual Report 2024
