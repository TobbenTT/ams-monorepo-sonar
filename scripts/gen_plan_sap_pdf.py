"""Genera plan-integracion-sap.pdf — propuesta técnica del módulo SAP."""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, Preformatted,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "Ayudas" / "plan-integracion-sap.pdf"

# ── Colores ─────────────────────────────────────────────────────────
EMERALD = colors.HexColor("#10b981")
INDIGO = colors.HexColor("#4f46e5")
AMBER = colors.HexColor("#f59e0b")
ROSE = colors.HexColor("#f43f5e")
SLATE_900 = colors.HexColor("#0f172a")
SLATE_700 = colors.HexColor("#334155")
SLATE_500 = colors.HexColor("#64748b")
SLATE_100 = colors.HexColor("#f1f5f9")
SLATE_50 = colors.HexColor("#f8fafc")
GREEN_50 = colors.HexColor("#ecfdf5")
AMBER_50 = colors.HexColor("#fffbeb")
ROSE_50 = colors.HexColor("#fff1f2")
CODE_BG = colors.HexColor("#1e293b")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=22, leading=28,
                    textColor=SLATE_900, spaceAfter=10, alignment=TA_LEFT)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=15, leading=20,
                    textColor=INDIGO, spaceAfter=8, spaceBefore=14, alignment=TA_LEFT)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontSize=11, leading=15,
                    textColor=SLATE_700, spaceAfter=4, spaceBefore=8, alignment=TA_LEFT)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10, leading=14,
                      textColor=SLATE_900, spaceAfter=5, alignment=TA_JUSTIFY)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=4, spaceAfter=2)
SMALL = ParagraphStyle("Small", parent=BODY, fontSize=8, leading=11, textColor=SLATE_500)
NOTE = ParagraphStyle("Note", parent=BODY, fontSize=9, leading=12,
                      textColor=SLATE_700, backColor=SLATE_50,
                      leftIndent=8, spaceBefore=6, spaceAfter=6,
                      borderColor=AMBER, borderWidth=0)
CODE = ParagraphStyle("Code", parent=BODY, fontName="Courier",
                      fontSize=8.5, leading=11,
                      textColor=colors.HexColor("#e2e8f0"),
                      backColor=CODE_BG, leftIndent=6, rightIndent=6,
                      spaceBefore=4, spaceAfter=6,
                      borderColor=SLATE_700, borderWidth=0)

doc = SimpleDocTemplate(
    str(OUT), pagesize=A4,
    leftMargin=1.8 * cm, rightMargin=1.8 * cm,
    topMargin=1.6 * cm, bottomMargin=1.6 * cm,
    title="Plan Módulo Integración SAP — MagEAM",
    author="David Cabezas (VSC)",
)

S = []

# ── Header ──────────────────────────────────────────────────────────
S.append(Paragraph("Plan Módulo <b>Integración SAP</b>", H1))
S.append(Paragraph(
    "MagEAM ↔ S/4HANA · Análisis técnico y plan de construcción · "
    "David Cabezas (VSC) · 2026-05-14",
    ParagraphStyle("subtitle", parent=BODY, fontSize=10,
                   textColor=SLATE_500, spaceAfter=10),
))
S.append(HRFlowable(width="100%", color=EMERALD, thickness=2,
                    spaceBefore=2, spaceAfter=10))

# ── Contexto ────────────────────────────────────────────────────────
S.append(Paragraph("Contexto", H2))
S.append(Paragraph(
    "En la reunión del 2026-05-13 con el cliente (Bruno Soto, Reynaldo "
    "Martínez), la principal barrera técnica identificada fue la "
    "<b>integración bidireccional con SAP</b>, especialmente la "
    "<b>escritura de datos</b>. El cliente migrará a S/4HANA fin de año "
    "o el próximo. La gestión SAP es centralizada (hoy en Perú, pronto "
    "global) con políticas estrictas de ciberseguridad.",
    BODY,
))
S.append(Paragraph(
    "Este documento analiza el código SAP ya presente en MagEAM "
    "(~1.700 líneas escritas), identifica el TODO crítico que falta, "
    "y propone un plan incremental en 7 etapas para tener un módulo "
    "funcional listo para el piloto en Azure del cliente.",
    BODY,
))

# ── Lo que ya tenemos ───────────────────────────────────────────────
S.append(Paragraph("1 · Lo que YA está construido (no se toca, se completa)", H2))
S.append(Paragraph(
    "Inventario del código SAP existente en el repo AMS-Production. La "
    "base es sólida; falta principalmente el <b>transporte real</b> de "
    "los payloads outbound.",
    BODY,
))

inv = Table([
    ["Componente", "LOC", "Estado", "Función"],
    ["sap_rfc_connector.py", "1.041", "🟡 Esqueleto + dry-run",
     "Connector pyrfc BAPI/RFC clásicos"],
    ["sap_sync_service.py", "136", "🟡 build_payload OK · transporte TODO",
     "Cola idempotente PENDING/SENT/ACKED"],
    ["routers/sap_pm.py", "117", "🟢 Funcional",
     "Endpoints LECTURA: plans, BOM, measuring, permits, cost centers"],
    ["routers/sap.py", "78", "🟢 Funcional",
     "Upload packages + state machine"],
    ["agentic_sap_sync_service.py", "235", "🟡 Esqueleto",
     "Sync agentic"],
    ["sap_service.py", "82", "🟢 Mock reader",
     "Lee mocks IE03/IW38/IP10/MM60/IL03"],
    ["sap_mock/data/*.json", "—", "🟢 JSON realista",
     "equipment_master, FL, BOM, work_orders, plans"],
    ["frontend: SapPmPage / SAPReview", "—", "🟢 UI funcional",
     "Páginas de revisión SAP"],
], colWidths=[4 * cm, 1.4 * cm, 4 * cm, 7 * cm])
inv.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), SLATE_900),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 8),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SLATE_50]),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 3),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
]))
S.append(inv)

S.append(Spacer(1, 8))
S.append(Paragraph(
    "<b>Modelos DB ya creados</b>: SapSyncLogModel (cola outbound), "
    "SAPUploadPackageModel (paquetes), MaintenancePlanModel, BOMItemModel, "
    "MeasuringPointModel, WorkPermitModel, CostCenterModel. La data y la "
    "estructura está. Lo que falta es el <b>transporte que efectivamente "
    "llame a SAP</b>.",
    NOTE,
))

# ── El TODO crítico ────────────────────────────────────────────────
S.append(Paragraph("2 · El TODO crítico — corazón del problema", H2))
S.append(Paragraph(
    "En <i>api/services/sap_sync_service.py</i> línea 132, el código actual "
    "tiene este comentario:",
    BODY,
))
S.append(Preformatted(
    "# def _transport_send(payload: dict) -> tuple[bool, str|None, str|None]:\n"
    "#     \"\"\"Actually call SAP. Return (ok, sap_ref, error_message).\"\"\"\n"
    "#     raise NotImplementedError(\n"
    "#         \"Plug the real SAP transport here (RFC / IDoc / REST).\"\n"
    "#     )",
    CODE,
))
S.append(Paragraph(
    "Hoy, los payloads se generan y se ponen en la cola "
    "<i>sap_sync_log</i> con status PENDING. <b>Nadie los procesa.</b> "
    "Resolver ese transporte = módulo SAP funcional.",
    BODY,
))

# ── Plan en 7 etapas ────────────────────────────────────────────────
S.append(PageBreak())
S.append(Paragraph("3 · Plan de construcción en 7 etapas", H2))

etapas = [
    ("Etapa 1 · Strategy Pattern para transporte intercambiable",
     "3-4 días", EMERALD,
     "Crear interfaz abstracta SAPTransport con 4 implementaciones bajo "
     "<i>api/services/sap_transports/</i>: dry_run (default), rfc (BAPI "
     "vía pyrfc, reusa código existente), odata (REST S/4HANA NUEVO), "
     "agent_ui (Playwright sobre SAP GUI NUEVO, Plan B mencionado por José). "
     "El selector lee <i>SAP_TRANSPORT</i> de env. En QA/dev no se toca SAP "
     "real; en piloto se cambia una env var."),

    ("Etapa 2 · Mock-SAP en Docker",
     "2 días", EMERALD,
     "Convertir <i>sap_mock/</i> en un servicio Docker <i>ocp-sap-mock</i> "
     "con FastAPI que expone endpoints OData realistas: "
     "<i>API_MAINTNOTIFICATION</i>, <i>API_MAINTORDER</i>, "
     "<i>API_EQUIPMENT</i>. Permite desarrollar el conector sin SAP "
     "real. Cuando lleguen credenciales del cliente, se cambia una env "
     "var y listo."),

    ("Etapa 3 · Worker que procesa la cola",
     "2 días", EMERALD,
     "Worker async en <i>api/workers/sap_worker.py</i> que cada N "
     "segundos lee PENDING, llama _transport_send(), marca SENT/ERROR. "
     "Retry exponencial con back-off, dead letter después de 3 fallos. "
     "Endpoint admin <i>/api/v1/sap/queue</i> para ver estado en vivo."),

    ("Etapa 4 · Conector OData S/4HANA",
     "5-7 días", INDIGO,
     "Implementación nueva en <i>sap_transports/odata.py</i>. Auth OAuth 2.0 "
     "o Basic + CSRF token. CRUD para Notification, Order, Operation, "
     "Component, Confirmation. Soporte de $batch para enviar OT + "
     "operaciones + materiales en una sola llamada. Validación contra "
     "mock antes de pegarle al SAP cliente."),

    ("Etapa 5 · Agente UI (Plan B José)",
     "7-10 días", AMBER,
     "Solo si Plan A (OData) es bloqueado por IT/Seguridad del cliente. "
     "Container con Playwright + SAP GUI for HTML/Fiori. Cuenta de "
     "servicio con privilegios mínimos. Scripts para IE01 (crear equipo), "
     "IW21 (crear aviso), IW31 (crear OT). Más lento pero funciona "
     "aunque la API esté bloqueada."),

    ("Etapa 6 · Tests de contrato",
     "3 días", INDIGO,
     "Schemathesis sobre mock OData → garantiza que el conector cumple "
     "el contrato OpenAPI declarado. Pact contracts (ticket SF-707) → "
     "consumidor (MagEAM) vs proveedor (SAP). Snapshot tests del payload "
     "BAPI generado."),

    ("Etapa 7 · UI de monitoreo SAP Sync",
     "3 días", INDIGO,
     "Nueva página <i>/sap-sync</i>: cola en tiempo real "
     "(PENDING/SENT/ERROR), logs por intento, reintento manual, switch "
     "de transporte (admin only), métricas (tasa éxito, latencia media, "
     "errores por tipo)."),
]

for nombre, duracion, color, descripcion in etapas:
    block = []
    t = Table([
        [Paragraph(f"<b>{nombre}</b>", ParagraphStyle(
            "et", parent=BODY, fontSize=11, textColor=colors.white)),
         Paragraph(f"<b>{duracion}</b>", ParagraphStyle(
            "etd", parent=BODY, fontSize=10, textColor=colors.white,
            alignment=2))],
    ], colWidths=[12 * cm, 4.4 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    S.append(t)
    S.append(Paragraph(descripcion, BODY))
    S.append(Spacer(1, 6))

# ── Timeline + costo ────────────────────────────────────────────────
S.append(PageBreak())
S.append(Paragraph("4 · Timeline y costo total", H2))

tl = Table([
    ["Bloque", "Etapas", "Duración", "Resultado"],
    ["MVP demo-able", "1 + 2 + 3", "8-10 días",
     "Módulo funcional con Mock-SAP. Demo de integración para cliente sin necesitar acceso a su SAP."],
    ["Conector real", "4", "5-7 días",
     "Cliente acepta API OData → integración productiva contra S/4HANA cliente."],
    ["Fallback IT-bloqueado", "5", "7-10 días (sólo si aplica)",
     "Si IT del cliente bloquea API, agente UI Playwright sobre SAP GUI."],
    ["Calidad + Operación", "6 + 7", "6 días",
     "Tests de contrato (cierra ticket SF-707) + UI de monitoreo en vivo."],
    ["TOTAL", "1-7", "25-30 días", "Módulo SAP completo, productivo, monitoreable."],
], colWidths=[3.5 * cm, 2 * cm, 3 * cm, 8 * cm])
tl.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), SLATE_900),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("BACKGROUND", (0, -1), (-1, -1), GREEN_50),
    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, SLATE_50]),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
S.append(tl)

S.append(Spacer(1, 8))
S.append(Paragraph(
    "El <b>MVP (etapas 1-3, 8-10 días)</b> ya es vendible: tenés Mock-SAP "
    "funcionando para mostrar al cliente que la integración es real, "
    "ANTES de tener acceso a su sistema SAP. Las etapas 4-7 son para el "
    "piloto productivo en Azure del cliente.",
    NOTE,
))

# ── Ideas diferenciadoras ───────────────────────────────────────────
S.append(Paragraph("5 · Ideas para diferenciar y acelerar", H2))

ideas = [
    ("Replicar contratos SAP en TypeScript",
     "El frontend conoce la forma exacta del payload y valida antes de enviar — menos round-trips al backend."),
    ("Modo \"shadow\" de auditoría",
     "Cada operación se envía a SAP y se loguea en MagEAM con el diff → trazabilidad total de qué entró efectivamente al SAP del cliente."),
    ("Dashboard de cobertura SAP por cliente",
     "Pantalla que muestra qué módulos SAP están conectados, qué BAPIs usados, % cobertura. Útil para vender el avance al cliente."),
    ("Plantillas por cliente",
     "Cada cliente tiene su <i>sap_config.yaml</i> con mapping de campos (porque cada SAP es ligeramente distinto). Onboarding rápido a clientes nuevos."),
    ("Visor de IDocs inbound",
     "SAP puede empujar IDocs a MagEAM (status, confirmaciones de OT cerrada). Armar webhook inbound = visión completa bidireccional."),
    ("Métricas comerciales integradas",
     "Cuántas OTs sincronizadas, cuánto tiempo ahorrado vs entrada manual a SAP. Datos crudos para argumentar ROI al cliente."),
]
for titulo, desc in ideas:
    S.append(Paragraph(f"<b>• {titulo}</b>", BODY))
    S.append(Paragraph(f"   {desc}", ParagraphStyle(
        "idea", parent=BODY, leftIndent=14, spaceAfter=4)))

# ── Recomendación ───────────────────────────────────────────────────
S.append(Spacer(1, 8))
S.append(Paragraph("6 · Recomendación de arranque", H2))
S.append(Paragraph(
    "<b>Esta semana: Etapas 1 + 2 + 3 (MVP de 8-10 días).</b>",
    BODY,
))
S.append(Paragraph(
    "Al finalizar esa semana y media:",
    BODY,
))
for txt in [
    "Tenemos un módulo SAP <b>funcionando end-to-end</b> contra Mock-SAP.",
    "Podemos mostrar al cliente que <b>la integración no es vaporware</b>.",
    "El equipo de IT del cliente puede inspeccionar el código y los contratos OData ANTES de discutir accesos.",
    "Reduce el riesgo del workshop con Andrea/Jorge Alquinta: vamos con la demo lista, no con promesas.",
    "Las etapas 4-7 quedan para arrancar después del workshop, con el alcance real del piloto ya definido.",
]:
    S.append(Paragraph(f"• {txt}", BULLET))

S.append(Spacer(1, 6))
S.append(Paragraph(
    "<b>Riesgo si no arrancamos esta semana:</b> el cliente espera "
    "avances tangibles después del workshop. Si llegamos sin código "
    "nuevo de SAP, perdemos el momentum de la reunión del 13/05.",
    NOTE,
))

# ── Footer ──────────────────────────────────────────────────────────
S.append(Spacer(1, 12))
S.append(HRFlowable(width="100%", color=SLATE_500, thickness=0.5))
S.append(Paragraph(
    "Plan preparado por David Cabezas (VSC) · "
    "valuestrategyconsulting.com · 2026-05-14",
    SMALL,
))

doc.build(S)
print(f"OK · PDF generado en {OUT}")
print(f"   {OUT.stat().st_size / 1024:.1f} KB")
