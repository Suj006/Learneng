import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_SEED, THEME_TOKEN_KEYS, contrastChecks, themeStylesheet } from "../src/lib/theme/themes";

describe("colour themes", () => {
  it("ships the five themes with Rainbow Wonder as the default", () => {
    expect(THEME_SEED.map((t) => t.slug)).toEqual(["rainbow-wonder", "ocean-splash", "candy-galaxy", "sunshine-garden", "twilight-magic"]);
    expect(DEFAULT_THEME).toBe("rainbow-wonder");
  });
  it("Rainbow Wonder uses the official logo palette", () => {
    const t = THEME_SEED[0].tokens;
    expect([t.primary, t.secondary, t.pink, t.success, t.reward, t.orange]).toEqual(["#852DEB", "#16B9E9", "#F52F83", "#55D934", "#FFD33F", "#FF9B24"]);
  });
  for (const theme of THEME_SEED) {
    it(`${theme.name}: every token present and every text pair meets WCAG AA`, () => {
      expect(Object.keys(theme.tokens).sort()).toEqual([...THEME_TOKEN_KEYS].sort());
      const failing = contrastChecks(theme.tokens).filter((c) => !c.pass);
      expect(failing).toEqual([]);
    });
  }
  it("stylesheet sets the default on :root and one block per theme", () => {
    const css = themeStylesheet(THEME_SEED, DEFAULT_THEME);
    expect(css.startsWith(":root{--pv-bg:255 252 255")).toBe(true);
    for (const t of THEME_SEED) expect(css).toContain(`[data-theme="${t.slug}"]{`);
  });
});
