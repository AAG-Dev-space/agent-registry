#!/bin/bash
# A2A Agent Registry Database Backup Script

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="a2a-registry-postgres"
DB_USER="a2a_user"
DB_NAME="a2a_registry"
RETENTION_DAYS=7  # Delete backups older than N days

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/a2a_registry_backup_$TIMESTAMP.sql.gz"

echo "=== A2A Registry Database Backup ==="
echo "Starting backup at $(date)"
echo "Backup file: $BACKUP_FILE"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: PostgreSQL container '$CONTAINER_NAME' is not running"
    exit 1
fi

# Perform backup with --clean option (adds DROP statements for clean restore)
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" --clean --if-exists "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✓ Backup completed successfully"
    echo "  Size: $BACKUP_SIZE"
    echo "  Location: $BACKUP_FILE"

    # Clean up old backups
    echo ""
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "a2a_registry_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

    REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/a2a_registry_backup_*.sql.gz 2>/dev/null | wc -l)
    echo "✓ Cleanup completed. $REMAINING_BACKUPS backup(s) remaining."
else
    echo "✗ Backup failed!"
    exit 1
fi

echo ""
echo "=== Backup Summary ==="
echo "Latest backups:"
ls -lht "$BACKUP_DIR"/a2a_registry_backup_*.sql.gz 2>/dev/null | head -5

echo ""
echo "Backup completed at $(date)"
