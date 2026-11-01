# PING VIBE: 10-day local-test vocabulary pack (batch B0002)

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> **Local test only.** Every card is `local-test/in-review`, **not approved** and **not published**. Nothing was imported into any portal or production system, deployed, committed or pushed.

## Scope

| Grade | Band | Published words (days 1–6) | New cards (days 8–10) | Unique words in 10 days |
|---|---|---|---|---|
| UKG | 1 | 30 | 15 | 45 |
| G1 | 2 | 30 | 15 | 45 |
| G4 | 3 | 30 | 15 | 45 |
| G5 | 4 | 30 | 15 | 45 |

- **Daily limit:** 5 new words per new-word day.
- **Day 7:** a review/test day with no new words. It reviews only days 1–6 words.
- **Pilot cards:** the 40 B0001 pilot cards are not counted.
- **Content type:** vocabulary only. No phonics, audio, games, stories or other content.

## Final words

| Grade | New cards (B0002) |
|---|---|
| UKG (Band 1) | back, field, floor, ground, lake, parent, plant, present, square, top, town, grown-up, shoulder, station, weekend |
| G1 (Band 2) | band, bat, kitten, nurse, panda, party, puppy, soup, awake, cage, sail, scarf, second, stomach, whale |
| G4 (Band 3) | artist, camera, captain, cash, closed, evening, fit, guitar, sick, equipment, interview, invention, professor, scientist, technology |
| G5 (Band 4) | cross out, get along, grow up, hand in, install, look forward to, mild, password, poet, spare, tune, upload, convince, intelligent, sculpture |

### How the words were chosen
- **Eligibility:** all are Cambridge **Use** candidates at their reviewed v2 band. Each card teaches one stated sense, for example bat = cricket bat and present = a gift.
- **Excluded:** Hold, Revise, published words, queued PING VIBE words, B0001 pilot words and exact duplicates.
- **"check in"** was replaced because it is too close to the Revise item "check-in".
- **Band 4 (G5):** the adult-focused choices were replaced with child-relevant Use words. These were employment, immigration, economics, candidate, boss, application, operation, credit card and luxury.
- **Flagged overlaps:** all seven were replaced: farmer, sunny, work, meaning, check in, operation and employment.
- **Registry pre-check on the final list:** 60 clear, 0 flagged, 0 excluded (`content-registry/checks/P0003-precheck.json`). The 20 reserve words were also pre-checked and all were clear.

## Validation

Each card ran through the following:
1. **The seven content gates:** safety, grade readability, mechanics, AI spelling and grammar, registry duplicate check, difficulty, and AI age suitability.
2. **Per-card AI checks:** meaning accuracy, synonyms/antonyms/word family accuracy, and Indian/British usage.

| Result | Cards |
|---|---|
| Passed every gate and check on the first review | 46 |
| Passed after 1 targeted fix and a full recheck | 14: ground, parent, plant, grown-up, weekend, kitten, nurse, soup, sail, artist, camera, interview, look forward to, mild |
| Unfixable, so replaced | 1: **university** (G4). It failed Band 3 readability in all three rounds and was replaced with the pre-checked reserve **artist**, which passed. |
| **Final: all 60 pass every gate and AI check** | **60** |

- **What failed on the first review:** grade readability (7), AI spelling and grammar (10), AI age suitability (7), synonym/antonym accuracy (10), Indian/British usage (9) and meaning accuracy (7). These counts include the university card.
- **Pronunciation:** all 60 cards have IPA from the CMU Pronouncing Dictionary, labelled US English.

## Registry

- **B0002:** registered as `B0002-vocab-10day-test-localtest`, 60 word entries.
  - Each entry has a stable ID, sense, band, category, Cambridge candidate ID with provenance, and batch.
  - Each is marked `local-test/in-review`, `approved: false` and `published: false`.
- **Stored cards:** the complete cards are stored once at `content-registry/batches/B0002-vocab-10day-test-localtest/cards.json`, protected by a checksum.
- **Verification:** `verify` reports a valid registry: 102 lines, hash chain intact. B0001 is unchanged.
- **The "university" card** was generated but rejected, so it is not in the registry. It's kept in `_work/state.json` as a failure record.

## API cost (actual, from each response's usage)

| Step | Calls | Cost |
|---|---|---|
| Generation (4 bands + 1 replacement) | 5 | $0.738 (≈ ₹71) |
| Per-card AI reviews and rechecks | 68 | $0.737 (≈ ₹71) |
| Targeted fixes | 16 | $0.398 (≈ ₹38) |
| **Total** | **89** | **$1.872 ≈ ₹180** (cap ₹350, at ₹96/$) |

## Files

**Cards:** `PINGVIBE_Vocab_10Day_Test_Cards.json`, `.csv` and `.xlsx`.
- These are the complete cards with per-gate results.
- The workbook has sheets for the cards, a schedule for each grade, and a summary.

**Schedules:** `PINGVIBE_Vocab_10Day_Test_Schedule.json` and `.csv`.
- **Days 1–6:** the 30 published words, easiest first.
- **Day 7:** review only.
- **Days 8–10:** the 15 new cards.

**Working files:** `_work/state.json` (every version and review round), `_work/cost-ledger.json`, `_work/reserves.json` and `_work/B0002-batch-spec.json`.

**Scripts:**
- `scripts/phase1/vocab_test10.ts`: runs the registry check, generation, the checks, fixes and replacement, under a cost cap.
- `scripts/phase1/export_vocab_test10.py`: produces the export and the schedules.

**Days 8–10 use cards that are not in the portal.** A test learner can only receive them after a person reviews and approves them. Days 1–7 can be tested now with the published words.
