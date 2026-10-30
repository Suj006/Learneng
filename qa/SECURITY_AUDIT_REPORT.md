# PING VIBE — Security Audit Report

Scope: the application code in this repository, its dependencies and its HTTP surface. This is an internal engineering audit, **not** a third-party penetration test.

## Summary

| Category | Result |
|---|---|
| Automated security checks (SEC-001…012) | 12 / 12 PASS |
| Authorisation and isolation checks (AUTHZ-001…020) | 20 / 20 PASS |
| `npm audit --omit=dev` | **0 vulnerabilities** (was: 1 critical Next.js advisory plus others; fixed, BUG-013) |
| Secrets in repository / HTML | None found. `.env.local` is gitignored, and SEC-009 checks the rendered HTML. |
| Open security defects | 0 code defects. Infrastructure recommendations below. |

## Controls verified

| Threat | Control | Evidence |
|---|---|---|
| Credential theft | scrypt password hashing; PINs hashed; reset tokens and session tokens stored as sha256 hashes | Code review, PAR-009 (export excludes hashes) |
| Session hijack | `HttpOnly`, `SameSite=Lax`, `Secure` in production; server-side revocation on logout and password reset | SEC-010, AUTH-038, AUTH-046 |
| CSRF | Same-origin check on every state-changing request | SEC-001/002 |
| Brute force | Per-account lockout (child PIN: 5 tries); per-network limits; client IP from platform header or the right-most proxy hop | AUTH-040, unit `pickClientIp`, **BUG-002** fixed |
| Account enumeration | Neutral responses for duplicate sign-up and unknown reset e-mail | AUTH-014, AUTH-042 |
| SQL injection | Parameterised queries only | SEC-003/004 |
| XSS | React escaping; no `dangerouslySetInnerHTML` with user data; strict name validation | SEC-005, AUTH-011 |
| Clickjacking / sniffing | `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (microphone limited to self), HSTS in production | SEC-008 |
| DoS via payload | 64 KB body limit, length caps on writing (6,000 chars) | SEC-006, LRN-032 |
| Unauthenticated cron | `CRON_SECRET` bearer required | SEC-007 |
| IDOR across families/children | Every query scoped by the session's parent or child id | AUTHZ-008…019 |
| Cheating / economy abuse | Server-side scoring, hidden answer keys, idempotent ledger, conditional coin updates | AUTHZ-020, CON-*, LOAD-003 |
| API key exposure | The Anthropic key is used only server-side and never reaches client bundles or logs | SEC-009, code review |
| Raw AI output reaching children | Structured output validated by schema. Generated content passes 7 validation gates and needs admin approval before publishing. The companion filters PII and unsafe topics on input and output. | ADM-010…013, LRN-081…083, **BUG-004** fixed |

## Child privacy (DPDP Act 2023, India)

- Verifiable parental consent is recorded before a child account is active.
- Data is minimised: only first name, birth month/year and grade are stored. The generated username contains no real name (SEC-011). No audio is stored (LRN-060).
- Parents can export all of their child's data (PAR-009) and delete it (PAR-011).
- There is no child-to-child communication, no public profiles, no ads and no third-party trackers.

## Recommendations before public launch

1. **Third-party penetration test**, including a review of the admin panel.
2. **MFA for admin accounts.** Restrict the admin route by IP or SSO if possible.
3. **Shared rate-limit store** (Redis or Postgres) when running more than one instance.
4. **Content-Security-Policy** with nonces. Not yet set, because Next.js inline scripts need a nonce setup.
5. Rotate `ADMIN_PASSWORD` after the first login, and remove it from the environment.
6. Run Supabase RLS policies (`db/supabase-rls.sql`) and confirm that the anon key cannot read any table.
7. Set up dependency scanning in CI (npm audit / Dependabot).
