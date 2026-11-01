import { describe, expect, it } from "vitest";
import { offlineImprove, judgeRewrite } from "@/lib/improve";

describe("Improve My Sentence (offline)", () => {
  it("keeps the original and only suggests", () => {
    const r = offlineImprove("i saw a big dog");
    expect(r.original).toBe("i saw a big dog");
    expect(r.suggestions.length).toBeGreaterThan(0);
    expect(r.suggestions.some((s) => s.kind === "fix" && s.why.includes("capital"))).toBe(true);
    expect(r.suggestions.some((s) => s.kind === "word" && s.idea.includes("big"))).toBe(true);
    r.suggestions.forEach((s) => expect(s.why.length).toBeGreaterThan(5));
  });
  it("judges the child's own rewrite", () => {
    const sug = offlineImprove("i saw a big dog").suggestions;
    expect(judgeRewrite("i saw a big dog", "i saw a big dog", sug).improved).toBe(false);
    const j = judgeRewrite("i saw a big dog", "I saw an enormous fluffy dog in the park.", sug);
    expect(j.improved).toBe(true);
    expect(j.notes.join(" ")).toMatch(/power word/);
  });
});
