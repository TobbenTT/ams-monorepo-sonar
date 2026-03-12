# MCP Integrations - model-commissioning-sequence

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-project-online` | Microsoft Project Online integration for schedule management | Read master schedule milestones; Write commissioning logic network; Update progress tracking; Generate Gantt charts and S-curves; Resource leveling analysis |
| `mcp-sharepoint` | Document storage for STPs, procedures, and commissioning records | Retrieve engineering inputs (P&IDs, PFDs, equipment lists); Store STPs and commissioning packages; Manage document revision control; Archive commissioning certificates; Publish dashboards |
| `project-database` | Real-time commissioning progress tracking database | Create system-level tracking records; Update activity completion status; Track ITPS completion; Manage prerequisite status; Support dashboard views with RAG coding |
| `mcp-outlook` | Notifications and coordination communications | Send vendor mobilization notifications; Distribute ITPS witness notifications; Send weekly commissioning progress reports; Schedule commissioning coordination meetings; Escalate critical path issues |
| `mcp-excel` | Complex schedule calculations and analysis | Perform CPM forward/backward pass calculations; Resource leveling algorithms; What-if scenario modeling; Earned value calculations; Statistical duration analysis |

---
