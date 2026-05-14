# MCP Integrations - model-rampup-trajectory

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-excel
```yaml
name: "mcp-excel"
server: "@anthropic/excel-mcp"
purpose: "Primary modeling platform for ramp-up trajectory calculations"
capabilities:
  - Create and update ramp-up forecast workbooks with multiple scenario sheets
  - Execute Monte Carlo simulation calculations using Excel formulas and data tables
  - Generate charts: S-curves, tornado diagrams, histograms, waterfall charts
  - Import actual production data from operations reporting
  - Maintain version history of model iterations
  - Export data for Power BI integration
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Steps 1-4: Build model workbook with configuration, benchmarks, and OR data
  - Steps 5-6: Run Monte Carlo simulation and sensitivity analysis
  - Step 7: Calculate NPV impact scenarios
  - Steps 9-10: Update with actual data and recalibrate
  - Step 12: Generate close-out report and archive
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Executive dashboard for ramp-up performance tracking"
capabilities:
  - Publish ramp-up trajectory dashboards with live data refresh
  - Create interactive visualizations for scenario analysis
  - Update datasets with weekly OR readiness and production data
  - Generate drill-down views from program level to domain detail
  - Support stakeholder self-service access to forecast data
authentication: Service Principal
usage_in_skill:
  - Step 8: Publish initial ramp-up forecast dashboard
  - Steps 9-11: Update dashboard weekly with actual vs. forecast data
  - Step 7: Publish NPV impact and financial analysis views
  - Step 6: Create interactive sensitivity analysis views
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage and OR readiness data access"
capabilities:
  - Read OR readiness data from deliverable tracking lists
  - Read project configuration and engineering documents
  - Store ramp-up model files with version control
  - Store forecast reports and presentation decks
  - Access historical project data for benchmarking
  - Manage document approval workflows for forecast releases
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Read project configuration and design parameters
  - Step 3: Query OR readiness data from deliverable tracking
  - Step 8: Store model outputs and forecast reports
  - Step 12: Archive completed model and close-out documentation
  - Step 14: Access historical project data for benchmark updates
```

---
