#!/bin/bash
# Script to apply the SurrealDB schema

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCHEMA_FILE="$PROJECT_ROOT/supabase/functions/_shared/schema.surql"

echo "Applying SurrealDB schema..."

curl -X POST http://127.0.0.1:8000/sql \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'root:root' | base64)" \
  -H "surreal-ns: matchmaking" \
  -H "surreal-db: fruits" \
  --data-binary "@$SCHEMA_FILE"

echo ""
echo "Schema applied successfully!"
