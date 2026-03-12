# Examples - model-rampup-trajectory

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Initial Ramp-Up Forecast for a Copper Mine

```
Command: model-rampup-trajectory forecast --project "Sierra Verde" --scenario base

Process:
  Step 1: Project Parameters
    - Industry: Mining (copper concentrator)
    - Design capacity: 120,000 tpd ore processing
    - Annual Cu production target: 320,000 tonnes
    - Cu price: $4.00/lb, Operating cost: $0.88/lb
    - Commissioning start: July 2027, Commercial operation target: Jan 2028
    - Project NPV baseline: $2.85B

  Step 2: Benchmark Loading
    - IPA benchmark for copper mining concentrators (n=47 projects, 2010-2024)
    - P50 time to design capacity: 22 months
    - Year-1 production (P50): 68% of design
    - Top quartile: 85% Year-1 production
    - Bottom quartile: 52% Year-1 production

  Step 3: OR Readiness Data (T-6 months to commissioning)
    - Operations Readiness: 65% (SOPs 55% complete, operating model 80%)
    - Maintenance Readiness: 58% (CMMS 45% configured, PM program 35% loaded)
    - Staffing & Training: 72% (82% positions filled, 65% trained)
    - Spare Parts & Supply: 48% (insurance spares 30%, commissioning spares 60%)
    - Process Knowledge: 70% (process testing 80%, vendor support agreements 60%)
    - HSE Systems: 78% (permits 70%, emergency response 85%)
    - CMMS Systems: 45% (SAP configuration in progress)
    - Regulatory: 82% (key permits obtained, 3 pending)
    - Commissioning Quality: 60% (systems tested 60%, punch list 45% closed)
    - Document Readiness: 70% (vendor docs 75%, SOPs 55%)

    Aggregate OR Readiness: 65% (weighted)

  Step 4: Model Calibration
    - Weights calibrated for copper mining: operations (0.20), maintenance (0.18),
      staffing (0.15), spares (0.12), process (0.10), HSE (0.08), CMMS (0.05),
      regulatory (0.05), commissioning (0.04), docs (0.03)
    - Transfer function exponent: 1.7 (calibrated from IPA data)
    - OR Adjustment Factor (current): 0.78

  Step 5: Monte Carlo Results (10,000 iterations)
    Months to Design Capacity:
      P10: 14 months
      P25: 18 months
      P50: 24 months
      P75: 30 months
      P90: 38 months

    Year-1 Production (% of design):
      P10: 82%
      P25: 72%
      P50: 62%
      P75: 54%
      P90: 45%

  Step 6: Sensitivity Analysis (Top 5 Domains)
    1. Spare Parts & Supply (48%): +10% readiness = -2.8 months to design capacity
    2. CMMS Systems (45%): +10% readiness = -2.1 months
    3. Maintenance Readiness (58%): +10% readiness = -1.9 months
    4. Operations Readiness (65%): +10% readiness = -1.7 months
    5. Commissioning Quality (60%): +10% readiness = -1.3 months

  Step 7: NPV Impact
    - Plan: Design capacity at 12 months, Y1 85%, NPV = $2,850M
    - P50 Forecast: Design capacity at 24 months, Y1 62%, NPV = $2,280M
    - NPV Gap: -$570M
    - Revenue loss rate: $45M/month of delayed full production
    - Accelerated scenario (invest $15M in top 3 domains): NPV improvement +$210M

Output:
  "Sierra Verde Ramp-Up Forecast (T-6 months to commissioning):

   Current OR readiness: 65% (weighted aggregate)
   P50 forecast: 24 months to design capacity (plan: 12 months)
   Year-1 production: 62% of design capacity (plan: 85%)
   NPV impact: -$570M vs. plan
   Industry benchmark position: Below median (P50 = 22 months for sector)

   CRITICAL FINDING: Current OR readiness level predicts ramp-up performance
   below industry median. Immediate action recommended on:
   1. Spare Parts: Expedite insurance and commissioning spares (48% readiness)
   2. CMMS: Accelerate SAP PM configuration and PM plan loading (45% readiness)
   3. Maintenance: Complete FMECA and activate PM program (58% readiness)

   Investing $15M in accelerated OR over next 6 months could improve NPV by
   ~$210M through 4-month ramp-up acceleration. ROI: 14:1.

   Model: SV_RampUp_Model_v1.0_20270115.xlsx
   Dashboard: https://app.powerbi.com/sv-rampup-dashboard"
```

### Example 2: Active Ramp-Up Monitoring (Month 6 of Production)

```
Command: model-rampup-trajectory update --project "Sierra Verde" --actuals month6

Process:
  Actual Performance (Month 6 of production):
    - Month 1: 12% of design (forecast P50: 15%)
    - Month 2: 22% of design (forecast P50: 25%)
    - Month 3: 35% of design (forecast P50: 34%)
    - Month 4: 45% of design (forecast P50: 42%)
    - Month 5: 52% of design (forecast P50: 50%)
    - Month 6: 58% of design (forecast P50: 56%)

  Assessment: Tracking close to P50 forecast. Months 1-2 below forecast
  (crusher availability issues), months 3-6 recovering (crusher spares
  arrived, PM program activated).

  Model Recalibration:
    - Equipment reliability parameter updated: beta=1.8 (was 1.5), reflecting
      infant mortality period for new equipment
    - Process learning rate updated: faster than initially modeled (Beta
      parameters revised)
    - Revised P50 forecast: 21 months to design capacity (was 24)
    - Revised Year-1 production: 67% (was 62%)
    - Revised NPV impact: -$420M (was -$570M, improved by $150M)

Output:
  "Sierra Verde Ramp-Up Update - Month 6:
   Actual: 58% of design capacity (P50 forecast: 56%) - TRACKING ON P50

   Revised P50 forecast: 21 months to design capacity (previous: 24)
   Revised Year-1 production: 67% (previous: 62%)
   NPV impact improved by $150M due to faster-than-expected process learning.

   Key drivers of performance:
   (+) Process learning rate faster than initial model: flotation recovery
       optimization ahead of schedule (process engineering team effective)
   (+) PM program activation at Month 3 reduced unplanned downtime 40%
   (-) Crusher availability below target (85% vs 92% design): bearing failures
   (-) 3 operator positions still vacant in grinding area

   Recommended actions:
   1. Expedite crusher bearing spare procurement (2-month gap identified)
   2. Complete hiring for 3 grinding operator positions
   3. Maintain current process optimization trajectory

   Next milestone: 75% design capacity predicted at Month 10 (P50)
   Dashboard updated: https://app.powerbi.com/sv-rampup-dashboard"
```

### Example 3: Scenario Comparison for Gate G5 Decision

```
Command: model-rampup-trajectory compare --project "Sierra Verde" --scenarios base,accelerated,delay

Process:
  Scenario A (Base): Current OR trajectory continues as-is
    - Commissioning on schedule, OR readiness at commissioning: 78%
    - P50 time to design: 20 months, Year-1: 68%, NPV impact: -$410M

  Scenario B (Accelerated): $8M additional OR investment in top 3 gaps
    - Target OR readiness at commissioning: 88%
    - P50 time to design: 15 months, Year-1: 78%, NPV impact: -$180M
    - Net NPV benefit: +$230M for $8M investment (ROI: 28:1)

  Scenario C (Delay): Commissioning delayed 3 months for OR completion
    - OR readiness at commissioning: 92%
    - P50 time to design: 13 months, Year-1 (from commercial op): 82%
    - But 3 months delayed start: net NPV impact: -$220M

  Recommendation: Scenario B (Accelerated) provides best NPV outcome.
  $8M investment generates $230M in NPV improvement. Proceed with
  commissioning on schedule but with accelerated OR funding.

Output:
  Gate G5 Ramp-Up Scenario Analysis:
  | Scenario | OR at Comm. | Time to Design | Y1 Prod | NPV Impact | Cost |
  |----------|-------------|---------------|---------|------------|------|
  | Base | 78% | 20 months | 68% | -$410M | $0 |
  | Accelerated | 88% | 15 months | 78% | -$180M | $8M |
  | Delay 3mo | 92% | 13 months | 82% | -$220M | $135M* |

  * Delay cost = 3 months x $45M/month revenue opportunity cost

  RECOMMENDATION: Approve Scenario B (Accelerated OR Investment)
  Investment: $8M | NPV Improvement: +$230M | ROI: 28:1
```
