import "server-only";
import { one, query } from "./db";
import { todayKey } from "./time";
import { bandForGrade } from "@/lib/grades";
import { GRAMMAR_SEQUENCE } from "./content/curriculum";
import { skillProfile } from "./skills";
import { skillBand } from "./journey";
import { suggestLevel, type Level } from "@/lib/reallife";
import { realWorldScore } from "./reallife";

export type RecKind = "learn_next" | "practise_more" | "revise_now" | "explore_new" | "challenge";
export interface Rec { kind: RecKind; title: string; reason: string; href: string; emoji: string; who: "max" | "lexi" | "grammy" | "speaky" | "story"; skill: string }
export const REC_LABELS: Record<RecKind, string> = {
  learn_next: "Learn next", practise_more: "Practise more", revise_now: "Revise now", explore_new: "Explore something new", challenge: "Challenge yourself",
};

/** Where to practise a skill that needs support (specific, gentle activities). */
const PRACTICE: Record<string, Omit<Rec, "kind" | "skill">> = {
  vocabulary: { title: "Word Match", reason: "Let's practise these words again.", href: "/world/arcade/word-match", emoji: "🧩", who: "lexi" },
  spelling: { title: "Spell Master", reason: "Some sneaky letters need catching. Let's practise spelling!", href: "/world/arcade/spell-master", emoji: "🔤", who: "lexi" },
  phonics: { title: "Spell Master (listen & spell)", reason: "Let's listen closely to the sounds in words.", href: "/world/arcade/spell-master", emoji: "👂", who: "lexi" },
  writing: { title: "Improve My Sentence", reason: "Let's make your sentences even more exciting!", href: "/world/writing/improve", emoji: "✨", who: "story" },
  listening: { title: "Listening Lab", reason: "Let's tune up those super ears!", href: "/world/listening", emoji: "🎧", who: "speaky" },
  speaking: { title: "Speaking Arena", reason: "Let's practise speaking together.", href: "/world/speaking", emoji: "🎤", who: "speaky" },
  pronunciation: { title: "Speaking Arena", reason: "Let's practise saying words clearly.", href: "/world/speaking", emoji: "🗣️", who: "speaky" },
  comprehension: { title: "Guided reading", reason: "Let's read a story together and talk about it.", href: "/world/reading", emoji: "📖", who: "story" },
  real_world: { title: "VIBE Real Life (beginner)", reason: "Let's practise everyday conversations step by step.", href: "/world/real-life", emoji: "🌍", who: "max" },
};

/**
 * Learning Intelligence: recommends specific content in five categories from the child's own evidence — age band,
 * grade, completed content, accuracy, revision due, skill estimates (each skill independent) and recent activity.
 * Two children in the same grade get different suggestions. Rule-based SQL: fast and no AI calls.
 */
export async function recommendations(child: { id: string; grade: string }): Promise<Rec[]> {
  const today = todayKey();
  const band = bandForGrade(child.grade);
  const [skills, profile, counts, rwScore] = await Promise.all([
    skillProfile(child.id),
    one<{ skill_grammar: number; skill_reading: number }>(`select skill_grammar, skill_reading from child_profiles where child_id = $1`, [child.id]),
    one<{ quest_done: number; due: number; tricky: number }>(
      `select (select count(*)::int from daily_learning_sessions where child_id = $1 and session_date = $2::date and completed_at is not null) quest_done,
              (select count(*)::int from child_vocabulary_progress where child_id = $1 and due_on <= $2::date and first_seen_at < $2::date) due,
              (select count(*)::int from child_vocabulary_progress where child_id = $1 and wrong_count > correct_count and status <> 'mastered') tricky`, [child.id, today]),
    realWorldScore(child.id),
  ]);
  const confident = skills.filter((s) => s.confident);
  const gBand = skillBand(band, profile?.skill_grammar ?? 50);
  const rBand = skillBand(band, profile?.skill_reading ?? 50);
  const out: Rec[] = [];

  // A. LEARN NEXT — today's new words first; otherwise the next grammar topic or story at the child's level.
  if (!counts?.quest_done) out.push({ kind: "learn_next", skill: "vocabulary", title: "Today's 5 new words", reason: "Five magical new words are waiting for you!", href: "/world/quest", emoji: "🗝️", who: "lexi" });
  else {
    const g = await one<{ slug: string; title: string; emoji: string }>(
      `select t.slug, t.title, t.emoji from grammar_topics t where t.slug = any($2::text[])
         and not exists (select 1 from grammar_progress p where p.topic_id = t.id and p.child_id = $1 and p.best_score >= 80)
       order by array_position($2::text[], t.slug) limit 1`, [child.id, GRAMMAR_SEQUENCE[gBand]]);
    if (g) out.push({ kind: "learn_next", skill: "grammar", title: `Grammar: ${g.title}`, reason: "Try this grammar adventure next.", href: `/world/grammar/${g.slug}`, emoji: g.emoji, who: "grammy" });
  }

  // B. PRACTISE MORE — the weakest skill, only when there is enough evidence (never after one or two answers).
  const weak = confident.filter((s) => s.score < 60 && PRACTICE[s.key]).sort((a, b) => a.score - b.score)[0];
  if (weak) out.push({ kind: "practise_more", skill: weak.key, ...PRACTICE[weak.key] });
  else if ((counts?.tricky ?? 0) > 0) out.push({ kind: "practise_more", skill: "vocabulary", title: "My tricky words", reason: "Let's practise these words again.", href: "/world/discoveries", emoji: "🔍", who: "lexi" });

  // C. REVISE NOW — spaced revision that is due (revision never counts as new words).
  if ((counts?.due ?? 0) > 0) out.push({ kind: "revise_now", skill: "vocabulary", title: `Revise ${counts!.due} word${counts!.due > 1 ? "s" : ""}`, reason: "Some of your words are ready for a memory boost!", href: "/world/revision", emoji: "🔁", who: "lexi" });

  // D. EXPLORE SOMETHING NEW — an unread story at the child's reading level, or a real-life scenario not tried yet.
  const level: Level = suggestLevel(band, rwScore);
  const [story, scene] = await Promise.all([
    one<{ slug: string; title: string; emoji: string; band: number }>(
      `select s.slug, s.title, s.emoji, s.band from reading_stories s where s.active and s.reward is null
         and not exists (select 1 from story_progress p where p.story_id = s.id and p.child_id = $1 and p.completed_at is not null)
       order by abs(s.band - $2), s.band, s.slug limit 1`, [child.id, rBand]),
    one<{ slug: string; title: string; emoji: string }>(
      `select r.slug, r.title, r.emoji from real_life_scenarios r where r.active and r.band_min <= $2
         and not exists (select 1 from real_life_progress p where p.slug = r.slug and p.child_id = $1)
       order by r.sort_order limit 1`, [child.id, band]),
  ]);
  const exploreScene = scene ? { kind: "explore_new" as const, skill: "real_world", title: scene.title, reason: "Try a brand-new real-life adventure!", href: `/world/real-life/${scene.slug}?level=${level}`, emoji: scene.emoji, who: "max" as const } : null;
  const exploreStory = story ? { kind: "explore_new" as const, skill: "reading", title: story.title, reason: "You are ready for a new reading adventure.", href: `/world/reading/${story.slug}`, emoji: story.emoji, who: "story" as const } : null;
  // Rotate daily between story and scenario so exploring stays fresh.
  const pick = new Date(today).getDate() % 2 === 0 ? [exploreScene, exploreStory] : [exploreStory, exploreScene];
  const explore = pick.find(Boolean);
  if (explore) out.push(explore);

  // E. CHALLENGE YOURSELF — only when a skill is clearly strong (enough evidence and a high estimate).
  const strong = confident.filter((s) => s.score >= 80).sort((a, b) => b.score - a.score)[0];
  if (strong) {
    if (strong.key === "reading" || strong.key === "comprehension") {
      const harder = await one<{ slug: string; title: string; emoji: string }>(
        `select s.slug, s.title, s.emoji from reading_stories s where s.active and s.reward is null and s.band > $2
           and not exists (select 1 from story_progress p where p.story_id = s.id and p.child_id = $1 and p.completed_at is not null) order by s.band, s.slug limit 1`, [child.id, rBand]);
      if (harder) out.push({ kind: "challenge", skill: strong.key, title: harder.title, reason: "You've grown so much as a reader. Ready for a bigger story?", href: `/world/reading/${harder.slug}`, emoji: harder.emoji, who: "story" });
    } else if (strong.key === "real_world" || strong.key === "speaking") {
      out.push({ kind: "challenge", skill: strong.key, title: "Real Life: Advanced", reason: "Your conversations are brilliant. Try the advanced level!", href: `/world/real-life/restaurant?level=advanced`, emoji: "🌟", who: "max" });
    } else if (strong.key === "grammar") {
      const up = GRAMMAR_SEQUENCE[Math.min(4, gBand + 1)]?.[0];
      if (up) out.push({ kind: "challenge", skill: "grammar", title: "A harder grammar mission", reason: "You have improved in grammar! Try a trickier mission.", href: `/world/grammar/${up}`, emoji: "🪐", who: "grammy" });
    } else {
      out.push({ kind: "challenge", skill: strong.key, title: "Vocabulary Boss Battle", reason: "Your word power is strong. Ready for a boss-sized challenge?", href: "/world/arcade/boss-battle", emoji: "👾", who: "max" });
    }
  }

  // Persist today's suggestions (analytics and parent insight; one row per category per day).
  for (const r of out) {
    await query(`insert into personalised_recommendations (child_id, module, title, reason, priority, created_on) values ($1,$2,$3,$4,$5,$6::date) on conflict (child_id, created_on, module) do nothing`,
      [child.id, `${r.kind}:${r.skill}`, r.title, r.reason, 100 - out.indexOf(r) * 10, today]);
  }
  return out;
}
