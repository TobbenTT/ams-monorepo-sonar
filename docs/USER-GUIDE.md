# AMS Platform — User Guide

## Getting Started

### Login
1. Navigate to your AMS instance URL
2. Enter your username and password
3. Select your plant from the plant selector

### Navigation
- **Sidebar** — All modules are accessible from the left sidebar
- **Plant Selector** — Top-left dropdown to switch between plants
- **View Toggle** — Switch between Executive View and Tactical Operations View
- **Language** — Switch between English, Spanish, and Arabic (top-right)

---

## Modules Overview

### Dashboard
The main dashboard shows KPIs and performance metrics:
- **Executive View** — Strategic KPIs (Availability, MTBF, MTTR, OEE), AI summary, production/maintenance/staffing/HSE tabs
- **Tactical View** — Work volume, schedule compliance, backlog aging, WR status breakdown

### Work Management
Central hub for all work-related activities:
- **Work Requests (WRs)** — Create, validate, approve, assign work requests
- **Work Orders (WOs)** — Plan, schedule, execute, and close work orders
- **Backlog** — Track and manage pending work items

### Failures & Events
Log and analyze equipment failures:
- Color-coded priority table
- Root Cause Analysis (RCA) initiation
- AI-powered failure classification
- Master data and planning statistics

### Planning
Detailed work order planning:
- Operations list management
- Material requirements
- External vendor coordination (SAP-style forms)
- AI tools: Compare OTs, Cost Alerts, Strategy

### Scheduling
Weekly maintenance program scheduling:
- **Schedule Week** — AI-powered priority-based distribution across Mon-Fri
- **Gantt Chart** — Visual timeline of scheduled work
- **HH Balance** — Human-hours utilization by specialty
- **Materials** — Material readiness tracking

### Execution
Field execution management:
- **My Tasks** — Personal task assignments
- **Daily Meeting** — Briefing with WO cards
- **Equipment Handovers** — Shift transition tracking
- **Supervisor Sign-off** — Plan vs actual comparison
- **WO Closure** — Complete with closure report and PDF export

### Analytics
Performance analytics in two views:
- **Executive** — Top-level KPIs with trend charts, reliability metrics, cost by area
- **Tactical** — Operational discipline, WR status breakdown, Pareto analysis

### Reports
Generate and export maintenance reports:
- 6 report templates (Weekly, Backlog, KPI, Reliability, SAP, FMEA)
- Auto-generated summaries from live data
- XLSX/CSV export for all data types
- Filtered by plant

### AI Agents (CORTEX)
33 specialized AI agents:
- Equipment Doctor, Safety Checklist, Predictive Health
- Smart Backlog, Budget Sentinel, KPI Watchdog
- RCM Advisor, Chronic Failure Tracker
- Executive Report Generator

---

## Role Permissions

| Role | Dashboard | WRs | WOs | Planning | Scheduling | Execution | Analytics | Reports | Admin |
|------|-----------|-----|-----|----------|------------|-----------|-----------|---------|-------|
| Admin | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| Manager | Full | View | View | View | View | View | Full | Full | No |
| Planner | View | Full | Full | Full | Full | View | View | Full | No |
| Engineer | View | Full | View | View | View | View | Full | Full | No |
| Supervisor | View | View | View | View | View | Full | View | View | No |
| Technician | View | Create | View | No | No | Full | No | No | No |

---

## Data Import

1. Go to **Data Import** in the sidebar
2. Click **Upload** or drag-and-drop Excel/CSV file
3. Select template type (Equipment, Work Orders, etc.)
4. Map columns automatically or manually
5. Review preview and click **Import**
6. Check import history for status and errors

---

## Mobile Access

Access `/m/` routes from any mobile device:
- Create Work Requests in the field
- Execute assigned tasks
- View equipment details
- Capture photos and notes

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Search modules |
| `Esc` | Close modals |

---

## Support

For technical support, contact your system administrator.

**AMS Platform v2.0** — Value Strategy Consulting
