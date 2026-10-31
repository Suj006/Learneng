# PING VIBE

**Your World. Your Words. Your Vibe.**

PING VIBE is a gamified English-learning universe for children aged 5–13 (Pre-KG to Grade 7), built for India and designed to scale internationally. Children explore six magical kingdoms with five original characters, discover 10 new words a day, write, read, speak and play. A learning engine works quietly in the background to personalise every skill.

> ENTER. EXPLORE. LEARN. LEVEL UP!

---

## Contents

1. [Quick start](#quick-start)
2. [What's implemented](#whats-implemented)
3. [Architecture](#architecture)
4. [Learning engine](#learning-engine)
5. [Gamification engine](#gamification-engine)
6. [Content system and honest coverage](#content-system-and-honest-coverage)
7. [Safety, privacy and DPDP](#safety-privacy-and-dpdp)
8. [Configuration](#configuration)
9. [Database](#database)
10. [Deployment (Vercel + Supabase)](#deployment-vercel--supabase)
11. [Testing](#testing)
12. [Brand assets (official logo)](#brand-assets-official-logo)
13. [Quality assurance](#quality-assurance)
14. [Known limitations and next steps](#known-limitations-and-next-steps)

---

## Quick start

Requirements: Node.js 20+.

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Open http://localhost:3000.

- **No database setup is needed for development.** When `DATABASE_URL` is empty, PING VIBE runs an embedded PostgreSQL (PGlite) stored in `./.data/pingvibe`. The schema and all seed content load automatically on first request.
- **No e-mail provider is needed for development.** Verification e-mails land in the developer mailbox at http://localhost:3000/dev/mailbox. This page is disabled in production.
- **No AI key is needed to try it.** Without `ANTHROPIC_API_KEY`, writing feedback uses the built-in offline evaluator and LEXI answers from the word bank. Both are labelled as such in the UI.
- **First admin:** the account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first boot. Log in at `/admin/login` and change the default password before deploying.

To start from a clean database, stop the server and delete `.data/`.

### The child journey

1. **Parent registers** with the child's first name, the parent's e-mail, the child's birth month and year, and grade (plus a parent password).
2. **The parent verifies their e-mail.** The link opens a confirmation page; verification happens on a button press, so mail scanners can't trigger it.
3. **Parental consent** (DPDP Act, 2023): learning data consent is required; AI feedback and in-browser speech are optional. The parent also sets the child's 6-digit secret PIN.
4. **The child gets an Explorer name**, which is random and never contains their real name, e.g. `cosmicfox427`.
5. **First login starts a play-based welcome:** MAX greets the child, the buddies introduce themselves, the six kingdoms are shown, then "Let's discover your first 10 magical words!" There is **no assessment**.
6. **The Daily Adventure** combines today's plan, Choose Your Adventure, missions, rewards and kingdoms, with character suggestions throughout.

---

## What's implemented

All items below work end to end and are persisted server-side.

| Area | Implemented |
|---|---|
| **Brand & design** | Original design system (Tailwind tokens), 5 original SVG characters × 8 interaction states (welcome, excited, thinking, explaining, celebrating, encouraging, surprised, hint), 7 illustrated SVG kingdom scenes, reduced-motion support, mobile-first layouts with a bottom nav on phones |
| **Public site** | Story-driven landing page with all 11 sections, Netflix-style rows, privacy notice |
| **Auth** | Parent registration, e-mail verification, consent records, child PIN login, parent/child/admin roles, scrypt hashing, DB-backed sessions (httpOnly cookies), self-service password reset (single-use hashed tokens, all sessions revoked, no account enumeration), rate limiting with spoof-resistant client IPs, same-origin checks |
| **Onboarding** | Animated character welcome, buddy introductions and kingdom tour, then straight into the first Word Quest with a welcome gift. No test. |
| **Daily Word Quest** | Plan-driven daily words, word cards (TTS pronunciation, phonetics, meaning, explanation, example, real-life usage, synonyms/antonyms, "repeat the word" speech check), 5 challenge rounds, server-validated answers, hints after mistakes |
| **Vocabulary mastery** | Discovered → Practising → Mastered via a Leitner spaced-repetition system. Mastery requires correct answers on **different days**, never just viewing. Includes a revision engine, notebook (search/filter/favourite/listen) and words-used-in-writing/speaking tracking |
| **365-day curriculum** | **3,650 plan records** (365 days × 10 grades) with a weekly rotation of 14 activity types, rising difficulty, weekly assessments and monthly championships. The journey advances by completed days, so a missed day never skips content. Includes a calendar view and a gentle "welcome back" recap |
| **Choose Your Adventure** | MAX asks "What kind of adventure are you in the mood for today?" with 5 choices. The engine picks the right activity, preferring unfinished plan items and weak skills |
| **Creative Writing** | Topic engine with **1,300+ topics** (18 themes × age-graded templates) plus AI-generated topics; 60-day topic history to avoid repeats. Writing canvas with word/sentence counters, power words, autosave and voice dictation. Claude evaluation (structured output) with an offline fallback; original vs corrected sentences side by side |
| **Story Builder** | Random character/location/object/challenge, writing or voice storytelling, evaluated against the required elements |
| **Grammar Galaxy** | 14 topics with GRAMMY explanations, examples and hints; a growing exercise bank (missions sample from it); 7 types of endless generated drills |
| **Reading Adventures** | Illustrated stories matched to reading level, narration, glossary taps, highlighting of the child's own discovered words, comprehension quizzes, a reward-unlocked bonus story |
| **Speaking & Listening** | Real-life scenarios plus own-word practice; in-browser speech recognition with clarity feedback (graceful "I said it!" fallback when unsupported); server-scored Listening Lab |
| **Word Games Arcade** | 10 games using the child's own words: Word Match, Spell Master, Missing Word, Picture Vocabulary (drag-and-drop or tap), Word Race, Sentence Builder, Word Detective, Word Hunter (word search), Treasure Hunt, Boss Battle. Easier alternative formats are offered after a tricky round |
| **Boss battles & challenges** | One server-scored challenge engine (answer keys never leave the server) for 6 kingdom bosses with Easy/Normal/Hard and no-penalty retries, weekly quests, monthly championships, mystery-word cases, special/event challenges and family challenges |
| **Missions** | Daily (rotated per child), weekly, monthly, character (LEXI/GRAMMY/SPEAKY/STORY/MAX), mystery and event missions. Progress is computed from real learning metrics and claims are idempotent per period |
| **Economy** | XP, **Vibe Coins** and **Magic Crystals** in one idempotent ledger with per-activity daily caps, performance multipliers and a configurable daily XP ceiling (healthy use) |
| **250 levels** | 10 tiers × 25 (Word Explorer → Grand English Champion). Milestones every 5/10/25/50 levels grant coins, exclusive costumes, magic objects, decorations, themes and special missions. Gentle mastery gates every 10 levels. Admins can append unlimited levels |
| **Avatar & inventory** | Layered avatar: 6 skin tones, 11 hairstyles (including patka and hijab), 8 hair colours, outfits, shoes, expressions, accessories, magic objects, backgrounds and celebration animations. Ownership is checked server-side |
| **Reward shop** | Common/Rare/Epic/Legendary items. Rarity is visual and sets unlock criteria; there are no odds, loot boxes or real money |
| **My PING VIBE World** | A personal world where 11 buildings (treehouse, vocabulary library, grammar lab, castle, studio, treasure room, garden, pet sanctuary, sky-ship…) unlock from learning milestones, alongside owned decorations |
| **Kingdom map** | 6 kingdoms with 25 locations (missions, treasures, secret rooms, bosses), progress indicators, hidden areas revealed by learning, and mobile layouts |
| **Pets** | 9 pets unlocked by learning milestones, each with a personality and hints. Pets grow with learning; there is no neglect mechanic |
| **Collectibles** | Vocabulary cards (from mastered words), grammar cards, story cards, character, creature and event cards, plus a Collection Book |
| **Skill tree** | 8 branches and 29 nodes unlocked from assessed accuracy over many attempts, **never XP** |
| **Achievement Museum** | Trophy hall, printable certificates and a personal learning timeline (first day, first 10 words, first mastered set, levels 25/50/100/250…) |
| **Events** | 15 recurring date-based events (Children's Day, Republic Day, Monsoon Magic…). Admin-configurable, each with a mission, challenge and card |
| **AI companion** | "Ask LEXI": educational-only scope, PII screening before and after the model call, age-adapted answers, parent toggle, rate limit. Chats are not stored. Has an offline dictionary mode |
| **Parent dashboard** | Weekly Learning Story, 8-skill observations (clearly labelled as ongoing observations, not test results), annual journey, monthly summaries, 7-day activity, improvement areas, writing samples, safeguarding alerts, family challenges, PIN reset, data export, deletion, reminders |
| **Admin** | Analytics (DAU/WAU/MAU, return visits, mastery, writing improvement, activity-health flags, game engagement, level/kingdom distribution), launch objectives, Content Studio (coverage, AI generation, 7-gate validation, review queue, manual entry), economy editor, level appender, events, vocabulary editor, grades (auto-builds a 365-day plan) |

---

## Architecture

```
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion
│
├─ src/app/                Pages (public, /world child app, /parent, /admin) + REST route handlers (/api/*)
├─ src/components/         Characters, Avatar, Scenes, UI kit, play engines (Question, ChallengePlayer, Games, WritingCanvas)
├─ src/server/             Server-only services
│   ├─ db.ts               Driver abstraction: pg (DATABASE_URL) or embedded PGlite; auto-migration
│   ├─ session.ts api.ts   Sessions, role guards, validation, CSRF origin check, error handling
│   ├─ vocab.ts            Daily sessions, question building, spaced repetition, band adaptation
│   ├─ journey.ts          365-day plan engine, adaptive activity resolution, calendar
│   ├─ gamification.ts     Ledger (XP/coins/crystals), caps, ceiling, levels, rhythm, achievements
│   ├─ unlocks.ts metrics.ts  Central unlock evaluator driven by learning metrics
│   ├─ missions.ts challenge.ts world.ts skills.ts adventure.ts personalise.ts
│   ├─ ai/                 Claude client (provider abstraction), writing evaluator, LEXI companion
│   └─ content/            Seed curriculum + generators, validation gates, AI content pipeline
└─ db/schema.sql           Normalised schema (idempotent), db/supabase-rls.sql (deny-all RLS)
```

- **All progression and reward logic runs on the server.** Clients send answers; the server validates them, updates mastery and evidence, and awards through the ledger.
- **AI:** Claude via `@anthropic-ai/sdk` with structured outputs (`messages.parse` + Zod), the configurable `AI_MODEL` (default `claude-opus-5-5`), and server-side refusal fallbacks (`fallbacks: "default"`). Keys never reach the browser.
- **Speech:** browser TTS and SpeechRecognition. No audio or transcript leaves the device.

## Learning engine

- **No placement test.** A child starts at their grade's content band. Everything after that is inferred from ordinary play.
- **Invisible learning intelligence.** Every server-validated interaction records *evidence* per micro-skill: quest and revision answers, boss and challenge rounds, grammar missions, reading quizzes, listening, speaking clarity and writing rubric scores. `server/skills.ts` turns this into **8 independent proficiencies**: vocabulary, grammar, spelling, writing, reading, speaking, listening and comprehension.
  - Estimates use a smoothed formula (neutral prior, weight 15) and only start influencing difficulty after **15+ interactions per skill**, so one or two answers never cause a jump.
  - The vocabulary band changes only after 3 completed quests (about 45+ answers), and by one step at a time, within ±1 of the grade band.
- **Adaptation per skill.** Grammar and writing topics shift band by skill. Struggling grammar learners get their weakest topic first. Readers see level-matched stories. Hints, simpler alternatives and audio help appear after mistakes.
- **Child-facing language is always encouraging**: 🌱 Sprouting → 🌿 Growing → 🌳 Progressing well → ⭐ Strong → 🌟 Shining. There are no rankings and no comparisons with other children.
- **Character recommendations** come from performance and interests, for example GRAMMY: "I noticed you enjoy building sentences. Shall we try a new sentence adventure?"

## Gamification engine

- **Single ledger** (`xp_transactions`) for XP, coins and crystals. Every award has an idempotency key; per-activity daily caps and a daily XP ceiling apply. Rewards scale with accuracy and score, not clicks.
- **Unlocks are evaluated centrally** (`unlocks.ts`) after every award, against metrics computed only from recorded learning: pets, cards, world buildings, secret locations and timeline milestones.
- **Healthy engagement:** age-based break reminders (15–30 min), a forgiving learning rhythm (up to 2 rest days never break it; earned rewards are never removed), no child-facing push pressure, and no infinite feeds.

## Content system and honest coverage

| Content | What exists now |
|---|---|
| 365-day plans | **3,650 records**, 365 for every grade |
| Levels | **250**, appendable without code |
| Writing topics | **1,304** (16 hand-written + 1,288 template-generated across 18 themes and 4 bands) + AI generation |
| Vocabulary | **120 fully authored words** (30 per band) published · **757 curated headwords** queued for AI enrichment (action words, descriptive words, homophones, compound words, phrasal verbs, idioms) |
| Grammar | 14 missions × 5 exercises (bank grows via the pipeline) + unlimited generated drills |
| Reading | 6 original stories (1 reward-unlocked) |
| Speaking | 6 scenarios + unlimited own-word practice |

**Important:** the plans cover 365 days for every grade, but *fresh new vocabulary* is limited by the published word bank. With 120 published words, a new child gets several days of never-seen words (the Content Studio shows the exact "fresh vocabulary days" per grade). After that, the quest falls back to revision and tells the child new words are coming.

To reach 365 days of new words per band, run the pipeline:

1. Set `ANTHROPIC_API_KEY`.
2. In **Admin → Content Studio → Generate**, choose *Vocabulary*. Claude enriches the queued headwords into full word cards.
3. Each item passes **7 validation gates** (safety moderation, grade readability, grammar and mechanics, spelling and grammar via an independent AI reviewer, duplicate check, difficulty range, age suitability). Failures are auto-rejected and kept for audit.
4. An admin **approves** items. Only approved items are published to children.
5. The daily `/api/cron/content` job tops up the review queue for bands whose runway is under 60 days. It never publishes on its own.

Stories, writing topics, grammar exercises and speaking scenarios use the same pipeline.

## Safety, privacy and DPDP

- **Minimal data:** first name, birth month and year, grade, and the parent's e-mail.
- **Consent:** verifiable parental consent with versioned consent records and optional scopes.
- **No contact with others:** no public profiles or leaderboards, no child-to-child communication. Family features go only from parent to their own child.
- **Speech:** no voice recordings or transcripts are stored.
- **LEXI:** chats are not stored; PII and unsafe topics are screened; the parent can switch LEXI off.
- **Safeguarding:** if the AI evaluator flags a piece of writing, the parent is notified.
- **Parent rights:** JSON data export, profile deletion and account deletion, all cascading through the data.
- **Supabase:** `db/supabase-rls.sql` enables row-level security with deny-all on every table, so the auto-generated APIs can't expose children's data. The app connects as the table owner from the server only.
- **Security headers:** nosniff, DENY framing, and a Permissions-Policy that allows the microphone only for self.

## Configuration

See `.env.example`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Supabase). Empty means embedded PGlite |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Optional neural character voices (Azure AI Speech). Empty means the browser's own voices are used |
| `AZURE_TTS_VOICES` | Optional JSON to recast character voices, e.g. `{"lexi":{"voice":"en-IN-NeerjaNeural","style":"cheerful"}}` |
| `DB_POOL_MAX` | Connections per server instance when `DATABASE_URL` is set (default 5). Keep it small on serverless |
| `SESSION_SECRET` | Long random string |
| `APP_URL` | Public URL used in e-mails |
| `ANTHROPIC_API_KEY`, `AI_MODEL` | Claude (server-side only). Default model `claude-opus-5-5` |
| `PINGVIBE_ANTHROPIC_API_KEY` | Same key under a different name, for hosts that reserve `ANTHROPIC_API_KEY` (such as Claude Code cloud environments). Used first when set |
| `RESEND_API_KEY`, `EMAIL_FROM` | E-mail delivery. Required in production |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Bootstrap administrator (only when none exists) |
| `CRON_SECRET` | Bearer token for `/api/cron/*` |
| `APP_TIMEZONE` | Day boundaries (default `Asia/Kolkata`) |
| `EMAIL_TRANSPORT` | Set to `dev-mailbox` to use `/dev/mailbox` even in a production build (staging and QA only, never live) |
| `IP_RATE_LIMIT_MULTIPLIER` | Scales the per-network limits. Leave unset in production; QA uses it so one machine can create many synthetic families |
| `NEXT_DIST_DIR` | Alternative build directory, so a production build can run next to `next dev` |
| `PGLITE_DIR` | Embedded database location when `DATABASE_URL` is empty (default `.data/pingvibe`) |

## Database

- `db/schema.sql` is idempotent and applied automatically on boot. It contains 60+ tables, among them all 28 requested entities. Some requested entities map onto existing tables:
  - `rewards` / `child_rewards` cover avatar_items and child_inventory.
  - `xp_transactions` covers reward_transactions.
  - `challenge_attempts` covers boss_battle_sessions.
  - `personalised_recommendations` covers engagement_recommendations.
  - `events` covers special_events.
- Seeding is additive (`ON CONFLICT DO NOTHING`) and versioned (`seed_meta`), so admin edits are never overwritten.
- Supabase: run `db/schema.sql`, then `db/supabase-rls.sql`, in the SQL editor (or just deploy; the app migrates on first boot, but the RLS file must be run manually).

## Deployment (Vercel + Supabase)

1. Create a Supabase project and copy the **Session pooler** connection string into `DATABASE_URL`.
2. Run `db/schema.sql` and `db/supabase-rls.sql` in the Supabase SQL editor.
3. Import the repo into Vercel and set the env vars above (`SESSION_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`, `ANTHROPIC_API_KEY`, `ADMIN_*`, `APP_URL`).
4. `vercel.json` schedules the hourly parent reminders and the daily content top-up.
5. Log in at `/admin/login`, change the admin password, then use the Content Studio to grow the word bank.

## Testing

```bash
npm test
```

21 unit tests cover client-IP parsing for rate limits, the level curve and milestones, the 3,650-row curriculum and its rotation, topic generation, seed-content integrity (answer keys, examples contain their words, metric references), answer validation, a/an rules and the offline evaluator.

```bash
npm run typecheck
```

```bash
node tests/e2e-api.mjs http://localhost:3000
```

The end-to-end script runs against a running dev server. It covers registration → verification → consent → child login → welcome → quest → rewards → challenges → missions → writing → shop → avatar → companion safety, every child, parent and admin page, DPDP export, family challenges and admin validation.

## Brand assets (official logo)

The official PING VIBE logo is the master asset. It must be used exactly as supplied: no recreation in HTML/CSS, no AI regeneration, and no recolouring, cropping, stretching or filters.

The master is **`public/assets/brand/ping-vibe-logo.jpg`**: the official 1536×1024 JPEG, committed byte-for-byte as supplied.

- **Derived assets.** `npm run brand:assets` writes the favicon, app icons and a 1200×630 Open Graph image to `public/assets/brand/derived/`. It uses `sharp` with `fit: contain` on a white canvas, so the master is only read, never cropped or overwritten.
- **Replacing the logo.** Swap the file (keep the name), update `LOGO_WIDTH`/`LOGO_HEIGHT` in `src/components/PingVibeLogo.tsx` and `W`/`H` in `src/components/BrandLogo.tsx` if the size changes, re-run `npm run brand:assets`, and restart. The root layout picks up the derived icons automatically.
- **Containers.** The artwork has a white background, so every placement sits in a solid-white rounded container.
- **Compact mark.** No compact mark is derived. If the brand owner approves one, add it as a separate file.

Where the logo appears:
- Landing page header, hero, story section and footer.
- Sign-up, login and password pages.
- Child, parent and admin headers.
- Welcome, loading, celebration, certificate, error and 404 pages.
- E-mails.

`<PingVibeLogo />` is used in server components and `<BrandLogo />` in client components. If the master file is ever missing, both fall back to a text wordmark instead of showing a broken image. See `public/assets/brand/README.md`.

## Quality assurance

The full audit lives in [`qa/`](qa/). Start with [`qa/PRODUCTION_READINESS_REPORT.md`](qa/PRODUCTION_READINESS_REPORT.md). Every test uses **synthetic data only**.

**1. Unit tests**

```bash
npx vitest run
```

**2. API, database, security and learning suite (215+ checks)**

Run it against any running server:

```bash
BASE_URL=http://localhost:3000 node tests/qa-api.mjs
```

The live-AI checks (LRN-037, LRN-084) need the server and the test run to share `PINGVIBE_ANTHROPIC_API_KEY` (or `ANTHROPIC_API_KEY`). To review Claude's writing feedback for every grade, run this; it writes `qa/results/ai-writing-grades.json`:

```bash
BASE_URL=http://localhost:3000 node tests/ai-writing-grades.mjs
```

**3. Browser checks**

Covers the browser journey, 8 viewports, console errors, axe-core accessibility and visual regression:

```bash
node tests/ui-audit.mjs
```

Add `--update-baseline` to accept new screenshots. Set `ONLY=<regex>` to limit the sweep to matching pages, for example to refresh selected baselines.

Run it against a production build (`next start`, port 3000, with `EMAIL_TRANSPORT=dev-mailbox`). In development the Next.js dev indicator and on-demand compilation make screenshots and timings noisy.

**4. Performance and 30-child load**

First make a production build in a separate directory:

```bash
NEXT_DIST_DIR=.next-prod npx next build
```

Start it with its own database and the dev mailbox:

```bash
PGLITE_DIR=.data-prod EMAIL_TRANSPORT=dev-mailbox IP_RATE_LIMIT_MULTIPLIER=100 NEXT_DIST_DIR=.next-prod npx next start -p 3001
```

Then run the perf suite against it:

```bash
BASE_URL=http://localhost:3001 node tests/perf.mjs
```

**5. Aggregate report**

Writes `qa/results/test-execution-report.json` and `qa/COMPLETE_TEST_CASES.md`:

```bash
node scripts/qa-report.mjs
```

Notes:
- Tests that need a service that isn't configured (for example `ANTHROPIC_API_KEY`) are reported as **BLOCKED**, never as passed.
- Use `IP_RATE_LIMIT_MULTIPLIER=100` on the server under test. The suites create many families from one IP.

## Known limitations and next steps

- **Open QA items:** see [`qa/BUG_REGISTER.md`](qa/BUG_REGISTER.md).
  - Live Claude tests pass with `PINGVIBE_ANTHROPIC_API_KEY` (31 Oct). Without a key they are reported as BLOCKED.
  - 30-child load passes on PostgreSQL 16 (p95 762 ms); re-check on hosted Supabase. Embedded PGlite is single-connection, so do not use it for load tests.

- **Vocabulary runway:** see *Content system and honest coverage*. It needs AI enrichment plus review of the 757 queued headwords and further batches.
- **Illustrations** for words and story scenes use emoji. Commissioned artwork can be added to `vocabulary_master` and `reading_stories` later.
- **Pronunciation scoring** is word-match clarity from browser speech recognition, not phoneme-level assessment. It is unavailable in browsers without SpeechRecognition (e.g. Firefox), where listen-and-repeat practice is used instead.
- **Games are scored client-side.** Game results only move words from Discovered to Practising and never grant mastery. Mastery and skill evidence come only from server-validated answers.
- **Lunar-calendar festivals** (Diwali, Holi, Eid) need yearly dates entered in Admin → Events.
- **Lottie animations** were not used; all animation is Framer Motion and CSS on original SVG art.
- **No e-mail provider in development:** mail goes to `/dev/mailbox`, which is disabled in production.
