# Examples - create-project-closeout-report

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

**Example 1: Final Performance Summary**
```
Command: create-project-closeout-report evm-final --calculate

Final EVM Performance: Atacama Lithium Project
  Duration: 48 months (planned 42 months, +6 months / +14.3%)
  Final Cost: $527.4M (budget $485.0M at FID, +$42.4M / +8.7%)

  Final Metrics:
    CPI: 0.92 (8.7% over budget)
    SPI: 0.88 (12% behind schedule at EVM data date)
    VAC: -$42.4M

  Cost Growth Decomposition:
    Scope Changes:       +$18.2M (43% of variance) -- 12 approved CRs
    Escalation:          +$11.5M (27%) -- steel and copper price increases
    Rework:              +$6.8M  (16%) -- foundation redesign due to geotech
    Productivity:        +$4.1M  (10%) -- below-plan concrete productivity
    Estimation Error:    +$1.8M  (4%)  -- underestimated electrical scope

  Contingency Utilization:
    Original: $55.0M | Drawn: $48.3M | Remaining: $6.7M | Used: 87.8%

  Schedule Variance by Phase:
    FEL2: on time | FEL3: +1 month (geotech investigation)
    Execution: +4 months (rain delays + foundation redesign)
    Commissioning: +1 month (grinding circuit commissioning extended)

  Estimate Accuracy:
    Class 5 (FEL1): $420M estimated, $527M actual = 25.5% growth (within -30/+50 range)
    Class 3 (FID):  $485M estimated, $527M actual = 8.7% growth (within -10/+15 range)
```

**Example 2: Lessons Learned Capture**
```
Command: create-project-closeout-report lessons --phase Execution

Execution Phase Lessons (6 of 12 captured):

Lesson EX-003: Geotechnical Investigation Adequacy
  Context: During FEL2, geotechnical investigation was limited to 12 boreholes
    across the plant area. During foundation excavation, unexpected clay layer
    was encountered in the grinding circuit area requiring foundation redesign.
  Action: Foundation redesigned from spread footings to piled foundations.
    3-month schedule delay, $6.8M additional cost (rework + design + piling).
  Result: Grinding circuit foundation redesigned and constructed on piled
    foundations. Commissioning delayed by approximately 2 months net impact.
  Recommendation: For future projects in similar geological settings, invest
    in comprehensive geotechnical investigation during FEL2 (minimum 1 borehole
    per 500m2 of major equipment foundation area). Cost of additional
    investigation: approximately $200K. Cost avoided: $6.8M minimum.
  Impact: -$6.8M cost, -3 months schedule
  Applicability: All projects with significant foundation works, especially
    in regions with variable geological profiles. Critical for FEL2 phase.

Lesson EX-005: Weekly Interface Coordination Meetings
  Context: During first 6 months of execution, engineering and procurement
    operated on independent schedules with monthly coordination meetings.
    Multiple specification gaps were discovered after purchase orders were
    issued, generating 5 change requests totaling $2.1M.
  Action: Starting Month 7, weekly interface coordination meetings were
    instituted between engineering lead, procurement lead, and construction
    lead. Specification review became mandatory before PO issuance.
  Result: Change requests from specification gaps dropped from 5 in Months 1-6
    to 1 in Months 7-18. Estimated savings: $3.5M in avoided changes.
  Recommendation: Institute weekly engineering-procurement-construction
    interface meetings from Day 1 of execution. Include mandatory specification
    review gate before any purchase order issuance exceeding $50K.
  Impact: +$3.5M saved (net of meeting cost)
  Applicability: All EPC and EPCM projects during execution phase.
```
