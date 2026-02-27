# RCM Decision Tree - Reference Details

## Decision Tree Diagram

```
START
  |
  +-- Is failure HIDDEN?
  |     |
  |     +-- YES (Hidden)
  |     |     |
  |     |     +-- CBM feasible + viable?
  |     |     |     +-- YES -> [1] HIDDEN_CBM (secondary: yes)
  |     |     |     +-- NO  v
  |     |     |
  |     |     +-- FT feasible + age-related pattern?
  |     |     |     +-- YES -> [2] HIDDEN_FT (secondary: no)
  |     |     |     +-- NO  v
  |     |     |
  |     |     +-- Is consequence HIDDEN_NONSAFETY?
  |     |           +-- YES -> [3] HIDDEN_FFI (secondary: yes)
  |     |           +-- NO  -> [4] HIDDEN_REDESIGN (secondary: no)
  |     |
  |     +-- NO (Evident)
  |           |
  |           +-- EVIDENT_SAFETY or EVIDENT_ENVIRONMENTAL?
  |           |     |
  |           |     +-- CBM feasible + viable?
  |           |     |     +-- YES -> [5/8] *_CBM (secondary: yes)
  |           |     |     +-- NO  v
  |           |     |
  |           |     +-- FT feasible + age-related?
  |           |     |     +-- YES -> [6/9] *_FT (secondary: no)
  |           |     |     +-- NO  -> [7/10] *_REDESIGN (secondary: no)
  |           |
  |           +-- EVIDENT_OPERATIONAL?
  |           |     |
  |           |     +-- CBM feasible + viable?
  |           |     |     +-- YES -> [11] OPERATIONAL_CBM (secondary: yes)
  |           |     |     +-- NO  v
  |           |     |
  |           |     +-- FT feasible + age-related?
  |           |     |     +-- YES -> [12] OPERATIONAL_FT (secondary: no)
  |           |     |     +-- NO  -> [13] OPERATIONAL_RTF (secondary: no)
  |           |
  |           +-- EVIDENT_NONOPERATIONAL
  |                 |
  |                 +-- CBM feasible + viable?
  |                 |     +-- YES -> [14] NONOPERATIONAL_CBM (secondary: yes)
  |                 |     +-- NO  v
  |                 |
  |                 +-- FT feasible + age-related?
  |                 |     +-- YES -> [15] NONOPERATIONAL_FT (secondary: no)
  |                 |     +-- NO  -> [16] NONOPERATIONAL_RTF (secondary: no)
```

## Failure Pattern Reference

| Value | Weibull Beta Range | Description | Age-Related? |
|-------|-------------------|-------------|-------------|
| A_BATHTUB | beta >= 3.5 | Bathtub curve wear-out | YES |
| B_AGE | 2.0 <= beta < 3.5 | Age-related degradation | YES |
| C_FATIGUE | 1.5 <= beta < 2.0 | Fatigue-driven failure | YES |
| D_STRESS | 1.2 <= beta < 1.5 | Stress-related failure | NO |
| E_RANDOM | 0.8 <= beta < 1.2 | Random failure | NO |
| F_EARLY_LIFE | beta < 0.8 | Early-life / infant mortality | NO |

## Frequency Unit Validation Tables

### Calendar Causes (must use calendar units)

| Cause | Required Unit Type |
|-------|-------------------|
| AGE | Calendar (DAYS, WEEKS, MONTHS, YEARS) |
| CONTAMINATION | Calendar |
| CORROSIVE_ENVIRONMENT | Calendar |
| EXPOSURE_TO_ATMOSPHERE | Calendar |
| BIO_ORGANISMS | Calendar |
| CHEMICAL_ATTACK | Calendar |

### Operational Causes (must use operational units)

| Cause | Required Unit Type |
|-------|-------------------|
| USE | Operational (HOURS, OPERATING_HOURS, TONNES, CYCLES) |
| ABRASION | Operational |
| MECHANICAL_OVERLOAD | Operational |
| RUBBING | Operational |
| RELATIVE_MOVEMENT | Operational |
| EXCESSIVE_FLUID_VELOCITY | Operational |
| IMPACT_SHOCK_LOADING | Operational |
| CYCLIC_LOADING | Operational |
| METAL_TO_METAL_CONTACT | Operational |

**Calendar units:** DAYS, WEEKS, MONTHS, YEARS
**Operational units:** HOURS, OPERATING_HOURS, TONNES, CYCLES

## Worked Examples

### Example 1: Hidden Safety Failure on Protective Relay

**Inputs:**
- is_hidden = true
- failure_consequence = HIDDEN_SAFETY
- cbm_technically_feasible = false
- cbm_economically_viable = false
- ft_feasible = false
- failure_pattern = E_RANDOM (beta = 1.1)

**Walk:** Hidden -> CBM? No -> FT? ft_feasible=false AND E_RANDOM not age-related = No -> Consequence=HIDDEN_SAFETY -> **REDESIGN**

**Result:** Path=HIDDEN_REDESIGN, Strategy=REDESIGN, Secondary=false

### Example 2: Evident Operational on Conveyor Belt

**Inputs:**
- is_hidden = false
- failure_consequence = EVIDENT_OPERATIONAL
- cbm_technically_feasible = true (vibration monitoring)
- cbm_economically_viable = true (justified by production loss)
- cause = ABRASION, frequency_unit = OPERATING_HOURS

**Walk:** Evident -> Operational -> CBM feasible+viable? YES -> **CONDITION_BASED**
**Frequency:** ABRASION=operational, OPERATING_HOURS=operational. VALID.

**Result:** Path=EVIDENT_OPERATIONAL_CBM, Strategy=CONDITION_BASED, Secondary=true

### Example 3: Evident Environmental with No Options

**Inputs:**
- is_hidden = false
- failure_consequence = EVIDENT_ENVIRONMENTAL
- cbm_technically_feasible = false
- cbm_economically_viable = false
- ft_feasible = true
- failure_pattern = E_RANDOM

**Walk:** Evident -> Environmental -> CBM? No -> FT? ft_feasible=true BUT E_RANDOM not age-related = No -> **REDESIGN** (never RTF!)

**Result:** Path=EVIDENT_ENVIRONMENTAL_REDESIGN, Strategy=REDESIGN, Secondary=false
