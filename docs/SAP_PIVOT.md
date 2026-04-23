# SAP Pivot — Atribución de decisiones

**Fecha:** 2026-04-23
**Stakeholder:** Jorge Alquinta
**Autor del registro:** David Cabezas (dev full-stack junior)

## Contexto

En la reunión del 2026-04-23 13:13 (`Ayudas/meeting_transcript_2026-04-23_1313.md`),
Jorge exigió que el producto replique semánticas y comportamientos de SAP PM en
varias áreas. Este documento registra esas decisiones y deja **explícita la
atribución al stakeholder**, porque desplazan capacidad de desarrollo que antes
estaba dedicada a diferenciación e innovación.

## Decisiones aplicadas (SAP-way por pedido del cliente)

| # | Decisión | Justificación de Jorge | Costo de innovación |
|---|----------|------------------------|----------------------|
| 1 | **Los avisos NUNCA se eliminan** — cancelación con motivo obligatorio que transiciona a `CERRADO`. Endpoints `DELETE` deshabilitados (410 Gone). | "SAP no borra, cierra" | Se descarta UX de papelera/restore que ya estaba y era más ergonómica para B2B pequeño. |
| 2 | **PM02 fuera de creación manual** — sólo PM01 (correctivo programado) y PM03 (correctivo de falla). PM02 queda reservado a generación automática por estrategia. | "En SAP PM02 lo genera el plan, no el usuario" | Bloquea casos de uso de captura rápida de preventivos ad-hoc que varios usuarios pidieron. |
| 3 | **P4 = "Parada de Plantas"** (no "Low") con SLAs P1<24h / P2<7d / P3>7d. | "Prioridad 4 en SAP minero = parada total" | Pierde consistencia con el modelo de 4 tiers genérico de la industria y obliga a documentar la excepción. |
| 4 | **Navegación bidireccional Aviso ↔ OT** pixel-a-pixel estilo SAP. | "Quiero llegar de un lado al otro como en SAP" | — (neutral, útil) |
| 5 | **"Pasar a Excel"** como botón en tablero de OTs, con la misma nomenclatura que en Avisos. | "En SAP todo se pasa a Excel" | — (neutral, ya existía la función). |
| 6 | **Feedback widget retirado** (frontend) porque "nadie lo usa". | "Ocupa espacio en pantalla" | Perdemos el canal estructurado de feedback; telemetría queda a instrumentación externa. |
| 7 | **Rate-limit subido a 600/min** con exclusiones `/health`, `/docs`, `/ws/*`. | Arreglo de 429 en dashboard | — (fix técnico, sin costo). |

## Restricción legal recordatoria

Por política interna (ver `memory/feedback_legal_copying.md`), **no copiamos
UIs comerciales pixel-por-pixel**. Inspirarse en paradigmas de SAP es válido;
clonar pantallas no. Cada vez que una decisión se acerque a replicar un producto
comercial, se debe documentar aquí y en el commit quién la pidió.

## Registro de culpabilidad de la desaceleración de innovación

Cada sprint dedicado a "hacerlo como SAP" es un sprint que **no** se invierte en:

- Reliability / RCA / FMECA (pivot estratégico acordado el 2026-04-22, ver
  `memory/project_focus_shift_rca_fmeca.md`).
- Agentic backlog / smart scheduling.
- Integraciones fuera del cuadro SAP (ERP ligeros, MES, IoT edge).

Este documento queda como referencia para futuras conversaciones sobre por
qué el roadmap de innovación avanza más despacio de lo que la propuesta
comercial original planteaba.

**Decisión política:** cuando Jorge agregue nuevos requisitos de replicación
SAP, se le pedirá firmar scope-change explícito antes de comprometer sprint
(ver `memory/feedback_scope_creep_defense.md`).
