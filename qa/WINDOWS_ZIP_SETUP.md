# Run and check PING VIBE on Windows (ZIP download, no Git)

This guide is for Windows 10 or 11 and assumes no experience. It uses the ZIP download from GitHub, so you do not need Git. Use made-up names and e-mail addresses only.

You will:

1. install Node.js
2. download and unzip PING VIBE
3. run it **without** Claude and check it
4. switch Claude on and check again

Allow 30–45 minutes the first time.

---

## Step 1 — Install Node.js (once)

1. Open **https://nodejs.org** in your browser.
2. Click the big button for the **LTS** version (version 20 or newer) to download the Windows installer (`.msi`).
3. Open the downloaded file and click **Next** on every screen, keeping the defaults. If you see a "Tools for Native Modules" checkbox, leave it **unticked**. Then click **Install** and **Finish**.

## Step 2 — Open PowerShell and allow npm to run (once)

1. Press the **Windows key**, type **PowerShell**, and click **Windows PowerShell**.
2. Check that Node.js installed:

```bash
node -v
```

You should see a version number such as `v22.11.0`. It must start with 20 or higher. If you see "not recognized", close PowerShell, open it again and retry. If it still fails, restart the PC.

3. Windows often blocks the `npm` command in PowerShell with "running scripts is disabled on this system". Allow it for your user account (no administrator rights needed):

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

If it asks you to confirm, type **Y** and press Enter.

4. Check that npm now runs:

```bash
npm -v
```

You should see a version number.

## Step 3 — Download the ZIP from GitHub

1. Sign in at **https://github.com**. The repository is private, so you must be logged in.
2. Open **https://github.com/Suj006/Learneng**.
3. Near the top left, click the **branch** button (it usually says `main`) and choose **`claude/ping-vibe-product-design-16wth5`**. This step matters, because the work is on this branch.
4. Click the green **Code** button, then **Download ZIP**.

Alternatively, while signed in, paste this address into the browser to download the right branch directly:
`https://github.com/Suj006/Learneng/archive/refs/heads/claude/ping-vibe-product-design-16wth5.zip`

## Step 4 — Unzip to a short folder

Windows has trouble with very long file paths, and the app installs many deeply nested files. So use a short folder at the top of the C: drive.

1. Open **File Explorer** → **Downloads**.
2. Right-click the ZIP and choose **Extract All…**.
3. In the "Files will be extracted to" box, type `C:\` and click **Extract**.
4. Go to `C:\`. You will see a folder named something like `Learneng-claude-ping-vibe-product-design-16wth5`. Right-click it, choose **Rename**, and rename it to **`pingvibe`**.
5. Open `C:\pingvibe`. You should see files such as `package.json`, `README.md` and `.env.example`, plus folders `src`, `tests`, `qa` and so on.
   - If you only see **one more folder** inside, open it. That inner folder is the project, so move its contents up or use its path in the steps below.

## Step 5 — Install the app's building blocks (once)

In PowerShell:

```bash
cd C:\pingvibe
```

```bash
npm install
```

This takes 2–5 minutes and prints a lot of text.
- `npm warn` lines are normal. Only red `npm error` lines mean a problem.
- Antivirus software can slow this step down. Just wait.

## Step 6 — Create the settings file (once)

Still in PowerShell, in `C:\pingvibe`:

```bash
Copy-Item .env.example .env.local
```

```bash
notepad .env.local
```

Notepad opens the file.

1. **Leave these two lines empty for now:** `ANTHROPIC_API_KEY=` and `PINGVIBE_ANTHROPIC_API_KEY=`.
2. Scroll to the **very bottom** and add these two lines (for testing on your PC only, never on the live site):

   ```
   EMAIL_TRANSPORT=dev-mailbox
   IP_RATE_LIMIT_MULTIPLIER=100
   ```

3. Press **Ctrl + S** to save, then close Notepad.

Make sure the file is called exactly `.env.local`, not `.env.local.txt`. Because you created it with `Copy-Item`, it already has the right name.

## Step 7 — Build and start the app

```bash
npm run build
```

This takes 1–3 minutes. It should end with a list of pages and no red **Error** lines.

```bash
npm start
```

- When you see **`✓ Ready`**, the app is running.
- If **Windows Defender Firewall** pops up, click **Allow** (private networks is enough).
- **Leave this PowerShell window open.** Pressing **Ctrl + C** in it, or closing it, stops the app.

Open **Chrome or Edge** and go to **http://localhost:3000**. You should see the PING VIBE home page.

## Step 8 — Check it by hand (about 15 minutes)

| # | Do this | You should see |
|---|---|---|
| 1 | Go to **http://localhost:3000/signup** | The sign-up form |
| 2 | Child's first name *Asha*; parent e-mail *test1@example.com*; a birth month and a year that makes the child 5–13; a grade; password **Secret123** (8+ characters with a letter and a number). Tick **I am the parent or legal guardian…** and submit | "Almost there! We sent a magic link…" |
| 3 | Open **http://localhost:3000/dev/mailbox** | The verification e-mail. Click **Verify e-mail** |
| 4 | Review privacy, give consent, choose a **6-digit PIN** and repeat it | The child's **Explorer name**. **Write it down** together with the PIN |
| 5 | Go to **http://localhost:3000/login**, choose **🚀 I'm an Explorer**, and enter the Explorer name and PIN | The child's world |
| 6 | Do the welcome, then **Word Quest** (10 words) | Questions, XP and coins |
| 7 | **Creative Writing**: write 2–3 sentences (mistakes are fine) and submit | A score and corrections, marked as **offline** feedback (because Claude is off) |
| 8 | Ask **LEXI**: *What does enormous mean?* | A simple answer from the word bank |
| 9 | Open Grammar, Reading and Arcade | Each page opens and scores your answers |
| 10 | Log out, go to /login, choose **👪 I'm a Parent**, and use the e-mail and password | The parent dashboard |
| 11 | Go to **http://localhost:3000/admin/login** and log in with `admin@pingvibe.local` / `ChangeMe!2026` | The admin dashboard |

Note anything wrong, with the step number and a screenshot (press **Windows + Shift + S**).

## Step 9 — Run the automated tests (Claude still off)

Leave the app running. Open a **second** PowerShell window (Windows key → PowerShell) and go to the folder:

```bash
cd C:\pingvibe
```

**Unit tests** (a few seconds):

```bash
npm test
```

✅ Expected: `Tests  21 passed (21)`.

**Full API, security and learning suite** (2–4 minutes):

```bash
$env:QA_PRODUCTION="1"; node tests/qa-api.mjs
```

✅ Expected: the last line reads `TOTAL 217 · PASS 215 · FAIL 0 · BLOCKED 2`.
- Each test prints one line: ✅ pass, ❌ fail, ⛔ blocked.
- The two ⛔ are **LRN-037** and **LRN-084**, the Claude tests. They are supposed to be blocked while there is no key.
- PowerShell may show the emoji as boxes or question marks. That doesn't matter; read the `TOTAL` line.

**Writing feedback for every grade** (about 1 minute):

```bash
node tests/ai-writing-grades.mjs
```

✅ Expected: 10 lines (PRE_KG … G7), each with `status=200 evaluator=offline`, ending `Claude evaluated 0/10 grades`.

If you got these results, **the app works on your PC without Claude.** 🎉

## Step 10 — Switch Claude on and check again

1. **Get a key.**
   1. Sign in at **https://console.anthropic.com**.
   2. Under **Plans & Billing**, make sure there is credit.
   3. Under **API Keys**, click **Create Key** and copy the key (it starts with `sk-ant-`). Keep it secret: don't share it or show it in screenshots.
2. **Add it to the settings file.** In either PowerShell window, run `notepad C:\pingvibe\.env.local`. Paste the key after `PINGVIBE_ANTHROPIC_API_KEY=`, with no spaces or quotes. Save and close.
3. **Restart the app.**
   1. In the **first** PowerShell window, press **Ctrl + C**. If it asks "Terminate batch job (Y/N)?", type **Y** and press Enter.
   2. Run `npm start` again and wait for `✓ Ready`. You don't need to rebuild.
4. **Give the test window the same key.** In the **second** window, replace `sk-ant-...` with your key. It only lasts until you close this window.

```bash
$env:PINGVIBE_ANTHROPIC_API_KEY="sk-ant-..."
```

5. **Run the tests again** in that same second window:

```bash
$env:QA_PRODUCTION="1"; node tests/qa-api.mjs
```

✅ Expected: `TOTAL 217 · PASS 216 · FAIL 0 · BLOCKED 1`. LRN-037 and LRN-084 now pass. The one blocked test is **ADM-014**, which only checks the "no key" case.

```bash
node tests/ai-writing-grades.mjs
```

✅ Expected: every grade shows `evaluator=claude`, ending `Claude evaluated 10/10 grades`.

6. **Read Claude's feedback.** Run `notepad C:\pingvibe\qa\results\ai-writing-grades.json`. For each grade, check that:
   - the corrections are right
   - the `why` explanations are easy enough for that age
   - the tone is kind
   - the `improved_sample` keeps the child's own idea and kind of writing

   You can also repeat steps 7–8 of Step 8. The feedback should no longer say offline.

---

## Start over, stop, or get a newer version

- **Stop the app:** press **Ctrl + C** in the first PowerShell window.
- **Run it again another day:** open PowerShell, then run `cd C:\pingvibe` and `npm start`.
- **Empty the app's data (fresh start):** stop the app, then run:

```bash
Remove-Item -Recurse -Force C:\pingvibe\.data
```

  Then run `npm start` again.

- **Get a newer version** (no Git, so download again):
  1. Copy `C:\pingvibe\.env.local` to your Desktop. It holds your settings and key.
  2. Delete or rename the old `C:\pingvibe` folder.
  3. Repeat Steps 3–4 with the new ZIP.
  4. Copy `.env.local` back into `C:\pingvibe`.
  5. Run `npm install`, `npm run build` and `npm start`.

## If something goes wrong

| Problem | Fix |
|---|---|
| `npm : File ... npm.ps1 cannot be loaded because running scripts is disabled` | Run the `Set-ExecutionPolicy` command from Step 2 |
| `node` or `npm` "is not recognized" | Close and reopen PowerShell. If that doesn't help, restart the PC or reinstall Node.js LTS |
| `npm install` errors mentioning **path too long** or `ENAMETOOLONG` | The folder path is too long. Use `C:\pingvibe` (Step 4) |
| `npm install` errors with `EPERM` / "operation not permitted" | Close any editor or Explorer windows open in the folder, pause antivirus for a moment, and run `npm install` again |
| "Port 3000 is already in use" | The app is already running in another window. Use it, or close that window |
| Browser says "This site can't be reached" | The app isn't running. Run `npm start` and wait for `✓ Ready` |
| `/dev/mailbox` shows "404" | `EMAIL_TRANSPORT=dev-mailbox` is missing from `.env.local`. Add it, save, and restart the app |
| Many ❌ on **ADM-…** tests | `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` were changed. Put back `admin@pingvibe.local` / `ChangeMe!2026`, then do the "fresh start" above |
| Tests fail with **429** / "Too many sign-ups" | `IP_RATE_LIMIT_MULTIPLIER=100` is missing from `.env.local`. Add it and restart the app |
| With the key, feedback still says **offline** | Look in the first window for a line starting `[ai]`. "credit balance is too low" means add credit; "invalid x-api-key" means the key was pasted wrongly in `.env.local` |
| LRN-037 / LRN-084 still ⛔ after adding the key | The second window doesn't have the key. Run the `$env:PINGVIBE_ANTHROPIC_API_KEY=...` line in that same window, then rerun the test |

Next steps (phones, screen readers, real e-mail, Supabase) are in [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md).
