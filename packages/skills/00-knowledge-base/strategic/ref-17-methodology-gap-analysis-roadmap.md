# REF-17: Methodology Gap Analysis & Technical Roadmap

## Purpose

Comprehensive comparison between GFSN maintenance methodology (4 source documents, 193 pages) and the current OCP Maintenance AI MVP implementation (Phase 1-3, 653 tests). Identifies gaps, proposes technical definitions, and provides an implementation roadmap.

**Source Documents Analyzed:**
- REF-13: Maintenance Management Manual (104p) — SRC-90
- REF-14: Planning & Scheduling Procedure (34p) — SRC-91
- REF-15: Defect Elimination Procedure (39p) — SRC-92
- REF-16: Asset Criticality Analysis Procedure (16p) — SRC-93

**System Components Analyzed:**
- `tools/engines/criticality_engine.py` — Current criticality calculation
- `tools/engines/priority_engine.py` — Current priority calculation
- `tools/processors/planner_engine.py` — Current planner logic
- `tools/processors/backlog_optimizer.py` — Current backlog optimization
- `api/services/` — All M1-M3 services
- `agents/definitions/prompts/` — Agent system prompts

---

## 1. Gap Summary Matrix

| # | Domain | GFSN Methodology | Current Implementation | Gap Severity | Phase |
|---|--------|-------------------|----------------------|-------------|-------|
| G1 | **Criticality** | 3 levels (Alto/Moderado/Bajo), 6 factors, scores 1-25 | 4 risk classes (I-IV), 11 categories, scores 1-25 | **MEDIUM** — functionally similar but structurally different | 4 |
| G2 | **Priority** | 2D matrix (Equipment Criticality × Consequence) → 3 levels | Additive scoring (criticality weight + flags) → 4 levels | **MEDIUM** — different approach, same goal | 4 |
| G3 | **Planning Weekly Cycle** | 6-stage cycle with Monday meeting, Wednesday final program | No weekly cycle concept — planner_engine gives point-in-time recommendations | **HIGH** — fundamental scheduling gap | 4 |
| G4 | **SAP WO Status Flow** | 8-status lifecycle (PLN→FMA→LPE→LIB→IMPR→NOTP→NOTI→CTEC) | Simplified 4-status (DRAFT→PENDING→VALIDATED→REJECTED) | **HIGH** — missing critical statuses | 4 |
| G5 | **Work Package** | 7 mandatory elements (permit, LOTO, materials, checklists, ATS, procedure, WO) | Basic grouping by area/type — no work package document generation | **HIGH** — core scheduling deliverable missing | 4-5 |
| G6 | **Pre/Post-execution** | LOTO, scaffolding, guard removal, commissioning, housekeeping | Not modeled at all | **MEDIUM** — important for real scheduling | 5 |
| G7 | **RCA (Root Cause)** | 3-level (Physical→Human→Latent), Cause-Effect diagram, 5P's evidence | CAPA engine tracks actions but no structured RCA process | **HIGH** — defect elimination process missing | 4 |
| G8 | **5W+2H Analysis** | Structured 7-question template for simple events | Not implemented | **MEDIUM** — useful for quick analysis | 4 |
| G9 | **Event Classification** | Risk matrix determines RCA Level (1-3) with different team requirements | All events treated similarly | **MEDIUM** — needed for resource allocation | 4 |
| G10 | **Solution Prioritization** | 2D matrix (Cost-Benefit × Difficulty) with 4 quadrants | Not implemented | **MEDIUM** — needed for RCA completion | 4 |
| G11 | **Planning KPIs (11)** | WO completion, man-hour compliance, PM plan compliance, backlog weeks, reactive %, schedule adherence, etc. | Basic KPIs in kpi_engine.py (MTBF/MTTR/OEE) — no planning-specific KPIs | **HIGH** — 11 KPIs with targets not tracked | 4 |
| G12 | **DE KPIs (5)** | Event reporting compliance, meeting compliance, implementation progress, savings, frequency reduction | Not implemented | **MEDIUM** — needed for DE process | 4 |
| G13 | **Notification Lifecycle** | MEAB→METR→ORAS→MECE with specific role transitions | Not modeled | **MEDIUM** — corrective WO flow | 4 |
| G14 | **Shutdown Management** | Shutdown calendar integration, major/minor types, area isolation | Basic shutdown_calendar table exists but minimal logic | **HIGH** — critical for real scheduling | 5 |
| G15 | **Resource Leveling** | SAP CM25, capacity adjustment, multi-crew interference checking | Not implemented — backlog_optimizer groups but doesn't level | **HIGH** — core scheduling capability | 5 |
| G16 | **Gantt Chart / Schedule View** | Weekly program in Excel with dates, hours, sequence, work groups | Schedule entries with utilization bars — no Gantt view | **HIGH** — user explicitly requested | 5 |
| G17 | **Cross-functional Communication** | Defined matrix (MM, Execution, Reliability, Operations) with responsibilities | No inter-department workflow | **LOW** — organizational, not technical | Future |
| G18 | **FMECA Process** | 4-stage per SAE JA-1011/JA-1012 with specific inputs/outputs | RCM decision tree implemented but not the full 4-stage FMECA workflow | **MEDIUM** — partially covered | Future |
| G19 | **Improvement Techniques** | OCR, Pareto, Jack-Knife, Weibull, LCC, MoC | Weibull engine exists, others not implemented | **LOW** — advanced analytics | Future |
| G20 | **Spare Parts Criticality** | Linked to equipment criticality + failure mode analysis | MaterialMapper does keyword matching — no structured spare parts criticality | **MEDIUM** — affects planning accuracy | 5 |

---

## 2. Detailed Gap Analysis by Domain

### 2.1 Criticality Assessment (G1)

**GFSN Method:**
- 6 consequence factors (3 economic: business impact, operational cost, interruption; 3 non-economic: safety, environment, RSC)
- 5 consequence levels (Insignificante→Extremo, 1-5)
- 5 frequency levels (Raro→Casi seguro, 1-5)
- Score = max(consequence across 6 factors) × frequency
- 3 criticality bands: Alto (19-25), Moderado (8-18), Bajo (1-7)
- Assumes: no controls, no contingency, normal operations
- Considers: redundancy, buffers, operational configuration
- Complementary 0-100% score for within-band differentiation

**Current System (`criticality_engine.py`):**
- 11 consequence categories from Anglo American/R8
- 5 consequence levels (Insignificant→Catastrophic, 1-5)
- 5 probability levels (Rare→Almost certain, 1-5)
- Score = max(consequence) × probability
- 4 risk classes: I (1-4), II (5-9), III (10-15), IV (16-25)

**Recommendation:** The calculation core is almost identical (both use max-consequence × frequency). The difference is in banding (3 vs 4 levels) and consequence factor count (6 vs 11). **Proposed approach:**
1. Make consequence factors configurable — allow client to choose GFSN-6 or R8-11
2. Make criticality bands configurable — GFSN-3 (Alto/Moderado/Bajo) or R8-4 (I/II/III/IV)
3. Add ALARP zone mapping
4. Add within-band percentage score
5. Add redundancy/buffer consideration as an optional modifier

### 2.2 Priority Calculation (G2)

**GFSN Method:**
- 2D matrix: Equipment Criticality (row) × Maximum Consequence if not addressed (column)
- Output: Alto (immediate), Moderado (<14 days), Bajo (>14 days)
- Must be configured in SAP-PM

**Current System (`priority_engine.py`):**
- Additive scoring: criticality_weight(AA→10...D→1) + safety(+5) + production(+3) + recurring(+2) + stopped(+3)
- Output: EMERGENCY (≥15), URGENT (≥10), NORMAL (≥5), PLANNED (<5)

**Recommendation:** Both approaches are valid — additive is more nuanced for AI-assisted triage. **Proposed approach:**
1. Keep the additive engine as primary (more factors = better AI accuracy)
2. Add a GFSN compatibility mode that maps Equipment Criticality × Consequence → 3-level output
3. The planner can display both: AI priority (4-level) + GFSN priority (3-level) for human decision

### 2.3 Planning & Scheduling (G3, G4, G5, G6, G14, G15, G16)

**This is the largest gap cluster.** The GFSN procedure describes a complete weekly operational cycle that doesn't exist in the current system.

**GFSN Weekly Cycle:**
```
Monday:    Scheduling meeting (60 min) — HSE, KPIs, preliminary program, validation
Tuesday:   Program adjustments & resource leveling (SAP CM25)
Wednesday: Final program sent for next week
Thursday:  Next week's program starts
Sunday:    Current week ends
```

**Current System:** Point-in-time recommendations. No weekly cadence, no program state, no resource leveling.

**Proposed Technical Architecture for Scheduling:**

```
New Engine: tools/engines/scheduling_engine.py
├── WeeklyProgram
│   ├── period (week_start, week_end)
│   ├── work_orders: list[ScheduledWorkOrder]
│   ├── status: DRAFT → PRELIMINARY → FINAL → ACTIVE → COMPLETED
│   └── kpis: WeeklyProgramKPIs
│
├── ScheduledWorkOrder
│   ├── work_order_id, equipment_tag, priority
│   ├── planned_date, planned_shift, planned_crew
│   ├── estimated_hours, required_specialties
│   ├── pre_execution: list[SupportTask]  # LOTO, scaffolding, etc.
│   ├── post_execution: list[SupportTask]  # housekeeping, commissioning
│   ├── materials: list[MaterialRequirement]
│   ├── work_package_status: PENDING → ASSEMBLED → DISTRIBUTED
│   └── sap_status: PLN|FMA|LPE|LIB|IMPR|NOTP|NOTI|CTEC
│
├── SupportTask
│   ├── type: LOTO|SCAFFOLDING|CRANE|MANLIFT|GUARD_REMOVAL|CLEANING
│   ├── estimated_hours, required_specialty
│   └── dependency: BEFORE_EXECUTION|AFTER_EXECUTION
│
├── ResourceLeveler
│   ├── balance_workload(program, workforce) → LeveledProgram
│   ├── check_interference(program) → list[Conflict]
│   └── check_capacity(program, workforce) → CapacityReport
│
└── GanttGenerator
    ├── generate_gantt(program) → GanttData (for Excel/UI)
    ├── include_dependencies(support_tasks)
    └── show_progress(actual_vs_planned)
```

**New SAP-PM Status Model:**
```python
class SAPWorkOrderStatus(str, Enum):
    PLN = "PLN"   # Planning in progress
    FMA = "FMA"   # Waiting for materials
    LPE = "LPE"   # Planning complete
    LIB = "LIB"   # Released for execution
    IMPR = "IMPR"  # Printed
    NOTP = "NOTP"  # Partially notified
    NOTI = "NOTI"  # Fully notified
    CTEC = "CTEC"  # Technically closed

class SAPNotificationStatus(str, Enum):
    MEAB = "MEAB"  # Open
    METR = "METR"  # In treatment
    ORAS = "ORAS"  # WO created
    MECE = "MECE"  # Closed
```

### 2.4 Root Cause Analysis / Defect Elimination (G7, G8, G9, G10, G12)

**GFSN RCA Process:**
1. Classify event severity via risk matrix → determines RCA Level (1-3)
2. For Level 1: 5W+2H quick analysis
3. For Level 2-3: Full Cause-Effect diagram with 5P's evidence collection
4. Must identify 3 root cause levels (Physical → Human → Latent)
5. Solutions validated through 5-question filter
6. Solutions prioritized via Cost-Benefit × Difficulty matrix
7. Implementation tracked with 5 specific KPIs

**Current System:** `capa_engine.py` tracks CAPA items with PDCA cycle but doesn't implement:
- Structured RCA methodology
- 3-level root cause hierarchy
- 5P's evidence framework
- Event classification by severity
- Solution prioritization matrix

**Proposed Technical Architecture for RCA:**

```
New Engine: tools/engines/rca_engine.py
├── EventClassification
│   ├── classify(event, risk_matrix) → RCALevel (1|2|3)
│   └── get_team_requirements(level) → TeamRequirements
│
├── QuickAnalysis5W2H
│   ├── what: str (problem + goal)
│   ├── when: str (timing + schedule)
│   ├── where: str (location + implementation)
│   ├── who: str (skills + responsible)
│   ├── why: str (traceability + justification)
│   ├── how: str (manifestation + approach)
│   └── how_much: str (quantification + cost)
│
├── CauseEffectDiagram
│   ├── primary_effect: str
│   ├── when_occurred: datetime
│   ├── where_occurred: str
│   ├── causes: list[Cause]
│   │   ├── type: ACTION|CONDITION
│   │   ├── evidence: Evidence (INFERRED|SENSORY|HYPOTHESIS)
│   │   ├── root_cause_level: PHYSICAL|HUMAN|LATENT|None
│   │   └── child_causes: list[Cause]
│   └── findings: list[str]  # improvement opportunities
│
├── EvidenceCollection5P
│   ├── parts: list[Evidence]      # physical evidence
│   ├── position: list[Evidence]   # spatial + temporal
│   ├── people: list[Evidence]     # witnesses
│   ├── papers: list[Evidence]     # documentation
│   └── paradigms: list[str]       # cultural observations
│
├── SolutionEvaluator
│   ├── filter_5questions(solution) → bool
│   ├── cost_benefit(solution) → H|M|L
│   ├── difficulty(solution) → LL|LH|M|HL|HH
│   └── prioritize(solutions) → list[PrioritizedSolution]
│
└── DEProcessKPIs
    ├── event_reporting_compliance() → float
    ├── meeting_compliance() → float
    ├── implementation_progress() → float
    ├── savings_effectiveness() → float
    └── frequency_reduction() → float
```

### 2.5 Planning & Scheduling KPIs (G11)

**GFSN defines 11 KPIs** — none currently tracked:

| # | KPI | Formula | Target | Implementation |
|---|-----|---------|--------|---------------|
| 1 | WO Completion | Completed / Scheduled × 100 | ≥90% | Query weekly program completion |
| 2 | Man-hour Compliance | Actual / Planned × 100 | 85-115% | Compare WO planned vs actual hours |
| 3 | PM Plan Compliance | PM completed / PM scheduled × 100 | ≥95% | Filter by WO source = preventive |
| 4 | Backlog (weeks) | Open WO hours / Weekly capacity | ≤4 weeks | Already partially in backlog_optimizer |
| 5 | Reactive Work % | Emergency WOs / Total × 100 | ≤20% | Count by priority = EMERGENCY |
| 6 | Schedule Adherence | Executed per schedule / Total scheduled × 100 | ≥85% | Compare planned date vs actual |
| 7 | Release Horizon | Avg days WO creation → release | ≤7 days | Track status transition timestamps |
| 8 | Pending Notices % | Open notices / Total × 100 | ≤15% | Query notification status |
| 9 | Scheduled Capacity | Scheduled hours / Available hours × 100 | 80-95% | From resource leveler |
| 10 | Proactive Work % | (PM + PdM) / Total × 100 | ≥70% | Filter by WO type |
| 11 | Planning Efficiency | Actual vs planned hours accuracy | ±15% | Statistical analysis of variance |

**Proposed:** Add `PlanningKPIEngine` to `tools/engines/` that computes all 11 KPIs from weekly program data.

---

## 3. Technical Roadmap

### Phase 4A: Methodology Alignment (Criticality + Priority + RCA)

**Goal:** Align engines with GFSN methodology while maintaining backward compatibility.

| Task | Files | Effort | Dependencies |
|------|-------|--------|-------------|
| 4A.1 Configurable criticality bands (3-level GFSN + 4-level R8) | `criticality_engine.py` | S | None |
| 4A.2 Configurable consequence factors (6 GFSN + 11 R8) | `criticality_engine.py` | M | 4A.1 |
| 4A.3 GFSN priority compatibility mode | `priority_engine.py` | S | 4A.1 |
| 4A.4 SAP WO status model (8-status lifecycle) | `tools/models/schemas.py`, `api/database/models.py` | M | None |
| 4A.5 SAP notification status model (4-status lifecycle) | `tools/models/schemas.py`, `api/database/models.py` | S | None |
| 4A.6 RCA engine (event classification, 5W+2H, Cause-Effect) | New: `tools/engines/rca_engine.py` | L | None |
| 4A.7 5P's evidence collection model | `tools/models/schemas.py` | S | 4A.6 |
| 4A.8 Solution prioritization engine | `tools/engines/rca_engine.py` | M | 4A.6 |
| 4A.9 Planning & scheduling KPI engine (11 KPIs) | New: `tools/engines/planning_kpi_engine.py` | M | None |
| 4A.10 DE process KPI engine (5 KPIs) | `tools/engines/rca_engine.py` | S | 4A.6 |
| 4A.11 Tests for all above (~40 tests) | `tests/` | M | All above |

**Estimated:** ~12-15 new/modified files, ~40 tests, S/M complexity

### Phase 4B: Scheduling Engine

**Goal:** Implement the weekly scheduling cycle with resource leveling and Gantt generation.

| Task | Files | Effort | Dependencies |
|------|-------|--------|-------------|
| 4B.1 Weekly program model (DRAFT→FINAL→ACTIVE→COMPLETED) | New: `tools/engines/scheduling_engine.py` | L | 4A.4 |
| 4B.2 Support tasks model (LOTO, scaffolding, crane, etc.) | `tools/models/schemas.py` | S | None |
| 4B.3 Resource leveler (balance workload, check interference) | `tools/engines/scheduling_engine.py` | L | 4B.1 |
| 4B.4 Work package assembler (7 mandatory elements) | `tools/engines/scheduling_engine.py` | M | 4B.1, 4B.2 |
| 4B.5 Gantt data generator (for Excel export) | New: `tools/processors/gantt_generator.py` | M | 4B.1 |
| 4B.6 Excel Gantt export (using openpyxl) | `tools/processors/gantt_generator.py` | M | 4B.5 |
| 4B.7 Shutdown integration (major/minor, area isolation) | `tools/engines/scheduling_engine.py` | M | 4B.1 |
| 4B.8 API endpoints (weekly program CRUD, scheduling meeting) | `api/routers/scheduling.py`, `api/services/scheduling_service.py` | L | 4B.1-4B.4 |
| 4B.9 Streamlit scheduling page (Gantt view, utilization, KPIs) | `streamlit_app/pages/12_scheduling.py` | L | 4B.5, 4B.8 |
| 4B.10 Tests (~30 tests) | `tests/` | M | All above |

**Estimated:** ~8-10 new files, ~30 tests, L complexity

### Phase 5: Advanced Reliability Engineering

**Goal:** Implement remaining GFSN methodology elements.

| Task | Priority | Description |
|------|----------|-------------|
| 5.1 Spare parts criticality engine | HIGH | Link spare parts to equipment criticality + failure modes for proactive procurement |
| 5.2 Shutdown execution tracking | HIGH | Track WO closures during shutdowns, replan remaining work, report progress |
| 5.3 MoC (Management of Change) workflow | MEDIUM | Track changes to maintenance strategy with approval flow |
| 5.4 OCR (Optimum Cost-Risk) analysis | MEDIUM | Cost-risk optimization for maintenance interval selection |
| 5.5 Jack-Knife diagram engine | LOW | Visualize failure frequency × downtime for bad actor identification |
| 5.6 LCC (Life Cycle Cost) calculator | LOW | Total cost of ownership analysis |
| 5.7 Pareto analysis engine | MEDIUM | Automated 80/20 analysis for bad actor identification |
| 5.8 RBI (Risk Based Inspection) for static equipment | LOW | Specific methodology for pressure vessels, piping, structures |

---

## 4. Methodology Decision Points (Require Client Input)

| # | Decision | Option A | Option B | Recommendation |
|---|----------|----------|----------|---------------|
| D1 | Criticality bands | GFSN 3-level (Alto/Moderado/Bajo) | R8 4-level (I/II/III/IV) | **Configurable** — let client choose per plant |
| D2 | Consequence factors | GFSN 6 factors | R8 11 categories | **Configurable** — GFSN-6 as default for OCP |
| D3 | Priority calculation | GFSN 2D matrix | Additive scoring | **Both** — AI uses additive, display shows GFSN mapping |
| D4 | RCA methodology | GFSN Cause-Effect only | Multiple (5-Why, Fishbone, FTA) | **GFSN as primary**, 5-Why as simplified alternative |
| D5 | Gantt tool | Excel export (openpyxl) | Interactive web Gantt (Plotly/Frappe) | **Excel first** (client requested), web Gantt later |
| D6 | Scheduling granularity | Daily (8h shifts) | Shift-based (A/B/Night) | **Shift-based** — more realistic for mining |
| D7 | Work package format | PDF generation | Digital checklist in app | **Both** — PDF for field use, digital for tracking |

---

## 5. Impact on Existing Agents

### 5.1 Agent Prompt Updates Required

| Agent | Current Knowledge | Required Addition |
|-------|------------------|-------------------|
| **Strategy Agent** | R8 RCM methodology, 11-category criticality | GFSN 6-factor criticality, configurable bands, FMECA 4-stage process |
| **Planner Agent** (new) | Not yet specialized | Weekly cycle, SAP status flow, work package assembly, resource leveling, pre/post-execution tasks |
| **RCA Agent** (new) | Not yet specialized | 5W+2H, Cause-Effect diagram, 5P's evidence, 3-level root cause, solution prioritization |
| **Scheduler Agent** (new) | Not yet specialized | Gantt generation, shutdown management, interference checking, capacity planning |

### 5.2 New MCP Tools Required

| Tool | Purpose | Inputs | Outputs |
|------|---------|--------|---------|
| `classify_event_severity` | Determine RCA level from risk matrix | event description, consequence, frequency | RCA Level (1-3), team requirements |
| `run_5w2h_analysis` | Structured simple analysis | 7 answers | Formatted 5W+2H report |
| `build_cause_effect_diagram` | Create/extend Ishikawa diagram | primary effect, causes, evidence | CauseEffectDiagram object |
| `identify_root_causes` | Validate Physical→Human→Latent chain | cause chain, evidence | Root cause classification |
| `prioritize_solutions` | Cost-Benefit × Difficulty matrix | solutions with cost/benefit/difficulty | Prioritized solution list |
| `create_weekly_program` | Generate draft weekly schedule | work orders, workforce, shutdowns | WeeklyProgram |
| `level_resources` | Balance workload across shifts | program, workforce | LeveledProgram with conflicts |
| `generate_gantt` | Create Gantt chart data | program | GanttData (Excel-compatible) |
| `assemble_work_package` | Build 7-element work package | work order, permits, procedures | WorkPackage |
| `compute_planning_kpis` | Calculate 11 planning KPIs | weekly program data | PlanningKPIs with targets |
| `compute_de_kpis` | Calculate 5 DE KPIs | RCA process data | DEKPIs with targets |

---

## 6. Build Sequence Summary

```
Phase 4A (Methodology Alignment)     ←── Current priority
  ├── 4A.1-4A.3: Criticality/Priority alignment
  ├── 4A.4-4A.5: SAP status models
  ├── 4A.6-4A.8: RCA engine + evidence + solutions
  ├── 4A.9-4A.10: KPI engines (planning + DE)
  └── 4A.11: Tests

Phase 4B (Scheduling Engine)          ←── After 4A
  ├── 4B.1-4B.4: Weekly program + resource leveling
  ├── 4B.5-4B.6: Gantt generation + Excel export
  ├── 4B.7: Shutdown integration
  ├── 4B.8-4B.9: API + UI
  └── 4B.10: Tests

Phase 5 (Advanced Reliability)        ←── After 4B
  ├── Spare parts criticality
  ├── Shutdown execution tracking
  ├── MoC, OCR, Jack-Knife, LCC, Pareto, RBI
  └── Tests
```

**Total estimated new work:**
- ~20-25 new files
- ~70-80 new tests
- Phase 4A: ~2-3 sessions
- Phase 4B: ~2-3 sessions
- Phase 5: ~3-4 sessions (can be incremental)
