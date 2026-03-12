# MCP Integrations - map-regulatory-requirements

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-web-monitor` | Track regulatory changes in official gazettes, regulatory body websites, and industry portals | `monitor_url`, `check_changes`, `extract_updates`, `alert_on_change` |
| `mcp-sharepoint` | Store regulatory register, compliance calendar, permit tracker, and gap analysis report as controlled documents | `upload_document`, `create_folder`, `set_metadata`, `manage_versions`, `share_with_team` |
| `mcp-excel` | Generate and format the compliance matrix workbook, calendar, and permit tracker with conditional formatting and formulas | `create_workbook`, `format_cells`, `add_formulas`, `create_charts`, `apply_conditional_formatting` |
| `mcp-outlook` | Send compliance calendar alerts and deadline reminders to responsible parties | `create_calendar_event`, `send_reminder`, `schedule_recurring`, `notify_stakeholders` |
| `mcp-teams` | Distribute regulatory change notifications and gap analysis updates to compliance team channels | `post_message`, `create_channel`, `share_document`, `tag_stakeholders` |

---
