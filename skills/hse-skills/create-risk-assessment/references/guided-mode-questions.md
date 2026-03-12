# Guided Mode Questions — Create Risk Assessment

## Mode Selection

> "Para crear la evaluación de riesgos necesito información sobre el proceso y
> los criterios de evaluación. Selecciona el modo de trabajo:
>
> 1. **Proceso guiado completo** — Te guío paso a paso por toda la información
>    necesaria, validando cada input antes de continuar. (Recomendado para primeros proyectos)
> 2. **Solo contexto inicial** — Recopilo la información mínima imprescindible
>    y luego ejecuto con supuestos documentados.
> 3. **Cargar documentos directamente** — Ya tienes los documentos listos.
>    Súbelos y los proceso inmediatamente."

Wait for the user's response before proceeding.

## GM-1: Input Discovery

Ask questions ONE AT A TIME, waiting for each response.
For mode 2, ask only ESSENTIAL questions.

| # | Question | Maps to Input | Mode | Acceptable Answers |
|---|----------|--------------|------|-------------------|
| 1 | "Describe el proceso, operación o actividad a evaluar: nombre del área/sistema, alcance (qué incluye y qué excluye), condiciones operativas normales, materiales y sustancias involucradas." | Process / Hazard Description | ESSENTIAL | Text description. Must include: area name, scope, and operating conditions. |
| 2 | "¿Tienen una matriz de riesgos corporativa definida? Si es así, comparte las escalas de probabilidad (1-5) y consecuencia (personas, medio ambiente, activos, reputación). Si no tienen, usaremos la matriz estándar VSC 5×5." | Risk Matrix Definition | ESSENTIAL | Matrix specification OR "usar matriz VSC". If custom: must include probability and consequence scales. |
| 3 | "Proporciona la lista de equipos/activos relevantes del área a evaluar, incluyendo: tag/identificador, descripción, criticidad si está definida." | Equipment / Asset List | ESSENTIAL | List or table of equipment. Must include identifier and description. |
| 4 | "¿Tienen resultados de estudio HAZOP disponibles para esta área? Si es así, ¿de qué fecha?" | HAZOP Study Results | OPTIONAL | Yes/No + date. If yes, will be used for bow-tie analysis. |
| 5 | "¿Tienen P&IDs (Diagramas de Tuberías e Instrumentación) del área? ¿En qué formato?" | P&IDs | OPTIONAL | Yes/No + format (PDF, AutoCAD, etc.). |
| 6 | "¿Tienen historial de incidentes/accidentes en esta área? (últimos 3-5 años, incluyendo casi-accidentes)" | Incident History | OPTIONAL | Data or "no disponible". Key for likelihood calibration. |
| 7 | "¿Cuáles son los requisitos regulatorios específicos de HSE que aplican? (normativa local, permisos ambientales, reglamentos de seguridad industrial)" | Regulatory Requirements | OPTIONAL | List of applicable regulations. |
| 8 | "¿Tienen registro de controles existentes? (barreras de seguridad, procedimientos, EPP, sistemas de detección/protección)" | Existing Controls Register | OPTIONAL | List or "no documentado". Essential for residual risk calculation. |
| 9 | "¿Cuál es el nivel de riesgo aceptable (apetito de riesgo) de la organización? ¿Está documentado?" | Risk Appetite / Tolerance | OPTIONAL | Documented policy or "por definir". |
| 10 | "¿Hay condiciones operativas especiales a considerar? (arranque, parada, emergencia, mantenimiento mayor)" | Special Operating Conditions | OPTIONAL | List of non-routine conditions to assess. |
| 11 | "¿Requieren análisis de riesgo ambiental además de seguridad ocupacional?" | Environmental Risk Scope | OPTIONAL | Yes/No. Affects consequence categories in the matrix. |
| 12 | "¿Hay estudios previos de evaluación de riesgos para esta área que debamos considerar como referencia?" | Previous Risk Assessments | OPTIONAL | Yes/No + date and findings summary. |

## Dependency Checks

Recommended upstream (not mandatory but improves quality):
- [ ] Equipment hierarchy available? → Provides structured equipment list for question 3
- [ ] Process descriptions/P&IDs available? → Improves hazard identification accuracy
- [ ] HAZOP completed? → Enables bow-tie analysis in the risk assessment

If upstream deliverables are not available, the assessment proceeds with documented assumptions.
