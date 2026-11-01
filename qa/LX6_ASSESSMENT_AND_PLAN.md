# PING VIBE — Learning Experience 6.0: Assessment, Gap Analysis and Plan (1 Nov 2026)

## 1. Existing architecture

- **Stack:** Next.js 15 App Router (server components and route handlers) and React 19. Postgres runs as embedded PGlite in development or Supabase or any Postgres in production, behind one data layer (`src/server/db.ts`).
- **Data:** an idempotent schema in `db/schema.sql` with seeded content. Server-only business logic lives in `src/server/*`. Claude is used through `src/server/ai/*`, which has offline fallbacks.
- **Sessions:** child and parent sessions, with verified parental consent.
- **Shared services:**
  - gamification (`award()`: XP plus VIBE COINS, idempotent ledger, daily ceiling)
  - missions
  - journey (365-day plan, grade-wise daily missions)
  - vocabulary (spaced Leitner revision)
  - skills (`skill_evidence` with smoothed estimates and a minimum-evidence rule)
  - personalisation (`recommend()`)
  - reports (parent)
  - audio (`AudioManager`)
  - themes (CSS variables, admin registry)

## 2. Inventory against LX 6.0

| LX 6.0 requirement | Already in PING VIBE | Gap |
|---|---|---|
| Child learning profile | children + child_profiles, activity_log, vocabulary progress, writing, grammar, speaking, game history | Complete enough; no new profile tables |
| Independent skill tracking | 8 areas: vocabulary, grammar, spelling, writing, reading, speaking, listening, comprehension (`skills.ts`) | Add **phonics**, **pronunciation** and **real-world English** |
| Recommendation engine | `recommend()`: module-level suggestions from 30-day accuracy and activity | Upgrade to the **5 categories** (Learn next, Practise more, Revise now, Explore something new, Challenge yourself), pick **specific content** by skill estimate and history, add child-friendly reasons, keep a balanced mix |
| Adaptive difficulty | Skill bands move ±1 only with enough evidence (MIN_EVIDENCE = 15); reading by band | Apply skill estimates to reading, grammar and real-life level choice |
| Revision intelligence | Leitner boxes, due dates, correct and wrong counts, mastery after spaced correct days | Show next revision date and history in the notebook |
| AI companion | LEXI (Claude) with safety filter, PII block, parent switch, dictionary fallback | Greet by name; ask for hints rather than answers |
| Vocabulary notebook | Search, favourite, listen, status | Add date introduced, next revision and practice counts |
| Reading intelligence | 6 stories, glossary, quiz, reading skill estimate | Reading level indicator; reader with text size, tap-to-explain, sentence replay and highlighting; ability-based recommendation |
| Speaking and listening | Speaking Arena (scenarios, optional microphone, accuracy), Listening Lab | Reuse; speaking and listening evidence feeds the engine |
| Writing studio | Topics, Claude feedback with original preserved, Story Builder | **Improve My Sentence** (suggest and explain; the child edits) |
| **VIBE REAL LIFE** | 3 static speaking scripts | **New:** data-driven conversational scenarios with characters, multiple acceptable answers, 3 levels and 12 situations |
| Parent dashboard and reports | Weekly learning story, monthly summaries, skill development, areas to improve | Add real-life scenarios, words revised, speaking and listening counts, recommendations, retention |
| Skill tree | `skillTree()` per area | Add new branches and the 4 states (Started, Practising, Developing, Demonstrated mastery) from evidence, never XP |
| Adventure Passport | Museum (achievements), collection (cards) | **New:** passport stamps recorded once, built on existing records |
| Story creator | Story Builder (wheels and writing, AI feedback) | Personal Story Gallery |
| Content management | Admin content studio (generation, 7 gates, review, publish), vocabulary, grammar, stories, themes | Real-life scenarios stored as data (database table, editable without code) |

## 3. Reusable components

`award()`, `recordEvidence()`, `getOrCreateDailySession()`, `recommend()` (extended), `Celebration`, `MistakeReview`, `CharacterSays`, `AudioManager` / `say()`, `Question`, the theme tokens, `PageTitle`, the parent report pages and the admin content pipeline.

## 4. Database and API impact (additive, reversible)

- **New tables:**
  - `real_life_scenarios` (data-driven content)
  - `real_life_progress` (per child, per scenario and level, best result, completions)
  - `passport_stamps` (child, stamp, recorded once)
- **No changes to existing columns.** New skill keys use the existing `skill_evidence` table.
- **New APIs:** `/api/real-life/[slug]` (play turn by turn, server-validated), `/api/writing/improve` (Improve My Sentence) and `/api/recommendations` (5 categories). Pages: `/world/real-life`, `/world/passport`.

## 5. Dependency map

```
skill areas (+phonics, pronunciation, real_world) ─┐
learning events (recordEvidence, activity_log)  ───┼─> recommendation engine (5 categories) ─> dashboard, parent report, skill tree
revision (Leitner)                                ─┘
real-life engine ─> evidence(real_world, speaking, listening) + passport stamps + award()
improve-my-sentence ─> evidence(writing)
```

## 6. Plan and order

1. Skill areas and the recommendation engine (5 categories, content-level, reasons).
2. VIBE REAL LIFE engine plus 12 scenarios (3 levels each), recording evidence, stamps and rewards.
3. Improve My Sentence; reader upgrades (text size, tap-to-explain, sentence replay, highlighting); notebook revision details; companion greeting and hints.
4. Parent dashboard additions.
5. Skill tree states, Adventure Passport, Story Gallery.
6. Dashboard "Recommended for you" and navigation.
7. Acceptance tests 1–14 where testable here.

## 7. Risks and test plan

| Risk | Mitigation |
|---|---|
| Free-text answers in real-life scenes are hard to judge | Intent matching with several accepted phrasings per turn, plus choices for younger children. Never a single exact sentence. Optional Claude judgement only when configured |
| Recommendations drifting to weak areas only | A fixed mix of one item per category where available |
| AI cost | The engine is rule-based SQL; Claude only for writing, LEXI and Improve My Sentence, with offline fallbacks |
| Regression | Existing qa-api (253 checks), ui-audit journey and theme audit re-run, plus new LX6 checks |
