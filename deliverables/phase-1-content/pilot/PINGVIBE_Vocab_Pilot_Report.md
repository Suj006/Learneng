# PING VIBE: Phase 1 Vocabulary Pilot, results

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> These are AI-generated drafts checked by AI-assisted validation. They are not educator-approved, not published and not imported.

Generated 1 November 2026 under the approved plan: vocabulary cards only, with a per-card AI review.

**Result:** 40 cards generated. **10 passed every gate and accuracy check** ("Validated – awaiting human approval"); **30 are "Draft – needs fixes"**, with the specific issue and a suggested fix recorded for each.

**Total API cost:** about **$0.98 (≈ ₹94)**, within the approved estimate.

## API usage (actual, from each response's `usage`)

| Step | Calls | Model | Input tokens | Output tokens | Cost |
|---|---|---|---|---|---|
| Card generation | 4 (one per band) | claude-opus-5-5 | 8,393 | 15,890 | $0.35 (≈ ₹34) |
| Per-card AI review | 40 | claude-opus-5-5 | 46,934 | 22,249 | $0.63 (≈ ₹61) |
| **Total** | **44** | | **55,327** | **38,139** | **$0.98 (≈ ₹94)** |

- All 44 calls completed normally.
- There were no refusals, so the fallback model was never used.
- There were no errors or retries.
- INR is at ₹96 per US$1. Bank rate, forex markup and taxes are not included.

## Results by band

| Band | Validated – awaiting human approval | Draft – needs fixes |
|---|---|---|
| 1 (Pre-KG–UKG) | 4: neck, farm, mountain, bottle | 6 |
| 2 (Grades 1–2) | 1: library | 9 |
| 3 (Grades 3–4) | 2: minute, material | 8 |
| 4 (Grades 5–7) | 3: communicate, breathe, challenging | 7 |
| **All** | **10** | **30** |

## What failed and why (a card can fail more than one check)

| Check | Failures | Typical issue |
|---|---|---|
| Synonyms, antonyms and word-family accuracy (AI) | 22 | Related words listed as opposites or synonyms: doctor ↔ patient, driver ↔ passenger, website ↔ web page, seat ↔ chair, delete ↔ save/cancel, holiday ↔ trip, temperature ↔ heat |
| Gate 2: grade readability | 12 | The Flesch-Kincaid formula on short text is very strict, especially Band 1's limit of grade 3.5. Most of these cards read naturally, but simpler wording is advised. |
| Gate 4: independent spelling and grammar review (AI) | 4 | A comma splice (shower); "I just realise now" (realise); "Which direction is the railway station?" (direction); a redundant "managed to succeed" (succeed) |
| Meaning accuracy (AI) | 3 | drop ("always accidental" contradiction), hurt (imprecise sense), realise ("suddenly") |
| Indian/British usage (AI) | 2 | recover ("stayed home" is American; British/Indian English says "stayed at home"); satisfied ("decorating the rangoli" should be "making/drawing the rangoli") |
| Gates 1, 3, 5, 6, 7 | 0 | All passed: safety, mechanics, example contains the word, duplicates, difficulty, age suitability |

The reviewer also raised some inclusive-language points:

- **daughter:** the meaning implies two parents; it should fit all family types.
- **market:** the 🛒 emoji shows a supermarket trolley, not an open-air market.
- **video:** the illustration brief says a butterfly comes from a "cocoon"; it should be a chrysalis.

## Other data

- **IPA:** all 40 words have IPA from the CMU Pronouncing Dictionary (US English).
- **Syllable breaks:** recorded only where the hyphenation agrees with the CMU syllable count.
- **Audio and illustrations:** marked "to be produced". No audio or image files were created or claimed.

## Files

All are in `deliverables/phase-1-content/pilot/`:

- `PINGVIBE_Vocab_Pilot_Cards.xlsx`: sheets Cards (40), Validation, and Summary (with cost).
- `PINGVIBE_Vocab_Pilot_Cards.csv` and `.json`: the same 40 cards with gate results, issues, suggested fixes and status.
- `PINGVIBE_Vocab_Pilot_Report.md`: this report.

The raw outputs are in `deliverables/phase-1-content/_work/gen/vocab_pilot/` and `vocab_pilot_review/`. The scripts are `scripts/phase1/generate.ts` (`vocab_pilot` mode), `review_pilot.ts` and `export_pilot.py`.

## Not done (by design)

- No import into `vocabulary_master` or `vocabulary_candidates`.
- Nothing published.
- No app data changed.
- No cards were regenerated or auto-corrected.
- The original mapping workbook and JSON, and the v1/v2 review files, are unchanged.

## Suggested next steps (need your decision)

1. **Educator review** of the 10 validated cards, then approval or edits.
2. **Fix the 30 drafts.** Either:
    - edit them by hand using the recorded suggested fixes (no API cost); or
    - approve a targeted regeneration of only those fields, estimated at about $0.30–$0.60 (≈ ₹29–58) including a re-review.
3. **Tighten the generation prompt before scaling up.** Ask for "true synonyms/antonyms only; leave empty if none" and simpler wording for Band 1. This is the cause of most failures.
