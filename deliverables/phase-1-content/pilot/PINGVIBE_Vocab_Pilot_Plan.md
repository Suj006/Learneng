# PING VIBE: Phase 1 Vocabulary Pilot Plan (awaiting approval)

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**

**Status:** plan only. **No Anthropic API call has been made.** Nothing will be imported or published. Generation starts only after you approve the estimate below.

## 1. Scope

- **What is generated:** vocabulary cards only, 40 words (10 per band). No stories, grammar topics or phonics units.
- **Source:** the version-2 review, "Combined Status (520)" sheet. Only **Use** items are included; every Revise and Hold item is excluded, including beef.
- **Selection rules:**
    1. Use the final v2 band.
    2. The word must have a reviewed category.
    3. Exclude any item that still carries a meaning, sensitivity, safety, overlap, variant, local-relevance or part-of-speech flag.
    4. Allow at most 2 words per category in a band.
    5. Within those rules, pick by hand for concreteness and relevance to Indian learners.
        - Band 1 swaps out the abstract "place" and "message".
        - Band 3 uses "museum" instead of "fit", which has two meanings.
        - Band 4 leaves out "opera" (low local relevance) and favours communication and thinking words such as "translate", which suits multilingual learners.
- **Files:** the list is in `deliverables/phase-1-content/pilot/pilot_words.csv` and `.json`. Each entry keeps the candidate ID, band, grade range, part of speech, category, provenance and `not_published` status.

| Band | Grades | Words |
|---|---|---|
| 1 | Pre-KG–UKG | doctor, driver, neck, market, farm, mountain, bottle, shower, daughter, seat |
| 2 | Grades 1–2 | call, video, website, straight, drop, hurt, library, holiday, temperature, comic |
| 3 | Grades 3–4 | information, history, minute, computer, manager, scene, spend, material, direction, museum |
| 4 | Grades 5–7 | translate, communicate, breathe, recover, delete, satisfied, challenging, forgive, succeed, realise |

## 2. Generation script (inspected)

**Script:** `scripts/phase1/generate.ts`.

**New pilot mode:** `vocab_pilot`. It reads `pilot/pilot_words.json` and writes to `_work/gen/vocab_pilot/`. It is checkpointed: a band already generated is skipped on a re-run. The existing full-worklist `vocab` mode is unchanged and will **not** be used.

| Setting | Value |
|---|---|
| Model | `claude-opus-5-5` (script default; `AI_MODEL` unset) |
| Calls | **4**: one structured-output call per band, 10 cards each |
| Endpoint | `client.beta.messages.parse` with a Zod output schema (structured JSON; no tools) |
| Effort / thinking | `effort: "medium"`; thinking is always on for this model and is billed as output |
| `max_tokens` | 16,000 per call (a ceiling, not the expected usage) |
| Retries | SDK `maxRetries: 3`, used only on errors or timeouts. If no output comes back, the script logs the error; it does not loop. |
| Refusal fallback | `fallbacks: "default"` (server-side fallback beta). Only if the model declines, the request is re-run on a fallback model and billed at that model's rates. |
| Content rules in the prompt | Indian/British English, Indian everyday contexts without stereotypes, one meaning per card, no body or appearance judgements, no caste, religion or diet content, no brands or real people, no IPA (IPA comes from the CMU dictionary locally) |
| Concurrency | 4 calls in parallel or in sequence; this doesn't change cost |

## 3. Cost estimate (Claude Opus 5.5: $4 per million input tokens, $20 per million output tokens)

| Item | Estimate per call | 4 calls |
|---|---|---|
| Input (system + instructions + 10 headwords + output schema) | ~1,200–1,800 tokens | ~5k–7k tokens = **$0.02–$0.03 (≈ ₹2–3)** |
| Output: card JSON (10 cards × ~200–260 tokens) | ~2,000–2,600 tokens | |
| Output: thinking at medium effort | ~1,500–5,000 tokens | |
| Output total | ~3,500–7,600 tokens | ~14k–30k tokens = **$0.28–$0.61 (≈ ₹27–59)** |
| **Expected total** | | **≈ $0.30–$0.65 (≈ ₹29–62)** |
| Hard ceiling (every call hits `max_tokens`, no retries) | 16k output | 64k output + input ≈ **$1.31 (≈ ₹126)** |
| Theoretical worst case (each call fails late and retries 3 times) | | ≈ $5.30 (≈ ₹509; very unlikely) |

**INR conversion:** ₹96 per US$1. That is close to the latest dated quote I found (₹95.95 on 16 September 2026), not a live rate. Your card or bank exchange rate, any forex markup, and taxes (such as GST, if Anthropic charges it on your invoice) are **not** included.

These are estimates. I did not call the token-counting endpoint because that is also an API call. Actual usage will be read from each response's `usage` field and reported.

**Optional, not included above:** the existing independent AI-review gate checks each card separately with a second model call.

- Per card: 40 extra calls, about $0.40–$0.80 (≈ ₹38–77).
- Per band: 4 extra calls, about $0.10–$0.25 (≈ ₹10–24).

The deterministic gates run locally at no API cost:

- safety terms;
- capitals and punctuation;
- the example sentence contains the word;
- difficulty range;
- duplicate check;
- readability for the grade.

## 4. After approval (what will happen)

1. Run `npx tsx scripts/phase1/generate.ts vocab_pilot 2`, which makes exactly 4 API calls.
2. Add IPA and syllables locally from the CMU Pronouncing Dictionary. Where a word isn't in the dictionary, the IPA is left blank.
3. Run the deterministic gates locally. The AI-review gate runs only if you approve it separately.
4. Export a review workbook and CSV with a status for each card:
    - **Validated – awaiting human approval** when every gate passes;
    - **Draft – needs fixes** otherwise.
5. Report the actual tokens used, the cost and the gate results.

**Not done:** no import into `vocabulary_master` or `vocabulary_candidates`, no publishing, no changes to app data. The original workbook, the JSON and the v1/v2 review files stay untouched.

## 5. Approval needed

Please reply with one of:

- **Approve generation:** 4 calls, expected ≈ $0.30–$0.65 (≈ ₹29–62), ceiling ≈ $1.31 (≈ ₹126).
- **Approve generation plus the AI-review gate:** add about $0.10–$0.25 (≈ ₹10–24) for per-band review, or about $0.40–$0.80 (≈ ₹38–77) for per-card review.
- **Change the list or the model:** for example, swap particular words.
