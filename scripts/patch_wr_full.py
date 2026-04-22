"""Completa los WRs del demo con TODOS los campos que el UI muestra.

Agrega en problem_description:
- suggested_action  : lista numerada de 8-12 pasos
- resources         : [{type, quantity, hours}] (labour breakdown)
- materials         : [{code, description, quantity, unit}] (same as spare_parts pero aparte)
- failure_short_description : código tipo "LEAKAGE — SEAL WEAR"
- failure_catalog   : {category, object_part, symptom, cause}

Agrega en wr:
- support_equipment : lista de strings ["Hoist", "Pressure washer", "Compressor"]
- activity_class    : M001/E001/I001 etc.

Remueve fotos fake (cuadrados morados) → documents = [].
"""
import random
from api.database.connection import SessionLocal
from api.database.models import WorkRequestModel
from sqlalchemy.orm.attributes import flag_modified

random.seed(42)

# ── Catálogos ──────────────────────────────────────────────────────

SUGGESTED_ACTIONS_BY_PROBLEM = {
    "sello": [
        "Detener operación del equipo y asegurar área de trabajo.",
        "Aplicar LOTO en fuentes de energía eléctrica y mecánica.",
        "Despresurizar línea y drenar fluido residual.",
        "Retirar acople y protección del sello.",
        "Desmontar sello mecánico dañado con extractor adecuado.",
        "Inspeccionar y limpiar asientos del sello y eje.",
        "Instalar sello nuevo aplicando torque de fabricante.",
        "Reinstalar acople y verificar alineación con reloj comparador.",
        "Llenar sistema, purgar aire y probar a presión nominal.",
        "Verificar ausencia de fugas y monitorear 30 min.",
    ],
    "fuga": [
        "Detener operación del elevador horquilla y asegurar área de trabajo.",
        "Aplicar LOTO en fuentes de energía hidráulica.",
        "Despresurizar sistema hidráulico controladamente.",
        "Inspeccionar cilindro de ajuste de gap para identificar punto exacto de fuga.",
        "Desmontar cilindro hidráulico del equipo.",
        "Desmontar vástagos y componentes internos.",
        "Reemplazar sellos mecánicos y juntas dañadas.",
        "Limpiar cilindro internamente.",
        "Reasamblaje e instalación del cilindro.",
        "Presurizar sistema, verificar presión y ausencia de fugas.",
    ],
    "rodamiento": [
        "Parada coordinada con operaciones.",
        "LOTO completo y aseguramiento de carga suspendida.",
        "Retirar coraza superior y protecciones mecánicas.",
        "Desacoplar eje de accionamiento.",
        "Extraer rodamiento dañado con prensa hidráulica.",
        "Inspección visual y dimensional de alojamiento.",
        "Calentar rodamiento nuevo a 80°C e instalar en caliente.",
        "Ajustar juego axial según manual fabricante.",
        "Reinstalar coraza y verificar torque de pernos.",
        "Arranque en vacío 30 min y medición de vibración de aceptación.",
    ],
    "cinta": [
        "Bloqueo LOTO de correa principal y secundarias.",
        "Tensado y retiro gradual de correa dañada.",
        "Limpieza de tambor motriz y polines de retorno.",
        "Preparación de superficies de empalme con amoladora.",
        "Alineación de empalme con guías láser.",
        "Vulcanizado en caliente a 140°C por 45 min.",
        "Aplicación de presión con prensa vulcanizadora.",
        "Curado controlado y enfriamiento progresivo.",
        "Alineación y tensionado final de correa.",
        "Prueba de arranque al 30% de carga y monitoreo.",
    ],
    "vibraci": [
        "Análisis preliminar con acelerómetro portátil en modo stand-by.",
        "Documentar espectro FFT en puntos de medición estándar.",
        "Identificar frecuencias anormales y comparar con baseline.",
        "Aplicar LOTO y desacoplar motor de la carga.",
        "Medición de alineación láser shaft-to-shaft.",
        "Corrección de desalineación según manual fabricante.",
        "Inspección visual de rodamientos y lubricación.",
        "Balanceo dinámico in-situ si aplica.",
        "Arranque escalonado y nueva medición de validación.",
        "Documentar y archivar en historial de condición.",
    ],
    "corrosión": [
        "Inspección detallada del alcance de corrosión.",
        "Medición UT de espesor en zonas afectadas.",
        "Preparación de superficie (arenado grado SA 2.5).",
        "Tratamiento químico anti-corrosivo en zonas puntuales.",
        "Aplicación de primer epóxico rico en zinc.",
        "Aplicación de capa intermedia de tolerancia alta.",
        "Acabado con poliuretano alifático.",
        "Control de espesor seco con micrómetro.",
        "Verificación de continuidad eléctrica cuando aplica.",
        "Registro fotográfico pre y post intervención.",
    ],
    "aceite": [
        "LOTO completo del sistema de lubricación.",
        "Drenaje de aceite usado (registrar volumen).",
        "Toma de muestra para análisis ISO 4406.",
        "Limpieza de filtros de alta y baja presión.",
        "Reemplazo de cartuchos filtrantes.",
        "Cambio de juntas y retenes en puntos críticos.",
        "Recarga con aceite nuevo según especificación.",
        "Purga de aire del sistema hidráulico.",
        "Prueba de presión y verificación de temperatura.",
        "Monitoreo 30 min y registro de parámetros.",
    ],
    "default": [
        "Evaluación preliminar en sitio con supervisor.",
        "Aplicación de LOTO y perímetro de seguridad.",
        "Desmontaje controlado de componentes afectados.",
        "Inspección visual y dimensional de partes.",
        "Reemplazo o reparación según diagnóstico.",
        "Limpieza e inspección de componentes asociados.",
        "Montaje con torque y alineación según manual.",
        "Prueba funcional y verificación de parámetros.",
        "Retiro de LOTO y entrega al área operativa.",
        "Registro de intervención en historial del equipo.",
    ],
}

RESOURCES_TEMPLATES = [
    # (problem_keyword, resources_list)
    ("sello", [
        {"type": "Mechanical", "quantity": 2, "hours": 8},
        {"type": "Hydraulic Specialist", "quantity": 1, "hours": 8},
        {"type": "Helper", "quantity": 1, "hours": 6},
    ]),
    ("fuga", [
        {"type": "Mechanical", "quantity": 2, "hours": 8},
        {"type": "Hydraulic Specialist", "quantity": 1, "hours": 8},
        {"type": "Helper", "quantity": 1, "hours": 6},
        {"type": "Electrical", "quantity": 1, "hours": 2},
    ]),
    ("rodamiento", [
        {"type": "Mechanical", "quantity": 3, "hours": 16},
        {"type": "Rigger", "quantity": 2, "hours": 8},
        {"type": "Predictive Analyst", "quantity": 1, "hours": 3},
    ]),
    ("cinta", [
        {"type": "Mechanical", "quantity": 3, "hours": 12},
        {"type": "Vulcanizer", "quantity": 2, "hours": 8},
        {"type": "Helper", "quantity": 2, "hours": 12},
    ]),
    ("vibrac", [
        {"type": "Predictive Analyst", "quantity": 1, "hours": 4},
        {"type": "Mechanical", "quantity": 2, "hours": 6},
    ]),
    ("corrosión", [
        {"type": "Civil / Coating", "quantity": 2, "hours": 12},
        {"type": "Helper", "quantity": 2, "hours": 12},
    ]),
    ("aceite", [
        {"type": "Lubricator", "quantity": 2, "hours": 4},
        {"type": "Mechanical", "quantity": 1, "hours": 4},
    ]),
    ("default", [
        {"type": "Mechanical", "quantity": 2, "hours": 6},
        {"type": "Helper", "quantity": 1, "hours": 4},
        {"type": "Electrical", "quantity": 1, "hours": 2},
    ]),
]

SUPPORT_BY_PROBLEM = {
    "sello":    ["Hoist", "Pressure washer", "Compressor"],
    "fuga":     ["Hoist", "Pressure washer", "Compressor"],
    "rodamiento": ["Mobile crane 50t", "Hydraulic press", "Induction heater"],
    "cinta":    ["Vulcanizing press", "Belt clamp", "Chain block"],
    "vibrac":   ["Laser alignment tool", "Vibration analyzer"],
    "corrosión": ["Scaffolding", "Sandblast equipment", "Paint sprayer"],
    "aceite":   ["Oil evacuation pump", "Flushing kit"],
    "default":  ["Toolbox", "Hoist"],
}

ACTIVITY_CODES = {
    "MECANICO": ["M001", "M002", "M003"],
    "ELECTRICO": ["E001", "E002"],
    "INSTRUMENTISTA": ["I001", "I002"],
}


def _pick_key(problem_text):
    low = (problem_text or "").lower()
    for kw in ["sello", "fuga", "rodamiento", "cinta", "empalme", "vibrac", "corrosión", "corrosion", "aceite", "lubric", "ruido"]:
        if kw in low:
            # Normalize variants
            if kw == "empalme": return "cinta"
            if kw == "corrosion": return "corrosión"
            if kw == "ruido": return "rodamiento"
            if kw == "lubric": return "aceite"
            return kw
    return "default"


def make_suggested_action(problem):
    key = _pick_key(problem)
    steps = SUGGESTED_ACTIONS_BY_PROBLEM.get(key, SUGGESTED_ACTIONS_BY_PROBLEM["default"])
    return "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))


def make_resources(problem):
    key = _pick_key(problem)
    for k, res in RESOURCES_TEMPLATES:
        if k == key:
            return [dict(r) for r in res]
    return [dict(r) for r in RESOURCES_TEMPLATES[-1][1]]


def make_support_equipment(problem):
    key = _pick_key(problem)
    return SUPPORT_BY_PROBLEM.get(key, SUPPORT_BY_PROBLEM["default"])


def make_failure_catalog(problem):
    low = (problem or "").lower()
    if "sello" in low or "fuga" in low:
        return {"category": "LEAKAGE", "object_part": "SEAL", "symptom": "SEAL WEAR", "cause": "SEAL WEAR"}
    if "rodamiento" in low:
        return {"category": "BEARING FAILURE", "object_part": "BEARING", "symptom": "ABNORMAL NOISE", "cause": "FATIGUE WEAR"}
    if "vibrac" in low:
        return {"category": "VIBRATION", "object_part": "ROTATING ASSEMBLY", "symptom": "HIGH VIBRATION", "cause": "MISALIGNMENT / IMBALANCE"}
    if "cinta" in low or "empalme" in low:
        return {"category": "CONVEYOR WEAR", "object_part": "BELT", "symptom": "SURFACE WEAR", "cause": "ABRASION"}
    if "corrosión" in low or "corrosion" in low:
        return {"category": "CORROSION", "object_part": "STRUCTURE", "symptom": "MATERIAL LOSS", "cause": "ENVIRONMENTAL EXPOSURE"}
    if "aceite" in low or "lubric" in low:
        return {"category": "LUBRICATION", "object_part": "OIL SYSTEM", "symptom": "CONTAMINATION", "cause": "FILTER SATURATION"}
    return {"category": "FUNCTIONAL", "object_part": "ASSEMBLY", "symptom": "PERFORMANCE LOSS", "cause": "TBD"}


def make_failure_short(catalog):
    return f"{catalog['category']} — {catalog['symptom']} ({catalog['cause']})"


# ── Main ────────────────────────────────────────────────────────────

db = SessionLocal()
wrs = db.query(WorkRequestModel).all()
updated = 0
for wr in wrs:
    problem = (wr.problem_description or {}).get("whatHappens", "") if isinstance(wr.problem_description, dict) else ""
    catalog = make_failure_catalog(problem)

    pd = wr.problem_description or {}
    pd["suggested_action"] = make_suggested_action(problem)
    pd["resources"] = make_resources(problem)
    pd["materials"] = [
        {
            "code": p.get("code"),
            "description": p.get("description") or p.get("name") or "",
            "quantity": p.get("qty") or p.get("quantity") or 1,
            "unit": p.get("unit", "UN"),
        }
        for p in (wr.spare_parts or [])
    ]
    pd["failure_short_description"] = make_failure_short(catalog)
    pd["failure_catalog"] = catalog

    wr.problem_description = pd
    wr.support_equipment = make_support_equipment(problem)

    # activity_class según especialidad sugerida
    ai = wr.ai_classification or {}
    spec = ai.get("suggested_specialty", "MECANICO")
    wr.activity_class = random.choice(ACTIVITY_CODES.get(spec, ACTIVITY_CODES["MECANICO"]))

    # Limpiar fotos fake (cuadrados morados) — el b64 1x1 se estiraba feo
    wr.documents = []

    flag_modified(wr, "problem_description")
    flag_modified(wr, "support_equipment")
    flag_modified(wr, "documents")
    updated += 1

db.commit()
db.close()
print(f"✅ Completed {updated} WRs · suggested_action, resources, materials, failure_catalog, support_equipment, activity_class")
