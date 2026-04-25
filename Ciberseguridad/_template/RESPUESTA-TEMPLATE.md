# Reporte de parcheo — `<NOMBRE_PROYECTO>`

> **Plantilla para que el Claude del repo rellene tras aplicar los fixes del archivo `<archivo>.md`.**
> Copia este archivo a `<repo>/docs/security/parcheo-YYYY-MM-DD.md`, rellénalo, commitéalo, y pega la URL del archivo en GitHub como evidencia en cada vulnerabilidad del QA / Security Hub.

---

## 1. Identificación

| Campo | Valor |
|---|---|
| **Proyecto** | `<nombre del repo>` |
| **Imagen / componente afectado** | `<imagen Docker o package>` |
| **Archivo de instrucciones leído** | `patches/<carpeta>/<archivo>.md` |
| **Fecha del parcheo** | `YYYY-MM-DD` |
| **Aplicado por** | `<usuario humano que aprobó> + Claude (modelo: claude-X)` |
| **Branch / PR** | `<link al PR o branch>` |
| **Commit(s) de parcheo** | `<sha1>, <sha2>, ...` |
| **Versión imagen anterior → nueva** | `tag:vN → tag:vN+1` |

---

## 2. Resumen ejecutivo

**Una línea:** `<qué se hizo, ej. "Bumped 14 npm deps + nginx base image, removing 47 vulns including 2 críticas">`

**Tiempo total:** `<HHh MMmin>`

**Riesgo de regresión:** `bajo / medio / alto` — `<por qué>`

---

## 3. Vulnerabilidades tratadas

> Una fila por CVE. **No omitas ninguna** del archivo de instrucciones.
> Estado: `mitigada` (parcheada y verificada) / `aceptada` (riesgo aceptado, justificar) / `falso_positivo` (no aplica) / `pendiente` (no se pudo, explicar)

| CVE | Severidad | Paquete | Versión instalada → Versión nueva | Estado | Notas |
|---|---|---|---|---|---|
| `CVE-2026-XXXX` | crítica | `simple-git` | `3.32.2 → 3.32.3` | mitigada | upgrade trivial via package.json |
| `CVE-2026-YYYY` | alta | `xmldom` | `0.8.11 → 0.9.10` | mitigada | breaking change menor; testeé serialize() |
| `CVE-2025-ZZZZ` | media | `libssl3` | `3.0.15 → ~` | aceptada | sin fix en Debian 12 stable; mitigado por A.8.22 (segregación de red) |
| `CVE-XXXX` | baja | `xyz` | `~` | falso_positivo | el binario afectado no se invoca en runtime |

**Total resumen:**

- ✅ Mitigadas: `<N>`
- 📋 Aceptadas: `<N>`
- 🚫 Falso positivo: `<N>`
- ⏳ Pendientes: `<N>` ← deben quedar en 0 antes de cerrar

---

## 4. Cambios realizados

### 4.1 Diffs por archivo

```diff
# Dockerfile
- FROM nginx:1.27-alpine
+ FROM nginx:1.29-alpine

# package.json
-   "simple-git": "^3.32.2",
+   "simple-git": "^3.32.3",
-   "@xmldom/xmldom": "^0.8.11",
+   "@xmldom/xmldom": "^0.9.10",

# requirements.txt (si aplica)
- requests==2.31.0
+ requests==2.32.0
```

### 4.2 Comandos ejecutados

```bash
npm update simple-git @xmldom/xmldom
npm audit --production
docker build -t <image>:patched .
docker compose up -d --build <service>
```

### 4.3 Tests corridos

| Test | Resultado | Nota |
|---|---|---|
| `npm test` (unit) | ✅ pass / ❌ fail | — |
| Smoke manual (login + endpoint clave) | ✅ / ❌ | — |
| Re-scan trivy | ✅ 0 críticas restantes | — |

---

## 5. Verificación post-deploy

### 5.1 Output de re-scan

```
$ docker exec qa-scanner trivy image --severity CRITICAL,HIGH <image>:latest
... (pegar últimas 30 líneas)
Total: 0 (CRITICAL: 0, HIGH: 0)
```

### 5.2 Verificación en el hub

- URL hub filtrada por componente: `https://security.aiprowork.com/vulnerabilidades?search=<image>`
- Las CVEs del archivo de instrucciones desaparecieron de la lista de "nueva" / "en_proceso"
- Screenshot adjunto: `evidencias/hub-after-patch.png`

---

## 6. Riesgos aceptados (cuando aplique)

> Si marcaste alguna como `aceptada`, justifica AQUÍ. Esta sección es la evidencia ISO 27001 A.8.8 de "decisión documentada de tratamiento de riesgos".

| CVE | Por qué se acepta | Mitigación compensatoria | Aprobado por | Próxima revisión |
|---|---|---|---|---|
| `CVE-XXXX` | Sin fix upstream en Debian 12. La vuln requiere acceso local privilegiado al container. | El container corre como user no-root y la red es interna (no expuesta). Control A.8.22. | `<nombre admin>` | `YYYY-MM-DD` |

---

## 7. Mapeo a controles ISO 27001

| Control | Cómo este parcheo lo soporta |
|---|---|
| **A.8.8 — Gestión de vulnerabilidades** | Se identificaron, evaluaron y trataron las CVEs listadas en sección 3. |
| **A.8.9 — Gestión de configuración** | Cambios en Dockerfile / package.json registrados en commits. |
| **A.8.32 — Gestión de cambios** | Deploy se hizo con PR aprobado, con plan de rollback (sección 8). |
| **A.5.37 — Procedimientos operativos** | Este documento es el procedimiento ejecutado y queda como evidencia. |

---

## 8. Plan de rollback

Si algo se rompe en producción tras el deploy:

```bash
# Rollback a la imagen anterior
ssh vps
cd ~/<proyecto>
git revert <commit_de_parcheo>
docker compose up -d --build <service>

# O bien, retag de imagen anterior:
docker tag <image>:<tag_anterior> <image>:latest
docker compose up -d <service>
```

**Tiempo estimado de rollback:** `<X minutos>`
**Datos en riesgo durante rollback:** `<ninguno / detallar>`

---

## 9. Lecciones aprendidas

- `<qué salió bien>`
- `<qué tomó más tiempo de lo esperado>`
- `<qué cambiar para el próximo ciclo de parcheo>`

**Mejoras propuestas al proceso:**
- `<ej. agregar dependabot>` / `<ej. fijar versiones major>` / etc.

---

## 10. Sign-off

| Rol | Persona | Acción | Fecha |
|---|---|---|---|
| **Ejecutó parcheo** | `Claude (modelo X) + <humano>` | Aplicó fixes | `YYYY-MM-DD` |
| **Revisó código** | `<reviewer>` | Aprobó PR | `YYYY-MM-DD` |
| **Desplegó a prod** | `<deployer>` | Merge + docker up | `YYYY-MM-DD` |
| **Verificó re-scan** | `<verifier>` | Confirmó 0 vulns | `YYYY-MM-DD` |

---

## Anexo A — Adjuntar a este reporte

Subir a `<repo>/docs/security/evidencias-YYYY-MM-DD/`:

- [ ] `trivy-before.txt` — output del scan ANTES del parcheo
- [ ] `trivy-after.txt` — output del scan DESPUÉS
- [ ] `npm-audit-before.txt` (si aplica)
- [ ] `npm-audit-after.txt` (si aplica)
- [ ] `hub-before.png` — screenshot de las CVEs en el hub antes
- [ ] `hub-after.png` — screenshot del hub después
- [ ] `tests-output.txt` — output de la suite de tests

---

## Anexo B — Cómo subir evidencia al hub

Una vez commiteado este archivo en GitHub:

1. Copia la URL del archivo en GitHub (ej. `https://github.com/ValueStrategyConsulting/<repo>/blob/main/docs/security/parcheo-YYYY-MM-DD.md`)
2. En el hub `https://security.aiprowork.com/vulnerabilidades`, busca cada CVE de la sección 3
3. Click ✎ → en el campo **URL de referencia** pega la URL del reporte → Guardar
4. Cambia **Estado** según corresponda (mitigada / aceptada / falso_positivo)

Eso es todo. ISO 27001 A.8.8 cumplido.
