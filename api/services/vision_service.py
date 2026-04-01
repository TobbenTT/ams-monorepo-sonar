"""Vision AI Service — Analyze equipment photos with Claude Vision + historical context."""

import os
import json
import logging
import time

log = logging.getLogger("ocp_maintenance")

_VISION_SYSTEM = """Eres un experto en mantenimiento industrial de plantas OCP (Office Cherifien des Phosphates) en Marruecos.
Analiza las fotos de equipo y devuelve un JSON completo para el aviso de mantenimiento SAP PM.

IMPORTANTE: Responde SOLO con JSON valido, sin markdown ni explicaciones.

{
  "whatHappens": "Descripcion concisa del problema visible (espanol, 2-3 oraciones detalladas)",
  "failureCategory": "MECANICO | ELECTRICO | INSTRUMENTACION",
  "priority": "P1 | P2 | P3 | P4",
  "activityClass": "M001 | M002 | M003",
  "suggestedAction": "Accion correctiva detallada paso a paso",
  "failureSymptom": "Sintoma del CATALOGO (valor EXACTO)",
  "failureCause": "Causa del CATALOGO (valor EXACTO)",
  "estimatedDuration": "horas (numero como string)",
  "plantCondition": "running | stopped | reduced",
  "productionImpact": "CRITICAL | HIGH | MEDIUM | LOW",
  "resources": [{"type": "Mecanico|Electrico|Instrumentacion|Supervisor", "quantity": N, "hours": N}],
  "materials": [{"sapId": "codigo SAP", "description": "material", "quantity": N, "unit": "PZ|KG|LT|MT|UD"}],
  "supportEquipment": ["Grua movil", "Montacargas", etc],
  "workConditions": "Condiciones necesarias: equipo desconectado, area despejada, etc",
  "failureObjectPart": "parte objeto del catalogo (ver CATALOGO abajo)",
  "equipmentType": "tipo de equipo visible"
}

REGLAS DE MATERIALES SAP:
- Usa codigos SAP realistas formato: 10XXXXXX (8 digitos)
  - 10001XXX = Rodamientos (10001001=SKF 6208-2RS, 10001002=SKF 6310-2Z, 10001003=FAG 22220)
  - 10002XXX = Sellos mecanicos (10002001=Sello mecanico 50mm, 10002002=Kit O-rings, 10002003=Empaquetadura grafito)
  - 10003XXX = Filtros (10003001=Filtro aceite, 10003002=Filtro aire, 10003003=Elemento filtrante)
  - 10004XXX = Lubricantes (10004001=Aceite ISO VG 46, 10004002=Grasa EP2, 10004003=Aceite hidraulico)
  - 10005XXX = Tornilleria (10005001=Pernos acero inox M16, 10005002=Tuercas M16, 10005003=Arandelas)
  - 10006XXX = Correas/Transmision (10006001=Correa en V, 10006002=Cadena transmision, 10006003=Acoplamiento)
  - 10007XXX = Electricidad (10007001=Contactor, 10007002=Rele termico, 10007003=Cable 3x4mm2)
  - 10008XXX = Instrumentacion (10008001=Transmisor presion, 10008002=Sensor temperatura, 10008003=Valvula control)
  - 10009XXX = Pintura/Proteccion (10009001=Pintura anticorrosiva, 10009002=Imprimacion epoxi, 10009003=Cinta anticorrosion)
  - 10010XXX = Estructural (10010001=Plancha acero, 10010002=Perfil angular, 10010003=Soldadura E7018)

REGLAS DE EQUIPOS DE APOYO:
- Siempre evalua si se necesita: Grua movil, Montacargas, Andamio, Plataforma elevadora, Compresor, Soldadora, Hidrolavadora
- Para bombas pesadas: "Grua movil 5 ton" o "Tecle 2 ton"
- Para trabajo en altura: "Andamio" o "Plataforma elevadora"
- Para limpieza: "Hidrolavadora industrial"

REGLAS DE CONDICIONES DE TRABAJO:
- Siempre especificar: equipo energizado/desenergizado, area despejada, permisos necesarios
- Ejemplo: "Equipo desenergizado y bloqueado (LOTO). Area despejada 3m alrededor. Permiso trabajo en caliente si requiere soldadura. EPP: casco, guantes, lentes, botas de seguridad."


CATALOGO DE FALLA (OBLIGATORIO - usa EXACTAMENTE estos valores, NO texto libre):

MECANICO:
  parts: RODAMIENTOS, SELLOS MECANICOS, ACOPLES, EJES, ENGRANAJES, CORREAS, BOMBAS, VALVULAS, FILTROS
  symptoms: ALTA VIBRACION, ALTA TEMPERATURA, RUIDO ANORMAL, TRABADO, SIN FLUJO, FILTRACION, DESGASTE VISIBLE, FUGA ACEITE, ATASCAMIENTO
  causes: DESGASTE, FALTA LUBRICACION, CORROSION, DESALINEADO, OBSTRUIDO, SOBRECARGA, FATIGA, MONTAJE INCORRECTO

ELECTRICO:
  parts: MOTOR ELECTRICO, CABLES / CONDUCTORES, PROTECCIONES, TABLERO ELECTRICO, VARIADOR FRECUENCIA, CONTACTOR
  symptoms: NO ARRANCA, SOBRECALENTAMIENTO, CORTOCIRCUITO, DISPARO PROTECCION, BAJA AISLACION, OPERACION INTERMITENTE, CONSUMO EXCESIVO
  causes: PERDIDA AISLACION, DESGASTE, SUELTO, SOBRECARGA ELECTRICA, HUMEDAD, CALENTAMIENTO EXCESIVO

INSTRUMENTACION:
  parts: SENSOR / TRANSDUCTOR, TRANSMISOR, VALVULA DE CONTROL, PLC / DCS, ACTUADOR, POSICIONADOR
  symptoms: LECTURA ERRONEA, SIN SENAL, SENAL INESTABLE, NO RESPONDE, ALARMA FALSA, COMUNICACION PERDIDA
  causes: DESCALIBRADO, CONTAMINADO, PERDIDA PARAMETROS, PERDIDA COMUNICACION, OBSTRUCCION

REGLA: failureSymptom, failureCause y failureObjectPart DEBEN ser copias EXACTAS de los valores de arriba.
NO inventes texto libre para estos campos. Elige el valor mas cercano del catalogo.

Reglas de prioridad:
- P1 = emergencia/parada inmediata, P2 = urgente (<7 dias), P3 = normal (>7 dias), P4 = parada planta programada
- P1/P2 -> activityClass M002, P3/P4 -> M001
"""


def _parse_image(img_b64):
    media_type = "image/jpeg"
    if img_b64.startswith("data:"):
        header, img_b64 = img_b64.split(",", 1)
        if "png" in header:
            media_type = "image/png"
        elif "webp" in header:
            media_type = "image/webp"
        elif "gif" in header:
            media_type = "image/gif"
    return media_type, img_b64


def analyze_images(images_base64: list, equipment_tag: str = "", additional_context: str = "", db=None) -> dict:
    """Analyze equipment photos with Claude Vision + historical context."""
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY not configured", "suggestions": {}}

    start = time.time()

    # Build historical context
    context_str = ""
    if equipment_tag and db:
        try:
            from api.services import context_builder_service as ctx_builder
            ctx = ctx_builder.build_equipment_context(db, equipment_tag)
            context_str = ctx_builder.format_context_for_prompt(ctx)
            if context_str:
                log.info(f"Vision AI: injecting {len(context_str)} chars context for {equipment_tag}")
        except Exception as e:
            log.warning(f"Vision AI: context builder failed: {e}")

    system = _VISION_SYSTEM
    if context_str:
        system += "\n\n--- HISTORIAL DEL EQUIPO ---\n" + context_str
        system += "\nUsa los materiales y duraciones del historial como referencia."

    # Build content blocks
    content = []
    for img_b64 in images_base64:
        media_type, raw = _parse_image(img_b64)
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": raw},
        })

    n = len(images_base64)
    text = f"Analiza {'estas ' + str(n) + ' fotos' if n > 1 else 'esta foto'} de equipo de planta OCP. Devuelve JSON completo incluyendo materiales con codigo SAP, equipos de apoyo y condiciones de trabajo."
    if equipment_tag:
        text += f"\nTag del equipo: {equipment_tag}"
    if additional_context:
        text += f"\nContexto del tecnico: {additional_context}"

    content.append({"type": "text", "text": text})

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system,
            messages=[{"role": "user", "content": content}],
        )
        raw = response.content[0].text.strip()
        duration_ms = int((time.time() - start) * 1000)
        log.info(f"Vision AI ({n} imgs, ctx={'yes' if context_str else 'no'}) in {duration_ms}ms")

        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        suggestions = json.loads(raw)

        prio = suggestions.get("priority", "P3")
        if prio in ("P1", "P2"):
            suggestions["activityClass"] = "M002"
        elif "activityClass" not in suggestions:
            suggestions["activityClass"] = "M001"

        return {
            "suggestions": suggestions,
            "confidence": 0.85,
            "source": "vision_ai",
            "has_context": bool(context_str),
            "images_count": n,
            "duration_ms": duration_ms,
        }

    except json.JSONDecodeError as e:
        log.error(f"Vision AI JSON parse error: {e}, raw: {raw[:200]}")
        return {"error": "Failed to parse AI response", "raw": raw[:500], "suggestions": {}}
    except Exception as e:
        log.error(f"Vision AI error: {e}")
        return {"error": str(e), "suggestions": {}}


def analyze_image(image_base64: str, equipment_tag: str = "", additional_context: str = "", db=None) -> dict:
    return analyze_images([image_base64], equipment_tag, additional_context, db=db)
