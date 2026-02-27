# Transformando el Mantenimiento Predictivo: Oportunidades y Desafios de la Inteligencia Artificial

## Metadata
- **Authors:** Viviana Meruane N. (Full Professor, Mechanical Engineering Department, Universidad de Chile; R&D Director, Calmly Data Intelligence)
- **Session:** S3 MAPLA 2024
- **Topic:** Academic and industry perspective on how AI and deep learning are transforming predictive maintenance, presenting a practical anomaly detection framework with 99% sensitivity and 83% precision, while identifying key challenges for industrial adoption.

## Key Points
- **Consequences of unforeseen failures:** Safety risks, high maintenance costs, productivity losses, damage to connected/adjacent systems
- **Failure evolution model (P-F curve):** Design phase (original/purchase) -> Assembly (installation) -> Predictive zone (potential failure detectable) -> Preventive zone (sensitive inspection) -> Functional failure -> Catastrophic failure; repair cost increases along this curve
- **Predictive maintenance evolution in 4 stages:**
  1. Visual inspection (point measurements)
  2. Instrumented inspection (point measurements)
  3. Real-time monitoring with IoT sensors (continuous measurements, manual thresholds)
  4. Maintenance 4.0 (continuous measurements, AI-driven alarms) -- includes early anomaly detection, fault diagnosis, and remaining useful life (RUL) prediction
- **Maintenance 4.0 workflow:** Connected machines (IoT sensors) -> Remote monitoring (real-time data) -> Predictive analysis (AI models from historical data) -> Maintenance orders (tickets, technician assignment, validation)
- **Gradual AI implementation path based on data quality:**
  - Sensor data only: Threshold alarms -> Anomaly detection
  - Sensor data + failure history: Fault diagnosis
  - Structured labeled data: Fault prognosis (RUL prediction)
- **Three levels of AI in predictive maintenance:**
  1. **Anomaly detection:** Identifies behaviors outside expected patterns; key for detecting faults or atypical events (three anomaly types shown: threshold breach, spike, pattern change)
  2. **Fault diagnosis:** Neural network classifies fault type from sensor signals (e.g., imbalance, bearing, stator faults in motors)
  3. **Fault prognosis (RUL):** Predicts degradation level over time, estimates remaining useful life with confidence distributions
- **AI/ML hierarchy explained:** Artificial Intelligence (technologies imitating human intelligence) -> Machine Learning (algorithms improving through data learning) -> Deep Learning (neural networks processing large data volumes for autonomous decisions)
- **Key data challenge:** AI algorithms require failure data to learn, but in practice available data is dominated by non-failure cases, creating significant class imbalance
- **Practical example (pump monitoring):** Deep learning algorithm developed to predict expected sensor behavior (vibration, temperature, velocity, pressure, flow), then compare prediction vs. actual observation to identify anomalies
  - Observed vs. reconstructed signal comparison generates a normalized KPI (0 to 1)
  - Color-coded alert system: Green (normal) -> Yellow (alert) -> Red (danger) -> Blue (shutdown)
  - Sensor contribution analysis identifies which parameter drives the anomaly (e.g., TDescBbaLadoLibre contributed ~60% to anomaly in Pump 122)
- **Real results demonstrated:**
  - Seal water line leak detected: Yellow alert triggered 2 days before failure
  - Vibration increase detected: Yellow alert 7 days before failure, red alert 5 days before failure
- **Performance metrics achieved:** 99% sensitivity (correct fault identification), 83% precision (minimizing false positives), 2-day average advance warning before traditional method detection
- **Four pending challenges identified:**
  1. **Integration with existing systems:** Adapting new technologies to current maintenance systems is difficult due to lack of interoperability
  2. **Data quality and availability:** Noisy, incomplete, imbalanced data or scarcity of real failure data affects model precision and effectiveness; data quality dimensions include uniqueness, completeness, conformity, precision, integrity, consistency
  3. **Results interpretation and staff acceptance:** Adoption requires cultural changes, training, and personnel adaptation to interpret and trust AI systems
  4. **Model generalization:** Changes between equipment, operating conditions, or maintenance interventions may require retraining, increasing implementation cost and time

## Relevance to Asset Management
- Provides a clear technology roadmap for integrating AI into asset management software: from threshold monitoring through anomaly detection to full RUL prediction
- The 99% sensitivity / 83% precision metrics set a benchmark for evaluating AI-based predictive maintenance solutions
- The 2-day average advance warning demonstrates tangible value of AI over traditional methods that asset management platforms should integrate
- The four identified challenges (interoperability, data quality, change management, model generalization) are directly relevant to asset management software product roadmaps
- Calmly (the author's company) represents a potential competitor or partner in the AI-driven predictive maintenance software space
- The P-F curve and Maintenance 4.0 evolution framework are useful conceptual models for positioning asset management software capabilities

## Keywords
artificial intelligence, deep learning, predictive maintenance, anomaly detection, fault diagnosis, remaining useful life, RUL, P-F curve, IoT sensors, Maintenance 4.0, Calmly, Universidad de Chile, machine learning, neural networks, condition monitoring, data quality, false positives, sensitivity, precision
