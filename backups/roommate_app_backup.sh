#!/bin/bash
set -e

PROJECT_DIR="$HOME/project/roommate-app"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$BACKUP_DIR"

# Dossier temporaire de sauvegarde
TEMP_DIR="$BACKUP_DIR/backup_$DATE"
mkdir -p "$TEMP_DIR"

echo "Sauvegarde de la base de données..."

docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T db \
    mysqldump -u root -proot coloc_app > "$TEMP_DIR/database.sql"

echo "Sauvegarde des fichiers uploadés..."

cp -r "$PROJECT_DIR/backend/uploads" "$TEMP_DIR/"

echo "Compression de la sauvegarde..."

tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"

# Suppression du dossier temporaire
rm -rf "$TEMP_DIR"

# Garder uniquement les 14 dernières sauvegardes
ls -1t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +15 | xargs -r rm

echo "Sauvegarde terminée : backup_$DATE.tar.gz"
