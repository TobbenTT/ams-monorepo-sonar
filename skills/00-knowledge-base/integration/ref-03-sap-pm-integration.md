# REF-03: SAP PM Integration & Upload Templates Reference

## Source: SAP EAM (PM).pptx, Setting-up-Mtce-Plans-in-SAP-using R8.pdf, SAP Upload Sheet Templates

---

## 1. SAP PM Entity Model

### 1.1 Core SAP PM Entities

| SAP Entity | Transaction | R8 Equivalent | Description |
|------------|-------------|---------------|-------------|
| **Functional Location** | IH01 (Display) | Plant Hierarchy nodes | Physical location of asset |
| **Equipment** | IE03 (Display) | Equipment entity | Individual piece of equipment |
| **Notification** | IW21 (Create), IW28 (List) | N/A (work request) | Reports of problems/needs |
| **Work Order** | IW31 (Create), IW32 (Change), IW38/IW39 (List) | N/A (execution) | Execution instructions |
| **Maintenance Item** | IP04 (Create), IP18 (Display) | Work Package reference | Scheduling object linking task list to plan |
| **Task List** | IA05 (Create), IA06 (Change), IA11 (Display) | Work Package tasks | Operations to be performed |
| **Maintenance Plan** | IP41 (Create), IP02 (Change), IP03 (Display) | Collection of Maintenance Items | Scheduling container |
| **PRT (Production Resource Tools)** | CV04N | Work Instructions (PDF/Word) | Referenced documents |

### 1.2 SAP PM Hierarchy

```
Plant (IWERK, e.g., K210)
  └── Functional Location (TPLNR, e.g., MIS-P01-BF01-F740-7310)
        └── Equipment (EQUNR)
              └── Sub-Equipment / Assembly (BTEFN)
```

**Functional Location naming convention:** `SITE-AREA-SECTION-SYSTEM-POSITION`

Example: `MIS-P01-BF01-F740-7310`
- MIS = Mine/Site
- P01 = Plant 01
- BF01 = Beneficiation Area 01
- F740 = System
- 7310 = Position/Sub-system

### 1.3 Work Order Types

| Code | Type | Description |
|------|------|-------------|
| PM01 | Corrective (Breakdown) | Unplanned reactive maintenance |
| PM02 | Corrective (Planned) | Planned corrective maintenance |
| PM03 | Preventive Maintenance | Scheduled preventive tasks |

---

## 2. SAP Upload Templates

### 2.1 Cross-Reference Model

The three templates link together using placeholder variables:

```
Work Plan ($MI1)  ──references──>  Maintenance Item ($MI1)  ──references──>  Task List ($TL1)
     |                                    |                                      |
     |                                    |                                      └── Operation 10
     |                                    |                                      └── Operation 20
     |                                    |                                      └── Operation N
     |                                    |
     └── Contains 1..N ─────────────>     └── Links to exactly 1 Task List
         Maintenance Items                    via Group ($TL1) + Counter (1)
```

### 2.2 Maintenance Item Template (18 fields)

| Col | Field Name | SAP Field | Type | Example | Required | Description |
|-----|-----------|-----------|------|---------|----------|-------------|
| A | Maintenance Item Number | WARPL/WAESSION | string | `$MI1` | Y | Placeholder ID, resolved during upload |
| B | MI Description | - | string | `2W Warman Pump 3/2 Service` | Y | Short description |
| C | MI Long Text | - | string | *(empty)* | N | Extended description |
| D | Order Type | AUART | string | `PM03` | Y | PM01/PM02/PM03 |
| E | Maint Activity Type | ILART | int | `2` | Y | Activity type code |
| F | Maintenance Strategy | STRAT | string | *(empty)* | N | Strategy reference |
| G | System Condition | SYSBED | string | *(empty)* | N | 1=Running, 3=Stopped |
| H | Plan Plant | IWERK | string | `K210` | Y | 4-char plant code |
| I | Priority | PRIOK | string | `HIGH-7 DAYS` | Y | Priority + response time |
| J | Main Work Center | GEWRK | string | `S32A1` | Y | Responsible work center |
| K | Work Center Plant | PLANV | string | *(empty)* | N | WC plant (default=plan plant) |
| L | Planner Group | INGRP | int | `41` | Y | Planner group number |
| M | Functional Location | TPLNR | string | `MIS-P01-BF01-F740-7310` | Y | SAP functional location |
| N | Equipment | EQUNR | string | *(empty)* | N | SAP equipment number |
| O | Assembly | BTEFN | string | *(empty)* | N | Sub-equipment |
| P | Task List Group | PLNNR | string | `$TL1` | Y | Links to Task List |
| Q | Counter | PLNAL | int | `1` | Y | Task List variant |
| R | Task List Type | PLNTY | string | `T` | Y | T=General, A=Equipment, E=FuncLoc |

### 2.3 Task List Template (25 fields)

**Header fields (repeated per operation row):**

| Col | Field Name | SAP Field | Type | Example | Required | Description |
|-----|-----------|-----------|------|---------|----------|-------------|
| A | Transaction Code | - | string | `IA11` | Y | IA05=Create, IA06=Change, IA11=Display |
| B | Functional Location | TPLNR | string | `MIS-P01-BF01-F740-7310` | Y | Location reference |
| C | Task List Group | PLNNR | string | `$TL1` | Y | Group identifier |
| D | Task List Counter | PLNAL | int | `1` | Y | Version/counter |
| E | TL Description | KTEXT | string | `2 weekly Warman Pump 3/2 Service` | Y | Task list name |
| F | TL Long Text | - | string | *(empty)* | N | Extended description |
| G | Planning Plant | IWERK | string | `K210` | Y | Must match MI PlanPlant |
| H | Main Work Centre | GEWRK | string | `S32A1` | Y | Header-level work center |
| I | WC Plant | - | string | *(empty)* | N | Work center plant |
| J | Task List Usage | VERWE | int | `4` | Y | 4=Plant Maintenance |
| K | Planner Group | VAESSION | int | `20` | Y | Responsible planner |
| L | Processing Status | STATU | int | `4` | Y | 1=Created, 4=Released |
| M | System Condition | SYSBED | int | `3` | Y | 1=Running, 3=Stopped |
| N | Maintenance Strategy | STRAT | string | *(empty)* | N | Strategy reference |
| O | Assembly | - | string | *(empty)* | N | Sub-equipment |

**Operation-level fields (unique per row):**

| Col | Field Name | SAP Field | Type | Example | Required | Description |
|-----|-----------|-----------|------|---------|----------|-------------|
| P | Operation Number | VORNR | int | `10` | Y | Sequential, increments of 10 |
| Q | Work Centre | ARBPL | string | `S32A2ME` | Y | Operation-specific WC |
| R | WC Plant | WERKS | string | `K210` | Y | WC plant |
| S | Control Key | STEUS | string | `PMIN` | Y | PMIN=PM Internal |
| T | Operation Short Text | LTXA1 | string | `2 weekly Pump Service Auto Electrician` | Y | Operation description |
| U | Long Text | - | string | *(empty)* | N | Extended instructions |
| V | Labour/Work Duration | ARBEI | int | `3` | Y | Hours required |
| W | Unit of Work | ARBEH | string | `H` | Y | H=Hours, MIN=Minutes |
| X | Normal Duration | DAESSION | int | `3` | Y | Elapsed duration |
| Y | Capacities Required | ANZMA | int | `1` | Y | Number of workers |

### 2.4 Work Plan (Maintenance Plan) Template (21 fields)

| Col | Field Name | SAP Field | Type | Example | Required | Description |
|-----|-----------|-----------|------|---------|----------|-------------|
| A | Transaction Code | - | string | `IP41` | Y | IP41=Create with MI |
| B | Maintenance Plan | WARPL | string | `F740-7310-2W` | Y | Plan ID (System-Position-Freq) |
| C | Plan Category | WPTYP | string | `PM` | Y | PM=Preventive (time-based) |
| D | Plan Description | WPTEXT | string | `2W Warman Pump 3/2 Service` | Y | Short description |
| E | Plan Long Text | - | string | *(empty)* | N | Extended description |
| F | Strategy | STRAT | string | *(empty)* | N | Empty=single-cycle plan |
| G | Cycle | ZYKL1 | int | `14` | Y | Cycle length value |
| H | Cycle Unit | ZEINE | string | `DAY` | Y | DAY/WK/MON/YR |
| I | Cycle Text | ZTEXT | string | `2 WEEKLY` | Y | Human-readable description |
| J | Measuring Point | MESSION | string | *(empty)* | N | For counter-based plans |
| K | Late Completion Shift Factor | SFAKT | string | *(empty)* | N | 0=no shift, 1=full shift |
| L | Late Tolerance % | SPTOL | string | *(empty)* | N | % allowed late |
| M | Early Completion Shift Factor | VESSION | string | *(empty)* | N | Early completion factor |
| N | Early Tolerance % | VPTOL | string | *(empty)* | N | % allowed early |
| O | Cycle Modification Factor | ZFAKT | int | `1` | Y | 1=no modification |
| P | Scheduling Period | SPESSION | int | `30` | Y | Look-ahead window |
| Q | Scheduling Period Unit | SPEINH | string | `DAY` | Y | Unit for scheduling |
| R | Call Horizon | HESSION | int | `50` | Y | % of cycle to create WO |
| S | Sort Field | SORTF | string | `TIME BASED PREVENTIVE` | Y | Categorization |
| T | Authorization Group | BEESSION | int | `41` | Y | Access control |
| U | Maintenance Item | - | string | `$MI1` | Y | Links to MI template |

---

## 3. R8 → SAP Field Mapping

| R8 Entity/Field | SAP Entity/Field | Notes |
|-----------------|------------------|-------|
| Plant Hierarchy node | Functional Location (TPLNR) | Hierarchy codes must match exactly |
| Equipment.code | Functional Location or Equipment Number | With district prefix |
| Work Package | Task List (via IA05) | Each WP = one task list |
| Task (ordered in WP) | Task List Operation (VORNR) | Ordered by operation number |
| WP frequency/scheduling | Maintenance Item (via IP04) | Cycle info on MI |
| Collection of MIs | Maintenance Plan (via IP41) | Groups MIs for scheduling |
| Work Instruction export | PRT document (CV04N) | PDF attached to task list |
| Labour.description | Work Centre (ARBPL) | Must match SAP Man Work Centre codes |
| Material resources | Component list on operations | Linked to SAP material master |

---

## 4. R8 → SAP Upload Process Flow

```
1. Project Kick-Off
2. Collect SAP Data (existing hierarchy, work orders, plans)
3. Confirm Assets (verify hierarchy vs. physical)
4. Set up Site R8 Database
5. Load data into R8
6. Create Work Packages + Work Instruction sheets
7. Run Data Quality Checks (6-stage QA)
8. SAP Load Configuration
9. Confirm R8 Configuration Standard
10. Configure R8 fields to SAP codes
11. Update R8 Upload Sheets
12. Prepare Work Instruction template
13. Prepare SAP Maintenance Plan template
14. Transfer into SAP upload sheet format
15. Prepare SAP data upload template
16. Client review & sign-off
17. Upload into SAP Sandbox for Testing
18. Store Work Instructions on client server
19. Production upload after approval
```

---

## 5. SAP Upload Constraints

| Constraint | Rule |
|-----------|------|
| Work Package name | Max 40 characters; no illegal characters; ALL CAPS |
| Primary task name | Sentence case; max 72 characters for SAP long text |
| Labour table | Must align with SAP Man Work Centre codes |
| Hierarchy codes | Must match SAP Functional Location codes exactly |
| Functional Location | Must exist in SAP before upload |
| Equipment number | Must be valid SAP equipment if provided |
| Operation numbers | Increments of 10 (10, 20, 30...) |
| Placeholder variables | $MI1, $TL1 must be consistent across all 3 templates |
| Plant code | 4-character SAP plant code |

---

## 6. SAP PM Key Transactions Reference

| Transaction | Description |
|-------------|-------------|
| IH01 | Display Functional Location |
| IE03 | Display Equipment |
| IW21 | Create Notification |
| IW28 | List Notifications |
| IW31 | Create Work Order |
| IW32 | Change Work Order |
| IW38 | List Work Orders (by selection) |
| IW39 | List Work Orders (multi-level) |
| IA05 | Create General Task List |
| IA06 | Change General Task List |
| IA07 | Display General Task List (operations) |
| IA11 | Display General Task List |
| IP04 | Create Maintenance Item |
| IP10 | Schedule Maintenance Plans |
| IP18 | Display Maintenance Item |
| IP41 | Create Maintenance Plan (with MI) |
| IP02 | Change Maintenance Plan |
| IP03 | Display Maintenance Plan |
| IP11 | Define Maintenance Strategy |
| CV04N | Display Production Resource Tools (Work Instructions) |
