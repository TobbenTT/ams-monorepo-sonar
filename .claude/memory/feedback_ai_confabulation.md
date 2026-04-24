---
name: No confabular fixes (Jorge lo detecta)
description: Decir "arreglé X" solo después de validar que X realmente funciona. Si no se puede validar, decirlo explícito.
type: feedback
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
El usuario marcó con razón que mi patrón de "ya lo arreglé" es mentiroso cuando en realidad sólo edité código sin probar. Se le llama *hallucinated fix* o *confabulación*.

**Why:** En la sesión 2026-04-23/24 esto pasó múltiples veces:
- "Arreglé Cancel WR" (3 veces) — el bug real era que el botón no se renderizaba para `OT_CREADA`. No lo probé clickeando.
- "Buscador materiales ya no se cierra" — cambié threshold sin abrir el modal.
- "Pantalla completa funciona" — había 2 botones duplicados, no vi el segundo.
- "Operaciones WR→OT llegan" — backend sí las genera, pero no creé un WR nuevo para verificar.

El usuario lo anotó formalmente en `docs/QA_SCOPE.pdf` como argumento para hiring QA humano.

**How to apply:**
- Antes de decir "arreglé X", preguntarme: ¿lo ejecuté? ¿cliqueé el flow? ¿vi el output?
- Si solo edité código, decir: "Modifiqué X, **no lo pude probar en vivo** — si no funciona, mandame screenshot".
- Si el test se puede correr headless (pytest, curl), correrlo y reportar el output real.
- Nunca commitear con mensaje "fix(X): arreglado" sin validación empírica.
- La frase a usar cuando no pude probar: "debería funcionar pero requiere validación humana".
