Lo que se requiere que hagas en relación a la plataforma Prometheus es lo siguiente:

**1. Revisar el video**

Debes revisar el video de **Prometheus** (específicamente a partir del minuto 33:28 del video de "coordinación semanal") para comprender la lógica de arrastre de las Órdenes de Trabajo (OTs) en el tablero de programación.[1](https://support.google.com/meet/answer/16024610)

[2](https://drive.google.com/open?id=1qRNKVGHj6njAcLUUlzpFH21gjeX4PbZ3o1vPvfJHWmo)

**2. Replicar la funcionalidad principal**

La idea principal es **replicar** la lógica visual y funcional de Prometheus en el tablero del proyecto, ya que es la forma más simple de trabajar para el programador.[1](https://support.google.com/meet/answer/16024610)

Los elementos clave que debes implementar en el tablero, inspirados en esta herramienta, incluyen:* **Priorización y Orden:** Asegurar que las OTs en el lateral izquierdo se muestren ordenadas por  **nivel de riesgo/impacto** , de más crítico a menos crítico.[1](https://support.google.com/meet/answer/16024610)

* **Filtro por Prioridad:** El tablero solo debe mostrar las OTs con prioridad **P3 y P4** (las programables), excluyendo las P1 y P2.[1](https://support.google.com/meet/answer/16024610)
* **Visualización de Capacidad (HH):** El tablero debe mostrar la capacidad (Horas-Hombre o HH) disponible para el día. Al cargar OTs, debe indicar si se pasa de la capacidad (mostrando el exceso en rojo) o si faltan/sobran HH para que el programador haga ajustes.[1](https://support.google.com/meet/answer/16024610)
* **Estatus "En Programación":** Una OT debe tener el estatus **"En Programación"** (cambio manual desde "Planificado") para que pueda aparecer en el tablero.[2](https://drive.google.com/open?id=1qRNKVGHj6njAcLUUlzpFH21gjeX4PbZ3o1vPvfJHWmo)

  [1](https://support.google.com/meet/answer/16024610)
* **Botón de "Reservar":** Implementar un botón de **Reservar** en el tablero. Este botón confirma las OTs cargadas y ajustadas, reservando las HH. Al presionarlo, el estatus de la OT debe cambiar **automáticamente** de "En Programación" a  **"Programado"** .[2](https://drive.google.com/open?id=1qRNKVGHj6njAcLUUlzpFH21gjeX4PbZ3o1vPvfJHWmo)

  [1](https://support.google.com/meet/answer/16024610)
* **Prueba de Arrastre:** Realiza una prueba creando una OT de **48 horas** o más para ver cómo se muestra y se cubre funcionalmente a lo largo de dos días.[1](https://support.google.com/meet/answer/16024610)
