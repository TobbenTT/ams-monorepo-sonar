#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# AMS / Mageam — Backup diario de la BD SQLite
#
# Hace:
#   1. Snapshot consistente con `sqlite3 .backup` (no rompe writes).
#   2. Comprime con gzip.
#   3. Rotación local: 7 daily + 4 weekly + 12 monthly.
#   4. Sube a Backblaze B2 si rclone/rclone.conf está configurado
#      (perfil "b2"). Si no hay perfil, omite el off-site silently.
#   5. Loggea resultado con tamaño + duración.
#
# Cron: /etc/cron.d/ams_backup → 0 3 * * * root /usr/local/bin/ams_backup.sh
# Logs: /var/log/ams_backup.log + journal
#
# Restauración: ver docs/RESTORE_PROCEDURE.md
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────
DB_SRC="/var/lib/docker/volumes/ocp_db_data/_data/ocp_maintenance.db"
DEST_BASE="/var/backups/ams"
DAILY_DIR="${DEST_BASE}/daily"
WEEKLY_DIR="${DEST_BASE}/weekly"
MONTHLY_DIR="${DEST_BASE}/monthly"
LOG_FILE="/var/log/ams_backup.log"
RCLONE_REMOTE="b2:ams-backups"  # cambia si tu remote tiene otro nombre

DAILY_KEEP=7
WEEKLY_KEEP=4
MONTHLY_KEEP=12

DATE_STAMP=$(date +%Y%m%d_%H%M%S)
DATE_DAY=$(date +%u)        # 1=Mon … 7=Sun
DATE_DOM=$(date +%d)        # 01..31
TS_START=$(date +%s)

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

fail() {
  log "ERROR: $*"
  exit 1
}

# ── 1. Verificar fuente ─────────────────────────────────────────────
[ -r "$DB_SRC" ] || fail "DB no legible: $DB_SRC"
SRC_SIZE=$(stat -c%s "$DB_SRC")
log "Inicio backup · src=$DB_SRC tamaño=${SRC_SIZE}B"

# ── 2. Snapshot consistente ─────────────────────────────────────────
TMP_FILE="$(mktemp /tmp/ams_backup_XXXX.db)"
trap 'rm -f "$TMP_FILE" "$TMP_FILE.gz"' EXIT

sqlite3 "$DB_SRC" ".backup '$TMP_FILE'" || fail "sqlite3 .backup falló"

# Verificar integridad del snapshot antes de comprimir.
INTEGRITY=$(sqlite3 "$TMP_FILE" "PRAGMA integrity_check;" 2>&1 | head -1)
if [ "$INTEGRITY" != "ok" ]; then
  fail "Integrity check falló: $INTEGRITY"
fi

gzip -9 "$TMP_FILE"
TMP_FILE_GZ="${TMP_FILE}.gz"
GZ_SIZE=$(stat -c%s "$TMP_FILE_GZ")
log "Snapshot OK · gzip tamaño=${GZ_SIZE}B (ratio=$(awk -v a=$GZ_SIZE -v b=$SRC_SIZE 'BEGIN{printf "%.1f%%", (a/b)*100}'))"

# ── 3. Copia a daily ────────────────────────────────────────────────
DAILY_FILE="${DAILY_DIR}/ams_${DATE_STAMP}.db.gz"
cp "$TMP_FILE_GZ" "$DAILY_FILE"
log "Daily guardado: $DAILY_FILE"

# Domingo (7) → promueve a weekly.
if [ "$DATE_DAY" = "7" ]; then
  WEEKLY_FILE="${WEEKLY_DIR}/ams_week_${DATE_STAMP}.db.gz"
  cp "$DAILY_FILE" "$WEEKLY_FILE"
  log "Weekly promovido: $WEEKLY_FILE"
fi

# Día 1 del mes → promueve a monthly.
if [ "$DATE_DOM" = "01" ]; then
  MONTHLY_FILE="${MONTHLY_DIR}/ams_month_${DATE_STAMP}.db.gz"
  cp "$DAILY_FILE" "$MONTHLY_FILE"
  log "Monthly promovido: $MONTHLY_FILE"
fi

# ── 4. Rotación ─────────────────────────────────────────────────────
rotate() {
  local dir="$1"
  local keep="$2"
  ls -1t "$dir"/*.db.gz 2>/dev/null | tail -n +"$((keep + 1))" | xargs -r rm -v >> "$LOG_FILE" 2>&1 || true
}
rotate "$DAILY_DIR" "$DAILY_KEEP"
rotate "$WEEKLY_DIR" "$WEEKLY_KEEP"
rotate "$MONTHLY_DIR" "$MONTHLY_KEEP"

# ── 5. Off-site (Backblaze B2 via rclone) ───────────────────────────
if command -v rclone >/dev/null 2>&1 && rclone listremotes 2>/dev/null | grep -q "^b2:"; then
  if rclone copy "$DAILY_FILE" "${RCLONE_REMOTE}/daily/" --quiet 2>>"$LOG_FILE"; then
    log "Off-site OK → ${RCLONE_REMOTE}/daily/"
  else
    log "WARN: off-site falló (rclone). Backup local sí está."
  fi
else
  log "INFO: rclone/B2 no configurado — solo backup local. Setup: ver docs/RESTORE_PROCEDURE.md §Off-site"
fi

# ── 6. Cierre ───────────────────────────────────────────────────────
TS_END=$(date +%s)
DURATION=$((TS_END - TS_START))
DAILY_COUNT=$(ls -1 "$DAILY_DIR"/*.db.gz 2>/dev/null | wc -l)
WEEKLY_COUNT=$(ls -1 "$WEEKLY_DIR"/*.db.gz 2>/dev/null | wc -l)
MONTHLY_COUNT=$(ls -1 "$MONTHLY_DIR"/*.db.gz 2>/dev/null | wc -l)
log "FIN · ${DURATION}s · daily=${DAILY_COUNT} weekly=${WEEKLY_COUNT} monthly=${MONTHLY_COUNT}"
