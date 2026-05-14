#!/usr/bin/env bash
# AMS — Suite QA local (alineada con Carlos: pytest-cov + ruff)
# Uso: bash scripts/qa.sh [--fix]
#
# Reporta:
#  - Errores Ruff (rules E,F)
#  - Advertencias Ruff (rules W,I,B,UP,SIM,C4)
#  - Cobertura % (backend api/ + packages/tools)
#  - Tests pasando / failing / skipped

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FIX_FLAG=""
if [ "${1:-}" = "--fix" ]; then
    FIX_FLAG="--fix"
    echo "🔧 Modo --fix: aplicará cambios automáticos donde Ruff pueda"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  AMS — QA Local Report ($(date +%Y-%m-%d\ %H:%M))"
echo "════════════════════════════════════════════════════════════"

# ── 1. Lint con Ruff ───────────────────────────────────────────────
echo ""
echo "▸ RUFF · errores (E + F)"
ERRORS=$(ruff check . --select=E,F --no-fix --output-format=concise 2>&1 | grep -c ":" || echo 0)
echo "  $ERRORS errores"

echo ""
echo "▸ RUFF · advertencias (W + I + B + UP + SIM + C4)"
WARNINGS=$(ruff check . --select=W,I,B,UP,SIM,C4 --no-fix --output-format=concise 2>&1 | grep -c ":" || echo 0)
echo "  $WARNINGS advertencias"

if [ -n "$FIX_FLAG" ]; then
    echo ""
    echo "▸ Aplicando autofixes..."
    ruff check . $FIX_FLAG 2>&1 | tail -3
fi

# ── 2. Cobertura con pytest-cov ────────────────────────────────────
echo ""
echo "▸ PYTEST · cobertura backend"
COV_OUTPUT=$(python -m pytest tests/test_api/ \
    --cov=api --cov=tools \
    --cov-report=term-missing:skip-covered \
    --tb=no -q 2>&1 | tail -10)
echo "$COV_OUTPUT"

COVERAGE=$(echo "$COV_OUTPUT" | grep "TOTAL" | awk '{print $NF}' | tr -d '%')
PASSED=$(echo "$COV_OUTPUT" | grep -oE '[0-9]+ passed' | head -1)
FAILED=$(echo "$COV_OUTPUT" | grep -oE '[0-9]+ failed' | head -1)
SKIPPED=$(echo "$COV_OUTPUT" | grep -oE '[0-9]+ skipped' | head -1)

# ── 3. Resumen ─────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  RESUMEN"
echo "════════════════════════════════════════════════════════════"
echo "  Errores Ruff       : ${ERRORS}"
echo "  Advertencias Ruff  : ${WARNINGS}"
echo "  Cobertura backend  : ${COVERAGE:-?}%"
echo "  Tests              : ${PASSED:-?} ${FAILED:+| $FAILED} ${SKIPPED:+| $SKIPPED}"
echo ""
echo "  Objetivo Magda     : Cobertura ≥ 50%"
echo "  Objetivo Carlos    : Errores < 500"
echo "════════════════════════════════════════════════════════════"
