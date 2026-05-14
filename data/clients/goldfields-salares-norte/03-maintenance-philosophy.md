# Salares Norte -- Maintenance Philosophy

This document defines the **contextual maintenance philosophy** for Salares Norte. Every decision described here is driven by the specific operational environment (altitude, cold, UV, remoteness, silica abrasion) and is a deliberate departure from standard sea-level maintenance practice.

---

## 1. Core Principle: Prevention Over Correction

At Salares Norte, the **cost of failure is asymmetric**. An unplanned failure at 4,500 m in winter can cascade into weeks of lost production (see April 2024 freezing incident, which cost an estimated 60-130 koz Au-eq). The maintenance philosophy therefore prioritizes:

1. **Prevent failures** through shorter intervals, better materials, and environmental protection.
2. **Detect degradation early** through condition monitoring and inspections.
3. **Minimize on-site repair time** through swap-out strategies and pre-positioned spares.
4. **Never schedule major work in winter** (April -- September).

---

## 2. Swap-Out Philosophy

### Principle

For all critical and semi-critical rotating equipment, the standard practice is to **replace complete assemblies on-site** rather than repair in place. Removed assemblies are sent to a **workshop at lower altitude** (Copiapo or Santiago) for rebuild.

### Justification

| Factor | Impact |
|---|---|
| Altitude | Workers operate at 20-30% reduced physical capacity |
| Cold | Fine motor skills are degraded; tool handling is impaired below -5C |
| Cognitive Load | Complex troubleshooting is riskier at altitude (hypoxia) |
| Logistics | Specialized technicians and tools are 6-48 hours away |
| Cost of Downtime | ~750-900 oz Au-eq/day (~USD 1.5-2.0 M/day) |

### Implementation

- **Pump assemblies** (wet ends, complete pump + motor sets): Pre-built swap units stored on-site.
- **Gearboxes**: Complete exchange units available for all critical drives.
- **Electrical motors**: Spare motors for every motor >75 kW on critical path.
- **Crusher wear parts**: Pre-assembled liner sets with lifting fixtures.
- **Valve assemblies**: Critical control valves have swap-out spares, pre-calibrated.
- **Instrument packages**: Complete transmitter assemblies rather than field-repair.

### Inventory Requirement

Swap-out philosophy requires a **larger on-site spare parts inventory** than comparable operations at sea level. The trade-off is justified: holding cost of a spare motor (~USD 50-150K) is negligible compared to one day of lost production (~USD 1.5-2.0 M).

---

## 3. Shutdown Window Constraints

### Rule: Major Interventions ONLY October -- March

| Month | Status | Justification |
|---|---|---|
| October | OPEN | Spring thaw, temperatures rising |
| November | OPEN | Warm, stable conditions |
| December | OPEN | Summer -- best working conditions |
| January | OPEN | Summer |
| February | OPEN | Summer, start planning winter prep |
| March | OPEN (last window) | Final opportunity; winterization in second half |
| April | CLOSED | Freezing begins; risk of cold snap |
| May | CLOSED | Deep winter |
| June | CLOSED | Deep winter |
| July | CLOSED | Deep winter, worst conditions |
| August | CLOSED | Deep winter |
| September | CLOSED | Transitional; still freezing risk |

### What "CLOSED" Means

- **No planned major shutdowns** (mill relines, crusher mantle changes, thickener rake replacements, filter overhauls).
- **No hot work permits** on outdoor piping or structures unless emergency.
- **No drainage of fluid systems** for any non-emergency reason.
- Minor maintenance (greasing, instrument calibration, control system updates) continues with enhanced cold-weather protocols.

### Annual Shutdown Planning

The **annual major shutdown** should be scheduled in **November -- January** (peak summer) and must include:
- Mill reline (SAG + Ball)
- Crusher liner change
- Filter cloth replacement
- Thickener rake inspection
- Major electrical maintenance (transformer oil, switchgear testing)
- Structural steel and coating inspections

---

## 4. Interval Adjustment: 25-30% Shorter Than Sea Level

### Rule

All time-based and cycle-based preventive maintenance intervals must be reduced by **25-30%** from OEM sea-level recommendations.

### Justification by Factor

| Factor | Interval Reduction | Affected Equipment |
|---|---|---|
| Altitude (engine/motor derating) | 20-25% | Diesel engines, electric motors, cooling systems |
| Thermal cycling (200+ freeze-thaw/year) | 15-25% | Seals, gaskets, bolted joints, structural connections |
| UV radiation | 30-50% | Cables, elastomers, coatings, exposed polymers |
| Silica abrasion | 30-50% | Pump liners, conveyor belts, crusher liners |
| Combined effect | **25-30% baseline** | General recommendation for all equipment |

### Application

- OEM says "replace seal every 8,000 hours" --> Salares Norte standard: **6,000 hours**.
- OEM says "reline pump every 5,000 hours" --> Salares Norte standard: **3,500 hours** (silica abrasion dominant).
- OEM says "inspect coating every 3 years" --> Salares Norte standard: **annually** (UV dominant).

The **0.75x factor** is a baseline. Equipment-specific factors may be more aggressive (e.g., 0.50x for UV-exposed elastomers).

---

## 5. Strategic Spares: Insurance Stock

### Principle

All **critical-path equipment** must have insurance spares stored on-site. The remote location (190 km from Diego de Almagro, 1,200 km from Santiago) means that emergency procurement lead times are:

| Source | Lead Time |
|---|---|
| Copiapo warehouse | 8-12 hours (road) |
| Santiago warehouse | 24-48 hours (road or air freight) |
| International (OEM) | 2-6 weeks |

### Mandatory On-Site Insurance Spares

| Equipment | Spare Strategy |
|---|---|
| SAG / Ball mill motors | 1 complete spare motor each |
| Crusher main shaft assembly | 1 spare |
| Critical pump assemblies | 1 complete swap unit per critical pump |
| Gearboxes (mill, conveyor drives) | 1 spare per type |
| Transformers (>1 MVA) | 1 spare for largest rating |
| VFD / Drive modules | 1 spare per critical drive |
| Filter hydraulic cylinders | 2 spares per filter |
| Heat tracing cable + controllers | 20% surplus stock |
| Conveyor belting | 1 full belt length per critical conveyor |
| Critical instrumentation | 2 spares per type (transmitters, analyzers) |

### Spare Parts Classification

Align with SAP PM MRP strategy:
- **VB (Manual reorder point)** -- Insurance spares, reviewed annually.
- **VM (Automatic reorder point)** -- Consumables with steady demand (filters, seals, lubricants).
- **ND (No planning)** -- Non-critical items procured on demand.

---

## 6. Annual Winterization Program

### Timing: March (Before April Onset of Freezing)

The winterization program is a **mandatory annual preventive maintenance event** triggered by calendar, not by condition. It was formalized after the April 2024 freezing incident.

### Winterization Checklist

#### 6.1 Heat Tracing Systems
- [ ] Megger test all electric heat tracing circuits.
- [ ] Verify thermostat set points and sensor calibration.
- [ ] Inspect insulation for damage, moisture ingress, and UV degradation.
- [ ] Test backup power feeds to heat tracing circuits.
- [ ] Walk down all piping for new dead legs created by modifications during summer.

#### 6.2 Fluid Systems
- [ ] Verify antifreeze concentration in all glycol loops (minimum -30C protection).
- [ ] Confirm all bypass circuits are operational and valves cycle freely.
- [ ] Test all redundant pumps (start/stop test + performance check).
- [ ] Drain and verify instrument sensing lines; confirm heat tracing on each.
- [ ] Verify fire water system freeze protection.

#### 6.3 Lubricant Changeover
- [ ] Confirm all outdoor equipment has **winter-grade lubricants** installed.
- [ ] Verify centralized lubrication system heaters are operational.
- [ ] Check grease specification in all outdoor bearings (NLGI 0 or 1 for winter).

#### 6.4 Structural and Enclosures
- [ ] Inspect all building seals, doors, and HVAC systems.
- [ ] Verify heated instrument enclosures are operational.
- [ ] Inspect electrical room heating and dehumidification systems.
- [ ] Check wind barriers and snow fences.

#### 6.5 Emergency Preparedness
- [ ] Verify emergency power to critical heat tracing and pumps.
- [ ] Test emergency communication systems.
- [ ] Confirm cold-weather PPE stocks for maintenance crews.
- [ ] Review and update winter emergency response procedures.

---

## 7. Material Specifications

All material specifications at Salares Norte deviate from standard to accommodate the extreme environment:

### 7.1 Elastomers and Seals

| Application | Standard Spec | Salares Norte Spec | Reason |
|---|---|---|---|
| Dynamic seals | NBR (Nitrile) | **HNBR** (Hydrogenated Nitrile) | Cold resistance to -30C + improved abrasion resistance |
| Static seals, O-rings | NBR | **FKM (Viton)** or HNBR | Temperature range, UV resistance |
| Conveyor belts | Standard SBR cover | **Cold-rated compound (-30C)** | Prevents cracking in winter cold starts |
| Pump liners | Natural rubber | **High-chrome iron or polyurethane** | Silica abrasion resistance |

### 7.2 Lubricants

| Application | Standard Spec | Salares Norte Spec | Reason |
|---|---|---|---|
| Gearbox oils | Mineral ISO VG 150-320 | **Full synthetic ISO VG 100-220** | Pour point below -30C |
| Hydraulic fluids | Mineral ISO VG 46 | **Synthetic ISO VG 32-46** | Cold start viscosity |
| Bearing grease | NLGI 2, mineral base | **NLGI 1, synthetic base, -40C rated** | Pumpability at -20C |
| Engine oils | 15W-40 mineral | **5W-40 full synthetic** | Cold start protection |

### 7.3 Structural Materials

| Application | Standard Spec | Salares Norte Spec | Reason |
|---|---|---|---|
| Structural steel | ASTM A36 | **ASTM A572 Gr 50 with Charpy at -30C** | Brittle fracture prevention |
| Pressure vessels | Standard SA516-70 | **SA516-70 with Charpy at -30C (PWHT)** | Low-temperature toughness |
| Bolting | Grade 5 / 8.8 | **Grade 8 / 10.9, hot-dip galvanized** | Thermal cycling + corrosion |

### 7.4 Coatings and Surface Protection

| Application | Standard Spec | Salares Norte Spec | Reason |
|---|---|---|---|
| Structural steel | Alkyd primer + topcoat | **Zinc-rich primer + polyurethane topcoat** | UV resistance, 10-year target |
| Tanks and vessels | Standard epoxy | **Novolac epoxy + polyurethane UV topcoat** | Chemical + UV resistance |
| Concrete | Standard curing compound | **Lithium silicate densifier** | Freeze-thaw resistance |

### 7.5 Cables and Wiring

| Application | Standard Spec | Salares Norte Spec | Reason |
|---|---|---|---|
| Power cables | PVC jacketed | **XLPE insulation, UV-rated jacket** | UV + cold resistance |
| Control cables | PVC jacketed | **EPR insulation, UV-rated jacket** | Flexibility at -20C |
| Fiber optic | Standard outdoor | **UV-resistant armored** | UV + mechanical protection |

---

## 8. Condition Monitoring Program

Given the accelerated degradation rates, condition monitoring is essential to bridge the gap between time-based intervals:

| Technique | Application | Frequency |
|---|---|---|
| Vibration analysis | All rotating equipment >30 kW | Monthly (critical), Quarterly (others) |
| Oil analysis | Gearboxes, hydraulics, engines | Monthly (engines), Quarterly (gearboxes) |
| Thermography | Electrical panels, motors, heat tracing | Monthly |
| Ultrasonic thickness | Slurry piping, pump casings | Quarterly |
| Motor current analysis | Critical motors | Quarterly |
| Visual / NDE coatings | Structural steel, tanks | Annually (summer shutdown) |

ABB Genix provides continuous online monitoring that supplements the route-based program.

---

## Sources

1. Gold Fields Integrated Annual Report 2024 -- Remediation actions post-freezing incident
2. International Mining -- "Salares Norte: Journey to Full Potential"
3. Gold Fields Chile -- Operational context and corporate asset management standards
4. ISO 55000:2014 -- Asset Management framework
5. SAE JA-1011 -- RCM evaluation criteria
6. API 610 -- Centrifugal pumps, cold-service specifications
7. ASTM A572 -- High-strength low-alloy structural steel
8. IEC 60034-1 -- Motor altitude derating
9. NFPA 850 -- Fire protection for electric generating plants (freeze protection)
