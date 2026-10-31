import "server-only";
import { one, query } from "./db";
import { addDays, todayKey } from "./time";
import { bandForGrade } from "@/lib/grades";
import { GAME_ROTATION, GRAMMAR_SEQUENCE, THEMES, type PlanActivity } from "./content/curriculum";

export const YEAR_DAYS = 365;
export type ActivityType = PlanActivity["type"];

export interface JourneyItem {
  type: ActivityType; title: string; emoji: string; href: string; detail: string; done: boolean; core: boolean; adapted?: string;
}
export interface Journey {
  day: number; planDay: number; year: number; theme: { key: string; title: string; emoji: string }; focus: string; difficulty: number;
  items: JourneyItem[]; completedToday: boolean; dayComplete: boolean; welcomeBack: number | null; newWords: number;
}

const CORE: ActivityType[] = ["vocabulary", "weekly_assessment"];

/** Grade-wise mix of daily missions (brief: LX 5.0). "a|b" alternates by plan day so activities rotate. */
const MIX: Record<string, string[]> = {
  PRE_KG: ["vocabulary", "game|listening"], LKG: ["vocabulary", "game|listening"], UKG: ["vocabulary", "game|listening"], G1: ["vocabulary", "game|listening"],
  G2: ["vocabulary", "grammar|sentence", "game"],
  G3: ["vocabulary", "grammar", "reading|game"],
  G4: ["vocabulary", "grammar", "reading|writing", "game"],
  G5: ["vocabulary", "grammar", "writing", "reading|speaking"],
  G6: ["vocabulary", "grammar", "writing", "reading", "speaking|game"],
  G7: ["vocabulary", "grammar", "writing", "reading", "speaking|game"],
};
const MIX_BY_BAND: Record<number, string[]> = { 1: MIX.UKG, 2: MIX.G2, 3: MIX.G4, 4: MIX.G6 };
const EXTRAS = ["reading", "game", "speaking", "listening", "revision"];

/**
 * The day's missions, fitted to the grade's daily mission count (admin-configurable in grade_config).
 * New-word count also comes from grade_config. Every fitted mission is part of "today's plan".
 */
export async function dayActivities(grade: string, planDay: number): Promise<PlanActivity[]> {
  const [plan, cfg] = await Promise.all([
    one<{ activities: PlanActivity[] }>(`select activities from learning_plans where grade = $1 and day_number = $2`, [grade, planDay]),
    one<{ daily_missions: number; new_words_per_day: number; band: number }>(`select daily_missions, new_words_per_day, band from grade_config where grade = $1`, [grade]),
  ]);
  const acts = plan?.activities ?? [];
  const n = Math.max(1, cfg?.daily_missions ?? 3);
  const words = cfg?.new_words_per_day ?? 5;
  const band = cfg?.band ?? bandForGrade(grade);
  // Weekly assessment day keeps its shape (assessment first), trimmed to the count.
  if (acts.some((a) => a.type === "weekly_assessment")) return acts.slice(0, n);
  const pick = (type: string): PlanActivity => {
    switch (type) {
      case "vocabulary": return { type: "vocabulary", count: words };
      case "game": return { type: "game", slug: (acts.find((a) => a.type === "game") as { slug: string } | undefined)?.slug ?? GAME_ROTATION[planDay % GAME_ROTATION.length] };
      case "grammar": { const seq = GRAMMAR_SEQUENCE[band]; return { type: "grammar", topic: (acts.find((a) => a.type === "grammar") as { topic: string } | undefined)?.topic ?? seq[planDay % seq.length] }; }
      case "writing": return { type: "writing", category: (acts.find((a) => a.type === "writing") as { category: string } | undefined)?.category ?? THEMES[Math.floor(planDay / 7) % THEMES.length].key };
      default: return { type } as PlanActivity;
    }
  };
  const mix = (MIX[grade] ?? MIX_BY_BAND[band]).map((m) => { const o = m.split("|"); return o[planDay % o.length]; });
  for (const e of EXTRAS) if (mix.length < n && !mix.includes(e)) mix.push(e);
  const out = mix.slice(0, n).map(pick);
  // Special days (championship, events) stay available as a bonus beyond the mandatory count.
  for (const a of acts) if (a.type === "monthly_championship" || a.type === "special") out.push(a);
  return out;
}

/** Skill bands adapt independently: vocabulary uses vocab_band; grammar/writing shift ±1 from grade by skill score. */
export function skillBand(gradeBand: number, skill: number) {
  return Math.max(1, Math.min(4, gradeBand + (skill >= 85 ? 1 : skill < 45 ? -1 : 0)));
}

/**
 * Returns the child's current journey day, advancing at most one plan day per
 * calendar day once the previous day's core activity is done. Missed calendar
 * days never skip content or reset the journey.
 */
export async function getJourney(childId: string, grade: string): Promise<Journey> {
  const today = todayKey();
  const p = (await one<{ journey_day: number; skill_grammar: number; skill_writing: number }>(
    `select journey_day, skill_grammar, skill_writing from child_profiles where child_id = $1`, [childId]))!;
  let day = p.journey_day;
  let row = await one<{ started_on: string; done: string[]; completed_on: string | null }>(
    `select to_char(started_on,'YYYY-MM-DD') started_on, done, to_char(completed_on,'YYYY-MM-DD') completed_on from child_plan_days where child_id = $1 and day_number = $2`,
    [childId, day]);
  let welcomeBack: number | null = null;
  if (row?.completed_on && row.completed_on < today) {
    day += 1;
    await query(`update child_profiles set journey_day = $2 where child_id = $1`, [childId, day]);
    row = null;
  }
  if (!row) {
    const last = await one<{ last: string | null }>(`select to_char(max(coalesce(completed_on, started_on)),'YYYY-MM-DD') last from child_plan_days where child_id = $1`, [childId]);
    if (last?.last) {
      const gap = Math.round((new Date(today).getTime() - new Date(last.last).getTime()) / 86400000);
      if (gap >= 3) welcomeBack = gap;
    }
    await query(`insert into child_plan_days (child_id, day_number, started_on) values ($1,$2,$3::date) on conflict do nothing`, [childId, day, today]);
    row = { started_on: today, done: [], completed_on: null };
  } else if (row.started_on < today && !row.completed_on) {
    const gap = Math.round((new Date(today).getTime() - new Date(row.started_on).getTime()) / 86400000);
    if (gap >= 3) welcomeBack = gap;
  }

  const planDay = ((day - 1) % YEAR_DAYS) + 1;
  const year = Math.ceil(day / YEAR_DAYS);
  const plan = await one<{ theme: string; focus: string; difficulty: number }>(
    `select theme, focus, difficulty from learning_plans where grade = $1 and day_number = $2`, [grade, planDay]);
  const theme = THEMES.find((t) => t.key === plan?.theme) ?? THEMES[0];
  const activities = await dayActivities(grade, planDay);
  const items = await resolveActivities(childId, grade, activities, row.done, p.skill_grammar, p.skill_writing, theme.key);
  const vocab = activities.find((a) => a.type === "vocabulary") as { count: number } | undefined;
  return {
    day, planDay, year, theme, focus: plan?.focus ?? "Learning", difficulty: Math.min(10, (plan?.difficulty ?? 1) + (year - 1)),
    // "Today's plan" is complete when every mandatory mission is done (bonus specials don't count).
    items, completedToday: row.completed_on === today && items.filter((i) => i.core).every((i) => i.done), dayComplete: Boolean(row.completed_on), welcomeBack, newWords: vocab?.count ?? 0,
  };
}

async function resolveActivities(childId: string, grade: string, acts: PlanActivity[], done: string[], skillGrammar: number, skillWriting: number, themeKey: string): Promise<JourneyItem[]> {
  const base = bandForGrade(grade);
  const items: JourneyItem[] = [];
  const doneCount: Record<string, number> = {};
  for (const d of done) doneCount[d] = (doneCount[d] ?? 0) + 1;
  const seen: Record<string, number> = {};
  for (const a of acts) {
    seen[a.type] = (seen[a.type] ?? 0) + 1;
    const isDone = (doneCount[a.type] ?? 0) >= seen[a.type];
    const core = a.type !== "special" && a.type !== "monthly_championship";
    switch (a.type) {
      case "vocabulary": items.push({ type: a.type, core, done: isDone, emoji: "🗝️", title: "Daily Word Quest", detail: `${a.count} new words with LEXI`, href: "/world/quest" }); break;
      case "listening": items.push({ type: a.type, core, done: isDone, emoji: "🎧", title: "Listening Lab", detail: "Hear it, then pick it", href: "/world/listening" }); break;
      case "spelling": items.push({ type: a.type, core, done: isDone, emoji: "🔤", title: "Spelling Challenge", detail: "Spell Master game", href: "/world/arcade/spell-master" }); break;
      case "sentence": items.push({ type: a.type, core, done: isDone, emoji: "🧱", title: "Sentence Formation", detail: "Build sentences with your words", href: "/world/arcade/sentence-builder" }); break;
      case "revision": items.push({ type: a.type, core, done: isDone, emoji: "🔁", title: "Revision Boost", detail: "Review words that are due", href: "/world/revision" }); break;
      case "reading": items.push({ type: a.type, core, done: isDone, emoji: "📚", title: "Reading Adventure", detail: "A story + quiz", href: "/world/reading" }); break;
      case "speaking": items.push({ type: a.type, core, done: isDone, emoji: "🎤", title: "Speaking Mission", detail: "Listen & repeat with SPEAKY", href: "/world/speaking" }); break;
      case "story": items.push({ type: a.type, core, done: isDone, emoji: "📜", title: "Storytelling Challenge", detail: "Story Builder", href: "/world/story-builder" }); break;
      case "game": items.push({ type: a.type, core, done: isDone, emoji: "🕹️", title: "Word Game", detail: a.slug.replace(/-/g, " "), href: `/world/arcade/${a.slug}` }); break;
      case "weekly_assessment": items.push({ type: a.type, core, done: isDone, emoji: "🏅", title: "Weekly Vocabulary Quest", detail: "Show what you learned this week", href: "/world/challenge/weekly" }); break;
      case "boss_battle": items.push({ type: a.type, core, done: isDone, emoji: "👾", title: "Mixed-Skill Boss Battle", detail: "Words + grammar power", href: "/world/challenge/boss" }); break;
      case "monthly_championship": items.push({ type: a.type, core, done: isDone, emoji: "🏆", title: "Monthly English Championship", detail: "Your 30-day showdown", href: "/world/challenge/monthly" }); break;
      case "special": items.push({ type: a.type, core, done: isDone, emoji: "⚡", title: a.title, detail: "Special challenge", href: "/world/challenge/special" }); break;
      case "writing": {
        const band = skillBand(base, skillWriting);
        items.push({ type: a.type, core, done: isDone, emoji: "✍️", title: "Creative Writing Mission", detail: THEMES.find((t) => t.key === a.category)?.title ?? "Writing", href: `/world/writing?category=${a.category}`,
          adapted: band !== base ? (band < base ? "Shorter task to build confidence" : "Stretch task for a strong writer") : undefined });
        break;
      }
      case "grammar": {
        const gBand = skillBand(base, skillGrammar);
        let slug = a.topic;
        let adapted: string | undefined;
        if (skillGrammar < 45) {
          const weak = await one<{ slug: string }>(
            `select t.slug from grammar_progress g join grammar_topics t on t.id = g.topic_id where g.child_id = $1 and g.best_score < 60 order by g.best_score limit 1`, [childId]);
          if (weak) { slug = weak.slug; adapted = "Extra support on a tricky topic"; }
        }
        if (!GRAMMAR_SEQUENCE[gBand].includes(slug) && !adapted) {
          const next = await one<{ slug: string }>(
            `select t.slug from grammar_topics t where t.slug = any($2::text[]) and not exists (select 1 from grammar_progress g where g.topic_id = t.id and g.child_id = $1 and g.best_score >= 80)
             order by array_position($2::text[], t.slug) limit 1`, [childId, GRAMMAR_SEQUENCE[gBand]]);
          if (next) { slug = next.slug; adapted = gBand > base ? "Advanced grammar for you" : "Grammar at your pace"; }
        }
        const t = await one<{ title: string; emoji: string }>(`select title, emoji from grammar_topics where slug = $1`, [slug]);
        items.push({ type: a.type, core, done: isDone, emoji: t?.emoji ?? "🪐", title: `Grammar: ${t?.title ?? slug}`, detail: "Mission with GRAMMY", href: `/world/grammar/${slug}`, adapted });
        break;
      }
    }
  }
  void themeKey;
  return items;
}

/** Marks a plan activity as done for the child's current journey day; completes the day when the core is done. */
export async function markActivity(childId: string, type: ActivityType) {
  const today = todayKey();
  const p = await one<{ journey_day: number; grade: string }>(
    `select p.journey_day, c.grade from child_profiles p join children c on c.id = p.child_id where p.child_id = $1`, [childId]);
  if (!p) return;
  const planDay = ((p.journey_day - 1) % YEAR_DAYS) + 1;
  const planned = (await dayActivities(p.grade, planDay)).filter((a) => a.type === type).length;
  await query(`insert into child_plan_days (child_id, day_number, started_on) values ($1,$2,$3::date) on conflict do nothing`, [childId, p.journey_day, today]);
  if (planned) {
    await query(
      `update child_plan_days set done = done || $3::text where child_id = $1 and day_number = $2 and coalesce(array_length(array_positions(done, $3::text),1),0) < $4`,
      [childId, p.journey_day, type, planned]);
  }
  if (CORE.includes(type) && planned) {
    await query(`update child_plan_days set completed_on = coalesce(completed_on, $3::date) where child_id = $1 and day_number = $2`, [childId, p.journey_day, today]);
  }
}

/** Calendar view of the year: completed days, today and upcoming plan days. */
export async function calendar(childId: string, grade: string) {
  const p = (await one<{ journey_day: number }>(`select journey_day from child_profiles where child_id = $1`, [childId]))!;
  const year = Math.ceil(p.journey_day / YEAR_DAYS);
  const offset = (year - 1) * YEAR_DAYS;
  const [plans, days] = await Promise.all([
    query<{ day_number: number; focus: string; theme: string; week: number; month: number; activities: PlanActivity[] }>(
      `select day_number, focus, theme, week, month, activities from learning_plans where grade = $1 order by day_number`, [grade]),
    query<{ day_number: number; done: string[]; completed_on: string | null; started_on: string }>(
      `select day_number, done, to_char(completed_on,'YYYY-MM-DD') completed_on, to_char(started_on,'YYYY-MM-DD') started_on
       from child_plan_days where child_id = $1 and day_number > $2 and day_number <= $3`, [childId, offset, offset + YEAR_DAYS]),
  ]);
  const byDay = new Map(days.map((d) => [d.day_number - offset, d]));
  return {
    year, current: p.journey_day - offset,
    days: plans.map((pl) => {
      const d = byDay.get(pl.day_number);
      return { day: pl.day_number, week: pl.week, month: pl.month, focus: pl.focus, theme: pl.theme,
        activities: pl.activities.map((a) => a.type), done: d?.done ?? [], completedOn: d?.completed_on ?? null };
    }),
  };
}

export function estimatedDate(fromDay: number, toDay: number) {
  return addDays(todayKey(), Math.max(0, toDay - fromDay));
}
