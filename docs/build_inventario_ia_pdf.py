"""Genera PDF con diseño polido del inventario de funciones IA para Gonzalo."""
from __future__ import annotations
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "INVENTARIO_FUNCIONES_IA.pdf"

# Paleta consistente con el design system MAGEAM
EMERALD = HexColor("#059669")
EMERALD_DARK = HexColor("#047857")
EMERALD_LIGHT = HexColor("#ecfdf5")
PURPLE = HexColor("#7c3aed")
PURPLE_DARK = HexColor("#5b21b6")
PURPLE_LIGHT = HexColor("#f5f3ff")
SLATE = HexColor("#1e293b")
SLATE_LIGHT = HexColor("#64748b")
SLATE_BG = HexColor("#f8fafc")
AMBER = HexColor("#d97706")
AMBER_LIGHT = HexColor("#fffbeb")
ROSE = HexColor("#e11d48")
ROSE_LIGHT = HexColor("#fff1f2")
INDIGO = HexColor("#4f46e5")
INDIGO_LIGHT = HexColor("#eef2ff")
BORDER = HexColor("#e2e8f0")


def make_styles():
    base = getSampleStyleSheet()
    return {
        "Cover": ParagraphStyle("Cover", parent=base["Heading1"], fontName="Helvetica-Bold",
                                fontSize=28, textColor=SLATE, spaceAfter=4, leading=32, alignment=TA_LEFT),
        "CoverSub": ParagraphStyle("CoverSub", parent=base["Normal"], fontName="Helvetica",
                                   fontSize=13, textColor=SLATE_LIGHT, spaceAfter=18, leading=17),
        "H1": ParagraphStyle("H1", parent=base["Heading1"], fontName="Helvetica-Bold",
                             fontSize=20, textColor=EMERALD_DARK, spaceBefore=22, spaceAfter=10, leading=24),
        "H2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Helvetica-Bold",
                             fontSize=14, textColor=PURPLE_DARK, spaceBefore=14, spaceAfter=6, leading=17),
        "H3": ParagraphStyle("H3", parent=base["Heading3"], fontName="Helvetica-Bold",
                             fontSize=11.5, textColor=SLATE, spaceBefore=8, spaceAfter=4, leading=14),
        "Body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica",
                               fontSize=10, textColor=SLATE, leading=14, alignment=TA_JUSTIFY, spaceAfter=5),
        "BodyLeft": ParagraphStyle("BodyLeft", parent=base["BodyText"], fontName="Helvetica",
                                   fontSize=10, textColor=SLATE, leading=14, alignment=TA_LEFT, spaceAfter=5),
        "Bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName="Helvetica",
                                 fontSize=10, textColor=SLATE, leading=14, spaceAfter=3,
                                 leftIndent=14, bulletIndent=4),
        "Meta": ParagraphStyle("Meta", parent=base["Normal"], fontName="Helvetica",
                               fontSize=9, textColor=SLATE_LIGHT, spaceAfter=2),
        "Footer": ParagraphStyle("Footer", parent=base["Normal"], fontName="Helvetica-Oblique",
                                 fontSize=8.5, textColor=SLATE_LIGHT, alignment=TA_CENTER),
        "TC": ParagraphStyle("TC", parent=base["BodyText"], fontName="Helvetica",
                             fontSize=8.5, textColor=SLATE, leading=11.5, alignment=TA_LEFT),
        "TCC": ParagraphStyle("TCC", parent=base["BodyText"], fontName="Helvetica",
                              fontSize=8.5, textColor=SLATE, leading=11.5, alignment=TA_CENTER),
        "TH": ParagraphStyle("TH", parent=base["BodyText"], fontName="Helvetica-Bold",
                             fontSize=9, textColor=white, leading=12, alignment=TA_LEFT),
        "THC": ParagraphStyle("THC", parent=base["BodyText"], fontName="Helvetica-Bold",
                              fontSize=9, textColor=white, leading=12, alignment=TA_CENTER),
        "Mono": ParagraphStyle("Mono", parent=base["BodyText"], fontName="Courier",
                               fontSize=9, textColor=SLATE, leading=12, alignment=TA_LEFT, spaceAfter=4),
        "Pill": ParagraphStyle("Pill", parent=base["BodyText"], fontName="Helvetica-Bold",
                               fontSize=8, textColor=white, leading=10, alignment=TA_CENTER),
        "Card": ParagraphStyle("Card", parent=base["BodyText"], fontName="Helvetica",
                               fontSize=10, textColor=SLATE, leading=14, alignment=TA_LEFT, spaceAfter=4),
    }


def callout(html, bg, border_color, style, width_mm=170):
    tbl = Table([[Paragraph(html, style)]], colWidths=[width_mm * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border_color),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return tbl


def section_header_band(text, color, S):
    """Banda horizontal con título de sección."""
    tbl = Table([[Paragraph(f'<font color="white"><b>{text}</b></font>', S["H1"])]], colWidths=[170 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tbl


def function_card(num, title, color, status, content, S):
    """Card por función IA."""
    pill_color = EMERALD if status == "live" else AMBER
    pill_text = "FUNCIONAL" if status == "live" else "PHASE 2"
    header = Table([[
        Paragraph(f'<font color="white"><b>#{num}</b></font>', S["Pill"]),
        Paragraph(f'<b>{title}</b>', S["H3"]),
        Paragraph(f'<font color="white"><b>{pill_text}</b></font>', S["Pill"]),
    ]], colWidths=[18 * mm, 130 * mm, 22 * mm])
    header.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), color),
        ("BACKGROUND", (2, 0), (2, 0), pill_color),
        ("BACKGROUND", (1, 0), (1, 0), HexColor("#ffffff")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
    ]))

    body = Table([[Paragraph(content, S["Card"])]], colWidths=[170 * mm])
    body.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SLATE_BG),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return KeepTogether([header, body, Spacer(1, 8)])


def styled_table(headers, rows, col_widths, S, header_color=EMERALD_DARK, alt_bg=True):
    data = [[Paragraph(h, S["TH"]) for h in headers]]
    for r in rows:
        data.append([Paragraph(str(c), S["TC"]) for c in r])
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), header_color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, BORDER),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
    ]
    if alt_bg:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), SLATE_BG))
    tbl.setStyle(TableStyle(style))
    return tbl


def build(S):
    story = []

    # ═══════════ COVER ═══════════
    cover_band = Table([[Paragraph('<font color="white"><b>MAGEAM · IA</b></font>',
                                    S["H1"])]],
                        colWidths=[170 * mm])
    cover_band.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PURPLE_DARK),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(cover_band)
    story.append(Spacer(1, 18))

    story.append(Paragraph("Inventario técnico de funciones IA", S["Cover"]))
    story.append(Paragraph("Qué endpoints invocan a Claude · prompts · status real · costos", S["CoverSub"]))

    meta = Table([[
        Paragraph("<b>Autor:</b> David Cabezas", S["Meta"]),
        Paragraph("<b>Fecha:</b> 2026-04-30", S["Meta"]),
        Paragraph("<b>Audiencia:</b> Gonzalo (Producto)", S["Meta"]),
        Paragraph("<b>Modelo:</b> claude-sonnet-4-6", S["Meta"]),
    ]], colWidths=[40 * mm, 32 * mm, 50 * mm, 48 * mm])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SLATE_BG),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(meta)
    story.append(Spacer(1, 16))

    # TL;DR
    tldr = (
        "<b>Resumen ejecutivo.</b> MAGEAM tiene <b>9 endpoints que invocan Claude (Sonnet 4.6)</b> "
        "y <b>13 capacidades algorítmicas</b> sin LLM. Las 22 cards de <i>/agentic-capabilities</i> "
        "ya no exageran &mdash; cada una declara honestamente si usa IA o algoritmo. "
        "Costo estimado: <b>~$15/mes per planta</b> (Goldfields) con ~50 llamadas/día. "
        "Todas las funciones IA tienen fallback determinístico si Anthropic responde mal o si la API key no está seteada."
    )
    story.append(callout(tldr, PURPLE_LIGHT, PURPLE, S["BodyLeft"]))
    story.append(Spacer(1, 14))

    # ═══════════ KPIs ═══════════
    kpi_row = Table([[
        Table([
            [Paragraph('<font color="white"><b>9</b></font>', ParagraphStyle("KPI1", fontName="Helvetica-Bold", fontSize=28, textColor=white, alignment=TA_CENTER))],
            [Paragraph('<font color="white">endpoints<br/>Claude reales</font>', ParagraphStyle("KPILabel", fontName="Helvetica", fontSize=9, textColor=white, alignment=TA_CENTER, leading=11))],
        ], colWidths=[55 * mm], rowHeights=[18 * mm, 12 * mm]),
        Table([
            [Paragraph('<font color="white"><b>13</b></font>', ParagraphStyle("KPI2", fontName="Helvetica-Bold", fontSize=28, textColor=white, alignment=TA_CENTER))],
            [Paragraph('<font color="white">algoritmos<br/>determinísticos</font>', ParagraphStyle("KPILabel", fontName="Helvetica", fontSize=9, textColor=white, alignment=TA_CENTER, leading=11))],
        ], colWidths=[55 * mm], rowHeights=[18 * mm, 12 * mm]),
        Table([
            [Paragraph('<font color="white"><b>~$15</b></font>', ParagraphStyle("KPI3", fontName="Helvetica-Bold", fontSize=24, textColor=white, alignment=TA_CENTER))],
            [Paragraph('<font color="white">USD/mes<br/>per planta</font>', ParagraphStyle("KPILabel", fontName="Helvetica", fontSize=9, textColor=white, alignment=TA_CENTER, leading=11))],
        ], colWidths=[55 * mm], rowHeights=[18 * mm, 12 * mm]),
    ]], colWidths=[55 * mm, 55 * mm, 55 * mm])
    kpi_row.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), PURPLE),
        ("BACKGROUND", (1, 0), (1, 0), EMERALD),
        ("BACKGROUND", (2, 0), (2, 0), INDIGO),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(kpi_row)
    story.append(Spacer(1, 16))

    # ═══════════ TABLA DISTRIBUCIÓN POR CAPA ═══════════
    story.append(Paragraph("Distribución por capa del flujo", S["H2"]))
    layer_rows = [
        ["1 · Captura", "#1 Vision · #2 Voice · #4 Classification", "#3 Duplicate detect", "4"],
        ["2 · Validación + Plan", "#6 Smart Assignment · #7 Auto-Level NL", "#5, #8, #9 (reglas SAP)", "5"],
        ["3 · Ejecución", "—", "#10, #11, #12", "3"],
        ["4 · Análisis", "#14 Crónicas · #18 NLP · #19 OC · #20 Cost", "#13, #15, #16, #17", "8"],
        ["5 · Cierre", "—", "#21, #22", "2"],
        ["TOTAL", "9 endpoints Claude", "13 algoritmos", "22"],
    ]
    layer_tbl = styled_table(
        ["Capa", "Funciones IA reales", "Algoritmos sin LLM", "Total"],
        layer_rows,
        [38 * mm, 70 * mm, 50 * mm, 12 * mm],
        S, header_color=PURPLE_DARK,
    )
    story.append(layer_tbl)
    story.append(PageBreak())

    # ═══════════ PARTE II: ENDPOINTS CLAUDE ═══════════
    story.append(section_header_band("Endpoints con Claude (LLM real)", PURPLE_DARK, S))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Cada endpoint listado abajo invoca <b>claude-sonnet-4-6</b> vía Anthropic SDK. "
        "Si la API key no está seteada o Claude responde mal, el fallback determinístico "
        "(heurística keyword o default) se activa transparentemente.",
        S["Body"]))
    story.append(Spacer(1, 8))

    functions = [
        ("1", "Vision AI · foto → equipo + falla", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/captures/photo<br/>"
         "<b>Servicio:</b> api/services/vision_service.py<br/>"
         "<b>Input:</b> imagen base64 · <b>Output:</b> {equipment_tag_detected, failure_mode_detected, confidence}<br/>"
         "<b>Trigger UI:</b> /failure-capture · botón cámara"),
        ("2", "Voice capture · dictado → WR estructurado", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/agentic/voice-capture<br/>"
         "<b>Servicio:</b> agentic_voice_capture_service.py · _classify_with_claude<br/>"
         "<b>Output:</b> {failure_category, failure_object_part, failure_symptom, failure_cause, "
         "suggested_action, priority, priority_reason, work_conditions}<br/>"
         "<b>Prompt:</b> catálogo SAP cerrado (MEC/ELEC/INST × partes/síntomas/causas) — Claude elige UN valor exacto de cada lista"),
        ("4", "AI Classification del form manual", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/work-requests/manual<br/>"
         "<b>Cuándo:</b> al submit con problem_description no vacío<br/>"
         "<b>Bump prioridad:</b> si Claude detecta más severidad que la del usuario (ej: 'humo + emergencia') "
         "levanta a P1/P2 con flag priority_bumped_by_ai + ai_priority_reason<br/>"
         "<b>Status:</b> antes era stub. Real desde 2026-04-30."),
        ("6", "Smart Assignment con razonamiento", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/assignments/rank-for-operation<br/>"
         "<b>Pipeline:</b> scoring algorítmico (40 specialty + 30 skill + 20 shift + HH) ranquea top-10 → "
         "Claude analiza top-3 → recommended_worker_id + reasoning + warnings<br/>"
         "<b>Caso real:</b> 3 técnicos con score 68 idéntico — Claude desempata por skill 'soldadura' contra descripción del WO"),
        ("7", "Auto-Level NL parser", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/scheduling/parse-autolevel-instructions<br/>"
         "<b>Input:</b> texto NL ('lunes liviano por reunión, prioriza chancador') + WOs + días semana<br/>"
         "<b>Output:</b> {priority_boost_wos, priority_boost_equipment, deprioritize_wos, "
         "light_days, excluded_days, capacity_override_pct, include_weekend, summary}<br/>"
         "<b>Mejora sobre keywords:</b> mapea 'lunes' a fecha real (2026-04-28), entiende equipos por tag"),
        ("14", "Crónicas con causa raíz", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/analytics/chronic-failures-analyze<br/>"
         "<b>Input:</b> clusters detectados algorítmicamente (≥3 reps en 7d) + sample descriptions<br/>"
         "<b>Output:</b> {root_cause_hypothesis, recommended_action, confidence: high|medium|low}<br/>"
         "<b>Ejemplo:</b> 'PMP-AGUA-01 vibración axial 4×' → 'rodamiento NDE deteriorado, reemplazar + verificar juego axial'"),
        ("18", "NLP causas no-cumplimiento", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/analytics/classify-noncompliance<br/>"
         "<b>Clasifica en 7 categorías Jorge:</b> REPUESTO_FALTANTE, OPERACIONES_NO_LIBERO, SERVICIO_EXTERNO_NO_LLEGO, "
         "HERRAMIENTA_FALTANTE, EQUIPO_APOYO_NO_DISPONIBLE, VENTANA_INSUFICIENTE, SEGURIDAD_LOTO<br/>"
         "<b>Detecta emergentes:</b> 'no había soldador certificado' → categoría nueva PERSONAL_INSUFICIENTE<br/>"
         "<b>Antes era:</b> 7 regex hardcodeados"),
        ("19", "Stock OC recommend con justificación", PURPLE,
         "<b>Endpoint:</b> POST /api/v1/analytics/stock-oc-recommend<br/>"
         "<b>Input:</b> forecast determinístico (consumo 90d + demanda 60d + stock disp)<br/>"
         "<b>Output:</b> {qty_suggested, priority: HIGH|MEDIUM|LOW, reasoning citando los números clave}<br/>"
         "<b>Ejemplo:</b> 'Cobertura 2.5d (&lt;7d); demanda 60d=10. Sugiero OC 8 uds para cubrir 60d descontando stock actual (2)'"),
        ("20", "Cost element classifier", PURPLE,
         "<b>Servicio:</b> cost_analysis_service.py · _classify_materials_with_claude<br/>"
         "<b>Cuándo:</b> al computar cost_analysis si un material tiene description pero falta cost_element<br/>"
         "<b>7 categorías SAP:</b> REPUESTO_CONSUMIBLE/CRITICO/ELECTRICO, INSUMO_LUBRICANTE, HERRAMIENTA_EQUIPO, "
         "MANO_DE_OBRA, SERVICIO_EXTERNO<br/>"
         "<b>Cache:</b> _COST_ELEMENT_CACHE en memoria global (no re-clasifica descripciones repetidas)"),
    ]
    for n, t, c, content in functions:
        story.append(function_card(n, t, c, "live", content, S))

    story.append(PageBreak())

    # ═══════════ PARTE III: ALGORITMOS ═══════════
    story.append(section_header_band("Capacidades sin LLM (algoritmo)", EMERALD_DARK, S))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Estas 13 cards <b>funcionan sin invocar Claude</b> porque la lógica es determinística: "
        "reglas SAP, fórmulas matemáticas, correlaciones temporales. "
        "<b>El label de cada card refleja honestamente</b> que no usa IA — no se exagera. "
        "Beneficio: lógica auditable, sin riesgo de alucinación, costo cero.",
        S["Body"]))
    story.append(Spacer(1, 10))

    algos = [
        ("3", "Duplicate detection", "jaccard + sequence ratio + time-decay 7d + severity filter ±2"),
        ("5", "Express PM03 (1 click)", "regla SAP fast-track: WR P1/P2 → OT directo en PROGRAMADO"),
        ("8", "Bloqueo PM01/02 → falla", "HTTPException 409 si intentás cambiar PM01 con priority P1/P2"),
        ("9", "Cancelación con tipología", "dropdown ABSORBED/NOT_NEEDED/OTHER + linkeo absorbed_by_wo_id"),
        ("10", "Notif parcial multi-turno", "agrupa por shift + technician + WS broadcast cuando todas las ops 100%"),
        ("11", "Pre-close gates (5)", "ALL_OPS_DONE · HH_VARIANCE_OK · MATERIALS_OK · SUPERVISOR_QA · NO_OPEN_NOTIFS"),
        ("12", "Stock auto-decrement", "hook idempotente al CERRAR — descuenta materials del inventory"),
        ("13", "Bad Actors × Críticos", "cruce con criticality A/B threshold ≥2 fallas, C/D ≥3"),
        ("15", "Auto-RCA trigger", "scan closed P1/P2 + 5W2H pre-fill template"),
        ("16", "Retrabajos &lt;24h", "correlación temporal: equipo cerrado + nuevo WR en &lt;24h del mismo equipo"),
        ("17", "Pareto + Jack-Knife", "fórmulas Jorge validadas 1:1 contra Excels históricos Sept/Oct/Dic 2010"),
        ("21", "FMECA push auto", "al cerrar RCA registra/actualiza FMECA worksheet con RPN before/after"),
        ("22", "Close-the-loop tracking", "cuenta improvement_actions abiertas/vencidas/cerradas + warnings"),
    ]
    algo_rows = [[f"#{n}", title, descr] for n, title, descr in algos]
    algo_tbl = styled_table(
        ["#", "Capacidad", "Lógica"],
        algo_rows,
        [10 * mm, 55 * mm, 105 * mm],
        S, header_color=EMERALD_DARK,
    )
    story.append(algo_tbl)
    story.append(PageBreak())

    # ═══════════ MODELO DE DECISIÓN ═══════════
    story.append(section_header_band("Modelo de decisión: ¿Claude o algoritmo?", INDIGO, S))
    story.append(Spacer(1, 10))
    decision_rows = [
        ["Texto libre del usuario", "✅ Sí — NLP es necesario", "—"],
        ["Catálogo cerrado (P1/P2, MEC/ELEC)", "✅ Si hay que mapear desde NL", "✅ Si ya viene estructurado"],
        ["Decisión con razonamiento ('por qué este')", "✅ Output con reasoning explícito", "—"],
        ["Cálculo numérico determinístico (HH, %, suma)", "—", "✅ Siempre"],
        ["Auditoría regulatoria (no se puede alucinar)", "—", "✅ Siempre"],
        ["Ranking + interpretación", "✅ Híbrido: algoritmo rankea, Claude explica", "—"],
    ]
    dec_tbl = styled_table(
        ["Criterio", "Usar Claude", "Usar algoritmo"],
        decision_rows,
        [70 * mm, 50 * mm, 50 * mm],
        S, header_color=INDIGO,
    )
    story.append(dec_tbl)
    story.append(Spacer(1, 16))

    # ═══════════ COSTOS ═══════════
    story.append(Paragraph("Costos estimados (Anthropic Sonnet 4.6)", S["H2"]))
    story.append(Paragraph(
        "Pricing referencia: <b>$3 USD por 1M tokens input</b>, <b>$15 USD por 1M tokens output</b>. "
        "Latencia típica 2-7s por llamada (sync, sin streaming).",
        S["Body"]))
    story.append(Spacer(1, 6))
    cost_rows = [
        ["#4 AI Classification", "~500", "~200", "~$0.005"],
        ["#6 Smart Assignment", "~600", "~150", "~$0.004"],
        ["#7 Auto-Level parser", "~800", "~250", "~$0.006"],
        ["#14 Crónicas analyze", "~700", "~400", "~$0.008"],
        ["#18 NLP causas (80 notas)", "~2000", "~600", "~$0.015"],
        ["#19 OC recommend", "~1500", "~500", "~$0.012"],
        ["#20 Cost element batch", "~1500", "~500", "~$0.012"],
        ["TOTAL ~50 llamadas/día", "—", "—", "~$0.5/día = ~$15/mes"],
    ]
    cost_tbl = styled_table(
        ["Función", "Tokens in", "Tokens out", "Costo/llamada"],
        cost_rows,
        [55 * mm, 30 * mm, 30 * mm, 55 * mm],
        S, header_color=INDIGO,
    )
    story.append(cost_tbl)
    story.append(Spacer(1, 16))

    cost_callout = (
        "<b>Optimización futura:</b> con cache compartido entre WRs similares "
        "(mismo equipo + mismo failure_mode) bajaría a <b>~$5-8/mes per planta</b>. "
        "También se puede usar Haiku 4.5 para clasificaciones simples (#4, #20) y reservar Sonnet "
        "para tareas con razonamiento (#6, #14) — bajaría otro ~40%."
    )
    story.append(callout(cost_callout, EMERALD_LIGHT, EMERALD, S["BodyLeft"]))
    story.append(PageBreak())

    # ═══════════ PHASE 2 ═══════════
    story.append(section_header_band("Phase 2 — funciones IA pendientes", AMBER, S))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "De los 20 items en Capa 6 (/agentic-capabilities), <b>4 requieren Claude real</b>. "
        "Los demás son determinísticos (conector Jigsaw, KPI Watchdog, dashboards HSE, etc.).",
        S["Body"]))
    story.append(Spacer(1, 8))
    p2_rows = [
        ["#33", "RCM Strategy Advisor", "Analiza histórico Weibull + falla → propone cambio frecuencia preventiva"],
        ["#34", "Shift Handover Assistant", "Consolida turno saliente para entrante (OTs, pendientes, alertas)"],
        ["#35", "Post-Maint Learning", "Embeddings + retrieval para troubleshooting basado en cierres previos"],
        ["#40", "Knowledge Base Curator", "Auto-tag + búsqueda semántica de manuales / RCAs / cierres"],
    ]
    p2_tbl = styled_table(
        ["#", "Capacidad", "Descripción"],
        p2_rows,
        [10 * mm, 55 * mm, 105 * mm],
        S, header_color=AMBER,
    )
    story.append(p2_tbl)
    story.append(Spacer(1, 14))

    # ═══════════ ARCHIVOS CLAVE ═══════════
    story.append(Paragraph("Archivos clave del codebase", S["H2"]))
    files_rows = [
        ["Backend · Voice + Classification", "api/services/agentic_voice_capture_service.py"],
        ["Backend · Smart Assignment", "api/routers/assignments.py · _claude_recommend_technician"],
        ["Backend · Auto-Level + NLP causas + Crónicas + OC", "api/routers/analytics.py · api/routers/scheduling.py"],
        ["Backend · Cost classifier", "api/services/cost_analysis_service.py · _classify_materials_with_claude"],
        ["Backend · Manual form classify", "api/routers/work_requests.py · /manual"],
        ["Frontend · Performance Analysis", "frontend/src/pages/PerformanceAnalysis.jsx"],
        ["Frontend · Scheduling + Auto-Level wizard", "frontend/src/pages/Scheduling.jsx"],
        ["Frontend · Smart Assign modal", "frontend/src/components/SmartAssignModal.jsx"],
        ["Docs relacionados", "docs/AGENTIC_CAPABILITIES.md · PRESENTACION_FUNCIONES_AGENTICAS.md · AGENTIC_SOLUTIONS_ROADMAP.md"],
    ]
    files_tbl = styled_table(
        ["Componente", "Path"],
        files_rows,
        [70 * mm, 100 * mm],
        S, header_color=SLATE,
    )
    story.append(files_tbl)
    story.append(Spacer(1, 18))

    # Footer cierre
    story.append(callout(
        "<b>Configuración VPS.</b> ANTHROPIC_API_KEY env var seteado en container ocp-backend. "
        "Modelo claude-sonnet-4-6 hardcodeado. Sin retry automático — fallback determinístico si Claude falla. "
        "Tag git de respaldo del estado actual: <b>backup-2026-04-30-crew-styled-confirm</b>.",
        INDIGO_LIGHT, INDIGO, S["BodyLeft"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Documento vivo · actualizo con feedback de Gonzalo · MAGEAM 2026", S["Footer"]))

    return story


def page_decoration(canvas, doc):
    """Header + footer en cada página."""
    canvas.saveState()
    # Footer line + page number
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(20 * mm, 18 * mm, 190 * mm, 18 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(SLATE_LIGHT)
    canvas.drawString(20 * mm, 12 * mm, "MAGEAM · Inventario IA · 2026-04-30")
    canvas.drawRightString(190 * mm, 12 * mm, f"Pág {doc.page}")
    # Top accent bar
    canvas.setFillColor(PURPLE_DARK)
    canvas.rect(0, 287 * mm, 210 * mm, 4 * mm, fill=1, stroke=0)
    canvas.restoreState()


def main():
    S = make_styles()
    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=24 * mm, bottomMargin=22 * mm,
        title="MAGEAM · Inventario funciones IA",
        author="David Cabezas",
    )
    doc.build(build(S), onFirstPage=page_decoration, onLaterPages=page_decoration)
    print(f"OK -> {OUT}")


if __name__ == "__main__":
    main()
