# PING VIBE — Visual Identity, Colour Themes & Visual Refinement Report (31 Oct 2026)

Covers two briefs: the **master visual identity / colour theme system** and the **final visual experience refinement**. The architecture, learning modules, gamification, characters, kingdoms, rewards and navigation are all kept. The official logo is untouched: the original image at its original proportions on a white container, with no filters and no per-theme versions.

Everything below was checked on a production build in Chromium (Playwright) with synthetic accounts. Numbers come from the recorded runs listed in section 6.

## 1. What was inspected first

| Finding | Detail |
|---|---|
| Existing design system | Fixed hex colours in `tailwind.config.ts`, all designed for one dark theme |
| Hard-coded dark-only styling | `text-white` (35), translucent white overlays `bg-white/…` (63) and `border-white/…` (46), accent text colours (120), faded secondary text (36) |
| Hex colours in components | 281, mostly inside the illustrated characters, scenes and avatars (kept: original character colours by design) |
| Existing theme feature | Reward Shop "World themes": earned dark page backgrounds |
| Logo | Rendered from the original file with `object-fit: contain` on white; no filters |

## 2. Theme engine (central, token-based)

- **Tokens:** `src/lib/theme/themes.ts` defines each theme as data: page and surface colours, main and secondary text, borders, three action colours, the button gradient, success / reward / error / orange / pink, a text-safe "ink" shade of each accent, background light and shadow. The engine writes them as CSS variables (`--pv-*`), plus the documented aliases (`--color-primary`, `--color-background`, `--color-text-primary`, `--color-button-primary` and the rest).
- **Tailwind:** every `vibe-*` colour, gradient and shadow reads the variables, so existing components follow the theme without per-page colour code. Each accent has a fill colour (buttons, badges, bars) and an ink colour for text. Text on yellow buttons, white speech bubbles and modal scrims uses fixed colours that never change with the theme.
- **Migration:** 254 automatic replacements plus manual review of every `text-white`. Secondary text no longer uses transparency, so it always meets contrast.
- **Delivery:**
  - The built-in themes are inlined in the page.
  - A tiny script in the page head applies the device's saved theme before the first paint, so there's no flash of the wrong colours.
  - Admin-managed themes are served from the `color_themes` table at `/theme.css`.
  - The child's saved theme is applied on the server for world pages, so it's correct on every device.
- **Shop "World themes"** (earned rewards) now add a gentle coloured glow on top of the chosen colour theme, so they stay meaningful without overriding readability.

## 3. The five themes

| Theme | Mode | Lowest text contrast (WCAG) |
|---|---|---|
| 🌈 Rainbow Wonder (default; official logo palette) | light | 4.86:1 |
| 🌊 Ocean Splash | light | 4.76:1 |
| 🍭 Candy Galaxy | light | 5.13:1 |
| 🌻 Sunshine Garden | light | 4.65:1 (button gradient retuned from green-orange to green-teal) |
| 🌙 Twilight Magic | dark | 4.86:1 |

Each theme passes 15 text/background pairs at AA (4.5:1). `tests/themes.test.ts` fails the build if any theme ever drops below.

Colour distribution follows the brief:
- **Backgrounds:** soft (cloud white, lavender, cream, ice blue, mint), with only faint colour glows.
- **Primary buttons:** pink / purple / blue gradients.
- **Secondary buttons:** soft surfaces with coloured text and subtle borders.
- **Rewards:** yellow / orange.
- **Success:** green.
- **Headings:** deep purple / navy.
- **Learning areas:** each has its own tint (`module-quest`, `module-forest`, `module-galaxy`, `module-writing`, `module-speaking`, `module-reading`, `module-arcade`, `module-rewards`).

## 4. Personalisation

- **My PING VIBE Look** (`/world/look`): "Make PING VIBE Your Own!"
  - **Cards:** five theme cards with colour swatches, a live miniature dashboard drawn in each theme, sample buttons and learning cards.
  - **Selecting:** "Select theme" applies the theme instantly, with no reload and a 0.45 s colour transition (skipped with reduced motion). It's saved to the profile and the device, and stays across logins.
  - **Free:** "Reset to default" is available, and every theme is free.
  - **Animations:** Full sparkle, Calm (no looping decorations) or Still (no motion, which also switches Framer Motion to reduced motion).
  - **Sounds:** the full sound settings sit on the same page.
- **Ways in:** the profile, the dashboard ("🎨 My look"), the sound panel ("Change my colours"), and an optional welcome-tour step with **Skip**.
- **Parents:** the child's page shows their look and lets parents guide theme and animations. Music and voice restrictions set by parents still apply.
- **Admins** (Admin → Themes):
  - show or hide themes and set the default
  - edit colour tokens, which are refused unless every contrast check passes
  - add new themes by copying an existing one
  - see how many Explorers use each theme

  New themes need no code or redeploy.
- **Learning data is independent:** theme changes never touch XP, coins or progress (THM-006).

## 5. Visual refinement (screenshot review)

26 major pages were captured at 390 px (plus key pages at 1366 px) in every theme and reviewed. These changes were made from what the screenshots showed:

| Seen in screenshots | Root cause | Fix |
|---|---|---|
| Kingdom pictures (Arena, Castle, Ocean, Forest) had no sky on the map, dashboard and welcome tour | Scenes and characters used fixed SVG gradient IDs. The map draws each scene twice (desktop and mobile layouts); a gradient inside the hidden copy never paints, so the visible copy lost its sky. The old dark background hid this | Unique gradient IDs per drawing (`useId`) in `Scenes.tsx` and `Character.tsx` |
| Pictures washed out under labels | A full-height fade to the page colour, designed for dark mode | A short label band at the bottom only; the picture stays vivid |
| Stray pale wedge shapes behind home, login and sign-up | The dark-theme "islands" scene shown faintly on light backgrounds | Large decorative scenes appear only in dark themes (`--pv-scene-alpha`); light themes keep soft glows |
| Muddy brown button middle in Sunshine Garden | Green-to-orange gradient | Green-to-teal |
| "Back" wrapped onto two lines beside long titles | The button could shrink | `shrink-0 whitespace-nowrap` |
| Current page hard to see in the bottom bar; sub-pages highlighted nothing | Colour-only cue, exact-path match | Pill marker, lifted icon, `aria-current`, sub-page aware |
| "Read to me" link unreadable in Twilight Magic (2.0:1, found by axe) | Theme ink colour inside an always-white bubble | Fixed dark purple inside bubbles |

Micro-interactions added:
- **Cards:** every tappable card lifts on hover and presses on tap.
- **Page entrance:** world pages fade in over 0.28 s.
- **Theme switching:** a short colour transition.
- **Navigation:** the bottom-bar icon lifts for the current page.

All of these respect reduced motion and the animation setting.

Age bands: younger Explorers (bands 1–2) get rounder cards and slightly larger button text. Older Explorers (band 4) get calmer decoration (no twinkle or wiggle loops). The brand stays the same.

Loading, error and success states:
- **Loading:** the in-world loading screen uses the logo and a shimmer.
- **Errors:** the in-world error page has MAX, "Try again" and "Back to my Adventure", and keeps the navigation.
- **Empty states:** the empty notebook shows LEXI.
- **Success:** celebrations show the reward, a sound and a character line.

## 6. Test results

See section 7 of the regression report for the final recorded numbers. Summary:
- **Unit tests:** 29/29, including theme token and contrast tests.
- **API suite:** 243 checks: 241 pass, 0 fail, 2 blocked (the Claude tests, because that run had no key).
- **Accessibility per theme (axe, WCAG 2.2 AA):** 10 pages × 5 themes at 390 px. One violation was found and fixed; the re-run is recorded in `results/theme-audit.json`.
- **Browser sweep** (journey, 8 viewports, console, axe, target size, visual): baselines regenerated for the new default look, then a comparison run (`results/ui-audit.json`).

## 7. Not done and why

- **"High-quality 3D-style illustrations":** the characters and scenes are original flat-shaded SVG with gradients and soft shadows. Replacing them with 3D artwork needs an illustrator or a licensed asset pack. I didn't generate imitation 3D art, which would look worse than the consistent current set. The illustrations now render correctly in every theme.
- **Per-theme screenshots for every page** are not stored as visual-regression baselines. Baselines use the default theme; other themes are covered by the axe audit and the review screenshots in `screenshots/themes/`.
