import "server-only";
import { query } from "./db";
import type { Word } from "./vocab";
import { findWordToken } from "./vocab";

export interface Exercise { q: string; options: string[]; answer: number; hint: string; skill: string; wordId?: string }

const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const withAnswer = (q: string, correct: string, wrong: string[], hint: string, skill: string, wordId?: string): Exercise => {
  const options = shuffle([correct, ...wrong.slice(0, 3)]);
  return { q, options, answer: options.indexOf(correct), hint, skill, wordId };
};

const AN_EXCEPTIONS = new Set(["hour", "honest", "honour", "heir"]);
const A_EXCEPTIONS = /^(uni|use|usu|euro|one|once|ewe)/;
export const article = (w: string) => {
  const x = w.toLowerCase();
  if (AN_EXCEPTIONS.has(x)) return "an";
  if (A_EXCEPTIONS.test(x)) return "a";
  return /^[aeiou]/.test(x) ? "an" : "a";
};

/**
 * Unlimited grammar & vocabulary drills generated from the published word bank.
 * Every item comes from reviewed vocabulary records, so drills never run out
 * as the word bank grows.
 */
export async function generateDrills(topic: string, band: number, n = 6): Promise<Exercise[]> {
  const pool = await query<Word>(
    `select * from vocabulary_master where status = 'published' and band <= $1 and band >= $1 - 1 order by random() limit 80`, [band]);
  const by = (pos: string) => pool.filter((w) => w.part_of_speech === pos && !w.word.includes(" "));
  const out: Exercise[] = [];
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    switch (topic) {
      case "articles": {
        const w = pick(by("noun"));
        if (!w) break;
        out.push(withAnswer(`Choose the right article: ___ ${w.word}`, article(w.word), [article(w.word) === "a" ? "an" : "a"], "Listen to the first SOUND of the word.", "articles", w.id));
        break;
      }
      case "nouns": case "verbs": case "adjectives": {
        const pos = topic.slice(0, -1);
        const right = pick(by(pos));
        const wrongs = shuffle(pool.filter((w) => w.part_of_speech !== pos)).slice(0, 3).map((w) => w.word);
        if (right && wrongs.length === 3) out.push(withAnswer(`Which word is ${pos === "adjective" ? "an" : "a"} ${pos}?`, right.word, wrongs, pos === "noun" ? "A naming word." : pos === "verb" ? "An action word." : "A describing word.", topic, right.id));
        break;
      }
      case "opposites": {
        const w = pick(pool.filter((x) => x.antonyms.length));
        if (!w) break;
        const wrongs = shuffle(pool.filter((x) => x.id !== w.id)).slice(0, 3).map((x) => x.word);
        out.push(withAnswer(`What is the opposite of “${w.word}”?`, w.antonyms[0], wrongs, "Opposites mean very different things.", "opposites", w.id));
        break;
      }
      case "synonyms": {
        const w = pick(pool.filter((x) => x.synonyms.length));
        if (!w) break;
        const wrongs = shuffle(pool.filter((x) => x.id !== w.id && !w.synonyms.includes(x.word))).slice(0, 3).map((x) => x.word);
        out.push(withAnswer(`Which word means almost the same as “${w.word}”?`, w.synonyms[0], wrongs, "Synonyms are word twins!", "synonyms", w.id));
        break;
      }
      default: { // sentence usage / fill the gap
        const w = pick(pool);
        const tok = w && findWordToken(w.example, w.word);
        if (!w || !tok) break;
        const wrongs = shuffle(pool.filter((x) => x.id !== w.id && x.part_of_speech === w.part_of_speech)).slice(0, 3).map((x) => x.word);
        if (wrongs.length < 2) break;
        out.push(withAnswer(`Fill the gap: ${w.example.replace(tok, "_____")}`, w.word, wrongs, "Which word makes sense?", "sentence", w.id));
      }
    }
  }
  return out;
}

export const DRILL_TOPICS = [
  { key: "articles", title: "a / an Drill", emoji: "🅰️" },
  { key: "nouns", title: "Find the Noun", emoji: "🏷️" },
  { key: "verbs", title: "Find the Verb", emoji: "🏃" },
  { key: "adjectives", title: "Find the Adjective", emoji: "🎨" },
  { key: "opposites", title: "Opposites Attack", emoji: "↔️" },
  { key: "synonyms", title: "Word Twins", emoji: "👯" },
  { key: "sentence", title: "Fill the Gap", emoji: "🧩" },
];
