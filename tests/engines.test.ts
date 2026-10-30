import { describe, expect, it } from "vitest";
import { buildLevels, minXpFor, INITIAL_LEVELS } from "@/server/content/levels";
import { buildPlans, GRADE_CONFIG } from "@/server/content/curriculum";
import { allTemplateTopics } from "@/server/content/topic-templates";
import { VOCABULARY } from "@/server/content/vocabulary";
import { headwordRows } from "@/server/content/headwords";
import { GRAMMAR_TOPICS } from "@/server/content/grammar";
import { STORIES } from "@/server/content/stories";
import { MISSIONS, PETS, LOCATIONS, BUILDINGS, SKILL_NODES, BOSSES, SHOP_ITEMS } from "@/server/content/game";
import { METRIC_KEYS } from "@/server/metrics";
import { offlineEvaluate, fixMechanics } from "@/server/ai/writing";
import { blankOut, findWordToken, isCorrect } from "@/server/vocab";
import { article } from "@/server/practice";
import { readingGrade } from "@/server/content/validate";
import { bandForGrade } from "@/lib/grades";

describe("level system", () => {
  const { levels, rewards } = buildLevels();
  it("creates 250 levels with strictly increasing XP", () => {
    expect(levels).toHaveLength(INITIAL_LEVELS);
    for (let i = 1; i < levels.length; i++) expect(levels[i].min_xp).toBeGreaterThan(levels[i - 1].min_xp);
    expect(levels[0].min_xp).toBe(0);
  });
  it("is achievable: level 250 in under ~2 years at 400 XP/day", () => {
    expect(minXpFor(250) / 400).toBeLessThan(730);
    expect(minXpFor(25) / 400).toBeLessThan(15);
  });
  it("has milestones every 5/10/25/50 with rewards that exist", () => {
    const slugs = new Set(rewards.map((r) => r.slug));
    for (const l of levels) {
      if (l.id % 50 === 0) expect(l.milestone).toBe(50);
      else if (l.id % 25 === 0) expect(l.milestone).toBe(25);
      else if (l.id % 10 === 0) expect(l.milestone).toBe(10);
      else if (l.id % 5 === 0) expect(l.milestone).toBe(5);
      for (const s of l.reward_slugs) expect(slugs.has(s)).toBe(true);
    }
    expect(new Set(rewards.map((r) => r.slug)).size).toBe(rewards.length);
  });
  it("uses the ten requested tier names", () => {
    expect(levels[0].tier_name).toBe("Word Explorer");
    expect(levels[249].tier_name).toBe("Grand English Champion");
  });
});

describe("365-day curriculum", () => {
  const plans = buildPlans();
  it("creates 3,650 plans (365 per grade × 10 grades)", () => {
    expect(plans).toHaveLength(3650);
    for (const g of GRADE_CONFIG) expect(plans.filter((p) => p.grade === g.grade)).toHaveLength(365);
  });
  it("every day has activities; every 7th day is a weekly assessment; every 30th a championship", () => {
    for (const p of plans) {
      expect(p.activities.length).toBeGreaterThan(1);
      if (p.day_number % 7 === 0) expect(p.activities.some((a) => a.type === "weekly_assessment")).toBe(true);
      if (p.day_number % 30 === 0) expect(p.activities.some((a) => a.type === "monthly_championship")).toBe(true);
    }
  });
  it("covers all 14 activity families with rotation and rising difficulty", () => {
    const types = new Set(plans.flatMap((p) => p.activities.map((a) => a.type)));
    for (const t of ["vocabulary", "listening", "spelling", "sentence", "grammar", "writing", "reading", "speaking", "game", "story", "revision", "weekly_assessment", "special", "boss_battle"]) expect(types.has(t as never)).toBe(true);
    const g = plans.filter((p) => p.grade === "G3");
    expect(g[0].difficulty).toBe(1);
    expect(g[364].difficulty).toBe(10);
  });
});

describe("dynamic writing topics", () => {
  it("generates hundreds of unique topics per band", () => {
    for (const band of [1, 2, 3, 4] as const) {
      const t = allTemplateTopics(band, () => "✏️");
      expect(t.length).toBeGreaterThan(250);
      expect(new Set(t.map((x) => x.slug)).size).toBe(t.length);
    }
  });
});

describe("seed content integrity", () => {
  it("every vocabulary example contains its word and words are unique", () => {
    expect(new Set(VOCABULARY.map((w) => w.word)).size).toBe(VOCABULARY.length);
    for (const w of VOCABULARY) expect(findWordToken(w.example, w.word), w.word).not.toBeNull();
  });
  it("headword library is large and unique", () => {
    const rows = headwordRows();
    expect(rows.length).toBeGreaterThan(700);
    expect(new Set(rows.map((r) => r.word)).size).toBe(rows.length);
  });
  it("grammar and story answer keys are in range", () => {
    for (const t of GRAMMAR_TOPICS) for (const e of t.exercises) expect(e.answer).toBeLessThan(e.options.length);
    for (const s of STORIES) for (const q of s.questions) expect(q.answer).toBeLessThan(q.options.length);
  });
  it("game layer only references known metrics, kingdoms and prerequisites", () => {
    const metrics = new Set<string>(METRIC_KEYS);
    for (const m of [...MISSIONS, ...PETS, ...LOCATIONS, ...BUILDINGS] as { metric?: string; unlock_metric?: string }[]) expect(metrics.has((m.metric ?? m.unlock_metric)!)).toBe(true);
    const nodeSlugs = new Set(SKILL_NODES.map((n) => n.slug));
    for (const n of SKILL_NODES) if (n.prereq) expect(nodeSlugs.has(n.prereq)).toBe(true);
    for (const b of BOSSES) expect(LOCATIONS.some((l) => l.href === `/world/boss/${b.slug}`)).toBe(true);
    expect(new Set(SHOP_ITEMS.map((s) => s.slug)).size).toBe(SHOP_ITEMS.length);
  });
});

describe("learning engine helpers", () => {
  it("blanks inflected forms in example sentences", () => {
    expect(blankOut("She whispered a secret to me.", "whisper")).toBe("She _____ a secret to me.");
    expect(findWordToken("The elephant is enormous!", "enormous")).toBe("enormous");
  });
  it("validates answers case-insensitively", () => {
    const w = { id: "1", word: "Brave", meaning: "Not afraid.", example: "He is brave." } as never;
    expect(isCorrect(w, "spelling", " brave ")).toBe(true);
    expect(isCorrect(w, "meaning", "not afraid.")).toBe(true);
    expect(isCorrect(w, "picture", "brav")).toBe(false);
  });
  it("chooses a/an by sound, including exceptions", () => {
    expect(article("apple")).toBe("an");
    expect(article("hour")).toBe("an");
    expect(article("umbrella")).toBe("an");
    expect(article("uniform")).toBe("a");
    expect(article("ball")).toBe("a");
  });
  it("maps grades to content bands", () => {
    expect(bandForGrade("PRE_KG")).toBe(1);
    expect(bandForGrade("G2")).toBe(2);
    expect(bandForGrade("G4")).toBe(3);
    expect(bandForGrade("G7")).toBe(4);
  });
});

describe("offline writing evaluator", () => {
  it("fixes mechanics", () => {
    expect(fixMechanics("i like my dog")).toBe("I like my dog.");
    expect(fixMechanics("we we went to the park")).toBe("We went to the park.");
  });
  it("is encouraging and scores longer, cleaner writing higher", () => {
    const base = { title: "My Pet", prompt: "Write about a pet", grade: "G2", minWords: 25, suggestedWords: ["gentle", "curious"] };
    const weak = offlineEvaluate({ ...base, text: "i hav a dog" });
    const strong = offlineEvaluate({ ...base, text: "I have a gentle dog called Bruno. He is curious and loves to sniff every flower in our garden. Every evening we play fetch in the park. He makes me very happy!" });
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(weak.positives.length).toBeGreaterThan(0);
    expect(weak.corrections[0].corrected).toBe("I hav a dog.");
  });
  it("reading-grade estimate separates simple and complex prose", () => {
    expect(readingGrade("The cat is big. I like the cat.")).toBeLessThan(readingGrade("Meticulous contemplation of inevitable consequences characterises sustainable innovation."));
  });
});
