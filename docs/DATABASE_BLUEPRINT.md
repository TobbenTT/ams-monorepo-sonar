# Blueprint Completo de la Base de Datos — AMS / MagEAM

**Versión:** 1.0 · 2026-05-12
**BD:** SQLite (single-file `data/ocp_maintenance.db`)
**ORM:** SQLAlchemy 2.0 + Pydantic
**Modelos:** 67 tablas en `api/database/models.py`
**Sincronización:** auto-create_all en boot (sin Alembic todavía)

---

## 1. Vista de las 67 tablas agrupadas

```
┌─────────────────────────────────────────────────────────────────┐
│  CORE — Usuarios + Plantas + Jerarquía                          │
│  (5 tablas, base de scoping multi-tenant)                       │
└─────────────────────────────────────────────────────────────────┘
   users · plants · hierarchy_nodes · criticality_assessments · audit_log

┌─────────────────────────────────────────────────────────────────┐
│  RCM — Análisis de fallas + estrategias                         │
│  (8 tablas, metodología RCM2/FMECA)                             │
└─────────────────────────────────────────────────────────────────┘
   functions · functional_failures · failure_modes · maintenance_tasks
   work_packages · fmeca_worksheets · rca_analyses · capa_items

┌─────────────────────────────────────────────────────────────────┐
│  CAPTURE → WR → OT (flujo principal)                            │
│  (8 tablas, ciclo de vida de la orden)                          │
└─────────────────────────────────────────────────────────────────┘
   field_captures · work_requests · managed_work_orders · work_orders
   backlog_items · optimized_backlog · planner_recommendations
   sync_conflicts

┌─────────────────────────────────────────────────────────────────┐
│  RESOURCES — Personal + Materiales + Equipos                    │
│  (6 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   workforce · support_equipment · inventory_items
   contractors · contractor_crews · equipment_3d_models

┌─────────────────────────────────────────────────────────────────┐
│  SCHEDULING — Programa semanal + Shutdowns                      │
│  (4 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   weekly_programs · shutdown_calendar · shutdown_events
   preparativos_ot (SF-662 nueva)

┌─────────────────────────────────────────────────────────────────┐
│  EXECUTION — Cierre + reviews                                   │
│  (5 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   execution_checklists · work_assignments · equipment_handovers
   post_maintenance_reviews · time_logs

┌─────────────────────────────────────────────────────────────────┐
│  KPIs + ANALYTICS                                               │
│  (7 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   health_scores · kpi_metrics · failure_predictions
   variance_alerts · planning_kpi_snapshots · de_kpi_snapshots
   reports

┌─────────────────────────────────────────────────────────────────┐
│  CONFIABILIDAD AVANZADA                                         │
│  (4 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   moc_requests · spare_part_analyses · rbi_assessments
   improvement_actions

┌─────────────────────────────────────────────────────────────────┐
│  IA + AGENTES                                                   │
│  (8 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   ai_sessions · ai_interactions · agentic_executions
   troubleshooting_diagnostics · troubleshooting_sessions
   expert_cards · expert_consultations · expert_contributions

┌─────────────────────────────────────────────────────────────────┐
│  INTEGRACIÓN + DMS + SAP                                        │
│  (4 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   sap_upload_packages · sap_sync_log · dms_documents · import_history

┌─────────────────────────────────────────────────────────────────┐
│  FEEDBACK + ENTREGABLES                                         │
│  (6 tablas)                                                     │
└─────────────────────────────────────────────────────────────────┘
   user_feedback · detailed_feedback · ai_feedback
   dedup_negative_pairs · deliverables · notifications
   or_projects · or_deliverables
```

---

## 2. ERD detallado por dominio

### 2.1 CORE — scoping multi-tenant

```
┌──────────────────────┐
│ plants               │
│ ──────────────────── │
│ plant_id (PK)        │
│ name                 │
│ location             │
│ language             │
└──────────┬───────────┘
           │ plant_id (string, no FK formal)
           │
   ┌───────┴────────┬─────────────┬──────────────────┐
   ▼                ▼             ▼                  ▼
┌──────────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│ users        │  │workforce │  │hierarchy_    │  │ work_requests│
│              │  │          │  │   nodes      │  │ managed_wo   │
│ user_id (PK) │  │worker_id │  │ node_id (PK) │  │ field_captur.│
│ username     │  │  (PK)    │  │ parent_id ─→ │  │ ...          │
│ password_hash│  │ specialty│  │   self-ref   │  │              │
│ role         │  │ plant_id │  │ node_type    │  │              │
│ plant_id     │  │ shift    │  │ tag          │  │              │
│ token_version│  │ available│  │ code         │  │              │
└──────────────┘  └──────────┘  │ criticality  │  └──────────────┘
                                │ plant_id     │
                                └──────┬───────┘
                                       │ node_id
                                       ▼
                          ┌───────────────────────────┐
                          │criticality_assessments    │
                          │ assessment_id (PK)        │
                          │ node_id (FK)              │
                          │ risk_class (I_LOW..       │
                          │   IV_CRITICAL)            │
                          │ band (B/A/A+/AA)          │
                          │ band_letter              │
                          │ status                    │
                          │ ai_generated              │
                          └───────────────────────────┘
```

### 2.2 RCM — Análisis de fallas

```
hierarchy_nodes (equipment)
        │
        ▼
┌──────────────────────┐
│ functions            │
│ function_id (PK)     │
│ node_id              │
│ function_type        │
│ description          │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────┐
│ functional_failures      │
│ failure_id (PK)          │
│ function_id (FK)         │
│ failure_type             │
│ description              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ failure_modes            │
│ failure_mode_id (PK)     │
│ functional_failure_id    │
│   (FK NOT NULL)          │
│ mechanism                │
│ cause                    │
│ failure_pattern (A-F)    │
│ failure_consequence      │
│ strategy_type            │
│ ai_generated             │
│ ai_confidence            │
│ existing_task_source     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│ maintenance_tasks        │         │ fmeca_worksheets         │
│ task_id (PK)             │         │ worksheet_id (PK)        │
│ failure_mode_id (FK)     │         │ node_id                  │
│ task_type (PdM/CBM/...)  │         │ status (DRAFT/APPROVED)  │
│ interval                 │         │ generated_by (AI?)       │
│ resources                │         │ approval_chain           │
└────────┬─────────────────┘         └──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ work_packages            │
│ package_id (PK)          │
│ tasks (JSON list of      │
│        task_ids)         │
│ specialty                │
│ duration_hours           │
│ frequency                │
│ 7_mandatory_elements:    │
│   permit + LOTO +        │
│   materials + checklist +│
│   JRA + procedure + WO   │
└──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│ rca_analyses             │         │ capa_items               │
│ rca_id (PK)              │         │ capa_id (PK)             │
│ wo_id (origen, opcional) │         │ source_type (RCA/AUDIT)  │
│ method (5why/fishbone)   │         │ pdca_phase               │
│ root_causes (JSON)       │         │ status (PLAN/DO/CHK/ACT) │
│ recommendations          │         │ owner_id                 │
│ approval_status          │         │ due_date                 │
└──────────────────────────┘         └──────────────────────────┘
```

### 2.3 CAPTURE → WR → OT (flujo principal)

```
                    ┌────────────────────────┐
                    │ field_captures         │
                    │ capture_id (PK)        │
                    │ technician_id          │
                    │ capture_type (VOICE/   │
                    │   TEXT/IMAGE)          │
                    │ raw_text               │
                    │ raw_voice_text         │
                    │ images (JSON URLs)     │
                    │ location_hint          │
                    │ gps_lat/lng            │
                    └───────────┬────────────┘
                                │
                                │ source_capture_id (FK)
                                ▼
                    ┌────────────────────────┐
                    │ work_requests          │
                    │ request_id (PK)        │
                    │ source_capture_id (FK) │
                    │ status: DRAFT →        │
                    │   APROBADO/RECHAZADO   │
                    │   → LINKED             │
                    │ equipment_id/tag       │
                    │ ai_classification      │
                    │ ai_confidence          │
                    │ priority_code          │
                    │ work_class             │
                    │ sla_deadline           │
                    │ created_by             │
                    │ approver_id            │
                    │ aviso_coding (M001..)  │
                    │ planning_group         │
                    │ area_empresa           │
                    │ circumstances          │
                    │ documents (JSON)       │
                    │ support_equipment      │
                    │ image_analysis (JSON)  │
                    │ version (opt. lock)    │
                    └───────────┬────────────┘
                                │
                                │ work_request_id (string, no FK)
                                ▼
                    ┌──────────────────────────────────┐
                    │ managed_work_orders              │
                    │ ──────────────────────────────── │
                    │ wo_id (PK)                       │
                    │ wo_number (OT-NNNN-NNNNN)        │
                    │ work_request_id (suelto)         │
                    │ plant_id                         │
                    │ equipment_id / equipment_tag     │
                    │ technical_location               │
                    │ wo_type (PM01/PM02/PM03)         │
                    │ priority_code (P1/P2/P3/P4)      │
                    │ status: CREADO → LIBERADO →      │
                    │   PLANIFICADO → EN_PROGRAMACION  │
                    │   → PROGRAMADO → EN_EJECUCION    │
                    │   → CERRADO                       │
                    │ is_fast_track (P1/P2 bypass)     │
                    │                                  │
                    │ ── JSON embedded arrays ──       │
                    │ operations[]                     │
                    │ materials[]                     │
                    │ tools[]                          │
                    │ support_equipment[]              │
                    │ documents[]                      │
                    │ assigned_workers[]               │
                    │ description_history[]            │
                    │ post_closure_review (dict)       │
                    │                                  │
                    │ ── Planning ──                   │
                    │ planned_start/end                │
                    │ estimated_hours                  │
                    │                                  │
                    │ ── Execution ──                  │
                    │ actual_start/end                 │
                    │ actual_hours                     │
                    │ completion_pct                   │
                    │                                  │
                    │ ── Closure ──                    │
                    │ closed_by_signature              │
                    │ closed_by_pin_hash (sha256:16)   │
                    │ closure_notes                    │
                    │ closure_audio_url                │
                    │                                  │
                    │ ── Costs ──                      │
                    │ planned_material_cost            │
                    │ planned_external_cost            │
                    │ labor_cost                       │
                    │ material_cost                    │
                    │ external_cost                    │
                    │ actual_total_cost                │
                    │ budget_amount                    │
                    │                                  │
                    │ contractor_crew_id (nullable)    │
                    │ absorbed_by_wo_id (self-ref)     │
                    │ version (optimistic lock)        │
                    └──────────┬───────────────────────┘
                               │
            ┌──────────────────┼──────────────────────┐
            │                  │                      │
            ▼                  ▼                      ▼
   ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
   │ backlog_items   │  │ work_orders  │  │preparativos_ot  │
   │ backlog_id (PK) │  │  (legacy)    │  │ prep_id (PK)    │
   │ work_request_id │  │ wo_id (PK)   │  │ wo_id           │
   │ equipment_tag   │  │ ...          │  │ item_code       │
   │ priority        │  │              │  │ qty + unit      │
   │ wo_type         │  │              │  │ status: PENDIENTE│
   │ status          │  │              │  │ → DESPACHADO    │
   │ blocking_reason │  │              │  │ → EN_TRANSITO   │
   │ specialties     │  │              │  │ → RECIBIDO      │
   │ materials_ready │  │              │  │ dispatched_at/by│
   │ shutdown_req'd  │  │              │  │ received_at/by  │
   │ age_days        │  │              │  │ conforme        │
   │ wo_id           │  │              │  │ layout_url      │
   └─────────────────┘  └──────────────┘  └─────────────────┘
```

### 2.4 SCHEDULING

```
┌─────────────────────────────┐
│ weekly_programs             │
│ program_id (PK)             │
│ plant_id                    │
│ week_number / year          │
│ status (DRAFT/FINALIZED/    │
│   ACTIVE/COMPLETED)         │
│ wo_ids[] (JSON)             │
│ total_planned_hh            │
│ specialty_load (JSON)       │
└─────────────────────────────┘

┌─────────────────────────────┐         ┌──────────────────────┐
│ shutdown_calendar           │         │ shutdown_events      │
│ shutdown_id (PK)            │         │ event_id (PK)        │
│ plant_id                    │         │ shutdown_id (FK)     │
│ start_date / end_date       │         │ wo_id                │
│ shutdown_type               │         │ duration             │
│ areas (JSON)                │         │ critical_path        │
│ description                 │         └──────────────────────┘
└─────────────────────────────┘

┌─────────────────────────────┐
│ work_assignments            │
│ assignment_id (PK)          │
│ wo_id                       │
│ worker_id                   │
│ specialty                   │
│ shift                       │
│ assigned_hours              │
│ confirmed                   │
└─────────────────────────────┘
```

### 2.5 RESOURCES

```
┌──────────────────────────────┐
│ workforce                    │
│ worker_id (PK)               │
│ name                         │
│ specialty                    │
│ shift (MORNING/AFTERNOON/    │
│   NIGHT)                     │
│ plant_id                     │
│ available                    │
│ certifications (JSON)        │
│ competency_level             │
│ years_experience             │
│ equipment_expertise (JSON)   │
│ skills (JSON)                │
│ shift_pattern (5x2/7x7/14x14)│
│ shift_cycle_start            │
│ absence_reason / until       │
└──────────────────────────────┘

┌──────────────────────────────┐         ┌──────────────────────┐
│ support_equipment            │         │ contractors          │
│ equipment_id (PK)            │         │ contractor_id (PK)   │
│ tag (unique)                 │         │ name                 │
│ name                         │         │ specialty            │
│ equipment_type (MOBILE_CRANE,│         │ contact / phone      │
│   SCAFFOLDING, etc.)         │         │ status               │
│ plant_id                     │         └──────────┬───────────┘
│ capacity                     │                    │
│ certification                │                    ▼
│ available                    │         ┌──────────────────────┐
│ alias (JSON multilingual)    │         │ contractor_crews     │
└──────────────────────────────┘         │ crew_id (PK)         │
                                          │ contractor_id (FK)   │
┌──────────────────────────────┐         │ crew_name            │
│ inventory_items              │         │ members (JSON)       │
│ material_code (PK)           │         │ active               │
│ warehouse_id                 │         └──────────────────────┘
│ description                  │
│ quantity_on_hand             │
│ quantity_reserved            │
│ quantity_available           │
│ min_stock / reorder_point    │
│ last_movement_date           │
│ vendor                       │
└──────────────────────────────┘
```

### 2.6 EXECUTION + CLOSURE

```
┌─────────────────────────────┐
│ execution_checklists        │
│ checklist_id (PK)           │
│ wo_id                       │
│ operation_seq               │
│ items (JSON)                │
│ status                      │
│ signed_by                   │
└─────────────────────────────┘

┌─────────────────────────────┐         ┌──────────────────────┐
│ equipment_handovers         │         │post_maintenance_     │
│ handover_id (PK)            │         │  reviews             │
│ wo_id                       │         │ review_id (PK)       │
│ from_shift / to_shift       │         │ wo_id                │
│ notes                       │         │ outcome              │
│ signature                   │         │ effectiveness        │
│ photos[]                    │         │ lessons_learned      │
└─────────────────────────────┘         │ recommendations      │
                                         │ approved_by          │
┌─────────────────────────────┐         └──────────────────────┘
│ time_logs                   │
│ log_id (PK)                 │
│ wo_id                       │
│ worker_id                   │
│ operation_seq               │
│ hours                       │
│ logged_at                   │
└─────────────────────────────┘
```

### 2.7 KPIs

```
┌──────────────────────────────────────────────────────┐
│ kpi_metrics                                          │
│ metric_id (PK) · plant_id · period · category        │
│ values (JSON): MTBF, MTTR, MTBM, availability, etc.  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ planning_kpi_snapshots          │ de_kpi_snapshots   │
│ snapshot_id (PK) · plant_id     │ (DE = Defect       │
│ schedule_compliance             │   Elimination)     │
│ schedule_adherence              │ events_reported    │
│ backlog_age / size              │ meetings_held      │
│ reactive_ratio                  │ actions_implem.    │
│ wrench_time                     │ savings_achieved   │
│ ...                             │ maturity_level     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ health_scores                   │ failure_predictions│
│ score_id (PK)                   │ prediction_id (PK) │
│ equipment_id                    │ equipment_id       │
│ score (0-100)                   │ predicted_date     │
│ trend (improving/degrading)     │ confidence         │
│ recommendations                 │ failure_mode_id    │
└──────────────────────────────────────────────────────┘
```

### 2.8 AUDIT + IA + SISTEMA

```
┌──────────────────────────────────────────────────┐
│ audit_log (UNIVERSAL · append-only)              │
│ ───────────────────────────────────────────────  │
│ id (PK autoincrement)                            │
│ timestamp (indexed)                              │
│ entity_type (indexed) — work_request,            │
│   managed_work_order, user, settings, ...        │
│ entity_id (nullable)                             │
│ action — CREATE/UPDATE/TRANSITION/APPROVE/...    │
│ payload (JSON) — datos completos del cambio     │
│ user — uuid o "agent:<name>"                     │
│ ip_address (nullable, GDPR-friendly)             │
│ user_agent (nullable)                            │
│                                                  │
│ Política SF-660: 2y activo + 5y archivo +       │
│   eliminación con notificación. Inmutable.       │
└──────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ai_sessions     │  │ ai_interactions │  │agentic_         │
│ session_id (PK) │  │ interaction (PK)│  │  executions     │
│ user_id         │  │ session_id (FK) │  │ exec_id (PK)    │
│ agent_type      │  │ prompt          │  │ agent_id        │
│ status          │  │ response        │  │ skill_used      │
│ token_count     │  │ model           │  │ input/output    │
│ cost_usd        │  │ tokens_in/out   │  │ tokens_used     │
└─────────────────┘  │ latency_ms      │  │ duration_ms     │
                     │ feedback (👍/👎)│  └─────────────────┘
                     └─────────────────┘
```

### 2.9 INTEGRACIÓN

```
┌──────────────────────────────────────────────────┐
│ dms_documents                                    │
│ doc_id (PK)                                      │
│ document_number (unique, DOC-NNNNNN)             │
│ document_type (DWG/MAF/MAN/PRO/CHK)              │
│ sap_func_loc / sap_func_loc_short                │
│ equipment_name / eqart                           │
│ file_path                                        │
│ status (Activo/Inactivo)                         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ sap_upload_packages                              │
│ package_id (PK)                                  │
│ wo_ids[]                                         │
│ status (DRAFT/READY/UPLOADED/FAILED)             │
│ format (CSV/JSON)                                │
│ generated_by                                     │
│ created_at                                       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ sap_sync_log                                     │
│ sync_id (PK)                                     │
│ entity_type/id                                   │
│ direction (PUSH/PULL)                            │
│ status (PENDING/SUCCESS/FAILED)                  │
│ payload                                          │
│ error_message                                    │
│ retried_count                                    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ import_history                                   │
│ import_id (PK)                                   │
│ source_file                                      │
│ entity_type                                      │
│ row_count                                        │
│ errors (JSON)                                    │
│ imported_by                                      │
└──────────────────────────────────────────────────┘
```

### 2.10 IMPROVEMENT + MOC + RBI

```
┌──────────────────────────────┐
│ improvement_actions          │   PDCA cycle
│ action_id (PK)               │
│ source_type (RCA/AUDIT/      │
│   FMECA/USER)                │
│ wo_id (nullable)             │
│ description                  │
│ status (BACKLOG/IN_PROGRESS/ │
│   DONE/VERIFIED/CANCELLED)   │
│ owner_id                     │
│ due_date                     │
│ business_case                │
│ cost_benefit                 │
│ approval_chain (JSON)        │
└──────────────────────────────┘

┌──────────────────────────────┐         ┌──────────────────────┐
│ moc_requests                 │         │ rbi_assessments      │
│ (Management of Change)       │         │ (Risk-Based Insp.)   │
│ moc_id (PK)                  │         │ assessment_id (PK)   │
│ change_type                  │         │ equipment_id         │
│ impact_assessment            │         │ probability_failure  │
│ approval_status              │         │ consequence          │
│ implementation_plan          │         │ inspection_interval  │
└──────────────────────────────┘         └──────────────────────┘

┌──────────────────────────────┐         ┌──────────────────────┐
│ spare_part_analyses          │         │ variance_alerts      │
│ analysis_id (PK)             │         │ alert_id (PK)        │
│ part_code                    │         │ wo_id                │
│ criticality_class            │         │ alert_type (HH_VAR/  │
│ lead_time                    │         │   COST_VAR/SCHEDULE) │
│ recommended_stock            │         │ severity             │
│ usage_pattern                │         │ resolved             │
└──────────────────────────────┘         └──────────────────────┘
```

---

## 3. Convenciones del schema

| Convención | Detalle |
|-----------|---------|
| **PK = `<entity>_id`** | `wo_id`, `worker_id`, `capture_id`, etc. (UUID string) |
| **Timestamps** | `created_at` + `updated_at` (auto-fill por SQLAlchemy `onupdate=datetime.now`) |
| **Soft-delete** | NO existe — usar `status: CANCELLED` |
| **Multi-tenant** | `plant_id: str` en todas las tablas operacionales |
| **JSON embebido** | Para arrays variables (operations, materials, etc.) |
| **Optimistic lock** | Campo `version: int` en `managed_work_orders` + WR |
| **Audit trail** | `audit_log` tabla universal con `entity_type` + `entity_id` |
| **FK explícitas** | Solo donde el borrado cascadeante es deseable (functions → functional_failures → failure_modes) |
| **FK lógicas** | Para resilencia: plant_id, worker_id, material_code (string sin constraint) |

---

## 4. Índices clave

```sql
-- Lookups frecuentes (todos definidos como index=True en models.py)
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id    ON audit_log(entity_id);
CREATE INDEX idx_audit_log_timestamp    ON audit_log(timestamp);

CREATE INDEX idx_wo_status              ON managed_work_orders(status);
CREATE INDEX idx_wo_plant_id            ON managed_work_orders(plant_id);
CREATE INDEX idx_wo_wo_number           ON managed_work_orders(wo_number);
CREATE INDEX idx_wo_priority_code       ON managed_work_orders(priority_code);

CREATE INDEX idx_wr_status              ON work_requests(status);
CREATE INDEX idx_wr_equipment_id        ON work_requests(equipment_id);
CREATE INDEX idx_wr_plant_id            ON work_requests(plant_id);

CREATE INDEX idx_hierarchy_node_type    ON hierarchy_nodes(node_type);
CREATE INDEX idx_hierarchy_tag          ON hierarchy_nodes(tag);
CREATE INDEX idx_hierarchy_plant_id     ON hierarchy_nodes(plant_id);

CREATE INDEX idx_preparativos_wo_id     ON preparativos_ot(wo_id);
CREATE INDEX idx_preparativos_status    ON preparativos_ot(status);
```

---

## 5. Campos JSON (no relacionales, embedded)

| Tabla | Campo JSON | Estructura típica |
|-------|------------|-------------------|
| `managed_work_orders` | `operations` | `[{seq, description, specialty, hours, completion_pct, actual_hours, task_type}]` |
| `managed_work_orders` | `materials` | `[{code, description, quantity, unit, reservation_code, status, cost_unit}]` |
| `managed_work_orders` | `assigned_workers` | `[{worker_id, name, specialty}]` |
| `managed_work_orders` | `support_equipment` | `[{tag, name, equipment_type, hours, notes, scope}]` |
| `managed_work_orders` | `documents` | `[{name, url, type, uploaded_by, uploaded_at}]` |
| `managed_work_orders` | `description_history` | `[{text, edited_at, edited_by}]` (append-only) |
| `managed_work_orders` | `post_closure_review` | `{outcome, lessons_learned[], recommendations[]}` |
| `work_requests` | `ai_classification` | `{priority, equipment_match, confidence, suggestions[]}` |
| `work_requests` | `image_analysis` | `{anomalies_detected, component_identified, severity_visual}` |
| `work_requests` | `documents` | `[{name, url, type}]` |
| `audit_log` | `payload` | `{old_value, new_value, context, autonomous?, confirmed_by?}` |
| `weekly_programs` | `wo_ids` | `["wo_id1", "wo_id2", ...]` |
| `field_captures` | `images` | `["url1", "url2", ...]` |

---

## 6. State machines

### 6.1 WorkRequest status

```
DRAFT ─────► APROBADO ─────► LINKED (cuando se crea OT)
   │              │
   │              ▼
   └──────► RECHAZADO (sin retorno)
```

### 6.2 ManagedWorkOrder status (SF-578 cadena)

```
CREADO ──► LIBERADO ──► PLANIFICADO ──► EN_PROGRAMACION ──► PROGRAMADO ──► EN_EJECUCION ──► CERRADO
                                                                  │              │
                                                                  ▼              ▼
                                                            REPROGRAMADO    CANCELADO (terminal)
                                                                  │
                                                                  └────► PROGRAMADO (loop)

Fast-track P1/P2:
CREADO ──direct──► PROGRAMADO (bypass planning)
```

### 6.3 Preparativos OT status (SF-662)

```
PENDIENTE ──► DESPACHADO ──► EN_TRANSITO ──► RECIBIDO (con conforme=true/false)
                  │                                  │
                  └──► ANOMALIA ───► DESPACHADO ───┘ (reintento)
```

---

## 7. Compatibilidad SAP PM

Tabla `work_requests` incluye campos pre-mapeados al **Aviso SAP IH01**:

| Campo AMS | Campo SAP | Significado |
|-----------|-----------|-------------|
| `aviso_coding` | `QMART` (10) | Tipo de aviso (M001-M005, P001-P003) |
| `notification_type` | `QMNUM tipo` | A1=Aviso Mantto |
| `planning_group` | `INGRP` (10) | Grupo planificación |
| `work_center` | `ARBPL` (20) | Puesto de trabajo |
| `technical_location` | `TPLNR` (100) | Ubicación técnica |
| `area_empresa` | `ABCKZ` (10) | Indicador ABC empresa |
| `reported_by` | `QMNAM` | Autor del aviso |
| `circumstances` | `LTXT` | Texto largo descripción |

Tabla `managed_work_orders` ídem para **OT SAP IW21**:

| Campo AMS | Campo SAP | Significado |
|-----------|-----------|-------------|
| `wo_number` | `AUFNR` | Número de orden |
| `wo_type` | `AUART` | Clase de orden (PM01/02/03) |
| `priority_code` | `PRIOK` | Prioridad |
| `equipment_id` | `EQUNR` | Número de equipo |
| `planned_start/end` | `GSTRP/GLTRP` | Fechas plan |
| `actual_start/end` | `GSTRI/GLTRI` | Fechas real |

Mapping completo en `sap_mock/data/avisos_campos_blueprint.xlsx`.

---

## 8. Operaciones administrativas

### Auto-creación (sin Alembic)
```python
# api/main.py
from api.database.connection import Base, engine
Base.metadata.create_all(engine)  # crea tablas faltantes al boot
```

### Backup recomendado
```bash
# SQLite backup atómico
sqlite3 data/ocp_maintenance.db ".backup data/backup_$(date +%Y-%m-%d).db"
```

### Limpiar audit > 5 años
```bash
python scripts/purge_audit_log_5y.py --dry-run            # ver qué borraría
python scripts/purge_audit_log_5y.py --confirm --export-csv backup.csv
```

### Re-indexar RAG (LanceDB separado de SQLite)
```bash
python scripts/reindex_rag.py
```

---

## 9. Tablas que NO existen pero podrían venir (SP8+)

- `cost_centers` (0E tanda) — para opex/capex por CeCo
- `expense_classes` (0E) — clases de gasto SAP
- `failure_symptom_catalog` (SAP-style) — síntomas codificados
- `failure_cause_catalog` (SAP-style) — causas codificadas
- `wrench_time_observations` — para KPI tradicional
- `training_records` — horas capacitación
- `safety_incidents` — integración HSE
- `equipment_telemetry` — para futuro SCADA real

---

## 10. Diferencias `work_orders` (legacy) vs `managed_work_orders`

| Aspecto | `work_orders` (Fase 1) | `managed_work_orders` (Fase 4+, actual) |
|---------|------------------------|------------------------------------------|
| Uso | Legacy, sin lifecycle complejo | OT principal con estado SAP-PM completo |
| Campos | Mínimos (8) | 55+ campos + JSON embedded |
| Lifecycle | Solo created/closed | CREADO→...→CERRADO (7 estados) |
| Auditoría | No | Full audit_log integration |
| Fast-track | No | P1/P2 bypass planning |
| Closure gates | No | 6 pre-close gates |
| **Recomendación** | **Deprecar** en SP9 | Único modelo a usar |

---

**Total: 67 tablas · 562 endpoints · SQLite single-file ~50MB en producción**

**Generado en commit:** `cd83670`
