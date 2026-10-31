import { describe, expect, it } from "vitest";
import { mistakeWords, spellingTip } from "../src/lib/feedback";

describe("mistake feedback", () => {
  it("explains an extra letter (beautifull)", () => expect(spellingTip("beautifull", "beautiful")).toBe("Remember: there's no extra “l” in “beautiful”."));
  it("explains a missing letter", () => expect(spellingTip("becaus", "because")).toContain("Don't forget the “e”"));
  it("explains swapped letters", () => expect(spellingTip("freind", "friend")).toBe("The letters “ie” go in that order."));
  it("explains a wrong letter", () => expect(spellingTip("happu", "happy")).toBe("Letter 5 is “y”, not “u”."));
  it("handles an empty answer", () => expect(spellingTip("  ", "cat")).toContain("letter by letter"));
  it("uses simpler words for younger children and plainer words for older ones", () => {
    expect(mistakeWords(1, "cat").title).toBe("Almost! 🌟");
    expect(mistakeWords(4, "astonish").title).toBe("Not quite.");
  });
});

import { soundOut } from "../src/lib/feedback";
describe("sound it out", () => {
  it("splits longer words into readable chunks that rebuild the word", () => {
    for (const w of ["astonish", "beautiful", "adventure", "elephant", "magnificent"]) expect(soundOut(w).join("")).toBe(w);
    expect(soundOut("astonish").length).toBeGreaterThan(1);
  });
  it("keeps short words whole", () => expect(soundOut("cat")).toEqual(["cat"]));
});
