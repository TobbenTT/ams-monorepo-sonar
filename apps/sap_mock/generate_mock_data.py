"""Generate SAP mock data files using SyntheticDataGenerator.

Creates JSON files simulating SAP PM transaction exports:
- IE03: Equipment master
- IW38/IW39: Work order history
- IP10: Maintenance plans
- MM60: Materials/BOM
- IL03: Functional locations
"""

import json
import random
from pathlib import Path

from tools.generators.synthetic_data import SyntheticDataGenerator


def generate_all(output_dir: str = "sap_mock/data", seed: int = 42) -> dict:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    gen = SyntheticDataGenerator(seed=seed)
    rng = random.Random(seed)

    # Generate hierarchy
    nodes = gen.generate_plant_hierarchy("OCP-JFC1", "Jorf Fertilizer Complex 1")
    failure_modes = gen.generate_failure_modes(nodes)
    eq_nodes = [n for n in nodes if n["node_type"] == "EQUIPMENT"]
    work_orders = gen.generate_work_order_history(nodes, months=24)

    # IE03 — Equipment master
    equipment_master = []
    for n in nodes:
        if n["node_type"] == "EQUIPMENT":
            equipment_master.append({
                "EQUNR": n.get("code", ""),
                "EQKTX": n["name"],
                "EQART": n.get("tag", ""),
                "HERST": n.get("manufacturer", ""),
                "SERGE": "",
                "ABCKZ": n.get("criticality", ""),
                "TPLNR": "",
                "STAT": "ACTIVE",
                "POWER_KW": n.get("power_kw"),
                "WEIGHT_KG": n.get("weight_kg"),
            })
    _write_json(out / "equipment_master.json", equipment_master)

    # IL03 — Functional locations
    func_locs = []
    for n in nodes:
        if n["node_type"] in ("PLANT", "AREA", "SYSTEM"):
            func_locs.append({
                "TPLNR": n.get("code", ""),
                "PLTXT": n["name"],
                "FLTYP": n["node_type"],
                "TPLMA": n.get("parent_node_id", ""),
                "LEVEL": n["level"],
            })
    _write_json(out / "functional_locations.json", func_locs)

    # IW38/IW39 — Work orders
    sap_orders = []
    for wo in work_orders:
        sap_orders.append({
            "AUFNR": wo["work_order_id"],
            "AUART": wo["order_type"],
            "EQUNR": wo["equipment_id"],
            "PRIOK": wo["priority"],
            "STAT": wo["status"],
            "ERDAT": wo["created_date"],
            "DURATION_H": wo["actual_duration_hours"],
            "KTEXT": wo["description"],
        })
    _write_json(out / "work_orders.json", sap_orders)

    # IP10 — Maintenance plans
    plans = []
    for idx, eq in enumerate(eq_nodes):
        freq = rng.choice([30, 90, 180, 365])
        plans.append({
            "PLNNR": f"MP-{idx + 1:04d}",
            "KTEXT": f"PM Plan for {eq['name']}",
            "EQUNR": eq.get("code", ""),
            "CYCLE_VAL": freq,
            "CYCLE_UNIT": "DAYS",
            "STRAT": rng.choice(["TIME_BASED", "CONDITION_BASED"]),
            "STATUS": "ACTIVE",
        })
    _write_json(out / "maintenance_plans.json", plans)

    # MM60 — Materials/BOM
    materials = []
    mi_nodes = [n for n in nodes if n["node_type"] == "MAINTAINABLE_ITEM"]
    material_set = set()
    for mi in mi_nodes:
        mi_type = mi.get("mi_type", mi["name"])
        mat_code = f"MAT-{mi_type.upper().replace(' ', '-')[:20]}"
        if mat_code not in material_set:
            material_set.add(mat_code)
            materials.append({
                "MATNR": mat_code,
                "MAKTX": f"Spare {mi_type}",
                "MATKL": "SPARE_PARTS",
                "MEINS": "EA",
                "LABST": rng.randint(0, 20),
                "EKGRP": "OCP",
                "NETPR": round(rng.uniform(50, 5000), 2),
                "WAERS": "USD",
                "APPLICABLE_EQUNR": [mi.get("parent_node_id", "")],
            })
    _write_json(out / "materials_bom.json", materials)

    stats = gen.get_statistics(nodes)
    return {
        "equipment_master": len(equipment_master),
        "functional_locations": len(func_locs),
        "work_orders": len(sap_orders),
        "maintenance_plans": len(plans),
        "materials_bom": len(materials),
        "total_hierarchy_nodes": stats["total_nodes"],
        "node_types": stats["by_type"],
    }


def _write_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str, ensure_ascii=False)


if __name__ == "__main__":
    result = generate_all()
    print(f"Generated SAP mock data: {result}")
