import { describe, expect, it } from "vitest";
import { evaluateAnswer, fillReply, suggestLevel, turnsFor } from "../src/lib/reallife";
import { REAL_LIFE_SEED } from "../src/server/content/reallife";

const restaurant = REAL_LIFE_SEED.find((s) => s.slug === "restaurant")!;
const order = restaurant.turns[0];

describe("VIBE REAL LIFE answer evaluation", () => {
  it("accepts the model answer", () => expect(evaluateAnswer(order, "I would like a sandwich, please.").result).toBe("great"));
  it("accepts other natural phrasings, not one exact sentence", () => {
    for (const a of ["Can I have a pizza please", "May I have some noodles, please?", "I'll have a dosa please", "Could I get a burger please"]) expect(evaluateAnswer(order, a).result).toBe("great");
  });
  it("understands but gently coaches politeness", () => {
    const r = evaluateAnswer(order, "I want a sandwich");
    expect(r.result).toBe("ok"); expect(r.tip).toMatch(/please/);
  });
  it("accepts a bare item as understood, nudging toward a full sentence", () => expect(evaluateAnswer(order, "sandwich").result).toBe("ok"));
  it("asks to retry when the answer doesn't fit", () => expect(evaluateAnswer(order, "I like trains").result).toBe("retry"));
  it("captures the item for the character's natural reply", () => {
    const r = evaluateAnswer(order, "Can I have a pizza please");
    expect(fillReply(order.reply, r.item)).toBe("Great choice! One pizza coming right up.");
  });
  it("all 24 scenarios: every model answer is accepted and every 'great' option passes", () => {
    expect(REAL_LIFE_SEED).toHaveLength(24);
    for (const s of REAL_LIFE_SEED) for (const t of s.turns) {
      expect(evaluateAnswer(t, t.model).result, `${s.slug}: ${t.model}`).toBe("great");
      for (const o of t.options.filter((x) => x.result === "great")) expect(["great", "ok"], `${s.slug}: ${o.text}`).toContain(evaluateAnswer(t, o.text).result);
    }
  });
  it("advanced level adds longer conversations; beginner and developing share the core", () => {
    expect(turnsFor(restaurant, "advanced").length).toBeGreaterThan(turnsFor(restaurant, "beginner").length);
    expect(turnsFor(restaurant, "developing")).toEqual(turnsFor(restaurant, "beginner"));
  });
  it("suggests levels from age and evidence, never locking by grade alone", () => {
    expect(suggestLevel(1, null)).toBe("beginner");
    expect(suggestLevel(4, null)).toBe("developing");
    expect(suggestLevel(3, 85)).toBe("advanced");
    expect(suggestLevel(4, 40)).toBe("beginner");
  });
});
