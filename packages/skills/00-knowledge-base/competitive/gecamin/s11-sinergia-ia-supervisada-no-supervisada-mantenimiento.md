# Sinergia Perfecta: Como la IA Supervisada y No Supervisada Optimizan el Mantenimiento

## Metadata
- **Authors:** Nicolas Orellana, Fabian Castellano (X-Analytic)
- **Session:** S11 MAPLA 2024
- **Topic:** Combined use of supervised and unsupervised machine learning models for comprehensive equipment health monitoring and failure prediction

## Key Points
- Current maintenance data challenge: multiple data sources (vibrations, alarms, stoppages, oils, maintenance plans, sensors, manual records) need centralization before ML/AI models can be applied
- Big Data scale: a single mining equipment with 100 sensors sampling every 5 minutes generates 10+ million data points per year
- Data centralization in a central repository facilitates cross-analysis and complementary data insights
- Supervised models: require labeled data and objective function; used for predicting specific known failures with days of advance notice
- Unsupervised models: require only data (no labels); used for monitoring overall equipment health state and detecting anomalies
- Supervised model advantages: precision on specific problems, clear performance metrics, efficient decision-making
- Supervised model disadvantages: dependency on labeled data, overfitting risk, computational cost, imbalanced data difficulty
- Unsupervised model advantages: no labeled data required, hidden pattern discovery, flexibility, anomaly detection, lower overfitting risk
- Unsupervised model disadvantages: complex validation, may find irrelevant patterns, less direct for decision-making
- Synergy benefits: complete coverage (known + unknown failures), continuous improvement cycle, cross-validation between models
- Unsupervised models identify new patterns that can be used to label data for improving supervised models
- Future work: additional ML models to interpret anomaly and prediction results; LLM integration for natural language interpretation of results
- Conclusions: combined approach provides global view of equipment state, but requires understanding of equipment utilization cycles and current maintenance state

## Relevance to Asset Management
- Dual AI approach addresses the fundamental limitation of each method: supervised models miss unknown failures, unsupervised models lack specificity
- Continuous improvement loop between supervised and unsupervised models creates a self-improving predictive maintenance system
- LLM integration roadmap points toward natural language interfaces for maintenance intelligence
- Data centralization as a prerequisite reinforces the importance of data infrastructure in asset management
- Practical framework for mining organizations evaluating AI/ML strategies for condition-based maintenance

## Keywords
supervised learning, unsupervised learning, anomaly detection, predictive maintenance, machine learning, X-Analytic, condition monitoring, failure prediction, data centralization, autoencoders, neural networks, LLM, mining equipment health
