# PING VIBE — QA deliverables

Start with **[PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md)**.

| Document | Contents |
|---|---|
| [QA_MASTER_TEST_PLAN.md](QA_MASTER_TEST_PLAN.md) | Strategy, master test matrix, journeys 1–6, entry/exit criteria, what was not executed, sign-offs |
| [COMPLETE_TEST_CASES.md](COMPLETE_TEST_CASES.md) | Every executed test case with status (generated) |
| [UI_UX_AUDIT_REPORT.md](UI_UX_AUDIT_REPORT.md) | Child-centred UI/UX review and visual regression |
| [AUTHENTICATION_TEST_REPORT.md](AUTHENTICATION_TEST_REPORT.md) | Registration, verification, consent, login, reset, role and family isolation |
| [LEARNING_MODULE_TEST_REPORT.md](LEARNING_MODULE_TEST_REPORT.md) | Onboarding, Word Quest, writing, grammar, reading, speaking, arcade, companion |
| [GAMIFICATION_TEST_REPORT.md](GAMIFICATION_TEST_REPORT.md) | Economy, levels, missions, bosses, pets, healthy engagement |
| [API_AND_DATABASE_TEST_REPORT.md](API_AND_DATABASE_TEST_REPORT.md) | API contracts, DB integrity, transactions |
| [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) | Controls, findings, DPDP, recommendations |
| [PERFORMANCE_TEST_REPORT.md](PERFORMANCE_TEST_REPORT.md) | Page timings and 30-child load |
| [RESPONSIVE_TEST_REPORT.md](RESPONSIVE_TEST_REPORT.md) | 8 viewports × all pages |
| [ACCESSIBILITY_TEST_REPORT.md](ACCESSIBILITY_TEST_REPORT.md) | axe-core WCAG 2.x A/AA, keyboard, motion |
| [BUG_REGISTER.md](BUG_REGISTER.md) / [defects.json](defects.json) | All defects, fixes and open items |
| [REGRESSION_TEST_REPORT.md](REGRESSION_TEST_REPORT.md) | Post-fix regression runs |
| [results/test-execution-report.json](results/test-execution-report.json) | Machine-readable totals, defects by severity and release recommendation |

Raw results:
- `results/qa-api.json`, `results/ui-audit.json`, `results/perf.json`, `results/axe-details.jsonl`
- Visual baselines in `screenshots/baseline/`

To re-run everything, see *Quality assurance* in the root README.
