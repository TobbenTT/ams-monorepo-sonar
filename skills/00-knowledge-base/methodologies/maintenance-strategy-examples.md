# Maintenance Strategy Structure Examples

> **Used By Skills:** `generate-work-instructions`, `assemble-work-packages`, `maintenance-strategy-optimization`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Strategy 1: ISIBONELO Coal Plant -- Apron Feeder (1,396 tactics)](#2-strategy-1-isibonelo-coal-plant)
3. [Strategy 2: HITACHI EH3000 Dump Truck (691 tactics)](#3-strategy-2-hitachi-eh3000-dump-truck)
4. [Strategy 3: Correct Medium Pump (96 tactics)](#4-strategy-3-correct-medium-pump)
5. [Strategy 4: Komatsu 830E Truck -- Chilean Operation (BD Santiago)](#5-strategy-4-komatsu-830e-truck-chilean-operation)
6. [Common Patterns Across All Strategies](#6-common-patterns-across-all-strategies)
7. [Tactics Type Distribution and Usage Guide](#7-tactics-type-distribution-and-usage-guide)
8. [Task Type Classification Reference](#8-task-type-classification-reference)
9. [Interval Patterns and Frequency Standards](#9-interval-patterns-and-frequency-standards)

---

## 1. Overview

This document analyzes four real-world maintenance strategy exports from the Rylson8 / AssetTactics platform, covering different asset types and operational contexts within Anglo American and partner mining operations.

**Source directory:**
```
asset-management-methodology/maintenance-strategy-structure-examples/
```

**Files analyzed:**

| File | Asset Type | Rows | Columns | Context |
|------|-----------|------|---------|---------|
| `...-ISIBONELO 1_AssetTactics.xlsx` | Apron Feeder (Coal Plant) | 1,396 | 30 | South Africa -- Coal |
| `...-HITACHI EH3000 Dump Truck_AssetTactics.xlsx` | Dump Truck | 691 | 26 | South Africa -- Surface Mining |
| `...-Correct Medium Pump_AssetTactics.xlsx` | Centrifugal Slurry Pump | 96 | 34 | Anglo Tactics Library |
| `...-DEV-CAMINHAO 830E-v2_MaintenanceStrategy BD Stgo.xlsx` | Komatsu 830E Truck | varies | varies | Chile -- BD Santiago |

---

## 2. Strategy 1: ISIBONELO Coal Plant

**Asset:** Apron Feeder (Coal Processing Plant)
**Export Date:** 2018-05-31
**Total Tactics:** 1,396 rows
**Source:** Anglo Tactics Library + Site-specific workshops

### Column Structure (30 columns)

| Column | Description | Example |
|--------|-------------|---------|
| Strategy Id | Unique strategy identifier | `302388` |
| Id | Unique tactic row identifier | `280644` |
| Equipment / Library Component | Asset type | `Apron Feeder` |
| Maintainable Item | Component/sub-assembly | `LCU - Local Control Unit (C/W Isolator)` |
| Notes | Additional notes | _(various)_ |
| Function & Failure | Functional failure description | _(blank in most)_ |
| Existing Task | Source of the task | `Anglo Tactics Library` |
| Deconstructed Task | Broken-down task reference | _(blank in most)_ |
| What | Failure mode -- the item that fails | `Lock`, `Pushbutton`, `Isolator Mechanism` |
| Mechanism | How it fails | `binds`, `corrodes`, `wears`, `loose` |
| Cause | Root cause | `contamination`, `environment`, `abrasion`, `vibration` |
| Status | Recommendation status | `Recommended`, `Redundant` |
| Tactics Type | Strategy classification | `Condition Based`, `Fixed Time`, `Run Until Failure` |
| Primary Task | Main maintenance task description | `Inspect LCU door locking mechanism operates freely and locks securely` |
| QA comments | Quality assurance reviewer comments | `operates freely and lock securely are the acceptable limit` |
| Primary Task QA | QA-reviewed task text | Same as Primary Task or revised |
| Primary Task Interval | Numeric interval value | `7200`, `168`, `336`, `108000` |
| Operational Units | Unit type for interval | `Operational Hours`, `Tonnes`, `Cycles` |
| Time Units | Calendar time unit | `Days`, `Weeks`, `Months` |
| Primary Task Acceptable Limits | Pass/fail criteria | `Operational`, `No visible perishing or cuts` |
| Primary Task Conditional Comments | Comments when condition not met | _(various)_ |
| Primary Task Constraint | Online/Offline requirement | `Offline`, `Online` |
| Secondary Task Id | ID for the follow-up task | _(numeric)_ |
| Secondary Task | Corrective/replacement task | `Replace LCU enclosure locking mechanism` |
| Secondary Task Task Type | Type of secondary task | `Repair`, `Replace` |
| Secondary Task Constraint | Online/Offline for secondary | `Offline` |
| Primary Task Task Type | Type classification | `Inspection`, `Test`, `Clean`, `Adjust`, `Fluid Analysis` |
| Budgeted As | Budget classification | `Not Budgeted`, `Replace` |
| Budgeted Life | Expected component life | _(numeric or blank)_ |
| Budgeted Life Time Units | Unit for budgeted life | `Years` |

### Key Maintainable Items (Components)

- LCU - Local Control Unit (C/W Isolator)
- Pushbuttons
- Hydraulic Cooler (Hidraulic Cooler)
- Hydraulic Pumps (Pump 1, 2, 3)
- Hydraulic Tank
- Hydraulic Lines/Hoses
- Filter Housings
- Electric Motors
- Left/Right Drive Coupling
- Top Carrier Rollers
- Switch, Emergency Stop
- Apron Feeder (general)

### Interval Patterns

| Interval | Units | Frequency Equivalent | Common Tasks |
|----------|-------|---------------------|--------------|
| 168 | Days | ~6 months | Seal inspections, pushbutton checks |
| 336 | Days | ~1 year | Door seal inspections |
| 600 | Operational Hours | ~25 days | Emergency stop inspections |
| 1800 | Operational Hours | ~75 days | Pushbutton looseness checks |
| 7200 | Operational Hours | ~300 days | Isolator mechanism inspections |
| 108000 | Tonnes | Throughput-based | Cooler cleaning, guarding inspections |
| 432000 | Tonnes | Throughput-based | Hose line inspections, roller bolt checks |
| 1 | Cycles/Days | Daily | Breather inspections |
| 1 | Cycles/Months | Monthly | Oil sampling |
| 2 | Weeks | Bi-weekly | Pump swap alternation |
| 84 | Days | ~3 months | Pushbutton seal inspections |

### Tactics Type Distribution

- **Condition Based** -- Majority of tasks (inspect, test, then act if needed)
- **Fixed Time** -- Scheduled replacement/cleaning regardless of condition
- **Run Until Failure** -- No proactive task; replace on failure (e.g., proportional valves, filter housings)

---

## 3. Strategy 2: HITACHI EH3000 Dump Truck

**Asset:** HITACHI EH3000 AC Drive Dump Truck
**Export Date:** 2018-06-07
**Total Tactics:** 691 rows
**Source:** Anglo Tactics Library + Mechanical/Electrical Workshops (May 2018)

### Column Structure (26 columns)

| Column | Description | Example |
|--------|-------------|---------|
| Id | Unique tactic row identifier | `270786` |
| Notes | Additional notes | `Not Applicable`, `NEW`, `RECOMMENDED TO EXTEND THE INTERVAL` |
| Status | Recommendation status | `Recommended`, `Redundant` |
| Strategy Id | Strategy reference | `289976` |
| Maintainable Item | Component/sub-assembly | `Accumulator, Brake, Front` |
| Existing Task | Source of the task | `Anglo Tactics Library`, `Mech WS 08-05`, `Elec WS 03-05-18` |
| What | Failure mode item | `Accumulator`, `PLM`, `Brake Accumulator` |
| Mechanism | How it fails | `drops`, `drifts`, `cracks`, `loose`, `wears` |
| Cause | Root cause | `use`, `fatigue`, `vibration`, `abrasion`, `age` |
| Tactics Type | Strategy classification | `Condition Based`, `Fixed Time`, `Run Until Failure` |
| Primary Task Id | Task identifier | `289976` |
| Primary Task | Main task description | `Check and record brake accumulator nitrogen pressure reading` |
| Primary Task Interval | Numeric interval | `500`, `250`, `1000`, `2000`, `28` |
| Operational Units | Unit type | `Operational Hours` |
| Time Units | Calendar time unit | `Days` |
| Primary Task Acceptable Limits | Pass/fail criteria | `1400 +/- 50 psi`, `No cracks`, `Torque mark is aligned` |
| Primary Task Conditional Comments | Action when condition not met | `Note: ensure manifold taps are fully open` |
| Primary Task Constraint | Online/Offline | `Offline`, `Online`, `In Test Mode` |
| Primary Task Task Type | Classification | `Inspection`, `Test`, `Adjust`, `Replace`, `Clean` |
| Secondary Task Id | Follow-up task ID | `289731` |
| Secondary Task | Corrective task | `Recharge front brake accumulator` |
| Secondary Task Constraint | Online/Offline for corrective | `Offline` |
| Budgeted Life Time Units | Life unit | _(blank)_ |
| Primary Task Access Time | Hours needed for access | `0.1`, `0.25`, `1` |
| Secondary Task Task Type | Corrective task type | `Repair`, `Replace`, `Adjust`, `Clean` |
| Secondary Task Access Time | Access time for corrective | `0.5`, `1`, `2`, `3`, `6`, `10` |

### Key Maintainable Items (Components)

- Accumulator, Brake (Front/Rear)
- Accumulator, Steering (Front)
- Armature, Drive Motor (Left/Right)
- Automatic Fire Control Panel
- Brake, Service (Front Left/Right)
- Brake System
- Cabin / Cab Interior
- Contactor, Drive System (P1, MF, GF, RP1-RP5)
- Electric Drive & Control
- Fan Drive Hub
- Grid Blower
- Heater / Air Conditioning
- Hose/Line, Brake
- Motor, Wheel Drive (Left/Right)
- Motor, Electric, Starter
- Nose Cone
- RCB Valves, Brake
- Steering System
- Valve, Brake Pedal Assembly

### Interval Patterns

| Interval | Units | Equivalent | Common Tasks |
|----------|-------|------------|--------------|
| 28 | Days | Monthly | Fire panel checks, heater inspections, A/C switch checks |
| 84 | Days | Quarterly | Fire indicator checks |
| 250 | Operational Hours | ~10 days | Brake calliper, brake pad, PLM calibration |
| 500 | Operational Hours | ~21 days | Accumulator pressure, contactor inspections, blower checks |
| 1000 | Operational Hours | ~42 days | Accumulator gas pressure, fan hub bearing |
| 2000 | Operational Hours | ~83 days | Drive ring spline, dynamic brake test |
| 15000 | Operational Hours | ~625 days | Brake valve replacement (fixed time) |
| 24000 | Operational Hours | ~1000 days | Brake accumulator bladder replacement |

### Unique Features

- **Access Time fields** -- Both primary and secondary tasks have estimated access time in hours
- **"In Test Mode" constraint** -- Some tasks require the truck to be in a specific test mode
- **Workshop source tracking** -- Tasks tagged with workshop dates (e.g., `Mech WS 08-05`, `Elec WS 03-05-18`)
- **Status includes "Redundant"** -- Tasks marked as no longer needed with explanation in Notes

---

## 4. Strategy 3: Correct Medium Pump

**Asset:** Correct Medium Centrifugal Slurry Pump
**Total Tactics:** 96 rows
**Source:** Anglo Tactics Library + Workshop sessions (May 2018)

### Column Structure (34 columns)

This is the most detailed template with additional columns:

| Column | Description | Example |
|--------|-------------|---------|
| Notes | Strategic notes | `ASSET: Not applicable`, `STRATEGY: Consider Auto-Lube System` |
| Strategy Id | Strategy reference | `1724`, `4254` |
| Equipment / Library Component | Asset type | `Correct Medium Pump` |
| Maintainable Item | Component | `Bearing Assembly, Pump`, `Motor, Electric (Greased, VA)` |
| Function & Failure | Full F&F description | `Operating Cost-To provide smooth rotation-Restriction to rotate-Primary Function` |
| Existing Task | Source | `Anglo Tactics Library`, `Mech WS 21-05`, `Elect W/S 29052018` |
| Deconstructed Task | Breakdown of existing task | _(various)_ |
| What | Failure mode item | `Impeller Release Mechanism`, `Cooling Fan`, `Motor Cooling Fins` |
| Mechanism | How it fails | `breaks`, `blocks`, `build up`, `corrodes`, `wears`, `shears` |
| Cause | Root cause | `fatigue`, `contamination`, `environment`, `abrasion`, `overload` |
| Status | Status | `Recommended`, `Redundant` |
| Tactics Type | Strategy type | `Condition Based`, `Fixed Time`, `Run Until Failure`, `Redesign` |
| Primary Task Id | Task ID | `1899`, `1997` |
| Primary Task | Task description | `Clean the drive motor fins, cooling fan, cowling and cooling fins` |
| Primary Task Acceptable Limits | Criteria | _(various)_ |
| Primary Task Conditional Comments | Action notes | `Report to supervisor immediately` |
| Primary Task Interval | Interval value | `7`, `168`, `336` |
| Operational Units | Unit | `Operational Hours` |
| Time Units | Time unit | `Days` |
| Primary Task Constraint | Online/Offline | `Offline`, `Online` |
| Primary Task Access Time | Access hours | `0.1`, `4.5` |
| Primary Task Task Type | Type | `Clean`, `Ultrasonic Testing`, `Repair`, `Inspection` |
| Secondary Task Id | Corrective task ID | `1878`, `1996` |
| Secondary Task | Corrective task | `Replace impeller release collar mechanism` |
| Secondary Task Constraint | Constraint | `Offline` |
| Budgeted As | Budget category | `Not Budgeted`, `Replace` |
| Budgeted Life | Expected life | _(numeric)_ |
| Budgeted Life Time Units | Life units | `Years` |
| Budgeted Life Operational Units | Operational life units | _(various)_ |
| Justification Category | Reason for recommendation | `Redundant` |
| Justification | Detailed reasoning | `Corrosion/dirt unlikely if seals are intact...` |
| Secondary Task Comments | Additional corrective notes | `Align motor and do baseline condition monitoring` |
| Secondary Task Task Type | Corrective type | `Replace`, `Repair` |
| Secondary Task Access Time | Access time | `2`, `6` |

### Key Maintainable Items

- Bearing Assembly, Pump
- Motor, Electric (Greased, VA)
- V Pulley, Drive
- V Pulley, Driven
- Pump Wet End, Centrifugal, Slurry

### Interval Patterns

| Interval | Units | Equivalent | Tasks |
|----------|-------|------------|-------|
| 7 | Days | Weekly | Motor cleaning (fins, fan, cowling) |
| 168 | Days | ~6 months | Pump overhaul |
| 336 | Days | ~1 year | Ultrasonic testing on terminations |
| 0 | Operational Hours | Run Until Failure | Key shearing, motor replacement |

### Unique Features

- **Redesign tactics type** -- Includes recommendation for design changes (e.g., "Consider Auto-Lube System")
- **Function & Failure descriptions** -- Full RCM-style functional failure descriptions
- **Justification field** -- Explains WHY tasks are recommended or made redundant
- **Secondary Task Comments** -- Post-replacement instructions (e.g., "Align motor and do baseline condition monitoring")
- **Budgeted Life with Operational Units** -- Dual-unit life expectancy tracking
- **Most detailed column set** (34 columns vs 26-30 in other strategies)

---

## 5. Strategy 4: Komatsu 830E Truck -- Chilean Operation

**Asset:** Komatsu 830E Dump Truck
**Context:** DEV (Development) -- BD Santiago, Chile
**Export Format:** MaintenanceStrategy (different from AssetTactics format)

### Column Structure

This strategy uses a different export format focused on the maintenance strategy structure rather than individual tactics. The data includes:

- Strategy organization by maintainable item
- Task definitions with intervals
- Constraint mappings (Online/Offline)
- Workshop session references
- Bilingual content (Spanish task descriptions where applicable)

### Key Distinction

This template represents a development/draft strategy (`DEV` prefix) being built for a Chilean operation, showing the strategy-building process in action rather than a finalized export.

---

## 6. Common Patterns Across All Strategies

### Universal Strategy Structure

Every strategy follows this hierarchy:

```
Equipment / Library Component
  |
  +-- Maintainable Item (Component)
        |
        +-- What (Failure Mode Item)
              |
              +-- Mechanism (How it fails)
              +-- Cause (Why it fails)
              +-- Tactics Type (Strategy approach)
              +-- Primary Task (Proactive maintenance task)
              |     +-- Interval
              |     +-- Acceptable Limits
              |     +-- Constraint (Online/Offline)
              |     +-- Task Type
              |
              +-- Secondary Task (Corrective/follow-up)
                    +-- Constraint
                    +-- Task Type
```

### Common Failure Mechanisms

| Mechanism | Description | Frequency |
|-----------|-------------|-----------|
| `wears` | Progressive material loss | Very Common |
| `loose` | Loss of fastener tension | Very Common |
| `corrodes` | Chemical degradation | Common |
| `degrades` | General deterioration with age | Common |
| `blocks` | Flow restriction from contamination | Common |
| `breaks` | Sudden structural failure | Common |
| `cracks` | Fatigue-induced fractures | Common |
| `drops` | Pressure/level loss | Common |
| `build up` | Accumulation of material | Moderate |
| `binds` | Restricted movement | Moderate |
| `short-circuits` | Electrical fault | Moderate |
| `holes` | Impact damage | Less Common |
| `burns` | Over-current damage | Less Common |
| `drifts` | Calibration shift | Less Common |
| `shears` | Overload fracture | Less Common |
| `open-circuit` | Loss of electrical continuity | Less Common |

### Common Failure Causes

| Cause | Description |
|-------|-------------|
| `vibration` | Mechanical vibration causing looseness |
| `abrasion` | Wear from particle contact |
| `contamination` | Foreign material ingress |
| `age` | Time-dependent degradation |
| `fatigue` | Cyclic stress failure |
| `environment` | Exposure to weather/chemicals |
| `use` | Normal operational wear |
| `overload` | Exceeding design capacity |
| `erosion` | Fluid-borne particle wear |
| `impact` | Sudden force application |
| `over-current` | Electrical overload |

---

## 7. Tactics Type Distribution and Usage Guide

### Tactics Types Defined

| Tactics Type | Description | When to Use |
|-------------|-------------|-------------|
| **Condition Based** | Inspect/monitor, act only if condition warrants. Primary task is inspection; secondary task is corrective action. | When failure is detectable before functional loss. Most common type. |
| **Fixed Time** | Replace/overhaul at fixed intervals regardless of condition. | When failure mode is age-related and not reliably detectable, or when the cost of inspection exceeds replacement. |
| **Run Until Failure** | No proactive maintenance. Replace on failure. Only secondary task defined. | When failure has no safety consequence, no production impact, and the cost of prevention exceeds failure cost. Primary Task Interval = 0. |
| **Redesign** | Recommend a design change to eliminate the failure mode. | When no maintenance task can effectively manage the failure mode. |

### Typical Distribution

Based on the analyzed strategies:

| Tactics Type | Approximate % | Notes |
|-------------|--------------|-------|
| Condition Based | 60-70% | Dominant approach for most components |
| Fixed Time | 15-25% | Cleaning, scheduled replacements |
| Run Until Failure | 10-15% | Low-consequence failures |
| Redesign | <5% | Design improvement recommendations |

---

## 8. Task Type Classification Reference

### Primary Task Types

| Task Type | Description | Example |
|-----------|-------------|---------|
| **Inspection** | Visual or physical examination | `Inspect brake calliper mounting for cracking` |
| **Test** | Functional verification or performance test | `Test LCU isolator micro switch for correct operation` |
| **Clean** | Remove contamination or buildup | `Clean the drive motor fins, cooling fan, cowling and cooling fins` |
| **Adjust** | Calibrate, tighten, or modify settings | `Calibrate PLM if required based on download data` |
| **Fluid Analysis** | Oil/fluid sampling and laboratory analysis | `Take oil sample` |
| **Ultrasonic Testing** | NDT using ultrasonic equipment | `Perform ultrasound test on termination boxes` |
| **Replace** | Scheduled component replacement (Fixed Time) | `Replace brake valve pedal assembly` |
| **Repair** | Scheduled restoration (Fixed Time) | `Tighten cooler mounting bolts` |

### Secondary Task Types

| Task Type | Description | Example |
|-----------|-------------|---------|
| **Replace** | Swap component with new/refurbished | `Replace LCU enclosure locking mechanism` |
| **Repair** | Restore to working condition | `Repair terminal connections` |
| **Adjust** | Re-calibrate or re-align | `Adjust contactor or replace faulty over travel spring` |
| **Clean** | Remedial cleaning | `Clean grid blower motor fan` |

---

## 9. Interval Patterns and Frequency Standards

### Time-Based Intervals

| Interval | Unit | Common Name | Typical Use |
|----------|------|-------------|-------------|
| 1 | Days | Daily | Critical safety checks, greasing |
| 7 | Days | Weekly | Motor cleaning, visual inspections |
| 14 | Days | Fortnightly | Pump alternation, general checks |
| 28 | Days | Monthly | Fire system checks, HVAC inspections |
| 84 | Days | Quarterly | Indicator checks, seal inspections |
| 168 | Days | 6-Monthly | Pump overhauls, major inspections |
| 336 | Days | Annually | Door seals, NDT, annual overhauls |

### Operating Hour-Based Intervals

| Interval | Unit | Approx. Days* | Typical Use |
|----------|------|--------------|-------------|
| 250 | Operational Hours | ~10 | Brake inspections, PLM calibration |
| 500 | Operational Hours | ~21 | Service inspections, contactor checks |
| 600 | Operational Hours | ~25 | Emergency stop checks |
| 1000 | Operational Hours | ~42 | Accumulator gas checks, bearing inspections |
| 1800 | Operational Hours | ~75 | Pushbutton checks |
| 2000 | Operational Hours | ~83 | Drive ring inspections, brake tests |
| 7200 | Operational Hours | ~300 | Isolator mechanism inspections |
| 15000 | Operational Hours | ~625 | Major component replacements |
| 24000 | Operational Hours | ~1000 | Accumulator bladder replacements |

_* Assuming ~24 operating hours/day for mobile equipment._

### Throughput-Based Intervals

| Interval | Unit | Typical Use |
|----------|------|-------------|
| 108000 | Tonnes | Cooler cleaning, guarding inspections |
| 432000 | Tonnes | Hose inspections, roller bolt checks |

### Constraint Mapping

| Constraint | Meaning | Example Context |
|-----------|---------|-----------------|
| **Offline** | Equipment must be shut down and isolated | Most inspections and all replacements |
| **Online** | Can be performed while equipment is running | Visual inspections, guarding checks, breather inspections |
| **In Test Mode** | Equipment in specific test/diagnostic mode | Dynamic brake tests, starter motor tests |
