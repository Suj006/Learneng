/**
 * Pilot validation: the existing seven content gates applied to each generated card, with the independent AI review
 * (gate 4 + 7) run per card (40 calls, approved). Mirrors src/server/content/validate.ts; no DB writes, nothing published.
 * Output: _work/gen/vocab_pilot_review/<word>.json
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

const W = "deliverables/phase-1-content/_work/gen";
const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const client = new Anthropic({ apiKey: process.env.PINGVIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY, maxRetries: 3, timeout: 300_000 });
// Gate helpers copied from validate.ts (same thresholds).
const UNSAFE = /\b(kill|killing|blood|gun|weapon|knife attack|suicide|sex|sexy|porn|drug|drugs|alcohol|beer|wine|cigarette|smoking|gamble|gambling|bet|casino|hate|stupid|idiot|dumb|naked|horror|scary death|die|dead body)\b/i;
const syllables = (w: string) => Math.max(1, (w.toLowerCase().replace(/e$/, "").match(/[aeiouy]+/g) ?? []).length);
function readingGrade(text: string) {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length); const words = text.match(/[A-Za-z']+/g) ?? [];
  if (!words.length) return 0; const syl = words.reduce((s, w) => s + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}
const MAX_GRADE: Record<number, number> = { 1: 3.5, 2: 5, 3: 7.5, 4: 11 };
const DIFF_OK: Record<number, string[]> = { 1: ["Beginner", "Developing"], 2: ["Beginner", "Developing", "Intermediate"], 3: ["Developing", "Intermediate", "Advanced"], 4: ["Intermediate", "Advanced", "Challenge"] };
const mech = (s: string) => /^["“'(]?[A-Z0-9]/.test(s.trim()) && /[.!?]["”')]?$/.test(s.trim()) && !/\s{2,}/.test(s) && !/\b(\w+)\s+\1\b/i.test(s);
const Review = z.object({
  grammar_ok: z.boolean(), spelling_ok: z.boolean(), age_appropriate: z.boolean(), educational: z.boolean(),
  meaning_accurate: z.boolean(), synonyms_antonyms_accurate: z.boolean(), indian_british_usage_ok: z.boolean(), culturally_sensitive_ok: z.boolean(),
  issues: z.array(z.string()), suggested_fixes: z.array(z.string()),
});
const published = new Set((JSON.parse(fs.readFileSync("deliverables/phase-1-content/_work/baseline.json", "utf8")).vocabulary as { word: string }[]).map((v) => v.word.toLowerCase()));
const BAND = { 1: "ages 3-6", 2: "ages 6-8", 3: "ages 8-10", 4: "ages 10-13" } as Record<number, string>;

async function reviewCard(card: any, band: number) {
  const r = await client.beta.messages.parse({
    model: MODEL, max_tokens: 4000, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
    system: "You are a strict reviewer of English-learning content for Indian children. Judge only what is asked. Indian/British English spelling is correct.",
    output_config: { effort: "low", format: betaZodOutputFormat(Review) },
    messages: [{ role: "user", content: `Review this vocabulary card for a child in learning band ${band} (${BAND[band]}) in India. Check: grammar, spelling, age-appropriateness, educational value, accuracy of the meaning, whether every synonym/antonym/word-family item is genuinely correct, Indian/British English usage, and cultural sensitivity. List concrete issues and short suggested fixes (empty lists if none).\n<card>\n${JSON.stringify(card)}\n</card>` }],
  } as any);
  return { review: r.parsed_output as z.infer<typeof Review> | null, stop: r.stop_reason, model: r.model, usage: r.usage };
}

async function main() {
  const out = path.join(W, "vocab_pilot_review"); fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(path.join(W, "vocab_pilot")).filter((f) => f.endsWith(".json")).sort();
  const jobs: { card: any; band: number; cid: string }[] = [];
  for (const f of files) { const d = JSON.parse(fs.readFileSync(path.join(W, "vocab_pilot", f), "utf8")); d.items.forEach((c: any, i: number) => jobs.push({ card: c, band: d.band, cid: d.requested[i].candidate_id })); }
  const seen = new Set<string>(); let i = 0, errors = 0;
  const todo = jobs.filter((j) => !fs.existsSync(path.join(out, `${j.card.word}.json`)));
  console.log(`cards ${jobs.length}, reviews to run ${todo.length} (model ${MODEL})`);
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (i < todo.length) {
      const j = todo[i++]; const c = j.card;
      try {
        const prose = [c.simple_meaning, c.explanation, c.example_sentence].join(" ");
        const g = readingGrade(prose);
        const ai = await reviewCard(c, j.band);
        const v = ai.review;
        const gates = [
          { gate: "1 safety moderation", passed: !UNSAFE.test(JSON.stringify(c)), detail: UNSAFE.test(JSON.stringify(c)) ? `Flagged: ${JSON.stringify(c).match(UNSAFE)?.[0]}` : "No unsafe terms." },
          { gate: "2 grade readability", passed: g <= MAX_GRADE[j.band], detail: `≈ grade ${g.toFixed(1)} (max ${MAX_GRADE[j.band]})` },
          { gate: "3 grammar & mechanics", passed: mech(c.example_sentence) && new RegExp(`\\b${c.word}`, "i").test(c.example_sentence), detail: "Example sentence capitals/punctuation and contains the word." },
          { gate: "4 independent spelling & grammar review (AI)", passed: !!v && v.spelling_ok && v.grammar_ok, detail: v ? (v.spelling_ok && v.grammar_ok ? "OK" : v.issues.join("; ")) : `Reviewer unavailable (${ai.stop})` },
          { gate: "5 duplicate detection", passed: !published.has(c.word.toLowerCase()) && !seen.has(c.word.toLowerCase()), detail: published.has(c.word.toLowerCase()) ? "Already published" : "New word" },
          { gate: "6 difficulty validation", passed: DIFF_OK[j.band].includes(c.difficulty), detail: `${c.difficulty} (band ${j.band} allows ${DIFF_OK[j.band].join("/")})` },
          { gate: "7 age suitability (AI)", passed: !!v && v.age_appropriate && v.educational && v.culturally_sensitive_ok, detail: v ? (v.age_appropriate && v.educational && v.culturally_sensitive_ok ? "OK" : v.issues.join("; ")) : "Reviewer unavailable" },
        ];
        const extra = [
          { check: "meaning accuracy (AI)", passed: !!v?.meaning_accurate },
          { check: "synonyms/antonyms/word family accuracy (AI)", passed: !!v?.synonyms_antonyms_accurate },
          { check: "Indian/British usage (AI)", passed: !!v?.indian_british_usage_ok },
        ];
        seen.add(c.word.toLowerCase());
        fs.writeFileSync(path.join(out, `${c.word}.json`), JSON.stringify({ candidate_id: j.cid, band: j.band, word: c.word, gates, extra, issues: v?.issues ?? [], suggested_fixes: v?.suggested_fixes ?? [], reviewer_model: ai.model, reviewer_stop: ai.stop, usage: ai.usage }, null, 1));
        process.stdout.write(".");
      } catch (e) { errors++; console.error(`\n${c.word}: ${(e as Error).message.slice(0, 160)}`); }
    }
  }));
  console.log(`\ndone, errors ${errors}`);
}
main();
