/**
 * VIBE REAL LIFE — shared types and answer evaluation (pure, unit-tested, used by the server).
 *
 * A scenario is data: a place, a character, useful words and phrases, and conversation turns. Each turn accepts MANY
 * natural answers (intent phrases + content words), never one exact sentence. Younger children get picture-supported
 * choices; older children type or speak. Content lives in the database (real_life_scenarios) so new scenarios need no code.
 */
export type Level = "beginner" | "developing" | "advanced";
export const LEVELS: Level[] = ["beginner", "developing", "advanced"];

export interface Option { text: string; emoji?: string; result: "great" | "ok" | "retry"; tip?: string }
export interface Turn {
  say: string;                 // what the character says
  task: string;                // what the child should do, in simple words
  any: string[];               // accepted intent phrases (any one)
  need?: string[];             // content words (at least one), e.g. menu items; captured as {item}
  polite?: boolean;            // encourage please / thank you (never required)
  reply: string;               // character's natural response; may use {item}
  hint: string;                // shown after a first unsuccessful try
  model: string;               // a model answer shown after two tries
  options: Option[];           // picture-supported choices (beginner, and "help me" on other levels)
  adv?: boolean;               // only in the advanced level (longer conversations)
}
export interface Scenario {
  slug: string; title: string; emoji: string; place: string; theme: string;
  character: { name: string; emoji: string; voice: "max" | "lexi" | "grammy" | "speaky" | "story" | "narrator" };
  intro: string; mission: string;
  words: { word: string; emoji: string }[];
  phrases: string[];
  turns: Turn[];
  reflection: string[];
  band_min: number;            // youngest band it suits (1–4)
}

export const turnsFor = (s: Scenario, level: Level) => s.turns.filter((t) => level === "advanced" || !t.adv);

const norm = (s: string) => ` ${s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim()} `;
const has = (text: string, phrase: string) => text.includes(norm(phrase));

/**
 * Evaluates a typed or spoken answer for one turn.
 *  great  — the intent is clear (and, if relevant, polite)
 *  ok     — understood; a gentle tip (e.g. add "please")
 *  retry  — not understood yet; give a hint
 */
export function evaluateAnswer(turn: Turn, answer: string): { result: "great" | "ok" | "retry"; item: string | null; tip: string | null } {
  const t = norm(answer);
  if (t.trim().length < 2) return { result: "retry", item: null, tip: turn.hint };
  const intent = turn.any.length === 0 || turn.any.some((p) => has(t, p));
  const item = turn.need?.find((w) => has(t, w)) ?? null;
  const content = !turn.need?.length || !!item;
  if (!content) return { result: "retry", item: null, tip: turn.hint };
  // Content alone ("sandwich!") is understood but not yet a full, natural sentence.
  if (!intent) return { result: turn.need?.length ? "ok" : "retry", item, tip: turn.need?.length ? `Try a full sentence, like: “${turn.model}”` : turn.hint };
  const polite = !turn.polite || /\b(please|thank|thanks|kindly|could you|would you|may i|excuse me|sorry)\b/.test(t);
  return polite ? { result: "great", item, tip: null } : { result: "ok", item, tip: "Lovely! Adding “please” or “thank you” makes it extra polite." };
}

export const fillReply = (reply: string, item: string | null) => reply.replace(/\{item\}/g, item ?? "that");

/** Suggested level from age band and real-world evidence (children can always choose another level). */
export function suggestLevel(band: number, score: number | null): Level {
  if (score === null) return band <= 2 ? "beginner" : band === 3 ? "developing" : "developing";
  if (score >= 80 && band >= 3) return "advanced";
  if (score >= 60 && band >= 2) return "developing";
  return "beginner";
}
