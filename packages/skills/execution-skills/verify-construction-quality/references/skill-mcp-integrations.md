# MCP Integrations - verify-construction-quality

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint

- **Read**: Retrieve design drawings, inspection records, quality plans, walkdown checklists, ITPs, contractor quality procedures, previous walkdown reports
- **Write**: Store walkdown reports, punchlist registers, trend analyses, photo evidence packages, quality alert notices
- **Permissions**: Read access to Engineering and QA/QC libraries; Write access to Construction Quality folder
- **Folder Structure**: `/{project}/Construction/Quality/Walkdowns/`, `/{project}/Construction/Quality/Punchlist/`, `/{project}/Construction/Quality/Trends/`

### project-database

- **Read/Write**: Punchlist database — track all items with category, status, responsible, resolution, photo links
- **Dashboard**: Real-time punchlist counts, aging analysis, MC readiness traffic lights per system
- **Views**: By area, by contractor, by discipline, by category, overdue items, due this week
- **Automations**: Send notification when item assigned, send reminder when due date approaching, send escalation when overdue
- **Base Structure**:
  - Table 1: Punchlist Items (master record)
  - Table 2: Walkdowns (walkdown events with team, area, date)
  - Table 3: Trend Data (weekly aggregated metrics)
  - Table 4: Systemic Issues (identified patterns with corrective actions)

### mcp-outlook

- **Send**: Walkdown scheduling invitations, daily punchlist status updates, Category A escalation notices, weekly trend reports
- **Calendar**: Schedule walkdown campaigns, set milestone verification dates, set escalation reminders
- **Templates**: Walkdown invitation, daily status, escalation notice, trend report cover email
- **Distribution Lists**: Walkdown teams, construction management, project management, HSE team

### mcp-jira

- **Read/Write**: Track quality NCRs and corrective actions, link punchlist items to construction work packages
- **Workflows**: NCR lifecycle (open → investigate → corrective action → verify → close)
- **Labels**: By contractor, by discipline, by severity, systemic vs. isolated
- **Dashboards**: NCR aging, resolution rate, contractor performance scorecard

---
