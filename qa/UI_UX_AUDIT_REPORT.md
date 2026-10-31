# PING VIBE — UI/UX Audit Report

**Method.** Two inputs feed this report:
1. Automated browser sweeps of every public, child, parent and admin page (`tests/ui-audit.mjs`). These cover overflow, clipped controls, broken images, console errors, axe and screenshots.
2. A heuristic review of the screenshots against child-centred design principles for ages 5–13.

**This is not a substitute for usability sessions with children**, which have not been run (see the pilot recommendation).

## What works well

| Principle | Observation |
|---|---|
| A clear next step | The Daily Adventure leads with one "Today's adventure" card and Choose Your Adventure. Characters suggest the next activity in friendly language rather than in menus. |
| Pre-readers | Characters speak instructions aloud ("🔊 Read to me"). Quest words have emoji, phonetics and audio. Buttons pair icons with short words. |
| Emotional safety | No failure screens. Wrong answers get "Let's try once more!", a lost boss battle still pays practice XP, and missed days never break the learning rhythm. Skill levels appear as growth labels (🌱 Sprouting … 🌟 Shining), never as scores or ranks. |
| No assessment on arrival | The first login is a play-based welcome (MAX, the buddies, the kingdoms, then the first 10 words). |
| Touch targets | Every page × viewport asserts the WCAG 2.2 target minimum of 24×24 px (TGT-*). Primary actions are 44–56 px. Two undersized read-aloud buttons (20 px and 17×20 px) were found and enlarged to 40 px (BUG-023). |
| Motion | Framer Motion respects `prefers-reduced-motion`, and CSS animations collapse to 0.001 ms. Celebrations are short and skippable. |
| Parent clarity | The parent dashboard explains that skills are "ongoing observations, not exam results", shows a weekly learning story in plain language, and keeps controls (PIN, companion, reminders, export, delete) in one place. |
| Brand | The refined palette (purple → violet → magenta CTA, sky/lime accents) complements the official logo. The logo is shown exactly as supplied, with its original ratio, `object-fit: contain` and solid-white containers that match the artwork's background, so there is no visible frame. |

## Issues found and fixed in this audit

| ID | Issue | Fix |
|---|---|---|
| BUG-011 | A blank welcome after the parent hands over to the child, which is the most important moment in onboarding | Full navigation on identity change |
| BUG-015 | A broken logo image with wrapping alt text in the landing header and hero | Server-known asset presence; the interim wordmark renders instead |
| BUG-017 | The interim wordmark appeared white-on-white inside logo containers; character name labels and the Epic chip were low-contrast | Dark badge for the wordmark; dark-ink labels with a character colour dot; lighter Epic tint |
| BUG-010 / BUG-020 | Horizontal overflow in the avatar studio (320 px) and admin analytics (320/768 px) | Layout fixes |
| BUG-012 | The login form jumped on load (CLS 0.248) | Server-rendered initial tab (CLS 0) |
| BUG-008 / BUG-009 | Hydration warnings causing visible flicker on some pages | Mount-aware rendering |

## Recommendations (not defects; for design review)

1. **Pre-KG/UKG reading load.** Some mission descriptions and shop item text are still sentence-length. For non-readers, offer read-aloud on every card, not only on character speech.
2. **Density on the Daily Adventure at 320–375 px.** All sections stack into a long scroll. Consider collapsing secondary rows (pets, museum) behind a "More adventures" control for the youngest grades.
3. **Iconography consistency.** Emoji render differently on Android, iOS and Windows. Test on real devices, or switch to an SVG icon set.
4. **Logo at small sizes.** The official artwork is detailed. In headers (96–120 px wide) the characters and 3D lettering stay recognisable, but the tagline is too small to read. Per the brand rules the master is never cropped, so an **approved compact mark** (for example, the lettering only) would improve small placements if the brand owner supplies one.
5. **Error copy for parents.** It is friendly but generic for network failures. Add retry guidance.

## Visual regression

- Baselines are kept for 375, 768 and 1440 px on deterministic pages: public pages, the parent overview, the child pages without random content, and the admin forms.
- Pages with per-child random or time-based content are screenshotted for manual review, but they are excluded from automated pixel diffs (the `DYNAMIC` list in the audit script).
- The threshold is under 3 % of pixels changed.
- Results are in `REGRESSION_TEST_REPORT.md`.

## Not executed

- Moderated usability testing with children of each age band.
- Real-device testing (iOS Safari, Android Chrome, low-end Android).
- Review by a child UX specialist. This is required for the **Child UX QA sign-off**.
