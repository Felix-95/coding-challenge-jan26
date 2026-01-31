#!/bin/bash
# Serve Supabase edge functions with automatic env file detection

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check for env file: prefer .env.local, fall back to .env
if [ -f "$PROJECT_ROOT/supabase/.env.local" ]; then
  ENV_FILE="$PROJECT_ROOT/supabase/.env.local"
elif [ -f "$PROJECT_ROOT/supabase/.env" ]; then
  ENV_FILE="$PROJECT_ROOT/supabase/.env"
else
  echo "Error: No env file found. Please create one:"
  echo "  cp supabase/.env.example supabase/.env.local"
  echo "Then add your OPENAI_API_KEY to it."
  exit 1
fi

echo "Using env file: $ENV_FILE"
npx supabase functions serve --no-verify-jwt --env-file "$ENV_FILE"
