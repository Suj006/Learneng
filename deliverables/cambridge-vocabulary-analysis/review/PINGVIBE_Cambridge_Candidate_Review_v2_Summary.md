# PING VIBE: Cambridge Candidate Review, version 2 (second pass)

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> AI-assisted curriculum triage (second pass). This is not educator certification, not board-syllabus alignment, and not permission to publish.

This pass covers all 148 rows that version 1 marked "Needs a person to confirm". Each now has a reasoned recommendation and a single target meaning; where it applies, a final band, a category or a part-of-speech correction is recorded too.

| Scope | Use | Revise | Hold | Total |
|---|---|---|---|---|
| Second pass (148 rows) | 101 | 5 | 42 | 148 |
| Combined status (all 520) | 455 | 23 | 42 | 520 |

Second-pass details:

- 147 rows are resolved; one stays an unresolved Hold.
- 48 rows have a final band that differs from the original band.
- 18 rows carry a part-of-speech correction.

## Combined status by original band

| Band | Use | Revise | Hold | Total |
|---|---|---|---|---|
| 1 (Pre-KG–UKG) | 39 | 1 | 0 | 40 |
| 2 (Grades 1–2) | 146 | 10 | 24 | 180 |
| 3 (Grades 3–4) | 141 | 3 | 6 | 150 |
| 4 (Grades 5–7) | 129 | 9 | 12 | 150 |

## What the second pass decided

- **One meaning per card:**
    - back: body part
    - present: gift
    - bank: money, Band 2
    - band: music, Band 2
    - bat: cricket bat
    - change: verb
    - mean: verb
    - second: time unit
    - well: health
    - fair: just or equal
    - web: spider web
    - text: a reading text
    - apply: glue, cream or a rule, Band 3
    - application: software, Band 4
    - admission: school admission
    - square: shape
- **Phrasal verbs, one child-relevant meaning each:**
    - get down: from the bus (common in Indian English)
    - put up: your hand
    - work out: the sum
    - give way: road sign
    - go on: continue
    - go off: an alarm
    - turn up: the volume
    - hold up: a delay
    - give out: distribute
    - be over: finished
    - call for: require
    - base on: taught as "based on"
- **Accepted band moves:** absent, o'clock, poem, hobby, dancer, cartoon, jeans, clothes, sit down and stranger go to Band 2. diary, exam, noon, chess and others go to Band 3. Adult workplace and finance words go to Band 4.
- **Part-of-speech corrections:**
    - studies, facilities, instructions: plural noun
    - clothes, jeans: plural-only noun
    - opening hours: plural noun phrase
    - silver: adjective and noun
- **Revise, with a constraint (5):**
    - fat: food, animals and objects only, never people.
    - naughty: story characters and animals only.
    - businessman: author the card as businessperson.
    - inquiry: author the headword as enquiry.
    - disabled: teach "persons with disabilities" (the wording of India's RPwD Act 2016) and "accessible".
- **Resolved Holds (41):**
    - 9 personal names, which may stay as story characters.
    - 11 function or question words, which go to Grammar Galaxy.
    - Content rules or crime: romantic, soap opera, break in.
    - Adult concepts: contract, duty-free.
    - Dated: chat show, put through, engaged.
    - Low local relevance: penny, cent, wash up.
    - Recorded as variants instead of separate cards: elevator (on lift), movie (on film), movie theater (on cinema), come on (merged with "come on!").
    - Low value or ambiguous: look at, keep in, call in, go for, thing, case (teach "pencil case" instead).

## Unresolved Hold (1)

| Word | Why it is on Hold | Missing information |
|---|---|---|
| beef | Food word with strong dietary and cultural sensitivity in India | A school or parent-community policy on meat and food words; whether a balanced, respectful food set (vegetarian and non-vegetarian items) exists; and an educator's sign-off on context. |

## Files (new, versioned)

These are added to `deliverables/cambridge-vocabulary-analysis/review/`:

| File | Contents |
|---|---|
| `PINGVIBE_Cambridge_Candidate_Review_v2_SecondPass.xlsx` | Sheets: README, Second Pass (148), Combined Status (520), Summary. The disclaimer is at the top of every sheet. |
| `PINGVIBE_Cambridge_Candidate_Review_v2_SecondPass.csv` | The 148 second-pass rows, keeping the v1 decision alongside the v2 decision; the disclaimer is in every row |
| `PINGVIBE_Cambridge_Candidate_Review_v2_Summary.md` | This summary |

**Script:** `scripts/cambridge/review_second_pass.py`, which re-creates version 2 from the v1 CSV.

## Limitations

- This is AI-assisted triage, not an educator's certification and not alignment with any board syllabus.
- "Use" is not approval. Every card still needs original authoring, the seven content gates, and human approval before it is published.
- The original mapping workbook and JSON, and the v1 review files, were not changed.
- Nothing was imported or published, and no application code or data was changed.
