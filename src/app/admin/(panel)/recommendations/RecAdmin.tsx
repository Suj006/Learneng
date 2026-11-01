"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { ErrorNote } from "@/components/ui";

type Rule = { id: string; kind: string; ref: string; action: string; note: string | null };
type Rec = { kind: string; title: string; reason: string; href: string; skill: string; difficulty?: string; minutes?: number; done?: boolean };

export function RecAdmin({ rules }: { rules: Rule[] }) {
  const router = useRouter();
  const [f, setF] = useState({ kind: "story", ref: "", action: "prioritise", note: "" });
  const [err, setErr] = useState<string | null>(null);
  const [u, setU] = useState("");
  const [pv, setPv] = useState<{ child: { grade: string; name: string }; recommendations: Rec[] } | null>(null);
  const save = async () => { setErr(null); try { await api("/api/admin/recommendations", { body: { op: "set", ...f, note: f.note || undefined } }); setF({ ...f, ref: "", note: "" }); router.refresh(); } catch (e) { setErr((e as Error).message); } };
  const del = async (id: string) => { await api("/api/admin/recommendations", { body: { op: "delete", id } }); router.refresh(); };
  const preview = async () => { setErr(null); setPv(null); try { setPv(await api(`/api/admin/recommendations?username=${encodeURIComponent(u)}`)); } catch (e) { setErr((e as Error).message); } };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-6"><h2 className="title-md">Prioritise or exclude content</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <label>Type<select className="input mt-1 w-full" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{["story", "scenario", "grammar", "phonics", "game"].map((k) => <option key={k}>{k}</option>)}</select></label>
          <label>Action<select className="input mt-1 w-full" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}><option value="prioritise">prioritise</option><option value="exclude">exclude</option></select></label>
          <label className="col-span-2">Content slug<input className="input mt-1 w-full" value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value.toLowerCase() })} placeholder="e.g. the-monsoon-puddle or restaurant" /></label>
          <label className="col-span-2">Note (optional)<input className="input mt-1 w-full" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
        </div>
        <button className="btn-primary btn-sm mt-3" disabled={f.ref.length < 2} onClick={save}>Save rule</button>
        <ul className="mt-4 space-y-1 text-sm">{rules.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 border-t border-line/5 py-1"><span><b>{r.action}</b> {r.kind}: {r.ref}{r.note ? ` — ${r.note}` : ""}</span><button className="btn-ghost btn-sm" onClick={() => del(r.id)}>Remove</button></li>)}</ul>
        {!rules.length && <p className="mt-3 text-sm text-vibe-lavender">No rules yet: the engine uses each child&apos;s evidence only.</p>}
      </section>
      <section className="card p-6"><h2 className="title-md">Preview a child&apos;s recommendations</h2>
        <div className="mt-3 flex gap-2"><input aria-label="Child login name" className="input flex-1" value={u} onChange={(e) => setU(e.target.value)} placeholder="login name, e.g. cosmicfox427" /><button className="btn-primary btn-sm" onClick={preview}>Preview</button></div>
        <ErrorNote error={err} />
        {pv && <><p className="mt-3 text-sm">{pv.child.name} · {pv.child.grade}</p>
          <ul className="mt-2 space-y-2 text-sm" data-testid="rec-preview">{pv.recommendations.map((r) => <li key={r.kind} className="glass p-3"><b>{r.kind.replace("_", " ")}</b>: {r.title} <span className="text-vibe-lavender">({r.skill}, {r.difficulty}, ~{r.minutes} min{r.done ? ", done today" : ""})</span><br />“{r.reason}” → {r.href}</li>)}</ul></>}
      </section>
    </div>
  );
}
