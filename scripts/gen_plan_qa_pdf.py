"""Genera plan-qa-magda.pdf a partir del markdown — formato presentable para Magda."""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "Ayudas" / "plan-qa-magda.pdf"

# ── Estilos ──────────────────────────────────────────────────────────
styles = getSampleStyleSheet()
EMERALD = colors.HexColor("#10b981")
INDIGO = colors.HexColor("#4f46e5")
SLATE_900 = colors.HexColor("#0f172a")
SLATE_700 = colors.HexColor("#334155")
SLATE_500 = colors.HexColor("#64748b")
SLATE_100 = colors.HexColor("#f1f5f9")
SLATE_50 = colors.HexColor("#f8fafc")
ROSE_500 = colors.HexColor("#f43f5e")
AMBER_500 = colors.HexColor("#f59e0b")

H1 = ParagraphStyle(
    "H1", parent=styles["Heading1"], fontSize=22, leading=28,
    textColor=SLATE_900, spaceAfter=12, spaceBefore=0, alignment=TA_LEFT,
)
H2 = ParagraphStyle(
    "H2", parent=styles["Heading2"], fontSize=16, leading=20,
    textColor=INDIGO, spaceAfter=8, spaceBefore=16, alignment=TA_LEFT,
)
H3 = ParagraphStyle(
    "H3", parent=styles["Heading3"], fontSize=12, leading=16,
    textColor=SLATE_700, spaceAfter=4, spaceBefore=10, alignment=TA_LEFT,
)
BODY = ParagraphStyle(
    "Body", parent=styles["BodyText"], fontSize=10, leading=14,
    textColor=SLATE_900, spaceAfter=6, alignment=TA_JUSTIFY,
)
BULLET = ParagraphStyle(
    "Bullet", parent=BODY, leftIndent=14, bulletIndent=4, spaceAfter=2,
)
SMALL = ParagraphStyle(
    "Small", parent=BODY, fontSize=8, leading=11, textColor=SLATE_500,
)
NOTE = ParagraphStyle(
    "Note", parent=BODY, fontSize=9, leading=12,
    textColor=SLATE_700, backColor=SLATE_50,
    borderColor=AMBER_500, borderWidth=0, leftIndent=8,
    spaceBefore=6, spaceAfter=6,
)

# ── Documento ────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    str(OUT), pagesize=A4,
    leftMargin=2 * cm, rightMargin=2 * cm,
    topMargin=1.8 * cm, bottomMargin=1.8 * cm,
    title="Plan Ambiente QA — Propuesta",
    author="David Cabezas (VSC)",
)

S = []

# ── Header ──────────────────────────────────────────────────────────
S.append(Paragraph("Plan ambiente de <b>QA</b>", H1))
S.append(Paragraph(
    "Propuesta para Magdalena · David Cabezas (VSC) · 2026-05-13",
    ParagraphStyle("subtitle", parent=BODY, fontSize=10,
                   textColor=SLATE_500, spaceAfter=12),
))
S.append(HRFlowable(width="100%", color=EMERALD, thickness=2,
                    spaceBefore=2, spaceAfter=14))

# ── Contexto ────────────────────────────────────────────────────────
S.append(Paragraph("Contexto", H2))
S.append(Paragraph(
    "La VPS de producción <b>mageam.com</b> hospeda los <b>12 proyectos VSC</b> "
    "(AMS-MageAM, OR-System, SecondBrain, Yogi Hostels, Codelco, Inteligencia "
    "de correos, etc.). De todos ellos, <b>AMS-MageAM es el más pesado</b> "
    "con ~12 GB ocupados.",
    BODY,
))
S.append(Paragraph(
    "Hasta hoy todos los cambios se deployan directo a producción. Esto ya no "
    "es viable: un bug durante una demo con Goldfields o cualquier otro "
    "cliente nos cuesta credibilidad. <b>Necesitamos un ambiente intermedio "
    "donde Jorge, José o el cliente validen los cambios ANTES de tocar prod.</b>",
    BODY,
))

# ── Plan A ──────────────────────────────────────────────────────────
S.append(Spacer(1, 8))
S.append(Paragraph("Plan A — QA en mismo VPS", H2))
S.append(Paragraph(
    "Stack paralelo de contenedores Docker en la misma VPS de producción. "
    "Cada proyecto tendría sus contenedores <i>-prod</i> y <i>-qa</i> "
    "corriendo lado a lado, con subdominios distintos.",
    BODY,
))

t_a = Table([
    ["Concepto", "Costo / Detalle"],
    ["Hosting", "$0/mes (reuso VPS actual)"],
    ["Setup inicial", "30-45 min"],
    ["RAM libre tras setup", "4.4 GB (sobra)"],
    ["Disco libre tras setup", "37 GB (entra pero apretado)"],
    ["Mantenimiento", "Mínimo"],
], colWidths=[5 * cm, 11 * cm])
t_a.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), SLATE_900),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SLATE_50]),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
S.append(t_a)

S.append(Paragraph("<b>Pros</b>", H3))
for txt in [
    "Cero costo recurrente",
    "Setup rápido (mismo Docker, mismo nginx)",
    "Reusa toda la infraestructura existente",
]:
    S.append(Paragraph(f"• {txt}", BULLET))

S.append(Paragraph("<b>Contras</b>", H3))
for txt in [
    "AMS es el proyecto más pesado del VPS — duplicarlo aprieta el disco de prod",
    "Si QA revienta el disco con un build mal cancelado, <b>prod cae también</b>",
    "Mismo Docker daemon: un crash afecta los dos ambientes",
    "Misma IP — clientes que monitorean el host lo ven todo junto",
    "No escala más allá de 2-3 proyectos en QA simultáneo",
    "Riesgo durante demos: prod y QA compiten CPU/RAM",
]:
    S.append(Paragraph(f"• {txt}", BULLET))

# ── Plan B ──────────────────────────────────────────────────────────
S.append(PageBreak())
S.append(Paragraph("Plan B — VPS dedicada para QA de TODOS los proyectos", H2))
recom = Paragraph(
    "<font color='#10b981'><b>★ Recomendado por David</b></font>",
    ParagraphStyle("rec", parent=BODY, fontSize=11, alignment=TA_LEFT,
                   spaceAfter=8),
)
S.append(recom)

S.append(Paragraph(
    "Comprar una VPS chica (Hostinger KVM 1) <b>dedicada exclusivamente al "
    "ambiente QA de los 12 proyectos VSC</b>. La VPS de producción queda "
    "intocable hasta que el cliente/equipo apruebe los cambios en QA.",
    BODY,
))

t_b = Table([
    ["Concepto", "Costo / Detalle"],
    ["Hostinger KVM 1", "1 vCPU · 4 GB RAM · 50 GB NVMe · 4 TB BW"],
    ["Año 1 (promo)", "$83 USD (~$6.92/mes)"],
    ["Año 2+", "$144/año Hostinger · o $60/año si migramos a Hetzner"],
    ["Setup inicial multi-proyecto", "2-3 horas"],
    ["Mantenimiento mensual", "~30 min (updates, monitoring)"],
    ["Capacidad", "Los 12 proyectos VSC con margen"],
], colWidths=[5 * cm, 11 * cm])
t_b.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), EMERALD),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SLATE_50]),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
S.append(t_b)

# ── Flujo de trabajo ────────────────────────────────────────────────
S.append(Paragraph("Flujo de trabajo propuesto", H3))
S.append(Paragraph(
    "El equipo de desarrollo nunca toca producción directamente. Todo cambio "
    "pasa primero por QA, donde Magda, el cliente o el equipo validan. <b>"
    "Producción solo se actualiza con lo que ya fue aceptado en QA</b>.",
    BODY,
))

flujo = Table([
    ["1", "Desarrollador hace cambio", "push a branch qa"],
    ["2", "Auto-deploy a VPS QA", "qa.proyecto.com actualizado"],
    ["3", "Magda / cliente / equipo validan", "prueban en qa.*"],
    ["4", "Si aprueban", "promote-to-prod.sh → prod actualizada"],
    ["5", "Si rechazan", "ajustes en branch qa, repetir"],
], colWidths=[0.8 * cm, 6.5 * cm, 8.7 * cm])
flujo.setStyle(TableStyle([
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("BACKGROUND", (0, 0), (0, -1), INDIGO),
    ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ("ROWBACKGROUNDS", (1, 0), (-1, -1), [colors.white, SLATE_50]),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
S.append(flujo)

S.append(Spacer(1, 6))
S.append(Paragraph(
    "<b>Producción nunca se toca sin paso previo por QA aprobado.</b> "
    "Es imposible romper prod por error de implementación durante una "
    "demo: cada cambio pasa por validación humana antes de promoverse.",
    NOTE,
))

S.append(Paragraph("<b>Pros</b>", H3))
for txt in [
    "Aislamiento real: lo que pase en QA NO afecta prod (otro hardware, otra IP)",
    "Escalable: los 12 proyectos VSC tienen su espejo QA sin saturar prod",
    "Permite probar refactors agresivos sin riesgo (ej: bajar imagen Docker AMS de 9 GB a 3 GB)",
    "Cliente / Magda pueden ver qa.mageam.com con cambios sin afectar la demo de prod",
    "Si el disco QA se llena por basura de tests, <b>prod sigue intacta</b>",
    "IP separada → mejor para reputación, rate limits, integraciones SAP de prueba",
    "Si en año 2 baja el costo, migramos a Hetzner por $5/mes",
]:
    S.append(Paragraph(f"• {txt}", BULLET))

S.append(Paragraph("<b>Contras</b>", H3))
for txt in [
    "Costo recurrente: $83 año 1, $144/año desde año 2 (Hostinger)",
    "Setup inicial más largo (2-3 hs vs 30 min)",
    "Mantenimiento doble (updates, certs SSL, backups)",
]:
    S.append(Paragraph(f"• {txt}", BULLET))

# ── Comparación ─────────────────────────────────────────────────────
S.append(PageBreak())
S.append(Paragraph("Comparación rápida", H2))

comp = Table([
    ["Criterio", "Plan A — Mismo VPS", "Plan B — VPS dedicada"],
    ["Costo año 1", "$0", "$83"],
    ["Costo año 2+", "$0", "$144/año · o $60/año Hetzner"],
    ["Aislamiento prod", "Solo lógico (mismo Docker)", "Real (otro hardware)"],
    ["Riesgo de romper prod desde QA", "Medio-alto", "Cero"],
    ["Setup", "30-45 min", "2-3 hs"],
    ["Escalabilidad", "Hasta 2-3 proyectos", "Los 12 proyectos VSC"],
    ["Soporte a refactors pesados", "Riesgoso", "Sin riesgo"],
    ["Multi-proyecto QA", "Limitado", "Sí"],
    ["Demos paralelas (prod + QA cambiando)", "Limitado", "Sí"],
], colWidths=[6 * cm, 4.8 * cm, 5.2 * cm])
comp.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), SLATE_900),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, 0), 10),
    ("FONTSIZE", (0, 1), (-1, -1), 9),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SLATE_50]),
    ("BACKGROUND", (2, 1), (2, -1), colors.HexColor("#ecfdf5")),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
S.append(comp)

# ── Recomendación ───────────────────────────────────────────────────
S.append(Spacer(1, 14))
S.append(Paragraph("Recomendación de David", H2))
S.append(Paragraph(
    "<b>Plan B</b>. La VPS QA cuesta $83 el primer año ($6.92/mes), y a cambio:",
    BODY,
))
for txt in [
    "Aislamos los 12 proyectos VSC de la VPS de producción",
    "Magda y el cliente pueden validar antes de que toque producción",
    "AMS, que es el más pesado, deja de comprimir el disco de los demás proyectos",
    "Producción queda blindada — solo actualiza con lo aprobado",
    "Si en año 2 lo seguimos usando, migramos a Hetzner por $5/mes (más barato y mejor hardware)",
]:
    S.append(Paragraph(f"• {txt}", BULLET))

S.append(Paragraph(
    "El costo real comparado con UN error en demo con Goldfields o el tiempo "
    "perdido arreglando prod en hora pico → <b>$83/año es ridículamente barato "
    "como seguro</b>.",
    NOTE,
))

# ── Próximos pasos ──────────────────────────────────────────────────
S.append(Spacer(1, 10))
S.append(Paragraph("Próximos pasos si Magda aprueba Plan B", H2))
pasos = Table([
    ["1", "Magdalena autoriza el gasto"],
    ["2", "David compra el KVM 1 en Hostinger (~5 min)"],
    ["3", "David pasa IP + DNS al equipo técnico"],
    ["4", "Setup multi-proyecto en VPS QA (2-3 hs)"],
    ["5", "Pilotamos primero AMS-QA, después promovemos a los otros 11 proyectos"],
], colWidths=[0.8 * cm, 15.2 * cm])
pasos.setStyle(TableStyle([
    ("FONTSIZE", (0, 0), (-1, -1), 10),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("BACKGROUND", (0, 0), (0, -1), EMERALD),
    ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ("ROWBACKGROUNDS", (1, 0), (-1, -1), [colors.white, SLATE_50]),
    ("GRID", (0, 0), (-1, -1), 0.3, SLATE_500),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
S.append(pasos)

# ── Footer ──────────────────────────────────────────────────────────
S.append(Spacer(1, 14))
S.append(HRFlowable(width="100%", color=SLATE_500, thickness=0.5))
S.append(Paragraph(
    "Documento preparado por David Cabezas (VSC) · valuestrategyconsulting.com · "
    "2026-05-13",
    SMALL,
))

# ── Build ───────────────────────────────────────────────────────────
doc.build(S)
print(f"OK · PDF generado en {OUT}")
print(f"   {OUT.stat().st_size / 1024:.1f} KB")
