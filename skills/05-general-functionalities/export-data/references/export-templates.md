# Export Field Mappings and Templates Reference

Detailed field mapping, header construction, and fallback rules for each export type.

## Equipment Hierarchy Export

### Header Construction

| Always Included | If include_criticality=True | If include_health=True |
|----------------|------------------------------|--------------------------|
| Equipment ID | Criticality Class | Health Score |
| Description | Risk Score | Health Class |
| Type | | |
| Parent ID | | |

Full header list (all flags true):
`["Equipment ID", "Description", "Type", "Parent ID", "Criticality Class", "Risk Score", "Health Score", "Health Class"]`

### Field Extraction per Row

| Output Column | Source Field | Fallback |
|--------------|-------------|----------|
| Equipment ID | equipment_id | "" |
| Description | description | "" |
| Type | equipment_type | "" |
| Parent ID | parent_id | "" |
| Criticality Class | criticality_class | "" |
| Risk Score | risk_score | "" |
| Health Score | composite_score | health_score, then "" |
| Health Class | health_class | "" |

### Metadata

- export_type: "equipment"
- total_rows: str(count)
- Sheet name: "Equipment"

## KPI Export

### Planning KPIs Sheet

- Sheet name: "Planning KPIs"
- Headers: ["KPI Name", "Value", "Target", "Unit", "Status"]
- Source: planning_kpis["kpis"] list

### DE KPIs Sheet

- Sheet name: "DE KPIs"
- Headers: ["KPI Name", "Value", "Target", "Unit", "Status"]
- Source: de_kpis["kpis"] list

### Reliability KPIs Sheet

- Sheet name: "Reliability KPIs"
- Headers: ["KPI Name", "Value", "Target", "Unit", "Status"]
- Fields (only if non-None): mtbf_days, mttr_hours, availability_pct, oee_pct, schedule_compliance_pct, reactive_ratio_pct
- Target, Unit, Status: empty strings for reliability KPIs

### Fallback

No KPI data at all: single sheet "KPIs" with header ["No Data"] and empty rows.

## Report Export

### Metadata Section

- Title: "Report Metadata"
- Content: "Type: {report_type}, Plant: {plant_id}, Generated: {generated_at}"

### Report Sections

Per section in report["sections"]:
- Title: section's title
- Content: section's content + metrics as "\n  {key}: {value}" lines

### Summary Sheet

- Sheet name: "Summary"
- Headers: ["Metric", "Value"]
- Keys: wo_completed_count, wo_open_count, safety_incidents, schedule_compliance_pct, backlog_hours

## Schedule/Program Export

### Program Overview Sheet

- Sheet name: "Program Overview"
- Headers: ["Property", "Value"]
- Keys: program_id, week_number, year, status, total_work_orders, total_hours

### Schedule Detail Sheet (if gantt_rows provided)

- Sheet name: "Schedule"
- Headers: ["WO ID", "Description", "Start", "End", "Duration (hrs)", "Resource Group", "Status"]

### Gantt Row Field Fallbacks

| Primary Field | Fallback Field |
|--------------|---------------|
| work_order_id | wo_id |
| description | (none) |
| planned_start | start |
| planned_end | end |
| duration_hours | duration |
| resource_group | work_center |
| status | (none) |
