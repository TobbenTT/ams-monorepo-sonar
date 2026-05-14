"""
Synthetic Data Generator — Phosphate-Realistic (GAP-6 + OPP-3)
Generates realistic plant hierarchies, equipment, failure modes,
and maintenance data for phosphate mining operations.
"""

import uuid
import random
from datetime import date, datetime, timedelta


# ============================================================
# PHOSPHATE DOMAIN KNOWLEDGE
# ============================================================

PHOSPHATE_AREAS = [
    ("BRY", "Broyage", "Grinding"),
    ("FLT", "Flottation", "Flotation"),
    ("SED", "Sédimentation", "Sedimentation"),
    ("FIL", "Filtration", "Filtration"),
    ("SEQ", "Séchage", "Drying"),
    ("CVY", "Convoyage", "Conveying"),
    ("STK", "Stockage", "Storage"),
    ("PMP", "Pompage", "Pumping"),
]

EQUIPMENT_TYPES = {
    "BRY": [
        {"type": "SAG Mill", "type_fr": "Broyeur SAG", "code": "SAG-ML", "criticality": "AA", "power_kw": 8500, "weight_kg": 450000},
        {"type": "Ball Mill", "type_fr": "Broyeur à boulets", "code": "BAL-ML", "criticality": "AA", "power_kw": 5000, "weight_kg": 280000},
        {"type": "Classifier", "type_fr": "Classificateur", "code": "CLS", "criticality": "A", "power_kw": 150, "weight_kg": 12000},
    ],
    "FLT": [
        {"type": "Flotation Cell", "type_fr": "Cellule de flottation", "code": "FLC", "criticality": "A+", "power_kw": 250, "weight_kg": 35000},
        {"type": "Conditioner", "type_fr": "Conditionneur", "code": "CND", "criticality": "A", "power_kw": 90, "weight_kg": 8000},
    ],
    "FIL": [
        {"type": "Belt Filter", "type_fr": "Filtre à bande", "code": "BFT", "criticality": "A+", "power_kw": 45, "weight_kg": 15000},
        {"type": "Disc Filter", "type_fr": "Filtre à disque", "code": "DFT", "criticality": "A", "power_kw": 30, "weight_kg": 12000},
    ],
    "CVY": [
        {"type": "Belt Conveyor", "type_fr": "Convoyeur à bande", "code": "CVR", "criticality": "A", "power_kw": 200, "weight_kg": 45000},
        {"type": "Screw Conveyor", "type_fr": "Convoyeur à vis", "code": "SCR", "criticality": "B", "power_kw": 30, "weight_kg": 5000},
    ],
    "PMP": [
        {"type": "Slurry Pump", "type_fr": "Pompe à boue", "code": "SLP", "criticality": "A+", "power_kw": 350, "weight_kg": 8000},
        {"type": "Water Pump", "type_fr": "Pompe à eau", "code": "WTP", "criticality": "B", "power_kw": 75, "weight_kg": 2000},
    ],
    "SEQ": [
        {"type": "Rotary Dryer", "type_fr": "Sécheur rotatif", "code": "DRY", "criticality": "A+", "power_kw": 500, "weight_kg": 120000},
    ],
    "SED": [
        {"type": "Thickener", "type_fr": "Épaississeur", "code": "THK", "criticality": "A", "power_kw": 45, "weight_kg": 80000},
    ],
    "STK": [
        {"type": "Stacker", "type_fr": "Empileur", "code": "STK", "criticality": "B", "power_kw": 150, "weight_kg": 60000},
    ],
}

SUB_ASSEMBLIES = {
    "SAG Mill": ["Drive System", "Grinding System", "Feed System", "Discharge System", "Lubrication System", "Instrumentation"],
    "Ball Mill": ["Drive System", "Grinding System", "Feed System", "Discharge System", "Lubrication System"],
    "Slurry Pump": ["Wet End", "Bearing Assembly", "Drive System", "Sealing System", "Base Frame"],
    "Belt Conveyor": ["Drive System", "Head Pulley", "Tail Pulley", "Belt", "Idlers", "Structure"],
    "Flotation Cell": ["Agitator System", "Air System", "Overflow System", "Structure"],
    "DEFAULT": ["Drive System", "Main Assembly", "Support System"],
}

MAINTAINABLE_ITEMS = {
    "Drive System": ["Motor", "Gearbox", "Coupling", "Drive Belt"],
    "Grinding System": ["Liner", "Lifter Bar", "Shell"],
    "Wet End": ["Impeller", "Volute Liner", "Throat Bush", "Frame Plate Liner"],
    "Bearing Assembly": ["Drive End Bearing", "Non-Drive End Bearing", "Bearing Housing"],
    "Sealing System": ["Mechanical Seal", "Gland Packing", "Shaft Sleeve"],
    "Feed System": ["Feed Chute", "Feed Trunnion"],
    "Discharge System": ["Discharge Trunnion", "Trommel Screen"],
    "Lubrication System": ["Lube Pump", "Filter", "Cooler", "Oil Reservoir"],
    "Head Pulley": ["Pulley", "Bearing", "Lagging"],
    "Tail Pulley": ["Pulley", "Bearing", "Scraper"],
    "Belt": ["Belt Splice", "Belt Segment"],
    "Agitator System": ["Agitator Motor", "Impeller", "Shaft"],
    "Air System": ["Blower", "Air Pipe", "Sparger"],
    "DEFAULT": ["Main Component", "Secondary Component", "Auxiliary"],
}

MANUFACTURERS = {
    "SAG Mill": ["FLSmidth", "Metso Outotec"],
    "Ball Mill": ["FLSmidth", "Metso Outotec"],
    "Slurry Pump": ["Weir Minerals", "Metso Outotec", "KSB"],
    "Belt Conveyor": ["Rulmeca", "Martin Engineering"],
    "Motor": ["ABB", "Siemens", "WEG"],
    "Bearing": ["SKF", "FAG", "NSK", "Timken"],
    "DEFAULT": ["OEM Standard"],
}

FAILURE_MODES_BY_MI = {
    "Motor": [
        ("Bearing", "WORN", "ABRASION", "B_AGE", "CONDITION_BASED"),
        ("Winding", "OVERHEATED", "OVER_CURRENT", "E_RANDOM", "CONDITION_BASED"),
        ("Coupling", "LOOSE", "FATIGUE", "C_FATIGUE", "FIXED_TIME"),
    ],
    "Gearbox": [
        ("Gear", "WORN", "ABRASION", "B_AGE", "CONDITION_BASED"),
        ("Seal", "LEAKING", "AGE", "B_AGE", "FIXED_TIME"),
        ("Bearing", "WORN", "ABRASION", "B_AGE", "CONDITION_BASED"),
    ],
    "Impeller": [
        ("Impeller", "WORN", "EROSION", "D_STRESS", "CONDITION_BASED"),
        ("Impeller", "CORRODED", "CHEMICAL_ATTACK", "E_RANDOM", "CONDITION_BASED"),
    ],
    "Bearing": [
        ("Bearing", "WORN", "ABRASION", "B_AGE", "CONDITION_BASED"),
        ("Bearing", "OVERHEATED", "CONTAMINATION", "E_RANDOM", "CONDITION_BASED"),
    ],
    "Liner": [
        ("Liner", "WORN", "ABRASION", "D_STRESS", "FIXED_TIME"),
    ],
    "Mechanical Seal": [
        ("Seal", "LEAKING", "ABRASION", "B_AGE", "CONDITION_BASED"),
        ("Seal Face", "WORN", "ABRASION", "B_AGE", "FIXED_TIME"),
    ],
    "Filter": [
        ("Filter Element", "BLOCKED", "CONTAMINATION", "E_RANDOM", "FIXED_TIME"),
    ],
    "DEFAULT": [
        ("Component", "WORN", "USE", "E_RANDOM", "CONDITION_BASED"),
    ],
}


class SyntheticDataGenerator:
    """Generates phosphate-realistic synthetic maintenance data."""

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)

    def generate_plant_hierarchy(
        self,
        plant_code: str = "OCP-JFC1",
        plant_name: str = "Jorf Fertilizer Complex 1",
        num_areas: int | None = None,
    ) -> list[dict]:
        """Generate a complete plant hierarchy."""
        nodes = []
        plant_id = str(uuid.uuid4())
        nodes.append({
            "node_id": plant_id,
            "node_type": "PLANT",
            "name": plant_name,
            "name_fr": "Complexe d'engrais de Jorf 1",
            "code": plant_code,
            "level": 1,
            "parent_node_id": None,
        })

        areas = PHOSPHATE_AREAS[:num_areas] if num_areas else PHOSPHATE_AREAS
        for area_code, area_fr, area_en in areas:
            area_id = str(uuid.uuid4())
            nodes.append({
                "node_id": area_id,
                "node_type": "AREA",
                "name": area_en,
                "name_fr": area_fr,
                "code": f"{plant_code}-{area_code}",
                "level": 2,
                "parent_node_id": plant_id,
            })

            system_id = str(uuid.uuid4())
            nodes.append({
                "node_id": system_id,
                "node_type": "SYSTEM",
                "name": f"{area_en} System",
                "name_fr": f"Système {area_fr}",
                "code": f"{plant_code}-{area_code}-SYS",
                "level": 3,
                "parent_node_id": area_id,
            })

            equipment_defs = EQUIPMENT_TYPES.get(area_code, [])
            for eq_idx, eq_def in enumerate(equipment_defs, 1):
                eq_id = str(uuid.uuid4())
                tag = f"{area_code}-{eq_def['code']}-{eq_idx:03d}"
                mfr = self.rng.choice(MANUFACTURERS.get(eq_def["type"], MANUFACTURERS["DEFAULT"]))
                nodes.append({
                    "node_id": eq_id,
                    "node_type": "EQUIPMENT",
                    "name": f"{eq_def['type']} #{eq_idx}",
                    "name_fr": f"{eq_def['type_fr']} #{eq_idx}",
                    "code": tag,
                    "level": 4,
                    "parent_node_id": system_id,
                    "tag": tag,
                    "criticality": eq_def["criticality"],
                    "manufacturer": mfr,
                    "power_kw": eq_def["power_kw"],
                    "weight_kg": eq_def["weight_kg"],
                })

                sub_assy_list = SUB_ASSEMBLIES.get(eq_def["type"], SUB_ASSEMBLIES["DEFAULT"])
                for sa_idx, sa_name in enumerate(sub_assy_list, 1):
                    sa_id = str(uuid.uuid4())
                    nodes.append({
                        "node_id": sa_id,
                        "node_type": "SUB_ASSEMBLY",
                        "name": sa_name,
                        "name_fr": sa_name,
                        "code": f"{tag}-SA{sa_idx:02d}",
                        "level": 5,
                        "parent_node_id": eq_id,
                    })

                    mi_list = MAINTAINABLE_ITEMS.get(sa_name, MAINTAINABLE_ITEMS["DEFAULT"])
                    for mi_idx, mi_name in enumerate(mi_list, 1):
                        mi_id = str(uuid.uuid4())
                        nodes.append({
                            "node_id": mi_id,
                            "node_type": "MAINTAINABLE_ITEM",
                            "name": mi_name,
                            "name_fr": mi_name,
                            "code": f"{tag}-SA{sa_idx:02d}-MI{mi_idx:02d}",
                            "level": 6,
                            "parent_node_id": sa_id,
                            "mi_type": mi_name,
                        })

        return nodes

    def generate_failure_modes(self, nodes: list[dict]) -> list[dict]:
        """Generate failure modes for all maintainable items."""
        failure_modes = []
        mi_nodes = [n for n in nodes if n["node_type"] == "MAINTAINABLE_ITEM"]

        for mi in mi_nodes:
            mi_type = mi.get("mi_type", "DEFAULT")
            fm_templates = FAILURE_MODES_BY_MI.get(mi_type, FAILURE_MODES_BY_MI["DEFAULT"])

            for what, mechanism, cause, pattern, strategy in fm_templates:
                failure_modes.append({
                    "failure_mode_id": str(uuid.uuid4()),
                    "node_id": mi["node_id"],
                    "mi_name": mi["name"],
                    "what": what,
                    "mechanism": mechanism,
                    "cause": cause,
                    "failure_pattern": pattern,
                    "strategy_type": strategy,
                    "is_hidden": False,
                    "failure_consequence": "EVIDENT_OPERATIONAL",
                })

        return failure_modes

    def generate_work_order_history(
        self,
        equipment_nodes: list[dict],
        months: int = 24,
        orders_per_equipment_per_month: float = 0.5,
    ) -> list[dict]:
        """Generate synthetic work order history."""
        work_orders = []
        base_date = date.today() - timedelta(days=months * 30)
        eq_nodes = [n for n in equipment_nodes if n["node_type"] == "EQUIPMENT"]

        for eq in eq_nodes:
            num_orders = int(months * orders_per_equipment_per_month)
            for i in range(num_orders):
                days_offset = self.rng.randint(0, months * 30)
                wo_date = base_date + timedelta(days=days_offset)
                duration = self.rng.choice([2, 4, 8, 12, 16, 24])
                priority = self.rng.choice(["1", "2", "3", "3", "3", "4", "4"])
                wo_type = self.rng.choice(["PM01", "PM02", "PM03", "PM03"])

                work_orders.append({
                    "work_order_id": f"WO-{self.rng.randint(100000, 999999)}",
                    "order_type": wo_type,
                    "equipment_id": eq.get("code", ""),
                    "equipment_tag": eq.get("tag", eq.get("code", "")),
                    "priority": priority,
                    "status": "COMPLETED",
                    "created_date": wo_date.isoformat(),
                    "actual_duration_hours": duration,
                    "description": f"Maintenance on {eq['name']}",
                })

        return work_orders

    def get_statistics(self, nodes: list[dict]) -> dict:
        """Return statistics about the generated data."""
        stats = {
            "total_nodes": len(nodes),
            "by_type": {},
        }
        for node in nodes:
            nt = node["node_type"]
            stats["by_type"][nt] = stats["by_type"].get(nt, 0) + 1
        return stats
