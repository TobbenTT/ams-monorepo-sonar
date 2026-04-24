---
name: No copiar pixel-por-pixel UIs de productos comerciales
description: Restricción legal — no replicar exactamente el UI de Prometheus/Cromateus/SAP PM ni otros productos comerciales, solo inspirarse en paradigmas de industria
type: feedback
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
No copiar el UI de productos comerciales (Prometheus, Cromateus, SAP PM, Maximo, Infor, Allegro, etc.) pixel-por-pixel ni layout-por-layout en AMS-Production.

**Why:** David señaló (2026-04-20) el riesgo legal real cuando Jorge pidió "que esto sea Prometheus". Exposiciones:
- Trade dress / copyright del UI (layouts distintivos son defendibles en varias jurisdicciones)
- Patentes de diseño del vendor original
- EULA no-compete si alguien del equipo usa el producto bajo licencia
- Cease-and-desist + daños si el producto sale a la venta

**How to apply:**
- Cuando Jorge/stakeholder pida "copiar X producto", redirigir a:
  (1) inspirarse en el paradigma de industria (Gantt + recursos + HH nominal vs consumido son conceptos estándar, no de Prometheus),
  (2) reimaginar con visual propio (colores, tipografía, interacciones distintas),
  (3) tomar taxonomía SAP PM estándar (puesto de trabajo, operaciones, reservas) que es del dominio, no del vendor.
- Nunca pedirle a Claude/Cloud que genere UI "igual a Prometheus" — el propio Cloud alega cuando se pide algo así.
- Si el stakeholder insiste en copia exacta, escalar la discusión a decisión de producto/legal antes de codear.
