# Guided Mode Questions — Create Training Plan

## Mode Selection

> "Para crear el plan de capacitación necesito información sobre el personal y
> las competencias requeridas. Selecciona el modo de trabajo:
>
> 1. **Proceso guiado completo** — Te guío paso a paso por toda la información necesaria.
> 2. **Solo contexto inicial** — Recopilo lo mínimo imprescindible y ejecuto con supuestos.
> 3. **Cargar documentos directamente** — Ya tienes los documentos listos."

## GM-1: Input Discovery

| # | Question | Maps to Input | Mode | Acceptable Answers |
|---|----------|--------------|------|-------------------|
| 1 | "¿Ya se completó el plan de dotación (create-staffing-plan)? Comparte el organigrama con cargos definidos y la cantidad de personas por rol." | Staffing Plan Output | ESSENTIAL | Staffing plan + headcount by role. If not completed, WARN: "Se recomienda completar el staffing plan primero." |
| 2 | "¿Cuáles son los requisitos de competencias por cargo? Lista las competencias técnicas, certificaciones obligatorias, y niveles de experiencia." | Competency Requirements | ESSENTIAL | Competency matrix or list by role. |
| 3 | "¿Están disponibles los manuales de operaciones y mantenimiento? Son la base del contenido técnico de la capacitación." | Operations/Maintenance Manuals | ESSENTIAL | Yes/No + which manuals are available. |
| 4 | "¿Cuál es el timeline de capacitación? ¿Cuántos meses antes del startup debe estar el personal capacitado? ¿Hay fases?" | Training Timeline | ESSENTIAL | Timeline with milestones. |
| 5 | "¿Tienen infraestructura de capacitación? (salas, simuladores, equipos de práctica, plataforma e-learning)" | Training Infrastructure | OPTIONAL | Available facilities or "por implementar". |
| 6 | "¿Hay certificaciones regulatorias obligatorias? (ej: licencia de operador de grúa, certificado de trabajo en altura, primeros auxilios)" | Regulatory Certifications | OPTIONAL | List of mandatory certifications per role. |
| 7 | "¿Cuál es el nivel de experiencia actual del personal? ¿Personal nuevo o experimentado que requiere actualización?" | Current Competency Baseline | OPTIONAL | Description or "personal nuevo (greenfield)". |
| 8 | "¿Tienen acuerdos con proveedores de equipos para capacitación del fabricante (OEM training)?" | OEM Training Agreements | OPTIONAL | Yes/No + which vendors. |
| 9 | "¿Hay restricciones de presupuesto para capacitación?" | Training Budget | OPTIONAL | Amount or "por definir". |
| 10 | "¿Requieren sistema de gestión de competencias (LMS)? ¿Tienen uno existente?" | Learning Management System | OPTIONAL | Yes/No + system name or "por implementar". |
| 11 | "¿Hay requisitos específicos de idioma para materiales de capacitación?" | Language Requirements | OPTIONAL | Languages needed. Default: Spanish. |

## Dependency Checks

CRITICAL upstream dependencies:
- [ ] `create-staffing-plan` completed? → **REQUIRED** — provides roles and headcount to train
- [ ] `create-operations-manual` completed? → Strongly recommended — provides technical content for training
- [ ] `create-maintenance-strategy` completed? → Recommended — identifies maintenance competencies needed

If `create-staffing-plan` is NOT completed, recommend completing it first.
