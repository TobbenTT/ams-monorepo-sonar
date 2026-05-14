# Examples - resolve-cross-functional-conflicts

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Equipment Standardization vs. Best-of-Breed Conflict

```
Conflict ID: CF-SV-2026-003
Title: Crusher Equipment Standardization vs. Performance Optimization
Severity: HIGH
Domains: Maintenance, Engineering, Procurement

Detection:
  Agent-maintenance submitted equipment standardization requirement in Maintenance
  Strategy deliverable. Agent-project's engineering specifications already issued with
  three different crusher vendors. Agent-procurement flagged corporate framework agreement
  with a fourth vendor. Automated scan detected contradictions across three deliverables.

Positions:
  Maintenance: "Standardize all crushers to Metso GP series. Reduces spare parts SKUs by
  40% (from 340 to 204). Single CMMS configuration. One vendor training program. Estimated
  OPEX saving: $1.2M/year in spare parts + $400K/year in training = $1.6M/year."

  Engineering: "Best-of-breed for each duty. Primary: Metso GP500 (proven in this ore type).
  Secondary: FLSmidth XL500 (better wear life for secondary duty). Tertiary: Sandvik CH890
  (superior fines handling). Combined throughput optimization: +8% vs. single-vendor at
  estimated $12M/year additional revenue."

  Procurement: "Corporate framework with ThyssenKrupp Kubria. 15% volume discount = $3.4M
  CAPEX saving. Pre-negotiated T&Cs. Established supply chain with 4-week lead times vs.
  12-16 weeks for non-framework vendors."

Analysis:
  Lifecycle cost (30-year NPV at 8%):
    - Metso standardization: NPV = $847M (high CAPEX, low OPEX, moderate performance)
    - Best-of-breed mix: NPV = $892M (moderate CAPEX, moderate OPEX, high performance)
    - ThyssenKrupp framework: NPV = $831M (low CAPEX, high OPEX, moderate performance)
    - Compromise: Metso primary + secondary, Sandvik tertiary: NPV = $878M

  Schedule impact:
    - Metso standard: 0 days (specifications can be updated quickly)
    - Best-of-breed: +15 days (procurement packages already issued; revisions needed)
    - ThyssenKrupp: +30 days (new specifications required; vendor qualification needed)
    - Compromise: +5 days (minor specification update)

Recommendation: Option D - Compromise (Metso primary + secondary, Sandvik tertiary)
  Rationale:
  1. Captures 85% of the standardization benefit (spare parts SKUs reduced by 32%)
  2. Retains the critical tertiary circuit optimization (+5% throughput for fines)
  3. NPV of $878M is 97% of best-case and 5.7% above ThyssenKrupp option
  4. Minimal schedule impact (+5 days vs. +15 or +30)
  5. Satisfies Maintenance's training simplification (2 vendors vs. 3)
  6. Does not trigger corporate framework penalty (volume threshold not met for TK)

Decision: Approved by Project Director on 2026-02-24
Implementation: Engineering to update specifications within 10 business days.
Procurement to issue revised bid packages. Maintenance to update CMMS config plan.
```

### Example 2: Circular Dependency Resolution (Operating Model Deadlock)

```
Conflict ID: CF-SV-2026-007
Title: Operating Model - Staffing Plan - OPEX Budget Circular Dependency
Severity: CRITICAL
Domains: Operations, HR, Finance

Detection:
  Orchestrator identified circular dependency deadlock:
  - Operations cannot finalize operating model without knowing budget constraints (Finance)
  - Finance cannot finalize OPEX budget without knowing headcount (HR)
  - HR cannot finalize headcount without knowing operating model (Operations)
  All three deliverables blocked for 3 weeks. Gate G2 at risk.

Root Cause Analysis:
  Decisions were sequenced incorrectly in the original OR WBS. The three deliverables
  were treated as independent when they are interdependent. No iteration mechanism
  was planned.

Resolution Approach: Phased iteration with progressive refinement
  Iteration 1 (Week 1):
    - Operations develops preliminary operating model with 3 scenarios (lean/base/robust)
    - Finance provides budget envelope (range, not fixed number)
    - HR develops parametric staffing model (FTE per operating scenario)

  Iteration 2 (Week 2):
    - Operations selects preferred scenario based on budget envelope
    - HR refines staffing plan for selected scenario
    - Finance develops detailed OPEX budget based on refined headcount

  Iteration 3 (Week 3):
    - Final alignment workshop: all three domains validate integrated package
    - Resolve any remaining delta items
    - Joint sign-off on integrated operating model + staffing plan + OPEX budget

Decision: Approved by OR Manager on 2026-02-18
Result: Deadlock broken. All three deliverables completed within 3 weeks. Gate G2
  preparation back on track. Lesson learned: add iteration cycles to OR WBS for
  interdependent deliverables.
```

### Example 3: Safety vs. Availability Conflict

```
Conflict ID: CF-SV-2026-012
Title: Additional Safety Interlocks vs. Plant Availability Impact
Severity: CRITICAL (safety-relevant)
Domains: HSE, Operations, Engineering

Detection:
  HSE agent recommended 12 additional safety interlock functions (SIF) based on HAZOP
  review. Operations flagged concern that historical data from similar plants shows
  each additional SIF increases spurious trip rate by 0.3-0.5 trips/year, projecting
  3.6-6.0 additional spurious trips/year, equating to $4.8M-$8.0M lost production.

Resolution:
  Safety override protocol activated (safety conflicts get immediate priority).
  SIL assessment conducted per IEC 61511 for each proposed SIF.
  Result:
    - 8 of 12 SIFs confirmed as required by quantitative risk assessment (LOPA)
    - 4 of 12 SIFs found to have alternative risk reduction measures available
    - For the 8 required SIFs: high-reliability design (SIL 2 architecture 1oo2D)
      reduces spurious trip rate to 0.05/year per SIF vs. 0.3-0.5 for basic design
    - Net impact: 0.4 additional spurious trips/year vs. 3.6-6.0 original projection
    - Cost of high-reliability design: $680K additional CAPEX (vs. $4.8M-$8.0M annual loss)

Decision: Approved by Project Director on 2026-02-19
  - Implement 8 SIFs with high-reliability architecture
  - Implement 4 alternative risk reduction measures (procedural + alarm management)
  - Safety requirement fully satisfied; availability impact minimized to <0.1%
```
