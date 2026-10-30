// End-to-end API journey against a running dev server: node tests/e2e-api.mjs [baseUrl]
const BASE = process.argv[2] ?? "http://localhost:3000";
const jar = new Map();
const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
async function call(path, body, method) {
  const res = await fetch(BASE + path, {
    method: method ?? (body ? "POST" : "GET"), redirect: "manual",
    headers: { "Content-Type": "application/json", Cookie: cookie(), Origin: BASE },
    body: body ? JSON.stringify(body) : undefined,
  });
  for (const c of res.headers.getSetCookie?.() ?? []) { const [kv] = c.split(";"); const [k, v] = kv.split("="); if (v) jar.set(k, v); else jar.delete(k); }
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
}
const ok = (cond, msg) => { if (!cond) { console.error("❌", msg); process.exitCode = 1; } else console.log("✅", msg); };
const email = `parent${Date.now()}@example.com`;

const r1 = await call("/api/auth/register", { childName: "Aarav", parentEmail: email, birthMonth: 5, birthYear: 2017, grade: "G3", password: "secret123", isParent: true });
ok(r1.status === 200, `register ${r1.status} ${JSON.stringify(r1.data)}`);
const bad = await call("/api/auth/register", { childName: "", parentEmail: "x", birthMonth: 5, birthYear: 2017, grade: "G3", password: "a", isParent: true });
ok(bad.status === 400, `invalid registration rejected: ${bad.data.error}`);
const lp0 = await call("/api/auth/login-parent", { email, password: "secret123" });
ok(lp0.status === 403, "unverified parent cannot log in");
const mail = await (await fetch(BASE + "/dev/mailbox")).text();
const token = decodeURIComponent(mail.match(/token=([^"&]+)/)?.[1] ?? "");
ok(token.length > 20, "verification mail found");
const v = await call(`/api/auth/verify?token=${encodeURIComponent(token)}`);
ok(v.status === 307 || v.status === 303 || v.status === 200, `verify -> ${v.status} ${v.headers.get("location")}`);
const children = await call("/parent/consent");
const childId = String(children.data).match(/data-child-id="([0-9a-f-]{36})"/)?.[1];
ok(!!childId, "pending child visible on consent page");
const weak = await call("/api/parent/consent", { childId, pin: "123456", consents: { learning_data: true, ai_feedback: true, speech_in_browser: true } });
ok(weak.status === 400, "weak PIN rejected");
const c = await call("/api/parent/consent", { childId, pin: "482915", consents: { learning_data: true, ai_feedback: true, speech_in_browser: true } });
ok(c.status === 200 && c.data.username, `consent + PIN -> username ${c.data.username}`);
const username = c.data.username;
await call("/api/auth/logout", {});
const wrong = await call("/api/auth/login-child", { username, pin: "000111" });
ok(wrong.status === 401, "wrong PIN rejected");
const lc = await call("/api/auth/login-child", { username, pin: "482915" });
ok(lc.status === 200, "child login");
const world = await call("/world");
ok(world.status === 307 && String(world.headers.get("location")).includes("welcome"), "first login goes to character welcome (no assessment)");
const welcome = await call("/world/welcome");
ok(welcome.status === 200, "welcome onboarding renders");
const wel = await call("/api/welcome", {});
ok(wel.status === 200 && wel.data.redirect === "/world/quest" && wel.data.award.xp > 0, `welcome gift +${wel.data.award?.xp}XP → first adventure`);
const quest = await call("/api/quest");
ok(quest.status === 200 && quest.data.newWords.length === 10, `quest has ${quest.data.newWords?.length} new words, ${quest.data.questions?.length} questions`);
const words = Object.fromEntries(quest.data.newWords.map((w) => [w.id, w]));
let correct = 0;
for (const q of quest.data.questions) {
  const w = words[q.wordId];
  const answer = q.type === "meaning" ? w.meaning : q.type === "usage" ? w.example : q.type === "fill_blank" ? q.options.find((o) => q.sentence && w.example.toLowerCase().includes(o.toLowerCase())) ?? w.word : w.word;
  const a = await call("/api/quest/answer", { wordId: q.wordId, type: q.type, answer });
  if (a.data.correct) correct++;
}
ok(correct >= quest.data.questions.length - 1, `answered ${correct}/${quest.data.questions.length} correctly`);
const dup = await call("/api/quest/answer", { wordId: quest.data.questions[0].wordId, type: quest.data.questions[0].type, answer: "zzz" });
ok(dup.data.firstAttempt === false, "only first attempt counts");
const done = await call("/api/quest/complete", { seconds: 300 });
ok(done.status === 200 && done.data.award.xp > 0, `quest complete: accuracy ${done.data.accuracy}% +${done.data.award.xp}XP level=${JSON.stringify(done.data.award.levelUp?.id)} unlocks=${done.data.award.unlocks.length}`);
const again = await call("/api/quest/complete", { seconds: 10 });
ok(again.data.award.xp === 0, "quest XP not awarded twice");
const sur = await call("/api/surprise", {});
ok(sur.status === 200 && sur.data.award.xp > 0, "surprise box opens after quest");
const home = await call("/world");
ok(home.status === 200 && String(home.data).includes("adventure"), `daily adventure renders (${home.status})`);
const ch = await call("/api/challenge/weekly");
ok(ch.status === 200 && ch.data.questions.length >= 8, `weekly challenge ${ch.data.questions?.length} questions`);
const sub = await call("/api/challenge/weekly", { attemptId: ch.data.attemptId, answers: ch.data.questions.map(() => "x"), seconds: 30 });
ok(sub.status === 200 && typeof sub.data.score === "number", `weekly scored ${sub.data.score}%`);
const resub = await call("/api/challenge/weekly", { attemptId: ch.data.attemptId, answers: [], seconds: 1 });
ok(resub.status === 400, "challenge cannot be resubmitted");
const boss = await call("/api/challenge/boss?ref=word-thief&difficulty=easy");
ok(boss.status === 200, `boss battle created (${boss.data.questions?.length} q)`);
const bossOk = await call("/api/challenge/boss", { attemptId: boss.data.attemptId, answers: boss.data.questions.map(() => ""), seconds: 20 });
ok(bossOk.status === 200 && bossOk.data.passed === false, "failed boss keeps progress (no penalty)");
const claim = await call("/api/missions/claim", { slug: "d-discover" });
ok(claim.status === 200 && claim.data.result.xp >= 0, `daily mission claimed: ${JSON.stringify(claim.data.result?.xp)} XP`);
const claim2 = await call("/api/missions/claim", { slug: "d-discover" });
ok(claim2.status === 200 && claim2.data.result.duplicate, "mission reward is idempotent");
const draft = await call("/api/writing/draft", { kind: "topic", title: "My Pet", content: "i have a dog. he is very big and he like to run in the park" });
const ev = await call("/api/writing/submit", { submissionId: draft.data.submissionId, seconds: 120 });
ok(ev.status === 200 && ev.data.evaluation.score > 0, `writing evaluated by ${ev.data.evaluator}: ${ev.data.evaluation?.score}`);
const shop = await call("/api/rewards/redeem", { slug: "acc-party-hat" });
ok(shop.status === 200 || shop.status === 400, `shop: ${shop.data.error ?? "bought"}`);
const av = await call("/api/avatar", { skin: "tone-4", hair: "hair-patka", hair_color: "#2B1B12", outfit: "outfit-kurta", shoes: "shoes-sandals", accessory: null, background: "bg-sky", expression: "expr-grin", magic_object: null, celebration: "anim-confetti" });
ok(av.status === 200, "avatar saved with starter items");
const avBad = await call("/api/avatar", { skin: "tone-4", hair: "hair-star", hair_color: "#2B1B12", outfit: "outfit-kurta", shoes: "shoes-sandals", accessory: null, background: "bg-sky", expression: "expr-grin", magic_object: null, celebration: "anim-confetti" });
ok(avBad.status === 400, "cannot wear locked items");
const comp = await call("/api/companion", { question: "What does enormous mean?" });
ok(comp.status === 200 && comp.data.reply.toLowerCase().includes("big"), `companion (${comp.data.source}): ${String(comp.data.reply).slice(0, 60)}…`);
const pii = await call("/api/companion", { question: "my phone is 9876543210" });
ok(pii.data.source === "safety", "companion blocks personal info");
for (const p of ["/world/map", "/world/my-world", "/world/missions", "/world/skills", "/world/calendar", "/world/museum", "/world/collection", "/world/pets", "/world/avatar", "/world/rewards", "/world/notebook", "/world/arcade", "/world/arcade/word-match", "/world/grammar", "/world/grammar/nouns", "/world/reading", "/world/reading/pip-the-little-star", "/world/writing", "/world/story-builder", "/world/speaking", "/world/listening", "/world/revision", "/world/companion", "/world/me", "/world/welcome", "/world/boss/word-thief", "/world/challenge/monthly", "/world/map/vocabulary-forest"]) {
  const r = await call(p);
  ok(r.status === 200, `page ${p} -> ${r.status}`);
}

// parent views
await call("/api/auth/logout", {});
const lp = await call("/api/auth/login-parent", { email, password: "secret123" });
ok(lp.status === 200, "parent login after verification");
for (const p of ["/parent", `/parent/child/${childId}`, "/parent/settings"]) { const r = await call(p); ok(r.status === 200 && !String(r.data).includes("Application error"), `parent page ${p} -> ${r.status}`); }
const exp = await call(`/api/parent/children/${childId}/export`);
ok(exp.status === 200 && exp.data.child?.username === username, "DPDP data export works");
const fam = await call("/api/parent/family", { childId, title: "Family fun", message: "You can do it!", wordIds: quest.data.newWords.slice(0, 3).map((w) => w.id) });
ok(fam.status === 200, "parent can create a family challenge");
// admin
await call("/api/auth/logout", {});
const la = await call("/api/auth/login-admin", { email: "admin@pingvibe.local", password: "ChangeMe!2026" });
ok(la.status === 200, "admin login");
for (const p of ["/admin", "/admin/content", "/admin/economy", "/admin/events", "/admin/vocabulary", "/admin/grades"]) { const r = await call(p); ok(r.status === 200, `admin page ${p} -> ${r.status}`); }
const man = await call("/api/admin/manual", { kind: "vocabulary", band: 2, title: "glisten", body: { word: "glisten", part_of_speech: "verb", phonetic: "GLIS-uhn", meaning: "To shine with a soft, wet light.", explanation: "Dew on grass glistens in the morning sun.", example: "The wet leaves glisten in the sun.", usage: "Say: 'Look how the lake glistens!'", synonyms: ["shine"], antonyms: [], emoji: "💧", difficulty: 2 } });
ok(man.status === 200 && man.data.validation.passed, `manual word validated: ${man.data.validation?.checks?.filter((c) => !c.passed).map((c) => c.name).join(",") || "all gates passed"}`);
const cron = await fetch(BASE + "/api/cron/reminders");
ok(cron.status === 401, "cron endpoints require the secret");
