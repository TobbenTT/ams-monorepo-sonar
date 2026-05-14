# MCP Integrations - forecast-program-completion

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### project-database

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read/Write** | EVM database | Store and retrieve monthly BCWS/BCWP/ACWP data, performance indices, forecast values per WBS element |
| **Read/Write** | Forecast history | Track monthly EAC values, CPI/SPI trends, Monte Carlo results over project life |
| **Dashboard** | S-curve visualization | Automated S-curve generation from cumulative data |
| **Dashboard** | EVM performance dashboard | Real-time CPI/SPI gauges, trend charts, traffic light indicators |
| **Dashboard** | Monte Carlo results | Probability distribution visualization, tornado diagrams |
| **Dashboard** | Variance decomposition | Pareto charts of cost and schedule root causes |

### mcp-sharepoint

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Read** | Retrieve schedule data exports | P6/MSP schedule exports for Monte Carlo input |
| **Read** | Retrieve risk register | Current risk register with quantified impacts for Monte Carlo |
| **Read** | Access change log | Approved changes for baseline update and variance decomposition |
| **Read** | Retrieve historical benchmarks | Industry CPI/SPI benchmarks, project comparison data |
| **Write** | Store monthly forecast reports | Version-controlled forecast reports with distribution tracking |
| **Write** | Store EVM dashboards | Monthly dashboard workbooks |
| **Write** | Store Monte Carlo output files | Simulation results, distribution data, sensitivity analysis |

### mcp-outlook

| Operation | Purpose | Details |
|-----------|---------|---------|
| **Send** | Distribute monthly forecast reports | Send to project management team, client, and stakeholders |
| **Send** | Early warning alerts | Automated notification when CPI < 0.90 or SPI < 0.90 |
| **Send** | Critical alerts | Immediate notification when CPI < 0.80 or TCPI > 1.20 |
| **Send** | Recovery plan distribution | Distribute recovery scenario analysis to decision makers |

---
