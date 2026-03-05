#!/bin/bash
# Bright CRM - Safe Update Script
# Backs up the database, pulls latest code, and rebuilds

set -e

echo "=== Bright CRM Update ==="

# 1. Backup first
echo "Backing up database..."
bash scripts/backup.sh
echo ""

# 2. Pull latest code
echo "Pulling latest changes..."
git pull origin main
echo ""

# 3. Rebuild and restart
if docker compose ps --quiet 2>/dev/null | grep -q .; then
  echo "Rebuilding Docker container..."
  docker compose down
  docker compose build
  docker compose up -d
  echo ""
  echo "Waiting for startup..."
  sleep 5
  if docker compose ps | grep -q "Up"; then
    echo "Update complete. CRM is running."
  else
    echo "WARNING: Container may not have started. Check: docker compose logs"
    echo "To restore: bash scripts/restore.sh backups/[latest-backup].db"
  fi
else
  echo "Reinstalling dependencies..."
  npm install
  echo ""
  echo "Applying database changes..."
  npx prisma db push
  echo ""
  echo "Rebuilding..."
  npm run build
  echo ""
  echo "Update complete. Restart with: npm run dev"
fi
