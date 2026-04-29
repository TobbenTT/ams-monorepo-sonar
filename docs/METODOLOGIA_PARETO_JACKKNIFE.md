# Metodología Pareto + Jack-Knife — Implementación MAGEAM

> Documento de respaldo y especificación. Combina la teoría dictada por Jorge Alquinta en la reunión del 2026-04-29 13:44 con el mapeo 1:1 al módulo Performance Analysis de MAGEAM. Sirve como backup técnico y como check-list contra los Excels históricos de Jigsaw.

**Autor**: David Cabezas (Value Strategy Consulting) · dev full-stack junior
**Fuentes**: transcript 2026-04-29 13:44 + carpeta `Ayudas/Análisis Pareto/` + `Ayudas/Análisis Jack Knife/`
**Estado**: implementado y validado contra Excels Sept/Oct/Dic 2010 (camiones Flota A/B, motoniveladoras 24M, palas hidráulicas, perforadoras).

---

## 1. Contexto del problema

Jorge: "El 80% de los problemas que ocurren son la causa de un 20%. Lo que hace el Pareto es identificar ese 20% para que todas las acciones se enfoquen ahí" (00:02:42).

En mantenimiento minero la fuente de datos más rica **no es SAP**, son los sistemas paralelos tipo **Jigsaw** (00:13:57) que registran 24/7 el estado de cada equipo (operando, preventiva, falla). El Excel Jigsaw entrega:

- Equipos (camiones C01-C16, palas PA01-PA03, perforadoras PE1, etc.)
- Sistemas afectados (motor diésel, hidráulico, eléctrico 24V, frenos, neumático, accesorios, transmisión, dirección…)
- Tiempos: fecha+hora inicio, fecha+hora fin, duración (minutos → horas decimal)
- Estado: **Mantención No Planificada** (falla), Preventiva, Planificada
- Comentario libre del mantenedor

Jorge insiste (00:16:38): la información que "está oculta" es el cruce equipo×sistema×tiempo. Eso es lo que MAGEAM tiene que extraer.

---

## 2. Pareto — fórmula y orden

### 2.1 Construcción de la tabla (00:07:30 - 00:08:30)

| Paso | Cálculo |
|---|---|
| 1. Filtrar | Sólo `estado == "Mantención No Planificada"` (las fallas) |
| 2. Agrupar | Por **sistema** (no por equipo individual — Jorge insiste en analizar el sistema del equipo, no el equipo) |
| 3. Sumar | `valor` por sistema = Σ horas o Σ frecuencia (Jorge: "el dato puede ser tiempo o frecuencia") |
| 4. Ordenar | Descendente por `valor` |
| 5. % | `pct[i] = valor[i] / Σvalor × 100` |
| 6. % acumulado | `cumPct[0] = pct[0]`; `cumPct[i] = cumPct[i-1] + pct[i]` |
| 7. Cierre | Último `cumPct = 100%` exacto (Jorge: "no existe un 101") |
| 8. Top 80% | `inTop80 = cumPct ≤ 80` (esos son los sistemas a atacar) |

### 2.2 Gráfico dual-axis (00:08:32 - 00:09:50)

> "Esto sí tiene que ser siempre así: barras con líneas. Un gráfico de barra que toma la frecuencia, y otro de línea con el porcentaje acumulado, en otra escala."

- **Eje Y izquierdo**: frecuencia o horas (escala absoluta)
- **Eje Y derecho**: % acumulado (0-100)
- **Eje X**: sistemas (mismo eje para ambos gráficos)
- **Referencia visual**: línea horizontal punteada en 80% (línea 13:35)
- **Color barras**: rojo si `inTop80`, gris si no

### 2.3 Cruce con avisos (00:12:25 - 00:12:50)

> "Si los avisos están en sistemas que no están en el 80%, significa que estamos enfocando mal los esfuerzos y por eso el desempeño no sube."

**Regla de validación**: para cada aviso/WR del período, verificar si el sistema clasificado por la IA cae en el top 80% del Pareto. Si la mayoría no cae → flag de "esfuerzos mal dirigidos".

### 2.4 Implementación MAGEAM

- **Backend**: `POST /api/v1/analytics/import-jigsaw-excel` parsea `.xls` (xlrd), filtra `Mantención No Planificada`, agrupa por sistema, devuelve `{byCount, byHours}`.
- **Frontend**: `frontend/src/pages/PerformanceAnalysis.jsx` componente `ParetoSection` — recharts ComposedChart, toggle frecuencia/horas, badge top80.
- **Validación 1:1**: docs/PARETO_JACKKNIFE_VALIDATION.md confirma match exacto contra Sept 2010 Flota A (Sistema levante 40.6%, Accidente 34.4%, Eléctrico 24V 14.1%).

---

## 3. Jack-Knife — diagrama de cuadrantes

### 3.1 Concepto (00:55:29 - 00:56:09)

> "Si cae en mantenibilidad, problemas de mantenibilidad. Si cae en confiabilidad, problemas de confiabilidad. Si cae en grave-crónico, ineficiencia en ambas y pérdidas de disponibilidad. El gráfico le dice al ingeniero dónde tiene que ir."

Cada punto del Jack-Knife es un **sistema** (igual que Pareto, no equipo individual). Las dos dimensiones:

- **Eje X**: frecuencia = nº de paradas en el período
- **Eje Y**: MTTR = `Σ tiempo / Σ paradas` por sistema (tiempo medio para reparar)

### 3.2 Thresholds — fórmula Jorge (00:58:55 - 00:59:30)

Jorge dictó esto explícitamente como **promedio agregado**, NO mediana:

```
threshold_MTTR (línea horizontal eje Y) = Σ tiempo total / Σ paradas total
threshold_Frec (línea vertical eje X)   = Σ paradas total / n_sistemas
```

**Ejemplo Camión 797A Abril 2010** (validación):
- Σ tiempo = 153.95h, Σ paradas = 47, n_sistemas = 8
- threshold MTTR = 153.95 / 47 = **3.27h**
- threshold Frec = 47 / 8 = **5.88**

### 3.3 Cuadrantes (4 zonas)

| Cuadrante | Frec | MTTR | Diagnóstico | Acción |
|---|---|---|---|---|
| **GRAVE_CRONICO** | > th | > th | Falla mantenib + confiabil | RCA inmediato, prioridad #1 |
| **GRAVE** | ≤ th | > th | Mantenibilidad mala | Mejorar procedimientos / repuestos |
| **CRONICO** | > th | ≤ th | Confiabilidad mala | Cambiar estrategia / cubrimiento |
| **LEVE** | ≤ th | ≤ th | Bajo impacto | No priorizar |

Jorge (01:00:43): "Las líneas curvas de iso-disponibilidad no son redundantes pero lo que interesa son los cuadrantes — que el punto caiga en un cuadrante es lo que te lleva a mejorar."

### 3.4 Implementación MAGEAM

- **Backend**: mismo endpoint `import-jigsaw-excel` calcula `items[]` con `quadrant` per-sistema y `thresholdMttr`/`thresholdFreq`.
- **Frontend**: componente `JackKnifeSection` — recharts ScatterChart con 4 series (una por cuadrante) y `ReferenceLine` para los thresholds. Toggle escala log opcional.
- **Validación**: 797A Abril 2010 → Motor diésel y Sistema hidráulico caen en GRAVE_CRONICO (rojo, prioridad #1 RCA).

---

## 4. Flujo de uso en MAGEAM

```
1. Performance Analysis → botón "📂 Cargar Excel Jigsaw histórico"
2. Drag&drop el .xls (Sheet1 long-form Pareto, o hojas CAM*/PALAS Jack-Knife)
3. Backend parsea, agrupa por sistema, devuelve datasets
4. ParetoSection y JackKnifeSection abajo se reemplazan con la data del Excel
   (badge verde 📂 confirma que vienen del archivo)
5. Toggle frecuencia/horas (Pareto) o escala log (Jack-Knife)
6. Botón ✕ "Volver a OTs sistema" restaura la vista por OTs internas
```

---

## 5. Decisiones de diseño y supuestos

1. **Por qué agrupar por sistema y no por equipo**: Jorge lo recalca al menos 3 veces (00:18:54, 00:19:42, 01:01:25). Cuando una flota tiene N camiones del mismo modelo se analizan todos juntos por sistema, después se hace drill-down al equipo específico.

2. **Por qué no se usan medianas**: Jorge usa promedio agregado (Σ/Σ) explícitamente. Las medianas darían thresholds distintos pero su Excel histórico — el que tiene que validar — usa promedios.

3. **Por qué solo Mantención No Planificada**: para Pareto y Jack-Knife sólo cuentan las **fallas** (00:15:10). Las preventivas y planificadas son trabajo programado y no entran en el cálculo de disponibilidad por falla.

4. **Por qué seed sintético + upload Excel**: el seed sintético permite que la página tenga data desde el día 1 (demo). El upload Excel permite a Jorge usar sus datos reales y verificar que MAGEAM da los mismos números que Excel.

---

## 6. Pendientes que Jorge mencionó

| Pendiente | Línea transcript | Estado |
|---|---|---|
| Cruce Pareto × avisos por sistema (avisos no en top 80% = esfuerzo mal dirigido) | 00:12:25 | **Pendiente** — implementar como sección adicional |
| Conexión directa al Jigsaw del cliente (no upload manual) | 00:18:01 | **Roadmap fase 2** — conector |
| Si la mina no tiene Jigsaw, "hay oportunidad de crearles el sistema" | 00:18:23 | Oportunidad comercial |
| Filtros drill-down por flota/equipo dentro del análisis | 01:01:25 | **Pendiente** — agregar dropdowns |
| Líneas curvas de iso-disponibilidad opcionales en Jack-Knife | 01:00:31 | Mejora visual baja prioridad |

---

## 7. Archivos referenciados

- `Ayudas/Análisis Pareto/Teoría Pareto/Gráfico de Pareto.pdf`
- `Ayudas/Análisis Pareto/Teoría Pareto/Pareto.doc`
- `Ayudas/Análisis Pareto/Teoría Pareto/análisis de pareto.pdf`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del 01 al 30 de Septiembre 2010 modif..xls`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/Pareto Enero.xls`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/Pareto Motos 24M.xls`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del 01 al 31 de Octubre 2010 modif..xls`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del 01 al 31 de Diciembre 2010 modif..xls`
- `Ayudas/Análisis Jack Knife/Teoría Jack Knife/Jack-Knife.docx`
- `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack Knife Abril 2010.xls`
- `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack-Knife.xlsx`
- `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/jack Knife.xls`

## 8. Archivos del proyecto

- `api/routers/analytics.py` — endpoint `import-jigsaw-excel`
- `frontend/src/pages/PerformanceAnalysis.jsx` — componentes `ParetoSection`, `JackKnifeSection`, `JigsawImportBanner`
- `docs/PARETO_JACKKNIFE_VALIDATION.md` — validación numérica 1:1 contra Excels históricos
- `scripts/seed_jigsaw_real_data.py` — script alternativo de seed (no usado en demo)
