# Índice de archivos de parcheo

Archivos organizados por **proyecto/repo** local. Cada carpeta = un repo en `C:\Users\Tobbe\Downloads\Practica\<repo>`.

Para cada proyecto: abrir el repo en Claude Code y pasarle el archivo correspondiente para que aplique los fixes.

---

## 📁 Estructura

| Carpeta | Repo local correspondiente | # archivos |
|---|---|---|
| [SecondBrain/](SecondBrain/) | `Practica/SecondBrain` (intranet aiprowork.com) | 13 |
| [ASSET-MANAGEMENT-SOFTWARE/](ASSET-MANAGEMENT-SOFTWARE/) | `Practica/ASSET-MANAGEMENT-SOFTWARE` (AMS / OCP) | 1 |
| [Codelcoespecialistas/](Codelcoespecialistas/) | `Practica/Codelcoespecialistas` | 1 |
| [codelco-ideas/](codelco-ideas/) | `Practica/codelco-ideas` | 1 |
| [goldfields/](goldfields/) | `Practica/goldfields` | 3 |
| [qa-security-hub/](qa-security-hub/) | `Practica/QA section/qa-security-hub` (este hub) | 3 |
| [_base-images/](_base-images/) | Compartido — afecta a varios proyectos | 1 |
| [_template/](_template/) | **Plantilla** que cada Claude debe rellenar al terminar | 1 |

> 📋 **Cuando termines de parchear un proyecto**, el Claude del repo debe rellenar la plantilla [_template/RESPUESTA-TEMPLATE.md](_template/RESPUESTA-TEMPLATE.md) y commitearla al repo en `docs/security/parcheo-YYYY-MM-DD.md`. Esto es la evidencia obligatoria para auditoría ISO 27001 A.8.8.

---

## 🎯 Prioridad recomendada

Ordenado por número de **vulnerabilidades críticas**:

| # | Archivo | Críticas | Altas | Total |
|---|---|---|---|---|
| 1 | [_base-images/nginx-1_27-alpine.md](_base-images/nginx-1_27-alpine.md) | 12 | 56 | 158 |
| 2 | [ASSET-MANAGEMENT-SOFTWARE/asset-management-software-ocp-backend.md](ASSET-MANAGEMENT-SOFTWARE/asset-management-software-ocp-backend.md) | 8 | 45 | 155 |
| 3 | [Codelcoespecialistas/codelcoespecialistas-codelco-especialistas.md](Codelcoespecialistas/codelcoespecialistas-codelco-especialistas.md) | 6 | 28 | 79 |
| 4 | [SecondBrain/secondbrain-inteligencia-correos-staging.md](SecondBrain/secondbrain-inteligencia-correos-staging.md) | 4 | 46 | 68 |
| 5 | [SecondBrain/secondbrain-dashboard-staging.md](SecondBrain/secondbrain-dashboard-staging.md) | 3 | 33 | 58 |
| 6 | [codelco-ideas/codelco-ideas-codelco.md](codelco-ideas/codelco-ideas-codelco.md) | 2 | 24 | 36 |
| 7 | [SecondBrain/secondbrain-dashboard.md](SecondBrain/secondbrain-dashboard.md) | 2 | 44 | 80 |
| 8 | [qa-security-hub/qa-security-hub-qa-scanner.md](qa-security-hub/qa-security-hub-qa-scanner.md) | 2 | 14 | 42 |
| 9 | [goldfields/goldfields-frontend.md](goldfields/goldfields-frontend.md) | 2 | 11 | 21 |
| 10 | [qa-security-hub/qa-security-hub-pentestify.md](qa-security-hub/qa-security-hub-pentestify.md) | 0 | 108 | 479 |
| 11 | [qa-security-hub/qa-security-hub-qa-hub.md](qa-security-hub/qa-security-hub-qa-hub.md) | 0 | 32 | 52 |
| 12 | [SecondBrain/secondbrain-inteligencia-correos.md](SecondBrain/secondbrain-inteligencia-correos.md) | 0 | 24 | 32 |
| 13 | [goldfields/goldfields-backend.md](goldfields/goldfields-backend.md) | 0 | 18 | 86 |
| 14 | [goldfields/goldfields-agents.md](goldfields/goldfields-agents.md) | 0 | 8 | 48 |

---

## 📋 Detalle por proyecto

### SecondBrain (`Practica/SecondBrain`)
La intranet de aiprowork.com. Contiene también los packages npm aislados que fueron detectados por `npm audit` ejecutado contra este repo.

- `secondbrain-dashboard.md` — imagen Docker en producción (containers OS + npm)
- `secondbrain-dashboard-staging.md` — imagen Docker staging
- `secondbrain-inteligencia-correos.md` — servicio de correos (producción)
- `secondbrain-inteligencia-correos-staging.md` — servicio de correos (staging)
- `brace-expansion.md`, `dompurify.md`, `express-rate-limit.md`, `nodemailer.md`, `path-to-regexp.md`, `simple-git.md`, `socket-io-parser.md`, `undici.md`, `xmldom-xmldom.md` — **paquetes npm individuales** que están en `package.json` o como deps transitivas. Son los que `npm audit` ya reportaba antes del scanner.

> **Recomendación:** dale a Claude del repo SecondBrain primero los 4 archivos `secondbrain-*.md` (los grandes). Una vez que rebuildees la imagen Docker después de actualizar deps, los paquetes npm sueltos van a desaparecer solos en el próximo scan.

### ASSET-MANAGEMENT-SOFTWARE (`Practica/ASSET-MANAGEMENT-SOFTWARE`)
- `asset-management-software-ocp-backend.md`

### Codelcoespecialistas (`Practica/Codelcoespecialistas`)
- `codelcoespecialistas-codelco-especialistas.md`

### codelco-ideas (`Practica/codelco-ideas`)
- `codelco-ideas-codelco.md`

### goldfields (`Practica/goldfields`)
Tiene 3 servicios separados (frontend / backend / agents).
- `goldfields-frontend.md`
- `goldfields-backend.md`
- `goldfields-agents.md`

### qa-security-hub (`Practica/QA section/qa-security-hub`)
Este propio hub. Contiene 3 sub-imágenes:
- `qa-security-hub-qa-hub.md` — el frontend Next.js
- `qa-security-hub-qa-scanner.md` — el container de los escáneres
- `qa-security-hub-pentestify.md` — el container Pentestify embebido (FastAPI)

> **Aviso:** `qa-security-hub-pentestify` tiene 479 vulnerabilidades porque está clonado de `github.com/ccyl13/Pentestify` sin actualizar. La opción más fácil es esperar a que su upstream actualice o forkear y mantener.

### _base-images (compartido)
Afecta a múltiples proyectos que usan `FROM nginx:alpine` en sus Dockerfiles.
- `nginx-1_27-alpine.md` — 158 vulnerabilidades. Solución: actualizar el `FROM` a la última `nginx:alpine` en cada Dockerfile que la use.

---

## 🔄 Cómo trabajar cada archivo

```bash
# 1. Abre el repo del proyecto
cd ~/Downloads/Practica/SecondBrain    # ejemplo

# 2. Inicia Claude Code y pídele:
#    "Lee el archivo ../QA section/patches/SecondBrain/secondbrain-dashboard.md
#     y aplica los fixes según las instrucciones de ese archivo. Cuando termines,
#     rellena la plantilla ../QA section/patches/_template/RESPUESTA-TEMPLATE.md
#     y guárdala en docs/security/parcheo-$(date +%F).md de este repo"

# 3. Claude del proyecto crea commits + push + reporte rellenado
# 4. En el VPS rebuilds
ssh vps
cd ~/SecondBrain
docker compose up -d --build dashboard

# 5. Forzar re-scan
docker exec qa-scanner /scanner/scripts/run-trivy.sh

# 6. Verificar en security.aiprowork.com/vulnerabilidades
#    + pegar URL del reporte en cada CVE como evidencia
```

---

## ⏰ Mantener actualizado

Para regenerar estos archivos cuando haya nuevos findings (después de cada scan):

```bash
ssh vps 'PG_PASS=$(grep ^PG_PASSWORD= /root/qa-security-hub/.env | cut -d= -f2-)
docker exec -e PG_HOST=secondbrain-postgres -e PG_PORT=5432 -e PG_DATABASE=secondbrain \
  -e PG_USER=security_app -e PG_PASSWORD="$PG_PASS" \
  qa-scanner python3 /tmp/gen-patches.py'

# Bajar a tu PC
scp -r vps:/root/patches/. "c:/Users/Tobbe/Downloads/Practica/QA section/patches/"
```

Si quieres que se regenere automático cada 24h junto al scan, dime y lo agendo en el cron del scanner.
