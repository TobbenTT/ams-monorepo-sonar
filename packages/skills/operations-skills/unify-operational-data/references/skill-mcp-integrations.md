# MCP Integrations - unify-operational-data

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-erp` (SAP/Oracle) | Connect to ERP system for financial, procurement, material, and organizational master data extraction and integration | `query_master_data`, `extract_transactions`, `get_cost_data`, `query_material_master`, `get_organizational_structure` |
| `mcp-cmms` (SAP PM/Maximo) | Connect to CMMS for maintenance master data, work orders, failure history, PM schedules, and spare parts data | `query_equipment_master`, `extract_work_orders`, `get_failure_data`, `query_pm_schedule`, `get_spare_parts_bom` |
| `mcp-scada` | Connect to SCADA/DCS historian for real-time and historical process data, alarms, and events | `subscribe_tags`, `query_historian`, `get_alarm_data`, `extract_trends`, `configure_calculations` |
| `mcp-excel` | Generate and format the master data model, data quality report, and analysis workbooks | `create_workbook`, `format_cells`, `add_formulas`, `create_charts`, `apply_conditional_formatting` |
| `mcp-sharepoint` | Store all deliverables as controlled documents and distribute to stakeholders | `upload_document`, `create_folder`, `set_metadata`, `manage_versions`, `share_with_team` |

---
