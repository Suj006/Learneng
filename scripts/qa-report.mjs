// Aggregates qa/results/*.json + qa/defects.json into
//   qa/results/test-execution-report.json  (machine-readable)
//   qa/COMPLETE_TEST_CASES.md               (every executed test case)
// Usage: node scripts/qa-report.mjs   (after running vitest, qa-api, ui-audit, perf)
import fs from "node:fs";
import { execSync } from "node:child_process";

const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);
const suites = [
  ["API, database, security & learning", "qa/results/qa-api.json", "node tests/qa-api.mjs"],
  ["UI journeys, responsive, console, accessibility & visual", "qa/results/ui-audit.json", "node tests/ui-audit.mjs"],
  ["Performance & load", "qa/results/perf.json", "node tests/perf.mjs"],
  ["Colour themes (axe on every theme)", "qa/results/theme-audit.json", "node tests/theme-audit.mjs"],
];

let unit = { total: 0, passed: 0, failed: 0 };
try {
  const out = execSync("npx vitest run --reporter=json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const j = JSON.parse(out.slice(out.indexOf("{")));
  unit = { total: j.numTotalTests, passed: j.numPassedTests, failed: j.numFailedTests };
} catch (e) { unit.error = String(e.message).split("\n")[0]; }

const all = [];
const suiteSummaries = [];
for (const [name, file, cmd] of suites) {
  const r = read(file);
  if (!r) { suiteSummaries.push({ name, command: cmd, executed: false }); continue; }
  const c = { PASS: 0, FAIL: 0, BLOCKED: 0 };
  for (const x of r.results) { c[x.status] = (c[x.status] ?? 0) + 1; all.push({ ...x, suite: name }); }
  suiteSummaries.push({ name, command: cmd, executed: true, generated_at: r.generated_at, base: r.base, total: r.results.length, passed: c.PASS, failed: c.FAIL, blocked: c.BLOCKED });
}

const defects = read("qa/defects.json") ?? [];
const sev = ["Critical", "High", "Medium", "Low"];
const bySeverity = (list) => Object.fromEntries(sev.map((s) => [s, list.filter((d) => d.severity === s).length]));
const open = defects.filter((d) => d.status !== "Fixed");
const total = all.length + unit.total;
const passed = all.filter((x) => x.status === "PASS").length + unit.passed;
const failed = all.filter((x) => x.status === "FAIL").length + unit.failed;
const blocked = all.filter((x) => x.status === "BLOCKED").length;
// Planned-but-not-automated areas are tracked in QA_MASTER_TEST_PLAN.md §8.
const notExecuted = ["Real-device testing (iOS Safari, Android Chrome, tablets)", "Lighthouse audits", "Screen-reader walkthrough (NVDA/VoiceOver)", "Load on managed Postgres", "Live Claude API", "Live e-mail delivery (Resend)", "Penetration test by a third party", "Educational content review by teachers", "Usability sessions with children"];

const releaseBlockers = open.filter((d) => ["Critical", "High"].includes(d.severity));
const report = {
  product: "PING VIBE",
  generated_at: new Date().toISOString(),
  environment: "Synthetic data only; local Next.js dev (UI) and production build (API/perf) on embedded PGlite. No real children's data used.",
  totals: { total, passed, failed, blocked, not_executed_areas: notExecuted.length },
  unit_tests: unit,
  suites: suiteSummaries,
  by_module: Object.values(all.reduce((m, x) => {
    const k = `${x.suite} :: ${x.module}`; m[k] ??= { suite: x.suite, module: x.module, total: 0, passed: 0, failed: 0, blocked: 0 };
    m[k].total++; m[k][{ PASS: "passed", FAIL: "failed", BLOCKED: "blocked" }[x.status]]++; return m;
  }, {})),
  failed_tests: all.filter((x) => x.status === "FAIL").map(({ id, module, scenario, actual }) => ({ id, module, scenario, actual })),
  blocked_tests: all.filter((x) => x.status === "BLOCKED").map(({ id, module, scenario, actual }) => ({ id, module, scenario, actual })),
  not_executed: notExecuted,
  defects: { total: defects.length, found_by_severity: bySeverity(defects), fixed: defects.filter((d) => d.status === "Fixed").length, open_by_severity: bySeverity(open), open: open.map(({ id, severity, status, title }) => ({ id, severity, status, title })) },
  release_recommendation: {
    decision: releaseBlockers.length || failed ? "NOT READY FOR PUBLIC RELEASE — READY FOR CONTROLLED PILOT AFTER BLOCKERS CLEARED" : "READY FOR CONTROLLED PILOT",
    blockers: releaseBlockers.map((d) => `${d.id}: ${d.title}`),
    required_sign_offs: ["Technical QA", "Educational QA", "Child UX QA"],
    pilot: "Small consented pilot with families in Pre-KG, Grade 2, Grade 5 and Grade 7",
  },
  disclaimer: "This report reflects the automated and manual checks listed. It does not certify the software as defect-free.",
};
fs.mkdirSync("qa/results", { recursive: true });
fs.writeFileSync("qa/results/test-execution-report.json", JSON.stringify(report, null, 2));

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 240);
let md = `# PING VIBE — Complete Test Cases (executed)\n\nGenerated ${report.generated_at} by \`node scripts/qa-report.mjs\` from the raw results in \`qa/results/\`. Synthetic data only.\n\n`;
md += `**Totals:** ${total} executed · ${passed} pass · ${failed} fail · ${blocked} blocked (includes ${unit.total} vitest unit tests).\n\n`;
md += `| Suite | Command | Total | Pass | Fail | Blocked |\n|---|---|---|---|---|---|\n`;
md += `| Unit (engines) | \`npx vitest run\` | ${unit.total} | ${unit.passed} | ${unit.failed} | 0 |\n`;
for (const s of suiteSummaries) md += s.executed ? `| ${s.name} | \`${s.command}\` | ${s.total} | ${s.passed} | ${s.failed} | ${s.blocked} |\n` : `| ${s.name} | \`${s.command}\` | not executed | | | |\n`;
for (const s of suiteSummaries.filter((s) => s.executed)) {
  md += `\n## ${s.name}\n\n_Run against ${s.base} at ${s.generated_at}._\n`;
  const mods = [...new Set(all.filter((x) => x.suite === s.name).map((x) => x.module))];
  for (const m of mods) {
    md += `\n### ${m}\n\n| ID | Severity | Scenario | Status | Actual / notes |\n|---|---|---|---|---|\n`;
    for (const x of all.filter((y) => y.suite === s.name && y.module === m)) md += `| ${x.id} | ${x.severity} | ${esc(x.scenario)} | ${x.status === "PASS" ? "✅ PASS" : x.status === "FAIL" ? "❌ FAIL" : "⛔ BLOCKED"} | ${esc(x.actual)} |\n`;
  }
}
fs.writeFileSync("qa/COMPLETE_TEST_CASES.md", md);
console.log(JSON.stringify(report.totals), "defects", JSON.stringify(report.defects.found_by_severity), "open", JSON.stringify(report.defects.open_by_severity));
