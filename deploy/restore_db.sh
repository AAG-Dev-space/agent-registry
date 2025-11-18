#!/bin/bash
# A2A Agent Registry Database Restore Script

# Configuration
CONTAINER_NAME="a2a-registry-postgres"
DB_USER="a2a_user"
DB_NAME="a2a_registry"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lht ./backups/a2a_registry_backup_*.sql.gz 2>/dev/null
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found"
    exit 1
fi

echo "=== A2A Registry Database Restore ==="
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo ""

# Warning prompt
read -p "⚠️  WARNING: This will OVERWRITE the current database. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Starting restore at $(date)"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: PostgreSQL container '$CONTAINER_NAME' is not running"
    exit 1
fi

# Drop existing connections
echo "Dropping existing database connections..."
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1

# Drop and recreate database to ensure clean state
echo "Recreating database..."
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" > /dev/null 2>&1

# Restore database
echo "Restoring database..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME" 2>&1 | grep -v "^SET$" | grep -v "^ALTER TABLE$" | grep -v "^COMMENT$" | grep -v "^CREATE EXTENSION$" | grep -v "^(1 row)$" || true

if [ $? -eq 0 ]; then
    echo "✓ Restore completed successfully"

    # Show summary
    echo ""
    echo "=== Restore Summary ==="
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME" -c "
    SELECT
        'Agents' as table_name,
        COUNT(*) as row_count
    FROM agents
    UNION ALL
    SELECT
        'Health Status' as table_name,
        COUNT(*) as row_count
    FROM health_status
    ORDER BY table_name;
    "
else
    echo "✗ Restore failed!"
    exit 1
fi

echo ""
echo "Restore completed at $(date)"
