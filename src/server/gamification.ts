import "server-only";
import { CRYSTAL_TO_COINS } from "@/lib/economy";
import { one, query, tx, type Queryable } from "./db";
import { APP_TZ, addDays, todayKey } from "./time";
import { evaluateUnlocks, type Unlock } from "./unlocks";

export interface AwardResult {
  xp: number;
  coins: number;
  crystals: number;
  capped: boolean;
  duplicate: boolean;
  restReminder: boolean;
  levelUp: LevelUp | null;
  achievements: { slug: string; title: string; emoji: string }[];
  unlocks: Unlock[];
}

/** Sources that represent real learning (they grow the active pet). */
const LEARNING_SOURCES = new Set(["daily_word_quest", "writing_mission", "grammar_challenge", "speaking_challenge", "reading_adventure", "word_game", "story_builder", "listening", "revision", "weekly_quest", "monthly_championship", "boss_battle", "boss", "special_challenge"]);

/**
 * Transactional XP award driven by xp_config.
 *  • idempotencyKey makes double-submits harmless (unique constraint).
 *  • xp_config.daily_cap limits how many times an activity type pays out per day.
 *  • multiplier (0–1.5) scales by performance (learning outcome, not clicks).
 */
export async function awardXp(
  childId: string,
  key: string,
  idempotencyKey: string,
  opts: { multiplier?: number; reason?: string } = {},
): Promise<AwardResult> {
  const cfg = await one<{ xp: number; coins: number; crystals: number; daily_cap: number; label: string }>(
    `select xp, coins, crystals, daily_cap, label from xp_config where key = $1`, [key]);
  if (!cfg) throw new Error(`Unknown XP key ${key}`);
  const m = Math.max(0, Math.min(1.5, opts.multiplier ?? 1));
  return award(childId, key, idempotencyKey, {
    xp: Math.round(cfg.xp * m), coins: Math.round(cfg.coins * m), crystals: cfg.crystals, cap: cfg.daily_cap, reason: opts.reason ?? cfg.label,
  });
}

/** Explicit-amount award (missions, bosses, treasures). Same ledger, caps and idempotency. */
export async function award(
  childId: string,
  source: string,
  idempotencyKey: string,
  a: { xp: number; coins: number; crystals?: number; cap?: number; reason: string },
): Promise<AwardResult> {
  const today = todayKey();
  const ceiling = Number((await one<{ value: number }>(`select value from app_settings where key = 'daily_xp_ceiling'`))?.value ?? 1500);
  const res = await tx(async (q) => {
    if (a.cap !== undefined) {
      const used = (await q.query<{ n: number }>(
        `select count(*)::int n from xp_transactions where child_id = $1 and source = $2 and (created_at at time zone $3)::date = $4::date`,
        [childId, source, APP_TZ, today])).rows[0].n;
      if (used >= a.cap) return { xp: 0, coins: 0, crystals: 0, capped: true, duplicate: false, restReminder: false };
    }
    // Healthy-use ceiling: beyond it, learning is still recorded but XP stops (no reward for excess screen time).
    const earned = (await q.query<{ n: number }>(
      `select coalesce(sum(amount),0)::int n from xp_transactions where child_id = $1 and (created_at at time zone $2)::date = $3::date`,
      [childId, APP_TZ, today])).rows[0].n;
    const xp = Math.max(0, Math.min(a.xp, ceiling - earned));
    const restReminder = xp < a.xp;
    // Crystals are retired from the child interface: any crystal reward is paid as VIBE COINS instead.
    const coins = restReminder && xp === 0 ? 0 : a.coins + (a.crystals ?? 0) * CRYSTAL_TO_COINS;
    const crystals = 0;
    const ins = await q.query(
      `insert into xp_transactions (child_id, amount, coins, crystals, reason, source, idempotency_key)
       values ($1,$2,$3,$4,$5,$6,$7) on conflict (idempotency_key) do nothing returning id`,
      [childId, xp, coins, crystals, a.reason, source, idempotencyKey]);
    if (ins.rows.length === 0) return { xp: 0, coins: 0, crystals: 0, capped: false, duplicate: true, restReminder: false };
    await q.query(
      `update child_profiles set xp_total = xp_total + $2, coins = coins + $3, crystals = crystals + $4, updated_at = now() where child_id = $1`,
      [childId, xp, coins, crystals]);
    if (LEARNING_SOURCES.has(source)) {
      await q.query(
        `update child_pets cp set growth = growth + 1 from child_profiles p
         where p.child_id = $1 and cp.child_id = $1 and cp.pet_slug = p.active_pet`, [childId]);
    }
    await touchStreak(q, childId, today);
    return { xp, coins, crystals, capped: false, duplicate: false, restReminder };
  });

  const levelUp = res.xp > 0 ? await recomputeLevel(childId) : null;
  const achievements = source === "achievement" ? [] : await checkAchievements(childId);
  const unlocks = source === "achievement" ? [] : await evaluateUnlocks(childId);
  return { ...res, levelUp, achievements, unlocks };
}

async function touchStreak(q: Queryable, childId: string, today: string) {
  const s = (await q.query<{ current_streak: number; longest_streak: number; last_active_on: string | null }>(
    `select current_streak, longest_streak, to_char(last_active_on, 'YYYY-MM-DD') as last_active_on from learning_streaks where child_id = $1`,
    [childId],
  )).rows[0];
  if (!s) {
    await q.query(`insert into learning_streaks (child_id, current_streak, longest_streak, last_active_on) values ($1,1,1,$2)`, [childId, today]);
    return;
  }
  if (s.last_active_on === today) return;
  // Rest days are part of learning: up to 2 missed days keep the rhythm going (no loss-based pressure).
  const next = s.last_active_on && s.last_active_on >= addDays(today, -3) ? s.current_streak + 1 : 1;
  await q.query(
    `update learning_streaks set current_streak = $2, longest_streak = greatest(longest_streak, $2), last_active_on = $3 where child_id = $1`,
    [childId, next, today],
  );
}

/** Current streak, treating a gap of more than one day as broken. */
export async function getStreak(childId: string) {
  const s = await one<{ current_streak: number; longest_streak: number; last_active_on: string | null }>(
    `select current_streak, longest_streak, to_char(last_active_on, 'YYYY-MM-DD') as last_active_on from learning_streaks where child_id = $1`,
    [childId],
  );
  if (!s) return { current: 0, longest: 0, activeToday: false };
  const today = todayKey();
  const alive = Boolean(s.last_active_on && s.last_active_on >= addDays(today, -3));
  return { current: alive ? s.current_streak : 0, longest: s.longest_streak, activeToday: s.last_active_on === today };
}

export interface LevelUp { id: number; name: string; from: number; coins: number; rewards: { slug: string; title: string; emoji: string }[]; mission: string | null }

/** Moves the child to the highest earned level and grants every milestone reward crossed on the way. */
export async function recomputeLevel(childId: string): Promise<LevelUp | null> {
  const row = await one<{ level_id: number; xp_total: number; mastered: number }>(
    `select p.level_id, p.xp_total,
       (select count(*)::int from child_vocabulary_progress v where v.child_id = p.child_id and v.status = 'mastered') as mastered
     from child_profiles p where p.child_id = $1`,
    [childId],
  );
  if (!row) return null;
  // Highest level whose XP is reached, without skipping a level whose mastery gate isn't met.
  const target = await one<{ id: number; name: string }>(
    `select id, name from learning_levels l
     where l.id > $3 and l.min_xp <= $1
       and not exists (select 1 from learning_levels g where g.id > $3 and g.id <= l.id and g.min_words_mastered > $2)
     order by id desc limit 1`,
    [row.xp_total, row.mastered, row.level_id],
  );
  if (!target) return null;
  const crossed = await query<{ id: number; reward_coins: number; reward_slugs: string[]; special_mission: string | null }>(
    `select id, reward_coins, reward_slugs, special_mission from learning_levels where id > $1 and id <= $2 order by id`,
    [row.level_id, target.id],
  );
  const coins = crossed.reduce((s, l) => s + l.reward_coins, 0);
  const slugs = crossed.flatMap((l) => l.reward_slugs);
  const mission = [...crossed].reverse().find((l) => l.special_mission)?.special_mission ?? null;
  const rewards = await tx(async (q) => {
    await q.query(`update child_profiles set level_id = $2, coins = coins + $3 where child_id = $1`, [childId, target.id, coins]);
    if (!slugs.length) return [];
    return (await q.query<{ slug: string; title: string; emoji: string }>(
      `with ins as (insert into child_rewards (child_id, slug) select $1, unnest($2::text[]) on conflict do nothing returning slug)
       select r.slug, r.title, r.emoji from ins join rewards r on r.slug = ins.slug`,
      [childId, slugs],
    )).rows;
  });
  for (const n of [2, 10, 25, 50, 100, 150, 200, 250]) {
    if (row.level_id < n && target.id >= n) {
      await query(`insert into child_milestones (child_id, kind, title, emoji) values ($1,$2,$3,$4) on conflict do nothing`,
        [childId, `level-${n}`, n === 2 ? "First kingdom adventure unlocked" : `Reached Level ${n}`, n >= 100 ? "👑" : "⭐"]);
    }
  }
  const extra = rewards.length ? ` New rewards: ${rewards.map((r) => `${r.emoji} ${r.title}`).join(", ")}.` : "";
  await notifyChild(childId, `Level up! You are now ${target.name}!`, `You reached Level ${target.id}${coins ? ` and earned ${coins} bonus coins` : ""}.${extra}`, "level");
  return { id: target.id, name: target.name, from: row.level_id, coins, rewards, mission };
}

export async function levelProgress(childId: string) {
  const r = await one<{ level_id: number; name: string; tier_name: string; xp_total: number; coins: number; next_id: number | null; next_name: string | null; next_xp: number | null; next_words: number | null; cur_xp: number; mastered: number; total_levels: number }>(
    `select p.level_id, l.name, l.tier_name, p.xp_total, p.coins, l.min_xp as cur_xp,
            (select count(*)::int from learning_levels) as total_levels,
            n.id as next_id, n.name as next_name, n.min_xp as next_xp, n.min_words_mastered as next_words,
            (select count(*)::int from child_vocabulary_progress v where v.child_id = p.child_id and v.status = 'mastered') as mastered
     from child_profiles p join learning_levels l on l.id = p.level_id
     left join learning_levels n on n.id = p.level_id + 1
     where p.child_id = $1`,
    [childId],
  );
  if (!r) return null;
  const pct = r.next_xp ? Math.min(100, Math.round(((r.xp_total - r.cur_xp) / (r.next_xp - r.cur_xp)) * 100)) : 100;
  return { ...r, pct };
}

export async function notifyChild(childId: string, title: string, body: string, kind = "info") {
  await query(`insert into notifications (child_id, title, body, kind) values ($1,$2,$3,$4)`, [childId, title, body, kind]);
}

/** Evaluates every achievement rule against real learning data. */
export async function checkAchievements(childId: string) {
  const s = await one<Record<string, number>>(
    `select
      (select count(*)::int from child_vocabulary_progress where child_id = $1) as discovered,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and status = 'mastered') as mastered,
      (select count(*)::int from grammar_progress where child_id = $1 and best_score >= 80) as grammar80,
      (select coalesce(max(e.score),0)::int from writing_evaluations e join writing_submissions w on w.id = e.submission_id where w.child_id = $1 and w.kind = 'topic') as best_writing,
      (select count(*)::int from speaking_sessions where child_id = $1) as speaking,
      (select coalesce(max(longest_streak),0)::int from learning_streaks where child_id = $1) as streak,
      (select count(*)::int from writing_submissions where child_id = $1 and kind = 'story_builder' and status = 'evaluated') as stories_built,
      (select count(*)::int from daily_learning_sessions where child_id = $1 and completed_at is not null and attempted > 0 and correct = attempted) as perfect,
      (select count(*)::int from daily_learning_sessions where child_id = $1 and completed_at is not null) as quests,
      (select count(*)::int from story_progress where child_id = $1 and completed_at is not null) as stories_read,
      (select coalesce(max(c),0)::int from (
         select count(distinct (created_at at time zone $2)::date) c from xp_transactions where child_id = $1
         group by date_trunc('month', created_at at time zone $2)) m) as month_days`,
    [childId, APP_TZ],
  );
  if (!s) return [];
  const earned: Record<string, boolean> = {
    "first-10-words": s.discovered >= 10,
    "100-words-discovered": s.discovered >= 100,
    "100-words-mastered": s.mastered >= 100,
    "grammar-genius": s.grammar80 >= 5,
    "writing-star": s.best_writing >= 80,
    "speaking-champion": s.speaking >= 10,
    "seven-day-streak": s.streak >= 7,
    "story-creator": s.stories_built >= 3,
    "perfect-quiz": s.perfect >= 1,
    "monthly-champion": s.month_days >= 20,
    bookworm: s.stories_read >= 3,
    "explorer-30": s.quests >= 30,
  };
  const slugs = Object.keys(earned).filter((k) => earned[k]);
  if (!slugs.length) return [];
  const fresh = await query<{ slug: string; title: string; emoji: string }>(
    `with ins as (
       insert into child_achievements (child_id, slug) select $1, unnest($2::text[])
       on conflict do nothing returning slug)
     select a.slug, a.title, a.emoji from ins join achievements a on a.slug = ins.slug`,
    [childId, slugs],
  );
  for (const a of fresh) {
    await notifyChild(childId, `${a.emoji} Achievement unlocked: ${a.title}!`, "Amazing work, Explorer!", "achievement");
    await awardXp(childId, "achievement", `ach:${childId}:${a.slug}`, { reason: `Achievement: ${a.title}` });
  }
  return fresh;
}

/** Records time spent for parent reports. */
export async function logActivity(childId: string, module: string, seconds: number, detail: Record<string, unknown> = {}) {
  const s = Math.max(0, Math.min(7200, Math.round(seconds || 0)));
  await query(`insert into activity_log (child_id, module, seconds, detail) values ($1,$2,$3,$4)`, [childId, module, s, JSON.stringify(detail)]);
}
