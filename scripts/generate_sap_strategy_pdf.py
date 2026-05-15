"""Genera PDF con la estrategia SAP de MAGEAM/VSC.

Usa reportlab (puro Python, sin libs sistema).
Run: python scripts/generate_sap_strategy_pdf.py
Output: docs/MAGEAM_SAP_Strategy_2026-05-15.pdf
"""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUT = Path("docs/MAGEAM_SAP_Strategy_2026-05-15.pdf")

# Colors
GREEN = colors.HexColor("#16a34a")
DARK = colors.HexColor("#0f172a")
SLATE = colors.HexColor("#475569")
LIGHT_BG = colors.HexColor("#f1f5f9")
ALT_BG = colors.HexColor("#f8fafc")
CALLOUT_BG = colors.HexColor("#fef3c7")
OK = colors.HexColor("#16a34a")
WARN = colors.HexColor("#d97706")
BAD = colors.HexColor("#dc2626")


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=1.8*cm, rightMargin=1.8*cm,
        topMargin=2*cm, bottomMargin=2.2*cm,
        title="MAGEAM — Estrategia SAP",
        author="VSC · David Cabezas",
    )

    styles = getSampleStyleSheet()
    H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=28, textColor=DARK,
                       leading=34, alignment=TA_CENTER, spaceAfter=4, fontName="Helvetica-Bold")
    SUB = ParagraphStyle("SUB", parent=styles["Heading2"], fontSize=18, textColor=SLATE,
                        alignment=TA_CENTER, spaceAfter=24, fontName="Helvetica")
    BRAND = ParagraphStyle("BRAND", fontSize=13, textColor=GREEN, alignment=TA_CENTER,
                          fontName="Helvetica-Bold", spaceAfter=80, leading=16)
    META = ParagraphStyle("META", fontSize=11, textColor=SLATE, alignment=TA_CENTER,
                         leading=18, spaceAfter=4)
    H2 = ParagraphStyle("H2", fontSize=16, textColor=GREEN, fontName="Helvetica-Bold",
                       leading=20, spaceBefore=14, spaceAfter=8,
                       borderPadding=(0, 0, 4, 0), borderWidth=0,
                       borderColor=GREEN)
    H3 = ParagraphStyle("H3", fontSize=12, textColor=DARK, fontName="Helvetica-Bold",
                       leading=16, spaceBefore=10, spaceAfter=4)
    BODY = ParagraphStyle("BODY", fontSize=10.5, textColor=DARK, leading=15,
                         spaceAfter=6, alignment=TA_LEFT)
    LI = ParagraphStyle("LI", parent=BODY, leftIndent=14, bulletIndent=4)
    CALLOUT = ParagraphStyle("CALLOUT", fontSize=10.5, textColor=DARK, leading=15,
                            backColor=CALLOUT_BG, borderPadding=10,
                            borderColor=WARN, borderWidth=0,
                            leftIndent=8, rightIndent=8, spaceBefore=8, spaceAfter=10)
    CODE_STYLE = ParagraphStyle("CODE", fontName="Courier", fontSize=9, textColor=colors.HexColor("#4ade80"),
                          backColor=colors.HexColor("#0f172a"), leading=12,
                          leftIndent=8, rightIndent=8, spaceBefore=6, spaceAfter=10,
                          borderPadding=8)
    FOOT = ParagraphStyle("FOOT", fontSize=8.5, textColor=colors.HexColor("#94a3b8"),
                         alignment=TA_CENTER, spaceBefore=24)

    story = []

    # ── COVER ──
    story.append(Spacer(1, 4*cm))
    story.append(Paragraph("VSC · VALUE STRATEGY CONSULTING", BRAND))
    story.append(Paragraph("Estrategia de Integración SAP", H1))
    story.append(Paragraph("MAGEAM / AMS", SUB))
    story.append(Spacer(1, 1.5*cm))
    story.append(Paragraph("<b>Cliente piloto:</b> Gold Fields — Salares Norte", META))
    story.append(Paragraph("<b>Fecha:</b> 2026-05-15", META))
    story.append(Paragraph("<b>Owner:</b> David Cabezas", META))
    story.append(Paragraph("<b>Status:</b> Pre-0 (scaffold deployado, sin SAP real conectado)", META))
    story.append(PageBreak())

    # ── 1. RESUMEN ──
    story.append(Paragraph("1 · Resumen ejecutivo", H2))
    story.append(Paragraph(
        "MAGEAM se posiciona como alternativa moderna a <b>Prometheus</b> en gestión de mantenimiento "
        "integrada con SAP S/4HANA y SAP ECC. La estrategia se divide en dos tracks paralelos:", BODY))
    story.append(Paragraph(
        "• <b>Track A — Cliente-facing (Goldfields):</b> Stack ligero OData + BTP + Cloud Connector. "
        "<i>Lo que vendemos hoy.</i>", LI))
    story.append(Paragraph(
        "• <b>Track B — Prometheus-grade (moat):</b> ABAP Developer Edition local + PyRFC + futuro "
        "add-on ABAP. <i>Diferenciador a 12 meses.</i>", LI))
    story.append(Paragraph(
        "La diferencia comercial clave: Prometheus tiene un <b>add-on ABAP instalado dentro del SAP "
        "del cliente</b> con 27 años de IP acumulada. Replicarlo requiere $50k+ y 6-12 meses de dev "
        "ABAP. Sin embargo, <b>~80% del valor visible para el usuario final</b> (UX, IA, "
        "planificación, captura de fallas) no depende del moat ABAP.", BODY))

    # ── 2. COMPARATIVA ──
    story.append(Paragraph("2 · Comparativa honesta con Prometheus", H2))
    data2 = [
        ["Capa", "Prometheus", "MAGEAM hoy", "Gap"],
        ["UX maintenance suite", "20 años madurez", "Cubre flujos + IA nativa", "70% paridad"],
        ["Captura móvil/voz/QR", "App industrial", "PWA + voice + photo AI", "60% paridad"],
        ["Mock SAP / seed data", "N/A", "UI con 2961 maint plans seed", "100% (ficción)"],
        ["OData S/4 connector", "Maxavera certificado", "APIKey + OAuth2, sin BTP", "10%"],
        ["PyRFC / BAPI on-prem", "Producto core", "Stub SAP_AVAILABLE=False", "5%"],
        ["Add-on ABAP en cliente", "Moat real (1998+)", "NO existe", "0%"],
        ["Certificación SAP (ICC)", "SAP Certified", "NO", "0%"],
        ["Clientes SAP integrados", "Cientos", "0", "0%"],
    ]
    tbl2 = Table(data2, colWidths=[3.8*cm, 4.2*cm, 5.0*cm, 3.4*cm])
    tbl2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), DARK),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ALT_BG]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        # Color gap column
        ("TEXTCOLOR", (3, 1), (3, 3), OK),
        ("TEXTCOLOR", (3, 4), (3, 5), WARN),
        ("TEXTCOLOR", (3, 6), (3, 9), BAD),
        ("FONTNAME", (3, 1), (3, -1), "Helvetica-Bold"),
    ]))
    story.append(tbl2)
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Para <b>paridad funcional sin moat ABAP</b>: ~12 meses + ~$10k/año post-certificación. "
        "Para <b>moat tipo Prometheus</b>: +$50k + 6-12 meses dev ABAP.", CALLOUT))

    # ── 3. ESTADO PRE-0 ──
    story.append(Paragraph("3 · Estado actual — Fase Pre-0", H2))
    story.append(Paragraph("Lo deployado en producción <i>https://mageam.com</i>:", BODY))
    pre0_items = [
        "<b>Strategy Pattern transports</b>: dry_run (default) · mock (activo VPS) · odata · rfc",
        "<b>Mock SAP S/4 container</b> (ocp-sap-mock) corriendo VPS port 8032 con 5 equipos seed OData v4",
        "<b>OData transport</b> APIKey + OAuth2 client_credentials implementado en sap_transports/odata.py",
        "<b>PyRFC stub</b> en sap_rfc_connector.py con SAP_AVAILABLE=False (pyrfc no instalado)",
        "<b>UI SAP PM</b> con 2961 maint plans, BOM, Permits, Requisitions, Cost Centers, Inventory",
        "<b>FMECA → IW22 export</b> genera XLS compatible SAP",
        "<b>Tab \"SAP Connection\"</b> en /settings con panel read-only + healthcheck + sample + Test button",
        "<b>SAP Upload Package lifecycle</b> con integration tests (SF-700)",
    ]
    for item in pre0_items:
        story.append(Paragraph("• " + item, LI))
    story.append(Paragraph(
        "Endpoint verificación: <font face='Courier'>GET /api/v1/sap/transport/info</font> → "
        "<font face='Courier'>{name:\"mock\", healthy:true}</font>", BODY))

    story.append(PageBreak())

    # ── 4. TRACK A ──
    story.append(Paragraph("4 · Track A — Goldfields/VPS (lo vendible)", H2))
    story.append(Paragraph(
        "Stack ligero que corre 100% en backend Python contra SAP del cliente. "
        "<b>No requiere descargas pesadas.</b>", BODY))

    story.append(Paragraph("Stack comprometido con Goldfields", H3))
    stack_text = (
        "MAGEAM backend (FastAPI, VPS mageam.com)<br/>"
        "    &#8624; OData REST + OAuth2 client credentials<br/>"
        "        &#8624; SAP BTP Destination (Goldfields tenant)<br/>"
        "            &#8624; Cloud Connector (Goldfields data center)<br/>"
        "                &#8624; SAP QAS/PRD (Salares Norte)"
    )
    story.append(Paragraph(stack_text, CODE_STYLE))
    story.append(Paragraph(
        "<b>Goldfields acepta</b>: Cloud Connector + BTP destinations + named technical user + "
        "IP whitelist (patrón recomendado por SAP).<br/>"
        "<b>Goldfields rechaza</b>: REST directo a SAP, Selenium/Playwright sobre SAP GUI for HTML.", BODY))

    story.append(Paragraph("Roadmap Track A", H3))
    track_a = [
        ["#", "Hito", "Esfuerzo", "Estado"],
        ["A1", "Activar perfil with-sap-mock en compose VPS", "1 h", "Hecho"],
        ["A2", "Backend lee SAP_TRANSPORT=mock → UI SAP PM live", "2 h", "Hecho"],
        ["A3", "OAuth2 client_credentials en OData transport", "4 h", "Hecho"],
        ["A4", ".env.example.goldfields-sap con campos IT cliente", "1 h", "Hecho"],
        ["A5", "Sub-tab SAP Connection en /settings", "1 día", "Hecho"],
        ["A6", "Workshop Andrea + Jorge Alquinta → confirmar piloto", "—", "Programado"],
        ["A7", "Recibir credenciales BTP Goldfields", "—", "Bloqueado cliente"],
        ["A8", "Piloto contra QAS Goldfields (read-only)", "2-3 d", "Bloqueado A7"],
    ]
    tbl_a = Table(track_a, colWidths=[1*cm, 8.5*cm, 2.2*cm, 4.7*cm])
    tbl_a.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ALT_BG]),
        ("TEXTCOLOR", (3, 1), (3, 5), OK),
        ("TEXTCOLOR", (3, 6), (3, 6), WARN),
        ("TEXTCOLOR", (3, 7), (3, 8), BAD),
        ("FONTNAME", (3, 1), (3, -1), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(tbl_a)

    story.append(PageBreak())

    # ── 5. TRACK B ──
    story.append(Paragraph("5 · Track B — Prometheus-grade / Moat", H2))
    story.append(Paragraph(
        "Esto NO toca la VPS — corre en PC del desarrollador. Pesado pero diferencia real.", BODY))
    track_b = [
        ["#", "Hito", "Esfuerzo", "Costo", "Estado"],
        ["B0", "Docker pull sapse/abap-platform-trial (~30 GB)", "descarga", "$0", "Parqueado"],
        ["B1", "Instalar SAP NW RFC SDK + pip install pyrfc", "2 h", "$0", "—"],
        ["B2", "Configurar SAP_TRANSPORT=rfc contra Dev Edition", "4 h", "$0", "—"],
        ["B3", "Probar BAPIs ALM_ORDER, EQUI, ALM_NOTIF", "2-3 d", "$0", "—"],
        ["B4", "Demo: aviso Z1 desde MAGEAM → SAP GUI", "1 día", "$0", "—"],
        ["B5", "BTP Trial + Cloud Connector", "1 sem", "$0", "—"],
        ["B6", "ICC Certification (SAP Certified)", "6-12 m", "$3.5k + $1k/año", "—"],
        ["B7", "PartnerEdge Open Ecosystem", "papeleo", "$2k/año", "—"],
        ["B8", "Add-on ABAP propio + namespace (moat)", "6-12 m", "$50k+", "—"],
    ]
    tbl_b = Table(track_b, colWidths=[1*cm, 6.8*cm, 1.8*cm, 3.3*cm, 3.5*cm])
    tbl_b.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ALT_BG]),
        ("TEXTCOLOR", (4, 1), (4, 1), WARN),
        ("FONTNAME", (4, 1), (4, 1), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(tbl_b)

    # ── 6. COSTOS ──
    story.append(Paragraph("6 · Costos totales escenario \"Prometheus-like\"", H2))
    costs = [
        ["Línea", "Costo año 1", "Recurrente"],
        ["PartnerEdge Open Ecosystem", "$2,000", "$2,000/año"],
        ["SAP Certified Integration (ICC)", "$3,500", "$1,000/año"],
        ["SAP Endorsed App (opcional, invitation)", "—", "premium fees"],
        ["Add-on ABAP propio (Fase 4, moat)", "~$50,000", "$10k+/año"],
        ["TOTAL paridad sin moat", "$5,500", "$3,000/año"],
        ["TOTAL con moat ABAP", "$55,500", "$13,000/año"],
    ]
    tbl_costs = Table(costs, colWidths=[8.5*cm, 4*cm, 3.9*cm])
    tbl_costs.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ALT_BG]),
        ("BACKGROUND", (0, -2), (-1, -1), colors.HexColor("#e0f2fe")),
        ("FONTNAME", (0, -2), (-1, -1), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tbl_costs)

    # ── 7. DIFERENCIADORES ──
    story.append(Paragraph("7 · Diferenciadores MAGEAM sobre Prometheus", H2))
    story.append(Paragraph(
        "Aunque sin moat ABAP, MAGEAM tiene ventajas naturales que Prometheus no:", BODY))
    diffs = [
        "<b>IA nativa</b>: Claude integrado para captura fallas, clasificación, recomendaciones, análisis fotos. Prometheus es pre-IA.",
        "<b>PWA mobile</b>: app web responsive con voz/foto/QR sin Play Store. Prometheus requiere app nativa.",
        "<b>Multi-tenant cloud-native</b>: monorepo containerizado (Docker + FastAPI + React) listo para escalar.",
        "<b>Open architecture</b>: Strategy Pattern permite intercambiar transports sin recompilar.",
        "<b>Costo entrada cliente</b>: 5-10× más barato que Prometheus enterprise.",
    ]
    for i, d in enumerate(diffs, 1):
        story.append(Paragraph(f"{i}. {d}", LI))

    # ── 8. PRÓXIMOS PASOS ──
    story.append(Paragraph("8 · Próximos pasos concretos", H2))
    next_steps = [
        "<b>Workshop Andrea + Jorge Alquinta</b> (Goldfields IT) — confirmar piloto, definir alcance, recibir credenciales BTP.",
        "<b>Enchufar credenciales OData reales</b> en .env VPS cuando lleguen → cambiar SAP_TRANSPORT=odata.",
        "<b>Smoke tests piloto</b> contra QAS Goldfields (read-only primero, write después).",
        "<b>Decisión Track B</b>: bajar ABAP Dev Edition (30 GB) cuando se priorice diferenciación técnica.",
        "<b>Si Goldfields paga piloto</b>: considerar Fase 4 ABAP add-on como inversión a 12 meses ($50k).",
    ]
    for i, n in enumerate(next_steps, 1):
        story.append(Paragraph(f"{i}. {n}", LI))

    # ── 9. REFERENCIAS ──
    story.append(Paragraph("9 · Referencias", H2))
    refs = [
        "Prometheus ERP-SAP — prometheusgroup.com/erp-sap",
        "Maxavera Connector SAP Certified — prometheusgroup.com/.../maxavera-connector",
        "SAP Integration Certification Program 2026 — news.sap.com/2026/01/...",
        "ABAP Platform Trial Docker — github.com/SAP-docs/abap-platform-trial-image",
        "Docs internas: docs/SAP_INTEGRATION_ROADMAP.md, docs/env-template-goldfields-sap.md",
    ]
    for r in refs:
        story.append(Paragraph("• " + r, LI))

    story.append(Paragraph(
        "Documento generado automáticamente · MAGEAM/AMS-Production · 2026-05-15 · "
        "david.cabezas@valuestrategyconsulting.com", FOOT))

    doc.build(story)
    print(f"PDF generado: {OUT.resolve()}")
    return OUT


if __name__ == "__main__":
    build()
