# PING VIBE — API & Database Test Report

**API suite (`tests/qa-api.mjs`): 215 checks — 213 PASS · 0 FAIL · 2 BLOCKED.** Run against a production build (`next build` + `next start`) on a fresh embedded Postgres (PGlite). Raw results: `results/qa-api.json`.

## Coverage by module

| Module | Pass / Fail / Blocked |
|---|---|
| Registration | 15 / 0 / 0 |
| E-mail verification | 3 / 0 / 0 |
| Login & sessions | 19 / 0 / 0 |
| Authorisation & data isolation | 20 / 0 / 0 |
| Onboarding | 4 / 0 / 0 |
| Daily Word Quest | 14 / 0 / 0 |
| Creative Writing | 8 / 0 / 1 |
| Grammar Galaxy | 24 / 0 / 0 |
| Reading Adventures | 4 / 0 / 0 |
| Speaking & Listening | 5 / 0 / 0 |
| Word Games Arcade | 14 / 0 / 0 |
| AI companion | 4 / 0 / 1 |
| XP, levels & economy | 12 / 0 / 0 |
| Missions | 4 / 0 / 0 |
| Bosses, map & world | 8 / 0 / 0 |
| Concurrency & transactions | 5 / 0 / 0 |
| Grade journeys | 6 / 0 / 0 |
| Parent dashboard | 11 / 0 / 0 |
| Administration | 21 / 0 / 0 |
| Security | 12 / 0 / 0 |

## API contract checks

- **Validation:** every write endpoint parses its body with zod, returns `400` with a child-friendly message on invalid input, `413` over 64 KB, and `400` (never `500`) on malformed JSON (AUTH-015, SEC-006).
- **Auth errors:** `401` unauthenticated, `403` or redirect for the wrong role, `404` without content leak for other families' resources (AUTHZ-*).
- **Rate limits:** `429` with a friendly message (AUTH-040).
- **Server-authoritative scoring:** quest, grammar, reading, listening, challenge and boss answers are scored on the server. Answer keys stay in `challenge_attempts` and are never returned (AUTHZ-020). Client-reported game scores are clamped and never grant mastery (LRN-072/074).

## Database checks

| Check | Evidence | Result |
|---|---|---|
| Schema migrates idempotently on an empty DB and on an existing DB | every run starts fresh; dev server restarted on an existing DB | PASS |
| Seeds are additive (`ON CONFLICT DO NOTHING`) and versioned (`seed_meta`) | restart keeps admin-created rows | PASS |
| Plan records exist (not just claimed) | `select count(*) from learning_plans` gives 3,650 seeded (10 grades × 365), plus 365 for the grade created in ADM-021 | PASS |
| Levels | 250 seeded, plus those appended in ADM-018 | PASS |
| Transactions / idempotency | Unique ledger keys on `xp_transactions`; conditional updates for coins | CON-001…005, LOAD-003 PASS |
| Parameterised SQL everywhere | SQL-injection probes (SEC-003/004); code review shows no string-built SQL with user input | PASS |
| Referential clean-up on child deletion | PAR-011: data erased, sessions ended | PASS |
| DPDP export | PAR-009: contains learning data, excludes PIN and password hashes | PASS |
| Supabase RLS | `db/supabase-rls.sql` denies all to anon/authenticated (the app connects server-side only) | Reviewed (not executed against Supabase) |

## Defects found here

- **BUG-003 (High):** grammar submission returned 500 because of a parameter type mismatch with a `smallint` column. Fixed with explicit casts.
- **BUG-007 (High):** the parent report returned 500 because `day`/`month` were used as aliases. Renamed.

Both have dedicated regression checks.

## Blocked

- **LRN-037 and LRN-084** (live Claude) need `ANTHROPIC_API_KEY`. Offline fallbacks pass, but they do **not** demonstrate the integration.
- **ADM-014** confirms that the generation endpoint returns a clear error, rather than fabricated content, when no key is set.

## Limitations

- PGlite is single-connection. Behaviour under real connection pooling (Supabase/pgBouncer) and the p95 latency target are **not yet verified** (see OPEN-001).
- No schema-migration rollback scripts. Migrations are additive only.
