import "server-only";
import { one, query } from "./db";
import { getJourney } from "./journey";
import { todayKey } from "./time";
import { THEMES } from "./content/curriculum";
import { DAILY_MISSIONS } from "./content/catalog";
import { bandForGrade } from "@/lib/grades";

/**
 * Character "personality memory": greetings built from the child's real learning
 * history and interests (no chat logs are stored or used).
 */
export async function buddyMemory(childId: string, name: string): Promise<{ who: "max" | "lexi" | "story" | "grammy" | "speaky"; line: string }[]> {
  const [lastWord, favCat, lastAch, lastStory, days] = await Promise.all([
    one<{ word: string; emoji: string }>(`select v.word, v.emoji from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1 and p.status = 'mastered' order by p.mastered_at desc nulls last limit 1`, [childId]),
    one<{ category: string; n: number }>(`select t.category, count(*)::int n from writing_submissions w join writing_topics t on t.id = w.topic_id where w.child_id = $1 group by t.category order by n desc limit 1`, [childId]),
    one<{ title: string; emoji: string }>(`select a.title, a.emoji from child_achievements c join achievements a on a.slug = c.slug where c.child_id = $1 order by c.unlocked_at desc limit 1`, [childId]),
    one<{ title: string }>(`select s.title from story_progress p join reading_stories s on s.id = p.story_id where p.child_id = $1 order by p.completed_at desc nulls last limit 1`, [childId]),
    one<{ n: number }>(`select count(distinct created_at::date)::int n from xp_transactions where child_id = $1`, [childId]),
  ]);
  const out: { who: "max" | "lexi" | "story" | "grammy" | "speaky"; line: string }[] = [];
  out.push({ who: "max", line: `Hey ${name}! A brand-new adventure is waiting for you!` });
  if (lastWord) out.push({ who: "lexi", line: `I still remember when you mastered “${lastWord.word}” ${lastWord.emoji}! Ready for more word power?` });
  if (favCat) out.push({ who: "story", line: `You love writing about ${THEMES.find((t) => t.key === favCat.category)?.title.toLowerCase() ?? "amazing things"}! I've got fresh ideas for you.` });
  if (lastAch) out.push({ who: "grammy", line: `Your “${lastAch.title}” ${lastAch.emoji} badge still makes my hat sparkle!` });
  if (lastStory) out.push({ who: "speaky", line: `Remember “${lastStory.title}”? Reading aloud makes your voice super strong!` });
  if ((days?.n ?? 0) >= 5) out.push({ who: "max", line: `You've explored on ${days!.n} days. That's what real Explorers do!` });
  return out;
}

export const ADVENTURE_CHOICES = [
  { key: "vocabulary", title: "Explore Vocabulary Forest", emoji: "🌳", who: "lexi" },
  { key: "grammar", title: "Travel to Grammar Galaxy", emoji: "🚀", who: "grammy" },
  { key: "story", title: "Create a magical story", emoji: "🏰", who: "story" },
  { key: "speaking", title: "Enter Speaking Arena", emoji: "🎤", who: "speaky" },
  { key: "mystery", title: "Solve a mystery challenge", emoji: "🧩", who: "max" },
] as const;

/** Choose Your Adventure: the child picks a mood; the engine picks the right activity (undone plan items and weak skills first). */
export async function chooseAdventure(childId: string, grade: string, choice: string): Promise<{ href: string; title: string }> {
  const j = await getJourney(childId, grade);
  const undone = j.items.filter((i) => !i.done);
  const pickPlan = (types: string[]) => undone.find((i) => types.includes(i.type));
  const p = await one<{ skill_grammar: number; skill_speaking: number }>(`select skill_grammar, skill_speaking from child_profiles where child_id = $1`, [childId]);
  switch (choice) {
    case "vocabulary": {
      const plan = pickPlan(["vocabulary", "revision", "spelling", "listening"]);
      if (plan) return { href: plan.href, title: plan.title };
      const due = await one<{ n: number }>(`select count(*)::int n from child_vocabulary_progress where child_id = $1 and due_on <= $2::date`, [childId, todayKey()]);
      return due?.n ? { href: "/world/revision", title: "Revision Boost" } : { href: "/world/arcade", title: "Word Games Arcade" };
    }
    case "grammar": {
      const plan = pickPlan(["grammar", "sentence"]);
      if (plan) return { href: plan.href, title: plan.title };
      const next = await one<{ slug: string; title: string }>(
        `select t.slug, t.title from grammar_topics t left join grammar_progress g on g.topic_id = t.id and g.child_id = $1
         where t.band_min <= $2 order by coalesce(g.best_score, -1), t.sort_order limit 1`, [childId, bandForGrade(grade)]);
      return next ? { href: `/world/grammar/${next.slug}`, title: next.title } : { href: "/world/grammar", title: "Grammar Galaxy" };
    }
    case "story": {
      const plan = pickPlan(["writing", "story", "reading"]);
      return plan ? { href: plan.href, title: plan.title } : { href: "/world/story-builder", title: "Story Builder" };
    }
    case "speaking": {
      const plan = pickPlan(["speaking", "listening"]);
      if (plan) return { href: plan.href, title: plan.title };
      return (p?.skill_speaking ?? 50) < 50 ? { href: "/world/speaking?mode=words", title: "Word pronunciation practice" } : { href: "/world/speaking", title: "Speaking Arena" };
    }
    default:
      return { href: "/world/challenge/mystery", title: "The Vanishing Words" };
  }
}

export function missionOfTheDay(band: number) {
  const list = DAILY_MISSIONS[band] ?? DAILY_MISSIONS[2];
  const day = Math.floor(new Date(todayKey()).getTime() / 86400000);
  return list[day % list.length];
}

export async function moduleStatus(childId: string) {
  const today = todayKey();
  return (await one<Record<string, number>>(
    `select
      (select count(*)::int from daily_learning_sessions where child_id = $1 and session_date = $2::date and completed_at is not null) quest_done,
      (select count(*)::int from child_vocabulary_progress where child_id = $1) words,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and status = 'mastered') mastered,
      (select count(*)::int from writing_submissions where child_id = $1 and kind = 'topic' and status = 'evaluated') writing,
      (select count(*)::int from grammar_progress where child_id = $1 and completed_at is not null) grammar_done,
      (select count(*)::int from grammar_topics) grammar_total,
      (select count(*)::int from speaking_sessions where child_id = $1) speaking,
      (select count(*)::int from story_progress where child_id = $1 and completed_at is not null) reading_done,
      (select count(*)::int from reading_stories where active) reading_total,
      (select count(*)::int from game_sessions where child_id = $1) games,
      (select count(*)::int from writing_submissions where child_id = $1 and kind = 'story_builder' and status = 'evaluated') stories,
      (select count(*)::int from xp_transactions where child_id = $1 and idempotency_key = 'surprise:' || $1 || ':' || $2) surprise_open,
      (select count(*)::int from xp_transactions where child_id = $1 and idempotency_key = 'mission:' || $1 || ':' || $2) mission_done,
      (select count(*)::int from child_rewards where child_id = $1) rewards`,
    [childId, today]))!;
}
