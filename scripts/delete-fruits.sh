#!/bin/bash
# Script to delete all apples and oranges from the database
# Does NOT delete matching_algorithm or match records

echo "Deleting all apples and oranges..."

curl -X POST http://127.0.0.1:8000/sql \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'root:root' | base64)" \
  -H "surreal-ns: matchmaking" \
  -H "surreal-db: fruits" \
  -d "DELETE FROM apples; DELETE FROM oranges;"

echo ""
echo "All fruits deleted!"
