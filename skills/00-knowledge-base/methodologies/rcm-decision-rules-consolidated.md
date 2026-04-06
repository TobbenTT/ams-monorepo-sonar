# RCM Decision Rules — Consolidated Reference

Sources: NASA RCM Guide, UK MOD DEF STAN 02-45, RCM Gateway to World Class Maintenance, RCM Implementation Made Simple, Moubray RCM II.

---

## 1. Failure Patterns (A-F)

| Pattern | Name | Real Distribution | Has Wear-Out Zone? | FT Applicable? |
|---------|------|-------------------|--------------------|----|
| A | Bathtub | <5% | Yes (end of life) | Yes |
| B | Traditional | <3% | Yes (gradual rise) | Yes |
| C | Gradual increase | <6% | No (continuous rise, no threshold) | Yes (with caution) |
| D | Rapid rise | <8% | No (stabilizes after initial rise) | No |
| E | Random/Constant | ~15% | No (age-independent) | No |
| **F** | **Reversed J (infant mortality)** | **>65%** | **No** (stabilizes after infant mortality) | **No** |

**Key insight**: Pattern F dominates modern complex equipment (>65%). Traditional time-based preventive maintenance is uneconomical for most equipment because there is no wear-out zone to prevent.

**Rule**: FT (Fixed-Time) is ONLY valid for patterns A, B, C (~14% of failures). For D, E, F (~86%), use CBM or RTF.

---

## 2. RCM Decision Tree (Task Selection)

### Step 1: Consequence Classification
```
Is the failure HIDDEN (not evident to operator under normal conditions)?
  YES → Hidden Failure Path
  NO  → Evident Failure Path
    Is there a SAFETY consequence?
      YES → Safety Consequence Path
      NO  → Is there an ENVIRONMENTAL consequence?
        YES → Environmental Consequence Path
        NO  → Is it OPERATIONAL (affects output/quality/cost)?
          YES → Operational Consequence Path
          NO  → Non-Operational Consequence Path
```

### Step 2: Task Selection (in priority order for EACH path)

For ALL failure modes, evaluate in this exact order:

1. **Condition-Based Task (On-Condition)** — ALWAYS evaluate first
   - Is there a detectable P (potential failure) condition?
   - Is the P-F interval reasonably consistent?
   - Can we monitor at intervals < P-F interval?
   - Is the net P-F sufficient for corrective action?
   - **If YES to all → CONDITION_BASED**

2. **Scheduled Restoration (Fixed-Time Overhaul)** — Only if CBM not viable
   - Is there an identifiable wear-out age? (patterns A, B, C only)
   - Does restoration actually restore original capability?
   - **If YES → FIXED_TIME (restoration)**

3. **Scheduled Discard (Fixed-Time Replacement)** — Only if restoration not viable
   - Same pattern requirement (A, B, C)
   - **If YES → FIXED_TIME (discard)**

4. **Default Actions** (if no proactive task is applicable):

| Consequence | Default Action |
|-------------|---------------|
| Hidden + Safety/Environmental | **REDESIGN mandatory** |
| Hidden + Non-safety | FAULT_FINDING or RTF |
| Safety/Environmental (evident) | **REDESIGN mandatory** |
| Operational | RTF (if cost justified) |
| Non-Operational | RTF |

### Decision Checklist (Q1-Q8)

```
Q1: Is failure safety-critical or mission-critical?
    YES → Q2 | NO → Q7

Q2: Can redesign permanently eliminate this failure?
    YES → REDESIGN | NO → Q3

Q3: Is redundancy cost-effective?
    YES → REDUNDANCY | NO → Q4

Q4: Can we detect the potential failure state before functional failure?
    YES → Q5 | NO → Q6

Q5: Is there reliable monitoring AND P-F >= 3x response time?
    YES → CONDITION_BASED | NO → Q6

Q6: Is this a hidden failure (standby/backup)?
    YES → FAULT_FINDING | NO → Q7

Q7: Is there a clear wear-out pattern (A, B, or C)?
    YES → FIXED_TIME | NO → Q8

Q8: Is failure cost <= prevention cost?
    YES → RUN_TO_FAILURE | NO → REDESIGN/REDUNDANCY
```

---

## 3. P-F Interval Rules

**P-F interval** = Time between detectable Potential failure and Functional failure.

### Feasibility Gate
- P-F must be >= 3x (monitoring_time + response_time + planning_time)
- Minimum acceptable: 1 shift (critical), 1 day (important), 1 week (standard)

### Monitoring Interval Calculation
```
Monitoring_Interval = P-F / Safety_Factor

Safety Factors:
  Non-critical equipment: 2-3
  Important equipment: 4-6
  Safety-critical: 8-10
```

### CBM vs FT Decision Based on P-F
- P-F > 3x fixed_interval → CBM strongly preferred
- P-F < 2x fixed_interval → Fixed-time more practical
- P-F between 1-3x → Cost-benefit analysis required

### Task Frequency Rule (Moubray)
- CBM task frequency must be <= 50% of P-F interval
- This ensures net P-F (= P-F minus task interval) is long enough for corrective action

---

## 4. Task Selection Cost Rules

### NPV Rule
```
NPV = (Failure_Cost x Prevention_Probability)
    - (Task_Cost x False_Alarm_Factor)
    - (Maintenance_Induced_Failure_Cost)

IF NPV > 0 → Task is worth doing
IF NPV <= 0 → RTF or REDESIGN
```

### FT Interval Formula
```
Interval = MTTF x {0.4 - 0.7}
  0.4 = conservative (safety-critical)
  0.7 = aggressive (non-critical)

Validation: failures should not exceed 1 per 10 maintenance intervals
```

### RTF Acceptability
ALL must be true:
1. No safety consequences (or immediate mitigation available)
2. Cost(failure) <= Cost(preventive maintenance)
3. Failure pattern is random/unpredictable (D, E, F)
4. Component is low-cost or expendable
5. Redundancy exists OR non-critical to operations

---

## 5. Hidden Failure Rules

- Hidden failure = not evident to operator under normal operating conditions
- Typical hidden failures: protective devices, standby systems, safety interlocks
- Single-point standby systems MUST have failure-finding tasks
- Detection rate requirement: >90%
- FFI interval = Detection_Cycle / Risk_Tolerance

### Keywords for Hidden Failure Detection
sensor, detector, presostato, switch, alarma, proteccion, valvula de seguridad, valvula de alivio, interlock, indicador, transmisor, rele, relay, sistema contra incendio, parada de emergencia, ups, respaldo

---

## 6. Moubray Key Principles

1. **CBM is ALWAYS preferred over FT** when technically feasible (Moubray §12.2)
2. **FT only for age-related patterns** (A, B, C) — NEVER for D, E, F
3. **Pattern F dominance** means most equipment should NOT have scheduled overhauls
4. **Visual inspection is always feasible** as a minimum CBM technique
5. **Task frequency <= 50% of P-F interval** for all condition-based tasks
6. **RCM is applied per failure mode**, not per equipment — same equipment can have different strategies for different failure modes
