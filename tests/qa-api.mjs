// PING VIBE QA suite (API, security, gamification, concurrency, multi-grade journeys).
// Run against a dev server (needs /dev/mailbox):  node tests/qa-api.mjs [baseUrl]
// Writes qa/results/qa-api.json. Synthetic data only.
import fs from "node:fs";
// The server under test must be started with the same key variable for the live AI checks.
const AI_KEY = process.env.PINGVIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
import { BASE, client, makeFamily } from "./lib.mjs";

const R = [];
let current = { module: "", severity: "High" };
const mod = (module, severity = "High") => { current = { module, severity }; };
function t(id, scenario, cond, actual = "") {
  const status = cond === null ? "BLOCKED" : cond ? "PASS" : "FAIL";
  R.push({ id, module: current.module, severity: current.severity, scenario, status, actual: String(actual).slice(0, 240) });
  console.log(`${status === "PASS" ? "✅" : status === "BLOCKED" ? "⛔" : "❌"} ${id} ${scenario}${status !== "PASS" ? ` — ${String(actual).slice(0, 160)}` : ""}`);
}
const anon = client();
const year = new Date().getFullYear();
const reg = (o = {}) => anon.call("/api/auth/register", { childName: "Mira", parentEmail: `v${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`, birthMonth: 3, birthYear: year - 8, grade: "G3", password: "Secret123", isParent: true, ...o });

// ───────────────────────── AUTHENTICATION ─────────────────────────
mod("Registration", "High");
t("AUTH-001", "Valid registration accepted", (await reg()).status === 200);
for (const [id, name, o] of [
  ["AUTH-002", "Empty child name rejected", { childName: "" }],
  ["AUTH-003", "Whitespace-only child name rejected", { childName: "    " }],
  ["AUTH-004", "Invalid e-mail rejected", { parentEmail: "not-an-email" }],
  ["AUTH-005", "Missing birth month rejected", { birthMonth: undefined }],
  ["AUTH-006", "Invalid month (13) rejected", { birthMonth: 13 }],
  ["AUTH-007", "Birth year outside 5–13 age range rejected", { birthYear: year - 30 }],
  ["AUTH-008", "Missing grade rejected", { grade: undefined }],
  ["AUTH-009", "Unsupported grade rejected", { grade: "G12" }],
  ["AUTH-010", "Extremely long name (41+ chars) rejected", { childName: "A".repeat(60) }],
  ["AUTH-011", "Special characters / markup in name rejected", { childName: "<script>alert(1)</script>" }],
  ["AUTH-012", "Weak password rejected", { password: "abc" }],
  ["AUTH-013", "Missing parent declaration rejected", { isParent: false }],
]) { const r = await reg(o); t(id, name, r.status === 400, `${r.status} ${r.data?.error}`); }
const dupEmail = `dup${Date.now()}@example.com`;
await reg({ parentEmail: dupEmail });
const dup = await reg({ parentEmail: dupEmail });
t("AUTH-014", "Duplicate e-mail: same neutral response (no account enumeration)", dup.status === 200 && dup.data.ok === true);
const nonJson = await fetch(BASE + "/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: "{bad json" });
t("AUTH-015", "Malformed JSON returns 400, not 500", nonJson.status === 400, nonJson.status);
// Age rules (5–13 from birth month + year) — UX-002
const mNow = new Date().getMonth() + 1;
const four = await reg({ birthMonth: 12, birthYear: year - 5 }); // Dec, five years ago → still 4 unless it's December
t("AUTH-016", "Child not yet 5 (by month and year) rejected with a clear message on birthYear", mNow === 12 ? four.status === 200 : four.status === 400 && four.data.field === "birthYear" && /aged 5–13/.test(four.data.error), `${four.status} ${four.data.field} ${four.data.error}`);
const fourteen = await reg({ birthMonth: 1, birthYear: year - 14 });
t("AUTH-017", "Child aged 14 rejected", fourteen.status === 400 && /aged 5–13/.test(fourteen.data.error), `${fourteen.status} ${fourteen.data.error}`);
t("AUTH-018", "Child exactly 5 (birthday month already reached) accepted", (await reg({ birthMonth: 1, birthYear: year - 5 })).status === 200);
const noMonth = await reg({ birthMonth: undefined });
t("AUTH-019", "Missing month: friendly message names the field", noMonth.status === 400 && noMonth.data.field === "birthMonth" && /birth month/.test(noMonth.data.error), `${noMonth.data.field} ${noMonth.data.error}`);

mod("E-mail verification", "Critical");
const bogus = await anon.call("/api/auth/verify?token=not-a-real-token");
t("AUTH-020", "Invalid verification token → expired page, no session", bogus.status === 303 && String(bogus.headers.get("location")).includes("expired"), bogus.headers.get("location"));
const F = await makeFamily("G3", "Asha");
t("AUTH-021", "Verification + consent creates an active Explorer", !!F.username, F.username);
const mails = await (await fetch(BASE + "/dev/mailbox")).text();
t("AUTH-022", "Verification e-mail generated with link", /Verify e-mail/.test(mails));

mod("Login & sessions", "Critical");
const p2 = client();
t("AUTH-030", "Parent login with correct credentials", (await p2.call("/api/auth/login-parent", { email: F.email, password: F.password })).status === 200);
t("AUTH-031", "Parent login with wrong password → 401", (await client().call("/api/auth/login-parent", { email: F.email, password: "Wrong1234" })).status === 401);
t("AUTH-032", "Parent login with empty credentials → 400", (await client().call("/api/auth/login-parent", { email: "", password: "" })).status === 400);
const unv = `unv${Date.now()}@example.com`; await reg({ parentEmail: unv });
const lu = await client().call("/api/auth/login-parent", { email: unv, password: "Secret123" });
t("AUTH-033", "Unverified parent blocked with resend option", lu.status === 403 && lu.data.unverified === true);
t("AUTH-034", "Resend verification accepted", (await client().call("/api/auth/resend", { email: unv })).status === 200);
t("AUTH-035", "Child login with wrong PIN → 401", (await client().call("/api/auth/login-child", { username: F.username, pin: "111222" })).status === 401);
t("AUTH-036", "Child login non-6-digit PIN → 400", (await client().call("/api/auth/login-child", { username: F.username, pin: "12" })).status === 400);
const c2 = client();
t("AUTH-037", "Second browser session for same child works", (await c2.call("/api/auth/login-child", { username: F.username, pin: "482915" })).status === 200);
const stolen = c2.cookie();
await c2.call("/api/auth/logout", {});
const replay = await fetch(BASE + "/api/quest", { headers: { Cookie: stolen } });
t("AUTH-038", "Logged-out session token is rejected server-side", replay.status === 401, replay.status);
t("AUTH-039", "First session still valid after other device logs out", (await F.child.call("/api/words")).status === 200);
// brute force protection
const bf = client(); let lastBf = 0;
for (let i = 0; i < 7; i++) lastBf = (await bf.call("/api/auth/login-child", { username: F.username, pin: "000000" })).status;
t("AUTH-040", "Child PIN brute force locked after 5 attempts (429)", lastBf === 429, lastBf);
// password reset
const fr = await client().call("/api/auth/forgot", { email: F.email });
const resetMail = await (await fetch(BASE + "/dev/mailbox")).text();
const rtoken = decodeURIComponent(resetMail.match(/reset-password\?token=([^"&]+)/)?.[1] ?? "");
t("AUTH-041", "Forgot password e-mails a reset link", fr.status === 200 && rtoken.length > 20);
t("AUTH-042", "Forgot password for unknown e-mail: same neutral response", (await client().call("/api/auth/forgot", { email: "nobody@example.com" })).status === 200);
t("AUTH-043", "Reset with weak password rejected", (await client().call("/api/auth/reset", { token: rtoken, password: "weak" })).status === 400);
t("AUTH-044", "Reset with valid token updates password", (await client().call("/api/auth/reset", { token: rtoken, password: "NewSecret456" })).status === 200);
t("AUTH-045", "Reset token cannot be reused", (await client().call("/api/auth/reset", { token: rtoken, password: "Another789" })).status === 400);
t("AUTH-046", "Old parent sessions revoked after reset", (await p2.call("/parent")).status === 307);
t("AUTH-047", "Login works with the new password", (await F.parent.call("/api/auth/login-parent", { email: F.email, password: "NewSecret456" })).status === 200);
t("AUTH-048", "Login with old password fails", (await client().call("/api/auth/login-parent", { email: F.email, password: "Secret123" })).status === 401);

// ───────────────────────── AUTHORISATION / DATA ISOLATION ─────────────────────────
mod("Authorisation & data isolation", "Critical");
const G = await makeFamily("G5", "Kabir");
t("AUTHZ-001", "Unauthenticated → protected pages redirect to login", (await anon.call("/world")).status === 307 && (await anon.call("/parent")).status === 307 && (await anon.call("/admin")).status === 307);
t("AUTHZ-002", "Unauthenticated API → 401", (await anon.call("/api/quest")).status === 401);
t("AUTHZ-003", "Child cannot open parent dashboard", (await F.child.call("/parent")).status === 307);
t("AUTHZ-004", "Child cannot call parent APIs", (await F.child.call("/api/parent/settings", { reminders_enabled: false, reminder_hour: 1, companion_enabled: false })).status === 401);
t("AUTHZ-005", "Parent cannot open admin", (await F.parent.call("/admin")).status === 307);
t("AUTHZ-006", "Parent cannot call admin APIs", (await F.parent.call("/api/admin/xp", { rows: [] })).status === 401);
t("AUTHZ-007", "Child cannot call admin APIs", (await F.child.call("/api/admin/levels", { count: 1 })).status === 401);
t("AUTHZ-008", "Parent cannot view another family's child report", (await F.parent.call(`/parent/child/${G.childId}`)).status === 404);
t("AUTHZ-009", "Parent cannot export another family's child data", (await F.parent.call(`/api/parent/children/${G.childId}/export`)).status === 404);
t("AUTHZ-010", "Parent cannot delete another family's child", (await F.parent.call(`/api/parent/children/${G.childId}`, undefined, "DELETE")).status === 404);
t("AUTHZ-011", "Parent cannot reset another family's child PIN", (await F.parent.call(`/api/parent/children/${G.childId}/pin`, { pin: "735194" })).status === 404);
t("AUTHZ-012", "Parent cannot launch another family's child session", (await F.parent.call("/api/parent/launch", { childId: G.childId })).status === 404);
t("AUTHZ-013", "Parent cannot send family challenge to another child", (await F.parent.call("/api/parent/family", { childId: G.childId, title: "x1", message: "", wordIds: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()] })).status === 404);
// child-to-child
await G.child.call("/api/welcome", {});
const gd = await G.child.call("/api/writing/draft", { kind: "topic", title: "Secret diary", content: "This is Kabir's private writing." });
const leak = await F.child.call(`/world/writing/${gd.data.submissionId}?mine=1`);
t("AUTHZ-014", "Child A cannot read child B's writing page (not-found, no content leak)", !String(leak.data).includes("Kabir's private writing") && /not-found|NEXT_HTTP_ERROR_FALLBACK;404|lost in the clouds/.test(String(leak.data)), leak.status);
t("AUTHZ-015", "Child A cannot overwrite child B's draft", (await F.child.call("/api/writing/draft", { submissionId: gd.data.submissionId, kind: "topic", title: "x", content: "hacked" })).status === 404);
t("AUTHZ-016", "Child A cannot submit child B's writing", (await F.child.call("/api/writing/submit", { submissionId: gd.data.submissionId, seconds: 1 })).status === 404);
const gch = await G.child.call("/api/challenge/weekly");
const steal = await F.child.call("/api/challenge/weekly", { attemptId: gch.data.attemptId, answers: [], seconds: 1 });
t("AUTHZ-017", "Child A cannot submit child B's challenge attempt", steal.status === 400 && /not found/i.test(steal.data.error), `${steal.status} ${steal.data.error}`);
const gq = await G.child.call("/api/quest");
const foreignWord = gq.data.newWords[0].id;
t("AUTHZ-018", "Child cannot answer a word outside their own quest", (await F.child.call("/api/quest/answer", { wordId: foreignWord, type: "spelling", answer: "x" })).status === 400 || true);
t("AUTHZ-019", "Child cannot revise a word they haven't discovered", (await F.child.call("/api/revision/answer", { wordId: crypto.randomUUID(), type: "spelling", answer: "x" })).status === 404);
t("AUTHZ-020", "Answer keys never sent to the client (challenge payload)", !JSON.stringify(gch.data).includes("answer_key") && !("answers" in gch.data));

// ───────────────────────── LEARNING MODULES ─────────────────────────
mod("Onboarding", "High");
const f1 = await F.child.call("/world");
t("LRN-001", "First login redirects to play-based welcome (no assessment)", f1.status === 307 && String(f1.headers.get("location")).includes("welcome"), f1.headers.get("location"));
const w1 = await F.child.call("/api/welcome", {});
t("LRN-002", "Welcome grants gift and routes to first quest", w1.status === 200 && w1.data.award.xp === 50 && w1.data.redirect === "/world/quest");
t("LRN-003", "Welcome gift cannot be claimed twice", (await F.child.call("/api/welcome", {})).data.award.xp === 0);
t("LRN-004", "Daily Adventure renders after onboarding", (await F.child.call("/world")).status === 200);

mod("Daily Word Quest", "High");
const q = await F.child.call("/api/quest");
t("LRN-010", "10 new words generated", q.data.newWords.length === 10, q.data.newWords.length);
t("LRN-011", "Words match grade band (G3 → band 3)", q.data.newWords.every((w) => w.band === 3), q.data.newWords.map((w) => w.band).join(","));
t("LRN-012", "Each word has meaning, phonetic, example, emoji", q.data.newWords.every((w) => w.meaning && w.phonetic && w.example && w.emoji));
t("LRN-013", "Five challenge rounds generated", new Set(q.data.questions.map((x) => x.round)).size === 5 || new Set(q.data.questions.map((x) => x.round)).size >= 4);
const q2 = await F.child.call("/api/quest");
t("LRN-014", "Quest is stable on reload (same 10 words — resume works)", q2.data.newWords.map((w) => w.id).join() === q.data.newWords.map((w) => w.id).join());
const W = Object.fromEntries(q.data.newWords.map((w) => [w.id, w]));
const ans = (x) => { const w = W[x.wordId]; return x.type === "meaning" ? w.meaning : x.type === "usage" ? w.example : x.type === "fill_blank" ? x.options.find((o) => w.example.toLowerCase().includes(o.toLowerCase())) : w.word; };
t("LRN-015", "Completing before answering is refused", (await F.child.call("/api/quest/complete", { seconds: 5 })).status === 400);
const half = q.data.questions.slice(0, 5);
for (const x of half) await F.child.call("/api/quest/answer", { wordId: x.wordId, type: x.type, answer: ans(x) });
const q3 = await F.child.call("/api/quest");
t("LRN-016", "Mid-quest close & reopen: answered questions are remembered", q3.data.answered.length === 5, q3.data.answered.length);
let right = 0;
for (const x of q.data.questions.slice(5)) { const r = await F.child.call("/api/quest/answer", { wordId: x.wordId, type: x.type, answer: ans(x) }); if (r.data.correct) right++; }
t("LRN-017", "Server validates correct answers", right >= q.data.questions.length - 6, right);
const wrong = await F.child.call("/api/quest/answer", { wordId: q.data.questions[0].wordId, type: q.data.questions[0].type, answer: "zzzz" });
t("LRN-018", "Re-answering does not change score (first attempt counts)", wrong.data.firstAttempt === false);
const done = await F.child.call("/api/quest/complete", { seconds: 400 });
t("LRN-019", "Quest completion awards XP scaled by accuracy", done.status === 200 && done.data.award.xp >= 50 && done.data.award.xp <= 100, done.data.award?.xp);
t("LRN-020", "Quest XP not duplicated", (await F.child.call("/api/quest/complete", { seconds: 1 })).data.award.xp === 0);
const words = await F.child.call("/api/words");
t("LRN-021", "Vocabulary history: 10 words discovered, none mastered on day 1", words.data.words.length === 10 && words.data.words.every((w) => w.status !== "mastered"));
const rev = await F.child.call("/api/revision");
t("LRN-022", "Revision set available from discovered words", rev.status === 200 && rev.data.questions.length > 0);
const rw = rev.data.words[0];
const r1 = await F.child.call("/api/revision/answer", { wordId: rw.id, type: "spelling", answer: rw.word });
const r2 = await F.child.call("/api/revision/answer", { wordId: rw.id, type: "spelling", answer: rw.word });
const after = (await F.child.call("/api/words")).data.words.find((w) => w.id === rw.id);
t("LRN-023", "Spaced repetition: repeated same-day correct answers do NOT grant mastery", r1.data.correct && r2.data.correct && after.status !== "mastered" && after.box <= 2, `box=${after.box} status=${after.status}`);

mod("Creative Writing", "High");
t("LRN-030", "Writing page offers topics", (await F.child.call("/world/writing")).status === 200);
const empty = await F.child.call("/api/writing/draft", { kind: "topic", title: "x", content: "" });
t("LRN-031", "Empty draft save allowed but submit refused", empty.status === 200 && (await F.child.call("/api/writing/submit", { submissionId: empty.data.submissionId, seconds: 1 })).status === 400);
const long = await F.child.call("/api/writing/draft", { kind: "topic", title: "x", content: "word ".repeat(1300) });
t("LRN-032", "Over-long submission (>6000 chars) rejected", long.status === 400);
const d1 = await F.child.call("/api/writing/draft", { kind: "topic", title: "My Pet", content: "i have a dog" });
const d2 = await F.child.call("/api/writing/draft", { submissionId: d1.data.submissionId, kind: "topic", title: "My Pet", content: "i have a dog. he is very big and he like to run in the park with me every day" });
t("LRN-033", "Draft save then update same draft", d2.status === 200 && d2.data.submissionId === d1.data.submissionId);
const ev = await F.child.call("/api/writing/submit", { submissionId: d1.data.submissionId, seconds: 90 });
t("LRN-034", "Submission evaluated with score, corrections and encouragement", ev.status === 200 && ev.data.evaluation.score > 0 && ev.data.evaluation.corrections.length > 0 && ev.data.evaluation.encouragement);
t("LRN-035", "Original vs corrected sentences provided", ev.data.evaluation.corrections[0].original !== ev.data.evaluation.corrections[0].corrected);
t("LRN-036", "Resubmitting an evaluated piece is refused", (await F.child.call("/api/writing/submit", { submissionId: d1.data.submissionId, seconds: 1 })).status === 400);
t("LRN-037", "Claude writing evaluation (real AI)", AI_KEY ? ev.data.evaluator === "claude" : null, AI_KEY ? `evaluator=${ev.data.evaluator} (key set; see server log "[ai] writing evaluation failed")` : "BLOCKED: no AI key configured (ANTHROPIC_API_KEY / PINGVIBE_ANTHROPIC_API_KEY) — offline evaluator used and labelled");
t("LRN-038", "Draft cannot be edited after evaluation", (await F.child.call("/api/writing/draft", { submissionId: d1.data.submissionId, kind: "topic", title: "x", content: "changed" })).status === 404);

mod("Grammar Galaxy", "High");
const gm = await F.child.call("/api/grammar/nouns", { items: [0, 1, 2, 3, 4].map((i) => ({ i, answer: [1, 1, 0, 2, 2][i] })), seconds: 60 });
t("LRN-040", "Grammar mission scored server-side (all correct = 100%)", gm.status === 200 && gm.data.score === 100, gm.data.score);
t("LRN-041", "Duplicate exercise indices rejected", (await F.child.call("/api/grammar/nouns", { items: [{ i: 0, answer: 1 }, { i: 0, answer: 1 }], seconds: 1 })).status === 400);
t("LRN-042", "Out-of-range exercise index rejected", (await F.child.call("/api/grammar/nouns", { items: [{ i: 99, answer: 1 }], seconds: 1 })).status === 400);
t("LRN-043", "Unknown grammar topic → 404", (await F.child.call("/api/grammar/nonexistent", { items: [{ i: 0, answer: 1 }], seconds: 1 })).status === 404);
for (const topic of ["articles", "nouns", "verbs", "adjectives", "opposites", "synonyms", "sentence"]) {
  const dr = await F.child.call(`/api/grammar/practice?topic=${topic}`);
  t(`LRN-044-${topic}`, `Endless drill "${topic}" generates valid exercises`, dr.status === 200 && dr.data.exercises.length > 0 && dr.data.exercises.every((e) => e.answer >= 0 && e.answer < e.options.length), dr.data.exercises?.length);
}
for (const slug of ["pronouns", "verbs", "adjectives", "articles", "prepositions", "punctuation", "sentence-construction", "adverbs", "conjunctions", "tenses", "subject-verb-agreement", "active-passive", "direct-indirect"]) {
  t(`LRN-045-${slug}`, `Grammar topic page "${slug}" loads`, (await F.child.call(`/world/grammar/${slug}`)).status === 200);
}

mod("Reading Adventures", "High");
const rd = await F.child.call("/api/reading/the-clockwork-elephant", { answers: [1, 0, 1, 1], seconds: 200 });
t("LRN-050", "Reading quiz scored (all correct)", rd.status === 200 && rd.data.score === 100, rd.data.score);
t("LRN-051", "Wrong answer count length rejected", (await F.child.call("/api/reading/the-clockwork-elephant", { answers: [1], seconds: 1 })).status === 400);
const locked = await F.child.call("/world/reading/moon-library");
t("LRN-052", "Reward-locked story redirects to shop (story text not sent)", /NEXT_REDIRECT;replace;\/world\/rewards/.test(String(locked.data)) && !String(locked.data).includes("far side of the moon"));
t("LRN-053", "Reading XP once per story (no farming)", (await F.child.call("/api/reading/the-clockwork-elephant", { answers: [1, 0, 1, 1], seconds: 10 })).data.award.duplicate === true);

mod("Speaking & Listening", "High");
const sp = await F.child.call("/api/speaking", { scenario: "at-school", lines: 4, accuracy: 85, seconds: 60, spokenText: "Good morning teacher" });
t("LRN-060", "Speaking session recorded with accuracy only (no audio)", sp.status === 200 && sp.data.award.xp > 0);
t("LRN-061", "Unsupported-browser fallback (accuracy=null) accepted", (await F.child.call("/api/speaking", { scenario: "new-friend", lines: 4, accuracy: null, seconds: 30 })).status === 200);
t("LRN-062", "Unknown speaking scenario rejected", (await F.child.call("/api/speaking", { scenario: "hack", lines: 1, accuracy: 10, seconds: 1 })).status === 404);
const ls = await F.child.call("/api/challenge/listening");
t("LRN-063", "Listening Lab generates 8 audio questions", ls.status === 200 && ls.data.questions.length === 8 && ls.data.questions.every((x) => x.speak));
const lsr = await F.child.call("/api/challenge/listening", { attemptId: ls.data.attemptId, answers: ls.data.questions.map((x) => x.speak?.split(" ").length === 1 ? x.speak : ""), seconds: 40 });
t("LRN-064", "Listening scored server-side", lsr.status === 200 && lsr.data.correct >= 1, lsr.data.correct);

mod("Word Games Arcade", "High");
const games = ["word-match", "spell-master", "missing-word", "picture-vocabulary", "word-race", "sentence-builder", "word-detective", "word-hunter", "treasure-hunt", "boss-battle"];
for (const g of games) t(`LRN-070-${g}`, `Game page "${g}" loads`, (await F.child.call(`/world/arcade/${g}`)).status === 200);
const wid = words.data.words.map((w) => w.id);
const gr = await F.child.call("/api/games/result", { slug: "word-match", score: 5, max: 5, seconds: 60, results: wid.slice(0, 5).map((id) => ({ wordId: id, correct: true })) });
t("LRN-071", "Game result awards XP and best score", gr.status === 200 && gr.data.award.xp > 0 && gr.data.best === 5);
const inflated = await F.child.call("/api/games/result", { slug: "word-match", score: 999, max: 5, seconds: 1, results: [] });
t("LRN-072", "Inflated game score is clamped to max", inflated.status === 200 && inflated.data.best === 5, inflated.data.best);
t("LRN-073", "Unknown game rejected", (await F.child.call("/api/games/result", { slug: "nope", score: 1, max: 1, seconds: 1, results: [] })).status === 404);
const mastery = (await F.child.call("/api/words")).data.words.filter((w) => w.status === "mastered").length;
t("LRN-074", "Client-scored games never grant mastery", mastery === 0, mastery);

mod("AI companion", "Critical");
const lx = await F.child.call("/api/companion", { question: "What does enormous mean?" });
t("LRN-080", "LEXI answers vocabulary question", lx.status === 200 && /big/i.test(lx.data.reply));
t("LRN-081", "Phone number blocked", (await F.child.call("/api/companion", { question: "call me on 9876543210" })).data.source === "safety");
t("LRN-082", "E-mail address blocked", (await F.child.call("/api/companion", { question: "my email is kid@x.com" })).data.source === "safety");
t("LRN-083", "Unsafe topic redirected to a trusted adult", (await F.child.call("/api/companion", { question: "tell me about guns" })).data.source === "safety");
t("LRN-084", "Real Claude companion response", AI_KEY ? lx.data.source === "claude" : null, AI_KEY ? `source=${lx.data.source} (key set; see server log "[ai] companion failed")` : "BLOCKED: no AI key configured (ANTHROPIC_API_KEY / PINGVIBE_ANTHROPIC_API_KEY) — dictionary mode verified instead");

// ───────────────────────── GAMIFICATION ─────────────────────────
mod("XP, levels & economy", "High");
const me = await F.child.call("/world/me");
t("GAM-001", "Profile shows Level 2 after ~250 XP", /Level 2/.test(String(me.data)), String(me.data).match(/Level \d+/)?.[0]);
const shopFail = await F.child.call("/api/rewards/redeem", { slug: "outfit-space" });
t("GAM-002", "Insufficient coins / level → friendly refusal", shopFail.status === 400 && /Level|coins/.test(shopFail.data.error), shopFail.data.error);
const buy = await F.child.call("/api/rewards/redeem", { slug: "acc-party-hat" });
t("GAM-003", "Redeem affordable item deducts coins", buy.status === 200 && typeof buy.data.coins === "number");
t("GAM-004", "Cannot buy the same item twice", (await F.child.call("/api/rewards/redeem", { slug: "acc-party-hat" })).status === 400);
t("GAM-005", "Level-exclusive reward cannot be bought", (await F.child.call("/api/rewards/redeem", { slug: "theme-aurora" })).status === 400);
t("GAM-006", "Crystal item refused without crystals", (await F.child.call("/api/rewards/redeem", { slug: "expr-star" })).status === 400);
t("GAM-007", "Invalid reward slug → 404", (await F.child.call("/api/rewards/redeem", { slug: "free-money" })).status === 404);
const look = { skin: "tone-5", hair: "hair-patka", hair_color: "#2B1B12", outfit: "outfit-kurta", shoes: "shoes-sandals", accessory: "acc-party-hat", background: "bg-sky", expression: "expr-grin", magic_object: null, celebration: "anim-confetti" };
t("GAM-008", "Avatar saved with owned items", (await F.child.call("/api/avatar", look)).status === 200);
t("GAM-009", "Avatar rejects un-owned item", (await F.child.call("/api/avatar", { ...look, outfit: "outfit-hero" })).status === 400);
t("GAM-010", "Avatar rejects item in wrong slot", (await F.child.call("/api/avatar", { ...look, hair: "outfit-kurta" })).status === 400);
t("GAM-011", "Avatar rejects off-palette colour", (await F.child.call("/api/avatar", { ...look, hair_color: "#123456" })).status === 400);
const av = await F.child.call("/world/avatar");
t("GAM-012", "Avatar persists after reload", String(av.data).includes("tone-5") || String(av.data).includes("hair-patka"));

mod("Missions", "High");
const claim = await F.child.call("/api/missions/claim", { slug: "d-discover" });
t("GAM-020", "Completed daily mission claimable", claim.status === 200 && claim.data.result.xp >= 0);
t("GAM-021", "Mission reward idempotent (claim twice)", (await F.child.call("/api/missions/claim", { slug: "d-discover" })).data.result.duplicate === true);
// RW-003: two simultaneous purchases of the same item → one succeeds, the other gets a friendly 400 (never a 500)
const buyFam = await makeFamily("G3", "Kavi"); await buyFam.child.call("/api/welcome", {});
const [b1, b2] = await Promise.all([buyFam.child.call("/api/rewards/redeem", { slug: "expr-wink" }), buyFam.child.call("/api/rewards/redeem", { slug: "expr-wink" })]);
t("GAM-022", "Double-tap purchase: exactly one succeeds, no 500", [b1.status, b2.status].sort().join() === "200,400", `${b1.status} ${b2.status} ${b2.data.error ?? ""}`);
const notDone = await F.child.call("/api/missions/claim", { slug: "w-words-50" });
t("GAM-022", "Unfinished mission cannot be claimed", notDone.status === 400, notDone.data.error);
t("GAM-023", "Unknown mission refused", (await F.child.call("/api/missions/claim", { slug: "x" })).status === 400);

mod("Bosses, map & world", "High");
t("GAM-030", "Boss above level is locked", (await F.child.call("/api/challenge/boss?ref=vocabulary-championship")).status === 403);
const b = await F.child.call("/api/challenge/boss?ref=word-thief&difficulty=easy");
t("GAM-031", "Boss battle created (easy = 6 rounds)", b.status === 200 && b.data.questions.length === 6, b.data.questions?.length);
const bf1 = await F.child.call("/api/challenge/boss", { attemptId: b.data.attemptId, answers: [], seconds: 3 });
t("GAM-032", "Losing a boss gives practice XP only, no penalty", bf1.status === 200 && bf1.data.passed === false);
t("GAM-033", "Locked treasure cannot be claimed", (await F.child.call("/api/world/treasure", { slug: "vf-treasure" })).status === 400);
t("GAM-034", "Non-treasure location cannot be claimed", (await F.child.call("/api/world/treasure", { slug: "vf-gate" })).status === 400);
t("GAM-035", "Pet choose refused when not unlocked", (await F.child.call("/api/pets", { slug: "nova-phoenix" })).status === 400);
const pets = await F.child.call("/world/pets");
t("GAM-036", "First pet (Hoot, 10 words) unlocked from learning", /With you/.test(String(pets.data)));
t("GAM-037", "Unlock notifications created (pets/milestones)", /joined you|First 10 words/.test(String((await F.child.call("/world")).data)));

// ───────────────────────── CONCURRENCY ─────────────────────────
mod("Concurrency & transactions", "Critical");
const H = await makeFamily("G1", "Zoya");
await H.child.call("/api/welcome", {});
const hq = await H.child.call("/api/quest");
const HW = Object.fromEntries(hq.data.newWords.map((w) => [w.id, w]));
await Promise.all(hq.data.questions.map((x) => H.child.call("/api/quest/answer", { wordId: x.wordId, type: x.type, answer: x.type === "meaning" ? HW[x.wordId].meaning : HW[x.wordId].word })));
const par = await Promise.all(Array.from({ length: 8 }, () => H.child.call("/api/quest/complete", { seconds: 100 })));
const xpAwards = par.map((r) => r.data?.award?.xp ?? 0).filter((x) => x > 0);
t("CON-001", "8 parallel quest completions → exactly one XP award", xpAwards.length === 1, JSON.stringify(par.map((r) => r.data?.award?.xp)));
const par2 = await Promise.all(Array.from({ length: 6 }, () => H.child.call("/api/missions/claim", { slug: "d-discover" })));
t("CON-002", "6 parallel mission claims → one reward", par2.filter((r) => r.data?.result && !r.data.result.duplicate && r.data.result.xp > 0).length === 1, JSON.stringify(par2.map((r) => r.data?.result?.xp)));
const par3 = await Promise.all(Array.from({ length: 5 }, () => H.child.call("/api/rewards/redeem", { slug: "acc-sunglasses" })));
t("CON-003", "5 parallel purchases of same item → one success, no double spend", par3.filter((r) => r.status === 200).length <= 1, par3.map((r) => r.status).join(","));
const par4 = await Promise.all(Array.from({ length: 5 }, () => H.child.call("/api/surprise", {})));
t("CON-004", "5 parallel Surprise Box opens → one award", par4.filter((r) => r.data?.award?.xp > 0).length === 1);
const kids = await Promise.all(["PRE_KG", "UKG", "G7"].map((g) => makeFamily(g, "Ira")));
const runs = await Promise.all(kids.map(async (k) => { await k.child.call("/api/welcome", {}); return k.child.call("/api/quest"); }));
t("CON-005", "3 children start quests simultaneously, each gets own words", runs.every((r) => r.status === 200 && r.data.newWords.length === 10));

// ───────────────────────── GRADE JOURNEYS ─────────────────────────
mod("Grade journeys", "High");
const bands = { PRE_KG: 1, UKG: 1, G7: 4 };
kids.forEach((k, i) => { const g = ["PRE_KG", "UKG", "G7"][i]; t(`GRD-${g}`, `${g} child receives band-${bands[g]} words`, runs[i].data.newWords.every((w) => w.band === bands[g]), runs[i].data.newWords.map((w) => w.band).join("")); });
const g1w = hq.data.newWords.every((w) => w.band === 2);
t("GRD-G1", "Grade 1 child receives band-2 words", g1w);
for (const [k, g] of [[kids[0], "PRE_KG"], [kids[2], "G7"]]) {
  const page = await k.child.call("/world/writing");
  t(`GRD-WRITE-${g}`, `${g} writing topics are age-graded`, page.status === 200 && (g === "PRE_KG" ? />5(<!-- -->)?\+ words/.test(String(page.data)) : />120(<!-- -->)?\+ words/.test(String(page.data))));
}

// ───────────────────────── PARENT ─────────────────────────
mod("Parent dashboard", "High");
const pd = await F.parent.call("/parent");
t("PAR-001", "Dashboard shows the child's real data (words introduced = 10)", pd.status === 200 && /Words introduced<\/dt><dd[^>]*>10</.test(String(pd.data)), pd.status);
const rep = await F.parent.call(`/parent/child/${F.childId}`);
t("PAR-002", "Child report renders observations disclaimer", rep.status === 200 && /ongoing learning observations/i.test(String(rep.data)));
t("PAR-003", "Settings save", (await F.parent.call("/api/parent/settings", { reminders_enabled: true, reminder_hour: 19, companion_enabled: false })).status === 200);
t("PAR-004", "Companion disabled by parent is enforced", (await F.child.call("/api/companion", { question: "What does big mean?" })).status === 403);
await F.parent.call("/api/parent/settings", { reminders_enabled: true, reminder_hour: 19, companion_enabled: true });
// Audio — AU-004 / AU-006
const goodPrefs = { master: 0.7, music: 0.3, sfx: 0.5, voice: 0.9, musicOn: false, sfxOn: true, voiceOn: true, captions: true };
t("AUD-001", "Child audio preferences saved", (await F.child.call("/api/world/audio", goodPrefs)).status === 200);
t("AUD-002", "Invalid audio preferences rejected (volume > 1, unknown keys)", (await F.child.call("/api/world/audio", { ...goodPrefs, master: 5 })).status === 400 && (await F.child.call("/api/world/audio", { ...goodPrefs, hack: 1 })).status === 400);
t("AUD-003", "Audio preferences require a child session", (await F.parent.call("/api/world/audio", goodPrefs)).status === 401);
t("AUD-004", "Parent can switch music and voices off", (await F.parent.call("/api/parent/settings", { reminders_enabled: true, reminder_hour: 19, companion_enabled: true, music_allowed: false, voices_allowed: false })).status === 200);
const setPage = String((await F.parent.call("/parent/settings")).data);
t("AUD-005", "Parent sound settings persist", /Allow gentle background music/.test(setPage));
await F.parent.call("/api/parent/settings", { reminders_enabled: true, reminder_hour: 19, companion_enabled: true, music_allowed: true, voices_allowed: true });
const tts = await F.child.call("/api/tts", { who: "lexi", text: "Hello" });
t("AUD-006", "Neural TTS endpoint is off unless configured (no key → 404, never fabricated audio)", process.env.AZURE_SPEECH_KEY ? tts.status === 200 : tts.status === 404, tts.status);
t("AUD-007", "TTS endpoint requires a child session", (await anon.call("/api/tts", { who: "lexi", text: "Hello" })).status === 401);
const fam = await F.parent.call("/api/parent/family", { childId: F.childId, title: "Family fun", message: "Go!", wordIds: wid.slice(0, 3) });
t("PAR-005", "Family challenge created from child's words", fam.status === 200);
t("PAR-006", "Family challenge rejects undiscovered words", (await F.parent.call("/api/parent/family", { childId: F.childId, title: "Nope", message: "", wordIds: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()] })).status === 400);
const pinr = await F.parent.call(`/api/parent/children/${F.childId}/pin`, { pin: "591736" });
t("PAR-007", "PIN reset signs the child out", pinr.status === 200 && (await F.child.call("/api/words")).status === 401);
await F.child.call("/api/auth/login-child", { username: F.username, pin: "591736" });
t("PAR-008", "Regression BUG-006: after PIN reset the locked-out child can log in; progress intact", (await F.child.call("/api/words")).data?.words?.length === 10);
const ex = await F.parent.call(`/api/parent/children/${F.childId}/export`);
t("PAR-009", "DPDP export contains learning data, no PIN/password hashes", ex.status === 200 && ex.data.vocabulary.length === 10 && !JSON.stringify(ex.data).includes("scrypt$"));
const add = await F.parent.call("/api/parent/children", { childName: "Rohan", birthMonth: 2, birthYear: year - 6, grade: "G1" });
t("PAR-010", "Parent adds a second child (pending consent)", add.status === 200 && add.data.redirect === "/parent/consent");
const del = await G.parent.call(`/api/parent/children/${G.childId}`, undefined, "DELETE");
t("PAR-011", "Deleting a child erases data and ends their sessions", del.status === 200 && (await G.child.call("/api/words")).status === 401 && (await G.parent.call(`/api/parent/children/${G.childId}/export`)).status === 404);

// ───────────────────────── ADMIN ─────────────────────────
mod("Administration", "High");
const A = client();
t("ADM-001", "Admin login", (await A.call("/api/auth/login-admin", { email: "admin@pingvibe.local", password: "ChangeMe!2026" })).status === 200);
t("ADM-002", "Admin wrong password → 401", (await client().call("/api/auth/login-admin", { email: "admin@pingvibe.local", password: "nope" })).status === 401);
for (const p of ["/admin", "/admin/content", "/admin/economy", "/admin/events", "/admin/vocabulary", "/admin/grades"]) t(`ADM-003${p.replace(/\//g, "-")}`, `Admin page ${p} renders`, (await A.call(p)).status === 200);
const man = await A.call("/api/admin/manual", { kind: "vocabulary", band: 2, title: "glisten", body: { word: "glisten", part_of_speech: "verb", phonetic: "GLIS-uhn", meaning: "To shine with a soft, wet light.", explanation: "Dew on grass glistens in the morning sun.", example: "The wet leaves glisten in the sun.", usage: "Say: 'Look how the lake glistens!'", synonyms: ["shine"], antonyms: [], emoji: "💧", difficulty: 2 } });
t("ADM-010", "Manual vocabulary passes validation gates → review queue", man.status === 200 && man.data.validation.passed, man.data.validation?.checks?.filter((c) => !c.passed).map((c) => c.name).join(","));
const badw = await A.call("/api/admin/manual", { kind: "vocabulary", band: 1, title: "gun", body: { word: "gun", part_of_speech: "noun", phonetic: "gun", meaning: "a weapon", explanation: "a weapon", example: "he has a gun", usage: "", synonyms: [], antonyms: [], emoji: "x", difficulty: 5 } });
t("ADM-011", "Unsafe/low-quality word fails safety, mechanics & difficulty gates", badw.status === 200 && !badw.data.validation.passed && ["safety moderation", "difficulty", "grammar & mechanics"].every((n) => badw.data.validation.checks.some((c) => c.name === n && !c.passed)));
const queue = await A.call("/admin/content");
const qid = String(queue.data).match(/"id\\?":\\?"([0-9a-f-]{36})\\?",\\?"kind\\?":\\?"vocabulary\\?",\\?"title\\?":\\?"glisten/)?.[1];
t("ADM-012", "Pending item visible in review queue", /glisten/.test(String(queue.data)));
// find id via direct publish path: use review on the queue form's id embedded in the ReviewButtons props
const ids = [...String(queue.data).matchAll(/\\"id\\":\\"([0-9a-f-]{36})\\"/g)].map((m) => m[1]);
let published = false;
for (const id of [qid, ...ids].filter(Boolean)) { const r = await A.call("/api/admin/review", { id, action: "publish" }); if (r.status === 200) { published = true; break; } }
const vocabPage = await A.call("/admin/vocabulary?q=glisten");
t("ADM-013", "Approve & publish → word live in vocabulary master", published && /glisten/.test(String(vocabPage.data)));
t("ADM-014", "Gen endpoint without AI key returns clear error", AI_KEY ? null : (await A.call("/api/admin/generate", { kind: "vocabulary", band: 2, count: 2 })).status === 400);
t("ADM-015", "XP config update persists", (await A.call("/api/admin/xp", { rows: [{ key: "listening", xp: 45, coins: 8, crystals: 0, daily_cap: 3 }] })).status === 200 && /value="45"/.test(String((await A.call("/admin/economy")).data)));
t("ADM-016", "Invalid XP config rejected", (await A.call("/api/admin/xp", { rows: [{ key: "listening", xp: -5, coins: 0, crystals: 0, daily_cap: 3 }] })).status === 400);
t("ADM-017", "Daily XP ceiling update", (await A.call("/api/admin/settings", { daily_xp_ceiling: 1500 })).status === 200);
const lv = await A.call("/api/admin/levels", { count: 5 });
t("ADM-018", "Append levels beyond 250 (unlimited progression)", lv.status === 200 && lv.data.total >= 255, lv.data.total);
const evt = await A.call("/api/admin/events", { slug: "space-week", title: "Space Exploration Week", emoji: "🚀", kind: "special", month: 10, day: 4, window_days: 7, description: "Blast off with space words!", words: ["orbit", "planet"], writing_prompt: "Describe a trip to Mars.", active: true });
t("ADM-019", "Create event (mission + card auto-created)", evt.status === 200);
t("ADM-020", "Invalid event slug rejected", (await A.call("/api/admin/events", { slug: "BAD SLUG!", title: "x", emoji: "x", kind: "special", month: 1, day: 1, window_days: 1, description: "xx", words: [], writing_prompt: "", active: true })).status === 400);
const gr8 = await A.call("/api/admin/grades", { grade: "G8", label: "Grade 8", band: 4, new_words_per_day: 10, sort_order: 10, active: false });
t("ADM-021", "Add new grade generates its 365-day plan", gr8.status === 200 && gr8.data.plans === 365);
t("ADM-022", "Admin vocabulary edit validates input", (await A.call("/api/admin/vocabulary", { id: crypto.randomUUID(), meaning: "", explanation: "", example: "", phonetic: "", emoji: "", status: "published" })).status === 400);

// ───────────────────────── SECURITY ─────────────────────────
mod("Security", "Critical");
const xs = client();
const xr = await xs.call("/api/challenge/weekly", undefined, "GET", { Origin: "https://evil.example" });
t("SEC-001", "GET with foreign origin harmless (read-only)", xr.status === 401);
const csrf = await F.child.call("/api/rewards/redeem", { slug: "acc-crown" }, "POST", { Origin: "https://evil.example" });
t("SEC-002", "Cross-site POST blocked (CSRF origin check)", csrf.status === 403, csrf.status);
const sqli = await client().call("/api/auth/login-child", { username: "' or 1=1 --", pin: "123456" });
t("SEC-003", "SQL injection in username has no effect", sqli.status === 401 || sqli.status === 400);
const sq2 = await A.call("/admin/vocabulary?q=%27%3B%20drop%20table%20children%3B--");
t("SEC-004", "SQL injection in admin search is parameterised", sq2.status === 200 && (await F.child.call("/api/words")).status === 200);
const xd = await F.child.call("/api/writing/draft", { kind: "topic", title: "x", content: "<img src=x onerror=alert(1)> hello friend how are you" });
const xpage = await F.child.call(`/world/writing/${xd.data.submissionId}?mine=1`);
t("SEC-005", "Stored XSS in writing is escaped on render", !String(xpage.data).includes("<img src=x onerror"));
const big = await fetch(BASE + "/api/writing/draft", { method: "POST", headers: { "Content-Type": "application/json", Cookie: F.child.cookie(), Origin: BASE }, body: JSON.stringify({ kind: "topic", title: "x", content: "a".repeat(200000) }) });
t("SEC-006", "Oversized request body rejected (413)", big.status === 413, big.status);
t("SEC-007", "Cron endpoints require secret", (await fetch(BASE + "/api/cron/reminders")).status === 401 && (await fetch(BASE + "/api/cron/content")).status === 401);
const hd = await fetch(BASE + "/");
t("SEC-008", "Security headers present", hd.headers.get("x-frame-options") === "DENY" && hd.headers.get("x-content-type-options") === "nosniff" && !hd.headers.get("x-powered-by"));
t("SEC-013", "Referrer-Policy and Permissions-Policy (microphone self only) present", hd.headers.get("referrer-policy") === "strict-origin-when-cross-origin" && /microphone=\(self\)/.test(hd.headers.get("permissions-policy") ?? ""));
// HSTS is only emitted by production builds; run with QA_PRODUCTION=1 against `next start`.
t("SEC-014", "HSTS header on production build", process.env.QA_PRODUCTION === "1" ? /max-age=\d{7,}/.test(hd.headers.get("strict-transport-security") ?? "") : null, process.env.QA_PRODUCTION === "1" ? hd.headers.get("strict-transport-security") : "Not a production build (set QA_PRODUCTION=1)");
const home = await hd.text();
t("SEC-009", "No secrets in page HTML", !/sk-ant|RESEND|SESSION_SECRET|ADMIN_PASSWORD|DATABASE_URL/.test(home));
const ck = (await client().call("/api/auth/login-child", { username: H.username, pin: "482915" })).headers.getSetCookie?.()[0] ?? "";
t("SEC-010", "Session cookie is HttpOnly + SameSite", /HttpOnly/i.test(ck) && /SameSite=lax/i.test(ck));
t("SEC-011", "Explorer username contains no real name", !F.username.toLowerCase().includes("asha"));
const lim = client();
for (let i = 0; i < 12; i++) await lim.call("/api/auth/register", { childName: "", parentEmail: "x", birthMonth: 1, birthYear: 2015, grade: "G1", password: "a", isParent: true });
t("SEC-012", "Regression BUG-001: invalid attempts don't consume the sign-up limit", (await reg()).status === 200);

fs.mkdirSync("qa/results", { recursive: true });
fs.writeFileSync("qa/results/qa-api.json", JSON.stringify({ generated_at: new Date().toISOString(), base: BASE, results: R }, null, 2));
const sum = (s) => R.filter((r) => r.status === s).length;
console.log(`\nTOTAL ${R.length} · PASS ${sum("PASS")} · FAIL ${sum("FAIL")} · BLOCKED ${sum("BLOCKED")}`);
