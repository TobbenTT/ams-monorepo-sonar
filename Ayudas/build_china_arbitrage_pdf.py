"""Generate a polished executive PDF from the China Arbitrage markdown."""
from __future__ import annotations
import re
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "Mining Tech China Arbitrage.md"
OUT = ROOT / "Mining_Tech_China_Arbitrage.pdf"

# Colors
EMERALD = HexColor("#059669")
EMERALD_DARK = HexColor("#047857")
SLATE = HexColor("#1e293b")
SLATE_LIGHT = HexColor("#64748b")
AMBER = HexColor("#d97706")
ROSE = HexColor("#e11d48")
BG_LIGHT = HexColor("#f8fafc")
BG_EMERALD = HexColor("#ecfdf5")
BG_AMBER = HexColor("#fffbeb")
BG_ROSE = HexColor("#fff1f2")
BORDER = HexColor("#e2e8f0")


def make_styles():
    base = getSampleStyleSheet()
    return {
        "H1": ParagraphStyle("H1", parent=base["Heading1"], fontName="Helvetica-Bold",
                             fontSize=22, textColor=SLATE, spaceAfter=4, leading=26),
        "Subtitle": ParagraphStyle("Subtitle", parent=base["Normal"], fontName="Helvetica",
                                   fontSize=11, textColor=SLATE_LIGHT, spaceAfter=14, leading=14),
        "H2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Helvetica-Bold",
                             fontSize=15, textColor=EMERALD_DARK, spaceBefore=16, spaceAfter=8, leading=18),
        "H3": ParagraphStyle("H3", parent=base["Heading3"], fontName="Helvetica-Bold",
                             fontSize=12, textColor=SLATE, spaceBefore=10, spaceAfter=4, leading=15),
        "H4": ParagraphStyle("H4", parent=base["Heading4"], fontName="Helvetica-Bold",
                             fontSize=11, textColor=SLATE, spaceBefore=6, spaceAfter=2, leading=13),
        "Body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica",
                               fontSize=10, textColor=SLATE, leading=14, alignment=TA_JUSTIFY, spaceAfter=5),
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
                                    fontSize=9, textColor=SLATE, leading=12, alignment=TA_LEFT),
        "TableHead": ParagraphStyle("TableHead", parent=base["BodyText"], fontName="Helvetica-Bold",
                                    fontSize=9, textColor=white, leading=12, alignment=TA_LEFT),
    }


def inline_md(text: str) -> str:
    """Convert ** and * to <b>/<i> for reportlab paragraph."""
    # Bold
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Italic (single asterisk not preceded/followed by asterisk)
    text = re.sub(r"(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)", r"<i>\1</i>", text)
    # Inline code → monospace
    text = re.sub(r"`([^`]+)`", r'<font face="Courier">\1</font>', text)
    # Escape unsafe ampersands (but keep our own tags)
    text = text.replace(" & ", " &amp; ")
    return text


def callout_box(text, bg, border_color, style):
    """Build a one-paragraph callout with colored background."""
    tbl = Table([[Paragraph(inline_md(text), style)]], colWidths=[170 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border_color),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tbl


def build_story(md: str, S):
    story = []

    # Header block
    story.append(Paragraph("Mining Tech China → LatAm", S["H1"]))
    story.append(Paragraph("Oportunidad de arbitraje tecnológico para MAGEAM", S["Subtitle"]))

    meta_table = Table([[
        Paragraph("<b>Autor:</b> David Cabezas", S["Meta"]),
        Paragraph("<b>Fecha:</b> 2026-04-21", S["Meta"]),
        Paragraph("<b>Audiencia:</b> José · Gonzalo", S["Meta"]),
        Paragraph("<b>Estado:</b> Propuesta · requiere VB", S["Meta"]),
    ]], colWidths=[45 * mm, 35 * mm, 45 * mm, 50 * mm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # TL;DR callout
    story.append(Paragraph("TL;DR · 30 segundos", S["H2"]))
    tldr_text = (
        "China tiene <b>5 tecnologías productivas en mining</b> que ni Chile ni Australia tienen "
        "aún a escala. No salen al extranjero por barreras regulatorias, no porque no funcionen.<br/><br/>"
        "Tres de esas tecnologías las podemos <b>implementar dentro de MAGEAM</b> sin hardware propietario, "
        "usando open source + modelos entrenables. Nos diferencia de Fracttal, Prometheus, Cromateus y nos "
        "posiciona como el único SaaS <b>next-gen</b> del mercado LatAm.<br/><br/>"
        "<b>Inversión:</b> 3-6 meses de desarrollo enfocado · ~0 CAPEX<br/>"
        "<b>Diferenciador esperado:</b> único actor en LatAm con estas 3 capacidades integradas<br/>"
        "<b>Ventana:</b> 3-5 años antes del catch-up occidental"
    )
    story.append(callout_box(tldr_text, BG_EMERALD, EMERALD, S["TLDR"]))
    story.append(Spacer(1, 10))

    # Section 1 - What China has
    story.append(Paragraph("1. Qué tiene China en producción real", S["H2"]))
    story.append(Paragraph(
        "Estas 7 tecnologías operan <b>a escala industrial</b>, no en test. Referencias verificables con "
        "Baowu Steel, Shenhua Coal, Zijin Mining, Sany Heavy Industry.", S["Body"]))
    story.append(Spacer(1, 6))

    china_items = [
        ("A · 5G privado underground + tele-operación",
         "Redes 5G privadas operando en minas subterráneas reales desde 2022. Latencia &lt;20ms, streaming 4K de 20+ cámaras, operación remota de equipos. <b>Baowu Steel, Shenhua Coal</b>. No hay equivalente a esa escala en LatAm/Australia."),
        ("B · Flotas autónomas en coal mining",
         "Inner Mongolia / Shanxi: <b>500+ camiones autónomos 24/7 desde 2023</b>, supera Pilbara en volumen. Players: Waytous, TAGE I Drive, Easy Mining."),
        ("C · AI ore sorting con visión computacional",
         "Cámaras de alta velocidad + ML clasifican grado de mineral pedazo por pedazo en la correa. <b>Zijin Mining</b> lo usa en producción. Ahorro 40% en costo de procesamiento."),
        ("D · IOC (Integrated Operations Center) real",
         "War rooms de 30 personas monitoreando 15 minas simultáneamente desde Beijing/Shanghai con decisiones en tiempo real. Codelco IROC y Rio Tinto Perth están 3 años atrás."),
        ("E · ML-optimized shift scheduling",
         "Rosters 7x7 / 14x14 optimizados por algoritmo considerando ley laboral, skills, fatiga, costos de transporte. Nativo en DingTalk Mining HRMS."),
        ("F · Digital twin operacional continuo",
         "Modelo 3D vivo del yacimiento + equipos + operarios. Simulaciones contrafácticas en tiempo real que informan decisiones diarias, no planificación trimestral."),
        ("G · IoT masivo de condición",
         "Sensores de vibración, temperatura y aceite en cada motor crítico. Maintenance predictivo real con +90% accuracy. <b>Sany Heavy Industry Cloud, Zoomlion Connect</b>."),
    ]
    for title, body in china_items:
        story.append(Paragraph(title, S["H4"]))
        story.append(Paragraph(body, S["Body"]))

    story.append(PageBreak())

    # Section 2 - Why not outside
    story.append(Paragraph("2. Por qué no están fuera de China", S["H2"]))

    # Legit barriers table
    story.append(Paragraph("Barreras legítimas (duras)", S["H3"]))
    hard_barriers = [
        ["Barrera", "Detalle"],
        ["Regulación de data",
         "Data minera china no puede salir del país por ley (Data Security Law 2021). Software hosted en servidores chinos no es exportable."],
        ["IP &amp; sovereignty",
         "Australia, US y Canadá bloquean procurement de SW chino para infraestructura crítica desde 2022 (efecto Huawei Ban extendido a mining)."],
        ["Certificaciones",
         "SW chino no tiene ISO 27001, SOC 2, GDPR, FIPS 140-2. Occidente las exige para contratos enterprise."],
        ["Ecosistema cerrado",
         "Integran con ERP nacionales (Kingdee, YonYou), no con SAP/Oracle. Rewrite de integración cuesta 1-2 años."],
    ]
    hard_data = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in row] for i, row in enumerate(hard_barriers)]
    t_hard = Table(hard_data, colWidths=[45 * mm, 125 * mm])
    t_hard.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ROSE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_hard)
    story.append(Spacer(1, 10))

    # Cosmetic barriers
    story.append(Paragraph("Barreras cosméticas (fáciles de explotar)", S["H3"]))
    cosmetic = [
        ["Barrera", "Detalle"],
        ["Idioma", "UI, docs, soporte solo en mandarín."],
        ["Marketing global cero", "No van a PDAC, IMARC ni conferences occidentales."],
        ["Percepción precio bajo", "Occidente interpreta precio chino barato como calidad baja."],
        ["Cultura guanxi", "Modelo B2B chino (relaciones personales 10+ años) no es replicable en Occidente."],
    ]
    cdata = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in row] for i, row in enumerate(cosmetic)]
    t_cos = Table(cdata, colWidths=[45 * mm, 125 * mm])
    t_cos.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AMBER),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_cos)
    story.append(Spacer(1, 12))

    # Opportunity callout
    opp_text = (
        "<b>Oportunidad:</b> estas barreras bloquean la exportación directa, <b>no la imitación del concepto</b>. "
        "Ya existen precedentes: TikTok ($200B), SHEIN ($60B), Temu ($30B+) y BYD/NIO copiaron conceptos probados en "
        "China, los occidentalizaron y ganaron market share global."
    )
    story.append(callout_box(opp_text, BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(PageBreak())

    # Section 3 - What we can implement
    story.append(Paragraph("3. Qué podemos implementar en MAGEAM", S["H2"]))

    # Tier 1
    story.append(Paragraph("Tier 1 · Factible en 1-2 meses cada uno", S["H3"]))
    tier1 = [
        ("3.1 · Rosters optimizados por ML",
         "<b>Qué:</b> algoritmo que asigna técnicos a turnos considerando ley laboral chilena, skills, fatiga, ciclos 7x7/14x14.<br/>"
         "<b>Cómo:</b> linear programming (OR-Tools de Google, gratis) + data de workforce que ya tenemos.<br/>"
         "<b>Diferenciador:</b> Fracttal/Prometheus hacen asignación heurística. ML optimization real es único en LatAm.<br/>"
         "<b>Esfuerzo:</b> 4 semanas · 1 dev · <b>ROI cliente:</b> 5-8% mejora productividad técnica."),
        ("3.2 · Visión computacional en inspección de equipos",
         "<b>Qué:</b> cuando el mantenedor saca foto al crear WR, un modelo detecta anomalías (grietas, corrosión, fugas, desgaste).<br/>"
         "<b>Cómo:</b> YOLO v8 pre-entrenado + fine-tune con 2000 fotos chilenas reales. Edge inference en móvil.<br/>"
         "<b>Diferenciador:</b> automatiza triage del aviso, reduce trabajo de supervisor, da confianza al planner.<br/>"
         "<b>Esfuerzo:</b> 6-8 semanas · <b>ROI:</b> 20-30% reducción en tiempo de triage."),
        ("3.3 · Predictive maintenance con vibraciones",
         "<b>Qué:</b> ingesta de sensores SKF/Schaeffler/Emerson ya instalados en motores críticos, MAGEAM genera alerta y OT antes de falla.<br/>"
         "<b>Cómo:</b> APIs existentes → modelo LSTM o Isolation Forest → OT preventiva automática.<br/>"
         "<b>Diferenciador:</b> nadie en LatAm integra vibraciones a OTs automáticamente, todo es análisis offline.<br/>"
         "<b>Esfuerzo:</b> 6 semanas + piloto · <b>ROI:</b> 15-25% reducción downtime no planeado."),
    ]
    for t, b in tier1:
        story.append(Paragraph(t, S["H4"]))
        story.append(Paragraph(b, S["Body"]))

    story.append(Spacer(1, 6))

    # Tier 2
    story.append(Paragraph("Tier 2 · Factible en 3-6 meses", S["H3"]))
    tier2 = [
        ("3.4 · Digital twin operacional simplificado",
         "Modelo 3D ligero de faena + equipos + simulación <i>qué pasa si…</i>. Stack Three.js + Celery/Redis. "
         "Principalmente vendable: impresiona en demo, mejora buy-in ejecutivo. <b>Esfuerzo:</b> 12-16 semanas."),
        ("3.5 · IOC ligero (Integrated Operations Center web-based)",
         "Pantalla tipo war room que consolida 3-5 minas + alertas compartidas + chat operativo. Ampliación natural "
         "de nuestro Modo Presentación + WebSocket cross-plant. Venta corporativa a mineras con 3+ operaciones. "
         "<b>Esfuerzo:</b> 8-10 semanas."),
    ]
    for t, b in tier2:
        story.append(Paragraph(t, S["H4"]))
        story.append(Paragraph(b, S["Body"]))

    story.append(Spacer(1, 6))

    # Tier 3 out of scope
    story.append(Paragraph("Tier 3 · Fuera de alcance", S["H3"]))
    out_text = (
        "<b>5G privado</b> requiere hardware de red (Ericsson/Nokia). "
        "<b>Tele-operación autónoma</b> requiere integración Caterpillar/Komatsu + certificación safety, no es SaaS. "
        "<b>AI ore sorting</b> es mineral processing, industria adyacente."
    )
    story.append(Paragraph(out_text, S["Body"]))

    story.append(PageBreak())

    # Section 4 - Roadmap
    story.append(Paragraph("4. Roadmap propuesto · 9 meses", S["H2"]))

    roadmap = [
        ["Trimestre", "Entregable", "Objetivo comercial"],
        ["Q2 2026\nMay-Jul",
         "Rosters ML +\nfine-tune IA actual",
         "Cerrar demo Goldfields, primer caso de éxito documentado"],
        ["Q3 2026\nAgo-Oct",
         "Visión computacional en WR\n+ Predictive maintenance piloto",
         "Pitch a Antofagasta Minerals / Teck Chile con diferenciador claro"],
        ["Q4 2026\nNov-Ene 2027",
         "IOC ligero +\nDigital twin MVP",
         "Entrar a procesos RFP de minas con 3+ operaciones"],
    ]
    rdata = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in row] for i, row in enumerate(roadmap)]
    t_road = Table(rdata, colWidths=[32 * mm, 55 * mm, 83 * mm])
    t_road.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_EMERALD]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_road)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Equipo y presupuesto", S["H3"]))
    story.append(Paragraph("<b>Equipo:</b> 1 dev full-stack senior (existente) + 1 ML engineer part-time (6 meses, 50%) + 1 domain expert (Jorge o externo)", S["Body"]))
    story.append(Paragraph("<b>Presupuesto:</b> US$35k-50k total (ML engineer + cloud training compute + datasets). <b>CAPEX = 0</b>, todo SaaS.", S["Body"]))

    story.append(PageBreak())

    # Section 5 - Why now
    story.append(Paragraph("5. Por qué ahora y no después", S["H2"]))
    story.append(Paragraph("Ventana de oportunidad: 3-5 años", S["H3"]))

    story.append(Paragraph("<b>Razones por las que la ventana se cierra:</b>", S["Body"]))
    reasons = [
        "<b>Occidente en catch-up acelerado:</b> Rio Tinto invirtió US$1B en Mine of the Future 2024-2028, BHP autonomous fleet escalando, Siemens/Hexagon/ABB con labs de US$500M+, Fracttal levantó US$70M serie B 2024.",
        "<b>China va a salir con partnerships locales:</b> cuando bajen tensiones US-China, Huawei Mining va a vender via partners. Ya hay experiencias en Indonesia, Kazajistán, Serbia.",
        "<b>Los nativos digitales llegan a gerencia:</b> los Jorges (50-65) se retiran en 2030-2035. Los que toman poder tienen mindset tech. Si MAGEAM no está posicionado como la opción next-gen antes de 2029, compramos mucho más caro el mindshare.",
    ]
    for r in reasons:
        story.append(Paragraph("• " + r, S["Bullet"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Qué pasa si NO hacemos esto", S["H4"]))
    story.append(Paragraph("Seguimos siendo un Fracttal-lite. Mercado limitado, ticket bajo, competencia brutal con Infraspeak e incumbents.", S["Body"]))

    story.append(Paragraph("Qué pasa si SÍ", S["H4"]))
    story.append(Paragraph("Somos el único SaaS en LatAm con ML ops + visión + predictive integrados. Ticket promedio sube de US$50/user/mes a US$200/user/mes. Target exportable a Australia cuando haya caso chileno.", S["Body"]))

    story.append(PageBreak())

    # Section 6 - Validation
    story.append(Paragraph("6. Cómo validamos sin bet-the-farm", S["H2"]))
    steps = [
        ("Mes 1", "Prototipo de rosters ML con data sintética", "2 semanas dev · US$0"),
        ("Mes 2", "Demo con José + gerencia Goldfields / Antofagasta", "Medir recepción real"),
        ("Mes 3", "Si hay señal positiva → arrancar Q2 roadmap oficial. Si no, el trabajo sirve al producto base.", "Cero riesgo reputacional"),
    ]
    vdata = [["Fase", "Qué", "Costo / Resultado"]] + [[s[0], s[1], s[2]] for s in steps]
    vrows = [[Paragraph(c, S["TableHead"] if i == 0 else S["TableCell"]) for c in row] for i, row in enumerate(vdata)]
    t_v = Table(vrows, colWidths=[25 * mm, 85 * mm, 60 * mm])
    t_v.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_v)
    story.append(Spacer(1, 14))

    # Section 7 - Decision required
    story.append(Paragraph("7. Decisión requerida", S["H2"]))
    story.append(Paragraph("Propongo a José aprobar una de estas tres opciones:", S["Body"]))

    options = [
        ("Opción A · Sí completo",
         "Arrancar Q2 con rosters ML como primer entregable. 1 mes dev dedicado. Review ejecutiva en 6 semanas con métricas reales.",
         BG_EMERALD, EMERALD),
        ("Opción B · Exploración (recomendada)",
         "2 semanas de tiempo de David para prototipo con data sintética + deck comercial detallado. Decisión Go/No-Go al final. Bajo riesgo, alta información de vuelta.",
         BG_AMBER, AMBER),
        ("Opción C · No por ahora",
         "Mantener foco en cierre de MVP actual. Revisitar en 6 meses. RIESGO: ventana de diferenciación se achica rápidamente.",
         BG_ROSE, ROSE),
    ]
    for title, body, bg, bc in options:
        box_content = [
            Paragraph(f"<b>{title}</b>", S["BodyBold"]),
            Paragraph(body, S["Body"]),
        ]
        tbl = Table([[box_content]], colWidths=[170 * mm])
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
    recom = (
        "<b>Mi recomendación: Opción B.</b> Bajo riesgo (2 semanas), alta información de vuelta. "
        "Si el prototipo impresiona a un cliente grande (Goldfields, Antofagasta), pasamos a Opción A con caso. "
        "Si no, no quemamos 3 meses en una apuesta larga."
    )
    story.append(callout_box(recom, BG_EMERALD, EMERALD, S["TLDR"]))

    story.append(Spacer(1, 14))

    # Sources
    story.append(Paragraph("8. Fuentes", S["H2"]))
    sources = [
        "<b>Reports:</b> McKinsey Mining 4.0 2024 · ABB Digital Mining Adoption Curve 2025 · PwC Mine 2025",
        "<b>Competidores (public roadmaps):</b> Fracttal Q1 2026 · Prometheus GWOS · Infraspeak",
        "<b>Papers chinos (traducidos):</b> Zijin AI-driven ore grade classification CSM 2024 · Baowu 5G underground ISIJ 2023 · Sany Predictive maintenance IoT whitepaper 2024",
    ]
    for s in sources:
        story.append(Paragraph("• " + s, S["Bullet"]))

    story.append(Spacer(1, 20))
    story.append(Paragraph("Documento vivo · se actualiza con feedback de José y Gonzalo", S["Footer"]))

    return story


def header_footer(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(EMERALD_DARK)
    canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(20 * mm, A4[1] - 8 * mm, "MAGEAM · Reliability Platform")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 8 * mm, "Mining Tech China Arbitrage · Confidencial")
    # Footer
    canvas.setFillColor(SLATE_LIGHT)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 10 * mm, f"Página {doc.page}")
    canvas.drawString(20 * mm, 10 * mm, "David Cabezas · Value Strategy Consulting")
    canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, "2026-04-21")
    canvas.restoreState()


def main():
    md = SRC.read_text(encoding="utf-8")
    S = make_styles()
    story = build_story(md, S)

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Mining Tech China Arbitrage",
        author="David Cabezas",
        subject="Oportunidad estratégica para MAGEAM",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("OK: " + str(OUT))


if __name__ == "__main__":
    main()
