import "server-only";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { one, query } from "../db";
import { AI_MODEL, FALLBACK, aiEnabled, claude } from "../ai/client";
import { validateContent } from "./validate";
import { THEMES } from "./curriculum";

const BAND_DESC: Record<number, string> = { 1: "Pre-KG–UKG (ages 3–6)", 2: "Grades 1–2 (ages 6–8)", 3: "Grades 3–4 (ages 8–10)", 4: "Grades 5–7 (ages 10–13)" };
const SYSTEM = "You create original English-learning content for Indian children for PING VIBE. Use simple Indian-English contexts (festivals, cricket, monsoon, tiffin). Never include brands, real people, violence, fear, romance, or unsafe activities. Spelling: Indian/British English.";

const VocabItem = z.object({ word: z.string(), part_of_speech: z.string(), phonetic: z.string(), meaning: z.string(), explanation: z.string(), example: z.string(), usage: z.string(), synonyms: z.array(z.string()), antonyms: z.array(z.string()), emoji: z.string(), difficulty: z.number().int() });
const TopicItem = z.object({ title: z.string(), prompt: z.string(), min_words: z.number().int(), suggested_words: z.array(z.string()), emoji: z.string() });
const StoryItem = z.object({ title: z.string(), genre: z.string(), emoji: z.string(), pages: z.array(z.object({ scene: z.string(), text: z.string() })), glossary: z.array(z.object({ word: z.string(), meaning: z.string() })), questions: z.array(z.object({ q: z.string(), options: z.array(z.string()), answer: z.number().int() })) });
const GrammarItem = z.object({ q: z.string(), options: z.array(z.string()), answer: z.number().int(), hint: z.string() });
const SpeakingItem = z.object({ title: z.string(), emoji: z.string(), lines: z.array(z.string()) });

export type GenKind = "vocabulary" | "writing_topic" | "story" | "grammar" | "speaking";

async function ask<T>(schema: z.ZodType<T>, prompt: string): Promise<T> {
  const r = await claude().beta.messages.parse({
    model: AI_MODEL, max_tokens: 16000, ...FALLBACK, system: SYSTEM,
    output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
    messages: [{ role: "user", content: prompt }],
  });
  if (r.stop_reason === "refusal" || !r.parsed_output) throw new Error(`Generation unavailable (${r.stop_reason})`);
  return r.parsed_output;
}

/** Generates a batch into content_library (status pending / auto-rejected). Nothing reaches children until an admin publishes it. */
export async function runGeneration(kind: GenKind, band: number, opts: { category?: string; topic?: string; count?: number; requestedBy?: string }) {
  if (!aiEnabled()) throw new Error("AI generation needs ANTHROPIC_API_KEY on the server.");
  const job = (await one<{ id: string }>(`insert into content_generation_jobs (kind, band, params, requested_by) values ($1,$2,$3,$4) returning id`,
    [kind, band, JSON.stringify(opts), opts.requestedBy ?? "admin"]))!;
  const n = Math.max(1, Math.min(10, opts.count ?? 5));
  try {
    let items: { title: string; body: any }[] = [];
    if (kind === "vocabulary") {
      const heads = await query<{ word: string; category: string }>(`select word, category from vocabulary_candidates where band = $1 and status = 'queued' order by random() limit $2`, [band, n]);
      if (!heads.length) throw new Error("No queued headwords for this band. Add candidates first.");
      const out = await ask(z.object({ items: z.array(VocabItem) }),
        `Create word cards for ${BAND_DESC[band]} for these headwords: ${heads.map((h) => `${h.word} (${h.category})`).join(", ")}.
phonetic = child-friendly respelling with the stressed syllable in CAPS (e.g. ih-NOR-muhs). example MUST contain the word. difficulty 1–5 (band 1: 1–2, band 2: 1–3, band 3: 2–4, band 4: 3–5). For idioms/phrasal verbs keep the exact phrase as "word".`);
      items = out.items.map((i) => ({ title: i.word, body: { ...i, category: heads.find((h) => h.word === i.word.toLowerCase())?.category ?? "general" } }));
      await query(`update vocabulary_candidates set status = 'generated' where word = any($1::text[])`, [heads.map((h) => h.word)]);
    } else if (kind === "writing_topic") {
      const cat = opts.category ?? THEMES[Math.floor(Math.random() * THEMES.length)].key;
      const recent = await query<{ title: string }>(`select title from writing_topics where band = $1 and category = $2 order by created_at desc limit 40`, [band, cat]);
      const out = await ask(z.object({ items: z.array(TopicItem) }),
        `Create ${n} fresh, varied writing topics for ${BAND_DESC[band]} in the category "${THEMES.find((t) => t.key === cat)?.title ?? cat}". Avoid these existing titles: ${recent.map((r) => r.title).join(" | ")}. prompt = 1–3 encouraging sentences. min_words: band1 5, band2 25, band3 60, band4 120.`);
      items = out.items.map((i) => ({ title: i.title, body: { ...i, category: cat, mode: band === 1 ? "sentence" : band === 4 ? "essay" : "paragraph" } }));
    } else if (kind === "story") {
      const out = await ask(StoryItem,
        `Write one original illustrated short story for ${BAND_DESC[band]}${opts.category ? ` about ${opts.category}` : ""}. ${band === 1 ? "4 pages, 1–2 short sentences each" : band === 2 ? "4 pages, 2–3 sentences each" : "5 pages, 3–4 sentences each"}. scene = 2–3 emojis. 3–5 glossary words. 3–4 comprehension questions with 3 options and the correct answer index.`);
      items = [{ title: out.title, body: out }];
    } else if (kind === "grammar") {
      const t = await one<{ title: string; explanation: string }>(`select title, explanation from grammar_topics where slug = $1`, [opts.topic]);
      if (!t) throw new Error("Choose a grammar topic.");
      const out = await ask(z.object({ items: z.array(GrammarItem) }),
        `Create ${n} new multiple-choice exercises on "${t.title}" for ${BAND_DESC[band]}. Topic: ${t.explanation}. 2–4 options each, exactly one correct; answer = index of the correct option; hint = gentle nudge without giving the answer.`);
      items = [{ title: `${t.title}: ${out.items.length} exercises`, body: { topic: opts.topic, exercises: out.items } }];
    } else if (kind === "speaking") {
      const out = await ask(z.object({ items: z.array(SpeakingItem) }),
        `Create ${n} real-life speaking scenarios for ${BAND_DESC[band]} (e.g. at the post office, a birthday party). Each: 4 short lines a child would say, polite and natural.`);
      items = out.items.map((i) => ({ title: i.title, body: i }));
    }
    let produced = 0, rejected = 0;
    for (const it of items) {
      const v = await validateContent(kind, band, it.body);
      await query(`insert into content_library (kind, title, band, body, validation, source, status, job_id) values ($1,$2,$3,$4,$5,'ai',$6,$7)`,
        [kind, it.title, band, JSON.stringify(it.body), JSON.stringify(v), v.passed ? "pending" : "rejected", job.id]);
      if (v.passed) produced++; else rejected++;
    }
    await query(`update content_generation_jobs set status = 'done', produced = $2, rejected = $3, finished_at = now() where id = $1`, [job.id, produced, rejected]);
    return { produced, rejected };
  } catch (e) {
    await query(`update content_generation_jobs set status = 'failed', error = $2, finished_at = now() where id = $1`, [job.id, (e as Error).message]);
    throw e;
  }
}

/** Admin approval → publish into the live tables. */
export async function publish(id: string, adminId: string) {
  const c = await one<{ id: string; kind: string; band: number; body: any; status: string; source: string }>(`select * from content_library where id = $1`, [id]);
  if (!c) throw new Error("Not found");
  if (c.status !== "pending" && c.status !== "approved") throw new Error(`Cannot publish an item that is ${c.status}.`);
  const b = c.body;
  const src = c.source === "ai" ? "ai" : "manual";
  if (c.kind === "vocabulary") {
    await query(`insert into vocabulary_master (word, band, part_of_speech, phonetic, meaning, explanation, example, usage, synonyms, antonyms, emoji, difficulty, category, source)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict (lower(word)) do nothing`,
      [b.word, c.band, b.part_of_speech, b.phonetic, b.meaning, b.explanation, b.example, b.usage ?? "", b.synonyms ?? [], b.antonyms ?? [], b.emoji ?? "✨", Math.min(5, Math.max(1, b.difficulty ?? 1)), b.category ?? "general", src]);
    await query(`update vocabulary_candidates set status = 'published' where word = lower($1)`, [b.word]);
  } else if (c.kind === "writing_topic") {
    const slug = `${src}-${c.band}-${b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    await query(`insert into writing_topics (slug, title, prompt, band, mode, min_words, suggested_words, emoji, category, source) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (slug) do nothing`,
      [slug, b.title, b.prompt, c.band, b.mode ?? "paragraph", b.min_words, b.suggested_words ?? [], b.emoji ?? "✏️", b.category ?? "general", src === "ai" ? "ai" : "manual"]);
  } else if (c.kind === "story") {
    const slug = `${src}-${b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    await query(`insert into reading_stories (slug, title, genre, band, emoji, cover, pages, glossary, questions, source) values ($1,$2,$3,$4,$5,'forest',$6,$7,$8,$9) on conflict (slug) do nothing`,
      [slug, b.title, b.genre, c.band, b.emoji ?? "📖", JSON.stringify(b.pages), JSON.stringify(b.glossary), JSON.stringify(b.questions), src]);
  } else if (c.kind === "grammar") {
    await query(`update grammar_topics set exercises = exercises || (
        select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements($2::jsonb) e
        where not exists (select 1 from jsonb_array_elements(grammar_topics.exercises) x where lower(x->>'q') = lower(e->>'q'))
      ) where slug = $1`, [b.topic, JSON.stringify(b.exercises)]);
  } else if (c.kind === "speaking") {
    const slug = `${src}-${b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    await query(`insert into speaking_scenarios (slug, title, emoji, band, lines, source) values ($1,$2,$3,$4,$5,$6) on conflict (slug) do nothing`, [slug, b.title, b.emoji, c.band, b.lines, src]);
  }
  await query(`update content_library set status = 'published', reviewed_by = $2, reviewed_at = now() where id = $1`, [id, adminId]);
}

/** Honest content runway per grade: how many days of NEW content are actually published. */
export async function coverage() {
  const grades = await query<{ grade: string; label: string; band: number; new_words_per_day: number }>(`select grade, label, band, new_words_per_day from grade_config where active order by sort_order`);
  const vocab = await query<{ band: number; n: number }>(`select band, count(*)::int n from vocabulary_master where status = 'published' group by band`);
  const cands = await query<{ band: number; n: number }>(`select band, count(*)::int n from vocabulary_candidates where status in ('queued','generated') group by band`);
  const topics = await query<{ band: number; n: number }>(`select band, count(*)::int n from writing_topics where active group by band`);
  const stories = await query<{ band: number; n: number }>(`select band, count(*)::int n from reading_stories where active group by band`);
  const plans = await query<{ grade: string; n: number }>(`select grade, count(*)::int n from learning_plans group by grade`);
  const grammar = await one<{ topics: number; exercises: number }>(`select count(*)::int topics, coalesce(sum(jsonb_array_length(exercises)),0)::int exercises from grammar_topics`);
  const speaking = await one<{ n: number }>(`select count(*)::int n from speaking_scenarios where active`);
  const get = (rows: { band: number; n: number }[], b: number) => rows.find((r) => r.band === b)?.n ?? 0;
  return grades.map((g) => {
    // A child draws new words from their band first, then harder bands.
    const wordsAvail = [1, 2, 3, 4].filter((b) => b >= g.band).reduce((s, b) => s + get(vocab, b), 0);
    // 6 vocabulary days per 7 (day 6 = half, day 7 = assessment).
    const perWeek = g.new_words_per_day * 5.5;
    const vocabDays = Math.floor((wordsAvail / perWeek) * 7);
    return {
      grade: g.grade, label: g.label, band: g.band, plans: plans.find((p) => p.grade === g.grade)?.n ?? 0,
      wordsInBand: get(vocab, g.band), wordsAvailable: wordsAvail, vocabDays: Math.min(vocabDays, 9999), candidates: get(cands, g.band),
      topics: get(topics, g.band), stories: get(stories, g.band), grammarTopics: grammar?.topics ?? 0, grammarExercises: grammar?.exercises ?? 0, speaking: speaking?.n ?? 0,
    };
  });
}
