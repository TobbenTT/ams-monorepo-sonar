"""SF-588 — Subclasificación de gastos por Ubicación Técnica + clase de gasto.

Cruza:
  - hierarchy_nodes (planta → área → sistema → equipo) para drill-down
  - managed_work_orders.materials[].cost_element (5 clases SAP)
  - managed_work_orders.labor_cost / external_cost (mano obra + servicios)

Devuelve un árbol jerárquico con costos plan/real subclasificados.
"""
from __future__ import annotations
from sqlalchemy.orm import Session

from api.database.models import (
    ManagedWorkOrderModel, HierarchyNodeModel,
)


COST_ELEMENTS = {
    "REPUESTO_CONSUMIBLE": "Repuesto Consumible",
    "REPUESTO_CRITICO": "Repuesto Crítico",
    "REPUESTO_ELECTRICO": "Repuesto Eléctrico",
    "INSUMO_LUBRICANTE": "Insumo / Lubricante",
    "HERRAMIENTA_EQUIPO": "Herramienta / Equipo",
    "MANO_DE_OBRA": "Mano de Obra",
    "SERVICIO_EXTERNO": "Servicio Externo",
}


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
            element = (m.get("cost_element") or "REPUESTO_CONSUMIBLE")
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

    return {
        "plant_id": plant_id,
        "elements_catalog": COST_ELEMENTS,
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
