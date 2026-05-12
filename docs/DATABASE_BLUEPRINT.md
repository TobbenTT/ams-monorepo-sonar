# Blueprint Completo de la Base de Datos — AMS / MagEAM

**Versión:** 1.0 · 2026-05-12
**BD:** SQLite (single-file `data/ocp_maintenance.db`)
**ORM:** SQLAlchemy 2.0 + Pydantic
**Modelos:** 67 tablas en `api/database/models.py`
**Sincronización:** auto-create_all en boot (sin Alembic todavía)

---

## 1. Vista general — 67 tablas en 10 dominios

| Dominio | Tablas | # |
|---------|--------|---|
| **Core** (scoping multi-tenant) | users, plants, hierarchy_nodes, criticality_assessments, audit_log | 5 |
| **RCM** (análisis de fallas + estrategias) | functions, functional_failures, failure_modes, maintenance_tasks, work_packages, fmeca_worksheets, rca_analyses, capa_items | 8 |
| **Capture → WR → OT** (flujo principal) | field_captures, work_requests, managed_work_orders, work_orders, backlog_items, optimized_backlog, planner_recommendations, sync_conflicts | 8 |
| **Resources** (personal + materiales + equipos) | workforce, support_equipment, inventory_items, contractors, contractor_crews, equipment_3d_models | 6 |
| **Scheduling** (programa semanal + shutdowns) | weekly_programs, shutdown_calendar, shutdown_events, preparativos_ot | 4 |
| **Execution** (cierre + reviews) | execution_checklists, work_assignments, equipment_handovers, post_maintenance_reviews, time_logs | 5 |
| **KPIs + Analytics** | health_scores, kpi_metrics, failure_predictions, variance_alerts, planning_kpi_snapshots, de_kpi_snapshots, reports | 7 |
| **Confiabilidad avanzada** | moc_requests, spare_part_analyses, rbi_assessments, improvement_actions | 4 |
| **IA + Agentes** | ai_sessions, ai_interactions, agentic_executions, troubleshooting_diagnostics, troubleshooting_sessions, expert_cards, expert_consultations, expert_contributions | 8 |
| **Integración + DMS + SAP** | sap_upload_packages, sap_sync_log, dms_documents, import_history | 4 |
| **Feedback + entregables + or-system** | user_feedback, detailed_feedback, ai_feedback, dedup_negative_pairs, deliverables, notifications, or_projects, or_deliverables | 8 |

**Total: 67 tablas**

---

## 2. Tablas Core con relaciones lógicas a las operacionales

### 2.1 `plants` — origen multi-tenant

| Campo | Tipo | Notas |
|-------|------|-------|
| `plant_id` | string PK | Ej. GOLDFIELDS-SN, OCP-JFC1 |
| `name` | string | Nombre legible (anonimizado a "Planta Minera Cliente") |
| `location` | string | Geográfica |
| `language` | string | Idioma default UI |

`plant_id` se propaga (sin FK formal) a: `users`, `workforce`, `hierarchy_nodes`, `work_requests`, `managed_work_orders`, `field_captures`, `audit_log`, etc.

### 2.2 `users`

| Campo | Tipo | Notas |
|-------|------|-------|
| `user_id` | string PK (uuid) | |
| `username` | string unique | |
| `password_hash` | string | bcrypt |
| `role` | string | admin / manager / planner / engineer / supervisor / tecnico |
| `plant_id` | string | Scope multi-tenant |
| `token_version` | int | bump invalida todos los JWT del usuario |
| `is_active` | bool | |

### 2.3 `hierarchy_nodes` — estructura del activo

| Campo | Tipo | Notas |
|-------|------|-------|
| `node_id` | string PK | |
| `parent_node_id` | string (self-ref) | Plant > Area > System > Equipment |
| `node_type` | string | PLANT / AREA / SYSTEM / EQUIPMENT |
| `tag` | string | TAG SAP |
| `code` | string | Código simplificado |
| `name` | string | |
| `level` | int | 1-4 |
| `plant_id` | string | |
| `criticality` | string | Snapshot último assessment |

### 2.4 `criticality_assessments`

| Campo | Tipo | Notas |
|-------|------|-------|
| `assessment_id` | PK | |
| `node_id` | FK hierarchy_nodes | |
| `risk_class` | enum | I_LOW / II_MEDIUM / III_HIGH / IV_CRITICAL |
| `band` | string | B / A / A+ / AA |
| `status` | string | DRAFT / APPROVED |
| `ai_generated` | bool | |
| `ai_confidence` | float | 0-1 |

### 2.5 `audit_log` — universal append-only

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | int PK autoincrement | |
| `timestamp` | DateTime indexed | UTC |
| `entity_type` | string indexed | work_request / managed_work_order / user / settings / ... (14 entidades cubiertas) |
| `entity_id` | string | Generic foreign reference |
| `action` | string | CREATE / UPDATE / TRANSITION / APPROVE / DELETE / LOGIN / ... |
| `payload` | JSON | Datos completos del cambio |
| `user` | string | `<user_id>` o `agent:<agent_name>` |
| `ip_address` | string | Para LOGIN |
| `user_agent` | string | Para LOGIN |

**Política SF-660**: append-only, 2 años activo, 5 años archivo, eliminación con notificación.

---

## 3. Dominio RCM — Análisis de fallas

### 3.1 `functions`
| Campo | Tipo |
|-------|------|
| `function_id` PK | string |
| `node_id` FK hierarchy_nodes | string |
| `function_type` | string (PRIMARY / SECONDARY / PROTECTION) |
| `description` | text |

### 3.2 `functional_failures`
| Campo | Tipo |
|-------|------|
| `failure_id` PK | string |
| `function_id` FK functions | string |
| `failure_type` | string (TOTAL / PARTIAL / INTERMITTENT) |
| `description` | text |

### 3.3 `failure_modes`
| Campo | Tipo |
|-------|------|
| `failure_mode_id` PK | string |
| `functional_failure_id` FK NOT NULL | string |
| `mechanism` | string |
| `cause` | string |
| `failure_pattern` | string A-F |
| `failure_consequence` | string |
| `strategy_type` | string (CONDITION_BASED / SCHEDULED_DISCARD / RUN_TO_FAILURE / REDESIGN) |
| `ai_generated` | bool |
| `ai_confidence` | float |
| `existing_task_source` | string nullable |

### 3.4 `maintenance_tasks`
| Campo | Tipo |
|-------|------|
| `task_id` PK | string |
| `failure_mode_id` FK | string |
| `task_type` | string (INSPECT / TEST / REPLACE / OVERHAUL / MONITOR) |
| `interval` | string |
| `resources` | JSON |

### 3.5 `work_packages`
| Campo | Tipo |
|-------|------|
| `package_id` PK | string |
| `tasks` | JSON list of task_ids |
| `specialty` | string |
| `duration_hours` | float |
| `frequency` | string |

Cada work_package debe contener 7 elementos mandatorios: permit, LOTO, materials, checklist, JRA, procedure, WO.

### 3.6 `fmeca_worksheets`
| Campo | Tipo |
|-------|------|
| `worksheet_id` PK | string |
| `node_id` | string |
| `status` | string (DRAFT / APPROVED) |
| `generated_by` | string |
| `approval_chain` | JSON |

### 3.7 `rca_analyses`
| Campo | Tipo |
|-------|------|
| `rca_id` PK | string |
| `wo_id` nullable | string |
| `method` | string (5why / fishbone / fault_tree) |
| `root_causes` | JSON |
| `recommendations` | JSON |
| `approval_status` | string |

### 3.8 `capa_items` (PDCA)
| Campo | Tipo |
|-------|------|
| `capa_id` PK | string |
| `source_type` | string (RCA / AUDIT / FMECA / USER) |
| `pdca_phase` | string (PLAN / DO / CHECK / ACT) |
| `status` | string |
| `owner_id` | string |
| `due_date` | datetime |

---

## 4. Flujo principal: Capture → WR → OT

### 4.1 `field_captures`

| Campo | Tipo | Notas |
|-------|------|-------|
| `capture_id` | string PK | |
| `technician_id` | string | |
| `capture_type` | string | VOICE / TEXT / IMAGE / VOICE+IMAGE |
| `language` | string | en / es / fr / ar |
| `raw_text` | text nullable | |
| `raw_voice_text` | text nullable | Transcripción audio |
| `images` | JSON list | URLs `/api/v1/capture/photos/...` |
| `location_hint` | string | |
| `gps_lat / gps_lng` | float | |

### 4.2 `work_requests` (AV-NNNNN)

| Campo | Tipo | Notas |
|-------|------|-------|
| `request_id` | string PK | |
| `source_capture_id` | FK field_captures | nullable |
| `status` | string | DRAFT → APROBADO / RECHAZADO → LINKED |
| `equipment_id` | string | |
| `equipment_tag` | string | |
| `equipment_confidence` | float | AI match score |
| `ai_classification` | JSON | priority, equipment, suggestions |
| `image_analysis` | JSON | anomalies, severity, component |
| `priority_code` | string | P1 / P2 / P3 / P4 |
| `work_class` | string | PROGRAMADO / NO_PROGRAMADO |
| `sla_deadline` | datetime | |
| `created_by` | string | |
| `approver_id` | string | Quien aprobó |
| `approved_at` | datetime | |
| `approval_comment` | text | |
| `rejection_reason` | text | |
| `notification_type` | string | A1 (SAP) |
| `reported_by` | string | Autor del aviso SAP |
| `documents` | JSON | adjuntos |
| `support_equipment` | JSON | |
| `circumstances` | text | SAP campo 8 |
| `aviso_coding` | string | M001-M005, P001-P003 |
| `planning_group` | string | M01-M05, P01-P03 |
| `area_empresa` | string | SEC, HUM, RIP, etc. |
| `version` | int | Optimistic lock |

### 4.3 `managed_work_orders` (OT-2026-NNNNN) — TABLA CENTRAL

Tabla más grande. **55 campos + 8 JSON arrays embebidos**.

#### Campos básicos
| Campo | Tipo | Notas |
|-------|------|-------|
| `wo_id` | string PK | uuid |
| `wo_number` | string unique | OT-2026-NNNNN |
| `work_request_id` | string nullable | sin FK formal (fast-track P1/P2 puede ser standalone) |
| `plant_id` | string | |
| `equipment_id` | string | |
| `equipment_tag` | string | |
| `technical_location` | string nullable | TL SAP |

#### Planning
| Campo | Tipo | Notas |
|-------|------|-------|
| `wo_title` | string nullable | SF-507 título arrastrado del WR |
| `description` | text | |
| `description_history` | JSON list | SF-653 append-only |
| `wo_type` | string | PM01 / PM02 / PM03 (correctivo/preventivo/mejora) |
| `priority_code` | string | P1 / P2 / P3 / P4 |
| `work_class` | string | PROGRAMADO / NO_PROGRAMADO |
| `is_fast_track` | bool | P1/P2 bypass planning |
| `planning_group` | string nullable | |
| `work_center` | string nullable | |

#### JSON arrays embebidos (no son tablas separadas)
| Campo | Estructura interna |
|-------|---------------------|
| `operations` | `[{seq, description, specialty, hours, quantity, completion_pct, actual_hours, task_type}]` |
| `materials` | `[{code, description, quantity, unit, reservation_code, status, cost_unit}]` |
| `tools` | `[{tool_name, qty}]` |
| `support_equipment` | `[{tag, name, equipment_type, hours, notes, scope}]` |
| `documents` | `[{name, url, type}]` |
| `assigned_workers` | `[{worker_id, name, specialty}]` |
| `post_closure_review` | `{outcome, lessons_learned[], recommendations[]}` |
| `labour_summary` | `{total_hours, specialties: [{name, hours}]}` |

#### Scheduling
| Campo | Tipo |
|-------|------|
| `planned_start / planned_end` | datetime |
| `actual_start / actual_end` | datetime |
| `estimated_hours` | float |
| `actual_hours` | float |
| `shift` | string (DAY / NIGHT) |

#### Workflow
| Campo | Tipo | Valores |
|-------|------|---------|
| `status` | string | CREADO → LIBERADO → PLANIFICADO → EN_PROGRAMACION → PROGRAMADO → EN_EJECUCION → CERRADO (también REPROGRAMADO, CANCELADO) |
| `planned_by` | string nullable | |
| `released_by` | string nullable | |
| `released_at` | datetime nullable | |
| `closed_by` | string nullable | |
| `closed_at` | datetime nullable | |

#### Cierre con firma (SF-570 + pre-close gates)
| Campo | Tipo | Notas |
|-------|------|-------|
| `closed_by_signature` | string nullable | Nombre tipeado |
| `closed_by_pin_hash` | string(16) | sha256 truncated 16 chars del PIN |
| `closure_notes` | string(500) | |
| `closure_audio_url` | string(500) | SF-500 |
| `contractor_crew_id` | string nullable | |

#### Costos
| Campo | Tipo |
|-------|------|
| `budget_approved / budget_amount` | bool / float |
| `labor_cost / material_cost / external_cost` | float |
| `planned_material_cost / planned_external_cost` | float |
| `actual_total_cost` | float |

#### Otros
| Campo | Tipo | Notas |
|-------|------|-------|
| `completion_pct` | float | |
| `reservation_code` | string nullable | SAP BOM reserva |
| `cancellation_reason / cancellation_type` | string nullable | |
| `absorbed_by_wo_id` | string nullable | self-ref: OT PM03 absorbe PM01/PM02 |
| `version` | int | Optimistic lock SF-562 |
| `created_at / updated_at` | datetime | |

### 4.4 `backlog_items`

| Campo | Tipo |
|-------|------|
| `backlog_id` PK | string |
| `work_request_id` | string |
| `wo_id` nullable | string |
| `equipment_id / equipment_tag` | string |
| `priority` | string |
| `wo_type` | string |
| `status` | string (READY / BLOCKED / OPTIMIZED / SCHEDULED) |
| `blocking_reason` | string nullable |
| `estimated_hours` | float |
| `specialties` | JSON list |
| `materials_ready` | bool |
| `shutdown_required` | bool |
| `age_days` | int |
| `plant` | string |
| `group_id` | string nullable |

### 4.5 `preparativos_ot` (SF-662 — NUEVA SP7)

| Campo | Tipo |
|-------|------|
| `prep_id` PK | string |
| `wo_id` indexed | string |
| `plant_id` indexed nullable | string |
| `item_code` | string |
| `item_desc` | text nullable |
| `qty` | float |
| `unit` | string nullable |
| `status` indexed | PENDIENTE / DESPACHADO / EN_TRANSITO / RECIBIDO / ANOMALIA |
| `dispatched_at / dispatched_by` | datetime / string |
| `received_at / received_by` | datetime / string |
| `conforme` | bool nullable | firma de aceptación al recibir |
| `layout_url` | string(500) | PDF disposición patio |
| `notes` | text | append-only con timestamp |

---

## 5. Resources

### 5.1 `workforce`

| Campo | Tipo | Notas |
|-------|------|-------|
| `worker_id` PK | string | |
| `name` | string | |
| `specialty` | string | MECANICO / ELECTRICO / INSTRUMENTISTA / SOLDADURA / etc. |
| `shift` | string | MORNING / AFTERNOON / NIGHT |
| `plant_id` | string | |
| `available` | bool | |
| `certifications` | JSON | |
| `competency_level` | string | A / B / C / D |
| `years_experience` | int | |
| `equipment_expertise` | JSON | |
| `skills` | JSON | |
| `shift_pattern` | string | 5x2 / 4x3 / 7x7 / 14x14 / continuous / abc_8h |
| `shift_cycle_start` | string | ISO date |
| `absence_reason / absence_until` | string nullable | |

### 5.2 `support_equipment`

| Campo | Tipo | Notas |
|-------|------|-------|
| `equipment_id` PK | string | |
| `tag` | string unique | |
| `name` | string | |
| `equipment_type` | string | MOBILE_CRANE / SCAFFOLDING / BRIDGE_CRANE / etc. |
| `plant_id` | string | |
| `capacity` | float | |
| `certification` | string | |
| `available` | bool | |
| `alias` | JSON | Multilingual (Grúa móvil ↔ Mobile crane) |

### 5.3 `inventory_items` (catalog materiales)

| Campo | Tipo |
|-------|------|
| `material_code` PK | string |
| `warehouse_id` | string |
| `description` | string |
| `quantity_on_hand` | int |
| `quantity_reserved` | int |
| `quantity_available` | int |
| `min_stock / reorder_point` | int |
| `last_movement_date` | date |
| `vendor` | string |

### 5.4 `contractors` + `contractor_crews`

| `contractors` | `contractor_crews` |
|---------------|---------------------|
| contractor_id PK | crew_id PK |
| name | contractor_id FK |
| specialty | crew_name |
| contact / phone | members (JSON) |
| status | active |

---

## 6. Scheduling

### 6.1 `weekly_programs`

| Campo | Tipo |
|-------|------|
| `program_id` PK | string |
| `plant_id` | string |
| `week_number / year` | int / int |
| `status` | DRAFT / FINALIZED / ACTIVE / COMPLETED |
| `wo_ids` | JSON list |
| `total_planned_hh` | float |
| `specialty_load` | JSON |

### 6.2 `shutdown_calendar` + `shutdown_events`

| `shutdown_calendar` | `shutdown_events` |
|---------------------|---------------------|
| shutdown_id PK | event_id PK |
| plant_id | shutdown_id FK |
| start_date / end_date | wo_id |
| shutdown_type | duration |
| areas (JSON) | critical_path |
| description | |

---

## 7. Execution + Closure

### 7.1 `execution_checklists`
| Campo | Tipo |
|-------|------|
| `checklist_id` PK | string |
| `wo_id` | string |
| `operation_seq` | int |
| `items` | JSON list |
| `status` | string |
| `signed_by` | string |

### 7.2 `work_assignments`
| Campo | Tipo |
|-------|------|
| `assignment_id` PK | string |
| `wo_id` | string |
| `worker_id` | string |
| `specialty` | string |
| `shift` | string |
| `assigned_hours` | float |
| `confirmed` | bool |

### 7.3 `equipment_handovers`
| Campo | Tipo |
|-------|------|
| `handover_id` PK | string |
| `wo_id` | string |
| `from_shift / to_shift` | string |
| `notes` | text |
| `signature` | string |
| `photos` | JSON list |

### 7.4 `post_maintenance_reviews`
| Campo | Tipo |
|-------|------|
| `review_id` PK | string |
| `wo_id` | string |
| `outcome` | string |
| `effectiveness` | string |
| `lessons_learned` | text |
| `recommendations` | text |
| `approved_by` | string |

### 7.5 `time_logs`
| Campo | Tipo |
|-------|------|
| `log_id` PK | string |
| `wo_id` | string |
| `worker_id` | string |
| `operation_seq` | int |
| `hours` | float |
| `logged_at` | datetime |

---

## 8. KPIs

### 8.1 `kpi_metrics`
| Campo | Tipo |
|-------|------|
| `metric_id` PK | string |
| `plant_id` | string |
| `period` | string (week / month / quarter) |
| `category` | string |
| `values` | JSON (MTBF, MTTR, MTBM, availability, etc.) |

### 8.2 `planning_kpi_snapshots`
| Campo | Tipo |
|-------|------|
| `snapshot_id` PK | string |
| `plant_id` | string |
| `schedule_compliance` | float |
| `schedule_adherence` | float |
| `backlog_age / backlog_size` | int |
| `reactive_ratio` | float |
| `wrench_time` | float |

### 8.3 `de_kpi_snapshots` (Defect Elimination)
| Campo | Tipo |
|-------|------|
| `snapshot_id` PK | string |
| `plant_id` | string |
| `period_start / period_end` | date |
| `events_reported / events_required` | int / int |
| `meetings_held / meetings_required` | int / int |
| `actions_implemented / actions_planned` | int / int |
| `savings_achieved / savings_target` | float / float |
| `failures_current / failures_previous` | int / int |
| `maturity_level` | INITIAL / DEVELOPING / ESTABLISHED / OPTIMIZING |
| `program_score` | float 0-100 |

### 8.4 `health_scores`
| Campo | Tipo |
|-------|------|
| `score_id` PK | string |
| `equipment_id` | string |
| `score` | float 0-100 |
| `trend` | string (improving / stable / degrading) |
| `recommendations` | text |

### 8.5 `failure_predictions`
| Campo | Tipo |
|-------|------|
| `prediction_id` PK | string |
| `equipment_id` | string |
| `predicted_date` | datetime |
| `confidence` | float |
| `failure_mode_id` | string |

### 8.6 `variance_alerts`
| Campo | Tipo |
|-------|------|
| `alert_id` PK | string |
| `wo_id` | string |
| `alert_type` | HH_VARIANCE / COST_VARIANCE / SCHEDULE |
| `severity` | string |
| `resolved` | bool |

---

## 9. IA + Agentes

### 9.1 `ai_sessions`
| Campo | Tipo |
|-------|------|
| `session_id` PK | string |
| `user_id` | string |
| `agent_type` | string |
| `status` | string |
| `token_count` | int |
| `cost_usd` | float |

### 9.2 `ai_interactions`
| Campo | Tipo |
|-------|------|
| `interaction_id` PK | string |
| `session_id` FK | string |
| `prompt` | text |
| `response` | text |
| `model` | string (claude-opus-4-6 / claude-sonnet-4-5 / etc.) |
| `tokens_in / tokens_out` | int / int |
| `latency_ms` | int |
| `feedback` | int (1 = thumbs up, -1 = down) |

### 9.3 `agentic_executions`
| Campo | Tipo |
|-------|------|
| `exec_id` PK | string |
| `agent_id` | string |
| `skill_used` | string |
| `input / output` | JSON |
| `tokens_used` | int |
| `duration_ms` | int |

### 9.4 `troubleshooting_sessions` + `troubleshooting_diagnostics`
Pares para sesiones de troubleshooting (P1/P2) con árbol de decisión + match a casos previos.

### 9.5 `expert_cards` + `expert_consultations` + `expert_contributions`
Sistema de knowledge base con expertos: tarjetas (casos resueltos), consultas (preguntas abiertas), contribuciones (respuestas).

---

## 10. Integración + DMS + SAP

### 10.1 `dms_documents`
| Campo | Tipo | Notas |
|-------|------|-------|
| `doc_id` PK | string | |
| `document_number` unique indexed | string | DOC-NNNNNN |
| `document_type` indexed | string | DWG / MAF / MAN / PRO / CHK |
| `document_desc` | text | |
| `version` | int | |
| `sap_func_loc / sap_func_loc_short` indexed | string nullable | |
| `equipment_name / eqart` | string nullable | |
| `file_path` | string(300) nullable | |
| `created_date / created_by` | string | |
| `status` | string | Activo / Inactivo |

### 10.2 `sap_upload_packages`
| Campo | Tipo |
|-------|------|
| `package_id` PK | string |
| `wo_ids` | JSON list |
| `status` | DRAFT / READY / UPLOADED / FAILED |
| `format` | CSV / JSON |
| `generated_by` | string |
| `created_at` | datetime |

### 10.3 `sap_sync_log`
| Campo | Tipo |
|-------|------|
| `sync_id` PK | string |
| `entity_type / entity_id` | string / string |
| `direction` | PUSH / PULL |
| `status` | PENDING / SUCCESS / FAILED |
| `payload` | JSON |
| `error_message` | text |
| `retry_count` | int |

### 10.4 `import_history`
| Campo | Tipo |
|-------|------|
| `import_id` PK | string |
| `source_file` | string |
| `entity_type` | string |
| `row_count` | int |
| `errors` | JSON |
| `imported_by` | string |

---

## 11. Convenciones del schema

| Convención | Detalle |
|-----------|---------|
| **PK = `<entity>_id`** | wo_id, worker_id, capture_id, etc. (UUID string) |
| **Timestamps** | created_at + updated_at auto via SQLAlchemy onupdate |
| **Soft-delete** | NO existe — usar status=CANCELLED |
| **Multi-tenant** | `plant_id: str` en todas las tablas operacionales |
| **JSON embebido** | Para arrays variables (operations, materials, etc.) |
| **Optimistic lock** | Campo `version: int` en managed_work_orders y WR |
| **Audit trail** | audit_log tabla universal con entity_type + entity_id |
| **FK explícitas** | Solo donde el borrado cascadeante es deseable |
| **FK lógicas** | Para resiliencia: plant_id, worker_id, material_code (string sin constraint) |

---

## 12. Índices clave

```sql
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id   ON audit_log(entity_id);
CREATE INDEX idx_audit_log_timestamp   ON audit_log(timestamp);

CREATE INDEX idx_wo_status     ON managed_work_orders(status);
CREATE INDEX idx_wo_plant_id   ON managed_work_orders(plant_id);
CREATE INDEX idx_wo_wo_number  ON managed_work_orders(wo_number);
CREATE INDEX idx_wo_priority   ON managed_work_orders(priority_code);

CREATE INDEX idx_wr_status     ON work_requests(status);
CREATE INDEX idx_wr_equipment  ON work_requests(equipment_id);

CREATE INDEX idx_hierarchy_node_type ON hierarchy_nodes(node_type);
CREATE INDEX idx_hierarchy_tag       ON hierarchy_nodes(tag);
CREATE INDEX idx_hierarchy_plant_id  ON hierarchy_nodes(plant_id);

CREATE INDEX idx_preparativos_wo_id  ON preparativos_ot(wo_id);
CREATE INDEX idx_preparativos_status ON preparativos_ot(status);
```

---

## 13. State machines

### 13.1 WorkRequest status

| Estado | Siguiente | Transición |
|--------|-----------|------------|
| DRAFT | APROBADO | supervisor valida con action=APPROVE |
| DRAFT | RECHAZADO | supervisor valida con action=REJECT (terminal) |
| APROBADO | LINKED | cuando se crea OT from-wr |

### 13.2 ManagedWorkOrder status (SF-578 cadena)

| Estado | Siguientes válidos | Endpoint dedicado |
|--------|--------------------|--------------------|
| CREADO | LIBERADO, PROGRAMADO (fast-track P1/P2) | `/draft`, `/release` |
| LIBERADO | PLANIFICADO | `/plan` |
| PLANIFICADO | EN_PROGRAMACION | PUT generic |
| EN_PROGRAMACION | PROGRAMADO | `/schedule` |
| PROGRAMADO | EN_EJECUCION, REPROGRAMADO | `/start`, `/reschedule` |
| REPROGRAMADO | PROGRAMADO | `/schedule` |
| EN_EJECUCION | CERRADO, REPROGRAMADO | `/close`, `/reschedule` |
| CERRADO | (terminal) | — |
| CANCELADO | (terminal) | `/cancel` |

### 13.3 Preparativos OT status (SF-662)

| Estado | Siguientes | Requisitos |
|--------|-----------|------------|
| PENDIENTE | DESPACHADO | — |
| DESPACHADO | EN_TRANSITO, ANOMALIA | — |
| EN_TRANSITO | RECIBIDO, ANOMALIA | conforme obligatorio al recibir |
| RECIBIDO | (terminal) | — |
| ANOMALIA | DESPACHADO | reintento |

---

## 14. Compatibilidad SAP PM

### 14.1 work_requests → Aviso IH01

| Campo AMS | Campo SAP | Significado |
|-----------|-----------|-------------|
| `aviso_coding` | QMART (10) | Tipo aviso (M001-M005, P001-P003) |
| `notification_type` | QMNUM tipo | A1=Aviso Mantto |
| `planning_group` | INGRP (10) | Grupo planificación |
| `work_center` | ARBPL (20) | Puesto de trabajo |
| `technical_location` | TPLNR (100) | Ubicación técnica |
| `area_empresa` | ABCKZ (10) | Indicador ABC empresa |
| `reported_by` | QMNAM | Autor del aviso |
| `circumstances` | LTXT | Texto largo descripción |

### 14.2 managed_work_orders → Orden IW21

| Campo AMS | Campo SAP | Significado |
|-----------|-----------|-------------|
| `wo_number` | AUFNR | Número de orden |
| `wo_type` | AUART | Clase de orden (PM01/02/03) |
| `priority_code` | PRIOK | Prioridad |
| `equipment_id` | EQUNR | Número de equipo |
| `planned_start / planned_end` | GSTRP / GLTRP | Fechas plan |
| `actual_start / actual_end` | GSTRI / GLTRI | Fechas real |

Mapping completo en `sap_mock/data/avisos_campos_blueprint.xlsx`.

---

## 15. Operaciones administrativas

### Auto-creación (sin Alembic todavía)
```python
# api/main.py
from api.database.connection import Base, engine
Base.metadata.create_all(engine)  # crea tablas faltantes al boot
```

### Backup recomendado
```bash
# SQLite backup atómico (lockless)
sqlite3 data/ocp_maintenance.db ".backup data/backup_$(date +%Y-%m-%d).db"
```

### Limpiar audit > 5 años
```bash
python scripts/purge_audit_log_5y.py --dry-run                   # ver qué borraría
python scripts/purge_audit_log_5y.py --confirm --export-csv X.csv
```

### Re-indexar RAG (LanceDB separado de SQLite)
```bash
python scripts/reindex_rag.py
```

---

## 16. Tablas que faltan (SP8+)

- `cost_centers` (0E tanda) — opex/capex por CeCo
- `expense_classes` (0E) — clases de gasto SAP
- `failure_symptom_catalog` (SAP-style) — síntomas codificados
- `failure_cause_catalog` (SAP-style) — causas codificadas
- `wrench_time_observations` — KPI tradicional
- `training_records` — horas capacitación
- `safety_incidents` — integración HSE
- `equipment_telemetry` — futuro SCADA real

---

## 17. Diferencias `work_orders` (legacy) vs `managed_work_orders`

| Aspecto | `work_orders` (Fase 1) | `managed_work_orders` (actual) |
|---------|------------------------|--------------------------------|
| Uso | Legacy, sin lifecycle complejo | OT principal SAP-PM completo |
| Campos | Mínimos (8) | 55+ campos + JSON embedded |
| Lifecycle | Solo created / closed | 7 estados con transiciones validadas |
| Auditoría | No | Full audit_log integration |
| Fast-track | No | P1/P2 bypass planning |
| Closure gates | No | 6 pre-close gates SF-570 |
| **Recomendación** | **Deprecar** en SP9 | Único modelo a usar |

---

**Total: 67 tablas · 562 endpoints · SQLite single-file ~50MB en producción**

**Commit:** `cd83670`
