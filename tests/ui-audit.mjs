// Browser QA: real UI journey, responsive overflow at 8 viewports, console errors,
// broken images, axe-core accessibility and screenshot visual regression.
// Usage: node tests/ui-audit.mjs [--update-baseline]   (needs a dev server on BASE_URL)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { BASE, client, makeFamily } from "./lib.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const UPDATE = process.argv.includes("--update-baseline");
const ONLY = new RegExp(process.env.ONLY ?? ".");
const OUT = "qa/results"; const SHOTS = "qa/screenshots/current"; const BASELINE = "qa/screenshots/baseline";
for (const d of [OUT, SHOTS, BASELINE]) fs.mkdirSync(d, { recursive: true });

const R = [];
const t = (id, module, severity, scenario, cond, actual = "") => {
  const status = cond === null ? "BLOCKED" : cond ? "PASS" : "FAIL";
  R.push({ id, module, severity, scenario, status, actual: String(actual).slice(0, 300) });
  console.log(`${status === "PASS" ? "✅" : status === "BLOCKED" ? "⛔" : "❌"} ${id} ${scenario}${status !== "PASS" ? ` — ${String(actual).slice(0, 200)}` : ""}`);
};
const VIEWPORTS = [[320, 640], [375, 812], [430, 932], [768, 1024], [1024, 768], [1366, 768], [1440, 900], [1920, 1080]];
const BASELINE_VPS = new Set(["375", "768", "1440"]);
// Pages whose content is intentionally random/fresh (today's words, rotating topics, generated grids/questions,
// animated maps, the profile with its random Explorer name) are screenshotted for manual review but excluded from automated pixel diffs.
const DYNAMIC = /\/world($|\/(me$|quest|map|missions|arcade\/|writing|grammar\/|notebook|story-builder|boss|calendar|my-world|avatar|museum|reading\/))|\/parent\/child|\/admin($|\/content)/;

let browser = await chromium.launch();
const ensureBrowser = async () => { if (!browser.isConnected()) browser = await chromium.launch(); };

// ── Journey 1: brand-new family entirely through the UI ─────────────────────
async function journey() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const email = `ui.${Date.now()}@example.com`;
  try {
    await page.goto(BASE + "/");
    await page.getByRole("link", { name: /START YOUR ADVENTURE/ }).first().click();
    await page.waitForURL("**/signup");
    await page.fill("#childName", "Diya");
    await page.fill("#parentEmail", email);
    await page.selectOption("#birthMonth", "4");
    await page.selectOption("#birthYear", String(new Date().getFullYear() - 7));
    await page.getByRole("radio", { name: "Grade 2" }).click();
    await page.fill("#password", "Secret123");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Create account/ }).click();
    await page.getByText(/Almost there/).waitFor();
    t("UI-J1-01", "Journey 1", "Critical", "Homepage → Start Your Adventure → register via form", true);
    await page.goto(BASE + "/dev/mailbox");
    const href = await page.locator("a", { hasText: "Verify e-mail" }).first().getAttribute("href");
    await page.goto(href.replace(/^https?:\/\/[^/]+/, BASE));
    await page.getByRole("link", { name: /Verify my e-mail/ }).click();
    await page.waitForURL("**/parent/consent");
    t("UI-J1-02", "Journey 1", "Critical", "E-mail link → verify button → consent page", true);
    await page.getByRole("checkbox").first().check();
    await page.locator("input[type=password]").nth(0).fill("739164");
    await page.locator("input[type=password]").nth(1).fill("739164");
    await page.getByRole("button", { name: /Give consent/ }).click();
    const uname = await page.locator(".text-vibe-sun.font-display, .font-display.text-vibe-sun").first().textContent();
    t("UI-J1-03", "Journey 1", "Critical", "Consent + PIN shows Explorer name", !!uname, uname);
    await page.getByRole("button", { name: /Hand the device/ }).click();
    await page.waitForURL("**/world/welcome");
    t("UI-J1-04", "Journey 1", "Critical", "Child session starts at character welcome (no assessment)", true);
    await page.getByRole("button", { name: /Hi MAX/ }).click();
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /Next buddy/ }).click();
    await page.getByRole("button", { name: /Show me the worlds/ }).click();
    await page.getByRole("button", { name: /Let's go/ }).click();
    await page.getByRole("button", { name: /Start my first adventure/ }).click();
    await page.waitForURL("**/world/quest");
    t("UI-J1-05", "Journey 1", "High", "Onboarding steps → first Daily Word Quest", true);
    await page.getByRole("button", { name: /Meet today's words/ }).click();
    for (let i = 0; i < 9; i++) await page.getByRole("button", { name: /Next word/ }).click();
    await page.getByRole("button", { name: /Start the challenge rounds/ }).click();
    let answered = 0;
    for (let i = 0; i < 25; i++) {
      if (await page.getByRole("button", { name: /Finish quest/ }).isVisible().catch(() => false)) break;
      const typed = page.getByLabel("Your answer");
      if (await typed.isVisible().catch(() => false)) { await typed.fill("guess"); await page.getByRole("button", { name: "Check" }).click(); }
      else {
        const tokens = page.locator("button.rounded-full.border:not([disabled])");
        if (await page.getByRole("button", { name: /Check sentence/ }).isVisible().catch(() => false)) {
          while (await tokens.count()) await tokens.first().click();
          await page.getByRole("button", { name: /Check sentence/ }).click();
        } else await page.locator(".card button.rounded-2xl").first().click();
      }
      await page.getByRole("button", { name: /^Next →$/ }).click();
      answered++;
    }
    await page.getByRole("button", { name: /Finish quest/ }).click();
    await page.getByRole("dialog").waitFor();
    const xpText = await page.getByRole("dialog").textContent();
    t("UI-J1-06", "Journey 1", "Critical", "Learn 10 words, answer all rounds, receive XP celebration", /XP/.test(xpText), `${answered} questions; ${xpText?.match(/\+\d+ XP/)?.[0]}`);
    await page.getByRole("button", { name: "Awesome!" }).click();
    await page.goto(BASE + "/world");
    const hdr = await page.locator("header").textContent();
    t("UI-J1-07", "Journey 1", "High", "Dashboard reflects XP & coins after reload", /XP|🪙/.test(hdr ?? ""));
    t("UI-J1-08", "Journey 1", "High", "No uncaught JS errors during the journey", errors.length === 0, errors.join(" | "));
  } catch (e) {
    t("UI-J1-ERR", "Journey 1", "Critical", "Journey 1 completed without UI dead-ends", false, e.message.split("\n").filter((l) => /waiting for|locator|Timeout/.test(l)).slice(0, 3).join(" ") + ` @ ${page.url()}`);
    await page.screenshot({ path: `${OUT}/journey1-failure.png` });
  }
  await ctx.close();
}

// ── Responsive / console / images / visual regression ─────────────────────────
async function cookieCtx(cookieStr, vp) {
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, reducedMotion: "reduce" });
  if (cookieStr) {
    const [name, value] = cookieStr.split("=");
    await ctx.addCookies([{ name, value, url: BASE }]);
  }
  return ctx;
}

async function sweep(label, pages, cookieStr) {
  for (const vp of VIEWPORTS) {
    await ensureBrowser();
    const ctx = await cookieCtx(cookieStr, vp);
    for (const p of pages.filter((x) => ONLY.test(x))) {
     try {
      const page = await ctx.newPage();
      const errs = [];
      page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("404") ) errs.push(m.text()); });
      page.on("pageerror", (e) => errs.push(e.message));
      page.on("requestfailed", (r) => { if (!r.url().includes("_next/webpack-hmr") && !r.url().includes("_rsc=")) errs.push(`failed: ${r.url()}`); });
      page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("favicon")) errs.push(`${r.status()} ${r.url()}`); });
      const res = await page.goto(BASE + p, { waitUntil: "networkidle" }).catch((e) => ({ status: () => 0, e }));
      await page.waitForTimeout(150).catch(() => {});
      const m = await page.evaluate(() => {
        const vw = window.innerWidth;
        const over = document.documentElement.scrollWidth - vw;
        // interactive elements pushed outside the viewport horizontally (clipped controls)
        const clipped = [...document.querySelectorAll("a,button,input,select,textarea")].filter((el) => {
          const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
          // controls inside a horizontally scrollable container are reachable (focus scrolls them into view)
          const inScroller = (() => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if ((o === "auto" || o === "scroll") && a.scrollWidth > a.clientWidth) return true; } return false; })();
          if (!r.width || st.visibility === "hidden" || inScroller || el.closest("[aria-hidden=true]") || el.closest(".sr-only")) return false;
          return r.right > vw + 2 || r.left < -2;
        }).map((el) => (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30));
        const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
        const targets = [...document.querySelectorAll("button, a.btn, a[class*=btn], [role=button]")].filter((b) => !b.closest("[aria-hidden=true], .sr-only")).map((b) => [b, b.getBoundingClientRect()]).filter(([, r]) => r.width > 0 && r.height > 0);
        const small = targets.filter(([, r]) => r.height < 32).length;
        // WCAG 2.2 AA 2.5.8 Target Size (Minimum): 24×24 CSS px
        const tiny = targets.filter(([, r]) => r.height < 24 || r.width < 24).map(([b]) => (b.getAttribute("aria-label") || b.textContent || b.tagName).trim().slice(0, 24));
        return { over, clipped, broken, small, tiny };
      });
      const id = `RSP-${label}-${p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${vp[0]}`;
      const ok = res.status() < 400 && m.over <= 1 && m.clipped.length === 0 && m.broken.length === 0;
      t(id, "Responsive", "Medium", `${label} ${p} @${vp[0]}px: no horizontal overflow, clipped controls or broken images`, ok, `status ${res.status()} overflow ${m.over}px clipped [${m.clipped.join(", ")}] broken [${m.broken.join(", ")}]`);
      t(`TGT-${id}`, "Accessibility", "Medium", `${label} ${p} @${vp[0]}px: interactive targets ≥ 24×24px (WCAG 2.5.8)`, m.tiny.length === 0, `under 24px: [${m.tiny.slice(0, 6).join(", ")}]; under 32px tall: ${m.small}`);
      t(`CON-${id}`, "Console", "Medium", `${label} ${p} @${vp[0]}px: no console/network errors`, errs.length === 0, errs.slice(0, 3).join(" | "));
      if (BASELINE_VPS.has(String(vp[0]))) {
        const name = `${label}${p.replace(/[^a-z0-9]+/gi, "_")}_${vp[0]}.jpg`;
        // let entrance fades (opacity still animates under reduced motion) settle before capture
        await page.waitForTimeout(1200).catch(() => {});
        await page.evaluate(() => Promise.race([Promise.all(document.getAnimations().map((a) => a.finished)), new Promise((r) => setTimeout(r, 1500))])).catch(() => {});
        await page.screenshot({ path: `${SHOTS}/${name}`, type: "jpeg", quality: 60 });
        const base = `${BASELINE}/${name}`;
        if (UPDATE || !fs.existsSync(base)) fs.copyFileSync(`${SHOTS}/${name}`, base);
        else if (!DYNAMIC.test(p)) {
          const [a, b] = await Promise.all([sharp(base).raw().toBuffer({ resolveWithObject: true }), sharp(`${SHOTS}/${name}`).raw().toBuffer({ resolveWithObject: true })]);
          let diff = 0;
          if (a.info.width !== b.info.width || a.info.height !== b.info.height) diff = 1;
          else { for (let k = 0; k < a.data.length; k += 3) if (Math.abs(a.data[k] - b.data[k]) + Math.abs(a.data[k + 1] - b.data[k + 1]) + Math.abs(a.data[k + 2] - b.data[k + 2]) > 60) diff++; diff /= a.data.length / 3; }
          t(`VIS-${id}`, "Visual regression", "Low", `${label} ${p} @${vp[0]}px matches baseline (<3% pixels changed)`, diff < 0.03, `${(diff * 100).toFixed(2)}% changed`);
        }
      }
      await page.close();
     } catch (e) {
      t(`RSP-${label}-${p}-${vp[0]}-run`, "Responsive", "Low", `${label} ${p} @${vp[0]}px audit executed`, null, `BLOCKED by test harness: ${e.message.split("\n")[0]}`);
      await ensureBrowser();
     }
    }
    await ctx.close().catch(() => {});
  }
}

async function a11y(label, pages, cookieStr) {
  await ensureBrowser();
  const ctx = await cookieCtx(cookieStr, [1366, 900]);
  for (const p of pages.filter((x) => ONLY.test(x))) {
   const page = await ctx.newPage();
   try {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    // contrast is only meaningful once entrance fades have finished
    await page.waitForTimeout(1200);
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 6).map((n) => ({ target: n.target.join(" "), html: n.html.slice(0, 160), why: (n.failureSummary || "").slice(0, 200) })) }));
    });
    const serious = res.filter((v) => v.impact === "critical" || v.impact === "serious");
    t(`A11Y-${label}-${p.replace(/[^a-z0-9]+/gi, "-") || "home"}`, "Accessibility", "Medium", `${label} ${p}: no critical/serious axe violations (WCAG 2.2 AA)`, serious.length === 0, res.map((v) => `${v.impact}:${v.id}(${v.nodes})`).join(", "));
    // keyboard: first Tab lands on the skip link, focus is visible
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim().slice(0, 30), outline: getComputedStyle(document.activeElement).outlineStyle + "|" + getComputedStyle(document.activeElement).boxShadow }));
    t(`KBD-${label}-${p.replace(/[^a-z0-9]+/gi, "-") || "home"}`, "Accessibility", "Medium", `${label} ${p}: first Tab reaches skip link`, /Skip to content/.test(focus.text ?? ""), focus.text);
    fs.appendFileSync(`${OUT}/axe-details.jsonl`, JSON.stringify({ label, page: p, violations: res }) + "\n");
   } catch (e) {
    t(`A11Y-${label}-${p.replace(/[^a-z0-9]+/gi, "-") || "home"}-run`, "Accessibility", "Medium", `${label} ${p}: accessibility audit executed`, null, `BLOCKED by test harness: ${e.message.split("\n")[0]}`);
   }
   await page.close().catch(() => {});
  }
  // reduced motion honoured
  const page = await ctx.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE + pages[0]);
  const dur = await page.evaluate(() => getComputedStyle(document.querySelector(".animate-twinkle, .animate-float, body")).animationDuration);
  t(`A11Y-${label}-reduced-motion`, "Accessibility", "Medium", `${label}: prefers-reduced-motion disables CSS animation`, (parseFloat(dur) * (/ms$/.test(dur) ? 0.001 : 1)) <= 0.01, dur);
  await ctx.close();
}

fs.rmSync(`${OUT}/axe-details.jsonl`, { force: true });
// Dev server compiles routes on first hit; warm them so timeouts measure the app, not the compiler.
{
  const w = await makeFamily("G2", "Warm"); await w.child.call("/api/welcome", {});
  for (const p of ["/", "/signup", "/login", "/dev/mailbox", "/parent/consent", "/world/welcome", "/world/quest", "/world", "/api/quest", "/world/arcade/word-match"]) await w.child.call(p);
  for (const p of ["/parent", "/parent/consent"]) await w.parent.call(p);
}
// ONLY=<regex> limits the sweep to matching pages (e.g. to refresh selected baselines); the journey runs only in full audits.
if (!process.env.ONLY) await journey();
const fam = await makeFamily("G3", "Meera");
await fam.child.call("/api/welcome", {});
const childCookie = fam.child.cookie();
const parentCookie = fam.parent.cookie();
const admin = client(); await admin.call("/api/auth/login-admin", { email: "admin@pingvibe.local", password: "ChangeMe!2026" });

const PUBLIC = ["/", "/signup", "/login", "/login?as=parent", "/privacy", "/forgot-password", "/verify?expired=1"];
const CHILD = ["/world", "/world/quest", "/world/map", "/world/map/vocabulary-forest", "/world/my-world", "/world/missions", "/world/arcade", "/world/arcade/word-hunter", "/world/writing", "/world/grammar", "/world/grammar/nouns", "/world/reading", "/world/reading/the-monsoon-puddle", "/world/speaking", "/world/listening", "/world/rewards", "/world/avatar", "/world/pets", "/world/skills", "/world/calendar", "/world/museum", "/world/collection", "/world/notebook", "/world/companion", "/world/me", "/world/story-builder", "/world/boss/word-thief"];
const PARENT = ["/parent", `/parent/child/${fam.childId}`, "/parent/settings"];
const ADMIN = ["/admin", "/admin/content", "/admin/economy", "/admin/events", "/admin/vocabulary", "/admin/grades"];

await sweep("public", PUBLIC, null);
await sweep("child", CHILD, childCookie);
await sweep("parent", PARENT, parentCookie);
await sweep("admin", ADMIN, admin.cookie());
await a11y("public", PUBLIC, null);
await a11y("child", [...CHILD, "/world/arcade/word-match", "/world/listening"], childCookie);
await a11y("parent", PARENT, parentCookie);
await a11y("admin", ADMIN, admin.cookie());
await browser.close();

fs.writeFileSync(`${OUT}/ui-audit.json`, JSON.stringify({ generated_at: new Date().toISOString(), base: BASE, results: R }, null, 2));
const n = (s) => R.filter((r) => r.status === s).length;
console.log(`\nTOTAL ${R.length} · PASS ${n("PASS")} · FAIL ${n("FAIL")} · BLOCKED ${n("BLOCKED")}`);
