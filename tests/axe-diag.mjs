// Prints detailed axe violations (serious/critical) for given pages: node tests/axe-diag.mjs
import fs from "node:fs";
import { createRequire } from "node:module";

import { BASE, client, makeFamily } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const fam = await makeFamily("G3", "Meera"); await fam.child.call("/api/welcome", {});
const admin = client(); await admin.call("/api/auth/login-admin", { email: process.env.ADMIN_EMAIL ?? "admin@pingvibe.local", password: process.env.ADMIN_PASSWORD ?? "ChangeMe!2026" });
const sets = [
  [null, ["/", "/signup", "/login", "/login?as=parent", "/privacy", "/forgot-password", "/verify?expired=1"]],
  [fam.child.cookie(), ["/world", "/world/quest", "/world/map", "/world/map/vocabulary-forest", "/world/my-world", "/world/missions", "/world/arcade", "/world/arcade/word-hunter", "/world/arcade/word-match", "/world/writing", "/world/grammar", "/world/grammar/nouns", "/world/reading", "/world/reading/the-monsoon-puddle", "/world/speaking", "/world/listening", "/world/rewards", "/world/avatar", "/world/pets", "/world/skills", "/world/calendar", "/world/museum", "/world/collection", "/world/notebook", "/world/companion", "/world/me", "/world/story-builder", "/world/boss/word-thief"]],
  [fam.parent.cookie(), ["/parent", `/parent/child/${fam.childId}`, "/parent/settings"]],
  [admin.cookie(), ["/admin", "/admin/content", "/admin/economy", "/admin/events", "/admin/vocabulary", "/admin/grades"]],
];
const browser = await chromium.launch();
for (const [cookie, pages] of sets) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
  if (cookie) for (const kv of cookie.split("; ")) { const i = kv.indexOf("="); await ctx.addCookies([{ name: kv.slice(0, i), value: kv.slice(i + 1), url: BASE }]); }
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.addScriptTag({ content: AXE });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.filter((x) => ["serious", "critical"].includes(x.impact)).map((x) => ({ id: x.id, nodes: x.nodes.map((n) => `${n.target.join(" ")} | ${n.html.slice(0, 140)} | ${n.failureSummary.replace(/\n/g, " ").slice(0, 170)}`) })));
    if (v.length) console.log(`\n=== ${p}`); for (const x of v) { console.log(` ${x.id}`); for (const n of x.nodes.slice(0, 5)) console.log("   -", n); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
