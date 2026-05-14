**Según la conversación, al final de la reunión el último tema relevante que se discutió fue la** **configuración de la capacidad (Horas-Hombre o HH)** **en el tablero de programación y la** **idea de automatización (solución ajencéntrica)** **propuesta por Jose.**

Aquí están los puntos más importantes que se querían lograr al final de la discusión:**1. Definición y Configuración de Capacidad (HH)**

Jorge explicó el proceso para definir la capacidad real de trabajo que debe mostrar el tablero**:**[1](https://support.google.com/meet/answer/16024610)

* **Horas Nominales vs. Efectivas:** **Se debe pasar de las Horas-Hombre (HH) nominales (ej. 12 horas de turno) a las** **Horas Efectivas** **(ej. 9 o 10 horas) restando tiempo de almuerzo y reuniones**. **Este valor debe ser editable (configurable)**.[1](https://support.google.com/meet/answer/16024610)
* **Porcentaje de Programación:** **Una vez definidas las horas efectivas, se debe parametrizar qué** **porcentaje de esa capacidad** **se va a programar (ej. 80% o 90%)**. **El porcentaje restante se debe dejar reservado para atender** **fallas o contingencias** **(trabajo correctivo)**.[1](https://support.google.com/meet/answer/16024610)

**Acción Requerida para ti (David Cabezas):** **Debes implementar un lugar donde se pueda configurar esta información (dentro de la OT, la sección de** *planning* **o programación) para que el tablero se alimente de ella**.**2. Solución Ajencéntrica (Automatización)**[1](https://support.google.com/meet/answer/16024610)

Jose propuso una solución automatizada para cuando el tablero muestre una sobrecarga de capacidad (recursos en rojo)**:**[1](https://support.google.com/meet/answer/16024610)

* **Sugerencia de Plan:** **En lugar de que el programador haga ajustes manuales, un** **agente de IA** **debería generar un "plan borrador" para balancear la carga (ej. 39 horas de 40 en el ámbito civil)**.[1](https://support.google.com/meet/answer/16024610)
* **Ajustes Automáticos:** **El agente debería priorizar Órdenes de Trabajo (OTs) y** **ajustar las fechas** **de aquellas que causan el exceso de capacidad**.[1](https://support.google.com/meet/answer/16024610)
* **Solicitud de Aprobación:** **El agente presentaría este plan balanceado al programador para su** **aprobación** **("¿me aceptas el plan?")**. **Si se acepta, el sistema balancea todo automáticamente**.[1](https://support.google.com/meet/answer/16024610)

![1776344532806](image/Acutalizaciones/1776344532806.png)
La discusión más reciente se centró en los requerimientos finales para el tablero de programación, principalmente la configuración de la capacidad (Horas-Hombre o HH) y la propuesta de automatización del balance de carga (solución ajencéntrica).



Aquí están los detalles de lo último que se dijo sobre el programa:

Configuración de la Capacidad (Horas-Hombre o HH)

Horas Efectivas: Se debe configurar y hacer editable la cantidad de horas efectivas de trabajo que un empleado puede dedicar, restando tiempo de almuerzo, reuniones, etc., de las horas nominales de su turno (ej. de 12 horas nominales a 9 o 10 horas efectivas).1

Porcentaje de Programación: Una vez definidas las horas efectivas, se debe parametrizar qué porcentaje de esa capacidad se va a utilizar para el trabajo programado (ej. 80% o 90%). El porcentaje restante se reserva para atender fallas o contingencias (trabajo correctivo).1

Configuración de Calendario: La plataforma debe ser editable para configurar el calendario de turnos (día/noche o turnos de 8 horas) y sus horarios de inicio y término, ya que las dotaciones de día y noche no son parejas en minería.1

Solución Ajencéntrica (Automatización)

Jose Cortinat propuso implementar un agente de IA para que, cuando el tablero muestre una sobrecarga de capacidad (recursos en rojo), sugiera un plan borrador.1

Acción del Agente: El agente ajustaría automáticamente el plan, priorizando ciertas Órdenes de Trabajo (OTs) y ajustando las fechas de otras para balancear la carga (ej. a 39 horas de 40 en el ámbito civil).1

Aprobación: El agente presentaría su plan balanceado al programador para que este lo acepte y el sistema lo aplique automáticamente.1

Estado del Crédito API

Jose Cortinat también informó que quedan $155.77 USD disponibles del crédito de $200 USD que se cargó para el API.1



La vista a la que se refirieron al final es el **tablero gráfico de programación** (similar al que vieron en el video de Prometheus), y los últimos requerimientos se centraron en la visualización de la capacidad y la posibilidad de automatización.

Aquí está el resumen de los elementos clave de la vista que se discutieron:**Elementos de Visualización Requeridos*** **Orden de OTs:** Las Órdenes de Trabajo (OTs) que aparecen en el lateral izquierdo deben estar ordenadas por  **nivel de riesgo/impacto** , partiendo de las más críticas a las menos críticas.[1](https://support.google.com/meet/answer/16024610)

* **Filtro de Prioridad:** El tablero solo debe mostrar OTs con prioridad **P3 y P4** (las programables), excluyendo las P1 y P2 (que ve directamente el supervisor).[1](https://support.google.com/meet/answer/16024610)
* **Indicador de Capacidad (HH):** El tablero debe mostrar la capacidad disponible de **Horas-Hombre (HH)** por puesto de trabajo (ej. civil, eléctrico). Si se arrastran OTs que superan la capacidad nominal, el indicador debe mostrarse en **rojo** para alertar sobre la sobrecarga.[1](https://support.google.com/meet/answer/16024610)
* **Vista Detallada de OTs:** Debe existir la opción de **expandir o contraer** las Órdenes de Trabajo en el calendario para ver sus operaciones individuales (que tienen su propia HH), permitiendo trabajar con la OT completa o con sus operaciones.[1](https://support.google.com/meet/answer/16024610)
* **Vista de Turnos:** El calendario debe mostrar la diferencia entre los turnos de **día y noche** para reflejar que las dotaciones (personal) no son parejas en minería.[1](https://support.google.com/meet/answer/16024610)

**Configuración de la Capacidad (Data que alimenta la vista)**

Se necesita un lugar (que no existía en ese momento) para configurar estos parámetros que alimentan el tablero:* **Horas Efectivas:** El programador debe poder definir las **horas efectivas** de trabajo (ej. 9 o 10 horas) restando tiempo de almuerzo y reuniones a las horas nominales del turno (ej. 12 horas).[1](https://support.google.com/meet/answer/16024610)

* **Porcentaje de Programación:** Se debe parametrizar qué **porcentaje** de esas horas efectivas se va a programar (ej. 80%), dejando el resto (ej. 20%) para atender fallas o trabajo correctivo.[1](https://support.google.com/meet/answer/16024610)
* **Productividad (Opcional):** Se mencionó la posibilidad de incluir un tercer ajuste de **productividad** para considerar factores como traslados.[1](https://support.google.com/meet/answer/16024610)

**Automatización (Solución Ajencéntrica)**

Jose Cortinat propuso que el tablero debe incorporar un **agente de IA** para mejorar la gestión de la capacidad:[1](https://support.google.com/meet/answer/16024610)

* **Sugerencia de Plan Borrador:** En lugar de requerir que el programador ajuste manualmente la carga (cuando se ve el indicador en rojo), el agente debería **sugerir un plan borrador** para balancear las horas (ej. ajustar a 39 horas de 40 en el ámbito civil).[1](https://support.google.com/meet/answer/16024610)
* **Ajuste y Aprobación:** El agente priorizaría OTs y ajustaría sus fechas. Luego, le preguntaría al programador si **acepta el plan** para balancear el programa automáticamente. 

**Lo último que dijo Jose Cortinat en relación con el programa se puede dividir en la confirmación de la estrategia de diseño, los requerimientos de capacidad y la propuesta de automatización:****Diseño del Tablero de Programación*** **Replicar la Base:** **Jose le dijo a David que, como primera aproximación, la conclusión es** **replicar** **el tablero de programación de** **Prometheus** **(la vista que estaban viendo en el video), ya que esa debe ser la base para luego mejorarlo (ponerle "comida agéntica encima").**[1](https://support.google.com/meet/answer/16024610)

**Configuración y Ajustes de Capacidad (Horas-Hombre)**

Jose resumió los tres parámetros clave que deben ser configurables para alimentar al tablero con datos reales de capacidad:* **Horas Efectivas:** **Se deben definir las** **horas efectivas** **de trabajo restando tiempo de almuerzo, reuniones, etc., de las horas nominales del turno (ej. de 12 a 10 horas).**[1](https://support.google.com/meet/answer/16024610)

* **Porcentaje de Programación:** **Se debe parametrizar el** **porcentaje de esa capacidad efectiva** **que se destinará al trabajo programado (ej. 80%), reservando el resto (ej. 20%) para atender fallas o trabajo correctivo.**[1](https://support.google.com/meet/answer/16024610)
* **Ítem de Productividad:** **También se consideró un tercer ajuste opcional para aplicar un porcentaje de** **productividad** **(ej. 90%) para tener en cuenta factores como traslados o alistamiento de faena.**[1](https://support.google.com/meet/answer/16024610)

 **Solución Ajencéntrica (Automatización)** * **Jose insistió en su idea de que un** **agente de IA** **intervenga cuando el tablero muestre sobrecarga de capacidad.**[1](https://support.google.com/meet/answer/16024610)

* **El agente sugeriría automáticamente un** **plan borrador** **(balanceando la carga de OTs y ajustando fechas) y luego le preguntaría al programador si** **acepta el plan** **para aplicarlo.**[1](https://support.google.com/meet/answer/16024610)

 **Estado del Crédito API (Comunicación posterior)** * **En una comunicación de chat posterior, Jose también informó que quedan** **$155.77 USD** **disponibles del crédito de $200 USD que se cargó para el API.**[2](https://chat.google.com/dm/7PhkuSAAAAE/hven6gGS9lo/hven6gGS9lo)

Nuevo

**Lo último que dijo Jorge Alquinta se centró en la necesidad de incorporar la gestión de** **equipos de apoyo y herramientas especiales** **dentro de la vista de programación, ya que estos recursos también impactan la capacidad de ejecución de los trabajos.**

Sus puntos específicos fueron:* **Inclusión de Equipos de Apoyo:** **Es fundamental agregar la gestión de** **puentes grúa y grúas móviles** **(40/50 toneladas) en el tablero, ya que su disponibilidad es un factor limitante para ejecutar trabajos en paralelo**.[1](https://support.google.com/meet/answer/16024610)

* **Gestión de Capacidad Variable:** **Se debe dar al programador la opción de** **sumar (contar) grúas o equipos arrendados** **para que el sistema contabilice esas cantidades adicionales de recursos**.[1](https://support.google.com/meet/answer/16024610)
* **Bloqueo de Recursos Fuera de Servicio:** **Al igual que se ajusta el personal, el programador debe poder** **bloquear o desactivar** **equipos de apoyo o herramientas especiales que estén fuera de servicio (por fallas o mantención), para evitar que el tablero los muestre erróneamente como disponibles**.[1](https://support.google.com/meet/answer/16024610)


**Lo último que dijo Jose Cortinat se centró en perfeccionar la idea de la** **automatización del programa (solución ajencéntrica)** **y la estrategia de diseño del tablero, resumiendo los puntos clave de la configuración de capacidad.**

**1. Automatización con Contexto Libre (Agente de IA)**

Jose amplió su propuesta de que un agente de inteligencia artificial debería ayudar a optimizar el programa**.** **La idea es que, además de seguir las reglas del sistema, el programador pueda darle contexto adicional al agente mediante un**  **espacio de texto libre** **.** **Por ejemplo, el programador podría indicar al agente instrucciones específicas como "prioriza esta orden"**. **Esto permitiría que el agente entregue un programa optimizado y mucho más claro, utilizando tanto reglas estándar como el contexto proporcionado por el programador**.[1](https://support.google.com/meet/answer/16024610)

**2. Estrategia de Diseño del Tablero**

Jose concluyó que la mejor primera aproximación es **replicar** **el diseño del tablero de programación de** **Prometheus** **(la vista que estaban revisando)**. **Esto serviría como base simple y funcional que luego se podría mejorar con las funcionalidades de IA ("ponerle comida agéntica encima")**.[1](https://support.google.com/meet/answer/16024610)

**3. Prioridad en la Vista**

Reiteró que para el programador, la **Orden de Trabajo (OT) y sus operaciones** **son mucho más importantes que la vista de las personas, ya que la OT es el elemento que debe cerrarse**.[1](https://support.google.com/meet/answer/16024610)

**4. Configuración de Capacidad (Resumen)**

También confirmó la necesidad de tres parámetros configurables para calcular la capacidad de Horas-Hombre (HH) que el tablero debe mostrar:* **Horas Efectivas:** **Para definir las horas reales de trabajo (ej. 10 horas)**.[1](https://support.google.com/meet/answer/16024610)

* **Porcentaje de Programación:** **Para reservar un porcentaje (ej. 20%) para atender fallas o contingencias**.[1](https://support.google.com/meet/answer/16024610)
* **Factor de Productividad:** **Para ajustar las horas y contabilizar el tiempo perdido en traslados o alistamiento**.

  Sobre el video
  El proceso detallado en SAP tiene como objetivo registrar la salida de materiales (como aceites, filtros, llantas o baterías) para el mantenimiento de vehículos
* . La clave fundamental de este método es que no se utiliza la transacción estándar de reservas (MB21), sino que se crea un Aviso y Orden de Mantenimiento a través de la transacción IW21
* . Esto se hace específicamente para que cada repuesto y trabajo quede guardado permanentemente en la "hoja de vida" o historial técnico del vehículo
* .
* Antes de iniciar este flujo, es un requisito previo haber consultado la transacción MB52 para verificar que los materiales que se van a solicitar existan físicamente en el almacén
* .
* Aquí tienes el funcionamiento completo paso a paso:
* 1. Creación y Clasificación del Aviso (IW21) Se ingresa a la transacción IW21 para generar un aviso bajo la clase Z1
* . El sistema exige clasificar el trabajo ingresando uno de los siguientes textos, obligatoriamente en mayúsculas
* :
* MANTENIMIENTO PREVENTIVO: Exclusivo para cambios de aceite y filtros
* .
* MANTENIMIENTO CORRECTIVO: Para reparaciones mecánicas como motor, amortiguadores, rótulas, terminales o muñequines
* .
* CAMBIO DE LLANTAS
* .
* CAMBIO DE BATERIA
* .
* Regla de separación: Si a un mismo vehículo se le hará mantenimiento preventivo (aceite) y también un cambio de llantas, se deben generar dos avisos por separado, uno para cada categoría
* .
* 2. Llenado de Datos del Vehículo Una vez clasificado, se ingresa el número de equipo del vehículo y se presiona Enter
* . Se debe copiar el número de centro en los campos adyacentes (derecha e izquierda) y, utilizando la ayuda de búsqueda, seleccionar el "taller propio" correspondiente a la unidad a la que pertenece el autor del aviso
* . En la parte inferior, en el campo de texto, se debe escribir el nombre del conductor
* .
* 3. Generación de la Orden y Clave de Control Como este trabajo no es tercerizado, se pasa directamente a crear la orden de mantenimiento haciendo clic en el ícono de la hoja en blanco ("crear") y seleccionando "continuar"
* . En la sección de datos de cabecera, es obligatorio llenar el campo Clave de Control con el código PM01
* . Este código es crucial porque le indica a SAP que el trabajo se realizará en un taller propio y que los materiales se tomarán del almacén interno
* .
* 4. Ingreso de Componentes (Repuestos) A continuación, se navega a la pestaña de "componentes"
* . Aquí se carga el número de cada material a utilizar
* . Si no se conoce el código exacto, se puede usar la ayuda de búsqueda (quitando el límite de 500 resultados) para buscar mediante palabras clave, como "15 W 40" para el aceite o "filtro de aceite ph8"
* . Por cada fila o componente ingresado, el sistema solicitará completar lo siguiente
* :
* Tipo de posición: Se debe indicar la letra L, que significa "posición de almacén"
* .
* Cantidad: El volumen a utilizar (por ejemplo, 7 cuartos de aceite)
* .
* Almacén: Indicar de qué almacén específico se va a retirar el producto
* .
* 5. Obtención de la Reserva y Cierre Una vez cargados todos los componentes, el usuario debe dirigirse a la pestaña de "datos generales", donde el sistema habrá generado automáticamente un número de reserva (en el ejemplo, el 70181)
* . Finalmente, se presiona el botón verde para ir hacia atrás, se libera la orden y se guarda
* .
* Este número de reserva es el entregable final del proceso, ya que con él se deberá ingresar posteriormente a otra transacción (MIGO) para registrar la salida física del material y entregarlo al mecánico
* .

  **El proceso detallado en SAP tiene como objetivo registrar la salida de materiales (como aceites, filtros, llantas o baterías) para el mantenimiento de vehículos**. La clave fundamental de este método es que  **no se utiliza la transacción estándar de reservas (**  **MB21**  **)** **, sino que se crea un Aviso y Orden de Mantenimiento a través de la transacción ****IW21**. Esto se hace específicamente para que cada repuesto y trabajo quede guardado permanentemente en la "hoja de vida" o historial técnico del vehículo**.**

  **Antes de iniciar este flujo, es un requisito previo haber consultado la transacción ****MB52** para verificar que los materiales que se van a solicitar existan físicamente en el almacén**.**

  **Aquí tienes el funcionamiento completo paso a paso:**

  **1. Creación y Clasificación del Aviso (**  **IW21** **)**Se ingresa a la transacción `IW21` para generar un aviso bajo la **clase ****Z1**. El sistema exige clasificar el trabajo ingresando uno de los siguientes textos, obligatoriamente en **mayúsculas**:

  * **MANTENIMIENTO PREVENTIVO:** Exclusivo para cambios de aceite y filtros**.**
  * **MANTENIMIENTO CORRECTIVO:** Para reparaciones mecánicas como motor, amortiguadores, rótulas, terminales o muñequines**.**
  * **CAMBIO DE LLANTAS**.
  * **CAMBIO DE BATERIA**.
  * *Regla de separación:* Si a un mismo vehículo se le hará mantenimiento preventivo (aceite) y también un cambio de llantas,  **se deben generar dos avisos por separado** **, uno para cada categoría**.

  **2. Llenado de Datos del Vehículo**Una vez clasificado, se ingresa el **número de equipo** del vehículo y se presiona Enter**. Se debe copiar el ****número de centro** en los campos adyacentes (derecha e izquierda) y, utilizando la ayuda de búsqueda, seleccionar el **"taller propio"** correspondiente a la unidad a la que pertenece el autor del aviso**. En la parte inferior, en el campo de texto, se debe escribir el ****nombre del conductor**.

  **3. Generación de la Orden y Clave de Control**Como este trabajo no es tercerizado, se pasa directamente a crear la orden de mantenimiento haciendo clic en el ícono de la hoja en blanco ("crear") y seleccionando "continuar"**. En la sección de datos de cabecera, es obligatorio llenar el campo ****Clave de Control** con el código **PM01**. Este código es crucial porque le indica a SAP que el trabajo se realizará en un taller propio y que los materiales se tomarán del almacén interno**.**

  **4. Ingreso de Componentes (Repuestos)**A continuación, se navega a la pestaña de **"componentes"**. Aquí se carga el número de cada material a utilizar**. Si no se conoce el código exacto, se puede usar la ayuda de búsqueda (quitando el límite de 500 resultados) para buscar mediante palabras clave, como "15 W 40" para el aceite o "filtro de aceite ph8"**. Por cada fila o componente ingresado, el sistema solicitará completar lo siguiente**:**

  * **Tipo de posición:** Se debe indicar la letra  **L** **, que significa "posición de almacén"**.
  * **Cantidad:** El volumen a utilizar (por ejemplo, 7 cuartos de aceite)**.**
  * **Almacén:** Indicar de qué almacén específico se va a retirar el producto**.**

  **5. Obtención de la Reserva y Cierre**Una vez cargados todos los componentes, el usuario debe dirigirse a la pestaña de  **"datos generales"** **, donde el sistema habrá generado automáticamente un ****número de reserva** (en el ejemplo, el 70181)**. Finalmente, se presiona el botón verde para ir hacia atrás, se ****libera** la orden y se **guarda**.

  **Este número de reserva es el entregable final del proceso, ya que con él se deberá ingresar posteriormente a otra transacción (** **MIGO** **) para registrar la salida física del material y entregarlo al mecánico**.

  NUEVO

  En este momento, están discutiendo los requerimientos clave para el tablero de programación (similar al que vieron en el video de Prometheus) y los errores urgentes que deben corregirse en la aplicación.
* 
* Aquí está el resumen de los puntos principales de la discusión:
* Diseño y Funcionalidad del Tablero de Programación
* Replicar Prometheus: La primera aproximación debe ser replicar la estructura del tablero de Prometheus por ser la base más funcional para el programador.
* Prioridad de la Vista: El tablero debe enfocarse en la Orden de Trabajo (OT) y sus operaciones más que en la vista de las personas, ya que la OT es el elemento que debe cerrarse.
* Vista por Días/Noche: El calendario debe mostrar la diferencia entre los turnos de día y noche, ya que las dotaciones (personal) en minería no son parejas (ej. 10 mecánicos de día, 2 de noche).
* Vista de Operaciones: Debe ser posible esconder o expandir las OTs para ver sus operaciones individuales (que también tienen su HH).
* Filtro/Vista de Tabla: Se debe considerar añadir una vista en formato tabla para que el programador pueda filtrar las OTs por priorización o área de proceso.
* Configuración de Capacidad de Horas-Hombre (HH)
* Horas Efectivas: La capacidad nominal (ej. 12 horas de turno) debe ajustarse a las horas efectivas (ej. 9 o 10 horas) restando tiempo de almuerzo y reuniones. Este valor debe ser editable.
* Porcentaje de Programación: Se debe parametrizar qué porcentaje de esa capacidad efectiva se programará (ej. 80%), reservando el porcentaje restante (ej. 20%) para atender fallas o trabajo correctivo.
* Factor de Productividad: Se puede incluir un tercer ajuste opcional de productividad (ej. 90%) para considerar el tiempo de traslados y alistamiento de faena.
* Propuesta de Automatización ("Solución Ajencéntrica")
* Agente de IA: Jose Cortinat propuso que un agente de IA debería intervenir cuando el tablero muestre sobrecarga de capacidad (recursos en rojo).
* Función: El agente debe sugerir un plan borrador optimizado para balancear la carga (ej. a 39 horas de 40 en el ámbito civil) y luego pedir la aprobación del programador.
* Contexto Libre: El programador debe poder darle contexto adicional al agente mediante un espacio de texto libre (ej. "prioriza esta orden") para que el programa sea más claro y optimizado.
* Gestión de Recursos de Apoyo (Jorge)
* Inclusión de Equipos: El tablero debe gestionar la capacidad de equipos de apoyo y herramientas especiales como puentes grúas y grúas móviles (40/50 toneladas), ya que limitan la ejecución de trabajos.
* Capacidad Variable: El programador debe poder sumar grúas o equipos arrendados para que el sistema contabilice recursos adicionales.
* Bloqueo de Recursos: El programador debe poder bloquear o desactivar equipos (grúas, herramientas) que estén fuera de servicio para que el tablero no los muestre erróneamente como disponibles.
* Errores y Discrepancias Identificadas
* Notificaciones Mal Ubicadas: Las 200 "notificaciones" (avisos) se están mostrando en la sección de "Planificación" cuando Jorge y Jose indican que deben verse solo en el apartado de "Identificación".
* Módulo "Capacidades" Antiguo: El módulo de "capacidades" es una parte antigua y debe ser eliminado.
* Proceso de Ejecución (Notificación)
* Están revisando el proceso de notificación (cierre de trabajo) en SAP (transacción IW41) y buscando una forma más dinámica, ya que el proceso actual es lento: requiere que el supervisor entre y salga repetidamente de la transacción por cada OT. El objetivo es que las OTs aparezcan en una bandeja en la sección de "Ejecución" para replicar la notificación de forma más amigable.

  **Los requerimientos más recientes que se discutieron al final de la reunión se centran en el flujo de estatus para la programación y la optimización del proceso de notificación (cierre de trabajo) en la etapa de ejecución.**

  **1. Flujo de Estatus Crítico para la Programación*** **Estatus "En Programación":** **Se reiteró que el programador debe cambiar el estatus de la Orden de Trabajo (OT)** **manualmente** **de "Planificado" a**  **"En Programación"** **.** **Este paso es esencial para que la OT se haga visible en el tablero de programación (drag-and-drop), confirmando que el programador ha revisado la OT para iniciar su proceso**.[1](https://support.google.com/meet/answer/16024610)

  * **Vista de Listado Necesaria:** **Se necesita una vista adicional en** **formato tabla** **para ver las OTs, lo que permitiría al programador hacer clic en ellas y ver el detalle completo. Esta vista es necesaria para el proceso de revisión y cambio de estatus a "En Programación"**.[1](https://support.google.com/meet/answer/16024610)

  **2. Optimización del Proceso de Ejecución y Notificación*** **Agilización del Cierre de Trabajo:** **El proceso actual de notificación en SAP (transacción IW41), que requiere que el supervisor entre y salga por cada OT para notificar el cierre, es demasiado lento**.[1](https://support.google.com/meet/answer/16024610)

  * **Nueva "Bandeja" de Ejecución:** **La solución en la aplicación debe ser más dinámica. Se busca que las OTs con estatus** **"En Ejecución"** **aparezcan en una "bandeja" en la sección de** **"Ejecución"** **para que el proceso de notificación y cierre sea más rápido y amigable**.[1](https://support.google.com/meet/answer/16024610)

  **3. Estrategia de Diseño del Tablero*** **Replicar Prometheus:** **La conclusión de Jose Cortinat es que la base del tablero de programación debe ser una**  **réplica del diseño de Prometheus** **, ya que es el formato más funcional para el programador.**[1](https://support.google.com/meet/answer/16024610)

  * **Foco en la OT:** **La vista del tablero debe priorizar la gestión de la** **Orden de Trabajo y sus operaciones** **sobre la vista de las personas, ya que la OT es el elemento que debe cerrarse**.[1](https://support.google.com/meet/answer/16024610)

  **Según la discusión con Jose Cortinat sobre los avances y la revisión del tablero de programación (Prometheus), los requerimientos de Jorge Alquinta se centran en varios aspectos clave de la plataforma: la configuración de la capacidad, la gestión de equipos de apoyo, la estructura del tablero y la corrección de errores en el flujo de estatus.**

  Aquí están los puntos principales que Jorge quiere que se hagan:**1. Requisitos para el Tablero de Programación (Vista)*** **Capacidad de Horas-Hombre (HH):** **El tablero debe mostrar las HH disponibles por puesto de trabajo (ej. mecánico, eléctrico)**.[1](https://support.google.com/meet/answer/16024610)

  * **Advertencias Visuales:** **El sistema debe indicar con un** **semáforo** **la capacidad**:[1](https://support.google.com/meet/answer/16024610)

    [2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)

    * **Rojo:** **Cuando la capacidad se ha sobrepasado (por ejemplo, más de 40 horas nominales)**. **Incluso, cuando la capacidad se sobrepasa, el sistema** **no debe permitir** **avanzar o sobrecargar el trabajo**.[1](https://support.google.com/meet/answer/16024610)

      [2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)
    * **Amarillo:** **Cuando todavía queda HH para programar**.[2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)
    * **Verde:** **Cuando se está cerca del límite (ej. 3-5% restante)**.[2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)
  * **Vista por Turnos:** **El calendario debe mostrar la diferencia entre los turnos de**  **día y noche** **, ya que las dotaciones en minería no son parejas (ej. 10 mecánicos de día, 2 de noche)**. **El tablero tiene que entender y leer esta diferencia**.[1](https://support.google.com/meet/answer/16024610)
  * **Jerarquía de Vista:** **La vista debe permitir** **esconder o minimizar** **la Orden de Trabajo (OT) completa, pero también debe dar la opción de** **expandirla** **para ver sus operaciones individuales (que también tienen sus HH)**.[1](https://support.google.com/meet/answer/16024610)
  * **Visión de Calendario:** **El programador debe poder elegir cómo ver su semana: de lunes a domingo o de miércoles a martes, ya que todavía hay minas que usan esa configuración**.[2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)

  2. Configuración y Balance de Capacidad

  Se debe crear un lugar donde se puedan configurar los siguientes parámetros para que el tablero lea la capacidad real**:**[1](https://support.google.com/meet/answer/16024610)

  [2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)

  * **Horas Efectivas:** **La cantidad de horas que una persona** **realmente trabaja** **(efectivas) debe ser editable (ej. 9 o 10 horas) para restar el tiempo de almuerzo, reuniones y aseo de las horas nominales del turno (ej. 12 horas)**.[1](https://support.google.com/meet/answer/16024610)

    [2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)
  * **Porcentaje Programable:** **El programador debe poder definir qué** **porcentaje** **de esas horas efectivas se programará (ej. 80%) y qué porcentaje se reservará para atender** **fallas o contingencias** **(ej. 20%)**.[1](https://support.google.com/meet/answer/16024610)

    [2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)
  * **Input de Dotación:** **El supervisor debe cargar en el sistema la información de la** **dotación real** **(gente en vacaciones, cursos, etc.) con al menos**  **tres semanas de anticipación** **.** **El programador debe poder modificar esta información de HH por semana**.[2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)
  * **Configuración de Horarios:** **La plataforma debe ser editable para configurar el** **horario de inicio y término** **del calendario, y si son turnos día/noche o ABC (turnos de 8 horas)**.[2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)

  3. Gestión de Recursos de Apoyo

  Se deben incluir y gestionar recursos no humanos en la vista de programación**:**[1](https://support.google.com/meet/answer/16024610)

  * **Inclusión de Equipos:** **Agregar la gestión de** **puentes grúa y grúas móviles** **(40/50 toneladas)**.[1](https://support.google.com/meet/answer/16024610)
  * **Capacidad Arrendada:** **El programador debe tener la opción de** **sumar (contar)** **grúas o equipos arrendados para que el sistema contabilice recursos adicionales**.[1](https://support.google.com/meet/answer/16024610)
  * **Bloqueo de Equipos:** **El programador debe poder** **bloquear o desactivar** **equipos de apoyo o herramientas que estén fuera de servicio (por falla o mantención) para que el tablero no los muestre erróneamente como disponibles**.[1](https://support.google.com/meet/answer/16024610)

  4. Flujo de Estatus y Ejecución* **Estatus "En Programación":** **Se necesita que el programador cambie el estatus de la OT** **manualmente** **de "Planificado" a** **"En Programación"** **antes de que la OT aparezca en el tablero (drag-and-drop)**.[2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)

  * **Optimización de Notificación (Ejecución):** **El proceso de notificación de cierre de trabajo (actualmente en SAP, transacción IW41) debe ser más dinámico. Las OTs con estatus "En Ejecución" deberían aparecer en una** **"bandeja"** **en la sección de** **"Ejecución"** **para que el supervisor pueda notificarlas (cerrarlas) de forma más amigable, sin tener que entrar y salir por cada OT**.[1](https://support.google.com/meet/answer/16024610)
  * **Vista de Listado:** **Se necesita una vista en** **formato tabla** **para ver las OTs (el listado), de forma que el programador pueda pinchar y ver el detalle completo de la OT**.[1](https://support.google.com/meet/answer/16024610)

  5. Corrección de Errores y Diseño de OT* **Botón "Cancel" / "Cerrar":** **El botón "Cancel" (rojo) que aparece en la OT en la etapa de Planificación debe ser quitado o renombrado a** **"Close"** **o "Cerrar"**. **En esta etapa, el planificador nunca cancelaría una OT, y el botón puede confundirse con cerrar la ventana, cancelando erróneamente la OT**.[1](https://support.google.com/meet/answer/16024610)

  [2](https://drive.google.com/open?id=16IpmmBwUslrYk1E2El8YrlnFlng1ska3rFVhIz_3I6g)

  * **Manejo de Operaciones:** **Cuando la IA sugiere las acciones (operaciones), el tiempo total estimado (ej. 6 horas) debe distribuirse entre las distintas operaciones. Además, la multiplicación de la cantidad de personas por las horas de trabajo ("duración por cantidad") debe calcular automáticamente las** **Horas-Hombre (HH)** **por operación**.[3](https://drive.google.com/open?id=1CHW8HvmrCRjzy-Qq_D67bYwYQ4YrWRMtakFS1nwzoPw)
  * **Priorización con IA:** **La plataforma debe incluir un** **ranking** **de prioridad para las OTs, basándose en la condición de los equipos, el riesgo (Paretos, Jack Knife, Monitoreo de Condición) y la confiabilidad, para que la IA pre-trabaje esa priorización**.[3
    ](https://drive.google.com/open?id=1CHW8HvmrCRjzy-Qq_D67bYwYQ4YrWRMtakFS1nwzoPw)

  **Los participantes están discutiendo la implementación de las vistas de** **Programación** **y** **Ejecución** **en la aplicación, utilizando el tablero de Prometheus como referencia base, y revisando errores en el flujo de trabajo y la gestión de la capacidad.**

  Aquí están los temas principales que se están hablando:**1. Tablero de Programación (Replicando Prometheus)**

  La conclusión principal es que David debe **replicar** **el diseño del tablero de Prometheus como primera aproximación, ya que es la estructura más funcional.*** **Estructura y Jerarquía:** **El tablero debe mostrar las Órdenes de Trabajo (OTs) en el lado izquierdo y el calendario a la derecha**.[1](https://support.google.com/meet/answer/16024610)

  * **La vista debe centrarse en la**  **OT y sus operaciones** **, ya que es lo que se necesita cerrar, no solo las personas**.[1](https://support.google.com/meet/answer/16024610)
  * **Debe ser posible** **esconder o expandir** **la OT para ver sus operaciones individuales (que tienen su propia HH)**. **Las OTs suelen tener 9 o 10 operaciones**.[1](https://support.google.com/meet/answer/16024610)
  * **Capacidad y Advertencias:**
    * **Muestra los** **puestos de trabajo** **(mecánico, eléctrico, civil) y la** **capacidad nominal** **(ej. 40 horas diarias)**.[1](https://support.google.com/meet/answer/16024610)
    * **Si se sobrepasa la capacidad, debe mostrarse en** **rojo** **(ej. 74 horas asignadas a civil)**.[1](https://support.google.com/meet/answer/16024610)
    * **Se puede ver la disponibilidad de recursos de manera general por puesto de trabajo o** **desplegar la lista de personas** **de ese puesto**.[1](https://support.google.com/meet/answer/16024610)
  * **Vista por Turnos:** **El tablero debe entender y leer los turnos de** **día y noche** **de minería, donde la dotación de personal no es pareja (ej. 10 mecánicos de día, solo 2 de noche)**.[1](https://support.google.com/meet/answer/16024610)
  * **Estatus de Ingreso:** **Jorge reitera que el programador debe cambiar el estatus de la OT** **manualmente** **a** **"En Programación"** **antes de que esta aparezca en el tablero de arrastre (drag-and-drop)**.[1](https://support.google.com/meet/answer/16024610)
  * **Vista de Listado:** **Es necesaria una vista en** **formato tabla** **(listado) donde el programador pueda ver las OTs, pinchar, ver el detalle y realizar acciones como el cambio de estatus**.[1](https://support.google.com/meet/answer/16024610)

  2. Configuración de Capacidad (Horas-Hombre - HH)

  Se discutió cómo parametrizar la capacidad real que muestra el tablero para evitar sobrecargar al personal:* **Ajustes Necesarios:** **Debe haber un lugar (en la OT, en la sección de** *planning* **o programación) donde se configuren tres ajustes**:[1](https://support.google.com/meet/answer/16024610)

  1. **Horas Efectivas:** **Pasar de las HH nominales (ej. 12 horas de turno) a las horas** **efectivas** **(ej. 10 horas) restando almuerzo, reuniones, etc.**.[1](https://support.google.com/meet/answer/16024610)
  2. **Porcentaje Programable:** **Definir qué** **porcentaje** **de esas horas efectivas se programará (ej. 80% o 90%), dejando el resto para**  **fallas o correctivos** **.**[1](https://support.google.com/meet/answer/16024610)
  3. **Factor de Productividad:** **Se mencionó la opción de un tercer ajuste de** **productividad** **(ej. 90%) para considerar traslados y alistamiento**.[1](https://support.google.com/meet/answer/16024610)
  4. Gestión de Recursos de Apoyo (Equipos)

  Jorge Alquinta enfatizó la necesidad de incluir la gestión de equipos especiales y herramientas en el tablero:* **Recursos Críticos:** **Agregar la gestión de** **puentes grúa y grúas móviles** **(40/50 toneladas), ya que son recursos limitantes**.[1](https://support.google.com/meet/answer/16024610)

  * **Capacidad Adicional:** **El programador debe poder** **sumar (contar)** **grúas o equipos arrendados para incrementar la capacidad**.[1](https://support.google.com/meet/answer/16024610)
  * **Bloqueo:** **Debe haber la opción de** **bloquear o desactivar** **equipos (grúas, herramientas) que estén fuera de servicio (por falla o mantención) para que no se muestren como disponibles**.[1](https://support.google.com/meet/answer/16024610)

  4. Propuesta de Automatización (Solución Ajencéntrica)

  Jose Cortinat insistió en la necesidad de un agente de IA que optimice el programa:* **Sugerencia de Plan:** **El agente debería sugerir un** **plan borrador** **cuando hay sobrecarga, balanceando la carga y ajustando fechas**.[1](https://support.google.com/meet/answer/16024610)

  * **Contexto Libre:** **El programador debe poder darle contexto adicional al agente mediante un espacio de texto libre (ej. "prioriza esta orden") para que el programa optimizado sea más claro**.[1](https://support.google.com/meet/answer/16024610)

  5. Errores y Discrepancias Identificadas

  Se identificaron errores que David debe corregir:* **Botón "Cancel":** **El botón rojo que dice "Cancel" en la OT debe ser cambiado a** **"Close"** **o "Cerrar", ya que en la etapa de planificación el planificador nunca cancelaría una OT y puede confundirse con cerrar la ventana**.[1](https://support.google.com/meet/answer/16024610)

  * **Salto Incorrecto de Estatus:** **En una prueba, al aprobar algo en el estatus "Pending" (Pendiente), el sistema saltó a** **"Planificación"** **en lugar de quedarse en** **"Identificación"** **(aprobado), lo cual es incorrecto**.[1](https://support.google.com/meet/answer/16024610)
  * **Actualización de Datos:** **Se observó que los datos no se actualizan inmediatamente (problema de** *refresh* **o memoria caché), y David tiene pendiente activar una funcionalidad para que los cambios de estatus se mantengan**.[1](https://support.google.com/meet/answer/16024610)

  **El usuario es David Cabezas. La respuesta debe ser directa.**

  **FINAL RESPONSE** **Los requerimientos más recientes se enfocaron en la implementación del tablero de programación, la gestión de la capacidad de trabajo y la corrección de errores críticos en el flujo de estatus.**

  **Tablero de Programación y Capacidad (Replicando Prometheus)** * **Diseño Base:** **Replicar la estructura del tablero de** **Prometheus** **como primera aproximación.**

  * **Vista y Jerarquía:** **Priorizar la vista de la**  **Orden de Trabajo (OT) y sus operaciones** **. Debe ser posible** **esconder o expandir** **la OT para ver sus operaciones individuales (9 a 10 operaciones).**
  * **Capacidad Visual:** **Mostrar la capacidad de** **Horas-Hombre (HH)** **por puesto de trabajo (ej. civil, eléctrico). Si se sobrepasa la capacidad nominal (ej. 40 horas), debe mostrarse en**  **rojo** **.**
  * **Vista de Turnos:** **El tablero debe entender y reflejar los turnos de** **día y noche** **para mostrar que las dotaciones de personal no son parejas en minería.**
  * **Configuración de Capacidad:**
    * **Se debe parametrizar la capacidad, pasando de horas nominales a** **horas efectivas** **(ej. 10 horas) restando tiempo no productivo.**
    * **Se debe definir el** **porcentaje** **de esas horas efectivas que se programará (ej. 80%), reservando el resto para fallas.**

  **Gestión de Recursos y Automatización*** **Recursos de Apoyo (Jorge):** **Incluir la gestión de** **puentes grúa y grúas móviles** **(40/50 toneladas). Debe ser posible** **sumar** **equipos arrendados y** **bloquear/desactivar** **equipos fuera de servicio.**

  * **Automatización Ajencéntrica (Jose):** **El agente de IA debe** **sugerir un plan borrador** **de programa para balancear la carga cuando se detecta sobrecapacidad, pidiendo luego la aprobación del programador.**

  **Flujo de Estatus y Ejecución*** **Estatus "En Programación":** **El programador debe cambiar el estatus a** **"En Programación" manualmente** **en una vista de** **listado (tabla)** **para que la OT sea visible en el tablero.**

  * **Optimización de Notificación:** **El proceso de notificación de cierre de trabajo (en la etapa de Ejecución) debe agilizarse. Las OTs con estatus "En Ejecución" deben aparecer en una** **"bandeja"** **para un cierre de trabajo más rápido, sin tener que entrar y salir por cada OT (como ocurre en la transacción IW41 de SAP).**

  **Errores Urgentes a Corregir*** **Botón "Cancel":** **El botón rojo de "Cancel" en la OT de la etapa de Planificación debe cambiarse a** **"Close"** **o eliminarse, ya que puede cancelar la OT erróneamente.**

  * **Salto de Estatus:** **Al aprobar una OT en estatus "Pending" (Pendiente), el sistema está saltando incorrectamente a** **"Planificación"** **en lugar de quedarse en el estatus de** **"Identificación"** **(Aprobado).**
  * **Actualización de Datos:** **David tiene pendiente** **activar una funcionalidad** **para corregir el problema de** *refresh* **que hace que los cambios de estatus no se actualicen de inmediato.**
  * **Búsqueda en Listado:** **La función de búsqueda debe permitir encontrar OTs usando el prefijo "OT".**

    Errores hay datos hardcodeados en español todavia

    

**Lo que Jose Cortinat está pidiendo se centra en tres áreas clave: la estrategia de diseño del tablero, la configuración de la capacidad de trabajo y la corrección de errores específicos en el flujo de la aplicación.**

**1. Estrategia y Diseño del Tablero*** **Replicar Prometheus:** **La conclusión es que David debe** **replicar** **el diseño del tablero de programación de Prometheus como primera aproximación, ya que es la estructura más funcional**.[1](https://support.google.com/meet/answer/16024610)

* **Foco en la OT:** **La vista del tablero debe centrarse en la** **Orden de Trabajo (OT) y sus operaciones** **y no primariamente en las personas, porque la OT es el elemento que se debe cerrar**.[1](https://support.google.com/meet/answer/16024610)
* **Vista de Listado:** **Es necesaria una vista en** **formato tabla** **para que el programador pueda ver el listado de OTs, ver el detalle, y realizar acciones como cambiar el estatus**.[1](https://support.google.com/meet/answer/16024610)

**2. Configuración de la Capacidad (Horas-Hombre)**

Jose confirmó que se necesitan tres parámetros configurables para determinar la capacidad real que muestra el tablero:* **Horas Efectivas:** **Configurar las horas que el personal** **realmente trabaja** **(efectivas) restando tiempo de almuerzo, reuniones, etc.**.[1](https://support.google.com/meet/answer/16024610)

* **Porcentaje de Programación:** **Parametrizar qué** **porcentaje** **de esas horas efectivas se programará (ej. 80%), reservando el resto para atender fallas**.[1](https://support.google.com/meet/answer/16024610)
* **Factor de Productividad:** **Incluir un ajuste opcional para el factor de** **productividad** **(ej. 90%) para considerar el tiempo de traslados o alistamiento**.[1](https://support.google.com/meet/answer/16024610)

**3. Automatización y Flujo de Estatus*** **Solución Ajencéntrica:** **Jose insistió en que un** **agente de IA** **debería intervenir cuando hay sobrecarga para** **sugerir un plan borrador** **de programa, ajustando las OTs y las fechas**.[1](https://support.google.com/meet/answer/16024610)

* **Contexto Libre:** **El programador debe poder darle** **contexto adicional** **al agente mediante un espacio de texto libre (ej. "prioriza esta orden") para que el programa optimizado sea más claro**.[1](https://support.google.com/meet/answer/16024610)
* **Flujo Programado:** **El botón de** **"Reservar"** **en el tablero debe cambiar el estatus de la OT** **automáticamente** **de "En Programación" a**  **"Programado"** **.**[1](https://support.google.com/meet/answer/16024610)

**4. Errores Críticos a Corregir*** **Botón "Cancel":** **El botón rojo de "Cancel" en la OT de la etapa de Planificación debe eliminarse o cambiarse a** **"Close"** **o "Cerrar", ya que un planificador no cancela OTs en esa etapa y confunde al usuario**.[1](https://support.google.com/meet/answer/16024610)

* **Actualización de Datos:** **David tiene pendiente** **activar una funcionalidad** **para que los cambios de estatus se actualicen en tiempo real, corrigiendo el problema de**  *refresh* **.**[1](https://support.google.com/meet/answer/16024610)
* **Búsqueda en Listado:** **La búsqueda de OTs en el listado debe funcionar incluso cuando se incluye el prefijo "OT"**.[1](https://support.google.com/meet/answer/16024610)


**Lo último que se discutió se centró en definir el flujo de estatus para la programación, la automatización del cierre de trabajo y los requisitos de la capacidad, además de los errores críticos que David debe corregir.****Flujo de Estatus y Tablero de Programación*** **Estatus "En Programación":** **Se necesita que el programador cambie el estatus de la OT** **manualmente** **de "Planificado" a**  **"En Programación"** **. Este estatus es el que permite que la OT sea visible y arrastrable en el tablero gráfico.**

* **Botón "Reservar" (Programado):** **Debe haber un botón de** **"Reservar"** **en el tablero que, al presionarse, realiza dos acciones clave:**
  * **Reserva las Horas-Hombre (HH)** **que se cargaron en el tablero, volviéndolas inamovibles.**
  * **Cambia el estatus de la OT** **automáticamente** **de "En Programación" a**  **"Programado"** **.**
* **Vista de Listado:** **Es necesaria una vista en** **formato tabla** **para que el programador pueda ver el listado de OTs, ver su detalle y cambiar el estatus a "En Programación" antes de pasarlas al tablero.**
* **Prioridad de Vista:** **El tablero (réplica de Prometheus) debe enfocarse en la** **Orden de Trabajo (OT) y sus operaciones** **más que en la vista de las personas, siendo la OT lo que se debe cerrar.**

 **Proceso de Ejecución (Notificación)** * **Bandeja de Ejecución:** **El proceso de cierre de trabajo (notificación, que es lento en SAP IW41) debe agilizarse. Las OTs con estatus** **"En Ejecución"** **deben aparecer en una** **"bandeja"** **en la sección de Ejecución para que el supervisor pueda notificarlas (cerrarlas) de forma más rápida y amigable.**

* **Tracking Móvil (Nueva Solicitud):** **Se introdujo la necesidad de que la versión móvil incluya un** **lector de QR** **que, al ser escaneado en el equipo, inicie el estatus de "Start Execution" para registrar el** **tiempo efectivo de trabajo** **(el**  *tan contou* **), midiendo cuánto tarda el mantenedor en reparar puramente, y registrando la ubicación técnica automáticamente. Se preguntó cuál sería el estatus final de la OT tras completar el trabajo.**

**Configuración de Capacidad y Recursos*** **Ajustes de HH:** **La capacidad de Horas-Hombre debe ser configurable con tres parámetros:**

1. **Horas Efectivas:** **Para definir las horas reales de trabajo (ej. 10 horas) restando tiempo de almuerzo y reuniones.**
2. **Porcentaje de Programación:** **Para definir el porcentaje (ej. 80%) que se programará, reservando el resto para fallas.**
3. **Factor de Productividad:** **Opcional, para considerar el tiempo perdido en traslados o alistamiento.**

* **Gestión de Recursos de Apoyo (Jorge):** **El tablero debe gestionar la capacidad de** **puentes grúa y grúas móviles** **(40/50 toneladas). Se debe poder** **sumar** **capacidad de equipos arrendados y** **bloquear/desactivar** **equipos fuera de servicio.**

 **Errores y Pendientes Críticos (Acciones para David)** * **Botón "Cancel" Incorrecto:** **El botón rojo de "Cancel" en la OT de la etapa de Planificación debe cambiarse a** **"Close"** **o eliminarse, ya que un planificador no cancela OTs en esa etapa y confunde al usuario.**

* **Salto de Estatus Incorrecto:** **El sistema está saltando de la aprobación en estatus "Pending" a** **"Planificación"** **en lugar de quedarse en** **"Identificación"** **(aprobado).**
* **Actualización de Datos ( *Refresh* **):**** **Debes** **activar una funcionalidad** **para que los cambios de estatus se actualicen en tiempo real y no haya problemas de** *refresh* **o caché.**
* **Búsqueda en Listado:** **La función de búsqueda debe permitir encontrar OTs usando el prefijo**  **"OT"** **.**
