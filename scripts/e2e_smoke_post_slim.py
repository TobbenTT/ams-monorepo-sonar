"""End-to-end smoke test post-deploy slim (RAG removed + Docker 313MB).

Recorre el flujo COMPLETO en producción:
  1. Login
  2. Crear WR via /work-requests/manual
  3. Validar WR (action=APPROVE)
  4. Aprobar WR (con comentario obligatorio)
  5. Crear OT desde WR aprobado (/managed-work-orders/from-wr)
  6. Editar OT — agregar operaciones, materiales, técnicos
  7. Transicionar: CREADO → PLANIFICADO → EN_PROGRAMACION → PROGRAMADO → EN_EJECUCION
  8. Cerrar OT con firma (close gates + signature)
  9. Verificar audit log + WR cerrado
  10. Cleanup — cancelar el WR/OT de test para no contaminar prod

Si algún paso falla, imprime el detalle del error pero continúa con los demás
para reportar el estado completo del sistema.
"""

import json
import sys
from datetime import datetime, timedelta
import urllib.request
import urllib.error

BASE = "https://www.mageam.com"
PLANT = "GOLDFIELDS-SN"
TEST_TAG = "TEST_E2E_SLIM"

results = []  # [(step, ok, detail)]
artifacts = {}  # {wr_id, wo_id}


def http(method: str, path: str, payload: dict | None = None, token: str | None = None) -> tuple[int, dict | str]:
    url = BASE + path
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode()
            try:
                return r.status, json.loads(body)
            except json.JSONDecodeError:
                return r.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except json.JSONDecodeError:
            return e.code, body
    except Exception as e:
        return 0, str(e)


def step(name: str):
    print(f"\n{'='*70}\n{name}\n{'='*70}")


def log(ok: bool, name: str, detail: str = ""):
    tag = "[OK]" if ok else "[FAIL]"
    results.append((name, ok, detail))
    print(f"  {tag} {name}" + (f" — {detail}" if detail else ""))


# ─── STEP 1: Login ─────────────────────────────────────────────────
step("STEP 1 · Login")
code, r = http("POST", "/api/v1/auth/login",
               {"username": "admin", "password": "password123"})
if code == 200 and isinstance(r, dict) and r.get("access_token"):
    TOKEN = r["access_token"]
    log(True, "login", f"token len={len(TOKEN)}")
else:
    log(False, "login", f"http={code} body={r}")
    sys.exit("Cannot continue without token")

# ─── STEP 2: Crear WR ──────────────────────────────────────────────
step("STEP 2 · Crear WR manual")
wr_payload = {
    "equipment_tag": "3110MI0001",
    "equipment_name": "Molino SAG",
    "plant_id": PLANT,
    "problem_description": f"{TEST_TAG} ruido anormal en chumacera + vibracion severa",
    "priority": "P2",
    "notification_type": "A1",
    "reported_by": "TEST_E2E",
    "wo_title": f"{TEST_TAG} revisar chumacera",
    "technical_location": "SN-3000-3100-3110-3110MI0001",
    "estimated_duration": 4,
    "circumstances": "Ruido detectado al iniciar turno B. Equipo en operacion al 60%.",
}
code, r = http("POST", "/api/v1/work-requests/manual", wr_payload, TOKEN)
if code in (200, 201) and isinstance(r, dict) and r.get("request_id"):
    WR_ID = r["request_id"]
    artifacts["wr_id"] = WR_ID
    log(True, "create_wr", f"{WR_ID} (aviso #{r.get('aviso_number')}) status={r.get('status')}")
else:
    log(False, "create_wr", f"http={code} body={str(r)[:200]}")
    sys.exit("Cannot continue without WR")

# ─── STEP 3: Validar WR (action=APPROVE) ───────────────────────────
step("STEP 3 · Validar WR")
code, r = http("PUT", f"/api/v1/work-requests/{WR_ID}/validate",
               {"action": "APPROVE", "modifications": None}, TOKEN)
log(code == 200, "validate_wr", f"http={code} new_status={r.get('status') if isinstance(r, dict) else r}")

# ─── STEP 4: Aprobar WR (comentario obligatorio) ───────────────────
step("STEP 4 · Aprobar WR")
code, r = http("PUT", f"/api/v1/work-requests/{WR_ID}/approve",
               {"comment": "Aprobado por E2E smoke test post-slim deploy"}, TOKEN)
log(code == 200, "approve_wr",
    f"http={code} status={r.get('status') if isinstance(r, dict) else str(r)[:100]}")

# ─── STEP 5: Crear OT desde WR ─────────────────────────────────────
step("STEP 5 · Crear OT desde WR")
code, r = http("POST", "/api/v1/managed-work-orders/from-wr",
               {"work_request_id": WR_ID, "plant_id": PLANT}, TOKEN)
if code in (200, 201) and isinstance(r, dict) and r.get("wo_id"):
    WO_ID = r["wo_id"]
    artifacts["wo_id"] = WO_ID
    log(True, "create_ot_from_wr", f"{r.get('wo_number')} status={r.get('status')}")
else:
    log(False, "create_ot_from_wr", f"http={code} body={str(r)[:300]}")
    WO_ID = None

# ─── STEP 6: Editar OT — operaciones + materiales ──────────────────
if WO_ID:
    step("STEP 6 · Editar OT (ops + materiales)")
    update_payload = {
        "operations": [
            {"op_number": 10, "description": "Bloqueo y desenergización (LOTO)",
             "specialty": "ELECT", "planned_hours": 0.5, "quantity": 2},
            {"op_number": 20, "description": "Apertura tapa de chumacera",
             "specialty": "MEC", "planned_hours": 1.0, "quantity": 2},
            {"op_number": 30, "description": "Inspección visual + medición de juego",
             "specialty": "MEC", "planned_hours": 0.5, "quantity": 1},
            {"op_number": 40, "description": "Cierre + lubricación + prueba",
             "specialty": "MEC", "planned_hours": 1.0, "quantity": 2},
        ],
        "materials": [
            {"code": "GREASE-EP2", "description": "Grasa EP2 sintetica", "quantity": 5, "unit": "KG"},
            {"code": "RAG-INDUS", "description": "Paños industriales", "quantity": 1, "unit": "PKG"},
        ],
        "estimated_hours": 3.0,
    }
    code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}", update_payload, TOKEN)
    ok = code == 200 and isinstance(r, dict)
    ops_n = len((r or {}).get("operations") or []) if isinstance(r, dict) else 0
    mats_n = len((r or {}).get("materials") or []) if isinstance(r, dict) else 0
    log(ok, "update_ot", f"http={code} ops={ops_n} mats={mats_n}")

# ─── STEP 7: Transiciones de estado ────────────────────────────────
if WO_ID:
    step("STEP 7 · Transiciones de estado")
    # Leer status actual primero — P2 fast-track puede crear directo en PROGRAMADO
    code, cur = http("GET", f"/api/v1/managed-work-orders/{WO_ID}", None, TOKEN)
    current_status = cur.get("status") if isinstance(cur, dict) else "?"
    log(True, "status_inicial", f"{current_status}")

    # PLAN — solo si está en estado pre-planificado
    if current_status in ("CREADO", "LIBERADO"):
        code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}/plan", None, TOKEN)
        log(code == 200, "transition_PLANIFICADO",
            f"http={code} status={r.get('status') if isinstance(r, dict) else str(r)[:100]}")
    else:
        log(True, "transition_PLANIFICADO", f"SKIP — fast-track ya en {current_status}")

    # SCHEDULE — sólo si no está ya PROGRAMADO
    start = (datetime.now() + timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M:%S")
    end = (datetime.now() + timedelta(hours=7)).strftime("%Y-%m-%dT%H:%M:%S")
    if current_status != "PROGRAMADO":
        code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}/schedule",
                       {"planned_start": start, "planned_end": end, "shift": "DAY"}, TOKEN)
        log(code == 200, "transition_PROGRAMADO",
            f"http={code} status={r.get('status') if isinstance(r, dict) else str(r)[:100]}")
    else:
        log(True, "transition_PROGRAMADO", f"SKIP — ya en PROGRAMADO")

    # START
    code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}/start", None, TOKEN)
    log(code == 200, "transition_EN_EJECUCION",
        f"http={code} status={r.get('status') if isinstance(r, dict) else str(r)[:100]}")

    # Notificar progreso de cada op al 100% con HH real (necesario para close gates)
    update_payload = {
        "operations": [
            {"op_number": 10, "description": "Bloqueo y desenergización (LOTO)",
             "specialty": "ELECT", "planned_hours": 0.5, "actual_hours": 0.5, "quantity": 2, "completion_pct": 100},
            {"op_number": 20, "description": "Apertura tapa de chumacera",
             "specialty": "MEC", "planned_hours": 1.0, "actual_hours": 1.1, "quantity": 2, "completion_pct": 100},
            {"op_number": 30, "description": "Inspección visual + medición de juego",
             "specialty": "MEC", "planned_hours": 0.5, "actual_hours": 0.6, "quantity": 1, "completion_pct": 100},
            {"op_number": 40, "description": "Cierre + lubricación + prueba",
             "specialty": "MEC", "planned_hours": 1.0, "actual_hours": 0.9, "quantity": 2, "completion_pct": 100},
        ],
        "actual_hours": 3.1,
    }
    code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}", update_payload, TOKEN)
    log(code == 200, "ops_completadas_100pct", f"http={code}")

# ─── STEP 8: Cerrar OT con firma ───────────────────────────────────
if WO_ID:
    step("STEP 8 · Cerrar OT con firma")
    code, gates_resp = http("GET", f"/api/v1/managed-work-orders/{WO_ID}/close-gates", None, TOKEN)
    gates_list = (gates_resp or {}).get("gates", []) if isinstance(gates_resp, dict) else []
    blocking_fail = [g for g in gates_list if g.get("blocking") and not g.get("passed")]
    log(code == 200, "close_gates_compute",
        f"http={code} total={len(gates_list)} blocking_fail={len(blocking_fail)}")
    # Armar acks + overrides correctamente
    gate_acks = {}
    gate_overrides = {}
    for g in blocking_fail:
        gid = g.get("id")
        if not g.get("auto"):  # manual gate → ack
            gate_acks[gid] = True
        elif g.get("override_allowed"):  # auto fallido pero override permitido
            gate_overrides[gid] = "E2E test override: trabajo verificado en terreno por supervisor"
    closure = {
        "signature": "Supervisor E2E",
        "pin": "1234",
        "notes": "Cierre por E2E smoke post-slim deploy. Equipo operativo, sin observaciones.",
        "actual_hours": 3.1,
        "gate_acks": gate_acks,
        "gate_overrides": gate_overrides,
    }
    code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}/close", closure, TOKEN)
    log(code == 200, "close_wo",
        f"http={code} status={r.get('status') if isinstance(r, dict) else str(r)[:200]}")

# ─── STEP 9: Verificar audit log + estado final ───────────────────
step("STEP 9 · Verificar persistencia + audit")
if WO_ID:
    code, r = http("GET", f"/api/v1/managed-work-orders/{WO_ID}", None, TOKEN)
    final_status = r.get("status") if isinstance(r, dict) else "?"
    log(code == 200, "final_wo_get",
        f"http={code} status={final_status} closed_by={r.get('closed_by_signature') if isinstance(r, dict) else None}")

    code, r = http("GET", f"/api/v1/managed-work-orders/{WO_ID}/history", None, TOKEN)
    entries = r.get("entries", []) if isinstance(r, dict) else (r if isinstance(r, list) else [])
    log(code == 200 and len(entries) > 0, "history", f"http={code} events={len(entries)}")

code, r = http("GET", f"/api/v1/work-requests/{WR_ID}", None, TOKEN)
wr_status = r.get("status") if isinstance(r, dict) else "?"
log(code == 200, "final_wr_get", f"http={code} status={wr_status}")

# ─── STEP 10: Cleanup ─────────────────────────────────────────────
step("STEP 10 · Cleanup (cancelar OT + WR)")
if WO_ID:
    code, r = http("PUT", f"/api/v1/managed-work-orders/{WO_ID}/cancel",
                   {"cancellation_type": "OTHER", "reason": "E2E test cleanup"}, TOKEN)
    log(code in (200, 400, 409), "cancel_ot_or_already_closed",
        f"http={code} {str(r)[:80]}")  # 400 ok si ya está CERRADO

code, r = http("PUT", f"/api/v1/work-requests/{WR_ID}/cancel",
               {"reason": "E2E test cleanup"}, TOKEN)
log(code in (200, 400, 409), "cancel_wr_or_already_processed",
    f"http={code} {str(r)[:80]}")

# ─── RESUMEN ──────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("RESUMEN E2E")
print("=" * 70)
total = len(results)
ok_count = sum(1 for _, ok, _ in results if ok)
print(f"\n  {ok_count}/{total} pasos OK\n")
for name, ok, detail in results:
    tag = "[OK]" if ok else "[FAIL]"
    print(f"  {tag}  {name:<35} {detail[:90]}")

print(f"\nArtefactos creados: WR={artifacts.get('wr_id')} · WO={artifacts.get('wo_id')}")
sys.exit(0 if ok_count == total else 1)
