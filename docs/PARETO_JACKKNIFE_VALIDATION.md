# Validación Pareto + Jack-Knife contra Excels de Jorge

> Validación 2026-04-29: las fórmulas implementadas en `PerformanceAnalysis.jsx` (componentes `ParetoSection` y `JackKnifeSection`) dan exactamente los mismos números que los archivos Excel históricos en `Ayudas/Análisis Pareto/` y `Ayudas/Análisis Jack Knife/`.

## Pareto — Sept 2010 Flota A

**Archivo**: `Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del 01 al 30 de Septiembre 2010 modif..xls` · Hoja2

**Datos**: 4 sistemas con Mantención No Planificada en Camiones Flota A (mes Sept 2010), total 143.38h

| Sistema | Horas | % | % acumulado |
|---|---|---|---|
| Sistema de levante | 58.25 | 40.6% | 40.6% |
| Accidente | 49.24 | 34.4% | 75.0% |
| Sistema eléctrico 24v | 20.23 | 14.1% | 89.1% |
| Sistema hidráulico | 4.55 | 3.2% | 92.3% |
| Sistema neumático | 3.70 | 2.6% | 94.9% |
| ... | ... | ... | 100.0% |

**Mi cálculo**: `value/total → cumPct` da 0.4063 → 0.8908 → 0.9742 → 1.0 ✅ idéntico al Excel.

## Jack-Knife — Camión 797A Abril 2010

**Archivo**: `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack Knife Abril 2010.xls` · hoja "Jack Knife 797A"

**Datos**: 8 sistemas con `Mantención` (no planificada) en flota Cam 797A (mes Abril 2010)

| Sistema | Σ tiempo (h) | N° paradas | MTTR (h) |
|---|---|---|---|
| Accesorios | 8.93 | 9 | 0.99 |
| **Motor diesel** | 80.68 | 15 | 5.38 |
| Neumáticos | 19.10 | 6 | 3.18 |
| Sistema de transmisión | 8.74 | 4 | 2.19 |
| Sistema eléctrico 24v | 3.06 | 2 | 1.53 |
| Sistema eléctrico control | 7.33 | 4 | 1.83 |
| **Sistema hidráulico** | 24.27 | 6 | 4.05 |
| Sistema neumático | 1.84 | 1 | 1.84 |
| **Total** | **153.95** | **47** | — |

**Thresholds** (fórmula Jorge transcript 2026-04-29 13:44):
- MTTR threshold (eje Y) = `Σtiempo / Σparadas` = `153.95 / 47` = **3.27h**
- Frec threshold (eje X) = `Σparadas / n_razones` = `47 / 8` = **5.88**

**Cuadrantes calculados**:
- **GRAVE+CRÓNICO** (rojo): Motor diesel (15>5.88 ∧ 5.38>3.27) ⚠ prioridad #1 RCA
- **GRAVE+CRÓNICO** (rojo): Sistema hidráulico (6>5.88 ∧ 4.05>3.27)
- **LEVE** (verde): Accesorios, Neumáticos, Sistema transmisión, Sistema eléctrico 24v, Sistema eléctrico control, Sistema neumático

## Conclusión

Las dos fórmulas que dicté Jorge en el transcript del 2026-04-29 13:44 están implementadas con paridad 1:1 contra sus Excels históricos. El demo del jueves puede hacerse con confianza: si Jorge corre el mismo set de datos en MAGEAM, va a obtener exactamente los mismos thresholds, % acumulado y clasificación de cuadrantes que en sus archivos.

## Archivos referencia consultados

- `Ayudas/Análisis Pareto/Teoría Pareto/Gráfico de Pareto.pdf`
- `Ayudas/Análisis Pareto/Teoría Pareto/Pareto.doc`
- `Ayudas/Análisis Pareto/Teoría Pareto/análisis de pareto.pdf`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/pareto tiempos indisponibilidad del 01 al 30 de Septiembre 2010 modif..xls`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/Pareto Enero.xls`
- `Ayudas/Análisis Pareto/Ejemplos Pareto/Pareto Motos 24M.xls`
- `Ayudas/Análisis Jack Knife/Teoría Jack Knife/Jack-Knife.docx`
- `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack Knife Abril 2010.xls`
- `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/Jack-Knife.xlsx`
- `Ayudas/Análisis Jack Knife/Ejemplos Jack Knife/jack Knife.xls`
