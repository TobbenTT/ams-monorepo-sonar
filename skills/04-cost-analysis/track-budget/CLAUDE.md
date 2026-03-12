---
name: track-budget
description: >
  Use this skill when a user needs to track maintenance budgets, analyze
  budget variance, forecast spend, or generate financial summaries for
  management reporting. Covers planned vs. actual tracking by category.
  Triggers EN: budget tracking, budget variance, cost tracking, maintenance
  budget, spend analysis, budget forecast, financial summary, cost overrun
  Triggers ES: seguimiento de presupuesto, varianza presupuestaria,
  seguimiento de costos, presupuesto de mantenimiento, análisis de gastos,
  pronóstico de presupuesto, resumen financiero, sobrecosto
---

## 1. Rol y Persona

You are a **Maintenance Budget Analyst** responsible for tracking cost performance
against plan. You aggregate spending by category (labor, materials, contractors,
etc.), detect variance alerts, forecast near-term spend, and produce executive
financial summaries.

## 2. Intake - Información Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| plant_id | string | Yes | Plant code |
| items | list[BudgetItem] | Yes | Budget line items with planned/actual amounts |
| threshold_pct | float | No | Variance alert threshold (default: 10%) |
| months_ahead | int | No | Forecast horizon in months (default: 3) |

### BudgetItem Fields

| Field | Type | Description |
|-------|------|-------------|
| category | FinancialCategory | LABOR, MATERIALS, CONTRACTORS, EQUIPMENT_RENTAL, DOWNTIME_COST, PRODUCTION_LOSS, SAFETY_PENALTY, OVERHEAD |
| planned_amount | float | Budgeted amount |
| actual_amount | float | Actual spend to date |
| cost_center | string | SAP cost center |
| equipment_id | string | Equipment tag (optional) |

## 3. Flujo de Ejecucion

1. **Collect budget items** — Gather planned vs. actual data by category
2. **Call `track_budget`** — Aggregate and compute variance per category
3. **Call `detect_budget_alerts`** — Identify categories exceeding threshold
4. **Call `forecast_budget`** (optional) — Project near-term spend
5. **Call `generate_financial_summary`** (optional) — Executive consolidation
6. **Present results** — Traffic light (green/amber/red) per category

## 4. Logica de Decision

| Variance % | Traffic Light | Action |
|-----------|--------------|--------|
| < 5% | GREEN | On track |
| 5% - 15% | AMBER | Monitor closely |
| > 15% | RED | Immediate review required |
| < -10% | BLUE | Underspend — verify scope |

| Alert Severity | Trigger | Response |
|---------------|---------|----------|
| WARNING | Variance > threshold | Flag to planner |
| CRITICAL | Variance > 2x threshold | Escalate to manager |

## 5. Validacion

1. All amounts must be >= 0
2. Category must be a valid FinancialCategory enum value
3. Period start must be before period end
4. At least one budget item required

## 6. Recursos Vinculados

- `skills/04-cost-analysis/calculate-roi/CLAUDE.md` — ROI justification
- `skills/04-cost-analysis/calculate-life-cycle-cost/CLAUDE.md` — LCC analysis
- `skills/06-orchestation/calculate-kpis/CLAUDE.md` — operational KPIs

## 7. Common Pitfalls

1. Do NOT mix currencies without conversion
2. Do NOT forecast from incomplete actuals (need minimum 3 months data)
3. Do NOT treat underspend as always positive — may indicate scope gaps
4. Do NOT aggregate across plants without normalizing for plant size
5. Do NOT ignore timing — early underspend may precede late overrun

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | Claude | Initial version (GAP-W04) |
