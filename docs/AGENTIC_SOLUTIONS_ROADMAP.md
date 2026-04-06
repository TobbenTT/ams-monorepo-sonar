# Soluciones Agenticas para AMS — Goldfields Salares Norte

## Contexto

AMS es una plataforma de gestion de mantenimiento industrial que replica y extiende las capacidades de SAP PM. El objetivo estrategico es implementar **soluciones agenticas** donde agentes de IA ejecuten tareas autonomamente para los 6 roles de usuario.

La plataforma ya cuenta con: 341 endpoints API (FastAPI), 39 servicios, 15 agentes IA especializados, 34+ tool wrappers, motor de scheduling, motores analiticos (Weibull, Pareto, Jackknife, KPI, Health Score, RBI), conector SAP RFC con degradacion elegante, app movil offline-first con captura de voz/imagen, y un frontend React con 30+ paginas.

### Roles de Usuario

| Rol | Abreviatura | Foco Principal |
|-----|:-----------:|----------------|
| Gerente de Mantenimiento | GER | Decisiones estrategicas, KPIs, presupuesto |
| Planificador de Mantenimiento | PLN | Planificacion de trabajos, backlog, materiales |
| Programador de Mantenimiento | PRG | Programas semanales, asignacion de recursos |
| Supervisor de Mantenimiento | SUP | Operaciones diarias, coordinacion de equipos |
| Tecnico de Mantenimiento | TEC | Ejecucion en campo, troubleshooting |
| Ingeniero de Confiabilidad | ING | Analisis de fallas, estrategias, mejora continua |

---

## TIER 1 — IMPACTO INMEDIATO (Semanas 1-4)

> Building blocks ya existen en la plataforma. Maximo valor con minimo esfuerzo de desarrollo.

---

### 1. VoiceCapture Pro / Captura por Voz Inteligente

| | |
|---|---|
| **Rol** | Tecnico, Supervisor |
| **Que hace el agente** | El tecnico habla y/o toma fotos. El agente: transcribe (Whisper) → clasifica falla (`/ai/suggest-failure`) → analiza imagen (Vision) → crea Work Request completa con SLA → notifica al supervisor. Sin tocar formularios. |
| **Valor** | 20 WRs/dia x 10 tecnicos x 15 min ahorrados = **30 hrs/semana**. Elimina ~25% de errores de clasificacion manual. |
| **Complejidad** | LOW — Todos los componentes existen: `capture_service.py`, Vision service, LLM enhancer, WR service con SLA |
| **Fuentes de datos** | Whisper API, Claude Vision, catalogo de fallas, jerarquia de equipos |

**Flujo del agente:**

```
Tecnico graba audio + toma foto
        |
        v
[Whisper] Transcripcion automatica
        |
        v
[Claude Vision] Analisis de imagen (defecto, condicion, tag de equipo)
        |
        v
[/ai/suggest-failure] Clasificacion: categoria, sintoma, causa, prioridad
        |
        v
[WR Service] Crea Work Request con SLA calculado
        |
        v
[Notification] Alerta al Supervisor
```

---

### 2. AutoScheduler / Programador Semanal Automatico

| | |
|---|---|
| **Rol** | Programador |
| **Que hace el agente** | Un click: lee backlog + calendario preventivo + disponibilidad de personal + ventanas de parada + materiales → genera programa semanal optimizado con Gantt, nivelacion de recursos, deteccion de conflictos. El programador revisa y aprueba. |
| **Valor** | Reduce creacion del programa de **4-6 hrs a 15-30 min**. Mejora cumplimiento de programa 10-15%. |
| **Complejidad** | LOW — `scheduling_service.create_program()` ya orquesta este flujo |
| **Fuentes de datos** | `BacklogItemModel`, `WeeklyProgramModel`, `WorkforceModel`, `ShutdownCalendarModel` |

**Flujo del agente:**

```
Programador presiona "Generar Programa"
        |
        v
[Backlog Service] Lee items pendientes priorizados
        |
        v
[Scheduling Engine] Calendario preventivo + backlog correctivo
        |
        v
[Resource Leveling] Disponibilidad de personal por turno/especialidad
        |
        v
[Material Check] Verifica disponibilidad de repuestos por OT
        |
        v
[Conflict Detection] Identifica sobre-asignaciones y conflictos
        |
        v
[Gantt Generator] Programa visual DRAFT para revision
        |
        v
Programador revisa, ajusta y aprueba → PROGRAMA ACTIVO
```

---

### 3. EquipmentDoctor / Doctor del Equipo

| | |
|---|---|
| **Rol** | Tecnico, Supervisor |
| **Que hace el agente** | Tecnico describe sintomas en el campo. El agente recopila contexto completo del equipo (jerarquia, criticidad, FMEA, historial de OTs, troubleshooting previo) y guia diagnostico paso a paso. Si confianza >85%, auto-sugiere WR correctiva con materiales y duracion estimada. |
| **Valor** | Reduce tiempo diagnostico 40-60%. Cada escalamiento evitado ahorra 2-4 hrs de ingeniero. En Salares Norte (remoto, 4500m), evitar movilizacion = **USD 2,000-5,000/evento**. |
| **Complejidad** | LOW — `equipment_chat_service.py` y `/ai/troubleshoot` ya existen |
| **Fuentes de datos** | Equipment chat service, troubleshooting engine, catalogo de modos de falla |

**Flujo del agente:**

```
Tecnico describe sintomas (texto o voz)
        |
        v
[Context Builder] Recopila: jerarquia, criticidad, FMEA, historial OTs
        |
        v
[Troubleshooting Engine] Diagnostico con arbol de decision
        |
        v
[Confidence Check] Confianza > 85%?
        |
   SI --+-- NO
   |         |
   v         v
Auto-sugiere WR    Guia paso a paso
con materiales     con preguntas de
y duracion         refinamiento
```

---

### 4. SmartBacklog / Backlog Inteligente Priorizado

| | |
|---|---|
| **Rol** | Planificador |
| **Que hace el agente** | Evalua continuamente el backlog con scoring multi-criterio: criticidad del equipo, health score, proximidad a SLA, frecuencia de fallas (Pareto), costo de diferir, impacto en seguridad. Re-prioriza, agrupa trabajos eficientemente, y alerta cuando items P1/P2 riesgan incumplir SLA. |
| **Valor** | Reduce envejecimiento del backlog 20-30%. Previene incumplimientos de SLA. **5-10% reduccion en downtime no planificado**. |
| **Complejidad** | LOW — Todos los engines existen: priority, health_score, notification |
| **Fuentes de datos** | `BacklogItemModel`, criticality assessments, health scores, SLA deadlines |

**Criterios de scoring:**

| Criterio | Peso | Fuente |
|----------|:----:|--------|
| Criticidad del equipo (A/B/C/D) | 25% | `CriticalityEngine` |
| Health Score actual | 20% | `HealthScoreEngine` |
| Proximidad a SLA | 20% | WR SLA deadline |
| Frecuencia de falla (Pareto) | 15% | `ParetoEngine` |
| Costo de diferir | 10% | `BudgetEngine` |
| Impacto en seguridad | 10% | FMEA consequence |

---

### 5. SafetyChecklist Genius / Listas de Verificacion Inteligentes

| | |
|---|---|
| **Rol** | Tecnico, Supervisor |
| **Que hace el agente** | Antes de ejecutar cualquier OT, auto-genera checklist contextual: LOTO especifico del equipo, EPP segun tipo de tarea y ubicacion (4500m, frio extremo), instrucciones paso a paso, lista de materiales, precauciones de seguridad. Se adapta segun historial de incidentes. |
| **Valor** | **Cero incidentes por procedimientos omitidos**. En Salares Norte, compliance de seguridad es critico. Genera checklists instantaneamente vs. 30 min manual. |
| **Complejidad** | LOW — Endpoint `/ai/checklists` ya existe |
| **Fuentes de datos** | Execution checklist service, work instructions, LOTO, jerarquia de equipos |

**Secciones del checklist generado:**

```
1. IDENTIFICACION
   - Equipo, ubicacion funcional, OT asociada

2. SEGURIDAD PRE-TRABAJO
   - EPP requerido (adaptado a 4500m y clima)
   - LOTO especifico del equipo
   - Permisos de trabajo requeridos

3. MATERIALES Y HERRAMIENTAS
   - Lista de repuestos con codigos SAP
   - Herramientas especiales requeridas

4. INSTRUCCIONES DE EJECUCION
   - Pasos secuenciales con criterios de aceptacion
   - Puntos de verificacion intermedios

5. CIERRE
   - Pruebas post-mantenimiento
   - Handover a operaciones
```

---

### 6. KPI Watchdog / Vigia de KPIs

| | |
|---|---|
| **Rol** | Gerente, Ingeniero de Confiabilidad |
| **Que hace el agente** | Monitorea KPIs (MTBF, MTTR, OEE, disponibilidad, cumplimiento de programa) vs. umbrales. Cuando un KPI desvia >2 sigma, genera alerta contextual: que KPI, que equipo/area, tendencia, causa probable (correlacionando con OTs y fallas recientes), accion correctiva recomendada. Ejecuta periodicamente (diario/fin de turno). |
| **Valor** | Detecta degradacion **2-3 semanas antes** que revisiones mensuales. Cada deteccion temprana previene 1-2 breakdowns/trimestre = **USD 50,000-200,000/evento**. |
| **Complejidad** | MEDIUM — Engines individuales existen; falta orquestador periodico |
| **Fuentes de datos** | `kpi_engine`, `variance_detector`, `notification_engine`, historial de OTs |

**KPIs monitoreados y umbrales:**

| KPI | Umbral de Alerta | Frecuencia |
|-----|:-----------------:|:----------:|
| MTBF | Caida >15% vs. media movil 90d | Diario |
| MTTR | Aumento >20% vs. baseline | Diario |
| OEE | < 75% sostenido 3 dias | Diario |
| Disponibilidad | < 90% en equipo critico | Por turno |
| Cumplimiento de programa | < 80% semanal | Semanal |
| PM Compliance | < 85% mensual | Semanal |
| Ratio Reactivo | > 40% del total OTs | Semanal |

---

### 7. One-Click Executive Report / Reporte Ejecutivo con Un Click

| | |
|---|---|
| **Rol** | Gerente |
| **Que hace el agente** | Recopila todos los KPIs, estado del backlog, cumplimiento de programa, variacion presupuestaria, metricas de seguridad, tendencias de confiabilidad → genera reporte ejecutivo completo. Exportable a PowerPoint o Excel. Incluye graficos de tendencia, semaforos, y resumen ejecutivo en lenguaje natural. |
| **Valor** | Reduce preparacion de reporte mensual de **8-16 hrs a 5 minutos**. Consistencia y calidad de un analista dedicado. |
| **Complejidad** | MEDIUM — Agregacion de datos existe; falta orquestador + generacion PPTX |
| **Fuentes de datos** | `reporting_service`, `kpi_engine`, `budget_engine`, `health_score_engine` |

**Estructura del reporte generado:**

```
SLIDE 1: Resumen Ejecutivo (semaforos, headline KPIs)
SLIDE 2: KPIs Operacionales (MTBF, MTTR, OEE, Disponibilidad)
SLIDE 3: Cumplimiento de Programa (plan vs. real, tendencia)
SLIDE 4: Estado del Backlog (por prioridad, envejecimiento)
SLIDE 5: Desempeno Financiero (presupuesto vs. real, forecast)
SLIDE 6: Top 10 Equipos Criticos (health score, tendencia)
SLIDE 7: Fallas Cronicas y Planes de Accion
SLIDE 8: Proximas Actividades Clave (paradas, inspecciones)
```

---

## TIER 2 — CORTO PLAZO (Semanas 5-12)

> Complejidad media, alto valor estrategico.

---

### 8. Chronic Failure Detector / Detector de Fallas Cronicas

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad |
| **Que hace** | Monitorea historial de OTs e identifica fallas cronicas (mismo equipo, mismo modo de falla, recurrencia <3x MTBF). Ejecuta Pareto + Jackknife + Weibull automaticamente. Al detectar patron cronico, notifica con: tendencia, costo anual estimado, parametros Weibull, y ruta de investigacion recomendada (RCA o revision FMEA). |
| **Valor** | Fallas cronicas = 20-30% del costo de mantenimiento. Eliminar top 5 = **USD 500K-2M/ano**. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | Historial de OTs, `pareto_engine`, `jackknife_engine`, `weibull_engine`, catalogo de fallas |

**Criterios de deteccion de falla cronica:**

| Criterio | Umbral |
|----------|--------|
| Recurrencia en mismo equipo | >= 3 eventos en 12 meses |
| Mismo modo de falla | Match exacto mecanismo + causa |
| Intervalo vs. MTBF | Recurrencia < 3x MTBF calculado |
| Costo acumulado | > USD 10,000 en 12 meses |

---

### 9. Material Readiness Oracle / Oraculo de Materiales

| | |
|---|---|
| **Rol** | Planificador, Programador |
| **Que hace** | Antes de programar cualquier paquete de trabajo, verifica disponibilidad de materiales vs. BOM. Identifica faltantes, estima lead times, recomienda ajustes al programa o sustituciones de materiales del catalogo. |
| **Valor** | Indisponibilidad de materiales causa 15-25% de retrasos. Elimina programacion de trabajos sin materiales = **5-8 hrs/semana de cuadrilla no desperdiciadas**. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `spare_parts_engine`, `material_mapper`, SAP BOM, backlog items |

---

### 10. RCM Strategy Advisor / Asesor de Estrategia RCM

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad |
| **Que hace** | Para cualquier equipo, ejecuta la cadena completa de analisis RCM: FMECA → arbol de decision RCM (16 caminos) → estrategia optima (CBM, TBM, RTF, rediseno) → lista de tareas con intervalos. Presenta como DRAFT con scores de confianza y fundamento tecnico. |
| **Valor** | RCM manual = 2-4 hrs/equipo. Con agente = **15 min de revision**. Para 200+ items mantenibles = 400-800 hrs ahorradas. |
| **Complejidad** | MEDIUM — Todos los engines existen (AG-002 ya los usa) |
| **Fuentes de datos** | `fmeca_engine`, `rcm_decision_engine`, `criticality_engine`, historial de fallas |

---

### 11. Shift Handover Assistant / Asistente de Cambio de Turno

| | |
|---|---|
| **Rol** | Supervisor |
| **Que hace** | Al fin del turno, compila: OTs iniciadas/completadas, tareas pendientes con % avance, incidentes de seguridad, handovers de equipo, sesiones de troubleshooting abiertas, solicitudes de materiales pendientes. Genera documento estructurado de entrega. Incluye items flaggeados que requieren atencion inmediata. |
| **Valor** | Elimina perdida de informacion entre turnos. Reduce handover de **30 min a 5 min**. En turnos de 12 hrs de Salares Norte, esto es critico para continuidad operacional. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `ManagedWorkOrderModel`, `WorkAssignmentModel`, execution progress, troubleshooting sessions |

**Estructura del handover:**

```
TURNO SALIENTE: [Fecha] [Turno A/B] [Supervisor]

1. RESUMEN DEL TURNO
   - OTs completadas: X
   - OTs iniciadas: X
   - OTs en progreso: X (con % avance)

2. ATENCION INMEDIATA (flags rojos)
   - [Equipo] - [Problema] - [Accion requerida]

3. TRABAJOS EN PROGRESO
   - [OT#] [Equipo] [Tarea] [Avance %] [Tecnico asignado]

4. INCIDENTES DE SEGURIDAD
   - Ninguno / [Detalle]

5. MATERIALES PENDIENTES
   - [Material] [OT asociada] [ETA]

6. NOTAS PARA TURNO ENTRANTE
   - [Observaciones relevantes]
```

---

### 12. SAP Sync Guardian / Guardian de Sincronizacion SAP

| | |
|---|---|
| **Rol** | Planificador, Gerente |
| **Que hace** | Monitorea cola de uploads a SAP, valida paquetes de exportacion antes de enviar, identifica discrepancias AMS-SAP (ubicaciones funcionales, maestros de equipo, planes de mantenimiento), genera reportes de reconciliacion. Cuando SAP no esta disponible, encola cambios y auto-reintenta. |
| **Valor** | Problemas de calidad de datos SAP causan 10-15% de retrabajo de planificacion. **4-8 hrs/mes de reconciliacion manual eliminadas**. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `sap_export_engine`, `sap_rfc_connector`, validation engine, equipment hierarchy |

---

### 13. Budget Sentinel / Centinela del Presupuesto

| | |
|---|---|
| **Rol** | Gerente |
| **Que hace** | Monitoreo continuo de gasto vs. presupuesto. Detecta tendencias de variacion, proyecta gasto a fin de mes/trimestre, identifica drivers de costo (que equipo/area esta sobre presupuesto), recomienda acciones correctivas (diferir trabajo de baja prioridad, consolidar paradas). Alerta cuando gasto excede umbrales configurables. |
| **Valor** | Presupuesto de mantenimiento en mineria de oro = USD 20-50M/ano. 3-5% de ahorro por mejor control = **USD 600K-2.5M**. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `budget_engine`, `roi_engine`, `variance_detector`, WO cost data |

**Umbrales de alerta:**

| Nivel | Condicion | Accion |
|-------|-----------|--------|
| Amarillo | Gasto > 90% del presupuesto mensual al dia 20 | Notificacion informativa |
| Naranja | Gasto > 100% del presupuesto mensual | Alerta a Gerente + recomendaciones |
| Rojo | Proyeccion trimestral > 110% del presupuesto | Escalamiento + plan de accion automatico |

---

### 14. Post-Maintenance Learning / Aprendizaje Post-Mantenimiento

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad, Supervisor |
| **Que hace** | Despues de cada cierre de OT, analiza: causa raiz correctamente identificada? reparacion se mantuvo? horas estimadas fueron precisas? skill set correcto asignado? Retroalimenta el sistema: actualiza parametros Weibull, ajusta estimaciones de duracion, flaggea modos de falla que necesitan revision FMECA, actualiza base de conocimiento de troubleshooting. |
| **Valor** | En 6 meses, estimaciones de duracion mejoran **15-20%**, reduciendo overtime e idle time. Conocimiento se vuelve organizacional, no individual. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | Closed WOs, execution data (actual vs. estimado), Weibull engine, expert knowledge |

---

### 15. Intelligent WO Router / Enrutador Inteligente de OTs

| | |
|---|---|
| **Rol** | Planificador, Programador |
| **Que hace** | Cuando un WR es aprobado, automaticamente: determina skill set requerido, estima duracion basado en historico de equipos/fallas similares, identifica materiales necesarios, selecciona cuadrilla optima por disponibilidad y calificacion, y pre-llena la OT con toda la data de planificacion. El planificador revisa y confirma. |
| **Valor** | Reduce planificacion de OT de 20-30 min a **5 min de revision**. A 15-20 OTs/dia = 4-6 hrs/dia ahorradas. Mejor matching de cuadrilla reduce retrabajo 10-15%. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | WR data, equipment history, workforce model, `priority_engine`, `assignment_engine` |

**Flujo del agente:**

```
WR Aprobada entra al backlog
        |
        v
[Historico] Busca OTs similares (mismo equipo, misma falla)
        |
        v
[Estimacion] Duracion basada en historico + complejidad
        |
        v
[Materiales] Identifica BOM requerido segun tarea
        |
        v
[Crew Matching] Selecciona cuadrilla optima
   - Disponibilidad por turno
   - Calificacion/certificacion
   - Carga de trabajo actual
        |
        v
[Pre-fill OT] Crea OT DRAFT con toda la data
        |
        v
Planificador revisa y confirma
```

---

### 16. Defect Elimination Tracker / Rastreador de Eliminacion de Defectos

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad |
| **Que hace** | Gestiona ciclo CAPA completo. Cuando se identifica falla cronica o se completa un RCA, crea acciones CAPA, trackea implementacion, valida efectividad monitoreando recurrencia, escala acciones vencidas. |
| **Valor** | Actualmente 30-40% de recomendaciones de RCA nunca se implementan completamente. Este agente asegura **90%+ de completacion**. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `capa_engine`, `de_kpi_engine`, `rca_engine`, WO history, notification engine |

**Ciclo CAPA gestionado por el agente:**

```
Falla Cronica Detectada / RCA Completado
        |
        v
[PLAN] Crea acciones CAPA con responsable y fecha limite
        |
        v
[DO] Trackea implementacion (% avance, evidencias)
        |
        v
[CHECK] Monitorea recurrencia post-implementacion
   - Sin recurrencia en 3x MTBF → EFECTIVA
   - Recurrencia detectada → RE-ABRIR
        |
        v
[ACT] Cierra CAPA o escala si vencida
```

---

## TIER 3 — MEDIANO PLAZO (Semanas 13-24)

> Mayor complejidad, valor transformacional.

---

### 17. Predictive Health Prophet / Profeta de Salud Predictiva

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad, Gerente |
| **Que hace** | Combina health score + Weibull + historial de OTs + datos de condicion para predecir probabilidad de falla a 30/60/90 dias. Rankea equipos por riesgo y genera plan proactivo de mantenimiento. Mapa de calor de riesgo de la flota. |
| **Valor** | Cada falla predicha y prevenida = **USD 50K-500K**. 10% reduccion en fallas no planificadas es transformacional. |
| **Complejidad** | HIGH — Requiere integracion con datos de proceso (PI historian de AVEVA) |
| **Fuentes de datos** | `health_score_engine`, `weibull_engine`, WO history, condition monitoring data |

---

### 18. Shutdown Optimizer / Optimizador de Paradas Programadas

| | |
|---|---|
| **Rol** | Programador, Gerente |
| **Que hace** | Para paradas programadas: agrupa todo el trabajo diferido que requiere equipo offline, secuencia por ruta critica, nivela recursos, calcula necesidades de materiales con lead times, genera cronograma minuto a minuto. |
| **Valor** | Cada hora de parada en mineria de oro = USD 20K-100K en produccion perdida. Reducir parada de 2 a 1.5 dias = **USD 240K-1.2M**. |
| **Complejidad** | HIGH |
| **Fuentes de datos** | `shutdown_engine`, `scheduling_engine`, backlog (items shutdown-required), workforce, materiales |

---

### 19. Regulatory Compliance Watchdog / Vigia de Cumplimiento Regulatorio

| | |
|---|---|
| **Rol** | Gerente, Ingeniero de Confiabilidad |
| **Que hace** | Monitorea inspecciones RBI, inspecciones estatutarias, tareas de cumplimiento ambiental. Genera alertas de inspecciones proximas, trackea completacion, produce reportes audit-ready. Cross-referencia con regulaciones SERNAGEOMIN. |
| **Valor** | Multas por incumplimiento en mineria chilena pueden exceder **USD 1M**. Ordenes de cierre operacional son catastroficas. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `rbi_engine`, `notification_engine`, inspection schedules, regulatory calendar |

---

### 20. Digital Twin Dashboard / Panel del Gemelo Digital

| | |
|---|---|
| **Rol** | Gerente, Ingeniero de Confiabilidad |
| **Que hace** | Vista unificada en tiempo real de toda la planta: health score por equipo, estado actual (operando/mantenimiento/parada), OTs activas, ventana de falla predicha. Actualizacion continua con drill-down a cualquier equipo. |
| **Valor** | Reemplaza 5-6 dashboards separados. Velocidad de decision mejora **50%**. |
| **Complejidad** | HIGH |
| **Fuentes de datos** | Todos los datos de equipos, `health_score_engine`, `kpi_engine`, OTs activas, scheduling |

---

### 21. Knowledge Base Curator / Curador de Base de Conocimiento

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad, Tecnico |
| **Que hace** | Extrae y organiza conocimiento automaticamente de: sesiones de troubleshooting, reportes RCA, procedimientos exitosos, manuales de proveedor, input de tecnicos experimentados. Construye base de conocimiento searcheable que alimenta al EquipmentDoctor. |
| **Valor** | Captura conocimiento institucional antes de jubilaciones (riesgo critico en mineria). Mejora first-time-fix rate **15-20%**. |
| **Complejidad** | HIGH |
| **Fuentes de datos** | `expert_knowledge_engine`, troubleshooting history, closed WOs, feedback data |

---

### 22. Spare Parts Demand Forecaster / Pronosticador de Demanda de Repuestos

| | |
|---|---|
| **Rol** | Planificador |
| **Que hace** | Analiza consumo historico de materiales, correlaciona con edad de equipo y tendencias de falla, pronostica demanda a 3/6/12 meses. Identifica riesgo de stockout, recomienda puntos de reorden, genera requisiciones de compra. |
| **Valor** | Inventario de repuestos = USD 5-10M. Optimizacion de carrying cost = **USD 750K-2.5M/ano**. |
| **Complejidad** | HIGH |
| **Fuentes de datos** | `spare_parts_engine`, WO material consumption, `weibull_engine`, SAP BOM, procurement lead times |

---

### 23. Contractor Performance Analyzer / Analizador de Rendimiento de Contratistas

| | |
|---|---|
| **Rol** | Gerente |
| **Que hace** | Trackea calidad de trabajo de contratistas (tasa de retrabajo), adherencia al programa, compliance de seguridad, precision de costos vs. presupuesto. Genera scorecards y recomendaciones para renovacion o terminacion de contratos. |
| **Valor** | Contratos externos = 30-40% del costo de mantenimiento. **5-10% de mejora** a traves de gestion basada en datos. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | WO data (contractor-assigned), execution tracking, quality metrics, budget data |

---

### 24. Energy Efficiency Monitor / Monitor de Eficiencia Energetica

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad, Gerente |
| **Que hace** | Monitorea patrones de consumo energetico y detecta degradacion de eficiencia que indica problemas mecanicos emergentes (ej: aumento de corriente de motor = desgaste de rodamiento). Correlaciona anomalias con eventos de mantenimiento. |
| **Valor** | Energia = costo operativo major en mineria. **3-5% reduccion en desperdicio energetico = USD 200K-500K/ano**. Tambien sirve como indicador temprano de falla. |
| **Complejidad** | HIGH — Requiere integracion con datos de proceso (PI historian) |
| **Fuentes de datos** | Energy consumption data, equipment operating parameters, WO history, Weibull analysis |

---

### 25. Multi-Site Benchmarking / Benchmarking Multi-Sitio

| | |
|---|---|
| **Rol** | Gerente |
| **Que hace** | Compara KPIs de mantenimiento entre sitios de Goldfields. Identifica mejores practicas de sitios top-performing, recomienda transferencia de practicas. Usa `VarianceDetector` (ya disenado para multi-planta). |
| **Valor** | Transferencia de best practices mejora sitios rezagados **10-20%** en KPIs clave. Optimizacion a nivel de portafolio. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `variance_detector` (multi-plant), `kpi_engine`, site-level aggregation |

---

### 26. Autonomous RCA Initiator / Iniciador Autonomo de RCA

| | |
|---|---|
| **Rol** | Ingeniero de Confiabilidad |
| **Que hace** | Ante falla significativa (OT P1/P2, incidente de seguridad, health score bajo), automaticamente inicia workflow RCA: crea registro, pre-llena analisis 5-Why con factores contribuyentes sugeridos basados en historial y fallas similares en la flota, asigna investigacion, trackea completacion. |
| **Valor** | Ninguna falla significativa queda sin investigar. Reduce retraso de inicio de RCA de **dias a minutos**. Pre-llenado acelera la investigacion 30-40%. |
| **Complejidad** | MEDIUM |
| **Fuentes de datos** | `rca_engine`, failure history, FMECA data, notification engine, assignment service |

---

## Matriz de Valor por Rol

| # | Solucion | GER | PLN | PRG | SUP | TEC | ING |
|---|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | VoiceCapture Pro | | | | ** | *** | |
| 2 | AutoScheduler | | | *** | | | |
| 3 | EquipmentDoctor | | | | ** | *** | |
| 4 | SmartBacklog | | *** | * | | | |
| 5 | SafetyChecklist | | | | *** | *** | |
| 6 | KPI Watchdog | *** | | | | | *** |
| 7 | Executive Report | *** | | | | | |
| 8 | Chronic Failure Det. | | | | | | *** |
| 9 | Material Readiness | | *** | *** | | | |
| 10 | RCM Advisor | | | | | | *** |
| 11 | Shift Handover | | | | *** | * | |
| 12 | SAP Sync Guardian | * | *** | | | | |
| 13 | Budget Sentinel | *** | | | | | |
| 14 | Post-Maint Learning | | | | ** | | *** |
| 15 | WO Router | | *** | ** | | | |
| 16 | Defect Elimination | | | | | | *** |
| 17 | Predictive Health | ** | | | | | *** |
| 18 | Shutdown Optimizer | ** | | *** | | | |
| 19 | Compliance Watchdog | *** | | | | | ** |
| 20 | Digital Twin | *** | | | | | ** |
| 21 | Knowledge Curator | | | | | ** | *** |
| 22 | Spare Parts Forecast | | *** | | | | |
| 23 | Contractor Perf. | *** | | | | | |
| 24 | Energy Efficiency | ** | | | | | *** |
| 25 | Multi-Site Bench. | *** | | | | | |
| 26 | Auto RCA Initiator | | | | | | *** |

> `***` = beneficiario principal | `**` = beneficiario secundario | `*` = beneficiario terciario

---

## Cobertura por Rol

| Rol | Soluciones como beneficiario principal | Total soluciones que impactan |
|-----|:--------------------------------------:|:----------------------------:|
| **Gerente** | 7 (KPI, Report, Budget, Compliance, Twin, Contractor, Benchmark) | 12 |
| **Planificador** | 4 (SmartBacklog, Material, SAP Sync, Spare Parts) | 7 |
| **Programador** | 2 (AutoScheduler, Shutdown Optimizer) | 5 |
| **Supervisor** | 3 (SafetyChecklist, Shift Handover, Post-Maint) | 7 |
| **Tecnico** | 3 (VoiceCapture, EquipmentDoctor, SafetyChecklist) | 6 |
| **Ingeniero de Confiabilidad** | 8 (KPI, Chronic, RCM, Post-Maint, Defect, Predictive, Knowledge, RCA) | 12 |

---

## Resumen de Valor Estimado

| Tier | Soluciones | Inversion (semanas) | Valor Anual Estimado |
|------|:---------:|:-------------------:|:--------------------:|
| T1 | 7 | 4 | USD 1-3M |
| T2 | 9 | 8 | USD 2-5M |
| T3 | 10 | 12 | USD 3-10M |
| **Total** | **26** | **24** | **USD 6-18M/ano** |

---

## Arquitectura de Implementacion

Cada solucion agentica sigue el patron ya establecido en el codebase:

```
[Frontend]                    [Backend]                     [AI Core]
React Page/Widget  ──HTTP──>  FastAPI Router  ──calls──>    Agent + Tool Wrappers
     |                             |                              |
     v                             v                              v
Visualizacion              Service Layer                   Claude API
de resultados              (business logic)                (orchestration)
     |                             |                              |
     v                             v                              v
Export (PPTX/XLSX)         PostgreSQL                      Engines (Weibull,
                           (persistence)                   Pareto, KPI, etc.)
```

**Archivos criticos para implementacion:**

| Archivo | Proposito |
|---------|-----------|
| `api/routers/ai_agents.py` | Hub central de endpoints de agentes IA |
| `api/ai_core/tool_wrappers/server.py` | Registro de tools disponibles para agentes |
| `api/services/scheduling_service.py` | Logica de scheduling (AutoScheduler, Shutdown) |
| `tools/engines/notification_engine.py` | Infraestructura de alertas (Watchdogs, Sentinels) |
| `api/services/capture_service.py` | Pipeline de captura (VoiceCapture Pro) |
| `api/services/reporting_service.py` | Generacion de reportes (Executive Report) |
| `api/services/reliability_service.py` | Weibull, RBI, prediccion (Predictive Health) |

---

*Documento generado: 2026-04-06*
*Plataforma: AMS Production — Branch: demo-seed-data*
*Sitio: Goldfields Salares Norte, Chile*
