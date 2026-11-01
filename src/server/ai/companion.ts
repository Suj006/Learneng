import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL, FALLBACK, aiEnabled, claude } from "./client";
import { gradeLabel } from "@/lib/grades";
import { one } from "../db";

/** Child-safety screen applied BEFORE any AI call and to AI output. */
const PII = [
  /\b\d{10}\b/, /\+?\d[\d\s-]{8,}\d/, /[\w.+-]+@[\w-]+\.[\w.]+/, /\b(my|our) (home )?address\b/i, /\b(pin ?code|aadhaar|password)\b/i,
];
const BLOCKED = /\b(kill(s|ed|ing)?|suicid\w*|sex\w*|porn\w*|drugs?|guns?|weapons?|alcohol\w*|beers?|cigarettes?|smok(e|ing)|naked|bombs?|blood)\b/i;

export type CompanionReply = { reply: string; source: "claude" | "dictionary" | "safety" };

export function screenQuestion(q: string): CompanionReply | null {
  if (PII.some((r) => r.test(q))) {
    return { source: "safety", reply: "Whoa, that looks like private information! 🔒 Let's keep things like phone numbers, addresses and passwords secret. Ask me about English words instead!" };
  }
  if (BLOCKED.test(q)) {
    return { source: "safety", reply: "That's something to talk about with a grown-up you trust, like your parent or teacher. 💜 I'm here to help with English words, stories and grammar!" };
  }
  return null;
}

const SYSTEM = (grade: string, name: string) => `You are LEXI, the Vocabulary Explorer robot in PING VIBE, a safe English-learning world for children.
You are talking with ${name}, a child in ${gradeLabel(grade)} in India.
Strict rules:
- ONLY help with English learning: word meanings, spelling, pronunciation, grammar, reading, writing and speaking. Politely steer anything else back to English learning.
- Answer pattern: 1) a simple explanation pitched at ${gradeLabel(grade)}, 2) one example sentence, 3) one small follow-up question to check understanding, 4) a short encouraging line.
- HINTS, NOT ANSWERS: if the child asks you to do their homework, quiz, game or writing task for them (e.g. "what is the answer", "write my story", "fill in the blank"), do NOT give the answer. Give one helpful hint or a smaller step, and invite them to try. Explaining a word's meaning is fine.
- Use the child's first name (${name}) now and then to make it personal.
- Keep it under 90 words. Use simple, warm, enthusiastic language and at most two emojis.
- Never ask for or repeat personal information (full name, school, address, phone, photos, passwords). If the child shares any, tell them kindly to keep it private.
- Never give medical, legal, safety-critical or adult advice; suggest asking a trusted grown-up.
- No links, no external websites, no role-play outside being LEXI.
- If the child seems upset or unsafe, kindly encourage them to talk to a parent or teacher right away.`;

export async function askCompanion(question: string, grade: string, name: string): Promise<CompanionReply> {
  const screened = screenQuestion(question);
  if (screened) return screened;

  if (aiEnabled()) {
    try {
      const res = await claude().beta.messages.create({
        model: AI_MODEL,
        max_tokens: 2000,
        ...FALLBACK,
        system: SYSTEM(grade, name),
        output_config: { effort: "low" },
        messages: [{ role: "user", content: question.slice(0, 500) }],
      });
      if (res.stop_reason !== "refusal") {
        const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
        if (text) {
          const out = screenQuestion(text);
          return out ?? { source: "claude", reply: text };
        }
      }
    } catch (e) {
      if (e instanceof Anthropic.APIError) console.error("[ai] companion failed", e.status, e.message);
      else console.error("[ai] companion failed", e);
    }
  }
  return dictionaryAnswer(question);
}

/** Offline companion: answers "what does X mean" / "spell X" / "synonym of X" from the PING VIBE word bank. */
export async function dictionaryAnswer(question: string): Promise<CompanionReply> {
  if (/\b(tell me the answer|what is the answer|give me the answer|answers? (to|for)|do my homework|write (my|the) (story|essay|homework)|fill in the blank)\b/i.test(question)) {
    return { source: "dictionary", reply: "I'm your learning buddy, so I'll give you a hint instead of the answer! 💡 Read the question slowly, find the key word, and ask me what that word means. You can do it!" };
  }
  const q = question.toLowerCase().replace(/[?!.,"“”]/g, " ");
  const candidates = q.match(/[a-z]{2,}/g) ?? [];
  const stop = new Set(["what","does","mean","meaning","lexi","the","word","of","is","a","an","how","do","you","spell","say","pronounce","tell","me","about","can","please","synonym","antonym","opposite","another","for","use","in","sentence","hey","hi","hello","whats"]);
  const terms = candidates.filter((w) => !stop.has(w));
  for (const term of terms.reverse()) {
    const w = await one<{ word: string; meaning: string; explanation: string; example: string; phonetic: string; synonyms: string[]; antonyms: string[]; emoji: string }>(
      `select word, meaning, explanation, example, phonetic, synonyms, antonyms, emoji from vocabulary_master where lower(word) = $1 and status = 'published'`,
      [term],
    );
    if (w) {
      if (/opposite|antonym/.test(q) && w.antonyms.length) {
        return { source: "dictionary", reply: `${w.emoji} The opposite of “${w.word}” is “${w.antonyms[0]}”. Example: “${w.example}” Can you make a sentence using “${w.antonyms[0]}”? 🌟` };
      }
      if (/synonym|another word|similar/.test(q) && w.synonyms.length) {
        return { source: "dictionary", reply: `${w.emoji} Another word for “${w.word}” is “${w.synonyms.join("” or “")}”. Can you use one of them in a sentence? 🌟` };
      }
      if (/spell/.test(q)) {
        return { source: "dictionary", reply: `${w.emoji} “${w.word}” is spelled ${w.word.toUpperCase().split("").join("-")}. Say it like this: ${w.phonetic}. Can you write it three times? ✍️` };
      }
      return { source: "dictionary", reply: `${w.emoji} “${w.word}” (${w.phonetic}) means: ${w.meaning} ${w.explanation} Example: “${w.example}” Quick question: can you think of something that is ${w.word}? 🌟` };
    }
  }
  return {
    source: "dictionary",
    reply: "Hmm, that word isn't in my word bank yet! 🤖 Try asking me “What does enormous mean?” or “How do you spell rainbow?” — or ask a grown-up to help you look it up.",
  };
}
