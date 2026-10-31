// Colour-theme audit: runs axe-core (WCAG 2.2 A/AA, including colour contrast) on key pages in EVERY colour theme,
// and saves one screenshot per theme for visual review. Needs a running server with the dev mailbox.
//   BASE_URL=http://localhost:3000 node tests/theme-audit.mjs
// Writes qa/results/theme-audit.json and qa/screenshots/themes/<theme>-<page>.jpg
import fs from "node:fs";
import { createRequire } from "node:module";
import { BASE, makeFamily } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const THEMES = ["rainbow-wonder", "ocean-splash", "candy-galaxy", "sunshine-garden", "twilight-magic"];
const PAGES = ["/", "/login", "/signup", "/world", "/world/look", "/world/quest", "/world/map", "/world/rewards", "/world/missions", "/world/grammar", "/world/reading", "/world/me", "/parent"];
const SHOTS = ["/world", "/world/look", "/world/map"];
fs.mkdirSync("qa/screenshots/themes", { recursive: true });

const F = await makeFamily("G3", "Asha"); await F.child.call("/api/welcome", {});
const browser = await chromium.launch(); const R = [];
for (const theme of THEMES) {
  await F.child.call("/api/world/appearance", { theme });
  for (const vp of [[390, 844], [1366, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, reducedMotion: "reduce" });
    await ctx.addInitScript(() => { try { localStorage.setItem("pv-audio-v1", JSON.stringify({ musicOn: false, voiceOn: false })); } catch {} });
    await ctx.addCookies([{ name: "pv-theme", value: theme, url: BASE }]);
    for (const p of PAGES) {
      const [cn, cv] = (p.startsWith("/parent") ? F.parent : F.child).cookie().split("=");
      await ctx.addCookies([{ name: cn, value: cv, url: BASE }]);
      const page = await ctx.newPage();
      await page.goto(BASE + p, { waitUntil: "networkidle" }); await page.waitForTimeout(400);
      const applied = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await page.addScriptTag({ content: AXE });
      const v = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((x) => ({ id: x.id, nodes: x.nodes.length, sample: x.nodes[0]?.target.join(" ") })));
      const id = `THEME-${theme}-${p.replace(/\//g, "_") || "home"}-${vp[0]}`;
      R.push({ id, module: "Colour themes", severity: "High", scenario: `${theme} ${p} @${vp[0]}px: WCAG 2.2 AA (axe) incl. contrast`, status: v.length ? "FAIL" : "PASS", actual: v.map((x) => `${x.id}×${x.nodes} ${x.sample}`).join("; ") || `bg ${applied}` });
      console.log(`${v.length ? "❌" : "✅"} ${id}${v.length ? " — " + v.map((x) => x.id).join(",") : ""}`);
      if (SHOTS.includes(p)) await page.screenshot({ path: `qa/screenshots/themes/${theme}${p.replace(/\//g, "-")}-${vp[0]}.jpg`, type: "jpeg", quality: 70 });
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync("qa/results/theme-audit.json", JSON.stringify({ suite: "theme-audit", ranAt: new Date().toISOString(), results: R }, null, 2));
console.log(`\nTOTAL ${R.length} · PASS ${R.filter((r) => r.status === "PASS").length} · FAIL ${R.filter((r) => r.status === "FAIL").length}`);
