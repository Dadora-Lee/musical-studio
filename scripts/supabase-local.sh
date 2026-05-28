#!/usr/bin/env bash
# Run Supabase CLI from a clean local workdir so the repo's .env/ secrets
# directory does not collide with the CLI's automatic .env file loading.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="${SUPABASE_LOCAL_WORKDIR:-/tmp/musical-studio-supabase-local}"

mkdir -p "$WORKDIR"
ln -sfn "$ROOT/supabase" "$WORKDIR/supabase"

if [ -f "$ROOT/.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.env.local"
  set +a
fi

export GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-local-google-client-id}"
export GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-local-google-client-secret}"

cd "$WORKDIR"
exec "$ROOT/node_modules/.bin/supabase" "$@"
