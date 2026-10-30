import "server-only";
import { one, query } from "./db";
import { addDays, todayKey } from "./time";
import { bandForGrade } from "@/lib/grades";

export interface Word {
  id: string; word: string; band: number; part_of_speech: string; phonetic: string; meaning: string; explanation: string;
  example: string; usage: string; synonyms: string[]; antonyms: string[]; emoji: string; difficulty: number;
}
const WORD_COLS = `v.id, v.word, v.band, v.part_of_speech, v.phonetic, v.meaning, v.explanation, v.example, v.usage, v.synonyms, v.antonyms, v.emoji, v.difficulty`;

export const NEW_WORDS_PER_DAY = 10;
/** Leitner intervals in days, indexed by box. Box ≥ 4 = MASTERED (4 correct days, spaced). */
const INTERVALS = [0, 1, 2, 4, 7, 14, 30];
export const MASTERED_BOX = 4;

export type ChallengeType = "meaning" | "picture" | "spelling" | "fill_blank" | "usage";
export interface Question {
  key: string; wordId: string; type: ChallengeType; round: number; prompt: string; options?: string[];
  emoji?: string; speak?: string; sentence?: string;
}

const shuffle = <T,>(a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
};

/** Finds the token in `sentence` that is (an inflection of) `word`. */
export function findWordToken(sentence: string, word: string): string | null {
  const stem = word.toLowerCase().slice(0, Math.max(3, word.length - 2));
  const m = sentence.match(/[A-Za-z'-]+/g) ?? [];
  return m.find((t) => t.toLowerCase().startsWith(stem)) ?? null;
}
export function blankOut(sentence: string, word: string) {
  const tok = findWordToken(sentence, word);
  return tok ? sentence.replace(tok, "_____") : sentence;
}

export async function getProfile(childId: string) {
  return one<{ vocab_band: number; level_id: number; xp_total: number; coins: number; onboarded_at: string | null; buddy: string; theme: string; accessory: string | null; pet: string | null }>(
    `select vocab_band, level_id, xp_total, coins, onboarded_at, buddy, theme, accessory, pet from child_profiles where child_id = $1`,
    [childId],
  );
}

async function wordsByIds(ids: string[]): Promise<Word[]> {
  if (!ids.length) return [];
  const rows = await query<Word>(`select ${WORD_COLS} from vocabulary_master v where v.id = any($1::uuid[])`, [ids]);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Word[];
}

/** Today's session: 10 never-seen words at the child's band (+ due revision words). Idempotent per day. */
export async function getOrCreateDailySession(childId: string, newCount = NEW_WORDS_PER_DAY) {
  const today = todayKey();
  let s = await one<{ id: string; new_word_ids: string[]; review_word_ids: string[]; completed_at: string | null; correct: number; attempted: number; cards_viewed: number }>(
    `select id, new_word_ids, review_word_ids, completed_at, correct, attempted, cards_viewed from daily_learning_sessions where child_id = $1 and session_date = $2`,
    [childId, today],
  );
  if (!s) {
    const profile = await getProfile(childId);
    const band = profile?.vocab_band ?? 1;
    // Prefer the child's band, then harder bands (never repeat already-introduced words).
    const fresh = await query<{ id: string }>(
      `select v.id from vocabulary_master v
       where v.status = 'published'
         and not exists (select 1 from child_vocabulary_progress p where p.child_id = $1 and p.word_id = v.id)
       order by (v.band = $2) desc, (v.band > $2) desc, abs(v.band - $2), v.difficulty, random()
       limit $3`,
      [childId, band, newCount],
    );
    const review = await query<{ word_id: string }>(
      `select word_id from child_vocabulary_progress
       where child_id = $1 and due_on <= $2::date and first_seen_at < $2::date
       order by (status = 'mastered'), due_on, wrong_count desc limit 8`,
      [childId, today],
    );
    const newIds = fresh.map((r) => r.id);
    const reviewIds = review.map((r) => r.word_id);
    s = await one(
      `insert into daily_learning_sessions (child_id, session_date, new_word_ids, review_word_ids)
       values ($1,$2,$3::uuid[],$4::uuid[])
       on conflict (child_id, session_date) do update set child_id = excluded.child_id
       returning id, new_word_ids, review_word_ids, completed_at, correct, attempted, cards_viewed`,
      [childId, today, newIds, reviewIds],
    );
    if (newIds.length) {
      await query(
        `insert into child_vocabulary_progress (child_id, word_id, due_on) select $1, unnest($2::uuid[]), $3::date
         on conflict do nothing`,
        [childId, newIds, today],
      );
    }
  }
  const [newWords, reviewWords] = await Promise.all([wordsByIds(s!.new_word_ids), wordsByIds(s!.review_word_ids)]);
  return { session: s!, newWords, reviewWords, today };
}

async function distractors(word: Word, field: "meaning" | "word", n: number): Promise<string[]> {
  const rows = await query<{ v: string }>(
    `select ${field} as v from vocabulary_master where id <> $1 and status = 'published' and abs(band - $2) <= 1 order by random() limit $3`,
    [word.id, word.band, n + 2],
  );
  return rows.map((r) => r.v).filter((v) => v.toLowerCase() !== word[field].toLowerCase()).slice(0, n);
}

/** Five rounds: Vocabulary quiz → Picture matching → Spelling → Sentence building → Final challenge. */
export async function buildQuestions(newWords: Word[], reviewWords: Word[]): Promise<Question[]> {
  const qs: Question[] = [];
  const w = shuffle(newWords);
  const r1 = w.slice(0, 4), r2 = w.slice(4, 7), r3 = w.slice(7, 10);
  for (const x of r1) {
    qs.push({ key: `${x.id}:meaning`, wordId: x.id, type: "meaning", round: 1, prompt: `What does “${x.word}” mean?`, speak: x.word,
      options: shuffle([x.meaning, ...(await distractors(x, "meaning", 3))]) });
  }
  for (const x of r2) {
    qs.push({ key: `${x.id}:picture`, wordId: x.id, type: "picture", round: 2, prompt: "Which word matches the picture?", emoji: x.emoji,
      options: shuffle([x.word, ...(await distractors(x, "word", 3))]) });
  }
  for (const x of r3.length ? r3 : w.slice(0, 3)) {
    qs.push({ key: `${x.id}:spelling`, wordId: x.id, type: "spelling", round: 3, prompt: "Listen and spell the word.", speak: x.word, emoji: x.emoji });
  }
  for (const x of shuffle(newWords).slice(0, 3)) {
    qs.push({ key: `${x.id}:fill_blank`, wordId: x.id, type: "fill_blank", round: 4, prompt: "Complete the sentence.", sentence: blankOut(x.example, x.word),
      options: shuffle([x.word, ...(await distractors(x, "word", 2))]) });
  }
  // Final challenge: revision words first (spaced repetition), else harder usage questions.
  const finals = reviewWords.length ? reviewWords.slice(0, 8) : shuffle(newWords).slice(0, 3);
  for (const x of finals) {
    const others = await query<Word>(`select ${WORD_COLS} from vocabulary_master v where v.id <> $1 and v.status='published' and abs(v.band - $2) <= 1 order by random() limit 2`, [x.id, x.band]);
    const wrong = others.map((o) => { const t = findWordToken(o.example, o.word); return t ? o.example.replace(t, x.word) : null; }).filter(Boolean) as string[];
    qs.push({ key: `${x.id}:usage`, wordId: x.id, type: "usage", round: 5, prompt: `Which sentence uses “${x.word}” correctly?`, speak: x.word,
      options: shuffle([x.example, ...wrong]) });
  }
  return qs;
}

export function isCorrect(word: Word, type: ChallengeType, answer: string): boolean {
  const a = answer.trim().toLowerCase().replace(/\s+/g, " ");
  switch (type) {
    case "meaning": return a === word.meaning.toLowerCase();
    case "picture":
    case "fill_blank":
    case "spelling": return a === word.word.toLowerCase();
    case "usage": return a === word.example.toLowerCase();
  }
}

/** Spaced-repetition update from a server-validated answer. */
export async function applyResult(childId: string, wordId: string, correct: boolean) {
  const today = todayKey();
  const p = await one<{ box: number; last_correct_on: string | null }>(
    `select box, to_char(last_correct_on,'YYYY-MM-DD') last_correct_on from child_vocabulary_progress where child_id = $1 and word_id = $2`,
    [childId, wordId],
  );
  if (!p) {
    await query(`insert into child_vocabulary_progress (child_id, word_id) values ($1,$2) on conflict do nothing`, [childId, wordId]);
    return applyResult(childId, wordId, correct);
  }
  if (correct) {
    const box = p.last_correct_on === today ? Math.max(p.box, 1) : Math.min(6, p.box + 1);
    await query(
      `update child_vocabulary_progress set correct_count = correct_count + 1, box = $3, last_correct_on = $4::date,
         due_on = $5::date, mastered_at = case when $6 = 'mastered' and status <> 'mastered' then now() else mastered_at end,
         status = $6, last_practised_at = now() where child_id = $1 and word_id = $2`,
      [childId, wordId, box, today, addDays(today, INTERVALS[box]), box >= MASTERED_BOX ? "mastered" : "practising"],
    );
  } else {
    await query(
      `update child_vocabulary_progress set wrong_count = wrong_count + 1, box = least(box, 1), due_on = $3::date,
         status = 'practising', last_practised_at = now() where child_id = $1 and word_id = $2`,
      [childId, wordId, addDays(today, 1)],
    );
  }
}

/** Practice from client-scored games: may move DISCOVERED → PRACTISING and schedule reviews, never grants mastery. */
export async function applyPractice(childId: string, results: { wordId: string; correct: boolean }[]) {
  const today = todayKey();
  for (const r of results.slice(0, 60)) {
    await query(
      `update child_vocabulary_progress set status = case when status = 'discovered' then 'practising' else status end,
         last_practised_at = now(), due_on = case when $3 then due_on else least(due_on, $4::date) end
       where child_id = $1 and word_id = $2`,
      [childId, r.wordId, r.correct, addDays(today, 1)],
    );
  }
}

/** Adapts the child's band from recent quest accuracy, within ±1 of their grade band. */
export async function adaptBand(childId: string, grade: string) {
  const recent = await query<{ acc: number }>(
    `select correct::float / nullif(attempted,0) acc from daily_learning_sessions
     where child_id = $1 and completed_at is not null and attempted > 0 order by session_date desc limit 3`,
    [childId],
  );
  // Needs 3 completed quests (≈45+ answers) before any change; moves one step at a time.
  if (recent.length < 3) return null;
  const avg = recent.reduce((s, r) => s + (r.acc ?? 0), 0) / recent.length;
  const p = await getProfile(childId);
  if (!p) return null;
  const base = bandForGrade(grade);
  let next = p.vocab_band;
  if (avg >= 0.9 && p.vocab_band < Math.min(4, base + 1)) next = p.vocab_band + 1;
  if (avg < 0.5 && p.vocab_band > Math.max(1, base - 1)) next = p.vocab_band - 1;
  await query(`update child_profiles set skill_vocabulary = $2, vocab_band = $3 where child_id = $1`, [childId, Math.round(avg * 100), next]);
  return next !== p.vocab_band ? { from: p.vocab_band, to: next } : null;
}

export async function myWords(childId: string) {
  return query<Word & { status: string; favourite: boolean; correct_count: number; wrong_count: number; due_on: string; box: number }>(
    `select ${WORD_COLS}, p.status, p.favourite, p.correct_count, p.wrong_count, p.box, to_char(p.due_on,'YYYY-MM-DD') due_on
     from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id
     where p.child_id = $1 order by p.first_seen_at desc, v.word`,
    [childId],
  );
}

export async function vocabCounts(childId: string) {
  return (await one<{ discovered: number; practising: number; mastered: number; due: number }>(
    `select count(*)::int discovered,
            count(*) filter (where status = 'practising')::int practising,
            count(*) filter (where status = 'mastered')::int mastered,
            count(*) filter (where due_on <= $2::date and first_seen_at < $2::date)::int due
     from child_vocabulary_progress where child_id = $1`,
    [childId, todayKey()],
  ))!;
}

/** Counts how often known words appear in the child's own writing/speaking (vocabulary journey). */
export async function trackUsage(childId: string, text: string, field: "used_in_writing" | "used_in_speaking") {
  const tokens = Array.from(new Set((text.toLowerCase().match(/[a-z']+/g) ?? []).filter((t) => t.length > 2)));
  if (!tokens.length) return 0;
  const rows = await query<{ word_id: string }>(
    `update child_vocabulary_progress p set ${field} = ${field} + 1
     from vocabulary_master v
     where p.child_id = $1 and v.id = p.word_id and lower(v.word) = any($2::text[])
     returning p.word_id`,
    [childId, tokens],
  );
  return rows.length;
}

/** Mixed question set for any list of known words (revision, challenges). */
export async function buildRevisionQuestions(words: Word[]): Promise<Question[]> {
  const types: ChallengeType[] = ["meaning", "picture", "spelling", "fill_blank", "usage"];
  const qs: Question[] = [];
  let i = 0;
  for (const x of words) {
    const type = types[i++ % types.length];
    if (type === "meaning") qs.push({ key: `${x.id}:meaning`, wordId: x.id, type, round: 1, prompt: `What does “${x.word}” mean?`, speak: x.word, options: shuffle([x.meaning, ...(await distractors(x, "meaning", 3))]) });
    else if (type === "picture") qs.push({ key: `${x.id}:picture`, wordId: x.id, type, round: 2, prompt: "Which word matches the picture?", emoji: x.emoji, options: shuffle([x.word, ...(await distractors(x, "word", 3))]) });
    else if (type === "spelling") qs.push({ key: `${x.id}:spelling`, wordId: x.id, type, round: 3, prompt: "Listen and spell the word.", speak: x.word, emoji: x.emoji });
    else if (type === "fill_blank" && findWordToken(x.example, x.word)) qs.push({ key: `${x.id}:fill_blank`, wordId: x.id, type, round: 4, prompt: "Complete the sentence.", sentence: blankOut(x.example, x.word), options: shuffle([x.word, ...(await distractors(x, "word", 2))]) });
    else qs.push({ key: `${x.id}:meaning`, wordId: x.id, type: "meaning", round: 1, prompt: `What does “${x.word}” mean?`, speak: x.word, options: shuffle([x.meaning, ...(await distractors(x, "meaning", 3))]) });
  }
  return qs;
}
