# Guided Mode Questions — Create Staffing Plan

## Mode Selection

> "Para crear el plan de dotación necesito datos sobre la organización y las
> necesidades de personal. Selecciona el modo de trabajo:
>
> 1. **Proceso guiado completo** — Te guío paso a paso por toda la información necesaria.
> 2. **Solo contexto inicial** — Recopilo lo mínimo imprescindible y ejecuto con supuestos.
> 3. **Cargar documentos directamente** — Ya tienes los documentos listos."

## GM-1: Input Discovery

| # | Question | Maps to Input | Mode | Acceptable Answers |
|---|----------|--------------|------|-------------------|
| 1 | "¿Ya se completó el diseño organizacional (create-org-design)? Si es así, comparte el organigrama aprobado y el modelo de operaciones/mantenimiento definido." | Organizational Design Output | ESSENTIAL | Org chart + ops/maint model. If not completed, WARN: "El diseño organizacional debe completarse primero para un staffing plan preciso." |
| 2 | "¿Tienes las horas de mantenimiento estimadas del RCM/estrategia de mantenimiento? (horas-hombre por disciplina: mecánica, eléctrica, instrumentación, etc.)" | Maintenance Labor Hours | ESSENTIAL | Hours by discipline. If not available, use industry benchmarks with documented assumption. |
| 3 | "¿Cuál es el patrón de turnos requerido? (ej: 4x4, 7x7, 5x2 diurno, turnos de 8h o 12h, con o sin turno nocturno)" | Shift Pattern | ESSENTIAL | Shift pattern specification. Must include rotation and hours per shift. |
| 4 | "¿Cuál es la normativa laboral aplicable? (ej: Código del Trabajo Chile, DS 132 Minería, convenio colectivo)" | Labor Regulations | ESSENTIAL | List of applicable regulations. Affects maximum hours, mandatory rest, and required roles. |
| 5 | "¿Cuáles son los requisitos de competencias por cargo? ¿Hay certificaciones obligatorias? (ej: soldador certificado, electricista autorizado)" | Competency Requirements | ESSENTIAL | List by role or "por definir". |
| 6 | "¿Hay restricciones de presupuesto para personal? (OPEX máximo, costo por FTE)" | Budget Constraints | OPTIONAL | Budget or "sin restricción definida". |
| 7 | "¿Cuál es la disponibilidad de mano de obra en la zona? ¿Hay dificultad para reclutar perfiles específicos?" | Labor Market Conditions | OPTIONAL | Description of local labor market. |
| 8 | "¿Se requiere plan de ramp-up gradual? Si es así, ¿cuántos meses antes del startup se necesita personal?" | Ramp-up Plan | OPTIONAL | Timeline or "no aplica". |
| 9 | "¿Hay personal existente que será transferido o reubicado?" | Existing Staff Transfer | OPTIONAL | List or "no aplica" (greenfield). |
| 10 | "¿Tienen datos de ausentismo y rotación de operaciones similares?" | Absenteeism / Turnover Data | OPTIONAL | Percentages or "usar benchmarks". Affects crew factor calculation. |
| 11 | "¿Hay roles compartidos entre operaciones y mantenimiento? (ej: operador-mantenedor)" | Shared Roles | OPTIONAL | Yes/No + which roles. |
| 12 | "¿Se requiere personal de supervisión dedicado o supervisores jugadores (que también ejecutan)?" | Supervision Model | OPTIONAL | Dedicated vs playing supervisor. Affects ratios. |

## Dependency Checks

CRITICAL upstream dependencies:
- [ ] `create-org-design` completed? → **REQUIRED** — provides the organizational structure to staff
- [ ] Maintenance strategy / RCM completed? → Strongly recommended — provides maintenance labor hours
- [ ] `create-operations-manual` completed? → Recommended — provides operational procedures and task lists

If `create-org-design` is NOT completed, recommend completing it first. Proceeding without it will produce a staffing plan based on assumptions that may need significant rework.
