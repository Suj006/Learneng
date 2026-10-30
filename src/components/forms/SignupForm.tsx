"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/client";
import { CharacterSays, ErrorNote } from "@/components/ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function SignupForm({ grades }: { grades: { grade: string; label: string }[] }) {
  const year = new Date().getFullYear();
  const [f, setF] = useState({ childName: "", parentEmail: "", birthMonth: "", birthYear: "", grade: "", password: "", isParent: false });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ devMailbox: boolean } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const r = await api<{ devMailbox: boolean }>("/api/auth/register", { body: { ...f, birthMonth: Number(f.birthMonth), birthYear: Number(f.birthYear) } });
      setDone(r);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="card p-6 sm:p-8">
        <CharacterSays who="max" mood="celebrating">Almost there! We sent a magic link to <b>{f.parentEmail}</b>. Open it to verify your e-mail and give parental consent.</CharacterSays>
        <ol className="mt-4 space-y-2 text-sm text-vibe-lavender">
          <li>1️⃣ Verify your e-mail ✅</li><li>2️⃣ Review privacy & give consent</li><li>3️⃣ Set {f.childName || "your child"}'s secret PIN</li><li>4️⃣ Enter the PING VIBE universe!</li>
        </ol>
        {done.devMailbox && <p className="mt-4 rounded-2xl bg-vibe-sun/15 p-3 text-sm text-vibe-sun">Developer mode: no e-mail provider is configured, so the link is in the <Link className="underline" href="/dev/mailbox">developer mailbox</Link>.</p>}
        <Link href="/login?as=parent" className="btn-ghost mt-6">Go to parent login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8" noValidate>
      <div>
        <h1 className="title-lg">Start your adventure</h1>
        <p className="mt-1 text-sm text-vibe-lavender">For parents & guardians. We only ask what we need — nothing more.</p>
      </div>
      <div>
        <label className="label" htmlFor="childName">Child's first name</label>
        <input id="childName" className="input" value={f.childName} onChange={set("childName")} autoComplete="off" maxLength={40} required placeholder="e.g. Aarav" />
      </div>
      <div>
        <label className="label" htmlFor="parentEmail">Parent's e-mail address</label>
        <input id="parentEmail" type="email" className="input" value={f.parentEmail} onChange={set("parentEmail")} autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="birthMonth">Birth month</label>
          <select id="birthMonth" className="input" value={f.birthMonth} onChange={set("birthMonth")} required>
            <option value="">Month</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="birthYear">Birth year</label>
          <select id="birthYear" className="input" value={f.birthYear} onChange={set("birthYear")} required>
            <option value="">Year</option>{Array.from({ length: 12 }, (_, i) => year - 3 - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        <span className="label">Current grade</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Current grade">
          {grades.map((g) => (
            <button type="button" key={g.grade} role="radio" aria-checked={f.grade === g.grade} onClick={() => setF({ ...f, grade: g.grade })}
              className={`rounded-2xl border px-2 py-3 text-sm font-bold transition ${f.grade === g.grade ? "border-vibe-aqua bg-vibe-aqua/20 text-white" : "border-white/10 bg-white/5 text-vibe-lavender hover:bg-white/10"}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">Create a parent password</label>
        <input id="password" type="password" className="input" value={f.password} onChange={set("password")} autoComplete="new-password" minLength={8} required placeholder="8+ characters, with a number" />
      </div>
      <label className="flex items-start gap-3 text-sm text-vibe-lavender">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-vibe-purple" checked={f.isParent} onChange={set("isParent")} />
        <span>I am the parent or legal guardian of this child. I've read the <Link href="/privacy" className="text-vibe-aqua underline" target="_blank">privacy notice</Link>.</span>
      </label>
      <ErrorNote error={error} />
      <button className="btn-primary w-full text-lg" disabled={busy}>{busy ? "Creating…" : "Create account ✨"}</button>
      <p className="text-center text-sm text-vibe-lavender">Already exploring? <Link href="/login" className="font-bold text-vibe-aqua">Log in</Link></p>
    </form>
  );
}
