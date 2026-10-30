// Performance & load test against a PRODUCTION build (staging config).
// node tests/perf.mjs  (BASE_URL defaults to http://localhost:3001)
import fs from "node:fs";
import { createRequire } from "node:module";
process.env.BASE_URL ??= "http://localhost:3001";
const { BASE, makeFamily } = await import("./lib.mjs");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const R = [];
const t = (id, scenario, cond, actual) => { R.push({ id, module: "Performance", severity: "Medium", scenario, status: cond ? "PASS" : "FAIL", actual: String(actual) }); console.log(`${cond ? "✅" : "❌"} ${id} ${scenario} — ${actual}`); };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };

// 1) Page load metrics (mobile profile, cold + warm)
const fam = await makeFamily("G3", "Perf"); await fam.child.call("/api/welcome", {});
const browser = await chromium.launch();
async function measure(path, cookie, label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  if (cookie) { const [name, value] = cookie.split("="); await ctx.addCookies([{ name, value, url: BASE }]); }
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); new PerformanceObserver((l) => { window.__cls = (window.__cls || 0) + l.getEntries().reduce((s, e) => s + (e.hadRecentInput ? 0 : e.value), 0); }).observe({ type: "layout-shift", buffered: true }); });
  const runs = [];
  for (let i = 0; i < 3; i++) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(400);
    runs.push(await page.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; const bytes = performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0) + (n.transferSize || 0); return { ttfb: n.responseStart, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, lcp: window.__lcp, cls: window.__cls || 0, kb: Math.round(bytes / 1024) }; }));
  }
  await ctx.close();
  const warm = runs[runs.length - 1];
  const cold = runs[0];
  t(`PERF-${label}`, `${path}: LCP < 2.5s, TTFB < 800ms, CLS < 0.1 (warm)`, warm.lcp < 2500 && warm.ttfb < 800 && warm.cls < 0.1, `cold TTFB ${cold.ttfb.toFixed(0)}ms LCP ${cold.lcp.toFixed(0)}ms | warm TTFB ${warm.ttfb.toFixed(0)}ms DCL ${warm.dcl.toFixed(0)}ms LCP ${warm.lcp.toFixed(0)}ms CLS ${warm.cls.toFixed(3)} transfer ${cold.kb}KB`);
}
await measure("/", null, "home");
await measure("/login", null, "login");
await measure("/world", fam.child.cookie(), "child-dashboard");
await measure("/world/quest", fam.child.cookie(), "quest");
await measure("/parent", fam.parent.cookie(), "parent-dashboard");
await browser.close();

// 2) Concurrent learners: N children answer and complete quests simultaneously
const N = Number(process.env.LOAD_CHILDREN ?? 30);
const kids = [];
for (let i = 0; i < N; i += 10) kids.push(...(await Promise.all(Array.from({ length: Math.min(10, N - i) }, (_, k) => makeFamily(["PRE_KG", "G1", "G3", "G5", "G7"][(i + k) % 5], "Load")))));
const lat = []; let errors = 0;
const timed = async (fn) => { const s = performance.now(); const r = await fn(); lat.push(performance.now() - s); if (r.status >= 500) errors++; return r; };
const t0 = performance.now();
const outcomes = await Promise.all(kids.map(async (k) => {
  await timed(() => k.child.call("/api/welcome", {}));
  const q = await timed(() => k.child.call("/api/quest"));
  const W = Object.fromEntries(q.data.newWords.map((w) => [w.id, w]));
  for (const x of q.data.questions) await timed(() => k.child.call("/api/quest/answer", { wordId: x.wordId, type: x.type, answer: x.type === "meaning" ? W[x.wordId].meaning : x.type === "usage" ? W[x.wordId].example : W[x.wordId].word }));
  const done = await Promise.all([1, 2, 3].map(() => timed(() => k.child.call("/api/quest/complete", { seconds: 300 }))));
  await timed(() => k.child.call("/api/missions/claim", { slug: "d-discover" }));
  return done.filter((d) => d.data?.award?.xp > 0).length;
}));
const secs = (performance.now() - t0) / 1000;
t("LOAD-001", `${N} concurrent children (${lat.length} requests): no 5xx`, errors === 0, `${errors} errors in ${secs.toFixed(1)}s (${(lat.length / secs).toFixed(1)} req/s)`);
t("LOAD-002", `${N} concurrent children: API p95 < 1500ms`, pct(lat, 95) < 1500, `p50 ${pct(lat, 50).toFixed(0)}ms p95 ${pct(lat, 95).toFixed(0)}ms max ${Math.max(...lat).toFixed(0)}ms`);
t("LOAD-003", "Each child received exactly one quest XP award under triple concurrent completion", outcomes.every((n) => n === 1), JSON.stringify(outcomes));
fs.mkdirSync("qa/results", { recursive: true });
fs.writeFileSync("qa/results/perf.json", JSON.stringify({ generated_at: new Date().toISOString(), base: BASE, children: N, results: R }, null, 2));
