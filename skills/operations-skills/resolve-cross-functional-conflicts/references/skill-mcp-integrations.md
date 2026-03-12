# MCP Integrations - resolve-cross-functional-conflicts

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Access equipment data, maintenance requirements, and failure history for technical conflicts"
capabilities:
  - Query equipment specifications and configuration data
  - Retrieve maintenance strategy requirements by equipment
  - Access failure history and reliability data for evidence-based analysis
  - Identify spare parts commonality and standardization impacts
  - Query CMMS configuration requirements and constraints
authentication: API Key + OAuth2
usage_in_skill:
  - Step 4: Retrieve equipment data to support domain position analysis
  - Step 6: Quantify maintenance cost impacts of each resolution option
  - Step 8: Generate technical feasibility data for option evaluation
  - Step 14: Monitor implementation of maintenance-related decisions
```

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Access financial data, procurement status, and budget allocations for cost impact analysis"
capabilities:
  - Query purchase orders, contracts, and procurement commitments
  - Retrieve budget allocations by cost center and domain
  - Access vendor pricing and commercial terms
  - Calculate lifecycle cost models for equipment alternatives
  - Track financial implications of decision options
authentication: OAuth2 (SAP / Oracle integration)
usage_in_skill:
  - Step 4: Retrieve commercial data for procurement-related conflicts
  - Step 6: Quantify cost impacts (CAPEX, OPEX, lifecycle) for each option
  - Step 9: Validate financial feasibility of resolution options
  - Step 14: Track financial compliance with decision outcomes
```

### mcp-teams
```yaml
name: "mcp-teams"
server: "@anthropic/teams-mcp"
purpose: "Real-time conflict coordination, decision meetings, and stakeholder notifications"
capabilities:
  - Post conflict notifications in OR program channel
  - Schedule decision meetings with all affected parties
  - Share decision briefs and pre-read materials
  - Record meeting decisions and action items
  - Facilitate asynchronous stakeholder input collection
  - Generate meeting summaries and minutes
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Post conflict registration notification
  - Step 4: Collect stakeholder input asynchronously
  - Step 11: Schedule and support decision meetings
  - Step 12: Facilitate decision-making and record outcomes
  - Step 13: Communicate decisions to all affected parties
```

---
