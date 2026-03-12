# MCP Integrations - manage-moc-workflow

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Central repository for MOC documentation and register"
capabilities:
  - Store MOC packages (forms, assessments, approvals, evidence)
  - Maintain MOC tracking register as SharePoint list
  - Manage document approval workflows for MOC approvals
  - Version control for MOC documents
  - Archive closed MOCs per retention policy
  - Search and retrieve historical MOC data for analytics
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Register new MOC in tracking database
  - Step 3: Route impact assessment forms to assessors
  - Step 6: Publish approval package
  - Step 8: Track implementation evidence documents
  - Step 12: Archive complete MOC package
  - Step 13: Query MOC register for analytics
```

### mcp-teams
```yaml
name: "mcp-teams"
server: "@anthropic/teams-mcp"
purpose: "Real-time coordination for MOC workflow participants"
capabilities:
  - Post MOC notifications in relevant department channels
  - Schedule risk assessment meetings
  - Schedule training sessions for affected personnel
  - Send urgent notifications for emergency MOCs
  - Facilitate discussion threads for MOC review
  - Coordinate multi-party impact assessment
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 1: Notify affected departments of new MOC
  - Step 5: Schedule and support risk assessment sessions
  - Step 7: Notify stakeholders of approval decisions
  - Step 9: Schedule training sessions
  - Step 11: Coordinate implementation verification
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Formal communication and approval routing for MOC workflow"
capabilities:
  - Send MOC initiation notifications to affected parties
  - Route impact assessment forms with response tracking
  - Distribute approval packages to approval authorities
  - Send reminders for overdue assessments and approvals
  - Distribute implementation status reports
  - Send temporary change expiration warnings
  - Formal escalation notifications for stalled MOCs
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 1: Send MOC acknowledgment to originator
  - Step 3: Route impact assessment forms to SMEs
  - Step 6: Send approval packages to approval authorities
  - Step 8: Send implementation status summaries weekly
  - Step 12: Send MOC closure notification
  - Step 13: Distribute MOC analytics reports
```

---
