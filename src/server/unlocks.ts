import "server-only";
import { query } from "./db";
import { metrics } from "./metrics";

export interface Unlock { kind: "pet" | "card" | "building" | "location" | "milestone"; title: string; emoji: string }

const FIRSTS: { kind: string; metric: string; target: number; title: string; emoji: string }[] = [
  { kind: "first-10-words", metric: "words_discovered", target: 10, title: "First 10 words discovered", emoji: "🌱" },
  { kind: "first-mastered-set", metric: "words_mastered", target: 10, title: "First mastered vocabulary set", emoji: "🗝️" },
  { kind: "first-writing", metric: "writing_done", target: 1, title: "First writing submission", emoji: "✍️" },
  { kind: "first-grammar", metric: "grammar_80", target: 1, title: "First grammar achievement", emoji: "🪐" },
  { kind: "first-speaking", metric: "speaking_done", target: 1, title: "First speaking challenge", emoji: "🎤" },
  { kind: "first-boss", metric: "bosses_defeated", target: 1, title: "First boss defeated", emoji: "⚔️" },
  { kind: "first-100-mastered", metric: "words_mastered", target: 100, title: "100 words mastered", emoji: "👑" },
];

/**
 * Central unlock evaluator: runs after every award. Grants pets, collectible
 * cards, world buildings, secret locations and timeline milestones whose
 * learning conditions are now met. Idempotent (ON CONFLICT DO NOTHING).
 */
export async function evaluateUnlocks(childId: string): Promise<Unlock[]> {
  const m = await metrics(childId);
  const out: Unlock[] = [];

  const pets = await query<{ slug: string; name: string; emoji: string; unlock_metric: string; unlock_target: number }>(
    `select slug, name, emoji, unlock_metric, unlock_target from pets p where active and not exists (select 1 from child_pets c where c.child_id = $1 and c.pet_slug = p.slug)`,
    [childId]);
  for (const p of pets.filter((p) => (m[p.unlock_metric] ?? 0) >= p.unlock_target)) {
    const ins = await query(`insert into child_pets (child_id, pet_slug) values ($1,$2) on conflict do nothing returning pet_slug`, [childId, p.slug]);
    if (ins.length) {
      await query(`update child_profiles set active_pet = coalesce(active_pet, $2) where child_id = $1`, [childId, p.slug]);
      out.push({ kind: "pet", title: `${p.name} the pet joined you!`, emoji: p.emoji });
    }
  }

  // Derived collectible cards (each holds real educational content).
  const cards = await query<{ kind: string; title: string }>(
    `with ins as (
       insert into child_collectibles (child_id, kind, ref)
       select $1, 'vocabulary', word_id::text from child_vocabulary_progress where child_id = $1 and status = 'mastered'
       union all select $1, 'grammar', topic_id::text from grammar_progress where child_id = $1 and best_score >= 80
       union all select $1, 'story', story_id::text from story_progress where child_id = $1 and completed_at is not null
       union all select $1, 'creature', b.card_slug from challenge_attempts a join boss_battles b on b.slug = a.ref
                 where a.child_id = $1 and a.kind = 'boss' and a.passed and b.card_slug is not null
       on conflict do nothing returning kind, ref)
     select kind, count(*)::text as title from ins group by kind`,
    [childId]);
  for (const c of cards) out.push({ kind: "card", title: `${c.title} new ${c.kind} card${c.title === "1" ? "" : "s"}!`, emoji: "🃏" });

  const buildings = await query<{ slug: string; title: string; emoji: string; unlock_metric: string; unlock_target: number }>(
    `select slug, title, emoji, unlock_metric, unlock_target from world_buildings b
     where unlock_metric <> 'always' and not exists (select 1 from child_milestones c where c.child_id = $1 and c.kind = 'building-' || b.slug)`, [childId]);
  for (const b of buildings.filter((b) => (m[b.unlock_metric] ?? 0) >= b.unlock_target)) {
    const ins = await query(`insert into child_milestones (child_id, kind, title, emoji) values ($1,$2,$3,$4) on conflict do nothing returning kind`,
      [childId, `building-${b.slug}`, `${b.title} built in your world`, b.emoji]);
    if (ins.length) out.push({ kind: "building", title: `${b.title} appeared in MY PING VIBE WORLD!`, emoji: b.emoji });
  }

  const locs = await query<{ slug: string; title: string; emoji: string; kind: string; unlock_metric: string; unlock_target: number }>(
    `select slug, title, emoji, kind, unlock_metric, unlock_target from kingdom_locations l
     where kind in ('secret','treasure') and not exists (select 1 from child_milestones c where c.child_id = $1 and c.kind = 'location-' || l.slug)`, [childId]);
  for (const l of locs.filter((l) => (m[l.unlock_metric] ?? 0) >= l.unlock_target)) {
    const ins = await query(`insert into child_milestones (child_id, kind, title, emoji) values ($1,$2,$3,$4) on conflict do nothing returning kind`,
      [childId, `location-${l.slug}`, l.kind === "secret" ? `Discovered the ${l.title}` : `Found ${l.title}`, l.emoji]);
    if (ins.length) out.push({ kind: "location", title: l.kind === "secret" ? `Secret discovered: ${l.title}!` : `Hidden treasure revealed: ${l.title}!`, emoji: l.emoji });
  }

  for (const f of FIRSTS.filter((f) => (m[f.metric] ?? 0) >= f.target)) {
    const ins = await query(`insert into child_milestones (child_id, kind, title, emoji) values ($1,$2,$3,$4) on conflict do nothing returning kind`,
      [childId, f.kind, f.title, f.emoji]);
    if (ins.length) out.push({ kind: "milestone", title: f.title, emoji: f.emoji });
  }

  for (const u of out) {
    await query(`insert into notifications (child_id, title, body, kind) values ($1,$2,$3,'unlock')`, [childId, `${u.emoji} ${u.title}`, "Go take a look!"]);
  }
  return out;
}
