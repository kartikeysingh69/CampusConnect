#!/usr/bin/env bash
# ==============================================================================
# scripts/db_backup.sh — CampusConnect Automated Database Backup Utility
# Performs mysqldump with gzip compression, checksum generation, & 7-day pruning
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-campusconnect}"
DB_USER="${DB_USER:-root}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
RETENTION_DAYS=7

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/campusconnect_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_DIR}/campusconnect_${TIMESTAMP}.sha256"

mkdir -p "$BACKUP_DIR"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting automated database backup for '${DB_NAME}'..."

# Export and compress
if [ -n "${DB_PASSWORD:-}" ]; then
  MYSQL_PWD="$DB_PASSWORD" mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" \
    --single-transaction --quick --routines --triggers "$DB_NAME" | gzip -9 > "$BACKUP_FILE"
else
  mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" \
    --single-transaction --quick --routines --triggers "$DB_NAME" | gzip -9 > "$BACKUP_FILE"
fi

# Generate SHA256 checksum for data integrity verification
if command -v sha256sum &> /dev/null; then
  sha256sum "$BACKUP_FILE" > "$CHECKSUM_FILE"
fi

BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ Database backup created: $BACKUP_FILE (Size: $BACKUP_SIZE)"

# Prune old backups older than 7 days
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "campusconnect_*.sql.gz" -type f -mtime "+${RETENTION_DAYS}" -delete
find "$BACKUP_DIR" -name "campusconnect_*.sha256" -type f -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ Backup lifecycle maintenance finished."
