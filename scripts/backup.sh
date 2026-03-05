#!/bin/bash
# Bright CRM - SQLite Database Backup
# Usage: ./scripts/backup.sh [backup_dir]
# Default backup directory: ./backups

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/bright-crm_$TIMESTAMP.db"

mkdir -p "$BACKUP_DIR"

# For Docker: copy from the volume
if docker compose ps --quiet 2>/dev/null | grep -q .; then
  CONTAINER=$(docker compose ps --quiet bright-crm)
  docker exec "$CONTAINER" sqlite3 /app/data/bright.db ".backup '/tmp/backup.db'"
  docker cp "$CONTAINER:/tmp/backup.db" "$BACKUP_FILE"
  docker exec "$CONTAINER" rm /tmp/backup.db
else
  # Local: copy the db file directly using sqlite3 backup (safe even while running)
  if command -v sqlite3 &>/dev/null; then
    sqlite3 prisma/dev.db ".backup '$BACKUP_FILE'"
  else
    cp prisma/dev.db "$BACKUP_FILE"
  fi
fi

# Keep only last 30 backups
ls -t "$BACKUP_DIR"/bright-crm_*.db 2>/dev/null | tail -n +31 | xargs -r rm

echo "Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
