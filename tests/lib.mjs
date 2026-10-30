// Shared fixtures for API/E2E tests. Synthetic data only.
export const BASE = process.env.BASE_URL ?? "http://localhost:3000";
export function client() {
  const jar = new Map();
  const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  async function call(path, body, method, headers = {}) {
    const res = await fetch(BASE + path, {
      method: method ?? (body !== undefined ? "POST" : "GET"), redirect: "manual",
      headers: { "Content-Type": "application/json", Cookie: cookie(), Origin: BASE, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    for (const c of res.headers.getSetCookie?.() ?? []) { const [kv] = c.split(";"); const i = kv.indexOf("="); const k = kv.slice(0, i), v = kv.slice(i + 1); if (v) jar.set(k, v); else jar.delete(k); }
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, headers: res.headers };
  }
  return { call, jar, cookie };
}
const results = [];
export function check(id, area, name, cond, detail = "") {
  results.push({ id, area, name, status: cond ? "PASS" : "FAIL", detail: String(detail).slice(0, 300) });
  console.log(`${cond ? "✅" : "❌"} [${id}] ${name}${detail && !cond ? ` — ${String(detail).slice(0, 200)}` : ""}`);
  return cond;
}
export const allResults = () => results;

/** Registers a parent, verifies via the dev mailbox, gives consent and returns logged-in child + parent clients. */
export async function makeFamily(grade = "G3", name = "Asha") {
  const parent = client();
  const email = `qa.${grade.toLowerCase()}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`;
  const r = await parent.call("/api/auth/register", { childName: name, parentEmail: email, birthMonth: 6, birthYear: new Date().getFullYear() - 8, grade, password: "Secret123", isParent: true });
  if (r.status !== 200) throw new Error(`register ${r.status} ${JSON.stringify(r.data)}`);
  const mail = await (await fetch(BASE + "/dev/mailbox")).text();
  const re = new RegExp(`to (?:<!-- -->)?${email.replace(/[.+]/g, "\\$&")}[\\s\\S]*?token=([^"&]+)`);
  const tokenMatch = mail.match(re);
  if (!tokenMatch) throw new Error(`verification mail for ${email} not found`);
  const token = decodeURIComponent(tokenMatch[1]);
  await parent.call(`/api/auth/verify?token=${encodeURIComponent(token)}`);
  const consent = await parent.call("/parent/consent");
  const childId = String(consent.data).match(/data-child-id="([0-9a-f-]{36})"/)[1];
  const c = await parent.call("/api/parent/consent", { childId, pin: "482915", consents: { learning_data: true, ai_feedback: true, speech_in_browser: true } });
  const child = client();
  await child.call("/api/auth/login-child", { username: c.data.username, pin: "482915" });
  return { parent, child, email, childId, username: c.data.username, password: "Secret123" };
}
