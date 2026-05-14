# MCP Integrations - certify-system-readiness

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed mcp integrations for this skill.*

---

## MCP Integrations

### mcp-sharepoint

- **Read**: Retrieve MC certificates, commissioning records, PSSR checklists, test results, training records, vendor certificates, as-built documentation, maintenance readiness confirmations
- **Write**: Store TCCC certificates, evidence packages, system readiness matrices, post-RFSU monitoring reports, Final Acceptance certificates
- **Permissions**: Read access to all project discipline libraries; Write access to Commissioning/TCCC folder and Post-RFSU folder
- **Folder Structure**: `/{project}/Commissioning/TCCC/Certificates/`, `/{project}/Commissioning/TCCC/Evidence/`, `/{project}/Commissioning/Post-RFSU/`, `/{project}/Commissioning/ReadinessMatrix/`
- **Version Control**: TCCC certificates must use document version control (Rev 0 = draft, Rev 1 = submitted, Rev 2 = approved)

### project-database

- **Read/Write**: System readiness database — track all systems across all readiness dimensions, TCCC status, approval routing, post-RFSU monitoring
- **Dashboard**: Real-time readiness matrix (traffic lights), TCCC approval pipeline, post-RFSU performance tracking
- **Views**: By system, by readiness dimension, by approval status, critical path systems, overdue items, post-RFSU issues
- **Automations**: Notify next signatory when previous signs, alert when prerequisite completed, flag systems approaching milestone date without TCCC
- **Base Structure**:
  - Table 1: System Readiness Matrix (multi-dimensional status per system)
  - Table 2: TCCC Certificates (certificate tracking with approval workflow)
  - Table 3: TCCC Prerequisites (12 prerequisites per system with status)
  - Table 4: PSSR Tracking (PSSR items per system with clearance status)
  - Table 5: Post-RFSU Monitoring (performance data and issues log)
  - Table 6: Final Acceptance (acceptance status and certificate references)

### mcp-outlook

- **Send**: TCCC submission for approval (with evidence package link), readiness status reports, post-RFSU performance summaries, Final Acceptance notifications
- **Workflow**: Sequential approval routing — notification to Construction Manager, then Commissioning Manager, then Operations Manager, then HSE Manager
- **Calendar**: TCCC target dates per system, post-RFSU review dates (30/60/90 days), Final Acceptance review dates
- **Templates**: TCCC submission email, approval request, rejection notification with reasons, post-RFSU weekly report, Final Acceptance recommendation
- **Distribution Lists**: TCCC signatories, project management, operations management, commissioning team

### mcp-jira

- **Read/Write**: Track outstanding items linked to TCCC prerequisites, post-RFSU operational issues, corrective actions from PSSR
- **Workflows**: TCCC prerequisite tracking (open → in progress → verified → confirmed), post-RFSU issue lifecycle
- **Labels**: By system, by prerequisite type, by priority, TCCC-blocking vs. non-blocking
- **Dashboards**: Prerequisite completion by system, TCCC pipeline status, post-RFSU issue aging

---
