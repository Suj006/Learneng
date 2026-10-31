# PING VIBE — Performance Test Report

- **Environment:** production build (`next build` + `next start`) on the QA container with embedded PGlite and synthetic data.
- **Tool:** `tests/perf.mjs`, which uses Playwright Chromium navigation timing and PerformanceObserver (LCP, CLS) plus concurrent fetch load.
- **Raw data:** `results/perf.json`.

## Page performance (budgets: LCP < 2.5 s, TTFB < 800 ms, CLS < 0.1), final run

| ID | Page | Cold TTFB / LCP | Warm TTFB / LCP | CLS | Transfer | Result |
|---|---|---|---|---|---|---|
| PERF-home | `/` | 7 ms / 284 ms | 8 ms / 112 ms | 0.000 | 250 KB | PASS |
| PERF-login | `/login` | 14 ms / 132 ms | 10 ms / 92 ms | **0.000** (was 0.248, BUG-012) | 255 KB | PASS |
| PERF-child-dashboard | `/world` | 102 ms / 428 ms | 102 ms / 280 ms | 0.000 | 270 KB | PASS |
| PERF-quest | `/world/quest` | 27 ms / 304 ms | 31 ms / 164 ms | 0.000 | 262 KB | PASS |
| PERF-parent-dashboard | `/parent` | 22 ms / 132 ms | 28 ms / 80 ms | 0.000 | 245 KB | PASS |

The measurements are local, with no network latency. On a real 4G connection in India, expect TTFB to rise by the round-trip time (≈ 50–150 ms) and LCP to depend on the font and JS download (≈ 250 KB compressed per page). No page uses large images: characters and scenes are inline SVG, and word illustrations are emoji.

## Load (30 concurrent Explorers, each running a full quest flow: session, answers, completion, dashboard)

| ID | Check | Result | Measured |
|---|---|---|---|
| LOAD-001 | No 5xx under load | **PASS** | 0 errors in 660 requests (final run: 14.0 s, 47.1 req/s) |
| LOAD-002 | API p95 < 1500 ms | **FAIL (OPEN-001)**: final run FAIL; 1 of 3 runs passed | Run 1: p95 2,554 ms. Run 2: p95 1,496 ms. **Final run: p50 355 ms · p95 2,038 ms · max 8,616 ms** |
| LOAD-003 | Exactly one XP award per child under triple concurrent completion | **PASS** | 30/30 children = 1 award |

### Analysis of LOAD-002

- The QA database is **PGlite, an embedded single-connection Postgres**, so every query from 30 users is serialised through one connection. That explains why the median is fine and the tail is long.
- Correctness held: there were no errors and no double awards.
- The result is therefore **not representative of production**. It is reported as a FAIL: the target was missed in 2 of 3 runs, including the final one, and single requests reach 8–10 s.
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
