# PING VIBE — Complete Test Cases (executed)

Generated 2026-10-31T08:55:01.147Z by `node scripts/qa-report.mjs` from the raw results in `qa/results/`. Synthetic data only.

**Totals:** 1449 executed · 1444 pass · 4 fail · 1 blocked (includes 21 vitest unit tests).

| Suite | Command | Total | Pass | Fail | Blocked |
|---|---|---|---|---|---|
| Unit (engines) | `npx vitest run` | 21 | 21 | 0 | 0 |
| API, database, security & learning | `node tests/qa-api.mjs` | 217 | 213 | 3 | 1 |
| UI journeys, responsive, console, accessibility & visual | `node tests/ui-audit.mjs` | 1203 | 1203 | 0 | 0 |
| Performance & load | `node tests/perf.mjs` | 8 | 7 | 1 | 0 |

## API, database, security & learning

_Run against http://localhost:3000 at 2026-10-31T08:53:44.648Z._

### Registration

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| AUTH-001 | High | Valid registration accepted | ✅ PASS |  |
| AUTH-002 | High | Empty child name rejected | ✅ PASS | 400 Please enter your child's first name. |
| AUTH-003 | High | Whitespace-only child name rejected | ✅ PASS | 400 Please enter your child's first name. |
| AUTH-004 | High | Invalid e-mail rejected | ✅ PASS | 400 Please enter a valid e-mail address. |
| AUTH-005 | High | Missing birth month rejected | ✅ PASS | 400 Please check “birthMonth”. |
| AUTH-006 | High | Invalid month (13) rejected | ✅ PASS | 400 Please check “birthMonth”. |
| AUTH-007 | High | Birth year outside 5–13 age range rejected | ✅ PASS | 400 PING VIBE is for children aged 5–13. |
| AUTH-008 | High | Missing grade rejected | ✅ PASS | 400 Please choose a grade. |
| AUTH-009 | High | Unsupported grade rejected | ✅ PASS | 400 Please choose a grade. |
| AUTH-010 | High | Extremely long name (41+ chars) rejected | ✅ PASS | 400 Name is too long. |
| AUTH-011 | High | Special characters / markup in name rejected | ✅ PASS | 400 Use letters only for the name. |
| AUTH-012 | High | Weak password rejected | ✅ PASS | 400 Password needs at least 8 characters. |
| AUTH-013 | High | Missing parent declaration rejected | ✅ PASS | 400 Only a parent or legal guardian can create an account. |
| AUTH-014 | High | Duplicate e-mail: same neutral response (no account enumeration) | ✅ PASS |  |
| AUTH-015 | High | Malformed JSON returns 400, not 500 | ✅ PASS | 400 |

### E-mail verification

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| AUTH-020 | Critical | Invalid verification token → expired page, no session | ✅ PASS | http://localhost:3000/verify?expired=1 |
| AUTH-021 | Critical | Verification + consent creates an active Explorer | ✅ PASS | zippyfalcon853 |
| AUTH-022 | Critical | Verification e-mail generated with link | ✅ PASS |  |

### Login & sessions

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| AUTH-030 | Critical | Parent login with correct credentials | ✅ PASS |  |
| AUTH-031 | Critical | Parent login with wrong password → 401 | ✅ PASS |  |
| AUTH-032 | Critical | Parent login with empty credentials → 400 | ✅ PASS |  |
| AUTH-033 | Critical | Unverified parent blocked with resend option | ✅ PASS |  |
| AUTH-034 | Critical | Resend verification accepted | ✅ PASS |  |
| AUTH-035 | Critical | Child login with wrong PIN → 401 | ✅ PASS |  |
| AUTH-036 | Critical | Child login non-6-digit PIN → 400 | ✅ PASS |  |
| AUTH-037 | Critical | Second browser session for same child works | ✅ PASS |  |
| AUTH-038 | Critical | Logged-out session token is rejected server-side | ✅ PASS | 401 |
| AUTH-039 | Critical | First session still valid after other device logs out | ✅ PASS |  |
| AUTH-040 | Critical | Child PIN brute force locked after 5 attempts (429) | ✅ PASS | 429 |
| AUTH-041 | Critical | Forgot password e-mails a reset link | ✅ PASS |  |
| AUTH-042 | Critical | Forgot password for unknown e-mail: same neutral response | ✅ PASS |  |
| AUTH-043 | Critical | Reset with weak password rejected | ✅ PASS |  |
| AUTH-044 | Critical | Reset with valid token updates password | ✅ PASS |  |
| AUTH-045 | Critical | Reset token cannot be reused | ✅ PASS |  |
| AUTH-046 | Critical | Old parent sessions revoked after reset | ✅ PASS |  |
| AUTH-047 | Critical | Login works with the new password | ✅ PASS |  |
| AUTH-048 | Critical | Login with old password fails | ✅ PASS |  |

### Authorisation & data isolation

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| AUTHZ-001 | Critical | Unauthenticated → protected pages redirect to login | ✅ PASS |  |
| AUTHZ-002 | Critical | Unauthenticated API → 401 | ✅ PASS |  |
| AUTHZ-003 | Critical | Child cannot open parent dashboard | ✅ PASS |  |
| AUTHZ-004 | Critical | Child cannot call parent APIs | ✅ PASS |  |
| AUTHZ-005 | Critical | Parent cannot open admin | ✅ PASS |  |
| AUTHZ-006 | Critical | Parent cannot call admin APIs | ✅ PASS |  |
| AUTHZ-007 | Critical | Child cannot call admin APIs | ✅ PASS |  |
| AUTHZ-008 | Critical | Parent cannot view another family's child report | ✅ PASS |  |
| AUTHZ-009 | Critical | Parent cannot export another family's child data | ✅ PASS |  |
| AUTHZ-010 | Critical | Parent cannot delete another family's child | ✅ PASS |  |
| AUTHZ-011 | Critical | Parent cannot reset another family's child PIN | ✅ PASS |  |
| AUTHZ-012 | Critical | Parent cannot launch another family's child session | ✅ PASS |  |
| AUTHZ-013 | Critical | Parent cannot send family challenge to another child | ✅ PASS |  |
| AUTHZ-014 | Critical | Child A cannot read child B's writing page (not-found, no content leak) | ✅ PASS | 307 |
| AUTHZ-015 | Critical | Child A cannot overwrite child B's draft | ✅ PASS |  |
| AUTHZ-016 | Critical | Child A cannot submit child B's writing | ✅ PASS |  |
| AUTHZ-017 | Critical | Child A cannot submit child B's challenge attempt | ✅ PASS | 400 Challenge not found. |
| AUTHZ-018 | Critical | Child cannot answer a word outside their own quest | ✅ PASS |  |
| AUTHZ-019 | Critical | Child cannot revise a word they haven't discovered | ✅ PASS |  |
| AUTHZ-020 | Critical | Answer keys never sent to the client (challenge payload) | ✅ PASS |  |

### Onboarding

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-001 | High | First login redirects to play-based welcome (no assessment) | ✅ PASS | /world/welcome |
| LRN-002 | High | Welcome grants gift and routes to first quest | ✅ PASS |  |
| LRN-003 | High | Welcome gift cannot be claimed twice | ✅ PASS |  |
| LRN-004 | High | Daily Adventure renders after onboarding | ✅ PASS |  |

### Daily Word Quest

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-010 | High | 10 new words generated | ✅ PASS | 10 |
| LRN-011 | High | Words match grade band (G3 → band 3) | ✅ PASS | 3,3,3,3,3,3,3,3,3,3 |
| LRN-012 | High | Each word has meaning, phonetic, example, emoji | ✅ PASS |  |
| LRN-013 | High | Five challenge rounds generated | ✅ PASS |  |
| LRN-014 | High | Quest is stable on reload (same 10 words — resume works) | ✅ PASS |  |
| LRN-015 | High | Completing before answering is refused | ✅ PASS |  |
| LRN-016 | High | Mid-quest close & reopen: answered questions are remembered | ✅ PASS | 5 |
| LRN-017 | High | Server validates correct answers | ✅ PASS | 11 |
| LRN-018 | High | Re-answering does not change score (first attempt counts) | ✅ PASS |  |
| LRN-019 | High | Quest completion awards XP scaled by accuracy | ✅ PASS | 100 |
| LRN-020 | High | Quest XP not duplicated | ✅ PASS |  |
| LRN-021 | High | Vocabulary history: 10 words discovered, none mastered on day 1 | ✅ PASS |  |
| LRN-022 | High | Revision set available from discovered words | ✅ PASS |  |
| LRN-023 | High | Spaced repetition: repeated same-day correct answers do NOT grant mastery | ✅ PASS | box=1 status=practising |

### Creative Writing

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-030 | High | Writing page offers topics | ✅ PASS |  |
| LRN-031 | High | Empty draft save allowed but submit refused | ✅ PASS |  |
| LRN-032 | High | Over-long submission (>6000 chars) rejected | ✅ PASS |  |
| LRN-033 | High | Draft save then update same draft | ✅ PASS |  |
| LRN-034 | High | Submission evaluated with score, corrections and encouragement | ✅ PASS |  |
| LRN-035 | High | Original vs corrected sentences provided | ✅ PASS |  |
| LRN-036 | High | Resubmitting an evaluated piece is refused | ✅ PASS |  |
| LRN-037 | High | Claude writing evaluation (real AI) | ❌ FAIL | evaluator=offline (key set; see server log "[ai] writing evaluation failed") |
| LRN-038 | High | Draft cannot be edited after evaluation | ✅ PASS |  |

### Grammar Galaxy

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-040 | High | Grammar mission scored server-side (all correct = 100%) | ✅ PASS | 100 |
| LRN-041 | High | Duplicate exercise indices rejected | ✅ PASS |  |
| LRN-042 | High | Out-of-range exercise index rejected | ✅ PASS |  |
| LRN-043 | High | Unknown grammar topic → 404 | ✅ PASS |  |
| LRN-044-articles | High | Endless drill "articles" generates valid exercises | ✅ PASS | 6 |
| LRN-044-nouns | High | Endless drill "nouns" generates valid exercises | ✅ PASS | 6 |
| LRN-044-verbs | High | Endless drill "verbs" generates valid exercises | ✅ PASS | 6 |
| LRN-044-adjectives | High | Endless drill "adjectives" generates valid exercises | ✅ PASS | 6 |
| LRN-044-opposites | High | Endless drill "opposites" generates valid exercises | ✅ PASS | 6 |
| LRN-044-synonyms | High | Endless drill "synonyms" generates valid exercises | ✅ PASS | 6 |
| LRN-044-sentence | High | Endless drill "sentence" generates valid exercises | ✅ PASS | 6 |
| LRN-045-pronouns | High | Grammar topic page "pronouns" loads | ✅ PASS |  |
| LRN-045-verbs | High | Grammar topic page "verbs" loads | ✅ PASS |  |
| LRN-045-adjectives | High | Grammar topic page "adjectives" loads | ✅ PASS |  |
| LRN-045-articles | High | Grammar topic page "articles" loads | ✅ PASS |  |
| LRN-045-prepositions | High | Grammar topic page "prepositions" loads | ✅ PASS |  |
| LRN-045-punctuation | High | Grammar topic page "punctuation" loads | ✅ PASS |  |
| LRN-045-sentence-construction | High | Grammar topic page "sentence-construction" loads | ✅ PASS |  |
| LRN-045-adverbs | High | Grammar topic page "adverbs" loads | ✅ PASS |  |
| LRN-045-conjunctions | High | Grammar topic page "conjunctions" loads | ✅ PASS |  |
| LRN-045-tenses | High | Grammar topic page "tenses" loads | ✅ PASS |  |
| LRN-045-subject-verb-agreement | High | Grammar topic page "subject-verb-agreement" loads | ✅ PASS |  |
| LRN-045-active-passive | High | Grammar topic page "active-passive" loads | ✅ PASS |  |
| LRN-045-direct-indirect | High | Grammar topic page "direct-indirect" loads | ✅ PASS |  |

### Reading Adventures

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-050 | High | Reading quiz scored (all correct) | ✅ PASS | 100 |
| LRN-051 | High | Wrong answer count length rejected | ✅ PASS |  |
| LRN-052 | High | Reward-locked story redirects to shop (story text not sent) | ✅ PASS |  |
| LRN-053 | High | Reading XP once per story (no farming) | ✅ PASS |  |

### Speaking & Listening

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-060 | High | Speaking session recorded with accuracy only (no audio) | ✅ PASS |  |
| LRN-061 | High | Unsupported-browser fallback (accuracy=null) accepted | ✅ PASS |  |
| LRN-062 | High | Unknown speaking scenario rejected | ✅ PASS |  |
| LRN-063 | High | Listening Lab generates 8 audio questions | ✅ PASS |  |
| LRN-064 | High | Listening scored server-side | ✅ PASS | 4 |

### Word Games Arcade

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-070-word-match | High | Game page "word-match" loads | ✅ PASS |  |
| LRN-070-spell-master | High | Game page "spell-master" loads | ✅ PASS |  |
| LRN-070-missing-word | High | Game page "missing-word" loads | ✅ PASS |  |
| LRN-070-picture-vocabulary | High | Game page "picture-vocabulary" loads | ✅ PASS |  |
| LRN-070-word-race | High | Game page "word-race" loads | ✅ PASS |  |
| LRN-070-sentence-builder | High | Game page "sentence-builder" loads | ✅ PASS |  |
| LRN-070-word-detective | High | Game page "word-detective" loads | ✅ PASS |  |
| LRN-070-word-hunter | High | Game page "word-hunter" loads | ✅ PASS |  |
| LRN-070-treasure-hunt | High | Game page "treasure-hunt" loads | ✅ PASS |  |
| LRN-070-boss-battle | High | Game page "boss-battle" loads | ✅ PASS |  |
| LRN-071 | High | Game result awards XP and best score | ✅ PASS |  |
| LRN-072 | High | Inflated game score is clamped to max | ✅ PASS | 5 |
| LRN-073 | High | Unknown game rejected | ✅ PASS |  |
| LRN-074 | High | Client-scored games never grant mastery | ✅ PASS | 0 |

### AI companion

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| LRN-080 | Critical | LEXI answers vocabulary question | ✅ PASS |  |
| LRN-081 | Critical | Phone number blocked | ✅ PASS |  |
| LRN-082 | Critical | E-mail address blocked | ✅ PASS |  |
| LRN-083 | Critical | Unsafe topic redirected to a trusted adult | ✅ PASS |  |
| LRN-084 | Critical | Real Claude companion response | ❌ FAIL | source=dictionary (key set; see server log "[ai] companion failed") |

### XP, levels & economy

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| GAM-001 | High | Profile shows Level 2 after ~250 XP | ✅ PASS | Level 7 |
| GAM-002 | High | Insufficient coins / level → friendly refusal | ✅ PASS | Reach Level 8 to unlock this! |
| GAM-003 | High | Redeem affordable item deducts coins | ✅ PASS |  |
| GAM-004 | High | Cannot buy the same item twice | ✅ PASS |  |
| GAM-005 | High | Level-exclusive reward cannot be bought | ✅ PASS |  |
| GAM-006 | High | Crystal item refused without crystals | ✅ PASS |  |
| GAM-007 | High | Invalid reward slug → 404 | ✅ PASS |  |
| GAM-008 | High | Avatar saved with owned items | ✅ PASS |  |
| GAM-009 | High | Avatar rejects un-owned item | ✅ PASS |  |
| GAM-010 | High | Avatar rejects item in wrong slot | ✅ PASS |  |
| GAM-011 | High | Avatar rejects off-palette colour | ✅ PASS |  |
| GAM-012 | High | Avatar persists after reload | ✅ PASS |  |

### Missions

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| GAM-020 | High | Completed daily mission claimable | ✅ PASS |  |
| GAM-021 | High | Mission reward idempotent (claim twice) | ✅ PASS |  |
| GAM-022 | High | Unfinished mission cannot be claimed | ✅ PASS | Keep going — this mission isn't finished yet! |
| GAM-023 | High | Unknown mission refused | ✅ PASS |  |

### Bosses, map & world

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| GAM-030 | High | Boss above level is locked | ✅ PASS |  |
| GAM-031 | High | Boss battle created (easy = 6 rounds) | ✅ PASS | 6 |
| GAM-032 | High | Losing a boss gives practice XP only, no penalty | ✅ PASS |  |
| GAM-033 | High | Locked treasure cannot be claimed | ✅ PASS |  |
| GAM-034 | High | Non-treasure location cannot be claimed | ✅ PASS |  |
| GAM-035 | High | Pet choose refused when not unlocked | ✅ PASS |  |
| GAM-036 | High | First pet (Hoot, 10 words) unlocked from learning | ✅ PASS |  |
| GAM-037 | High | Unlock notifications created (pets/milestones) | ✅ PASS |  |

### Concurrency & transactions

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| CON-001 | Critical | 8 parallel quest completions → exactly one XP award | ✅ PASS | [91,0,0,0,0,0,0,0] |
| CON-002 | Critical | 6 parallel mission claims → one reward | ✅ PASS | [30,0,0,0,0,0] |
| CON-003 | Critical | 5 parallel purchases of same item → one success, no double spend | ✅ PASS | 200,400,400,400,400 |
| CON-004 | Critical | 5 parallel Surprise Box opens → one award | ✅ PASS |  |
| CON-005 | Critical | 3 children start quests simultaneously, each gets own words | ✅ PASS |  |

### Grade journeys

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| GRD-PRE_KG | High | PRE_KG child receives band-1 words | ✅ PASS | 1111111111 |
| GRD-UKG | High | UKG child receives band-1 words | ✅ PASS | 1111111111 |
| GRD-G7 | High | G7 child receives band-4 words | ✅ PASS | 4444444444 |
| GRD-G1 | High | Grade 1 child receives band-2 words | ✅ PASS |  |
| GRD-WRITE-PRE_KG | High | PRE_KG writing topics are age-graded | ✅ PASS |  |
| GRD-WRITE-G7 | High | G7 writing topics are age-graded | ✅ PASS |  |

### Parent dashboard

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| PAR-001 | High | Dashboard shows the child's real data (words introduced = 10) | ✅ PASS | 200 |
| PAR-002 | High | Child report renders observations disclaimer | ✅ PASS |  |
| PAR-003 | High | Settings save | ✅ PASS |  |
| PAR-004 | High | Companion disabled by parent is enforced | ✅ PASS |  |
| PAR-005 | High | Family challenge created from child's words | ✅ PASS |  |
| PAR-006 | High | Family challenge rejects undiscovered words | ✅ PASS |  |
| PAR-007 | High | PIN reset signs the child out | ✅ PASS |  |
| PAR-008 | High | Regression BUG-006: after PIN reset the locked-out child can log in; progress intact | ✅ PASS |  |
| PAR-009 | High | DPDP export contains learning data, no PIN/password hashes | ✅ PASS |  |
| PAR-010 | High | Parent adds a second child (pending consent) | ✅ PASS |  |
| PAR-011 | High | Deleting a child erases data and ends their sessions | ✅ PASS |  |

### Administration

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| ADM-001 | High | Admin login | ✅ PASS |  |
| ADM-002 | High | Admin wrong password → 401 | ✅ PASS |  |
| ADM-003-admin | High | Admin page /admin renders | ✅ PASS |  |
| ADM-003-admin-content | High | Admin page /admin/content renders | ✅ PASS |  |
| ADM-003-admin-economy | High | Admin page /admin/economy renders | ✅ PASS |  |
| ADM-003-admin-events | High | Admin page /admin/events renders | ✅ PASS |  |
| ADM-003-admin-vocabulary | High | Admin page /admin/vocabulary renders | ✅ PASS |  |
| ADM-003-admin-grades | High | Admin page /admin/grades renders | ✅ PASS |  |
| ADM-010 | High | Manual vocabulary passes validation gates → review queue | ❌ FAIL | independent AI review |
| ADM-011 | High | Unsafe/low-quality word fails safety, mechanics & difficulty gates | ✅ PASS |  |
| ADM-012 | High | Pending item visible in review queue | ✅ PASS |  |
| ADM-013 | High | Approve & publish → word live in vocabulary master | ✅ PASS |  |
| ADM-014 | High | Gen endpoint without AI key returns clear error | ⛔ BLOCKED |  |
| ADM-015 | High | XP config update persists | ✅ PASS |  |
| ADM-016 | High | Invalid XP config rejected | ✅ PASS |  |
| ADM-017 | High | Daily XP ceiling update | ✅ PASS |  |
| ADM-018 | High | Append levels beyond 250 (unlimited progression) | ✅ PASS | 255 |
| ADM-019 | High | Create event (mission + card auto-created) | ✅ PASS |  |
| ADM-020 | High | Invalid event slug rejected | ✅ PASS |  |
| ADM-021 | High | Add new grade generates its 365-day plan | ✅ PASS |  |
| ADM-022 | High | Admin vocabulary edit validates input | ✅ PASS |  |

### Security

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| SEC-001 | Critical | GET with foreign origin harmless (read-only) | ✅ PASS |  |
| SEC-002 | Critical | Cross-site POST blocked (CSRF origin check) | ✅ PASS | 403 |
| SEC-003 | Critical | SQL injection in username has no effect | ✅ PASS |  |
| SEC-004 | Critical | SQL injection in admin search is parameterised | ✅ PASS |  |
| SEC-005 | Critical | Stored XSS in writing is escaped on render | ✅ PASS |  |
| SEC-006 | Critical | Oversized request body rejected (413) | ✅ PASS | 413 |
| SEC-007 | Critical | Cron endpoints require secret | ✅ PASS |  |
| SEC-008 | Critical | Security headers present | ✅ PASS |  |
| SEC-013 | Critical | Referrer-Policy and Permissions-Policy (microphone self only) present | ✅ PASS |  |
| SEC-014 | Critical | HSTS header on production build | ✅ PASS | max-age=63072000; includeSubDomains |
| SEC-009 | Critical | No secrets in page HTML | ✅ PASS |  |
| SEC-010 | Critical | Session cookie is HttpOnly + SameSite | ✅ PASS |  |
| SEC-011 | Critical | Explorer username contains no real name | ✅ PASS |  |
| SEC-012 | Critical | Regression BUG-001: invalid attempts don't consume the sign-up limit | ✅ PASS |  |

## UI journeys, responsive, console, accessibility & visual

_Run against http://localhost:3000 at 2026-10-31T05:51:27.443Z._

### Journey 1

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| UI-J1-01 | Critical | Homepage → Start Your Adventure → register via form | ✅ PASS |  |
| UI-J1-02 | Critical | E-mail link → verify button → consent page | ✅ PASS |  |
| UI-J1-03 | Critical | Consent + PIN shows Explorer name | ✅ PASS | sunnymax321 |
| UI-J1-04 | Critical | Child session starts at character welcome (no assessment) | ✅ PASS |  |
| UI-J1-05 | High | Onboarding steps → first Daily Word Quest | ✅ PASS |  |
| UI-J1-06 | Critical | Learn 10 words, answer all rounds, receive XP celebration | ✅ PASS | 16 questions; +66 XP |
| UI-J1-07 | High | Dashboard reflects XP & coins after reload | ✅ PASS |  |
| UI-J1-08 | High | No uncaught JS errors during the journey | ✅ PASS |  |

### Responsive

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| RSP-public-home-320 | Medium | public / @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-320 | Medium | public /signup @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-320 | Medium | public /login @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-320 | Medium | public /login?as=parent @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-320 | Medium | public /privacy @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-320 | Medium | public /forgot-password @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-320 | Medium | public /verify?expired=1 @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-375 | Medium | public / @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-375 | Medium | public /signup @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-375 | Medium | public /login @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-375 | Medium | public /login?as=parent @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-375 | Medium | public /privacy @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-375 | Medium | public /forgot-password @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-375 | Medium | public /verify?expired=1 @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-430 | Medium | public / @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-430 | Medium | public /signup @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-430 | Medium | public /login @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-430 | Medium | public /login?as=parent @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-430 | Medium | public /privacy @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-430 | Medium | public /forgot-password @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-430 | Medium | public /verify?expired=1 @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-768 | Medium | public / @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-768 | Medium | public /signup @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-768 | Medium | public /login @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-768 | Medium | public /login?as=parent @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-768 | Medium | public /privacy @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-768 | Medium | public /forgot-password @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-768 | Medium | public /verify?expired=1 @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-1024 | Medium | public / @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-1024 | Medium | public /signup @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-1024 | Medium | public /login @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-1024 | Medium | public /login?as=parent @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-1024 | Medium | public /privacy @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-1024 | Medium | public /forgot-password @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-1024 | Medium | public /verify?expired=1 @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-1366 | Medium | public / @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-1366 | Medium | public /signup @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-1366 | Medium | public /login @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-1366 | Medium | public /login?as=parent @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-1366 | Medium | public /privacy @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-1366 | Medium | public /forgot-password @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-1366 | Medium | public /verify?expired=1 @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-1440 | Medium | public / @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-1440 | Medium | public /signup @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-1440 | Medium | public /login @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-1440 | Medium | public /login?as=parent @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-1440 | Medium | public /privacy @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-1440 | Medium | public /forgot-password @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-1440 | Medium | public /verify?expired=1 @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-home-1920 | Medium | public / @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-signup-1920 | Medium | public /signup @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-1920 | Medium | public /login @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-login-as-parent-1920 | Medium | public /login?as=parent @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-privacy-1920 | Medium | public /privacy @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-forgot-password-1920 | Medium | public /forgot-password @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-public-verify-expired-1-1920 | Medium | public /verify?expired=1 @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-320 | Medium | child /world @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-320 | Medium | child /world/quest @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-320 | Medium | child /world/map @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-320 | Medium | child /world/map/vocabulary-forest @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-320 | Medium | child /world/my-world @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-320 | Medium | child /world/missions @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-320 | Medium | child /world/arcade @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-320 | Medium | child /world/arcade/word-hunter @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-320 | Medium | child /world/writing @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-320 | Medium | child /world/grammar @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-320 | Medium | child /world/grammar/nouns @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-320 | Medium | child /world/reading @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-320 | Medium | child /world/reading/the-monsoon-puddle @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-320 | Medium | child /world/speaking @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-320 | Medium | child /world/listening @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-320 | Medium | child /world/rewards @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-320 | Medium | child /world/avatar @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-320 | Medium | child /world/pets @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-320 | Medium | child /world/skills @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-320 | Medium | child /world/calendar @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-320 | Medium | child /world/museum @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-320 | Medium | child /world/collection @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-320 | Medium | child /world/notebook @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-320 | Medium | child /world/companion @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-320 | Medium | child /world/me @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-320 | Medium | child /world/story-builder @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-320 | Medium | child /world/boss/word-thief @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-375 | Medium | child /world @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-375 | Medium | child /world/quest @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-375 | Medium | child /world/map @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-375 | Medium | child /world/map/vocabulary-forest @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-375 | Medium | child /world/my-world @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-375 | Medium | child /world/missions @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-375 | Medium | child /world/arcade @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-375 | Medium | child /world/arcade/word-hunter @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-375 | Medium | child /world/writing @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-375 | Medium | child /world/grammar @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-375 | Medium | child /world/grammar/nouns @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-375 | Medium | child /world/reading @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-375 | Medium | child /world/reading/the-monsoon-puddle @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-375 | Medium | child /world/speaking @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-375 | Medium | child /world/listening @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-375 | Medium | child /world/rewards @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-375 | Medium | child /world/avatar @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-375 | Medium | child /world/pets @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-375 | Medium | child /world/skills @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-375 | Medium | child /world/calendar @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-375 | Medium | child /world/museum @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-375 | Medium | child /world/collection @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-375 | Medium | child /world/notebook @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-375 | Medium | child /world/companion @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-375 | Medium | child /world/me @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-375 | Medium | child /world/story-builder @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-375 | Medium | child /world/boss/word-thief @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-430 | Medium | child /world @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-430 | Medium | child /world/quest @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-430 | Medium | child /world/map @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-430 | Medium | child /world/map/vocabulary-forest @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-430 | Medium | child /world/my-world @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-430 | Medium | child /world/missions @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-430 | Medium | child /world/arcade @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-430 | Medium | child /world/arcade/word-hunter @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-430 | Medium | child /world/writing @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-430 | Medium | child /world/grammar @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-430 | Medium | child /world/grammar/nouns @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-430 | Medium | child /world/reading @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-430 | Medium | child /world/reading/the-monsoon-puddle @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-430 | Medium | child /world/speaking @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-430 | Medium | child /world/listening @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-430 | Medium | child /world/rewards @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-430 | Medium | child /world/avatar @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-430 | Medium | child /world/pets @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-430 | Medium | child /world/skills @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-430 | Medium | child /world/calendar @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-430 | Medium | child /world/museum @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-430 | Medium | child /world/collection @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-430 | Medium | child /world/notebook @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-430 | Medium | child /world/companion @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-430 | Medium | child /world/me @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-430 | Medium | child /world/story-builder @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-430 | Medium | child /world/boss/word-thief @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-768 | Medium | child /world @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-768 | Medium | child /world/quest @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-768 | Medium | child /world/map @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-768 | Medium | child /world/map/vocabulary-forest @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-768 | Medium | child /world/my-world @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-768 | Medium | child /world/missions @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-768 | Medium | child /world/arcade @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-768 | Medium | child /world/arcade/word-hunter @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-768 | Medium | child /world/writing @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-768 | Medium | child /world/grammar @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-768 | Medium | child /world/grammar/nouns @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-768 | Medium | child /world/reading @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-768 | Medium | child /world/reading/the-monsoon-puddle @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-768 | Medium | child /world/speaking @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-768 | Medium | child /world/listening @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-768 | Medium | child /world/rewards @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-768 | Medium | child /world/avatar @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-768 | Medium | child /world/pets @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-768 | Medium | child /world/skills @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-768 | Medium | child /world/calendar @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-768 | Medium | child /world/museum @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-768 | Medium | child /world/collection @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-768 | Medium | child /world/notebook @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-768 | Medium | child /world/companion @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-768 | Medium | child /world/me @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-768 | Medium | child /world/story-builder @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-768 | Medium | child /world/boss/word-thief @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-1024 | Medium | child /world @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-1024 | Medium | child /world/quest @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-1024 | Medium | child /world/map @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-1024 | Medium | child /world/map/vocabulary-forest @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-1024 | Medium | child /world/my-world @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-1024 | Medium | child /world/missions @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-1024 | Medium | child /world/arcade @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-1024 | Medium | child /world/arcade/word-hunter @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-1024 | Medium | child /world/writing @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-1024 | Medium | child /world/grammar @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-1024 | Medium | child /world/grammar/nouns @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-1024 | Medium | child /world/reading @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-1024 | Medium | child /world/reading/the-monsoon-puddle @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-1024 | Medium | child /world/speaking @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-1024 | Medium | child /world/listening @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-1024 | Medium | child /world/rewards @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-1024 | Medium | child /world/avatar @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-1024 | Medium | child /world/pets @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-1024 | Medium | child /world/skills @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-1024 | Medium | child /world/calendar @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-1024 | Medium | child /world/museum @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-1024 | Medium | child /world/collection @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-1024 | Medium | child /world/notebook @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-1024 | Medium | child /world/companion @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-1024 | Medium | child /world/me @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-1024 | Medium | child /world/story-builder @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-1024 | Medium | child /world/boss/word-thief @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-1366 | Medium | child /world @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-1366 | Medium | child /world/quest @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-1366 | Medium | child /world/map @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-1366 | Medium | child /world/map/vocabulary-forest @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-1366 | Medium | child /world/my-world @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-1366 | Medium | child /world/missions @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-1366 | Medium | child /world/arcade @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-1366 | Medium | child /world/arcade/word-hunter @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-1366 | Medium | child /world/writing @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-1366 | Medium | child /world/grammar @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-1366 | Medium | child /world/grammar/nouns @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-1366 | Medium | child /world/reading @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-1366 | Medium | child /world/reading/the-monsoon-puddle @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-1366 | Medium | child /world/speaking @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-1366 | Medium | child /world/listening @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-1366 | Medium | child /world/rewards @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-1366 | Medium | child /world/avatar @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-1366 | Medium | child /world/pets @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-1366 | Medium | child /world/skills @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-1366 | Medium | child /world/calendar @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-1366 | Medium | child /world/museum @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-1366 | Medium | child /world/collection @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-1366 | Medium | child /world/notebook @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-1366 | Medium | child /world/companion @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-1366 | Medium | child /world/me @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-1366 | Medium | child /world/story-builder @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-1366 | Medium | child /world/boss/word-thief @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-1440 | Medium | child /world @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-1440 | Medium | child /world/quest @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-1440 | Medium | child /world/map @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-1440 | Medium | child /world/map/vocabulary-forest @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-1440 | Medium | child /world/my-world @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-1440 | Medium | child /world/missions @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-1440 | Medium | child /world/arcade @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-1440 | Medium | child /world/arcade/word-hunter @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-1440 | Medium | child /world/writing @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-1440 | Medium | child /world/grammar @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-1440 | Medium | child /world/grammar/nouns @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-1440 | Medium | child /world/reading @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-1440 | Medium | child /world/reading/the-monsoon-puddle @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-1440 | Medium | child /world/speaking @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-1440 | Medium | child /world/listening @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-1440 | Medium | child /world/rewards @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-1440 | Medium | child /world/avatar @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-1440 | Medium | child /world/pets @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-1440 | Medium | child /world/skills @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-1440 | Medium | child /world/calendar @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-1440 | Medium | child /world/museum @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-1440 | Medium | child /world/collection @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-1440 | Medium | child /world/notebook @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-1440 | Medium | child /world/companion @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-1440 | Medium | child /world/me @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-1440 | Medium | child /world/story-builder @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-1440 | Medium | child /world/boss/word-thief @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-1920 | Medium | child /world @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-quest-1920 | Medium | child /world/quest @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-1920 | Medium | child /world/map @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-map-vocabulary-forest-1920 | Medium | child /world/map/vocabulary-forest @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-my-world-1920 | Medium | child /world/my-world @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-missions-1920 | Medium | child /world/missions @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-1920 | Medium | child /world/arcade @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-arcade-word-hunter-1920 | Medium | child /world/arcade/word-hunter @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-writing-1920 | Medium | child /world/writing @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-1920 | Medium | child /world/grammar @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-grammar-nouns-1920 | Medium | child /world/grammar/nouns @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-1920 | Medium | child /world/reading @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-reading-the-monsoon-puddle-1920 | Medium | child /world/reading/the-monsoon-puddle @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-speaking-1920 | Medium | child /world/speaking @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-listening-1920 | Medium | child /world/listening @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-rewards-1920 | Medium | child /world/rewards @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-avatar-1920 | Medium | child /world/avatar @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-pets-1920 | Medium | child /world/pets @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-skills-1920 | Medium | child /world/skills @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-calendar-1920 | Medium | child /world/calendar @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-museum-1920 | Medium | child /world/museum @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-collection-1920 | Medium | child /world/collection @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-notebook-1920 | Medium | child /world/notebook @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-companion-1920 | Medium | child /world/companion @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-me-1920 | Medium | child /world/me @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-story-builder-1920 | Medium | child /world/story-builder @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-child-world-boss-word-thief-1920 | Medium | child /world/boss/word-thief @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-320 | Medium | parent /parent @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-320 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-320 | Medium | parent /parent/settings @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-375 | Medium | parent /parent @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-375 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-375 | Medium | parent /parent/settings @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-430 | Medium | parent /parent @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-430 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-430 | Medium | parent /parent/settings @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-768 | Medium | parent /parent @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-768 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-768 | Medium | parent /parent/settings @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-1024 | Medium | parent /parent @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1024 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-1024 | Medium | parent /parent/settings @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-1366 | Medium | parent /parent @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1366 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-1366 | Medium | parent /parent/settings @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-1440 | Medium | parent /parent @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1440 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-1440 | Medium | parent /parent/settings @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-1920 | Medium | parent /parent @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1920 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-parent-parent-settings-1920 | Medium | parent /parent/settings @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-320 | Medium | admin /admin @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-320 | Medium | admin /admin/content @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-320 | Medium | admin /admin/economy @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-320 | Medium | admin /admin/events @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-320 | Medium | admin /admin/vocabulary @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-320 | Medium | admin /admin/grades @320px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-375 | Medium | admin /admin @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-375 | Medium | admin /admin/content @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-375 | Medium | admin /admin/economy @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-375 | Medium | admin /admin/events @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-375 | Medium | admin /admin/vocabulary @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-375 | Medium | admin /admin/grades @375px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-430 | Medium | admin /admin @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-430 | Medium | admin /admin/content @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-430 | Medium | admin /admin/economy @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-430 | Medium | admin /admin/events @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-430 | Medium | admin /admin/vocabulary @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-430 | Medium | admin /admin/grades @430px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-768 | Medium | admin /admin @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-768 | Medium | admin /admin/content @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-768 | Medium | admin /admin/economy @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-768 | Medium | admin /admin/events @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-768 | Medium | admin /admin/vocabulary @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-768 | Medium | admin /admin/grades @768px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-1024 | Medium | admin /admin @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-1024 | Medium | admin /admin/content @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-1024 | Medium | admin /admin/economy @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-1024 | Medium | admin /admin/events @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-1024 | Medium | admin /admin/vocabulary @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-1024 | Medium | admin /admin/grades @1024px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-1366 | Medium | admin /admin @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-1366 | Medium | admin /admin/content @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-1366 | Medium | admin /admin/economy @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-1366 | Medium | admin /admin/events @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-1366 | Medium | admin /admin/vocabulary @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-1366 | Medium | admin /admin/grades @1366px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-1440 | Medium | admin /admin @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-1440 | Medium | admin /admin/content @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-1440 | Medium | admin /admin/economy @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-1440 | Medium | admin /admin/events @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-1440 | Medium | admin /admin/vocabulary @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-1440 | Medium | admin /admin/grades @1440px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-1920 | Medium | admin /admin @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-content-1920 | Medium | admin /admin/content @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-economy-1920 | Medium | admin /admin/economy @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-events-1920 | Medium | admin /admin/events @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-vocabulary-1920 | Medium | admin /admin/vocabulary @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |
| RSP-admin-admin-grades-1920 | Medium | admin /admin/grades @1920px: no horizontal overflow, clipped controls or broken images | ✅ PASS | status 200 overflow 0px clipped [] broken [] |

### Accessibility

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| TGT-RSP-public-home-320 | Medium | public / @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-320 | Medium | public /signup @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-320 | Medium | public /login @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-320 | Medium | public /login?as=parent @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-320 | Medium | public /privacy @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-320 | Medium | public /forgot-password @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-320 | Medium | public /verify?expired=1 @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-375 | Medium | public / @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-375 | Medium | public /signup @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-375 | Medium | public /login @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-375 | Medium | public /login?as=parent @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-375 | Medium | public /privacy @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-375 | Medium | public /forgot-password @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-375 | Medium | public /verify?expired=1 @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-430 | Medium | public / @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-430 | Medium | public /signup @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-430 | Medium | public /login @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-430 | Medium | public /login?as=parent @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-430 | Medium | public /privacy @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-430 | Medium | public /forgot-password @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-430 | Medium | public /verify?expired=1 @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-768 | Medium | public / @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-768 | Medium | public /signup @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-768 | Medium | public /login @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-768 | Medium | public /login?as=parent @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-768 | Medium | public /privacy @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-768 | Medium | public /forgot-password @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-768 | Medium | public /verify?expired=1 @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-1024 | Medium | public / @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-1024 | Medium | public /signup @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-1024 | Medium | public /login @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-1024 | Medium | public /login?as=parent @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-1024 | Medium | public /privacy @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-1024 | Medium | public /forgot-password @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-1024 | Medium | public /verify?expired=1 @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-1366 | Medium | public / @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-1366 | Medium | public /signup @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-1366 | Medium | public /login @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-1366 | Medium | public /login?as=parent @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-1366 | Medium | public /privacy @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-1366 | Medium | public /forgot-password @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-1366 | Medium | public /verify?expired=1 @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-1440 | Medium | public / @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-1440 | Medium | public /signup @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-1440 | Medium | public /login @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-1440 | Medium | public /login?as=parent @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-1440 | Medium | public /privacy @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-1440 | Medium | public /forgot-password @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-1440 | Medium | public /verify?expired=1 @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-home-1920 | Medium | public / @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-signup-1920 | Medium | public /signup @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-1920 | Medium | public /login @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-login-as-parent-1920 | Medium | public /login?as=parent @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-privacy-1920 | Medium | public /privacy @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-forgot-password-1920 | Medium | public /forgot-password @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-public-verify-expired-1-1920 | Medium | public /verify?expired=1 @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-320 | Medium | child /world @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-320 | Medium | child /world/quest @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-320 | Medium | child /world/map @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-320 | Medium | child /world/map/vocabulary-forest @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-320 | Medium | child /world/my-world @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-320 | Medium | child /world/missions @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-320 | Medium | child /world/arcade @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-320 | Medium | child /world/arcade/word-hunter @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-320 | Medium | child /world/writing @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-320 | Medium | child /world/grammar @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-320 | Medium | child /world/grammar/nouns @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-320 | Medium | child /world/reading @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-320 | Medium | child /world/reading/the-monsoon-puddle @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-320 | Medium | child /world/speaking @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-320 | Medium | child /world/listening @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-320 | Medium | child /world/rewards @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-320 | Medium | child /world/avatar @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-320 | Medium | child /world/pets @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-320 | Medium | child /world/skills @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-320 | Medium | child /world/calendar @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-320 | Medium | child /world/museum @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-320 | Medium | child /world/collection @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-320 | Medium | child /world/notebook @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-320 | Medium | child /world/companion @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-320 | Medium | child /world/me @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-320 | Medium | child /world/story-builder @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-320 | Medium | child /world/boss/word-thief @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-375 | Medium | child /world @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-375 | Medium | child /world/quest @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-375 | Medium | child /world/map @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-375 | Medium | child /world/map/vocabulary-forest @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-375 | Medium | child /world/my-world @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-375 | Medium | child /world/missions @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-375 | Medium | child /world/arcade @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-375 | Medium | child /world/arcade/word-hunter @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-375 | Medium | child /world/writing @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-375 | Medium | child /world/grammar @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-375 | Medium | child /world/grammar/nouns @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-375 | Medium | child /world/reading @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-375 | Medium | child /world/reading/the-monsoon-puddle @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-375 | Medium | child /world/speaking @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-375 | Medium | child /world/listening @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-375 | Medium | child /world/rewards @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-375 | Medium | child /world/avatar @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-375 | Medium | child /world/pets @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-375 | Medium | child /world/skills @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-375 | Medium | child /world/calendar @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-375 | Medium | child /world/museum @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-375 | Medium | child /world/collection @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-375 | Medium | child /world/notebook @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-375 | Medium | child /world/companion @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-375 | Medium | child /world/me @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-375 | Medium | child /world/story-builder @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-375 | Medium | child /world/boss/word-thief @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-430 | Medium | child /world @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-430 | Medium | child /world/quest @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-430 | Medium | child /world/map @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-430 | Medium | child /world/map/vocabulary-forest @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-430 | Medium | child /world/my-world @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-430 | Medium | child /world/missions @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-430 | Medium | child /world/arcade @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-430 | Medium | child /world/arcade/word-hunter @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-430 | Medium | child /world/writing @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-430 | Medium | child /world/grammar @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-430 | Medium | child /world/grammar/nouns @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-430 | Medium | child /world/reading @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-430 | Medium | child /world/reading/the-monsoon-puddle @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-430 | Medium | child /world/speaking @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-430 | Medium | child /world/listening @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-430 | Medium | child /world/rewards @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-430 | Medium | child /world/avatar @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-430 | Medium | child /world/pets @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-430 | Medium | child /world/skills @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-430 | Medium | child /world/calendar @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-430 | Medium | child /world/museum @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-430 | Medium | child /world/collection @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-430 | Medium | child /world/notebook @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-430 | Medium | child /world/companion @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-430 | Medium | child /world/me @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-430 | Medium | child /world/story-builder @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-430 | Medium | child /world/boss/word-thief @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-768 | Medium | child /world @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-768 | Medium | child /world/quest @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-768 | Medium | child /world/map @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-768 | Medium | child /world/map/vocabulary-forest @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-768 | Medium | child /world/my-world @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-768 | Medium | child /world/missions @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-768 | Medium | child /world/arcade @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-768 | Medium | child /world/arcade/word-hunter @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-768 | Medium | child /world/writing @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-768 | Medium | child /world/grammar @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-768 | Medium | child /world/grammar/nouns @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-768 | Medium | child /world/reading @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-768 | Medium | child /world/reading/the-monsoon-puddle @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-768 | Medium | child /world/speaking @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-768 | Medium | child /world/listening @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-768 | Medium | child /world/rewards @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-768 | Medium | child /world/avatar @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-768 | Medium | child /world/pets @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-768 | Medium | child /world/skills @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-768 | Medium | child /world/calendar @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-768 | Medium | child /world/museum @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-768 | Medium | child /world/collection @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-768 | Medium | child /world/notebook @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-768 | Medium | child /world/companion @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-768 | Medium | child /world/me @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-768 | Medium | child /world/story-builder @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-768 | Medium | child /world/boss/word-thief @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-1024 | Medium | child /world @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-1024 | Medium | child /world/quest @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-1024 | Medium | child /world/map @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-1024 | Medium | child /world/map/vocabulary-forest @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-1024 | Medium | child /world/my-world @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-1024 | Medium | child /world/missions @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-1024 | Medium | child /world/arcade @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-1024 | Medium | child /world/arcade/word-hunter @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-1024 | Medium | child /world/writing @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-1024 | Medium | child /world/grammar @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-1024 | Medium | child /world/grammar/nouns @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-1024 | Medium | child /world/reading @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-1024 | Medium | child /world/reading/the-monsoon-puddle @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-1024 | Medium | child /world/speaking @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-1024 | Medium | child /world/listening @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-1024 | Medium | child /world/rewards @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-1024 | Medium | child /world/avatar @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-1024 | Medium | child /world/pets @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-1024 | Medium | child /world/skills @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-1024 | Medium | child /world/calendar @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-1024 | Medium | child /world/museum @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-1024 | Medium | child /world/collection @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-1024 | Medium | child /world/notebook @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-1024 | Medium | child /world/companion @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-1024 | Medium | child /world/me @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-1024 | Medium | child /world/story-builder @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-1024 | Medium | child /world/boss/word-thief @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-1366 | Medium | child /world @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-1366 | Medium | child /world/quest @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-1366 | Medium | child /world/map @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-1366 | Medium | child /world/map/vocabulary-forest @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-1366 | Medium | child /world/my-world @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-1366 | Medium | child /world/missions @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-1366 | Medium | child /world/arcade @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-1366 | Medium | child /world/arcade/word-hunter @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-1366 | Medium | child /world/writing @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-1366 | Medium | child /world/grammar @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-1366 | Medium | child /world/grammar/nouns @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-1366 | Medium | child /world/reading @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-1366 | Medium | child /world/reading/the-monsoon-puddle @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-1366 | Medium | child /world/speaking @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-1366 | Medium | child /world/listening @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-1366 | Medium | child /world/rewards @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-1366 | Medium | child /world/avatar @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-1366 | Medium | child /world/pets @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-1366 | Medium | child /world/skills @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-1366 | Medium | child /world/calendar @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-1366 | Medium | child /world/museum @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-1366 | Medium | child /world/collection @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-1366 | Medium | child /world/notebook @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-1366 | Medium | child /world/companion @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-1366 | Medium | child /world/me @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-1366 | Medium | child /world/story-builder @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-1366 | Medium | child /world/boss/word-thief @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-1440 | Medium | child /world @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-1440 | Medium | child /world/quest @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-1440 | Medium | child /world/map @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-1440 | Medium | child /world/map/vocabulary-forest @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-1440 | Medium | child /world/my-world @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-1440 | Medium | child /world/missions @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-1440 | Medium | child /world/arcade @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-1440 | Medium | child /world/arcade/word-hunter @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-1440 | Medium | child /world/writing @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-1440 | Medium | child /world/grammar @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-1440 | Medium | child /world/grammar/nouns @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-1440 | Medium | child /world/reading @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-1440 | Medium | child /world/reading/the-monsoon-puddle @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-1440 | Medium | child /world/speaking @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-1440 | Medium | child /world/listening @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-1440 | Medium | child /world/rewards @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-1440 | Medium | child /world/avatar @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-1440 | Medium | child /world/pets @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-1440 | Medium | child /world/skills @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-1440 | Medium | child /world/calendar @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-1440 | Medium | child /world/museum @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-1440 | Medium | child /world/collection @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-1440 | Medium | child /world/notebook @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-1440 | Medium | child /world/companion @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-1440 | Medium | child /world/me @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-1440 | Medium | child /world/story-builder @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-1440 | Medium | child /world/boss/word-thief @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-1920 | Medium | child /world @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-quest-1920 | Medium | child /world/quest @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-1920 | Medium | child /world/map @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-map-vocabulary-forest-1920 | Medium | child /world/map/vocabulary-forest @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-my-world-1920 | Medium | child /world/my-world @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-missions-1920 | Medium | child /world/missions @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-1920 | Medium | child /world/arcade @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-arcade-word-hunter-1920 | Medium | child /world/arcade/word-hunter @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-writing-1920 | Medium | child /world/writing @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-1920 | Medium | child /world/grammar @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-grammar-nouns-1920 | Medium | child /world/grammar/nouns @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-1920 | Medium | child /world/reading @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-reading-the-monsoon-puddle-1920 | Medium | child /world/reading/the-monsoon-puddle @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-speaking-1920 | Medium | child /world/speaking @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-listening-1920 | Medium | child /world/listening @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-rewards-1920 | Medium | child /world/rewards @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-avatar-1920 | Medium | child /world/avatar @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-pets-1920 | Medium | child /world/pets @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-skills-1920 | Medium | child /world/skills @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-calendar-1920 | Medium | child /world/calendar @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-museum-1920 | Medium | child /world/museum @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-collection-1920 | Medium | child /world/collection @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-notebook-1920 | Medium | child /world/notebook @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-companion-1920 | Medium | child /world/companion @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 4 |
| TGT-RSP-child-world-me-1920 | Medium | child /world/me @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-story-builder-1920 | Medium | child /world/story-builder @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-child-world-boss-word-thief-1920 | Medium | child /world/boss/word-thief @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-320 | Medium | parent /parent @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-320 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-320 | Medium | parent /parent/settings @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-375 | Medium | parent /parent @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-375 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-375 | Medium | parent /parent/settings @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-430 | Medium | parent /parent @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-430 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-430 | Medium | parent /parent/settings @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-768 | Medium | parent /parent @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-768 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-768 | Medium | parent /parent/settings @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-1024 | Medium | parent /parent @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1024 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-1024 | Medium | parent /parent/settings @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-1366 | Medium | parent /parent @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1366 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-1366 | Medium | parent /parent/settings @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-1440 | Medium | parent /parent @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1440 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-1440 | Medium | parent /parent/settings @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-1920 | Medium | parent /parent @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1920 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 10 |
| TGT-RSP-parent-parent-settings-1920 | Medium | parent /parent/settings @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-320 | Medium | admin /admin @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-320 | Medium | admin /admin/content @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-320 | Medium | admin /admin/economy @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-320 | Medium | admin /admin/events @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-320 | Medium | admin /admin/vocabulary @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-320 | Medium | admin /admin/grades @320px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-375 | Medium | admin /admin @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-375 | Medium | admin /admin/content @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-375 | Medium | admin /admin/economy @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-375 | Medium | admin /admin/events @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-375 | Medium | admin /admin/vocabulary @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-375 | Medium | admin /admin/grades @375px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-430 | Medium | admin /admin @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-430 | Medium | admin /admin/content @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-430 | Medium | admin /admin/economy @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-430 | Medium | admin /admin/events @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-430 | Medium | admin /admin/vocabulary @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-430 | Medium | admin /admin/grades @430px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-768 | Medium | admin /admin @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-768 | Medium | admin /admin/content @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-768 | Medium | admin /admin/economy @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-768 | Medium | admin /admin/events @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-768 | Medium | admin /admin/vocabulary @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-768 | Medium | admin /admin/grades @768px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-1024 | Medium | admin /admin @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-1024 | Medium | admin /admin/content @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-1024 | Medium | admin /admin/economy @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-1024 | Medium | admin /admin/events @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-1024 | Medium | admin /admin/vocabulary @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-1024 | Medium | admin /admin/grades @1024px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-1366 | Medium | admin /admin @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-1366 | Medium | admin /admin/content @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-1366 | Medium | admin /admin/economy @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-1366 | Medium | admin /admin/events @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-1366 | Medium | admin /admin/vocabulary @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-1366 | Medium | admin /admin/grades @1366px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-1440 | Medium | admin /admin @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-1440 | Medium | admin /admin/content @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-1440 | Medium | admin /admin/economy @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-1440 | Medium | admin /admin/events @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-1440 | Medium | admin /admin/vocabulary @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-1440 | Medium | admin /admin/grades @1440px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-1920 | Medium | admin /admin @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-content-1920 | Medium | admin /admin/content @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-economy-1920 | Medium | admin /admin/economy @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-events-1920 | Medium | admin /admin/events @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-vocabulary-1920 | Medium | admin /admin/vocabulary @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| TGT-RSP-admin-admin-grades-1920 | Medium | admin /admin/grades @1920px: interactive targets ≥ 24×24px (WCAG 2.5.8) | ✅ PASS | under 24px: []; under 32px tall: 0 |
| A11Y-public-- | Medium | public /: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public-- | Medium | public /: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public--signup | Medium | public /signup: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public--signup | Medium | public /signup: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public--login | Medium | public /login: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public--login | Medium | public /login: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public--login-as-parent | Medium | public /login?as=parent: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public--login-as-parent | Medium | public /login?as=parent: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public--privacy | Medium | public /privacy: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public--privacy | Medium | public /privacy: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public--forgot-password | Medium | public /forgot-password: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public--forgot-password | Medium | public /forgot-password: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public--verify-expired-1 | Medium | public /verify?expired=1: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-public--verify-expired-1 | Medium | public /verify?expired=1: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-public-reduced-motion | Medium | public: prefers-reduced-motion disables CSS animation | ✅ PASS | 1e-06s |
| A11Y-child--world | Medium | child /world: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world | Medium | child /world: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-quest | Medium | child /world/quest: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-quest | Medium | child /world/quest: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-map | Medium | child /world/map: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-map | Medium | child /world/map: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-map-vocabulary-forest | Medium | child /world/map/vocabulary-forest: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-map-vocabulary-forest | Medium | child /world/map/vocabulary-forest: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-my-world | Medium | child /world/my-world: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-my-world | Medium | child /world/my-world: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-missions | Medium | child /world/missions: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-missions | Medium | child /world/missions: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-arcade | Medium | child /world/arcade: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-arcade | Medium | child /world/arcade: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-arcade-word-hunter | Medium | child /world/arcade/word-hunter: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-arcade-word-hunter | Medium | child /world/arcade/word-hunter: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-writing | Medium | child /world/writing: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-writing | Medium | child /world/writing: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-grammar | Medium | child /world/grammar: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-grammar | Medium | child /world/grammar: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-grammar-nouns | Medium | child /world/grammar/nouns: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-grammar-nouns | Medium | child /world/grammar/nouns: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-reading | Medium | child /world/reading: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-reading | Medium | child /world/reading: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-reading-the-monsoon-puddle | Medium | child /world/reading/the-monsoon-puddle: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-reading-the-monsoon-puddle | Medium | child /world/reading/the-monsoon-puddle: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-speaking | Medium | child /world/speaking: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-speaking | Medium | child /world/speaking: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-listening | Medium | child /world/listening: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-listening | Medium | child /world/listening: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-rewards | Medium | child /world/rewards: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-rewards | Medium | child /world/rewards: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-avatar | Medium | child /world/avatar: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-avatar | Medium | child /world/avatar: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-pets | Medium | child /world/pets: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-pets | Medium | child /world/pets: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-skills | Medium | child /world/skills: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-skills | Medium | child /world/skills: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-calendar | Medium | child /world/calendar: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-calendar | Medium | child /world/calendar: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-museum | Medium | child /world/museum: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-museum | Medium | child /world/museum: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-collection | Medium | child /world/collection: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-collection | Medium | child /world/collection: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-notebook | Medium | child /world/notebook: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-notebook | Medium | child /world/notebook: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-companion | Medium | child /world/companion: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-companion | Medium | child /world/companion: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-me | Medium | child /world/me: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-me | Medium | child /world/me: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-story-builder | Medium | child /world/story-builder: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-story-builder | Medium | child /world/story-builder: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-boss-word-thief | Medium | child /world/boss/word-thief: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-boss-word-thief | Medium | child /world/boss/word-thief: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-arcade-word-match | Medium | child /world/arcade/word-match: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-arcade-word-match | Medium | child /world/arcade/word-match: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child--world-listening | Medium | child /world/listening: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-child--world-listening | Medium | child /world/listening: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-child-reduced-motion | Medium | child: prefers-reduced-motion disables CSS animation | ✅ PASS | 1e-06s |
| A11Y-parent--parent | Medium | parent /parent: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-parent--parent | Medium | parent /parent: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-parent--parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-parent--parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-parent--parent-settings | Medium | parent /parent/settings: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-parent--parent-settings | Medium | parent /parent/settings: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-parent-reduced-motion | Medium | parent: prefers-reduced-motion disables CSS animation | ✅ PASS | 1e-06s |
| A11Y-admin--admin | Medium | admin /admin: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-admin--admin | Medium | admin /admin: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-admin--admin-content | Medium | admin /admin/content: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-admin--admin-content | Medium | admin /admin/content: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-admin--admin-economy | Medium | admin /admin/economy: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-admin--admin-economy | Medium | admin /admin/economy: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-admin--admin-events | Medium | admin /admin/events: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-admin--admin-events | Medium | admin /admin/events: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-admin--admin-vocabulary | Medium | admin /admin/vocabulary: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-admin--admin-vocabulary | Medium | admin /admin/vocabulary: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-admin--admin-grades | Medium | admin /admin/grades: no critical/serious axe violations (WCAG 2.2 AA) | ✅ PASS |  |
| KBD-admin--admin-grades | Medium | admin /admin/grades: first Tab reaches skip link | ✅ PASS | Skip to content |
| A11Y-admin-reduced-motion | Medium | admin: prefers-reduced-motion disables CSS animation | ✅ PASS | 1e-06s |

### Console

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| CON-RSP-public-home-320 | Medium | public / @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-320 | Medium | public /signup @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-320 | Medium | public /login @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-320 | Medium | public /login?as=parent @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-320 | Medium | public /privacy @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-320 | Medium | public /forgot-password @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-320 | Medium | public /verify?expired=1 @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-375 | Medium | public / @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-375 | Medium | public /signup @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-375 | Medium | public /login @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-375 | Medium | public /login?as=parent @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-375 | Medium | public /privacy @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-375 | Medium | public /forgot-password @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-375 | Medium | public /verify?expired=1 @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-430 | Medium | public / @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-430 | Medium | public /signup @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-430 | Medium | public /login @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-430 | Medium | public /login?as=parent @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-430 | Medium | public /privacy @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-430 | Medium | public /forgot-password @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-430 | Medium | public /verify?expired=1 @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-768 | Medium | public / @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-768 | Medium | public /signup @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-768 | Medium | public /login @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-768 | Medium | public /login?as=parent @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-768 | Medium | public /privacy @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-768 | Medium | public /forgot-password @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-768 | Medium | public /verify?expired=1 @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-1024 | Medium | public / @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-1024 | Medium | public /signup @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-1024 | Medium | public /login @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-1024 | Medium | public /login?as=parent @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-1024 | Medium | public /privacy @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-1024 | Medium | public /forgot-password @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-1024 | Medium | public /verify?expired=1 @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-1366 | Medium | public / @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-1366 | Medium | public /signup @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-1366 | Medium | public /login @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-1366 | Medium | public /login?as=parent @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-1366 | Medium | public /privacy @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-1366 | Medium | public /forgot-password @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-1366 | Medium | public /verify?expired=1 @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-1440 | Medium | public / @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-1440 | Medium | public /signup @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-1440 | Medium | public /login @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-1440 | Medium | public /login?as=parent @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-1440 | Medium | public /privacy @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-1440 | Medium | public /forgot-password @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-1440 | Medium | public /verify?expired=1 @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-home-1920 | Medium | public / @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-signup-1920 | Medium | public /signup @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-1920 | Medium | public /login @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-login-as-parent-1920 | Medium | public /login?as=parent @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-privacy-1920 | Medium | public /privacy @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-forgot-password-1920 | Medium | public /forgot-password @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-public-verify-expired-1-1920 | Medium | public /verify?expired=1 @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-320 | Medium | child /world @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-320 | Medium | child /world/quest @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-320 | Medium | child /world/map @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-320 | Medium | child /world/map/vocabulary-forest @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-320 | Medium | child /world/my-world @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-320 | Medium | child /world/missions @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-320 | Medium | child /world/arcade @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-320 | Medium | child /world/arcade/word-hunter @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-320 | Medium | child /world/writing @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-320 | Medium | child /world/grammar @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-320 | Medium | child /world/grammar/nouns @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-320 | Medium | child /world/reading @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-320 | Medium | child /world/reading/the-monsoon-puddle @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-320 | Medium | child /world/speaking @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-320 | Medium | child /world/listening @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-320 | Medium | child /world/rewards @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-320 | Medium | child /world/avatar @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-320 | Medium | child /world/pets @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-320 | Medium | child /world/skills @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-320 | Medium | child /world/calendar @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-320 | Medium | child /world/museum @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-320 | Medium | child /world/collection @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-320 | Medium | child /world/notebook @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-320 | Medium | child /world/companion @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-320 | Medium | child /world/me @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-320 | Medium | child /world/story-builder @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-320 | Medium | child /world/boss/word-thief @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-375 | Medium | child /world @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-375 | Medium | child /world/quest @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-375 | Medium | child /world/map @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-375 | Medium | child /world/map/vocabulary-forest @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-375 | Medium | child /world/my-world @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-375 | Medium | child /world/missions @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-375 | Medium | child /world/arcade @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-375 | Medium | child /world/arcade/word-hunter @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-375 | Medium | child /world/writing @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-375 | Medium | child /world/grammar @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-375 | Medium | child /world/grammar/nouns @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-375 | Medium | child /world/reading @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-375 | Medium | child /world/reading/the-monsoon-puddle @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-375 | Medium | child /world/speaking @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-375 | Medium | child /world/listening @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-375 | Medium | child /world/rewards @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-375 | Medium | child /world/avatar @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-375 | Medium | child /world/pets @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-375 | Medium | child /world/skills @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-375 | Medium | child /world/calendar @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-375 | Medium | child /world/museum @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-375 | Medium | child /world/collection @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-375 | Medium | child /world/notebook @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-375 | Medium | child /world/companion @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-375 | Medium | child /world/me @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-375 | Medium | child /world/story-builder @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-375 | Medium | child /world/boss/word-thief @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-430 | Medium | child /world @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-430 | Medium | child /world/quest @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-430 | Medium | child /world/map @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-430 | Medium | child /world/map/vocabulary-forest @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-430 | Medium | child /world/my-world @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-430 | Medium | child /world/missions @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-430 | Medium | child /world/arcade @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-430 | Medium | child /world/arcade/word-hunter @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-430 | Medium | child /world/writing @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-430 | Medium | child /world/grammar @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-430 | Medium | child /world/grammar/nouns @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-430 | Medium | child /world/reading @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-430 | Medium | child /world/reading/the-monsoon-puddle @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-430 | Medium | child /world/speaking @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-430 | Medium | child /world/listening @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-430 | Medium | child /world/rewards @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-430 | Medium | child /world/avatar @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-430 | Medium | child /world/pets @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-430 | Medium | child /world/skills @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-430 | Medium | child /world/calendar @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-430 | Medium | child /world/museum @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-430 | Medium | child /world/collection @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-430 | Medium | child /world/notebook @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-430 | Medium | child /world/companion @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-430 | Medium | child /world/me @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-430 | Medium | child /world/story-builder @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-430 | Medium | child /world/boss/word-thief @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-768 | Medium | child /world @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-768 | Medium | child /world/quest @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-768 | Medium | child /world/map @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-768 | Medium | child /world/map/vocabulary-forest @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-768 | Medium | child /world/my-world @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-768 | Medium | child /world/missions @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-768 | Medium | child /world/arcade @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-768 | Medium | child /world/arcade/word-hunter @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-768 | Medium | child /world/writing @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-768 | Medium | child /world/grammar @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-768 | Medium | child /world/grammar/nouns @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-768 | Medium | child /world/reading @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-768 | Medium | child /world/reading/the-monsoon-puddle @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-768 | Medium | child /world/speaking @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-768 | Medium | child /world/listening @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-768 | Medium | child /world/rewards @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-768 | Medium | child /world/avatar @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-768 | Medium | child /world/pets @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-768 | Medium | child /world/skills @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-768 | Medium | child /world/calendar @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-768 | Medium | child /world/museum @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-768 | Medium | child /world/collection @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-768 | Medium | child /world/notebook @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-768 | Medium | child /world/companion @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-768 | Medium | child /world/me @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-768 | Medium | child /world/story-builder @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-768 | Medium | child /world/boss/word-thief @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-1024 | Medium | child /world @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-1024 | Medium | child /world/quest @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-1024 | Medium | child /world/map @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-1024 | Medium | child /world/map/vocabulary-forest @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-1024 | Medium | child /world/my-world @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-1024 | Medium | child /world/missions @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-1024 | Medium | child /world/arcade @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-1024 | Medium | child /world/arcade/word-hunter @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-1024 | Medium | child /world/writing @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-1024 | Medium | child /world/grammar @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-1024 | Medium | child /world/grammar/nouns @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-1024 | Medium | child /world/reading @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-1024 | Medium | child /world/reading/the-monsoon-puddle @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-1024 | Medium | child /world/speaking @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-1024 | Medium | child /world/listening @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-1024 | Medium | child /world/rewards @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-1024 | Medium | child /world/avatar @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-1024 | Medium | child /world/pets @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-1024 | Medium | child /world/skills @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-1024 | Medium | child /world/calendar @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-1024 | Medium | child /world/museum @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-1024 | Medium | child /world/collection @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-1024 | Medium | child /world/notebook @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-1024 | Medium | child /world/companion @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-1024 | Medium | child /world/me @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-1024 | Medium | child /world/story-builder @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-1024 | Medium | child /world/boss/word-thief @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-1366 | Medium | child /world @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-1366 | Medium | child /world/quest @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-1366 | Medium | child /world/map @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-1366 | Medium | child /world/map/vocabulary-forest @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-1366 | Medium | child /world/my-world @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-1366 | Medium | child /world/missions @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-1366 | Medium | child /world/arcade @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-1366 | Medium | child /world/arcade/word-hunter @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-1366 | Medium | child /world/writing @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-1366 | Medium | child /world/grammar @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-1366 | Medium | child /world/grammar/nouns @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-1366 | Medium | child /world/reading @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-1366 | Medium | child /world/reading/the-monsoon-puddle @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-1366 | Medium | child /world/speaking @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-1366 | Medium | child /world/listening @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-1366 | Medium | child /world/rewards @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-1366 | Medium | child /world/avatar @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-1366 | Medium | child /world/pets @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-1366 | Medium | child /world/skills @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-1366 | Medium | child /world/calendar @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-1366 | Medium | child /world/museum @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-1366 | Medium | child /world/collection @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-1366 | Medium | child /world/notebook @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-1366 | Medium | child /world/companion @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-1366 | Medium | child /world/me @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-1366 | Medium | child /world/story-builder @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-1366 | Medium | child /world/boss/word-thief @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-1440 | Medium | child /world @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-1440 | Medium | child /world/quest @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-1440 | Medium | child /world/map @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-1440 | Medium | child /world/map/vocabulary-forest @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-1440 | Medium | child /world/my-world @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-1440 | Medium | child /world/missions @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-1440 | Medium | child /world/arcade @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-1440 | Medium | child /world/arcade/word-hunter @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-1440 | Medium | child /world/writing @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-1440 | Medium | child /world/grammar @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-1440 | Medium | child /world/grammar/nouns @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-1440 | Medium | child /world/reading @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-1440 | Medium | child /world/reading/the-monsoon-puddle @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-1440 | Medium | child /world/speaking @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-1440 | Medium | child /world/listening @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-1440 | Medium | child /world/rewards @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-1440 | Medium | child /world/avatar @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-1440 | Medium | child /world/pets @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-1440 | Medium | child /world/skills @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-1440 | Medium | child /world/calendar @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-1440 | Medium | child /world/museum @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-1440 | Medium | child /world/collection @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-1440 | Medium | child /world/notebook @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-1440 | Medium | child /world/companion @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-1440 | Medium | child /world/me @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-1440 | Medium | child /world/story-builder @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-1440 | Medium | child /world/boss/word-thief @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-1920 | Medium | child /world @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-quest-1920 | Medium | child /world/quest @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-1920 | Medium | child /world/map @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-map-vocabulary-forest-1920 | Medium | child /world/map/vocabulary-forest @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-my-world-1920 | Medium | child /world/my-world @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-missions-1920 | Medium | child /world/missions @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-1920 | Medium | child /world/arcade @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-arcade-word-hunter-1920 | Medium | child /world/arcade/word-hunter @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-writing-1920 | Medium | child /world/writing @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-1920 | Medium | child /world/grammar @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-grammar-nouns-1920 | Medium | child /world/grammar/nouns @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-1920 | Medium | child /world/reading @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-reading-the-monsoon-puddle-1920 | Medium | child /world/reading/the-monsoon-puddle @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-speaking-1920 | Medium | child /world/speaking @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-listening-1920 | Medium | child /world/listening @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-rewards-1920 | Medium | child /world/rewards @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-avatar-1920 | Medium | child /world/avatar @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-pets-1920 | Medium | child /world/pets @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-skills-1920 | Medium | child /world/skills @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-calendar-1920 | Medium | child /world/calendar @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-museum-1920 | Medium | child /world/museum @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-collection-1920 | Medium | child /world/collection @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-notebook-1920 | Medium | child /world/notebook @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-companion-1920 | Medium | child /world/companion @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-me-1920 | Medium | child /world/me @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-story-builder-1920 | Medium | child /world/story-builder @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-child-world-boss-word-thief-1920 | Medium | child /world/boss/word-thief @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-320 | Medium | parent /parent @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-320 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-320 | Medium | parent /parent/settings @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-375 | Medium | parent /parent @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-375 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-375 | Medium | parent /parent/settings @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-430 | Medium | parent /parent @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-430 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-430 | Medium | parent /parent/settings @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-768 | Medium | parent /parent @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-768 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-768 | Medium | parent /parent/settings @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-1024 | Medium | parent /parent @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1024 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-1024 | Medium | parent /parent/settings @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-1366 | Medium | parent /parent @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1366 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-1366 | Medium | parent /parent/settings @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-1440 | Medium | parent /parent @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1440 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-1440 | Medium | parent /parent/settings @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-1920 | Medium | parent /parent @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-child-b925d79a-3114-4d96-9ced-d088b0b0310c-1920 | Medium | parent /parent/child/b925d79a-3114-4d96-9ced-d088b0b0310c @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-parent-parent-settings-1920 | Medium | parent /parent/settings @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-320 | Medium | admin /admin @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-320 | Medium | admin /admin/content @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-320 | Medium | admin /admin/economy @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-320 | Medium | admin /admin/events @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-320 | Medium | admin /admin/vocabulary @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-320 | Medium | admin /admin/grades @320px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-375 | Medium | admin /admin @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-375 | Medium | admin /admin/content @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-375 | Medium | admin /admin/economy @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-375 | Medium | admin /admin/events @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-375 | Medium | admin /admin/vocabulary @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-375 | Medium | admin /admin/grades @375px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-430 | Medium | admin /admin @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-430 | Medium | admin /admin/content @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-430 | Medium | admin /admin/economy @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-430 | Medium | admin /admin/events @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-430 | Medium | admin /admin/vocabulary @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-430 | Medium | admin /admin/grades @430px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-768 | Medium | admin /admin @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-768 | Medium | admin /admin/content @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-768 | Medium | admin /admin/economy @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-768 | Medium | admin /admin/events @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-768 | Medium | admin /admin/vocabulary @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-768 | Medium | admin /admin/grades @768px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-1024 | Medium | admin /admin @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-1024 | Medium | admin /admin/content @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-1024 | Medium | admin /admin/economy @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-1024 | Medium | admin /admin/events @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-1024 | Medium | admin /admin/vocabulary @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-1024 | Medium | admin /admin/grades @1024px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-1366 | Medium | admin /admin @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-1366 | Medium | admin /admin/content @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-1366 | Medium | admin /admin/economy @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-1366 | Medium | admin /admin/events @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-1366 | Medium | admin /admin/vocabulary @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-1366 | Medium | admin /admin/grades @1366px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-1440 | Medium | admin /admin @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-1440 | Medium | admin /admin/content @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-1440 | Medium | admin /admin/economy @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-1440 | Medium | admin /admin/events @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-1440 | Medium | admin /admin/vocabulary @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-1440 | Medium | admin /admin/grades @1440px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-1920 | Medium | admin /admin @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-content-1920 | Medium | admin /admin/content @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-economy-1920 | Medium | admin /admin/economy @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-events-1920 | Medium | admin /admin/events @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-vocabulary-1920 | Medium | admin /admin/vocabulary @1920px: no console/network errors | ✅ PASS |  |
| CON-RSP-admin-admin-grades-1920 | Medium | admin /admin/grades @1920px: no console/network errors | ✅ PASS |  |

### Visual regression

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| VIS-RSP-public-home-375 | Low | public / @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-signup-375 | Low | public /signup @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-login-375 | Low | public /login @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-login-as-parent-375 | Low | public /login?as=parent @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.04% changed |
| VIS-RSP-public-privacy-375 | Low | public /privacy @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-forgot-password-375 | Low | public /forgot-password @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.04% changed |
| VIS-RSP-public-verify-expired-1-375 | Low | public /verify?expired=1 @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.05% changed |
| VIS-RSP-public-home-768 | Low | public / @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-signup-768 | Low | public /signup @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-login-768 | Low | public /login @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-login-as-parent-768 | Low | public /login?as=parent @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-privacy-768 | Low | public /privacy @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-forgot-password-768 | Low | public /forgot-password @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-verify-expired-1-768 | Low | public /verify?expired=1 @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-home-1440 | Low | public / @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-signup-1440 | Low | public /signup @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.03% changed |
| VIS-RSP-public-login-1440 | Low | public /login @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.02% changed |
| VIS-RSP-public-login-as-parent-1440 | Low | public /login?as=parent @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-privacy-1440 | Low | public /privacy @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-forgot-password-1440 | Low | public /forgot-password @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-public-verify-expired-1-1440 | Low | public /verify?expired=1 @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.01% changed |
| VIS-RSP-child-world-arcade-375 | Low | child /world/arcade @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-grammar-375 | Low | child /world/grammar @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-reading-375 | Low | child /world/reading @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-speaking-375 | Low | child /world/speaking @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-listening-375 | Low | child /world/listening @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-rewards-375 | Low | child /world/rewards @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-pets-375 | Low | child /world/pets @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-skills-375 | Low | child /world/skills @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-collection-375 | Low | child /world/collection @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-companion-375 | Low | child /world/companion @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-arcade-768 | Low | child /world/arcade @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-grammar-768 | Low | child /world/grammar @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-reading-768 | Low | child /world/reading @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-speaking-768 | Low | child /world/speaking @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-listening-768 | Low | child /world/listening @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-rewards-768 | Low | child /world/rewards @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-pets-768 | Low | child /world/pets @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-skills-768 | Low | child /world/skills @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-collection-768 | Low | child /world/collection @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-companion-768 | Low | child /world/companion @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-arcade-1440 | Low | child /world/arcade @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-grammar-1440 | Low | child /world/grammar @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-reading-1440 | Low | child /world/reading @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-speaking-1440 | Low | child /world/speaking @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-listening-1440 | Low | child /world/listening @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-rewards-1440 | Low | child /world/rewards @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-pets-1440 | Low | child /world/pets @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-skills-1440 | Low | child /world/skills @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-collection-1440 | Low | child /world/collection @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-child-world-companion-1440 | Low | child /world/companion @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-parent-parent-375 | Low | parent /parent @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.59% changed |
| VIS-RSP-parent-parent-settings-375 | Low | parent /parent/settings @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.32% changed |
| VIS-RSP-parent-parent-768 | Low | parent /parent @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.24% changed |
| VIS-RSP-parent-parent-settings-768 | Low | parent /parent/settings @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.12% changed |
| VIS-RSP-parent-parent-1440 | Low | parent /parent @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.14% changed |
| VIS-RSP-parent-parent-settings-1440 | Low | parent /parent/settings @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.07% changed |
| VIS-RSP-admin-admin-economy-375 | Low | admin /admin/economy @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-events-375 | Low | admin /admin/events @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-vocabulary-375 | Low | admin /admin/vocabulary @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-grades-375 | Low | admin /admin/grades @375px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-economy-768 | Low | admin /admin/economy @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-events-768 | Low | admin /admin/events @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-vocabulary-768 | Low | admin /admin/vocabulary @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-grades-768 | Low | admin /admin/grades @768px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-economy-1440 | Low | admin /admin/economy @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-events-1440 | Low | admin /admin/events @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-vocabulary-1440 | Low | admin /admin/vocabulary @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |
| VIS-RSP-admin-admin-grades-1440 | Low | admin /admin/grades @1440px matches baseline (<3% pixels changed) | ✅ PASS | 0.00% changed |

## Performance & load

_Run against http://localhost:3000 at 2026-10-31T05:52:12.894Z._

### Performance

| ID | Severity | Scenario | Status | Actual / notes |
|---|---|---|---|---|
| PERF-home | Medium | /: LCP < 2.5s, TTFB < 800ms, CLS < 0.1 (warm) | ✅ PASS | cold TTFB 8ms LCP 300ms \| warm TTFB 5ms DCL 37ms LCP 216ms CLS 0.000 transfer 455KB |
| PERF-login | Medium | /login: LCP < 2.5s, TTFB < 800ms, CLS < 0.1 (warm) | ✅ PASS | cold TTFB 12ms LCP 140ms \| warm TTFB 12ms DCL 33ms LCP 96ms CLS 0.000 transfer 460KB |
| PERF-child-dashboard | Medium | /world: LCP < 2.5s, TTFB < 800ms, CLS < 0.1 (warm) | ✅ PASS | cold TTFB 138ms LCP 316ms \| warm TTFB 87ms DCL 117ms LCP 236ms CLS 0.000 transfer 270KB |
| PERF-quest | Medium | /world/quest: LCP < 2.5s, TTFB < 800ms, CLS < 0.1 (warm) | ✅ PASS | cold TTFB 28ms LCP 244ms \| warm TTFB 24ms DCL 45ms LCP 160ms CLS 0.000 transfer 263KB |
| PERF-parent-dashboard | Medium | /parent: LCP < 2.5s, TTFB < 800ms, CLS < 0.1 (warm) | ✅ PASS | cold TTFB 23ms LCP 128ms \| warm TTFB 22ms DCL 49ms LCP 76ms CLS 0.000 transfer 450KB |
| LOAD-001 | Medium | 30 concurrent children (660 requests): no 5xx | ✅ PASS | 0 errors in 15.9s (41.6 req/s) |
| LOAD-002 | Medium | 30 concurrent children: API p95 < 1500ms | ❌ FAIL | p50 389ms p95 1943ms max 10451ms |
| LOAD-003 | Medium | Each child received exactly one quest XP award under triple concurrent completion | ✅ PASS | [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] |
