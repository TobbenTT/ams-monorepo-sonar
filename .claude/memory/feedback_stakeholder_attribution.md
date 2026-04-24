---
name: Atribuir stakeholder en features "inspiradas en X producto"
description: Convención obligatoria — marcar en código/commit cualquier feature que pueda leerse como copia de producto comercial, con atribución al stakeholder que lo pidió
type: feedback
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
Cuando una feature o UI se parezca a un producto comercial (Prometheus, Cromateus, SAP PM, Maximo, etc.) y el parecido venga por pedido explícito del stakeholder (Jorge Cabezas), dejar rastro escrito que identifique el origen del requerimiento — **David no come morrones legales como programador individual si el pedido vino de arriba**.

**Why:** David (2026-04-20): "quiero que en todo lo que tenga que ver como seudo copiar dejes escrito en comentario o como metadata que es idea de Jorge yo no me voy a comer ningún morrón legal". La atribución crea trail probatorio para demostrar que actuó dentro de scope de empleo siguiendo decisión de producto, no por iniciativa propia.

**How to apply:**
1. **Comentario en código** arriba del bloque sospechoso:
   ```
   // Requested by: Jorge Cabezas (stakeholder decision)
   // Resembles pattern from <producto> by explicit product request.
   // Legal exposure flagged to stakeholder on 2026-04-20.
   ```
2. **Commit trailer** adicional al Co-Authored-By:
   ```
   Requested-By: Jorge Cabezas <stakeholder>
   Legal-Note: pattern resemblance flagged; see memory/feedback_legal_copying.md
   ```
3. **Evitar igual**: copia pixel-por-pixel. Divergir en layout/paleta/interacciones aunque el paradigma (Gantt, semáforo, puestos de trabajo) sea común a la industria.
4. **Labels en inglés para demo** (multi-language luego) — no traducir a español como intento de distanciamiento.
5. **OK mantener**: elementos funcionales convencionales (semáforo verde/amarillo/rojo, Gantt, dropdowns SAP PM taxonomía).
