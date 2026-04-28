# Backlog de Tandas Pendientes — 2026-04-28

**Contexto:** consolidación de items que quedaron sin cubrir tras Tandas A + B1 + B2 + B3 + SF-559 + SF-562 (sesión 2026-04-27/28). Incluye los 6 items derivados de la transcripción Magda en `Seudo clientes/04-27 Reunión...`.

**Cómo leer este doc:** cada item tiene **valor**, **esfuerzo** (S=≤2h / M=2-6h / L=6-12h / XL=>12h) y **dependencias**. Las tandas se asignan por afinidad funcional, no por prioridad estricta — eso lo decide José/Jorge.

---

## 📋 Resumen ejecutivo

| Tanda | # items | Esfuerzo total | Bloqueante para Goldfields |
|---|---|---|---|
| **C** Módulo Ejecución (SF-566) | 7 | ~XL (~18h) | Sí — sprint SP5 incompleto sin esto |
| **B3 full** Refinamientos pesados Scheduling | 3 | ~L (~12h) | No — wins ya entregados |
| **D** Datos / Avisos / RBAC | 5 | ~M-L (~10h) | Parcial — afecta operación real |
| **E** Backlog discrecional (mejoras UX) | abierto | — | No |
| **Total estimado** | ~15 items | **~40h** | 5-6 jornadas dev |

---

## 🟧 Tanda C — Módulo Ejecución (SF-566)

**Ticket Jira:** SF-566 (sprint SP5 #11). Es el último ticket abierto del sprint. Sin esto el sprint queda incompleto.

### C1. Pestaña "Programado" cronológica
- **Qué:** vista del supervisor con OTs programadas para la semana en curso, organizadas por día y dentro de cada día por **orden cronológico de hora de inicio**, separadas por turno día (07-19) y noche (19-07).
- **Valor:** el supervisor llega al turno y sabe en qué orden ejecutar las OTs. Hoy no tiene esa vista.
- **Esfuerzo:** M (~3h)
- **Origen:** Magda transcript líneas 442-456, Jorge transcript original 1129-1156

### C2. Navegación entre semanas anteriores
- **Qué:** controles `<` `>` para ir a semana 16, 15, 14… Cambiar el filtro "Hoy" por "Listado por semana" controlado por filtros arriba (igual que la conversación con Magda).
- **Valor:** supervisor que vuelve de descanso 7×7 ve qué ejecutaron sus reemplazos.
- **Esfuerzo:** S (~1h)
- **Dependencia:** C1
- **Origen:** Magda 458-466

### C3. Pestaña "No Programado" con OTs PM03
- **Qué:** segunda pestaña que lista OTs PM03 nacidas de avisos P1/P2 (fallas) que el supervisor debe atender ese día. Filtro por estatus + prioridad. Botón rápido para "Tomar OT".
- **Valor:** el 20% del tiempo del supervisor son fallas. Hoy no tiene tablero dedicado.
- **Esfuerzo:** M (~4h)
- **Origen:** Jorge transcript 1265-1304

### C4. Supervisor procesa aviso → OT (flujo completo)
- **Qué:** supervisor desde la pestaña No Programado puede tomar un aviso P1/P2, validar la sugerencia IA, ajustar materiales/operaciones/recursos, transformar a OT, asignar técnicos del turno, ejecutar. Mismo flujo que el planificador pero condensado.
- **Valor:** supervisor opera autónomo en falla sin esperar al planner.
- **Esfuerzo:** L (~4h)
- **Dependencia:** C3
- **Origen:** Jorge transcript 1283-1320

### C5. AI assist en OT de emergencia
- **Qué:** integrar el endpoint actual de clasificación IA dentro del flujo de C4 — sugerir actividades + repuestos + duración cuando el supervisor crea la OT desde el aviso. Sólo sugerencia, supervisor valida.
- **Valor:** acelera la creación de OT de emergencia. Ya existe el motor IA, sólo hay que conectarlo en este flujo nuevo.
- **Esfuerzo:** M (~3h)
- **Dependencia:** C4
- **Origen:** SF-566 acceptance criteria

### C6. Validación obligatoria del supervisor antes de avanzar
- **Qué:** gate UX: la OT PM03 no pasa a EN_EJECUCION hasta que el supervisor confirme con un botón explícito "Validado por supervisor". Audit trail registra quién y cuándo.
- **Valor:** auditoría 27001 (A.8.32) + responsabilidad clara en falla.
- **Esfuerzo:** S (~1h)
- **Dependencia:** C4

### C7. RBAC scoped por especialidad (NUEVO de Magda)
- **Qué:** supervisor mecánico solo ve técnicos mecánicos en su sección Team + solo puede modificar su disponibilidad/turno; supervisor eléctrico análogo. Backend filter + frontend hidden.
- **Valor:** evita conflictos de "yo edité a tu técnico". Pedido directo Jorge.
- **Esfuerzo:** M (~2h) — tabla `user.scoped_specialty` + middleware
- **Origen:** **Magda transcript 210** "La idea es que el supervisor mecánico solamente pueda evitar la información de sus técnicos mecánicos y no se meta con los eléctricos"

**Total Tanda C: ~18h**

---

## 🟦 Tanda B3 full — Refinamientos pesados Scheduling

Lo que quedó del sprint 2026-04-27. Wins rápidos ya entregados; estos requieren scope grande.

### B3-FULL-1. Drag de operaciones por especialidad (NUEVO de Magda)
- **Qué:** al expandir una OT en el calendario, ver operaciones agrupadas por disciplina con HH parciales. **Arrastrar** las mecánicas a un técnico mecánico, las eléctricas a un técnico eléctrico, **por separado**. Hoy una OT mixta se asigna entera a un único técnico aunque tenga ops de varias disciplinas.
- **Valor:** crítico — hoy una OT 16h con 8h MEC + 8h ELEC se carga 16h al mecánico y 0h al eléctrico (el bug que vio Jorge en cap. de pantalla del 27 abr).
- **Esfuerzo:** L (~5h) — UX rework grande del card expandido
- **Origen:** **Magda transcript 110-116, 224**, Jorge transcript original 290-316. Cubre criterio acceptance restante de SF-559

### B3-FULL-2. Equipo apoyo: constraint exclusividad simultánea (NUEVO de Magda)
- **Qué:** modelo de datos: tabla intermedia `wo_support_equipment` (wo_id, equipment_id, time_slot). Al programar una actividad que requiere puente grúa único, sistema detecta si otra OT en mismo turno/horario ya lo reservó y **bloquea/alerta**.
- **Valor:** crítico operacional — Jorge dijo "el programador puede recurrir en el error de programar todas actividades simultáneas que ocupan un solo equipo".
- **Esfuerzo:** L (~5h) — backend tabla + relación + check overlap; frontend warning al drop
- **Origen:** **Magda transcript 392-394**, Jorge transcript 1003-1045

### B3-FULL-3. Equipo apoyo conectado al Aviso paso 2 (NUEVO de Magda)
- **Qué:** en `FailureCapture.jsx` paso 2 (Failure), el dropdown "support equipment" hoy probablemente lee data hardcoded/dummy. Debe llamar `api.listSupportEquipment(plantId)` y poblar con los equipos reales del módulo Settings → Equipos.
- **Valor:** lo que carga el supervisor en Settings se ve donde se necesita. Hoy hay desconexión.
- **Esfuerzo:** S (~30 min)
- **Origen:** **Magda transcript 408-414** "ahí te está agarrando ojo de data dami y eso, entonces hay que conectar esos módulos, David"

### B3-FULL-4. Impacto autolevel del A/B/C 8h subterránea
- **Qué:** hoy el setting `shiftType=abc_8h` lo lee `handleScheduleWO` para warning de saldo, pero `computeAIPlan` (autolevel) sigue asumiendo turnos de 12h. Ajustar el algoritmo para 3 turnos × 8h cuando subterránea.
- **Valor:** sólo aplica si Goldfields opera mina subterránea. Goldfields San Nicolás es planta — no urgente.
- **Esfuerzo:** M (~3h)

**Total Tanda B3 full: ~14h** (3 items críticos + 1 condicional)

---

## 🟨 Tanda D — Datos / Avisos / RBAC

### D1. Carga masiva Team desde Excel (con turno) — REVISADA con Magda
- **Qué:** botón "Importar técnicos" en TeamPage. Acepta `.xlsx` con columnas: `username, full_name, specialty, shift, shift_pattern, shift_cycle_start, skills, certifications, plant_id`. Validación + preview + commit. Aprobado solo para supervisor del rol/especialidad correspondiente (relacionado con C7 RBAC).
- **Valor:** Magda dijo "lo dijo antes Jorge, si tienes 120 horas, eso quiere decir que tienes por día… cuántos puedes llegar a tener dentro del equipo, me imagino que son hartos como para cargar los manuales". Crítico para arranque Goldfields formal.
- **Esfuerzo:** M (~3h) — incluye validación de duplicados + masking si datos reales
- **Origen:** Magda transcript 196-216

### D2. WR cantidad + reserva unitaria
- **Qué:** en el wizard del Aviso, el paso de materiales debe permitir cantidad por ítem y crear reservas unitarias separadas si el planificador lo necesita. Hoy es agrupado bajo una sola reserva por OT.
- **Valor:** SAP PM workflow estándar. Auditoría exige este nivel.
- **Esfuerzo:** S (~2h)
- **Origen:** Jorge FEEDBACK.docx + transcript original 956-958 "se podría crear una segunda reserva en la D y venir más reserva con cada una de sus repuestos"

### D3. Limpieza data demo
- **Qué:** seed actual tiene "todos técnicos" como mencionó Jorge. Revisar `seed_demo_data.py` para distribuir roles realistas (1 admin, 1-2 manager, 2 planner, 4-6 supervisor, 15-25 tecnico).
- **Valor:** demo creíble + permite probar RBAC sin datos artificiales.
- **Esfuerzo:** S (~1h)
- **Origen:** Jorge FEEDBACK.docx "PQ todos nuestro team son technicos"

### D4. Campo "Impacto" en WR
- **Qué:** Jorge dijo "me falta esto del impacto". Posiblemente escala de impacto operacional (Bajo/Medio/Alto/Crítico) usado para priorización. Backend ya tiene `impact_level`; falta UI y wizard.
- **Valor:** matriz de criticidad consistente entre WR/OT/FMECA.
- **Esfuerzo:** S (~2h)
- **Origen:** Jorge FEEDBACK.docx

### D5. Diseño Login mobile final
- **Qué:** rediseñar login mobile (pendiente desde sesiones previas — Jorge mencionó pero no priorizó).
- **Valor:** experiencia móvil del técnico al entrar a la app.
- **Esfuerzo:** S (~1h)

**Total Tanda D: ~9h**

---

## 🟪 Tanda E — Backlog discrecional (no urgente)

Items menores que pueden esperar o salir del scope si no se pide.

### E1. Multi-select bulk en Planning con audit explícito (resto de SF-557)
- **Qué:** SF-557 está parcial. Falta panel lateral "audit trail" que muestre el quién/cuándo del cambio masivo.
- **Esfuerzo:** S (~1h) — el audit ya queda guardado, solo falta UI

### E2. Wizard A/B con auto-asignación real del saldo (resto de SF-562)
- **Qué:** hoy el wizard A/B persiste el plan en notas; falta que **realmente cree la continuación** (split de la OT en 2 entries: turno 1 + turno 2). Backend table + sync.
- **Esfuerzo:** L (~4h)

### E3. Reservas múltiples por OT
- **Qué:** UI para crear sub-reservas dentro de una misma OT. Backend modela `reservation_codes: list[str]`.
- **Esfuerzo:** M (~2h)

### E4. ws-debug roles más granulares
- **Qué:** página `/ws-debug` solo admin. Habilitar para "manager" en lectura.
- **Esfuerzo:** S (~30 min)

---

## 🚨 Acciones de infra paralelas (no son tanda — son urgentes)

Independientes del cliente, deben hacerse YA:

1. **`ams_backup.sh` + cron diario + Backblaze B2 off-site** — 1h. Sin esto, riesgo alto si VPS Hostinger falla.
2. **UptimeRobot free** — 15 min.
3. **Sentry free tier (frontend + backend)** — 1h.
4. **Hardening SSH (key-only, fail2ban)** — 1h.
5. **Pedir DPA + sub-processors a Hostinger** — email, 0 código.
6. **Documentar procedimiento de restauración + probarlo** — 1h.

Detalle completo en `docs/INFRA_REQUIREMENTS.md` §5 y §6.

**Total infra: ~5h, prioridad alta**.

---

## 📅 Plan sugerido de cierre

| Día | Foco | Items | Esfuerzo |
|---|---|---|---|
| **Día 1 mañana** | Infra urgente | backup + UptimeRobot + Sentry | 3h |
| **Día 1 tarde** | Tanda B3-FULL-3 (S) + D3 (S) + E1 (S) + B3-FULL-4 si subterránea aplica | 3-4 items chicos | 4h |
| **Día 2** | Tanda C completa (C1-C7) | módulo Ejecución | 18h (2 días dev) |
| **Día 4** | Tanda B3-FULL-1 (drag por specialty) | 1 item grande | 5h |
| **Día 5** | Tanda B3-FULL-2 (equipo exclusividad) + D1 (Excel team) | 2 items grandes | 8h |
| **Día 6** | Tanda D (resto: D2, D4, D5) | 3 items chicos | 5h |
| **Día 7** | Tanda E (backlog discrecional) o sprint review | abierto | — |

**Total: ~6-7 jornadas dev + 1 día de infra = ~50-55h reales para cerrar TODO**.

Si Goldfields formaliza contrato la semana próxima, el orden cambia: priorizar infra + Tanda C + RBAC (C7) + carga Team (D1).

---

## 🔗 Cross-references

- Sprint Jira SP5: `SF-556..SF-566` — solo **SF-566** abierto, los otros 10 a Desarrollado.
- Doc infra: `docs/INFRA_REQUIREMENTS.md`
- Doc QA ISO 27001: `docs/QA_SCOPE.md` (rev 2)
- Transcripciones origen: `Ayudas/meeting_transcript_2026-04-27_*.md`, `Seudo clientes/04-27 Reunión...`
- Memoria Claude: `MEMORY.md` items relacionados

---

**Versión:** 1.0 · **Última actualización:** 2026-04-28 · **Próxima revisión:** al cierre de Tanda C o si Jorge agrega items.
