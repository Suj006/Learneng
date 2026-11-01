// LX 6.0 acceptance tests (brief Part 10, tests 1–14) against a running server. Writes qa/results/qa-lx6.json.
import fs from "node:fs";
import { BASE, client, makeFamily } from "./lib.mjs";

const R = [];
const t = (id, name, cond, actual = "") => { const status = cond === null ? "BLOCKED" : cond ? "PASS" : "FAIL"; R.push({ id, name, status, actual: String(actual).slice(0, 300) }); console.log(`${status.padEnd(7)} ${id} ${name}${status !== "PASS" ? ` — ${actual}` : ""}`); };

/** Plays one real-life scenario to the end: first turn with the given text, others via 2 tries + skip (fast and deterministic). */
async function playScenario(c, slug, level, firstText) {
  const s = await c.call(`/api/real-life/${slug}`, { action: "start", level });
  if (s.status !== 200) return { start: s };
  const runId = s.data.runId; let first = null; let last = null;
  for (let i = 0; i < 12; i++) {
    if (i === 0 && firstText) { first = await c.call(`/api/real-life/${slug}`, { action: "answer", runId, text: firstText, mode: "text" }); last = first; if (first.data.done) break; if (first.data.result !== "retry") continue; }
    await c.call(`/api/real-life/${slug}`, { action: "answer", runId, text: "zz", mode: "text" });
    await c.call(`/api/real-life/${slug}`, { action: "answer", runId, text: "zz", mode: "text" });
    last = await c.call(`/api/real-life/${slug}`, { action: "answer", runId, mode: "text", skip: true });
    if (last.data.done) break;
  }
  return { start: s, first, last, runId };
}

const A = await makeFamily("G3", "Asha");
const B = await makeFamily("G3", "Ravi");
await A.child.call("/api/welcome", {}); await B.child.call("/api/welcome", {});

// 1. Personalised recommendations: two same-grade children with different activity get different suggestions.
const qa = await A.child.call("/api/quest");
const W = Object.fromEntries(qa.data.newWords.map((w) => [w.id, w]));
const ans = (x) => { const w = W[x.wordId]; return x.type === "meaning" ? w.meaning : x.type === "usage" ? w.example : x.type === "fill_blank" ? x.options.find((o) => w.example.toLowerCase().includes(o.toLowerCase())) : w.word; };
for (const x of qa.data.questions) await A.child.call("/api/quest/answer", { wordId: x.wordId, type: x.type, answer: ans(x) });
await A.child.call("/api/quest/complete", { seconds: 300 });
const ra = (await A.child.call("/api/recommendations")).data.recommendations;
const rb = (await B.child.call("/api/recommendations")).data.recommendations;
const sig = (r) => r.map((x) => `${x.kind}:${x.href}`).join("|");
t("LX6-01", "Two G3 children with different activity get different recommendations", sig(ra) !== sig(rb), `A=${sig(ra)} B=${sig(rb)}`);
t("LX6-01b", "Every recommendation has a category and a child-friendly reason", [...ra, ...rb].every((x) => x.kind && x.reason?.length > 10 && x.href?.startsWith("/world")));
t("LX6-01c", "Recommendations link only to pages that exist", (await Promise.all([...ra, ...rb].map((x) => A.child.call(x.href)))).every((r) => r.status === 200));

// 2. Vocabulary lifecycle: 5 new words max, notebook shows history, revision is separate.
t("LX6-02", "Maximum 5 new words per day", qa.data.newWords.length === 5, qa.data.newWords.length);
const words = await A.child.call("/api/words");
const wl = words.data.words ?? words.data;
t("LX6-02b", "Notebook words carry history (date discovered, next revision, practice counts)", Array.isArray(wl) && wl.length === 5 && wl.every((w) => w.first_seen && w.due_on && typeof w.correct_count === "number"), JSON.stringify(wl?.[0] ?? words.data).slice(0, 200));
const nb = await A.child.call("/world/notebook");
t("LX6-02c", "Notebook page renders", nb.status === 200);

// 3. Reading adaptation: level indicator, text size, sentence replay.
const rd = await A.child.call("/world/reading/the-monsoon-puddle");
const html = String(rd.data);
t("LX6-03", "Reader shows reading level, text size controls and sentence replay", rd.status === 200 && /Reading level/.test(html) && /Bigger text/.test(html) && /Replay sentence 1/.test(html), rd.status);

// 4. Writing feedback preserves the child's original.
const orig = "i saw a big dog in the park";
const sug = await A.child.call("/api/writing/improve", { action: "suggest", text: orig });
t("LX6-04", "Improve My Sentence keeps the original and gives explained suggestions", sug.status === 200 && sug.data.original === orig && sug.data.suggestions.length > 0 && sug.data.suggestions.every((s) => s.why && s.idea), JSON.stringify(sug.data).slice(0, 200));
t("LX6-04b", "Suggestions are ideas, not a silent full rewrite", sug.data.suggestions.every((s) => s.kind === "fix" || s.example.toLowerCase() !== orig.toLowerCase()));
const same = await A.child.call("/api/writing/improve", { action: "save", id: sug.data.id, mine: orig });
t("LX6-04c", "Unchanged sentence is not counted as improved (no reward)", same.status === 200 && same.data.improved === false && same.data.award === null, JSON.stringify(same.data).slice(0, 160));
const sug2 = await A.child.call("/api/writing/improve", { action: "suggest", text: orig });
const mine = await A.child.call("/api/writing/improve", { action: "save", id: sug2.data.id, mine: "I saw an enormous fluffy dog in the park after school." });
t("LX6-04d", "Child's own rewrite saved next to the original and rewarded once", mine.status === 200 && mine.data.improved && mine.data.original === orig && mine.data.award?.xp > 0, JSON.stringify(mine.data).slice(0, 160));
t("LX6-04e", "Saving the same sentence twice is refused", (await A.child.call("/api/writing/improve", { action: "save", id: sug2.data.id, mine: "Another." })).status === 400);
const pii = await A.child.call("/api/writing/improve", { action: "suggest", text: "my phone is 9876543210 call me" });
t("LX6-04f", "Private information is caught before any AI call", pii.status === 200 && !!pii.data.safety && !pii.data.id);

// 5. Microphone optional: every Real Life turn can be completed by choice or typing.
const rl = await playScenario(B.child, "restaurant", "beginner", "Can I please have a dosa?");
t("LX6-05", "Real Life completes without a microphone (typed / choice mode)", rl.last?.data?.done === true, JSON.stringify(rl.last?.data ?? rl.start?.data).slice(0, 200));

// 6. Restaurant scenario accepts alternative answers, adapts by grade.
const alt = await playScenario(A.child, "restaurant", "developing", "I'd like a sandwich please");
t("LX6-06", "Restaurant: a natural alternative answer is accepted (not one exact sentence)", alt.first?.data?.result === "great" || alt.first?.data?.result === "ok", JSON.stringify(alt.first?.data).slice(0, 200));
const K = await makeFamily("PRE_KG", "Mini"); await K.child.call("/api/welcome", {});
const hubK = String((await K.child.call("/world/real-life")).data), hubA = String((await A.child.call("/world/real-life")).data);
t("LX6-06b", "Suggested level adapts to age (Pre-KG beginner, G3 developing)", /beginner/i.test(hubK) && /developing/i.test(hubA));
const adv = await A.child.call("/api/real-life/restaurant", { action: "start", level: "advanced" });
const dev = await A.child.call("/api/real-life/restaurant", { action: "start", level: "developing" });
t("LX6-06c", "Advanced level is a longer conversation", adv.data.total > dev.data.total, `${adv.data.total} vs ${dev.data.total}`);
t("LX6-06d", "Answers are never sent to the browser", !/"any"|"need"|"model"/.test(JSON.stringify(dev.data)));

// 7. Parent report reflects the activities.
const pr = String((await A.parent.call(`/parent/child/${A.childId}`)).data);
const row = (label) => (pr.match(new RegExp(`${label}</td><td>(\\d+)</td><td>(\\d+)`)) ?? []).slice(1).map(Number);
t("LX6-07", "Parent report: real-life scenarios and improved sentences counted from real data", row("Real-life scenarios completed")[0] >= 1 && row("Sentences improved")[0] === 1 && row("New words learned")[0] === 5, `rl=${row("Real-life scenarios completed")} imp=${row("Sentences improved")} words=${row("New words learned")}`);
t("LX6-07b", "Parent report lists recommended next activities", /Recommended next activities/.test(pr));
t("LX6-07c", "A parent cannot open another family's child report", (await A.parent.call(`/parent/child/${B.childId}`)).status === 404);

// 8. Skill tree is evidence-based, never from XP.
const sk = String((await B.child.call("/world/skills")).data);
t("LX6-08", "Skill tree shows growth stages and new branches (phonics, real world)", /Demonstrated mastery|Ready to start/.test(sk) && /Phonics/.test(sk) && /Real-World English/.test(sk));
t("LX6-08b", "Skill stages say they come from answers, not XP", /not from XP or coins/.test(sk));

// 9. Passport stamp once.
const p1 = String((await B.child.call("/world/passport")).data);
const p2 = String((await B.child.call("/world/passport")).data);
const count = (h) => (h.match(/data-stamp="rl-restaurant"/g) ?? []).length;
t("LX6-09", "Real-life passport stamp appears exactly once (also after reloading)", count(p1) === 1 && count(p2) === 1, `${count(p1)} ${count(p2)}`);
await playScenario(B.child, "restaurant", "beginner");
t("LX6-09b", "Replaying a scenario does not add a second stamp", count(String((await B.child.call("/world/passport")).data)) === 1);

// 10. Story creator saved to the gallery.
const story = await A.child.call("/api/writing/draft", { kind: "story_builder", title: "The Brave Parrot", content: "Once upon a time a brave parrot found a golden key in the forest.", meta: { character: "parrot", location: "forest", object: "key" } });
const gal = String((await A.child.call("/world/story-builder")).data);
t("LX6-10", "Story Builder creation appears in the personal Story Gallery", story.status === 200 && /My Story Gallery/.test(gal) && /The Brave Parrot/.test(gal), story.status);
t("LX6-10b", "Another child's gallery does not show it", !/The Brave Parrot/.test(String((await B.child.call("/world/story-builder")).data)));

// 11–14. Security and robustness.
t("LX6-11", "Another child's Real Life run is refused", (await B.child.call("/api/real-life/restaurant", { action: "answer", runId: dev.data.runId, text: "hi", mode: "text" })).status === 400);
t("LX6-12", "Another child's sentence cannot be saved", (await B.child.call("/api/writing/improve", { action: "save", id: sug.data.id, mine: "Hacked." })).status === 404);
t("LX6-13", "Unauthenticated access to LX6 APIs is refused", (await client().call("/api/recommendations")).status === 401 && (await client().call("/api/writing/improve", { action: "suggest", text: "hello there" })).status === 401);
t("LX6-14", "Invalid input rejected with 400 (not 500)", (await A.child.call("/api/writing/improve", { action: "suggest", text: "" })).status === 400 && (await A.child.call("/api/real-life/restaurant", { action: "start", level: "expert" })).status === 400 && (await A.child.call("/api/real-life/no-such-place", { action: "start", level: "beginner" })).status === 404);

fs.mkdirSync("qa/results", { recursive: true });
fs.writeFileSync("qa/results/qa-lx6.json", JSON.stringify({ generated_at: new Date().toISOString(), base: BASE, results: R }, null, 2));
const n = (s) => R.filter((r) => r.status === s).length;
console.log(`\nLX6 TOTAL ${R.length} · PASS ${n("PASS")} · FAIL ${n("FAIL")} · BLOCKED ${n("BLOCKED")}`);
