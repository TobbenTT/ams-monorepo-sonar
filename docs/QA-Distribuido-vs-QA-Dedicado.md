# QA Distribuido vs QA Dedicado
## Por qué "cada dev con su IA Playwright" nos saca de las licitaciones mineras

**David Cabezas — Lead Tech VSC · 2026-04**

> Cada `---` marca una nueva slide para conversión a pptx con `pandoc -t pptx` o similar.

---

## Slide 1 · La pregunta de José

> *"Si Claude + Playwright ya hace clicks, escribe tests E2E y autocorrige el código solo… ¿para qué necesitamos un QA dedicado? Que cada dev pruebe su propio código con su agente IA y listo."*

**La respuesta corta:** porque las normas ISO que nos exigen Goldfields y Codelco lo prohíben.

**La respuesta larga es esta presentación.**

---

## Slide 2 · Concedo lo técnico — la IA es brutal

| Capacidad | Hace 1 año | Hoy con Playwright + Claude |
|---|---|---|
| Tests E2E de UI | Manual / Selenium frágil | Autónomo, autorregenerativo |
| Detección de regresión visual | No existía low-budget | Screenshot diff + LLM judge |
| Cobertura de happy path | 30% manual | 90% automatizado |
| Velocidad de iteración | Días | Minutos |

**No vamos a discutir esto — es real, es nuestro, ya lo usamos.**

La pregunta no es si la IA puede hacer testing.
La pregunta es **si "cada dev con su IA" pasa una auditoría minera.**

---

## Slide 3 · El mito a destruir — "Cada dev con su agente IA"

**Lo que parece pasar:**
- Dev A escribe feature → Dev A escribe Playwright tests → ✓ pasan
- Dev B escribe feature → Dev B escribe Playwright tests → ✓ pasan
- Velocidad: 10x. Costos: bajos. Cobertura: alta.

**Lo que realmente pasa:**

1. **Tests aislados por dev** → cada agente tiene su contexto, sus mocks, sus assumptions
2. **Sin regresión cruzada** → Dev A cambia auth, los tests de Dev B no se vuelven a correr
3. **Sin mantenimiento centralizado** → 47 suites, 47 estilos, 47 fragilidades
4. **El sesgo del autor** → cada dev programa su test para validar lo que él entendió, no lo que el cliente pidió
5. **Falla silenciosa** → cuando un test rompe en CI, el dev autor lo "arregla" relajando el assert

**Resultado a 6 meses:** mucho test, poca cobertura real, ninguna confianza.

---

## Slide 4 · El argumento legal — "¿Es obligatorio tener QA?"

**Pregunta a abogado chileno:** ¿Hay ley que obligue a contratar un QA con título?
**Respuesta:** No.

**Pregunta a Goldfields / Codelco:** ¿Pueden ser nuestros proveedores sin certificación ISO ni SDLC auditable?
**Respuesta:** **No, descalificación inmediata.**

Las normas ISO no son leyes — son **contratos B2B de confianza**.
Las mineras te las exigen porque manejan infraestructura crítica.
Si tu software falla, ellos pierden millones o tienen accidentes.

**Sin certificación ISO 9001 + 27001, VSC no entra en el short-list de proveedores de minera grande. Punto.**

---

## Slide 5 · Segregación de Funciones (ISO 27001 A.5.3)

**Texto literal de la norma 2022:**

> "Los deberes y áreas de responsabilidad en conflicto deben estar segregados para reducir las oportunidades de modificación o uso indebido no autorizado o no intencional de los activos de la organización."

**Traducción al SDLC:**
- Quien escribe el código **no puede ser** quien aprueba su pase a producción
- Aplica también si la herramienta es una IA: la IA es la herramienta del dev, no una entidad independiente
- El control se chequea en auditoría con evidencia documentada de quién aprobó qué release

**Caso "cada dev con su IA":**
- Dev escribe código + Dev configura IA + Dev acepta resultado IA + Dev aprueba merge
- **= 1 sola entidad de responsabilidad**
- = NO conformidad mayor en auditoría ISO 27001

---

## Slide 6 · Validación Objetiva (ISO 9001 cl. 8.6)

**Cláusula 8.6 — Liberación de productos y servicios:**

> "La organización debe implementar las disposiciones planificadas, en las etapas adecuadas, para verificar que se cumplen los requisitos del producto y del servicio."

**Principio del conflicto de interés:**

> *"No puedes calificar tu propio examen."*

**Por qué importa:**
- El dev programa pensando en el "Happy Path" (lo que él imaginó)
- Si él mismo escribe el test, programa al bot para seguir ese mismo camino
- La validación pierde objetividad — no busca romper, busca demostrar
- El QA actúa como "abogado del diablo" + representante del usuario final

**El sesgo no es por mala intención — es estructural. Por eso la norma lo prohíbe explícitamente.**

---

## Slide 7 · "Todos responsables" = "Nadie responsable"

**Escenario en Vendor Risk Assessment de Goldfields:**

> Auditor: *"Estamos viendo el incidente de producción del 12-marzo. ¿Quién aprobó este pase a producción?"*
>
> VSC: *"Cada dev probó su parte con su agente IA antes del deploy."*
>
> Auditor: *"Pregunto quién aprobó la liberación. Necesito un nombre."*
>
> VSC: *"…el dev que hizo la feature, supongo."*
>
> Auditor: **No conformidad mayor — falta de SDLC auditable.**

**Las ISO exigen:**
- Un **owner identificable** del SGC (Sistema de Gestión de Calidad)
- Un **owner identificable** del SGSI (Sistema de Gestión de Seguridad)
- Trazabilidad completa: requisito → código → test → liberación → firmante

**Diluir la responsabilidad entre devs y agentes IA = la auditoría falla en 30 segundos.**

---

## Slide 8 · Lo que pierdes sin QA dedicado

| Consecuencia | Impacto en VSC |
|---|---|
| No conformidad ISO 9001 / 27001 | -65% pipeline (pierdes mining como vertical) |
| Vendor Risk Assessment fallido | Salida del short-list de Goldfields/Codelco |
| Sin Test Plan formal firmado | RFPs corporativos rechazados en filtro |
| Sin segregación de funciones | Imposible certificar ISO 27001 |
| Sin owner identificable | Riesgo legal directo al CEO (Ley 21.663) |
| Tests fragmentados sin cross-regression | Bugs en producción = penalizaciones contractuales |

**Estimación financiera:**
- Costo de NO contratar QA: ahorro de ~$36M CLP/año en sueldo
- Costo perdido por no entrar a mining: $50M-150M CLP/año por deal × 2-3 deals que NO firmaremos
- **Ratio: pierdes 4-12x lo que ahorras**

---

## Slide 9 · Lo que ganas con QA dedicado

| Función | Quién la hace |
|---|---|
| Tests automatizados E2E | IA (Playwright + Claude) — sin cambios |
| Mantenimiento de suite centralizada | QA Lead — define estándares, owner único |
| Test Plan formal por release | QA Lead — firma, presenta a auditores |
| Validación independiente | QA Lead — aprueba o veta releases |
| Triage de defectos detectados por usuario | QA Lead — prioriza, escala |
| Aprobación de pase a producción | QA Lead (firmado, con cargo) |
| Punto de contacto en auditorías | QA Lead — habla el lenguaje ISO |

**No es un equipo de 5 personas. Es 1 persona que firma.**

---

## Slide 10 · Modelo propuesto — Híbrido humano + IA

```
┌─────────────────────────────────────────────────────┐
│  CAPA 1 — AUTOMATIZACIÓN (ya existe)               │
│  - Playwright + Claude para E2E                     │
│  - Trivy + Gitleaks + Nuclei en pipeline           │
│  - Coverage objetivo 85%+ unit + integration       │
│  - Velocidad: 10x equipo manual                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 2 — QA LEAD HUMANO (lo que falta)            │
│  - 1 persona, rol QA Lead                          │
│  - Diseña Test Plan formal (ISO/IEC 29119-3)       │
│  - Firma liberaciones (ISO 9001 cl. 8.6)           │
│  - Independiente del equipo de desarrollo          │
│  - Costo: $2.5M-3.5M CLP/mes                       │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 3 — SEGREGACIÓN NATURAL (proceso)            │
│  - Dev autor no aprueba su propio merge            │
│  - QA firma la liberación a producción             │
│  - Auditor externo anual (muestreo de releases)    │
└─────────────────────────────────────────────────────┘
```

---

## Slide 11 · Resumen ejecutivo para José

**Lo que NO estoy proponiendo:**
- ✗ Reemplazar la IA con humanos haciendo clicks
- ✗ Contratar un equipo de 5 testers manuales
- ✗ Frenar la velocidad de desarrollo

**Lo que SÍ estoy proponiendo:**
- ✓ Mantener al 100% la automatización con IA (es nuestra ventaja)
- ✓ Sumar **1 QA Lead humano** que firme y dé independencia objetiva
- ✓ Habilitar certificación ISO y entrada a clientes mining

**Decisión binaria:**

| Sin QA Lead | Con QA Lead |
|---|---|
| Ahorras ~$36M CLP/año | Inviertes ~$36M CLP/año |
| Quedas fuera de mining | Eligible para Goldfields, Codelco, BHP |
| Tope de pipeline ~$200M CLP | Pipeline potencial $500M-1.000M CLP |
| Riesgo legal en CEO (Ley 21.663) | Riesgo distribuido a rol designado |

**Recomendación:** contratar QA Lead en Q3 2026 antes de las próximas licitaciones de Codelco.

---

## Slide 12 · Cierre

**La pregunta inicial era equivocada.**

No es *"¿reemplaza la IA al QA?"* — es *"¿la IA cumple las normas que las mineras nos exigen?"*

**La IA hace el trabajo técnico mejor que un humano. Pero no firma, no responde, no aporta independencia, y no pasa una auditoría ISO.**

Para vender a mineras necesitamos las dos cosas:
- La velocidad de la IA (la tenemos)
- La firma del humano (nos falta)

— **David Cabezas**, Lead Tech VSC
