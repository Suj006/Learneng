# PING VIBE — Performance Test Report

- **Environment:** production build (`next build` + `next start`) on the QA container with embedded PGlite and synthetic data.
- **Tool:** `tests/perf.mjs`, which uses Playwright Chromium navigation timing and PerformanceObserver (LCP, CLS) plus concurrent fetch load.
- **Raw data:** `results/perf.json`.

## Page performance (budgets: LCP < 2.5 s, TTFB < 800 ms, CLS < 0.1), final run

| ID | Page | Cold TTFB / LCP | Warm TTFB / LCP | CLS | Transfer | Result |
|---|---|---|---|---|---|---|
| PERF-home | `/` | 8 ms / 300 ms | 5 ms / 216 ms | 0.000 | 455 KB | PASS |
| PERF-login | `/login` | 12 ms / 140 ms | 12 ms / 96 ms | **0.000** (was 0.248, BUG-012) | 460 KB | PASS |
| PERF-child-dashboard | `/world` | 138 ms / 316 ms | 87 ms / 236 ms | 0.000 | 270 KB | PASS |
| PERF-quest | `/world/quest` | 28 ms / 244 ms | 24 ms / 160 ms | 0.000 | 263 KB | PASS |
| PERF-parent-dashboard | `/parent` | 23 ms / 128 ms | 22 ms / 76 ms | 0.000 | 450 KB | PASS |

**Logo weight.** Pages that show the official logo above the fold now transfer about 455 KB instead of about 250 KB. That is the 209 KB master JPEG, served unchanged as the brand rules require. LCP stays far inside budget. On slow 3G/4G connections, consider brand-approved display-size derivatives (for example 640 px and 1280 px wide, made with `fit: contain`) served through `srcset`. The child headers (`/world`, quest) hide the logo on small screens.

The measurements are local, with no network latency. On a real 4G connection in India, expect TTFB to rise by the round-trip time (≈ 50–150 ms) and LCP to depend on the font and JS download (≈ 250 KB compressed per page). No page uses large images: characters and scenes are inline SVG, and word illustrations are emoji.

## Load (30 concurrent Explorers, each running a full quest flow: session, answers, completion, dashboard)

| ID | Check | Result | Measured |
|---|---|---|---|
| LOAD-001 | No 5xx under load | **PASS** | 0 errors in 660 requests (final run: 15.9 s, 41.6 req/s) |
| LOAD-002 | API p95 < 1500 ms | **FAIL (OPEN-001)**: final run FAIL; 1 of 4 runs passed | p95 per run: 2,554 / 1,496 / 2,038 ms. **Final run (with logo): p50 389 ms · p95 1,943 ms · max 10,451 ms** |
| LOAD-003 | Exactly one XP award per child under triple concurrent completion | **PASS** | 30/30 children = 1 award |

### Analysis of LOAD-002

- The QA database is **PGlite, an embedded single-connection Postgres**, so every query from 30 users is serialised through one connection. That explains why the median is fine and the tail is long.
- Correctness held: there were no errors and no double awards.
- The result is therefore **not representative of production**. It is reported as a FAIL: the target was missed in 3 of 4 runs, including the final one, and single requests reach 8–10 s.
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
