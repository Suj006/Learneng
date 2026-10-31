# PING VIBE — Performance Test Report

- **Environment (final run, 31 Oct):** production build (`next build` + `next start`) on the QA container (4 vCPU) with **PostgreSQL 16** through `DATABASE_URL` (node-postgres pool, `DB_POOL_MAX=5`) and synthetic data. Earlier runs used embedded PGlite; those results are kept below for comparison.
- **Tool:** `tests/perf.mjs`, which uses Playwright Chromium navigation timing and PerformanceObserver (LCP, CLS) plus concurrent fetch load.
- **Raw data:** `results/perf.json`.

## Page performance (budgets: LCP < 2.5 s, TTFB < 800 ms, CLS < 0.1), final run (PostgreSQL 16)

| ID | Page | Cold TTFB / LCP | Warm TTFB / LCP | CLS | Transfer | Result |
|---|---|---|---|---|---|---|
| PERF-home | `/` | 25 ms / 572 ms | 11 ms / 264 ms | 0.000 | 455 KB | PASS |
| PERF-login | `/login` | 26 ms / 192 ms | 19 ms / 124 ms | **0.000** (was 0.248, BUG-012) | 460 KB | PASS |
| PERF-child-dashboard | `/world` | 147 ms / 312 ms | 37 ms / 256 ms | 0.000 | 476 KB | PASS |
| PERF-quest | `/world/quest` | 27 ms / 384 ms | 30 ms / 228 ms | 0.000 | 263 KB | PASS |
| PERF-parent-dashboard | `/parent` | 39 ms / 224 ms | 26 ms / 128 ms | 0.000 | 451 KB | PASS |

**Logo weight.** Pages that show the official logo above the fold now transfer about 455 KB instead of about 250 KB. That is the 209 KB master JPEG, served unchanged as the brand rules require. LCP stays far inside budget. On slow 3G/4G connections, consider brand-approved display-size derivatives (for example 640 px and 1280 px wide, made with `fit: contain`) served through `srcset`. The child headers (`/world`, quest) hide the logo on small screens.

The measurements are local, with no network latency. On a real 4G connection in India, expect TTFB to rise by the round-trip time (≈ 50–150 ms) and LCP to depend on the font and JS download (≈ 250 KB compressed per page). No page uses large images: characters and scenes are inline SVG, and word illustrations are emoji.

## Load (concurrent Explorers, each running a full quest flow: session, answers, completion, dashboard)

### Final run: PostgreSQL 16 (`DATABASE_URL`), pool of 5

| ID | Check | Result | Measured |
|---|---|---|---|
| LOAD-001 | No 5xx under load (30 children) | **PASS** | 0 errors in 660 requests (6.7 s, 98 req/s) |
| LOAD-002 | API p95 < 1500 ms (30 children) | **PASS** | p50 299 ms · **p95 762 ms** · max 880 ms. A repeat run gave p50 249 · p95 728 · max 909 ms |
| LOAD-003 | Exactly one XP award per child under triple concurrent completion | **PASS** | 30/30 children = 1 award |

**Comparison runs (not part of the recorded results):**

| Database | Pool | Children | p50 | p95 | max | Errors |
|---|---|---|---|---|---|---|
| PGlite (embedded, earlier runs) | 1 (serialised) | 30 | 389 ms | 1,496–2,554 ms | 8–10 s | 0 |
| PostgreSQL 16 | 5 | 30 | 249–299 ms | **728–762 ms** | ≤ 909 ms | 0 |
| PostgreSQL 16 | 20 | 30 | 257 ms | 895 ms | 1,309 ms | 0 |
| PostgreSQL 16 | 5 | 100 | 737 ms | 2,651 ms | 3,180 ms | 0 |
| PostgreSQL 16 | 20 | 100 | 746–807 ms | 2,100–2,902 ms | ≤ 3,757 ms | 0 |

### Analysis

- **OPEN-001 is resolved for the 30-child target.** The earlier misses were caused by PGlite, which is single-connection and serialises every query. On a real PostgreSQL server the same build and test give a p95 well under half the budget.
- **At 100 children the p95 (2.1–2.9 s) is above the 1.5 s budget**, but there were still 0 errors. Throughput stays flat at about 105–125 req/s whatever the pool size (5 or 20), so the limit is the single `next start` Node process sharing 4 vCPUs with the load generator, not the database. A bigger pool does not help, so the default stays at 5. Production on Vercel scales out across many function instances, so this single-process figure is a lower bound.
- The pool size is now configurable with `DB_POOL_MAX` (default 5). Keep it small on serverless, where many instances share the database's connection limit.
- The database was local, so these numbers include no network round-trip. On hosted Supabase, add about 1–5 ms per query within the same region, more across regions.

**Before launch:**
1. Re-run `tests/perf.mjs` against the staging deployment on hosted Supabase (`LOAD_CHILDREN=30`, then 100). The steps are in `LOCAL_TESTING_GUIDE.md`.
2. If the p95 at 100 children matters for launch, profile `getOrCreateDailySession` and `award` (transaction-heavy on the first quest of the day) and add indexes from `pg_stat_statements`.

## Not executed

- Lighthouse scores, which need a deployed URL.
- Real-device CPU throttling on low-end Android phones.
- Soak tests over several hours.
- CDN and edge caching behaviour.
