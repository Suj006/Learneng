import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { query } from "@/server/db";

/** Create or update a recurring event + its event mission and collectible card (no deadlines, no purchases). */
export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({
    slug: z.string().regex(/^[a-z0-9-]{3,40}$/), title: z.string().min(2).max(80), emoji: z.string().min(1).max(8), kind: z.enum(["festival", "seasonal", "special"]),
    month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31), window_days: z.number().int().min(1).max(30),
    description: z.string().min(2).max(300), words: z.array(z.string().max(40)).max(10), writing_prompt: z.string().max(300), active: z.boolean(),
  }));
  await query(
    `insert into events (slug, title, emoji, kind, month, day, window_days, description, words, writing_prompt, active) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     on conflict (slug) do update set title=$2, emoji=$3, kind=$4, month=$5, day=$6, window_days=$7, description=$8, words=$9, writing_prompt=$10, active=$11`,
    [d.slug, d.title, d.emoji, d.kind, d.month, d.day, d.window_days, d.description, d.words, d.writing_prompt, d.active]);
  await query(`insert into missions (slug, scope, character, title, description, metric, target, href, xp, coins, crystals, event_slug)
     values ($1,'event','max',$2,$3,'special_passed',1,'/world/challenge/special',100,30,2,$4) on conflict (slug) do update set title=$2, description=$3, active=$5`,
    [`ev-${d.slug}`, d.title, `${d.description} Complete the special event challenge.`, d.slug, d.active]);
  await query(`insert into collectible_cards (slug, kind, title, emoji, rarity, fact, lesson) values ($1,'event',$2,$3,'rare',$4,$5) on conflict (slug) do update set title=$2, emoji=$3, fact=$4, lesson=$5`,
    [`event-${d.slug}`, d.title, d.emoji, d.description, `Event words: ${d.words.join(", ")}.`]);
  return ok();
});
