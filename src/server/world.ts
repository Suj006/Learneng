import "server-only";
import { one, query } from "./db";
import { metrics } from "./metrics";
import { award } from "./gamification";
import { PET_STAGES } from "./content/game";

export async function kingdomMap(childId: string, level: number) {
  const m = await metrics(childId);
  const [kingdoms, locations, claims, bosses] = await Promise.all([
    query<{ slug: string; title: string; emoji: string; art: string; description: string; href: string; unlock_level: number }>(`select * from kingdoms where active order by sort_order`),
    query<{ slug: string; kingdom: string; title: string; emoji: string; kind: string; x: number; y: number; unlock_metric: string; unlock_target: number; unlock_label: string; href: string | null; reward_crystals: number; reward_coins: number }>(`select * from kingdom_locations order by sort_order`),
    query<{ location: string }>(`select location from child_location_claims where child_id = $1`, [childId]),
    query<{ slug: string; kingdom: string; title: string; unlock_level: number }>(
      `select b.slug, b.kingdom, b.title, b.unlock_level from boss_battles b`),
  ]);
  const defeated = new Set((await query<{ ref: string }>(`select distinct ref from challenge_attempts where child_id = $1 and kind = 'boss' and passed`, [childId])).map((r) => r.ref));
  const claimed = new Set(claims.map((c) => c.location));
  return kingdoms.map((k) => {
    const unlocked = level >= k.unlock_level;
    const locs = locations.filter((l) => l.kingdom === k.slug).map((l) => {
      const open = unlocked && (m[l.unlock_metric] ?? 0) >= l.unlock_target;
      const boss = l.kind === "boss" ? bosses.find((b) => l.href?.endsWith(b.slug)) : undefined;
      return { ...l, open, progress: Math.min(l.unlock_target, m[l.unlock_metric] ?? 0), claimed: claimed.has(l.slug), hidden: l.kind === "secret" && !open,
        defeated: boss ? defeated.has(boss.slug) : false, bossLevel: boss?.unlock_level ?? null };
    });
    const done = locs.filter((l) => l.open && (l.kind !== "treasure" || l.claimed) && (l.kind !== "boss" || l.defeated)).length;
    return { ...k, unlocked, locations: locs, progress: Math.round((done / Math.max(1, locs.length)) * 100) };
  });
}

export async function claimTreasure(childId: string, level: number, slug: string) {
  const map = await kingdomMap(childId, level);
  const loc = map.flatMap((k) => k.locations).find((l) => l.slug === slug);
  if (!loc || (loc.kind !== "treasure" && loc.kind !== "secret")) return { error: "No treasure here." } as const;
  if (!loc.open) return { error: `Keep learning to open this: ${loc.unlock_label}.` } as const;
  const ins = await query(`insert into child_location_claims (child_id, location) values ($1,$2) on conflict do nothing returning location`, [childId, slug]);
  if (!ins.length) return { error: "You already opened this treasure!" } as const;
  const result = await award(childId, "treasure", `treasure:${childId}:${slug}`, { xp: 0, coins: loc.reward_coins, crystals: loc.reward_crystals, reason: `Treasure: ${loc.title}` });
  return { result, title: loc.title, emoji: loc.emoji, coins: loc.reward_coins, crystals: loc.reward_crystals } as const;
}

export async function worldState(childId: string) {
  const m = await metrics(childId);
  const buildings = await query<{ slug: string; title: string; emoji: string; description: string; unlock_metric: string; unlock_target: number; unlock_label: string; href: string; x: number; y: number }>(
    `select * from world_buildings order by sort_order`);
  const decorations = await query<{ slug: string; title: string; emoji: string; rarity: string }>(
    `select r.slug, r.title, r.emoji, r.rarity from child_rewards c join rewards r on r.slug = c.slug where c.child_id = $1 and r.category in ('decoration','magic_object') order by c.redeemed_at`, [childId]);
  return {
    buildings: buildings.map((b) => ({ ...b, unlocked: (m[b.unlock_metric] ?? 0) >= b.unlock_target, progress: Math.min(b.unlock_target, m[b.unlock_metric] ?? 0) })),
    decorations, metrics: m,
  };
}

export const petStage = (growth: number) => [...PET_STAGES].reverse().find((s) => growth >= s.min)!;

export async function petsState(childId: string) {
  const m = await metrics(childId);
  const active = (await one<{ active_pet: string | null }>(`select active_pet from child_profiles where child_id = $1`, [childId]))?.active_pet;
  const rows = await query<{ slug: string; name: string; emoji: string; personality: string; hint_style: string; unlock_metric: string; unlock_target: number; unlock_label: string; rarity: string; nickname: string | null; growth: number | null; unlocked_at: string | null }>(
    `select p.*, c.nickname, c.growth, c.unlocked_at from pets p left join child_pets c on c.pet_slug = p.slug and c.child_id = $1 where p.active order by p.sort_order`, [childId]);
  return rows.map((p) => ({ ...p, owned: p.unlocked_at !== null, active: p.slug === active, stage: petStage(p.growth ?? 0).name,
    progress: Math.min(p.unlock_target, m[p.unlock_metric] ?? 0) }));
}

export async function collection(childId: string) {
  const [vocab, grammar, stories, cards, totals] = await Promise.all([
    query<{ id: string; word: string; meaning: string; phonetic: string; example: string; emoji: string; band: number; earned_at: string }>(
      `select v.id, v.word, v.meaning, v.phonetic, v.example, v.emoji, v.band, c.earned_at from child_collectibles c join vocabulary_master v on v.id::text = c.ref
       where c.child_id = $1 and c.kind = 'vocabulary' order by c.earned_at desc`, [childId]),
    query<{ title: string; emoji: string; explanation: string; earned_at: string }>(
      `select t.title, t.emoji, t.explanation, c.earned_at from child_collectibles c join grammar_topics t on t.id::text = c.ref where c.child_id = $1 and c.kind = 'grammar'`, [childId]),
    query<{ title: string; emoji: string; genre: string; earned_at: string }>(
      `select s.title, s.emoji, s.genre, c.earned_at from child_collectibles c join reading_stories s on s.id::text = c.ref where c.child_id = $1 and c.kind = 'story'`, [childId]),
    query<{ slug: string; kind: string; title: string; emoji: string; rarity: string; fact: string; lesson: string; owned: boolean }>(
      `select k.*, exists (select 1 from child_collectibles c where c.child_id = $1 and c.ref = k.slug) owned from collectible_cards k order by k.sort_order`, [childId]),
    one<{ words: number; grammar: number; stories: number }>(
      `select (select count(*)::int from vocabulary_master where status='published') words, (select count(*)::int from grammar_topics) grammar, (select count(*)::int from reading_stories where active) stories`),
  ]);
  const rarityFor = (band: number) => (band >= 4 ? "epic" : band === 3 ? "rare" : "common");
  return { vocab: vocab.map((v) => ({ ...v, rarity: rarityFor(v.band) })), grammar, stories, cards, totals };
}

export async function timeline(childId: string) {
  const c = await one<{ created_at: string }>(`select created_at from children where id = $1`, [childId]);
  const rows = await query<{ kind: string; title: string; emoji: string; achieved_at: string }>(
    `select kind, title, emoji, achieved_at from child_milestones where child_id = $1
     union all select 'ach-' || a.slug, a.title, a.emoji, ca.unlocked_at from child_achievements ca join achievements a on a.slug = ca.slug where ca.child_id = $1
     order by achieved_at`, [childId]);
  return [{ kind: "joined", title: "First day at PING VIBE", emoji: "🚀", achieved_at: c?.created_at ?? new Date().toISOString() }, ...rows];
}
