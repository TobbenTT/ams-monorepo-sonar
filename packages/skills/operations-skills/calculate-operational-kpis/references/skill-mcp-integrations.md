# MCP Integrations - calculate-operational-kpis

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Primary source for maintenance work order data, equipment register, and failure events"
capabilities:
  - Extract work orders by type, date range, equipment, and status
  - Access equipment hierarchy and criticality ratings
  - Retrieve PM schedule and compliance data
  - Access failure event history with cause codes
  - Retrieve backlog data (open WOs with hours estimates)
  - Access labor time records per work order
authentication: API Key / Service Account
usage_in_skill:
  - Step 1: Establish connection and validate data availability
  - Step 2: Extract maintenance and reliability data for calculation period
  - Step 6: Calculate maintenance KPIs from work order data
  - Step 7: Calculate reliability KPIs from failure event data
```

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Source for cost data, production data, inventory data, and budget targets"
capabilities:
  - Extract maintenance cost breakdown by category and cost center
  - Access production output and operating hour records
  - Retrieve MRO inventory data (stock levels, usage, stockouts)
  - Access budget data for variance calculation
  - Retrieve asset valuation (RAV) data
  - Access energy and utility consumption data
authentication: Service Account / OAuth2
usage_in_skill:
  - Step 1: Establish connection for cost and production data
  - Step 2: Extract cost and production data for calculation period
  - Step 5: Calculate production KPIs from production data
  - Step 8: Calculate cost efficiency KPIs from financial data
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Dashboard visualization and automated refresh of KPI displays"
capabilities:
  - Create and update Power BI datasets with KPI values
  - Configure automated refresh schedules
  - Publish dashboards for stakeholder self-service access
  - Support drill-down from executive to operational detail
  - Generate alert notifications from dashboard data
authentication: Service Principal
usage_in_skill:
  - Step 13: Push KPI data to Power BI datasets
  - Step 13: Verify dashboard refresh
  - Step 11: Configure alert rules in Power BI for threshold monitoring
```

---
