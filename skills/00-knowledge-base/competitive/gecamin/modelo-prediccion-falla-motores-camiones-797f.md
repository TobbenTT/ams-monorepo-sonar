# Modelo de Prediccion de Falla de Motores de Camiones 797F

## Metadata
- **Authors:** Jean Campos, Manuel Berrospi, Jossy Atoche
- **Session:** S7 MAPLA 2024
- **Topic:** Development of a machine learning model using Support Vector Machine (SVM) to predict engine failures in CAT 797F haul trucks based on oil analysis data, achieving 83% accuracy with up to 4-week advance warning.

## Key Points
- **Context:** Haul truck fleet is critical to mining operations; engine failures on 797F trucks cause significant downtime and cost. Oil sampling is already standard practice but traditional analysis relies on threshold-based alarms.
- **Data pipeline:**
  1. Oil sample collection in workshop and field.
  2. Sample processing in laboratory.
  3. Results loaded to database.
  4. Equipment failure events recorded.
  5. Root cause analysis performed.
  6. Failure mode classification loaded to database.
- **Model architecture:**
  - **Algorithm:** Support Vector Machine with RBF (Radial Basis Function) kernel classifier.
  - **Inputs:** Wear metal values in oil (ppm) - specifically Lead (Pb), Tin (Sn), and SOOT.
  - **Output:** Probability of connecting rod bearing metal failure per truck.
  - **Mechanism:** Creates a hyperplane in feature space that separates failure/non-failure classes, maximizing the margin between support vectors.
- **Training and validation:**
  - Cross-validation approach for data splitting.
  - Hyperparameter optimization for model tuning.
  - Dimensional reduction applied to improve model performance.
- **Results:**
  - **Accuracy:** 83%
  - **F1-score:** 82%
  - Demonstrated failure probability tracking over time (example: truck CM125 from December 2022 to February 2024).
  - **Prediction window:** Up to 4 weeks before failure, enabling planned maintenance intervention.
- **Conclusions:**
  - Feasibility demonstrated for ML-based predictive maintenance focused on failure prevention.
  - 4-week prediction window is sufficient for maintenance planning and scheduling.
  - Next steps include integrating additional data sources (equipment sensors) to improve prediction reliability.

## Relevance to Asset Management
- Demonstrates practical application of machine learning to transform existing oil analysis data into a predictive tool, extracting more value from data already being collected.
- The 4-week prediction window is operationally significant, allowing proper planning, parts procurement, and scheduled intervention rather than emergency repair.
- The SVM approach is relatively simple and interpretable compared to deep learning, making it suitable for industrial adoption.
- Combining oil analysis with future sensor data integration represents a data fusion strategy that strengthens predictive capability.
- Directly applicable to any mining operation with CAT 797F or similar large haul truck fleets.
- The focus on connecting rod bearing failure (Pb, Sn, SOOT) targets a specific high-cost failure mode, demonstrating focused predictive analytics.

## Keywords
machine learning, SVM, support vector machine, predictive maintenance, oil analysis, 797F, CAT, haul trucks, engine failure, connecting rod bearings, lead, tin, soot, failure prediction, condition monitoring, MAPLA 2024
