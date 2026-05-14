# MCP Integrations - embed-risk-based-decisions

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Access asset data and failure history for risk assessment; configure risk fields"
capabilities:
  - Query asset register for criticality and condition data
  - Extract failure history for probability estimation
  - Access maintenance cost data for financial consequence modeling
  - Configure risk ranking fields in equipment master data
  - Link work order priority to asset risk level
authentication: API Key + OAuth2
usage_in_skill:
  - Step 1: Assess current risk management practices in CMMS
  - Step 4: Build consequence models using failure cost data
  - Step 8: Populate risk register with asset data
  - Step 10: Configure CMMS risk fields and scheduling rules
```

### mcp-excel
```yaml
name: "mcp-excel"
server: "@anthropic/excel-mcp"
purpose: "Build risk assessment toolkit, consequence models, and prioritization tools"
capabilities:
  - Create structured risk matrix spreadsheets
  - Build consequence calculation models with formulas
  - Develop investment prioritization scoring models
  - Generate risk register templates with data validation
  - Create dashboard-ready data outputs
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Build risk matrix and scales in toolkit spreadsheet
  - Step 4: Build consequence models as calculation tools
  - Step 9: Build investment prioritization scoring model
  - Step 8: Create and maintain risk register
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Store framework documents, risk registers, and training materials"
capabilities:
  - Retrieve existing corporate risk management documentation
  - Store Risk-Based Decision Framework document
  - Manage risk register as SharePoint List with version control
  - Store training materials and quick reference guides
  - Manage document approval workflows for risk appetite statement
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Retrieve existing ERM framework and risk documentation
  - Step 3: Store risk framework document and toolkit
  - Step 8: Store and manage risk register
  - Step 12: Store governance and review documentation
```

---
