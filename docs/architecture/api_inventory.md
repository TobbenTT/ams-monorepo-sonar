# API Inventory por Rol

Total endpoints: **548**


## (autenticado) ((autenticado)) — 531 endpoints


### `admin.py` (16)

| Método | Endpoint |
|---|---|
| `POST` | `/admin/seed-database` |
| `POST` | `/admin/seed-demo-plant` |
| `GET` | `/admin/audit-log` |
| `GET` | `/admin/stats` |
| `DELETE` | `/admin/reset-database` |
| `GET` | `/admin/agent-status` |
| `GET` | `/admin/settings` |
| `PUT` | `/admin/settings` |
| `POST` | `/admin/test-email` |
| `GET` | `/admin/email-status` |
| `GET` | `/admin/export-data` |
| `GET` | `/admin/import-sources` |
| `POST` | `/admin/feedback` |
| `GET` | `/admin/ws/connections` |
| `GET` | `/admin/ws/audit` |
| `GET` | `/admin/feedback` |

### `agentic.py` (59)

| Método | Endpoint |
|---|---|
| `GET` | `/agentic/status` |
| `GET` | `/agentic/cost-summary` |
| `POST` | `/agentic/voice-capture` |
| `POST` | `/agentic/auto-schedule` |
| `POST` | `/agentic/equipment-doctor` |
| `POST` | `/agentic/smart-backlog` |
| `GET` | `/agentic/smart-backlog/alerts` |
| `POST` | `/agentic/safety-checklist` |
| `POST` | `/agentic/kpi-watchdog` |
| `GET` | `/agentic/kpi-watchdog/alerts` |
| `POST` | `/agentic/executive-report` |
| `POST` | `/agentic/executive-report/pptx` |
| `POST` | `/agentic/chronic-failures` |
| `GET` | `/agentic/chronic-failures/active` |
| `POST` | `/agentic/material-readiness` |
| `GET` | `/agentic/material-readiness/report/{program_id}` |
| `POST` | `/agentic/rcm-advisor` |
| `POST` | `/agentic/shift-handover` |
| `POST` | `/agentic/sap-sync` |
| `POST` | `/agentic/budget-sentinel` |
| `POST` | `/agentic/post-learning` |
| `POST` | `/agentic/route-wr` |
| `POST` | `/agentic/defect-tracker` |
| `POST` | `/agentic/predictive-health` |
| `POST` | `/agentic/shutdown-optimizer` |
| `POST` | `/agentic/duplicate-check` |
| `POST` | `/agentic/sap-sync/queue` |
| `GET` | `/agentic/sap-sync/queue` |
| `GET` | `/agentic/sap-sync/health` |
| `POST` | `/agentic/cost-analysis` |
| `POST` | `/agentic/stock-forecast` |
| `POST` | `/agentic/auto-trigger-rca` |
| `POST` | `/agentic/duplicate-dismiss` |
| `POST` | `/agentic/planner-autofill` |
| `POST` | `/agentic/compliance-watchdog` |
| `POST` | `/agentic/digital-twin` |
| `POST` | `/agentic/knowledge-curator` |
| `POST` | `/agentic/spare-parts-forecast` |
| `POST` | `/agentic/contractor-performance` |
| `POST` | `/agentic/energy-monitor` |
| `POST` | `/agentic/multi-site-benchmark` |
| `POST` | `/agentic/auto-rca` |
| `POST` | `/visual-troubleshooting` |
| `POST` | `/wo-visual-verify` |
| `POST` | `/3d-comparison` |
| `POST` | `/ppe-detection` |
| `POST` | `/spare-part-id` |
| `POST` | `/nameplate-ocr` |
| `POST` | `/pid-digitize` |
| `POST` | `/loto-verification` |
| `POST` | `/audio-fault-detection` |
| `POST` | `/drone-inspection` |
| `POST` | `/training-scenario` |
| `POST` | `/edge-sync/register` |
| `POST` | `/edge-sync/push` |
| `GET` | `/edge-sync/status/{device_id}` |
| `GET` | `/edge-devices` |
| `GET` | `/ollama/health` |
| `GET` | `/ollama/models` |

### `ai_agents.py` (15)

| Método | Endpoint |
|---|---|
| `GET` | `/ai/status` |
| `POST` | `/ai/sessions` |
| `GET` | `/ai/sessions` |
| `GET` | `/ai/sessions/{session_id}` |
| `POST` | `/ai/sessions/{session_id}/advance` |
| `POST` | `/ai/sessions/{session_id}/milestone/{milestone_num}/action` |
| `POST` | `/ai/troubleshoot` |
| `GET` | `/ai/troubleshoot` |
| `POST` | `/ai/checklists` |
| `GET` | `/ai/checklists/{checklist_id}` |
| `PUT` | `/ai/checklists/{checklist_id}/items` |
| `POST` | `/ai/tools/call` |
| `GET` | `/ai/tools` |
| `POST` | `/ai/equipment-chat` |
| `POST` | `/ai/suggest-failure` |

### `analytics.py` (13)

| Método | Endpoint |
|---|---|
| `POST` | `/analytics/health-score` |
| `POST` | `/analytics/kpis` |
| `POST` | `/analytics/weibull-fit` |
| `POST` | `/analytics/weibull-predict` |
| `POST` | `/analytics/variance-detect` |
| `POST` | `/analytics/import-jigsaw-excel` |
| `POST` | `/analytics/classify-noncompliance` |
| `POST` | `/analytics/chronic-failures-analyze` |
| `POST` | `/analytics/stock-oc-recommend` |
| `GET` | `/analytics/variance-alerts` |
| `GET` | `/analytics/asset-health` |
| `GET` | `/analytics/page-data/{plant_id}` |
| `POST` | `/analytics/recalculate` |

### `analytics_dashboards.py` (14)

| Método | Endpoint |
|---|---|
| `GET` | `/analytics-dash/mtbf-mttr/timeseries` |
| `GET` | `/analytics-dash/pm-compliance` |
| `GET` | `/analytics-dash/backlog-aging` |
| `GET` | `/analytics-dash/cost-per-equipment` |
| `GET` | `/analytics-dash/adherence-compliance` |
| `GET` | `/analytics-dash/program-compliance` |
| `GET` | `/analytics-dash/program-adherence` |
| `GET` | `/analytics-dash/backlog-alerts` |
| `GET` | `/analytics-dash/cycle-times` |
| `GET` | `/analytics-dash/reliability-correlation` |
| `GET` | `/analytics-dash/rework-detection` |
| `GET` | `/analytics-dash/cost-breakdown` |
| `POST` | `/analytics-dash/reschedule-stale` |
| `GET` | `/analytics-dash/summary` |

### `assignments.py` (7)

| Método | Endpoint |
|---|---|
| `POST` | `/assignments/import-team-excel` |
| `GET` | `/assignments/technicians` |
| `POST` | `/assignments/rank-for-operation` |
| `POST` | `/assignments/optimize` |
| `POST` | `/assignments/reoptimize` |
| `POST` | `/assignments/summary` |
| `PATCH` | `/assignments/technicians/{worker_id}` |

### `auth.py` (6)

| Método | Endpoint |
|---|---|
| `POST` | `/auth/login` |
| `POST` | `/auth/logout` |
| `POST` | `/auth/refresh` |
| `GET` | `/auth/me` |
| `PUT` | `/auth/me` |
| `PUT` | `/auth/change-password` |

### `backlog.py` (6)

| Método | Endpoint |
|---|---|
| `GET` | `/backlog/` |
| `POST` | `/backlog/add/{work_request_id}` |
| `POST` | `/backlog/optimize` |
| `GET` | `/backlog/optimizations/{optimization_id}` |
| `PUT` | `/backlog/optimizations/{optimization_id}/approve` |
| `GET` | `/backlog/schedule` |

### `capture.py` (4)

| Método | Endpoint |
|---|---|
| `POST` | `/capture/` |
| `GET` | `/capture/` |
| `DELETE` | `/capture/{capture_id}` |
| `GET` | `/capture/{capture_id}` |

### `capture_geo.py` (1)

| Método | Endpoint |
|---|---|
| `GET` | `/geo/nearby` |

### `catalogs.py` (6)

| Método | Endpoint |
|---|---|
| `GET` | `/catalogs/failure-categories` |
| `GET` | `/catalogs/failure-profiles` |
| `GET` | `/catalogs/failure-profile/{code}` |
| `GET` | `/catalogs/equipment-types` |
| `GET` | `/catalogs/taxonomy` |
| `GET` | `/catalogs/criticality` |

### `contractors.py` (5)

| Método | Endpoint |
|---|---|
| `GET` | `/contractors/` |
| `POST` | `/contractors/` |
| `GET` | `/contractors/{contractor_id}/crews` |
| `POST` | `/contractors/{contractor_id}/crews` |
| `GET` | `/contractors/crews/all` |

### `criticality.py` (5)

| Método | Endpoint |
|---|---|
| `GET` | `/criticality/by-plant` |
| `POST` | `/criticality/assess` |
| `GET` | `/criticality/{node_id}` |
| `PUT` | `/criticality/{assessment_id}/approve` |
| `POST` | `/criticality/risk-class` |

### `dashboard.py` (4)

| Método | Endpoint |
|---|---|
| `GET` | `/dashboard/executive/{plant_id}` |
| `GET` | `/dashboard/kpi-summary/{plant_id}` |
| `GET` | `/dashboard/alerts/{plant_id}` |
| `GET` | `/dashboard/work-management-kpis/{plant_id}` |

### `data_import.py` (6)

| Método | Endpoint |
|---|---|
| `GET` | `/data-import/tables` |
| `POST` | `/data-import/upload` |
| `POST` | `/data-import/execute` |
| `GET` | `/data-import/history` |
| `GET` | `/data-import/templates` |
| `POST` | `/data-import/ai-analyze` |

### `deliverables.py` (9)

| Método | Endpoint |
|---|---|
| `POST` | `/deliverables/` |
| `GET` | `/deliverables/` |
| `GET` | `/deliverables/summary/{client_slug}/{project_slug}` |
| `GET` | `/deliverables/{deliverable_id}` |
| `PUT` | `/deliverables/{deliverable_id}` |
| `PUT` | `/deliverables/{deliverable_id}/transition` |
| `POST` | `/deliverables/{deliverable_id}/time-log` |
| `GET` | `/deliverables/{deliverable_id}/time-logs` |
| `POST` | `/deliverables/seed-from-plan` |

### `dms.py` (2)

| Método | Endpoint |
|---|---|
| `GET` | `/dms/documents` |
| `GET` | `/dms/documents/{document_number}` |

### `execution.py` (11)

| Método | Endpoint |
|---|---|
| `POST` | `/execution/auto-generate-tasks` |
| `POST` | `/execution/tasks` |
| `GET` | `/execution/my-tasks` |
| `GET` | `/execution/tasks` |
| `GET` | `/execution/tasks/{task_id}` |
| `PUT` | `/execution/tasks/{task_id}/progress` |
| `POST` | `/execution/tasks/{task_id}/partial` |
| `PUT` | `/execution/tasks/{task_id}/complete` |
| `PUT` | `/execution/tasks/{task_id}/confirm-understood` |
| `POST` | `/execution/handovers` |
| `GET` | `/execution/handovers` |

### `execution_checklists.py` (8)

| Método | Endpoint |
|---|---|
| `POST` | `/execution-checklists/` |
| `GET` | `/execution-checklists/` |
| `GET` | `/execution-checklists/{checklist_id}` |
| `POST` | `/execution-checklists/{checklist_id}/steps/{step_id}/complete` |
| `POST` | `/execution-checklists/{checklist_id}/steps/{step_id}/skip` |
| `GET` | `/execution-checklists/{checklist_id}/next-steps` |
| `PATCH` | `/execution-checklists/{checklist_id}` |
| `POST` | `/execution-checklists/{checklist_id}/close` |

### `expert_knowledge.py` (16)

| Método | Endpoint |
|---|---|
| `POST` | `/expert-knowledge/consultations` |
| `GET` | `/expert-knowledge/consultations/{consultation_id}` |
| `GET` | `/expert-knowledge/consultations` |
| `PUT` | `/expert-knowledge/consultations/{consultation_id}/view` |
| `PUT` | `/expert-knowledge/consultations/{consultation_id}/respond` |
| `PUT` | `/expert-knowledge/consultations/{consultation_id}/close` |
| `GET` | `/expert-knowledge/portal/{token}` |
| `POST` | `/expert-knowledge/contributions` |
| `GET` | `/expert-knowledge/contributions` |
| `PUT` | `/expert-knowledge/contributions/{contribution_id}/validate` |
| `PUT` | `/expert-knowledge/contributions/{contribution_id}/promote` |
| `GET` | `/expert-knowledge/experts` |
| `POST` | `/expert-knowledge/experts` |
| `GET` | `/expert-knowledge/experts/{expert_id}/compensation` |
| `GET` | `/expert-knowledge/notifications/{recipient_id}` |
| `PUT` | `/expert-knowledge/notifications/{notification_id}/read` |

### `feedback.py` (7)

| Método | Endpoint |
|---|---|
| `GET` | `/feedback/files/{filename}` |
| `POST` | `/feedback/` |
| `POST` | `/feedback/{feedback_id}/attachments` |
| `GET` | `/feedback/` |
| `GET` | `/feedback/{feedback_id}` |
| `PUT` | `/feedback/{feedback_id}` |
| `GET` | `/feedback/export/json` |

### `financial.py` (15)

| Método | Endpoint |
|---|---|
| `GET` | `/financial/summary` |
| `GET` | `/financial/monthly-trend` |
| `GET` | `/financial/cost-by-area` |
| `GET` | `/financial/maintenance-costs` |
| `GET` | `/financial/capex-projects` |
| `GET` | `/financial/kpis` |
| `GET` | `/financial/equipment-costs` |
| `POST` | `/financial/roi` |
| `POST` | `/financial/roi/compare` |
| `POST` | `/financial/budget/track` |
| `POST` | `/financial/budget/alerts` |
| `GET` | `/financial/budget-status` |
| `POST` | `/financial/impact` |
| `POST` | `/financial/man-hours` |
| `POST` | `/financial/budget/forecast` |

### `fmea.py` (24)

| Método | Endpoint |
|---|---|
| `POST` | `/fmea/failure-modes` |
| `GET` | `/fmea/failure-modes/{fm_id}` |
| `GET` | `/fmea/failure-modes` |
| `GET` | `/fmea/validate-fm` |
| `GET` | `/fmea/fm-combinations` |
| `POST` | `/fmea/rcm-decide` |
| `GET` | `/fmea/functions` |
| `POST` | `/fmea/functions` |
| `GET` | `/fmea/functional-failures` |
| `POST` | `/fmea/functional-failures` |
| `GET` | `/fmea/fmeca/worksheets` |
| `GET` | `/fmea/fmeca/worksheets-summary` |
| `GET` | `/fmea/fmeca/suggestions` |
| `GET` | `/fmea/fmeca/history-hints` |
| `POST` | `/fmea/fmeca/worksheets` |
| `GET` | `/fmea/fmeca/worksheets/{worksheet_id}` |
| `POST` | `/fmea/fmeca/worksheets/{worksheet_id}/rows` |
| `POST` | `/fmea/fmeca/rpn` |
| `PUT` | `/fmea/fmeca/worksheets/{worksheet_id}/run-decisions` |
| `POST` | `/fmea/fmeca/worksheets/{worksheet_id}/generate-tasks` |
| `POST` | `/fmea/fmeca/worksheets/{worksheet_id}/push-to-backlog` |
| `GET` | `/fmea/analytics/adherence-compliance` |
| `GET` | `/fmea/strategy/pm02-calendar` |
| `GET` | `/fmea/fmeca/worksheets/{worksheet_id}/summary` |

### `hierarchy.py` (8)

| Método | Endpoint |
|---|---|
| `GET` | `/hierarchy/plants` |
| `POST` | `/hierarchy/plants` |
| `GET` | `/hierarchy/nodes` |
| `POST` | `/hierarchy/nodes` |
| `GET` | `/hierarchy/nodes/{node_id}` |
| `GET` | `/hierarchy/nodes/{node_id}/tree` |
| `POST` | `/hierarchy/build-from-vendor` |
| `GET` | `/hierarchy/stats` |

### `imports.py` (3)

| Método | Endpoint |
|---|---|
| `POST` | `/imports/upload` |
| `GET` | `/imports/history` |
| `GET` | `/imports/sources` |

### `improvement_actions.py` (7)

| Método | Endpoint |
|---|---|
| `GET` | `/improvement-actions/` |
| `GET` | `/improvement-actions/summary` |
| `GET` | `/improvement-actions/{action_id}` |
| `POST` | `/improvement-actions/` |
| `PUT` | `/improvement-actions/{action_id}` |
| `DELETE` | `/improvement-actions/{action_id}` |
| `POST` | `/improvement-actions/analyze-deviations` |

### `managed_work_orders.py` (31)

| Método | Endpoint |
|---|---|
| `POST` | `/managed-work-orders/` |
| `POST` | `/managed-work-orders/from-wr` |
| `GET` | `/managed-work-orders/` |
| `GET` | `/managed-work-orders/stats` |
| `GET` | `/managed-work-orders/{wo_id}/impact-score` |
| `GET` | `/managed-work-orders/{wo_id}` |
| `PUT` | `/managed-work-orders/{wo_id}` |
| `PUT` | `/managed-work-orders/{wo_id}/draft` |
| `PUT` | `/managed-work-orders/{wo_id}/plan` |
| `PUT` | `/managed-work-orders/{wo_id}/release` |
| `PUT` | `/managed-work-orders/{wo_id}/schedule` |
| `PUT` | `/managed-work-orders/{wo_id}/reschedule` |
| `PUT` | `/managed-work-orders/{wo_id}/start` |
| `PUT` | `/managed-work-orders/{wo_id}/complete` |
| `PUT` | `/managed-work-orders/{wo_id}/close` |
| `GET` | `/managed-work-orders/{wo_id}/close-gates` |
| `POST` | `/managed-work-orders/{wo_id}/sap-sync` |
| `GET` | `/managed-work-orders/{wo_id}/sap-sync` |
| `POST` | `/managed-work-orders/{wo_id}/post-review` |
| `GET` | `/managed-work-orders/{wo_id}/history` |
| `POST` | `/managed-work-orders/bulk-status` |
| `POST` | `/managed-work-orders/{wo_id}/notes` |
| `PUT` | `/managed-work-orders/{wo_id}/progress` |
| `POST` | `/managed-work-orders/{wo_id}/notify-partial` |
| `GET` | `/managed-work-orders/{wo_id}/absorbed` |
| `PUT` | `/managed-work-orders/{wo_id}/support-equipment` |
| `PUT` | `/managed-work-orders/{wo_id}/cancel` |
| `DELETE` | `/managed-work-orders/{wo_id}` |
| `POST` | `/managed-work-orders/{wo_id}/verify-close` |
| `POST` | `/managed-work-orders/{wo_id}/ai-estimate` |
| `GET` | `/managed-work-orders/{wo_id}/closure-report` |

### `media.py` (2)

| Método | Endpoint |
|---|---|
| `POST` | `/media/transcribe` |
| `POST` | `/media/analyze-image` |

### `mfa.py` (5)

| Método | Endpoint |
|---|---|
| `GET` | `/mfa/status` |
| `POST` | `/mfa/enroll` |
| `POST` | `/mfa/confirm` |
| `POST` | `/mfa/verify` |
| `DELETE` | `/mfa/disable` |

### `notifications.py` (4)

| Método | Endpoint |
|---|---|
| `GET` | `/notifications/` |
| `GET` | `/notifications/unread-count` |
| `PUT` | `/notifications/{notification_id}/read` |
| `PUT` | `/notifications/read-all` |

### `or_projects.py` (8)

| Método | Endpoint |
|---|---|
| `POST` | `/or/projects` |
| `GET` | `/or/projects` |
| `GET` | `/or/projects/{project_id}` |
| `PUT` | `/or/projects/{project_id}` |
| `POST` | `/or/projects/{project_id}/advance-gate` |
| `GET` | `/or/projects/{project_id}/deliverables` |
| `GET` | `/or/deliverables` |
| `GET` | `/or/deliverables/{deliverable_id}/download` |

### `planificador_agent.py` (1)

| Método | Endpoint |
|---|---|
| `POST` | `/planificador-agent/analyze-wo` |

### `planner.py` (3)

| Método | Endpoint |
|---|---|
| `POST` | `/planner/recommend/{work_request_id}` |
| `GET` | `/planner/recommendations/{recommendation_id}` |
| `PUT` | `/planner/recommendations/{recommendation_id}/action` |

### `post_maintenance.py` (6)

| Método | Endpoint |
|---|---|
| `POST` | `/post-maintenance/reviews` |
| `GET` | `/post-maintenance/reviews` |
| `GET` | `/post-maintenance/reviews/{review_id}` |
| `PUT` | `/post-maintenance/reviews/{review_id}` |
| `PUT` | `/post-maintenance/reviews/{review_id}/complete` |
| `GET` | `/post-maintenance/analysis` |

### `programmer_agent.py` (2)

| Método | Endpoint |
|---|---|
| `GET` | `/programmer-agent/equipment-availability` |
| `GET` | `/programmer-agent/weekly-report` |

### `rag.py` (7)

| Método | Endpoint |
|---|---|
| `POST` | `/rag/ingest` |
| `GET` | `/rag/stats` |
| `POST` | `/rag/search` |
| `POST` | `/rag/rcm-strategy` |
| `POST` | `/rag/shift-handover` |
| `POST` | `/rag/post-maint-learn` |
| `POST` | `/rag/kb-curator` |

### `rca.py` (13)

| Método | Endpoint |
|---|---|
| `POST` | `/rca/analyses` |
| `GET` | `/rca/analyses` |
| `GET` | `/rca/analyses/summary` |
| `GET` | `/rca/analyses/{analysis_id}` |
| `PUT` | `/rca/analyses/{analysis_id}` |
| `POST` | `/rca/analyses/{analysis_id}/5w2h` |
| `PUT` | `/rca/analyses/{analysis_id}/advance` |
| `POST` | `/rca/analyses/{analysis_id}/push-to-capa` |
| `POST` | `/rca/analyses/{analysis_id}/push-to-fmeca` |
| `POST` | `/rca/planning-kpis/calculate` |
| `GET` | `/rca/planning-kpis` |
| `POST` | `/rca/de-kpis/calculate` |
| `GET` | `/rca/de-kpis` |

### `reliability.py` (15)

| Método | Endpoint |
|---|---|
| `POST` | `/reliability/spare-parts/analyze` |
| `GET` | `/reliability/shutdowns` |
| `POST` | `/reliability/shutdowns` |
| `GET` | `/reliability/shutdowns/{shutdown_id}` |
| `PUT` | `/reliability/shutdowns/{shutdown_id}/start` |
| `PUT` | `/reliability/shutdowns/{shutdown_id}/complete` |
| `POST` | `/reliability/moc` |
| `GET` | `/reliability/mocs` |
| `GET` | `/reliability/moc/{moc_id}` |
| `PUT` | `/reliability/moc/{moc_id}/advance` |
| `POST` | `/reliability/ocr/analyze` |
| `POST` | `/reliability/jackknife/analyze` |
| `POST` | `/reliability/pareto/analyze` |
| `POST` | `/reliability/lcc/calculate` |
| `POST` | `/reliability/rbi/assess` |

### `reporting.py` (14)

| Método | Endpoint |
|---|---|
| `POST` | `/reporting/reports/weekly` |
| `POST` | `/reporting/reports/monthly` |
| `POST` | `/reporting/reports/quarterly` |
| `GET` | `/reporting/reports` |
| `GET` | `/reporting/reports/{report_id}` |
| `POST` | `/reporting/de-kpis/calculate` |
| `POST` | `/reporting/de-kpis/program-health` |
| `POST` | `/reporting/notifications/generate` |
| `GET` | `/reporting/notifications` |
| `PUT` | `/reporting/notifications/{notification_id}/ack` |
| `POST` | `/reporting/import/validate` |
| `POST` | `/reporting/export` |
| `POST` | `/reporting/cross-module/analyze` |
| `GET` | `/reporting/generate-report` |

### `reports_export.py` (4)

| Método | Endpoint |
|---|---|
| `GET` | `/reports-export/weekly-schedule.xlsx` |
| `GET` | `/reports-export/wos-closed.xlsx` |
| `GET` | `/reports-export/kpi-summary.xlsx` |
| `GET` | `/reports-export/weekly-digest` |

### `sales.py` (1)

| Método | Endpoint |
|---|---|
| `POST` | `/sales/contact` |

### `sap.py` (6)

| Método | Endpoint |
|---|---|
| `POST` | `/sap/generate-upload` |
| `GET` | `/sap/uploads/{package_id}` |
| `GET` | `/sap/uploads` |
| `PUT` | `/sap/uploads/{package_id}/approve` |
| `POST` | `/sap/validate-transition` |
| `GET` | `/sap/mock/{transaction}` |

### `sap_pm.py` (11)

| Método | Endpoint |
|---|---|
| `GET` | `/sap-pm/maintenance-plans` |
| `GET` | `/sap-pm/maintenance-plans/{plan_id}` |
| `GET` | `/sap-pm/bom/{equipment_tag}` |
| `GET` | `/sap-pm/measuring-points` |
| `GET` | `/sap-pm/measuring-points/{point_id}/readings` |
| `GET` | `/sap-pm/permits` |
| `GET` | `/sap-pm/purchase-reqs` |
| `GET` | `/sap-pm/purchase-requisitions` |
| `GET` | `/sap-pm/cost-centers` |
| `GET` | `/sap-pm/settlement-rules` |
| `GET` | `/sap-pm/inventory` |

### `scheduling.py` (20)

| Método | Endpoint |
|---|---|
| `POST` | `/scheduling/programs` |
| `GET` | `/scheduling/programs` |
| `GET` | `/scheduling/programs/{program_id}` |
| `PUT` | `/scheduling/programs/{program_id}/publish` |
| `GET` | `/scheduling/programs/{program_id}/material-check` |
| `GET` | `/scheduling/programs/{program_id}/hh-balance` |
| `GET` | `/scheduling/hh-balance-live` |
| `GET` | `/scheduling/materials-live` |
| `PUT` | `/scheduling/materials/{wo_id}/collection-status` |
| `PUT` | `/scheduling/materials/{wo_id}/bulk-status` |
| `POST` | `/scheduling/clear-week` |
| `GET` | `/scheduling/support-equipment` |
| `PUT` | `/scheduling/workforce/{worker_id}/availability` |
| `GET` | `/scheduling/gantt` |
| `GET` | `/scheduling/programs/{program_id}/gantt` |
| `GET` | `/scheduling/programs/{program_id}/gantt/export` |
| `POST` | `/scheduling/shift-continuity-plan` |
| `POST` | `/scheduling/ai-auto-schedule` |
| `POST` | `/scheduling/ai-daily-briefing` |
| `POST` | `/scheduling/parse-autolevel-instructions` |

### `security.py` (1)

| Método | Endpoint |
|---|---|
| `GET` | `/security/compliance-status` |

### `sprint6_scaffolds.py` (30)

| Método | Endpoint |
|---|---|
| `GET` | `/sprint6/unscheduled-work` |
| `GET` | `/sprint6/supervisor-board` |
| `GET` | `/sprint6/smart-assignment-suggest/{wo_id}` |
| `GET` | `/sprint6/critical-backlog-audit` |
| `GET` | `/sprint6/chronic-failures` |
| `GET` | `/sprint6/ot-discrepancies` |
| `GET` | `/sprint6/noncompliance-categorize` |
| `GET` | `/sprint6/skills-gaps` |
| `GET` | `/sprint6/stockout-predict` |
| `GET` | `/sprint6/erp-sync/status` |
| `GET` | `/sprint6/digital-checklists/templates` |
| `GET` | `/sprint6/auto-assign-resources` |
| `GET` | `/sprint6/work-documents/{wo_id}` |
| `GET` | `/sprint6/support-equipment-catalog` |
| `GET` | `/sprint6/inactive-resources` |
| `GET` | `/sprint6/equipment-autocomplete` |
| `GET` | `/sprint6/ai-feedback/stats` |
| `GET` | `/sprint6/ops-schedule/{wo_id}` |
| `GET` | `/sprint6/skills-inference/{wo_id}` |
| `GET` | `/sprint6/stock-check/{wo_id}` |
| `GET` | `/sprint6/canonical-data-status` |
| `GET` | `/sprint6/canonical/materials-search` |
| `POST` | `/sprint6/auto-generate-wo/{request_id}` |
| `GET` | `/sprint6/workforce-profiles` |
| `GET` | `/sprint6/ai-job-standard/{wo_id}` |
| `GET` | `/sprint6/workstation-expandable/{wo_id}` |
| `GET` | `/sprint6/resources-internal-external` |
| `GET` | `/sprint6/calendar-by-hour` |
| `GET` | `/sprint6/stress-test/baseline` |
| `GET` | `/sprint6/parallel-duration/{wo_id}` |

### `supervisor_agent.py` (2)

| Método | Endpoint |
|---|---|
| `POST` | `/supervisor-agent/shift-start-readiness` |
| `POST` | `/supervisor-agent/production-vs-program` |

### `sync.py` (3)

| Método | Endpoint |
|---|---|
| `POST` | `/sync/pull` |
| `POST` | `/sync/push` |
| `POST` | `/sync/resolve` |

### `tasks.py` (6)

| Método | Endpoint |
|---|---|
| `POST` | `/tasks/` |
| `GET` | `/tasks/{task_id}` |
| `GET` | `/tasks/` |
| `POST` | `/tasks/link-fm/{task_id}/{fm_id}` |
| `POST` | `/tasks/validate-name` |
| `POST` | `/tasks/validate-wp-name` |

### `transcribe.py` (1)

| Método | Endpoint |
|---|---|
| `POST` | `/transcribe/audio` |

### `troubleshooting.py` (10)

| Método | Endpoint |
|---|---|
| `GET` | `/troubleshooting/sessions` |
| `POST` | `/troubleshooting/sessions` |
| `GET` | `/troubleshooting/sessions/{session_id}` |
| `POST` | `/troubleshooting/sessions/{session_id}/symptoms` |
| `GET` | `/troubleshooting/sessions/{session_id}/tests` |
| `POST` | `/troubleshooting/sessions/{session_id}/tests` |
| `PUT` | `/troubleshooting/sessions/{session_id}/finalize` |
| `PUT` | `/troubleshooting/sessions/{session_id}/feedback` |
| `GET` | `/troubleshooting/equipment/{equipment_type_id}/symptoms` |
| `GET` | `/troubleshooting/equipment/{equipment_type_id}/tree` |

### `work_packages.py` (6)

| Método | Endpoint |
|---|---|
| `POST` | `/work-packages/` |
| `GET` | `/work-packages/{wp_id}` |
| `GET` | `/work-packages/` |
| `PUT` | `/work-packages/{wp_id}/approve` |
| `POST` | `/work-packages/group` |
| `POST` | `/work-packages/{wp_id}/work-instruction` |

### `work_requests.py` (38)

| Método | Endpoint |
|---|---|
| `GET` | `/work-requests/search-materials` |
| `GET` | `/work-requests/equipment-history/{equipment_tag}` |
| `GET` | `/work-requests/` |
| `GET` | `/work-requests/tools/deleted` |
| `GET` | `/work-requests/tools/ai-summary` |
| `GET` | `/work-requests/tools/ai-predict-failures` |
| `GET` | `/work-requests/{request_id}/impact-score` |
| `GET` | `/work-requests/{request_id}` |
| `PUT` | `/work-requests/{request_id}/validate` |
| `POST` | `/work-requests/{request_id}/convert-to-pm03` |
| `PUT` | `/work-requests/{request_id}/link-duplicate` |
| `PUT` | `/work-requests/{request_id}/cancel` |
| `PUT` | `/work-requests/{request_id}/start` |
| `PUT` | `/work-requests/{request_id}/complete` |
| `PUT` | `/work-requests/{request_id}/close` |
| `PUT` | `/work-requests/{request_id}/reopen` |
| `PUT` | `/work-requests/{request_id}` |
| `DELETE` | `/work-requests/{request_id}` |
| `GET` | `/work-requests/tools/deleted` |
| `POST` | `/work-requests/tools/restore/{request_id}` |
| `DELETE` | `/work-requests/tools/permanent/{request_id}` |
| `POST` | `/work-requests/{request_id}/classify` |
| `POST` | `/work-requests/{request_id}/ai-priority-decision` |
| `POST` | `/work-requests/check-duplicates` |
| `POST` | `/work-requests/ai-assist-image` |
| `POST` | `/work-requests/ai-assist` |
| `POST` | `/work-requests/{request_id}/feedback` |
| `GET` | `/work-requests/tools/ai-feedback-stats` |
| `GET` | `/work-requests/tools/ai-summary` |
| `POST` | `/work-requests/ai-verify-close/{wo_id}` |
| `GET` | `/work-requests/tools/ai-predict-failures` |
| `POST` | `/work-requests/ai-suggest-schedule` |
| `GET` | `/work-requests/tools/work-centers` |
| `GET` | `/work-requests/tools/capacity-evaluation` |
| `POST` | `/work-requests/manual` |
| `POST` | `/work-requests/from-hierarchy` |
| `GET` | `/work-requests/{wr_id}/criticality-score` |
| `POST` | `/work-requests/ocr-closure` |

### `workflow.py` (4)

| Método | Endpoint |
|---|---|
| `POST` | `/workflow/run` |
| `GET` | `/workflow/sessions` |
| `GET` | `/workflow/{session_id}` |
| `POST` | `/workflow/{session_id}/approve` |

## Administrador (admin) — 17 endpoints


### `auth.py` (6)

| Método | Endpoint |
|---|---|
| `POST` | `/auth/register` |
| `GET` | `/auth/users` |
| `PUT` | `/auth/users/{user_id}` |
| `PUT` | `/auth/users/{user_id}/role` |
| `PUT` | `/auth/users/{user_id}/deactivate` |
| `PUT` | `/auth/users/{user_id}/activate` |

### `fmea.py` (2)

| Método | Endpoint |
|---|---|
| `GET` | `/fmea/fmeca/worksheets/{worksheet_id}/export-iw22` |
| `POST` | `/fmea/fmeca/from-rca/{analysis_id}` |

### `scheduling.py` (6)

| Método | Endpoint |
|---|---|
| `PUT` | `/scheduling/programs/{program_id}/finalize` |
| `PUT` | `/scheduling/programs/{program_id}/activate` |
| `PUT` | `/scheduling/programs/{program_id}/complete` |
| `POST` | `/scheduling/support-equipment` |
| `PUT` | `/scheduling/support-equipment/{equipment_id}` |
| `DELETE` | `/scheduling/support-equipment/{equipment_id}` |

### `work_requests.py` (3)

| Método | Endpoint |
|---|---|
| `PUT` | `/work-requests/{request_id}/approve` |
| `PUT` | `/work-requests/{request_id}/reject` |
| `PUT` | `/work-requests/{request_id}/assign` |

## Gerente (manager) — 12 endpoints


### `auth.py` (1)

| Método | Endpoint |
|---|---|
| `PUT` | `/auth/users/{user_id}` |

### `fmea.py` (2)

| Método | Endpoint |
|---|---|
| `GET` | `/fmea/fmeca/worksheets/{worksheet_id}/export-iw22` |
| `POST` | `/fmea/fmeca/from-rca/{analysis_id}` |

### `scheduling.py` (6)

| Método | Endpoint |
|---|---|
| `PUT` | `/scheduling/programs/{program_id}/finalize` |
| `PUT` | `/scheduling/programs/{program_id}/activate` |
| `PUT` | `/scheduling/programs/{program_id}/complete` |
| `POST` | `/scheduling/support-equipment` |
| `PUT` | `/scheduling/support-equipment/{equipment_id}` |
| `DELETE` | `/scheduling/support-equipment/{equipment_id}` |

### `work_requests.py` (3)

| Método | Endpoint |
|---|---|
| `PUT` | `/work-requests/{request_id}/approve` |
| `PUT` | `/work-requests/{request_id}/reject` |
| `PUT` | `/work-requests/{request_id}/assign` |

## Planificador (planner) — 8 endpoints


### `fmea.py` (2)

| Método | Endpoint |
|---|---|
| `GET` | `/fmea/fmeca/worksheets/{worksheet_id}/export-iw22` |
| `POST` | `/fmea/fmeca/from-rca/{analysis_id}` |

### `scheduling.py` (3)

| Método | Endpoint |
|---|---|
| `PUT` | `/scheduling/programs/{program_id}/finalize` |
| `PUT` | `/scheduling/programs/{program_id}/activate` |
| `PUT` | `/scheduling/programs/{program_id}/complete` |

### `work_requests.py` (3)

| Método | Endpoint |
|---|---|
| `PUT` | `/work-requests/{request_id}/approve` |
| `PUT` | `/work-requests/{request_id}/reject` |
| `PUT` | `/work-requests/{request_id}/assign` |

## Supervisor (supervisor) — 1 endpoints


### `scheduling.py` (1)

| Método | Endpoint |
|---|---|
| `PUT` | `/scheduling/support-equipment/{equipment_id}` |