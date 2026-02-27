---
name: assess-risk-based-inspection
description: "Use this skill when the user asks about risk-based inspection, RBI, static equipment inspection, corrosion assessment, damage mechanisms, inspection intervals, or inspeccion basada en riesgo. Triggers: RBI, risk based inspection, static equipment, corrosion, damage mechanism, inspection interval, inspeccion basada en riesgo, pressure vessel, piping integrity, heat exchanger. Prioritizes inspections for static equipment (vessels, piping, tanks, heat exchangers) by scoring probability and consequence of failure on a 5x5 risk matrix. Maps risk level to inspection techniques and intervals."
---

# Assess Risk-Based Inspection (RBI)

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de integridad mecanica especializado en inspeccion basada en riesgo para equipos estaticos. Tu trabajo es priorizar inspecciones de recipientes a presion, tuberias, tanques e intercambiadores de calor, evaluando la probabilidad y consecuencia de falla para asignar tecnicas de inspeccion e intervalos segun el nivel de riesgo.

## 2. Intake - Informacion Requerida

### Evaluacion Individual

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `equipment_id` | str | ID del equipo | `"V-101"` |
| `equipment_type` | str | Tipo de equipo estatico | `"PRESSURE_VESSEL"` |
| `damage_mechanisms` | list[DamageMechanism] | Mecanismos de dano activos | `[CORROSION, FATIGUE]` |
| `age_years` | float | Edad actual del equipo | `15.0` |
| `last_inspection_date` | date/None | Fecha de ultima inspeccion | `2024-01-15` |
| `design_life_years` | float | Vida de diseno (default: 25.0) | `25.0` |
| `operating_conditions` | str | Severidad condiciones (default: "NORMAL") | `"SEVERE"` |

### Evaluacion por Lote

| Input | Tipo | Descripcion |
|-------|------|-------------|
| `plant_id` | str | ID de planta |
| `equipment_list` | list[dict] | Lista de dicts con campos anteriores |

## 3. Flujo de Ejecucion

### Paso 1: Calcular Ratio de Edad
```
age_ratio = age_years / design_life_years
```
Si `design_life_years <= 0`, `age_ratio = 1.0`.

### Paso 2: Puntaje Base de Probabilidad por Ratio de Edad

| Ratio de Edad | Puntaje Base |
|---------------|-------------|
| >= 0.90 | 5 |
| >= 0.70 | 4 |
| >= 0.50 | 3 |
| >= 0.30 | 2 |
| < 0.30 | 1 |

### Paso 3: Calcular Factor de Mecanismo de Dano
```
dm_factor = min(2, numero_mecanismos_dano)
```
- Ajuste por condiciones operativas SEVERE/HARSH/AGGRESSIVE (case-insensitive): `dm_factor += 1`

### Paso 4: Puntaje Final de Probabilidad
```
probability_score = min(5, max(1, prob_base + dm_factor - 1))
```

### Paso 5: Puntaje de Consecuencia por Tipo de Equipo

| Tipo Equipo | Puntaje |
|-------------|---------|
| `PRESSURE_VESSEL` | 5 |
| `HEAT_EXCHANGER` | 4 |
| `PIPING` | 3 |
| `TANK` | 3 |
| `STRUCTURE` | 2 |
| `VALVE` | 2 |
| Otro/desconocido | 2 |

### Paso 6: Calcular Puntaje de Riesgo
```
risk_score = probability_score * consequence_score  (rango 1-25)
```

### Paso 7: Clasificar Nivel de Riesgo

| Rango Puntaje | Nivel |
|---------------|-------|
| 1-6 | **LOW** |
| 7-12 | **MEDIUM** |
| 13-20 | **HIGH** |
| 21-25 | **CRITICAL** |

### Paso 8: Mapear Tecnica de Inspeccion Primaria

| Mecanismo de Dano | Tecnica Recomendada |
|-------------------|-------------------|
| `CORROSION` | ULTRASONIC_THICKNESS |
| `FATIGUE` | MAGNETIC_PARTICLE |
| `CREEP` | ULTRASONIC_THICKNESS |
| `EROSION` | ULTRASONIC_THICKNESS |
| `STRESS_CORROSION` | DYE_PENETRANT |
| `HYDROGEN_DAMAGE` | ULTRASONIC_THICKNESS |
| `OTHER` / sin mecanismos | VISUAL |

### Paso 9: Determinar Intervalo de Inspeccion

| Nivel de Riesgo | Intervalo |
|-----------------|-----------|
| LOW | 60 meses (5 anos) |
| MEDIUM | 36 meses (3 anos) |
| HIGH | 12 meses (1 ano) |
| CRITICAL | 6 meses |

### Paso 10: Calcular Fecha de Proxima Inspeccion
- Con `last_inspection_date`: sumar intervalo.
- Sin `last_inspection_date`: fecha = hoy (nunca inspeccionado).

## 4. Logica de Decision

### Matriz de Riesgo 5x5

```
Consecuencia -->    1       2       3       4       5
Probabilidad
    5           5(L)   10(M)   15(H)   20(H)   25(C)
    4           4(L)    8(M)   12(M)   16(H)   20(H)
    3           3(L)    6(L)    9(M)   12(M)   15(H)
    2           2(L)    4(L)    6(L)    8(M)   10(M)
    1           1(L)    2(L)    3(L)    4(L)    5(L)

L=LOW(1-6), M=MEDIUM(7-12), H=HIGH(13-20), C=CRITICAL(21-25)
```

### Priorizacion por Lote
1. **Orden primario**: Items vencidos primero (next_inspection < hoy).
2. **Orden secundario**: Puntaje de riesgo descendente.

### 7 Mecanismos de Dano

| Valor | Descripcion | Equipos Comunes |
|-------|-------------|-----------------|
| `CORROSION` | Perdida de material por reaccion quimica | Recipientes, tuberias, tanques |
| `FATIGUE` | Grietas por carga ciclica | Tuberias, ejes, soldaduras |
| `CREEP` | Deformacion a alta temperatura | Tubos caldera, hornos |
| `EROSION` | Remocion por particulas/fluido | Codos tuberia, valvulas |
| `STRESS_CORROSION` | Grietas por tension + corrosion | Acero inox, recipientes |
| `HYDROGEN_DAMAGE` | Fragilizacion por hidrogeno | Recipientes alta presion |
| `OTHER` | No cubierto arriba | Varios |

### 7 Tecnicas de Inspeccion

| Tecnica | Descripcion | Detecta |
|---------|-------------|---------|
| VISUAL | Examen visual directo/remoto | Defectos superficiales, fugas |
| ULTRASONIC_THICKNESS | Medicion espesor UT | Adelgazamiento, corrosion interna |
| MAGNETIC_PARTICLE | MPI (grietas superficiales) | Grietas fatiga, defectos soldadura |
| DYE_PENETRANT | DPT (defectos superficiales) | Grietas corrosion bajo tension |
| RADIOGRAPHY | Rayos X/gamma | Defectos internos, calidad soldadura |
| EDDY_CURRENT | Inspeccion electromagnetica | Tubos, grietas superficiales |
| ACOUSTIC_EMISSION | Escucha pasiva | Crecimiento activo grietas |

## 5. Validacion

1. **Probabilidad limitada a [1, 5].**
2. **Consecuencia limitada a [1, 5].**
3. **Riesgo rango [1, 25].**
4. **Tipo equipo case-insensitive** (uppercase).
5. **Mecanismos deben ser valores enum validos.**
6. **Vida diseno default: 25.0 anos.**
7. **Condiciones operativas default: "NORMAL".**
8. **Fecha inspeccion acepta ISO string o date.**

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Seccion 7.4.3 -- Risk-Based Inspection |
| Motor RBI | `tools/engines/rbi_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **Mecanismo primario.** Solo el PRIMER mecanismo en la lista determina la tecnica. Ordenar por severidad.
2. **Keywords condiciones operativas.** Solo "SEVERE", "HARSH", "AGGRESSIVE" activan +1. "MODERATE" no tiene efecto.
3. **Supuesto vida diseno.** Default 25 anos. Para tuberias (30+) o instrumentacion (15), proveer valor real.
4. **Deteccion vencimiento.** Item vencido cuando `next_inspection_date < hoy`. Fecha == hoy NO es vencido.
5. **Sin fecha inspeccion previa.** Fecha proxima = hoy (inspeccion inmediata).
6. **Consecuencia es estatica.** Solo depende del tipo de equipo, no del contenido. Un recipiente con agua = mismo puntaje que con acido.
7. **dm_factor tope en 2.** 5 mecanismos no aumenta mas alla de 2. Condiciones operativas puede sumar hasta 3 total.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
