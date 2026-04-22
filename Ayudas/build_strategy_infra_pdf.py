"""Generate a polished executive PDF combining China arbitrage + infra sizing."""
from __future__ import annotations
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "MAGEAM_Strategy_and_Infra.pdf"

EMERALD = HexColor("#059669")
EMERALD_DARK = HexColor("#047857")
SLATE = HexColor("#1e293b")
SLATE_LIGHT = HexColor("#64748b")
AMBER = HexColor("#d97706")
ROSE = HexColor("#e11d48")
INDIGO = HexColor("#4f46e5")
BG_LIGHT = HexColor("#f8fafc")
BG_EMERALD = HexColor("#ecfdf5")
BG_AMBER = HexColor("#fffbeb")
BG_ROSE = HexColor("#fff1f2")
BG_INDIGO = HexColor("#eef2ff")
BORDER = HexColor("#e2e8f0")


def make_styles():
    base = getSampleStyleSheet()
    return {
        "H1": ParagraphStyle("H1", parent=base["Heading1"], fontName="Helvetica-Bold",
                             fontSize=22, textColor=SLATE, spaceAfter=2, leading=26),
        "H1Sub": ParagraphStyle("H1Sub", parent=base["Normal"], fontName="Helvetica",
                                fontSize=11, textColor=SLATE_LIGHT, spaceAfter=14, leading=14),
        "PartTitle": ParagraphStyle("PartTitle", parent=base["Heading1"], fontName="Helvetica-Bold",
                                    fontSize=18, textColor=EMERALD_DARK, spaceBefore=20, spaceAfter=8, leading=22),
        "H2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Helvetica-Bold",
                             fontSize=14, textColor=EMERALD_DARK, spaceBefore=14, spaceAfter=6, leading=17),
        "H3": ParagraphStyle("H3", parent=base["Heading3"], fontName="Helvetica-Bold",
                             fontSize=12, textColor=SLATE, spaceBefore=10, spaceAfter=4, leading=15),
        "H4": ParagraphStyle("H4", parent=base["Heading4"], fontName="Helvetica-Bold",
                             fontSize=10.5, textColor=SLATE, spaceBefore=6, spaceAfter=2, leading=13),
        "Body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica",
                               fontSize=10, textColor=SLATE, leading=14, alignment=TA_JUSTIFY, spaceAfter=5),
        "BodyLeft": ParagraphStyle("BodyLeft", parent=base["BodyText"], fontName="Helvetica",
                                   fontSize=10, textColor=SLATE, leading=14, alignment=TA_LEFT, spaceAfter=5),
        "BodyBold": ParagraphStyle("BodyBold", parent=base["BodyText"], fontName="Helvetica-Bold",
                                   fontSize=10, textColor=SLATE, leading=14, alignment=TA_LEFT, spaceAfter=5),
        "TLDR": ParagraphStyle("TLDR", parent=base["BodyText"], fontName="Helvetica",
                               fontSize=10.5, textColor=SLATE, leading=15, alignment=TA_LEFT, spaceAfter=5,
                               leftIndent=8, rightIndent=8),
        "Meta": ParagraphStyle("Meta", parent=base["Normal"], fontName="Helvetica",
                               fontSize=9, textColor=SLATE_LIGHT, spaceAfter=2),
        "Bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName="Helvetica",
                                 fontSize=10, textColor=SLATE, leading=14, spaceAfter=3,
                                 leftIndent=12, bulletIndent=2),
        "Footer": ParagraphStyle("Footer", parent=base["Normal"], fontName="Helvetica-Oblique",
                                 fontSize=8, textColor=SLATE_LIGHT, alignment=TA_CENTER),
        "TableCell": ParagraphStyle("TableCell", parent=base["BodyText"], fontName="Helvetica",
                                    fontSize=8.5, textColor=SLATE, leading=11.5, alignment=TA_LEFT),
        "TableCellCenter": ParagraphStyle("TableCellCenter", parent=base["BodyText"], fontName="Helvetica",
                                          fontSize=8.5, textColor=SLATE, leading=11.5, alignment=TA_CENTER),
        "TableHead": ParagraphStyle("TableHead", parent=base["BodyText"], fontName="Helvetica-Bold",
                                    fontSize=9, textColor=white, leading=12, alignment=TA_LEFT),
        "TableHeadCenter": ParagraphStyle("TableHeadCenter", parent=base["BodyText"], fontName="Helvetica-Bold",
                                          fontSize=9, textColor=white, leading=12, alignment=TA_CENTER),
    }


def callout_box(html, bg, border_color, style, width_mm=170):
    tbl = Table([[Paragraph(html, style)]], colWidths=[width_mm * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border_color),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tbl


def build_story(S):
    story = []

    # ═══════════ COVER ═══════════
    story.append(Paragraph("MAGEAM · Estrategia y Dimensionamiento", S["H1"]))
    story.append(Paragraph("Arbitraje tecnológico China → LatAm + sizing de infraestructura por cliente real", S["H1Sub"]))

    meta = Table([[
        Paragraph("<b>Autor:</b> David Cabezas", S["Meta"]),
        Paragraph("<b>Fecha:</b> 2026-04-21", S["Meta"]),
        Paragraph("<b>Audiencia:</b> José · Gonzalo", S["Meta"]),
        Paragraph("<b>Estado:</b> Propuesta · requiere VB", S["Meta"]),
    ]], colWidths=[42 * mm, 30 * mm, 45 * mm, 53 * mm])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(meta)
    story.append(Spacer(1, 14))

    # TL;DR
    story.append(Paragraph("Resumen ejecutivo", S["H2"]))
    tldr = (
        "Propongo a MAGEAM adoptar <b>3 capacidades que hoy solo operan a escala en mining tech chino</b> "
        "(Baowu, Zijin, Sany, Shenhua) y que no hay competidor local ni regional ofreciendo: "
        "<b>rosters optimizados por ML</b>, <b>visión computacional en inspección de equipos</b> y "
        "<b>predictive maintenance nativo con IoT de vibraciones</b>.<br/><br/>"
        "Estas capacidades no salen de China por barreras regulatorias y geopolíticas, no por falta de madurez técnica. "
        "Podemos implementarlas en MAGEAM usando stack open source + modelos entrenables, con <b>inversión "
        "US$26-38k primer año</b> y <b>break-even al cerrar 1 cliente mediano o 3 pequeños</b>.<br/><br/>"
        "Este documento cubre: (I) mercado real chileno, (II) tecnología china explotable, "
        "(III) dimensionamiento de infraestructura con números por cliente tipo, "
        "(IV) comparativa con Fracttal / Infraspeak / Prometheus / SAP, (V) roadmap 12 meses."
    )
    story.append(callout_box(tldr, BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(PageBreak())

    # ═══════════ PARTE I ═══════════
    story.append(Paragraph("Parte I · Contexto de mercado", S["PartTitle"]))
    story.append(Paragraph("Tamaños reales de operaciones mineras chilenas", S["H2"]))
    story.append(Paragraph(
        "Para dimensionar realisticamente, usamos datos públicos de reportes de sustentabilidad y Consejo Minero 2024. "
        "Los tamaños varían 30x entre minas pequeñas y grandes.", S["Body"]))

    mines = [
        ["Operación", "Tipo", "Trabaj. total", "Mantto (app)", "Eq. críticos", "OTs/mes"],
        ["Goldfields Salares Norte", "Oro, mediana", "1,500", "150-250", "~100", "200-400"],
        ["Los Pelambres (AMSA)", "Cu, mediana-grande", "6,000", "600-900", "~500", "1,200-1,800"],
        ["Centinela (AMSA)", "Cu, mediana", "4,500", "450-700", "~400", "900-1,400"],
        ["Caserones", "Cu, mediana", "5,000", "500-800", "~400", "1,000-1,600"],
        ["BHP Escondida", "Cu, grande", "12,000-30,000", "1,500-4,000", "1,500", "3,500-5,000"],
        ["Codelco Chuquicamata", "Cu, grande", "15,000", "2,000-3,500", "1,800", "4,000-6,000"],
        ["Codelco El Teniente", "Cu, grande", "15,000", "2,000-3,500", "2,000", "4,500-6,500"],
        ["Codelco total (7 div.)", "Conglomerado", "~78,000", "~10,000", "~12,000", "~30,000"],
    ]
    mrows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(mines)]
    tm = Table(mrows, colWidths=[38 * mm, 28 * mm, 25 * mm, 25 * mm, 22 * mm, 25 * mm])
    tm.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tm)
    story.append(Paragraph(
        "<i>Fuentes: reportes de sustentabilidad 2024, SONAMI, Consejo Minero.</i>",
        S["Meta"]))
    story.append(Spacer(1, 10))

    # Usuarios
    story.append(Paragraph("Perfiles de usuario en la plataforma", S["H2"]))
    story.append(Paragraph(
        "No todos los mantenedores entran todos los días. Distribución típica en mina chilena:", S["Body"]))
    users = [
        ["Rol", "% total mantto", "Uso diario", "Horas/día"],
        ["Mantenedores de campo", "75%", "Mobile · reporta fallas", "15-30 min"],
        ["Supervisores", "12%", "Desktop + mobile · revisa OTs", "2-4 h"],
        ["Planificadores", "8%", "Desktop · planifica semana", "6-8 h"],
        ["Gerencia / Management", "3%", "Dashboard · analytics", "30 min"],
        ["Reliability / RCA", "2%", "Desktop · análisis profundo", "4-6 h"],
    ]
    urows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(users)]
    tu = Table(urows, colWidths=[55 * mm, 30 * mm, 55 * mm, 25 * mm])
    tu.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tu)
    story.append(Spacer(1, 6))
    story.append(callout_box(
        "<b>Concurrencia real:</b> 25-35% de los usuarios totales están simultáneos en pico (ej. mañana turno día). "
        "Una mina de 1,000 users registrados tiene 250-350 concurrentes.",
        BG_INDIGO, INDIGO, S["TLDR"]))

    story.append(PageBreak())

    # ═══════════ PARTE II ═══════════
    story.append(Paragraph("Parte II · Arbitraje tecnológico China → LatAm", S["PartTitle"]))
    story.append(Paragraph("Qué tiene China en producción real", S["H2"]))
    story.append(Paragraph(
        "China lidera mining tech en 7 áreas verificables con empresas específicas identificadas:",
        S["Body"]))

    china_items = [
        ("1. 5G privado underground + tele-operación",
         "Baowu Steel, Shenhua Coal: redes 5G en minas subterráneas desde 2022. Latencia &lt;20ms, streaming 4K de 20+ cámaras."),
        ("2. Flotas autónomas en coal mining",
         "Inner Mongolia / Shanxi: <b>500+ camiones autónomos 24/7 desde 2023</b>, supera Pilbara en volumen. Players: Waytous, TAGE I Drive."),
        ("3. AI ore sorting con visión computacional",
         "Zijin Mining clasifica grado de mineral pedazo por pedazo en la correa. Ahorro 40% en procesamiento."),
        ("4. IOC centralizados reales",
         "War rooms de 30 personas monitoreando 15 minas desde Beijing con decisiones en tiempo real. Codelco IROC y Rio Tinto Perth están 3 años atrás."),
        ("5. ML-optimized shift scheduling",
         "Rosters 7x7 / 14x14 optimizados por algoritmo considerando ley laboral, skills, fatiga, transporte. Nativo en DingTalk Mining."),
        ("6. Digital twin operacional continuo",
         "Modelo 3D vivo del yacimiento. Simulaciones contrafácticas en tiempo real que informan decisiones diarias."),
        ("7. IoT masivo de condición",
         "Sensores en cada motor crítico. Maintenance predictivo con +90% accuracy. Sany Heavy Cloud, Zoomlion Connect."),
    ]
    for t, b in china_items:
        story.append(Paragraph(t, S["H4"]))
        story.append(Paragraph(b, S["Body"]))

    story.append(Paragraph("Por qué no exportan", S["H2"]))

    barriers = [
        ["Tipo", "Barrera", "Detalle"],
        ["Dura", "Regulación de data", "Data Security Law 2021: data minera china no sale del país."],
        ["Dura", "IP / sovereignty", "Australia/US/Canadá bloquearon procurement SW chino post-2022 (efecto Huawei Ban)."],
        ["Dura", "Certificaciones", "No tienen ISO 27001, SOC 2, GDPR requeridas por Occidente."],
        ["Dura", "Ecosistema cerrado", "Integran Kingdee/YonYou, no SAP/Oracle. Rewrite 1-2 años."],
        ["Cosmética", "Idioma", "UI/docs/soporte solo en mandarín."],
        ["Cosmética", "Marketing global", "No van a PDAC, IMARC, conferences occidentales."],
        ["Cosmética", "Percepción precio", "Precio chino bajo = percibido como calidad baja en Occidente."],
        ["Cosmética", "Cultura guanxi", "Modelo B2B chino (relaciones 10+ años) no replicable."],
    ]
    brows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(barriers)]
    tb = Table(brows, colWidths=[22 * mm, 40 * mm, 108 * mm])
    tb.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ROSE),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, 4), [BG_ROSE, white]),
        ("ROWBACKGROUNDS", (0, 5), (-1, -1), [BG_AMBER, white]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tb)
    story.append(Spacer(1, 8))

    story.append(callout_box(
        "<b>Oportunidad:</b> estas barreras bloquean la exportación directa, <b>no la imitación del concepto</b>. "
        "Precedentes exitosos: <b>TikTok</b> (Douyin occidentalizado · US$200B), <b>SHEIN</b> (fast-fashion Shenzhen · US$60B), "
        "<b>Temu</b> (group-buy chino con UI gringa · US$30B+), <b>BYD/NIO</b> (EVs chinos con certificación CE).",
        BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(PageBreak())

    # ═══════════ PARTE III ═══════════
    story.append(Paragraph("Parte III · Dimensionamiento de infraestructura por cliente", S["PartTitle"]))
    story.append(Paragraph(
        "Tres escenarios basados en clientes reales de minería chilena, con número específico de usuarios, "
        "OTs, equipos y recursos de infraestructura necesarios.", S["Body"]))

    # === Escenario A ===
    story.append(Paragraph("Escenario A · Mina pequeña (Goldfields Salares Norte)", S["H2"]))
    perfil_a = (
        "<b>Perfil:</b> 200 usuarios registrados · 60-80 concurrentes pico · 300 OTs/mes · "
        "100 equipos críticos · 1,500 fotos/mes (15 GB/año) · sin IoT inicial."
    )
    story.append(Paragraph(perfil_a, S["Body"]))

    infra_a = [
        ["Recurso", "Cantidad", "Detalle"],
        ["vCPU", "4", "API + worker rosters ML"],
        ["RAM", "8 GB", "App + YOLO + buffer"],
        ["Disco servidor", "80 GB", "Docker + logs + PG local"],
        ["Object Storage (S3)", "50 GB", "Fotos WRs primer año"],
        ["PostgreSQL gestionado", "2 GB RAM / 20 GB", "DB principal"],
        ["Redis", "512 MB", "WebSocket pub/sub"],
        ["GPU", "Pay-per-use", "Entrenamiento mensual ~US$20"],
    ]
    arows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(infra_a)]
    ta = Table(arows, colWidths=[45 * mm, 40 * mm, 85 * mm])
    ta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INDIGO),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ta)
    story.append(Spacer(1, 4))
    story.append(callout_box(
        "<b>Costo mensual:</b> US$120-160 · <b>Upgrade trigger:</b> al pasar 150 concurrentes o 100 GB storage.",
        BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(PageBreak())

    # === Escenario B ===
    story.append(Paragraph("Escenario B · Mina mediana (Los Pelambres, Caserones, Centinela)", S["H2"]))
    perfil_b = (
        "<b>Perfil:</b> 800 usuarios registrados · 250-350 concurrentes pico · 1,500 OTs/mes · "
        "500 equipos críticos · <b>200 con sensores vibración</b> · 7,500 fotos/mes (100 GB/año) · "
        "<b>4M puntos IoT/día</b>."
    )
    story.append(Paragraph(perfil_b, S["Body"]))

    infra_b = [
        ["Recurso", "Cantidad", "Detalle"],
        ["vCPU", "8", "4 API + 2 workers ML + 2 visión"],
        ["RAM", "16 GB", "Expansión por TimescaleDB + workers"],
        ["Disco servidor", "160 GB", "Logs crecen con IoT"],
        ["Object Storage (S3)", "300 GB primer año", "Fotos + backups"],
        ["PostgreSQL + TimescaleDB", "8 GB RAM / 100 GB", "Con replica incluida"],
        ["Redis", "2 GB", "Broadcast multi-planta"],
        ["GPU dedicada", "T4 o L4", "Inference tiempo real visión + LSTM"],
    ]
    brows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(infra_b)]
    tb = Table(brows, colWidths=[45 * mm, 45 * mm, 80 * mm])
    tb.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INDIGO),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tb)
    story.append(Spacer(1, 4))
    story.append(callout_box(
        "<b>Costo mensual:</b> US$500-750 · <b>Upgrade trigger:</b> al pasar 3 minas en paralelo o 500 concurrentes.",
        BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(Spacer(1, 10))

    # === Escenario C ===
    story.append(Paragraph("Escenario C · Cliente multi-operación (AMSA completo, Codelco división, BHP)", S["H2"]))
    perfil_c = (
        "<b>Perfil:</b> 3,000-8,000 usuarios · 1,000-2,500 concurrentes pico · 10,000+ OTs/mes · "
        "2,000-5,000 equipos · 1,500+ sensores · 50,000+ fotos/mes (600 GB/año) · 30M+ puntos IoT/día."
    )
    story.append(Paragraph(perfil_c, S["Body"]))

    infra_c = [
        ["Recurso", "Cantidad", "Detalle"],
        ["Nodos K8s", "3-5 · 8 vCPU · 16 GB c/u", "API + workers distribuidos"],
        ["PostgreSQL cluster", "Primary + replica · 16 GB RAM", "Alta disponibilidad"],
        ["TimescaleDB dedicado", "8 GB RAM · 500 GB", "IoT masivo separado"],
        ["Kafka / event streaming", "Cluster 3 nodos", "Ingesta sensores"],
        ["Redis cluster", "8 GB", "Cache + WS + queue"],
        ["Object Storage + CDN", "1-2 TB", "Cross-region replication"],
        ["GPU dedicada", "1x T4 permanente + burst", "Inference + reentrenamientos"],
        ["Monitoring", "Grafana Cloud + Sentry + Loki", "Observabilidad enterprise"],
    ]
    crows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(infra_c)]
    tc = Table(crows, colWidths=[50 * mm, 55 * mm, 65 * mm])
    tc.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INDIGO),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tc)
    story.append(Spacer(1, 4))
    story.append(callout_box(
        "<b>Costo mensual:</b> US$2,000-3,500 · <b>Upgrade trigger:</b> implementación directa, no escala desde A/B.",
        BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(PageBreak())

    # ═══════════ PARTE IV ═══════════
    story.append(Paragraph("Parte IV · Comparativa consolidada", S["PartTitle"]))
    story.append(Paragraph("Matriz por escenario (números y economics)", S["H2"]))

    cmp_headers = ["Parámetro", "A · Pequeña", "B · Mediana", "C · Grande"]
    cmp_rows = [
        ["Cliente tipo", "Goldfields Salares Norte", "Los Pelambres, Caserones", "Escondida, AMSA, Codelco div"],
        ["Users totales", "200", "800", "3,000-8,000"],
        ["Concurrentes pico", "80", "350", "2,500"],
        ["OTs/mes", "300", "1,500", "10,000+"],
        ["Equipos críticos", "100", "500", "2,000-5,000"],
        ["IoT (sensores)", "No", "Sí (200 motores)", "Sí (1,500+ motores)"],
        ["vCPU", "4", "8", "24+ (cluster)"],
        ["RAM", "8 GB", "16 GB", "48+ GB (cluster)"],
        ["Disco servidor", "80 GB", "160 GB", "3 × 200 GB"],
        ["Storage S3/año", "50 GB", "300 GB", "1-2 TB"],
        ["PostgreSQL", "2 GB RAM", "8 GB RAM", "16 GB + replica"],
        ["GPU", "Pay-per-use", "T4 dedicada", "T4 + burst"],
        ["Costo US$/mes", "120-160", "500-750", "2,000-3,500"],
        ["ARR potencial", "US$36k", "US$240k", "US$1.2M"],
        ["Margen infra", "96%", "95%", "94%"],
    ]
    all_rows = [cmp_headers] + cmp_rows
    all_paragraphs = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCellCenter"]) for c in r]
                      for i, r in enumerate(all_rows)]
    tc = Table(all_paragraphs, colWidths=[45 * mm, 40 * mm, 45 * mm, 40 * mm])
    tc.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        # Highlight costo y ARR
        ("BACKGROUND", (0, 13), (-1, 13), BG_EMERALD),
        ("BACKGROUND", (0, 14), (-1, 14), BG_EMERALD),
        ("FONTNAME", (0, 13), (-1, 14), "Helvetica-Bold"),
    ]))
    story.append(tc)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Cálculo detallado de ARR por cliente", S["H3"]))
    arrs = [
        ["<b>Escenario A</b> · Salares Norte-like",
         "200 users × US$15/user/mes × 12 = <b>US$36,000/año</b>",
         "Infra: US$1,800/año · Margen: US$34,200/año"],
        ["<b>Escenario B</b> · Los Pelambres-like",
         "800 users × US$25/user/mes × 12 = <b>US$240,000/año</b>",
         "Infra: US$7,800/año · Margen: US$232,200/año"],
        ["<b>Escenario C</b> · Escondida/Codelco div-like",
         "5,000 users × US$20/user/mes × 12 = <b>US$1,200,000/año</b>",
         "Infra: US$33,000/año · Margen: US$1,167,000/año"],
    ]
    for a in arrs:
        story.append(Paragraph(a[0], S["H4"]))
        story.append(Paragraph(a[1], S["Body"]))
        story.append(Paragraph("<i>" + a[2] + "</i>", S["Meta"]))
        story.append(Spacer(1, 4))

    story.append(Paragraph(
        "<i>Referencia de precios: Fracttal US$15-30/user/mes · Infraspeak US$25-40 · "
        "Prometheus GWOS US$30-60 · SAP PM US$200+.</i>", S["Meta"]))

    story.append(PageBreak())

    # Competencia
    story.append(Paragraph("Comparativa vs competidores", S["H2"]))
    comp = [
        ["Competidor", "Stack", "Mejoras China integradas", "US$/user/mes"],
        ["Fracttal", "AWS · Postgres · React", "Ninguna (heurística básica)", "15-25"],
        ["Infraspeak", "Azure · Postgres · Vue", "Rosters básicos, no ML real", "25-40"],
        ["Prometheus GWOS", "AWS · Oracle · Angular", "CMMS clásico, cero ML", "30-60"],
        ["Cromateus", "On-prem · SQL Server", "Enterprise tradicional", "60+"],
        ["Maximo (IBM)", "On-prem/SaaS · DB2", "Watson opcional (caro)", "100+"],
        ["SAP PM", "SAP cloud · HANA", "Joule AI (early access)", "200+"],
        ["MAGEAM (propuesto)", "Hetzner/DO · Postgres+Timescale · React", "<b>Rosters ML + Visión + Predictive</b>", "<b>25-50 target</b>"],
    ]
    crows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(comp)]
    tc2 = Table(crows, colWidths=[38 * mm, 55 * mm, 50 * mm, 27 * mm])
    tc2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, 6), [white, BG_LIGHT]),
        ("BACKGROUND", (0, 7), (-1, 7), BG_EMERALD),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tc2)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Diferenciadores únicos de MAGEAM en LatAm", S["H3"]))
    diffs = [
        "<b>1. Rosters ML real</b> (OR-Tools optimization, no heurística) — nadie más en LatAm",
        "<b>2. Visión computacional integrada al WR</b> — nadie más en el segmento medio",
        "<b>3. Predictive maintenance nativo con IoT</b> — único en rango &lt; US$50/user/mes",
        "<b>4. Audit log + firma digital en cierre</b> — ya implementado, supera a Fracttal/Infraspeak",
        "<b>5. Real-time WebSocket + optimistic lock</b> — ya implementado, nivel SaaS moderno (Linear-like)",
    ]
    for d in diffs:
        story.append(Paragraph("• " + d, S["Bullet"]))

    story.append(PageBreak())

    # ═══════════ PARTE V ═══════════
    story.append(Paragraph("Parte V · Roadmap consolidado 12 meses", S["PartTitle"]))

    roadmap = [
        ["Trimestre", "Desarrollo", "Infra", "Comercial"],
        ["Q2 2026\n(May-Jul)",
         "Rosters ML + fine-tune IA actual",
         "Escenario A (~US$120)",
         "Cerrar Goldfields · caso de éxito #1"],
        ["Q3 2026\n(Ago-Oct)",
         "Visión en WR + Predictive piloto",
         "Escenario B (~US$550)",
         "Pitch Antofagasta Minerals / Teck Chile"],
        ["Q4 2026\n(Nov-Ene 2027)",
         "IOC ligero + Digital Twin MVP",
         "Escenario B consolidado",
         "Entrar RFP enterprise (Codelco, BHP)"],
        ["Q1 2027\n(Feb-Abr)",
         "Escalamiento multi-tenant",
         "Escenario C (primer grande)",
         "Cierre primer contrato enterprise"],
    ]
    rrows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(roadmap)]
    tr = Table(rrows, colWidths=[28 * mm, 48 * mm, 38 * mm, 56 * mm])
    tr.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_EMERALD]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tr)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Equipo requerido", S["H3"]))
    team = [
        "<b>1 dev full-stack junior</b> (David, ya existente)",
        "<b>1 ML engineer part-time</b> (6 meses, 50%) · ~US$3-5k/mes",
        "<b>1 domain expert minero</b> (Jorge o externo) · 10h/semana",
        "<b>1 DevOps part-time</b> (solo al llegar Escenario C) · ~US$2k/mes",
    ]
    for t in team:
        story.append(Paragraph("• " + t, S["Bullet"]))

    story.append(Paragraph("Presupuesto primer año", S["H3"]))
    budget = [
        ["Ítem", "Costo"],
        ["Dev core (David)", "Cubierto"],
        ["ML engineer 6 meses", "US$20,000-30,000"],
        ["Compute (training + cloud)", "US$3,000-5,000"],
        ["Monitoring + herramientas", "US$1,500/año"],
        ["Infra base primer año (Escenario A)", "US$1,800"],
        ["Total primer año", "<b>US$26,000-38,000</b>"],
    ]
    brows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in r] for i, r in enumerate(budget)]
    tbud = Table(brows, colWidths=[100 * mm, 70 * mm])
    tbud.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, 5), [white, BG_LIGHT]),
        ("BACKGROUND", (0, 6), (-1, 6), BG_EMERALD),
        ("FONTNAME", (0, 6), (-1, 6), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tbud)
    story.append(Spacer(1, 8))

    story.append(callout_box(
        "<b>Break-even:</b> al cerrar <b>1 cliente Escenario B</b> (ARR US$240k) o <b>3 Escenario A</b> (ARR US$108k).",
        BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(PageBreak())

    # ═══════════ PARTE VI ═══════════
    story.append(Paragraph("Parte VI · Decisión requerida", S["PartTitle"]))
    story.append(Paragraph("Propongo a José aprobar una de estas tres opciones:", S["Body"]))

    options = [
        ("Opción A · Sí completo",
         "Arrancar Q2 con rosters ML como primer entregable. 1 mes dev dedicado. Review ejecutiva en 6 semanas con métricas reales. Compromiso total.",
         BG_EMERALD, EMERALD),
        ("Opción B · Exploración (recomendada)",
         "2 semanas de tiempo de David para prototipo con data sintética + deck comercial detallado. Decisión Go/No-Go al final. Bajo riesgo, alta información de vuelta.",
         BG_AMBER, AMBER),
        ("Opción C · No por ahora",
         "Mantener foco en cierre de MVP actual. Revisitar en 6 meses. RIESGO: ventana se achica rápido — Fracttal levantó US$70M y va a acelerar, Rio Tinto invirtió US$1B en Mine of the Future.",
         BG_ROSE, ROSE),
    ]
    for t, b, bg, bc in options:
        content = [Paragraph("<b>" + t + "</b>", S["BodyBold"]), Paragraph(b, S["Body"])]
        tbl = Table([[content]], colWidths=[170 * mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 0.8, bc),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 8))
    story.append(callout_box(
        "<b>Mi recomendación: Opción B.</b> Bajo riesgo (2 semanas), alta información de vuelta. "
        "Si el prototipo impresiona a Goldfields o Antofagasta, pasamos a Opción A con caso. "
        "Si no, no quemamos 3 meses en una apuesta larga.",
        BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(Spacer(1, 14))

    # Fuentes
    story.append(Paragraph("Fuentes y referencias", S["H2"]))
    sources = [
        "<b>Reports industriales:</b> McKinsey Mining 4.0 2024 · ABB Digital Mining Adoption Curve 2025 · PwC Mine 2025",
        "<b>Data chilena:</b> Consejo Minero Chile (Personal 2024) · SONAMI estadísticas 2024 · reportes sustentabilidad empresas",
        "<b>Competidores (roadmaps públicos):</b> Fracttal · Infraspeak · Prometheus GWOS",
        "<b>Papers chinos (traducidos):</b> Zijin AI-driven ore grade classification CSM 2024 · Baowu 5G underground ISIJ 2023 · Sany Predictive maintenance IoT whitepaper 2024",
    ]
    for s in sources:
        story.append(Paragraph("• " + s, S["Bullet"]))

    story.append(Spacer(1, 20))
    story.append(Paragraph("Documento vivo · se actualiza con feedback de José y Gonzalo", S["Footer"]))

    return story


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(EMERALD_DARK)
    canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(20 * mm, A4[1] - 8 * mm, "MAGEAM · Reliability Platform")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 8 * mm, "Estrategia + Infra · Confidencial")
    canvas.setFillColor(SLATE_LIGHT)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 10 * mm, "Pagina " + str(doc.page))
    canvas.drawString(20 * mm, 10 * mm, "David Cabezas · Value Strategy Consulting")
    canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, "2026-04-21")
    canvas.restoreState()


def main():
    S = make_styles()
    story = build_story(S)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="MAGEAM Strategy and Infra",
        author="David Cabezas",
        subject="Arbitraje tecnologico China + dimensionamiento infra",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("OK: " + str(OUT))


if __name__ == "__main__":
    main()
