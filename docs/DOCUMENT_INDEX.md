# DOCUMENT INDEX — Master Control Register
# OCP Maintenance AI MVP

**Purpose:** This is the single entry point for ALL project knowledge. Agents, skills, and developers MUST consult this index FIRST before reading full documents. Each entry provides a summary and routing guidance to minimize token consumption.

**Rule:** Read the SUMMARY document first. Only read the FULL document if deeper detail is needed.

---

## HOW TO USE THIS INDEX

1. **Identify your topic** from the categories below
2. **Read the SUMMARY document** (architecture/ref-XX) — typically 200-400 lines, covers 90% of needs
3. **Only if needed**, read the FULL SOURCE document for raw detail
4. **For schemas/rules**, always refer to `gemini.md` as the single source of truth

---

## TIER 1: PROJECT GOVERNANCE (Read First, Always)

| ID | Document | Path | Purpose | When to Read |
|----|----------|------|---------|-------------|
| **GOV-01** | **gemini.md** | `gemini.md` | **PROJECT CONSTITUTION.** Data schemas, behavioral rules, architectural invariants, integration registry. This is LAW. | ALWAYS read first for any schema, rule, or constraint question |
| **GOV-02** | **DOCUMENT_INDEX.md** | `DOCUMENT_INDEX.md` | **THIS FILE.** Master navigation. Routes to correct document. | When starting any new task or research |
| **GOV-03** | **task_plan.md** | `task_plan.md` | Phases, goals, checklists. Current project status. | When checking what to do next |
| **GOV-04** | **progress.md** | `progress.md` | Session log. What was done, errors, tests. | When resuming work or checking history |
| **GOV-05** | **findings.md** | `findings.md` | Research discoveries, client context summary, technology decisions. | When needing project context quickly |

---

## TIER 2: REFERENCE DOCUMENTS (Summaries — Read These)

### Domain Knowledge

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-01** | Maintenance Strategy Methodology | `architecture/ref-01-maintenance-strategy-methodology.md` | Full RCM process: 5 phases, criticality matrix, decision tree, task definition, work packaging, frequency selection | ~400 | ~3K |
| **REF-02** | R8 Data Model & Entities | `architecture/ref-02-r8-data-model-entities.md` | All R8 entity schemas (12+ entities), field definitions, code tables, ERD, library system | ~350 | ~2.5K |
| **REF-04** | Quality Validation Rules | `architecture/ref-04-quality-validation-rules.md` | 6-stage QA process, 40+ field-level validation rules, MSO checklists, lessons learned | ~350 | ~2.5K |
| **REF-07** | Work Instruction Templates | `architecture/ref-07-work-instruction-templates.md` | WI structure, 4 WP type templates, naming conventions, material kits, SAP mapping | ~250 | ~2K |

### Technical Integration

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-03** | SAP PM Integration | `architecture/ref-03-sap-pm-integration.md` | SAP upload templates (3 files, 64 fields total), cross-reference model, field mappings, upload process, SAP transactions | ~300 | ~2.5K |
| **REF-06** | Software Architecture Vision | `architecture/ref-06-software-architecture-vision.md` | Second Brain vision, full tech stack (20+ technologies), 10 AI use cases, UX principles, competitive landscape | ~300 | ~2.5K |

### Client & Business

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-05** | Client Context OCP | `architecture/ref-05-client-context-ocp.md` | OCP pain points, MVP scope (3+1 modules), timeline (16-24 weeks), success metrics, risks, data requirements | ~250 | ~2K |

### User Guide

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-08** | Step-by-Step User Guide | `architecture/ref-08-user-guide-step-by-step.md` | Complete step-by-step for all 4 modules, daily workflows, workshop workflow, emergency workflow | ~400 | ~3K |

### Standards & Compliance

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-09** | ISO 55002 Compliance Mapping | `architecture/ref-09-iso-55002-compliance-mapping.md` | ISO 55002:2018 clause-by-clause mapping, compliance scorecard (80%, up from 73%), gap analysis with 5 closed gaps, 9 remaining gaps | ~290 | ~2.5K |

### Competitive Intelligence & Strategy

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-10** | GECAMIN MAPLA 2024 Cross-Reference | `architecture/ref-10-gecamin-cross-reference.md` | 22+ GECAMIN presentations analyzed, myRIAM competitor analysis, competitive positioning matrix, validated claims, 9 recommendations | ~350 | ~3K |
| **REF-11** | Neuro-Arquitectura Integrated Review | `architecture/ref-11-neuro-arquitectura-review.md` | 6 behavioral science pillars mapped to 4 modules, implementation checklists, bias mitigation, ISO 55002 integration, GECAMIN cross-validation | ~350 | ~3K |
| **REF-12** | Final Strategic Recommendations | `architecture/ref-12-strategic-recommendations.md` | 10 strategic recommendations, 3-layer competitive moat, implementation priority matrix, risk assessment, Phase 0 plan | ~350 | ~3K |

### GFSN Maintenance Methodology (Gold Fields Salares Norte)

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **REF-13** | Maintenance Management Manual | `architecture/ref-13-maintenance-manual-methodology.md` | GFSN maintenance governance, FMECA, criticality (3-level Alto/Moderado/Bajo), technical hierarchy naming, RBI, RCM process, improvement techniques (OCR, Pareto, Jack-Knife, Weibull, LCC, MoC), 8 KPIs, organizational structure | ~350 | ~3K |
| **REF-14** | Planning & Scheduling Procedure | `architecture/ref-14-planning-scheduling-procedure.md` | 6-stage weekly cycle, two work streams (preventive from Plan Matriz + corrective from Avisos), priority matrix, SAP WO status flow, work package contents, 11 KPIs with targets, 7 roles, weekly scheduling meeting structure | ~240 | ~2K |
| **REF-15** | Defect Elimination Procedure | `architecture/ref-15-defect-elimination-procedure.md` | 5-stage DE process (Identify→Prioritize→Analyze→Implement→Control), 5W+2H method, RCA Cause-Effect (Ishikawa), 5P's evidence framework, 3-level root cause (Physical→Human→Latent), solution prioritization matrix, 5 KPIs | ~300 | ~2.5K |
| **REF-16** | Asset Criticality Analysis Procedure | `architecture/ref-16-criticality-analysis-procedure.md` | Semi-quantitative method, 6 consequence factors (3 economic + 3 non-economic), 5×5 matrix, 3 criticality levels (Alto 19-25, Moderado 8-18, Bajo 1-7), ALARP zones, evaluation assumptions, comparison with current 4-class system | ~200 | ~2K |
| **REF-17** | Methodology Gap Analysis & Roadmap | `architecture/ref-17-methodology-gap-analysis-roadmap.md` | 20 gaps identified, detailed analysis per domain, proposed architectures for scheduling engine + RCA engine, 11 planning KPIs, 5 DE KPIs, technical roadmap (Phases 4A/4B/5), 7 decision points, 11 new MCP tools, agent prompt updates | ~400 | ~3.5K |

### Architecture & Blueprint

| ID | Document | Path | Covers | Lines | Token Est. |
|----|----------|------|--------|-------|-----------|
| **BP-01** | Blueprint | `architecture/BLUEPRINT.md` | Architecture diagram, 5-step build sequence, safety flow, trilingual approach, file structure, dependencies | ~350 | ~2.5K |

---

## TIER 3: SOURCE DOCUMENTS (Full Detail — Read Only When Needed)

### Client Context (Original)

| ID | Document | Path | Format | Pages | When to Read |
|----|----------|------|--------|-------|-------------|
| **SRC-01** | RFI Presentation | `CLIENT CONTEXT/RFI AI-Powered Asset Management and Maintenance Solution.pdf` | PDF | 17 slides | Need exact RFI wording, investment framework, or specific slide content |
| **SRC-02** | Data Requirements | `CLIENT CONTEXT/OCP_AI_Maintenance_Solution_Proposal.pdf` | PDF | 8 pages | Need exact field specifications for 15 data categories or folder structure |
| **SRC-03** | Meeting Transcripts | `CLIENT CONTEXT/MEETINGS/` | DOCX/PDF | Multiple | Need exact meeting context, decisions, or action items |

### R8 Software Documentation (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-09** | **Failure Modes Lookup Table (AUTHORITATIVE)** | `MAINTENANCE STRATEGY.../Failure Modes (Mechanism + Cause).xlsx` | XLSX (72 rows) | **MANDATORY** for any FMEA or failure mode work. Contains the ONLY 72 valid Mechanism+Cause combinations. ALL failure modes MUST reference this table. Any agent or assistant working with failure modes MUST validate against this table. |
| **SRC-10** | R8 Tactics Library Config | `MAINTENANCE STRATEGY.../R8-software-tactics-library-configuration-procedure.pdf` | PDF (147p) | Need exact R8 field names, screenshots, or configuration steps |
| **SRC-11** | R8 QA Guideline | `MAINTENANCE STRATEGY.../R8-software-maintenance-strategy-quality-analysis-guideline.pdf` | PDF | Need exact QA rule wording or examples |
| **SRC-12** | Maintenance Tactics Guideline | `MAINTENANCE STRATEGY.../maintenance-strategy-tactics-developmenet-Guideline v0.4.pdf` | PDF | Need exact Anglo American methodology text, criticality matrix details |
| **SRC-13** | Maintenance Tactics Process Map | `MAINTENANCE STRATEGY.../maintenance-strategy-tactics-developmenet-Process-Map.pdf` | PDF | Need exact process flow diagrams |
| **SRC-14** | R8 Asset Tactics Process | `MAINTENANCE STRATEGY.../R8-asset-maintenance-tactics-development-process.docx` | DOCX | Need exact workshop procedure, 3 approaches detail |
| **SRC-15** | RCM Documentation | `MAINTENANCE STRATEGY.../rcm-reliability-centred-maintenance.docx` | DOCX | Need exact RCM theory, simplified criticality method |
| **SRC-16** | R8 Deployment | `MAINTENANCE STRATEGY.../R8 Deployment -Implementation.pdf` | PDF | Need exact 6-phase deployment procedure |
| **SRC-17** | R8 Maintenance Plans Optimization | `MAINTENANCE STRATEGY.../R8-Maintenance-plans-Optimization.pdf` | PDF | Need exact optimization algorithms or methods |
| **SRC-18** | R8 Flowcharts | `MAINTENANCE STRATEGY.../R8-software-deployment-flow-charts.pdf` | PDF | Need exact R8 process flowcharts |
| **SRC-19** | R8 Tactics Library Procedure | `MAINTENANCE STRATEGY.../R8-software-tactics-library-configuration-procedure.pdf` | PDF | Need exact library configuration steps |
| **SRC-20** | R8 Integration Master Plan | `MAINTENANCE STRATEGY.../Rylson8-software-Integration-Master-Plan.docx` | DOCX | Need exact R8 module descriptions or integration details |
| **SRC-21** | MSO Process | `MAINTENANCE STRATEGY.../R8-maintenance-strategy-optimization-process.pptx` | PPTX | Need exact MSO step-by-step with screenshots |
| **SRC-22** | MSO Information | `MAINTENANCE STRATEGY.../MSO informacion.docx` | DOCX | Need exact workshop preparation questions (in Spanish) |
| **SRC-23** | MSO Checklist | `MAINTENANCE STRATEGY.../Check_list_MSO.xlsx` | XLSX | Need exact checklist items with columns |
| **SRC-24** | QA Flowchart | `MAINTENANCE STRATEGY.../maintenance-strategy-development-quality-management-flowchart.xlsx` | XLSX | Need exact QA flowchart steps, lessons learned |

### SAP Integration (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-30** | SAP EAM Presentation | `MAINTENANCE STRATEGY.../SAP EAM (PM).pptx` | PPTX | Need exact SAP PM structure screenshots or entity details |
| **SRC-31** | Setting up Plans in SAP | `MAINTENANCE STRATEGY.../Setting-up-Mtce-Plans-in-SAP-using R8.pdf` | PDF | Need exact R8→SAP mapping procedure with screenshots |
| **SRC-32** | SAP Maintenance Item Template | `MAINTENANCE STRATEGY.../sap-upload-sheets-template-.../Maintenance Item.xlsx` | XLSX | Need exact SAP upload field structure |
| **SRC-33** | SAP Task List Template | `MAINTENANCE STRATEGY.../sap-upload-sheets-template-.../Task List.xlsx` | XLSX | Need exact SAP task list operation fields |
| **SRC-34** | SAP Work Plan Template | `MAINTENANCE STRATEGY.../sap-upload-sheets-template-.../Work Plan.xlsx` | XLSX | Need exact SAP maintenance plan fields |

### Work Instruction Examples (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-40** | Anglo American WP Templates | `MAINTENANCE STRATEGY.../maintenance-work-instruction-template-examples/Anglo American Coal Work package templates/` | DOCX | Need exact WP template formatting, fields, examples |
| **SRC-41** | WI Template Examples | `MAINTENANCE STRATEGY.../maintenance-work-instruction-template-examples/` | DOCX/DOC/PDF | Need exact work instruction formatting from various sources |

### Software Development Context (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-50** | Antigravity Second Brain | `SOFTWARE DEVELOPMENT CONTEXT/Antigravity second brain.docx.md` | MD | Need exact tech stack benchmarks, 90-day plan, risk mitigations |
| **SRC-51** | Second Brain Architecture | `SOFTWARE DEVELOPMENT CONTEXT/Arquitectura del Second Brain Corporativo.md` | MD | Need exact 4-pillar architecture, Nexus prototype JSON |
| **SRC-52** | Technical Architecture Deep Dive | `SOFTWARE DEVELOPMENT CONTEXT/Diseño Arquitectura Segundo Cerebro Corporativo1.docx.md` | MD | Need exact SQL DDL, Python code, Supabase schema, PII pipeline |
| **SRC-53** | Second Brain Model | `SOFTWARE DEVELOPMENT CONTEXT/El Modelo del _Second Brain_ Corporativo...md` | MD | Need exact prototype case study, implementation roadmap |
| **SRC-54** | Mining AI & Digitalization | `SOFTWARE DEVELOPMENT CONTEXT/Gestión minera_ IA, NO-Code y digitalización..md` | MD | Need exact ROI figures, Airtable mapping, KPI framework |
| **SRC-55** | Neuro-Architecture UX | `SOFTWARE DEVELOPMENT CONTEXT/Neuro-Arquitectura Organizacional...md` | MD | Need exact cognitive bias table, nudge taxonomy, CLT guidelines |
| **SRC-56** | 10 AI Prototypes | `SOFTWARE DEVELOPMENT CONTEXT/Prototipado IA para Gestión de Activos Industriales.md` | MD | Need exact use case details, JSON samples, department-specific requirements |
| **SRC-57** | Megaproject Software | `SOFTWARE DEVELOPMENT CONTEXT/Software Megaproyectos_ Ingeniería a Operación.md` | MD | Need exact software comparison tables, CFIHOS standard, implementation horizons |
| **SRC-58** | AI Startup vs Incumbents | `SOFTWARE DEVELOPMENT CONTEXT/Startup AI vs. Incumbents_ Megaproyectos.md` | MD | Need exact startup profiles, GraphRAG details, Rust architecture rationale |

### GECAMIN MAPLA 2024 Conference (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-70** | myRIAM SYSTEM (Guayacán Solutions) | `GECAMIN MAPLA 2024 PPTS/S11 15_10 Sergio Garcia_Sistema de gestión de activos y mantenimiento basado en IA Generativa, myRIAM SYSTEM.pdf` | PDF (14p) | Need exact myRIAM architecture, competitor feature comparison |
| **SRC-71** | AI Detector — Crusher Anomalies | `GECAMIN MAPLA 2024 PPTS/S11 14_50 Rodrigo Vergara_AI Detector...pdf` | PDF (12p) | Need exact AI anomaly detection methodology for crushers |
| **SRC-72** | Chatbot Experto (SQM) | `GECAMIN MAPLA 2024 PPTS/S14 16_50 Jorge Martinez_Chatbot Experto...pdf` | PDF (11p) | Need exact chatbot question taxonomy, Copilot Studio architecture |
| **SRC-73** | Gabinete Smart / Digital Twin (I&T) | `GECAMIN MAPLA 2024 PPTS/S14 17_10 Hugo Barrientos_Gabinete smart...pdf` | PDF (14p) | Need exact digital twin ecosystem, IIoT sensor architecture |
| **SRC-74** | GenAI in Hydraulic Shovels (Centinela) | `GECAMIN MAPLA 2024 PPTS/S5 14_10 Erick Parra_VIDEO_AI Generativa en palas hidráulicas PC5500.pdf` | PDF (18p) | Need exact MTTR reduction methodology via GenAI |
| **SRC-75** | AI ConMon Optimization | `GECAMIN MAPLA 2024 PPTS/S5 14_50 Patricio Ortiz_Optimización del análisis de monitoreo...pdf` | PDF (17p) | Need exact efficiency gains (55% time reduction), AI classification accuracy |
| **SRC-76** | Predictive Maintenance AI (U. Chile) | `GECAMIN MAPLA 2024 PPTS/S3 11_50 Vivana Meruane_Transformando el Mantenimiento Predictivo...pdf` | PDF (27p) | Need exact academic framework for anomaly detection, diagnosis, RUL |
| **SRC-77** | 797F Engine Failure Prediction | `GECAMIN MAPLA 2024 PPTS/S7 17_10 Jean Campos_Modelo de predicción de falla...pdf` | PDF (15p) | Need exact SVM model, 83% accuracy metrics, prediction window |
| **SRC-78** | Asset Health Index (SQM Lithium) | `GECAMIN MAPLA 2024 PPTS/S6 14_50 Cristian Ramirez_Índice de salud de activos...pdf` | PDF (13p) | Need exact health index variables, criticality-backlog-strategy formula |
| **SRC-79** | Codelco Unified Data | `GECAMIN MAPLA 2024 PPTS/S9 09_00 Jorge Hidalgo_Desempeño de activos a través del dato único.pdf` | PDF (15p) | Need exact Codelco scale (15,638 equipment), centralized management model |
| **SRC-80** | SOMA Maintenance Operating System (Codelco) | `GECAMIN MAPLA 2024 PPTS/S13 17_10 Carlo Lobiano_Mejora en la implementación del sistema operativo...pdf` | PDF (20p) | Need exact change management challenges, operations-maintenance collaboration |
| **SRC-81** | Mining 4.0 Shutdown Optimization (Andes Agile) | `GECAMIN MAPLA 2024 PPTS/S16 09_40 Roberto Verdugo_Minería 4.0...pdf` | PDF (17p) | Need exact cloud-based shutdown optimization methodology |
| **SRC-82** | All GECAMIN Presentations (57 PDFs) | `GECAMIN MAPLA 2024 PPTS/` | PDF (57 files) | Browse full conference proceedings for additional competitive intelligence |

### GFSN Methodology Documents (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-90** | GFSN Maintenance Management Manual | `MAINTENANCE STRATEGY.../maintenance-manual--GFSN01-DD-EM-0000-MN-00001-...pdf` | PDF (104p) | Need exact GFSN process map, FMECA methodology, improvement techniques, organizational structure |
| **SRC-91** | GFSN Planning & Scheduling Procedure | `MAINTENANCE STRATEGY.../planning-scheduling-procedure--GFSN01-DD-EM-0000-PT-00006-...pdf` | PDF (34p) | Need exact weekly scheduling cycle, SAP WO status flow, work package requirements, KPI formulas |
| **SRC-92** | GFSN Defect Elimination Procedure | `MAINTENANCE STRATEGY.../defect-elimination-procedure--GFSN01-DD-EM-0000-PT-00005-...pdf` | PDF (39p) | Need exact RCA methodology, 5P's framework, Cause-Effect diagram steps, solution prioritization |
| **SRC-93** | GFSN Asset Criticality Analysis Procedure | `MAINTENANCE STRATEGY.../asset-criticality-analysis-procedure--GFSN01-DD-EM-0000-PT-00001-...pdf` | PDF (16p) | Need exact 6-factor consequence evaluation, 5×5 matrix, criticality level definitions |

### Video Tutorials (Original)

| ID | Document | Path | Format | When to Read |
|----|----------|------|--------|-------------|
| **SRC-60** | R8 Video Tutorials | `MAINTENANCE STRATEGY.../Video-tutorial-uso-R8/` | MP4 (11 files) | Cannot be read by AI. Reference only for human training. |

---

## TOPIC ROUTING TABLE

**Use this table to find the right document for any question:**

| Topic | Quick Answer | Summary Doc | Full Detail |
|-------|-------------|-------------|-------------|
| **Data schemas (any entity)** | `gemini.md` §3 or §9 | - | - |
| **Behavioral rules** | `gemini.md` §4 | - | - |
| **RCM decision tree** | REF-01 §3.4 | REF-01 | SRC-12, SRC-15 |
| **Criticality assessment** | REF-01 §2 | REF-01 | SRC-12 |
| **Failure mode analysis (FMEA)** | REF-01 §3.3 | REF-01 | SRC-09 (MANDATORY), SRC-10, SRC-14 |
| **Valid FM combinations (Mechanism+Cause)** | **SRC-09** (72 combos) | REF-01 §3.3 | **SRC-09 IS THE ONLY SOURCE OF TRUTH** |
| **Task naming conventions** | REF-01 §4.2 | REF-01 | SRC-11 |
| **R8 entity fields** | REF-02 §2 | REF-02 | SRC-10 |
| **R8 library system** | REF-02 §1 | REF-02 | SRC-10, SRC-19 |
| **R8 code tables (enums)** | REF-02 §3 | REF-02 | SRC-10 |
| **SAP PM field mappings** | REF-03 §3 | REF-03 | SRC-31 |
| **SAP upload templates** | REF-03 §2 | REF-03 | SRC-32, SRC-33, SRC-34 |
| **SAP transactions** | REF-03 §6 | REF-03 | SRC-30 |
| **Quality validation rules** | REF-04 §8 | REF-04 | SRC-11, SRC-24 |
| **QA checklists** | REF-04 §10 | REF-04 | SRC-23 |
| **OCP pain points** | REF-05 §2 | REF-05 | SRC-01 |
| **MVP scope & timeline** | REF-05 §3-6 | REF-05 | SRC-01, SRC-02 |
| **Data requirements (15 cats)** | REF-05 §5 | REF-05 | SRC-02 |
| **Tech stack (full vision)** | REF-06 §2 | REF-06 | SRC-50, SRC-52 |
| **UX/behavioral design** | REF-06 §4 | REF-06 | SRC-55 |
| **10 AI use cases** | REF-06 §3 | REF-06 | SRC-56 |
| **Work instruction templates** | REF-07 §2-3 | REF-07 | SRC-40, SRC-41 |
| **Work package naming** | REF-07 §4 | REF-07 | SRC-11 |
| **Material management** | REF-07 §5 | REF-07 | SRC-10 |
| **Architecture & build plan** | BP-01 | BP-01 | - |
| **Project status** | GOV-03 | - | GOV-04 |
| **Competitive landscape** | REF-06 §5 | REF-06 | SRC-57, SRC-58 |
| **GECAMIN competitor analysis** | REF-10 §2-4 | REF-10 | SRC-70 to SRC-82 |
| **myRIAM SYSTEM comparison** | REF-10 §2 | REF-10 | SRC-70 |
| **AI in mining maintenance** | REF-10 §3 | REF-10 | SRC-71 to SRC-77 |
| **Asset Health Index** | REF-10 §3.4 | REF-10 | SRC-78 |
| **Change management (SOMA)** | REF-10 §3.6 | REF-10 | SRC-80 |
| **ISO 55002 compliance** | REF-09 §2-3 | REF-09 | ISO 55002:2018 standard |
| **ISO 55002 gaps** | REF-09 §5 | REF-09 | - |
| **Neuro-Architecture (behavioral UX)** | REF-11 §2-3 | REF-11 | SRC-55 |
| **Cognitive load design** | REF-11 §2 Pillar 4 | REF-11 | SRC-55 |
| **Psychological safety design** | REF-11 §2 Pillar 5 | REF-11 | SRC-55 |
| **Behavioral nudges** | REF-11 §2 Pillar 6 | REF-11 | SRC-55 |
| **Bias mitigation (UX)** | REF-11 §3 | REF-11 | SRC-55 |
| **Strategic recommendations** | REF-12 §2 | REF-12 | All sources |
| **Competitive moat** | REF-12 §2 Rec 10 | REF-12 | REF-10, REF-11 |
| **Phase 0 plan** | REF-12 §2 Rec 9 | REF-12 | REF-05 |
| **Risk assessment** | REF-12 §4 | REF-12 | REF-10 |
| **Asset Health Index** | `gemini.md` §10.1 | REF-12 Rec 4 | `tools/engines/health_score_engine.py` |
| **KPI calculations (MTBF/MTTR/OEE)** | `gemini.md` §10.2 | REF-12 Rec 8 | `tools/engines/kpi_engine.py` |
| **Weibull failure prediction** | `gemini.md` §10.3 | REF-12 Rec 6 | `tools/engines/weibull_engine.py` |
| **Multi-plant variance detection** | `gemini.md` §10.4 | REF-12 Rec 7 | `tools/engines/variance_detector.py` |
| **CAPA / PDCA tracking** | `gemini.md` §10.5 | REF-12 Rec 8 | `tools/engines/capa_engine.py` |
| **Management review (executive)** | `gemini.md` §10.6 | REF-12 Rec 8 | `tools/engines/management_review_engine.py` |
| **Expert cards (behavioral UX)** | `gemini.md` §11.1 | REF-11 Pillar 2 | `tools/models/schemas.py` (ExpertCard) |
| **Ipsative feedback** | `gemini.md` §11.2 | REF-11 Pillar 5 | `tools/models/schemas.py` (IpsativeFeedback) |
| **Completion progress (Zeigarnik)** | `gemini.md` §11.3 | REF-11 Pillar 6 | `tools/models/schemas.py` (CompletionProgress) |
| **Multi-agent architecture** | `gemini.md` §7 | - | `agents/` directory |
| **Agent tool wrappers (62 tools)** | `gemini.md` §7.4 | - | `agents/tool_wrappers/server.py` |
| **4-milestone workflow** | `gemini.md` §7.3 | - | `agents/orchestration/workflow.py` |
| **Milestone gates (approval flow)** | `gemini.md` §7.3 | - | `agents/orchestration/milestones.py` |
| **Agent system prompts** | `gemini.md` §7.5 | - | `agents/definitions/prompts/` |
| **FM 72-combo tool** | `gemini.md` §7.5 rule 4 | SRC-09 | `agents/tool_wrappers/fm_lookup_tools.py` |
| **Session state management** | `gemini.md` §7 | - | `agents/orchestration/session_state.py` |
| **CLI entry point** | `gemini.md` §7.6 | - | `agents/run.py` |
| **GFSN maintenance governance** | REF-13 §1-2 | REF-13 | SRC-90 |
| **GFSN FMECA methodology** | REF-13 §3 | REF-13 | SRC-90 |
| **GFSN criticality (Alto/Moderado/Bajo)** | REF-16 §6 | REF-13, REF-16 | SRC-90, SRC-93 |
| **GFSN improvement techniques (OCR, Pareto, Jack-Knife)** | REF-13 §6 | REF-13 | SRC-90 |
| **Planning & scheduling weekly cycle** | REF-14 §5 | REF-14 | SRC-91 |
| **SAP WO status flow** | REF-14 §4.4 | REF-14 | SRC-91 |
| **Work package contents** | REF-14 §5.5 | REF-14 | SRC-91 |
| **Planning & scheduling KPIs (11)** | REF-14 §8 | REF-14 | SRC-91 |
| **Priority matrix (Equipment × Consequence)** | REF-14 §3 | REF-14 | SRC-91 |
| **RCA / Defect elimination** | REF-15 §2-5 | REF-15 | SRC-92 |
| **5P's evidence framework** | REF-15 §5.4 | REF-15 | SRC-92 |
| **3-level root cause (Physical→Human→Latent)** | REF-15 §5.6 | REF-15 | SRC-92 |
| **5W+2H simple analysis** | REF-15 §5.2 | REF-15 | SRC-92 |
| **RCA solution prioritization** | REF-15 §6.3 | REF-15 | SRC-92 |
| **Defect elimination KPIs (5)** | REF-15 §7.2 | REF-15 | SRC-92 |
| **GFSN 6-factor criticality** | REF-16 §4 | REF-16 | SRC-93 |
| **GFSN 5×5 criticality matrix** | REF-16 §6 | REF-16 | SRC-93 |
| **RCA API endpoints** | `gemini.md` §7 | - | `api/routers/rca.py` |
| **RCA service (create, 5W+2H, advance)** | `gemini.md` §7 | - | `api/services/rca_service.py` |
| **Planning KPI snapshots (history)** | REF-14 §8 | REF-14 | `api/services/rca_service.py` |
| **DE KPI snapshots (program maturity)** | REF-15 §7.2 | REF-15 | `api/services/rca_service.py` |
| **Defect Elimination UI** | REF-15 | - | `streamlit_app/pages/17_defect_elimination.py` |

---

## DOCUMENT STATISTICS

| Tier | Count | Purpose | Typical Token Cost |
|------|-------|---------|-------------------|
| Tier 1: Governance | 5 | Always read | ~2K each |
| Tier 2: Summaries | 17 | Read for most tasks | ~2-3K each |
| Tier 3: Sources | 52+ | Read only for raw detail | ~5-20K each |

**Optimal workflow:** GOV-02 (this index) → GOV-01 (gemini.md) → relevant REF-XX → SRC-XX only if needed.

**Estimated token savings:** Reading summaries instead of sources saves ~80% of tokens per topic.

---

## CHANGELOG

| Date | Change | Author |
|------|--------|--------|
| 2026-02-22 | Session 8b: Added 5 routing entries for RCA/DE full stack (API endpoints, service, KPI snapshots, DE UI). Updated document statistics to 17 summaries. | System |
| 2026-02-21 | Session 8a: Added REF-13 to REF-17 (GFSN methodology + gap analysis), SRC-90 to SRC-93 (4 methodology PDFs), 18 routing entries for maintenance governance, planning/scheduling, defect elimination, criticality analysis. Document count: 17 summaries, 52+ sources. | System |
| 2026-02-20 | Session 7: Added 8 routing entries for multi-agent architecture (agents/ layer): tool wrappers, 4-milestone workflow, milestone gates, system prompts, FM 72-combo tool, session state, CLI entry point. | System |
| 2026-02-20 | Session 6: Added 9 routing entries for GECAMIN engines (HealthScore, KPI, Weibull, Variance, CAPA, ManagementReview) and Neuro-Architecture models (ExpertCard, IpsativeFeedback, CompletionProgress). Updated REF-09 compliance to 80%. | System |
| 2026-02-20 | Added SRC-09: Failure Modes Lookup Table (AUTHORITATIVE) — 72 valid Mechanism+Cause combinations. Marked as MANDATORY for all FMEA work. Added routing entry. | System |
| 2026-02-20 | Added REF-10 (GECAMIN cross-reference), REF-11 (Neuro-Arquitectura review), REF-12 (Strategic recommendations), SRC-70 to SRC-82 (GECAMIN sources). Updated routing table with 17 new topics. Document count: 12 summaries, 48+ sources. | System |
| 2026-02-20 | Initial creation with 48 documents indexed | System Pilot |
