# AMS Platform — Manual de Usuario
### Asset Management Software v2.0
**Value Strategy Consulting**

---

## Tabla de Contenidos

1. [Inicio de Sesion](#1-inicio-de-sesion)
2. [Dashboard](#2-dashboard)
3. [Work Management](#3-work-management)
4. [Work Requests (Avisos)](#4-work-requests-avisos)
5. [Planning (Planificacion)](#5-planning-planificacion)
6. [Scheduling (Programacion)](#6-scheduling-programacion)
7. [Execution (Ejecucion)](#7-execution-ejecucion)
8. [Failures & Events](#8-failures--events)
9. [Improvement Actions](#9-improvement-actions)
10. [Analytics](#10-analytics)
11. [Reports](#11-reports)
12. [Team](#12-team)
13. [Settings](#13-settings)
14. [Data Import](#14-data-import)
15. [AI Agents (CORTEX)](#15-ai-agents-cortex)
16. [Mobile](#16-mobile)
17. [Roles y Permisos](#17-roles-y-permisos)
18. [Preguntas Frecuentes](#18-preguntas-frecuentes)

---

## 1. Inicio de Sesion

### Acceso
1. Navegue a la URL de su instancia AMS (ej: `ocp.aiprowork.com`)
2. Ingrese su **usuario** y **contrasena**
3. Presione **Sign In**

### Primera vez
- Al ingresar por primera vez, aparecera un **tour guiado** de 6 pasos
- Puede saltarlo con "Skip tour" o seguir con "Next"
- El tour no se mostrara de nuevo

### Selector de Planta
- En la parte superior izquierda, seleccione la planta donde trabajara
- Cada planta tiene datos independientes (WRs, WOs, KPIs, equipo)
- El selector recuerda su ultima seleccion

### Cambio de Vista
- **Executive View**: KPIs estrategicos, graficos de tendencia, resumen general
- **Tactical Operations View**: Metricas operativas detalladas, compliance, backlog

### Idioma
- Icono de globo (esquina superior derecha) para cambiar entre:
  - English (EN)
  - Espanol (ES)
  - Arabic (AR) — soporte RTL

---

## 2. Dashboard

El dashboard es la pantalla principal con dos vistas:

### Executive View
- **KPIs principales**: Availability, MTBF, MTTR, OEE con indicadores de estado
- **Alertas del sistema**: Problemas criticos que requieren atencion
- **5 Tabs**:
  - **Produccion**: Metricas de produccion y eficiencia
  - **Mantenimiento**: Work orders, compliance, backlog
  - **Dotaciones**: Personal activo, disponibilidad, carga de trabajo
  - **HSE**: Seguridad, incidentes, compliance
  - **Mejora Continua**: Acciones de mejora, CAPA tracking
- **AI Summary**: Resumen inteligente generado por IA (boton "Generate AI Summary")

### Tactical Operations View
- **Work Volume**: Horas de mantenimiento por semana, tendencia
- **Schedule Compliance**: Adherencia al programa vs target
- **Work Orders by Type**: Preventivo, Correctivo, Predictivo
- **Backlog Aging**: Antiguedad de items en backlog

---

## 3. Work Management

Hub central que muestra el resumen de toda la gestion de trabajo:
- Total de Work Requests activos
- Total de Work Orders por estado
- Pipeline visual del flujo de trabajo
- Acceso rapido a cada modulo

---

## 4. Work Requests (Avisos)

### Crear un Work Request
1. Click en **+ New WR** (boton verde)
2. Complete los campos:
   - **Equipment**: Seleccione el equipo (busqueda por TAG o nombre)
   - **Failure Description**: Describa el problema
   - **Priority**: P1 (Inmediata), P2 (Alta), P3 (Media), P4 (Baja)
   - **Production Impact**: CRITICAL, HIGH, MEDIUM, LOW
3. La IA automaticamente:
   - Clasifica la falla
   - Sugiere prioridad
   - Detecta duplicados
   - Genera titulo descriptivo
4. Click **Submit**

### Gestionar Work Requests
- **Filtros**: Por estado, prioridad, area, equipo
- **Acciones por WR**:
  - **Approve** (verde): Validar y aprobar el aviso
  - **Reject** (rojo): Rechazar con motivo
  - **Create WO**: Convertir en Orden de Trabajo
  - **Cancel**: Cancelar el aviso
  - **Complete/Close**: Marcar como completado/cerrado
- **Deteccion de duplicados**: Al crear, el sistema muestra WRs similares en formato carrusel lado a lado

### Estados del WR
```
DRAFT → PENDIENTE → VALIDATED → APROBADO → EN_EJECUCION → COMPLETADO → CERRADO
                  ↘ RECHAZADO
                  ↘ CANCELADO
                  ↘ ELIMINADO
```

### Eliminados (Papelera)
- Tab "Eliminados" para ver WRs eliminados
- Solo admin/manager pueden **Restaurar** o **Eliminar permanentemente**
- Se registra motivo de eliminacion

---

## 5. Planning (Planificacion)

### Crear Work Order desde WR
1. En Work Requests, seleccione un WR aprobado
2. Click **Create WO**
3. Se genera automaticamente con:
   - Numero de OT (ej: OT-2026-00042)
   - Datos del WR (equipo, descripcion, prioridad)
   - Fechas planificadas

### Planificar Work Order
1. Seleccione una OT en estado CREADO
2. Complete:
   - **Operations**: Lista de operaciones (tipo, especialidad, horas)
   - **Materials**: Materiales necesarios (busqueda SAP)
   - **Work Center**: Centro de trabajo asignado
   - **Dates**: Fecha inicio/fin planificadas
   - **Budget**: Presupuesto (mano de obra, materiales, servicios externos)
3. Click **Plan** para cambiar estado a PLANIFICADO

### External Vendor (Servicios Externos)
- Click **+ External Service** para agregar proveedor
- Formulario tipo SAP con:
  - Service number, description, quantity, unit price
  - Plant, purchasing group, cost center

### AI Tools
- **Compare OTs**: Compara ordenes similares para estimar duracion
- **Cost Alerts**: Alertas de sobrecosto basadas en historico
- **Strategy**: Recomienda estrategia de mantenimiento

---

## 6. Scheduling (Programacion)

### Programar Semana
1. Click **Schedule Week** (boton morado)
2. El sistema distribuye las OTs automaticamente:
   - **P1**: Lunes (urgente)
   - **P2**: Lunes-Miercoles
   - **P3**: Cualquier dia
   - **P4**: Viernes (baja prioridad)
3. Balance de carga por dia para distribucion uniforme

### Gantt Chart
- Vista visual de OTs programadas por dia
- Colores por tipo (Preventivo=azul, Correctivo=rojo, etc.)
- Hover para ver detalles

### HH Balance (Horas Hombre)
- Gauge circular de utilizacion por especialidad
- Rojo si > 100% (sobrecargado)
- Verde si < 80% (capacidad disponible)

### Materials
- Estado de materiales por OT
- Confirmed/Pending/Missing indicators
- Permite verificar disponibilidad antes de ejecutar

### Clear Assignments
- Boton para limpiar asignaciones de la semana
- Resetea OTs a estado PLANIFICADO

---

## 7. Execution (Ejecucion)

### My Tasks
- Tareas asignadas al usuario logueado
- Click para ver detalle y actualizar progreso
- Marcar como "In Progress" o "Completed"

### All Tasks
- Vista de todas las tareas activas de la planta
- Filtros por tecnico, estado, prioridad

### Daily Meeting (Reunion Diaria)
- **AI Briefing**: Genera resumen automatico del dia
- Cards de Work Orders para discutir
- Estado de cada OT con indicadores visuales

### Equipment Handovers
- Registro de entrega/recepcion de equipos entre turnos
- Cards con avatar de tecnico, estado del equipo, notas
- Colores por tipo de handover

### Supervisor Sign-off
- Comparacion **Plan vs Actual** por OT
- Horas planificadas vs ejecutadas
- Aprobacion del supervisor para cerrar

### WO Closure
- Formulario de cierre con:
  - Horas reales trabajadas
  - Materiales utilizados
  - Hallazgos y observaciones
  - Estado final del equipo
- **PDF Report**: Genera reporte de cierre descargable (autenticado)
- Grid de 2 columnas con toda la informacion

---

## 8. Failures & Events

### Vista Principal
- Tabla de fallas con colores por prioridad:
  - **P1** (rojo): Inmediata
  - **P2** (naranja): Alta
  - **P3** (amarillo): Media
  - **P4** (azul): Baja
- Filtros por grupo de planificacion, disciplina, especialidad

### Acciones
- **RCA** (Root Cause Analysis): Iniciar analisis de causa raiz
- **Generate WO**: Crear OT desde la falla
- **Dispatch Support**: Enviar soporte tecnico
- **Optimize Strategy**: IA sugiere estrategia de mantenimiento
- **Adjust Planning**: Ajustar planificacion basada en falla

### Estadisticas
- **Master Data Stats**: Equipos afectados, tipos de falla
- **Planning Stats**: Ordenes generadas, backlog impactado

---

## 9. Improvement Actions

### Panel Principal
- Header con **AI Detection Center**
- Toggle para **Automatic Action Creation** (la IA crea acciones automaticamente)
- Boton **Analyze Weekly Deviations** para detectar desviaciones

### Gestionar Acciones
- Crear nueva accion de mejora
- Asignar responsable y fecha limite
- Seguimiento de estado: OPEN → IN_PROGRESS → COMPLETED
- Fuentes: Manual, RCA, FMEA, AI-detected, Audit

### Tabs
- **Acciones de Mejora**: Lista principal
- **CAPA Tracking**: Acciones correctivas y preventivas

---

## 10. Analytics

### Executive View
- **KPI Cards**: Availability, MTBF, MTTR, OEE con iconos de color
- **Trend Chart**: Adherencia + OEE vs target 95%
- **Reliability KPIs**: MTBF, MTTR, Availability por equipo
- **Work Orders by Type**: Tabla con count, horas, criticidad
- **Cost by Area**: Grafico horizontal de costos por area

### Tactical Operations View
- **Tabs**: KPIs de Resultados / KPIs de Disciplina Operacional
- **Discipline KPIs**: Pendientes, No asignados, Compliance, OEE
- **Area Filters**: Crushing, Grinding, Flotation, Thickening, Tailings
- **WR Status Breakdown**: Cards coloreadas por estado
- **Trend + Pareto**: Graficos de tendencia y distribucion

---

## 11. Reports

### Generar Reporte
1. Seleccione tipo: Weekly KPI, Monthly KPI, or Operational
2. Click **Generate Report**
3. Vista previa aparece en el panel izquierdo
4. Export como XLSX o CSV

### Templates Disponibles
| Template | Tipo | Frecuencia |
|----------|------|------------|
| Weekly Maintenance Report | Operational | Semanal |
| Backlog Analysis | Analytical | Quincenal |
| Executive KPI Dashboard | Executive | Mensual |
| Reliability Report | Technical | Mensual |
| SAP Order Closure | SAP | Semanal |
| FMEA/FMECA Review | Technical | Trimestral |

### Data Export
- **Work Requests**: Todos los avisos con detalle completo
- **Backlog Items**: Items en backlog con razon y antiguedad
- **Reliability KPIs**: MTBF, MTTR, Availability, OEE por equipo
- **SAP Orders**: Ordenes SAP confirmadas/cerradas

### Weekly Summary Preview
- Adherencia al plan (% vs 90% target)
- WOs completadas vs planificadas
- WRs pendientes de validacion
- Total de backlog
- Resumen ejecutivo automatico generado

### Filtros
- Filter tabs: All, Executive, Operations, Reliability, Engineering, Financial, Planning
- Filtrado por planta (automatico)

---

## 12. Team

### Ver Equipo
- Lista de todos los miembros con:
  - Nombre, email, rol, planta asignada
  - Estado (activo/inactivo)
  - Ultimo login

### Agregar Miembro
1. Click **+ Add Member**
2. Complete: nombre de usuario, email, nombre completo, contrasena
3. Seleccione rol: Admin, Manager, Planner, Technician
4. Seleccione planta
5. Click **Create**

### Roles
- **Admin**: Acceso total a todos los modulos
- **Manager**: Dashboard ejecutivo, analytics, reportes, equipo
- **Planner**: Planificacion, scheduling, work requests, work orders
- **Technician**: Ejecucion de tareas, creacion de WRs
- **Engineer**: Reliability, FMEA, analytics
- **Supervisor**: Ejecucion, sign-off, supervision

### Gestionar Miembros
- **Edit**: Cambiar datos del perfil
- **Change Role**: Reasignar rol
- **Deactivate**: Desactivar cuenta (no elimina datos)

---

## 13. Settings

### General
- Nombre de la empresa
- Zona horaria
- Planta por defecto
- Moneda
- Auto-guardado
- Habilitacion de IA

### KPI Targets
- Availability target (%)
- MTBF target (horas)
- MTTR target (horas)
- Planned Work target (%)
- Labor rate ($/hora)

### Notificaciones
Configurar alertas para:
- Fallas criticas
- Retrasos en WOs
- Alertas KPI
- Acciones de mejora
- Reporte semanal
- Canales: Email, SMS, In-App

### Apariencia
- Tema claro/oscuro
- Idioma (English, Espanol, Arabic)

### Data Management
- Importar datos (Excel/CSV)
- Exportar configuracion

---

## 14. Data Import

### Proceso de Importacion
1. **Upload**: Arrastre o seleccione archivo Excel (.xlsx) o CSV (.csv)
   - Maximo 50MB
2. **Preview**: Vea las primeras filas y columnas
   - Si es Excel multi-hoja, seleccione la hoja
3. **Column Mapping**: 
   - Automatico: El sistema detecta columnas por nombre
   - Manual: Arrastre columnas del archivo a campos de la tabla
4. **Target Table**: Seleccione tabla destino (equipos, WRs, WOs, etc.)
5. **Import Mode**:
   - **Append**: Agrega registros nuevos
   - **Replace**: Reemplaza todos los datos
   - **Merge**: Actualiza existentes, agrega nuevos
6. **Execute**: Click **Import** para ejecutar
7. **History**: Revise el historial de importaciones

### AI-Assisted Import
- Toggle **AI Detection** para que la IA:
  - Sugiera tabla destino optima
  - Detecte problemas de calidad de datos
  - Mapee columnas automaticamente

### Templates
- Descargue templates vacios para cada tabla
- Incluyen headers correctos y formatos esperados

---

## 15. AI Agents (CORTEX)

### 33 Agentes Especializados en 4 Equipos

**Team A — Project Delivery**
- Orchestrator, Engineering, Construction, Contracts

**Team B — Operations & Assets**
- Reliability, Planning, Spare Parts, Operations, HSE, Execution

**Team C — Corporate**
- Finance, HR & Talent, IT/OT

**Team D — Intelligence**
- Web Intelligence

### Agentes Principales
| Agente | Funcion |
|--------|---------|
| Equipment Doctor | Diagnostico de equipos basado en sintomas |
| KPI Watchdog | Monitoreo continuo de KPIs y alertas |
| Safety Checklist | Generacion de checklists de seguridad |
| Smart Backlog | Optimizacion inteligente del backlog |
| Predictive Health | Prediccion de fallas basada en datos |
| RCM Advisor | Recomendaciones de mantenimiento centrado en confiabilidad |
| Budget Sentinel | Control y alertas de presupuesto |
| Chronic Failure Tracker | Seguimiento de fallas cronicas |
| Material Readiness | Verificacion de disponibilidad de materiales |
| Shift Handover | Asistencia en cambio de turno |
| Executive Report | Generacion automatica de reportes ejecutivos |

### Flujo de Trabajo AI
1. El agente recibe datos del sistema (WRs, WOs, KPIs)
2. Analiza patrones y genera recomendaciones
3. Presenta resultados al usuario
4. **Human-in-the-loop**: Toda decision requiere aprobacion humana

---

## 16. Mobile

### Acceso
- Navegue a la misma URL desde su celular
- La app detecta automaticamente el dispositivo movil
- Instalable como PWA (Add to Home Screen)

### Funciones Mobile
- **Dashboard**: KPIs resumidos, tareas pendientes
- **Crear WR**: Formulario simplificado para reportar fallas en campo
- **Mis Tareas**: Ver y ejecutar tareas asignadas
- **Work Orders**: Consultar OTs asignadas
- **Detalle WR**: Ver toda la informacion de un aviso

### Offline
- La app cachea datos de API automaticamente
- Al perder conexion, muestra ultimos datos disponibles
- Al reconectar, sincroniza automaticamente

---

## 17. Roles y Permisos

### Matriz de Acceso

| Modulo | Admin | Manager | Planner | Engineer | Supervisor | Technician |
|--------|-------|---------|---------|----------|------------|------------|
| Dashboard | Full | Full | View | View | View | View |
| Work Requests | Full | View | Full | Full | View | Create |
| Work Orders | Full | View | Full | View | View | View |
| Planning | Full | View | Full | View | No | No |
| Scheduling | Full | View | Full | View | View | No |
| Execution | Full | View | View | View | Full | Full |
| Analytics | Full | Full | View | Full | View | No |
| Reports | Full | Full | Full | Full | View | No |
| Team | Full | View | No | No | No | No |
| Settings | Full | No | No | No | No | No |
| Data Import | Full | Full | Full | No | No | No |
| AI Agents | Full | Full | Full | Full | View | View |
| FMEA/RCM | Full | View | View | Full | No | No |
| Reliability | Full | View | View | Full | No | No |
| SAP PM | Full | Full | Full | No | No | No |

### Niveles de Vista
- **Full**: Ver, crear, editar, eliminar
- **View**: Solo lectura
- **Create**: Puede crear nuevos registros pero no editar/eliminar
- **No**: Sin acceso (no aparece en sidebar)

---

## 18. Preguntas Frecuentes

**P: No puedo ver un modulo en el sidebar**
R: Su rol no tiene permisos. Contacte a su administrador.

**P: Los KPIs muestran "—"**
R: No hay datos suficientes para calcular. Importe datos historicos o espere a que se acumulen registros.

**P: Como cambio mi contrasena?**
R: Settings > Profile > Change Password

**P: Como exporto datos?**
R: Reports > seleccione template > Download (XLSX/CSV). O use Data Export en la misma pagina.

**P: El reporte no filtra por mi planta**
R: Verifique que tiene una planta seleccionada en el selector superior.

**P: Como instalo la app en mi celular?**
R: Abra la URL en Chrome/Safari > Menu > "Add to Home Screen" / "Install App"

**P: Puedo usar la app sin internet?**
R: Si, la app cachea datos automaticamente. Al reconectar, se actualiza.

**P: Donde reporto un bug?**
R: Use el boton de Feedback (esquina inferior izquierda) para reportar problemas.

**P: Como se calculan los KPIs?**
R:
- **MTBF** = Total operating hours / Number of failures
- **MTTR** = Total repair hours / Number of repairs
- **Availability** = MTBF / (MTBF + MTTR) x 100
- **OEE** = Availability x Performance x Quality

---

## Soporte

Para asistencia tecnica, contacte a su administrador de sistema.

**AMS Platform v2.0**
Value Strategy Consulting
