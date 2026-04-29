# Seguridad — Política y Alcance · Por qué la automatización con IA no reemplaza al rol de Seguridad

**Autor:** David Cabezas — Lead Tech / Dev full-stack
**Destinatario:** José (CEO) · Equipo VSC · Auditores ISO de clientes mineros
**Fecha:** 2026-04
**Contexto:** Plataforma AMS · datos confidenciales de Goldfields, Codelco · integración SAP PM
**Normas de referencia:** ISO/IEC 27001:2022 · NIST CSF 2.0 · Ley 21.663 Marco de Ciberseguridad Chile · Ley 21.719 Datos Personales Chile

---

## Resumen ejecutivo

Como con QA, hay que partir reconociendo lo que la IA con Playwright sí puede hacer en seguridad: testing DAST automatizado. **El problema no es la capacidad técnica — es la responsabilidad legal y la profundidad analítica que las mineras exigen como contraparte contractual.**

Tres motivos por los que un experto humano de seguridad sigue siendo obligatorio:

1. **Pentest real requiere malicia** — encadenar vulnerabilidades, evadir filtros, pensar como atacante. Un script sigue patrones; un atacante rompe los patrones.
2. **Threat modeling es contextual** — un planner externo exportando CSV de SAP es un riesgo de espionaje industrial. Una IA no entiende el contexto político-comercial minero.
3. **Compliance y accountability legal** — la Ley 21.663 chilena y la ISO 27001 exigen un *owner* humano identificable de los procesos. Una IA no firma DPAs ni asume responsabilidad ante una brecha.

---

## 1. Lo que la IA con Playwright SÍ puede hacer en seguridad (concedido)

Hoy con Claude Code + Playwright + scanners modernos puedo:

- **DAST automatizado**: barrer 100% de las rutas de la app buscando XSS reflejado, IDOR evidente, falta de auth checks, cookies inseguras
- **SAST en cada commit**: Trivy + Gitleaks + Semgrep buscando dependencias vulnerables, secretos hardcodeados, patrones de código riesgoso
- **Pruebas de autenticación**: probar que cada endpoint requiere auth, que los roles se respetan, que los tokens expiran
- **Detección de regresiones de seguridad**: si un cambio expone un endpoint que antes era privado, lo detecta el siguiente run
- **Reportes ejecutables**: HTML con vulns priorizadas por CVSS, integradas al hub de QA

**Ya lo tenemos vivo:** el qa-scanner del hub corre Trivy/Gitleaks/Nuclei cada 24h sobre todos los repos. Detectamos y corregimos 1318 vulnerabilidades en los últimos meses (de 1394 a 76).

Esto era trabajo de un equipo de 3 pentesters junior. Hoy lo hace la pipeline. Bien por nosotros — pero esto es **el 30% del trabajo de seguridad**, no el 100%.

---

## 2. Lo que la IA NO puede hacer (los 3 problemas que rompen el modelo)

### 2.1 El pentest real requiere malicia y creatividad

Un escáner automatizado busca patrones conocidos. Un pentester real **rompe los patrones**.

Ejemplos concretos donde Playwright o Nuclei no llegan:

**Encadenamiento de vulnerabilidades:**
- Un IDOR aislado no es crítico → un escáner lo marca medium
- Un SSRF aislado no es crítico → un escáner lo marca medium
- IDOR + SSRF + parsing de XML mal configurado = RCE en un host interno → **un humano encadena los 3, un script no los conecta**

**Evasión de filtros:**
- Un payload XSS estándar conocido (etiquetas script clásicas) lo bloquea cualquier WAF
- Un humano sabe variar: usar etiquetas SVG con manejadores de eventos, payloads codificados en base64, caracteres Unicode lookalike, fragmentación entre headers
- Las IAs actuales no son creativas en evasión — replican payloads conocidos

**Lógica de negocio explotable:**
- Goldfields tiene OTs con flujo de aprobación: Crear → Asignar → Ejecutar → Cerrar
- Un atacante que descubre que puede saltar de Crear directo a Cerrar pasando un parámetro `state=closed` salta toda la lógica de costos
- Esto **no es una vulnerabilidad técnica** (no hay XSS, no hay SQLi). Es una falla de diseño de máquina de estados. Solo la encuentra alguien que entiende el flujo de negocio y piensa con malicia.

### 2.2 Threat Modeling minero — un script no entiende el contexto

El threat modeling no es un ejercicio técnico, es un análisis de actores y motivaciones. Casos reales del contexto VSC/minería:

**Insider Threat — Espionaje industrial:**
- Un planner de Goldfields tiene permiso legítimo de exportar el catálogo de equipos a CSV
- Ese CSV contiene la flota completa, ubicaciones, próximos mantenimientos
- Antofagasta Minerals (competencia) sabría exactamente cuándo Goldfields tendrá un equipo crítico fuera de servicio → ventaja en negociación de royalties / proveedores compartidos
- **Un escáner ve "exportación CSV — funcionalidad legítima". Un humano experto pregunta "¿quién más puede ver esto y qué hace con ello?"**

**Supply chain attack:**
- AMS depende de 312 paquetes npm, 47 paquetes Python, 8 imágenes Docker base
- Trivy detecta CVEs conocidos
- Lo que **no detecta**: un mantenedor legítimo de un paquete pequeño cuya cuenta fue comprometida e inyecta código malicioso en una versión patch (caso `event-stream`, `node-ipc`, `xz-utils`)
- Para esto se necesita **threat modeling proactivo**: política de pinning, SBOM, monitoreo de mantenedores de paquetes críticos, análisis de provenance

**Riesgos físicos / operativos:**
- ¿Qué pasa si un técnico de Goldfields conecta un equipo Cisco que comprometió la red corporativa al wifi de invitados de la mina y desde ahí accede a AMS via VPN?
- ¿Qué pasa si la copia de la base de datos que respaldamos en S3 cae en manos del competidor por una mala policy de IAM?
- **No existe escáner que evalúe esto.** Lo evalúa un experto haciendo threat modeling con la realidad operacional del cliente.

### 2.3 Compliance, accountability y firma legal

Acá está el punto que José necesita oír claro:

**La IA no puede firmar nada legalmente vinculante.**

Cuando Goldfields nos contrata, firmamos:

| Documento | Quién firma | Por qué importa |
|---|---|---|
| Data Processing Agreement (DPA) | Persona natural con cargo | Si hay brecha de datos personales, esa persona responde ante la autoridad |
| Acuerdo de confidencialidad (NDA) | Persona natural | Vinculación legal personal en caso de fuga |
| Compromiso ISO 27001 | Information Security Officer (CISO) identificado | Norma exige que existe el rol con responsabilidad nominal |
| Reporte de incidentes a la ANCI | Persona designada | Ley 21.663 art. 27 — plazo 24h, multas hasta 20.000 UTM si no se reporta |
| Liberación de releases con cambios de seguridad | CISO o delegado | Auditoría exige nombre y rol del aprobador |

Si en una brecha de datos a la autoridad le dices "el agente IA evaluó el riesgo y aprobó el deploy", tu empresa paga la multa **y** tu CEO puede enfrentar responsabilidad penal por la Ley 21.663 si se prueba negligencia. La IA no va a la cárcel. La persona que la operaba sí.

**ISO 27001 control A.6.1 (Roles, responsabilidades y autoridades):**
> "La organización debe establecer y comunicar las responsabilidades y autoridades para los roles relevantes a la seguridad de la información."

No dice "puede ser una IA". Dice **roles**. Roles humanos.

---

## 3. Por qué esto bloquea ventas y nos expone legalmente

### 3.1 Vendor Risk Assessment de mineras

Codelco, Goldfields, BHP — antes de firmar contrato te envían un cuestionario de 200+ preguntas. Las relevantes para seguridad:

- ¿Tienen CISO o equivalente identificado? → respuesta esperada: nombre + cargo
- ¿Quién aprueba los cambios de seguridad antes de pasar a producción? → respuesta esperada: persona con cargo
- ¿Tienen pentest externo anual? → con quién, cuándo, reporte disponible
- ¿Tienen plan de respuesta a incidentes con responsable nombrado? → respuesta esperada: nombre + canal de contacto 24/7
- ¿Cuál es su DPO (Data Protection Officer)? → persona con cargo

**"Lo gestiona la IA" no es una respuesta válida en ningún punto.** Es descalificación inmediata.

### 3.2 Exposición legal directa

Ley 21.663 (Marco de Ciberseguridad Chile, vigente 2024):
- Art. 8: obligación de tener "personas designadas" para gestión de ciberseguridad
- Art. 27: obligación de reportar incidentes en 24h con detalles forenses
- Art. 31: multas de hasta 20.000 UTM (≈ $1.300 millones CLP) por incumplimiento

Ley 21.719 (Datos Personales Chile, vigente 2026):
- Obligación de tener DPO si manejas datos sensibles
- Multas hasta 20.000 UF (≈ $750 millones CLP)

Si VSC procesa datos de empleados de Goldfields y hay una brecha:
- Sin CISO/DPO humano: paga la empresa **y** se imputa a CEO/representante legal
- Con CISO/DPO humano: paga la empresa, el responsable nominal asume gestión del incidente

**El experto humano de seguridad no es un costo — es un escudo legal.**

---

## 4. La propuesta — modelo híbrido humano + IA

### Capa 1 · Automatización (lo que ya hacemos)
- qa-scanner: Trivy + Gitleaks + Nuclei cada 24h sobre todos los repos
- Patches automáticos para vulnerabilidades con fix conocido
- Reporte de cumplimiento ISO 27001 en `/iso-27001` del hub QA
- DAST con Playwright en pipeline pre-deploy
- **Esto ya cubre el 30% del trabajo de seguridad**

### Capa 2 · CISO / Security Lead humano (lo que falta)
- **1 persona** con rol Information Security Officer (no un equipo)
- Puede ser part-time / contractor inicialmente, luego full-time si crece la pipeline
- Responsabilidades:
  - Threat modeling trimestral por proyecto
  - Coordinar pentest externo anual (proveedor 3rd party)
  - Punto de contacto ante ANCI / clientes para incidentes
  - Firma de DPAs, NDAs, liberaciones de seguridad
  - Mantener vigencia de la certificación ISO 27001
  - Capacitación de equipo (lo que ya armamos en el hub QA)
- **Costo:** $3.5M-5M CLP mensual full-time, o $1.5M-2.5M part-time/contractor

### Capa 3 · Pentest externo anual
- Empresa especializada (NSEC, Dreamlab, Telefónica Cyber)
- ~$8M-15M CLP por engagement de 2 semanas
- Requisito explícito en RFPs de Codelco y Goldfields

---

## 5. Conclusión para José

| Argumento | Sin Security humano | Con Security humano |
|---|---|---|
| ¿Detecta XSS / SQL injection automático? | ✓ | ✓ |
| ¿Detecta vulnerabilidades de dependencias? | ✓ | ✓ |
| ¿Encadena vulnerabilidades para escalar? | ✗ | ✓ |
| ¿Hace threat modeling con contexto minero? | ✗ | ✓ |
| ¿Firma DPAs y NDAs? | ✗ (legalmente imposible) | ✓ |
| ¿Reporta incidentes a la ANCI en 24h? | ✗ | ✓ |
| ¿Cubre Ley 21.663 art. 8 (designación)? | ✗ | ✓ |
| ¿Pasa Vendor Risk Assessment de Goldfields? | ✗ | ✓ |
| ¿Quién paga si hay brecha? | VSC + posiblemente CEO | VSC (responsable nominal gestiona) |

**No es contratar un experto para "hacer pentests" — la IA ya los hace.** Es contratar a alguien que firme los documentos que las mineras y la ley chilena exigen, y que aporte la malicia y contexto que ningún script tiene.

Costo del rol: ~$3-5M CLP mensual.
Costo de no tenerlo: pérdida de Goldfields/Codelco como clientes (-$50M-150M CLP por deal anual cada uno) + exposición legal directa del CEO ante Ley 21.663.

---

**Próximos pasos propuestos:**
1. Definir si Security Lead es full-time o contractor (recomiendo contractor 4h/semana inicialmente)
2. Iniciar certificación ISO 27001 — el hub QA ya nos da 73% de cobertura
3. Contratar pentest externo anual antes de la próxima licitación con Codelco
4. Documentar formalmente roles (CISO, DPO) según Ley 21.719

— **David Cabezas**, Lead Tech VSC
