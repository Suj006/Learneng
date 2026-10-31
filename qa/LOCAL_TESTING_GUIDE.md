# PING VIBE — Testing on your own machine

This guide covers the checks that could not run in the QA container. They need a real phone, a screen reader, a real e-mail inbox, a hosted database or a person's judgement. Each section says what to do, what "pass" looks like, and where to record the result.

Everything here uses **synthetic test accounts only**. Never use a real child's details.

## 0. One-time setup

Requirements: Node.js 20+, Git, and (for §2) PostgreSQL 16 or a Supabase project.

```bash
git clone https://github.com/Suj006/Learneng.git
```

```bash
cd Learneng
```

```bash
git checkout claude/ping-vibe-product-design-16wth5
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Value for local testing |
|---|---|
| `PINGVIBE_ANTHROPIC_API_KEY` | Your Anthropic key (keep the account in credit; see §1) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@pingvibe.local` / `ChangeMe!2026` (the API suite logs in with these) |
| `DATABASE_URL` | Empty for the embedded DB, or a Postgres URL (§2) |
| `RESEND_API_KEY` | Empty, except for §4 |

**Production build** (use this for every test below, not `npm run dev`):

```bash
NEXT_DIST_DIR=.next-prod npx next build
```

```bash
EMAIL_TRANSPORT=dev-mailbox IP_RATE_LIMIT_MULTIPLIER=100 NEXT_DIST_DIR=.next-prod npx next start -p 3000
```

- `EMAIL_TRANSPORT=dev-mailbox` keeps verification e-mails at http://localhost:3000/dev/mailbox. It is for testing only; never set it on the live site.
- `IP_RATE_LIMIT_MULTIPLIER=100` lets the test suites create many families from one computer. Leave it off for manual testing.
- To start again from an empty database, stop the server and delete `.data/` (embedded DB) or drop and recreate the Postgres database.

## 1. Automated suites, including live Claude (about 5 minutes)

With the server from §0 running, in a second terminal:

```bash
QA_PRODUCTION=1 BASE_URL=http://localhost:3000 node tests/qa-api.mjs
```

**Pass:** `TOTAL 217 · PASS 216 · FAIL 0 · BLOCKED 1`. The one BLOCKED is ADM-014, which tests the *no-key* path. To cover it, restart the server without the key and run the suite again.

Writing feedback for every grade (Pre-KG to Grade 7):

```bash
BASE_URL=http://localhost:3000 node tests/ai-writing-grades.mjs
```

**Pass:** `Claude evaluated 10/10 grades`. If you see `evaluator=offline`, look in the server terminal for `[ai] writing evaluation failed`. On 31 Oct the cause was "credit balance is too low", which is fixed under Plans & Billing in the Anthropic Console. Set a usage alert there, because when credit runs out, children quietly get offline feedback instead.

Browser checks (journey, 8 viewports, accessibility, visual regression):

```bash
node tests/ui-audit.mjs
```

## 2. Load test on real Postgres / hosted Supabase (OPEN-001 follow-up)

### 2a. Local PostgreSQL 16

macOS with Homebrew:

```bash
brew install postgresql@16
```

```bash
brew services start postgresql@16
```

```bash
createdb pingvibe
```

On Ubuntu, install with `sudo apt install postgresql-16` and create the database with `sudo -u postgres createdb pingvibe`.

Start the production build against it (the schema and seed load automatically on first request):

```bash
DATABASE_URL=postgres://localhost:5432/pingvibe ADMIN_EMAIL=admin@pingvibe.local 'ADMIN_PASSWORD=ChangeMe!2026' EMAIL_TRANSPORT=dev-mailbox IP_RATE_LIMIT_MULTIPLIER=100 NEXT_DIST_DIR=.next-prod npx next start -p 3000
```

On Ubuntu, add the user to the URL, for example `postgres://postgres@127.0.0.1:5432/pingvibe`.

Then:

```bash
BASE_URL=http://localhost:3000 node tests/perf.mjs
```

```bash
BASE_URL=http://localhost:3000 LOAD_CHILDREN=100 node tests/perf.mjs
```

**Pass (30 children):** LOAD-001, LOAD-002 and LOAD-003 all PASS. The QA container measured p95 728–762 ms. With 100 children it measured p95 2.1–2.9 s with 0 errors; that run is limited by a single Node process, so compare against your own machine's figures rather than the 1.5 s budget.

### 2b. Hosted Supabase (the real target)

1. Create a Supabase project in the region nearest your users (for example Mumbai, `ap-south-1`).
2. In **SQL Editor**, run `db/schema.sql`, then `db/supabase-rls.sql`.
3. Copy the **Session pooler** connection string (Project Settings → Database) into `DATABASE_URL`.
4. Start the production build as in 2a with that `DATABASE_URL`, then run `tests/qa-api.mjs` and both `tests/perf.mjs` commands.
5. Better still, deploy to a Vercel staging project (README → *Deployment*) and point the suites at it with `BASE_URL=https://<staging-url>`. That measures real network latency and Vercel's scale-out.

**Pass:** qa-api as in §1; LOAD-002 p95 < 1.5 s with 30 children. Record both numbers in `qa/PERFORMANCE_TEST_REPORT.md`.

## 3. Real phones, tablets and screen readers

### Open the app on a phone

1. Put the phone and computer on the same Wi-Fi.
2. Start the server so other devices can reach it:

```bash
EMAIL_TRANSPORT=dev-mailbox NEXT_DIST_DIR=.next-prod npx next start -p 3000 -H 0.0.0.0
```

3. Find the computer's local IP address. On macOS run `ipconfig getifaddr en0`; on Windows run `ipconfig` and read "IPv4 Address".
4. On the phone, open `http://<that-ip>:3000`.

Some features (microphone for Speaking, "Add to Home screen") need HTTPS. For those, use the Vercel staging URL from §2b.

### Device checklist (do this on each device)

Devices: iPhone (Safari), a low-end Android phone (Chrome), an iPad, a Chromebook.

| # | Check | Pass when |
|---|---|---|
| 1 | Register a parent, read the mail at `/dev/mailbox` (on the computer), give consent, log in as the child with the PIN | Every step works with touch only; the keyboard never hides the input being typed in |
| 2 | Welcome, then 10 words in Word Quest | Buttons are easy to tap; nothing overlaps; no sideways scrolling |
| 3 | Write and submit a short piece in Creative Writing | Feedback shows a score and "GRAMMY" corrections |
| 4 | Speaking: say one line | The microphone permission prompt appears (HTTPS only); if speech recognition is not supported, the listen-and-repeat fallback appears |
| 5 | Listening Lab: play audio | Audio plays from the speaker and is not blocked |
| 6 | Rotate the device | The layout adapts without cutting off content |
| 7 | Parent dashboard on the phone | Charts and tables fit or scroll inside their box |

### Screen readers

| Platform | Turn it on |
|---|---|
| macOS: VoiceOver + Safari | Press Cmd+F5 |
| iPhone/iPad: VoiceOver | Settings → Accessibility → VoiceOver |
| Android: TalkBack + Chrome | Settings → Accessibility → TalkBack |
| Windows: NVDA + Chrome or Firefox | Free download from nvaccess.org |

Walk through checklist rows 1–3 with the screen reader only. **Pass when:**
- Every button and link is announced with a meaningful name, not "button" or "image".
- Headings let you jump between sections.
- Quiz answers are announced, and right or wrong feedback is spoken.
- Form errors are announced when they appear.
- You never get stuck or lose your place.

Record each device and screen-reader result in `qa/RESPONSIVE_TEST_REPORT.md` and `qa/ACCESSIBILITY_TEST_REPORT.md`, listing the device, OS version and browser.

## 4. Live e-mail delivery (Resend)

1. Create a Resend account, then verify a sending domain under **Domains** (add the DNS records it shows).
2. Create an API key. In `.env.local` set `RESEND_API_KEY=<key>` and `EMAIL_FROM="PING VIBE <hello@your-verified-domain>"`. Set `APP_URL` to the address you open the app on.
3. Start the production build **without** `EMAIL_TRANSPORT=dev-mailbox`.
4. Register parents with real test inboxes you own: one Gmail, one Outlook/Hotmail, and optionally a school or work address.

**Pass when:**
- The verification mail arrives within 1 minute, in the **inbox** rather than spam.
- The logo and button display correctly.
- The link opens the app and verifies the account.
- "Forgot password" mail works the same way.
- In Gmail, "Show original" shows SPF, DKIM and DMARC all as PASS.

## 5. Penetration test

A real pen test should be done by an independent firm. Give them a staging URL (§2b), synthetic accounts for each role (parent, child, admin), and `qa/SECURITY_AUDIT_REPORT.md` so they know which controls already exist.

Before that, you can run a free baseline scan yourself with OWASP ZAP (needs Docker) against the staging URL:

```bash
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://<staging-url>
```

**Pass:** no High alerts. Review the Medium alerts and record them in `qa/SECURITY_AUDIT_REPORT.md`. Only scan sites you own.

## 6. Teacher review of AI feedback and content

1. With the production build and a working key (§1), run `tests/ai-writing-grades.mjs` two or three times. The output is in `qa/results/ai-writing-grades.json`.
2. Better still, have the teacher log in as test children of different grades and submit their own sample writing.
3. For each grade, the teacher rates about 20 evaluations on:
   - Are the corrections right?
   - Is the "why" understandable for that age?
   - Is the tone kind?
   - Does the improved sample keep the child's ideas and kind of writing?
   - Is the score fair for the grade?
4. Also review a sample of daily word lists and reading stories for each grade (`/admin/vocabulary`, `/world/reading`).

**Pass:** no factually wrong correction and no unkind wording. Note anything else for prompt or content tuning in `qa/LEARNING_MODULE_TEST_REPORT.md`.

## 7. Usability with children

Run short sessions (15–20 minutes) with 3–5 children per age band (5–7, 8–10, 11–13). Get a parent's written consent, use test accounts, and have the parent present. Observe without helping, and note:
- where they hesitate
- what they tap that isn't a button
- whether they understand rewards
- whether they want to continue

Record the findings, not the children's names, in `qa/UI_UX_AUDIT_REPORT.md`.

## Where results go

After adding results, regenerate the totals:

```bash
node scripts/qa-report.mjs
```

Then update `qa/PRODUCTION_READINESS_REPORT.md` and the sign-off table.
