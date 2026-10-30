import "server-only";
import { one, query } from "./db";
import { APP_TZ, todayKey } from "./time";

export interface Recommendation { module: string; title: string; reason: string; href: string; priority: number; emoji: string; who: "max" | "lexi" | "grammy" | "speaky" | "story" }

/**
 * Personalisation engine. Looks at skill-level signals (not just grade) so a
 * child can be strong in vocabulary and still get sentence-building help.
 */
export async function recommend(childId: string): Promise<Recommendation[]> {
  const today = todayKey();
  const s = (await one<Record<string, number | null>>(
    `select
      (select avg(case when correct then 1 else 0 end)::float from daily_word_challenges where child_id = $1 and challenge_type = 'spelling' and answered_at > now() - interval '30 days') as spelling_acc,
      (select count(*)::int from daily_word_challenges where child_id = $1 and challenge_type = 'spelling' and answered_at > now() - interval '30 days') as spelling_n,
      (select avg(case when correct then 1 else 0 end)::float from daily_word_challenges where child_id = $1 and challenge_type in ('fill_blank','usage') and answered_at > now() - interval '30 days') as sentence_acc,
      (select count(*)::int from daily_word_challenges where child_id = $1 and challenge_type in ('fill_blank','usage') and answered_at > now() - interval '30 days') as sentence_n,
      (select avg(case when correct then 1 else 0 end)::float from daily_word_challenges where child_id = $1 and challenge_type in ('meaning','picture') and answered_at > now() - interval '30 days') as meaning_acc,
      (select avg(e.score)::float from writing_evaluations e join writing_submissions w on w.id = e.submission_id where w.child_id = $1 and e.created_at > now() - interval '30 days') as writing_avg,
      (select count(*)::int from writing_submissions where child_id = $1 and submitted_at > now() - interval '7 days') as writing_7d,
      (select count(*)::int from grammar_progress where child_id = $1) as grammar_started,
      (select count(*)::int from story_progress where child_id = $1 and completed_at is not null) as stories_read,
      (select count(*)::int from speaking_sessions where child_id = $1 and created_at > now() - interval '7 days') as speaking_7d,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and due_on <= $2::date and first_seen_at < $2::date) as due,
      (select count(*)::int from daily_learning_sessions where child_id = $1 and session_date = $2::date and completed_at is not null) as quest_done,
      (select count(*)::int from game_sessions where child_id = $1 and (created_at at time zone $3)::date = $2::date) as games_today`,
    [childId, today, APP_TZ],
  ))!;
  const n = (k: string) => Number(s[k] ?? 0);
  const recs: Recommendation[] = [];

  if (!n("quest_done")) recs.push({ module: "quest", title: "Today's 10 new words", reason: "I found 10 magical new words for you today!", href: "/world/quest", priority: 100, emoji: "🗝️", who: "lexi" });
  if (n("spelling_n") >= 3 && n("spelling_acc") < 0.6)
    recs.push({ module: "spelling", title: "Spell Master", reason: "Some sneaky words love to hide their letters. Let's catch them in Spell Master!", href: "/world/arcade/spell-master", priority: 90, emoji: "🔤", who: "lexi" });
  if (n("sentence_n") >= 3 && n("sentence_acc") < 0.6 && n("meaning_acc") >= 0.7)
    recs.push({ module: "sentences", title: "Sentence Builder", reason: "You know so many word meanings! Let's explore a few more sentence adventures.", href: "/world/arcade/sentence-builder", priority: 88, emoji: "🧱", who: "grammy" });
  if (n("due") > 0)
    recs.push({ module: "revision", title: `Revise ${n("due")} word${n("due") > 1 ? "s" : ""}`, reason: "Some of your words are ready for a memory boost!", href: "/world/revision", priority: 80, emoji: "🔁", who: "lexi" });
  if (s.writing_avg !== null && n("writing_avg") < 60)
    recs.push({ module: "writing", title: "Short writing mission", reason: "Let's explore a few more writing adventures — I have sparkly tips for you!", href: "/world/writing", priority: 75, emoji: "✍️", who: "grammy" });
  else if (!n("writing_7d"))
    recs.push({ module: "writing", title: "Creative Writing Studio", reason: "Your imagination misses you! Shall we write something fun?", href: "/world/writing", priority: 60, emoji: "✍️", who: "story" });
  if (!n("grammar_started"))
    recs.push({ module: "grammar", title: "Grammar Galaxy", reason: "Let's explore a few grammar adventures together!", href: "/world/grammar", priority: 65, emoji: "🪐", who: "grammy" });
  if (!n("stories_read"))
    recs.push({ module: "reading", title: "Reading Adventures", reason: "A story is waiting just for you!", href: "/world/reading", priority: 55, emoji: "📚", who: "story" });
  if (!n("speaking_7d"))
    recs.push({ module: "speaking", title: "Speaking Arena", reason: "I'd love to hear your voice today!", href: "/world/speaking", priority: 50, emoji: "🎤", who: "speaky" });
  if (!n("games_today") && n("quest_done"))
    recs.push({ module: "games", title: "Word Games Arcade", reason: "Let's play with the words you just learned!", href: "/world/arcade", priority: 45, emoji: "🕹️", who: "max" });

  // Interest signal: the activity the child chose most in the last 14 days → a friendly "I noticed you enjoy…" suggestion.
  const fav = await one<{ module: string }>(
    `select module from activity_log where child_id = $1 and created_at > now() - interval '14 days' and module in ('word_games','writing','reading','speaking','grammar','story_builder','listening')
     group by module order by count(*) desc limit 1`, [childId]);
  const FAV: Record<string, Omit<Recommendation, "priority" | "module">> = {
    word_games: { title: "Vocabulary Boss Battle", reason: "I noticed you LOVE word games! Ready for a boss-sized challenge?", href: "/world/arcade/boss-battle", emoji: "👾", who: "max" },
    writing: { title: "Story Builder", reason: "I noticed you enjoy writing! Shall we spin a brand-new story?", href: "/world/story-builder", emoji: "📜", who: "story" },
    reading: { title: "A new Reading Adventure", reason: "You're such a reader! A fresh story is waiting.", href: "/world/reading", emoji: "📚", who: "story" },
    speaking: { title: "New speaking scenario", reason: "Your voice sounds great! Try a new real-life conversation.", href: "/world/speaking", emoji: "🎤", who: "speaky" },
    grammar: { title: "Sentence adventure", reason: "Hey Explorer! I noticed you enjoy building sentences. Shall we try a new sentence adventure?", href: "/world/arcade/sentence-builder", emoji: "🧱", who: "grammy" },
    story_builder: { title: "Creative Writing mission", reason: "Your stories are magical! Try a writing mission about something new.", href: "/world/writing", emoji: "✍️", who: "story" },
    listening: { title: "Listening Lab", reason: "Super ears! Let's try trickier sounds.", href: "/world/listening", emoji: "🎧", who: "speaky" },
  };
  if (fav && FAV[fav.module] && !recs.some((r) => r.href === FAV[fav.module].href)) recs.push({ ...FAV[fav.module], module: `interest_${fav.module}`, priority: 70 });

  recs.sort((a, b) => b.priority - a.priority);
  const top = recs.slice(0, 4);
  // Persist for analytics / parent insight (one row per module per day).
  for (const r of top) {
    await query(
      `insert into personalised_recommendations (child_id, module, title, reason, priority, created_on)
       values ($1,$2,$3,$4,$5,$6::date) on conflict (child_id, created_on, module) do nothing`,
      [childId, r.module, r.title, r.reason, r.priority, today],
    );
  }
  return top;
}
