# Guided Mode Questions — Create Operations Manual

## Mode Selection

> "Para crear el manual de operaciones necesito documentación técnica del proceso.
> Selecciona el modo de trabajo:
>
> 1. **Proceso guiado completo** — Te guío paso a paso por toda la información necesaria.
> 2. **Solo contexto inicial** — Recopilo lo mínimo imprescindible y ejecuto con supuestos.
> 3. **Cargar documentos directamente** — Ya tienes los documentos listos."

## GM-1: Input Discovery

| # | Question | Maps to Input | Mode | Acceptable Answers |
|---|----------|--------------|------|-------------------|
| 1 | "Define los límites del sistema a documentar: ¿qué áreas/unidades incluye y cuáles excluye? (ej: 'Planta de molienda SAG, desde alimentación hasta clasificación, excluye flotación')" | System Boundaries | ESSENTIAL | Clear scope definition with inclusions and exclusions. |
| 2 | "Proporciona la descripción del proceso: flujo de material, condiciones operativas normales (temperatura, presión, flujo), variables críticas de control." | Process Description | ESSENTIAL | Text or document reference. Must include process flow and key operating parameters. |
| 3 | "¿Tienen P&IDs (Diagramas de Tuberías e Instrumentación) disponibles? ¿En qué formato y revisión?" | P&IDs | ESSENTIAL | Yes/No + format + revision number. Critical for procedimiento accuracy. |
| 4 | "Describe la filosofía de control: ¿manual, semiautomático, automático? ¿Sistema DCS/PLC? ¿Niveles de automatización por área?" | Control Philosophy | ESSENTIAL | Automation level + control system type. |
| 5 | "¿Cuáles son los datasheets de equipos principales disponibles? (capacidades, límites operativos, restricciones del fabricante)" | Equipment Datasheets | ESSENTIAL | Available datasheets or "parcialmente disponible". |
| 6 | "¿Tienen estudio HAZOP o análisis de peligros del área? ¿De qué fecha?" | HAZOP / Hazard Analysis | OPTIONAL | Yes/No + date. Enables safety integration in procedures. |
| 7 | "¿Tienen matriz causa-efecto y lista de interlocks del sistema de control?" | Cause-Effect Matrix / Interlocks | OPTIONAL | Yes/No. Critical for emergency procedures. |
| 8 | "¿Existen procedimientos operativos actuales? (aunque sean borradores o informales)" | Existing Operating Procedures | OPTIONAL | Yes/No + format. Will be used as baseline. |
| 9 | "¿Cuáles son los requisitos ambientales específicos? (emisiones, efluentes, residuos, permisos)" | Environmental Requirements | OPTIONAL | List or "por confirmar con HSE". |
| 10 | "¿Tienen requisitos específicos de calidad del producto? (especificaciones, tolerancias)" | Product Quality Specs | OPTIONAL | Specifications or "no aplica". |
| 11 | "¿Requieren procedimientos en múltiples idiomas? ¿Cuáles?" | Language Requirements | OPTIONAL | Languages needed. Default: Spanish. |
| 12 | "¿Tienen sistema de gestión documental? ¿Cuál es el formato y codificación requerida para procedimientos?" | Document Management System | OPTIONAL | System name + coding convention or "por definir". |
| 13 | "¿Hay condiciones especiales de arranque/parada que requieran procedimientos dedicados?" | Startup/Shutdown Procedures | OPTIONAL | Yes/No + description of special conditions. |

## Dependency Checks

- [ ] Equipment hierarchy available? → Provides structured equipment reference
- [ ] P&IDs available? → **CRITICAL** — manual accuracy depends heavily on P&ID quality
- [ ] HAZOP completed? → Enables safety-integrated operating procedures
- [ ] Control philosophy documented? → Required for DCS/PLC operating sections

If P&IDs are not available, WARN: "Sin P&IDs, el manual será genérico y requerirá revisión significativa cuando estén disponibles."
