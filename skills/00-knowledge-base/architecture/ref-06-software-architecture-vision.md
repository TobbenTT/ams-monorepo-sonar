# REF-06: Software Architecture Vision — Skill-Based AI Agent Platform

## Source: 9 Software Development Context Documents + Implemented Skill Architecture (v1.1)

---

## 1. Strategic Vision: The Corporate Second Brain

### 1.1 Four Pillars

| Pillar | Metaphor | Function |
|--------|----------|---------|
| **Multimodal Ingestion** | "The Senses" | Captures meetings (audio/video), live documents (email, PDF), structured data (IoT/ERP/SAP) |
| **Memory Core** | "The Cortex" | Vector Database (semantic search) + Knowledge Graph (entity relationships) |
| **Reasoning Engine** | "The Processor" | LLMs with RAG + specialized skill-based agents (Reliability, Planning, Cost, Orchestration) |
| **Action & Sync** | "The Hands" | Function Calling to APIs (SAP, Airtable, Jira), automated actions with mandatory human gates |

### 1.2 Implementation Roadmap (4 Phases)

| Phase | Name | Capabilities |
|-------|------|-------------|
| 1 | Passive Memory | Capture and search — meetings, emails, docs indexed and searchable |
| 2 | Analytical Intelligence | Extract risks, tasks, decisions from captured data |
| 3 | Connected Brain | Knowledge Graph linking people, projects, assets, decisions |
| 4 | Autonomous Execution | Human-in-the-loop actions — update SAP, Airtable, Jira automatically |

---

## 2. Skill-Based Agent Architecture (Implemented)

### 2.1 Architecture Pattern

The system is built on a **modular skill-based architecture** where each capability is an autonomous, self-contained skill that can be invoked independently or orchestrated into complex workflows. This replaces monolithic business logic with composable, testable, AI-augmented units.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT (Opus)                    │
│         orchestrate-workflow · validate-quality                 │
│         conduct-management-review · generate-reports            │
├─────────────┬──────────────────┬────────────────┬──────────────┤
│ RELIABILITY │   PLANNING       │  SPARE PARTS   │   SHARED     │
│ ENGINEER    │   SPECIALIST     │  SPECIALIST    │   SERVICES   │
│ (Opus)      │   (Sonnet)       │  (Haiku)       │              │
├─────────────┼──────────────────┼────────────────┼──────────────┤
│ assess-     │ calculate-       │ optimize-      │ import-data  │
│ criticality │ planning-kpis    │ spare-parts-   │ export-data  │
│ perform-    │ calculate-       │ inventory      │ analyze-     │
│ fmeca       │ priority         │ suggest-       │ cross-module │
│ run-rcm-    │ export-to-sap    │ materials      │ resolve-     │
│ decision-   │ group-backlog    │ resolve-       │ equipment    │
│ tree        │ orchestrate-     │ equipment      │ manage-capa  │
│ fit-weibull │ shutdown         │                │              │
│ perform-rca │ schedule-weekly  │                │              │
│ build-      │ manage-change    │                │              │
│ equipment-  │ manage-          │                │              │
│ hierarchy   │ notifications    │                │              │
│ calculate-  │ assemble-work-   │                │              │
│ kpis        │ packages         │                │              │
│ assess-rbi  │ generate-work-   │                │              │
│ validate-   │ instructions     │                │              │
│ failure-    │                  │                │              │
│ modes       │                  │                │              │
└─────────────┴──────────────────┴────────────────┴──────────────┘
         │                │               │              │
         └────────────────┴───────────────┴──────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    KNOWLEDGE BASE       │
                    │  (00-knowledge-base/)   │
                    │  Single Source of Truth  │
                    └─────────────────────────┘
```

### 2.2 Skill Anatomy (Standard Structure)

Every skill follows a standardized structure:

```
skills/<category>/<skill-name>/
├── CLAUDE.md          # Skill definition (intake, logic, validation, references)
├── evals/
│   ├── evals.json           # Evaluation test cases
│   └── trigger-eval.json    # Trigger word evaluation
├── references/
│   └── *.md                 # Skill-specific reference documents
└── scripts/
    └── validate.py          # Deterministic validation script
```

Each `CLAUDE.md` contains:

| Section | Purpose |
|---------|---------|
| **Trigger Words** | EN/ES bilingual activation phrases |
| **Rol y Persona** | Agent role and domain expertise |
| **Intake** | Required input parameters (Pydantic-validated) |
| **Flujo de Ejecucion** | Step-by-step execution logic |
| **Logica de Decision** | Decision trees, matrices, algorithms |
| **Validacion** | Quality checks and edge cases |
| **Recursos Vinculados** | Links to knowledge base references |
| **Common Pitfalls** | Anti-patterns and warnings |

### 2.3 Specialist Agents & Multi-Model Strategy

| Agent | LLM Model | Domain | Skills Assigned |
|-------|-----------|--------|----------------|
| **Orchestrator** | Opus | Workflow coordination, quality, reporting | orchestrate-workflow, validate-quality, conduct-management-review, generate-reports, calculate-health-score, calculate-kpis, detect-variance |
| **Reliability Engineer** | Opus | RCM methodology, statistical analysis, failure analysis | assess-criticality, perform-fmeca, run-rcm-decision-tree, fit-weibull-distribution, perform-rca, build-equipment-hierarchy, assess-risk-based-inspection, validate-failure-modes |
| **Planning Specialist** | Sonnet | Work planning, scheduling, SAP integration | calculate-planning-kpis, calculate-priority, export-to-sap, group-backlog, orchestrate-shutdown, schedule-weekly-program, assemble-work-packages, generate-work-instructions, manage-change, manage-notifications |
| **Spare Parts Specialist** | Haiku | Inventory, materials, equipment resolution | optimize-spare-parts-inventory, suggest-materials, resolve-equipment |
| **Shared Services** | All | Cross-cutting utilities | import-data, export-data, analyze-cross-module, manage-capa |

**Multi-Model Rationale:**

| Model | Use Case | Rationale |
|-------|----------|-----------|
| **Opus** | Complex reasoning (RCM decisions, FMECA, RCA, orchestration) | Highest accuracy for domain-critical decisions |
| **Sonnet** | Planning, scheduling, data transformation | Balance of speed and capability for structured tasks |
| **Haiku** | Lookups, material matching, equipment resolution | Fast, cost-effective for retrieval-heavy operations |

---

## 3. Skill Catalog (36+ Skills across 7 Categories)

### 3.1 Category 00: Knowledge Base — Single Source of Truth

| Sub-directory | Contents |
|---------------|----------|
| `architecture/` | Software vision, user guides, neuro-architecture UX |
| `client/` | OCP client context |
| `competitive/gecamin/` | 57 GECAMIN conference presentations (competitive intelligence) |
| `data-models/` | R8 entities, 72 failure mode combinations, component/equipment libraries, variable listing |
| `gfsn/` | Gold Fields Salares Norte methodology (4 full procedures) |
| `integration/` | SAP PM integration, R8 integration master plan, upload templates |
| `methodologies/` | RCM, R8 tactics, work instruction templates, deployment flowcharts |
| `quality/` | 40+ validation rules, MSO checklist, QA flowcharts |
| `standards/` | ISO 55002:2018, PAS 55:2008 |
| `strategic/` | ISO compliance mapping, strategic recommendations, gap analysis |

### 3.2 Category 02: Maintenance Strategy Development (8 Skills)

| Skill | Purpose | Key Standards |
|-------|---------|---------------|
| **assess-criticality** | Risk class determination using R8 Full Matrix (11 categories, 4 classes) or GFSN (6 factors, 3 bands) | ISO 55002 s6.2.2 |
| **assess-risk-based-inspection** | RBI analysis for static equipment, likelihood x consequence | API 580/581 |
| **assemble-work-packages** | Group tasks by frequency, specialty, constraint into executable packages | — |
| **build-equipment-hierarchy** | 6-level ISO 14224 hierarchy (Plant > Area > System > Equipment > Sub-Assembly > MI) | ISO 14224 |
| **generate-work-instructions** | Detailed work instructions with safety, tools, steps, material kits | — |
| **perform-fmeca** | 4-stage FMECA: functions > failures > effects (RPN) > RCM strategy | SAE JA-1011 |
| **run-rcm-decision-tree** | 16-path decision tree selecting CB, FT, FF, RTF, or REDESIGN | SAE JA-1012 |
| **validate-failure-modes** | Validates against authoritative 72 Mechanism+Cause combinations | Internal standard |

### 3.3 Category 02B: Work Planning (8 Skills)

| Skill | Purpose | Key Output |
|-------|---------|------------|
| **calculate-planning-kpis** | 11 GFSN Planning KPIs with HEALTHY/AT_RISK/CRITICAL classification | KPI dashboard |
| **calculate-priority** | Work order prioritization: Equipment Criticality x Consequence = P1/P2/P3 | Priority bands |
| **export-to-sap** | 3 linked SAP PM upload templates (MI, Task List, Maintenance Plan) — always DRAFT | SAP-ready files |
| **group-backlog** | 3-strategy backlog optimization (by equipment, area, shutdown window) | Grouped backlog |
| **optimize-spare-parts-inventory** | Multi-criteria spare parts criticality scoring (LOW/MEDIUM/HIGH/CRITICAL) | Scored inventory |
| **orchestrate-shutdown** | Shutdown scheduling with critical path, resource leveling, constraints | Shutdown plan |
| **schedule-weekly-program** | Weekly program balancing preventive plan, corrective backlog, capacity | Weekly schedule |
| **suggest-materials** | BOM suggestion from component library and failure mechanism mapping | Material list |

### 3.4 Category 03: Reliability Engineering & Defect Elimination (4 Skills)

| Skill | Purpose | Technique |
|-------|---------|-----------|
| **analyze-jackknife** | Equipment performance variance detection across plants | Jack-Knife ±3σ outlier detection |
| **analyze-pareto** | 80/20 failure frequency/cost analysis | Vital Few vs. Useful Many |
| **fit-weibull-distribution** | 2-parameter Weibull via RRY with Nowlan & Heap pattern classification (A-F) | Statistical reliability |
| **perform-rca** | Full GFSN RCA: 5W+2H, Ishikawa 6M, 5P evidence, 3-level root cause chain | Root cause analysis |

### 3.5 Category 04: Cost Analysis (2 Skills)

| Skill | Purpose | Standard |
|-------|---------|----------|
| **calculate-life-cycle-cost** | NPV-based LCC: acquisition, installation, operating, maintenance, salvage | ISO 15663-1 |
| **optimize-cost-risk** | Cost-benefit optimization for PM intervals (preventive cost vs. failure risk) | — |

### 3.6 Category 05: General Functionalities (5 Skills)

| Skill | Purpose |
|-------|---------|
| **export-data** | Export to Excel, CSV, JSON with template application |
| **import-data** | Parse, validate, auto-map CSV/Excel imports (equipment, failure history, maintenance plans) |
| **manage-change** | Management of Change (MOC) workflow with approval gates |
| **manage-notifications** | SAP notification management with priority routing and escalation |
| **validate-quality** | 40+ deterministic validation rules (H-01 to WP-13) with ERROR/WARNING/INFO severity |

### 3.7 Category 06: Orchestration (6 Skills)

| Skill | Purpose |
|-------|---------|
| **calculate-health-score** | Composite health score from 4 factors (condition, compliance, failure, age) = 0-100 |
| **calculate-kpis** | 7 maintenance KPIs: MTBF, MTTR, Availability, OEE, Schedule/PM Compliance, Reactive Ratio |
| **conduct-management-review** | Executive review per ISO 55002 s9.3: KPI dashboards, trends, improvement recommendations |
| **detect-variance** | Multi-plant variance detection using ±3σ control limits on MTBF/MTTR/Availability |
| **generate-reports** | Automated report generation (strategy docs, KPI dashboards, RCA reports, shutdown plans) |
| **orchestrate-workflow** | **Master orchestrator**: 4-milestone MSD workflow with agent delegation and quality gates |

### 3.8 Root-Level Shared Skills (3 Skills)

| Skill | Purpose |
|-------|---------|
| **analyze-cross-module** | Cross-module correlation (criticality vs. failures, cost vs. reliability, "bad actor" identification) |
| **manage-capa** | CAPA tracking through PDCA cycle with effectiveness verification per ISO 55002 s10.1/10.2/10.4 |
| **resolve-equipment** | 5-step equipment resolution cascade: exact TAG > regex > alias > fuzzy TAG > fuzzy description |

---

## 4. Orchestration & Workflow Engine

### 4.1 Four-Milestone Workflow

The `orchestrate-workflow` skill coordinates the end-to-end Maintenance Strategy Development (MSD) process:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   MILESTONE 1    │────>│   MILESTONE 2    │────>│   MILESTONE 3    │────>│   MILESTONE 4    │
│                  │     │                  │     │                  │     │                  │
│ Equipment        │     │ FMEA             │     │ RCM Decisions    │     │ SAP Export       │
│ Registration +   │     │ Functions >      │     │ Task Definition  │     │ Work Instructions│
│ Hierarchy +      │     │ Failures >       │     │ Work Packaging   │     │ Quality          │
│ Criticality      │     │ Failure Modes    │     │                  │     │ Validation       │
│                  │     │                  │     │                  │     │                  │
│ [HUMAN GATE]     │     │ [HUMAN GATE]     │     │ [HUMAN GATE]     │     │ [HUMAN GATE]     │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

### 4.2 Human-in-the-Loop Safety Model

| Principle | Implementation |
|-----------|---------------|
| **DRAFT-First** | All AI outputs enter as DRAFT status — never auto-published |
| **Mandatory Gates** | Every milestone requires explicit APPROVE / MODIFY / REJECT |
| **No Auto-Execution** | Never auto-submit to SAP or external systems |
| **Confidence Scoring** | Low-confidence items flagged for mandatory manual review |
| **Deterministic Validation** | 40+ rules run before each gate (rule-based, not LLM-based) |
| **Status Lifecycle** | PENDING > IN_PROGRESS > PRESENTED > APPROVED / MODIFIED / REJECTED |

### 4.3 Quality Validation System (40+ Rules)

| Rule Group | Entity | Example Rules |
|------------|--------|---------------|
| H-01 to H-04 | Hierarchy | Level limits, parent-child integrity, library references |
| F-01 to F-05 | Functions | Required functions per equipment, description quality |
| C-01 to C-04 | Criticality | Required assessments, matrix completeness |
| FM-01 to FM-07 | Failure Modes | 72-combo enforcement, naming conventions |
| T-01 to T-19 | Tasks | Resources, frequencies, naming, 72-char SAP limit |
| WP-01 to WP-13 | Work Packages | Constraint mixing, naming, frequency alignment |
| GAP-2 | Cross-entity | CB limits, FFI task consistency |
| OPP-4 | AI Confidence | Threshold-based review escalation |

**Severity Levels:** ERROR (must fix) | WARNING (review recommended) | INFO (informational)

---

## 5. Data Models & Standards Compliance

### 5.1 Supported Standards

| Standard | Coverage | Application |
|----------|----------|-------------|
| **ISO 55002:2018** | ~80% compliance | Asset management system |
| **PAS 55:2008** | Reference | Asset management specification |
| **SAE JA-1011/JA-1012** | Full | RCM methodology and decision logic |
| **ISO 14224** | Full | Equipment taxonomy (6-level hierarchy) |
| **EN 15341** | Full | Maintenance KPI definitions |
| **ISO 15663-1** | Full | Life Cycle Costing |
| **API 580/581** | Full | Risk-Based Inspection |

### 5.2 Dual Methodology Support

| Method | Criticality Model | Risk Classes |
|--------|-------------------|-------------|
| **R8 Full Matrix** | 11 consequence categories, 4x4 matrix | Class I (highest) to Class IV (lowest) |
| **GFSN** | 6 consequence factors, 5x5 matrix | ALTO / MODERADO / BAJO |

### 5.3 The 72 Failure Mode Combinations

The **authoritative** `Failure Modes (Mechanism + Cause).xlsx` table governs all failure mode assignments. ALL failure modes MUST reference this table — no new combinations allowed without updating the master. Enforced by the `validate-failure-modes` skill.

### 5.4 R8 Data Model (12+ Entities)

| Entity Group | Entities |
|-------------|----------|
| **Asset Structure** | Equipment Hierarchy (6 levels), Functions, Functional Failures |
| **Failure Analysis** | Failure Modes, Criticality Assessments, RCM Decisions |
| **Work Management** | Tasks, Work Packages, Maintenance Plans, Work Orders |
| **Support** | Materials, Notifications, Spare Parts |

### 5.5 Template System (14 Excel Templates)

| # | Template | Direction |
|---|----------|-----------|
| 01 | Equipment Hierarchy | Input |
| 02 | Criticality Assessment | Input/Output |
| 03 | Failure Modes | Input/Output |
| 04 | Maintenance Strategy | Output |
| 05 | Maintenance Tasks | Output |
| 06 | Work Order History | Input |
| 07 | Spare Parts Inventory | Input |
| 08 | Work Packages | Output |
| 09 | Workforce | Input |
| 10 | Shutdown Calendar | Input/Output |
| 11 | Field Capture | Input |
| 12 | Planning KPI Input | Input |
| 13 | RCA Events | Input |
| 14 | DE KPI Input | Input |

---

## 6. SAP PM Integration

### 6.1 Three Linked Upload Templates

Generated by the `export-to-sap` skill:

| Template | Key Fields | Constraints |
|----------|-----------|-------------|
| **Maintenance Item ($MI)** | Order type, functional location, task list reference | Must reference valid $TL |
| **Task List ($TL)** | Operations with work centers, control keys, durations | short_text max 72 chars, min duration 0.5h |
| **Maintenance Plan** | Cycle, scheduling period, call horizon | Every $TL must be referenced |

### 6.2 Safety Rules

- **Always DRAFT** — human planner must complete `func_loc` and `main_work_center` before SAP upload
- **Cross-reference validation** — every $MI must point to a valid $TL, every $TL must be referenced
- **Constraint mapping** — ONLINE=1, OFFLINE=3
- **Minimum workers** — always >= 1

---

## 7. Technology Stack

### 7.1 Confirmed for MVP

| Layer | Technology | Purpose |
|-------|-----------|---------|
| AI/NLP | Claude API (Opus + Sonnet + Haiku) | Multi-model skill execution |
| Agent Framework | Skill-based CLAUDE.md architecture | Modular, composable AI capabilities |
| Database | PostgreSQL (local) | Relational data, equipment, work orders |
| Backend | Python (FastAPI) | API services, business logic |
| UI (Prototype) | Streamlit | Planner dashboard, data visualization |
| Knowledge Base | Markdown files (skills/00-knowledge-base/) | Shared reference documents |
| Validation | Python scripts + deterministic rules | 40+ quality rules per entity type |
| Templates | Excel (.xlsx) | 14 standardized input/output templates |

### 7.2 Full Platform Stack (Phase 2+)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Database (Cloud) | Supabase (PostgreSQL + pgvector) | Native vector support, RLS, Realtime, Auth |
| Vector Index | HNSW on pgvector | Semantic search at scale |
| Workflow Orchestration | n8n (self-hosted on AWS) | Low-code automation, webhooks |
| AI Agent Framework | LangGraph | Cyclic graphs, state persistence, human-in-the-loop |
| Tool Integration | MCP (Model Context Protocol) | Standardized AI-tool connectivity |
| LLM (Primary) | Claude Opus / Sonnet / Haiku | Multi-model strategy (see 2.3) |
| LLM (Long context) | Gemini 1.5 Pro | Meeting transcription processing |
| LLM (Enterprise) | AWS Bedrock / Azure OpenAI | Compliance-first environments |
| Transcription | Deepgram Nova-2 | Best diarization, cost-effective |
| PII Redaction | Microsoft Presidio | Pattern + NLP detection, synthetic replacement |
| Frontend | Next.js on Vercel | Edge performance, SSO |
| Mobile | React Native | Field technician capture app |
| Admin UI | Retool | Rapid internal tools with RBAC |
| Analytics | Streamlit | Python-native data visualization |
| No-Code | Airtable | "Last mile" for field teams |
| Knowledge Graph | Neo4j (or Postgres-based) | Entity-relationship reasoning |
| Cache | Redis | API response caching |
| Always-On | Hostinger VPS (KVM) | Webhook listeners |

### 7.3 Database Schema (Supabase — Future)

**Core Tables:**

| Table | Purpose | Key Features |
|-------|---------|-------------|
| `memories` | Vectorized text chunks | embeddings (pgvector), metadata JSONB, source_type enum, owner_id, ACL |
| `communications` | Immutable raw payloads | Audit trail, never modified |
| `entities` | Knowledge graph nodes | Extracted entities and relationships |

**Indexes:** HNSW on embeddings, GIN on metadata JSONB

**Security:** Row-Level Security (RLS) via auth.uid() in JWT

---

## 8. UX/Behavioral Design Principles

### Source: Neuro-Architecture Document

### 8.1 Cognitive Design Rules

| Principle | Application | Anti-Pattern to Avoid |
|-----------|------------|----------------------|
| Shared Mental Models | Visualize interdependencies, not isolated tasks | Flat task lists with no context |
| Transactive Memory | Show "who knows what" via expert cards | Hiding expertise behind org charts |
| Progressive Disclosure | 5 expandable categories, not 50 flat metrics | Information overload |
| Ipsative Feedback | Compare user to their own past, not peers | Competitive leaderboards |
| Zeigarnik Effect | Progress bars (85% complete) | Binary status (Red/Green) |

### 8.2 Behavioral Nudges for the Software

| Nudge | Implementation |
|-------|---------------|
| Smart Defaults | Pre-fill forms with AI suggestions |
| Completion Nudge | Progress bars on work package development |
| Social Proof | "85% of planners have approved their packages" |
| Active Commitment | "I accept this maintenance strategy" button |
| Draft Mode | Always save as draft first, never auto-publish |
| Error Reframing | "Learning opportunity" not "Non-compliance" |

### 8.3 Anti-Patterns to Avoid

| Anti-Pattern | Why It's Harmful | Better Alternative |
|-------------|-----------------|-------------------|
| Red/Green traffic lights | Triggers amygdala threat response | Progress indicators (85% complete) |
| Lagging indicators only | Can't act on historical data | Leading indicators + trends |
| Punitive terminology | Reduces psychological safety | Non-punitive language |
| No undo capability | Fear of making mistakes | Universal Undo + Draft modes |
| Flat 50-metric dashboards | Cognitive overload | Hierarchical 5-category drill-down |

---

## 9. Competitive Landscape

### 9.1 AI-Native Architecture Advantages

| Feature | Legacy (SAP, Oracle) | AI-Native (Our Approach) |
|---------|---------------------|-------------------------|
| Data model | Rigid SQL schemas | Flexible: SQL + Vector + Graph |
| Unstructured data | Can't handle | Native (voice, images, PDFs) |
| Search | Keyword-based | Semantic (meaning-based) |
| Automation | Rule-based scripts | Goal-oriented skill-based agents |
| Pricing | Per-seat | Per-value-delivered |
| Maintenance logic | Hardcoded modules | Composable, versionable skills |
| Quality assurance | Post-hoc audits | Inline 40+ rule validation at every gate |

### 9.2 Three-Layer Moat

| Layer | Components |
|-------|-----------|
| **Methodology** | RCM (SAE JA-1011) + GFSN dual-method + 72 FM combinations |
| **Technology** | Claude multi-model + skill architecture + deterministic validation |
| **Domain Expertise** | 57 GECAMIN analyses + ISO 55002 mapping + OCP client context |

### 9.3 GECAMIN Competitive Intelligence

57 conference presentations from GECAMIN MAPLA 2024 analyzed and incorporated into the knowledge base, covering: AI anomaly detection, digital twins, chatbot expert systems, predictive maintenance, asset health indices, and unified data management across major mining companies (Codelco, SQM, Teck).

### 9.4 Validated AI Startups in the Space

| Startup | Capability | Relevance |
|---------|-----------|-----------|
| nPlan | 750K+ project schedules, Deep Learning scheduling | Schedule optimization |
| Buildots | 360° camera + CV validates BIM vs reality | Field capture validation |
| ALICE Technologies | Generative scheduling, 17% duration reduction | Work package optimization |
| Slate.ai | Contextual agents inferring conflicts | Multi-constraint reasoning |
| Downtobid | AI bid analysis, 30% higher response rates | Procurement assistant |

---

## 10. Mining Industry Digitalization Context

### 10.1 Three Layers of AI in Mining

| Layer | Examples | Maturity |
|-------|---------|---------|
| Operational AI | Autonomous trucks, predictive maintenance sensors | Established |
| Process AI | Ventilation optimization, fleet dispatch | Growing |
| Management AI | Predictive project analytics, generative planning, automated reporting | Emerging (our opportunity) |

### 10.2 Demonstrated ROI

| Company | Improvement | Technology |
|---------|-------------|-----------|
| Rio Tinto | 2-5% recovery improvement | AI process optimization |
| Newmont | 7-10% daily production increase | Predictive analytics |
| Teck Resources | 9% energy reduction | AI optimization |
| Industry average | 3-6% annual compound cost reduction | Mature OpEx programs |

---

## 11. Cost Estimates (from Development Context)

### Full Platform (SME scenario)

| Component | Monthly Cost |
|-----------|-------------|
| Supabase Enterprise | $200-400 |
| Cloud Run/Fargate (agents) | $100-300 |
| LLM API calls (multi-model) | $100-400 |
| n8n hosting | $50-100 |
| Deepgram | $50-100 |
| Monitoring/logging | $50-100 |
| **Total** | **$600-1,500/month** |

---

## 12. Bilingual & Internationalization

| Language | Status | Coverage |
|----------|--------|----------|
| **English** | Full | All skills, triggers, outputs |
| **Spanish** | Full | All skill triggers, knowledge base, GFSN procedures |
| **French** | Partial | Equipment descriptions (OCP context) |
| **Arabic** | Deferred | Phase 2 |
