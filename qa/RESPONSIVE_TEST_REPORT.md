# PING VIBE — Responsive Test Report

**Tool:** Playwright Chromium device emulation (`tests/ui-audit.mjs`), run against `next dev` with synthetic accounts.

**Final run:** production build: **344 responsive checks (45 pages across 8 viewports) PASS · 344 console/network checks PASS · 344 target-size checks PASS · 69 visual-regression comparisons PASS (0 FAIL, 0 BLOCKED).** Raw data: `results/ui-audit.json`. Screenshots: `screenshots/baseline/`.

## Viewports

| Width × height | Represents |
|---|---|
| 320 × 640 | Small Android phones (and 400 % zoom on a 1280 px screen) |
| 375 × 812 | iPhone mini / SE class and most mid-range Android phones |
| 430 × 932 | Large phones (Pro Max / Plus) |
| 768 × 1024 | iPad portrait / small tablets |
| 1024 × 768 | Tablet landscape |
| 1366 × 768 | Common laptops and Chromebooks (widely used in Indian schools) |
| 1440 × 900 | Desktop / MacBook |
| 1920 × 1080 | Full-HD desktop |

## Pages

| Role | Pages |
|---|---|
| Public | 7: home, sign-up, login (child and parent tabs), privacy, forgot password, expired verification |
| Child | 27: Daily Adventure, quest, map, kingdom, my world, missions, arcade, game, writing, grammar and topic, reading and story, speaking, listening, shop, avatar, pets, skills, calendar, museum, collection, notebook, companion, profile, story builder, boss |
| Parent | 3: overview, child report, settings |
| Admin | 6: analytics, content studio, economy, events, vocabulary, grades |

## Assertions per page × viewport

| ID | Assertion |
|---|---|
| `RSP-*` | HTTP < 400. No horizontal page overflow (`scrollWidth − innerWidth ≤ 1 px`). No interactive control outside the viewport, unless it sits in a horizontally scrollable container that keyboard focus can reach. No broken images. |
| `CON-RSP-*` | No console errors, uncaught exceptions, failed requests or 4xx/5xx responses |
| `TGT-*` | Interactive targets ≥ 24×24 px (WCAG 2.5.8) |
| `VIS-RSP-*` | At 375, 768 and 1440 px on deterministic pages: under 3 % of pixels changed against the baseline |

## Defects found and fixed

| ID | Issue | Fix |
|---|---|---|
| BUG-010 | Avatar studio overflow at 320 px | `min-w-0`, smaller preview |
| BUG-020 | Admin analytics overflow, 51 px at 320 px and 42 px at 768 px (wide table, fixed-width rows, unbreakable text in a 5-column grid) | Scroll wrapper, shrinkable grid items, responsive objective grid |
| BUG-015 | Missing logo shown as a broken image whose alt text wrapped over four lines in the landing header | Interim wordmark fallback |
| BUG-022 | The check flagged admin economy inputs inside a scrollable table as "clipped" | The check now recognises reachable scroll containers |

## Not executed

- Real devices: iOS Safari (WebKit), Android Chrome on low-end hardware, and physical tablets. Chromium emulation does not reproduce WebKit layout or touch behaviour exactly.
- Landscape phone orientation.
- Firefox, which also matters for the speech-recognition fallback.
