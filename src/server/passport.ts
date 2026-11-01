import "server-only";
import { one, query } from "./db";

/**
 * Adventure Passport. Stamps come from real activity only and are recorded ONCE (primary key child_id+slug),
 * with the date they were first earned. VIBE Real Life writes its own stamps; the rest are derived here.
 */
type Def = { slug: string; title: string; emoji: string; kind: string; hint: string; earned: (f: Facts) => boolean };
type Facts = { modules: Set<string>; words: number; stories: number; improved: number; badges: number; realLife: number };

const KINGDOM = (slug: string, title: string, emoji: string, mods: string[], hint: string): Def =>
  ({ slug: `k-${slug}`, title, emoji, kind: "kingdom", hint, earned: (f) => mods.some((m) => f.modules.has(m)) });
export const STAMPS: Def[] = [
  KINGDOM("vocabulary-forest", "Vocabulary Forest", "🌳", ["daily_word_quest", "word_games", "revision"], "Learn today's words"),
  KINGDOM("grammar-galaxy", "Grammar Galaxy", "🪐", ["grammar", "grammar_drill"], "Try a grammar adventure"),
  KINGDOM("reading-ocean", "Reading Ocean", "🌊", ["reading"], "Read a story"),
  KINGDOM("storytelling-castle", "Storytelling Castle", "🏰", ["writing", "story_builder", "improve_sentence"], "Write or improve a sentence"),
  KINGDOM("speaking-arena", "Speaking Arena", "🎤", ["speaking"], "Practise speaking"),
  KINGDOM("real-life-city", "Real Life City", "🌍", ["real_life"], "Finish a VIBE Real Life scenario"),
  ...[10, 25, 50, 100].map((n) => ({ slug: `w-${n}`, title: `${n} words discovered`, emoji: n >= 50 ? "🏅" : "🗝️", kind: "words", hint: `Discover ${n} words`, earned: (f: Facts) => f.words >= n })),
  ...[1, 5, 10].map((n) => ({ slug: `s-${n}`, title: n === 1 ? "First story read" : `${n} stories read`, emoji: "📖", kind: "stories", hint: `Finish ${n} ${n === 1 ? "story" : "stories"}`, earned: (f: Facts) => f.stories >= n })),
  { slug: "i-1", title: "Sentence Sculptor", emoji: "✨", kind: "writing", hint: "Improve one of your own sentences", earned: (f) => f.improved >= 1 },
  { slug: "a-1", title: "First badge", emoji: "🎖️", kind: "achievement", hint: "Earn any achievement badge", earned: (f) => f.badges >= 1 },
];

export async function passport(childId: string) {
  const f = await one<{ modules: string[]; words: number; stories: number; improved: number; badges: number; real_life: number }>(
    `select array(select distinct module from activity_log where child_id = $1) modules,
            (select count(*)::int from child_vocabulary_progress where child_id = $1) words,
            (select count(*)::int from story_progress where child_id = $1 and completed_at is not null) stories,
            (select count(*)::int from sentence_improvements where child_id = $1 and improved) improved,
            (select count(*)::int from child_achievements where child_id = $1) badges,
            (select count(*)::int from passport_stamps where child_id = $1 and kind = 'real_life') real_life`, [childId]);
  const facts: Facts = { modules: new Set(f?.modules ?? []), words: f?.words ?? 0, stories: f?.stories ?? 0, improved: f?.improved ?? 0, badges: f?.badges ?? 0, realLife: f?.real_life ?? 0 };
  for (const d of STAMPS.filter((s) => s.earned(facts))) {
    await query(`insert into passport_stamps (child_id, slug, title, emoji, kind) values ($1,$2,$3,$4,$5) on conflict (child_id, slug) do nothing`, [childId, d.slug, d.title, d.emoji, d.kind]);
  }
  const stamps = await query<{ slug: string; title: string; emoji: string; kind: string; created_at: string }>(
    `select slug, title, emoji, kind, to_char(created_at,'YYYY-MM-DD') created_at from passport_stamps where child_id = $1 order by created_at, slug`, [childId]);
  const have = new Set(stamps.map((s) => s.slug));
  const next = STAMPS.filter((s) => !have.has(s.slug)).map(({ slug, title, emoji, hint, kind }) => ({ slug, title, emoji, hint, kind }));
  return { stamps, next };
}
