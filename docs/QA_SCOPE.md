# QA en VSC — Por qué la deuda ISO acumulada nos obliga a sumar QA Lead ya

**Autor:** David Cabezas — Lead Tech VSC
**Destinatario:** José Cortinat (CEO) · Equipo VSC
**Fecha:** 2026-04
**Contexto:** Plataforma AMS · 3 proyectos en producción · pipeline mining (Goldfields, Codelco)
**Normas de referencia:** ISO 9001 (Calidad) · ISO/IEC 27001:2022 · ISO/IEC 29119 (Testing) · ISO/IEC 25010

---

## Resumen ejecutivo

Recibí el video que pasaste sobre Claude Code + Playwright. Lo probé y confirma una capacidad real y útil — vamos a integrarla al pipeline en los próximos 2 sprints. Esto no es lo que está en discusión.

**Lo que sí está en discusión es esto:** VSC ya tiene **3 proyectos en producción sin QA formal**, y cada release adicional sin trazabilidad acumula deuda que ISO va a cobrar cuando intentemos certificarnos.

La pregunta no es *"¿la IA reemplaza al QA?"* — esa es la pregunta que parece, pero no es la importante. La pregunta importante es:

> **¿Cuánto más tiempo podemos seguir acumulando releases sin firma humana antes de que la deuda exceda el costo de tener QA desde ahora?**

Mi respuesta con datos: **estamos a ~3 meses del punto donde el costo de remediación retroactiva supera el costo de contratar QA Lead hoy.**

---

## 1. Lo que la IA con Playwright SÍ aporta (concedido y planificado)

No discutimos lo técnico. Hoy con Claude Code + Playwright puedo:

- E2E completos de 30+ pasos con autocorrección
- Regresión visual con screenshot diff
- Detección de bugs UI técnicos (404, JS errors, contraste)
- Reportes HTML auditables con video de la sesión
- Velocidad: 10x lo que haría un tester manual junior

**Plan concreto:** lo integramos al pipeline pre-deploy en sprint 14 y 15. Quedamos con cobertura E2E de happy path en 90%+ para AMS, marketing-vsc-landings y goldfields-platform. Esto se hace, esto va.

---

## 2. El problema que la herramienta no resuelve — la deuda ISO acumulada

### 2.1 Cómo audita ISO 9001 / 27001

Cuando aplicamos a certificación, el auditor **no certifica lo que haremos desde mañana** — certifica el sistema que ya está operando. Te pide:

> *"Muéstrame los últimos 12 meses de releases. Para cada uno quiero ver: ticket de requerimiento, código del feature, test plan firmado, evidencia de testing, aprobación de pase a producción, y la persona física que firmó esa aprobación."*

Si VSC aplica hoy:
- 3 proyectos × ~50 releases/año = ~150 releases en los últimos 12 meses
- Releases con test plan formal firmado: **0**
- Releases con aprobación de pase a producción identificada: **0**
- Segregación de funciones (autor ≠ aprobador): **violada en el 100%**

### 2.2 Las 3 cosas que pasan cuando aplicas con esta deuda

**Opción A — Te bajan el alcance del certificado:**
"OK, te certifico solo para proyectos iniciados desde 2026". Cuando Goldfields pida certificación que cubra AMS, el alcance no incluye AMS porque AMS se construyó pre-QA. **Resultado: el certificado no sirve para vender a Goldfields.**

**Opción B — Te exigen remediación retroactiva:**
Reconstruir documentación de los 3 proyectos hacia atrás. Costo estimado: **3-6 meses de trabajo a tiempo completo** de QA + dev + firmas antedatadas. Esto último es legalmente discutible y un auditor decente lo detecta.

**Opción C — Te rechazan la primera certificación:**
Tienes que operar con el SGSI funcionando "limpio" 6-12 meses antes de poder re-aplicar. **Pierdes licitaciones de mining durante todo ese periodo.**

Ninguna de las 3 es buena. Las tres son evitables si tomamos acción ahora.

---

## 3. La curva de la deuda — cifras del pipeline actual

| Momento | Releases acumulados sin QA | Costo remediación retroactiva | Costo de tener QA Lead desde ahora |
|---|---|---|---|
| Hoy (abril 2026) | ~150 | ~$15M-30M CLP | $0 (decisión a futuro) |
| +3 meses (julio 2026) | ~225 | ~$22M-45M CLP | ~$5M CLP (QA Jr Q3) |
| +6 meses (octubre 2026) | ~300 | ~$30M-60M CLP | ~$10M CLP |
| +12 meses (abril 2027) | ~450 | ~$45M-90M CLP | ~$20M CLP |

**El cruce ocurre entre el mes 2 y el mes 3.** Después de ese punto, salirse de la deuda cuesta más que tener al QA Jr todo el tiempo.

Esta no es una proyección teórica. Cada sprint que pasa sin firma humana es una fila más en el log que el auditor te va a pedir.

---

## 4. Los 4 problemas que la IA por sí sola no cubre

(Esto sigue siendo cierto, pero es secundario al argumento de la deuda.)

### 4.1 Falta de criterio de negocio
Playwright sabe hacer click. No sabe que cerrar una OT de tipo PM02 sin completar el aviso técnico rompe el cierre contable mensual de Goldfields.

### 4.2 Data real vs seed_demo_data.py
La automatización funciona contra datos limpios. Cuando llega el CSV real de SAP con encoding latin-1, fechas alemanas y comillas mal escapadas, el script falla o pasa en silencio.

### 4.3 Sesgo de confirmación (Hallucinated Fixes 2.0)
Si la misma IA que escribe el código escribe el script para probarlo, valida la interpretación del autor, no el requirement del cliente.

### 4.4 El documento como entregable
Las normas exigen Test Plan formal (ISO/IEC 29119-3), Test Cases mapeados a requisitos, Test Summary Report, liberación firmada. **Playwright produce un HTML report con timestamps. No firma nada.**

---

## 5. Qué propongo concretamente

### Acción inmediata (próximos 30 días)
1. **Contratar QA Jr** — perfil junior (1-2 años de experiencia), supervisado por mí como Lead Tech. Costo: $1.2M-1.8M CLP/mes
2. **Empezar la remediación de los 3 proyectos en paralelo** — antes de que la deuda crezca más
3. **Definir el Test Plan template basado en ISO/IEC 29119-3** — yo lo redacto en 1 semana, el Jr lo aplica desde el día 1

### Por qué Jr y no Senior
ISO no exige "senior" — exige **rol definido + competencia documentada + segregación de funciones**. Un Jr bien entrenado, supervisado técnicamente por mí y operando templates pre-armados, cumple los 3 requisitos. La segregación se mantiene porque el Jr (validador) es persona distinta al dev (autor). Senior queda como upgrade futuro cuando crezca la pipeline mining.

### Mediano plazo (3-6 meses)
1. **Implementar pipeline IA + QA híbrido**: la IA hace el trabajo técnico, el QA Lead firma y mantiene la trazabilidad
2. **Iniciar formalmente certificación ISO 27001** — el hub QA ya nos da 73% de cobertura, llegar a 95% con QA Lead lleva ~6 meses
3. **Auditoría interna de gap** contra Vendor Risk Assessment de Goldfields

### Decisión que necesito de ti
Una sola pregunta concreta:

> ¿Procedemos con publicación de la búsqueda de QA Jr esta semana, o esperamos al cierre del próximo deal?

Si esperamos al próximo deal, asumimos formalmente que aceptamos los $5M-10M CLP adicionales de costo de remediación que se acumulan en ese tiempo, **y** asumimos el riesgo de que el deal pida certificación ISO en RFP y no podamos responder.

---

## 6. Lo que NO te estoy pidiendo

- ✗ Frenar la integración de Playwright + Claude (al contrario, la aceleramos)
- ✗ Contratar un equipo de 5 testers (con 1 QA Jr supervisado alcanza)
- ✗ Contratar un Senior caro de $3M-3.5M/mes (un Jr bien entrenado cubre los requisitos ISO)
- ✗ Bajar la velocidad de desarrollo (los procesos ISO bien diseñados no frenan al equipo, lo formalizan)
- ✗ Empezar la certificación ISO mañana (es un proceso de 6-9 meses, hay tiempo)

**Te estoy pidiendo abrir la búsqueda del QA Jr en abril 2026 en lugar de octubre 2026, porque cada mes que esperamos cuesta más caro que el sueldo de la persona.**

---

## Anexo A — Detalle del cálculo de remediación retroactiva

| Concepto | Costo unitario | Cantidad (a 6 meses) | Total |
|---|---|---|---|
| Reconstrucción de Test Plan por proyecto | $4M-8M CLP | 3 proyectos | $12M-24M |
| Documentación de Test Cases retroactivos | $2M-4M CLP | 3 proyectos | $6M-12M |
| Generación de evidencia de testing per-release | $50K-100K CLP | 300 releases | $15M-30M |
| Auditoría legal del proceso de remediación | $1M-2M CLP | 1 | $1M-2M |
| **Total estimado** | | | **$34M-68M CLP** |

Comparado con: **QA Jr a 6 meses = $7M-11M CLP**.
**Ratio: 4x-6x más caro remediar que prevenir con un Jr supervisado.**

---

— **David Cabezas**, Lead Tech VSC
