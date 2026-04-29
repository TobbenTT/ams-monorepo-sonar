# MAGEAM — Funciones Agénticas (Presentación)

> Documento solicitado por Jorge en transcript 2026-04-29 13:44, líneas 561-565:
> *"tema de las funciones de agentes, como para introducirlas... algo para la presentación de la herramienta"*.
>
> Pensado para que Jorge lo use al presentar MAGEAM a clientes, a José Cortinat (auditor) o a Magdalena Ortega. Estructura tipo guion: una página abre, una hoja por capacidad, demos concretas, y un cierre con pitch comercial.

---

## 1. Mensaje principal (slide de apertura — 1 minuto)

**MAGEAM no es otro SAP. Es la capa agéntica que SAP nunca tuvo.**

SAP PM resuelve la transaccional: registra el aviso, crea la OT, imprime la hoja de ruta. Lo que SAP no hace es **pensar por el usuario**:
- No te avisa si el aviso que estás escribiendo ya existe.
- No te recomienda un técnico considerando skills + carga + turno.
- No detecta cuando una falla se está volviendo crónica.
- No filtra los avisos que no llegaron al 80% del Pareto para decirte que estás enfocando mal el esfuerzo.
- No te sugiere repuestos antes de que se quiebren.
- No le saca el comentario al mantenedor por voz mientras camina con guantes y casco.

MAGEAM hace exactamente eso. **Encima** de SAP, no en lugar de.

---

## 2. Las funciones agrupadas por audiencia

### Para el **mantenedor en terreno** (entrada de información)

| # | Capacidad | Lo que ahorra |
|---|---|---|
| 1 | Foto del defecto → vision AI identifica equipo + falla | 5 min de tipeo, 0 errores de TAG |
| 2 | Dictado por voz → IA estructura el aviso completo | Aviso creado caminando con guantes y casco |
| 3 | Detección de duplicado mientras escribe | Evita re-trabajo + gasto en repuestos repetidos |
| 4 | Auto-clasificación SAP (M001/M002, planning_group, work_center) | El mantenedor no tiene que conocer el catálogo SAP |

### Para el **supervisor** (validación + planificación express)

| # | Capacidad | Lo que ahorra |
|---|---|---|
| 5 | Aviso P1 → OT PM03 en 1 click | 5 transacciones SAP = 1 botón |
| 6 | Smart Assignment con IA (skills + HH + turno) | El supervisor no rankea a mano |
| 7 | Auto-Level capacity-aware (nivela carga + difiere por equipo de apoyo) | Evita reprogramar al día siguiente |
| 8 | Bloqueo PM01/PM02 con prioridad P1 (regla anti-contaminación KPI) | SAP deja reusar y contamina KPIs |
| 9 | Cancelación con tipología + linkeo a OT absorbente | SAP cancela sin trazabilidad |

### Para el **planificador** (calidad + completitud)

| # | Capacidad | Lo que ahorra |
|---|---|---|
| 10 | Sugerencia de repuestos basada en historial del equipo + manuales | Reduce quiebres de stock por OT |
| 11 | Validación checklist pre-aprobación (priority + failure_mode + spare parts + personnel) | OTs liberadas con info incompleta |
| 12 | Forecast de stock cruzando consumo histórico 90d + demanda planificada 60d | OC recomendada antes de quiebre |
| 13 | Alertas proactivas de costo cuando real > 110% plan | Detección temprana de desvío de gasto |

### Para el **ingeniero de confiabilidad** (análisis profundo)

| # | Capacidad | Lo que ahorra |
|---|---|---|
| 14 | Pareto + Jack-Knife sobre data Jigsaw real (upload Excel) | Análisis manual en Excel = 1 día → 3 segundos |
| 15 | Detección de fallas crónicas (≥3 repeticiones en 7d) | RCA gatillado antes de que escale a catastrófica |
| 16 | Cruce de avisos × Pareto (¿estamos enfocando mal?) | Visualiza esfuerzo mal dirigido |
| 17 | Auto-trigger RCA cuando se detecta cluster crítico | RCA no se olvida ni queda en hoja Excel del ingeniero |
| 18 | Push de defecto → FMECA worksheet con RPN before/after | Cierra el loop mejora continua → estrategia |

### Para el **gerente** (visión consolidada)

| # | Capacidad | Lo que ahorra |
|---|---|---|
| 19 | Performance Analysis con 19 secciones (resultados + disciplina + costo) | Hoja Excel mensual = sección automática |
| 20 | Cost analysis por UT + cost element con árbol jerárquico | Drill-down sin SAP-ECC |
| 21 | Causas de no-cumplimiento auto-clasificadas (repuesto / operaciones / servicio externo / herramienta) | Identificar el cuello de botella sistémico |
| 22 | Comparativa OTs similares (mejor/promedio/peor caso por work_center) | Detectar técnico/cuadrilla con outlier |

---

## 3. Demos sugeridas (5–10 minutos cada una)

### Demo 1 — Mantenedor en terreno (3 min)
1. Abrir `/failure-capture` desde un mobile simulado.
2. Subir foto de un equipo con problema → vision AI detecta TAG.
3. Botón rojo "grabar" → dictar: "El motor de la bomba está vibrando, escucho ruido metálico, necesito que vengan urgente".
4. La IA estructura el WR completo: equipo, prioridad P1, descripción, repuestos sugeridos.
5. Mientras escribe, banner ámbar muestra "Posible duplicado de WR-2026-00148".

### Demo 2 — Supervisor express (3 min)
1. WR P1 listada → click "Express → PM03" → en 1 click queda OT PROGRAMADA.
2. Auto-Level wizard → nivela carga semanal y difiere las que requieren grúa.
3. Botón "Smart Assign" en una OT → IA propone Sergio Valenzuela (score 92/100) con breakdown explícito (skill match 28/30, carga 24/30, turno 20/20, último contacto 20/20).

### Demo 3 — Confiabilidad agéntica (5 min)
1. `/performance-analysis` → "📂 Cargar Excel Jigsaw histórico" → subir Sept 2010.
2. En 3 segundos, Pareto y Jack-Knife reemplazan los gráficos con la data real.
3. Mostrar cómo Jack-Knife identifica los 2 sistemas en GRAVE_CRONICO (rojo).
4. Bajar a "Fallas Crónicas detectadas" — la IA detectó 3 clusters de ≥3 fallas en 7 días.
5. Click "Abrir RCA" en la primera → RCA pre-llenado con el cluster.

### Demo 4 — Cierre del loop (2 min)
1. RCA cerrado → click "Push a FMECA" → la IA actualiza la worksheet con RPN before/after.
2. La estrategia recalculada se reflejará en el próximo programa semanal automáticamente.
3. Cierra el ciclo: falla → RCA → FMECA → estrategia → menos fallas.

---

## 4. Cierre / Pitch (1 minuto)

> "El SAP de la mina seguirá siendo SAP. MAGEAM se enchufa al lado, lee el Jigsaw que ya tienen y los datos que ya generan, y pone una capa de IA que decide, recomienda y avisa. El mantenedor pierde menos tiempo, el supervisor planifica más rápido, el ingeniero de confiabilidad encuentra los problemas antes y el gerente ve los KPIs sin Excel. Todo eso con un valor de licencia que es una fracción de lo que cuesta una sola transacción de SAP S/4 a un consultor."

---

## 5. Notas para el presentador

- **No mostrar las pantallas que replican SAP** (SAP PM tabs, IW21/22/23). José Cortinat y Magdalena ya lo dijeron: el valor está en la capa agéntica, no en replicar.
- **Si preguntan por integración con SAP**: explicar que MAGEAM tiene un sync queue bidireccional (`/sap-sync/queue`, `/sap-sync/health`). No reemplaza, complementa.
- **Si preguntan por Jigsaw**: si el cliente no lo tiene, MAGEAM puede ofrecerlo como módulo nativo (oportunidad comercial — Jorge transcript 00:18:23).
- **Tiempo total demo recomendado**: 15–20 minutos. Los 4 demos cubren todas las audiencias.

---

## 6. Material de respaldo

- **Doc técnico**: `docs/AGENTIC_CAPABILITIES.md` (status implementación, endpoints).
- **Roadmap**: `docs/AGENTIC_SOLUTIONS_ROADMAP.md` (qué viene en fase 2).
- **Plan de ejecución**: `docs/AGENTIC_IMPLEMENTATION_PLAN.md`.
- **Validación contra Excels Jorge**: `docs/PARETO_JACKKNIFE_VALIDATION.md`.
- **Metodología Pareto + Jack-Knife**: `docs/METODOLOGIA_PARETO_JACKKNIFE.md`.
- **Página viva**: `https://www.mageam.com/agentic-capabilities` (interactivo, refleja el estado real del sistema).
