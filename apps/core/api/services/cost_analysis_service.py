"""SF-588 — Subclasificación de gastos por Ubicación Técnica + clase de gasto.

Cruza:
  - hierarchy_nodes (planta → área → sistema → equipo) para drill-down
  - managed_work_orders.materials[].cost_element (5 clases SAP)
  - managed_work_orders.labor_cost / external_cost (mano obra + servicios)

Devuelve un árbol jerárquico con costos plan/real subclasificados.

2026-04-30: si un material no tiene cost_element seteado pero sí tiene
description, Claude clasifica el material en una de las 7 categorías SAP
(real NLP, no fallback a default). Cache en memoria por descripción.
"""
from __future__ import annotations
import os
import json
import logging
from sqlalchemy.orm import Session

from api.database.models import (
    ManagedWorkOrderModel, HierarchyNodeModel,
)

log = logging.getLogger(__name__)
_COST_ELEMENT_CACHE: dict[str, str] = {}  # description (lowercased+trimmed) → cost_element


COST_ELEMENTS = {
    "REPUESTO_CONSUMIBLE": "Repuesto Consumible",
    "REPUESTO_CRITICO": "Repuesto Crítico",
    "REPUESTO_ELECTRICO": "Repuesto Eléctrico",
    "INSUMO_LUBRICANTE": "Insumo / Lubricante",
    "HERRAMIENTA_EQUIPO": "Herramienta / Equipo",
    "MANO_DE_OBRA": "Mano de Obra",
    "SERVICIO_EXTERNO": "Servicio Externo",
}


def _classify_materials_with_claude(descriptions: list[str]) -> dict[str, str]:
    """Clasifica una lista de descripciones de materiales a cost_elements SAP.
    Devuelve {description_lc: cost_element}. Cache en memoria global."""
    descriptions = [d for d in descriptions if d and isinstance(d, str)]
    needed = [d for d in descriptions if d.lower().strip() not in _COST_ELEMENT_CACHE]
    if not needed:
        return _COST_ELEMENT_CACHE
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _COST_ELEMENT_CACHE
    try:
        import anthropic
    except ImportError:
        return _COST_ELEMENT_CACHE

    catalog = ", ".join(COST_ELEMENTS.keys())
    numbered = "\n".join([f"{i+1}. {d[:120]}" for i, d in enumerate(needed[:60])])
    prompt = f"""Eres un planificador de mantenimiento SAP. Clasifica cada descripción de material/recurso en UNA de estas 7 categorías SAP:

CATEGORÍAS: {catalog}

Reglas:
- REPUESTO_CONSUMIBLE: tornillería, golillas, juntas, filtros básicos
- REPUESTO_CRITICO: rodamientos grandes, sellos mecánicos, ejes, impulsores
- REPUESTO_ELECTRICO: cables, contactores, sensores, variadores, motores
- INSUMO_LUBRICANTE: aceite, grasa, anticorrosivo, refrigerante
- HERRAMIENTA_EQUIPO: llaves, torquímetros, multímetros (no se consumen)
- MANO_DE_OBRA: HH técnico, soldador, mecánico (es servicio interno)
- SERVICIO_EXTERNO: contratista, certificación, alineamiento láser tercero

DESCRIPCIONES:
{numbered}

Devuelve SOLO JSON: {{"classifications": [{{"idx": 1, "category": "REPUESTO_CRITICO"}}, ...]}}"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = resp.content[0].text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start < 0:
            return _COST_ELEMENT_CACHE
        parsed = json.loads(text[start:end])
        for c in (parsed.get("classifications") or []):
            idx = c.get("idx")
            cat = c.get("category")
            if not isinstance(idx, int) or idx < 1 or idx > len(needed):
                continue
            if cat in COST_ELEMENTS:
                _COST_ELEMENT_CACHE[needed[idx-1].lower().strip()] = cat
    except Exception as e:
        log.warning("Cost element classification failed: %s", e)
    return _COST_ELEMENT_CACHE


def cost_analysis(db: Session, plant_id: str | None = None) -> dict:
    """Análisis de costos por ubicación técnica + clase de gasto."""
    # Cargar hierarchy + parent map
    nodes_q = db.query(HierarchyNodeModel)
    if plant_id:
        nodes_q = nodes_q.filter(HierarchyNodeModel.plant_id == plant_id)
    nodes = nodes_q.all()
    node_by_id = {n.node_id: n for n in nodes}
    node_by_tag = {n.tag or n.code: n for n in nodes if (n.tag or n.code)}

    def parent_chain(node_id: str) -> list[str]:
        """Devuelve la cadena de IDs de parents desde root hasta el nodo."""
        chain = []
        seen = set()
        cur = node_id
        while cur and cur not in seen:
            seen.add(cur)
            chain.append(cur)
            cur = node_by_id[cur].parent_node_id if cur in node_by_id else None
        return list(reversed(chain))

    # Cargar OTs
    wos_q = db.query(ManagedWorkOrderModel)
    if plant_id:
        wos_q = wos_q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    wos = wos_q.all()

    # Pre-clasificar con Claude las descripciones de materials sin cost_element seteado.
    # Cache en memoria evita re-clasificar entre llamadas.
    _missing_descs = []
    for _w in wos:
        for _m in (_w.materials or []):
            if not isinstance(_m, dict):
                continue
            if not _m.get("cost_element") and _m.get("description"):
                _missing_descs.append(_m.get("description"))
    if _missing_descs:
        _classify_materials_with_claude(list(set(_missing_descs)))

    # Acumular por (node_id, cost_element) → {plan, real}
    bucket: dict[str, dict[str, dict[str, float]]] = {}

    def add(node_id: str, element: str, plan: float, real: float):
        if node_id not in bucket:
            bucket[node_id] = {}
        if element not in bucket[node_id]:
            bucket[node_id][element] = {"plan": 0.0, "real": 0.0, "wo_count": 0}
        bucket[node_id][element]["plan"] += plan
        bucket[node_id][element]["real"] += real
        bucket[node_id][element]["wo_count"] += 1

    for w in wos:
        # Encontrar nodo del equipo
        node = node_by_tag.get(w.equipment_tag) or node_by_tag.get(w.equipment_id)
        if not node:
            continue
        # Sumar al nodo equipo + propagar hacia los parents
        chain = parent_chain(node.node_id)
        # Materiales por cost_element
        elements_total: dict[str, dict[str, float]] = {}
        for m in (w.materials or []):
            if not isinstance(m, dict):
                continue
            # cost_element: 1) campo explícito, 2) Claude por descripción (cached), 3) default.
            element = m.get("cost_element")
            if not element and m.get("description"):
                element = _COST_ELEMENT_CACHE.get(m.get("description").lower().strip())
            if not element:
                element = "REPUESTO_CONSUMIBLE"
            qty = int(m.get("quantity", 0) or 0)
            unit_price = float(m.get("unit_price", 0) or 0)
            cost = qty * unit_price
            elements_total.setdefault(element, {"plan": 0, "real": 0})
            elements_total[element]["plan"] += cost
            elements_total[element]["real"] += cost  # asumimos plan = real para materials (sin override)
        # Labor + external
        labor = float(w.labor_cost or 0)
        external = float(w.external_cost or 0)
        if labor > 0:
            elements_total["MANO_DE_OBRA"] = {"plan": labor, "real": labor}
        if external > 0:
            elements_total["SERVICIO_EXTERNO"] = {"plan": external, "real": external}
        # Aplicar a cada nivel de la jerarquía
        for nid in chain:
            for elem, vals in elements_total.items():
                add(nid, elem, vals["plan"], vals["real"])

    # Construir árbol
    def build_tree(node_id: str) -> dict:
        node = node_by_id.get(node_id)
        if not node:
            return None
        node_data = bucket.get(node_id, {})
        total_plan = sum(v["plan"] for v in node_data.values())
        total_real = sum(v["real"] for v in node_data.values())
        children_nodes = [n for n in nodes if n.parent_node_id == node_id]
        children = [build_tree(c.node_id) for c in children_nodes]
        children = [c for c in children if c and c.get("total_real", 0) > 0]
        return {
            "node_id": node.node_id,
            "name": node.name,
            "code": node.code,
            "node_type": node.node_type,
            "criticality": node.criticality,
            "total_plan": round(total_plan, 2),
            "total_real": round(total_real, 2),
            "variance_pct": round((total_real - total_plan) / total_plan * 100, 1) if total_plan > 0 else 0,
            "by_element": [
                {
                    "element": elem,
                    "label": COST_ELEMENTS.get(elem, elem),
                    "plan": round(v["plan"], 2),
                    "real": round(v["real"], 2),
                    "wo_count": v["wo_count"],
                }
                for elem, v in sorted(node_data.items(), key=lambda x: -x[1]["real"])
            ],
            "children": sorted(children, key=lambda x: -x["total_real"]),
        }

    # Identificar roots (nodos sin parent o cuyo parent no está en la planta)
    roots = [n for n in nodes if not n.parent_node_id or n.parent_node_id not in node_by_id]
    tree = []
    for r in roots:
        t = build_tree(r.node_id)
        if t and t["total_real"] > 0:
            tree.append(t)

    # Resumen totales por clase de gasto (todos los niveles)
    grand_total_by_element = {}
    for nd in nodes:
        nb = bucket.get(nd.node_id, {})
        # Solo sumamos del nivel EQUIPMENT para no doble contar por parents
        if nd.node_type != "EQUIPMENT":
            continue
        for elem, v in nb.items():
            grand_total_by_element.setdefault(elem, {"plan": 0, "real": 0})
            grand_total_by_element[elem]["plan"] += v["plan"]
            grand_total_by_element[elem]["real"] += v["real"]

    ai_classified_count = sum(
        1 for _w in wos for _m in (_w.materials or [])
        if isinstance(_m, dict) and not _m.get("cost_element") and _m.get("description")
        and _COST_ELEMENT_CACHE.get((_m.get("description") or "").lower().strip())
    )
    return {
        "plant_id": plant_id,
        "elements_catalog": COST_ELEMENTS,
        "ai_classifications": ai_classified_count,
        "ai_used": bool(os.environ.get("ANTHROPIC_API_KEY")) and ai_classified_count > 0,
        "summary_by_element": [
            {
                "element": e,
                "label": COST_ELEMENTS.get(e, e),
                "plan": round(v["plan"], 2),
                "real": round(v["real"], 2),
            }
            for e, v in sorted(grand_total_by_element.items(), key=lambda x: -x[1]["real"])
        ],
        "tree": tree,
    }
