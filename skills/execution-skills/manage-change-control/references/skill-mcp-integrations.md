# MCP Integrations - manage-change-control

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read** | Retrieve baseline documents | Cost baseline, schedule baseline, WBS dictionary, scope documents |
| **Read** | Access contract provisions | Change order mechanisms, variation clauses, approval authorities |
| **Read** | Retrieve approval authority matrix | Who approves what threshold -- project-specific document |
| **Write** | Store change impact assessments | Version-controlled assessment documents with full audit trail |
| **Write** | Store approval records | Decision documentation, approval signatures, conditions |
| **Write** | Store close-out reports | Final impact analysis, lessons learned, variance reports |
| **Write** | Store monthly change control reports | Trend analysis, cumulative impact, management reports |

### project-database

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Change Register database | Primary database for all CRs with full lifecycle tracking, status, impact values, approval chain |
| **Read/Write** | Contingency Tracker | Track contingency drawdown from approved changes |
| **Dashboard** | Change trend analysis | Submission rate, type distribution, source analysis visualizations |
| **Dashboard** | Cumulative impact tracking | Running total of approved changes vs. baseline with trend line |
| **Dashboard** | Aging report | CRs overdue for assessment or decision, with escalation status |
| **Workflow** | Assessment reminders | Automated alerts when assessment is approaching or past due date |
| **Workflow** | Approval routing | Route CRs to correct approval authority based on classification |

### mcp-outlook

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Send** | Change request notifications | Notify assessors of new CRs requiring evaluation |
| **Send** | Impact assessment distribution | Send completed assessments to review panel and approval authority |
| **Send** | Approval request notifications | Formal request for decision from appropriate authority |
| **Send** | Implementation instructions | Distribute approved change implementation details to affected parties |
| **Send** | Monthly change control reports | Distribute to project management team and stakeholders |
| **Read** | Approval decisions | Receive email-based approval, rejection, or deferral decisions |
| **Read** | Review comments | Capture comments from review panel on impact assessments |

### mcp-jira

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | Change implementation tasks | Create and track implementation tasks for approved changes |
| **Read/Write** | Assessment tasks | Assign and track impact assessment work items |
| **Link** | Affected work packages | Link CRs to affected project work packages and milestones |
| **Workflow** | CR lifecycle | Implement 6-step workflow as Jira workflow (Initiated -> Assessing -> Reviewed -> Pending Approval -> Implementing -> Closed) |
| **Dashboard** | Implementation progress | Track completion of change implementation tasks |

---
