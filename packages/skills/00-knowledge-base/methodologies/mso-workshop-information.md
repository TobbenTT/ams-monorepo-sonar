# MSO Workshop Information (Maintenance Strategy Optimization)

> **Source:** `asset-management-methodology/MSO informacion.docx`
> **Conversion Date:** 2026-02-23
> **Document Type:** Workshop Execution Guidelines for Maintenance Strategy Optimization
> **Language:** Originally in Spanish; translated and preserved in bilingual format

## Used By Skills

- `orchestrate-workflow` - Workshop planning, task execution sequence, resource coordination
- `validate-quality` - Quality validation of task analysis, consequence assessment, resource estimation

---

## Overview

This document provides key points to consider during the execution of Maintenance Strategy Optimization (MSO) workshops. It covers the structured approach to analyzing maintenance tasks, work packages, and resource requirements for each equipment under review.

---

## Workshop Execution Guidelines

### 1. Pre-Analysis Overview (Before Analyzing Task by Task)

Before beginning to analyze task by task, ask the maintenance technician what maintenance activities (routines, inspections, checklists, walk-arounds, or however they are called) they perform on the equipment in question in order to identify:

**a) Draft Work Packages:**
- What will be the draft of each routine (beyond the subsequent analysis of failure modes and task details)
- How many work packages will we have
- Whether they are routes
- What frequencies apply
- Which are performed during shutdown and which during operation
- Duration and man-hours of these routines

**b) Equipment Identification:**
- What equipment is being serviced within these routines
- Does a routine exist where more than one equipment (as defined in Rylson8) is serviced?

**c) Cross-Equipment Dependencies:**
- What other equipment is serviced during the execution of this routine, even if they are independent maintenance routines
- Example: When one team services the pump (with its corresponding routine), another team services the SAG feed chute (with its own routine). This is a matter for the maintenance scheduler, but this type of information provides a macro view of maintenance at the plant.

### 2. Task Detail Analysis

For each task being analyzed, capture:

**a) Constraint:**
- Shutdown (Detenido)
- Operating (Operando)
- Shutdown or Operating (Detenido u Operando)

**b) Resource Requirements:**
- Does the task require support from another specialty? (to know if other resources are involved)
- Is there any coordination needed?
- Is there any prior work required by another specialty? (e.g., disconnect instrumentation, disconnect motor, scaffold assembly, etc.)

**c) Labour Assignment:**
- Assign the specialty (mechanical, electrical, etc.) that performs the task (all tasks must have an assigned resource)
- Ask whether the work is done by internal or external personnel

**d) Additional Resources:**
- Is scaffold assembly/disassembly required? (ask particularly for mechanical activities)
- Is a crane operator required? (for how many hours?)
- **Important:** Alert the maintenance technician before the workshop begins that you need this type of information: all resources (labour, materials, spare parts, special tools, and special equipment) involved in maintaining the equipment being analyzed

**e) Spare Parts:**
- Request all spare parts for the equipment and assign them to the corresponding maintenance tasks

### 3. Secondary Tasks

**a) For Change or Repair Tasks:**
- Assign an estimate of the component's useful life
- "How often approximately do we perform this repair or change?"
- Perform the data collection; the office team will explain how to manage this information in Rylson (the data entry process is already known)
- This is independent of whether we will ultimately budget for it or not
- It is better to ask the question and collect the technician's estimate than to need the information later and not have it

**b) Non-Productive Times:**
- Beyond the mere execution of the routine tasks
- Approximate time in spare parts preparation (this preparation task can be very time-consuming and executed by other people days before)
- Transport time
- JSA (Job Safety Analysis) time, etc.
- Collect this information for each work package that has been identified

### 4. Post-Workshop Review

After having understood all the work of the specialty, go back and ask about the specialties that are intervening on the equipment during the execution of the routine of the specialty being analyzed.

**Example:** During mechanical maintenance of the pump, the electrical team, instrumentalists, and lubrication team all service the pump performing tasks A, B, and C.

### 5. Consequence Assessment

For all tasks involving fixed-time replacement, or whose secondary tasks involve replacement or repair of the component, perform a data collection of the impact or consequence of NOT performing the task.

Record this in the "Consequences" field in the Maintenance Strategies module of Rylson8.

> **Note:** Later we will determine how to convert these physical consequences into monetary values.

---

## Key Principles

1. **Resource completeness:** Every task must have an assigned resource (specialty)
2. **Spare parts association:** All spare parts must be identified and linked to their corresponding tasks
3. **Cross-functional visibility:** Understand how different specialties interact during equipment maintenance
4. **Consequence documentation:** Document what happens if each critical maintenance task is not performed
5. **Practical estimation:** Collect useful life estimates from experienced technicians for all change/repair tasks
6. **Non-productive time accounting:** Account for preparation, transport, and safety analysis time in work packages

---

## Original Spanish Text (Reference)

> Favor de tener en cuenta los siguientes puntos durante la ejecucion de sus talleres.
>
> Antes de comenzar a analizar tarea por tarea, pedir al mantenedor que mantenimiento (pautas, inspecciones, check list, vuelta del perro... o como quiera que la llamen) hacen sobre el equipo en cuestion para identificar:
>
> - Lo que va a ser el borrador de cada pauta (mas alla del analisis posterior de los modos de falla y el detalle de que tareas hacen)
> - Cuantos paquetes vamos a tener, si son rutas, que frecuencias, cuales son detenido y cuales operando, duracion y HH de estas pautas...
> - Que equipos se intervienen dentro de estas pautas; existe una pauta donde se interviene mas de un equipo?
> - Que otros equipos se intervienen durante la ejecucion de esta pauta, aunque sean pautas de mantenimiento independientes
>
> Por ultimo, estoy de acuerdo con Alberto en hacer el levantamiento del impacto o consecuencias de no hacer la tarea, asi que para (al menos) todas aquellas tareas de cambio a tiempo fijo o cuyas tareas secundarias sea el cambio o reparacion del componente, propongo hacer el levantamiento del impacto o consecuencia de no hacer la tarea. Lo guardamos en "Consecuencias" en el modulo de Estrategias de Mantenimiento. Mas adelante vemos como convertimos estas consecuencias (fisicas) en dinero.
