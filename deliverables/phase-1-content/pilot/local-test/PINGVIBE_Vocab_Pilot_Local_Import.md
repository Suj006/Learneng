# PING VIBE: Vocabulary Pilot, local test import

> **Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.**
>
> **Local computer testing only.** The cards sit in the admin review queue and are **not published to learners**. Nothing was deployed or pushed, and no remote or shared environment was used.

## Where the cards are stored

| Item | Value |
|---|---|
| Database | The app's **embedded local PGlite database** (used whenever `DATABASE_URL` is empty). `DATABASE_URL` was unset and there is no `.env.local`, so no Supabase or other remote database was involved. |
| Folder used in this session | `.data/pilot-test`: a new, dedicated local test database inside the gitignored `.data/` folder (never committed). |
| Table | `content_library`: the Content Studio **review queue**. 40 rows, `kind = 'vocabulary'`, `status = 'pending'`, `source = 'ai'`. |
| Tag on every row | `body.pilot_tag = "cambridge-pilot-v4-localtest"`, plus `candidate_id`, `ipa_source` and the **Cambridge disclaimer** (shown in the review queue) |
| Not touched | `vocabulary_master` (learner-visible words: 120 before and after), `children`, `child_vocabulary_progress`, and every other learner table. The other 480 candidates were not imported. |

Learners see words only after an admin approves them in **Admin → Content Studio → Review queue**. Approving copies a card into `vocabulary_master`, and only in that local database. Please **don't press Approve** unless you want to test publishing locally; the undo steps below cover that case too.

## How it was verified

- **Import:** 40 added, 0 skipped. Learner tables were unchanged (`vocabulary_master` 120 → 120).
- **Safety guard:** with `DATABASE_URL` set, the script **refuses to run**. This was tested.
- **In the app (local only):**
    - The admin review queue shows **40** items. All 40 words appear, with the disclaimer and the pilot tag visible.
    - A new local test child's daily words were **bright, curious, giggle, strong, explore**, all from the existing bank. No pilot word was served.
    - The test child is a synthetic test account in the dedicated test database; it goes when that folder is deleted.
- **Undo, tested on a copy:** the removal script deleted exactly 40 rows, and `vocabulary_master` stayed at 120.
- **Idempotent:** re-running the import adds 0 rows (40 already present).

## How to remove the test data

**Server must be stopped first** (PGlite allows one connection).

1. **Remove just the 40 pilot cards** from the review queue:
   ```bash
   node scripts/phase1/remove_pilot_local.mjs .data/pilot-test
   ```
2. **If any were approved in the local Content Studio**, also remove them from `vocabulary_master` and any local test progress on them:
   ```bash
   node scripts/phase1/remove_pilot_local.mjs .data/pilot-test --include-published
   ```
3. **Or delete the whole dedicated test database.** It held nothing else except the synthetic verification account.
   - Mac/Linux:
     ```bash
     rm -rf .data/pilot-test
     ```
   - Windows PowerShell:
     ```powershell
     Remove-Item -Recurse -Force .data\pilot-test
     ```

## To test on your own computer (Windows)

1. **Get the code:** download the branch ZIP and run `npm install`. Leave `DATABASE_URL` empty in `.env.local`.
2. **Create a separate test database:**
    1. Start the app once (it creates and migrates the database), then stop it with Ctrl+C:
       ```powershell
       $env:PGLITE_DIR=".data\pilot-test"; npm run dev
       ```
    2. Import the cards:
       ```powershell
       node scripts/phase1/import_pilot_local.mjs .data\pilot-test
       ```
    3. Start the app again on the same folder:
       ```powershell
       $env:PGLITE_DIR=".data\pilot-test"; npm run dev
       ```
       Your usual local database (`.data\pingvibe`) is untouched.
3. **Review the cards:** log in at `/admin/login` (the admin email and password from `.env.local`) and open Content Studio → Review queue.
4. **Undo:** use the removal commands above, with `.data\pilot-test` as the folder.

The scripts aren't in your ZIP yet because they haven't been pushed. They'll be included once you approve a push.

## The 40 imported card IDs

| Candidate ID | Word | Band | Status |
|---|---|---|---|
| PV-CAM-1-0003 | market | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0007 | daughter | 1 | AI checks passed (v4 targeted check) – awaiting human approval |
| PV-CAM-1-0013 | doctor | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0015 | driver | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0017 | neck | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0033 | seat | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0034 | farm | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0035 | mountain | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0038 | bottle | 1 | AI checks passed – awaiting human approval |
| PV-CAM-1-0040 | shower | 1 | AI checks passed – awaiting human approval |
| PV-CAM-2-0041 | call | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0042 | video | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0043 | website | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0044 | straight | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0046 | drop | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0047 | hurt | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0048 | library | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0051 | holiday | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0052 | temperature | 2 | AI checks passed – awaiting human approval |
| PV-CAM-2-0054 | comic | 2 | AI checks passed – awaiting human approval |
| PV-CAM-3-0221 | information | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0222 | history | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0226 | minute | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0228 | computer | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0229 | manager | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0230 | scene | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0231 | spend | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0233 | material | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0235 | direction | 3 | AI checks passed – awaiting human approval |
| PV-CAM-3-0284 | museum | 3 | AI checks passed – awaiting human approval |
| PV-CAM-4-0431 | recover | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0435 | breathe | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0442 | delete | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0447 | communicate | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0486 | translate | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0498 | succeed | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0502 | satisfied | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0507 | challenging | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0516 | realise | 4 | AI checks passed – awaiting human approval |
| PV-CAM-4-0518 | forgive | 4 | AI checks passed – awaiting human approval |

## Files (local only, **not committed or pushed**, as instructed)

- `scripts/phase1/import_pilot_local.mjs`: the local-only import (refuses to run with `DATABASE_URL`; idempotent; tags every row).
- `scripts/phase1/remove_pilot_local.mjs`: the undo.
- `deliverables/phase-1-content/pilot/local-test/PINGVIBE_Vocab_Pilot_Local_Import.md`: this report.
