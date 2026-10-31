# Run and check PING VIBE on your own computer: beginner's guide

This guide assumes you have never run a web project before. You will:

1. install two free tools
2. download PING VIBE
3. run it **without** Claude, which is free and uses the built-in offline feedback
4. check it by clicking around and by running the automated tests
5. switch Claude on and check again

It takes about 30–45 minutes the first time. Use made-up names and e-mail addresses only, never a real child's details.

---

## Part A — Install the tools (once)

### A1. Install Node.js (this runs the app)

1. Go to **https://nodejs.org**.
2. Download the version marked **LTS**. It must be version 20 or newer.
3. Open the downloaded file and click **Next / Continue** through the installer, keeping the default options.

### A2. Install Git (this downloads the code)

- **Windows:** go to https://git-scm.com/download/win, download, install, and keep all the default options.
- **Mac:** you can skip this. The Mac offers to install Git the first time you use it (step B2).

### A3. Open a "terminal"

A terminal is a window where you type commands. Type (or paste) each command, then press **Enter**.

- **Windows:** press the Windows key, type **PowerShell**, and open **Windows PowerShell**.
- **Mac:** press **Cmd + Space**, type **Terminal**, and press Enter.

Check that the tools installed correctly by running these one at a time:

```bash
node -v
```

```bash
git --version
```

You should see version numbers, for example `v22.11.0`. The Node number must start with 20 or higher.

If you see "command not found" or "not recognized", close the terminal, open a new one and try again. If it still fails, restart the computer.

---

## Part B — Download PING VIBE (once)

### B1. Choose a folder

This moves you to your Documents folder:

```bash
cd ~/Documents
```

### B2. Download the code

```bash
git clone https://github.com/Suj006/Learneng.git
```

- **If it asks for a GitHub login:** the repository is private. Sign in with your GitHub account in the window that pops up.
- **On a Mac,** if a window offers to install "command line developer tools", click **Install**, wait, then run the command again.

### B3. Go into the folder and pick the right version

```bash
cd Learneng
```

```bash
git checkout claude/ping-vibe-product-design-16wth5
```

### B4. Install the app's building blocks

```bash
npm install
```

This takes 1–3 minutes and prints a lot of text. Warnings (`npm warn`) are normal. Only red `ERR!` lines mean a problem.

---

## Part C — Create your settings file (once)

The app reads its settings from a file called `.env.local`. Create it from the example. Use the line for your system.

**Mac:**

```bash
cp .env.example .env.local
```

**Windows (PowerShell):**

```bash
Copy-Item .env.example .env.local
```

Now open the file in a text editor.

**Mac:**

```bash
open -e .env.local
```

**Windows:**

```bash
notepad .env.local
```

1. **Leave the two Claude key lines empty for now** (`ANTHROPIC_API_KEY=` and `PINGVIBE_ANTHROPIC_API_KEY=`).
2. Scroll to the **very bottom**, to the section `# ── QA / staging only ──`. It already has two empty lines. Type the values straight after the `=` signs, with no spaces, so they read exactly:

   ```
   EMAIL_TRANSPORT=dev-mailbox
   IP_RATE_LIMIT_MULTIPLIER=100
   ```

   These are for testing on your own computer only; never set them on the live website.

3. Save the file (**Ctrl + S** or **Cmd + S**) and close the editor.

What these lines do:
- `EMAIL_TRANSPORT=dev-mailbox` shows the app's e-mails on a page inside the app instead of really sending them.
- `IP_RATE_LIMIT_MULTIPLIER=100` stops the automated tests from being blocked for creating many accounts quickly.

---

## Part D — Start the app

### D1. Build it

This prepares the "production" version, the same kind the live site runs. It takes 1–3 minutes.

```bash
npm run build
```

It should end with a table of pages and no red `Error` lines.

### D2. Start it

```bash
npm start
```

When you see `✓ Ready`, the app is running.

**Leave this terminal window open.** Closing it, or pressing **Ctrl + C** in it, stops the app.

### D3. Open it

Open your web browser (Chrome is recommended) and go to **http://localhost:3000**. You should see the PING VIBE home page.

---

## Part E — Check it by hand (about 15 minutes)

Work through these steps. Each one says what you should see.

| # | Do this | You should see |
|---|---|---|
| 1 | Click **Start your adventure** (or go to http://localhost:3000/signup) | The sign-up form |
| 2 | Fill it in: child's first name (e.g. *Asha*), a made-up parent e-mail (e.g. *test1@example.com*), a birth month and a year that makes the child 5–13, a grade, and a password of **8+ characters with a letter and a number** (e.g. *Secret123*). Tick **I am the parent or legal guardian…** and submit | "Almost there! We sent a magic link…" |
| 3 | Open **http://localhost:3000/dev/mailbox** in a new tab | The verification e-mail. Click its **Verify e-mail** link |
| 4 | Review privacy, give consent, choose a **6-digit secret PIN** and repeat it | The child's **Explorer name**. **Write it down** together with the PIN |
| 5 | Go to http://localhost:3000/login, choose **🚀 I'm an Explorer**, and enter the Explorer name and PIN | The child's world |
| 6 | Do the welcome, then **Word Quest** and answer the 10 words | Words, answers, XP and coins |
| 7 | Open **Creative Writing**, write 2–3 short sentences (mistakes are fine), and submit | A score, corrections and encouragement, marked as **offline** feedback (because Claude is off) |
| 8 | Ask **LEXI**: *What does enormous mean?* | A simple answer from the word bank |
| 9 | Try the Grammar, Reading and Arcade games | Each page opens and scores your answers |
| 10 | Log out, go to /login, choose **👪 I'm a Parent**, and log in with the e-mail and password | The parent dashboard with the child's progress |
| 11 | Go to http://localhost:3000/admin/login and log in with `admin@pingvibe.local` / `ChangeMe!2026` | The admin dashboard |

Write down anything that looks wrong, together with the step number and a screenshot.

**To start again with an empty app:**
1. Stop the app (Ctrl + C in its terminal).
2. Delete the hidden `.data` folder inside `Learneng`. In a terminal in that folder, run `rm -rf .data` (Mac) or `Remove-Item -Recurse -Force .data` (Windows).
3. Run `npm start` again.

---

## Part F — Run the automated tests (no Claude yet)

Keep the app running. Open a **second** terminal window and go to the folder.

**Mac:**

```bash
cd ~/Documents/Learneng
```

**Windows:**

```bash
cd $HOME\Documents\Learneng
```

### F1. Unit tests (a few seconds)

```bash
npm test
```

✅ Expected: `Tests  21 passed (21)`.

### F2. Full API, security and learning suite (2–4 minutes)

**Mac:**

```bash
QA_PRODUCTION=1 node tests/qa-api.mjs
```

**Windows (PowerShell):**

```bash
$env:QA_PRODUCTION="1"; node tests/qa-api.mjs
```

The suite prints one line per test (✅ pass, ❌ fail, ⛔ blocked) and ends with the totals.

✅ Expected **without Claude**: `TOTAL 217 · PASS 215 · FAIL 0 · BLOCKED 2`.

The two ⛔ lines are **LRN-037** and **LRN-084**, the Claude tests. They are *supposed* to be blocked when no key is set.

### F3. Writing feedback for every grade (about 1 minute)

```bash
node tests/ai-writing-grades.mjs
```

✅ Expected: 10 lines (PRE_KG … G7), each `status=200 evaluator=offline` with a score, ending `Claude evaluated 0/10 grades`. That is correct while Claude is off.

The tests create extra test accounts. That is fine. Reset the app (end of Part E) whenever you want a clean start.

If you got these results, **the app works on your computer without Claude.** 🎉

---

## Part G — Switch Claude on and check again

### G1. Get a key and make sure the account has credit

1. Go to **https://console.anthropic.com** and sign in.
2. **Plans & Billing:** make sure there is credit. With no credit, every Claude request fails and the app quietly falls back to offline feedback.
3. **API Keys → Create Key:** copy the key, which starts with `sk-ant-`. Treat it like a password: never share it, post it or put it in screenshots.

### G2. Add the key

Open `.env.local` again (Part C) and paste the key after `PINGVIBE_ANTHROPIC_API_KEY=`, with no spaces or quotes:

```
PINGVIBE_ANTHROPIC_API_KEY=sk-ant-...your key...
```

Save and close.

The file `.env.local` is never uploaded to GitHub; the project is set up to ignore it.

### G3. Restart the app

1. In the **first** terminal, press **Ctrl + C**.
2. Start the app again:

```bash
npm start
```

You do not need to rebuild. The key is read when the app starts.

### G4. Run the tests again

The test script must see the key too, so give it the same key in the **second** terminal. Replace `sk-ant-...` with your key; the key is set only in this window.

**Mac:**

```bash
export PINGVIBE_ANTHROPIC_API_KEY=sk-ant-...
```

**Windows (PowerShell):**

```bash
$env:PINGVIBE_ANTHROPIC_API_KEY="sk-ant-..."
```

Then run the suite in the same window (**Mac**):

```bash
QA_PRODUCTION=1 node tests/qa-api.mjs
```

**Windows (PowerShell):**

```bash
$env:QA_PRODUCTION="1"; node tests/qa-api.mjs
```

✅ Expected **with Claude**: `TOTAL 217 · PASS 216 · FAIL 0 · BLOCKED 1`.

- LRN-037 and LRN-084 are now ✅.
- The one ⛔ is **ADM-014**, which only checks the "no key" case. That is expected.

```bash
node tests/ai-writing-grades.mjs
```

✅ Expected: every grade shows `evaluator=claude`, ending `Claude evaluated 10/10 grades`.

### G5. Read Claude's feedback yourself

Open `qa/results/ai-writing-grades.json` in a text editor. For each grade, check that:
- the corrections are right
- the explanations (`why`) are easy enough for that age
- the tone is kind
- the `improved_sample` keeps the child's own idea and kind of writing

You can also repeat steps 7 and 8 of Part E. The feedback should no longer say offline.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| `node` or `npm` "not recognized" / "command not found" | Reinstall Node.js LTS (A1), then open a **new** terminal |
| `git clone` asks for a password and fails | Sign in with your GitHub account in the pop-up, or install **GitHub Desktop** and clone `Suj006/Learneng` there |
| `npm install` shows red `ERR!` lines | Check your internet connection, then run `npm install` again |
| "Port 3000 is already in use" | The app is already running in another terminal. Use that one, or stop it with Ctrl + C |
| Browser says "This site can't be reached" | The app isn't running. Run `npm start` and wait for `✓ Ready` |
| `/dev/mailbox` shows "404 page not found" | `EMAIL_TRANSPORT=dev-mailbox` is missing from `.env.local` (Part C). Add it, then restart the app |
| Tests show many ❌ about **Admin** (ADM-…) | You changed `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local`, or the database already had a different admin. Restore the defaults and reset the app (end of Part E) |
| Tests fail with "429" or "too many requests" | `IP_RATE_LIMIT_MULTIPLIER=100` is missing from `.env.local`. Add it and restart the app |
| With the key, feedback still says **offline** | Look at the first terminal for a line starting `[ai] … failed`. "credit balance is too low" means add credit (G1); "invalid x-api-key" means the key was pasted wrongly (G2) |
| LRN-037 / LRN-084 still ⛔ after adding the key | The second terminal doesn't have the key. Repeat the `export` / `$env:` line in G4 in that same window |

When you're done, stop the app with **Ctrl + C**. To run it again another day, open a terminal and run (Mac paths shown):

```bash
cd ~/Documents/Learneng
```

```bash
git pull
```

```bash
npm install
```

```bash
npm run build
```

```bash
npm start
```

Next steps (real phones, screen readers, real e-mail, Supabase) are in [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md).
