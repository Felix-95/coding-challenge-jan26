#!/bin/bash
# Script to seed fruits from raw_apples_and_oranges.json

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_FILE="$PROJECT_ROOT/data/raw_apples_and_oranges.json"

echo "Seeding fruits from $DATA_FILE..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it first:"
    echo "  brew install jq"
    exit 1
fi

# Read the JSON file and insert each fruit
jq -c '.[]' "$DATA_FILE" | while read -r fruit; do
    # Extract the type to determine which table to insert into
    TYPE=$(echo "$fruit" | jq -r '.type')

    if [ "$TYPE" = "apple" ]; then
        TABLE="apples"
    elif [ "$TYPE" = "orange" ]; then
        TABLE="oranges"
    else
        echo "Unknown fruit type: $TYPE"
        continue
    fi

    # Insert the fruit into SurrealDB
    curl -s -X POST http://127.0.0.1:8000/sql \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -H "Authorization: Basic $(echo -n 'root:root' | base64)" \
      -H "surreal-ns: matchmaking" \
      -H "surreal-db: fruits" \
      -d "INSERT INTO $TABLE $fruit;" > /dev/null

    echo "  Inserted $TYPE"
done

echo ""
echo "All fruits seeded successfully!"
