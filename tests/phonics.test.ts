import { describe, expect, it } from "vitest";
import { UNITS, buildUnit, unitState } from "@/lib/phonics";

describe("Phonics & Sound Valley", () => {
  it("every unit builds 6 valid questions with the answer among the options", () => {
    for (const u of UNITS) for (const seed of [1, 7, 42, 999]) {
      const { questions, key } = buildUnit(u.slug, seed);
      expect(questions.length, u.slug).toBe(6);
      questions.forEach((q, i) => {
        expect(q.options, `${u.slug} ${q.prompt}`).toContain(key[i].answer);
        expect(new Set(q.options).size, `${u.slug} duplicate options`).toBe(q.options.length);
        expect(key[i].explain.length).toBeGreaterThan(5);
      });
    }
  });
  it("is deterministic for a seed (server can rebuild the key)", () => {
    expect(buildUnit("rhyming", 5)).toEqual(buildUnit("rhyming", 5));
  });
  it("opens units from evidence, not grade alone", () => {
    const fresh = unitState(4, {});
    expect(fresh[0].open).toBe(true);
    expect(fresh[1].open).toBe(false); // a Grade 6 child still starts at the beginning, and moves on fast by passing
    const after = unitState(4, { "letter-sounds": 100 });
    expect(after[1].open).toBe(true);
  });
});
