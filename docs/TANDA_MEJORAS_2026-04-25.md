# Tanda de mejoras / implementación / ideas — 2026-04-25

**Contexto:** todos los pedidos del cliente (Jorge) y Jira lote SF-517..SF-552 están cerrados. Sesión "post-cliente" de mejoras propuestas — David elige cuáles arrancar.

Cada item incluye: **valor**, **esfuerzo** (S/M/L), **riesgo**.

---

## 🎯 A. Quick Wins (1-2h cada uno, alto valor visible)

### A1. Banner "Última actualización" global
- **Qué**: timestamp visible en header — `Sync: hace 30s ✓` con punto verde si WS conectado, rojo si offline.
- **Valor**: usuarios saben si ven data fresca. Reduce desconfianza ("¿esto está actualizado?").
- **Esfuerzo**: S · **Riesgo**: bajo

### A2. Atajos de teclado
- **Qué**: `Ctrl+K` abre búsqueda global, `?` muestra cheatsheet, `Esc` cierra modal, `g a` va a Avisos, `g p` va a Planning, etc.
- **Valor**: 5x más rápido para Jorge / supervisor en escritorio.
- **Esfuerzo**: M · **Riesgo**: bajo

### A3. Tooltip + iconos en estados de OT
- **Qué**: cada status (CREADO, PROGRAMADO, EN_EJECUCION...) con icono distintivo + tooltip explicando qué se permite hacer en ese estado.
- **Valor**: onboarding de planner nuevo sin manual.
- **Esfuerzo**: S

### A4. Confirmación antes de cerrar modal con cambios sin guardar
- **Qué**: si el usuario edita el aviso/OT y trata de cerrar sin save, prompt "¿Descartar cambios?".
- **Valor**: evita pérdida de trabajo (típico bug de UX).
- **Esfuerzo**: S

### A5. Filtro "Mis Avisos" funcional
- **Qué**: Hoy el filtro existe pero no filtra por `created_by = currentUser`. Arreglar.
- **Valor**: usuarios pueden ver solo lo suyo en 1 click.
- **Esfuerzo**: S

---

## 🚀 B. Features que cierran loops abiertos (medio esfuerzo, alto impacto)

### B1. Notificaciones email + Slack al supervisor
- **Qué**: cuando un aviso P1/P2 se aprueba → email automático + (opcional) webhook Slack al supervisor de la planning_group.
- **Valor**: alerta inmediata sin depender del WS abierto.
- **Esfuerzo**: M · **Riesgo**: medio (necesita SMTP / webhook)

### B2. PDF Report del aviso/OT
- **Qué**: hoy hay botón "PDF Report" que abre HTML print. Mejorar a PDF real con header logo + tablas formateadas + firma supervisor.
- **Valor**: cliente Goldfields lo va a pedir para auditoría.
- **Esfuerzo**: M

### B3. Importar OTs masivas desde Excel
- **Qué**: counterpart al export — drag&drop CSV/Excel con OTs, validación de equipos y carga masiva.
- **Valor**: crítico para onboarding de Goldfields con sus miles de OTs históricas.
- **Esfuerzo**: L · **Riesgo**: medio (validación robusta)

### B4. SAP IW22 Import (counterpart del export)
- **Qué**: leer archivo IW22 de SAP y crear/actualizar OTs en Mageam.
- **Valor**: cierra el ciclo bidireccional con SAP de Goldfields.
- **Esfuerzo**: L · **Riesgo**: alto (necesita specs IW22)

### B5. Auto-asignación inteligente de técnico
- **Qué**: al aprobar un aviso, sugerir el mejor técnico disponible basado en: especialidad match, carga actual, ubicación, histórico de tipo similar.
- **Valor**: reduce decisión manual del planner.
- **Esfuerzo**: M

---

## 🔧 C. Mejoras técnicas (no las ve el usuario pero importan)

### C1. Sentry / Error tracking en backend
- **Qué**: `sentry-sdk[fastapi]` ya está en requirements pero `SENTRY_DSN_BACKEND` no está activo. Configurar y wire-up.
- **Valor**: errores de prod llegan a un dashboard en lugar de morir en logs.
- **Esfuerzo**: S

### C2. Pre-commit hooks (security + lint)
- **Qué**: `.pre-commit-config.yaml` con `pip-audit`, `bandit`, `eslint`, `prettier`. Que falle el commit si hay vuln nueva o lint error.
- **Valor**: bloquea introducción de problemas que después aparecen en el security hub.
- **Esfuerzo**: S

### C3. Sentry / Error tracking en frontend
- **Qué**: `@sentry/react` con replay (graba sesión cuando hay error).
- **Valor**: bugs reportados por Jorge ahora vienen con video del flow exacto.
- **Esfuerzo**: S

### C4. Tests E2E (Playwright)
- **Qué**: 5 flujos críticos automatizados: login, crear aviso, aprobar → OT, ejecutar, cerrar. Run en CI.
- **Valor**: el "QA humano" del documento QA_SCOPE.pdf parcialmente cubierto por tests reales.
- **Esfuerzo**: L · **Riesgo**: bajo (alto valor)

### C5. Dependabot / Renovate
- **Qué**: auto-PR cuando una dep tiene update de seguridad. Bot crea PR, CI corre tests, humano aprueba.
- **Valor**: el security hub ya no encontrará vulns viejas.
- **Esfuerzo**: S

### C6. Backup automático del SQLite
- **Qué**: cron diario que comprime la DB y la sube a un bucket S3-compatible (o git lfs por ahora).
- **Valor**: si el VPS muere, no perdemos data del cliente.
- **Esfuerzo**: S · **Riesgo**: medio (asegurar backup encriptado)

---

## 📊 D. Reliability domain — features valor de negocio

### D1. Más plantillas RCM (FMECA)
- **Qué**: 6 → 12 templates. Agregar: Tanque Almacenamiento, Válvula Control, Caldera, Hidrociclón, Filtro Prensa, Alimentador.
- **Valor**: el analista FMECA cubre 80% más equipos sin partir de cero.
- **Esfuerzo**: M

### D2. Reliability KPI alerting
- **Qué**: cuando MTBF de un equipo cae >20% trimestre vs anterior → alerta automática + sugerencia "abrir RCA?".
- **Valor**: detección proactiva de degradación.
- **Esfuerzo**: M

### D3. Weekly Digest Email
- **Qué**: email semanal al manager con: KPIs adherencia/cumplimiento, top 5 equipos críticos, OTs vencidas, fallas repetidas.
- **Valor**: visibilidad ejecutiva sin loguearse.
- **Esfuerzo**: M

### D4. Comparador de OTs históricas
- **Qué**: al abrir una OT, panel lateral con "OTs similares cerradas en este equipo" + costo / hh / duración promedio.
- **Valor**: planner usa datos reales en lugar de estimar a ojo.
- **Esfuerzo**: M

### D5. Pareto interactivo
- **Qué**: gráfico Pareto top 20 equipos por horas de falla (con drill-down).
- **Valor**: prioriza mejora continua donde duele más.
- **Esfuerzo**: M

### D6. Predicción de falla con ML (lite)
- **Qué**: modelo simple (sklearn) que predice próxima falla por equipo basado en histórico de fallas + frecuencia. Ranking de "alto riesgo siguiente semana".
- **Valor**: marketing/diferenciación vs SAP PM (que no lo tiene).
- **Esfuerzo**: L · **Riesgo**: alto (ML lite ≠ buen modelo, hay que validar precisión)

---

## 📱 E. Mobile / Field experience

### E1. PWA install prompt
- **Qué**: al cargar en móvil, banner "Instalar como app" para que técnico tenga icono en home.
- **Valor**: técnico de terreno usa Mageam como app nativa.
- **Esfuerzo**: S

### E2. Captura offline (queue + sync)
- **Qué**: técnico en faena sin señal carga aviso → se guarda local → sincroniza al volver online.
- **Valor**: no perder reportes en zonas sin red.
- **Esfuerzo**: L · **Riesgo**: medio

### E3. QR scan equipo → captura aviso
- **Qué**: técnico escanea QR del equipo en terreno → se abre Failure Capture pre-poblado con TL/TAG.
- **Valor**: reduce errores de transcripción + 30s vs typing manual.
- **Esfuerzo**: M (`QRScanner.jsx` ya existe, falta integrar)

---

## 🏢 F. Multi-tenant / scaling

### F1. Multi-planta UI mejorada
- **Qué**: cuando user tiene acceso a 2+ plantas, switcher mejorado en sidebar + colores por planta.
- **Valor**: un planner regional ve sus 3 plantas sin confundirse.
- **Esfuerzo**: S

### F2. Permisos granulares por equipo
- **Qué**: hoy el rol da acceso a toda la planta. Agregar lista whitelist de equipos que el user puede modificar.
- **Valor**: seguridad para grandes mineras (planner X solo puede tocar SAG mill).
- **Esfuerzo**: M

### F3. Export multi-planta consolidado
- **Qué**: dashboard ejecutivo con vista de N plantas + ranking por adherencia.
- **Valor**: gerente regional ve sus 5 sitios en una pantalla.
- **Esfuerzo**: M

---

## 🎨 G. Polish / UX detail

### G1. Dark mode completo
- **Qué**: hay clases `dark:` en algunos componentes pero no toggle visible. Activar + 100% coverage.
- **Esfuerzo**: M

### G2. Internacionalización completa
- **Qué**: hay `i18n/es.js`, `en.js`, `ar.js` pero ~30% de strings hardcoded. Auditoría + extracción.
- **Esfuerzo**: M

### G3. Onboarding tour
- **Qué**: `GuidedTour.jsx` ya existe parcial. Completar 5 pantallas críticas con tooltips paso-a-paso.
- **Esfuerzo**: M

### G4. Empty states con call-to-action
- **Qué**: tabla vacía → ilustración + botón "Crear primero". Hoy salen "No data" sin guía.
- **Esfuerzo**: S

---

## 📋 Recomendación David

**Tanda inmediata (~6h, alto retorno cliente):**
1. A1 (banner sync)
2. A4 (confirmación cierre con cambios)
3. A5 (filtro Mis Avisos)
4. C1+C3 (Sentry backend+frontend) — más valor por menor esfuerzo
5. B2 (PDF Report mejorado)

**Tanda diferenciador comercial (~12h, valor demo Goldfields):**
1. D1 (6 plantillas RCM más)
2. D3 (weekly digest email)
3. D4 (comparador OTs históricas)
4. B1 (notificaciones email)

**Tanda compliance (~8h, base ISO 27001):**
1. C2 (pre-commit hooks)
2. C5 (dependabot)
3. C4 (Playwright E2E al menos 3 flujos)
4. C6 (backup automático)

**Tanda mobile / field (~10h):**
1. E1 (PWA install)
2. E3 (QR scan)
3. E2 (offline queue)

---

¿Cuál arranco?
