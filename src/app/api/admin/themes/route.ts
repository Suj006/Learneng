import { z } from "zod";
import { adminRoute, body, HttpError, ok } from "@/server/api";
import { query, tx } from "@/server/db";
import { allThemes, invalidateThemes } from "@/server/themes";
import { THEME_TOKEN_KEYS, contrastChecks, type ThemeTokens } from "@/lib/theme/themes";

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Colours must be 6-digit hex values like #852DEB.");
const tokenSchema = z.object(Object.fromEntries(THEME_TOKEN_KEYS.map((k) =>
  [k, k === "mode" ? z.enum(["light", "dark"]) : /Alpha$/.test(k) ? z.number().min(0).max(1) : hex])) as unknown as Record<keyof ThemeTokens, z.ZodType>).strict();

/**
 * Manage colour themes: enable/disable, choose the default, rename, edit colours, add new themes.
 * Every saved theme must pass the WCAG AA contrast checks, so an unreadable theme can never go live.
 */
export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({
    action: z.enum(["update", "create"]),
    slug: z.string().regex(/^[a-z0-9-]{3,40}$/, "Use lowercase letters, numbers and dashes for the theme id."),
    name: z.string().trim().min(2).max(40).optional(), emoji: z.string().max(8).optional(), tagline: z.string().max(80).optional(),
    active: z.boolean().optional(), is_default: z.boolean().optional(), tokens: tokenSchema.optional(),
  }));
  const themes = await allThemes();
  const existing = themes.find((t) => t.slug === d.slug);
  if (d.tokens) {
    const bad = contrastChecks(d.tokens as ThemeTokens).filter((c) => !c.pass);
    if (bad.length) throw new HttpError(400, `Not readable enough: ${bad.map((b) => `${b.label} ${b.ratio}:1 (needs ${b.min})`).join("; ")}`);
  }
  if (d.action === "create") {
    if (existing) throw new HttpError(400, "A theme with that id already exists.");
    if (!d.name || !d.tokens) throw new HttpError(400, "A new theme needs a name and colours.");
    await query(`insert into color_themes (slug, name, emoji, tagline, tokens, active, sort_order) values ($1,$2,$3,$4,$5,$6,$7)`,
      [d.slug, d.name, d.emoji ?? "🎨", d.tagline ?? "", JSON.stringify(d.tokens), d.active ?? false, themes.length]);
  } else {
    if (!existing) throw new HttpError(404, "Theme not found.");
    const willBeActive = d.active ?? existing.active;
    if (existing.is_default && d.active === false) throw new HttpError(400, "Choose another default theme before switching this one off.");
    if (d.is_default && !willBeActive) throw new HttpError(400, "The default theme must be switched on.");
    if (d.active === false && themes.filter((t) => t.active && t.slug !== d.slug).length === 0) throw new HttpError(400, "At least one theme must stay available.");
    await tx(async (q) => {
      if (d.is_default) await q.query(`update color_themes set is_default = false where is_default`);
      await q.query(`update color_themes set name = coalesce($2, name), emoji = coalesce($3, emoji), tagline = coalesce($4, tagline), active = coalesce($5, active),
                       is_default = coalesce($6, is_default), tokens = coalesce($7::jsonb, tokens), updated_at = now() where slug = $1`,
        [d.slug, d.name ?? null, d.emoji ?? null, d.tagline ?? null, d.active ?? null, d.is_default ? true : null, d.tokens ? JSON.stringify(d.tokens) : null]);
    });
  }
  invalidateThemes();
  return ok();
});
