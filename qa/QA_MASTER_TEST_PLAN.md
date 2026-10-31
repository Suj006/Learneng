# PING VIBE — QA Master Test Plan

| | |
|---|---|
| Product | PING VIBE — "Your World. Your Words. Your Vibe." (English learning for Explorers aged 5–13, Pre-KG → Grade 7) |
| Scope | Web application in this repository (Next.js 15 App Router, React 19, Postgres/PGlite, Claude API) |
| Test data | **Synthetic only.** Every family is created by the test harness with `qa+…@example.test` addresses and random names. No real children's accounts or production personal data were used. |
| Secrets | Tests read keys only from the environment. No API key is printed, logged or committed. |
| Status | Executed — see `PRODUCTION_READINESS_REPORT.md` and `results/test-execution-report.json` |

## 1. Objectives

1. Verify that every child, parent and admin journey works end-to-end on the real stack (server, database, scoring engines). Mocks are not used to claim integrations work.
2. Verify child safety: no child-to-child communication, PII blocked in the AI companion, unsafe topics redirected, raw AI output never published without validation and admin approval.
3. Verify data isolation and authorisation between families, roles and children.
4. Verify gamification integrity: idempotent rewards, no double spend, server-side scoring, no loss-based streaks.
5. Verify the experience on 8 viewports, WCAG 2.2 AA automated checks, performance budgets and concurrent load.
6. Record every defect, fix it at the root cause (not by hiding errors or disabling features), and re-test.

## 2. Test levels and tooling

| Level | Tool | Command | What it proves |
|---|---|---|---|
| Unit | vitest | `npx vitest run` | Engines: spaced repetition, level curve, validation gates, XP caps, IP parsing, content generators |
| API / integration / DB | Node fetch harness (`tests/qa-api.mjs`) | `node tests/qa-api.mjs` | 215 checks across auth, authorisation, learning modules, gamification, concurrency, parent, admin, security — against a live server and database |
| End-to-end journey + responsive + console + a11y + visual | Playwright + axe-core 4.10 + sharp (`tests/ui-audit.mjs`) | `node tests/ui-audit.mjs [--update-baseline]` | Journey 1 in a real browser, every page × 8 viewports for overflow/clipped controls/broken images, console & network errors, axe WCAG 2.x A/AA rules, pixel-diff visual regression |
| Performance & load | Playwright navigation timing + concurrent fetch (`tests/perf.mjs`) | `BASE_URL=… node tests/perf.mjs` | LCP/TTFB/CLS on key pages (production build), 30 concurrent children, double-award race |
| Dependency security | npm audit | `npm audit --omit=dev` | Known vulnerable packages |
| Report | `scripts/qa-report.mjs` | `node scripts/qa-report.mjs` | Aggregates all results into `results/test-execution-report.json` and `COMPLETE_TEST_CASES.md` |

## 3. Master test matrix

| # | Area | Phase | Suites / IDs | Priority |
|---|---|---|---|---|
| 1 | Registration, verification, consent (DPDP) | Auth | AUTH-001…022 | P0 |
| 2 | Parent / child / admin login, sessions, lockout, password reset | Auth | AUTH-030…048, ADM-001/002 | P0 |
| 3 | Role and family isolation | Authorisation | AUTHZ-001…020 | P0 |
| 4 | Play-based onboarding (no assessment) | Learning | LRN-001…004, JRN-1 | P0 |
| 5 | Daily Word Quest + spaced repetition | Learning | LRN-010…023 | P0 |
| 6 | Creative Writing + AI evaluation | Learning | LRN-030…038 (LRN-037 needs a key) | P0 |
| 7 | Grammar Galaxy | Learning | LRN-040…045 | P1 |
| 8 | Reading, Speaking, Listening | Learning | LRN-050…064 | P1 |
| 9 | Word Games Arcade (10 games) | Learning | LRN-070…074 | P1 |
| 10 | AI companion safety | Safety | LRN-080…084 | P0 |
| 11 | XP, levels, coins, crystals, shop, avatar | Gamification | GAM-001…012 | P1 |
| 12 | Missions, bosses, map, pets, unlocks | Gamification | GAM-020…037 | P1 |
| 13 | Race conditions / transactions | Integrity | CON-001…005, LOAD-003 | P0 |
| 14 | Grade-appropriate content | Educational | GRD-* | P0 |
| 15 | Parent dashboard, reports, export, deletion | Parent | PAR-001…011 | P0 |
| 16 | Admin CMS, AI pipeline, configuration | Admin | ADM-003…022 | P1 |
| 17 | Web security | Security | SEC-001…012, npm audit | P0 |
| 18 | Responsive (320, 375, 390, 414, 768, 1024, 1280, 1440) | UI | RSP-* | P1 |
| 19 | Console / network errors | UI | CON-RSP-* | P1 |
| 20 | Accessibility (axe WCAG A/AA, keyboard, reduced motion) | A11y | A11Y-* | P0 |
| 21 | Visual regression (375/768/1440, deterministic pages) | UI | VIS-* | P2 |
| 22 | Page performance (LCP, TTFB, CLS) | Perf | PERF-* | P1 |
| 23 | Concurrent load (30 children) | Perf | LOAD-001…003 | P1 |

## 4. User journeys

| Journey | Description | Coverage |
|---|---|---|
| 1 | Parent signs up → verifies e-mail → gives consent → launches child → MAX welcome → first 10 words → quest complete → celebration | Playwright browser (`JRN-1-*`) plus API (AUTH-001/021, LRN-001…021) |
| 2 | Returning child: login with username + PIN → Daily Adventure → revision → missions → claim reward | API (AUTH-035…039, LRN-022/023, GAM-020/021) plus page sweep |
| 3 | Child plays across modules: writing, grammar, reading, speaking, listening, arcade, boss | API (LRN-030…074, GAM-030…032) plus page sweep |
| 4 | Parent reviews progress, changes settings, family challenge, PIN reset, export, delete | API (PAR-001…011) plus page sweep |
| 5 | Admin generates or enters content → validation gates → review → publish; config changes | API (ADM-010…022) plus admin page sweep |
| 6 | Abuse and edge cases: brute force, spoofed headers, cross-family access, injections, oversized payloads, concurrency | API (AUTH-040, AUTHZ-*, SEC-*, CON-*), unit (pickClientIp) |

## 5. Entry and exit criteria

- **Entry:** the build compiles (`next build`), the schema migrates on an empty database, and the seed is complete.
- **Exit for pilot:**
  - 0 open Critical defects and 0 open High defects that are not environment-blocked.
  - All P0 checks either PASS or BLOCKED with a named owner.
  - All three sign-offs obtained (§9).
- **Exit for public launch:**
  - The pilot criteria above.
  - LOAD-002 passes on production infrastructure.
  - Live AI and e-mail are verified.
  - Real-device, screen-reader and Lighthouse runs are done.
  - A third-party penetration test is done.

## 6. Status rules

- **PASS:** the assertion ran against the real component and held.
- **FAIL:** the assertion ran and did not hold. A defect is logged.
- **BLOCKED:** a required service is not configured (for example `ANTHROPIC_API_KEY`). It is never counted as PASS, and offline fallbacks are verified separately and labelled as such.
- **NOT EXECUTED:** planned, but no automation or environment was available (§8).

## 7. Environment

- **Final runs of every suite:** production build (`next build` and `next start`) on :3000 with a fresh database. Earlier iterations of the UI audit used `next dev`, but the dev badge, on-demand compilation and a memory-threshold restart made screenshots and timings noisy.
- **Database:** embedded PGlite (Postgres 16 compatible), started fresh for each run.
- **Rate limits:** `IP_RATE_LIMIT_MULTIPLIER=100` so that one test machine can create many synthetic families. Per-account limits (PIN lockout, sign-up) are unchanged and are tested.
- **E-mail:** dev mailbox (`EMAIL_TRANSPORT=dev-mailbox`). No mail is sent externally.

## 8. Not executed / out of scope for this cycle (honest list)

- Real iOS Safari, Android Chrome or physical tablets. Only Chromium device emulation was used.
- Lighthouse.
- NVDA, VoiceOver or TalkBack screen-reader walkthroughs. Only automated axe checks and keyboard checks were run.
- Load test on managed Postgres or Supabase.
- Live Claude API: no key was available, so these are BLOCKED.
- Live Resend e-mail delivery.
- Third-party penetration test.
- Teacher review of the content corpus.
- Moderated usability sessions with children.

## 9. Sign-offs required before pilot

| Sign-off | Owner | Scope |
|---|---|---|
| Technical QA | Engineering lead | This plan, defects closed, regression green, infrastructure re-test |
| Educational QA | English teacher / curriculum lead | Grade appropriateness of words, topics, grammar and stories; evaluator feedback tone |
| Child UX QA | Child UX specialist | Readability for non-readers (Pre-KG/UKG), motor targets, emotional safety of feedback, healthy-engagement limits |

**Recommended pilot:** a small, consented group of families with Explorers in **Pre-KG, Grade 2, Grade 5 and Grade 7**, which covers the youngest, early-reader, middle and oldest bands. Run it for 2–4 weeks and measure against the five launch objectives in the README.
