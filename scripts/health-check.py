#!/usr/bin/env python3
"""AMS Platform — Post-deployment health check.

Run: python3 scripts/health-check.py [base_url]
Default: http://localhost:8080

Verifies all critical subsystems are operational.
"""

import sys
import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
API = f"{BASE}/api/v1"
ADMIN = {"username": "admin", "password": "password123"}

results = []

def check(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    results.append((status, name, detail))
    icon = "\u2705" if ok else "\u274C"
    print(f"  {icon} {name}{f' — {detail}' if detail else ''}")

print(f"\n{'='*60}")
print(f"  AMS Platform Health Check")
print(f"  Target: {BASE}")
print(f"{'='*60}\n")

# 1. Frontend
print("[1/7] Frontend...")
try:
    r = httpx.get(f"{BASE}/", timeout=10, follow_redirects=True)
    check("Frontend serves HTML", r.status_code == 200 and "<!DOCTYPE" in r.text[:100])
except Exception as e:
    check("Frontend serves HTML", False, str(e)[:60])

# 2. Auth
print("[2/7] Authentication...")
try:
    r = httpx.post(f"{API}/auth/login", json=ADMIN, timeout=10)
    token = r.json().get("access_token", "") if r.status_code == 200 else ""
    check("Login endpoint", r.status_code == 200 and bool(token))
    headers = {"Authorization": f"Bearer {token}"}
except Exception as e:
    check("Login endpoint", False, str(e)[:60])
    headers = {}
    token = ""

# 3. Core API
print("[3/7] Core API endpoints...")
if token:
    endpoints = [
        ("Plants", "/hierarchy/plants"),
        ("Work Requests", "/work-requests/"),
        ("Work Orders", "/managed-work-orders/"),
        ("Backlog", "/backlog"),
        ("Scheduling", "/scheduling/programs"),
        ("Execution Tasks", "/execution/tasks"),
        ("Notifications", "/notifications"),
        ("Feedback", "/feedback"),
        ("Users", "/auth/users"),
    ]
    for name, path in endpoints:
        try:
            r = httpx.get(f"{API}{path}", headers=headers, timeout=10)
            check(name, r.status_code < 400)
        except Exception as e:
            check(name, False, str(e)[:40])

# 4. Analytics & Dashboard
print("[4/7] Analytics & Dashboard...")
if token:
    plants_r = httpx.get(f"{API}/hierarchy/plants", headers=headers, timeout=10)
    plants = plants_r.json() if plants_r.status_code == 200 else []
    plant_id = plants[0]["plant_id"] if plants else "GOLDFIELDS-SN"
    for name, path in [
        ("Dashboard KPIs", f"/dashboard/kpi-summary/{plant_id}"),
        ("Analytics Page", f"/analytics/page-data/{plant_id}?start=2026-01-01&end=2026-12-31"),
        ("Reports Generate", "/reporting/generate-report?report_type=operational"),
    ]:
        try:
            r = httpx.get(f"{API}{path}", headers=headers, timeout=15)
            check(name, r.status_code < 400)
        except Exception as e:
            check(name, False, str(e)[:40])

# 5. AI/Agentic
print("[5/7] AI & Agentic Services...")
if token:
    try:
        r = httpx.get(f"{API}/agentic/status", headers=headers, timeout=10)
        check("Agentic Status", r.status_code < 400)
    except Exception as e:
        check("Agentic Status", False, str(e)[:40])
    try:
        r = httpx.post(f"{API}/agentic/kpi-watchdog", headers=headers, json={"plant_id": plant_id}, timeout=15)
        check("KPI Watchdog Agent", r.status_code < 400)
    except Exception as e:
        check("KPI Watchdog Agent", False, str(e)[:40])

# 6. Security Headers
print("[6/7] Security headers...")
try:
    r = httpx.get(f"{BASE}/api/v1/hierarchy/plants", headers=headers, timeout=10)
    hdrs = {k.lower(): v for k, v in r.headers.items()}
    check("X-Content-Type-Options", "nosniff" in hdrs.get("x-content-type-options", ""))
    check("X-Frame-Options", hdrs.get("x-frame-options", "") in ["DENY", "SAMEORIGIN"])
    check("Strict-Transport-Security", "max-age" in hdrs.get("strict-transport-security", ""))
    check("Content-Security-Policy", "default-src" in hdrs.get("content-security-policy", ""))
except Exception as e:
    check("Security headers", False, str(e)[:60])

# 7. Performance
print("[7/7] Performance...")
try:
    r = httpx.get(f"{BASE}/", headers={"Accept-Encoding": "gzip"}, timeout=10, follow_redirects=True)
    check("Gzip compression", "gzip" in r.headers.get("content-encoding", ""))
except Exception as e:
    check("Gzip compression", False, str(e)[:60])

# Summary
print(f"\n{'='*60}")
passed = sum(1 for s, _, _ in results if s == "PASS")
failed = sum(1 for s, _, _ in results if s == "FAIL")
total = len(results)
pct = round(passed / total * 100) if total else 0
print(f"  Results: {passed}/{total} passed ({pct}%)")
if failed:
    print(f"  Failed checks:")
    for s, name, detail in results:
        if s == "FAIL":
            print(f"    - {name}{f': {detail}' if detail else ''}")
print(f"{'='*60}\n")

sys.exit(0 if failed == 0 else 1)
