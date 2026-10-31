"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { ErrorNote } from "@/components/ui";

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const run = async (fn: () => Promise<unknown>, ok = "Saved ✅") => {
    setBusy(true); setErr(null); setMsg(null);
    try { const r = await fn(); setMsg(typeof r === "string" ? r : ok); router.refresh(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return { busy, msg, err, run };
}
const Status = ({ msg, err }: { msg: string | null; err: string | null }) => <>{msg && <p className="mt-2 text-sm text-vibe-mint">{msg}</p>}<ErrorNote error={err} /></>;

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <form className="card space-y-3 p-6" onSubmit={async (e) => { e.preventDefault(); try { const r = await api<{ redirect: string }>("/api/auth/login-admin", { body: { email, password } }); window.location.assign(r.redirect); } catch (x) { setErr((x as Error).message); } }}>
      <input className="input" type="email" placeholder="Admin e-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      <ErrorNote error={err} /><button className="btn-primary w-full">Log in</button>
    </form>
  );
}

export function GenerateForm({ aiOn, grammarTopics, themes }: { aiOn: boolean; grammarTopics: { slug: string; title: string }[]; themes: { key: string; title: string }[] }) {
  const a = useAction();
  const [f, setF] = useState({ kind: "vocabulary", band: 2, category: "", topic: grammarTopics[0]?.slug ?? "", count: 5 });
  return (
    <form className="card grid gap-3 p-5 md:grid-cols-6" onSubmit={(e) => { e.preventDefault(); a.run(async () => { const r = await api<{ produced: number; rejected: number }>("/api/admin/generate", { body: { kind: f.kind, band: f.band, count: f.count, category: f.category || undefined, topic: f.kind === "grammar" ? f.topic : undefined } }); return `Generated: ${r.produced} passed validation (pending review), ${r.rejected} auto-rejected.`; }); }}>
      <select aria-label="Content type" className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{[["vocabulary", "Vocabulary (from headwords)"], ["writing_topic", "Writing topics"], ["story", "Reading story"], ["grammar", "Grammar exercises"], ["speaking", "Speaking scenarios"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <select aria-label="Difficulty band" className="input" value={f.band} onChange={(e) => setF({ ...f, band: Number(e.target.value) })}>{[1, 2, 3, 4].map((b) => <option key={b} value={b}>Band {b}</option>)}</select>
      {f.kind === "grammar" ? <select aria-label="Grammar topic" className="input" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{grammarTopics.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}</select>
        : <select aria-label="Category" className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="">Any theme</option>{themes.map((t) => <option key={t.key} value={t.key}>{t.title}</option>)}</select>}
      <input className="input" type="number" min={1} max={10} value={f.count} onChange={(e) => setF({ ...f, count: Number(e.target.value) })} aria-label="Count" />
      <button className="btn-primary md:col-span-2" disabled={a.busy || !aiOn}>{a.busy ? "Generating & validating…" : aiOn ? "Generate with Claude" : "Set ANTHROPIC_API_KEY to enable"}</button>
      <div className="md:col-span-6"><Status msg={a.msg} err={a.err} /></div>
    </form>
  );
}

export function ReviewButtons({ id }: { id: string }) {
  const a = useAction();
  return <div className="flex gap-2"><button className="btn-primary btn-sm" disabled={a.busy} onClick={() => a.run(() => api("/api/admin/review", { body: { id, action: "publish" } }), "Published")}>Approve & publish</button><button className="btn-ghost btn-sm" disabled={a.busy} onClick={() => a.run(() => api("/api/admin/review", { body: { id, action: "reject" } }), "Rejected")}>Reject</button><Status msg={a.msg} err={a.err} /></div>;
}

export function ManualVocab() {
  const a = useAction();
  const [f, setF] = useState({ word: "", band: 2, part_of_speech: "adjective", phonetic: "", meaning: "", explanation: "", example: "", usage: "", synonyms: "", antonyms: "", emoji: "✨", difficulty: 2 });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: k === "band" || k === "difficulty" ? Number(e.target.value) : e.target.value });
  return (
    <form className="card grid gap-2 p-5 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); a.run(async () => { const r = await api<{ validation: { passed: boolean } }>("/api/admin/manual", { body: { kind: "vocabulary", band: f.band, title: f.word, body: { ...f, synonyms: f.synonyms.split(",").map((s) => s.trim()).filter(Boolean), antonyms: f.antonyms.split(",").map((s) => s.trim()).filter(Boolean) } } }); return r.validation.passed ? "Added to the review queue ✅" : "Added to the queue — some validation checks failed, see details."; }); }}>
      <input className="input" placeholder="word" value={f.word} onChange={set("word")} required /><select aria-label="Difficulty band" className="input" value={f.band} onChange={set("band")}>{[1, 2, 3, 4].map((b) => <option key={b} value={b}>Band {b}</option>)}</select>
      <input className="input" placeholder="part of speech" value={f.part_of_speech} onChange={set("part_of_speech")} /><input className="input" placeholder="phonetic e.g. ih-NOR-muhs" value={f.phonetic} onChange={set("phonetic")} required />
      <input className="input md:col-span-2" placeholder="simple meaning" value={f.meaning} onChange={set("meaning")} required /><input className="input md:col-span-2" placeholder="child-friendly explanation" value={f.explanation} onChange={set("explanation")} required />
      <input className="input md:col-span-2" placeholder="example sentence (must contain the word)" value={f.example} onChange={set("example")} required /><input className="input md:col-span-2" placeholder="real-life usage" value={f.usage} onChange={set("usage")} />
      <input className="input" placeholder="synonyms, comma separated" value={f.synonyms} onChange={set("synonyms")} /><input className="input" placeholder="antonyms" value={f.antonyms} onChange={set("antonyms")} />
      <input className="input" placeholder="emoji" value={f.emoji} onChange={set("emoji")} /><select aria-label="Difficulty" className="input" value={f.difficulty} onChange={set("difficulty")}>{[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>Difficulty {d}</option>)}</select>
      <button className="btn-primary md:col-span-4" disabled={a.busy}>Validate & add to review queue</button><div className="md:col-span-4"><Status msg={a.msg} err={a.err} /></div>
    </form>
  );
}

export function XpTable({ rows, ceiling }: { rows: { key: string; label: string; xp: number; coins: number; crystals: number; daily_cap: number }[]; ceiling: number }) {
  const a = useAction();
  const [r, setR] = useState(rows);
  const [c, setC] = useState(ceiling);
  const upd = (i: number, k: "xp" | "coins" | "crystals" | "daily_cap", v: string) => setR(r.map((x, n) => (n === i ? { ...x, [k]: Number(v) } : x)));
  return (
    <div className="card p-5">
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th>Activity</th><th>XP</th><th>Coins</th><th>Crystals</th><th>Payouts / day</th></tr></thead>
        <tbody>{r.map((x, i) => <tr key={x.key} className="border-t border-white/5"><td className="py-1.5">{x.label}</td>{(["xp", "coins", "crystals", "daily_cap"] as const).map((k) => <td key={k}><input className="input w-24 py-1" type="number" min={0} aria-label={`${x.label}: ${{ xp: "XP", coins: "coins", crystals: "crystals", daily_cap: "payouts per day" }[k]}`} value={x[k]} onChange={(e) => upd(i, k, e.target.value)} /></td>)}</tr>)}</tbody></table></div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div><label className="label" htmlFor="ceil">Daily XP ceiling per child (healthy-use limit)</label><input id="ceil" className="input w-40" type="number" value={c} onChange={(e) => setC(Number(e.target.value))} /></div>
        <button className="btn-primary btn-sm" disabled={a.busy} onClick={() => a.run(async () => { await api("/api/admin/xp", { body: { rows: r } }); await api("/api/admin/settings", { body: { daily_xp_ceiling: c } }); })}>Save economy</button>
      </div>
      <Status msg={a.msg} err={a.err} />
    </div>
  );
}

export function AddLevels({ total }: { total: number }) {
  const a = useAction();
  const [n, setN] = useState(50);
  return <div className="flex flex-wrap items-end gap-3"><div><label className="label" htmlFor="addl">Append levels (currently {total})</label><input id="addl" className="input w-32" type="number" min={1} max={250} value={n} onChange={(e) => setN(Number(e.target.value))} /></div><button className="btn-primary btn-sm" disabled={a.busy} onClick={() => a.run(async () => { const r = await api<{ total: number }>("/api/admin/levels", { body: { count: n } }); return `Now ${r.total} levels.`; })}>Add levels</button><Status msg={a.msg} err={a.err} /></div>;
}

export function EventForm({ initial }: { initial?: { slug: string; title: string; emoji: string; kind: string; month: number; day: number; window_days: number; description: string; words: string[]; writing_prompt: string; active: boolean } }) {
  const a = useAction();
  const [f, setF] = useState(initial ?? { slug: "", title: "", emoji: "🎉", kind: "special", month: 1, day: 1, window_days: 7, description: "", words: [] as string[], writing_prompt: "", active: true });
  return (
    <form className="grid gap-2 md:grid-cols-6" onSubmit={(e) => { e.preventDefault(); a.run(() => api("/api/admin/events", { body: f })); }}>
      <input className="input" placeholder="slug" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} disabled={!!initial} />
      <input className="input md:col-span-2" placeholder="title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <input className="input" placeholder="emoji" value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} />
      <select aria-label="Content type" className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{["festival", "seasonal", "special"].map((k) => <option key={k}>{k}</option>)}</select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> active</label>
      <input className="input" type="number" min={1} max={12} value={f.month} onChange={(e) => setF({ ...f, month: Number(e.target.value) })} aria-label="Month" />
      <input className="input" type="number" min={1} max={31} value={f.day} onChange={(e) => setF({ ...f, day: Number(e.target.value) })} aria-label="Day" />
      <input className="input" type="number" min={1} max={30} value={f.window_days} onChange={(e) => setF({ ...f, window_days: Number(e.target.value) })} aria-label="Window days" />
      <input className="input md:col-span-3" placeholder="event words, comma separated" value={f.words.join(", ")} onChange={(e) => setF({ ...f, words: e.target.value.split(",").map((w) => w.trim()).filter(Boolean) })} />
      <input className="input md:col-span-3" placeholder="description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <input className="input md:col-span-3" placeholder="writing prompt" value={f.writing_prompt} onChange={(e) => setF({ ...f, writing_prompt: e.target.value })} />
      <button className="btn-primary btn-sm md:col-span-6" disabled={a.busy}>{initial ? "Update event" : "Create event"}</button>
      <div className="md:col-span-6"><Status msg={a.msg} err={a.err} /></div>
    </form>
  );
}

export function VocabEditor({ w }: { w: { id: string; word: string; meaning: string; explanation: string; example: string; phonetic: string; emoji: string; status: string } }) {
  const a = useAction();
  const [f, setF] = useState(w);
  return (
    <form className="grid gap-2 md:grid-cols-6" onSubmit={(e) => { e.preventDefault(); a.run(() => api("/api/admin/vocabulary", { body: f })); }}>
      <input className="input" value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} aria-label="emoji" /><input className="input" value={f.phonetic} onChange={(e) => setF({ ...f, phonetic: e.target.value })} aria-label="phonetic" />
      <input className="input md:col-span-2" value={f.meaning} onChange={(e) => setF({ ...f, meaning: e.target.value })} aria-label="meaning" />
      <select aria-label="Status" className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{["published", "draft", "archived"].map((s) => <option key={s}>{s}</option>)}</select>
      <button className="btn-ghost btn-sm" disabled={a.busy}>Save</button>
      <input className="input md:col-span-3" value={f.explanation} onChange={(e) => setF({ ...f, explanation: e.target.value })} aria-label="explanation" />
      <input className="input md:col-span-3" value={f.example} onChange={(e) => setF({ ...f, example: e.target.value })} aria-label="example" />
      <div className="md:col-span-6"><Status msg={a.msg} err={a.err} /></div>
    </form>
  );
}

export function GradeForm() {
  const a = useAction();
  const [f, setF] = useState({ grade: "", label: "", band: 4, new_words_per_day: 10, sort_order: 10, active: true });
  return (
    <form className="card grid gap-2 p-5 md:grid-cols-6" onSubmit={(e) => { e.preventDefault(); a.run(async () => { const r = await api<{ plans: number }>("/api/admin/grades", { body: f }); return `Saved — ${r.plans} plan days generated.`; }); }}>
      <input className="input" placeholder="code e.g. G8" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value.toUpperCase() })} />
      <input className="input" placeholder="label e.g. Grade 8" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
      <select aria-label="Difficulty band" className="input" value={f.band} onChange={(e) => setF({ ...f, band: Number(e.target.value) })}>{[1, 2, 3, 4].map((b) => <option key={b} value={b}>Content band {b}</option>)}</select>
      <input className="input" type="number" value={f.new_words_per_day} onChange={(e) => setF({ ...f, new_words_per_day: Number(e.target.value) })} aria-label="New words per day" />
      <input className="input" type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} aria-label="Sort order" />
      <button className="btn-primary btn-sm" disabled={a.busy}>Save grade & build 365-day plan</button>
      <div className="md:col-span-6"><Status msg={a.msg} err={a.err} /></div>
    </form>
  );
}
