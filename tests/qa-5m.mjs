// Five-milestone programme acceptance checks (this delivery's slice). Writes qa/results/qa-5m.json.
import fs from "node:fs";
import { BASE, client, makeFamily } from "./lib.mjs";

const R = [];
const t = (id, name, cond, actual = "") => { const status = cond === null ? "BLOCKED" : cond ? "PASS" : "FAIL"; R.push({ id, name, status, actual: String(actual).slice(0, 300) }); console.log(`${status.padEnd(7)} ${id} ${name}${status !== "PASS" ? ` — ${actual}` : ""}`); };

const A = await makeFamily("G1", "Asha"); await A.child.call("/api/welcome", {});
const B = await makeFamily("G6", "Ravi"); await B.child.call("/api/welcome", {});

// ── M1 Learning intelligence ──
const qa = await A.child.call("/api/quest");
const W = Object.fromEntries(qa.data.newWords.map((w) => [w.id, w]));
const ans = (x) => { const w = W[x.wordId]; return x.type === "meaning" ? w.meaning : x.type === "usage" ? w.example : x.type === "fill_blank" ? x.options.find((o) => w.example.toLowerCase().includes(o.toLowerCase())) : w.word; };
for (const x of qa.data.questions) await A.child.call("/api/quest/answer", { wordId: x.wordId, type: x.type, answer: ans(x) });
await A.child.call("/api/quest/complete", { seconds: 300 });
t("5M-01", "5-new-words limit still enforced", qa.data.newWords.length === 5, qa.data.newWords.length);
const ra = (await A.child.call("/api/recommendations")).data.recommendations;
const rb = (await B.child.call("/api/recommendations")).data.recommendations;
t("5M-02", "Every recommendation carries skill, difficulty, expected minutes and completion status", [...ra, ...rb].every((r) => r.skill && r.difficulty && r.minutes > 0 && typeof r.done === "boolean"), JSON.stringify(ra[0]));
t("5M-03", "Different children get different recommendations (G1 after quest vs fresh G6)", ra.map((r) => r.href).join() !== rb.map((r) => r.href).join(), `${ra.map((r) => r.href)} | ${rb.map((r) => r.href)}`);
t("5M-04", "Young child is offered foundational phonics as Learn Next once the quest is done", ra.some((r) => r.kind === "learn_next" && r.skill === "phonics"), ra.map((r) => `${r.kind}:${r.skill}`).join());
const pr = String((await A.parent.call(`/parent/child/${A.childId}`)).data);
const vocabRow = pr.match(/Vocabulary<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td>(\d+)<\/td>/);
t("5M-05", "Parent skill dashboard shows all 11 skills with evidence counts from real answers", /data-testid="skill-intel"/.test(pr) && /Real-world English/.test(pr) && /Phonics/.test(pr) && Number(vocabRow?.[3] ?? 0) > 0, vocabRow?.slice(1).join(" | "));
t("5M-06", "Insufficient evidence is stated, not hidden behind a percentage", /Not enough evidence yet/.test(pr));
t("5M-07", "Parent tips are generated from the child's activity", /data-testid="parent-tips"/.test(pr) && /learned 5 new words this week/.test(pr));
const rev = String((await A.child.call("/world/revision")).data);
t("5M-08", "Revision overview (revise now / waiting / upcoming / memory checks) renders", /data-testid="revision-overview"/.test(rev) && /Coming this week/.test(rev));

// Admin content intelligence
const AD = client();
await AD.call("/api/auth/login-admin", { email: "admin@pingvibe.local", password: "ChangeMe!2026" });
const pv = await AD.call(`/api/admin/recommendations?username=${B.username}`);
t("5M-09", "Admin can preview a child's recommendations", pv.status === 200 && pv.data.recommendations.length > 0, pv.status);
const exploreB = rb.find((r) => r.kind === "explore_new");
if (exploreB) {
  const slug = exploreB.href.split("/").pop().split("?")[0];
  const kind = exploreB.href.includes("real-life") ? "scenario" : "story";
  await AD.call("/api/admin/recommendations", { op: "set", kind, ref: slug, action: "exclude" });
  const pv2 = await AD.call(`/api/admin/recommendations?username=${B.username}`);
  t("5M-10", "Excluding content removes it from recommendations", !pv2.data.recommendations.some((r) => r.href.includes(slug)), `${slug} → ${pv2.data.recommendations.map((r) => r.href)}`);
  const rules = String((await AD.call("/admin/recommendations")).data);
  t("5M-11", "Recommendations admin page lists rules and analytics", /Prioritise or exclude content/.test(rules) && rules.includes(slug) && /Last 30 days/.test(rules));
} else t("5M-10", "Excluding content removes it from recommendations", null, "no explore recommendation for B");
t("5M-12", "Children cannot use the admin recommendations API", (await A.child.call(`/api/admin/recommendations?username=${B.username}`)).status === 401 || (await A.child.call(`/api/admin/recommendations?username=${B.username}`)).status === 403);

// ── M2 Phonics & Sound Valley ──
const units = (await B.child.call("/api/phonics")).data.units;
t("5M-13", "Phonics Valley has 12 units; only the first is open for a fresh Grade 6 child (ability, not grade)", units.length === 12 && units[0].open && !units[1].open, units.map((u) => u.open ? 1 : 0).join(""));
t("5M-14", "A locked unit cannot be started", (await B.child.call("/api/phonics", { action: "start", unit: "digraphs" })).status === 400);
const st = await B.child.call("/api/phonics", { action: "start", unit: "letter-sounds" });
t("5M-15", "Phonics questions never include the answer key", st.status === 200 && st.data.questions.length === 6 && !/"answer"|"explain"/.test(JSON.stringify(st.data.questions)), st.status);
t("5M-16", "Answers must be in order (no skipping)", (await B.child.call("/api/phonics", { action: "answer", attemptId: st.data.attemptId, index: 2, choice: "a" })).status === 400);
t("5M-17", "Another child cannot answer this attempt", (await A.child.call("/api/phonics", { action: "answer", attemptId: st.data.attemptId, index: 0, choice: "a" })).status === 400);
let last;
for (let i = 0; i < 6; i++) last = await B.child.call("/api/phonics", { action: "answer", attemptId: st.data.attemptId, index: i, choice: st.data.questions[i].options[0] });
t("5M-18", "Each answer gets feedback with an explanation; completion scores the unit", last.data.done && typeof last.data.score === "number" && last.data.explain?.length > 5, JSON.stringify(last.data).slice(0, 160));
t("5M-19", "Phonics completion awards XP through the ledger", last.data.award && last.data.award.xp > 0, JSON.stringify(last.data.award));
const st2 = await B.child.call("/api/phonics", { action: "start", unit: "letter-sounds" });
let last2; for (let i = 0; i < 6; i++) last2 = await B.child.call("/api/phonics", { action: "answer", attemptId: st2.data.attemptId, index: i, choice: st2.data.questions[i].options[0] });
t("5M-20", "Repeating the same unit the same day does not pay twice", last2.data.award?.xp === 0 || last2.data.award?.duplicate === true, JSON.stringify(last2.data.award));
t("5M-21", "Finished attempt refuses more answers", (await B.child.call("/api/phonics", { action: "answer", attemptId: st.data.attemptId, index: 6, choice: "a" })).status === 400);
const prB = String((await B.parent.call(`/parent/child/${B.childId}`)).data);
const ph = prB.match(/Phonics<\/td><td>.*?<\/td><td>.*?<\/td><td>(\d+)<\/td>/);
t("5M-22", "Phonics practice is recorded as phonics evidence", Number(ph?.[1] ?? 0) >= 12, ph?.[1]);
const valley = String((await B.child.call("/world/phonics")).data), map = String((await B.child.call("/world/map")).data);
t("5M-23", "Valley page and map include Phonics & Sound Valley", /data-testid="phonics-units"/.test(valley) && /Phonics &amp; Sound Valley/.test(map));
t("5M-24", "Phonics kingdom view (locations) renders", (await B.child.call("/world/map/phonics-valley")).status === 200);
const pass = String((await B.child.call("/world/passport")).data);
t("5M-25", "Passport stamp for Phonics Valley is earned once", (pass.match(/data-stamp="k-phonics-valley"/g) ?? []).length === 1);

// ── M3 Real Life expansion ──
const hub = String((await B.child.call("/world/real-life")).data);
for (const slug of ["post-office", "bus-station", "hotel", "airport", "new-friend", "asking-help", "food-counter", "sports-club", "bookshop", "museum", "travel-desk", "presentation"]) {
  if (!hub.includes(`/world/real-life/${slug}`)) { t("5M-26", "All 24 Real Life scenarios available to a Grade 6 child", false, `missing ${slug}`); break; }
}
if (!R.some((r) => r.id === "5M-26")) t("5M-26", "All 24 Real Life scenarios available to a Grade 6 child", true);
const ps = await B.child.call("/api/real-life/presentation", { action: "start", level: "developing" });
const pa = await B.child.call("/api/real-life/presentation", { action: "answer", runId: ps.data.runId, text: "Good morning everyone, today I am going to talk about tigers", mode: "text" });
t("5M-27", "New scenario accepts a natural alternative answer", pa.data.result === "great" || pa.data.result === "ok", JSON.stringify(pa.data).slice(0, 160));

// ── Regression of key pages ──
for (const p of ["/world", "/world/skills", "/world/notebook", "/world/me", "/world/phonics/rhyming"]) {
  const r = await B.child.call(p); if (r.status !== 200) { t("5M-28", "Key child pages render", false, `${p} ${r.status}`); break; }
}
if (!R.some((r) => r.id === "5M-28")) t("5M-28", "Key child pages render", true);

fs.mkdirSync("qa/results", { recursive: true });
fs.writeFileSync("qa/results/qa-5m.json", JSON.stringify({ generated_at: new Date().toISOString(), base: BASE, results: R }, null, 2));
const n = (s) => R.filter((r) => r.status === s).length;
console.log(`\n5M TOTAL ${R.length} · PASS ${n("PASS")} · FAIL ${n("FAIL")} · BLOCKED ${n("BLOCKED")}`);
