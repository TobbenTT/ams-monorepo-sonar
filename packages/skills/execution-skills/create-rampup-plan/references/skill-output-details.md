# Detailed Output Specification - create-rampup-plan

*Detailed output formats and field definitions extracted from SKILL.md.*

---


**4. Ramp-Up Strategy** (4-6 pages)

4.1 Ramp-Up Philosophy
- Milestone-based progression approach
- Safety-first principle (no shortcuts for production targets)
- Learn-before-you-run philosophy (master each level before advancing)
- Continuous improvement mindset from Day 1

4.2 Ramp-Up Phases

| Phase | Target Throughput | Duration (est.) | Focus Areas |
|-------|------------------|-----------------|-------------|
| Phase 0: Initial Feed | First ore/material to process | Week 1 | Feed system validation, initial calibration |
| Phase 1: Line-Out | 0-25% design capacity | Weeks 1-4 | Process stabilization, equipment validation, control tuning |
| Phase 2: Initial Ramp | 25-50% design capacity | Weeks 4-10 | Throughput increase, quality optimization, bottleneck identification |
| Phase 3: Accelerated Ramp | 50-75% design capacity | Weeks 10-18 | Rate increase, reliability focus, maintenance program activation |
| Phase 4: Final Ramp | 75-100% design capacity | Weeks 18-28 | Design rate achievement, sustained performance |
| Phase 5: Stabilization | 100% sustained | Weeks 28-40 | Performance guarantee, steady-state demonstration |

4.3 Milestone Progression Criteria
For each milestone, define:
- Throughput target (e.g., >50% design for >72 continuous hours)
- Quality target (e.g., product meets specification in >80% of production)
- Equipment availability target (e.g., overall availability >75%)
- Safety target (e.g., no recordable incidents in ramp-up period)
- Approval required to advance (e.g., Operations Manager sign-off)

4.4 Ramp-Up Curve
- Primary ramp-up curve: monthly production targets (graph + table)
- Optimistic curve (P10): faster-than-expected ramp-up scenario
- Base case curve (P50): expected ramp-up trajectory
- Conservative curve (P90): slower-than-expected scenario
- Comparison with industry benchmarks

**5. Production Planning During Ramp-Up** (3-4 pages)
- Daily/weekly production targets by phase
- Process parameter targets by phase (feed rate, pressures, temperatures)
- Quality management during ramp-up (sampling frequency, laboratory capacity)
- Shift handover and production reporting during ramp-up
- Production meeting cadence and escalation process
- Feed quality management (ore blending, material grading)

**6. Equipment Availability & Maintenance** (3-4 pages)
- Expected equipment availability by ramp-up phase
- Maintenance strategy during ramp-up (reduced PM intervals, enhanced monitoring)
- Warranty management and vendor support utilization
- Common teething issues and mitigation strategies
- Condition monitoring program during ramp-up
- Planned maintenance shutdowns during ramp-up (mini-shutdowns for adjustment)

**7. Staffing & Competency** (3-4 pages)
- Staffing requirements by ramp-up phase
- Learning curve management
- Supplementary staffing during ramp-up (additional operators, mentors)
- Training continuation during ramp-up (on-the-job training, simulation)
- Competency assessment schedule
- Shift pattern transitions (e.g., additional supervisors during early phases)
- Vendor specialist schedule and knowledge transfer

**8. Support Tapering Plan** (2-3 pages)
- Definition of enhanced support resources during ramp-up:
  - Vendor technical representatives
  - EPC/Project team members retained for support
  - Additional contractor operators/maintainers
  - External consultants and specialists
- Tapering schedule: when each support resource is planned to demobilize
- Criteria for support reduction decisions
- Escalation process if support extension is needed
- Knowledge transfer requirements before demobilization

**9. Risk Management & Contingencies** (3-4 pages)
- Ramp-up risk register (top risks)
- Common ramp-up challenges and pre-planned responses:
  - Bottleneck identification and resolution approach
  - Equipment failure response protocols
  - Quality deviation management
  - Staffing shortage contingencies
  - Supply chain disruptions
- Contingency plans for significant delays
- Trigger points for ramp-up plan revision
- Financial contingency for extended ramp-up

**10. Performance Monitoring & Reporting** (2-3 pages)
- KPIs tracked during ramp-up
- Daily/weekly/monthly reporting requirements
- Performance review meeting cadence
- Dashboard design and data sources
- Deviation management process
- Management reporting and escalation

**11. Steady-State Declaration** (2-3 pages)
- Definition of steady state
- Steady-state criteria:
  - Throughput: >X% of design for >Y consecutive days
  - Quality: Product meets specification in >Z% of production
  - Availability: Overall equipment availability >W%
  - Cost: Operating cost per unit within V% of budget
  - Safety: TRIR below target
  - Environment: All compliance parameters met
  - Staffing: All positions filled, competency verified
  - Systems: All management systems fully operational
- Steady-state declaration process and authority
- Post-declaration monitoring period
- Transition from ramp-up to steady-state governance

**12. Appendices**
- Appendix A: Detailed ramp-up curve data (monthly/weekly targets)
- Appendix B: Equipment availability targets by system
- Appendix C: Vendor support schedule
- Appendix D: Training schedule during ramp-up
- Appendix E: Ramp-up risk register
- Appendix F: Key contact list during ramp-up

### Primary Output 2: Ramp-Up Curves & Tracking (.xlsx)

**Filename**: `{ProjectCode}_RampUp_Curves_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Ramp-Up Curve"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Month | Calendar month | Month 1 (Oct 2027) |
| B | Week | Calendar week within month | Week 1 |
| C | Ramp_Phase | Phase (0-5) | Phase 1: Line-Out |
| D | Target_Throughput_pct | % of design capacity target | 15% |
| E | Target_Throughput_abs | Absolute throughput target | 18,000 tpd |
| F | P10_Throughput_pct | Optimistic scenario | 20% |
| G | P50_Throughput_pct | Base case scenario | 15% |
| H | P90_Throughput_pct | Conservative scenario | 10% |
| I | Actual_Throughput_pct | Actual achieved (for tracking) | |
| J | Actual_Throughput_abs | Actual absolute throughput | |
| K | Variance_pct | Variance from target | |
| L | Cumulative_Production | Cumulative production to date | |
| M | Target_Availability_pct | Equipment availability target | 70% |
| N | Actual_Availability_pct | Actual availability | |
| O | Target_Quality_pct | % on-spec production target | 75% |
| P | Actual_Quality_pct | Actual quality compliance | |
| Q | Recovery_pct_Target | Process recovery target | 82% |
| R | Recovery_pct_Actual | Actual process recovery | |
| S | Milestone_Status | Milestone achieved? | In Progress |
| T | Key_Issues | Key issues/challenges this period | |
| U | Actions | Corrective actions | |

#### Sheet 2: "Ramp-Up Chart Data"
Data formatted for chart generation:
- Combined P10/P50/P90 curves for visual comparison
- Actual performance overlay
- Target milestone markers
- Area chart showing progressive capacity utilization

#### Sheet 3: "Equipment Availability Targets"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | System | System/area name |
| B | Month_1_Target | Availability target Month 1 |
| C | Month_1_Actual | Availability actual Month 1 |
| ... | ... | ... (columns per month through Month 12+) |
| N | Steady_State_Target | Steady-state availability target |

#### Sheet 4: "Milestone Tracker"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Milestone_ID | Milestone identifier |
| B | Milestone_Name | Milestone description |
| C | Throughput_Criteria | Throughput requirement |
| D | Duration_Criteria | Sustained period requirement |
| E | Quality_Criteria | Quality requirement |
| F | Availability_Criteria | Availability requirement |
| G | Safety_Criteria | Safety requirement |
| H | Target_Date | Target achievement date |
| I | Actual_Date | Actual achievement date |
| J | Status | Not Started / In Progress / Achieved / Delayed |
| K | Approval_By | Who approved milestone achievement |
| L | Notes | Context and observations |

#### Sheet 5: "Support Tapering Schedule"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Resource_Type | Type of support resource |
| B | Resource_Detail | Specific resource description |
| C | Ramp_Phase_Start | When support begins |
| D | Planned_Demob_Phase | Planned demobilization phase |
| E | Planned_Demob_Date | Planned demobilization date |
| F | Demob_Criteria | Criteria for demobilization |
| G | Knowledge_Transfer_Status | Status of KT activities |
| H | Actual_Demob_Date | Actual demobilization date |
| I | Extension_Justification | Justification if extended |
| J | Daily_Cost | Daily cost of this resource |
| K | Total_Cost_Estimate | Estimated total cost |

#### Sheet 6: "Production Dashboard"
Daily/weekly tracking dashboard:
- Daily throughput (target vs. actual)
- Cumulative production (target vs. actual)
- Equipment availability by system
- Quality compliance
- Process recovery
- Key performance indicators
- Ramp-up progress gauge (% of design capacity achieved)

#### Sheet 7: "Financial Tracking"
Ramp-up financial performance:
- Monthly production value (volume x price)
- Monthly operating cost
- Lost production cost (gap from steady-state capacity)
- Vendor support costs
- Ramp-up specific expenditures
- Cumulative cash flow during ramp-up
- Break-even analysis and forecast

#### Sheet 8: "Risk Register"
Ramp-up specific risk register:
- Risk ID, description, category
- Likelihood, consequence, risk score
- Mitigation measures
- Risk owner, status
- Trigger indicators

### Formatting Standards
- Ramp-up curve chart: Line chart with P10 (dashed green), P50 (solid blue), P90 (dashed red), Actual (bold black)
- Milestone markers: Diamond shapes on the chart at target dates
- Phase boundaries: Vertical dashed lines separating phases
- Traffic light colors for status: Green (on/above target), Yellow (within tolerance), Red (below target)
- Header row: Bold, dark teal background (#006666), white font
- Conditional formatting: Green for on-target, Yellow for -5% to -10% variance, Red for >-10% variance
- Charts should be print-ready at A3 size
