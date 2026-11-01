# PING VIBE: Vocabulary Pilot v2 (corrected cards)

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> Manual corrections made from the recorded review notes. **No API calls.** Not educator-approved, not published, not imported.

All 30 failed cards were corrected by hand from the recorded review notes.

- **All 40 cards now pass every deterministic gate** (1 safety, 2 grade readability, 3 grammar and mechanics, 5 duplicates, 6 difficulty).
- The readability gate was not weakened: the Band 1 and Band 2 wording was simplified until each card passed on its own merits.
- AI gates 4 and 7 and the AI accuracy checks **could not be re-run without API calls**. For the 30 edited cards they were replaced by a manual re-review against every recorded note.
- Those 30 cards are labelled **"Corrected – awaiting AI re-review and human approval"**.
- The 10 cards that passed v1 are unchanged and keep **"Validated – awaiting human approval"**.

The original pilot files (`pilot/PINGVIBE_Vocab_Pilot_Cards.*`) are unchanged; their checksums match.

## Recheck of all 40 cards

| Check | Pass | Fail | How it was checked |
|---|---|---|---|
| 1 Safety moderation | 40 | 0 | Automatic, local |
| 2 Grade readability (Band 1 ≤ 3.5, Band 2 ≤ 5, Band 3 ≤ 7.5, Band 4 ≤ 11) | 40 | 0 | Automatic, local; same formula and thresholds as before |
| 3 Grammar and mechanics (the example sentence contains the word) | 40 | 0 | Automatic, local |
| 5 Duplicate detection | 40 | 0 | Automatic, local |
| 6 Difficulty validation | 40 | 0 | Automatic, local |
| 4 and 7 AI review, plus meaning, synonym/antonym and usage accuracy | 10 passed in v1 (unchanged) | n/a | **30 edited cards not re-run** (no API); manually re-reviewed instead |

Band 1 readability after the edits:

| Word | Grade |
|---|---|
| seat | 1.0 |
| market | 2.1 |
| doctor | 2.3 |
| driver | 2.4 |
| shower | 2.6 |
| daughter | 2.6 |
| neck | 3.2 |
| mountain | 3.3 |
| farm | 3.4 |
| bottle | 3.5 |

The limit is 3.5.

## Corrections made

- **Synonyms and antonyms: only genuine equivalents or opposites for the card's meaning; otherwise left blank.**
    - Removed:
        - doctor ↔ patient
        - driver ↔ passenger
        - seat ↔ chair
        - website ↔ web page
        - straight ↔ crooked/curved (adjectives on an adverb card)
        - drop ↔ release
        - hurt ↔ pain, heal, feel better
        - holiday ↔ trip
        - temperature ↔ heat
        - comic ↔ cartoon strip
        - information ↔ knowledge
        - history ↔ the past, future
        - computer ↔ PC
        - manager ↔ worker, boss, head
        - scene ↔ part, episode
        - spend ↔ pay, use, earn
        - direction ↔ route
        - museum ↔ gallery
        - translate ↔ interpret, convert, render
        - recover ↔ heal, improve, weaken
        - delete ↔ cancel, save
        - satisfied ↔ happy, fulfilled, unhappy
        - forgive ↔ let go, blame
        - succeed ↔ achieve, accomplish, manage, win, lose
        - realise ↔ notice, recognise, ignore
        - video ↔ film, clip, recording
    - Gender pairs (daughter ↔ son) were moved to related words for consistency.
    - Removed items that are still useful are kept under **related words**, for example patient, passenger, web page, PC, trip and earn.
- **Grammar:**
    - shower: "…now. I am all sweaty!"
    - direction: "In which direction is the railway station?"
    - succeed: "finally succeeded in playing…"
    - realise: "I've only just realised…"
    - drop: "Oops! I dropped my pencil under the desk."
    - scene: "act out a scene"
- **Meaning:**
    - drop: no contradiction about accidental versus deliberate.
    - hurt: covers both "is painful" and "cause pain".
    - realise: "often suddenly".
    - spend: adds the time sense.
    - recover: adds "get back something lost".
    - delete: the meaning is wider.
    - computer: "Many computers have…".
    - information: notes that it has no plural ("some information").
- **Indian/British usage:**
    - recover: "stayed **at** home".
    - satisfied: "**making** the rangoli".
    - holiday: "vacation (American English)" is labelled, and "working day" replaces "workday".
- **Inclusive:**
    - **daughter:** the meaning and illustration fit one-parent, two-parent and grandparent families, and the example works whoever says it.
    - **translate:** "home language, English and other Indian languages", so it isn't Hindi-centric.
- **Images:**
    - market: 🛒 replaced by **🧺**, a basket that fits an open-air market.
    - holiday: emoji changed to 🚆 to match the train scene.
    - **video:** the butterfly emerges from its **chrysalis**.
- **Other fixes:**
    - Spelling guidance corrected: delete has two syllables; forgive's past tense and past participle; translate; video; recover.
    - Plural-only word-family entries are labelled "(plural)".
    - The outdated "videotape" was removed.
    - "comical (= funny)" is annotated.
    - succeed's difficulty changed to Intermediate.
    - history adds G5.
    - video's category changed to Technology.
- **Pronunciation:** IPA for all 40 words, labelled "CMU Pronouncing Dictionary — US English pronunciation".
- **Hold items:** beef and every other Hold candidate stay excluded; none appear among the 40 cards.

## Remaining issues (for human or AI re-review)

1. **AI gates 4 and 7 and the accuracy checks have not been re-run** on the 30 corrected cards. A per-card AI re-review would cost about $0.45–$0.50 (≈ ₹43–48), based on v1 usage.
2. **Category fit is limited by the taxonomy:**
    - straight stays "Places"; the taxonomy has no Directions category.
    - manager stays "Community Helpers"; there is no Jobs category.
    - Adding categories is a CMS decision.
3. **Near-equivalents kept, worth a teacher's check:**
    - hurt ↔ ache
    - satisfied ↔ disappointed (a near-opposite)
    - forgive ↔ excuse
    - drop ↔ pick up
    - holiday ↔ break, vacation
    - realise ↔ understand
4. **Pronunciation is US English (CMU).** A British or Indian English IPA source would be needed if required.
5. **Assets:** audio and illustrations are still "to be produced".

## Files

New files are in `deliverables/phase-1-content/pilot/v2/`:

- `PINGVIBE_Vocab_Pilot_Cards_v2.xlsx`: sheets Cards v2 (40), Recheck (40) and Summary.
- `PINGVIBE_Vocab_Pilot_Cards_v2.csv` and `.json`: the corrected cards with per-gate results, a change list, the status and the disclaimer.
- `PINGVIBE_Vocab_Pilot_v2_Report.md`: this report.

**Script:** `scripts/phase1/correct_pilot.py`, which re-creates v2 from the original pilot JSON with no API calls.
