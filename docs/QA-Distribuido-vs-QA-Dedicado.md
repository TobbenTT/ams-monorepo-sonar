# La deuda silenciosa
## Por qué cada release sin QA es una factura que ISO va a cobrar

**David Cabezas — Lead Tech VSC · 2026-04**

---

## Slide 1 · La pregunta correcta

**No es:**
> *"¿La IA reemplaza al QA?"*

(Esa pregunta tiene respuesta técnica obvia — la IA acelera, pero no firma)

**Es:**
> *"¿Cuánto cuesta seguir acumulando releases sin QA antes de que ISO nos pida la trazabilidad?"*

Esta pregunta tiene una respuesta numérica. Y los números no son cómodos.

---

## Slide 2 · El video que pasó José

**Confirmado:** Claude Code + Playwright es brutal. Lo probé.
**Confirmado:** lo metemos al pipeline en sprint 14 y 15.
**Confirmado:** vamos 10x más rápido en testing técnico.

**Esto no es lo que está en discusión.**

Lo que sigue es lo que la demo no muestra:
**lo que pasa cuando llega el auditor de Goldfields a pedirnos los últimos 12 meses de releases firmados.**

---

## Slide 3 · El estado actual de VSC

```
┌──────────────────────────────────────────┐
│  3 proyectos en producción              │
│  ~150 releases en últimos 12 meses      │
│  0 con test plan formal firmado         │
│  0 con aprobación de pase identificada  │
│  0 con segregación de funciones         │
└──────────────────────────────────────────┘
```

Cada release que se mergeó sin firma humana es una entrada en el log que no podremos auditar.

**No es deuda técnica — es deuda regulatoria.** Crece sola, no se va sola.

---

## Slide 4 · Cómo audita ISO 9001 / 27001

El auditor **no certifica el futuro**. Certifica **lo que ya está operando**.

Te pide:
- Ticket del requerimiento → ¿existe?
- Código del feature → ¿está versionado?
- Test plan firmado → ¿quién y cuándo?
- Aprobación de pase a producción → **nombre de la persona**
- Segregación de funciones → autor ≠ aprobador

**Si no puedes mostrar esto para los últimos 12 meses, el certificado no avanza.**

---

## Slide 5 · Las 3 cosas que pasan si aplicamos hoy

**Opción A — Te bajan el alcance:**
"Te certifico solo desde 2026". AMS queda fuera del alcance. Inservible para vender a Goldfields.

**Opción B — Remediación retroactiva:**
3-6 meses reconstruyendo papeleo. Costo: $34M-68M CLP. Auditor decente lo detecta.

**Opción C — Te rechazan:**
6-12 meses operando "limpio" antes de re-aplicar. Pierdes licitaciones todo ese tiempo.

**Las 3 son evitables si actuamos ahora.**

---

## Slide 6 · La curva de la deuda

```
Costo CLP
   ↑
   │                                              ╱── Remediación
80M┤                                          ╱
   │                                      ╱
60M┤                                  ╱
   │                              ╱
40M┤                          ╱
   │                      ╱
20M┤  ◄── Decisión   ╱
   │       hoy   ╱──────────────────── QA Lead contratado ahora
 0 ┤_________╱______________________________________→ Tiempo
   0     3 meses   6 meses     9 meses    12 meses
```

**Cruce:** mes 4-5. Después de ese punto, salirse cuesta más que tener QA todo el tiempo.

---

## Slide 7 · Lo que también acumulamos del lado seguridad

**Ley 21.663 (Marco de Ciberseguridad, vigente 2024):**
- Art. 8: obligación de tener responsable de ciberseguridad designado
- VSC opera con datos confidenciales de mining = **540 días en incumplimiento acumulado**
- Multas: hasta 20.000 UTM (~$1.300M CLP)

**Ley 21.719 (Datos Personales, entra 2026):**
- Obligación de DPO si manejas datos sensibles
- Plazo de adecuación corriendo

**No es prevención. Es exposición legal activa hoy.**

---

## Slide 8 · El argumento legal — "Cada Dev con su IA Playwright"

**ISO 27001 control A.5.3 — Segregación de Funciones:**
> *"Las tareas y áreas de responsabilidad en conflicto deben estar segregadas para reducir las oportunidades de modificación o uso indebido no autorizado."*

**Si Dev escribe código + configura IA + acepta resultado IA + aprueba merge:**
= **una sola entidad de responsabilidad**
= **No conformidad mayor en auditoría ISO 27001**

La IA es la herramienta del dev. No una entidad independiente. **Para el auditor, sigue siendo el creador validándose a sí mismo.**

---

## Slide 9 · Mi propuesta concreta

### **QA Lead — abril 2026**
- 1 persona, perfil senior
- Responsabilidades: Test Plan formal, validación independiente, firma de liberación
- Costo: $2.5M-3.5M CLP/mes

### **Security Lead — mayo 2026**
- 1 persona, idealmente part-time / contractor
- Responsabilidades: cumplimiento Ley 21.663, threat modeling, firma DPAs
- Costo: $1.5M-2.5M CLP/mes part-time

### **Total mensual:** $4M-6M CLP
### **Vs costo de remediación retroactiva en 12 meses:** $34M-68M CLP

**Ratio 6x-12x: prevenir es más barato que remediar.**

---

## Slide 10 · La decisión que necesito de ti

**Dos preguntas concretas:**

1. **¿Abrimos las búsquedas de QA Lead y Security Lead esta semana?**
   - Sí → publicación en LinkedIn / Get on Board / Trabajando.com en 7 días
   - No → asumimos formalmente $5M-10M CLP adicionales de deuda hasta la próxima decisión

2. **¿Quieres que asuma el rol nominal de Security Lead temporalmente** mientras buscamos al externo (90 días máx)?
   - Sí → carta de designación + adendum salarial → cumplimos Ley 21.663 desde la próxima semana
   - No → quedamos en exposición legal hasta tener al contractor

---

## Slide 11 · Lo que NO te estoy pidiendo

- ✗ Frenar la integración de Claude + Playwright (al contrario, la aceleramos)
- ✗ Contratar equipos de QA o seguridad (1 persona en cada rol alcanza)
- ✗ Empezar la certificación ISO mañana (es proceso de 6-9 meses, hay tiempo)
- ✗ Bajar la velocidad de desarrollo (los procesos bien diseñados no frenan, formalizan)

**Te estoy pidiendo abrir las dos búsquedas en abril 2026 en lugar de octubre 2026.**
**Diferencia: $20M-40M CLP en deuda evitada + cumplimiento legal inmediato.**

---

## Slide 12 · Cierre

**La automatización con IA no es la pregunta — es nuestra ventaja competitiva.**

**La pregunta es esta:**

¿Vamos a operar 12 meses más sin QA y Security formales, sabiendo que cada release es una factura que ISO eventualmente nos va a cobrar?

O preferimos pagar el costo conocido ahora ($4M-6M/mes) y entrar a las licitaciones de mining con el papeleo en regla.

**No hay tercera opción.** O acumulamos deuda, o la prevenimos.

— **David Cabezas**, Lead Tech VSC
