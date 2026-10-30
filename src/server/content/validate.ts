import "server-only";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { one } from "../db";
import { AI_MODEL, FALLBACK, aiEnabled, claude } from "../ai/client";

export interface Check { name: string; passed: boolean; detail: string }
export interface Validation { passed: boolean; checks: Check[] }

const UNSAFE = /\b(kill|killing|blood|gun|weapon|knife attack|suicide|sex|sexy|porn|drug|drugs|alcohol|beer|wine|cigarette|smoking|gamble|gambling|bet|casino|hate|stupid|idiot|dumb|naked|horror|scary death|die|dead body)\b/i;
const syllables = (w: string) => Math.max(1, (w.toLowerCase().replace(/e$/, "").match(/[aeiouy]+/g) ?? []).length);
export function readingGrade(text: string) {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const words = text.match(/[A-Za-z']+/g) ?? [];
  if (!words.length) return 0;
  const syl = words.reduce((s, w) => s + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}
const MAX_GRADE: Record<number, number> = { 1: 3.5, 2: 5, 3: 7.5, 4: 11 };
const DIFF_RANGE: Record<number, [number, number]> = { 1: [1, 2], 2: [1, 3], 3: [2, 4], 4: [3, 5] };

function mechanics(sentences: string[]): Check {
  const bad = sentences.filter((s) => s && (!/^["“'(]?[A-Z0-9]/.test(s.trim()) || !/[.!?]["”')]?$/.test(s.trim()) || /\s{2,}/.test(s) || /\b(\w+)\s+\1\b/i.test(s)));
  return { name: "grammar & mechanics", passed: bad.length === 0, detail: bad.length ? `Check: “${bad[0].slice(0, 80)}”` : "Capitals, punctuation and spacing look correct." };
}

async function aiReview(kind: string, band: number, text: string): Promise<Check[]> {
  if (!aiEnabled()) return [{ name: "independent AI review", passed: true, detail: "Skipped (no AI key) — admin review required." }];
  const Review = z.object({ grammar_ok: z.boolean(), spelling_ok: z.boolean(), age_appropriate: z.boolean(), educational: z.boolean(), issues: z.array(z.string()) });
  try {
    const r = await claude().beta.messages.parse({
      model: AI_MODEL, max_tokens: 4000, ...FALLBACK,
      system: "You are a strict reviewer of English-learning content for Indian children. Judge only what is asked. Indian English spelling is correct.",
      output_config: { effort: "low", format: betaZodOutputFormat(Review) },
      messages: [{ role: "user", content: `Review this ${kind} for a child in learning band ${band} (1=ages 3-6, 2=ages 6-8, 3=ages 8-10, 4=ages 10-13). Check grammar, spelling, age-appropriateness and educational value. List concrete issues.\n<content>\n${text.slice(0, 6000)}\n</content>` }],
    });
    const v = r.parsed_output;
    if (!v || r.stop_reason === "refusal") return [{ name: "independent AI review", passed: false, detail: "Reviewer unavailable." }];
    const issues = v.issues.join("; ") || "No issues found.";
    return [
      { name: "spelling (AI review)", passed: v.spelling_ok, detail: v.spelling_ok ? "OK" : issues },
      { name: "grammar (AI review)", passed: v.grammar_ok, detail: v.grammar_ok ? "OK" : issues },
      { name: "age suitability (AI review)", passed: v.age_appropriate && v.educational, detail: v.age_appropriate && v.educational ? "OK" : issues },
    ];
  } catch (e) {
    return [{ name: "independent AI review", passed: false, detail: `Reviewer error: ${(e as Error).message}` }];
  }
}

/** The seven gates: age, grade, grammar, spelling, duplicates, difficulty, safety. */
export async function validateContent(kind: string, band: number, body: any): Promise<Validation> {
  const checks: Check[] = [];
  const allText = JSON.stringify(body);
  checks.push({ name: "safety moderation", passed: !UNSAFE.test(allText), detail: UNSAFE.test(allText) ? `Flagged term: ${allText.match(UNSAFE)?.[0]}` : "No unsafe terms." });
  let prose = "";
  if (kind === "vocabulary") {
    prose = [body.meaning, body.explanation, body.example].join(" ");
    checks.push(mechanics([body.example]));
    const hasWord = new RegExp(`\\b${String(body.word).slice(0, Math.max(3, String(body.word).length - 2)).replace(/[^a-z ]/gi, "")}`, "i").test(body.example);
    checks.push({ name: "example uses the word", passed: hasWord, detail: hasWord ? "OK" : "Example sentence must contain the word." });
    const [lo, hi] = DIFF_RANGE[band];
    checks.push({ name: "difficulty", passed: body.difficulty >= lo && body.difficulty <= hi, detail: `Difficulty ${body.difficulty} (band ${band} expects ${lo}–${hi}).` });
    const dup = await one(`select 1 from vocabulary_master where lower(word) = lower($1)`, [body.word]);
    checks.push({ name: "duplicate check", passed: !dup, detail: dup ? "Word already exists." : "New word." });
  } else if (kind === "writing_topic") {
    prose = `${body.title}. ${body.prompt}`;
    const dup = await one(`select 1 from writing_topics where lower(title) = lower($1)`, [body.title]);
    checks.push({ name: "duplicate check", passed: !dup, detail: dup ? "A topic with this title exists." : "New topic." });
    checks.push({ name: "difficulty", passed: body.min_words > 0 && body.min_words <= [0, 15, 40, 90, 200][band], detail: `Target ${body.min_words} words.` });
  } else if (kind === "story") {
    prose = body.pages.map((p: { text: string }) => p.text).join(" ");
    checks.push(mechanics(prose.split(/(?<=[.!?])\s+/)));
    const dup = await one(`select 1 from reading_stories where lower(title) = lower($1)`, [body.title]);
    checks.push({ name: "duplicate check", passed: !dup, detail: dup ? "Story title exists." : "New story." });
    const okQs = body.questions.every((q: { options: string[]; answer: number }) => q.answer >= 0 && q.answer < q.options.length);
    checks.push({ name: "question integrity", passed: okQs && body.questions.length >= 3, detail: okQs ? `${body.questions.length} questions.` : "An answer index is out of range." });
  } else if (kind === "grammar") {
    prose = body.exercises.map((e: { q: string }) => e.q).join(" ");
    const okQs = body.exercises.every((q: { options: string[]; answer: number }) => q.answer >= 0 && q.answer < q.options.length && new Set(q.options).size === q.options.length);
    checks.push({ name: "question integrity", passed: okQs, detail: okQs ? `${body.exercises.length} exercises.` : "Invalid answer index or duplicate options." });
    checks.push({ name: "duplicate check", passed: true, detail: "Exercises are appended to the topic bank; exact duplicates are skipped on publish." });
  } else if (kind === "speaking") {
    prose = body.lines.join(" ");
    checks.push(mechanics(body.lines));
    const dup = await one(`select 1 from speaking_scenarios where lower(title) = lower($1)`, [body.title]);
    checks.push({ name: "duplicate check", passed: !dup, detail: dup ? "Scenario exists." : "New scenario." });
  }
  if (prose) {
    const g = readingGrade(prose);
    checks.push({ name: "grade suitability (readability)", passed: g <= MAX_GRADE[band], detail: `Reading level ≈ grade ${g.toFixed(1)} (max ${MAX_GRADE[band]} for band ${band}).` });
  }
  checks.push(...(await aiReview(kind, band, prose || allText)));
  return { passed: checks.every((c) => c.passed), checks };
}
