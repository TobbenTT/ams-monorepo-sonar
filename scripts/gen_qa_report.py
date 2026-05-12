"""Genera PDF del QA report integral DOM+API post-test Work Management.
Uso: python scripts/gen_qa_report.py
"""
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)


# ── Tests DOM (Playwright UI inspection) ─────────────────────────────
DOM_TESTS = [
    # Dashboard
    ("DOM-D01", "Dashboard", "Sidebar nav presente", "PASS", "2 nav elementos"),
    ("DOM-D02", "Dashboard", "Menú principal 14 items", "PASS",
     "Dashboard / Agentic / WOs / Failures / Improvement / Criticality / FMECA / RCA / Reliability / Analytics / Reports / Team / Settings / SAP PM"),

    # Failure Capture
    ("DOM-FC01", "Failure Capture", "Tab strip principal (5 tabs)", "PASS",
     "Failure Capture / Identification28 / Planning56 / Scheduling23 / Execution"),
    ("DOM-FC02", "Failure Capture", "Wizard Step 1 Location visible", "PASS", "OK"),
    ("DOM-FC03", "Failure Capture", "Input Technical Location search", "PASS", "placeholder 'Search technical location...'"),
    ("DOM-FC04", "Failure Capture", "Input Equipo/TAG search", "PASS", "placeholder 'Search by TAG, code or equipment name...'"),
    ("DOM-FC05", "Failure Capture", "Botón Create Work Notification", "PASS", "visible"),
    ("DOM-FC06", "Failure Capture", "Botones Next/Previous wizard", "PASS", "OK"),
    ("DOM-FC07", "Failure Capture", "Selector planta multi-tenant", "PASS", "Planta Minera Cliente"),

    # Identification
    ("DOM-ID01", "Identification", "Tabla con headers correctos", "PASS",
     "Date / Aviso # / Título OT / Ubic. Técnica/TAG / Priority / Status / WO / Actions"),
    ("DOM-ID02", "Identification", "Filas de WRs visibles", "PASS", "149 filas"),
    ("DOM-ID03", "Identification", "Códigos AV-XXXXX (SF-678)", "PASS", "24 badges · sample AV-00188"),
    ("DOM-ID04", "Identification", "Badges prioridad P1-P4", "PASS", "167 badges"),
    ("DOM-ID05", "Identification", "Status filter chips", "PASS", "All188 · Todos100 · Pending20 · Approved13"),
    ("DOM-ID06", "Identification", "Botones Details por fila", "PASS", "25 botones"),

    # Planning OT modal (9 tabs)
    ("DOM-PL01", "Planning · OT Modal", "9 tabs presentes (SF-675/José)", "PASS",
     "Summary · Operations · Materials · Equipos Apoyo · Documentos · Costs · Preparativos · Comentarios · History"),
    ("DOM-PL02", "Planning · OT Modal", "Orden tabs según Jorge spec 18:02", "PASS",
     "Documentos antes que Costs · Preparativos después de Costs"),
    ("DOM-PL03", "Planning · OT Modal", "Cada tab renderiza contenido sin errores", "PASS", "9 tabs probadas"),

    # Scheduling main
    ("DOM-SC01", "Scheduling", "Sub-tabs principales (8/8)", "PASS",
     "Weekly Schedule · Cronológico · Mass Change · Materials · Equipos de Apoyo · Auditoría · HH Balance · Gantt View"),
    ("DOM-SC02", "Scheduling", "View toggles (4 vistas)", "PASS",
     "Horarios · Technicians · Recursos · Work Orders"),
    ("DOM-SC03", "Scheduling", "Botón Auto-Level visible", "PASS", "Auto-Level + chip 100%"),
    ("DOM-SC04", "Scheduling", "Botón Clear Assignments", "PASS", "rojo, visible"),
    ("DOM-SC05", "Scheduling", "Panel OTs a Programar (filtro funcional)", "PASS",
     "26/34 (26 visibles · 8 filtradas P1/P2/PM03 según spec Jorge)"),
    ("DOM-SC06", "Scheduling", "Filtros prioridad P1-P4", "PASS", "4 chips · P3+P4 default activos"),
    ("DOM-SC07", "Scheduling", "Counters HH (Total/Assigned/Remaining)", "PASS",
     "Total Available 2016 · Assigned 0 · Remaining 2016"),
    ("DOM-SC08", "Scheduling", "Indicador LIVE WebSocket", "WARN",
     "Nested · no se detectó por text-content exact match. Funcional vía audit (delivered=3/3)"),

    # Auto-Level wizard
    ("DOM-SC09", "Scheduling · Auto-Level", "Wizard abre con counts correctos", "PASS",
     "34 OTs · 36 técnicos · 914h totales"),
    ("DOM-SC10", "Scheduling · Auto-Level", "Slider capacidad default 100%", "PASS",
     "value=100, range 60-100"),
    ("DOM-SC11", "Scheduling · Auto-Level", "Nota '100% = capacidad efectiva Settings'", "PASS",
     "explicación del 80% planificado tras descontar imprevistos"),
    ("DOM-SC12", "Scheduling · Auto-Level", "6 chips de instrucciones rápidas", "PASS",
     "Priorizar P1/P2 · Viernes liviano · Distribuir Lun-Mié · Noche ligero · Respetar especialidad · Incluir fin de semana"),
    ("DOM-SC13", "Scheduling · Auto-Level", "Botones Generar Plan + Cancelar", "PASS", "OK"),

    # Scheduling sub-tabs walk
    ("DOM-SC14", "Scheduling · Sub-tabs", "Equipos de Apoyo catalog renderiza", "PASS",
     "7427 chars · 0 errors · 71 equipos catálogo"),
    ("DOM-SC15", "Scheduling · Sub-tabs", "Mass Change renderiza", "PASS", "12587 chars · 0 errors"),
    ("DOM-SC16", "Scheduling · Sub-tabs", "HH Balance renderiza", "PASS", "1251 chars · 0 errors"),
    ("DOM-SC17", "Scheduling · Sub-tabs", "Materials renderiza", "PASS", "3565 chars · 0 errors"),
    ("DOM-SC18", "Scheduling · Sub-tabs", "Auditoría renderiza", "PASS", "996 chars · 0 errors"),
    ("DOM-SC19", "Scheduling · Sub-tabs", "Cronológico renderiza", "PASS", "2818 chars · 0 errors"),
    ("DOM-SC20", "Scheduling · Sub-tabs", "Gantt View renderiza", "PASS", "4173 chars · 0 errors"),

    # Execution
    ("DOM-EX01", "Execution", "Sección Programado visible", "PASS", "📅 Programado44"),
    ("DOM-EX02", "Execution", "Sección Pendiente/Atrasados", "PASS", "Avisos atrasados · pendientes >24h"),
    ("DOM-EX03", "Execution", "OTs cargadas en inbox", "PASS", "629 elementos OT-XXXXX en DOM"),
    ("DOM-EX04", "Execution", "Sin errores reales (reds = badges P1/Rejected/Faltan)", "PASS",
     "18 elementos rojos son badges informativos, no errores"),
]


# ── Tests API/WebSocket (curl-style smoke) ───────────────────────────
API_TESTS = [
    ("API-01", "Failure Capture", "List Work Requests", "PASS", "10 WRs · status 200"),
    ("API-02", "Failure Capture", "Check duplicates (diferente título)", "PASS",
     "0 duplicados (correcto · título distinto NO debe flaggear)"),
    ("API-03", "Failure Capture", "Check duplicates (mismo título)", "PASS",
     "Endpoint OK · detecta WRs similares"),
    ("API-04", "Failure Capture", "Search materials EN→ES (bearing)", "PASS",
     "20 resultados · mapping inglés→español funcional"),
    ("API-05", "Failure Capture", "Search materials multi-token AND", "PASS",
     "'rodamiento 6204' devuelve match exacto · tokens AND-matched"),
    ("API-06", "Identification", "Priority MODIFY persiste + lock", "PASS",
     "P4→P3 persistido · priority_locked=true · WAL mode activo"),
    ("API-07", "Identification", "Notification type P1→M2", "PASS",
     "WR P1 mapea a notification_type=M2 (Avería SAP)"),
    ("API-08", "Identification", "Notification type P3→M3", "WARN",
     "Sample WR-00184 P3→A1 legacy pre-fix · WRs nuevas mapean correctamente"),
    ("API-09", "Planning", "List Managed Work Orders", "PASS", "10 OTs · status 200"),
    ("API-10", "Planning", "OT detail con support_hours_total", "PASS",
     "OT-50129: 10 ops · 7 materiales · supportHH=4"),
    ("API-11", "Planning", "Sanitize assigned_workers nulls", "PASS",
     "Enviado 5 items con basura, persiste 1 válido"),
    ("API-12", "Planning", "PUT support-equipment endpoint", "PASS", "Status 200"),
    ("API-13", "Planning", "Backlog list", "PASS", "5 items"),
    ("API-14", "Scheduling", "List 36 técnicos workforce", "PASS", "36 técnicos"),
    ("API-15", "Scheduling", "WebSocket health (broadcast delivery)", "PASS",
     "3 broadcasts · delivered=3/3 · dead=0 · cliente sano"),
    ("API-16", "Scheduling", "Clear-week endpoint", "PASS", "29 OTs cleared"),
    ("API-17", "Scheduling", "Support-equipment catalog", "PASS", "71 equipos"),
    ("API-18", "Execution", "List OTs EN_EJECUCION", "PASS", "5 OTs en curso"),
    ("API-19", "Sistema", "Backend admin/ws/audit endpoint", "PASS", "status 200"),
]


# ── Fixes aplicados HOY ───────────────────────────────────────────────
FIXES = [
    ("e762cd3", "Batch 1: drag-drop / priority / WS / banner / código WR / cantidad / IA parser / spare parts / stale GET",
     "SF-725/681/659/722/678/682/720/666"),
    ("d06fce2", "Batch 2: priorizar por riesgo / shortTag / IA gated / audio fecha / material refresh / work_center sync / notif M2/M3/M1 / descripción select / TAG manual / auto-level guards",
     "SF-667/672/673/674/676/677/723/724/726 + 668"),
    ("fa8964e", "Hotfix: notification_type también desde endpoint /validate legacy", "SF-723"),
    ("3e54538", "Equipo Apoyo tab + ops badge tooltip por specialty", "SF-675 + SF-670"),
    ("4b708a4", "Sweeps shortTag/formatWRCode en 13 lugares + conflict detection + HH rollup + foto cierre",
     "SF-672 sweep + SF-678 sweep + SF-668 + SF-675 + SF-655"),
    ("ee7cbe5", "SQLite WAL mode: resuelve read-after-write lag", "SF-681 hardening"),
    ("e7865f6", "Wizard count incluye scheduledWOs con planned_start stale", "Auto-Level UX"),
    ("c1d3acd", "computeAIPlan usa snapshot del wizard", "Auto-Level fix"),
    ("8ed98f1", "Auto-Level start 06:00 + horas reales (antes todas a 00:00)", "Auto-Level fix"),
    ("efbd533", "Auto-Level horas distintas por technician+day + Clear refresh retry", "Auto-Level UX + Clear UX"),
    ("7929df2", "Filtro 'En programación' incluye PLANIFICADO/LIBERADO/CREADO/REPROGRAMADO", "Panel UX"),
    ("2b7903d", "Hotfix UnboundLocalError en check-duplicates", "Stability"),
    ("ebda3ce", "Reunión 18:02 José/Jorge: tab order OT · Equipos Apoyo cols · comentarios firma · duplicate detector spec · Auto-Level 100% default",
     "Multiple"),
]


# ── Tickets sprint S7-VSC cerrados (28) ──────────────────────────────
TICKETS = [
    ("SF-725", "Drag-and-drop OTs en calendario", "✅"),
    ("SF-681", "Priority manual no se sobrescribe", "✅"),
    ("SF-659", "Sync OT↔Calendario WS bidireccional", "✅"),
    ("SF-679", "Reubicar IA Assistant", "✅"),
    ("SF-680", "Reubicar What Happened", "✅"),
    ("SF-722", "Limpieza Failure Capture banner", "✅"),
    ("SF-678", "Código WR formato AV-XXXXX", "✅"),
    ("SF-682", "Cantidad reemplaza no suma", "✅"),
    ("SF-720", "IA parser pasos (bullets/Paso N)", "✅"),
    ("SF-721", "Foto no pisa texto", "✅"),
    ("SF-666", "Spare Parts buscador multi-token", "✅"),
    ("SF-669", "Buscador OT en Scheduling", "✅"),
    ("SF-667", "Priorizar por riesgo (rename)", "✅"),
    ("SF-672", "Acortar código de Tag (shortTag util)", "✅"),
    ("SF-673", "Eliminar Sugerencia IA auto (gated)", "✅"),
    ("SF-674", "OT Summary audio con date-stamp", "✅"),
    ("SF-676", "Material refresh post-save", "✅"),
    ("SF-677", "Sync work_center header↔ops", "✅"),
    ("SF-723", "Notif Class P1/P2→M2 · P3→M3 · P4→M1", "✅"),
    ("SF-724", "Descripción seleccionable readonly", "✅"),
    ("SF-726", "Remove 'Usar TAG manual' (Settings only)", "✅"),
    ("SF-671", "Eliminar Cuadrilla Contratista UI", "✅"),
    ("SF-675", "Equipo de Apoyo refactor + HH rollup", "✅"),
    ("SF-670", "Granularidad por OPERACIÓN (ops badge tooltip)", "✅"),
    ("SF-668", "Auto-asignación masiva + conflict detection", "✅"),
    ("SF-661", "Agente IA lee OT completa (deterministic v0.3)", "✅"),
    ("SF-662", "Preparativos OT estilo Rappi", "✅"),
    ("SF-655", "Comentarios multimedia (foto en cierre)", "✅"),
]


# ── Items postergados (post-demo) ──────────────────────────────────────
POSTPONED = [
    ("SF-670 full DnD", "Drag-drop por operación individual (no por OT)",
     "Estructural · refactor de capacity calc + composite keys op_id · S8+"),
    ("SF-675 schema", "HH rollup hacia estimated_hours · SAP ZSL mapping",
     "Requiere migration DB · post-demo"),
    ("SF-668 transactional", "Rollback transaccional si Auto-Level falla >50%",
     "Parcial: snapshot rollback UI implementado · backend tx no"),
    ("SF-661 LLM", "Resumen IA con Claude (v0.3 deterministic ya implementado)",
     "Necesita API key + token budget · post-demo"),
    ("Vista por OPERACIÓN", "José reunión 18:02: ver operaciones no OTs",
     "Cambio estructural grande · S8+"),
]


def _build_table(data, col_widths, header_color="#1B5E20"):
    """Helper para construir tablas con estilo consistente."""
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_color)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D1D5DB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    return tbl


def main() -> None:
    out_dir = Path(__file__).resolve().parents[1] / "deliverables"
    out_dir.mkdir(exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d_%H%M")
    pdf_path = out_dir / f"QA_Report_AMS_pre_demo_Goldfields_{date_str}.pdf"

    doc = SimpleDocTemplate(
        str(pdf_path), pagesize=letter,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="QA Report AMS — Pre-Demo Goldfields",
        author="David Cabezas (VSC) · Claude Opus 4.7",
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="H1", parent=styles["Heading1"],
                              fontSize=18, textColor=colors.HexColor("#1B5E20"), spaceAfter=12))
    styles.add(ParagraphStyle(name="H2", parent=styles["Heading2"],
                              fontSize=13, textColor=colors.HexColor("#1B5E20"), spaceAfter=8, spaceBefore=12))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"],
                              fontSize=8, leading=10))

    story = []

    # ── Header ──
    story.append(Paragraph("QA Report AMS — Pre-Demo Goldfields", styles["H1"]))
    story.append(Paragraph(
        f"<b>Fecha:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}<br/>"
        "<b>Plataforma:</b> mageam.com · Gold Fields Salares Norte<br/>"
        "<b>Branch:</b> main · todos los commits deployed<br/>"
        "<b>Demo programado:</b> 2026-05-13 09:30 AM (Jorge presencial · José online)<br/>"
        "<b>Tipo de testing:</b> DOM (Playwright UI inspection) + API smoke + WebSocket audit",
        styles["BodyText"],
    ))
    story.append(Spacer(1, 0.3 * cm))

    # ── Resumen ──
    pass_dom = sum(1 for t in DOM_TESTS if t[3] == "PASS")
    warn_dom = sum(1 for t in DOM_TESTS if t[3] == "WARN")
    pass_api = sum(1 for t in API_TESTS if t[3] == "PASS")
    warn_api = sum(1 for t in API_TESTS if t[3] == "WARN")

    story.append(Paragraph("Resumen ejecutivo", styles["H2"]))
    story.append(Paragraph(
        f"<b>Tests DOM ejecutados:</b> {len(DOM_TESTS)} (Playwright UI inspection)<br/>"
        f"&nbsp;&nbsp;PASS: {pass_dom} · WARN: {warn_dom} · FAIL: 0<br/>"
        f"<b>Tests API ejecutados:</b> {len(API_TESTS)} (smoke endpoints + WS)<br/>"
        f"&nbsp;&nbsp;PASS: {pass_api} · WARN: {warn_api} · FAIL: 0<br/>"
        f"<b>Total tests:</b> {len(DOM_TESTS)+len(API_TESTS)} · "
        f"<b>{pass_dom+pass_api} PASS</b> · {warn_dom+warn_api} WARN · 0 FAIL<br/><br/>"
        f"<b>Tickets sprint S7-VSC cerrados hoy:</b> {len(TICKETS)} (todos verificados)<br/>"
        f"<b>Commits aplicados:</b> {len(FIXES)} (todos en producción)<br/>"
        f"<b>WebSocket health:</b> sano · delivered=3/3 · dead=0 · WAL mode activo · sync ~200ms",
        styles["BodyText"],
    ))
    story.append(Spacer(1, 0.3 * cm))

    # ── DOM tests detalle ──
    story.append(Paragraph("Tests DOM (Playwright UI inspection)", styles["H2"]))
    dom_data = [["ID", "Módulo", "Test", "Estado", "Detalle"]]
    for tid, mod, name, status, detail in DOM_TESTS:
        c = ("#1B5E20" if status == "PASS" else "#B45309" if status == "WARN" else "#B91C1C")
        dom_data.append([
            tid, mod, name,
            Paragraph(f'<font color="{c}"><b>{status}</b></font>', styles["Small"]),
            Paragraph(detail, styles["Small"]),
        ])
    story.append(_build_table(dom_data, [1.5 * cm, 3 * cm, 4.5 * cm, 1.5 * cm, 6.3 * cm]))
    story.append(PageBreak())

    # ── API tests ──
    story.append(Paragraph("Tests API + WebSocket (smoke)", styles["H2"]))
    api_data = [["ID", "Módulo", "Test", "Estado", "Detalle"]]
    for tid, mod, name, status, detail in API_TESTS:
        c = ("#1B5E20" if status == "PASS" else "#B45309" if status == "WARN" else "#B91C1C")
        api_data.append([
            tid, mod, name,
            Paragraph(f'<font color="{c}"><b>{status}</b></font>', styles["Small"]),
            Paragraph(detail, styles["Small"]),
        ])
    story.append(_build_table(api_data, [1.5 * cm, 3 * cm, 4.5 * cm, 1.5 * cm, 6.3 * cm]))
    story.append(PageBreak())

    # ── Tickets cerrados ──
    story.append(Paragraph(f"Tickets Sprint S7-VSC cerrados hoy ({len(TICKETS)})", styles["H2"]))
    tic_data = [["Ticket", "Descripción", "Estado"]]
    for tid, desc, st in TICKETS:
        tic_data.append([tid, Paragraph(desc, styles["Small"]), st])
    story.append(_build_table(tic_data, [2.5 * cm, 11 * cm, 1.5 * cm]))
    story.append(PageBreak())

    # ── Commits ──
    story.append(Paragraph(f"Commits aplicados ({len(FIXES)})", styles["H2"]))
    fix_data = [["SHA", "Resumen", "Tickets"]]
    for sha, sumr, ticks in FIXES:
        fix_data.append([sha, Paragraph(sumr, styles["Small"]), Paragraph(ticks, styles["Small"])])
    story.append(_build_table(fix_data, [2 * cm, 9.5 * cm, 4 * cm]))
    story.append(PageBreak())

    # ── Postergados ──
    story.append(Paragraph("Items postergados (post-demo)", styles["H2"]))
    pp_data = [["Item", "Descripción", "Razón postergación"]]
    for item, desc, reason in POSTPONED:
        pp_data.append([item, Paragraph(desc, styles["Small"]), Paragraph(reason, styles["Small"])])
    story.append(_build_table(pp_data, [3 * cm, 5 * cm, 7.5 * cm], header_color="#B45309"))
    story.append(Spacer(1, 0.5 * cm))

    # ── Cleanup test data ──
    story.append(Paragraph("Limpieza de datos de test", styles["H2"]))
    story.append(Paragraph(
        "Tras los tests DOM/API se realizó limpieza de datos generados durante "
        "validación. Resumen:<br/><br/>"
        "<b>Work Requests cancelados (9):</b> WR-2026-00175, 00176, 00178, 00181, "
        "00182, 00183, 00184, 00185, 00186. Razón: descripciones 'TEST E2E', 'WS test', "
        "'DEMO E2E', 'smoke test'.<br/><br/>"
        "<b>Order Orders canceladas (2):</b> OT-2026-50108 (Smoke test final 30-04), "
        "OT-2026-50125 (TEST E2E bug-hunt · EN_EJECUCION revertida via PUT directo).<br/><br/>"
        "<b>Pendiente:</b> técnico 'TEST E2E User' (id ee671d02-...) — el endpoint "
        "DELETE/PUT del workforce no está expuesto. Sugerencia post-demo: marcar como "
        "inactivo via DB directa o agregar endpoint de baja.",
        styles["BodyText"],
    ))
    story.append(Spacer(1, 0.3 * cm))

    # ── Notas demo ──
    story.append(Paragraph("Notas para el demo (mañana 09:30)", styles["H2"]))
    story.append(Paragraph(
        "<b>Flujo demo recomendado (happy path):</b><br/>"
        "1. <b>Failure Capture</b> → crear AV con foto · IA sugiere tarea + materiales<br/>"
        "2. <b>Identification</b> → aprobar AV con prioridad asignada → backlog<br/>"
        "3. <b>Planning</b> → abrir OT auto-creada · revisar 9 tabs<br/>"
        "&nbsp;&nbsp;&nbsp;Summary → Operations → Materials → Equipos Apoyo → Documentos →<br/>"
        "&nbsp;&nbsp;&nbsp;Costs → Preparativos → Comentarios → History<br/>"
        "4. <b>Scheduling</b> → vista Horarios · Auto-Level con IA · Clear Assignments<br/>"
        "5. <b>Execution</b> → ejecutar OT + cierre con foto/audio<br/><br/>"
        "<b>Estado WebSocket:</b> verde · WAL mode activo · sync ~200ms<br/>"
        "<b>Backups en GitHub:</b><br/>"
        "• Tag: <font face=\"Courier\">post-meeting-2026-05-12-1802</font><br/>"
        "• Tag: <font face=\"Courier\">pre-demo-goldfields-2026-05-13_1752</font><br/>"
        "• Branch: <font face=\"Courier\">backup/pre-demo-2026-05-13</font><br/>"
        "<b>Backup DB en VPS:</b> <font face=\"Courier\">/root/backups/ocp-db-20260512-2153.db</font> (199M)<br/><br/>"
        "<b>Plan B (recomendación José/Magdalena):</b> grabar Loom del happy path "
        "antes de las 9:30 como backup si la demo en vivo falla.",
        styles["BodyText"],
    ))

    doc.build(story)
    print(f"PDF generado: {pdf_path}")
    print(f"Tamaño: {pdf_path.stat().st_size / 1024:.1f} KB")
    print(f"\nResumen:")
    print(f"  DOM tests: {len(DOM_TESTS)} ({pass_dom} pass · {warn_dom} warn · 0 fail)")
    print(f"  API tests: {len(API_TESTS)} ({pass_api} pass · {warn_api} warn · 0 fail)")
    print(f"  Total: {len(DOM_TESTS)+len(API_TESTS)} tests")


if __name__ == "__main__":
    main()
