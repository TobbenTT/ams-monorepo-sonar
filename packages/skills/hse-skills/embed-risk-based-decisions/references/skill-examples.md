# Examples - embed-risk-based-decisions

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Risk Appetite Definition for a Mining Company

```
RISK APPETITE STATEMENT - Minera del Pacifico S.A.
Approved: CEO, 2026-03-15

SAFETY:
  Intolerable: Individual fatality risk >1 in 10,000 per year from asset failures
  ALARP Upper: Individual serious injury risk >1 in 1,000 per year
  ALARP Lower: Individual minor injury risk >1 in 100 per year
  Broadly Acceptable: Risk below ALARP lower boundary
  Note: All safety risks must be reduced to ALARP. Cost is NOT a justification
  for accepting intolerable safety risk.

ENVIRONMENTAL:
  Intolerable: Release causing permanent environmental damage or regulatory prosecution
  ALARP Upper: Release requiring external remediation or regulatory notification
  ALARP Lower: Contained release with no external impact
  Note: We target zero regulatory non-compliance events from asset failures.

FINANCIAL (single event):
  Intolerable: Loss >$25M from a single asset failure event
  High: Loss $5M-$25M (Board notification required; insurance claim)
  Medium: Loss $500K-$5M (Management approval for risk acceptance)
  Low: Loss <$500K (Standard operational management)

OPERATIONAL:
  Intolerable: Unplanned shutdown >30 days for any critical system
  High: Unplanned shutdown 7-30 days
  Medium: Unplanned shutdown 24-168 hours
  Low: Unplanned shutdown <24 hours

Application: All capital and maintenance decisions with potential consequences exceeding
"Low" threshold MUST include documented risk assessment using the approved framework.
```

### Example 2: Risk-Based Capital Investment Prioritization

```
CAPITAL PROGRAM RISK RANKING - FY2027
Budget Available: $45M
Candidates: 28 projects totaling $82M requested

Risk-Weighted Scoring (top 10):
+------+--------------------------------+--------+------+------+------+------+------+-------+
| Rank | Project                        | Cost   | Risk | Value|Urgcy | Strat| Ready| TOTAL |
|      |                                | ($M)   | (30%)|(25%) |(20%) |(15%) |(10%) |       |
+------+--------------------------------+--------+------+------+------+------+------+-------+
|  1   | SAG Mill drive replacement     | $8.2M  | 4.8  | 4.5  | 5.0  | 4.0  | 5.0  | 4.68  |
|  2   | Tailings dam sensor upgrade    | $3.1M  | 5.0  | 3.5  | 4.5  | 4.5  | 4.0  | 4.40  |
|  3   | Crusher liner change facility  | $5.5M  | 3.5  | 4.8  | 4.0  | 4.0  | 4.5  | 4.11  |
|  4   | Power substation renewal       | $12.0M | 4.5  | 3.5  | 3.5  | 4.5  | 3.5  | 3.95  |
|  5   | Flotation cell mechanism       | $4.8M  | 3.0  | 4.5  | 4.0  | 4.0  | 4.5  | 3.90  |
|  6   | CBM technology deployment      | $2.2M  | 2.5  | 4.0  | 3.0  | 5.0  | 5.0  | 3.65  |
|  7   | Conveyor structural upgrade    | $6.5M  | 4.0  | 3.0  | 3.5  | 3.0  | 3.5  | 3.50  |
|  8   | CMMS upgrade                   | $1.5M  | 2.0  | 3.5  | 2.5  | 5.0  | 5.0  | 3.30  |
|  9   | Workshop expansion             | $4.0M  | 1.5  | 3.5  | 2.0  | 3.5  | 4.0  | 2.70  |
| 10   | Admin building renovation      | $2.8M  | 1.0  | 2.0  | 1.5  | 2.0  | 5.0  | 1.95  |
+------+--------------------------------+--------+------+------+------+------+------+-------+

Recommended Portfolio ($45M budget):
  Fund: Projects 1-7 ($42.3M) -- highest risk-weighted value
  Defer: Projects 8-10 and remaining 18 -- insufficient risk-weighted value
  Reserve: $2.7M for in-year emergent risk items

Key Insight: Without risk weighting, Project 4 ($12M power substation) would consume
26% of budget. Risk-weighted analysis confirms it should proceed but also highlights
Project 2 (tailings dam sensors at $3.1M) as the highest risk-reduction-per-dollar
investment in the portfolio.
```
