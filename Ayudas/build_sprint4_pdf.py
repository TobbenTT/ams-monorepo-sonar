"""Generate a PDF report of Sprint 4 changes grouped by ticket."""
from __future__ import annotations
import subprocess
import re
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, grey
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
)
from reportlab.lib.enums import TA_LEFT

ROOT = Path(r"c:\Users\Tobbe\Downloads\Practica\AMS-Production")
OUT = ROOT / "Ayudas" / "Sprint4_Cambios_por_Tarea.pdf"

# Ordered from SF-343 up; map ticket -> (title, commit hash short)
TICKETS = [
    ("SF-343", "VoiceCapture Pro / Captura por Voz Inteligente", "2575948"),
    ("SF-344", "AutoScheduler / Programador Semanal Automático", "93f9c89"),
    ("SF-345", "EquipmentDoctor / Doctor del Equipo", "d0bc03c"),
    ("SF-346", "SmartBacklog / Backlog Inteligente Priorizado", "186df7f"),
    ("SF-349", "SafetyChecklist Genius / Listas de Verificación Inteligentes", "93b4275"),
    ("SF-350", "KPI Watchdog / Vigía de KPIs", "e6448a1"),
    ("SF-351", "One-Click Executive Report / Reporte Ejecutivo con Un Click", "d4973ff"),
    ("SF-352", "Chronic Failure Detector / Detector de Fallas Crónicas", "a24dd14"),
    ("SF-353..370", "Batch T2/T3: Material Readiness, RCM, Shift Handover, SAP Sync, Budget, Post-Learning, WO Router, Defect Tracker, Predictive Health, Shutdown Optimizer, Compliance, Digital Twin, Knowledge, Spare Parts Forecast, Contractor, Energy, Multi-Site, Auto-RCA", "2f287b1"),
    ("SF-355", "Shift Handover Assistant — UI móvil", "3edca53"),
    ("SF-352 / 357", "Budget Sentinel + Chronic Failures — botones ExecutiveView", "a87d786"),
    ("SF-356..370", "AgentQuickActions bar — 12 agentes T2/T3 wireados en ExecutiveView", "6be7199"),
    ("SF-212 / SF-213", "IA Valor Agregado — Planner Autofill + Duplicate Check", "f97351f"),
]


def run(*args: str) -> str:
    r = subprocess.run(list(args), capture_output=True, text=True, cwd=ROOT, encoding="utf-8", errors="replace")
    return r.stdout


def commit_data(sha: str) -> dict:
    full = run("git", "show", "--stat", "--no-color", f"--pretty=format:%H%n%an%n%ad%n%s%n---BODY---%n%b%n---END---", "--date=short", sha)
    lines = full.splitlines()
    hash_ = lines[0] if lines else sha
    author = lines[1] if len(lines) > 1 else ""
    date_ = lines[2] if len(lines) > 2 else ""
    subject = lines[3] if len(lines) > 3 else ""
    body_lines = []
    stat_lines = []
    in_body = False
    in_stat = False
    for l in lines[4:]:
        if l == "---BODY---":
            in_body = True
            continue
        if l == "---END---":
            in_body = False
            in_stat = True
            continue
        if in_body:
            body_lines.append(l)
        elif in_stat:
            stat_lines.append(l)
    return {
        "hash": hash_[:10],
        "author": author,
        "date": date_,
        "subject": subject,
        "body": "\n".join(body_lines).strip(),
        "stat": "\n".join(l for l in stat_lines if l.strip()),
    }


def html_escape(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def build_pdf():
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=18, textColor=HexColor("#0F172A"), spaceAfter=6)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=13, textColor=HexColor("#047857"), spaceAfter=4, spaceBefore=12)
    meta = ParagraphStyle("meta", parent=styles["Normal"], fontSize=8, textColor=grey, spaceAfter=6)
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=9.5, leading=13, textColor=black, spaceAfter=4)
    mono = ParagraphStyle("mono", parent=styles["Code"], fontSize=8, leading=11, textColor=HexColor("#334155"), spaceAfter=4)
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8, textColor=grey)

    story = []
    story.append(Paragraph("Sprint 4 — Cambios por Tarea", h1))
    story.append(Paragraph("Branch: feature/multi-plant · Autor: David Cabezas + Claude Opus 4.7", meta))
    story.append(Spacer(1, 6 * mm))

    # Summary table
    summary_rows = [["Ticket", "Título", "Commit"]]
    for tk, title, sha in TICKETS:
        summary_rows.append([tk, title[:70] + ("…" if len(title) > 70 else ""), sha])
    tbl = Table(summary_rows, colWidths=[30*mm, 125*mm, 25*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#047857")),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F8FAFC"), HexColor("#FFFFFF")]),
    ]))
    story.append(tbl)
    story.append(PageBreak())

    # Per-ticket detail
    for tk, title, sha in TICKETS:
        data = commit_data(sha)
        block = []
        block.append(Paragraph(f"{tk} — {html_escape(title)}", h2))
        block.append(Paragraph(
            f"Commit <b>{data['hash']}</b> · {data['date']} · {html_escape(data['author'])}",
            meta,
        ))
        block.append(Paragraph(f"<b>{html_escape(data['subject'])}</b>", body))
        if data["body"]:
            for line in data["body"].split("\n"):
                if line.strip().startswith("Co-Authored-By"):
                    continue
                if line.strip():
                    block.append(Paragraph(html_escape(line), body))
                else:
                    block.append(Spacer(1, 2 * mm))
        if data["stat"]:
            block.append(Paragraph("<b>Archivos afectados:</b>", body))
            for line in data["stat"].split("\n"):
                line = line.strip()
                if not line or line.startswith(data['hash']):
                    continue
                block.append(Paragraph(html_escape(line), mono))
        block.append(Spacer(1, 4 * mm))
        story.append(KeepTogether(block))

    doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=16*mm, title="Sprint 4 — Cambios por Tarea")
    doc.build(story)
    print(f"PDF generado: {OUT}")


if __name__ == "__main__":
    build_pdf()
