"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { ErrorNote } from "@/components/ui";
import { MONTHS, birthYearOptions } from "@/lib/validation";

export function LaunchButton({ childId, name }: { childId: string; name: string }) {
  const router = useRouter();
  return <button className="btn-primary btn-sm" onClick={async () => { const r = await api<{ redirect: string }>("/api/parent/launch", { body: { childId } }); window.location.assign(r.redirect); }}>Start {name}'s session 🚀</button>;
}

export function AddChild({ grades }: { grades: { grade: string; label: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ childName: "", birthMonth: "", birthYear: "", grade: "" });
  const [err, setErr] = useState<string | null>(null);
  if (!open) return <button className="btn-ghost" onClick={() => setOpen(true)}>＋ Add another Explorer</button>;
  return (
    <form className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5" onSubmit={async (e) => { e.preventDefault(); setErr(null); try { const r = await api<{ redirect: string }>("/api/parent/children", { body: { ...f, birthMonth: Number(f.birthMonth), birthYear: Number(f.birthYear) } }); router.push(r.redirect); } catch (x) { setErr((x as Error).message); } }}>
      <input aria-label="First name" className="input sm:col-span-2 lg:col-span-2" placeholder="First name" value={f.childName} onChange={(e) => setF({ ...f, childName: e.target.value })} />
      <select aria-label="Birth month" className="select" value={f.birthMonth} onChange={(e) => setF({ ...f, birthMonth: e.target.value })}><option value="">Month</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      <select aria-label="Birth year" className="select" value={f.birthYear} onChange={(e) => setF({ ...f, birthYear: e.target.value })}><option value="">Year</option>{birthYearOptions().map((v) => <option key={v} value={v}>{v}</option>)}</select>
      <select aria-label="Grade" className="select" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })}><option value="">Grade</option>{grades.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}</select>
      <div className="sm:col-span-2 lg:col-span-5"><ErrorNote error={err} /><button className="btn-primary btn-sm mt-2">Continue to consent</button></div>
    </form>
  );
}

export function ChildAdmin({ childId, name }: { childId: string; name: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-2" onSubmit={async (e) => { e.preventDefault(); setErr(null); setMsg(null); try { await api(`/api/parent/children/${childId}/pin`, { body: { pin } }); setMsg("PIN updated. Existing sessions were signed out."); setPin(""); } catch (x) { setErr((x as Error).message); } }}>
        <div><label className="label" htmlFor="newpin">Reset {name}'s PIN</label><input id="newpin" className="input w-40 text-center tracking-[0.4em]" inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
        <button className="btn-ghost btn-sm">Update PIN</button>
      </form>
      <div className="flex flex-wrap gap-2">
        <a className="btn-ghost btn-sm" href={`/api/parent/children/${childId}/export`}>⬇️ Download {name}'s data (JSON)</a>
        <button className="btn-ghost btn-sm text-vibe-coral-ink" onClick={async () => {
          if (!confirm(`Permanently delete ${name}'s profile and ALL learning data? This cannot be undone.`)) return;
          await api(`/api/parent/children/${childId}`, { method: "DELETE" }); router.push("/parent"); router.refresh();
        }}>🗑️ Delete profile & data</button>
      </div>
      {msg && <p className="text-sm text-vibe-mint-ink">{msg}</p>}<ErrorNote error={err} />
    </div>
  );
}

export function FamilyChallenge({ childId, words }: { childId: string; words: { id: string; word: string; emoji: string }[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const [title, setTitle] = useState("Family Word Challenge");
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!words.length) return <p className="text-sm text-vibe-lavender">Once your child discovers words, you can build a family challenge from them here.</p>;
  return (
    <div>
      <p className="text-sm text-vibe-lavender">Pick 3–10 words your child has discovered. They'll see your challenge (and message) in their Daily Adventure. Family quiz idea: let them quiz you on the same words!</p>
      <div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {words.map((w) => <button key={w.id} type="button" onClick={() => setSel(sel.includes(w.id) ? sel.filter((x) => x !== w.id) : [...sel, w.id].slice(0, 10))} className={`chip ${sel.includes(w.id) ? "bg-vibe-cta text-white" : ""}`}>{w.emoji} {w.word}</button>)}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2"><input className="input" aria-label="Challenge title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} /><input className="input" aria-label="Encouraging note (optional)" value={message} placeholder="A short encouraging note (optional)" onChange={(e) => setMessage(e.target.value)} maxLength={200} /></div>
      <button className="btn-primary btn-sm mt-3" onClick={async () => { setErr(null); try { await api("/api/parent/family", { body: { childId, title, message, wordIds: sel } }); setMsg("Challenge sent! 🎉"); setSel([]); } catch (x) { setErr((x as Error).message); } }}>Send challenge ({sel.length})</button>
      {msg && <p className="mt-2 text-sm text-vibe-mint-ink">{msg}</p>}<ErrorNote error={err} />
    </div>
  );
}

export function SettingsForm({ initial }: { initial: { reminders_enabled: boolean; reminder_hour: number; companion_enabled: boolean; music_allowed: boolean; voices_allowed: boolean } }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <form className="card space-y-4 p-6" onSubmit={async (e) => { e.preventDefault(); await api("/api/parent/settings", { body: s }); setMsg("Saved ✅"); }}>
        <h2 className="title-md">Learning settings</h2>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-vibe-purple" checked={s.reminders_enabled} onChange={(e) => setS({ ...s, reminders_enabled: e.target.checked })} /> Send me one gentle daily reminder e-mail if my child hasn't learned yet (never sent to children).</label>
        <label className="flex items-center gap-3">Reminder time: <select aria-label="Reminder hour" className="select w-36" value={s.reminder_hour} onChange={(e) => setS({ ...s, reminder_hour: Number(e.target.value) })}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}</select></label>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-vibe-purple" checked={s.companion_enabled} onChange={(e) => setS({ ...s, companion_enabled: e.target.checked })} /> Allow LEXI AI chat (educational questions only, nothing stored).</label>
        <h3 className="font-display font-bold">Sound</h3>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-vibe-purple" checked={s.music_allowed} onChange={(e) => setS({ ...s, music_allowed: e.target.checked })} /> Allow gentle background music in my children's world.</label>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-vibe-purple" checked={s.voices_allowed} onChange={(e) => setS({ ...s, voices_allowed: e.target.checked })} /> Allow character voices (spoken instructions are always shown as text too).</label>
        <p className="text-xs text-vibe-lavender">Children can also turn music, sound effects and voices off themselves with the 🔊 button. Sound is never needed to complete an activity.</p>
        <p className="text-xs text-vibe-lavender">Healthy-use safeguards are always on: age-based break reminders (15–30 min), a daily reward ceiling, forgiving learning rhythm (rest days never reset progress) and no pressure notifications to children.</p>
        <button className="btn-primary btn-sm">Save settings</button>{msg && <span className="ml-3 text-sm text-vibe-mint-ink">{msg}</span>}
      </form>
      <div className="card p-6">
        <h2 className="title-md text-vibe-coral-ink">Delete account</h2>
        <p className="mt-1 text-sm text-vibe-lavender">Permanently deletes your parent account, all Explorer profiles and every learning record.</p>
        <button className="btn-ghost btn-sm mt-3 text-vibe-coral-ink" onClick={async () => { if (!confirm("Delete everything permanently?")) return; await api("/api/parent/account", { method: "DELETE" }); router.push("/"); router.refresh(); }}>Delete my account</button>
      </div>
    </div>
  );
}

/** Parent view of the child's look: shows the selected theme and lets the parent guide it. */
export function AppearanceGuide({ childId, themes, current, motion }: { childId: string; themes: { slug: string; name: string }[]; current: string; motion: "full" | "calm" | "off" }) {
  const [t, setT] = useState(current); const [m, setM] = useState(motion);
  const [msg, setMsg] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  const save = async (body: { theme?: string; motion?: string }) => {
    setMsg(null); setErr(null);
    try { await api(`/api/parent/children/${childId}/appearance`, { body }); setMsg("Saved ✅ It applies the next time your child opens PING VIBE."); } catch (x) { setErr((x as Error).message); }
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block"><span className="label">Colour theme</span>
        <select className="select" value={t} onChange={(e) => { setT(e.target.value); save({ theme: e.target.value }); }}>{themes.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label>
      <label className="block"><span className="label">Animations</span>
        <select className="select" value={m} onChange={(e) => { const v = e.target.value as typeof m; setM(v); save({ motion: v }); }}>
          <option value="full">Full sparkle</option><option value="calm">Calm (no looping decorations)</option><option value="off">Still (no movement)</option>
        </select></label>
      <div className="sm:col-span-2" aria-live="polite">{msg && <p className="text-sm text-vibe-mint-ink">{msg}</p>}<ErrorNote error={err} /></div>
    </div>
  );
}
