# AMS / MagEAM — Blueprint Completo del Sistema

**Versión:** 1.0 · 2026-05-12
**Owner:** David Cabezas (VSC)
**Cliente principal:** Cliente Minero CL-SN (anonimizado)
**Stack:** React 19 + Vite · FastAPI + SQLAlchemy 2.0 · SQLite · Docker · nginx
**Deploy:** mageam.com (Hetzner VPS) · HEAD `cd83670`
**Estadísticas:**
- 57 routers FastAPI
- 86 services Python
- 67 modelos BD
- 562 endpoints API
- 4 agentes IA + 36 skills
- 1593 tests pytest

---

## 1. Arquitectura de alto nivel

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USUARIOS (4 roles)                          │
│   Operador · Mantenedor · Supervisor · Planner · Programador        │
│   Ing. Confiabilidad · Manager · Admin                              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   ┌──────────────────┐               ┌──────────────────┐
   │  Web App (React) │               │ Field App (PWA)  │
   │  mageam.com      │               │ mageam.com/field │
   └────────┬─────────┘               └─────────┬────────┘
            │                                   │
            │       ┌───────────────────────────┘
            ▼       ▼
   ┌──────────────────────────────────────────────────┐
   │       NGINX (TLS termination + reverse proxy)    │
   │       puerto 443 → routing /api, /, /field       │
   └────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼──────────────────┐
        ▼               ▼                  ▼
  ┌──────────┐  ┌─────────────────┐  ┌──────────────┐
  │ Frontend │  │ Backend FastAPI │  │  Field PWA   │
  │ static   │  │ ocp-backend     │  │  static      │
  │ build    │  │ port 8000       │  │  field/dist  │
  └──────────┘  │ 562 endpoints   │  └──────────────┘
                │ 4 AI agents     │
                │ RAG engine      │
                └────────┬────────┘
                         │
        ┌────────────────┼─────────────────────┐
        ▼                ▼                     ▼
  ┌──────────┐   ┌───────────────┐    ┌──────────────────┐
  │ SQLite   │   │ LanceDB (RAG) │    │ FileSystem       │
  │ data/    │   │ embeddings    │    │ data/capture_    │
  │ 67 tables│   │ ot_history    │    │     photos/      │
  │ + audit  │   │ lessons       │    │ DMS docs         │
  └──────────┘   └───────────────┘    └──────────────────┘
        │
        │ (futuro)
        ▼
  ┌─────────────────────────────────────┐
  │ SAP PM (cliente)                    │
  │ stub queue → real cuando hay creds  │
  └─────────────────────────────────────┘
```

---

## 2. Capas del Backend (FastAPI)

```
┌────────────────────────────────────────────────────────────────────┐
│                      ROUTERS (57 archivos)                         │
│ ─────────────────────────────────────────────────────────────────  │
│ /capture · /work-requests · /managed-work-orders · /scheduling     │
│ /backlog · /planner · /fmea · /criticality · /hierarchy · /rca     │
│ /reliability · /reporting · /dashboard · /analytics · /admin       │
│ /sap-pm · /agentic · /ai-agents · /rag · /audit-log · /media       │
│ /workflow · /improvement-actions · /assignments · /catalogs        │
│ /preparativos (SF-662) · /execution · /post-maintenance · /dms     │
│ /troubleshooting · /financial · /expert-knowledge · ...            │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ Depends(get_db) + auth gates
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                      SERVICES (86 archivos)                        │
│ ─────────────────────────────────────────────────────────────────  │
│ Business logic + workflow state machines + integrations            │
│                                                                    │
│ managed_wo_service · work_request_service · scheduling_service     │
│ rag_service · fmea_service · audit_service · capture_service       │
│ agentic_* (12 agents stub) · rca_service · backlog_service         │
│ planner_service · spare_parts_service · execution_service          │
│ post_maintenance_service · sap_export_service · ...                │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│              ENGINES (tools/engines/ — determinista)               │
│ ─────────────────────────────────────────────────────────────────  │
│ priority_engine (R8 + GFSN) · criticality_engine                   │
│ rcm_decision_tree · fmeca_engine · weibull_engine · pareto         │
│ jackknife_engine · planner_engine · backlog_optimizer              │
│ shutdown_engine · resource_leveling · gantt_generator              │
│ kpi_engine · de_kpi_engine · quality_score_engine                  │
│ scheduling_engine · capa_engine · variance_detector                │
│ trace_engine · feedback_engine · deliverable_writer · ...          │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                  DATABASE (api/database/models.py)                 │
│                       67 SQLAlchemy models                         │
│                                                                    │
│  Core:  work_requests · managed_work_orders · field_captures       │
│         hierarchy_nodes · workforce · inventory_items              │
│         support_equipment · plants · audit_log                     │
│                                                                    │
│  RCM:   functions · functional_failures · failure_modes            │
│         maintenance_tasks · work_packages · criticality_assess     │
│         fmeca_worksheets · rca_analyses · capa_items               │
│                                                                    │
│  Ops:   backlog_items · weekly_programs · shutdown_calendar        │
│         preparativos_ot (SF-662) · execution_checklists            │
│         post_maintenance_reviews · expert_cards                    │
│                                                                    │
│  KPI:   health_scores · kpi_metrics · failure_predictions          │
│         variance_alerts · de_kpi_snapshots                         │
│                                                                    │
│  Admin: users · sessions · feedback · improvement_actions          │
│         dms_documents · field_captures · sap_upload_packages       │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend (React + Vite)

```
┌──────────────────────────────────────────────────────────────────┐
│                        PAGES (38 archivos)                       │
│ ───────────────────────────────────────────────────────────────  │
│                                                                  │
│  Dashboard            ExecutiveDashboard       AnalyticsPage     │
│  FailureCapture       FailuresEvents            FMECA / FMEA     │
│  WorkOrdersPage       WorkRequests              WorkManagement   │
│  Planning             Scheduling (v2 Horarios)  SupervisorBoard  │
│  Execution            ExecutionChecklists        PostMaintenance │
│  Criticality          Reliability                RCA / RagLab    │
│  Backlog              Team                       SapPmPage       │
│  Settings             SettingsPage               Profile         │
│  AgenticCapabilities  AIAgents                   AuditLogPage    │
│  DataImport           DocumentManagement         DefectElim.     │
│  ImprovementActions   ContractorsPage            ProjectSelector │
│  PerformanceAnalysis  ExpertKnowledge            FieldCapture    │
│  ProgrammerAgent      SupervisorAgent            PlanificadorAg. │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│              COMPONENTES COMPARTIDOS                              │
│  Header · Sidebar · WelcomeCard · Toast · ConfirmDialog          │
│  SmartCaptureModal · ExecutiveView · TacticalOperationsView      │
│  PageGuard (RBAC) · WsStatusIndicator · PriorityBadge            │
│  KPICard · CancelWOModal · SmartAssignModal                       │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    HOOKS + CONTEXTS                              │
│  useAuth · useWebSocket · usePermissions · useLanguage · Toast   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       api.js (cliente HTTP)                      │
│   fetch wrapper · JWT injection · WS client · refresh token      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Sistema de 4 Agentes IA (multi-agent)

```
                  ┌─────────────────────────────────┐
                  │     AG-001 Orchestrator         │  Sonnet 4.5
                  │  (coordina los 4 milestones)    │  20 turns max
                  └────────────┬────────────────────┘
                               │ delega
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
│ AG-002         │  │ AG-003         │  │ AG-004             │
│ Reliability    │  │ Planning       │  │ Spare Parts        │
│ Engineer       │  │ Specialist     │  │ Specialist         │
│ Opus 4.6       │  │ Sonnet 4.5     │  │ Haiku 4.5          │
│ 40 turns       │  │ 30 turns       │  │ 15 turns           │
│                │  │                │  │                    │
│ Skills:        │  │ Skills:        │  │ Skills:            │
│ · build-hier.  │  │ · assemble-wp  │  │ · suggest-mat.     │
│ · classify-crit│  │ · group-backlog│  │ · optimize-inv.    │
│ · fmeca-build  │  │ · calc-priority│  │                    │
│ · rcm-decide   │  │ · schedule-week│  │                    │
│ · pareto-jack  │  │ · export-sap   │  │                    │
│ · weibull      │  │ · life-cycle   │  │                    │
└────────────────┘  └────────────────┘  └────────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               ▼
              ┌─────────────────────────────────┐
              │     36 Skills compartidas       │
              │  (skills/ subfolder)            │
              │  + 4 Knowledge Base (refs)      │
              └─────────────────────────────────┘
```

### Milestones por Agente

| Milestone | Nombre | Agentes | Output |
|-----------|--------|---------|--------|
| M1 | Hierarchy + Criticality | AG-002 | Equipment hierarchy tree, criticality matrix |
| M2 | FMECA + RCM Decisions | AG-002 | FMECA table, RCM decision sheets |
| M3 | Tasks + Work Packages + Materials | AG-003 + AG-004 | Task list, work packages, work instructions |
| M4 | SAP Export Package | AG-003 + AG-001 | SAP upload package, validation report |

---

## 5. Flujo de vida de una OT (end-to-end)

```
PATIO (técnico móvil)
┌──────────────────────────────┐
│ Field App (PWA)              │
│ → Foto + Audio + GPS          │
│ → POST /capture/              │
└──────────┬───────────────────┘
           │
           ▼ FieldCapture (capture_id)
┌──────────────────────────────┐
│ Backend: capture_service     │
│ → comprime foto              │
│ → guarda en data/capture_*   │
│ → AI suggest (Claude Vision) │
│ → crea WorkRequest (DRAFT)   │
└──────────┬───────────────────┘
           │
           ▼ AV-NNNNN code
┌──────────────────────────────┐
│ SUPERVISOR aprueba           │
│ PUT /work-requests/{id}/     │
│     validate {APPROVE}       │
│ → WR.status = APROBADO       │
│ → backlog_service.add()      │
└──────────┬───────────────────┘
           │
           ▼ BacklogItem
┌──────────────────────────────┐
│ PLANNER convierte            │
│ POST /managed-work-orders/   │
│     from-wr                  │
│ → OT-2026-NNNNN              │
│ → status=CREADO              │
└──────────┬───────────────────┘
           │
           ▼ ManagedWorkOrder (wo_id)
┌──────────────────────────────┐
│ Walk-through estados:        │
│ CREADO → LIBERADO →          │
│ PLANIFICADO →                │
│ EN_PROGRAMACION →            │
│ PROGRAMADO →                 │
│ EN_EJECUCION → CERRADO       │
│                              │
│ Cada transición:             │
│ - audit_log entry            │
│ - WS broadcast wo_updated    │
│ - version bump (optimistic)  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ TÉCNICO ejecuta              │
│ - PUT /start                 │
│ - PUT /progress (HH parcial) │
│ - actualiza operations.[i]   │
│   .completion_pct + actual_h │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ SUPERVISOR cierra            │
│ PUT /close                   │
│ {signature, pin, gate_acks}  │
│                              │
│ Pre-close gates:             │
│ ✓ ALL_OPS_DONE 100%          │
│ ✓ OPS_HH_NOTIFIED            │
│ ✓ HH_VARIANCE ≤25%           │
│ ✓ MATERIALS_OK               │
│ ✓ SUPERVISOR_QA (manual)     │
│ ✓ NO_OPEN_NOTIFS             │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST-CIERRE                  │
│ - RCA opcional               │
│ - improvement_actions        │
│ - lesson_learned → RAG       │
│ - audit_log final            │
│ - SF-661 v0.2 análisis IA    │
└──────────────────────────────┘
```

---

## 6. RAG (Retrieval Augmented Generation)

```
┌──────────────────────────────────────────────────────────────────┐
│                    LanceDB (data/lancedb/)                       │
│                                                                  │
│   Tables:                                                        │
│   - ot_history       (56 OTs cerradas indexed)                   │
│   - lessons_learned  (post-cierre learnings)                     │
│   - manuals          (DMS manuals + procedures)                  │
│                                                                  │
│   Each row: {vector(384), text, source_id, source_type, meta}    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Embed model:
                         │ paraphrase-multilingual-MiniLM-L12-v2
                         │ (sentence-transformers)
                         │ 1.5GB RAM al primer uso
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    rag_service                                   │
│                                                                  │
│   add_chunks(table, items)   — ingesta con chunking 500 tokens   │
│   search(table, query, k=5)  — similarity search                 │
│   embed(texts)                — vectoriza (cached)               │
│   stats()                     — health check (loaded: bool)      │
└────────────────────────┬─────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
   ┌──────────────┐         ┌──────────────────────┐
   │ /rag/search  │         │ RCM-Strategy         │
   │ (frontend)   │         │ Shift-Handover       │
   │              │         │ Post-Maint-Learn     │
   └──────────────┘         │ KB-Curator           │
                            │ (use cases #33-#40)  │
                            └──────────────────────┘
```

---

## 7. Permission Matrix (RBAC)

```
                ┌───────────────────────────────────┐
                │      6 ROLES                       │
                ├───────────────────────────────────┤
                │  admin        — all permissions    │
                │  manager      — executive view     │
                │  planner      — planning scope     │
                │  engineer     — reliability scope  │
                │  supervisor   — execution + own    │
                │  tecnico      — execution + own    │
                └───────────────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────────┐
                │   24 MODULES × 2 ACTIONS         │
                │   (view, edit)                    │
                │                                   │
                │   PERMISSIONS dict in             │
                │   usePermissions.js (frontend)    │
                │   + require_role() decorators     │
                │   (backend)                       │
                └───────────────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────────┐
                │   IDOR-scoping en endpoints:      │
                │   if user.plant_id and            │
                │      user.role NOT IN (admin,     │
                │                        manager):  │
                │      filter por plant_id          │
                └───────────────────────────────────┘
```

---

## 8. Auditoría + Inmutabilidad (SF-660)

```
   Todas las acciones críticas
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  audit_service.log_action(                    │
   │    db, entity_type, entity_id,                │
   │    action, payload, user)                     │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  audit_log table (append-only)                │
   │  Fields: audit_id, timestamp, entity_type,    │
   │          entity_id, action, payload (JSON),   │
   │          user, ip, user_agent, plant_id       │
   │                                               │
   │  Cubre 14 entidades:                          │
   │  - work_request, managed_work_order           │
   │  - operations, materials, support_equipment   │
   │  - user (login/logout/role_change/mfa)        │
   │  - backlog, weekly_program                    │
   │  - criticality, fmeca, rca, capa              │
   │  - dms_documents, settings                    │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Endpoint scoped por rol                      │
   │  GET /admin/audit-log                         │
   │  - admin/manager: todo                        │
   │  - supervisor: su planta + propias            │
   │  - planner/engineer/tecnico: propias          │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Retención 2y activa + 5y archivo + purga    │
   │  scripts/purge_audit_log_5y.py --dry-run     │
   │  Tests inmutabilidad: prohibido DELETE en    │
   │  código fuera de allowlist                   │
   └──────────────────────────────────────────────┘
```

---

## 9. Despliegue (VPS Hetzner — mageam.com)

```
┌─────────────────────────────────────────────────────────────────┐
│                  VPS Hetzner — mageam.com                        │
│  IP: 187.77.223.137                                              │
│  Stack: Docker Compose                                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              ▼                ▼                    ▼
   ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
   │ ocp-nginx        │  │ ocp-backend  │  │ ocp-frontend    │
   │ nginx:1.29-alpine│  │ FastAPI+Py3  │  │ Vite build      │
   │ ports: 80/443    │  │ port 8000    │  │ port 5173       │
   │ TLS termination  │  │ 562 routes   │  │ static          │
   └──────────────────┘  └──────┬───────┘  └─────────────────┘
                                │
                  ┌─────────────┼─────────────────┐
                  ▼             ▼                 ▼
            ┌──────────┐  ┌─────────────┐  ┌──────────────┐
            │ Volume   │  │ Volume      │  │ Volume       │
            │ db_data  │  │ lancedb/    │  │ hf_cache     │
            │ (SQLite +│  │ (RAG vecs)  │  │ (embeddings  │
            │  audit)  │  │             │  │  model)      │
            └──────────┘  └─────────────┘  └──────────────┘
```

---

## 10. Flujo CI/CD

```
   Local dev                              GitHub                          VPS
   ─────────                              ──────                          ───
       │                                    │                              │
       │ git push origin main               │                              │
       ├───────────────────────────────────►│                              │
       │                                    │                              │
       │                                    │ GitHub Actions               │
       │                                    │ workflows/ci.yml             │
       │                                    │ - pytest smoke critical      │
       │                                    │ - pytest full API            │
       │                                    │ - npm run build              │
       │                                    │ - docker build               │
       │                                    │                              │
       │ git push vps main                  │                              │
       │ (ssh remote bare repo)             │                              │
       ├───────────────────────────────────────────────────────────────────►│
       │                                                                   │
       │                                                  ssh root@        │
       │                                          docker compose build     │
       │                                          ocp-backend ocp-frontend │
       │                                          docker compose up -d     │
       │                                          docker compose restart   │
       │                                          ocp-nginx                │
       │                                                                   │
       │                                          (15-20 segundos)         │
       │                                                                   │
       │                                          Service health checks    │
       │                                          /api/v1/health           │
```

---

## 11. Decisiones de diseño claves

| Decisión | Por qué |
|----------|---------|
| **JSON embebido en `operations/materials/workers`** | Snapshot inmutable + flexibilidad schema cliente |
| **Sin FK formal en `work_request_id`** | OTs fast-track P1 sin WR previo + robustez a borrados |
| **Audit log universal** (entity_type + id) | 1 tabla vs N tablas, query simple cross-entity |
| **4 agentes específicos vs 1 mega-agente** | Especialización + token budget separado por rol |
| **LanceDB embedded vs vector DB externo** | 0 ops overhead, RAG funciona sin servicios extra |
| **SQLite vs Postgres** | Single-tenant inicial, deploy simple; migrar fácil |
| **Optimistic locking (version + If-Match)** | UX sin lock contention vs pessimistic |
| **Stub queue para SAP** | Cliente sin credenciales aún; pipeline listo |
| **Lazy load embed model** | Idle 0 RAM; 1.5GB solo al primer query |
| **Scoped roles via JWT plant_id** | IDOR-mitigation desde JWT, no query param |

---

## 12. Hitos completados (commit reciente)

| Sprint | Tickets cerrados | Highlights |
|--------|------------------|------------|
| SP7 VSC (en curso) | 20 cerrables, 2 parciales | SF-656 audit · SF-660 policy · SF-661 v0.2 IA · SF-662 preparativos · 0A2 Gap 95% · Tutorial v2 · 12 fixes pytest |
| SP6 VSC | Audit BD · multi-plant · IDOR fixes | seed criticality · 8 workforce · DMS auth |
| SP5 VSC | Field PWA · capture flow · planner agent | offline-first · audio transcription · IA suggest |

---

## 13. Lo que viene (SP8 — backlog)

- **SF-661 funciones 2/4/7** — req histórico real (0B2)
- **SF-662 UI completa** — req spec final Jorge
- **0E centros de costo** + clases de gasto
- **0G1 casos de uso Carlos** — input para E2E Playwright
- **Refactor módulo Ejecución** (deadline VIE 15-may)
- **vitest + Playwright CI nightly**
- **S3/blob storage para fotos** (hoy local FS)
- **SAP integration real** cuando lleguen credenciales
- **Análisis Desempeño** granularidad por work_center

---

## 14. Referencias

- [docs/MODEL_RELATIONSHIPS.pdf](MODEL_RELATIONSHIPS.pdf) — grafo de relaciones OT
- [docs/AUDIT_LOG_POLICY.pdf](AUDIT_LOG_POLICY.pdf) — política trazabilidad
- [docs/OT_CALENDAR_SYNC.pdf](OT_CALENDAR_SYNC.pdf) — sync OT-calendario
- [docs/TANDAS_SP7_SP8_2026-05-11.pdf](TANDAS_SP7_SP8_2026-05-11.pdf) — roadmap
- [1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx](../1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx) — cruce 174 items vs código
- [1-output/M3/testing-strategy-magam-2026-05-12.pdf](../1-output/M3/testing-strategy-magam-2026-05-12.pdf) — pirámide testing
- [docs/AMSA_BBP_PM_04_Rev_0.docx](AMSA_BBP_PM_04_Rev_0.docx) — Blueprint SAP PM Anglo
- [skills/00-knowledge-base/architecture/BLUEPRINT.md](../skills/00-knowledge-base/architecture/BLUEPRINT.md) — blueprint agentes

---

**Generado con commit:** `cd83670`
