# FMECA - Worked Examples and Reference Tables

## RPN Scoring Scale Reference

| Dimension | Scale | 1 | 5 | 10 |
|-----------|-------|---|---|-----|
| **Severity** (S) | Impact if failure occurs | No noticeable effect | Moderate impact, partial loss | Hazardous, safety risk |
| **Occurrence** (O) | How often this happens | Extremely unlikely | Occasional | Almost certain |
| **Detection** (D) | Likelihood of detecting before impact | Almost certain detection | Moderate detection chance | No detection possible |

**Important:** Detection is inverse-intuitive. D=1 is best (easy to detect), D=10 is worst (undetectable).

## Consequence Classification Values

| Value | Description |
|-------|-------------|
| HIDDEN_SAFETY | Hidden failure with safety implications |
| HIDDEN_NONSAFETY | Hidden failure without safety implications |
| EVIDENT_SAFETY | Evident failure with safety impact |
| EVIDENT_ENVIRONMENTAL | Evident failure with environmental impact |
| EVIDENT_OPERATIONAL | Evident failure affecting operations |
| EVIDENT_NONOPERATIONAL | Evident failure with only repair cost impact |

## Worked Example: FMECA for SAG Mill Pinion Gear

### Stage 1 - Define Function
- Function: "Transmit 12,000 kW from motor to mill shell via pinion-to-ring gear mesh at 9.5 RPM"

### Stage 2 - Identify Failures
- Functional Failure: "Unable to transmit required torque"
- Failure Mode: "Pinion gear teeth worn beyond tolerance due to abrasion"

### Stage 3 - Assess Effects
- Failure Effect: "Mill stops, 8-hour replacement, $250K production loss"
- Severity = 8, Occurrence = 4, Detection = 3
- RPN = 8 x 4 x 3 = **96** -> Category: **MEDIUM**

### Stage 4 - RCM Decision
- failure_consequence = EVIDENT_OPERATIONAL
- is_hidden = false
- severity=8 >= 4 -> cbm_technically_feasible = true
- occurrence=4 >= 3 -> cbm_economically_viable = true
- CBM feasible+viable -> **Strategy = CONDITION_BASED**, Path = EVIDENT_OPERATIONAL_CBM

### Stage 5 - Define Task

**5a. Select Detection Technique:**

Reasoning process:
1. **Mechanism:** WEARS — progressive material loss on gear tooth surfaces
2. **Physical evidence before functional failure (P condition):** Tooth profile changes produce altered gear mesh vibration signature (changes in gear mesh frequency and sidebands). Also, wear debris particles appear in lubricant. Visual evidence includes scoring, pitting, and material loss on tooth flanks.
3. **Monitoring categories that detect this evidence:**
   - Dynamic Effects (vibration): Detects gear mesh frequency changes, sidebands, and amplitude increase. P-F interval: weeks to months.
   - Particle Effects (oil analysis): Detects wear debris in lubricant. P-F interval: months.
   - Human Senses (visual): Detects surface scoring and material loss during access. P-F interval: hours to days (only during shutdown access).
4. **P-F interval comparison:** Oil analysis provides longest P-F (months), followed by vibration (weeks-months). Visual has shortest useful P-F (requires shutdown access).
5. **Decision:** For a SAG mill pinion (>300 kW, critical drive train), vibration analysis is the primary online technique — ISO 10816-3 Group 1 applies, gear mesh frequency monitoring per ISO 13373. Oil analysis is supplementary for wear particle trending. Visual inspection occurs during planned shutdowns but is not a standalone online strategy.

**Selected technique:** Vibration analysis (primary, online)

**5b. Task Name:**
`Perform vibration analysis on Pinion Gear [BRY-SAG-ML-001]`

**5c. Acceptable Limits:**
`Vibration ≤ 4.5 mm/s RMS per ISO 10816-3 Group 1 (Zone A/B boundary). Monitor gear mesh frequency (GMF) and ±1, ±2 sidebands — amplitude increase >6 dB from baseline indicates developing wear.`

**5d. Conditional Comments:**
`If vibration exceeds 7.1 mm/s RMS (Zone C/D boundary): schedule pinion inspection within next planned shutdown (max 30 days). If GMF sidebands increase >10 dB from baseline: increase monitoring frequency to weekly. If vibration exceeds 11.2 mm/s RMS (Zone D): stop mill, inspect pinion immediately.`

## Multi-Row Example (Stages 1-5)

| Row | Function | Failure Mode | S | O | D | RPN | Cat | Consequence | Strategy | Technique | Task Name | Acceptable Limits |
|-----|----------|-------------|---|---|---|-----|-----|-------------|----------|-----------|-----------|-------------------|
| R-1 | Transmit torque | Gear teeth worn | 8 | 4 | 3 | 96 | MED | EVIDENT_OPERATIONAL | CONDITION_BASED | Vibration analysis | Perform vibration analysis on Pinion Gear [tag] | Vibration ≤ 4.5 mm/s RMS per ISO 10816-3 Group 1 |
| R-2 | Contain lubricant | Seal leaks externally | 5 | 6 | 4 | 120 | HIGH | EVIDENT_ENVIRONMENTAL | CONDITION_BASED | Visual inspection | Inspect Seal for leakage and fluid loss [tag] | No visible leakage at seal face; drip rate <1 drop/min |
| R-3 | Protect from overload | Shear pin fails to activate | 9 | 2 | 8 | 144 | HIGH | HIDDEN_SAFETY | FIXED_TIME | — | Replace Shear Pin [tag] | — (FT: no limits required) |
| R-4 | Support shaft alignment | Bearing housing cracks | 7 | 2 | 5 | 70 | MED | EVIDENT_OPERATIONAL | CONDITION_BASED | Vibration analysis | Perform vibration analysis on Bearing Housing [tag] | Vibration ≤ 4.5 mm/s RMS per ISO 10816-3 Group 1 |

### Row R-2 Stage 5 Walkthrough (Seal leaks — CONDITION_BASED)

**5a. Technique Reasoning:**
1. **Mechanism:** LEAKS — progressive seal degradation allows fluid to escape
2. **Physical evidence (P condition):** Visible fluid on seal face, dripping, wet surfaces
3. **Monitoring categories:** Human Senses (visual observation) is the most practical — seal leakage produces obvious visible evidence. No advanced technique (vibration, thermography, ultrasound) provides significantly better P-F interval for external seal leakage detection.
4. **P-F interval:** Visual detection P-F = hours to days once leakage begins. For slow-developing seal wear, routine route-based visual inspection catches early weeping before full failure.
5. **Decision:** Visual inspection is the correct technique. EVIDENT_ENVIRONMENTAL consequence means conservative thresholds are needed.

**Selected technique:** Visual inspection

**5b. Task Name:** `Inspect Seal for leakage and fluid loss [BRY-SAG-ML-001]`

**5c. Acceptable Limits:** `No visible leakage at seal face. Drip rate <1 drop/minute acceptable per environmental compliance threshold.`

**5d. Conditional Comments:** `If active leakage observed (>1 drop/min): schedule seal replacement within 7 days, deploy drip tray for containment. If drip rate >5 drops/min or pooling: stop equipment, replace seal immediately — environmental spill risk.`

### Row R-3 Detailed Walkthrough (Shear pin — FIXED_TIME)

**Stage 4 Decision:**
- Severity = 9 >= 4 -> cbm_technically_feasible = true
- Occurrence = 2 < 3 -> cbm_economically_viable = **false**
- CBM requires BOTH -> CBM not selected
- Severity = 9 >= 6 -> ft_feasible = true, pattern = B_AGE
- Hidden path -> CBM? No -> FT feasible + age-related? YES -> **HIDDEN_FT**
- Strategy = FIXED_TIME, Path = HIDDEN_FT

**Stage 5 Task Definition:**
- FIXED_TIME strategy requires no acceptable limits or conditional comments.
- **Task Name:** `Replace Shear Pin [BRY-SAG-ML-001]`
- **Handoff to Planning:** The Planning Specialist will define labour (trade, hours, crew size) and the Spare Parts Specialist will assign the shear pin material per T-16 rule (REPLACE tasks require material assignment).

### Row R-4 Stage 5 Walkthrough (Bearing housing — CONDITION_BASED)

**5a. Technique Reasoning:**
1. **Mechanism:** WEARS — progressive bearing degradation (surface fatigue, spalling, cage wear)
2. **Physical evidence (P condition):** Vibration signature changes — increased amplitude at bearing defect frequencies (BPFO, BPFI, BSF, FTF), new frequency components, elevated envelope spectrum energy
3. **Monitoring categories:**
   - Dynamic Effects (vibration analysis): Envelope analysis per ISO 13373 detects early-stage bearing defects. P-F interval: 1-6 months for rolling element bearings.
   - Temperature Effects (thermography): Detects bearing overheating. P-F interval: days to weeks — shorter, catches later-stage failure.
   - Particle Effects (oil analysis): Detects bearing wear debris. Only applicable if oil-lubricated (not grease-lubricated bearings).
4. **P-F interval comparison:** Vibration provides the longest P-F (months) and detects earliest-stage degradation. Thermography is supplementary but has much shorter P-F.
5. **Decision:** Vibration analysis is the primary technique. For this equipment (>300 kW, SAG mill), ISO 10816-3 Group 1 applies. Envelope analysis per ISO 13373 for bearing defect frequency tracking.

**Selected technique:** Vibration analysis

**5b. Task Name:** `Perform vibration analysis on Bearing Housing [BRY-SAG-ML-001]`

**5c. Acceptable Limits:** `Vibration ≤ 4.5 mm/s RMS per ISO 10816-3 Group 1 (Zone A/B boundary). Envelope spectrum: no bearing defect frequencies (BPFO, BPFI, BSF) exceeding baseline +6 dB.`

**5d. Conditional Comments:** `If vibration exceeds 7.1 mm/s RMS (Zone C/D): schedule bearing replacement within 30 days. If bearing defect frequencies appear with harmonics: increase monitoring to weekly, plan replacement for next shutdown. If vibration exceeds 11.2 mm/s RMS (Zone D): stop equipment, inspect bearing immediately.`

### Summary Output

| Metric | Value |
|--------|-------|
| Total rows | 4 |
| RPN Distribution | LOW: 0, MEDIUM: 2, HIGH: 2, CRITICAL: 0 |
| Strategy Distribution | CONDITION_BASED: 3, FIXED_TIME: 1 |
| Average RPN | 107.5 |
| High/Critical Count | 2 |

### Recommendations Generated
- "2 failure modes have HIGH/CRITICAL RPN -- prioritize mitigation"

## Stage Advancement Prerequisites

| Transition | Prerequisite |
|------------|-------------|
| Stage 1 -> Stage 2 | At least one function defined (non-empty function_description) |
| Stage 2 -> Stage 3 | At least one failure mode defined (non-empty failure_mode) |
| Stage 3 -> Stage 4 | At least one failure effect defined (non-empty failure_effect) |
| Stage 4 -> Stage 5 | All rows have strategy_type assigned |
| Stage 5 -> COMPLETED | All CB/FFI rows have technique, task_name, acceptable_limits, and conditional_comments |
