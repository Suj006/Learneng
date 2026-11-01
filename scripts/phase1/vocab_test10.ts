/**
 * 10-day local-test vocabulary batch (B0002): 15 new cards per band for UKG (B1), G1 (B2), G4 (B3), G5 (B4).
 * Pipeline: registry guard → generate (one call per band, established card schema) → seven content gates + per-card AI
 * review → targeted fix + recheck (max 2 rounds) → replace an unfixable card with a pre-checked reserve word.
 * A cost ledger is updated after every call; the run stops before the approved cap (₹350 at ₹96/$).
 * Nothing is imported, published or deployed. Output: deliverables/phase-1-content/vocab-10day-test/_work/
 * Usage: npx tsx scripts/phase1/vocab_test10.ts
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { CATEGORIES, DIFFICULTIES, BAND_DESC, BAND_GRADES } from "./briefs";
import { registryGuard, check, loadExisting } from "../registry/word-registry";

const OUT = "deliverables/phase-1-content/vocab-10day-test/_work";
const MODEL = process.env.AI_MODEL; // set to the app's configured model (see src/server/ai/client.ts)
if (!MODEL) { console.error("Set AI_MODEL to the app's configured model before running."); process.exit(1); }
const INR = 96, CAP_INR = 350, STOP_AT_USD = 3.45; // hard cap ₹350 ≈ $3.65; stop with headroom
const client = new Anthropic({ apiKey: process.env.PINGVIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 300_000 });
const SYSTEM = `You write original, accurate English-learning content for PING VIBE, a safe learning world for Indian children aged 3–13.
Use Indian/British English spelling (colour, favourite) and natural, warm, simple Indian everyday contexts (school, tiffin, cricket, monsoon, festivals, family).
Never include brands, real living people, violence, fear, romance, unsafe activities or stereotypes. Be educationally precise. Do not invent facts.`;
const GRADES = ["PRE_KG", "LKG", "UKG", "G1", "G2", "G3", "G4", "G5", "G6", "G7"] as const;
const DIFF_FOR_BAND: Record<number, string> = { 1: "Beginner or Developing", 2: "Beginner, Developing or Intermediate", 3: "Developing, Intermediate or Advanced", 4: "Intermediate, Advanced or Challenge" };
const FOR_GRADE: Record<number, string> = { 1: "UKG", 2: "G1", 3: "G4", 4: "G5" };
/** One clear, child-relevant sense per card (the registry stores the sense; other senses would be separate entries). */
const SENSE: Record<string, string> = {
  back: "the back of your body (body part)", present: "a gift you give someone", square: "the shape with four equal sides", top: "the highest part of something",
  field: "an open area of grass, often for playing or farming", ground: "the surface of the earth that you stand on", plant: "a living thing that grows in soil (noun)",
  floor: "the surface of a room that you walk on", station: "a railway station where trains stop", parent: "a mother or father", "grown-up": "an adult (noun)",
  bat: "a cricket bat used to hit the ball", band: "a group of people who play music together", second: "a very short unit of time (60 in a minute)", sail: "to travel across water in a boat with sails (verb)",
  awake: "not sleeping", party: "a celebration with friends or family", fit: "to be the right size for someone (clothes)", cash: "money in coins and notes", closed: "not open (a shop or door)",
  sick: "feeling ill", interview: "a meeting where someone answers questions (e.g. for a school magazine)", spare: "extra; kept in case it is needed (adjective)", mild: "not very hot or cold (weather)",
  tune: "a series of musical notes that make a song", "hand in": "to give your work to a teacher", "cross out": "to draw a line through a written word", "get along": "to be friendly with someone",
  "look forward to": "to feel happy about something that will happen", "grow up": "to become older, from a child to an adult", install: "to put a program or app onto a computer or phone",
  upload: "to send a file from your device to the internet", password: "a secret word used to open an account", convince: "to make someone believe something is true", fold: "to bend paper or cloth so one part covers another",
  wrap: "to cover something with paper or cloth", "look up": "to find information in a dictionary or book", "put away": "to put something back in its place", pool: "a swimming pool", magic: "tricks that seem impossible (as in a magic show)",
};

const Vocab = z.object({
  word: z.string(), part_of_speech: z.string(), simple_meaning: z.string(), explanation: z.string(), example_sentence: z.string(), real_world_usage: z.string(),
  synonyms: z.array(z.string()), antonyms: z.array(z.string()), word_family: z.array(z.string()), collocations: z.array(z.string()), spelling_guidance: z.string(),
  related_words: z.array(z.string()), category: z.enum(CATEGORIES), difficulty: z.enum(DIFFICULTIES), learning_objective: z.string(),
  illustration_brief: z.string(), emoji: z.string(), applicable_grades: z.array(z.enum(GRADES)),
});
type Card = z.infer<typeof Vocab>;
const Review = z.object({
  grammar_ok: z.boolean(), spelling_ok: z.boolean(), age_appropriate: z.boolean(), educational: z.boolean(),
  meaning_accurate: z.boolean(), synonyms_antonyms_accurate: z.boolean(), indian_british_usage_ok: z.boolean(), culturally_sensitive_ok: z.boolean(),
  issues: z.array(z.string()), suggested_fixes: z.array(z.string()),
});

// ── Gate helpers (same thresholds as validate.ts / the pilot review) ──
const UNSAFE = /\b(kill|killing|blood|gun|weapon|knife attack|suicide|sex|sexy|porn|drug|drugs|alcohol|beer|wine|cigarette|smoking|gamble|gambling|bet|casino|hate|stupid|idiot|dumb|naked|horror|scary movie)\b/i;
const syllables = (w: string) => Math.max(1, (w.toLowerCase().replace(/e$/, "").match(/[aeiouy]+/g) ?? []).length);
function readingGrade(text: string) {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length); const words: string[] = text.match(/[A-Za-z']+/g) ?? [];
  if (!words.length) return 0; const syl = words.reduce((s: number, w: string) => s + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}
const MAX_GRADE: Record<number, number> = { 1: 3.5, 2: 5, 3: 7.5, 4: 11 };
const DIFF_OK: Record<number, string[]> = { 1: ["Beginner", "Developing"], 2: ["Beginner", "Developing", "Intermediate"], 3: ["Developing", "Intermediate", "Advanced"], 4: ["Intermediate", "Advanced", "Challenge"] };
const mech = (s: string) => /^["“'(]?[A-Z0-9]/.test(s.trim()) && /[.!?]["”')]?$/.test(s.trim()) && !/\s{2,}/.test(s) && !/\b(\w+)\s+\1\b/i.test(s);
const containsWord = (sentence: string, word: string) => {
  const parts = word.toLowerCase().split(/\s+/); const s = sentence.toLowerCase();
  if (parts.length > 1) return parts.every((p) => s.includes(p));
  const stem = word.toLowerCase().slice(0, Math.max(3, word.length - 2)); return new RegExp(`\\b${stem.replace(/[-]/g, "\\-")}`).test(s);
};

// ── Cost ledger ──
const LEDGER = path.join(OUT, "cost-ledger.json");
const ledger: { calls: { step: string; word?: string; band?: number; in: number; out: number; usd: number; at: string }[]; usd: number } =
  fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, "utf8")) : { calls: [], usd: 0 };
class CapReached extends Error {}
function charge(step: string, usage: any, extra: { word?: string; band?: number } = {}) {
  const inT = (usage?.input_tokens ?? 0) + (usage?.cache_creation_input_tokens ?? 0) + (usage?.cache_read_input_tokens ?? 0); const outT = usage?.output_tokens ?? 0;
  const usd = inT * 4e-6 + outT * 20e-6;
  ledger.calls.push({ step, ...extra, in: inT, out: outT, usd: +usd.toFixed(5), at: new Date().toISOString() }); ledger.usd = +(ledger.usd + usd).toFixed(5);
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1));
}
function budget(projectedUsd: number, what: string) {
  if (ledger.usd + projectedUsd > STOP_AT_USD) throw new CapReached(`Stopping before ${what}: spent $${ledger.usd.toFixed(3)} (≈ ₹${(ledger.usd * INR).toFixed(0)}); next step could pass the ₹${CAP_INR} cap.`);
}

async function call<T>(schema: z.ZodType<T>, system: string, prompt: string, effort: "low" | "medium", maxTokens: number) {
  const r = await client.beta.messages.parse({
    model: MODEL, max_tokens: maxTokens, system, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
    output_config: { effort, format: betaZodOutputFormat(schema) }, messages: [{ role: "user", content: prompt }],
  } as any);
  return { parsed: r.parsed_output as T | null, usage: r.usage, model: r.model, stop: r.stop_reason };
}

const RULES = (band: number) => `Rules:
- "word" must be exactly the headword as given. Teach ONLY the sense given in brackets; do not mix meanings on one card.
- simple_meaning: one short, accurate sentence. explanation: 1–2 child-friendly sentences for the age band. example_sentence MUST contain the exact headword (for phrasal verbs, all its words), end with punctuation, and use a natural Indian everyday context (school, home, festivals, cricket, monsoon, family).
- READABILITY: ${band === 1 ? "Band 1 (UKG): use very short sentences and one- or two-syllable everyday words in simple_meaning, explanation and example_sentence." : band === 2 ? "Band 2 (Grade 1): short sentences and common words." : band === 3 ? "Band 3 (Grade 4): clear sentences, at most one less-common word." : "Band 4 (Grade 5): clear sentences suitable for a 10–11-year-old."}
- real_world_usage: a natural sentence a child could say. Use British/Indian usage ("at home", "make a rangoli", "holidays").
- synonyms / antonyms: ONLY true equivalents or true opposites for THIS sense; otherwise use an empty array. Put associated words (e.g. doctor → patient) in related_words instead.
- word_family: real related forms only (label plural-only forms "(plural)"). collocations: 2–3 natural word partners.
- spelling_guidance: one useful, correct tip about a tricky letter pattern, or "" if the word is very simple.
- category: use the reviewed category given. difficulty: ${DIFF_FOR_BAND[band]}. applicable_grades: subset of ${BAND_GRADES[band].join(", ")}.
- Inclusive: families of every kind; no judgements about bodies, appearance, caste, religion or diet; no brands or real people. emoji: one emoji that matches THIS sense.
- learning_objective: one sentence. illustration_brief: what an original illustration should show (no text in the image).
- Do NOT include pronunciation, IPA or etymology (added from the CMU Pronouncing Dictionary separately).`;

async function generate(band: number, rows: { word: string; category: string }[], tag: string) {
  budget(0.25, `generating ${tag}`);
  const r = await call(z.object({ items: z.array(Vocab) }), SYSTEM, `Create complete word cards for children in ${BAND_DESC[band]} — this batch is for ${FOR_GRADE[band]} learners in India — for EXACTLY these ${rows.length} headwords, in this order, one card each:
${rows.map((x) => `- ${x.word} [sense: ${SENSE[x.word] ?? "its most common child-relevant meaning"}] (reviewed category: ${x.category})`).join("\n")}
${RULES(band)}`, "medium", 16000);
  charge(`generate ${tag}`, r.usage, { band });
  if (!r.parsed) throw new Error(`generation returned no output (${r.stop})`);
  return { items: r.parsed.items, model: r.model, usage: r.usage };
}

async function review(card: Card, band: number) {
  budget(0.04, `reviewing ${card.word}`);
  const r = await call(Review, "You are a strict reviewer of English-learning content for Indian children. Judge only what is asked. Indian/British English spelling is correct.",
    `Review this vocabulary card for a ${FOR_GRADE[band]} child in learning band ${band} (${BAND_DESC[band]}) in India. The card teaches ONE sense: "${SENSE[card.word] ?? "its most common meaning"}". Check: grammar, spelling, age-appropriateness, educational value, accuracy of the meaning, whether every synonym/antonym/word-family item is genuinely correct for this sense, Indian/British English usage, and cultural sensitivity. List concrete issues and short suggested fixes (empty arrays if none). Minor style preferences are not issues.
Card: ${JSON.stringify(card)}`, "low", 4000);
  charge("review", r.usage, { word: card.word, band });
  return { review: r.parsed, model: r.model, stop: r.stop };
}

async function fix(card: Card, band: number, category: string, problems: string[]) {
  budget(0.06, `fixing ${card.word}`);
  const r = await call(Vocab, SYSTEM, `Correct this vocabulary card for ${FOR_GRADE[band]} learners (${BAND_DESC[band]}). Keep the same headword "${card.word}" and the same sense [${SENSE[card.word] ?? "most common meaning"}]. Fix EVERY problem listed; keep everything else that is correct.
Problems:
${problems.map((p) => `- ${p}`).join("\n")}
Current card: ${JSON.stringify(card)}
Reviewed category: ${category}.
${RULES(band)}`, "medium", 6000);
  charge("fix", r.usage, { word: card.word, band });
  if (!r.parsed) throw new Error(`fix returned no output (${r.stop})`);
  return r.parsed;
}

function gates(card: Card, band: number, v: z.infer<typeof Review> | null, dupOk: { passed: boolean; detail: string }) {
  const prose = [card.simple_meaning, card.explanation, card.example_sentence].join(" "); const g = readingGrade(prose);
  const gs = [
    { gate: "1 safety moderation", passed: !UNSAFE.test(JSON.stringify(card)), detail: UNSAFE.test(JSON.stringify(card)) ? `Flagged: ${JSON.stringify(card).match(UNSAFE)?.[0]}` : "No unsafe terms." },
    { gate: "2 grade readability", passed: g <= MAX_GRADE[band], detail: `≈ grade ${g.toFixed(1)} (max ${MAX_GRADE[band]})` },
    { gate: "3 grammar & mechanics", passed: mech(card.example_sentence) && containsWord(card.example_sentence, card.word), detail: "Example sentence capitals/punctuation and contains the word." },
    { gate: "4 independent spelling & grammar review (AI)", passed: !!v && v.spelling_ok && v.grammar_ok, detail: v ? (v.spelling_ok && v.grammar_ok ? "OK" : v.issues.join("; ")) : "Reviewer unavailable" },
    { gate: "5 duplicate detection (word registry)", passed: dupOk.passed, detail: dupOk.detail },
    { gate: "6 difficulty validation", passed: DIFF_OK[band].includes(card.difficulty), detail: `${card.difficulty} (band ${band} allows ${DIFF_OK[band].join("/")})` },
    { gate: "7 age suitability (AI)", passed: !!v && v.age_appropriate && v.educational && v.culturally_sensitive_ok, detail: v ? (v.age_appropriate && v.educational && v.culturally_sensitive_ok ? "OK" : v.issues.join("; ")) : "Reviewer unavailable" },
  ];
  const extra = [
    { check: "meaning accuracy (AI)", passed: !!v?.meaning_accurate },
    { check: "synonyms/antonyms/word family accuracy (AI)", passed: !!v?.synonyms_antonyms_accurate },
    { check: "Indian/British usage (AI)", passed: !!v?.indian_british_usage_ok },
  ];
  const local = gs.filter((x) => !x.gate.includes("(AI)")).every((x) => x.passed);
  return { gates: gs, extra, local, passed: gs.every((x) => x.passed) && extra.every((x) => x.passed), grade: +g.toFixed(2) };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const prop = JSON.parse(fs.readFileSync("content-registry/proposals/P0003-vocab-10day-test-final.json", "utf8")).candidates as any[];
  const reserves = JSON.parse(fs.readFileSync(path.join(OUT, "reserves.json"), "utf8")) as any[];
  await registryGuard(prop, { portal: process.env.REGISTRY_PORTAL });
  const existing = await loadExisting({ portal: process.env.REGISTRY_PORTAL });
  const STATE = path.join(OUT, "state.json");
  const state: Record<string, any> = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : {};
  const save = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
  try {
    // 1. Generate (one call per band)
    for (const band of [1, 2, 3, 4]) {
      const rows = prop.filter((p) => p.band === band);
      if (rows.every((r) => state[r.word]?.card)) continue;
      const g = await generate(band, rows, `band ${band}`);
      rows.forEach((r, i) => {
        const c = g.items.find((x) => x.word.toLowerCase() === r.word.toLowerCase()) ?? g.items[i];
        state[r.word] = { ...r, card: c, versions: [c], reviews: [], generator_model: g.model, status: "generated" };
      });
      save(); process.stdout.write(`b${band} generated; `);
    }
    console.log(`\nspent so far $${ledger.usd.toFixed(3)}`);
    // 2–3. Review → fix (≤2 rounds) → replace if still failing
    const queue = Object.keys(state).filter((w) => !state[w].reserve_for);
    const runCard = async (w: string) => {
      const s = state[w];
      for (let round = s.reviews.length; round <= 2 && s.status !== "passed"; round++) {
        if (round > 0 && s.status === "failed") {
          const last = s.reviews[s.reviews.length - 1];
          const problems = [...last.gates.filter((x: any) => !x.passed).map((x: any) => `${x.gate}: ${x.detail}`), ...last.extra.filter((x: any) => !x.passed).map((x: any) => `${x.check} failed`), ...last.issues.map((x: string) => `Reviewer: ${x}`), ...last.suggested_fixes.map((x: string) => `Suggested fix: ${x}`)];
          s.card = await fix(s.card, s.band, s.category, problems); s.versions.push(s.card); s.card.word = w;
        }
        const reg = check([{ word: s.card.word, band: s.band, source: s.source }], existing)[0];
        const dup = { passed: reg.result !== "exclude" && s.card.word.toLowerCase() === w.toLowerCase(), detail: reg.result === "exclude" ? `Registry: ${reg.exact.join("; ")}` : reg.result === "flag" ? `Registry flag: ${[...reg.variants, ...reg.related, ...reg.notes].join("; ")}` : "New word (registry clear)" };
        const pre = gates(s.card, s.band, { grammar_ok: true, spelling_ok: true, age_appropriate: true, educational: true, meaning_accurate: true, synonyms_antonyms_accurate: true, indian_british_usage_ok: true, culturally_sensitive_ok: true, issues: [], suggested_fixes: [] }, dup);
        let v: z.infer<typeof Review> | null = null, model = null;
        if (pre.local) { const r = await review(s.card, s.band); v = r.review; model = r.model; }
        const res = gates(s.card, s.band, v, dup);
        s.reviews.push({ round, ...res, issues: v?.issues ?? (pre.local ? [] : ["Local gate failed; AI review skipped until fixed."]), suggested_fixes: v?.suggested_fixes ?? [], reviewer_model: model, ai_reviewed: !!v });
        s.status = res.passed ? "passed" : "failed"; save();
        process.stdout.write(`${w}:${s.status[0]}${round} `);
      }
      if (s.status !== "passed") s.status = "unfixable";
      save();
    };
    for (let i = 0; i < queue.length; i += 4) await Promise.all(queue.slice(i, i + 4).map(runCard));
    // Replacements from pre-checked reserves (same band)
    for (const w of Object.keys(state).filter((k) => state[k].status === "unfixable" && !state[k].replaced_by)) {
      const s = state[w]; const used = new Set(Object.keys(state));
      const r = reserves.find((x) => x.band === s.band && !used.has(x.word));
      if (!r) { console.log(`\nno reserve left for band ${s.band} (${w})`); continue; }
      const g = await generate(s.band, [r], `replacement ${r.word}`);
      state[r.word] = { ...r, reserve_for: w, card: g.items[0], versions: [g.items[0]], reviews: [], generator_model: g.model, status: "generated" };
      s.replaced_by = r.word; save();
      await runCard(r.word);
    }
  } catch (e) {
    if (e instanceof CapReached) { console.log(`\n${e.message}`); }
    else throw e;
  } finally {
    save();
    const st = Object.values(state).reduce((m: any, s: any) => ((m[s.status] = (m[s.status] ?? 0) + 1), m), {});
    console.log(`\nstatus ${JSON.stringify(st)} | calls ${ledger.calls.length} | cost $${ledger.usd.toFixed(3)} ≈ ₹${(ledger.usd * INR).toFixed(0)}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
