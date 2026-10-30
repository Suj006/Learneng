# PING VIBE — Performance Test Report

- **Environment:** production build (`next build` + `next start`) on the QA container with embedded PGlite and synthetic data.
- **Tool:** `tests/perf.mjs`, which uses Playwright Chromium navigation timing and PerformanceObserver (LCP, CLS) plus concurrent fetch load.
- **Raw data:** `results/perf.json`.

## Page performance (budgets: LCP < 2.5 s, TTFB < 800 ms, CLS < 0.1)

| ID | Page | Cold TTFB / LCP | Warm TTFB / LCP | CLS | Transfer | Result |
|---|---|---|---|---|---|---|
| PERF-home | `/` | 15 ms / 312 ms | 4 ms / 200 ms | 0.000 | 264 KB | PASS |
| PERF-login | `/login` | 23 ms / 208 ms | 23 ms / 124 ms | **0.000** (was 0.248, BUG-012) | 254 KB | PASS |
| PERF-child-dashboard | `/world` | 442 ms / 656 ms | 118 ms / 392 ms | 0.000 | 269 KB | PASS |
| PERF-quest | `/world/quest` | 42 ms / 360 ms | 27 ms / 184 ms | 0.000 | 261 KB | PASS |
| PERF-parent-dashboard | `/parent` | 35 ms / 172 ms | 34 ms / 136 ms | 0.000 | 244 KB | PASS |

The measurements are local, with no network latency. On a real 4G connection in India, expect TTFB to rise by the round-trip time (≈ 50–150 ms) and LCP to depend on the font and JS download (≈ 250 KB compressed per page). No page uses large images: characters and scenes are inline SVG, and word illustrations are emoji.

## Load (30 concurrent Explorers, each running a full quest flow: session, answers, completion, dashboard)

| ID | Check | Result | Measured |
|---|---|---|---|
| LOAD-001 | No 5xx under load | **PASS** | 0 errors in 660 requests (15.5 s, 42.5 req/s) |
| LOAD-002 | API p95 < 1500 ms | **FAIL (OPEN-001)** | p50 384 ms · p95 2,554 ms · max 8,411 ms |
| LOAD-003 | Exactly one XP award per child under triple concurrent completion | **PASS** | 30/30 children = 1 award |

### Analysis of LOAD-002

- The QA database is **PGlite, an embedded single-connection Postgres**, so every query from 30 users is serialised through one connection. That explains why the median is fine and the tail is long.
- Correctness held: there were no errors and no double awards.
- The result is therefore **not representative of production**, but it is reported as a FAIL because the target was not met in the tested environment.
- The intended production database is Supabase/Postgres with the session pooler, and it has not been load-tested.

**Before launch:**
1. Re-run `tests/perf.mjs` against a staging deployment with `DATABASE_URL` set (`LOAD_CHILDREN=30`, then 100).
2. If p95 is still high, profile `getOrCreateDailySession` and `award`. Both are transaction-heavy on first quest of the day.
3. Add indexes based on `pg_stat_statements`.

## Not executed

- Lighthouse scores, which need a deployed URL.
- Real-device CPU throttling on low-end Android phones.
- Soak tests over several hours.
- CDN and edge caching behaviour.
