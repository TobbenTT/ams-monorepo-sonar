# GFSN Maintenance Management & Improvement Manual - Full Procedure

| Field | Value |
|---|---|
| **Source PDF** | `maintenance-manual--GFSN01-DD-EM-0000-MN-00001-Manual de Mantenimiento-Gold Fields Salares Norte Rev 0 [low].pdf` |
| **Document Code** | GFSN01-DD-EM-0000-MN-00001 |
| **Version** | 0 |
| **Pages** | 104 |
| **Created** | 14/06/2021 |
| **Conversion Date** | 2026-02-23 |
| **Language** | Spanish (original), English section headers added |

## Used By Skills

| Skill | Usage |
|---|---|
| **ALL skills** | Primary governance document for MGFSN maintenance management |
| `assess-criticality` | Criticality analysis methodology (Section 7.4.2) |
| `calculate-priority` | Criticality levels and prioritization framework |
| `perform-rca` | Failure elimination and RCA methodology (Section 7.5.2) |
| `manage-capa` | Defect elimination process and corrective actions |
| `schedule-weekly-program` | Maintenance process map and workflows |
| `group-backlog` | Planning and organizational structure |
| `calculate-planning-kpis` | Performance KPIs (Section 7.6.4) |
| `generate-reports` | KPI formulas and reporting structure |
| `manage-spare-parts` | Spare parts and materials management policies |

## Document Participants

| Role | Name | Position |
|---|---|---|
| Elaborador | Sr. Ernesto Holzmann | Senior Project Engineer |
| Revisor | Sr. Sebastian Gallardo | Gerente de Salud, Seguridad y Medio Ambiente |
| Revisor | Sr. Manuel Diaz | Gerente Legal |
| Revisor | Sr. Richard Lizana | Gerente de Operaciones |
| Aprobador | Sr. Francois Swanepoel | Gerente de Estudios |

---

## Table of Contents

- [1. Introduccion / Introduction](#1-introduccion--introduction)
- [2. Objetivos Generales / General Objectives](#2-objetivos-generales--general-objectives)
  - [2.1 Objetivos Especificos / Specific Objectives](#21-objetivos-especificos--specific-objectives)
- [3. Alcance / Scope](#3-alcance--scope)
- [4. Referencias / References](#4-referencias--references)
- [5. Definiciones / Definitions](#5-definiciones--definitions)
  - [5.2 Relacionadas con Activos / Asset-Related](#52-relacionadas-con-activos--asset-related)
  - [5.3 Relacionadas con Mantenimiento / Maintenance-Related](#53-relacionadas-con-mantenimiento--maintenance-related)
- [6. Politicas / Policies](#6-politicas--policies)
  - [6.1 Politica de Gestion de Activos / Asset Management Policy](#61-politica-de-gestion-de-activos--asset-management-policy)
  - [6.2 Politica de Gestion de Mantenimiento / Maintenance Management Policy](#62-politica-de-gestion-de-mantenimiento--maintenance-management-policy)
- [7. Proceso de Mantenimiento / Maintenance Process](#7-proceso-de-mantenimiento--maintenance-process)
  - [7.1 Entradas al Proceso / Process Inputs](#71-entradas-al-proceso--process-inputs)
  - [7.2 Procesos de Ingenieria de Mantenimiento / Maintenance Engineering Processes](#72-procesos-de-ingenieria-de-mantenimiento--maintenance-engineering-processes)
  - [7.3 Diseno / Design](#73-diseno--design)
    - [7.3.1 FMECA](#731-fmeca---analisis-de-modos-de-falla-efectos-y-criticidad)
    - [7.3.2 FTA - Arbol de Fallas](#732-fta---analisis-arbol-de-fallas)
    - [7.3.3 RAM Modeling](#733-ram---modelamiento-de-confiabilidad-disponibilidad-y-mantenibilidad)
  - [7.4 Operacion y Mantenimiento / O&M](#74-operacion-y-mantenimiento--om)
    - [7.4.1 Jerarquia de Ubicaciones Tecnicas](#741-jerarquia-de-ubicaciones-tecnicas-y-equipos)
    - [7.4.2 Determinacion de Criticidad](#742-determinacion-de-la-criticidad-de-equipos)
    - [7.4.3 RBI - Inspeccion Basada en Riesgo](#743-rbi---analisis-y-desglose-de-mecanismos-de-dano)
    - [7.4.4 RCM - Mantenimiento Centrado en Confiabilidad](#744-rcm---mantenimiento-centrado-en-confiabilidad)
  - [7.5 Mejoramiento / Improvement](#75-mejoramiento--improvement)
    - [7.5.1 OCR - Optimizacion Costo Riesgo](#751-ocr---optimizacion-costo-riesgo)
    - [7.5.2 Eliminacion de Fallas](#752-eliminacion-de-fallas)
    - [7.5.3 Analisis Pareto](#753-analisis-pareto)
    - [7.5.4 Diagrama Jack-Knife](#754-diagrama-jack-knife)
    - [7.5.5 Funciones Estadisticas - Weibull](#755-funciones-de-aplicacion-en-estadistica-del-mantenimiento)
    - [7.5.6 Tecnicas Predictivas](#756-tecnicas-predictivas-aplicables)
    - [7.5.7 LCC - Life-Cycle Costing](#757-lcc---life-cycle-costing)
    - [7.5.8 MoC - Gestion del Cambio](#758-moc---gestion-del-cambio)
  - [7.6 Capacidad de la Organizacion / Organization Capability](#76-capacidad-de-la-organizacion--organization-capability)
    - [7.6.1 Estructura Organizacional](#761-estructura-organizacional-de-mantenimiento)
    - [7.6.2 Responsabilidades](#762-responsabilidades-de-la-gestion-de-mantenimiento)
    - [7.6.3 Interrelacion Funcional](#763-interrelacion-funcional-del-proceso-de-mantenimiento)
    - [7.6.4 Indicadores de Desempeno / KPIs](#764-analisis-del-desempeno-de-la-gestion-de-mantenimiento)

---

## 1. Introduccion / Introduction

Los nuevos desafios, que deben enfrentar los mantenedores de activos fisicos, para aumentar la produccion, reducir el tiempo de inactividad de los equipos, optimizar los costos de manera segura y minimizando los impactos negativos, depende de una perfecta coordinacion de actividades desarrolladas por todas las areas involucradas en cada etapa del ciclo de vida de los activos, siguiendo un enfoque optimo basado en riesgo, buscando siempre alcanzar los objetivos descritos en el plan estrategico de la compania.

Hasta hace un tiempo atras el mantenimiento era visto como una FUNCION que usualmente solo se enfocaba a las actividades o tareas que las personas ejecutaban para retornar los activos a su nivel requerido, esta vision ha evolucionado pasando por la optimizacion del desempeno de los activos, hasta llegar a lo que hoy se conoce como la Gestion de Activos, teniendo en cuenta la aplicacion de actividades coordinadas y sistematicas en cada etapa del ciclo de vida que se basan en el analisis de la informacion de entrada con la cual se establecen las estrategias a seguir para asegurar la maxima disponibilidad e integridad de los activos a traves de una ejecucion eficaz y un seguimiento y control oportuno, todo esto en funcion de las necesidades corporativas y de los recursos disponibles.

> **Imagen 1**: Evolucion de la Gestion de Activos Fisicos

Una buena gestion de mantenimiento y mejoramiento de los activos busca:

- Maximizar el tiempo de funcionamiento de los activos (capacidad productiva)
- Maximizar la efectividad global de los equipos (habilidad de producir lo necesario bajo las especificaciones y niveles de calidad requeridos)
- Minimizar los costos por unidad producida
- Minimizar el riesgo de tener perdidas de produccion
- Prevenir la manifestacion de los riesgos de seguridad sobre las personas
- Asegurar la contencion de los riesgos sobre el medio ambiente

---

## 2. Objetivos Generales / General Objectives

El manual de Gestion de Mantenimiento y Mejoramiento de activos de MGFSN describe los elementos y mejores practicas que conforman la estrategia que la organizacion debe implementar para alcanzar sus objetivos corporativos y mantenimiento ser reconocida como un area de alto desempeno y que estos elementos puedan ser auditados a traves de procesos de diagnosticos y benchmarking.

Este manual se convierte en el elemento mas importante del **SGMM - Sistema de Gestion de Mantenimiento y Mejoramiento** de MGFSN.

Principios del manual:

- Implementar los requerimientos especificos de MGFSN y los lineamientos de las mejores practicas de mantenimiento en la industria
- Utilizar un enfoque basado en confiabilidad y riesgo para seleccionar las tareas optimas de mantenimiento para los equipos
- Maximizar la eficiencia de los equipos para obtener un mayor rendimiento de los activos dentro de los rangos de productividad asociados y los niveles de riesgo establecidos
- Mejorar la eficiencia de las actividades de mantenimiento. El objetivo es asegurar que el tiempo medio de reparacion (MTTR) de los equipos sea lo mas corto posible
- Mejorar las habilidades del personal de mantenimiento, incluyendo habilidades blandas y duras
- Implementar procedimientos claros, sencillos y flexibles
- Utilizar herramientas tecnologicas enfocadas al mejoramiento continuo de los procesos de mantenimiento

### 2.1 Objetivos Especificos / Specific Objectives

- Establecer un vocabulario comun para la Gestion de Mantenimiento y Mejoramiento de activos de MGFSN
- Describir las metodologias y herramientas de trabajo a utilizar
- Describir el Modelo de Gestion de Mantenimiento y Mejoramiento de los Activos Fisicos de MGFSN
- Describir el Modelo de Operacion del Mantenimiento y Mejoramiento
- Describir los subprocesos y actividades que hacen parte del proceso
- Definir los roles y responsabilidades principales

---

## 3. Alcance / Scope

El manual describe los conceptos, el modelo, los procedimientos, los tipos de organizacion, los estandares, los instrumentos, los roles, las responsabilidades, las buenas practicas, y los entregables que se desarrollan en el proceso de Mantenimiento, presentados de forma sistemica.

Describe la Gestion Integral del Proceso de Mantenimiento y Mejoramiento soportada en la gestion estrategica, tactica y de ejecucion, incluyendo el proceso de maduracion reflejado en la cadena de valor, aplicando el **Ciclo de Deming (P-H-V-A)**, la estandarizacion de la documentacion de soporte y su interrelacion con el modulo **SAP-PM**.

---

## 4. Referencias / References

| Standard | Description |
|---|---|
| SAE JA1011:2009 | Criterios de Evaluacion para Procesos de RCM |
| SAE JA1012:2011 | Guia de la norma de RCM |
| ISO 14224:2016 | Collection and exchange of reliability and maintenance data for equipment |
| SAE J 1739:2009 | FMEA in Design and Manufacturing |
| NORSOK Z-008:2011 | Risk based maintenance and consequence classification |
| NORSOK Z-CR-008:2001 | Criticality classification method |
| BSI PAS 55-1:2008 | Especificaciones para la gestion optimizada de activos fisicos |
| BSI PAS 55-2:2008 | Directrices para la aplicacion de PAS55-1 |
| BSI 3811:2011 | Maintenance terminology and definitions |
| PAS99:2006 | Common Management System Requirements |
| EN 13306:2011 | Maintenance terminology |
| NCh-ISO 55000:2014 | Gestion de activos - Aspectos generales, principios y terminologia |
| NCh-ISO 31000:2018 | Principios y Directrices para la Gestion de Riesgos |
| EN 15341:2019 | Maintenance Key Performance Indicators |
| ISO 15663-1:2000 | Life cycle costing - Methodology |
| ISO 20815:2008 | Production assurance and reliability management |
| ISO 9000:2015 | Sistemas de gestion de la calidad |
| ISO GUIA 73:2010 | Risk Management Vocabulary |
| IEC 60050-192:2015 | International Electrotechnical Vocabulary - Dependability |
| GFSN01-DD-EM-0000-PA-00002 | Politica de Gestion de Activos para el proyecto Salares Norte |
| GFSN01-DD-EM-0000-PL-00001 | Strategic Asset Management Plan (SAMP) for Salares Norte Project |

---

## 5. Definiciones / Definitions

### 5.2 Relacionadas con Activos / Asset-Related

- **Activo**: Planta, maquinaria, propiedades, edificios, vehiculos y otros elementos que tengan un valor especifico para la organizacion. Para MGFSN el termino "Activo" se refiere a activos fisicos y sus interfaces con los activos humanos, financieros, intangibles y de informacion.
- **Activos Fijos**: Bienes como terrenos, construcciones, maquinaria, equipos de transporte, oficina, computo y comunicaciones, muebles e inmuebles tangibles.
- **Sistema de Activos**: Conjunto de activos que interactuan y/o estan interrelacionados de forma que puedan proveer una funcion o servicio requerido por el negocio.
- **Portafolio de Activos**: Rango completo de activos y sistemas de activos propiedad de una organizacion.
- **Activos o Sistemas de Activos Criticos**: Activos y/o sistemas de activos identificados por tener el mayor potencial para impactar en el logro del plan estrategico organizacional.

### 5.3 Relacionadas con Mantenimiento / Maintenance-Related

- **Administracion del Mantenimiento**: Conjunto de actividades orientadas al direccionamiento, control y seguimiento, evaluacion y mejora continua de la gestion de mantenimiento.
- **Administracion del Riesgo**: Actividad de soportar el proceso de toma de decisiones evaluando la probabilidad de ocurrencia de eventos especificos y las consecuencias asociadas.
- **Aviso en SAP-PM**: Documento de soporte que relaciona los hechos de un evento generado al tener una condicion sub-estandar de un equipo.
- **Causa de falla**: Circunstancias asociadas con el diseno, manufactura, instalacion, uso y mantenimiento que hayan conducido a una falla.
- **Catalogos**: Usados en SAP-PM para definir en forma uniforme averias, sintomas, causas, soluciones.
- **CMMS**: Computerized Maintenance Management System. Para MGFSN es SAP-PM.
- **Confiabilidad**: Probabilidad de funcionamiento libre de fallas de un equipo por un tiempo definido bajo un contexto operacional determinado.
- **Confiabilidad Integral**: Proceso de mejora continua que incorpora herramientas para el manejo probabilistico de informacion y metodologias basadas en confiabilidad.
- **Consecuencia**: Resultado de un evento valorando impacto en seguridad, higiene, ambiente, produccion, costos de reparacion, reputacion.
- **Corrosion**: Degradacion de un material metalico a causa de la relacion con un medio o agente corrosivo.
- **Criticidad**: Caso particular del analisis de riesgo, usado para reconocer el riesgo inherente de un activo fisico dentro de un contexto operacional.
- **Disponibilidad**: Capacidad de estar en un estado que permita el desempeno requerido [IEC 60050-192:2015].
- **Falla**: Perdida de la capacidad de un sistema, estructura o componente para realizar su funcion especifica.
- **Inspeccion Basada en Riesgo (RBI)**: Metodologia de analisis que estima el riesgo asociado a la operacion de equipos estaticos y evalua la efectividad del plan de inspeccion.
- **Integridad Mecanica (IM)**: Filosofia de trabajo que tiene por objeto garantizar que todo equipo sea disenado, operado, inspeccionado, mantenido y/o reemplazado oportunamente.
- **Mantenibilidad**: Probabilidad de que un activo sea conservado o reparado satisfactoriamente bajo condiciones especificas [ISO 20815:2010].
- **Mantenimiento Basado en Condicion**: Accion de mantenimiento preventivo como resultado de una condicion probable de falla identificada a traves de monitoreo [BS 3811:2011].
- **Mantenimiento Correctivo**: Accion de mantenimiento llevada a cabo despues de ocurrida una falla [BS 3811:2011].
- **Mantenimiento Mayor**: Accion de mantenimiento preventivo durante un tiempo prolongado, intentando devolver el activo a un estado de desempeno optimo.
- **Mantenimiento Preventivo**: Accion de mantenimiento en intervalos predeterminados intentando reducir la probabilidad de falla [BS 3811:2011].
- **Modo de Falla**: Manera en que se produce la incapacidad de un elemento para realizar una funcion requerida [EN 13306:2011].
- **Overhaul**: Intervencion mayor sobre un equipo con la finalidad de extender su vida util.
- **Plan de mantenimiento**: Conjunto estructurado y documentado de tareas [EN 13306:2011].
- **RCA**: Root Cause Analysis - Analisis de Causa Raiz.
- **SMART**: Specific, Measurable, Achieveable, Realistic, Time Related.

---

## 6. Politicas / Policies

### 6.1 Politica de Gestion de Activos / Asset Management Policy

El equipo de Direccion de Salares Norte esta plenamente comprometido con la gestion eficaz de las capacidades de gestion de activos de la operacion minera. Esta politica proporciona el marco general para guiar la gestion sostenible del portafolio de activos fisicos.

Principios clave:

- Los activos fisicos se gestionaran utilizando un enfoque de "ciclo de vida" y de acuerdo con las tecnicas de gestion de activos reconocidas como "mejores practicas"
- Los activos se mantendran para asegurar que sigan funcionando de manera optima durante toda su vida
- Los activos seran utilizados en todo su potencial para maximizar la utilizacion y el rendimiento economico
- Se cumpliran todos los requisitos legales y reglamentarios aplicables
- Se pondran a disposicion los recursos apropiados para las actividades de gestion de activos, mantenimiento y confiabilidad
- Se brindara la capacitacion adecuada para asegurar que los empleados tengan las habilidades correctas
- La Compania seguira supervisando, auditando y revisando su portafolio de activos
- La financiacion de toda adquisicion, mantenimiento y sustitucion se guiara por los planes de gestion de activos (tanto OPEX como capital de mantenimiento)

### 6.2 Politica de Gestion de Mantenimiento / Maintenance Management Policy

El equipo responsable de la gestion de mantenimiento se compromete a definir, implementar y mejorar de manera continua, lineamientos, practicas, roles y responsabilidades para la correcta administracion y control del proceso de mantenimiento y mejoramiento de los activos fisicos.

La gestion estara enmarcada en:

- Intervenir tempranamente en los disenos de los activos e instalaciones nuevas
- Definir los criterios de la matriz de criticidad de activos de acuerdo con los objetivos corporativos
- Establecer los objetivos y metas de integridad, disponibilidad y costos
- Disenar estrategias, tecnicas y planes de mantenimiento tomando en cuenta la gestion optima del suministro de materiales
- Aplicar sistematicamente la metodologia de eliminacion de defectos
- Usar eficientemente el sistema de informacion SAP-PM
- Captar y retener el adecuado talento humano
- Aplicar la gestion del control del cambio en los procesos de mantenimiento
- Hacer extensiva la aplicacion de esta politica a instalaciones operadas por terceros
- Divulgar esta politica a todo el personal

---

## 7. Proceso de Mantenimiento / Maintenance Process

Los procesos intrinsecos de mantenimiento son ciclicos regidos por la filosofia de mejora continua basada en el ciclo de Deming: **Planear-Hacer-Verificar-Actuar (P-H-V-A)** y se estructuran con base en unas entradas definidas en el SAMP Plan Estrategico de Gestion de Activos, politicas corporativas y requerimientos de partes interesadas (stakeholders).

Los niveles funcionales que soportan los procesos son: **estrategicos, tacticos y operativos**.

Elementos del diagrama de valor:

- **Entradas**: Lineamientos corporativos (necesidades de partes interesadas, objetivos de desarrollo sostenible, variables del entorno, SGA politica/SAMP)
- **Desarrollo de los procesos de mantenimiento**
- **Salidas**: OEE, MUC, Indicadores HSE, Indicadores de resultado (confiabilidad, mantenibilidad, disponibilidad, planificacion, programacion, ejecucion, gestion de repuestos, gestion de eventos no deseados, gestion de reparables)

### 7.1 Entradas al Proceso / Process Inputs

> **Imagen 2**: Mapa de Procesos de la gestion de mantenimiento MGFSN

#### 7.2.1 Necesidades y expectativas de partes interesadas, variables del entorno y normatividad aplicable

La superintendencia de mantenimiento debera mantener actualizadas las expectativas de partes interesadas (MGFSN, accionistas, financistas, empresas colaboradoras, proveedores, comunidad, entidades gubernamentales) y las variables del entorno.

Metodologias utilizadas:

**PESTA** (Politico-legal, Economico, Social, Tecnologico y Ambiental): Herramienta para entender el panorama general del entorno. El analisis PESTA es la entrada de la situacion externa (oportunidades y amenazas) en la herramienta FODA.

**FODA** (Fortalezas, Oportunidades, Debilidades y Amenazas): Herramienta que permite conformar un cuadro de la situacion actual de la empresa para tomar decisiones.

**CAME** (Corregir, Afrontar, Mantener y Explotar): Define acciones como respuesta a los resultados del FODA:
- Aprovechar las oportunidades para Corregir las debilidades
- Afrontar las amenazas no dejando crecer las debilidades
- Mantener las fortalezas afrontando las amenazas del entorno
- Explotar las fortalezas aprovechando las oportunidades del entorno

#### 7.2.2 Objetivos de desarrollo sostenible MGFSN, politicas corporativas y SAMP

Tres tipos de entradas que delimitan el alcance:
1. Politicas corporativas
2. Objetivos estrategicos MGFSN
3. Plan Estrategico de Gestion de Activos - SAMP

### 7.2 Procesos de Ingenieria de Mantenimiento / Maintenance Engineering Processes

Las metodologias descritas se desarrollan siguiendo la secuencia logica del ciclo de vida generico de los activos.

> **Imagen 5**: Secuencia generica del ciclo de vida de los activos

---

### 7.3 Diseno / Design

#### 7.3.1 FMECA - Analisis de Modos de Falla, Efectos y Criticidad

El metodo FMECA es empleado para el analisis de confiabilidad en equipos, con la finalidad de identificar las fallas y las consecuencias que pueden causar o afectar el funcionamiento de un sistema.

**Propositos del FMECA:**
- Identificar las fallas que pueden causar efectos sobre seguridad de personas, ambiente o activos
- Cumplir con la normativa vigente
- Cuantificar y mejorar la confiabilidad, disponibilidad y seguridad del sistema
- Mejorar la mantenibilidad de los sistemas
- Identificar el riesgo y las funciones que debe gestionar mantenimiento

**Objetivos:**
- Identificar y evaluar todos los efectos no deseados dentro los limites definidos del sistema
- Determinar la importancia de cada modo de falla respecto al funcionamiento y seguridad
- Clasificar los modos de falla de acuerdo con las caracteristicas pertinentes
- Estimar el nivel de importancia de la probabilidad de falla

**Principios Basicos:**
El analisis exige el registro de: modos de falla, causas y consecuencias; y los medios de prevencion.

Informacion requerida:
- Tener claridad de lo requerido desde la perspectiva del activo
- Necesidades de Mantenibilidad, Confiabilidad, Disponibilidad y Operatividad
- Diagramas y planos de la instalacion
- Desglose de los elementos del sistema
- Manuales de operacion y mantenimiento
- Hojas de datos y curvas de operacion
- Criticidad y su referencia de calculo

En etapa de O&M adicional:
- Historial de fallas, mantenimiento y cambios
- Historial de operacion
- Reportes de inspeccion no destructiva y predictivo
- Analisis de aceites, gases y fluidos

**Procedimiento FMECA (4 etapas):**
1. Definir la preparacion del sistema (diseno, funcionalidad, operatividad, mantenimiento, medio ambiente)
2. Establecer los principios basicos de funcionamiento, efectos, forma de manifestarse y consecuencias
3. Realizar talleres en hojas de calculo disenadas
4. Presentar resultados del analisis, conclusiones y recomendaciones

> **Imagen 6**: Diagrama de flujo FMECA

**Informacion minima del formato:**
- Nombre del equipo/elemento
- Funcion que realiza
- Numero de identificacion
- Modos de falla
- Causas de la falla
- Efectos de la falla sobre el sistema
- Metodos de deteccion
- Provisiones de compensacion
- Severidad de los efectos
- Observaciones

**Resultado del Analisis FMECA:**

Tres pasos en la decision para planes de mantenimiento (norma SAE-JA-1012):
1. Determinacion de las categorias de consecuencias que aplican al modo de falla
2. Evaluacion de la factibilidad tecnica de las posibles politicas de manejo de falla
3. Seleccion de la politica de manejo de falla que satisfaga el criterio de factibilidad tecnica

#### 7.3.2 FTA - Analisis Arbol de Fallas

El FTA fue desarrollado para la identificacion y analisis de las condiciones y factores que causan o tienen el potencial de causar la ocurrencia de un evento negativo.

**Consideraciones generales:**
- Los FTA utilizan eventos o estados para describir la interaccion entre eventos iniciales y el evento final
- Utilizan compuertas logicas que ligan los eventos al resultado final
- Los estados pueden ser caracterizados por probabilidad de ocurrencia en un tiempo t dado

**Estructura de los FTA:**

**Compuertas:**

| Simbolo | Descripcion |
|---|---|
| Puerta Y (AND) | Todos los eventos de entrada deben estar presentes para que ocurra el evento de resultado |
| Puerta O (OR) | Cualquier evento de entrada llevara al evento de resultado |

**Eventos:**

| Simbolo | Descripcion |
|---|---|
| Rectangulo | Principal componente basico - representa el evento negativo, unico simbolo con puerta logica debajo |
| Circulo | Evento base en los niveles inferiores del arbol, no requiere mas desarrollo |
| Diamante | Evento terminal sin desarrollar debido a falta de informacion o significancia |
| Ovalo | Situacion especial que ocurre solo si ocurren ciertas circunstancias |
| Triangulo | Transferencia de una rama del arbol de fallas a otro lugar del arbol |

**Pasos del FTA:**
1. Definir el evento superior (identificar tipo de falla a analizar)
2. Conocer el sistema (analizar toda la informacion disponible)
3. Construir el arbol (usando simbolos de eventos de forma logica)
4. Validar el arbol (presentacion a juicio de expertos)
5. Evaluar el arbol (identificar areas de mejora)
6. Considerar cambios constructivos
7. Considerar alternativas, recomendaciones y medidas

#### 7.3.3 RAM - Modelamiento de Confiabilidad, Disponibilidad y Mantenibilidad

El Modelamiento RAM es una tecnica utilizada para simular diferentes escenarios de operacion y mantenimiento mediante herramientas computarizadas.

**Escenarios por fase de proyecto:**

| Fase | Escenarios |
|---|---|
| Ingenieria Conceptual | Topologia y Configuracion de Proceso; Tasas de fallas y reparacion estimadas; Estrategia de Mantenimiento y Operacion asumidos |
| Ingenieria Basica | Arreglo de la Planta; Capacidad de Equipos y Sistemas |
| Ingenieria Detallada | Definicion de equipos y componentes; Plan de Mantenimiento detallado; Seleccion de Proveedores |
| Comisionamiento, Puesta en Marcha y Operacion | Estrategia de Operacion y Mantenimiento; Capacidad Instalada; Cuellos de Botella |

**Aplicaciones comunes:**
- Optimizacion de estrategias de operacion y mantenimiento
- Optimizacion de niveles de inventarios
- Pronostico de indicadores de Confiabilidad y Disponibilidad
- Estimacion de probabilidad de eventos de falla
- Reporte de malos actores e indicadores claves de desempeno
- Analisis del costo del ciclo de vida (LCC)
- Eliminacion de cuellos de botella

**Metodologia:**
1. Recoleccion y preparacion de la informacion
2. Construccion y validacion del modelo de confiabilidad (Diagramas de Bloques RBD o Arboles de Falla)
3. Ejecucion de analisis preliminar y ajustes
4. Ejecucion de analisis de escenarios y sensibilidades
5. Conclusiones, recomendaciones y reporte final

**Simulacion Monte Carlo:** Sintetiza el desempeno del sistema sobre un numero dado de iteraciones, emulando el comportamiento real del sistema basado en informacion de entrada.

**Entregables del reporte final:**
- Diagramas de Bloques de Confiabilidad
- Modelo RAM
- Base de datos con informacion tecnica, operacional y de confiabilidad
- Perfil estocastico de disponibilidad y produccion en riesgo
- Lista jerarquizada de equipos criticos
- Recomendaciones tecnicas para mitigar el riesgo

---

### 7.4 Operacion y Mantenimiento / O&M

#### 7.4.1 Jerarquia de Ubicaciones Tecnicas y Equipos

Una ubicacion tecnica es una estructura jerarquica de desglose de activos organizada segun criterios funcionales, relacionados con el proceso o ubicacion espacial.

**Funciones:**
- Representar ubicaciones tecnicas y equipos significativos para la gestion de mantenimiento
- Permitir la estructuracion de datos maestros en SAP-PM
- Permitir notificar los modos de falla que requieren intervencion
- Almacenamiento de datos tecnicos durante periodos prolongados
- Suministrar informacion para elaboracion de presupuestos

**Estructura jerarquica (ISO 14224:2016):**

```
Nivel 1: Planta
Nivel 2: Area
Nivel 3: Subarea
Nivel 4: Sistema
Nivel 5: Unidad funcional
  -- Equipo padre
  -- Equipo hijo
```

> **Imagen 12**: Jerarquia de ubicaciones tecnicas y equipos MGFSN

La mascara de estructura para ubicaciones tecnicas esta compuesta por 28 caracteres alfanumericos y separadores.

**Estructura de jerarquia de equipos (ISO 14224:2016):**
- Categoria de equipo (clase objeto)
- Tipo de equipo (tipo de objeto)
- Equipo
- Parte

**Catalogos en SAP-PM:**
Se asigna un perfil catalogo para cada equipo con el objetivo de facilitar el analisis estadistico del comportamiento: sintomas de falla, causas de falla y partes averiadas.

#### 7.4.2 Determinacion de la Criticidad de Equipos

El analisis de criticidad es una metodologia que permite evaluar el riesgo inherente de sistemas, instalaciones y equipos dentro de su contexto operacional, clasificando los activos fisicos con diferentes niveles de "importancia".

**La evaluacion de criticidad permite:**
- Priorizar ordenes de trabajo
- Seleccionar una politica de manejo de repuestos y materiales
- Priorizar proyectos de inversion
- Dirigir las politicas de mantenimiento hacia las areas mas criticas
- Planificar paradas de planta
- Planificar rutinas y planes de mantenimiento predictivo

**Entradas:**
- Documentacion tecnica de los activos
- Criterios de clasificacion de consecuencias de falla
- Criterios de clasificacion de frecuencias de falla
- Taxonomia de sistemas de activos
- Diagramas de confiabilidad (de existir)
- Matrices de riesgo de Gold Fields
- Diagramas P&ID y PFD

**Salidas:**
- Criterios de evaluacion de criticidad definidos
- Listado de equipos evaluados segun su criticidad
- Recomendaciones generales para control de riesgo inherente

**Marco de referencia:**
Norma Norzok Z-008, Z-CR-008, Instituto de Gestion de Riesgos (IRM) y Matriz de Riesgos para Evaluaciones de Riesgo Operacional Corporativo - Gold Fields.

**Formula de criticidad:**
> Criticidad = Exposicion (frecuencia) x Consecuencia

Aspectos de consecuencia: Impacto economico, Costo operacional, Interrupcion de la operacion, Seguridad y Salud, Medio Ambiente, RSC (Comunidad/Imagen/Cumplimiento legal).

**Flujo del proceso de evaluacion de criticidad:**

```
1. Definicion de los activos a evaluar
2. Definicion de criterios de evaluacion de consecuencias de falla
3. Definicion de criterios de evaluacion de probabilidad de falla
4. Recoleccion de la documentacion tecnica
5. Alistamiento de la ficha tecnica de evaluacion
6. Definicion del contexto operacional de las unidades funcionales
7. Evaluar la criticidad
8. Jerarquizar los activos de acuerdo con la criticidad
9. Informe final del analisis de criticidad de activos
```

> **Imagen 14**: Diagrama de flujo del proceso de evaluacion de criticidad de activos

#### 7.4.3 RBI - Analisis y Desglose de Mecanismos de Dano

La metodologia RBI hace parte de un proceso mayor conocido como Pipeline Integrity Management System - PIMS o Sistema de Integridad Mecanica - SIM.

**El Sistema de Integridad Mecanica se basa en:**
- Desglose del mecanismo de danos
- Variables criticas del proceso
- Estrategias de inspeccion
- Analisis RBI
- Plan de inspeccion
- Estructura del monitoreo de espesor
- Estructura de la gestion de inspecciones
- Programa de control de corrosion
- Seguimiento de las recomendaciones
- Integridad de los KPI

**Principios del RBI:**
Cada unidad de proceso se desglosa en lazos o circuitos de corrosion (Corrosion Loops) a partir del analisis de susceptibilidad del mecanismo de dano. Las probabilidades y consecuencias se modelan sobre un deterioro especifico para determinar el nivel de criticidad y las estrategias de inspeccion (NDT, frecuencia y cobertura).

**Etapas del estudio RBI:**

1. **Levantamiento de informacion**: P&IDs, PFDs, Piping Class, Date Sheets, Filosofia de Operacion, Planos de Distribucion, Especificacion de Recubrimientos/Aislamientos, Historial de Inspeccion/falla/reemplazo, Datos de produccion, Estudios de Corrosion
2. **Validacion de informacion en campo**: Verificar actualizacion de informacion, inspeccionar recubrimiento y aislamiento
3. **Definicion de inventario**: A partir de P&IDs y PFDs, asignar tag unico a cada componente
4. **Taller multidisciplinario de socializacion**: Definir circuitos de corrosion, mecanismos de dano, velocidades de corrosion

**Roles y Responsabilidades para talleres RBI:**

| Rol | Responsabilidades |
|---|---|
| Facilitador | Orientar sobre informacion requerida, dirigir el taller, validar informacion, realizar corrida del modelo RBI |
| Ingeniero de Corrosion | Recopilar informacion de mecanismos de degradacion, analizar planes de control |
| Ingeniero de Procesos | Participar en definicion de grupos de inventario, socializar el proceso |
| Ingeniero de Inspeccion/Integridad | Recopilar historicos de inspeccion y fallas, velocidades de corrosion |
| Operador/Supervisor | Disponer informacion sobre historico de equipos y fallas operacionales |
| Ingeniero de Planificacion | Estimacion de costos, tiempos y recursos; seguimiento del plan de inspeccion |

**Factores de dano (API 581 - 7 categorias, 21 factores):**
1. Adelgazamiento (Thinning)
2. Dano en recubrimientos internos (Component Linings)
3. Dano externo (External Damage)
4. Stress Corrosion Cracking
5. Ataque por Hidrogeno a alta temperatura (HTHA)
6. Fatiga mecanica (Mechanical fatigue)
7. Fractura fragil (Brittle fracture)

**Ventajas del RBI:**
- Entendimiento de los riesgos presentes y prediccion de la probabilidad de falla
- Reduccion del nivel de riesgo
- Revision integrada del impacto sobre seguridad, medio ambiente y negocio
- Optimizacion de recursos de mantenimiento e inspeccion
- Reduccion de tiempos de parada de planta

**Limitaciones del RBI:**
- Precision depende de la calidad de informacion disponible
- Componentes con mecanismos de dano no identificados
- Limitaciones fundamentales del metodo de inspeccion
- Falta de informacion, disenos inadecuados, operacion fuera de limites aceptables

#### 7.4.4 RCM - Mantenimiento Centrado en Confiabilidad

El RCM es una metodologia para desarrollar planes de mantenimiento de equipos a traves de una revision sistematica de las posibles fallas.

**Ventajas del RCM:**
- Mayor Seguridad e Integridad Ambiental
- Desempeno operativo optimizado
- Mejor relacion costo-efectividad (reduccion 40-70% del trabajo de rutina)
- Mayor vida util en equipos de costos elevados
- Un banco de datos comprensible

**Roles y Responsabilidades RCM:**

1. **Facilitador RCM**: Profesional con amplios conocimientos en RCM. Preparar informacion, revisar jerarquia funcional, moderar el taller, registrar informacion, generar resultados.
2. **Soporte Operacional**: Persona con amplio conocimiento en la operacion de los activos.
3. **Tecnicos especialistas**: Personal con amplio conocimiento en las diferentes disciplinas de mantenibilidad.
4. **Key User SAP-PM**: Responsable de crear, administrar e implementar el nuevo plan de mantenimiento en SAP-PM.
5. **Soporte HSE**: Personal con conocimiento en manejo del riesgo operacional.

**Flujo de proceso RCM:**

```
1. Analisis de Criticidad de Equipos
2. Identificar Equipos Criticos
3. Ordenar Equipos por Nivel de Importancia
4. Definir objetivos del analisis RCM
5. Definir PDT Analisis RCM
6. Definir y asignar recursos para Talleres
7. Iniciar analisis RCM:
   a. Identificar los Limites del Analisis
   b. Definir el Contexto Operativo
   c. Identificar datos tecnicos y requerimientos normativos
   d. Definir diagrama EPS
   e. Definir las Funciones
   f. Definir las Fallas Funcionales
   g. Definir Modos de Falla
   h. Definir y evaluar Riesgo No Mitigado
   i. Usar arbol logico de fallas para determinar estrategias
   j. Proponer recomendaciones y Evaluar Riesgo Mitigado
8. Gestion e Implementacion del Analisis RCM
```

**Las 7 preguntas clave del RCM:**
1. Cuales son las funciones y estandares de funcionamiento del equipo?
2. De que maneras puede fallar el equipo al cumplir sus funciones? (fallas funcionales)
3. Cual es la causa de falla que genera la falla funcional? (modos de falla)
4. Que sucede cuando ocurre cada falla? (efectos de falla)
5. Cual es el impacto de cada falla? (consecuencias)
6. Que puede hacerse para prevenir o predecir cada falla? (tareas de mantenimiento)
7. Que hacer si no se encuentra una tarea aplicable? (acciones por defecto)

**Resultados del RCM - Informe final debe contener:**
- Alcance del analisis
- Tareas de mantenimiento derivadas (tipo, frecuencia, duracion)
- Recursos de las tareas (repuestos, consumibles, mano de obra, herramientas)
- Costos de las tareas
- Tareas por defecto (redisenos y/o cambios operacionales)
- Recomendaciones

**Carga en SAP-PM:**
El resultado obtenido debe ser cargado al modulo SAP-PM para asegurar su inclusion en el proceso de planificacion del mantenimiento.

---

### 7.5 Mejoramiento / Improvement

#### 7.5.1 OCR - Optimizacion Costo Riesgo

La metodologia OCR identifica soluciones optimas para reparar o reemplazar activos manteniendo un perfil aceptable de riesgo y balanceando multiples restricciones.

**Modelo de 3 curvas:**

1. **Curva del nivel de riesgo de falla**: `Riesgo(t) = probabilidad de falla(t) x consecuencia(t)`
   - Probabilidad de falla depende de MTBF (reparable) o MTTF (no reparable)
2. **Curva de acciones preventivas**: Simulacion de costos de diferentes frecuencias
3. **Curva de impacto total**: Suma de curva de riesgos + curva de costos. El minimo = frecuencia optima

> **Imagen 19**: Analisis OCR

**Flujo de proceso OCR:**

> **Imagen 20**: Flujograma del proceso OCR

**Aplicaciones OCR:**
- Estrategia optima de mantenimiento (Run To Failure, PM, MonCon)
- Intervalo optimo de mantenimiento preventivo
- Intervalo optimo de inspeccion y pruebas
- Tiempo optimo de reemplazo de activos
- Cambios, Modificaciones o Actualizaciones
- Agrupamiento de trabajos e Intervalo optimo de Shutdowns
- Estrategias optimas de inventario y compras

#### 7.5.2 Eliminacion de Fallas

El proceso de Eliminacion de Defectos o Fallas incluye la metodologia para la gestion de investigacion de eventos no deseados e incidentes dentro de la gestion de mantenimiento en MGFSN.

**Informacion de entrada al proceso de RCA:**
- Incidentes de alta gravedad que afecten seguridad, medio ambiente o operacion
- Tendencias de indicadores con comportamientos indeseados
- Analisis acumulativo de incidentes (analisis de Pareto)
- Recomendaciones de analisis de grupos de interes

**Metodologia RCA Causa-Efecto:**
Metodo estructurado para la solucion efectiva de problemas donde se evalua toda la cadena de hechos, acciones y condiciones que generan un problema hasta identificar sus causas raiz.

**Condiciones generales:**
- Todo evento debe ser reportado usando el formato de antecedentes preliminares
- El evento se clasifica segun la matriz de determinacion de riesgos
- Se crea el equipo investigador incluyendo facilitador y responsable del analisis

> **Imagen 21**: Flujograma del Proceso de Eliminacion de Fallas
> **Imagen 22**: Flujo de la metodologia RCA Causa-Efecto

#### 7.5.3 Analisis Pareto

El principio de Pareto dice que el 20% de las causas (vitales) producira el 80% de los efectos, mientras que el 80% de las causas (triviales) solo producira el 20% de los efectos.

**Cuando se utiliza:**
- Cuando existe la necesidad de llamar la atencion a los problemas de forma sistematica
- Al identificar oportunidades para mejorar
- Al buscar las causas principales y establecer la prioridad de las soluciones
- Al evaluar los resultados de cambios efectuados a un proceso (antes y despues)
- Cuando los datos puedan clasificarse en categorias

**Beneficios:**
- Es el primer paso para la realizacion de mejoras
- Canaliza los esfuerzos hacia los "pocos vitales"
- Ayuda a priorizar y senalar la importancia de cada area de oportunidad
- Permite la comparacion entre antes y despues
- Promueve el trabajo en equipo

**Los 6 pasos del Pareto:**

1. **Preparacion de los datos**: Recoger datos correctos. Se necesita un efecto cuantificado y medible sobre el que se quiere priorizar:
   - Cualquier perdida que interrumpa la produccion
   - Perdida de disponibilidad del activo
   - Desviacion del nivel de operacion aceptable
   - Costo de mantenimiento por encima de umbral definido
   - Salida repetida del equipo en 6 meses
   - Cualquier equipo que opere a <90% de eficiencia del diseno
2. **Calculo de las contribuciones parciales y totales**: Ordenar elementos de mayor a menor
3. **Calcular el porcentaje y porcentaje acumulado**: `% = (magnitud contribucion / magnitud efecto total) x 100`
4. **Trazar y rotular los ejes del diagrama**
5. **Dibujar un Grafico de Barras** que representa el efecto de cada elemento
6. **Trazar un Grafico Lineal** con porcentaje acumulado

**Informe Pareto debe incluir:**
- Explicacion de la tecnica de analisis
- Definicion de la falla utilizada
- Diagrama de flujo del proceso
- Hoja de calculo o resultados graficos que identifican las "pocas fallas criticas"
- Recomendaciones para seguimiento con proceso RCA
- Lista de los participantes

#### 7.5.4 Diagrama Jack-Knife

Metodo para analizar el tiempo de inactividad o indisponibilidad de equipos usando diagramas de dispersion. Preserva el esquema de clasificacion de Pareto y aporta contenidos adicionales de frecuencias de fallas y tiempo medio de reparacion.

**Metodologia:**
- Eje X: Numero de intervenciones (frecuencia de falla)
- Eje Y: Tiempo medio de reparacion (MTTR)
- Una recta dependiente negativa unitaria = puntos con igual tiempo total no operativo

**Clasificacion en 4 cuadrantes:**

| Zona | Descripcion | Impacto |
|---|---|---|
| **Normal** | Pocas paradas y duraciones cortas | Menor importancia |
| **Agudo** | Tiempo de paradas extenso | Mantenibilidad ineficiente |
| **Cronico** | Frecuente paradas de misma razon | Confiabilidad baja |
| **Agudo-Cronico** | Ineficiencia de mantenibilidad + reduccion de confiabilidad | Indisponibilidad |

**Beneficios:**
- Conocer la proporcion de frecuencia y MTTR por categoria
- Identificar fallas cronicas con elevada frecuencia y costos indirectos
- Comparar en un mismo grafico el desempeno de distintos componentes, equipos, flotas o periodos de tiempo

#### 7.5.5 Funciones de Aplicacion en Estadistica del Mantenimiento

**Funciones estadisticas de uso corriente:**
- f(t): Funcion de densidad de probabilidad de fallo
- F(t): Funcion de probabilidad de fallo acumulada
- R(t): Funcion de fiabilidad o tasa de supervivencia
- h(t): Funcion tasa de fallos o tasa de fallo local

**Modelos de ajuste:**

| Funcion | Normal | Exponencial | Poisson | Weibull |
|---|---|---|---|---|
| Densidad de fallas f(t) | -- | lambda * e^(-lambda*t) | -- | -- |
| Confiabilidad R(t) | -- | e^(-lambda*t) | -- | -- |
| Tasa de fallas h(t) | -- | lambda | -- | -- |
| MTBF | mu | 1/lambda | Media: lambda | -- |

**La Distribucion de Weibull:**

Funcion de estadistica multiple, cambio facil, asimetrica, con diferentes valores para la media y la mediana.

Parametros de la distribucion de tres parametros:
- **beta (forma/geometrico)**: beta > 0
- **theta (escala/valor caracteristico)**: theta > T0
- **T0 (localizacion/valor garantizado)**: T0 >= 0

**Ecuacion de confiabilidad (Weibull 3 parametros):**
```
R(t) = exp[-((t - T0) / eta)^beta]
```

Donde eta = theta - T0

**Formula MTBF:**
```
MTBF = T0 + eta * Gamma(1 + 1/beta)
```

**Mediana:**
```
t_mediana = T0 + eta * (ln(2))^(1/beta)
```

**Interpretacion del parametro beta:**

| Valor beta | Interpretacion | Accion |
|---|---|---|
| beta < 1.0 | Rata de fallas tempranas (mortalidad infantil) - mala calidad de repuestos o mano de obra | Elevar beta a 1.0, decrecer rata de fallas |
| beta ~= 1.0 | Rata de fallas constante - no se pueden hacer predicciones en funcion del tiempo | Optimizar inspeccion y monitoreo de condicion, practicas de precision |
| beta > 1.0 | Dependencia del tiempo - modo de falla dominante | Identificar factores que desencadenan la falla. Si beta > 5.0 puede justificarse mantenimiento basado en tiempo |

#### 7.5.6 Tecnicas Predictivas Aplicables

##### 7.5.6.1 Analisis de Vibraciones

Todos los equipos generan vibraciones como parte normal de su actividad. Cuando falla algun componente, las caracteristicas cambian. Tres medidas de amplitud: desplazamiento, velocidad y aceleracion.

**Sistema de analisis de vibraciones:**
- Recolector de senales (transductor)
- Analizador de senales
- Software para el analisis

**Responsable:** Mantenedor Sintomatico - garantiza datos confiables y analisis espectral.

**Puntos de medicion:** Lo mas cerca posible de los cojinetes, dentro de la zona de carga. Mediciones en direccion horizontal (H), vertical (V) y axial (A).

**Convencion de puntos:** Numerar empezando del cojinete exterior del motor al cojinete exterior de la maquina impulsada.

**Estandares de severidad vibratoria:**
- ISO 10816-21:2015
- ISO 13372:2012
- ISO 13374-4:2015
- ISO 13379-2:2015
- ISO 13380:2002
- ISO 13381-1:2015
- ISO 17359:2018

##### 7.5.6.2 Ultrasonido

Ondas a frecuencias >20 kHz. Metodo mas comun para medir espesores, detectar grietas y discontinuidades en materiales gruesos.

**Principio de medicion de espesores:**
```
e = (v * t) / 2
```
Donde: e = espesor, v = velocidad del sonido en el material, t = tiempo de transmision ida/vuelta.

**Componentes:**
- Palpador (transductor): Convierte energia electrica en mecanica via efecto piezoelectrico
- Acoplador: Liquido viscoso (agua, aceite, grasa, glicerina, vaselina) para transmision de ondas

##### 7.5.6.3 Termografia Infrarroja

Tecnica que mide la energia infrarroja irradiada de la superficie de un equipo y la convierte en medida de temperatura, usando camaras de forma remota y sin contacto.

**Aplicaciones:**
- **Instalaciones de alta tension**: Oxidacion de interruptores, conexiones recalentadas, defectos de aislamiento
- **Instalaciones de baja tension**: Conexiones de alta resistencia, danos internos en fusibles/disyuntores
- **Instalaciones mecanicas**: Problemas de lubricacion, errores de alineacion, motores recalentados, rodamientos calientes
- **Tuberias**: Fugas en bombas/tuberias/valvulas, averias del aislamiento, obstrucciones

##### 7.5.6.4 Analisis de Aceite

Tipos de analisis:
- Examen visual
- Analisis de Viscosidad (ISO a 40C)
- Analisis de indice de acidez T.A.N. (ASTM D664)
- Analisis de alcalinidad T.B.N. (ASTM D664)
- Analisis de espectro metalografias (particulas <10 micras)
- Espectrometria de Emision I.C.P. (aditivos, metales de desgaste, contaminantes)

##### 7.5.6.5 Analisis de Gases Disueltos

Prueba mas importante en aceites de transformadores. Gases tipicos: H2, O2, N2, CH4, CO, C2H6, CO2, C2H4, C2H2.

##### 7.5.6.6 Monitoreo de Condicion para Motores Electricos de Induccion

**6 zonas de posible falla:**

1. **Calidad de la tension de linea**: Desequilibrio de tension no debe superar 5% (NEMA MG-1 seccion 14.36)
2. **Circuito de fuerza**: Desde CCM hasta bornera del motor. Normas: IEEE 1159-1995, IEEE Std 519-2014
3. **Aislamiento**: Pruebas desde 250-5000 VDC. Normas: IEEE 43-2013, IEEE Std 522-2014
4. **Estator**: Corto espira-espira, corto fase-fase, corto espira tierra. Norma: IEEE Std 1415-2006
5. **Rotor**: Fisuras en barras, barras rotas. Norma: IEEE Std 1415-2006
6. **Entrehierro**: Excentricidad (estatica, dinamica, mixta) del espacio entre rotor y estator

##### Tabla de Tecnicas Predictivas para Equipos Criticos A de MGFSN

Equipos de Criticidad A identificados por area:

| Area | Sub Area | Cod. UT | Descripcion |
|---|---|---|---|
| Manejo de materiales | Chancado Primario | 2110CV0001 | Correa descarga Chancador |
| Manejo de materiales | Chancado Primario | 2110CR0001 | Chancador de mandibula |
| Manejo de materiales | Chancado Primario | 2120CV0002 | Correa alimentacion acopio |
| Manejo de materiales | Pila acopio de gruesos | 2210CV0003 | Correa alimentacion SAG |
| Planta de procesos | Planta de Molienda | 3110MI0001 | Molino SAG |
| Planta de procesos | Planta de Molienda | 3120MI0002 | Molino bolas |
| Planta de procesos | Lixiviacion | 3210TH0001 | Espesador lixiviacion |
| Planta de procesos | Recuperacion de metales | 3310TH0002 | Espesador MC CCD |
| Planta de procesos | Recuperacion de metales | 3310TH0003 | Espesador MC CCD |
| Planta de procesos | Recuperacion de metales | 3320SN0013-0021 | Bombas harnero inter etapa 1-8 + reserva |
| Planta de procesos | Recuperacion de metales | 3330TH0004 | Clarificador MC |
| Planta de procesos | Detox de cianuro | 3610TA0022 | Estanque destruccion cianuro |
| Planta de procesos | Detox de cianuro | 3620TH0006 | Espesador relaves |
| Planta de procesos | Reactivos | 3810PU0301/0302 | Bombas distribucion cal |
| Servicios auxiliares | Agua fresca | 4100PU0036 | Bomba duchas emergencia |

Ademas de los equipos mecanicos, multiples **Tableros SCI** (Sistema de Control Industrial) son clasificados como Criticidad A en todas las areas.

#### 7.5.7 LCC - Life-Cycle Costing

Proceso de evaluacion de las diferencias entre los costos del ciclo de vida de dos o mas opciones. Objetivo: maximizar el ROA (Return On Assets) y lograr adecuados TIR.

**Vinculo LCC y VPN:**
- Si VPN > 0 el proyecto es aceptable
- VPN = Ciclo de Vida de los Beneficios del Producto - Costo del Ciclo de Vida del proyecto
- Se debe seleccionar la alternativa que maximiza el VPN (minimizar LCC)

**Beneficios del LCC:**
- Reduce los costos de posesion
- Reduce el riesgo de gastos de operacion imprevistos
- Cambia los criterios para seleccion de opciones
- Permite identificar sistematicamente los mayores elementos de costos

**Aplicaciones en mantenimiento:**
- Seleccionar la mejor estrategia de mantenimiento (RTF, PM, MonCon)
- Reparar un componente o reemplazarlo?
- Utilizar material mas caro pero de mayor duracion?
- Cuando debe hacerse el reemplazo?
- Comprar o alquilar equipos?
- Taller central o varios en sitio?

**Formula LCC:**
```
LCC = Cic + Cin + Ce + Co + Cm + Cs + Camb + Cd
```

Donde:
- Cic = costo inicial, costo de compra
- Cin = instalacion y puesta en marcha
- Ce = costos energeticos
- Co = costo de operacion
- Cm = costo de mantenimiento (HH & materiales)
- Cs = tiempo de averia, perdida de produccion
- Camb = costos ambientales
- Cd = desmantelamiento/remediacion

**Principios del LCC:**
- Cualquier decision clave debe reconocer su impacto sobre todas las fases del ciclo de vida
- Los costos de cada fase deben ser identificados y descompuestos
- Todo lo que pueda cambiar como resultado de seleccionar una alternativa debe ser considerado
- Utilizar un formato comun para tener un enfoque estandar

#### 7.5.8 MoC - Gestion del Cambio

Proceso de evaluacion y gestion de los riesgos asociados a las modificaciones que pueden ser temporales o permanentes dentro de las organizaciones.

> ISO 55001:2014, requerimiento 8.2: "Antes de implementar cualquier cambio, se deben valorar los riesgos asociados a cualquier cambio planificado, permanente o temporal, que pueda tener un impacto en el logro de los objetivos de la gestion de activos"

**Aplicaciones en mantenimiento (ISO 55002:2014):**
- Estructuras, roles o responsabilidades de la organizacion
- Politica, objetivos o planes de la gestion de activos
- Procesos o procedimientos para las actividades de gestion de activos
- Nuevos activos, sistemas de activos o tecnologias (incluyendo obsolescencia)
- Factores externos (incluyendo nuevos requisitos legales y regulatorios)
- Restricciones en la cadena de suministros
- Demandas de productos y servicios, contratistas o proveedores
- Demandas de recursos, incluyendo demandas competitivas

**Etapas del proceso MoC:**

1. **Definicion del cambio**: El originador describe, justifica y propone el cambio con descripcion detallada (alcance, diagramas, planos, regulaciones)
2. **Evaluar y clasificar el cambio**:
   - Rechazada - notificar y archivar
   - Modificar - devolver a originador
   - Aprobado para Evaluacion de Riesgos
   - Clasificacion: Permanente, Temporal, o de Emergencia
3. **Evaluacion del riesgo**: Con participacion de lideres de areas involucradas. Considerar todos los escenarios de falla y eventos potenciales no deseados.
4. **Aprobacion del cambio**: Los responsables validan el plan propuesto
5. **Implementacion del cambio**: Incluye fase de comunicacion y entrenamiento. Actualizar documentos/procedimientos/planos
6. **Control y cierre del cambio**: Seguimiento, validacion de objetivos, cierre definitivo con lecciones aprendidas

**Beneficios de la Gestion del Cambio:**
- Permite evaluar los posibles impactos de los cambios planteados
- Actualizacion de registros
- Divulgacion de los cambios al personal
- Se mantiene el registro de las operaciones
- Favorece al proceso de cultura integral
- Permite mantener actualizados los procesos de mantenimiento
- Permiten implantar practicas de trabajo seguras
- Se evaluan los verdaderos costos asociados al cambio

---

### 7.6 Capacidad de la Organizacion / Organization Capability

#### 7.6.1 Estructura Organizacional de Mantenimiento

```
Superintendente Mantenimiento
  |
  +-- Jefe Mantenimiento Mecanico
  |     +-- Mantenedor Mecanico
  |
  +-- Jefe Mantenimiento Electrico & Instrumentacion
  |     +-- Mantenedor Electrico
  |     +-- Mantenedor Instrumentacion
  |
  +-- Jefe de Planificacion del Mantenimiento
  |     +-- Planificador Mantenimiento Planta
  |
  +-- Especialista Sistema de Control
  |
  +-- Mantenedor Sintomatico
  |
  +-- Jefe de Turno Mantenimiento
        +-- Electricos Turno
        +-- Mecanicos Turno
        +-- Instrumentistas y Control Turno
```

#### 7.6.2 Responsabilidades de la Gestion de Mantenimiento

**Responsabilidades generales (todas las posiciones):**
- Vigilar el cumplimiento de politicas de SSO, Medio Ambiente y Calidad
- Participar en la planificacion de objetivos y metas
- Participar en procesos de auditoria
- Participar en la identificacion y evaluacion de riesgos
- Participar en la investigacion de accidentes e incidentes
- Crear y actualizar procedimientos, instructivos y registros

**Responsabilidades especificas:**

| Cargo | Responsabilidades Clave |
|---|---|
| **Superintendente de Mantenimiento** | Gestionar la mantencion maximizando disponibilidad y disminuyendo costos; implementar mejores practicas; participar en plan estrategico; comunicar desempeno de equipos |
| **Jefe de Mant. Electrico & Instrumentacion** | Supervisar ejecucion del programa semanal; participar en planificacion; cierre tecnico de OTs; controlar riesgos |
| **Jefe de Mant. Mecanico** | Supervisar ejecucion del programa semanal; participar en planificacion; cierre tecnico de OTs; controlar riesgos |
| **Especialista Sistema Control** | Ejecutar labores de diseno de arquitectura, programacion, instalacion y mantencion del sistema DCS |
| **Jefe de Planificacion** | Desarrollar programa predictivo; controlar KPIs (% cumplimiento plan matriz, adherencia al programa, backlog); analizar datos de OTs y avisos |
| **Planificador Mant. Planta** | Planificar actividades y paradas de planta; liderar gestion de trabajo desde identificacion hasta analisis final; crear/actualizar data maestra |
| **Mantenedor Electrico** | Ejecutar mant. preventivo, predictivo y correctivo electrico; notificar en OTs |
| **Mantenedor Instrumentacion** | Ejecutar mant. preventivo, predictivo y correctivo de instrumentacion; notificar en OTs |
| **Mantenedor Mecanico** | Ejecutar mant. preventivo, predictivo y correctivo mecanico; notificar en OTs |
| **Mantenedor Sintomatico** | Ejecutar en terreno el mant. predictivo de equipos mecanicos y electricos |
| **Jefe de Turno Mantenimiento** | Control permanente de actividades en turnos 7x7; coordinar tareas de atencion inmediata |
| **Electricos/Mecanicos/Instrumentistas Turno** | Control permanente en turnos 7x7; ejecutar mant. correctivo, imprevistos o de emergencia |

#### 7.6.3 Interrelacion Funcional del Proceso de Mantenimiento

```
Head de Operaciones
  |
  +-- Gerencia Mina
  |     +-- Superintendente Operaciones Mina
  |     +-- Superintendente Planificacion & Geologia
  |
  +-- Gerencia Procesos
        +-- Superintendente de Produccion
        +-- Superintendente de Metalurgia
        +-- Superintendente de Mantenimiento
```

#### 7.6.4 Analisis del Desempeno de la Gestion de Mantenimiento

Los indicadores de rendimiento reflejan el nivel de logro de un objetivo. Al medir el desempeno del mantenimiento no solo implica hacer un buen trabajo, sino que lo realizado elimine o mitigue con exito el riesgo de falla a un nivel aceptable.

Normas principales: **EN 15341** y **SMRP Best Practice Metrics**.

##### 7.6.4.1 Indicadores Economicos

**Costo de Mantenimiento:**

| Campo | Valor |
|---|---|
| Nombre | Costo de Mantenimiento |
| Tendencia favorable | Decreciente |
| Formula | `Costo Mnto = Costo Total Mnto / Mineral tratado en planta` |
| Frecuencia | Mensual |
| Unidad | US $ |
| Fuente | GENIX |
| Responsable | Superintendente de mantenimiento |

**Cumplimiento Budget:**

| Campo | Valor |
|---|---|
| Nombre | Cumplimiento Budget |
| Tendencia favorable | Cumplimiento |
| Formula | `Presupuesto comprometido en el periodo / forecast del periodo de medicion` |
| Frecuencia | Mensual |
| Meta | 100% |
| Fuente | GENIX |

##### 7.6.4.2 Indicadores Operacionales

**OEE - Overall Equipment Effectiveness:**

| Campo | Valor |
|---|---|
| Nombre | OEE |
| Tendencia favorable | Creciente |
| Formula | `OEE (%) = Disponibilidad (%) * Eficiencia desempeno (%) * Ratio de Calidad (%)` |
| Frecuencia | Mensual |
| Meta | 100% |
| Fuente | GENIX |

**Disponibilidad Fisica:**

| Campo | Valor |
|---|---|
| Nombre | Disponibilidad Fisica |
| Tendencia favorable | Creciente |
| Definicion | Toma en cuenta las paradas por mant. correctivo (fallas o emergencias) y preventivo |
| Formula | `Disponibilidad = Horas Disponibles / Horas Nominales (Norma Asarco)` |
| Frecuencia | Mensual |
| Meta | 100% |

**MTBF - Mean Time Between Failures:**

| Campo | Valor |
|---|---|
| Nombre | MTBF |
| Tendencia favorable | Creciente |
| Definicion | Evalua el tiempo medio entre fallas de un activo |
| Formula | `MTBF = Tiempo de operacion (horas) / Numero de fallas` |
| Frecuencia | Mensual |
| Unidad | Horas |

**MTTR - Mean Time To Repair or Replace:**

| Campo | Valor |
|---|---|
| Nombre | MTTR |
| Tendencia favorable | Decreciente |
| Definicion | Evalua el tiempo medio necesario para restaurar la funcion de un activo |
| Formula | `MTTR = Tiempo total de reparacion o sustitucion (horas) / Numero de reparaciones o sustituciones` |
| Frecuencia | Mensual |
| Unidad | Horas |

##### 7.6.4.3 Indicadores de Seguridad

**IFG - Indice de Frecuencia Global:**

| Campo | Valor |
|---|---|
| Nombre | Indice de Frecuencia Global |
| Tendencia favorable | Decreciente |
| Formula | `I.F. = (N total de accidentes / N total de horas trabajadas) x 1,000,000` |
| Frecuencia | Mensual |
| Meta | 0% |

**IG - Indice de Gravedad:**

| Campo | Valor |
|---|---|
| Nombre | Indice de Gravedad |
| Tendencia favorable | Decreciente |
| Definicion | Numero de dias de ausencia al trabajo de los lesionados por millon de horas trabajadas |
| Formula | `I.G. = (N jornadas no trabajadas por accidente / N total horas trabajadas) x 1,000,000` |
| Frecuencia | Mensual |
| Meta | 0% |

**ICA - Indice de Cuasi Accidentes de Alto Potencial:**

| Campo | Valor |
|---|---|
| Nombre | Indice de Cuasi Accidentes de Alto Potencial |
| Tendencia favorable | Decreciente |
| Formula | `ICA = (N total de cuasi accidentes de alto potencial / N total de horas trabajadas) x 1,000,000` |
| Frecuencia | Mensual |
| Meta | 0% |

---

## Quick Reference Summary

### Key Methodologies Covered

| Methodology | Section | Purpose |
|---|---|---|
| FMECA | 7.3.1 | Failure modes analysis and criticality for reliability |
| FTA | 7.3.2 | Fault tree analysis for root cause identification |
| RAM | 7.3.3 | Reliability, Availability, Maintainability modeling |
| Criticality Analysis | 7.4.2 | Asset risk ranking and prioritization |
| RBI | 7.4.3 | Risk-based inspection for static equipment |
| RCM | 7.4.4 | Reliability-centered maintenance plan development |
| OCR | 7.5.1 | Cost-risk optimization for repair/replace decisions |
| Failure Elimination | 7.5.2 | RCA methodology for defect elimination |
| Pareto Analysis | 7.5.3 | Systematic problem prioritization (80/20 rule) |
| Jack-Knife Diagram | 7.5.4 | Equipment downtime analysis (frequency vs MTTR) |
| Weibull Analysis | 7.5.5 | Statistical failure pattern analysis |
| Predictive Techniques | 7.5.6 | Vibration, ultrasonics, thermography, oil analysis, DGA, motor testing |
| LCC | 7.5.7 | Life-cycle cost comparison for asset decisions |
| MoC | 7.5.8 | Management of change process |

### Key KPI Formulas

| KPI | Formula | Trend |
|---|---|---|
| Costo Mnto | Costo Total Mnto / Mineral tratado | Decreciente |
| OEE | Disponibilidad x Eficiencia x Calidad | Creciente |
| Disponibilidad | Horas Disponibles / Horas Nominales | Creciente |
| MTBF | Tiempo operacion (h) / N fallas | Creciente |
| MTTR | Tiempo total reparacion (h) / N reparaciones | Decreciente |
| IFG | (N accidentes / N horas trabajadas) x 1,000,000 | Decreciente |
| Weibull R(t) | exp[-((t-T0)/eta)^beta] | -- |
| LCC | Cic + Cin + Ce + Co + Cm + Cs + Camb + Cd | Minimizar |
| OCR Riesgo | P(falla) x Consecuencia | Optimizar |
