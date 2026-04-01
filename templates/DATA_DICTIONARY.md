# Diccionario de Datos — DB_AM_OCP_SYNTHETIC_2026

**Proyecto:** Dataset Sintetico Planta Concentradora OCP
**Blueprint:** AMSA_BBP_PM_04_Rev_0
**Ultima actualizacion:** 2026-03-31
**Total campos documentados:** 450+

> Este documento describe TODOS los encabezados (columnas) de cada plantilla generada,
> explicando el nombre del campo, su origen (SAP, Blueprint, AMS, o convención propia),
> y por qué se eligió ese nombre.

---

## Convenciones de Nombrado

| Prefijo/Patron                                             | Origen                     | Explicacion                                                                                      |
| ---------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| `aufnr`, `auart`, `equnr`, `tplnr`, `qmnum`      | **SAP PM**           | Nombres técnicos SAP (alemán). Se mantienen para compatibilidad directa con transacciones SAP. |
| `eqktx`, `eqart`, `herst`, `abckz`, `pltxt`      | **SAP PM**           | Campos del maestro de equipos/ubicaciones SAP.                                                   |
| `erdat`, `gstrp`, `gltrp`, `iedd`, `iedt`        | **SAP PM**           | Campos de fechas SAP en órdenes/avisos.                                                         |
| `priokx`, `ilart`, `arbpl`, `qmart`                | **SAP PM**           | Campos de prioridad, tipo aviso, puesto trabajo SAP.                                             |
| `sap_func_loc`, `sap_material_number`                  | **Mapping AMS→SAP** | Prefijo `sap_` indica que el campo mapea directamente a un campo SAP.                          |
| `equipment_tag`                                          | **AMS**              | Identificador legible del equipo en formato PLANTA-CODIGO (ej: OCP-CON1-MSAG01).                 |
| `planning_center`, `planning_group`, `business_area` | **Blueprint**        | Codificación organizacional del Blueprint (AN01, P01-P03, SEC/RIP/HUM).                         |
| `synth_trace_id`                                         | **Sintético**       | ID único con prefijo S26- para evitar colisiones con datos reales.                              |
| `_csv` sufijo                                            | **Convención**      | Campo que contiene múltiples valores separados por coma.                                        |
| `_usd` sufijo                                            | **Convención**      | Monto monetario en dólares estadounidenses.                                                     |
| `_pct` sufijo                                            | **Convención**      | Valor expresado como porcentaje.                                                                 |
| `_hours` sufijo                                          | **Convención**      | Duración en horas.                                                                              |
| `_days` sufijo                                           | **Convención**      | Duración o plazo en días.                                                                      |
| `ZCAR_*`                                                 | **SAP Custom**       | Características SAP customizadas (Z = custom en SAP).                                           |
| `ZCL_*`                                                  | **SAP Custom**       | Clases de clasificación SAP customizadas.                                                       |
| `ZMANT*`                                                 | **SAP Custom**       | Categorías de valor customizadas según Blueprint.                                              |
| `CONF_PM_*`                                              | **Blueprint**        | Puntos de configuración SAP PM del Blueprint.                                                   |
| `CINI_PM_*`                                              | **Blueprint**        | Cargas iniciales definidas en el Blueprint.                                                      |

---

## 01_equipment_hierarchy.xlsx

### Sheet: Equipment Hierarchy

| #  | Campo               | Tipo     | Origen | Descripcion                                                                                          | Por qué este nombre                                                     |
| -- | ------------------- | -------- | ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1  | `sap_func_loc`    | CHAR     | SAP    | Código de ubicación técnica SAP (ej: 02-01-01-CHAN01-LUBE)                                        | Mapea al campo SAP TPLNR. Prefijo `sap_` para claridad.                |
| 2  | `fl_type`         | CHAR     | SAP/BP | Tipo de ubicación técnica. Valor: M (Sistema técnico estándar)                                   | Blueprint Tabla 14.`fl` = functional location.                         |
| 3  | `pltxt`           | CHAR     | SAP    | Descripción de la ubicación técnica                                                               | Campo SAP PLTXT (Plant Text). Se mantiene nombre SAP.                    |
| 4  | `level`           | INT      | AMS    | Nivel jerárquico (0=Corp, 1=Operación, 2=Proceso, 3=Subproceso, 4=Maquinaria, 5=Sistema, 6=Equipo) | Nombre genérico para indicar profundidad en la jerarquía MANTE.        |
| 5  | `parent_fl`       | CHAR     | AMS    | Código de ubicación técnica padre                                                                 | Referencia al nodo superior en la jerarquía. Corresponde a SAP SUPEROR. |
| 6  | `equnr`           | CHAR(12) | SAP    | Número de equipo SAP (12 caracteres)                                                                | Campo SAP EQUNR (Equipment Number). Se mantiene nombre SAP.              |
| 7  | `eqktx`           | CHAR     | SAP    | Descripción corta del equipo                                                                        | Campo SAP EQKTX (Equipment Short Text). Se mantiene nombre SAP.          |
| 8  | `eqart`           | CHAR     | SAP/BP | Tipo de equipo: M=Máquinas, Q=Inspección/Medida                                                    | Campo SAP EQART (Equipment Type). Blueprint Tabla 15.                    |
| 9  | `eqart_desc`      | CHAR     | AMS    | Descripción del tipo de equipo                                                                      | Expansión legible de eqart. No existe en SAP, creado para usabilidad.   |
| 10 | `herst`           | CHAR     | SAP    | Fabricante del equipo                                                                                | Campo SAP HERST (Hersteller = fabricante en alemán).                    |
| 11 | `model`           | CHAR     | AMS    | Modelo del equipo                                                                                    | No es campo SAP estándar. Agregado para completitud técnica.           |
| 12 | `power_kw`        | NUM      | AMS    | Potencia nominal en kilowatts                                                                        | Dato técnico operacional. Nombre descriptivo en inglés.                |
| 13 | `weight_kg`       | NUM      | AMS    | Peso del equipo en kilogramos                                                                        | Dato técnico operacional. Nombre descriptivo en inglés.                |
| 14 | `abckz`           | CHAR     | SAP/BP | Indicador de criticidad ABC: 1=Alto, 2=Medio, 3=Bajo                                                 | Campo SAP ABCKZ. Blueprint Tabla 19. Valores numéricos según BP.       |
| 15 | `abckz_desc`      | CHAR     | AMS    | Descripción del indicador ABC                                                                       | Expansión legible de abckz. Creado para usabilidad.                     |
| 16 | `stat`            | CHAR     | SAP    | Estado del equipo (ACTIVE)                                                                           | Campo SAP STAT (Status).                                                 |
| 17 | `planning_center` | CHAR(4)  | BP     | Centro de planificación: AN01                                                                       | Blueprint Tabla 4. Nombre en inglés por convención AMS.                |
| 18 | `planning_group`  | CHAR(3)  | BP     | Grupo de planificación: P01/P02/P03                                                                 | Blueprint Tabla 5. Nombre en inglés por convención AMS.                |
| 19 | `business_area`   | CHAR(3)  | BP     | Área de empresa: SEC/RIP/HUM                                                                        | Blueprint Tabla 6. Nombre en inglés por convención AMS.                |
| 20 | `install_date`    | DATE     | AMS    | Fecha de instalación del equipo                                                                     | Dato operacional. Formato YYYY-MM-DD.                                    |
| 21 | `serial_number`   | CHAR     | SAP    | Número de serie. Corresponde a SAP SERGE                                                            | Campo SAP SERGE. Nombre inglés por legibilidad.                         |

### Sheet: Equipment BOM

| # | Campo              | Tipo    | Origen | Descripcion                                              | Por qué este nombre                                                |
| - | ------------------ | ------- | ------ | -------------------------------------------------------- | ------------------------------------------------------------------- |
| 1 | `parent_tag`     | CHAR    | AMS    | Tag del equipo padre (ej: OCP-CON1-MSAG01)               | Referencia al equipo nivel 4 al que pertenece el componente.        |
| 2 | `parent_equnr`   | CHAR    | SAP    | Número SAP del equipo padre                             | Enlace con el campo equnr de la hoja Equipment Hierarchy.           |
| 3 | `component_name` | CHAR    | AMS    | Nombre del componente/sistema/equipo hijo                | Descripción del sub-componente en la BOM.                          |
| 4 | `sys_code`       | CHAR(4) | BP     | Código del sistema (nivel 5) o sistema-equipo (nivel 6) | Corresponde a los 4 caracteres del nivel 5/6 de la máscara MANTE.  |
| 5 | `sap_func_loc`   | CHAR    | SAP    | Ubicación técnica completa del componente              | Misma codificación que el campo sap_func_loc de la hoja principal. |
| 6 | `level`          | INT     | AMS    | Nivel en BOM: 5=Sistema, 6=Equipo                        | Profundidad dentro de la jerarquía del equipo padre.               |

---

## 02_criticality_assessment.xlsx

### Sheet: Criticality Assessment

| #    | Campo                                                                                                                                                                                         | Tipo     | Origen  | Descripcion                                                     | Por qué este nombre                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `equipment_tag`                                                                                                                                                                             | CHAR     | AMS     | Identificador legible del equipo                                | Formato PLANTA-CODIGO para referencia cruzada.                                                                                    |
| 2    | `equnr`                                                                                                                                                                                     | CHAR     | SAP     | Número de equipo SAP                                           | Enlace con maestro de equipos.                                                                                                    |
| 3    | `sap_func_loc`                                                                                                                                                                              | CHAR     | SAP     | Ubicación técnica SAP                                         | Enlace con jerarquía.                                                                                                            |
| 4    | `eqktx`                                                                                                                                                                                     | CHAR     | SAP     | Descripción corta del equipo                                   | Texto descriptivo para identificación.                                                                                           |
| 5    | `area`                                                                                                                                                                                      | CHAR     | AMS     | Área de proceso (Chancado, Molienda, etc.)                     | Nombre legible del área. No es código SAP.                                                                                      |
| 6    | `method`                                                                                                                                                                                    | CHAR     | AMS     | Metodología de evaluación utilizada: AMSA-RAM                 | Referencia a la metodología RAM de AMSA.                                                                                         |
| 7    | `abckz`                                                                                                                                                                                     | CHAR     | SAP/BP  | Clasificación ABC numérica (1/2/3)                            | Misma definición que en 01.                                                                                                      |
| 8    | `abckz_desc`                                                                                                                                                                                | CHAR     | AMS     | Descripción ABC (Alto/Medio/Bajo)                              | Expansión legible.                                                                                                               |
| 9-20 | `safety`, `health`, `environment`, `production`, `operating_cost`, `capital_cost`, `schedule`, `revenue`, `communications`, `compliance`, `reputation`, `probability` | INT(1-5) | AMS/RAM | Criterios individuales de evaluación de criticidad, escala 1-5 | Nombres en inglés siguiendo estándar ISO 31000 / metodología RAM. Cada criterio evalúa el impacto de falla en esa dimensión. |
| 21   | `total_score`                                                                                                                                                                               | INT      | AMS     | Suma de todos los criterios de criticidad                       | Puntaje agregado para ranking.                                                                                                    |
| 22   | `criticality_rank`                                                                                                                                                                          | CHAR     | AMS     | Ranking final de criticidad                                     | Resultado de la evaluación. Nota: actualmente es el score bruto, debería ser 1/2/3.                                             |

---

## 03_failure_modes.xlsx

### Sheet: failure_modes

| #     | Campo                                                                  | Tipo | Origen | Descripcion                                                     | Por qué este nombre                                                                                           |
| ----- | ---------------------------------------------------------------------- | ---- | ------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1-4   | `equipment_tag`, `equnr`, `sap_func_loc`, `area`               | --   | --     | Identificadores del equipo (ver 01/02)                          | Campos de referencia cruzada estándar.                                                                        |
| 5     | `equipment_function_description`                                     | CHAR | RCM    | Descripción de la función del equipo                          | Terminología RCM (Reliability Centered Maintenance). Describe QUÉ hace el equipo.                            |
| 6     | `equipment_functional_failure`                                       | CHAR | RCM    | Descripción de la falla funcional                              | Terminología RCM. Describe CÓMO falla la función.                                                           |
| 7     | `function_type`                                                      | CHAR | RCM    | PRIMARY o SECONDARY                                             | Clasificación RCM: función primaria vs. secundaria.                                                          |
| 8     | `failure_type`                                                       | CHAR | RCM    | FUNCTIONAL o POTENTIAL                                          | Falla funcional (ya ocurrió) vs. potencial (degradación detectable).                                         |
| 9     | `subunit`                                                            | CHAR | AMS    | Subunidad afectada (MECHANICAL, ELECTRICAL, etc.)               | Categorización por disciplina del componente fallado.                                                         |
| 10    | `maintainable_item`                                                  | CHAR | AMS    | Item mantenible específico (Rodamiento, Sello, etc.)           | Componente físico que experimenta la falla.                                                                   |
| 11    | `mechanism`                                                          | CHAR | AMS    | Mecanismo de falla (WEARS, CORRODES, etc.)                      | CÓMO falla el componente. Vocabulario estandarizado ISO 14224.                                                |
| 12    | `cause`                                                              | CHAR | AMS    | Causa raíz (ABRASION, FATIGUE, etc.)                           | POR QUÉ falla. Vocabulario ISO 14224.                                                                         |
| 13    | `failure_pattern`                                                    | CHAR | RCM    | Patrón de falla Nowlan-Heap (A-F)                              | A_BATHTUB a F_INFANT. Patrones estadísticos de probabilidad de falla vs. edad.                                |
| 14    | `failure_consequence`                                                | CHAR | RCM    | Consecuencia: SAFETY_CRITICAL, ENVIRONMENTAL, OPERATIONAL, etc. | Clasificación RCM de severidad de consecuencia.                                                               |
| 15    | `evidence`                                                           | CHAR | AMS    | Evidencia observable de la falla                                | Qué se puede detectar antes o durante la falla. En español.                                                  |
| 16    | `downtime_hours`                                                     | NUM  | AMS    | Tiempo de parada estimado en horas                              | Impacto operacional de la falla.                                                                               |
| 17    | `detection_method`                                                   | CHAR | AMS    | Método de detección (MONITOREO_VIBRACION, TERMOGRAFIA, etc.)  | Técnica predictiva/inspección para detectar la falla. En español-técnico.                                  |
| 18-21 | `rpn_severity`, `rpn_occurrence`, `rpn_detection`, `rpn_total` | INT  | FMECA  | Números de Prioridad de Riesgo                                 | Metodología FMECA (Failure Mode Effects and Criticality Analysis). RPN = Severity × Occurrence × Detection. |

---

## 04_measurement_points.xlsx

### Sheet: Measurement Points

| #     | Campo                                                     | Tipo     | Origen | Descripcion                                               | Por qué este nombre                                                                        |
| ----- | --------------------------------------------------------- | -------- | ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1     | `measurement_point_id`                                  | CHAR(12) | SAP/BP | ID del punto de medida (12 chars, rango 1-99999)          | Blueprint Tabla 17-18. Corresponde a SAP POINT.                                             |
| 2     | `point_type`                                            | CHAR     | BP     | Tipo de punto: M (General)                                | Blueprint Tabla 17. Solo tipo M definido.                                                   |
| 3-4   | `equipment_tag`, `sap_func_loc`                       | --       | --     | Identificadores equipo                                    | Referencia cruzada.                                                                         |
| 5     | `description`                                           | CHAR     | AMS    | Descripción del punto de medida                          | Texto que identifica QUÉ se mide y DÓNDE.                                                 |
| 6     | `characteristic`                                        | CHAR     | SAP    | Característica medida (TEMP_BRG_DE, VIB_RAD_NDE, etc.)   | Código técnico de la variable. DE=Drive End, NDE=Non-Drive End (convención vibraciones). |
| 7     | `unit_of_measure`                                       | CHAR     | SAP    | Unidad: C, mm/s, bar, %, L/min, A, kW, h, pH, kg/m3, m3/h | Unidades SI estándar.                                                                      |
| 8     | `decimal_places`                                        | INT      | SAP    | Cantidad de decimales para la lectura                     | Precisión de registro.                                                                     |
| 9-11  | `target_value`, `lower_limit`, `upper_limit`        | NUM      | AMS    | Valor objetivo y límites aceptables                      | Rangos para evaluación automática de lecturas.                                            |
| 12    | `is_counter`                                            | CHAR     | SAP    | "X" si es contador (horómetro, ciclos)                   | SAP usa "X" como flag booleano.                                                             |
| 13    | `counter_overflow_value`                                | NUM      | SAP    | Valor de desborde del contador                            | Para contadores que vuelven a cero.                                                         |
| 14    | `measurement_frequency_days`                            | INT      | AMS    | Frecuencia de medición en días                          | Cada cuántos días se debe tomar la lectura.                                               |
| 15-17 | `responsible_work_center`, `planning_group`, `area` | --       | --     | Asignación organizacional                                | Quién es responsable de tomar la medición.                                                |

---

## 05_work_packages.xlsx

### Sheet: Work Packages

| #   | Campo                                         | Tipo    | Origen | Descripcion                                                     | Por qué este nombre                                                          |
| --- | --------------------------------------------- | ------- | ------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `wp_code`                                   | CHAR    | AMS    | Código del paquete de trabajo (ej: INS-MSAG01-13S)             | `wp` = Work Package. Formato: TIPO-EQUIPO-FRECUENCIA.                       |
| 2   | `wp_name`                                   | CHAR    | AMS    | Nombre descriptivo del paquete                                  | Texto legible para planificación.                                            |
| 3-5 | `equipment_tag`, `sap_func_loc`, `area` | --      | --     | Identificadores equipo/área                                    | Referencia cruzada.                                                           |
| 6   | `frequency_value`                           | INT     | AMS    | Valor numérico de la frecuencia (2, 4, 8, 13, 26, 52)          | Cada cuántas unidades se ejecuta.                                            |
| 7   | `frequency_unit`                            | CHAR    | AMS    | Unidad de frecuencia: WEEKS                                     | Unidad temporal.                                                              |
| 8   | `constraint`                                | CHAR    | AMS    | Restricción: ONLINE, OFFLINE, SHUTDOWN_ONLY                    | Si el equipo debe estar detenido o no.                                        |
| 9   | `wp_type`                                   | CHAR    | AMS    | Tipo: INSPECT, LUBRICATION, PREVENTIVE, PREDICTIVE, CALIBRATION | Naturaleza del trabajo.                                                       |
| 10  | `route_sheet_type`                          | CHAR    | BP     | Tipo hoja de ruta: A (Instrucción)                             | Blueprint Tabla 34.                                                           |
| 11  | `route_sheet_group`                         | CHAR    | BP     | Grupo hoja de ruta: PLA (Planta)                                | Blueprint Tabla 35. Nota: en algunos registros dice "Planta" en vez de "PLA". |
| 12  | `access_time_hours`                         | NUM     | AMS    | Tiempo de acceso al equipo en horas                             | Tiempo para preparación, bloqueo LOTO, acceso físico.                       |
| 13  | `estimated_total_hours`                     | NUM     | AMS    | Horas-hombre totales estimadas                                  | Esfuerzo total planificado.                                                   |
| 14  | `crew_size`                                 | INT     | AMS    | Cantidad de personas requeridas                                 | Dotación del equipo de trabajo.                                              |
| 15  | `work_center`                               | CHAR(8) | BP     | Puesto de trabajo SAP (ej: PASMEC01)                            | Blueprint Tablas 7-9. Formato 8 caracteres.                                   |
| 16  | `planning_group`                            | CHAR(3) | BP     | Grupo planificación Blueprint                                  | P01/P02/P03.                                                                  |
| 17  | `planning_center`                           | CHAR(4) | BP     | Centro planificación: AN01                                     | Blueprint Tabla 4.                                                            |
| 18  | `maint_plan_type`                           | CHAR    | BP     | Tipo plan mantenimiento: PM                                     | Blueprint Tabla 37.                                                           |

---

## 06_work_order_history.xlsx

### Sheet: Work Order History

| #     | Campo                                                                 | Tipo     | Origen     | Descripcion                                                                  | Por qué este nombre                                                                              |
| ----- | --------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1     | `aufnr`                                                             | NUM      | SAP        | Número de orden SAP (7 dígitos)                                            | Campo SAP AUFNR (Auftragsnummer = número de orden en alemán).                                   |
| 2     | `auart`                                                             | CHAR     | SAP/BP     | Tipo de orden: PM01, PM02, PM03, PM06, PM07                                  | Campo SAP AUART (Auftragsart = tipo de orden). Blueprint Tabla 26.                                |
| 3     | `auart_desc`                                                        | CHAR     | AMS        | Descripción del tipo de orden                                               | Expansión legible del código auart.                                                             |
| 4-6   | `equipment_tag`, `equnr`, `tplnr`                               | --       | SAP        | Identificadores del equipo y ubicación técnica                             | `tplnr` = SAP TPLNR (Technischer Platz = ubicación técnica).                                  |
| 7-8   | `area`, `subprocess`                                              | CHAR     | AMS        | Área y subproceso de la planta                                              | Contexto operacional legible.                                                                     |
| 9-11  | `planning_group`, `business_area`, `planning_center`            | --       | BP         | Asignación organizacional Blueprint                                         | Ver definiciones en 01.                                                                           |
| 12    | `priokx`                                                            | CHAR(1)  | SAP/BP     | Código de prioridad: I, A, M, B                                             | Campo SAP PRIOKX. Blueprint Tabla 24/29, clase Z1.                                                |
| 13    | `priokx_desc`                                                       | CHAR     | AMS        | Descripción: Inmediata, Alta (2-6 dias), Media (7-14 dias), Baja (>14 dias) | Texto Blueprint exacto.                                                                           |
| 14    | `priority_class`                                                    | CHAR     | BP         | Clase de prioridad: Z1                                                       | Blueprint. Identifica el esquema de priorización usado.                                          |
| 15    | `ilart`                                                             | CHAR     | SAP/BP     | Tipo de aviso/notificación: A1, A2, A3                                      | Campo SAP ILART (Instandhaltungsmeldungsart). Blueprint Tabla 20.                                 |
| 16    | `ilart_desc`                                                        | CHAR     | AMS        | Descripción del tipo de aviso                                               | Texto Blueprint.                                                                                  |
| 17    | `qmnum`                                                             | CHAR     | SAP        | Número de notificación/aviso SAP                                           | Campo SAP QMNUM (Quality Management Number, reutilizado en PM).                                   |
| 18    | `notification_catalog`                                              | CHAR     | BP         | Código catálogo: M001, M002, M003, P001, P002                              | Blueprint Tabla 22. Determina la clase de orden vía exit CINI_PM_009.                            |
| 19    | `notification_status_schema`                                        | CHAR     | BP         | Esquema de status: ZPM00001                                                  | Blueprint Tabla 25. Solo para avisos A1/A2.                                                       |
| 20    | `notif_user_status`                                                 | CHAR     | BP         | Status usuario del aviso: APRO (Aprobado), RECH (Rechazado)                  | Blueprint Tabla 25, posiciones del esquema ZPM00001.                                              |
| 21    | `description`                                                       | CHAR(72) | SAP        | Texto corto de la orden (máx 72 chars)                                      | SAP_SHORT_TEXT_MAX = 72. Campo SAP AUFTEXT.                                                       |
| 22    | `erdat`                                                             | DATE     | SAP        | Fecha de creación de la orden                                               | Campo SAP ERDAT (Erstellungsdatum = fecha de creación).                                          |
| 23    | `gstrp`                                                             | DATETIME | SAP        | Fecha/hora inicio planificado                                                | Campo SAP GSTRP (Geplanter Starttermin = inicio planificado).                                     |
| 24    | `gltrp`                                                             | DATETIME | SAP        | Fecha/hora fin planificado                                                   | Campo SAP GLTRP (Geplanter Endtermin = fin planificado).                                          |
| 25    | `iedd`                                                              | DATETIME | SAP        | Fecha/hora inicio real                                                       | Campo SAP IEDD (Iststart Datum = inicio real).                                                    |
| 26    | `iedt`                                                              | DATETIME | SAP        | Fecha/hora fin real                                                          | Campo SAP IEDT (Istende Datum = fin real).                                                        |
| 27    | `duration_hours`                                                    | NUM      | AMS        | Duración en horas                                                           | Calculado entre inicio y fin.                                                                     |
| 28-30 | `cost_labour_usd`, `cost_materials_usd`, `cost_external_usd`    | NUM      | AMS        | Costos por categoría de valor en USD                                        | Mapean a ZMANT001, ZMANT002, ZMANT003 respectivamente.                                            |
| 31-33 | `value_cat_labour`, `value_cat_materials`, `value_cat_external` | CHAR     | BP         | Categorías de valor: ZMANT001, ZMANT002, ZMANT003                           | Blueprint Tabla 30. Nombres SAP custom (Z = customizado).                                         |
| 34    | `failure_found`                                                     | CHAR     | AMS        | Falla encontrada durante la ejecución                                       | Texto descriptivo del hallazgo. Solo para órdenes cerradas.                                      |
| 35    | `arbpl`                                                             | CHAR(8)  | SAP/BP     | Puesto de trabajo ejecutor                                                   | Campo SAP ARBPL (Arbeitsplatz = puesto de trabajo). Blueprint Tabla 9.                            |
| 36    | `supervisor_wc`                                                     | CHAR(7)  | BP         | Puesto de trabajo responsable (supervisor)                                   | Blueprint Tablas 32-33. Formato 7 caracteres.                                                     |
| 37    | `system_status`                                                     | CHAR     | SAP        | Status de sistema: ABIE, LIBE, NOTI, CTEC                                    | ABIE=Abierto, LIBE=Liberado, NOTI=Notificado, CTEC=Cerrado técnico. Status SAP estándar.        |
| 38    | `pm07_activity_class`                                               | CHAR     | BP         | Clase de actividad PM07: RP1, RP2                                            | Blueprint Tabla 28. Solo aplica a órdenes PM07. RP1=Reparación mayor, RP2=Reparación menor.    |
| 39    | `pm07_activity_desc`                                                | CHAR     | AMS        | Descripción de la clase de actividad                                        | Expansión legible de RP1/RP2.                                                                    |
| 40    | `crew_size`                                                         | INT      | AMS        | Cantidad de personas en la cuadrilla                                         | Dotación real de la ejecución.                                                                  |
| 41    | `specialty`                                                         | CHAR(3)  | BP         | Especialidad: MEC, ELE, INS, LUB, etc.                                       | Extraído del código de puesto de trabajo (posiciones 4-6).                                      |
| 42    | `synth_trace_id`                                                    | CHAR     | Sintético | ID trazabilidad sintético: S26-OT-NNNN-HASH                                 | Prefijo S26 = Sintético 2026. Hash MD5 parcial para unicidad. Evita colisiones con datos reales. |

---

## 07_spare_parts_inventory.xlsx

### Sheet: Spare Parts Inventory

| #    | Campo                                                                 | Tipo | Origen | Descripcion                                              | Por qué este nombre                                                            |
| ---- | --------------------------------------------------------------------- | ---- | ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1    | `material_code`                                                     | CHAR | AMS    | Código material sintético: S26-MAT-NNNN                | Prefijo S26 para trazabilidad.                                                  |
| 2    | `sap_material_number`                                               | CHAR | SAP    | Número de material SAP (12 dígitos)                    | Campo SAP MATNR.                                                                |
| 3    | `description`                                                       | CHAR | AMS    | Descripción del material/repuesto                       | Texto descriptivo técnico.                                                     |
| 4    | `manufacturer`                                                      | CHAR | AMS    | Fabricante del repuesto                                  | Corresponde a SAP MFRNR (Manufacturer).                                         |
| 5    | `part_number`                                                       | CHAR | AMS    | Número de parte del fabricante                          | Referencia del catálogo del fabricante.                                        |
| 6    | `ved_class`                                                         | CHAR | AMS    | Clasificación VED: VITAL, ESSENTIAL, DESIRABLE          | Metodología de gestión de repuestos. V=sin sustituto, E=crítico, D=deseable. |
| 7    | `fsn_class`                                                         | CHAR | AMS    | Clasificación FSN: FAST_MOVING, NORMAL, SLOW_MOVING     | Basado en frecuencia de consumo. F=alta rotación, S=baja rotación.            |
| 8    | `abc_class`                                                         | CHAR | AMS    | Clasificación ABC por valor: A (>50K), B (>5K), C (<5K) | Pareto de valor de inventario.                                                  |
| 9-12 | `quantity_on_hand`, `min_stock`, `max_stock`, `reorder_point` | INT  | AMS    | Niveles de inventario                                    | Gestión de stock: actual, mínimo, máximo, punto de reorden.                  |
| 13   | `lead_time_days`                                                    | INT  | AMS    | Tiempo de entrega del proveedor en días                 | Plazo desde pedido hasta recepción.                                            |
| 14   | `unit_cost_usd`                                                     | NUM  | AMS    | Costo unitario en USD                                    | Precio de adquisición.                                                         |
| 15   | `unit_of_measure`                                                   | CHAR | SAP    | Unidad: EA (cada), KG, M (metro), L (litro)              | SAP MEINS. EA = Each (unidad).                                                  |
| 16   | `applicable_equipment_csv`                                          | CHAR | AMS    | Equipos donde aplica, separados por coma                 | Sufijo `_csv` indica valores múltiples.                                      |
| 17   | `warehouse_location`                                                | CHAR | AMS    | Ubicación almacén: ALM-SEC-01, ALM-CENTRAL, etc.       | Código de bodega por área.                                                    |

---

## 08_shutdown_calendar.xlsx

### Sheet: Shutdown Calendar

| #   | Campo                                                 | Tipo     | Origen | Descripcion                               |
| --- | ----------------------------------------------------- | -------- | ------ | ----------------------------------------- |
| 1   | `plant_id`                                          | CHAR     | AMS    | ID planta: OCP-CON1                       |
| 2   | `shutdown_id`                                       | CHAR     | AMS    | ID parada: SD-2026-MM-TIPO                |
| 3   | `shutdown_name`                                     | CHAR     | AMS    | Nombre descriptivo de la parada           |
| 4   | `shutdown_type`                                     | CHAR     | AMS    | MINOR_8H, MINOR_12H, MAJOR_48H, MAJOR_72H |
| 5-7 | `planned_start`, `planned_end`, `planned_hours` | DATE/NUM | AMS    | Ventana temporal planificada              |
| 8   | `areas_csv`                                         | CHAR     | AMS    | Áreas afectadas, separadas por coma      |
| 9   | `description`                                       | CHAR     | AMS    | Descripción del alcance                  |
| 10  | `status`                                            | CHAR     | AMS    | PLANNED, IN_PROGRESS, COMPLETED           |

### Sheet: Shutdown Work Packages

| #   | Campo                                         | Tipo | Origen | Descripcion                    |
| --- | --------------------------------------------- | ---- | ------ | ------------------------------ |
| 1   | `shutdown_id`                               | CHAR | AMS    | Referencia a la parada         |
| 2   | `wp_code`                                   | CHAR | AMS    | Código paquete trabajo parada |
| 3-4 | `equipment_tag`, `sap_func_loc`           | --   | --     | Equipo intervenido             |
| 5   | `description`                               | CHAR | AMS    | Trabajo a ejecutar             |
| 6   | `estimated_hours`                           | NUM  | AMS    | Horas estimadas                |
| 7-9 | `work_center`, `specialty`, `crew_size` | --   | BP/AMS | Recursos asignados             |
| 10  | `materials_required`                        | CHAR | AMS    | Si requiere materiales: Si/No  |

---

## 09_workforce.xlsx

### Sheet: Workforce

| #     | Campo                               | Tipo    | Origen | Descripcion                                          | Por qué este nombre                                          |
| ----- | ----------------------------------- | ------- | ------ | ---------------------------------------------------- | ------------------------------------------------------------- |
| 1     | `worker_id`                       | CHAR    | AMS    | ID trabajador: S26-W-NNN                             | Sintético, prefijo S26.                                      |
| 2     | `name`                            | CHAR    | AMS    | Nombre completo del trabajador                       | Datos ficticios (nombres chilenos).                           |
| 3     | `specialty`                       | CHAR(3) | BP     | Especialidad: MEC, ELE, INS, SOL, LUB, SIN, DCS, SUP | Código del Blueprint (posiciones 4-6 del puesto de trabajo). |
| 4     | `specialty_level`                 | CHAR    | AMS    | Nivel: I, II, III, Supervisor                        | Categorización interna AMSA.                                 |
| 5     | `labor_category`                  | CHAR    | AMS    | Categoría laboral: MEC-II, ELE-III, SUP, etc.       | Combinación especialidad-nivel para tarificación.           |
| 6     | `rate_usd_hr`                     | NUM     | AMS    | Tarifa hora en USD                                   | Costo estándar AMSA por categoría.                          |
| 7     | `shift_code`                      | CHAR    | BP     | Código turno: 7X7                                   | Blueprint Tabla 10.                                           |
| 8     | `shift_desc`                      | CHAR    | BP     | Descripción: Turno 7x7 Planta (Viernes-Jueves)      | Blueprint Tabla 10.                                           |
| 9-10  | `shift_start`, `shift_end`      | TIME    | BP     | 08:00, 20:00                                         | Blueprint Tabla 10.                                           |
| 11    | `shift_rotation`                  | CHAR    | BP     | Viernes a Jueves                                     | Patrón de rotación Blueprint.                               |
| 12    | `plant_id`                        | CHAR    | AMS    | Planta asignada                                      |                                                               |
| 13-14 | `planning_group`, `work_center` | --      | BP     | Asignación organizacional                           |                                                               |
| 15    | `available`                       | BOOL    | AMS    | Disponibilidad actual                                |                                                               |
| 16    | `certifications_csv`              | CHAR    | AMS    | Certificaciones separadas por coma                   | Competencias del trabajador.                                  |
| 17-18 | `phone`, `email`                | CHAR    | AMS    | Datos de contacto ficticios                          |                                                               |

---

## 10_field_capture.xlsx

### Sheet: Field Captures

| #   | Campo                               | Tipo     | Origen | Descripcion                                        |
| --- | ----------------------------------- | -------- | ------ | -------------------------------------------------- |
| 1   | `capture_id`                      | CHAR     | AMS    | ID captura: S26-FC-NNNN                            |
| 2   | `worker_id`                       | CHAR     | AMS    | Referencia al trabajador                           |
| 3   | `capture_type`                    | CHAR     | AMS    | VOICE o TEXT. Tipo de captura de campo.            |
| 4   | `language`                        | CHAR     | AMS    | Idioma: es (español)                              |
| 5-6 | `equipment_tag`, `sap_func_loc` | --       | --     | Equipo reportado                                   |
| 7   | `location_hint`                   | CHAR     | AMS    | Pista de ubicación física (Nivel 0/1/2/3, área) |
| 8   | `raw_text`                        | CHAR     | AMS    | Texto crudo de la observación del técnico        |
| 9   | `timestamp`                       | DATETIME | AMS    | Fecha y hora de la captura                         |
| 10  | `area`                            | CHAR     | AMS    | Área de proceso                                   |
| 11  | `severity`                        | CHAR     | AMS    | LOW, MEDIUM, HIGH, CRITICAL. Severidad estimada.   |

---

## 11_work_centers.xlsx

### Sheet: Work Centers (CINI_PM_001)

| #     | Campo                                                              | Tipo    | Origen | Descripcion                                                     | Por qué este nombre                                                                |
| ----- | ------------------------------------------------------------------ | ------- | ------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1     | `work_center_code`                                               | CHAR(8) | BP     | Código puesto trabajo (ej: PASMEC01)                           | Blueprint Tablas 7-9. 8 caracteres.                                                 |
| 2     | `description`                                                    | CHAR    | AMS    | Descripción del puesto                                         | Texto expandido del código.                                                        |
| 3     | `wc_type`                                                        | CHAR    | BP     | INT (interno) o EXT (externo)                                   | Blueprint distingue puestos internos (Tabla 7) y externos (Tabla 8).                |
| 4     | `operation_type`                                                 | CHAR(1) | BP     | P=Planta, M=Mina                                                | Posición 1 del código de puesto de trabajo.                                       |
| 5     | `area_code`                                                      | CHAR(2) | BP     | AS, AR, AH, PC, TA, PR, SH, EXT                                 | Posiciones 2-3: área de asignación. AS=Area Seca, AR=Area Ripio, AH=Area Húmeda. |
| 6     | `specialty`                                                      | CHAR(3) | BP     | MEC, ELE, INS, LUB, SIN, DCS, EDI, SOL, LAV, NEU, CAB, SCI, GET | Posiciones 4-6: especialidad.                                                       |
| 7-8   | `planning_group`, `business_area`                              | --      | BP     | Asignación organizacional                                      |                                                                                     |
| 9     | `planning_center`                                                | CHAR(4) | BP     | AN01                                                            |                                                                                     |
| 10    | `cost_center`                                                    | CHAR    | AMS    | Centro de costo asignado al puesto                              | Integración CO. Ej: CC-PL-MEC-SEC.                                                 |
| 11    | `activity_type`                                                  | CHAR    | BP     | Tipo de actividad: ZMANT001 o ZMANT003                          | Blueprint. ZMANT001=interno, ZMANT003=externo.                                      |
| 12    | `capacity_hours_day`                                             | NUM     | BP     | Horas efectivas por día: 11                                    | 12h turno - 1h break = 11h efectivas (Blueprint).                                   |
| 13    | `capacity_utilization_pct`                                       | NUM     | AMS    | Porcentaje utilización capacidad                               | Factor de productividad estándar.                                                  |
| 14-17 | `shift_code`, `shift_start`, `shift_end`, `shift_rotation` | --      | BP     | Turno asignado (Blueprint Tabla 10)                             |                                                                                     |

### Sheet: Supervisor Work Centers (Blueprint Tablas 32-33)

| #   | Campo                                   | Tipo    | Origen | Descripcion                                                                                  |
| --- | --------------------------------------- | ------- | ------ | -------------------------------------------------------------------------------------------- |
| 1   | `supervisor_wc_code`                  | CHAR(7) | BP     | Código supervisor: SPASMEC, SPAHELE, etc. Formato 7 chars, S+operación+área+especialidad. |
| 2   | `description`                         | CHAR    | AMS    | Descripción del puesto supervisor                                                           |
| 3-4 | `planning_group`, `planning_center` | --      | BP     | Asignación                                                                                  |
| 5   | `reports_to`                          | CHAR    | AMS    | Superior jerárquico                                                                         |
| 6   | `supervised_wcs_csv`                  | CHAR    | AMS    | Puestos supervisados, separados por coma                                                     |

### Sheet: Naming Convention (Blueprint Tablas 7-8)

Documenta la regla de construcción de los códigos de 8 caracteres.

### Sheet: Shift Schedules (Blueprint Tabla 10)

Documenta los 3 patrones de turno: 4X3, 7X7-M, 7X7-P.

---

## 12_planning_kpi_input.xlsx

### Sheet: Planning KPI Input

| #     | Campo                                                  | Tipo | Origen | Descripcion                                                              |
| ----- | ------------------------------------------------------ | ---- | ------ | ------------------------------------------------------------------------ |
| 1-3   | `plant_id`, `planning_group`, `business_area`    | --   | BP     | Segmentación organizacional. "ALL" = resumen planta completa.           |
| 4-5   | `period_start`, `period_end`                       | DATE | AMS    | Período semanal de medición                                            |
| 6-7   | `wo_planned`, `wo_completed`                       | INT  | AMS    | OTs planificadas vs. completadas.`wo` = Work Order.                    |
| 8-9   | `manhours_planned`, `manhours_actual`              | NUM  | AMS    | Horas-hombre planificadas vs. reales                                     |
| 10-11 | `pm_planned`, `pm_executed`                        | INT  | AMS    | Preventivos planificados vs. ejecutados.`pm` = Preventive Maintenance. |
| 12    | `backlog_hours`                                      | NUM  | AMS    | Horas acumuladas de trabajos pendientes                                  |
| 13    | `weekly_capacity_hours`                              | NUM  | AMS    | Capacidad semanal disponible en horas                                    |
| 14    | `corrective_count`                                   | INT  | AMS    | Cantidad de OTs correctivas en el período                               |
| 15    | `total_wo`                                           | INT  | AMS    | Total OTs en el período                                                 |
| 16    | `schedule_compliance_pct`                            | NUM  | AMS    | Cumplimiento de programa (%). Sufijo `_pct` = porcentaje.              |
| 17    | `release_horizon_days`                               | INT  | AMS    | Horizonte de liberación de OTs en días                                 |
| 18-19 | `pending_notices`, `total_notices`                 | INT  | AMS    | Avisos pendientes vs. total                                              |
| 20-21 | `scheduled_capacity_hours`, `total_capacity_hours` | NUM  | AMS    | Capacidad programada vs. total disponible                                |
| 22-23 | `proactive_wo`, `planned_wo`                       | INT  | AMS    | OTs proactivas (preventivo+predictivo) vs. planificadas                  |

---

## 13_de_kpi_input.xlsx

### Sheet: DE KPI Input

| #     | Campo                                                          | Tipo | Origen | Descripcion                                                    |
| ----- | -------------------------------------------------------------- | ---- | ------ | -------------------------------------------------------------- |
| 1-5   | (mismos que 12)                                                | --   | --     | Segmentación y período                                       |
| 6-7   | `events_reported`, `events_required`                       | INT  | AMS    | Eventos DE reportados vs. requeridos. DE = Defect Elimination. |
| 8-9   | `meetings_held`, `meetings_required`                       | INT  | AMS    | Reuniones DE realizadas vs. requeridas                         |
| 10-11 | `actions_implemented`, `actions_planned`                   | INT  | AMS    | Acciones DE implementadas vs. planificadas                     |
| 12-13 | `savings_achieved_usd`, `savings_target_usd`               | NUM  | AMS    | Ahorros logrados vs. meta en USD                               |
| 14-15 | `failures_current_period`, `failures_previous_period`      | INT  | AMS    | Fallas período actual vs. anterior (tendencia)                |
| 16-17 | `chronic_failures_identified`, `chronic_failures_resolved` | INT  | AMS    | Fallas crónicas identificadas vs. resueltas                   |
| 18    | `de_maturity_score`                                          | NUM  | AMS    | Puntaje de madurez del programa DE (escala 1-5)                |

---

## 14_maintenance_strategy.xlsx

### Sheet: Strategies

| #     | Campo                                                      | Tipo     | Origen | Descripcion                                 |
| ----- | ---------------------------------------------------------- | -------- | ------ | ------------------------------------------- |
| 1     | `strategy_id`                                            | CHAR     | AMS    | ID estrategia: S26-STR-NNNN-HASH            |
| 2-5   | `equipment_tag`, `equnr`, `sap_func_loc`, `area`   | --       | --     | Identificadores equipo                      |
| 6-7   | `subunit`, `maintainable_item`                         | CHAR     | RCM    | Subunidad y componente mantenible           |
| 8     | `function_and_failure`                                   | CHAR     | RCM    | Resumen función-falla                      |
| 9-10  | `mechanism`, `cause`                                   | CHAR     | RCM    | Mecanismo y causa de falla                  |
| 11    | `status`                                                 | CHAR     | AMS    | APPROVED                                    |
| 12    | `tactics_type`                                           | CHAR     | BP/RCM | TIME_BASED, ACTIVITY_BASED, CONDITION_BASED |
| 13-14 | `primary_task_name`, `primary_task_interval_weeks`     | CHAR/INT | AMS    | Tarea primaria y su frecuencia              |
| 15-16 | `constraint`, `task_type`                              | CHAR     | AMS    | Restricción y tipo de tarea                |
| 17    | `route_sheet_type`                                       | CHAR     | BP     | Tipo A                                      |
| 18    | `access_time_hours`                                      | NUM      | AMS    | Tiempo de acceso                            |
| 19-20 | `secondary_task_name`, `secondary_task_interval_weeks` | CHAR/INT | AMS    | Tarea secundaria (fallback)                 |
| 21    | `maint_plan_type`                                        | CHAR     | BP     | PM                                          |
| 22    | `budgeted_cost_usd`                                      | NUM      | AMS    | Costo presupuestado                         |
| 23-25 | `justification_category`, `justification`, `notes`   | CHAR     | RCM    | Justificación RCM de la estrategia         |

---

## 15_catalog_profiles.xlsx

### Sheet: Catalogs (Blueprint Tabla 22)

| #   | Campo                               | Tipo | Origen | Descripcion                                                                              |
| --- | ----------------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------- |
| 1   | `catalog_type`                    | CHAR | BP     | Tipo catálogo SAP: D (Codificación), B (Parte objeto), C (Síntomas/Daño), 5 (Causas) |
| 2   | `catalog_type_desc`               | CHAR | BP     | Descripción del tipo de catálogo                                                       |
| 3-4 | `code_group`, `code_group_desc` | CHAR | BP     | Grupo de código y su descripción (ej: D-M001, B-MEC, C-ELE, 5-OPE)                     |
| 5-6 | `code`, `code_desc`             | CHAR | BP     | Código individual y descripción (ej: M001=Solicitud de mantenimiento)                  |
| 7   | `applicable_to`                   | CHAR | BP     | Tipos de aviso donde aplica: A1, A2, A3                                                  |

### Sheet: Catalog Profiles (Blueprint Tabla 23)

| #   | Campo                                                                                  | Tipo | Origen | Descripcion                                                             |
| --- | -------------------------------------------------------------------------------------- | ---- | ------ | ----------------------------------------------------------------------- |
| 1-2 | `profile_id`, `profile_desc`                                                       | CHAR | AMS    | ID y descripción del perfil (PRF-MEC, PRF-ELE, etc.)                   |
| 3   | `applicable_fl_level`                                                                | CHAR | BP     | Niveles TOS aplicables: "5,6". Blueprint dice nivel 5 con herencia a 6. |
| 4   | `applicable_notification_type`                                                       | CHAR | BP     | Tipo aviso: A1, A2                                                      |
| 5-8 | `catalog_D_groups`, `catalog_B_groups`, `catalog_C_groups`, `catalog_5_groups` | CHAR | BP     | Grupos de cada tipo de catálogo asignados al perfil                    |

### Sheet: Profile Assignments

Asigna perfiles de catálogo a equipos específicos.

---

## 16_route_sheets.xlsx (CINI_PM_005/006)

### Sheet: Route Sheets

| #     | Campo                                                                      | Tipo    | Origen | Descripcion                                                                |
| ----- | -------------------------------------------------------------------------- | ------- | ------ | -------------------------------------------------------------------------- |
| 1     | `route_sheet_id`                                                         | CHAR    | AMS    | ID hoja de ruta: S26-RS-NNNN-HASH                                          |
| 2     | `route_sheet_type`                                                       | CHAR    | BP     | Tipo: A (Instrucción mantenimiento). Blueprint Tabla 34.                  |
| 3     | `route_sheet_group`                                                      | CHAR    | BP     | Grupo: PLA (Planta). Blueprint Tabla 35.                                   |
| 4-6   | `equipment_tag`, `sap_func_loc`, `description`                       | --      | --     | Equipo y descripción                                                      |
| 7     | `operation_number`                                                       | INT     | SAP    | Número de operación: 10, 20, 30... (incrementos de 10, convención SAP)  |
| 8     | `operation_desc`                                                         | CHAR    | AMS    | Descripción de la operación                                              |
| 9     | `work_center`                                                            | CHAR(8) | BP     | Puesto de trabajo para esta operación                                     |
| 10-11 | `duration_hours`, `number_workers`                                     | NUM/INT | AMS    | Duración y dotación por operación                                       |
| 12    | `unit_of_measure`                                                        | CHAR    | SAP    | H (horas)                                                                  |
| 13-14 | `sub_operation_number`, `sub_operation_desc`                           | CHAR    | SAP    | Sub-operación (ej: 10.1). Detalle dentro de la operación.                |
| 15-18 | `material_number`, `material_desc`, `material_qty`, `material_uom` | --      | SAP/MM | Materiales asignados a la operación (integración MM)                     |
| 19-20 | `dms_document_id`, `dms_document_desc`                                 | CHAR    | BP     | Link a documento DMS/MAF (CINI_PM_008)                                     |
| 21-22 | `is_standard_job`, `standard_job_id`                                   | CHAR    | SAP    | Si es standard job y su ID. Standard jobs son hojas de ruta reutilizables. |

---

## 17_maintenance_plans.xlsx (CINI_PM_007)

### Sheet: Maintenance Plans

| #   | Campo                                   | Tipo     | Origen | Descripcion                                                                      |
| --- | --------------------------------------- | -------- | ------ | -------------------------------------------------------------------------------- |
| 1   | `plan_number`                         | CHAR     | SAP    | Número plan: MP-NNNNNN. Corresponde a SAP MANUM/MPLANR.                         |
| 2   | `plan_type`                           | CHAR     | BP     | Tipo: PM. Blueprint Tabla 37.                                                    |
| 3   | `description`                         | CHAR(72) | SAP    | Descripción (máx 72 chars)                                                     |
| 4-5 | `planning_center`, `planning_group` | --       | BP     | Asignación organizacional                                                       |
| 6   | `strategy_type`                       | CHAR     | BP     | TIME_BASED o ACTIVITY_BASED. Blueprint Tabla 36.                                 |
| 7   | `call_horizon_pct`                    | INT      | SAP    | Horizonte de llamada en %. SAP usa esto para generar órdenes con anticipación. |
| 8   | `scheduling_period_months`            | INT      | SAP    | Período de programación en meses                                               |
| 9   | `start_date`                          | DATE     | AMS    | Fecha inicio del plan                                                            |
| 10  | `status`                              | CHAR     | AMS    | ACTIVO                                                                           |

### Sheet: Plan Positions

| #   | Campo                               | Tipo     | Origen | Descripcion                                                         |
| --- | ----------------------------------- | -------- | ------ | ------------------------------------------------------------------- |
| 1   | `plan_number`                     | CHAR     | SAP    | Referencia al plan                                                  |
| 2   | `position_number`                 | INT      | SAP    | Número de posición: 10, 20, 30... (convención SAP incremento 10) |
| 3-4 | `equipment_tag`, `sap_func_loc` | --       | --     | Objeto de llamada                                                   |
| 5   | `route_sheet_id`                  | CHAR     | AMS    | Referencia a hoja de ruta (enlace con 16)                           |
| 6-7 | `cycle_value`, `cycle_unit`     | NUM/CHAR | SAP    | Ciclo: valor + unidad (WEEKS u HOURS)                               |
| 8   | `task_description`                | CHAR(72) | AMS    | Descripción de la tarea                                            |
| 9   | `work_center`                     | CHAR(8)  | BP     | Puesto ejecutor                                                     |
| 10  | `offset_days`                     | INT      | SAP    | Desfase en días entre posiciones                                   |
| 11  | `call_object_type`                | CHAR     | SAP    | Tipo objeto llamada: EQUIPMENT                                      |

---

## 18_dms_maf_documents.xlsx (CINI_PM_008)

### Sheet: DMS MAF Documents

| #     | Campo                                                  | Tipo     | Origen | Descripcion                                                                                          |
| ----- | ------------------------------------------------------ | -------- | ------ | ---------------------------------------------------------------------------------------------------- |
| 1     | `document_id`                                        | CHAR     | AMS    | ID documento: DMS-TIPO-EQUIPO-NN                                                                     |
| 2     | `document_type`                                      | CHAR     | BP     | MAF (Guía mantenimiento), PROC, CHECK, PLANO, MANUAL, RISK                                          |
| 3     | `document_desc`                                      | CHAR(72) | AMS    | Descripción del documento                                                                           |
| 4     | `version`                                            | CHAR     | AMS    | Revisión: Rev 0, Rev 1, Rev A, etc.                                                                 |
| 5     | `status`                                             | CHAR     | AMS    | APROBADO                                                                                             |
| 6     | `language`                                           | CHAR     | AMS    | ES (español)                                                                                        |
| 7-8   | `linked_equipment_tag`, `linked_func_loc`          | --       | --     | Equipo vinculado                                                                                     |
| 9-10  | `linked_route_sheet_id`, `linked_operation_number` | CHAR/INT | BP     | Enlace a hoja de ruta y operación específica. Blueprint indica que MAFs se vinculan a operaciones. |
| 11-13 | `file_name`, `file_format`, `file_size_kb`       | CHAR     | AMS    | Metadatos del archivo físico                                                                        |
| 14    | `author`                                             | CHAR     | AMS    | Autor/responsable                                                                                    |
| 15-16 | `creation_date`, `last_review_date`                | DATE     | AMS    | Fechas de gestión documental                                                                        |
| 17    | `review_frequency_months`                            | INT      | AMS    | Frecuencia de revisión obligatoria                                                                  |
| 18    | `responsible_area`                                   | CHAR     | AMS    | Área responsable del documento                                                                      |

---

## 19_classification.xlsx (CINI_PM_011)

### Sheet: Classes

| #   | Campo                           | Tipo | Origen | Descripcion                                                                           |
| --- | ------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------- |
| 1   | `class_name`                  | CHAR | SAP    | Nombre clase: ZCL_CHANCADOR, ZCL_MOLINO_SAG, etc. Prefijo Z = custom SAP. CL = Class. |
| 2   | `class_type`                  | CHAR | SAP    | 002 = Clase para equipos, 003 = Clase para ubicaciones técnicas                      |
| 3-4 | `class_desc`, `class_group` | CHAR | AMS    | Descripción y agrupación                                                            |
| 5   | `applicable_object_type`      | CHAR | SAP    | EQUIPMENT o FUNC_LOC                                                                  |
| 6   | `status`                      | CHAR | AMS    | ACTIVO                                                                                |

### Sheet: Characteristics

| #   | Campo                                   | Tipo     | Origen | Descripcion                                                               |
| --- | --------------------------------------- | -------- | ------ | ------------------------------------------------------------------------- |
| 1   | `characteristic_name`                 | CHAR     | SAP    | Nombre: ZCAR_POTENCIA, ZCAR_PESO, etc. Z = custom, CAR = Característica. |
| 2-3 | `characteristic_desc`, `data_type`  | CHAR     | SAP    | Descripción y tipo (NUM, CHAR)                                           |
| 4-5 | `unit_of_measure`, `decimal_places` | CHAR/INT | SAP    | Unidad y precisión                                                       |
| 6   | `value_list`                          | CHAR     | SAP    | Lista de valores permitidos (para tipo CHAR)                              |
| 7   | `applicable_classes`                  | CHAR     | AMS    | Clases donde se usa esta característica                                  |

### Sheet: Classification Assignments

Asigna equipos a clases con valores de características.

---

## 20_financial_assignments.xlsx

### Sheet: Cost Centers (Integración CO)

| #   | Campo                                                    | Tipo | Origen | Descripcion                                                              |
| --- | -------------------------------------------------------- | ---- | ------ | ------------------------------------------------------------------------ |
| 1   | `cost_center`                                          | CHAR | SAP/BP | Centro de costo: CC-PL-MEC-SEC = Centro Costo Planta Mecánico Area Seca |
| 2-7 | Descripción, empresa, área, grupo, responsable, status | --   | AMS    | Datos del centro de costo                                                |

### Sheet: PEP WBS Elements (Integración PS)

| #   | Campo                                                          | Tipo | Origen | Descripcion                                                                                                     |
| --- | -------------------------------------------------------------- | ---- | ------ | --------------------------------------------------------------------------------------------------------------- |
| 1   | `pep_element`                                                | CHAR | SAP/BP | Elemento PEP (Plan Estructura Proyecto). Blueprint indica que se cargan en objetos técnicos para liquidación. |
| 2-3 | `pep_desc`, `project_id`                                   | CHAR | AMS    | Descripción y proyecto asociado                                                                                |
| 4-8 | Equipo, ubicación, área, tipo liquidación, receptor, status | --   | --     | Asignación y regla de liquidación                                                                             |

### Sheet: Fixed Assets (Integración FI-AA)

Activos fijos vinculados a equipos con datos de adquisición y depreciación.

### Sheet: Settlement Rules

| #   | Campo                                                    | Tipo | Origen | Descripcion                                                |
| --- | -------------------------------------------------------- | ---- | ------ | ---------------------------------------------------------- |
| 1   | `order_type`                                           | CHAR | BP     | PM01-PM07. Cada tipo tiene su regla de liquidación.       |
| 2-6 | Regla, tipo receptor, receptor, porcentaje, descripción | --   | BP     | PM01/02/03/07 liquidan a centro costo; PM06 liquida a PEP. |

---

## 21_configuration_points.xlsx

### Sheet: Configuration Points (CONF_PM_001 a CONF_PM_058)

| #   | Campo                             | Tipo | Origen | Descripcion                                                           |
| --- | --------------------------------- | ---- | ------ | --------------------------------------------------------------------- |
| 1   | `config_id`                     | CHAR | BP     | CONF_PM_001 a CONF_PM_058. 58 puntos de configuración del Blueprint. |
| 2   | `config_desc`                   | CHAR | BP     | Descripción de qué se configura                                     |
| 3   | `sap_transaction`               | CHAR | SAP    | Transacción SAP: SPRO (customizing)                                  |
| 4   | `config_value`                  | CHAR | BP     | Valor configurado según Blueprint                                    |
| 5-8 | Status, responsable, fecha, notas | --   | AMS    | Control de implementación                                            |

---

## 22_org_structure_config.xlsx

### Sheet: Structure Indicators (Blueprint Tablas 11-13)

Documenta las máscaras CORPO (AAAA-AAA) y MANTE (NN-NN-NN-AAAANN-XXXX-XXXX) con la definición de cada nivel.

### Sheet: Number Ranges (Blueprint Tablas 16, 18, 21, 27)

Rangos de numeración para equipos, puntos de medida, avisos y órdenes.

### Sheet: Installation Status (Blueprint Tabla 31)

| #   | Campo                               | Tipo    | Origen | Descripcion                                 |
| --- | ----------------------------------- | ------- | ------ | ------------------------------------------- |
| 1-2 | `equipment_tag`, `sap_func_loc` | --      | --     | Equipo                                      |
| 3   | `installation_status`             | CHAR(1) | BP     | 0=Detenido, 1=Operando. Blueprint Tabla 31. |
| 4   | `status_desc`                     | CHAR    | AMS    | Texto descriptivo                           |
| 5   | `last_change_date`                | DATE    | AMS    | Fecha último cambio de estado              |

### Sheet: Business Areas Complete (Blueprint Tabla 6)

Las 9 áreas de empresa del Blueprint (6 Mina + 3 Planta).

### Sheet: Planning Groups Complete (Blueprint Tabla 5)

Los 8 grupos de planificación del Blueprint (5 Mina + 3 Planta).

---

## Glosario de Abreviaturas SAP (Alemán → Español)

| Campo SAP  | Alemán                    | Español                    |
| ---------- | -------------------------- | --------------------------- |
| `AUFNR`  | Auftragsnummer             | Número de orden            |
| `AUART`  | Auftragsart                | Tipo de orden               |
| `EQUNR`  | Equipmentnummer            | Número de equipo           |
| `EQKTX`  | Equipment Kurztext         | Texto corto equipo          |
| `EQART`  | Equipmentart               | Tipo de equipo              |
| `TPLNR`  | Technischer Platz Nummer   | Número ubicación técnica |
| `PLTXT`  | Platz Text                 | Texto ubicación            |
| `HERST`  | Hersteller                 | Fabricante                  |
| `ABCKZ`  | ABC Kennzeichen            | Indicador ABC               |
| `ERDAT`  | Erstellungsdatum           | Fecha de creación          |
| `GSTRP`  | Geplanter Starttermin      | Inicio planificado          |
| `GLTRP`  | Geplanter Endtermin        | Fin planificado             |
| `IEDD`   | Iststart Datum             | Inicio real                 |
| `IEDT`   | Istende Datum              | Fin real                    |
| `PRIOKX` | Priorität Kennzeichen     | Indicador prioridad         |
| `ILART`  | Instandhaltungsmeldungsart | Tipo de aviso PM            |
| `QMNUM`  | Qualitätsmeldungsnummer   | Número de notificación    |
| `QMART`  | Qualitätsmeldungsart      | Tipo de notificación       |
| `ARBPL`  | Arbeitsplatz               | Puesto de trabajo           |
| `MATNR`  | Materialnummer             | Número de material         |
| `MAKTX`  | Materialtext               | Texto material              |
| `SERGE`  | Seriennummer               | Número de serie            |
| `STAT`   | Status                     | Estado                      |
| `MANUM`  | Maßnahmenummer            | Número plan mantenimiento  |

---

## Prefijos Customizados (Z = Custom SAP)

| Prefijo      | Tipo             | Significado                                                  |
| ------------ | ---------------- | ------------------------------------------------------------ |
| `ZMANT001` | Categoría valor | Mano de obra interna                                         |
| `ZMANT002` | Categoría valor | Materiales y repuestos                                       |
| `ZMANT003` | Categoría valor | Servicios externos                                           |
| `ZPM00001` | Esquema status   | Status usuario para avisos A1/A2                             |
| `ZCL_*`    | Clase            | Clase de clasificación custom (ej: ZCL_CHANCADOR)           |
| `ZCAR_*`   | Característica  | Característica de clasificación custom (ej: ZCAR_POTENCIA) |

---

## Prefijos Sintéticos (Trazabilidad)

| Prefijo      | Uso                 | Ejemplo           |
| ------------ | ------------------- | ----------------- |
| `S26-OT-`  | Órdenes de trabajo | S26-OT-0001-A3F2  |
| `S26-STR-` | Estrategias         | S26-STR-0001-B4C1 |
| `S26-RS-`  | Hojas de ruta       | S26-RS-0001-D2E3  |
| `S26-MAT-` | Materiales          | S26-MAT-0001      |
| `S26-W-`   | Trabajadores        | S26-W-001         |
| `S26-FC-`  | Capturas de campo   | S26-FC-0001       |

> El sufijo de 4 caracteres hexadecimales es un hash MD5 parcial calculado sobre
> `SYNTH2026-{prefijo}-{secuencial}` para garantizar unicidad y evitar colisiones
> con datos de producción durante el Gap Analysis.
