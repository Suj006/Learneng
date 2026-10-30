import "server-only";
import { one, query } from "./db";
import { metrics, periodStart } from "./metrics";
import { activeEvents } from "./events";
import { award } from "./gamification";
import { todayKey } from "./time";
import { CHARACTER_CARD } from "./content/game";
import { bandForGrade } from "@/lib/grades";

export interface MissionView {
  slug: string; scope: string; character: string; title: string; description: string; metric: string; target: number;
  progress: number; done: boolean; claimed: boolean; href: string; xp: number; coins: number; crystals: number; periodKey: string;
}

type Row = { slug: string; scope: string; character: string; title: string; description: string; metric: string; target: number; href: string; xp: number; coins: number; crystals: number; band_min: number; band_max: number; event_slug: string | null };

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Smart rotation: today's daily missions are a deterministic, varied pick for each child (no repeats day-to-day). */
function pickDaily(rows: Row[], childId: string, day: string, n: number) {
  const anchor = rows.find((r) => r.slug === "d-discover");
  const rest = rows.filter((r) => r !== anchor).sort((a, b) => hash(childId + day + a.slug) - hash(childId + day + b.slug));
  return [...(anchor ? [anchor] : []), ...rest].slice(0, n);
}

export async function missionsFor(childId: string, grade: string): Promise<MissionView[]> {
  const band = bandForGrade(grade);
  const all = await query<Row>(`select * from missions where active and $1 between band_min and band_max`, [band]);
  const events = new Set((await activeEvents()).map((e) => e.slug));
  const day = todayKey();
  const weekIdx = Math.floor(new Date(day).getTime() / (7 * 86400000));
  const characters = all.filter((m) => m.scope === "character");
  const chosen: Row[] = [
    ...pickDaily(all.filter((m) => m.scope === "daily"), childId, day, band === 1 ? 2 : 3),
    ...all.filter((m) => m.scope === "weekly").sort((a, b) => hash(childId + weekIdx + a.slug) - hash(childId + weekIdx + b.slug)).slice(0, 3),
    ...all.filter((m) => m.scope === "monthly").slice(0, 2),
    ...(characters.length ? [characters[weekIdx % characters.length]] : []),
    ...all.filter((m) => m.scope === "mystery"),
    ...all.filter((m) => m.scope === "event" && m.event_slug && events.has(m.event_slug)),
  ];
  const periods = {
    daily: periodStart("daily"), weekly: periodStart("weekly"), monthly: periodStart("monthly"),
  };
  const scopePeriod = (scope: string) => (scope === "daily" ? periods.daily : scope === "monthly" ? periods.monthly : periods.weekly);
  const cache = new Map<string, Record<string, number>>();
  const claims = await query<{ mission_slug: string; period_key: string; claimed_at: string | null }>(
    `select mission_slug, period_key, claimed_at from child_missions where child_id = $1`, [childId]);
  const out: MissionView[] = [];
  for (const m of chosen) {
    const p = scopePeriod(m.scope);
    if (!cache.has(p.key)) cache.set(p.key, await metrics(childId, p.since));
    const progress = Math.min(m.target, cache.get(p.key)![m.metric] ?? 0);
    const claimed = claims.some((c) => c.mission_slug === m.slug && c.period_key === p.key && c.claimed_at);
    out.push({ slug: m.slug, scope: m.scope, character: m.character, title: m.title, description: m.description, metric: m.metric, target: m.target,
      progress, done: progress >= m.target, claimed, href: m.href, xp: m.xp, coins: m.coins, crystals: m.crystals, periodKey: p.key });
  }
  return out;
}

/** Claim is validated on the server against fresh metrics; rewards are idempotent per period. */
export async function claimMission(childId: string, grade: string, slug: string) {
  const m = (await missionsFor(childId, grade)).find((x) => x.slug === slug);
  if (!m) return { error: "That mission isn't available right now." } as const;
  if (!m.done) return { error: "Keep going — this mission isn't finished yet!" } as const;
  await query(
    `insert into child_missions (child_id, mission_slug, period_key, claimed_at) values ($1,$2,$3, now())
     on conflict (child_id, mission_slug, period_key) do update set claimed_at = coalesce(child_missions.claimed_at, now())`,
    [childId, slug, m.periodKey]);
  const result = await award(childId, "mission", `mission:${childId}:${slug}:${m.periodKey}`, { xp: m.xp, coins: m.coins, crystals: m.crystals, reason: `Mission: ${m.title}` });
  let card: string | null = null;
  if (!result.duplicate) {
    card = CHARACTER_CARD[slug] ?? (m.scope === "event" ? `event-${slug.replace(/^ev-/, "")}` : null);
    if (card) await query(`insert into child_collectibles (child_id, kind, ref) values ($1,$2,$3) on conflict do nothing`, [childId, card.startsWith("event-") ? "event" : "character", card]);
  }
  const cardRow = card ? await one<{ title: string; emoji: string }>(`select title, emoji from collectible_cards where slug = $1`, [card]) : null;
  return { result, card: cardRow } as const;
}
