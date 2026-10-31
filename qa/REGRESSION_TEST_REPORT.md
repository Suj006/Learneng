# PING VIBE — Regression Test Report

After each fix, the affected suite was re-run. After the last fix, every suite was re-run end to end. No test was deleted, skipped or weakened to obtain a pass. Where the test harness itself was wrong (BUG-016, BUG-022, BUG-025), the correction made checks **stricter or more accurate**, and the corrections are listed in the bug register.

## Final regression run

| Suite | Environment | Result |
|---|---|---|
| Unit (vitest) | Node | __UNIT__ |
| API, DB, security, learning (`tests/qa-api.mjs`) | Production build, fresh DB, `QA_PRODUCTION=1` | **217 checks: 215 PASS · 0 FAIL · 2 BLOCKED** (live Claude) |
| UI journey, responsive, console, accessibility, target size, visual (`tests/ui-audit.mjs`) | `next dev`, fresh DB | __UI__ |
| Performance & load (`tests/perf.mjs`) | Production build | 7 of 8 PASS in the final run. LOAD-002 is borderline: it passed by 4 ms and failed in the previous run (OPEN-001). |
| Type check (`tsc --noEmit`) | — | 0 errors |
| Production build (`next build`) | — | Succeeds |
| `npm audit --omit=dev` | — | 0 vulnerabilities |

## Defect regression checks

| Defect | Regression check(s) | Final status |
|---|---|---|
| BUG-001 sign-up rate limit | SEC-012 | PASS |
| BUG-002 spoofed XFF | unit `pickClientIp` | PASS |
| BUG-003 grammar 500 | LRN-040…042 | PASS |
| BUG-004 companion plurals | LRN-083 | PASS |
| BUG-005 early unlocks | GAM-030 | PASS |
| BUG-006 PIN lockout | PAR-007/008 | PASS |
| BUG-007 parent report 500 | PAR-001/002 | PASS |
| BUG-008 hydration | CON-RSP-* (no console errors) | __CON__ |
| BUG-009 ref prop | CON-RSP-* | __CON__ |
| BUG-010 avatar overflow | RSP-child-world-avatar-320 | __AVATAR__ |
| BUG-011 blank hand-off | JRN-1-* | __JRN__ |
| BUG-012 login CLS | PERF-login (CLS 0.000) | PASS |
| BUG-013 npm critical | `npm audit` | PASS (0) |
| BUG-014 password reset | AUTH-041…048 | PASS |
| BUG-015 broken logo | RSP-public-* (broken images), CON-* (failed requests) | __PUBLIC__ |
| BUG-016 baselines mid-animation | VIS-* | __VIS__ |
| BUG-017/018/019/024 accessibility | A11Y-* | __A11Y__ |
| BUG-020 admin overflow | RSP-admin-* | __ADMIN__ |
| BUG-021 HSTS | SEC-014 | PASS |
| BUG-022/025 harness | A11Y-*-reduced-motion, RSP-admin-economy-*, axe on every page | __HARNESS__ |
| BUG-023 target size | TGT-* | __TGT__ |

## Visual regression

- Baselines were regenerated after the final UI fixes. Pages changed by the last accessibility fixes (skills, collection, museum, admin) were refreshed on their own using `ONLY=… --update-baseline`.
- The comparison run then measured every deterministic page at 375, 768 and 1440 px against those baselines.
- Pages with per-child random or time-based content are captured for manual review only (`DYNAMIC` in `tests/ui-audit.mjs`).

## Known gaps in regression coverage

- Live Claude API paths (LRN-037, LRN-084) are BLOCKED. Re-run with a staging key before launch.
- There is no CI pipeline yet. Add `vitest`, `qa-api` and `ui-audit` to CI so they run on every change.
