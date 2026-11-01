import { describe, expect, it } from "vitest";
import { SCENES, checkSentence, describeScore, levelFor } from "@/lib/scenes";

describe("Word Scenes", () => {
  it("8 scenes, each complete for both age levels", () => {
    expect(SCENES).toHaveLength(8);
    for (const s of SCENES) {
      expect(s.items.length, s.slug).toBeGreaterThanOrEqual(8);
      expect(new Set(s.items.map((i) => i.word)).size).toBe(s.items.length);
      for (const lv of ["young", "older"] as const) {
        const t = s.sentences.find((x) => x.level === lv)!;
        expect(t, `${s.slug} ${lv} sentence`).toBeTruthy();
        expect(checkSentence(t, t.tiles.join(" ")), `${s.slug} tiles build the answer`).toBe(true);
        const qs = s.questions.filter((q) => q.level === lv);
        expect(qs.length).toBeGreaterThanOrEqual(2);
        qs.forEach((q) => expect(q.options, q.q).toContain(q.answer));
      }
      for (const i of s.items) { expect(i.x).toBeGreaterThanOrEqual(5); expect(i.x).toBeLessThanOrEqual(95); expect(i.y).toBeGreaterThanOrEqual(5); expect(i.y).toBeLessThanOrEqual(90); }
    }
  });
  it("accepts valid alternative word orders and checks descriptions by scene words", () => {
    const w = SCENES.find((s) => s.slug === "weather-station")!.sentences.find((t) => t.level === "older")!;
    expect(checkSentence(w, "It will be cloudy and windy tomorrow.")).toBe(true);
    const d = describeScore(SCENES[4].describe.keywords, "We walked over the bridge and saw leaves near the river.");
    expect(d.used).toEqual(expect.arrayContaining(["river", "bridge", "leaves"]));
    expect(levelFor(1)).toBe("young"); expect(levelFor(4)).toBe("older");
  });
});
