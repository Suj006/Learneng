# PING VIBE — Authentication & Authorisation Test Report

**Result: 57 / 57 PASS** (AUTH 37, AUTHZ 20), plus admin login ADM-001/002 and the browser Journey 1. Executed against the production build with synthetic families. Full case list: `COMPLETE_TEST_CASES.md`.

## Model under test

| Actor | Credential | Session |
|---|---|---|
| Parent | E-mail + password (scrypt). E-mail must be verified and DPDP consent given before any child is active. | DB session, sha256-hashed token, `HttpOnly; SameSite=Lax` cookie |
| Explorer (child) | Generated username (no real name) + 6-digit PIN set by the parent | Separate child session; also launchable from the parent dashboard |
| Admin | Bootstrapped from `ADMIN_EMAIL`/`ADMIN_PASSWORD` environment variables | Admin role checked on every admin route and API |

Every state-changing request passes a same-origin check, a 64 KB body limit, and per-account plus per-network rate limits.

## Results by area

| Area | IDs | Result | Notes |
|---|---|---|---|
| Registration validation | AUTH-001…015 | 15/15 | Empty/whitespace/markup/over-long names, bad e-mail, month 13, out-of-range age, unsupported grade, weak password, missing declaration, malformed JSON (400 not 500) |
| No account enumeration | AUTH-014, AUTH-042 | 2/2 | Duplicate sign-up and unknown-e-mail reset return the same neutral response |
| E-mail verification & consent | AUTH-020…022 | 3/3 | Invalid token → expired page with no session; verify + consent → active Explorer |
| Parent login | AUTH-030…034 | 5/5 | Wrong password 401, empty 400, unverified blocked with resend |
| Child login & PIN lockout | AUTH-035…040 | 6/6 | Lockout after 5 wrong PINs (429). Multi-device sessions are independent, and logout revokes the token server-side. |
| Password reset (new — BUG-014) | AUTH-041…048 | 8/8 | Single-use hashed token. Weak password rejected. All old sessions revoked. Old password stops working. |
| PIN reset clears lockout (BUG-006) | PAR-007/008 | 2/2 | The child is signed out, can then log in with the new PIN, and progress is intact |
| Role isolation | AUTHZ-001…007 | 7/7 | Child ↛ parent/admin; parent ↛ admin; unauthenticated → redirect / 401 |
| Family isolation | AUTHZ-008…013 | 6/6 | A parent cannot view, export, delete, reset the PIN of, launch, or challenge another family's child |
| Child-to-child isolation | AUTHZ-014…019 | 6/6 | Child A cannot read, overwrite or submit child B's writing or challenge, and cannot answer or revise words they don't own. Not-found responses leak no content. |
| Answer-key secrecy | AUTHZ-020 | 1/1 | Challenge payloads never contain answers |
| Browser journey | JRN-1 | PASS | Sign-up → dev mailbox link → consent → launch child → welcome → quest |

## Defects found and fixed

| ID | Severity | Summary |
|---|---|---|
| BUG-001 | Medium | Invalid sign-ups consumed the rate limit. Validation now runs first (regression SEC-012). |
| BUG-002 | High | Network limiter keyed on the spoofable left-most `X-Forwarded-For`. Now uses platform headers or the right-most hop (unit-tested). |
| BUG-006 | Medium | PIN reset did not clear the child lockout. |
| BUG-011 | High | Parent → child hand-off rendered a blank welcome. Fixed with a full navigation on every identity change. |
| BUG-014 | High | No password-reset flow. Implemented. |

## Known limitations

- Live e-mail delivery (Resend) was not exercised. The dev mailbox was used, and the production transport is configured by `RESEND_API_KEY`.
- No MFA for parents or admin. Recommended for the admin role before public launch.
- The in-memory rate limiter is per-instance. A multi-instance deployment needs a shared store (Redis or Postgres) for strict limits.
