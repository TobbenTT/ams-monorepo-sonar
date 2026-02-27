# Analisis de Reemplazo Tecnico como Indicador para la Toma de Decisiones Usando Modelos NHPP

## Metadata
- **Authors:** Adolfo Casilla Vargas
- **Session:** S12 MAPLA 2024
- **Topic:** NHPP (Non-Homogeneous Poisson Process) Crow-AMSAA model for optimal equipment replacement timing and ROI analysis

## Key Points
- Maintenance mission: ensure reliability, availability, and maintainability at adequate costs under safe conditions
- Shift from traditional question "What reliability is achieved after improvements?" to "What is the ROI/profit achieved after improvements?"
- Risk = number of failures/period x (unplanned maintenance cost/failure + penalty cost/failure)
- SMART objectives framework applied to maintenance improvement projects
- Uses Crow-AMSAA model (NHPP) for repairable systems: W(t) = lambda * t^beta for expected failure count
- Optimal replacement time minimizes cost per hour of service: um/uts = (acquisition cost + failure cost x expected failures) / projected time
- Case study: underground copper mine (COOPERC) with 4 yd3 scoops fleet
- Scenario analysis with 4 cases demonstrating progressive investment impact:
  - No improvements: optimal replacement at 10,447 hrs, $45.3 USD/hr, negative remaining life (-7,553 hrs vs. 18,000 OEM)
  - Case 1 ($50K investment to reduce business impact): extends to 17,541 hrs, $26.98 USD/hr
  - Case 2 ($65K investment + maintainability): extends to 26,159 hrs, $18.09 USD/hr, positive remaining life (+8,159 hrs)
  - Case 3 ($95K investment + reliability): extends to 29,486 hrs, $19.01 USD/hr, remaining life +11,486 hrs
- ROI calculation: Profit = Revenue generated - Investment costs; ROI = Profit / Investment
- Case 1 ROI = 8.4x, Case 2 ROI = 8.3x, Case 3 ROI = 5.4x on $95K total investment
- Beta > 1 indicates increasing failure rate / degrading reliability / decreasing MTBF - technical replacement needed
- Three root causes of poor equipment performance: inherent wear, management issues, and human factors

## Relevance to Asset Management
- Provides a quantitative framework for equipment replacement decisions based on total cost of ownership
- NHPP model captures the non-stationary failure behavior typical of aging mining equipment
- Scenario analysis enables evidence-based business cases for maintenance improvement investments
- ROI and profit metrics translate maintenance decisions into financial language understood by management
- Remaining life calculation directly supports CAPEX planning for fleet replacement programs

## Keywords
NHPP, Crow-AMSAA, replacement analysis, ROI, cost per hour, repairable systems, optimal replacement time, remaining life, beta parameter, failure rate, scoop, underground mining, COOPERC, total cost of ownership
