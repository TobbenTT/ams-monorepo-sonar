# REF-16: Asset Criticality Analysis Procedure — GFSN01-DD-EM-0000-PT-00001

## Source: Procedimiento Análisis de Criticidad de Activos (16 pages, Rev 0, Jun 2020)

---

## 1. Objective & Scope

Define the methodology for asset criticality analysis at Minera Gold Fields Salares Norte (MGFSN) to establish priorities for operations, maintenance, improvement, and asset modernization strategies — all affected by the inherent risk of different systems.

**Applies to:** All physical assets owned by Gold Fields at Salares Norte.

**Standards Referenced:** NORSOK Z-CR-008, NORSOK Z-008, IRM Risk Appetite and Tolerance Guidance, Gold Fields Corporate Risk Matrix for Operational Risk Assessments.

---

## 2. Method Classification

| Type | Description | Applicability |
|------|-------------|---------------|
| **Qualitative** | Expert opinion combining technical, environmental, financial criteria | Non-complex systems — high subjectivity |
| **Semi-Quantitative** | Expert opinion with relative numeric scoring across technical, environmental, financial criteria | **SELECTED METHOD** — effective for all complexity levels |
| **Quantitative** | Statistical estimation of economic failure impact with semi-probabilistic models | Requires extensive historical data |

---

## 3. Process Inputs & Outputs

### 3.1 Inputs
- Asset technical documentation (equipment descriptions, capacity requirements, operating conditions)
- Failure consequence classification criteria (6 factors)
- Failure frequency/probability classification criteria (5 levels)
- Asset taxonomy (hierarchical classification)
- Process reliability diagrams (if available)
- Risk matrices defined for Salares Norte operations
- P&ID and PFD diagrams

### 3.2 Outputs
- Defined criticality evaluation criteria
- Equipment list classified by criticality level
- General risk control recommendations

---

## 4. Consequence Evaluation Criteria (6 Factors)

### 4.1 Economic Factors (3)

| Factor | Description |
|--------|-------------|
| **Business Impact (Impacto económico en el negocio)** | Impact on operational margin — lost revenue from final product not delivered during process unavailability |
| **Operational Cost (Costo operacional)** | Expenses related to process capacity loss + costs to restore operational context and repair |
| **Operation Interruption (Interrupción de la operación)** | Quantification of effective operational discontinuity time, considering buffers and redundancy configurations |

### 4.2 Non-Economic Factors (3)

| Factor | Description |
|--------|-------------|
| **Safety & Health (Seguridad y Salud)** | Potential effect of asset failure on worker health/safety |
| **Environment (Medio Ambiente)** | Potential environmental effect measured by scope, remediation time, and residual damage |
| **Corporate Social Responsibility (RSC)** | Effect on legal obligations and community commitments — may represent economic, legal, community conflicts, and impact on operations and company image |

### 4.3 Consequence Impact Levels (5)

| Level | Name (Spanish) | Description |
|-------|---------------|-------------|
| 1 | **Insignificante** | Tolerable, very low importance, requires few resources |
| 2 | **Menor** | Still low, may generate localized issues requiring immediate attention |
| 3 | **Moderado** | Medium, may generate general operational issues |
| 4 | **Mayor** | High, may lead to general inoperability or affect business results |
| 5 | **Extremo** | Gold Fields does not tolerate this level — may jeopardize business continuity or results |

---

## 5. Frequency/Probability Criteria (5 Levels)

| Level | Name (Spanish) | Description |
|-------|---------------|-------------|
| 1 | **Raro** | Very unlikely occurrence within project life |
| 2 | **Improbable** | Low probability, may occur once in long intervals |
| 3 | **Posible** | Could reasonably occur within normal operations |
| 4 | **Probable** | Expected to occur multiple times during project life |
| 5 | **Casi seguro** | Almost certain to occur frequently |

**Note:** Since Salares Norte had no statistical/probabilistic data at project start, the probability axis was defined using a fixed time base consistent with the operational context:
- **Maximum time base:** 10 years (aligned with average project and critical asset lifecycle)
- **Minimum time base:** Maximum acceptable failure frequency for moderate-impact failures

---

## 6. Criticality Matrix (5×5)

```
                  Consequence Impact
                  1-Insignif  2-Menor  3-Moderado  4-Mayor  5-Extremo
5-Casi seguro     Moderado    Moderado    Alto       Alto      Alto
4-Probable        Bajo        Moderado    Moderado   Alto      Alto
3-Posible         Bajo        Moderado    Moderado   Moderado  Alto
2-Improbable      Bajo        Bajo        Moderado   Moderado  Alto
1-Raro            Bajo        Bajo        Bajo       Moderado  Moderado
```

### 6.1 Criticality Levels (3)

| Level | Score Range | Description | Required Action |
|-------|------------|-------------|-----------------|
| **Alto** | 19-25 | Cannot reduce risk level for major events — mandatory combined control strategies to prevent or mitigate effects | Multiple combined maintenance strategies mandatory |
| **Moderado** | 8-18 | Could generate moderate consequences — monitor behavior to control effects | Observe behavior, implement effect-control strategies |
| **Bajo** | 1-7 | Events do not generate consequences requiring control — may operate to failure | Run-to-failure acceptable |

### 6.2 Calculation Method
- **Score** = max(Consequence level across all 6 factors) × Probability level
- The dominant consequence (highest across factors) is weighted against probability
- Complementary 0-100% score allows differentiation within same criticality band

---

## 7. Evaluation Framework

### 7.1 Analysis Hierarchy Levels
| Level | Description |
|-------|-------------|
| **Área** | Sub-process: set of equipment/installations operating under a single purpose |
| **Equipo** | Functional unit: composed of systems and maintainable items delivering a main function |
| **Ítem mantenible** | Maintainable item: parts within equipment maintained as a whole |

### 7.2 Key Question for Analysis
> "What is the effect on the system or installation given a major failure of the asset?"

The most serious failure effect (without exceeding reality) must be considered and described.

### 7.3 Evaluation Assumptions
- No controls exist to prevent the failure
- No contingency plans are in place
- Equipment is operating under normal conditions

### 7.4 Analysis Fields

**Informative Fields:**
- Area, Equipment, Maintainable Item identification
- Main function (performance-defined)
- Event/Failure description (most significant impact scenario)
- Failure consequence description considering:
  - Operational configuration (single, parallel, active redundancy, standby)
  - Operation type (continuous, hours/shifts, standby, stationary)
  - Process buffers delaying effect
  - Contingency equipment/plans
  - Both economic and non-economic consequences

**Analysis Fields:**
- **Probability:** Single probability per event/failure from the 5-level scale
- **Consequences:** Level of impact per applicable factor from the 5-level scale
- **Result:** Dominant consequence × probability → criticality band + complementary 0-100% score

---

## 8. Roles & Responsibilities

### 8.1 Evaluation Team (Equipo Evaluador)
- Validate consequence and frequency evaluation criteria for operational context
- Establish asset functional boundaries within the process
- Identify potential failures in assets under analysis
- Participate in evaluation sessions with required technical documentation
- Evaluate failure consequences accurately and efficiently

### 8.2 Facilitator
- Convene work sessions ensuring participants understand the analysis objective
- Control adequate time usage
- Complete criticality evaluation technical sheets
- Consolidate final evaluated equipment list
- Deliver recommendation reports from criticality analysis (if needed)

---

## 9. Final Report Requirements

Must contain:
1. **Criticality classification summary** for each asset group studied
2. **General recommendations** from conclusions given by the evaluation group during analysis

---

## 10. Key Differences from Current System Implementation

| Aspect | GFSN Procedure | Current System (criticality_engine.py) |
|--------|----------------|---------------------------------------|
| Consequence factors | **6 factors** (3 economic + 3 non-economic) | **11 categories** from Anglo American/R8 methodology |
| Consequence levels | 5 levels: Insignificante→Extremo (1-5) | 5 levels: Insignificant→Catastrophic (1-5) — similar |
| Frequency levels | 5 levels: Raro→Casi seguro (1-5) | 5 levels: Rare→Almost certain (1-5) — similar |
| Criticality bands | **3 levels:** Alto (19-25), Moderado (8-18), Bajo (1-7) | **4 risk classes:** I (1-4), II (5-9), III (10-15), IV (16-25) |
| Calculation | max(consequence) × probability → 3-band classification | max(consequence) × probability → 4-class classification |
| ALARP integration | Explicitly mentions ALARP zones in matrix distribution | Not explicitly referenced |
| Redundancy consideration | Must consider operational configuration (parallel, standby, buffers) | Not part of criticality calculation |
| Score differentiation | 0-100% complementary score within same band | No within-band differentiation |
| Evaluation assumptions | Explicitly assumes no controls, no contingency, normal operations | Not documented as assumptions |
| Action mapping | Each level maps to specific strategy approach (run-to-failure, monitor, combined strategies) | Risk class maps to criticality label but not directly to strategy |
