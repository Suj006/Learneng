"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { ErrorNote } from "@/components/ui";
import type { ThemeTokens } from "@/lib/theme/themes";

type Row = { slug: string; name: string; emoji: string; tagline: string; tokens: ThemeTokens; active: boolean; is_default: boolean; users: number; checks: { label: string; ratio: number; min: number; pass: boolean }[] };

export function ThemeAdmin({ themes, defaultUsers }: { themes: Row[]; defaultUsers: number }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [edit, setEdit] = useState<string | null>(null);
  const [json, setJson] = useState("");
  const [copy, setCopy] = useState({ from: themes[0]?.slug ?? "", slug: "", name: "" });
  const send = async (body: Record<string, unknown>, ok: string) => {
    setErr(null); setMsg(null);
    try { await api("/api/admin/themes", { body }); setMsg(ok); router.refresh(); return true; } catch (e) { setErr((e as Error).message); return false; }
  };
  return (
    <div className="space-y-4">
      <div aria-live="polite">{msg && <p className="rounded-2xl bg-vibe-mint/15 p-3 text-sm font-semibold text-vibe-mint-ink">{msg}</p>}<ErrorNote error={err} /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {themes.map((t) => {
          const failing = t.checks.filter((c) => !c.pass);
          return (
            <article key={t.slug} className="card space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><b className="font-display text-lg">{t.emoji} {t.name}</b><p className="text-sm text-vibe-lavender">{t.slug} · {t.tokens.mode} · {t.users + (t.is_default ? defaultUsers : 0)} Explorers</p></div>
                <div className="flex flex-wrap gap-1.5">{t.is_default && <span className="chip bg-vibe-sun/25 text-vibe-sun-ink">★ Default</span>}<span className={`chip ${t.active ? "text-vibe-mint-ink" : ""}`}>{t.active ? "● Available" : "○ Hidden"}</span></div>
              </div>
              <div data-theme={t.slug} className="pv-page flex items-center gap-2 rounded-2xl border border-line/15 p-3">
                {[t.tokens.primary, t.tokens.secondary, t.tokens.pink, t.tokens.success, t.tokens.reward, t.tokens.orange].map((c, i) => <span key={i} className="h-6 w-6 rounded-full border border-line/10" style={{ background: c }} />)}
                <span className="btn-primary btn-sm pointer-events-none ml-auto">Explore!</span>
              </div>
              <p className={`text-sm ${failing.length ? "text-vibe-coral-ink" : "text-vibe-mint-ink"}`}>{failing.length ? `⚠ ${failing.length} contrast checks fail` : `✓ All ${t.checks.length} contrast checks pass (lowest ${Math.min(...t.checks.map((c) => c.ratio))}:1)`}</p>
              <div className="flex flex-wrap gap-2">
                {!t.is_default && <button className="btn-ghost btn-sm" onClick={() => send({ action: "update", slug: t.slug, active: !t.active }, `${t.name} ${t.active ? "hidden" : "available"}.`)}>{t.active ? "Hide" : "Make available"}</button>}
                {!t.is_default && t.active && <button className="btn-ghost btn-sm" onClick={() => send({ action: "update", slug: t.slug, is_default: true }, `${t.name} is now the default theme.`)}>Make default</button>}
                <button className="btn-ghost btn-sm" onClick={() => { setEdit(edit === t.slug ? null : t.slug); setJson(JSON.stringify(t.tokens, null, 2)); }}>{edit === t.slug ? "Close editor" : "Edit colours"}</button>
              </div>
              {edit === t.slug && (
                <div className="space-y-2">
                  <label className="label" htmlFor={`tok-${t.slug}`}>Colour tokens (JSON)</label>
                  <textarea id={`tok-${t.slug}`} className="input h-72 font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
                  <button className="btn-primary btn-sm" onClick={async () => { let tokens; try { tokens = JSON.parse(json); } catch { setErr("That isn't valid JSON."); return; } if (await send({ action: "update", slug: t.slug, tokens }, `${t.name} colours saved.`)) setEdit(null); }}>Save colours</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <form className="card grid gap-3 p-5 sm:grid-cols-4" onSubmit={async (e) => { e.preventDefault(); const src = themes.find((t) => t.slug === copy.from); if (!src) return;
        if (await send({ action: "create", slug: copy.slug, name: copy.name, emoji: src.emoji, tagline: `Based on ${src.name}`, tokens: src.tokens, active: false }, `${copy.name} created (hidden). Edit its colours, then make it available.`)) setCopy({ ...copy, slug: "", name: "" }); }}>
        <h2 className="title-md sm:col-span-4">➕ Add a new theme</h2>
        <label className="block"><span className="label">Start from</span><select className="select" value={copy.from} onChange={(e) => setCopy({ ...copy, from: e.target.value })}>{themes.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label>
        <label className="block"><span className="label">Theme id</span><input className="input" placeholder="e.g. jungle-jam" value={copy.slug} onChange={(e) => setCopy({ ...copy, slug: e.target.value })} /></label>
        <label className="block"><span className="label">Name</span><input className="input" placeholder="e.g. Jungle Jam" value={copy.name} onChange={(e) => setCopy({ ...copy, name: e.target.value })} /></label>
        <div className="flex items-end"><button className="btn-primary w-full">Create</button></div>
      </form>
    </div>
  );
}
