import "server-only";
import { one, query } from "./db";
import { applyResult, findWordToken, type Word } from "./vocab";
import { recordEvidence, evidenceForAnswer, GRAMMAR_EVIDENCE } from "./skills";
import { activeEvents } from "./events";
import { award, awardXp, logActivity } from "./gamification";
import { markActivity } from "./journey";
import { periodStart } from "./metrics";
import { todayKey } from "./time";
import type { GrammarExercise } from "./content/grammar";

export type Kind = "weekly" | "monthly" | "boss" | "special" | "mystery" | "family" | "listening";
export type Difficulty = "easy" | "normal" | "hard";
export type QType = "meaning" | "spelling" | "fill_blank" | "synonym" | "antonym" | "order" | "grammar" | "reading" | "phonetic" | "listen" | "listen_sentence" | "picture" | "mystery";

export interface ClientQuestion { i: number; type: QType; round: string; prompt: string; options?: string[]; speak?: string; emoji?: string; tokens?: string[]; passage?: string; sentence?: string }
interface Key { answer: string; wordId?: string; evidence?: string[] }

const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

async function others(w: Word, field: "word" | "meaning" | "phonetic", n: number) {
  const rows = await query<{ v: string }>(`select ${field} v from vocabulary_master where id <> $1 and status='published' and abs(band - $2) <= 1 order by random() limit $3`, [w.id, w.band, n + 2]);
  return rows.map((r) => r.v).filter((v) => norm(v) !== norm(w[field])).slice(0, n);
}

async function build(type: QType, w: Word | null, round: string, band: number, i: number, used: Set<string>): Promise<[ClientQuestion, Key] | null> {
  switch (type) {
    case "meaning": if (!w) return null;
      return [{ i, type, round, prompt: `What does “${w.word}” mean?`, speak: w.word, options: shuffle([w.meaning, ...(await others(w, "meaning", 3))]) }, { answer: w.meaning, wordId: w.id, evidence: evidenceForAnswer("meaning", w.band) }];
    case "picture": if (!w) return null;
      return [{ i, type, round, prompt: "Which word matches the picture?", emoji: w.emoji, options: shuffle([w.word, ...(await others(w, "word", 3))]) }, { answer: w.word, wordId: w.id, evidence: ["picture"] }];
    case "listen": if (!w) return null;
      return [{ i, type, round, prompt: "Listen carefully. Which word did you hear?", speak: w.word, options: shuffle([w.word, ...(await others(w, "word", 3))]) }, { answer: w.word, wordId: w.id, evidence: ["listening"] }];
    case "listen_sentence": {
      if (!w) return null;
      const tok = findWordToken(w.example, w.word);
      if (!tok) return build("listen", w, round, band, i, used);
      return [{ i, type, round, prompt: "Listen to the sentence. Which of these words was in it?", speak: w.example, options: shuffle([tok, ...(await others(w, "word", 3))]) }, { answer: tok, wordId: w.id, evidence: ["listening_sentences"] }];
    }
    case "spelling": if (!w) return null;
      return [{ i, type, round, prompt: "Listen and spell the word.", speak: w.word, emoji: w.emoji }, { answer: w.word, wordId: w.id, evidence: evidenceForAnswer("spelling", w.band) }];
    case "phonetic": if (!w) return null;
      return [{ i, type, round, prompt: `How do you say “${w.word}”?`, speak: w.word, options: shuffle([w.phonetic, ...(await others(w, "phonetic", 3))]) }, { answer: w.phonetic, wordId: w.id, evidence: ["pronunciation_theory"] }];
    case "fill_blank": {
      if (!w) return null;
      const tok = findWordToken(w.example, w.word);
      if (!tok) return build("meaning", w, round, band, i, used);
      return [{ i, type, round, prompt: "Complete the sentence.", sentence: w.example.replace(tok, "_____"), options: shuffle([tok, ...(await others(w, "word", 3))]) }, { answer: tok, wordId: w.id, evidence: evidenceForAnswer("fill_blank", w.band) }];
    }
    case "synonym": case "antonym": {
      if (!w) return null;
      const list = type === "synonym" ? w.synonyms : w.antonyms;
      if (!list.length) return build("meaning", w, round, band, i, used);
      const wrong = (await others(w, "word", 4)).filter((x) => !list.includes(x)).slice(0, 3);
      return [{ i, type, round, prompt: type === "synonym" ? `Which word means almost the same as “${w.word}”?` : `Which word is the OPPOSITE of “${w.word}”?`, options: shuffle([list[0], ...wrong]) },
        { answer: list[0], wordId: w.id, evidence: [type === "synonym" ? "synonyms" : "opposites"] }];
    }
    case "order": {
      if (!w) return null;
      const tokens = w.example.replace(/[.!?]+$/, "").split(/\s+/);
      if (tokens.length < 3 || tokens.length > 10) return build("fill_blank", w, round, band, i, used);
      return [{ i, type, round, prompt: "Put the words in the right order to build the sentence.", tokens: shuffle(tokens) }, { answer: tokens.join(" "), wordId: w.id, evidence: ["grammar_sentences"] }];
    }
    case "mystery": {
      if (!w) return null;
      const clue = `I am ${/^[aeiou]/i.test(w.part_of_speech) ? "an" : "a"} ${w.part_of_speech} with ${w.word.length} letters. I start with “${w.word[0].toUpperCase()}”. ${w.meaning}`;
      return [{ i, type, round, prompt: `🔍 Clue: ${clue} Which word am I?`, emoji: "❓" }, { answer: w.word, wordId: w.id, evidence: ["meaning", "spelling"] }];
    }
    case "grammar": {
      const t = await one<{ slug: string; exercises: GrammarExercise[] }>(
        `select slug, exercises from grammar_topics where band_min <= $1 order by random() limit 1`, [Math.max(1, band)]);
      if (!t) return null;
      const pool = t.exercises.map((e, idx) => ({ e, k: `${t.slug}:${idx}` })).filter((x) => !used.has(x.k));
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return null;
      used.add(pick.k);
      return [{ i, type, round, prompt: pick.e.q, options: pick.e.options }, { answer: pick.e.options[pick.e.answer], evidence: [GRAMMAR_EVIDENCE[t.slug] ?? "grammar_parts"] }];
    }
    case "reading": {
      const s = await one<{ slug: string; pages: { text: string }[]; questions: { q: string; options: string[]; answer: number }[] }>(
        `select slug, pages, questions from reading_stories where band <= $1 and active and reward is null order by random() limit 1`, [Math.max(1, band)]);
      if (!s) return null;
      const qi = s.questions.map((_, k) => k).filter((k) => !used.has(`${s.slug}:${k}`));
      const k = qi[Math.floor(Math.random() * qi.length)];
      if (k === undefined) return null;
      used.add(`${s.slug}:${k}`);
      const q = s.questions[k];
      return [{ i, type, round, prompt: q.q, options: q.options, passage: s.pages.map((p) => p.text).join(" ") }, { answer: q.options[q.answer], evidence: ["comprehension"] }];
    }
  }
}

async function wordPool(childId: string, kind: Kind, band: number, need: number, ids?: string[]): Promise<Word[]> {
  let words: Word[] = [];
  if (ids?.length) {
    words = await query<Word>(`select * from vocabulary_master where id = any($1::uuid[])`, [ids]);
  } else {
    const since = kind === "weekly" ? "7 days" : kind === "monthly" ? "30 days" : "36500 days";
    words = await query<Word>(
      `select v.* from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id
       where p.child_id = $1 and p.first_seen_at > now() - $2::interval order by random() limit 40`, [childId, since]);
    if (kind === "special") {
      const evWords = (await activeEvents()).flatMap((e) => e.words);
      if (evWords.length) words = [...(await query<Word>(`select * from vocabulary_master where lower(word) = any($1::text[]) and status='published'`, [evWords])), ...words];
    }
  }
  if (words.length < need) {
    const extra = await query<Word>(
      `select * from vocabulary_master where status = 'published' and band between $1 and $2 and not (id = any($3::uuid[])) order by random() limit $4`,
      [Math.max(1, band - 1), band, words.map((w) => w.id), need - words.length]);
    words = [...words, ...extra];
  }
  return shuffle(words);
}

export interface ChallengeMeta { title: string; intro: string; villain?: string; emoji: string; rounds: string[] }

export async function createChallenge(childId: string, band: number, kind: Kind, opts: { ref?: string; difficulty?: Difficulty; familyId?: string }) {
  const difficulty: Difficulty = opts.difficulty ?? "normal";
  const per = difficulty === "easy" ? 1 : difficulty === "hard" ? 3 : 2;
  const qBand = difficulty === "hard" ? Math.min(4, band + 1) : difficulty === "easy" ? Math.max(1, band - 1) : band;
  let plan: { type: QType | "mixed"; title: string }[] = [];
  let meta: ChallengeMeta;
  let ids: string[] | undefined;
  if (kind === "boss") {
    const b = await one<{ slug: string; title: string; villain: string; emoji: string; story: string; rounds: { type: QType | "mixed"; title: string }[] }>(
      `select slug, title, villain, emoji, story, rounds from boss_battles where slug = $1`, [opts.ref]);
    if (!b) throw new Error("Boss not found");
    plan = b.rounds.flatMap((r) => Array.from({ length: per }, () => r));
    meta = { title: b.title, intro: b.story, villain: b.villain, emoji: b.emoji, rounds: b.rounds.map((r) => r.title) };
  } else if (kind === "mystery") {
    plan = [1, 2, 3].map((n) => ({ type: "mystery" as const, title: `Case ${n}` }));
    meta = { title: "The Vanishing Words", intro: "Words are vanishing from Vocabulary Forest! Read each clue and type the missing word to bring it back.", emoji: "🕵️", rounds: ["Case 1", "Case 2", "Case 3"] };
  } else if (kind === "listening") {
    plan = Array.from({ length: 8 }, (_, k) => ({ type: (band >= 2 && k % 2 ? "listen_sentence" : "listen") as QType, title: "Listening Lab" }));
    meta = { title: "Listening Lab", intro: "Put on your super-ears! Press play, listen carefully, then choose.", emoji: "🎧", rounds: ["8 sounds"] };
  } else if (kind === "family") {
    const f = await one<{ title: string; message: string; word_ids: string[] }>(`select title, message, word_ids from family_challenges where id = $1 and child_id = $2 and completed_at is null`, [opts.familyId, childId]);
    if (!f) throw new Error("Family challenge not found");
    ids = f.word_ids;
    plan = f.word_ids.map((_, k) => ({ type: (["meaning", "spelling", "fill_blank"] as QType[])[k % 3], title: "Family challenge" }));
    meta = { title: f.title, intro: f.message || "A challenge from your family!", emoji: "👨‍👩‍👧", rounds: ["Family challenge"] };
  } else {
    const n = kind === "monthly" ? 15 : 10;
    const types: (QType | "mixed")[] = kind === "weekly" ? ["meaning", "picture", "spelling", "fill_blank", "synonym"] : kind === "monthly" ? ["meaning", "spelling", "fill_blank", "antonym", "grammar", "order"] : ["meaning", "listen", "fill_blank", "spelling", "grammar"];
    plan = Array.from({ length: n }, (_, k) => ({ type: types[k % types.length], title: kind === "weekly" ? "Weekly Vocabulary Quest" : kind === "monthly" ? "Monthly Championship" : "Special Challenge" }));
    const ev = kind === "special" ? (await activeEvents())[0] : null;
    meta = kind === "weekly" ? { title: "Weekly Vocabulary Quest", intro: "Show LEXI everything you learned this week!", emoji: "🏅", rounds: ["10 questions"] }
      : kind === "monthly" ? { title: "Monthly English Championship", intro: "Your 30-day showdown — words, grammar and sentences!", emoji: "🏆", rounds: ["15 questions"] }
      : { title: ev ? ev.title : "Weekend Word Tournament", intro: ev ? ev.description : "A special mixed challenge — bonus rewards for every Explorer!", emoji: ev?.emoji ?? "⚡", rounds: ["10 questions"] };
  }
  const words = await wordPool(childId, kind, qBand, plan.length, ids);
  const used = new Set<string>();
  const questions: ClientQuestion[] = [];
  const keys: Key[] = [];
  let wi = 0;
  for (const step of plan) {
    const type: QType = step.type === "mixed" ? (["meaning", "spelling", "fill_blank", "synonym", "antonym"] as QType[])[Math.floor(Math.random() * 5)] : step.type;
    const needsWord = !["grammar", "reading"].includes(type);
    const w = needsWord ? words[wi++ % Math.max(1, words.length)] ?? null : null;
    const built = await build(type, w, step.title, qBand, questions.length, used);
    if (built) { questions.push(built[0]); keys.push(built[1]); }
  }
  const row = await one<{ id: string }>(
    `insert into challenge_attempts (child_id, kind, ref, difficulty, questions, answer_key) values ($1,$2,$3,$4,$5,$6) returning id`,
    [childId, kind, opts.ref ?? opts.familyId ?? null, difficulty, JSON.stringify(questions), JSON.stringify(keys)]);
  return { attemptId: row!.id, questions, meta, difficulty };
}

export async function submitChallenge(childId: string, attemptId: string, answers: string[], seconds: number) {
  const a = await one<{ id: string; kind: Kind; ref: string | null; difficulty: Difficulty; answer_key: Key[]; questions: ClientQuestion[]; submitted_at: string | null }>(
    `select id, kind, ref, difficulty, answer_key, questions, submitted_at from challenge_attempts where id = $1 and child_id = $2`, [attemptId, childId]);
  if (!a) return { error: "Challenge not found." } as const;
  if (a.submitted_at) return { error: "You already finished this challenge! Start a new one to play again." } as const;
  const results = a.answer_key.map((k, i) => {
    const q = a.questions[i];
    const given = answers[i] ?? "";
    return q.type === "order" ? norm(given) === norm(k.answer) : norm(given) === norm(k.answer);
  });
  const correct = results.filter(Boolean).length;
  const score = a.answer_key.length ? Math.round((correct / a.answer_key.length) * 100) : 0;
  const passed = score >= 70;
  await query(`update challenge_attempts set score = $2, correct = $3, passed = $4, submitted_at = now() where id = $1`, [a.id, score, correct, passed]);

  // Server-validated answers feed the mastery engine and the skill tree.
  for (let i = 0; i < a.answer_key.length; i++) {
    const k = a.answer_key[i];
    for (const ev of k.evidence ?? []) await recordEvidence(childId, ev, results[i] ? 1 : 0, 1);
    if (k.wordId) {
      const known = await one(`select 1 from child_vocabulary_progress where child_id = $1 and word_id = $2`, [childId, k.wordId]);
      if (known) await applyResult(childId, k.wordId, results[i]);
    }
  }
  await logActivity(childId, `challenge_${a.kind}`, seconds, { score, ref: a.ref });

  let reward = null;
  const mult = 0.4 + 0.6 * (score / 100);
  if (a.kind === "boss" && a.ref) {
    const b = await one<{ xp: number; coins: number; crystals: number; title: string }>(`select xp, coins, crystals, title from boss_battles where slug = $1`, [a.ref]);
    if (passed && b) {
      const scale = a.difficulty === "hard" ? 1.5 : a.difficulty === "easy" ? 0.6 : 1;
      reward = await award(childId, "boss", `boss:${childId}:${a.ref}:${a.difficulty}`, { xp: Math.round(b.xp * scale), coins: Math.round(b.coins * scale), crystals: a.difficulty === "easy" ? 1 : b.crystals, cap: 20, reason: `Boss defeated: ${b.title}` });
    } else if (b) {
      reward = await awardXp(childId, "boss_battle", `boss-try:${childId}:${a.id}`, { multiplier: mult * 0.5, reason: `Boss battle practice: ${b.title}` });
    }
    await markActivity(childId, "boss_battle");
  } else if (a.kind === "weekly") {
    reward = await awardXp(childId, "weekly_quest", `weekly:${childId}:${periodStart("weekly").key}`, { multiplier: mult });
    await markActivity(childId, "weekly_assessment");
  } else if (a.kind === "monthly") {
    reward = await awardXp(childId, "monthly_championship", `monthly:${childId}:${periodStart("monthly").key}`, { multiplier: mult });
    await markActivity(childId, "monthly_championship");
  } else if (a.kind === "special") {
    reward = await awardXp(childId, "special_challenge", `special:${childId}:${todayKey()}`, { multiplier: mult });
    await markActivity(childId, "special");
  } else if (a.kind === "listening") {
    reward = await awardXp(childId, "listening", `listening:${childId}:${a.id}`, { multiplier: mult });
    await markActivity(childId, "listening");
  } else if (a.kind === "mystery") {
    reward = await awardXp(childId, "special_challenge", `mystery:${childId}:${a.id}`, { multiplier: mult, reason: "Mystery Word case" });
  } else if (a.kind === "family" && a.ref) {
    await query(`update family_challenges set completed_at = now(), score = $2, attempt_id = $3 where id = $1`, [a.ref, score, a.id]);
    reward = await awardXp(childId, "special_challenge", `family:${a.ref}`, { multiplier: mult, reason: "Family challenge" });
  }
  return {
    score, correct, total: a.answer_key.length, passed, results,
    answers: a.answer_key.map((k) => k.answer), reward,
  } as const;
}
