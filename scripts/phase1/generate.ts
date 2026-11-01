/**
 * Phase 1 content generation through the platform's own content-generation path (Claude, structured outputs).
 * Checkpointed: each item is written to _work/gen/<kind>/<id>.json, so re-running only fills the gaps.
 * Nothing is published: every item is marked "awaiting human approval" downstream.
 * Usage: npx tsx scripts/phase1/generate.ts vocab|story|story_enrich|grammar|phonics [concurrency]
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { CATEGORIES, DIFFICULTIES, BAND_DESC, BAND_GRADES, NEW_STORIES, GRAMMAR, PHONICS } from "./briefs";

const W = "deliverables/phase-1-content/_work";
const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const client = new Anthropic({ apiKey: process.env.PINGVIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY, maxRetries: 3, timeout: 300_000 });
const SYSTEM = `You write original, accurate English-learning content for PING VIBE, a safe learning world for Indian children aged 3–13.
Use Indian/British English spelling (colour, favourite) and natural, warm, simple Indian everyday contexts (school, tiffin, cricket, monsoon, festivals, family).
Never include brands, real living people, violence, fear, romance, unsafe activities or stereotypes. Be educationally precise. Do not invent facts.`;
const GRADES = ["PRE_KG", "LKG", "UKG", "G1", "G2", "G3", "G4", "G5", "G6", "G7"] as const;
const DIFF_FOR_BAND: Record<number, string> = { 1: "Beginner or Developing", 2: "Beginner, Developing or Intermediate", 3: "Developing, Intermediate or Advanced", 4: "Intermediate, Advanced or Challenge" };

async function ask<T>(schema: z.ZodType<T>, prompt: string, maxTokens = 16000): Promise<T> {
  const r = await client.beta.messages.parse({
    model: MODEL, max_tokens: maxTokens, system: SYSTEM,
    betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
    messages: [{ role: "user", content: prompt }],
  } as any);
  if (r.stop_reason === "refusal" || !r.parsed_output) throw new Error(`no output (${r.stop_reason})`);
  return { ...(r.parsed_output as any), _model: r.model, _usage: r.usage, _stop: r.stop_reason } as T;
}

async function pool<T>(items0: T[], n: number, fn: (x: T) => Promise<void>) {
  const items = items0.slice(0, Number(process.env.LIMIT ?? 1e9));
  let i = 0; const errors: string[] = [];
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const x = items[i++]; try { await fn(x); } catch (e) { errors.push(String((e as Error).message).slice(0, 200)); } } }));
  return errors;
}
const save = (kind: string, id: string, data: unknown) => { fs.mkdirSync(path.join(W, "gen", kind), { recursive: true }); fs.writeFileSync(path.join(W, "gen", kind, `${id}.json`), JSON.stringify(data, null, 1)); };
const done = (kind: string, id: string) => fs.existsSync(path.join(W, "gen", kind, `${id}.json`));

// ── Schemas ──
const Vocab = z.object({
  word: z.string(), part_of_speech: z.string(), simple_meaning: z.string(), explanation: z.string(), example_sentence: z.string(), real_world_usage: z.string(),
  synonyms: z.array(z.string()), antonyms: z.array(z.string()), word_family: z.array(z.string()), collocations: z.array(z.string()), spelling_guidance: z.string(),
  related_words: z.array(z.string()), category: z.enum(CATEGORIES), difficulty: z.enum(DIFFICULTIES), learning_objective: z.string(),
  illustration_brief: z.string(), emoji: z.string(), applicable_grades: z.array(z.enum(GRADES)),
});
const QTYPES = ["literal", "vocabulary_in_context", "sequencing", "inference", "main_idea", "prediction", "critical_thinking", "personal_response", "summarisation", "evidence_from_text", "authors_purpose", "fact_or_opinion"] as const;
const Question = z.object({ type: z.enum(QTYPES), question: z.string(), options: z.array(z.string()), answer_index: z.number().int(), model_answer: z.string(), explanation: z.string() });
const Story = z.object({
  synopsis: z.string(), learning_objectives: z.array(z.string()), difficulty: z.enum(DIFFICULTIES), characters: z.array(z.object({ name: z.string(), description: z.string() })),
  pages: z.array(z.object({ section_title: z.string(), text: z.string(), illustration_brief: z.string(), scene_emoji: z.string() })),
  easy_read_pages: z.array(z.string()), challenge_read_pages: z.array(z.string()),
  glossary: z.array(z.object({ word: z.string(), meaning: z.string() })), questions: z.array(Question), writing_activity: z.string(), related_topics: z.array(z.string()),
  branch: z.object({ after_page: z.number().int(), prompt: z.string(), options: z.array(z.object({ label: z.string(), ending_title: z.string(), pages: z.array(z.object({ text: z.string(), illustration_brief: z.string() })) })) }).nullable(),
});
const StoryEnrich = z.object({
  synopsis: z.string(), learning_objectives: z.array(z.string()), difficulty: z.enum(DIFFICULTIES), characters: z.array(z.object({ name: z.string(), description: z.string() })),
  illustration_briefs: z.array(z.string()), extra_questions: z.array(Question), writing_activity: z.string(), related_topics: z.array(z.string()),
});
const STAGES = ["discover", "understand", "practise", "apply", "master"] as const;
const ETYPES = ["multiple_choice", "fill_blank", "error_correction", "sentence_construction", "sentence_transformation", "matching", "contextual_usage", "short_writing", "mixed_revision"] as const;
const Grammar = z.object({
  description: z.string(), grammy_explanation: z.string(), learning_objective: z.string(), grades: z.array(z.enum(GRADES)), difficulty: z.enum(DIFFICULTIES),
  examples: z.array(z.object({ sentence: z.string(), note: z.string() })), common_mistakes: z.array(z.object({ mistake: z.string(), correction: z.string(), why: z.string() })),
  discover_activity: z.string(), understand_activity: z.string(), application_activity: z.string(), mastery_criteria: z.string(), revision_recommendation: z.string(),
  exercises: z.array(z.object({ stage: z.enum(STAGES), type: z.enum(ETYPES), prompt: z.string(), options: z.array(z.string()), answer: z.string(), accepted_answers: z.array(z.string()), explanation: z.string(), hint: z.string() })),
});
const PTYPES = ["hear_the_sound", "identify_the_sound", "match_sound_to_picture", "match_sound_to_letter", "blend_sounds", "segment_word", "build_word", "find_rhyme", "missing_sound", "decode_new_word", "listen_and_select", "read_aloud"] as const;
const Phonics = z.object({
  learning_objective: z.string(), grades: z.array(z.enum(GRADES)), age_suitability: z.string(), difficulty: z.enum(DIFFICULTIES),
  teaching_explanation: z.string(), adult_note: z.string(), patterns: z.array(z.object({ pattern: z.string(), sound_description: z.string(), example_words: z.array(z.string()) })),
  examples: z.array(z.object({ word: z.string(), emoji: z.string(), breakdown: z.string() })),
  audio_requirements: z.array(z.object({ id: z.string(), script: z.string(), purpose: z.string() })), visual_examples: z.array(z.string()),
  guided_practice: z.array(z.object({ instruction: z.string(), item: z.string(), answer: z.string() })),
  independent_practice: z.array(z.object({ type: z.enum(PTYPES), prompt: z.string(), options: z.array(z.string()), answer: z.string(), feedback: z.string() })),
  word_building: z.array(z.object({ tiles: z.array(z.string()), target: z.string(), hint: z.string() })),
  assessment: z.array(z.object({ prompt: z.string(), options: z.array(z.string()), answer: z.string(), explanation: z.string() })),
  feedback_correct: z.string(), feedback_try_again: z.string(), revision_recommendation: z.string(), mastery_evidence: z.string(),
});

// ── Generators ──
async function vocab(conc: number) {
  const rows = JSON.parse(fs.readFileSync(`${W}/vocab_worklist.json`, "utf8")).rows as { work_id: number; word: string; band: number; source_category: string | null }[];
  const batches: { id: string; band: number; rows: typeof rows }[] = [];
  for (const band of [1, 2, 3, 4]) { const r = rows.filter((x) => x.band === band); for (let i = 0; i < r.length; i += 20) batches.push({ id: `b${band}-${String(i / 20).padStart(3, "0")}`, band, rows: r.slice(i, i + 20) }); }
  const todo = batches.filter((b) => !done("vocab", b.id));
  console.log(`vocab batches ${batches.length}, to do ${todo.length}`);
  return pool(todo, conc, async (b) => {
    const out = await ask(z.object({ items: z.array(Vocab) }), `Create complete word cards for children in ${BAND_DESC[b.band]} for EXACTLY these ${b.rows.length} headwords, in this order, one card each:
${b.rows.map((r) => `- ${r.word}${r.source_category ? ` (tag: ${r.source_category})` : ""}`).join("\n")}
Rules:
- "word" must be exactly the headword as given (keep phrases like phrasal verbs or idioms exactly).
- Homophones (e.g. "knight" vs "night"): give the meaning of THIS spelling only, and use spelling_guidance to contrast it with its partner.
- simple_meaning: one short, accurate sentence. explanation: 1–2 child-friendly sentences for the age band. example_sentence MUST contain the exact headword (same spelling), end with punctuation, and suit the age band.
- real_world_usage: a natural sentence a child could say in daily life. synonyms/antonyms: only real, age-appropriate ones (empty array if none). word_family: real related forms only (e.g. happy → happiness, happily). collocations: 2–3 natural word partners where appropriate, else empty.
- spelling_guidance: one useful tip about a tricky letter pattern or common error, or "" if the word is very simple.
- category: the single best fit from the allowed list. difficulty: ${DIFF_FOR_BAND[b.band]}. applicable_grades: subset of ${BAND_GRADES[b.band].join(", ")} (may include the next grade up if suitable).
- learning_objective: "Understand and use ‘<word>’ to …" style, one sentence. illustration_brief: what an original illustration should show (no text in image). emoji: one relevant emoji.
- Do NOT include pronunciation, IPA or etymology (these come from a verified dictionary separately).`);
    save("vocab", b.id, { band: b.band, requested: b.rows, ...out });
    process.stdout.write(".");
  });
}

const LEN: Record<number, string> = {
  1: "5 pages, each 1–2 very short sentences (total 50–90 words), simple present/past tense, high-frequency words; easy_read: same story in 5 even simpler lines; challenge_read: 5 slightly richer lines.",
  2: "6 pages, each 2–3 sentences (total 150–250 words); easy_read: 6 simpler pages; challenge_read: 6 richer pages with a few new words.",
  3: "7 pages, each 3–5 sentences (total 350–500 words); easy_read: 7 shorter pages with simpler sentences; challenge_read: 7 pages with richer vocabulary and complex sentences.",
  4: "8 pages, each 4–6 sentences (total 600–850 words); easy_read: 8 pages with simpler sentences; challenge_read: 8 pages with advanced vocabulary, figurative language and complex sentences.",
};
const QN: Record<number, string> = {
  1: "6 questions: literal (2), vocabulary_in_context, sequencing, prediction, personal_response.",
  2: "8 questions: literal (2), vocabulary_in_context, sequencing, inference, main_idea, prediction, personal_response.",
  3: "10 questions: literal (2), vocabulary_in_context, sequencing, inference (2), main_idea, prediction, critical_thinking, personal_response.",
  4: "12 questions: literal, vocabulary_in_context, sequencing, inference (2), main_idea, prediction, critical_thinking, summarisation, evidence_from_text, authors_purpose, fact_or_opinion (personal_response optional instead of one inference).",
};
async function story(conc: number) {
  const todo = NEW_STORIES.filter((s) => !done("story", s.id));
  console.log(`stories to do ${todo.length}`);
  return pool(todo, conc, async (s) => {
    const out = await ask(Story, `Write the complete ORIGINAL reading experience "${s.title}" for ${BAND_DESC[s.band]}. Category: ${s.category}. Story idea: ${s.focus}.
Length and variants: ${LEN[s.band]} The "pages" array is the Just Right version. All three versions tell the same story.
${s.category === "Informational reading" ? "This is informational text: every fact must be accurate and simply explained; a light narrative frame is fine." : ""}
Characters: original names (Indian names welcome), 2–4 characters. section_title: a short heading per page. illustration_brief: what an original illustration for that page shows. scene_emoji: 2–3 emojis.
glossary: ${s.band === 1 ? 3 : s.band === 2 ? 5 : 6} words from the story with child-friendly meanings.
Questions: ${QN[s.band]} Multiple-choice questions have 3–4 options and answer_index = index of the one correct option; open questions (personal_response, critical_thinking, summarisation where open) have options [] and answer_index -1 with a model_answer. Every question has a short explanation that points to the text.
writing_activity: one engaging prompt connected to the story. related_topics: 2–4 learning topics (e.g. "water cycle", "kindness").
Branching: ${s.branching ? `REQUIRED. Choose after_page (0-based index, not the last page) where the reader makes a meaningful choice; prompt = the question to the reader; exactly 2 options, each with an ending_title and 2 pages of alternative ending (same style and length as the main pages). Both endings must be positive and age-appropriate but genuinely different. The main "pages" continue the story after after_page as the default path.` : "set branch to null."}
difficulty: suitable for the band (${DIFF_FOR_BAND[s.band]}). learning_objectives: 2–4 concrete reading objectives.`);
    save("story", s.id, { brief: s, ...out });
    process.stdout.write(".");
  });
}
async function storyEnrich(conc: number) {
  const base = JSON.parse(fs.readFileSync(`${W}/baseline.json`, "utf8")).stories as { slug: string; title: string; band: number; pages: { text: string }[]; questions: unknown[]; glossary: unknown[] }[];
  const todo = base.filter((s) => !done("story_enrich", s.slug));
  console.log(`existing stories to enrich ${todo.length}`);
  return pool(todo, conc, async (s) => {
    const out = await ask(StoryEnrich, `This is an EXISTING published PING VIBE story. Do NOT rewrite it. Produce versioned metadata to enrich it.
Story (band ${s.band}, ${BAND_DESC[s.band]}):
${JSON.stringify({ title: s.title, pages: s.pages, glossary: s.glossary, existing_questions: s.questions })}
Return: synopsis (2 sentences), 2–3 learning objectives, difficulty, characters (from the story only), one illustration_brief per page (${s.pages.length}), writing_activity, related_topics,
and extra_questions that ADD the missing types (not duplicating existing ones): inference, main_idea, prediction, vocabulary_in_context, personal_response (${s.band >= 3 ? "plus critical_thinking and summarisation" : "keep simple"}). MC: 3–4 options, answer_index = correct option; open: options [], answer_index -1, model_answer. Explanations point to the text.`, 8000);
    save("story_enrich", s.slug, { slug: s.slug, ...out });
    process.stdout.write(".");
  });
}
async function grammar(conc: number) {
  const base = JSON.parse(fs.readFileSync(`${W}/baseline.json`, "utf8")).grammar as { slug: string; title: string; explanation: string; examples: string[] }[];
  const todo = GRAMMAR.filter((g) => !done("grammar", g.id));
  console.log(`grammar topics to do ${todo.length}`);
  return pool(todo, conc, async (g) => {
    const ex = g.existing ? base.find((b) => b.slug === g.existing) : undefined;
    const out = await ask(Grammar, `Create the complete Grammar Galaxy topic #${g.n} "${g.title}" for PING VIBE. Youngest suitable band: ${g.band_min} (${BAND_DESC[g.band_min]}); it may be used up to Grade 7.
${ex ? `This topic EXTENDS an existing published topic (keep consistent with it): ${JSON.stringify({ title: ex.title, explanation: ex.explanation, examples: ex.examples })}` : "This is a new topic."}
Prerequisite topics: ${g.prereq.join(", ") || "none"}.
grammy_explanation: GRAMMY the owl wizard explains the rule warmly and precisely in 3–6 short sentences. description: one sentence. learning_objective: one measurable sentence.
examples: 5 example sentences with a short note each. common_mistakes: 3 typical learner errors (Indian learners where relevant) with correction and why.
discover_activity, understand_activity, application_activity: each a concrete classroom/home activity. mastery_criteria: measurable (e.g. "80% on mastery questions on two different days"). revision_recommendation: when and what to revise.
exercises: EXACTLY 20, in stage order: discover 2, understand 4, practise 8, apply 4, master 2. Use varied types across the set (multiple_choice, fill_blank, error_correction, sentence_construction, sentence_transformation, matching, contextual_usage, short_writing, mixed_revision) — at least 6 different types.
Each exercise has a different, meaningful context (school, family, festivals, nature, sports, travel...) — never the same sentence frame with a swapped noun.
multiple_choice / fill_blank / contextual_usage: 3–4 options, "answer" must be EXACTLY one of the options. error_correction / sentence_transformation / sentence_construction: options [], "answer" = the correct sentence, accepted_answers = other fully correct versions (may be empty). matching: put the two lists in the prompt (1–4 and a–d), options [], answer like "1-c, 2-a, 3-d, 4-b". short_writing: options [], answer = a model answer, accepted_answers = 2–3 success criteria. hint: a nudge that does not give the answer. explanation: why the answer is right.`);
    save("grammar", g.id, { brief: g, ...out });
    process.stdout.write(".");
  });
}
async function phonics(conc: number) {
  const todo = PHONICS.filter((p) => !done("phonics", p.id));
  console.log(`phonics units to do ${todo.length}`);
  return pool(todo, conc, async (p) => {
    const prev = PHONICS.filter((x) => x.n < p.n).slice(-2).map((x) => x.id);
    const out = await ask(Phonics, `Create the complete phonics learning unit #${p.n} of 40, "${p.title}" for PING VIBE's Phonics & Sound Valley. Focus patterns: ${p.patterns}. Typical starting band ${p.band} (${BAND_DESC[p.band]}), but older children who need foundational support may use it, so keep wording respectful and not babyish.
Follow systematic synthetic phonics practice. Be phonetically accurate. sound_description: describe the sound in plain words with a key word (e.g. "the /sh/ sound you hear at the start of ship"); you may use slash notation like /sh/ but no other IPA.
teaching_explanation: LEXI explains to the child (3–5 short sentences). adult_note: 1–2 sentences for parents/teachers.
examples: 6–8 words that genuinely contain the pattern (decodable for this stage), each with an emoji and a breakdown (e.g. "sh-i-p"). Every example word must be spelled correctly and really fit the pattern.
audio_requirements: list the audio clips that must be PRODUCED (id like "${p.id}-a01", script text, purpose) — these are production requirements, not existing files.
visual_examples: 3 descriptions of original visuals. guided_practice: 4 items (instruction, item, answer). independent_practice: 6 items using at least 4 different activity types; options where relevant, "answer" must be exactly one option when options are given; feedback = encouraging explanation.
word_building: 3 items (letter tiles that include the target letters plus 1–2 distractors, target word, hint). assessment: 5 items with options; answer exactly one option; explanation.
feedback_correct, feedback_try_again: short encouraging lines. revision_recommendation: when to revise and how. mastery_evidence: what shows mastery (e.g. "4/5 on assessment on two different days").
grades: suitable grades. prerequisites: use unit ids such as ${prev.join(", ") || "none (first unit)"}.`, 12000);
    save("phonics", p.id, { brief: p, prerequisites_suggested: prev, ...out });
    process.stdout.write(".");
  });
}

/** PILOT: 40 version-2 "Use" candidates (10 per band) from pilot/pilot_words.json → 4 calls (one per band). Writes gen/vocab_pilot/. */
async function vocabPilot(conc: number) {
  const words = JSON.parse(fs.readFileSync("deliverables/phase-1-content/pilot/pilot_words.json", "utf8")) as { candidate_id: string; word: string; band: number; category: string }[];
  const batches = [1, 2, 3, 4].map((band) => ({ id: `pilot-b${band}`, band, rows: words.filter((w) => w.band === band) }));
  const todo = batches.filter((b) => b.rows.length && !done("vocab_pilot", b.id));
  console.log(`pilot batches ${batches.length}, to do ${todo.length} (model ${MODEL})`);
  return pool(todo, conc, async (b) => {
    const out = await ask(z.object({ items: z.array(Vocab) }), `Create complete word cards for children in ${BAND_DESC[b.band]} (Indian school learners; Indian/British English) for EXACTLY these ${b.rows.length} headwords, in this order, one card each:
${b.rows.map((r) => `- ${r.word} (reviewed category: ${r.category})`).join("\n")}
Rules:
- "word" must be exactly the headword as given. Use the single most common, child-relevant meaning; do not mix meanings on one card.
- simple_meaning: one short, accurate sentence. explanation: 1–2 child-friendly sentences for the age band. example_sentence MUST contain the exact headword, end with punctuation, and use a natural Indian everyday context (school, home, festivals, cricket, monsoon) without stereotypes.
- real_world_usage: a natural sentence a child could say. synonyms/antonyms/word_family/collocations: only real, age-appropriate items (empty arrays if none).
- spelling_guidance: one useful tip, or "" if very simple. category: use the reviewed category given above. difficulty: ${DIFF_FOR_BAND[b.band]}. applicable_grades: subset of ${BAND_GRADES[b.band].join(", ")}.
- learning_objective: one sentence. illustration_brief: what an original illustration should show (no text in the image). emoji: one relevant emoji.
- No people may be described by body size, appearance judgements, caste, religion or diet. No brands or real people.
- Do NOT include pronunciation, IPA or etymology (added from the CMU Pronouncing Dictionary separately).`, 16000);
    save("vocab_pilot", b.id, { band: b.band, requested: b.rows, ...out });
    process.stdout.write(".");
  });
}

const kind = process.argv[2]; const conc = Number(process.argv[3] ?? 6);
const fn = { vocab, vocab_pilot: vocabPilot, story, story_enrich: storyEnrich, grammar, phonics }[kind as "vocab"];
if (!fn) { console.error("kind?"); process.exit(1); }
fn(conc).then((errs) => { console.log(`\n${kind}: done, errors ${errs.length}`); errs.slice(0, 5).forEach((e) => console.log(" -", e)); });
