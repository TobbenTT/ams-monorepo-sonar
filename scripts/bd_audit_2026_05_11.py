"""
Auditoría BD — Jornada VSC 2026-05-08 hallazgos #1, #4, #5.
Ejecutar dentro del contenedor `ocp-backend`:
    docker exec ocp-backend python scripts/bd_audit_2026_05_11.py

Genera:
- audit_output/bd_audit_2026_05_11.md   (reporte legible)
- audit_output/bd_audit_2026_05_11.json (datos completos)
"""
from __future__ import annotations

import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path
from datetime import datetime

from api.database.connection import SessionLocal
from sqlalchemy import text

OUT_DIR = Path("audit_output")
OUT_DIR.mkdir(parents=True, exist_ok=True)

REPORT_MD = OUT_DIR / "bd_audit_2026_05_11.md"
REPORT_JSON = OUT_DIR / "bd_audit_2026_05_11.json"


def section(title: str) -> str:
    return f"\n## {title}\n"


def small(rows, n=10):
    return rows[:n] + ([f"... y {len(rows) - n} más"] if len(rows) > n else [])


def main():
    s = SessionLocal()
    out = {"generated_at": datetime.now().isoformat()}
    md = [
        "# Auditoría de Base de Datos — MAGEAM Production",
        f"_Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}_",
        "",
        "Cubre los hallazgos #1 (códigos de aviso), #4 (TAGs) y #5 (idioma + datos) "
        "de la jornada presencial QA del 2026-05-08.",
        "",
        "Ejecución: `docker exec ocp-backend python scripts/bd_audit_2026_05_11.py`",
        "",
    ]

    # ─────────────────────────────────────────────────────────────
    # 1. Códigos de aviso (work_requests)
    # ─────────────────────────────────────────────────────────────
    md.append(section("1. Códigos de aviso (hallazgo #1)"))
    wrs = s.execute(text(
        "SELECT request_id, aviso_number, status, created_at, plant_id, equipment_tag "
        "FROM work_requests ORDER BY aviso_number ASC NULLS LAST"
    )).all()
    total = len(wrs)
    with_aviso = [w for w in wrs if w.aviso_number is not None]
    without_aviso = [w for w in wrs if w.aviso_number is None]
    aviso_counter = Counter(w.aviso_number for w in with_aviso)
    duplicates = {k: v for k, v in aviso_counter.items() if v > 1}
    # Huecos en la secuencia
    if with_aviso:
        nums = sorted({w.aviso_number for w in with_aviso})
        gaps = []
        for i in range(len(nums) - 1):
            if nums[i + 1] - nums[i] > 1:
                gaps.append((nums[i] + 1, nums[i + 1] - 1))
    else:
        nums = []
        gaps = []

    out["aviso_codes"] = {
        "total_wrs": total,
        "with_aviso_number": len(with_aviso),
        "without_aviso_number": len(without_aviso),
        "duplicates": duplicates,
        "min_aviso": nums[0] if nums else None,
        "max_aviso": nums[-1] if nums else None,
        "gap_count": len(gaps),
        "gaps": gaps[:30],
    }

    md.append(f"- **Total WRs**: {total}")
    md.append(f"- **Con `aviso_number`**: {len(with_aviso)}")
    md.append(f"- **Sin `aviso_number`**: {len(without_aviso)}  ← {'⚠️ revisar' if without_aviso else 'OK'}")
    md.append(f"- **Duplicados** (mismo aviso_number en distintos request_id): {len(duplicates)}")
    if duplicates:
        for av, cnt in list(duplicates.items())[:10]:
            md.append(f"    - AV-{av:05d}: {cnt} registros")
    if nums:
        md.append(f"- **Rango**: AV-{nums[0]:05d} … AV-{nums[-1]:05d}")
        md.append(f"- **Huecos en la secuencia**: {len(gaps)} bloque(s)")
        for a, b in gaps[:10]:
            md.append(f"    - faltan AV-{a:05d} … AV-{b:05d} ({b - a + 1} avisos)")

    # ─────────────────────────────────────────────────────────────
    # 2. TAGs en hierarchy_nodes (hallazgo #4)
    # ─────────────────────────────────────────────────────────────
    md.append(section("2. TAGs en hierarchy_nodes (hallazgo #4)"))
    nodes = s.execute(text(
        "SELECT node_id, name, tag, code, sap_func_loc, node_type, plant_id, status "
        "FROM hierarchy_nodes"
    )).all()
    out_nodes = {
        "total_nodes": len(nodes),
        "equipment_count": sum(1 for n in nodes if n.node_type == 'EQUIPMENT'),
        "active_count": sum(1 for n in nodes if (n.status or 'ACTIVE') == 'ACTIVE'),
    }
    md.append(f"- **Total nodos**: {len(nodes)}")
    md.append(f"- **Tipo EQUIPMENT**: {out_nodes['equipment_count']}")
    md.append(f"- **Activos**: {out_nodes['active_count']}")

    # Duplicados (tag normalizado por planta)
    by_plant_tag = defaultdict(list)
    for n in nodes:
        if n.tag:
            key = (n.plant_id or 'NO_PLANT', n.tag.strip().upper())
            by_plant_tag[key].append({
                "node_id": n.node_id,
                "name": n.name,
                "code": n.code,
                "node_type": n.node_type,
                "sap_func_loc": n.sap_func_loc,
            })
    dup_tags = {f"{k[0]}|{k[1]}": v for k, v in by_plant_tag.items() if len(v) > 1}
    out_nodes["duplicate_tags"] = dup_tags
    md.append(f"- **TAGs duplicados** (mismo TAG en misma planta): {len(dup_tags)}")
    for k, lst in list(dup_tags.items())[:10]:
        md.append(f"    - `{k}`: {len(lst)} nodos → {[n['name'] for n in lst]}")

    # TAGs vacíos o con typos comunes
    tags_empty = [n for n in nodes if n.node_type == 'EQUIPMENT' and not (n.tag or '').strip()]
    tags_with_whitespace = [n for n in nodes if n.tag and n.tag != n.tag.strip()]
    tags_with_lowercase = [n for n in nodes if n.tag and n.tag != n.tag.upper()]
    weird_chars = [n for n in nodes if n.tag and re.search(r'[^\w\-\./]', n.tag)]

    out_nodes["tags_empty"] = len(tags_empty)
    out_nodes["tags_with_whitespace"] = len(tags_with_whitespace)
    out_nodes["tags_with_lowercase"] = len(tags_with_lowercase)
    out_nodes["tags_with_weird_chars"] = len(weird_chars)

    md.append(f"- **Equipment sin TAG**: {len(tags_empty)}")
    md.append(f"- **TAGs con espacios al inicio/final**: {len(tags_with_whitespace)}")
    md.append(f"- **TAGs con minúsculas**: {len(tags_with_lowercase)}")
    md.append(f"- **TAGs con caracteres raros** (no alfanum/-./): {len(weird_chars)}")

    if weird_chars[:5]:
        for n in weird_chars[:5]:
            md.append(f"    - `{n.tag}` — {n.name}")

    # Sin sap_func_loc
    no_func_loc = [n for n in nodes if n.node_type == 'EQUIPMENT' and not (n.sap_func_loc or '').strip()]
    out_nodes["equipment_without_sap_func_loc"] = len(no_func_loc)
    md.append(f"- **Equipment sin `sap_func_loc`**: {len(no_func_loc)}")

    out["hierarchy_nodes"] = out_nodes

    # ─────────────────────────────────────────────────────────────
    # 3. Idioma y calidad de datos (hallazgo #5)
    # ─────────────────────────────────────────────────────────────
    md.append(section("3. Idioma y calidad de datos (hallazgo #5)"))

    # Heurística simple ES vs EN: contar palabras "stop word"
    ES_WORDS = re.compile(r'\b(el|la|los|las|de|del|en|por|para|con|sin|que|equipo|falla|motor)\b', re.IGNORECASE)
    EN_WORDS = re.compile(r'\b(the|of|and|in|by|for|with|without|equipment|failure|engine|pump)\b', re.IGNORECASE)
    SPECIAL_CHARS = re.compile(r'[ñáéíóúÑÁÉÍÓÚ]')

    mixed_lang_wrs = []
    encoding_issues = []
    empty_descriptions = []

    for w in wrs:
        # problem_description es JSON con original_text
        pd = w if hasattr(w, 'problem_description') else None
    # re-query con problem_description
    wrs_full = s.execute(text(
        "SELECT request_id, problem_description, status FROM work_requests"
    )).all()

    for w in wrs_full:
        raw = w.problem_description or ''
        try:
            data = json.loads(raw) if isinstance(raw, str) and raw.startswith('{') else {}
        except Exception:
            data = {}
        desc = data.get('original_text') or data.get('structured_description') or (raw if isinstance(raw, str) else '')
        if not desc or not str(desc).strip():
            empty_descriptions.append(w.request_id)
            continue
        s_text = str(desc)
        has_es = bool(ES_WORDS.search(s_text))
        has_en = bool(EN_WORDS.search(s_text))
        if has_es and has_en and len(s_text) > 30:
            mixed_lang_wrs.append({"request_id": w.request_id, "snippet": s_text[:120]})
        # Encoding issues: caracteres replacement (�) o secuencias raras
        if '�' in s_text or 'Ã©' in s_text or 'Ã¡' in s_text or 'Â°' in s_text:
            encoding_issues.append({"request_id": w.request_id, "snippet": s_text[:120]})

    out_lang = {
        "wrs_total": len(wrs_full),
        "mixed_language_wrs": len(mixed_lang_wrs),
        "encoding_issues": len(encoding_issues),
        "empty_descriptions": len(empty_descriptions),
        "samples": {
            "mixed_lang": mixed_lang_wrs[:10],
            "encoding": encoding_issues[:10],
        },
    }
    out["language_quality"] = out_lang

    md.append(f"- **WRs total**: {len(wrs_full)}")
    md.append(f"- **WRs con idioma mezclado** (ES+EN en mismo texto, >30 chars): {len(mixed_lang_wrs)}")
    md.append(f"- **WRs con encoding roto** (caracteres `Ã©`, `\\ufffd`, etc): {len(encoding_issues)}")
    md.append(f"- **WRs con descripción vacía**: {len(empty_descriptions)}")

    if mixed_lang_wrs[:5]:
        md.append("\n**Muestra idioma mezclado:**")
        for x in mixed_lang_wrs[:5]:
            md.append(f"    - `{x['request_id']}`: _{x['snippet']}_")
    if encoding_issues[:5]:
        md.append("\n**Muestra encoding:**")
        for x in encoding_issues[:5]:
            md.append(f"    - `{x['request_id']}`: _{x['snippet']}_")

    # Mezclas de idioma en hierarchy_nodes.name
    mixed_lang_nodes = []
    for n in nodes:
        nm = n.name or ''
        if not nm:
            continue
        has_es = bool(ES_WORDS.search(nm))
        has_en = bool(EN_WORDS.search(nm))
        if has_es and has_en:
            mixed_lang_nodes.append({"node_id": n.node_id, "name": nm, "plant_id": n.plant_id})

    md.append(f"- **hierarchy_nodes con nombre mezclado ES+EN**: {len(mixed_lang_nodes)}")
    if mixed_lang_nodes[:5]:
        for x in mixed_lang_nodes[:5]:
            md.append(f"    - `{x['name']}` (planta {x['plant_id']})")

    out_lang["mixed_lang_nodes"] = len(mixed_lang_nodes)
    out_lang["mixed_lang_nodes_samples"] = mixed_lang_nodes[:20]

    # ─────────────────────────────────────────────────────────────
    # 4. Otros — managed_work_orders dupes
    # ─────────────────────────────────────────────────────────────
    md.append(section("4. Managed work orders — dupes y orfandad"))
    wos = s.execute(text(
        "SELECT wo_id, wo_number, status, work_request_id, equipment_tag, plant_id "
        "FROM managed_work_orders"
    )).all()
    wo_num_counter = Counter(w.wo_number for w in wos if w.wo_number)
    dup_wo_nums = {k: v for k, v in wo_num_counter.items() if v > 1}
    orphan_wos = [w for w in wos if w.work_request_id is None]
    md.append(f"- **Total OTs**: {len(wos)}")
    md.append(f"- **Números OT duplicados**: {len(dup_wo_nums)}")
    if dup_wo_nums:
        for k, v in list(dup_wo_nums.items())[:5]:
            md.append(f"    - `{k}`: {v} registros")
    md.append(f"- **OTs sin work_request_id** (huérfanas): {len(orphan_wos)}")

    out["managed_wos"] = {
        "total": len(wos),
        "duplicate_wo_numbers": dup_wo_nums,
        "orphans_no_wr": len(orphan_wos),
    }

    # ─────────────────────────────────────────────────────────────
    # 5. Equipment cobertura (cuántos equipos tienen WRs, OTs, RCAs)
    # ─────────────────────────────────────────────────────────────
    md.append(section("5. Cobertura de equipos (qué equipos generan trabajo)"))
    eq_tags_with_wrs = s.execute(text(
        "SELECT equipment_tag, COUNT(*) c FROM work_requests WHERE equipment_tag IS NOT NULL GROUP BY equipment_tag ORDER BY c DESC LIMIT 20"
    )).all()
    top_eq = [{"tag": r.equipment_tag, "wrs": r.c} for r in eq_tags_with_wrs]
    out["top_equipment_by_wrs"] = top_eq
    md.append("Top 10 equipos con más WRs:")
    md.append("")
    md.append("| TAG | WRs |")
    md.append("|---|---|")
    for r in top_eq[:10]:
        md.append(f"| `{r['tag']}` | {r['wrs']} |")

    # ─────────────────────────────────────────────────────────────
    # Save
    # ─────────────────────────────────────────────────────────────
    md_text = "\n".join(md) + "\n"
    REPORT_MD.write_text(md_text, encoding="utf-8")
    REPORT_JSON.write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    print(f"OK — reporte en {REPORT_MD}")
    print(f"OK — datos JSON en {REPORT_JSON}")
    print()
    print("=" * 60)
    print("RESUMEN EJECUTIVO")
    print("=" * 60)
    print(f"WRs total: {total}")
    print(f"  - sin aviso_number: {len(without_aviso)}")
    print(f"  - aviso duplicados: {len(duplicates)}")
    print(f"  - huecos secuencia: {len(gaps)}")
    print()
    print(f"Hierarchy nodes: {len(nodes)} ({out_nodes['equipment_count']} EQUIPMENT)")
    print(f"  - TAGs duplicados (por planta): {len(dup_tags)}")
    print(f"  - sin TAG: {out_nodes['tags_empty']}")
    print(f"  - TAGs con espacios: {out_nodes['tags_with_whitespace']}")
    print(f"  - TAGs minúscula: {out_nodes['tags_with_lowercase']}")
    print(f"  - sin sap_func_loc: {out_nodes['equipment_without_sap_func_loc']}")
    print()
    print(f"Calidad de texto:")
    print(f"  - WRs idioma mezclado: {len(mixed_lang_wrs)}")
    print(f"  - WRs encoding roto: {len(encoding_issues)}")
    print(f"  - WRs descripción vacía: {len(empty_descriptions)}")
    print(f"  - Nodos con nombre mezclado: {len(mixed_lang_nodes)}")
    print()
    print(f"Managed WOs: {len(wos)}")
    print(f"  - duplicados: {len(dup_wo_nums)}")
    print(f"  - sin WR: {len(orphan_wos)}")


if __name__ == "__main__":
    main()
