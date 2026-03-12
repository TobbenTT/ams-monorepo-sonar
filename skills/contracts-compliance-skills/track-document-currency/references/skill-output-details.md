# Detailed Output Specification - track-document-currency

*Detailed output formats and field definitions extracted from CLAUDE.md.*
*Read this file when you need the complete output field definitions and format details.*

---


#### Sheet 2: "Overdue Documents"
Detailed list of all overdue documents sorted by days overdue (descending):

| Column | Field | Description |
|--------|-------|-------------|
| A | Document_Number | Document identifier |
| B | Document_Title | Document title |
| C | Document_Type | SOP/EOP/P&ID/etc. |
| D | System_Area | Plant system or area |
| E | Current_Revision | Current revision in DMS |
| F | Last_Review_Date | Date of last certified review |
| G | Review_Due_Date | Date review was/is due |
| H | Days_Overdue | Calendar days past due |
| I | Document_Owner | Assigned owner/responsible person |
| J | Owner_Department | Department of document owner |
| K | Regulatory_Requirement | Which regulation requires this review (e.g., OSHA PSM, API 510) |
| L | Risk_Rating | HIGH/MEDIUM/LOW based on document type and overdue duration |
| M | Cascade_Impact | Number of downstream documents affected |
| N | Review_Initiated | Has review workflow been started (Y/N) |
| O | Estimated_Completion | Estimated review completion date |
| P | Comments | Status comments from document owner |

#### Sheet 3: "Upcoming Reviews (90-Day Window)"
Documents due for review in the next 90 days, organized by due date to enable planning.

#### Sheet 4: "Change Cascade Report"
For each source document that has been revised since the last currency audit:

| Source Document | Revision Change | Date Changed | Affected Documents (Count) | Affected Documents (List) | Review Status |
|----------------|----------------|-------------|---------------------------|--------------------------|--------------|
| P&ID-100-001 Rev D -> Rev E | Added instrument TI-100-025 | 2026-01-15 | 3 | SOP-100-001, SOP-100-002, EDS-100-PP-001 | SOP-100-001: REVIEWED; Others: PENDING |

#### Sheet 5: "Orphaned Documents"
Documents with no assigned owner or whose assigned owner is no longer in the organization:
- Document details
- Last known owner
- Suggested reassignment based on document type and area
- Action required

#### Sheet 6: "Currency Trend"
Monthly trend data showing currency percentage over time:
- 12-month rolling trend by document type
- Trend direction (improving/stable/declining)
- Projected compliance date at current improvement rate

### Secondary Output: Automated Notifications

**Review Due Notifications** (via mcp-outlook):
- **90-day notice**: Courtesy notification to document owner: "Your document {DocNumber} is due for review on {DueDate}. Please plan accordingly."
- **60-day notice**: Reminder with review task link: "Review of {DocNumber} is due in 60 days. Click here to initiate review workflow."
- **30-day notice**: Urgent reminder with escalation warning: "URGENT: {DocNumber} review due in 30 days. If not initiated by {Date}, this will be escalated to department manager."
- **Overdue notice**: Escalation to department manager: "OVERDUE: {DocNumber} was due for review on {DueDate} ({DaysOverdue} days ago). Regulatory non-compliance risk."
- **Monthly summary**: Consolidated report to operations manager showing all overdue and upcoming reviews for their area

### Formatting Standards
- Header row: Bold, dark green background (#006633), white font
- Risk ratings: RED (>180 days overdue or safety-critical), AMBER (30-180 days overdue), GREEN (current or <30 days to due)
- Conditional formatting on Days_Overdue column (graduated red scale)
- Trend charts embedded in dashboard sheet
- Hyperlinks to documents in DMS where available
- Freeze panes on header row
- Auto-filter enabled on all detail sheets
