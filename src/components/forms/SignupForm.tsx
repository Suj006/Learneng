"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/client";
import { CharacterSays, ErrorNote } from "@/components/ui";
import { AGE_MESSAGE, MONTHS, ageFrom, AGE_MIN, AGE_MAX, birthYearOptions, password as passwordRule } from "@/lib/validation";

type Field = "childName" | "parentEmail" | "birthMonth" | "birthYear" | "grade" | "password" | "isParent";

/** Same rules as the server (src/lib/validation.ts), checked before sending so each message appears next to its field. */
function check(f: { childName: string; parentEmail: string; birthMonth: string; birthYear: string; grade: string; password: string; isParent: boolean }) {
  const e: Partial<Record<Field, string>> = {};
  if (!f.childName.trim()) e.childName = "Please enter your child's first name.";
  else if (!/^[\p{L} .'-]+$/u.test(f.childName.trim())) e.childName = "Use letters only for the name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.parentEmail.trim())) e.parentEmail = "Please enter a valid e-mail address.";
  if (!f.birthMonth) e.birthMonth = "Please choose the birth month.";
  if (!f.birthYear) e.birthYear = "Please choose the birth year.";
  if (f.birthMonth && f.birthYear) { const a = ageFrom(Number(f.birthMonth), Number(f.birthYear)); if (a < AGE_MIN || a > AGE_MAX) e.birthYear = AGE_MESSAGE; }
  if (!f.grade) e.grade = "Please choose a grade.";
  const pw = passwordRule.safeParse(f.password); if (!pw.success) e.password = pw.error.issues[0].message;
  if (!f.isParent) e.isParent = "Only a parent or legal guardian can create an account.";
  return e;
}

export function SignupForm({ grades }: { grades: { grade: string; label: string }[] }) {
  const years = birthYearOptions();
  const [errs, setErrs] = useState<Partial<Record<Field, string>>>({});
  const [f, setF] = useState({ childName: "", parentEmail: "", birthMonth: "", birthYear: "", grade: "", password: "", isParent: false });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ devMailbox: boolean } | null>(null);
  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setF({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });
    if (errs[k]) setErrs({ ...errs, [k]: undefined, ...(k === "birthMonth" ? { birthYear: undefined } : {}) });
  };
  const invalid = (k: Field) => (errs[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {});
  const Msg = ({ k }: { k: Field }) => (errs[k] ? <p id={`${k}-error`} className="field-error" role="alert">{errs[k]}</p> : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const e2 = check(f); setErrs(e2);
    const firstBad = (Object.keys(e2) as Field[])[0];
    if (firstBad) { document.getElementById(firstBad)?.focus(); return; }
    setBusy(true);
    try {
      const r = await api<{ devMailbox: boolean }>("/api/auth/register", { body: { ...f, birthMonth: Number(f.birthMonth), birthYear: Number(f.birthYear) } });
      setDone(r);
    } catch (err) {
      const x = err as Error & { data?: { field?: string } };
      const fld = x.data?.field as Field | undefined;
      if (fld && fld in f) setErrs({ [fld]: x.message }); else setError(x.message);
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="card p-6 sm:p-8">
        <CharacterSays who="max" mood="celebrating">Almost there! We sent a magic link to <b>{f.parentEmail}</b>. Open it to verify your e-mail and give parental consent.</CharacterSays>
        <ol className="mt-4 space-y-2 text-sm text-vibe-lavender">
          <li>1️⃣ Verify your e-mail ✅</li><li>2️⃣ Review privacy & give consent</li><li>3️⃣ Set {f.childName || "your child"}'s secret PIN</li><li>4️⃣ Enter the PING VIBE universe!</li>
        </ol>
        {done.devMailbox && <p className="mt-4 rounded-2xl bg-vibe-sun/15 p-3 text-sm text-vibe-sun-ink">Developer mode: no e-mail provider is configured, so the link is in the <Link className="underline" href="/dev/mailbox">developer mailbox</Link>.</p>}
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
        <input id="childName" className="input" value={f.childName} onChange={set("childName")} autoComplete="off" maxLength={40} required placeholder="e.g. Aarav" {...invalid("childName")} />
        <Msg k="childName" />
      </div>
      <div>
        <label className="label" htmlFor="parentEmail">Parent's e-mail address</label>
        <input id="parentEmail" type="email" className="input" value={f.parentEmail} onChange={set("parentEmail")} autoComplete="email" required placeholder="you@example.com" {...invalid("parentEmail")} />
        <Msg k="parentEmail" />
      </div>
      <fieldset>
        <legend className="label">Birth month and year <span className="font-normal text-vibe-lavender">(we never ask for the full date)</span></legend>
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="birthMonth">Birth month</label>
            <select id="birthMonth" className="select" value={f.birthMonth} onChange={set("birthMonth")} required data-empty={!f.birthMonth} {...invalid("birthMonth")}>
              <option value="">Month</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <Msg k="birthMonth" />
          </div>
          <div>
            <label className="sr-only" htmlFor="birthYear">Birth year</label>
            <select id="birthYear" className="select" value={f.birthYear} onChange={set("birthYear")} required data-empty={!f.birthYear} {...invalid("birthYear")}>
              <option value="">Year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <Msg k="birthYear" />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-vibe-lavender">PING VIBE is for Explorers aged {AGE_MIN}–{AGE_MAX}.</p>
      </fieldset>
      <div>
        <label className="label" htmlFor="grade">Current grade</label>
        <select id="grade" className="select" value={f.grade} onChange={set("grade")} required data-empty={!f.grade} {...invalid("grade")}>
          <option value="">Choose a grade</option>{grades.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}
        </select>
        <Msg k="grade" />
      </div>
      <div>
        <label className="label" htmlFor="password">Create a parent password</label>
        <input id="password" type="password" className="input" value={f.password} onChange={set("password")} autoComplete="new-password" minLength={8} required placeholder="8+ characters, with a number" {...invalid("password")} />
        <Msg k="password" />
      </div>
      <div>
      <label className="flex items-start gap-3 text-sm text-vibe-lavender">
        <input id="isParent" type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-vibe-purple" checked={f.isParent} onChange={set("isParent")} {...invalid("isParent")} />
        <span>I am the parent or legal guardian of this child. I've read the <Link href="/privacy" className="text-vibe-aqua-ink underline" target="_blank">privacy notice</Link>.</span>
      </label>
      <Msg k="isParent" />
      </div>
      <ErrorNote error={error} />
      <button className="btn-primary w-full text-lg" disabled={busy}>{busy ? "Creating…" : "Create account ✨"}</button>
      <p className="text-center text-sm text-vibe-lavender">Already exploring? <Link href="/login" className="font-bold text-vibe-aqua-ink">Log in</Link></p>
    </form>
  );
}
