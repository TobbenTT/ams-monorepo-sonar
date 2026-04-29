# QA — Política y Alcance · Por qué la automatización con IA no reemplaza al rol de QA

**Autor:** David Cabezas — Lead Tech / Dev full-stack
**Destinatario:** José (CEO) · Equipo VSC · Auditores ISO de clientes mineros
**Fecha:** 2026-04
**Contexto:** Plataforma AMS (Mageam) · integración SAP PM · cliente Goldfields, Codelco
**Normas de referencia:** ISO 9001 (Calidad) · ISO/IEC 27001:2022 (Seguridad) · ISO/IEC 29119 (Testing) · ISO/IEC 25010 (Calidad de software)

---

## Resumen ejecutivo

La pregunta ya no es **"¿puede una IA hacer testing automatizado?"** — sí puede, y muy bien. La pregunta correcta es: **"¿puede una IA reemplazar el rol de QA en una empresa que vende software a Goldfields y Codelco?"** La respuesta es **no**, y este documento explica por qué — desde el riesgo de negocio, no desde la capacidad técnica.

Tres motivos:

1. **Las normas ISO 9001 y 27001 exigen segregación de funciones** — quien construye no puede ser quien aprueba. Un dev usando su IA viola este principio.
2. **La automatización prueba el happy path; el QA prueba el mundo real** — data SAP sucia, edge cases operacionales, fricción cognitiva del usuario.
3. **El documento es el entregable**, no solo el código — sin Test Plan firmado por humano, el QA "no existe" para un auditor de Goldfields.

---

## 1. Lo que la IA con Playwright SÍ puede hacer (concedido)

Hay que reconocerlo de frente: la combinación Claude Code + Playwright CLI es brutal. Hoy un agente IA puede:

- Levantar un navegador real y ejecutar flujos E2E de 30+ pasos
- Tomar capturas, comparar contra baselines visuales, detectar regresiones de UI
- Rellenar formularios complejos, manejar autenticación, esperar a estados asincrónicos
- Detectar bugs técnicos: 404s, errores JS, links rotos, contraste de accesibilidad
- Autocorregir su propio código de prueba si detecta un fallo no determinístico
- Producir reportes HTML con video de la sesión

**Como herramienta de aceleración, esto vale por 3 testers junior haciendo regresión manual.** No vale la pena negarlo. La pregunta es qué pasa cuando un cliente serio audita el proceso.

---

## 2. Lo que la IA NO puede hacer (los 4 problemas que rompen el modelo)

### 2.1 Falta de criterio e intuición de negocio

Playwright sabe hacer click. No sabe **qué clicks importan**.

Ejemplo concreto en AMS / SAP PM:
- Un dev pide a la IA que pruebe "cerrar una OT (Orden de Trabajo)"
- El bot hace click en "Cerrar", verifica que aparece el toast de éxito → ✓ pasa
- Lo que el bot **no detecta**: cerrar una OT de tipo PM02 sin completar antes el aviso técnico rompe el cierre contable del periodo en SAP. Goldfields se entera 3 semanas después cuando cierra mes y le faltan 12 millones de pesos en costos imputados.

El bot prueba que el botón funciona. El QA con experiencia operacional pregunta "¿esto rompe el flujo del planner cuando hace cierre mensual?". Esa pregunta no la hace una IA porque no vivió un cierre mensual con un planner enojado.

### 2.2 El problema de la data real

La automatización funciona contra `seed_demo_data.py`. Datos limpios, IDs predecibles, encodings UTF-8.

Cuando Goldfields sube su CSV exportado de SAP de producción:
- Nomenclatura sucia: `PM-Order_2024-Q3 (final)(2).csv`
- Encoding latin-1 mezclado con UTF-8 BOM
- Campos con saltos de línea CR+LF dentro de strings con comillas mal escapadas
- Fechas en formato alemán (`31.12.2024`) en una columna que el sistema espera ISO
- IDs con espacios al final, números formateados como texto (`'00012345`)

Los scripts de Playwright explotan o pasan en silencio (peor). El QA con criterio:
1. Pide la data real al cliente desde el día 1
2. Construye el catálogo de transformaciones a aplicar
3. Documenta los casos donde el sistema debe rechazar vs los que debe normalizar
4. Define el contrato con el cliente para los formatos aceptados

Esto no es testing — es **diseño de la interfaz de datos con el cliente**. Lo hace un humano.

### 2.3 El sesgo de confirmación (Hallucinated Fixes 2.0)

Si la misma IA que escribe el código escribe el script para probarlo, el resultado es predecible: **escribe una prueba que valida su propia interpretación del requirement.**

Caso real que ya viste:
- Pides a Claude implementar "el usuario no puede aprobar su propia OT"
- Claude implementa el chequeo
- Claude escribe el test E2E con Playwright
- El test crea usuario A, crea OT, intenta aprobar como A → falla → ✓ pasa
- **Lo que no probó:** usuario A delega a usuario B, B aprueba, después se descubre que B reportaba a A. Claude no sabe que en Goldfields la jerarquía importa para SoD.

Este sesgo no es exclusivo de IAs — los humanos también lo tienen — pero por eso justamente las normas ISO exigen que **el verificador no sea el constructor**. Si lo es, se anula la garantía.

### 2.4 El documento ES el entregable (ISO 9001 e ISO/IEC 29119)

La trampa filosófica del "tenemos automatización, ya no necesitamos documentos" se rompe en la primera auditoría real.

Goldfields no audita tu repositorio. Audita tu proceso. Pide:

| Documento | Qué exige | Quién lo firma |
|---|---|---|
| Test Plan formal (ISO/IEC 29119-3) | Estrategia, alcance, criterios de entrada/salida, riesgos | QA Lead, firmado |
| Test Cases mapeados a requirements | Trazabilidad: requisito → caso → evidencia | QA |
| Test Summary Report | Resultados, defectos abiertos, decisión go/no-go | QA + Product Owner |
| Defect log con triage | Priorización, asignación, fecha de cierre | QA |
| Liberación firmada (ISO 9001 cl. 8.6) | "Apruebo este pase a producción" | Persona identificada con cargo |

**Playwright produce un HTML report con timestamps. No firma nada.** En auditoría:

> Auditor: "¿Quién aprobó este pase a producción?"
> Dev: "El pipeline corrió los tests automatizados con Claude y todos pasaron"
> Auditor: "Eso es el reporte de las pruebas. Pregunto quién firmó la liberación."
> Dev: "...el dev que hizo el código"
> Auditor: **No conformidad mayor — segregación de funciones violada.**

---

## 3. Por qué esto bloquea ventas a mineras

Goldfields, Codelco, BHP, Antofagasta Minerals — todas tienen **Vendor Risk Assessments** obligatorios antes de firmar contrato. Lo que te piden:

1. Ticket del requerimiento → debe existir y estar trazable
2. Código del feature → debe estar versionado
3. **Test Plan firmado** → debe tener nombre y rol del firmante
4. **Aprobación de pase a producción identificada** → no "el sistema lo aprobó"
5. Evidencia del SDLC: code review por persona distinta al autor, validación independiente

Si fallas el punto 4 o 5, te dejan fuera de la licitación. No por capacidad técnica — por **inmadurez del SDLC**. Es un binario: tienes el proceso o no lo tienes.

**Costo del "cada dev con su IA":**
- Pierdes Goldfields y Codelco como clientes (-65% de la pipeline actual de VSC)
- No puedes certificarte ISO 27001 (la SoD se chequea explícitamente en el control A.5.3)
- Pierdes capacidad de subir precio en licitaciones que exigen certificaciones

---

## 4. La propuesta — modelo híbrido humano + IA

No estoy proponiendo "contratemos un equipo de QA tradicional de 5 personas". Estoy proponiendo:

### Capa 1 · Automatización con IA (lo que ya hacemos)
- Playwright + Claude para regresión visual y E2E del happy path
- Trivy + Gitleaks + Nuclei en pipeline para vulnerabilidades superficiales
- Coverage de pruebas unitarias con cobertura objetivo
- **Velocidad: 10x un equipo manual**

### Capa 2 · QA humano dedicado (lo que falta)
- **1 persona** con rol QA Lead (no un equipo de 5)
- Responsabilidades:
  - Diseño del Test Plan formal (ISO/IEC 29119)
  - Definición de criterios de aceptación con cliente
  - Validación independiente de releases (firma la liberación)
  - Triage de defectos detectados por IA + reportados por usuarios
  - Threat modeling de cambios mayores
  - Punto único de contacto para auditores externos
- **Costo:** 1 sueldo · ~$2.5M-3.5M CLP mensual
- **ROI:** Habilita ventas a mineras (cada deal mining = $50M-150M CLP anuales)

### Capa 3 · Segregación natural
- Dev autor no aprueba su propio merge a `main`
- QA firma la liberación a producción
- Auditor externo (anual) revisa muestreo de releases

---

## 5. Conclusión para José

| Argumento | Sin QA humano | Con QA humano |
|---|---|---|
| ¿Puede la IA hacer clicks? | ✓ | ✓ |
| ¿Detecta bugs UI? | ✓ | ✓ (más rápido) |
| ¿Pasa auditoría ISO 9001? | ✗ | ✓ |
| ¿Pasa auditoría ISO 27001 (A.5.3 SoD)? | ✗ | ✓ |
| ¿Vendemos a Goldfields/Codelco? | ✗ | ✓ |
| ¿Quién firma la liberación? | "el sistema" | persona con cargo |
| ¿Quién responde ante el cliente si falla? | nadie | QA Lead |

**Llevarlo a la práctica no requiere expandir el equipo a un departamento.** Requiere reconocer que el QA es un rol de control independiente, no un rol técnico de "hacer clicks". La IA me hace 10x más productivo escribiendo features. Lo que sigue faltando es la firma humana que las mineras exigen para confiar en lo que les vendemos.

---

**Próximos pasos propuestos:**
1. Aprobar contratación de QA Lead (perfil senior, experiencia minera/SAP deseable)
2. Iniciar proceso de certificación ISO 27001 (estimado 6-9 meses)
3. Documentar formalmente Test Plan template basado en ISO/IEC 29119-3 (lo puedo redactar yo en 1 semana)
4. Auditoría de gap actual contra Vendor Risk Assessment de Goldfields

— **David Cabezas**, Lead Tech VSC
