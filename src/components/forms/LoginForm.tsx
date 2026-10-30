"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { Character } from "@/components/Character";
import { ErrorNote } from "@/components/ui";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"child" | "parent">(params.get("as") === "parent" ? "parent" : "child");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true); setUnverified(false);
    try {
      const r = tab === "child"
        ? await api<{ redirect: string }>("/api/auth/login-child", { body: { username, pin } })
        : await api<{ redirect: string }>("/api/auth/login-parent", { body: { email, password } });
      router.push(r.redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setUnverified(Boolean((err as any).data?.unverified));
    } finally { setBusy(false); }
  }

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-white/5 p-1" role="tablist">
        {(["child", "parent"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setError(null); }} className={`rounded-full py-3 font-display font-bold transition ${tab === t ? "bg-vibe-cta text-white shadow-glow" : "text-vibe-lavender"}`}>
            {t === "child" ? "🚀 I'm an Explorer" : "👪 I'm a Parent"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {tab === "child" ? (
          <>
            <div className="flex items-center gap-3"><Character name="lexi" mood="welcome" size={80} still /><p className="font-display text-lg">Welcome back, Explorer! Type your Explorer name and secret PIN.</p></div>
            <div><label className="label" htmlFor="username">Explorer name</label><input id="username" className="input text-lg" value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" autoComplete="username" placeholder="e.g. cosmiclexi427" /></div>
            <div>
              <label className="label" htmlFor="pin">Secret PIN (6 numbers)</label>
              <input id="pin" className="input text-center text-2xl tracking-[0.6em]" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" type="password" autoComplete="current-password" placeholder="••••••" />
            </div>
          </>
        ) : (
          <>
            <div><label className="label" htmlFor="email">E-mail</label><input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
          </>
        )}
        <ErrorNote error={error} />
        {unverified && (
          <button type="button" className="text-sm font-bold text-vibe-aqua" onClick={async () => { await api("/api/auth/resend", { body: { email } }).catch(() => {}); setResent(true); }}>
            {resent ? "✅ Sent! Check your inbox." : "Resend verification e-mail"}
          </button>
        )}
        <button className="btn-primary w-full text-lg" disabled={busy}>{busy ? "Opening portal…" : tab === "child" ? "Enter PING VIBE 🚀" : "Log in"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-vibe-lavender">New here? <Link href="/signup" className="font-bold text-vibe-aqua">Start your adventure</Link></p>
      {tab === "child" ? <p className="mt-2 text-center text-xs text-vibe-lavender/70">Forgot your PIN? Ask your parent — they can reset it from the parent dashboard.</p>
        : <p className="mt-2 text-center text-sm"><Link href="/forgot-password" className="text-vibe-aqua">Forgot password?</Link></p>}
    </div>
  );
}
