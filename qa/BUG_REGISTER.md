# PING VIBE — Bug Register

Source of truth: `defects.json` (machine-readable). Severity scale:
- **Critical:** security or data loss.
- **High:** a core journey is broken, or child safety is affected.
- **Medium:** degraded behaviour with a workaround.
- **Low:** cosmetic or tooling.

**Summary:** 29 entries.
- 26 defects found and fixed: 1 Critical, 6 High, 10 Medium, 9 Low.
- 3 open or blocked items: OPEN-001 Medium, OPEN-002 High, OPEN-003 High (blocked).

Every fixed defect was reproduced first, fixed at the root cause, and re-tested by a named regression check. No test was disabled, and no error was hidden, to get a pass.

## Fixed

| ID | Sev | Area | Defect | Root cause / fix | Regression |
|---|---|---|---|---|---|
| BUG-013 | Critical | Dependencies | `npm audit` critical advisory in the installed Next.js | Upgraded `next` ^15.5.28, `zod` ^4.6.7, overrides for postcss/sharp. Now 0 vulnerabilities. | `npm audit --omit=dev` |
| BUG-002 | High | Security | Network rate limit bypassable by spoofing `X-Forwarded-For` | `pickClientIp` uses the platform header or the right-most hop | unit test |
| BUG-003 | High | Grammar | Submission HTTP 500 | `$n::smallint` casts | LRN-040…042 |
| BUG-004 | High | Child safety | Companion unsafe-topic filter missed plurals | Broadened pattern | LRN-083 |
| BUG-007 | High | Parent | Child report / annual journey HTTP 500 | Reserved aliases `day`/`month` renamed | PAR-001/002 |
| BUG-011 | High | Onboarding | Blank welcome after parent→child hand-off | Full navigation on identity change | JRN-1 |
| BUG-014 | High | Auth | No password-reset flow | Implemented forgot/reset with single-use hashed tokens and session revocation | AUTH-041…048 |
| BUG-001 | Medium | Auth | Invalid sign-ups consumed the rate limit | Validate before limiting | SEC-012 |
| BUG-005 | Medium | Gamification | Bosses and kingdoms unlocked on day one | Raised unlock levels | GAM-030 |
| BUG-006 | Medium | Auth | PIN reset did not clear the lockout | `resetRateLimit` on PIN change | PAR-008 |
| BUG-008 | Medium | UI | Hydration mismatches | `MotionProvider`, `useMounted`, post-mount randomness | CON-RSP-* |
| BUG-012 | Medium | Performance | Login CLS 0.248 | Server-side `searchParams` props, no Suspense swap | PERF-login (CLS 0.000) |
| BUG-015 | Medium | Brand/UI | Missing logo rendered as a broken image with wrapping alt text; the audit had excluded the logo URL, which masked it | Server-side presence passed to `BrandAssetProvider`; post-mount check; audit exclusions removed | RSP-public-* broken-image, CON-* |
| BUG-017 | Medium | Accessibility | Text contrast below AA: interim wordmark white-on-white (1.1:1), character name labels (1.77–2.77:1), Epic chip (3.62:1) | Wordmark in its own dark badge; dark-ink names with colour swatch; lighter Epic tint | A11Y-* |
| BUG-018 | Medium | Accessibility | Progress bars, family-challenge inputs and 14 selects without accessible names | Default name and `aria-valuetext` on `Progress`; contextual labels; `aria-label` on controls | A11Y-* |
| BUG-024 | Medium | Accessibility | Found once axe covered every page: locked cards dimmed by whole-card opacity (text 3.1–4.2:1), 'Admin' chip 4.48:1, 80 unlabelled economy inputs | Dim only the artwork, dashed locked border; lighter chip; `aria-label` on inputs | A11Y-child-world-skills/museum/collection, A11Y-admin-* |
| BUG-026 | Medium | Word Quest | A typed spelling answer could be wiped just after a new question appeared (found by the browser journey) | Reset answer state during render instead of in an effect | UI-J1-* |
| BUG-009 | Low | UI | `ref` passed as a regular prop | Renamed `refSlug` | CON-* |
| BUG-010 | Low | Responsive | Avatar studio overflow at 320px | `min-w-0`, smaller preview | RSP-child-world-avatar-320 |
| BUG-019 | Low | Accessibility | Landing carousel not keyboard-scrollable | Focusable labelled region with focus ring | A11Y-public-home |
| BUG-020 | Low | Responsive | Admin analytics overflow at 320px (51px) and 768px (42px) | Scroll wrapper, `min-w-0` grid items, responsive objective grid | RSP-admin-* |
| BUG-021 | Low | Security | No HSTS on production builds | HSTS 2 years with `includeSubDomains` | SEC-014 |
| BUG-022 | Low | Test harness | False results: the reduced-motion regex rejected 1e-06s; inputs in scrollable tables were counted as clipped; the logo exclusion masked BUG-015 | Numeric parse, scroll-aware check, exclusions removed | A11Y-*-reduced-motion, RSP-admin-economy-* |
| BUG-023 | Low | Accessibility | Read-aloud buttons 20 px and 17×20 px tall (below WCAG 2.5.8); the audit computed small targets but never asserted them | Enlarged to 40 px; TGT-* assertion added | TGT-* |
| BUG-025 | Low | Test harness | Accessibility audit covered only 11 of 45 pages, and one timeout could crash the run | axe and keyboard checks on every page; per-page BLOCKED recording; waits for fades | A11Y-*, KBD-* |
| BUG-016 | Low | Test harness | Visual baselines captured mid-animation | Settle animations before capture; baselines regenerated | VIS-* |

## Open / blocked

| ID | Sev | Status | Item | Next action | Owner |
|---|---|---|---|---|---|
| OPEN-002 | High | Open | Official master logo file not committed; the interim wordmark shows and the favicon/OG derivatives are not generated | Commit `public/assets/brand/ping-vibe-logo.png` (original file), run `npm run brand:assets`, re-run ui-audit | Brand owner |
| OPEN-003 | High | Blocked | Live Claude writing evaluation and companion untested (LRN-037, LRN-084) | Provide a staging `ANTHROPIC_API_KEY` and re-run `tests/qa-api.mjs` | Engineering |
| OPEN-001 | Medium | Open | API p95 at the 1.5s target with 30 concurrent children on embedded PGlite. It is unstable: 2,554 ms in one run and 1,496 ms in the next, with a max of 8–10 s. Both runs had 0 errors and correct awards. | Re-run `tests/perf.mjs` against managed Postgres with pooling | Engineering / DevOps |

Full reproduction steps, expected and actual results for every entry are in `defects.json`.
