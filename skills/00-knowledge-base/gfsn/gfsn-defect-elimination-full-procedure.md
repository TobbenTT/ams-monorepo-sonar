# GFSN Defect Elimination Full Procedure / Procedimiento Completo de Eliminacion de Eventos No Deseados

---

| Metadata | Value |
|---|---|
| **Source File** | `defect-elimination-procedure--GFSN01-DD-EM-0000-PT-00005 Procedimiento de eliminacion de fallas Rev 0.pdf` |
| **Document Code** | GFSN01-DD-EM-0000-PT-00005 |
| **Original Title** | Procedimiento Eliminacion de Eventos no deseados de la gestion administrativa y tecnica de mantenimiento |
| **Organization** | Minera Gold Fields Salares Norte Ltda (MGFSN) |
| **Author** | AUSENCO CHILE LTDA |
| **Approved by** | Ernesto Holzmann - Senior Project Engineer |
| **Revision** | Rev.C, Jun 2021 |
| **Original Date** | 20-12-2020 |
| **Page Count** | 39 |
| **Conversion Date** | 2026-02-23 |
| **Language** | Spanish (original) with English section headers |

---

## Used By Skills

| Skill | Usage |
|---|---|
| `perform-rca` | Primary procedure - defines the complete Root Cause Analysis methodology (5W+2H, Cause-Effect diagram, 5Ps evidence collection, hypothesis verification) |
| `manage-capa` | Defines CAPA (Corrective and Preventive Actions) management: solution identification, cost-benefit analysis, implementation prioritization, effectiveness KPIs |

---

## Table of Contents / Tabla de Contenido

1. [Objetivo / Purpose](#1-objetivo--purpose)
2. [Alcance / Scope](#2-alcance--scope)
3. [Definiciones / Definitions](#3-definiciones--definitions)
4. [Documentacion / Documentation References](#4-documentacion--documentation-references)
5. [Flujo del Proceso de Eliminacion de Fallas / Defect Elimination Process Flow](#5-flujo-del-proceso-de-eliminacion-de-fallas--defect-elimination-process-flow)
6. [Desarrollo / Development](#6-desarrollo--development)
   - 6.1 [Identificar / Identify](#61-identificar--identify)
   - 6.2 [Priorizar / Prioritize](#62-priorizar--prioritize)
   - 6.3 [Analizar / Analyze](#63-analizar--analyze)
     - 6.3.1 [Metodologia 5W+2H](#631-metodologia-5w2h)
     - 6.3.2 [Informacion de entrada al proceso de RCA / RCA Process Inputs](#632-informacion-de-entrada-al-proceso-de-rca--rca-process-inputs)
     - 6.3.3 [Condiciones generales / General Conditions](#633-condiciones-generales--general-conditions)
     - 6.3.4 [Flujo de la metodologia RCA Causa-Efecto / RCA Cause-Effect Flow](#634-flujo-de-la-metodologia-rca-causa-efecto--rca-cause-effect-flow)
   - 6.4 [Desarrollo de la metodologia RCA / RCA Methodology Development](#64-desarrollo-de-la-metodologia-rca--rca-methodology-development)
     - 6.4.1 [Concepto de las 5Ps / The 5Ps Concept](#641-concepto-de-las-5ps--the-5ps-concept)
     - 6.4.2 [Generalidades del RCA Causa-Efecto / RCA Cause-Effect Generalities](#642-generalidades-del-rca-causa-efecto--rca-cause-effect-generalities)
     - 6.4.3 [Definicion del problema / Problem Definition](#643-definicion-del-problema--problem-definition)
     - 6.4.4 [Clasificacion del nivel de analisis / Analysis Level Classification](#644-clasificacion-del-nivel-de-analisis--analysis-level-classification)
     - 6.4.5 [Elaboracion del diagrama Causa-Efecto / Cause-Effect Diagram Construction](#645-elaboracion-del-diagrama-causa-efecto--cause-effect-diagram-construction)
     - 6.4.6 [Identificacion de Soluciones Efectivas / Effective Solution Identification](#646-identificacion-de-soluciones-efectivas--effective-solution-identification)
   - 6.5 [Implementar / Implement](#65-implementar--implement)
   - 6.6 [Controlar / Control](#66-controlar--control)
7. [Roles y Responsabilidades / Roles and Responsibilities](#7-roles-y-responsabilidades--roles-and-responsibilities)
8. [Anexos / Appendices](#8-anexos--appendices)

---

## 1. Objetivo / Purpose

El Proceso de Eliminacion de Fallas es una herramienta fundamental para incrementar la confiabilidad, la rentabilidad y la gestion de los activos, su funcion es reducir la recurrencia de eventos no deseados y/o mitigar sus consecuencias en los activos fisicos como en las desviaciones de los procesos a niveles tolerables para MGFSN.

Este documento proporciona un marco guia para facilitar la aplicacion del Proceso de Eliminacion de Fallas, permite la verificacion y analisis constante de eventos no deseados con un enfoque en el mejoramiento continuo.

> **English summary**: The Defect Elimination Process is a fundamental tool to increase reliability, profitability and asset management. Its function is to reduce the recurrence of undesired events and/or mitigate their consequences on physical assets and process deviations to tolerable levels for MGFSN.

---

## 2. Alcance / Scope

El metodo de Eliminacion de Defectos o Fallas definido en el presente documento ilustra en detalle la aplicacion de la metodologia para la gestion de investigacion de eventos no deseados e incidentes dentro de la gestion de mantenimiento en el proyecto MGFSN.

> **English summary**: The Defect/Failure Elimination method defined in this document illustrates in detail the application of the methodology for investigating undesired events and incidents within maintenance management at the MGFSN project.

---

## 3. Definiciones / Definitions

**Accion Correctiva / Corrective Action**: Es una accion para eliminar la causa de una falla o defecto en el funcionamiento u otra situacion no deseable. [Adaptado del BS en ISO 9000:2005, 3.6.5]. [PAS 55-1:2008].

**Accion Preventiva / Preventive Action**: Es cualquier accion para eliminar la causa de una falla o defecto potencial en el funcionamiento u otra situacion potencial no deseada. [BS en ISO 9000:2005,3.6.4]. [PAS 55-1:2008].

**Activo / Asset**: Plantas, maquinarias, propiedades, edificios, vehiculos y otros elementos que tengan un valor especifico para la organizacion. [PAS 55-1:2008]

**Analisis Costo-Beneficio / Cost-Benefit Analysis**: Estima el beneficio economico de la realizacion de un cambio, modificacion o reparacion mayor. El analisis compara el impacto total de una situacion futura despues del cambio con la situacion actual, ademas compara el beneficio con el costo del cambio. El resultado esta dado en el Valor Presente Neto (VPN).

**Auditoria / Audit**: Es un proceso independiente, sistematico para obtener evidencia y evaluarla objetivamente para determinar cuales criterios de auditoria son cumplidos. [Adaptado del BS en ISO 9000:2005, 3.9.1]. [PAS 55-1:2008].

**Causa de Falla / Failure Cause**: Circunstancias habidas durante la especificacion, el diseno, la fabricacion, la instalacion, la utilizacion o el mantenimiento que provocan la falla. [EN 13306:2010].

**Causa Raiz Fisica / Physical Root Cause**: Se refiere a los mecanismos de falla atribuible a los componentes de maquina, materiales o cualquier elemento tangible que por su degradacion pueda ser el responsable de la ocurrencia del evento objeto de investigacion. La causa raiz fisica es la que con menos frecuencia se encuentra como "unica causa" de los incidentes de falla.

**Causa Raiz Humana / Human Root Cause**: Se refiere a los mecanismos de falla o degradaciones tempranas de componentes atribuible a una intervencion inapropiada de un ser humano. La causa raiz humana como "unica causa" suele ser mas comun que la causa raiz fisica, siendo en muchos casos la causa raiz fisica la consecuencia de negligencias humanas.

**Causa Raiz Latente / Latent Root Cause**: Se refiere a la deficiencia de los sistemas administrativos o de gestion (reglas, procedimientos, guias, politicas, etc.) o "normas" culturales que hacen posible que un incidente de falla ocurra. La causa raiz latente suele ser la mas comun, siendo la mayoria de las veces la desencadenante de las fallas humanas o fisicas.

**Ciclo de Vida / Life Cycle**: Es el intervalo de tiempo que comienza con la identificacion de la necesidad de un activo y termina con la puesta fuera de servicio del activo o de cualquier responsabilidad asociada. [PAS 55-1:2008].

**Confiabilidad / Reliability**: Probabilidad de que un activo o sistema de activos cumpla su funcion satisfactoriamente durante un periodo de tiempo determinado, bajo condiciones de uso especificas. [ISO 20815:2010, 3.1.41]

**Costos de Ciclo de Vida / Life Cycle Costs**: Suma total de todos los costos incurridos un activo o sistema de activos a traves de todo su ciclo de vida. [ISO 15663-1:2000, 2.1.15].

**Criticidad / Criticality**: Es un caso particular del analisis de riesgo, usado para reconocer que los activos y los sistemas de activos tienen distinta importancia (valor), o representan diferentes vulnerabilidades para la organizacion. [PAS 55-2:2008].

**Diagrama Causa-Efecto / Cause-Effect Diagram**: (llamado tambien de espina de pescado / fishbone diagram debido a su forma o de Ishikawa debido a su autor) es un metodo para crear y clasificar ideas o hipotesis sobre las causas de un problema de manera grafica. Ademas, organiza gran cantidad de datos mostrando los nexos existentes entre los hechos y las posibles causas.

**Efectividad / Effectiveness**: Grado en que se realizan las actividades planificadas y se alcanzan los resultados planificados. [Adaptado del BS en ISO 9000:2005, 3.2.14]. [PAS 55-1:2008].

**Eficiencia / Efficiency**: Relacion entre el resultado logrado y los recursos utilizados. [Adaptado del BS en ISO 9000:2005, 3.2.15]. [PAS 55-1:2008].

**Evento / Event**: La aparicion o el cambio de un conjunto de circunstancias particulares. Un evento puede ser una o mas ocurrencias, y puede tener varias causas. Un evento puede consistir en algo que no esta sucediendo. Un evento a veces puede ser referido como un "incidente" o "accidente". [Guia ISO 73:2009, 3.5.1.3].

**Falla / Failure**: Cese de la capacidad de un elemento para realizar una funcion requerida. [EN 13306:2010].

**Gestion de Activos / Asset Management**: Actividades y practicas sistematicas y coordinadas a traves de las cuales una organizacion administra de manera optima y sostenible sus activos y sistemas de activos, su desempeno, riesgos y costos asociados durante sus ciclos de vida con el proposito de alcanzar su plan estrategico organizacional. [PAS 55-1:2008].

**Gestion de Riesgos / Risk Management**: Son las actividades coordinadas que dirigen y controlan una organizacion en lo relativo al riesgo. [ISO 73:2010,2.1].

**Mantenibilidad / Maintainability**: Probabilidad de que un activo o sistema de activos sea conservado o reparado satisfactoriamente bajo condiciones especificas, desde un estado de falla a un estado en que pueda cumplir con su funcion, en un tiempo determinado. [ISO 20815:2010, 3.1.41].

**Mantenimiento Basado en Condicion / Condition-Based Maintenance**: Accion de mantenimiento preventivo como resultado de una condicion probable de falla identificada a traves de monitoreo continuo o rutinario. [BS 3811:2011].

**Mantenimiento Correctivo / Corrective Maintenance**: Accion de mantenimiento llevada a cabo despues de ocurrida una falla, intentando devolver al equipo la capacidad de cumplir con su funcion. [BS 3811:2011].

**Mantenimiento Mayor / Major Maintenance**: Accion de mantenimiento preventivo llevada a cabo durante un tiempo prolongado, intentando devolver el activo a un estado de desempeno optimo.

**Mantenimiento Preventivo / Preventive Maintenance**: Accion de mantenimiento llevada a cabo en intervalos predeterminados o correspondiente a un criterio preestablecido, intentando reducir la probabilidad de falla o la degradacion del desempeno de un equipo. [BS 3811:2011].

**Modo de Falla / Failure Mode**: Manera en que se produce la incapacidad de un elemento para realizar una funcion requerida. [EN 13306:2010].

**Nivel de Analisis / Analysis Level**: Clasificacion del nivel de analisis del evento no deseado a traves la matriz de riesgo, que resulta del intercepto entre el nivel mas alto del impacto de la consecuencia y su frecuencia dentro de la organizacion o la industria, el cual define los recursos requeridos para realizar el analisis y la dedicacion del Equipo de investigacion.

**Nivel RCA 3 / RCA Level 3**: Son analisis de eventos no deseados con niveles de afectacion de alto impacto y alta frecuencia, debido a la gravedad de sus consecuencias directas sobre las metas de la organizacion ameritan la conformacion de un equipo formal de investigacion multidisciplinario, con la participacion y dedicacion total de la maxima autoridad del area afectada.

**Nivel RCA 2 / RCA Level 2**: Son analisis eventos no deseados con niveles de afectacion de impacto medio, que pueden comprometer las metas de la organizacion, requiere la creacion de un equipo formal de investigacion conformado por personas pertenecientes al proceso donde se presento el evento, con dedicacion parcial y cuya aprobacion sera responsabilidad de la maxima autoridad del area afectada.

**Reporte de Falla / Failure Report**: Son analisis de eventos no deseados con niveles de afectacion baja, que requieren un analisis del personal involucrado y un nivel adecuado de soporte.

**RCA (Analisis de Causa Raiz) / Root Cause Analysis**: Proceso sistematico para identificar las causas de un evento no deseado.

**Riesgo / Risk**: Efecto de la incertidumbre sobre la consecucion de objetivos. [PD ISO/IEC Guia 73:2010,1.1].

**SMART**: Specific - Measurable - Achievable - Realistic - Time Related. Acronimo que define los principios para que un indicador ayude efectivamente a medir el logro de la meta de un objetivo.

---

## 4. Documentacion / Documentation References

- UNE-EN 62740:2015 - Analisis Causa Raiz RCA.
- IEC 62740:2015 - Root Cause Analysis RCA.
- ISO 31000:2018 - Gestion del Riesgo -- Directrices.
- IEC 31010:2019 - Risk management - Risk assessment techniques.
- ISO Guide 73:2009 - Risk management -- Vocabulary.

---

## 5. Flujo del Proceso de Eliminacion de Fallas / Defect Elimination Process Flow

### Figura 1: Flujograma del Proceso de Eliminacion de Fallas

```
[IDENTIFICAR] --> [PRIORIZAR] --> [ANALIZAR] --> [IMPLEMENTAR] --> [CONTROLAR]
     |                 |               |                |                |
     v                 v               v                v                v
 Indicadores     Matriz Costo    5W+2H o RCA      Plan de         Medir
 de gestion      Beneficio &     Causa-Efecto     accion          resultados
 y metricas      Dificultad                       priorizado      e indicadores
```

### Figura 2: Ciclo de Mejoramiento del Proceso de Eliminacion de Fallas

The defect elimination process follows a continuous improvement cycle with 5 phases:
1. **Identificar** (Identify) - Use KPIs and metrics to detect deviations
2. **Priorizar** (Prioritize) - Evaluate cost-benefit and difficulty to rank problems
3. **Analizar** (Analyze) - Apply 5W+2H or RCA Cause-Effect methodology
4. **Implementar** (Implement) - Execute prioritized action plans
5. **Controlar** (Control) - Measure results and effectiveness of solutions

---

## 6. Desarrollo / Development

### 6.1 Identificar / Identify

Los indicadores claves de gestion son metricas que ayudan a cuantificar la efectividad de los procesos de mantenimiento dentro de MGFSN. Muestran el desempeno real de la ejecucion de los procesos en unidades de medida claras y precisas y pondra al descubierto los procesos que pueden necesitar un mayor soporte y proporcionara oportunidades de mejora y rentabilidad.

El proposito de esta etapa es identificar dentro de la captura realizada en los indicadores, los analisis estadisticos, probabilisticos y los resultados obtenidos en la implementacion de las actividades de la gestion de mantenimiento, las desviaciones que afectan los objetivos corporativos de MGFSN.

#### Key Metrics for Identification / Metricas Clave para Identificacion

- **Disponibilidad / Availability**: El calculo de este indicador tendra en cuenta la sumatoria del tiempo por paradas planificadas (procesos rutinarios de mantenimiento) y la sumatoria del tiempo por paradas no planificadas (ocurrencia de imprevistos y fallas de los equipos).

- **Estadisticas de HSE (Health, Safety & Environment)**: Permite evaluar la gestion, identificar las oportunidades de mejoramiento y tomar medidas preventivas a tiempo para proteger al equipo de mantenimiento durante la ejecucion de las tareas de inspeccion, reacondicionamiento, sustitucion y reparacion, disminuyendo al maximo cualquier tipo de riesgo.

- **Costos de mantenimiento / Maintenance costs**: SAP debe proporcionar un historial y la segregacion de los costos de mantenimiento (mano de obra, material, equipos y herramientas) y permitir identificar las cuentas contables, centros de costo y las variaciones del presupuesto aprobado en relacion con los gastos reales. El exceso de costo es un indicador que los planes de mantenimiento son deficientes, ineficaces o posiblemente redundantes.

- **Retroalimentacion sobre las ordenes de trabajo / Work order feedback**: El historial de las OT puede utilizarse para identificar el equipo o los componentes que tienen un mayor impacto en la confiabilidad a partir de la capacidad de mantenimiento (MTTR) y del tiempo medio entre fallos (MTBF) del sistema.

> **Nota importante**: Cada desviacion identificada debe describirse y cuantificar su impacto para priorizar su analisis (La desviacion debe ser cuantificada para demostrar que, si se resuelve, entregara un significativo ahorro en terminos de costos operativos o mejorara los indices de HSE).

#### Figura 3: Planilla para evaluacion de desviaciones

Se utiliza la hoja "EvaluacionDesviaciones" del modelo "Matriz Jerarquizacion Eventos" (Anexo B) para registrar y evaluar cada desviacion identificada.

---

### 6.2 Priorizar / Prioritize

El proposito de esta etapa es decidir cual(es) de los problemas identificados pasara a la etapa de analisis del proceso de eliminacion de Fallas. Esta decision se basa en una evaluacion del beneficio que se obtendra al resolver el problema y el esfuerzo requerido para resolverlo.

#### Variable 1: Relevancia en la Gestion de Mantenimiento / Maintenance Management Relevance

La implementacion de la solucion se debe expresar sobre la oportunidad en la reduccion de costos operacionales. Ademas del aspecto financiero, el beneficio tambien puede expresarse en terminos de ganancia a traves de la mitigacion de las consecuencias o disminucion de la probabilidad en relacion con HSE.

##### Figura 4: Clasificacion del Costo Beneficio / Cost-Benefit Classification

| Clasificacion | Nivel |
|---|---|
| **H (High / Alto)** | Alto beneficio / alta reduccion de costos o riesgo HSE |
| **M (Medium / Medio)** | Beneficio moderado |
| **L (Low / Bajo)** | Bajo beneficio |

#### Variable 2: Dificultad en la Implementacion / Implementation Difficulty

A traves de juicio de expertos y un analisis de alto nivel se puede identificar el esfuerzo para resolver la desviacion en termino del tiempo requerido y el costo asociado a la implementacion de la(s) soluciones.

##### Figura 5: Clasificacion de la dificultad / Difficulty Classification

| Clasificacion | Nivel |
|---|---|
| **LL (Low-Low)** | Extremo inferior - minima dificultad |
| **LH (Low-High)** | Dificultad baja-media |
| **M (Medium)** | Dificultad media |
| **HL (High-Low)** | Dificultad media-alta |
| **HH (High-High)** | Extremo superior - maxima dificultad |

#### Figura 6: Matriz de priorizacion de analisis de eventos / Event Analysis Prioritization Matrix

```
                    Dificultad de Implementacion (Difficulty)
                    LL       LH       M        HL       HH
              +--------+--------+--------+--------+--------+
    H (Alto)  | PRIO 1 | PRIO 1 | PRIO 2 | PRIO 3 | PRIO 3 |
Beneficio     +--------+--------+--------+--------+--------+
    M (Medio) | PRIO 1 | PRIO 2 | PRIO 2 | PRIO 3 | PRIO 4 |
              +--------+--------+--------+--------+--------+
    L (Bajo)  | PRIO 2 | PRIO 3 | PRIO 3 | PRIO 4 | PRIO 4 |
              +--------+--------+--------+--------+--------+
```

**Convenciones / Conventions:**
- **Prioridad 1**: Alto beneficio, baja dificultad - implementar inmediatamente
- **Prioridad 2**: Beneficio moderado o dificultad media - programar implementacion
- **Prioridad 3**: Requiere evaluacion adicional
- **Prioridad 4**: Bajo beneficio, alta dificultad - considerar alternativas

---

### 6.3 Analizar / Analyze

La etapa de analisis es la mas importante del proceso de eliminacion de fallas, debido a que conduce a la identificacion de las causas raiz del problema.

**Enfoque de resolucion de problemas**: Existen muchas tecnicas y enfoques disponibles para resolver problemas como los 5 Por que?, Analisis Causa Raiz (RCA), Six Sigma - DMAIC (Definir, Medir, Analizar, Mejorar y Controlar), etc. Se debe seleccionar un enfoque adecuado en funcion de la complejidad del problema.

#### 6.3.1 Metodologia 5W+2H

Para analizar eventos no deseados de baja complejidad se recomienda utilizar la metodologia 5W+2H que a traves de 7 preguntas nos permite elaborar un plan de accion sistematico y estructurado.

##### 6.3.1.1 Que? / What?
- **Que esta sucediendo?** - Identificar y describir el problema de forma adecuada. Su nivel de impacto?
- **Que debe hacerse?** - Determinar cual es la meta.

##### 6.3.1.2 Cuando? / When?
- **Cuando ocurre el problema?** - Cuando estamos viendo el problema? En que momento?
- **Cuando se va a realizar?** - En que momento se va a realizar el plan de accion, teniendo en cuenta los riesgos que se afrontan.

##### 6.3.1.3 Donde? / Where?
- **Donde se ve el problema?** - Identificar el proceso, lugar, equipo, etc., donde se observa el problema.
- **Donde se va a realizar?** - Identificar claramente donde se va a implementar la solucion.

##### 6.3.1.4 Quien? / Who?
- **El problema esta relacionado con la intervencion de las personas, influye la capacitacion/habilidad?** - Verificar si el problema esta relacionado con las competencias y/o habilidades de las personas.
- **Quien va a hacer el encargado?** - El elemento (persona, entidad, grupo, etc.) que se va a encargar de realizarlo.

##### 6.3.1.5 Por que? / Why?
- **Por que sucede el problema?** - Realizar trazabilidad y rastreabilidad al evento.
- **Por que debe realizarse lo que se desea hacer?** - Que justificacion o motivo nos hace definir el plan de accion?

##### 6.3.1.6 Como? / How?
- **Como se manifiesta el problema?** - Como se diferencia el problema del estado normal (optimo)? La tendencia en la que aparece el problema es aleatoria o sigue un patron?
- **De que forma se va a hacer? Como se va a lograr el objetivo?**

##### 6.3.1.7 Cuanto? / How much?
- Cuantificar los eventos - "para saber cuanto es la desviacion, la magnitud del problema" y el costo de la solucion.

> **Template**: Se utiliza la hoja "5W + 2H" del modelo "Matriz Jerarquizacion Eventos" (Anexo B).

#### 6.3.2 Informacion de entrada al proceso de RCA / RCA Process Inputs

La informacion que define la necesidad de ejecucion de una investigacion es:

- Incidentes de alta gravedad que afecten la seguridad, el medio ambiente o la continuidad operacional.
- Tendencias de indicadores que muestren comportamientos indeseados de una variable de control administrativa o tecnica.
- Analisis acumulativo de incidentes de falla en activos que afecten la operacion o generen altos costos a mediano o largo plazo (analisis de Pareto).
- Recomendaciones de analisis de grupos de interes en el mejoramiento del desempeno de activos.

> Cada una de estas entradas sera evaluada por el lider del proceso de Eliminacion de Fallas y el responsable del area donde se este presentando la desviacion en el desempeno o haya ocurrido un evento no deseado.

##### Figura 9: Fuentes de informacion para definir la necesidad de una investigacion

```
[Incidentes de alta gravedad] ----\
[Tendencias de indicadores] -------\
[Analisis acumulativo Pareto] ------+--> [Evaluacion por Lider RCA] --> [Necesidad de Investigacion]
[Recomendaciones de grupos] -------/
```

#### 6.3.3 Condiciones generales / General Conditions

- Todo evento que ocurra o requiera ser analizado debe ser inicialmente reportado utilizando el formato reporte de antecedentes preliminares de eventos (item 1 al 6), ver Anexo A.
- El evento objeto de analisis se debe clasificar de acuerdo con los criterios de calificacion de probabilidad y consecuencias en la matriz de determinacion de riesgos (item 3 del formato), para determinar el nivel de investigacion pertinente.
- Teniendo en cuenta los resultados del nivel del evento se debe crear el equipo investigador y notificar a sus integrantes, incluyendo el facilitador y responsable del analisis.

#### 6.3.4 Flujo de la metodologia RCA Causa-Efecto / RCA Cause-Effect Flow

```
[Reporte preliminar del evento]
    --> [Clasificacion nivel de analisis (Matriz de riesgo)]
        --> [Conformacion equipo investigador]
            --> [Recoleccion de evidencias (5Ps)]
                --> [Definicion del problema (Que, Cuando, Donde)]
                    --> [Construccion diagrama Causa-Efecto]
                        --> [Verificacion de hipotesis]
                            --> [Identificacion causas raiz (Fisica, Humana, Latente)]
                                --> [Definicion de soluciones efectivas]
                                    --> [Evaluacion costo-beneficio]
                                        --> [Implementacion priorizada]
```

---

### 6.4 Desarrollo de la metodologia RCA / RCA Methodology Development

#### 6.4.1 Concepto de las 5Ps / The 5Ps Concept

Para la recoleccion de las evidencias de eventos no deseados se deberan considerar como fuentes de evidencias las 5Ps:

##### 6.4.1.1 Partes / Parts
Se identifica con los elementos fisicos o tangibles que hacen parte de la evidencia de la investigacion a llevar a cabo. La lista de posibles partes tangibles dentro de una investigacion se relaciona directamente con el activo o medios fisicos que sean parte del incidente de falla:
- Fluidos
- Metales
- Muestras de aire o gases
- Partes diferenciadas de un activo o el activo en si mismo

##### 6.4.1.2 Posicion / Position
Los datos de posicion corresponden a dos dimensiones:
- **Posicion fisica** de la falla (registros fotograficos, videos, entrevistas, etc.)
- **Posicion temporal** (documentacion, registros, graficos, tendencias, etc.)

La conservacion de la informacion de posicion en muchos casos determina la secuencia de eventos o la potencia desencadenante de las causas que provocan un incidente de falla.

Informacion mas relevante de posicion a conservar:
- Posicion fisica de las partes en la escena del incidente
- Momento en el tiempo en donde se presento el incidente actual u otros pasados relacionados
- Medida de los instrumentos de control y supervision
- Lugar en donde se encontraban el personal responsable en el momento de incidente
- Lugar de ocurrencia del evento en relacion con la facilidad en general
- Informacion medioambiental relacionada con el lugar de ocurrencia (temperatura, humedad, velocidad del viento, etc.)
- Registro fotografico del lugar de los hechos

##### 6.4.1.3 Personas / People
Se refiere a la identificacion de las personas que pueden ser entrevistadas:
- **Prioridad 1**: Testigos fisicos del incidente
- **Prioridad 2**: Primeros observadores de la consecuencia
- **Prioridad 3**: Personal de responsabilidad en las areas afectadas

Tipos de personas durante la recopilacion:
- **Participantes**: Personas que aportan a esclarecer el desarrollo del incidente
- **Afectados**: Personas que experimentan algun tipo de dano por el incidente
- **Influenciadores**: Personas que pueden influenciar al grupo involucrado en el evento

Posibles entrevistados: Observadores, Mantenedores, Operadores, Supervisores, Personal administrativo, Personal tecnico, Compradores, Representantes de ventas, Disenadores de equipos, Personal de inspeccion, Personal de seguridad, Personal de medio ambiente, Expertos externos.

> **Importante**: Ante eventos donde hubo afectacion a la salud se recomienda colectar los testimonios en formato audio, tratando de conservar el conocimiento de la escena del incidente lo mas fiel posible al momento de su ocurrencia.

##### 6.4.1.4 Documentos (Papeles) / Documents (Papers)
Toda la informacion escrita o electronica disponible de los elementos fisicos involucrados en el incidente de falla:
- Estadisticas de comportamiento de procesos
- Reportes de inspeccion de riesgo
- Informacion de sistemas de control local y central
- Resultados de ensayos no destructivos
- Reportes de control de calidad
- Historial de mantenimiento
- Manual del equipo
- Pautas de mantenimiento
- Procedimientos
- AST, permisos de trabajo, permisos especiales
- Especificaciones tecnicas
- Politicas
- Informes de laboratorio
- Reportes financieros
- Comunicaciones internas y emails
- Planos de procesos e instrumentacion
- Reportes de incidentes pasados

> **Cadena de custodia**: Ante eventos donde hubo afectacion a la salud: crear una bitacora temporal, establecer numeracion de documentos almacenados, establecer controles para el acceso a la informacion colectada.

##### 6.4.1.5 Paradigmas / Paradigms
"Regla o conjunto de reglas aceptadas sin cuestionar y que suministra la base y modelo a seguir para resolver problemas y avanzar en el conocimiento". Se refiere a como cada individuo ve el mundo, reacciona y responde a las situaciones. Este comportamiento inherente en las personas afecta la manera de aproximarse a la solucion de problemas.

Afirmaciones tipicas a combatir:
- "No tenemos tiempo para el analisis"
- "Es imposible de resolver"
- "Hemos tratado de resolverlo en muchas ocasiones"
- "No hay que resolver nada, hemos trabajado asi desde siempre"
- "El analisis va a reducir puestos de trabajo"
- "Es otro camino para llevar a cabo caza de brujas"
- "Es el trabajo de otro no mio"
- "Es trabajo de mantenimiento"

##### Tabla 1: Escala de fragilidad de la informacion (5Ps) / Information Fragility Scale

| 5Ps | Escala de fragilidad (1=mas impactante, 4=menos) |
|---|---|
| **Posicion** | 1 |
| **Personas** | 1 |
| **Partes** | 2 |
| **Papeles** | 3 |
| **Paradigmas** | 4 |

#### 6.4.2 Generalidades del RCA Causa-Efecto / RCA Cause-Effect Generalities

La metodologia de analisis RCA se basa en el desarrollo del diagrama "causa efecto", para los eventos que se hayan clasificado en los **niveles dos (2) y tres (3)** en la matriz de determinacion de riesgos de MGFSN.

Principios clave:
- Abordar la situacion de una manera abierta
- La organizacion se esfuerce en corregir las deficiencias y prevenir que los problemas se repitan
- El compromiso y los factores criticos de exito deben ser definidos para que cada miembro del equipo conozca el proposito del analisis

Antes de dar inicio al analisis, el facilitador debe dar una introduccion sobre la metodologia:
- Que es el analisis de eventos?
- Por que utilizar el analisis de eventos?
- Filosofia del analisis de eventos
- Principios generales de la metodologia de Analisis de Causa Raiz

#### 6.4.3 Definicion del problema / Problem Definition

El punto de partida para un Analisis de Causa Raiz es la definicion adecuada del evento que se va a analizar.

##### 6.4.3.1 Que sucedio? / What happened?
El "Que sucedio" de cualquier evento no deseado es el efecto de la consecuencia. Este efecto es el que queremos que no se repita y que se debe denominar **"Efecto Primario"**. El Equipo analisis debe dejar claro cual es el problema o el evento que se va a eliminar, mitigar o controlar y dejarlo en una parte visible todo el tiempo que dure el analisis.

En la definicion del "Efecto Primario":
- Deberia reflejar sus metas y objetivos.
- Se deberia considerar la perspectiva de todas las personas.

> **Ejemplo**: "Muerte y lesiones a trabajadores y afectacion ambiental por accidente vehicular"

##### 6.4.3.2 Cuando sucedio? / When did it happen?
- **Tiempo cronologico**: Fecha y hora en la que ocurrio el efecto primario.
- **Tiempo relativo**: Que estaba sucediendo cuando ocurrio el problema? (condiciones climaticas, condiciones operacionales, intervenciones de procesos, operaciones especiales)

> **Ejemplo**: Tiempo cronologico: "24 septiembre 2020 a las 7:15 horas". Tiempo relativo: "cuando se dirigian a la oficina del supervisor a firmar permisos de trabajo para iniciar labores en presencia de fuertes lluvias al igual que el dia anterior".

##### 6.4.3.3 Donde sucedio? / Where did it happen?
El "Donde sucedio" de cualquier problema es la ubicacion relativa de un Efecto Primario. Se debe determinar el lugar donde ocurre el evento, en terminos de coordenadas fisicas en un mapa, la posicion relativa del lugar del incidente y/o evento incluyendo el sistema operativo, la unidad y/o componente.

> **Ejemplo**: "En el kilometro 12 de la via Campamento - planta cuando se movilizaban en la camioneta de la empresa".

#### 6.4.4 Clasificacion del nivel de analisis / Analysis Level Classification

Para definir el nivel de profundidad de analisis que requiere el evento no deseado es importante determinar la magnitud de las consecuencias, teniendo en cuenta:

- **Impacto economico en el negocio**: Impacto en el margen operacional del negocio asociado a los ingresos no percibidos.
- **Costo operacional**: Gastos relacionados a la perdida de la capacidad del proceso y los costos operacionales en adicion al costo de restaurar el contexto operacional.
- **Interrupcion de la operacion**: Cuantificacion del tiempo efectivo de discontinuidad operacional. Considerar buffers y redundancias.
- **Impacto a la seguridad y salud**: Afectacion sobre la salud humana.
- **Impacto al Medio Ambiente**: Afectacion sobre el medio ambiente (alcance, tiempo de remediacion, dano residual).
- **Responsabilidad social corporativa**: Afectacion en obligaciones legales y/o compromisos en el entorno social.

##### Figura 11: Clasificacion de eventos no deseados / Undesired Event Classification

El nivel de analisis resulta del intercepto entre el impacto de la consecuencia mas alto y su frecuencia o potencial de ocurrencia, usando la matriz de riesgos MGFSN:

| Nivel | Descripcion | Recursos |
|---|---|---|
| **RCA Nivel 3** | Alto impacto + Alta frecuencia | Equipo formal multidisciplinario, dedicacion total de maxima autoridad |
| **RCA Nivel 2** | Impacto medio | Equipo formal del proceso afectado, dedicacion parcial |
| **Reporte de Falla** | Afectacion baja | Analisis del personal involucrado con soporte adecuado |

#### 6.4.5 Elaboracion del diagrama Causa-Efecto / Cause-Effect Diagram Construction

El Diagrama Causa-Efecto es una representacion grafica de la relacion entre causas y efectos, partiendo del efecto primario objeto de investigacion ("Que?") para determinar las causas que originaron dicho efecto.

> **Principio fundamental**: Causa y efecto son lo mismo -- un efecto es la consecuencia de una causa y cuando nos preguntamos el por que de un efecto se vuelve causa.

##### Figura 13: Elementos de un diagrama Causa-Efecto

```
[Efecto Primario] <-- "Causado por" -- [Causa/Efecto]
                                           |
                                     [Causa-Accion] + [Evidencia]
                                     [Causa-Condicion] + [Evidencia]
                                     [Hipotesis (?)] - requiere verificacion
```

##### Paso 1: Para cada efecto primario pregunte Por que?
A partir del efecto primario se debe dar una mirada hacia atras a los hechos y empezar a indagar acerca de las causas. Se deben conectar los efectos y las causas con la frase **"Causado Por"**.

##### Paso 2: Busque causas en acciones y condiciones
Clasificar las causas y efectos en **acciones** y **condiciones**. No se debe descartar ninguna idea por equivocada que parezca. Por cada efecto deben existir por lo menos **dos causas**: una causa accion y una causa condicion.

##### Paso 3: Conecte todas las causas y efectos con "Causado por"
La conexion asegura el principio: **"Un efecto existe solamente si su causa existe en el mismo punto en tiempo y espacio"**.

##### Paso 4: Soporte todas las causas con evidencias
El diagrama permite documentar la existencia de la evidencia por cada Causa-Accion y/o cada Causa-Condicion. Si la evidencia no es suficiente o no existe, la causa se convierte en una **hipotesis** (marcar con "?").

**Tipos de evidencia (en orden de aceptabilidad):**

| Tipo | Descripcion | Aceptabilidad |
|---|---|---|
| **Evidencia inferida** | Derivada del conocimiento de relaciones causales conocidas y repetibles | Aceptada |
| **Evidencia sentida** | Asociada a los sentidos (ver, oir, tocar, oler, probar): fotos, registros, reportes, partes, entrevistas | Aceptada |
| **Evidencia emocional** | Sentimientos y emociones - pueden proporcionar pistas | No aceptada como soporte formal |
| **Evidencia intuitiva** | Combina razonamiento y sentimientos a nivel subconsciente | No aceptada como soporte formal |

##### Paso 5: Verificacion de las causas raiz
La determinacion de causas es **jerarquica e iterativa**:

1. **Causa Raiz Fisica** (primera en ser hallada): Mecanismos de falla atribuibles a componentes de maquina, materiales o elementos tangibles. Es la que con menos frecuencia se encuentra como "unica causa".

2. **Causa Raiz Humana** (segunda): Mecanismos de falla o degradaciones tempranas atribuibles a una intervencion inapropiada de un ser humano. Como "unica causa" suele ser mas comun que la causa raiz fisica.

3. **Causa Raiz Latente** (ultima): Deficiencia de los sistemas administrativos o de gestion (reglas, procedimientos, guias, politicas, etc.) o "normas" culturales. Suele ser la mas comun, siendo la mayoria de las veces la desencadenante de las fallas humanas o fisicas.

> **Regla**: El diagrama causa-efecto no debe detenerse hasta no identificar para cada causa raiz fisica, la causa raiz humana y la causa raiz latente que la origino.

#### 6.4.6 Identificacion de Soluciones Efectivas / Effective Solution Identification

Para las causas raiz fisicas, humanas y latentes validadas, el equipo de analisis debera generar las posibles soluciones que deberan ser evaluadas por medio de un **filtro de 5 preguntas**:

1. Al eliminar esa causa elimina el efecto primario?
2. La solucion previene la recurrencia de ese evento?
3. La solucion cumple con las metas y objetivos de la compania?
4. La implementacion de la solucion esta bajo el control de la compania o se puede alcanzar ese control?
5. La solucion no genera problemas adicionales?

Para cada solucion definida:
- Hacer una aproximacion lo mas detallada posible de los recursos requeridos (rediseno, servicios, personal, materiales, equipos, tiempo estimado, etc.)
- Determinar el costo de su implementacion (hoja "costos recomendaciones" del Modelo RCA MGFSN)
- Evaluar la efectividad (libro "evaluacion recomendaciones")
- Registrar en la hoja "priorizacion recomendaciones"

> **Regla de posicion en el diagrama**: Si la causa a eliminar se encuentra hacia la **derecha** del diagrama, la solucion es mas economica y efectiva (contribuye a eliminar otras causas encadenadas). Si la causa esta hacia la **izquierda**, su ejecucion es mas controlable pero generalmente mas costosa.

---

### 6.5 Implementar / Implement

El proposito de esta etapa es implementar las soluciones (actividades) producto del analisis realizado por el equipo investigador. Las soluciones pueden variar desde un simple cambio en los procesos hasta cambios complejos de diseno en un plan de accion priorizado.

#### 6.5.1 Relacion Costo-Beneficio / Cost-Benefit Relationship

La implementacion de la solucion se debe expresar en la relacion costo beneficio sobre la oportunidad en la eliminacion de la recurrencia del evento no deseado y el escenario de riesgo actual.

##### Figura 14: Evaluacion de la relacion riesgo, costo, beneficio

```
Riesgo Actual vs. Costo de Implementacion vs. Beneficio Esperado
  --> Determina clasificacion: Alto / Medio / Bajo beneficio
```

#### 6.5.2 Dificultad de la implementacion / Implementation Difficulty

Evaluacion detallada de:
- Tiempo requerido
- Grado de especializacion del talento humano
- Costo de la implementacion

##### Figura 16: Matriz de priorizacion de soluciones / Solution Prioritization Matrix

```
                    Dificultad (Difficulty)
                    Baja         Media        Alta
              +------------+------------+------------+
    Alto      | CUADRANTE 1| CUADRANTE 2| CUADRANTE 3|
Beneficio     | (Prioridad)| (Programar)| (Evaluar)  |
              +------------+------------+------------+
    Medio     | CUADRANTE 1| CUADRANTE 2| CUADRANTE 3|
              +------------+------------+------------+
    Bajo      | CUADRANTE 2| CUADRANTE 3| CUADRANTE 4|
              | (Programar)| (Evaluar)  | (Diferir)  |
              +------------+------------+------------+

Prioridad: Cuadrante 1 > Cuadrante 2 > Cuadrante 3 > Cuadrante 4
```

---

### 6.6 Controlar / Control

El proposito de esta etapa es determinar la eficiencia del proceso y la eficacia de las soluciones propuestas frente a los objetivos establecidos.

#### 6.6.1 Medir los resultados / Measure Results

Se deben recopilar los datos necesarios para medir los resultados con respecto a los objetivos establecidos en un periodo de tiempo predeterminado.

> **Importante**: Evitar divulgar casos de exito demasiado pronto. Se debe considerar exitoso cuando se hayan implementado todas las soluciones y haya transcurrido un tiempo apropiado.

Ejemplos de medicion del exito:
- Reduccion del mantenimiento correctivo: histograma de costos donde se evidencie descenso de la desviacion en el presupuesto.
- Aumento de la disponibilidad: reduccion de eventos no deseados (analisis de Pareto).
- Reduccion del efecto sobre salud y seguridad: reduccion de LTIR (Lost Time Injury Rate) y TRIR (Total Recordable Incident Rate).
- Aumento de la productividad: reduccion del tiempo de inactividad o aumento en el rendimiento de la produccion.
- Disminucion en los incidentes o afectaciones al medio ambiente.

#### 6.6.2 KPIs del Proceso de Eliminacion de Fallas / Defect Elimination Process KPIs

##### KPI 1: Cumplimiento del reporte de eventos no deseados

```
Formula: Cumplimiento = (Eventos no deseados ocurridos y reportados / Eventos ocurridos) x 100
Frecuencia: Semanal
Responsable: Ingeniero de confiabilidad
Meta: 100%
```

##### KPI 2: Cumplimiento en ejecucion de reuniones de analisis

```
Formula: Cumplimiento = (Reuniones de analisis realizadas / Reuniones de analisis programadas) x 100
Frecuencia: Semanal
Responsable: Ingeniero de confiabilidad
Meta: 100%
```

##### KPI 3: Avance en la implementacion de soluciones propuestas

```
Formula: Estado del avance = Avance real - Avance esperado
Frecuencia: Mensual
Responsable: Ingeniero de confiabilidad
Meta: +/- 5%
```

##### KPI 4: Ahorros por efectividad de las recomendaciones

```
Formula: Ahorros = Costos incurridos por incidentes de falla - Costos operacionales debidos a la prevencion o mitigacion de consecuencias de incidentes de falla
Frecuencia: Trimestral
Responsable: Ingeniero de confiabilidad
Meta: Definida para cada evento analizado segun expectativas de reduccion de costos
```

##### KPI 5: Reduccion en la frecuencia de ocurrencia de eventos analizados

```
Formula: Reduccion de frecuencia = (1 - (Incidentes de falla despues del analisis / Incidentes de falla antes del analisis)) x 100
Frecuencia: Trimestral
Responsable: Ingeniero de confiabilidad
Meta: Definida para cada evento analizado segun expectativas de reduccion de fallas
```

---

## 7. Roles y Responsabilidades / Roles and Responsibilities

### 7.1 Superintendente de Mantenimiento / Maintenance Superintendent

**Rol**: Asegurar recursos y aprobar resultados de analisis.

**Responsabilidades**:
- Asegurar los recursos humanos y financieros necesarios para la solucion efectiva de eventos no deseados.
- Aprobar resultados de analisis nivel 2 y dar seguimiento.
- Participar en analisis de eventos nivel 3.
- Asegurar la disponibilidad oportuna de los integrantes del equipo RCA.
- Aprobar las recomendaciones emitidas del analisis RCA.
- Asegurar el cumplimiento de la implementacion de soluciones.
- Participar en las reuniones mensuales de evaluacion y seguimiento de indicadores.
- Monitorear la efectividad del proceso de eliminacion de fallas.

### 7.2 Lider del proceso RCA - Profesional de Confiabilidad / RCA Process Leader - Reliability Professional

**Rol**: Actualizacion y administracion funcional del proceso de Eliminacion de Fallas, de la metodologia RCA y de las herramientas de soporte.

**Responsabilidades**:
- Asegurar el correcto funcionamiento del proceso y metodologia RCA.
- Evaluar la efectividad a traves del reporte periodico (no mayor a un mes) de indicadores de gestion.
- Evaluar periodicamente el funcionamiento de la metodologia RCA e implementar mejoras.
- Verificar la documentacion oportuna de los analisis de eventos.
- Realizar seguimiento a la implementacion oportuna de las soluciones.
- Elaborar y divulgar las lecciones aprendidas.
- Identificar y priorizar los eventos cronicos (recurrentes) y malos actores.
- Emitir recomendaciones para cumplimiento de objetivos.
- Convocar reuniones periodicas (no mayor a un mes) de indicadores.
- Realizar capacitaciones de refuerzo periodicas en la metodologia RCA.

### 7.3 Responsable de la investigacion / Investigation Owner

**Rol**: Jefe del proceso del area especifica donde sucedio el evento no deseado, interesado mas inmediato (primario) en la solucion y prevencion futura.

**Responsabilidades**:
- Aprobar el reporte de antecedentes preliminares de eventos.
- Aprobar los integrantes del equipo de investigacion.
- Participar dentro de las reuniones del equipo investigador.
- Aprobar la evaluacion y justificacion tecnica y economica de las soluciones.
- Realizar seguimiento a la implementacion de soluciones.
- Monitorear la efectividad de las soluciones implementadas.

### 7.4 Profesional de Salares Norte / Salares Norte Professional

**Rol**: Responsable de la captura y tratamiento de eventos no deseados, asegurar el registro oportuno de las desviaciones.

**Responsabilidades**:
- Asegurar que todos los eventos sean reportados usando el formato reporte de antecedentes preliminares.
- Asegurar que los eventos de falla de equipos sean reportados en el modulo PM SAP, con toda la informacion requerida.
- Facilitar la ejecucion de las recomendaciones de mejoramiento.
- Implementar oportunamente las soluciones efectivas a su cargo.

### 7.5 Equipo investigador / Investigation Team

**Rol**: Equipo multidisciplinario encargado de realizar el analisis del evento no deseado, establecer las causas raiz (fisicas, humanas y latentes) y generar las recomendaciones adecuadas.

**Responsabilidades**:
- Desarrollar la investigacion siguiendo la metodologia RCA y el diagrama causa-efecto.
- Recopilar la evidencia que sustenta las acciones y condiciones del diagrama.
- Proponer y evaluar alternativas de solucion efectivas que eliminen o mitiguen a un nivel de riesgo, costo y beneficio aceptable.
- Apoyar a los responsables del plan de implementacion.

### 7.6 Facilitador de la metodologia RCA / RCA Methodology Facilitator

**Rol**: Persona con entrenamiento especifico en la metodologia RCA, encargado de conducir al equipo investigador.

**Responsabilidades**:
- Dar cumplimiento funcional de la metodologia RCA.
- Verificar la existencia del reporte preliminar y darlo a conocer al equipo.
- Hacer seguimiento a las acciones asignadas.
- Acompanamiento permanente hasta el cierre del analisis.
- Retroalimentacion de los resultados.
- Documentar la evolucion del analisis durante las reuniones.
- Establecer tiempos y fechas de reuniones de analisis.
- Establecer tiempos y fechas de ejecucion de soluciones.
- Evaluar la efectividad del proceso y metodologia.
- Participar en las reuniones periodicas de seguimiento.
- Elaborar y presentar el reporte de analisis RCA para aprobacion.

### 7.7 Especialista requerido (opcional) / Required Specialist (optional)

**Rol**: Persona con alto conocimiento y experiencia en un tema particular referente al evento a analizar. Puede ser externo a MGFSN.

**Responsabilidades**:
- Brindar soporte durante la investigacion, siguiendo la metodologia RCA.
- Reunir toda la informacion necesaria para el RCA y presentarla en la reunion.
- Brindar soporte en la presentacion del reporte de investigacion para aprobacion.

---

## 8. Anexos / Appendices

### Anexo A - Modelo RCA MGFSN
Contiene:
- Formato reporte de antecedentes preliminares de eventos (items 1-6)
- Libro Diagrama CE (Causa-Efecto)
- Libro Verificacion hipotesis
- Libro Reporte Falla (causas raiz fisicas, humanas y latentes)
- Hoja costos recomendaciones
- Libro evaluacion recomendaciones
- Hoja priorizacion recomendaciones

### Anexo B - Matriz Jerarquizacion Eventos
Contiene:
- Hoja "EvaluacionDesviaciones" - Planilla para evaluacion de desviaciones
- Hoja "5W + 2H" - Plantilla para analisis 5W+2H

---

## Quick Reference: RCA Process Summary

```
Step 1: IDENTIFY   -> Use KPIs (Availability, HSE, Costs, WO Feedback) to detect deviations
Step 2: PRIORITIZE  -> Cost-Benefit vs. Implementation Difficulty matrix
Step 3: ANALYZE     -> For low complexity: 5W+2H method
                    -> For medium/high complexity: RCA Cause-Effect method
                       a) Collect evidence using 5Ps (Parts, Position, People, Papers, Paradigms)
                       b) Define problem (What, When, Where)
                       c) Classify analysis level (RCA Level 2, 3, or Failure Report)
                       d) Build Cause-Effect diagram (5 steps)
                       e) Identify root causes: Physical -> Human -> Latent
                       f) Validate solutions with 5-question filter
Step 4: IMPLEMENT   -> Prioritize using Cost-Benefit vs. Difficulty matrix (4 quadrants)
Step 5: CONTROL     -> Measure 5 KPIs: Event reporting, Meeting compliance,
                       Solution implementation progress, Cost savings, Frequency reduction
```
