# AI Detector: Deteccion de Anomalias en Chancadores mediante Inteligencia Artificial

## Metadata
- **Authors:** Rodrigo Vergara, Cristian Bastias, Reddy Perez, Hernaldo Zamorano
- **Session:** S11 MAPLA 2024
- **Topic:** AI-based anomaly detection system for crushers using autoencoders and Gaussian Mixture Models (GMM) to identify faults from SCADA data, part of a broader Total Condition Monitoring System (TCMS).

## Key Points
- Evolution of maintenance: corrective (XVIII century) -> preventive (1950, 5S/TPM) -> predictive (1990, vibrations/thermography) -> online monitoring (2015, DCS/SCADA) -> AI (today) -> digital twins and autonomous operation (near future)
- Current monitoring infrastructure: 735 sensors monitored, 545 assets, 1080 connected sensors; 15-20 equipment under active follow-up
- AI Detector is an AI-based anomaly detection system specifically for crushers
- System capabilities beyond anomaly detection:
  - Characterized fault diagnosis
  - Risk factor identification and quantification
  - Automatic user notifications
  - Operational condition tracking and control
  - Event logbook recording
- Architecture: SCADA data source -> Processing (AI AutoEncoder + AI GMM + Statistical criteria + Conditional criteria) -> Web deployment for visualization, notification, and interaction -> Decision making
- **AutoEncoder approach:** Trained on normal operating data; compresses data to latent space then reconstructs. When anomalous data is fed in, reconstruction differs significantly from reality (measured via MSE). Can identify which sensor contributes most to the anomaly using contribution formula
- **GMM (Gaussian Mixture Model):** Uses Expectation-Maximization (EM) algorithm to identify operating conditions as clusters in multi-dimensional sensor space. Experts interpret cluster assignments to identify conditions
- **Condemning criteria:** Statistical (Top 0.5% threshold) and derivative-based (variability); Conditional criteria activate based on combinations of condemning criteria
- Web platform shows tertiary crushing equipment status, active episodes, essential episode statistics, and GMM/AutoEncoder status indicators
- Future vision: Total Condition Monitoring System (TCMS) centralizing multidisciplinary data analyzed by AI, including remaining useful life forecasting, digital twins, autonomous plant operation, and intelligent supply chain

## Relevance to Asset Management
- Represents the cutting edge of AI-applied predictive maintenance in mineral processing
- AutoEncoder + GMM combination provides both anomaly detection and operating regime classification
- Addresses the limitation of traditional monitoring rooms that rely on human analysts for 735+ sensors
- The condemning/conditional criteria framework provides a structured escalation path from detection to action
- TCMS vision aligns with Industry 4.0 goals of centralized, AI-driven asset management

## Keywords
artificial intelligence, anomaly detection, crushers, autoencoder, Gaussian Mixture Model, GMM, SCADA, predictive maintenance, condition monitoring, TCMS, fault diagnosis, machine learning, MSE, mining plant, MAPLA 2024
