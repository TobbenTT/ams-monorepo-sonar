# Work Instruction Template Examples -- Consolidated Reference

> **Used By Skills:** `generate-work-instructions`, `assemble-work-packages`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Template 1: Anglo American Coal (v1 / V3)](#2-template-1-anglo-american-coal)
3. [Template 2: Anglo American Platinum (v1 / v2 / v3)](#3-template-2-anglo-american-platinum)
4. [Template 3: Goedehoop Colliery (GD) -- Coal with Feedback](#4-template-3-goedehoop-colliery-gd)
5. [Template 4: Platinum Template Example (Final)](#5-template-4-platinum-template-example-final)
6. [Template 5: Proposal v1 (Original / Baseline)](#6-template-5-proposal-v1-original-baseline)
7. [Template 6: PBN Chilean Crusher (Spanish Language)](#7-template-6-pbn-chilean-crusher-spanish-language)
8. [Template 7: AAC Soldado / AAC Word Templates (.doc)](#8-template-7-aac-soldado-aac-word-templates)
9. [Template 8: EH3000 Service Template (PDF Portrait)](#9-template-8-eh3000-service-template-pdf-portrait)
10. [Summary: Cross-Template Comparison and Common Patterns](#10-summary-cross-template-comparison-and-common-patterns)

---

## 1. Overview

This document consolidates the analysis of all work instruction templates found in:
```
asset-management-methodology/maintenance-work-instruction-template-examples/
```

The templates originate from Anglo American mining operations across Coal, Platinum, and Copper divisions, plus a Chilean mining operation (Soldado). They represent real-world work instruction formats used for scheduled maintenance tasks such as mechanical services, inspections, and overhauls. All templates share a common lineage but have evolved with site-specific adaptations.

**Files analyzed:**
| File | Type | Language |
|------|------|----------|
| Template Proposal - Coal.docx | .docx | English |
| Template Proposal - Coal V3.docx | .docx | English |
| Template Proposal - Coal V3 (without comments).docx | .docx | English |
| Templace Proposal - Platinum.docx | .docx | English |
| Templace Proposal - Platinum v2.docx | .docx | English |
| Templace Proposal - Platinum v2 (without comments).docx | .docx | English |
| Templace Proposal - Platinum v3 (without comments).docx | .docx | English |
| Templace Proposal.v1.docx | .docx | English |
| GD Template Proposal - With Goedehoop Feebback.docx | .docx | English |
| Platinum Template example.docx | .docx | English |
| PBN000_001_MANT MEC EXT CH PBB CHS11 336dD.docx | .docx | Spanish |
| AAC_SOLDADO_WORD_TEMPLATE.doc | .doc | Spanish |
| AAC_WORD_TEMPLATE.doc / AAC_WORD_TEMPLATE_ORIGINAL.doc | .doc | English |
| 500HR EH3000 MECH SERVICE OFF (Template Portrait YN).pdf | PDF | English |
| 500HR EH3000 MECH SERVICE OFF (Template Priority Sign Portrait 1 2 3 4).pdf | PDF | English |

---

## 2. Template 1: Anglo American Coal (v1 / V3)

**Source:** Anglo American Coal Division
**Files:** `Template Proposal - Coal.docx`, `Template Proposal - Coal V3.docx`, `Template Proposal - Coal V3 (without comments).docx`
**Equipment Example:** 1W SHEARER 7LS6 MECH SERV OFFLINE
**Controlled Document:** Yes

### Structure / Sections

1. **Header Table** -- Document title, controlled document marker
2. **Job Information Table** (Table 2) -- Merge-field placeholders for CMMS integration:
   - Work Group (`<<wgroup>>`)
   - Standard Job (`<<StdJob>>`)
   - Scheduled Date (`<<scheddate>>`)
   - Equipment (`<<Equip>>`)
   - Work Order No (`<<wo>>`)
   - Standard Task No (`<<staskno>>`)
   - Schedule Task No (`<<task>>`)
   - Materials (`<<Materials>>`)
   - Tools & Equipment (`<<Tools & Equipment>>`)
   - Labour (`<<Labour>>`)
   - Safety instruction -- Group PUE (`<<Safety instruction short>>`)
   - Safety instruction -- Generic controls (`<<Safety instruction long>>`)
   - Job Instruction (`<<Detailed Task description>>`) -- includes Task, Objective, Conditions, Constraints
   - Unit of Work (`<<Unit of work>>`)
   - Hand Over and Test Procedure (`<<Hand Over and test>>`)
3. **Conditions and Constraints** section (text block)
4. **Instructions and Explanations** (text block) -- Corrective task guidance:
   - (1): Perform corrective task immediately, same WO
   - (2): Perform corrective task immediately, new corrective WO
   - (3): Create new corrective WO for next scheduled maintenance
5. **Condition Code Legend:**
   - 1 = No Fault Found
   - 2 = Fault Found and fixed, record fault
   - 3 = Fault found and not fixed, record defect
6. **Inspection Steps Table** (Table 3) -- The main body:
   - Columns: Step description | Acceptable Limits | Corrective Task | Condition Code (1/2/3) | Tick
   - Steps grouped by component/assembly with equipment codes (e.g., `Drum MG (HS14-MG)`)
   - Steps numbered hierarchically: `1.1`, `1.2`, `2.1`, etc.
   - Each step has an acceptable limit and optional corrective task
7. **Test & Handover Requirements** -- Confirmation statement
8. **Task Completion Table:**
   - Completed by (1-4): Zone, Name, Company Nr, Signature, Date
   - Date of Service, Actual Hours, All Complete / All Not Done
9. **Task Delay Table:**
   - Codes: WA (Waiting Access), WL (Waiting Labour), WW (Bad Weather), WR (Waiting Permits), WS (Waiting Special Tools), WT (Wait Transport), WE (Waiting Equipment), WM (Waiting Material & Spares)
10. **Returned Not Done Table:**
    - Codes: NA, NL, NR, NS, NE, NM (corresponding "No" versions)
11. **Additional Work Required Table:** Action Required | Impact | Required Date
12. **Acknowledgement Table:** Close out & Follow ups | Supervisor | Manager (If not done)
13. **Final Closure:** All Complete (can be filed) + Stamp

### Key Elements

- **PPE/Safety:** Referenced via `<<Safety instruction short>>` and `<<Safety instruction long>>` merge fields
- **Tools:** Referenced via `<<Tools & Equipment>>` merge field
- **Steps:** Numbered hierarchically by component group (e.g., 1.x, 2.x ... 9.x)
- **Condition Codes:** 1/2/3 circle system
- **V3 Differences from V1:** Added Equipment row, Task Duration field (`<<TarDur>>`), additional comments placeholder with [Line 1]-[Line 6]

### Naming Convention

- Task title: `[Frequency] [Equipment] [Discipline] [Action] [Online/Offline]`
- Example: `1W SHEARER 7LS6 MECH SERV OFFLINE`
- Fitter assignments: `FITTER N1`, `FITTER N2`, etc.
- Component references include equipment codes in parentheses: `Drum MG (HS14-MG)`

---

## 3. Template 2: Anglo American Platinum (v1 / v2 / v3)

**Source:** Anglo American Platinum Division
**Files:** `Templace Proposal - Platinum.docx`, `Templace Proposal - Platinum v2.docx`, `Templace Proposal - Platinum v2 (without comments).docx`, `Templace Proposal - Platinum v3 (without comments).docx`
**Equipment Example:** 1W SHEARER 7LS6 MECH SERV OFFLINE
**Controlled Document:** Yes

### Structure / Sections

1. **Header Table** -- Title + Functional Location references (e.g., `ULS264_001_7000__9160 / ULS264_001_7000__9161`)
2. **Safety Instructions Table** -- Dedicated safety block:
   - Complete personal risk assessment (Take 5, Pre-work risk assessment, SLAM, etc.)
   - For offline works isolate as per AAMC Control of Energy Standard
   - Use mandatory Personal Protective Equipment (PPE)
   - Comply with Golden Rules
3. **JRA (Job Risk Assessment) Reference:** `JRA No xxxx`
4. **Hazard Information and Symbol Table:**
   - Icons for: Critical Task, Reference Documents, Hazard, Information
   - Categories: Materials, Isolate, People, Tools and Task Equipment
   - CUSTOMIZED row for site-specific hazards
5. **Labour Required Table:** Qty | Man Hours | Description (e.g., 2 x 12hrs Fitter)
6. **Contractor Resources Required Table** (v1 only): Qty | Man Hours | Description
7. **Materials Required Table:** Qty | Description | Stock Code | Part Number
8. **Special Tools Required Table:** Qty | Description | Time
9. **Special Equipment & Services Required Table:** Qty | Description | Time
10. **Inspection Steps Table:**
    - Header: Equipment Name (Equipment Code)
    - Labour type row (e.g., FITTER N1)
    - Columns: Step | Acceptable Limits | Corrective Action (acceptable limits not met) | Condition Code | Appr
    - Same hierarchical numbering as Coal
11. **Completed Defects (repaired) Table:** Step No. | Description | Repaired By | Hrs | Breakdown [Yes/No]
12. **Identified Defects (repairs required) Table:**
    - Priority Codes: 1=Urgent breakdown/safety; 2=Within current schedule; 3=Future scheduled service; 4=When convenient/major outage
    - Columns: Step No. | Corrective task required | Parts Required (Description or part number) | Hrs | Priority (1 2 3 4) | Subsequent Notification Number
13. **Tradesman Sign-off Table:** Name | Position | Company No. | Date | Hrs | Signature
    - Note: License No. is only required for Statutory Inspections
14. **Supervisor / Coordinator Approval:** Name | Position | Date | Signature | Approved
    - "All NON Acceptable Limits and Additional Comments have been reviewed"

### Key Differences from Coal Template

- **Explicit safety instructions** table (not just merge fields)
- **Hazard symbols/icons** table with customizable categories
- **Separate materials, tools, special equipment** tables (not merge fields)
- **"Corrective Action"** instead of "Corrective Task" column header
- **"Appr"** column (Approval) instead of "Tick"
- **Defect tracking** split into Completed Defects (repaired) and Identified Defects (repairs required)
- **Priority code system** (1-4) for identified defects
- **Tradesman sign-off** with license number provision for statutory inspections
- **No CMMS merge fields** -- resources listed directly
- **Functional Location reference** in header

### Evolution Across Versions

- **v1:** Basic Platinum structure, hazard table with 5 rows 2 columns placeholder, contractor resources table
- **v2:** Added icon descriptions (Critical Task, Reference Documents, Hazard, Information, Materials, Isolate, People, Tools), added materials with example data (FILTERS / XXXXX / XXXXXX), added [Line 1]-[Line 6] comments area, expanded defect rows
- **v3:** Removed JRA table, streamlined layout, removed contractor resources section

---

## 4. Template 3: Goedehoop Colliery (GD) -- Coal with Feedback

**Source:** Anglo American Coal -- Goedehoop Mine
**File:** `GD Template Proposal - With Goedehoop Feebback.docx`
**Equipment Example:** 1W SHEARER 7LS6 MECH SERV OFFLINE

### Structure / Sections

Similar to Platinum v1 with the following site-specific adaptations:

1. **Header** with Functional Location references
2. **Safety Instructions** table (same as Platinum)
3. **JRA reference**
4. **Hazard Information** -- Simplified 5-row, 2-column placeholder
5. **Labour Required** -- 3 Fitters x 12 hrs
6. **Contractor Resources + Materials** combined table
7. **Special Tools** and **Special Equipment** tables
8. **Inspection Steps** -- Same component-based structure with Corrective Task / Condition Code / Tick columns
9. **Task Completion Table** -- Simplified: Name | Company Nr | Signature | Date (no Zone column)
10. **Additional Work Completed** -- ACTION TAKEN (free-form)
11. **Additional Work Still Required** -- ACTION REQUIRED | IMPACT | DATE REQ
12. **Reasons for Return Not Done & Delays** -- Free-form with reschedule date
13. **Acknowledgement Table** -- Extended sign-off chain:
    - Foreman
    - MCO/Call Centre (Follow ups created)
    - GES (If Over inspected)
    - Engineer (If Over inspected or Not done)
    - Engineering Manager (If critical A or Legal not done)

### Key Differences

- **Extended acknowledgement chain** (5 levels vs. 2-3 in other templates)
- **Simplified completion tracking** (no zone column)
- **Free-form delay/return sections** (no coded delay reasons)
- **Separate "Additional Work Completed" and "Additional Work Still Required"** sections

---

## 5. Template 4: Platinum Template Example (Final)

**Source:** Anglo American Platinum -- Final production template
**File:** `Platinum Template example.docx`

### Structure

This is the most refined Platinum version and serves as the production standard:

1. Header with Functional Location
2. Safety Instructions (Take 5, AAMC Energy Standard, PPE, Golden Rules)
3. Hazard Information and Symbol Table (with icon legend)
4. Labour Required
5. Materials Required (with Stock Code and Part Number)
6. Special Tools Required
7. Special Equipment & Services Required
8. **Inspection body** with clear role assignment: `LABOUR TYPE or SUBASSEMBLY or GROUP or AREA`
9. Component-based steps with Acceptable Limits, Corrective Action, Condition Code, Appr columns
10. Completed Defects
11. Identified Defects with Priority Codes
12. Tradesman Sign-off
13. Supervisor/Coordinator Approval

### Key Distinction

- Uses `LABOUR TYPE or SUBASSEMBLY or GROUP or AREA` as the grouping label (most flexible)
- This is the recommended production template for Platinum operations

---

## 6. Template 5: Proposal v1 (Original / Baseline)

**Source:** Anglo American -- Original proposal baseline
**File:** `Templace Proposal.v1.docx`

### Structure

Earliest version of the Platinum-style template:

- Header with Functional Location
- Safety Instructions with "Take 5??-Pre-work risk assessment" (unfinished notation)
- Hazard table: "Customized table with 5 rows 2 columns" placeholder
- Labour, Contractor Resources, Materials, Special Tools, Special Equipment
- Inspection steps (same component structure, no Equipment header row)
- Post Shutdown Notes Test & Handover Requirements
- Completed Defects: includes "Secondary WO Number Breakdown [Yes/No]"
- Identified Defects: includes "Secondary WO Number Subsequent Notification Number"
- Priority codes same (1-4)

### Key Distinction

- Has "Post Shutdown Notes" section
- "Secondary WO Number" field for defect tracking
- Earliest/least refined version

---

## 7. Template 6: PBN Chilean Crusher (Spanish Language)

**Source:** Anglo American Copper -- Minera El Soldado / PBN Operation (Chile)
**File:** `PBN000_001_MANT MEC EXT CH PBB CHS11 336dD.docx`
**Equipment:** CHANCADOR PEBBLES SYMONS 1 (8SMO1CHS11)
**Language:** Spanish

### Structure / Sections

1. **Header Table:**
   - Title: `MANT MEC EXT CH PBB CHS11 336d/D (PBN000_001_)`
   - Generated by: CARDENAS, Alberto
   - Revision Date: Wednesday, 18 October 2017
   - Controlled Document marker
2. **Instructions** (Spanish):
   - Indicate if acceptable (SI/NO) and record additional comments
   - Identify yourself for each task performed
   - List completed defects repaired requiring work orders (>1 hour or spare parts)
   - List identified defects not repaired with priority codes
   - Tradesman signatures upon completion
3. **Labour Table:** Quantity | Man Hours | Labour Type (e.g., 7 x 40.5 TMT Mecanico Terceros)
4. **Materials Table:** Quantity | Description | Stock Code | Supplier Code
5. **Tools Table:** Cantidad | Horas | Descripcion
6. **Special Equipment Table:** Cantidad | Horas | Descripcion
7. **Inspection Steps Table:**
   - Columns: Step No | Component | Acceptable Limits | Corrective Task | Aceptable (YES/NO) | Firma/Iniciales
   - Steps grouped by component (Bloque de Valvulas, Bowl/Taza, Cilindro de Fijacion, etc.)
   - Steps numbered: 1.1, 1.2, ... 1.20
   - Acceptable limits in Spanish (e.g., "Sin contaminacion ni material acumulado")
   - "Conditional Comments" included inline with task descriptions
8. **Additional Comments Table:** Step No | Comentarios adicionales
9. **Defectos Reparados (Repaired Defects):** Step No | Descripcion | Reparado por | Hrs | Numero OT
10. **Defectos Identificados (Identified Defects):**
    - Priority Codes (Spanish): 1=Detencion urgente o asunto de seguridad; 2=Dentro del periodo actual; 3=Proximo periodo; 4=Cuando sea oportuno/Detencion mayor
    - Columns: Paso No | Repuestos requeridos | Hrs | Prioridad (1 2 3 4) | Numero OT
11. **Executor Sign-off:** Nombre Ejecutor | Cargo | Fecha | Hrs | Firma
12. **Supervisor Approval:** "Aprobacion Supervisor. Verificacion de Defectos y comentarios de cierre."
13. **Planning Checklist Table** (unique to this template):
    - 10 items evaluated for quality of execution
    - Items include: timeliness of return, execution time recorded, man-hours recorded, activities ticked, relevant comments, improvement proposals, execution date matches scheduled, supervisor signature, comments in Ellipse, actual hours loaded in Ellipse
    - Maturity scoring: 0=Inocencia, 1-4=Conocimiento, 5-7=Entendimiento, 8-9=Competencia, 10=Excelencia

### Naming Convention

- Format: `[SiteCode]_[Sequence]_[Discipline] [System] [Equipment] [Code] [Interval]`
- Example: `PBN000_001_MANT MEC EXT CH PBB CHS11 336d/D`
  - PBN000 = Site code
  - 001 = Sequence number
  - MANT MEC = Mantenimiento Mecanico (Mechanical Maintenance)
  - EXT = External
  - CH PBB = Chancador Pebbles (Pebble Crusher)
  - CHS11 = Equipment code
  - 336d/D = 336-day interval

### Key Differences

- **YES/NO acceptance** instead of Condition Codes 1/2/3
- **Firma/Iniciales** (Signature/Initials) column per step
- **Inline conditional comments** embedded in step descriptions
- **Planning quality checklist** for continuous improvement assessment
- **Spanish language** throughout
- **Supplier Code** in materials (vs. Part Number)
- **CMMS integration** with Ellipse (not SAP)

---

## 8. Template 7: AAC Soldado / AAC Word Templates

**Source:** Anglo American Copper -- Soldado Operation
**Files:** `AAC_SOLDADO_WORD_TEMPLATE.doc`, `AAC_WORD_TEMPLATE.doc`, `AAC_WORD_TEMPLATE_ORIGINAL.doc`

These are older `.doc` format templates. The binary format makes full extraction limited, but based on the file naming and context:

- **AAC_SOLDADO_WORD_TEMPLATE.doc** -- Likely the Spanish-language Soldado-specific base template
- **AAC_WORD_TEMPLATE.doc** -- Standard Anglo American Copper Word template
- **AAC_WORD_TEMPLATE_ORIGINAL.doc** -- Original/unmodified base template

These serve as the foundation Word templates from which the `.docx` versions were developed.

---

## 9. Template 8: EH3000 Service Template (PDF Portrait)

**Source:** Anglo American -- HITACHI EH3000 Dump Truck
**Files:**
- `500HR EH3000 MECH SERVICE OFF (Template Portrait YN).pdf`
- `500HR EH3000 MECH SERVICE OFF (Template Priority Sign Portrait 1 2 3 4).pdf`

### Structure (from naming conventions)

- **Equipment:** HITACHI EH3000 Dump Truck
- **Service Interval:** 500 hours
- **Discipline:** Mechanical (MECH)
- **Condition:** Offline (OFF)
- **Two variants:**
  - **YN variant:** Uses YES/NO format for step acceptance (similar to Chilean templates)
  - **Priority Sign 1 2 3 4 variant:** Uses priority code 1-2-3-4 system for defect rating
- **Portrait orientation** -- designed for printout and field use

### Naming Convention

- Format: `[Interval] [Equipment Model] [Discipline] SERVICE [Online/Offline]`
- Example: `500HR EH3000 MECH SERVICE OFF`

---

## 10. Summary: Cross-Template Comparison and Common Patterns

### Universal Elements (Present in ALL Templates)

| Element | Description |
|---------|-------------|
| **Header/Title** | Equipment name, service type, controlled document marker |
| **Safety Instructions** | Risk assessment, PPE, isolation procedures |
| **Labour Requirements** | Quantity, man-hours, labour type |
| **Materials Requirements** | Quantity, description, stock/part codes |
| **Inspection Steps** | Component-based, numbered hierarchically |
| **Acceptable Limits** | Pass/fail criteria for each step |
| **Corrective Actions** | What to do when limits are exceeded |
| **Defect Recording** | Completed repairs and outstanding defects |
| **Priority Codes** | 1=Urgent/Safety, 2=Current schedule, 3=Future service, 4=Convenient/Outage |
| **Sign-off** | Tradesman and supervisor signatures |

### Key Variations by Business Unit

| Feature | Coal | Platinum | Copper (Chile) |
|---------|------|----------|----------------|
| **Condition Rating** | 1/2/3 codes | 1/2/3 codes | YES/NO |
| **CMMS Merge Fields** | Yes (`<<field>>`) | No (direct entry) | No (direct entry) |
| **Safety Section** | Merge field | Dedicated table | Inline instructions |
| **Hazard Symbols** | Not present | Icon legend table | Not present |
| **Language** | English | English | Spanish |
| **Delay Tracking** | Coded (WA,WL,etc.) | Not present | Not present |
| **Return Not Done** | Coded (NA,NL,etc.) | Not present | Not present |
| **Quality Checklist** | Not present | Not present | 10-item maturity score |
| **Sign-off Chain** | 2-3 levels | 2 levels | 2 levels + planning |
| **Contractor Resources** | Not separate | Separate table (v1) | Combined |
| **Special Tools** | Merge field | Separate table | Separate table |
| **Functional Location** | Not in header | In header | Not in header |
| **Step Initials** | Tick column | Appr column | Firma/Iniciales column |

### Common Step Structure Pattern

All templates follow this pattern for inspection steps:

```
[Component Name (Equipment Code)]
  [N.N] [Action verb] [object] [condition to check]
        Acceptable Limit: [criteria]
        Corrective Task: [action if limit exceeded]
        Rating: [1/2/3 or YES/NO]
```

### Common Action Verbs Used in Steps

- **Inspect** -- Visual/physical examination (most common)
- **Check** -- Verify condition or parameter
- **Clean** -- Remove contamination or buildup
- **Grease** -- Apply lubrication
- **Tighten** -- Torque or secure fasteners
- **Replace** -- Swap component (in corrective tasks)
- **Test** -- Functional verification

### Component Naming Convention

Components consistently use the format:
```
[Component Name], [Location/Side] ([Equipment Code])
```
Examples:
- `Drum MG (HS14-MG)` -- Drum on Main Gate side
- `Valve Bank, Left (SH2C-L)` -- Left side valve bank
- `Final Drive Sprocket, TG (CLH1-TG)` -- Tail Gate final drive sprocket
- `Hose - Water Supply (SH5D-2)` -- Water supply hose

### Document Title Naming Patterns

| Pattern | Example | Context |
|---------|---------|---------|
| `[Freq] [Equip] [Disc] SERV [Online/Offline]` | `1W SHEARER 7LS6 MECH SERV OFFLINE` | Coal/Platinum |
| `[Interval] [Model] [Disc] SERVICE [On/Off]` | `500HR EH3000 MECH SERVICE OFF` | Surface Mining |
| `[Site]_[Seq]_[Disc] [System] [Equip] [Code] [Interval]` | `PBN000_001_MANT MEC EXT CH PBB CHS11 336d/D` | Chilean Copper |

### Recommended Template Selection Guide

| Use Case | Recommended Template |
|----------|---------------------|
| SAP-integrated Coal operations | Coal V3 (with merge fields) |
| Platinum operations (standard) | Platinum Template Example (final) |
| Spanish-language operations | PBN Chilean template |
| Quick field-printable format | EH3000 PDF Portrait |
| Maximum sign-off chain | Goedehoop (GD) template |
| Quality/maturity assessment | PBN Chilean template (with planning checklist) |
