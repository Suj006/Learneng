# PING VIBE: B0002 staged for local testing

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> **Isolated local test database only.** The cards are in the admin **review queue** and are **not published**. No production or shared database was used (`DATABASE_URL` unset, no `.env.local`). Nothing was deployed, committed or pushed.

## What was done

| Item | Value |
|---|---|
| Database | `.data/pilot-test`, the isolated local PGlite test database (gitignored) |
| Backup taken first | `.data/pilot-test.backup-before-b0002` |
| Imported | **Only the 60 B0002 cards** into `content_library`. Each row has `kind = vocabulary`, `status = pending` and the tag `body.pilot_tag = "vocab-10day-test-b0002-localtest"`. Each row also carries its registry ID, candidate ID, CMU US IPA, all gate results and the Cambridge disclaimer. |
| Registry check before import | The card file matches the registry checksum. All 60 entries are `local-test/in-review` and not approved or published. |
| B0001 | **Not imported again.** It still has 40 pending rows, unchanged. |
| Learner tables | Unchanged. `vocabulary_master` has 120 rows before and after, and children and progress rows were not touched. |
| Tested on throwaway copies first (all passed; copies deleted) | Import. A re-run added 0 rows. Refused the default dev DB, folders outside `./.data`, and runs with `DATABASE_URL` set. The removal script removed exactly 60 rows. |

## The schedules match the 45 words for each grade

| Grade | Band | Days 1–6 = the 30 published words | Day 7 | Days 8–10 = the 15 staged B0002 cards | 45 unique |
|---|---|---|---|---|---|
| UKG | 1 | ✅ | ✅ review, 0 new | ✅ | ✅ |
| G1 | 2 | ✅ | ✅ review, 0 new | ✅ | ✅ |
| G4 | 3 | ✅ | ✅ review, 0 new | ✅ | ✅ |
| G5 | 4 | ✅ | ✅ review, 0 new | ✅ | ✅ |

- **Portal settings:** the portal settings match. `grade_config` maps UKG, G1, G4 and G5 to bands 1, 2, 3 and 4, with 5 new words a day. In the learning plan, day 7 is the weekly assessment day for all four grades.
- **Simulated on a throwaway copy:** I approved B0002 there exactly as Content Studio would, then ran the portal's own daily word rule for 10 days. For every grade it produced 9 new-word days, **exactly the same 45 words** with none from other bands, and **0 new words on day 7**.
- **Day order can differ:** the portal sorts by difficulty and then randomly. Some easy B0002 words may appear before day 8, and some published words after it, but the 45-word set is identical.

## To test on this computer
1. **Make the new cards available (local database only).** The 15 B0002 cards for each grade are needed for days 8–10.
    1. Start the app on the test database:
       ```bash
       PGLITE_DIR=.data/pilot-test npm run dev
       ```
    2. Log in at `/admin/login` and open **Content Studio → Review queue**.
    3. Approve **only** items whose tag is `vocab-10day-test-b0002-localtest`.
    - **Don't approve B0001** (tag `cambridge-pilot-v4-localtest`). That would add 10 extra words per band and change the 45-word set.
    - Approving publishes a card only inside this local test database.
2. **Create a new test child for each grade.** Create one each for UKG, Grade 1, Grade 4 and Grade 5. The existing synthetic test child already has 5 words introduced, so don't use it.
3. **Allow 10 real days.** The journey moves forward one plan day per calendar day after the Daily Word Quest is done, and the portal has no date override.

## How to remove the test data (stop the server first)

**Option 1: remove only the B0002 review-queue rows.** Use this if nothing was approved.
```bash
node scripts/phase1/remove_b0002_local.mjs .data/pilot-test
```

**Option 2: also remove any B0002 cards you approved locally,** and any test progress on them.
```bash
node scripts/phase1/remove_b0002_local.mjs .data/pilot-test --include-published
```

**Option 3: restore the backup taken just before the import.** This also undoes any test children or progress created since.
```bash
rm -rf .data/pilot-test && cp -r .data/pilot-test.backup-before-b0002 .data/pilot-test
```

**Option 4: delete the whole isolated test database and its backup.**
```bash
rm -rf .data/pilot-test .data/pilot-test.backup-before-b0002
```

On Windows PowerShell:
```powershell
Remove-Item -Recurse -Force .data\pilot-test, .data\pilot-test.backup-before-b0002
```

None of these touch B0001 rows (except deleting the whole folder) or the word registry. The registry is append-only and still records B0002 as `local-test/in-review`.

## Scripts

These are local only and uncommitted:

- `scripts/phase1/import_b0002_local.mjs`
- `scripts/phase1/remove_b0002_local.mjs`

Both refuse to run if `DATABASE_URL` is set, if the folder is not inside `./.data`, or if it is the default `.data/pingvibe`.
