# Maintenance Strategy Development -- Quality Management Flowchart

> **Source**: `asset-management-methodology/maintenance-strategy-development-quality-management-flowchart.xlsx`  
> **Conversion Date**: 2026-02-23

## Used By Skills

- **validate-quality** -- Quality gate definitions and check criteria

---

## MSO Flowchart

- **1** Visit and review physical assets on site
- **2** Talk to site personnel about the assets
- **3** Take photographs
- **4** Review all existing data
- **1** Select components from Ausenco Rylson library to use in the workshop as a reference item. Do not create links
- **2** Copy these items into the Sandbox area for analysis
- **1** Generate spreadsheet using items from the Sandbox
- **2** Add existing tasks from the site SAP data
- **3** Add other information gathered from site personnel
- **1** Focus on Maintenance Strategy
- **a** • Maintenance nodes (record where nodes have come from)
- **b** • Failure mode, Strategy, Primary task and Secondary task. Comply with Maintenance Strategy Standards
- **c** • Optimise task frequency
- **d** • Assign constraint
- **e** • Assign labour type and durations where possible
- **1** Gather additional data from site personnel
- **2** Refer to OEM recommendations where necessary
- **3** Complete components in the Sandbox using data from the workshop and other sources
- **1** Copy completed strategies into the Project Library to create generic component strategies
- **2** Create Make and Model specific components (Delta Modifications)
- **3** Prepare sheets for Materials ID for make and model components
- **1** Build the strategy in the Plant hierarchy from the Project Library
- **1** Create work packages for equipment groups and individual equipment where required
- **2** Work packages represent task list operations

---

## QA Self-check #1

| Task Number | QA Task Description | Who Completed | Date Completed | Illegal Characters |  |
|---|---|---|---|---|---|
| 1 | Plant Hierarchy – Verify SAP hierarchy with physical plant.  Hierarchy codes and naming conventions must be acquired from site. |  |  | @ | At symbol |
| 2 | Review additional information on site not obtained during initial data analysis |  |  | \ | Back Slash |
| 3 | Compare SAP & OEM information with P&ID to determine if equipment is missing from the hierarchy. |  |  | ^ | Caret / Hat (upper character) |
|  |  |  |  | , | Comma |
| 4 | Review primary maintenance from the CMMS |  |  | © | Copyright symbols or similar |
| 5 | Review work order history and obtain budgeted life information where possible |  |  | - | Dash (or Hyphen) |
| 6 | Review operating contraints for online and offline tasks. |  |  | ÷ | Division |
|  |  |  |  | = | Equals |
|  |  |  |  | ! | Exclamation Mark |
|  |  |  |  | > | Greater than |
|  |  |  |  | # | Hash |
|  |  |  |  | “ | Italics – double |
|  |  |  |  | ‘ | Italics – single |
|  |  |  |  | ( | Left Bracket |
|  |  |  |  | { | Left Parenthesis |
|  |  |  |  | [ | Left SQ Bracket |
|  |  |  |  | < | Less Than |
|  |  |  |  | | | Pipe |
|  |  |  |  | + | Plus |
|  |  |  |  | ? | Question Mark |
|  |  |  |  | ) | Right Bracket |
|  |  |  |  | } | Right Parenthesis |
|  |  |  |  | ] | Right SQ Bracket |
|  |  |  |  | * | Star or asterix |
|  |  |  |  | ~ | Tilde (007E Unicode) |
|  |  |  |  | _ | Underscore |

---

## QA Self-check #2

| Task Number | QA Task Description | Who Completed | Date Completed |
|---|---|---|---|
| 1 | Failure Mode - The failure mode description clearly outlines the component or maintainable item which fails, how it fails and what caused the failure ensuring the most appropriate strategy is employed |  |  |
| 2 | Strategy Decision - The maintenance strategy decision follows the RCM decision tree and the most appropriate strategy is chosen using a risk based approach. |  |  |
| 3 | Task Frequency - The frequency chosen will be in the most relevant to address the failure mode.  Calender based task frequencies are only relevant for age related failures and statutory requirements.  |  |  |
| 4 | Task constraints to match site convention (online, offline, or anytime) on drop down menu.  All tasks that are online must have a 0 access time. All tasks that are offline must not have a 0 access tim |  |  |
| 5 | Acceptable limits to align with site requirements. Must be consistent especially with respect to VA, Oil, Thermography, and any other acceptable limit where a site reference is used in lieu of a speci |  |  |
| 6 | Secondary tasks clearly define requirement once acceptable limit is exceeded. |  |  |

---

## QA Self-check #3

| Task Number | QA Task Description | Who Completed | Date Completed |
|---|---|---|---|
| 1 | Verify the correct level with site for all work packages (CM at higher level with most at equipment level). |  |  |
| 2 | Work package naming convention to be verified with site for a standard build sequence (example: 4W Mech Insp Primary Ore Conveyor) and 40 character limit and illegal character requirements may apply.  |  |  |
| 3 | All WP tasks to have labour assigned (quantity and hours).  All tasks with materials must have a quantity assigned. |  |  |
| 4 | All WP constraints to match site convention (online, offline, or anytime) on drop down menu. All tasks that are online must have a 0 access time. All tasks that are offline must not have a 0 access ti |  |  |
| 5 | All fields must be allocated in the "Work Package Details" tab. |  |  |
| 6 | Work Package frequency must align with allocated tasks. |  |  |
| 7 | Sequential, suppression, step and stand alone packaging must be verified with site for acceptance. |  |  |

---

## Formal QA Check #1

| Task Number | QA Task Description | Who Completed | Date Completed | Illegal Characters |  |
|---|---|---|---|---|---|
| 1 | Plant Hierarchy – Verify SAP hierarchy aligns with R8. Request SAP output to verify hierarchy from site to make sure there is alignment. Naming convention may have a 40 character limit and illegal cha |  |  | @ | At symbol |
| 2 | Primary task naming conventions. Make sure they meet SAP upload requirements for sentence case, character length 72 long text limit may apply (a table must be developed and maintained for all abbrevia |  |  | \ | Back Slash |
| 3 | Failure Mode - The failure mode description clearly outlines the component or maintainable item which fails, how it fails and what caused the failure ensuring the most appropriate strategy is employed |  |  | ^ | Caret / Hat (upper character) |
| 4 | Strategy Decision - The maintenance strategy decision follows the RCM decision tree and the most appropriate strategy is chosen using a risk based approach. |  |  | , | Comma |
| 5 | Task Frequency - The frequency chosen will be in the most relevant to address the failure mode.  Calender based task frequencies are only relevant for age related failures and statutory requirements.  |  |  | © | Copyright symbols or similar |
| 6 | Task constraints to match site convention (online, offline, or anytime) on drop down menu.  All tasks that are online must have a 0 access time.  All tasks that are offline must not have a 0 access ti |  |  | - | Dash (or Hyphen) |
| 7 | Acceptable limits to align with site requirements. Must be consistent especially with respect to VA, Oil, Thermography, and any other acceptable limit where a site reference is used in lieu of a speci |  |  | ÷ | Division |
| 8 | Labour table must be aligned with site naming convention and SAP codes. |  |  | = | Equals |
| 9 | All tasks to have labour assigned (quantity and hours).  All tasks with materials must have a quantity assigned. |  |  | ! | Exclamation Mark |
| 10 | Work package naming convention to be verified with site for a standard build sequence (example: 4W Mech Insp Primary Ore Conveyor) and 40 character limit and illegal character requirements may apply.  |  |  | > | Greater than |
| 11 | Work Packages must be at the level agreed to by site and align with SAP. |  |  | # | Hash |
| 12 | Verify all equipment is referenced back to the component library and then built in the equipment library and referenced throughout the plant where applicable. |  |  | “ | Italics – double |
| 13 | All equipment optimised in the Sandbox must be copied to the library as components. Then built in the equipment library, copied, and  referenced into the plant hierarchy where applicable. |  |  | ‘ | Italics – single |
| 14 | Verify the correct level with site for all work packages (CM at higher level with most at equipment level). |  |  | ( | Left Bracket |
| 15 | All WP tasks to have labour assigned (quantity and hours).  All tasks with materials must have a quantity assigned. |  |  | { | Left Parenthesis |
| 16 | All WP constraints to match site convention (online, offline, or anytime) on drop down menu.  All tasks that are online must have a 0 access time.  All tasks that are offline must not have a 0 access  |  |  | [ | Left SQ Bracket |
| 17 | All fields must be allocated in the "Work Package Details" tab. |  |  | < | Less Than |
| 18 | Work Package frequency must align with allocated tasks. |  |  | | | Pipe |
| 19 | Sequential, suppression, step and stand alone packaging must be verified with site for acceptance. |  |  | + | Plus |
|  |  |  |  | ? | Question Mark |
| Note: | The above is a small sample of equipment in the Plant hierarchy. Record the assets sampled to document what was reviewed. |  |  | ) | Right Bracket |
|  |  |  |  | } | Right Parenthesis |
|  |  |  |  | ] | Right SQ Bracket |
|  |  |  |  | * | Star or asterix |
|  |  |  |  | ~ | Tilde (007E Unicode) |
|  |  |  |  | _ | Underscore |

---

## Formal QA Check #2

| Task Number | QA Task Description | Who Completed | Date Completed | Illegal Characters |  |
|---|---|---|---|---|---|
| 1 | Plant Hierarchy – Verify SAP hierarchy aligns with R8. Request SAP output to verify hierarchy from site to make sure there is alignment. Naming convention may have a 40 character limit and illegal cha |  |  | @ | At symbol |
| 2 | Primary task naming conventions. Make sure they meet SAP upload requirements for sentence case, character length 72 long text limit may apply (a table must be developed and maintained for all abbrevia |  |  | \ | Back Slash |
| 3 | Failure Mode - The failure mode description clearly outlines the component or maintainable item which fails, how it fails and what caused the failure ensuring the most appropriate strategy is employed |  |  | ^ | Caret / Hat (upper character) |
| 4 | Strategy Decision - The maintenance strategy decision follows the RCM decision tree and the most appropriate strategy is chosen using a risk based approach. |  |  | , | Comma |
| 5 | Task Frequency - The frequency chosen will be in the most relevant to address the failure mode.  Calender based task frequencies are only relevant for age related failures and statutory requirements.  |  |  | © | Copyright symbols or similar |
| 6 | Task constraints to match site convention (online, offline, or anytime) on drop down menu.  All tasks that are online must have a 0 access time.  All tasks that are offline must not have a 0 access ti |  |  | - | Dash (or Hyphen) |
| 7 | Acceptable limits to align with site requirements. Must be consistent especially with respect to VA, Oil, Thermography, and any other acceptable limit where a site reference is used in lieu of a speci |  |  | ÷ | Division |
| 8 | Labour table must be aligned with site naming convention and SAP codes. |  |  | = | Equals |
| 9 | All tasks to have labour assigned (quantity and hours).  All tasks with materials must have a quantity assigned. |  |  | ! | Exclamation Mark |
| 10 | Work package naming convention to be verified with site for a standard build sequence (example: 4W Mech Insp Primary Ore Conveyor) and 40 character limit and illegal character requirements may apply.  |  |  | > | Greater than |
| 11 | Work Packages must be at the level agreed to by site and align with SAP. |  |  | # | Hash |
| 12 | Verify all equipment is referenced back to the component library and then built in the equipment library and referenced throughout the plant where applicable. |  |  | “ | Italics – double |
| 13 | All equipment optimised in the Sandbox must be copied to the library as components. Then built in the equipment library, copied, and  referenced into the plant hierarchy where applicable. |  |  | ‘ | Italics – single |
| 14 | Verify the correct level with site for all work packages (CM at higher level with most at equipment level). |  |  | ( | Left Bracket |
| 15 | All WP tasks to have labour assigned (quantity and hours).  All tasks with materials must have a quantity assigned. |  |  | { | Left Parenthesis |
| 16 | All WP constraints to match site convention (online, offline, or anytime) on drop down menu.  All tasks that are online must have a 0 access time.  All tasks that are offline must not have a 0 access  |  |  | [ | Left SQ Bracket |
| 17 | All fields must be allocated in the "Work Package Details" tab. |  |  | < | Less Than |
| 18 | Work Package frequency must align with allocated tasks. |  |  | | | Pipe |
| 19 | Sequential, suppression, step and stand alone packaging must be verified with site for acceptance. |  |  | + | Plus |
|  |  |  |  | ? | Question Mark |
| Note: | The above is a small sample of equipment in the Plant hierarchy. Record the assets sampled to document what was reviewed. |  |  | ) | Right Bracket |
|  |  |  |  | } | Right Parenthesis |
| Note: | The requirements are the same as formal QA#1 but after the workshops. It is easy to move away from RCM requirements and a second check is required to ensure we understand this and exceptions are appro |  |  | ] | Right SQ Bracket |
|  |  |  |  | * | Star or asterix |
|  |  |  |  | ~ | Tilde (007E Unicode) |
|  |  |  |  | _ | Underscore |

---

## Final QA Check

| Task Number | QA Task Description | Who Completed | Date Completed | Illegal Characters |  |
|---|---|---|---|---|---|
| 1 | Ensure Work Plan data aligns with 1SAP standard and that all fields are completed |  |  | @ | At symbol |
| 2 | Ensure Maint. Item data aligns with 1SAP standard and that all fields are completed |  |  | \ | Back Slash |
| 3 | Ensure Task List and Operation data aligns with 1SAP standard and that all fields are completed |  |  | ^ | Caret / Hat (upper character) |
| 4 | Review each Work Instruction export in soft copy. Ensure that task route looks sensible. Remember that we are heavily judged on the Work Instructions. |  |  | , | Comma |
|  |  |  |  | © | Copyright symbols or similar |
|  |  |  |  | - | Dash (or Hyphen) |
|  |  |  |  | ÷ | Division |
|  |  |  |  | = | Equals |
|  |  |  |  | ! | Exclamation Mark |
|  |  |  |  | > | Greater than |
|  |  |  |  | # | Hash |
|  |  |  |  | “ | Italics – double |
|  |  |  |  | ‘ | Italics – single |
|  |  |  |  | ( | Left Bracket |
|  |  |  |  | { | Left Parenthesis |
|  |  |  |  | [ | Left SQ Bracket |
|  |  |  |  | < | Less Than |
|  |  |  |  | | | Pipe |
|  |  |  |  | + | Plus |
|  |  |  |  | ? | Question Mark |
|  |  |  |  | ) | Right Bracket |
|  |  |  |  | } | Right Parenthesis |
|  |  |  |  | ] | Right SQ Bracket |
|  |  |  |  | * | Star or asterix |
|  |  |  |  | ~ | Tilde (007E Unicode) |
|  |  |  |  | _ | Underscore |

---

## Lessons Learned

- Addressed on this project: | Name-Date:
- What we did well:
- YES | MT-24/4/15 | Having a single individual undertaking QA duties.
- YES | MT-24/4/16 | Identifying stages early-on.
- YES | MT-24/4/17 | Working as a unit (within a small area) worked well and was productive.
- YES | MT-24/4/18 | Access to site CMMS.
- Client management
- Ongoing | ·         Client liaison; good working relationship with most of A & R;
- Ongoing | ·         Mentoring and training of the maintenance leadership team;
- ·         Utilisation of SCADA system (PI) to obtain measuring points for various equipment and process areas such as Ultrafine & regrind mills, Sag Mill feed tonnes, and Feed conveyor operational hours.
- ·         Development time
- Ongoing | ·         Regular weekly catch up meeting to ensure progress and keep team on track.
- YES | MT-24/4/18 | ·         Implemented risk based tools to our analyses
- Ongoing | ·         Resolved issues promptly and communicated with the client
- What we could have done better:
- Initial Instructions to build all equipment in the equipment library (as a whole asset) cost many hours of un-necessary re-work.
- Scope way out. Required 70+ hour weeks in order to meet schedule throughout project. Because the range of unique equipment was so massive, this made building assets very time consuming.
- YES | MT-24/4/19 | Communicate learnings from the implementations.
- Library items too few and not fully quality reviewed.
- YES | MT-24/4/19 | Pre defined QA reports (not pre built).
- ·         Fixed Plant
- o    Developing DCS based condition monitoring strategies without proper research caused a lot of issues
- o    Assumptions around operator based inspections were incorrect. None of the current maintenance plans were taken into consideration
- o    Quality of work packaging was poor
- o    Hours allocated to work packages were incorrect which created re-work following hours allocated to operations being too low. This was also the case with suppression series due to how hours are allocated to work packages in higher parts of the series.
- o    Allocation of tasks to labour types needed a lot of re-work
- o    From a Time, Cost and Quality perspective, Time took precedence and Quality took a major knock due to that decision. Too much scope was taken on in too short a time.
- o    Library was not used well at all
- o    Disregard of most of the current maintenance plans
- o    Implementation prior to approval was a mistake (client decision)
- o    Many maintenance tasks that are not valid or physically cannot be done
- o    Lube runs (mech. and elec.), VA runs, Thermography (especially on MCC’s and subs), e-stops, Oil Sample runs – all need to be researched a lot better.
- o    Most primary task materials were left out (oil samples cost $30ea. Which can add up)
- ·         Spend more time in mill area;
- YES | MT-24/4/19 | ·         SAP – R8 output interfacing, its repeatable let’s make the software save significant manhours.
- ·         Development, some inherently poor models duplicated
- Ongoing | ·         Managing the client

---
