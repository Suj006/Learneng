/**
 * IMPROVE MY SENTENCE — offline (rule-based) suggestions. Used when Claude is unavailable, and unit-tested.
 * Suggestions never replace the child's sentence: each one is an idea with a "why", and the child writes their own version.
 */
export interface Suggestion { kind: "fix" | "word" | "detail" | "join"; idea: string; example: string; why: string }
export interface Improvement { original: string; praise: string; suggestions: Suggestion[]; challenge: string }

const SWAPS: Record<string, string[]> = {
  good: ["wonderful", "brilliant"], nice: ["lovely", "delightful"], big: ["enormous", "huge"], small: ["tiny", "little"],
  happy: ["delighted", "cheerful"], sad: ["gloomy", "unhappy"], said: ["whispered", "shouted"], went: ["rushed", "wandered"],
  fast: ["quickly", "swiftly"], bad: ["terrible", "awful"], fun: ["exciting", "amazing"], like: ["love", "enjoy"],
  saw: ["spotted", "noticed"], ran: ["dashed", "raced"], walked: ["strolled", "marched"], ate: ["gobbled", "munched"],
  cold: ["freezing", "chilly"], hot: ["boiling", "scorching"], scary: ["spooky", "frightening"], pretty: ["beautiful", "colourful"],
};
const NOUN_HINTS = /\b(dog|cat|bird|tree|house|school|park|ball|car|boy|girl|friend|mother|father|teacher|sun|sky|flower|book|cake|garden)\b/i;
const WHEN_WHERE = /\b(yesterday|today|tomorrow|in the|at the|on the|after|before|when|because|morning|evening|night)\b/i;

export function tidy(sentence: string): string {
  let s = sentence.trim().replace(/\s+/g, " ");
  s = s.replace(/\bi\b/g, "I").replace(/\bi'(m|ve|ll|d)\b/gi, (_m, x) => `I'${x.toLowerCase()}`);
  s = s.replace(/\s+([,.!?])/g, "$1").replace(/\b(\w+) \1\b/gi, "$1");
  if (s) s = s[0].toUpperCase() + s.slice(1);
  if (s && !/[.!?]["”']?$/.test(s)) s += ".";
  return s;
}

export function offlineImprove(text: string): Improvement {
  const original = text.trim();
  const words: string[] = original.toLowerCase().match(/[a-z']+/g) ?? [];
  const out: Suggestion[] = [];
  const fixed = tidy(original);
  if (fixed !== original.replace(/\s+/g, " ")) {
    const why: string[] = [];
    if (original[0] && original[0] !== original[0].toUpperCase()) why.push("a sentence starts with a capital letter");
    if (/\bi\b/.test(original)) why.push("the word “I” is always a capital letter");
    if (!/[.!?]["”']?$/.test(original)) why.push("a sentence ends with a full stop, question mark or exclamation mark");
    if (/\b(\w+) \1\b/i.test(original)) why.push("a word was written twice");
    out.push({ kind: "fix", idea: "Check capital letters and punctuation", example: fixed, why: why.length ? `Remember: ${why.join("; ")}.` : "A little tidy-up of spaces and punctuation." });
  }
  const swap = Object.keys(SWAPS).find((w) => words.includes(w));
  if (swap) out.push({ kind: "word", idea: `Try a more exciting word instead of “${swap}”`, example: `${SWAPS[swap][0]} or ${SWAPS[swap][1]}`, why: `Strong words help the reader picture exactly what you mean.` });
  const noun = original.match(NOUN_HINTS)?.[0];
  if (noun && words.length < 14) out.push({ kind: "detail", idea: `Describe the ${noun.toLowerCase()}`, example: `What colour, size or kind of ${noun.toLowerCase()} was it? e.g. “the fluffy ${noun.toLowerCase()}”`, why: "A describing word (adjective) adds colour to your sentence." });
  if (!WHEN_WHERE.test(original) && words.length < 16) out.push({ kind: "detail", idea: "Add when, where or why", example: "…in the park / …after school / …because I was excited", why: "Telling when, where or why makes your sentence clearer and more interesting." });
  if ((original.match(/[.!?]/g) ?? []).length >= 2 && words.length < 20) out.push({ kind: "join", idea: "Join two short sentences", example: "Use “and”, “but” or “because” to join them.", why: "Joining words make your writing flow smoothly." });
  if (!out.length) out.push({ kind: "detail", idea: "Add a feeling", example: "How did it make you feel? e.g. “…and I felt proud.”", why: "Feelings help the reader connect with your writing." });
  return {
    original,
    praise: words.length >= 8 ? "What a lovely, full sentence! Let's make it shine even more." : "Great start! Let's grow this sentence together.",
    suggestions: out.slice(0, 4),
    challenge: "Now rewrite the sentence in your own words using one or two ideas you like.",
  };
}

/** Did the child really improve the sentence themselves? (changed, longer or tidier, not copied from an example) */
export function judgeRewrite(original: string, mine: string, suggestions: Suggestion[]) {
  const a = original.trim().replace(/\s+/g, " "), b = mine.trim().replace(/\s+/g, " ");
  const count = (s: string) => (s.match(/[A-Za-z']+/g) ?? []).length;
  const changed = a.toLowerCase() !== b.toLowerCase();
  const tidyOk = /^[A-Z"“]/.test(b) && /[.!?]["”']?$/.test(b);
  const grew = count(b) > count(a);
  const usedIdeas = suggestions.filter((s) => s.kind === "word" && s.example.split(/ or |, /).some((w) => b.toLowerCase().includes(w.trim().toLowerCase()))).length;
  const improved = changed && (tidyOk || grew) && count(b) >= 2;
  const notes: string[] = [];
  if (!changed) notes.push("Your sentence is the same as before — try changing one small thing.");
  if (grew) notes.push("You added more detail. 🌟");
  if (usedIdeas) notes.push("You used a power word. 💪");
  if (changed && tidyOk) notes.push("Capital letter and end punctuation — perfect. ✅");
  if (changed && !tidyOk) notes.push("Check your capital letter and end punctuation.");
  return { improved, notes };
}
