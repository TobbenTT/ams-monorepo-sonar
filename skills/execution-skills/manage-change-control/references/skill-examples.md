# Examples - manage-change-control

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: EPC Scope Change

**Input:** EPC contractor requests additional structural steel for seismic upgrade (CR-2025-047). The client's seismologist has updated the site-specific seismic study, requiring structural modifications to the crusher building steel frame. Estimated cost USD 1.2M, estimated schedule impact 15 calendar days.

**Process:**
1. **Initiate**: Log CR-2025-047, Type: Regulatory (seismic requirement), Urgency: Routine
2. **Assess Impact**:
   - Cost: Direct $1.2M (steel fabrication, erection, engineering redesign) + Indirect $180K (extended crane hire, supervision) = $1.38M total
   - Schedule: 15 calendar days on non-critical path activity (crusher building steel erection). Nearest critical path activity: crusher mechanical installation (20 days float). No impact on project completion date.
   - Scope: WBS 3.2.1 (Crusher Building Structure) affected, 45 tonnes additional steel
   - Risk: Structural adequacy risk mitigated by this change; new risk of fabrication quality for accelerated steel delivery
3. **Classify**: Major (>$50K, <$500K threshold exceeded at $1.38M -> re-classify as Critical)
4. **Approve**: Route to Steering Committee. Recommendation: Approve (safety-driven, seismic code compliance mandatory)
5. **Implement**: Update BAC +$1.38M, update schedule with 15-day activity, draw from contingency (Regulatory category)
6. **Close-out**: Compare actual vs. estimated after construction complete

**Output:**
- Impact Assessment Document (CR-2025-047): 8 pages with full cost/schedule/scope/risk analysis
- Change Register updated with CR-2025-047, status: "Pending Approval"
- Recommendation: Approve (safety-driven compliance requirement)
- If approved: Updated EAC (+$1.38M), contingency reduced by $1.38M, updated schedule with no completion date impact

### Example 2: Design Development vs. Scope Change

**Input:** Engineering identifies need for larger pump due to updated process conditions. Original design specified 200 HP centrifugal pump; updated process modeling shows 300 HP is required to meet throughput targets under revised slurry density conditions.

**Process:**
1. **Classify Type**: Design Development (not Scope Change) -- same function (pumping slurry to cyclones), same system, updated performance requirement based on refined process data. The scope was always to pump slurry at the required rate; the specification is being refined.
2. **Assess Impact**:
   - Cost: $45K differential (pump price delta $28K + motor upgrade $12K + foundation modification $5K). Within project contingency for design development.
   - Schedule: 0 days (pump is long-lead item already ordered at 200 HP -- but 300 HP has same delivery time from vendor, change order to manufacturer required within 5 days to avoid delay)
   - Scope: No WBS scope change; pump specification update within WBS 4.3.2
   - Risk: Performance risk reduced (correctly sized pump). New risk: vendor change order processing time.
3. **Classify**: Minor (<$50K, <5 days)
4. **Approve**: Route to Project Manager. Urgent: vendor change order deadline in 5 days.
5. **Implement**: Issue pump specification revision, process vendor change order, draw $45K from contingency (Design Development category)
6. **Close-out**: Verify pump received at correct specification

**Output:**
- Impact Assessment Document (CR-2025-052): 5 pages, classified as Design Development (not scope change)
- Recommendation: Approve urgently (5-day vendor deadline)
- Contingency draw: $45K from Design Development category
- No baseline change (design development absorbed within contingency)
- Updated change register and trend analysis

### Example 3: Monthly Change Trend Analysis

**Input:** Month 14 of 36-month project. Project Manager requests monthly change control report with trend analysis.

**Process:**
1. Compile change activity for Month 14:
   - 8 CRs submitted (vs. 5/month average)
   - 6 CRs assessed and decided (4 approved, 1 rejected, 1 deferred)
   - 3 CRs carried forward from prior months
2. Cumulative impact analysis:
   - 47 total CRs submitted to date
   - 31 approved, 9 rejected, 4 deferred, 3 in process
   - Cumulative approved cost impact: +$8.7M (3.5% of $250M BAC)
   - Cumulative schedule impact: +22 days (absorbed in float, no completion date change yet)
   - Contingency consumed: $6.2M of $25M (24.8%)
3. Trend analysis:
   - Submission rate increasing (8/month vs. 5/month average) -- entering construction phase
   - Top source: construction field changes (40%), followed by design development (25%), client-directed (20%)
   - Root causes: site conditions (35%), design detail refinement (30%), scope gaps (20%), regulatory (15%)
   - Assessment turnaround: average 7 days (within 10-day SLA)
4. Concerns identified:
   - Construction field changes accelerating -- may indicate design quality issues
   - Contingency burn rate (24.8% at Month 14 of 36) is ahead of plan (should be ~20%)

**Output:**
- Monthly Change Control Report (8 pages) with executive summary, trend charts, and recommendations
- Key recommendation: investigate root cause of increasing construction field changes (potential design quality issue)
- Contingency forecast: at current burn rate, contingency will be exhausted by Month 28 (8 months before completion)
- Recommended action: commission design quality audit, consider contingency replenishment request
