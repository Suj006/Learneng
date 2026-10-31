# PING VIBE — Learning Experience 5.0 + Homepage 2.0/3.0: Report (31 Oct 2026)

Everything marked done was tested in a real browser and/or the API suite on a production build. Items not done are listed in section 8, not reported as complete.

## 1. Issues found and root causes

| Issue | Root cause | Fix |
|---|---|---|
| Word Detective not working | `useRounds` re-shuffled whenever it received a new array. Word Detective passed a freshly filtered array on every render, so **each letter guess silently swapped the secret word** | Rounds chosen once per game. This protects all 7 games that use it |
| Games moved on too fast after mistakes | Multiple-choice and picture games advanced on a timer (650–900 ms) whether right or wrong | Wrong answers show a review panel and wait for **Continue** |
| 10 words a day | Hard-coded `NEW_WORDS_PER_DAY = 10`; the admin setting existed but wasn't used; quiz rounds assumed 10 | Count comes from `grade_config.new_words_per_day`, now 5 for every grade; rounds scale |
| Daily mission "Discover 10 new words" | Impossible to complete at 5 words a day | Target is now 5 |
| First pet at 10 words | Would move from day 1 to day 2 | Hoot unlocks at 5 words |
| "Rewards don't appear on my avatar" | Buying, owning, equipping, saving and drawing all worked (verified). After buying, the child landed on the studio's first tab and had to hunt for the item | **Wear it now** opens the right tab with the item tried on; Reset to default added |
| Confusing currencies | Crystals alongside coins | XP + VIBE COINS only (section 3) |
| Random "Explorer name" used as an identity | Login handle shown as the child's name | Called the **login name** (it never contains the real name, for privacy); children are greeted by their real name |
| Homepage errors | None found: 0 console errors and 0 failed requests, logged out and logged in. One real flaw: a duplicated "VIBE COINS" row | Fixed |

## 2. Daily learning

- **5 new words a day** for every grade (Admin → Grades). Revision words are tracked separately.
- **Daily missions per grade:** Pre-KG–G1: 2 · G2–G3: 3 · G4–G5: 4 · G6–G7: 5 (Admin → Grades, `daily_missions`).
  - Each day is fitted to the grade's count using the brief's mix: vocabulary first, then rotating grammar, sentence, reading, writing, speaking and games.
  - "Today's plan" is complete when all missions are done. The journey still advances once the word quest is done, so no child is blocked.
  - Verified for 8 grades (LX5-* checks).

## 3. Rewards, currency, avatar

- **Currencies:** XP ("Your learning progress") and VIBE COINS ("Your reward shopping power").
  - Crystal rewards pay out as coins (1 crystal = 25 coins) inside the single reward function, so missions, treasure and bosses all follow.
  - Crystal-priced items cost coins. Existing crystal balances and history are kept untouched.
- **Celebrations:** MAX says "Awesome! You earned X XP and Y VIBE COINS!".
- **Rewards to avatar:** "Wear it now" opens the right tab with the item tried on, with a preview notice and Reset to default. Duplicate-purchase protection is unchanged (one success, then a friendly 400).

## 4. Mistakes and feedback

- **MistakeReview** (all multiple-choice, picture and spelling games) shows:
  - your answer, crossed out
  - the correct answer
  - an explanation and LEXI's line
  - 🔊 Hear it
  - Continue
- **Spelling tips** name the actual mistake, for example "Remember: there's no extra 'l' in 'beautiful'" (unit tested).
- **Age-appropriate wording:** "Almost! 🌟" (Pre-KG–UKG) → "Not quite." (Grades 5–7). Character cheers also vary by age band, for example "Yay! You found it!" versus "Excellent work. Your vocabulary is growing."
- **My Learning Discoveries** (`/world/discoveries`, private to the child) shows:
  - words to practise, with a Practise button
  - sentences GRAMMY improved (before and after, with the reason)
  - grammar learned or still practising

## 5. Pronunciation

- **Word cards** now have 🔊 Listen, 🐢 Slowly (said in parts) and a "Sound it out" split. The split is a rule-based reading aid, labelled as such.
- **Already there:** phonetic spelling, example sentence audio and optional microphone practice.

## 6. Homepage Experience 2.0 + 3.0

| Feature | Status |
|---|---|
| Animated fantasy hero (clouds, floating islands, rainbow pathway, glowing portal, castle, stars; CSS/SVG, lighter on phones, still with reduced motion) | ✅ |
| Official logo unchanged; "Your World. Your Words. Your Vibe."; START YOUR ADVENTURE (portal transition, skippable); EXPLORE THE WORLD; Login / Sign up | ✅ Main button in the first screen at 1366×768 |
| Cinematic intro (~4 s): star, rainbow, characters, logo, tagline | ✅ Once per device, Skip, skipped with reduced motion |
| TURN ON THE MAGIC! music | ✅ Never autoplays; stops when leaving the page |
| Interactive kingdoms (character, activities, Explore) | ✅ 6 kingdoms |
| Meet your adventure friends (tap: animated greeting, abilities, optional voice) | ✅ |
| Word Universe: Word of the Day by level, floating words, Listen / Slowly / In a sentence, 30-second hidden-word puzzle | ✅ Real published vocabulary |
| Story of the Day (validated stories, listen, read) | ✅ |
| Daily mystery treasure | ✅ Uses the existing Surprise Box (opens only after the day's word quest; no free rewards) |
| Signed-in welcome ("Welcome back, Jia!", level, words, missions, Continue) | ✅ |
| Themes section; parents; final "JOIN PING VIBE" | ✅ |

**Four new colour themes:** Forest Adventure, Coral Carnival, Starlight Dream and Arctic Wonderland. All pass the WCAG AA contrast tests.

## 7. Test results (production build)

- **Unit tests:** 41/41.
- **API suite:** 253 checks: 251 pass, 0 fail, 2 blocked (the Claude tests; that run had no key). Includes LX5 checks for 8 grades, the public Word of the Day API and Discoveries privacy.
- **Browser journey** (sign-up → verify → consent → welcome → exactly 5 word cards → quiz → celebration → dashboard): 8/8.
- **Homepage browser tests** at 390 and 1366 px, logged out and logged in: every interaction works, with 0 errors and 0 sideways overflow. Accessibility checks pass on `/`.

## 8. Not done in this cycle (honest list)

| Requested | Status |
|---|---|
| 15 new games (Silly Sentence Machine, Alien Word Rescue, Word Chef, Grammar Monster, Rhyme Time Rocket, …) | **Not built.** Existing games fixed and given mistake review |
| Phonics & Sound Valley module and kingdom | **Not built** (needs a phonics content set). Not advertised on the homepage |
| Large story library expansion, branching stories, read-along highlighting, text size | **Not done.** 6 validated stories remain |
| Adventure Map / kingdom redesign as 3D-style art | **Not done.** Kingdom art fixed earlier, but no new 3D artwork |
| Extra avatar slots (headwear, glasses, neck, back, companions) | **Not done.** Needs new layered artwork |
| AI story generation pipeline | Not added (content stays validated and curated) |
| Admin config for story categories, game availability, character feedback | Not added (word count, missions, themes and rewards are admin-configurable) |

## 9. External configuration

- **Anthropic** (`PINGVIBE_ANTHROPIC_API_KEY`): AI writing feedback and LEXI.
- **Azure Speech:** optional neural voices.
- **Resend:** real e-mail.
