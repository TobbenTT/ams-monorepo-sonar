# Salares Norte -- Maintenance Strategy Drivers

This document defines **7 concrete rules (D1 -- D7)** that translate the Salares Norte operational context into parameters for the RCM harness. Each rule includes a description, justification, implementation in the maintenance strategy, and the Python constant it maps to in the `GFSN_CONTEXT` configuration dictionary.

---

## Overview

The `GFSN_CONTEXT` dictionary is the single source of truth for all site-specific adjustments applied by the RCM harness when generating maintenance strategies, task lists, and interval recommendations for Salares Norte.

```python
GFSN_CONTEXT = {
    "D1_ALTITUDE_INTERVAL_FACTOR":    0.75,
    "D2_SWAPOUT_ENABLED":             True,
    "D3_OFFLINE_MONTHS":              [10, 11, 12, 1, 2, 3],  # Oct-Mar
    "D4_WINTERIZATION_MONTH":         3,                        # March
    "D5_MATERIAL_SPECS": {
        "elastomers":   ["HNBR", "FKM"],
        "lubricants":   "full_synthetic_cold_rated",
        "coatings":     "polyurethane_uv_resistant",
        "steel_charpy": -30,  # degrees C
    },
    "D6_MOTOR_DERATING_SEVERITY":     "HIGH",
    "D7_UV_DEGRADATION_FACTOR":       0.60,
}
```

---

## D1: Altitude Interval Factor

### Description

All time-based and cycle-based preventive maintenance intervals at Salares Norte are multiplied by a factor of **0.75** (i.e., reduced by 25%) relative to OEM sea-level recommendations.

### Justification

| Factor | Contribution to Interval Reduction |
|---|---|
| Altitude 4,500 m: reduced cooling, derating, increased thermal stress | ~15-20% |
| Thermal cycling: 200+ freeze-thaw cycles/year, 30-40C diurnal swing | ~10-15% |
| Silica abrasion: Mohs 7 ore on all material-handling equipment | ~20-30% (equipment-specific) |
| Combined baseline | **25% reduction (0.75x factor)** |

The 0.75x factor is a **baseline minimum**. Specific equipment classes may apply more aggressive factors:
- Slurry pump wet ends: 0.50x (abrasion-dominated)
- UV-exposed elastomers: 0.60x (UV-dominated)
- Switchgear: 0.80x (altitude-specific but less abrasion)

### How It Modifies the RCM Harness

When the harness generates a preventive maintenance task with an OEM-recommended interval `T_oem`:

```python
T_site = T_oem * GFSN_CONTEXT["D1_ALTITUDE_INTERVAL_FACTOR"]
# Example: OEM says 8,000 hours -> Salares Norte: 6,000 hours
```

Equipment-specific overrides can be applied via the equipment class configuration, but the harness default is always 0.75x.

### Python Constant

```python
"D1_ALTITUDE_INTERVAL_FACTOR": 0.75  # float, range 0.50-1.00
```

### Sources

- IEC 60034-1 (motor derating at altitude)
- Comparable mine data: Maricunga, Pascua-Lama, El Indio (see 05-industry-benchmarks.md)
- Gold Fields IAR 2024 (operational context)

---

## D2: Swap-Out for Critical Equipment

### Description

For all equipment classified as **Criticality A** (critical path), the maintenance strategy defaults to **swap-out replacement** of complete assemblies rather than in-situ repair. Removed assemblies are rebuilt in a workshop at lower altitude.

### Justification

| Factor | Impact |
|---|---|
| Worker productivity at 4,500 m | 20-30% reduction in physical output |
| Cognitive impairment (hypoxia) | Increased error rate on complex tasks |
| Cold conditions | Fine motor skills degraded below -5C |
| Remoteness | Specialist technicians 6-48 hours away |
| Downtime cost | ~USD 1.5-2.0 M per day of lost production |

Swap-out reduces on-site MTTR by **40-60%** compared to in-situ repair, at the cost of higher spare parts inventory investment (~USD 2-5 M additional holding for a complete swap-out program).

### How It Modifies the RCM Harness

When the harness generates a corrective or planned replacement task for Criticality A equipment:

```python
if GFSN_CONTEXT["D2_SWAPOUT_ENABLED"] and equipment.criticality == "A":
    task.strategy = "SWAP_OUT"          # Replace complete assembly
    task.repair_location = "OFFSITE"    # Workshop at lower altitude
    task.requires_swap_spare = True     # Must have spare unit on-site
    task.mttr_factor = 0.50             # 50% of in-situ repair time
```

The harness also flags any Criticality A equipment that does NOT have a swap-out spare in the BOM, generating a **spare parts gap notification**.

### Python Constant

```python
"D2_SWAPOUT_ENABLED": True  # bool
```

### Sources

- Pascua-Lama construction experience (50-60% productivity at >4,500 m)
- Gold Fields corporate maintenance standards
- International Mining -- "Salares Norte: Journey to Full Potential"

---

## D3: Offline Constraint -- Only October to March

### Description

Major planned shutdowns, overhauls, and any maintenance intervention requiring **equipment isolation, fluid drainage, or extended outdoor work** may ONLY be scheduled in the months of **October through March** (Southern Hemisphere spring/summer).

### Justification

| Factor | Detail |
|---|---|
| Freezing risk | April-September: nightly temperatures drop to -20C; draining any fluid system creates immediate freeze risk |
| April 2024 incident | Multi-month shutdown from frozen process piping; 60-130 koz Au-eq production loss |
| Worker safety | Extended outdoor work at -15 to -20C with wind chill is a safety hazard |
| Road access | Winter road conditions may delay heavy equipment transport |
| Reduced daylight | Shorter winter days limit outdoor work windows |

### How It Modifies the RCM Harness

The harness uses the `D3_OFFLINE_MONTHS` list to constrain maintenance plan scheduling:

```python
ALLOWED_SHUTDOWN_MONTHS = GFSN_CONTEXT["D3_OFFLINE_MONTHS"]  # [10, 11, 12, 1, 2, 3]

def schedule_major_intervention(task, preferred_date):
    if preferred_date.month not in ALLOWED_SHUTDOWN_MONTHS:
        # Reschedule to next available window
        task.scheduled_date = next_available_month(preferred_date, ALLOWED_SHUTDOWN_MONTHS)
        task.flag = "RESCHEDULED_WINTER_CONSTRAINT"
    # If interval would expire during winter, bring forward to March
    if task.due_date.month in [4, 5, 6, 7, 8, 9]:
        task.scheduled_date = march_of_same_year(task.due_date)
        task.flag = "BROUGHT_FORWARD_PRE_WINTER"
```

Tasks that would come due during the April-September window are **brought forward to March** rather than deferred to October, to prevent running equipment beyond safe intervals.

### Python Constant

```python
"D3_OFFLINE_MONTHS": [10, 11, 12, 1, 2, 3]  # list of int (1=Jan, 12=Dec)
```

### Sources

- Gold Fields IAR 2024 (April 2024 freezing incident)
- Salares Norte operational procedures
- Comparable mine practice: Maricunga, El Indio

---

## D4: Annual Winterization Task (March)

### Description

Every year in **March**, before the onset of freezing conditions (April), a comprehensive **winterization preventive maintenance program** is executed. This is a mandatory, non-deferrable maintenance event.

### Justification

The April 2024 freezing incident demonstrated that inadequate winter preparation can cause catastrophic production losses. The winterization program was formalized as a direct remediation action.

Key winterization scope:
1. Heat tracing circuit testing (megger + functional)
2. Insulation integrity verification
3. Antifreeze concentration checks on all glycol circuits
4. Bypass circuit functionality verification
5. Redundant pump start/stop testing
6. Lubricant winter-grade changeover verification
7. Instrument enclosure heater checks
8. Electrical room heating/dehumidification verification
9. Cold-weather PPE inventory check
10. Emergency response procedure review

### How It Modifies the RCM Harness

The harness automatically generates a **winterization work package** every year:

```python
WINTERIZATION_MONTH = GFSN_CONTEXT["D4_WINTERIZATION_MONTH"]  # 3 = March

def generate_annual_winterization(year):
    wp = WorkPackage(
        type="WINTERIZATION",
        scheduled_month=WINTERIZATION_MONTH,
        scheduled_year=year,
        priority="1_EMERGENCY",  # Non-deferrable
        duration_days=10,
        scope=[
            "HEAT_TRACING_TEST",
            "INSULATION_INSPECTION",
            "GLYCOL_CONCENTRATION",
            "BYPASS_VERIFICATION",
            "PUMP_REDUNDANCY_TEST",
            "LUBRICANT_VERIFICATION",
            "ENCLOSURE_HEATER_CHECK",
            "EROOM_HVAC_CHECK",
            "PPE_INVENTORY",
            "EMERGENCY_PROCEDURE_REVIEW",
        ],
    )
    return wp
```

The winterization work package is **auto-generated and cannot be deleted or deferred** within the maintenance planning system. It appears in the annual plan as a fixed constraint.

### Python Constant

```python
"D4_WINTERIZATION_MONTH": 3  # int (1=Jan, 12=Dec)
```

### Sources

- Gold Fields IAR 2024 (remediation actions post-freezing incident)
- International Mining -- "Salares Norte: Journey to Full Potential"
- Maricunga mine winterization protocols (industry precedent)

---

## D5: Material Specifications

### Description

All maintenance material specifications at Salares Norte are constrained to **cold-rated, UV-resistant, and abrasion-resistant** grades. Standard materials acceptable at sea level are NOT permitted for replacement parts.

### Justification

| Material Class | Standard Spec | Salares Norte Spec | Failure If Standard Used |
|---|---|---|---|
| Elastomers | NBR (Nitrile) | **HNBR / FKM** | Brittle fracture at -20C |
| Lubricants | Mineral oil | **Full synthetic, cold-rated** | Cold-start seizure, pour point exceeded |
| Coatings | Alkyd/acrylic | **Polyurethane UV-resistant** | Chalking/failure in 1-2 years |
| Structural steel | ASTM A36 | **Charpy-tested at -30C** | Brittle fracture risk |

### How It Modifies the RCM Harness

The harness validates all material specifications in work orders and BOMs against the D5 constraints:

```python
MATERIAL_SPECS = GFSN_CONTEXT["D5_MATERIAL_SPECS"]

def validate_material(material_record):
    if material_record.category == "ELASTOMER":
        if material_record.compound not in MATERIAL_SPECS["elastomers"]:
            raise MaterialSpecViolation(
                f"Elastomer {material_record.compound} not approved. "
                f"Must be one of {MATERIAL_SPECS['elastomers']}"
            )
    if material_record.category == "LUBRICANT":
        if material_record.base != MATERIAL_SPECS["lubricants"]:
            raise MaterialSpecViolation(
                "Only full synthetic cold-rated lubricants approved"
            )
    if material_record.category == "STEEL":
        if material_record.charpy_temp > MATERIAL_SPECS["steel_charpy"]:
            raise MaterialSpecViolation(
                f"Steel Charpy test temp must be <= {MATERIAL_SPECS['steel_charpy']}C"
            )
```

Material spec violations generate a **quality hold notification** in SAP PM, preventing the work order from proceeding until approved materials are sourced.

### Python Constant

```python
"D5_MATERIAL_SPECS": {
    "elastomers":   ["HNBR", "FKM"],                 # list of str
    "lubricants":   "full_synthetic_cold_rated",       # str
    "coatings":     "polyurethane_uv_resistant",       # str
    "steel_charpy": -30,                               # int, degrees C
}
```

### Sources

- ASTM A572 (structural steel with Charpy testing)
- Parker Hannifin -- Elastomer selection for extreme environments
- Shell/Mobil -- Synthetic lubricant technical bulletins for high-altitude mining
- Gold Fields engineering specifications

---

## D6: Motor Derating Severity Adjustment

### Description

All electric motor maintenance strategies are adjusted for **HIGH severity** derating at 4,500 m. This affects insulation testing frequency, bearing lubrication intervals, cooling system maintenance, and spare motor requirements.

### Justification

At 4,500 m:
- Air density is ~60% of sea level, reducing motor cooling by ~35-40%.
- Motors run hotter for the same load, accelerating insulation aging (**Arrhenius rule: insulation life halves for every 10C increase**).
- Condensation from diurnal thermal cycling drives moisture into windings.
- Partial discharge inception voltage is lower at reduced air pressure, increasing insulation stress on VFD-driven motors.
- Standard NEMA/IEC motors derated to 65-75% of nameplate at 4,500 m.

### How It Modifies the RCM Harness

The harness applies motor-specific adjustments based on the severity level:

```python
MOTOR_DERATING = GFSN_CONTEXT["D6_MOTOR_DERATING_SEVERITY"]  # "HIGH"

MOTOR_SEVERITY_TABLE = {
    "LOW":  {  # < 2,000 m
        "insulation_test_interval_months": 24,
        "bearing_lube_factor": 1.0,
        "pd_test_required": False,
        "space_heater_required_kw": 200,
    },
    "MEDIUM": {  # 2,000 - 3,500 m
        "insulation_test_interval_months": 12,
        "bearing_lube_factor": 0.85,
        "pd_test_required": True,  # for VFD-driven only
        "space_heater_required_kw": 100,
    },
    "HIGH": {  # > 3,500 m (Salares Norte)
        "insulation_test_interval_months": 12,
        "bearing_lube_factor": 0.75,
        "pd_test_required": True,   # for ALL motors > 200 kW
        "space_heater_required_kw": 75,  # all motors > 75 kW
    },
}

def apply_motor_adjustments(motor, task_list):
    config = MOTOR_SEVERITY_TABLE[MOTOR_DERATING]
    
    # Insulation resistance test
    task_list.add("INSULATION_TEST", interval_months=config["insulation_test_interval_months"])
    
    # Bearing lubrication
    for lube_task in task_list.filter(type="BEARING_LUBE"):
        lube_task.interval *= config["bearing_lube_factor"]
    
    # Partial discharge testing
    if config["pd_test_required"] and (motor.kw > 200 or motor.vfd_driven):
        task_list.add("PD_TEST", interval_months=12)
    
    # Space heater requirement
    if motor.kw >= config["space_heater_required_kw"]:
        if not motor.has_space_heater:
            generate_notification("SPACE_HEATER_MISSING", motor)
```

### Python Constant

```python
"D6_MOTOR_DERATING_SEVERITY": "HIGH"  # str, one of ["LOW", "MEDIUM", "HIGH"]
```

### Sources

- IEC 60034-1 -- Rotating electrical machines, altitude derating
- IEEE 43 -- Recommended Practice for Testing Insulation Resistance
- NEMA MG1 -- Motors and generators (altitude correction)
- EASA -- Electrical Apparatus Service Association, motor rewind standards

---

## D7: UV Degradation Factor for Exposed Components

### Description

All **outdoor-exposed polymer components** (cables, elastomers, coatings, conveyor belt covers, hose assemblies) have their replacement/inspection intervals multiplied by a factor of **0.60** (i.e., reduced by 40%) relative to standard recommendations.

### Justification

| Factor | Detail |
|---|---|
| UV Index at 4,500 m | >11 at summer noon (extreme category) |
| Altitude UV amplification | ~45-55% higher UV intensity than sea level |
| Cloud cover | Minimal -- near-continuous direct solar exposure |
| Precipitation | Near-zero -- no natural washdown of UV-degraded surface material |

UV radiation causes:
- **Chain scission** in polymers: embrittlement, cracking, loss of tensile strength.
- **Chalking** of coatings: loss of protective barrier, accelerated corrosion of substrate.
- **Insulation degradation**: cable jackets crack and expose conductors within 12-18 months (standard PVC).

The 0.60x factor is based on observed degradation rates at comparable Atacama operations (Maricunga, Chuquicamata) adjusted for the additional ~1,650 m altitude above Chuquicamata.

### How It Modifies the RCM Harness

The harness checks whether equipment is tagged as `OUTDOOR_EXPOSED` and applies the UV factor:

```python
UV_FACTOR = GFSN_CONTEXT["D7_UV_DEGRADATION_FACTOR"]  # 0.60

def adjust_for_uv(task, equipment):
    if equipment.location_tag == "OUTDOOR_EXPOSED":
        if task.component_type in ["ELASTOMER", "CABLE", "COATING", "HOSE", "BELT_COVER"]:
            task.interval *= UV_FACTOR
            task.notes.append(
                f"Interval reduced to {UV_FACTOR:.0%} of standard "
                f"(UV degradation at 4,500m, UV index >11)"
            )
```

Components classified as `INDOOR` or `ENCLOSED` are NOT subject to the UV factor and use the standard D1 altitude factor instead.

### Interaction with D1

D7 applies **instead of** D1 for UV-dominated failure modes on exposed components. It does not stack multiplicatively:

```python
# Correct: use the MORE aggressive factor
if equipment.location_tag == "OUTDOOR_EXPOSED" and is_uv_sensitive(component):
    factor = min(D1_ALTITUDE_INTERVAL_FACTOR, D7_UV_DEGRADATION_FACTOR)
    # Result: 0.60 (D7 dominates)
else:
    factor = D1_ALTITUDE_INTERVAL_FACTOR
    # Result: 0.75 (D1 baseline)
```

### Python Constant

```python
"D7_UV_DEGRADATION_FACTOR": 0.60  # float, range 0.40-1.00
```

### Sources

- Mining Technology -- UV radiation data for Atacama high-altitude sites
- ASTM G154 -- Standard Practice for Operating Fluorescent Ultraviolet Lamp Apparatus (accelerated UV testing)
- Comparable mine data: Maricunga, Chuquicamata cable/coating replacement records
- Parker Hannifin -- UV resistance of elastomer compounds

---

## Summary: Driver Quick Reference

| Driver | Constant | Value | Effect |
|---|---|---|---|
| D1 | `D1_ALTITUDE_INTERVAL_FACTOR` | 0.75 | Reduce all PM intervals by 25% |
| D2 | `D2_SWAPOUT_ENABLED` | True | Swap-out strategy for Criticality A equipment |
| D3 | `D3_OFFLINE_MONTHS` | [10,11,12,1,2,3] | Major work only Oct-Mar |
| D4 | `D4_WINTERIZATION_MONTH` | 3 (March) | Mandatory annual winterization program |
| D5 | `D5_MATERIAL_SPECS` | dict | Enforce HNBR/FKM, synthetic lubes, UV coatings, -30C steel |
| D6 | `D6_MOTOR_DERATING_SEVERITY` | "HIGH" | Aggressive motor testing and lubrication program |
| D7 | `D7_UV_DEGRADATION_FACTOR` | 0.60 | 40% shorter intervals for UV-exposed polymers |

---

## Full `GFSN_CONTEXT` Dictionary

```python
GFSN_CONTEXT = {
    # D1: Altitude interval factor
    # Multiplier applied to all OEM-recommended PM intervals.
    # 0.75 = 25% reduction from sea-level standard.
    "D1_ALTITUDE_INTERVAL_FACTOR": 0.75,

    # D2: Swap-out strategy
    # When True, Criticality A equipment defaults to swap-out replacement.
    "D2_SWAPOUT_ENABLED": True,

    # D3: Allowed months for major offline interventions
    # Southern Hemisphere spring/summer only (Oct-Mar).
    "D3_OFFLINE_MONTHS": [10, 11, 12, 1, 2, 3],

    # D4: Winterization month
    # March = last month before freezing season (April-September).
    "D4_WINTERIZATION_MONTH": 3,

    # D5: Material specifications
    # Enforced on all work orders and BOMs.
    "D5_MATERIAL_SPECS": {
        "elastomers":   ["HNBR", "FKM"],
        "lubricants":   "full_synthetic_cold_rated",
        "coatings":     "polyurethane_uv_resistant",
        "steel_charpy": -30,
    },

    # D6: Motor derating severity
    # "HIGH" = >3,500 m: aggressive testing, 0.75x lube intervals,
    # PD testing for all motors >200 kW, space heaters >75 kW.
    "D6_MOTOR_DERATING_SEVERITY": "HIGH",

    # D7: UV degradation factor
    # Applied to outdoor-exposed polymer components INSTEAD OF D1.
    # 0.60 = 40% shorter intervals than standard.
    "D7_UV_DEGRADATION_FACTOR": 0.60,
}
```

---

## Sources

1. Gold Fields Integrated Annual Report 2024
2. International Mining -- "Salares Norte: Journey to Full Potential"
3. Mining Technology -- "Salares Norte Project, Atacama, Chile"
4. NS Energy -- "Salares Norte Gold-Silver Mine, Chile"
5. IEC 60034-1 -- Rotating electrical machines
6. IEC 62271 -- High-voltage switchgear
7. ISO 14224:2016 -- Reliability and maintenance data
8. SAE JA-1011 -- RCM evaluation criteria
9. ASTM A572 -- Structural steel
10. Comparable mine data: Maricunga, Pascua-Lama, El Indio, Chuquicamata
