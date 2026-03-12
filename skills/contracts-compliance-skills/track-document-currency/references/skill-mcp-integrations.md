# MCP Integrations - track-document-currency

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint
- **Read**: Query document libraries for all controlled documents and their metadata (revision, dates, owners); access document properties and version history; read document content for cross-reference extraction
- **Write**: Update document metadata (review status, review dates, owner assignments); publish currency reports and dashboards to SharePoint site; update Master Document Register
- **Monitor**: Subscribe to document library change notifications for real-time revision detection; monitor for new uploads requiring registration; detect document deletions or moves

### mcp-outlook
- **Send**: Distribute graduated alert notifications to document owners and managers; send weekly/monthly currency reports to leadership; distribute pre-audit compliance assessments
- **Calendar**: Create calendar events for review deadlines; send meeting invitations for review sessions; set reminders for escalation milestones
- **Track**: Monitor email delivery and read receipts for regulatory notifications; log communication history for audit trail
