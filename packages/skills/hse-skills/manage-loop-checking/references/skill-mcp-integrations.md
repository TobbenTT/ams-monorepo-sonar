# MCP Integrations - manage-loop-checking

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage for engineering inputs, loop check packages, alarm registers, and certificates"
capabilities:
  - Retrieve instrument index, IO lists, alarm databases, P&IDs from engineering libraries
  - Store loop check packages and completion certificates
  - Store alarm rationalization register and startup alarm plans
  - Manage document revision control for alarm database updates
  - Archive commissioning records
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Retrieve instrument index and IO list
  - Step 2: Store generated loop check packages
  - Step 3: Retrieve alarm database export
  - Step 4: Retrieve process design basis documents
  - Step 10: Store alarm configuration change requests
  - Step 14: Store loop check completion certificates
  - Step 16: Archive all commissioning records
```

### project-database
```yaml
name: "project-database"
server: "@anthropic/airtable-mcp"
purpose: "Real-time loop check tracking database and alarm rationalization progress tracking"
capabilities:
  - Create and maintain loop check tracker (per-loop status tracking)
  - Track alarm rationalization progress per system
  - Support dashboard views for completion metrics and trends
  - Manage failed loop punch list items
  - Store alarm workshop progress and decisions
  - Generate filtered views by system, status, priority, and type
authentication: API Key
usage_in_skill:
  - Step 1: Store validated instrument master database
  - Step 2: Create loop check tracking records
  - Step 6: Real-time loop check status updates
  - Step 7: Manage failed loop resolution tracking
  - Step 9: Track alarm rationalization workshop progress
  - Step 13: Generate integrated readiness views
```

---
