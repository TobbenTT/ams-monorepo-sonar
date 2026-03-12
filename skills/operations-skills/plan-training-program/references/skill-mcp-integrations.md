# MCP Integrations - plan-training-program

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-lms` | Learning management system for course catalog, enrollment, completion tracking, assessment management, and certification tracking | `create_course`, `enroll_learner`, `track_completion`, `record_assessment`, `generate_certificate`, `query_training_records`, `create_report` |
| `mcp-sharepoint` | Store training curriculum documents, course materials, assessment templates, and training records as controlled documents | `upload_document`, `create_folder`, `set_metadata`, `manage_versions`, `share_with_team` |
| `mcp-outlook` | Schedule training sessions, send enrollment notifications, reminders for upcoming training, and escalate overdue completion | `create_calendar_event`, `send_invitation`, `send_reminder`, `schedule_recurring` |
| `mcp-excel` | Generate and format the training needs analysis, training schedule, and vendor coordination workbooks | `create_workbook`, `format_cells`, `add_formulas`, `create_charts`, `apply_conditional_formatting` |
| `mcp-teams` | Distribute training announcements, share course materials, and facilitate trainer-trainee communication | `post_message`, `share_document`, `create_channel`, `schedule_meeting` |

---
