---
name: Scope Freeze firmado como defensa contra scope creep de Jorge
description: Protocolo para evitar que Jorge agregue requisitos sobre la marcha sin compromiso previo. Empujar a firmar doc antes de codear.
type: feedback
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
Jorge tiende a dar feedback incremental que se siente como "¿por qué no
hiciste esto si era obvio?" cuando en realidad nunca lo mencionó.
Resultado: David entra en espiral de scope creep + agotamiento.

**Why:** David explicitó "me quiero pegar un tiro es insoportable pq ahora
dice weas que faltan pudo haberlas dicho desde un principio" (2026-04-22).
Patrón recurrente confirmado.

**How to apply:**

Antes de empezar implementación de cualquier módulo nuevo o feedback
grande de Jorge, sugerirle a David que exija un **Scope Freeze**
firmado (Google Doc 1 página):

- Entregables listados como checkboxes
- Criterios de aceptación escritos por Jorge (no por David)
- "Fuera de scope" explícito
- Fecha + firma

Cuando Jorge pida algo nuevo fuera del doc:
1. NO codear inmediato.
2. Responder: "¿está en el Scope Freeze firmado de X?"
3. Si no → abrir ticket de Change Request para próximo sprint.

Si David está en modo "hay que hacerlo ya" por presión, recordarle:
- José (decision maker) prefiere ver docs firmados ante disputas.
- Codear sin compromiso escrito es trabajo no facturable moralmente.
- Sin Scope Freeze, David siempre pierde la discusión.

Claude debe **proponer activamente** crear el doc cuando detecte:
- Jorge haciendo requests nuevos en feedback reunión
- David expresando frustración con "esto no lo dijo antes"
- Features "obvias" que aparecen tarde
