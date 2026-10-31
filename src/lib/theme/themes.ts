/**
 * PING VIBE colour themes — the single source of truth for every colour in the interface.
 *
 * Each theme is a set of design tokens. The theme engine turns them into CSS variables
 * (`--pv-*`, plus the `--color-*` aliases), and Tailwind's `vibe-*` colours read those variables,
 * so every module follows the selected theme without per-page colour code.
 *
 * "Fill" colours (primary, reward, success…) are for buttons, badges, bars and decoration.
 * "Ink" colours are text-safe versions of the same hue for the theme's surfaces (≥ 4.5:1).
 * The official logo is never themed: it is always shown as the original image on a white container.
 *
 * New themes are added as data (code seed or the admin Themes page) — no component changes needed.
 */
export type Hex = `#${string}`;
export interface ThemeTokens {
  mode: "light" | "dark";
  bg: Hex; bg2: Hex;                    // page background (soft gradient from bg to bg2)
  surface: Hex; surfaceAlpha: number;   // cards (solid in light themes, frosted glass in dark ones)
  surface2: Hex; surface3: Hex;         // opaque panels / popovers, and inputs / selects
  ink: Hex; inkSoft: Hex;               // main and secondary text
  line: Hex; lineAlpha: number;         // borders (colour + strength)
  glass: Hex;                           // tint for hover / chip backgrounds (used at low alpha)
  primary: Hex; secondary: Hex; accent: Hex;   // action colours
  ctaFrom: Hex; ctaTo: Hex;             // primary button gradient (white text must pass AA)
  onPrimary: Hex;                       // text on primary buttons
  success: Hex; reward: Hex; error: Hex; orange: Hex; pink: Hex;
  primaryInk: Hex; secondaryInk: Hex; successInk: Hex; rewardInk: Hex; errorInk: Hex; orangeInk: Hex; pinkInk: Hex; accentInk: Hex;
  glowA: Hex; glowB: Hex; glowC: Hex;   // soft background light
  shadow: Hex; shadowAlpha: number;
}
export interface ThemeDef { slug: string; name: string; tagline: string; emoji: string; tokens: ThemeTokens }

export const THEME_SEED: ThemeDef[] = [
  {
    slug: "rainbow-wonder", name: "Rainbow Wonder", emoji: "🌈", tagline: "Every colour of the PING VIBE logo",
    tokens: {
      mode: "light", bg: "#FFFCFF", bg2: "#F1E9FF", surface: "#FFFFFF", surfaceAlpha: 0.94, surface2: "#FFFFFF", surface3: "#F7F2FF",
      ink: "#2A1650", inkSoft: "#555568", line: "#321B57", lineAlpha: 0.12, glass: "#852DEB",
      primary: "#852DEB", secondary: "#16B9E9", accent: "#F52F83", ctaFrom: "#852DEB", ctaTo: "#D81B73", onPrimary: "#FFFFFF",
      success: "#55D934", reward: "#FFD33F", error: "#E8364F", orange: "#FF9B24", pink: "#F52F83",
      primaryInk: "#6E1FCC", secondaryInk: "#08739A", successInk: "#22760F", rewardInk: "#7E5200", errorInk: "#BE1D3A", orangeInk: "#9C4D00", pinkInk: "#B7125C", accentInk: "#B7125C",
      glowA: "#F52F83", glowB: "#16B9E9", glowC: "#FFD33F", shadow: "#321B57", shadowAlpha: 0.18,
    },
  },
  {
    slug: "ocean-splash", name: "Ocean Splash", emoji: "🌊", tagline: "Aqua waves and coral reefs",
    tokens: {
      mode: "light", bg: "#F3FBFF", bg2: "#E0F4FF", surface: "#FFFFFF", surfaceAlpha: 0.94, surface2: "#FFFFFF", surface3: "#EAF7FD",
      ink: "#0B2A45", inkSoft: "#3D5870", line: "#0B2A45", lineAlpha: 0.12, glass: "#0E7FB8",
      primary: "#0E7FB8", secondary: "#19C3C9", accent: "#FF6F61", ctaFrom: "#0B74AB", ctaTo: "#0A7F8A", onPrimary: "#FFFFFF",
      success: "#2BB673", reward: "#FFC845", error: "#E8364F", orange: "#FF8A5B", pink: "#FF6F91",
      primaryInk: "#0A6496", secondaryInk: "#08707A", successInk: "#12704A", rewardInk: "#7A5200", errorInk: "#BE1D3A", orangeInk: "#A23E12", pinkInk: "#B4234F", accentInk: "#B1352A",
      glowA: "#19C3C9", glowB: "#0E7FB8", glowC: "#FF6F61", shadow: "#0B2A45", shadowAlpha: 0.16,
    },
  },
  {
    slug: "candy-galaxy", name: "Candy Galaxy", emoji: "🍭", tagline: "Dreamy pinks, lavender and peach",
    tokens: {
      mode: "light", bg: "#FFF8FD", bg2: "#F3E8FF", surface: "#FFFFFF", surfaceAlpha: 0.94, surface2: "#FFFFFF", surface3: "#FAF0FF",
      ink: "#3A1650", inkSoft: "#5F4E6E", line: "#3A1650", lineAlpha: 0.12, glass: "#A13BE0",
      primary: "#A13BE0", secondary: "#F07AB8", accent: "#FFA78C", ctaFrom: "#9433D6", ctaTo: "#C9287F", onPrimary: "#FFFFFF",
      success: "#3CBF7A", reward: "#FFC86B", error: "#E43A64", orange: "#FF9F7A", pink: "#F04B9B",
      primaryInk: "#7E22BE", secondaryInk: "#AD1F6C", successInk: "#18703F", rewardInk: "#7A4D00", errorInk: "#B81A45", orangeInk: "#A23E12", pinkInk: "#AD1F6C", accentInk: "#A23E12",
      glowA: "#F07AB8", glowB: "#A13BE0", glowC: "#FFA78C", shadow: "#3A1650", shadowAlpha: 0.17,
    },
  },
  {
    slug: "sunshine-garden", name: "Sunshine Garden", emoji: "🌻", tagline: "Sunny yellows and fresh greens",
    tokens: {
      mode: "light", bg: "#FFFCF0", bg2: "#EEF9E8", surface: "#FFFFFF", surfaceAlpha: 0.94, surface2: "#FFFFFF", surface3: "#FFF6DD",
      ink: "#27310F", inkSoft: "#52583E", line: "#27310F", lineAlpha: 0.13, glass: "#5E9A16",
      primary: "#2F9E2F", secondary: "#FF9B24", accent: "#FFD33F", ctaFrom: "#23862C", ctaTo: "#0B7A55", onPrimary: "#FFFFFF",
      success: "#55D934", reward: "#FFD33F", error: "#E0473A", orange: "#FF9B24", pink: "#FF6FA0",
      primaryInk: "#1D6E22", secondaryInk: "#9C4D00", successInk: "#22760F", rewardInk: "#765000", errorInk: "#B42318", orangeInk: "#9C4D00", pinkInk: "#B4234F", accentInk: "#765000",
      glowA: "#FFD33F", glowB: "#55D934", glowC: "#FF9B24", shadow: "#27310F", shadowAlpha: 0.16,
    },
  },
  {
    slug: "twilight-magic", name: "Twilight Magic", emoji: "🌙", tagline: "A glowing evening sky",
    tokens: {
      mode: "dark", bg: "#15112E", bg2: "#1E1643", surface: "#FFFFFF", surfaceAlpha: 0.07, surface2: "#231C48", surface3: "#2E2559",
      ink: "#F6F2FF", inkSoft: "#CDC4EC", line: "#FFFFFF", lineAlpha: 0.12, glass: "#FFFFFF",
      primary: "#8E52F5", secondary: "#22C7F0", accent: "#FF4FA3", ctaFrom: "#7B3FE4", ctaTo: "#D81B73", onPrimary: "#FFFFFF",
      success: "#5BE38A", reward: "#FFD65A", error: "#FF7385", orange: "#FFA94D", pink: "#FF6FB5",
      primaryInk: "#C6A8FF", secondaryInk: "#7FE3FF", successInk: "#7CEBA2", rewardInk: "#FFDD75", errorInk: "#FF94A3", orangeInk: "#FFBE73", pinkInk: "#FF9CCC", accentInk: "#FF9CCC",
      glowA: "#852DEB", glowB: "#16B9E9", glowC: "#FF4FA3", shadow: "#08041E", shadowAlpha: 0.7,
    },
  },
];

export const DEFAULT_THEME = "rainbow-wonder";
export const THEME_TOKEN_KEYS = Object.keys(THEME_SEED[0].tokens) as (keyof ThemeTokens)[];

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`;
};

/** CSS variable declarations for one theme (RGB channels, so Tailwind opacity modifiers work). */
export function themeVars(t: ThemeTokens): string {
  const v: Record<string, string> = {
    "--pv-bg": rgb(t.bg), "--pv-bg-2": rgb(t.bg2), "--pv-surface": rgb(t.surface), "--pv-surface-alpha": String(t.surfaceAlpha),
    "--pv-surface-2": rgb(t.surface2), "--pv-surface-3": rgb(t.surface3), "--pv-ink": rgb(t.ink), "--pv-ink-soft": rgb(t.inkSoft),
    "--pv-line": rgb(t.line), "--pv-line-alpha": String(t.lineAlpha), "--pv-glass": rgb(t.glass),
    "--pv-primary": rgb(t.primary), "--pv-secondary": rgb(t.secondary), "--pv-accent": rgb(t.accent),
    "--pv-cta-from": rgb(t.ctaFrom), "--pv-cta-to": rgb(t.ctaTo), "--pv-on-primary": rgb(t.onPrimary),
    "--pv-success": rgb(t.success), "--pv-reward": rgb(t.reward), "--pv-error": rgb(t.error), "--pv-orange": rgb(t.orange), "--pv-pink": rgb(t.pink),
    "--pv-primary-ink": rgb(t.primaryInk), "--pv-secondary-ink": rgb(t.secondaryInk), "--pv-success-ink": rgb(t.successInk), "--pv-reward-ink": rgb(t.rewardInk),
    "--pv-error-ink": rgb(t.errorInk), "--pv-orange-ink": rgb(t.orangeInk), "--pv-pink-ink": rgb(t.pinkInk), "--pv-accent-ink": rgb(t.accentInk),
    "--pv-glow-a": rgb(t.glowA), "--pv-glow-b": rgb(t.glowB), "--pv-glow-c": rgb(t.glowC),
    "--pv-shadow": rgb(t.shadow), "--pv-shadow-alpha": String(t.shadowAlpha),
    // Friendly aliases (documented design-token names)
    "--color-primary": t.primary, "--color-secondary": t.secondary, "--color-accent": t.accent, "--color-background": t.bg,
    "--color-surface": t.surface2, "--color-surface-secondary": t.surface3, "--color-text-primary": t.ink, "--color-text-secondary": t.inkSoft,
    "--color-success": t.successInk, "--color-warning": t.rewardInk, "--color-error": t.errorInk, "--color-border": t.line,
    "--color-button-primary": t.ctaFrom, "--color-button-secondary": t.surface3,
  };
  // Large background scenes suit dark themes; light themes keep only the soft colour glows (calmer composition).
  v["--pv-scene-alpha"] = t.mode === "dark" ? "0.35" : "0";
  return Object.entries(v).map(([k, val]) => `${k}:${val}`).join(";") + `;color-scheme:${t.mode}`;
}

/** The full stylesheet for a set of themes. The default theme also applies when no theme is set. */
export function themeStylesheet(themes: { slug: string; tokens: ThemeTokens }[], defaultSlug: string): string {
  const def = themes.find((t) => t.slug === defaultSlug) ?? themes[0];
  const parts = [`:root{${themeVars(def.tokens)}}`];
  for (const t of themes) parts.push(`[data-theme="${t.slug}"]{${themeVars(t.tokens)}}`);
  return parts.join("\n");
}

// ── Contrast (WCAG 2.x) ─────────────────────────────────────────────
function lum(hex: string) {
  const c = rgb(hex).split(" ").map((n) => { const s = Number(n) / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a: string, b: string) { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }

/** Text/background pairs every theme must pass (4.5:1 for text, 3:1 for large UI). Used by the admin editor and tests. */
export function contrastChecks(t: ThemeTokens) {
  const page = t.mode === "light" ? t.bg : t.bg;
  const card = t.mode === "light" ? t.surface : t.surface2;
  const pairs: [string, string, string, number][] = [
    ["Main text on page", t.ink, page, 4.5], ["Main text on card", t.ink, card, 4.5],
    ["Secondary text on page", t.inkSoft, page, 4.5], ["Secondary text on card", t.inkSoft, card, 4.5], ["Secondary text on input", t.inkSoft, t.surface3, 4.5],
    ["Button text on button start", t.onPrimary, t.ctaFrom, 4.5], ["Button text on button end", t.onPrimary, t.ctaTo, 4.5],
    ["Primary-coloured text", t.primaryInk, card, 4.5], ["Blue-coloured text", t.secondaryInk, card, 4.5], ["Success text", t.successInk, card, 4.5],
    ["Reward text", t.rewardInk, card, 4.5], ["Error text", t.errorInk, card, 4.5], ["Orange text", t.orangeInk, card, 4.5], ["Pink text", t.pinkInk, card, 4.5],
    ["Dark text on reward button", "#19162F", t.reward, 4.5],
  ];
  return pairs.map(([label, fg, bg, min]) => ({ label, fg, bg, min, ratio: Math.round(contrast(fg, bg) * 100) / 100, pass: contrast(fg, bg) >= min }));
}
