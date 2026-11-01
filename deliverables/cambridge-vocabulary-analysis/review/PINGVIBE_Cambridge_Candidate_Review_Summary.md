# PING VIBE: Cambridge Candidate Review (AI-assisted triage)

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> **AI-assisted curriculum triage. This is not educator certification, not alignment with CBSE, ICSE, state or any other board syllabus, and not permission to publish.**

Reviewed 1 November 2026 for Indian school-age English learners (Pre-KG to Grade 7). The source was the original `PINGVIBE_Cambridge_Vocabulary_Mapping.json`, read only; the original workbook and JSON are unchanged.

Of the 520 recommended candidates:

- **367 Use**
- **120 Revise**
- **33 Hold**
- **148 flagged for human confirmation** (every Hold, band change, sense choice, sensitive item and uncertain category)

"Use" means suitable as framed. Each card must still be written originally, pass the seven content gates and be approved by a person.

## Decisions by band

| Band | Grades | Use | Revise | Hold | Total | Needs human confirmation |
|---|---|---|---|---|---|---|
| 1 | Pre-KG–UKG | 33 | 7 | 0 | 40 | 6 |
| 2 | Grades 1–2 | 136 | 24 | 20 | 180 | 44 |
| 3 | Grades 3–4 | 116 | 28 | 6 | 150 | 32 |
| 4 | Grades 5–7 | 82 | 61 | 7 | 150 | 66 |
| **All** | | **367** | **120** | **33** | **520** | **148** |

Band 2 has most of the Holds: the 9 personal names and 11 function words from the Movers list. Band 4 has most of the Revises: phrasal verbs that need one clear meaning, and sensitive contexts.

## Highest-priority corrections

1. **Personal names: Hold (9).** John, Paul, Peter, Jack, Mary, Jim, Charlie, Jane and Fred are not vocabulary targets. They may stay as character names in stories.
2. **Missing part of speech (6).** Correct these before any lesson is created:
    - studies, instructions: plural noun
    - opening hours: plural noun phrase, category Time
    - clothes: plural-only noun, Band 2
    - facilities: plural noun, category Places
    - jeans: plural-only noun, Band 2
3. **Sensitive contexts:**
    - **fat:** only for food, animals or objects; never to label or judge people.
    - **beef:** neutral, respectful contexts only; never a default food, since students' diets and backgrounds differ; educator sign-off required.
    - **Respectful framing needed:** disabled (person-first language), unemployed, soldier, politician, naughty (characters only, never real children), operation.
    - **Use one sense only:** knock down, hold up and put down.
4. **Hold: outside child content rules or low value.**
    - Content rules or crime: romantic, soap opera, break in.
    - Adult concepts: contract, duty-free.
    - Dated: chat show, put through, engaged (the British telephone sense).
    - Vague meaning: keep in.
5. **Indian/British primary forms:**
    - lift is primary and elevator a variant (no separate card);
    - film over movie;
    - cinema over movie theater (Hold as a separate card);
    - rupee/paise over penny and cent (both Hold);
    - businessperson replaces businessman in new material;
    - actor over actress;
    - enquiry over inquiry;
    - ring up and ring back taught as synonyms of call and call back.
6. **One meaning per card (42 entries flagged).** Examples:
    - bank: money or river bank;
    - bat: the animal in the source scene, or a cricket bat (very relevant in India);
    - present: gift, now, or to present;
    - also back, band, well, mean, change, second, case, fair, text, web, pin, application, apply, square, company, admission.
7. **Band corrections (43, teacher confirmation needed).** Frequency-based banding put everyday classroom words too high.
    - Move to Band 2: absent (used in daily roll call), o'clock, jeans, clothes, hobby, poem, cartoon, dancer, sit down.
    - Move to Band 3: noon, diary, camping, musician, keyboard, freezing, chess, scientist, detective, exam and others.
    - Move up to Band 4 (adult workplace and finance words wrongly in Band 3): salary, wage, employee, employment, candidate, quit, credit card, luxury, economics, apply, application, boss, blog, immigration.
8. **Categories.**
    - 161 entries had no category. 114 are now categorised where the answer was clear (days of the week → Time; always/never/often → Time and Frequency; aunt/uncle → Relationships; many phrasal verbs → Actions). **47 are deliberately left blank** for a person to decide, for example thing, age, noise, dream, treasure, fair, spare and involve.
    - Obvious errors fixed, for example:
        - shark, dolphin, kangaroo → Animals
        - pirate, clown → Arts and Culture
        - restaurant, swimming pool → Places
        - gallery, fiction, sculpture → Arts and Culture
        - dear → Communication
        - city → Places
        - country, world → Geography
    - **192 category changes in total**, each listed in the Category Review sheet.
9. **Overlaps checked by hand against existing records:**
    - comic book: merge into comic.
    - look at: teach within the existing word look; Hold as a separate card.
    - come on / come on!: merge.
    - check-in / check in: one card.
    - celebrity–celebration: a **false** word-family link, removed.
    - Kept as linked word families: quickly (quick), slowly (slow), exciting (excited).
    - Distinct multi-word items kept: phrasal verbs with their own meanings (look up, fill in, grow up, look forward to and others) and 13 compound nouns (primary school, police officer, seat belt and others).
10. **Data error:** "silver" was tagged as an adverb; correct it to adjective/noun.

**Other notes:**

- Function words (all, more, how, when, why and others) are held as vocabulary cards and routed to Grammar Galaxy and reading.
- Number and ordinal words (first, third, hundred) belong in a numbers set.
- Online-safety framing is required for password, chat, blog, address (moved to Band 2) and pin.
- stranger is paired with safety guidance.

## Files

All new files are in `deliverables/cambridge-vocabulary-analysis/review/`:

| File | Contents |
|---|---|
| `PINGVIBE_Cambridge_Candidate_Review_AI_Triage.xlsx` | Sheets: README, Candidate Review (520 rows), Summary by Band, Priority Corrections, Category Review, Overlap Review, Limitations. The disclaimer is at the top of every sheet. |
| `PINGVIBE_Cambridge_Candidate_Review_AI_Triage.csv` | The same 520 candidate-level rows (UTF-8 with BOM, so Excel opens it correctly); the disclaimer is in every row |
| `PINGVIBE_Cambridge_Candidate_Review_Summary.md` | This summary |

**Columns kept from the original:** candidate ID, word, band, grade range, part of speech, category, provenance (sources and page), publication status, linked existing word and link type.

**Columns added:** review decision, reason, recommended action, reviewed category, suggested band, needs human confirmation, flags and review type.

**Script:** `scripts/cambridge/review_candidates.py`, which re-creates the review copy from the original JSON.

## Limitations

- This is **AI-assisted curriculum triage**, based on general knowledge of Indian school English and PING VIBE's content rules. **No qualified educator has checked it yet.**
- No CBSE, ICSE, state board or other syllabus documents were consulted, and **no syllabus alignment is claimed**.
- A **"Use" decision is not approval or permission to publish.** Publication still needs original authoring, the seven content gates and human approval.
- Band, sense and category suggestions are recommendations for teacher confirmation. Sensitivity notes are cautious defaults that schools and families may adapt.
- **Nothing was imported, published or changed in the application or database.** The original mapping workbook and JSON were not edited.
