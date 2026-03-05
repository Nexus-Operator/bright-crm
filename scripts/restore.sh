#!/bin/bash
# Bright CRM - Restore Database from Backup
# Usage: ./scripts/restore.sh backups/bright-crm_2026-03-05_12-00-00.db

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore.sh <backup_file>"
  echo ""
  echo "Available backups:"
  ls -lh backups/bright-crm_*.db 2>/dev/null || echo "  No backups found in ./backups/"
  exit 1
fi

if [ ! -f "$1" ]; then
  echo "Error: Backup file not found: $1"
  exit 1
fi

echo "Restoring from: $1"

if docker compose ps --quiet 2>/dev/null | grep -q .; then
  CONTAINER=$(docker compose ps --quiet bright-crm)
  docker cp "$1" "$CONTAINER:/app/data/bright.db"
  docker compose restart
  echo "Restored and restarted."
else
  cp "$1" prisma/dev.db
  echo "Restored to prisma/dev.db"
fi
