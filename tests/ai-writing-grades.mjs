// Live AI writing-feedback check, one child per grade (Pre-KG … Grade 7).
// Submits a grade-typical piece of writing and records who evaluated it and what the feedback says,
// so a reviewer can judge whether the tone, corrections and sample suit each grade.
// Run against a server started with PINGVIBE_ANTHROPIC_API_KEY (or ANTHROPIC_API_KEY) and the dev mailbox:
//   BASE_URL=http://localhost:3000 node tests/ai-writing-grades.mjs
// Writes qa/results/ai-writing-grades.json. Synthetic data only.
import fs from "node:fs";
import { makeFamily } from "./lib.mjs";

const SAMPLES = {
  PRE_KG: "i lov my cat. she is big",
  LKG: "i hav a red bal. i play wit it",
  UKG: "my mom is good. she mak food for me. i lik her",
  G1: "i have a dog. he is very big and he like to run in the park with me",
  G2: "Last sunday i go to the zoo with my family. i saw a big elephant and the monkeys was jumping",
  G3: "My favourite festival is diwali. we lights diyas and eat sweets. my grandma tell us storys about lord rama",
  G4: "Yesterday it rain very heavy in our town. The roads was full of water and we cannot go to school. I made paper boats with my brother and we watch them float",
  G5: "If I could fly I would visit every country in the world. First I will go to Japan because I want to see the cherry blossoms, then I would of gone to Egypt to see the pyramids",
  G6: "Plastic pollution is one of the biggest problem today. Many animals in the ocean eats plastic thinking it is food. We should stop using plastic bags and carry cloth bags instead, this small step can make a big difference",
  G7: "Technology have changed the way students learn. Online classes allows us to study from home, however it also cause problems like screen fatigue and less interaction with friends. In my opinion a balance between online and offline learning is the best approach",
};

const out = [];
for (const [grade, text] of Object.entries(SAMPLES)) {
  const F = await makeFamily(grade, "Asha");
  const d = await F.child.call("/api/writing/draft", { kind: "topic", title: "My writing", content: text });
  const r = await F.child.call("/api/writing/submit", { submissionId: d.data.submissionId, seconds: 120 });
  const e = r.data?.evaluation ?? {};
  const row = {
    grade, status: r.status, evaluator: r.data?.evaluator ?? null,
    score: e.score ?? null, corrections: e.corrections ?? [], improved_sample: e.improved_sample ?? null,
    encouragement: e.encouragement ?? null, needs_adult_attention: e.needs_adult_attention ?? null, text,
  };
  out.push(row);
  console.log(`${row.evaluator === "claude" ? "✅" : "⚠️ "} ${grade.padEnd(6)} status=${row.status} evaluator=${row.evaluator} score=${row.score} corrections=${row.corrections.length}`);
}
fs.mkdirSync("qa/results", { recursive: true });
fs.writeFileSync("qa/results/ai-writing-grades.json", JSON.stringify({ ranAt: new Date().toISOString(), results: out }, null, 2));
const claudeCount = out.filter((r) => r.evaluator === "claude").length;
console.log(`\nClaude evaluated ${claudeCount}/${out.length} grades`);
