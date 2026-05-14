---
name: manage-notifications
description: >
  Evaluate system state against thresholds to generate alerts for overdue inspections,
  KPI breaches, equipment risk, aging backlog, and overdue CAPAs/MoCs in mining operations.
  Produces: classified notifications (CRITICAL/WARNING/INFO) with counts and details.
  Use this skill when a user needs to check alerts, review notifications, or assess
  system health warnings.
  Triggers EN: notification, alert, overdue alert, KPI breach, equipment risk alert,
  backlog aging, pending notifications, system alerts, warning, critical alert.
  Triggers ES: notificacion, alerta, alerta de vencimiento, alerta de riesgo,
  notificaciones pendientes, alertas del sistema.
---

# Manage Notifications

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for evaluating system state against defined thresholds to generate maintenance alerts. You check 6 notification types (RBI overdue, KPI breach, equipment risk, backlog aging, CAPA overdue, MoC overdue) with severity classification into CRITICAL, WARNING, and INFO levels. You must correctly apply different thresholds per notification type and handle flexible date parsing.

## 2. Intake - Informacion Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `rbi_assessments` | list[dict] | No | RBI inspection records |
| `planning_kpis` | dict | No | Planning KPI results |
| `de_kpis` | dict | No | DE KPI results |
| `reliability_kpis` | dict | No | Reliability metrics |
| `health_scores` | list[dict] | No | Equipment health scores |
| `backlog_items` | list[dict] | No | Backlog work orders |
| `capas` | list[dict] | No | CAPA records |
| `mocs` | list[dict] | No | MoC records |

## 3. Flujo de Ejecucion

### Step 1: Check RBI Overdue Inspections
For each RBI assessment where next_inspection_date <= today:
- days_overdue > 90 -> CRITICAL
- days_overdue <= 90 -> WARNING
- Title: "RBI inspection overdue: {equipment_id}"

### Step 2: Check KPI Threshold Breaches
For planning and DE KPIs where status == "BELOW_TARGET" OR value < target * 0.9:
- value < target * 0.7 -> CRITICAL
- Otherwise -> WARNING

For reliability KPIs:
- availability_pct < 81.0 -> WARNING
- reactive_ratio_pct > 22.0 -> WARNING

### Step 3: Check Equipment Risk
For each health score where score <= threshold:
- score <= 30 -> CRITICAL
- score > 30 -> WARNING
- Default threshold: CRITICAL (30)

### Step 4: Check Backlog Aging
For each backlog item where age_days >= aging_threshold (default 30):
- age_days >= threshold * 3 (90 days) -> CRITICAL
- Otherwise -> WARNING

### Step 5: Check Overdue CAPA/MoC
CAPAs with status OPEN/IN_PROGRESS and target_date < today -> CRITICAL (always)
MoCs with status DRAFT/SUBMITTED/REVIEWING and age > 30 days -> WARNING (always)

### Step 6: Aggregate All Notifications
Combine all alerts, set plant_id, count by level.

## 4. Logica de Decision

| Type | Trigger | CRITICAL | WARNING |
|------|---------|----------|---------|
| RBI_OVERDUE | Inspection date passed | > 90 days | <= 90 days |
| KPI_BREACH | Below target | value < target * 0.7 | value < target * 0.9 |
| EQUIPMENT_RISK | Low health score | score <= 30 | score <= threshold, > 30 |
| BACKLOG_AGING | Old backlog items | age >= threshold * 3 | age >= threshold |
| CAPA_OVERDUE | Past due date | Always CRITICAL | N/A |
| MOC_OVERDUE | Stalled > 30 days | N/A | Always WARNING |

## 5. Validacion

1. Date parsing is flexible: accepts date, datetime, and ISO format strings.
2. None inputs skip the check entirely (no error, no alerts).
3. Plant ID fallback: alerts without plant_id get top-level plant_id.
4. KPI breach requires both value and target (skip if None).
5. CAPA overdue is always CRITICAL.
6. MoC overdue is always WARNING.
7. Health score fallback: missing score defaults to 100 (no alert).

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For KPI target thresholds |
| DE Procedure | `../../knowledge-base/gfsn/ref-15` | For DE KPI thresholds |
| Notification Thresholds | `references/notification-thresholds.md` | For detailed threshold table per alert type |

## Common Pitfalls

1. **KPI breach threshold confusion**: Alert triggers at value < target * 0.9. CRITICAL at value < target * 0.7.
2. **Reliability KPIs have inverted logic**: reactive_ratio triggers at value > target * 1.1.
3. **Backlog aging default is 30 days**: CRITICAL at 3x threshold (90 days).
4. **MoC stalled threshold is hardcoded at 30 days**.
5. **CAPA overdue only checks OPEN and IN_PROGRESS**: CLOSED and VERIFIED are excluded.
6. **Health score field name varies**: Checks both composite_score and health_score keys.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
