# Cómo Funciona el Sistema Multi-Agente: Guía Paso a Paso

**Versión:** 1.0
**Fecha:** Febrero 2026
**Audiencia:** Equipos de desarrollo, equipos de negocio, y clientes

---

## 1. La Idea en 30 Segundos

El sistema desarrolla **estrategias de mantenimiento para equipos industriales** de forma semi-automática.

Un operador humano dice: *"Necesito una estrategia de mantenimiento para el Molino SAG 001"*.

El sistema entonces:
1. Descompone el equipo en sus componentes
2. Analiza qué puede fallar en cada componente
3. Decide qué tipo de mantenimiento aplicar a cada falla
4. Genera los paquetes de trabajo, instrucciones y materiales
5. Prepara todo para subir a SAP

El humano **aprueba cada paso** antes de avanzar al siguiente. Nada se ejecuta sin supervisión humana.

---

## 2. Los Cuatro Agentes: Quién Hace Qué

El sistema tiene **4 agentes de inteligencia artificial**, cada uno especializado en un área. Funcionan como un equipo de ingenieros donde cada uno tiene un rol definido.

```
                    ┌──────────────────────┐
                    │   OPERADOR HUMANO    │
                    │  (Ingeniero/Cliente) │
                    └──────────┬───────────┘
                               │
                               │  "Desarrollar estrategia
                               │   para Molino SAG 001"
                               ▼
                    ┌──────────────────────┐
                    │    ORQUESTADOR       │
                    │  (Director del       │
                    │   proyecto)          │
                    │                      │
                    │  Modelo: Sonnet      │
                    │  Rol: Coordinar      │
                    └───┬──────┬──────┬────┘
                        │      │      │
              ┌─────────┘      │      └──────────┐
              ▼                ▼                  ▼
   ┌──────────────────┐ ┌───────────────┐ ┌───────────────┐
   │  INGENIERO DE    │ │ PLANIFICADOR  │ │ ESPECIALISTA  │
   │  FIABILIDAD      │ │               │ │ EN REPUESTOS  │
   │                  │ │               │ │               │
   │  Modelo: Opus    │ │ Modelo: Sonnet│ │ Modelo: Haiku │
   │  Rol: Analizar   │ │ Rol: Planificar│ │ Rol: Materiales│
   └──────────────────┘ └───────────────┘ └───────────────┘
```

| Agente | Analogía | Qué Hace | Modelo de IA |
|--------|----------|----------|:------------:|
| **Orquestador** | Director de proyecto | Coordina el trabajo, delega a especialistas, valida resultados, pide aprobación al humano | Sonnet (rápido, equilibrado) |
| **Ingeniero de Fiabilidad** | Ingeniero senior de RCM | Construye jerarquías de equipos, analiza modos de falla, decide estrategias de mantenimiento | Opus (el más potente, para análisis complejos) |
| **Planificador** | Planificador de mantenimiento | Crea paquetes de trabajo, genera instrucciones, prepara el paquete SAP | Sonnet (equilibrado) |
| **Especialista en Repuestos** | Almacenero técnico | Asigna materiales a tareas de reemplazo, busca en el BOM del equipo | Haiku (rápido, tarea enfocada) |

---

## 3. Los Cuatro Milestones: El Camino Completo

El trabajo se divide en **4 etapas llamadas Milestones**. Cada milestone tiene una **compuerta de aprobación** donde el humano revisa y decide: Aprobar, Modificar, o Rechazar.

```
 ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
 │MILESTONE│    │MILESTONE│    │MILESTONE│    │MILESTONE│
 │    1    │───▶│    2    │───▶│    3    │───▶│    4    │
 │         │    │         │    │         │    │         │
 │Jerarquía│    │ Análisis│    │ Tareas +│    │Paquete  │
 │   +     │    │de Fallas│    │Paquetes │    │  SAP    │
 │Criticid.│    │  (FMEA) │    │   +     │    │         │
 │         │    │         │    │Materiales│    │         │
 └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
      │              │              │              │
   ┌──▼──┐        ┌──▼──┐        ┌──▼──┐        ┌──▼──┐
   │GATE │        │GATE │        │GATE │        │GATE │
   │  1  │        │  2  │        │  3  │        │  4  │
   │     │        │     │        │     │        │     │
   │✅❌🔄│        │✅❌🔄│        │✅❌🔄│        │✅❌🔄│
   └─────┘        └─────┘        └─────┘        └─────┘

   ✅ APPROVE = Avanzar al siguiente milestone
   🔄 MODIFY  = Re-ejecutar con feedback del humano
   ❌ REJECT  = Detener todo el proceso
```

**Milestone 1 — Jerarquía + Criticidad** (Agente: Fiabilidad)
- Descompone el equipo en 6 niveles (Planta → Área → Sistema → Equipo → Subconjunto → Componente)
- Evalúa qué tan crítico es cada componente

**Milestone 2 — Análisis de Fallas** (Agente: Fiabilidad)
- Identifica cómo puede fallar cada componente (FMECA)
- Valida cada modo de falla contra la tabla de 72 combinaciones
- Decide qué estrategia de mantenimiento aplicar (árbol de decisión RCM)

**Milestone 3 — Tareas + Paquetes + Materiales** (Agentes: Planificador + Repuestos)
- Define tareas de mantenimiento con frecuencias
- Agrupa tareas en paquetes de trabajo ejecutables
- Asigna materiales a las tareas de reemplazo

**Milestone 4 — Paquete SAP** (Agente: Planificador)
- Genera el archivo de carga para SAP (Items de mantenimiento + Listas de tareas)
- Valida todos los campos y referencias cruzadas
- Entrega un paquete BORRADOR para revisión final

---

## 4. Un Ejemplo Completo: Paso a Paso

Veamos qué pasa cuando un operador pide una estrategia para un equipo.

### Paso 1: El Humano Hace la Solicitud

```
Operador: "Desarrollar estrategia de mantenimiento para Molino SAG 001,
           planta OCP-JFC"
```

### Paso 2: El Workflow Arranca

El sistema crea una **sesión de trabajo** que acumulará todos los resultados:

```python
# Se crea una sesión vacía que se irá llenando
session = SessionState(
    session_id="abc-123",
    equipment_tag="SAG Mill 001",
    plant_code="OCP-JFC",
)
```

### Paso 3: Milestone 1 — El Orquestador Delega al Ingeniero de Fiabilidad

El Orquestador lee la solicitud y sabe que el primer paso es construir la jerarquía.
Delega al Ingeniero de Fiabilidad:

```
Orquestador → Fiabilidad: "Descomponer Molino SAG 001 en jerarquía de
                           6 niveles y evaluar criticidad de cada componente."
```

El Ingeniero de Fiabilidad:
1. Lee su CLAUDE.md (su identidad y restricciones)
2. Carga los skills relevantes: `build-equipment-hierarchy` y `assess-criticality`
3. Usa sus herramientas para construir la jerarquía
4. Devuelve los resultados al Orquestador

```
Resultado:
- 15 nodos de jerarquía creados
- 8 componentes mantenibles identificados
- 8 evaluaciones de criticidad completadas
```

### Paso 4: Gate 1 — El Humano Revisa

El Orquestador ejecuta la validación automática y presenta al humano:

```
=== Milestone 1: Jerarquía + Criticidad ===

Entidades creadas:
  hierarchy_nodes: 15
  criticality_assessments: 8

Validación: 0 errores, 1 advertencia, 3 info
ADVERTENCIA: [WARN-003] Rodamiento de piñón sin datos
             de historial de fallas

Acción: APPROVE / MODIFY / REJECT
```

El humano revisa y dice: **APPROVE** → Avanza a Milestone 2.

### Paso 5: Se Repite para Milestones 2, 3 y 4

El proceso se repite para cada milestone, acumulando resultados:

```
Después de Milestone 1: 15 nodos + 8 criticidades
Después de Milestone 2: + 24 modos de falla + 24 decisiones RCM
Después de Milestone 3: + 18 tareas + 6 paquetes + 12 materiales
Después de Milestone 4: + 1 paquete SAP (BORRADOR)
```

### Paso 6: Resultado Final

Al completar los 4 milestones, el operador tiene:
- La jerarquía completa del equipo
- Todos los modos de falla identificados y validados
- Todas las tareas de mantenimiento con frecuencias
- Paquetes de trabajo listos con instrucciones y materiales
- Un paquete SAP listo para revisión y carga

---

## 5. Cómo Funciona Internamente (Para el Equipo de Desarrollo)

### 5.1 El Ciclo de Ejecución de un Agente

Cada agente ejecuta un **ciclo de herramientas (tool-use loop)** siguiendo el patrón documentado por Anthropic:

```
┌────────────────────────────────────────────────────────┐
│                   CICLO DEL AGENTE                     │
│                                                        │
│  ┌──────────────┐                                      │
│  │ 1. Enviar    │  System prompt + mensaje + tools     │
│  │    mensaje   │──────────────────────────────▶ API   │
│  └──────────────┘                              Claude  │
│                                                  │     │
│  ┌──────────────┐                                │     │
│  │ 2. Recibir   │◀───────────────────────────────┘     │
│  │    respuesta │                                      │
│  └──────┬───────┘                                      │
│         │                                              │
│         ▼                                              │
│  ┌──────────────────────────┐                          │
│  │ 3. ¿Quiere usar         │                          │
│  │    herramientas?         │                          │
│  └──────┬──────────┬────────┘                          │
│         │ SÍ       │ NO                                │
│         ▼          ▼                                   │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ 4. Ejecutar │  │ 5. Devolver │                      │
│  │herramientas │  │  respuesta  │──▶ FIN               │
│  │ locales     │  │  final      │                      │
│  └──────┬──────┘  └─────────────┘                      │
│         │                                              │
│         │ Devolver resultados                          │
│         │ al agente                                    │
│         └────────────────────────────▶ Volver al paso 1│
│                                                        │
│  Seguridad: máximo N turnos (configurable por agente)  │
└────────────────────────────────────────────────────────┘
```

En código Python, este ciclo se ve así:

```python
# agents/definitions/base.py — Método run() simplificado

def run(self, user_message):
    messages = [{"role": "user", "content": user_message}]

    for _turn in range(self.config.max_turns):       # Seguridad: límite de turnos

        # PASO 1: Llamar a la API de Claude
        response = self.client.messages.create(
            model=self.config.model,                 # opus / sonnet / haiku
            system=self.system_prompt,               # CLAUDE.md del agente
            messages=messages,
            tools=self.tools,                        # Herramientas disponibles
            temperature=0.0,                         # Determinístico
        )

        # PASO 2-3: Analizar la respuesta
        text_parts = [b.text for b in response.content if es_texto(b)]
        tool_uses = [b for b in response.content if es_herramienta(b)]

        # PASO 5: Si NO quiere usar herramientas → respuesta final
        if not tool_uses:
            return "\n".join(text_parts)

        # PASO 4: Si SÍ quiere usar herramientas → ejecutarlas
        tool_results = []
        for tool in tool_uses:
            result = call_tool(tool.name, tool.input)   # Ejecución local
            tool_results.append({
                "tool_use_id": tool.id,
                "content": result,
            })

        # Devolver resultados al agente y continuar el ciclo
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return "[Agente alcanzó el máximo de turnos]"
```

**Puntos clave:**
- La IA decide si necesita usar herramientas o si ya tiene la respuesta
- Las herramientas son funciones Python que ejecutan lógica determinista (no IA)
- El ciclo tiene un límite de seguridad (`max_turns`) para evitar loops infinitos
- `temperature=0.0` asegura respuestas consistentes y reproducibles

### 5.2 Las Herramientas: Funciones Deterministas

Las herramientas son funciones Python registradas con un decorador `@tool`. Cuando el agente decide usar una herramienta, la ejecución es **local y determinista** (no pasa por la IA):

```python
# agents/tool_wrappers/criticality_tools.py

@tool(
    "assess_criticality",                              # Nombre
    "Calcular criticidad usando la matriz de 11 categorías",  # Descripción
    {"type": "object", "properties": {...}},            # Schema de parámetros
)
def assess_criticality(input_json: str) -> str:
    data = json.loads(input_json)
    result = CriticalityEngine.assess(data)            # Motor determinista
    return json.dumps(result)
```

El sistema tiene **27 módulos de herramientas** con un total de **124+ herramientas** registradas. Cada agente solo tiene acceso a las herramientas relevantes a su dominio:

```python
# agents/tool_wrappers/server.py

AGENT_TOOL_MAP = {
    "orchestrator":  [ 13 herramientas de coordinación y validación ],
    "reliability":   [ 46 herramientas de análisis de fiabilidad    ],
    "planning":      [ 62 herramientas de planificación y SAP       ],
    "spare_parts":   [  3 herramientas de materiales                ],
}
```

### 5.3 La Carga de Skills

Cuando un agente se inicializa, su system prompt se **enriquece dinámicamente** con los skills (procedimientos de dominio) relevantes:

```python
# agents/definitions/base.py — Método load_system_prompt()

def load_system_prompt(self):
    # 1. Cargar el prompt base (CLAUDE.md del agente)
    base_prompt = read("agents/{agent}/CLAUDE.md")

    # 2. Cargar los skills asignados a este agente
    agent_skills = load_skills_for_agent(self.agent_type)

    # 3. Cargar skills compartidos (knowledge base)
    shared_skills = load_shared_skills()

    # 4. Ensamblar el prompt final
    return base_prompt + skills_block(agent_skills + shared_skills)
```

El resultado es un prompt que contiene:
- **Identidad del agente** (quién es, qué puede y no puede hacer)
- **Procedimientos de dominio** (cómo ejecutar FMECA, cómo construir jerarquías, etc.)
- **Tablas de decisión** (tabla de 72 combinaciones, árbol RCM de 16 caminos)

### 5.4 El Workflow Engine

El motor de workflow controla la secuencia de milestones y las compuertas de aprobación:

```python
# agents/orchestration/workflow.py — Flujo simplificado

class StrategyWorkflow:
    def run(self, equipment, plant_code):
        session = SessionState()           # Estado acumulativo
        milestones = create_4_gates()      # 4 compuertas

        for gate in milestones:
            gate.start()                   # PENDING → IN_PROGRESS

            # El orquestador ejecuta el milestone
            response = self.orchestrator.run(milestone_instruction)

            # Validación automática
            validation = run_full_validation(session)
            gate.present(validation)       # IN_PROGRESS → PRESENTED

            # Compuerta humana
            action, feedback = self.human_approval(gate.number, summary)

            if action == "approve":
                gate.approve()             # PRESENTED → APPROVED → siguiente
            elif action == "modify":
                gate.modify(feedback)      # PRESENTED → IN_PROGRESS (re-ejecutar)
            elif action == "reject":
                gate.reject(feedback)      # PRESENTED → REJECTED (detener)
                break
```

### 5.5 El Session State: Memoria Compartida

Todos los agentes escriben sus resultados en un **estado de sesión compartido** que se acumula a lo largo de los 4 milestones:

```python
# agents/orchestration/session_state.py

@dataclass
class SessionState:
    session_id: str
    equipment_tag: str
    plant_code: str

    # Milestone 1
    hierarchy_nodes: list[dict]            # Nodos de jerarquía
    criticality_assessments: list[dict]    # Evaluaciones de criticidad

    # Milestone 2
    failure_modes: list[dict]              # Modos de falla

    # Milestone 3
    maintenance_tasks: list[dict]          # Tareas de mantenimiento
    work_packages: list[dict]              # Paquetes de trabajo
    material_assignments: list[dict]       # Asignaciones de materiales

    # Milestone 4
    sap_upload_package: dict               # Paquete SAP (BORRADOR)

    # Auditoría
    agent_interactions: list[dict]         # Registro de interacciones
```

Cada milestone **lee** lo que produjeron los milestones anteriores y **escribe** sus propios resultados. El Session State es serializable a JSON para checkpoint y recovery.

### 5.6 El Orquestador como Delegador

El Orquestador es un agente especial que puede **delegar trabajo** a los especialistas. Internamente, crea instancias de los 3 agentes especialistas y les pasa instrucciones:

```python
# agents/definitions/orchestrator.py

class OrchestratorAgent(Agent):
    def __init__(self):
        super().__init__(ORCHESTRATOR_CONFIG)
        # Crea los 3 especialistas
        self.reliability = create_reliability_agent()
        self.planning    = create_planning_agent()
        self.spare_parts = create_spare_parts_agent()

    def delegate(self, agent_type, instruction, context=None):
        agents = {
            "reliability": self.reliability,
            "planning":    self.planning,
            "spare_parts": self.spare_parts,
        }
        return agents[agent_type].run(instruction, context)
```

Cuando el Orquestador decide delegar:
1. Elige al especialista correcto
2. Le pasa la instrucción con contexto
3. El especialista ejecuta su propio ciclo de herramientas
4. El resultado vuelve al Orquestador
5. El Orquestador integra el resultado en el Session State

---

## 6. Puntos de Entrada: Cómo Se Arranca el Sistema

El sistema se puede ejecutar de **3 formas**:

### 6.1 Desde la Línea de Comandos (CLI)

```bash
python -m agents.run "SAG Mill 001" --plant OCP-JFC
```

Esto inicia una sesión interactiva donde el humano aprueba cada milestone directamente en la terminal.

### 6.2 Desde la API REST (FastAPI)

```bash
uvicorn api.main:app --reload
```

Expone endpoints HTTP para cada módulo del sistema (jerarquía, criticidad, FMEA, tareas, SAP, etc.).

### 6.3 Desde el Dashboard Web (Streamlit)

```bash
streamlit run streamlit_app/app.py
```

Interfaz visual con tablas, gráficos y formularios para interactuar con el sistema.

---

## 7. Arquitectura de Archivos

```
agents/
│
├── orchestrator/                    # Agente Orquestador
│   ├── CLAUDE.md                   # "Quién soy" del agente
│   ├── skills.yaml                 # Qué skills usa
│   └── config.py                   # Configuración Python
│
├── reliability/                    # Agente Ingeniero de Fiabilidad
│   ├── CLAUDE.md                   # "Quién soy" del agente
│   ├── skills.yaml                 # Qué skills usa
│   └── config.py                   # Configuración Python
│
├── planning/                       # Agente Planificador
│   ├── CLAUDE.md                   # "Quién soy" del agente
│   ├── skills.yaml                 # Qué skills usa
│   └── config.py                   # Configuración Python
│
├── spare-parts/                    # Agente Especialista en Repuestos
│   ├── CLAUDE.md                   # "Quién soy" del agente
│   ├── skills.yaml                 # Qué skills usa
│   └── config.py                   # Configuración Python
│
├── _shared/                        # Infraestructura compartida
│   ├── base.py                    # AgentConfig + Agent loop
│   └── loader.py                  # Carga dinámica de agentes
│
├── definitions/                    # [VERSIÓN ANTERIOR — siendo migrada]
│   ├── base.py                    # Agent loop con API de Anthropic
│   ├── orchestrator.py            # OrchestratorAgent + delegation
│   ├── reliability.py             # Factory del agente
│   ├── planning.py                # Factory del agente
│   ├── spare_parts.py             # Factory del agente
│   └── prompts/                   # System prompts (reemplazados por CLAUDE.md)
│
├── orchestration/                  # Motor de workflow
│   ├── workflow.py                # StrategyWorkflow (4 milestones)
│   ├── milestones.py              # MilestoneGate + status machine
│   └── session_state.py           # SessionState (memoria compartida)
│
├── tool_wrappers/                  # 27 módulos de herramientas
│   ├── registry.py                # @tool decorator + call_tool()
│   ├── server.py                  # AGENT_TOOL_MAP + get_tools_for_agent()
│   ├── criticality_tools.py       # assess_criticality, validate_matrix
│   ├── rcm_tools.py               # rcm_decide
│   ├── sap_tools.py               # generate_sap_upload, validate_fields
│   ├── ... (24 módulos más)
│   └── hierarchy_builder_tools.py # build_hierarchy
│
├── AGENT_REGISTRY.md              # Tabla maestra de agentes
└── VSC_Agents_Methodology_v1.md   # Metodología de diseño

skills/                             # 36 skills (procedimientos de dominio)
├── 02-maintenance-strategy-development/  # 8 skills
├── 02-work-planning/                     # 8 skills
├── 03-reliability-engineering-.../       # 4 skills
├── 04-cost-analysis/                     # 2 skills
├── 05-general-functionalities/           # 5 skills
├── 06-orchestation/                      # 5 skills
└── (standalone skills)                   # 4 skills

tools/engines/                      # Motores deterministas
├── criticality_engine.py          # Cálculo de criticidad
├── rcm_engine.py                  # Árbol de decisión RCM
├── health_engine.py               # Score de salud del activo
└── ...
```

---

## 8. Flujo de Datos Completo

```
                    Operador Humano
                         │
                         │  "Estrategia para Molino SAG 001"
                         ▼
              ┌─────────────────────┐
              │  Workflow Engine    │  agents/orchestration/workflow.py
              │  (StrategyWorkflow) │
              └─────────┬───────────┘
                        │
                        │  Crea SessionState + 4 MilestoneGates
                        ▼
              ┌─────────────────────┐
              │  Orquestador       │  agents/orchestrator/CLAUDE.md
              │  (Sonnet, 20 turns)│          +
              │                    │  agents/definitions/orchestrator.py
              └───┬─────┬─────┬───┘
                  │     │     │
     ┌────────────┘     │     └────────────┐
     ▼                  ▼                  ▼
┌──────────┐     ┌──────────┐       ┌──────────┐
│Fiabilidad│     │Planific. │       │Repuestos │
│(Opus,    │     │(Sonnet,  │       │(Haiku,   │
│ 40 turns)│     │ 30 turns)│       │ 15 turns)│
└────┬─────┘     └────┬─────┘       └────┬─────┘
     │                │                   │
     │ Usa tools      │ Usa tools         │ Usa tools
     ▼                ▼                   ▼
┌──────────┐     ┌──────────┐       ┌──────────┐
│46 tools  │     │62 tools  │       │3 tools   │
│(RCM,FMECA│     │(SAP,WP,  │       │(material,│
│ criticid)│     │ schedule)│       │ BOM)     │
└────┬─────┘     └────┬─────┘       └────┬─────┘
     │                │                   │
     │ Ejecutan       │ Ejecutan          │ Ejecutan
     ▼                ▼                   ▼
┌──────────────────────────────────────────────┐
│  Motores Deterministas (tools/engines/)       │
│  CriticalityEngine, RCMEngine, etc.          │
│  (Código Python puro — sin IA)               │
└──────────────────────────┬───────────────────┘
                           │
                           │ Resultados
                           ▼
              ┌─────────────────────┐
              │  Session State      │
              │  (Memoria compartida│
              │   de la sesión)     │
              └─────────┬───────────┘
                        │
                        │ Validación automática
                        ▼
              ┌─────────────────────┐
              │  Gate de Aprobación │
              │                    │
              │  ✅ APPROVE → next  │
              │  🔄 MODIFY → redo   │
              │  ❌ REJECT → stop   │
              └─────────┬───────────┘
                        │
                        ▼
                  Operador Humano
                  (revisa y decide)
```

---

## 9. Glosario de Conceptos Clave

| Concepto | Qué Es | Para Quién |
|----------|--------|------------|
| **Agente** | Una instancia de IA con identidad y herramientas propias | Todos |
| **Skill** | Un documento de procedimiento que el agente sigue paso a paso | Todos |
| **Tool (Herramienta)** | Una función Python que ejecuta un cálculo específico (sin IA) | Dev + Negocio |
| **Milestone** | Una etapa del proceso con entregables definidos | Todos |
| **Gate** | Una compuerta de aprobación humana entre milestones | Todos |
| **Session State** | La memoria acumulativa de toda la sesión | Dev + Negocio |
| **CLAUDE.md** | El archivo que define la identidad de un agente | Dev |
| **skills.yaml** | El archivo que lista qué skills usa cada agente | Dev |
| **Agent Loop** | El ciclo de enviar→recibir→ejecutar tools→repetir | Dev |
| **Tool Registry** | El catálogo global de todas las herramientas disponibles | Dev |
| **AGENT_TOOL_MAP** | La tabla que define qué herramientas tiene cada agente | Dev |
| **System Prompt** | Las instrucciones base que la IA recibe al inicializarse | Dev |
| **FMECA** | Análisis de Modos de Falla, Efectos y Criticidad | Negocio + Cliente |
| **RCM** | Mantenimiento Centrado en Confiabilidad | Negocio + Cliente |
| **SAP PM** | Módulo de Mantenimiento de Planta en SAP | Negocio + Cliente |
| **BOM** | Bill of Materials (Lista de materiales de un equipo) | Negocio + Cliente |
| **T-16 Rule** | Las tareas de REEMPLAZO deben tener materiales asignados | Negocio + Cliente |

---

## 10. Preguntas Frecuentes

### ¿La IA puede hacer cambios en SAP directamente?
**No.** Todos los paquetes SAP se generan como **BORRADOR**. El operador humano revisa y decide cuándo cargar a SAP. El sistema nunca auto-envía nada.

### ¿Qué pasa si la IA comete un error?
Cada milestone tiene una **validación automática** que detecta errores (campos faltantes, combinaciones inválidas, nombres incorrectos). Si hay errores, se reportan antes de que el humano apruebe. El humano puede pedir **MODIFY** para corregir, o **REJECT** para detener.

### ¿Qué pasa si el sistema se cae a mitad de proceso?
El Session State se puede **serializar a JSON** después de cada milestone aprobado. Si el sistema se reinicia, puede retomar desde el último checkpoint.

### ¿Por qué hay 4 agentes y no 1?
Cada agente tiene un **ámbito de expertise diferente** y usa un **modelo de IA distinto**. El Ingeniero de Fiabilidad usa el modelo más potente (Opus) porque su trabajo analítico es el más complejo. El Especialista en Repuestos usa el modelo más rápido (Haiku) porque su tarea es más enfocada. Esto optimiza costo y velocidad.

### ¿Qué son las "herramientas" que usan los agentes?
Son **funciones Python deterministas** que ejecutan cálculos específicos. Por ejemplo, `assess_criticality` calcula un score de criticidad usando una matriz de 11 criterios. La IA decide *cuándo* usar cada herramienta, pero la herramienta misma ejecuta lógica fija y predecible.

### ¿Cómo saben los agentes qué procedimiento seguir?
Cada agente tiene **skills** asignados. Un skill es un documento con el procedimiento paso a paso para una tarea específica (ej: "cómo hacer un FMECA", "cómo validar modos de falla"). Cuando el agente necesita ejecutar esa tarea, carga el skill correspondiente y sigue sus instrucciones.
