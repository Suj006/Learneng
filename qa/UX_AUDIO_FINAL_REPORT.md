# PING VIBE — UI/UX, Audio, Navigation & Reward Audit: Final Report (31 Oct 2026)

Scope: the continuation brief (sign-up dropdowns, character voices, audio system, reward collection, navigation, responsive layout, visual polish, centralised audio, functional testing). Existing architecture kept (Next.js 15, React 19, Postgres/PGlite); nothing removed. Detailed issue list with root causes: **[UX_AUDIO_ISSUE_REGISTER.md](UX_AUDIO_ISSUE_REGISTER.md)**.

Nothing below is reported as fixed unless it was re-tested on a production build in a real browser (Chromium via Playwright) or by the API suite. One item (neural voices from Azure) is implemented but could not be tested here; it is marked as such.

## 1. Issues found and root causes (summary)

| Area | What children / parents saw | Root cause |
|---|---|---|
| Sign-up dropdowns | Month and year options blank or invisible on Windows (Chrome / Edge) | Select styled with a translucent white background and white text; Windows draws the option list in the select's colours, so options were white on white |
| Sign-up year range | Ages 3–14 offered; 5–13 required | Hard-coded ranges in the form and the server disagreed; month ignored |
| Reward collection | Claiming a mission reward froze the screen on a squashed overlay; "Awesome!" could not be pressed | The celebration modal was rendered inside a card with `backdrop-filter`, which makes the card the containing block for `position: fixed` — the "full-screen" overlay was 341 × 156 px |
| Reward collection | Double taps; occasional error on a double shop purchase; balance not updating | No busy state; shop route checked ownership before locking the wallet row; no refresh after claiming |
| Voices | Flat, robotic, same voice for every character | One generic `speak()`; first voice in the list (often a legacy robotic one) chosen before voices loaded; fixed pitch/rate |
| Music / effects | None | Not implemented |

## 2. Fixes implemented

**Sign-up** — opaque, high-contrast dropdowns with a custom chevron and 52 px touch targets (applied to every dropdown in the app); one shared age rule (`AGE_MIN`/`AGE_MAX` in `src/lib/validation.ts`) for the form, the add-child form and the server, using month and year; grade as a dropdown; messages beside each field (also for server-side errors, which now return the field name). Only birth month and year are collected.

**Rewards** — every celebration renders through a portal into `<body>` (so no card can trap it), with a max height and internal scrolling, Escape to close and focus on the button. Claim, open and buy buttons show "Collecting… / Opening… / Unlocking…" and cannot be pressed twice; rewards appear only after the server confirms; errors say "You can safely try again". The shop locks the wallet before checking ownership. The header balance refreshes after a claim. The shop reveal shows the reward's picture, name, category, cost and new balance; missing Expressions and Shoes tabs were added.

**Navigation** — 120+ child-world URLs crawled: no dead links, blank pages or broken routes. Added an in-world error page that keeps the header and bottom navigation and offers "Back to my Adventure". The coin chip opens the Reward Shop; a 🔊 button sits in the header on every page.

**Audio (new, centralised)** — `src/lib/audio/`:

| Layer | What it does |
|---|---|
| `manager.ts` — AudioManager | One instance per page. Master + music + effects + voice volumes; starts on first tap; pauses when the tab is hidden; stops when leaving the child world; one music track and one voice line at a time; ducks music to 22 % during speech and restores it; captions; once-a-day greetings |
| `music.ts` — background music | 8 generated themes (dashboard, Vocabulary Forest, Grammar Galaxy, Storytelling Castle, Arcade, Speaking Arena, Reading, Rewards): soft pads, marimba, bells, harp, flute, piano on calm scales; melody varies each cycle; 2.5 s crossfades between areas; no files to download |
| `sfx.ts` — effects | tap, select, correct, gentle incorrect, XP, coin, level-up, badge, unlock, treasure, game complete, celebration |
| `voices.ts` — character voices | LEXI, GRAMMY, SPEAKY, STORY, MAX each have a pitch, pace and preferred voices; natural/neural browser voices ranked first; the chosen voice is remembered per character so it never changes between sessions |
| `lines.ts` — when characters speak | Area introductions (once a day), occasional cheers after correct answers, encouragement after mistakes, reward / level-up / badge lines |
| `/api/tts` + `src/server/tts.ts` | Optional Azure Neural voices with expressive styles (off unless keys are set) |

Controls: header panel with Music / Effects / Voices / Captions switches and master, music, voice and effects volumes; saved on the device and to the child's profile. Parents can switch music and voices off for their children (Settings). Audio is never needed to finish an activity; every character line is also shown as a caption, positioned so it never blocks taps.

## 3. Pages and flows tested

See the results table in section 5. Child journey (sign-up → verify → consent → welcome → Daily Word Quest → XP celebration → dashboard) and parent journey (settings, export) were run end to end.

## 4. External services requiring configuration

| Service | Needed for | Status |
|---|---|---|
| Azure AI Speech (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`) | Studio-quality expressive character voices | Optional. Not configured or tested here. Without it, the best voice in the child's browser is used (Edge "Natural" voices on Windows sound close to neural quality) |
| Anthropic (`PINGVIBE_ANTHROPIC_API_KEY`) | AI writing feedback and LEXI chat | Configured earlier; unchanged |
| Resend | Real e-mail delivery | Unchanged; see LOCAL_TESTING_GUIDE.md |
