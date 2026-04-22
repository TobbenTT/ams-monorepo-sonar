# Roadmap post-WR (2026-04-22)

Jorge confirma WR completo. Foco: análisis de confiabilidad y cerrar módulos stub.
Auditoría base: ~70 % core workflow; ~40 % analítica/reliability/health.

## Fase 0 — baseline ya desplegado

- WR full (SF-489→SF-511 block A) ✓
- Historial turnos, Notif HH, Post-Review RCM, KPIs Adherencia/Cumplimiento, auto-reschedule ✓

## Fase 1 — FMECA UI end-to-end (crítico para demo)

Backend completo (4-stage engine, RPN, RCM router, auto-gen de tareas). UI hoy es radar hardcodeado + tabla read-only con RPN=140.

- [ ] 1a. Stage 3 row editor con inputs Sev/Occ/Det + cálculo RPN en vivo
- [ ] 1b. Stage 1-2 forms (Functions → Functional Failures → Failure Modes) con validador mechanism+cause
- [ ] 1c. Stage 4 decisiones RCM (strategy_type) + botón Generate Tasks con feedback visual
- [ ] 1d. Stage navigator (1→2→3→4) con `stage_completion` progress bar
- [ ] 1e. Reemplazar RADAR_DATA hardcodeado por resumen real del worksheet

## Fase 2 — RCA polish (baja complejidad, gana demo)

RCA full-stack ya conectado (`RCA.jsx` 25 KB, engine GFSN+5W2H+Ishikawa). Gaps visuales:

- [ ] 2a. Visualizador Ishikawa (6M) — hoy `cause_effect_diagram` se guarda JSON, no se renderiza
- [ ] 2b. 5P evidence uploads (Part / Position / Paper / People / Paradigm) con attachments
- [ ] 2c. Cierre RCA → crear CAPA automática en `improvement_actions`

## Fase 3 — Cross-module hooks

- [ ] 3a. WO fallada P1/P2 → trigger auto-init de FMECA worksheet para ese equipo
- [ ] 3b. Health score drop → trigger RCA level suggestion
- [ ] 3c. FMECA tasks generados → visibles en backlog de Planning

## Fase 4 — Criticality Assessment (hoy: half-wired)

Backend 53 L existe; `Criticality.jsx` tiene `EQUIPMENT_LIST = []` hardcodeado.

- [ ] 4a. Wire lista de equipos desde hierarchy router en Criticality.jsx
- [ ] 4b. Matriz 6S editable + cálculo automático de clase AA/A+/A/B/C/D
- [ ] 4c. Propagar clase al cálculo RPN del FMECA (criticidad del equipo eleva el RPN)

## Fase 5 — Módulos faltantes prioritarios (stub / missing)

- [ ] 5a. **Shutdown Planning UI** — backend existe (`calendar` + `reliability.shutdown`); no hay página Calendar en nav
- [ ] 5b. **Health Score page** — backend via analytics; zero frontend. Dashboard de dimensiones + trend por equipo
- [ ] 5c. **Spare Parts UI** — `reliability.analyze_spare_parts` + RBI; sin frontend. Browser + reserva de stock
- [ ] 5d. **Notifications Center** — backend 90 L; sin UI agregado (solo FeedbackWidget aislado)

## Fase 6 — Limpieza de Potemkin villages

Pages frontend-only con datos mock visibles en demo:

- [ ] 6a. `PerformanceAnalysis.jsx` — meetings form no persiste; cablear backend o quitar
- [ ] 6b. `Strategy.jsx` — selector de estrategia sin CRUD backend
- [ ] 6c. `Status.jsx` — estática; o conectar a `/health` o quitar de nav
- [ ] 6d. `SecurityCompliancePage.jsx` — UI sin backend de query (audit log existe aparte)
- [ ] 6e. `SettingsPage.jsx` — plant config solo frontend; decidir si persistir
- [ ] 6f. `Hierarchy.jsx` — `EQUIPMENT_LIST = []` vacío; wire hierarchy router

## Fase 7 — Backend-only sin UI (decidir: build UI o eliminar del bundle)

- `sync` (PWA offline) — sin mobile field PWA construida
- `transcribe` (audio→texto) — sin recorder
- `planner` backlog — dead-end; `scheduling` lo reemplazó
- `tasks` genérico — redundante con `execution`
- `sap_pm` — solo lectura, sin pantallas de write

## Fase 8 — SAP integration real

Bloqueado por credenciales del cliente (SF-512). Mientras, mock sigue sirviendo demo.

## Fase 9 — Missing entirely (low priority)

- Failure Prediction ML — sin backend, sin frontend
- Training / Skills matrix — sin backend, sin frontend
- Mobile parity con reliability/criticality (móvil hoy 80 %: solo WR + task flows)

---

**Orden sugerido para próximas sesiones:**
1. Fase 1 (FMECA UI) — 2-3 sesiones
2. Fase 4 (Criticality wire) — 1 sesión
3. Fase 2 (RCA polish) — 1 sesión
4. Fase 3 (cross-hooks) — 1 sesión
5. Fase 6 (Potemkin cleanup) — 1 sesión
6. Fase 5 (módulos faltantes) — on demand

Fase 1 + 4 son suficientes para dar visto bueno comercial sin exponer gaps.
