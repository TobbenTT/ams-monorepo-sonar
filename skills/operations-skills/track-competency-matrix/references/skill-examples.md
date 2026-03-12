# Examples - track-competency-matrix

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Maintenance Competency Matrix (Copper Concentrator)

**Scope**: 99 maintenance FTEs across mechanical, electrical, instrumentation, and predictive crafts
**Framework**: SMRP BoK adapted + OPITO adapted + Chilean regulatory requirements

**Competency Profile: Mechanical Fitter (Level 3 Required)**

| Competency | Category | Required Level | Safety-Critical | Regulatory |
|-----------|----------|---------------|-----------------|------------|
| Pump maintenance & repair | Technical Core | 3 | No | No |
| Conveyor maintenance | Technical Core | 3 | No | No |
| Crusher maintenance | Technical Core | 3 | No | No |
| Bearing replacement & alignment | Technical Core | 4 | No | No |
| Welding (basic structural) | Technical Core | 2 | No | Yes (if certified) |
| Hydraulic systems | Technical Core | 3 | No | No |
| Mechanical seals | Technical Core | 3 | No | No |
| Isolation & LOTO procedures | Safety-Critical | 3 | YES | Yes (DS 132) |
| Confined space entry | Safety-Critical | 2 | YES | Yes (DS 132) |
| Working at height | Safety-Critical | 2 | YES | Yes (DS 132) |
| Crane rigging & lifting | Safety-Critical | 2 | YES | Yes |
| Hot work permit procedures | Safety-Critical | 2 | YES | Yes (DS 132) |
| Emergency response (role-specific) | Safety-Critical | 2 | YES | Yes |
| First aid (basic) | Safety-Critical | 2 | YES | Yes (DS 594) |
| CMMS work order execution | Digital | 2 | No | No |
| Technical drawing interpretation | Technical Core | 3 | No | No |
| Precision maintenance (alignment, balancing) | Technical Core | 3 | No | No |

**Assessment Results Summary** (32 mechanical fitters assessed):

| Competency Coverage Category | Count | % |
|------------------------------|-------|---|
| Meets all requirements (GREEN) | 18 | 56% |
| Minor gaps only (1-level, non-critical) | 8 | 25% |
| Significant gaps (2+ level OR safety-critical gap) | 6 | 19% |

**Critical Findings**:
- 4 fitters lack formal confined space entry certification (regulatory gap) -- IMMEDIATE ACTION
- 6 fitters have never operated on SAG mill liners (experience gap in key equipment) -- OJT program needed
- CMMS proficiency is universally low (Level 1 average vs. Level 2 required) -- organizational training needed
- 2 fitters approaching retirement (age 58, 59) hold Level 5 expertise in crusher maintenance with no Level 4 successor

### Example 2: Certification Expiry Alert

```
CERTIFICATION EXPIRY ALERT
Generated: 2026-02-17

Certifications expiring within 90 days:

| Employee | Certification | Expiry Date | Days Remaining | Action Required |
|----------|--------------|-------------|----------------|-----------------|
| J. Rodriguez | Blasting License (SERNAGEOMIN) | 2026-03-15 | 26 days | Renewal application submitted? |
| M. Gonzalez | Crane Operator (50T mobile) | 2026-04-01 | 43 days | Schedule recertification exam |
| P. Silva | SEC Electrical Auth. Cat. B | 2026-04-22 | 64 days | Renewal training scheduled? |
| R. Fernandez | First Aid (paramedic level) | 2026-05-10 | 82 days | Re-training course available May 5 |
| A. Morales | Working at Height | 2026-05-15 | 87 days | Annual refresher needed |

Actions:
1. J. Rodriguez: URGENT - If blasting license expires, cannot perform blasting duties.
   Contact SERNAGEOMIN for renewal timeline. If renewal takes >26 days,
   reassign duties temporarily.
2. M. Gonzalez: Schedule with certification provider. Typical lead time: 2-3 weeks.
3-5. Schedule renewals through LMS training calendar.
```

### Example 3: Retirement Risk Competency Analysis

```
RETIREMENT RISK ANALYSIS
Employees within 5 years of retirement: 23 of 223 permanent FTEs (10.3%)

CRITICAL KNOWLEDGE RISK (Expert competency with no Level 4 successor):

| Retiree | Role | Years to Retire | Critical Competency | Current Successors (L3+) |
|---------|------|----------------|--------------------|-----------------------|
| E. Vega | Senior Instrument Tech | 2.1 years | SIS testing & validation (L5) | 1 at L3, 0 at L4 |
| H. Muñoz | Crusher Specialist | 1.4 years | Gyratory crusher overhaul (L5) | 0 at L3+ |
| F. Rojas | Process Supervisor | 3.2 years | Flotation circuit optimization (L5) | 2 at L3, 0 at L4 |
| C. Díaz | Electrical Supervisor | 2.8 years | HV switchgear maintenance (L5) | 1 at L3, 0 at L4 |

RECOMMENDED ACTIONS:
1. H. Muñoz (HIGHEST RISK - 1.4 years, zero successors):
   - Initiate capture-expert-knowledge immediately
   - Assign 2 mechanical fitters to mentoring program under Muñoz
   - Accelerate OJT: Include both mentees in next 2 crusher overhauls
   - Target: At least 1 successor at Level 3 within 12 months

2. E. Vega (HIGH RISK - 2.1 years):
   - Assign current L3 instrument tech to SIS specialist development
   - Schedule IEC 61511 functional safety training (external)
   - Target: 1 successor at Level 4 within 18 months

3. F. Rojas and C. Díaz (MODERATE RISK - 2.8-3.2 years):
   - Begin structured mentoring programs
   - Document tacit knowledge through capture-expert-knowledge skill
   - Target: 1 successor at Level 4 within 24 months each
```
