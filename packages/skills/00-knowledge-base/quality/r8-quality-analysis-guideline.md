# Quality Analysis Guideline for R8 Tactics

---

> **Used By Skills:** validate-quality, perform-fmeca

---

| Metadata | Value |
|---|---|
| **Source File** | `asset-management-methodology/R8-software-maintenance-strategy-quality-analysis-guideline.pdf` |
| **Pages** | 5 |
| **Conversion Date** | 2026-02-23 |
| **Format** | Procedural guideline with numbered sections and rules |

---

## Table of Contents

- [1. Main Procedure](#1-main-procedure)
- [2. Hierarchy Mode](#2-hierarchy-mode)
- [3. Function Mode](#3-function-mode)
- [4. Criticality Analysis Mode](#4-criticality-analysis-mode)
- [5. Asset Tactics Mode](#5-asset-tactics-mode)
- [6. Work Package Mode](#6-work-package-mode)

---

## 1. Main Procedure

### 1.1 Functional Location Import

Ask for the site's functional location dump and import into the Plant Hierarchy using the Basic Hierarchy Import feature. Import all levels until the level previous to equipment (usually Level 4).

### 1.2 Asset Tactic Development Starting from Scratch

- Develop asset tactics in the **Sandbox** environment
- When finished, paste the asset in the **Equipment Library**. Follow the Equipment Library's naming convention
- Insert embedded equipment reference into the Plant Hierarchy to align all the hierarchy to the site ERP
- **ALL EQUIPMENTS IN THE PLANT HIERARCHY MUST BE REFERENCED FROM THE EQUIPMENT LIBRARY**
- Equipment in the Plant Hierarchy must be aligned to ERP parameters (Functional Location, Cost Centre, etc.)

### 1.3 Asset Tactic Development Starting from an Asset in the Equipment Library

- Copy the selected equipment in the Equipment Library and paste it in the Sandbox
- Follow the 1.2 procedure
- **IMPORTANT:** Do not delete the original equipment in the Equipment Library. The newly developed equipment will be a new asset in the Equipment Library.

### 1.4 Sandbox Equipment Naming Convention

| Field | Convention |
|---|---|
| **Equipment name** | `Equipment Make - Equipment Model - Operational Context` (if applicable, or identifier to differentiate two equipment with the same make and model) |
| **Notes** | `Date of last modification - Developer name` |
| **Code** | `DRAFT` / `WAITING APPROVAL` / `WAITING FOR MATERIALS` |

**Examples:**
- `Hitachi - EH3000 - Coaling`
- `Hitachi - EH3000 - Rehabilitation`

### 1.5 Equipment Library Naming Convention

| Field | Convention |
|---|---|
| **Equipment name** | `Equipment Make - Equipment Model - Operational Context` (if applicable, or identifier to differentiate) |
| **Notes** | `Date of last modification/Approval - Developer name` |
| **Code** | Ellipse EGI or SAP Assembly (if available) |

---

## 2. Hierarchy Mode

### 2.1 Asset Hierarchy Levels

Only build the ASSET hierarchy to **3 Levels**:

| Level | Description |
|---|---|
| **Level 1** | Equipment |
| **Level 2** | System (Folder / Maintainable) |
| **Level 3** | Maintainable Item |

### 2.2 Component Type Codes

Put the Ellipse / SAP component type code on every maintainable item.

---

## 3. Function Mode

### 3.1 System Functions (Mandatory)

All systems must have their relevant **function** and **functional failures** defined.

### 3.2 Maintainable Item Functions (Mandatory)

Maintainable items must have their **function** and **functional failures** defined.

---

## 4. Criticality Analysis Mode

### 4.1 Equipment Criticality (Mandatory)

Every equipment must have the criticality defined at an **equipment level**.

### 4.2 System Criticality (Mandatory)

All systems must have their relevant **criticality** defined.

### 4.3 Maintainable Item Criticality (Optional)

Maintainable items may also have their relevant criticality defined.

### 4.4 High Criticality Failure Modes

There should be a failure mode showing the **high criticality**.

---

## 5. Asset Tactics Mode

### 5.1 Existing Task Field

Use the "Existing Task" field to populate with the following:

| Value | When to Use |
|---|---|
| `Anglo Tactics Library` | If the tactic comes from an equipment on the library |
| `MSO` | If the tactic comes from an existing task of the actual tactics |
| `WS DATE` (e.g., `WS 12/12/18`) | If the failure mode is detected in the workshop |

### 5.2 Failure Mode Rules

| Rule | Requirement |
|---|---|
| 5.2.1 | "What" must start with a **capital letter** |
| 5.2.2 | "What" must be **singular** not plural (e.g., `Seal` not `Seals`) |
| 5.2.3 | "What" should address **where the failure mode is exactly occurring** |
| 5.2.4 | "Degrades due to use" applies to **lubricants** |

### 5.3 Tactic Type Rules

| Rule | Requirement |
|---|---|
| 5.3.1 | All **Condition Based** tactics must have an **acceptable limit** and a **conditional comment** |
| 5.3.2 | All **Fault Find Interval** tactics must have an **acceptable limit** and a **conditional comment** |

### 5.4 Primary Tasks

#### 5.4.1 Inspection Task Sentence Construction

All inspection tasks should follow the sentence construction:

> **"Inspect _what_ for _that_"**

- Do NOT use "Visually inspect"
- The "what" may refer to the maintainable, the "what" as listed as part of the functional failure, a combination thereof, or a description of what the artisan should inspect
- The "what" needs to be **very specific** to the exact part of the maintainable item where the failure happens
- The "that" may refer to the mechanism or one or multiple identifiers that speak to the mechanism

#### 5.4.2 Inspection Act-Of Convention

One inspects for an **ACT OF**:

| Correct | Incorrect |
|---|---|
| Inspect _what_ for **leakage** | ~~leaks / leaking~~ |
| Inspect _what_ for **blockage** | ~~blocks / blocking~~ |
| Inspect _what_ for **breakage** | ~~breaks / breaking~~ |

#### 5.4.3 Check Tasks

"Check" is for inspections against a **measurable value** (e.g., level, temperature, functionality).

#### 5.4.4 Test Tasks

All test tasks should be written as one of:

- "Perform an operational test of ______"
- "Test functionality of ______"
- "Perform [type of test] test on ______"

#### 5.4.5 Test Task Acceptable Limits

Test tasks should have an acceptable limit reflecting the **expected function** as opposed to stating "operational".

#### 5.4.6 Conditional Comments

Conditional comments can be used for:

- Short description of what to do **immediately** if outside acceptable limits (e.g., stop motor, replace/repair)
- Short description of what to do **after** carrying out the tasks (e.g., report to Supervisor to plan for replacement or repair)
- Short description of the **procedure**
- Give the one carrying out the task to **record values**

#### 5.4.7 Task Constraints

Always define the constraints of a task:

- **Offline**
- **Online**
- **Test Mode**

#### 5.4.8 Task Type

Always define the task type:

- **Repair**
- **Replace**
- **Test**

#### 5.4.9 Labour Allocation

All primary tasks must have **labour allocated** to them and the **correct time to execute**.

#### 5.4.10 Intervals

All tasks must have **intervals** defined.

#### 5.4.11 Time Units Consistency

Tasks must have the **same Time Units** if you are using Time Units.

### 5.5 Secondary Tasks

#### 5.5.1 Maintainable Item Replacement Tasks

When it is a maintainable item replacement task, specify the **equipment** and the **maintainable item** in the task description.

> Example: "Replace Larox filter top plate"

#### 5.5.2 Secondary Task Sentence Construction

The secondary task sentence construction should follow:

> **"Replace/Repair _what_"**

- The "what" may refer to the equipment, maintainable item, the "what", or a combination thereof
- The "what" should allow the reader to **identify the equipment in the plant** as well as **add a part/material** to it based on the task alone

#### 5.5.3 Material Components

All replacement tasks must have a **materials component** in the costing.

#### 5.5.4 Labour Allocation

All tasks must have **labour allocated** to them and the **correct time to execute**.

#### 5.5.5 Task Constraints

Always define the constraints of a task: Offline, Online, or Test Mode.

#### 5.5.6 Task Type

Always define the task type: Repair, Replace, Test.

---

## 6. Work Package Mode

### 6.1 Work Package Grouping Rules

Work packages must be grouped together according to:

- **Work group type**: e.g., Mechanical, Electrical, Instrumentation
- **Constraint**: Offline and In Test Mode tasks can be together, but NOT in the same package with online tasks
- **Frequency**: Same frequency tasks grouped together

### 6.2 Task Allocation

Always make sure **every task is allocated** to a work package.

### 6.3 Work Package Types

#### Suppressive Work Packages

- Must start with the **higher interval**
- Intervals of suppressing Work Packages need to be **factors of the lowest Work Package**
- Just allocate tasks related to the interval of the work package
- Be consistent between Interval / Operational Units and the Work Package name

#### Sequential Work Packages

- The **whole sequence** must be created
- Must start from the **beginning of the sequence**
- The interval is the time or operational units **starting from the previous work package**
- Allocate **ALL** the needed tasks to each work package
- Replicate work packages that are exactly the same
- **Tip:** First create all the unique work packages, allocate the tasks, populate the parameters, and then build the sequence using copy, paste, and move features

### 6.4 Work Package Naming Convention

**Rules:**
- Capital letters always
- Format: `[FREQUENCY] [ASSET TYPE] [LABOUR TYPE] [SERV or INSP] [ONLINE or OFFLINE]`
- **Maximum characters allowed: 40**

**Examples:**

| Work Package Name | Description |
|---|---|
| `12W BALL MILL MECH SERV OFFLINE` | 12-week Ball Mill Mechanical Service Offline |
| `5000H EH3000 ELEC SERV OFFLINE` | 5000-hour EH3000 Electrical Service Offline |
| `1W LAROX FILT MECH INSP ONLINE` | 1-week Larox Filter Mechanical Inspection Online |

**Abbreviation Guide (to stay within 40 characters):**

| Full Term | Abbreviation |
|---|---|
| SERVICE | SERV |
| ONLINE | ON |
| OFFLINE | OFF |
| MECHANICAL | MECH |
| ELECTRICAL | ELEC |
| INSPECTION | INSP |
| INSTRUMENTATION | INST |

**Validation Tip:** Export your "Work Package Details Grid" to Excel. Use the `LEN()` formula to check how many characters the name has. Reduce the length until it is 40 characters or fewer. Then import the Excel file back into R8.
