# REF-13: Maintenance Management Manual — GFSN01-DD-EM-0000-MN-00001

## Source: Manual de Gestión & Mejoramiento de Mantenimiento, Salares Norte (104 pages)

---

## 1. Scope & Framework

The Maintenance Management Manual is the master governance document for all maintenance activities at Minera Gold Fields Salares Norte (MGFSN). It follows PAS 55:2008 / ISO 55000:2014 principles and structures maintenance as a PHVA (Plan-Do-Check-Act) cycle with three levels: strategic, tactical, and operational.

**Key Standards Referenced:** SAE JA1011/JA1012 (RCM), ISO 14224:2016, NORSOK Z-008/Z-CR-008, BS 3811:2011, EN 13306:2011, ISO 31000:2018, EN 15341:2019, ISO 15663-1 (LCC).

---

## 2. Maintenance Process Map (Section 7)

### 2.1 Inputs
- Stakeholder needs (shareholders, workers, community, regulators)
- MGFSN sustainable development objectives + SAMP
- Environmental variables (PESTA analysis → SWOT → CAME)

### 2.2 Core Processes
```
DESIGN PHASE (Engineering)
  ├── FMECA (Failure Mode Effects & Criticality Analysis)
  ├── FTA (Fault Tree Analysis)
  └── RAM Modeling (Reliability, Availability, Maintainability)

OPERATION & MAINTENANCE PHASE
  ├── Technical Hierarchy (Ubicaciones Técnicas + Equipment)
  ├── Asset Criticality Analysis
  ├── RBI (Risk-Based Inspection) for static equipment
  └── RCM (Reliability Centered Maintenance)

IMPROVEMENT PHASE
  ├── OCR (Optimum Cost-Risk)
  ├── Defect Elimination (RCA)
  ├── Pareto Analysis
  ├── Jack-Knife Analysis
  ├── Statistical Functions (Weibull, etc.)
  ├── Predictive Techniques (vibration, oil, thermography, etc.)
  ├── LCC (Life-Cycle Costing)
  └── MoC (Management of Change)
```

### 2.3 Outputs (KPIs)
- OEE (Overall Equipment Effectiveness)
- MUC (Maintenance Unit Cost)
- HSE indicators
- Reliability: MTBF, MTTR
- Availability
- Planning & Scheduling compliance
- Spare parts management
- Defect elimination effectiveness

---

## 3. FMECA Methodology (Section 7.3.1)

### 3.1 Key Elements
- Applied during both design and operation phases
- Minimum data: equipment name, function, ID, failure modes, causes, effects on system, detection methods, compensating provisions, severity
- Links to other quantitative methods (FTA, RBD)
- Must be updated whenever systems or equipment change

### 3.2 FMECA Procedure
1. Define system preparation (design, functionality, operability, maintenance, environment)
2. Establish basic functioning principles, effects, manifestation forms, consequences
3. Conduct workshops using designed spreadsheets
4. Present analysis results, conclusions, and recommendations

### 3.3 RCM Decision Logic (SAE JA-1012)
Three steps for task selection:
1. Determine which consequence categories apply to the failure mode
2. Evaluate technical feasibility of possible failure management policies
3. Select policy that satisfies technical feasibility AND effectively addresses consequences

---

## 4. Criticality Assessment (Section 7.4.2)

**Method:** Semi-quantitative risk matrix
**Axes:** Consequence impact (5 levels: Insignificante → Extremo) × Frequency (5 levels: Raro → Casi seguro)

**Consequence Factors:**
- Economic: business impact, operational cost, operation interruption
- Non-economic: safety & health, environment, corporate social responsibility (RSC)

**Criticality Levels:**
| Level | Score Range | Action |
|-------|-----------|--------|
| Alto | 19-25 | Mandatory combined control strategies |
| Moderado | 8-18 | Monitor behavior, control effects |
| Bajo | 1-7 | May operate to failure |

---

## 5. Technical Hierarchy Structure (Section 7.4.1)

**Naming Convention (MGFSN mask):**
```
XX-YYY-ZZ-NNN
│   │   │   └── Sequential number
│   │   └── Equipment type code (2 chars)
│   └── Area code (3 chars)
└── Plant code (2 chars)
```

**Hierarchy Levels:**
1. Plant / Site
2. Area / Process
3. System / Sub-area
4. Equipment
5. Sub-assembly / Maintainable Item
6. Component

---

## 6. RBI — Risk-Based Inspection (Section 7.4.3)

Applicable to: static equipment (vessels, piping, tanks, heat exchangers)
**Method:** Evaluates damage mechanisms (corrosion, fatigue, creep, erosion, etc.) and consequence of loss of containment.
**Output:** Inspection plan with technique, frequency, and coverage based on risk.

---

## 7. RCM Process (Section 7.4.4)

Follows SAE JA-1011/JA-1012 standard with the following outputs:
- Context-specific maintenance tasks
- Frequency based on reliability data (Weibull when available)
- Task types: Condition-based, Time-based, Failure-finding, Redesign/modification, Run-to-failure

---

## 8. Improvement Techniques

### 8.1 OCR — Optimum Cost-Risk (Section 7.5.1)
Optimizes maintenance frequency by balancing cost of prevention vs risk of failure.

### 8.2 Pareto Analysis (Section 7.5.3)
Identifies "bad actors" — the 20% of equipment causing 80% of failures/costs.

### 8.3 Jack-Knife Diagram (Section 7.5.4)
Plots MTBF vs MTTR to classify equipment into 4 zones:
- Acute (low MTBF, high MTTR) — immediate attention
- Chronic (low MTBF, low MTTR) — reliability improvement
- Complex (high MTBF, high MTTR) — maintainability improvement
- Controlled (high MTBF, low MTTR) — acceptable performance

### 8.4 Weibull Analysis (Section 7.5.5)
Used for failure prediction and optimal replacement interval calculation.

### 8.5 Predictive Techniques (Section 7.5.6)
Detailed specifications for: vibration analysis, oil analysis, thermography, ultrasound, motor current analysis (MCA), partial discharge analysis — with measurement points, standards, and frequency by criticality class.

### 8.6 LCC — Life-Cycle Costing (Section 7.5.7)
Evaluates total ownership cost: acquisition + operation + maintenance + disposal.

### 8.7 MoC — Management of Change (Section 7.5.8)
Formal process for any modification to assets or processes.

---

## 9. KPI Framework (Section 7.6.4)

| KPI | Formula | Target |
|-----|---------|--------|
| Maintenance Cost | Total maintenance cost / tons processed | Per-site definition |
| Budget Compliance | Actual cost / Budgeted cost × 100 | ≤100% |
| OEE | Availability × Performance × Quality | Per-site definition |
| Availability | (Total time - Downtime) / Total time × 100 | Per-equipment class |
| MTBF | Operating hours / Number of failures | Per-equipment class |
| MTTR | Total repair hours / Number of repairs | Per-equipment class |
| Maintenance Intensity (IG) | Total maintenance hours / Operating hours | Benchmark |
| Asset Condition Assessment (ICA) | Weighted condition score | Per-equipment class |

---

## 10. Organizational Structure (Section 7.6)

```
Superintendencia de Mantenimiento
├── Planificación y Programación
│   ├── Planificadores (by area: Mine, Plant, SSEE)
│   └── Programador
├── Ejecución (by specialty)
│   ├── Mecánica
│   ├── Eléctrica / Instrumentación
│   └── Soldadura / Estructura
├── Ingeniería de Confiabilidad
│   ├── Confiabilista (Reliability Engineer)
│   └── Predictivo (Condition Monitoring)
└── Gestión de Materiales y Bodega
```
