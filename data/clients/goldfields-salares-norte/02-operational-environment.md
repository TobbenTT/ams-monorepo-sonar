# Salares Norte -- Operational Environment

This document describes the environmental factors at Salares Norte that cause **accelerated equipment degradation** and drive maintenance strategy decisions. Every factor listed here has a direct, quantifiable impact on failure rates, maintenance intervals, and material specifications.

---

## 1. Altitude and Atmospheric Pressure

| Parameter | Value |
|---|---|
| Operating Elevation | 3,900 -- 4,700 m ASL (process plant ~4,500 m) |
| Atmospheric Pressure | ~55 -- 60 kPa (55-60% of sea level) |
| Air Density | ~0.70 -- 0.75 kg/m3 (vs 1.225 at sea level) |
| Oxygen Partial Pressure | ~55-60% of sea level |
| Boiling Point of Water | ~83 -- 85C |

### Effects on Equipment

**Diesel engines:**
- Naturally aspirated engines lose ~3% power per 300 m above 1,500 m. At 4,500 m, this translates to **~25-30% derating**.
- Turbocharged engines recover partially but still suffer 10-15% derating.
- Higher exhaust gas temperatures accelerate turbocharger wear and increase thermal stress on exhaust components.
- Fuel injection timing may require altitude-specific calibration.

**Electric motors:**
- Standard IEC/NEMA motors must be **derated 25-35%** above 4,000 m due to reduced air cooling capacity.
- Motors specified for Salares Norte should be rated for 4,500 m or equipped with oversized frames.
- Insulation class must account for potential condensation (Class F minimum, Class H preferred).

**Electrical switchgear and panels:**
- Reduced air density lowers the **dielectric strength of air**, reducing arc flash distances.
- Circuit breakers and contactors rated at sea level may arc at voltages below their nominal rating.
- All switchgear must be rated for altitude or derated per IEC 62271 (>1,000 m correction).
- Creepage and clearance distances on PCBs and busbars require review.

**Cooling systems:**
- Radiators, oil coolers, and HVAC systems lose ~35-40% cooling efficiency.
- Equipment with forced-air cooling requires oversized fans or supplemental cooling.

**Hydraulic systems:**
- Cavitation risk increases in hydraulic pumps due to lower atmospheric pressure on reservoir.
- Pressurized reservoirs or boosted suction lines may be required.

## 2. Temperature Extremes and Thermal Cycling

| Parameter | Value |
|---|---|
| Winter Minimum | Down to **-20C** |
| Summer Maximum | +25 to +30C (at ground level with solar radiation) |
| Diurnal Swing | **30 -- 40C** within a single day |
| Annual Thermal Range | ~50C (-20C to +30C) |
| Freeze-Thaw Cycles | 200+ days/year with sub-zero overnight temps |

### Effects on Equipment

**Structural steel and pressure vessels:**
- Charpy impact testing at **-30C minimum** is required for all structural steel.
- Ductile-to-brittle transition is a real risk with standard carbon steels.
- Bolted connections experience thermal relaxation cycles -- torque verification programs are essential.

**Elastomers and seals:**
- Standard NBR (nitrile) rubber becomes brittle below -15C.
- **HNBR or FKM (Viton)** must be specified for all dynamic seals, O-rings, and gaskets.
- Conveyor belt covers must be cold-rated compound (below -25C).

**Lubricants:**
- Mineral oils thicken dramatically at -20C; pour points must be verified.
- **Full-synthetic, cold-rated lubricants** (ISO VG 32/46 synthetic) required for all outdoor equipment.
- Grease must be NLGI 0 or 1 for winter applications; centralized lubrication systems need heated reservoirs.

**Piping and fluid systems:**
- Every pipe carrying water, slurry, or reagent is at **freezing risk** 200+ nights per year.
- Dead legs, instrument sensing lines, and bypass piping are highest risk.
- Heat tracing (electric or steam) and insulation are mandatory -- see Section 7 below.

**Electronics and instrumentation:**
- Thermal cycling causes solder joint fatigue, connector loosening, and enclosure condensation.
- Instrument enclosures must be heated and sealed (IP65 minimum, IP66 preferred).

## 3. UV Radiation

| Parameter | Value |
|---|---|
| UV Index | **>11** at summer noon (extreme category) |
| Elevation Factor | UV increases ~10-12% per 1,000 m; at 4,500 m ~45-55% higher than sea level |
| Cloud Cover | Minimal -- high percentage of direct radiation days |
| Classification | Among the **highest recorded UV levels on Earth** |

### Effects on Equipment

**Polymers and elastomers:**
- Standard PVC cable jackets become brittle within 12-18 months of direct exposure.
- Conveyor belt covers, rubber linings, and hose assemblies degrade at 2-3x normal rate.
- UV-stabilized compounds (with carbon black or UV inhibitors) are mandatory for all exposed polymer components.

**Coatings and paint systems:**
- Standard alkyd and acrylic coatings chalk and fail within 1-2 years.
- Polyurethane or fluoropolymer topcoats required for structural steel.
- Coating inspection intervals should be **annual** for exposed structural steel.

**Cable and wiring:**
- All outdoor cables must be UV-rated (XLPE or EPR insulation with UV-resistant jacket).
- Cable trays should be covered or cables routed in conduit where possible.
- Fiber optic cables with UV-resistant jackets required for communication runs.

**Human factors:**
- Mandatory PPE includes UV-protective eyewear and sunscreen.
- Maintenance crews working outdoors have reduced effective work windows at peak UV hours.

## 4. Dust and Silica Abrasion

| Parameter | Value |
|---|---|
| Ore Hardness | Predominantly quartz (Mohs 7) |
| Precipitation | <15 mm/year (virtually no natural dust suppression) |
| Wind | Persistent, moderate-to-strong Andean winds |

### Effects on Equipment

**Slurry systems:**
- Pump impellers, volutes, and liners in silica slurry service experience severe erosive wear.
- Warman-type pump wet ends may last only 2,000-4,000 hours vs 6,000-8,000 at lower-abrasion sites.
- Pipeline elbows and tees require wear-back monitoring (ultrasonics) on accelerated schedules.

**Conveyors:**
- Belt covers, skirts, and idlers are subject to abrasive wear from fine silica dust.
- Idler bearing seals must be multi-labyrinth type to exclude fine dust.

**Crushers:**
- Manganese steel liners (Mn13-Mn18) wear rates are high; liner change frequency is a major scheduled maintenance driver.

**Filters and bearings:**
- Air intake filters for engines, compressors, and HVAC require frequent replacement.
- Bearing seals on all rotating equipment must be contact-type or pressurized to exclude silica fines.

## 5. Water Scarcity

| Parameter | Value |
|---|---|
| Annual Precipitation | <15 mm |
| Water Source | Underground wells + process recycling |
| Recycling Rate | >86% |
| Tailings Method | Filtered dry stack (no tailings dam) |

### Maintenance Implications

- **No fire water from natural sources** -- fire suppression systems rely entirely on stored/recycled water.
- Dust suppression on haul roads consumes significant water budget; maintenance of water trucks and spray systems is operationally critical.
- Any process water leak is both a maintenance issue and a water-loss issue -- leak detection and repair has environmental and economic priority.
- Cooling water for equipment is a constrained resource; closed-loop cooling with glycol is preferred over open evaporative systems.

## 6. Human Factors at Altitude

| Factor | Impact |
|---|---|
| SpO2 at 4,500 m | Typically 80-88% (vs 95-100% at sea level) |
| Cognitive Impairment | Measurable reduction in decision-making speed and accuracy |
| Physical Capacity | **20-30% reduction** in sustained physical work output |
| Acclimatization | Requires 3-7 days; even acclimatized workers have reduced capacity |
| Chronic Mountain Sickness | Risk for long-rotation workers |

### Maintenance Implications

- **Task duration estimates must be increased 25-40%** over sea-level standards.
- Complex troubleshooting and safety-critical decisions should be supported by procedures and checklists -- cognitive margins are reduced.
- Heavy manual work (valve turning, flange makeup, liner handling) requires more crew and more breaks.
- **Swap-out philosophy** is preferred: replace whole assemblies on-site, repair in workshop at lower altitude.
- Fatigue management is a safety-critical maintenance scheduling constraint.

## 7. Case Study: April 2024 Freezing Incident

### What Happened

In **April 2024**, during the first winter after commissioning, frozen material accumulated in process plant piping, causing a **multi-month production shutdown**. Gold Fields revised its FY2024 production guidance for Salares Norte from **220-240 koz down to 90-180 koz Au-eq** -- a potential loss of **60-130 koz** (USD 120-260 M at USD 2,000/oz).

### Root Cause Analysis (Public Information)

The freezing occurred in sections of process piping where:
- Heat tracing was insufficient or not yet commissioned.
- Dead legs and bypass lines had stagnant fluid.
- The severity of the first real winter at operating temperatures was underestimated.

### Remediation Actions

Gold Fields implemented the following corrective measures:

1. **Heat tracing expansion** -- Installation of electric heat tracing on all water-bearing piping, including instrument lines and dead legs.
2. **Bypass circuits** -- Addition of recirculation bypasses to eliminate stagnant fluid in low-flow conditions.
3. **Additional pumps** -- Redundant pumps to maintain flow velocity above freezing thresholds.
4. **Winterization program** -- Annual pre-winter inspection and verification program (conducted in March before onset of freezing season).
5. **Insulation upgrades** -- Enhanced insulation thickness on exposed piping runs.

### Lessons for Maintenance Strategy

| Lesson | Maintenance Action |
|---|---|
| Heat tracing is life-critical infrastructure | Annual testing and verification before April |
| Dead legs are unacceptable | Piping modifications + ongoing check for new dead legs after any modification |
| Winter shutdowns are not optional | Major interventions ONLY in Oct-Mar window |
| Redundancy is not optional for fluid systems | Spare pump strategy for all critical circuits |
| The cost of one freezing event exceeds years of prevention investment | Winterization PM program is non-negotiable |

---

## Environmental Factor Summary Matrix

| Factor | Severity | Primary Equipment Impact | Interval Modifier |
|---|---|---|---|
| Altitude (4,500 m) | Extreme | Engines, motors, switchgear, cooling | 0.70 -- 0.80x |
| Temperature (-20C to +30C) | Extreme | Steel, seals, lubricants, piping | 0.75x for thermal cycling |
| UV Radiation (index >11) | Extreme | Cables, coatings, elastomers | 0.50 -- 0.70x for exposed components |
| Silica Abrasion (Mohs 7) | Severe | Pumps, liners, conveyors, bearings | 0.50 -- 0.70x for wetted/abraded parts |
| Water Scarcity | Severe | Cooling, dust suppression, fire protection | Drives design, not interval |
| Freezing Risk | Critical | All fluid systems | Drives winterization program |
| Human Factors | Significant | Task execution time, safety | +30-40% duration factor |

---

## Sources

1. Gold Fields Integrated Annual Report 2024 -- Salares Norte operational review and production guidance revision
2. International Mining -- "Salares Norte: Journey to Full Potential" (2024)
3. Mining Technology -- "Salares Norte Project, Atacama, Chile"
4. NS Energy -- "Salares Norte Gold-Silver Mine, Chile"
5. Gold Fields Chile -- Operations Overview
6. Aggreko -- Hybrid Power Solution (altitude derating context)
7. IEC 60034-1 -- Rotating electrical machines, altitude derating
8. IEC 62271 -- High-voltage switchgear, altitude correction
9. OSHA / NIOSH -- Working at High Altitude guidelines
