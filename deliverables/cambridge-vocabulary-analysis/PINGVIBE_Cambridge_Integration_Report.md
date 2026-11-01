# PING VIBE: Cambridge Vocabulary Integration Report

1 November 2026 · Scope: analyse two Cambridge reference PDFs, audit PING VIBE vocabulary, map and deduplicate, and implement safe improvements without publishing unreviewed or copyright-sensitive content.

**Overall result:**

- Both PDFs have been analysed and all 863 existing vocabulary records audited.
- 520 candidates have been loaded into the existing review queue (not published).
- Published words now show verified IPA.
- Eight original Word Scenes have been built and tested.
- Every test suite passes: 20/20 new Cambridge checks, plus the full regression suites.

## 1. What was inspected

| Area | Finding |
|---|---|
| Vocabulary database | 120 published words (30 per band) in `vocabulary_master`; 757 rows in `vocabulary_candidates` (14 duplicate published words, so 743 unique queued headwords). Counts were checked against the seed source and the running database. |
| Grade and difficulty | 4 bands from the grade registry; 1–5 difficulty number on words; 5 named levels in the learning intelligence |
| Categories | Queue tags only (action, descriptive, everyday, academic, homophone, nature, compound, phrasal_verb, idiom); published words had no category field in use |
| Lifecycle | Discovered → Practising → Mastered. Mastery needs correct answers on different days. 7-box Leitner schedule (0, 1, 2, 4, 7, 14, 30 days). Limit of 5 new words a day from `grade_config`. Revision is tracked separately. |
| Audio and illustration | Browser or neural TTS (Listen, Slowly, Sound it out); emoji illustrations; child-friendly respelling (`phonetic`); no IPA stored |
| Learning intelligence | `skill_evidence` plus `learning_events`, 11 skills, recommendations in 5 categories |
| Content Studio | AI generation from queued headwords, then 7 gates, then the review queue, then human publish. Daily cron tops up the queue but never publishes. |

## 2. What was changed

### Database (additive, backward-compatible, in `db/schema.sql`)

- `vocabulary_candidates` gained these columns:
    - `source`, `source_ref`, `candidate_id`;
    - `part_of_speech`, `grade_range`, `difficulty_label`, `receptive_productive`;
    - `scene`, `priority`, `linked_word`.
- `vocabulary_master` gained these columns, all nullable or defaulted:
    - pronunciation: `ipa`, `syllables`, `pronunciation_source`;
    - mapping: `grade_range`, `receptive_productive`, `scene`;
    - language: `word_family[]`, `collocations[]`, `common_mistakes`;
    - assets: `audio_status`, `illustration_status`;
    - tracking: `provenance`, `content_version`.
- New table `scene_progress (child_id, slug, best_score, completions, last_at)`.
- New `xp_config` row `word_scene`: 30 XP, 8 coins, cap of 4 a day.

### Content and seeding (`src/server/migrate.ts` → `seedCambridge`)

- **520 candidates** were inserted into `vocabulary_candidates` with status `queued` and source `cambridge-reference:<doc>`. A candidate is skipped if the word is already published, and existing rows are never overwritten.
    - They are headwords only. The existing pipeline must author the cards, then they pass the 7 gates and a person approves them.
- **IPA and syllables** were added for all 120 published words, only where empty. IPA comes from the CMU Pronouncing Dictionary (US English). Syllable breaks are stored only when the en_GB hyphenation agrees with the CMU syllable count (82 of 120). Nothing was invented.
    - The Notebook shows the IPA, with its source in a tooltip, and syllables in Word history.

### Features

- **Word Scenes** (`/world/word-scenes`, `/world/word-scenes/[slug]`, `POST /api/word-scenes/[slug]`):
    - 8 original contextual scenes (see the blueprint), age-adapted, with answers checked on the server.
    - Screens personal information in descriptions.
    - Records evidence in `meaning`, `grammar_sentences` and `usage`.
    - Rewards once per scene per day.
- **Integration:**
    - recommendations ("Explore something new" rotation, plus minutes and done status);
    - passport stamps (Scene Explorer, World of Words);
    - dashboard module, Me page and Notebook links;
    - music theme.
- **Content Studio** shows candidate counts by source and labels them "not endorsed by Cambridge".

### Files

- **Added:**
    - `src/lib/scenes.ts`
    - `src/app/world/word-scenes/**`
    - `src/app/api/word-scenes/[slug]/route.ts`
    - `src/server/content/cambridge-candidates.ts`
    - `src/server/content/pronunciation.ts`
    - `tests/scenes.test.ts`
    - `tests/qa-cambridge.mjs`
    - `scripts/cambridge/*` (the parsers, analysis, deliverable builder and pronunciation generator; reproducible)
- **Edited:**
    - `db/schema.sql`
    - `src/server/migrate.ts`
    - `src/server/vocab.ts`
    - `src/app/world/notebook/*`
    - `src/server/recommend.ts`
    - `src/server/passport.ts`
    - `src/components/world/Adventure.tsx`
    - `src/app/world/me/page.tsx`
    - `src/lib/audio/music.ts`
    - `src/app/admin/(panel)/content/page.tsx`

## 3. What was preserved

All of the following are unchanged:

- word IDs, child progress, mastery status, Leitner boxes and due dates;
- the five-new-words-per-day limit (tested);
- revision kept separate from new words;
- mastery based on quest and revision evidence only;
- XP + VIBE COINS as the only currencies;
- the seven content gates and mandatory human approval;
- the existing vocabulary module.

Scenes do not add words to a child's vocabulary (tested). The 86 existing words whose band differs from the Cambridge-based suggestion were **not** moved; they are listed for review.

## 4. Validation and test results

| Check | Result |
|---|---|
| `tests/qa-cambridge.mjs` (new) | **20/20 pass**. Covers the queue, provenance label, 5-word rule, IPA, no auto-published words, 8 scenes, age adaptation, answers kept server-side, minimum exploration, personal-information screen, scoring, ledger, once-a-day rewards, alternative word order, scenes adding no new words, parent evidence, passport stamp once, navigation, revision, and authentication. |
| Unit tests (vitest) | **57/57 pass**, including new scene data integrity tests |
| `tests/qa-5m.mjs` | 28/28 pass |
| `tests/qa-lx6.mjs` | 31/31 pass |
| `tests/qa-api.mjs` (production build) | **251 pass, 0 fail, 2 blocked** (live-AI checks; no key in the server environment) |
| Browser (390 px phone) | Full scene flow from explore to result; 0 console errors, no horizontal overflow |
| TypeScript and production build | Clean |
| Deliverable checks | Workbook opens with all 8 sheets; JSON is valid; 520 unique candidate IDs and words; all `not_published` |

## 5. Outstanding tasks (not done; pending review or decision)

1. **Educational review of the 520 candidates**, then run them through Content Studio generation. Each card then goes through the 7 gates and human approval. Until then they are not visible to children.
2. **Categorise 161 recommended candidates** that have no topic category, plus 196 existing uncategorised words.
3. **Author new word sets** for Science, Geography, Environment, Music, Values and Time and Frequency, which the Cambridge references don't cover.
4. **Separate sense records** for the multi-meaning entries as they are enriched.
5. **Teacher review** of the 86 band mismatches and the 39 age-sensitive exclusions.
6. **Commissioned original illustrations** for Word Scenes. The current art is a simple original SVG backdrop with emoji objects.
7. **Pronunciation:**
    - The IPA is US English (CMU). Add a British or Indian English IPA source if required.
    - 38 published words have no verified syllable split.
    - Recorded audio is still TTS: `audio_status = 'tts'`.
8. **Licensing:** confirm the terms before any commercial redistribution of source-derived lists. The internal workbook and JSON are marked "do not redistribute".
9. **Educational review of the eight Word Scenes' text.** It is original PING VIBE writing; it was checked by automated tests but not yet by a teacher.

## 6. Recommended next actions

1. In Admin → Content Studio, generate vocabulary in small batches by band from the queue. Review and publish the best 40–60 per band first.
2. Build the next scenes (School Day, Science Lab, Nature Reserve) to close the critical gaps.
3. Link phrasal verbs to Band 4 reading and Real Life scenarios.
4. Run the paused Phase 1 content generation for stories, grammar and phonics, which can reuse this mapping.
