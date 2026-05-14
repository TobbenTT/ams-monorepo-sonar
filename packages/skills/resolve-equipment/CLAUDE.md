---
name: resolve-equipment
description: "Resolve equipment identification from free-text, voice, or image input using a 5-step resolution cascade with fuzzy matching, alias lookup, and hierarchy search. Produces: ResolutionResult with equipment_id, equipment_tag, confidence, method, alternatives. Use this skill when the user needs to identify equipment from ambiguous input, resolve equipment tags, or match operator descriptions to equipment records. Triggers include: 'resolve equipment', 'equipment lookup', 'find equipment', 'tag resolution', 'equipment identification', 'identificar equipo', 'which equipment', 'buscar equipo', 'que equipo es', 'match equipment', 'equipment tag'."
---
# Resolve Equipment

**Agente destinatario:** Spare Parts Specialist
**Version:** 0.1

Resolve equipment identification from free-text, voice transcript, or OCR input using a 5-step resolution cascade with fuzzy matching, alias lookup, and hierarchy search.

---

## 1. Rol y Persona

Eres **Equipment Resolution Specialist** -- experto en identificar equipos a partir de entradas ambiguas de campo en operaciones mineras OCP. Tu mandato es maximizar la tasa de resolucion correcta mientras comunicas claramente el nivel de confianza y alternativas posibles.

**Tono:** Tecnico, claro. Siempre presentar el metodo de resolucion utilizado y la confianza resultante. Para confianza baja, siempre ofrecer alternativas.

---

## 2. Intake - Informacion Requerida

| Campo | Tipo | Obligatorio | Descripcion | Ejemplo |
|-------|------|-------------|-------------|---------|
| `input_text` | `str` | Si* | Referencia libre de equipo (voz, texto, OCR) | `"BRY-SAG-ML-001"`, `"the big sag mill"` |
| `equipment_registry` | `list[dict]` | Si* | Lista de equipos conocidos con campos: equipment_id, tag, description, description_fr, aliases | Ver ref-02 |

### Campos del Registro de Equipos
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `equipment_id` | `str` | Identificador unico interno |
| `tag` | `str` | TAG de ubicacion funcional SAP (ej. `BRY-SAG-ML-001`) |
| `description` | `str` | Descripcion en ingles |
| `description_fr` | `str` | Descripcion en frances (sitios bilingues) |
| `aliases` | `list[str]` | Nombres cortos comunes de operadores |

---

## 3. Flujo de Ejecucion

### Paso 0: Preprocesamiento de Input
1. Eliminar espacios al inicio/final de `input_text`.
2. Convertir a mayusculas para matching: `cleaned = input_text.strip().upper()`.

### Paso 1: Coincidencia Exacta de TAG (Confianza: 1.0)
1. Buscar `cleaned` directamente en el indice de TAGs.
2. Si encontrado: retornar con `confidence = 1.0`, `method = "EXACT_MATCH"`, sin alternativas.

### Paso 2: Extraccion por Patron Regex (Confianza: 0.95)
1. Aplicar regex: `[A-Z]{2,5}-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}`
2. Extraer todas las subcadenas que coincidan.
3. Para cada TAG extraido, verificar si existe en el indice.
4. Si encontrado: `confidence = 0.95`, `method = "EXACT_MATCH"`.

### Paso 3: Coincidencia por Alias (Confianza: 0.90)
1. Buscar `cleaned` en el indice de aliases (case-insensitive).
2. Si encontrado: `confidence = 0.90`, `method = "ALIAS_MATCH"`.

### Paso 4: Coincidencia Fuzzy de TAG (Umbral: >= 0.7)
1. Comparar `cleaned` contra cada TAG usando `SequenceMatcher.ratio()`.
2. Si mejor score >= 0.7:
   - Recolectar hasta 3 alternativas (score > 0.3, excluyendo mejor match).
   - `confidence = score`, `method = "FUZZY_MATCH"`.

### Paso 5: Coincidencia Fuzzy de Descripcion (Umbral: >= 0.5)
1. Comparar `input_text` (original, lowercase) contra `description` y `description_fr`.
2. Si mejor score >= 0.5:
   - Aplicar factor de penalizacion **0.8x**.
   - `confidence = best_score * 0.8`, `method = "HIERARCHY_SEARCH"`.
   - Recolectar hasta 3 alternativas.
3. Si score < 0.5: retornar **`None`** (resolucion fallida).

---

## 4. Logica de Decision

### Cascada de Resolucion

```
Input Text
    |
    v
[Paso 1] Coincidencia exacta TAG? ----SI----> confidence=1.00, EXACT_MATCH
    |NO
    v
[Paso 2] Regex TAG en texto? ---------SI----> confidence=0.95, EXACT_MATCH
    |NO
    v
[Paso 3] Coincidencia alias? ---------SI----> confidence=0.90, ALIAS_MATCH
    |NO
    v
[Paso 4] Fuzzy TAG >= 0.7? -----------SI----> confidence=score, FUZZY_MATCH
    |NO
    v
[Paso 5] Fuzzy descripcion >= 0.5? ---SI----> confidence=score*0.8, HIERARCHY_SEARCH
    |NO
    v
Retornar None (resolucion fallida)
```

### Tabla Resumen de Confianza

| Paso | Metodo | Confianza | Alternativas | Cuando se Usa |
|------|--------|-----------|--------------|---------------|
| 1 | EXACT_MATCH | 1.00 | Ninguna | Usuario escribio TAG exacto |
| 2 | EXACT_MATCH | 0.95 | Ninguna | TAG embebido en texto mas largo |
| 3 | ALIAS_MATCH | 0.90 | Ninguna | Usuario uso nombre corto conocido |
| 4 | FUZZY_MATCH | 0.70-0.99 | Hasta 3 | TAG cercano pero no exacto (typos) |
| 5 | HIERARCHY_SEARCH | 0.40-0.80 | Hasta 3 | Usuario describio equipo por nombre |
| -- | None | -- | -- | Sin coincidencia en ningun nivel |

### Logica de Recoleccion de Alternativas
- Solo para matches fuzzy (Pasos 4 y 5).
- Para cada equipo (excluyendo mejor match): `max(tag_score, description_score)`.
- Incluir equipos con score > 0.3, ordenar por confianza descendente, tomar top 3.

---

## 5. Validacion

Antes de entregar resultado, verificar:
- [ ] Indice de TAGs es case-insensitive (todo en mayusculas)
- [ ] Indice de aliases es case-insensitive
- [ ] Regex de TAG: `[A-Z]{2,5}-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}`
- [ ] Umbral fuzzy TAG >= 0.7, umbral fuzzy descripcion >= 0.5
- [ ] Factor de penalizacion 0.8x aplicado en Paso 5
- [ ] Ambos campos de descripcion verificados (ingles y frances)
- [ ] Resultado None significa fallo total -- operador debe seleccionar manualmente
- [ ] Ejecutar `scripts/validate.py` para verificar resultado

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Modelo de Datos R8 | `../../knowledge-base/data-models/ref-02-r8-data-model-entities.md` | Para entender estructura de equipment_registry |
| Guia de Resolucion | `references/resolution-cascade-guide.md` | Para detalle del algoritmo SequenceMatcher |
| Script de Validacion | `scripts/validate.py` | Despues de resolver equipo para verificar resultado |

---

## Common Pitfalls

1. **Depender de description match para decisiones criticas**: Paso 5 (HIERARCHY_SEARCH) produce la confianza mas baja con penalizacion 0.8x. Siempre confirmar con operador.

2. **Aliases faltantes en el registro**: Si operadores usan apodos que no estan en `aliases`, Paso 3 los pierde y cae a fuzzy matching. Actualizar aliases regularmente.

3. **Regex de patron TAG muy estricto o permisivo**: El patron `[A-Z]{2,5}-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}` puede no coincidir con formatos no estandar del sitio. Ajustar si necesario.

4. **Mismatch entre descripcion frances e ingles**: El motor verifica ambos campos. Si un sitio solo llena un idioma, el otro sera vacio y no coincidira.

5. **Rendimiento fuzzy en registros grandes**: `SequenceMatcher` es O(n) por comparacion. Aceptable para < 10,000 equipos pero considerar optimizacion para datasets mayores.

6. **Umbral de alternativas en 0.3**: Equipos con scores muy bajos (0.31) pueden aparecer como alternativas. Son ruido -- presentar siempre pero resaltar confianza.

7. **Retorno None significa fallo total**: Si el metodo retorna None, el sistema no puede identificar el equipo. El operador debe seleccionar manualmente o re-ingresar el TAG.

---

## Changelog

### v0.1 (2026-02-23)
- Version inicial del skill, migrado desde core/skills/spare_parts/resolve-equipment.md
- Agregados evals de triggering y funcionales
- Agregado script de validacion
