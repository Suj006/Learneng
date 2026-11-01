// Exports the existing (seeded) content as the Phase 1 baseline. Read-only: nothing in the app is changed.
import fs from "node:fs";
import { VOCABULARY } from "../../src/server/content/vocabulary";
import { headwordRows } from "../../src/server/content/headwords";
import { GRAMMAR_TOPICS } from "../../src/server/content/grammar";
import { STORIES } from "../../src/server/content/stories";
import { allTemplateTopics } from "../../src/server/content/topic-templates";
import { THEMES } from "../../src/server/content/curriculum";

const out = "deliverables/phase-1-content/_work/baseline.json";
const topics = ([1, 2, 3, 4] as const).flatMap((b) => allTemplateTopics(b, () => "✏️"));
fs.writeFileSync(out, JSON.stringify({
  exported_at: new Date().toISOString(),
  vocabulary: VOCABULARY, headwords: headwordRows(), grammar: GRAMMAR_TOPICS, stories: STORIES,
  writing_topics: topics, writing_themes: THEMES.map((t) => ({ key: t.key, title: t.title })),
}, null, 1));
console.log({ vocabulary: VOCABULARY.length, headwords: headwordRows().length, grammar: GRAMMAR_TOPICS.length, grammar_exercises: GRAMMAR_TOPICS.reduce((s, g) => s + g.exercises.length, 0), stories: STORIES.length, writing_template_topics: topics.length });
