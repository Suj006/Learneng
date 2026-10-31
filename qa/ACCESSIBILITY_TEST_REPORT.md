# PING VIBE — Accessibility Test Report

**Standard:** WCAG 2.2 Level AA, checked automatically with **axe-core 4.10.3** (rule tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). Keyboard, target-size and motion checks are also scripted in `tests/ui-audit.mjs`.

**Final run:** __A11Y_SUMMARY__

> Automated tools find roughly a third to a half of accessibility issues. These results do **not** show full WCAG conformance. Screen-reader walkthroughs (NVDA, VoiceOver, TalkBack) and testing with children who use assistive technology have **not** been done.

## Checks

| ID pattern | What is asserted | Scope |
|---|---|---|
| `A11Y-<role>-<page>` | No *critical* or *serious* axe violations | Every public, child, parent and admin page (45) at 1366 px, measured after entrance animations settle |
| `KBD-<role>-<page>` | The first Tab press reaches the "Skip to content" link | Same pages |
| `TGT-…-<viewport>` | All buttons and button-links are at least 24×24 px (WCAG 2.5.8) | Every page × 8 viewports |
| `A11Y-<role>-reduced-motion` | With `prefers-reduced-motion: reduce`, CSS animations collapse to ≤ 10 ms | One page per role |

## Defects found and fixed

| ID | Finding (axe rule) | Pages | Fix |
|---|---|---|---|
| BUG-017 | `color-contrast`: interim wordmark 1.1:1 (white text in white logo containers); LEXI/STORY labels 1.77–2.77:1; Epic chip 3.62:1 | `/`, `/world`, quest, writing, rewards, arcade, map | Wordmark gets its own dark badge; character names use dark ink with a colour dot; lighter Epic tint |
| BUG-018 | `aria-progressbar-name` (16 nodes); `label` (critical) on family-challenge inputs; 14 selects without names | `/world`, `/world/map`, `/parent/child/[id]`, parent and admin forms | `Progress` always has a name plus `aria-valuetext` ("3 of 10"), with contextual labels; `aria-label` on the controls |
| BUG-019 | `scrollable-region-focusable` | `/` | Kingdom carousel is a focusable, labelled region with a visible focus ring |
| BUG-023 | Target size: "Read to me" 20 px tall; companion 🔊 17×20 px | quest, companion | Enlarged to 40 px |
| BUG-024 | `color-contrast` on locked achievements, cards and skills (whole-card opacity) and on the Admin chip; `label` (critical) on 80 economy inputs | skills, museum, collection, all admin pages | Dim only the artwork; lighter chip; labelled inputs |
| BUG-022 / BUG-025 | Test harness: the reduced-motion check rejected a correct `1e-06s`; axe originally covered only 11 pages | — | Numeric comparison; axe on every page |

## Built-in accessibility features (verified by the checks above or by code review)

- A skip link on every page. Landmarks: `header`, `nav`, `main#main`.
- All form fields have visible `<label>` elements or `aria-label`. Errors are announced in plain, child-friendly language.
- Characters, avatars and scenes are SVG with `role="img"` and labels, or `aria-hidden` when decorative.
- Every animation honours reduced motion (Framer `MotionConfig reducedMotion="user"` plus a global CSS override).
- Text and speech: character lines can be read aloud with the browser's speech synthesis. The Speaking Arena offers a non-microphone path ("✅ I said it!").
- No timed failure: the timed game (Word Race) is optional, and no core learning activity has a time limit.
- Fonts are Nunito (body) and Fredoka (display), with a minimum body size of 16 px.

## Not executed / known gaps

- Screen-reader walkthroughs and voice control.
- Colour-blind simulation review. Rarity and status do carry text labels, not just colour.
- Zoom to 200 % and 400 % reflow. This is partly covered by the 320 px viewport sweep, which approximates 400 % zoom on a 1280 px screen.
- Cognitive-load review for Pre-KG/UKG learners by a specialist (part of the Child UX sign-off).
