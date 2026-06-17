# Local DB Prototype Docker Blocker

## Status

Resolved. Docker Desktop was started, WSL integration became available, and the local Supabase prototype DB was reset and verified.

## What Changed

- Replaced the initial local migration with a lightweight prototype schema:
  - `numbers`
  - `members`
  - `works`
  - `comments`
- Updated `supabase/seed.sql` with prototype sandbox data.
- Added `scripts/supabase-local.sh` so `pnpm supabase:*` runs from a clean workdir and avoids the repo `.env/` directory collision.
- Added `scripts/verify-local-db.sh` to reset local Supabase and verify prototype table/seed rows.
- Updated `package.json` Supabase scripts to use the wrapper.
- Added unit tests for the prototype schema and Supabase local verification scripts.
- Added ADR 0003 for the local prototype DB schema decision.

## Verified

- `pnpm supabase:reset` completed successfully.
- `SKIP_SUPABASE_RESET=1 bash scripts/verify-local-db.sh` confirmed:
  - `numbers`, `members`, `works`, `comments` tables exist.
  - seed row counts are `numbers=2`, `members=4`, `works=2`, `comments=2`.
  - `take_03.wav` keeps `casting_name = 'Hikaru'`.
- `pnpm test` passes.
- `pnpm typecheck` passes.
- `pnpm lint` passes.

## Notes

Do not run remote Supabase migration commands for this prototype. The verified path is local-only.
