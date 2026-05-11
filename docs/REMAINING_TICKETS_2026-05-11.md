# Tickets restantes — análisis y plan

**Fecha**: 2026-05-11

## SF-661 — Agente lee OT completa para alimentar 7 funciones

**Estado**: SP8 (agentic spec de Jorge — Tanda 13).

**Las 7 funciones**:
1. Resumen ejecutivo OT (texto + métricas)
2. Predicción HH real vs plan
3. Detección de riesgos en operaciones
4. Recomendación de skills mix óptimo
5. Sugerencia de materiales faltantes
6. Alertas de seguridad (LOTO, ATEX, altura)
7. Causa raíz post-cierre (alimenta RCA)

**Aproximación**: cada función = una skill del agente Planning (`agents/planning/skills/*.md`) que recibe el `wo` completo via tool wrapper + emite output estructurado.

**Pre-requisito**: data real Goldfields cargada (0B2). Sin data real, las predicciones son ruido.

**Estimado**: 5-7 días (cada función requiere prompt + tests + integración UI).

---

## SF-662 — Preparativos OT estilo Rappi (tracking)

**Estado**: SP8 — overlap con Tanda 14 (Programación, item PR12 del Excel Jorge).

**Spec**:
- Listado de repuestos/insumos × OT × día
- Fechas de despacho bodega → patio
- Recepción conforme/no conforme (firma)
- Layout PDF de disposición de materiales en sitio
- Tracking estilo Rappi: "Despachado · En tránsito · Recibido"

**Modelo BD**: nuevo `preparativos` con `id, wo_id, item_code, qty, status, dispatched_at, received_at, received_by, layout_url, conforme`.

**Estimado**: 3-4 días (modelo + endpoints + UI + integración con bodega).

---

## SF-664 — Decisión BD depurada vs nueva desde cero

**Estado**: decisión cliente. Requiere call.

**Opciones**:
- **A. Depurar BD actual**: limpieza in-place, mantener historia (~3 días trabajo Carlos).
- **B. Reset y carga limpia**: dropdb + restore desde planillas cliente (~5 días).

**Recomendación interna**: A (preserve historia, audit log, RCA, lessons learned).

**Owner**: Magdalena + cliente Jorge Alquinta.

---

## SF-665 — Reactivar funciones externas desactivadas

**Estado**: pendiente la lista específica de qué reactivar.

**Funciones conocidas que están desactivadas**:
- Ruta `/contractors` (cerrado en SF-671 — Cuadrilla Contratista retirada)
- Algunos endpoints agentic con stub en `agents/_disabled/`
- AI Agents tab oculto por default (`AIAgents.jsx` accessed via `/ai-agents`)

**Acción**: pedir a Jorge lista explícita de funciones a reactivar.

---

## SF-655 — Comentarios multimedia + agente IA

**Estado**: parcial.

**Hecho**:
- Audio ✅ (SF-674)
- Foto ✅ (esta tanda)

**Pendiente**:
- Agente IA que LEA los comentarios y extraiga: causa raíz suggestion, severity, recurrencia. Va con SF-661.

---

## SF-656 — Buscador OT + auditoría HH/Día-Noche/Sobrecapacidad

**Estado**: parcial.

**Hecho**:
- Buscador ✅ (SF-669)

**Pendiente**:
- Auditoría visual: indicador de sobrecapacidad por técnico (>40h/semana), bucket día/noche con violaciones de turno (técnico noche asignado a día). Ya existe parcial en Scheduling Technicians view; falta dashboard dedicado y banner alert.

---

## SF-604 — BUG-13 error botones edición (AM-OCP legacy)

**Estado**: probable resuelto por fixes posteriores. Falta repro.

**Acción**: solicitar a QA que reintente la prueba; si reproduce, abrir nuevo ticket con contexto actualizado.

---

## Resumen acción inmediata

| Ticket | Acción ahora | Bloqueado por |
|--------|--------------|---------------|
| SF-661 | A SP8 backlog | data real Goldfields (0B2) |
| SF-662 | A SP8 backlog | Spec definitivo con Jorge |
| SF-664 | Pendiente call cliente | Magdalena |
| SF-665 | Pedir lista | Jorge |
| SF-655 (foto+audio) | ✅ hecho | — |
| SF-655 (agente IA) | A SP8 | — |
| SF-656 (buscador) | ✅ hecho | — |
| SF-656 (audit visual) | Próxima tanda | — |
| SF-604 | Solicitar repro QA | — |
