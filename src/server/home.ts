import "server-only";
import { one, query } from "./db";
import { todayKey } from "./time";
import { bandForGrade } from "@/lib/grades";
import { getJourney } from "./journey";

export interface HomeWord { id: string; word: string; part_of_speech: string; phonetic: string; meaning: string; explanation: string; example: string; emoji: string; band: number }
export interface HomeStory { slug: string; title: string; genre: string; band: number; emoji: string; cover: string; teaser: string; minutes: number; firstPage: string }
export interface Discover { band: number; word: HomeWord | null; cloud: HomeWord[]; puzzle: { answer: string; options: string[]; emoji: string; meaning: string } | null; story: HomeStory | null }

/** Same pick all day for everyone in a band (stable "of the day"), different each day. */
const daySeed = (salt: string) => { let h = 2166136261; for (const c of todayKey() + salt) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

/**
 * Word of the Day, a 30-second discovery puzzle and Story of the Day for an age band (1 = Pre-KG–UKG … 4 = Grades 5–7).
 * Only published vocabulary and active stories are used (the same validated content children see).
 */
export async function discover(band: number): Promise<Discover> {
  const b = Math.min(4, Math.max(1, Math.round(band) || 2));
  const n = (await one<{ n: number }>(`select count(*)::int n from vocabulary_master where status = 'published' and band = $1 and word !~ ' '`, [b]))?.n ?? 0;
  const word = n ? await one<HomeWord>(
    `select id, word, part_of_speech, phonetic, meaning, explanation, example, emoji, band from vocabulary_master
     where status = 'published' and band = $1 and word !~ ' ' order by word offset $2 limit 1`, [b, daySeed(`w${b}`) % n]) : null;
  // Discovery puzzle: a different word than the Word of the Day, guessed from its picture and meaning.
  const pz = n > 3 ? await one<HomeWord>(
    `select id, word, part_of_speech, phonetic, meaning, explanation, example, emoji, band from vocabulary_master
     where status = 'published' and band = $1 and word !~ ' ' order by word offset $2 limit 1`, [b, (daySeed(`p${b}`) % (n - 1) + 1 + daySeed(`w${b}`) % n) % n]) : null;
  const others = pz ? await query<{ word: string }>(
    `select word from vocabulary_master where status = 'published' and band = $1 and id <> $2 and word !~ ' ' order by md5(word || $3) limit 2`, [b, pz.id, todayKey()]) : [];
  const stories = await query<{ slug: string; title: string; genre: string; band: number; emoji: string; cover: string; pages: { text: string }[] }>(
    `select slug, title, genre, band, emoji, cover, pages from reading_stories where active and reward is null order by abs(band - $1), slug`, [b]);
  const near = stories.filter((s) => s.band === stories[0]?.band);
  const s = near.length ? near[daySeed(`s${b}`) % near.length] : null;
  const text = s ? s.pages.map((p) => p.text).join(" ") : "";
  const story = s ? { slug: s.slug, title: s.title, genre: s.genre, band: s.band, emoji: s.emoji, cover: s.cover,
    teaser: (s.pages[0]?.text ?? "").split(/(?<=[.!?])\s+/).slice(0, 2).join(" "), firstPage: s.pages[0]?.text ?? "",
    minutes: Math.max(1, Math.round(text.split(/\s+/).length / (b <= 1 ? 60 : 110))) } : null;
  // Floating Word Universe: a handful of the band's words for today.
  const cloud = n ? await query<HomeWord>(
    `select id, word, part_of_speech, phonetic, meaning, explanation, example, emoji, band from vocabulary_master
     where status = 'published' and band = $1 and word !~ ' ' and length(word) <= 11 order by md5(word || $2) limit 7`, [b, todayKey()]) : [];
  return {
    band: b, word, cloud,
    puzzle: pz ? { answer: pz.word, emoji: pz.emoji, meaning: pz.meaning, options: [pz.word, ...others.map((o) => o.word)].sort((x, y) => daySeed(x) - daySeed(y)) } : null,
    story,
  };
}

export interface HomeMe { name: string; level: number; levelName: string; wordsToday: number; wordsDone: boolean; missionsDone: number; missionsTotal: number; treasureReady: boolean; treasureOpened: boolean; recommended: { title: string; href: string; emoji: string } | null; band: number }

/** Small personal summary for a signed-in child on the homepage (not a full dashboard). */
export async function homeMe(child: { id: string; display_name: string; grade: string }): Promise<HomeMe> {
  const [lv, j] = await Promise.all([
    one<{ level_id: number; name: string }>(`select p.level_id, l.name from child_profiles p join learning_levels l on l.id = p.level_id where p.child_id = $1`, [child.id]),
    getJourney(child.id, child.grade),
  ]);
  const today = todayKey();
  const surprise = await one(`select 1 from xp_transactions where child_id = $1 and idempotency_key = $2`, [child.id, `surprise:${child.id}:${today}`]);
  const vocab = j.items.find((i) => i.type === "vocabulary");
  const next = j.items.find((i) => !i.done);
  const core = j.items.filter((i) => i.core);
  return {
    name: child.display_name, level: lv?.level_id ?? 1, levelName: lv?.name ?? "Word Explorer", band: bandForGrade(child.grade),
    wordsToday: j.newWords, wordsDone: Boolean(vocab?.done), missionsDone: core.filter((i) => i.done).length, missionsTotal: core.length,
    treasureReady: Boolean(vocab?.done) && !surprise, treasureOpened: Boolean(surprise),
    recommended: next ? { title: next.title, href: next.href, emoji: next.emoji } : null,
  };
}
