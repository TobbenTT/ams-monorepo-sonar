# OCP Maintenance AI -- Complete Tool Listing

> **Auto-generated from source code inspection.**
> Last updated: 2026-02-22

---

## Summary

| Category | Count |
|---|---|
| Deterministic Engines | 35 |
| MCP Tool Wrappers (registered) | 122 |
| Validators | 3 |
| Processors | 5 |
| Generators | 1 |
| **Total Components** | **166** |

**Agent-to-tool distribution (from `AGENT_TOOL_MAP` in `server.py`):**

| Agent Type | Tools Assigned |
|---|---|
| orchestrator | 13 |
| reliability | 48 |
| planning | 55 |
| spare_parts | 3 |
| _unassigned_ | 4 |
| **Total mapped** | **123** |

> Note: 122 unique tools are registered in `TOOL_REGISTRY` via `@tool` decorators across 26 wrapper files. Of these, 119 are assigned to agents via `AGENT_TOOL_MAP` (no tool appears in more than one agent). 4 registered tools (`get_all_entity_states`, `validate_hierarchy`, `validate_functions`, `validate_criticality_data`) are not assigned to any agent and are listed in Section B.5. One tool in the map may reference a name not yet registered as a wrapper (pending verification at runtime).

---

## Section A -- Deterministic Engines

All engines are located under `tools/engines/`. They are pure-logic, deterministic modules that require no LLM.

| # | Engine Name | File Path | Main Functions | Input | Output | Module / Phase |
|---|---|---|---|---|---|---|
| 1 | CriticalityEngine | `tools/engines/criticality_engine.py` | `calculate_overall_score()`, `determine_risk_class()`, `validate_full_matrix()`, `assess()`, `assess_gfsn()` | Criteria scores dict (safety, environment, production, quality, frequency) | `CriticalityResult` with overall score, risk class (AA/A+/A/B/C), per-criterion scores | Phase 1 -- Criticality Assessment |
| 2 | RCMDecisionEngine | `tools/engines/rcm_decision_engine.py` | `decide()`, `_decide_hidden()`, `_decide_evident()`, `validate_frequency_unit()` | `RCMInput` (failure mode, consequence type, detectability, safety/environmental flags) | `RCMDecision` with strategy type, task description, interval, justification | Phase 1 -- RCM Decision Logic |
| 3 | SAPExportEngine | `tools/engines/sap_export_engine.py` | `generate_upload_package()`, `validate_cross_references()`, `validate_sap_field_lengths()` | Work packages list, plant hierarchy nodes | SAP PM upload template dict (headers, maintenance items, task lists, object lists), validation results | Phase 2 -- SAP Integration |
| 4 | EquipmentResolver | `tools/engines/equipment_resolver.py` | `resolve()`, `_fuzzy_match_tags()`, `_fuzzy_match_descriptions()` | Text input (voice/text/tag), equipment registry list | `ResolutionResult` with equipment_id, tag, confidence, method (EXACT/FUZZY/ALIAS) | Phase 2 -- Equipment Resolution |
| 5 | BacklogGrouper | `tools/engines/backlog_grouper.py` | `group_by_equipment()`, `group_by_area()`, `group_by_shutdown()`, `find_all_groups()`, `stratify()` | List of `BacklogEntry` dicts | List of `WorkPackageGroup` (group_id, items, reason, total_hours, specialties) or `BacklogStratification` | Phase 2 -- Backlog Management |
| 6 | MaterialMapper | `tools/engines/material_mapper.py` | `suggest_materials()`, `validate_task_materials()`, `_generic_suggestion()` | Component type, failure mode keyword, equipment_id, BOM registry | List of `MaterialSuggestion` (material_code, description, quantity) or validation result | Phase 2 -- Spare Parts Mapping |
| 7 | WorkInstructionGenerator | `tools/engines/work_instruction_generator.py` | `generate()`, `validate_work_instruction()` | Task type, component, failure mode, safety flags | Structured work instruction data dict, validation issues list | Phase 2 -- Work Instructions |
| 8 | PriorityEngine | `tools/engines/priority_engine.py` | `calculate_priority()`, `validate_priority_override()`, `calculate_gfsn_priority()` | `PriorityInput` (criticality, safety flags, failure mode, production impact, recurrence) | `PriorityResult` with priority string (1_EMERGENCY to 4_PLANNED), score, justification | Phase 3 -- Priority Calculation |
| 9 | HealthScoreEngine | `tools/engines/health_score_engine.py` | `calculate()`, `criticality_to_score()`, `backlog_pressure_score()`, `strategy_coverage_score()`, `condition_status_score()`, `execution_compliance_score()`, `determine_trend()` | 5-dimension input (criticality, backlog count, strategy coverage %, condition score, compliance %) | `HealthScore` with composite index (0-100), per-dimension scores, trend (IMPROVING/STABLE/DECLINING) | Phase 3 -- Asset Health Index |
| 10 | KPIEngine | `tools/engines/kpi_engine.py` | `calculate_mtbf()`, `calculate_mttr()`, `calculate_availability()`, `calculate_oee()`, `calculate_schedule_compliance()`, `calculate_pm_compliance()`, `calculate_reactive_ratio()`, `calculate_from_records()` | Operating hours, failure count, repair hours, downtime hours, performance data | Individual KPI float values or `KPIReport` with all metrics computed | Phase 3 -- KPI Calculation |
| 11 | WeibullEngine | `tools/engines/weibull_engine.py` | `fit_parameters()`, `reliability()`, `failure_probability()`, `hazard_rate()`, `mean_life()`, `classify_failure_pattern()`, `predict()` | Time-to-failure data list or shape/scale parameters | `WeibullResult` with beta (shape), eta (scale), R-squared, reliability values, `WeibullPrediction` | Phase 3 -- Weibull Failure Analysis |
| 12 | VarianceDetector | `tools/engines/variance_detector.py` | `compute_stats()`, `z_score()`, `detect_variance()`, `detect_multi_metric()`, `rank_plants()` | Metric values per plant, threshold z-score | `VarianceResult` with outlier flags, z-scores, stats; `PlantRanking` list | Phase 3 -- Cross-Plant Variance |
| 13 | CAPAEngine | `tools/engines/capa_engine.py` | `create_capa()`, `advance_phase()`, `update_status()`, `add_action()`, `set_root_cause()`, `is_overdue()`, `get_summary()` | CAPA type, description, source, severity; phase transitions | `CAPARecord` with PDCA lifecycle (PLAN/DO/CHECK/ACT), actions, status, due dates | Phase 4A -- CAPA Management |
| 14 | ManagementReviewEngine | `tools/engines/management_review_engine.py` | `generate_review()`, `_compute_kpi_trends()`, `_generate_findings()`, `_generate_actions()` | Plant KPI data, period, previous review data | `ManagementReview` with KPI trends, findings, recommended actions, executive summary | Phase 4A -- Management Reviews |
| 15 | RCAEngine | `tools/engines/rca_engine.py` | `classify_event()`, `create_analysis()`, `run_5w2h()`, `add_cause()`, `classify_root_cause_level()`, `validate_root_cause_chain()`, `collect_evidence_5p()`, `evaluate_solution()`, `prioritize_solutions()`, `advance_status()`, `compute_de_kpis()` | Event data, failure data, cause chains | `RCAAnalysis` with causal chain, 5W2H analysis, evidence, solutions, DE KPIs | Phase 4A -- Root Cause Analysis |
| 16 | PlanningKPIEngine | `tools/engines/planning_kpi_engine.py` | `calculate()` | Planning metrics dict (backlog_total, pm_completed, schedule_executed, etc.) | `PlanningKPIResult` with 11 GFSN KPIs, targets, compliance flags | Phase 4A -- Planning KPIs |
| 17 | SchedulingEngine | `tools/engines/scheduling_engine.py` | `create_weekly_program()`, `assign_support_tasks()`, `level_resources()`, `detect_conflicts()`, `validate_work_package_elements()`, `finalize_program()`, `activate_program()`, `complete_program()`, `level_resources_enhanced()`, `suggest_conflict_resolutions()`, `split_multi_day_package()` | Plant ID, week/year, work packages, workforce, trade capacities | `WeeklyProgram` with status lifecycle (DRAFT/FINAL/ACTIVE/COMPLETED), resource slots, conflicts | Phase 4B -- Weekly Scheduling |
| 18 | StateMachine | `tools/engines/state_machine.py` | `validate_transition()`, `get_valid_transitions()`, `get_all_states()` | Entity type, current state, target state | `TransitionResult` (allowed bool, reason), valid transitions list | Phase 4B -- State Machine |
| 19 | SparePartsEngine | `tools/engines/spare_parts_engine.py` | `classify_ved()`, `classify_fsn()`, `classify_abc()`, `calculate_criticality_score()`, `calculate_stock_levels()`, `optimize_inventory()` | Material data (unit_cost, annual_usage, lead_time, last_issue_date, criticality) | VED/FSN/ABC classifications, criticality score, reorder point, EOQ, safety stock | Phase 5 -- Spare Parts Analysis |
| 20 | ShutdownEngine | `tools/engines/shutdown_engine.py` | `create_shutdown()`, `start_shutdown()`, `update_progress()`, `complete_shutdown()`, `cancel_shutdown()`, `calculate_metrics()` | Shutdown type, scope, planned duration, work packages, actual progress | `Shutdown` with status lifecycle, `ShutdownMetrics` (schedule variance, cost variance, SPI, CPI) | Phase 5 -- Shutdown Management |
| 21 | MoCEngine | `tools/engines/moc_engine.py` | `create_moc()`, `submit_moc()`, `start_review()`, `approve_moc()`, `reject_moc()`, `resubmit_moc()`, `start_implementation()`, `close_moc()`, `assess_risk()` | Change title, description, category, impact areas | `MoC` with status lifecycle (DRAFT to CLOSED), risk assessment, approval chain | Phase 5 -- Management of Change |
| 22 | OCREngine | `tools/engines/ocr_engine.py` | `calculate_optimal_interval()`, `sensitivity_analysis()`, `batch_analyze()` | Failure rate, repair cost, PM cost, production loss rate, PM duration | `OCRResult` with optimal interval (hours), total cost at optimum, cost breakdown, sensitivity data | Phase 5 -- Optimum Cost-Risk |
| 23 | JackKnifeEngine | `tools/engines/jackknife_engine.py` | `analyze()`, `get_bad_actors()` | Equipment records with MTBF and MTTR values | `JackKnifeResult` with 4-zone classification (ACUTE/CHRONIC/LOW_IMPACT/GOOD_PERFORMER), bad actors list | Phase 5 -- Jack-Knife Diagrams |
| 24 | ParetoEngine | `tools/engines/pareto_engine.py` | `analyze()`, `analyze_failures()`, `analyze_costs()`, `analyze_downtime()` | Records with category + value fields | `ParetoResult` with ranked items, cumulative percentages, vital-few threshold items | Phase 5 -- Pareto Analysis |
| 25 | LCCEngine | `tools/engines/lcc_engine.py` | `calculate()`, `compare_alternatives()`, `find_breakeven()` | Capital cost, annual operating cost, maintenance cost, discount rate, life years | `LCCResult` with NPV, annualized cost, cost breakdown; alternative comparison with breakeven year | Phase 5 -- Life Cycle Cost |
| 26 | RBIEngine | `tools/engines/rbi_engine.py` | `assess()`, `batch_assess()`, `prioritize_inspections()` | Equipment type, age, corrosion rate, last inspection date, consequence | `RBIResult` with risk score (likelihood x consequence), risk category, recommended inspection interval | Phase 5 -- Risk-Based Inspection |
| 27 | DEKPIEngine | `tools/engines/de_kpi_engine.py` | `calculate()`, `calculate_trends()`, `assess_program_health()`, `compare_plants()` | Failure records, CAPA records, RCA records, period | `DEKPIResult` with repeat failure rate, RCA completion rate, CAPA closure rate, program health score | Phase 6 -- Defect Elimination KPIs |
| 28 | NotificationEngine | `tools/engines/notification_engine.py` | `check_rbi_overdue()`, `check_kpi_thresholds()`, `check_equipment_risk()`, `check_backlog_aging()`, `check_overdue_actions()`, `generate_all_notifications()` | KPI data, RBI data, backlog data, equipment health data | List of `Notification` (type, severity, message, affected entities, recommended actions) | Phase 6 -- Notifications & Alerts |
| 29 | DataImportEngine | `tools/engines/data_import_engine.py` | `validate_hierarchy_data()`, `validate_failure_history()`, `validate_maintenance_plan()`, `detect_column_mapping()`, `summarize_import()` | Raw data dicts (hierarchy rows, failure rows, plan rows) | Validation result with errors/warnings per row, column mapping suggestions, import summary | Phase 6 -- Data Import |
| 30 | DataExportEngine | `tools/engines/data_export_engine.py` | `prepare_equipment_export()`, `prepare_kpi_export()`, `prepare_report_export()`, `prepare_schedule_export()` | Equipment list, KPI data, report data, schedule data | `ExportPackage` with headers, rows, metadata, format hints | Phase 6 -- Data Export |
| 31 | CrossModuleEngine | `tools/engines/cross_module_engine.py` | `correlate_criticality_failures()`, `correlate_cost_reliability()`, `correlate_health_backlog()`, `find_bad_actor_overlap()`, `generate_cross_module_summary()` | Multi-module data (criticality, failures, costs, health scores, backlog) | `CrossModuleResult` with Pearson correlations, overlapping bad actors, summary insights | Phase 6 -- Cross-Module Analytics |
| 32 | ReportingEngine | `tools/engines/reporting_engine.py` | `generate_weekly_report()`, `generate_monthly_kpi_report()`, `generate_quarterly_review()`, `get_report_sections()` | Plant ID, period, KPI data, backlog data, schedule data | `Report` with sections (summary, KPIs, backlog status, schedule compliance, recommendations) | Phase 6 -- Periodic Reporting |
| 33 | WorkPackageAssemblyEngine | `tools/engines/work_package_assembly_engine.py` | `assemble_work_package()`, `check_element_readiness()`, `generate_compliance_report()` | Package ID, name, equipment tag, 7 element types, assembled_by | `AssembledWorkPackage` with element statuses, readiness %, compliance report | Phase 7 -- WP Assembly (G5) |
| 34 | ExecutionTaskEngine | `tools/engines/execution_task_engine.py` | `build_execution_sequence()`, `get_loto_removal_checklist()`, `_topological_sort()`, `_calculate_critical_path()` | Package ID, support tasks with types/dependencies, package attributes (elevation, shutdown) | `ExecutionSequence` with ordered steps, critical path, safety checklists (LOTO 8-item) | Phase 7 -- Execution Tasks (G6) |
| 35 | FMECAEngine | `tools/engines/fmeca_engine.py` | `create_worksheet()`, `add_row()`, `calculate_rpn()`, `run_stage_4_decisions()`, `advance_stage()`, `generate_summary()`, `complete_worksheet()` | Equipment ID/tag/name, severity/occurrence/detection (1-10), worksheet data | `FMECAWorksheet` with 4-stage lifecycle, `RPNResult` (RPN value, risk level), `FMECASummary` | Phase 7 -- FMECA (G18) |

---

## Section B -- MCP Tool Wrappers

All tool wrappers are located under `agents/tool_wrappers/`. Each tool is registered via the `@tool` decorator into `TOOL_REGISTRY` and exposed through `server.py`. Tools accept a single `input_json` string parameter and return a JSON string.

### B.1 -- Orchestrator Agent Tools (13 tools)

| # | Tool Name | Wrapper File | Engine(s) Wrapped | Description |
|---|---|---|---|---|
| 1 | `run_full_validation` | `validation_tools.py` | QualityValidator | Run complete validation across all entity types (hierarchy, functions, criticality, FMs, tasks, WPs, cross-entity). |
| 2 | `evaluate_confidence` | `validation_tools.py` | ConfidenceValidator | Evaluate AI confidence for a single entity against 4 review levels. |
| 3 | `batch_evaluate_confidence` | `validation_tools.py` | ConfidenceValidator | Batch confidence evaluation for multiple entities of the same type. |
| 4 | `validate_state_transition` | `state_machine_tools.py` | StateMachine | Check if a state transition is allowed for an entity type. |
| 5 | `get_valid_transitions` | `state_machine_tools.py` | StateMachine | Get all valid next states for an entity in its current state. |
| 6 | `generate_management_review` | `management_review_tools.py` | ManagementReviewEngine | Generate executive management review summary with KPI trends and recommendations. |
| 7 | `generate_weekly_report` | `reporting_tools.py` | ReportingEngine | Generate weekly maintenance report for a plant. |
| 8 | `generate_monthly_kpi_report` | `reporting_tools.py` | ReportingEngine | Generate monthly KPI report for a plant. |
| 9 | `generate_quarterly_review` | `reporting_tools.py` | ReportingEngine | Generate quarterly review report for a plant. |
| 10 | `generate_all_notifications` | `notification_tools.py` | NotificationEngine | Run all notification checks and return combined alerts. |
| 11 | `run_cross_module_analysis` | `notification_tools.py` | CrossModuleEngine | Run cross-module correlation analysis across maintenance data. |
| 12 | `suggest_conflict_resolutions` | `scheduling_tools.py` | SchedulingEngine | Suggest actionable resolutions for scheduling conflicts. |
| 13 | `get_loto_removal_checklist` | `execution_task_tools.py` | ExecutionTaskEngine | Get the LOTO removal safety checklist (8 items). |

### B.2 -- Reliability Agent Tools (48 tools)

| # | Tool Name | Wrapper File | Engine(s) Wrapped | Description |
|---|---|---|---|---|
| 1 | `assess_criticality` | `criticality_tools.py` | CriticalityEngine | Assess equipment criticality with full matrix (GFSN methodology). |
| 2 | `calculate_criticality_score` | `criticality_tools.py` | CriticalityEngine | Calculate overall criticality score from criteria scores. |
| 3 | `determine_risk_class` | `criticality_tools.py` | CriticalityEngine | Determine risk class (AA/A+/A/B/C) from a numerical score. |
| 4 | `validate_criticality_matrix` | `criticality_tools.py` | CriticalityEngine | Validate a complete criticality matrix for consistency. |
| 5 | `rcm_decide` | `rcm_tools.py` | RCMDecisionEngine | Run RCM decision tree to determine maintenance strategy. |
| 6 | `validate_frequency_unit` | `rcm_tools.py` | RCMDecisionEngine | Validate that a frequency/unit combination is acceptable. |
| 7 | `validate_fm_combination` | `fm_lookup_tools.py` | VALID_FM_COMBINATIONS | Check if a mechanism+cause pair is in the 72 valid combinations. |
| 8 | `get_valid_fm_combinations` | `fm_lookup_tools.py` | VALID_FM_COMBINATIONS | Get all valid cause values for a given mechanism. |
| 9 | `list_all_mechanisms` | `fm_lookup_tools.py` | Mechanism enum | List all valid failure mechanism enum values. |
| 10 | `list_all_causes` | `fm_lookup_tools.py` | Cause enum | List all valid failure cause enum values. |
| 11 | `validate_failure_modes` | `validation_tools.py` | QualityValidator | Validate failure modes data quality (FM rules from REF-04). |
| 12 | `validate_tasks` | `validation_tools.py` | QualityValidator | Validate maintenance tasks data quality. |
| 13 | `validate_cross_entity` | `validation_tools.py` | QualityValidator | Validate cross-entity referential integrity. |
| 14 | `validate_fm_what` | `validation_tools.py` | NamingValidator | Validate failure mode "what" field naming conventions (FM-01, FM-02). |
| 15 | `calculate_priority` | `priority_tools.py` | PriorityEngine | Calculate work order priority from criticality and failure data. |
| 16 | `validate_priority_override` | `priority_tools.py` | PriorityEngine | Validate that a manual priority override is justified. |
| 17 | `calculate_health_score` | `health_tools.py` | HealthScoreEngine | Calculate composite Asset Health Index (0-100) from 5 dimensions. |
| 18 | `determine_health_trend` | `health_tools.py` | HealthScoreEngine | Determine health trend from a series of historical scores. |
| 19 | `fit_weibull` | `weibull_tools.py` | WeibullEngine | Fit Weibull distribution parameters (beta, eta) from failure data. |
| 20 | `predict_failure` | `weibull_tools.py` | WeibullEngine | Predict next failure probability using fitted Weibull parameters. |
| 21 | `weibull_reliability` | `weibull_tools.py` | WeibullEngine | Calculate reliability at a given time using Weibull parameters. |
| 22 | `detect_variance` | `variance_tools.py` | VarianceDetector | Detect outlier plants for a single KPI metric across portfolio. |
| 23 | `detect_multi_metric_variance` | `variance_tools.py` | VarianceDetector | Detect outlier plants across multiple KPI metrics simultaneously. |
| 24 | `rank_plants` | `variance_tools.py` | VarianceDetector | Rank plants by composite score across multiple KPIs. |
| 25 | `calculate_mtbf` | `kpi_tools.py` | KPIEngine | Calculate Mean Time Between Failures. |
| 26 | `calculate_mttr` | `kpi_tools.py` | KPIEngine | Calculate Mean Time To Repair. |
| 27 | `calculate_availability` | `kpi_tools.py` | KPIEngine | Calculate equipment availability percentage. |
| 28 | `calculate_oee` | `kpi_tools.py` | KPIEngine | Calculate Overall Equipment Effectiveness. |
| 29 | `calculate_kpis_from_records` | `kpi_tools.py` | KPIEngine | Calculate all KPIs from work order records. |
| 30 | `classify_rca_event` | `rca_tools.py` | RCAEngine | Classify an event to determine if RCA is required. |
| 31 | `create_rca_analysis` | `rca_tools.py` | RCAEngine | Create a new RCA analysis for a failure event. |
| 32 | `run_rca_5w2h` | `rca_tools.py` | RCAEngine | Run 5W2H analysis on an RCA event. |
| 33 | `add_rca_cause` | `rca_tools.py` | RCAEngine | Add a cause to the RCA causal chain. |
| 34 | `classify_root_cause` | `rca_tools.py` | RCAEngine | Classify root cause level (physical/human/latent/organizational). |
| 35 | `validate_rca_chain` | `rca_tools.py` | RCAEngine | Validate completeness and consistency of an RCA causal chain. |
| 36 | `collect_rca_evidence` | `rca_tools.py` | RCAEngine | Collect evidence using the 5P methodology. |
| 37 | `evaluate_rca_solution` | `rca_tools.py` | RCAEngine | Evaluate a proposed RCA solution against criteria. |
| 38 | `prioritize_rca_solutions` | `rca_tools.py` | RCAEngine | Prioritize multiple RCA solutions by feasibility and impact. |
| 39 | `advance_rca_status` | `rca_tools.py` | RCAEngine | Advance RCA analysis through its status lifecycle. |
| 40 | `compute_de_kpis` | `rca_tools.py` | RCAEngine | Compute Defect Elimination KPIs from RCA data. |
| 41 | `calculate_de_kpis_standalone` | `reporting_tools.py` | DEKPIEngine | Calculate DE KPIs independently (standalone). |
| 42 | `assess_de_program_health` | `reporting_tools.py` | DEKPIEngine | Assess overall Defect Elimination program health. |
| 43 | `check_rbi_overdue` | `notification_tools.py` | NotificationEngine | Check for overdue RBI inspections. |
| 44 | `check_kpi_breaches` | `notification_tools.py` | NotificationEngine | Check for KPI threshold breaches. |
| 45 | `find_bad_actor_overlap` | `notification_tools.py` | CrossModuleEngine | Find equipment flagged as bad actors across multiple modules. |
| 46 | `create_fmeca_worksheet` | `fmeca_tools.py` | FMECAEngine | Create a new FMECA worksheet for an equipment item. |
| 47 | `calculate_rpn` | `fmeca_tools.py` | FMECAEngine | Calculate Risk Priority Number (Severity x Occurrence x Detection). |
| 48 | `generate_fmeca_summary` | `fmeca_tools.py` | FMECAEngine | Generate FMECA summary statistics with RPN distribution and top risks. |

### B.3 -- Planning Agent Tools (55 tools)

| # | Tool Name | Wrapper File | Engine(s) Wrapped | Description |
|---|---|---|---|---|
| 1 | `group_by_equipment` | `backlog_tools.py` | BacklogGrouper | Group backlog items by equipment tag. |
| 2 | `group_by_area` | `backlog_tools.py` | BacklogGrouper | Group backlog items by plant area code. |
| 3 | `group_by_shutdown` | `backlog_tools.py` | BacklogGrouper | Group backlog items requiring shutdown into shutdown packages. |
| 4 | `find_all_groups` | `backlog_tools.py` | BacklogGrouper | Find all possible groupings (equipment, area, shutdown) at once. |
| 5 | `stratify_backlog` | `backlog_tools.py` | BacklogGrouper | Stratify backlog by priority, reason, and equipment criticality. |
| 6 | `generate_sap_upload` | `sap_tools.py` | SAPExportEngine | Generate SAP PM upload template from work packages. |
| 7 | `validate_sap_cross_references` | `sap_tools.py` | SAPExportEngine | Validate cross-references in SAP upload data. |
| 8 | `validate_sap_field_lengths` | `sap_tools.py` | SAPExportEngine | Validate SAP field length constraints. |
| 9 | `generate_work_instruction` | `work_instruction_tools.py` | WorkInstructionGenerator | Generate a structured work instruction. |
| 10 | `validate_work_instruction` | `work_instruction_tools.py` | WorkInstructionGenerator | Validate a work instruction for completeness. |
| 11 | `validate_wp_name` | `validation_tools.py` | NamingValidator | Validate work package name against naming rules (WP-05 to WP-07). |
| 12 | `validate_task_name` | `validation_tools.py` | NamingValidator | Validate task name against naming rules (T-05 to T-19). |
| 13 | `validate_work_packages` | `validation_tools.py` | QualityValidator | Validate work package data quality. |
| 14 | `create_capa` | `capa_tools.py` | CAPAEngine | Create a new CAPA record with PDCA lifecycle. |
| 15 | `advance_capa_phase` | `capa_tools.py` | CAPAEngine | Advance CAPA through PDCA phases (PLAN->DO->CHECK->ACT). |
| 16 | `update_capa_status` | `capa_tools.py` | CAPAEngine | Update CAPA status (OPEN/IN_PROGRESS/COMPLETED/OVERDUE). |
| 17 | `add_capa_action` | `capa_tools.py` | CAPAEngine | Add an action item to a CAPA record. |
| 18 | `set_capa_root_cause` | `capa_tools.py` | CAPAEngine | Set the root cause for a CAPA. |
| 19 | `check_capa_overdue` | `capa_tools.py` | CAPAEngine | Check if a CAPA is overdue. |
| 20 | `get_capa_summary` | `capa_tools.py` | CAPAEngine | Get summary of a CAPA record. |
| 21 | `calculate_planning_kpis` | `planning_kpi_tools.py` | PlanningKPIEngine | Calculate 11 GFSN planning KPIs. |
| 22 | `get_planning_kpi_targets` | `planning_kpi_tools.py` | PlanningKPIEngine | Get target values for all planning KPIs. |
| 23 | `create_weekly_program` | `scheduling_tools.py` | SchedulingEngine | Create a DRAFT weekly program from work packages. |
| 24 | `level_program_resources` | `scheduling_tools.py` | SchedulingEngine | Run resource leveling on a weekly program. |
| 25 | `detect_scheduling_conflicts` | `scheduling_tools.py` | SchedulingEngine | Detect resource conflicts (area interference, specialist overallocation). |
| 26 | `validate_wp_elements` | `scheduling_tools.py` | SchedulingEngine | Validate 7 mandatory work package elements per REF-14 section 5.5. |
| 27 | `finalize_weekly_program` | `scheduling_tools.py` | SchedulingEngine | Transition weekly program from DRAFT to FINAL. |
| 28 | `generate_gantt` | `scheduling_tools.py` | GanttGenerator | Generate Gantt chart data from a weekly program. |
| 29 | `analyze_spare_parts` | `reliability_tools.py` | SparePartsEngine | Classify spare parts using VED/FSN/ABC methodology. |
| 30 | `calculate_stock_levels` | `reliability_tools.py` | SparePartsEngine | Calculate reorder point, EOQ, and safety stock levels. |
| 31 | `create_shutdown` | `reliability_tools.py` | ShutdownEngine | Create a new shutdown record. |
| 32 | `update_shutdown_progress` | `reliability_tools.py` | ShutdownEngine | Update shutdown execution progress. |
| 33 | `complete_shutdown` | `reliability_tools.py` | ShutdownEngine | Complete a shutdown and calculate final metrics. |
| 34 | `calculate_shutdown_metrics` | `reliability_tools.py` | ShutdownEngine | Calculate SPI, CPI, and variance metrics for a shutdown. |
| 35 | `create_moc` | `reliability_tools.py` | MoCEngine | Create a new Management of Change record. |
| 36 | `advance_moc` | `reliability_tools.py` | MoCEngine | Advance MoC through its approval workflow. |
| 37 | `assess_moc_risk` | `reliability_tools.py` | MoCEngine | Assess risk for a Management of Change. |
| 38 | `calculate_ocr` | `reliability_tools.py` | OCREngine | Calculate Optimum Cost-Risk maintenance interval. |
| 39 | `analyze_jackknife` | `reliability_tools.py` | JackKnifeEngine | Run Jack-Knife analysis (MTBF vs MTTR 4-zone classification). |
| 40 | `analyze_pareto` | `reliability_tools.py` | ParetoEngine | Run Pareto 80/20 bad actor analysis. |
| 41 | `calculate_lcc` | `reliability_tools.py` | LCCEngine | Calculate Life Cycle Cost (NPV per ISO 15663-1). |
| 42 | `compare_lcc_alternatives` | `reliability_tools.py` | LCCEngine | Compare LCC for multiple alternatives with breakeven analysis. |
| 43 | `assess_rbi` | `reliability_tools.py` | RBIEngine | Assess Risk-Based Inspection requirements. |
| 44 | `prioritize_inspections` | `reliability_tools.py` | RBIEngine | Prioritize inspections by risk ranking. |
| 45 | `validate_import_data` | `reporting_tools.py` | DataImportEngine | Validate data for import (hierarchy, failures, plans). |
| 46 | `export_equipment_data` | `reporting_tools.py` | DataExportEngine | Export equipment data in structured format. |
| 47 | `export_kpi_data` | `reporting_tools.py` | DataExportEngine | Export KPI data in structured format. |
| 48 | `export_report_data` | `reporting_tools.py` | DataExportEngine | Export report data in structured format. |
| 49 | `export_schedule_data` | `reporting_tools.py` | DataExportEngine | Export schedule data in structured format. |
| 50 | `check_backlog_aging` | `notification_tools.py` | NotificationEngine | Check for aged backlog items exceeding thresholds. |
| 51 | `assemble_work_package` | `wp_assembly_tools.py` | WorkPackageAssemblyEngine | Assemble a work package with 7 mandatory elements. |
| 52 | `check_wp_element_readiness` | `wp_assembly_tools.py` | WorkPackageAssemblyEngine | Check element readiness issues for an assembled work package. |
| 53 | `generate_wp_compliance_report` | `wp_assembly_tools.py` | WorkPackageAssemblyEngine | Generate compliance report across multiple assembled work packages. |
| 54 | `build_execution_sequence` | `execution_task_tools.py` | ExecutionTaskEngine | Build ordered execution sequence with dependencies and safety checklists. |
| 55 | `level_resources_enhanced` | `scheduling_tools.py` | SchedulingEngine | Trade-specific resource leveling with multi-day splitting. |

### B.4 -- Spare Parts Agent Tools (3 tools)

| # | Tool Name | Wrapper File | Engine(s) Wrapped | Description |
|---|---|---|---|---|
| 1 | `suggest_materials` | `material_tools.py` | MaterialMapper | Suggest spare parts/materials for a component and failure mode. |
| 2 | `validate_task_materials` | `material_tools.py` | MaterialMapper | Validate that materials assigned to a task are appropriate. |
| 3 | `resolve_equipment` | `equipment_tools.py` | EquipmentResolver | Resolve equipment TAG from voice/text input using fuzzy matching. |

### B.5 -- Tools Not Assigned to Any Agent (registered but not in AGENT_TOOL_MAP)

| # | Tool Name | Wrapper File | Engine(s) Wrapped | Description |
|---|---|---|---|---|
| 1 | `get_all_entity_states` | `state_machine_tools.py` | StateMachine | Get all possible states for an entity type. |
| 2 | `validate_hierarchy` | `validation_tools.py` | QualityValidator | Validate hierarchy data structure. |
| 3 | `validate_functions` | `validation_tools.py` | QualityValidator | Validate function descriptions. |
| 4 | `validate_criticality_data` | `validation_tools.py` | QualityValidator | Validate criticality assessment data. |

---

## Section C -- Validators

All validators are located under `tools/validators/`.

| # | Validator Name | File Path | Rules Count | Key Methods | Description |
|---|---|---|---|---|---|
| 1 | QualityValidator | `tools/validators/quality_validator.py` | 40+ | `validate_hierarchy()`, `validate_functions()`, `validate_criticality()`, `validate_failure_modes()`, `validate_tasks()`, `validate_work_packages()`, `validate_cross_entity()`, `validate_frequency_alignment()`, `validate_suppressive_wp()`, `validate_sequential_wp()`, `validate_mi_replacement_tasks()`, `validate_criticality_fm_alignment()`, `validate_wp_frequency_alignment()`, `run_full_validation()` | Master data quality validator implementing rules from REF-04. Validates all entity types (hierarchy nodes, functions, criticality matrices, failure modes, maintenance tasks, work packages) and cross-entity referential integrity. Returns `ValidationResult` with errors, warnings, and info-level issues per entity. |
| 2 | ConfidenceValidator | `tools/validators/confidence_validator.py` | 20 (4 levels x 5 entity types) | `evaluate()`, `batch_evaluate()` | Evaluates AI confidence scores against thresholds for 4 review levels: NO_REVIEW (>= 0.85-0.90), SPOT_CHECK (>= 0.70-0.75), FULL_REVIEW (>= 0.50-0.55), REJECT (< 0.50-0.55). Supports 5 entity types: hierarchy, function, criticality, failure_mode, task. Returns `ConfidenceResult` with review level and threshold details. |
| 3 | NamingValidator | `tools/validators/naming_validator.py` | 12+ | `validate_wp_name()`, `validate_task_name()`, `validate_fm_what()` | Validates naming conventions per GFSN standards. Work package names (rules WP-05 to WP-07): mandatory prefix format, max length, allowed characters. Task names (rules T-05 to T-19): verb-first structure, required frequency suffix, max length. Failure mode "what" (rules FM-01, FM-02): must match maintainable item naming patterns. Returns list of `NamingIssue` (rule_id, severity, message). |

---

## Section D -- Processors

All processors are located under `tools/processors/`.

| # | Processor Name | File Path | Key Methods | Module | Description |
|---|---|---|---|---|---|
| 1 | PII Redactor | `tools/processors/pii_redactor.py` | `redact()` | Data Preprocessing | Regex-based PII removal from text before AI processing. Handles French, English, and Arabic name patterns (M./Mme/Dr/Ing prefixes), email addresses, phone numbers (international formats), and employee IDs (EMP/MAT/ID patterns). Also detects "reported by/signale par" attributions. Returns cleaned text and list of redacted items. Deterministic, no LLM required. |
| 2 | FieldCaptureProcessor | `tools/processors/field_capture_processor.py` | `process()`, `_extract_text()`, `_resolve_equipment()`, `_detect_failure_mode()`, `_detect_component()`, `_detect_safety_flags()`, `_determine_wo_type()`, `_suggest_spare_parts()`, `_analyse_images()`, `_build_structured_description()`, `_determine_specialties()`, `_estimate_duration()` | Field Capture Pipeline | Converts raw `FieldCaptureInput` (voice/text/images from field operators) into `StructuredWorkRequest` with DRAFT status. Pipeline: PII redaction -> text extraction -> equipment resolution (fuzzy matching) -> failure mode detection (keyword matching against 72 VALID_FM_COMBINATIONS using MECHANISM_KEYWORDS and CAUSE_KEYWORDS dicts) -> component type detection -> safety flag detection -> work order type determination -> priority calculation -> spare parts suggestion -> image analysis -> structured description (EN+FR). Deterministic, no LLM required. |
| 3 | PlannerEngine | `tools/processors/planner_engine.py` | `recommend()` (plus 7 private helper functions: `_analyse_workforce()`, `_check_materials()`, `_find_shutdown_window()`, `_estimate_production_impact()`, `_find_groupable()`, `_suggest_schedule()`, `_assess_risk()`, `_determine_action()`) | Planning Recommendations | Generates AI recommendations for validated work requests. Checks workforce availability, material inventory, shutdown windows, production impact, backlog groupability, and risk assessment. Returns `PlannerRecommendation` with suggested action (APPROVE/MODIFY/ESCALATE/DEFER), scheduling suggestion (date, shift, conflicts, groupable items), resource analysis, risk assessment (CRITICAL/HIGH/MEDIUM/LOW), and confidence score. Deterministic, no LLM required. |
| 4 | BacklogOptimizer | `tools/processors/backlog_optimizer.py` | `optimize()` (plus 7 private helper functions: `_to_backlog_entries()`, `_stratify()`, `_build_work_packages()`, `_schedule_shutdown_items()`, `_generate_schedule()`, `_generate_alerts()`, `_empty_backlog()`) | Backlog Optimization | Generates optimized schedules from backlog items. Uses BacklogGrouper for work packages, separates schedulable vs blocked items, distributes packages across shifts, schedules shutdown items into shutdown windows, and generates alerts (overdue >30 days, material delays, emergency priority escalations). Returns `OptimizedBacklog` with stratification, work packages, schedule proposal, and alerts. Deterministic, no LLM required. |
| 5 | GanttGenerator | `tools/processors/gantt_generator.py` | `generate_gantt_data()`, `export_gantt_excel()` | Visualization | Converts `WeeklyProgram` work packages into structured `GanttRow` data and exports to Excel (.xlsx) with two sheets: (1) Schedule Table with headers/data and (2) Gantt Visual with color-coded timeline bars by specialty (MECHANICAL=blue, ELECTRICAL=yellow, INSTRUMENTATION=green, WELDING=orange, GENERAL=gray). Uses openpyxl for Excel generation. Deterministic, no LLM required. |

---

## Section E -- Generators

All generators are located under `tools/generators/`.

| # | Generator Name | File Path | Key Methods | Description |
|---|---|---|---|---|
| 1 | SyntheticDataGenerator | `tools/generators/synthetic_data.py` | `generate_plant_hierarchy()`, `generate_failure_modes()`, `generate_work_order_history()`, `get_statistics()` | Generates phosphate-realistic synthetic maintenance data for OCP mining operations. Creates complete 6-level plant hierarchies (PLANT -> AREA -> SYSTEM -> EQUIPMENT -> SUB_ASSEMBLY -> MAINTAINABLE_ITEM) with domain-accurate data: 8 phosphate process areas (Grinding, Flotation, Sedimentation, Filtration, Drying, Conveying, Storage, Pumping), realistic equipment types with manufacturers (FLSmidth, Metso Outotec, Weir Minerals, SKF, ABB, Siemens, etc.), sub-assemblies, maintainable items, failure modes mapped to failure patterns and maintenance strategies, and synthetic work order history. Seeded RNG for reproducibility. |

---

## Appendix: File Index

### Engines (`tools/engines/`)

| File | Engine Class |
|---|---|
| `backlog_grouper.py` | BacklogGrouper |
| `capa_engine.py` | CAPAEngine |
| `criticality_engine.py` | CriticalityEngine |
| `cross_module_engine.py` | CrossModuleEngine |
| `data_export_engine.py` | DataExportEngine |
| `data_import_engine.py` | DataImportEngine |
| `de_kpi_engine.py` | DEKPIEngine |
| `equipment_resolver.py` | EquipmentResolver |
| `execution_task_engine.py` | ExecutionTaskEngine |
| `fmeca_engine.py` | FMECAEngine |
| `health_score_engine.py` | HealthScoreEngine |
| `jackknife_engine.py` | JackKnifeEngine |
| `kpi_engine.py` | KPIEngine |
| `lcc_engine.py` | LCCEngine |
| `management_review_engine.py` | ManagementReviewEngine |
| `material_mapper.py` | MaterialMapper |
| `moc_engine.py` | MoCEngine |
| `notification_engine.py` | NotificationEngine |
| `ocr_engine.py` | OCREngine (Optimum Cost-Risk) |
| `pareto_engine.py` | ParetoEngine |
| `planning_kpi_engine.py` | PlanningKPIEngine |
| `priority_engine.py` | PriorityEngine |
| `rbi_engine.py` | RBIEngine |
| `rca_engine.py` | RCAEngine |
| `rcm_decision_engine.py` | RCMDecisionEngine |
| `reporting_engine.py` | ReportingEngine |
| `scheduling_engine.py` | SchedulingEngine |
| `shutdown_engine.py` | ShutdownEngine |
| `spare_parts_engine.py` | SparePartsEngine |
| `state_machine.py` | StateMachine |
| `variance_detector.py` | VarianceDetector |
| `weibull_engine.py` | WeibullEngine |
| `work_instruction_generator.py` | WorkInstructionGenerator |
| `work_package_assembly_engine.py` | WorkPackageAssemblyEngine |

### Tool Wrappers (`agents/tool_wrappers/`)

| File | Tools Registered |
|---|---|
| `backlog_tools.py` | 5 tools |
| `capa_tools.py` | 7 tools |
| `criticality_tools.py` | 4 tools |
| `equipment_tools.py` | 1 tool |
| `execution_task_tools.py` | 2 tools |
| `fm_lookup_tools.py` | 4 tools |
| `fmeca_tools.py` | 3 tools |
| `health_tools.py` | 2 tools |
| `kpi_tools.py` | 5 tools |
| `management_review_tools.py` | 1 tool |
| `material_tools.py` | 2 tools |
| `notification_tools.py` | 6 tools |
| `planning_kpi_tools.py` | 2 tools |
| `priority_tools.py` | 2 tools |
| `rca_tools.py` | 11 tools |
| `rcm_tools.py` | 2 tools |
| `reliability_tools.py` | 16 tools |
| `reporting_tools.py` | 9 tools |
| `scheduling_tools.py` | 8 tools |
| `sap_tools.py` | 3 tools |
| `state_machine_tools.py` | 3 tools |
| `validation_tools.py` | 13 tools |
| `variance_tools.py` | 3 tools |
| `weibull_tools.py` | 3 tools |
| `work_instruction_tools.py` | 2 tools |
| `wp_assembly_tools.py` | 3 tools |

### Validators (`tools/validators/`)

| File | Validator Class |
|---|---|
| `quality_validator.py` | QualityValidator |
| `confidence_validator.py` | ConfidenceValidator |
| `naming_validator.py` | NamingValidator |

### Processors (`tools/processors/`)

| File | Processor Class |
|---|---|
| `pii_redactor.py` | (module-level `redact()` function) |
| `field_capture_processor.py` | FieldCaptureProcessor |
| `planner_engine.py` | PlannerEngine |
| `backlog_optimizer.py` | BacklogOptimizer |
| `gantt_generator.py` | GanttGenerator |

### Generators (`tools/generators/`)

| File | Generator Class |
|---|---|
| `synthetic_data.py` | SyntheticDataGenerator |
