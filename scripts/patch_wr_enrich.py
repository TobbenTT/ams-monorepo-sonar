"""Enriquece WRs existentes con:
- Más spare parts (siempre 4-6)
- support_equipment (grúa / andamios / plataforma según el trabajo)
- documents (fotos simuladas)
- aviso_coding (M001..M005, P001..P003)
- classification más completa en ai_classification
"""
import random
from api.database.connection import SessionLocal
from api.database.models import WorkRequestModel
from sqlalchemy.orm.attributes import flag_modified

random.seed(42)

EXTRA_MATERIALS_POOL = [
    ("10003020", "Rodamiento SKF 22320 EK/C3", "UN", 1200),
    ("10003030", "Rodamiento cónico FAG 32232", "UN", 1050),
    ("10004010", "Aceite lubricante ISO VG 46", "LT", 3.5),
    ("10004030", "Grasa lubricante NLGI 2", "KG", 28),
    ("10005015", "Pernos fijación M24×120 gr10.9", "UN", 3.8),
    ("10005020", "Tuercas M20 auto-frenantes", "UN", 0.9),
    ("10007010", "Cartucho filtro aire 420/95", "UN", 65),
    ("10007020", "Filtro hidráulico HP 25 micron", "UN", 88),
    ("10008010", "Manguera hidráulica HT-6 × 2m", "UN", 120),
    ("10008020", "Racor hidráulico NPT 3/4 x JIC", "UN", 45),
    ("10009010", "Tornillo de anclaje M30 × 400", "UN", 28),
    ("10011010", "Contactor Siemens 3RT1076", "UN", 280),
    ("10011030", "Relé térmico Schneider LRD3365", "UN", 95),
    ("10012010", "Sensor vibración CTC MH603", "UN", 340),
    ("10012020", "Transmisor temperatura Rosemount 3144P", "UN", 520),
]

SUPPORT_EQUIPMENT_OPTIONS = [
    {"tag": "GRA-MOV-001", "type": "MOBILE_CRANE", "name": "Grúa móvil 80t", "capacity_tons": 80},
    {"tag": "GRA-MOV-002", "type": "MOBILE_CRANE", "name": "Grúa móvil 50t", "capacity_tons": 50},
    {"tag": "AND-001", "type": "SCAFFOLDING", "name": "Andamio tubular 8m", "capacity_tons": None},
    {"tag": "PEMP-01", "type": "SCISSOR_LIFT", "name": "Plataforma elevadora tijera 10m", "capacity_tons": None},
    {"tag": "GRA-PTE-01", "type": "BRIDGE_CRANE", "name": "Grúa puente taller mecánico", "capacity_tons": 25},
    {"tag": "CAMION-PLM-01", "type": "FORKLIFT", "name": "Grúa horquilla 3t", "capacity_tons": 3},
]

# Fake base64 image — tiny 1x1 pixel placeholder (representa foto)
FAKE_PHOTO_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

AVISO_CODES = {
    "MECANICO": ["M001", "M002", "M003"],
    "ELECTRICO": ["E001", "E002"],
    "INSTRUMENTISTA": ["I001", "I002"],
    "PREDICTIVO": ["P001", "P002", "P003"],
}

FAILURE_CATEGORIES = {
    "fuga": {"category": "Estanqueidad", "mechanism": "Pérdida de contención", "component": "Sellos/Juntas"},
    "vibrac": {"category": "Dinámico", "mechanism": "Desbalance / Desalineación", "component": "Rodamientos/Ejes"},
    "ruido": {"category": "Dinámico", "mechanism": "Fricción / Deterioro", "component": "Transmisión"},
    "temperatura": {"category": "Térmico", "mechanism": "Sobrecalentamiento", "component": "Lubricación/Refrigeración"},
    "desgaste": {"category": "Mecánico", "mechanism": "Abrasión / Fatiga", "component": "Superficies de contacto"},
    "corrosión": {"category": "Químico", "mechanism": "Oxidación", "component": "Estructura metálica"},
    "rotura": {"category": "Estructural", "mechanism": "Fractura / Fatiga", "component": "Elemento estructural"},
    "bloqueo": {"category": "Obstrucción", "mechanism": "Atasco mecánico", "component": "Pasajes/Válvulas"},
    "rodamiento": {"category": "Mecánico", "mechanism": "Falla rodamiento", "component": "Rodamientos"},
    "falla": {"category": "Funcional", "mechanism": "Pérdida de función", "component": "Sistema completo"},
}


def classify_failure(text):
    low = text.lower()
    for kw, cls in FAILURE_CATEGORIES.items():
        if kw in low:
            return cls
    return {"category": "General", "mechanism": "A determinar", "component": "Equipo"}


db = SessionLocal()
wrs = db.query(WorkRequestModel).all()
updated = 0
for wr in wrs:
    problem = (wr.problem_description or {}).get("whatHappens", "") if isinstance(wr.problem_description, dict) else ""
    equip = wr.equipment_tag or ""

    # ── Ampliar spare_parts a 4-6 ───────────────────────────────────
    existing = wr.spare_parts or []
    existing_codes = {p.get("code") for p in existing if isinstance(p, dict)}
    target_count = random.randint(4, 6)
    while len(existing) < target_count:
        mat = random.choice(EXTRA_MATERIALS_POOL)
        if mat[0] in existing_codes:
            continue
        existing_codes.add(mat[0])
        existing.append({
            "code": mat[0],
            "name": mat[1],
            "description": mat[1],
            "qty": random.randint(1, 8),
            "quantity": random.randint(1, 8),
            "unit": mat[2],
            "unit_price": mat[3],
        })
    wr.spare_parts = existing

    # ── support_equipment (50% de las OTs grandes) ──────────────────
    if random.random() > 0.35:
        n = random.randint(1, 2)
        support = random.sample(SUPPORT_EQUIPMENT_OPTIONS, n)
        wr.support_equipment = support

    # ── documents (fotos fake) ──────────────────────────────────────
    docs = wr.documents or []
    photo_captions = [
        "Vista general equipo", "Zona afectada close-up", "Indicador alarma DCS",
        "Lectura instrumento", "Registro de inspección", "Foto térmica IR",
    ]
    n_photos = random.randint(2, 4)
    for _ in range(n_photos):
        docs.append({
            "type": "photo",
            "name": random.choice(photo_captions),
            "caption": random.choice(photo_captions),
            "data": FAKE_PHOTO_B64,
            "timestamp": wr.created_at.isoformat() if wr.created_at else None,
        })
    wr.documents = docs

    # ── aviso_coding ────────────────────────────────────────────────
    ai = wr.ai_classification or {}
    spec = ai.get("suggested_specialty", "MECANICO")
    wr.aviso_coding = random.choice(AVISO_CODES.get(spec, AVISO_CODES["MECANICO"]))

    # ── failure classification enriquecida en ai_classification ─────
    cls = classify_failure(problem)
    ai["failure_category"] = cls["category"]
    ai["failure_mechanism"] = cls["mechanism"]
    ai["affected_component"] = cls["component"]
    ai["failure_code"] = wr.aviso_coding
    ai["root_cause_hypothesis"] = f"Probable {cls['mechanism'].lower()} en {cls['component'].lower()}"
    ai["recommended_action"] = f"Intervención {spec.lower()} programada — reemplazo/ajuste de {cls['component'].lower()}"
    ai["safety_tags"] = random.sample(
        ["LOTO", "Trabajo en Altura", "Espacio Confinado", "Alta Tensión", "Carga Suspendida"],
        k=random.randint(1, 3),
    )
    wr.ai_classification = ai

    flag_modified(wr, "spare_parts")
    flag_modified(wr, "documents")
    flag_modified(wr, "ai_classification")
    flag_modified(wr, "support_equipment")
    updated += 1

db.commit()
db.close()
print(f"✅ Enriched {updated} WRs · spare parts 4-6, support equip, docs, aviso_coding, failure classification")
