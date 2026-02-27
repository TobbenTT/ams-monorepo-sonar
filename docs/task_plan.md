# Task Plan — OCP Maintenance AI MVP

## Status: PHASE 9B — DATA TEMPLATES, DOCS, LIBRARIES & HIERARCHY BUILDER COMPLETE (1208 tests passing)

---

## Phase 0: Initialization (COMPLETE)
- [x] Explore existing project context (87 files across 8 subdirectories)
- [x] Read and analyze 9 SOFTWARE DEVELOPMENT CONTEXT markdown files
- [x] Read and analyze 2 CLIENT CONTEXT PDFs (RFI + Data Requirements)
- [x] Create project scaffolding (architecture/, tools/, .tmp/, planning files)
- [x] Create gemini.md (Project Constitution)
- [x] Answer 5 Discovery Questions
- [x] Define JSON Data Schemas (9 schemas across all 3 functionalities)

## Phase 1: Blueprint (COMPLETE)
- [x] Discovery Questions answered (7 questions, all confirmed)
- [x] Data Schemas defined in gemini.md
- [x] Behavioral Rules codified (Safety-first AI, trilingual, do-not rules)
- [x] Reference documents created (REF-01 to REF-12)
- [x] Blueprint approved

## Phase 2: Link — Connectivity (COMPLETE)
- [x] Set up requirements.txt with all dependencies
- [x] Anthropic SDK installed (anthropic>=0.39.0)
- [x] SQLite database configured (local MVP)
- [x] SAP PM mock data service created (sap_mock/)
- [x] Database connection and ORM configured (SQLAlchemy)

## Phase 3: Architect — 3-Layer Build (COMPLETE)

### Data Models & Schemas
- [x] 30+ Pydantic models in tools/models/schemas.py
- [x] 28+ SQLAlchemy ORM models in api/database/models.py
- [x] 72-combo FM validation enforced at model level

### Deterministic Engines (36 total)
- [x] Core: criticality, RCM decision tree, SAP export, priority, backlog grouper
- [x] Analysis: FMECA, RCA, equipment resolver, material mapper
- [x] Scheduling: weekly program, execution tasks, work package assembly
- [x] Reliability: Weibull, health score, spare parts, RBI, shutdown
- [x] Advanced: OCR, Jackknife, Pareto, LCC, MoC
- [x] KPIs: planning (11), DE (5), MTBF/MTTR/OEE
- [x] System: notification, reporting, cross-module, data import/export, variance detector
- [x] Validators: quality (40+ rules), confidence, naming

### Multi-Agent System
- [x] 4 agents: orchestrator (Sonnet), reliability (Opus), planning (Sonnet), spare parts (Haiku)
- [x] 4 system prompts (GFSN-aligned)
- [x] 28 tool wrapper files (62+ MCP tools)
- [x] Tool registry and MCP server
- [x] 4-milestone workflow with human approval gates
- [x] Session state management
- [x] CLI entry point (agents/run.py)

### API Backend (FastAPI)
- [x] 17 API routers
- [x] 21 service modules
- [x] Database seeding (api/seed.py)
- [x] CORS, health check, root endpoint

### Streamlit Frontend
- [x] 17 pages (hierarchy → defect elimination)
- [x] Reusable components (charts, forms, tables)
- [x] Full HTTP API client

### Processors
- [x] Field capture processor
- [x] Planner engine
- [x] Backlog optimizer
- [x] Gantt generator
- [x] PII redactor

## Phase 4A: Methodology Alignment — GFSN (COMPLETE)
- [x] Configurable criticality bands (GFSN 3-level + R8 4-level)
- [x] Configurable consequence factors (GFSN 6 + R8 11)
- [x] GFSN priority 2D matrix compatibility mode
- [x] SAP WO 8-status lifecycle (PLN→CTEC)
- [x] SAP notification 4-status lifecycle (MEAB→MECE)
- [x] RCA engine (event classification, 5W+2H, Cause-Effect, 5P's evidence, 3-level root cause)
- [x] Solution evaluation (5-question filter) and prioritization (Cost-Benefit × Difficulty)
- [x] Planning KPI engine (11 KPIs with GFSN targets)
- [x] DE KPI engine (5 KPIs with trend analysis, program health)
- [x] GFSN reference documents (REF-13 to REF-17)

## Phase 4B: Scheduling Engine (COMPLETE)
- [x] Weekly program model (DRAFT→PRELIMINARY→FINAL→ACTIVE→COMPLETED)
- [x] Support tasks (LOTO, scaffolding, crane, cleaning, commissioning)
- [x] Resource leveler (workload balancing, interference checking, capacity)
- [x] Work package assembler (7 mandatory elements)
- [x] Gantt data generator
- [x] Shutdown integration
- [x] Scheduling API endpoints and service
- [x] Scheduling Streamlit page

## Phase 5: Advanced Reliability (COMPLETE)
- [x] Spare parts criticality (VED/FSN/ABC)
- [x] Shutdown execution tracking
- [x] MoC workflow
- [x] OCR cost-risk optimization
- [x] Jack-Knife bad actor identification
- [x] LCC life cycle cost
- [x] Pareto 80/20 analysis
- [x] RBI risk-based inspection

## Phase 6: Reporting & Dashboards (COMPLETE)
- [x] Weekly/monthly/quarterly report generation
- [x] Notification engine
- [x] Cross-module correlation analysis
- [x] Data import/export engines
- [x] Executive dashboard API + UI
- [x] KPI summary dashboard

## Phase 7: FMECA Worksheets (COMPLETE)
- [x] FMECA 4-stage worksheet model
- [x] RPN calculation
- [x] FMECA API endpoints
- [x] FMECA Streamlit page

## Phase 8: RCA/DE Full Stack (COMPLETE)
- [x] RCA database models (RCAAnalysisModel)
- [x] Planning KPI snapshot model (history tracking)
- [x] DE KPI snapshot model (program maturity tracking)
- [x] RCA API service + router (9 endpoints)
- [x] Defect Elimination Streamlit page (4 tabs)
- [x] API client functions (12 new)
- [x] API tests (14 new tests)

## Phase 9: Refinement & Polish (COMPLETE)
- [x] Trilingual UI (French/English/Arabic switcher)
- [x] Professional styling for all Streamlit pages
- [x] Charts and KPI visualizations (Plotly)
- [x] User feedback collection mechanisms
- [x] End-to-end integration testing

## Phase 9B: Data Templates, Documentation, Equipment Libraries & Hierarchy Builder (COMPLETE)

### D1: Excel Templates for Data Loading
- [x] `templates/generate_templates.py` — script generating 13 .xlsx templates
- [x] OCP green headers, frozen panes, data validation dropdowns, 3-5 example rows
- [x] Multi-sheet relational design for Task resources (labour_id, material_line_id, tool_line_id)
- [x] Valid FM Combinations reference sheet in Template 03
- [x] 55 tests passing (`tests/test_templates.py`)

### D2: Tool Listing
- [x] `docs/tool-listing.md` — 37 engines, 126 MCP tools, 3 validators, 5 processors

### D3: Variable Listing
- [x] `docs/variable-listing.md` — ~70 enums, 30 tables, 17 routers, KPI definitions, 72 FM combos

### D4: Software Glossary
- [x] `docs/glossary.md` — ~105 trilingual terms (EN/FR/AR) across 4 domains

### D5: How-To Guides
- [x] `docs/how-to-guides/` — 6 role-based guides (field technician, planner, reliability engineer, analyst, administrator, manager)

### D6: Hierarchy Builder from Vendor Data
- [x] `tools/engines/hierarchy_builder_engine.py` — builds Equipment → Sub-Assembly → MI from vendor data
- [x] `api/services/hierarchy_builder_service.py` + `POST /api/v1/hierarchy/build-from-vendor`
- [x] `agents/tool_wrappers/hierarchy_builder_tools.py` — 3 new MCP tools (126 total)
- [x] Streamlit UI: "Build from Vendor Data" form on Page 1
- [x] i18n keys added (9 per language)
- [x] 24 tests passing (`tests/test_hierarchy_builder.py`)

### D7: Equipment Type Libraries
- [x] `Libraries/equipment_library.json` — 15 phosphate equipment types with sub-assemblies, MIs, failure modes, Weibull params
- [x] `Libraries/component_library.json` — standard components (bearings, seals, motors, etc.)
- [x] `Libraries/README.md` — library documentation
- [x] 30 tests passing (`tests/test_equipment_library.py`)

## Test Coverage
- [x] 82 test files across 4 categories (engine, API, processor, integration)
- [x] **1208 tests passing** (all green)

---

## Remaining Work (Future Phases)

### Phase 10: Deployment
- [ ] Cloud deployment (Streamlit Cloud or AWS)
- [ ] Real SAP PM connection (replacing mock)
- [ ] Claude API integration (live agent workflows)
- [ ] Automation triggers (webhooks for new work requests)
- [ ] Production database migration (PostgreSQL)
