# Plantilla de reporte de bug — MAGEAM

**Para resolver SF-658 (jornada VSC 2026-05-08, hallazgo #22)**: errores observados en producción pero no replicables en QA. Usar **siempre** esta plantilla cuando reportes un bug.

---

## 1. Identificación

| Campo | Valor |
|---|---|
| **Reportado por** | _Tu nombre_ |
| **Fecha y hora exacta del error** | _AAAA-MM-DD HH:MM:SS_ |
| **Usuario logueado** (rol) | _admin / supervisor / planner / tecnico / manager_ |
| **Plant ID seleccionada** | _OCP-JFC1 / GOLDFIELDS-SN / ..._ |
| **OT/AV involucrada** | _OT-2026-NNNNN / AV-NNNNN_ |
| **URL completa** | _ej: `https://mageam.com/work-management?tab=execution&otId=...`_ |

## 2. Entorno

| Campo | Valor |
|---|---|
| **Navegador + versión** | _Chrome 120 / Firefox 121 / Edge 120_ |
| **Sistema operativo** | _Windows 11 / macOS 14 / Android 14_ |
| **Tipo de dispositivo** | _Desktop / Tablet / Móvil_ |
| **Resolución de pantalla** | _ej: 1920×1080_ |
| **Conexión** | _LAN / Wi-Fi / 4G_ |

## 3. Pasos para reproducir

1. _Paso 1_
2. _Paso 2_
3. _Paso 3 que dispara el error_

**Resultado esperado**: _qué debería pasar_
**Resultado obtenido**: _qué pasa en realidad_

## 4. Evidencia (obligatoria)

- [ ] **Screenshot** del error (con la barra de URL visible).
- [ ] **Video corto** (≤30 s) si es un flujo (preferir `Win+G` o screen-record del SO).
- [ ] **Consola del navegador** (F12 → tab Console): copiar/pegar errores rojos.
- [ ] **Red del navegador** (F12 → tab Network): si hay una request fallida, exportar HAR (`Right-click → Save all as HAR`).

## 5. Contexto adicional

- ¿Es **siempre** o **intermitente**? _Si intermitente, ¿qué % de las veces?_
- ¿Afecta **solo a tu usuario** o también a otros? _Probar con otra cuenta._
- ¿Pasó tras **cambiar de planta**, refrescar, o un acción específica?
- ¿Hubo **mensaje** en pantalla? _Copiar texto exacto._
- ¿Lo viste por primera vez **hoy** o **hace días/semanas**?

## 6. Hipótesis preliminares (opcional)

_Si el reportador tiene una idea: dejarla aquí. No reemplaza el repro real._

---

## Para el dev que recibe el bug

Antes de marcarlo "no reproducible", verificar:

- [ ] Comparar entornos PROD vs. QA: datos, versiones del frontend/backend, feature flags.
- [ ] Revisar `/data/ocp.db` en PROD para el WR/OT mencionado: estado real vs. esperado.
- [ ] Revisar `audit_log` para acciones recientes sobre esa entidad.
- [ ] Revisar logs Sentry frontend del mismo timestamp.
- [ ] Revisar logs del contenedor backend (`docker logs ocp-backend --since 1h | grep ERROR`).
- [ ] Si hay HAR adjunto: replay con `curl` para aislar backend vs. frontend.

Si tras todo eso sigue sin reproducirse, marcar el ticket Jira con label `unable-to-reproduce` y agregar comentario con todo lo verificado. **No cerrar**: re-abrir si el reportador vuelve a verlo.

---

## Para QA antes de habilitar bugfix en PROD

- [ ] Repro confirmado en QA con datos similares a PROD.
- [ ] Test escrito que cubre el caso (pytest backend / playwright frontend).
- [ ] Test pasa post-fix.
- [ ] PR mencionando este ticket + plantilla.

---

*Documento vivo. Actualizar según se vayan acumulando casos.*
