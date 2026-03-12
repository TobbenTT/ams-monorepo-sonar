# Guided Mode Questions — Create Org Design

## Mode Selection

> "Para diseñar la estructura organizacional necesito entender el contexto operativo.
> Selecciona el modo de trabajo:
>
> 1. **Proceso guiado completo** — Te guío paso a paso por toda la información necesaria.
> 2. **Solo contexto inicial** — Recopilo lo mínimo imprescindible y ejecuto con supuestos.
> 3. **Cargar documentos directamente** — Ya tienes los documentos listos."

## GM-1: Input Discovery

| # | Question | Maps to Input | Mode | Acceptable Answers |
|---|----------|--------------|------|-------------------|
| 1 | "¿Es un proyecto greenfield (nueva operación) o brownfield (operación existente que se modifica/expande)? Describe brevemente." | Project Type & Context | ESSENTIAL | Greenfield/Brownfield + description. Fundamentally changes the org design approach. |
| 2 | "Describe el modelo de operaciones deseado: ¿operación propia, contratista, mixta? ¿Turnos continuos (24/7) o diurnos? ¿Centralizada o descentralizada?" | Operations Model | ESSENTIAL | Must clarify: owner vs contractor, shift pattern, centralization level. |
| 3 | "Describe el modelo de mantenimiento deseado: ¿mantenimiento propio, tercerizado, mixto? ¿Centralizado o por área? ¿Con o sin planificación dedicada?" | Maintenance Model | ESSENTIAL | Must clarify: in-house vs outsourced, centralized vs area-based, planning function. |
| 4 | "¿Cuál es la estrategia de contratistas? ¿Qué funciones se externalizan y cuáles son core del owner?" | Contractor Strategy | ESSENTIAL | List of functions: internal vs external. |
| 5 | "¿Existe una estructura organizacional actual? Si es brownfield, comparte el organigrama actual." | Existing Organization | OPTIONAL | Org chart or description. |
| 6 | "¿Cuál es la cultura organizacional del cliente? (jerárquica vs plana, sindicalizada, resistencia al cambio)" | Organizational Culture | OPTIONAL | Description of cultural factors. |
| 7 | "¿Cuántas personas se estiman necesarias en total? ¿Hay restricciones de headcount?" | Headcount Constraints | OPTIONAL | Number or range, or "por definir". |
| 8 | "¿Tienen benchmarks de organizaciones similares en el mismo sector?" | Industry Benchmarks | OPTIONAL | Data or "no disponible". |
| 9 | "¿Hay requisitos regulatorios sobre roles obligatorios? (ej: Experto en Prevención de Riesgos en Chile)" | Regulatory Role Requirements | OPTIONAL | List of mandatory roles per regulation. |
| 10 | "¿Cuál es el timeline para implementar la organización? ¿Ramp-up gradual o día-1 completo?" | Implementation Timeline | OPTIONAL | Timeline or "por definir". |

## Dependency Checks

- [ ] `create-or-strategy` completed? → Provides strategic context and scope
- [ ] Intent profile available? → Pre-populates organizational preferences

If dependencies are not met, proceed with documented assumptions.
