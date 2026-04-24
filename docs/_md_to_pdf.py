"""Convertidor md → PDF usando reportlab + markdown.
Uso: python _md_to_pdf.py input.md output.pdf
"""
import sys, re
import markdown as md_lib
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)


def build_styles():
    ss = getSampleStyleSheet()
    base = ss['BodyText']
    base.fontName = 'Helvetica'
    base.fontSize = 10
    base.leading = 14
    base.spaceAfter = 6

    styles = {
        'h1': ParagraphStyle('h1', parent=ss['Heading1'], fontSize=18, leading=22,
                             textColor=HexColor('#1B5E20'), spaceBefore=14, spaceAfter=8, fontName='Helvetica-Bold'),
        'h2': ParagraphStyle('h2', parent=ss['Heading2'], fontSize=14, leading=18,
                             textColor=HexColor('#2E7D32'), spaceBefore=12, spaceAfter=6, fontName='Helvetica-Bold'),
        'h3': ParagraphStyle('h3', parent=ss['Heading3'], fontSize=12, leading=16,
                             textColor=HexColor('#424242'), spaceBefore=10, spaceAfter=4, fontName='Helvetica-Bold'),
        'body': base,
        'bullet': ParagraphStyle('bullet', parent=base, leftIndent=14, bulletIndent=2, spaceAfter=2),
        'code': ParagraphStyle('code', parent=base, fontName='Courier', fontSize=9,
                               backColor=HexColor('#F3F4F6'), borderPadding=4),
    }
    return styles


def md_inline_to_rl(txt):
    """Convierte markdown inline (bold, italic, code, links) a tags RL."""
    # Escapar & < > primero
    txt = txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Code inline `x`
    txt = re.sub(r'`([^`]+)`', r'<font face="Courier" backColor="#F3F4F6"> \1 </font>', txt)
    # Bold **x**
    txt = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', txt)
    # Italic *x*
    txt = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<i>\1</i>', txt)
    return txt


def md_to_flowables(md_text, styles):
    lines = md_text.split('\n')
    out = []
    i = 0
    in_table = False
    table_rows = []
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln:
            if in_table and table_rows:
                out.append(render_table(table_rows))
                table_rows = []
                in_table = False
            out.append(Spacer(1, 4))
            i += 1
            continue
        # Tabla markdown
        if ln.startswith('|') and '|' in ln[1:]:
            cells = [c.strip() for c in ln.strip('|').split('|')]
            if all(re.match(r'^:?-+:?$', c) for c in cells):
                i += 1
                in_table = True
                continue
            table_rows.append(cells)
            in_table = True
            i += 1
            continue
        if in_table and table_rows:
            out.append(render_table(table_rows))
            table_rows = []
            in_table = False
        # Headers
        m = re.match(r'^(#{1,3})\s+(.+)$', ln)
        if m:
            level = len(m.group(1))
            style_key = f'h{level}'
            out.append(Paragraph(md_inline_to_rl(m.group(2)), styles[style_key]))
            i += 1
            continue
        # HR
        if re.match(r'^-{3,}$', ln):
            out.append(HRFlowable(width='100%', thickness=0.5, color=HexColor('#D1D5DB'),
                                  spaceBefore=6, spaceAfter=6))
            i += 1
            continue
        # Bullet
        if ln.lstrip().startswith(('- ', '* ')):
            indent = len(ln) - len(ln.lstrip())
            txt = ln.lstrip()[2:]
            bullet_style = ParagraphStyle('b', parent=styles['bullet'],
                                          leftIndent=14 + indent * 10)
            out.append(Paragraph(f'• {md_inline_to_rl(txt)}', bullet_style))
            i += 1
            continue
        # Numbered list
        m = re.match(r'^(\s*)(\d+)\.\s+(.+)$', ln)
        if m:
            indent = len(m.group(1))
            num = m.group(2)
            txt = m.group(3)
            lst = ParagraphStyle('n', parent=styles['bullet'],
                                 leftIndent=14 + indent * 10)
            out.append(Paragraph(f'{num}. {md_inline_to_rl(txt)}', lst))
            i += 1
            continue
        # Párrafo normal
        out.append(Paragraph(md_inline_to_rl(ln), styles['body']))
        i += 1
    if in_table and table_rows:
        out.append(render_table(table_rows))
    return out


def render_table(rows):
    # Escapar cada celda
    safe = [[re.sub(r'<[^>]+>', '', c).replace('&', '&amp;') for c in r] for r in rows]
    # Convertir a Paragraphs para wrap
    body = getSampleStyleSheet()['BodyText']
    small = ParagraphStyle('s', parent=body, fontSize=8, leading=10)
    header_style = ParagraphStyle('h', parent=small, fontName='Helvetica-Bold', textColor=HexColor('#FFFFFF'))
    data = []
    for i, r in enumerate(safe):
        style = header_style if i == 0 else small
        data.append([Paragraph(c, style) for c in r])
    tbl = Table(data, hAlign='LEFT', colWidths=None)
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1B5E20')),
        ('GRID', (0, 0), (-1, -1), 0.25, HexColor('#D1D5DB')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return tbl


def convert(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        text = f.read()
    styles = build_styles()
    flowables = md_to_flowables(text, styles)
    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                            rightMargin=2 * cm, leftMargin=2 * cm,
                            topMargin=2 * cm, bottomMargin=2 * cm,
                            title=md_path.split('/')[-1].replace('.md', ''))
    doc.build(flowables)
    print(f'OK -> {pdf_path}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Uso: python _md_to_pdf.py input.md output.pdf')
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
