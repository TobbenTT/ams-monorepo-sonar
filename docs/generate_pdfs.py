"""
Generate professional PDF documentation matching the VSC Security Audit design.
Uses PyMuPDF (fitz) to create styled PDFs from markdown content.
"""

import fitz  # PyMuPDF
import re
import os
import textwrap

# ── Design Constants (matching Auditoria de Seguridad PDF) ──────────────
INDIGO = (0.310, 0.275, 0.898)          # #4F46E5 - primary accent
DARK_SLATE = (0.118, 0.161, 0.231)      # #1E293B - headings, body text
GRAY_MUTED = (0.396, 0.455, 0.545)      # #64748B - subtitles
AMBER_BG = (0.996, 0.953, 0.780)        # banner background
AMBER_TEXT = (0.573, 0.251, 0.055)      # #92400E - banner text
TABLE_HEADER_BG = (0.118, 0.161, 0.231) # dark header
TABLE_HEADER_FG = (1.0, 1.0, 1.0)       # white text
TABLE_ALT_BG = (0.973, 0.980, 0.988)    # light blue alternating
TABLE_BORDER = (0.886, 0.910, 0.941)    # #E2E8F0
CODE_BG = (0.945, 0.945, 0.960)         # light gray for code
WHITE = (1.0, 1.0, 1.0)
GREEN_OCP = (0.106, 0.369, 0.125)       # #1B5E20

# Page dimensions (A4)
PAGE_W = 595.92
PAGE_H = 841.92
MARGIN_L = 57
MARGIN_R = 540
MARGIN_T = 100
MARGIN_B = 800
CONTENT_W = MARGIN_R - MARGIN_L

# Font sizes
TITLE_SIZE = 28
SUBTITLE_SIZE = 13
H1_SIZE = 14
H2_SIZE = 12
H3_SIZE = 10.5
BODY_SIZE = 9.5
SMALL_SIZE = 8
FOOTER_SIZE = 6
CODE_SIZE = 8.5
TABLE_SIZE = 8.5


class PDFGenerator:
    def __init__(self, doc_title, doc_subtitle, lang="en"):
        self.doc = fitz.open()
        self.doc_title = doc_title
        self.doc_subtitle = doc_subtitle
        self.lang = lang
        self.page = None
        self.y = MARGIN_T
        self.page_num = 0
        self.total_pages = 0

    def _new_page(self):
        self.page = self.doc.new_page(width=PAGE_W, height=PAGE_H)
        self.page_num += 1
        self.y = MARGIN_T
        self._draw_footer_placeholder()

    def _draw_footer_placeholder(self):
        """Draw footer on every page."""
        y = PAGE_H - 30
        footer_font = fitz.Font("helv")
        # Left side
        self.page.insert_text(
            (MARGIN_L, y),
            "CONFIDENCIAL - Uso interno exclusivo",
            fontsize=FOOTER_SIZE, color=GRAY_MUTED, fontname="helv"
        )
        # Center
        center_text = "Value Strategy Consulting"
        self.page.insert_text(
            (PAGE_W / 2 - 40, y),
            center_text,
            fontsize=FOOTER_SIZE, color=GRAY_MUTED, fontname="helv"
        )
        # Second line
        self.page.insert_text(
            (MARGIN_L, y + 10),
            f"Documentacion Tecnica - OCP Maintenance AI - Mar 2026",
            fontsize=FOOTER_SIZE, color=GRAY_MUTED, fontname="helv"
        )
        # Page number (right)
        page_text = f"Pagina {self.page_num}"
        self.page.insert_text(
            (MARGIN_R - 40, y + 10),
            page_text,
            fontsize=FOOTER_SIZE, color=GRAY_MUTED, fontname="helv"
        )

    def _check_space(self, needed=40):
        if self.y + needed > MARGIN_B:
            self._new_page()
            return True
        return False

    def _draw_banner(self, text, bg_color, text_color):
        """Draw a colored banner bar across the page."""
        rect = fitz.Rect(MARGIN_L, self.y, MARGIN_R, self.y + 22)
        shape = self.page.new_shape()
        shape.draw_rect(rect)
        shape.finish(color=None, fill=bg_color)
        shape.commit()
        self.page.insert_text(
            (MARGIN_L + 8, self.y + 15),
            text, fontsize=SMALL_SIZE, fontname="hebo", color=text_color
        )
        self.y += 28

    def _draw_accent_line(self):
        """Draw a thin indigo accent line."""
        rect = fitz.Rect(MARGIN_L, self.y, MARGIN_R, self.y + 1.5)
        shape = self.page.new_shape()
        shape.draw_rect(rect)
        shape.finish(color=None, fill=INDIGO)
        shape.commit()
        self.y += 6

    def _draw_text(self, text, fontsize=BODY_SIZE, color=DARK_SLATE,
                   bold=False, indent=0, max_width=None):
        """Draw text with word wrapping."""
        fontname = "hebo" if bold else "helv"
        if max_width is None:
            max_width = CONTENT_W - indent

        # Calculate chars per line
        char_w = fontsize * 0.52
        chars_per_line = int(max_width / char_w) if char_w > 0 else 80
        if chars_per_line < 20:
            chars_per_line = 80

        lines = []
        for paragraph in text.split('\n'):
            if paragraph.strip() == '':
                lines.append('')
            else:
                wrapped = textwrap.wrap(paragraph, width=chars_per_line)
                lines.extend(wrapped if wrapped else [''])

        for line in lines:
            self._check_space(fontsize + 4)
            self.page.insert_text(
                (MARGIN_L + indent, self.y),
                line, fontsize=fontsize, fontname=fontname, color=color
            )
            self.y += fontsize + 3.5

    def _draw_table(self, headers, rows, col_widths=None):
        """Draw a styled table matching the audit PDF design."""
        if not headers:
            return

        num_cols = len(headers)
        if col_widths is None:
            col_widths = [CONTENT_W / num_cols] * num_cols

        # Ensure widths sum to content width
        total = sum(col_widths)
        col_widths = [w * CONTENT_W / total for w in col_widths]

        row_h = 21
        # Check if table fits
        total_h = row_h * (1 + len(rows))
        if self.y + min(total_h, row_h * 3) > MARGIN_B:
            self._new_page()

        shape = self.page.new_shape()

        # Draw header row
        x = MARGIN_L
        for i, (header, width) in enumerate(zip(headers, col_widths)):
            rect = fitz.Rect(x, self.y, x + width, self.y + row_h)
            shape.draw_rect(rect)
            shape.finish(color=None, fill=TABLE_HEADER_BG)
            x += width
        shape.commit()

        # Header text
        x = MARGIN_L
        for header, width in zip(headers, col_widths):
            self.page.insert_text(
                (x + 5, self.y + 14),
                str(header)[:int(width / 4.5)],
                fontsize=TABLE_SIZE, fontname="hebo", color=TABLE_HEADER_FG
            )
            x += width
        self.y += row_h

        # Draw data rows
        for row_idx, row in enumerate(rows):
            if self.y + row_h > MARGIN_B:
                self._new_page()

            shape = self.page.new_shape()
            x = MARGIN_L
            bg = TABLE_ALT_BG if row_idx % 2 == 0 else WHITE
            for width in col_widths:
                rect = fitz.Rect(x, self.y, x + width, self.y + row_h)
                shape.draw_rect(rect)
                shape.finish(color=TABLE_BORDER, fill=bg)
                x += width
            shape.commit()

            # Row text
            x = MARGIN_L
            for ci, (cell, width) in enumerate(zip(row, col_widths)):
                max_chars = int(width / 4.2)
                cell_text = str(cell)[:max_chars] if cell else ""
                self.page.insert_text(
                    (x + 5, self.y + 14),
                    cell_text,
                    fontsize=TABLE_SIZE, fontname="helv", color=DARK_SLATE
                )
                x += width
            self.y += row_h

        self.y += 8

    def _draw_code_block(self, code_text):
        """Draw a code block with gray background."""
        lines = code_text.split('\n')
        # Filter empty trailing lines
        while lines and lines[-1].strip() == '':
            lines.pop()

        line_h = CODE_SIZE + 3
        block_h = len(lines) * line_h + 16
        padding = 10

        if self.y + block_h > MARGIN_B:
            self._new_page()

        # Background
        rect = fitz.Rect(MARGIN_L + 10, self.y, MARGIN_R - 10, self.y + block_h)
        shape = self.page.new_shape()
        shape.draw_rect(rect)
        shape.finish(color=TABLE_BORDER, fill=CODE_BG)
        shape.commit()

        self.y += padding
        for line in lines:
            if self.y + line_h > MARGIN_B:
                self._new_page()
            # Truncate long lines
            display_line = line[:90] if len(line) > 90 else line
            self.page.insert_text(
                (MARGIN_L + 18, self.y + CODE_SIZE),
                display_line,
                fontsize=CODE_SIZE, fontname="cour", color=DARK_SLATE
            )
            self.y += line_h

        self.y += padding + 4

    def _draw_cover_page(self, meta_rows):
        """Draw the cover page matching the audit PDF style."""
        self._new_page()

        # Top confidential banner
        self._draw_banner(
            "DOCUMENTO CONFIDENCIAL - CLASIFICACION: USO INTERNO - NO DISTRIBUIR EXTERNAMENTE",
            AMBER_BG, AMBER_TEXT
        )

        # Company name
        self.y += 20
        self.page.insert_text(
            (MARGIN_L, self.y),
            "VALUE STRATEGY CONSULTING",
            fontsize=11, fontname="helv", color=GRAY_MUTED
        )

        # Main title
        self.y += 40
        self.page.insert_text(
            (MARGIN_L, self.y),
            self.doc_title,
            fontsize=TITLE_SIZE, fontname="hebo", color=INDIGO
        )

        # Subtitle
        self.y += 25
        self.page.insert_text(
            (MARGIN_L, self.y),
            self.doc_subtitle,
            fontsize=SUBTITLE_SIZE, fontname="helv", color=GRAY_MUTED
        )

        # Accent line
        self.y += 20
        self._draw_accent_line()

        # Metadata table
        self.y += 20
        self._draw_table(
            ["Campo", "Detalle"],
            meta_rows,
            col_widths=[120, 360]
        )

        # OCP Green accent box at bottom
        self.y = PAGE_H - 120
        rect = fitz.Rect(MARGIN_L, self.y, MARGIN_R, self.y + 50)
        shape = self.page.new_shape()
        shape.draw_rect(rect)
        shape.finish(color=None, fill=GREEN_OCP)
        shape.commit()

        self.page.insert_text(
            (MARGIN_L + 15, self.y + 22),
            "OCP Maintenance AI Platform",
            fontsize=14, fontname="hebo", color=WHITE
        )
        self.page.insert_text(
            (MARGIN_L + 15, self.y + 38),
            "Built for reliability, designed to scale.",
            fontsize=10, fontname="helv", color=(0.8, 1.0, 0.8)
        )

    def _draw_toc_page(self, sections):
        """Draw a table of contents page."""
        self._new_page()
        self.y = MARGIN_T
        self._draw_text("Tabla de Contenidos" if self.lang == "es"
                        else "Table of Contents" if self.lang == "en"
                        else "جدول المحتويات",
                        fontsize=H1_SIZE, bold=True, color=INDIGO)
        self._draw_accent_line()
        self.y += 10

        for i, section in enumerate(sections):
            self._check_space(18)
            # Section already has number like "1. Overview", just display it
            # Remove leading number if present to avoid duplication
            clean_section = re.sub(r'^\d+\.\s*', '', section)
            num = f"{i + 1}."
            self.page.insert_text(
                (MARGIN_L + 10, self.y),
                num, fontsize=BODY_SIZE, fontname="hebo", color=INDIGO
            )
            self.page.insert_text(
                (MARGIN_L + 35, self.y),
                clean_section, fontsize=BODY_SIZE, fontname="helv", color=DARK_SLATE
            )
            # Dotted leader
            dots_x = MARGIN_L + 40 + len(clean_section) * 4.5
            if dots_x < MARGIN_R - 30:
                dots = "." * int((MARGIN_R - 30 - dots_x) / 3)
                self.page.insert_text(
                    (dots_x, self.y),
                    dots, fontsize=BODY_SIZE, fontname="helv", color=(0.8, 0.8, 0.8)
                )
            self.y += 16

    def parse_and_render_markdown(self, md_content):
        """Parse markdown content and render to PDF."""
        lines = md_content.split('\n')
        i = 0
        in_code_block = False
        code_buffer = []
        in_table = False
        table_headers = []
        table_rows = []
        skip_inline_toc = False

        # First pass: extract section titles for TOC
        sections = []
        for line in lines:
            m = re.match(r'^## (\d+\.\s+.+)', line)
            if m:
                sections.append(m.group(1))

        # Draw TOC
        if sections:
            self._draw_toc_page(sections)

        while i < len(lines):
            line = lines[i]

            # Code blocks
            if line.strip().startswith('```'):
                if in_code_block:
                    # End code block
                    self._draw_code_block('\n'.join(code_buffer))
                    code_buffer = []
                    in_code_block = False
                else:
                    # Flush any pending table
                    if in_table:
                        self._draw_table(table_headers, table_rows)
                        in_table = False
                        table_headers = []
                        table_rows = []
                    in_code_block = True
                i += 1
                continue

            if in_code_block:
                code_buffer.append(line)
                i += 1
                continue

            # Tables
            if '|' in line and line.strip().startswith('|'):
                cells = [c.strip() for c in line.strip().strip('|').split('|')]
                # Clean markdown from cells
                cells = [re.sub(r'\*\*(.+?)\*\*', r'\1', c) for c in cells]
                cells = [re.sub(r'`(.+?)`', r'\1', c) for c in cells]
                # Check if separator row
                if all(re.match(r'^[-:]+$', c) for c in cells):
                    i += 1
                    continue
                if not in_table:
                    in_table = True
                    table_headers = cells
                else:
                    table_rows.append(cells)
                i += 1
                continue
            else:
                if in_table:
                    # Auto-size columns
                    num_cols = len(table_headers)
                    if num_cols > 0:
                        # Smart column widths
                        widths = []
                        for ci in range(num_cols):
                            max_len = len(table_headers[ci]) if ci < len(table_headers) else 5
                            for row in table_rows:
                                if ci < len(row):
                                    max_len = max(max_len, len(str(row[ci])))
                            widths.append(max(max_len, 5))
                        total = sum(widths)
                        col_widths = [w * CONTENT_W / total for w in widths]
                        self._draw_table(table_headers, table_rows, col_widths)
                    in_table = False
                    table_headers = []
                    table_rows = []

            # Skip content in inline TOC section
            if skip_inline_toc:
                # Stop skipping when we hit a real section (## with number)
                if re.match(r'^## \d+', line) or re.match(r'^---', line.strip()):
                    skip_inline_toc = False
                else:
                    i += 1
                    continue

            # Empty lines
            if line.strip() == '':
                self.y += 6
                i += 1
                continue

            # Horizontal rule
            if line.strip() == '---':
                self._check_space(15)
                self._draw_accent_line()
                i += 1
                continue

            # H1 (#) — skip the main title since we have a cover page
            m = re.match(r'^# (.+)', line)
            if m:
                # Skip the first H1 (document title, already on cover)
                i += 1
                continue

            # H2 (##)
            m = re.match(r'^## (.+)', line)
            if m:
                title = m.group(1).strip()
                # Skip "Tabla de Contenidos" / "Table of Contents" — we have our own TOC
                lower_title = title.lower()
                if 'tabla de contenidos' in lower_title or 'table of contents' in lower_title or 'جدول المحتويات' in lower_title:
                    # Skip the markdown TOC section heading and its content
                    skip_inline_toc = True
                    i += 1
                    continue
                skip_inline_toc = False
                self._check_space(60)
                if self.y > MARGIN_T + 100:
                    self._new_page()
                self.y = MARGIN_T
                self._draw_text(title, fontsize=H1_SIZE, color=DARK_SLATE, bold=True)
                self._draw_accent_line()
                self.y += 8
                i += 1
                continue

            # H3 (###)
            m = re.match(r'^### (.+)', line)
            if m:
                self._check_space(40)
                self.y += 6
                title = m.group(1).strip()
                self._draw_text(title, fontsize=H2_SIZE, color=INDIGO, bold=True)
                self.y += 4
                i += 1
                continue

            # H4 (####)
            m = re.match(r'^#### (.+)', line)
            if m:
                self._check_space(30)
                self.y += 4
                title = m.group(1).strip()
                self._draw_text(title, fontsize=H3_SIZE, color=DARK_SLATE, bold=True)
                self.y += 3
                i += 1
                continue

            # Blockquote
            if line.strip().startswith('>'):
                text = re.sub(r'^>\s*', '', line.strip())
                text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
                if text.strip():
                    self._check_space(20)
                    # Draw left accent bar
                    shape = self.page.new_shape()
                    shape.draw_rect(fitz.Rect(MARGIN_L + 5, self.y - 2, MARGIN_L + 8, self.y + 12))
                    shape.finish(color=None, fill=INDIGO)
                    shape.commit()
                    self._draw_text(text, fontsize=BODY_SIZE, color=GRAY_MUTED, indent=15)
                i += 1
                continue

            # List items
            m = re.match(r'^(\s*)[-*]\s+(.+)', line)
            if m:
                indent_level = len(m.group(1)) // 2
                text = m.group(2).strip()
                text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
                text = re.sub(r'`(.+?)`', r'\1', text)
                self._check_space(16)
                indent = 15 + indent_level * 15
                # Bullet
                self.page.insert_text(
                    (MARGIN_L + indent - 8, self.y),
                    ".", fontsize=14, fontname="hebo", color=INDIGO
                )
                self._draw_text(text, fontsize=BODY_SIZE, indent=indent)
                i += 1
                continue

            # Numbered list
            m = re.match(r'^(\d+)\.\s+(.+)', line)
            if m:
                num = m.group(1)
                text = m.group(2).strip()
                text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
                text = re.sub(r'`(.+?)`', r'\1', text)
                self._check_space(16)
                self.page.insert_text(
                    (MARGIN_L + 10, self.y),
                    f"{num}.", fontsize=BODY_SIZE, fontname="hebo", color=INDIGO
                )
                self._draw_text(text, fontsize=BODY_SIZE, indent=28)
                i += 1
                continue

            # Checklist
            m = re.match(r'^- \[[ x]\]\s+(.+)', line)
            if m:
                text = m.group(1).strip()
                text = re.sub(r'`(.+?)`', r'\1', text)
                self._check_space(16)
                # Checkbox
                shape = self.page.new_shape()
                rect = fitz.Rect(MARGIN_L + 10, self.y - 8, MARGIN_L + 18, self.y)
                shape.draw_rect(rect)
                shape.finish(color=DARK_SLATE, fill=WHITE)
                shape.commit()
                self._draw_text(text, fontsize=BODY_SIZE, indent=25)
                i += 1
                continue

            # Skip inline TOC lines (markdown links to anchors)
            if re.match(r'^\d+\.\s*\[.+\]\(#.+\)', line.strip()):
                i += 1
                continue

            # Regular paragraph
            text = line.strip()
            # Clean markdown formatting
            text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
            text = re.sub(r'`(.+?)`', r'\1', text)
            # Clean markdown links [text](url)
            text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
            if text:
                self._draw_text(text, fontsize=BODY_SIZE)
            i += 1

        # Flush any remaining table
        if in_table and table_headers:
            self._draw_table(table_headers, table_rows)

    def _draw_final_page(self):
        """Draw the closing page."""
        self._new_page()
        self.y = PAGE_H / 2 - 80

        # Green OCP box
        rect = fitz.Rect(MARGIN_L + 40, self.y, MARGIN_R - 40, self.y + 120)
        shape = self.page.new_shape()
        shape.draw_rect(rect)
        shape.finish(color=None, fill=GREEN_OCP)
        shape.commit()

        self.page.insert_text(
            (MARGIN_L + 65, self.y + 35),
            "OCP Maintenance AI Platform",
            fontsize=18, fontname="hebo", color=WHITE
        )
        self.page.insert_text(
            (MARGIN_L + 80, self.y + 60),
            "Documentacion Tecnica Completa",
            fontsize=12, fontname="helv", color=(0.8, 1.0, 0.8)
        )
        self.page.insert_text(
            (MARGIN_L + 100, self.y + 85),
            "Evaluado por Value Strategy Consulting",
            fontsize=10, fontname="helv", color=(0.8, 1.0, 0.8)
        )

        self.y += 150
        self.page.insert_text(
            (PAGE_W / 2 - 120, self.y),
            "Fin del documento",
            fontsize=10, fontname="helv", color=GRAY_MUTED
        )
        self.y += 20
        disclaimer = (
            "Este documento contiene informacion tecnica sobre la plataforma OCP Maintenance AI. "
            "Su distribucion esta restringida al equipo de desarrollo y direccion."
        )
        self._draw_text(disclaimer, fontsize=SMALL_SIZE, color=GRAY_MUTED, indent=40,
                        max_width=CONTENT_W - 80)

    def _update_page_numbers(self):
        """Update all page footers with total page count."""
        total = len(self.doc)
        for i in range(total):
            page = self.doc[i]
            y = PAGE_H - 20
            # Overwrite page number area with white rect first
            rect = fitz.Rect(MARGIN_R - 55, y - 8, MARGIN_R, y + 5)
            shape = page.new_shape()
            shape.draw_rect(rect)
            shape.finish(color=None, fill=WHITE)
            shape.commit()
            page.insert_text(
                (MARGIN_R - 55, y),
                f"Pagina {i + 1} de {total}",
                fontsize=FOOTER_SIZE, fontname="helv", color=GRAY_MUTED
            )

    def generate(self, md_content, output_path, meta_rows):
        """Generate the full PDF."""
        print(f"  Generating: {output_path}")

        # Cover page
        self._draw_cover_page(meta_rows)

        # Content pages
        self.parse_and_render_markdown(md_content)

        # Final page
        self._draw_final_page()

        # Update page numbers with totals
        self._update_page_numbers()

        # Save
        self.doc.save(output_path)
        self.doc.close()
        print(f"  Done: {self.page_num} pages -> {output_path}")


def generate_all_pdfs():
    """Generate PDFs for all 3 language versions."""
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(docs_dir)

    configs = [
        {
            "lang": "en",
            "md_file": os.path.join(docs_dir, "PROJECT_DOCUMENTATION_EN.md"),
            "pdf_file": os.path.join(docs_dir, "OCP_Maintenance_AI_Documentation_EN.pdf"),
            "title": "Technical Documentation",
            "subtitle": "OCP Maintenance AI Platform - Enterprise Maintenance Management System",
            "meta": [
                ["Document", "DOC-OCP-2026-001"],
                ["Date", "March 2026"],
                ["Version", "1.0 - Final"],
                ["Classification", "Confidential - Internal Use"],
                ["Scope", "Full source code, Docker infrastructure, API"],
                ["Methodology", "Manual code review + static analysis"],
                ["System", "FastAPI + React 19 + PostgreSQL + Docker"],
                ["Evaluated by", "Value Strategy Consulting (VSC)"],
            ],
        },
        {
            "lang": "es",
            "md_file": os.path.join(docs_dir, "PROJECT_DOCUMENTATION_ES.md"),
            "pdf_file": os.path.join(docs_dir, "OCP_Maintenance_AI_Documentation_ES.pdf"),
            "title": "Documentacion Tecnica",
            "subtitle": "OCP Maintenance AI Platform - Sistema Empresarial de Gestion de Mantenimiento",
            "meta": [
                ["Documento", "DOC-OCP-2026-001"],
                ["Fecha", "Marzo 2026"],
                ["Version", "1.0 - Final"],
                ["Clasificacion", "Confidencial - Uso Interno"],
                ["Alcance", "Codigo fuente completo, infraestructura Docker, API"],
                ["Metodologia", "Revision manual de codigo + analisis estatico"],
                ["Sistema", "FastAPI + React 19 + PostgreSQL + Docker"],
                ["Evaluado por", "Value Strategy Consulting (VSC)"],
            ],
        },
        {
            "lang": "ar",
            "md_file": os.path.join(docs_dir, "PROJECT_DOCUMENTATION_AR.md"),
            "pdf_file": os.path.join(docs_dir, "OCP_Maintenance_AI_Documentation_AR.pdf"),
            "title": "Technical Documentation",
            "subtitle": "OCP Maintenance AI Platform - Documentacion Tecnica (AR)",
            "meta": [
                ["Document", "DOC-OCP-2026-001"],
                ["Date", "March 2026"],
                ["Version", "1.0 - Final"],
                ["Classification", "Confidential - Internal Use"],
                ["Scope", "Full source code, Docker infrastructure, API"],
                ["Methodology", "Manual code review + static analysis"],
                ["System", "FastAPI + React 19 + PostgreSQL + Docker"],
                ["Evaluated by", "Value Strategy Consulting (VSC)"],
            ],
        },
    ]

    for cfg in configs:
        md_path = cfg["md_file"]
        if not os.path.exists(md_path):
            print(f"  SKIP: {md_path} not found")
            continue

        with open(md_path, "r", encoding="utf-8") as f:
            md_content = f.read()

        gen = PDFGenerator(cfg["title"], cfg["subtitle"], cfg["lang"])
        gen.generate(md_content, cfg["pdf_file"], cfg["meta"])

    print("\nAll PDFs generated successfully!")


if __name__ == "__main__":
    generate_all_pdfs()
