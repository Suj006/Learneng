import "server-only";
import { query } from "./db";
import { DEFAULT_THEME, THEME_SEED, type ThemeTokens } from "@/lib/theme/themes";

export interface ThemeRow { slug: string; name: string; emoji: string; tagline: string; tokens: ThemeTokens; active: boolean; is_default: boolean; sort_order: number }

let cache: { at: number; rows: ThemeRow[] } | null = null;
/** All themes (active and inactive), cached briefly. Falls back to the built-in themes if the database is unavailable. */
export async function allThemes(): Promise<ThemeRow[]> {
  if (cache && Date.now() - cache.at < 30_000) return cache.rows;
  try {
    const rows = await query<ThemeRow>(`select slug, name, emoji, tagline, tokens, active, is_default, sort_order from color_themes order by sort_order, name`);
    if (rows.length) { cache = { at: Date.now(), rows }; return rows; }
  } catch (e) { console.error("[themes]", (e as Error).message); }
  return THEME_SEED.map((t, i) => ({ ...t, active: true, is_default: t.slug === DEFAULT_THEME, sort_order: i }));
}
export const invalidateThemes = () => { cache = null; };
export async function activeThemes() { return (await allThemes()).filter((t) => t.active); }
export async function defaultThemeSlug() { const all = await activeThemes(); return (all.find((t) => t.is_default) ?? all[0])?.slug ?? DEFAULT_THEME; }
/** The theme a child sees: their choice if it is still available, otherwise the admin default. */
export async function resolveTheme(choice: string | null | undefined) {
  const all = await activeThemes();
  return all.some((t) => t.slug === choice) ? choice! : await defaultThemeSlug();
}
