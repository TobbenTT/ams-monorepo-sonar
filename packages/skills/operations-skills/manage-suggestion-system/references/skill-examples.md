# Examples - manage-suggestion-system

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Mining Operation -- Suggestion Pipeline Dashboard

**Organization**: Copper concentrator, 280 employees (150 operators, 60 maintenance, 30 supervisors, 40 engineering/admin)

**Monthly Suggestion Pipeline (March 2026):**

| Status | Count | % of Total | Avg Age (days) |
|--------|-------|-----------|---------------|
| New (awaiting screening) | 12 | 8.6% | 3.2 |
| Under Technical Evaluation | 18 | 12.9% | 8.7 |
| Accepted (awaiting implementation) | 24 | 17.1% | 22.4 |
| In Implementation | 31 | 22.1% | 41.8 |
| Completed (verified) | 47 | 33.6% | -- |
| Declined (with feedback) | 8 | 5.7% | -- |
| **Total YTD Submissions** | **140** | **100%** | -- |

**KPI Summary (Q1 2026):**

| KPI | Value | Target | Status |
|-----|-------|--------|--------|
| Participation Rate (annualized) | 2.0 ideas/emp/year | 3.0 | Yellow -- growing from 0.8 last year |
| Implementation Rate | 66% | 80% | Yellow -- bottleneck in maintenance resources |
| Average Time-to-Evaluate | 11.2 days | 15 days | Green |
| Average Time-to-Implement | 38.4 days | 45 days | Green |
| Value Generated (Q1) | $142,000 | $100,000 | Green -- one high-impact suggestion |
| Recognition Coverage | 89% | 95% | Yellow -- 5 completions missed recognition |

**Category Distribution:**

| Category | Submissions | Accepted | Implemented | Value ($) |
|----------|-----------|----------|-------------|-----------|
| Safety | 32 (23%) | 28 | 19 | $18,400 |
| Productivity | 38 (27%) | 24 | 14 | $87,200 |
| Cost Reduction | 26 (19%) | 18 | 8 | $31,600 |
| Quality | 18 (13%) | 12 | 4 | $4,800 |
| Environment | 14 (10%) | 8 | 2 | -- |
| Morale | 12 (8%) | 10 | 6 | -- (qualitative) |

### Example 2: High-Impact Suggestion Implementation Tracking

**Suggestion ID**: SGS-CONC-2026-0023
**Submitter**: Carlos Mendez, Shift B Operator, Grinding Area
**Category**: Productivity
**Description**: "El molino SAG pierde 15-20 minutos cada cambio de turno porque el operador entrante debe recalibrar el set point del agua de proceso manualmente. Si automatizamos el handover del set point via DCS, eliminamos esta perdida en cada cambio de turno."

**Evaluation Scorecard:**

| Criterion | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Feasibility | 25% | 5 | 1.25 |
| Impact | 30% | 4 | 1.20 |
| Implementation Cost | 15% | 4 | 0.60 |
| Strategic Alignment | 15% | 4 | 0.60 |
| Urgency | 15% | 3 | 0.45 |
| **Total** | **100%** | -- | **4.10** |

**Decision**: Accepted (Quick-win track: estimated cost $2,800, implementation time 3 weeks)

**Implementation Tracking:**

| Milestone | Target Date | Actual Date | Status |
|-----------|-----------|-------------|--------|
| DCS programming specification | 2026-02-15 | 2026-02-14 | Completed |
| DCS modification and testing | 2026-02-28 | 2026-03-02 | Completed (+2 days) |
| Operator training (all shifts) | 2026-03-07 | 2026-03-07 | Completed |
| 30-day verification period | 2026-04-07 | 2026-04-07 | Completed |

**Benefit Realization:**
- Estimated at acceptance: 17.5 min/shift x 3 shifts/day x 365 days = 319 hours/year x 2,200 TPH = 701,800 tonnes/year additional throughput capacity = $140,360/year at $0.20/tonne margin
- Actual measured (30-day): 14.8 min/shift average saved = $118,700/year annualized (85% of estimate)

**Recognition**: Monthly highlight (March team meeting), Quarterly award ($200 gift card + certificate), nominated for Annual Innovation Award
