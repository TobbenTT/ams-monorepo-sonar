# Seguridad en VSC — Por qué la deuda regulatoria nos obliga a sumar Security Lead ya

**Autor:** David Cabezas — Lead Tech VSC
**Destinatario:** José Cortinat (CEO) · Equipo VSC
**Fecha:** 2026-04
**Contexto:** 3 proyectos en producción · datos confidenciales de clientes · Ley 21.663 vigente · Ley 21.719 entra 2026
**Normas de referencia:** ISO/IEC 27001:2022 · NIST CSF 2.0 · Ley 21.663 Marco de Ciberseguridad · Ley 21.719 Datos Personales

---

## Resumen ejecutivo

El video de Claude Code + Playwright también aplica a seguridad — el qa-scanner del hub ya hace exactamente eso (Trivy + Gitleaks + Nuclei cada 24h, ya bajamos vulnerabilidades de 1394 a 76). La automatización funciona y la seguimos potenciando.

**El problema no es técnico — es regulatorio y de responsabilidad legal.** VSC opera 3 proyectos con datos confidenciales sin tener formalmente designado un responsable nominal de seguridad, y eso ya nos pone en exposición directa con la Ley 21.663 chilena (vigente desde 2024) y con cualquier Vendor Risk Assessment que nos manden Goldfields o Codelco.

La pregunta no es *"¿necesitamos un experto humano para hacer pentests?"* — la IA los hace.
La pregunta importante es:

> **¿Por cuánto tiempo más podemos operar sin Security Lead designado antes de que un incidente de seguridad o un cliente con auditoría nos cobre la deuda regulatoria que tenemos acumulada?**

Mi respuesta: **estamos en exposición legal directa desde hace 18 meses.** Cada día sin designar al rol es un día más sin cumplir el Art. 8 de la Ley 21.663.

---

## 1. Lo que la IA con scanners SÍ hace en seguridad (ya implementado)

No discutimos lo técnico. Hoy con la pipeline del hub QA tenemos:

- **DAST automatizado** — barrer rutas buscando XSS, IDOR, falta de auth checks
- **SAST en cada commit** — Trivy + Gitleaks + Semgrep
- **Detección de secretos hardcodeados** — Gitleaks pre-commit y en pipeline
- **Vulnerabilidades de dependencias** — auto-detección + parches
- **DAST con Nuclei** — 5000+ templates, corre cada 24h
- **Reportes auditables** — `/iso-27001` del hub muestra cobertura en vivo

**Resultado:** 1394 → 76 vulnerabilidades en 4 meses. Esto era trabajo de 3 pentesters junior. Hoy lo hace la pipeline. Bien.

**Pero esto cubre el 30% del trabajo de seguridad. Lo que falta es el otro 70%, que es regulatorio + analítico.**

---

## 2. La deuda regulatoria que estamos acumulando

### 2.1 Ley 21.663 — Marco de Ciberseguridad de Chile

Vigente desde 2024. Se aplica a VSC por procesar datos de clientes mining (sectores críticos definidos en el reglamento).

| Artículo | Exigencia | Estado VSC |
|---|---|---|
| Art. 8 | Designar persona responsable de gestión de ciberseguridad | **No designada** |
| Art. 27 | Reportar incidentes a la ANCI en 24h | Sin canal definido |
| Art. 28 | Plan de respuesta a incidentes con responsable nominal | No existe |
| Art. 31 | Multas de hasta 20.000 UTM (~$1.300M CLP) por incumplimiento | Riesgo activo |

**No tener designado al responsable nominal hoy ya es incumplimiento.** No es un riesgo futuro — es una infracción acumulándose desde la entrada en vigencia de la ley.

### 2.2 Ley 21.719 — Datos Personales (entra 2026)

Si VSC procesa datos personales de empleados de Goldfields, Codelco o cualquier cliente:
- Obligación de DPO (Data Protection Officer) designado
- Obligación de registro de tratamiento de datos
- Multas hasta 20.000 UF (~$750M CLP)
- **Plazo de adecuación: ya empezó a correr**

### 2.3 ISO 27001 control A.6.1 — Roles, responsabilidades, autoridades

Cuando aplicamos a certificación, el auditor pide:
- Nombre del CISO o equivalente
- Documento que formalice su designación
- Plan de seguridad firmado por esa persona
- Reportes de incidentes con responsable identificado

**Sin esa designación, el control A.6.1 está abierto y la certificación no avanza.**

---

## 3. La deuda crece — cifras concretas

| Momento | Días sin responsable designado | Riesgo de exposición |
|---|---|---|
| Hoy (abril 2026) | ~540 días desde Ley 21.663 vigente | Multa potencial activa |
| +3 meses | ~630 días | + auditoría posible de ANCI |
| +6 meses | ~720 días | + Vendor Risk Assessment fallidos |
| +12 meses | ~900 días | + entrada Ley 21.719 sin DPO |

A diferencia del QA, **acá la deuda no es solo costo de remediación — es exposición legal directa con multas reales.**

Si en cualquiera de estos meses ocurre un incidente menor de seguridad (un dev sube credenciales por error, un proveedor tiene una brecha, un cliente reporta datos expuestos), VSC tiene que reportar a la ANCI sin tener canal formal, sin tener responsable designado, sin tener plan de respuesta. **Eso es agravante automático en el procedimiento sancionatorio.**

---

## 4. Los 3 problemas de profundidad que la IA no cubre

(Esto sigue siendo cierto, pero secundario al argumento legal.)

### 4.1 Pentest real requiere malicia y creatividad
Encadenamiento de vulnerabilidades, evasión de filtros, lógica de negocio explotable. Un script sigue patrones; un atacante rompe los patrones.

### 4.2 Threat modeling con contexto minero
Insider threat / espionaje industrial / supply chain attacks / riesgos físico-operativos. Un planner de Goldfields exportando un CSV de SAP es funcionalidad legítima — pero también puede ser exfiltración a la competencia. Eso solo lo evalúa un humano que entiende el sector.

### 4.3 Compliance y firma legal
La IA no puede firmar DPAs, NDAs ni reportes de incidentes a la ANCI. Quien lo intente firmar como "operador del agente IA" hereda la responsabilidad legal personal.

---

## 5. Qué propongo concretamente

### Acción inmediata (próximos 30 días)
1. **Designar formalmente Security Lead** — puede ser part-time / contractor inicialmente
   - Costo: $1.5M-2.5M CLP/mes part-time, $3.5M-5M CLP/mes full-time
   - Idealmente alguien con cert (CISSP, CISM o equivalente)
2. **Documento formal de designación** — necesario para el Art. 8 de Ley 21.663
3. **Establecer canal de incidentes y plan de respuesta** — yo puedo redactar el draft en 1 semana
4. **Comunicar a la ANCI** la designación del responsable

### Mediano plazo (3-6 meses)
1. **Pentest externo de los 3 proyectos** (NSEC, Dreamlab o similar — ~$8-15M CLP)
2. **Iniciar certificación ISO 27001 formalmente**
3. **Plan de adecuación a Ley 21.719** antes de su entrada en vigencia

### Decisión que necesito de ti
Dos preguntas concretas:

1. ¿Vamos con Security Lead **part-time** ($1.5-2.5M/mes, ~10h semanales) o **full-time** ($3.5-5M/mes)?
2. ¿Lo contratamos esta semana o esperamos a que el primer cliente nos lo exija explícitamente en RFP?

Mi recomendación: **part-time desde mayo 2026**. Es el costo mínimo viable para cumplir el Art. 8 sin sobre-invertir, y es un perfil mucho más fácil de encontrar.

---

## 6. Lo que NO te estoy pidiendo

- ✗ Frenar el qa-scanner ni la pipeline de SAST/DAST (la mantenemos)
- ✗ Contratar un equipo de seguridad (con 1 persona part-time alcanza para empezar)
- ✗ Hacer un pentest de $50M (con uno externo de $10M es suficiente como base)
- ✗ Pausar desarrollo (los procesos de seguridad bien diseñados no frenan, formalizan)

**Te estoy pidiendo formalizar la designación del responsable nominal antes de que un incidente nos pille sin él.**

---

## Anexo A — Comparación de escenarios

| Escenario | Costo año 1 | Riesgo legal | Riesgo comercial |
|---|---|---|---|
| Sin Security Lead | $0 | Multas Ley 21.663 hasta $1.300M CLP | Pierde Goldfields/Codelco si piden CISO |
| Part-time desde mayo | ~$24M CLP | Cumplimiento Art. 8 inmediato | Eligible para RFPs mining |
| Full-time desde mayo | ~$48M CLP | + cobertura activa de incidentes | + capacidad de pentest interno |

**Recomendación:** part-time el primer año, evaluar pasar a full-time cuando cerremos el primer deal mining.

---

## Anexo B — Decisión simbólica vs decisión legal

Una pregunta que me hago: ¿es legítimo decir "designo a David como Security Lead a tiempo parcial mientras buscamos el contractor"?

Respuesta: **sí, legalmente es válido** y de hecho es lo que hacemos hoy de facto. Pero formalizarlo por escrito y comunicarlo a la ANCI es lo que nos quita la exposición. Si quieres que tome ese rol nominal hasta que tengamos al externo, lo asumo — pero necesitamos:
- Carta de designación firmada por ti
- Adendum a mi contrato reflejando la responsabilidad
- Aumento salarial proporcional ($300K-500K adicional/mes mientras dure)
- Compromiso de buscar al externo en plazo de 90 días

Con eso cumples Art. 8 desde la próxima semana. Si te tinca esa salida intermedia, lo armamos.

---

— **David Cabezas**, Lead Tech VSC
