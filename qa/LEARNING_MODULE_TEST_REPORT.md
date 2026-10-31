# PING VIBE — Learning Module Test Report

**Result (API): 79 executed, 77 PASS, 0 FAIL, 2 BLOCKED** (LRN-001…084), plus 6 grade-band checks (GRD-*, all PASS) and unit tests of the engines. Executed with synthetic Explorers across Pre-KG, UKG, Grade 1, Grade 3 and Grade 7.

## Onboarding (assessment removed)

| ID | Check | Result |
|---|---|---|
| LRN-001 | First login goes to the play-based MAX welcome. No placement test exists. | PASS |
| LRN-002/003 | Welcome gift granted exactly once and routed to "Let's discover your first 10 magical words!" | PASS |
| LRN-004 | Daily Adventure renders after onboarding | PASS |
| PAR-002 | Parent report shows "ongoing observations, not exam results" | PASS |

Skill intelligence:
- Unit tests confirm smoothed proficiency (prior 0.6, weight 15).
- No confident band is shown before 15 pieces of evidence, so nothing changes after 1–2 answers.
- Children see only encouraging growth labels.

## Daily Word Quest & spaced repetition

| Behaviour | IDs | Result |
|---|---|---|
| 10 new words with meaning, phonetic, example and emoji; 5 challenge rounds | LRN-010…013 | PASS |
| Grade-appropriate bands (Pre-KG/UKG → 1, G1 → 2, G3 → 3, G7 → 4) | LRN-011, GRD-* | PASS |
| Resume after reload or mid-quest close | LRN-014, LRN-016 | PASS |
| Server-side answer validation; first attempt counts | LRN-017/018 | PASS |
| A typed answer is never wiped when the next question appears (**BUG-026**, found by the browser journey and fixed in the shared `Question` component used by the quest, revision and challenges) | UI-J1-* | PASS |
| Cannot complete before answering; XP scaled by accuracy and awarded once | LRN-015, LRN-019/020 | PASS |
| No mastery on day 1, even with repeated same-day correct answers (Leitner box ≥ 4 across different days) | LRN-021, LRN-023 | PASS |
| Arcade games never grant mastery | LRN-074 | PASS |

## Creative Writing

- Topics, draft save/update, the empty-submit refusal and the 6,000-character limit all pass.
- Evaluation provides a score, corrections with original vs corrected sentences, and encouragement.
- An evaluated piece cannot be edited or resubmitted.
- **LRN-037: BLOCKED.** Claude evaluation was not executed because `ANTHROPIC_API_KEY` is not configured. The rule-based offline evaluator was verified instead, and its output is labelled as offline in the UI. This is **not** evidence that the Claude integration works.
- AI output is schema-validated (zod structured output). Generated *content* never goes live without passing the 7 validation gates and admin approval (ADM-010…013).

## Grammar Galaxy

- 13 topic pages load. Server-side scoring returns 100% when all answers are correct.
- Duplicate and out-of-range exercise indices are rejected, and an unknown topic returns 404.
- The endless drill generators produce valid exercises for 7 kinds.
- **BUG-003** (submission 500 from a smallint parameter type) was found here, fixed and re-tested.

## Reading, Speaking, Listening

- **Reading:** quizzes are scored server-side, and a mismatched answer count is rejected. Reward-locked stories don't send their text. Reading XP is paid once per story.
- **Speaking:** only the accuracy number is stored, never audio. The unsupported-browser fallback is accepted, and an unknown scenario is rejected.
- **Listening:** 8 questions are generated and scored server-side.
- **Not executed:** real microphone recognition quality on devices. Chromium headless has no speech engine, so manual device testing is needed.

## Word Games Arcade

- All 10 game pages load.
- Results award XP and record the best score. Inflated scores are clamped and unknown games are rejected.

## AI companion (LEXI)

- Vocabulary help works in dictionary mode.
- Phone numbers and e-mail addresses are blocked. Unsafe topics, including plural forms after the **BUG-004** fix, are redirected to a trusted adult.
- The companion can be disabled by the parent, and the server enforces this (PAR-004).
- **LRN-084: BLOCKED.** No real Claude response could be tested without a key.

## Curriculum scale (verified against records, not claims)

- `learning_plans` contains 365 days × 10 grades = **3,650 day records**. Each day references real activities from the content library, and generated drills fill the practice slots.
- A new grade added by an admin generates its own 365-day plan (ADM-021).
- 250 seeded levels; admins can append more (ADM-018).

## Known limitations

- Educational quality of the word lists, topics and stories has not been reviewed by a teacher. This needs the **Educational QA sign-off**.
- Speech recognition accuracy varies by browser and accent. Scores are framed as "clarity", never as pass/fail.
