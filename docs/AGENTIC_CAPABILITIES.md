# MAGEAM — Capacidades Agénticas (Diferenciales sobre SAP)

> Respuesta al punto de José Cortinat + Magdalena Ortega 2026-04-29:
> "El valor está en la capa agéntica, no en replicar SAP".
>
> Este documento numera las 22 capacidades **agénticas/diferenciales**
> que MAGEAM aporta SOBRE lo que ya hace SAP PM. Cada una tiene status real
> verificable (✅ funcional / 🟡 parcial / 🔴 stub) y endpoint/UI dónde se
> puede demostrar Jueves.

---

## Capa 1: Captura inteligente (entrada)

### #1 Captura por foto + Vision AI ✅ FUNCIONAL
- **Diferencial**: SAP exige texto estructurado manual. MAGEAM acepta foto del defecto y la IA identifica equipo + falla.
- **Cómo demo**: `/failure-capture` → cargar foto → AI detecta TAG + sugiere descripción + categoriza falla
- **Endpoint**: `POST /captures/photo`
- **Tech**: vision_service + Claude LLM

### #2 Captura por voz + transcripción ✅ FUNCIONAL
- **Diferencial**: SAP no acepta voz. Mantenedor en planta dicta y la IA estructura el WR.
- **Cómo demo**: `/failure-capture` → botón rojo "Grabar" → dictar problema → texto estructurado
- **Endpoint**: `POST /agentic/voice-capture`

### #3 Search-as-you-type duplicate detection ✅ FUNCIONAL
- **Diferencial**: SAP detecta dups DESPUÉS de crear. MAGEAM avisa MIENTRAS ESCRIBE.
- **Cómo demo**: `/failure-capture` → escribir descripción ≥20 chars + tag → banner ámbar instantáneo con top 3 sugerencias
- **Tech**: jaccard + sequence ratio + time-decay 7d + severity filter ±2 niveles + negative-pair memory

### #4 AI Classification automática ✅ FUNCIONAL
- **Diferencial**: SAP requiere clasificación manual. MAGEAM auto-categoriza failure_type, priority, production_impact, estimated_hours, suggested_specialty con confidence score.
- **Cómo demo**: capturar Aviso → ver `ai_classification` en JSON
- **Tech**: LLM enhancer + heurística + RAG knowledge

---

## Capa 2: Validación + planificación inteligente

### #5 Aviso → OT PM03 express (un round-trip) ✅ FUNCIONAL
- **Diferencial**: SAP requiere ~5 transacciones (IW21 → IW28 → IW31). MAGEAM lo hace en 1 click.
- **Cómo demo**: WR pendiente → botón "⚡ Express → PM03" → OT creada en PROGRAMADO
- **Endpoint**: `POST /work-requests/{id}/convert-to-pm03` (SF-569)

### #6 Smart Assignment IA con skills + HH ✅ FUNCIONAL
- **Diferencial**: SAP NO rankea recursos. MAGEAM puntúa técnicos 0-100 por (specialty match + skills + shift match + HH disponibles).
- **Cómo demo**: SupervisorBoard / Scheduling → botón 🧠 IA en operación → top-10 con score + breakdown
- **Endpoint**: `POST /assignments/rank-for-operation` (SF-568)

### #7 Auto-Level wizard con capacity-aware ✅ FUNCIONAL
- **Diferencial**: SAP no balancea automáticamente. MAGEAM nivela carga semanal con detección de overflow + diferimiento por equipos de apoyo no disponibles.
- **Cómo demo**: Scheduling → botón Auto-Level → plan borrador con asignaciones rankeadas

### #8 Regla de negocio: bloqueo PM01/PM02 → falla ✅ FUNCIONAL
- **Diferencial**: SAP permite reusar PM01 para fallas (contamina KPIs). MAGEAM rechaza con 409 + sugiere PM03 nueva.
- **Cómo demo**: Planning → OT PM01 → intentar cambiar prioridad a P1 → mensaje de bloqueo + audit log
- **Audit**: `BLOCKED_FAILURE_LOAD` (SF-570)

### #9 Cancelación con tipología (absorción) ✅ FUNCIONAL
- **Diferencial**: SAP cancela sin tipo. MAGEAM distingue ABSORBED/NOT_NEEDED/OTHER + linkea a OT PM03 absorbente para no contaminar KPIs.
- **Cómo demo**: SupervisorBoard → Cancelar OT → dropdown tipología → ver panel "OTs absorbidas" en la PM03
- **Endpoint**: `PUT /managed-work-orders/{id}/cancel` (SF-579)

---

## Capa 3: Ejecución inteligente

### #10 Notificación parcial multi-turno + Final automática ✅ FUNCIONAL
- **Diferencial**: SAP IW41 requiere notificación manual. MAGEAM detecta automáticamente cuando todas las ops están al 100% y emite WS toast destacado al supervisor.
- **Cómo demo**: Execution → notif parcial en última op pendiente → ver toast "✅ FINAL automática" + auto-trigger ready-for-close
- **Endpoint**: `POST /managed-work-orders/{id}/notify-partial` + WS event `wo_final_auto` (SF-572)

### #11 Validación supervisor pre-cierre con gates ✅ FUNCIONAL
- **Diferencial**: SAP cierra sin gates. MAGEAM exige 3-4 checkboxes (operations, materials, safety, equipos apoyo si aplica) antes de pasar a EN_EJECUCION.
- **Cómo demo**: Execution → fast-track → modal validation gate → confirmar 4 checks
- (SF-573)

### #12 Stock auto-decrement al cerrar OT ✅ FUNCIONAL
- **Diferencial**: SAP requiere movement type 261 manual. MAGEAM descuenta automático e idempotente.
- **Tech**: hook `consume_stock_on_close` en `_transition` CERRADO

---

## Capa 4: Análisis y diagnóstico (lo más diferencial)

### #13 Bad Actors × Equipos críticos ✅ FUNCIONAL
- **Diferencial**: SAP no cruza criticidad. MAGEAM rankea Bad Actors priorizando A/B con threshold reducido.
- **Cómo demo**: Performance Analysis → sección "Bad Actors x criticidad"
- (SF-581)

### #14 Detección fallas crónicas IA ✅ FUNCIONAL
- **Diferencial**: SAP no detecta patrones. MAGEAM agrupa por (equipo, modo) y flagea ≥3 reps en 7 días.
- **Cómo demo**: Performance Analysis → sección "Fallas Crónicas"
- (SF-582)

### #15 Cluster + Auto-RCA trigger ✅ FUNCIONAL
- **Diferencial**: SAP no abre RCAs solo. MAGEAM detecta clusters críticos y CREA el RCA automáticamente con 5W2H pre-llenado.
- **Cómo demo**: Performance Analysis → botón "🤖 Auto-generar RCAs (clusters)" → preview → confirmar → RCAs creados
- **Endpoint**: `POST /agentic/auto-trigger-rca`

### #16 Detector retrabajos <24h ✅ FUNCIONAL
- **Diferencial**: SAP no correlaciona OTs cerradas con WRs nuevos. MAGEAM detecta cuando un equipo intervenido vuelve a fallar en <24h y categoriza causa probable.
- **Cómo demo**: Performance Analysis → sección "Retrabajos / Reprocesos"
- (SF-590)

### #17 Pareto + Jack-Knife automáticos ✅ FUNCIONAL
- **Diferencial**: SAP no genera Pareto/Jack-Knife. MAGEAM los calcula y rankea automáticamente.
- **Cómo demo**: Performance Analysis → secciones "Pareto modos de falla" + "Jack-Knife Diagram"

### #18 Causas no-cumplimiento (NLP/regex IA) ✅ FUNCIONAL
- **Diferencial**: SAP no procesa comentarios libres. MAGEAM lee notes de notificación y categoriza en 7 patrones (repuesto, operaciones, herramienta, etc).
- **Cómo demo**: Performance Analysis → sección "Causas de no-cumplimiento"
- (SF-584)

### #19 Stock forecast IA con coverage + sugerencia OC ✅ FUNCIONAL
- **Diferencial**: SAP MM tiene MRP pero no integra demanda planificada de OTs futuras. MAGEAM cruza consumo histórico (90d) + demanda OTs PROGRAMADO (60d) y sugiere cantidad de OC.
- **Cómo demo**: Performance Analysis → sección "Stock forecast IA" → ver risk levels + cobertura
- **Endpoint**: `POST /agentic/stock-forecast` (SF-589)

### #20 Cost analysis drill-down jerárquico con cost_element AI ✅ FUNCIONAL
- **Diferencial**: SAP CO da costos por centro pero no clasifica automáticamente. MAGEAM auto-clasifica materials en 7 cost_elements por NLP descripción + drill-down jerárquico planta→área→equipo.
- **Cómo demo**: Performance Analysis → sección "Costos por UT + Clase de gasto" → click ▶ para expandir
- **Endpoint**: `POST /agentic/cost-analysis` (SF-588)

---

## Capa 5: Cierre del ciclo (loop closure)

### #21 DefectElimination → FMECA push automático ✅ FUNCIONAL
- **Diferencial**: SAP no escribe a FMECA al cerrar RCA. MAGEAM registra modo de falla con RPN before/after en worksheet del equipo + encola para SAP.
- **Cómo demo**: DefectElimination → caso COMPLETED → botón "Push → FMECA" → ver row en FMECA worksheet
- **Endpoint**: `POST /rca/analyses/{id}/push-to-fmeca`

### #22 Close-the-loop tracking con warnings vencidas ✅ FUNCIONAL
- **Diferencial**: SAP no rastrea ciclo de mejora. MAGEAM monitorea acciones RCA/CAPA → flag warning si abierta+vencida = problema sigue ocurriendo.
- **Cómo demo**: Performance Analysis → sección "Close-the-loop tracking" → ver acciones vencidas

---

## Cosas que SAP YA HACE bien (NO son diferenciales)

Estas las soportamos pero **no son donde está el valor**:

- ❌ Work Order CRUD (PM01/PM02/PM03)
- ❌ Status workflow estándar
- ❌ BOM, Measuring Points, Permits (se ven en SapPmPage como espejo)
- ❌ Cost Centers contables (KO88)
- ❌ Inventario MM raw (MMBE)
- ❌ Maintenance Plans (IP10)
- ❌ Hierarchy de equipos básica (IH08)

**Recomendación demo Jueves**: NO mostrar estas pestañas. Si Jorge pregunta, responder "esto es 1:1 con SAP, lo importante está en `/work-management → Performance Analysis`".

---

## Capa 6 (Phase 2 — bloqueada por cliente)

### #23 SAP integración bidireccional 🔴 STUB Phase 2
- **Diferencial**: cuando se active, los hallazgos IA escribirán automáticamente a SAP (Avisos QM, MoC, Z-tables FMECA RPN).
- **Hoy**: stub honest en SapPmPage tab "Sync Bidireccional" + cola persistente `sap_sync_log`
- (SF-591) — bloqueado: credenciales SAP del cliente

---

## Resumen para demo Jueves

**Capacidades funcionales agénticas**: **22**
**Stub Phase 2**: 1 (SF-591)
**SAP-replication (NO mostrar)**: ~7 tabs SapPmPage

### Flujo demo recomendado (15 min)

1. **#1-3 Captura inteligente** (3 min): foto + voz + search-as-you-type
2. **#5-6 Express + Smart Assign** (3 min): WR P1 → 1-click PM03 → Smart Assign top candidato
3. **#10-11 Ejecución inteligente** (2 min): notif parcial → toast FINAL automática
4. **#13-15 Detección IA** (4 min): Bad Actors × críticos → Auto-RCA cluster → Retrabajos
5. **#19-20 Forecast + Costos IA** (2 min): stock forecast + drill-down costos
6. **#21-22 Close-the-loop** (1 min): DefectElimination → FMECA + warnings vencidas

---

_Documento auténtico: 2026-04-29 14:30 UTC_
