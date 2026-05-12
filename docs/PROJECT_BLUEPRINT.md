# AMS / MagEAM — Blueprint Completo del Sistema

**Versión:** 1.0 · 2026-05-12
**Owner:** David Cabezas (VSC)
**Cliente principal:** Cliente Minero CL-SN (anonimizado)
**Stack:** React 19 + Vite · FastAPI + SQLAlchemy 2.0 · SQLite · Docker · nginx
**Deploy:** mageam.com (Hetzner VPS) · HEAD `cd83670`

## Estadísticas
- 57 routers FastAPI
- 86 services Python
- 67 modelos BD
- 562 endpoints API
- 4 agentes IA + 36 skills
- 1593 tests pytest

---

## 1. Arquitectura de alto nivel

### 1.1 Componentes principales

| Capa | Componente | Detalle |
|------|-----------|---------|
| **Usuarios** | Web App / Field PWA | 7 roles (Operador, Mantenedor, Supervisor, Planner, Programador, Ing. Confiabilidad, Manager, Admin) |
| **Edge** | nginx 1.29-alpine | TLS termination + reverse proxy port 443 |
| **Frontend** | React 19 + Vite | Build estático servido por nginx |
| **Field PWA** | React/Vite mobile | Offline-first para captura en patio |
| **Backend** | FastAPI 0.110 (Py3.13) | 562 endpoints en 57 routers |
| **Storage** | SQLite (datafile) + LanceDB | 67 tablas + RAG vectors |
| **AI agents** | 4 agentes Anthropic | Orchestrator + Reliability + Planning + SpareParts |
| **External** | SAP PM (cliente, futuro) | Stub queue con worker |

### 1.2 Flujo de request típico

1. Cliente HTTPS → nginx (443)
2. nginx route → `/api/v1/*` al backend FastAPI, `/` al frontend estático, `/field` al PWA
3. Backend: `Depends(get_db)` + `Depends(get_current_user)` (JWT validation)
4. Service layer ejecuta business logic + audit log
5. ORM ↔ SQLite (o LanceDB para búsquedas RAG)
6. Respuesta + WebSocket broadcast cross-tab

---

## 2. Backend (FastAPI)

### 2.1 Routers (57 archivos)

Routers principales agrupados por dominio:

| Dominio | Routers |
|---------|---------|
| **Capture & WR** | `/capture`, `/work-requests`, `/media` |
| **OT** | `/managed-work-orders`, `/work-orders` |
| **Scheduling** | `/scheduling`, `/preparativos`, `/assignments` |
| **Planning** | `/planner`, `/backlog`, `/workflow` |
| **Reliability** | `/fmea`, `/criticality`, `/hierarchy`, `/rca`, `/reliability` |
| **Reporting** | `/reporting`, `/dashboard`, `/analytics`, `/analytics_dashboards` |
| **System** | `/admin`, `/auth`, `/mfa`, `/security` |
| **AI** | `/ai-agents`, `/agentic`, `/rag`, `/troubleshooting`, `/programmer_agent`, `/supervisor_agent`, `/planificador_agent` |
| **Integration** | `/sap-pm`, `/sap`, `/catalogs`, `/data-import`, `/dms`, `/sync` |
| **Misc** | `/improvement-actions`, `/execution`, `/post-maintenance`, `/feedback`, `/notifications`, `/contractors`, `/expert_knowledge`, `/capture_geo`, `/financial`, `/imports`, `/or_projects`, `/sales`, `/transcribe`, `/work_packages`, `/tasks`, `/reports_export`, `/execution_checklists`, `/sprint6_scaffolds` |

### 2.2 Services (86 archivos)

| Categoría | Servicios principales |
|-----------|------------------------|
| **Core** | `managed_wo_service`, `work_request_service`, `capture_service`, `audit_service` |
| **Scheduling** | `scheduling_service`, `planner_service`, `backlog_service` |
| **Reliability** | `fmea_service`, `rca_service`, `reliability_service`, `criticality_service` |
| **RAG / AI** | `rag_service`, `troubleshooting_service`, `agentic_*` (12 archivos) |
| **Execution** | `execution_service`, `post_maintenance_service` |
| **Integration** | `sap_export_service`, `dms_service`, `data_import_service` |
| **Auth** | `auth_service`, `permissions_service` |

### 2.3 Engines deterministas (tools/engines/)

Lógica computacional pesada sin LLM:

- `priority_engine` (R8 + GFSN scoring)
- `criticality_engine` (matrix risk class)
- `rcm_decision_tree`, `fmeca_engine`
- `weibull_engine`, `pareto_engine`, `jackknife_engine`
- `planner_engine`, `backlog_optimizer`
- `shutdown_engine`, `resource_leveling`
- `gantt_generator`, `scheduling_engine`
- `kpi_engine`, `de_kpi_engine`, `planning_kpi_engine`
- `quality_score_engine`, `capa_engine`
- `variance_detector`, `trace_engine`, `feedback_engine`
- `deliverable_writer`, `rbi_engine`, `moc_engine`
- `health_score`, `lcc_engine`, `material_mapper`
- `equipment_resolver`, `equipment_library`

---

## 3. Frontend (React 19 + Vite)

### 3.1 Páginas principales (38 archivos)

| Categoría | Páginas |
|-----------|---------|
| **Dashboards** | Dashboard, ExecutiveDashboard, AnalyticsPage, PerformanceAnalysis |
| **Captura** | FailureCapture, FailuresEvents, FieldCapture (PWA), EquipmentChat |
| **OT** | WorkOrdersPage, WorkManagement, Planning, Execution, ExecutionChecklists, PostMaintenance |
| **Scheduling** | Scheduling (v2 Horarios), SupervisorBoard, Backlog |
| **Reliability** | FMEA, FMECA, Criticality, Reliability, RCA, RagLab, DefectElimination |
| **System** | Settings, SettingsPage, Profile, Team, AuditLogPage, Admin, DataImport, DocumentManagement |
| **AI** | AIAgents, AgenticCapabilities, ProgrammerAgent, SupervisorAgent, PlanificadorAgent |
| **Misc** | ImprovementActions, ContractorsPage, ProjectSelector, ExpertKnowledge, SapPmPage |
| **Mobile** | mobile/MobileCreateWR |

### 3.2 Componentes compartidos

`Header`, `Sidebar`, `WelcomeCard` (tutorial v2 7 steps), `Toast`, `ConfirmDialog`, `SmartCaptureModal`, `SmartAssignModal`, `CancelWOModal`, `ExecutiveView`, `TacticalOperationsView`, `PageGuard` (RBAC), `WsStatusIndicator`, `PriorityBadge`, `KPICard`, `HelpPopover`, `FeedbackWidget`, `LoadingSpinner`.

### 3.3 Hooks + Contexts

- `useAuth` (AuthContext) — JWT + refresh
- `useWebSocket` — auto-reconnect, broadcast subscribe
- `usePermissions` — RBAC scoping (6 roles × 24 modules)
- `useLanguage` (LanguageContext) — i18n EN/ES/FR/AR
- `useToast`, `useConfirm`

### 3.4 API client (`api.js`)

Wrapper sobre `fetch` con:
- Inyección automática `Authorization: Bearer <jwt>` desde localStorage
- Refresh token transparente al recibir 401
- WS client_id en headers (cross-tab session tracking)
- Errors → throw con `r.statusText` + body

---

## 4. Sistema de 4 Agentes IA

### 4.1 Configuración

| ID | Agente | Modelo | Max turns | Milestones |
|----|--------|--------|-----------|------------|
| AG-001 | Orchestrator | Sonnet 4.5 | 20 | All |
| AG-002 | Reliability Engineer | Opus 4.6 | 40 | M1, M2, M3 |
| AG-003 | Planning Specialist | Sonnet 4.5 | 30 | M3, M4 |
| AG-004 | Spare Parts Specialist | Haiku 4.5 | 15 | M3 |

### 4.2 Skills por agente

| Agente | Skills principales |
|--------|---------------------|
| **AG-002 Reliability** | build-hierarchy, classify-criticality, fmeca-build, rcm-decide, pareto-jackknife, weibull, moc-manage, rbi-assessment |
| **AG-003 Planning** | assemble-work-packages, group-backlog, calculate-priority, schedule-weekly-program, orchestrate-shutdown, export-to-sap, analyze-work-order (SF-661 v0.2 nuevo), manage-capa, calculate-planning-kpis, calculate-life-cycle-cost, optimize-cost-risk, generate-execution-checklists |
| **AG-004 Spare Parts** | suggest-materials, optimize-spare-parts-inventory |
| **AG-001 Orchestrator** | gestiona los milestones M1-M4 y coordina los specialists |

### 4.3 Los 4 Milestones

| Milestone | Nombre | Agentes | Deliverables clave |
|-----------|--------|---------|---------------------|
| M1 | Hierarchy + Criticality | AG-002 | Equipment hierarchy tree, criticality matrix |
| M2 | FMECA + RCM Decisions | AG-002 | FMECA table, RCM decision sheets |
| M3 | Tasks + Work Packages + Materials | AG-003 + AG-004 | Task list, work packages, work instructions, material assignments |
| M4 | SAP Export Package | AG-003 + AG-001 | SAP upload package (DRAFT), validation report, strategy summary |

Cada milestone tiene **human approval gate** explícito.

---

## 5. Flujo de vida end-to-end de una OT

| Paso | Actor | Acción | Endpoint / Vista | Resultado |
|------|-------|--------|-------------------|-----------|
| 1 | Técnico (móvil) | Foto + audio + GPS en patio | Field App PWA | FieldCapture (capture_id) |
| 2 | Sistema | POST /capture/ | capture_service | WorkRequest (DRAFT, AV-NNNNN) |
| 3 | Supervisor | Aprueba / rechaza WR | PUT /work-requests/{id}/validate | WR.status = APROBADO + auto-add backlog |
| 4 | Planner | Crea OT desde WR | POST /managed-work-orders/from-wr | ManagedWorkOrder (CREADO, OT-2026-NNNNN) |
| 5 | Planner | Define operaciones + materiales | PUT /managed-work-orders/{id} | operations[], materials[] poblados |
| 6 | Planner | Avanza CREADO → PLANIFICADO | PUT /release + /plan | status=PLANIFICADO |
| 7 | Planner | Marca para programar | PUT /managed-work-orders/{id} {status:EN_PROGRAMACION} | status=EN_PROGRAMACION |
| 8 | Programador | Drag-drop al calendario | PUT /scheduling /managed-work-orders/{id}/schedule | status=PROGRAMADO + planned_start/end + assigned_workers |
| 9 | Programador | Reservar semana | POST /scheduling/reserve-week | Bloqueado si overcap |
| 10 | Técnico | Inicia OT | PUT /start | status=EN_EJECUCION + actual_start |
| 11 | Técnico | Notif HH parcial | PUT /progress | operations[i].actual_hours acumula |
| 12 | Técnico | Completa ops | PUT con operations actualizadas | completion_pct=100 |
| 13 | Supervisor | Cierra con firma | PUT /close + signature + pin + gate_acks | status=CERRADO + closed_by_pin_hash |
| 14 | Sistema | Audit log final | audit_service.log_action(CLOSE) | audit_log entry |
| 15 | Engineer (opcional) | RCA + lessons learned | POST /rca/draft-from-wo | RCA + RAG ingest |
| 16 | Engineer | Improvement actions | POST /improvement-actions | CAPA generadas |

### 5.1 Pre-close gates (SF-570)

| Gate | Tipo | Bloquea cierre? |
|------|------|------------------|
| ALL_OPS_DONE | auto | sí |
| OPS_HH_NOTIFIED | auto | sí |
| HH_VARIANCE_OK (≤ 25%) | auto | sí (override permitido con razón) |
| MATERIALS_OK | auto | no |
| SUPERVISOR_QA | manual | sí (supervisor debe ackear) |
| NO_OPEN_NOTIFS | auto | no |

---

## 6. RAG (Retrieval Augmented Generation)

| Componente | Detalle |
|------------|---------|
| **Backend** | LanceDB embedded en `data/lancedb/` |
| **Embed model** | `paraphrase-multilingual-MiniLM-L12-v2` (sentence-transformers, 384 dims) |
| **RAM idle** | 0 MB (lazy load) |
| **RAM al primer query** | ~1.5 GB (modelo cargado en memoria) |
| **Tablas** | `ot_history` (56 OTs cerradas), `lessons_learned`, `manuals` |
| **Chunking** | word-based, 500 tokens max, 50 tokens overlap |
| **API** | `add_chunks`, `search(table, query, k=5)`, `embed`, `stats` |
| **Service** | `api/services/rag_service.py` |
| **Casos de uso** | RCM-Strategy (#33), Shift-Handover (#34), Post-Maint-Learn (#35), KB-Curator (#40) |

---

## 7. Permission Matrix (RBAC)

### 7.1 Roles (6)

| Rol | View Tier | Edit Scope |
|-----|-----------|------------|
| admin | admin | all |
| manager | executive | executive |
| planner | tactical | planning |
| engineer | tactical | reliability |
| supervisor | tactical | execution |
| tecnico | tactical | execution |

### 7.2 Implementación

- **Frontend**: `usePermissions.js` con 24 módulos × 2 acciones (view, edit)
- **Backend**: `require_role(*roles)` decorator en routers
- **IDOR-scoping**: si `user.role NOT IN (admin, manager)` → filter por `user.plant_id` en query

### 7.3 Módulos públicos vs admin-only

| Módulo | Roles que ven |
|--------|---------------|
| dashboard | todos |
| work-requests | todos (view), admin/planner (edit) |
| scheduling | admin/planner/engineer/tecnico/supervisor |
| audit-log | admin/manager (full), supervisor (su planta), planner (propio) |
| agentic-capabilities | **solo admin** |
| ai-agents | admin/manager/engineer |
| data-import | admin/manager |
| settings | todos |

---

## 8. Auditoría + Inmutabilidad (SF-660)

### 8.1 Cobertura

14 entidades cubiertas:

work_request, managed_work_order, operations, materials, support_equipment, user, settings, backlog, weekly_program, criticality_assessment, fmeca_worksheet, rca, dms_documents, plus agent actions.

### 8.2 Política

| Item | Valor |
|------|-------|
| Retención activa | 2 años |
| Retención archivo | 5 años (export CSV semanal) |
| Eliminación | >5 años con notificación previa |
| Inmutabilidad | append-only · tests pytest validan no hay DELETE en código |
| Script purga | `scripts/purge_audit_log_5y.py --dry-run` por default |

### 8.3 Acceso por rol

| Rol | Acceso |
|-----|--------|
| admin / manager | todo |
| supervisor | su planta (vía payload.plant_id) + propias acciones |
| planner / engineer / tecnico | solo propias acciones |
| otros | 403 |

---

## 9. Despliegue (VPS Hetzner — mageam.com)

### 9.1 Infraestructura

| Item | Detalle |
|------|---------|
| Hosting | Hetzner VPS |
| IP | 187.77.223.137 |
| Dominio | mageam.com |
| Stack | Docker Compose |
| TLS | Let's Encrypt cert (renovación auto) |

### 9.2 Containers

| Container | Imagen | Puerto | Función |
|-----------|--------|--------|---------|
| ocp-nginx | nginx:1.29-alpine | 80, 443 | TLS termination + reverse proxy |
| ocp-backend | python:3.13 (FastAPI) | 8000 | API 562 endpoints |
| ocp-frontend | nginx (Vite build) | 5173 | Static React build |

### 9.3 Volumes

| Volumen | Mount | Contenido |
|---------|-------|-----------|
| ocp_db_data | /app/data | SQLite + audit + capture photos |
| ocp_sap_data | /app/sap_mock/data | SAP mock CSV |
| ocp_or_deliverables | /app/or_deliverables | OR-System deliverables (legacy) |
| ocp_hf_cache | /home/appuser/.cache/huggingface | Embedding model cache (~1.5 GB) |
| ocp_dms_docs | /usr/share/nginx/dms | DMS documentos servidos por nginx |

---

## 10. CI/CD pipeline

### 10.1 Github Actions (`.github/workflows/ci.yml`)

| Job | Steps | Bloquea merge? |
|-----|-------|-----------------|
| backend | pytest smoke critical | sí |
| backend | pytest full API suite | no (warnings ok) |
| frontend | npm install + build + lint | sí (build) |
| docker | Build backend image | sí |

### 10.2 Deploy flow

```bash
# Local
git push origin main
git push vps main

# VPS (auto o manual)
ssh root@mageam.com
cd /root/ASSET-MANAGEMENT-SOFTWARE
docker compose build ocp-backend ocp-frontend
docker compose up -d ocp-backend ocp-frontend
docker compose restart ocp-nginx
```

Tiempo total deploy: 15-20 segundos.

---

## 11. Decisiones de diseño claves

| Decisión | Por qué |
|----------|---------|
| **JSON embebido en `operations/materials/workers`** | Snapshot inmutable + flexibilidad schema cliente |
| **Sin FK formal en `work_request_id`** | OTs fast-track P1 sin WR previo + robustez a borrados |
| **Audit log universal** (entity_type + id) | 1 tabla vs N tablas, query simple cross-entity |
| **4 agentes específicos vs 1 mega-agente** | Especialización + token budget separado por rol |
| **LanceDB embedded vs vector DB externo** | 0 ops overhead, RAG funciona sin servicios extra |
| **SQLite vs Postgres** | Single-tenant inicial, deploy simple; migrar fácil cuando escale |
| **Optimistic locking (version + If-Match)** | UX sin lock contention vs pessimistic |
| **Stub queue para SAP** | Cliente sin credenciales aún; pipeline listo |
| **Lazy load embed model** | Idle 0 RAM; 1.5GB solo al primer query |
| **Scoped roles via JWT plant_id** | IDOR-mitigation desde JWT, no query param |

---

## 12. Hitos completados (commits recientes)

### Sprint 7 VSC (en curso)

| Ticket / Tema | Highlights |
|---------------|------------|
| SF-654 | Eventos sistema en tab Comentarios |
| SF-655 | Foto + audio en OT comments (Web Speech API + MediaRecorder) |
| SF-656 | Auditoría visual capacidad + violaciones turno DAY/NIGHT |
| SF-657 | Endpoint `/orphans` (6 tipos huérfanas) |
| SF-659 | Política OT-Calendar sync documentada |
| SF-660 | Audit log policy + tests inmutabilidad + script purga 5y |
| SF-661 v0.2 | IA Analyze OT — 4/7 funciones deterministas |
| SF-662 | Preparativos OT Rappi (modelo + 4 endpoints + 13 tests) |
| 0A2 | Gap Analysis Magdalena (174 items, 95.1% cobertura) |
| 0D1 | Anonimización completa Goldfields (plant alias local) |
| 0G2 | Supervisor role + Agentic admin-only |
| Tests | 12 → 0 fails en `test_api/` (212/214 passing) |
| Tutorial | Welcome card v2 7 steps |
| Scheduling v2 | Vista Horarios eje vertical + matching auto por skill |

---

## 13. Roadmap SP8

- SF-661 funciones 2/4/7 — req histórico real (0B2)
- SF-662 UI completa — req spec final Jorge
- 0E centros de costo + clases de gasto
- 0G1 casos de uso Carlos — input para E2E Playwright
- Refactor módulo Ejecución (deadline VIE 15-may)
- vitest + Playwright CI nightly
- S3/blob storage para fotos
- SAP integration real cuando lleguen credenciales

---

## 14. Referencias cruzadas

| Doc | Path |
|-----|------|
| Modelo relacional OT | [docs/MODEL_RELATIONSHIPS.pdf](MODEL_RELATIONSHIPS.pdf) |
| Database blueprint completo | [docs/DATABASE_BLUEPRINT.pdf](DATABASE_BLUEPRINT.pdf) |
| Política audit log | [docs/AUDIT_LOG_POLICY.pdf](AUDIT_LOG_POLICY.pdf) |
| OT-Calendar sync | [docs/OT_CALENDAR_SYNC.pdf](OT_CALENDAR_SYNC.pdf) |
| Roadmap SP7/SP8 | [docs/TANDAS_SP7_SP8_2026-05-11.pdf](TANDAS_SP7_SP8_2026-05-11.pdf) |
| Gap analysis 174 items | [1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx](../1-output/M3/gap-analysis-magdalena-2026-05-12.xlsx) |
| Testing strategy | [1-output/M3/testing-strategy-magam-2026-05-12.pdf](../1-output/M3/testing-strategy-magam-2026-05-12.pdf) |
| BBP SAP Anglo | [docs/AMSA_BBP_PM_04_Rev_0.docx](AMSA_BBP_PM_04_Rev_0.docx) |
| Blueprint agentes | [skills/00-knowledge-base/architecture/BLUEPRINT.md](../skills/00-knowledge-base/architecture/BLUEPRINT.md) |

---

**Commit:** `cd83670`
