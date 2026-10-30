# PING VIBE — Gamification Test Report

**Result: 24 / 24 PASS** (GAM-*), with **CON-001…005 (5/5)** and **LOAD-003** for reward integrity under concurrency, and unit tests for the level curve, XP caps and the daily ceiling.

## Economy and progression

| Behaviour | IDs | Result |
|---|---|---|
| Level curve: 250 seeded levels (XP step 120 + 7(n−1)); multi-level jumps grant every reward | GAM-001, unit | PASS |
| Shop: affordable items deduct coins; insufficient coins or level gives a friendly refusal; no duplicate purchase; level-exclusive and crystal items enforced; unknown slug 404 | GAM-002…007 | PASS |
| Avatar: only owned items in the correct slot; off-palette colours rejected; persists | GAM-008…012 | PASS |
| Ledger idempotency: 8 parallel quest completions give exactly one award | CON-001 | PASS |
| No double spend: 5 parallel purchases give one success | CON-003 | PASS |
| One reward from 6 parallel mission claims or 5 parallel Surprise Box opens | CON-002, CON-004 | PASS |
| 30 children × 3 concurrent completions give exactly one award each | LOAD-003 | PASS |
| Admin XP config and daily ceiling persist; invalid config rejected | ADM-015…017 | PASS |

## Missions, bosses, world, pets

| Behaviour | IDs | Result |
|---|---|---|
| Completed daily mission claimable once; unfinished or unknown refused | GAM-020…023 | PASS |
| Boss above the child's level is locked. Easy boss = 6 rounds. **Losing gives practice XP and no penalty.** | GAM-030…032 | PASS |
| Treasure claims only at unlocked treasure locations | GAM-033/034 | PASS |
| Pets unlock from learning (Hoot at 10 words), not purchase. No neglect mechanics. | GAM-035/036 | PASS |
| Unlock notifications created | GAM-037 | PASS |
| Events create their mission and card automatically | ADM-019/020 | PASS |

## Healthy-engagement rules verified

- **No loss-based streaks.** The "learning rhythm" never resets to zero, and the calendar never marks a missed day as failed (code review plus calendar page sweep).
- **Daily caps.** A per-source daily cap and a global daily XP ceiling (app_settings) stop reward farming. Repeat reading and game rewards are capped (LRN-053, LRN-072).
- **Break reminders** and a session timer are part of the child UI. They were checked in a page review, not by automation.
- **Collectible cards** are earned through learning and are never bought with money or random paid draws. There is no gambling mechanic.
- **No child-to-child communication.** The only social feature is a parent-initiated family challenge (PAR-005/006).

## Defects

- **BUG-005 (Medium):** boss and kingdom unlock levels could be reached in the first session. The thresholds were raised to give multi-week progression (word-thief 1, reading-mystery 2, grammar-boss 4, story-challenge 4, pronunciation-champion 6, vocabulary-championship 8; Grammar Galaxy 3, Speaking Mountains 5).

## Known limitations

- Economy balance (how fast coins accumulate compared with shop prices across 365 days) has been modelled but not validated with real usage. The pilot should collect this data.
- Visual polish of celebrations on low-end Android devices has not been measured.
