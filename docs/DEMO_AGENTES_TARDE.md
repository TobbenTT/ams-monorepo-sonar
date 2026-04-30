# Script Demo Agentes IA — Reunión Gonzalo (tarde 30-Abr)

URL: https://www.mageam.com → Login Quick Access "admin Administrator" → Sign In

## 1. /agentic-capabilities — Vista general (1 min)

- Mostrar Capa 1-5 con cards `live` (verde)
- Scroll a **Capa 6 — Phase 2**: 22 cards
- Destacar: **#33-40 RAG live** + **#50 Programmer Agent live** + **#51 Supervisor Agent live**

## 2. Programmer Agent (Excel Jorge r49) — 3 min

Click card #50 "Programmer Agent" → /programmer-agent

### Tab #8 Disponibilidad por equipo
- 6 equipos calculados sobre OTs reales
- Worst: **CRU-CON-HP-02 → 52% (80h downtime)**
- Best: SUB-MT-P01 → 92.4%
- Por día turno día/noche

### Tab #11 Reporte semanal
- KPIs: 8 OTs / 2 críticas P2 / 113.5h / $5,164
- Tareas críticas listadas (THK-REL-02 + TRF-PRI-01)
- Histórico 3 semanas anteriores (486h → 236h → 240h)
- Forecast móvil 4 semanas

**Bullet cubierto:** disponibilidad ofrecida + reporte semanal con costos + histórico + horizonte.

## 3. Supervisor Agent (Excel Jorge r64) — 3 min

Click card #51 "Supervisor Agent" → /supervisor-agent

### Tab #1 Shift Readiness
- Inputs: ausentes + equipos no disponibles
- Demo: dejar vacío → click "Analizar readiness"
- Muestra: **HH 110 plan / 60 disp / GAP 50 / cobertura 54%**
- 🤖 **Claude responde JSON** con `can_execute_full_program: false` + acciones priorizadas
- (Si quieres mostrar caso crítico: poner 2 IDs de trabajadores ausentes — gap sube a 74h)

### Tab #2 Producción vs Programa
- Inputs default: meta 12000 ton / real 11200 / 92% vs 87% disp
- Click "Analizar impacto"
- 🤖 Claude diagnóstico: alignment, recommended actions, decision_required

**Bullet cubierto:** HH real con ausentismo + impacto programa vs metas producción.

## 4. RAG Lab Phase 2 — 4 min

Click card #33-40 (cualquiera) → /rag-lab

### Tab #33 RCM Strategy Advisor
- Inputs default: 343-PP-001 / cavitación recurrente
- Click "Generar estrategia RCM"
- ⏳ ~15-20 seg (Claude + retrieval LanceDB)
- Devuelve JSON: strategy "redesign" + key_tasks (NPSH cálculo, etc.)
- **4 fuentes recuperadas** mostradas abajo (manuales + OTs históricas)

### Tab #34 Shift Handover
- Click "Generar handover"
- Markdown: RESUMEN + PRIORIDADES + RIESGOS + ACCIONES INMEDIATAS

### Tab #35 Post-Maintenance Learning
- Click "Capturar lección"
- Toast: "Indexado 1 chunk en lessons_learned"
- Si outcome=recurrent → Claude analiza causa raíz

### Tab #40 KB Curator
- Click "Curar entrada"
- Devuelve: action=add, categoría auto, tags, dedup count

**Stack:** LanceDB + sentence-transformers MiniLM multilingual + Claude Sonnet 4.6 con lazy load (idle = 0 RAM, peak ~1.5GB).

## 5. AI Priority Decision (bullet bonus) — 2 min

/work-requests → click ojo en cualquier AV con badge "🤖 IA sugiere P3→P1"

- Banner full-width purple aparece arriba del modal
- "Tu prioridad: P3 → IA sugiere: P1" + razón
- 2 botones: ✓ Aceptar sugerencia / ✗ Mantener P3
- **Jorge:** "la IA sugiere, no modifica"

## Datos clave a remarcar

- **Reunión Gonzalo / Jorge / Magdalena / José contexto:** Excel "Bullets Work Management, KPI, Otros.xlsx" → 28 bullets agénticos
- **Implementados explícitos (sesión hoy):** 4 (Programador #8 + #11, Supervisor #1 + #2)
- **Phase 2 RAG live:** 4 (#33, #34, #35, #40)
- **Cubiertos por features previos:** ~12 (Mantenedor 100%, Programador parcial, Planificador parcial)
- **Stack RAG en VPS:** LanceDB + MiniLM + Claude lazy load — idle 0, peak 1.5GB, disco +2.5GB

## Si preguntan qué falta

- **Planificador completo (~8 bullets puros)** — rol no tocado aún
- **Programador #2/#5/#6/#9** — partes mecánicas
- ETA realista: 2 sprints más de trabajo dedicado a agentes

## Backup tag

`backup-2026-04-30-agentes-jorge-completos` — rollback en VPS si algo falla.
