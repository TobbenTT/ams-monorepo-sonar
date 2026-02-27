# BLUEPRINT — OCP Maintenance AI MVP

## B.L.A.S.T. Phase 1 Deliverable | Requires Approval Before Coding

---

## 1. North Star

**Build a working local prototype of the OCP Maintenance AI MVP** with 4 modules:

1. **Intelligent Field Capture** — Text/image input structured into SAP-compatible work requests via Claude AI
2. **AI Planner Assistant** — Automated resource validation and priority recommendations
3. **Backlog Optimization** — Stratified backlog view with AI-generated work packages and schedule proposals
4. **Maintenance Strategy Development** — Full RCM-based strategy lifecycle: Plant Hierarchy → Criticality → FMEA → Strategy Selection → Tasks → Work Packages → SAP Upload, powered by AI-assisted libraries that auto-generate drafts for engineer review

**Pilot scope:** 1-2 critical phosphate mining equipment items (SAG Mill, Belt Conveyor) in 1 simulated plant.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   STREAMLIT UI                       │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │  Field    │ │  Planner   │ │  Backlog   │ │  Strategy  │ │
│  │  Capture  │ │  Assistant │ │  Optimize  │ │  Dev (RCM) │ │
│  └────┬─────┘ └─────┬──────┘ └─────┬────┘ └─────┬────┘ │
└───────┼──────────────┼──────────────────┼───────────┘
        │              │                  │
┌───────▼──────────────▼──────────────────▼───────────┐
│                  FastAPI BACKEND                     │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │ Capture    │ │ Planner    │ │ Backlog          │ │
│  │ Processor  │ │ Engine     │ │ Optimizer        │ │
│  └────┬───────┘ └─────┬──────┘ └────────┬─────────┘ │
│       │               │                 │            │
│  ┌────▼───────────────▼─────────────────▼─────────┐ │
│  │              PII REDACTOR                       │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │                              │
│  ┌────────────────────▼───────────────────────────┐ │
│  │           CLAUDE API (Sonnet 4)                 │ │
│  │  • NLP Classification  • Priority Reasoning     │ │
│  │  • Equipment Matching  • Schedule Suggestions   │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  DATA LAYER                          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │ PostgreSQL │ │ SAP Mock   │ │ File Storage     │ │
│  │ (Local)    │ │ (JSON)     │ │ (.tmp/)          │ │
│  └────────────┘ └────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 3. Build Sequence (Phase 3 Execution Order)

### Step 1: Synthetic Data Generation (Week 1)

Generate phosphate-realistic SAP PM data for 1 simulated plant:

| Data Set | Records | Tool |
| --- | --- | --- |
| Equipment Hierarchy | ~50 items (plant, 5 areas, 10 systems, 30 equipment, 5 components each) | `tools/generate_equipment_hierarchy.py` |
| Work Order History | ~500 orders (12 months) | `tools/generate_work_orders.py` |
| Spare Parts / BOM | ~200 parts | `tools/generate_spare_parts.py` |
| Inventory | ~200 items | `tools/generate_spare_parts.py` |
| Maintenance Plans | ~30 plans | `tools/generate_maintenance_plans.py` |
| Current Backlog | ~80 items | `tools/generate_backlog.py` |
| Workforce | ~25 technicians | `tools/generate_workforce.py` |
| Shutdown Calendar | ~10 events (6 months) | `tools/generate_shutdowns.py` |

Equipment types: SAG Mill, Ball Mill, Belt Conveyor, Jaw Crusher, Flotation Cell, Thickener, Rotary Dryer, Pumps, Motors, Transformers.

### Step 2: SAP Mock Service (Week 1)

`tools/sap_mock_service.py` — FastAPI service serving synthetic data as mock SAP PM endpoints:

- `GET /equipment/{id}` — Equipment master data
- `GET /equipment/hierarchy` — Full hierarchy tree
- `GET /workorders?equipment_id=X&months=12` — Work order history
- `GET /spareparts?equipment_id=X` — BOM for equipment
- `GET /inventory?material_code=X` — Stock availability
- `GET /maintenanceplans?equipment_id=X` — PM plans
- `GET /backlog` — Current backlog
- `GET /workforce` — Available technicians
- `GET /shutdowns` — Shutdown calendar

### Step 3: Core AI Tools (Week 2)

| Tool | Input | Output | Claude API? |
| --- | --- | --- | --- |
| `tools/pii_redactor.py` | Raw text with names | Anonymized text | No (regex + rules) |
| `tools/field_capture_processor.py` | FieldCaptureInput JSON | StructuredWorkRequest JSON | Yes |
| `tools/work_request_classifier.py` | Structured description | WO type + priority + parts | Yes |
| `tools/planner_assistant.py` | Work request + SAP data | PlannerRecommendation JSON | Yes |
| `tools/backlog_optimizer.py` | Backlog + constraints | OptimizedBacklog JSON | Partial (grouping logic is deterministic; reasoning uses Claude) |

### Step 4: FastAPI Backend (Week 2-3)

REST API connecting UI to tools:

- `POST /api/capture` — Submit field capture, returns structured work request
- `GET /api/workrequests` — List all work requests with AI classifications
- `POST /api/workrequests/{id}/validate` — Planner validates/modifies AI suggestion
- `GET /api/planner/{request_id}` — Get AI planner recommendation
- `GET /api/backlog` — Get current backlog with stratification
- `POST /api/backlog/optimize` — Run backlog optimization
- `GET /api/schedule` — Get optimized schedule proposal

### Step 5: Streamlit UI (Week 3)

Five views:

1. **Field Capture Simulator** — Text input + image upload + AI processing result
2. **Work Request Queue** — Table with AI suggestions, validation buttons
3. **Planner Assistant** — Selected work request + full AI recommendation + approve/modify
4. **Backlog Dashboard** — Stratification charts (by reason, priority, criticality) + alerts
5. **Schedule View** — Calendar/Gantt of optimized work packages

---

## 4. Safety-First AI Flow

```
Technician Input (voice/text/image)
        │
        ▼
   PII Redaction (deterministic, no LLM)
        │
        ▼
   Claude API: Classify & Structure
        │
        ▼
   AI Output: DRAFT status only
        │
        ▼
   ┌─────────────────────────┐
   │  PLANNER REVIEW GATE    │ ◄── MANDATORY HUMAN STEP
   │  • Approve as-is        │
   │  • Modify fields        │
   │  • Reject with reason   │
   └─────────┬───────────────┘
             │
             ▼
   VALIDATED → Enters Backlog
             │
             ▼
   Backlog Optimizer (AI-assisted grouping)
             │
             ▼
   Schedule Proposal: DRAFT status only
             │
             ▼
   ┌─────────────────────────┐
   │  PLANNER APPROVAL GATE  │ ◄── MANDATORY HUMAN STEP
   │  • Approve schedule     │
   │  • Modify assignments   │
   │  • Defer work packages  │
   └─────────────────────────┘
```

**AI never auto-submits.** Every AI output enters as DRAFT and requires human approval.

---

## 5. Trilingual Approach

| Layer | French | English | Arabic |
| --- | --- | --- | --- |
| Field input | Accept | Accept | Accept |
| AI processing | Internal (English) | Internal (English) | Internal (English) |
| AI output descriptions | Generate | Generate | Deferred (Phase 2) |
| UI labels | Yes | Yes | Deferred (Phase 2) |
| SAP codes/TAGs | Preserved as-is | Preserved as-is | Preserved as-is |

MVP: French + English for input/output. Arabic input accepted but processed in English. Full Arabic UI deferred to Phase 2.

---

## 6. Module 4: Maintenance Strategy Development (NEW)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              STREAMLIT UI — Strategy Module               │
│  ┌───────────┐ ┌──────────┐ ┌───────┐ ┌──────────────┐ │
│  │ Hierarchy  │ │Criticality│ │ FMEA  │ │ Work Package │ │
│  │ Builder    │ │ Matrix    │ │Editor │ │ Builder      │ │
│  └─────┬─────┘ └────┬─────┘ └──┬────┘ └──────┬───────┘ │
└────────┼────────────┼──────────┼──────────────┼─────────┘
         │            │          │              │
┌────────▼────────────▼──────────▼──────────────▼─────────┐
│                  FastAPI BACKEND                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ Library      │ │ Strategy     │ │ SAP Upload       │ │
│  │ Manager      │ │ Engine (RCM) │ │ Generator        │ │
│  └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘ │
│         │                │                   │           │
│  ┌──────▼────────────────▼───────────────────▼─────────┐│
│  │           CLAUDE API (Sonnet 4)                      ││
│  │  • Auto-decompose equipment into sub-assemblies      ││
│  │  • Generate FMEA drafts from component + context     ││
│  │  • Suggest strategy type + frequency + tasks         ││
│  │  • Recommend spare parts from BOM + failure mode     ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ Component    │ │ Equipment    │ │ Plant Hierarchy   │ │
│  │ Library (DB) │ │ Library (DB) │ │ (DB)              │ │
│  └──────────────┘ └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Build Sequence for Module 4

**Step 6: Library System + Hierarchy Builder (Week 3-4)**

| Tool | Purpose |
| --- | --- |
| `tools/component_library.py` | CRUD for generic component library (functions, failure modes, default tasks) |
| `tools/equipment_library.py` | CRUD for equipment library (composed from components, make/model specific) |
| `tools/hierarchy_builder.py` | Build/import plant hierarchy nodes, link to libraries |
| `tools/ai_decomposer.py` | Claude API: given equipment type, auto-generate sub-assembly + component breakdown |
| `tools/seed_libraries.py` | Seed initial phosphate mining component + equipment libraries |

**Step 7: Strategy Engine (Week 4-5)**

| Tool | Purpose |
| --- | --- |
| `tools/criticality_assessor.py` | Criticality matrix calculator (11 criteria, probability, risk class) |
| `tools/fmea_generator.py` | Claude API: auto-generate FMEA draft (What + Mechanism + Cause per component) |
| `tools/rcm_decision_engine.py` | Deterministic RCM decision tree (Hidden/Evident → CB/FT/RTF/FFI/Redesign) |
| `tools/task_definer.py` | Task definition with naming convention enforcement, limit validation |
| `tools/resource_assigner.py` | Labour + material assignment with catalog lookup |

**Step 8: Work Packaging + SAP Export (Week 5-6)**

| Tool | Purpose |
| --- | --- |
| `tools/work_packager.py` | Auto-group tasks by trade + constraint + frequency |
| `tools/quality_checker.py` | Validate against 40+ rules from REF-04 |
| `tools/sap_export_generator.py` | Generate SAP Maintenance Item + Task List + Work Plan templates |
| `tools/work_instruction_exporter.py` | Generate WI PDF/documents per work package |

### Strategy Module — AI Flow (Auto-completador)

```
Engineer adds equipment to hierarchy
        │
        ▼
AI auto-decomposes → sub-assemblies + components (DRAFT)
        │
        ▼
Engineer reviews/adjusts decomposition → APPROVED
        │
        ▼
AI auto-generates FMEA per component (DRAFT)
  (What + Mechanism + Cause + Effect + Consequence)
        │
        ▼
Engineer reviews/adjusts each failure mode → APPROVED
        │
        ▼
RCM Decision Engine suggests strategy per FM (DETERMINISTIC)
  (Hidden/Evident → CB/FT/RTF/FFI/Redesign)
        │
        ▼
AI generates task definitions + frequency + limits (DRAFT)
        │
        ▼
Engineer reviews/adjusts tasks → APPROVED
        │
        ▼
AI suggests resources (labour + materials from catalog) (DRAFT)
        │
        ▼
Engineer reviews/adjusts resources → APPROVED
        │
        ▼
System auto-groups into Work Packages (DETERMINISTIC)
        │
        ▼
Quality Checker validates 40+ rules → FIX or PASS
        │
        ▼
┌─────────────────────────┐
│  ENGINEER APPROVAL GATE │ ◄── MANDATORY HUMAN STEP
│  • Approve all WPs      │
│  • Sign off strategy    │
└─────────┬───────────────┘
          │
          ▼
Generate SAP Upload Sheets + Work Instructions
```

**Key principle:** AI generates DRAFTS at every step. The RCM decision tree and work packaging grouping logic are DETERMINISTIC (no LLM). Engineer always approves before proceeding.

---

## 7. File Structure (After Build)

```
ASSET-MANAGEMENT-SOFTWARE/
├── gemini.md                    # Project Constitution (law)
├── DOCUMENT_INDEX.md            # Master document control register
├── task_plan.md                 # Phases & checklists
├── findings.md                  # Research & discoveries
├── progress.md                  # Session logs
├── .env                         # API keys (ANTHROPIC_API_KEY, DATABASE_URL)
│
├── architecture/                # Layer 1: SOPs + Reference Docs
│   ├── BLUEPRINT.md             # This document
│   ├── ref-01-maintenance-strategy-methodology.md
│   ├── ref-02-r8-data-model-entities.md
│   ├── ref-03-sap-pm-integration.md
│   ├── ref-04-quality-validation-rules.md
│   ├── ref-05-client-context-ocp.md
│   ├── ref-06-software-architecture-vision.md
│   ├── ref-07-work-instruction-templates.md
│   ├── ref-08-user-guide-step-by-step.md
│   ├── field-capture-sop.md     # (to create)
│   ├── planner-assistant-sop.md # (to create)
│   ├── backlog-optimization-sop.md # (to create)
│   ├── strategy-development-sop.md # (to create)
│   └── data-generation-sop.md   # (to create)
│
├── tools/                       # Layer 3: Python scripts
│   ├── # --- Data Generation ---
│   ├── generate_equipment_hierarchy.py
│   ├── generate_work_orders.py
│   ├── generate_spare_parts.py
│   ├── generate_maintenance_plans.py
│   ├── generate_backlog.py
│   ├── generate_workforce.py
│   ├── generate_shutdowns.py
│   ├── seed_libraries.py        # Seed component/equipment libraries
│   ├── # --- Services ---
│   ├── sap_mock_service.py      # FastAPI mock SAP
│   ├── pii_redactor.py
│   ├── # --- Module 1: Field Capture ---
│   ├── field_capture_processor.py
│   ├── work_request_classifier.py
│   ├── # --- Module 2: Planner Assistant ---
│   ├── planner_assistant.py
│   ├── # --- Module 3: Backlog Optimization ---
│   ├── backlog_optimizer.py
│   ├── # --- Module 4: Strategy Development ---
│   ├── component_library.py     # Component library CRUD
│   ├── equipment_library.py     # Equipment library CRUD
│   ├── hierarchy_builder.py     # Plant hierarchy management
│   ├── ai_decomposer.py         # AI equipment decomposition
│   ├── criticality_assessor.py  # Criticality matrix calculator
│   ├── fmea_generator.py        # AI FMEA draft generation
│   ├── rcm_decision_engine.py   # Deterministic RCM decision tree
│   ├── task_definer.py          # Task definition + naming validation
│   ├── resource_assigner.py     # Labour + material assignment
│   ├── work_packager.py         # Auto-group tasks into WPs
│   ├── quality_checker.py       # 40+ validation rules
│   ├── sap_export_generator.py  # SAP upload sheet generation
│   ├── work_instruction_exporter.py # WI PDF generation
│   ├── # --- App ---
│   ├── api_server.py            # FastAPI backend
│   └── streamlit_app.py         # Streamlit UI (all 4 modules)
│
├── .tmp/                        # Temporary workbench
│   ├── synthetic_data/          # Generated JSON/CSV
│   └── logs/                    # Processing logs
│
├── CLIENT CONTEXT/              # (existing)
├── MAINTENANCE STRATEGY.../     # (existing)
└── SOFTWARE DEVELOPMENT CONTEXT/ # (existing)
```

---

## 7. Dependencies (Python)

```
fastapi
uvicorn
streamlit
anthropic
psycopg2-binary (or asyncpg)
faker
pandas
plotly
pydantic
python-dotenv
```

---

## 8. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Claude API cost during development | Use small test payloads; cache responses in .tmp/ |
| Synthetic data too generic | Domain expert review of phosphate equipment/failure modes |
| Schema changes mid-build | Update gemini.md FIRST (Golden Rule), then propagate |
| Streamlit limitations for complex UI | Acceptable for prototype; React dashboard in Phase 2 |
| No real SAP to validate against | Mock service follows SAP PM conventions exactly |

---

## 9. Approval Gate

**This Blueprint must be approved before ANY code is written in `tools/`.**

Upon approval, execution begins with:
1. Phase 2 (Link): Verify Claude API key, set up local PostgreSQL
2. Phase 3 (Architect): Build in the 5-step sequence above

**Estimated build time:** 3 weeks (Step 1-5 above)
