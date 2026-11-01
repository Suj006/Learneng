# PING VIBE word registry

> **Local test content only.** Every entry here is `local-test/in-review`, with `approved: false` and `published: false`. Nothing in this folder is imported into the app or shown to learners.
>
> Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.

This folder is the durable record of every generated word card. Before any new word generation, it is checked to prevent duplicates. The tool is `scripts/registry/word-registry.ts`.

## Files

| Path | What it is | Rule |
|---|---|---|
| `word-registry.jsonl` | One JSON line per event: a `batch` header, one `word` entry per card, and later `status` events | **Append-only and hash-chained.** Lines are never edited or deleted. |
| `batches/<batch_id>/cards.json` | The complete cards for that batch, exactly as generated or checked | **Written once.** The tool refuses to overwrite it, and the stored SHA-256 detects any change. |
| `proposals/` | Word lists proposed for a future generation. No cards yet. | Kept for traceability. |
| `checks/` | Duplicate-check reports run before generation | Kept for traceability. |

### Word entry fields

| Field | Contents |
|---|---|
| `id` | Stable ID: `PVW-<band>-<hash of normalised word + sense>` |
| `word`, `norm_word` | Word as written, and the normalised form (lower case, standard apostrophes, single spaces) |
| `sense` | The card's meaning |
| `part_of_speech` | Part of speech |
| `band`, `grade_range` | Band and grade range |
| `category` | Category |
| `source` | Kind, candidate ID and provenance |
| `batch_id` | The batch the entry belongs to |
| `review_status` | Review status, starting at `local-test/in-review` |
| `approved`, `published` | Always `false` |
| `local_test` | Always `true` |
| `card_ref` | File, index and SHA-256 of the card |
| `flags` | Variant or related-form notes from the check |
| `created_at` | When the entry was created |
| `prev_hash`, `hash` | Links to the previous line and this line's own hash, forming the chain |

## The rule before any word generation

Run the check. `scripts/phase1/generate.ts` runs it automatically for vocabulary modes and stops if any word is excluded. It reads all of the following every time:

1. **This registry:** all earlier batches.
2. **Published seed words:** `src/server/content/vocabulary.ts`.
3. **The PING VIBE headword queue:** `src/server/content/headwords.ts`.
4. **Cambridge candidates:** `src/server/content/cambridge-candidates.ts`, with reviewed decisions. The v2 second pass is used where present, otherwise the v1 triage. This reproduces the 455 Use / 23 Revise / 42 Hold split exactly.
5. **Optionally, a local portal database:** `--portal .data/pilot-test`, or `REGISTRY_PORTAL=...` for `generate.ts`. It's read from a temporary copy and covers published words, queues and the review queue.

| Result | When | Effect |
|---|---|---|
| **Exclude** | Same normalised word already exists anywhere | The word isn't generated |
| **Exclude** | Cambridge Hold item | The word isn't generated |
| **Exclude** | Repeated within the same proposal | The word isn't generated |
| **Allow + flag** | Same word, but the new entry declares `distinct_sense: true` with a sense different from every known sense of that word | Separate entry; confirm the sense in review |
| **Flag** | Close variant: spacing or hyphen (check in / check-in), British/American spelling (colour / color), singular/plural (kite / kites) | Review before use |
| **Flag** | Related form with a shared stem (farm / farmer, sun / sunny, happy / happily) | Review before use |
| **Flag** | Cambridge Revise item | Fix and check before use |

A word's own source record isn't counted as a duplicate. That means the same Cambridge `candidate_id`, or the queued headword it is drawn from.

If an existing record has no known sense, such as a headword-only queue or Cambridge row, a "different sense" can't be confirmed. The word is then treated as a duplicate.

## Commands

All are run with `npx tsx scripts/registry/word-registry.ts`:

```bash
npx tsx scripts/registry/word-registry.ts check content-registry/proposals/P0002-vocab-10day-test.json --portal .data/pilot-test --out content-registry/checks/P0002-precheck.json
```

```bash
npx tsx scripts/registry/word-registry.ts register <batch-spec.json>
```

```bash
npx tsx scripts/registry/word-registry.ts status <entry_id> local-test/needs-fix "reason"
```

```bash
npx tsx scripts/registry/word-registry.ts verify
```

```bash
npx tsx scripts/registry/word-registry.ts list
```

- **`register`** appends a new batch. It refuses a batch ID that is already registered, an existing cards file, and any exact duplicate or Hold item.
- **`status`** appends a status event. The only statuses allowed are `local-test/in-review`, `local-test/needs-fix` and `local-test/rejected`. This tool never approves or publishes anything.
- **`amend <batch_id>[,<batch_id>] "reason"`** records a deliberate change to a batch's cards file, such as a redaction. It appends a `batch_amend` line holding the previous and new checksums; earlier lines are never edited.
- **`verify`** checks the hash chain, sequence numbers, unique IDs, unique word + sense pairs, card files and their checksums, and that nothing is marked approved or published.

## Current contents

| Batch | Words | Status |
|---|---|---|
| `B0001-cambridge-pilot-v4-localtest` | 40 (10 per band) | `local-test/in-review`. AI checks passed. In the local test review queue, not approved. |
| `B0002-vocab-10day-test-localtest` | 60 (15 each for UKG/B1, G1/B2, G4/B3, G5/B4) | `local-test/in-review`. All seven gates and AI checks passed. Not approved, not published, not imported. |

**Amendments:** both batches carry a `batch_amend` line. Before committing, the model identifier values in `generator_model` / `reviewer_model` were replaced with a generic label. Card content is unchanged.

**Proposals:**
- **`P0002`:** the first draft of the 10-day list. It was superseded because 7 words were flagged and "check in" and the adult-focused Band 4 words needed replacing.
- **`P0003`:** the final list used for B0002. Its pre-check was 60 clear.
