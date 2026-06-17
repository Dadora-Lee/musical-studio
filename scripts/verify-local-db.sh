#!/usr/bin/env bash
# Verify the local Supabase prototype schema and seed data.
# This script only talks to the local Supabase Docker container.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase_db_musical-studio}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[FAIL] docker command not found. Enable Docker Desktop WSL integration first."
  exit 1
fi

if [ "${SKIP_SUPABASE_RESET:-0}" != "1" ]; then
  START_LOG="$(mktemp)"
  if "$ROOT/scripts/supabase-local.sh" start >"$START_LOG" 2>&1; then
    echo "[OK] local Supabase stack is running"
  else
    echo "[FAIL] local Supabase stack did not start"
    grep -Eiv 'key|secret|url|postgresql://' "$START_LOG" | tail -80
    exit 1
  fi

  "$ROOT/scripts/supabase-local.sh" db reset
else
  echo "[OK] using existing local Supabase stack"
fi

query() {
  docker exec "$DB_CONTAINER" psql -U postgres -d postgres -At -c "$1"
}

expect_table() {
  local table="$1"
  local exists
  exists="$(query "select to_regclass('public.${table}') is not null;")"
  if [ "$exists" != "t" ]; then
    echo "[FAIL] missing table: public.${table}"
    exit 1
  fi
  echo "[OK] table exists: public.${table}"
}

expect_rows() {
  local table="$1"
  local minimum="$2"
  local count
  count="$(query "select count(*) from public.${table};")"
  if [ "$count" -lt "$minimum" ]; then
    echo "[FAIL] public.${table} has ${count} rows; expected at least ${minimum}"
    exit 1
  fi
  echo "[OK] public.${table} rows: ${count}"
}

for table in numbers members works comments; do
  expect_table "$table"
done

expect_rows numbers 22
expect_rows members 21
expect_rows works 2
expect_rows comments 2

casting_name="$(query "select casting_name from public.works where file_name = 'take_03.wav';")"
if [ "$casting_name" != "히카루" ]; then
  echo "[FAIL] take_03.wav casting_name was '${casting_name}', expected '히카루'"
  exit 1
fi

echo "[OK] take_03.wav links to submitted casting: 히카루"
echo "[OK] local prototype DB verification passed"
