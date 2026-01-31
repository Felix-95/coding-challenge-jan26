#!/bin/bash
# Script to register the soft-criteria matching algorithm

curl -X POST http://127.0.0.1:54321/functions/v1/admin-add-algorithm \
  -H "Content-Type: application/json" \
  -d '{
    "key": "soft-criteria-v1",
    "name": "Soft Criteria Matcher",
    "version": "1.0.0",
    "description": "Computes compatibility scores based on how well each fruit'\''s attributes satisfy the other'\''s preferences. All criteria are soft - no hard dealbreakers. Scores range from 0 to 1, with 1 being a perfect match.",
    "status": "active",
    "defaultConfig": {
      "weights": {
        "size": 1.0,
        "weight": 1.0,
        "hasStem": 1.0,
        "hasLeaf": 1.0,
        "hasWorm": 1.0,
        "shineFactor": 1.0,
        "hasChemicals": 1.0
      }
    }
  }'

echo ""
echo "Done!"
