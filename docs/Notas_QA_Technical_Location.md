# 🤖 AI Assistant – Notas QA

**Función:** Búsqueda de Technical Location
**Fecha:** 08/05/2026
**Sistema:** *(pendiente de definir)*

---

## 🚦 Nivel de riesgo

- Nivel **1** → P3, P4
- Nivel **2** → P1, P2

---

## 📋 Índice de hallazgos

1. Código de aviso – revisar manualmente
2. Columna Priority (orden y transición original → nueva)
3. Sugerencia de IA en columna de WRs → eliminar
4. Revisar TAGs de la BD
5. Revisar a fondo idioma y datos en BD
6. Alternativa: BD nueva desde cero
7. Reparar mínimo de horas en nueva tarea
8. Resumen → cambiar a otro color
9. Segunda reserva está fallando
10. Equipos Apoyo: columna "NOMBRE" → "CARACTERÍSTICAS"
11. Columna "HH" → "CANTIDAD"
12. Más confirmaciones al eliminar
13. Pestaña Costs: terminar función + REAL inicial = 0
14. Edición de descripción OT con histórico (timestamps)
15. Histórico del sistema también en Comentarios
16. Comentarios multimedia (audio + foto) + agente IA
17. Summary: quitar sección de contratistas
18. Reactivar funciones externas
19. Weekly Scheduling: filtro Estatus solo "En programación"
20. Schedule Technicians: revisión + buscador de OT
21. Trazabilidad OT (auto-asignación / pérdida)
22. Error no replicable en QA
23. OT ↔ Calendario (revisión a fondo)
24. Revisar logs y audit log
25. IA leyendo OTs para varias funciones
26. Priorización de nivel de riesgo por IA (con revisión humana)
27. Restricción: priorización IA solo antes de ejecución
28. Botón Reset: disponible hasta Scheduled
29. **Preparativos**: logística, distancias, bodega y tracking de entrega en tiempo real

---

## 📝 Detalle de hallazgos

### 1. Código de aviso
- Revisar manualmente.

### 2. Columna Priority (lista de WRs)
- Mostrar primero la prioridad que viene en la WR (original).
- Si después se agregan más datos, puede cambiar y mostrarse como `P_original → P_nueva` (ej: P3 → P2, P4 → P1, P3 → P4).
- Validar lógica de cuándo aparece la flecha y cuándo no (en el screenshot se ven casos con y sin flecha).

### 3. Sugerencia de IA en columna de WRs → eliminar
- Quitar la sugerencia de IA visible en la lista/columna de WRs.

### 4. Revisar TAGs de la BD
- Validación completa de los tags en base de datos.
- Definir alcance: ¿todos los activos?, ¿por planta/área?, ¿solo los que aparecen en WRs recientes?

### 5. Revisar a fondo idioma y datos en BD
- Consistencia de idioma (ES/EN/mezclas).
- Calidad de los datos almacenados: descripciones, nombres de tags, ubicaciones técnicas, comentarios.
- Detectar registros con idioma mezclado, caracteres raros, traducciones incompletas o datos vacíos/duplicados.

### 6. Alternativa: BD nueva desde cero
- Decisión pendiente: depurar BD actual vs. construir BD nueva más completa desde cero.
- Evaluar esfuerzo, migración de históricos, impacto en WRs existentes.

### 7. Reparar mínimo de horas en nueva tarea
- Validar valor por defecto / mínimo permitido al agregar una nueva tarea.
- Confirmar valor mínimo correcto (¿0.5h?, ¿1h?, ¿depende del tipo de tarea?).

### 8. Resumen → cambiar a otro color
- Mejorar visibilidad / diferenciación visual.
- Definir paleta y que se diferencie de los estados Pending/Closed/Rejected ya usados.

### 9. Segunda reserva está fallando
- Revisar flujo y causa del fallo.
- Confirmar si es siempre o intermitente, en qué paso ocurre y si afecta a todos los usuarios o solo en ciertos casos.
- Detalle del error pendiente: ¿mensaje?, ¿se cae la pantalla?, ¿no guarda?

### 10. Equipos Apoyo: columna "NOMBRE" → "CARACTERÍSTICAS"
- **Pantalla:** `OT-2026-50126 > Equipos Apoyo` (Work Management → tab Planning).
- Actualmente la 2ª columna se llama "NOMBRE" y duplica el contenido de "EQUIPO" (Mobile crane, Scaffolding, Vibration analyzer, Puente grúa taller).
- Debe renombrarse a **"CARACTERÍSTICAS"** y mostrar las características del equipo (no el mismo nombre).
- Además, revisar idioma de la pantalla (mezcla ES/EN: "Equipos de Apoyo", "Materials", "Operations", "Costs", "Documentos", "Comentarios").

### 11. Columna "HH" → "CANTIDAD"
- Pantalla con columnas `HH | NOTAS` (valor "1" + campo comentarios).
- El encabezado actual "HH" debe cambiarse a **"CANTIDAD"**.
- Revisar consistencia global de la etiqueta en otras pantallas.
- Validar que la unidad sea coherente (cantidad numérica, no horas).

### 12. Más confirmaciones al eliminar
- Al borrar registros (filas, equipos, materiales, reservas, etc.) debe pedirse confirmación explícita antes de ejecutar la acción.
- Modal de "¿Estás seguro?" / doble paso para evitar borrados accidentales.
- Definir alcance, tipo de confirmación (modal, escribir nombre del item, doble click, etc.) y comportamiento en acciones masivas.

### 13. Pestaña Costs: terminar función + REAL inicial = 0
- El campo **REAL debe iniciar en 0** (actualmente muestra $2.500).
- Estado observado: Plan = $2.500, Real (detalle) = $2.500, Delta = 0 → función incompleta / mal alimentada.
- Validar lógica Plan vs. Real vs. Delta (Delta = Real − Plan, o el cálculo definido).
- REAL debe poblarse solo cuando haya consumos reales registrados, no copiar el Plan por defecto.
- Definir si REAL se llena desde partes de trabajo / consumos reales / integraciones (SAP, etc.).
- Revisar mezcla de idiomas en el tab.

### 14. Edición de descripción OT con histórico
- **Caso:** cuando la OT no se guardó bien / se perdió.
- Conservar la **descripción original** con su **fecha y hora** de creación.
- Al darle "Editar", agregar el **nuevo texto** con su propia **fecha y hora** de edición.
- Resultado visible: bloque original (timestamp) + bloque(s) de edición posterior (timestamp).
- Sin pérdida de información ante fallos de guardado.
- Definir formato (texto inline con separadores `--- editado el dd/mm/aaaa hh:mm ---` vs. panel "Historial de cambios").
- Considerar enlace con la pestaña **History** existente.
- Guardar autor del cambio además de fecha/hora.

### 15. Histórico del sistema también en Comentarios
- Cada cambio registrado en el History (descripción, prioridad, estado, equipos, materiales, horas, etc.) debe reflejarse automáticamente como una entrada en la pestaña **Comentarios**.
- Formato: comentario tipo "sistema" con fecha/hora + autor + descripción del cambio.
- Objetivo: trazabilidad completa en un solo lugar.
- Diferenciar visualmente eventos del sistema vs. comentarios manuales (icono, color, etiqueta "Sistema").
- Permitir filtrar (solo manuales / solo sistema / todos).

### 16. Comentarios multimedia + agente IA
**Multimedia:**
- Permitir adjuntar **audios** y **fotos** además de texto.
- Reproductor de audio embebido y previsualización de imágenes.

**Solución agéntica (IA):** procesar comentarios (texto + audio transcrito + imágenes) para:
- Resumir el problema.
- Sugerir soluciones / próximos pasos.
- Detectar duplicados con OTs/avisos previos.
- Auto-clasificar tipo de fallo / prioridad cuando aplique.

**Definiciones pendientes:**
- Formatos/limites: tipos de audio (mp3, m4a, ogg…), duración máx., tamaño máx.; tipos de imagen (jpg, png, heic…), tamaño máx., compresión.
- Permisos: ¿quién puede subir? ¿se modera?
- Privacidad/seguridad: almacenamiento, retención, acceso, anonimización si hay personas en fotos.
- Transcripción de audio: idioma esperado (ES/EN), guardado de transcripción.
- Agente IA: alcance, nivel de autonomía, modelo, latencia, manejo de errores.
- UX: distinguir respuesta del agente vs. comentario humano vs. evento del sistema.
- Auditoría: registrar acciones del agente en History.

### 17. Summary: quitar sección de contratistas
- El bloque de "Contratistas" no debe mostrarse en Summary.
- Confirmar si se elimina por completo o solo se oculta para ciertos perfiles/permisos.
- Validar que su retiro no afecte otras métricas/widgets del Summary.

### 18. Reactivar funciones externas
- Volver a habilitar las funciones/integraciones externas que se desactivaron.
- Identificar exactamente cuáles (¿SAP?, ¿APIs externas?, ¿webhooks?, ¿notificaciones?).
- Plan de reactivación: entornos, credenciales, pruebas de humo.
- Validar que vuelvan a operar correctamente.

### 19. Weekly Scheduling: filtro Estatus solo "En programación"
- **Pantalla:** `Weekly Scheduling > Weekly Schedule`.
- Filtro Estatus actual: **En programación / Planificadas / Todas**.
- Debe quedar **solo "En programación"** (eliminar "Planificadas" y "Todas", o dejarlo fijo sin selector).
- Aviso visible: *"2 OTs disponibles pero filtradas. OTs PM03/P1-P2 van directo a No-Programada (bypass planning). Limpiá filtros para ver todo."* → revisar lógica de bypass al definir el nuevo filtro.
- Confirmar si "Planificadas" y "Todas" se eliminan por completo o solo se ocultan en este flujo.

### 20. Schedule Technicians: revisión + buscador de OT
- **Pantalla:** `Weekly Scheduling > Technicians` (Week 19, May 4–May 10, 2026).
- Detalle: Total Available HH 2018 / Assigned 83 / Remaining 1933, leyenda Día/Noche, "Queda HH", "95-100%", "Sobrecapacidad", columnas Mon/Tue Day-Night, técnicos con horas tipo "8h/40h", "0h/40h", "12h/40h".
- 🔴 **PENDIENTE PARA EL LUNES — preguntar a fondo:**
  - Cómo se calculan HH disponibles vs. asignadas vs. remaining.
  - Lógica Día/Noche, sobrecapacidad.
  - Asignación automática vs. manual.
  - Drag & drop de OTs al calendario.
  - Qué hacer cuando hay 0h/40h asignadas.
- **Buscador de OT:** validar que permita encontrar OT por código, equipo, descripción, técnico asignado; búsquedas parciales; mayúsculas/acentos; alcance del filtro (panel izquierdo y/o calendario).
- Idioma del módulo: mezcla ES/EN ("Technicians", "Recursos", "Work Orders", "Shifts", "7 Days", "Week", "Mes", "Total Available HH", "Assigned", "Remaining", "Sobrecapacidad", "Day/Night/Día/Noche").

### 21. Trazabilidad OT (auto-asignación / pérdida)
- Revisar el flujo: aviso → planificación → programación → asignación → ejecución → cierre.
- Verificar **auto-asignación** sin decisión humana (¿qué regla?, ¿qué técnico?, ¿cuándo?).
- Verificar **pérdida de OTs** en pasos intermedios (no aparecen en Weekly Schedule, no llegan al técnico, quedan en "No-Programada" sin razón clara, desaparecen tras cambio de estado o fallo de guardado).
- Cruzar conteos por estado (Pending / Approved / Rejected / Cancelled / Closed / En programación / Planificadas / No-Programada) vs. total esperado.
- Revisar reglas backend: ¿hay job/cron de auto-asignación?, ¿se considera el calendario del técnico y los HH disponibles?
- Confirmar si el "bypass planning" (PM03 / P1-P2 → No-Programada) provoca falsos "perdidos".
- Cruzar logs/auditoría completa por OT.
- Definir KPIs: % auto-asignadas, % sin asignar tras X horas, % "huérfanas" (sin estado coherente).

### 22. Error no replicable en QA
- Hay un error/bug que se observa en uso real pero **no se ha podido replicar en QA**.
- **Acciones:**
  - Capturar evidencia detallada (screenshot, video, hora exacta, usuario, OT involucrada, pasos previos, navegador/dispositivo, logs consola y red).
  - Revisar logs de backend en el momento del incidente.
  - Comparar entornos PROD vs. QA (datos, versiones, configuraciones, permisos, feature flags).
- **Hipótesis:** dependencia de datos específicos de PROD inexistentes en QA, condiciones de carrera, integraciones externas, caché, sesión/permisos.
- Plantilla de captura + canal de reporte rápido (idealmente botón "Reportar bug" que adjunte logs automáticamente).

### 23. OT ↔ Calendario (revisión a fondo)
- Revisar a fondo la integración entre la **OT** (creación, edición, cambio de estado, asignación) y la **vista de Calendario** (Weekly Schedule, Cronológico, Gantt View, Technicians).
- Verificar consistencia bidireccional: OT ↔ Calendario, sin desfases, duplicados, OTs invisibles, fechas/horas erróneas, técnicos mal asignados.
- Sospecha de error → identificar dónde y en qué dirección.
- Definir matriz de campos sincronizados (fecha inicio, fecha fin, técnico, duración, estado, prioridad).
- Definir dirección de sincronización ante conflictos (¿quién manda?).
- Probar edge cases: cambio de estado durante edición, dos usuarios editando a la vez, OT sin fechas, OT con recursos sobrecargados.

### 24. Revisar logs y audit log
- Revisar **log técnico** (errores, warnings, excepciones backend/frontend) y **audit log** (quién hizo qué, cuándo, sobre qué entidad).
- Confirmar que cada acción crítica (crear/editar/borrar OT, cambiar estado, asignar técnico, modificar costos, ediciones del agente IA) quede registrada.
- Detectar acciones huérfanas (cambios sin autor o sin trazabilidad) y errores recurrentes.
- **Política a definir:**
  - Nivel de detalle mínimo (entidad, acción, autor, timestamp, valor anterior, valor nuevo, IP/dispositivo).
  - Retención (¿cuánto tiempo se guarda?).
  - Acceso (¿quién puede consultarlos?).
  - Inmutabilidad (no editar/borrar el audit log).
  - Para acciones del agente IA: marcar "Autor = Agent / IA" + usuario que confirmó.

### 25. IA leyendo OTs para varias funciones
La IA debe poder **leer las OTs completas** (descripción, prioridad, equipos, materiales, comentarios, audios/fotos, historial) para alimentar:
- Resumen ejecutivo de la OT.
- Sugerencia de solución / próximos pasos.
- Detección de duplicados con OTs históricas.
- **Priorización de nivel de riesgo.**
- Sugerencia de técnico / especialidad.
- Sugerencia de equipos y materiales.
- Estimación de horas.

**Definiciones pendientes:**
- Qué campos puede leer y cuáles no (privacidad, datos sensibles).
- Caché/refresh (¿tiempo real o snapshot?).
- Manejo de OTs con datos incompletos o ambiguos (no inventar — devolver "no concluyente").

### 26. Priorización de nivel de riesgo por IA (con revisión humana)
- La IA propone nivel de riesgo (Nivel 1 = P3/P4, Nivel 2 = P1/P2 — o esquema definido) leyendo el contenido de la OT.
- La propuesta **siempre debe ser revisada por una persona** antes de aceptarse (no auto-aplica).
- UX: badge "Sugerencia IA: Nivel X" + botones **Aceptar / Cambiar / Rechazar**.
- Auditoría: cada decisión humana sobre la sugerencia debe quedar en audit log con autor + timestamp + valor IA + valor final.
- Métricas: % aceptación, % cambio, % rechazo → calidad del modelo.

### 27. Restricción: priorización IA solo antes de ejecución
- La función de priorización por IA solo debe estar **activa para OTs en estados previos a ejecución**.
- ✅ **Estados con función activa:** Created → Released → Planned → In Scheduling → **Scheduled**.
- ❌ **Estados con función oculta/deshabilitada:** In Execution → Closed (y Cancelled / On Hold según política).
- El botón/acción debe ocultarse o quedar deshabilitado en esos estados.
- Validar comportamiento si la OT vuelve atrás de estado (rework): ¿se reactiva la priorización IA?
- Mismo criterio aplicable a otras acciones agénticas que afecten prioridad o alcance.

### 28. Botón Reset: disponible hasta Scheduled
- Botón **Reset** disponible **hasta el estado Scheduled inclusive**.
- Una vez la OT entra a **In Execution**, el reset queda **bloqueado**.
- Se rige por la misma restricción transversal "antes del punto de ejecución".

### 29. 📦 Preparativos: logística, distancias, bodega y tracking en tiempo real

Nuevo apartado dedicado a la **logística previa a la ejecución** de la OT: organizar y seguir todo lo que tiene que llegar al sitio (materiales, herramientas, equipos de apoyo, repuestos) y al técnico, con visibilidad en tiempo real al estilo apps de delivery (Rappi / Uber Eats / PedidosYa).

#### 29.1 Plan de delivery: distancias y bodega
- Calcular y mostrar la **distancia desde la bodega** (origen) hasta la **ubicación técnica / Technical Location** de la OT (destino).
- Estimar tiempo de traslado (ETA) según distancia y medio de transporte (camioneta, grúa, moto interna, etc.).
- Mostrar bodega de origen (puede haber más de una → elegir la más cercana o la que tenga stock disponible).
- Validar disponibilidad de stock en la bodega elegida antes de confirmar el dispatch.
- Si no hay stock en la más cercana, sugerir alternativa con distancia/ETA actualizado.

#### 29.2 Dispatch de entrega de paquetes
- Pantalla/sección de **"Dispatch"** para gestionar la entrega de materiales y equipos hacia la OT.
- Estados sugeridos del paquete:
  - **Preparando en bodega** (picking)
  - **Listo para despachar**
  - **En tránsito** (con tracking en vivo)
  - **Entregado en sitio**
  - **Retraso / Incidente**
  - **Devuelto a bodega** (si aplica)
- Cada cambio de estado debe quedar en **audit log** + reflejarse en pestaña **Comentarios** de la OT (sistema).
- Notificación al planificador / supervisor / técnico cuando el paquete sale, llega o se retrasa.

#### 29.3 Manejo de retrasos
- Si hay **retraso** en la entrega:
  - Marcar el paquete como "Retraso" con motivo (tráfico, falla mecánica, falta de stock, ruta cerrada, etc.).
  - Actualizar ETA automáticamente.
  - Disparar notificación al equipo de la OT.
  - Sugerir acciones: reasignar bodega, dividir el envío, postergar inicio de OT, escalar al supervisor.

#### 29.4 Tracking en tivo real (estilo "motito de delivery")
- Mostrar en un mapa la **ubicación actual** del vehículo/persona que lleva el paquete a la OT, igual que las apps de delivery (Rappi, Uber Eats, PedidosYa) muestran la moto en movimiento.
- Mapa con:
  - Pin de **bodega de origen**.
  - Pin de **destino** (Technical Location de la OT).
  - Ícono móvil del **vehículo en ruta** (auto / camioneta / grúa / moto interna) con actualización en vivo.
  - Línea de ruta sugerida y ruta real recorrida.
  - **ETA dinámico** (se recalcula con tráfico/incidentes).
- Visible para planificador, supervisor y técnico asignado.

#### 29.5 Definiciones pendientes
- **Fuente de geolocalización:** GPS del móvil del transportista, sistema interno de flotas, integración con un proveedor (Google Maps, Mapbox), etc.
- **Frecuencia de actualización:** ¿cada cuántos segundos se refresca la ubicación?
- **Privacidad:** trackear ubicación de personas requiere política y consentimiento — definir alcance y reglas (solo durante el turno, solo durante el trayecto, etc.).
- **Cobertura:** muchas plantas industriales tienen zonas sin señal → plan B (modo offline, último punto conocido, ETA estimado por distancia).
- **Permisos por rol:** quién ve el mapa en vivo (¿solo supervisores? ¿también técnicos?).
- **Integración con la OT:** el dispatch debe enlazarse a la OT y sus materiales/equipos (no es un módulo aislado).
- **Estado del paquete vs. estado de la OT:** definir si la OT puede pasar a "In Execution" antes/después de que el paquete esté entregado, o si depende.
- **Retención de datos de tracking:** ¿cuánto tiempo se guarda el historial de rutas?
- **Múltiples paquetes por OT:** si una OT requiere varios envíos (de distintas bodegas), tracking independiente para cada uno.
- **Auditoría:** cada movimiento del paquete y cada actualización de ubicación queda en audit log.

#### 29.6 Casos de prueba sugeridos (preliminares)
- OT con bodega única y distancia corta → ETA, dispatch, tracking, entrega OK.
- OT con varias bodegas candidatas → sistema sugiere la óptima por distancia + stock.
- OT con múltiples paquetes desde distintas bodegas → tracking independiente por paquete.
- Simulación de retraso → notificación, recalculo de ETA, registro en Comentarios.
- Pérdida de señal del transportista → fallback a último punto conocido + ETA estimado.
- Permisos: técnico ve solo su entrega; supervisor ve todas; operador no ve mapa.
- Cierre de la OT antes de entrega completa → comportamiento esperado.

---

## 🤖 Resumen: Soluciones agénticas nuevas

**Total: 10 funciones agénticas** (agrupadas en 2 bloques)

### Bloque A — Sobre Comentarios (multimedia)
1. Transcripción automática de audios subidos como comentario.
2. Resumen del problema reportado en el hilo de comentarios.
3. Sugerencia de soluciones / próximos pasos.
4. Detección de duplicados con OTs/avisos previos.
5. Auto-clasificación del tipo de fallo.

### Bloque B — Sobre la OT completa (la IA lee la OT)
6. Resumen ejecutivo de la OT.
7. Priorización de nivel de riesgo (Nivel 1/2) — *solo hasta Scheduled, con revisión humana*.
8. Sugerencia de técnico / especialidad.
9. Sugerencia de equipos y materiales.
10. Estimación de horas.

➕ **Se elimina** la "Sugerencia de IA" actual que aparece en la columna de WRs.

---

## 📌 Restricción transversal "antes del punto de ejecución"

Aplica a las funciones que pueden modificar el alcance/prioridad/recursos de la OT (mínimo: priorización de riesgo + botón **Reset**):

- ✅ **Estados donde la función está activa:** Created → Released → Planned → In Scheduling → **Scheduled**
- ❌ **Estados donde la función queda oculta/deshabilitada:** In Execution → Closed (y Cancelled / On Hold según se defina)

---

## 🔴 Pendiente clave para el LUNES

1. **Schedule Technicians** – preguntar a fondo: lunes, lógica HH, Día/Noche, sobrecapacidad, asignación auto vs. manual, drag & drop, 0h/40h.
2. **Soluciones agénticas** – respaldar bien: alcance, casos de uso, autonomía, gobernanza, KPIs, riesgos, plan de pruebas, plan de rollback.
3. **Error no replicable en QA** – estrategia para capturarlo y reproducirlo.
4. **Trazabilidad OT** – auto-asignación / pérdida en el flujo.
5. **OT ↔ Calendario** – revisar a fondo, identificar el bug.
6. **Logs y audit log** – revisión y política.
7. **IA leyendo OTs + priorización IA** – con revisión humana, solo antes de ejecución.
8. **Botón Reset** – confirmar comportamiento en cada estado.
9. **Preparativos / logística** – definir fuente de geolocalización, política de privacidad para tracking de personas, cobertura sin señal, integración con bodegas y stock.

---

## ❓ Preguntas a llevar al lunes (Soluciones agénticas)

- ¿Qué casos de uso concretos cubre el agente? (resumen, sugerencias, duplicados, clasificación, asignación, redacción, análisis multimedia, otros).
- ¿Solo sugiere o también ejecuta acciones? (crear OT, asignar técnico, cambiar estado, cerrar OT, comprar materiales).
- ¿Nivel de autonomía? (humano-en-el-loop obligatorio vs. acciones autónomas con auditoría).
- ¿Qué modelo de IA se usa? ¿Hosting? ¿Costos por uso?
- ¿Cómo se manejan datos sensibles? Privacidad, retención, anonimización.
- ¿Qué pasa cuando el agente se equivoca? Política de errores, reversibilidad, "deshacer".
- ¿KPIs y evaluación de calidad? Feedback humano.
- ¿Auditoría completa? Cada acción/sugerencia + decisión humana asociada.
- ¿Permisos por rol? (operador, planificador, supervisor, admin).
- ¿Mitigación de sesgos / "alucinaciones"?
- ¿Fallback si el servicio del agente cae?
- ¿Entrenamiento/afinamiento con datos propios sin filtrar info?

---

*Documento generado el 08/05/2026 – pendiente de complementar con casos de prueba y plan de pruebas formal.*
