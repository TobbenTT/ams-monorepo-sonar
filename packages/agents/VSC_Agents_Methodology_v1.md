# Metodología VSC para Creación y Gestión de Agentes en Sistemas Multi-Agente

**Versión:** 1.0
**Autor:** ValueStrategy Consulting
**Fecha:** Febrero 2026
**Propósito:** Documento de referencia metodológica para estandarizar la creación, estructura, testing y gobernanza de agentes en sistemas multi-agente de VSC basados en Claude.
**Fuentes:** Documentación oficial Anthropic ("Building Effective Agents" — Erik Schluntz & Barry Zhang, Applied AI team, Dic 2024), Claude Agent SDK (GitHub Anthropic), Anthropic Cookbook (multi-agent patterns), comunidad GitHub (awesome-claude-code, claude-code-best-practice), análisis técnicos (Vercel agent evals, LangGraph/CrewAI/AutoGen comparisons), guías comunitarias (agenticcoding.substack, HumanLayer Blog), documento hermano `VSC_Skills_Methodology_v2.md`.

**Documento hermano:** Este documento complementa a `skills/VSC_Skills_Methodology_v2.md`. Los skills son las recetas; los agentes son los cocineros. Un agente *consume* skills, no los reemplaza. Si necesitas crear un skill, consulta el documento hermano. Si necesitas crear o modificar un agente, este es tu documento.

---

## 1. Fundamentos: Qué es un Agente y Por Qué Existe

Un agente es una instancia de LLM aumentada que **controla dinámicamente su propio proceso de ejecución y uso de herramientas.** A diferencia de un workflow donde el desarrollador define la secuencia de pasos en código, un agente decide por sí mismo qué hacer a continuación, qué herramientas usar, y cuándo detenerse.

La documentación oficial de Anthropic establece una taxonomía precisa que debemos internalizar:

**Sistemas Agénticos** (término paraguas): Cualquier sistema donde un LLM dirige dinámicamente sus propios procesos y uso de herramientas.

Dentro de los sistemas agénticos hay dos subcategorías:

- **Workflows:** El desarrollador define la secuencia en código. El LLM es invocado en puntos específicos para tareas específicas, pero el flujo general es determinístico. El desarrollador es el arquitecto; el LLM es el obrero.

- **Agentes:** El LLM decide la secuencia en runtime. El desarrollador provee las herramientas y el system prompt, pero el LLM controla el camino de ejecución. El LLM es tanto el arquitecto como el obrero.

**La recomendación más importante de Anthropic:** La mayoría de las aplicaciones de producción deberían usar workflows, no agentes. Los agentes son poderosos pero impredecibles. Los workflows son menos flexibles pero mucho más fiables. Empieza con un workflow. Si encuentras casos que el workflow no puede manejar, agrega comportamiento agéntico solo para esos casos.

### 1.1 Agente vs. Skill: La Distinción Crítica

| Concepto | Qué es | Analogía | Dónde vive |
|----------|--------|----------|------------|
| **Skill** | Un documento de procedimiento que canaliza la inteligencia del agente hacia un workflow específico | La receta del chef | `skills/{categoría}/{nombre}/CLAUDE.md` |
| **Agente** | Una instancia de LLM con identidad, herramientas, modelo y restricciones que ejecuta tareas de manera autónoma | El chef mismo | `agents/definitions/` |
| **Herramienta (Tool)** | Una función determinista que el agente puede invocar para actuar sobre el mundo | El cuchillo, la sartén | `agents/tool_wrappers/` |
| **Workflow** | La secuencia fija de milestones y gates que controla el proceso de alto nivel | El menú del día | `agents/orchestration/` |

Un agente *puede* consumir skills para obtener conocimiento de dominio, pero el agente existe independientemente de los skills. El skill enriquece al agente; el agente es el que ejecuta.

### 1.2 Cuándo Crear un Agente vs. Cuándo No

**Crea un agente cuando:**
- El dominio tiene herramientas especializadas que requieren un system prompt dedicado.
- El mismo grupo de herramientas se usa repetidamente con la misma identidad y restricciones.
- Necesitas aislar un dominio de expertise para que no contamine a otros (ej: un agente de fiabilidad no debe tener acceso a herramientas SAP).
- El trabajo requiere un modelo específico (ej: Opus para análisis profundo, Haiku para tareas ligeras).
- Quieres que un orquestador pueda delegar trabajo a un especialista de forma estructurada.

**No crees un agente cuando:**
- Un skill con instrucciones claras dentro de un agente existente es suficiente.
- La tarea es tan simple que un único prompt la resuelve sin herramientas.
- Estás duplicando funcionalidad que ya tiene otro agente (mejor amplía ese agente).
- No puedes definir con claridad qué herramientas necesita y cuáles no debe tener.

---

## 2. El Bloque Atómico: El LLM Aumentado

Anthropic establece el **LLM Aumentado** como la pieza fundamental de toda arquitectura agéntica. Cada agente es un LLM aumentado con tres capacidades:

### 2.1 Retrieval (Acceso a Conocimiento)

El agente puede extraer información de fuentes externas en tiempo de inferencia. Esto incluye:
- Skills cargados dinámicamente (ver `VSC_Skills_Methodology_v2.md`, sección 2.2 - Tres Niveles de Carga)
- Documentos de referencia leídos bajo demanda
- Consultas a bases de datos o APIs
- Knowledge base compartida (`skills/00-knowledge-base/`)

**Recomendación de Anthropic:** Inyectar el conocimiento de retrieval en el system prompt cuando sea posible (reduce latencia). Usar tool calls para retrieval solo cuando el espacio de búsqueda es demasiado grande para caber en el prompt.

### 2.2 Tools (Toma de Acción)

El agente puede invocar funciones externas para computar, acceder APIs, modificar estado. Las herramientas transforman al LLM de un generador de texto en un actor que puede afectar el mundo.

**Las 8 Reglas de Anthropic para Diseño de Herramientas:**

1. **Una herramienta, un propósito.** `process_data` es malo. `validate_failure_modes_against_72_combo_table` es bueno.
2. **Nombres en formato `verb_noun`.** `assess_criticality`, `build_hierarchy`, `export_to_sap`.
3. **Las descripciones responden tres preguntas:** ¿Qué hace? ¿Cuándo debo usarla? ¿Qué devuelve?
4. **Las descripciones de parámetros son tan importantes como las de la herramienta.** "The equipment tag" es vago. "SAP functional location tag in format PLANT-AREA-SYSTEM-SEQ, e.g. 'OCP-JFC-SAG-001'" es preciso.
5. **Usa `required` vs opcionales sabiamente.** Demasiados requeridos = difícil de usar. Demasiados opcionales = poco fiable.
6. **Devuelve datos estructurados.** JSON con estructura consistente, no texto libre.
7. **Errores en el return, no como excepciones.** `{"status": "error", "message": "Equipment tag not found", "suggestion": "Check if exists"}` es mejor que lanzar una excepción.
8. **Mantén el set de herramientas pequeño y enfocado.** Un agente con 5-10 herramientas bien diseñadas supera a uno con 50 mediocres. Si necesita muchas herramientas, eso es señal de dividirlo en múltiples agentes.

### 2.3 Memory (Persistencia de Estado)

Tres niveles de memoria:
- **Corto plazo:** El historial de conversación dentro de una sesión.
- **Mediano plazo:** Estado de sesión que persiste entre turnos (como `SessionState` en nuestro sistema).
- **Largo plazo:** Almacenamiento persistente entre sesiones (archivos, bases de datos, checkpoints).

**Recomendación de Anthropic:** Mantener la memoria estructurada y consultable, no como volcados crudos de conversación.

**La inversión más importante** que puedes hacer es asegurar que tu LLM Aumentado funcione excepcionalmente bien por sí solo, antes de envolverlo en un workflow o sistema multi-agente. Específicamente: haz que tus definiciones de herramientas sean excelentes, tu retrieval preciso, y tu system prompt enfocado.

---

## 3. Anatomía Completa de un Agente

### 3.1 Estructura de Carpetas

La estructura sigue el mismo principio que los skills: **cada agente es una carpeta autocontenida con un `CLAUDE.md` como archivo principal.** Así como un skill vive en `skills/{categoría}/{skill-name}/CLAUDE.md`, un agente vive en `agents/{agent-name}/CLAUDE.md`.

```
agents/
│
├── orchestrator/                       # [OBLIGATORIO] Carpeta del agente orquestador
│   ├── CLAUDE.md                       # System prompt (identidad del agente)
│   ├── skills.yaml                     # Skills asignados a este agente
│   ├── config.py                       # Factory function / AgentConfig
│   └── references/                     # References específicas del agente (si aplica)
│       └── delegation-examples.md
│
├── reliability/                        # [OBLIGATORIO] Carpeta del agente de fiabilidad
│   ├── CLAUDE.md                       # System prompt
│   ├── skills.yaml                     # Skills asignados
│   ├── config.py                       # Factory function
│   └── references/                     # Knowledge de dominio propio del agente
│       └── rcm-quick-reference.md
│
├── planning/                           # [OBLIGATORIO] Carpeta del agente de planificación
│   ├── CLAUDE.md                       # System prompt
│   ├── skills.yaml                     # Skills asignados
│   ├── config.py                       # Factory function
│   └── references/
│       └── sap-field-quick-reference.md
│
├── spare-parts/                        # [OBLIGATORIO] Carpeta del agente de repuestos
│   ├── CLAUDE.md                       # System prompt
│   ├── skills.yaml                     # Skills asignados
│   └── config.py                       # Factory function
│
├── _shared/                            # [OBLIGATORIO] Infraestructura compartida
│   ├── __init__.py
│   ├── base.py                         # AgentConfig dataclass + Agent loop class
│   └── loader.py                       # Carga de CLAUDE.md + skills.yaml + references
│
├── orchestration/                      # [OBLIGATORIO] Capa de coordinación
│   ├── __init__.py
│   ├── workflow.py                     # Workflow principal (secuencia de milestones)
│   ├── milestones.py                   # State machine de gates
│   └── session_state.py               # Acumulador de estado compartido
│
├── tool_wrappers/                      # [OBLIGATORIO] Capa de herramientas
│   ├── __init__.py
│   ├── registry.py                     # @tool decorator + TOOL_REGISTRY
│   ├── server.py                       # AGENT_TOOL_MAP (qué agente ve qué tools)
│   └── {domain}_tools.py              # Módulos de herramientas por dominio
│
├── guardrails/                         # [RECOMENDADO] Capa de seguridad
│   ├── __init__.py
│   ├── input_guards.py                 # Validación de inputs antes del agente
│   ├── output_guards.py                # Validación de outputs después del agente
│   └── cost_tracker.py                 # Control de presupuesto de tokens
│
├── evals/                              # [RECOMENDADO] Testing y benchmarks
│   ├── tool_tests/                     # Unit tests de herramientas
│   │   └── test_{domain}_tools.py
│   ├── agent_tests/                    # Tests de decisión de agentes
│   │   └── test_{agent_name}_decisions.py
│   ├── workflow_tests/                 # Tests end-to-end
│   │   └── test_milestone_{n}.py
│   └── eval_config.json                # Configuración de métricas y thresholds
│
├── observability/                      # [RECOMENDADO] Logging y trazabilidad
│   ├── __init__.py
│   ├── tracer.py                       # AgentTrace dataclass + logging
│   └── cost_report.py                  # Reportes de costo por sesión
│
├── AGENT_REGISTRY.md                   # Tabla maestra de todos los agentes
└── VSC_Agents_Methodology_v1.md        # Este documento
```

### 3.2 El Principio de Simetría: Agente = Carpeta Autocontenida (igual que Skill)

La estructura de un agente es un espejo de la estructura de un skill. Esta simetría es deliberada: simplifica el modelo mental y permite que cualquier miembro del equipo navegue tanto agentes como skills con las mismas convenciones.

```
┌─────────────────────────────────┬────────────────────────────────┐
│          SKILL                  │          AGENTE                │
├─────────────────────────────────┼────────────────────────────────┤
│ skills/{cat}/{name}/            │ agents/{name}/                 │
│ ├── CLAUDE.md  (procedimiento)  │ ├── CLAUDE.md  (identidad)     │
│ ├── references/ (dominio)       │ ├── references/ (dominio)      │
│ ├── scripts/   (ejecución)      │ ├── config.py  (factory)       │
│ ├── evals/     (testing)        │ ├── skills.yaml (skills usados)│
│ └── assets/    (estáticos)      │ └── evals/     (testing)       │
├─────────────────────────────────┼────────────────────────────────┤
│ CLAUDE.md responde:             │ CLAUDE.md responde:            │
│ "¿Cómo ejecutar esta tarea?"   │ "¿Quién soy y qué puedo hacer?"│
├─────────────────────────────────┼────────────────────────────────┤
│ Se carga CUANDO el skill se     │ Se carga SIEMPRE que el agente │
│ activa (por trigger o asignación)│ se inicializa                  │
├─────────────────────────────────┼────────────────────────────────┤
│ Tamaño ideal: < 500 líneas     │ Tamaño ideal: 80-200 líneas   │
└─────────────────────────────────┴────────────────────────────────┘
```

**La diferencia clave entre los CLAUDE.md:**
- El CLAUDE.md de un **skill** contiene el *procedimiento*: cómo ejecutar una tarea específica, con pasos, tablas de decisión, y formato de output.
- El CLAUDE.md de un **agente** contiene la *identidad*: quién es, qué restricciones tiene, qué herramientas usa, qué scope cubre, y a qué skills tiene acceso.

### 3.3 Contenido de la Carpeta de un Agente

#### 3.3.1 El `CLAUDE.md` del Agente (System Prompt)

Este es el archivo principal. Define la identidad del agente. Es el equivalente del system prompt. Se carga **siempre** que el agente se inicializa.

La estructura completa se detalla en la sección 5, pero a nivel de carpeta:
- **Ubicación:** `agents/{agent-name}/CLAUDE.md`
- **Tamaño ideal:** 80-200 líneas
- **Contiene:** Role, Expertise, Critical Constraints, Workflow Steps, Skills Assigned, Scope Boundaries, Quality Checks, Tools Available

#### 3.3.2 El `skills.yaml` del Agente (Mapeo Declarativo de Skills)

Este archivo declara **explícitamente** qué skills consume el agente, en qué milestone, y a qué nivel de carga. Reemplaza al triggering semántico por un mecanismo determinista.

**Por qué existe dentro de la carpeta del agente (y no en una carpeta centralizada):**
- Sigue el principio de colocación: todo lo que define al agente está en su carpeta.
- Cuando abres la carpeta de un agente, puedes ver *todo* lo que necesita de un vistazo.
- Facilita el code review: un PR que modifica un agente toca solo su carpeta.
- Es consistente con cómo los skills tienen sus `references/` dentro de su propia carpeta.

```yaml
# agents/reliability/skills.yaml
# Skills asignados al Reliability Agent
# Última actualización: 2026-02-24

agent: reliability
model: claude-opus-4-6

skills:
  # ── Milestone 1: Hierarchy + Criticality ─────────────────────
  - name: build-equipment-hierarchy
    path: skills/02-maintenance-strategy-development/build-equipment-hierarchy/CLAUDE.md
    load_level: 2                    # Cargar body completo del CLAUDE.md
    milestone: 1
    mandatory: true                  # El agente NO puede completar M1 sin este skill
    references_to_preload:           # References que se cargan junto con el skill
      - references/hierarchy-examples.md

  - name: assess-criticality
    path: skills/02-maintenance-strategy-development/assess-criticality/CLAUDE.md
    load_level: 2
    milestone: 1
    mandatory: true
    references_to_preload:
      - references/consequence-tables.md

  # ── Milestone 2: Failure Modes + RCM ─────────────────────────
  - name: perform-fmeca
    path: skills/02-maintenance-strategy-development/perform-fmeca/CLAUDE.md
    load_level: 2
    milestone: 2
    mandatory: true
    references_to_preload:
      - references/fmeca-examples.md

  - name: validate-failure-modes
    path: skills/02-maintenance-strategy-development/validate-failure-modes/CLAUDE.md
    load_level: 2
    milestone: 2
    mandatory: true
    references_to_preload:
      - references/72-combo-table.md

  - name: run-rcm-decision-tree
    path: skills/02-maintenance-strategy-development/run-rcm-decision-tree/CLAUDE.md
    load_level: 2
    milestone: 2
    mandatory: true
    references_to_preload:
      - references/decision-tree-details.md

  # ── Milestone 3: Tasks + Optimization ────────────────────────
  - name: fit-weibull-distribution
    path: skills/03-reliability-engineering-and-defect-elimination/fit-weibull-distribution/CLAUDE.md
    load_level: 3                    # Solo cargar references bajo demanda
    milestone: 3
    mandatory: false                 # Solo se usa si hay datos de falla disponibles

  - name: analyze-pareto
    path: skills/03-reliability-engineering-and-defect-elimination/analyze-pareto/CLAUDE.md
    load_level: 3
    milestone: 3
    mandatory: false

  - name: perform-rca
    path: skills/03-reliability-engineering-and-defect-elimination/perform-rca/CLAUDE.md
    load_level: 3
    milestone: 3
    mandatory: false

# ── Knowledge Base (siempre disponible, carga selectiva) ──────
knowledge_base:
  - path: skills/00-knowledge-base/methodologies/rcm-methodology-full.md
    load_when: "Agent needs RCM methodology reference"
  - path: skills/00-knowledge-base/standards/iso-14224-plant-equipment-taxonomy.md
    load_when: "Agent needs equipment taxonomy or failure coding reference"
  - path: skills/00-knowledge-base/data-models/failure-modes/MASTER.md
    load_when: "Agent needs to validate failure mode combinations, look up degradation processes, detection techniques, or maintenance strategies"
```

**Campos del YAML:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `name` | string | Sí | Nombre del skill (debe coincidir con el `name` del YAML front matter del CLAUDE.md del skill) |
| `path` | string | Sí | Ruta relativa al CLAUDE.md del skill desde la raíz del proyecto |
| `load_level` | int (1-3) | Sí | Nivel de carga: 1=solo front matter, 2=body completo, 3=solo references bajo demanda |
| `milestone` | int | Sí | En qué milestone se activa este skill |
| `mandatory` | bool | Sí | Si el agente NO puede completar el milestone sin este skill |
| `references_to_preload` | list | No | References que se cargan automáticamente junto con el skill |

**Sección `knowledge_base`:** Lista de documentos de la knowledge base compartida que el agente puede consultar. A diferencia de los skills (que tienen workflow y procedimiento), estos son documentos de referencia pura. Se cargan solo cuando el agente necesita consultar un estándar o metodología.

#### 3.3.3 El `config.py` del Agente (Factory)

Cada agente tiene un módulo Python que crea su instancia:

```python
# agents/reliability/config.py
from agents._shared.base import AgentConfig, Agent

def create_reliability_agent() -> Agent:
    """Factory para el agente de fiabilidad."""
    config = AgentConfig(
        name="Reliability Engineer",
        model="claude-opus-4-6",
        agent_dir="agents/reliability",           # La carpeta del agente
        tools=[
            "assess_criticality",
            "validate_failure_modes",
            "run_rcm_decision_tree",
            "fit_weibull",
            # ... etc
        ],
        max_turns=40,
        temperature=0.0,
    )
    return Agent(config)
```

El `AgentConfig` usa `agent_dir` para localizar automáticamente:
- `{agent_dir}/CLAUDE.md` → system prompt
- `{agent_dir}/skills.yaml` → mapeo de skills
- `{agent_dir}/references/` → references propias del agente

#### 3.3.4 La Carpeta `references/` del Agente

A diferencia de las references de un skill (que contienen tablas de decisión y datos de dominio para el procedimiento), las references de un agente contienen conocimiento que el agente necesita **siempre** o **frecuentemente**, independiente de qué skill esté ejecutando.

**Ejemplos de references de agente:**
- `agents/orchestrator/references/delegation-examples.md` — Ejemplos de cómo formular delegaciones efectivas
- `agents/reliability/references/rcm-quick-reference.md` — Resumen rápido de RCM que el agente consulta frecuentemente
- `agents/planning/references/sap-field-quick-reference.md` — Tabla de campos SAP que el agente consulta en cada export

**Cuándo usar references de agente vs. references de skill:**

| Pregunta | Si SÍ → | Ubicación |
|----------|---------|-----------|
| ¿Este conocimiento lo usa el agente en CADA milestone? | Sí | `agents/{agent}/references/` |
| ¿Este conocimiento solo aplica cuando ejecuta UN skill específico? | Sí | `skills/{skill}/references/` |
| ¿Es un estándar de industria compartido por varios agentes? | Sí | `skills/00-knowledge-base/` |

### 3.4 El Registro Maestro de Agentes (`AGENT_REGISTRY.md`)

Este archivo vive en la raíz de `agents/` y es la tabla de verdad única que cataloga todos los agentes y su relación con skills, herramientas, y milestones:

```markdown
# Registro Maestro de Agentes VSC

Última actualización: 2026-02-24

## Índice de Agentes

| ID | Agente | Carpeta | Modelo | Max Turns | Milestones | Estado |
|----|--------|---------|--------|-----------|------------|--------|
| AG-001 | Orchestrator | agents/orchestrator/ | Sonnet | 20 | Todos | Producción |
| AG-002 | Reliability | agents/reliability/ | Opus | 40 | 1, 2, 3 | Producción |
| AG-003 | Planning | agents/planning/ | Sonnet | 30 | 3, 4 | Producción |
| AG-004 | Spare Parts | agents/spare-parts/ | Haiku | 15 | 3 | Producción |

## Matriz Agente × Skill

| Skill | AG-001 | AG-002 | AG-003 | AG-004 | Milestone | Mandatory |
|-------|:------:|:------:|:------:|:------:|:---------:|:---------:|
| build-equipment-hierarchy | | ✅ | | | 1 | Sí |
| assess-criticality | | ✅ | | | 1 | Sí |
| perform-fmeca | | ✅ | | | 2 | Sí |
| validate-failure-modes | | ✅ | | | 2 | Sí |
| run-rcm-decision-tree | | ✅ | | | 2 | Sí |
| assemble-work-packages | | | ✅ | | 3 | Sí |
| generate-work-instructions | | | ✅ | | 3 | Sí |
| suggest-materials | | | | ✅ | 3 | Sí |
| resolve-equipment | | | | ✅ | 3 | Sí |
| export-to-sap | | | ✅ | | 4 | Sí |
| validate-quality | ✅ | | | | Todos | Sí |
| orchestrate-workflow | ✅ | | | | Todos | Sí |
| ... | ... | ... | ... | ... | ... | ... |

## Resumen por Agente

| Agente | Skills Mandatory | Skills Opcionales | Total Skills | # Tools | Knowledge Base Docs |
|--------|:---:|:---:|:---:|:---:|:---:|
| Orchestrator | 4 | 7 | 11 | ~13 | 0 |
| Reliability | 5 | 5 | 10 | ~41 | 3 |
| Planning | 4 | 8 | 12 | ~41 | 2 |
| Spare Parts | 2 | 1 | 3 | 3 | 1 |
```

### 3.5 Cómo el AgentConfig Carga Todo desde la Carpeta

El `AgentConfig` usa `agent_dir` como raíz para localizar todos los archivos del agente automáticamente:

```python
@dataclass
class AgentConfig:
    name: str
    model: str
    agent_dir: str                     # Raíz de la carpeta del agente
    tools: list[str]
    max_turns: int = 20
    temperature: float = 0.0

    @property
    def system_prompt_path(self) -> Path:
        return Path(self.agent_dir) / "CLAUDE.md"

    @property
    def skills_map_path(self) -> Path:
        return Path(self.agent_dir) / "skills.yaml"

    @property
    def references_dir(self) -> Path:
        return Path(self.agent_dir) / "references"

    def load_system_prompt(self) -> str:
        """Carga el CLAUDE.md del agente."""
        return self.system_prompt_path.read_text(encoding="utf-8")

    def load_skills_for_milestone(self, milestone: int) -> list[SkillContent]:
        """Carga los skills asignados a este agente para un milestone específico."""
        skills_config = yaml.safe_load(self.skills_map_path.read_text())
        relevant_skills = []

        for skill in skills_config["skills"]:
            if skill["milestone"] == milestone or skill.get("milestone") == "all":
                content = self._load_skill_at_level(skill)
                relevant_skills.append(content)

        return relevant_skills

    def _load_skill_at_level(self, skill: dict) -> SkillContent:
        """Carga un skill según su load_level configurado."""
        skill_path = Path(skill["path"])

        if skill["load_level"] == 1:
            # Solo YAML front matter (~100 words)
            return extract_front_matter(skill_path)

        elif skill["load_level"] == 2:
            # Body completo del CLAUDE.md + references preloaded
            body = skill_path.read_text()
            refs = []
            for ref_path in skill.get("references_to_preload", []):
                full_ref_path = skill_path.parent / ref_path
                if full_ref_path.exists():
                    refs.append(full_ref_path.read_text())
            return SkillContent(body=body, references=refs)

        elif skill["load_level"] == 3:
            # Solo front matter + punteros. References se leen bajo demanda.
            return extract_front_matter_with_pointers(skill_path)

    def load_agent_references(self) -> dict[str, str]:
        """Carga las references propias del agente (no de skills)."""
        refs = {}
        if self.references_dir.exists():
            for ref_file in self.references_dir.glob("*.md"):
                refs[ref_file.stem] = ref_file.read_text()
        return refs
```

### 3.6 Las Cinco Capas de un Sistema Multi-Agente

Todo sistema multi-agente bien diseñado tiene cinco capas. Cada capa tiene una responsabilidad distinta:

```
┌──────────────────────────────────────────────────────┐
│  CAPA 5: ORCHESTRATION (Workflow + Gates)             │
│  Controla la secuencia de milestones, gates,          │
│  aprobación humana, y flujo global.                   │
│  Archivos: orchestration/workflow.py, milestones.py   │
├──────────────────────────────────────────────────────┤
│  CAPA 4: AGENT IDENTITY (CLAUDE.md + skills.yaml)     │
│  Define quién es cada agente: su rol, modelo,         │
│  restricciones, skills asignados, y scope.            │
│  Archivos: agents/{name}/CLAUDE.md, skills.yaml       │
├──────────────────────────────────────────────────────┤
│  CAPA 3: SKILLS (Procedimientos + Domain Knowledge)   │
│  Provee los procedimientos detallados y conocimiento  │
│  de dominio que los agentes consumen bajo demanda.    │
│  Archivos: skills/{cat}/{name}/CLAUDE.md, references/ │
├──────────────────────────────────────────────────────┤
│  CAPA 2: TOOL WRAPPERS (Herramientas + Registry)      │
│  Implementa las herramientas deterministas que        │
│  los agentes invocan. Mapea agente → tools.           │
│  Archivos: tool_wrappers/registry.py, *_tools.py      │
├──────────────────────────────────────────────────────┤
│  CAPA 1: SESSION STATE (Memoria Compartida)           │
│  Acumula resultados de todos los agentes en un        │
│  estado serializable. Single source of truth.         │
│  Archivos: orchestration/session_state.py             │
└──────────────────────────────────────────────────────┘
```

**Principio de flujo:** Las capas superiores invocan a las inferiores, nunca al revés. El workflow invoca agentes, los agentes cargan skills y usan herramientas, las herramientas escriben en el session state.

---

## 4. El Agent Config: Definición Programática del Agente

### 4.1 Estructura del AgentConfig

Cada agente se define mediante un dataclass. El campo `agent_dir` apunta a la carpeta del agente, desde donde se localizan automáticamente el `CLAUDE.md`, el `skills.yaml`, y las `references/`:

```python
@dataclass
class AgentConfig:
    name: str                          # Identificador legible del agente
    model: str                         # Modelo Claude a usar
    agent_dir: str                     # Carpeta del agente (ej: "agents/reliability")
    tools: list[str]                   # Lista de nombres de tools disponibles
    max_turns: int = 20               # Límite de turnos del agent loop
    temperature: float = 0.0          # Temperatura (0.0 = determinístico)
```

**El `agent_dir` es el único path que necesitas.** Desde él, el `AgentConfig` localiza automáticamente (ver sección 3.5):
- `{agent_dir}/CLAUDE.md` → system prompt del agente
- `{agent_dir}/skills.yaml` → mapeo declarativo de skills asignados
- `{agent_dir}/references/` → references propias del agente
- `{agent_dir}/config.py` → factory function

### 4.2 Matriz de Configuración por Agente

| Agente | Modelo | Max Turns | Temperatura | # Tools | # Skills | Milestones | Rol |
|--------|--------|-----------|-------------|---------|----------|------------|-----|
| Orchestrator | Sonnet | 20 | 0.0 | ~13 | 11 (4 mandatory) | Todos | Coordinador |
| Reliability | Opus | 40 | 0.0 | ~41 | 10 (5 mandatory) | 1, 2, 3 | Especialista analítico |
| Planning | Sonnet | 30 | 0.0 | ~41 | 12 (4 mandatory) | 3, 4 | Especialista operativo |
| Spare Parts | Haiku | 15 | 0.0 | 3 | 3 (2 mandatory) | 3 | Especialista enfocado |

### 4.3 Model Tiering: La Decisión de Qué Modelo Usar

Anthropic recomienda usar el modelo correcto para cada tipo de trabajo, no el más potente para todo:

| Tipo de Trabajo | Modelo Recomendado | Justificación |
|----------------|-------------------|---------------|
| Clasificación, routing, triage | Haiku | Rápido, barato, suficiente para clasificación |
| Trabajo analítico estándar, coordinación | Sonnet | Buen balance costo/calidad |
| Razonamiento complejo, análisis profundo, orquestación crítica | Opus | Máxima calidad para decisiones complejas |

**Anti-patrón:** Usar Opus para todo. Es lento y costoso. Si un Haiku puede clasificar correctamente el 95% del tiempo, no necesitas un Opus para esa tarea.

**Anti-patrón:** Usar Haiku para razonamiento complejo. Ahorras dinero pero pierdes calidad. Para FMECA, análisis Weibull, o RCM decision trees, la diferencia de calidad entre Haiku y Opus justifica el costo.

### 4.4 El Agent Loop: Especificación Completa

El corazón de cada agente es su loop de ejecución. Este es el patrón canónico documentado por Anthropic:

```python
def agent_loop(system_prompt, tools, user_message, max_turns=10):
    messages = [{"role": "user", "content": user_message}]

    for turn in range(max_turns):
        response = client.messages.create(
            model=model,
            system=system_prompt,
            messages=messages,
            tools=tools,
            max_tokens=4096,
        )

        # Agregar respuesta del asistente al historial
        messages.append({"role": "assistant", "content": response.content})

        # ¿El agente quiere usar herramientas?
        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            messages.append({"role": "user", "content": tool_results})
            continue  # Dejar que el agente siga razonando

        # El agente decidió detenerse (end_turn)
        if response.stop_reason == "end_turn":
            return extract_text(response.content)

    # Seguridad: máximo de turnos excedido
    return "Agent exceeded maximum turns without completing."
```

**5 detalles críticos de implementación que Anthropic enfatiza:**

1. **El `stop_reason` es la señal de decisión.** `tool_use` = quiere usar herramienta. `end_turn` = terminó. Nunca ignores esta señal.
2. **Los tool results deben referenciar el `tool_use_id` correcto.** IDs no coincidentes causan errores.
3. **El límite de `max_turns` es esencial.** Sin él, un agente confundido puede loopear infinitamente. Empieza con un límite conservador (10-20) y aumenta solo si es necesario.
4. **El agente puede llamar múltiples herramientas en un solo turno.** Cuando la respuesta contiene múltiples bloques `tool_use`, ejecuta todas y devuelve todos los resultados.
5. **Los errores de herramientas se devuelven al agente, no se lanzan como excepciones.** El agente a menudo puede recuperarse de errores si recibe un mensaje claro.

---

## 5. El System Prompt del Agente: El Alma de la Identidad

### 5.1 Diferencia entre System Prompt de Agente y SKILL.md

| Aspecto | System Prompt del Agente | SKILL.md |
|---------|-------------------------|----------|
| **Alcance** | Define quién ES el agente de forma permanente | Define cómo ejecutar UNA tarea específica |
| **Persistencia** | Siempre en contexto mientras el agente existe | Cargado solo cuando el skill se activa |
| **Contenido** | Identidad, restricciones, herramientas, workflow general | Pasos detallados, templates, tablas de decisión |
| **Tamaño ideal** | 80-200 líneas | < 500 líneas |
| **Modifica** | El comportamiento base del agente | El procedimiento para una tarea específica |

### 5.2 Arquitectura del System Prompt: El Template de Anthropic

Anthropic recomienda esta estructura para system prompts de agentes:

```markdown
# Identity
You are [AGENT_NAME], a [ROLE_DESCRIPTION] specializing in [DOMAINS].

# Context
You are part of a [SYSTEM_DESCRIPTION]. Your role in the system is [ROLE_IN_SYSTEM].

# Capabilities
You have access to the following tools:
- [TOOL_1]: [WHEN_TO_USE]. [WHAT_IT_RETURNS].
- [TOOL_2]: [WHEN_TO_USE]. [WHAT_IT_RETURNS].

# Workflow
Follow this process for each request:
1. [STEP_1]
2. [STEP_2]

# Quality Standards
- [STANDARD_1]
- [STANDARD_2]

# Constraints
- NEVER [CONSTRAINT_1] because [REASON]
- ALWAYS [CONSTRAINT_2] because [REASON]
- When uncertain, [FALLBACK_BEHAVIOR]

# Output Format
Return your results as: [FORMAT_SPECIFICATION]

# Examples
## Example 1: [SCENARIO]
Input: [EXAMPLE_INPUT]
Expected tool calls: [EXPECTED_TOOLS]
Expected output: [EXPECTED_OUTPUT]
```

### 5.3 Estructura VSC para System Prompts de Agentes

Basado en el patrón que ya hemos establecido en nuestro sistema y las recomendaciones de Anthropic, el template VSC para prompts de agentes es:

```markdown
# {Agent Name} Agent — System Prompt

## Your Role
[3-6 bullets describiendo las responsabilidades del agente]

## Your Expertise
[Lista de áreas de expertise con bullets]

## Critical Constraints
### [Constraint Name] (MANDATORY)
[Descripción de la restricción con el POR QUÉ]

## Workflow Steps
### Milestone N: [Name]
1. [Paso 1]
2. [Paso 2]
...

## [Methodology/Domain] References
[Lista de documentos de referencia relevantes]

## Quality Checks
[Checklist numerada de verificaciones antes de entregar]

## Tools Available
[Lista de herramientas con breve descripción de cuándo usarlas]
```

### 5.4 Las Secciones Explicadas en Detalle

**Sección: Your Role**
Define la identidad del agente en 3-6 bullets. Debe ser suficientemente específica para que el agente sepa qué hacer, pero no tan detallada que restrinja su capacidad de adaptación.

```markdown
## Your Role
- You are the **Reliability Engineer** of the multi-agent maintenance strategy system.
- You perform RCM analysis, FMECA, criticality assessment, and failure prediction.
- You receive delegations from the Orchestrator with specific equipment and analysis tasks.
- You return structured results (JSON) that feed the session state for downstream agents.
- You participate in Milestones 1, 2, and 3.
- You NEVER generate work packages, SAP exports, or material assignments — those belong to other agents.
```

**Sección: Critical Constraints**
Las restricciones son el mecanismo más poderoso para controlar el comportamiento del agente. Cada restricción debe estar marcada como `(MANDATORY)` y explicar el POR QUÉ. Anthropic enfatiza que Claude es inteligente: si entiende la razón, se adapta mejor que si simplemente sigue reglas rígidas.

```markdown
### 72-Combo FM Table (MANDATORY)
Every failure mode mechanism+cause combination must be validated against the
72-combo lookup table. This is non-negotiable because the 72 combinations
represent the complete universe of physically possible failure mechanisms for
industrial equipment, validated by 30+ years of RCM practice. Inventing
combinations outside this table creates maintenance strategies for failures
that cannot occur, wasting resources and eroding trust.
```

**Sección: Workflow Steps**
Organizados por milestone. Cada paso es imperativo y específico. A diferencia de los skills (que detallan sub-pasos y decisiones), el system prompt del agente describe el flujo general. Los detalles van en los skills que el agente consume.

**Sección: Tools Available**
Lista cada herramienta con una breve descripción de cuándo usarla. Esto complementa la descripción de la herramienta misma y ayuda al agente a decidir qué herramienta usar para cada situación.

### 5.5 Prompts para Agentes Orquestadores

Los agentes orquestadores necesitan secciones adicionales que los agentes especialistas no necesitan:

```markdown
## Specialist Agents You Coordinate
| Agent | Expertise | Model | When to Delegate |
|-------|-----------|-------|-----------------|
| Reliability Agent | RCM, FMECA, criticality | Opus | Milestones 1, 2, 3 |
| Planning Agent | Work packages, SAP export | Sonnet | Milestones 3, 4 |
| Spare Parts Agent | Material mapping, BOM | Haiku | Milestone 3 |

## Delegation Protocol
When delegating:
1. Provide clear context: what equipment, what has been done so far
2. Specify the expected output format
3. Include any constraints or special requirements from prior gates
4. Review the result before integrating into the session

## Decision Framework
Use this decision tree to determine the next action:
- If hierarchy is incomplete → Delegate to Reliability Agent
- If criticality not assessed → Delegate to Reliability Agent
- If failure modes not defined → Delegate to Reliability Agent
- If tasks not defined → Delegate to Planning Agent
- If materials not assigned → Delegate to Spare Parts Agent
- If SAP export needed → Delegate to Planning Agent (SAP mode)
```

### 5.6 Prompts para Agentes Especialistas

Los agentes especialistas necesitan una sección de scope boundaries que los orquestadores no necesitan:

```markdown
## Scope Boundaries
You ONLY handle [DOMAIN]. For requests outside your domain:
- Work packages, SAP export → This should be handled by Planning Agent
- Material assignments, BOM → This should be handled by Spare Parts Agent
- Milestone coordination, human approvals → This should be handled by Orchestrator

If you receive an out-of-scope request, respond with a clear message
indicating which agent should handle it. NEVER attempt out-of-scope work.
```

### 5.7 Anti-Patrones de System Prompts

| Anti-Patrón | Problema | Mejor Enfoque |
|-------------|----------|---------------|
| Prompt de 500+ líneas con todos los detalles inline | El agente pierde foco, las instrucciones más recientes en el prompt dominan sobre las primeras | Mantener el prompt en 80-200 líneas. Detalles de dominio van en skills y references |
| "Asegúrate de que todo sea correcto" | Vago, no actionable | "Ejecutar `validate_failure_modes` para cada failure mode definido. Si el score de validación es < 0.7, marcar para revisión humana" |
| Listar 50 herramientas sin categorizar | El agente no sabe cuándo usar cuál | Agrupar herramientas por fase o tipo. Describir cuándo usar cada una |
| Omitir las restricciones de scope | El agente intenta hacer trabajo de otros agentes, produciendo resultados mediocres | Definir explícitamente qué está dentro y fuera de scope |
| MUST/ALWAYS/NEVER sin explicar por qué | El agente sigue la regla literalmente pero no puede adaptarse a edge cases | Explicar la razón detrás de cada restricción |
| Copiar ejemplos del skill al prompt | Duplicación, desperdicio de contexto, se desactualizan | El prompt apunta al skill; el skill tiene los ejemplos |

### 5.8 Inyección Dinámica de Prompt

Anthropic recomienda construir system prompts dinámicamente basados en el contexto de la sesión:

```python
def build_system_prompt(agent_type: str, session: SessionState) -> str:
    # Prompt base (estático, del archivo .md)
    base = load_base_prompt(agent_type)

    # Inyección de contexto (dinámico)
    context = f"""
    <session_context>
    Equipment: {session.equipment_tag}
    Plant: {session.plant_code}
    Current milestone: {session.current_milestone}
    Completed: {session.completed_entities_summary()}
    Pending: {session.pending_work_summary()}
    </session_context>
    """

    # Inyección de skills relevantes (selectiva según la tarea actual)
    relevant_skills = select_skills_for_task(agent_type, session.current_task)
    skills_block = format_skills(relevant_skills)

    return f"{base}\n\n{context}\n\n{skills_block}"
```

**Insight clave:** El system prompt no es estático. Se ensambla en runtime basándose en el estado actual de la sesión, la tarea actual, y el conocimiento de dominio relevante. Esto mantiene el prompt enfocado y evita abrumar al modelo con información irrelevante.

---

## 6. Los Cinco Patrones de Workflow de Anthropic

Anthropic documenta cinco patrones canónicos de workflow, presentados en orden de complejidad creciente. La recomendación es **probar cada patrón en orden** y detenerse en el más simple que satisfaga las necesidades.

### 6.1 Patrón 1: Prompt Chaining (Encadenamiento)

Descomponer una tarea en una secuencia fija de llamadas LLM, donde el output de cada una alimenta el input de la siguiente. Gates programáticos entre pasos verifican outputs intermedios.

```
Input → [LLM Call 1] → Gate Check → [LLM Call 2] → Gate Check → [LLM Call 3] → Output
```

**Cuándo usar:** La tarea se descompone naturalmente en subtareas fijas y secuenciales. Cada subtarea es más simple que la tarea completa. Los pasos son predecibles.

**El Gate Check es crucial.** El gate entre pasos no es opcional; es lo que hace al prompt chaining fiable. Puede ser:
- Un check programático (¿Es JSON válido? ¿Tiene los campos requeridos?)
- Una llamada LLM ligera (¿El outline cubre todas las secciones requeridas?)
- Una regla de negocio determinista (¿El rating de criticidad está dentro de los valores permitidos?)

### 6.2 Patrón 2: Routing (Enrutamiento)

Clasificar el request entrante y dirigirlo a un handler especializado.

```
Input → [Classifier / Router] → Ruta A → [Handler Especializado A]
                               → Ruta B → [Handler Especializado B]
                               → Ruta C → [Handler Especializado C]
```

**Cuándo usar:** Tienes categorías distintas de tareas que requieren diferente manejo. Cada categoría se beneficia de un enfoque especializado (diferente prompt, herramientas, modelo).

**El Router puede ser:**
1. **Determinístico (keyword/regex):** Si el input contiene "criticidad" o "risk assessment", rutear al handler de fiabilidad. Rápido, barato, pero frágil.
2. **LLM-based (clasificador):** Usar un modelo rápido (Haiku) para clasificar el intent. Más flexible, maneja ambigüedad, pero agrega latencia.
3. **Híbrido:** Intentar determinístico primero, fallback a LLM para casos ambiguos.

**Cómo esto difiere de un agente con muchas herramientas:** El routing separa concerns más limpiamente. Cada handler tiene su propio system prompt optimizado, su propio set de herramientas, y potencialmente su propio modelo.

### 6.3 Patrón 3: Parallelization (Paralelización)

Ejecutar múltiples llamadas LLM simultáneamente y agregar los resultados.

**Variante A — Sectioning:** Dividir en subtareas independientes que corren en paralelo.
```
Input → [LLM Call 1] \
      → [LLM Call 2]  |→ Agregar → Output
      → [LLM Call N] /
```

**Variante B — Voting:** Ejecutar la misma tarea N veces y tomar la mejor / consenso.
```
Input → [LLM Call 1 (mismo prompt)] \
      → [LLM Call 2 (mismo prompt)]  |→ Votar / Seleccionar → Output
      → [LLM Call 3 (mismo prompt)] /
```

**Cuándo usar:** Sectioning cuando las subtareas son genuinamente independientes y el throughput importa. Voting cuando la precisión es crítica y quieres reducir varianza.

### 6.4 Patrón 4: Orchestrator-Workers (Orquestador-Trabajadores)

Un LLM central (el orquestador) descompone tareas dinámicamente y las delega a workers LLM. A diferencia del prompt chaining, el orquestador decide en runtime qué subtareas crear.

```
Input → [Orchestrator LLM]
           |→ Analizar tarea
           |→ Crear subtarea 1 → [Worker LLM] → Resultado 1
           |→ Analizar Resultado 1
           |→ Crear subtarea 2 → [Worker LLM] → Resultado 2
           |→ Sintetizar resultados → Output
```

**Cuándo usar:** Tareas complejas donde no puedes predecir las subtareas de antemano. El número y naturaleza de subtareas depende de resultados intermedios. Diferentes partes requieren diferente expertise.

**Cómo difiere del prompt chaining:** En prompt chaining, el desarrollador decide la secuencia en tiempo de código. En orchestrator-workers, el LLM decide la secuencia en runtime.

**Este es el patrón que nuestro sistema usa:** El workflow de 4 milestones es una cadena fija (prompt chaining a nivel macro), pero dentro de cada milestone, el orquestador delega dinámicamente a especialistas (orchestrator-workers a nivel micro).

### 6.5 Patrón 5: Evaluator-Optimizer (Evaluador-Optimizador)

Un LLM genera output, otro LLM lo evalúa contra criterios, y el generador itera basado en el feedback del evaluador. El loop continúa hasta que el evaluador está satisfecho o se alcanza un máximo de iteraciones.

```
[Generator LLM] → Output
  → [Evaluator LLM] → Feedback (pass/fail + crítica específica)
     → Si fail: [Generator] recibe feedback, produce output mejorado
     → Si pass: Aceptar output
```

**Cuándo usar:** Tienes criterios de evaluación claros y articulables. El refinamiento iterativo mejora la calidad de forma medible. La tarea se beneficia de múltiples pasadas.

**Cómo esto mapea a nuestro sistema:** Nuestra capa de validación (`run_full_validation`) es un evaluador determinístico. Se podría mejorar con un evaluador LLM que revise aspectos cualitativos: "¿Es esta FMECA realista para este tipo de equipo? ¿Los modos de falla están completos?"

---

## 7. Arquitecturas Multi-Agente

### 7.1 Patrón: Orquestador con Agentes Especialistas

Este es el patrón principal recomendado por Anthropic para sistemas complejos multi-dominio. Es el que nuestro sistema implementa.

```
                         [Operador Humano]
                              │
                    [Agente Orquestador]
                    /        │         \
        [Especialista A] [Especialista B] [Especialista C]
             │               │               │
        [Tools A1-A5]   [Tools B1-B5]   [Tools C1-C5]
```

**Principios de diseño:**

1. **Separación de concerns:** Cada especialista maneja un dominio. El orquestador maneja coordinación, no trabajo de dominio.
2. **Aislamiento de herramientas:** Cada especialista solo obtiene las herramientas relevantes a su dominio. El orquestador obtiene herramientas de coordinación (delegar, validar, presentar-al-humano) pero no herramientas de dominio.
3. **Especialización de prompt:** Cada especialista tiene un system prompt optimizado para su dominio, con ejemplos, terminología y procedimientos relevantes.
4. **Tiering de modelo:** Modelos potentes para razonamiento complejo (orquestador, especialistas complejos), modelos baratos para tareas rutinarias.
5. **Gestión de estado:** Store de estado compartido accesible por todos los agentes, con reglas claras de ownership (quién escribe qué).

### 7.2 Patrón: Pipeline con Etapas Especialistas

Para tareas con un flujo lineal natural:

```
[Input] → [Agente Etapa 1] → [Validación] → [Agente Etapa 2] → [Validación] → [Output]
```

Cada etapa es un agente especialista. El pipeline es controlado por código (no por un LLM). Más simple que el patrón de orquestador pero menos flexible.

**Cuándo usar:** Las etapas siempre se ejecutan en el mismo orden, cada etapa tiene contratos claros de input/output, y no necesitas re-routing dinámico.

### 7.3 Patrón: Swarm / Peer-to-Peer

Múltiples agentes que se comunican entre sí sin un coordinador central:

```
[Agent A] ←→ [Agent B] ←→ [Agent C]
    ↑              │              ↑
    │              ↓              │
    └───────── [Agent D] ─────────┘
```

Los agentes pueden hacer handoff directamente entre ellos. No hay coordinador central.

**Cuándo usar:** El workflow es no-lineal y el "siguiente paso" depende fuertemente del contexto. La orquestación centralizada sería un cuello de botella.

**Precaución de Anthropic:** Las arquitecturas swarm son las más difíciles de debuggear y testear. El path de ejecución es no-determinístico. Usar solo cuando la flexibilidad genuinamente justifica la complejidad.

### 7.4 Patrón: Evaluación en Capas

Para outputs de alto impacto que necesitan múltiples niveles de aseguramiento de calidad:

```
[Agente Generador] → [Nivel 1: Validación Programática]
                   → [Nivel 2: Agente Evaluador LLM]
                   → [Nivel 3: Revisión Humana]
```

Cada nivel captura diferentes tipos de errores:
- **Nivel 1:** Errores estructurales (violaciones de schema, campos faltantes, valores inválidos)
- **Nivel 2:** Errores semánticos (frecuencias irrealistas, análisis incompleto, lógica inconsistente)
- **Nivel 3:** Errores de dominio (juicio de ingeniería, cumplimiento regulatorio, requisitos del cliente)

### 7.5 El Enfoque Híbrido: La Arquitectura Recomendada para Sistemas Complejos

Anthropic recomienda un enfoque híbrido para sistemas de producción complejos como el nuestro:

```
Nivel de Workflow: Milestones fijos con gates (Prompt Chaining)
  Dentro de cada milestone: Comportamiento agéntico (Orchestrator-Workers)
    Dentro de cada delegación: Workflow enfocado (Prompt Chaining o tool use simple)
```

Esto combina la fiabilidad de los workflows (milestones predecibles, gates de calidad) con la flexibilidad de los agentes (delegación dinámica dentro de cada milestone).

---

## 8. Coordinación Multi-Agente

### 8.1 Sincronización de Estado: Single Writer, Multiple Readers

Cuando múltiples agentes operan sobre estado compartido, la regla más importante es:

**Cada tipo de entidad tiene exactamente un agente que puede escribirla. Todos los agentes pueden leer todas las entidades.**

| Entidad | Agente Writer | Agentes Readers |
|---------|--------------|-----------------|
| Nodos de jerarquía | Reliability Agent | Todos |
| Assessments de criticidad | Reliability Agent | Todos |
| Modos de falla | Reliability Agent | Todos |
| Tareas de mantenimiento | Planning Agent | Todos |
| Work packages | Planning Agent | Todos |
| Work instructions | Planning Agent | Todos |
| Asignaciones de materiales | Spare Parts Agent | Todos |
| Paquete SAP export | Planning Agent | Orquestador |

Esto previene escrituras conflictivas y hace el debugging directo.

### 8.2 Protocolo de Contexto para Delegación

Cuando el orquestador delega a un especialista, debe pasar un paquete de contexto estructurado:

```python
delegation_context = {
    # SIEMPRE incluir: Qué hacer
    "task": "Assess criticality for the following maintainable items",

    # SIEMPRE incluir: Qué inputs están disponibles
    "inputs": {
        "equipment_tag": "OCP-JFC-SAG-001",
        "maintainable_items": ["PMP-001", "BRG-003", "MTR-001"],
        "hierarchy": session.get("hierarchy"),
    },

    # SIEMPRE incluir: Qué formato devolver
    "expected_output": {
        "format": "JSON array of criticality assessments",
        "schema": "criticality_result_schema",
    },

    # INCLUIR CUANDO RELEVANTE: Resultados previos que afectan esta tarea
    "prior_context": {
        "criticality_already_assessed": ["PMP-002"],
        "known_constraints": ["JFC plant operates 24/7, availability is critical"],
    },

    # INCLUIR CUANDO RELEVANTE: Instrucciones especiales
    "special_instructions": "Client requires conservative ratings (round up when borderline)",
}
```

### 8.3 Protocolo de Propagación de Errores

Cuando un agente especialista encuentra un error:

```
Especialista encuentra error
  → Devuelve error estructurado al orquestador:
     {
       "status": "error",
       "error_type": "validation_failure" | "tool_error" | "insufficient_data" | "ambiguity",
       "message": "Descripción legible",
       "partial_results": { ... output parcial usable ... },
       "suggestions": ["Try providing more detail about X"],
       "severity": "blocking" | "degraded" | "informational"
     }

Orquestador recibe error
  → Si severity == "informational": Log y continuar
  → Si severity == "degraded": Aceptar resultados parciales, flag para revisión humana
  → Si severity == "blocking":
     → Intento 1: Reintentar con contexto adicional
     → Intento 2: Reintentar con modelo más potente
     → Intento 3: Escalar a operador humano
```

### 8.4 Gestión del Historial de Conversación

Anthropic recomienda diferentes estrategias según el patrón de coordinación:

**Para Orchestrator-Workers (nuestro patrón):**
- El orquestador mantiene su propio historial de conversación
- Cada worker recibe una conversación fresh para cada delegación (sin historial de delegaciones previas)
- El orquestador resume los resultados del worker y los agrega a su propio historial
- Esto previene la inflación de la context window mientras mantiene coherencia del orquestador

**Para Handoff Chains:**
- El historial completo se pasa de agente a agente
- La conversación crece con el tiempo (puede necesitar sumarización)

**Para Workers Paralelos:**
- Cada worker paralelo recibe una conversación independiente
- Los resultados se agregan por el coordinador después de que todos los workers completen
- No hay cross-talk entre workers paralelos

---

## 9. Guardrails: La Capa de Seguridad

### 9.1 Taxonomía Completa de Guardrails

**A. Guardrails de Input (Antes de que el Agente Reciba el Request)**

| Guardrail | Implementación | Propósito |
|-----------|---------------|-----------|
| Clasificación de tema | Clasificador LLM (Haiku) o keyword matching | Rechazar requests off-topic |
| Detección de prompt injection | Pattern matching + clasificación LLM | Prevenir inputs maliciosos |
| Validación de input | Validación de schema, type checking | Asegurar inputs bien formados |
| Rate limiting | Contadores de tokens, throttling | Prevenir abuso |

**B. Guardrails de Proceso (Durante la Ejecución del Agente)**

| Guardrail | Implementación | Propósito |
|-----------|---------------|-----------|
| Límite de max turns | Contador en agent loop | Prevenir loops infinitos |
| Max tokens por turno | Parámetro de API | Prevenir generación descontrolada |
| Timeout | Timer wall-clock | Prevenir agentes colgados |
| Checkpoint and resume | Serialización de estado | Habilitar recovery de crashes |
| Tracking de progreso | Conteo de entidades, milestones | Detectar agentes estancados |
| Detección de delegación circular | Tracking de cadena de delegación | Prevenir loops A→B→A→B |

**C. Guardrails de Output (Después de que el Agente Produzca Resultado)**

| Guardrail | Implementación | Propósito |
|-----------|---------------|-----------|
| Validación de schema | JSON Schema / Pydantic | Asegurar estructura correcta del output |
| Validación de reglas de negocio | Motor de reglas determinista | Asegurar cumplimiento de restricciones de dominio |
| Scoring de confianza | Auto-evaluación LLM o heurística | Flag outputs de baja confianza |
| Filtrado de datos sensibles | Regex + clasificación | Remover PII, credenciales |
| Etiquetado DRAFT | Header/watermark automático | Prevenir uso prematuro de outputs |

**D. Guardrails de Contenido (Reglas de Seguridad del Dominio)**

| Guardrail | Implementación | Propósito |
|-----------|---------------|-----------|
| Nunca auto-ejecutar acciones destructivas | Requerir confirmación humana | Prevenir pérdida de datos |
| Nunca fabricar datos numéricos | Requerir lookup de herramienta o disclaimer | Prevenir falsa precisión |
| Siempre citar fuentes | Instrucción en prompt + post-check | Habilitar verificación |
| Marcar incertidumbre | Instrucción en prompt | Transparencia de confianza |

### 9.2 Implementación del Claude Agent SDK

El Claude Agent SDK provee mecanismos de guardrail de primera clase:

```python
from agents import Agent, InputGuardrail, OutputGuardrail, GuardrailResult

# Guardrail de Input
async def check_for_off_topic(input_text: str) -> GuardrailResult:
    """Rechazar requests que no son de mantenimiento."""
    if not is_maintenance_related(input_text):
        return GuardrailResult(
            should_block=True,
            message="This system only handles maintenance-related requests."
        )
    return GuardrailResult(should_block=False)

# Guardrail de Output
async def validate_output_schema(output: str) -> GuardrailResult:
    """Asegurar que el output cumple el schema esperado."""
    try:
        data = json.loads(output)
        validate_against_schema(data)
        return GuardrailResult(should_block=False)
    except ValidationError as e:
        return GuardrailResult(
            should_block=True,
            message=f"Output validation failed: {e}"
        )

agent = Agent(
    name="Reliability Engineer",
    instructions="...",
    input_guardrails=[InputGuardrail(check_for_off_topic)],
    output_guardrails=[OutputGuardrail(validate_output_schema)],
)
```

---

## 10. Patrones de Manejo de Errores

### 10.1 Patrón 1: Returns Estructurados de Herramientas

```python
class ToolResult:
    status: Literal["success", "error", "partial"]
    data: dict | None
    error_message: str | None
    error_code: str | None
    suggestions: list[str]
    retryable: bool
```

Nunca lanzar excepciones desde herramientas. Siempre devolver un resultado estructurado que el agente pueda interpretar y actuar.

### 10.2 Patrón 2: Escalación de Modelo

```python
MODEL_ESCALATION_CHAIN = [
    "claude-haiku-4-5-20251001",       # Intento 1: rápido y barato
    "claude-sonnet-4-5-20250929",      # Intento 2: balanced
    "claude-opus-4-6",                 # Intento 3: máximo poder
]

async def run_with_escalation(agent_config, input_text, validators):
    for model in MODEL_ESCALATION_CHAIN:
        agent_config.model = model
        result = await agent.run(input_text)
        if all(v(result) for v in validators):
            return result  # Éxito
    # Todos los modelos fallaron — escalar a humano
    return escalate_to_human(input_text, all_results)
```

### 10.3 Patrón 3: Circuit Breaker

Dejar de llamar a una herramienta que falla repetidamente:

```python
class CircuitBreaker:
    """Detiene llamadas a una herramienta después de demasiados fallos consecutivos."""

    def __init__(self, failure_threshold=5, reset_timeout=300):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.state = "closed"  # closed (normal), open (bloqueando), half-open (probando)

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time_since_last_failure > self.reset_timeout:
                self.state = "half-open"
            else:
                return {"error": "Circuit breaker open — tool temporarily unavailable"}

        try:
            result = func(*args, **kwargs)
            self.failure_count = 0
            self.state = "closed"
            return result
        except Exception:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            raise
```

---

## 11. Testing y Evaluación de Agentes

### 11.1 Framework de Testing de Tres Niveles

**Nivel 1: Unit Tests de Herramientas**

Verifican que cada herramienta funciona correctamente de forma aislada:

```python
def test_assess_criticality_valid_input():
    result = assess_criticality(
        equipment_tag="OCP-JFC-SAG-001-PMP-001",
        consequence_data={"safety": 3, "environmental": 2, "production": 4}
    )
    data = json.loads(result)
    assert data["criticality_rating"] in ["A", "B", "C"]
    assert 1 <= data["overall_score"] <= 5

def test_assess_criticality_invalid_tag():
    result = assess_criticality(equipment_tag="INVALID")
    data = json.loads(result)
    assert "error" in data
```

**Nivel 2: Tests de Decisión del Agente**

Verifican que el agente llama a las herramientas correctas para cada tipo de tarea:

```python
def test_reliability_agent_uses_correct_tools():
    """Verificar que el agente llama las tools correctas para una tarea de criticidad."""
    agent = create_reliability_agent()
    result = agent.run("Assess criticality for SAG Mill pinion bearing")

    tool_calls = extract_tool_calls(result.conversation_history)
    assert any(tc.name == "assess_criticality" for tc in tool_calls)
    # No debería llamar a tools de planning
    assert not any(tc.name == "group_backlog" for tc in tool_calls)

def test_orchestrator_delegates_correctly():
    """Verificar que el orquestador rutea al especialista correcto."""
    orchestrator = create_orchestrator()
    result = orchestrator.run("Build the equipment hierarchy for SAG Mill 001")

    delegations = extract_delegations(result.conversation_history)
    assert delegations[0].target_agent == "reliability"
```

**Nivel 3: Tests End-to-End de Workflow**

Verifican el flujo completo de un milestone:

```python
def test_full_milestone_1():
    """Test del workflow completo del Milestone 1."""
    def auto_approve(milestone_num, summary):
        return ("approve", "Looks good")

    workflow = StrategyWorkflow(human_approval_fn=auto_approve)
    session = workflow.run("SAG Mill 001", plant_code="OCP-JFC")

    assert session.get_entity_counts()["hierarchy_nodes"] > 0
    assert session.get_entity_counts()["criticality_assessments"] > 0
    assert session.milestones[0].status == MilestoneStatus.APPROVED
```

### 11.2 Métricas de Evaluación

Anthropic recomienda trackear estas métricas para sistemas agénticos:

**Métricas de Precisión:**
| Métrica | Descripción | Target |
|---------|-------------|--------|
| Tasa de completación de tareas | % de tareas completadas exitosamente | ≥ 90% |
| Precisión de selección de herramienta | % de tool calls apropiadas para la tarea | ≥ 95% |
| Tasa de validación en primer intento | % de outputs que pasan validación al primer intento | ≥ 80% |

**Métricas de Eficiencia:**
| Métrica | Descripción | Target |
|---------|-------------|--------|
| Turnos hasta completación | Promedio de llamadas LLM por tarea | Minimizar |
| Uso de tokens | Total input + output tokens por tarea | Monitorear |
| Latencia | Tiempo wall-clock de request a completación | < 5 min por milestone |
| Costo por tarea | Costo en USD por tarea completada | < $5 para milestone completo |

**Métricas de Fiabilidad:**
| Métrica | Descripción | Target |
|---------|-------------|--------|
| Tasa de error | % de tareas que fallan o producen errores | < 5% |
| Tasa de recuperación | % de errores recuperados automáticamente | ≥ 80% |
| Tasa de escalación | % de tareas que requieren intervención humana | < 10% |
| Consistencia | Varianza en calidad del output con inputs idénticos | Baja |

### 11.3 El Loop de Desarrollo Dirigido por Evaluaciones

```
1. Definir suite de evals (test cases con outcomes esperados)
2. Construir el agente más simple que podría pasar los evals
3. Ejecutar evals, identificar fallos
4. Analizar modos de fallo:
   a. Descripción de herramienta poco clara → Mejorar descripciones de tools
   b. Agente eligió herramienta incorrecta → Mejorar instrucciones de routing en prompt
   c. Agente pasó parámetros incorrectos → Mejorar descripciones de parámetros
   d. Agente se detuvo demasiado pronto → Ajustar prompt para ser más exhaustivo
   e. Agente loopea infinitamente → Agregar max_turns, mejorar condiciones de parada
5. Corregir el modo de fallo de mayor impacto
6. Re-ejecutar evals
7. Repetir hasta alcanzar target de pass rate
```

**Insight clave de Anthropic:** La mayoría de los fallos de agentes son causados por descripciones de herramientas pobres o system prompts poco claros, NO por limitaciones de capacidad del modelo. Antes de escalar a un modelo más potente, primero optimiza tus herramientas y prompts.

---

## 12. Observabilidad y Trazabilidad

### 12.1 El AgentTrace

Cada acción significativa del agente debe generar un trace:

```python
@dataclass
class AgentTrace:
    session_id: str
    agent_name: str
    timestamp: datetime
    event_type: str  # "llm_call", "tool_use", "delegation", "error", "gate_check"
    input_summary: str
    output_summary: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    tool_name: str | None
    error: str | None
```

### 12.2 Control de Costos

```python
class CostTracker:
    def __init__(self, max_budget_usd: float = 10.0):
        self.max_budget = max_budget_usd
        self.total_cost = 0.0

    def track(self, input_tokens: int, output_tokens: int, model: str):
        cost = calculate_cost(input_tokens, output_tokens, model)
        self.total_cost += cost
        if self.total_cost > self.max_budget:
            raise BudgetExceeded(
                f"Session cost ${self.total_cost:.2f} exceeds budget ${self.max_budget:.2f}"
            )
```

### 12.3 Checkpoint y Resume

Serializar el estado de sesión después de cada milestone para que el workflow pueda resumirse desde el último checkpoint tras un crash:

```python
def checkpoint(session: SessionState, milestone: int):
    state_json = session.to_json()
    Path(f"checkpoints/{session.session_id}_m{milestone}.json").write_text(state_json)

def resume_from_checkpoint(session_id: str) -> tuple[SessionState, int]:
    checkpoints = sorted(glob(f"checkpoints/{session_id}_m*.json"))
    if not checkpoints:
        return SessionState(session_id=session_id), 0
    latest = checkpoints[-1]
    milestone = int(latest.split("_m")[1].split(".")[0])
    session = SessionState.from_json(Path(latest).read_text())
    return session, milestone
```

---

## 13. Registro y Gobernanza de Agentes

### 13.1 El Registro de Agentes

Mantén un documento centralizado que catalogue todos los agentes activos:

```markdown
# Registro de Agentes VSC

| ID | Nombre | Tipo | Modelo | Max Turns | Milestones | Estado | Última Rev. |
|----|--------|------|--------|-----------|------------|--------|-------------|
| AG-001 | Orchestrator | Coordinador | Sonnet | 20 | Todos | Producción | 2026-02-24 |
| AG-002 | Reliability | Especialista | Opus | 40 | 1, 2, 3 | Producción | 2026-02-24 |
| AG-003 | Planning | Especialista | Sonnet | 30 | 3, 4 | Producción | 2026-02-24 |
| AG-004 | Spare Parts | Especialista | Haiku | 15 | 3 | Producción | 2026-02-24 |
```

### 13.2 Ciclo de Vida de un Agente

```
Draft → Beta → Producción → Archivado

Draft:       Agente en desarrollo. Solo el creador lo usa.
             Prompt y herramientas pueden cambiar frecuentemente.
Beta:        Pasó tests de decisión y workflow básicos.
             Se prueba en sesiones reales con supervisión.
Producción:  Battle-tested por al menos 2 semanas.
             Resultados consistentes y predecibles.
Archivado:   El dominio que servía ya no existe o fue
             absorbido por otro agente.
```

### 13.3 Versionado

Cada agente sigue versionado semántico:

- **Major (1.0 → 2.0):** Cambio fundamental en el rol, herramientas, o arquitectura del agente.
- **Minor (1.0 → 1.1):** Nuevas herramientas, mejoras en el prompt, optimización de model tiering.
- **Patch (1.1 → 1.1.1):** Corrección de bugs en herramientas, typos en el prompt.

### 13.4 Mapa de Dependencias entre Agentes

```markdown
| Agente | Depende de | Tipo de Dependencia |
|--------|-----------|---------------------|
| AG-002 (Reliability) | AG-001 (Orchestrator) | Recibe delegaciones del orquestador |
| AG-003 (Planning) | AG-002 (Reliability) | Consume output de reliability (failure modes, tareas) |
| AG-004 (Spare Parts) | AG-003 (Planning) | Consume tasks con REPLACE del planning agent |
| AG-001 (Orchestrator) | AG-002, AG-003, AG-004 | Coordina a todos los especialistas |
```

### 13.5 Mapa de Herramientas por Agente

```markdown
| Herramienta | AG-001 | AG-002 | AG-003 | AG-004 | Tipo |
|-------------|--------|--------|--------|--------|------|
| assess_criticality | | ✅ Writer | | | Domain |
| validate_failure_modes | | ✅ Writer | | | Domain |
| group_backlog | | | ✅ Writer | | Domain |
| export_to_sap | | | ✅ Writer | | Domain |
| suggest_materials | | | | ✅ Writer | Domain |
| run_full_validation | ✅ | | | | Coordination |
| present_gate_summary | ✅ | | | | Coordination |
```

---

## 14. Principios de Fiabilidad para Agentes

### 14.1 Idempotencia

Todas las herramientas deben ser idempotentes — llamarlas dos veces con el mismo input debe producir el mismo resultado. Esto habilita retries seguros sin efectos secundarios.

### 14.2 Determinístico Antes de Estocástico

Ejecutar checks determinísticos primero, luego checks basados en LLM:

```
Input → Schema validation (instantáneo, gratis)
      → Business rule validation (instantáneo, gratis)
      → LLM-based quality evaluation (lento, costoso) — solo si los checks previos pasan
```

### 14.3 Human-in-the-Loop en Cada Gate

Nuestro sistema implementa este principio: ningún milestone avanza sin aprobación humana explícita (APPROVE). REJECT detiene todo. MODIFY re-ejecuta el milestone actual con feedback.

```
PENDING → IN_PROGRESS → PRESENTED → APPROVED (avanzar)
                                  │→ MODIFIED (re-ejecutar como IN_PROGRESS)
                                  │→ REJECTED (detener workflow)
```

### 14.4 Outputs Marcados como DRAFT

Nada se auto-envía a sistemas de producción (SAP, bases de datos operativas). Todos los outputs se etiquetan explícitamente como DRAFT. El humano decide cuándo un DRAFT se convierte en un documento final.

### 14.5 Temperature 0.0 para Agentes de Dominio

Todos los agentes de dominio técnico (ingeniería, mantenimiento, fiabilidad) deben usar temperature 0.0 para outputs determinísticos. La creatividad no es deseable en una FMECA o un cálculo de criticidad.

---

## 15. Checklist Maestro para Crear un Agente Nuevo

### Carpeta del Agente
- [ ] El agente tiene su propia carpeta en `agents/{agent-name}/`
- [ ] La carpeta contiene `CLAUDE.md`, `skills.yaml`, y `config.py` como mínimo
- [ ] El nombre de la carpeta es descriptivo en kebab-case (`reliability`, `spare-parts`, no `agent-1`)
- [ ] El modelo está seleccionado según el nivel de razonamiento requerido (Haiku/Sonnet/Opus)
- [ ] `max_turns` está configurado con un límite conservador
- [ ] `temperature` es 0.0 para agentes de dominio técnico

### CLAUDE.md (System Prompt)
- [ ] El CLAUDE.md está en `agents/{agent-name}/CLAUDE.md`
- [ ] El CLAUDE.md tiene < 200 líneas
- [ ] Incluye las secciones: Role, Expertise, Critical Constraints, Workflow Steps, Quality Checks, Tools Available
- [ ] Cada constraint tiene la etiqueta `(MANDATORY)` y explica el POR QUÉ
- [ ] Los scope boundaries están definidos (qué NO debe hacer este agente)
- [ ] Hay al menos un worked example

### skills.yaml (Mapeo de Skills)

- [ ] El `skills.yaml` está en `agents/{agent-name}/skills.yaml`
- [ ] Cada skill tiene `name`, `path`, `load_level`, `milestone`, y `mandatory`
- [ ] Los `name` de cada skill coinciden con el `name` del YAML front matter del CLAUDE.md del skill
- [ ] Los `path` apuntan a archivos que existen
- [ ] Los skills mandatory cubren todos los milestones donde participa el agente
- [ ] La sección `knowledge_base` lista los documentos de referencia con `load_when`
- [ ] El `AGENT_REGISTRY.md` en la raíz de `agents/` está actualizado con este agente

### Herramientas

- [ ] Las herramientas están registradas con `@tool` decorator en `tool_wrappers/{domain}_tools.py`
- [ ] Cada herramienta tiene nombre `verb_noun`, descripción clara, y schema de parámetros
- [ ] Las herramientas devuelven JSON estructurado, no texto libre
- [ ] Los errores se devuelven como datos, no como excepciones
- [ ] El agente tiene entre 3-15 herramientas (si tiene más de 15, considerar dividir el agente)
- [ ] El `AGENT_TOOL_MAP` en `tool_wrappers/server.py` está actualizado

### Coordinación

- [ ] El agente está registrado en `agents/AGENT_REGISTRY.md`
- [ ] Las dependencias con otros agentes están documentadas
- [ ] El protocolo de delegación está definido (qué contexto recibe, qué formato devuelve)
- [ ] El Single Writer ownership está asignado (qué entidades escribe)

### Testing
- [ ] Existen unit tests para cada herramienta del agente
- [ ] Existen tests de decisión que verifican selección correcta de herramientas
- [ ] Se ha ejecutado al menos un test end-to-end del milestone donde participa
- [ ] Las métricas de evaluación (completación, precisión, eficiencia) están por encima de los targets

### Guardrails
- [ ] El agente tiene un guardrail de input (al menos topic classification)
- [ ] El agente tiene un guardrail de output (al menos schema validation)
- [ ] El control de costos está configurado (max budget por sesión)
- [ ] Los outputs están marcados como DRAFT

---

## 16. Template Rápido: System Prompt de Agente

```markdown
# {Agent Name} Agent — System Prompt

## Your Role
- You are the **{Role Name}** of the multi-agent {system description}.
- You {primary responsibility 1}.
- You {primary responsibility 2}.
- You receive delegations from the Orchestrator with {what kind of tasks}.
- You return structured results (JSON) to feed the session state.
- You participate in Milestones {N, M}.
- You NEVER {out-of-scope action 1} — that belongs to {Other Agent}.

## Your Expertise
- {Area 1}: {brief description}
- {Area 2}: {brief description}
- {Area N}: {brief description}

## Critical Constraints

### {Constraint Name} (MANDATORY)
{Description of the constraint with the WHY behind it.
Explain what goes wrong if this constraint is violated.}

### {Constraint Name} (MANDATORY)
{Description + reasoning.}

## Workflow Steps

### Milestone {N}: {Name}
1. {Step 1 — imperative, specific}
2. {Step 2}
3. {Step 3}

### Milestone {M}: {Name}
1. {Step 1}
2. {Step 2}

## Scope Boundaries
You ONLY handle {DOMAIN}. For requests outside your domain:
- {Out-of-scope task 1} → handled by {Other Agent}
- {Out-of-scope task 2} → handled by {Other Agent}
If you receive an out-of-scope request, respond clearly indicating which agent should handle it.

## Skills Assigned

These are the skills you consume. Each skill provides detailed procedures,
decision tables, and domain knowledge for a specific task. Read the skill's
CLAUDE.md BEFORE executing the corresponding task.

### Milestone {N} Skills
| Skill | Path | Mandatory | When to Load |
|-------|------|:---------:|--------------|
| {skill-name-1} | `skills/{category}/{skill-name-1}/CLAUDE.md` | Yes | Before {task description} |
| {skill-name-2} | `skills/{category}/{skill-name-2}/CLAUDE.md` | Yes | Before {task description} |
| {skill-name-3} | `skills/{category}/{skill-name-3}/CLAUDE.md` | No | Only when {condition} |

### Milestone {M} Skills
| Skill | Path | Mandatory | When to Load |
|-------|------|:---------:|--------------|
| {skill-name-4} | `skills/{category}/{skill-name-4}/CLAUDE.md` | Yes | Before {task description} |

### Knowledge Base References
| Document | Path | When to Consult |
|----------|------|-----------------|
| {doc-name-1} | `skills/00-knowledge-base/{path}` | When you need {context} |
| {doc-name-2} | `skills/00-knowledge-base/{path}` | When you need {context} |

## {Methodology} References
- {REF-XX}: {brief description, when to consult}
- {REF-YY}: {brief description, when to consult}

## Quality Checks
1. {Check 1}
2. {Check 2}
3. {Check N}

## Tools Available
- `{tool_name_1}`: {when to use, what it returns}
- `{tool_name_2}`: {when to use, what it returns}
- `{tool_name_N}`: {when to use, what it returns}
```

---

## 17. Template Rápido: AgentConfig en Python

Este archivo vive en `agents/{agent-name}/config.py`:

```python
# agents/{agent_name}/config.py
from agents._shared.base import AgentConfig, Agent

def create_{agent_name}_agent() -> Agent:
    """Factory para el agente de {dominio}."""
    config = AgentConfig(
        name="{Agent Name}",
        model="claude-{tier}-{version}",        # haiku/sonnet/opus
        agent_dir="agents/{agent-name}",         # Carpeta del agente
        tools=[
            "tool_name_1",
            "tool_name_2",
            "tool_name_n",
        ],
        max_turns={N},                           # Conservador: 15-40 según complejidad
        temperature=0.0,                         # Siempre 0.0 para dominio técnico
    )
    return Agent(config)
```

---

## 18. Relación Agentes-Skills: Cómo se Integran

### 18.1 El Flujo de Carga

```
1. El Orchestrator recibe un request del humano
2. El Orchestrator identifica el milestone actual y decide delegar a un agente especialista
3. El agente especialista se inicializa:
   a. Se carga su CLAUDE.md (agents/{agent}/CLAUDE.md)
   b. Se lee su skills.yaml (agents/{agent}/skills.yaml)
   c. Se filtran los skills que aplican al milestone actual
   d. Los skills mandatory se cargan al load_level configurado:
      - load_level 1: Solo YAML front matter (mínimo contexto)
      - load_level 2: Body completo del CLAUDE.md + references preloaded
      - load_level 3: Solo punteros, references se leen bajo demanda
   e. Los skills opcionales se cargan al nivel 1 (front matter) por defecto,
      y se promueven al nivel configurado solo si el agente los necesita
4. El system prompt se ensambla dinámicamente:
   prompt_final = base_prompt + session_context + loaded_skills
5. El agente ejecuta su agent loop con el prompt enriquecido
6. Durante la ejecución, el agente puede:
   a. Usar herramientas de tool_wrappers/
   b. Leer references de skills bajo demanda (punteros del skill indican cuáles)
   c. Ejecutar scripts de skills sin cargarlos en contexto
   d. Consultar documentos de knowledge_base listados en su YAML
```

**Diferencia con el triggering semántico:** El mecanismo anterior (`use_skills=True`) dependía de que el YAML front matter del skill hiciera match semántico con la tarea actual. Esto tenía una tasa de activación del ~50-72%. El nuevo mecanismo es **declarativo y determinista**: el archivo YAML dice exactamente qué skills carga cada agente en cada milestone. La tasa de activación es 100% para skills mandatory.

### 18.2 Cuándo el Conocimiento va en el Prompt vs. en un Skill

| Pregunta | Si la respuesta es SÍ | Dónde va |
|----------|----------------------|----------|
| ¿Este conocimiento aplica SIEMPRE que el agente opera? | Sí | System prompt del agente |
| ¿Este conocimiento solo aplica para CIERTOS tipos de tareas? | Sí | Skill + references |
| ¿Es una restricción de identidad del agente? | Sí | System prompt |
| ¿Es un procedimiento detallado paso-a-paso? | Sí | Skill |
| ¿Son tablas de datos, catálogos, o templates? | Sí | Skill references |
| ¿Es código que se ejecuta determinísticamente? | Sí | Skill scripts |

---

## 19. Principios Finales

1. **Empieza simple.** Usa un solo LLM aumentado antes de agregar workflows. Usa workflows antes de agregar agentes. La complejidad es cara.

2. **Invierte en calidad de herramientas.** Las descripciones de herramientas, schemas de parámetros, y manejo de errores son la inversión de mayor apalancamiento. La mayoría de los fallos de agentes se rastrean hasta problemas de herramientas.

3. **Mantén el scope estrecho.** Un agente con 5 herramientas que maneja un dominio bien es mejor que un agente con 50 herramientas que maneja todo mal.

4. **Usa el modelo correcto para el trabajo.** Haiku para clasificación y routing. Sonnet para la mayoría del trabajo agéntico. Opus para razonamiento complejo y orquestación.

5. **Agrega gates y validación entre pasos.** Los checks programáticos son seguro barato contra propagación de errores. Cada paso del workflow debe tener un quality gate.

6. **Diseña para supervisión humana.** Los humanos deben aprobar outputs de alto impacto. El sistema debe facilitar la revisión, modificación y aprobación.

7. **Logea todo.** No puedes mejorar lo que no puedes medir. Logea cada llamada LLM, invocación de herramienta, y decisión.

8. **Testea en tres niveles.** Unit test de herramientas, behavior test de agentes, end-to-end test de workflows.

9. **Maneja errores gracefully.** Las herramientas devuelven errores estructurados. Los agentes reintentan inteligentemente. Los workflows escalan a humanos cuando se atascan.

10. **Itera basándote en resultados de evaluación.** Define tu suite de evals primero, luego construye el sistema más simple que pase. Mejora basándote en análisis de fallos, no en intuición.

11. **Temperature 0.0 para dominio técnico.** La creatividad no es una virtud cuando calculas criticidad de equipos o defines modos de falla.

12. **Single Writer, Multiple Readers.** Cada entidad tiene exactamente un agente que la escribe. Todos pueden leer. Esto previene conflictos y simplifica debugging.

13. **El prompt del agente es la identidad, no el procedimiento.** Mantener el prompt en 80-200 líneas con la identidad, restricciones y herramientas. Los procedimientos detallados van en skills.

14. **Checkpoint después de cada milestone.** Si el sistema crashea, puedes retomar desde el último checkpoint sin repetir trabajo costoso.

15. **Los anti-patrones más comunes son: (a) agente con demasiadas herramientas, (b) prompts monolíticos, (c) sin max_turns, (d) descripciones de herramientas vagas, y (e) sin validación entre pasos.** Revisa estos cinco primero cuando algo falla.

---

## Changelog

### v1.0 (2026-02-24)
- Versión inicial del documento
- Estructura de carpetas para sistema multi-agente
- 5 patrones de workflow de Anthropic documentados
- 4 arquitecturas multi-agente documentadas
- Taxonomía completa de guardrails
- Framework de testing de 3 niveles
- Templates de system prompt y AgentConfig
- Checklist maestro de creación de agentes
- 15 principios finales
