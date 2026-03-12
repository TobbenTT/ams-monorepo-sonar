# MCP Integrations - manage-epc-interfaces

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read** | Retrieve EPC contract documents | Scope split definitions, deliverables lists, milestones, penalty clauses |
| **Read** | Access TOP checklists | Standard and project-specific TOP documentation requirements |
| **Read** | Retrieve vendor documentation | Equipment manuals, test certificates, as-built drawings received from EPC |
| **Write** | Store interface registers | Version-controlled interface register with revision history |
| **Write** | Store RFI logs | Complete RFI lifecycle documentation |
| **Write** | Store TOP status reports | Per-system TOP completeness records |
| **Write** | Store interface status reports | Weekly/monthly reports with distribution tracking |

### project-database

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | EPC Interface Register database | Primary database for all interfaces -- track status, aging, responsible parties |
| **Read/Write** | RFI Tracker database | Full RFI lifecycle tracking with automated aging calculation |
| **Read/Write** | TOP Status database | Per-system TOP item tracking with completeness scoring |
| **Workflow** | Automated aging alerts | Trigger notifications for overdue RFIs at 7, 14, 21, 30 days |
| **Dashboard** | Interface health views | Traffic light dashboards by system, contractor, milestone |
| **Dashboard** | RFI trend analysis | Submission rate, response time, category distribution charts |

### mcp-outlook

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Send** | Weekly interface reports | Distribute to project team and EPC contractor representatives |
| **Send** | RFI escalation notices | Automated escalation for overdue RFIs with impact assessment |
| **Send** | TOP milestone notifications | T-30, T-15, T-7 day reminders with readiness status |
| **Send** | Risk escalation alerts | Immediate notification for High-rated interface risks |
| **Read** | RFI responses | Receive and log RFI responses from contractors |
| **Read** | Interface resolution confirmations | Capture evidence of interface resolution |
| **Calendar** | Interface review meetings | Schedule weekly interface meetings, TOP reviews |

### mcp-jira

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Interface action items | Create and track action items arising from interface reviews |
| **Read/Write** | RFI resolution tasks | Manage RFI response workflow with assignments and deadlines |
| **Link** | Commissioning integration | Link interface items to commissioning tasks (certify-system-readiness.md) |
| **Dashboard** | Action item burndown | Track action item resolution rate and aging |

---
