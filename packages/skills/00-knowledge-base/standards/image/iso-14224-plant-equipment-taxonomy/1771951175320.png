# Metodología VSC para Creación y Gestión de Skills en Claude Code

**Versión:** 2.0  
**Autor:** ValueStrategy Consulting  
**Fecha:** Febrero 2026  
**Propósito:** Documento de referencia metodológica para estandarizar la creación, documentación, testing y administración de skills en proyectos Claude Code de VSC.  
**Fuentes:** Documentación oficial Anthropic (Skills Best Practices, Skills Explained, Engineering Blog), comunidad GitHub (awesome-claude-skills, claude-code-best-practice), análisis técnicos (Lee Han Chang Deep Dive, HumanLayer Blog, alexop.dev Progressive Disclosure), guías comunitarias (agenticcoding.substack, rosmur.github.io).

---

## 1. Fundamentos: Qué es un Skill y Por Qué Existe

Un skill es un documento de onboarding para Claude Code. Transforma a un agente genéricamente competente en un especialista que ejecuta workflows específicos de tu organización, cliente o dominio. Sin skills, Claude Code puede escribir código y analizar datos, pero no conoce *tu* manera de hacerlo: tu nomenclatura, tus estándares de calidad, tus herramientas preferidas, el orden exacto de tus procesos.

El skill no reemplaza la inteligencia del agente; la canaliza. Es la diferencia entre contratar a un ingeniero brillante y darle un manual de procedimientos versus dejarlo improvisar desde cero cada vez.

### 1.1 Cuándo Crear un Skill vs. Cuándo No

**Crea un skill cuando:**
- Repites un workflow más de 3 veces con las mismas instrucciones.
- El proceso tiene pasos que dependen entre sí en un orden específico.
- La calidad del output depende de conocimiento de dominio que Claude no tiene (estándares internos, plantillas, nomenclatura).
- Varios agentes o miembros del equipo necesitan ejecutar el mismo proceso.
- Necesitas que un MCP server se invoque de una manera muy particular.

**No crees un skill cuando:**
- La tarea es trivial y Claude la resuelve bien sin instrucciones (ej: "lee este PDF").
- El proceso cambia cada vez y no hay un patrón estable.
- Sería más eficiente un cron job, un script Python directo o un workflow de automatización convencional.

---

## 2. Anatomía Completa de un Skill

### 2.1 Estructura de Carpetas

```
skill-name/
├── SKILL.md                    # [OBLIGATORIO] Archivo principal
├── references/                 # Documentación de referencia cargada bajo demanda
│   ├── domain-guide.md         # Guías de dominio, estándares, templates
│   ├── api-reference.md        # Documentación de APIs relevantes
│   └── examples.md             # Ejemplos de inputs/outputs esperados
├── scripts/                    # Código ejecutable invocado por el skill
│   ├── transform.py            # Scripts deterministas y repetibles
│   ├── validate.py             # Validación de outputs
│   └── generate.py             # Generación de entregables
├── assets/                     # Archivos estáticos usados en outputs
│   ├── templates/              # Plantillas (docx, xlsx, pptx base)
│   ├── images/                 # Logos, iconos, imágenes de marca
│   └── fonts/                  # Tipografías si aplica
└── evals/                      # Test cases y benchmarks
    ├── evals.json              # Prompts de prueba con assertions
    └── trigger-eval.json       # Tests de triggering (should/should-not)
```

### 2.2 El Sistema de Tres Niveles de Carga

Este es el concepto más importante para entender cómo Claude Code consume un skill. No se carga todo de golpe; opera por revelación progresiva:

**Nivel 1 — YAML Front Matter (Siempre en contexto, ~100 palabras)**
El agente lee esto en cada sesión. Contiene nombre + descripción. Es el "cartel de la puerta" que le dice a Claude: "¿debería investigar más este skill?"

**Nivel 2 — Cuerpo del SKILL.md (Cargado cuando el skill se activa, <500 líneas ideal)**
Instrucciones procedurales, pasos, reglas, formato de output. Se carga completo solo cuando el Nivel 1 indica que el skill es relevante para la tarea actual.

**Nivel 3 — Recursos vinculados (Cargados bajo demanda, sin límite)**
Scripts, references, assets. Solo se leen cuando el cuerpo del SKILL.md indica explícitamente que son necesarios para el paso actual. Los scripts pueden ejecutarse sin necesidad de cargarlos completos en contexto.

**Implicación práctica:** Cada nivel consume contexto. Diseña el Nivel 1 para máxima precisión de triggering. Diseña el Nivel 2 para que sea autocontenido en las instrucciones core. Diseña el Nivel 3 para que sea modular y solo se acceda a lo necesario.

---

## 3. Bloque 1: YAML Front Matter — El Trigger del Skill

### 3.1 Estructura

```yaml
---
name: nombre-del-skill
description: "Descripción completa con trigger words. Máximo 1000 caracteres."
---
```

### 3.2 El Campo `name`

Escrito en **kebab-case** (minúsculas, separado por guiones). Debe ser descriptivo en 1-4 palabras.

| ❌ Malo | ✅ Bueno | Por qué |
|---------|----------|---------|
| `helper` | `csv-data-pipeline` | Específico sobre qué hace |
| `my-skill` | `sentry-code-review` | Indica servicio + acción |
| `stuff` | `vsc-proposal-generator` | Identifica organización + función |
| `v2` | `figma-design-handoff` | Describe el workflow completo |

### 3.3 El Campo `description` — Cómo Escribir un Trigger Perfecto

Este es el campo más crítico de todo el skill. Es lo único que Claude Code lee permanentemente. Debe responder dos preguntas:

1. **¿Qué hace este skill?** (primera oración)
2. **¿Cuándo debe activarse?** (trigger words + eventos)

**Fórmula:**

```
[Acción concreta] + [dominio/contexto]. Use this skill when [trigger phrases]. 
Triggers include: [lista de palabras clave, acciones del usuario, y eventos].
Produces: [entregables específicos].
```

**Ejemplo real aplicado a VSC:**

```yaml
description: "End-to-end generation of technical-economic proposals for 
ValueStrategy Consulting (VSC). Produces: (1) .docx proposal document, 
(2) .xlsx cost estimate workbook, and (3) .pptx presentation deck. 
Triggers include: 'create a proposal', 'generate a quote', 'prepare a bid', 
'VSC proposal', 'propuesta VSC', 'cotización', or any request involving 
consulting services for Operational Readiness, Asset Management, Maintenance 
Engineering, or Industrial Digital Transformation."
```

### 3.4 Tipos de Triggers

Los triggers no son solo palabras textuales. Hay tres categorías:

**Triggers textuales:** Palabras o frases que el usuario dice directamente.
```
"create a proposal", "generate a quote", "propuesta VSC"
```

**Triggers semánticos:** Conceptos que Claude puede inferir como relacionados.
```
"necesito cotizar un proyecto de mantenimiento" → se activa por proximidad semántica con "proposal" + "maintenance"
```

**Triggers basados en eventos:** Acciones del usuario que disparan el skill.
```
"cuando el usuario suba un archivo CSV", "cuando se mencione un archivo .fig"
```

### 3.5 Anti-Patrones de Descripción

| ❌ Mala descripción | Problema | ✅ Versión corregida |
|---------------------|----------|---------------------|
| "Helps with projects" | Genérica, cualquier skill podría matchear | "Manages linear project workflows including sprint planning and task creation. Use when user mentions sprint, linear tasks, or asks to create tickets" |
| "Creates sophisticated multi-page documentation systems" | Sin triggers, buzzwordy | "Generates developer handoff documents from Figma designs. Use when user uploads .fig files or asks for design-to-code specs" |
| "Implements the project entity model with hierarchical relationships" | Lenguaje de consultor, no actionable | "End-to-end customer onboarding for PayFlow. Use when user asks to set up new customer accounts, payment flows, or subscription management" |
| "Works with Sentry to look at errors" | Vago, sin especificar acción | "Automatically analyzes and fixes detected bugs in GitHub PRs using Sentry error monitoring. Use when user mentions error logs, Sentry alerts, or bug triage" |

### 3.6 Tendencia al Under-Triggering

Anthropic documenta que Claude tiende a **no** activar skills cuando debería. Para contrarrestarlo, la descripción debe ser ligeramente "pushy": incluir variantes de la frase, sinónimos, y escenarios donde el skill aplica aunque el usuario no lo mencione explícitamente.

```yaml
# Ejemplo pushy (correcto)
description: "...Use this skill whenever the user mentions dashboards, 
data visualization, internal metrics, or wants to display any kind of 
company data, even if they don't explicitly ask for a 'dashboard'."
```

---

## 4. Bloque 2: Cuerpo del SKILL.md — Las Instrucciones Core

### 4.1 Estructura Recomendada

```markdown
# Nombre del Skill

Resumen en 2-3 líneas de qué hace, para quién, y cuál es el output.

## 1. Rol y Persona (opcional pero recomendado)
Define quién "es" el agente cuando ejecuta este skill.

## 2. Workflow de Entrada / Intake
Qué información necesita recopilar antes de empezar.

## 3. Flujo de Ejecución
Pasos secuenciales, condicionales, o iterativos.

## 4. Generación de Entregables
Qué produce y cómo (con referencia a archivos en references/).

## 5. Reglas y Restricciones
Lo que nunca debe hacer, límites de scope.

## 6. Validación / Quality Check
Checklist de verificación antes de entregar.

## 7. Punteros a Recursos
Tabla de qué archivos leer y cuándo.
```

### 4.2 Sección de Rol y Persona

Define la identidad del agente cuando opera bajo este skill. No es cosmético; cambia fundamentalmente cómo aborda las decisiones.

```markdown
## 1. Rol y Persona

Eres **VSC Proposal Architect** — consultor senior de ValueStrategy Consulting 
con expertise en Operational Readiness, Asset Management y Maintenance Engineering.

**Tu mandato:** Transformar necesidades de clientes (RFQs, transcripciones, emails) 
en propuestas técnico-económicas que ganen contratos.

**Tono:** Ejecutivo, directo, basado en evidencia. Primera persona plural 
("nosotros", "nuestro equipo", "VSC"). Nunca voz pasiva corporativa.
```

### 4.3 Sección de Intake / Preguntas Obligatorias

Antes de que el agente genere cualquier contenido, necesita información. Estructura las preguntas en fases con campos obligatorios marcados claramente.

```markdown
## 2. Intake — Preguntas Obligatorias

No generar contenido hasta que todos los campos con (*) estén respondidos.

### Fase 0: Pre-Calificación
| Pregunta | Opciones |
|----------|----------|
| Q0.1* IDIOMA | English | Spanish | Portuguese |
| Q0.2* CLIENTE | Nombre de empresa y proyecto |
| Q0.3* INPUT | Subir RFQ/RFP, pegar transcripción, o describir el problema |

### Fase 1: Definición de Alcance
| Pregunta | Opciones |
|----------|----------|
| Q1.1* DOMINIO | OR | Asset Management | Digital Transformation | Combined |
| Q1.2* ALCANCE | Descripción detallada o WBS si disponible |
```

### 4.4 Sección de Flujo de Ejecución

Aquí es donde defines los pasos. Usa el formato imperativo. Sé explícito en qué sucede en cada paso, pero explica el **por qué** detrás de cada decisión para que el agente pueda adaptarse inteligentemente.

```markdown
## 3. Flujo de Ejecución

┌──────────────────────────────────────────────┐
│  PASO 1: INTAKE — Recopilar preguntas        │
├──────────────────────────────────────────────┤
│  PASO 2: ANÁLISIS DE ALCANCE                 │
│  - Parsear input del cliente                 │
│  - Identificar dominio(s) de servicio        │
│  - Draftar WBS                               │
│  - Presentar WBS al usuario para aprobación  │
├──────────────────────────────────────────────┤
│  PASO 3: GENERACIÓN DE DOCUMENTOS            │
│  - Leer references/docx-template.md          │
│  - Generar .docx, .xlsx, .pptx               │
├──────────────────────────────────────────────┤
│  PASO 4: VALIDACIÓN                          │
│  - Ejecutar checklist de calidad             │
│  - Verificar consistencia numérica           │
│  - Presentar paquete final                   │
└──────────────────────────────────────────────┘
```

### 4.5 Los Cinco Patrones de Diseño de Ejecución

Dependiendo de la naturaleza del workflow, el flujo de ejecución adopta uno de cinco patrones:

**Patrón 1 — Secuencial (más común)**
Paso 1 → Paso 2 → Paso 3 → Paso 4. Si un paso falla, rollback al anterior. Cada paso depende del output del anterior.
```
Ejemplo: Crear cuenta → Configurar pago → Crear suscripción → Email de bienvenida
```

**Patrón 2 — Coordinación Multi-MCP**
Orquesta múltiples MCP servers en fases. No se avanza de fase hasta completar los prerequisitos.
```
Ejemplo: Figma MCP (diseño) → Drive MCP (carpeta) → Linear MCP (tickets) → Slack MCP (notificación)
```

**Patrón 3 — Refinamiento Iterativo**
Genera → Audita → Refina → Repite. El output pasa por múltiples evoluciones hasta alcanzar el estándar.
```
Ejemplo: Generar thumbnails → Evaluar con agentes → Refinar → Seleccionar los mejores 5 de 15
```

**Patrón 4 — Ruteo Condicional (tipo N8N)**
El mismo input se procesa por diferentes ramas según su tipo o condición.
```
Ejemplo: Archivo subido → ¿Es código? → GitHub MCP | ¿Es doc? → Notion MCP | ¿Es data? → Supabase MCP
```

**Patrón 5 — Inteligencia de Dominio Embebida (Enterprise)**
Reglas de negocio, listas de sanciones, verificación jurisdiccional, assessment de riesgo. El skill contiene la lógica de decisión específica de la organización.
```
Ejemplo: SOP de microservicios AWS → qué es editable, cómo se edita, qué requiere aprobación
```

### 4.6 Anti-Patrones de Instrucciones

| ❌ Malo | ✅ Bueno |
|---------|----------|
| "Ayuda al usuario con sus datos. Valídalos y asegúrate de que todo se vea bien." | **Paso 1: Inspeccionar datos.** Leer el archivo, identificar columnas, tipos de dato, y filas con valores nulos o fuera de rango. |
| "Procesa los datos apropiadamente." | **Paso 2: Identificar problemas.** Generar tabla columna × problema (nulos, duplicados, outliers, tipo incorrecto). Presentar al usuario. |
| "Maneja cualquier error que surja." | **Paso 3: Aplicar correcciones.** Para cada problema identificado, aplicar la corrección del rubric. Si es ambiguo, preguntar al usuario. |
| "Asegúrate de revisar errores y arreglarlos si es posible." | **Paso 4: Exportar.** Guardar como `{nombre_original}_cleaned.csv`. Generar resumen de cambios realizados. |

**Principio clave:** Prefiere explicar el "por qué" sobre el uso excesivo de MUST/ALWAYS/NEVER en mayúsculas. Claude es inteligente; si entiende la razón, se adapta mejor que si simplemente sigue reglas rígidas.

### 4.7 Tabla de Punteros a Recursos

Cada SKILL.md debe incluir una tabla clara que indique qué archivos auxiliares existen y cuándo leerlos:

```markdown
## 7. Recursos Vinculados

| Recurso | Ruta | Cuándo Leer |
|---------|------|-------------|
| Template DOCX | `references/docx-template.md` | Antes de generar el .docx |
| Template XLSX | `references/xlsx-template.md` | Antes de generar el .xlsx |
| Template PPTX | `references/pptx-template.md` | Antes de generar el .pptx |
| Tabla de Tarifas | `references/rates-table.md` | Durante estimación de costos |
| Script de Validación | `scripts/validate.py` | Después de generar cada documento |
```

---

## 5. Bloque 3: References — La Capa de Conocimiento de Dominio

### 5.1 Qué Va en References

Los archivos en `references/` son documentación que el agente carga bajo demanda (Nivel 3). Tipos comunes:

- **Templates de documento:** Especificaciones detalladas de cómo debe verse cada entregable (estructura de secciones, estilos, formatos).
- **Guías de dominio:** Estándares de industria, metodologías, frameworks de referencia.
- **API references:** Documentación de herramientas y servicios que el skill utiliza.
- **Ejemplos:** Inputs y outputs de referencia para que el agente calibre expectativas.

### 5.2 Reglas para References

- Si un archivo de referencia supera las 300 líneas, incluir una tabla de contenidos al inicio.
- Organizar por dominio/variante cuando el skill soporta múltiples frameworks:

```
cloud-deploy/
├── SKILL.md
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

- El SKILL.md debe indicar **explícitamente** cuándo y cuál archivo de referencia leer. Claude solo lee lo relevante a la tarea actual.

---

## 6. Bloque 4: Scripts — La Capa de Ejecución Determinista

### 6.1 Qué Va en Scripts

Todo código que el skill necesita ejecutar de manera determinista y repetible. Los scripts pueden ejecutarse sin necesidad de cargar su contenido completo en el contexto; Claude simplemente los invoca.

Tipos comunes:

- **Scripts de generación:** Crean archivos de output (docx, xlsx, pptx, PDF).
- **Scripts de transformación:** Procesan datos (limpiar CSV, convertir formatos).
- **Scripts de validación:** Verifican que el output cumple estándares.
- **Scripts de utilidad:** Funciones auxiliares reutilizables.

### 6.2 Patrón de Scripts Recurrentes

Cuando durante el testing observas que el agente independientemente escribe el mismo helper script en múltiples test cases, esa es una señal clara de que el script debe bundlearse en la carpeta `scripts/`. Escribirlo una vez y referenciarlo ahorra tokens y reduce variabilidad.

---

## 7. Bloque 5: Assets — Archivos Estáticos

### 7.1 Qué Va en Assets

Archivos que no son código ni documentación sino recursos estáticos que se incorporan a los outputs:

- **Templates base:** Archivos .docx/.pptx/.xlsx con formato pre-configurado que se usan como punto de partida.
- **Imágenes:** Logos de empresa, iconos, gráficos de marca.
- **Fuentes:** Tipografías corporativas si son necesarias.
- **Configuraciones:** Archivos de configuración (paletas de color, estilo CSS).

---

## 8. Bloque 6: Evals — Testing y Benchmarking

### 8.1 Estructura de Evals

```
evals/
├── evals.json              # Test cases funcionales
└── trigger-eval.json       # Tests de triggering
```

### 8.2 Los Tres Tests Fundamentales

**Test 1: Triggering — ¿Se activa cuando debe?**
Abre una sesión de terminal **nueva** (sin contexto previo). Prueba con prompts que deberían activar el skill y prompts que no deberían. El objetivo es que el skill se active con alta precisión.

```json
[
  {"query": "Necesito preparar una cotización para OCP sobre asset management, incluye el WBS y estimación de costos", "should_trigger": true},
  {"query": "Ayúdame a escribir un email de seguimiento al cliente", "should_trigger": false},
  {"query": "crea una propuesta para el proyecto de mantenimiento de OFAS con modelo T&M", "should_trigger": true},
  {"query": "Haz un dashboard de métricas de ventas en React", "should_trigger": false}
]
```

Los queries deben ser realistas: con contexto personal, nombres de empresas reales, errores ortográficos, lenguaje casual. Los mejores tests de should-not-trigger son los "near misses" — queries que comparten keywords pero necesitan otro skill.

**Test 2: Funcional — ¿El output es correcto?**
Ejecuta el skill 4-5 veces con el mismo prompt. ¿El output es consistente en formato y calidad? ¿Se obtiene el entregable esperado?

```json
{
  "skill_name": "vsc-proposal-generator",
  "evals": [
    {
      "id": 1,
      "prompt": "Crea una propuesta FULL en español para OCP, servicio de Asset Management, modelo T&M, 6 meses, equipo remoto desde España y Chile",
      "expected_output": "3 archivos: .docx con propuesta completa, .xlsx con estimación, .pptx con deck ejecutivo",
      "assertions": [
        {"text": "El .docx contiene todas las secciones obligatorias", "type": "structural"},
        {"text": "Los totales del Excel coinciden con los del documento Word", "type": "numerical"},
        {"text": "La presentación incluye slide de inversión con cifra correcta", "type": "content"}
      ]
    }
  ]
}
```

**Test 3: Benchmark — ¿El skill añade valor?**
Compara el output con skill vs. sin skill. Si el skill no mejora significativamente la calidad o consistencia, reconsidera si vale la pena mantenerlo.

---

## 9. Gestión Documental de Skills

### 9.1 Registro de Skills (Skill Registry)

Mantén un documento centralizado que catalogue todos los skills activos del proyecto o la organización:

```markdown
# Registro de Skills VSC

| ID | Nombre | Versión | Agente Destinatario | Entregable Final | Estado | Última Actualización |
|----|--------|---------|---------------------|------------------|--------|---------------------|
| SK-001 | create-vsc-proposals | 1.2 | Claude Code (CEO/BD) | .docx + .xlsx + .pptx | Producción | 2026-02-15 |
| SK-002 | or-system-agent | 0.8 | OR Agent (Operations) | JSON + informe .md | Beta | 2026-02-20 |
| SK-003 | sentry-code-review | 1.0 | Claude Code (Dev Team) | PR comments + fix commits | Producción | 2026-01-30 |
| SK-004 | client-intake-form | 0.3 | Claude Code (Consultant) | Airtable record + .md brief | Draft | 2026-02-22 |
```

### 9.2 Ciclo de Vida de un Skill

```
Draft → Beta → Producción → Global → Archivado

Draft:      Skill en desarrollo. Solo el creador lo usa.
Beta:       Pasó tests básicos de triggering y funcional. 
            Se prueba en proyectos reales con supervisión.
Producción: Battle-tested por al menos 1 mes.
            Resultados consistentes y predecibles.
Global:     Commiteado al repo. Disponible para todos los 
            agentes y miembros del equipo.
Archivado:  El workflow que servía ya no existe o fue 
            reemplazado por otro skill.
```

**Regla de oro:** No promuevas un skill a Global hasta que haya sobrevivido al menos un mes de uso real en producción.

### 9.3 Versionado

Cada skill debe seguir un versionado semántico simplificado:

- **Major (1.0 → 2.0):** Cambio fundamental en el workflow, nuevos entregables, o restructuración completa del skill.
- **Minor (1.0 → 1.1):** Mejoras en instrucciones, nuevos trigger words, optimización de scripts.
- **Patch (1.1 → 1.1.1):** Corrección de bugs en scripts, typos en instrucciones.

Incluir un changelog en el SKILL.md o en un archivo `CHANGELOG.md` separado:

```markdown
## Changelog

### v1.2 (2026-02-15)
- Añadido soporte para propuestas en portugués
- Optimizado script de generación de Excel para manejar más de 50 líneas de estimación
- Mejorados trigger words: añadido "cotización", "bid", "oferta"

### v1.1 (2026-01-20)
- Corregida inconsistencia numérica entre Excel y Word en propuestas con descuento
- Añadida sección de Digital Solutions al template DOCX
```

### 9.4 Acceso y Permisos por YAML

El YAML front matter no solo controla el triggering; también documenta implícitamente quién debería usar cada skill. La organización de skills en carpetas refuerza esto:

```
skills/
├── public/          # Skills disponibles para todos los agentes
│   ├── docx/
│   ├── xlsx/
│   └── pdf/
├── user/            # Skills personales del usuario
│   └── create-vsc-proposals/
├── project/         # Skills específicos de un proyecto
│   ├── ocp-asset-mgmt/
│   └── ofas-diagnostic/
└── team/            # Skills compartidos por el equipo
    ├── code-review-standards/
    └── client-communication/
```

**Convención para scoping:**
- **public/**: Utilidades genéricas. Cualquier agente en cualquier proyecto.
- **user/**: Skills personales. Solo el usuario propietario.
- **project/**: Específicos del proyecto. Solo agentes trabajando en ese proyecto.
- **team/**: Compartidos entre todos los miembros del equipo VSC.

---

## 10. Asignación de Skills a Agentes

### 10.1 Matriz Agente × Skill

En un sistema multi-agente como el OR System de VSC, cada agente tiene un dominio y necesita skills específicos:

```markdown
| Agente | Dominio | Skills Asignados | Entregable Principal |
|--------|---------|------------------|---------------------|
| Operations Agent | Procesos operativos | or-operations-workflow, process-mapping | Manuales de operación, SOPs, flowcharts |
| Maintenance Agent | Mantenimiento de activos | maintenance-strategy, rcm-analysis | Planes de mantenimiento, FMECA, matrices de criticidad |
| HR Agent | Capital humano | or-staffing-plan, competency-matrix | Organigramas, perfiles de cargo, planes de capacitación |
| HSE Agent | Seguridad y medio ambiente | hse-risk-assessment, permit-workflow | Matrices de riesgo, procedimientos de permisos |
| Finance Agent | Presupuesto y costos | capex-opex-estimation, budget-tracking | Presupuestos, análisis de costos, cashflow |
| Project Agent | Coordinación general | project-master-schedule, milestone-tracking | Cronogramas, informes de avance, dashboards |
| Procurement Agent | Adquisiciones | procurement-workflow, vendor-evaluation | RFQs, evaluaciones de proveedores, contratos |
| Legal/Contracts Agent | Contratos y legal | contract-review, nda-generation | Contratos, NDAs, términos de referencia |
```

### 10.2 Skills Compartidos vs. Exclusivos

- **Compartidos:** Skills que múltiples agentes necesitan (ej: `document-formatting`, `brand-compliance`). Se colocan en `public/` o `team/`.
- **Exclusivos:** Skills que solo un agente usa (ej: `rcm-analysis` solo lo usa Maintenance Agent). Se documentan en la configuración del agente y pueden vivir en `project/`.

### 10.3 Documentar el Agente Destinatario

Incluir en el SKILL.md una sección o nota que indique claramente para qué agente está diseñado:

```markdown
---
name: maintenance-strategy
description: "..."
---

# Maintenance Strategy Skill

**Agente destinatario:** Maintenance Agent (OR System)  
**Entregable final:** Plan de mantenimiento preventivo (.docx) + Matriz de criticidad (.xlsx)  
**Dependencias:** Requiere output previo de Operations Agent (lista de equipos y taxonomía)
```

---

## 11. Entregables por Skill — Tabla de Referencia

Cada skill debe documentar explícitamente qué produce. Esta tabla sirve como contrato entre el skill y el usuario/agente consumidor:

```markdown
## Entregables

| Entregable | Formato | Nombrado | Descripción |
|------------|---------|----------|-------------|
| Propuesta técnica | .docx | {Client}_{Service}_Proposal_Rev{N}.docx | Documento completo con scope, team, schedule, inversión |
| Estimación de costos | .xlsx | {Client}_{Service}_Estimate_Rev{N}.xlsx | Workbook con horas, tarifas, reembolsables, resumen |
| Deck ejecutivo | .pptx | {Client}_{Service}_Presentation_Rev{N}.pptx | 10-15 slides con key messages para C-suite |
| Checklist de calidad | .md | qa_checklist.md | Verificación interna (no se entrega al cliente) |
```

**Convenciones de nombrado:**
- Usar variables dinámicas entre llaves: `{Client}`, `{Service}`, `{Date}`, `{Rev}`.
- Definir abreviaciones estándar: "OCP" para Office Chérifien des Phosphates, "OR" para Operational Readiness.
- Incluir número de revisión siempre.

---

## 12. Skills y MCP Servers — Orquestación

### 12.1 Cuándo Combinar Skills con MCPs

Un MCP server proporciona **herramientas** (las manos del cocinero). Un skill proporciona **procedimiento** (la receta). Combínalos cuando:

- Necesitas que un MCP se invoque en un orden específico.
- Quieres limitar qué tools del MCP se usan (para preservar contexto).
- El workflow requiere coordinar múltiples MCPs en secuencia.

### 12.2 Cómo Documentar la Orquestación MCP en un Skill

```markdown
## MCP Server: Supabase

Cuando este skill invoca el MCP de Supabase, usar exclusivamente estas herramientas:
- `create_project` — Para inicializar nuevo proyecto
- `list_extensions` — Para verificar extensiones disponibles
- `get_logs` — Para diagnosticar errores post-deployment

NO usar: `delete_project`, `reset_database` (requieren aprobación manual).

### Orden de invocación
1. `list_extensions` → verificar que pgvector está disponible
2. `create_project` → con configuración de references/supabase-config.md
3. `get_logs` → verificar deployment exitoso
```

### 12.3 Scoping de MCP Tools

En la sección de MCP del skill, documentar explícitamente qué tools importan y cuáles ignorar. Esto ayuda a preservar la context window y reduce errores por invocación de tools irrelevantes.

---

## 13. Checklist Maestro para Crear un Skill Nuevo

Antes de dar por terminado un skill, verifica:

### Estructura
- [ ] La carpeta sigue la convención `skill-name/` con SKILL.md en la raíz
- [ ] YAML front matter tiene `name` en kebab-case y `description` < 1000 caracteres
- [ ] La descripción responde: ¿qué hace? + ¿cuándo se activa? + trigger words
- [ ] El cuerpo del SKILL.md tiene < 500 líneas
- [ ] Cada archivo en `references/` de más de 300 líneas tiene tabla de contenidos
- [ ] Los scripts en `scripts/` son ejecutables y tienen manejo de errores

### Contenido
- [ ] El skill define un rol/persona claro (si aplica)
- [ ] Hay un workflow de intake con preguntas obligatorias marcadas
- [ ] El flujo de ejecución sigue uno de los 5 patrones documentados
- [ ] Las instrucciones explican el "por qué", no solo el "qué"
- [ ] Los entregables están documentados con formato, nombrado y descripción
- [ ] La tabla de punteros a recursos indica cuándo leer cada archivo

### Testing
- [ ] Existe `trigger-eval.json` con al menos 8-10 should-trigger y 8-10 should-not-trigger
- [ ] Los should-not-trigger son "near misses" genuinos, no queries obviamente irrelevantes
- [ ] Se ejecutó test funcional al menos 4-5 veces con resultados consistentes
- [ ] Se comparó output con skill vs. sin skill (benchmark básico)

### Gobernanza
- [ ] El skill está registrado en el Registro de Skills
- [ ] El agente destinatario está documentado
- [ ] El estado del ciclo de vida está definido (Draft/Beta/Producción/Global)
- [ ] El versionado está iniciado (v0.1 mínimo)
- [ ] La carpeta está en el directorio correcto (public/user/project/team)

---

## 14. Template Rápido — Copiar y Adaptar

```markdown
---
name: [kebab-case-name]
description: "[Acción concreta] para [dominio/contexto]. Produces: [entregables]. 
Use this skill when [triggers textuales]. Triggers include: [lista de keywords, 
eventos, y frases del usuario que deberían activar este skill]."
---

# [Nombre Descriptivo del Skill]

**Agente destinatario:** [Nombre del agente o "Cualquiera"]  
**Entregable final:** [Lista de archivos con formato]  
**Dependencias:** [Otros skills, MCPs, o inputs requeridos]

## 1. Rol y Persona

Eres **[nombre del rol]** — [descripción breve del expertise y mandato].

**Tono:** [Ejecutivo/Técnico/Casual]. [Persona gramatical y estilo].

---

## 2. Intake — Información Requerida

No generar contenido hasta completar todos los campos marcados con (*).

| Pregunta | Opciones/Notas |
|----------|---------------|
| Q1* [CAMPO] | [Opciones o formato esperado] |
| Q2* [CAMPO] | [Opciones o formato esperado] |
| Q3 [CAMPO] | [Opcional — opciones o formato] |

---

## 3. Flujo de Ejecución

### Paso 1: [Nombre del Paso]
[Instrucciones detalladas con el "por qué" detrás de cada decisión]

### Paso 2: [Nombre del Paso]
[Instrucciones. Incluir condicionales si aplica]

### Paso 3: [Nombre del Paso]
[Instrucciones. Referenciar scripts si es necesario]

---

## 4. Generación de Entregables

| Documento | Archivo de Referencia | Herramienta |
|-----------|-----------------------|-------------|
| [Entregable 1] | `references/[archivo].md` | [tool/lib] |
| [Entregable 2] | `references/[archivo].md` | [tool/lib] |

### Convención de Nombrado
```
[Código]_[Servicio]_[Tipo]_Rev[N].[ext]
```

---

## 5. Validación

Antes de entregar, verificar:
- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]
- [ ] [Consistencia numérica entre documentos si aplica]

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuándo Leer |
|---------|------|-------------|
| [Nombre] | `references/[archivo].md` | [Condición] |
| [Nombre] | `scripts/[archivo].py` | [Condición] |
| [Nombre] | `assets/[archivo]` | [Condición] |

---

## Changelog

### v0.1 ([fecha])
- Versión inicial del skill
```

---

## 16. La Decisión Crítica: Metodología Inline vs. Referencia Externa

Este es el hallazgo más importante de la investigación en la comunidad y la documentación oficial de Anthropic. La decisión de dónde colocar el conocimiento metodológico — dentro del SKILL.md o en archivos externos — afecta directamente el rendimiento, el consumo de tokens y la fiabilidad del skill.

### 16.1 El Marco de Decisión: Tres Zonas

La documentación oficial de Anthropic y la comunidad convergen en un modelo de tres zonas basado en **frecuencia de uso** y **tamaño del contenido**:

**Zona 1 — INLINE en SKILL.md (siempre en contexto cuando el skill se activa)**
- Instrucciones procedurales core (pasos del workflow)
- Reglas que aplican en CADA ejecución del skill
- Definición de entregables y formato de output
- Restricciones y límites de scope
- Checklist de validación que se ejecuta siempre
- **Límite recomendado:** < 500 líneas totales para el SKILL.md

**Zona 2 — REFERENCIA EXTERNA en `references/` (cargada bajo demanda)**
- Conocimiento de dominio que solo aplica en ciertos paths del workflow
- Templates detallados de documentos
- Guías de estilo y brand guidelines
- Documentación de APIs
- Tablas de datos extensas (tarifas, catálogos, matrices)
- Ejemplos completos de inputs/outputs
- **Regla clave:** No consume tokens hasta que Claude lo lee explícitamente

**Zona 3 — SCRIPTS en `scripts/` (ejecutados sin cargar en contexto)**
- Operaciones deterministas (validación, generación, transformación)
- Tareas que se repiten idénticamente cada vez
- Lógica que es más fiable como código que como instrucción en lenguaje natural
- **Regla clave:** Solo el output del script consume tokens, no el código fuente

### 16.2 Árbol de Decisión para Colocar Contenido Metodológico

```
¿Este contenido se necesita en CADA ejecución del skill?
├── SÍ → ¿Son menos de 50 líneas?
│   ├── SÍ → INLINE en SKILL.md
│   └── NO → ¿Puede ejecutarse como script?
│       ├── SÍ → scripts/ (ejecutar, no leer)
│       └── NO → INLINE pero considerar resumir y apuntar a references/
└── NO → ¿Es contenido que solo aplica en ciertos escenarios?
    ├── SÍ → references/ con puntero explícito en SKILL.md
    └── NO → ¿Es un template o ejemplo?
        ├── SÍ → references/ (Claude lo lee solo cuando genera ese output)
        └── NO → Evaluar si realmente pertenece a este skill
```

### 16.3 Ejemplo Práctico: Skill de Propuestas VSC

Veamos cómo se distribuye el contenido del skill `create-vsc-proposals` según este marco:

| Contenido | Zona | Ubicación | Razón |
|-----------|------|-----------|-------|
| Flujo de ejecución (6 pasos) | 1 | SKILL.md | Se necesita siempre, guía el workflow |
| Preguntas de intake | 1 | SKILL.md | Se ejecuta siempre al inicio |
| Checklist de brand compliance | 1 | SKILL.md | Se valida en cada propuesta |
| Tabla de tarifas estándar | 1 | SKILL.md (resumida) + references/ (completa) | Resumen siempre visible, detalle bajo demanda |
| Template de estructura del .docx | 2 | references/docx-template.md | Solo se lee cuando genera el Word |
| Template de estructura del .pptx | 2 | references/pptx-template.md | Solo se lee cuando genera el PowerPoint |
| Template de estructura del .xlsx | 2 | references/xlsx-template.md | Solo se lee cuando genera el Excel |
| Script de validación numérica | 3 | scripts/validate.py | Operación determinista, no necesita contexto |

### 16.4 Anti-Patrón: El SKILL.md Monolítico

La comunidad (HumanLayer Blog, alexop.dev, rosmur best practices) identifica un error común: meter toda la metodología dentro del SKILL.md. Esto causa:

1. **Degradación de rendimiento.** Los LLMs siguen ~150-200 instrucciones con consistencia razonable. Un SKILL.md de 800 líneas con 100+ instrucciones degrada la calidad del output.
2. **Contexto desperdiciado.** Si el SKILL.md tiene 400 líneas de templates de Excel pero estás generando un Word, esas 400 líneas consumen contexto sin aportar valor.
3. **Menor fiabilidad de triggering.** Un SKILL.md enorme toma más tokens para cargar, lo que compite con el presupuesto de skills. Claude tiene un budget dinámico del 2% de la context window para descripciones de skills.

**Regla de la comunidad:** Si tu SKILL.md supera las 500 líneas, necesitas refactorizar hacia `references/`.

### 16.5 Anti-Patrón: Referencias Invisibles

El error opuesto: mover todo a `references/` pero no decirle a Claude cuándo leerlos. Según la documentación oficial de Anthropic y la investigación de Vercel, los skills no siempre se activan cuando deberían — en un estudio, los skills no se invocaron en el 56% de los test cases. Si los punteros a referencias son vagos, el problema se amplifica.

**Solución:** Cada referencia necesita un puntero explícito y prominente en el SKILL.md:

```markdown
## 4. Generación de Entregables

### 4.1 Documento Word (.docx)
**ANTES de generar el .docx, leer completo: `references/docx-template.md`**
Este archivo contiene la estructura exacta de secciones, estilos, y formato de cada página.
```

Nótese: no es suficiente con listar la referencia en una tabla al final. El puntero debe estar **en el paso exacto del workflow** donde se necesita, con instrucción directa ("leer completo") y contexto de por qué ("contiene la estructura exacta").

### 16.6 Patrón Avanzado: Leer vs. Ejecutar

La documentación oficial de Anthropic hace una distinción crítica para scripts:

- **Ejecutar (más común y recomendado):** "Run `validate.py` to check numerical consistency"
- **Leer como referencia (para lógica compleja):** "See `analyze_form.py` for the field extraction algorithm"

Para la mayoría de scripts utilitarios, la ejecución es preferida porque es más fiable y eficiente — solo el output consume tokens. Leer un script solo tiene sentido cuando Claude necesita entender la lógica para tomar decisiones, no simplemente aplicarla.

---

## 17. Tabla Maestra de Skills y Documentos Asociados

### 17.1 Por Qué Necesitas una Tabla Maestra

La comunidad de Claude Code converge en un patrón: a medida que creces en número de skills, la falta de un registro centralizado causa problemas de:
- **Duplicación**: Dos skills que hacen lo mismo parcialmente
- **Orfandad**: Referencias a documentos que ya no existen
- **Conflicto**: Skills con trigger words que se solapan
- **Desactualización**: Skills que apuntan a versiones viejas de metodologías

### 17.2 Estructura de la Tabla Maestra

```markdown
# Tabla Maestra de Skills VSC
Última actualización: YYYY-MM-DD

## Índice de Skills

| ID | Skill Name | Versión | Estado | Agente | Scope |
|----|-----------|---------|--------|--------|-------|
| SK-001 | create-vsc-proposals | 1.2 | Producción | CEO/BD | user/ |
| SK-002 | or-operations-workflow | 0.8 | Beta | Operations Agent | project/ |
| SK-003 | maintenance-strategy | 0.5 | Draft | Maintenance Agent | project/ |
| SK-004 | sentry-code-review | 1.0 | Producción | Dev Team | team/ |
| SK-005 | client-intake-form | 0.3 | Draft | Consultant | user/ |

## Mapa de Entregables

| ID | Skill | Entregables | Formato | Convención de Nombrado |
|----|-------|-------------|---------|----------------------|
| SK-001 | create-vsc-proposals | Propuesta técnica | .docx | {Client}_{Service}_Proposal_Rev{N}.docx |
| SK-001 | create-vsc-proposals | Estimación de costos | .xlsx | {Client}_{Service}_Estimate_Rev{N}.xlsx |
| SK-001 | create-vsc-proposals | Deck ejecutivo | .pptx | {Client}_{Service}_Presentation_Rev{N}.pptx |
| SK-002 | or-operations-workflow | Manual de operaciones | .docx | {Project}_Operations_Manual_v{N}.docx |
| SK-002 | or-operations-workflow | SOPs | .md | {Project}_SOP_{Area}_v{N}.md |

## Mapa de Documentos de Referencia

| Documento | Ruta | Skills que lo usan | Tipo | Tamaño | Última Rev. |
|-----------|------|-------------------|------|--------|-------------|
| Template propuesta DOCX | references/docx-template.md | SK-001 | Template | 220 líneas | 2026-02-15 |
| Template estimación XLSX | references/xlsx-template.md | SK-001 | Template | 180 líneas | 2026-02-15 |
| Template deck PPTX | references/pptx-template.md | SK-001 | Template | 400 líneas | 2026-02-10 |
| Tabla de tarifas | references/rates-table.md | SK-001, SK-005 | Data | 50 líneas | 2026-01-20 |
| vsc-or-brain (metodología OR) | references/or-methodology.md | SK-002, SK-003 | Metodología | 500+ líneas | 2026-02-20 |
| Brand guidelines | references/brand-guide.md | SK-001, SK-002, SK-004 | Estándar | 80 líneas | 2025-12-01 |

## Mapa de Scripts

| Script | Ruta | Skills que lo usan | Función | Modo |
|--------|------|-------------------|---------|------|
| validate.py | scripts/validate.py | SK-001 | Verificar consistencia numérica | Ejecutar |
| generate_docx.js | scripts/generate_docx.js | SK-001, SK-002 | Generar documentos Word | Ejecutar |
| analyze_scope.py | scripts/analyze_scope.py | SK-001 | Parsear RFQs y extraer alcance | Ejecutar |

## Mapa de Dependencias entre Skills

| Skill | Depende de | Tipo de Dependencia |
|-------|-----------|-------------------|
| SK-002 (or-operations-workflow) | SK-003 (maintenance-strategy) | El output de mantenimiento alimenta el manual de operaciones |
| SK-005 (client-intake-form) | SK-001 (create-vsc-proposals) | El intake genera el brief que arranca la propuesta |

## Mapa de Triggers y Conflictos

| Trigger Phrase | SK-001 | SK-002 | SK-003 | SK-004 | SK-005 |
|---------------|--------|--------|--------|--------|--------|
| "crear propuesta" | ✅ | | | | |
| "proposal" | ✅ | | | | |
| "cotización" | ✅ | | | | ⚠️ |
| "operational readiness" | | ✅ | | | |
| "plan de mantenimiento" | | | ✅ | | |
| "code review" | | | | ✅ | |
| "intake cliente" | | | | | ✅ |
| "nuevo cliente" | ⚠️ | | | | ✅ |

✅ = Primary trigger | ⚠️ = Posible conflicto (resolver con descripción más precisa)
```

### 17.3 Metadata Adicional por Skill

Cada skill debe tener un bloque de metadata que va más allá del YAML front matter. Este metadata no se carga en Claude (es para gobernanza humana):

```markdown
## Metadata de Gobernanza (no incluir en SKILL.md)

### SK-001: create-vsc-proposals
- **Owner:** José Cortinat
- **Creado:** 2025-11-15
- **Última revisión completa:** 2026-02-15
- **Próxima revisión:** 2026-03-15
- **Modelo testado:** Claude Opus 4.5, Sonnet 4.5
- **Tasa de activación testada:** ~85% (20 queries, 17 activaciones correctas)
- **Documentos asociados:** 6 (3 templates, 1 data, 1 brand, 1 methodology)
- **Scripts asociados:** 3
- **Tokens promedio por ejecución completa:** ~45,000
- **Tiempo promedio de ejecución:** ~8 minutos
- **Problemas conocidos:** Inconsistencia en formato de tablas Excel cuando hay >50 líneas
- **Notas de evolución:** Pendiente añadir soporte para propuestas multi-servicio combinadas
```

---

## 18. Documentos Metodológicos como Assets Reutilizables

### 18.1 El Patrón de "Knowledge Base Compartida"

Un hallazgo clave de la investigación: cuando múltiples skills necesitan acceder a la misma base de conocimiento metodológico (como el "vsc-or-brain" de 200+ páginas), la mejor práctica es tratarlo como un asset compartido, no duplicar el contenido en cada skill.

**Patrón recomendado por la comunidad:**

```
project-root/
├── .claude/
│   ├── skills/
│   │   ├── or-operations/
│   │   │   ├── SKILL.md          → Apunta a ../../knowledge-base/or-methodology.md
│   │   │   └── references/
│   │   │       └── ops-specific.md
│   │   ├── maintenance-strategy/
│   │   │   ├── SKILL.md          → Apunta a ../../knowledge-base/or-methodology.md
│   │   │   └── references/
│   │   │       └── maint-specific.md
│   │   └── hse-assessment/
│   │       ├── SKILL.md          → Apunta a ../../knowledge-base/or-methodology.md
│   │       └── references/
│   │           └── hse-specific.md
│   └── knowledge-base/           # Base de conocimiento compartida
│       ├── or-methodology.md     # El vsc-or-brain completo
│       ├── industry-standards.md
│       └── regulatory-framework.md
```

**Dentro de cada SKILL.md:**
```markdown
## Metodología Base

Este skill se basa en la metodología integrada de Operational Readiness de VSC.

**Cuando necesites contexto metodológico para tomar decisiones**, lee las secciones 
relevantes de `../../knowledge-base/or-methodology.md`. Este documento contiene:
- Secciones 1-3: Marco conceptual y principios
- Secciones 4-6: Procesos operativos (relevante para Operations Agent)
- Secciones 7-9: Estrategia de mantenimiento (relevante para Maintenance Agent)
- Secciones 10-12: HSE y gestión de riesgos (relevante para HSE Agent)

Solo leer la sección relevante a tu dominio. No cargar el documento completo.
```

### 18.2 Documentos Metodológicos con Tabla de Contenidos

Cuando un documento metodológico supera las 300 líneas (como el vsc-or-brain), la documentación oficial de Anthropic recomienda incluir una tabla de contenidos que actúe como índice de navegación para Claude:

```markdown
# VSC Operational Readiness Methodology (vsc-or-brain)

## Table of Contents
| Section | Topic | Lines | Relevant Agents |
|---------|-------|-------|-----------------|
| 1 | OR Framework & Principles | 1-45 | All |
| 2 | Project Lifecycle Phases | 46-90 | Project Agent |
| 3 | Commissioning & Startup | 91-140 | Operations Agent |
| 4 | Operations Readiness Criteria | 141-200 | Operations Agent |
| 5 | Maintenance Readiness Criteria | 201-260 | Maintenance Agent |
| 6 | HSE Readiness Criteria | 261-320 | HSE Agent |
| 7 | Staffing & Competency | 321-380 | HR Agent |
| 8 | Procurement Readiness | 381-430 | Procurement Agent |
| 9 | Systems & Digital Readiness | 431-480 | Project Agent, Digital |
| 10 | Financial Readiness | 481-520 | Finance Agent |

## 1. OR Framework & Principles
[contenido...]
```

Esto permite que Claude lea solo la sección 5 cuando el Maintenance Agent necesita criterios de readiness, sin cargar las 520 líneas completas.

### 18.3 Formato de Documentos Metodológicos: Markdown vs. PDF vs. Excel

| Formato | Cuándo Usar | Pros | Contras |
|---------|-------------|------|---------|
| **.md (Markdown)** | Metodologías, guías, SOPs, templates de texto | Claude lo lee nativamente, versionable en Git, editable | Sin formato visual complejo |
| **.pdf** | Documentos de referencia de terceros, estándares de industria que llegan en PDF | Formato original preservado | Claude necesita extraer texto, pierde estructura |
| **.xlsx** | Tablas de datos extensas, matrices de decisión, catálogos con cálculos | Ideal para datos tabulares complejos | Requiere script para parsear, no versionable fácilmente |
| **.json / .yaml** | Configuraciones, reglas de negocio estructuradas, taxonomías | Parseable por scripts, estructurado | No legible como prosa, limitado para metodología narrativa |

**Recomendación VSC:** Usar Markdown para todo lo posible. Cuando recibas PDFs de estándares de industria, convertirlos a Markdown y almacenarlos en `references/`. Cuando tengas datos tabulares complejos, usar `.xlsx` solo si hay cálculos; de lo contrario, usar tablas Markdown.

---

## 19. Gestión de Activación y Fiabilidad de Skills

### 19.1 El Problema de la Activación

Datos de la comunidad (Vercel agent evals, GitHub gist análisis de 200+ prompts) revelan que:
- Descripciones no optimizadas: ~20% tasa de activación
- Descripciones optimizadas: ~50% tasa de activación
- Descripciones optimizadas + ejemplos en body: ~72-90% tasa de activación

### 19.2 Técnicas de Mejora de Activación

**Técnica 1: Trigger hooks (descubierta por la comunidad)**
Usar hooks de Claude Code para analizar el prompt del usuario y inyectar recordatorios de skills relevantes:

```json
{
  "backend-dev-guidelines": {
    "type": "domain",
    "promptTriggers": {
      "keywords": ["backend", "controller", "API"],
      "intentPatterns": ["(create|add).*?(route|endpoint)"]
    },
    "fileTriggers": {
      "pathPatterns": ["backend/src/**/*.ts"]
    }
  }
}
```

**Técnica 2: Descripciones con formato "USE WHEN" explícito**
```yaml
description: |
  Knowledge Management for VSC projects. 
  USE WHEN user asks "what methodology applies", "find OR criteria for", 
  "load context for project", "what does the standard say about",
  "validate against methodology".
```

**Técnica 3: Keywords section en el body del SKILL.md**
Patrón observado en skills exitosos como `internal-comms`:
```markdown
## Keywords
propuesta, proposal, cotización, quote, bid, oferta, presupuesto, 
estimación, RFQ, RFP, scope of work, alcance, licitación
```

### 19.3 El Budget de Skills

Un descubrimiento importante de la documentación de Claude Code: las descripciones de skills tienen un **budget dinámico del 2% de la context window** (con fallback de 16,000 caracteres). Si tienes muchos skills, algunos pueden quedar excluidos. Puedes verificarlo con `/context` en Claude Code y buscar warnings sobre skills excluidas.

**Implicación:** Mantener las descripciones concisas (< 1000 caracteres) no es solo una buena práctica; es una necesidad mecánica para que todos tus skills quepan en el budget.

---

## 20. Skills como Runbooks Auto-Documentados

### 20.1 El Patrón "Documentation IS Implementation"

Un patrón emergente en la comunidad (documentado por Zack Proser): tratar skills como runbooks ejecutables donde la documentación y la implementación son el mismo artefacto. A diferencia de los runbooks tradicionales que se desactualizan porque están separados del código, un skill es simultáneamente la documentación del proceso Y la implementación.

**Implicaciones para VSC:**
- Cada SOP de VSC debería poder expresarse como un skill
- El skill ES el runbook: si un nuevo consultor necesita ejecutar el proceso, solo necesita invocar el skill
- Las actualizaciones al proceso se reflejan inmediatamente en la ejecución porque son el mismo archivo

### 20.2 Distribución y Versionado por Git

La comunidad converge en usar Git como el mecanismo de distribución:

```bash
# Estructura de repositorio para skills de equipo
vsc-skills/
├── README.md                    # Tabla Maestra de Skills
├── skills/
│   ├── create-vsc-proposals/
│   ├── or-operations-workflow/
│   └── maintenance-strategy/
├── knowledge-base/              # Metodologías compartidas
│   ├── or-methodology.md
│   └── industry-standards.md
├── CHANGELOG.md                 # Changelog global
└── install.sh                   # Script de instalación
```

**Script de instalación:**
```bash
#!/bin/bash
# Instalar skills VSC para Claude Code
SKILLS_DIR=~/.claude/skills
mkdir -p $SKILLS_DIR
for skill in skills/*/; do
    skill_name=$(basename "$skill")
    rsync -a "$skill" "$SKILLS_DIR/$skill_name"
    echo "Installed: $skill_name"
done
echo "VSC Skills installed. Run /context in Claude Code to verify."
```

Esto permite que todo el equipo VSC tenga los mismos skills, con versionado, code review vía pull requests, y changelog automático.

### 20.3 Consideraciones de Seguridad

La documentación oficial y la comunidad advierten:
- **Skills pueden ejecutar código arbitrario.** Solo instalar skills de fuentes confiables.
- **No hardcodear credenciales** en skills. Usar variables de entorno.
- **No incluir datos sensibles de clientes** en skills que se compartan por Git.
- Las API keys y credenciales deben seguir el patrón twelve-factor: exportadas como variables de entorno, nunca en el código del skill.

---

## 21. Principios Finales

1. **Un skill es un documento vivo.** Evoluciona con tu workflow. Revísalo mensualmente.
2. **Menos es más.** 5 skills excelentes superan a 20 mediocres. Sé selectivo.
3. **El YAML front matter es el 80% del éxito.** Si el trigger es malo, el mejor contenido es irrelevante porque nunca se activa.
4. **Explica el por qué, no solo el qué.** Claude es inteligente. Si entiende la razón, se adapta mejor que con reglas rígidas.
5. **Testea en sesiones limpias.** Siempre usa una terminal nueva para tests de triggering. El contexto residual contamina los resultados.
6. **Bundlea el trabajo repetido.** Si el agente escribe el mismo helper script en 3 test cases, ese script pertenece a `scripts/`.
7. **Los MCPs son las manos; los skills son las recetas.** Documenta explícitamente qué tools del MCP usar y en qué orden.
8. **No hagas global lo que no has battle-tested.** Un mes mínimo en producción antes de promover a Global.
9. **Prefiere punteros a copias.** No incluyas snippets de código en SKILL.md que se desactualicen; apunta a los archivos fuente como referencia.
10. **Inline lo universal; externaliza lo condicional.** Si el contenido aplica en cada ejecución, va en SKILL.md. Si solo aplica en ciertos scenarios, va en `references/`.
11. **Scripts se ejecutan, no se leen.** Para operaciones deterministas, instruye a Claude a ejecutar el script, no a cargarlo en contexto. Solo el output consume tokens.
12. **La Tabla Maestra es tu single source of truth.** Mantén un registro centralizado de todos los skills, sus documentos asociados, dependencias, y conflictos de triggers.
13. **El skill ES el runbook.** Si la documentación del proceso y la implementación son el mismo archivo, nunca se desalinean.
14. **Respeta el budget del 2%.** Las descripciones de skills comparten un presupuesto del 2% de la context window. Descripciones largas expulsan a otros skills del contexto.
15. **Documenta los documentos metodológicos con tabla de contenidos.** Cualquier referencia de más de 300 líneas necesita un índice navegable para que Claude lea solo lo relevante.
