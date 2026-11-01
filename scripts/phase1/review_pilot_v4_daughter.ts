/**
 * Targeted AI meaning check of the v4 daughter card only (1 call) — read-only on the v4 files.
 * Same reviewer prompt/schema/model as review_pilot.ts (gates 4 & 7 + meaning, synonym/antonym, Indian/British usage, cultural checks).
 * Writes only to _work/gen/vocab_pilot_v2_review/. No card is edited, imported or published.
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

const SRC = "deliverables/phase-1-content/pilot/v4/PINGVIBE_Vocab_Pilot_Cards_v4.json";
const OUT = "deliverables/phase-1-content/_work/gen/vocab_pilot_v4_daughter_review";
const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const client = new Anthropic({ apiKey: process.env.PINGVIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY, maxRetries: 3, timeout: 300_000 });
const Review = z.object({
  grammar_ok: z.boolean(), spelling_ok: z.boolean(), age_appropriate: z.boolean(), educational: z.boolean(),
  meaning_accurate: z.boolean(), synonyms_antonyms_accurate: z.boolean(), indian_british_usage_ok: z.boolean(), culturally_sensitive_ok: z.boolean(),
  issues: z.array(z.string()), suggested_fixes: z.array(z.string()),
});
const BAND: Record<number, string> = { 1: "ages 3-6", 2: "ages 6-8", 3: "ages 8-10", 4: "ages 10-13" };
const CONTENT = ["word", "part_of_speech", "simple_meaning", "explanation", "example_sentence", "real_world_usage", "synonyms", "antonyms", "word_family", "collocations", "spelling_guidance", "related_words", "category", "difficulty", "applicable_grades", "learning_objective", "illustration_brief", "emoji"];

async function main() {
  const cards = (JSON.parse(fs.readFileSync(SRC, "utf8")).cards as any[]).filter((c) => c.word === "daughter" && c.content_version === 4);
  if (cards.length !== 1) throw new Error(`expected exactly 1 card (daughter v4), found ${cards.length}`);
  fs.mkdirSync(OUT, { recursive: true });
  const todo = cards.filter((c) => !fs.existsSync(path.join(OUT, `${c.word}.json`)));
  console.log(`daughter v4: reviews to run ${todo.length} (model ${MODEL})`);
  let i = 0, errors = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (i < todo.length) {
      const c = todo[i++];
      const card = Object.fromEntries(CONTENT.map((k) => [k, c[k]]));
      try {
        const r = await client.beta.messages.parse({
          model: MODEL, max_tokens: 4000, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
          system: "You are a strict reviewer of English-learning content for Indian children. Judge only what is asked. Indian/British English spelling is correct.",
          output_config: { effort: "low", format: betaZodOutputFormat(Review) },
          messages: [{ role: "user", content: `Review this vocabulary card for a child in learning band ${c.band} (${BAND[c.band]}) in India. Check: grammar, spelling, age-appropriateness, educational value, accuracy of the meaning, whether every synonym/antonym/word-family item is genuinely correct, Indian/British English usage, and cultural sensitivity. List concrete issues and short suggested fixes (empty lists if none).\n<card>\n${JSON.stringify(card)}\n</card>` }],
        } as any);
        fs.writeFileSync(path.join(OUT, `${c.word}.json`), JSON.stringify({ candidate_id: c.candidate_id, word: c.word, band: c.band, content_version: 4, review: r.parsed_output, reviewer_model: r.model, reviewer_stop: r.stop_reason, usage: r.usage }, null, 1));
        process.stdout.write(".");
      } catch (e) { errors++; console.error(`\n${c.word}: ${(e as Error).message.slice(0, 160)}`); }
    }
  }));
  console.log(`\ndone, errors ${errors}`);
}
main();
