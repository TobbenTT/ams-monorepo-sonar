# Robotizacion para la Adquisicion de Datos en Sistema de Correas

## Metadata
- **Authors:** Pablo Araya Benavente, Jose Manuel Ortiz (Kinamics)
- **Session:** S7 MAPLA 2024
- **Topic:** Deployment of autonomous robots for data acquisition on conveyor belt systems in mining, replacing manual inspections with multi-sensor robotic platforms that capture thermal, acoustic, visual, and volumetric data.

## Key Points
- **The problem:** Manual data capture on conveyor systems is risky for personnel, prone to errors, and not scalable. Unplanned conveyor stoppages cost approximately USD 120,000 per hour, or USD 2 million per year per piece of equipment.
- **Kinamics** is a Chilean robotics company developing purpose-built inspection robots for mining environments.
- **Robot family (ARKYTAS):**
  - **ARKYTAS P:** Small terrain inspection robot with temperature, position, image, and sound capture.
  - **ARKYTAS A:** Conceptual amphibious robot for water surface and normal displacement inspection.
  - **ARKYTAS MU:** Larger robot for photogrammetry and hidden surface inspection.
- **System architecture:**
  - Robot navigates semi-autonomously through plant areas of interest, acquiring data.
  - Data (images, raw sensor data) is sent post-acquisition to processing server.
  - Semi-automated data processing feeds into a monitoring system with dashboards, alerts, and recommendations.
  - Machine learning models for video recognition, Remaining Useful Life (RUL) prediction, alarm discrimination, and action recommendation.
- **Data types captured:**
  - **Thermal imaging:** Average, minimum, and maximum temperature per idler, with alerts for high-temperature conditions.
  - **Audio analysis:** Acoustic condition monitoring for failure modes including bearing failure, breakage, blockage, friction, and runaway conditions, compared against a baseline.
  - **Visual analytics:** Combined visual, thermal, and audio for comprehensive fault identification (e.g., detecting abnormal idlers with high temperature and high ultrasound content).
  - **3D volumetry:** Photogrammetric 3D model of conveyor belt for material volume measurement (e.g., accumulated spillage alongside belt).
  - **Autonomous navigation:** 3D environment perception, automatic map construction, route planning, and dynamic obstacle avoidance.
- **Implementation roadmap:**
  - **8-12 weeks (MVP):** 2 representative areas, semi-autonomous navigation with on-site operator, mobile/cloud infrastructure.
  - **6 months (Release 1):** Beta autonomous navigation, automated data pre-processing, automatic asset association, email alerts, initial dashboard.
  - **12 months (Release 2):** Full autonomous navigation in regime, automated processing, mobile notifications, 100% coverage of areas of interest.
  - **24 months (Release 3):** Autonomous navigation operated from CIO (remote operations center), full service in regime.

## Relevance to Asset Management
- Addresses a critical gap in asset management: consistent, scalable, and safe data acquisition for condition monitoring of distributed linear assets (conveyors).
- Multi-modal sensing (thermal + acoustic + visual + volumetric) provides comprehensive condition assessment that surpasses single-technology approaches.
- The RUL prediction and action recommendation capabilities represent a progression toward prescriptive maintenance.
- Removes human exposure to hazardous inspection environments while improving data quality and frequency.
- The phased implementation roadmap from semi-autonomous to fully autonomous is a practical model for mining technology adoption.
- Chilean-developed technology ("Creemos en la Tecnologia Chilena") demonstrates growing Latin American innovation in mining maintenance.

## Keywords
robotics, autonomous inspection, conveyor belt, idler monitoring, thermal imaging, acoustic analysis, photogrammetry, volumetry, Kinamics, ARKYTAS, predictive maintenance, RUL, condition monitoring, data acquisition, mining automation, MAPLA 2024
