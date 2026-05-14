---
name: analyze-jackknife
description: "Use this skill when the user asks about Jackknife diagrams, MTBF vs MTTR analysis, 4-zone classification, acute/chronic equipment, equipment classification by reliability and maintainability, or jack knife. Triggers: Jackknife, MTBF vs MTTR, 4 zones, acute chronic, equipment classification, jack knife, diagrama jack knife, cuadrantes, bad actors MTBF MTTR. Classifies equipment into ACUTE (low MTBF + high MTTR), CHRONIC (low MTBF + low MTTR), COMPLEX (high MTBF + high MTTR), and CONTROLLED (high MTBF + low MTTR) zones using median thresholds. ACUTE zone items are the worst-performing bad actors."
---

# Analyze Jack-Knife Diagram

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de confiabilidad especializado en analisis bidimensional de desempeno de equipos. Tu trabajo es clasificar equipos en cuatro zonas de desempeno trazando MTBF (confiabilidad) contra MTTR (mantenibilidad) en un diagrama Jack-Knife, identificando los bad actors agudos que necesitan atencion inmediata.

## 2. Intake - Informacion Requerida

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `plant_id` | str | Planta analizada | `"PLANT-JFC-01"` |
| `equipment_data` | list[dict] | Registros de desempeno de equipos | Ver abajo |

### Campos de Registro de Equipo

| Campo | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `equipment_id` | str | ID unico del equipo | `"EQ-001"` |
| `equipment_tag` | str | Tag legible | `"PUMP-101A"` |
| `failure_count` | int | Numero de fallas en periodo | `5` |
| `total_downtime_hours` | float | Horas totales de downtime | `120.0` |
| `operating_hours` | float | Horas operacion en periodo (default: 8760) | `8760` |

## 3. Flujo de Ejecucion

### Paso 1: Validar Datos de Entrada
- Si `equipment_data` vacio, retornar resultado con `equipment_count = 0`.

### Paso 2: Calcular MTBF y MTTR por Equipo

**Si `failure_count <= 0` (sin fallas):**
```
MTBF = operating_hours / 24.0  (convertir horas a dias)
MTTR = 0.0
```

**Si `failure_count > 0`:**
```
MTBF = (operating_hours / failure_count) / 24.0  (dias)
MTTR = total_downtime_hours / failure_count       (horas)
```
- Default `operating_hours` = 8760 (1 ano calendario).
- Redondear MTBF a 1 decimal, MTTR a 1 decimal.

### Paso 3: Calcular Umbrales Medianos
- `median_mtbf = statistics.median(mtbf_values)`
- `median_mttr = statistics.median(mttr_values)`
- Si lista vacia, mediana = 0.

### Paso 4: Clasificar Cada Equipo en Zona

| Condicion | Zona | Significado |
|-----------|------|-------------|
| MTBF < mediana AND MTTR > mediana | **ACUTE** | Baja confiabilidad Y baja mantenibilidad |
| MTBF < mediana AND MTTR <= mediana | **CHRONIC** | Baja confiabilidad pero facil de reparar |
| MTBF >= mediana AND MTTR > mediana | **COMPLEX** | Confiable pero dificil de reparar |
| MTBF >= mediana AND MTTR <= mediana | **CONTROLLED** | Alta confiabilidad Y facil de reparar |

### Paso 5: Contar Poblacion por Zona
- acute + chronic + complex + controlled == equipment_count.

### Paso 6: Construir Resultado

### Paso 7: Extraer Bad Actors (Opcional)
- Filtrar solo items en zona ACUTE.

## 4. Logica de Decision

### Matriz de Clasificacion por Zonas

```
                    MTTR (Mantenibilidad)
                    Bajo (<= mediana)    Alto (> mediana)
                 +------------------+------------------+
MTBF    Alto     |                  |                  |
(Confi- (>= med) |   CONTROLLED     |    COMPLEX       |
abilidad)        |   (Mejor)        |   (Dificil rep.) |
                 +------------------+------------------+
        Bajo     |                  |                  |
        (< med)  |   CHRONIC        |    ACUTE         |
                 |   (Frecuente)    |   (Peor)         |
                 +------------------+------------------+
```

### Acciones Recomendadas por Zona

| Zona | Prioridad | Problema Raiz | Accion Recomendada |
|------|----------|---------------|-------------------|
| **ACUTE** | Maxima | Confiabilidad y mantenibilidad | RCA inmediato, considerar reemplazo, analisis OCR |
| **CHRONIC** | Alta | Confiabilidad (falla seguido, facil de arreglar) | Mejorar PM, abordar modos de falla |
| **COMPLEX** | Media | Mantenibilidad (raro pero largo) | Mejorar procedimientos, pre-posicionar repuestos |
| **CONTROLLED** | Baja | Ninguno (desempeno aceptable) | Monitorear, mantener estrategia actual |

### Seleccion de Umbral: Mediana vs Media
- Se usa **mediana** (no media) porque es robusta a outliers.
- Un equipo catastroficamente malo no sesga el umbral.
- La mediana divide naturalmente la poblacion en mitades aproximadas.

## 5. Validacion

1. **Datos vacios**: Retorna resultado con equipment_count = 0.
2. **Cero fallas**: MTTR = 0, MTBF alto. Siempre en CONTROLLED.
3. **Unidades MTBF**: Siempre en DIAS (no horas).
4. **Unidades MTTR**: Siempre en HORAS.
5. **Redondeo**: MTBF a 1 decimal, MTTR a 1 decimal.
6. **Default horas operacion**: 8760 (1 ano calendario).
7. **Conteos de zona deben sumar**: acute + chronic + complex + controlled == equipment_count.

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Seccion 7.5.4 -- Jack-Knife Diagram |
| Motor Jack-Knife | `tools/engines/jackknife_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **Confundir unidades MTBF.** MTBF en DIAS, no horas. El motor divide operating_hours por failure_count y luego por 24.
2. **Confundir unidades MTTR.** MTTR en HORAS, no dias.
3. **Equipo sin fallas.** MTTR = 0, MTBF alto. Cae en CONTROLLED. Correcto.
4. **Mediana vs Media.** Se usa MEDIANA (no media). No sustituir.
5. **Frontera igual-a-mediana.** MTBF == mediana se clasifica como ">= mediana". MTTR == mediana se clasifica como "<= mediana".
6. **Datasets pequenos.** Con < 4-5 equipos, la mediana puede no separar significativamente.
7. **Consistencia de periodo.** Todos los equipos deben compartir el mismo periodo. Mezclar datos de 1 ano con 6 meses produce MTBF enganosos.
8. **Supuesto de horas operacion.** Default 8760 asume operacion 24/7. Para turnos, proveer horas reales.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
