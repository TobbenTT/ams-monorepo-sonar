# MCP Integrations - track-long-lead-procurement

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Purchase order data extraction and procurement system integration"
capabilities:
  - Read purchase order register (PO numbers, items, vendors, dates, values)
  - Read goods receipt data (delivery confirmations, inspection results)
  - Read vendor performance data (delivery history, quality history)
  - Track PO status changes (open, partially delivered, fully delivered, closed)
  - Query payment status for vendor relationship management
authentication: API Key + OAuth2
usage_in_skill:
  - Step 1: Extract all long-lead POs from ERP system
  - Step 5: Monitor PO milestone updates
  - Step 8: Record goods receipt and inspection results
  - Step 13: Reconcile procurement costs
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Vendor communication and alert distribution"
capabilities:
  - Send expediting queries to vendors per schedule
  - Distribute alert notifications to project team
  - Send weekly long-lead procurement status reports
  - Track vendor email responses and commitments
  - Schedule vendor calls and factory visit coordination
  - Distribute gate review procurement packages
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Send initial vendor communication establishing expediting protocol
  - Step 5: Send scheduled expediting queries to vendors
  - Step 6: Distribute alert notifications at appropriate levels
  - Step 9: Distribute weekly status reports
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage and register management"
capabilities:
  - Store long-lead procurement register as SharePoint list
  - Store vendor expediting reports and FAT documentation
  - Store logistics documentation (shipping docs, customs papers)
  - Store inspection reports and photographs
  - Manage vendor contact matrix
  - Version control for tracker documents
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Publish long-lead register
  - Step 5: Store vendor expediting reports
  - Step 8: Store FAT and inspection documentation
  - Step 9: Store weekly reports
```

---
