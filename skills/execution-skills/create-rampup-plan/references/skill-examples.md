# Examples - create-rampup-plan

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example Ramp-Up Curve (Monthly Targets)

```
RAMP-UP CURVE - PROJECT COPPER GREEN
Design Capacity: 120,000 tpd | Cu Recovery Target: 89% | SOP: October 2027
========================================================================

Month | Calendar  | Phase        | P10 (%)| P50 (%)| P90 (%)| Target tpd | Milestone
------|-----------|-------------|--------|--------|--------|------------|----------
  1   | Oct 2027  | Line-Out    |   20%  |   10%  |    5%  |   12,000   | M0: First Feed, M1: First Product
  2   | Nov 2027  | Line-Out    |   35%  |   20%  |   12%  |   24,000   |
  3   | Dec 2027  | Initial Ramp|   50%  |   35%  |   20%  |   42,000   | M2: 25% Design (P50)
  4   | Jan 2028  | Initial Ramp|   60%  |   45%  |   28%  |   54,000   |
  5   | Feb 2028  | Initial Ramp|   70%  |   52%  |   35%  |   62,400   |
  6   | Mar 2028  | Accel. Ramp |   78%  |   60%  |   42%  |   72,000   | M3: 50% Design (P50)
  7   | Apr 2028  | Accel. Ramp |   85%  |   68%  |   50%  |   81,600   |
  8   | May 2028  | Accel. Ramp |   90%  |   75%  |   58%  |   90,000   | M4: 75% Design (P50)
  9   | Jun 2028  | Final Ramp  |   93%  |   82%  |   65%  |   98,400   |
  10  | Jul 2028  | Final Ramp  |   96%  |   88%  |   72%  |  105,600   |
  11  | Aug 2028  | Final Ramp  |   98%  |   92%  |   78%  |  110,400   |
  12  | Sep 2028  | Stabilize   |   99%  |   95%  |   83%  |  114,000   | M5: 100% Design (P50)
  13  | Oct 2028  | Stabilize   |  100%  |   97%  |   88%  |  116,400   | M6: Performance Test (P50)
  14  | Nov 2028  | Stabilize   |  100%  |   98%  |   91%  |  117,600   |
  15  | Dec 2028  | Steady State|  100%  |  100%  |   95%  |  120,000   | M7: Steady State (P50)

ANNUAL PRODUCTION ESTIMATE (Year 1):
  P10:  32.4M tons (90% of full-year capacity)
  P50:  26.1M tons (73% of full-year capacity)
  P90:  19.8M tons (55% of full-year capacity)

FINANCIAL IMPACT OF RAMP-UP SPEED:
  P10 vs P50 revenue difference: ~$XX M (faster ramp = higher NPV)
  P90 vs P50 revenue difference: ~$XX M (slower ramp = lower NPV)
  Each month of delay at design capacity: ~$XX M revenue impact
```

### Example Milestone Definition

```
MILESTONE M3: 50% DESIGN CAPACITY
===================================

Criteria for Achievement:
  [1] Throughput: >60,000 tpd sustained for >7 consecutive calendar days
  [2] Quality: Cu concentrate grade >25% Cu in >80% of daily samples
  [3] Recovery: Overall Cu recovery >82% (average over 7-day period)
  [4] Availability: Overall plant availability >75% during the 7-day period
  [5] Safety: No OSHA-recordable incidents in the 7-day demonstration period
  [6] Environment: All discharge/emission parameters within permit limits

Target Date: March 2028 (Month 6)

Approval Authority: Operations Manager (with endorsement from Commissioning Manager)

Pre-Conditions for Advancing to Phase 3 (Accelerated Ramp):
  - All M3 criteria met and documented
  - Root causes of any significant interruptions during Phase 2 identified and resolved
  - Maintenance program validated for current operating conditions
  - Operating procedures updated based on Phase 2 learnings
  - Staffing confirmed adequate for increased throughput rates

Advance Decision Documentation:
  - M3 Achievement Certificate signed by Operations Manager
  - Phase 2 Summary Report (key learnings, issues resolved, outstanding items)
  - Phase 3 readiness checklist completed
  - Updated ramp-up curve (if adjustments needed based on Phase 2 performance)
```

### Example Support Tapering Schedule

```
SUPPORT TAPERING SCHEDULE
==========================

| Resource                    | Start    | Plan Demob | Criteria for Demob                    | $/day  |
|-----------------------------|----------|------------|---------------------------------------|--------|
| SAG Mill Vendor Rep         | Month 1  | Month 4    | Mill operating >72hrs stable          | $2,500 |
| Ball Mill Vendor Rep        | Month 1  | Month 4    | Mill operating >72hrs stable          | $2,500 |
| Flotation Process Advisor   | Month 1  | Month 6    | Recovery >85% sustained               | $3,000 |
| DCS/Control System Engineer | Month 1  | Month 3    | All control loops tuned and stable    | $2,800 |
| Electrical Protection Spec. | Month 1  | Month 2    | All protection relays verified        | $2,200 |
| EPC Process Engineer (x2)   | Month 1  | Month 6    | Process stabilized at >50% design     | $4,000 |
| EPC Mech. Engineer          | Month 1  | Month 4    | Major teething issues resolved        | $2,000 |
| Additional Operator Pool(8) | Month 1  | Month 8    | Core team competency verified         | $8,000 |
| VSC OR Advisor              | Month 1  | Month 12   | Steady state declared                 | $3,500 |

TOTAL RAMP-UP SUPPORT COST ESTIMATE: $1.2M - $1.8M (depending on extension needs)

EXTENSION TRIGGER: If a resource is needed beyond planned demob date:
  1. Operations Manager submits extension request with justification
  2. OR Program Manager approves extensions up to 30 days
  3. Extensions >30 days require Plant Manager approval with financial review
```
