# PING VIBE – Learning Experience 6.0: Delivery Report

Date: 1 Nov 2026. Branch: `claude/ping-vibe-product-design-16wth5`. The plan and gap analysis are in `qa/LX6_ASSESSMENT_AND_PLAN.md`.

Rules still enforced:
- The logo is unchanged.
- XP and VIBE COINS remain the only currencies.
- Children get at most 5 new words a day.
- Grade mission counts are unchanged.
- No assessment is compulsory.

## Test results

| Suite | Result |
|---|---|
| LX6 acceptance tests (`tests/qa-lx6.mjs`, 31 checks covering brief tests 1–14) | **31 PASS / 0 FAIL** |
| Full API regression (`tests/qa-api.mjs`, production build) | **251 PASS / 0 FAIL / 2 BLOCKED** (both need a real AI key: the writing evaluation and the companion; their offline modes were verified instead) |
| Unit tests (vitest) | **52 PASS** (includes Real Life answer evaluation for all 12 scenarios and the Improve My Sentence rules) |
| TypeScript and production build | Clean |
| Browser smoke test (390 px phone) | Improve My Sentence flow, reader text size, Passport, Skill Tree, Story Gallery, Notebook and dashboard: no console errors, no horizontal overflow |

## Completed modules

### M1 Learning Intelligence
- **Independent skill estimates.** 11 skills are tracked separately; phonics, pronunciation and real-world skills were added. An estimate is only shown after at least 15 pieces of evidence.
- **Recommendation engine** (`src/server/recommend.ts`).
  - It has 5 categories: Learn next, Practise more, Revise now, Explore something new, Challenge yourself.
  - Each recommendation comes with a child-friendly reason.
  - It uses the child's real data: grade band, completed content, accuracy, words due for revision, and skill strengths and weaknesses.
  - Recommendations are saved to `personalised_recommendations`.
  - They appear on the child dashboard ("Recommended for you") and in the parent report.
  - They are also available through the new `GET /api/recommendations`.
- **Adaptive difficulty:**
  - Grammar and reading levels follow skill bands.
  - The Real Life level is suggested from age plus evidence.
  - Practice suggestions only appear when there is enough evidence for a skill.

### M2 Child experience
- **LEXI companion:**
  - Greets the child by name.
  - Now gives hints, not answers, when asked to do homework or quiz answers, both with AI and offline.
  - Safety screening for personal information and unsafe topics is unchanged.
- **Vocabulary Notebook.** Each word has a "Word history" panel showing:
  - when it was discovered;
  - when it was last practised;
  - its next revision date;
  - how many times it was answered right and wrong;
  - how often it was used in writing and speaking.
- **Interactive reader:**
  - Read-along narration highlights each sentence as it is read.
  - 🔁 replays a single sentence.
  - Tap-to-explain works on glossary words and on the child's own discovered words; the meaning is shown and read aloud.
  - A−/A+ text size is remembered on the device.
  - A reading level indicator says whether the story is easy, just right or a stretch for the child.

### M3 Active English
- **VIBE REAL LIFE** (`/world/real-life`):
  - 12 data-driven scenarios with three levels (beginner, developing, advanced).
  - Conversations take several turns, and many natural answers are accepted.
  - Picture-supported choices are offered for younger children; the microphone is optional.
  - After two unsuccessful tries the child gets a hint and then the model answer.
  - Answers are never sent to the browser.
  - XP and a passport stamp are recorded on the server.
- **IMPROVE MY SENTENCE** (`/world/writing/improve`, `POST /api/writing/improve`):
  1. The original is shown and stored, and it is never replaced.
  2. GRAMMY gives 2–4 explained ideas (fix, power word, add detail, join ideas). These come from Claude when an AI key is set; otherwise offline rules are used, and the page labels which one it is.
  3. The child writes their own version, which is saved next to the original.
  4. XP is awarded only for a real change, and only once.
  5. Private information is screened before any AI call.
  6. The result counts as evidence for the writing skill.

### M4 Parent Intelligence
- The parent child report has a new "This week and this month" table, counted from real activity rows:
  - new words and words revised;
  - real-life scenarios completed (with the place names);
  - speaking sessions and listening challenges;
  - stories read and sentences improved.
- It also shows **word retention**, only when at least 5 words are older than 3 days, and otherwise says so.
- It also lists the child's current recommended next activities.

### M5 Motivation and creativity
- **Skill Tree.** Each node shows a growth stage: Ready to start → 🌱 Started → 🌿 Practising → 🌳 Developing → ★ Demonstrated mastery. Stages come from attempts and accuracy only, never from XP. There are new Phonics and Real-World English branches.
- **Adventure Passport** (`/world/passport`):
  - Stamps are earned for kingdoms visited, real-life places, word milestones, stories, Improve My Sentence and the first badge.
  - Each stamp is stored once (primary key on child and stamp) with the date it was first earned.
  - The page also shows "stamps still to find", each with a hint.
- **Story Gallery.** Saved Story Builder stories appear as a personal gallery on `/world/story-builder`. The gallery is private to the child, as the tests check.
- **Navigation.** These pages are linked from the dashboard, the Me page and the Writing Studio:
  - Passport
  - VIBE Real Life
  - Improve My Sentence

## Database changes (idempotent, in `db/schema.sql`)
- New tables:
  - `real_life_scenarios`
  - `real_life_runs`
  - `real_life_progress`
  - `passport_stamps`
  - `sentence_improvements`
- New `xp_config` rows: `real_life` (40 XP / 15 coins, cap 4) and `improve_sentence` (15 XP / 5 coins, cap 5).
- New skill nodes: `ph-sounds`, `ph-blend`, `rw-everyday`, `rw-confident`. They are inserted on boot with `on conflict do nothing`.

## API changes
- `POST /api/real-life/[slug]` with action `start` or `answer`.
- `POST /api/writing/improve` with action `suggest` or `save`.
- `GET /api/recommendations`.

## Incomplete or limited (honest list)
- **Content library / CMS (Part 4):**
  - Real Life scenarios are stored in the database as data, so new ones need no code.
  - There is **no admin editing screen** for them yet.
  - Metadata tagging across all content types is not done.
- **AI quality:** With no AI key configured, Improve My Sentence uses offline rules. These check capitals, punctuation, word choice and missing detail, but they cannot judge meaning. Real-AI behaviour was not exercised in this run.
- **Speech:**
  - The microphone uses the browser's speech recognition where available (Chrome or Edge). It is optional everywhere.
  - Pronunciation scoring is a word-match accuracy, not phoneme-level assessment.
- **Read-along highlighting** is sentence-level, not word-level, because browser voices don't give reliable word timings.
- **The parent "Listening" count** includes Listening Lab challenges only.
- **Recommendations** are rule-based (fast, explainable, no AI cost), not machine-learned.
- The full 35-minute UI audit sweep was not re-run for this change. The new pages were added to its route list, and the targeted browser smoke test passed.

## How to run the LX6 tests
```bash
npx vitest run
```
Then, with the app running on port 3000:
```bash
node tests/qa-lx6.mjs
```
