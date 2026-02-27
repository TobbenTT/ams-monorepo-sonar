# Perform RCA - Reference Details

## Worked Example: SAG Mill Trunnion Bearing Seizure

### Step 1: Classify Event
- Consequence = 4, Frequency = 3
- Score = 4 x 3 = 12
- 12 >= 8 and < 15 -> **Level 2** (min 3 team members)

### Step 2: Create Analysis
- Event: "SAG mill trunnion bearing seized during operation"
- Plant: OCP-JFC1, Equipment: 10045678, Level: 2
- Team: ["J. Martinez", "R. Lopez", "A. Chen"]
- Status: OPEN

### Step 3: OPEN -> UNDER_INVESTIGATION

### Step 4: 5W+2H

| Question | Answer |
|----------|--------|
| What | Trunnion bearing seized, mill emergency stopped |
| When | 2024-10-15 at 14:30, shift B |
| Where | SAG Mill #1, feed end trunnion bearing |
| Who | Grinding operators, mechanical maintenance crew |
| Why | 12-hour production loss, $500K production + $120K repair |
| How | Bearing temperature alarm triggered at 12:30, not responded to until seizure at 14:30 |
| How Much | $620K total (production + repair + overtime) |

### Step 5: Ishikawa Cause-Effect Diagram

| Cause ID | Cause | Evidence Type | Parent | Level |
|----------|-------|---------------|--------|-------|
| C1 | Bearing seized due to oil starvation | SENSORY | -- | PHYSICAL |
| C2 | Lubrication pump intermittent failure | INFERRED | C1 | PHYSICAL |
| C3 | Operator did not respond to temperature alarm | SENSORY | C1 | HUMAN |
| C4 | No alarm response procedure exists | INFERRED | C3 | LATENT |
| C5 | Inadequate operator training on alarm priorities | INFERRED | C3 | HUMAN |

### Step 6: 5P Evidence

| Category | Description | Source | Fragility |
|----------|-------------|--------|-----------|
| PARTS | Bearing shows blue discoloration and scoring | Disassembly report | 1.0 |
| PARTS | Lube pump worn impeller, intermittent flow | Pump inspection | 1.5 |
| POSITION | Oil drain line partially blocked by debris | Site inspection | 2.0 |
| PEOPLE | Operator confirms alarm at 12:30 | Interview | 5.0 |
| PAPERS | SCADA log confirms alarm 2 hrs before seizure | SCADA export | 3.0 |
| PARADIGMS | "Alarms go off all the time" culture | Team interview | 8.0 |

### Step 7: Root Cause Chain
- Level 2 requires: PHYSICAL + HUMAN
- PHYSICAL: C1, C2 (YES)
- HUMAN: C3, C5 (YES)
- LATENT: C4 (bonus -- exceeds Level 2 requirements)
- Validation: PASSES

### Step 8: Solution Evaluation

| Solution | 5 Questions | Pass? |
|----------|------------|-------|
| Install redundant lube pump | [T,T,T,T,T] | YES |
| Add alarm response SOP | [T,T,T,T,T] | YES |
| Retrain operators on alarm priority | [T,T,T,T,T] | YES |
| Replace bearing with self-lubricating | [T,T,T,T,F] | NO |

### Step 9: Solution Prioritization

| Solution | Cost-Benefit | Difficulty | Quadrant | Rank |
|----------|-------------|------------|----------|------|
| Add alarm response SOP | 8.0 | 2.0 | Q1 (HB/LD) | 1 |
| Retrain operators | 7.0 | 3.0 | Q1 (HB/LD) | 2 |
| Install redundant pump | 9.0 | 6.0 | Q2 (HB/HD) | 3 |

## Solution Quadrant Map

```
        Low Difficulty (<=5)    High Difficulty (>5)
       +----------------------+----------------------+
High   | Q1: DO FIRST         | Q2: PLAN CAREFULLY   |
Benefit| (Rank: 1st)          | (Rank: 2nd)          |
(>=5)  |                      |                      |
       +----------------------+----------------------+
Low    | Q3: QUICK WINS       | Q4: DEPRIORITIZE     |
Benefit| (Rank: 3rd)          | (Rank: 4th)          |
(<5)   |                      |                      |
       +----------------------+----------------------+
```

## Defect Elimination KPI Formulas

### KPI 1: Event Reporting Compliance
- Formula: (events_reported / events_required) x 100
- Target: >= 95%

### KPI 2: Meeting Compliance
- Formula: (meetings_held / meetings_required) x 100
- Target: >= 90%

### KPI 3: Implementation Progress
- Formula: (actions_implemented / actions_planned) x 100
- Target: >= 80%

### KPI 4: Savings Effectiveness
- Formula: (savings_achieved / savings_target) x 100
- Target: >= 70%

### KPI 5: Frequency Reduction
- Formula: (failures_previous - failures_current) / failures_previous x 100
- Target: >= 10% reduction

### Overall Compliance
- Average of all non-null KPI values, capped at 100.0

## DE KPI Worked Example

| KPI | Value | Target | Status |
|-----|-------|--------|--------|
| Event Reporting | 45/48 x 100 = 93.8% | 95% | BELOW_TARGET |
| Meeting Compliance | 10/12 x 100 = 83.3% | 90% | BELOW_TARGET |
| Implementation | 32/40 x 100 = 80.0% | 80% | ON_TARGET |
| Savings | 350K/500K x 100 = 70.0% | 70% | ON_TARGET |
| Frequency Reduction | (35-28)/35 x 100 = 20.0% | 10% | ON_TARGET |

Overall = (93.8 + 83.3 + 80.0 + 70.0 + 20.0) / 5 = 69.4%

## 6M Ishikawa Categories

| Category | Description | Example Causes |
|----------|-------------|----------------|
| Man | Human factors | Operator error, training, fatigue |
| Machine | Equipment factors | Worn components, design deficiency |
| Material | Material/supply | Wrong lubricant, defective spare |
| Method | Process/procedure | Wrong procedure, missing SOP |
| Measurement | Monitoring | Uncalibrated sensor, missing alarm |
| Mother Nature | Environmental | Temperature, humidity, vibration |
