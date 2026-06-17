# ADR 0003: Local Prototype DB Schema

## Status

Accepted

## Context

Practice Studio needs a lightweight data model for validating Number playback, recording submission, and feedback before applying schema changes to remote Supabase.

## Decision

Use a local Supabase prototype schema centered on `numbers`, `members`, `works`, and `comments`.

- `members.member_type` uses `player`, `direction`, and `guest`.
- `members.castings` stays as `text[]` for prototype simplicity.
- `works.casting_name` stores the submitted casting name at submission time.
- Supabase remote migration and storage changes are intentionally out of scope for this prototype step.

## Consequences

The schema is small enough for local reset and UI integration tests. A future production schema can promote castings, permissions, and feedback timing into richer tables after the prototype validates the workflow.
