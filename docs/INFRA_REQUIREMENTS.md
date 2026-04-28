# Requisitos de Infraestructura — Plataforma AMS / Mageam

**Autor:** David Cabezas (dev full-stack junior)
**Destinatario:** José · Cliente (Goldfields) · Auditoría
**Fecha:** 2026-04-27
**Estado:** Documento de planeación · revisable cada renovación de hosting o cambio de cliente
**Norma de referencia:** ISO/IEC 27001:2022 Anexo A · A.8.27 (Arquitectura segura), A.8.31 (Separación entornos), A.8.33 (Datos de prueba)

---

## 1. Estado actual (snapshot 2026-04-27)

| Item | Detalle |
|---|---|
| Proveedor | Hostinger Cloud |
| Plan | KVM 2 |
| Recursos | 2 vCPU · 8 GB RAM · 100 GB NVMe |
| Datacenter | São Paulo, Brasil (rango IP 187.77.x.x) |
| IP pública | 187.77.223.137 |
| OS | Ubuntu (estimado 22.04 LTS) |
| Stack | Docker Compose · FastAPI backend · React frontend · nginx · SQLite |
| URL | srv1425013.hstgr.cloud |
| Vencimiento | 2027-02-24 |
| Backup nativo | Hostinger weekly snapshots (verificar activación) |
| Costo mensual | ~9-16 USD (depende si está en promo o renovación) |

**Uso actual estimado**:

- Carga sintética + demos a Jorge Alquinta
- ~5-10 usuarios concurrentes en pico
- BD `<1 GB`
- Tráfico bajo

---

## 2. Modelo de carga proyectado para producción Goldfields

### 2.1 Usuarios simultáneos

| Rol | Tipo de uso | Concurrencia esperada |
|---|---|---|
| Planificador | Sesión continua 8h/día con WS abierto | 2-5 |
| Programador | Sesión continua 8h/día con WS abierto | 1-3 |
| Supervisor | Sesión continua 12h turno + WS | 4-8 (turnos día+noche) |
| Técnico | Sesión móvil intermitente, fotos, cierre OT | 20-50 (rotando) |
| Manager | Sesión revisión KPIs 1-2 veces día | 2-5 |
| Engineer/Reliability | Sesión análisis FMECA/RCA ad hoc | 1-3 |
| Auditor / IT cliente | Lectura logs + audit trail | 0-2 |
| **Pico simultáneo realista** | | **30-70 conexiones WS abiertas** |
| **Pico extremo (cambio turno + reuniones)** | | **80-100** |

### 2.2 Volumen de datos por año

| Entidad | Volumen anual (planta media Goldfields) | Bytes/registro | Total año 1 | Total año 3 (acumulado) |
|---|---|---|---|---|
| Avisos (WR) | 40.000 | 1 KB | 40 MB | 120 MB |
| Órdenes de trabajo (OT) | 30.000 | 2 KB | 60 MB | 180 MB |
| Operaciones (≈5 por OT) | 150.000 | 0,5 KB | 75 MB | 225 MB |
| Materiales (≈8 por OT) | 240.000 | 0,5 KB | 120 MB | 360 MB |
| Audit log | 600.000 | 0,3 KB | 180 MB | 540 MB |
| Workforce / técnicos | 300 | constante | <1 MB | <1 MB |
| Jerarquía equipos | 2.000 | 1 KB | 2 MB | 5 MB |
| FMECA / RCA / criticality | 5.000 | 2 KB | 10 MB | 30 MB |
| Settings / config / planning groups | constante | — | 5 MB | 5 MB |
| **Subtotal estructurado** | | | **~525 MB** | **~1,5 GB** |
| Índices y overhead DB (factor 1,4×) | | | **~735 MB** | **~2,1 GB** |

**BD estructurada año 3: ~2-3 GB.** Manejable en SQLite hasta ~5 GB; recomendable migrar a Postgres antes.

### 2.3 Volumen de binarios

| Tipo | Asumiendo | Total año 1 | Total año 3 acumulado |
|---|---|---|---|
| Fotos en avisos (50% × 1 foto × 500 KB) | 20.000 fotos | 10 GB | 30 GB |
| Audios cierre OT (SF-500: 30s × 64 kbps ≈ 250 KB) | 30.000 audios | 7,5 GB | 22,5 GB |
| PDFs informes generados | bajo | 1 GB | 3 GB |
| Documentos adjuntos OTs (manuales, planos) | bajo-medio | 2 GB | 6 GB |
| **Subtotal binarios** | | **~20 GB** | **~60 GB** |

### 2.4 Backups y retención

| Capa | Frecuencia | Retención | Tamaño año 1 | Tamaño año 3 |
|---|---|---|---|---|
| Backup local BD comprimido | Diario | 7 días | 7 × 200 MB = 1,4 GB | 7 × 700 MB = 5 GB |
| Backup local BD comprimido | Semanal | 4 semanas | 4 × 200 MB = 800 MB | 4 × 700 MB = 2,8 GB |
| Backup local BD comprimido | Mensual | 12 meses | 12 × 200 MB = 2,4 GB | 12 × 700 MB = 8,4 GB |
| Backup off-site mirror | Diario | 30 días | ~6 GB | ~21 GB |
| Backup binarios incremental | Semanal | 4 semanas | ~30 GB | ~90 GB |
| Logs nginx + backend rotados | Diario | 30 días | ~3 GB | ~5 GB |
| **Subtotal backups en VPS** | | | **~13 GB** | **~30 GB** |
| **Subtotal off-site (separado)** | | | **~36 GB** | **~110 GB** |

### 2.5 OS, Docker, buffer

| Item | Espacio |
|---|---|
| Ubuntu base + kernel + utilidades | 5 GB |
| Docker images (backend + frontend + nginx + nodes deps) | 5 GB |
| Buffer crecimiento + temp + swap | 5 GB |
| **Subtotal** | **~15 GB** |

### 2.6 Total proyectado por año

| Capa | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| BD estructurada (con índices) | 0,7 GB | 1,4 GB | 2,1 GB |
| Binarios (fotos + audios + docs) | 20 GB | 40 GB | 60 GB |
| Backups locales | 13 GB | 22 GB | 30 GB |
| OS + Docker + buffer | 15 GB | 17 GB | 20 GB |
| **Total VPS principal** | **~50 GB** | **~80 GB** | **~115 GB** |
| Backups off-site (otra máquina/bucket) | 36 GB | 70 GB | 110 GB |

---

## 3. Requisitos mínimos del servidor

### 3.1 Recursos (producción Goldfields)

| Recurso | Mínimo | Recomendado | Notas |
|---|---|---|---|
| CPU | 2 vCPU dedicados | 4 vCPU dedicados | WS broadcast a 100 clientes + LanceDB RAG son CPU-bound |
| RAM | 4 GB | 8 GB | Backend FastAPI ~500 MB · LanceDB ~800 MB · nginx 50 MB · OS 500 MB · margen 6 GB |
| Disco | 80 GB NVMe | 160 GB NVMe | Año 1 entra en 80; año 2-3 holgado en 160 |
| Bandwidth out | 2 TB/mes | 5 TB/mes | Plataforma interna · poco egreso público |
| IPv4 | 1 dedicado | 1 dedicado + IPv6 | obligatorio para SSL Let's Encrypt + audit firewall |
| Snapshot/backup | Semanal incluido | Diario incluido | Backup manual igual sí o sí (no confiar 100% en provider) |

### 3.2 Software stack

| Componente | Versión mínima | Notas |
|---|---|---|
| OS | Ubuntu 22.04 LTS | LTS hasta 2027-04 |
| Docker Engine | 24.0+ | con Compose plugin |
| nginx | 1.24+ | reverse proxy + SSL |
| Python | 3.11 | backend FastAPI |
| Node.js (build only) | 20 LTS | no runtime, solo `npm run build` |
| SQLite | 3.40+ | ya incluido en Ubuntu |
| Postgres (Año 2+) | 16 | cuando migremos |
| Certbot | latest | renovación SSL Let's Encrypt |
| fail2ban | latest | hardening SSH |
| ufw | latest | firewall |

### 3.3 Servicios externos requeridos

| Servicio | Para qué | Año 1 | Año 2-3 |
|---|---|---|---|
| Storage off-site | Backup BD + binarios | Backblaze B2 (~6 USD/TB) o Hetzner Storage Box (~4 EUR/TB) | igual |
| Email transaccional | Notificaciones digest, alertas | Resend / SES (~free tier) | Postmark si volumen sube |
| Error tracking | Sentry frontend + backend | Free tier Sentry | Team plan (26 USD/mes) si volumen |
| Uptime monitoring | Status público + alertas | UptimeRobot free | Better Uptime Pro (~10 USD/mes) |
| Log aggregation | Audit + debug | nginx + journalctl local | Logtail / Papertrail (~20 USD/mes) |
| DNS | Resolución dominio | Cloudflare gratis | igual |
| CDN (si aplicara) | Estáticos | Cloudflare gratis | igual |

---

## 4. Comparativa de proveedores

### 4.1 Tabla general (planes equivalentes 2 vCPU / 8 GB / 80-100 GB SSD)

| Proveedor | Plan | Precio mensual | DC más cercano a Chile | Latencia desde planta | ISO 27001 | SOC 2 | Soporte |
|---|---|---|---|---|---|---|---|
| Hostinger | KVM 2 | 9-16 USD (promo/renovación) | São Paulo BR | ~15 ms | No publicado | No | Tier 1 español |
| Hetzner Cloud | CX32 | 9 USD | Ashburn US | ~150 ms | Sí (descargable) | No | Tier 2 inglés/alemán |
| DigitalOcean | Premium AMD 2 vCPU/8 GB | 48 USD | NYC | ~150 ms | Sí | Sí Type II | Tier 2 inglés |
| Vultr | Cloud Compute Santiago | ~20 USD | Santiago Chile | <10 ms | Sí (NDA) | Sí | Tier 2 inglés |
| Vultr | High Performance Santiago | ~24 USD | Santiago Chile | <10 ms | Sí (NDA) | Sí | Tier 2 inglés |
| Vultr | Optimized General Purpose | 60 USD | Santiago | <10 ms | Sí (NDA) | Sí | Tier 2 inglés |
| AWS Lightsail | 8 GB RAM | 40 USD + extras | São Paulo | ~15 ms | Sí (multi-norma) | Sí | Tier 1 (paga 100 USD/mes) |
| AWS EC2 + RDS | t3.medium + db.t3.small | ~80-150 USD | São Paulo | ~15 ms | Sí completo | Sí completo | según plan |

### 4.2 Decisión recomendada según escenario

| Escenario | Mejor opción | Razón |
|---|---|---|
| Hoy (demo + early adopters) | **Quedarse Hostinger KVM 2** | Pagado a 2027-02-24, alcanza |
| Goldfields firma contrato formal con SLA + audit | **Vultr Cloud Compute Santiago** o **Hetzner CX32** | Latencia <10 ms (Vultr) o costo (Hetzner) |
| Multi-cliente Mageam (3+ plantas) | **DigitalOcean + Managed Postgres** | Escalabilidad sin migración + compliance docs |
| Cliente exige hyperscaler reconocido | **AWS Lightsail** o EC2 | No discutir |
| Cliente exige aire-gapped on-prem | (out of scope) | Otro proyecto |

### 4.3 Total mensual estimado por opción (Año 1, completa)

| Opción | VPS | Off-site backup | Sentry + Uptime | Total mes | Total año |
|---|---|---|---|---|---|
| Quedarse Hostinger | ~12 USD | 6 USD (B2 100 GB) | 0 (free tiers) | **~18 USD** | **~216 USD** |
| Migrar Hetzner CX32 | 9 USD | 4 EUR (Storage Box BX11 1 TB) | 0 | **~14 USD** | **~165 USD** |
| Migrar Vultr CC Santiago | 20 USD | 5 USD (Vultr Object 250 GB) | 0 | **~25 USD** | **~300 USD** |
| Migrar DO Premium | 48 USD | 5 USD (Spaces) | 36 USD (Sentry+Better Uptime) | **~89 USD** | **~1.070 USD** |
| AWS Lightsail | 40 USD | ~10 USD (S3+egress) | 36 USD | **~86 USD** | **~1.030 USD** |

---

## 5. Estrategia de backup (obligatorio independiente del provider)

### 5.1 Capas

| Capa | Mecanismo | Frecuencia | Retención | Ubicación |
|---|---|---|---|---|
| 1 — Snapshot provider | Botón en panel | Antes de cada deploy mayor | 3 últimos | mismo provider |
| 2 — Backup local BD | `sqlite3 .backup` + gzip + cron | Diario 03:00 | 7 daily + 4 weekly + 3 monthly | `/var/backups/ams/` mismo VPS |
| 3 — Backup off-site BD | rsync/rclone a bucket S3-compat | Diario 04:00 | 30 daily | Backblaze B2 / Hetzner SB |
| 4 — Backup binarios | rsync incremental | Semanal | 4 weekly | mismo bucket |
| 5 — Backup config (.env, nginx.conf) | git repo privado encriptado | Cada cambio | infinito | GitHub privado / GitLab |
| 6 — Snapshot DB pre-deploy | Manual + script | Cada deploy | 3 últimos por deploy | local VPS |

### 5.2 Restauración (RTO / RPO)

| Métrica | Objetivo |
|---|---|
| RPO (max data loss) | 24 horas (peor caso = backup diario) |
| RTO (max downtime) | 2 horas (deploy desde tag git + restore .db) |
| Procedimiento documentado | `docs/disaster_recovery.md` (a crear) |
| Test de restauración | Trimestral en staging clonado |

### 5.3 Script de backup (a implementar)

Ubicación: `/usr/local/bin/ams_backup.sh`

```bash
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y%m%d_%H%M%S)
DEST=/var/backups/ams
DB=/var/lib/docker/volumes/ocp_db_data/_data/ocp_maintenance.db

mkdir -p "$DEST/daily" "$DEST/weekly" "$DEST/monthly"

# 1. Backup atomico SQLite (no rompe writes)
sqlite3 "$DB" ".backup '$DEST/daily/ams_$DATE.db'"
gzip "$DEST/daily/ams_$DATE.db"

# 2. Rotacion local: 7 daily, 4 weekly, 3 monthly
find "$DEST/daily" -name "ams_*.db.gz" -mtime +7 -delete
# (logica de promotion semanal/mensual con find + cp)

# 3. Off-site (rclone configurado a B2/Storage Box)
rclone copy "$DEST/daily/ams_$DATE.db.gz" remote:ams-backups/daily/ --quiet

# 4. Logging
echo "$DATE backup OK ($(du -h $DEST/daily/ams_$DATE.db.gz | cut -f1))" >> /var/log/ams_backup.log
```

Cron: `0 3 * * * root /usr/local/bin/ams_backup.sh`

---

## 6. Hardening de seguridad mínimo

| Control | Implementación |
|---|---|
| SSH key-only (no password) | `/etc/ssh/sshd_config`: `PasswordAuthentication no` |
| Sudo log | `/etc/sudoers.d/log` con `Defaults logfile=/var/log/sudo.log` |
| fail2ban | Jail SSH + nginx auth · ban 1h tras 5 fallos |
| ufw | Permitir solo 22 (SSH desde IPs autorizadas), 80, 443 |
| HTTPS forzado | nginx redirect 80→443 + HSTS 1 año |
| Rate limiting | nginx `limit_req_zone` por IP en endpoints sensibles |
| Headers seguridad | CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin |
| Secrets en .env | `chmod 600 .env` + dueño root + nunca en git |
| Updates automáticos | `unattended-upgrades` para parches seguridad OS |
| Docker hardening | `--read-only` containers + `no-new-privileges` (ya está en docker-compose) |
| Audit log accesible | endpoint `/audit-log` con RBAC admin/manager |

Documentado en `docs/SECURITY_SCOPE.md` y `docs/SECURITY-AUDIT-AMS.md`.

---

## 7. Escalado vertical y horizontal

### 7.1 Camino vertical (mismo VPS, planes mayores)

```
KVM 2 / CX32  (8 GB)   →  AÑO 1 cómodo
   ↓
KVM 4 / CX42  (16 GB)  →  AÑO 2 si sumamos Postgres en mismo VPS
   ↓
KVM 8 / CX52  (32 GB)  →  AÑO 3 si crece a multi-cliente
```

### 7.2 Cuándo migrar a horizontal (split servicios)

| Síntoma | Acción |
|---|---|
| RAM >70% promedio sostenido | Upgrade vertical primero |
| BD > 5 GB y SQLite locks visibles en logs | Migrar a Postgres en mismo VPS |
| BD > 30 GB y queries lentas | Postgres en VPS separado / managed |
| WS broadcasts saturando CPU | Separar WebSocket layer en VPS dedicado |
| Frontend assets >100 MB | CDN para estáticos (Cloudflare) |
| Multi-cliente (Mageam crece) | Multi-tenant true: cluster + DB pool + S3 |

---

## 8. Migración planificada (cuándo y cómo)

### 8.1 Triggers de migración

| Trigger | Acción |
|---|---|
| Renovación Hostinger sube >50% del precio promo | Comparar Hetzner / Vultr en ese momento |
| Goldfields firma contrato formal con SLA estricto | Migrar a Hetzner o Vultr según latencia exigida |
| Auditor pide ISO 27001 cert del provider y Hostinger no lo entrega | Migrar a provider que sí lo provea |
| Caída multi-hora en Hostinger sin RCA satisfactorio | Migrar |
| Mageam suma 2+ clientes | Considerar split o managed services |

### 8.2 Procedimiento de migración (cuando aplique)

1. **Pre-trabajo (1 día)**
   - Backup completo BD + binarios + configs
   - Documento target con specs nuevas
   - Crear cuenta nuevo provider, levantar VPS clonado
2. **Setup ambiente (1 día)**
   - Instalar Docker, nginx, Certbot
   - Subir compose + .env
   - Levantar containers en modo "dry" (sin DNS apuntando)
   - Test interno con curl
3. **Migración data (2-4 horas)**
   - Snapshot final BD viejo
   - Transferir .db + volumen binarios via rsync
   - Levantar nuevo VPS con data real
   - Smoke test todos los flujos críticos
4. **Cutover DNS (15 min)**
   - Bajar TTL DNS días antes a 60s
   - Modo readonly en VPS viejo
   - Cambiar A record al nuevo VPS
   - Validar
5. **Post-migración (1 semana)**
   - VPS viejo en standby modo readonly
   - Monitoreo intensivo
   - Si nada falla: bajar VPS viejo, no renovar

**Tiempo total**: 1 weekend + 1 semana monitoreo. Costo migración: ~16 horas dev.

---

## 9. Compliance ISO 27001 mapping

| Control | Cómo lo cumple esta infra |
|---|---|
| A.8.27 Arquitectura segura | Defensa profunda: nginx → FastAPI → ORM → DB. Cada capa autenticada |
| A.8.31 Separación entornos | Dev local + staging (subdominio aparte) + prod (VPS dedicado) |
| A.8.32 Gestión de cambios | Deploy script + git tags + cache-bust + smoke test |
| A.8.33 Datos de prueba | Seed sintético en dev/staging; datos reales solo en prod |
| A.8.34 Auditoría | Audit log accesible vía endpoint + logs nginx + journalctl |
| A.5.30 Resiliencia | Backup diario + off-site + procedimiento de restauración |
| A.5.34 Privacidad de datos personales | bcrypt password, sin PII innecesaria, GDPR DPA con provider |

Detalle completo en `docs/QA_SCOPE.md` (Parte II) y `docs/SECURITY_SCOPE.md`.

---

## 10. Decisiones pendientes (a tomar con José y Goldfields)

| Decisión | Opciones | Quien decide | Plazo |
|---|---|---|---|
| ¿Migrar antes de Feb 2027 o esperar renovación? | Esperar / migrar Q3-Q4 2026 | José + dato concreto del cliente | Cuando se firme contrato Goldfields |
| ¿Hetzner US-EU vs Vultr Santiago? | Latencia vs costo | Goldfields IT (preguntar tolerancia latencia) | Antes de migración |
| ¿Mantener SQLite o migrar a Postgres? | Cuando volumen >5 GB | Métrica real | Q4 2026 estimado |
| ¿Object Storage propio o del provider? | Backblaze B2 vs Hetzner Storage Box vs Vultr Object | Costo + latencia restore | Inmediato |
| ¿Sentry / Better Uptime / Logtail premium? | Free tiers vs paid | Cuando volumen errores supere free | Q3 2026 |
| ¿Sumar staging dedicado? | Subdominio en mismo VPS vs VPS aparte | Riesgo aceptado | Q3 2026 |

---

## 11. Recomendación final concreta

**Hoy (2026-04-27)**:

1. ✅ Quedarse en **Hostinger KVM 2** hasta Feb 2027 (pagado, alcanza)
2. 🔧 Implementar HOY **script `ams_backup.sh` + cron diario + Backblaze B2** (~6 USD/mes adicional)
3. 📋 Activar **UptimeRobot free** para alertas de caída
4. 📋 Activar **Sentry free tier** para errores frontend + backend
5. 📋 Revisar que **backups semanales nativos** de Hostinger estén activos
6. 📋 Documentar **procedimiento de restauración** y **probarlo una vez**

**Q3-Q4 2026 (pre-renovación)**:

1. Pedir cotización renovación Hostinger
2. Si Goldfields firmó contrato → planificar migración a **Hetzner CX32** (escenario costo) o **Vultr CC Santiago** (escenario latencia)
3. Si solo demo → renovar Hostinger 12 meses más

**Año 2-3**:

1. Upgrade vertical o migración a Postgres según métricas reales
2. Si Mageam suma 2+ clientes → evaluar managed services

---

## 12. Anexo — Checklist setup nuevo VPS (cuando aplique migración)

- [ ] Provisionar VPS con specs target
- [ ] Configurar firewall (solo 22, 80, 443)
- [ ] Crear usuario non-root con sudo
- [ ] SSH key-only, deshabilitar password auth
- [ ] Instalar fail2ban + ufw + unattended-upgrades
- [ ] Instalar Docker + Compose
- [ ] Clonar repo (rama `main`) + setup `.env`
- [ ] Build inicial: `docker compose build`
- [ ] Restaurar BD desde backup
- [ ] Restaurar volumen binarios desde off-site
- [ ] Levantar containers: `docker compose up -d`
- [ ] Configurar nginx reverse proxy
- [ ] Obtener cert Let's Encrypt: `certbot --nginx`
- [ ] Smoke test 5 flujos críticos
- [ ] Configurar cron backup `ams_backup.sh`
- [ ] Configurar rclone a Backblaze B2
- [ ] Apuntar DNS al nuevo VPS (TTL bajo días antes)
- [ ] Validar en producción 24-48h
- [ ] Documentar IP + acceso en password manager compartido
- [ ] Bajar VPS viejo

---

**Versión:** 1.0 · **Última actualización:** 2026-04-27 · **Próxima revisión obligatoria:** antes de renovación Hostinger (2027-01-24).
