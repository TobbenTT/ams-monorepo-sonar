# Logica de Deteccion de Duplicados — AMS Platform

## Hay DOS sistemas de deteccion de duplicados:

---

## 1. Frontend: `findDuplicates()` (WorkRequests.jsx linea 1011)

**Criterio:** Mismo equipo + status abierto

```javascript
function findDuplicates(currentReq, allRequests) {
  const openStatuses = ['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'IN_PROGRESS', 'PENDIENTE', 'APROBADO'];
  return allRequests.filter(r =>
    r.id !== currentReq.id &&                    // No es el mismo WR
    r.equipment_tag === currentReq.equipment_tag && // MISMO equipo
    openStatuses.includes(r.status)               // Status abierto
  );
}
```

**Cuando se usa:** Al abrir el detalle de un WR — muestra el carrusel 3D con duplicados

---

## 2. Backend: `POST /work-requests/check-duplicates` (work_requests.py linea 638)

**Criterios (en orden):**

1. **Equipment TAG match:** El WR existente tiene el mismo `equipment_tag` que el nuevo
2. **O mention en descripcion:** Si no se da TAG, busca si el TAG del WR existente aparece en el texto de la descripcion
3. **Status abierto:** Solo WRs en `DRAFT, PENDING_VALIDATION, VALIDATED, IN_PROGRESS, PENDIENTE, APROBADO`
4. **Ultimos 30 dias:** Solo WRs creados en los ultimos 30 dias
5. **Similitud de texto:** Cuenta palabras compartidas entre descripciones (overlap / union)
   - Si hay texto en ambos: calcula similitud real (0.0 a 1.0)
   - Si no hay texto pero mismo equipo: similitud = 0.5

**Cuando se usa:** Al seleccionar un equipo en FailureCapture — muestra warning de duplicados antes de crear

**Resultado:** Lista ordenada por similitud (mayor primero), con:
- request_id, status, equipment_tag, priority
- description (primeros 300 chars)
- similarity score (0.0 a 1.0)
- created_at

---

## Resumen

| Aspecto | Frontend | Backend |
|---------|----------|---------|
| Match por | equipment_tag exacto | equipment_tag + texto |
| Ventana temporal | Todos los WRs cargados | Ultimos 30 dias |
| Similitud texto | No | Si (word overlap) |
| Status filtrado | 6 estados abiertos | 6 estados abiertos |
| Se muestra en | Carrusel 3D al abrir WR | Warning al crear WR |

---

## NO es un bug — es por diseño

Los duplicados se detectan por **mismo equipo con avisos abiertos**. Si alguien crea 3 WRs para el mismo "Acumulador aire AR0002", los 3 se marcan como potenciales duplicados porque:

1. Mismo `equipment_tag` (1210AR0002)
2. Todos en status abierto (PENDIENTE, APROBADO, etc.)
3. Creados dentro de 30 dias

Esto es correcto — en una planta real, si hay 3 avisos abiertos para el mismo equipo, es probable que sean duplicados o que el equipo necesita atencion urgente. El planificador decide si son reales o no usando el boton X para descartarlos.
