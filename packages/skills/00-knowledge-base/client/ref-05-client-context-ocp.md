# REF-05: Client Context — OCP AI Maintenance Solution

## Source: RFI Presentation, Data Requirements Document, Meeting Transcripts

---

## 1. Client Profile

| Field | Value |
|-------|-------|
| **Client** | OCP — Office Cherifien des Phosphates |
| **Industry** | Phosphate mining and industrial processing |
| **Country** | Morocco |
| **Scale** | 15 plants |
| **System of Record** | SAP PM |

### Key Contacts

| Role | Name | Email |
|------|------|-------|
| OCP Client | Mouad TOUIL | Mouad.TOUIL@ocpgroup.ma |
| OCP Maintenance Solutions | Nada BENAZZOUZ | Nada.BENAZZOUZ@ocpgroup.ma |
| VSC (Consulting) | Jose CORTINAT | jose.cortinat@valuestrategyconsulting.com |

---

## 2. Current Pain Points

| # | Problem | Impact |
|---|---------|--------|
| 1 | 50% of work requests incorrectly marked Priority 1 | Planner overload, schedule disruption |
| 2 | Planners spend hours confirming material availability | Wasted planner time |
| 3 | Heterogeneous workflows — no standardization across 15 plants | Inconsistent quality |
| 4 | Backlog poorly stratified and managed | Missed work, inefficient scheduling |
| 5 | Reliance on tribal knowledge | Knowledge loss risk |
| 6 | Unstructured emails/informal channels for work requests | Data quality issues |

---

## 3. MVP Scope — 3 Original Functionalities

### 3.1 Intelligent Field Capture

**Problem solved:** Technicians report issues via unstructured emails, calls, notes.

**Solution:**
- Voice + image input from field technicians
- AI auto-structures: equipment TAG, failure mode, priority, spare parts
- Validation step before submission to planner

**Target:** Eliminate unstructured communications; capture rich context at source.

### 3.2 AI Planner Assistant

**Problem solved:** Planners spend 30-45 min per work request gathering data manually.

**Solution:**
- Receives structured work requests with full context
- Auto-validates: material availability, workforce, shutdown schedule
- Suggests realistic priority and resource requirements

**Target:** 80% reduction in planning time (30-45 min → 10-15 min).

### 3.3 Backlog Optimization

**Problem solved:** Backlog is flat, not stratified; work grouping is manual.

**Solution:**
- Stratifies backlog by reason (awaiting materials, shutdown, equipment)
- Identifies groupable work packages
- Generates optimized schedule proposals

**Target:** 40-50% improvement in schedule adherence.

---

## 4. Technology Stack (from RFI)

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (field capture) |
| Web Dashboard | React (planner interface) |
| AI/NLP | Claude Sonnet 4 |
| Computer Vision | Image analysis |
| Backend | Node.js / Python |
| Database | PostgreSQL |
| Cache | Redis |
| Integration | SAP PM APIs (bidirectional) |
| Real-time | PI System connector |
| API | REST APIs |

---

## 5. Data Requirements (15 Categories, 3-Tier Priority)

### Tier 1: CRITICAL (Weeks 1-2)

| # | Category | Format | SAP Transaction |
|---|----------|--------|----------------|
| 1 | Work Management Workflow Documentation | PPT/Visio/Word | - |
| 2 | Equipment Hierarchy & Master Data | CSV/Excel | - |
| 3 | Work Order History (12+ months) | Excel/CSV | IW38/IW39 |
| 4 | Spare Parts Catalog (BOM) | Excel/CSV | - |
| 5 | Current Spare Parts Inventory | Excel/CSV | - |
| 6 | Current Maintenance Backlog (3 months) | Excel/CSV | - |

### Tier 2: IMPORTANT (Weeks 3-4)

| # | Category | Format | SAP Transaction |
|---|----------|--------|----------------|
| 7 | Technical Manuals (O&M, P&IDs, datasheets) | PDF | - |
| 8 | Preventive Maintenance Plans | Excel/CSV | IP10 |
| 9 | Available Workforce (by specialty) | Excel | - |
| 10 | Shutdown Calendar (6 months) | Excel/Calendar | - |
| 11 | Production Plan and Schedule | Excel/Calendar | - |

### Tier 3: DESIRABLE (Weeks 5-6)

| # | Category | Format |
|---|----------|--------|
| 12 | Basic FMEA | Excel |
| 13 | Reference Photographs (5-10 per equipment) | JPG/PNG |
| 14 | Condition Monitoring Data | PDF/Excel |
| 15 | Reference Costs (man-hour, materials, production loss) | Excel |

### Expected Data Folder Structure

```
/OCP_MVP_Data/
  /1_Equipment_MasterData/
  /2_Work_Orders_History/
  /3_Spare_Parts/
  /4_Backlog/
  /5_Manuals/
  /6_Maintenance_Plans/
  /7_Resources/
  /8_Schedules/
  /9_FMEA_RCM/
  /10_Photos/
  /11_Condition_Monitoring/
  /12_Costs/
  /13_Processes & Workflows/
```

---

## 6. Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 0: Assessment** | 2-4 weeks | Readiness Report, Business Case, Pilot Plan |
| **Phase 1: MVP Development** | 8-12 weeks | Complete MVP, SAP integration, Testing |
| **Phase 2: Pilot Deployment** | 4-6 weeks | Pilot, user feedback, refinement |
| **Total** | **16-24 weeks** | Pilot in production |

**Target start:** March 2026

### Monthly Breakdown

| Month | Activities |
|-------|-----------|
| 1 | Readiness assessment, data collection (critical), pilot site selection |
| 2 | Field capture dev, planner assistant core, important docs collection |
| 3 | Backlog optimization, SAP integration, testing & training |
| 4 | Pilot deployment, user feedback, refinement |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Planning time per work request | 60-70% reduction |
| Schedule adherence | 40-50% improvement |
| Priority misclassification | 80% reduction |
| Work request processing time | 30-40% faster |
| ROI | Positive within 12 months |

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Data quality issues | Phase 0 validates; dummy data for gaps; iterative improvement |
| User adoption resistance | Co-design from Day 1; weekly demos; comprehensive training |
| Integration complexity | SAP PM expertise; read-only first; sandbox testing |
| Scope creep | Clear MVP definition; 2-week sprints; change request process |
| JESA alignment mismatch | Early coordination with JESA team; flexible workflow config |
| ROI not achieved | Baseline metrics in Phase 0; monthly measurement |

---

## 9. Constraints & Dependencies

| Constraint | Detail |
|-----------|--------|
| JESA project | Must align with JESA workflow standardization already underway at OCP |
| Multi-plant workflows | Must support multiple workflow versions across 15 plants |
| SAP PM central | SAP PM is the system of record — all data flows through SAP |
| Co-design | End-user involvement mandatory from Day 1 |
| Mobile-first field | Field technicians need mobile device support (voice + image) |
| AIRI framework | Assessment aligned with INCIT's AI Readiness framework |

---

## 10. Investment Framework

| Phase | Pricing Model |
|-------|-------------|
| Phase 0 (Assessment) | Separate fee, detailed proposal to follow |
| Phase 1 (Development) | Fixed price based on refined Phase 0 scope |

**Value proposition:** Transparent phased approach, assessment validates ROI before full commitment, fixed-price for predictability, competitive vs. international consultancies.
