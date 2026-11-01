import "server-only";
import { one, query } from "./db";
import { skillTree } from "./skills";
import { bandForGrade } from "@/lib/grades";

/**
 * Adventure Passport. Stamps come from real activity only and are recorded ONCE (primary key child_id+slug),
 * with the date they were first earned. VIBE Real Life writes its own stamps; the rest are derived here.
 */
type Def = { slug: string; title: string; emoji: string; kind: string; hint: string; earned: (f: Facts) => boolean };
type Facts = { modules: Set<string>; words: number; stories: number; improved: number; badges: number; realLife: number; phonics: number; grammar: number; speaking: number; listening: number; created: number; nodes: number; scenes: number };

const KINGDOM = (slug: string, title: string, emoji: string, mods: string[], hint: string): Def =>
  ({ slug: `k-${slug}`, title, emoji, kind: "kingdom", hint, earned: (f) => mods.some((m) => f.modules.has(m)) });
export const STAMPS: Def[] = [
  KINGDOM("vocabulary-forest", "Vocabulary Forest", "🌳", ["daily_word_quest", "word_games", "revision"], "Learn today's words"),
  KINGDOM("grammar-galaxy", "Grammar Galaxy", "🪐", ["grammar", "grammar_drill"], "Try a grammar adventure"),
  KINGDOM("reading-ocean", "Reading Ocean", "🌊", ["reading"], "Read a story"),
  KINGDOM("storytelling-castle", "Storytelling Castle", "🏰", ["writing", "story_builder", "improve_sentence"], "Write or improve a sentence"),
  KINGDOM("speaking-arena", "Speaking Arena", "🎤", ["speaking"], "Practise speaking"),
  KINGDOM("real-life-city", "Real Life City", "🌍", ["real_life"], "Finish a VIBE Real Life scenario"),
  KINGDOM("phonics-valley", "Phonics & Sound Valley", "🎶", ["phonics"], "Walk a sound path in Phonics Valley"),
  ...[10, 25, 50, 100].map((n) => ({ slug: `w-${n}`, title: `${n} words discovered`, emoji: n >= 50 ? "🏅" : "🗝️", kind: "words", hint: `Discover ${n} words`, earned: (f: Facts) => f.words >= n })),
  ...[1, 5, 10].map((n) => ({ slug: `s-${n}`, title: n === 1 ? "First story read" : `${n} stories read`, emoji: "📖", kind: "stories", hint: `Finish ${n} ${n === 1 ? "story" : "stories"}`, earned: (f: Facts) => f.stories >= n })),
  { slug: "i-1", title: "Sentence Sculptor", emoji: "✨", kind: "writing", hint: "Improve one of your own sentences", earned: (f) => f.improved >= 1 },
  { slug: "a-1", title: "First badge", emoji: "🎖️", kind: "achievement", hint: "Earn any achievement badge", earned: (f) => f.badges >= 1 },
  { slug: "ph-3", title: "Sound Explorer", emoji: "👂", kind: "phonics", hint: "Pass 3 sound paths in Phonics Valley", earned: (f) => f.phonics >= 3 },
  { slug: "ph-12", title: "Phonics Champion", emoji: "🎶", kind: "phonics", hint: "Pass all 12 sound paths", earned: (f) => f.phonics >= 12 },
  { slug: "g-1", title: "Grammar Star", emoji: "🪐", kind: "grammar", hint: "Score 80% on a grammar mission", earned: (f) => f.grammar >= 1 },
  { slug: "g-5", title: "Grammar Wizard", emoji: "🧙", kind: "grammar", hint: "Score 80% on 5 grammar missions", earned: (f) => f.grammar >= 5 },
  { slug: "sp-5", title: "Brave Speaker", emoji: "🎤", kind: "speaking", hint: "Complete 5 speaking sessions", earned: (f) => f.speaking >= 5 },
  { slug: "l-3", title: "Super Ears", emoji: "🎧", kind: "listening", hint: "Complete 3 listening challenges", earned: (f) => f.listening >= 3 },
  { slug: "rl-5", title: "World Traveller", emoji: "🧳", kind: "real_life", hint: "Complete 5 different real-life places", earned: (f) => f.realLife >= 5 },
  { slug: "sc-1", title: "Story Creator", emoji: "📜", kind: "writing", hint: "Save a story in Story Builder", earned: (f) => f.created >= 1 },
  { slug: "ws-1", title: "Scene Explorer", emoji: "🖼️", kind: "words", hint: "Explore a Word Scene", earned: (f) => f.scenes >= 1 },
  { slug: "ws-8", title: "World of Words", emoji: "🗺️", kind: "words", hint: "Explore all 8 Word Scenes", earned: (f) => f.scenes >= 8 },
  { slug: "t-1", title: "First Mastery", emoji: "🌳", kind: "skills", hint: "Reach Demonstrated mastery on any skill-tree node", earned: (f) => f.nodes >= 1 },
];

export async function passport(childId: string) {
  const f = await one<{ modules: string[]; words: number; stories: number; improved: number; badges: number; real_life: number; phonics: number; grammar: number; speaking: number; listening: number; created: number; scenes: number }>(
    `select array(select distinct module from activity_log where child_id = $1) modules,
            (select count(*)::int from child_vocabulary_progress where child_id = $1) words,
            (select count(*)::int from story_progress where child_id = $1 and completed_at is not null) stories,
            (select count(*)::int from sentence_improvements where child_id = $1 and improved) improved,
            (select count(*)::int from child_achievements where child_id = $1) badges,
            (select count(*)::int from passport_stamps where child_id = $1 and kind = 'real_life' and slug like 'rl-%' and slug <> 'rl-5') real_life,
            (select count(*)::int from phonics_progress where child_id = $1 and best_score >= 60) phonics,
            (select count(*)::int from grammar_progress where child_id = $1 and best_score >= 80) grammar,
            (select count(*)::int from speaking_sessions where child_id = $1) speaking,
            (select count(*)::int from activity_log where child_id = $1 and module = 'challenge_listening') listening,
            (select count(*)::int from writing_submissions where child_id = $1 and kind = 'story_builder' and word_count > 0) created,
            (select count(*)::int from scene_progress where child_id = $1) scenes`, [childId]);
  const g = await one<{ grade: string }>(`select grade from children where id = $1`, [childId]);
  const tree = await skillTree(childId, bandForGrade(g?.grade ?? "G3"));
  const facts: Facts = { modules: new Set(f?.modules ?? []), words: f?.words ?? 0, stories: f?.stories ?? 0, improved: f?.improved ?? 0, badges: f?.badges ?? 0, realLife: f?.real_life ?? 0,
    phonics: f?.phonics ?? 0, grammar: f?.grammar ?? 0, speaking: f?.speaking ?? 0, listening: f?.listening ?? 0, created: f?.created ?? 0, nodes: tree.filter((n) => n.status === "mastered").length, scenes: f?.scenes ?? 0 };
  for (const d of STAMPS.filter((s) => s.earned(facts))) {
    await query(`insert into passport_stamps (child_id, slug, title, emoji, kind) values ($1,$2,$3,$4,$5) on conflict (child_id, slug) do nothing`, [childId, d.slug, d.title, d.emoji, d.kind]);
  }
  const stamps = await query<{ slug: string; title: string; emoji: string; kind: string; created_at: string }>(
    `select slug, title, emoji, kind, to_char(created_at,'YYYY-MM-DD') created_at from passport_stamps where child_id = $1 order by created_at, slug`, [childId]);
  const have = new Set(stamps.map((s) => s.slug));
  const next = STAMPS.filter((s) => !have.has(s.slug)).map(({ slug, title, emoji, hint, kind }) => ({ slug, title, emoji, hint, kind }));
  return { stamps, next };
}
