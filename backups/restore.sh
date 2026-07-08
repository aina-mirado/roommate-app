#!/bin/bash
set -e

PROJECT_DIR="$HOME/project/roommate-app"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Utilisation : $0 <backup.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erreur : le fichier '$BACKUP_FILE' n'existe pas."
    exit 1
fi

# Dossier temporaire
TMP_DIR=$(mktemp -d)

echo "Extraction de l'archive..."
tar -xzf "$BACKUP_FILE" -C "$TMP_DIR"

# Trouver le dossier contenu dans l'archive
BACKUP_DIR=$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)

echo "Restauration de la base de données..."

docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T db \
    mysql -u root -proot coloc_app < "$BACKUP_DIR/database.sql"

echo "Restauration des fichiers uploadés..."

rm -rf "$PROJECT_DIR/backend/uploads"
cp -a "$BACKUP_DIR/uploads" "$PROJECT_DIR/backend/"

rm -rf "$TMP_DIR"

echo "Restauration terminée avec succès."
