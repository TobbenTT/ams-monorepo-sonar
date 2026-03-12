# Examples - forecast-program-completion

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Monthly EVM Forecast

**Input:** Month 18 of 30-month project. EVM data: BAC = $450M, cumulative EV = $225M, cumulative AC = $260M, cumulative PV = $270M. Project is 50% complete by earned value but has spent 57.8% of budget.

**Process:**
1. Calculate performance indices:
   - CPI = $225M / $260M = 0.865 (for every dollar spent, earning $0.865 of value)
   - SPI = $225M / $270M = 0.833 (delivering 83.3% of planned progress)
   - CV = $225M - $260M = -$35M (over budget by $35M)
   - SV = $225M - $270M = -$45M (behind schedule by $45M in value terms)
   - TCPI = ($450M - $225M) / ($450M - $260M) = $225M / $190M = 1.184 (must perform 18.4% better than planned to finish on budget)
2. Calculate EAC by four methods:
   - EAC1 (CPI) = $450M / 0.865 = $520.2M (over budget by $70.2M)
   - EAC2 (CPI x SPI) = $260M + ($450M - $225M) / (0.865 x 0.833) = $260M + $225M / 0.720 = $260M + $312.5M = $572.5M
   - EAC3 (bottom-up) = $260M + $235M (project team independent estimate) = $495M
   - EAC4 (original) = $260M + ($450M - $225M) = $485M (optimistic baseline)
   - Range: [$485M, $572.5M] -- $35M to $122.5M overrun
   - Recommended: EAC1 ($520M) as most reliable for this project phase -- CPI has stabilized over last 4 months
3. Monte Carlo: 5,000 iterations
   - P50 completion = Month 29 (1 month early -- schedule recovery expected from float)
   - P80 completion = Month 32 (2 months late)
   - P90 completion = Month 34 (4 months late)
   - Probability of meeting Month 30 contractual date: 42%
4. Variance decomposition:
   - Cost: Productivity 40% (-$14M), Rework 25% (-$8.75M), Escalation 20% (-$7M), Other 15% (-$5.25M)
   - Schedule: Rework 35%, Resource constraints 25%, Weather 20%, Design delays 20%

**Output:**
- Completion Forecast Report (22 pages) with executive summary showing $45-174M overrun range, 0-4 month delay range
- EVM Dashboard with all 7 sheets populated, charts generated
- Top 3 variance drivers identified with corrective action recommendations
- Recovery scenario: Add resources ($8M investment, recover 45 days, 60% confidence) recommended
- Management alert: TCPI at 1.184 indicates budget recovery is very challenging without intervention

### Example 2: Recovery Scenario Analysis

**Input:** CPI dropped to 0.78 after major rework event (failed structural steel inspection requiring 15,000 m2 of re-welding). Sponsor requests recovery plan with cost-benefit analysis for steering committee decision.

**Process:**
1. Quantify current position:
   - CPI = 0.78 (worst monthly performance)
   - Cumulative CPI = 0.85 (down from 0.91 last month)
   - SPI = 0.82 (rework has consumed productive time)
   - Forecast overrun: EAC1 = $529M (vs. BAC $450M) = $79M overrun (17.6%)
   - Forecast delay: P80 = Month 33 (3 months late)
2. Model 3 recovery scenarios:
   - **Scenario A - Add Resources**: Mobilize additional welding crew (35 welders + supervision)
     - Cost: $15M (crew mobilization, accommodation, management)
     - Schedule recovery: 60 days (P50)
     - New P80 completion: Month 31 (1 month late vs. 3 months)
     - Probability of meeting Month 30: 35%
   - **Scenario B - Fast-Track Procurement**: Overlap procurement and construction for next 3 systems
     - Cost: $8M (premium for accelerated deliveries, overtime)
     - Schedule recovery: 30 days (P50)
     - New P80 completion: Month 32 (2 months late)
     - Probability of meeting Month 30: 20%
   - **Scenario C - Accept Delay**: No intervention, manage consequences
     - Cost: $0 additional investment, but $12M liquidated damages (contractual)
     - Schedule: P80 = Month 33 (3 months late)
     - Lost production value during delay: estimated $45M
     - Total cost of delay: $57M
3. Combined scenario A+B:
   - Cost: $20M combined investment
   - Schedule recovery: 75 days (P50)
   - New P80 completion: Month 30.5 (approximately on time)
   - Probability of meeting Month 30: 45%
   - Net benefit vs. Scenario C: $57M avoided - $20M investment = $37M net benefit

**Output:**
- Recovery Scenario Report (15 pages) with detailed cost-benefit analysis for each scenario
- Monte Carlo results for each scenario (probability distributions, completion date ranges)
- Scenario comparison matrix with NPV analysis
- Recommendation: Scenario A+B combined ($20M investment, 75-day recovery, P80 near contract date)
- Decision required from Steering Committee by [date] to mobilize additional resources
- Implementation plan: 2-week mobilization period, 4-month recovery execution, ongoing monitoring
- Updated EAC if recovery approved: $490M (vs. $529M without recovery)
- Risk: if recovery fails, additional $5M sunk cost, but $52M downside still avoided vs. doing nothing
