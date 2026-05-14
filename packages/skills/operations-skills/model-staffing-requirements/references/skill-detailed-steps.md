# Detailed Step-by-Step Execution - model-staffing-requirements

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Workload Derivation (Steps 1-4)

**Step 1: Collect and validate the maintenance workload.**
- Retrieve annual maintenance labor hours from the maintenance strategy (develop-maintenance-strategy output)
- Break down by craft: mechanical, electrical, instrumentation/control, predictive maintenance, lubrication
- Separate routine maintenance (PM/PdM) from corrective maintenance allowance
- Separate running maintenance from shutdown-only tasks
- Validate workload against industry benchmarks (hours per equipment type)
- Add corrective maintenance buffer: typically 15-25% of planned hours for well-planned operations
- Add small project/modification work: typically 10-15% of base maintenance hours
- Document any workload data gaps and assumptions
- **Quality gate**: Maintenance workload derived from documented analysis, not arbitrary headcount

**Step 2: Derive the operations workload.**
- Map the operating model: number of process areas, control rooms, field zones
- For each process area, determine:
  - Control room positions required per shift (based on process complexity and DCS scope)
  - Field operator positions per shift (based on equipment density, geographic spread, round time)
  - Sample collection and quality control positions
  - Mobile equipment operator positions
- Determine non-shift operations positions:
  - Process engineers / technical support
  - Day-shift operations coordinator
  - Quality/metallurgical laboratory staff
  - Water treatment / utilities operators
- Validate against industry benchmarks: operators per equipment item, operators per tpd capacity
- **Quality gate**: Operations manning justified by activity analysis, not headcount assumption

**Step 3: Determine support function requirements.**
- Maintenance planning and scheduling:
  - Planners: 1 per 20-30 maintenance FTEs (SMRP best practice)
  - Schedulers: 1 per 50-75 maintenance FTEs
  - Reliability engineers: 1 per 150-300 equipment items (Criticality A/B focus)
- Warehouse and materials management:
  - Storekeepers: Based on transaction volume (typically 1 per 5,000-10,000 annual transactions)
  - Receiving/shipping: Based on delivery frequency
  - Inventory controller: 1 per operation
- HSE coordination:
  - HSE coordinator ratio: 1 per 50-100 total site FTE
  - Paramedic/first aid: Based on regulatory requirements and site remoteness
  - Environmental monitoring: Based on permit requirements
- Training and competency:
  - Training coordinator: 1 per 100-200 FTEs during ramp-up, 1 per 200-400 at steady state
- Administration and clerical:
  - Admin support: 1 per 20-30 professionals
  - Document control: Based on document volume
  - IT support: 1 per 100-150 users
- **Quality gate**: Support function ratios documented and benchmarked

**Step 4: Define shutdown/turnaround peak manning.**
- Determine shutdown frequency and typical duration
- Calculate incremental maintenance hours during shutdown
- Determine peak manning: typically 1.5-3.0x normal maintenance staffing
- Identify roles that are contractor-sourced during shutdowns
- Calculate annual shutdown FTE impact (amortized over year)
- **Quality gate**: Shutdown manning derived from shutdown scope, not arbitrary multiplier

### Phase 2: Shift Pattern & FTE Modeling (Steps 5-8)

**Step 5: Model shift pattern scenarios.**
- Select 3-5 shift patterns from the shift pattern library applicable to the operating context
- For each pattern, calculate:
  - Annual working hours per person
  - Number of crews required for 24/7 coverage (if applicable)
  - Regulatory compliance check against Chilean labor law (automatic validation)
  - Night shift hours and fatigue risk score
  - Pattern efficiency: productive hours as % of total hours
- Factor in geographic considerations:
  - FIFO pattern compatibility (7x7, 14x14, 10x10 for remote sites)
  - Commute time impact on effective shift length
  - Altitude impact on work capacity (>3,000 masl: reduce by 10-15%)
- Generate pattern comparison table with all metrics
- **Quality gate**: All proposed patterns verified as Chilean labor-law compliant

**Step 6: Calculate FTE requirements for the base case.**
- For each function and craft:
  - Apply the workload-to-FTE conversion formula
  - Apply shift pattern crew factor
  - Apply productivity factor (wrench time)
  - Apply availability factor (leave, training, sick)
  - Round up to whole FTEs (you cannot hire 0.3 of a person)
- Compile total FTE by:
  - Function: Operations, Maintenance, HSE, Support, Management
  - Level: Management, Professional, Supervisory, Technical, Operator
  - Employment type: Permanent, Contract, Temporary
  - Shift assignment: Day shift, Rotating shift, FIFO
- Calculate key staffing ratios and compare with benchmarks
- **Quality gate**: FTE model is traceable to workload; productivity assumptions documented

**Step 7: Generate scenario variants.**
- **Conservative scenario**: Apply top-quartile productivity assumptions, higher contractor %, leaner supervision ratios
  - Wrench time: 45% (top quartile)
  - Contractor: 35-40% of maintenance
  - Supervision: 1:12
  - Result: Typically 15-25% fewer FTEs than base case
- **Base case**: Apply realistic productivity assumptions based on site-specific factors
  - Wrench time: 30-35% (realistic for new operation ramping up)
  - Contractor: 25-30% of maintenance
  - Supervision: 1:8-10
- **Contingency scenario**: Apply conservative productivity assumptions, additional buffers
  - Wrench time: 25% (early operation reality)
  - Additional 10-15% buffer for ramp-up learning curve
  - Supervision: 1:6-8
  - Result: Typically 15-25% more FTEs than base case
- For each scenario, calculate total cost impact
- **Quality gate**: Three scenarios span a realistic range; assumptions are transparent and defensible

**Step 8: Model the recruitment timeline.**
- For each role, determine:
  - Required operational date (when the person must be competent on the job)
  - Training lead time (time from hire to operational competency)
  - Recruitment lead time (time from job posting to accepted offer)
  - Certification lead time (time to obtain required regulatory certifications)
- Back-calculate: Recruitment start date = Operational date - Training time - Recruitment time
- Sequence roles by recruitment start date
- Identify critical path roles (longest total lead time)
- Generate month-by-month recruitment plan: positions opening, target hires, target trained
- Identify recruitment bottlenecks: roles with limited labor market availability
- Align with project schedule milestones (FEED, detailed engineering, construction, commissioning)
- **Quality gate**: No role has a recruitment start date in the past; critical path roles identified

### Phase 3: Cost Modeling & Benchmarking (Steps 9-12)

**Step 9: Build the labor cost model.**
- Retrieve salary benchmark data by role category and region:
  - Source: Chilean market surveys (Hays, Mercer, Robert Half), industry associations, VSC database
  - Adjust for region (Antofagasta premium 15-25% over Santiago)
  - Adjust for shift pattern (FIFO premium 20-30% over residential)
  - Adjust for altitude (>3,000 masl premium 10-15%)
- For each FTE, calculate fully-loaded cost:
  - Base salary (gross)
  - Employer social contributions (AFP pension ~10%, Salud ~7%, Seguro Cesantia ~2.4%, Mutualidad ~2%, SIS ~1.5%)
  - Shift premiums and allowances (night, weekend, holiday, altitude, remoteness)
  - Overtime provision (typically 5-10% of base for maintenance staff)
  - Benefits (meals, transportation, accommodation for FIFO, insurance, uniforms, PPE)
  - Training and development provision
  - Recruitment cost amortization (placement fees, relocation)
- Fully-loaded cost typically = 1.45-1.75x gross salary in Chile
- **Quality gate**: Cost model uses current market data; all cost components included

**Step 10: Perform staffing cost benchmarking.**
- Calculate key cost ratios:
  - Total O&M labor cost per tonne of product
  - Maintenance labor cost as % of Replacement Asset Value (RAV)
  - Operations labor cost per unit of capacity
  - Total labor cost per FTE (fully loaded)
- Compare with industry benchmarks:
  - Mining (copper): $2.50-$5.00 per tonne for O&M labor
  - Maintenance cost target: 2.5-3.5% of RAV (top quartile)
  - Labor cost as % of total OPEX: typically 25-40%
- Identify areas where staffing model is significantly above or below benchmarks
- Document explanations for deviations (site remoteness, altitude, complexity, automation level)
- **Quality gate**: Benchmarks from at least 3 sources; deviations explained

**Step 11: Perform sensitivity analysis.**
- Identify top 5-7 assumption variables with highest impact on FTE count:
  - Wrench time (+/- 5 percentage points)
  - Contractor ratio (+/- 10 percentage points)
  - Absenteeism rate (+/- 2 percentage points)
  - Corrective maintenance allowance (+/- 5 percentage points)
  - Supervision ratio (+/- 2 workers per supervisor)
  - Shift pattern change (compare top 2 patterns)
  - Altitude productivity deduction (+/- 5 percentage points)
- For each variable: calculate FTE and cost impact of change
- Generate tornado diagram showing relative sensitivity
- Identify the 2-3 assumptions that most influence the result
- **Quality gate**: Sensitivity analysis covers all major assumptions; tornado diagram generated

**Step 12: Compile deliverables and cross-validate.**
- Generate Staffing Requirements Report with all sections populated
- Build FTE Model Workbook with formula-driven calculations (auditable)
- Create Recruitment Timeline Gantt chart aligned with project schedule
- Cross-validate:
  - FTE totals in report match workbook totals
  - Cost model reconciles with FTE counts and salary data
  - Recruitment timeline dates are feasible given labor market conditions
  - Shift patterns are Chilean labor-law compliant (verified against Codigo del Trabajo)
  - Total maintenance FTEs produce available hours > workload hours
- Store all deliverables in mcp-sharepoint
- **Quality gate**: Zero discrepancies across deliverables; model is auditable end-to-end

### Phase 4: Validation & Delivery (Steps 13-14)

**Step 13: Validate against comparable operations.**
- Compare FTE model results with 3-5 comparable operations:
  - Same industry sector
  - Similar capacity/throughput
  - Similar geographic conditions
  - Similar technology/automation level
- Identify and explain material differences
- Document validation results as model confidence assessment
- **Quality gate**: Model is within +/- 20% of comparable operation benchmarks (explained deviations)

**Step 14: Present scenarios and recommendations.**
- Prepare executive summary with clear recommendation:
  - Recommended scenario (typically base case with specific adjustments)
  - Key staffing numbers by function
  - Total annual cost with confidence range
  - Critical recruitment actions with deadlines
  - Top 3 staffing risks with mitigation strategies
- Prepare decision support: what-if simulator in Excel (change assumptions, see FTE/cost impact)
- **Quality gate**: Recommendation is clear, justified, and actionable

---
