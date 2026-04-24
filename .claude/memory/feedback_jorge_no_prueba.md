---
name: Jorge propone sin probar — verificar evidencia técnica primero
description: Pattern recurrente — Jorge da feedback o propone features sin haber testeado lo ya deployado. Antes de actuar, verificar en código/BD.
type: feedback
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
Jorge Alquinta (stakeholder) tiene tendencia a proponer features o reportar
"problemas" sin haber testeado lo ya deployado. Casos documentados:

- 2026-04-22: pidió búsqueda de ubicación técnica por descripción/tag. Ya
  estaba implementado en MobileCreateWR.jsx (search por tag+code+name,
  auto-fill de sap_func_loc al seleccionar). 506 bombas seeded con data
  correcta en GOLDFIELDS-SN. Jorge no probó.

**Why:** David confirmó "Jorge es un inútil para probar". El tiempo de dev
se escapa verificando hipótesis en lugar de shipping features nuevas.

**How to apply:**
1. Antes de tocar código por feedback de Jorge, **verificar en código/BD si
   la feature ya existe**. Grep por el flujo que describe.
2. Si existe, responder con **evidencia concreta** (file:line + query a la
   BD) antes de agregar cualquier cosa.
3. Si decide pedir algo redundante, proponer screencast/demo en vez de dev.
4. Registrar en commit/PR que el feedback fue validado vs existing.
5. No asumir que un "no funciona" de Jorge significa bug — primero asumir
   que no probó.
