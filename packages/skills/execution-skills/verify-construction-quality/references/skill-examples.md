# Examples - verify-construction-quality

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Pre-MC Operability Walkdown

**Context:** SAG mill area (Area 310) at a copper concentrator project

**Input:**
- Area 310 at 92% construction completion
- MC target in 3 weeks
- 4-person walkdown team: operations superintendent, maintenance planner, electrical technician, HSE advisor
- 87 equipment items in the area

**Process:**
1. Team briefed on SAG mill operational philosophy, critical safety systems, and design parameters
2. 2-day walkdown conducted (Day 1: ground level + mill floor; Day 2: upper levels + electrical rooms)
3. 47 findings identified and documented with photos
4. Findings classified: 3 Category A, 28 Category B, 16 Category C

**Category A Findings (must resolve before MC):**
- PL-310-001: Missing safety guard on mill discharge conveyor tail pulley — safety risk to operations personnel
- PL-310-002: Incomplete grounding on 4.16kV switchgear Bus 2 — electrical safety hazard
- PL-310-003: Emergency exit from mill building blocked by temporary construction materials — egress violation

**Output:**
- Walkdown report (28 pages) with 47 findings, 94 photos
- Punchlist register updated with 47 new items
- Category A items assigned to contractors with 5-day deadline
- MC Readiness = NOT READY (3 Cat A items open)
- Estimated remediation cost: $12,500 for Cat A items
- Follow-up walkdown scheduled for Day MC-7 to verify Cat A resolution

### Example 2: Systemic Quality Issue Detection

**Context:** Multi-area punchlist data analysis at a process plant construction project

**Input:**
- Punchlist data from 5 completed walkdowns (Areas 100, 200, 300, 310, 400)
- 312 total punchlist items across 5 areas
- Data shows 23% of piping-related items (18 of 78) are "incorrect support spacing" from Contractor XYZ

**Process:**
1. Trend analysis identifies that Contractor XYZ piping support spacing defects are 4x higher than other contractors
2. Compare actual support spacing measurements vs. design standard (ASME B31.3 + project specification)
3. Root cause investigation: Contractor XYZ using outdated support spacing table (Rev A instead of Rev C)
4. Calculate affected areas: 5 areas completed + 3 areas in progress = potential 8 areas impacted
5. Estimate remediation scope: 45 additional supports to be installed, 12 existing supports to be relocated

**Output:**
- Quality Alert Notice issued to Construction Manager (same day)
- Root cause report: Contractor XYZ using outdated design document
- Recommended corrective actions:
  1. Contractor re-training on current support spacing requirements (Rev C)
  2. 100% inspection of remaining piping supports in Areas 500, 600, 700 (not yet walked down)
  3. Re-inspection of piping supports in 5 completed areas
- Estimated remediation cost: $85,000
- Updated trend report showing contractor performance comparison
- NCR issued to Contractor XYZ with corrective action deadline

### Example 3: MC Readiness Dashboard

**Context:** Project approaching MC milestone for Phase 1 (15 systems)

**Input:**
- 15 systems in Phase 1 scope
- MC target date: 45 days from now
- Current punchlist: 1,245 total items (89 Cat A, 567 Cat B, 589 Cat C)

**Process:**
1. Generate per-system Cat A status
2. Calculate resolution velocity (Cat A items closed per week over last 4 weeks)
3. Project Cat A clearance date per system based on current velocity
4. Identify systems at risk of missing MC

**Output:**
- MC Readiness Dashboard:
  - 8 systems GREEN (0 Cat A items)
  - 4 systems AMBER (Cat A items with resolution plan projecting clearance before MC)
  - 3 systems RED (Cat A resolution rate insufficient to clear before MC)
- Risk report for 3 RED systems with specific blockers and recommended acceleration actions
- Resource request: additional contractor crews needed for 3 RED systems
- Updated project schedule impact assessment: 2 of 3 RED systems on critical path, potential 10-day MC delay without intervention

---
