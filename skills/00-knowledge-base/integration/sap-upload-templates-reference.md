# SAP Upload Templates Reference

> **Used By Skills:** `generate-work-instructions`, `assemble-work-packages`, `sap-integration`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Template Source and Context](#2-template-source-and-context)
3. [Maintenance Item Template](#3-maintenance-item-template)
4. [Task List Template](#4-task-list-template)
5. [Work Plan (Maintenance Plan) Template](#5-work-plan-maintenance-plan-template)
6. [Field Relationships and Data Flow](#6-field-relationships-and-data-flow)
7. [Validation Rules and Constraints](#7-validation-rules-and-constraints)
8. [Example Data Walkthrough](#8-example-data-walkthrough)

---

## 1. Overview

This document describes the three SAP PM (Plant Maintenance) upload templates used for creating maintenance plans from strategy output. These templates are designed for mass upload of maintenance items, task lists, and work plans into SAP.

**Source directory:**
```
asset-management-methodology/sap-upload-sheets-template-(MIS-P01-BF01-F740-7310)/
```

The naming convention `MIS-P01-BF01-F740-7310` represents the functional location used in the example data (a Warman Pump 3/2 at a mining site).

---

## 2. Template Source and Context

| Template File | SAP Transaction | Purpose |
|---------------|-----------------|---------|
| `Maintenance Item.xlsx` | IP04 (linked) | Defines WHAT gets maintained and HOW OFTEN |
| `Task List.xlsx` | IA11 | Defines the OPERATIONS (steps) to perform |
| `Work Plan.xlsx` | IP41 | Defines the SCHEDULING parameters |

**Example Equipment:** 2-Weekly Warman Pump 3/2 Service at Functional Location `MIS-P01-BF01-F740-7310`

---

## 3. Maintenance Item Template

**File:** `Maintenance Item.xlsx`
**Rows:** 2 (1 header + 1 data row)
**Columns:** 18

### Column Definitions

| # | Column Header | Description | Example Value | Required | Validation |
|---|---------------|-------------|---------------|----------|------------|
| 1 | **Maintenance Item number** | Unique identifier for the maintenance item. Use placeholder `$MI1` for auto-assignment or cross-referencing. | `$MI1` | Yes | Must be unique. Use `$MI[n]` for template references. |
| 2 | **Maintenance Item Description** | Short text describing the maintenance item (max 40 chars in SAP). | `2W Warman Pump 3/2 Service` | Yes | Max 40 characters. |
| 3 | **Maintenance Item Long Text** | Extended description for additional detail. | _(empty)_ | No | Free text. |
| 4 | **OrdType** | SAP Order Type for the generated work orders. | `PM03` | Yes | Must be valid SAP order type. Common values: `PM01` (Corrective), `PM02` (Preventive scheduled), `PM03` (Preventive condition-based). |
| 5 | **MaintActivityType** | Maintenance activity type code. | `2` | Yes | Numeric code defined in SAP customizing. |
| 6 | **Maintenance Strategy** | SAP maintenance strategy if using strategy-based planning. | _(empty)_ | No | Must match an existing SAP strategy if provided. Leave blank for single-cycle plans. |
| 7 | **System Condition** | Operating condition of the system during maintenance. | _(empty)_ | No | Typical values: blank (default), `1` (in operation), `2` (not in operation). |
| 8 | **PlanPlant** | Planning plant code. | `K210` | Yes | Must be valid SAP plant code. |
| 9 | **Priority** | Priority of generated work orders. | `HIGH-7 DAYS` | Yes | Must match SAP priority values. Format: `[Priority]-[Response Time]`. |
| 10 | **Main Work Center** | Primary work center responsible for the maintenance. | `S32A1` | Yes | Must be valid SAP work center. |
| 11 | **Work Center Plant** | Plant of the main work center. | _(empty)_ | Conditional | Required if work center is in a different plant than PlanPlant. |
| 12 | **Maintenance Planner Group** | Planner group code. | `41` | Yes | Must be valid SAP planner group. |
| 13 | **Functional Location** | SAP Functional Location where the equipment is installed. | `MIS-P01-BF01-F740-7310` | Yes* | Either Functional Location or Equipment must be provided. |
| 14 | **Equipment** | SAP Equipment number. | _(empty)_ | Yes* | Either Functional Location or Equipment must be provided. |
| 15 | **Assembly** | Sub-equipment/assembly reference. | _(empty)_ | No | Must be valid SAP equipment if provided. |
| 16 | **Group** | Task list group reference. Cross-references the Task List template. | `$TL1` | Yes | Must match a Task List Group in the Task List template. Use `$TL[n]` for template references. |
| 17 | **Counter** | Task list counter (sequential numbering within group). | `1` | Yes | Numeric. Typically starts at 1. |
| 18 | **TaskLstTpe** | Task list type. | `T` | Yes | `T` = Equipment task list, `A` = General task list, `E` = Equipment task list (alternate). |

---

## 4. Task List Template

**File:** `Task List.xlsx`
**Rows:** 3 (1 header + 2 data rows showing 2 operations)
**Columns:** 25

### Column Definitions

| # | Column Header | Description | Example Value | Required | Validation |
|---|---------------|-------------|---------------|----------|------------|
| 1 | **Transaction code** | SAP transaction for creating the task list. | `IA11` | Yes | `IA11` = Create General Task List, `IA01` = Create Equipment Task List. |
| 2 | **Functional Location** | Functional location reference. | `MIS-P01-BF01-F740-7310` | Yes | Must be valid SAP functional location. |
| 3 | **Task List Group** | Group identifier linking to Maintenance Item. Use placeholder for cross-reference. | `$TL1` | Yes | Must match the Group in Maintenance Item template. |
| 4 | **Task List Counter** | Sequential counter within the group. | `1` | Yes | Numeric, starting at 1. |
| 5 | **Task List Description** | Short text describing the task list. | `2 weekly Warman Pump 3/2 Service` | Yes | Max 40 characters. |
| 6 | **Task List Long Text** | Extended description. | _(empty)_ | No | Free text. |
| 7 | **Planning Plant** | Plant where planning is done. | `K210` | Yes | Must match PlanPlant in Maintenance Item. |
| 8 | **Main Work Centre** | Primary work center for the task list. | `S32A1` | Yes | Must be valid SAP work center. |
| 9 | **Work Centre Plant** | Plant of the main work centre. | _(empty)_ | Conditional | Required if different from Planning Plant. |
| 10 | **Task List Usage** | Usage indicator for the task list. | `4` | Yes | `4` = Plant Maintenance, `1` = Production, `9` = Multiple usage. |
| 11 | **Responsible Planner Group** | Planner group responsible. | `20` | Yes | Must be valid SAP planner group. |
| 12 | **Processing Status of Task List** | Status code for the task list. | `4` | Yes | `4` = Released. Other values: `1`=Created, `2`=In process, `3`=Completed. |
| 13 | **System condition** | System condition during task execution. | `3` | No | `3` = Not in operation (offline). |
| 14 | **Maintenance Strategy** | Strategy reference if strategy-based. | _(empty)_ | No | Must match SAP strategy. |
| 15 | **Assembly** | Sub-assembly reference. | _(empty)_ | No | Valid SAP equipment number. |
| 16 | **Operation Number** | Sequential operation number within the task list. | `10`, `20` | Yes | Numeric. Typically increments by 10 (10, 20, 30...). |
| 17 | **Work Centre** | Work center for this specific operation. | `S32A2ME`, `S32A1MF` | Yes | Must be valid SAP work center. Allows different trades per operation. |
| 18 | **Work Centre Plant** | Plant of the operation work centre. | `K210` | Yes | Must be valid SAP plant. |
| 19 | **Control key** | SAP control key for the operation. | `PMIN` | Yes | Controls what is schedulable, confirmable, printable. Common: `PM01` (internal), `PM02` (external), `PMIN` (inspection). |
| 20 | **Operation Short Text** | Short description of the operation/step. | `2 weekly Pump Service Auto Electrician` | Yes | Max 40 characters. |
| 21 | **Long Text** | Extended operation description. | _(empty)_ | No | Free text. Contains detailed work instructions. |
| 22 | **Operation labor/Work Duration** | Planned work duration (labour hours). | `3` | Yes | Numeric, in the unit specified by column 23. |
| 23 | **Unit of work** | Unit for work duration. | `H` | Yes | `H` = Hours, `MIN` = Minutes, `TAG` = Days. |
| 24 | **Normal Operation Duration** | Calendar duration for the operation. | `3` | Yes | Numeric. The elapsed time needed. |
| 25 | **Number of Capacities Required** | Number of persons/resources needed for the operation. | `1` | Yes | Numeric. Determines labour multiplier. |

### Example Operations

| Op # | Work Centre | Control Key | Description | Work Hrs | Capacities |
|------|-------------|-------------|-------------|----------|------------|
| 10 | S32A2ME | PMIN | 2 weekly Pump Service Auto Electrician | 3 H | 1 |
| 20 | S32A1MF | PMIN | 2 weekly Pump Service Fitter | 3 H | 1 |

---

## 5. Work Plan (Maintenance Plan) Template

**File:** `Work Plan.xlsx`
**Rows:** 2 (1 header + 1 data row)
**Columns:** 21

### Column Definitions

| # | Column Header | Description | Example Value | Required | Validation |
|---|---------------|-------------|---------------|----------|------------|
| 1 | **Transaction code** | SAP transaction for creating the maintenance plan. | `IP41` | Yes | `IP41` = Create Single Cycle Plan, `IP42` = Create Strategy Plan. |
| 2 | **Maintenance Plan** | Unique maintenance plan identifier/number. | `F740-7310-2W` | Yes | Must be unique in SAP. Convention: `[FuncLoc-suffix]-[Frequency]`. |
| 3 | **Maintenance Plan Category** | Category of the maintenance plan. | `PM` | Yes | `PM` = Preventive Maintenance. Also: `CM` = Condition-based. |
| 4 | **Maintenance Plan Description** | Short text for the plan. | `2W Warman Pump 3/2 Service` | Yes | Max 40 characters. |
| 5 | **Maintenance Plan Long Text** | Extended description. | _(empty)_ | No | Free text. |
| 6 | **Strategy** | SAP maintenance strategy (for strategy plans). | _(empty)_ | No | Must be valid SAP strategy. Leave blank for single-cycle plans. |
| 7 | **Cycle** | Numeric interval between scheduled calls. | `14` | Yes | Numeric. Defines the repeat frequency. |
| 8 | **Cycle Unit** | Unit of measure for the cycle. | `DAY` | Yes | `DAY`, `WEEK`, `MONTH`, `YEAR`, or counter-based units. |
| 9 | **Cycle Text** | Human-readable description of the cycle. | `2 WEEKLY` | Yes | Free text describing the frequency. |
| 10 | **Measuring Point** | SAP measuring point for counter-based plans. | _(empty)_ | Conditional | Required for counter-based maintenance (e.g., operating hours). |
| 11 | **Shift Factor for Late Completion** | How to handle late completions in scheduling. | _(empty)_ | No | Numeric factor. Blank = SAP default. |
| 12 | **Tolerance for Late Completion (%)** | Percentage tolerance for late scheduling. | _(empty)_ | No | Percentage (0-100). |
| 13 | **Shift Factor for Early Completion** | How to handle early completions. | _(empty)_ | No | Numeric factor. |
| 14 | **Tolerance for Early Completion (%)** | Percentage tolerance for early scheduling. | _(empty)_ | No | Percentage (0-100). |
| 15 | **Cycle modification factor** | Factor to modify the cycle interval. | `1` | Yes | Numeric. `1` = no modification. Values > 1 extend, < 1 shorten. |
| 16 | **Scheduling Period** | How far ahead to schedule. | `30` | Yes | Numeric, in units of column 17. |
| 17 | **Unit in scheduling interval** | Unit for the scheduling period. | `DAY` | Yes | `DAY`, `WEEK`, `MONTH`, `YEAR`. |
| 18 | **Call Horizon** | Percentage of the cycle at which the call is generated. | `50` | Yes | Percentage (0-100). At 50%, the work order is generated halfway through the cycle. |
| 19 | **Sort Field** | Classification/sorting text. | `TIME BASED PREVENTIVE` | No | Free text. Used for categorizing plans. Common values: `TIME BASED PREVENTIVE`, `CONDITION BASED`, `STATUTORY`. |
| 20 | **Authorization Group** | SAP authorization group for access control. | `41` | No | Must match SAP authorization group. |
| 21 | **Maintenance Item** | Cross-reference to the Maintenance Item. | `$MI1` | Yes | Must match Maintenance Item number from the MI template. |

---

## 6. Field Relationships and Data Flow

### Cross-Reference Diagram

```
Work Plan (IP41)                Maintenance Item (IP04)           Task List (IA11)
==================              =======================           ================
Maintenance Plan ---references--> Maintenance Item number
                                  Group --------references------> Task List Group
                                  Counter ------references------> Task List Counter
                                  PlanPlant ----must match-------> Planning Plant
                                  Main Work Center --matches----> Main Work Centre
                                  Functional Location --matches--> Functional Location
```

### Placeholder Cross-Referencing System

The templates use a `$` prefix placeholder system for linking records before upload:

| Placeholder | Used In | Links To |
|-------------|---------|----------|
| `$MI1` | Maintenance Item number (MI template), Maintenance Item (WP template) | Links Work Plan to its Maintenance Item |
| `$TL1` | Group (MI template), Task List Group (TL template) | Links Maintenance Item to its Task List |

For multiple items in a single upload, increment the number: `$MI1`, `$MI2`, `$MI3`, etc.

---

## 7. Validation Rules and Constraints

### Mandatory Field Combinations

1. **Functional Location OR Equipment** must be provided in the Maintenance Item (at least one).
2. **Task List Group + Counter** must be unique per task list.
3. **Operation Number** must be unique within a task list (Group + Counter combination).
4. **Maintenance Plan** identifier must be unique across the SAP system.

### Data Type Constraints

| Field Type | Constraint |
|-----------|------------|
| Short Text fields | Max 40 characters |
| Plant codes | 4-character alphanumeric |
| Work Center codes | Alphanumeric, plant-specific |
| Numeric fields (Cycle, Duration) | Positive numbers |
| Percentage fields | 0-100 |
| Unit fields | Must match SAP unit of measure catalog |

### Common Pitfalls

1. **Description length:** SAP truncates at 40 characters for short text fields.
2. **Work center plant mismatch:** The Work Centre Plant must be a valid plant in SAP where the work center exists.
3. **Missing cross-references:** The `$MI[n]` and `$TL[n]` placeholders must resolve to valid records before upload.
4. **Control key selection:** Using `PMIN` (inspection) vs `PM01` (internal) affects scheduling and confirmation behavior.
5. **Cycle unit consistency:** The Cycle value and Cycle Unit must be logically consistent (e.g., 14 DAY = 2 WEEKLY).

---

## 8. Example Data Walkthrough

### Scenario: 2-Weekly Warman Pump 3/2 Service

**Functional Location:** `MIS-P01-BF01-F740-7310`
**Frequency:** Every 14 days (2 weekly)
**Order Type:** PM03 (Preventive condition-based)
**Priority:** HIGH-7 DAYS

#### Step 1: Task List (defines the work)

Two operations are defined:

| Operation | Work Centre | Trade | Duration | Description |
|-----------|-------------|-------|----------|-------------|
| 10 | S32A2ME | Auto Electrician | 3 hours | 2 weekly Pump Service Auto Electrician |
| 20 | S32A1MF | Fitter | 3 hours | 2 weekly Pump Service Fitter |

- Task List Group: `$TL1`, Counter: `1`
- Status: `4` (Released)
- System condition: `3` (Not in operation / Offline)
- Control key: `PMIN` (Inspection)

#### Step 2: Maintenance Item (links task list to equipment)

| Field | Value |
|-------|-------|
| MI Number | `$MI1` |
| Description | 2W Warman Pump 3/2 Service |
| Order Type | PM03 |
| Plant | K210 |
| Priority | HIGH-7 DAYS |
| Work Center | S32A1 |
| Planner Group | 41 |
| Functional Location | MIS-P01-BF01-F740-7310 |
| Task List Group | `$TL1` |
| Task List Type | T |

#### Step 3: Work Plan (defines scheduling)

| Field | Value |
|-------|-------|
| Plan ID | F740-7310-2W |
| Category | PM |
| Description | 2W Warman Pump 3/2 Service |
| Cycle | 14 DAY |
| Cycle Text | 2 WEEKLY |
| Cycle Mod Factor | 1 |
| Scheduling Period | 30 DAY |
| Call Horizon | 50% |
| Sort Field | TIME BASED PREVENTIVE |
| Maintenance Item | `$MI1` |

#### Naming Convention for Plan ID

Format: `[FuncLoc-Suffix]-[Frequency]`
- `F740-7310` = Last portion of functional location
- `2W` = 2 Weekly

Other common frequency codes:
- `1D` = Daily
- `1W` = Weekly
- `2W` = 2 Weekly (Fortnightly)
- `4W` = 4 Weekly (Monthly)
- `13W` = 13 Weekly (Quarterly)
- `26W` = 26 Weekly (Semi-Annual)
- `52W` = 52 Weekly (Annual)
- `500H` = 500 Hours
- `1000H` = 1000 Hours
