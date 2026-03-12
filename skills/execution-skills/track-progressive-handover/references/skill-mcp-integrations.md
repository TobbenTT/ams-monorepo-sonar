# MCP Integrations - track-progressive-handover

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read** | Retrieve milestone certificates | MC, RFSU, PC certificates and supporting evidence |
| **Read** | Access punchlist registers | Construction and commissioning punchlist data |
| **Read** | Retrieve as-built documentation | Track document submissions against TOP checklist |
| **Read** | Access training records | Operator training completion and competency records |
| **Write** | Store handover status reports | Weekly, monthly, and milestone-specific reports |
| **Write** | Store CCC transfer certificates | Formal CCC transfer documentation with signatures |
| **Write** | Store milestone sign-off documents | Completed milestone checklists and certificates |
| **Write** | Store readiness assessments | Operations readiness reports per system |

### project-database

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Progressive handover database | Track all systems, milestones, punchlist items, readiness scores in real-time |
| **Read/Write** | Punchlist management | Full punchlist lifecycle tracking with categorization, aging, and resolution |
| **Read/Write** | Operations readiness scoring | Per-system readiness matrix with automatic score calculation |
| **Dashboard** | Milestone status views | Real-time traffic light dashboard by system, area, milestone |
| **Dashboard** | Punchlist analytics | Resolution trends, aging analysis, contractor performance |
| **Dashboard** | S-curve visualization | Planned vs. actual milestone achievement curves |
| **Workflow** | Milestone alerts | Automated notifications at T-30, T-14, T-7 before milestones |

### mcp-outlook

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Send** | Milestone approaching notifications | Automated alerts to responsible parties for upcoming milestones |
| **Send** | Handover readiness reports | Distribute weekly status reports to project team |
| **Send** | Escalation of blocking items | Alert project management when milestones are at risk |
| **Send** | CCC transfer notifications | Formal notification of CCC transfer with insurance implications |
| **Calendar** | Milestone review meetings | Schedule MC/RFSU/PC review meetings with all parties |
| **Calendar** | CCC transfer ceremonies | Schedule formal handover events |
| **Read** | Receive milestone approvals | Capture email-based milestone sign-off confirmations |

### mcp-jira

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Punchlist items as issues | Track punchlist items with workflow (Open -> In Progress -> Resolved -> Verified -> Closed) |
| **Read/Write** | Readiness action items | Track operations readiness gap corrective actions |
| **Link** | Commissioning tasks | Link to commissioning tasks from certify-system-readiness.md |
| **Dashboard** | Punchlist burndown | Track punchlist resolution rate against milestone deadlines |
| **Workflow** | Milestone gates | Implement milestone gate reviews as Jira workflows |

---
