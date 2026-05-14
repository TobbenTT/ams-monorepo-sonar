# GFSN Planning & Scheduling Full Procedure / Procedimiento Completo de Planificacion y Programacion de Mantenimiento

---

| Metadata | Value |
|---|---|
| **Source File** | `planning-scheduling-procedure--GFSN01-DD-EM-0000-PT-00006-Procedimiento Planificacion y Programacion_Rev 0.pdf` |
| **Document Code** | GFSN01-DD-EM-0000-PT-00006 |
| **Original Title** | Procedimiento para la Planificacion y Programacion del Mantenimiento |
| **Organization** | Minera Gold Fields Salares Norte (MGSN) |
| **Author** | Ausenco |
| **Approved by** | Ernesto Holzmann |
| **Version** | 2 (Mayo 2022) |
| **Next Review** | Mayo 2023 |
| **Page Count** | 34 |
| **Conversion Date** | 2026-02-23 |
| **Language** | Spanish (original) with English section headers |

---

## Used By Skills

| Skill | Usage |
|---|---|
| `schedule-weekly-program` | Primary procedure - defines weekly program creation, weekly scheduling meeting, pre-program elaboration, SAP-PM transactions, and program adjustment process |
| `group-backlog` | Defines backlog management (overdue work orders in LIB/NOTP status), SAP-PM status codes, and work order grouping by craft/area |
| `calculate-planning-kpis` | Defines all 11 planning & scheduling KPIs: WO compliance, HH compliance, PM plan compliance, backlog, reactive work, schedule adherence, release horizon, notice management, scheduled capacity, proactive work, planning efficiency |
| `generate-reports` | Defines report types, frequencies (weekly/monthly), and stakeholders for P&P process reporting |

---

## Table of Contents / Tabla de Contenido

1. [Objetivos / Objectives](#1-objetivos--objectives)
2. [Alcance / Scope](#2-alcance--scope)
3. [Definiciones / Definitions](#3-definiciones--definitions)
4. [Terminos SAP-PM / SAP-PM Terms](#4-terminos-sap-pm--sap-pm-terms)
5. [Modelo de Planificacion y Programacion / Planning & Scheduling Model](#5-modelo-de-planificacion-y-programacion--planning--scheduling-model)
   - 5.1 [Inicio del proceso / Process Start](#51-inicio-del-proceso--process-start)
   - 5.2 [Priorizacion de actividades / Activity Prioritization](#52-priorizacion-de-actividades--activity-prioritization)
   - 5.3 [Actividades de tipo preventivo / Preventive Activities](#53-actividades-de-tipo-preventivo--preventive-activities)
   - 5.4 [Actividades de tipo correctivo / Corrective Activities](#54-actividades-de-tipo-correctivo--corrective-activities)
   - 5.5 [Planificacion de mantenimiento / Maintenance Planning](#55-planificacion-de-mantenimiento--maintenance-planning)
   - 5.6 [Programacion de mantenimiento / Maintenance Scheduling](#56-programacion-de-mantenimiento--maintenance-scheduling)
   - 5.7 [Ejecucion / Execution](#57-ejecucion--execution)
   - 5.8 [Cierre / Closure](#58-cierre--closure)
   - 5.9 [Medicion de indicadores / KPI Measurement](#59-medicion-de-indicadores--kpi-measurement)
   - 5.10 [Actualizar planes de mantenimiento / Update Maintenance Plans](#510-actualizar-planes-de-mantenimiento--update-maintenance-plans)
   - 5.11 [Reportes y documentos / Reports and Documents](#511-reportes-y-documentos--reports-and-documents)
6. [Roles y Responsabilidades / Roles and Responsibilities](#6-roles-y-responsabilidades--roles-and-responsibilities)
7. [Anexos / Appendices](#7-anexos--appendices)

---

## 1. Objetivos / Objectives

Este documento proporciona un marco guia para asegurar la correcta planificacion, programacion y notificacion de las ordenes de trabajo a traves del modulo SAP-PM alineado a las buenas practicas existentes en la industria que permitan un efectivo control de las actividades de mantenimiento rutinario con un enfoque en el mejoramiento continuo. Adicionalmente se busca:

- Identificar los pasos para definir, planear, programar y notificar los trabajos de mantenimiento rutinario a ejecutar durante los periodos de programacion semanal.
- Optimizar los recursos de personal, materiales, repuestos y herramientas a utilizar durante la planificacion y programacion de actividades fuera del plan de mantenimiento.
- Medir, gestionar y controlar el modelo de planificacion y programacion de mantenimiento rutinario a traves de indicadores claves de desempeno.

---

## 2. Alcance / Scope

El presente procedimiento establece los lineamientos y practicas estandarizadas de los subprocesos, roles, responsabilidades, indicadores y actividades enmarcadas en el ciclo de mejoramiento continuo, dentro del modelo de planificacion y programacion de actividades rutinarias establecidas para la operacion de MGSN. Etapas definidas:

1. Planificacion de mantenimiento
2. Programacion de mantenimiento
3. Ejecucion de mantenimiento rutinario
4. Cierre
5. Analisis e implementacion de mejoras identificadas en el proceso

---

## 3. Definiciones / Definitions

**CMMS**: Sistema computarizado administracion de mantenimiento.

**Planificacion (mantenimiento) / Planning**: Proceso que identifica mano de obra, materiales, herramientas y requisitos de seguridad para las ordenes de trabajo de mantenimiento; el planificador reune esta informacion en un paquete de plan de trabajo y se la comunica al supervisor de mantenimiento y/o trabajadores antes de comenzar el trabajo. [SMRP_Best_Practices_6th_Edition].

**Programacion / Scheduling**: Es la administracion de actividades definiendo tiempo y fechas en las cuales seran ejecutadas determinando el riesgo que produzcan desviaciones en la programacion.

**Mantenimiento / Maintenance**: Combinacion de todas las acciones tecnicas y de gestion destinadas a mantener un elemento en un estado en el que pueda cumplir la funcion deseada. [ISO 14224:2016, 3.49]

**Programa de mantenimiento / Maintenance Schedule**: Documento que contiene las tareas a ejecutar de acuerdo con un programa de tiempo especificado, el cual debe incluir secuencia, recursos y responsables para su ejecucion. [Modificado de IEC 60050:2015, 192-06-12]

**Procedimiento / Procedure**: Es un conjunto de acciones estructuradas y especificas para llevar a cabo una actividad o un proceso. [ISO 9000:2015, 3.4.5]

**SAP-Enterprise Resource Planning**: Sistema de planificacion de recursos encargado de administrar los diferentes procesos del negocio de la compania.

**Peligro / Hazard**: Es una fuente, condicion, situacion o acto que puede causar lesion o enfermedad, dano a la propiedad o deterioro. [Adaptado de ISO 45001:2015, 3.18]

**Riesgo / Risk**: Es el "efecto de la incertidumbre sobre los objetivos" y un efecto es una desviacion positiva o negativa de lo que se espera. [ISO 31000:2018, 3.1]

**Overhaul**: Es un grupo de tareas complejas orientadas al reacondicionamiento/repotenciacion de un activo a su estado operativo/funcional con el objetivo de aumentar su vida util.

**Matriz de riesgo / Risk Matrix**: Herramienta de control y de gestion utilizada para identificar las actividades mas importantes de una empresa, el tipo y nivel de riesgos inherentes y los factores exogenos y endogenos relacionados. Permite evaluar y priorizar el riesgo de las actividades de mantenimiento. [Adaptado de ISO 31000:2018, 3.6, 3.7]

**Matriz de priorizacion de trabajo / Work Prioritization Matrix**: Matriz de evaluacion de requerimiento de actividades la cual evalua la criticidad del equipo con las posibles consecuencias que podria generar la no atencion de un evento.

**Paquetes de trabajo / Work Packages**: Contempla toda la informacion y documentacion necesaria para el correcto y seguro desarrollo de una actividad (permiso de trabajo, orden de trabajo, analisis de riesgo, etc.)

**Transacciones SAP / SAP Transactions**: Terminologia utilizada en el sistema SAP, se refiere al ingreso de comandos que permiten realizar operaciones dentro del sistema.

**Orden de trabajo / Work Order**: Registro que se elabora con el fin de aceptar una solicitud de servicio que contiene toda la informacion necesaria para la completa ejecucion de una actividad, incluye entre otros recursos de mano de obra, materiales y repuestos.

---

## 4. Terminos SAP-PM / SAP-PM Terms

### Estatus de Avisos de Mantenimiento / Maintenance Notification Status

| Codigo | Nombre | Descripcion |
|---|---|---|
| **MEAB** | Mensaje Abierto | Aviso recien creado, sin gestion |
| **METR** | Mensaje en Tratamiento | Aviso aprobado, listo para generar OT |
| **MECE** | Mensaje Cerrado | OT cerrada y alcance del aviso cumplido |
| **ORAS** | Orden de Mantenimiento referida al aviso | Una OT ha sido generada para el aviso |

### Estatus de Ordenes de Mantenimiento / Maintenance Order Status

| Codigo | Nombre | Descripcion |
|---|---|---|
| **ABIE** | Abierto | Orden abierta |
| **LIB** | Liberado | Orden aprobada para ejecucion |
| **CTEC** | Cerrado tecnicamente | Orden cerrada tecnicamente |
| **FMAT** | Falta disponibilidad material | A la espera de materiales |
| **IMPR** | Impreso | Orden impresa |
| **NOTP** | Notificado parcialmente | Notificacion parcial registrada |
| **NOTI** | Notificado | Orden completamente notificada |
| **PREC** | Precalculo del costo | Costeo previo realizado |
| **DDPN** | Log de ordenes necesario | Se requiere registro de log |
| **DMNV** | Disponibilidad material no verificada | Material no verificado |
| **FENA** | Fechas no actuales | Fechas desactualizadas |
| **MOVM** | Movimiento de mercancias ejecutado | Materiales movidos |
| **NLIQ** | Norma de liquidacion entrada | Regla de liquidacion ingresada |

### Estatus de Usuario SAP-PM / User Status SAP-PM

| Codigo | Nombre | Descripcion |
|---|---|---|
| **PLN** | En proceso de planificacion | Ordenes de trabajo en proceso de planificacion |
| **FMA** | Falta material | Ordenes a la espera de materiales para ejecucion |
| **LPE** | Listas para ejecutar | Ordenes con planificacion finalizada, listas para ejecutar |

---

## 5. Modelo de Planificacion y Programacion / Planning & Scheduling Model

### Overview / Vision General del Proceso

```
[Priorizacion] --> [Planificacion] --> [Programacion] --> [Ejecucion] --> [Cierre] --> [Analisis y Mejoras]
      ^                                                                                      |
      |______________________________________________________________________________________|
                                   (Ciclo de mejoramiento continuo)
```

### 5.1 Inicio del proceso / Process Start

El proceso inicia con la recepcion de las necesidades de ejecucion de actividades de mantenimiento, las cuales provienen de dos grandes fuentes:

1. **Actividades de tipo preventivo y predictivo**: Generadas a partir del plan matriz de mantenimiento (actividades planificadas a ejecutar antes de la perdida de la funcion de los activos).

2. **Actividades de tipo correctivo**: No incluidas en el programa del trabajo estructurado, corresponden a actividades identificadas desde la operacion de los equipos o en una ejecucion planificada por medio de un aviso de mantenimiento en SAP, cuya programacion depende de las consecuencias generadas y al nivel de riesgo (actividades a ejecutar despues de la perdida de la funcion de los activos).

**Transacciones Claves en SAP-PM:**
- `IW21`: Creacion de aviso PM
- `IW22`: Modificar aviso PM
- `IW23`: Visualizar aviso PM
- `IW28`: Modificar avisos PM

### 5.2 Priorizacion de actividades / Activity Prioritization

Para priorizar las actividades es importante identificar la criticidad del equipo y determinar el nivel maximo de consecuencia en caso de no atender la solicitud de mantenimiento. El nivel de atencion resulta del intercepto entre la consecuencia mas alta y la criticidad del activo.

#### Matriz de Priorizacion de Mantenimiento / Maintenance Prioritization Matrix

| Nivel de Riesgo | Tiempo de Ejecucion | Descripcion | Gestionado por |
|---|---|---|---|
| **Alto** | Inmediata | La no ejecucion genera una amenaza inmediata a la seguridad de las personas, los activos y el medio ambiente | Supervisor de ejecucion de mantenimiento |
| **Moderado** | < 2 semanas | La no ejecucion genera una situacion peligrosa en seguridad, puede afectar con el tiempo las metas de produccion o generar altos costos en la reparacion por fallas multiples | Planificador |
| **Bajo** | > 2 semanas | Actividades que mejoran la eficiencia de los procesos productivos y la integridad de los activos | Planificador |

> **Importante**: Esta matriz debera ser configurada en SAP-PM con el fin que el identificador de necesidad (area usuaria) pueda realizar una valoracion inicial, la cual debera ser confirmada por el aprobador (mantenimiento).

### 5.3 Actividades de tipo preventivo / Preventive Activities (Before Failure)

Durante esta etapa se debera consultar y verificar SAP-PM con el fin de identificar todos los trabajos que hayan sido generados a traves de los planes de mantenimiento segun la estrategia definida.

El planificador debera crear una lista del trabajo preliminar con base en la fecha prevista a traves de SAP-PM.

**Transacciones claves para definir el programa preliminar:**
- `IW38`: Modificar Ordenes PM
- `IW49N`: Visualizar ordenes y operaciones PM
- `IP24`: Listado de programacion general OTs
- `IP19`: Programacion general de mantenimiento PM

> Las ordenes de trabajo provenientes de los planes se deben generar en el estatus "Liberado" (LIB). Los planificadores deberan realizar la respectiva validacion y posterior a ello su liberacion con lo cual se aprueba la ejecucion del trabajo.

#### Flujograma del Mantenimiento Preventivo

```
[Plan Matriz de Mantenimiento]
    --> [Generacion automatica de OTs en SAP-PM]
        --> [Planificador revisa y valida]
            --> [Liberacion de OT (estatus LIB)]
                --> [Programacion semanal]
                    --> [Ejecucion]
                        --> [Cierre y notificacion]
```

### 5.4 Actividades de tipo correctivo / Corrective Activities (After Failure)

Durante esta etapa se realiza la recepcion, validacion y enrutamiento de los requerimientos de areas como produccion, operaciones, proyectos, HSE, mantenimiento, etc., a traves de la generacion de avisos en SAP-PM.

#### 5.4.1 Identificacion de requerimientos / Requirements Identification

Comprende la creacion e identificacion del aviso en SAP-PM. Los avisos deben contener como minimo:

**Datos de cabecera y objeto de referencia:**
- Nombre del aviso SAP
- Ubicacion tecnica/Equipos
- Descripcion: texto libre con la mayor descripcion posible del requerimiento

**Informacion de Confiabilidad:**
- Parte objeto, sintoma, causa de averia, etc.
- Inicio y fin de averia

**Responsabilidades:**
- Grupo de planificacion
- Puesto de trabajo responsable
- Autor del aviso

#### 5.4.2 Evaluacion y aprobacion de requerimientos / Requirements Evaluation and Approval

Se realiza la recopilacion y evaluacion de los requerimientos minimos necesarios para que el aviso pueda ser tratado y se debe verificar la posible duplicidad de solicitudes. Una vez validado el requerimiento se libera el aviso y pasara a estatus "Mensaje en tratamiento" (METR).

#### Flujo del Aviso en SAP-PM

```
[Aviso de Mantenimiento (MEAB)]
    --> [Validacion por responsable]
        --> [Cambio de ABIERTO a EN TRATAMIENTO (METR)]
            --> [Crear orden de mantenimiento referido al aviso (ORAS)]
                --> [Planificacion y ejecucion]
                    --> [Historico y cierre del aviso (MECE)]
```

### 5.5 Planificacion de mantenimiento / Maintenance Planning

Una vez aprobados y liberados los avisos, se inicia el proceso de planificacion, el cual consiste en identificar y agregar todos los recursos necesarios para cumplir el alcance definido en cada una de las ordenes de mantenimiento.

#### Requerimientos minimos / Minimum Requirements

**Recursos para la ejecucion:**
- Puestos de trabajo adecuados (mecanicos, electricos, instrumentistas, etc.)
- Duracion de cada una de las operaciones junto con la cantidad de ejecutores
- Materiales con cantidad necesaria

**Actividades pre-ejecucion y pos-ejecucion:**
- Bloqueo electrico, mecanico, operaciones de sistemas previo a intervencion de equipos
- Armado y desarmado de andamios
- Retiro de protecciones mecanicas para intervencion de equipos
- Alistamiento de materiales
- Housekeeping y actividades de limpieza posterior a mantenciones
- Acompanamiento para puesta en marcha del equipo

**Definicion de compras de repuestos y servicios:**
- Priorizar la compra de repuestos de importacion con la debida antelacion
- Confirmacion de servicios o asesorias especializadas

#### Comunicacion con otros procesos / Communication with Other Processes

| Area | Interaccion con Planificacion |
|---|---|
| **Materiales y Servicios (MM)** | Valorizacion de repuestos y servicios; Seguimiento de tiempos de entrega de componentes y reparaciones; Feedback alternativas de materiales y repuestos; Participacion en licitacion de contratos y servicios |
| **Ejecucion** | Recursos disponibles internos y externos para planificar; Informacion de ejecucion de OTs y feedback para mejoras en planes de mantenimiento |
| **Ingenieria de Confiabilidad** | Definicion de estrategias de mantenimiento; Mantener informacion tecnica actualizada de equipos y sistemas |
| **Operaciones** | Coordinar detenciones y entrega de equipos para actividades de mantenimiento; Confirmacion de priorizacion de actividades |

**Transacciones claves en SAP-PM:**
- `IW38`: Modificar ordenes SAP PM
- `IW32`: Modificar orden de trabajo individual
- `IW37N`: Modificar ordenes y operaciones SAP PM
- `IW49`: Visualizar lista operaciones por ordenes de trabajo
- `IP18`: Listado de posiciones de mantenimiento
- `MD04`: Lista actual de necesidades para materiales
- `MB53`: Disponibilidad de stocks en el centro
- `MMBE`: Resumen de stock

### 5.6 Programacion de mantenimiento / Maintenance Scheduling

La programacion de mantenimiento es la administracion de actividades donde se define el tiempo final y la fecha en la cual va a ser ejecutada una orden de trabajo.

#### 5.6.1 Elaboracion de pre-programa de mantenimiento semanal / Weekly Pre-Program

Segun el criterio de priorizacion, disponibilidad de repuestos y con base a la dotacion de horas hombre por puesto de trabajo se debera realizar un preprograma definiendo:
- Actividades a realizar
- Fechas y horas
- Secuencia
- Grupos de trabajo
- Comprometiendo el total de horas disponibles

**Consideraciones:**
- Coordinar actividades de diferentes grupos de trabajo en el mismo equipo y zona para evitar interferencias
- Disponibilidad de recursos externos (companias contratistas)
- Uso de herramientas y equipos de apoyo (camion pluma, plataformas levanta hombre, etc.)
- Incluir ordenes atrasadas en estatus "liberado" (LIB) o "Notificado parcialmente" (NOTP) con fechas anteriores

> El preprograma podra ser organizado a traves de plantillas de Excel.

#### 5.6.2 Reunion semanal de programacion de mantenimiento / Weekly Scheduling Meeting

Considerado uno de los pasos mas importantes del proceso. Participan operaciones y mantenimiento.

**Objetivo**: Revisar, aprobar y dejar definida la programacion de la siguiente semana. Divulgar resultados de indicadores de la semana anterior.

**Principales aspectos a considerar:**
- Seguridad/Medio Ambiente
- Costo
- Programacion
- Presupuesto
- Limitaciones de Recursos
- Requerimientos de Produccion

##### Agenda de la Reunion Semanal

| Item | Actividad | Responsable | Tiempo |
|---|---|---|---|
| 1 | Momento de seguridad | HSE | 5 min |
| 2 | Presentacion de indicadores de gestion semana anterior | Programador | 15 min |
| 3 | Presentacion programa semanal preliminar | Programador | 15 min |
| 4 | Validacion del programa y solicitudes adicionales operacionales | Todos | 10 min |
| 5 | Comentarios y varios | Todos | 15 min |
| **Total** | | | **60 min** |

##### Cronograma Tipico Semanal de P&S

| Lunes | Martes | Miercoles | Jueves | Viernes | Sabado | Domingo |
|---|---|---|---|---|---|---|
| Inicio programa semanal | | Reunion semanal de programacion mantenimiento | | Envio de Programacion definitiva siguiente semana | | Fin programa semanal |

#### 5.6.3 Ajuste al plan semanal / Weekly Plan Adjustment

Durante la reunion semanal se deben validar y aprobar cambios como: reprogramacion, inclusion o eliminacion de actividades, teniendo en cuenta el forecast de produccion.

Antes de finalizar la reunion se debera establecer:
- Programa definitivo en orden cronologico de ejecucion
- Nivelacion de recursos

La programacion se crea a traves de la transaccion **CM25** en SAP-PM.

##### Campo de Revision en SAP-PM

| Campo | Ejemplo | Significado |
|---|---|---|
| Planta | SN | Salares Norte |
| Tipo mantencion | R / M | R=Rutinario, M=Mayor |
| Ano | 21 | 2021 |
| Semana | S01 | Semana 01 |

Una vez realizada la programacion, las ordenes de trabajo se cambian a estatus **"PLAN"**.

**Transacciones claves en SAP-PM:**
- `CM25`: Ajuste de capacidades SAP PM
- `IW38`: Modificar Ordenes de trabajo
- `IW37N`: Modificar ordenes y operaciones
- `IW32`: Modificar ordenes de trabajo
- `IW3D`: Imprimir OT

#### 5.6.4 Divulgacion y creacion de paquetes de trabajo / Work Package Creation

Una vez formalizadas las ordenes, se deben comunicar a partes interesadas (supervisores, ejecutores, area de operaciones).

**Contenido de los paquetes de trabajo:**
- Permiso de trabajo
- Certificado de aislamiento de fuentes de energia
- Solicitud aprobada para retiro de materiales (si aplica)
- Listas de chequeo (uso de andamios, trabajo en alturas, espacios confinados, etc.)
- Analisis de riesgos del trabajo (ATS, ART, etc.)
- Procedimiento de ejecucion de la actividad
- Orden de trabajo

### 5.7 Ejecucion / Execution

Una vez generados los paquetes de trabajo del programa semanal aprobado, se procede a la ejecucion teniendo en cuenta:
- Aspectos de seguridad
- Actividades del y asociadas al alcance
- Calidad tecnica y administrativa, incluyendo limpieza del area de trabajo
- Ejecucion de actividades de prioridad alta

**Al final de cada jornada:**
- Retroalimentacion del avance del programa
- Relacionar aspectos relevantes que sucedieron durante la ejecucion
- Notificar al programador en caso de ser necesario reprogramar alguna actividad

### 5.8 Cierre / Closure

Finalizadas las actividades y posterior a la entrega de los equipos, las ordenes de mantencion deberan ser notificadas en SAP-PM por parte del ejecutor.

**Requerimientos minimos para buena notificacion:**
- Fecha de inicio real y fecha de fin real de ejecucion
- Duracion y horas hombre reportadas correspondan a lo ejecutado
- Comentarios de ejecucion con informacion relevante:
  - **Condicion previa**: Como encontro el equipo?
  - **Actividades ejecutadas**: Que actividades se ejecutaron? (con detalles)
  - **Condicion posterior**: Como se entrego el equipo?

**Devolucion de materiales no utilizados a bodega conforme a lineamientos de gestion de materiales.**

**Transacciones claves en SAP-PM:**
- `IW38`: Modificar Ordenes de trabajo
- `IW41`: Notificacion de OT individual
- `IW44`: Notificacion masiva de OT

### 5.9 Medicion de indicadores / KPI Measurement

Con el fin de asegurar el ciclo de mejoramiento continuo se deben establecer indicadores de gestion para el proceso, con captura y analisis semanal cuyas metas deberan ser revisadas anualmente.

**Transacciones claves en SAP-PM:**
- `IW38`: Modificar Ordenes de trabajo
- `IW29`: Visualizar avisos de mantenimiento en SAP-PM
- `MCI7`: Paradas de equipos registradas en SAP-PM

#### KPI 1: Cumplimiento al programa - Ordenes de trabajo / WO Schedule Compliance

```
Formula: (OTs ejecutadas en el programa / OTs programadas) x 100
Frecuencia: Semanal
Meta: >= 90%
```

#### KPI 2: Cumplimiento al programa - Horas-hombre / Man-Hours Schedule Compliance

```
Formula: (HH ejecutadas en el programa / HH programadas) x 100
Frecuencia: Semanal
Meta: >= 90%
```

#### KPI 3: Cumplimiento plan matriz PM & PdM / PM & PdM Master Plan Compliance

```
Formula: (OTs del plan matriz ejecutadas / OTs del plan matriz programadas) x 100
Frecuencia: Semanal
Meta: >= 95%
```

#### KPI 4: Carga de trabajo (Backlog) / Work Backlog

```
Formula: HH asignadas a ordenes abiertas en SAP-PM / Capacidad semanal disponible (en semanas)
Frecuencia: Semanal
Meta: 2-4 semanas
```

#### KPI 5: Trabajo reactivo / Reactive Work

```
Formula: (OTs ejecutadas fuera del programa / Total OTs ejecutadas) x 100
Frecuencia: Semanal
Meta: <= 15%
```

#### KPI 6: Adherencia al programa / Schedule Adherence

```
Formula: (OTs ejecutadas dentro del programa aprobado / Total OTs ejecutadas) x 100
Frecuencia: Semanal
Meta: >= 85%
```

#### KPI 7: Horizonte de liberacion / Release Horizon

```
Formula: Tiempo promedio entre fecha de liberacion de OT y fecha de inicio de ejecucion
Frecuencia: Semanal
Meta: >= 5 dias
```

#### KPI 8: Gestion de avisos / Notice Management

```
Formula: Avisos pendientes por antigueedad y estado
Frecuencia: Semanal
Meta: < 30 dias promedio de resolucion
```

#### KPI 9: Capacidad programada / Scheduled Capacity

```
Formula: (HH programadas / HH disponibles) x 100
Frecuencia: Semanal
Meta: >= 85%
```

#### KPI 10: % Trabajo proactivo (PM & PdM) / Proactive Work

```
Formula: (HH de trabajo proactivo PM+PdM / HH totales ejecutadas) x 100
Frecuencia: Semanal
Meta: >= 70%
```

#### KPI 11: Horizonte de planificacion / Planning Horizon (Planning Efficiency)

```
Formula: Tiempo promedio entre creacion de OT y fecha de inicio de ejecucion
Frecuencia: Semanal
Meta: >= 7 dias
```

### 5.10 Actualizar planes de mantenimiento / Update Maintenance Plans

En esta etapa el equipo de confiabilidad debe:
- Actualizar los planes de mantenimiento a partir de las mejoras obtenidas de la retroalimentacion realizada por los mantenedores
- Realizar la respectiva divulgacion y dejar el registro de la accion realizada

> Si la actualizacion significa mas recursos, se debe realizar una proyeccion de horas-hombre necesarias versus la dotacion actual.

### 5.11 Reportes y documentos / Reports and Documents

| Etapa | Documento | Descripcion | Frecuencia | Responsable | Dirigido a |
|---|---|---|---|---|---|
| Programacion | Reporte cierre programacion | Presentacion con informacion del cierre de indicadores de la semana anterior | Semanal | Jefe de Planificacion | Operaciones, Mantenimiento |
| Programacion | Reporte cierre programacion | Presentacion con informacion del cierre de indicadores del mes anterior | Mensual | Jefe de Planificacion | Superintendentes, jefaturas, gerencia |

---

## 6. Roles y Responsabilidades / Roles and Responsibilities

### 6.1 Identificador de requerimientos para mantenimiento (IRM) / Maintenance Requirements Identifier

Responsable de identificar los requerimientos y necesidades de actividades de mantenimiento. Este rol se asume desde diferentes areas (Operaciones, Mantenimiento).

**Responsabilidades:**
- Realizar el reporte de condiciones subestandar a traves de avisos de mantenimiento en SAP-PM con suficiente informacion
- Identificar requerimientos adicionales de mantenimiento
- Definir preliminarmente los responsables de ejecucion en los avisos dentro de SAP-PM
- Establecer fechas preliminares para la ejecucion de las actividades
- Establecer priorizacion preliminar de las actividades de mantenimiento

### 6.2 Confiabilidad (CON) / Reliability

Responsable principal del desarrollo de las pautas de mantenimiento de tipo preventivo y predictivo (sintomatico). Lidera equipos de trabajo para definir actividades enfocadas en eliminar y/o mitigar las consecuencias de los modos de falla.

**Etapa de identificacion de necesidades:**
- Creacion de avisos producto de analisis de confiabilidad (RCA, malos actores, etc.)
- Capacitaciones a los IRM respecto al correcto diligenciamiento de informacion de confiabilidad en avisos (parte objeto, modo de falla, causas averia, etc.)

**Etapa de medicion de indicadores, analisis y mejoras:**
- Ejecucion de auditorias aleatorias al diligenciamiento de avisos, notificacion y documentacion de OTs
- Soporte para ejecucion de RCA en casos de desviacion en indicadores de planificacion y programacion

### 6.3 Aprobador de requerimientos (ARQ) / Requirements Approver

Responsable de validar y aprobar los requerimientos de los usuarios al area de mantenimiento a traves de los avisos.

**Responsabilidades:**
- Validar priorizacion preliminar definida por el IRM
- Cambiar estatus de avisos a "aviso en tratamiento" (METR)
- Verificar posible duplicidad de avisos y demas requerimientos basicos
- Mantener informado a operaciones y demas areas sobre rechazos o aprobaciones

### 6.4 Planificadores (PLN) / Planners

Encargados de revisar, planificar y programar tareas de mantenimiento provenientes del plan de mantenimiento y generadas a traves de SAP-PM.

**Responsabilidades:**
- Buscar, revisar y dar tratamiento de avisos aprobados para generar OTs y su planificacion
- Gestionar ordenes de trabajo provenientes de los planes de mantenimiento en SAP
- Gestionar uso de equipos y herramientas de apoyo (camion pluma, andamios, elevador de canasta, etc.)
- Confirmar cantidad de HH, equipos y materiales necesarios para ejecutar planes del plan matriz
- Asistir y contribuir a las reuniones de P&P semanales
- Medir y reportar semanalmente los indicadores de desempeno
- Modificar las OTs para agregar operaciones, actividades pre/pos-ejecucion, modificacion de fecha de inicio
- Realizar seguimiento y revision de materiales y servicios criticos con horizonte de apertura a mediano plazo (1 a 2 anos)
- Hacer seguimiento a los materiales con la categoria de reparables
- Actualizar, modificar o eliminar planes de mantenimiento, posiciones de mantenimiento y hojas de ruta segun retroalimentacion de confiabilidad
- Crear, modificar y visualizar Solicitudes de Pedido (SolPed) en SAP-PM
- Visualizar y revisar reservas en SAP-PM a traves de las OTs
- Coordinar con planificacion de materiales la gestion de compra de repuestos
- Actualizar y crear listado de materiales BOM (Bill Of Material) en SAP
- Proyectar y controlar los costos de las actividades de mantenimiento (mensual, trimestral, anual)

### 6.5 Jefe de ejecucion (SMA) / Execution Chief

Encargado de coordinar, asignar y supervisar las labores de mantenimiento programadas y no programadas.

**Etapa de planificacion:**
- Revisar el programa por areas y puestos de trabajos en version preliminar
- Confirmar equipos y herramientas de apoyo
- Asegurar analisis y evaluacion de riesgos en seguridad e impactos medioambientales
- Aprobar los permisos de trabajo

**Etapa de ejecucion:**
- Verificar analisis de riesgos en terreno
- Realizar control de calidad de los trabajos
- Supervisar uso correcto de materiales, repuestos y/o servicios
- Verificar orden y limpieza de areas de intervencion

**Etapa de cierre:**
- Asegurar devolucion de materiales y repuestos a bodega

### 6.6 Mantenedores (MAN) / Maintainers

Responsables de llevar a cabo de forma eficaz y eficiente las actividades del programa de mantenimiento.

**Etapa de planificacion:**
- Retirar y asegurar repuestos de bodega
- Alistar equipos y herramientas de apoyo
- Ejecutar analisis y evaluacion de riesgos
- Crear los permisos de trabajo correspondientes

**Etapa de ejecucion:**
- Verificar analisis de riesgos de la actividad en terreno
- Controlar calidad de los trabajos
- Definir nuevas tareas de mantenimiento (cuando se encuentren desviaciones)
- Confirmar materiales, repuestos y/o servicios
- Realizar aislamientos y bloqueos
- Ejecutar las actividades contenidas en las pautas de mantenimiento
- Realizar limpieza de areas de intervencion

**Etapa de cierre:**
- Devolver materiales y repuestos no utilizados a bodega
- Realizar la notificacion de las ordenes de trabajo en el sistema
- Cerrar los permisos de trabajo

### 6.7 Area de seguridad y medio ambiente (HSE) / Safety and Environment

**Etapa de planificacion:**
- Generar programa de requerimientos de seguridad y medio ambiente
- Analizar y evaluar riesgos en seguridad e impactos medioambientales
- Dictar charlas de seguridad salud ocupacional y medio ambiente

**Etapa de ejecucion:**
- Acompanamiento a la ejecucion de trabajos de mantenimiento para asegurar cumplimiento de medidas preventivas

### 6.8 Operaciones (JOP) / Operations

Encargado de organizar, gestionar y coordinar al personal de operaciones para las actividades definidas en el proceso de P&P.

**Etapa de preparacion:**
- Participar activamente en reuniones de programacion semanal
- Realizar aislamientos y bloqueos en activos segun requerido
- Realizar limpieza de equipos e instalaciones
- Realizar entrega formal de equipos al area de mantenimiento

**Etapa de ejecucion:**
- Soportar con aislamientos, bloqueos y desbloqueos
- Realizar entrega y recepcion de equipos segun la programacion semanal aprobada

### 6.9 Empresa de servicios (ESS) / Service Companies

Empresa encargada de apoyar con la ejecucion de un trabajo especifico, cumpliendo con todos los estandares de calidad y seguridad de MGSN.

**Etapa de planificacion:**
- Revisar programa por areas y puestos de trabajos
- Analizar y evaluar riesgos

**Etapa de ejecucion:**
- Verificar bloqueos de energias
- Verificar analisis de riesgos
- Ejecutar tareas de mantenimiento
- Realizar control de calidad
- Definir nuevas tareas (en caso de desviaciones)
- Limpieza de areas de intervencion

**Etapa de Cierre:**
- Confirmar materiales, repuestos y/o servicios
- Cierre de permisos de trabajo

---

## 7. Anexos / Appendices

### Anexo 1: Flujo del orden de trabajo preventivo - Proceso estandar SAP

```
[Plan de Mantenimiento SAP]
    --> [Generacion automatica de OT]
        --> [Estatus: Abierto (ABIE)]
            --> [Planificacion: Verificacion de recursos, materiales, HH]
                --> [Estatus: PLN -> FMA -> LPE]
                    --> [Liberacion (LIB)]
                        --> [Programacion semanal]
                            --> [Ejecucion]
                                --> [Notificacion (NOTI/NOTP)]
                                    --> [Cierre tecnico (CTEC)]
```

### Anexo 2: Flujo del orden de trabajo correctivo - Proceso estandar SAP

```
[Aviso de Mantenimiento (MEAB)]
    --> [Evaluacion y aprobacion]
        --> [Mensaje en tratamiento (METR)]
            --> [Crear OT referida al aviso (ORAS)]
                --> [Planificacion: Recursos, materiales, HH]
                    --> [Estatus: PLN -> FMA -> LPE]
                        --> [Liberacion (LIB)]
                            --> [Programacion semanal]
                                --> [Ejecucion]
                                    --> [Notificacion (NOTI/NOTP)]
                                        --> [Cierre tecnico (CTEC)]
                                            --> [Cierre aviso (MECE)]
```

---

## Quick Reference: SAP-PM Key Transactions

| Transaction | Function | Stage |
|---|---|---|
| `IW21` | Crear aviso PM | Inicio |
| `IW22` | Modificar aviso PM | Inicio |
| `IW23` | Visualizar aviso PM | Inicio |
| `IW28` | Modificar avisos PM (masivo) | Inicio |
| `IW38` | Modificar ordenes PM (masivo) | Planificacion/Programacion |
| `IW32` | Modificar orden individual | Planificacion |
| `IW37N` | Modificar ordenes y operaciones | Planificacion/Programacion |
| `IW49N` | Visualizar ordenes y operaciones | Planificacion |
| `IP24` | Listado programacion general OTs | Planificacion |
| `IP19` | Programacion general mantenimiento | Planificacion |
| `IP18` | Listado posiciones de mantenimiento | Planificacion |
| `MD04` | Lista necesidades materiales | Planificacion |
| `MB53` | Disponibilidad stocks en centro | Planificacion |
| `MMBE` | Resumen de stock | Planificacion |
| `CM25` | Ajuste de capacidades | Programacion |
| `IW3D` | Imprimir OT | Programacion |
| `IW41` | Notificacion OT individual | Cierre |
| `IW44` | Notificacion masiva OT | Cierre |
| `IW29` | Visualizar avisos | KPIs |
| `MCI7` | Paradas de equipos | KPIs |
