# GFSN Criticality Analysis Full Procedure / Procedimiento Completo de Analisis de Criticidad

---

| Metadata | Value |
|---|---|
| **Source File** | `asset-criticality-analysis-procedure--GFSN01-DD-EM-0000-PT-00001_Procedimiento Analisis Criticidad.pdf` |
| **Document Code** | GF-CH-175-Informe-03, Rev 01 |
| **Original Title** | Procedimiento Analisis de Criticidad |
| **Organization** | Minera Gold Fields Salares Norte Ltda |
| **Author** | Milena Luna Rojas - Asset Management Consultant |
| **Reviewed by** | Carlos Rodriguez Rodriguez - Asset Management Consultant Specialist |
| **Approved by** | Alberto Cardenas Navas - Technical Manager SoAM Asset Optimization |
| **Original Date** | June 29, 2020 |
| **Page Count** | 16 |
| **Conversion Date** | 2026-02-23 |
| **Language** | Spanish (original) with English section headers |

---

## Used By Skills

| Skill | Usage |
|---|---|
| `assess-criticality` | Primary procedure - defines the complete criticality analysis methodology, risk matrix, consequence/frequency evaluation criteria |
| `calculate-priority` | Provides criticality levels (Alto/Moderado/Bajo) and scoring methodology used to calculate maintenance priority rankings |

---

## Table of Contents / Tabla de Contenido

1. [Objeto / Purpose](#1-objeto--purpose)
2. [Alcance / Scope](#2-alcance--scope)
3. [Definiciones / Definitions](#3-definiciones--definitions)
4. [Antecedentes / Background](#4-antecedentes--background)
5. [Proceso de Analisis / Analysis Process](#5-proceso-de-analisis--analysis-process)
   - 5.1 [Entradas del Proceso / Process Inputs](#51-entradas-del-proceso--process-inputs)
   - 5.2 [Salidas del Proceso / Process Outputs](#52-salidas-del-proceso--process-outputs)
6. [Responsabilidades / Responsibilities](#6-responsabilidades--responsibilities)
   - 6.1 [Equipo Evaluador / Evaluation Team](#61-equipo-evaluador--evaluation-team)
   - 6.2 [Facilitador / Facilitator](#62-facilitador--facilitator)
7. [Descripcion del Proceso / Process Description](#7-descripcion-del-proceso--process-description)
   - 7.1 [Definicion de los criterios de evaluacion de consecuencias / Consequence Evaluation Criteria](#71-definicion-de-los-criterios-de-evaluacion-de-consecuencias--consequence-evaluation-criteria)
   - 7.2 [Definicion de criterios de Frecuencia / Frequency Criteria](#72-definicion-de-criterios-de-frecuencia--frequency-criteria)
   - 7.3 [Recoleccion de la documentacion tecnica / Technical Documentation Collection](#73-recoleccion-de-la-documentacion-tecnica--technical-documentation-collection)
   - 7.4 [Jerarquizacion inicial de Criticidad / Initial Criticality Ranking](#74-jerarquizacion-inicial-de-criticidad--initial-criticality-ranking)
   - 7.5 [Trabajo con la plantilla / Working with the Template](#75-trabajo-con-la-plantilla--working-with-the-template)
   - 7.6 [Informe final / Final Report](#76-informe-final--final-report)
8. [Referencias Bibliograficas / Bibliographic References](#8-referencias-bibliograficas--bibliographic-references)
9. [Anexo 1 - Ficha tecnica de evaluacion / Appendix 1 - Evaluation Technical Sheet](#9-anexo-1---ficha-tecnica-de-evaluacion--appendix-1---evaluation-technical-sheet)

---

## 1. Objeto / Purpose

Definir la metodologia a seguir para llevar a cabo los estudios de criticidad de activos fisicos de Minera Gold Fields Salares Norte Ltda, a fin de establecer prioridades en la aplicacion de las estrategias de operacion, mantenimiento, mejoramiento, modernizacion de activos, y otras que pudiesen verse afectadas por el riesgo inherente de los diferentes sistemas.

> **English summary**: Define the methodology to conduct criticality studies of physical assets at Minera Gold Fields Salares Norte Ltda, in order to establish priorities in the application of operation, maintenance, improvement, and asset modernization strategies, and others that could be affected by the inherent risk of different systems.

---

## 2. Alcance / Scope

El presente procedimiento aplica para todos los activos fisicos que son propiedad de Minera Gold Fields en el proyecto Salares Norte.

> **English summary**: This procedure applies to all physical assets owned by Minera Gold Fields in the Salares Norte project.

---

## 3. Definiciones / Definitions

**Criticidad / Criticality**: Es un caso particular del analisis de riesgo, usado para reconocer el riesgo inherente de un activo fisico dentro de un contexto operacional. Su resultado clasifica los activos fisicos con diferentes niveles de "importancia" dentro de un proceso productivo, esta importancia tipicamente es el resultado de evaluar las consecuencias que pudiese tener una o varias fallas de alto impacto de un activo vs la frecuencia o probabilidad de aparicion de dichas fallas en el tiempo.

**Analisis de Criticidad Cualitativo / Qualitative Criticality Analysis**: Metodos basados en opiniones de especialistas, donde se combinan criterios tecnicos, ambientales y financieros para jerarquizar activos, pueden llegar a contener gran nivel de subjetividad, siendo efectivos para sistemas no complejos.

**Analisis de Criticidad Semi-Cuantitativo / Semi-Quantitative Criticality Analysis**: Metodo basado en opiniones de especialistas, cuantificando valores numericos relativos, que permiten medir el impacto global basados en criterios tecnicos, ambientales y financieros para jerarquizar activos, son efectivos para jerarquizar procesos indistintamente de su nivel de complejidad.

**Analisis de Criticidad Cuantitativo / Quantitative Criticality Analysis**: Es una herramienta que permite estimar de forma cuantitativa el impacto economico asociado a una falla, a la vez de establecer el orden jerarquico de un conjunto de ellas utilizando un modelo semi-probabilistico.

**Consecuencia / Consequence**: Efecto resultante de la falla en un activo expresado en terminos de Seguridad para las Personas, Medio Ambiente, Calidad, Perdidas de Produccion, Imagen, Costos de Produccion, entre otros aspectos que determine la organizacion.

**Equipo evaluador / Evaluation Team**: Equipo temporal multidisciplinario encargado de la evaluacion de la criticidad de los activos segun los lineamientos de la metodologia. El equipo debera estar conformado por un facilitador y personal de las diferentes areas que conforman la operacion de la organizacion.

**Evento / Event**: Cualquier suceso o cadena de sucesos que produzca o pueda producir lesiones a las personas, danos a los activos o al medio ambiente, perdidas de produccion, desviaciones al desempeno operacional y/o financiero del negocio, deterioro de la imagen corporativa, entre otras que determine la organizacion (siempre alineado a las politicas de sostenibilidad).

**Facilitador / Facilitator**: Persona con conocimiento en analisis de criticidad de activos y evaluacion de riesgo, que soporta al equipo evaluador en la aplicacion de la metodologia y utilizacion de los recursos documentales y de tiempo empleados en el analisis de criticidad de activos.

**Falla / Failure**: Finalizacion de la habilidad de un item o activo para desempenar una funcion requerida.

**Frecuencia / Frequency**: Numero de veces que se repite un proceso periodico por unidad de tiempo.

**Funcion / Function**: Las acciones o requerimientos que deben cumplir items, activos o sistemas, algunas veces definidos en terminos de desempeno.

**Item / Item**: Cualquier parte, componente, dispositivo, subsistema, unidad funcional, equipo o sistema que puede ser considerado individualmente.

**Matriz de Criticidad / Criticality Matrix**: Herramienta utilizada para hallar la relacion entre los criterios de consecuencia de falla y los criterios de probabilidad o frecuencia de su aparicion en un activo fisico, la interseccion de estas dos variables dentro de la matriz indica la clasificacion de criticidad del activo evaluado.

**Probabilidad / Probability**: Mide la frecuencia con la que se obtiene un resultado (o conjunto de resultados) al llevar a cabo un experimento aleatorio, del que se conocen todos los resultados posibles. Supone la utilizacion de herramientas estadisticas para la determinacion de la frecuencia.

**Redundancia / Redundancy**: La existencia de mas de un item para respaldar la realizacion de una funcion requerida.

**Taxonomia / Taxonomy**: Clasificacion sistematica de items dentro de grupos genericos, que ubican de manera jerarquica un item o activo dentro de un proceso productivo.

---

## 4. Antecedentes / Background

Dado que Salares Norte no cuenta con datos estadisticos o probabilisticos en su eje de probabilidad de ocurrencia, se debio redefinir eje de evaluacion de probabilidad con una base de tiempo fijo congruente con el ciclo de vida del proyecto dentro del contexto operacional, asi:

- **Base de tiempo maxima**: 10 anos, el cual fue definido teniendo en cuenta la coincidencia con el tiempo promedio vida del proyecto y de los activos mas criticos. Asi mismo la probable aparicion de fallas catastroficas despues de este periodo de tiempo se hace mas homogeneo entre los activos mas confiables.

- **Base de tiempo minima**: Se determino teniendo en cuenta la frecuencia de fallas maxima que se considera aceptable para fallas de afectacion moderadas en la operacion.

- **Valoracion y categorizacion de impactos**: La valoracion y categorizacion de los impactos de los eventos dentro de la matriz de riesgo establece en un eje o sentido la asignacion de la(s) categoria(s) sobre la que presenta alguna incidencia (categorias de consecuencias economicas y no economicas cada una con tres aspectos diferenciados) frente a cinco niveles de impacto segun su consecuencia.

- **Aspectos economicos**: Se valoraron en terminos del impacto real del evento que se este analizando, estableciendo los niveles de riesgo ajustados al contexto de negocio de la operacion de Salares del Norte que se encuentran en la Matriz de Riesgo que complementa el presente procedimiento.

- **Zonas de tolerancia de riesgo**: Fueron distribuidas con base en las zonas de riesgo aceptable o ALARP. Asi todas las intersecciones de la matriz con los valores mas altos de impacto de las consecuencias seran tratados con el mayor nivel de riesgo.

> **Note (LOM Context)**: El LOM del Proyecto son 12.5 anos. Eventos que podrian ocurrir una vez cada 15 o 20 anos tambien deben evaluarse, porque al ser probabilistico se podria dar la posibilidad de ocurrencia.

---

## 5. Proceso de Analisis / Analysis Process

### 5.1 Entradas del Proceso / Process Inputs

Las entradas para llevar a cabo el analisis de criticidad de activos son:

- Documentacion tecnica de los activos que integran las diferentes plantas.
- Criterios de clasificacion de consecuencias de falla
- Criterios de clasificacion de frecuencias de falla.
- Taxonomia de sistemas de activos.
- Diagramas de confiabilidad de procesos (de existir)
- Matrices de riesgo definidas para todos los procesos propiedad de Gold Fields en Salares Norte.
- Diagramas P&ID
- Diagramas PFD

### 5.2 Salidas del Proceso / Process Outputs

- Criterios de evaluacion de criticidad definidos.
- Listado de equipos evaluados segun su criticidad.
- Recomendaciones generales para control de riesgo inherente de los activos.

---

## 6. Responsabilidades / Responsibilities

### 6.1 Equipo Evaluador / Evaluation Team

Las responsabilidades del equipo evaluador son:

- Validar los criterios de decision para evaluar las consecuencias de falla.
- Validar los criterios de decision para evaluar la frecuencia o probabilidad de ocurrencia de la falla.
- Establecer la delimitacion de las funciones de los activos en el proceso.
- Identificar las fallas potenciales en los activos objeto de analisis.
- Participar de las sesiones de evaluacion y llevar la informacion requerida (documentacion tecnica).
- Evaluar las consecuencias de falla de manera agil y correcta.

> **Nota**: Las dos primeras responsabilidades del equipo evaluador se llevan a cabo para asegurar que los criterios de evaluacion sean aplicables al contexto operacional, de ser necesario realizar modificaciones a los criterios estos deben ser avalados por los responsables de su definicion - Gestion de Riesgo.

### 6.2 Facilitador / Facilitator

- Convocar las sesiones de trabajo asegurandose que los participantes tengan claro el objeto del analisis.
- Controlar el uso adecuado del tiempo.
- Diligenciar las fichas tecnicas de evaluacion de la criticidad de activos.
- Consolidar el listado final de equipos evaluados.
- Entregar los reportes de recomendaciones producto de los analisis de criticidad -- si fuesen necesarios.

---

## 7. Descripcion del Proceso / Process Description

### Process Flowchart / Diagrama de Flujo (Figura 1)

```
FACILITADOR                         EQUIPO EVALUADOR                ENTREGABLES
    |                                     |                              |
    v                                     v                              v
[Definicion de los activos a evaluar] --------------------------------> Listado de activos a evaluar
    |
    v
[Definicion de criterios de evaluacion de consecuencias de falla] ---> Criterios de evaluacion definidos
    |
    v
[Definicion de criterios de evaluacion de probabilidad de falla] ----> Criterios de evaluacion definidos
    |
    v
[Recoleccion de la documentacion tecnica] --------------------------> Recoleccion de planos, taxonomia,
    |                                                                   P&ID's, modelos de confiabilidad,
    |                                                                   entre otros
    v
[Definicion del contexto operacional de las unidades funcionales]
    |
    v
[Alistamiento de la ficha tecnica de evaluacion] -------------------> Ficha tecnica de evaluacion diligenciada
    |
    v
[Evaluar la criticidad]
    |
    v
[Jerarquizar los activos de acuerdo con la criticidad] -------------> Activos evaluados y jerarquizados
    |
    v
[Informe final del analisis de criticidad de activos] --------------> Informe final de evaluacion
```

### 7.1 Definicion de los criterios de evaluacion de consecuencias / Consequence Evaluation Criteria

La definicion de los factores y aspectos que seran tenidos en cuenta para evaluar las consecuencias de falla de activos sigue las delimitaciones funcionales de la Matriz de Valoracion de Riesgos definida para la operacion de Salares Norte, estos son:

#### 7.1.1 Factores economicos / Economic Factors

- **Impacto economico en el negocio / Business economic impact**: Se refiere al impacto en el margen operacional del negocio asociado a los ingresos no percibidos por el producto final no entregado durante el tiempo en que el proceso productivo no podra estar disponible.

- **Costo operacional / Operational cost**: Se refiere a los gastos que estan relacionados a la perdida de la capacidad del proceso y los costos operacionales en adicion al costo de restaurar el contexto operacional y la reparacion.

- **Interrupcion de la operacion / Operation interruption**: Es la cuantificacion del tiempo efectivo de discontinuidad operacional que genera el evento. Para su correcta estimacion se deben considerar los buffer y las configuraciones de redundancias existentes en el proceso.

#### 7.1.2 Factores no economicos / Non-Economic Factors

- **Impacto a la seguridad y salud / Safety and health impact**: Se refiere a la afectacion que pudiese tener la falla del activo sobre la salud de los trabajadores.

- **Impacto al Medio Ambiente / Environmental impact**: Se refiere a la afectacion que pudiese tener la falla sobre el medio ambiente circundante, medida diferencialmente en terminos de alcance, tiempo de remediacion y dano residual que puede generar.

- **Responsabilidad social corporativa / Corporate social responsibility (RSC)**: Se refiere a la afectacion que puede tener un evento en las obligaciones de caracter legal y/o compromisos que la organizacion ha adoptado en el entorno social, cuyos efectos pueden representar afectaciones economicas, legales, conflictos con la comunidad y directamente sobre la capacidad de operacion e imagen de la compania.

#### Impact Scale / Escala de Impacto

La afectacion sobre cada uno de los anteriores aspectos se pondera de acuerdo con escalas clasificadas de la siguiente forma:

| Nivel / Level | Valor / Value | Descripcion / Description |
|---|---|---|
| **Insignificante** | 1 | Nivel de impacto que clasifica la consecuencia de la falla como tolerable, generalmente es de muy baja importancia y requiere pocos recursos para su atencion. |
| **Menor** | 2 | Nivel de consecuencia aun bajo, su impacto puede generar inconvenientes localizados de atencion inmediata. |
| **Moderado** | 3 | Nivel de consecuencia medio, su impacto puede generar inconvenientes a la operacion de forma general. |
| **Mayor** | 4 | Nivel de consecuencias alto, su impacto puede llevar a la inoperatividad general o a la afectacion de resultados empresariales. |
| **Extremo** | 5 | Se refiere a un nivel de consecuencias que Gold Fields no tolera por su gran impacto. Las consecuencias a este nivel pueden poner en riesgo la continuidad o el logro de resultados empresariales. |

#### 7.1.3 Tabla 1: Aspectos de evaluacion - Factores economicos / Economic Factor Evaluation Aspects

**Impacto economico en el negocio:**

| Nivel | Descripcion |
|---|---|
| 1 - Insignificante | Impacto economico insignificante |
| 2 - Menor | Impacto economico menor |
| 3 - Moderado | Impacto economico moderado |
| 4 - Mayor | Impacto economico mayor |
| 5 - Extremo | Impacto economico extremo |

**Costo operacional:**

| Nivel | Descripcion |
|---|---|
| 1 - Insignificante | Costo operacional insignificante |
| 2 - Menor | Costo operacional menor |
| 3 - Moderado | Costo operacional moderado |
| 4 - Mayor | Costo operacional mayor |
| 5 - Extremo | Costo operacional extremo |

**Interrupcion de la operacion:**

| Nivel | Descripcion |
|---|---|
| 1 - Insignificante | Interrupcion insignificante |
| 2 - Menor | Interrupcion menor |
| 3 - Moderado | Interrupcion moderada |
| 4 - Mayor | Interrupcion mayor |
| 5 - Extremo | Interrupcion extrema |

#### 7.1.4 Tabla 2: Aspectos de evaluacion - Factores no economicos / Non-Economic Factor Evaluation Aspects

**Seguridad y Salud / Safety and Health:**

| Nivel | Descripcion |
|---|---|
| 1 - Insignificante | Afectacion insignificante a seguridad |
| 2 - Menor | Afectacion menor a seguridad |
| 3 - Moderado | Afectacion moderada a seguridad |
| 4 - Mayor | Afectacion mayor a seguridad |
| 5 - Extremo | Afectacion extrema a seguridad |

**Medio Ambiente / Environment:**

| Nivel | Descripcion |
|---|---|
| 1 - Insignificante | Afectacion ambiental insignificante |
| 2 - Menor | Afectacion ambiental menor |
| 3 - Moderado | Afectacion ambiental moderada |
| 4 - Mayor | Afectacion ambiental mayor |
| 5 - Extremo | Afectacion ambiental extrema |

**RSC (Comunidad / Imagen / Cumplimiento legal):**

| Nivel | Descripcion |
|---|---|
| 1 - Insignificante | Afectacion insignificante a RSC |
| 2 - Menor | Afectacion menor a RSC |
| 3 - Moderado | Afectacion moderada a RSC |
| 4 - Mayor | Afectacion mayor a RSC |
| 5 - Extremo | Afectacion extrema a RSC |

### 7.2 Definicion de criterios de Frecuencia / Frequency Criteria

La definicion de los aspectos que seran tenidos en cuenta para evaluar la frecuencia con que pudiese presentarse la falla analizada sobre el activo son las siguientes:

#### Tabla 3: Escala de probabilidad de ocurrencia del evento / Event Occurrence Probability Scale

| Nivel | Valor | Descripcion |
|---|---|---|
| **Raro** | 1 | Evento que puede ocurrir en circunstancias excepcionales (frecuencia muy baja) |
| **Improbable** | 2 | Evento que podria ocurrir en algun momento (frecuencia baja) |
| **Posible** | 3 | Evento que podria ocurrir en algun momento (frecuencia media) |
| **Probable** | 4 | Evento que probablemente ocurrira en la mayoria de las circunstancias (frecuencia alta) |
| **Casi seguro** | 5 | Evento que se espera que ocurra en la mayoria de las circunstancias (frecuencia muy alta) |

### 7.3 Recoleccion de la documentacion tecnica / Technical Documentation Collection

Para realizar un analisis con soportes y los fundamentos necesarios se debe recolectar la siguiente informacion:

- Taxonomia completa de los activos y sistema objeto de analisis
- Documentos tecnicos que contengan informacion sobre las plantas tales como:
  - Descripcion detallada de la planta y sus sistemas.
  - Requerimientos de Capacidad.
  - Condiciones de operacion.
  - Descripcion de equipos.

### 7.4 Jerarquizacion inicial de Criticidad / Initial Criticality Ranking

De las anteriores consideraciones de consecuencia y frecuencia, se construye la matriz de criticidad inicial. La clasificacion de criticidad del activo objeto de analisis, sera la suma del valor del intercepto de cada uno de los factores y aspectos a evaluar. El valor resultante se ubicara en la matriz y la region donde este valor corresponda numericamente definira el nivel de criticidad final.

Se aclara que esta matriz se considera inicial, ya que es probable que dentro de la realizacion de los analisis de criticidad de acuerdo con los resultados sea necesario reconsiderar niveles de afectacion, probabilidad o las zonas de valoracion de criticidad dentro de la matriz.

#### Figura 2: Matriz de evaluacion de criticidad de activos / Asset Criticality Evaluation Matrix

| Frecuencia / Probabilidad | 1 - Insignificante | 2 - Menor | 3 - Moderado | 4 - Mayor | 5 - Extremo |
|---|---|---|---|---|---|
| **5 - Casi seguro** | Moderado | Moderado | Alto | Alto | Alto |
| **4 - Probable** | Bajo | Moderado | Moderado | Alto | Alto |
| **3 - Posible** | Bajo | Moderado | Moderado | Moderado | Alto |
| **2 - Improbable** | Bajo | Bajo | Moderado | Moderado | Alto |
| **1 - Raro** | Bajo | Bajo | Bajo | Moderado | Moderado |

#### Tabla 4: Niveles de criticidad / Criticality Levels

| Nivel / Level | Rango / Range | Descripcion / Description |
|---|---|---|
| **Alto / High** | 19 a 25 | Nivel de criticidad "ALTO", dadas las caracteristicas del activo para seguridad o la operacion continua de los procesos no puede reducirse el nivel de riesgo frente a eventos mayores, por lo tanto, se deben tomar medidas de control obligatorias combinando diferentes estrategias para prevenir o mitigar sus efectos. |
| **Moderado / Medium** | 8 a 18 | Nivel de criticidad "MEDIO" dadas las caracteristicas del activo podria generar efectos con moderadas consecuencias, se debe observar su comportamiento para controlar sus efectos. |
| **Bajo / Low** | 1 a 7 | Nivel de criticidad "BAJO" los eventos no generan efectos con consecuencias que se deban controlar, puede considerarse operar hasta la falla (run-to-failure). |

#### Key Evaluation Assumptions / Supuestos Clave de Evaluacion

Todos los activos son evaluados teniendo en cuenta:

1. Que **no se cuenta con controles** para prevenir la falla
2. Que **no se cuenta con planes de contingencia**
3. El equipo se esta operando en **condiciones normales**

> **La pregunta clave para abordar el analisis para cada activo es:**
> *"Cual es el efecto en el sistema o instalacion frente a una falla mayor del activo?"*
> El efecto de falla mas serio (sin que supere la realidad) debe ponerse a consideracion y de ser posible debe ser descrito.

### 7.5 Trabajo con la plantilla / Working with the Template

#### 7.5.1 Campos informativos / Information Fields

Requeridos para la identificacion del equipo, dispositivo o instalacion sobre el que se esta desarrollando el analisis, el cual se puede desarrollar a distintos niveles de la jerarquia operacional del negocio asi:

- **Area**: Subproceso establecido como conjunto de equipos e instalaciones que en conjunto operan bajo un proposito unico establecido, bien sea en el proceso productivo o como soporte de este.

- **Equipo**: Unidad funcional compuesta por sistemas e item mantenibles, que tecnicamente operan para una entrega de una funcion principal bajo ciertos parametros operacionales.

- **Item mantenible**: Conjunto de partes dentro de un equipo que son comunmente mantenidos como un todo y cumplen con una funcion especifica para cumplir la funcion principal del equipo dentro de los parametros establecidos.

- **Funcion principal**: Se refiere a la accion o requerimientos que debe cumplir el nivel en el que se este tomando el analisis (equipo o item mantenible), definido en terminos de desempeno. Por tratarse de un analisis de criticidad y no de un FMECA (Failure Mode, Effects and Criticality Analysis), se considera solamente la funcion principal, toda vez que las funciones secundarias operan en proposito del cumplimiento de la primera.

- **Evento / Falla**: Situacion no deseada que puede ser de tipo externo (evento) o intrinseco de la operacion del equipo (falla), que tras su ocurrencia genera la perdida de la funcion principal descrita. En este sentido se recomienda en el ejercicio del analisis considerar diferentes opciones de evento o falla, con el objetivo de identificar a partir del analisis de sus consecuencias la que represente el impacto mas significativo.

- **Consecuencia de falla / evento**: Describe el efecto inmediato que produce la ocurrencia del evento / falla especificado. Para esto se recomienda considerar lo siguiente:
  - Configuracion operacional del equipo en analisis (operacion unica, configuracion paralela redundancia activa, redundancia stand by)
  - Tipo de operacion del equipo (Continua, por horas/turnos, stand by, estacionaria)
  - Buffer del proceso que retrasan el efecto del evento o falla
  - Equipos o planes de contingencia segun el contexto operacional actual, disenados justamente para activacion en caso de ocurrencia de eventos no previstos.
  - Identificar las consecuencias para las categorias que apliquen, tanto economicas como no economicas.

#### 7.5.2 Campos de analisis / Analysis Fields

- **Probabilidad**: A partir de la informacion establecida en los campos anteriores, se debe establecer la probabilidad de ocurrencia del evento / falla considerado. Cabe aclarar que cada evento/falla maneja una unica probabilidad, dentro de las opciones previamente establecidas en la Matriz.

- **Consecuencias consideradas**: Una vez identificadas previamente las consecuencias del evento/falla analizado, se diligencia en la(s) casilla(s) en la(s) que se haya indicado que tiene afectacion el nivel de impacto que aplique, segun los rangos establecidos previamente en la Matriz.

De los valores diligenciados la plantilla establece la **consecuencia dominante** (Valor mas alto entre los diferentes niveles de impacto considerados) que es ponderado con la probabilidad de ocurrencia para determinar el nivel de criticidad del equipo o item mantenible de la linea de analisis.

De manera complementaria, la **valoracion de riesgo** considera un puntaje entre **0% y 100%** que permite identificar las mayores afectaciones potenciales, aun entre equipos o item mantenibles que se ubiquen dentro de un mismo rango de criticidad.

### 7.6 Informe final / Final Report

Consta de la clasificacion resumen de los hallazgos de criticidad para cada uno de los grupos de activos objeto de estudio y recomendaciones generales fruto de las interacciones durante el analisis. Debe constar de:

- Resumen de clasificacion de criticidad.
- Recomendaciones generales de acuerdo con las conclusiones dadas por el grupo durante los analisis.

---

## 8. Referencias Bibliograficas / Bibliographic References

- NORSOK Z-CR-008, Common requirements Criticality classification method.
- NORSOK Z-008, Criticality analysis for maintenance purposes.
- Institute of Risk Management (IRM), Risk Appetite and Tolerance Guidance Paper.
- Risk Matrix for Operational Risk Assessments -- Corporativo Gold Fields.

---

## 9. Anexo 1 - Ficha tecnica de evaluacion / Appendix 1 - Evaluation Technical Sheet

> **Nota**: El Anexo 1 contiene la ficha tecnica de evaluacion de la criticidad de activos, que es la plantilla/formulario utilizado durante las sesiones de evaluacion. La ficha incluye los campos informativos (Area, Equipo, Item mantenible, Funcion principal, Evento/Falla, Consecuencia) y los campos de analisis (Probabilidad, Consecuencias por factor economico y no economico) que se diligencian para cada activo evaluado.

> **Note**: Appendix 1 contains the technical evaluation sheet for asset criticality, which is the template/form used during evaluation sessions. The sheet includes information fields (Area, Equipment, Maintainable Item, Main Function, Event/Failure, Consequence) and analysis fields (Probability, Consequences by economic and non-economic factor) that are filled in for each evaluated asset.

---

## Quick Reference: Criticality Calculation Formula

```
Criticidad = Probabilidad x Consecuencia_Dominante

Where:
  - Probabilidad = Frequency rating (1-5)
  - Consecuencia_Dominante = MAX(all consequence factor ratings)
  - Each consequence factor is rated 1-5 across 6 aspects:
    Economic: Business Impact, Operational Cost, Operation Interruption
    Non-Economic: Safety & Health, Environment, CSR/Community/Legal

Result ranges:
  - Alto (High):     19-25
  - Moderado (Med):  8-18
  - Bajo (Low):      1-7
```
